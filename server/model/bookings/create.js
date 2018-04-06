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
		const teacherPopulation = { path: 'teacher', model: TeacherModel, select: 'name address picture email' };
		// check if user has already enrolled in this class
		const checkQuery = { $and: [{ by: id }, { ref }] };
		BookingsModel.findOne(checkQuery)
			.then((booking) => {
				if (booking) {
					return reject(ResponseUtility.ERROR({ message: 'Already enrolled for this class.' }));
				}
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
								},
							},
						} = classDetails;
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
									.then(() => resolve(ResponseUtility.SUCCESS))
									.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error sending email to teacher', error: err })));
								// resolve(ResponseUtility.SUCCESS);
							})
							.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving booking', error: err })));
					})
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error populating teacher details.', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for earlier bookings.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
