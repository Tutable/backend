import {
	TeacherSchema,
	StudentSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
	RandomCodeUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);
const StudentModel = database.model('Student', StudentSchema);
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
					const updateQuery = {
						passChangeToken: RandomCodeUtility(),
						password: hash,
						passChangeTimestamp: -1,
					};

					/**
					 * @todo process changing users password too
					 */
					Promise.all([
						new Promise((_resolve, _reject) => {
							TeacherModel.update(findQuery, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_reject(ResponseUtility.ERROR({ message: 'Nothing modified for teacher' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error changing teacher password', error: err })));
						}),
						new Promise((_resolve, _reject) => {
							StudentModel.update(findQuery, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_reject(ResponseUtility.ERROR({ message: 'Nothing modified for teacher' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error changing teacher password', error: err })));
						}),
					])
						.then(() => resolve(ResponseUtility.SUCCESS))
						.catch(err => reject(ResponseUtility.ERROR({ message: 'Error changing password', error: err })));
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error generating hash', error: err })));
			} else {
				reject(ResponseUtility.ERROR({ message: 'Token/User mismatch.' }));
			}
		});
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
