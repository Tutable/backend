import { TeacherCertificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_BUCKET } from '../../constants';

const TeacherCertificationModel = database.model('Certification', TeacherCertificationSchema);
/**
 * microservice to fetch the certificates details
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id of the teacher
 */
export default ({ id }) => new Promise(async (resolve, reject) => {
	if (id) {
		const query = { ref: id };
		TeacherCertificationModel.findOne(query)
			.then((certificate) => {
				if (certificate) {
					const { _doc: { ref, policeCertificate, childrenCertificate } } = certificate;
					resolve(ResponseUtility.SUCCESS_DATA({
						ref,
						policeCertificate: policeCertificate ? `${S3_BUCKET}/teacher/certificates/${policeCertificate}` : undefined,
						childrenCertifiate: childrenCertificate ? `${S3_BUCKET}/teacher/certificates/${childrenCertificate}` : undefined,
					}));
				} else {
					reject(ResponseUtility.ERROR({ message: 'Nothing found.' }));
				}
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error finding certificates', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
