import axios from 'axios';
import { encryptData, decryptData } from './encryption';
import { config } from '../config/constants';

const axiosInstance = axios.create();

// Request interceptor
axiosInstance.interceptors.request.use(
  (reqConfig) => {
    try {
      // Add default headers
      const defaultConfig = config();
      reqConfig.headers = { ...reqConfig.headers, ...defaultConfig.headers };

      // Don't encrypt GET request params
      if (reqConfig.method?.toLowerCase() === 'get') {
        return reqConfig;
      }

      // Encrypt request data for POST, PUT, DELETE if it exists
      if (reqConfig.data) {
        const encryptedData = encryptData(reqConfig.data);
        if (encryptedData) {
          reqConfig.data = {
            Request: encryptedData
          };
        }
      }

      return reqConfig;
    } catch (error) {
      return reqConfig; // Return original config if encryption fails
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    try {
      // Check if response has data and it's encrypted
      
      if (response?.data?.encryptedData) {
        const decryptedData = decryptData(response?.data?.encryptedData);
        if (decryptedData) {
          response.data = decryptedData;
        }
      }
      
      return response;
    } catch (error) {
      
      return response; // Return original response if decryption fails
    }
  },
  (error) => {
    
    return Promise.reject(error);
  }
);

// Add debugging
if (process.env.NODE_ENV === 'development') {
  axiosInstance.interceptors.request.use(request => {
    
    return request;
  });

  axiosInstance.interceptors.response.use(response => {
    
    return response;
  });
}

export default axiosInstance; 