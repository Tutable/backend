/**
 * @desc This module contains the logger service for the application tutable-app.
 * The logging service is a middleware.
 * @author gaurav sharma
 * @since Tuesday, March 27, 2018 10:47 AM
 */

import { createLogger, format, transports } from 'winston';

const requestsLogger = createLogger({
	level: 'info',
	format: format.json(),
	transports: [
		new transports.File({ filename: './logs/request-info.log', level: 'info' }),
	],
});
const responseLogger = createLogger({
	level: 'info',
	format: format.json(),
	transports: [
		new transports.File({ filename: './logs/response-info.log', level: 'info' }),
	],
});

/**
  * Interceptor for the incoming request
  * @param {*} req
  * @param {*} res
  * @param {*} next
  */
const RequestInterceptor = (req, res, next) => {
	const { body, headers, path } = req;
	const data = new Object(body);
	data.format = 'request';
	data.path = path;
	data.headers = headers;
	data.timestamp = new Date();

	requestsLogger.log({ level: 'info', message: data });
	next();
};
/**
  * Intercetor for the response
  * @param {*} req
  * @param {*} res
  * @param {*} next
  */
const ResponseInterceptor = (req, res, next) => {
	const { send } = res;
	res.send = function (body) {
		const data = new Object(body);
		data.format = 'response';
		data.timestamp = new Date();
		responseLogger.log({ level: 'info', message: data });
		send.call(this, body);
	};
	next();
};

export default {
	ResponseInterceptor,
	RequestInterceptor
}