import { API_REQUEST, API_FAILURE, GET_LOGIN_AUDIT_SUCCESS } from '../../../config/constants';
const initialState = {
    auditDataList: [],
    loading: false,
    error: false
};

export default function AuditReducer(state = initialState, action) {

    switch (action?.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true,
                error: false
            }
        case API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            }

        case GET_LOGIN_AUDIT_SUCCESS:
            const formattedDataList = action?.payload?.DataList && action?.payload?.DataList.map(item => ({
                ...item,

            })) || [];

            return {
                ...state,
                loading: false,
                error: false,
                auditDataList: action?.payload?.DataList ? formattedDataList : [],

            };


        default:
            return state;
    }
}
