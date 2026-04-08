const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const JWT_SECRET = "disma_ehitus_secret_key_2024";
const DATA_FILE = path.join(__dirname, "data.json");

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(8).toString("hex") + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (/jpeg|jpg|png|gif|webp/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper: read/write data
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Auth middleware
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нет доступа" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Токен недействителен" });
  }
}

// ── Auth ──
app.post("/api/login", async (req, res) => {
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
});

// ── Gallery ──
app.get("/api/gallery", (req, res) => {
  const data = readData();
  res.json(data.gallery || []);
});

app.post("/api/gallery", auth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Нет файла" });
  const data = readData();
  const image = {
    id: crypto.randomBytes(8).toString("hex"),
    url: "/uploads/" + req.file.filename,
    name: req.body.name || req.file.originalname,
    date: new Date().toISOString()
  };
  data.gallery.push(image);
  writeData(data);
  res.json(image);
});

app.delete("/api/gallery/:id", auth, (req, res) => {
  const data = readData();
  const idx = data.gallery.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Не найдено" });
  const image = data.gallery[idx];
  const filePath = path.join(__dirname, image.url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  data.gallery.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

// ── Content ──
app.get("/api/content", (req, res) => {
  const data = readData();
  res.json(data.content || {});
});

app.put("/api/content", auth, (req, res) => {
  const data = readData();
  Object.assign(data.content, req.body);
  writeData(data);
  res.json(data.content);
});

// ── Email (Nodemailer) ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dismasehitus@gmail.com",
    pass: "wzclxivgxudenjbt"
  }
});

app.post("/send", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const mailOptions = {
    from: "dismasehitus@gmail.com",
    to: "dismasehitus@gmail.com",
    subject: "Новая заявка от " + name,
    text: "Имя: " + name + "\nEmail: " + email + "\nСообщение: " + message
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Ошибка отправки:", err.message);
      return res.status(500).json({ error: "Ошибка отправки" });
    }
    console.log("Письмо отправлено:", info.response);
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Сервер запущен: http://localhost:" + PORT);
});
