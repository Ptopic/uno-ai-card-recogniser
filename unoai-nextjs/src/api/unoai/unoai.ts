import axios from '../base';

export interface IUploadImageData {
	image: string | undefined;
}
const uploadImage = async (image: string | null | undefined): Promise<any> =>
	await axios.post('/object-to-json', {
		image: image,
	});

export default uploadImage;
