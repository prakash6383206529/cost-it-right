import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_RM_GRADE_LIST_SUCCESS,
    GET_GRADE_DATA_SUCCESS,
    GET_RM_CATEGORY_LIST_SUCCESS,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_SPECIFICATION_DATA_SUCCESS,
    GET_MATERIAL_LIST_SUCCESS,
    GET_MATERIAL_LIST_TYPE_SUCCESS,
    RAWMATERIAL_ADDED_FOR_COSTING,
    GET_MATERIAL_TYPE_DATA_SUCCESS,
    GET_CATEGORY_DATA_SUCCESS,
    GET_RAW_MATERIAL_DATA_SUCCESS,
    GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
    GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS,
    GET_RM_TYPE_DATALIST_SUCCESS,
    GET_RMTYPE_SELECTLIST_SUCCESS,
    GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS,
    GET_RM_NAME_SELECTLIST,
    GET_GRADELIST_BY_RM_NAME_SELECTLIST,
    GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST,
    GET_GRADE_SELECTLIST_SUCCESS,
    GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA,
    GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST,
    GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST,
    GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST,
    GET_VENDOR_FILTER_BY_GRADE_SELECTLIST,
    GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST,
    GET_GRADE_FILTER_BY_VENDOR_SELECTLIST,
    GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
    config,
    GET_RM_DOMESTIC_LIST,
    GET_RM_IMPORT_LIST,
    GET_MANAGE_SPECIFICATION, GET_UNASSOCIATED_RM_NAME_SELECTLIST, SET_FILTERED_RM_DATA, VBC, ZBC, GET_RM_APPROVAL_LIST, GET_ALL_MASTER_APPROVAL_DEPARTMENT, GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { toastr } from 'react-redux-toastr'
import { loggedInUserId, userDetails } from '../../../helper';
import { MESSAGES } from '../../../config/message';

const headers = config

/**
 * @method createMaterialAPI
 * @description create material master
 */
export function createMaterialAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getRawMaterialDataAPI
 * @description get category data
 */
export function getRawMaterialDataAPI(RawMaterialId, callback) {
    return (dispatch) => {
        if (RawMaterialId !== '') {
            axios.get(`${API.getRawMaterialDataAPI}/${RawMaterialId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_RAW_MATERIAL_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateRawMaterialAPI
 * @description update Raw Material
 */
export function updateRawMaterialAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRawMaterialAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRawMaterialAPI
 * @description delete Raw Material API
 */
export function deleteRawMaterialAPI(RawMaterialId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRawMaterialAPI}/${RawMaterialId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                //apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createRMCategoryAPI
 * @description create row material category master
 */
export function createRMCategoryAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createRMCategoryAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getCategoryDataAPI
 * @description get category data
 */
export function getCategoryDataAPI(CategoryId, callback) {
    return (dispatch) => {
        if (CategoryId !== '') {
            axios.get(`${API.getCategoryDataAPI}/${CategoryId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_CATEGORY_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_CATEGORY_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateCategoryAPI
 * @description update category details
 */
export function updateCategoryAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCategoryAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteCategoryAPI
 * @description delete Material type API
 */
export function deleteCategoryAPI(CategoryId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryAPI}/${CategoryId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createRMGradeAPI
 * @description create row material grade master
 */
export function createRMGradeAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createRMGradeAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getRMGradeDataAPI
 * @description Get Grade data
 */
export function getRMGradeDataAPI(GradeId, callback) {
    return (dispatch) => {
        if (GradeId !== '') {
            axios.get(`${API.getRMGradeDataAPI}/${GradeId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_GRADE_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_GRADE_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}


/**
 * @method updateRMGradeAPI
 * @description update RM Grade details
 */
export function updateRMGradeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMGradeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRMGradeAPI
 * @description delete RM Grade API
 */
export function deleteRMGradeAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMGradeAPI}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createRMSpecificationAPI
 * @description create row material specification master
 */
export function createRMSpecificationAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createRMSpecificationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: CREATE_MATERIAL_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method createRMSpecificationAPI
 * @description create row material specification master
 */
export function createAssociation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAssociation, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: CREATE_MATERIAL_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method getRMSpecificationDataAPI
 * @description Get RM Specification data
 */
export function getRMSpecificationDataAPI(SpecificationId, callback) {
    return (dispatch) => {
        if (SpecificationId !== '') {
            axios.get(`${API.getRMSpecificationDataAPI}/${SpecificationId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_SPECIFICATION_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_SPECIFICATION_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method getRMSpecificationDataList
 * @description Used to get RM Specification Datalist
 */
export function getRMSpecificationDataList(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `raw_material_id=${data.MaterialId}&grade_id=${data.GradeId}`
        const request = axios.get(`${API.getRMSpecificationDataList}?${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_MANAGE_SPECIFICATION,
                    payload: response.status === 204 ? [] : response.data.DataList
                })
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
 * @method updateRMSpecificationAPI
 * @description update RM Grade details
 */
export function updateRMSpecificationAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMSpecificationAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRMSpecificationAPI
 * @description delete RM Specification API
 */
export function deleteRMSpecificationAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMSpecificationAPI}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                //apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getRMGradeSelectListByRawMaterial
 * @description Used to Grade List By Raw Material Id
 */
export function getRMGradeSelectListByRawMaterial(Id, callback) {
    return (dispatch) => {
        if (Id !== '') {
            const request = axios.get(`${API.getRMGradeSelectListByRawMaterial}/${Id}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_GRADE_SELECTLIST_SUCCESS,
                        payload: response.data.SelectList,
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
                type: GET_GRADE_SELECTLIST_SUCCESS,
                payload: [],
            });
        }
    };
}

/**
 * @method getRMTypeSelectListAPI
 * @description Used to RM type select list
 */
export function getRMTypeSelectListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMTypeSelectListAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RMTYPE_SELECTLIST_SUCCESS,
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
 * @method getGradeSelectList
 * @description Used to Get Grade List 
 */
export function getGradeSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getGradeSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_GRADE_SELECTLIST_SUCCESS,
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
 * @method getGradeByRMTypeSelectListAPI
 * @description Used to RM type select list
 */
// export function getGradeByRMTypeSelectListAPI(ID, callback) {
//     return (dispatch) => {
//         //dispatch({ type: API_REQUEST });
//         const request = axios.get(`${API.getGradeByRMTypeSelectListAPI}/${ID}`, headers);
//         request.then((response) => {
//             if (response.data.Result) {
//                 dispatch({
//                     type: GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS,
//                     payload: response.data.SelectList,
//                 });
//                 callback(response);
//             }
//         }).catch((error) => {
//             dispatch({ type: API_FAILURE, });
//             callback(error);
//             apiErrors(error);
//         });
//     };
// }

/**
 * @method getRowMaterialDataAPI
 * @description get row material list
 */
export function getRowMaterialDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getRMMaterialAPI, headers);
        const API2 = axios.get(API.getRMGradeAPI, headers);
        const API3 = axios.get(API.getRMCategoryAPI, headers);
        const API4 = axios.get(API.getRMSpecificationAPI, headers);
        Promise.all([API1, API2, API3, API4])
            .then((response) => {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response[0].data.DataList,
                });
                dispatch({
                    type: GET_RM_GRADE_LIST_SUCCESS,
                    payload: response[1].data.DataList,
                });
                dispatch({
                    type: GET_RM_CATEGORY_LIST_SUCCESS,
                    payload: response[2].data.DataList,
                });
                dispatch({
                    type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                    payload: response[3].data.DataList,
                });
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
                apiErrors(error);
            });
    };
}

// Action Creator for material master

/**
 * @method createMaterialTypeAPI
 * @description create material master
 */
export function createMaterialTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialType, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getMaterialTypeDataAPI
 * @description get material type data
 */
export function getMaterialTypeDataAPI(MaterialTypeId, callback) {
    return (dispatch) => {
        if (MaterialTypeId !== '') {
            axios.get(`${API.getMaterialTypeDataAPI}/${MaterialTypeId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_MATERIAL_TYPE_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_MATERIAL_TYPE_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method deleteMaterialTypeAPI
 * @description delete Material type API
 */
export function deleteMaterialTypeAPI(MaterialTypeId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMaterialTypeAPI}/${MaterialTypeId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                //apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method updateMaterialtypeAPI
 * @description update Material Type details
 */
export function updateMaterialtypeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMaterialtypeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createRMDetailAPI
 * @description create material master
 */
export function createRMDetailAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterial, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method createRMDomestic
 * @description create raw material domestic
 */
export function createRMDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createRMDomestic, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getRawMaterialDetailsDataAPI
 * @description get Raw Material Details
 */
export function getRawMaterialDetailsDataAPI(RawMaterialDetailsId, callback) {
    return (dispatch) => {
        if (RawMaterialDetailsId != '') {
            axios.get(`${API.getRawMaterialDetailsDataAPI}/${RawMaterialDetailsId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method getRawMaterialDetailsAPI
 * @description get Raw Material Details
 */
export function getRawMaterialDetailsAPI(data, isValid, callback) {
    return (dispatch) => {
        if (isValid) {
            axios.get(`${API.getRMDomesticDataById}/${data.Id}/${data.IsVendor}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateRMDomesticAPI
 * @description update Raw Material Domestic
 */
export function updateRMDomesticAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMDomesticAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRawMaterialDetailAPI
 * @description delete Raw Material Detail API
 */
export function deleteRawMaterialDetailAPI(RawMaterialDetailsId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRawMaterialDetailAPI}/${RawMaterialDetailsId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getMaterialDetailAPI
 * @description get row material list
 */
export function getMaterialDetailAPI(filterData) {
    return (dispatch) => {
        const API1 = axios.get(API.getMaterialTypeDataList, headers);
        const API2 = axios.post(API.getMaterial, filterData, headers);
        Promise.all([API1, API2])
            .then((response) => {
                dispatch({
                    type: GET_MATERIAL_LIST_TYPE_SUCCESS,
                    payload: response[0].data.DataList,
                });
                dispatch({
                    type: GET_MATERIAL_LIST_SUCCESS,
                    payload: response[1].data.DataList,
                });
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
                apiErrors(error);
            });
    };
}


/**
 * @method getMaterialTypeDataListAPI
 * @description get row material list
 */
export function getMaterialTypeDataListAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getMaterialTypeDataList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RM_TYPE_DATALIST_SUCCESS,
                    payload: response.data.DataList,
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
 * @method rawMaterialForCosting
 * @description get row material list
 */
export function rawMaterialForCosting(data) {
    return (dispatch) => {
        dispatch({
            type: RAWMATERIAL_ADDED_FOR_COSTING,
            payload: data
        });
    };
}

/**
 * @method getAllRawMaterialList
 * @description Used to raw material list
 */
export function getAllRawMaterialList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMMaterialAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response.data.DataList,
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
 * @method createRawMaterialNameChild
 * @description create material master
 */
export function createRawMaterialNameChild(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createRawMaterialNameChild, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getRawMaterialNameChild
 * @description get raw material name child
 */
export function getRawMaterialNameChild(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRawMaterialNameChild}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RM_NAME_SELECTLIST,
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
 * @method getRawMaterialNameChild
 * @description get raw material name child
 */
export function getUnassociatedRawMaterail(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getUnassociatedRawMaterial}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UNASSOCIATED_RM_NAME_SELECTLIST,
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
 * @method getRawMaterialNameChild
 * @description get grade list by raw material name child
 */
export function getGradeListByRawMaterialNameChild(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getGradeListByRawMaterialNameChild}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_GRADELIST_BY_RM_NAME_SELECTLIST,
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
 * @method getVendorListByVendorType
 * @description get Vendor list by Vendor Type (RAW MATERIAL OR VBC)
 */
export function getVendorListByVendorType(isVendor, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorListByVendorType}/${isVendor}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST,
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
 * @method getVendorWithVendorCodeSelectList
 * @description GET VBC VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getVendorWithVendorCodeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getRMDomesticDataList
 * @description Used to get RM Domestic Datalist
 */
export function getRMDomesticDataList(data, callback) {
    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const queryParams = `CostingHead=${(data.costingHead === VBC || data.costingHead === 1) ? 1 : (data.costingHead === ZBC || data.costingHead === 0) ? 0 : null}&PlantId=${data.plantId}&material_id=${data.material_id}&grade_id=${data.grade_id}&vendor_id=${data.vendor_id}&technology_id=${data.technologyId}&net_landed_min_range=${data.net_landed_min_range}&net_landed_max_range=${data.net_landed_max_range}`
        const request = axios.get(`${API.getRMDomesticDataList}?${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                //
                dispatch({
                    type: GET_RM_DOMESTIC_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {


            dispatch({ type: API_FAILURE, });
            callback(error);

            //apiErrors(error);
        });
    };
}

/**
 * @method fileUploadRMDomestic
 * @description File Upload Raw Material Domestic
 */
export function fileUploadRMDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadRMDomestic, data, headers);
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
 * @method createRMImport
 * @description create raw material Import
 */
export function createRMImport(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createRMImport, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method updateRMImportAPI
 * @description update Raw Material Import
 */
export function updateRMImportAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMImportAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getRMImportDataById
 * @description get Raw Material Import Details By Id.
 */
export function getRMImportDataById(data, isValid, callback) {
    return (dispatch) => {
        if (isValid) {
            axios.get(`${API.getRMImportDataById}/${data.Id}/${data.IsVendor}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}


/**
 * @method getRMImportDataList
 * @description Used to get RM Import Datalist
 */
export function getRMImportDataList(data, callback) {
    return (dispatch) => {
        const queryParams = `CostingHead=${(data.costingHead === VBC || data.costingHead === 1) ? 1 : (data.costingHead === ZBC || data.costingHead === 0) ? 0 : null}&PlantId=${data.plantId}&material_id=${data.material_id}&grade_id=${data.grade_id}&vendor_id=${data.vendor_id}&technology_id=${data.technologyId}&net_landed_min_range=${data.net_landed_min_range}&net_landed_max_range=${data.net_landed_max_range}`
        const request = axios.get(`${API.getRMImportDataList}?${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_RM_IMPORT_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method fileUpdateRMDomestic
 * @description File update Raw Material Domestic
 */
export function fileUpdateRMDomestic(data, callback) {
    return (dispatch) => {
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.put(API.fileUpdateRMDomestic, data, headers);
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
 * @method fileDeleteRMDomestic
 * @description delete Raw Material API
 */
export function fileDeleteRMDomestic(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteRMDomestic}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method bulkUploadRMDomesticZBC
 * @description upload bulk RM Domestic ZBC
 */
export function bulkUploadRMDomesticZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMDomesticZBC, data, headers);
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
 * @method bulkUploadRMDomesticVBC
 * @description upload bulk RM Domestic VBC
 */
export function bulkUploadRMDomesticVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMDomesticVBC, data, headers);
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
 * @method bulkfileUploadRM
 * @description upload bulk RM Domestic
 */
export function bulkfileUploadRM(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkfileUploadRM, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadRMImportZBC
 * @description upload bulk RM Domestic ZBC
 */
export function bulkUploadRMImportZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMImportZBC, data, headers);
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
 * @method bulkUploadRMImportVBC
 * @description upload bulk RM Domestic VBC
 */
export function bulkUploadRMImportVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMImportVBC, data, headers);
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
 * @method bulkUploadRMSpecification
 * @description upload bulk RM Specification
 */
export function bulkUploadRMSpecification(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMSpecification, data, headers);
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
 * @method getRawMaterialChildById
 * @description Used to Get Net Landed max range for filter
 */
export function getRawMaterialChildById(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialChildById}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}

/**
 * @method updateRawMaterialChildName
 * @description Update Raw Material Child Name
 */
export function updateRawMaterialChildName(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updateRawMaterialChildName, data, headers);
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
 * @method getRawMaterialFilterSelectList
 * @description INTIAL LIST OF RM, GRADE & VENDOR IN DOMESTIC AND IMPORT FILTER
 */
export function getRawMaterialFilterSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialFilterSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA,
                    payload: response.data.DynamicData,
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
 * @method getGradeFilterByRawMaterialSelectList
 * @description GET GRADE LIST BY RAW MATERIAL IN FILTER
 */
export function getGradeFilterByRawMaterialSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getGradeFilterByRawMaterialSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST,
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
 * @method getVendorFilterByRawMaterialSelectList
 * @description GET VENDOR LIST BY RAW MATERIAL IN FILTER
 */
export function getVendorFilterByRawMaterialSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorFilterByRawMaterialSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST,
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
 * @method getRawMaterialFilterByGradeSelectList
 * @description GET RAWMATERIAL LIST BY GRADE IN FILTER
 */
export function getRawMaterialFilterByGradeSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRawMaterialFilterByGradeSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST,
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
 * @method getVendorFilterByGradeSelectList
 * @description GET VENDOR LIST BY GRADE IN FILTER
 */
export function getVendorFilterByGradeSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorFilterByGradeSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_GRADE_SELECTLIST,
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
 * @method getRawMaterialFilterByVendorSelectList
 * @description GET RAWMATERIAL LIST BY VENDOR IN FILTER
 */
export function getRawMaterialFilterByVendorSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRawMaterialFilterByVendorSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST,
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
 * @method getGradeFilterByVendorSelectList
 * @description GET GRADE LIST BY VENDOR IN FILTER
 */
export function getGradeFilterByVendorSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getGradeFilterByVendorSelectList}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_GRADE_FILTER_BY_VENDOR_SELECTLIST,
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
 * @method getMaterialTypeSelectList
 * @description material type list
 */
export function getMaterialTypeSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getMaterialTypeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
                payload: response.data.SelectList,
            });
            callback()
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method checkAndGetOperationCode
 * @description CHECK AND GET OPERATION CODE
 */
export function checkAndGetRawMaterialCode(code, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.checkAndGetRawMaterialCode}?materialCode=${code}`, '', headers);
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

export function setFilterForRM(filteredValue) {
    return (dispatch) => {
        dispatch({
            type: SET_FILTERED_RM_DATA,
            payload: filteredValue,
        });
    }
}


/**
 * @method getRMApprovalList
 * @description Used to get RM Approval List
 */
export function getRMApprovalList(callback) {

    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}`, headers);
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                //
                dispatch({
                    type: GET_RM_APPROVAL_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                    // payload: JSON.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error)
        });
    };
}


/**
 * @method getAllMasterApprovalDepartment
 * @description get all master approval department
 */
export function getAllMasterApprovalDepartment(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllMasterApprovalDepartment}`, headers)
        request
            .then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_DEPARTMENT,
                        payload: response.data.SelectList,
                    })
                    callback(response)
                } else {
                    toastr.error(MESSAGES.SOME_ERROR)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                callback(error)
                apiErrors(error)
            })
    }
}

/**
* @method getAllApprovalUserFilterByDepartment
* @description GET ALL APPROVAL USERS FILTER BY DEPARTMENT
*/
export function getAllMasterApprovalUserByDepartment(data, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.getAllMasterApprovalUserByDepartment}`, data, headers,)

        request
            .then((response) => {

                if (response.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT,
                        payload: response.data.DataList,
                    })
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        toastr.error(response.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({
                    type: API_FAILURE,
                })
                apiErrors(error)
            })
    }
}

/**
 * @method simulationApprovalRequestBySender
 * @description sending the request to Approver for first time
 */
export function masterApprovalRequestBySender(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.masterSendToApprover, data, headers)
        request.then((response) => {
            if (response.data.Result) {
                callback(response)
            } else {
                dispatch({ type: API_FAILURE })
                if (response.data.Message) {
                    toastr.error(response.data.Message)
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


/**
 * @method approvalRequestByApprove
 * @description approving the request by approve
 */
export function approvalRequestByMasterApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.approveMasterByApprover, data, headers)
        request
            .then((response) => {
                if (response.data.Result) {
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        toastr.error(response.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}
/**
 * @method rejectRequestByApprove
 * @description rejecting approval Request
 */
export function rejectRequestByMasterApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.rejectMasterByApprover, data, headers)
        request
            .then((response) => {
                if (response.data.Result) {
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        toastr.error(response.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}


/**
 * @method getApprovalSummary
 * @description getting summary of approval by approval id
 */

export function getMasterApprovalSummary(tokenNo, approvalProcessId, callback) {
    return (dispatch) => {
        const request = axios.get(
            `${API.getMasterApprovalSummaryByApprovalNo}/${tokenNo}/${approvalProcessId}/${loggedInUserId()}`, headers)
        request
            .then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_RM_DOMESTIC_LIST,
                        payload: response.data.Data.ImpactedMasterDataList,
                    })
                    callback(response)
                } else {
                    toastr.error(MESSAGES.SOME_ERROR)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}