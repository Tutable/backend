/**
 * controller for categories
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { CategoriesServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	create: (req, res) => commonResolver(req, res, CategoriesServices.CategoriesCreateService),
	details: (req, res) => commonResolver(req, res, CategoriesServices.CategoriesDetailsService),
	update: (req, res) => commonResolver(req, res, CategoriesServices.CategoriesUpdateService),
	list: (req, res) => commonResolver(req, res, CategoriesServices.CategoriesListService),
	asset: commonPictureResolver,
};
