import { StudentSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const StudentModel = database.model('Student', StudentSchema);

/**
 * microservice to list down all the students.
 * This will be used by the admin user.
 * @author gaurav sharma
 * @since 17th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = { name: 1, email: 1, picture: 1, isVerified: 1, deleted: 1, address: 1 }; 
	StudentModel.find({}, projection, { sort: { created: -1 }, skip, limit })
		.then(students => resolve(ResponseUtility.SUCCESS_DATA(students)))
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for students', error: err })));
});
