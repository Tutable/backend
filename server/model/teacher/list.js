import { TeacherSchema } from '../schemas';
import database from '../../db';

import { ResponseUtility } from '../../utility';
import { S3_TEACHER_PROFILE } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * microservice to list down all the teachers
 * @author gaurav sharma
 * @since 17th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = { name: 1, email: 1, google: 1, facebook: 1, deleted: 1, isVerified: 1, picture: 1 };
	const options = { skip, limit };
	TeacherModel.find({}, projection, options)
		.then((teachers) => {
			// reafactor the response
			const refactoredResponse = [];
			teachers.map((doc) => {
				const teacher = doc._doc;
				const refactoredObject = Object.assign({}, teacher, {
					picture: teacher.picture ? teacher.picture.indexOf('http') !== -1 ? teacher.picture :  `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher.picture}` : undefined,
					google: teacher.google.id || undefined,
					facebook: teacher.facebook.id || undefined,
				});
				refactoredResponse.push(refactoredObject);
			});
			resolve(ResponseUtility.SUCCESS_PAGINATION(refactoredResponse, page, limit));
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teachers', error: err })));
});

