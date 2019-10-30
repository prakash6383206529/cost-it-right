import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_LABOUR_SUCCESS,
    CREATE_LABOUR_FAILURE,
    GET_LABOUR_SUCCESS,
    GET_LABOUR_FAILURE
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
 * @method createLabourAPI
 * @description create labour master
 */
export function createLabourAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createLabourAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_LABOUR_SUCCESS,
                        payload: response.data.Data
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_LABOUR_FAILURE });
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
 * @method getLabourDetailAPI
 * @description get labour list
 */
export function getLabourDetailAPI() {
    return (dispatch) => {
        const request = axios.get(API.getLabourAPI, headers);
        request.then((response) => {
            dispatch({
                type: GET_LABOUR_SUCCESS,
                payload: response.data.DataList,
            });
                
        }).catch((error) => {
            dispatch({
                type: GET_LABOUR_FAILURE
            });
            apiErrors(error);
        });
    };
}