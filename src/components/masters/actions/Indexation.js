import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    config,
    GET_INDEX_SELECTLIST,
    GET_COMMODITY_IN_INDEX_SELECTLIST,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
    GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS,
    GET_INDEXCOMMODITY_DATALIST_SUCCESS,
    GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD,
    GET_COMMODITYININDEX_DATALIST_SUCCESS,
    GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD,
    GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS, GET_STANDARDIZEDCOMMODITY_FOR_DOWNLOAD,
    GET_INDEXDATA_LIST_SUCCESS, GET_INDEXDATA_FOR_DOWNLOAD, CREATE_MATERIAL_SUCCESS,
    GET_COMMODITY_STANDARD_FOR_DOWNLOAD, GET_COMMODITY_STANDARD_DATALIST_SUCCESS,
    GET_OTHER_COST_SELECTLIST, GET_OTHER_COST_APPLICABILITY_SELECTLIST,
    SET_COMMODITY_DETAILS, SET_OTHER_COST_DETAILS,
    GET_LAST_REVISION_RAW_MATERIAL_DETAILS,
    ZBCTypeId
}
    from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import { loggedInUserId, userDetails } from '../../../helper';
import axiosInstance from '../../../utils/axiosInstance';

/**
 * @method getIndexSelectList
 * @description get Commodity Index
 */
export function getIndexSelectList(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommoditySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INDEX_SELECTLIST,
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
 * @method getCommodityNameInIndexSelectList
 * @description get Commodity NameInIndex
 */
export function getCommodityNameInIndexSelectList(indexExchangeId, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityNameInIndexSelectList}?indexExchangeId=${indexExchangeId}&loggedInUserId=${loggedInUserId()}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITY_IN_INDEX_SELECTLIST,
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
 * @method getCommodityCustomNameSelectListByType
 * @description get Commodity NameInCIR
 */
export function getCommodityCustomNameSelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityCustomNameSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
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
 * @method createCommodityCustomName
 * @description create commodity Custom Name
 */
export function createCommodityCustomName(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createCommodityCustomName, data, config());
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
 * @method getCommodityStandardizationDataListAPI
 * @description get row Commodity Standardization list
 */
export function getCommodityStandardizationDataListAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCommodityStandardizationDataList}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS,
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
* @method createCommodityStandardization
* @description create commodity standardization
*/
export function createCommodityStandardization(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createCommodityStandardization, data, config());
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
 * @method getCommodityIndexDataListAPI
 * @description get row Commodity Index list
 */
export function getCommodityIndexDataListAPI(obj, isPagination, skip, take, isAddForm, callback) {
    return (dispatch) => {
        let queryParams
        if (isAddForm) {
            queryParams = encodeQueryParamsAndLog({
                loggedInUserId: loggedInUserId(),
                indexExchangeId: obj
            });
        } else {
            queryParams = encodeQueryParamsAndLog({
                loggedInUserId: loggedInUserId(),
                IndexExchangeId: "", indexExchangeName: obj.IndexExchangeName, description: "", applyPagination: isPagination, skip: skip, take: take
            });
        }
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCommodityIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    // if (isPagination) {
                    dispatch({
                        type: GET_INDEXCOMMODITY_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    // } else {
                    //     dispatch({
                    //         type: GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD,
                    //         payload: response.status === 204 ? [] : response.data.DataList
                    //     })
                    // }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getCommodityInIndexDataListAPI
 * @description get row Commodity In Index list
 */
export function getCommodityInIndexDataListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            loggedInUserId: loggedInUserId(),
            indexExchangeCommodityLinkingId: "", commodityId: "", commodityName: obj.CommodityName, commodityShortName: "", indexExchangeName: obj.IndexExchangeName, description: "", applyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCommodityInIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    // if (isPagination) {
                    dispatch({
                        type: GET_COMMODITYININDEX_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    // } else {
                    //     dispatch({
                    //         type: GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD,
                    //         payload: response.status === 204 ? [] : response.data.DataList
                    //     })
                    // }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getStandardizedCommodityListAPI
 * @description get row Standardized Commodity list
 */
export function getStandardizedCommodityListAPI(obj, isPagination, skip, take, isEditMode, callback) {
    return (dispatch) => {
        let queryParams
        if (isEditMode) {
            queryParams = encodeQueryParamsAndLog({
                loggedInUserId: loggedInUserId(),
                commodityStandardizationId: obj
            });
        } else {
            queryParams = encodeQueryParamsAndLog({
                loggedInUserId: loggedInUserId(),
                commodityStandardizationId: "", commodityStandardName: obj.CommodityStandardName, commodityName: obj.CommodityName, indexExchangeName: obj.IndexExchangeName, remark: '', applyPagination: isPagination, skip: skip, take: take
            });
        }
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getStandardizedCommodityDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    // if (isPagination) {
                    dispatch({
                        type: GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    // } else {
                    //     dispatch({
                    //         type: GET_STANDARDIZEDCOMMODITY_FOR_DOWNLOAD,
                    //         payload: response.status === 204 ? [] : response.data.DataList
                    //     })
                    // }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getIndexDataListAPI
 * @description get row Index Data list
 */
export function getIndexDataListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            loggedInUserId: loggedInUserId(),
            commodityIndexRateDetailId: obj.CommodityIndexRateDetailId || "",
            ratePerIndexUOM: obj.RatePerIndexUOM || "",
            ratePerConvertedUOM: obj.RatePerConvertedUOM || "",
            currencyCharge: obj.CurrencyCharge || "",
            exchangeRate: obj.ExchangeRate || "",
            rateConversionPerConvertedUOM: obj.RateConversionPerConvertedUOM || "",
            rateConversionPerIndexUOM: obj.RateConversionPerIndexUOM || "",
            exchangeRateSourceName: obj.ExchangeRateSourceName || "",
            effectiveDate: obj.EffectiveDate || "",
            Remark: obj.Remark || "",
            commodityName: obj.CommodityName || "",
            indexExchangeName: obj.IndexExchangeName || "",
            uom: obj.UOM || "",
            fromCurrency: obj.FromCurrency || "",
            toCurrency: obj.ToCurrency || "",
            commodityStandardName: obj.CommodityStandardName || "",
            applyPagination: isPagination,
            skip: skip,
            take: take,
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    // if (isPagination) {
                    dispatch({
                        type: GET_INDEXDATA_LIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    // } else {

                    //     dispatch({

                    //         type: GET_INDEXDATA_FOR_DOWNLOAD,
                    //         payload: response.status === 204 ? [] : response.data.DataList
                    //     })
                    // }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method createIndexData
 * @description create Index Data
 */
export function createIndexData(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createIndexData, data, config());
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
 * @method deleteIndexData
 * @description delete Index Data API
 */
export function deleteIndexData(indexExchangeId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `indexExchangeId=${indexExchangeId}&loggedInUserId=${userDetails().LoggedInUserId}`
        axios.delete(`${API.deleteIndexData}?${queryParams}`, config())
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
 * @method updateCommodityStandardization
 * @description update commodity standardization
 */
export function updateCommodityStandardization(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(`${API.updateCommodityStandardization}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method deleteCommodityStandardization
 * @description delete commodity standardization API
 */
export function deleteCommodityStandardization(commodityStandardizationId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `commodityStandardizationId=${commodityStandardizationId}&loggedInUserId=${userDetails().LoggedInUserId}`
        axios.delete(`${API.deleteCommodityStandardization}?${queryParams}`, config())
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
 * @method updateIndexData
 * @description update Index Data
 */
export function updateIndexData(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(`${API.updateIndexData}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}
/**
 * @method bulkUploadIndexData
 * @description upload bulk Index Data
 */
export function bulkUploadIndexData(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadIndexData, data, config());
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
* @method bulkUploadStandardizedCommodity
* @description upload bulk Standardization Commodity
*/
export function bulkUploadStandardizedCommodity(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadStandardizedCommodity, data, config());
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
 * @method getAssociatedMaterialDetails
 * @description get Associated Material Details API
 */
export function getAssociatedMaterialDetails(materialId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAssociatedMaterialDetails}?materialId=${materialId}`, config());
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
 * @method bulkUploadIndex
 * @description upload bulk Index
 */
export function bulkUploadIndex(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadIndex, data, config());
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
 * @method bulkUploadCommodityInIndex
 * @description upload bulk Commodity In Index
 */
export function bulkUploadCommodityInIndex(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadCommodityInIndex, data, config());
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
 * @method deleteIndexCommodityLinking
 * @description delete Index Data API
 */
export function deleteIndexCommodityLinking(indexExchangeId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `indexExchangeCommodityLinkingId=${indexExchangeId}&loggedInUserId=${userDetails().LoggedInUserId}`
        axios.delete(`${API.deleteIndexCommodityLinking}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createIndex
 * @description create Index 
 */
export function createIndex(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createIndex, data, config());
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
 * @method updateIndex
 * @description update Index 
 */
export function updateIndex(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(`${API.updateIndex}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getCommodityStandardList
 * @description get row Commodity Index list
 */
export function getCommodityStandardList(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            loggedInUserId: loggedInUserId(),
            commodityStandardId: "", commodityStandardName: obj.CommodityStandardName, applyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCommodityStandardList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    // if (isPagination) {
                    dispatch({
                        type: GET_COMMODITY_STANDARD_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    // } else {
                    //     dispatch({
                    //         type: GET_COMMODITY_STANDARD_FOR_DOWNLOAD,
                    //         payload: response.status === 204 ? [] : response.data.DataList
                    //     })
                    // }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method bulkUploadCommodityStandard
 * @description upload bulk Index Data
 */
export function bulkUploadCommodityStandard(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadCommodityStandard, data, config());
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
 * @method deleteCommodityStandard
 * @description delete Commodity Standard Data API
 */
export function deleteCommodityStandard(commodityStandardId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `commodityStandardId=${commodityStandardId}&loggedInUserId=${userDetails().LoggedInUserId}`
        axios.delete(`${API.deleteCommodityStandard}?${queryParams}`, config())
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
 * @method deleteIndexDetailData
 * @description delete Index Detail Data API
 */
export function deleteIndexDetailData(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(API.deleteIndexDetailData, data, config())
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
 * @method getOtherCostApplicabilitySelectList
 * @description get Other Cost Applicability
 */
export function getOtherCostApplicabilitySelectList(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherCostApplicabilitySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_COST_APPLICABILITY_SELECTLIST,
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
 * @method getOtherCostSelectList
 * @description get other cost Select
 */
export function getOtherCostSelectList(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherCostSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_COST_SELECTLIST,
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

export function setCommodityDetails(data) {
    return (dispatch) => {
        dispatch({
            type: SET_COMMODITY_DETAILS,
            payload: data
        })
    }
}
export function setOtherCostDetails(data) {
    return (dispatch) => {
        dispatch({
            type: SET_OTHER_COST_DETAILS,
            payload: data
        })
    }
}

/**
 * @method getLastRevisionRawMaterialDetails
 * @description get Last Revision Raw Material
 */
export function getLastRevisionRawMaterialDetails(data, callback) {
    const requestData = { LoggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        const request = axiosInstance.post(API.getLastRevisionRawMaterialDetails, requestData, config());
        request.then((response) => {
            if (response) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
/**
 * @method getRawMaterialDataBySourceVendor
 * @description get Raw Material Data By Source Vendor
 */
export function getRawMaterialDataBySourceVendor(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialDataBySourceVendor}?loggedInUserId=${loggedInUserId()}&costingHeadId=${ZBCTypeId}&technologyId=${data.technologyId}&rawMaterialSpecificationId=${data.rawMaterialSpecificationId}&isIndexationDetails=${data.isIndexationDetails}&sourceVendorId=${data.sourceVendorId}`, config());
        request.then((response) => {
            if (response) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}

export function calculateAndSaveRMIndexationSimulation(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.calculateAndSaveRMIndexationSimulation, data, config());
        request.then((response) => {
            if (response) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
