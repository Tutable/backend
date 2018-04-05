import {
	ClassSchema,
	CategorySchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_CLASS, S3_TEACHER_PROFILE } from '../../constants';

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
export default ({ teacherId, page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	if (teacherId) {
		const skip = limit * (page - 1);
		const query = { $and: [{ ref: teacherId }, { deleted: false }] };
		const projection = { __v: 0 };
		const options = { sort: { created: -1 }, skip, limit };

		const categoryPopulation = { path: 'categoryName', model: CategoryModel, select: 'title parent' };
		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture' };

		ClassModel.find(query, projection, options)
			.populate(categoryPopulation)
			.populate(teacherPopulation)
			.then((classes) => {
				const resultant = [];
				if (classes.length) {
					classes.map((singleClass, index) => {
						const {
							_doc: {
								_id,
								name,
								level,
								bio,
								timeline,
								created,
								cancelled,
								rate,
								payload,
							},
							$$populatedVirtuals: {
								categoryName,
								teacher,
							},
						} = singleClass;
						const teacherObject = Object.assign({}, teacher._doc, {
							picture: teacher.picture ? `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher.picture}` : undefined,
							id: teacher._id,
							_id: undefined,
						});
						resultant.push({
							id: _id,
							name,
							teacher: teacherObject,
							category: categoryName,
							level,
							bio,
							timeline,
							created,
							cancelled,
							rate,
							payload: payload ? `/class/asset/${S3_TEACHER_CLASS}/${payload}` : undefined,
						});
						if (index === classes.length - 1) {
							return resolve(ResponseUtility.SUCCESS_DATA(resultant));
						}
					});
				} else {
					return resolve(ResponseUtility.SUCCESS_DATA(resultant));
				}
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for classes', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
