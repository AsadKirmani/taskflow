import { ResendProvider } from "./resend.provider";
import {
  getInviteHtmlTemplate,
  getInviteTextTemplate,
} from "./templates/invite";
import dotenv from "dotenv";

dotenv.config();

class MailService {
  private provider = new ResendProvider();
  private baseUrl = process.env.FRONTEND_URL || "http://localhost:4200";

  async sendInvitationEmail(
    to: string,
    workspaceName: string,
    inviterName: string,
    role: string,
    rawToken: string,
  ) {
    const inviteLink = `${this.baseUrl}/invite/accept?token=${rawToken}`;
    const subject = `Invitation to join workspace "${workspaceName}" on TaskFlow`;

    const html = getInviteHtmlTemplate(
      workspaceName,
      inviterName,
      role,
      inviteLink,
    );
    const text = getInviteTextTemplate(
      workspaceName,
      inviterName,
      role,
      inviteLink,
    );

    await this.provider.sendMail({
      to,
      subject,
      html,
      text,
    });
  }
}

export const mailService = new MailService();
