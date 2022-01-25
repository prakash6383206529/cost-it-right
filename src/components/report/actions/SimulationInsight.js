import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_REPORT_LIST, config, EMPTY_GUID, GET_SIMULATION_INSIGHT_REPORT
} from '../../../config/constants';
import { loggedInUserId, userDetails } from '../../../helper';


const headers = config

/**
 * @method getRMImportDataList
 * @description Used to get RM Import Datalist
 */
 export function getSimulationInsightReport(callback) {

    return (dispatch) => {
        
            const queryParams = `isDashboard=false&logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInLevelId}`

            const request = axios.get(`${API.getSimualtionInsightReport}?${queryParams}`, headers);
            request.then((response) => {
                if (response.data.Result || response.status === 204) {
                    dispatch({
                        type: GET_SIMULATION_INSIGHT_REPORT,
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