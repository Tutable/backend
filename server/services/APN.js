/**
 * service module that deals with the Apple push notifications
 * @author gaurav sharma
 * @since 9th April 2018
 */
import apn from 'apn';
import path from 'path';
import { ERROR, SUCCESS } from '../utility';

const { APPLE_BUNDLE, APPLE_KEYID, APPLE_TEAMID } = process.env;

const options = {
	token: {
		key: path.resolve(__dirname, '../../', 'configurations', 'AuthKey_RKFHRAZ4VF-key.p8'),
		keyId: APPLE_KEYID,
		teamId: APPLE_TEAMID,
	},
	production: process.env.NODE_ENV === 'production' ? true : false,
};


const apnProvider = new apn.Provider(options);

/**
 * send a notification to user
 * @param {String} deviceToken
 * @param {String} senderId
 * @param {String} alert
 */
export default ({
	deviceToken,
	alert,
	payload,
}) => new Promise((resolve, reject) => {
	const notification = new apn.Notification();


	console.log(deviceToken, alert, payload);
	notification.expiry = 500; // Expires 1 hour from now.
	notification.badge = 1;
	notification.sound = 'default';
	notification.alert = alert;
	notification.payload = payload;
	notification.topic = APPLE_BUNDLE;

	apnProvider.send(notification, deviceToken).then((result) => {
		console.log(result);
		console.log(result.failed[0].response);
		apnProvider.shutdown();
		resolve(SUCCESS);
	}).catch((err) => {
		apnProvider.shutdown();
		reject(ERROR({ message: 'Error sending push notitication', error: err }));
	});
});
