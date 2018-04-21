import { ContentSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ContentModel = database.model('Content', ContentSchema);
/**
 * microservice function to fetch the web content
 * @author gaurav sharma
 * @since 21st April 2018
 */
export default () => new Promise(async (resolve, reject) => {
	const content = await ContentModel.findOne({});
	if (!content) {
		reject(ResponseUtility.ERROR({ message: 'Data not found' }));
	}
	resolve(ResponseUtility.SUCCESS_DATA(content._doc));
});
