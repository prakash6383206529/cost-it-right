import {
    API_REQUEST,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAILURE,
    GET_UNIT_PART_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS,
    GET_PART_SELECTLIST_SUCCESS,
    GET_ASSEMBLY_PART_SELECTLIST,
    GET_COMPONENT_PART_SELECTLIST,
    GET_BOUGHTOUT_PART_SELECTLIST,
    GET_DRAWER_CHILD_PART_DATA,
    SET_ACTUAL_BOM_DATA,
    GET_PRODUCT_DATA_LIST,
    GET_PRODUCT_UNIT_DATA,
    PRODUCT_GROUPCODE_SELECTLIST
} from '../../../config/constants';

const initialState = {

};

export default function partReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_PART_REQUEST:
            return {
                ...state,
                loading: false
            };
        case GET_UOM_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                uniOfMeasurementList: action.payload
            };
        case GET_MATERIAL_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                materialTypeList: action.payload
            };

        case CREATE_PART_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_PART_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_ALL_PARTS_SUCCESS: {
            return {
                ...state,
                partsListing: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_PART_SELECTLIST_SUCCESS: {
            return {
                ...state,
                partSelectList: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_ALL_NEW_PARTS_SUCCESS: {
            return {
                ...state,
                newPartsListing: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_UNIT_PART_DATA_SUCCESS: {
            return {
                ...state,
                partData: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_DRAWER_CHILD_PART_DATA: {
            return {
                ...state,
                DrawerPartData: action.payload,
                loading: false,
                error: false
            };
        }
        case GET_ASSEMBLY_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                assemblyPartSelectList: action.payload,
            };
        }
        case GET_COMPONENT_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                componentPartSelectList: action.payload,
            };
        }
        case GET_BOUGHTOUT_PART_SELECTLIST: {
            return {
                ...state,
                loading: false,
                error: false,
                boughtOutPartSelectList: action.payload,
            };
        }
        case SET_ACTUAL_BOM_DATA: {
            return {
                ...state,
                loading: false,
                error: false,
                actualBOMTreeData: action.payload,
            };
        }
        case GET_ALL_PARTS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PRODUCT_DATA_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                productDataList: action.payload
            }
        case GET_PRODUCT_UNIT_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                productData: action.payload
            }
        case PRODUCT_GROUPCODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                productGroupSelectList: action.payload
            }
        default:
            return state;
    }
}
