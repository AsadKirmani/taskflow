import express from 'express';
import { Receiver } from '@upstash/qstash';
import { sendInvitationEmail } from '../config/mailer';

const router = express.Router();

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

router.post('/send-invitation', async (req, res) => {
  try {
    const signature = req.headers["upstash-signature"] as string;
    const isValid = await receiver.verify({
      signature,
      body: JSON.stringify(req.body),
    });

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { email, workspaceName, inviterName, role, rawToken } = req.body;
    await sendInvitationEmail(email, workspaceName, inviterName, role, rawToken);
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;