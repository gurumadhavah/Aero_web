// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// HELPER to initialize the email transporter only when needed
const getMailTransport = () => {
  const gmailEmail = functions.config().gmail.email;
  const gmailPassword = functions.config().gmail.password;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });
};

// --- TYPE DEFINITIONS for incoming data ---
interface UpdateData {
  collectionName: string;
  docId: string;
  values: object;
}
interface DeleteData {
  collectionName: string;
  docId: string;
}
interface AnnouncementData {
  title: string;
  content: string;
}
interface RemoveUserData {
  uidToRemove: string;
  emailToRemove: string;
  reason: string;
}

// --- HELPER to check for admin roles ---
const ensureIsAdmin = async (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Auth required.");
  }
  const callerDoc = await db.collection("users").doc(context.auth.uid).get();
  const callerRole = callerDoc.data()?.role;
  if (callerRole !== "captain" && callerRole !== "core") {
    throw new functions.https.HttpsError("permission-denied",
      "You do not have permission.",
    );
  }
};


// --- CLOUD FUNCTIONS ---

export const updateDocument = functions.https.onCall(
  async (data: UpdateData, context) => 
    {
  await ensureIsAdmin(context);
  const {collectionName, docId, values} = data;
  try {
    await db.collection(collectionName).doc(docId).update(values);
    return {success: true, message: "Document updated successfully."};
  } catch (error) {
    console.error("Error updating document:", error);
    throw new functions.https.HttpsError("internal", "Could not update document.");
  }
});

export const deleteDocument = functions.https.onCall(async (data: DeleteData, context) => {
  await ensureIsAdmin(context);
  const {collectionName, docId} = data;
  try {
    await db.collection(collectionName).doc(docId).delete();
    return {success: true, message: "Document deleted successfully."};
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new functions.https.HttpsError("internal", "Could not delete document.");
  }
});

export const sendAnnouncementEmail = functions.https.onCall(async (data: AnnouncementData, context) => {
  await ensureIsAdmin(context);
  const {title, content} = data;
  try {
    const usersSnapshot = await db.collection("users").get();
    const recipientEmails = usersSnapshot.docs.map((doc) => doc.data().email);
    if (recipientEmails.length === 0) {
      return {success: true, message: "No members to email."};
    }
    const mailTransport = getMailTransport(); // Initialize transporter here
    const mailOptions = {
      from: `"SJECAero Announcements" <${functions.config().gmail.email}>`,
      to: functions.config().gmail.email,
      bcc: recipientEmails,
      subject: `SJECAero Announcement: ${title}`,
      html: `<h1>${title}</h1><p>${content.replace(/\n/g, "<br>")}</p>`,
    };
    await mailTransport.sendMail(mailOptions);
    return {success: true, message: `Email sent to ${recipientEmails.length} members.`};
  } catch (error) {
    console.error("Error sending announcement email:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while sending emails.");
  }
});

export const removeUser = functions.https.onCall(async (data: RemoveUserData, context) => {
  await ensureIsAdmin(context);
  const {uidToRemove, emailToRemove, reason} = data;
  try {
    await auth.deleteUser(uidToRemove);
    await db.collection("users").doc(uidToRemove).delete();
    const memberQuery = await db.collection("members")
        .where("email", "==", emailToRemove).get();
    const batch = db.batch();
    memberQuery.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    const mailTransport = getMailTransport(); // Initialize transporter here
    const mailOptions = {
      from: `"SJECAero Admin" <${functions.config().gmail.email}>`,
      to: emailToRemove,
      subject: "Update regarding your SJECAero Membership",
      text: `Hello,\n\nThis email is to inform you that your account ` +
            `has been removed from the SJECAero members portal.\n\n` +
            `Reason provided: "${reason}"\n\nIf you believe this is a ` +
            `mistake, please contact the club captain.\n\nThank you,\n` +
            `SJECAero Core Team`,
    };
    await mailTransport.sendMail(mailOptions);
    return {
      success: true,
      message: `User ${emailToRemove} has been removed and notified.`,
    };
  } catch (error) {
    console.error("Error removing user:", error);
    throw new functions.https.HttpsError("internal", "An error occurred while removing the user.");
  }
});