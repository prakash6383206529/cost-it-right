import {
    UPDATE_TALENT_DIRECTORY_FILTER,
    TALENT_DIRECTORY_LISTING_REQUEST,
    GET_TALENT_DIRECTORY_SUCCESS,
    TALENT_DIRECTORY_LISTING_FAILURE,
    TALENT_DIRECTORY_FOLLOW_REQUEST,
    TALENT_DIRECTORY_FOLLOW_SUCCESS,
    TALENT_DIRECTORY_FOLLOW_FAIL,
    UPDATE_FOLLOW_UNFOLLOW_FLAG,
    RESET_APP,
    SEARCH_TEXT_DATA_ON_BACK
} from '../config/constants';
import { PAGE_LENGTH } from '../config';
import {
    formatTalentDirectoryFilterResult
} from '../helper/ApiResponse';


const initialState = {
    error: false,
    loading: false,
    followTalentProfileLoader: false,
    searchTextKey:'',
    matchingTalentDirectoryData: {
        talentDirectoryList: [],
        currentPage: 0,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    talentDirectoryFilter: {
        limit: PAGE_LENGTH,
        gender: '',
        ageRange: [18, 100],
        unionStatus: '',
        disabilities: [],
        accents: [],
        sports: [],
        weightRange: [0, 1000],
        heightRange: [0, 10],
        languages: [],
        performance: [],
        sortBy: 'distance',
        name: '',
        loc: '',
        locAddress: ''
    },
};

export default function talentDirectoryListReducer(state = initialState, action) {
    switch (action.type) {
        case RESET_APP:
            {
                const createTalentDirectoryFormatedData = formatTalentDirectoryFilterResult();
                return {
                    ...state,
                    talentDirectoryFilter: createTalentDirectoryFormatedData
                };
            }
        case TALENT_DIRECTORY_LISTING_REQUEST:
            return {
                ...state,
                loading: true
            };
        case TALENT_DIRECTORY_LISTING_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case UPDATE_TALENT_DIRECTORY_FILTER:
            return {
                ...state,
                loading: false,
                talentDirectoryFilter: { ...state.talentDirectoryFilter, ...action.payload },
                error: false
            };
        case GET_TALENT_DIRECTORY_SUCCESS:
            if (action.loadMore) {
                const List = {
                    talentDirectoryList: [...state.matchingTalentDirectoryData.talentDirectoryList, ...action.payload.talentDirectoryList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalPage: action.payload.totalPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.matchingTalentDirectoryData = List;
            } else {
                state.matchingTalentDirectoryData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };
        case TALENT_DIRECTORY_FOLLOW_REQUEST:
            return {
                ...state,
                followTalentProfileLoader: true
            };
        case TALENT_DIRECTORY_FOLLOW_SUCCESS:
            return {
                ...state,
                followTalentProfileLoader: false
            };
        case TALENT_DIRECTORY_FOLLOW_FAIL:
            return {
                ...state,
                followTalentProfileLoader: false
            };
        case UPDATE_FOLLOW_UNFOLLOW_FLAG:
            const List = {
                talentDirectoryList: action.payload,
                currentPage: state.matchingTalentDirectoryData.currentPage,
                nextPage: state.matchingTalentDirectoryData.nextPage,
                totalPage: state.matchingTalentDirectoryData.totalPage,
                totalRecords: state.matchingTalentDirectoryData.totalRecords,
            };
            state.matchingTalentDirectoryData = List;
            return {
                ...state,
                error: '',
                loading: false,
            };
        case  SEARCH_TEXT_DATA_ON_BACK: 
            return {      
                ...state,
                searchTextKey : action.payload
            }
        default:
            return state;
    }
}
