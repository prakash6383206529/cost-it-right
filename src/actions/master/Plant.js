import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_PLANT_SUCCESS,
    CREATE_PLANT_FAILURE
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
 * @method createPlantAPI
 * @description create plant master
 */
export function createPlantAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createPlantAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_PLANT_SUCCESS,
                        payload: response.data.Data
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_PLANT_FAILURE });
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
