import { PaymentsServices } from '../model';
import commonResolver from './commonResolver';
/**
 * the payments controller for the application
 */
export default {
	pay: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsCreateService),
};
