const nodemailer = require('nodemailer');
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const sendInvitationEmail = async (to: string, workspaceName: string, inviterName: string, role: string) => {
  const mailOptions = {
    from: process.env.GOOGLE_APP_EMAIL,
    to,
    subject: `Invitation to join workspace "${workspaceName}" on TaskFlow`,
    text: `${inviterName} has invited you to join the workspace "${workspaceName}" on TaskFlow as a ${role}. Click the link below to accept the invitation:\n\n[Accept Invitation Link]`,
  };
  await transporter.sendMail(mailOptions);
};

export { transporter, sendInvitationEmail };
