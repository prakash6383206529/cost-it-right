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