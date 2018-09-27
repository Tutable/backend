import {
	PaymentSchema,
	TransactionsSchema,
	BookingSchema,
	TeacherSchema,
	StudentSchema,
	ClassSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { StripeServices } from '../../services';

const PaymentModel = database.model('Payments', PaymentSchema);
const BookingModel = database.model('Bookings', BookingSchema);
const TransactionsModel = database.model('Transactions', TransactionsSchema);
const TeachersModel = database.model('Teachers', TeacherSchema);
const StudentsModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Classes', ClassSchema);
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
		const { defaultSource, stripeId, stripeCustomer } = payment;

		const teacherObject = await TeachersModel.findOne({ _id: teacher });
		const studentObject = await StudentsModel.findOne({ _id: by });
		const classObject = await ClassModel.findOne({ _id: ref });
		const payoutDue = Number(classDate) + (7 * 86400000);	// seven days after the class
		StripeServices.CreatePayment({
			amount: amount * 100,
			currency: 'AUD',
			customer: stripeId,
			source: defaultSource,
			description: `Payment for class ${classObject.name} by ${studentObject.name} to ${teacherObject.name}`,
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
					timestamp: Date.now(),	// the date when transaction was initiated
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
