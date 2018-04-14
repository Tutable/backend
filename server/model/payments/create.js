import { PaymentSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentModel = database.model('Payments', PaymentSchema);
/**
 * Handles the creation of new stripe user or returning the existing
 * user if it already exists. This API will be called when a
 * user enters the payment details
 * @param {String} id of the user, to be injected by the controller
 * @param {String} email of the user, to be injected by the controller
 * @param {String} cardToken the token reresenting the card detils
 * @param {String} bankToken the token representing the bank account
 */
export default ({
	id,
	email,
	card,
}) => new Promise(async (resolve, reject) => {
	if (id && card) {
		const payment = await PaymentModel.findOne({ ref: id }, { __v: 0 });
		if (payment) {
			// the payment method is defined
			// return the data as it is.
			return resolve(payment._doc);
		}
		StripeServices.CreateUser({
			email,
			id,
			card,
		})
			.then(({ altered, raw }) => {
				// save the details in payment database
				const paymentData = new PaymentModel({
					ref: id,
					stripeId: altered.id,
					defaultSource: altered.default_source,
					deleted: false,
					stripeCustomer: raw,
				});
				paymentData.save()
					.then(customer => resolve(ResponseUtility.SUCCESS_DATA(customer)))
					.catch((err) => {
						/**
						 * @todo handle errors
						 */
						reject(err);
					});
			})
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
