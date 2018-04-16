import { StudentSchema, TeacherSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	RandomCodeUtility,
} from '../../utility';
import { TemplateMailServices } from '../../services';

const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * separate update function because, email updation process
 * invloves verificaton and all. The user cannot use an account
 * until the updated email is verified.
 * @param {String} id to be injected by controller
 * @param {String} email id to update to.
 * @return Promise
 */
export default ({ id, email, updateEmail }) => new Promise(async (resolve, reject) => {
	if (id && email && updateEmail) {
		// if (email === updateEmail) {
		// 	return reject(ResponseUtility.ERROR({ message: 'Email already taken.' }));
		// }
		const query = { updateEmail };
		// check if it's not already taken
		const student = await StudentModel.findOne(query);
		const teacher = await TeacherModel.findOne(query);
		if ((student || teacher) && (student._doc._id === id || teacher._doc._id === id)) {
			return reject(ResponseUtility.ERROR({ message: 'Email already taken.' }));
		}
		let mod = await StudentModel.findOne({ _id: id });
		let teacherObject;
		let studentObject = mod ? Object.assign({}, mod._doc) : teacherObject = Object.assign({}, (await StudentModel.findOne({ _id: id }))._doc);
		if (teacherObject) {
			studentObject = await StudentModel.findOne({ email: teacherObject.email });
		} else {
			teacherObject = await TeacherModel.findOne({ email: studentObject.email });
		}
		console.log(studentObject);
		console.log(teacherObject);
		// if (!mod) {
		// 	// not student
		// 	mod = await TeacherModel.findOne({ _id: id });
		// }
		const verificationToken = RandomCodeUtility();
		const verificationTokenTimestamp = Date.now();

		// const lookupQuery = { updateEmail };
		const updateQuery = {
			email: updateEmail,
			isVerified: false,
			verificationToken,
			verificationTokenTimestamp,
		};
		const updateLookupQuery = { $or: [{ _id: studentObject._id }, { _id: teacherObject._id }]};
		Promise.all([
			new Promise((_resolve, _reject) => {
				// update student
				StudentModel.update(updateLookupQuery, updateQuery)
					.then(({ nModified }) => {
						if (!nModified) {
							return _reject(ResponseUtility.ERROR({ message: 'Nothing modified' }));
						}
						_resolve();
					}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating student', error: err })));
			}),
			new Promise((_resolve, _reject) => {
				TeacherModel.update(updateLookupQuery, updateQuery)
					.then(({ nModified }) => {
						if (!nModified) {
							return _reject(ResponseUtility.ERROR({ message: 'Nothing modified' }));
						}
						_resolve();
					}).catch(err => _reject(ResponseUtility.ERROR({ message: 'Error updating teacher', error: err })));
			}),
		])
			.then(async () => {
				// send verification code here...

				const { _doc: { name } } = await StudentModel.findOne({ email });
				// const { _doc: { name } } = student;
				TemplateMailServices.VerificationToken({ to: updateEmail, name, code: verificationToken })
					.then(() => resolve(ResponseUtility.SUCCESS))
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending verification code', error: err })));
			})
			.catch(err => reject(err));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
