import {
	TransactionsSchema,
	PaymentsSchema,
} from '../schemas';
import database from '../../db';
import { StripeServices } from '../../services';
import { ResponseUtility } from '../../utility';

const TransactionsModel = database.model('Transactions', TransactionsSchema);
const PaymentsModel = database.model('Payments', PaymentsSchema);

/**
 * trigger the payout for a transaction
 * The payout will be triggered the next day after
 * the class
 * @author gaurav sharma
 * @since 13th April 2018
 *
 * @param {String} id is the transaction id of the user.
 */
export default ({ id }) => new Promise((resolve, reject) => {
	if (id) {
		const query = { $and: [{ _id: id }, { payoutDone: false }] };
		TransactionsModel.findOne(query, { __v: 0 })
			.then(async (transaction) => {
				if (transaction) {
					const {
						_doc: {
							bookingId,
							stripeChargeId,
							amount,
							status,
							from,
							to,
							payoutDue,
						},
					} = transaction;
					// fethc the teacher bank details
					const payments = await PaymentsModel.findOne({ ref: to });
					if (!payments) {
						return reject(ResponseUtility.ERROR({ message: 'No payment source defined.' }));
					}
					const { stripeId, defaultSource } = payments;
					StripeServices.HandlePayout({
						amount: amount * 100,
						description: `Payment by ${from} to teacher ${to} for bookking $${bookingId}`,
						destination: stripeId,
					}).then((success) => {
						console.log(success);
						/**
						 * @todo mark the necessary flags in database
						 */
						resolve(success);
					}).catch((err) => {
						reject(err);
					});
					// resolve(ResponseUtility.SUCCESS);
				} else {
					reject(ResponseUtility.ERROR({ message: 'No transaction found.' }));
				}
			}).catch((err) => {
				reject(ResponseUtility.ERROR({ message: '', error: err }));
			});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
