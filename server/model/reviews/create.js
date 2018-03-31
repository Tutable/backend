import { ReviewSchema, ClasSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ReviewModel = database.model('Reviews', ReviewSchema);
const ClassModel = database.model('classes', ClasSchema);

/**
 * microservice to create a new class for the teacher
 * This model function requires student token access to continue.
 * @author gaurav sharma
 * @since 31st March 2018
 *
 * @param {String} id of student posting review
 * @param {String} ref of the class
 * @param {Number} stars
 * @param {String} review
 * @returns Promise
 *
 * @todo check the validaity/presence of ref id in database
 */
export default ({
	id,
	ref,
	stars,
	review,
}) => new Promise(async (resolve, reject) => {
	if (id && ref && stars && review) {
		const query = { _id: ref };
		const projection = { name: 1 };
		// todo check the existence of class passed as ref
		ClassModel.findOne(query, projection)
			.then((_class) => {
				if (_class) {
					// can continue adding new review for class
					const classReview = new ReviewModel({
						ref,
						by: id,
						stars,
						review,
						deleted: false,
						blocked: false,
						posted: Date.now(),
					});

					classReview.save().then(() => resolve(ResponseUtility.SUCCESS))
						.then(err => reject(ResponseUtility.ERROR({ message: 'Error saving class review', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Error finding requested file.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for class details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
