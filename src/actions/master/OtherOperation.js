import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_OTHER_OPERATION_SUCCESS,
    GET_OTHER_OPERATION_FAILURE
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
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getOperationsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOtherOperationsAPI, { headers })
            .then((response) => {
                console.log("response.data.Result ", response.data.Result)
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_OTHER_OPERATION_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                console.log('error', error.response ? error.response : error)
                dispatch({
                    type: GET_OTHER_OPERATION_FAILURE
                });
                callback(error);
                apiErrors(error);
            });
    };
}