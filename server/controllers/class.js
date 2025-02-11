/**
 * controllers related to teacher classes
 * @author gaurav sharma
 * @since 30th March 218
 */
import { ClassServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	create: (req, res) => commonResolver(req, res, ClassServices.ClassCreateService),
	details: (req, res) => commonResolver(req, res, ClassServices.ClassDetailsService),
	list: (req, res) => commonResolver(req, res, ClassServices.ClassListService),
	update: (req, res) => commonResolver(req, res, ClassServices.ClassUpdateService),
	assets: commonPictureResolver,
};
