import {
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * microservice to handle the student upate operations via admin
 * panel for both student and teacher
 * @author gaurav sharma
 * @since 18th April 2018
 */
export default ({ userId, userEmail, name, updateEmail }) => new Promise(async (resolve, reject) => {
	console.log(userId, userEmail, name, updateEmail);
	if (userId && userEmail && (updateEmail || name)) {
		// the id could be either of teacher or student, derive it first and find the souce email id
		const lookupQuery = { email: userEmail };
		
		// check if there is already a user with this email id
		let definedEmail = false;
		if (updateEmail) {
			const matchUser = await StudentModel.findOne({ email: updateEmail });
			if (matchUser) {
				// reject email update
				definedEmail = true;
			}
		}
		try {
			const updateQuery = await SchemaMapperUtility({ name, email: definedEmail ? undefined : updateEmail });
			await StudentModel.update(lookupQuery, updateQuery);
			await TeacherModel.update(lookupQuery, updateQuery);

			resolve(ResponseUtility.SUCCESS);
		} catch (err) {
			reject(err);
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
