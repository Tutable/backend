import {
	AuthenticationControllers,
	PaymentsControllers,
} from '../controllers';

const prefix = '/api/payments/';
/**
 * The payments routes for the application
 */
export default (app) => {
	// app.post(`${prefix}pay`, PaymentsControllers.pay),
	app.post(`${prefix}create`, AuthenticationControllers.authenticateGlobalEntity, PaymentsControllers.create);
};
