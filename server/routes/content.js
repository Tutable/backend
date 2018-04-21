import { ContentControllers, AuthenticationControllers } from '../controllers';

const prefix = '/api/content/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 21st April 2018
 */
export default (app) => {
	app.post(`${prefix}save`, AuthenticationControllers.authenticateAdmin, ContentControllers.save);
	app.post(`${prefix}details`, ContentControllers.details);
};
