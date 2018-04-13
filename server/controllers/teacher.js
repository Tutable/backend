/**
 * controller for teacher
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { TeacherServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';
import commonSocialLoginResolver from './commonSocialLoginResolver';

export default {
	register: (req, res) => commonResolver(req, res, TeacherServices.TeacherRegisterService),
	verify: (req, res) => commonResolver(req, res, TeacherServices.TeacherVerifyService),
	update: (req, res) => commonResolver(req, res, TeacherServices.TeacherUpdateService),
	details: (req, res) => commonResolver(req, res, TeacherServices.TeacherDetailsService),
	resendVerifiation: (req, res) => commonResolver(req, res, TeacherServices.TeacherResendVerificationService),
	passwordToken: (req, res) => commonResolver(req, res, TeacherServices.TeacherPasswordTokenService),
	changePassword: (req, res) => commonResolver(req, res, TeacherServices.TeacherChangePasswordService),
	socialLogin: (req, res) => commonSocialLoginResolver(req, res, TeacherServices.TeacherRegisterService),
	// socialLogin: (req, res) => commonResolver(req, res, TeacherServices.TeacherRegisterService),
	resetNotifications: (req, res) => {
		TeacherServices.TeacherUpdateService({ id: req.body.id, notifications: 0 })
			.then(success => res.status(200).send(success))
			.catch(err => res.status(200).send(err));
	},
	assets: commonPictureResolver,
};
