import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('Missing SENDGRID_API_KEY environment variable');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`;
  
  const mailOptions = {
    from: 'alfredo@qri.org', // Make sure this is your verified SendGrid sender email
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
    await sgMail.send(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}