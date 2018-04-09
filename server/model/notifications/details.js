import {
	NotificationSchema,
	StudentSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const NotificationModel = database.model('Notifications', NotificationSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);

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
		const query = { $and: [{ _id: id }, { deleted: false }] };
		const projection = { __v: 0 };
		const options = { sort: { timestamp: -1 }, skip, limit };

		let populationQuery;
		switch (role) {
			case 'teacher':
				populationQuery = { path: 'teacher', model: TeacherModel, select: 'name email picture' };
				break;
			case 'student':
				populationQuery = { path: 'student', model: StudentModel, select: 'name email picture' };
				break;
			default:
				break;
		}

		NotificationModel.find(query, projection, options)
			.populate(populationQuery)
			.then((notifications) => {
				if (notifications && notifications.length) {
					resolve(ResponseUtility.SUCCESS_PAGINATION(notifications, page, limit));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for notifications', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
