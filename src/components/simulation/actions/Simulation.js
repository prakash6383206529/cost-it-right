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
    GET_SIMULATION_DEPARTMENT_LIST,
    GET_ALL_APPROVAL_DEPARTMENT,
    GET_SELECTED_COSTING_STATUS,
    GET_SELECTLIST_SIMULATION_TOKENS,
    GET_IMPACTED_MASTER_DATA,
    GET_LAST_SIMULATION_DATA,
    SET_ATTACHMENT_FILE_DATA,
    SET_SELECTED_ROW_COUNT_FOR_SIMULATION_MESSAGE,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = config

export function getSelectListOfMasters(callback) {
    // let JSON = {
    //     status: 200,
    //     data: {
    //         SelectList: [

    //             {
    //                 Disabled: false,
    //                 Group: null,
    //                 Selected: false,
    //                 Text: "Raw Material(Domestic)",
    //                 Value: "f9e158eb-f506-4f63-bc56-42cae12ec6bd"
    //             },
    //             {
    //                 Disabled: false,
    //                 Group: null,
    //                 Selected: false,
    //                 Text: "Raw Material(Import)",
    //                 Value: "0d635de3-8c83-493d-b446-8b3e1f6ed4d0"
    //             },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "BOP (Domestic)",
    //             //     Value: "abddb973-b5ea-42ad-b99a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "BOP (Import)",
    //             //     Value: "abddb973-b5ea-42ad-b99a-e60673c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Process",
    //             //     Value: "abddb972-b5ea-42ad-b99a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Operation",
    //             //     Value: "abbdb973-b5ea-42ad-b99a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: " Surface Treatment",
    //             //     Value: "abddb973-b5ea-42ad-b99a-e61674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Overhead",
    //             //     Value: "bbddb973-b5ea-42ad-b99a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Profits",
    //             //     Value: "abdda873-b5ea-42ad-b99a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "ICC",
    //             //     Value: "abdda873-b5ea-42ad-b1000a-e60674c40e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Payment Terms",
    //             //     Value: "abdda873-b5ea-42ad-b99a-e60674c500e28"
    //             // },
    //             // {
    //             //     Disabled: false,
    //             //     Group: null,
    //             //     Selected: false,
    //             //     Text: "Freight",
    //             //     Value: "abdda873-b5ea-42dd-b99a-e60674c40e28"
    //             // },
    //         ],
    //     },
    // }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSelectListOfSimulationMaster}`, headers);
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
        const request = axios.post(API.runSimulation, data, headers);
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
        const request = axios.get(`${API.getVerifySimulationList}?simulationId=${token}&plantId=${plantId}&rawMaterilId=${rawMatrialId}`, headers);
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
        const request = axios.get(`${API.getCostingSimulationList}?simulationId=${token}&plantId=${plantId}&rawMaterilId=${rawMatrialId}`, headers);
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

export function runSimulationOnSelectedCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedCosting, data, headers);
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

export function getSimulationApprovalList(filterData, callback) {
    return (dispatch) => {
        const queryParameter = `isDashboard=${filterData.isDashboard}&logged_in_user_id=${filterData.logged_in_user_id}&logged_in_user_level_id=${filterData.logged_in_user_level_id}&token_number=${filterData.token_number}&simulated_by=${filterData.simulated_by}&requested_by=${filterData.requestedBy}&status=${filterData.status}`
        const request = axios.get(`${API.getSimulationApprovalList}?${queryParameter}`, headers)
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SIMULATION_APPROVAL_LIST,
                    payload: response.data.DataList,
                })
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
        const request = axios.get(`${API.getSelectListOfSimulationApplicability}`, headers);
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
        const request = axios.get(`${API.getSelectListOfSimulationLinkingTokens}?${queryParameter}&${queryParameter1}`, headers);
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
        const request = axios.post(API.saveSimulationForRawMaterial, data, headers);
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
        const queryParameter = `${params.approvalTokenNumber}/${params.approvalId}/${params.loggedInUserId}`;
        const request = axios.get(`${API.getApprovalSimulatedCostingSummary}/${queryParameter}`, headers)
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_APPROVAL_SIMULATION_COSTING_SUMMARY,
                    payload: response.data.DataList,
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
        const request = axios.post(`${API.getSimulationApprovalListByDepartment}`, data, headers);
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
        const request = axios.get(`${API.getAllSimulationApprovalDepartment}`, headers);
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
        const request = axios.post(API.simulationApprove, data, headers)
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
export function simulationRejectRequestByApprove(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simulationReject, data, headers)
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
 * @method simulationApprovalRequestBySender
 * @description sending the request to Approver for first time
 */
export function simulationApprovalRequestBySender(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.simulationSendToApprover, data, headers)
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

export function getComparisionSimulationData(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `simulationApprovalProcessSummaryId=${data.simulationApprovalProcessSummaryId}&simulationid=${data.simulationId}&costingId=${data.costingId}`
        const request = axios.get(`${API.simulationComparisionData}?${queryParams}`, headers);
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

export function getSimulationStatus(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getallSimualtionStatus}`, headers);
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
        axios.delete(`${API.deleteDraftSimulation}/${data.simulationId}/${data.loggedInUser}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                //apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

export function runVerifyExchangeRateSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftExchangeRateSimulation, data, headers);
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
        const request = axios.get(`${API.getverifyExchangeSimulationList}?simulationId=${token}`, headers);
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
        const request = axios.post(API.runSimulationOnSelectedExchangeCosting, data, headers);
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

export function getExchangeCostingSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getExchangeCostingSimulationList}?simulationId=${token}&plantId=''`, headers);
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


export function uploadSimulationAttachment(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.post(`${API.uploadFileOnSimulation}`, data, headers)
            .then((response) => {
                callback(response)
            }).catch(error => {
                callback(error.response)
                dispatch({ type: API_FAILURE })
            })
    }
}



export function getLastSimulationData(vendorId, effectiveDate, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `vendorId=${vendorId}&effectiveDate=${effectiveDate}`

        const request = axios.get(`${API.getLastSimulationData}?${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_LAST_SIMULATION_DATA,
                    payload: response.data.Data.ImpactedMasterDataList,
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

export function getImpactedMasterData(simulationId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `simulationId=${simulationId}`
        const request = axios.get(`${API.getImpactedMasterData}?${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_IMPACTED_MASTER_DATA,
                    payload: response.data.Data.ImpactedMasterDataList,
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

export function runVerifySurfaceTreatmentSimulation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        const request = axios.post(API.draftSurfaceTreatmentSimulation, data, headers);
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

export function getVerifySurfaceTreatmentSimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getverifySurfaceTreatmentSimulationList}?simulationId=${token}`, headers);
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

export function runSimulationOnSelectedSurfaceTreatmentCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.runSimulationOnSelectedSurfaceTreatmentCosting, data, headers);
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

export function setSelectedRowCountForSimulationMessage(selectedMaster) {
    console.log(selectedMaster, 'kkkkkkkk')
    return (dispatch) => {
        dispatch({
            type: SET_SELECTED_ROW_COUNT_FOR_SIMULATION_MESSAGE,
            payload: selectedMaster,
        });
    }
}



