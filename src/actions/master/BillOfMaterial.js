import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_BOP_SUCCESS,
    CREATE_BOP_FAILURE,
    GET_BOM_SUCCESS,
    UPLOAD_BOM_XLS_SUCCESS,
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

/**
 * @method createBOMAPI
 * @description create bill of material master
 */
export function createBOMAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createBOMAPI, data, headers);
        request.then((response) => {
            console.log('res >>', response)
            if (response.data.Result) {
                dispatch({
                    type: CREATE_BOP_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOP_FAILURE });
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
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getAllBOMAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOMAPI}`, headers);
        request.then((response) => {
            //if (response.data.Result) {
            dispatch({
                type: GET_BOM_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
            // } else {
            //     toastr.error(MESSAGES.SOME_ERROR);
            // }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method BOM Upload XLS file
 * @description Upload BOM xls file to create multiple BOM
 */
export function uploadBOMxlsAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.uploadBOMxlsAPI, data, headers);
        request.then((response) => {
            console.log('res xls >>', response)
            if (response.data.Result) {
                dispatch({
                    type: UPLOAD_BOM_XLS_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOP_FAILURE });
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
 * @method deleteBOMAPI
 * @description delete BOM
 */
export function deleteBOMAPI(BomId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOMAPI}/${BomId}`, headers)
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