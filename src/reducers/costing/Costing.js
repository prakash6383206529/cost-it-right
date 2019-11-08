import {
    API_REQUEST,
    API_FAILURE,
    GET_PLANT_COMBO_SUCCESS,
    GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
    CREATE_PART_WITH_SUPPLIER_SUCCESS
} from '../../config/constants';

const initialState = {

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
        default:
            return state;
    }
}
