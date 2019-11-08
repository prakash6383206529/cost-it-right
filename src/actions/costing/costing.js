import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_PLANT_COMBO_SUCCESS,
    GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
    CREATE_PART_WITH_SUPPLIER_SUCCESS
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method getPlantCombo
 * @description get all plant list
 */
export function getPlantCombo(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantCombo}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_COMBO_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getExistingSupplierDetailByPartId(partId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getExistingSupplierDetailByPartId}/${partId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}



/**
 * @method createFreightAPI
 * @description create freight master
 */
export function createPartWithSupplier(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createPartWithSupplier, data, headers);
        request.then((response) => {
            console.log('%c 🍚 response: create', response);
            // if (response.data.Result) {
            //     dispatch({
            //         type: CREATE_PART_WITH_SUPPLIER_SUCCESS,
            //         payload: response.data.Data
            //     });
            // } else {
            //     dispatch({ type: API_FAILURE });
            //     if (response.data.Message) {
            //         toastr.error(response.data.Message);
            //     }
            // }
            callback(response);
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}


/**
 * @method createFreightAPI
 * @description create freight master
 */
export function checkPartWithTechnology(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.checkPartWithTechnology, data, headers);
        request.then((response) => {
            console.log("response >>", response)
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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