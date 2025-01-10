import CryptoJS from 'crypto-js';
import { KEY, IV } from '../config/constants';

export const encryptData = (data) => {
  try {
    // Return null/empty if data is empty
    if (!data) return data;

    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Convert key and IV to word arrays - matching C# UTF8 encoding
    const keyBytes = CryptoJS.enc.Utf8.parse(KEY);
    const ivBytes = CryptoJS.enc.Utf8.parse(IV);

    const encrypted = CryptoJS.AES.encrypt(jsonString, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      keySize: 128 / 8  // Matching RijndaelManaged default
    });

    // Get Base64 string to match C# Convert.ToBase64String()
    return encrypted.toString();
  } catch (error) {
    throw error; // Match C# exception throwing behavior
  }
};

export const decryptData = (encryptedData) => {
  try {
    if (typeof encryptedData !== 'string') return encryptedData;

    // Handle the case where the data comes as an object with EncryptedData property
    const dataToDecrypt = encryptedData.EncryptedData || encryptedData;

    // Clean and standardize the Base64 string
    let standardBase64 = dataToDecrypt
      .replace(/ /g, '+')     // Replace spaces with +
      .replace(/-/g, '+')     // Replace - with +
      .replace(/_/g, '/');    // Replace _ with /
    
    // Ensure proper padding
    const mod4 = standardBase64.length % 4;
    if (mod4 > 0) {
      standardBase64 += '='.repeat(4 - mod4);
    }

    const keyBytes = CryptoJS.enc.Utf8.parse(KEY);
    const ivBytes = CryptoJS.enc.Utf8.parse(IV);

    const decrypted = CryptoJS.AES.decrypt(standardBase64, keyBytes, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    // Try to parse as JSON, if it fails return the string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    return encryptedData;
  }
};

