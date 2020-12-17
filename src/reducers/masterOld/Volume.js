import {
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
    GET_VOLUME_DATA_BY_PART_AND_YEAR,
} from '../../config/constants';

const initialState = {
    volumeDataByPartAndYear: {}
};

export default function VolumeReducer(state = initialState, action) {
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
        case GET_VOLUME_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                volumeData: action.payload
            };
        case GET_FINANCIAL_YEAR_SELECTLIST:
            return {
                ...state,
                loading: false,
                financialYearSelectList: action.payload
            };
        case GET_VOLUME_DATA_BY_PART_AND_YEAR:
            return {
                ...state,
                loading: false,
                volumeDataByPartAndYear: action.payload
            };
        default:
            return state;
    }
}
