import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";


const auth = admin.auth();
const firestore = admin.firestore();
const corsHandler = cors({ origin: true });

export const deleteUser = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { uid } = req.body; // UID del usuario a eliminar

            if (!uid) {
                res.status(400).json({ error: "El UID del usuario es requerido." });
                return;
            }

            // Eliminar el documento del usuario en Firestore
            await firestore.collection("users").doc(uid).delete();

            // Eliminar al usuario de Firebase Authentication
            await auth.deleteUser(uid);

            res.status(200).json({ message: "Usuario eliminado exitosamente." });
        } catch (error: any) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).json({
                error: "Ocurrió un error al eliminar el usuario.",
            });
        }
    });
});
/**
 * Editar la información de un usuario en la colección "users".
 */
export const editUser = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { uid, ...updates } = req.body; // UID del usuario y datos a actualizar

            if (!uid) {
                res.status(400).json({ error: "El UID del usuario es requerido." });
                return;
            }

            // Verifica si el documento existe antes de actualizar
            const userDoc = await firestore.collection("users").doc(uid).get();
            if (!userDoc.exists) {
                res.status(404).json({ error: "El usuario no existe en la colección." });
                return;
            }

            // Actualizar el documento del usuario en Firestore
            await firestore.collection("users").doc(uid).update(updates);

            // Actualizar información en Firebase Authentication (si corresponde)
            if (updates.email || updates.displayName) {
                const updateAuthData: Partial<admin.auth.UpdateRequest> = {};
                if (updates.email) updateAuthData.email = updates.email;
                if (updates.displayName) updateAuthData.displayName = updates.displayName;

                await auth.updateUser(uid, updateAuthData);
            }

            res.status(200).json({ message: "Usuario actualizado exitosamente." });
        } catch (error: any) {
            console.error("Error al actualizar el usuario:", error);
            res.status(500).json({
                error: "Ocurrió un error al actualizar el usuario.",
            });
        }
    });
});
