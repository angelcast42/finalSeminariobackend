import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";
import { CreateUserRequest } from "./models/Iuser";

admin.initializeApp(); 

const auth = admin.auth();
const firestore = admin.firestore();
const corsHandler = cors({ origin: true });
/**
 * Crear un nuevo usuario con correo y contraseña y agregar un documento en Firestore.
 */
export const createUser = functions.https.onRequest(async (req, res): Promise<void> => {
    corsHandler(req, res, async () => {
        try {
            const { email, password, nombre, apellido, rol, estado }: CreateUserRequest = req.body;

            if (!email || !password || !nombre || !apellido || !rol || estado === undefined) {
                res.status(400).json({
                    error: "Todos los campos son requeridos: email, password, nombre, apellido, rol, estado.",
                });
                return;
            }

            // Crear el usuario en Firebase Authentication
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: `${nombre} ${apellido}`,
            });

            // Agregar el documento del usuario en Firestore
            await firestore.collection("users").doc(userRecord.uid).set({
                uid: userRecord.uid,
                nombre,
                apellido,
                rol,
                estado,
                email
            });

            res.status(201).json({ message: "Usuario creado exitosamente", uid: userRecord.uid });
        } catch (error: any) {
            console.error("Error al crear el usuario:", error);
            res.status(500).json({ error: "Ocurrió un error al crear el usuario." });
        }
    })
});

/**
 * Desactivar un usuario
 */
export const deactivateUser = functions.https.onRequest(async (req, res): Promise<void> => {
    corsHandler(req, res, async () => {

        try {
            const { uid } = req.body;

            if (!uid) {
                res.status(400).json({
                    error: "El UID del usuario es requerido.",
                });
                return;
            }

            // Desactivar el usuario en Firebase Authentication
            await auth.updateUser(uid, { disabled: true });

            // Actualizar el estado en Firestore
            await firestore.collection("users").doc(uid).update({
                estado: false,
            });

            res.status(200).json({ message: "Usuario desactivado exitosamente." });
        } catch (error: any) {
            console.error("Error al desactivar el usuario:", error);
            res.status(500).json({ error: "Ocurrió un error al desactivar el usuario." });
        }
    })
});

/**
 * Reactivar un usuario
 */
export const reactivateUser = functions.https.onRequest(async (req, res): Promise<void> => {
    corsHandler(req, res, async () => {

        try {
            const { uid } = req.body;

            if (!uid) {
                res.status(400).json({
                    error: "El UID del usuario es requerido.",
                });
                return;
            }

            // Reactivar el usuario en Firebase Authentication
            await auth.updateUser(uid, { disabled: false });

            // Actualizar el estado en Firestore
            await firestore.collection("users").doc(uid).update({
                estado: true,
            });

            res.status(200).json({ message: "Usuario reactivado exitosamente." });
        } catch (error: any) {
            console.error("Error al reactivar el usuario:", error);
            res.status(500).json({ error: "Ocurrió un error al reactivar el usuario." });
        }
    })
});
export const getUserInfo = functions.https.onRequest(async (req, res): Promise<void> => {
    corsHandler(req, res, async () => {

        try {
            const { uid } = req.body; 

            if (!uid) {
                res.status(400).json({
                    error: "El UID del usuario es requerido.",
                });
                return;
            }

            const userDoc = await firestore.collection("users").doc(uid).get();

            if (!userDoc.exists) {
                res.status(404).json({
                    error: "No se encontró información del usuario con el UID proporcionado.",
                });
                return;
            }

            res.status(200).json({
                message: "Información del usuario obtenida exitosamente.",
                data: userDoc.data(),
            });
        } catch (error: any) {
            console.error("Error al obtener la información del usuario:", error);
            res.status(500).json({
                error: "Ocurrió un error al obtener la información del usuario.",
            });
        }
    })
});
export const getAllUsers = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const usersSnapshot = await firestore.collection("users").get();

            if (usersSnapshot.empty) {
                res.status(404).json({
                    error: "No se encontraron usuarios en la colección.",
                });
                return;
            }

            const users = usersSnapshot.docs.map((doc) => ({
                id: doc.id, // ID del documento
                ...doc.data(), // Datos del documento
            }));

            res.status(200).json({
                message: "Usuarios obtenidos exitosamente.",
                data: users,
            });
        } catch (error: any) {
            console.error("Error al obtener el listado de usuarios:", error);
            res.status(500).json({
                error: "Ocurrió un error al obtener el listado de usuarios.",
            });
        }
    });
});