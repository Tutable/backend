import { TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * change the password by authenticating the token sent
 * @author gaurav sharma
 * @since 29th March 2018
 *
 * @param {String} email
 * @param {String} password
 * @returns Promise
 */
export default ({ email, token, password }) => new Promise((resolve, reject) => {
	if (email && token && password) {
		// verify token and then change password
		const query = { $and: [{ email }, { passChangeToken: token }] };
		TeacherModel.findOne(query).then((teacher) => {
			if (teacher) {
				HashUtility.generate(password).then((hash) => {
					const findQuery = { email };
					const updateQuery = { passChangeToken: RandomCodeUtility(), password: hash };

					TeacherModel.update(findQuery, updateQuery)
						.then((modified) => {
							const { nModified } = modified;
							if (nModified >= 1) {
								resolve(ResponseUtility.SUCCESS);
							} else {
								resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing updated.' }));
							}
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating teacher', error: err })));
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error generating hash', error: err })));
			} else {
				reject(ResponseUtility.ERROR({ message: 'Token/User mismatch.' }));
			}
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
