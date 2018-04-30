import {
	BookingsSchema,
	ClassSchema,
	TeacherSchema,
	StudentSchema,
	TransactionsSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { DEDUCTIONS } from '../../constants';
import {
	StripeServices,
	TemplateMailServices,
} from '../../services';

const BookingsModel = database.model('Bookings', BookingsSchema);
const TransactionsModel = database.model('Transactions', TransactionsSchema);
const ClassModel = database.model('Class', ClassSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
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
		// console.log(id, bookingId);
		// only the clasess that have been confirmed could be cancelled
		const classPopulation = { path: 'classDetails', model: ClassModel, select: 'name rate' };
		const query = { $and: [{ _id: bookingId }, { $or: [{ by: id }, { teacher: id }] }, { confirmed: true }, { cancelled: false }] };
		// console.log(JSON.stringify(query));
		const booking = await BookingsModel.findOne(query).populate(classPopulation);
		if (!booking) {
			return reject(ResponseUtility.ERROR({ message: 'No booking found. The class needs to be confirmed in order to delete or It might be cancelled already.' }));
		}

		const { _doc: { by, teacher, slot } } = booking;

		// set the booking status from confirmed to cancelled
		await BookingsModel.update(query, { confirmed: false, cancelled: true, cancellationTimestamp: Date.now() });
		const {
			$$populatedVirtuals: {
				classDetails: {
					name,
					rate,
				},
			},
		} = booking;
		let deductedAmount;
		const day = Object.keys(slot)[0];
		if (id === by) {
			// const {
			// 	$$populatedVirtuals: {
			// 		classDetails: {
			// 			name,
			// 			rate,
			// 		},
			// 	},
			// } = booking;
			// booking is by student
			// cancellation request by student
			// if class is within 24 hours, refund with 20% deductions
			// otherwise refund all
			// day = Object.keys(slot)[0];
			const date = new Date(Number(day));
			// console.log((booking._doc.slot[day]).split('-')[0]);
			date.setHours(Number(slot[day].split('-')[0]));

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
		const refundRequest = deductedAmount ?
			{ chargeId: stripeChargeResponse.id, deductedAmount } :
			{ chargeId: stripeChargeResponse.id };
		try {
			const refundResponse = await StripeServices.ProcessRefund(refundRequest);
			// update the transaction object
			const updateQuery = { refunded: true, refundResponse, refundTimestamp: Date.now() };

			TransactionsModel.update({ bookingId }, updateQuery)
				.then(async ({ nModified }) => {
					if (!nModified) {
						return reject(ResponseUtility.ERROR({ message: 'Nothing modified. ' }));
					}
					// refund completed

					const _teacher = await TeacherModel.findOne({ _id: teacher });
					const student = await StudentModel.findOne({ _id: by });
					/**
					 * @todo make slot available again
					 */
					const { _doc: { availability } } = _teacher;
					availability[day].push(slot[day]);
					const updateSlotQuery = { availability };
					await TeacherModel.update({ _id: teacher }, updateSlotQuery);

					// send the verification email to both student and teacher
					await TemplateMailServices.ClassCancelEmail({
						to: _teacher._doc.email,
						name: _teacher._doc.name,
						className: name,
						salutation: id === by ? `Student ${student._doc.name}` : 'You',
					});
					await TemplateMailServices.ClassCancelEmail({
						to: student._doc.email,
						name: student._doc.name,
						className: name,
						salutation: id === by ? 'You' : `Teacher ${_teacher._doc.name}`,
					});
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
