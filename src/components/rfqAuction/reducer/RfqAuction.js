import { SET_AUCTION_DATA, SET_AUCTION_DATA_BY_RFQ } from "../../../config/constants";

const initialState = {
    auctionDetailData: [],
    auctionDataByRfq: []
};

export default function RfqAuction(state = initialState, action) {
    switch (action.type) {
        case SET_AUCTION_DATA:
            return {
                ...state,
                loading: true,
                auctionDetailData: action.payload
            };

        case SET_AUCTION_DATA_BY_RFQ:
            return {
                ...state,
                loading: true,
                auctionDataByRfq: action.payload
            };

        default:
            return state;
    }
}
