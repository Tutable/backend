import { CategorySchema } from '../schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';
import { S3Services } from '../../services';
import { S3_CATEGORY } from '../../constants';

const CategoryModel = database.model('Category', CategorySchema);
/**
 * this microservice will update the category by changing it's name
 * or adding/updating a picture
 * @author gaurav sharma
 * @since 6th April 2018
 */
export default ({ categoryId, title, picture }) => new Promise(async (resolve, reject) => {
	if (categoryId && (title || picture)) {
		const query = { _id: categoryId };

		const Key = picture ? typeof picture === 'object' ? `category-${categoryId}-${Date.now()}` : picture : undefined;
		if (typeof picture === 'object') {
			const Bucket = S3_CATEGORY;
			try {
				await S3Services.uploadToBucket({ Key, Bucket, data: picture });
				const category = await CategoryModel.findOne(query, { picture: 1 });
				if (category) {
					const {
						_doc: {
							picture,
						},
					} = category;
					if (picture) {
						try {
							await S3Services.removeFile({ Bucket, Key: picture });
						} catch (err) {
							console.log('Error removing requested file', err);
						}
					}
				} else {
					reject(ResponseUtility.ERROR({ message: 'Cannot find requested category.' }));
				}
			} catch (err) {
				reject(ResponseUtility.ERROR({ message: 'Error uploading the category picture', error: err }));
			}
		}
		const updateQuery = await SchemaMapperUtility({
			title,
			picture: Key,
		});

		CategoryModel.update(query, updateQuery)
			.then((modified) => {
				const { nModified } = modified;
				if (nModified) {
					return resolve(ResponseUtility.SUCCESS);
				}
				resolve(ResponseUtility.ERROR({ message: 'Nothing modified' }));
			}).catch(err => reject(ResponseUtility.ERROR({ message: '', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
