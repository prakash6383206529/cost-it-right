import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_FREIGHT_SUCCESS,
    CREATE_FREIGHT_FAILURE,
    GET_FREIGHT_SUCCESS,
    GET_FREIGHT_FAILURE
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method createFreightAPI
 * @description create freight master
 */
export function createFreightAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFreightAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_FREIGHT_SUCCESS,
                        payload: response.data.Data
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_FREIGHT_FAILURE });
                    if (response.data.Message) {
                        toastr.error(response.data.Message);
                    } 
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method getFreightDetailAPI
 * @description get freight list
 */
export function getFreightDetailAPI() {
    return (dispatch) => {
        const request = axios.get(API.getFreightAPI, headers);
        request.then((response) => {
            dispatch({
                type: GET_FREIGHT_SUCCESS,
                payload: response.data.DataList,
            });
                
        }).catch((error) => {
            dispatch({
                type: GET_FREIGHT_FAILURE
            });
            apiErrors(error);
        });
    };
}