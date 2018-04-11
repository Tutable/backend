import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * microservice to register a new student into the system.
 * This will first check the students email existence
 * Create a new user and sends a verification token via email
 *
 * The process will involve authenticating the teacher account also,
 * since the tokens are same
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
					/**
					 * @todo update student as well as the teacher model
					 */
					Promise.all([
						new Promise((_resolve, _reject) => {
							StudentModel.update(query, updateQuery)
								.then((modified) => {
									const { nModified } = modified;
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_resolve(ResponseUtility.ERROR({ message: 'Student not verified' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating document', error: err })));
						}),
						new Promise((_resolve, _reject) => {
							TeacherModel.update(query, updateQuery)
								.then((modified) => {
									const { nModified } = modified;
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_resolve(ResponseUtility.ERROR({ message: 'Teacher not modified' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating document', error: err })));
						}),
					])
						.then(() => resolve(ResponseUtility.SUCCESS))
						.catch(err => reject(ResponseUtility.ERROR({ message: 'Error verifying user', error: err })));
					// StudentModel.update(query, updateQuery)
					// 	.then((modified) => {
					// 		const { nModified } = modified;
					// 		if (nModified) {
					// 			return resolve(ResponseUtility.SUCCESS);
					// 		}
					// 		resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing modified' }));
					// 	}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating document', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Error email/token combination' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
