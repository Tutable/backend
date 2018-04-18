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
 * @param {String} teacherId is the id of teacher
 * @param {String} categoryId the category to fetch for.
 * @param {Number} page
 * @param {Number} limit
 * Either the teacher Id or categoryId must be provided. If both provided, teacher ID will
 * be considered.
 * @returns Promise
 */
export default ({
	teacherId,
	categoryId,
	page = 1,
	limit = 30,
}) => new Promise((resolve, reject) => {
	// if (teacherId || categoryId) {
	const skip = limit * (page - 1);
	// if teacherId or categoryId is defined then filter  out for the results for teaher or student
	// if both are missing then this funtion will be used to admins listing and that would
	// include the deleted classes as well.
	const query = (teacherId || categoryId) ?
		{ $and: [teacherId ? { ref: teacherId } : { category: categoryId }, { deleted: false }] } : 
		{};
	// const query = { $and: [teacherId ? { ref: teacherId } : { category: categoryId }, { deleted: false }] };
	const projection = { __v: 0, timeline: 0, cancelled: 0 };
	const options = { sort: { created: -1 }, skip, limit };

	const categoryPopulation = { path: 'categoryName', model: CategoryModel, select: 'title parent' };
	const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture email' };

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
						email: teacher.email,
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
	// } else {
	// 	reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	// }
});
