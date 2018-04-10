import {
	NotificationSchema,
	StudentSchema,
	ClassSchema,
	TeacherSchema,
} from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_STUDENT_PROFILE, S3_TEACHER_PROFILE, S3_TEACHER_CLASS } from '../../constants';

const NotificationModel = database.model('Notifications', NotificationSchema);
const TeacherModel = database.model('Teachers', TeacherSchema);
const StudentModel = database.model('Students', StudentSchema);
const ClassModel = database.model('Class', ClassSchema);

/**
 * This will fetch the details about the notification based on user
 * token passed via controller
 * @param {String} id
 *
 * @author gaurav sharma
 * @since 9th April 2018
 */
export default ({
	id,
	role,
	page = 1,
	limit = 30,
}) => new Promise((resolve, reject) => {
	if (id) {
		const skip = limit * (page - 1);
		const query = { $and: [{ ref: id }, { deleted: false }] };
		const projection = { __v: 0 };
		const options = { sort: { timestamp: -1 }, skip, limit };

		let populationQuery;
		switch (role) {
			case 'teacher':
				populationQuery = { path: 'student', model: TeacherModel, select: 'name email picture' };
				break;
			case 'student':
				populationQuery = { path: 'teacher', model: StudentModel, select: 'name email picture' };
				break;
			default:
				break;
		}
		const classPopulation = { path: 'classDetails', mode: ClassModel, select: 'name payload' };

		NotificationModel.find(query, projection, options)
			.populate(populationQuery)
			.populate(classPopulation)
			.then((notifications) => {
				if (notifications && notifications.length) {
					// parse to reafctor the response
					const refactoredResponse = [];
					notifications.forEach((notification) => {
						const {
							_doc: {
								_id,
								bookingRef,
								time,
								title,
								timestamp,
							},
							$$populatedVirtuals: {
								student,
								teacher,
								classDetails,
							},
						} = notification;

						const studentDetails = student ? {
							id: student._doc._id,
							name: student._doc.name,
							email: student._doc.email,
							picture: student._doc.picture ? student._doc.picture.indexOf('http') !== -1 ?  student._doc.picture :  `/student/asset/${S3_STUDENT_PROFILE}/${student._doc.picture}` : undefined,
						} : undefined;
						const teacherDetails = teacher ? {
							id: teacher._doc._id,
							name: teacher._doc.name,
							email: teacher._doc.email,
							picture: teacher._doc.picture ? teacher._doc.picture.indexOf('http') !== -1 ? teacher._doc.picture : `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher._doc.picture}` : undefined,
						} : undefined;
						console.log(teacherDetails);
						const _class = classDetails ? {
							id: classDetails._id,
							name: classDetails.name,
							payload: classDetails.payload ? `/class/asset/${S3_TEACHER_CLASS}/${classDetails.payload}` : undefined,
						} : undefined;
						console.log(classDetails)
						
						refactoredResponse.push({
							id: _id,
							bookingRef,
							time,
							title,
							timestamp,
							student: studentDetails,
							teacher: teacherDetails,
							class: _class,
						});
					});

					resolve(ResponseUtility.SUCCESS_PAGINATION(refactoredResponse, page, limit));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Nothing found!' }));
				}
			})
			.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for notifications', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
