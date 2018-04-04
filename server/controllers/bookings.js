/**
 * controller for bookings
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { BookingsServices } from '../model';
import commonResolver from './commonResolver';
// import commonPictureResolver from './commonPictureResolver';

export default {
	create: (req, res) => commonResolver(req, res, BookingsServices.BookingsCreateService),
};
