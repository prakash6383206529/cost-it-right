
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

const userObj = reactLocalStorage.getObject('userResponse');

//const userAuthToken = axios.defaults.headers.common['Authorization'];
//if (typeof userAuthToken == 'undefined' || userAuthToken == '' || userAuthToken == null) {
    export const headers = axios.defaults.headers.common = { 'Authorization': `bearer ${userObj.token}` };
//}
export const PAGE_LENGTH = 10;


