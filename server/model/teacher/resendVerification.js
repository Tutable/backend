import {
	TeacherSchema,
	StudentSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';
import { TemplateMailServices } from '../../services';

const TeacherModel = database.model('Teacher', TeacherSchema);
const StudentModel = database.model('Student', StudentSchema);
/**
 * this is a microservice to resend the user verification code
 * @author gaurav sharma
 * @since 29th March 2018
 */
export default ({ email }) => new Promise((resolve, reject) => {
	if (email) {
		const query = { email };
		// check timestamp is not frequent
		TeacherModel.findOne(query, { verificationCodeTimestamp: 1, isVerified: 1, name: 1 })
			.then((teacher) => {
				const { _doc: { verificationTokenTimestamp, isVerified } } = teacher;
				if (isVerified) {
					return resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'User is already verified.' }));
				}
				const expiry = verificationTokenTimestamp + (60000 * 2);
				const now = Date.now();
				if (now <= expiry) {
					return reject(ResponseUtility.ERROR({ message: 'Cannot send token instantly. Just wait for token via email for 2 minutes before regenerating a new token.' }));
				}
				const token = RandomCodeUtility();
				const lookupQuery = { email };
				const updateQuery = {
					verificationToken: token,
					verificationTokenTimestamp: now,
				};
				/**
				 * @todo update both teacher and student database
				 * for token
				 */
				Promise.all([
					new Promise((_resolve, _reject) => {
						TeacherModel.update(lookupQuery, updateQuery)
							.then(({ nModified }) => {
								if (nModified) {
									return _resolve(ResponseUtility.SUCESS);
								}
								_reject(ResponseUtility.ERROR({ message: 'Nothing modified for student' }));
							}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating techer model', error: err })));
					}),
					new Promise((_resolve, _reject) => {
						StudentModel.update(lookupQuery, updateQuery)
							.then(({ nModified }) => {
								if (nModified) {
									return _resolve(ResponseUtility.SUCCESS);
								}
								_reject(ResponseUtility.ERROR({ message: 'Nothing modiefied for student' }));
							}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error udpating student', error: err })));
					}),
				]).then(() => {
					// send the verification email with token
					TemplateMailServices.VerificationToken({ to: email, name: teacher.name, code: token })
						.then(() => resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Verification code has been sent ot you via email.' })))
						.catch(error => reject(ResponseUtility.ERROR({ message: 'Error sending email', error })));
				}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating token', error: err })));
			}).catch(error => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
