import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: '127.0.0.1',
  port: 1025,
  ignoreTLS: true
});

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: '"Open Letter Team" <test@localhost>',
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}