import {
    API_REQUEST,
    API_FAILURE,
    EXCHANGE_RATE_DATALIST,
    GET_EXCHANGE_RATE_DATA,
    GET_CURRENCY_SELECTLIST_BY,
} from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';

const initialState = {

};

export default function ExchangeRateReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false
            };
        case EXCHANGE_RATE_DATALIST:
            let arr = []
            arr = action.payload && action.payload.filter((el) => {
                el.BankRate = checkForDecimalAndNull(el.BankRate, getConfigurationKey()?.NoOfDecimalForPrice)
                el.CustomRate = checkForDecimalAndNull(el.CustomRate, getConfigurationKey()?.NoOfDecimalForPrice)
                return el
            })
            return {
                ...state,
                loading: false,
                exchangeRateDataList: arr
            };
        case GET_EXCHANGE_RATE_DATA:
            return {
                ...state,
                loading: false,
                exchangeRateData: action.payload
            };
        case GET_CURRENCY_SELECTLIST_BY:
            return {
                ...state,
                loading: false,
                currencySelectList: action.payload
            };
        default:
            return state;
    }
}