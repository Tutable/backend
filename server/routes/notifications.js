import { NotificationsControllers, AuthenticationControllers } from '../controllers';
// import { CompressionServices } from '../services';

const prefix = '/api/notifications/';
/**
 * routes descriptor for notifications
 * @author gaurav sharma
 * @since 9th April 2018
 */
export default (app) => {
	app.post(`${prefix}details`, AuthenticationControllers.authenticateGlobalEntity, NotificationsControllers.details);
};
