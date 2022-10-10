import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SELECTLIST_MASTERS,
    GET_VERIFY_SIMULATION_LIST,
    GET_COSTING_SIMULATION_LIST,
    GET_SIMULATION_APPROVAL_LIST,
    SET_SELECTED_MASTER_SIMULATION,
    GET_SELECTLIST_APPLICABILITY_HEAD,
    SET_SELECTED_TECHNOLOGY_SIMULATION,
    GET_APPROVAL_SIMULATION_COSTING_SUMMARY,
    config,
    GET_ALL_APPROVAL_DEPARTMENT,
    GET_SELECTED_COSTING_STATUS,
    GET_AMMENDENT_STATUS_COSTING,
    GET_FG_WISE_IMPACT_DATA,
    GET_COMBINED_PROCESS_LIST,
    SET_SELECTED_VENDOR_SIMULATION,
    GET_SELECTLIST_SIMULATION_TOKENS,
    GET_IMPACTED_MASTER_DATA,
    GET_LAST_SIMULATION_DATA,
    GET_ASSEMBLY_SIMULATION_LIST,
    SET_DATA_TEMP,
    GET_ASSEMBLY_SIMULATION_LIST_SUMMARY,
    GET_VERIFY_OVERHEAD_SIMULATION_LIST,
    GET_VERIFY_PROFIT_SIMULATION_LIST,
    SET_SHOW_SIMULATION_PAGE,
    GET_TOKEN_SELECT_LIST,
    RMDOMESTIC,
    RMIMPORT,
    BOPDOMESTIC,
    GET_RM_IMPORT_LIST,
    GET_BOP_DOMESTIC_DATA_LIST,
    BOPIMPORT,
    GET_BOP_IMPORT_DATA_LIST,
    OPERATIONS,
    GET_OPERATION_COMBINED_DATA_LIST,
    SURFACETREATMENT,
    MACHINERATE,
    GET_MACHINE_DATALIST_SUCCESS,
    EXCHNAGERATE,
    EXCHANGE_RATE_DATALIST,
    GET_RM_DOMESTIC_LIST,
    GET_VALUE_TO_SHOW_COSTING_SIMULATION,
    GET_KEYS_FOR_DOWNLOAD_SUMMARY,
    COMBINED_PROCESS,
    SET_ATTACHMENT_FILE_DATA,
    SET_TOKEN_CHECK_BOX,
    SET_TOKEN_FOR_SIMULATION,
    GET_MASTER_SELECT_LIST_SIMUALTION,
    SET_SELECTED_ROW_FOR_PAGINATION,
    GET_SIMULATION_APPROVAL_LIST_DRAFT
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';

// const config() = config

export function getSelectListOfMasters(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSelectListOfSimulationMaster}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SELECTLIST_MASTERS,
                    payload: response.data.SelectList,
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

export function runVerifySimulation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulation, data, config());
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

export function getVerifySimulationList(token, plantId, rawMatrialId, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getVerifySimulationList}?simulationId=${token}&plantId=${plantId}&rawMaterilId=${rawMatrialId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.SimulationImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function getCostingSimulationList(token, plantId, rawMatrialId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCostingSimulationList}?simulationId=${token}&plantId=${plantId}&rawMaterilId=${rawMatrialId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                let tempData = {
                    IsBoughtOutPartSimulation: response.data.Data.IsBoughtOutPartSimulation,
                    IsExchangeRateSimulation: response.data.Data.IsExchangeRateSimulation,
                    IsOperationSimulation: response.data.Data.IsOperationSimulation,
                    IsRawMaterialSimulation: response.data.Data.IsRawMaterialSimulation,
                    IsSurfaceTreatmentSimulation: response.data.Data.IsSurfaceTreatmentSimulation,
                    IsCombinedProcessSimulation: response.data.Data.IsCombinedProcessSimulation,

                }
                dispatch({
                    type: GET_VALUE_TO_SHOW_COSTING_SIMULATION,
                    payload: tempData
                })
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.status === 204 ? [] : response.data.Data.SimulatedCostingList
                })

                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function runSimulationOnSelectedCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedCosting, data, config());
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

export function getSimulationApprovalList(filterData, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        dispatch({
            type: GET_SIMULATION_APPROVAL_LIST,
            payload: [],
        })
        dispatch({
            type: GET_SIMULATION_APPROVAL_LIST_DRAFT,
            payload: [],
        })
        const queryParameter = `isDashboard=${filterData.isDashboard}&logged_in_user_id=${filterData.logged_in_user_id}&logged_in_user_level_id=${filterData.logged_in_user_level_id}&token_number=${filterData.token_number}&simulated_by=${filterData.simulated_by}&requested_by=${filterData.requestedBy}&status=${filterData.status}`

        const queryParamsSecond = `ApprovalNumber=${obj.ApprovalNumber !== undefined ? obj.ApprovalNumber : ""}&CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&SimulationType=${obj.SimulationType !== undefined ? obj.SimulationType : ""}&AmedmentStatus=${obj.ProvisionalStatus !== undefined ? obj.ProvisionalStatus : ""}&LinkingTokenNo=${obj.LinkingTokenNo !== undefined ? obj.LinkingTokenNo : ""}&SimulationHead=${obj.SimulationTechnologyHead !== undefined ? obj.SimulationTechnologyHead : ""}&Technology=${obj.TechnologyName !== undefined ? obj.TechnologyName : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&ImpactedCosting=${obj.ImpactCosting !== undefined ? obj.ImpactCosting : ""}&ImpactedParts=${obj.ImpactParts !== undefined ? obj.ImpactParts : ""}&Reason=${obj.Reason !== undefined ? obj.Reason : ""}&InitiatedBy=${obj.SimulatedByName !== undefined ? obj.SimulatedByName : ""}&SimulatedOn=${obj.SimulatedOn !== undefined ? obj.SimulatedOn : ""}&LastApproval=${obj.LastApprovedBy !== undefined ? obj.LastApprovedBy : ""}&RequestedOn=${obj.RequestedOn !== undefined ? obj.RequestedOn : ""}&SimulationStatus=${obj.DisplayStatus !== undefined ? obj.DisplayStatus : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}`
        const request = axios.get(`${API.getSimulationApprovalList}?${queryParameter}&${queryParamsSecond}`, config())

        request.then((response) => {
            if (response.data.Result) {
                if (filterData.isDashboard) {
                    dispatch({
                        type: GET_SIMULATION_APPROVAL_LIST,
                        payload: response.data.DataList,
                    })
                } else {
                    dispatch({
                        type: GET_SIMULATION_APPROVAL_LIST_DRAFT,
                        payload: response.data.DataList,
                    })
                }
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}

export function setMasterForSimulation(selectedMaster) {
    return (dispatch) => {
        dispatch({
            type: SET_SELECTED_MASTER_SIMULATION,
            payload: selectedMaster,
        });
    }
}

export function setTechnologyForSimulation(selectedTechnology) {
    return (dispatch) => {
        dispatch({
            type: SET_SELECTED_TECHNOLOGY_SIMULATION,
            payload: selectedTechnology,
        });
    }
}

export function getSelectListOfSimulationApplicability(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSelectListOfSimulationApplicability}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SELECTLIST_APPLICABILITY_HEAD,
                    payload: response.data.SelectList,
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




export function getSelectListOfSimulationLinkingTokens(vendorId, simulationTechnologyId, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParameter = `vendorId=${vendorId}`
        const queryParameter1 = `simulationtechnologyId=${simulationTechnologyId}`
        const request = axios.get(`${API.getSelectListOfSimulationLinkingTokens}?${queryParameter}&${queryParameter1}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SELECTLIST_SIMULATION_TOKENS,
                    payload: response.data.SelectList,
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




export function saveSimulationForRawMaterial(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.saveSimulationForRawMaterial, data, config());
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

export function getApprovalSimulatedCostingSummary(params, callback) {
    return (dispatch) => {
        dispatch({
            type: GET_KEYS_FOR_DOWNLOAD_SUMMARY,
            payload: [],
        })
        const queryParameter = `${params.approvalTokenNumber}/${params.approvalId}/${params.loggedInUserId}`;
        const request = axios.get(`${API.getApprovalSimulatedCostingSummary}/${queryParameter}`, config())
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                let tempData = {
                    IsBoughtOutPartSimulation: response.status === 204 ? false : response?.data?.Data?.IsBoughtOutPartSimulation,
                    IsExchangeRateSimulation: response.status === 204 ? false : response?.data?.Data?.IsExchangeRateSimulation,
                    IsOperationSimulation: response.status === 204 ? false : response?.data?.Data?.IsOperationSimulation,
                    IsRawMaterialSimulation: response.status === 204 ? false : response?.data?.Data?.IsRawMaterialSimulation,
                    IsSurfaceTreatmentSimulation: response.status === 204 ? false : response?.data?.Data?.IsSurfaceTreatmentSimulation,
                    IsCombinedProcessSimulation: response.status === 204 ? false : response?.data?.Data?.IsCombinedProcessSimulation,
                }
                dispatch({
                    type: GET_KEYS_FOR_DOWNLOAD_SUMMARY,
                    payload: tempData,
                })
                dispatch({
                    type: GET_APPROVAL_SIMULATION_COSTING_SUMMARY,
                    payload: response.status === 204 ? [] : response.data.DataList,
                })

                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
export function getAllSimulationApprovalList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(`${API.getSimulationApprovalListByDepartment}`, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    }
}

export function getSimulationApprovalByDepartment(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllSimulationApprovalDepartment}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ALL_APPROVAL_DEPARTMENT,
                    payload: response.data.SelectList,
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            // callback(error);
            apiErrors(error);
        });
    }
}

/**
 * @method approvalRequestByApprove
 * @description approving the request by approve
 */
export function simulationApprovalRequestByApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simulationApprove, data, config())
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
* @method rejectRequestByApprove
* @description rejecting approval Request
*/
export function simulationRejectRequestByApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simulationReject, data, config())
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
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}

/**
 * @method simulationApprovalRequestBySender
 * @description sending the request to Approver for first time
 */
export function simulationApprovalRequestBySender(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simulationSendToApprover, data, config())
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
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}

export function getComparisionSimulationData(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `simulationId=${data.simulationId}&costingId=${data.costingId}`
        const request = axios.get(`${API.simulationComparisionData}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result) {
                // dispatch({
                //     type: GET_ALL_APPROVAL_DEPARTMENT,
                //     payload: response.data.SelectList,
                // })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            // callback(error);
            apiErrors(error);
        });
    }
}

export function pushAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simualtionPush, data, config())
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
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


export function getSimulationStatus(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getallSimualtionStatus}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SELECTED_COSTING_STATUS,
                    payload: response.data.SelectList,
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            // callback(error);
            apiErrors(error);
        });
    }
}


export function deleteDraftSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteDraftSimulation}/${data.simulationId}/${data.loggedInUser}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                //apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

export function uploadSimulationAttachmentByCategory(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.post(`${API.simulationUploadFileByCategory}`, data, config())
            .then((response) => {
                callback(response)
            }).catch(error => {
                callback(error.response)
                dispatch({ type: API_FAILURE })
                callback(error)
            })
    }
}
export function uploadSimulationAttachmentonFTP(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.post(`${API.simulationUploadFtp}`, data, config())
            .then((response) => {
                callback(response)
            }).catch(error => {
                callback(error.response)
                dispatch({ type: API_FAILURE })
            })
    }
}

export function getAmmendentStatus(params, callback) {
    return (dispatch) => {
        // const queryParameter = `${params.approvalTokenNumber}/${params.approvalId}/${params.loggedInUserId}`;
        const queryParameter = `${params.approvalTokenNumber}`;
        const request = axios.get(`${API.getAmmendentStatus}?tokenNumber=${queryParameter}`, config())
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_AMMENDENT_STATUS_COSTING,
                    payload: response.status === 204 ? [] : response.data.DataList,
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}



export function runVerifyExchangeRateSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftExchangeRateSimulation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    }
}

export function getVerifyExchangeSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getverifyExchangeSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.SimulationExchangeRateImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function runSimulationOnSelectedExchangeCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedExchangeCosting, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function getExchangeCostingSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getExchangeCostingSimulationList}?simulationId=${token}&plantId=''`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                let tempData = {
                    IsBoughtOutPartSimulation: response.status === 204 ? false : response?.data?.Data?.IsBoughtOutPartSimulation,
                    IsExchangeRateSimulation: response.status === 204 ? false : response?.data?.Data?.IsExchangeRateSimulation,
                    IsOperationSimulation: response.status === 204 ? false : response?.data?.Data?.IsOperationSimulation,
                    IsRawMaterialSimulation: response.status === 204 ? false : response?.data?.Data?.IsRawMaterialSimulation,
                    IsSurfaceTreatmentSimulation: response.status === 204 ? false : response?.data?.Data?.IsSurfaceTreatmentSimulation,
                    IsCombinedProcessSimulation: response.status === 204 ? false : response?.data?.Data?.IsCombinedProcessSimulation,

                }
                dispatch({
                    type: GET_VALUE_TO_SHOW_COSTING_SIMULATION,
                    payload: tempData
                })
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.status === 204 ? [] : response.data.Data.SimulatedCostingList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}
export function setAttachmentFileData(attachmentsData, callback) {
    return (dispatch) => {
        dispatch({
            type: SET_ATTACHMENT_FILE_DATA,
            payload: attachmentsData,
        })
        callback();
    }
};

/**
 * @method getCombinedProcessList
 * @description GET PROCESS DATALIST
 */
export function getCombinedProcessList(data, callback) {
    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCombinedProcessList}?technologyId=${data.technologyId}&vendorId=${data.vendorId}`, config())
            .then((response) => {

                if (response.data.Result === true || response.status === 204) {
                    dispatch({
                        type: GET_COMBINED_PROCESS_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    });
                    callback(response);
                }
                //  if (response.data.Result === true) {
                //     dispatch({
                //         type: GET_COMBINED_PROCESS_LIST,
                //         payload: response.data.DataList,
                //     });
                //     callback(response);
                // }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

export function runVerifyCombinedProcessSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftCombinedProcessSimulation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    }
}

export function getverifyCombinedProcessSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getverifyCombinedProcessSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.SimulationCombinedProcessImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function getFgWiseImpactData(data, callback) {
    return (dispatch) => {

        dispatch({
            type: GET_FG_WISE_IMPACT_DATA,
            payload: [],
        })

        const request = axios.get(`${API.getFgWiseImpactData}?simulationId=${data}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FG_WISE_IMPACT_DATA,
                    payload: response.data.DataList,
                })
                callback(response)
            } else if (response.status === 204) {
                dispatch({
                    type: GET_FG_WISE_IMPACT_DATA,
                    payload: [],
                })
                callback(response)
            }

        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        })
    }
}

export function runSimulationOnSelectedCombinedProcessCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedCombinedProcessCosting, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error)
        })
    }
}


export function getLastSimulationData(vendorId, effectiveDate, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const structureOfData = {
            ExchangeRateImpactedMasterDataList: [],
            OperationImpactedMasterDataList: [],
            RawMaterialImpactedMasterDataList: [],
            BoughtOutPartImpactedMasterDataList: [],
            CombinedProcessImpactedMasterDataList: [],
        }
        const queryParams = `vendorId=${vendorId}&effectiveDate=${effectiveDate}`

        const request = axios.get(`${API.getLastSimulationData}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_LAST_SIMULATION_DATA,
                    payload: response.status === 204 ? structureOfData : response.data.Data
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

export function getCombinedProcessCostingSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCombinedProcessCostingSimulationList}?simulationId=${token}&plantId=''`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.data.Data.SimulatedCostingList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}
export function setVendorForSimulation(selectedVendorForSimulation) {
    return (dispatch) => {
        dispatch({
            type: SET_SELECTED_VENDOR_SIMULATION,
            payload: selectedVendorForSimulation,
        });
    }
}

export function sapPushedInitialMoment(simulationId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.sapPushedInitialMoment}?simulationId=${simulationId}`, config());
        request.then((response) => {
            // if (response.data.Result) {
            //     dispatch({
            //         type: GET_COSTING_SIMULATION_LIST,
            //         payload: response.data.Data.SimulatedCostingList
            //     })
            // }
            callback(response)
            // apiErrors(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error)
            apiErrors(error);
        })
    }
}
export function getImpactedMasterData(simulationId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const structureOfData = {
            ExchangeRateImpactedMasterDataList: [],
            OperationImpactedMasterDataList: [],
            RawMaterialImpactedMasterDataList: [],
            BoughtOutPartImpactedMasterDataList: [],
            CombinedProcessImpactedMasterDataList: [],
        }
        const queryParams = `simulationId=${simulationId}`
        const request = axios.get(`${API.getImpactedMasterData}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_IMPACTED_MASTER_DATA,
                    payload: response.status === 204 ? structureOfData : response.data.Data
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


export function getVerifySurfaceTreatmentSimulationList(token, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getverifySurfaceTreatmentSimulationList}?simulationId=${token}`, config());

        request.then((response) => {

            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.SimulationSurfaceTreatmentAndOperationImpactedCosting
                })
                callback(response)
            }

        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    }
}

export function runVerifySurfaceTreatmentSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftSurfaceTreatmentSimulation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    }
}


export function runSimulationOnSelectedSurfaceTreatmentCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedSurfaceTreatmentCosting, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function getCostingSurfaceTreatmentSimulationList(token, plantId, rawMatrialId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCostingSurfaceTreatmentSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                let tempData = {
                    IsBoughtOutPartSimulation: response.status === 204 ? false : response?.data?.Data?.IsBoughtOutPartSimulation,
                    IsExchangeRateSimulation: response.status === 204 ? false : response?.data?.Data?.IsExchangeRateSimulation,
                    IsOperationSimulation: response.status === 204 ? false : response?.data?.Data?.IsOperationSimulation,
                    IsRawMaterialSimulation: response.status === 204 ? false : response?.data?.Data?.IsRawMaterialSimulation,
                    IsSurfaceTreatmentSimulation: response.status === 204 ? false : response?.data?.Data?.IsSurfaceTreatmentSimulation,
                    IsCombinedProcessSimulation: response.status === 204 ? false : response?.data?.Data?.IsCombinedProcessSimulation,
                }
                dispatch({
                    type: GET_VALUE_TO_SHOW_COSTING_SIMULATION,
                    payload: tempData
                })
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.status === 204 ? [] : response.data.Data.SimulatedCostingList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function runVerifyMachineRateSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftMachineRateSimulation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    }
}

export function runSimulationOnSelectedMachineRateCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedMachineRateCosting, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function runVerifyBoughtOutPartSimulation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.draftBoughtOutpartSimulation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


export function runSimulationOnSelectedBoughtOutPartCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedBoughtOutPartCosting, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


export function getVerifyMachineRateSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getverifyMachineRateSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.SimulationMachineProcesstImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function getVerifyBoughtOutPartSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getverifyBoughtOutPartSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_SIMULATION_LIST,
                    payload: response.data.Data.simulationBoughtOutPartImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function getCostingBoughtOutPartSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCostingBoughtOutPartSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                let tempData = {
                    IsBoughtOutPartSimulation: response.status === 204 ? false : response?.data?.Data?.IsBoughtOutPartSimulation,
                    IsExchangeRateSimulation: response.status === 204 ? false : response?.data?.Data?.IsExchangeRateSimulation,
                    IsOperationSimulation: response.status === 204 ? false : response?.data?.Data?.IsOperationSimulation,
                    IsRawMaterialSimulation: response.status === 204 ? false : response?.data?.Data?.IsRawMaterialSimulation,
                    IsSurfaceTreatmentSimulation: response.status === 204 ? false : response?.data?.Data?.IsSurfaceTreatmentSimulation,
                    IsCombinedProcessSimulation: response.status === 204 ? false : response?.data?.Data?.IsCombinedProcessSimulation,
                }
                dispatch({
                    type: GET_VALUE_TO_SHOW_COSTING_SIMULATION,
                    payload: tempData
                })
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.status === 204 ? [] : response.data.Data.SimulatedCostingList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function getSimulatedAssemblyWiseImpactDate(requestData, isAssemblyInDraft, callback) {
    return (dispatch) => {
        dispatch({
            type: GET_ASSEMBLY_SIMULATION_LIST,
            payload: [],
        })
        const request = axios.post(`${API.getSimulatedAssemblyWiseImpactDate}`, requestData, config());
        request.then((response) => {
            // THIS BLOCK WORKS WHEN THERE IS DATA IN API
            if (response.data.Result) {

                // THIS IS WHEN CALL COMES FROM DRAFT
                if (isAssemblyInDraft === true) {
                    dispatch({
                        type: GET_ASSEMBLY_SIMULATION_LIST,
                        payload: response.data.DataList
                    })
                }

                // THIS IS WHEN CALL COMES FROM SUMMARY
                if (isAssemblyInDraft === false) {
                    dispatch({
                        type: GET_ASSEMBLY_SIMULATION_LIST_SUMMARY,
                        payload: response.data.DataList
                    })
                    callback(response)
                }
            }
            // THIS BLOCK WORKS WHEN THERE IS NO DATA IN API
            else if (response.status === 204) {

                // THIS IS WHEN CALL COMES FROM DRAFT
                if (isAssemblyInDraft === true) {
                    dispatch({
                        type: GET_ASSEMBLY_SIMULATION_LIST,
                        payload: []
                    })
                }

                // THIS IS WHEN CALL COMES FROM SUMMARY
                if (isAssemblyInDraft === false) {
                    dispatch({
                        type: GET_ASSEMBLY_SIMULATION_LIST_SUMMARY,
                        payload: []
                    })
                    callback(response)
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function setData(valdataTemp) {
    return (dispatch) => {
        dispatch({
            type: SET_DATA_TEMP,
            payload: valdataTemp,
        });
    }
}

export function getVerifyOverheadSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getVerifyOverheadProfitSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_OVERHEAD_SIMULATION_LIST,
                    payload: response.data.Data.SimulationExchangeRateImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function runSimulationOnSelectedOverheadCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedOverheadCosting, data, config());
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

export function runVerifyOverheadSimulation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.draftOverheadSimulation, data, config());
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
export function runVerifyProfitSimulation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.draftProfitSimulation, data, config());
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

export function getVerifyProfitSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getVerifyProfitSimulationList}?simulationId=${token}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VERIFY_PROFIT_SIMULATION_LIST,
                    payload: response.data.Data.SimulationExchangeRateImpactedCostings
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function runSimulationOnSelectedProfitCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedProfitCosting, data, config());
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
 * @method setShowSimulationPage
 * @description Set Show Simulation Page
 */
export function setShowSimulationPage(Data) {
    return (dispatch) => {
        dispatch({
            type: SET_SHOW_SIMULATION_PAGE,
            payload: Data,
        })
        // callback();
    }
};

/**
* @method getTokenSelectList
* @description Used to get select list of Vendor's
*/
export function getTokenSelectListAPI(obj, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTokenSelectListAPI}?technologyId=${obj.technologyId}&loggedInUserId=${obj.loggedInUserId}&simulationTechnologyId=${obj.simulationTechnologyId}&vendorId=${obj.vendorId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TOKEN_SELECT_LIST,
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

export function getListingForSimulationCombined(requestData, master, callback) {
    return (dispatch) => {
        switch (master) {
            case RMDOMESTIC:
                dispatch({
                    type: GET_RM_DOMESTIC_LIST,
                    payload: []
                })
                break;

            case RMIMPORT:
                dispatch({
                    type: GET_RM_IMPORT_LIST,
                    payload: []
                })
                break;

            case BOPDOMESTIC:
                dispatch({
                    type: GET_BOP_DOMESTIC_DATA_LIST,
                    payload: []
                })
                break;

            case BOPIMPORT:
                dispatch({
                    type: GET_BOP_IMPORT_DATA_LIST,
                    payload: []
                })
                break;

            case OPERATIONS:
            case SURFACETREATMENT:
                dispatch({
                    type: GET_OPERATION_COMBINED_DATA_LIST,
                    payload: []
                })
                break;

            case MACHINERATE:
                dispatch({
                    type: GET_MACHINE_DATALIST_SUCCESS,
                    payload: []
                })
                break;

            case EXCHNAGERATE:
                dispatch({
                    type: EXCHANGE_RATE_DATALIST,
                    payload: []
                })
                break;
            case COMBINED_PROCESS:
                dispatch({
                    type: GET_COMBINED_PROCESS_LIST,
                    payload: []
                })
                break;

            //ADD CASE FOR COMBINED PROCESS IN RE (REMINDER)

            default:
                break;
        }
        const request = axios.post(`${API.getListingForSimulationCombined}`, requestData, config());
        request.then((response) => {
            if (response.data.Result) {
                switch (master) {
                    case RMDOMESTIC:
                        dispatch({
                            type: GET_RM_DOMESTIC_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    case RMIMPORT:
                        dispatch({
                            type: GET_RM_IMPORT_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    case BOPDOMESTIC:
                        dispatch({
                            type: GET_BOP_DOMESTIC_DATA_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    case BOPIMPORT:
                        dispatch({
                            type: GET_BOP_IMPORT_DATA_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    case OPERATIONS:
                    case SURFACETREATMENT:
                        dispatch({
                            type: GET_OPERATION_COMBINED_DATA_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    case MACHINERATE:
                        dispatch({
                            type: GET_MACHINE_DATALIST_SUCCESS,
                            payload: response.data.Data
                        })
                        break;

                    case EXCHNAGERATE:
                        dispatch({
                            type: EXCHANGE_RATE_DATALIST,
                            payload: response.data.Data
                        })
                        break;
                    case COMBINED_PROCESS:
                        dispatch({
                            type: GET_COMBINED_PROCESS_LIST,
                            payload: response.data.DataList
                        })
                        break;

                    //ADD CASE FOR COMBINED PROCESS IN RE (REMINDER)

                    default:
                        break;
                }

            }
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        })
    }
}

export function setTokenCheckBoxValue(value) {
    return (dispatch) => {
        dispatch({
            type: SET_TOKEN_CHECK_BOX,
            payload: value,
        });
    }
}

export function setTokenForSimulation(value) {
    return (dispatch) => {
        dispatch({
            type: SET_TOKEN_FOR_SIMULATION,
            payload: value,
        });
    }
}



//FOR SELECTING MASTER LIST IN SIMULATION
export function getMasterSelectListSimulation(loggedInUserId, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getMasterSelectListSimulation}/${loggedInUserId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MASTER_SELECT_LIST_SIMUALTION,
                    payload: response.data.SelectList
                })
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        })
    }
}

export function setSelectedRowForPagination(value) {
    return (dispatch) => {
        dispatch({
            type: SET_SELECTED_ROW_FOR_PAGINATION,
            payload: value,
        });
    }
}

