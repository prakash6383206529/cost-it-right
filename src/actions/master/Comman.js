import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_UOM_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_PART_SUCCESS,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS,
    GET_ROW_MATERIAL_SUCCESS,
    GET_GRADE_SUCCESS,
    GET_SUPPLIER_SUCCESS,
    GET_SUPPLIER_CITY_SUCCESS,
    GET_TECHNOLOGY_SUCCESS,
    GET_CATEGORY_TYPE_SUCCESS,
    GET_CATEGORY_SUCCESS,
    GET_FUEL_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_SUCCESS,
    GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
    GET_MHR_COMBO_DATA_SUCCESS,
    DATA_FAILURE,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_LABOUR_TYPE_SUCCESS
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

export function fetchMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getAllMasterUOMAPI, headers);
        const API2 = axios.get(API.getMaterialType, headers);
        const API3 = axios.get(API.getPart, headers);
        const API4 = axios.get(API.getPlant, headers);
        const API5 = axios.get(API.getSupplier, headers);
        const API6 = axios.get(API.getSupplierCity, headers);
        const API7 = axios.get(API.getTechnology, headers);
        const API8 = axios.get(API.getCategoryType, headers)
        Promise.all([API1, API2, API3, API4, API5, API6, API7, API8])
            .then((response) => {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });

                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response[1].data.SelectList,
                });

                dispatch({
                    type: GET_PART_SUCCESS,
                    payload: response[2].data.SelectList,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response[3].data.SelectList,
                });
                dispatch({
                    type: GET_SUPPLIER_SUCCESS,
                    payload: response[4].data.SelectList,
                });
                dispatch({
                    type: GET_SUPPLIER_CITY_SUCCESS,
                    payload: response[5].data.SelectList,
                });
                dispatch({
                    type: GET_TECHNOLOGY_SUCCESS,
                    payload: response[6].data.SelectList,
                });
                dispatch({
                    type: GET_CATEGORY_TYPE_SUCCESS,
                    payload: response[7].data.SelectList,
                });
            }).catch((error) => {
                dispatch({
                    type: FETCH_MATER_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}
/**
 * @method fetchCountryDataAPI
 * @description Used to fetch country list
 */
export function fetchCountryDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCountry}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COUNTRY_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchStateDataAPI
 * @description Used to fetch state list
 */
export function fetchStateDataAPI(countryId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (countryId == 0) {
            dispatch({
                type: GET_STATE_SUCCESS,
                payload: []
            });
            dispatch({
                type: GET_CITY_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getState}/${countryId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_STATE_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchCityDataAPI
 * @description Used to fetch city list
 */
export function fetchCityDataAPI(stateId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (stateId == 0) {
            dispatch({
                type: GET_CITY_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getCity}/${stateId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_CITY_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchPlantDataAPI
 * @description Used to fetch plant list
 */
export function fetchPlantDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlant}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRowMaterialAPI
 * @description Used to fetch row material list
 */
export function fetchRowMaterialAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRowMaterial}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROW_MATERIAL_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRMGradeAPI
 * @description Used to fetch row material grade list
 */
export function fetchRMGradeAPI(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (Id == 0) {
            dispatch({
                type: GET_GRADE_SUCCESS,
                payload: []
            });
        } else {
            const request = axios.get(`${API.getRowGrade}/${Id}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_GRADE_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function fetchRMCategoryAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRowMaterial}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROW_MATERIAL_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function fetchCategoryAPI(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (Id == 0) {
            dispatch({
                type: GET_CATEGORY_SUCCESS,
                payload: []
            });
        }
        else {
            const request = axios.get(`${API.getCategory}/${Id}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_CATEGORY_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }

    };
}

//COMBO API"S

/**
 * @method fetchFuelComboAPI
 * @description Used to fuel form 
 */
export function fetchFuelComboAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FUEL_SUCCESS,
                    payload: response.data.DynamicData.Fuels,
                });
                dispatch({
                    type: GET_STATE_SUCCESS,
                    payload: response.data.DynamicData.States,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

export function getOtherOperationData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherOperationsFormDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_OPERATION_FORMDATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getCEDOtherOperationComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCEDotherOperationsComboDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchPartComboAPI
 * @description Used to part form 
 */
export function fetchPartComboAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPartComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DynamicData.UnitOfMeasurements,
                });
                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response.data.DynamicData.MaterialTypes,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.DynamicData.Plants,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchPartComboAPI
 * @description Used to BOP form 
 */
export function fetchBOPComboAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOPComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TECHNOLOGY_SUCCESS,
                    payload: response.data.DynamicData.Technologies,
                });
                dispatch({
                    type: GET_CATEGORY_TYPE_SUCCESS,
                    payload: response.data.DynamicData.CategoryTypes,
                });
                dispatch({
                    type: GET_CATEGORY_SUCCESS,
                    payload: response.data.DynamicData.Categories,
                });
                dispatch({
                    type: GET_PART_SUCCESS,
                    payload: response.data.DynamicData.Parts,
                });
                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response.data.DynamicData.MaterialTypes,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.DynamicData.Plants,
                });
                dispatch({
                    type: GET_CITY_SUCCESS,
                    payload: response.data.DynamicData.Cities,
                });
                dispatch({
                    type: GET_SUPPLIER_SUCCESS,
                    payload: response.data.DynamicData.Suppliers,
                });
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DynamicData.UnitOfMeasurements,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchBOMComboAPI
 * @description Used to BOM form 
 */
export function fetchBOMComboAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOMComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PART_SUCCESS,
                    payload: response.data.DynamicData.Parts,
                });
                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response.data.DynamicData.MaterialTypes,
                });
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DynamicData.UnitOfMeasurements,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchMaterialComboAPI
 * @description Used to BOM form 
 */
export function fetchMaterialComboAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TECHNOLOGY_SUCCESS,
                    payload: response.data.DynamicData.Technologies,
                });
                dispatch({
                    type: GET_ROW_MATERIAL_SUCCESS,
                    payload: response.data.DynamicData.RawMaterials,
                });
                dispatch({
                    type: GET_GRADE_SUCCESS,
                    payload: response.data.DynamicData.RawMaterialGrades,
                });
                dispatch({
                    type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                    payload: response.data.DynamicData.RawMaterialSpecifications,
                });
                dispatch({
                    type: GET_CATEGORY_SUCCESS,
                    payload: response.data.DynamicData.RawMaterialCategories,
                });
                dispatch({
                    type: GET_CITY_SUCCESS,
                    payload: response.data.DynamicData.Cities,
                });
                dispatch({
                    type: GET_SUPPLIER_SUCCESS,
                    payload: response.data.DynamicData.Suppliers,
                });
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DynamicData.UnitOfMeasurements,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.DynamicData.Plants,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchGradeDataAPI
 * @description Used to fetch state list
 */
export function fetchGradeDataAPI(rowMaterialId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (rowMaterialId == 0) {
            dispatch({
                type: GET_GRADE_SUCCESS,
                payload: []
            });
            dispatch({
                type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getRowGrade}/${rowMaterialId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_GRADE_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchSpecificationDataAPI
 * @description Used to fetch city list
 */
export function fetchSpecificationDataAPI(rmGradeId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (rmGradeId == 0) {
            dispatch({
                type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getRowMaterialSpecification}/${rmGradeId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchFreightComboAPI
 * @description Used in freight form 
 */
export function fetchFreightComboAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getFreightComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CITY_SUCCESS,
                    payload: response.data.DynamicData.Cities,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.DynamicData.Plants,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchLabourComboAPI
 * @description Used in labour form 
 */
export function fetchLabourComboAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getLabourComboAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TECHNOLOGY_SUCCESS,
                    payload: response.data.DynamicData.Technologies,
                });
                dispatch({
                    type: GET_LABOUR_TYPE_SUCCESS,
                    payload: response.data.DynamicData.LabourTypes,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.DynamicData.Plants,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/*
* @method fetchRMCategoryAPI
* @description Used to fetch row material category list
*/
export function getMHRMasterComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMHRComboDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MHR_COMBO_DATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: DATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchCityDataAPI
 * @description Used to fetch city list
 */
export function fetchSupplierCityDataAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSupplierCity}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CITY_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}