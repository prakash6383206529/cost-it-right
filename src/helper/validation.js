import moment from 'moment';

export const minLength = min => value =>
    value && value.length < min ? `Min length must be ${min}.` : undefined;

export const maxLength = max => value =>
    value && value.length > max ? `Max length must be ${max}.` : undefined;

export const minLength1 = minLength(1);
export const minLength2 = minLength(2);
export const minLength3 = minLength(3);
export const minLength4 = minLength(4);
export const minLength5 = minLength(5);
export const minLength6 = minLength(6);
export const minLength7 = minLength(7);
export const minLength10 = minLength(10);

export const maxLength2 = maxLength(2);
export const maxLength6 = maxLength(6);
export const maxLength7 = maxLength(7);
export const maxLength10 = maxLength(10);
export const maxLength11 = maxLength(11);
export const maxLength15 = maxLength(15);
export const maxLength18 = maxLength(18);
export const maxLength12 = maxLength(12);
export const maxLength25 = maxLength(25);
export const maxLength20 = maxLength(20);
export const maxLength26 = maxLength(25);
export const maxLength30 = maxLength(30);
export const maxLength45 = maxLength(45);
export const maxLength50 = maxLength(50);
export const maxLength70 = maxLength(71);
export const maxLength100 = maxLength(100);
export const maxLength200 = maxLength(200);
export const maxLength250 = maxLength(250);
export const maxLength500 = maxLength(500);
export const maxLength300 = maxLength(300);
export const maxLength1000 = maxLength(1000);
export const maxLength5000 = maxLength(5000);


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

export const selectRequired = value =>
((typeof value !== 'undefined' && value !== null && value !== "")
    ? undefined : 'This field is required.');


export const checkWhiteSpaces = value=>
value && !value.replace(/\s/g, '').length
        ? 'This field is invalid.' : undefined;


export const number = value =>
    value && (isNaN(Number(value)) || Number(value) < 0)
        ? 'This field is invalid.' : undefined;

export const alphabetsOnly = value =>
    value && /[^a-zA-Z ]/i.test(value)
        ? 'Only alphabets are allowed.' : undefined;

export const alphabetsOnlyForName = value =>
    value && /[^a-zA-Z ]/i.test(value)
        ? 'Please enter a valid name.' : undefined;

export const specialName = value =>
    value && /[^A-Za-z'\s.,@_-]+$/i.test(value)
        ? 'Please enter a valid name.' : undefined;

export const validatePassword = value => {
    return (value && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*?[#?!@$%^&*-]).{5,}$/.test(value) === false);
}

export const alphaNumeric = value =>
    value && /[^a-zA-Z0-9 ]/i.test(value)
        ? 'Please enter only alphabets or numbers.'
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

export const decimalLength = max => value =>
    value && !/^[0-9]\d{0,12}(\.\d{1,2})?%?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;

export const decimalLength4 = max => value =>
    value && !/^[0-9]\d{0,12}(\.\d{1,4})?%?$/i.test(value)
        ? `Only ${max} decimal allowed.`
        : undefined;

export const decimalLength2 = decimalLength(2);
export const decimalLength3 = decimalLength(3);
export const decimalLengthFour = decimalLength4(4);

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

export const getVendorCode = (name) => {
    if (name !== '') {
        const firstIndex = name.indexOf('(');
        const lastIndex = name.lastIndexOf(')');
        const supplierCode = name.substring(firstIndex + 1, lastIndex);
        return supplierCode;
    } else {
        return '';
    }
}

export const getPlantCode = (name) => {
    if (name !== '') {
        const firstIndex = name.indexOf('(');
        const lastIndex = name.lastIndexOf(')');
        const Code = name.substring(firstIndex + 1, lastIndex);
        return Code;
    } else {
        return '';
    }
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

export const checkForNull = (ele) => {
    const number = (ele == null || isNaN(Number(ele)) || ele === undefined || ele === Infinity) ? 0 : Number(ele);
    return number
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

export const trimDecimalPlace = (floatValue, Number) => {
    var decimalTextLength = 0;
    if (floatValue !== undefined) {
        if (floatValue.toString().split('.')[1] !== undefined && floatValue.toString() !== null) {
            decimalTextLength = (floatValue.toString().split('.')[1]).length;
        }
    }
    if (decimalTextLength > Number) {
        floatValue = parseFloat(floatValue.toString().substring(0, (floatValue.toString().length - (((floatValue.toString().split('.')[1]).length) - Number))));
    }
    return floatValue;
}

export const checkForDecimalAndNull = (floatValue, Number) => {
    return checkForNull(trimDecimalPlace(floatValue, Number))
}

export const Numeric = value =>
    value && /[^0-9]/i.test(value)
        ? 'Please enter valid number'
        : undefined;

export const isGuid = (value) => {
    var regex = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;
    var match = regex.exec(value);
    return match != null;
}

export const getJsDateFromExcel = excelDate => {
    return moment((excelDate - (25567 + 2)) * 86400 * 1000).format('DD-MM-YYYY');
};