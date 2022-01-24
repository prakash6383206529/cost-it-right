import {
    API_REQUEST,
    API_FAILURE,
    CREATE_BOP_SUCCESS,
    CREATE_BOP_FAILURE,
    GET_BOP_SUCCESS,
    GET_BOP_FAILURE,
    GET_BOP_DOMESTIC_DATA_SUCCESS,
    GET_BOP_IMPORT_DATA_SUCCESS,
    UPDATE_BOP_SUCCESS,
    GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
    GET_ALL_VENDOR_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_BY_VENDOR,
    GET_BOP_SOB_VENDOR_DATA_SUCCESS,
    GET_INITIAL_SOB_VENDORS_SUCCESS,
    GET_BOP_DOMESTIC_DATA_LIST,
    GET_BOP_IMPORT_DATA_LIST,
    GET_SOB_LISTING,
    GET_BOP_APPROVAL_LIST
} from '../../../config/constants';

const initialState = {

};

export default function BOPReducer(state = initialState, action) {
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
        case CREATE_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_BOP_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                BOPListing: action.payload
            };
        case GET_BOP_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_BOP_DOMESTIC_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                bopData: action.payload
            };
        case GET_BOP_IMPORT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                bopData: action.payload
            };
        case UPDATE_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_BOP_CATEGORY_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                bopCategorySelectList: action.payload
            };
        case GET_ALL_VENDOR_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                vendorAllSelectList: action.payload
            };
        case GET_PLANT_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                plantSelectList: action.payload
            };
        case GET_PLANT_SELECTLIST_BY_VENDOR:
            return {
                ...state,
                loading: false,
                plantSelectList: action.payload
            };
        case GET_BOP_SOB_VENDOR_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                VendorsBOPSOBData: action.payload
            };
        case GET_INITIAL_SOB_VENDORS_SUCCESS:
            return {
                ...state,
                loading: false,
                BOPVendorDataList: action.payload
            };
        case GET_BOP_DOMESTIC_DATA_LIST:

            let arr = []
            arr = action.payload && action.payload.filter((el, i) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: '2021-03-01T00:00:00' BUT WE WERE RECEIVING DATE IN 01/03/2021
                el.EffectiveDateNew = el.EffectiveDate                                 //  WHICH WAS CAUSING DATE FILTER TO NOT WORK PROPERLY IN AG GRID
                return true
            })
            return {
                ...state,
                loading: false,
                bopDomesticList: arr
            }
        case GET_BOP_IMPORT_DATA_LIST:

            let arrImport = []
            arrImport = action.payload && action.payload.filter((el, i) => {                 //CREATED NEW PARAMETER EFFECTIVEDATENEW IN SAME OBJECT AS WE WANTED DATE IN FORMAT: '2021-03-01T00:00:00' BUT WE WERE RECEIVING DATE IN 01/03/2021
                el.EffectiveDateNew = el.EffectiveDate                                 //  WHICH WAS CAUSING DATE FILTER TO NOT WORK PROPERLY IN AG GRID
                return true
            })

            return {
                ...state,
                loading: false,
                bopImportList: arrImport
            }
        case GET_SOB_LISTING:
            return {
                ...state,
                loading: false,
                bopSobList: action.payload
            }
        case GET_BOP_APPROVAL_LIST:
            return {

                ...state,
                loading: false,
                BopApprovalList: action.payload
            }
        default:
            return state;
    }
}
