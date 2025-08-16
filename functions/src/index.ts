// functions/src/index.ts

import { https, config, auth as authV1 } from "firebase-functions/v1";
import * as admin from "firebase-admin";
import cors from "cors";

// 1. Import the SendGrid library
import sgMail = require("@sendgrid/mail");

// Lazily initialize the admin app to prevent timeouts
let app: admin.app.App;

// 2. Initialize SendGrid with your API key
sgMail.setApiKey(config().sendgrid.key);

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

// --- This function is UNCHANGED, as it doesn't use templates ---
export const sendAnnouncementEmail = https.onCall(
  async (data: AnnouncementData, context) => {
    if (!app) app = admin.initializeApp();
    const db = admin.firestore();
    
    await ensureIsAdmin(context);
    const {title, content} = data;
    try {
      const usersSnapshot = await db.collection("users").get();
      const recipientEmails = usersSnapshot.docs.map((doc) => doc.data().email);
      if (recipientEmails.length === 0) {
        return {success: true, message: "No members to email."};
      }

      await db.collection("mail").add({
        to: config().sendgrid.from_email,
        bcc: recipientEmails,
        message: {
          subject: `SJECAero Announcement: ${title}`,
          html: `<h1>${title}</h1><p>${content.replace(/\n/g, "<br>")}</p>`,
        },
      });

      return { success: true, message: `Email sent to ${recipientEmails.length} members.`};
    } catch (error) {
      console.error("Error sending announcement email:", error);
      throw new https.HttpsError("internal", "An error occurred while sending emails.");
    }
  },
);

// --- This function is UNCHANGED, as it doesn't use templates ---
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
      if (uidToRemove && typeof uidToRemove === 'string') {
        await auth.deleteUser(uidToRemove);
        await db.collection("users").doc(uidToRemove).delete();
      }
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

// --- MODIFIED ---
export const onUserCreate = authV1.user().onCreate(async (user) => {
  if (!app) app = admin.initializeApp();
  const db = admin.firestore();
  
  const userEmail = user.email;
  const userName = user.displayName || 'New Member';

  if (userEmail) {
    const memberDocRef = db.collection("members").doc(userEmail);
    const memberDoc = await memberDocRef.get();
    
    const msg = {
      to: userEmail,
      from: config().sendgrid.from_email, // Your verified sender
      templateId: '',
      dynamicTemplateData: { name: userName },
    };

    if (memberDoc.exists) {
      console.log(`User ${userEmail} is pre-approved. Sending welcome email.`);
      await memberDocRef.update({ registered: true });
      
      msg.templateId = 'd-a7e06607cba74613989051ad2ad83eb2'; // welcome-email ID
      await sgMail.send(msg);

    } else {
      console.log(`User ${userEmail} is not pre-approved. Sending pending review email.`);
      
      msg.templateId = 'd-0c69b490b3a340dd8a5cf3565d9a6a5f'; // pending-review-email ID
      await sgMail.send(msg);
    }
  }
  return null;
});

// --- MODIFIED ---
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
      
      const msg = {
        to: applicantEmail,
        from: config().sendgrid.from_email,
        templateId: '',
        dynamicTemplateData: { name: applicantName },
      };

      if (approved) {
        await auth.setCustomUserClaims(applicantUid, { role: 'normal' });
        await db.collection("users").doc(applicantUid).set({
          email: applicantEmail,
          fullName: applicantName,
          role: 'normal'
        }, { merge: true });

        msg.templateId = 'd-a7e06607cba74613989051ad2ad83eb2'; // welcome-email ID
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: "Applicant approved." });
      } else {
        await auth.deleteUser(applicantUid);
        
        msg.templateId = 'd-74c30a43f8df438db8186697edb52e68'; // rejection-email ID
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: "Applicant rejected." });
      }
    } catch (error) {
      console.error("Error reviewing application:", error);
      res.status(500).json({ success: false, message: "An internal error occurred." });
    }
  });
});
