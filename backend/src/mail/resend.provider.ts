import { Resend } from 'resend';
import { MailProvider, SendMailOptions } from './mail.interface';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.MAIL_FROM_ADDRESS || 'onboarding@resend.dev';

export class ResendProvider implements MailProvider {
  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('❌ Failed to send email via Resend:', err);
      throw err;
    }
  }
}