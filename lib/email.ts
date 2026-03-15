import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReminderEmail(
  to: string,
  userName: string,
  raceName: string,
  fp1Start: string
) {
  const fp1Date = new Date(fp1Start);
  const formattedDate = fp1Date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "F1 Predictor <noreply@f1predictor.com>",
    to,
    subject: `🏎️ Reminder: Submit your prediction for ${raceName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e10600;">🏁 F1 Prediction Reminder</h2>
        <p>Hey <strong>${userName}</strong>,</p>
        <p>
          The <strong>${raceName}</strong> weekend is about to start!
          FP1 begins on <strong>${formattedDate}</strong>.
        </p>
        <p>
          You haven't submitted your prediction yet. Make sure to submit it
          <strong>before FP1 starts</strong>, or your prediction will be locked out!
        </p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}"
             style="display: inline-block; background: #e10600; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Submit Prediction Now →
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated reminder from the F1 Predictor app.
        </p>
      </div>
    `,
  });
}

