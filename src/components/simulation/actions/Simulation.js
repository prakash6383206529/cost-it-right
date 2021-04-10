import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SELECTLIST_MASTERS
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

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
                {
                    Disabled: false,
                    Group: null,
                    Selected: false,
                    Text: "BOP (Domestic)",
                    Value: "abddb973-b5ea-42ad-b99a-e60674c40e28"
                },
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