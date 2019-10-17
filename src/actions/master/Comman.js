import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    FETCH_MATER_DATA_FAILURE,
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import {
    MESSAGES
} from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function fetchMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getAllMasterUOMAPI, headers);
        const API2 = axios.get(API.getMaterialType, headers);
        Promise.all([API1, API2])
            .then((response) => {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });
                
                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response[1].data.SelectList,
                });  
            }).catch((error) => {
                dispatch({
                    type: FETCH_MATER_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}

