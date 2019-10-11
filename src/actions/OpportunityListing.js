import axios from 'axios';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { formatGetOpportunitiesResult } from '../helper/ApiResponse';
import {
    API,
    OPPORTUNITIES_LISTING_REQUEST,
    OPPORTUNITIES_LISTING_FAILURE,
    GET_OPPORTUNITIES_SUCCESS,
    UPDATE_OPPORTUNITY_FILTER,
    CHANGE_CATEGORY_TYPE,
    OPPORTUNITY_BOOKMARK_REQUEST,
    OPPORTUNITY_BOOKMARK_SUCCESS,
    OPPORTUNITY_BOOKMARK_FAIL,
    SHOW_TAB_BAR,
    SCREEN_NAME_SAVE_REQUEST,
    UPDATE_BOOKMARK_FLAG,
    MAP_VIEW_HANDLER
} from '../config/constants';
import { toastr } from 'react-redux-toastr'
import { reactLocalStorage } from 'reactjs-localstorage';

// const headers = {
//     'Content-Type': 'application/json',
// };

// let multipartHeaders = { 
//     'Content-Type': 'multipart/form-data;' 
// };
/**
 * @method getOpportunitiesAPI
 * @description get all opportunities 
 */

export function getOpportunitiesAPI(data, loadMore = false, categoryType, callback) {
    //console.log("ACTION categoryType=>", categoryType);
    // console.log('getOpportunitiesAPI data', data, categoryType);
    //const userObj = reactLocalStorage.getObject('userResponse');
    return (dispatch) => {
        dispatch({ type: OPPORTUNITIES_LISTING_REQUEST });
        const request = axios.get(`${API.getOpportunities}?${data}`);
        request.then((response) => {
        //console.log('response', response);
            if (response.status === 200) {
            
                const opportunityFormatedData = formatGetOpportunitiesResult(response.data);
                //console.log("getOpportunitiesAPI=>" , opportunityFormatedData);
                dispatch({
                    type: GET_OPPORTUNITIES_SUCCESS,
                    payload: opportunityFormatedData,
                    loadMore,
                    categoryType,
                });
                dispatch({
                    type: CHANGE_CATEGORY_TYPE,
                    payload: categoryType,
                });
            } else {
                toastr.success(MESSAGES.SOME_ERROR, 'danger');
            }
            callback(response);
        }).catch((error) => {
             console.log("ACTION getOpportunitiesAPI error", error);
             dispatch({ type: OPPORTUNITIES_LISTING_FAILURE });
             callback(error);
             apiErrors(error);
        });
    };
}

/**
 * @method uploadOpportunityLogoImageAPI
 * @description upsed to upload image for opportunity logo
 * 
 */

export function saveOpportunityAsBookMark(requestData, matchedOpportunityList, categoryType, callback) {
   
    const userObj = reactLocalStorage.getObject('userResponse');
    // const headers = {
    //     'Accept': 'application/json',
    //     'Authorization': `bearer ${userObj.token}`
    // }
    return (dispatch) => {
        dispatch({ type: OPPORTUNITY_BOOKMARK_REQUEST });
        axios.post(API.bookmarkCastingCall, requestData)
            .then((response) => {
                dispatch({ type: OPPORTUNITY_BOOKMARK_SUCCESS });
                callback(response);
                console.log('matchedOpportunityList',categoryType)
                if (categoryType == 1) {
                    updateOpportunityBookMarkFlag(dispatch, matchedOpportunityList, requestData.castingCallId, () => {
                        // dispatch({ type: OPPORTUNITY_BOOKMARK_SUCCESS });
                        // callback(response);
                    });
                } else {
                    dispatch({ type: OPPORTUNITY_BOOKMARK_SUCCESS });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: OPPORTUNITY_BOOKMARK_FAIL });
                console.log('err bokk', error)
                apiErrors(error);
            });
    };
}



/**
 * @method updateOpportunityBookMarkFlag
 * @description upsed to update 
 * 
 */

export function updateOpportunityBookMarkFlag(dispatch, opportunityData, opportunityId, cb) {
    const matchedOpportunityList = opportunityData;
    matchedOpportunityList.map(item => {
        if (item._id === opportunityId) {
            if (item.bookMarkFlag === true) {
                item.bookMarkFlag = false;
            } else {
                item.bookMarkFlag = true;
            }
        }
        return item;
    });
    dispatch({ type: UPDATE_BOOKMARK_FLAG, payload: matchedOpportunityList });
    cb();
}

export function updateOpportunityListFilter(opportunityFilterData) {
    return (dispatch) => {
        dispatch({ type: OPPORTUNITIES_LISTING_REQUEST });
        dispatch({ type: UPDATE_OPPORTUNITY_FILTER, payload: opportunityFilterData });
    };
}

export function changeCategoryType(categoryTypeData) {
    return (dispatch) => {
        const filterData = {
            name: '',
            opportunityType: '',
            opportunitySubType: '',
            gender: '',
            location: '',
            ageRange: [0, 100],
            unionStatus: '',
            selectedCompensationItems: [],
            performance: [],
            languages: [],
            accents: [],
            ethnicAppearance: [],
            disabilities: [],
            hairColorType: [],
            eyesColorType: [],
        };
        dispatch({ type: CHANGE_CATEGORY_TYPE, payload: categoryTypeData });
        // dispatch({ type: UPDATE_OPPORTUNITY_FILTER, payload: filterData });
    };
}

export function displayTabBar(showTabBar) {
    return (dispatch) => {
        dispatch({ type: SHOW_TAB_BAR, payload: showTabBar });
    };
}

/**
 * @method screenName
 * @description used to store screen name for routing
 * 
 */

export function screenNameAPI(requestData) {
    return (dispatch) => {
        dispatch({ type: SCREEN_NAME_SAVE_REQUEST, payload: requestData });
    };
}

export function mapViewHandling(mapFlag) {
    return (dispatch) => {
        dispatch({ type: MAP_VIEW_HANDLER, payload: mapFlag });
    };
}