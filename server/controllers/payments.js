import { PaymentsServices } from '../model';
import commonResolver from './commonResolver';
/**
 * the payments controller for the application
 */
export default {
	create: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsCreateService),
	// pay: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsPayServices),
	token: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsTokenService),
};
