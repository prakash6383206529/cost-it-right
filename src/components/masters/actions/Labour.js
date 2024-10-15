import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_LABOUR_FAILURE,
    GET_LABOUR_DATA_SUCCESS,
    GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
    GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
    config,
    GET_LABOUR_DATA_LIST,
    GET_LABOUR_TYPE_FOR_MACHINE_TYPE
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import DayTime from '../../common/DayTimeWrapper';
import { reactLocalStorage } from 'reactjs-localstorage';

// const config() = config

/**
 * @method createLabour
 * @description create labour
 */
export function createLabour(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createLabour, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method getLabourDataList
 * @description get labour list
 */
export function getLabourDataList(isAPICall, data, callback) {
    const { cbc, zbc, vbc } = reactLocalStorage.getObject('CostingTypePermission');
    return (dispatch) => {
        if (isAPICall) {

            const queryParams = `employment_terms=${data.employment_terms}&state_id=${data.state}&plant_id=${data.plant}&labour_type_id=${data.labour_type}&machine_type_id=${data.machine_type}&IsCustomerDataShow=${cbc}&IsVendorDataShow=${vbc}&IsZeroDataShow=${zbc}`;
            const request = axios.get(`${API.getLabourDataList}?${queryParams}`, config());
            request.then((response) => {
                if (response.data.Result || response.status === 204) {

                    dispatch({
                        type: GET_LABOUR_DATA_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                }
                callback(response)
            }).catch((error) => {
                dispatch({ type: GET_LABOUR_FAILURE });
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_DATA_LIST,
                payload: []
            })
        }
    };
}

/**
 * @method getLabourData
 * @description GET LABOUR DATA
 */
export function getLabourData(labourId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (labourId !== '') {
            axios.get(`${API.getLabourData}/${labourId}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_LABOUR_DATA_SUCCESS,
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
                type: GET_LABOUR_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteLabour
 * @description delete labour
 */
export function deleteLabour(labourDetailId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `labourDetailId=${labourDetailId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteLabour}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateLabour
 * @description update labour
 */
export function updateLabour(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateLabour}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method getLabourTypeByPlantSelectList
 * @description GET LABOUR TYPE BY PLANT
 */
export function getLabourTypeByPlantSelectList(ID, callback) {
    return (dispatch) => {
        if (ID !== '') {
            const request = axios.get(`${API.getLabourTypeByPlantSelectList}/${ID}`, config());
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
                payload: [],
            });
            callback();
        }
    };
}


/**
 * @method getLabourTypeByMachineTypeSelectList
 * @description GET LABOUR TYPE BY MACHINE TYPE
 */
export function getLabourTypeByMachineTypeSelectList(data, callback) {
    return (dispatch) => {
        const queryParams = `machineTypeId=${data?.machineTypeId || ''}&plantId=${data?.plantId || ''}&effectiveDate=${data?.effectiveDate ? DayTime(data?.effectiveDate).format('YYYY-MM-DDTHH:mm:ss') : ''}&vendorId=${data?.vendorId || ''}&customerId=${data?.customerId || ''}&costingTypeId=${data?.costingTypeId || ''}`;
        if (data.machineTypeId !== '') {
            const request = axios.get(`${API.getLabourTypeByMachineTypeSelectList}?${queryParams}`, config());
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
                payload: [],
            });
            callback();
        }
    };
}

/**
 * @method labourBulkUpload
 * @description create Labour by Bulk Upload
 */
export function labourBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.labourBulkUpload, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method getLabourTypeDetailsForMachineType
 * @description get labour type for machine type
 */
export function getLabourTypeDetailsForMachineType(ID, callback) {
    return (dispatch) => {

        if (ID !== '') {
            const request = axios.get(`${API.getLabourTypeDetailsForMachineType}/${ID}`, config());
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LABOUR_TYPE_FOR_MACHINE_TYPE,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_TYPE_FOR_MACHINE_TYPE,
                payload: [],
            });
            callback();
        }
    };
}

/**
 * @method updateLabour
 * @description update labour
 */
export function updateLabourTypeForMachineType(requestData, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(API.updateLabourTypeForMachineType, requestData, config())

            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}