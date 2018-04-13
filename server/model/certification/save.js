import { TeacherCertificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility, SchemaMapperUitlity } from '../../utility';
import { S3Services } from '../../services';
import { S3_TEACHER_CERTS } from '../../constants';
// import { SchemaMapperUtility } from '../../utility';

const TeacherCertificationModel = database.model('Certifications', TeacherCertificationSchema);
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
			if (policeCert) {
				await S3Services.uploadToBucket({ Bucket, Key: policeKey, data: policeCert });
			}
			if (childrenCert) {
				await S3Services.uploadToBucket({ Bucket, Key: childKey, data: childrenCert });
			}

			const query = { ref: id };
			TeacherCertificationModel.findOne(query)
				.then(async (certificates) => {
					if (certificates) {
						// update existing
						const updateQuery = {};
						if (policeCert) {
							updateQuery.policeCertificate = policeKey;
						}
						if (childrenCert) {
							updateQuery.childrenCertificate = childKey;
						}

						TeacherCertificationModel.updateOne(query, updateQuery)
							.then(() => resolve(ResponseUtility.SUCCESS))
							.catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating', error: err })));
					} else {
						// create new
						const checkCertificates = new TeacherCertificationModel({
							ref: id,
							policeCertificate: policeCert ? policeKey : undefined,
							childrenCertificate: childrenCert ? childKey : undefined,
						});
						checkCertificates.save()
							.then(() => resolve(ResponseUtility.SUCCESS))
							.catch(err => reject(ResponseUtility.ERROR({ message: 'Error saving certs data', error: err })));
					}
				}).catch((err) => {
					reject(ResponseUtility.ERROR({ message: 'Error looking for certificates', error: err }));
				});
		} catch (err) {
			reject(ResponseUtility.ERROR({ message: 'Error uploading check document.', error: err }));
		}
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
