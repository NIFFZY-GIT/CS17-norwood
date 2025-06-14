import Mailjet from 'node-mailjet';

// --- Mailjet Client Initialization ---
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetApiSecret = process.env.MAILJET_API_SECRET;

// Critical check at module load time. If these are not set, the app likely can't send email.
if (!mailjetApiKey) {
  console.error('FATAL: Mailjet API Key (MAILJET_API_KEY) is not configured.');
  // Depending on your app's needs, you might throw an error here to halt initialization
  // throw new Error('FATAL: Mailjet API Key (MAILJET_API_KEY) is not configured.');
}
if (!mailjetApiSecret) {
  console.error('FATAL: Mailjet API Secret (MAILJET_API_SECRET) is not configured.');
  // throw new Error('FATAL: Mailjet API Secret (MAILJET_API_SECRET) is not configured.');
}

// Initialize Mailjet client.
// The apiConnect function expects string arguments. If the env vars are undefined here,
// it's better to have failed above or handle it, rather than passing undefined.
// For simplicity, we'll assume if they pass the above console.error, they might be undefined.
// A robust app would throw, or `apiConnect` would be called inside `sendEmail` after full checks.
const mailjet = Mailjet.apiConnect(
  mailjetApiKey || '', // Pass empty string if undefined to avoid runtime error in apiConnect, though it will fail API calls
  mailjetApiSecret || ''
);


// --- Type Definitions for Mailjet API Response ---
interface MailjetRecipientStatus {
  Email: string;
  MessageUUID: string;
  MessageID: number;
  MessageHref: string;
}

interface MailjetMessage {
  Status: 'success' | 'error' | string; // Mailjet might use other statuses for specific scenarios
  CustomID?: string;
  To?: MailjetRecipientStatus[];
  Cc?: MailjetRecipientStatus[];
  Bcc?: MailjetRecipientStatus[];
  Errors?: Array<{
    ErrorIdentifier: string;
    ErrorCode: string;
    StatusCode: number;
    ErrorMessage: string;
    ErrorRelatedTo?: string[];
  }>;
}

interface MailjetSuccessResponseBody {
  Messages: MailjetMessage[];
}

// Type guard to check if the body is a MailjetSuccessResponseBody
function isMailjetSuccessResponse(body: unknown): body is MailjetSuccessResponseBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'Messages' in body &&
    Array.isArray((body as MailjetSuccessResponseBody).Messages) &&
    (body as MailjetSuccessResponseBody).Messages.length > 0
  );
}

// --- Email Sending Function ---
interface EmailParams {
  toEmail: string;
  toName?: string;
  subject: string;
  textPart?: string;
  htmlPart?: string;
  fromEmail?: string; // Optional: defaults to MAILJET_SENDER_EMAIL
  fromName?: string; // Optional: defaults to MAILJET_SENDER_NAME
}

// Using 'unknown' for error is safer than 'any'.
// The actual error object from Mailjet or a caught error can be varied.
export const sendEmail = async ({
  toEmail,
  toName = 'Recipient',
  subject,
  textPart,
  htmlPart,
  fromEmail = process.env.MAILJET_SENDER_EMAIL,
  fromName = process.env.MAILJET_SENDER_NAME,
}: EmailParams): Promise<{ success: boolean; error?: unknown }> => {
  // Runtime checks for essential configurations
  if (!mailjetApiKey || !mailjetApiSecret) {
    const errorMessage = 'Mailjet API Key or Secret is not properly configured for sending.';
    console.error(errorMessage);
    return { success: false, error: { message: errorMessage } };
  }
  if (!fromEmail) {
    const errorMessage = 'Sender email (fromEmail or MAILJET_SENDER_EMAIL) is not configured.';
    console.error(errorMessage);
    return { success: false, error: { message: errorMessage } };
  }
  if (!fromName) {
    // It's good practice to have a sender name. Default to a generic one or the email itself if not provided.
    console.warn('Sender name (fromName or MAILJET_SENDER_NAME) is not configured. Using a default name.');
    fromName = process.env.MAILJET_SENDER_NAME || 'Contact Notification'; // Or simply fromEmail
  }

  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: [
            {
              Email: toEmail,
              Name: toName,
            },
          ],
          Subject: subject,
          TextPart: textPart,
          HTMLPart: htmlPart,
        },
      ],
    });

    const result = await request;
    const responseBody = result.body;

    // console.log('Mailjet API Full Response:', result); // For deeper debugging

    if (isMailjetSuccessResponse(responseBody)) {
      const firstMessageStatus = responseBody.Messages[0];
      if (firstMessageStatus.Status === 'success') {
        return { success: true };
      } else {
        // Mailjet API returned a non-success status for the message
        console.error('Mailjet send failed (API reported error for message):', firstMessageStatus);
        return { success: false, error: firstMessageStatus };
      }
    } else {
      // The response body was not in the expected Mailjet success format
      console.error('Mailjet send failed (unexpected API response structure):', responseBody);
      return { success: false, error: responseBody || { message: 'Unexpected API response structure from Mailjet.' } };
    }
  } catch (error) {
    console.error('Error sending email via Mailjet (network or library error):', error);
    // The caught error could be an Error instance or something else
    if (error instanceof Error) {
        return { success: false, error: { message: error.message, stack: error.stack, name: error.name } };
    }
    return { success: false, error: error || { message: 'An unknown error occurred during Mailjet communication.'} };
  }
};