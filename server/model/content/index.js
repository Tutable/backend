/**
* This is the indexer for model
* @author gaurav sharma
* @since Tuesday, April 21st, 2018
*/
import fs from 'fs';

const skip = ['index.js'];
const files = fs.readdirSync(__dirname);

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.')) {
			module.exports[`Contents${fileName}Service`] = require(`./${file}`).default;
		}
	}
});
