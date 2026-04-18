require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 5000).replace(/[<>]/g, "");
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 100;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  // Санитизация
  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanMessage = sanitizeInput(message);

  // Валидация
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
      from: process.env.SMTP_FROM || "noreply@example.com",
      to: process.env.SMTP_TO || "noreply@example.com",
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
    res.status(200).json({ success: true, message: "Письмо успешно отправлено" });
  } catch (err) {
    console.error("❌ Ошибка отправки:", err.message);
    res.status(500).json({ error: "Ошибка отправки письма: " + err.message });
  }
};
