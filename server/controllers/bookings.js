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
	cancel: (req, res) => commonResolver(req, res, BookingsServices.BookingsCancelService),
	details: (req, res) => commonResolver(req, res, BookingsServices.BookingsDetailsService),
	action: (req, res) => commonResolver(req, res, BookingsServices.BookingsActionService),
	list: (req, res) => commonResolver(req, res, BookingsServices.BookingsListService),
};
