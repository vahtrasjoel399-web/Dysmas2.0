const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = "disma_ehitus_secret_key_2024";
const DATA_FILE = path.join(process.cwd(), "data.json");

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function auth(req) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.split(" ")[1], JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = (req, res) => {
  if (req.method === "GET") {
    const data = readData();
    return res.json(data.gallery || []);
  }

  if (req.method === "POST") {
    if (!auth(req)) return res.status(401).json({ error: "Нет доступа" });

    // Accept base64 image from client
    const { image, name } = req.body;
    if (!image) return res.status(400).json({ error: "Нет изображения" });

    const id = crypto.randomBytes(8).toString("hex");
    const data = readData();
    const entry = {
      id,
      url: image, // base64 data URL
      name: name || "photo",
      date: new Date().toISOString()
    };
    data.gallery.push(entry);
    writeData(data);
    return res.status(201).json(entry);
  }

  res.status(405).json({ error: "Method not allowed" });
};
