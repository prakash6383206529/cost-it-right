import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SIMULATION_HISTORY,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';


export function getSimulationHistory(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSimulationHistory}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SIMULATION_HISTORY,
                    payload: response.data.DataList,
                });
                // dispatch({
                // type: GET_BULKUPLOAD_COSTING_LIST,
                // payload: response.data.DataList,
                //});
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}