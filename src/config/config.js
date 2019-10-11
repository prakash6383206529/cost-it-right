import { reactLocalStorage } from 'reactjs-localstorage';

export const customTokenHeader = () => {
    const userObj = reactLocalStorage.getObject('userResponse');
    const customHeader = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
        }
    return customHeader;    
}
