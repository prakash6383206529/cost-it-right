import { API_REQUEST, API_FAILURE, GET_LOGIN_AUDIT_SUCCESS } from '../../../config/constants';
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);


const effectiveDateFormatter = (dateString) => {
    // Validate dateString here
    if (!dateString) return '-';
    try {
        const utcDate = dayjs.utc(dateString);
        const browserTimeZone = dayjs.tz.guess();
        const localTime = utcDate.tz(browserTimeZone);
        return localTime.format('DD/MM/YYYY - HH:mm:ss');
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Invalid date';
    }
};

const initialState = {
    auditDataList: [],
    loading: false,
    error: false
};

export default function AuditReducer(state = initialState, action) {

    switch (action.type) {
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
            const formattedDataList = action.payload.DataList.map(item => ({
                ...item,
                // Apply effectiveDateFormatter to each item's LoginTime
                LoginTime: effectiveDateFormatter(item.LoginTime)

            }));
            return {
                ...state,
                loading: false,
                error: false,
                auditDataList: formattedDataList,
            };


        default:
            return state;
    }
}
