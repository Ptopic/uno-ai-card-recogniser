import config from '@shared/config';
import axios from 'axios';

const requestConfig = {
	baseURL: config.apiUrl,
	headers: {
		'Content-Type': 'application/json',
	},
};

const axiosInstance = axios.create(requestConfig);

axiosInstance.interceptors.response.use((response) => response.data);

export default axiosInstance;
