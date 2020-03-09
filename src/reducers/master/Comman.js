import {
    API_FAILURE,
    API_REQUEST,
    GET_UOM_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_PART_SUCCESS,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS,
    GET_ROW_MATERIAL_SUCCESS,
    GET_GRADE_SUCCESS,
    GET_SUPPLIER_SUCCESS,
    GET_SUPPLIER_CITY_SUCCESS,
    GET_TECHNOLOGY_SUCCESS,
    GET_CATEGORY_TYPE_SUCCESS,
    GET_CATEGORY_SUCCESS,
    GET_FUEL_SUCCESS,
    GET_TECHNOLOGY_LIST_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_FAILURE,
    GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
    GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE,
    GET_MHR_COMBO_DATA_SUCCESS,
    DATA_FAILURE,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_LABOUR_TYPE_SUCCESS,
    GET_COSTING_HEAD_SUCCESS,
    GET_MODEL_TYPE_SUCCESS,
    GET_PLANTS_BY_SUPPLIER,
    GET_PLANTS_BY_CITY,
    GET_CITY_BY_SUPPLIER,
    GET_SOURCE_PLANTS_BY_SOURCE_CITY,
    GET_DESTINATION_PLANTS_BY_DESTINATION_CITY,
    GET_LABOUR_TYPE_SELECTLIST_SUCCESS,
    GET_POWER_TYPE_SELECTLIST_SUCCESS,
    GET_CHARGE_TYPE_SELECTLIST_SUCCESS,
    GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS,
    GET_UOM_SELECTLIST_SUCCESS,
    GET_MACHINE_TYPE_SELECTLIST_SUCCESS,
    GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS,
    GET_DEPRECIATION_SELECTLIST_SUCCESS,
    GET_SHIFT_TYPE_SELECTLIST_SUCCESS,
    GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS,
} from '../../config/constants';

const initialState = {
    technologyList: []
};

export default function commanReducer(state = initialState, action) {
    switch (action.type) {
        case API_FAILURE:
            return {
                ...state,
                loading: false
            };
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_UOM_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                uniOfMeasurementList: action.payload
            };
        case GET_MATERIAL_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                materialTypeList: action.payload
            };
        case GET_CATEGORY_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryTypeList: action.payload
            };
        case GET_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryList: action.payload
            };
        case GET_PART_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                partList: action.payload
            };
        case GET_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                supplierList: action.payload
            };
        case GET_COUNTRY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                countryList: action.payload
            };
        case GET_STATE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                stateList: action.payload
            };
        case GET_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                cityList: action.payload
            };
        case GET_SUPPLIER_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                cityList: action.payload
            };
        case GET_TECHNOLOGY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                technologyList: action.payload
            };
        case GET_PLANT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                plantList: action.payload
            };
        case GET_ROW_MATERIAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialList: action.payload
            };
        case GET_GRADE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmGradeList: action.payload
            };
        case GET_FUEL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                fuelList: action.payload
            };
        // case FETCH_MATER_DATA_FAILURE:
        //     return {
        //         ...state,
        //         loading: false,
        //         error: true
        //     };
        case GET_TECHNOLOGY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                technologyList: action.payload
            };
        case GET_OTHER_OPERATION_FORMDATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                otherOperationFormData: action.payload
            };
        case GET_OTHER_OPERATION_FORMDATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                cedOtherOperationComboData: action.payload
            };

        case FETCH_MATER_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_MHR_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                comboDataMHR: action.payload
            };
        case DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_RM_SPECIFICATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmSpecification: action.payload
            };
        case GET_LABOUR_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                labourType: action.payload
            };
        case GET_COSTING_HEAD_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                costingHead: action.payload
            };
        case GET_MODEL_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                modelTypes: action.payload
            };
        case GET_PLANTS_BY_SUPPLIER:
            return {
                ...state,
                loading: false,
                error: true,
                filterPlantList: action.payload
            };
        case GET_PLANTS_BY_CITY:
            return {
                ...state,
                loading: false,
                error: true,
                filterPlantListByCity: action.payload
            };
        case GET_SOURCE_PLANTS_BY_SOURCE_CITY:
            return {
                ...state,
                loading: false,
                error: true,
                filterSourcePlantBySourceCity: action.payload
            };
        case GET_DESTINATION_PLANTS_BY_DESTINATION_CITY:
            return {
                ...state,
                loading: false,
                error: true,
                filterDestinationPlantByDestinationCity: action.payload
            };
        case GET_CITY_BY_SUPPLIER:
            return {
                ...state,
                loading: false,
                error: true,
                filterCityListBySupplier: action.payload
            };
        case GET_LABOUR_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                labourTypeSelectList: action.payload
            };
        case GET_POWER_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                powerTypeSelectList: action.payload
            };
        case GET_CHARGE_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                chargeTypeSelectList: action.payload
            };
        case GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                powerSupplierTypeSelectList: action.payload
            };
        case GET_UOM_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                UOMSelectList: action.payload
            };
        case GET_MACHINE_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                MachineTypeSelectList: action.payload
            };
        case GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                DepreciationTypeSelectList: action.payload
            };
        case GET_DEPRECIATION_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                DepreciationSelectList: action.payload
            };
        case GET_SHIFT_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                ShiftTypeSelectList: action.payload
            };
        case GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                MachineByMachineTypeSelectList: action.payload
            };
        default:
            return state;
    }
}
