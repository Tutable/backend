import { CategorySchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';
import { S3_CATEGORY } from '../../constants';

const CategoryModel = database.model('Category', CategorySchema);
/**
 * microservice to fetch the all categories
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @param {String} id
 * @param {String} title
 * either id or title is required. If both provided, id would
 * be picked up by default.
 * @return Promise
 */
export default ({ parent = false }) => new Promise((resolve, reject) => {
	let query = {};
	if (parent) {
		query = { parent: undefined };
	}
	CategoryModel.find(query)
		.then((response) => {
			const ultimateResponse = [];
			response.map((category) => {
				const {
					_doc: {
						_id,
						title,
						picture,
						parent,
					},
					_doc,
				} = category;
				ultimateResponse.push(Object.assign({}, _doc, {
					_id: undefined,
					id: _id,
					title,
					picture: picture ? `/categories/asset/${S3_CATEGORY}/${picture}` : undefined,
					parent,
				}));
			});

			resolve(ResponseUtility.SUCCESS_DATA(ultimateResponse));
		})
		.catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for categories', error: err })));
});
