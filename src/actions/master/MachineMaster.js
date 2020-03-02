import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    DATA_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    CREATE_MACHINE_TYPE_SUCCESS,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};


/**
 * @method createMachineTypeAPI
 * @description create Machine Type 
 */
export function createMachineTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachineTypeAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_SUCCESS,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getMachineTypeListAPI
 * @description get all operation list
 */
export function getMachineTypeListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getMachineTypeListAPI, { headers })
            .then((response) => {
                if (response.data.Result == true) {
                    dispatch({
                        type: GET_MACHINE_TYPE_DATALIST_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getMachineTypeDataAPI
 * @description Get CED Other Operation data
 */
export function getMachineTypeDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID != '') {
            axios.get(`${API.getMachineTypeDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
                        dispatch({
                            type: GET_MACHINE_TYPE_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    }
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_MACHINE_TYPE_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteMachineTypeAPI
 * @description delete Machine Type
 */
export function deleteMachineTypeAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMachineTypeAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateMachineTypeAPI
 * @description update Machine Type details
 */
export function updateMachineTypeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMachineTypeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}