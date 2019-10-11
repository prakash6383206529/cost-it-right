// import axios from 'axios';
// /** Import constant */
// import { EDIT_USER_DATA, RESET_PROPS_DATA, SET_CURRENT_PROPS, GET_ROLES_FOR_LOGGED_USER } from "./Types";
// import { apiErrors } from '../config/config';

// /**
//  *@name setPropsValue
//  *@desc Set current values into props
//  *@return {*}
//  **/
// export function setPropsValue(data) {
//     return (dispatch) => {
//         dispatch({
//             type: SET_CURRENT_PROPS,
//             payload: data
//         });
//     }
// }

// /**
//  * Get auth user details
//  * @returns {*}
//  */
// export function getAuthUserDetails() {
//     let userDetail = localStorage.getItem("loggedInDetail");
//     return userDetail; 
// }

// /**
// *@name Edit user data 
// *@desc Set edit form data
// *@return {*}
// **/
// export function editUserFormData(formData , callback) {
//     return (dispatch) => {
//         callback(true)
//         dispatch({
//             type: EDIT_USER_DATA,
//             payload: formData
//         })
//     }
// } 

// /**
// *@name reset props data 
// *@desc reset edit form data
// *@return {*}
// **/
// export function resetPropsData() {
//     return (dispatch) => {
//         dispatch({
//             type: RESET_PROPS_DATA
//         })
//     }
// }


// /**
//  * @name getRolesForLoggedInUser
//  * @desc Get roles for login user
//  * @param id
//  * @returns {function(*)}
//  */
// export function getRolesForLoggedInUser(id, callback){
//     const request = axios.get(`${process.env.REACT_APP_API_URL}users/${id}`);
//     return (dispatch)=> {
//         request.then((response) => {
//             dispatch({
//                 type : GET_ROLES_FOR_LOGGED_USER,
//                 payload : response.data
//               })
//         })
//         .catch(function (error) {
//             apiErrors(error);
//         });
//     }
// };
import { reactLocalStorage } from 'reactjs-localstorage';
import axios from 'axios';
import {
    FETCH_USER_DATA, UPDATE_FORM_DATA, FETCH_MATER_DATA_SUCCESS,
    FETCH_MATER_DATA_FAILURE, FETCH_MATER_DATA_REQUEST, UPDATE_PRODUCTION_PROFILE_FORM_DATA
} from '../config/constants';
import { API } from '../config/constants';
import { apiErrors } from '../helper';

const headers = {
    'Content-Type': 'application/json',
};

/**
 * @method updateUserData
 * @description update data in store on app landing
 */

export function updateUserData() {
    return (dispatch) => {
        dispatch({ type: 'Nothing' });
        reactLocalStorage.getItem('userResponse')
        
            .then((value) => {
                if (value === null) {
                } else {
                    const userDataValue = JSON.parse(value);
                    dispatch({
                        type: FETCH_USER_DATA,
                        payload: userDataValue
                    });
                }
            });
        // console.log('updateUserData',reactLocalStorage );
    };
}

export function updateFormData(formData, obj) {
    formData = { ...formData, ...obj };
    return (dispatch) => {
        dispatch({ type: UPDATE_FORM_DATA, payload: formData });
    };
}

export function updateProductionProfileFormData(formData, obj) {
    formData = { ...formData, ...obj };
    return (dispatch) => {
        dispatch({ type: UPDATE_PRODUCTION_PROFILE_FORM_DATA, payload: formData });
    };
}


export function fetchMasterDataAPI() {
    return (dispatch) => {
        dispatch({ type: FETCH_MATER_DATA_REQUEST });
        const request1 = axios.get(`${API.getSports}`, { headers });
        const request2 = axios.get(`${API.getPerformances}`, { headers });
        const request3 = axios.get(`${API.getEyesColor}`, { headers });
        const request4 = axios.get(`${API.getEthnicAppearence}`, { headers });
        const request5 = axios.get(`${API.getLanguage}`, { headers });
        const request6 = axios.get(`${API.getAccents}`, { headers });
        const request7 = axios.get(`${API.getDisabilities}`, { headers });
        Promise.all([request1, request2, request3, request4, request5, request6, request7]).then((message) => {
            const sports = message[0].data.sports;
            const performances = message[1].data.performances;
            const eyesColor = message[2].data.eyeColors;
            const ethnicAppearence = message[3].data.ethnicAppearances;
            const languages = message[4].data.languages;
            const accents = message[5].data.accents;
            const disabilities = message[6].data.disabilities;
            const masterData = {
                sports, performances, eyesColor, ethnicAppearence, languages, accents, disabilities
            };
            dispatch({
                type: FETCH_MATER_DATA_SUCCESS,
                payload: masterData
            });
        }).catch((error) => {
            apiErrors(error);
            dispatch({ type: FETCH_MATER_DATA_FAILURE });
        });
    };
}
