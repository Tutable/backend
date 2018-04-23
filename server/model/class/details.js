import {
	ClassSchema,
	CategorySchema,
	TeacherSchema,
	ReviewSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_CLASS, S3_TEACHER_PROFILE } from '../../constants';

const ClassModel = database.model('Classes', ClassSchema);
const CategoryModel = database.model('Categories', CategorySchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const ReviewModel = database.model('Reviews', ReviewSchema);

/**
 * microservice to get the details of the classes created by a
 * specific user.
 * @author gaurav sharma
 * @since 28th March 2018
 *
 * @param {String} classId is the id of class to fetch details
 * @returns Promise
 * @todo populate the details with the latest 5 reviews.
 */
export default ({ classId }) => new Promise((resolve, reject) => {
	if (classId) {
		const query = { $and: [{ _id: classId }, { deleted: false }] };
		// const query = { _id: id };
		const projection = { __v: 0 };
		const categoryPopulation = { path: 'categoryName', model: CategoryModel, select: 'title parent' };
		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture availability' };

		/**
		 * this aggregation query will append the reviews stats associated with the requested class
		 * like average review, review count and also sends the lastest review along with its data.
		 * see $group query for that.
		 */
		const aggregationQuery = [
			{ $unwind: '$ref' },
			{ $match: { ref: classId, deleted: false } },
			{
				$project: {
					_id: '$_id',
					ref: '$ref',
					by: '$by',
					posted: '$posted',
					review: '$review',
					stars: '$stars',
				},
			}, {
				$group: {
					_id: '$ref',
					avgStars: { $avg: '$stars' },
					count: { $sum: 1 },
					id: { $last: '$_id' },
					review: { $last: '$review' },
					stars: { $last: '$stars' },
					by: { $last: '$by' },
					posted: { $last: '$posted' },
				},
			},
		];

		ReviewModel.aggregate(aggregationQuery)
			.exec((err, reviews) => {
				// console.log(reviews);
				let matching = reviews.find(review => review._id === classId);
				if (!matching) {
					matching = {
						avgStars: 0,
						count: 0,
					};
				}
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
								rate,
								created,
								cancelled,
								payload,
								whyQualified,
							},
							$$populatedVirtuals: {
								categoryName,
								teacher,
								availability,
							},
						} = success;
						const teacherObject = Object.assign({}, teacher._doc, {
							picture: teacher.picture ? `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher.picture}` : undefined,
							id: teacher._id,
							availability,
							_id: undefined,
						});
						const {
							avgStars = 0,
							count = 0,
							id = undefined,
							review = undefined,
							posted = undefined,
							by = undefined,
							stars = undefined,
						} = matching;
						resolve(ResponseUtility.SUCCESS_DATA({
							id: _id,
							name,
							teacher: teacherObject,
							category: categoryName,
							level,
							bio,
							timeline,
							rate,
							created,
							whyQualified,
							cancelled,
							payload: payload ? `/class/asset/${S3_TEACHER_CLASS}/${payload}` : undefined,
							reviews: matching ? {
								avgStars,
								count,
								lastReview: {
									id,
									review,
									posted,
									by,
									stars,
								},
							} : undefined,
						}));
					})
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for details', error: err })));
			});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
