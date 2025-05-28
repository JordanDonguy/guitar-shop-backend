module.exports = function (name, link) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${link}" style="display:inline-block; padding:10px 20px; background:#007BFF; color:white; text-decoration:none; border-radius:5px;">
        Reset Password
      </a>
      <p>If you didn’t request this, you can ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;
};
