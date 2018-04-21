/**
 * this controller contains the controlling handing
 * for content data
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { ContentServices } from '../model';
import commonResolver from './commonResolver';

export default {
	save: (req, res) => commonResolver(req, res, ContentServices.ContentsSaveService),
	details: (req, res) => commonResolver(req, res, ContentServices.ContentsDetailsService),
};
