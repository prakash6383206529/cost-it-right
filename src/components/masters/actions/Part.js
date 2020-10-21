import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_UNIT_PART_DATA_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS,
    GET_PART_SELECTLIST_SUCCESS,
    GET_ASSEMBLY_PART_SELECTLIST,
    GET_COMPONENT_PART_SELECTLIST,
    GET_BOUGHTOUT_PART_SELECTLIST,
    GET_DRAWER_CHILD_PART_DATA,
    SET_ACTUAL_BOM_DATA,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

const headers = config;


////////////////////////////// PART MASTER INDIVISUAL COMPONENT /////////////////////////////

/**
 * @method createPart
 * @description create New Part
 */
export function createPart(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createPart, data, headers);
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
 * @method updatePart
 * @description update Part
 */
export function updatePart(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updatePart}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getPartData
 * @description get Part Data
 */
export function getPartData(PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getPartData}/${PartId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UNIT_PART_DATA_SUCCESS,
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
                type: GET_UNIT_PART_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getPartDataList
 * @description get Parts
 */
export function getPartDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getPartDataList}`, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: GET_ALL_NEW_PARTS_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method deletePart
 * @description delete part
 */
export function deletePart(PartId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePart}/${PartId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getPartSelectList
 * @description Used to Part selectlist
 */
export function getPartSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPartSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PART_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fileUploadPart
 * @description File Upload INDIVIDUAL PART
 */
export function fileUploadPart(data, callback) {
    return (dispatch) => {
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.post(API.fileUploadPart, data, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileDeletePart
 * @description delete PART file API
 */
export function fileDeletePart(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeletePart}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method partComponentBulkUpload
 * @description create Part by Bulk Upload
 */
export function partComponentBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.partComponentBulkUpload, data, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method activeInactivePartStatus
 * @description UPDATE PART STATUS ACTIVE/INACTIVE
 */
export function activeInactivePartStatus(requestData, callback) {
    return (dispatch) => {
        axios.put(API.activeInactivePartStatus, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                callback(error);
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method checkStatusCodeAPI
 * @description CHECK STATUS CODE
 */
export function checkStatusCodeAPI(CODE, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.checkStatusCodeAPI}?i=${CODE}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method createAssemblyPart
* @description CREATE NEW ASSEMBLY PART
*/
export function createAssemblyPart(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAssemblyPart, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: CREATE_PART_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getAssemblyPartDataList
* @description GET ASSEMBLY PART DATALIST
*/
export function getAssemblyPartDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAssemblyPartDataList}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_ALL_PARTS_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getAssemblyPartDetail
* @description GET ASSEMBLY PART DETAIL
*/
export function getAssemblyPartDetail(PartId, callback) {
    return (dispatch) => {
        if (PartId !== '') {
            const request = axios.get(`${API.getAssemblyPartDetail}/${PartId}`, headers);
            request.then((response) => {
                dispatch({
                    type: GET_UNIT_PART_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_UNIT_PART_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
* @method updateAssemblyPart
* @description UPDATE ASSEMBLY PART
*/
export function updateAssemblyPart(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateAssemblyPart}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method deleteAssemblyPart
* @description DELETE ASSEMBLY PART
*/
export function deleteAssemblyPart(PartId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteAssemblyPart}/${PartId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method getSelectListPartType
* @description GET SELECTLIST OF PART TYPE LIKE ASSEMBLY, COMPONENT AND BOP
*/
export function getSelectListPartType(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSelectListPartType}`, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getAssemblyPartSelectList
* @description GET ASSEMBLY PART SELECTLIST
*/
export function getAssemblyPartSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAssemblyPartSelectList}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_ASSEMBLY_PART_SELECTLIST,
                payload: response.data.SelectList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getComponentPartSelectList
* @description GET COMPONENT PART SELECTLIST
*/
export function getComponentPartSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getComponentPartSelectList}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_COMPONENT_PART_SELECTLIST,
                payload: response.data.SelectList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getBoughtOutPartSelectList
* @description GET COMPONENT PART SELECTLIST
*/
export function getBoughtOutPartSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getBoughtOutPartSelectList}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_BOUGHTOUT_PART_SELECTLIST,
                payload: response.data.SelectList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getDrawerAssemblyPartDetail
* @description GET DRAWER ASSEMBLY PART DETAIL
*/
export function getDrawerAssemblyPartDetail(PartId, callback) {
    return (dispatch) => {
        if (PartId !== '') {
            const request = axios.get(`${API.getAssemblyPartDetail}/${PartId}`, headers);
            request.then((response) => {
                dispatch({
                    type: GET_DRAWER_CHILD_PART_DATA,
                    payload: response.data.Data,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_DRAWER_CHILD_PART_DATA,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method getDrawerComponentPartData
 * @description get Drawer Component Part Data
 */
export function getDrawerComponentPartData(PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getPartData}/${PartId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_DRAWER_CHILD_PART_DATA,
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
                type: GET_DRAWER_CHILD_PART_DATA,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getDrawerBOPData
 * @description get Drawer BOP Data
 */
export function getDrawerBOPData(PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getChildDrawerBOPData}/${PartId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_DRAWER_CHILD_PART_DATA,
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
                type: GET_DRAWER_CHILD_PART_DATA,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getBOMViewerTree
 * @description GET BOM VIEWER TREE BY ASSEMBLY PART ID
 */
export function getBOMViewerTree(PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getBOMViewerTree}/${PartId}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getBOMViewerTreeDataByPartIdAndLevel
 * @description GET BOM VIEWER TREE BY ASSEMBLY PART ID AND LEVELID
 */
export function getBOMViewerTreeDataByPartIdAndLevel(PartId, LevelId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getBOMViewerTree}/${PartId}/${LevelId}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method setActualBOMData
 * @description SET ACTUAL BOM DATA JSON
 */
export function setActualBOMData(data) {
    return (dispatch) => {
        dispatch({
            type: SET_ACTUAL_BOM_DATA,
            payload: data,
        });
    };

}

/**
 * @method BOMUploadPart
 * @description create Part Assembly By BOM Upload
 */
export function BOMUploadPart(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.BOMUploadPart, data, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}