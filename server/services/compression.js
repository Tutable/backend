
/**
 * This module deals with the middleware for on the fly image compression
 * before uploading it to s3. High Resolution Images are avoided.
 * @author gaurav sharma
 * @since 27th March 2018
 *
 * @todo compress images only if they have size greater than 1MB, otherwise, pass images as it is
 * @todo handle multiple images upoad
 */
import path from 'path';
import fs from 'fs';
import Jimp from 'jimp';
import { ResponseUtility } from '../utility';
import { STANDARD_IMAGE_SIZE, MB } from '../constants';

export default (req, res, next) => {
	const { files, body: { data, id, email } } = req;
	if (data || files) {
		req.body = data ? JSON.parse(data) : {};
		if (id) {
			req.body.id = id;
			req.body.email = email;
		}

		if (files && Object.keys(files).length) {
			if (files.picture) {
				// single file here
				if (files.picture.size / MB >= STANDARD_IMAGE_SIZE) {
					return res.status(200).send({ code: 104, message: 'Image too large. Profile images must be less than 3MB.' });
				}
				const { picture: { data } } = files;
				Jimp.read(data, (err, image) => {
					if (err) {
						return res.status(200).send(ResponseUtility.ERROR({ message: 'Error loading the image.' }));
					}
					const randomFilename = `${Date.now()}_${Math.ceil(Math.random() * 10000 )}`;
					const pathname = path.resolve(__dirname, '../../', 'uploads', `${randomFilename}.jpg`);
					let quality = 60;
					const sizeInMB = files.picture.size / MB;
					if (sizeInMB > 1) {
						quality = 50;
					} // no compression for images below 1 MB
					image.quality(quality).write(pathname, (errWriting, written) => {
						image.getBuffer(Jimp.MIME_JPEG, (errBuffer, buffer) => {
							req.body.picture = buffer;

							fs.unlinkSync(pathname);	// remove the temporary file
							next();
						});
					});
				});
			} else if (Object.keys(files).length) {
				// other payload that need not to be comoressed
				// like identity documents
				// @todo impose restriction later on
				// upload multiple assets
				// making it directly uplaodable on s3
				Object.keys(files).map((key) => {
					const { data } = files[key];
					req.body[key] = data;
				});

				next();
			} else {
				return res.status(200).send(ResponseUtility.ERROR({ message: 'Expected an image or group of input images in this API.' }));
			}
		} else {
			// console.log('here');
			next();
		}
	} else {
		res.status(200).send(ResponseUtility.MISSING_REQUIRED_PROPS);
	}
};
