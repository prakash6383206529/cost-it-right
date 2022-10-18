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
    GET_OPERATION_COMBINED_DATA_LIST,
    OPERATIONS_ID,
    BOP_MASTER_ID,
    RM_MASTER_ID,
    MACHINE_MASTER_ID,
    config,
    GET_RM_DOMESTIC_LIST,
    GET_ALL_RM_DOMESTIC_LIST,
    GET_RM_IMPORT_LIST,
    GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT,
    GET_MANAGE_SPECIFICATION,
    GET_UNASSOCIATED_RM_NAME_SELECTLIST,
    SET_FILTERED_RM_DATA,
    GET_RM_APPROVAL_LIST,
    GET_ALL_MASTER_APPROVAL_DEPARTMENT,
    EMPTY_GUID
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { loggedInUserId, userDetails } from '../../../helper';
import { MESSAGES } from '../../../config/message';
import { rmQueryParms } from '../masterUtil';

/**
 * @method createMaterialAPI
 * @description create material master
 */
export function createMaterialAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialAPI, data, config());
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
                    Toaster.error(response.data.Message);
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
export function deleteRawMaterialAPI(RawMaterialId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRawMaterialAPI}/${RawMaterialId}`, config())
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
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
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
export function deleteCategoryAPI(CategoryId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryAPI}/${CategoryId}`, config())
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
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
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
export function deleteRMGradeAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMGradeAPI}/${ID}`, config())
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
            if (response.data.Result) {
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
            if (response.data.Result) {
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
export function getRMSpecificationDataAPI(SpecificationId, callback) {
    return (dispatch) => {
        if (SpecificationId !== '') {
            axios.get(`${API.getRMSpecificationDataAPI}/${SpecificationId}`, config())
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
        const request = axios.get(`${API.getRMSpecificationDataList}?${queryParams}`, config());
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
export function deleteRMSpecificationAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMSpecificationAPI}/${ID}`, config())
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
            const request = axios.get(`${API.getRMGradeSelectListByRawMaterial}/${Id}`, config());
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
        const request = axios.get(`${API.getRMTypeSelectListAPI}`, config());
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
        const request = axios.get(`${API.getGradeSelectList}`, config());
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
//         const request = axios.get(`${API.getGradeByRMTypeSelectListAPI}/${ID}`, config());
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


// Action Creator for material master

/**
 * @method createMaterialTypeAPI
 * @description create material master
 */
export function createMaterialTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialType, data, config());
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
                    Toaster.error(response.data.Message);
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
export function getMaterialTypeDataAPI(MaterialTypeId, callback) {
    return (dispatch) => {
        if (MaterialTypeId !== '') {
            axios.get(`${API.getMaterialTypeDataAPI}/${MaterialTypeId}`, config())
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
        axios.delete(`${API.deleteMaterialTypeAPI}/${MaterialTypeId}`, config())
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
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
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
        const request = axios.post(API.createRMDomestic, data, config());
        request.then((response) => {
            if (response.data.Result) {
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
            axios.get(`${API.getRMDomesticDataById}/${data.Id}/${data.costingTypeId}`, config())
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
        axios.put(`${API.updateRMDomesticAPI}`, requestData, config())
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
        const request = axios.get(`${API.getRMMaterialAPI}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response.status === 204 ? [] : response.data.DataList,
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
export function getRawMaterialNameChild(technologyId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRawMaterialNameChild}/${technologyId === '' ? null : technologyId}`, config());
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
        const request = axios.get(`${API.getUnassociatedRawMaterial}`, config());
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
        const request = axios.get(`${API.getGradeListByRawMaterialNameChild}/${ID}`, config());
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
        const request = axios.get(`${API.getVendorListByVendorType}/${isVendor}`, config());
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
export function getVendorWithVendorCodeSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST,
                payload: response.data.SelectList,
            });
            callback(response)
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
export function getRMDomesticDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        const queryParams = `technology_id=${data.technologyId}&net_landed_min_range=${data.net_landed_min_range}&net_landed_max_range=${data.net_landed_max_range}&NetCost=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&DepartmentCode=`
        const queryParamsSecond = rmQueryParms(isPagination, skip, take, obj)
        const request = axios.get(`${API.getRMDomesticDataList}?${queryParams}&${queryParamsSecond}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                if (isPagination === true) {
                    dispatch({
                        type: GET_RM_DOMESTIC_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                } else {
                    dispatch({
                        type: GET_ALL_RM_DOMESTIC_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                }
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
 * @method fileUploadRMDomestic
 * @description File Upload Raw Material Domestic
 */
export function fileUploadRMDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadRMDomestic, data, config());
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
        const request = axios.post(API.createRMImport, data, config());
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
 * @method updateRMImportAPI
 * @description update Raw Material Import
 */
export function updateRMImportAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMImportAPI}`, requestData, config())
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
 * @method getRMImportDataById
 * @description get Raw Material Import Details By Id.
 */
export function getRMImportDataById(data, isValid, callback) {
    return (dispatch) => {
        if (isValid) {
            axios.get(`${API.getRMImportDataById}/${data.Id}/${data.costingTypeId}`, config())
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
export function getRMImportDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        const queryParams = `Currency=${obj.Currency !== undefined ? obj.Currency : ""}&NetCostCurrency=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&NetCost=${obj.NetLandedCostConversion !== undefined ? obj.NetLandedCostConversion : ""}&technology_id=${data.technologyId}&net_landed_min_range=${data.net_landed_min_range}&net_landed_max_range=${data.net_landed_max_range}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&DepartmentCode=`
        const queryParamsSecond = rmQueryParms(isPagination, skip, take, obj)
        const request = axios.get(`${API.getRMImportDataList}?${queryParams}&${queryParamsSecond} `, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                if (isPagination === true) {
                    dispatch({
                        type: GET_RM_IMPORT_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                } else {
                    dispatch({
                        type: GET_ALL_RM_DOMESTIC_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                }
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
        const request = axios.put(API.fileUpdateRMDomestic, data, config());
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
        axios.delete(`${API.fileDeleteRMDomestic} /${data.Id}/${data.DeletedBy} `, config())
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
        const request = axios.post(API.bulkUploadRMDomesticZBC, data, config());
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
 * @method bulkUploadRMDomesticVBC
 * @description upload bulk RM Domestic VBC
 */
export function bulkUploadRMDomesticVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMDomesticVBC, data, config());
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
 * @method bulkUploadRMDomesticCBC
 * @description upload bulk RM Domestic CBC
 */
export function bulkUploadRMDomesticCBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMDomesticCBC, data, config());
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
 * @method bulkfileUploadRM
 * @description upload bulk RM Domestic
 */
export function bulkfileUploadRM(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkfileUploadRM, data, config());
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
        const request = axios.post(API.bulkUploadRMImportZBC, data, config());
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
 * @method bulkUploadRMImportCBC
 * @description upload bulk RM Import CBC
 */
export function bulkUploadRMImportCBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMImportCBC, data, config());
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
 * @method bulkUploadRMImportVBC
 * @description upload bulk RM Domestic VBC
 */
export function bulkUploadRMImportVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMImportVBC, data, config());
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
 * @method bulkUploadRMSpecification
 * @description upload bulk RM Specification
 */
export function bulkUploadRMSpecification(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadRMSpecification, data, config());
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
 * @method getRawMaterialChildById
 * @description Used to Get Net Landed max range for filter
 */
export function getRawMaterialChildById(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialChildById}/${ID}`, config());
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
        const request = axios.put(API.updateRawMaterialChildName, data, config());
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
        const request = axios.get(`${API.getRawMaterialFilterSelectList}`, config());
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
        const request = axios.get(`${API.getGradeFilterByRawMaterialSelectList}/${ID}`, config());
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
        const request = axios.get(`${API.getVendorFilterByRawMaterialSelectList}/${ID}`, config());
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
        const request = axios.get(`${API.getRawMaterialFilterByGradeSelectList}/${ID}`, config());
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
        const request = axios.get(`${API.getVendorFilterByGradeSelectList}/${ID}`, config());
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
        const request = axios.get(`${API.getRawMaterialFilterByVendorSelectList}/${ID}`, config());
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
        const request = axios.get(`${API.getGradeFilterByVendorSelectList}/${ID}`, config());
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
        const request = axios.get(API.getMaterialTypeSelectList, config());
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
export function checkAndGetRawMaterialCode(obj, callback) {
    return (dispatch) => {
        let queryParams = `materialNameId=${obj?.materialNameId ? obj.materialNameId : EMPTY_GUID}&materialGradeId=${obj.materialGradeId ? obj.materialGradeId : EMPTY_GUID}&materialSpec=${obj.materialSpec}&materialCode=${obj.materialCode}`
        const request = axios.post(`${API.checkAndGetRawMaterialCode}?${queryParams}`, '', config());
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
export function getRMApprovalList(masterId, skip, take, isPagination, obj, callback) {

    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const queryParams = `applyPagination=${isPagination}&skip=${skip}&take=${take}&Token=${obj.ApprovalNumber !== undefined ? obj.ApprovalNumber : ""}&CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.TechnologyName !== undefined ? obj.TechnologyName : ""}&UOM=${obj.UOM !== undefined ? obj.UOM : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? obj.EffectiveDate : ""}&InitiatedBy=${obj.RequestedBy !== undefined ? obj.RequestedBy : ""}&CreatedBy=${obj.CreatedByName !== undefined ? obj.CreatedByName : ""}&LastApprovedBy=${obj.LastApprovedBy !== undefined ? obj.LastApprovedBy : ""}&Status=${obj.DisplayStatus !== undefined ? obj.DisplayStatus : ""}&BasicRate=${obj.BasicRate !== undefined ? obj.BasicRate : ""}&NetLandedCost=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&Plant=${obj.Plants !== undefined ? obj.Plants : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&RMName=${obj.RawMaterial !== undefined ? obj.RawMaterial : ""}&RMGrade=${obj.RMGrade !== undefined ? obj.RMGrade : ""}&RMSpecification=${obj.RMSpec !== undefined ? obj.RMSpec : ""}&RMCategory=${obj.Category !== undefined ? obj.Category : ""}&RMMaterialType=${obj.MaterialType !== undefined ? obj.MaterialType : ""}&RMScrapRate=${obj.ScrapRate !== undefined ? obj.ScrapRate : ""}&RMFreightCost=${obj.RMFreightCost !== undefined ? obj.RMFreightCost : ""}&RMShearingCost=${obj.RMShearingCost !== undefined ? obj.RMShearingCost : ""}&BOPPartNumber=${obj.BoughtOutPartNumber !== undefined ? obj.BoughtOutPartNumber : ""}&BOPPartName=${obj.BoughtOutPartName !== undefined ? obj.BoughtOutPartName : ""}&BOPCategory=${obj.BoughtOutPartCategory !== undefined ? obj.BoughtOutPartCategory : ""}&BOPSpecification=${obj.Specification !== undefined ? obj.Specification : ""}&OperationName=${obj.OperationName !== undefined ? obj.OperationName : ""}&OperationCode=${obj.OperationCode !== undefined ? obj.OperationCode : ""}&MachineNumber=${obj.MachineNumber !== undefined ? obj.MachineNumber : ""}&MachineType=${obj.MachineTypeName !== undefined ? obj.MachineTypeName : ""}&MachineTonnage=${obj.MachineTonnage !== undefined ? obj.MachineTonnage : ""}&MachineProcessName=${obj.ProcessName !== undefined ? obj.ProcessName : ""}`
        const request = axios.get(`${API.getRMApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}&masterId=${masterId}&${queryParams}`, config());
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
        const request = axios.get(`${API.getAllMasterApprovalDepartment}`, config())
        request
            .then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_DEPARTMENT,
                        payload: response.data.SelectList,
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

                if (response.data.Result) {
                    dispatch({
                        type: GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT,
                        payload: response.data.DataList,
                    })
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        Toaster.error(response.data.Message)
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
            if (response.data.Result) {
                callback(response)
            } else {
                dispatch({ type: API_FAILURE })
                if (response.data.Message) {
                    Toaster.error(response.data.Message)
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
                if (response.data.Result) {
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        Toaster.error(response.data.Message)
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

export function getMasterApprovalSummary(tokenNo, approvalProcessId, masterId, callback) {


    return (dispatch) => {
        const request = axios.get(
            `${API.getMasterApprovalSummaryByApprovalNo}/${tokenNo}/${approvalProcessId}/${loggedInUserId()}`, config())
        request
            .then((response) => {
                if (response.data.Result) {

                    if (Number(masterId) === RM_MASTER_ID) {
                        dispatch({
                            type: GET_RM_DOMESTIC_LIST,
                            payload: response.data.Data.ImpactedMasterDataList,
                        })
                        callback(response)
                    }
                    else if (Number(masterId) === BOP_MASTER_ID) {
                        dispatch({
                            type: GET_BOP_DOMESTIC_DATA_LIST,
                            payload: response.data.Data.ImpactedMasterDataListBOP,
                        })
                        callback(response)
                    } else if (Number(masterId) === OPERATIONS_ID) {
                        dispatch({
                            type: GET_OPERATION_COMBINED_DATA_LIST,
                            payload: response.data.Data.ImpactedMasterDataListOperation,
                        })
                        callback(response)
                    } else if (Number(masterId) === MACHINE_MASTER_ID) {
                        const value = response.data.Data.ImpactedMasterDataListMachine.filter((item) => item.EffectiveDateNew = item.EffectiveDate)

                        dispatch({
                            type: GET_MACHINE_DATALIST_SUCCESS,
                            payload: value,
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

/**
 * @method masterFinalLevelUser
 * @description IS USER IS FINAL LEVEL USER OR NOT FOR MASTER
 */
export function masterFinalLevelUser(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.masterFinalLeveluser, data, config())
        request
            .then((response) => {
                if (response.data.Result) {
                    callback(response)
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        Toaster.error(response.data.Message)
                    }
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}
