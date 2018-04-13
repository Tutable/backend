import { TokenUtility } from '../utility';

const validPaths = ['student', 'teacher'];
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
	let role;
	validPaths.map((path) => {
		if (req.path.indexOf(path) !== -1) {
			role = path;
		}
	});
	modelPromise(body).then((success) => {
		const { data } = success;
		// parse the base route to fetch the teacher or student role
		data.role = role;
		res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(data) });
	}).catch((err) => {
		const { data } = err;
		data.role = role;
		res.status(200).send({ code: 100, message: 'Authenticated', accessToken: TokenUtility.generateToken(data) });
	});
};
