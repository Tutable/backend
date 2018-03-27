import { CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const CategoryModel = database.model('Category', CategorySchema);
/**
 * microservice to fetch the details about the
 * category
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id
 * @param {String} title
 * either id or title is required. If both provided, id would
 * be picked up by default.
 * @return Promise
 */
export default ({ id, title }) => new Promise((resolve, reject) => {
	if (id || title) {
		const query = { $or: [{ _id: id }, { title }, { parent: id }] };

		CategoryModel.aggregate([
			{ $match: { parent: id } },
		]).exec((err, categories) => {
			const parentQuery = id ? { _id: id } : { title };
			CategoryModel.findOne(parentQuery)
				.then((category) => {
					const { _doc } = category;
					const resultant = _doc;
					resultant.categories = categories;

					resolve(ResponseUtility.SUCCESS_DATA(resultant));
				}).catch(categoryError => reject(ResponseUtility.ERROR({ message: 'Error fetching category', error: categoryError })));
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
