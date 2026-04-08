const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

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
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!auth(req)) return res.status(401).json({ error: "Нет доступа" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID не указан" });

  const data = readData();
  const idx = data.gallery.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ error: "Не найдено" });

  data.gallery.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
};
