import {
    DASHBOARD_API_REQUEST,
    DASHBOARD_API_FAILURE,
    GET_CHART_DATA_SUCCESS,
    GET_IN_APP_NOTIFICATION_LIST_SUCCESS,
    GET_MARK_AS_READ_NOTIFICATION_SUCCESS,
    RESET_APP
} from '../../../config/constants'
import {
    formatChartFilterResult
} from '../../../helper/ApiResponse'

const initialState = {
    error: false,
    loading: false,
    chartData: {
        postedOpportunityCount: 0,
        expirableOpportunityCount: 0,
        appliedRoleCount: 0,
    },
    chartDataFilter: {
        userId: '',
        sortBy: 'day',
    },
    distanceSortingFilter: {
        ageRange: [],
        gender: '',
        limit: '',
        mileRange: 30,
    },
    matchingNotificationListData: {
        inAppNotificationsList: [],
        currentPage: 0,
        nextPage: 2,
        totalRecords: 0,
    },
};

export default function dashboardReducer(state = initialState, action) {
    switch (action.type) {
        case RESET_APP:
            {
                const createChartFormatedData = formatChartFilterResult();
                return {
                    ...state,
                    chartDataFilter: createChartFormatedData
                };
            }
        case DASHBOARD_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case DASHBOARD_API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_CHART_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false,
                chartData: action.payload
            };
        case GET_IN_APP_NOTIFICATION_LIST_SUCCESS:
            if (action.loadMore) {
                const List = {
                    inAppNotificationsList: [...state.matchingNotificationListData.inAppNotificationsList, ...action.payload.inAppNotificationsList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.matchingNotificationListData = List;
            } else {
                state.matchingNotificationListData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };
        case GET_MARK_AS_READ_NOTIFICATION_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };
        default:
            return state;
    }
}
