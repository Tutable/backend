import { ClassSchema, CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ClassModel = database.model('Classes', ClassSchema);
const CategoryModel = database.model('Categories', CategorySchema);

/**
 * microservice to get the details of the classes created by a
 * specific user. the id to be injected by the controller by
 * decoding headers
 * @author gaurav sharma
 * @since 28th March 2018
 *
 * @param {String} id is the id of teacher
 * @returns Promise
 */
export default ({ id, page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	if (id) {
		const skip = limit * (page - 1);
		const query = { ref: id };
		const projection = { __v: 0 };
		const options = { sort: { created: -1 }, skip, limit };
		const populationQuery = { path: 'categoryName', model: CategoryModel, select: 'title parent' };

		ClassModel.find(query, projection, options)
			.populate(populationQuery)
			.then(classes => resolve(ResponseUtility.SUCCESS_DATA(classes)))
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for classes', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
