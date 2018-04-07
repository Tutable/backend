import {
	BookingSchema,
	ClassSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { EmailServices } from '../../services';

const BookingsModel = database.model('Bookings', BookingSchema);
const ClassModel = database.model('Classes', ClassSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);

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

		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name email availability' };
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
				// console.log('Yes. It contains slot.');
				// add a new booking
				const bookingObject = new BookingsModel({
					by: id,
					ref,
					teacher: _id,
					slot,
					timestamp: Date.now(),
					deleted: false,
					confirmed: false,
					cancelled: false,
					completed: false,
				});

				bookingObject.save()
					.then(() => {
						EmailServices({ to: email, subject: `Request to attend ${_doc.name} class`, text: `${name} has requested you to attend ${_doc.name} class.` })
							.then(() => {
								// trigger removing the assigned slot from the teachers
								// availability
								const availabilityObject = Object.assign({}, availability);
								availabilityObject[requestedSlot].splice(availabilityObject[requestedSlot].indexOf(slot[requestedSlot].toString()), 1);
								// console.log(availabilityObject);
								TeacherModel.update({ _id }, { availability })
									.then((modified) => {
										const { nModified } = modified;
										if (nModified) {
											resolve(ResponseUtility.SUCCESS);
										} else {
											resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
										}
									}).catch(err => reject(ResponseUtility.ERROR({ message: '', error: err })));
							})
							.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error sending email to teacher', error: err })));
						// resolve(ResponseUtility.SUCCESS);
					})
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving booking', error: err })));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error populating teacher details.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
