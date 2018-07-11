import { TeacherCertificationSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';

const TeacherCertificationModel = database.model('Certifications', TeacherCertificationSchema);
/**
 * ADMIN SERVICE
 * This is the service that deals with the  verification of the certs
 * taht a teacher uploads fir the verification
 * @author gaurav sharma
 * @since 11th July 2018
 *
 * @param {Boolean} policeCertificateVerified
 * @param {Boolean} childrenCertificateVerified
 */
export default ({
	userId,
	policeCertificateVerified,
	childrenCertificateVerified,
}) => new Promise(async (resolve, reject) => {
	if (!userId || (!policeCertificateVerified && !childrenCertificateVerified)) {
		return reject(ResponseUtility.MISSING_REQUUIRED_PROPS);
	}
	const lookupQuery = { ref: userId };
	const updateQuery = await SchemaMapperUtility({
		policeCertificateVerified,
		childrenCertificateVerified,
	});

	const { nModified } = await TeacherCertificationModel.update(lookupQuery, updateQuery);
	if (nModified) {
		return resolve(ResponseUtility.SUCCESS);
	}
	return resolve(ResponseUtility.ERROR({ message: 'No changed made.' }));
});
