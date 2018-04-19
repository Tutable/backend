import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * delete user functionality for teacher and user. This function uses middleware injection of
 * id and email.
 * @author gaurav sharma
 * @since 19th April 2018
 */
export default ({ id, email, deleted = true }) => new Promise(async (resolve, reject) => {
	if (id && email) {
		// decoded by the authorization header
		const lookupQuery = { email };
		const updateQuery = { deleted };

		await StudentModel.update(lookupQuery, updateQuery);
		await TeacherModel.update(lookupQuery, updateQuery);

		resolve(ResponseUtility.SUCCESS);
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
