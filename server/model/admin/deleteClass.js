import { ClassSchema } from '../schemas';
import database from '../../db';
import { ResponseUtility } from '../../utility';

const ClassModel = database.model('Classes', ClassSchema);
/**
 * miroservice to delete the requested class
 * @author gaurav sharma
 * @since 19th April 2018
 *
 * @param {String} classId
 * @param {Boolean} deleted
 */
export default ({ classId, deleted = true }) => new Promise(async (resolve, reject) => {
	console.log(classId, deleted);
	if (classId) {
		const lookupQuery = { _id: classId };
		const updateQuery = { deleted };

		await ClassModel.update(lookupQuery, updateQuery);
		resolve(ResponseUtility.SUCCESS);
	} else {
		reject(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
});
