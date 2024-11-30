import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

const firestore = admin.firestore();
const corsHandler = cors({ origin: true });

export const createProject = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { nombre, descripcion, fechaInicio, fechaFin, estado, encargado, equipo, hitos } =
                req.body;

            if (!nombre || !descripcion || !fechaInicio || !fechaFin || !estado || !encargado) {
                res.status(400).json({ error: "Todos los campos obligatorios deben ser enviados." });
                return;
            }

            const validStates = ["En Proceso", "Cancelado", "Finalizado"];
            if (!validStates.includes(estado)) {
                res.status(400).json({ error: "El estado del proyecto no es válido." });
                return;
            }

            if (hitos && !Array.isArray(hitos)) {
                res.status(400).json({ error: "Hitos debe ser un arreglo válido." });
                return;
            }

            const newProject = {
                nombre,
                descripcion,
                fechaInicio,
                fechaFin,
                estado,
                encargado,
                equipo: equipo || [],
                hitos: hitos || [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            const projectRef = await firestore.collection("proyectos").add(newProject);

            res.status(201).json({
                message: "Proyecto creado exitosamente.",
                id: projectRef.id,
            });
        } catch (error) {
            console.error("Error al crear el proyecto:", error);
            res.status(500).json({ error: "Ocurrió un error al crear el proyecto." });
        }
    });
});
export const editProject = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { id, ...updates } = req.body;

            if (!id) {
                res.status(400).json({ error: "El ID del proyecto es obligatorio." });
                return;
            }

            // Verificar si el documento existe
            const projectRef = firestore.collection("proyectos").doc(id);
            const projectDoc = await projectRef.get();
            if (!projectDoc.exists) {
                res.status(404).json({ error: "El proyecto no existe." });
                return;
            }

            // Actualizar documento
            await projectRef.update({
                ...updates,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(200).json({ message: "Proyecto actualizado exitosamente." });
        } catch (error) {
            console.error("Error al actualizar el proyecto:", error);
            res.status(500).json({ error: "Ocurrió un error al actualizar el proyecto." });
        }
    });
});
export const getProjects = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const projectsSnapshot = await firestore.collection("proyectos").get();

            if (projectsSnapshot.empty) {
                res.status(404).json({ error: "No se encontraron proyectos." });
                return;
            }

            const projects = projectsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.status(200).json({
                message: "Proyectos obtenidos exitosamente.",
                data: projects,
            });
        } catch (error) {
            console.error("Error al obtener los proyectos:", error);
            res.status(500).json({ error: "Ocurrió un error al obtener los proyectos." });
        }
    });
});
export const getProjectById = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
    try {
        const { id } = req.body; 

        if (!id || typeof id !== "string") {
            res.status(400).json({
                error: "El ID del proyecto es requerido y debe ser un string válido.",
            });
            return;
        }

        const projectDoc = await firestore.collection("proyectos").doc(id).get();

        if (!projectDoc.exists) {
            res.status(404).json({
                error: "No se encontró el proyecto con el ID proporcionado.",
            });
            return;
        }

        res.status(200).json({
            message: "Proyecto obtenido exitosamente.",
            data: projectDoc.data(),
        });
    } catch (error) {
        console.error("Error al obtener el proyecto:", error);
        res.status(500).json({
            error: "Ocurrió un error al obtener el proyecto.",
        });
        }
    });
});