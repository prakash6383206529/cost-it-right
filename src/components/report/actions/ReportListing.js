import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_REPORT_LIST, config, EMPTY_GUID
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'
import { userDepartmetList } from '../../../helper';

const headers = config

// export function getReportListing(data, callback) {
//     return (dispatch) => {
//         dispatch({ type: API_REQUEST });
//         const queryParameter = `logged_in_user_id=${data.loggedUser}&logged_in_user_level_id=${data.logged_in_user_level_id}&part_number=${data.partNo}&created_by=${data.createdBy}&requested_by=${data.requestedBy}&status=${data.status}&type_of_costing=''`
//         const request = axios.get(`${API.getReportListing}/${queryParameter}`, headers)
//         console.log(request);
//         request.then((response) => {
//             alert(response.data);
//             console.log(response.data);
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
            const departmentQueryParams = `&departmentCode=${userDepartmetList()}`
            const queryParams = `costingNumber=${data.costingNumber}&toDate=${data.toDate}&fromDate=${data.fromDate}&statusId=${data.statusId}&technologyId=${data.technologyId}&plantCode=${data.plantCode}&vendorCode=${data.vendorCode}&userId=${EMPTY_GUID}&isSortByOrderAsc=${data.isSortByOrderAsc}`
            const queryParamsSecond = `&isApplyPagination=${true}&skip=${index}&take=${take}`

            const request = axios.get(`${API.getReportListing}?${queryParams}${queryParamsSecond}${departmentQueryParams}`, headers);
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