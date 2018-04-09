/**
 * controller for notifications
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { NotificationsServices } from '../model';
import commonResolver from './commonResolver';
// import commonPictureResolver from './commonPictureResolver';

export default {
	details: (req, res) => commonResolver(req, res, NotificationsServices.NotificationDetailsService),
};
