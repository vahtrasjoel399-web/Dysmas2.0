const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
