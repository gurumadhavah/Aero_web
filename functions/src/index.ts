import { https } from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize the admin app lazily
let app: admin.app.App;

const ensureIsAdmin = async (context: https.CallableContext) => {
  if (!app) app = admin.initializeApp();
  const db = admin.firestore();

  if (!context.auth) {
    throw new https.HttpsError("unauthenticated", "Auth is required to perform this action.");
  }
  const callerDoc = await db.collection("users").doc(context.auth.uid).get();
  const callerRole = callerDoc.data()?.role;
  if (callerRole !== "captain" && callerRole !== "core") {
    throw new https.HttpsError("permission-denied", "You do not have the required permissions.");
  }
};

// This function is no longer needed as the client handles announcements.
// You can leave it as a secured placeholder or remove it.
export const sendAnnouncementEmail = https.onCall(async (data, context) => {
    await ensureIsAdmin(context);
    console.log("Client-side announcement triggered.");
    return { success: true, message: "Client handles email sending." };
});

// User removal logic remains, but without email sending.
export const removeUserHTTP = https.onRequest(async (req, res) => {
    // Basic CORS for browsers
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }

    if (!app) app = admin.initializeApp();
    const db = admin.firestore();
    const auth = admin.auth();

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
        res.status(401).json({ success: false, message: "Unauthorized: No token provided." });
        return;
    }
    
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const callerDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (callerDoc.data()?.role !== "captain") {
            res.status(403).json({ success: false, message: "Permission denied." });
            return;
        }

        const { uidToRemove, emailToRemove } = req.body;
        if (!emailToRemove) {
             res.status(400).json({ success: false, message: "Email to remove is required." });
             return;
        }

        await db.collection("members").doc(emailToRemove).delete();
        await db.collection("team").doc(emailToRemove).delete();
        if (uidToRemove) {
            await auth.deleteUser(uidToRemove);
            await db.collection("users").doc(uidToRemove).delete();
        }
        
        // Email logic is now handled on the frontend.
        
        res.status(200).json({ success: true, message: `Member ${emailToRemove} has been removed.` });
    } catch (error) {
        console.error("Error removing user:", error);
        res.status(500).json({ success: false, message: "An internal error occurred." });
    }
});

// These functions are no longer needed, as the client handles all logic
// except for saving the initial data. You can remove them or leave them empty.

export const processRecruitment = https.onCall(() => {
    throw new https.HttpsError("unimplemented", "This function is deprecated. Client handles logic.");
});

export const replyToContactMessage = https.onCall(() => {
    throw new https.HttpsError("unimplemented", "This function is deprecated. Client handles logic.");
});