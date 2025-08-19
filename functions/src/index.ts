// functions/src/index.ts

import { https, config, auth as authV1, firestore } from "firebase-functions/v1";
import * as admin from "firebase-admin";
import cors from "cors";
import sgMail = require("@sendgrid/mail");

// Lazily initialize the admin app
let app: admin.app.App;

// --- THE FIX: Check for the API key and provide a clear error if missing ---
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

// --- HTML Template Helper Functions ---

const getWelcomeEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Welcome to the Team!</h1><p>Hi ${name},</p><p>Your registration for SJECAero has been approved! You can now log in to the members' portal to access exclusive content, view announcements, and connect with the team.</p><p>We're excited to have you on board.</p><p>Best regards,<br>The SJECAero Core Team</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getPendingReviewEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Application Received!</h1><p>Hi ${name},</p><p>Thank you for your interest in SJECAero. We have received your registration request, and it is currently pending review by our team captain.</p><p>You will receive another email once your application has been approved or if we require more information. Please be patient as this process may take a few days.</p><p>Best regards,<br>The SJECAero Core Team</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

const getRejectionEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>Application Update</h1><p>Hi ${name},</p><p>Thank you for your interest in joining SJEC Aero. After careful consideration, we have decided not to move forward with your application at this time.</p><p>We receive many applications and regret that we cannot accept everyone. We encourage you to apply again during our next recruitment drive and wish you the best in your endeavors.</p><p>Best regards,<br>The SJECAero Core Team</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
`;

// NEW: HTML helper for pre-approval emails
const getPreApprovalEmailHtml = (name: string) => `
<!DOCTYPE html><html><head><style>body { font-family: sans-serif; margin: 0; padding: 40px; background-color: #f4f4f4; } .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; } h1 { color: #333; } p { color: #555; line-height: 1.6; } .button { display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; } .footer { margin-top: 20px; font-size: 12px; color: #aaa; text-align: center; }</style></head><body><div class="container"><h1>You're Pre-Approved!</h1><p>Hi ${name},</p><p>Great news! Your application to join SJECAero has been reviewed and approved. You are now pre-approved to become a member.</p><p>To complete your registration, please click the button below to create your account on our members' portal. Once you sign up with this email address, you'll get full access.</p><a href="https://sjecaero.org/signup" class="button">Create Your Account</a><p>Best regards,<br>The SJECAero Core Team</p></div><div class="footer"><p>This is an automated message. Please do not reply directly to this email.</p></div></body></html>
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

      // This now creates a document in the 'mail' collection again
      await db.collection("mail").add({
        to: config().sendgrid.from_email,
        bcc: recipientEmails,
        message: {
          subject: `SJECAero Announcement: ${title}`,
          html: `<h1>${title}</h1><p>${content.replace(/\n/g, "<br>")}</p><p>Please log in to the members' portal for more details if required.</p><p>Thank you,<br>The SJECAero Core Team</p>`,
        },
      });

      return { success: true, message: `Email queued for ${recipientEmails.length} members.`};
    } catch (error) {
      console.error("Error in sendAnnouncementEmail:", error);
      throw new https.HttpsError("internal", "An error occurred while queuing emails.");
    }
  },
);
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
      
      // This now creates a document in the 'mail' collection again
      await db.collection("mail").add({
        to: emailToRemove,
        message: {
          subject: "Update regarding your SJECAero Membership",
          text: `Hello,\n\nThis email is to inform you that your account and/or pre-approval has been removed from the SJECAero members portal.\n\nReason provided: ${reason}\n\nThank you,\nSJECAero Core Team`,
        },
      });
      
      res.status(200).json({ success: true, message: `Member ${emailToRemove} has been removed.` });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ success: false, message: "An internal error occurred." });
    }
  });
});


export const onUserCreate = authV1.user().onCreate(async (user) => {
  if (!app) app = admin.initializeApp();
  const db = admin.firestore();
  
  const userEmail = user.email;
  const userName = user.displayName || 'New Member';

  if (userEmail) {
    const memberDocRef = db.collection("members").doc(userEmail);
    const memberDoc = await memberDocRef.get();
    
    if (memberDoc.exists) {
      console.log(`User ${userEmail} is pre-approved. Sending welcome email.`);
      await memberDocRef.update({ registered: true });
      
      const msg = {
        to: userEmail,
        from: config().sendgrid.from_email,
        subject: 'Welcome to the Team!',
        html: getWelcomeEmailHtml(userName),
      };
      await sgMail.send(msg);

    } else {
      console.log(`User ${userEmail} is not pre-approved. Sending pending review email.`);
      
      const msg = {
        to: userEmail,
        from: config().sendgrid.from_email,
        subject: 'Application Received!',
        html: getPendingReviewEmailHtml(userName),
      };
      await sgMail.send(msg);
    }
  }
  return null;
});

export const reviewApplication = https.onRequest((req, res) => {
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
      
      const { applicantEmail, applicantUid, applicantName, approved } = req.body;
      
      if (approved) {
        await auth.setCustomUserClaims(applicantUid, { role: 'normal' });
        await db.collection("users").doc(applicantUid).set({
          email: applicantEmail,
          fullName: applicantName,
          role: 'normal'
        }, { merge: true });

        const msg = {
          to: applicantEmail,
          from: config().sendgrid.from_email,
          subject: 'Welcome to the Team!',
          html: getWelcomeEmailHtml(applicantName),
        };
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: "Applicant approved." });
      } else {
        await auth.deleteUser(applicantUid);
        
        const msg = {
          to: applicantEmail,
          from: config().sendgrid.from_email,
          subject: 'Application Update',
          html: getRejectionEmailHtml(applicantName),
        };
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: "Applicant rejected." });
      }
    } catch (error) {
      console.error("Error reviewing application:", error);
      res.status(500).json({ success: false, message: "An internal error occurred." });
    }
  });
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

      console.log(`Sending application confirmation email to ${applicantEmail}`);

      const msg = {
        to: applicantEmail,
        from: config().sendgrid.from_email,
        subject: "We've Received Your Application | SJECAero",
        html: getPendingReviewEmailHtml(applicantName),
      };

      await sgMail.send(msg);
      console.log(`Confirmation email sent successfully to ${applicantEmail}.`);

    } catch (error) {
      console.error(`Error sending recruitment confirmation for doc ${snap.id}:`, error);
    }
  });

// NEW: Callable function to process recruitment applications from the dashboard
export const processRecruitment = https.onCall(async (data, context) => {
    if (!app) app = admin.initializeApp();
    await ensureIsAdmin(context);

    const { applicantEmail, applicantName, approved, docId } = data;
    const db = admin.firestore();

    if (!applicantEmail || !applicantName || typeof approved !== 'boolean' || !docId) {
        throw new https.HttpsError("invalid-argument", "Missing required data.");
    }

    try {
        if (approved) {
            await db.collection("members").doc(applicantEmail).set({
                email: applicantEmail,
                name: applicantName,
                registered: false
            });

            const msg = {
                to: applicantEmail,
                from: config().sendgrid.from_email,
                subject: "You're Pre-Approved to Join SJECAero!",
                html: getPreApprovalEmailHtml(applicantName),
            };
            await sgMail.send(msg);
        } else {
            const msg = {
                to: applicantEmail,
                from: config().sendgrid.from_email,
                subject: "Application Update | SJECAero",
                html: getRejectionEmailHtml(applicantName),
            };
            await sgMail.send(msg);
        }

        await db.collection("recruitment").doc(docId).delete();
        return { success: true, message: `Application for ${applicantName} processed.` };

    } catch (error) {
        console.error("Error processing recruitment:", error);
        throw new https.HttpsError("internal", "An error occurred while processing the application.");
    }
});