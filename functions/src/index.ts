
import { createUser, deactivateUser, reactivateUser, getUserInfo, getAllUsers } from "./authFunctions";
import { deleteUser, editUser } from "./users";
import { createProject, editProject, getProjects, getProjectById } from "./projectsFunctions";
import { createTestPlan, addScenarioToTestPlan, addTestCaseToScenario, getTestPlanById, getAllTestPlans, getTestPlansByProjectId } from "./testPlansFunctions";

 //Start writing functions
 //https://firebase.google.com/docs/functions/typescript

exports.createUser = createUser;
exports.deactivateUser = deactivateUser;
exports.reactivateUser = reactivateUser;
exports.getUserInfo = getUserInfo;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;
exports.editUser = editUser;
exports.createProject = createProject;
exports.editProject = editProject;
exports.getProjects = getProjects;
exports.getProjectById = getProjectById;
exports.createTestPlan = createTestPlan;
exports.addScenarioToTestPlan = addScenarioToTestPlan;
exports.addTestCaseToScenario = addTestCaseToScenario;
exports.getTestPlanById = getTestPlanById;
exports.getAllTestPlans = getAllTestPlans;
exports.getTestPlansByProjectId = getTestPlansByProjectId;


