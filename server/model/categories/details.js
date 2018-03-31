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
export default ({ categoryId, title }) => new Promise((resolve, reject) => {
	if (categoryId || title) {
		// const query = { $or: [{ _id: id }, { title }, { parent: id }] };
		if (categoryId) {
			// process for id. Includes the subcategories
			// upto one level
			CategoryModel.aggregate([
				{ $match: { parent: categoryId } },
			]).exec((err, categories) => {
				const parentQuery = categoryId ? { _id: categoryId } : { title };
				CategoryModel.findOne(parentQuery)
					.then((category) => {
						const { _doc } = category;
						const resultant = _doc;
						resultant.categories = categories;

						resolve(ResponseUtility.SUCCESS_DATA(resultant));
					}).catch(categoryError => reject(ResponseUtility.ERROR({ message: 'Error fetching category', error: categoryError })));
			});
		} else {
			// process for title
			const query = { title };
			const projection = { __v: 0 };
			CategoryModel.findOne(query, projection)
				.then((category) => {
					if (category) {
						const { _doc: { _id }, _doc } = category;
						// aggregate child categories
						CategoryModel.aggregate([
							{ $match: { parent: _id } },
						]).exec((err, categories) => {
							_doc.categories = categories;
							resolve(ResponseUtility.SUCCESS_DATA(_doc));
						});
					} else {
						reject(ResponseUtility.ERROR({ message: 'Nothing found.' }));
					}
				}).catch(err => ResponseUtility.ERROR({ message: 'Error fetching category detals', error: err }));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
