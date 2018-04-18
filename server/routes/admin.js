import { AdminControllers, AuthenticationControllers } from '../controllers';

const prefix = '/api/admin/';
/**
 * routes related to the admin user
 */
export default (app) => {
	app.post(`${prefix}authenticate`, AdminControllers.authenticate);
	app.post(`${prefix}update`, AuthenticationControllers.authenticateAdmin, AdminControllers.update);
	app.post(`${prefix}verify`, AuthenticationControllers.authenticateAdmin, AdminControllers.verify);
};
