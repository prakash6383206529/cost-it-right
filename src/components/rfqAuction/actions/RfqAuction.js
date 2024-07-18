
import axios from 'axios';
import { API, API_FAILURE, AUCTION_LIST_BY_STATUS, config, GET_BID_DETAIL_BY_QUATATION, GET_HEADER_DETAIL_BY_QUATATION, SELECT_AUCTION_RFQ_LIST, SET_AUCTION_DATA, SET_AUCTION_DATA_BY_RFQ, SHOW_HIDE_BID_WINDOW } from '../../../config/constants';
import { apiErrors, loggedInUserId } from '../../../helper';




export function setAuctionData(data) {
    return (dispatch) => {
        dispatch({
            type: SET_AUCTION_DATA,
            payload: data || "",
        });
    }
};
export function getAuctionDataByRfq(data) {
    return (dispatch) => {
        dispatch({
            type: SET_AUCTION_DATA_BY_RFQ,
            payload: data || "",
        });
    }
}

export function saveAuctionDetails(data, callback) {
    return (dispatch) => {
        const request = axios.post('', data, config())
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}

export function auctionRfqSelectList(callback) {

    return (dispatch) => {
        const request = axios.get(`${API.auctionRfqSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: SELECT_AUCTION_RFQ_LIST, payload: response.data.SelectList })
                callback(response);
            } else {
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function checkQuatationForAuction(id, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.checkQuatationForAuction}?quotationPartId=${id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function createAuction(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAuction, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function sendCounterOffer(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.sendCounterOffer, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function auctionListByStatus(statusId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.auctionListByStatus}?statusId=${statusId}&vendorId=${''}&loggedInUserId=${loggedInUserId()}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: AUCTION_LIST_BY_STATUS,
                    payload: response.data.DataList
                })
                callback(response);
            } else {
                dispatch({
                    type: AUCTION_LIST_BY_STATUS,
                    payload: []
                })
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function auctionBidDetails(quotationAuctionId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.auctionBidDetails}?quotationAuctionId=${quotationAuctionId}&vendorId=${''}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_BID_DETAIL_BY_QUATATION,
                    payload: response.data.Data
                })
                callback(response);
            } else {
                dispatch({
                    type: GET_BID_DETAIL_BY_QUATATION,
                    payload: {}
                })
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function auctionHeaderDetails(quotationAuctionId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.auctionHeaderDetails}?quotationAuctionId=${quotationAuctionId}&vendorId=${''}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_HEADER_DETAIL_BY_QUATATION,
                    payload: response.data.Data
                })
                callback(response);
            } else {
                dispatch({
                    type: GET_HEADER_DETAIL_BY_QUATATION,
                    payload: []
                })
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function ShowBidWindow(data) {
    return (dispatch) => {
        dispatch({
            type: SHOW_HIDE_BID_WINDOW,
            payload: data || {},
        });
    }
}
export function updateShowVendorRank(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateShowVendorRank}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}
export function updateAuctionDuration(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateAuctionDuration}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}
export function closeAuction(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.closeAuction}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}
export function getLiveAndScheduledCount(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getLiveAndScheduledCount}?loggedInUserId=${loggedInUserId()}&vendorId=${''}`, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                callback(response.status)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}