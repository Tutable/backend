import { TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
} from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);

/**
 * authenticate the uers email and password
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default ({ email, upassword }) => new Promise((resolve, reject) => {
	if (email && upassword) {
		const query = { $and: [{ email: { $regex: new RegExp(email.toLowerCase(), 'i') } }, { deleted: false }] };
		const projection = { __v: 0, passChangeToken: 0, passChangeTimestamp: 0 };
		// const query = { email };
		TeacherModel.findOne(query, projection)
			.then((teacher) => {
				if (teacher) {
					const { _doc: { password, blocked, isVerified } } = teacher;
					if (blocked) {
						const err = { code: 104, message: 'You are blocked from login. Contact admin for support.' };
						return reject(err);
					}
					if (!isVerified) {
						const err = { code: 105, message: 'User is not verified' };
						return reject(err);
					}
					HashUtility.compare(password, upassword)
						.then((matched) => {
							if (matched) {
								resolve({ matched, user: teacher });
							} else {
								const err = { code: 106, message: 'Password is incorrect' };
								reject(err);
							}
						}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error comparing hash', error: err })));
				} else {
					reject(ResponseUtility.USER_NOT_FOUND);
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error fetching details.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
