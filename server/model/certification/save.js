import { TeacherCertificationSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const TeacherCertificationModel = database.model('Certification', TeacherCertificationSchema);
/**
 * microservice to save the doctor certificated
 * @author gaurav sharma
 * @since 27th March 2018
 */
export default ({ id, policeCert, childrenCert }) => new Promise((resolve, reject) => {
	if (id && policeCert && childrenCert) {
		// trigger updaling cert to s3 and save url.
		// @todo upload to s3 and save payload url in database
		resolve(ResponseUtility.SUCCESS);
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
