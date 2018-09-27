
import {
	TeacherSchema,
	TeacherCertificationSchema,
} from '../schemas';
import database from '../../db';

import { ResponseUtility } from '../../utility';
import { S3_TEACHER_PROFILE, S3_TEACHER_CERTS } from '../../constants';

const TeacherModel = database.model('Teacher', TeacherSchema);
const TeacherCertificationModel = database.model('certifications', TeacherCertificationSchema);
/**
 * microservice to list down all the teachers
 * @author gaurav sharma
 * @since 17th April 2018
 */
export default ({ page = 1, limit = 30 }) => new Promise(async (resolve, reject) => {
	const skip = limit * (page - 1);
	const projection = {
		name: 1,
		email: 1,
		google: 1,
		facebook: 1,
		deleted: 1,
		isVerified: 1,
		picture: 1,
		degreeAsset: 1,
		address: 1,
		degreeAssetVerified: 1,
	};
	const options = { skip, limit };
	const populationQuery = {
		path: 'certs',
		model: TeacherCertificationModel,
		select: 'childrenCertificate policeCertificate childrenCertificateVerified policeCertificateVerified',
	};
	TeacherModel
		.find({}, projection, options)
		.populate(populationQuery)
		.then((teachers) => {
			const refactoredResponse = [];
			teachers.map((doc, index) => {
				const teacher = doc._doc;
				const { $$populatedVirtuals: { certs } } = doc;
				// console.log(teacher);

				/**
				 * @todo popultae the certifications data for the teachers
				 */
				// const certs = await TeacherCertificationModel.findOne({ ref: teacher._id });
				const refactoredObject = Object.assign({}, teacher, {
					picture: teacher.picture ? teacher.picture.indexOf('http') !== -1 ? teacher.picture :  `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher.picture}` : undefined,
					google: teacher.google.id || undefined,
					facebook: teacher.facebook.id || undefined,
					degree: teacher.degreeAsset ? `/teachers/assets/${S3_TEACHER_PROFILE}/${teacher.degreeAsset}` : undefined,
					/**
					 * @todo refactor the certs links and object
					 */
					certs: certs ? {
						childrenCertificate: certs._doc.childrenCertificate ? `/certificates/asset/${S3_TEACHER_CERTS}/${certs._doc.childrenCertificate}` : undefined,
						policeCertificate: certs._doc.policeCertificate ? `/certificates/asset/${S3_TEACHER_CERTS}/${certs._doc.policeCertificate}` : undefined,
						childrenCertificateVerified: certs._doc.childrenCertificateVerified,
						policeCertificateVerified: certs._doc.policeCertificateVerified,
					} : undefined,
					address: teacher.address,
				});
				// console.log(`adding doctor #${index + 1} out of ${teachers.length}`);
				refactoredResponse.push(refactoredObject);
			});
			return resolve(ResponseUtility.SUCCESS_PAGINATION(refactoredResponse, page, limit));
		}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for teachers.', error: err })));
});

