import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_TAX_DETAILS_DATALIST,
    GET_TAX_DETAILS_DATA, config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';

// const config() = {
//     'Content-Type': 'application/json',
//     //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
// };
// const config() = config;

/**
 * @method createTaxDetails
 * @description CREATE TAX DETAILS
 */
export function createTaxDetails(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createTaxDetails, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getTaxDetailsDataList
 * @description GET DATALIST OF TAX DETAILS
 */
export function getTaxDetailsDataList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getTaxDetailsDataList, config())
            .then((response) => {
                dispatch({
                    type: GET_TAX_DETAILS_DATALIST,
                    payload: response.data.DataList,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getTaxDetailsData
 * @description GET TAX DETAILS DATA
 */
export function getTaxDetailsData(taxID, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (taxID !== '') {
            axios.get(`${API.getTaxDetailsData}/${taxID}/${loggedInUser?.loggedInUserId}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_TAX_DETAILS_DATA,
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
                type: GET_TAX_DETAILS_DATA,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteTaxDetails
 * @description TAX DETAILS DELETE
 */
export function deleteTaxDetails(Id, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteTaxDetails}/${Id}/${loggedInUser?.loggedInUserId}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateTaxDetails
 * @description UPDATE TAX DETAILS
 */
export function updateTaxDetails(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateTaxDetails}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}
