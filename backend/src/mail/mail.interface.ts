export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
