import {
    API_REQUEST,
    CREATE_FUEL_SUCCESS,
    CREATE_FUEL_DETAIL_FAILURE,
    CREATE_FUEL_DETAIL_SUCCESS,
    CREATE_FUEL_FAILURE,
    GET_FUEL_DATALIST_SUCCESS,
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS,
    GET_FUEL_BY_PLANT,
    GET_STATELIST_BY_FUEL,
    GET_FULELIST_BY_STATE,
    GET_PLANT_SELECTLIST_BY_STATE,
    GET_ZBC_PLANT_SELECTLIST,
    GET_STATE_SELECTLIST,
    GET_ZBC_POWER_DATA_SUCCESS,
    GET_POWER_DATA_LIST,
    GET_POWER_VENDOR_DATA_LIST,
    GET_PLANT_CURRENCY_BY_PLANT_IDS
} from '../../../config/constants';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';

const initialState = {

};

export default function fuelReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_FUEL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_FUEL_DETAIL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        case CREATE_FUEL_DETAIL_FAILURE:
            return {
                ...state,
                loading: false,
            };
        case CREATE_FUEL_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case GET_FUEL_DATALIST_SUCCESS: {
            let arr = []
            arr = action.payload && action.payload.filter((el) => {

                el.Rate = checkForDecimalAndNull(el.Rate, getConfigurationKey()?.NoOfDecimalForPrice)
                el.PlantWithCode = `${el.PlantName ? el.PlantName : ''}${el.PlantCode ? ` (${el.PlantCode})` : "-"}`
                el.VendorWithCode = `${el.VendorName ? el.VendorName : ''}${el.VendorCode ? ` (${el.VendorCode})` : "-"}`
                el.CustomerWithCode = `${el.CustomerName ? el.CustomerName : ''}${el.CustomerCode ? ` (${el.CustomerCode})` : "-"}`

                return el
            })

            return {
                ...state,
                loading: false,
                error: false,
                fuelDataList: arr
            };
        }
        case GET_FUEL_UNIT_DATA_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelUnitData: action.payload
            };
        }
        case GET_FUEL_DETAIL_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelDetailList: action.payload
            };
        }
        case GET_FUEL_BY_PLANT: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelDataByPlant: action.payload
            };
        }
        case GET_STATELIST_BY_FUEL: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelComboSelectList: { ...state.fuelComboSelectList, States: action.payload }
            };
        }
        case GET_FULELIST_BY_STATE: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelComboSelectList: { ...state.fuelComboSelectList, Fuels: action.payload }
            };
        }
        case GET_PLANT_SELECTLIST_BY_STATE: {
            return {
                ...state,
                loading: false,
                error: false,
                plantSelectList: action.payload,
            };
        }
        case GET_ZBC_PLANT_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                plantSelectList: action.payload,
            };
        }
        case GET_STATE_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                stateSelectList: action.payload,
            };
        }
        case GET_ZBC_POWER_DATA_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                powerData: action.payload,
            };
        }
        case GET_FUEL_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_POWER_DATA_LIST:
            let arr = []
            arr = action.payload && action.payload.filter((el) => {
                el.NetPowerCostPerUnit = checkForDecimalAndNull(el.NetPowerCostPerUnit, getConfigurationKey()?.NoOfDecimalForPrice)
                el.PlantWithCode = `${el.PlantName ? el.PlantName : ''}${el.PlantCode ? ` (${el.PlantCode})` : "-"}`
                el.VendorWithCode = `${el.VendorName ? el.VendorName : ''}${el.VendorCode ? ` (${el.VendorCode})` : "-"}`
                el.CustomerWithCode = `${el.CustomerName ? el.CustomerName : ''}${el.CustomerCode ? ` (${el.CustomerCode})` : "-"}`
                return el
            })
            return {
                ...state,
                loading: false,
                error: false,
                powerDataList: arr
            }
        case GET_POWER_VENDOR_DATA_LIST:
            return {
                ...state,
                loading: false,
                error: false,
                vendorPowerDataList: action.payload
            }
        case GET_PLANT_CURRENCY_BY_PLANT_IDS:
            return {
                ...state,
                loading: false,
                error: false,
                plantCurrencyList: action.payload
            }
        default:
            return state;
    }
}
