import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, company, message } = req.body;

  // Validate inputs
  if (!firstName || !lastName || !email || !company || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for API key
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured (missing RESEND_API_KEY)' });
  }

  try {
    // Send email via Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Start with Resend's default sender; update after verifying your domain
      to: 'contact@jmcsolutions.ai',
      replyTo: email,
      subject: `New Discovery Call Request from ${firstName} ${lastName} (${company})`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    if (data.error) {
      console.error('Resend error:', data.error);
      return res.status(500).json({ error: `Resend error: ${data.error.message || JSON.stringify(data.error)}` });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: `Failed to send email: ${error?.message || error}` 
    });
  }
}
