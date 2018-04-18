import { TransactionsSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const TransactionsModel = database.model('Transaction', TransactionsSchema);
/**
 * microservice function to list down all the transaction
 * This does not handles any filteration process
 * @author gaurav sharma
 * @since 18th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = { __v: 0 };
	const options = { sort: { timestamp: -1 }, skip, limit };

	TransactionsModel.find({}, projection, options)
		.then(transactions => resolve(ResponseUtility.SUCCESS_PAGINATION(transactions, page, limit)))
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for transactions', error: err })));
});
