import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_BULKUPLOAD_COSTING_LIST,
    GET_SIMULATION_HISTORY
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function getSimulationHistory(callback) {
    let JSON = {
        status: 200,
        data: {
            DataList: [
                {
                    TokenNumber: 1234,
                    CostingStatus: 'PendingForApproval',
                    DisplayCostingStatus: 'Pending For Approval',
                    CostingHead: 'ZBC',
                    Technology: 'Sheet Metal',
                    VendorName: '-',
                    ImpactCosting: 5,
                    ImpactParts: 2,
                    SimulatedBy: 'Ram Sharma',
                    SimulatedOn: '25/05/2020 12:00PM',
                    ApprovedBy: 'Kamal Saxena',
                    ApprovedOn: '20/05/2020 12:00PM'
                },
                {
                    TokenNumber: 1567,
                    CostingStatus: 'Approved',
                    DisplayCostingStatus: 'Approved',
                    CostingHead: 'VBC',
                    Technology: 'Plastic',
                    VendorName: 'Vivo-V1',
                    ImpactCosting: 6,
                    ImpactParts: 2,
                    SimulatedBy: 'Mahak Rawat',
                    SimulatedOn: '25/05/2020 12:00PM',
                    ApprovedBy: 'Kamal Saxena',
                    ApprovedOn: '20/05/2020 12:00PM'
                },
                {
                    TokenNumber: 1234,
                    CostingStatus: 'History',
                    DisplayCostingStatus: 'History',
                    CostingHead: 'VBC',
                    Technology: 'Forging',
                    VendorName: 'AP-Automobile',
                    ImpactCosting: 5,
                    ImpactParts: 1,
                    SimulatedBy: 'Shayam Sharms',
                    SimulatedOn: '25/05/2020 12:00PM',
                    ApprovedBy: 'Harish Patell',
                    ApprovedOn: '20/05/2020 12:00PM'
                },
            ],
        },
    }


    return (dispatch) => {

        dispatch({
            type: GET_SIMULATION_HISTORY,
            payload: JSON.data.DataList,
        });
        // callback(JSON);
        // callback(JSON)
        //   dispatch({ type: API_REQUEST });
        //   const request = axios.get(`${API.getSimulationHistory}`, headers);
        //   request.then((response) => {
        //     console.log(response, "REQUEST");
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