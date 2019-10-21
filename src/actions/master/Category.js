import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_CATEGORY_TYPE_SUCCESS,
    CREATE_CATEGORY_TYPE_FAILURE,
    CREATE_CATEGORY_FAILURE,
    CREATE_CATEGORY_SUCCESS,
    FETCH_CATEGORY_DATA_FAILURE,
    GET_CATEGORY_DATA_SUCCESS
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
 * @method createCategoryTypeAPI
 * @description create category type
 */
export function createCategoryTypeAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createcategoryTypeAPI, data,headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_CATEGORY_TYPE_SUCCESS,
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_CATEGORY_TYPE_FAILURE });
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
 * @method createCategoryAPI
 * @description create category category
 */
export function createCategoryAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createCategoryAPI, data,headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_CATEGORY_SUCCESS,
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_CATEGORY_FAILURE });
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
 * @method fetchCategoryMasterDataAPI
 * @description create category category list
 */
export function fetchCategoryMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.fetchCategoryType, headers);
        Promise.all([API1])
            .then((response) => {
                dispatch({
                    type: GET_CATEGORY_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });
                 
            }).catch((error) => {
                dispatch({
                    type: FETCH_CATEGORY_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}