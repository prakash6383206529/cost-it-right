import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    config,
    GET_COMMODITY_SELECTLIST_BY_TYPE,
    GET_COMMODITYNAME_SELECTLIST_BY_TYPE,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE
}
    from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

export function getCommoditySelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommoditySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITY_SELECTLIST_BY_TYPE,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}

export function getCommodityNameSelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityNameSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITYNAME_SELECTLIST_BY_TYPE,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}

export function getCommodityCustomNameSelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityCustomNameSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}
