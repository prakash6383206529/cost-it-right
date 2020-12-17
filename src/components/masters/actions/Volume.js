import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
    config,
    GET_VOLUME_DATA_BY_PART_AND_YEAR
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
const headers = config

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
        const QueryParams = `year=${filterData.year}&month=${filterData.month}&vendor_id=${filterData.vendor_id}&plant_id=${filterData.plant_id}`
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

/**
 * @method bulkUploadVolumeActualZBC
 * @description BULK UPLOAD FOR ACTUAL VOLUME ZBC
 */
export function bulkUploadVolumeActualZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadVolumeActualZBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadVolumeActualVBC
 * @description BULK UPLOAD FOR ACTUAL VOLUME VBC
 */
export function bulkUploadVolumeActualVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadVolumeActualVBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadVolumeBudgetedZBC
 * @description BULK UPLOAD FOR BUDGETED VOLUME ZBC
 */
export function bulkUploadVolumeBudgetedZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadVolumeBudgetedZBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadVolumeBudgetedVBC
 * @description BULK UPLOAD FOR BUDGETED VOLUME VBC
 */
export function bulkUploadVolumeBudgetedVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadVolumeBudgetedVBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getVolumeDataByPartAndYear
 * @description Get Volume Data by part and year
 */
export function getVolumeDataByPartAndYear(partNumber, financialYear, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getVolumeData}/${partNumber}/${financialYear}`, headers)
            .then((response) => {
                callback(response);
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_VOLUME_DATA_BY_PART_AND_YEAR,
                        payload: response.data.Data,
                    });
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}