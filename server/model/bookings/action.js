import moment from 'moment';
import {
	BookingSchema,
	StudentSchema,
	ClassSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import {
	TemplateMailServices,
	APNServices,
} from '../../services';
import { NotificationsServices } from '../../model';
import { NOTIFICATION_TYPE } from '../../constants';

const BookingsModel = database.model('Bookings', BookingSchema);
const StudentModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Classes', ClassSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
/**
 * microservice to confirm/decline the booking.
 * Only a teacher can perform actions on a booking.
 * The action could be either confirm or decline.
 * Apart from setting a flag of confirmed property of a booking,
 * this API will also performs the following tasks:
 *
 * 1. Process the payment for the class
 * 2. Remove the requested slot from the teacher available avilability slot.
 * 3. Update the confirmed property of booking
 * 4. Send an email alert/push notification to student about the confirmation
 * 5. enable chat portal for users.
 * @author gaurav sharma
 * @since 6th April 2018
 *
 * @param {String} id of the teacher to be injected via controller through passed token
 * @param {String} bookingId of the booken to perform action on
 * @param {Boolean} confirmed confirmation/rejection flag
 *
 * @return Promise
 */
export default ({ id, bookingId, confirmed }) => new Promise((resolve, reject) => {

	const studentPopulation = { path: 'student', model: StudentModel, select: 'name email deviceId notifications' };
	const classPopulation = { path: 'classDetails', model: ClassModel, select: 'name payload' };
	const teacherPopulation = { path: 'teacherDetails', model: TeacherModel, select: 'name picture availability deviceId' };

	if (id && bookingId && confirmed !== undefined) {
		// assigned to the teacher, not deleted and haven't confirmed yet.
		const query = { $and: [{ _id: bookingId }, { teacher: id }, { deleted: false }, { confirmed: false }, { cancelled: false }] };
		const projection = { __v: 0 };
		BookingsModel.findOne(query, projection)
			.populate(studentPopulation)
			.populate(classPopulation)
			.populate(teacherPopulation)
			.then((booking) => {
				if (!booking) {
					return reject(ResponseUtility.ERROR({ message: 'No booking found' }));
				}
				const {
					_doc: {
						_id,
						slot,
						ref,
					},
					$$populatedVirtuals: {
						student,
						classDetails,
						teacherDetails,
					},
				} = booking;
				// const lookupQuery = { $and: [{ _id: bookingId }, { teacher: id }] };
				const updateQuery = confirmed ? { confirmed } : { cancelled: true };
				BookingsModel.update(query, updateQuery)
					.then((modified) => {
						const { nModified } = modified;
						if (nModified) {
							/**
							 * @todo remove the availability slot
							 * from the teacher list.
							 */
							const requestedSlot = Object.keys(slot)[0];
							const availabilityObject = Object.assign({}, teacherDetails.availability);
							availabilityObject[requestedSlot].splice(availabilityObject[requestedSlot].indexOf(slot[requestedSlot].toString()), 1);

							if (confirmed) {
								TeacherModel.update({ _id: teacherDetails._id }, { availability: availabilityObject })
									.then((modified) => {
										const { nModified } = modified;
										if (nModified) {
											// send the mail notification
											TemplateMailServices.ClassConfirmedMail({
												to: student.email,
												name: student.name,
												teacher: teacherDetails.name,
												teacherImage: teacherDetails.picture ? `http://localhost:3000/api/${teacherDetails}` : undefined,
												className: classDetails.name,
												time: slot || moment.unix(Object.keys(slot)[0]).format('MM/DD/YYY'),
											})
												.then(() => {
													/**
													 * @todo push notification to student about acceptance
													 * @todo remove notification from teachers notification screen.
													 */
													NotificationsServices.NotificationCreateService({
														id: student._id,
														bookingRef: bookingId,
														originator: id,
														classId: ref,
														time: Date.now(),
														title: 'Confirmed your request',
													})
														.then(() => {
															// push noitification here..
															if (!student.deviceId) {
																return resolve(ResponseUtility.ERROR({ message: 'Cannot send APN without deviceId' }));
															}
															APNServices({ deviceToken: student.deviceId, alert: 'Class confirmed', payload: { type: NOTIFICATION_TYPE.BOOKING_ACCEPTED }, badge: student.notifications ? student.notifications + 1 : 0 })
																.then(() => resolve(ResponseUtility.SUCCESS))
																.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error sending push notification', error: err })));
														})
														.catch(err => reject(ResponseUtility.ERROR({ message: 'Error pushing the notification', error: err })));
												})
												.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending mail', error: err })));
										} else {
											reject(ResponseUtility.ERROR({ message: 'Nothing modified' }));
										}
									}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error removing the availability slot from teacher', error: err })));
							} else {
								// send the cancellation notification
								// send the push notification to cancel the request. Mail is not required
								TemplateMailServices.ClassDeclinedMail({
									to: student.email,
									name: student.name,
									teacher: teacherDetails.name,
									className: classDetails.name,
								})
									.then(() => {
										/**
										 * @todo push notification to student about declining
										 * @todo remove the notification from teacher notifications listing
										 */
										NotificationsServices.NotificationCreateService({
											id: student._id,
											bookingRef: bookingId,
											classId: ref,
											originator: id,
											time: Date.now(),
											title: 'Declined your request',
										})
											.then(() => {
												// push noitification here..
												if (!student.deviceId) {
													return resolve(ResponseUtility.ERROR({ message: 'Cannot send APN without device id' }));
												}
												APNServices({ deviceToken: student.deviceId, alert: 'Class declined', payload: { type: NOTIFICATION_TYPE.BOOKING_REJECTED }, badge: student.notifications ? student.notifications + 1 : 0 })
													.then(() => {
														resolve(ResponseUtility.SUCCESS);
													}).catch(err => resolve(ResponseUtility.ERROR({ message: 'Error sending push notification', error: err })));
											})
											.catch(err => reject(ResponseUtility.ERROR({ message: 'Error pushing the notification', error: err })));
										// resolve(ResponseUtility.SUCCESS);
									})
									.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending mail', error: err })));
							}
						} else {
							// do nothing if no changes are made in the bakend
							resolve(ResponseUtility.ERROR({ message: 'Nothing updated.' }));
						}
						// return resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Noting modified.' }));
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating booking', error: err })));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for bookings', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

