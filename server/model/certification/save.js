import { TeacherCertificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_CERTS } from '../../constants';

const TeacherCertificationModel = database.model('Certification', TeacherCertificationSchema);
/**
 * microservice to save the doctor certificates
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id
 * @param {Buffer} policeCert to be injected by the controller
 * @param {Buffer} childrenCert to be injected by controller
 */
export default ({ id, policeCert, childrenCert }) => new Promise(async (resolve, reject) => {
	if (id && (childrenCert || policeCert)) {
		// trigger updaling cert to s3 and save url.
		// @todo upload to s3 and save payload url in database
		const Bucket = S3_TEACHER_CERTS;
		const policeKey = `police-check-${id}-${Date.now()}`;
		const childKey = `child-check-${id}-${Date.now()}`;
		try {
			await S3Services.uploadToBucket({ Bucket, Key: policeKey, data: policeCert });
			await S3Services.uploadToBucket({ Bucket, Key: childKey, data: childrenCert });

			const checkCertificates = new TeacherCertificationModel({
				ref: id,
				policeCertificate: policeKey,
				childrenCertificate: childKey,
			});
			checkCertificates.save()
				.then(() => resolve(ResponseUtility.SUCCESS))
				.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving certs data', error: err })));
		} catch (err) {
			reject(ResponseUtility.ERROR({ message: 'Error uploading check document.', error: err }));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
