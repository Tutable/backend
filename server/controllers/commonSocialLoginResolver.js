import { TokenUtility } from '../utility';
/**
 * This moudule acts as a common handler for social login. This is only
 * used by a single controller route but is still separated to spearate
 * the concerns and features within the application.
 * @author gaurav sharma
 * @since Tuesday, April 9, 2018 11:55 AM
 *
 * @param {*} req
 * @param {*} res
 * @param {Promise} modelPromise the promise object that will handle the incoming route data
 *
 * @todo Handle authentication middleware injections?
*/
export default (req, res, modelPromise) => {
	const { body } = req;
	modelPromise(body).then((success) => {
		const { data } = success;
		data.role = 'student';
		res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(data) });
	}).catch((err) => {
		const { data } = err;
		data.role = 'student';
		res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(data) });
	});
};
