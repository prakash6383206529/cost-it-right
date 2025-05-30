import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';
import {
    API,
    API_FAILURE,
    GET_REPORT_LIST, config, EMPTY_GUID,
    GET_ALL_REPORT_LIST,
    GET_BENCHMARK_RM_LIST,
    GET_BENCHMARK_MASTER_LIST,
    GET_COST_RATIO_REPORT,
    GET_REPORT_FORM_GRID_DATA,
    GET_PRODUCT_LIST,
    GET_PRODUCT_PART_DATA_LIST,
    GET_STAGE_OF_PART_DETAILS,
    GET_NFR_INSIGHT_DETAILS,
    GET_NFR_INSIGHT_STATUS_DETAILS,
    GET_COST_DEVIATION_REPORT,
    GET_BUSINESS_VALUE_REPORT_HEADS,
    GET_BUSINESS_VALUE_REPORT_DATA
} from '../../../config/constants';
import { apiErrors, loggedInUserId, userDetails } from '../../../helper';

import { userDepartmetList } from '../../../helper';
import axiosInstance from '../../../utils/axiosInstance';

// const config() = config

// export function getReportListing(data, callback) {
//     return (dispatch) => {
//         dispatch({ type: API_REQUEST });
//         const queryParameter = `logged_in_user_id=${data.loggedUser}&logged_in_user_level_id=${data.logged_in_user_level_id}&part_number=${data.partNo}&created_by=${data.createdBy}&requested_by=${data.requestedBy}&status=${data.status}&type_of_costing=''`
//         const request = axios.get(`${API.getReportListing}/${queryParameter}`, config())
//         
//         request.then((response) => {
//             alert(response.data);
//             
//             if (response.data.Result || response.status === 204) {
//                 //
//                 dispatch({
//                     type: GET_REPORT_LIST,
//                     payload: response.status === 204 ? [] : response.data.DataList
//                 })
//                 callback(response);
//             }
//         }).catch((error) => {
//             dispatch({ type: API_FAILURE, });
//             apiErrors(error);
//         });
//       }
// }

/**
 * @method getRMImportDataList
 * @description Used to get RM Import Datalist
 */
export function getReportListing(index, take, isPagination, data, callback) {

    return (dispatch) => {
        if (isPagination === true) {
            const queryParams = `costingNumber=${data.costingNumber}&toDate=${data.toDate}&fromDate=${data.fromDate}&statusId=${data.statusId}&technologyId=${data.technologyId}&plantCode=${data.plantCode}&vendorCode=${data.vendorCode}&userId=${EMPTY_GUID}&isSortByOrderAsc=${data.isSortByOrderAsc}`

            const queryParamsSecond = `&isApplyPagination=${true}&skip=${index}&take=${take}`

            const request = axios.get(`${API.getReportListing}?${queryParams}${queryParamsSecond}`, config());
            request.then((response) => {
                if (response.data.Result || response.status === 204) {
                    dispatch({
                        type: GET_REPORT_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                    callback(response);
                }

            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                //apiErrors(error);
            });
        } else {
            dispatch({

                type: GET_REPORT_LIST,

                payload: []

            })

            callback([]);
        }
    };


}

/**
 * @method getCostingReport
 * @description Used to get Costing Report
 */
export function getCostingReport(skip, take, isPagination, obj, isLastWeek, isCallApi, callback) {

    return (dispatch) => {
        if (isCallApi === true) {

            const queryParams = `loggedInUserId=${loggedInUserId()}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CostingHead=${obj.CostingHead ? obj.CostingHead : ""}&NCCPartQuantity=${obj.NCCPartQuantity ? obj.NCCPartQuantity : ""}&IsRegularized=${obj.IsRegularized ? obj.IsRegularized : ""}&Plant=${obj.Plant ? obj.Plant : ""}&Vendor=${obj.Vendor ? obj.Vendor : ""}`
            const queryParamsSecond = `CostingNumber=${obj.CostingNumber ?? obj.CostingNumber}&Technology=${obj.TechnologyName ?? obj.TechnologyName}&AmorizationQuantity=${obj.AmorizationQuantity ?? obj.AmorizationQuantity}&AnyOtherCost=${obj.AnyOtherCost ?? obj.AnyOtherCost}&CostingVersion=${obj.CostingVersion ?? obj.CostingVersion}&Status=${obj.Status ?? obj.DisplayStatus}&EffectiveDate=${obj.EffectiveDate ?? obj.EffectiveDate}&Currency=${obj.Currency ?? obj.Currency}&DepartmentCode=${obj.DepartmentCode ?? obj.DepartmentCode}&DepartmentName=${obj.DepartmentName ?? obj.DepartmentName}&DiscountCost=${obj.DiscountCost}&ECNNumber=${obj.ECNNumber ?? obj.ECNNumber}&FinalPOPrice=${obj.FinalPOPrice ?? obj.FinalPOPrice}&RawMaterialFinishWeight=${obj.RawMaterialFinishWeight ?? obj.RawMaterialFinishWeight}&FreightCost=${obj.FreightCost ?? obj.FreightCost}&FreightPercentage=${obj.FreightPercentage ?? obj.FreightPercentage}&FreightType=${obj.FreightType ?? obj.FreightType}&GrossWeight=${obj.GrossWeight ?? obj.GrossWeight}&HundiOrDiscountValue=${obj.HundiOrDiscountValue ?? obj.HundiOrDiscountValue}&ICCApplicability=${obj.ICCApplicability ?? obj.ICCApplicability}&ICCCost=${obj.ICCCost ?? obj.ICCCost}&ICCInterestRate=${obj.ICCInterestRate ?? obj.ICCInterestRate}&ICCOn=${obj.ICCOn ?? obj.ICCOn}&MasterBatchTotal=${obj.MasterBatchTotal ?? obj.MasterBatchTotal}&ModelType=${obj.ModelTypeForOverheadAndProfit ?? obj.ModelTypeForOverheadAndProfit}&ModifiedByName=${obj.ModifiedByName ?? obj.ModifiedByName}&ModifiedByUserName=${obj.ModifiedByUserName ?? obj.ModifiedByUserName}&ModifiedDate=${obj.ModifiedDate ?? obj.ModifiedDate}&NetBoughtOutPartCost=${obj.NetBoughtOutPartCost ?? obj.NetBoughtOutPartCost}&NetConversionCost=${obj.NetConversionCost ?? obj.NetConversionCost}&NetConvertedPOPrice=${obj.NetConvertedPOPrice ?? obj.NetConvertedPOPrice}&NetDiscountsCost=${obj.NetDiscountsCost ?? obj.NetDiscountsCost}&NetFreightPackaging=${obj.NetFreightPackaging ?? obj.NetFreightPackaging}&NetFreightPackagingCost=${obj.NetFreightPackagingCost ?? obj.NetFreightPackagingCost}&NetICCCost=${obj.NetICCCost ?? obj.NetICCCost}&NetOperationCost=${obj.NetOperationCost ?? obj.NetOperationCost}&NetOtherCost=${obj.NetOtherCost ?? obj.NetOtherCost}&NetOverheadAndProfitCost=${obj.NetOverheadAndProfitCost ?? obj.NetOverheadAndProfitCost}&NetPOPrice=${obj.NetPOPrice ?? obj.NetPOPrice}&NetPOPriceINR=${obj.NetPOPriceINR ?? obj.NetPOPriceINR}&NetPOPriceInCurrency=${obj.NetPOPriceInCurrency ?? obj.NetPOPriceInCurrency}&NetPOPriceOtherCurrency=${obj.NetPOPriceOtherCurrency ?? obj.NetPOPriceOtherCurrency}&NetProcessCost=${obj.NetProcessCost ?? obj.NetProcessCost}&NetRawMaterialsCost=${obj.NetRawMaterialsCost ?? obj.NetRawMaterialsCost}&NetSurfaceTreatmentCost=${obj.NetSurfaceTreatmentCost ?? obj.NetSurfaceTreatmentCost}&NetToolCost=${obj.NetToolCost ?? obj.NetToolCost}&NetTotalRMBOPCC=${obj.NetTotalRMBOPCC ?? obj.NetTotalRMBOPCC}&OtherCost=${obj.OtherCost ?? obj.OtherCost}&OtherCostPercentage=${obj.OtherCostPercentage ?? obj.OtherCostPercentage}&OverheadApplicability=${obj.OverheadApplicability ?? obj.OverheadApplicability}&OverheadCombinedCost=${obj.OverheadCombinedCost ?? obj.OverheadCombinedCost}&OverheadCost=${obj.OverheadCost ?? obj.OverheadCost}&OverheadOn=${obj.OverheadOn ?? obj.OverheadOn}&OverheadPercentage=${obj.OverheadPercentage ?? obj.OverheadPercentage}&PackagingCost=${obj.PackagingCost ?? obj.PackagingCost}&PackagingCostPercentage=${obj.PackagingCostPercentage ?? obj.PackagingCostPercentage}&PartName=${obj.PartName ?? obj.PartName}&PartNumber=${obj.PartNumber ?? obj.PartNumber}&PartType=${obj.PartType ?? obj.PartType}&PaymentTermCost=${obj.PaymentTermCost ?? obj.PaymentTermCost}&PaymentTermsOn=${obj.PaymentTermsOn ?? obj.PaymentTermsOn}&PlantCode=${obj.PlantCode ?? obj.PlantCode}&PlantName=${obj.PlantName ?? obj.PlantName}&ProfitApplicability=${obj.ProfitApplicability ?? obj.ProfitApplicability}&ProfitCost=${obj.ProfitCost ?? obj.ProfitCost}&ProfitOn=${obj.ProfitOn ?? obj.ProfitOn}&ProfitPercentage=${obj.ProfitPercentage ?? obj.ProfitPercentage}&RMGrade=${obj.RMGrade ?? obj.RMGrade}&RMSpecification=${obj.RMSpecification ?? obj.RMSpecification}&RawMaterialCode=${obj.RawMaterialCode ?? obj.RawMaterialCode}&RawMaterialGrossWeight=${obj.RawMaterialGrossWeight ?? obj.RawMaterialGrossWeight}&RawMaterialName=${obj.RawMaterialName ?? obj.RawMaterialName}&RawMaterialRate=${obj.RawMaterialRate ?? obj.RawMaterialRate}&RawMaterialScrapWeight=${obj.RawMaterialScrapWeight ?? obj.RawMaterialScrapWeight}&RawMaterialSpecification=${obj.RawMaterialSpecification ?? obj.RawMaterialSpecification}&RecordInsertedBy=${obj.RecordInsertedBy ?? obj.RecordInsertedBy}&RejectOn=${obj.RejectOn ?? obj.RejectOn}&RejectionApplicability=${obj.RejectionApplicability ?? obj.RejectionApplicability}&RejectionCost=${obj.RejectionCost ?? obj.RejectionCost}&RejectionPercentage=${obj.RejectionPercentage ?? obj.RejectionPercentage}&Remark=${obj.Remark ?? obj.Remark}&Rev=${obj.Rev ?? obj.Rev}&RevisionNumber=${obj.RevisionNumber ?? obj.RevisionNumber}&ScrapRate=${obj.ScrapRate ?? obj.ScrapRate}&ScrapWeight=${obj.ScrapWeight ?? obj.ScrapWeight}&SurfaceTreatmentCost=${obj.SurfaceTreatmentCost ?? obj.SurfaceTreatmentCost}&ToolCost=${obj.ToolCost ?? obj.ToolCost}&ToolLife=${obj.ToolLife ?? obj.ToolLife}&ToolMaintenanceCost=${obj.ToolMaintenaceCost ?? obj.ToolMaintenaceCost}&ToolPrice=${obj.ToolPrice ?? obj.ToolPrice}&ToolQuantity=${obj.ToolQuantity ?? obj.ToolQuantity}&TotalCost=${obj.TotalCost ?? obj.TotalCost}&TotalOtherCost=${obj.TotalOtherCost ?? obj.TotalOtherCost}&TotalRecordCount=${obj.TotalRecordCount ?? obj.TotalRecordCount}&TransportationCost=${obj.TransportationCost ?? obj.TransportationCost}&VendorCode=${obj.VendorCode ?? obj.VendorCode}&VendorName=${obj.VendorName ?? obj.VendorName}&CustomerName=${obj.CustomerName ?? obj.CustomerName}&CustomerCode=${obj.CustomerCode ?? obj.CustomerCode}&Customer=${obj.Customer ?? obj.Customer}&Version=${obj.Version ?? obj.Version}&RawMaterialGrade=${obj.RawMaterialGrade ?? obj.RawMaterialGrade}&HundiOrDiscountPercentage=${obj.HundiOrDiscountPercentage ?? obj.HundiOrDiscountPercentage}&DateWiseData=${isLastWeek}&FromDate=${obj.FromDate ?? obj.FromDate}&ToDate=${obj.ToDate ?? obj.ToDate}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false}&SANumber=${obj.SANumber ? obj.SANumber : ""}&LineNumber=${obj.LineNumber ? obj.LineNumber : ""}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}`
            const request = axios.get(`${API.getCostingReport}?${queryParams}&${queryParamsSecond} `, config());
            request.then((response) => {
                if (isPagination === true) {

                    dispatch({
                        type: GET_REPORT_LIST,
                        payload: response.status === 204 || response.data.Result === false ? [] : response.data.DataList
                    })
                } else {

                    dispatch({
                        type: GET_ALL_REPORT_LIST,
                        payload: response.status === 204 || response.data.Result === false ? [] : response.data.DataList
                    })
                }
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                //apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_REPORT_LIST,
                payload: []
            })
            callback([]);
        }
    };
}




export function getCostingBenchMarkRmReport(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostingBenchMarkRmReport}`, data, config());
        request.then((response) => {
            dispatch({
                type: GET_BENCHMARK_MASTER_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };
}


export function getCostingBenchMarkBopReport(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostingBenchMarkBopReport}`, data, config());
        request.then((response) => {
            dispatch({
                type: GET_BENCHMARK_MASTER_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };
}
export function getCostRatioReport(data, callback) {
    const requestData = {
        loggedInUserId: loggedInUserId(),
        ...data
    }

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostRatioReport}`, requestData, config());
        request.then((response) => {
            dispatch({
                type: GET_COST_RATIO_REPORT,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };
}

export function getRevisionNoFromPartId(PartId, callback) {
    return (dispatch) => {

        if (PartId !== '') {
            const request = axios.get(`${API.getRevisionNoFromPartId}?partId=${PartId}`, config(),)
            request.then((response) => {
                if (response.data.Result) {
                    callback(response)
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE })
                // apiErrors(error)
            })
        }
    }
}
export function getCostingBenchMarkOperationReport(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostingBenchMarkOperationReport}`, data, config());
        request.then((response) => {
            dispatch({
                type: GET_BENCHMARK_MASTER_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };
}

export function getCostingBenchMarkMachineReport(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostingBenchMarkMachineReport}`, data, config());
        request.then((response) => {
            dispatch({
                type: GET_BENCHMARK_MASTER_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };
}

export function getCostMovementReportByPart(data, callback) {
    const requestData = {
        loggedInUserId: loggedInUserId(),
        ...data
    }

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getCostMovementReportByPart}`, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };

}

export function getSupplierContributionData(data, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getSupplierContributionData}?loggedInUserId=${loggedInUserId()}&fromDate=${data.fromDate}&toDate=${data.toDate}&plantId=${data.plantId}`, config(),)
        request.then((response) => {
            if (response) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            // apiErrors(error)
        })
    }
}

//SET THE COST REPORT FORM GRID DATA
export function getFormGridData(data) {

    return (dispatch) => {
        dispatch({
            type: GET_REPORT_FORM_GRID_DATA,
            payload: data
        })
    }
}


export function getSalePurchaseProvisionReport(data, callback) {
    const requestData = {
        loggedInUserId: loggedInUserId(),
        ...data
    }

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getSalePurchaseProvisionReport}`, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };

}

export function getPoamSummaryReport(data, callback) {
    const requestData = {
        loggedInUserId: loggedInUserId(),
        ...data
    }

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getPoamSummaryReport}`, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };

}

export function getPoamImpactReport(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getPoamImpactReport}`, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            //apiErrors(error);
        });

    };

}

export function getRMCostMovement(data, callback) {
    const requestData = {
        loggedInUserId: loggedInUserId(),
        ...data
    }

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getRMCostMovement}`, requestData, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });

    };

}
export function getBOPCostMovement(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getBOPCostMovement}`, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });

    };

}
export function getOperationMovement(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(`${API.getOperationMovement}`, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });

    };

}
export function getMachineProcessMovement(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(`${API.getMachineProcessMovement}`, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });

    };

}

export function getGotAndGivenDetails(data, callback) {

    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&plantId=${data?.plantId}&customerId=${data?.customerId}&vendorId=${data?.vendorId}&partId=${data?.partId}&productCategoryId=${data?.productCategoryId}&isRequestForSummary=${data?.isRequestForSummary}`

    return (dispatch) => {
        const request = axios.get(`${API.getGotAndGivenDetails}?${queryParams}`, config(),)
        request.then((response) => {
            if (response) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            // apiErrors(error)
        })
    }
}

export function getCostingGotAndGivenDetails(data, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getCostingGotAndGivenDetails}?loggedInUserId=${loggedInUserId()}&plantId=${data.plantId}&partId=${data.partId}&vendorId=${data.vendorId}&customerId=${data.customerId}&effectiveDate=${data.effectiveDate}`, config(),)
        request.then((response) => {
            if (response) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}

export function getPlantWiseGotAndGivenDetails(data, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getPlantWiseGotAndGivenDetails}?loggedInUserId=${loggedInUserId()}&plantId=${data.plantId}&vendorId=${null}&customerId=${null}&technologyId=${null}&effectiveDate=${data.effectiveDate}`, config(),)
        request.then((response) => {
            if (response) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
export function getProductlist(callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getProductlist}`, config(),)
        request.then((response) => {
            dispatch({
                type: GET_PRODUCT_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
export function getProductPartDataList(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(`${API.getProductPartDataList}`, data, config(),)
        request.then((response) => {
            dispatch({
                type: GET_PRODUCT_PART_DATA_LIST,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
export function getStageOfPartDetails(productId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }

    return (dispatch) => {
        const request = axios.get(`${API.getStageOfPartDetails}?partId=${productId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config(),)
        request.then((response) => {
            dispatch({
                type: GET_STAGE_OF_PART_DETAILS,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
export function getTotalPartsDetails(productId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getTotalPartsDetails}?partId=${productId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config(),)
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}
export function getProductRolloutCostMovement(partId, partNumber, partType, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getProductRolloutCostMovement}?loggedInUserId=${loggedInUserId()}&partId=${partId}&partNumber=${partNumber}&partType=${partType}`, config(),)
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}
export function getProductRolloutCostRatio(productId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }

    return (dispatch) => {
        const request = axios.get(`${API.getProductRolloutCostRatio}?partId=${productId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config(),)
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}
export function getUsageRmDetails(productId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getUsageRmDetails}?partId=${productId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config(),)
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}
export function getSupplierContributionDetails(productId, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getSupplierContributionDetails}?partId=${productId}&loggedInUserId=${loggedInUserId()}`, config(),)
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}

/**
 * @method getRMImportDataList
 * @description Used to get RM Import Datalist
 */
export function getSimulationInsightReport(skip, take, isPagination, obj, callback) {

    return (dispatch) => {

        if (isPagination === true) {

            const queryParams = `isDashboard=false&logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInLevelId}&applyPagination=${isPagination}&skip=${skip}&take=${take}`
            const queryParamsSecond = `tokenNumber=${obj.ApprovalTokenNumber ?? obj.ApprovalTokenNumber}&createdDate=${obj.createdDate ?? obj.createdDate}&simulatedBy=${obj.SimulatedByName ?? obj.SimulatedByName}&costingHead=${obj.CostingHead ?? obj.CostingHead}&technologyName=${obj.TechnologyName ?? obj.TechnologyName}&masters=${obj.SimulationTechnologyHead ?? obj.SimulationTechnologyHead}&departmentName=${obj.DepartmentName ?? obj.DepartmentName}&depaetmentCode=${obj.DepartmentCode ?? obj.DepartmentCode}&initiatedBy=${obj.SenderUserName ?? obj.SenderUserName}&simulationStatus=${obj.SimulationStatus ?? obj.SimulationStatus}&effectiveDate=${obj.EffectiveDate ?? obj.EffectiveDate}&requestedOn=${obj.SentDate ?? obj.SentDate}`
            const request = axios.get(`${API.getSimualtionInsightReport}?${queryParams}&${queryParamsSecond}`, config());
            request.then((response) => {
                if (response.data.Result || response.status === 204) {
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
            });
        } else {
            callback([]);
        }
    };

}

export function getNfrInsightsDetails(callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getNfrInsightsDetails}?loggedInUserId=${loggedInUser?.loggedInUserId}`, config(),)
        request.then((response) => {
            dispatch({
                type: GET_NFR_INSIGHT_DETAILS,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}

export function getNfrInsightsStatusDetails(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNfrInsightsStatusDetails}?loggedInUserId=${loggedInUserId()}&plantCode=${data?.plantCode}&nfrVersion=${data?.nfrVersion}`, config())
        request.then((response) => {
            dispatch({
                type: GET_NFR_INSIGHT_STATUS_DETAILS,
                payload: response.status === 204 || response.data.Result === false ? [] : response.data.Data
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}

export function getCostDeviationReport(data, callback) {
    const params = new URLSearchParams();

    // Function to add params only if they have a valid value
    const addParam = (key, value) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    };

    // Add each param conditionally
    addParam("loggedInUserId", loggedInUserId()); // Fixed user ID
    addParam("partNumber", data?.partNumber);
    addParam("revisionNumber", data?.revisionNumber);
    addParam("vendorCode", data?.vendorCode);
    addParam("rawMaterialCode", data?.rawMaterialCode);
    addParam("rawMaterialName", data?.rawMaterialName);
    addParam("rawMaterialGrade", data?.rawMaterialGrade);
    addParam("rawMaterialSpecification", data?.rawMaterialSpecification);
    addParam("status", data?.status); // Assuming status is fixed
    addParam("fromDate", data?.fromDate);
    addParam("toDate", data?.toDate);
    addParam("rawMaterialRate", data?.rawMaterialRate);
    addParam("scrapRate", data?.scrapRate);
    addParam("netRawMaterialsCost", data?.netRawMaterialsCost);
    addParam("rawMaterialGrossWeight", data?.rawMaterialGrossWeight);
    addParam("rawMaterialFinishWeight", data?.rawMaterialFinishWeight);
    addParam("rawMaterialScrapWeight", data?.rawMaterialScrapWeight);
    addParam("isGrossWeightComparison", data?.isGrossWeightComparison);
    addParam("isFinishWeightComparison", data?.isFinishWeightComparison);
    addParam("isScrapWeightComparison", data?.isScrapWeightComparison);
    addParam("costingHeadId", data?.costingHeadId); // Default to 1
    addParam("skip", data?.skip);
    addParam("take", data?.take);

    return (dispatch) => {
        const request = axios.get(`${API.getCostDeviationReport}?${params.toString()}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_COST_DEVIATION_REPORT,
                    payload: response.status === 204 ? [] : response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error);
        })
    }
}

export function getBusinessValueReportHeads(callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getBusinessValueReportHeads}`, config());
        request.then((response) => {
            if (response?.data?.SelectList || response?.status === 204) {
                dispatch({
                    type: GET_BUSINESS_VALUE_REPORT_HEADS,
                    payload: response.status === 204 ? [] : response?.data?.SelectList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error);
        })
    }
}

export function getBusinessValueReportData(loggedInUserId, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getBusinessValueReportData}?loggedInUserId=${loggedInUserId}`, config());
        request.then((response) => {
            if (response?.data?.Data || response?.status === 204) {
                dispatch({
                    type: GET_BUSINESS_VALUE_REPORT_DATA,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error);
        })
    }
}

