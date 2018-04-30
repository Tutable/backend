/**
 * controller for certificates
 * @author gaurav sharma
 * @since 28th March 2018
 */
import { CertificationServices } from '../model';
import commonResolver from './commonResolver';
import commonPictureResolver from './commonPictureResolver';

export default {
	save: (req, res) => commonResolver(req, res, CertificationServices.CertificationSaveService),
	details: (req, res) => commonResolver(
		req,
		res,
		CertificationServices.CertificationDetailsService,
	),
	delete: (req, res) => commonResolver(req, res, CertificationServices.CertificationDeleteService),
	asset: commonPictureResolver,
};
