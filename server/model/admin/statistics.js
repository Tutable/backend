import {
	TeacherSchema,
	StudentSchema,
	BookingSchema,
	ClassSchema,
	TransactionsSchema,
} from '../schemas';
import database from '../../db';

const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
const BookingModel = database.model('Bookings', BookingSchema);
const ClassModel = database.model('Classes', ClassSchema);
const TransactionsModel = database.model('Transactions', TransactionsSchema);
/**
 * calculate all the required dashboard calcualtions
 */
export default () => new Promise(async (resolve, reject) => {
	/**
	 * teacher details
	 */
	const teachers = await TeacherModel.count({});
	const deletedTeachers = await TeacherModel.count({ deleted: true });
	const students = await StudentModel.count({ });
	const deletedStudents = await StudentModel.count({ deleted: true });
	const totalBookings = await BookingModel.count({});
	const cancelledBookings = await BookingModel.count({ cancelled: true });
	const confirmedBookings = await BookingModel.count({ confirmed: true });
	const classes = await ClassModel.count({});
	const totalTransactions = await TransactionsModel.count({});
	const refunds = await TransactionsModel.count({ refunded: { $ne: undefined } });
	// refunding is not done and payout done flag is false
	const pendingPayouts = await TransactionsModel.count({ $and: [{ refunded: { $eq: undefined } }, { payoutDone: false }] });
	const completedPayouts = await TransactionsModel.count({ payoutsDone: true });

	/**
	 * use aggregation to calculate the
	 */

	resolve({
		teachers: {
			total: teachers,
			deleted: deletedTeachers,
			active: teachers - deletedTeachers,
		},
		students: {
			total: students,
			deleted: deletedStudents,
			active: students - deletedStudents,
		},
		bookings: {
			total: totalBookings,
			cancelled: cancelledBookings,
			confirmed: confirmedBookings,
		},
		classes,
		transactions: {
			total: totalTransactions,
			refunded: refunds,
			pendingPayouts,
			completedPayouts,
		},
	});
});
