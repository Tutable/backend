import { ClassSchema } from '../../model/schemas';
import database from '../../db';
import {
	ResponseUtility,
	SchemaMapperUtility,
} from '../../utility';

const ClassModel = database.model('Classes', ClassSchema);
/**
 * update class functionality
 * @author gaurav sharma
 * @since 19th April 2018
 *
 * @param {String} classId
 * @param {String} name
 * @param {String} category
 * @param {Number} level
 * @param {Number} rate
 */
export default ({
	classId,
	name,
	category,
	level,
	rate,
}) => new Promise(async (resolve, reject) => {
	if (classId && (name || category || level || rate)) {
		const lookupQuery = { _id: classId };
		const updateQuery = await SchemaMapperUtility({ name, category, level, rate });

		ClassModel.update(lookupQuery, updateQuery)
			.then(({ nModified }) => {
				if (!nModified) {
					reject(ResponseUtility.ERROR({ message: 'Nothing modified.' }));
				}
				resolve(ResponseUtility.SUCCESS);
			}).catch(err => reject(ResponseUtility.ERROR({ message: 'Error looking for classes.', error: err })));
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
