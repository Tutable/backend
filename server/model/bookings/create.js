import {
	BookingSchema,
	ClassSchema,
	TeacherSchema,
	StudentSchema,
	NotificationSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import {
	EmailServices,
	TemplateMailServices,
	APNServices,
} from '../../services';
import { NOTIFICATION_TYPE } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);
const ClassModel = database.model('Classes', ClassSchema);
const StudentModel = database.model('Student', StudentSchema);
const NotificationModel = database.model('Notifications', NotificationSchema);

const BookingsModel = database.model('Bookings', BookingSchema);

/**
 * microservice to create a new class booking into the system
 * The booking flow is complicated as it involves payment and other things
 * integration as well.
 * @author gaurav sharma
 * @since 4th April 2018
 *
 * @param {String} id of the user booking the class
 * @param {String} ref the id of the class to whicht he booking is requested
 * @param {*} slots
 */
export default ({
	id,
	ref,
	slot,
}) => new Promise((resolve, reject) => {
	if (id && ref && slot) {
		/**
		 * get the teacher id to fetch the teacher available slots and
		 * verify whether the provided slot is valid or not.
		 */

		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name email availability deviceId' };
		// check if user has already enrolled in this class
		// const checkQuery = { $and: [{ by: id }, { ref }] };
		// fetch the class details along with teacher email
		// to send email verification about the class request

		ClassModel.findOne({ _id: ref })
			.populate(teacherPopulation)
			.then((classDetails) => {
				const {
					_doc,
					$$populatedVirtuals: {
						teacher: {
							_id,
							name,
							email,
							availability,
							deviceId,
						},
					},
				} = classDetails;

				if (!availability) {
					return reject(ResponseUtility.ERROR({ message: 'Teacher is not available for the specified time slot.' }));
				}

				const requestedSlot = Object.keys(slot)[0];
				const slotTimestamp = Object.keys(availability).find(timestamp => timestamp === requestedSlot);
				if (!slotTimestamp) {
					return reject(ResponseUtility.ERROR({ message: 'Teacher is not available for specified time slot.' }));
				}
				// if here then timestamp is valid.
				// check if timestamp is greater than the cureent timestamp
				if (Number(slotTimestamp) < Date.now()) {
					return reject(ResponseUtility.ERROR({ message: 'Teacher is not avaialble for speified time slot.' }));
				}
				const containsSlot = availability[slotTimestamp].find(indSlot => indSlot.toString() === slot[requestedSlot].toString());

				if (!containsSlot) {
					return reject(ResponseUtility.ERROR({ message: 'Teacher not available for specified time slot.' }));
				}
				const date = new Date(Number(slotTimestamp));
				const hours = Number(containsSlot.charAt(0));
				const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, 0, 0);

				// console.log(newDate.getTime());
				// console.log('Yes. It contains slot.');
				const eventTimeline = newDate.getTime();
				// add a new booking
				const bookingObject = new BookingsModel({
					by: id,
					ref,
					teacher: _id,
					slot,
					timestamp: Date.now(),
					timeline: eventTimeline,
					deleted: false,
					confirmed: false,
					cancelled: false,
					completed: false,
				});

				bookingObject.save()
					.then(async (doc) => {
						// fetch the the student details
						const student = await StudentModel.findOne({ _id: id }, { name: 1 });
						TemplateMailServices.ClassRequest({ to: email, name, student: student.name, className: _doc.name, time: new Date(Number(eventTimeline)).toString() })
							.then(() => {
								// trigger removing the assigned slot from the teachers
								// availability
								// const availabilityObject = Object.assign({}, availability);
								// availabilityObject[requestedSlot].splice(availabilityObject[requestedSlot].indexOf(slot[requestedSlot].toString()), 1);
								/**
								 * @todo handle push notifications
								 * @todo handle notiifcation push
								 */
								const notificationObject = new NotificationModel({
									ref: _id,	// notification for
									bookingRef: doc._id,	// the id of booking
									originator: doc.by,		// id of the student
									time: doc.timeline,
									title: 'Requested for class',
									deleted: false,
									timestamp: eventTimeline.toString(),
								});

								notificationObject.save().then(() => {
									// send push notification
									if (deviceId) {
										APNServices({ deviceToken: deviceId, alert: 'Request to attend class', payload: { ref: _id, type: NOTIFICATION_TYPE.BOOKING_REQUEST } })
											.then(() => resolve(ResponseUtility.SUCCESS))
											.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending push notification', error: err })));
									} else {
										return resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Push notification not sent.' }));
									}
								}).catch((err) => {
									reject(ResponseUtility.ERROR({ message: 'Error saving notification', error: err }));
								});
							})
							.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error sending email to teacher', error: err })));
					})
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving booking', error: err })));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error populating teacher details.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
