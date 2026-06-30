export const getInviteHtmlTemplate = (
  workspaceName: string,
  inviterName: string,
  role: string,
  inviteLink: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px;">
      <h2 style="color: #1c1917;">Workspace Invitation</h2>
      <p style="color: #444; font-size: 16px;">Hi there,</p>
      <p style="color: #444; font-size: 16px;">
        <strong>${inviterName}</strong> has invited you to join the workspace <strong>"${workspaceName}"</strong> on TaskFlow as a <strong>${role}</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #1c1917; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #777; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This invitation link will expire in 48 hours.
      </p>
    </div>
  `;
};

export const getInviteTextTemplate = (
  workspaceName: string,
  inviterName: string,
  role: string,
  inviteLink: string
): string => {
  return `${inviterName} has invited you to join the workspace "${workspaceName}" on TaskFlow as a ${role}.\n\nClick the link below to accept the invitation:\n${inviteLink}\n\nThis link will expire in 48 hours.`;
};