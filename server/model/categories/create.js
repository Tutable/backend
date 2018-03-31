import { CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const CategoryModel = database.model('Categories', CategorySchema);
/**
 * this model function will help to create a category in database
 */
export default ({ title, parent }) => new Promise((resolve, reject) => {
	if (title) {
		// check if title already exists
		const query = { $and: [{ title }, { parent }] };
		CategoryModel.findOne(query)
			.then((result) => {
				if (result) {
					return reject(ResponseUtility.ERROR({ message: 'Duplicate category name.' }));
				}

				const category = new CategoryModel({
					title,
					parent,
				});

				category.save()
					.then(() => resolve(ResponseUtility.SUCCESS))
					.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error saving category', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for category', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
