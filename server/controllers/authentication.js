/**
 * this file deals with the authentication services
 * Uses a commong authentication function and token identifier as role
 * to specify at the time of serializing the token.
 *
 * @todo The role specified is straight forward as of now.
 * It could be secured by using random string for each role of user.
 *
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { TokenUtility } from '../utility';
import { APPLICATION_ROLES } from '../constants';

/**
 * common authenticator function
 * @param {*} authorization header value
 * @param {String} type representing the user-type value
 */
const prepareDecodedData = ({ authorization, type }) => new Promise((resolve, reject) => {
	const decoded = TokenUtility.decodeToken(authorization);
	if (decoded) {
		const { data: { email, _id, role } } = decoded;
		if (type === 'global') {
			if (APPLICATION_ROLES.find(validRole => validRole === role)) {
				return resolve({ type, email, id: _id });
			}
		} else if (role === type) {
			return resolve({ type, email, id: _id });
		}
	}
	reject();
});

/**
 * common token decoding and authentication handler
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next the next callback
 * @param {*} type the type of user/ this could be some code to validate
 */
const commonDecodingHandler = ({
	req,
	res,
	next,
	type,
}) => {
	const { headers: { authorization } } = req;
	if (authorization) {
		prepareDecodedData({ authorization, type })
			.then((payload) => {
				if (payload) {
					const body = Object.assign({}, req.body, payload);
					req.body = body;
					return next();
				}
			}).catch(() => res.status(401).send({ code: 401, message: 'Token might be invalid or has been expired', error: 'Token Invalid.' }));
	} else {
		res.status(400).send({ code: 400, message: 'Malformed Request', error: 'Missing Headers' });
	}
};

export default {
	authenticateTeacher: (req, res, next) => commonDecodingHandler({
		req,
		res,
		next,
		type: 'teacher',
	}),
	authenticateStudent: (req, res, next) => commonDecodingHandler({
		req,
		res,
		next,
		type: 'student',
	}),
	authenticateAdmin: (req, res, next) => commonDecodingHandler({
		req,
		res,
		next,
		type: 'admin',
	}),
	/**
	 * This will handle the authentication of a global user. Global users are all
	 * of the users of the application. This common authentication controller is defined
	 * to authenticate the APIs that are accessible to all application users.
	 */
	authenticateGlobalEntity: (req, res, next) => commonDecodingHandler({
		req,
		res,
		next,
		type: 'global',
	}),
};
