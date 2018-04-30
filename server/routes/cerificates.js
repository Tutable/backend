import { CertificatesControllers, AuthenticationControllers } from '../controllers';
import { CompressionServices } from '../services';

const prefix = '/api/certificates/';
/**
 * routes descriptor for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
export default (app) => {
	app.post(`${prefix}save`, AuthenticationControllers.authenticateTeacher, CompressionServices, CertificatesControllers.save);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateTeacher, CertificatesControllers.details);
	app.post(`${prefix}delete`, AuthenticationControllers.authenticateTeacher, CertificatesControllers.delete);
	app.get(`${prefix}asset/:bucket/:userType/:folder/:asset`, CertificatesControllers.asset);
};
