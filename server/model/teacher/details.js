import { TeacherSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

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
			.then(teacher => resolve(ResponseUtility.SUCCESS_DATA(teacher)))
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for user', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
