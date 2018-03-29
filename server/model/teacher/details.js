import { TeacherSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_PROFILE } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);

/**
 * default register microservice for teacher
 * details
 * @author gaurav sharma
 * @since Tuesday, March 27, 2018 10:47 AM
 *
 * @param {String} id
 * @param {String} email
 * either id or email is required. If both provided,
 * id will be given preference over email
 */
export default ({ id, email }) => new Promise((resolve, reject) => {
	if (id || email) {
		const query = id ? { _id: id } : { email };
		TeacherModel.findOne(query)
			.then((teacher) => {
				const {
					_doc: {
						_id,
						name,
						email,
						firstLogin,
						deleted,
						blocked,
						isVerified,
						picture,
						degreeAsset,
					},
				} = teacher;

				resolve(ResponseUtility.SUCCESS_DATA({
					id: _id,
					name,
					email,
					firstLogin,
					deleted,
					blocked,
					isVerified,
					picture: `/teachers/assets/${S3_TEACHER_PROFILE}/${picture}`,
					degreeAsset: `/teachers/assets/${S3_TEACHER_PROFILE}/${degreeAsset}`,
				}));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for user', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
