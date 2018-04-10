/**
 * controller for syudent
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { StudentServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';
import commonSocialLoginResolver from './commonSocialLoginResolver';

export default {
	register: (req, res) => commonResolver(req, res, StudentServices.StudentsRegisterService),
	verify: (req, res) => commonResolver(req, res, StudentServices.StudentsVerifyService),
	token: (req, res) => commonResolver(req, res, StudentServices.StudentsResendVerificationService),
	details: (req, res) => commonResolver(req, res, StudentServices.StudentsDetailsService),
	password: (req, res) => commonResolver(req, res, StudentServices.StudentsChangePasswordService),
	update: (req, res) => commonResolver(req, res, StudentServices.StudentsUpdateService),
	socialLogin: (req, res) => commonSocialLoginResolver(req, res, StudentServices.StudentsRegisterService),
	resetNotifications: (req, res) => {
		StudentServices.StudentsUpdateService({ id: req.body.id, notifications: 0 })
			.then(success => res.status(200).send(success))
			.catch(err => res.status(200).send(err));
	},
	asset: commonPictureResolver,
};
