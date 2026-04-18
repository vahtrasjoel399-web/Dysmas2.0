require("dotenv").config();
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

const JWT_SECRET = process.env.JWT_SECRET || "disma_ehitus_secret_key_2024";
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

// ── Email (Nodemailer via SMTP) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Валидация и санитизация
function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 5000).replace(/[<>]/g, "");
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 100;
}

app.post("/api/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Санитизация
  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanMessage = sanitizeInput(message);

  // Валидация на бэке
  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ error: "Имя должно быть минимум 2 символа" });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Некорректный email" });
  }

  if (!cleanMessage || cleanMessage.length < 10) {
    return res.status(400).json({ error: "Сообщение должно быть минимум 10 символов" });
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: "Новая заявка от " + cleanName,
      html: `
        <h2>Новая заявка с сайта Dysmas Ehitus</h2>
        <p><strong>Имя:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
        <p><strong>Сообщение:</strong></p>
        <p>${cleanMessage.replace(/\n/g, "<br>")}</p>
        <hr>
        <small>Время: ${new Date().toLocaleString()}</small>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Письмо отправлено от:", cleanName);
    res.json({ success: true, message: "Письмо успешно отправлено" });
  } catch (err) {
    console.error("❌ Ошибка отправки:", err.message);
    res.status(500).json({ error: "Ошибка отправки письма" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Сервер запущен: http://localhost:" + PORT);
});
