import { ClassControllers, AuthenticationControllers } from '../controllers';
import { CompressionServices } from '../services';

const prefix = '/api/class/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateTeacher, CompressionServices, ClassControllers.create);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateGlobalEntity, ClassControllers.details);

	app.get(`${prefix}assets/:bucket/:userType/:folder/:asset`, ClassControllers.assets);
};
