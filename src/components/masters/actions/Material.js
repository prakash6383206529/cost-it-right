import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_GRADE_DATA_SUCCESS,
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
    GET_BOP_DOMESTIC_DATA_LIST,
    GET_RM_NAME_SELECTLIST,
    GET_MACHINE_DATALIST_SUCCESS,
    GET_GRADELIST_BY_RM_NAME_SELECTLIST,
    GET_GRADE_SELECTLIST_SUCCESS,
    GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA,
    GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST,
    GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST,
    GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST,
    GET_VENDOR_FILTER_BY_GRADE_SELECTLIST,
    GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST,
    GET_GRADE_FILTER_BY_VENDOR_SELECTLIST,
    GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
    GET_OPERATION_COMBINED_DATA_LIST,
    OPERATIONS_ID,
    BOP_MASTER_ID,
    RM_MASTER_ID,
    MACHINE_MASTER_ID,
    config,
    GET_RM_DOMESTIC_LIST,
    GET_ALL_RM_DOMESTIC_LIST,
    GET_RM_IMPORT_LIST,
    GET_MANAGE_SPECIFICATION, GET_UNASSOCIATED_RM_NAME_SELECTLIST, SET_FILTERED_RM_DATA, GET_RM_APPROVAL_LIST, GET_ALL_MASTER_APPROVAL_DEPARTMENT, GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT, EMPTY_GUID, BUDGET_ID, GET_VOLUME_DATA_LIST, GET_SPECIFICATION_SELECTLIST_SUCCESS, GET_RM_SPECIFICATION_LIST_SUCCESS, GET_BOP_IMPORT_DATA_LIST, ONBOARDINGID, GET_ONBOARDING_SUMMARY_DATA_LIST, RAW_MATERIAL_DETAILS,
    COMMODITY_INDEX_RATE_AVERAGE,
    GET_RM_DETAILS
} from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { getConfigurationKey, loggedInUserId, userDetails } from '../../../helper';
import { MESSAGES } from '../../../config/message';
import { rmQueryParms } from '../masterUtil';
import { reactLocalStorage } from 'reactjs-localstorage';

/**
 * @method createMaterialAPI
 * @description create material master
 */
export function createMaterialAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialAPI, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    //payload: response?.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
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
            axios.get(`${API.getRawMaterialDataAPI}/${RawMaterialId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DATA_SUCCESS,
                        payload: response?.data.Data,
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
        axios.put(`${API.updateRawMaterialAPI}`, requestData, config())
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
export function deleteRawMaterialAPI(rawMaterialId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `rawMaterialId=${rawMaterialId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteRawMaterialAPI}?${queryParams}`, config())
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
        const request = axios.post(API.createRMCategoryAPI, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
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
            axios.get(`${API.getCategoryDataAPI}/${CategoryId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_CATEGORY_DATA_SUCCESS,
                        payload: response?.data.Data,
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
        axios.put(`${API.updateCategoryAPI}`, requestData, config())
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
export function deleteCategoryAPI(CategoryId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `CategoryId=${CategoryId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteCategoryAPI}?${queryParams}`, config())
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
        const request = axios.post(API.createRMGradeAPI, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
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
            axios.get(`${API.getRMGradeDataAPI}/${GradeId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_GRADE_DATA_SUCCESS,
                        payload: response?.data.Data,
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
        axios.put(`${API.updateRMGradeAPI}`, requestData, config())
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
export function deleteRMGradeAPI(gradeId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `gradeId=${gradeId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteRMGradeAPI}?${queryParams}`, config())
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
        const request = axios.post(API.createRMSpecificationAPI, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({ type: CREATE_MATERIAL_SUCCESS, });
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
 * @method createRMSpecificationAPI
 * @description create row material specification master
 */
export function createAssociation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAssociation, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({ type: CREATE_MATERIAL_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}


/**
 * @method getRMSpecificationDataAPI
 * @description Get RM Specification data
 */
export function getRMSpecificationDataAPI(SpecificationId, excludeDefaultRMGradeAndSpecs, callback) {
    return (dispatch) => {
        if (SpecificationId !== '') {
            axios.get(`${API.getRMSpecificationDataAPI}?specificationId=${SpecificationId}&excludeDefaultRMGradeAndSpecs=${excludeDefaultRMGradeAndSpecs}`, config())
                .then((response) => {
                    if (response?.data.Result || response?.status === 204) {
                        dispatch({
                            type: GET_SPECIFICATION_DATA_SUCCESS,
                            payload: response?.data.Data,
                        });
                    }
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
        const queryParams = `grade_id=${data.GradeId}`
        const request = axios.get(`${API.getRMSpecificationDataList}?${queryParams}`, config());
        request.then((response) => {
            if (response?.data.Result || response?.status === 204) {
                dispatch({
                    type: GET_MANAGE_SPECIFICATION,
                    payload: response?.status === 204 ? [] : response?.data.DataList
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
        axios.put(`${API.updateRMSpecificationAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}

/**
 * @method deleteRMSpecificationAPI
 * @description delete RM Specification API
 */
export function deleteRMSpecificationAPI(specificationId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `specificationId=${specificationId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteRMSpecificationAPI}?${queryParams}`, config())
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
export function getRMGradeSelectListByRawMaterial(Id, isRequestForReport, callback) {
    return (dispatch) => {
        if (Id !== '') {
            const queryParams = `&id=${Id}&isRequestForReport=${isRequestForReport}`
            const request = axios.get(`${API.getRMGradeSelectListByRawMaterial}?${queryParams}`, config());
            request.then((response) => {
                if (response?.data.Result) {
                    dispatch({
                        type: GET_GRADE_SELECTLIST_SUCCESS,
                        payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getRMTypeSelectListAPI}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RMTYPE_SELECTLIST_SUCCESS,
                    payload: response?.data.SelectList,
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
//         const request = axios.get(`${API.getGradeByRMTypeSelectListAPI}/${ID}`, config());
//         request.then((response) => {
//             if (response?.data.Result) {
//                 dispatch({
//                     type: GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS,
//                     payload: response?.data.SelectList,
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


// Action Creator for material master

/**
 * @method createMaterialTypeAPI
 * @description create material master
 */
export function createMaterialTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialType, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response?.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error)
        });
    };
}


/**
 * @method getMaterialTypeDataAPI
 * @description get material type data
 */
export function getMaterialTypeDataAPI(rawMaterialId, gradeId, callback) {
    return (dispatch) => {
        if (rawMaterialId || gradeId) {
            axios.get(`${API.getMaterialTypeDataAPI}?materialTypeId=${rawMaterialId}&rawMaterialGradeId=${gradeId}`, config())
                .then((response) => {
                    if (response?.data.Result) {
                        dispatch({
                            type: GET_MATERIAL_TYPE_DATA_SUCCESS,
                            payload: response?.data?.Data,
                        });
                        callback(response)
                    }
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
        axios.delete(`${API.deleteMaterialTypeAPI}/${MaterialTypeId}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                apiErrors(error);
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
        axios.put(`${API.updateMaterialtypeAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}

/**
 * @method createRMDetailAPI
 * @description create material master
 */
export function createRMDetailAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterial, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response?.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
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
 * @method createRM
 * @description create raw material domestic
 */
export function createRM(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createRM, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

/**
 * @method getRawMaterialDetailsDataAPI
 * @description get Raw Material Details
 */
export function getRawMaterialDetailsDataAPI(RawMaterialDetailsId, callback) {
    return (dispatch) => {
        if (RawMaterialDetailsId !== '') {
            axios.get(`${API.getRawMaterialDetailsDataAPI}/${RawMaterialDetailsId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS,
                        payload: response?.data.Data,
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
 * @method getRMDataById
 * @description get Raw Material Details
 */
export function getRMDataById(data, isValid, callback) {
    return (dispatch) => {
        if (isValid) {
            axios.get(`${API.getRMDataById}/${data.Id}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
                        payload: response?.data.Data,
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
 * @method updateRMAPI
 * @description update Raw Material Domestic
 */
export function updateRMAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
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
        axios.delete(`${API.deleteRawMaterialDetailAPI}/${RawMaterialDetailsId}`, config())
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
        const API1 = axios.get(API.getMaterialTypeDataList, config());
        const API2 = axios.post(API.getMaterial, filterData, config());
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
        const request = axios.get(`${API.getMaterialTypeDataList}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RM_TYPE_DATALIST_SUCCESS,
                    payload: response?.data.DataList,
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
        const request = axios.get(`${API.getRMMaterialAPI}`, config());
        request.then((response) => {
            if (response?.data.Result || response?.status === 204) {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response?.status === 204 ? [] : response?.data.DataList,
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
        const request = axios.post(API.createRawMaterialNameChild, data, config());
        request.then((response) => {
            if (response?.data.Result) {
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
        const request = axios.get(`${API.getRawMaterialNameChild}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RM_NAME_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getUnassociatedRawMaterial}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_UNASSOCIATED_RM_NAME_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getGradeListByRawMaterialNameChild}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_GRADELIST_BY_RM_NAME_SELECTLIST,
                    payload: response?.data.SelectList,
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
export function getVendorListByVendorType(costingTypeId, vendorName, callback) {
    return axios.get(`${API.getVendorListByVendorType}?costingTypeId=${costingTypeId}&vendorName=${vendorName}`, config()).catch(error => {
        apiErrors(error);
        callback(error);
        return Promise.reject(error)
    });
}

/**
 * @method getAllRMDataList
 * @description Used to get RM Domestic Datalist
 */
export function getAllRMDataList(data, skip, take, isPagination, obj, isImport, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            technology_id: data.technologyId,
            net_landed_min_range: data.net_landed_min_range,
            net_landed_max_range: data.net_landed_max_range,
            ListFor: data.ListFor ? data.ListFor : '',
            StatusId: data.StatusId ? data.StatusId : '',
            DepartmentCode: obj.DepartmentName !== undefined ? obj.DepartmentName : '',
            CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '',
            FromDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : '',
            ToDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : '',
            IsCustomerDataShow: reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false,
            IsVendorDataShow: reactLocalStorage.getObject('CostingTypePermission').vbc,
            IsZeroDataShow: reactLocalStorage.getObject('CostingTypePermission').zbc,
            ScrapUnitOfMeasurement: obj.ScrapUnitOfMeasurement !== undefined ? obj.ScrapUnitOfMeasurement : '',
            IsScrapUOMApply: obj.IsScrapUOMApply ? (obj.IsScrapUOMApply.toLowerCase() === 'yes' ? true : false) : '',
            CalculatedFactor: obj.CalculatedFactor !== undefined ? obj.CalculatedFactor : '',
            ScrapRatePerScrapUOM: obj.ScrapRatePerScrapUOM !== undefined ? obj.ScrapRatePerScrapUOM : '',
            UOMToScrapUOMRatio: obj.UOMToScrapUOMRatio !== undefined ? obj.UOMToScrapUOMRatio : '',
            NetConditionCost: obj.NetConditionCost !== undefined ? obj.NetConditionCost : "",
            NetLandedCostConversion: obj.NetLandedCostConversion !== undefined ? obj.NetLandedCostConversion : "",
            BasicRatePerUOMConversion: obj.BasicRatePerUOMConversion !== undefined ? obj.BasicRatePerUOMConversion : "",
            ScrapRateInINR: obj.ScrapRateInINR !== undefined ? obj.ScrapRateInINR : "",
            RawMaterialFreightCostConversion: obj.RawMaterialFreightCostConversion !== undefined ? obj.RawMaterialFreightCostConversion : "",
            RMFreightCost: obj.RMFreightCost,
            RawMaterialShearingCostConversion: obj.RawMaterialShearingCostConversion !== undefined ? obj.RawMaterialShearingCostConversion : "",
            NetCostWithoutConditionCostConversion: obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : "",
            NetConditionCostConversion: obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : "",
            NetLandedCostConversionAPI: obj.NetLandedCostConversionAPI !== undefined ? obj.NetLandedCostConversionAPI : "",
            isRequestForPendingSimulation: obj.isRequestForPendingSimulation ?? false,
        });
        // const queryParams = `technology_id=${data.technologyId}&net_landed_min_range=${data.net_landed_min_range}&net_landed_max_range=${data.net_landed_max_range}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&DepartmentCode=${obj.DepartmentName !== undefined ? obj.DepartmentName : ""}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}&ScrapUnitOfMeasurement=${obj.ScrapUnitOfMeasurement !== undefined ? obj.ScrapUnitOfMeasurement : ''}&IsScrapUOMApply=${obj.IsScrapUOMApply ? (obj.IsScrapUOMApply?.toLowerCase() === 'yes' ? true : false) : ''}&CalculatedFactor=${obj.CalculatedFactor !== undefined ? obj.CalculatedFactor : ''}&ScrapRatePerScrapUOM=${obj.ScrapRatePerScrapUOM !== undefined ? obj.ScrapRatePerScrapUOM : ''}&UOMToScrapUOMRatio=${obj.UOMToScrapUOMRatio !== undefined ? obj.UOMToScrapUOMRatio : ''}&NetConditionCost=${obj.NetConditionCost !== undefined ? obj.NetConditionCost : ""}&NetLandedCostConversion=${obj.NetLandedCostConversion !== undefined ? obj.NetLandedCostConversion : ""}&BasicRatePerUOMConversion=${obj.BasicRatePerUOMConversion !== undefined ? obj.BasicRatePerUOMConversion : ""}&ScrapRateInINR=${obj.ScrapRateInINR !== undefined ? obj.ScrapRateInINR : ""}&RawMaterialFreightCostConversion=${obj.RawMaterialFreightCostConversion !== undefined ? obj.RawMaterialFreightCostConversion : ""}&RawMaterialShearingCostConversion=${obj.RawMaterialShearingCostConversion !== undefined ? obj.RawMaterialShearingCostConversion : ""}&NetCostWithoutConditionCostConversion=${obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : ""}&NetConditionCostConversion=${obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : ""}&NetLandedCostConversionAPI=${obj.NetLandedCostConversionAPI !== undefined ? obj.NetLandedCostConversionAPI : ""}`
        const queryParamsSecond = rmQueryParms(isPagination, skip, take, obj)
        const request = axios.get(`${API.getAllRMDataList}?${queryParams}&${queryParamsSecond}`, config());
        request.then((response) => {
            if (response?.data.Result || response?.status === 204) {
                if (isPagination === true) {
                    dispatch({
                        type: isImport ? GET_RM_IMPORT_LIST : GET_RM_DOMESTIC_LIST,
                        payload: response?.status === 204 ? [] : response?.data.DataList
                    })
                } else {
                    dispatch({
                        type: isImport ? GET_ALL_RM_DOMESTIC_LIST : GET_ALL_RM_DOMESTIC_LIST,
                        payload: response?.status === 204 ? [] : response?.data.DataList
                    })
                }
                callback(response);
            }
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fileUploadRMDomestic
 * @description File Upload Raw Material Domestic
 */
export function fileUploadRMDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadRMDomestic, data, config());
        request.then((response) => {
            if (response && response?.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error.toString())
        });
    };
}

/**
 * @method fileUpdateRMDomestic
 * @description File update Raw Material Domestic
 */
export function fileUpdateRMDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.fileUpdateRMDomestic, data, config());
        request.then((response) => {
            if (response && response?.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadRM
 * @description upload bulk RM Domestic ZBC
 */
export function bulkUploadRM(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRM, data, config());
        request.then((response) => {
            if (response?.status === 200) {
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
 * @method bulkfileUploadRM
 * @description upload bulk RM Domestic
 */
export function bulkfileUploadRM(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkfileUploadRM, data, config());
        request.then((response) => {
            if (response?.data.Result) {
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
        const request = axios.post(API.bulkUploadRMSpecification, data, config());
        request.then((response) => {
            if (response?.status === 200) {
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
 * @method getRawMaterialChildById
 * @description Used to Get Net Landed max range for filter
 */
export function getRawMaterialChildById(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialChildById}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
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
        const request = axios.put(API.updateRawMaterialChildName, data, config());
        request.then((response) => {
            if (response && response?.status === 200) {
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
        const request = axios.get(`${API.getRawMaterialFilterSelectList}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA,
                    payload: response?.data.DynamicData,
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
        const request = axios.get(`${API.getGradeFilterByRawMaterialSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getVendorFilterByRawMaterialSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getRawMaterialFilterByGradeSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getVendorFilterByGradeSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_GRADE_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getRawMaterialFilterByVendorSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(`${API.getGradeFilterByVendorSelectList}/${ID}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_GRADE_FILTER_BY_VENDOR_SELECTLIST,
                    payload: response?.data.SelectList,
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
        const request = axios.get(API.getMaterialTypeSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
                payload: response?.data.SelectList,
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
export function checkAndGetRawMaterialCode(obj, callback) {
    return (dispatch) => {
        let queryParams = `materialNameId=${obj?.materialNameId ? obj.materialNameId : EMPTY_GUID}&materialGradeId=${obj.materialGradeId ? obj.materialGradeId : EMPTY_GUID}&materialSpec=${obj.materialSpec}&materialCode=${obj.materialCode}`
        const request = axios.post(`${API.checkAndGetRawMaterialCode}?${queryParams}`, '', config());
        request.then((response) => {
            if (response && response?.status === 200) {
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
export function getRMApprovalList(masterId, skip, take, isPagination, obj, onboardingApprovalId = '', callback) {


    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const queryParams = encodeQueryParamsAndLog({
            applyPagination: isPagination, skip: skip, take: take, Token: obj.ApprovalNumber, CostingHead: obj.CostingHead,  // Technology: obj.Technology !== undefined ? obj.Technology : "",
            Technology: obj.TechnologyName, UOM: obj.UOM, EffectiveDate: obj.EffectiveDate, InitiatedBy: obj.RequestedBy, CreatedBy: obj.CreatedByName, LastApprovedBy: obj.LastApprovedBy, Status: obj.DisplayStatus, BasicRate: obj.BasicRate, BasicRateConversion: obj.BasicRateConversion, NetCostWithoutConditionCost: obj.NetCostWithoutConditionCost, NetCostWithoutConditionCostConversion: obj.NetCostWithoutConditionCostConversion, NetConditionCostConversion: obj.NetConditionCostConversion, NetLandedCost: obj.NetLandedCost,
            NetLandedCostConversion: obj.NetLandedCostConversion, Plant: obj.Plants, Vendor: obj.VendorName, RMName: obj.RawMaterial, RMGrade: obj.RMGrade, RMSpecification: obj.RMSpec, RMCategory: obj.Category, RMMaterialType: obj.MaterialType, RMScrapRate: obj.ScrapRate, RMFreightCost: obj.RMFreightCost, RMShearingCost: obj.RMShearingCost, BOPPartNumber: obj.BoughtOutPartNumber,
            BOPPartName: obj.BoughtOutPartName, BOPCategory: obj.BoughtOutPartCategory, BOPSpecification: obj.Specification, OperationName: obj.OperationName, OperationCode: obj.OperationCode, MachineNumber: obj.MachineNumber, MachineType: obj.MachineTypeName, MachineTonnage: obj.MachineTonnage,
            MachineProcessName: obj.ProcessName, IsCustomerDataShow: obj?.IsCustomerDataShow, IsVendorDataShow: obj?.IsVendorDataShow, IsZeroDataShow: obj?.IsZeroDataShow, IncoTerm: obj.IncoTermDescriptionAndInfoTerm, PaymentTerm: obj.PaymentTermDescriptionAndPaymentTerm,
            Currency: obj.Currency, partId: obj.partId, FinancialYear: obj.FinancialYear, IsBreakupBoughtOutPart: obj?.IsBreakupBoughtOutPart?.toLowerCase() === "yes" ? true : !obj.IsBreakupBoughtOutPart ? '' : false,
            ScrapUnitOfMeasurement: obj.ScrapUnitOfMeasurement, ScrapRatePerScrapUOM: obj.ScrapRatePerScrapUOM, IsScrapUOMApply: obj.IsScrapUOMApply ? (obj.IsScrapUOMApply?.toLowerCase() === 'yes' ? true : false) : '',
            CalculatedFactor: obj.CalculatedFactor, UOMToScrapUOMRatio: obj.UOMToScrapUOMRatio, EntryType: obj.EntryType
        });
        // const queryParams = `applyPagination=${isPagination}&skip=${skip}&take=${take}&Token=${obj.ApprovalNumber !== undefined ? obj.ApprovalNumber : ""}&CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.Technology !== undefined ? obj.Technology : ""}&UOM=${obj.UOM !== undefined ? obj.UOM : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? obj.EffectiveDate : ""}&InitiatedBy=${obj.RequestedBy !== undefined ? obj.RequestedBy : ""}&CreatedBy=${obj.CreatedByName !== undefined ? obj.CreatedByName : ""}&LastApprovedBy=${obj.LastApprovedBy !== undefined ? obj.LastApprovedBy : ""}&Status=${obj.DisplayStatus !== undefined ? obj.DisplayStatus : ""}&BasicRate=${obj.BasicRate !== undefined ? obj.BasicRate : ""}&BasicRateConversion=${obj.BasicRateConversion !== undefined ? obj.BasicRateConversion : ""}&NetCostWithoutConditionCost=${obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : ""}&NetCostWithoutConditionCostConversion=${obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : ""}&NetConditionCostConversion=${obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : ""}&NetLandedCost=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&NetLandedCostConversion=${obj.NetLandedCostConversion !== undefined ? obj.NetLandedCostConversion : ""}&Plant=${obj.Plants !== undefined ? obj.Plants : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&RMName=${obj.RawMaterial !== undefined ? obj.RawMaterial : ""}&RMGrade=${obj.RMGrade !== undefined ? obj.RMGrade : ""}&RMSpecification=${obj.RMSpec !== undefined ? obj.RMSpec : ""}&RMCategory=${obj.Category !== undefined ? obj.Category : ""}&RMMaterialType=${obj.MaterialType !== undefined ? obj.MaterialType : ""}&RMScrapRate=${obj.ScrapRate !== undefined ? obj.ScrapRate : ""}&RMFreightCost=${obj.RMFreightCost !== undefined ? obj.RMFreightCost : ""}&RMShearingCost=${obj.RMShearingCost !== undefined ? obj.RMShearingCost : ""}&BOPPartNumber=${obj.BoughtOutPartNumber !== undefined ? obj.BoughtOutPartNumber : ""}&BOPPartName=${obj.BoughtOutPartName !== undefined ? obj.BoughtOutPartName : ""}&BOPCategory=${obj.BoughtOutPartCategory !== undefined ? obj.BoughtOutPartCategory : ""}&BOPSpecification=${obj.Specification !== undefined ? obj.Specification : ""}&OperationName=${obj.OperationName !== undefined ? obj.OperationName : ""}&OperationCode=${obj.OperationCode !== undefined ? obj.OperationCode : ""}&MachineNumber=${obj.MachineNumber !== undefined ? obj.MachineNumber : ""}&MachineType=${obj.MachineTypeName !== undefined ? obj.MachineTypeName : ""}&MachineTonnage=${obj.MachineTonnage !== undefined ? obj.MachineTonnage : ""}&MachineProcessName=${obj.ProcessName !== undefined ? obj.ProcessName : ""}&IsCustomerDataShow=${obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false}&IsVendorDataShow=${obj?.IsVendorDataShow !== undefined ? obj?.IsVendorDataShow : false}&IsZeroDataShow=${obj?.IsZeroDataShow !== undefined ? obj?.IsZeroDataShow : false}&IncoTerm=${obj.IncoTermDescriptionAndInfoTerm !== undefined ? obj.IncoTermDescriptionAndInfoTerm : ""}&PaymentTerm=${obj.PaymentTermDescriptionAndPaymentTerm !== undefined ? obj.PaymentTermDescriptionAndPaymentTerm : ""}&Currency=${obj.Currency ? obj.Currency : ''}&partId=${obj.partId ? obj.partId : ''}&FinancialYear=${obj.FinancialYear ? obj.FinancialYear : ''}&IsBreakupBoughtOutPart=${obj?.IsBreakupBoughtOutPart?.toLowerCase() === "yes" ? true : !obj.IsBreakupBoughtOutPart ? '' : false}&ScrapUnitOfMeasurement=${obj.ScrapUnitOfMeasurement !== undefined ? obj.ScrapUnitOfMeasurement : ''}&ScrapRatePerScrapUOM=${obj.ScrapRatePerScrapUOM !== undefined ? obj.ScrapRatePerScrapUOM : ''}&IsScrapUOMApply=${obj.IsScrapUOMApply ? (obj.IsScrapUOMApply?.toLowerCase() === 'yes' ? true : false) : ''}&CalculatedFactor=${obj.CalculatedFactor !== undefined ? obj.CalculatedFactor : ''}&ScrapRatePerScrapUOM=${obj.ScrapRatePerScrapUOM !== undefined ? obj.ScrapRatePerScrapUOM : ''}&UOMToScrapUOMRatio=${obj.UOMToScrapUOMRatio !== undefined ? obj.UOMToScrapUOMRatio : ''}&IsBreakupBoughtOutPart=${obj.IsBreakupBoughtOutPart !== undefined ? obj.IsBreakupBoughtOutPart : ""}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ""}&UnitOfMeasurementName=${obj.UnitOfMeasurementName !== undefined ? obj.UnitOfMeasurementName : ""}&BasicRatePerUOM=${obj.BasicRatePerUOM !== undefined ? obj.BasicRatePerUOM : ""}&NetConditionCost=${obj.NetConditionCost !== undefined ? obj.NetConditionCost : ""}`
        const request = axios.get(`${API.getRMApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}&masterId=${masterId}&OnboardingApprovalId=${onboardingApprovalId}&${queryParams}`, config());
        request.then((response) => {
            let data;

            switch (masterId) {
                case 0:
                    data = response?.status === 204 ? [] : response?.data?.Data?.VendorPlantClassificationLPSRatingUnblockingApprovalList;
                    break;
                case 1:
                    data = response?.status === 204 ? [] : response?.data?.Data?.RMApprovalList;
                    break;
                case 2:
                    data = response?.status === 204 ? [] : response?.data?.Data?.BopApprovalList;
                    break;
                case 3:
                    data = response?.status === 204 ? [] : response?.data?.Data?.OperationApprovalList;
                    break;
                case 4:
                    data = response?.status === 204 ? [] : response?.data?.Data?.MachineApprovalList;
                    break;
                case 5:
                    data = response?.status === 204 ? [] : response?.data?.Data?.BudgetingApprovalList;
                    break;
                default:
                    data = []; // or any default value as per requirement
            }
            dispatch({
                type: GET_RM_APPROVAL_LIST,
                payload: data
            })
            callback(response);

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
        const request = axios.get(`${API.getAllMasterApprovalDepartment}`, config())
        request
            .then((response) => {
                if (response?.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_DEPARTMENT,
                        payload: response?.data.SelectList,
                    })
                    callback(response)
                } else {
                    Toaster.error(MESSAGES.SOME_ERROR)
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
        const request = axios.post(`${API.getAllMasterApprovalUserByDepartment}`, data, config(),)

        request
            .then((response) => {

                if (response?.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT,
                        payload: response?.data.DataList,
                    })
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response?.data.Message) {
                        Toaster.error(response?.data.Message)
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
        const request = axios.post(API.masterSendToApprover, data, config())
        request.then((response) => {
            if (response?.data.Result) {
                callback(response)
            } else {
                dispatch({ type: API_FAILURE })
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message)
                }
            }
        }).catch((error) => {
            callback(error)
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


/**
 * @method approvalOrRejectRequestByMasterApprove
 * @description approving or rejecting the request by approve or reject
 */
export function approvalOrRejectRequestByMasterApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.approveOrRejectMasterByApprover, data, config())
        request
            .then((response) => {
                if (response?.data.Result) {
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response?.data.Message) {
                        Toaster.error(response?.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
                callback(error)
            })
    }
}


/**
 * @method getApprovalSummary
 * @description getting summary of approval by approval id
 */

export function getMasterApprovalSummary(tokenNo, approvalProcessId, masterId, OnboardingApprovalId, callback) {


    return (dispatch) => {
        if (Number(masterId) === RM_MASTER_ID) {
            dispatch({
                type: GET_RM_DOMESTIC_LIST,
                payload: [],
            })
            dispatch({
                type: GET_RM_IMPORT_LIST,
                payload: [],
            })
        }
        else if (Number(masterId) === BOP_MASTER_ID) {
            dispatch({
                type: GET_BOP_DOMESTIC_DATA_LIST,
                payload: [],
            })
            dispatch({
                type: GET_BOP_IMPORT_DATA_LIST,
                payload: [],
            })
        } else if (Number(masterId) === OPERATIONS_ID) {
            dispatch({
                type: GET_OPERATION_COMBINED_DATA_LIST,
                payload: [],
            })
        } else if (Number(masterId) === MACHINE_MASTER_ID) {

            dispatch({
                type: GET_MACHINE_DATALIST_SUCCESS,
                payload: [],
            })
        } else if (Number(masterId) === BUDGET_ID) {
            dispatch({
                type: GET_VOLUME_DATA_LIST,
                payload: [],
            })
        }
        else if (masterId === 0 && String(OnboardingApprovalId) === ONBOARDINGID) {
            dispatch({
                type: GET_ONBOARDING_SUMMARY_DATA_LIST,
                payload: [],
            })
        }
        const request = axios.get(
            `${API.getMasterApprovalSummaryByApprovalNo}/${tokenNo}/${approvalProcessId}/${loggedInUserId()}`, config())
        request
            .then((response) => {
                if (response?.data.Result) {

                    if (Number(masterId) === RM_MASTER_ID) {
                        if (response?.data?.Data?.ImpactedMasterDataList.RawMaterialListResponse[0]?.Currency === reactLocalStorage.getObject("baseCurrency")) {
                            dispatch({
                                type: GET_RM_DOMESTIC_LIST,
                                payload: response?.data?.Data?.ImpactedMasterDataList.RawMaterialListResponse,
                            })
                        } else {
                            dispatch({
                                type: GET_RM_IMPORT_LIST,
                                payload: response?.data?.Data?.ImpactedMasterDataList.RawMaterialListResponse,
                            })
                        }
                        callback(response)
                    }
                    else if (Number(masterId) === BOP_MASTER_ID) {
                        if (response?.data?.Data?.ImpactedMasterDataList.BOPListResponse[0]?.Currency === reactLocalStorage.getObject("baseCurrency")) {
                            dispatch({
                                type: GET_BOP_DOMESTIC_DATA_LIST,
                                payload: response?.data?.Data?.ImpactedMasterDataList.BOPListResponse,
                            })
                        } else {
                            dispatch({
                                type: GET_BOP_IMPORT_DATA_LIST,
                                payload: response?.data?.Data?.ImpactedMasterDataList.BOPListResponse,
                            })
                        }
                        callback(response)
                    } else if (Number(masterId) === OPERATIONS_ID) {
                        dispatch({
                            type: GET_OPERATION_COMBINED_DATA_LIST,
                            payload: response?.data?.Data?.ImpactedMasterDataList.OperationListResponse,
                        })
                        callback(response)
                    } else if (Number(masterId) === MACHINE_MASTER_ID) {
                        const value = response?.data?.Data?.ImpactedMasterDataList.MachineListResponse.filter((item) => item.EffectiveDateNew = item.EffectiveDate)

                        dispatch({
                            type: GET_MACHINE_DATALIST_SUCCESS,
                            payload: value,
                        })
                        callback(response)
                    } else if (Number(masterId) === BUDGET_ID) {
                        dispatch({
                            type: GET_VOLUME_DATA_LIST,
                            payload: response?.data?.Data?.ImpactedMasterDataList.BudgetingListResponse,
                        })
                        callback(response)
                    }
                    else if (masterId === 0 && String(OnboardingApprovalId) === ONBOARDINGID) {

                        dispatch({
                            type: GET_ONBOARDING_SUMMARY_DATA_LIST,
                            payload: response?.data?.Data?.ImpactedMasterDataList?.VendorPlantClassificationLPSRatingUnblockingApprovalList,
                        })
                        callback(response)
                    }
                }
                else {
                    Toaster.error(MESSAGES.SOME_ERROR)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}

export function clearGradeSelectList(data) {
    return (dispatch) => {
        dispatch({
            type: GET_GRADE_SELECTLIST_SUCCESS,
            payload: data
        })
    }
}

export function clearSpecificationSelectList(data) {
    return (dispatch) => {
        dispatch({
            type: GET_RM_SPECIFICATION_LIST_SUCCESS,
            payload: data
        })
    }
}

export function SetRawMaterialDetails(data, callback) {
    return (dispatch, getState) => {
        const previousState = getState().material.rawMaterailDetails;
        const mergedData = { ...previousState, ...data }; // Merge previous state with new data
        dispatch({
            type: RAW_MATERIAL_DETAILS,
            payload: mergedData
        })
        callback();
    }
}
export function SetCommodityIndexAverage(materialTypeId, indexExchangeId, unitOfMeasurementId, currencyId, exchangeRateSourceName, fromDate, toDate, callback) {
    return (dispatch, getState) => {
        const previousState = getState().material.commodityAverage;

        // Create the new data object using the function parameters
        const newData = {
            materialTypeId: String(materialTypeId),
            indexExchangeId: parseInt(indexExchangeId, 10), // Convert to integer
            unitOfMeasurementId,
            currencyId,
            exchangeRateSourceName,
            fromDate,
            toDate
        };

        // Merge previous state with new data
        const mergedData = { ...previousState, ...newData };

        dispatch({
            type: COMMODITY_INDEX_RATE_AVERAGE,
            payload: mergedData
        });

        if (callback) {
            callback();
        }
    }
}

export function setRawMaterialCostingData(data) {
    return (dispatch) => {
        dispatch({
            type: GET_RM_DETAILS,
            payload: data || {},
        });
    }
};
export function getViewRawMaterialDetails(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.getViewRawMaterialDetails, data, config())
        request
            .then((response) => {
                if (response?.data.Result) {
                    dispatch({
                        type: GET_RM_DETAILS,
                        payload: response.status === 200 ? response?.data.DataList : []
                    })
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response?.data.Message) {
                        Toaster.error(response?.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
                callback(error)
            })
    }
}