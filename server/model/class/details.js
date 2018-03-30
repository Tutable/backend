import {
	ClassSchema,
	CategorySchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ClassModel = database.model('Classes', ClassSchema);
const CategoryModel = database.model('Categories', CategorySchema);
const TeacherModel = database.model('Teachers', TeacherSchema);

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
export default ({ id }) => new Promise((resolve, reject) => {
	if (id) {
		const query = { $and: [{ _id: id }, { deleted: false }] };
		// const query = { _id: id };
		const projection = { __v: 0 };
		const categoryPopulation = { path: 'categoryName', model: CategoryModel, select: 'title parent' };
		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture' };

		ClassModel.findOne(query, projection)
			.populate(categoryPopulation)
			.populate(teacherPopulation)
			.then((success) => {
				const {
					_doc: {
						level,
						bio,
						timeline,
						created,
						cancelled,
					},
					$$populatedVirtuals: {
						categoryName,
						teacher,
					},
				} = success;

				resolve(ResponseUtility.SUCCESS_DATA({
					teacher,
					category: categoryName,
					level,
					bio,
					timeline,
					created,
					cancelled,
				}));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
