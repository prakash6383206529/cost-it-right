import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
const headers = {
    'Content-Type': 'application/json',
};

/**
 * @method createVolume
 * @description create Volume 
 */
export function createVolume(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.post(API.createVolume, data, headers);
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
 * @method updateVolume
 * @description update volume details
 */
export function updateVolume(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateVolume}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getVolumeData
 * @description Get Volume Data
 */
export function getVolumeData(VolumeId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (VolumeId !== '') {
            axios.get(`${API.getVolumeData}/${VolumeId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_VOLUME_DATA_SUCCESS,
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
                type: GET_VOLUME_DATA_SUCCESS,
                payload: {},
            });
        }
    };
}

/**
 * @method getVolumeDataList
 * @description get all operation list
 */
export function getVolumeDataList(filterData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const QueryParams = `costing_head=${filterData.costing_head}&year=${filterData.year}&month=${filterData.month}&vendor_id=${filterData.vendor_id}&plant_id=${filterData.plant_id}`
        axios.get(`${API.getVolumeDataList}?${QueryParams}`, { headers })
            .then((response) => {
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method deleteVolume
 * @description delete Volume
 */
export function deleteVolume(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteVolume}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method getFinancialYearSelectList
* @description GET FINANCIAL YEAR LIST
*/
export function getFinancialYearSelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFinancialYearSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FINANCIAL_YEAR_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}