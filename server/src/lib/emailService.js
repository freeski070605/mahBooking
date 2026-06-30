const nodemailer = require("nodemailer");
const { env } = require("../config/env");

let transporter;

function getTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }

  return transporter;
}

function getFromAddress() {
  return env.mailFrom || env.smtpUser;
}

async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);

  if (!mailer || recipients.length === 0) {
    console.warn("Email skipped: SMTP is not configured or no recipient was provided.");
    return { skipped: true };
  }

  return mailer.sendMail({
    from: getFromAddress(),
    to: recipients.join(", "),
    subject,
    text,
    html,
  });
}

module.exports = {
  sendEmail,
};
