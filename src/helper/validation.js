import DayTime from '../components/common/DayTimeWrapper';
import Toaster from '../components/common/Toaster';
import { reactLocalStorage } from 'reactjs-localstorage';
import _ from 'lodash'
import { NUMBERMAXLENGTH } from '../config/masterData';
import BigNumber from 'bignumber.js';

// Ensure your configuration for BigNumber, only needs to be done once:
BigNumber.config({ DECIMAL_PLACES: 10 });

export const minLength = min => value =>
    value && value.length < min ? `Min length must be ${min}.` : undefined;

export const maxLength = max => value =>
    value && value.length > max ? `Max length must be ${max}.` : undefined;

//THIS IS FOR MIN VALUE
export const minValue = min => value =>
    value && value < min ? `Min value must be ${min}.` : undefined;

//THIS IS FOR MAX VALUE
export const maxValue = max => value =>
    value && value > max ? `Maximum value should be ${max}.` : undefined;

export const maxPercentageValue = max => value =>
    value && value > max ? `Percentage value should be equal to ${max}.` : undefined;

export const minValue1 = minValue(1);
export const minValueLessThan1 = minValue(0.1);
export const maxValue366 = maxValue(366)
export const maxPercentValue = maxPercentageValue(100)
export const maxValue24 = maxValue(24)
export const maxValue31 = maxValue(31)

export const minLength1 = minLength(1);
export const minLength2 = minLength(2);
export const minLength3 = minLength(3);
export const minLength4 = minLength(4);
export const minLength5 = minLength(5);
export const minLength6 = minLength(6);
export const minLength7 = minLength(7);
export const minLength10 = minLength(10);

export const maxLength2 = maxLength(2);
export const maxLength3 = maxLength(3);
export const maxLength4 = maxLength(4);
export const maxLength5 = maxLength(5);
export const maxLength6 = maxLength(6);
export const maxLength7 = maxLength(7);
export const maxLength9 = maxLength(9);
export const maxLength10 = maxLength(10);
export const maxLength11 = maxLength(11);
export const maxLength15 = maxLength(15);
export const maxLength18 = maxLength(18);
export const maxLength12 = maxLength(12);
export const maxLength25 = maxLength(25);
export const maxLength20 = maxLength(20);
export const maxLength26 = maxLength(26);
export const maxLength30 = maxLength(30);
export const maxLength32 = maxLength(32);
export const maxLength45 = maxLength(45);
export const maxLength50 = maxLength(50);
export const maxLength70 = maxLength(70);
export const maxLength71 = maxLength(71);
export const maxLength75 = maxLength(75);
export const maxLength85 = maxLength(85);
export const maxLength100 = maxLength(100);
export const maxLength200 = maxLength(200);
export const maxLength250 = maxLength(250);
export const maxLength500 = maxLength(500);
export const maxLength300 = maxLength(300);
export const maxLength1000 = maxLength(1000);
export const maxLength5000 = maxLength(5000);
export const maxLength512 = maxLength(512);
export const maxLength80 = maxLength(80);



//export const maxLengthN = maxLength(n)

export const checkFacebooklink = value =>
    value && !/^(http|https):\/\/www.facebook.com\/.*/i.test(value) ? 'Please enter valid url' : undefined;


export const checkTwitterlink = value =>
    value && !/^(http|https):\/\/www.twitter.com\/.*/i.test(value) ? 'Please enter valid url' : undefined;


export const checkinstagramlink = value =>
    value && !/^(http|https):\/\/www.instagram.com\/.*/i.test(value) ? 'Please enter valid url' : undefined;


export const checkYoutubelink = value =>
    value && !/^(http|https):\/\/www.youtube.com\/.*/i.test(value) ? 'Please enter valid url' : undefined;

export const checkSnapchatlink = value => {
    return (value && !/^(http|https):\/\/www.snapchat.com\/.*/i.test(value));
}

export const checkIMDBlink = value => {
    return (value && !/^(http|https):\/\/www.imdb.com\/.*/i.test(value));
}
export const checkMusicallylink = value =>
    value && !/^(http|https):\/\/www.musical.ly.com\/.*/i.test(value) ? 'Please enter valid url' : undefined;

export const validateEmail = value => {
    return (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value));
}

export const email = value =>
    value && !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(value)
        ? 'Please enter a valid email address.'
        : undefined;

export const website = value =>
    value && !/^[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/i.test(value)
        ? 'Please enter a valid website.'
        : undefined;

export const required = value =>
((typeof value !== 'undefined' && value !== null && value !== "")
    ? undefined : 'This field is required.');

export const requiredDropDown = value =>
    ('This field is required.');

export const selectRequired = value =>
((typeof value !== 'undefined' && value !== null && value !== "")
    ? undefined : 'This field is required.');

export const checkWhiteSpaces = value => {
    return value && (String(value)?.startsWith(' ') || String(value)?.endsWith(' ')) ? 'Text should not start and end with space.' : undefined;
}
export const checkSpacesInString = value => {
    return value && value.includes('  ') ? 'The field should not contain more than one space.' : undefined;
}
export const checkSingleSpaceInString = value => {
    return value && value.includes(' ') ? 'The field should not contain space.' : undefined;
}
export const number = value =>
    value && (isNaN(Number(value)) || Number(value) < 0 || !/^\d*\.?\d+$/.test(value))
        ? 'Please enter a positive number.' : undefined;

// This is to check negative number for disaled or autocalculated fields
export const disableNegativeNumber = value =>
    value && (isNaN(Number(value)) || Number(value) < 0 || !/^\d*\.?\d+$/.test(value))
        ? 'Negative number is not allowed, please verify your calculations.' : undefined;

export const postiveNumber = value =>
    value && !/^\+?(0|[0-9]\d*)$/.test(value)
        ? 'This field is invalid.' : undefined;

export const positiveAndDecimalNumber = value =>
    value && !/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(value)
        ? 'This field is invalid.' : undefined;

export const decimalNumberLimit = value =>
    value && !/^\d{0,6}(\.\d{0,4})?$/.test(value)
        ? 'Maximum length for integer is 6 and for decimal is 4' : undefined;

//ACCEPT ALPHABET,NUMBER,SPECIAL CHARACTER BUT NOT ONLY SPECIAL CHARACTER
export const acceptAllExceptSingleSpecialCharacter = value => {
    let pattern = /[0-9a-zA-Z](?=@.#%_!\^&\*\(\)-+=\?<>,|)/;
    return value && !pattern.test(value)
        ? 'Invalid field' : undefined;
}
// For alphanumeric
export const excludeOnlySpecialCharacter = value =>
    value && /^(?=.*[@#$%^&+=/`:;"'<>?/.,|~!*()]).*$/.test(value)
        ? 'This field do not accept  special character' : undefined;

export const alphabetsOnly = value =>
    value && /[^a-zA-Z ]/i.test(value)
        ? 'Only alphabets are allowed.' : undefined;

export const alphabetsOnlyForName = value =>
    value && /[^a-zA-Z ]/i.test(value)
        ? 'Please enter a valid name.' : undefined;

export const specialName = value =>
    value && /[^A-Za-z 0-9]/i.test(value)
        ? 'Please enter a valid name.' : undefined;

export const validatePassword = value => {

    return (value && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#?!@$%^&*-]).{5,}$/.test(value) === false);

}


export const alphaNumeric = value =>
    value && /[^a-zA-Z0-9 ]/i.test(value)
        ? 'Please enter only alphabets or numbers.'
        : undefined;

export const notSingleSpecialCharacter = value =>
    value && !/^[a-zA-Z0-9 ]*$/i.test(value)
        ? 'Please enter some alphabets and numbers also.'
        : undefined;

export const alphaNumericTitle = value =>
    value && /[^a-zA-Z0-9 ]/i.test(value)
        ? 'Title can contain only alphabets and numbers.'
        : undefined;

export const vlidatePhoneNumber = value => {
    return (value && /(?:\+?61)?(?:\(0\)[23478]|\(?0?[23478]\)?)\d{8}/.test(value) === false);
}

export const validateUrl = value =>
    (value && /^(http:|https:)\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/.test(value) === false) ? 'Please enter valid url' : undefined;

export const upper = value => value && value.toUpperCase();

export const normalizePhone = value => {
    if (!value) {
        return value
    }
    return value.replace(/[^\d]/g, '')
}

export const decimalNumber13 = value =>
    value && !/^[0-9]\d{0,12}(\.\d{1,2})?%?$/i.test(value)
        ? 'Invalid number'
        : undefined;

//     export const decimalNumber10 = value =>
// value && !/^[0-9]\d{0,12}(\.\d{1,10})?%?$/i.test(value)
//     ? 'Invalid number'
//     : undefined;

export const decimalLength = max => value =>
    value && !/^[0-9]*(?:\.[0-9]{1,2})?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;

export const decimalLength3 = max => value =>
    value && !/^[0-9]*(?:\.[0-9]{0,3})?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;

export const decimalLength4 = max => value =>
    value && !/^[0-9]*(?:\.[0-9]{0,4})?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;

export const decimalLength6 = max => value =>
    value && !/^[0-9]*(?:\.[0-9]{0,6})?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;
export const decimalLength2 = decimalLength(2);
export const decimalLengthThree = decimalLength3(3);
export const decimalLengthFour = decimalLength4(4);
export const decimalLengthsix = decimalLength6(6);

export const getNameBetweenBraces = (name) => {
    const firstIndex = name.indexOf('(');
    const lastIndex = name.lastIndexOf(')');
    const finalName = name.substring(firstIndex + 1, lastIndex);
    return finalName;
}

export const getSupplierCode = (name) => {
    if (name !== '') {
        const firstIndex = name.indexOf('-(');
        const lastIndex = name.lastIndexOf(')');
        const supplierCode = name.substring(firstIndex + 2, lastIndex);
        return supplierCode;
    } else {
        return '';
    }
}

export const getCodeBySplitting = (name) => {
    if (name !== '') {
        const lastIndex = name.lastIndexOf('(');
        const lastClosingIndex = name.lastIndexOf(')');

        if (lastIndex !== -1 && lastClosingIndex !== -1 && lastClosingIndex > lastIndex) {
            const supplierCode = name.substring(lastIndex + 1, lastClosingIndex).trim();
            return supplierCode;
        }
    }
    return '';
}
export const getNameBySplitting = (name) => {
    if (name !== '') {
        const lastIndex = name.lastIndexOf('(');
        const lastClosingIndex = name.lastIndexOf(')');

        if (lastIndex !== -1 && lastClosingIndex !== -1 && lastClosingIndex > lastIndex) {
            const vendorName = name.substring(0, lastIndex).trim();
            return vendorName;
        }
    }
    return '';
}
export const applySuperScript = (cell) => {
    if (cell && cell !== '') {
        const capIndex = cell && cell.indexOf('^');
        const superNumber = cell.substring(capIndex + 1, capIndex + 2);
        const capWithNumber = cell.substring(capIndex, capIndex + 2);
        return cell.replace(capWithNumber, superNumber.sup());
    } else {
        return '';
    }
}

export const trimTwoDecimalPlace = (floatValue) => {
    var decimalTextLength = 0;
    if (undefined !== floatValue.toString().split('.')[1]) {
        decimalTextLength = (floatValue.toString().split('.')[1]).length;
    }
    if (decimalTextLength > 2) {
        floatValue = parseFloat(floatValue.toString().substring(0, (floatValue.toString().length - (((floatValue.toString().split('.')[1]).length) - 2))));
    }
    return floatValue;
}

export const trimFourDecimalPlace = (floatValue) => {
    var decimalTextLength = 0;
    if (undefined !== floatValue) {
        if (undefined !== floatValue.toString().split('.')[1]) {
            decimalTextLength = (floatValue.toString().split('.')[1]).length;
        }
    }
    if (decimalTextLength > 4) {
        floatValue = parseFloat(floatValue.toString().substring(0, (floatValue.toString().length - (((floatValue.toString().split('.')[1]).length) - 4))));
    }
    return floatValue;
}

export const trimDecimalPlace = (floatValue, decimalPlaces) => {
    if (floatValue !== null && !isNaN(floatValue) && typeof decimalPlaces === 'number' && decimalPlaces >= 0) {
        try {

            const value = new BigNumber(floatValue ?? 0)
            const roundedValue = value?.decimalPlaces(decimalPlaces);
            const finalValue = roundedValue?.toNumber()
            return finalValue;
        } catch (error) {
            return floatValue;  // or handle the error accordingly
        }
    }
};



export const checkForDecimalAndNull = (floatValue, decimalPlaces) => {
    const localStorageConfig = reactLocalStorage.getObject('InitialConfiguration');

    // Ensure floatValue is wrapped in a BigNumber, even if null or undefined
    let value = new BigNumber(floatValue ?? 0);

    if (localStorageConfig && localStorageConfig.IsRoundingVisible) {
        // Make sure decimalPlaces is a valid number before rounding
        if (typeof decimalPlaces === 'number' && decimalPlaces >= 0) {
            try {
                value = value.decimalPlaces(decimalPlaces);
            } catch (error) {
                // Handle the error when the decimalPlaces method fails
                return value
            }
        }
    } else {
        try {
            // Assuming trimDecimalPlace is supposed to handle null or undefined values inside
            value = new BigNumber(trimDecimalPlace(value.toNumber(), decimalPlaces));
        } catch (error) {
            // Handle the error when creating a new BigNumber fails
            return value
        }
    }

    // Convert the resulting BigNumber to a number and use checkForNull to validate
    try {
        const number = value.toNumber();
        return checkForNull(number);
    } catch (error) {
        // Handle the error when converting BigNumber to a number fails
        return value
    }
};
export const checkForNull = (ele = 0) => {
    if (ele == null || ele === '' || isNaN(Number(ele)) || ele === undefined || ele === Infinity || ele === -Infinity) {
        return 0; // Return zero directly if the input is not a valid number.
    } else {
        try {
            // Enforce a maximum number of decimal places that can be safely operated on.
            return Number(new BigNumber(ele).toFixed(16)); // Change 16 to however many decimal places you deem safe.
        } catch {
            return 0
        }
    }
};

export const Numeric = value => {
    return value && /[^0-9]/i.test(value) ? 'Please enter valid number' : undefined;
}

export const isGuid = (value) => {
    var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    var match = regex.exec(value);
    return match != null;
}

export const getJsDateFromExcel = excelDate => {
    return (DayTime((excelDate - (25567 + 2)) * 86400 * 1000)).format('YYYY-MM-DD 00:00:00');
};

//CHECK WHETHER PERCENTAGE VALUE IS MORE THAN 100 
export const checkPercentageValue = (value, msg = "Percentage value should not be greater than 100") => {
    if (Number(value) > 100) {
        Toaster.warning(msg)
        return false
    }
    return true
}

//CHECK IS COSTING EFFECTIVE DATE SELECTED
export const CheckIsCostingDateSelected = (costingDate, currency, exchangeRateData = {}) => {

    const IsSelected = DayTime(costingDate).isValid() ? true : false;
    if (!IsSelected || currency?.label === null || currency?.label === undefined) {
        Toaster.warning('Please select Costing effective date and Currency.')
        return true;
    }
    // Check if both exchange rates are true
    if (exchangeRateData?.plantExchangeRate && exchangeRateData?.baseExchangeRate) {
        return false;
    }
    // Check currencies when one rate is true and other is false
    const isPlantCurrencySame = exchangeRateData?.plantFromCurrency === exchangeRateData?.plantToCurrency;
    const isBaseCurrencySame = exchangeRateData?.baseFromCurrency === exchangeRateData?.baseToCurrency;

    // If plant rate is true, check base currencies
    if (exchangeRateData?.plantExchangeRate && !exchangeRateData?.baseExchangeRate) {
        if (isBaseCurrencySame) {
            return false;
        }
        Toaster.warning(`Data does not exist in the Exchange Rate Master for ${exchangeRateData?.baseFromCurrency} to ${exchangeRateData?.baseToCurrency}. Please add it first and try again.`);
        return true;
    }
    // If base rate is true, check plant currencies
    if (!exchangeRateData?.plantExchangeRate && exchangeRateData?.baseExchangeRate) {
        if (isPlantCurrencySame) {
            return false;
        }
        Toaster.warning(`Data does not exist in the Exchange Rate Master for ${exchangeRateData?.plantFromCurrency} to ${exchangeRateData?.plantToCurrency}. Please add it first and try again.`);
        return true;
    }
    // If both rates are false, show both errors
    if (!exchangeRateData?.plantExchangeRate && !exchangeRateData?.baseExchangeRate) {
        let errorPairs = [];
        if (!isPlantCurrencySame) {
            errorPairs.push(`${exchangeRateData?.plantFromCurrency} to ${exchangeRateData?.plantToCurrency}`);
        }
        if (!isBaseCurrencySame) {
            errorPairs.push(`${exchangeRateData?.baseFromCurrency} to ${exchangeRateData?.baseToCurrency}`);
        }
        if (errorPairs.length > 0) {

            Toaster.warning(`Data does not exist in the Exchange Rate Master for ${errorPairs.join(' and ')}. Please add it first and try again.`);
            return true;
        }
        return false;
    }

    return false;
}

export const percentageOfNumber = (num, percentage) => {
    const number = (num == null || isNaN(Number(num)) || num === undefined || num === Infinity || num === -Infinity) ? 0 : Number(num);
    return (number / 100) * percentage;
}

export const strongPassword = value =>
    value && /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(value)
        ? undefined
        : 'Password should contain at-least : | one lower case letter(a-z) | one upper case letter(A-Z) | one digit(0-9) | one special character.';

//CHECK IS COSTING EFFECTIVE DATE SELECTED
export const decimalAndNumberValidation = (value) => {
    return value && !/^\d{0,4}(\.\d{0,7})?$/i.test(value) ? 'Maximum length for integer is 4 and for decimal is 7' : undefined;
}

export const decimalAndNumberValidationBoolean = (value) => {
    return value && !/^\d{0,6}(\.\d{0,6})?$/i.test(value) ? true : false;
}

export const nonZero = value =>
    value && (Number(value) === 0)
        ? 'Please enter a value greater than 0' : undefined;

export const decimalNumberLimit6 = value => {
    let tempValue = value && Number('0' + String(value)?.replace(/^0+/, ''))
    return tempValue && !/^[0-9][0-9]{0,5}(\.\d{0,6})?$/.test(tempValue)
        ? 'Maximum length for integer is 6 and for decimal is 6' : undefined;
}
export const decimalIntegerNumberLimit = (integerLimit, decimalLimit) => value => {
    let tempValue = value && Number('0' + String(value)?.replace(/^0+/, ''))
    return tempValue && !(new RegExp(`^[0-9][0-9]{0,${integerLimit - 1}}(\\.\\d{0,${decimalLimit}})?$`).test(tempValue))
        ? `Maximum length for integer is ${integerLimit} and for decimal is ${decimalLimit}` : undefined;
}
export const noDecimal = value =>
    value && !/^\d*$/.test(value)
        ? 'No Decimal allowed.' : undefined;

export const numberLimit6 = value =>
    String(value).replace(/^0+/, '') && !/^\d{0,6}?$/.test(String(value)?.replace(/^0+/, ''))
        ? 'Maximum length for integer is 6.' : undefined;

export const isNumber = value =>
    value && (isNaN(Number(value)) || Number(value) < 0)
        ? false : true;

export const percentageLimitValidation = value => {
    let tempValue = value && Number('0' + String(value)?.replace(/^0+/, ''))
    return tempValue && !/^[0-9][0-9]{0,2}(\.\d{0,6})?$/.test(tempValue)
        ? 'Maximum length for integer is 3 and for decimal is 6' : undefined;
}

export const hashValidation = value =>
    value && !/^[^#]*$/.test(value)
        ? 'Input should not contain #.' : undefined;

export const alphaNumericValidation = value =>
    value && !/[a-zA-Z0-9]$/.test(value)
        ? 'Input should contain alpha numeric characters only.' : undefined;

export const postiveNumberForPlantCode = value =>
    String(value).replace(/^0+/, '') && !/^\d{1,4}?$/.test(String(value)?.replace(/^0+/, ''))
        ? 'Plant Code should be 4 digit integer.' : undefined;

export const NoSignMaxLengthRegex = /^\d{0,6}(\.\d{0,6})?$/i;

export const NoSignNoDecimalRegex = /^\d*$/i;

export const NoSignMaxLengthMessage = `Input should be numeric, and should not exceed ${NUMBERMAXLENGTH} digit before and after decimal.`
export const NoSignNoDecimalMessage = `Input should be integer.`

export const timeValidation = value =>
    value && !/^([0-9]*):([0-5]?[0-9])$/.test(value)
        ? 'Input should not contain #.' : undefined;

export const isDateFormatter = value =>
    value && !/^[0-3]?[0-9].[0-3]?[0-9].(?:[0-9]{2})?[0-9]{2}$/.test(value)
        ? false : true;

export const decimalNumberLimit8 = value =>
    value && !/^\d{0,8}(\.\d{0,6})?$/.test(value)
        ? 'Maximum length for integer is 8 and for decimal is 6' : undefined;

//ACCEPT ALPHABET,NUMBER,SPECIAL CHARACTER
export const alphaneumericSpecialAccept = value => {
    let pattern = /[a-zA-Z0-9!@#$%^&*()\-+=?<>,|]/;
    return value && !pattern.test(value)
        ? 'Invalid field' : undefined;
}

export const decimalNumberLimit3 = value =>
    value && !/^\d{0,3}(\.\d{0,3})?$/.test(value)
        ? 'Maximum length for integer is 3 and for decimal is 3' : undefined;

export const decimalNumberLimit8And7 = (value) => {
    return value && !/^\d{0,8}(\.\d{0,7})?$/i.test(value) ? 'Maximum length for integer is 8 and for decimal is 7' : undefined;
}

export const decimalNumberLimit13 = value => {
    let tempValue = value && Number('0' + String(value)?.replace(/^0+/, ''))
    return tempValue && !/^[0-9][0-9]{0,12}(\.\d{0,2})?$/.test(tempValue)
        ? 'Maximum length for integer is 13 and for decimal is 2' : undefined;
}
export const integerOnly = value =>
    value && !/^\d*$/.test(value)
        ? 'Only integer values are allowed'
        : undefined;

export const validateSpecialChars = (value) => {
    if (!value) return undefined;

    // Check for < and > anywhere in the text
    if (/[<>]/.test(value)) {
        return "Input cannot contain < or > characters";
    }

    // Check for special characters at start or end
    const specialCharPattern = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+|[!@#$%^&*(_+\-=\[\]{};':"\\|,<>\/?]+$/;
    if (specialCharPattern.test(value)) {
        return 'Input cannot start or end with special characters.';
    }

    return undefined;
};

export const validateFileName = (fileName) => {
    // Check for spaces, special characters, and multiple extensions
    const hasSpacesOrSpecialChars = /[\s@!#$%^&*(),?":{}|<>]/.test(fileName);
    const hasMultipleExtensions = /\..*\./.test(fileName);
    const allowedExtensions = /\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif)$/i;

    let validationMessage = '';

    if (hasSpacesOrSpecialChars) {
        validationMessage = "File name should not contain spaces or special characters.";
    } else if (hasMultipleExtensions) {
        validationMessage = "File name should not contain multiple extensions.";
    } else if (!allowedExtensions.test(fileName)) {
        validationMessage = "File format is not supported. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF.";
    }

    if (validationMessage) {
        Toaster.warning(validationMessage);
        return false;
    }

    return true;
};

export const innerVsOuterValidation = (getValues) => (value) => {
    const outer = parseFloat(getValues('OuterDiameter'));
    if (!isFinite(outer)) return true;
    if (value) {
        return parseFloat(value) <= outer - 0.00000001
            || 'Inner Diameter should not be greater than outer diameter.';
    }
    return true
};

export const blockInvalidNumberKeys = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
    }
};

export const allowOnlySpecificSpecialChars = value => {
    if (!value) return undefined;

    // Pattern allows /, \, -, comma, and space at start, middle, and end positions
    // Example: "-test-" or "/path/to/file" or "\server\path\" or "test, test" are all valid
    const pattern = /^[-/\\, .a-zA-Z0-9]*$/;

    // Check if string contains any characters other than allowed ones
    const hasInvalidChars = !pattern.test(value);

    if (hasInvalidChars) {
        return 'Only letters, numbers, and special characters (/, \\, -, .) are allowed. These special characters can be used anywhere, including start and end of text.';
    }
    return undefined;
}

export const parseConfigurationString = () => {
    const localStorageConfig = reactLocalStorage.getObject('InitialConfiguration');
    const configString = localStorageConfig?.RubberTechnologyCalculatorsList || false
    const defaultConfig = {
        RubberCompound: true,
        Standard: true,
        isDataFromWebConfig: false
    }

    if (!configString) return defaultConfig;

    const parsedConfig = configString.split(',').reduce((acc, item) => {
        const [key, value] = item.split('=').map(s => s.trim());
        if (key && value !== undefined) {
            const normalizedKey = key.replace(/\s+/g, '');
            acc[normalizedKey] = value.toLowerCase() === 'true';
        }
        return acc;
    }, {});

    return {
        RubberCompound: parsedConfig.RubberCompound ?? defaultConfig.RubberCompound,
        Standard: parsedConfig.STANDARD ?? defaultConfig.Standard,
        isDataFromWebConfig: true
    };
} 
