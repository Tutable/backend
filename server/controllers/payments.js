import { PaymentsServices } from '../model';
import commonResolver from './commonResolver';
/**
 * the payments controller for the application
 */
export default {
	create: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsCreateService),
	remove: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsRemoveService),
	createBankAccount: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsCreateBankService),
	updateBank: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsUpdateBankService),
	token: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsTokenService),
	list: (req, res) => commonResolver(req, res, PaymentsServices.PaymentsListService),
};
