/**
 * controller for reviews
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { ReviewsServices } from '../model';
import commonResolver from './commonResolver';
// import commonPictureResolver from './commonPictureResolver';

export default {
	create: (req, res) => commonResolver(req, res, ReviewsServices.ReviewsCreateService),
	list: (req, res) => commonResolver(req, res, ReviewsServices.ReviewsListService),
};
