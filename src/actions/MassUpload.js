import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SEND_FOR_APPROVAL_SUCCESS,
} from '../config/constants';
import { apiErrors } from '../helper/util';
import { MESSAGES } from '../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};


/**
 * @method supplierMassUpload
 * @description Supplier Mass Upload
 */
export function supplierMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.supplierMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method plantMassUpload
 * @description Plants Mass Upload
 */
export function plantMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.plantMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method BOPMassUpload
 * @description BOP Mass Upload
 */
export function BOPMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.BOPMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method ProcessesMassUpload
 * @description Processes Mass Upload
 */
export function ProcessesMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.ProcessesMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method MachineClassMassUpload
 * @description MachineClassMassUpload Mass Upload
 */
export function MachineClassMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.MachineClassMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method LabourMassUpload
 * @description Labour Mass Upload
 */
export function LabourMassUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.LabourMassUpload, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
