import { AUCTION_LIST_BY_STATUS, GET_BID_DETAIL_BY_QUATATION, GET_HEADER_DETAIL_BY_QUATATION, SELECT_AUCTION_RFQ_LIST, SET_AUCTION_DATA, SET_AUCTION_DATA_BY_RFQ, SHOW_HIDE_BID_WINDOW } from "../../../config/constants";

const initialState = {
    auctionDetailData: [],
    auctionDataByRfq: [],
    RFQSelectlist: [],
    AuctionList: [],
    showHideBidWindow: {
        showBidWindow: false,
        QuotationAuctionId: '',
        AuctionStatusId: 37
    },
    bidDetails: {},
    auctionHeaderData: {}
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
        case SELECT_AUCTION_RFQ_LIST:
            return {
                ...state,
                loading: true,
                RFQSelectlist: action.payload
            };
        case AUCTION_LIST_BY_STATUS:
            return {
                ...state,
                loading: true,
                AuctionList: action.payload
            };
        case SHOW_HIDE_BID_WINDOW:
            return {
                ...state,
                loading: true,
                showHideBidWindow: action.payload
            };
        case GET_BID_DETAIL_BY_QUATATION:
            return {
                ...state,
                loading: true,
                bidDetails: action.payload
            };
        case GET_HEADER_DETAIL_BY_QUATATION:
            return {
                ...state,
                loading: true,
                auctionHeaderData: action.payload
            };

        default:
            return state;
    }
}
