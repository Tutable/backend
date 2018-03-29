import { TeacherControllers, AuthenticationControllers } from '../controllers';
import { CompressionServices, PassportServices } from '../services';

const prefix = '/api/teachers/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}register`, CompressionServices, TeacherControllers.register);
	app.post(`${prefix}verify`, TeacherControllers.verify);
	app.post(`${prefix}login`, PassportServices.TeacherLoginHandler);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateTeacher, TeacherControllers.details);
	app.post(`${prefix}update`, AuthenticationControllers.authenticateTeacher, CompressionServices, TeacherControllers.update);
	app.post(`${prefix}resendVerification`, TeacherControllers.resendVerifiation);
	app.post(`${prefix}passwordToken`, TeacherControllers.passwordToken);
	app.post(`${prefix}changePassword`, TeacherControllers.changePassword);

	app.get(`${prefix}assets/:bucket/:userType/:folder/:asset`, TeacherControllers.assets);
};
