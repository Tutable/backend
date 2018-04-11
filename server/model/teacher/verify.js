import {
	TeacherSchema,
	StudentSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility, RandomCodeUtility } from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);
const StudentModel = database.model('Student', StudentSchema);

/**
 * this microservice deals with the verification of token sent to teacher via email
 * @author guarav sharma
 * @since 28th March 2018
 */
export default ({ email, token }) => new Promise((resolve, reject) => {
	if (email && token) {
		const query = { $and: [{ email }, { verificationToken: token }] };
		TeacherModel.findOne(query)
			.then((teacher) => {
				if (teacher) {
					const updateQuery = {
						isVerified: true,
						verificationToken: RandomCodeUtility(),
						verificationTokenTimestamp: -1,
						firstLogin: false,
					};
					/**
					 * @todo verify student too
					 */
					Promise.all([
						new Promise((_resolve, _reject) => {
							TeacherModel.update(query, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_resolve(ResponseUtility.ERROR({ message: 'Teacher not modified ' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating teacher', error: err })));
						}),
						new Promise((_resolve, _reject) => {
							StudentModel.update(query, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.ERROR);
									}
									_resolve(ResponseUtility.ERROR({ message: 'Student not modified' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error udpating student', error: err })));
						}),
					])
						.then(() => resolve(ResponseUtility.SUCCESS))
						.catch(err => reject(ResponseUtility.ERROR({ message: 'Error verifying user', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Error in email/token combination.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
