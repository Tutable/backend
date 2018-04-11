import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';
import { TemplateMailServices } from '../../services';
import { TOKEN_TYPE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * handle this as a common function for re-sending verification
 * code as well as change password token
 * @author gaurav sharma
 * @since 3rd April 2018
 *
 * @param {String} email
 * @param {Number} tokenType @see constants.js for valid types
 * @return Promise
 */
export default ({ email, tokenType = undefined }) => new Promise((resolve, reject) => {
	if (email && tokenType) {
		// let subject;
		// let text;
		let updateQuery;
		let checkTimestamp;
		const code = RandomCodeUtility();
		const query = { email };
		switch (tokenType) {
			case TOKEN_TYPE.PASS_CHANGE:
				// subject = 'Password change token for tutable student account';
				// text = `Your password change token is ${code}`;
				updateQuery = { passChangeToken: code, passChangeTimestamp: Date.now() };
				checkTimestamp = 'passChangeTimestamp';
				break;
			case TOKEN_TYPE.VERIFICATION:
				// subject = 'Verification code for tutable student account';
				// text = `Your verification code is ${code}.`;
				updateQuery = { verificationToken: code, verificationTokenTimestamp: Date.now() };
				checkTimestamp = 'verificationTokenTimestamp';
				break;
			default:
				return reject(ResponseUtility.ERROR({ message: 'token type is not valid' }));
		}

		StudentModel.findOne({ email })
			.then((student) => {
				if (student) {
					const { _doc } = student;
					if (_doc[checkTimestamp]) {
						const now = Date.now();
						const expiry = _doc[checkTimestamp] + (60000 * 2);
						if (now <= expiry) {
							return reject(ResponseUtility.ERROR({ message: 'Cannot send token instantly. Just wait for token via email for 2 minutes before regenerating a new token.' }));
						}
					}

					/**
					 * @todo handle for both student and teacher
					 */
					Promise.all([
						new Promise((_resolve, _reject) => {
							StudentModel.update(query, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_reject(ResponseUtility.ERROR({ message: 'Nothing modified for student.' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating stduent', error: err })));
						}),
						new Promise((_resolve, _reject) => {
							TeacherModel.update(query, updateQuery)
								.then(({ nModified }) => {
									if (nModified) {
										return _resolve(ResponseUtility.SUCCESS);
									}
									_reject(ResponseUtility.ERROR({ message: 'Nothing modified for student.' }));
								}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating stduent', error: err })));
						}),
					]).then(() => {
						/**
						 * send the verification mail.
						 */
						switch (tokenType) {
							case TOKEN_TYPE.PASS_CHANGE:
								TemplateMailServices.ChangePasswordToken({
									to: email,
									name: _doc.name,
									code,
								})
									.then(() => resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Verification code has been sent ot you via email.' })))
									.catch(error => reject(ResponseUtility.ERROR({ message: 'Error sending email', error })));
								break;
							case TOKEN_TYPE.VERIFICATION:
								TemplateMailServices.VerificationToken({
									to: email,
									name: _doc.name,
									code,
								})
									.then(() => resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Verification code has been sent ot you via email.' })))
									.catch(error => reject(ResponseUtility.ERROR({ message: 'Error sending email', error })));
								break;
							default:
								break;
						}
					}).catch(err => reject(ResponseUtility.ERROR({ message: '', error: err })));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Not user found' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error fetching user details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
