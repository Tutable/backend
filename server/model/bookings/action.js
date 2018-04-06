import moment from 'moment';
import {
	BookingSchema,
	StudentSchema,
	ClassSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { TemplateMailServices } from '../../services';

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

	const studentPopulation = { path: 'student', model: StudentModel, select: 'name email' };
	const classPopulation = { path: 'classDetails', model: ClassModel, select: 'name payload' };
	const teacherPopulation = { path: 'teacherDetails', model: TeacherModel, select: 'name picture' };

	if (id && bookingId && confirmed !== undefined) {
		// assigned to the teacher, not deleted and haven't confirmed yet.
		const query = { $and: [{ _id: bookingId }, { teacher: id }, { deleted: false }, { confirmed: false }] };
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
							// console.log({
							// 	to: student.email,
							// 	name: student.name,
							// 	teacher: teacherDetails.name,
							// 	teacher_image: teacherDetails.picture ? `http://localhost:3000/api/${teacherDetails}` : 'https://image.freepik.com/free-icon/male-user-shadow_318-34042.jpg',
							// 	className: classDetails.name,
							// 	time: slot || moment.unix(Date.now()).format('MM/DD/YYY'),
							// });
							// resolve();
							// send the mail notification
							TemplateMailServices.ClassConfirmedMail({
								to: student.email,
								name: student.name,
								teacher: teacherDetails.name,
								teacherImage: teacherDetails.picture ? `http://localhost:3000/api/${teacherDetails}` : undefined,
								className: classDetails.name,
								time: slot || moment.unix(Date.now()).format('MM/DD/YYY'),
							})
								.then(() => resolve(ResponseUtility.SUCCESS))
								.catch(err => reject(ResponseUtility.ERROR({ message: 'Error sending mail', error: err })));
						}
						// return resolve(ResponseUtility.SUCCESS_MESSAGE({ message: 'Noting modified.' }));
					}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating booking', error: err })));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for bookings', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});

