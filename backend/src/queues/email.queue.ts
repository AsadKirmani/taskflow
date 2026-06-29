import { Client } from "@upstash/qstash";
import dotenv from 'dotenv';
dotenv.config();

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!
});

export const addInvitationEmailJob = async (email: string, workspaceName: string, inviterName: string, role: string, rawToken: string) => {
  
    const baseUrl = process.env.API_BASE_URL;
  await qstashClient.publishJSON({
    url: `${baseUrl}/api/v1/webhooks/send-invitation`,
    body: { email, workspaceName, inviterName, role, rawToken },
    retries: 3,
  });
};