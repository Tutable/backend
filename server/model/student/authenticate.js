import { StudentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	HashUtility,
} from '../../utility';

const StudentModel = database.model('Student', StudentSchema);

/**
 * authenticate the uers email and password
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default ({ email, upassword }) => new Promise((resolve, reject) => {
	if (email && upassword) {
		const query = { $and: [{ email }, { deleted: false }] };
		const projection = { __v: 0, passChangeToken: 0, passChangeTimestamp: 0 };
		// const query = { email };
		StudentModel.findOne(query, projection)
			.then((student) => {
				if (student) {
					const { _doc: { password, blocked, isVerified } } = student;
					if (blocked) {
						return reject(ResponseUtility.ERROR({ message: 'You are blocked from login. Contact admin for support.' }));
					}
					if (!isVerified) {
						return reject(ResponseUtility.NOT_VERIFIED);
					}
					HashUtility.compare(password, upassword)
						.then((matched) => {
							if (matched) {
								resolve({ matched, user: student });
							} else {
								reject(ResponseUtility.ERROR({ message: 'Password is incoreect.' }));
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
