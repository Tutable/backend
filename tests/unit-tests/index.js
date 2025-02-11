/**
* This is the indexer for utility
* @author gaurav sharma
* @since Tuesday, March 27, 2018 10:47 AM
*/
import fs from 'fs';

const skip = ['index.js',];
const files = fs.readdirSync(__dirname);

/**
 * pass in a function to call
 * @param {*} func
 */
const call = func => func();

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if(!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.')) {
			const loadedTests = require(`./${file}`);
			// Object.keys(loadedTests).map(test => console.log(test));
			Object.keys(loadedTests).map(testName => call(loadedTests[testName]));
		}
	}
});
