/**
 * this module deals with the encoding and decoding of the generated tokens
 * using jsonwebtoken
 * @author gaurav sharma
 * @since 27th March 2018
 */

import jwt from 'jsonwebtoken';
import { secretString } from '../constants';
import { TimeUtility } from './';

/**
  * this will generate the jwt toke for the payload
  * by default, token will expire after an hour.
  * @param {*} payload the data to generate token from
  */
const generateToken = payload =>
	jwt.sign({ data: payload, exp: Date.now() + TimeUtility.hoursToMillis(1) }, secretString);
/**
  * this will decode the input token to the corrsopoonding payload
  * @param {*} token to decode. To be referred from generateToken method
  */
const decodeToken = token =>
	jwt.verify(token, secretString, (err, decoded) => {
		if (err) {
			return undefined;
		} else if (decoded.exp) {
			// if (new Date(decoded.exp).getTime() <= new Date().getTime()) {
			// 	return undefined;
			// }
			return decoded;
		}
		return undefined;
	});

export default {
	generateToken,
	decodeToken
}