import { TeacherSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility, RandomCodeUtility } from '../../utility';

const TeacherModel = database.model('Teacher', TeacherSchema);

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
					const updateQuery = { isVerified: true, verificationToken: RandomCodeUtility(), verificationTokenTimestamp: -1, firstLogin: false };
					TeacherModel.update({ email }, updateQuery, (err, modified) => {
						if (err) {
							return reject(ResponseUtility.ERROR({ message: 'Error updating teacher schema', error: err }));
						}
						const { nModified } = modified;
						if (nModified >= 1) {
							resolve(ResponseUtility.SUCCESS);
						} else {
							resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Nothing updated.' }));
						}
					});
				} else {
					reject(ResponseUtility.ERROR({ message: 'Error in email/token combination.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teacher', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
