import { StudentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
/**
 * change the password of user by verifying the passChangeToken
 * @author gaurav sharma
 * @since 3rd April 2018
 *
 * @param {String} email
 * @param {Number} token
 * @param {String} password the new password
 * @return Promise
 */
export default ({ email, token, password }) => new Promise((resolve, reject) => {
	if (email && token && password) {
		const query = { $and: [{ email }, { passChangeToken: token }] };
		StudentModel.findOne(query)
			.then((matching) => {
				if (matching) {
					// trigger updating the password
					HashUtility.generate(password)
						.then((hash) => {
							// save hash
							const updateQuery = { password: hash, passChangeToken: RandomCodeUtility() };
							StudentModel.update({ email }, updateQuery)
								.then((modified) => {
									const { nModified } = modified;
									if (nModified) {
										return resolve(ResponseUtility.SUCCESS);
									}
									resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing modified' }));
								}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating password', error: err })));
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error generating hash', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Invalid email/token combination.' }));
				}
			}).catch(err => ResponseUtility.ERROR({ message: 'Error looking for student', error: err }));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
