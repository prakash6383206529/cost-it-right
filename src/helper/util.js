import { toastr } from "react-redux-toastr";
import Moment from 'moment';
import { MESSAGES } from '../config/message';
import { reactLocalStorage } from 'reactjs-localstorage';

/** 
* @method  apiErrors
* @desc Response error handler.
* @param res
*/
export const apiErrors = (res) => {
    const response = res ? res.response : undefined;

    if (response && response.data && response.data.error && response.data.error.message && response.data.error.message.value) {
        toastr.error(response.data.error.message.value);
    } else if (response) {
        if (response.status && response.status === 417) {
            toastr.error(response.data.Message);
        } else if (response.status && response.status === 302) {
            toastr.warning(response.data.Message);                      //used for not able to delete associated ID's 
        } else if (response.status && response.status === 400) {
            toastr.error('Something went wrong please try again.');
        } else if (response.status && response.status === 401) {
            toastr.error('Your session has been expired. Please login again');
        } else if (response && response.status === 403) {
            toastr.error('Server error occurred, please try again after sometime.');
        } else if (response && response.status === 406) {
            toastr.error('User does not exist.');
        } else if (response && response.status === 412) {
            const errMsg = response && response.data && response.data.Message ? response.data.Message : 'Something went wrong please try again.';
            toastr.error(errMsg);
        } else if (response && (response.status === 500 || response.status === 501 || response.status === 503 || response.status === 502)) {
            toastr.error('Server error occurred, please try again after sometime.');
        } else if (response.status && response.status === 404) {
            toastr.error('this record does not exist.');
        } else {
            toastr.error('Something went wrong please try again.');
        }
    } else {
        toastr.error('Something went wrong please try again.');
    }

}

/** 
* @method  capitalizeFirstLetter
* @desc CAPILIZE FIRST LETTER
* @param res
*/
export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/** 
* @method  formatDate
* @desc FORMATTED DATE
*/
export function formatDate(date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct',
        'Nov', 'Dec'];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

/** 
* @method  convertISOToUtcDate
* @desc CONVERT ISO TO UTC DATE
* @param res
*/
export function convertISOToUtcDate(date) {
    return Moment.utc(date).format('MM/DD/YYYY');
}

/** 
* @method  convertISOToUtcForTime
* @desc CONVERT ISO TO TIME
* @param res
*/
export function convertISOToUtcForTime(date) {
    return Moment.utc(date).format('hh:mm A');
}

/** 
* @method stripHtml
* @desc STRIP HTML FROM STRING
* @param res
*/
export function stripHtml(text) {
    return text.replace(/<[^>]+>/g, '');
}

/** 
* @method convertDate
* @desc CONVERT INTO DATE TIME
*/
export function convertDate(date) {
    return Moment(date).format('DD-MMM-YYYY hh:mm A');
}

/** 
* @method displayDateTimeFormate
* @desc DISPLAY DATE TIME FORMATE
*/
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

//let showConnectionAlert = true;
export function requestError(error) {
    // if (error.code === 'ECONNABORTED' && showConnectionAlert) {
    //     // alert(error.config.url);
    //     showConnectionAlert = false;
    //     Alert.alert(
    //         'Poor Connection',
    //         'Poor internet connection. Try later!',
    //         [
    //             { text: 'OK', onPress: () => { showConnectionAlert = true; } },
    //         ],
    //         { cancelable: false }
    //     )
    // }
}

/**
* @method validateText
* @descriptin RETURN TEXT
**/
export function validateText(text) {
    let newText = '';
    const numbers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    for (let i = 0; i < text.length; i++) {
        if (numbers.indexOf(text[i]) > -1) {
            newText = newText + text[i];
        }
    }
    return newText;
}

/**
* @method displayValue
* @descriptin Used to display value otherwise show N/A
**/
export const displayValue = (value) => {
    if (typeof value !== 'undefined' && typeof value !== 'object' && value.trim() !== '') {
        return value.trim();
    } else {
        return 'N/A';
    }
};

/**
* @method onLogout
* @descriptin LOGOUT THEN REDIRECT TO LOGIN PAGE
**/
function onLogout() {
    reactLocalStorage.setObject("isUserLoggedIn", false);
    reactLocalStorage.setObject("userDetail", {});
    toastr.success(MESSAGES.LOGOUT_SUCCESS);
    setTimeout(() => {
        window.location.assign('/login');
    }, 100)
}

/**
* @method convertObjectToArray
* @descriptin CONVER OBJECT TO ARRAY
**/
export const convertObjectToArray = (valueArray) => {
    let tempArray = [];
    valueArray.map((val) => {
        tempArray.push(val.text);
        return tempArray;
    });

};

/**
* @method getFileExtension
* @descriptin GET FILE EXTENSION
**/
export const getFileExtension = (filename) => {
    return filename.split('.').pop();
};

/**
* @method stringToArray
* @descriptin CONVER STRING TO ARRAY
**/
export const stringToArray = (str) => {
    let convertedArray = [];
    if (typeof str != undefined && typeof str == 'string') {
        const convertedStr = str.split(',');
        convertedArray = JSON.parse(convertedStr);
    }
    return convertedArray;
};

/**
* @method displayTitle
* @descriptin DISPLAY TITLE
**/
export const displayTitle = (text) => {
    return text.replace(/\r?\n|\r/g, "");
};

/**
* @method formatAddress
* @descriptin FORMAT ADDRESS
**/
export const formatAddress = (address, city, state, country, zipCode) => {
    const formatedAddress = [address, city, state, country, zipCode];
    const res = formatedAddress.filter(Boolean).join(', ');
    return res;
};


export function displayPublishOnDate(date) {
    const currentDate = Moment().format('YYYY-MM-DD');
    // convert date to validate and check with current date 
    const checkValidDate = Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD');
    // convert date is valid or not
    if (Moment(Moment(checkValidDate).format('YYYY-MM-DD'), 'YYYY-MM-DD', true).isValid()) {
        // check day difference is not less or grater then zero  
        if (checkNumberOfDayDiff(checkValidDate, currentDate) === 0) {
            return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('hh:mm A');
        } else if (checkNumberOfDayDiff(checkValidDate, currentDate) === -1) {
            return 'Yesterday';
        } else {
            return Moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MM/DD/YYYY');
        }
    } else {
        return 'N/A';
    }
}

/**
 * @description GET DAY DIFF
 * @param checkNumberOfDayDiff
 * @returns {string}
 */
export function checkNumberOfDayDiff(date1, date2) {
    let dt1 = new Date(date1);
    let dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}

/**
 * @description GET OPTION LIST
 * @param renderOptionList
 * @returns {string}
 */
export function renderOptionList(categoriesMaster) {
    let categoryArray = [];
    categoriesMaster.map((val) => {
        let obj = {};
        obj.label = val;
        obj.value = val;
        categoryArray.push(obj);
    });
    return categoryArray;
}

export function renderAction(menuData = [], Master = '', actionKey = '') {

}

/**
 * @description GET MACHINE RATE
 * @param machineRateCalculation
 * @returns {string}
 */
export function machineRateCalculation(Data) {

    const MachineRateCost = Data.RateOfInterest +
        Data.TotalDepreciationCost +
        Data.NetPowerCost +
        Data.RateSkilledLabour +
        Data.RateSemiSkilledLabour +
        Data.RateUnskilledLabour +
        Data.RateContractLabour +
        Data.ConsumableCost +
        Data.MaintenanceCharges;

    return MachineRateCost;
}

/**
 * @description function for get uploaded file extention
 * @param url
 * @returns {string}
 */
export function getFileExtention(url) {
    let ext = '';
    let fileUrl = '';
    if (url.includes('firebasestorage')) {
        fileUrl = url.split('?');
        fileUrl = fileUrl[0].split('.');
        ext = fileUrl[fileUrl.length - 1];
    } else {
        fileUrl = url.split('.');
        ext = fileUrl[fileUrl.length - 1];
    }
    return ext.toUpperCase() + ' ';
}

/**
 * @description function for get token header
 * @param customTokenHeader
 * @returns {string}
 */
export function customTokenHeader() {
    const userObj = reactLocalStorage.getObject('userResponse');
    const customHeader = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return customHeader;
}

/**
 * @description CHECK PERMISSION AND PRIVILEGE 
 * @param checkPermission
 * @returns {string}
 */
export function checkPermission(Data) {
    let setAccessibleData = {
        Add: false,
        Edit: false,
        Delete: false,
        View: false,
        Download: false,
        BulkUpload: false,
        Activate: false,
    }

    Data && Data.map((item) => {
        if (item.ActionName === 'Add' && item.IsChecked === true) {
            setAccessibleData.Add = true;
        }
        if (item.ActionName === 'Edit' && item.IsChecked === true) {
            setAccessibleData.Edit = true;
        }
        if (item.ActionName === 'Delete' && item.IsChecked === true) {
            setAccessibleData.Delete = true;
        }
        if (item.ActionName === 'View' && item.IsChecked === true) {
            setAccessibleData.View = true;
        }
        if (item.ActionName === 'Download' && item.IsChecked === true) {
            setAccessibleData.Download = true;
        }
        if (item.ActionName === 'Bulk Upload' && item.IsChecked === true) {
            setAccessibleData.BulkUpload = true;
        }
        if (item.ActionName === 'Activate' && item.IsChecked === true) {
            setAccessibleData.Activate = true;
        }
    })

    return setAccessibleData;
}

/**
 * @description CHECK PERMISSION AND PRIVILEGE 
 * @param checkPermission
 * @returns {string}
 */
export function calculatePercentage(value) {
    return value / 100
}