/**
 * controller for syudent
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { StudentServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	register: (req, res) => commonResolver(req, res, StudentServices.StudentsRegisterService),
	verify: (req, res) => commonResolver(req, res, StudentServices.StudentsVerifyService),
	token: (req, res) => commonResolver(req, res, StudentServices.StudentsResendVerificationService),
	details: (req, res) => commonResolver(req, res, StudentServices.StudentsDetailsService),
	password: (req, res) => commonResolver(req, res, StudentServices.StudentsChangePasswordService),
	asset: commonPictureResolver,
};
