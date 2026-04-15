const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetPasswordEmail(to, resetLink) {
  await transporter.sendMail({
    from: `"Beauty Studio Hub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Сброс пароля",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Сброс пароля</h2>
        <p>Вы запросили сброс пароля для аккаунта Beauty Studio Hub.</p>
        <p>Нажмите на кнопку ниже, чтобы задать новый пароль:</p>
        <p>
          <a
            href="${resetLink}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#ec4899;
              color:white;
              text-decoration:none;
              border-radius:12px;
              font-weight:bold;
            "
          >
            Сбросить пароль
          </a>
        </p>
        <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        <p>Ссылка действует 30 минут.</p>
      </div>
    `,
  });
}

module.exports = {
  sendResetPasswordEmail,
};