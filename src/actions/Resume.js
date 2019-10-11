import axios from 'axios';
import { toastr } from "react-redux-toastr";
import { reactLocalStorage } from 'reactjs-localstorage';
import { MESSAGES } from '../config/message';
import { API } from '../config/constants';
import { apiErrors } from '../helper/util';
import {
    POST_RESUME_DETAILS,
    CREATE_RESUME__SUCCESS,
    CREATE_RESUME_API_REQUEST,
    CREATE_RESUME_API_FAILURE,
    GET_INITIAL_RESUME_DATA
} from '../config/constants';

/**
 * @method createResumeBuilder
 * @description used to create resume 
 */
export function createResumeBuilder(requestData, callback) {
    console.log('createResume rquestData => ', requestData);
    return (dispatch) => {
        dispatch({ type: CREATE_RESUME_API_REQUEST });
        axios.post(API.createResumeAPI, requestData )
            .then((response) => {
                console.log('create resume response => ', response);
                dispatch({ type: CREATE_RESUME__SUCCESS });
                callback(response);
            })
            .catch((error) => {
                console.log('create resume error: ', error);
                dispatch({ type: CREATE_RESUME_API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method updateResumeData
 * @description Used to update store data after saveing opportunity
 */

export function updateResumeData(resumeData) {
    console.log('Action resumeData: ', resumeData);
    return (dispatch) => {
        dispatch({ type: POST_RESUME_DETAILS, payload: resumeData });
    };
}

/**
 * @method getInitialResumeData
 * @description Used to update store data after saveing opportunity
 */

export function getInitialResumeData(resumeFilter) {
    console.log('Action resumeFilter: ', resumeFilter);
    return (dispatch) => {
        dispatch({ type: GET_INITIAL_RESUME_DATA, payload: resumeFilter });
    };
}