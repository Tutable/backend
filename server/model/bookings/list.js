import {
	BookingSchema,
	StudentSchema,
	TeacherSchema,
	ClassSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_PROFILE, S3_STUDENT_PROFILE } from '../../constants';

const BookingsModel = database.model('Bookings', BookingSchema);
const StudentModel = database.model('Student', StudentSchema);
const TeacherModel = database.model('Teacher', TeacherSchema);
const ClassModel = database.model('Classes', ClassSchema);
/**
 * microservice to list down all the bookings in the systes
 * This api is used by the admin to list down the bookings in
 * the admin panel. Needs to authenticate the admin request for this
 * API.
 * @author gaurav sharma
 * @since 18th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise((resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = { __v: 0 };
	const options = { sort: { timestamp: -1 }, skip, limit };

	const populateStudent = { path: 'student', model: StudentModel, select: 'name picture email' };
	const populateTeacher = { path: 'teacherDetails', model: TeacherModel, select: 'name picture email' };
	const populateClass = { path: 'classDetails', model: ClassModel, select: 'name rate level' };

	BookingsModel.find({}, projection, options)
		.populate(populateClass)
		.populate(populateStudent)
		.populate(populateTeacher)
		.then((bookings) => {
			// refactor the response
			const refactoredResponse = [];
			bookings.map((booking) => {
				// console.log(booking);
				const {
					_doc: {
						slot,
						deleted,
						confirmed,
						cancelled,
						timeline,
					},
					$$populatedVirtuals: {
						classDetails,
						student,
						teacherDetails,
					},
				} = booking;
				const refactoredObject = Object.assign({}, booking._doc, {
					classDetails: {
						id: classDetails._doc._id,
						name: classDetails._doc.name,
						rate: classDetails._doc.rate,
						level: classDetails._doc.level,
					},
					student: {
						id: student._doc._id,
						name: student._doc.name,
						picture: student._doc.picture ? student._doc.picture.indexOf('http') !== -1 ? student._doc.picture :  `/student/asset/${S3_STUDENT_PROFILE}/${student._doc.picture}` : undefined,
						email: student._doc.email,
					},
					teacher: {
						id: teacherDetails._doc._id,
						name: teacherDetails._doc.name,
						picture: teacherDetails._doc.picture ? teacherDetails._doc.picture.indexOf('http') !== -1 ? teacherDetails._doc.picture :  `/teachers/assets/${S3_TEACHER_PROFILE}/${teacherDetails._doc.picture}` : undefined,
						email: teacherDetails._doc.email,
					},
				});
				refactoredResponse.push(refactoredObject);
			});
			resolve(ResponseUtility.SUCCESS_PAGINATION(refactoredResponse, page, limit));
		})
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for bookings', error: err })));
});
