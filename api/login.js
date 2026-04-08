const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const JWT_SECRET = "disma_ehitus_secret_key_2024";
const DATA_FILE = path.join(process.cwd(), "data.json");

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Введите email и пароль" });
  }

  const data = readData();
  if (email.toLowerCase().trim() !== data.admin.email) {
    return res.status(401).json({ error: "Неверные данные" });
  }

  const match = await bcrypt.compare(password, data.admin.password);
  if (!match) {
    return res.status(401).json({ error: "Неверные данные" });
  }

  const token = jwt.sign({ email: data.admin.email }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
};
