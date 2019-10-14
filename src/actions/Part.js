import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    FETCH_MATER_DATA_FAILURE,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAILURE
} from '../config/constants';
import {
    apiErrors
} from '../helper/util';
import {
    MESSAGES
} from '../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function fetchMasterDataAPI(callback) {
    return (dispatch) => {
        axios.get(API.getAllMasterUOMAPI, headers)
            .then((response) => {
                console.log('response', response);
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_UOM_DATA_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    console.log('response.data.DataList: ', response.data.SelectList);
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                console.log('UOM api error', error);
                dispatch({
                    type: FETCH_MATER_DATA_FAILURE
                });
                callback(error);
                apiErrors(error);
            });


        // Promise.all([request1]).then((data) => {
        //     console.log('data', data)
        //     // const unitOfMeasurement = data[0].Data;

        //     // const masterData = {
        //     //     unitOfMeasurement
        //     // };
        //     // dispatch({
        //     //     type: FETCH_MATER_DATA_SUCCESS,
        //     //     payload: masterData
        //     // });
        // }).catch((error) => {
        //     apiErrors(error);
        //     dispatch({ type: FETCH_MATER_DATA_FAILURE });
        // });
    };
}

export function getAllPartsAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAllPartsAPI}`,headers);
        request.then((response) => {
            console.log('response: ', response);
            if (response.data.Result === true) {
                dispatch({
                    type: GET_ALL_PARTS_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log('UOM api error', error);
            dispatch({ type: GET_ALL_PARTS_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method createOpportunityAPI
 * @description create opportunity 
 */

export function createPartAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: CREATE_PART_REQUEST
        });
        console.log("create part request => ", data);
        const request = axios.post(API.partCreateAPI, data,headers);
        request.then((response) => {
            console.log("create response response =>", response);
            if (response.data.Result === true) {
                    dispatch({
                        type: CREATE_PART_SUCCESS,
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_PART_FAILURE });
                    if (response.data.Message) {
                        toastr.error(response.data.Message);
                    } 
            }
        }).catch((error) => {
            console.log('error step4', error)
            dispatch({
                type: CREATE_PART_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method deleteUserMediaAPI
 * @description delete user media
 */
export function deletePartsAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePartAPI}/${requestData.PartId}`,headers)
            .then((response) => {
                // getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                    callback(response);
                   // dispatch({ type: DELETE_USER_MEDIA_SUCCESS });
                // });
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteUserMediaAPI
 * @description delete user media
 */
export function updatePartsAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updatePartAPI}/${requestData.PartId}`, requestData,headers)
            .then((response) => {
                    callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}