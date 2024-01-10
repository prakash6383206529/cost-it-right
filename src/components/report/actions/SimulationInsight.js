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
export function getSimulationInsightReport(skip, take, isPagination, obj, callback) {

    return (dispatch) => {

        if (isPagination === true) {

            const queryParams = `isDashboard=false&logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInLevelId}&applyPagination=${isPagination}&skip=${skip}&take=${take}`
            const queryParamsSecond = `tokenNumber=${obj.ApprovalTokenNumber ?? obj.ApprovalTokenNumber}&createdDate=${obj.createdDate ?? obj.createdDate}&simulatedBy=${obj.SimulatedByName ?? obj.SimulatedByName}&costingHead=${obj.CostingHead ?? obj.CostingHead}&technologyName=${obj.TechnologyName ?? obj.TechnologyName}&masters=${obj.SimulationTechnologyHead ?? obj.SimulationTechnologyHead}&departmentName=${obj.DepartmentName ?? obj.DepartmentName}&depaetmentCode=${obj.DepartmentCode ?? obj.DepartmentCode}&initiatedBy=${obj.SenderUserName ?? obj.SenderUserName}&simulationStatus=${obj.SimulationStatus ?? obj.SimulationStatus}&effectiveDate=${obj.EffectiveDate ?? obj.EffectiveDate}&requestedOn=${obj.SentDate ?? obj.SentDate}`
            const request = axios.get(`${API.getSimualtionInsightReport}?${queryParams}&${queryParamsSecond}`, config());
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
        } else {
            dispatch({
                type: GET_SIMULATION_INSIGHT_REPORT,
                payload: []
            })
            callback([]);

        }
    };

}