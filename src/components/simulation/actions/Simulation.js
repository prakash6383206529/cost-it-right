import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SELECTLIST_MASTERS,
    GET_VERIFY_SIMULATION_LIST,
    GET_COSTING_SIMULATION_LIST,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = config

export function getSelectListOfMasters(callback) {
    let JSON = {
        status: 200,
        data: {
            SelectList: [

                {
                    Disabled: false,
                    Group: null,
                    Selected: false,
                    Text: "Raw Material(Domestic)",
                    Value: "f9e158eb-f506-4f63-bc56-42cae12ec6bd"
                },
                {
                    Disabled: false,
                    Group: null,
                    Selected: false,
                    Text: "Raw Material(Import)",
                    Value: "0d635de3-8c83-493d-b446-8b3e1f6ed4d0"
                },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "BOP (Domestic)",
                //     Value: "abddb973-b5ea-42ad-b99a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "BOP (Import)",
                //     Value: "abddb973-b5ea-42ad-b99a-e60673c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Process",
                //     Value: "abddb972-b5ea-42ad-b99a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Operation",
                //     Value: "abbdb973-b5ea-42ad-b99a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: " Surface Treatment",
                //     Value: "abddb973-b5ea-42ad-b99a-e61674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Overhead",
                //     Value: "bbddb973-b5ea-42ad-b99a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Profits",
                //     Value: "abdda873-b5ea-42ad-b99a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "ICC",
                //     Value: "abdda873-b5ea-42ad-b1000a-e60674c40e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Payment Terms",
                //     Value: "abdda873-b5ea-42ad-b99a-e60674c500e28"
                // },
                // {
                //     Disabled: false,
                //     Group: null,
                //     Selected: false,
                //     Text: "Freight",
                //     Value: "abdda873-b5ea-42dd-b99a-e60674c40e28"
                // },
            ],
        },
    }


    return (dispatch) => {

        dispatch({
            type: GET_SELECTLIST_MASTERS,
            payload: JSON.data.SelectList,
        });
        // callback(JSON);
        // callback(JSON)
        //   dispatch({ type: API_REQUEST });
        //   const request = axios.get(`${API.getSelectListOfSimulationMaster}`, headers);
        //   request.then((response) => {
        //     
        //     if (response.data.Result) {
        //       dispatch({
        //         type: GET_BULKUPLOAD_COSTING_LIST,
        //         payload: response.data.DataList,
        //       });
        //       callback(response);
        //     }
        //   }).catch((error) => {
        //     dispatch({ type: API_FAILURE });
        //     callback(error);
        //     apiErrors(error);
        //   });
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

export function getVerifySimulationList(token, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getVerifySimulationList}/${token}`, headers);
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

export function getCostingSimulationList(token, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCostingSimulationList}/${token}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COSTING_SIMULATION_LIST,
                    payload: response.data.Data.SimulatedCosting
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