import {
	NotificationSchema,
	StudentSchema,
	ClassSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const NotificationModel = database.model('Notifications', NotificationSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Class', ClassSchema);

/**
 * This will fetch the details about the notification based on user
 * token passed via controller
 * @param {String} id
 *
 * @author gaurav sharma
 * @since 9th April 2018
 */
export default ({
	id,
	role,
	page = 1,
	limit = 30,
}) => new Promise((resolve, reject) => {
	if (id) {
		const skip = limit * (page - 1);
		const query = { $and: [{ ref: id }, { deleted: false }] };
		const projection = { __v: 0 };
		const options = { sort: { timestamp: -1 }, skip, limit };

		let populationQuery;
		switch (role) {
			case 'teacher':
				populationQuery = { path: 'student', model: TeacherModel, select: 'name email picture' };
				break;
			case 'student':
				populationQuery = { path: 'teacher', model: StudentModel, select: 'name email picture' };
				break;
			default:
				break;
		}
		const classPopulation = { path: 'class', mode: ClassModel, select: 'name' };

		NotificationModel.find(query, projection, options)
			.populate(populationQuery)
			.populate(classPopulation)
			.then((notifications) => {
				if (notifications && notifications.length) {
					resolve(ResponseUtility.SUCCESS_PAGINATION(notifications, page, limit));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Nothing found!' }));
				}
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for notifications', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
