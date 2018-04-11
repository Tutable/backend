import { PaymentsControllers } from '../controllers';

const prefix = '/api/payments/';
/**
 * The payments routes for the application
 */
export default (app) => {
	app.post(`${prefix}pay`, PaymentsControllers.pay);
};
