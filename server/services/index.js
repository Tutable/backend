/**
* This is the indexer for services
* @author gaurav sharma
* @since Tuesday, March 27, 2018 10:47 AM
*/
import fs from 'fs';

const skip = ['index.js', 'template'];
const files = fs.readdirSync(__dirname);

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.'))
			module.exports[`${fileName}Services`] = require(`./${file}`).default;
	}
});
