/**
 * controller for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { TeacherServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	register: (req, res) => commonResolver(req, res, TeacherServices.TeacherRegisterService),
	verify: (req, res) => commonResolver(req, res, TeacherServices.TeacherVerifyService),
	update: (req, res) => commonResolver(req, res, TeacherServices.TeacherUpdateService),
	details: (req, res) => commonResolver(req, res, TeacherServices.TeacherDetailsService),
	resendVerifiation: (req, res) => commonResolver(req, res, TeacherServices.TeacherResendVerificationService),

	assets: commonPictureResolver,
};
