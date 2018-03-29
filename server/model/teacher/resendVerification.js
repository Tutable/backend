import { TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';
import { EmailServices } from '../../services';

const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * this is a microservice to resend the user verification code
 * @author gaurav sharma
 * @since 29th March 2018
 */
export default ({ email }) => new Promise((resolve, reject) => {
	if (email) {
		const query = { email };
		// check timestamp is not frequent
		TeacherModel.findOne(query, { passChangeTimestamp: 1, isVerified: 1 })
			.then((teacher) => {
				const { _doc: { passChangeTimestamp, isVerified } } = teacher;
				if (isVerified) {
					return resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'User is already verified.' }));
				}
				const expiry = passChangeTimestamp + (60000 * 2);
				const now = Date.now();
				if (now <= expiry) {
					reject(ResponseUtility.ERROR({ message: 'Cannot send token instantly. Just wait for token via email for 2 minutes before regenerating a new token.' }));
				} else {
					const token = RandomCodeUtility();
					const lookupQuery = { email };
					const updateQuery = {
						passChangeToken: token,
						passChangeTimestamp: now,
					};

					TeacherModel.update(lookupQuery, updateQuery)
						.then((modified) => {
							const { nModified } = modified;
							if (nModified >= 1) {
								// send email
								const subject = 'Tutable Authnetication token';
								const text = `Your tutable password change token is ${token}.`;
								EmailServices({ to: email, subject, text })
									.then(() => resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Verification code has been sent ot you via email.' })))
									.catch(error => reject(ResponseUtility.ERROR({ message: 'Error sending email', error })));
							} else {
								resolve(ResponseUtility.ERROR({ message: 'Nothing modified.' }));
							}
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating token', error: err })));
				}
				// resolve(teacher);
			}).catch(error => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
