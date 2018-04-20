import { CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3Services } from '../../services/s3';
import { S3_CATEGORY } from '../../constants';

const CategoryModel = database.model('Categories', CategorySchema);
/**
 * this model function will help to create a category in database
 */
export default ({ title, parent, picture }) => new Promise(async (resolve, reject) => {
	if (title) {
		// check if title already exists
		const query = { $and: [{ title }, { parent }] };
		CategoryModel.findOne(query)
			.then(async (result) => {
				if (result) {
					return reject(ResponseUtility.ERROR({ message: 'Duplicate category name.' }));
				}
				const Key = picture ? typeof picture === 'object' ? `category-${Date.now()}` : picture : undefined;
				if (typeof picture === 'object') {
					// trigger uploading on s3
					const Bucket = S3_CATEGORY;
					try {
						await S3Services.uploadToBucket({ Bucket, Key, data: picture });
					} catch (err) {
						return reject(ResponseUtility.ERROR({ message: 'Error uploading to S3', error: err }));
					}
				}
				const category = new CategoryModel({
					title,
					parent,
					picture: Key,
				});

				category.save()
					.then(() => resolve(ResponseUtility.SUCCESS))
					.catch(err => resolve(ResponseUtility.ERROR({ message: 'Error saving category', error: err })));
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for category', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
