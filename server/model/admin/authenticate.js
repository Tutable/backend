import { ADMIN, ADMIN_PASS } from '../../constants';
import { ResponseUtility } from '../../utility';
/**
 * this will handle the authentication of the admin user.
 * @author gaurav sharma
 * @since 17th April 2018
 * @param {String} username
 * @param {String} password
 */
export default ({ username, password }) => new Promise((resolve, reject) => {
	if (username && password) {
		if (username === ADMIN && password === ADMIN_PASS) {
			// return the admin object
			return resolve({ role: 'admin' });
		}
		reject(ResponseUtility.ERROR({ message: 'Username/Password invalid.' }));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
