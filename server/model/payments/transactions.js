import { TransactionsSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const TransactionsModel = database.model('Transactions', TransactionsSchema);
/**
 * Listing the transactions within the system, related to
 * a specific user, all user, payout flag etc.
 * @author gaurav sharma
 * @since 16th April 2018
 * @param {String} teacher id of the teacher to fetch transactions for
 * @param {String} student id of the student to fetch transactions for
 * @param {Boolean} payoutDone property representing the condition of payput transfer done or not.
 * false by default.
 */
export default ({
	teacher,
	student,
	payoutDone = false,
	limit = 30,
	page = 1,
}) => new Promise((resolve, reject) => {
	const query = { payoutDone };
	if (teacher) {
		query.to = teacher;
	}
	if (student) {
		query.from = student;
	}
	const skip = limit * (page - 1);
	const options = { sort: { timestamp: 1 }, skip, limit };
	TransactionsModel.find(query, {}, options)
		.then(transactions => resolve(ResponseUtility.SUCCESS_DATA(transactions)))
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error fetching transactions', error: err })));
});
