import {
	PaymentSchema,
	TransactionsSchema,
	BookingSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentModel = database.model('Payments', PaymentSchema);
const BookingModel = database.model('Bookings', BookingSchema);
const TransactionsModel = database.model('Transactions', TransactionsSchema);
/**
 * handle a payment transaction
 * The process will be done like this.
 * - Transfer the amount from the user credit card to stripe
 * account.
 * - Add the transaction entry in the database
 * - Transfer it to teacher account. We can parse th
 * @author gaurav sharma
 * @since 12th April 2018
 */
export default ({
	id,
	bookingId,
	amount,
	from,
	to,
	classDate,
}) => new Promise(async (resolve, reject) => {
	if (id && bookingId && from && to && classDate && amount) {
		const query = { _id: bookingId };
		const booking = await BookingModel.findOne(query);
		if (!booking) {
			return reject(ResponseUtility.ERROR({ message: 'No booking found' }));
		}
		const { by, teacher, ref } = booking;
		// fetch the stripe payment source from payment model
		const payment = await PaymentModel.findOne({ ref: by });
		if (!payment) {
			return reject(ResponseUtility.ERROR({ messsage: 'Payment method not provided. Cannot continue booking.' }));
		}
		const { defaultSource, stripeId, stripeCustomr } = payment;

		const payoutDue = Number(classDate) + (7 * 86400000);	// seven days after the class
		StripeServices.CreatePayment({
			amount: amount * 100,
			currency: 'AUD',
			customer: stripeId,
			source: defaultSource,
			description: `Payment for class ${ref} by ${by} to ${teacher}`,
		})
			.then((charge) => {
				const { id, status } = charge;
				/**
				 * @todo persist the transaction details
				 */
				const transactionDetails = new TransactionsModel({
					bookingId,
					stripeChargeId: id,
					amount,
					status,
					from,
					to,
					payoutDue,
					payoutDone: false,	// will be done after the class is completed
					stripeChargeResponse: charge,
				});
				transactionDetails.save()
					.then(() => resolve(ResponseUtility.SUCCESS))
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving transaction data', error: err })));
			})
			.catch((err) => {
				/**
				 * @todo handle transaction delined issues
				 */
				reject(err);
			});

	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
