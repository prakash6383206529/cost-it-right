import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_ALL_OUTSOURCING_DATA,
    GET_OUTSOURCING_DATA,
    GET_OUTSOURCING_DATA_FOR_DOWNLOAD
} from '../../../config/constants';

const initialState = {
    outsourcingDataList: [],
    outsourcingDataListForDownload: [],
    outsourcingData: [],
};

export default function OutsourcingReducer(state = initialState, action) {
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
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_ALL_OUTSOURCING_DATA:
            let arr = []
            arr = action.payload && action.payload.filter((el, i) => {
                el.status = el.IsActive
                if (el.status === true) {
                    el.status = 'Active'
                } else if (el.status === false) {
                    el.status = 'In Active'
                }
                return true
            })
            return {
                ...state,
                loading: false,
                outsourcingDataList: arr,
            };
        case GET_OUTSOURCING_DATA_FOR_DOWNLOAD:
            let array = []
            array = action.payload && action.payload.filter((el, i) => {
                el.status = el.IsActive
                if (el.status === true) {
                    el.status = 'Active'
                } else if (el.status === false) {
                    el.status = 'In Active'
                }
                return true
            })
            return {
                ...state,
                loading: false,
                outsourcingDataListForDownload: array
            }
        case GET_OUTSOURCING_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                outsourcingData: action.payload,
            };
        default:
            return state;
    }
}
