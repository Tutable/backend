import { TeacherCertificationSchema } from '../../model/schemas';
import database from '../../db';
import { S3Services } from '../../services';
import { ResponseUtility } from '../../utility';
import { S3_TEACHER_CERTS } from '../../constants';

const CertificationModel = database.model('Certification', TeacherCertificationSchema);
/**
 * microservice to delete a requested certification from the teacher profile
 * @author guarav sharma
 */
export default ({ id, wwcc = false, police = false }) => new Promise(async (resolve, reject) => {
	if (!id || wwcc === undefined) {
		return reject(ResponseUtility.ERROR({ message: 'Missing user id or wwcc property' }));
	}
	const unset = {};
	if (wwcc) unset.childrenCertificate = 1;
	if (police) unset.policeCertificate = 1;

	const query = { $unset: unset };
	// trigger remove certifications values
	const certs = await CertificationModel.findOne({ ref: id });
	if (certs) {
		const { _doc: { policeCertificate, childrenCertificate } } = certs;
		if (police && policeCertificate) {
			// remove police cert from s3
			await S3Services.removeFile({ Bucket: S3_TEACHER_CERTS, Key: policeCertificate });
		}
		if (wwcc && childrenCertificate) {
			await S3Services.removeFile({ Bucket: S3_TEACHER_CERTS, Key: childrenCertificate });
		}
	}
	// now trigger change in database
	const { nModified } = await CertificationModel.update({ ref: id }, query);
	if (!nModified) {
		return reject(ResponseUtility.ERROR({ message: 'Nothing modified' }));
	}
	return resolve(ResponseUtility.SUCCESS);
});
