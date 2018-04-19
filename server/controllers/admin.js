/**
 * controller for the admin module
 */
import { AdminServices } from '../model';
import { TokenUtility } from '../utility';
import commonResolver from './commonResolver';

export default {
	authenticate: (req, res) => {
		const { body } = req;
		AdminServices.AdminAuthenticateService(body)
			.then((user) => {
				res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(user) });
			}).catch(err => res.status(200).send(err));
	},
	update: (req, res) => commonResolver(req, res, AdminServices.AdminUpdateService),
	verify: (req, res) => commonResolver(req, res, AdminServices.AdminVerifyService),
	delete: (req, res) => commonResolver(req, res, AdminServices.AdminDeleteService),
	deleteUser: (req, res) => commonResolver(req, res, AdminServices.AdminDeleteUserService),
	classUpdate: (req, res) => commonResolver(req, res, AdminServices.AdminUpdateClassService),
	deleteClass: (req, res) => commonResolver(req, res, AdminServices.AdminDeleteClassService),
	statistics: (req, res) => commonResolver(req, res, AdminServices.AdminStatisticsService),
};
