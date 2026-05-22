const getOtpTemplate = (otp, name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a14; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #181825; border-radius: 16px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          
          <tr>
            <td align="center" style="padding: 30px 0 10px 0;">
              <h1 style="color: #E50914; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px; text-transform: uppercase;">
                Suno Audiobook
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 10px;">Verify Your Account</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                Hi ${name || "Storyteller"},<br/>
                Use the One Time Password (OTP) below to complete your registration. This code expires in 10 minutes.
              </p>

              <div style="background-color: #E50914; border-radius: 12px; padding: 15px; display: inline-block; min-width: 150px;">
                <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                  ${otp}
                </span>
              </div>

              <p style="color: #a1a1aa; font-size: 12px; margin-top: 25px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #333; padding: 20px; text-align: center;">
              <p style="color: #555; font-size: 10px; margin: 0;">
                &copy; ${new Date().getFullYear()} Story Heaven 7. All rights reserved.<br/>
                Immersive Audio Experience.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const getPasswordResetTemplate = (otp, name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a14; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a14; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; background-color: #181825; border-radius: 16px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding: 30px 0 10px 0;">
              <h1 style="color: #E50914; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px; text-transform: uppercase;">
                Suno Audiobook
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 10px;">Reset Password Request</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                Hi ${name || "User"},<br/>
                We received a request to reset your password. Use the code below to proceed.
              </p>
              <div style="background-color: #E50914; border-radius: 12px; padding: 15px; display: inline-block; min-width: 150px;">
                <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                  ${otp}
                </span>
              </div>
              <p style="color: #a1a1aa; font-size: 12px; margin-top: 25px;">
                This code expires in 10 minutes. If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #333; padding: 20px; text-align: center;">
              <p style="color: #555; font-size: 10px; margin: 0;">
                &copy; ${new Date().getFullYear()} Story Heaven 7. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = { getOtpTemplate, getPasswordResetTemplate };
