import { CategoriesControllers, AuthenticationControllers } from '../controllers';
// import { CompressionServices } from '../services';

const prefix = '/api/categories/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 31st March 2018
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateTeacher, CategoriesControllers.create);
	app.post(`${prefix}details`, CategoriesControllers.details);
	app.post(`${prefix}list`, CategoriesControllers.list);
};
