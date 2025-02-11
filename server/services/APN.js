/**
 * service module that deals with the Apple push notifications
 * @author gaurav sharma
 * @since 9th April 2018
 */
import apn from 'apn';
import path from 'path';
import { ResponseUtility } from '../utility';

const { APPLE_BUNDLE, APPLE_KEYID, APPLE_TEAMID } = process.env;

const options = {
	token: {
		key: path.resolve(__dirname, '../../', 'configurations', 'AuthKey_WVQA5XXHGL.p8'),
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
	badge = 1,
}) => new Promise((resolve, reject) => {
	const notification = new apn.Notification();

	notification.expiry = 500; // Expires 1 hour from now.
	notification.badge = badge;
	notification.sound = 'default';
	notification.alert = alert;
	notification.payload = payload;
	notification.topic = APPLE_BUNDLE;

	apnProvider.send(notification, deviceToken).then((result) => {
		apnProvider.shutdown();
		resolve(ResponseUtility.SUCCESS);
	}).catch((err) => {
		apnProvider.shutdown();
		reject(ResponseUtility.ERROR({ message: 'Error sending push notitication', error: err }));
	});
});
