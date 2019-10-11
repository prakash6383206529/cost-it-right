import {
    COMPANY_LISTING_FAILURE,
    COMPANY_LISTING_REQUEST,
    GET_COMPANY_SUCCESS,
    UPDATE_COMPANY_FILTER,
    RESET_APP,
    UPDATE_CURRENT_LOCATION_FOR_COMPANY_DIRECTORY
} from '../config/constants';
import {
    formatCompanyListFilterResult
} from '../helper/ApiResponse';

import { PAGE_LENGTH } from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    showTabBar: true,
    matchingCompanyData: {
        companyList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    companyListFilter: {
        limit: PAGE_LENGTH,
        name: '',
        loc: '',
        listingType: '',
        categories: [],
        sortBy: 'distance',
        locAddress: '',
        isFilterApplied: false
    },
    currentLocation: {
        loc: '',
        locAddress: ''
    }
};
export default function companyListReducer(state = initialState, action) {
    switch (action.type) {
        case RESET_APP:
            const createCompanyListFilterFormatedData = formatCompanyListFilterResult();
            return {
                ...state,
                companyListFilter: createCompanyListFilterFormatedData,
                ...initialState
            };
        case COMPANY_LISTING_REQUEST:
            return {
                ...state,
                loading: true
            };
        case COMPANY_LISTING_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case UPDATE_COMPANY_FILTER:
            return {
                ...state,
                loading: false,
                companyListFilter: { ...state.companyListFilter, ...action.payload },
                error: false
            };
        case GET_COMPANY_SUCCESS:
            if (action.loadMore) {
                const List = {
                    companyList: [...state.matchingCompanyData.companyList, ...action.payload.companyList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalPage: action.payload.totalPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.matchingCompanyData = List;
            } else {
                state.matchingCompanyData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };
        case UPDATE_CURRENT_LOCATION_FOR_COMPANY_DIRECTORY:
            return {
                ...state,
                currentLocation: { ...state.currentLocation, ...action.payload },
            };
        default:
            return state;
    }
}
