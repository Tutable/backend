import { ReviewsControllers, AuthenticationControllers } from '../controllers';
// import { CompressionServices } from '../services';

const prefix = '/api/reviews/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateTeacher, ReviewsControllers.create);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateGlobalEntity, ReviewsControllers.list);
};
