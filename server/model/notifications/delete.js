import { NotificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const NotificationModel = database.model('Notifications', NotificationSchema);
/**
 * microservice to handle deletion of notifications.
 * Calling this api will delete the notification and it will
 * never appear in the notification list even.
 */
export default ({ id, notificationId }) => new Promise((resolve, reject) => {
	if (id && notificationId) {
		// only the notification receiver can handle deletion as the
		// notification has beeen received by user
		const query = { $and: [{ _id: notificationId }, { ref: id }] };
		const updateQuery = { deleted: true };

		NotificationModel.update(query, updateQuery)
			.then(({ nModified }) => {
				if (nModified) {
					return resolve(ResponseUtility.SUCCESS);
				}
				resolve(ResponseUtility.ERROR({ message: 'Nothing modified.' }));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error deleting notification.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
