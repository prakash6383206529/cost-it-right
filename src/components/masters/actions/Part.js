import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_UNIT_PART_DATA_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS_PAGINATION,
    GET_BOUGHTOUT_PART_SELECTLIST,
    GET_DRAWER_CHILD_PART_DATA,
    SET_ACTUAL_BOM_DATA,
    config,
    GET_PRODUCT_DATA_LIST,
    GET_PRODUCT_UNIT_DATA,
    PRODUCT_GROUPCODE_SELECTLIST,
    API_SUCCESS,
    ADD_PRODUCT_HIERARCHY,
    ADD_PRODUCT_LABELS,
    GET_PRODUCT_HIERARCHY_DATA,
    GET_PRODUCT_HIERARCHY_LABELS,
    STORE_HIERARCHY_DATA,
    GET_PART_FAMILY_LIST_SUCCESS,
    GET_ALL_PART_FAMILY_LIST_SUCCESS,
    GET_PART_FAMILY_DETAILS_SUCCESS
} from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import { apiErrors, encodeQueryParams, encodeQueryParamsAndLog } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';

// const config() = config;


////////////////////////////// PART MASTER INDIVISUAL COMPONENT /////////////////////////////

/**
 * @method createPart
 * @description create New Part
 */
export function createPart(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createPart, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
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
 * @method updatePart
 * @description update Part
 */
export function updatePart(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updatePart}`, requestData, config())
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
 * @method getPartData
 * @description get Part Data
 */
export function getPartData(PartId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getPartData}/${PartId}/${loggedInUser?.loggedInUserId}`, config())
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
export function getPartDataList(skip, take, obj, isPagination, callback) {
    return (dispatch) => {
        const baseQueryParams = `isApplyPagination=${isPagination}&take=${take}&skip=${skip}`;

        var additionalQueryParams = encodeQueryParams({
            effectiveDate: obj?.newDate !== null && obj?.newDate !== undefined ? obj?.newDate : "", partNumber: obj.PartNumber !== null && obj.PartNumber !== "" ? obj.PartNumber : "", partName: obj.PartName !== null && obj.PartName !== "" ? obj.PartName : "", ecnNumber: obj.ECNNumber !== null && obj.ECNNumber !== "" ? obj.ECNNumber : "", revisionNumber: obj.RevisionNumber !== null && obj.RevisionNumber !== "" ? obj.RevisionNumber : "", drawingNumber: obj.DrawingNumber !== null && obj.DrawingNumber !== "" ? obj.DrawingNumber : "", technology: obj.Technology ? obj.Technology : "", sapCode: obj.SAPCode ? obj.SAPCode : ""
        ,nepNumber: obj.NEPNumber !== null && obj.NEPNumber !== "" ? obj.NEPNumber : "", partmodelmaster: obj.PartsModelMaster !== null && obj.PartsModelMaster !== "" ? obj.PartsModelMaster : ""});
        const queryParams = `loggedInUserId=${loggedInUserId()}&${baseQueryParams}&${additionalQueryParams}`;

        const request = axios.get(`${API.getPartDataList}?${queryParams}`, config());
        request.then((response) => {
            if (response?.data?.Result === true || response.status === 204) {

                if (isPagination === true) {
                    dispatch({
                        type: GET_ALL_NEW_PARTS_SUCCESS,
                        payload: response?.status === 204 ? [] : response.data.DataList,
                    });
                } else {

                    dispatch({
                        type: GET_ALL_NEW_PARTS_SUCCESS_PAGINATION,
                        payload: response?.status === 204 ? [] : response.data.DataList,
                    });
                }
            }
            callback(response);
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
export function deletePart(partId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `partId=${partId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deletePart}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getPartSelectList
 * @description Used to Part selectlist
 */
export function getPartSelectList(callback) {
    return axios.get(`${API.getPartSelectList}`, config());
}

/**
 * @method fileUploadPart
 * @description File Upload INDIVIDUAL PART
 */
export function fileUploadPart(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadPart, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
        });
    };
}


/**
 * @method partComponentBulkUpload
 * @description create Part by Bulk Upload
 */
export function partComponentBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.partComponentBulkUpload, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}


// productComponentBulkUpload

export function productComponentBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.productComponentBulkUpload, data, config());
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
        axiosInstance.put(API.activeInactivePartStatus, requestData, config())
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
        const request = axios.get(`${API.checkStatusCodeAPI}?i=${CODE}`, config());
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
        const request = axiosInstance.post(API.createAssemblyPart, data, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: CREATE_PART_SUCCESS, });
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
* @method getAssemblyPartDataList
* @description GET ASSEMBLY PART DATALIST
*/

export function getAssemblyPartDataList(params, callback) {
    const requestData = { LoggedInUserId: loggedInUserId(), ...params }
    return async (dispatch) => {
        try {
            // Make the API request
            const response = await axios.get(API.getAssemblyPartDataList, {
                ...config(),
                params: requestData,
            });

            // Check if the response is valid
            if (response?.data?.Result || response?.status === 204) {
                dispatch({
                    type: GET_ALL_PARTS_SUCCESS,
                    payload: response.status === 204 ? [] : response.data?.DataList,
                });
            }

            // Invoke the callback with the response
            callback(response);
        } catch (error) {
            // Handle the error case
            dispatch({ type: API_FAILURE });
            callback(error);

            // Log the error (assuming `apiErrors` is a function for logging API errors)
            apiErrors(error);
        }
    };
}


/**
* @method getAssemblyPartDetail
* @description GET ASSEMBLY PART DETAIL
*/
export function getAssemblyPartDetail(PartId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (PartId !== '') {
            const request = axios.get(`${API.getAssemblyPartDetail}/${PartId}/${loggedInUser?.loggedInUserId}`, config());
            request.then((response) => {
                if (response.data.Result || response.status === 204) {
                    dispatch({
                        type: GET_UNIT_PART_DATA_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.Data,
                    });
                    callback(response);
                }
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
        axiosInstance.put(`${API.updateAssemblyPart}`, requestData, config())
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
* @method deleteAssemblyPart
* @description DELETE ASSEMBLY PART
*/
export function deleteAssemblyPart(assyPartId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `assyPartId=${assyPartId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteAssemblyPart}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
* @method getSelectListPartType
* @description GET SELECTLIST OF PART TYPE LIKE ASSEMBLY, COMPONENT AND BOP
*/
export function getSelectListPartType(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSelectListPartType}`, config());
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
export function getAssemblyPartSelectList(data, callback) {
    return axios.get(`${API.getAssemblyPartSelectList}?loggedInUserId=${loggedInUserId()}&technologyId=${data.technologyId}&effectiveDate=${data.date}&partNumber=${data.partNumber}&isActive=${data.isActive}`, config()).catch(error => {
        apiErrors(error);
        callback(error);
        return Promise.reject(error)
    });
}

/**
* @method getComponentPartSelectList
* @description GET COMPONENT PART SELECTLIST
*/
export function getComponentPartSelectList(data, callback) {
    return axios.get(`${API.getComponentPartSelectList}?loggedInUserId=${loggedInUserId()}&technologyId=${data.technologyId}&effectiveDate=${data.date}&partNumber=${data.partNumber}&isActive=${data.isActive}`, config()).catch(error => {
        apiErrors(error);
        callback(error);
        return Promise.reject(error)
    });
}

/**
* @method getBoughtOutPartSelectList
* @description GET COMPONENT PART SELECTLIST
*/
export function getBoughtOutPartSelectList(date, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getBoughtOutPartSelectList}?effectiveDate=${date}`, config());
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (PartId !== '') {
            const request = axios.get(`${API.getAssemblyPartDetail}/${PartId}/${loggedInUser?.loggedInUserId}`, config());
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getPartData}/${PartId}/${loggedInUser?.loggedInUserId}`, config())
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId !== '') {
            axios.get(`${API.getChildDrawerBOPData}/${PartId}/${loggedInUser?.loggedInUserId}`, config())
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getBOMViewerTree}/${PartId}/${loggedInUser?.loggedInUserId}`, config())
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getBOMViewerTree}/${PartId}/${LevelId}/${loggedInUser?.loggedInUserId}`, config())
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
        const request = axiosInstance.post(API.BOMUploadPart, data, config());
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
 * @method getPartDataList
 * @description get Parts
 */
export function getProductDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProductDataList}`, config());
        request.then((response) => {
            if (response.data.Result === true || response.status === 204) {
                dispatch({
                    type: GET_PRODUCT_DATA_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList,
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
 * @method createProduct
 * @description create New Product
 */
export function createProduct(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createProduct, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
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
 * @method updateProduct
 * @description update Product
 */
export function updateProduct(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateProduct}`, requestData, config())
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
 * @method getPartData
 * @description get Part Data
 */
export function getProductData(ProductId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ProductId !== '') {
            axios.get(`${API.getProductById}?loggedInUserId=${loggedInUserId()}&productid=${ProductId}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_PRODUCT_UNIT_DATA,
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
                type: GET_PRODUCT_UNIT_DATA,
                payload: {},
            });
            callback({});
        }
    };
}



/**
 * @method deletePart
 * @description delete part
 */
export function deleteProduct(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteProduct}?ProductId=${Id}&LoggedInUserId=${loggedInUserId()}`, config())
            //MINDA
            // export function deleteProduct(obj, callback) {
            //         axios.delete(`${API.deleteProduct}`, obj, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method fileUploadProduct
 * @description File Upload INDIVIDUAL PRODUCT
 */
export function fileUploadProduct(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.productAttachment, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
        });
    };
}

export function getProductGroupSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(API.productGroupSelectList, config())
        request.then((response) => {
            if (response && response.status === 200) {
                dispatch({
                    type: PRODUCT_GROUPCODE_SELECTLIST,
                    payload: response.data.SelectList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


export function getPartDescription(partNumber, partId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getPartDescription}?PartNumber=${partNumber}&PartTypeId=${partId}&loggedInUserId=${loggedInUserId()}`, config())
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response)
            } else {
                callback([])
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


export function convertPartToAssembly(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.convertPartToAssembly}`, requestData, config())
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
 * @method CreatComponentBySap
 * @description create Component By SAP
 */
export function CreatComponentBySap(callback) {
    return (dispatch) => {
        const request = axiosInstance.post(`${API.CreatComponentBySap}?fromDate=${null}&toDate=${null}`, '', config());
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
 * @method updatePart
 * @description update Part
 */
export function updateMultipleComponentTechnology(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateMultiplecomponentTechnology}`, requestData, config())
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
 * @method activeInactivePartUser
 * @description active Inactive Part
 */
export function activeInactivePartUser(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.ActiveInActivePartUser}`, requestData, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

export function createProductLevels(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createProductLevels, data, config());
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
export function getAllProductLevels(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllProductLevels}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_PRODUCT_HIERARCHY_DATA,
                    payload: response.status === 204 ? [] : response.data.DataList
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

export function getPreFilledProductLevelValues(levelValueId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPreFilledProductLevelValues}?loggedInUserId=${loggedInUserId()}&producthierarchyvaluedetailid=${levelValueId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: STORE_HIERARCHY_DATA,
                    payload: response.status === 204 ? [] : response.data.DataList
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

export function createProductLevelValues(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createProductLevelValues, data, config());
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

export function getProductLabel(id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getProductLabel}?loggedInUserId=${loggedInUserId()}&producthierarchyid=${id}`, config());
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
export function updateProductLabel(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.put(API.updateProductLabel, data, config());
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
export function storeHierarchyData(data) {
    return (dispatch) => {
        dispatch({
            type: STORE_HIERARCHY_DATA,
            payload: data,
        });
    };

}

/**
 * @method getModelList
 * @description Get all models
 */
export function getModelList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getModelList, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method addModel
 * @description Add a new model
 */
export function addModel(data, callback) {
    console.log("data", data);
    const requestData = { loggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        const request = axiosInstance.post(API.addModel, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method editModel
 * @description Edit an existing model
 */
export function editModel(data, callback) {
    const requestData = { loggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        const request = axiosInstance.put(API.editModel, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method deleteModel
 * @description Delete a model
 */
export function deleteModel(modelId, callback) {
    return (dispatch) => {
        const request = axios.delete(`${API.deleteModel}?modelId=${modelId}&loggedInUserId=${loggedInUserId()}`, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            apiErrors(error);
            callback(error);
        });
    };
}


/**
 * @method getPartFamilyList
 * @description Get part family list with pagination
 */
export function getPartFamilyList(skip, take, filterData, isPagination, callback) {
    return (dispatch) => {
      dispatch({ type: API_REQUEST });
      const requestData = {
        Skip: skip,
        Take: take,
        LoggedInUserId: loggedInUserId(),
        FilterData: filterData,
      };
      const request = axiosInstance.post(API.getPartFamilyList, requestData, config());
      request
        .then((response) => {
          if (isPagination) {
            dispatch({ type: GET_PART_FAMILY_LIST_SUCCESS, payload: response.data.DataList });
          } else {
            dispatch({ type: GET_ALL_PART_FAMILY_LIST_SUCCESS, payload: response.data.DataList });
          }
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
          callback(error.response);
        });
    };
  }
  
  /**
   * @method getPartFamilyById
   * @description Get part family details by id
   */
  export function getPartFamilyById(partFamilyId, callback) {
    return (dispatch) => {
      dispatch({ type: API_REQUEST });
      const loggedUser = loggedInUserId();
      const request = axios.get(`${API.getPartFamilyById}?loggedInUserId=${loggedUser}&partFamilyId=${partFamilyId}`, config());
      request
        .then((response) => {
          dispatch({ type: GET_PART_FAMILY_DETAILS_SUCCESS, payload: response.data.Data });
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
          callback(error.response);
        });
    };
  }
  
  /**
   * @method addPartFamily
   * @description Add a new part family
   */
  export function addPartFamily(data, callback) {
    return (dispatch) => {
      const request = axiosInstance.post(API.addPartFamily, data, config());
      request
        .then((response) => {
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          callback(error.response);
        });
    };
  }
  
  /**
   * @method editPartFamily
   * @description Edit an existing part family using update-part-family
   */
  export function editPartFamily(data, callback) {
    // Prepare data according to API structure
    const requestData = {
      PartFamilyId: data.PartFamilyId,
      PartFamilyCode: data.PartFamilyCode,
      PartFamilyName: data.PartFamilyName,
      Description: data.Description,
      LoggedInUserId: data.LoggedInUserId
    };
    
    return (dispatch) => {
      const request = axiosInstance.put(API.updatePartFamily, requestData, config());
      request
        .then((response) => {
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          callback(error.response);
        });
    };
  }
  
  /**
   * @method deletePartFamily
   * @description Delete a part family
   */
  export function deletePartFamily(partFamilyId, loggedInUserId, callback) {
    return (dispatch) => {
      dispatch({ type: API_REQUEST });
      const queryParams = `loggedInUserId=${loggedInUserId}&partFamilyId=${partFamilyId}`;
      axios
        .delete(`${API.deletePartFamily}?${queryParams}`, config())
        .then((response) => {
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
          callback(error.response);
        });
    };
  }
  
  /**
   * @method activeInactivePartFamily
   * @description Toggle active/inactive status of part family
   */
  export function activeInactivePartFamily(data, callback) {
    // Prepare data according to API structure
    const requestData = {
      Id: data.Id,
      LoggedInUserId: data.LoggedInUserId,
      IsActive: data.IsActive
    };
    
    return (dispatch) => {
      dispatch({ type: API_REQUEST });
      axiosInstance
        .put(`${API.activePartFamily}`, requestData, config())
        .then((response) => {
          callback(response);
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
          callback(error.response);
        });
    };
  }