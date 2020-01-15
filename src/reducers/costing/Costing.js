import {
    API_REQUEST,
    API_FAILURE,
    GET_PLANT_COMBO_SUCCESS,
    GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
    CREATE_PART_WITH_SUPPLIER_SUCCESS,
    GET_COSTING_BY_COSTINGID,
    GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
    SET_CED_ROW_DATA_TO_COST_SUMMARY,
    SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY,
    SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
    GET_FREIGHT_HEAD_SUCCESS,
    GET_FREIGHT_AMOUNT_DATA_SUCCESS,
    EMPTY_COSTING_DATA,
} from '../../config/constants';

const initialState = {
    costingData: {
        // supplierOne: {},
        // supplierTwo: {},
        // supplierThree: {},
    }
};

export default function costingReducer(state = initialState, action) {
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
        case GET_PLANT_COMBO_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                plantComboDetail: action.payload
            };
        case GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                existingSupplierDetail: action.payload
            };
        case CREATE_PART_WITH_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                addedSupplier: action.payload
            };
        case GET_COSTING_BY_COSTINGID:
            let data1 = state.costingData[action.supplier];
            return {
                ...state,
                loading: false,
                error: true,
                costingData: { ...data1, [action.supplier]: { CostingDetail: action.payload } }
            };
        // return {
        //     ...state,
        //     loading: false,
        //     error: true,
        //     costingData: { ...state.costingData, [action.supplier]: action.payload }
        // };
        case GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                otherOperationList: action.payload
            };
        case SET_CED_ROW_DATA_TO_COST_SUMMARY:
            let CEDRowData = action.payload;
            let data = state.costingData[action.supplierColumn];
            data = {
                ...data,
                CostingDetail: {
                    ...data.CostingDetail,
                    CEDOperationId: CEDRowData.CEDOperationId,
                    CEDOperationName: CEDRowData.OperationName,
                    CEDOperationRate: CEDRowData.OperationRate,
                    TransportationOperationCost: null,
                    TransportationOperationRate: CEDRowData.TrasnportationRate,
                    CEDOtherOperationDetails: CEDRowData,
                }
            }

            return {
                ...state,
                loading: false,
                error: true,
                costingData: { ...state.costingData, [action.supplierColumn]: data }
            };
        case SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY:
            let FreightRowData = action.payload;
            let Olddata = state.costingData[action.supplierColumn];
            //console.log("Olddata 111>>>", FreightRowData, Olddata)
            Olddata = {
                ...Olddata,
                CostingDetail: {
                    ...Olddata.CostingDetail,
                    AdditionalFreightId: FreightRowData.FreightId,
                    NetAdditionalFreightCost: FreightRowData.NetAdditionalFreightCost,
                }
            }
            //console.log("Olddata 222>>>", Olddata)

            return {
                ...state,
                loading: false,
                error: true,
                costingData: { ...state.costingData, [action.supplierColumn]: Olddata }
            };

        case SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY:
            let InterestRowData = action.payload;
            let InventoryOlddata = state.costingData[action.supplierColumn];
            //console.log("Olddata 111>>>", InterestRowData, InventoryOlddata)
            InventoryOlddata = {
                ...InventoryOlddata,
                CostingDetail: {
                    ...InventoryOlddata.CostingDetail,
                    RMICCPercentage: InterestRowData.RMInventoryPercent,
                    //RMInventotyCost: InterestRowData.NetAdditionalFreightCost,
                    WIPICCPercentage: InterestRowData.WIPInventoryPercent,
                    //WIPInventotyCost: InterestRowData.NetAdditionalFreightCost,
                    PaymentTermsICCPercentage: InterestRowData.PaymentTermPercent,
                    //PaymentTermsCost: InterestRowData.NetAdditionalFreightCost,
                }
            }
            //console.log("InventoryOlddata 222>>>", InventoryOlddata)
            return {
                ...state,
                loading: false,
                error: true,
                costingData: { ...state.costingData, [action.supplierColumn]: InventoryOlddata }
            };
        case GET_FREIGHT_HEAD_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                FreightHeadsList: action.payload
            };
        case GET_FREIGHT_AMOUNT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                FreightData: action.payload
            };
        case EMPTY_COSTING_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                costingData: action.payload
            };
        default:
            return state;
    }
}
