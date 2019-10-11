
import Moment from 'moment';
export * from './util';
export * from './validation';




// import { apiErrors, capitalizeFirstLetter, formatDate, convertISOToUtcDate, 
//          stripHtml, convertDate, requestError, validateText, 
//          displayValue, convertObjectToArray, getFileExtension,
//         stringToArray, displayTitle, formatAddress, displayPublishOnDate, 
//         checkNumberOfDayDiff } from './util';

// import { minLength1, minLength3, minLength5, minLength10, maxLength11,
//          maxLength12, maxLength25, maxLength30, maxLength70, maxLength100,
//          maxLength300, validateEmail, email, required, number, 
//          alphabetsOnly, validatePassword, alphaNumeric, vlidatePhoneNumber, 
//          validateUrl } from './validation';        


// export { apiErrors, capitalizeFirstLetter, formatDate, convertISOToUtcDate, 
//         stripHtml, convertDate, requestError, validateText, 
//         displayValue, convertObjectToArray, getFileExtension,
//         stringToArray, displayTitle, formatAddress, displayPublishOnDate, 
//         checkNumberOfDayDiff, minLength1, minLength3, minLength5, minLength10, maxLength11,
//         maxLength12, maxLength25, maxLength30, maxLength70, maxLength100,
//         maxLength300, validateEmail, email, required, number, 
//         alphabetsOnly, validatePassword, alphaNumeric, vlidatePhoneNumber, 
//         validateUrl }         


export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getFileExtension = (filename) => {
    return filename.split('.').pop();
};

/* display each value */
export const displayValue = (value) => {
    if (typeof value != 'undefined' && typeof value != 'object' && value.trim() != '') {
        return value.trim();
    } else {
        return 'N/A';
    }
};

export function convertISOToUtcDate(date) {
    return Moment.utc(date).format('MM/DD/YYYY');
}

export const displayTitle = (text) => {
    return text.replace(/\r?\n|\r/g, "");
};
export const formatAddress = (address, city, state, country, zipCode) => {
    const formatedAddress = [address, city, state, country, zipCode];
    const res = formatedAddress.filter(Boolean).join(', ');
    return res;
};


export function displayDateTimeFormate(date) {
    const currentDate = Moment();
    const dateObj = Moment(date);
    if (Moment(Moment(date).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid()) {
        // check day difference is not less or grater then zero 
        if (checkNumberOfDayDiff(date, currentDate) === 0) {
            const remainingTimeInMinutes = currentDate.diff(dateObj, 'minutes');
            if (remainingTimeInMinutes > 720) {
                return `Today ${Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MM/DD/YYYY hh:mm A')}`;
            } else if (remainingTimeInMinutes >= 60 && remainingTimeInMinutes < 720) {
                const remainingTimeInHours = currentDate.diff(dateObj, 'hours');
                return `${remainingTimeInHours} hours ago`;
            } else if (remainingTimeInMinutes < 60 && remainingTimeInMinutes > 0) {
                return `${remainingTimeInMinutes} min(s) ago`;
            } else if (remainingTimeInMinutes === 0) {
                return 'few seconds ago';
            } else {
                return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A');
            }
        } else if (checkNumberOfDayDiff(date, currentDate) >= 1 && checkNumberOfDayDiff(date, currentDate) <= 7) {
            return Moment(date).format('ddd hh:mm A');
        } else {
            return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MM/DD/YYYY hh:mm A');
        }
    } else {
        return 'N/A';
    }
}

function checkNumberOfDayDiff(date1, date2) {
    let dt1 = new Date(date1);
    let dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}
export const checkValidationForCompanyPublish = (data) => {
    if (data.name !== '' && data.listingType !== '' && data.categories !== '' && data.services !== '' &&
        data.address !== '' && data.city !== '' && data.country !== '' && data.zipCode !== '' && data.state !== '' &&
        data.publicEmail !== '' && data.listingOwnerPrivateEmail !== '' && data.listingOwnerPrivateFullName !== '') {
        console.log('checkValidationForCompanyPublish', 'Success');
        return true;
    }
    return false;
};

