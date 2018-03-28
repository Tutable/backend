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
		const query = { $and: [{ email }, { deleted: false }] };
		const projection = { __v: 0, passChangeToken: 0, passChangeTimestamp: 0 };
		// const query = { email };
		TeacherModel.findOne(query, projection)
			.then((teacher) => {
				if (teacher) {
					const { _doc: { password, blocked } } = teacher;
					if (blocked) {
						return reject(ResponseUtility.ERROR({ message: 'You are blocked from login. Contact admin for support.' }));
					}
					HashUtility.compare(password, upassword)
						.then((matched) => {
							if (matched) {
								const teacherDoc = teacher._doc;
								delete teacherDoc.password;
								resolve({ matched, user: teacher });
							} else {
								reject(ResponseUtility.ERROR({ message: 'Password is incoreect.' }))
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
