import {
	AuthenticationControllers,
	PaymentsControllers,
} from '../controllers';

const prefix = '/api/payments/';
/**
 * The payments routes for the application
 */
export default (app) => {
	app.post(`${prefix}token`, AuthenticationControllers.authenticateTeacher, PaymentsControllers.token);
	app.post(`${prefix}create`, AuthenticationControllers.authenticateGlobalEntity, PaymentsControllers.create);
	app.post(`${prefix}createBankAccount`, AuthenticationControllers.authenticateTeacher, PaymentsControllers.createBankAccount);
};
