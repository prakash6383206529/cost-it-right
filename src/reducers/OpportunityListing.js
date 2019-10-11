import {
    OPPORTUNITIES_LISTING_REQUEST,
    OPPORTUNITIES_LISTING_FAILURE,
    GET_OPPORTUNITIES_SUCCESS,
    UPDATE_OPPORTUNITY_FILTER,
    CHANGE_CATEGORY_TYPE,
    SHOW_TAB_BAR,
    SCREEN_NAME_SAVE_REQUEST,
    OPPORTUNITY_BOOKMARK_REQUEST,
    OPPORTUNITY_BOOKMARK_SUCCESS,
    OPPORTUNITY_BOOKMARK_FAIL,
    UPDATE_BOOKMARK_FLAG,
    MAP_VIEW_HANDLER,
    RESET_APP,
} from '../config/constants';
import {
    formatDistanceSortingResult
} from '../helper/ApiResponse';


import { PAGE_LENGTH } from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    saveOpportunityLoader: false,
    showTabBar: true,
    isMapViewDisplay: false,
    matchingOpportunityData: {
        opportunityList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    allOpportunityData: {
        opportunityList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    savedOpportunityData: {
        opportunityList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    appliedOpportunityData: {
        opportunityList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    categoryType: 1,
    opportunityFilter: {
        limit: PAGE_LENGTH,
        name: '',
        opportunityType: '',
        opportunitySubType: '',
        gender: '',
        location: [],
        ageRange: [18, 100],
        mileRange: [50],
        unionStatus: '',
        compensations: [],
        performance: [],
        languages: [],
        accents: [],
        ethnicAppearance: [],
        disabilities: [],
        hairs: [],
        eyes: [],
    },
    distanceSortingFilter: {
        limit: 5,
        gender: '',
        unionStatus: '',
        ageRange: [18, 100],
        mileRange: 30,
    }
};
const screenName = '';

export default function opportunityListReducer(state = initialState, action) {
    switch (action.type) {
        case RESET_APP:
            {
                state.opportunityFilter.location = [];
                const createDistanceSortingFormatedData = formatDistanceSortingResult();
                return {
                    ...state,
                    distanceSortingFilter: createDistanceSortingFormatedData
                };
            }
        case OPPORTUNITIES_LISTING_REQUEST:
            return {
                ...state,
                loading: true
            };
        case OPPORTUNITIES_LISTING_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case UPDATE_OPPORTUNITY_FILTER:
            state.opportunityData = null;
            return {
                ...state,
                loading: false,
                opportunityFilter: { ...state.opportunityFilter, ...action.payload },
                error: false
            };
        case GET_OPPORTUNITIES_SUCCESS:
            //console.log("GET_OPPORTUNITIES_SUCCESS =>" , action.categoryType);
            if (action.categoryType == 1) {

                if (action.loadMore) {
                    const List = {
                        opportunityList: [...state.matchingOpportunityData.opportunityList, ...action.payload.opportunityList],
                        currentPage: action.payload.currentPage,
                        nextPage: action.payload.nextPage,
                        totalPage: action.payload.totalPage,
                        totalRecords: action.payload.totalRecords,
                    };
                    state.matchingOpportunityData = List;
                } else {
                    state.matchingOpportunityData = action.payload;
                }
            } else if (action.categoryType == 2) {

                if (action.loadMore) {
                    const List = {
                        opportunityList: [...state.allOpportunityData.opportunityList, ...action.payload.opportunityList],
                        currentPage: action.payload.currentPage,
                        nextPage: action.payload.nextPage,
                        totalPage: action.payload.totalPage,
                        totalRecords: action.payload.totalRecords,
                    };
                    state.allOpportunityData = List;
                } else {
                    state.allOpportunityData = action.payload;
                }
            } else if (action.categoryType == 3) {
                if (action.loadMore) {
                    const List = {
                        opportunityList: [...state.savedOpportunityData.opportunityList, ...action.payload.opportunityList],
                        currentPage: action.payload.currentPage,
                        nextPage: action.payload.nextPage,
                        totalPage: action.payload.totalPage,
                        totalRecords: action.payload.totalRecords,
                    };
                    state.savedOpportunityData = List;
                } else {
                    state.savedOpportunityData = action.payload;
                }
            } else if (action.categoryType == 4) {
                if (action.loadMore) {
                    const List = {
                        opportunityList: [...state.appliedOpportunityData.opportunityList, ...action.payload.opportunityList],
                        currentPage: action.payload.currentPage,
                        nextPage: action.payload.nextPage,
                        totalPage: action.payload.totalPage,
                        totalRecords: action.payload.totalRecords,
                    };
                    state.appliedOpportunityData = List;
                } else {
                    state.appliedOpportunityData = action.payload;
                }
            }

            return {
                ...state,
                error: '',
                loading: false,
            };
        case CHANGE_CATEGORY_TYPE:
            return {
                ...state,
                categoryType: action.payload,
                loading: false
            };
        case SHOW_TAB_BAR:
            return {
                ...state,
                showTabBar: action.payload,
                loading: false
            };
        case SCREEN_NAME_SAVE_REQUEST:
            return {
                ...state,
                screenName: action.payload,
            };
        case OPPORTUNITY_BOOKMARK_REQUEST:
            return {
                ...state,
                saveOpportunityLoader: true
            };
        case OPPORTUNITY_BOOKMARK_SUCCESS:
            return {
                ...state,
                saveOpportunityLoader: false
            };
        case OPPORTUNITY_BOOKMARK_FAIL:
            return {
                ...state,
                saveOpportunityLoader: false
            };
        case UPDATE_BOOKMARK_FLAG:
            const List = {
                opportunityList: action.payload,
                currentPage: state.matchingOpportunityData.currentPage,
                nextPage: state.matchingOpportunityData.nextPage,
                totalPage: state.matchingOpportunityData.totalPage,
                totalRecords: state.matchingOpportunityData.totalRecords,
            };
            state.matchingOpportunityData = List;
            return {
                ...state,
                error: '',
                loading: false,
            };
        case MAP_VIEW_HANDLER:     
            return {
                ...state,
                isMapViewDisplay: action.payload
            };
        default:
            return state;
    }
}
