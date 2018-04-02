import {
	ClassSchema,
	CategorySchema,
	TeacherSchema,
	ReviewSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_CLASS } from '../../constants';

const ClassModel = database.model('Classes', ClassSchema);
const CategoryModel = database.model('Categories', CategorySchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
// const ReviewModel = database.model('Reviews', ReviewSchema);

/**
 * microservice to get the details of the classes created by a
 * specific user. the id to be injected by the controller by
 * decoding headers
 * @author gaurav sharma
 * @since 28th March 2018
 *
 * @param {String} id is the id of teacher
 * @returns Promise
 * @todo populate the details with the latest 5 reviews.
 */
export default ({ classId }) => new Promise((resolve, reject) => {
	if (classId) {
		const query = { $and: [{ _id: classId }, { deleted: false }] };
		// const query = { _id: id };
		const projection = { __v: 0 };
		const categoryPopulation = { path: 'categoryName', model: CategoryModel, select: 'title parent' };
		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture' };

		// const aggregationQuery = [{
		// 	$unwind: '$ref',
		// }, {
		// 	$match: {
		// 		deleted: false,
		// 	},
		// }, {
		// 	$group: {
		// 		_id: '$ref',
		// 		count: { $sum: 1 },
		// 	},
		// }];

		// ReviewModel.aggregate(aggregationQuery)
		// 	.exec((err, reviews) => {
		// 		console.log(reviews);
		// 	});

		ClassModel.findOne(query, projection)
			.populate(categoryPopulation)
			.populate(teacherPopulation)
			.then((success) => {
				const {
					_doc: {
						_id,
						name,
						level,
						bio,
						timeline,
						created,
						cancelled,
						payload,
					},
					$$populatedVirtuals: {
						categoryName,
						teacher,
					},
				} = success;

				resolve(ResponseUtility.SUCCESS_DATA({
					id: _id,
					name,
					teacher,
					category: categoryName,
					level,
					bio,
					timeline,
					created,
					cancelled,
					payload: `${S3_TEACHER_CLASS}/${payload}`,
				}));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
