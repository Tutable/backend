import { BookingsControllers, AuthenticationControllers } from '../controllers';
// import { CompressionServices } from '../services';

const prefix = '/api/bookings/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 31st March 2018
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateStudent, BookingsControllers.create);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateGlobalEntity, BookingsControllers.details);
	// only a teacher can perform confirm/reject actions on a booking.
	app.post(`${prefix}action`, AuthenticationControllers.authenticateTeacher, BookingsControllers.action);
	app.post(`${prefix}cancel`, AuthenticationControllers.authenticateGlobalEntity, BookingsControllers.cancel);
	// app.post(`${prefix}list`, CategoriesControllers.list);
};
