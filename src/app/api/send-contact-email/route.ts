import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailjet'; // Assuming this path is now correct

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const receiverEmail = process.env.CONTACT_FORM_RECEIVER_EMAIL;
    const senderEmail = process.env.MAILJET_SENDER_EMAIL;
    const senderName = process.env.MAILJET_SENDER_NAME || "Contact Form";

    if (!receiverEmail) {
      console.error('CONTACT_FORM_RECEIVER_EMAIL is not set in .env');
      return NextResponse.json({ success: false, error: 'Server configuration error (receiver missing).' }, { status: 500 });
    }
    if (!senderEmail) {
        console.error('MAILJET_SENDER_EMAIL is not set in .env');
        return NextResponse.json({ success: false, error: 'Server configuration error (sender missing).' }, { status: 500 });
    }

    const emailSubject = `New Contact Form Submission: ${subject}`;
    const textContent = `
      You have a new message from your contact form:
      --------------------------------------------------
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      --------------------------------------------------
      Message:
      ${message}
      --------------------------------------------------
    `;
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            h2 { color: #0056b3; }
            .field { margin-bottom: 10px; }
            .field strong { display: inline-block; width: 80px; }
            .message { margin-top: 15px; padding: 10px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 3px;}
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message through the contact form on your website.</p>
            <div class="field"><strong>From:</strong> ${name}</div>
            <div class="field"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></div>
            <div class="field"><strong>Subject:</strong> ${subject}</div>
            <div class="message">
              <strong>Message:</strong>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <hr>
            <p><small>This email was sent from the contact form on ${process.env.MAILJET_SENDER_NAME || 'your website'}.</small></p>
          </div>
        </body>
      </html>
    `;

    const emailResult = await sendEmail({
      toEmail: receiverEmail,
      subject: emailSubject,
      textPart: textContent,
      htmlPart: htmlContent,
      fromEmail: senderEmail,
      fromName: `${name} (via ${senderName})`,
    });

    if (emailResult.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      // Log the specific error from Mailjet if available
      console.error('Failed to send email via Mailjet:', emailResult.error);
      // Provide a more generic error to the client, or a specific one if safe
      const clientError = (typeof emailResult.error === 'string') ? emailResult.error : 'Failed to send email due to a server issue.';
      return NextResponse.json({ success: false, error: clientError }, { status: 500 });
    }

  } catch (error) { // Type 'any' removed, 'error' is now 'unknown' by default
    console.error('Error in /api/send-contact-email endpoint:', error);
    
    let errorMessage = 'An unexpected error occurred on the server.';
    if (error instanceof Error) {
      // Standard JavaScript error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // Error is a string
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      // Error is an object with a message property (like some custom errors)
      errorMessage = error.message;
    }
    // Add more specific checks if you expect other error structures

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}