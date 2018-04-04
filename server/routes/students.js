import { StudentControllers, AuthenticationControllers } from '../controllers';
import { CompressionServices } from '../services';

const prefix = '/api/student/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}register`, CompressionServices, StudentControllers.register);
	app.post(`${prefix}verify`, StudentControllers.verify);
	app.post(`${prefix}token`, StudentControllers.token);
};
