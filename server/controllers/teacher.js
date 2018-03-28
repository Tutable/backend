import { TeacherServices } from '../model';
import commonResolver from './commonResolver';

export default {
	register: (req, res) => commonResolver(req, res, TeacherServices.TeacherRegisterService),
	verify: (req, res) => commonResolver(req, res, TeacherServices.TeacherVerifyService),
	update: (req, res) => commonResolver(req, res, TeacherServices.TeacherUpdateService),
};
