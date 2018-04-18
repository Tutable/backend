import {
	BookingsSchema,
	ClassSchema,
	TransactionsSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { DEDUCTIONS } from '../../constants';
import { StripeServices } from '../../services';

const BookingsModel = database.model('Bookings', BookingsSchema);
const TransactionsModel = database.model('Transactions', TransactionsSchema);
const ClassModel = database.model('Class', ClassSchema);
/**
 * microservice to handle the cacellation proess of the
 * booking. Both the teacher and student can cancel the bookings
 * If a student cancels a class within 24 hours, there will be 20% deduction and rest of the
 * amount will be refunded back to the student otherwise, full amount will be refunded.
 * If a teacher cancels the class, there would be full amount refund.
 * @author gaurav sharma
 * @since 16th April 2018
 * @param {String} id
 * @param {String} bookingId
 */
export default ({ id, bookingId }) => new Promise(async (resolve, reject) => {
	if (id && bookingId) {
		// only the clasess that have been confirmed could be cancelled
		const classPopulation = { path: 'classDetails', model: ClassModel, select: 'name rate' };
		const query = { $and: [{ _id: bookingId }, { $or: [{ by: id }, { teacher: id }] }, { confirmed: true }] };
		const booking  = await BookingsModel.findOne(query).populate(classPopulation);
		if (!booking) {
			return reject(ResponseUtility.ERROR({ message: 'No booking found.' }));
		}

		// set the booking status from confirmed to cancelled
		await BookingsModel.update(query, { confirmed: false, cancelled: true, cancellationTimestamp: Date.now() });
		let deductedAmount;
		if (id === booking._doc.by) {
			const {
				$$populatedVirtuals: {
					classDetails: {
						rate,
					},
				},
			} = booking;
			// booking is by student
			// cancellation request by student
			// if class is within 24 hours, refund with 20% deductions
			// otherwise refund all
			const day = Object.keys(booking._doc.slot)[0];
			const date = new Date(Number(day));
			// console.log((booking._doc.slot[day]).split('-')[0]);
			date.setHours(Number(booking._doc.slot[day].split('-')[0]));

			if (Date.now() + 86400000 >= date.getTime()) {
				// within 24 hours
				// make 20% deductions to the rate chanrged for class
				// console.log('cancel with 20% deduction');
				deductedAmount = Math.ceil((DEDUCTIONS / 100) * rate);
			}
		}
		/**
		 * @todo fetch the charge id from the Transactions schema
		 * using the booking id
		 */
		// const { _doc: { stripeChargeResponse } } = await TransactionsModel({ bookingId });
		// const response = await TransactionsModel.findOne()({ bookingId });
		// console.log(response);
		const { _doc: { stripeChargeResponse } } = await TransactionsModel.findOne({ bookingId });
		// console.log(transactionData);
		const refundRequest = deductedAmount ? { chargeId: stripeChargeResponse.id, deductedAmount } : { chargeId: stripeChargeResponse.id };
		try {
			const refundResponse = await StripeServices.ProcessRefund(refundRequest);
			// update the transaction object
			const updateQuery = { refunded: true, refundResponse, refundTimestamp: Date.now() };
			TransactionsModel.update({ bookingId }, updateQuery)
				.then(({ nModified }) => {
					if (!nModified) {
						return reject(ResponseUtility.ERROR({ message: 'Nothing modified. ' }));
					}
					// refund completed
					/**
					 * @todo make slot available again
					 */
					resolve(ResponseUtility.SUCCESS);
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating transactions', error: err })));
			// resolve();
		} catch (err) {
			reject(ResponseUtility.ERROR({ message: 'Error processing refund', error: err }));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
