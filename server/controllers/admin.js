/**
 * controller for the admin module
 */
import { AdminServices } from '../model';
import { TokenUtility } from '../utility';

export default {
	authenticate: (req, res) => {
		const { body } =  req;
		AdminServices.AdminAuthenticateService(body)
			.then((user) => {
				res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(user) });
			}).catch(err => res.status(200).send(err));
	},
};
