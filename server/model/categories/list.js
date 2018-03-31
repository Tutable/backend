import { CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const CategoryModel = database.model('Category', CategorySchema);
/**
 * microservice to fetch the all categories
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id
 * @param {String} title
 * either id or title is required. If both provided, id would
 * be picked up by default.
 * @return Promise
 */
export default () => new Promise((resolve, reject) => {
	CategoryModel.find({})
		.then(response => resolve(ResponseUtility.SUCCESS_DATA(response)))
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for categories', error: err })));
});
