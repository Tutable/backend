import { BookingSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

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
	slots,
}) => new Promise((resolve, reject) => {
	if (id && ref && slots) {
		// check if user has already enrolled in this class
		const checkQuery = { $and: [{ _id: id }, { ref }] };
		BookingsModel.findOne(checkQuery)
			.then((booking) => {
				if (booking) {
					return reject(ResponseUtility.ERROR({ message: 'Already enrolled for this class.' }));
				}
				const bookingObject = new BookingsModel({
					by: id,
					ref,
					slots,
					timestamp: Date.now(),
					deleted: false,
					confirmed: false,
				});

				bookingObject.save()
					.then(() => resolve(ResponseUtility.SUCCESS))
					.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving booking', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for earlier bookings.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
