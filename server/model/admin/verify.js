import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * microservice to enforce the user verification based on email
 * @author gaurav sharma
 * @since 18th April 2018
 */
export default ({ userEmail }) => new Promise(async (resolve, reject) => {
	if (userEmail) {
		const lookupQuery = { email: userEmail };
		const updateQuery = { isVerified: true };

		console.log(updateQuery);

		await StudentModel.update(lookupQuery, updateQuery);
		await TeacherModel.update(lookupQuery, updateQuery);

		resolve(ResponseUtility.SUCCESS);
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
