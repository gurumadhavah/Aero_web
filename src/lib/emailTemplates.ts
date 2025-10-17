// src/lib/emailTemplates.ts

// --- INTERFACES FOR EMAIL DATA ---
interface InviteDetails {
  date: string;
  venue: string;
}

interface ContactDetails {
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
}

interface ReplyDetails {
  to_name: string;
  original_subject: string;
  reply_content: string;
}

// --- STYLING & STRUCTURE ---
const commonStyles = `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; } h1 { color: #000; }`;
const buttonStyles = `.button { display: inline-block; padding: 12px 24px; margin: 15px 0; background-color: #007bff; color: white !important; text-decoration: none; border-radius: 5px; font-weight: bold; }`;

// --- EMAIL BODY GENERATORS ---

export const getContactNotificationBody = (details: ContactDetails): string => `
  <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
  <h1>New Contact Form Submission</h1><p>You received a new message from your website's contact form.</p><hr>
  <p><strong>From:</strong> ${details.from_name} (${details.from_email})</p>
  <p><strong>Subject:</strong> ${details.subject}</p>
  <p><strong>Message:</strong></p><p>${(details.message || "").replace(/\n/g, "<br>")}</p>
  </div></body></html>`;

export const getContactReplyBody = (details: ReplyDetails): string => `
  <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
  <p>Hi ${details.to_name},</p>
  <p>${(details.reply_content || "").replace(/\n/g, "<br>")}</p>
  <p>Best regards,<br>The SJEC Aero Team</p>
  </div></body></html>`;

export const getRecruitmentEmailSubject = (actionType: string): string => {
  // ... (existing code for recruitment subjects)
  switch (actionType) {
    case 'invite_test': return "Invitation to Written Test | SJEC Aero";
    case 'interview': return "Invitation to Interview | SJEC Aero";
    case 'accept': return "Welcome to the Team! | SJEC Aero";
    case 'reject': return "Application Update | SJEC Aero";
    default: return "Update on your SJEC Aero Application";
  }
};

export const getRecruitmentEmailBody = (actionType: string, toName: string, details?: InviteDetails): string => {
  // ... (existing code for recruitment bodies)
  switch (actionType) {
    case 'invite_test':
      return `<!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
        <h1>Test Invitation</h1><p>Hi ${toName},</p>
        <p>Thank you for your interest in SJEC Aero. You have been shortlisted for a written test.</p>
        <p><strong>Test Details:</strong></p><ul><li><strong>Date:</strong> ${details?.date}</li><li><strong>Venue:</strong> ${details?.venue}</li></ul>
        <p>We look forward to seeing you.</p><p>Best regards,<br>The SJEC Aero Team</p>
        </div></body></html>`;
    case 'interview':
      return `<!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
        <h1>Interview Invitation</h1><p>Hi ${toName},</p>
        <p>Congratulations! You have been shortlisted for an interview.</p>
        <p><strong>Interview Details:</strong></p><ul><li><strong>Date:</strong> ${details?.date}</li><li><strong>Venue:</strong> ${details?.venue}</li></ul>
        <p>Best regards,<br>The SJEC Aero Team</p>
        </div></body></html>`;
    case 'accept':
      return `<!DOCTYPE html><html><head><style>${commonStyles} ${buttonStyles}</style></head><body><div class="container">
        <h1>Welcome to the Team!</h1><p>Hi ${toName},</p>
        <p>Great news! Your membership with SJEC Aero has been confirmed. Please click the button below to create your account.</p>
        <a href="https://sjecaero.in/register" class="button">Create Your Account</a>
        <p>Best regards,<br>The SJEC Aero Team</p>
        </div></body></html>`;
    case 'reject':
      return `<!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
        <h1>Application Update</h1><p>Hi ${toName},</p>
        <p>Thank you for your interest in joining SJEC Aero. After careful consideration, we have decided not to move forward with your application at this time.</p>
        <p>Best regards,<br>The SJEC Aero Team</p>
        </div></body></html>`;
    default:
      return `<!DOCTYPE html><html><body><p>Hi ${toName}, This is an update regarding your application.</p></body></html>`;
  }
};

export const getApplicationReceivedBody = (toName: string): string => `
  <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
  <h1>Application Received!</h1><p>Hi ${toName},</p>
  <p>Thank you for your interest in SJEC Aero. We have received your application and it is pending review.</p>
  <p>You will receive another email once your application has been processed.</p>
  <p>Best regards,<br>The SJEC Aero Team</p>
  </div></body></html>`;

/**
 * NEW: For sending a new announcement to members.
 */
export const getAnnouncementBody = (title: string, content: string): string => `
  <!DOCTYPE html><html><head><style>${commonStyles}</style></head><body><div class="container">
  <h1>${title}</h1>
  <p>${content.replace(/\n/g, "<br>")}</p>
  <p>Please log in to the members' portal for more details if required.</p>
  <p>Thank you,<br>The SJEC Aero Team</p>
  </div></body></html>`;