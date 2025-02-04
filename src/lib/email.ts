import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // For Gmail TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('==== TEST EMAIL ====');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Verification URL: ${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`);
    console.log('===================');
    return;
  }
  
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your signature',
    text: `Hello ${name},\n\nThank you for signing our open letter. Please click the link below to verify your signature:\n\n${verificationUrl}\n\nIf you didn't sign this open letter, please ignore this email.\n\nBest regards,\nThe Open Letter Team`,
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for signing our open letter. Please click the link below to verify your signature:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>If you didn't sign this open letter, please ignore this email.</p>
      <p>Best regards,<br>The Open Letter Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}