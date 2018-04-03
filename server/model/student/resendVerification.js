import { StudentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';
import { EmailServices } from '../../services';
import { TOKEN_TYPE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
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
		let subject;
		let text;
		let updateQuery;
		let checkTimestamp;
		const code = RandomCodeUtility();
		switch (tokenType) {
			case TOKEN_TYPE.PASS_CHANGE:
				subject = 'Password change token for tutable student account';
				text = `Your password change token is ${code}`;
				updateQuery = { email, passChangeToken: code, passChangeTimestamp: Date.now() };
				checkTimestamp = 'passChangeTimestamp';
				break;
			case TOKEN_TYPE.VERIFICATION:
				subject = 'Verification code for tutable student account';
				text = `Your verification code is ${code}.`;
				updateQuery = { email, verificationToken: code, verificationTokenTimestamp: Date.now() };
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

					StudentModel.updateOne({ email }, updateQuery)
						.then((modified) => {
							const { nModified } = modified;
							if (nModified) {
								EmailServices({ to: email, subject, text })
									.then(() => resolve(ResponseUtility.SUCCESS))
									.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending email.', error: err })));
							} else {
								resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing updated' }));
							}
						}).catch(err => ResponseUtility.ERROR({ message: 'Error updating codes', error: err }));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Not user found' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error fetching user details', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
