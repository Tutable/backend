import {
	BookingSchema,
	TeacherSchema,
	StudentSchema,
	ClassSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { BOOKING_TYPE, S3_TEACHER_CLASS, S3_STUDENT_PROFILE, S3_TEACHER_PROFILE } from '../../constants';

const BookingsModel = database.model('Bookings', BookingSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Classes', ClassSchema);
/**
 * microservice to fetch the details about the users bookings.
 * The bookings might be upcomig or past bookings
 * @author gaurav sharma
 * @since 6th April 2018
 *
 * @param {String} id, to be injected via controller
 * @param {String} teacherId if fetch booking for teacher
 * @param {String} studentId if fetch bookings for student
 * @param {Number} bookingType represent the typ of booking listing like upcoming or past or both
 */
export default ({
	id,
	teacherId,
	studentId,
	bookingType,
	page = 1,
	limit = 30,
}) => new Promise((resolve, reject) => {
	const classPopulation = { path: 'classDetails', model: ClassModel, select: 'name rate payload' };
	const studentPopulation = { path: 'student', model: StudentModel, select: 'name picture picture' };
	const teacherPopulation = { path: 'teacherDetails', model: TeacherModel, select: 'name picture' };

	const skip = limit * (page - 1);
	if (id && (teacherId || studentId)) {
		const now = Date.now();
		let timelineQuery;
		switch (bookingType) {
			case BOOKING_TYPE.PAST:
				// the cancelled events would be treated as past events
				timelineQuery = { $or: [{ timeline: { $lte: now } }, { cancelled: true }] };
				break;
			case BOOKING_TYPE.UPCOMING:
				// accepted events having timelines greater than the current time are treated as
				// upcoming events
				timelineQuery = { $and: [{ timeline: { $gte: now } }, { confirmed: true }] };
				break;
			case BOOKING_TYPE.BOTH:
				timelineQuery = {};
				break;
			default:
				timelineQuery = {};
		}
		let primaryQuery;
		if (teacherId && teacherId === id) {
			primaryQuery = { $and: [{ teacher: teacherId }, { deleted: false }] };
		} else if (studentId && studentId === id) {
			primaryQuery = { $and: [{ by: studentId }, { deleted: false }] };
		} else {
			return reject(ResponseUtility.ERROR({ message: 'You are not authorized to access booking history of other users.' }));
		}

		const query = { $and: [timelineQuery, primaryQuery, { deleted: false }, { confirmed: true }] };
		const projection = { __v: 0 };
		const options = { sort: { timestamp: -1 }, skip, limit };

		BookingsModel.find(query, projection, options)
			.populate(studentPopulation)
			.populate(teacherPopulation)
			.populate(classPopulation)
			.then((bookings) => {
				const finalBookings = [];
				bookings.map((booking) => {
					const {
						_doc: {
							_id,
							timestamp,
							deleted,
							slot,
							confirmed,
							completed,
							cancelled,
						},
						$$populatedVirtuals: {
							classDetails,
							student,
							teacherDetails,
						},
					} = booking;
					finalBookings.push({
						id: _id,
						_id: undefined,
						slot,
						timestamp,
						deleted,
						confirmed,
						completed,
						cancelled,
						classDetails: {
							id: classDetails._id,
							name: classDetails.name,
							rate: classDetails.rate,
							picture: classDetails.payload ? `/class/asset/${S3_TEACHER_CLASS}/${classDetails.payload}` : undefined,
						},
						student: {
							id: student._id,
							name: student.name,
							picture: student.picture ? `/student/asset/${S3_STUDENT_PROFILE}/${student.picture}` : undefined,
						},
						teacher: {
							id: teacherDetails._id,
							name: teacherDetails.name,
							availability: teacherDetails.availability,
							picture: teacherDetails.picture ? `/teachers/assets/${S3_TEACHER_PROFILE}/${teacherDetails.picture}` : undefined,
						},
					});
				});
				resolve(ResponseUtility.SUCCESS_PAGINATION(finalBookings, page, limit));
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for bookings', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
