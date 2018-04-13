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
 * @param {String} token of the card details to create a new user with.
 */
export default ({
	id,
	email,
	token,
}) => new Promise(async (resolve, reject) => {
	if (id && token && email) {
		const payment = await PaymentModel.findOne({ ref: id }, { __v: 0 });
		if (payment) {
			// the payment method is defined
			// return the data as it is...
			return resolve(payment._doc);
		}
		StripeServices.CreateUser({ email, card: token })
			.then((customer) => {
				// save the details in payment database
				const paymentData = new PaymentModel({
					ref: id,
					stripeId: customer.id,
					defaultSource: customer.default_source,
					deleted: false,
					stripeCustomer: customer,
				});
				paymentData.save()
					.then(() => resolve(ResponseUtility.SUCCESS_DATA(customer)))
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
