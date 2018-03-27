/**
 * @desc this function will generate a hash for the input phrase
 * @author gaurav sharma
 */
import bcrypt from 'bcrypt';

export default {
	/**
	 * generate hash
	 */
	generate: text => new Promise((resolve, reject) => {
		bcrypt.hash(text, 10, (err, hash) => {
			if (err) return reject(err);
			return resolve(hash);
		});
	}),
	/**
	 * compare hash with text
	 */
	compare: (hash, text) => new Promise((resolve, reject) => {
		bcrypt.compare(text, hash, (err, compare) => {
			if (err) return reject(err);
			return resolve(compare);
		});
	})
}