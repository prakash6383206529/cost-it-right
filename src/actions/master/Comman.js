import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import {
    MESSAGES
} from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

// export function fetchMasterDataAPI() {
//     return (dispatch) => {
//         const API1 = axios.get(API.getAllMasterUOMAPI, headers);
//         const API2 = axios.get(API.getMaterialType, headers);
//         Promise.all([API1, API2])
//             .then((response) => {
//                 dispatch({
//                     type: GET_UOM_DATA_SUCCESS,
//                     payload: response[0].data.SelectList,
//                 });
                
//                 dispatch({
//                     type: GET_MATERIAL_TYPE_SUCCESS,
//                     payload: response[1].data.SelectList,
//                 });  
//             }).catch((error) => {
//                 dispatch({
//                     type: FETCH_MATER_DATA_FAILURE
//                 });
//                 apiErrors(error);
//             });
//     };
// }

export function fetchCountryDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCountry}`,headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COUNTRY_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

export function fetchStateDataAPI(countryId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
       if(countryId == 0){
        dispatch({
            type: GET_STATE_SUCCESS,
            payload: []
        });
        dispatch({
            type: GET_CITY_SUCCESS,
            payload: [],
        });
        callback([]);
       }else{
        const request = axios.get(`${API.getState}/${countryId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_STATE_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
       }
    };
}

export function fetchCityDataAPI(stateId,callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
       if(stateId == 0){
        dispatch({
            type: GET_CITY_SUCCESS,
            payload: [],
        });
        callback([]);
       }else{
        const request = axios.get(`${API.getCity}/${stateId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CITY_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
       }
    };
}

export function fetchPlantDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlant}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}