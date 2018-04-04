/**
 * controller for syudent
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { StudentsServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	register: (req, res) => commonResolver(req, res, StudentsServices.StudentsRegisterService),
	verify: (req, res) => commonResolver(req, res, StudentsServices.StudentsVerifyService),
	token: (req, res) => commonResolver(req, res, StudentsServices.StudentResendVerificationService),
};
