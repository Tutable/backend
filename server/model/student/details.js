import { StudentSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_STUDENT_PROFILE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);
/**
 * microservice to fetch the student details based upon the user id
 * or email
 * @author gaurav sharma
 * @since 4th Apr 2018
 *
 * @param {String} id
 * @param {String} email
 *
 * @returns Promise
 */
export default ({ id, email }) => new Promise((resolve, reject) => {
	if (id || email) {
		// const query = id ? { _id: id } : { email };
		const query = id ?
			{ $and: [{ _id: id }, { deleted: false }] } :
			{ $and: [{ email }, { deleted: false }] };
		const projection = {
			password: 0,
			verificationToken: 0,
			verificationTokenTimestamp: 0,
			passChangeToken: 0,
			passChangeTimestamp: 0,
			__v: 0,
		};
		StudentModel.findOne(query, projection)
			.then((student) => {
				if (student) {
					const {
						_doc: {
							_id,
							name,
							email,
							picture,
							profileCompleted,
							created,
							isVerified,
							deleted,
							address,
						},
					} = student;

					return resolve(ResponseUtility.SUCCESS_DATA({
						id: _id,
						name,
						email,
						picture: picture ? picture.indexOf('http') !== -1 ?  picture :  `/student/asset/${S3_STUDENT_PROFILE}/${picture}` : undefined,
						profileCompleted,
						created,
						isVerified,
						deleted,
						address,
					}));
				}
				reject(ResponseUtility.USER_NOT_FOUND);
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for student', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
