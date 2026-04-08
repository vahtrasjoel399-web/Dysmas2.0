const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dismasehitus@gmail.com",
    pass: "wuetlpegfacjsgma"
  }
});

transporter.sendMail({
  from: "dismasehitus@gmail.com",
  to: "dismasehitus@gmail.com",
  subject: "Тест",
  text: "Работает"
}, (err, info) => {
  if (err) console.log(err);
  else console.log("Отправлено");
});
