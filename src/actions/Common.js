
// import axios from 'axios';
// import {API,
//     FETCH_USER_DATA, UPDATE_FORM_DATA, FETCH_MATER_DATA_SUCCESS,
//     FETCH_MATER_DATA_FAILURE, FETCH_MATER_DATA_REQUEST, UPDATE_PRODUCTION_PROFILE_FORM_DATA
// } from '../config/constants';
// import { apiErrors } from '../helper/util';

// const headers = {
//     'Content-Type': 'application/json',
// };




// export function fetchMasterDataAPI() {
//     return (dispatch) => {
//         dispatch({ type: FETCH_MATER_DATA_REQUEST });
//         const request1 = axios.get(`${API.getSports}`, { headers });
//         const request2 = axios.get(`${API.getPerformances}`, { headers });
//         const request3 = axios.get(`${API.getEyesColor}`, { headers });
//         const request4 = axios.get(`${API.getEthnicAppearence}`, { headers });
//         const request5 = axios.get(`${API.getLanguage}`, { headers });
//         const request6 = axios.get(`${API.getAccents}`, { headers });
//         const request7 = axios.get(`${API.getDisabilities}`, { headers });
//         Promise.all([request1, request2, request3, request4, request5, request6, request7]).then((message) => {
//             const sports = message[0].data.sports;
//             const performances = message[1].data.performances;
//             const eyesColor = message[2].data.eyeColors;
//             const ethnicAppearence = message[3].data.ethnicAppearances;
//             const languages = message[4].data.languages;
//             const accents = message[5].data.accents;
//             const disabilities = message[6].data.disabilities;
//             const masterData = {
//                 sports, performances, eyesColor, ethnicAppearence, languages, accents, disabilities
//             };
//             dispatch({
//                 type: FETCH_MATER_DATA_SUCCESS,
//                 payload: masterData
//             });
//         }).catch((error) => {
//             apiErrors(error);
//             dispatch({ type: FETCH_MATER_DATA_FAILURE });
//         });
//     };
// }

