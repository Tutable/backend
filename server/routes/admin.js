import { AdminControllers } from '../controllers';

const prefix = '/api/admin/';
/**
 * routes related to the admin user
 */
export default (app) => {
	app.post(`${prefix}authenticate`, AdminControllers.authenticate);
};
