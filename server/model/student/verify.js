import { StudentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
/**
 * microservice to register a new student into the system.
 * This will first check the students email existence
 * Create a new user and sends a verification token via email
 * @author gaurav sharma
 * @since 3rd Apr 2018
 *
 * @param {String} name
 * @param {String} email
 * @param {String} address
 * @param {*} picture
 *
 * @returns Promise
 */
export default ({ email, token }) => new Promise((resolve, reject) => {
	if (email && token) {
		const query = { $and: [{ email }, { verificationToken: token }] };
		StudentModel.findOne(query)
			.then((student) => {
				if (student) {
					const updateQuery = { isVerified: true, verificationToken: RandomCodeUtility() };
					StudentModel.update(query, updateQuery)
						.then((modified) => {
							const { nModified } = modified;
							if (nModified) {
								return resolve(ResponseUtility.SUCCESS);
							}
							resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing modified' }));
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating document', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Error email/token combination' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
