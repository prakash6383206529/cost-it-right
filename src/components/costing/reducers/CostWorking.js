import {
    API_REQUEST,
    API_FAILURE,
    GET_WEIGHT_CALC_INFO_SUCCESS,
    CREATE_WEIGHT_CALC_COSTING_SUCCESS,
    UPDATE_WEIGHT_CALC_SUCCESS,
    GET_WEIGHT_CALC_LAYOUT_SUCCESS,
    GET_COSTING_BY_SUPPLIER_SUCCESS,
    GET_RM_LIST_BY_SUPPLIER_SUCCESS,
    ADD_RAW_MATERIAL_COSTING_SUCCESS,
    GET_COSTING_DATA_SUCCESS,
    UPDATE_COSTING_RM_SUCCESS,
    GET_BOP_LIST_SUCCESS,
    ADD_BOP_COSTING_SUCCESS,
    GET_OTHER_OPERATION_LIST_SUCCESS,
    ADD_OTHER_OPERATION_COSTING_SUCCESS,
    ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
    GET_MHR_LIST_SUCCESS,
    ADD_MHR_FOR_PROCESS_GRID_DATA,
    GET_PROCESSES_LIST_SUCCESS,
    SAVE_PROCESS_COSTING_SUCCESS,
    GET_OTHER_OPERATION_SELECT_LIST_SUCCESS,
    SAVE_OTHER_OPERATION_COSTING_SUCCESS,
    ADD_PROCESS_COSTING_SUCCESS,
    SET_COSTING_DETAIL_ROW_DATA,
    UPDATE_COSTING_OTHER_OPERATION_SUCCESS,
    SAVE_COSTING_AS_DRAFT_SUCCESS,
    ADD_BOP_GRID_COSTING_SUCCESS,
    GET_RAW_MATERIAL_CALCI_INFO,
    FERROUS_CALCULATOR_RESET,
    RUBBER_CALCULATOR_RESET,
    GET_CARRIER_TYPE_LIST_SUCCESS,
    SET_PACKAGING_CALCULATOR_AVAILABLE,
    SET_FREIGHT_CALCULATOR_AVAILABLE,
    GET_TYPE_OF_COST_SUCCESS,
    GET_CALCULATION_CRITERIA_LIST_SUCCESS
} from '../../../config/constants';

const initialState = {
    costingGridOtherOperationData: [],
    addMHRForProcessGrid: [],
    packagingCalculatorAvailable: {},
    freightCalculatorAvailable: {},
};

export default function CostWorkingReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_WEIGHT_CALC_INFO_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                weightCostingInfo: action.payload
            };
        case CREATE_WEIGHT_CALC_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_WEIGHT_CALC_LAYOUT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                weightLayoutType: action.payload
            };
        case GET_COSTING_BY_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                activeCostingListData: action.payload
            };
        case GET_RM_LIST_BY_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmListData: action.payload
            };
        case GET_BOP_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                bopListData: action.payload
            };
        case GET_OTHER_OPERATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                otherOperationListData: action.payload
            };
        case ADD_RAW_MATERIAL_COSTING_SUCCESS:
            const data = state.getCostingDetailData;

            if (data) {
                //data.AssemblyPartDetail[action.selectedIndex].RawMaterialDetails[0] = action.payload;
                data.AssemblyPartDetail.RawMaterialDetails[0] = action.payload;
            }

            return {
                ...state,
                loading: false,
                error: true,
                getCostingDetailData: data
            };
        case ADD_BOP_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                costingGridBOPData: action.payload
            };
        case ADD_OTHER_OPERATION_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                costingGridOtherOperationData: action.payload
            };
        case ADD_UNIT_OTHER_OPERATION_COSTING_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                costingGridOtherOperationData: action.payload
            };
        case GET_COSTING_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                getCostingDetailData: action.payload
            };
        case UPDATE_COSTING_RM_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case UPDATE_WEIGHT_CALC_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_MHR_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                getMHRCostingListData: action.payload
            };
        case ADD_MHR_FOR_PROCESS_GRID_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                addMHRForProcessGrid: action.payload
            };
        case GET_PROCESSES_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                processSelectList: action.payload
            };
        case SAVE_PROCESS_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case ADD_PROCESS_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                costingGridProcessData: action.payload
            };
        case ADD_BOP_GRID_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                BOPGridData: action.payload
            };
        case GET_OTHER_OPERATION_SELECT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                otherOpsSelectList: action.payload
            };
        case SAVE_OTHER_OPERATION_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case SET_COSTING_DETAIL_ROW_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                getCostingDetailData: action.payload
            };
        case UPDATE_COSTING_OTHER_OPERATION_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case SAVE_COSTING_AS_DRAFT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_RAW_MATERIAL_CALCI_INFO:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialCalciInfo: action.payload
            }
        case FERROUS_CALCULATOR_RESET:
            return {
                ...state,
                ferrousCalculatorReset: action.payload
            }
        case RUBBER_CALCULATOR_RESET:
            return {
                ...state,
                rubberCalculatorReset: action.payload
            }
        case GET_CARRIER_TYPE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                carrierTypeList: action.payload
            }
        case SET_PACKAGING_CALCULATOR_AVAILABLE:
            return {
                ...state,
                loading: false,
                error: true,
                packagingCalculatorAvailable: {...state.packagingCalculatorAvailable, ...action.payload}
            }
        case SET_FREIGHT_CALCULATOR_AVAILABLE:
            return {
                ...state,
                loading: false,
                error: true,
                freightCalculatorAvailable: action.payload
            }
        case GET_TYPE_OF_COST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                typeOfCostList: action.payload
            }
        case GET_CALCULATION_CRITERIA_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                calculationCriteriaList: action.payload
            }
        default:
            return state;
    }
}
