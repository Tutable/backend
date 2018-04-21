import { ContentSchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';

const ContentModel = database.model('Content', ContentSchema);
/**
 * microservice function to save the web content data
 * @author gaurav sharma
 * @since 21st April 2018
 */
export default ({ about, help, terms }) => new Promise(async (resolve, reject) => {
	if (about || help || terms) {
		const updateDocument = await SchemaMapperUtility({ about, help, terms });
		ContentModel.update({}, updateDocument, { upsert: true })
			.then(({ nModified }) => {
				if (!nModified) {
					reject(ResponseUtility.ERROR({ message: 'Nothing Modified.' }));
				}
				resolve(ResponseUtility.SUCCESS);
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error updating ', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
