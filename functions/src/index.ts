// functions/src/index.ts

import { https, config, firestore } from "firebase-functions/v1";
import * as admin from "firebase-admin";
import cors from "cors";
import sgMail = require("@sendgrid/mail");

// Lazily initialize the admin app
let app: admin.app.App;

const SENDGRID_API_KEY = config().sendgrid?.key;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.error(
    "FATAL ERROR: SendGrid API key is not configured. " +
    "Run 'firebase functions:config:set sendgrid.key=\"YOUR_KEY\"' " +
    "and deploy functions again."
  );
}

// --- NEW HTML TEMPLATES for Recruitment ---

const getTestInviteEmailHtml = (name: string, date: string, venue: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Test Invitation</h1><p>Hi ${name},</p><p>Thank you for your interest in SJEC Aero. Based on your application, you have been shortlisted for a written test.</p><p><strong>Test Details:</strong></p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Venue:</strong> ${venue}</li></ul><p>Please be on time. We look forward to seeing you.</p><p>Best regards,<br>The SJEC Aero</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getInterviewInviteEmailHtml = (name: string, date: string, venue: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Interview Invitation</h1><p>Hi ${name},</p><p>Congratulations! You have been shortlisted for an interview. We were impressed with your performance in the written test.</p><p><strong>Interview Details:</strong></p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Venue:</strong> ${venue}</li></ul><p>Please prepare to discuss your skills and interests in more detail. We look forward to speaking with you.</p><p>Best regards,<br>The SJEC Aero</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getAcceptanceEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .button { display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Welcome to the Team!</h1><p>Hi ${name},</p><p>Great news! Your membership with SJEC Aero has been confirmed.</p><p>To complete your registration, please click the button below to create your account on our members' portal. Once you sign up with this email address, you'll get full access.</p><a href="https://sjecaero.in/register" class="button">Create Your Account</a><p>Best regards,<br>The SJEC Aero</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getRejectionEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Application Update</h1><p>Hi ${name},</p><p>Thank you for your interest in joining SJEC Aero. After careful consideration, we have decided not to move forward with your application at this time.</p><p>We receive many applications and regret that we cannot accept everyone. We encourage you to apply again during our next recruitment drive and wish you the best in your endeavors.</p><p>Best regards,<br>The SJEC Aero</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getPendingReviewEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Application Received!</h1><p>Hi ${name},</p><p>Thank you for your interest in SJEC Aero. We have received your registration request, and it is currently pending review by our team.</p><p>You will receive another email once your application has been processed. Please be patient as this process may take a few days.</p><p>Best regards,<br>The SJEC Aero</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;


// --- Cloud Functions ---

interface AnnouncementData {
  title: string;
  content: string;
}

const ensureIsAdmin = async (context: https.CallableContext) => {
  if (!app) app = admin.initializeApp();
  const db = admin.firestore();

  if (!context.auth) {
    throw new https.HttpsError("unauthenticated", "Auth required.");
  }
  const callerDoc = await db.collection("users").doc(context.auth.uid).get();
  const callerRole = callerDoc.data()?.role;
  if (callerRole !== "captain" && callerRole !== "core") {
    throw new https.HttpsError("permission-denied", "You do not have permission.");
  }
};

export const sendAnnouncementEmail = https.onCall(
  async (data: AnnouncementData, context) => {
    if (!app) app = admin.initializeApp();
    const db = admin.firestore();
    
    await ensureIsAdmin(context);
    const {title, content} = data;
    try {
      const usersSnapshot = await db.collection("users").get();
      const recipientEmails = usersSnapshot.docs
        .map((doc) => doc.data().email)
        .filter((email): email is string => typeof email === 'string' && email.includes('@'));

      if (recipientEmails.length === 0) {
        return {success: true, message: "No valid member emails found."};
      }

      await db.collection("mail").add({
        to: config().sendgrid.from_email,
        bcc: recipientEmails,
        message: {
          subject: `SJECAero Announcement: ${title}`,
          html: `<h1>${title}</h1><p>${content.replace(/\n/g, "<br>")}</p><p>Please log in to the members' portal for more details if required.</p><p>Thank you,<br>The SJEC Aero</p>`,
        },
      });

      return { success: true, message: `Email queued for ${recipientEmails.length} members.`};
    } catch (error) {
      console.error("Error in sendAnnouncementEmail:", error);
      throw new https.HttpsError("internal", "An error occurred while queuing emails.");
    }
  },
);

// --- RESTORED removeUserHTTP FUNCTION ---
export const removeUserHTTP = https.onRequest((req, res) => {
  if (!app) app = admin.initializeApp();
  const db = admin.firestore();
  const auth = admin.auth();
  const corsHandler = cors({ origin: true });

  corsHandler(req, res, async () => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      const callerUid = decodedToken.uid;
      const callerDoc = await db.collection("users").doc(callerUid).get();
      if (callerDoc.data()?.role !== "captain") {
        res.status(403).json({ success: false, message: "Permission denied." });
        return;
      }
      const { uidToRemove, emailToRemove, reason } = req.body;
      await db.collection("members").doc(emailToRemove).delete();
      await db.collection("team").doc(emailToRemove).delete();
      if (uidToRemove && typeof uidToRemove === 'string') {
        await auth.deleteUser(uidToRemove);
        await db.collection("users").doc(uidToRemove).delete();
      }
      
      await db.collection("mail").add({
        to: emailToRemove,
        message: {
          subject: "Update regarding your SJECAero Membership",
          text: `Hello,\n\nThis email is to inform you that your account and/or pre-approval has been removed from the SJECAero members portal.\n\nReason provided: ${reason}\n\nThank you,\nSJEC Aero`,
        },
      });
      
      res.status(200).json({ success: true, message: `Member ${emailToRemove} has been removed.` });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ success: false, message: "An internal error occurred." });
    }
  });
});


// NEW: Callable function to handle the new multi-stage recruitment process
export const processRecruitment = https.onCall(async (data, context) => {
    if (!app) app = admin.initializeApp();
    await ensureIsAdmin(context);
    const db = admin.firestore();

    const { action, applicantId, applicantEmail, applicantName, date, venue } = data;

    if (!action || !applicantId || !applicantEmail || !applicantName) {
        throw new https.HttpsError("invalid-argument", "Missing required data.");
    }
    
    const applicantRef = db.collection("recruitment").doc(applicantId);
    let emailSubject = "";
    let emailHtml = "";
    let newStatus = "";

    try {
        switch (action) {
            case 'invite_test':
                emailSubject = "Invitation to Written Test | SJEC Aero";
                emailHtml = getTestInviteEmailHtml(applicantName, date, venue);
                newStatus = 'test_invited';
                break;
            case 'invite_interview':
                emailSubject = "Invitation to Interview | SJEC Aero";
                emailHtml = getInterviewInviteEmailHtml(applicantName, date, venue);
                newStatus = 'interview_invited';
                break;
            case 'accept':
                emailSubject = "Welcome to the Team! | SJEC Aero";
                emailHtml = getAcceptanceEmailHtml(applicantName);
                newStatus = 'accepted';
                break;
            case 'reject':
                emailSubject = "Application Update | SJEC Aero";
                emailHtml = getRejectionEmailHtml(applicantName);
                newStatus = 'rejected';
                break;
            default:
                throw new https.HttpsError("invalid-argument", "Invalid action specified.");
        }

        await applicantRef.update({ 
          status: newStatus,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        const msg = {
          to: applicantEmail,
          from: config().sendgrid.from_email,
          subject: emailSubject,
          html: emailHtml,
        };
        await sgMail.send(msg);

        return { success: true, message: `Application for ${applicantName} has been processed.` };
    } catch (error) {
        console.error(`Error processing action ${action}:`, error);
        throw new https.HttpsError("internal", "An error occurred while processing the action.");
    }
});

export const onRecruitmentSubmit = firestore
  .document("recruitment/{docId}")
  .onCreate(async (snap) => {
    try {
      const applicationData = snap.data();
      const applicantName = applicationData.fullName || 'New Applicant';
      const applicantEmail = applicationData.email;

      if (!applicantEmail) {
        console.log(`Recruitment document ${snap.id} is missing an email address.`);
        return;
      }
      
      const msg = {
        to: applicantEmail,
        from: config().sendgrid.from_email,
        subject: "We've Received Your Application | SJECAero",
        html: getPendingReviewEmailHtml(applicantName),
      };
      await sgMail.send(msg);
      console.log(`Initial confirmation email sent to ${applicantEmail}.`);

      await snap.ref.set({ 
        status: 'submitted',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error(`Error sending recruitment confirmation for doc ${snap.id}:`, error);
    }
  });