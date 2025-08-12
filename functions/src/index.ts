// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// Configure the email transport using environment variables
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// --- FUNCTION TO UPDATE A DOCUMENT ---
export const updateDocument = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const callerDoc = await db.collection("users").doc(context.auth.uid).get();
  const callerRole = callerDoc.data()?.role;
  if (callerRole !== "captain" && callerRole !== "core") {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission.");
  }

  const { collectionName, docId, values } = data;
  if (!collectionName || !docId || !values) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required data.");
  }

  try {
    await db.collection(collectionName).doc(docId).update(values);
    return { success: true, message: "Document updated successfully." };
  } catch (error) {
    console.error("Error updating document:", error);
    throw new functions.https.HttpsError("internal", "Could not update document.");
  }
});

// --- FUNCTION TO DELETE A DOCUMENT ---
export const deleteDocument = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const callerDoc = await db.collection("users").doc(context.auth.uid).get();
  const callerRole = callerDoc.data()?.role;
  if (callerRole !== "captain" && callerRole !== "core") {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission.");
  }
  const { collectionName, docId } = data;
  if (!collectionName || !docId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required data.");
  }
  try {
    await db.collection(collectionName).doc(docId).delete();
    return { success: true, message: "Document deleted successfully." };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new functions.https.HttpsError("internal", "Could not delete document.");
  }
});


// --- FUNCTION TO SEND ANNOUNCEMENT EMAILS ---
export const sendAnnouncementEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection("users").doc(callerUid).get();
  const callerRole = callerDoc.data()?.role;

  if (callerRole !== "captain" && callerRole !== "core") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only a captain or core member can send announcements.",
    );
  }

  const { title, content } = data;
  if (!title || !content) {
    throw new functions.https.HttpsError(
      "invalid-argument", "Function requires 'title' and 'content'.",
    );
  }

  try {
    const usersSnapshot = await db.collection("users").get();
    const recipientEmails = usersSnapshot.docs.map((doc) => doc.data().email);

    if (recipientEmails.length === 0) {
      return { success: true, message: "No members to email." };
    }

    const mailOptions = {
      from: `"SJECAero Announcements" <${gmailEmail}>`,
      to: gmailEmail,
      bcc: recipientEmails,
      subject: `SJECAero Announcement: ${title}`,
      html: `
        <h1>${title}</h1>
        <p>${content.replace(/\n/g, "<br>")}</p>
        <br>
        <p>You can view this and other announcements on your dashboard.</p>
        <p>Regards,<br>SJECAero Core Team</p>
      `,
    };

    await mailTransport.sendMail(mailOptions);
    return { success: true, message: `Email sent to ${recipientEmails.length} members.` };
  } catch (error) {
    console.error("Error sending announcement email:", error);
    throw new functions.https.HttpsError(
      "internal", "An error occurred while sending emails.",
    );
  }
});

// --- FUNCTION TO REMOVE A USER ---
interface RemoveUserData {
  uidToRemove: string;
  emailToRemove: string;
  reason: string;
}

export const removeUser = functions.https.onCall(
  async (data: RemoveUserData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    const callerUid = context.auth.uid;
    const callerDoc = await db.collection("users").doc(callerUid).get();
    const callerRole = callerDoc.data()?.role;

    if (callerRole !== "captain") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only a captain can perform this action.",
      );
    }

    const { uidToRemove, emailToRemove, reason } = data;

    try {
      await auth.deleteUser(uidToRemove);
      await db.collection("users").doc(uidToRemove).delete();

      const memberQuery = await db.collection("members")
        .where("email", "==", emailToRemove).get();
      const batch = db.batch();
      memberQuery.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      const mailOptions = {
        from: `"SJECAero Admin" <${gmailEmail}>`,
        to: emailToRemove,
        subject: "Update regarding your SJECAero Membership",
        text: "Hello,\n\nThis email is to inform you that your account " +
          "has been removed from the SJECAero members portal.\n\n" +
          `Reason provided: "${reason}"\n\nIf you believe this is a ` +
          "mistake, please contact the club captain.\n\nThank you,\n" +
          "SJECAero Core Team",
      };

      await mailTransport.sendMail(mailOptions);
      console.log(`Removal email sent to ${emailToRemove}`);

      return {
        success: true,
        message: `User ${emailToRemove} has been removed and notified.`,
      };
    } catch (error) {
      console.error("Error removing user:", error);
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while removing the user.",
      );
    }
  },
);
