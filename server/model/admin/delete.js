import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * delete an entity i.e.student and teacher absed on the email id
 * @author gaurav sharma
 * @since 18th April 2018
 */
export default ({ userEmail, deleted = true }) => new Promise(async (resolve, reject) => {
	if (userEmail) {
		const lookupQuery = { email: userEmail };
		const updateQuery = { deleted };

		await StudentModel.update(lookupQuery, updateQuery);
		await TeacherModel.update(lookupQuery, updateQuery);

		resolve(ResponseUtility.SUCCESS);
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
