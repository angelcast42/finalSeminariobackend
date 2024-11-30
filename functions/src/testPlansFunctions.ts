import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

const firestore = admin.firestore();
const corsHandler = cors({ origin: true });
export const createTestPlan = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
    try {
        const { proyectoId, nombrePlan, escenarios } = req.body;

        if (!proyectoId || !nombrePlan || !escenarios) {
            res.status(400).json({
                error: "El ID del proyecto y el nombre del plan son requeridos.",
            });
            return;
        }

        const planData = {
            proyectoId,
            nombrePlan,
            escenarios, 
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await firestore.collection("planesPruebas").add(planData);

        res.status(201).json({
            message: "Plan de pruebas creado exitosamente.",
            planId: docRef.id,
        });
    } catch (error) {
        console.error("Error al crear el plan de pruebas:", error);
        res.status(500).json({
            error: "Ocurrió un error al crear el plan de pruebas.",
        });
        }
    });
});
export const addScenarioToTestPlan = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
    try {
        const { planId, escenario } = req.body;

        if (!planId || !escenario || !escenario.nombre || !escenario.descripcion) {
            res.status(400).json({
                error: "El ID del plan, el nombre y la descripción del escenario son requeridos.",
            });
            return;
        }

        const planRef = firestore.collection("planesPruebas").doc(planId);

        const newEscenario = {
            id: admin.firestore.FieldValue.serverTimestamp(), 
            ...escenario,
            casosPrueba: escenario.casosPrueba || [],
        };

        await planRef.update({
            escenarios: admin.firestore.FieldValue.arrayUnion(newEscenario),
        });

        res.status(200).json({
            message: "Escenario agregado exitosamente al plan de pruebas.",
        });
    } catch (error) {
        console.error("Error al agregar el escenario:", error);
        res.status(500).json({
            error: "Ocurrió un error al agregar el escenario.",
        });
        }
    });
});
export const addTestCaseToScenario = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
    try {
        const { planId, escenarioId, casoPrueba } = req.body;

        if (
            !planId ||
            !escenarioId ||
            !casoPrueba ||
            !casoPrueba.nombre ||
            !casoPrueba.descripcion
        ) {
            res.status(400).json({
                error:
                    "El ID del plan, el ID del escenario, el nombre y la descripción del caso de prueba son requeridos.",
            });
            return;
        }

        const planRef = firestore.collection("planesPruebas").doc(planId);
        const planDoc = await planRef.get();

        if (!planDoc.exists) {
            res.status(404).json({
                error: "El plan de pruebas no existe.",
            });
            return;
        }

        const planData = planDoc.data();
        const escenarios = planData?.escenarios || [];

        const updatedEscenarios = escenarios.map((escenario: any) => {
            if (escenario.id === escenarioId) {
                return {
                    ...escenario,
                    casosPrueba: [
                        ...(escenario.casosPrueba || []),
                        {
                            id: admin.firestore.FieldValue.serverTimestamp(),
                            ...casoPrueba,
                            datosPrueba: casoPrueba.datosPrueba || [],
                            criteriosAceptacion: casoPrueba.criteriosAceptacion || [],
                        },
                    ],
                };
            }
            return escenario;
        });

        await planRef.update({ escenarios: updatedEscenarios });

        res.status(200).json({
            message: "Caso de prueba agregado exitosamente al escenario.",
        });
    } catch (error) {
        console.error("Error al agregar el caso de prueba:", error);
        res.status(500).json({
            error: "Ocurrió un error al agregar el caso de prueba.",
        });
        }
    });
});
export const getTestPlanById = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
    try {
        const { id } = req.body;

        if (!id) {
            res.status(400).json({
                error: "El ID del plan de pruebas es requerido.",
            });
            return;
        }

        const planDoc = await firestore.collection("planesPruebas").doc(id as string).get();

        if (!planDoc.exists) {
            res.status(404).json({
                error: "El plan de pruebas no existe.",
            });
            return;
        }

        res.status(200).json({
            message: "Plan de pruebas obtenido exitosamente.",
            data: planDoc.data(),
        });
    } catch (error) {
        console.error("Error al obtener el plan de pruebas:", error);
        res.status(500).json({
            error: "Ocurrió un error al obtener el plan de pruebas.",
        });
        }
    });
});

export const getAllTestPlans = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {

    try {
        const snapshot = await firestore.collection("planesPruebas").get();

        if (snapshot.empty) {
            res.status(404).json({
                error: "No se encontraron planes de pruebas.",
            });
            return;
        }

        const testPlans = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            message: "Planes de pruebas obtenidos exitosamente.",
            data: testPlans,
        });
    } catch (error) {
        console.error("Error al obtener los planes de pruebas:", error);
        res.status(500).json({
            error: "Ocurrió un error al obtener los planes de pruebas.",
        });
        }
    });
});d
export const getTestPlansByProjectId = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {

    try {
        const { proyectoId } = req.query;

        if (!proyectoId) {
            res.status(400).json({
                error: "El ID del proyecto es requerido.",
            });
            return;
        }

        const snapshot = await firestore
            .collection("planesPruebas")
            .where("proyectoId", "==", proyectoId)
            .get();

        if (snapshot.empty) {
            res.status(404).json({
                error: `No se encontraron planes de pruebas para el proyecto con ID ${proyectoId}.`,
            });
            return;
        }

        const testPlans = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json({
            message: `Planes de pruebas obtenidos exitosamente para el proyecto ${proyectoId}.`,
            data: testPlans,
        });
    } catch (error) {
        console.error("Error al obtener los planes de pruebas para el proyecto:", error);
        res.status(500).json({
            error: "Ocurrió un error al obtener los planes de pruebas para el proyecto.",
        });
        }
    });
});


