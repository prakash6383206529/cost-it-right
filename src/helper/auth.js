import {reactLocalStorage} from 'reactjs-localstorage';


export const isUserLoggedIn = () => {
    const isLoggedIn = reactLocalStorage.getObject("isLoggedIn");
    if(isLoggedIn == true){
        return true;
    } else {
        return false;
    }
};