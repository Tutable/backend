import { TeacherControllers } from '../controllers';
import { CompressionServices } from '../services';

const prefix = '/api/teachers/';

/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}register`, CompressionServices, TeacherControllers.register);
	app.post(`${prefix}verify`, TeacherControllers.verify);
};
