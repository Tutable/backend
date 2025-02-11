import {
	BookingSchema,
	TeacherSchema,
	StudentSchema,
	ClassSchema,
	ReviewSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { BOOKING_TYPE, S3_TEACHER_CLASS, S3_STUDENT_PROFILE, S3_TEACHER_PROFILE } from '../../constants';

const BookingsModel = database.model('Bookings', BookingSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Classes', ClassSchema);
const ReviewModel = database.model('Reviews', ReviewSchema);
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
			// primaryQuery = { $and: [{ teacher: teacherId }] };
			primaryQuery = { teacher: teacherId };
		} else if (studentId && studentId === id) {
			// primaryQuery = { $and: [{ by: studentId }] };
			primaryQuery = { by: studentId };
		} else {
			return reject(ResponseUtility.ERROR({ message: 'You are not authorized to access booking history of other users.' }));
		}

		// console.log(timelineQuery.$and);

		const query = { $and: [timelineQuery, primaryQuery, { deleted: false }, { confirmed: true }] };
		// console.log(JSON.stringify(query));
		const projection = { __v: 0 };
		const options = { sort: { timestamp: -1 }, skip, limit };

		BookingsModel.find(query, projection, options)
			.populate(studentPopulation)
			.populate(teacherPopulation)
			.populate(classPopulation)
			.then((bookings) => {
				// console.log(bookings);
				const finalBookings = [];
				if (bookings && bookings.length) {
					bookings.map(async (booking, index) => {
						const {
							_doc: {
								_id,
								timestamp,
								deleted,
								ref,
								slot,
								rate,
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
						/**
						 * @todo project the user review if submitted to this class
						 */
						const lookupQuery = { $and: [{ by: `${id}` }, { ref: `${ref}` }, { bookingReference: `${_id}` }] };
						const review = await ReviewModel.findOne(lookupQuery);
						const {
							stars = 0,
						} = review || {};

						finalBookings.push({
							id: _id,
							_id: undefined,
							slot,
							timestamp,
							deleted,
							rate,
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
							review: review ? {
								stars,
							} : undefined,
						});
						if (index === bookings.length - 1) {
							return resolve(ResponseUtility.SUCCESS_PAGINATION(finalBookings, page, limit));
						}
					});
				} else {
					resolve(ResponseUtility.SUCCESS_PAGINATION(finalBookings, page, limit));
				}
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for bookings', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
