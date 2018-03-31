import { ReviewSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ReviewModel = database.model('Reviews', ReviewSchema);
// const ClassModel = database.model('Class', ClassSchema);

/**
 * microservice to fetch reviews for a specific class
 * @author gaurav sharma
 * @since 31st March 2018
 *
 * @param {String} classId
 * @returns Promise
 *
 * @todo check the validaity/presence of ref id in database
 */
export default ({ classId, page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	if (classId) {
		const skip = limit * (page - 1);
		const query = { ref: classId };
		const projection = { __v: 0 };

		ReviewModel.find(query, projection, { sort: { posted: -1 }, skip, limit })
			.then(reviews => resolve(ResponseUtility.SUCCESS_PAGINATION(reviews, page, limit)))
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for reviews', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
