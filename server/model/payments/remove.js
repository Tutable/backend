import { Paymentschema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentModel = database.model('Payments', Paymentschema);
/**
 * microservice to remove the card for the specified user
 * the user data will be passed via controller
 * @see https://stripe.com/docs/api#delete_card
 * @param {String} id
 * @param {String} email
 */
export default ({ id, email }) => new Promise(async (resolve, reject) => {
	if (id && email) {
		const paymentSource = await PaymentModel.findOne({ ref: id });
		console.log(paymentSource)
		if (paymentSource) {
			const {
				_doc: {
					stripeId,
					defaultSource,
				},
			} = paymentSource;
			StripeServices.RemoveCard({
				customerId: stripeId,
				cardId: defaultSource,
			}).then(async (success) => {
				// console.log(success);
				// remove the payment object
				await PaymentModel.remove({ ref: id });
				resolve(ResponseUtility.SUCCESS);
			}).catch(err => reject(err));
		} else {
			reject(ResponseUtility.ERROR({ message: 'No card to delete.' }));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
