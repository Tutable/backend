import { NotificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

// const StudentNotificationModel = database.model('StudentNotifications', StudentNotificationSchema);
// const TeacherNotificationModel = database.model('TeacherNotifications', TeacherNotificationSchema);
const NotificationModel = database.model('Notifications', NotificationSchema);

/**
 * common service to add notificaitons data to respective databases
 * This will first adds the notifications data in the database and
 * then sends the push notification as well.
 * @param {String} id of session user, represents <code>ref</code> in database
 * @param {String} bookingRef if the notification is for booking request
 * @param {String} originator user id who raised this notification for `id` user.
 * @param {Number} time to show to the teacher if the notification is booking request.
 * @param {String} title is the text to show in notification.
 *
 * Field id, title and originator are required whereas others
 * are optional.
 *
 * @author gaurav sharma
 * @since 9th April 2018
 */
export default ({
	id,
	bookingRef,
	originator,
	time,
	title,
}) => new Promise((resolve, reject) => {
	if (id && title && originator) {
		const notificationObject = new NotificationModel({
			ref: id,
			bookingRef,
			originator,
			time,
			title,
			timestamp: Date.now(),
			deleted: false,
		});

		notificationObject.save().then(() => {
			/**
			 * @todo push notifications
			 */
			resolve(ResponseUtility.SUCCESS);
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving notification in database', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
