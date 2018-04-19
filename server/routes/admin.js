import { AdminControllers, AuthenticationControllers } from '../controllers';

const prefix = '/api/admin/';
/**
 * routes related to the admin user
 */
export default (app) => {
	app.post(`${prefix}authenticate`, AdminControllers.authenticate);
	app.post(`${prefix}update`, AuthenticationControllers.authenticateAdmin, AdminControllers.update);
	app.post(`${prefix}verify`, AuthenticationControllers.authenticateAdmin, AdminControllers.verify);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateAdmin, AdminControllers.delete);
	app.post(`${prefix}classUpdate`, AuthenticationControllers.authenticateAdmin, AdminControllers.classUpdate);
};
