
import axios from 'axios';
import { SET_AUCTION_DATA, SET_AUCTION_DATA_BY_RFQ } from '../../../config/constants';




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
