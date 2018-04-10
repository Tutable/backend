import { StudentControllers, AuthenticationControllers } from '../controllers';
import { CompressionServices, PassportServices } from '../services';

const prefix = '/api/student/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}register`, CompressionServices, StudentControllers.register);
	app.post(`${prefix}verify`, StudentControllers.verify);
	app.post(`${prefix}login`, PassportServices.StudentLoginHandler);
	app.post(`${prefix}token`, StudentControllers.token);
	app.post(`${prefix}studentDetails`, AuthenticationControllers.authenticateStudent, StudentControllers.details);
	app.post(`${prefix}details`, StudentControllers.details);
	app.post(`${prefix}changePassword`, StudentControllers.password);
	app.post(`${prefix}update`, AuthenticationControllers.authenticateStudent, CompressionServices, StudentControllers.update);
	app.post(`${prefix}social`, StudentControllers.socialLogin);
	app.post(`${prefix}resetNotifiations`, AuthenticationControllers.authenticateStudent, StudentControllers.resetNotifications);

	app.get(`${prefix}asset/:bucket/:userType/:folder/:asset`, StudentControllers.asset);
};
