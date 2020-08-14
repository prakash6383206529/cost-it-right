import { reactLocalStorage } from 'reactjs-localstorage';


export function isUserLoggedIn() {
    const isLoggedIn = reactLocalStorage.getObject("isUserLoggedIn");
    if (isLoggedIn == true) {
        return true;
    } else {
        return false;
    }
};

export function userDetails() {
    const userDetail = reactLocalStorage.getObject("userDetail");
    return userDetail;
};

export function loggedInUserId() {
    const isLoggedIn = reactLocalStorage.getObject("isUserLoggedIn");
    if (isLoggedIn == true) {
        const userDetail = reactLocalStorage.getObject("userDetail");
        return userDetail.LoggedInUserId;
    } else {
        return null;
    }
};

export function checkVendorPlantConfigurable() {
    const userDetail = reactLocalStorage.getObject("userDetail");
    return userDetail.IsVendorPlantConfigurable;
};