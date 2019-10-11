import {
    API_REQUEST,
    API_FAILURE,
    SHOW_EDIT_BUTTON,
    SHOW_BLOCK_BUTTON,
    GET_USER_PROFILE_SUCCESS,
    UPDATE_FORM_DATA,
    UPDATE_USER_PROFILE_SUCCESS,
    FETCH_MATER_DATA_SUCCESS,
    FETCH_MATER_DATA_FAILURE,
    FETCH_MATER_DATA_REQUEST,
    DELETE_USER_MEDIA_SUCCESS,
    POST_USER_MEDIA_SUCCESS,
    USER_PROFILE_IMAGE_SUCCESS,
    USER_HEADSHOT_IMAGE_SUCCESS,
    SET_PROFILE_PICTURE_SUCCESS,
    EXPERIENCE_TYPE,
    SET_BASIC_PROFILE_IMAGE_SUCCESS,
    GET_VIEWER_LIST_SUCCESS
} from '../config/constants';

/** Always define initialState in reducer so that we don't get undefined values */
const initialState = {
    error: false,
    loading: false,
    masterData: {},
    formData: {},
    editButtonFlag: false,
    matchingViewerListData: {
        viewerList: [],
        currentPage: 0,
        nextPage: 2,
        totalRecords: 0,
    },
};

/**
 * @method profileReducer
 * @description Takes previous state and returns the new state
 * @param {*} state 
 * @param {*} action 
 */
export default function profileReducer(state = initialState, action) {
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
        case GET_USER_PROFILE_SUCCESS:
            return {
                ...state,
                error: '',
                loading: false,
                formData: action.payload
            };
        case SHOW_EDIT_BUTTON:
            return {
                ...state,
                error: '',
                loading: false,
                editButtonFlag: action.payload
            };
        case SHOW_BLOCK_BUTTON:
            return {
                ...state,
                error: '',
                loading: false,
                editButtonFlag: action.payload
            };

        case UPDATE_FORM_DATA:
            return {
                ...state,
                formData: action.payload
            };
        case UPDATE_USER_PROFILE_SUCCESS:
            return {
                ...state,
                loading: false
            };

        case DELETE_USER_MEDIA_SUCCESS:
            return {
                ...state,
                loading: false
            };

        case POST_USER_MEDIA_SUCCESS:
            return {
                ...state,
                loading: false
            };

        case FETCH_MATER_DATA_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_MATER_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                masterData: action.payload
            };
        case FETCH_MATER_DATA_FAILURE:
            return {
                ...state,
                loading: false
            };
        case USER_PROFILE_IMAGE_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case USER_HEADSHOT_IMAGE_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case SET_PROFILE_PICTURE_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case EXPERIENCE_TYPE:
            return {
                ...state,
                experienceData: action.payload
            };
        case SET_BASIC_PROFILE_IMAGE_SUCCESS:
            const data = {
                profileImage: action.payload,
            };
            return {
                ...state,
                formData: data,
                loading: false,
            };
            case GET_VIEWER_LIST_SUCCESS:
            if (action.loadMore) {
                const List = {
                    viewerList: [...state.matchingViewerListData.viewerList, ...action.payload.viewerList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.matchingViewerListData = List;
            } else {
                state.matchingViewerListData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };
        default:
            return state;
    }
}
