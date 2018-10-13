import { StudentSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_STUDENT_PROFILE } from '../../constants';

const StudentModel = database.model('Student', StudentSchema);

/**
 * microservice to list down all the students.
 * This will be used by the admin user.
 * @author gaurav sharma
 * @since 17th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = {
		name: 1,
		email: 1,
		picture: 1,
		isVerified: 1,
		deleted: 1,
		address: 1,
		facebook: 1,
		google: 1,
		dob: 1,
	};
	StudentModel.find({}, projection, { sort: { created: -1 }, skip, limit })
		.then((students) => {
			// need to refactor the picture urls
			const refactoredResponse = [];
			students.map((res) => {
				const student = res._doc;
				const refactoredStudent = Object.assign({}, student, {
					picture: student.picture ? student.picture.indexOf('http') !== -1 ? student.picture :  `/student/asset/${S3_STUDENT_PROFILE}/${student.picture}` : undefined,
					google: student.google.id || undefined,
					facebook: student.facebook.id || undefined,
				});
				refactoredResponse.push(refactoredStudent);
			});
			resolve(ResponseUtility.SUCCESS_PAGINATION(refactoredResponse, page, limit))
		})
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for students', error: err })));
});
