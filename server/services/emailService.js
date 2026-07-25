import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM ?? `HIGHFIVE Tournament <${process.env.SMTP_USER}>`;

export const sendTempPassword = async ({ to, full_name, tournamentName, tempPassword }) => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Votre accès HIGHFIVE Tournament — ${tournamentName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
        <h2 style="color:#C6963B">Bienvenue, ${full_name} !</h2>
        <p>Vous avez été inscrit(e) au tournoi <strong>${tournamentName}</strong>.</p>
        <p>Un compte a été créé automatiquement pour vous :</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0"><strong>Email :</strong> ${to}</p>
          <p style="margin:8px 0 0"><strong>Mot de passe temporaire :</strong>
            <code style="background:#e0e0e0;padding:2px 6px;border-radius:4px">${tempPassword}</code>
          </p>
        </div>
        <p style="color:#e53e3e;font-weight:bold">
          ⚠️ Ce mot de passe est à usage unique. Il ne sera plus valide après votre première connexion.
          Vous devrez le modifier immédiatement.
        </p>
        <p>Connectez-vous sur <a href="${process.env.VITE_APP_URL ?? 'http://localhost:5173'}">HIGHFIVE Tournament</a> pour accéder à votre espace.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:12px">Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
      </div>
    `,
  });
};
