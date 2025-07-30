import { DECREMENT_PAGE, INCREMENT_PAGE, RESET_STATE, SET_CURRENT_ROW_INDEX, SET_FLOATING_FILTER_DATA, SET_PAGE_NUMBER, SET_PAGE_SIZE, SET_SKIP, SET_UPDATED_CURRENT_ROW_INDEX, SET_UPDATED_PAGE_NUMBER, SET_UPDATED_PAGE_SIZE, SET_UPDATE_GLOBALE_TAKE, defaultPageSize } from "../../../config/constants";

const initialState = {
    pageNo: 1,
    pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    currentRowIndex: defaultPageSize,
    // floatingFilterData: {},
    globalTakes: defaultPageSize,
    skip: 0


};

const paginationReducer = (state = initialState, action) => {

    switch (action?.type) {
        case SET_PAGE_NUMBER:
            return {
                ...state, pageNo: action?.payload,

            };
        case SET_PAGE_SIZE:
            return {
                ...state,
                pageSize: action?.payload,

            };
        case INCREMENT_PAGE:
            return {
                ...state,
                pageNo: action?.payload
            };
        case DECREMENT_PAGE:
            return {
                ...state,
                pageNo: action?.payload
            };
        case SET_CURRENT_ROW_INDEX:
            return {

                ...state,
                currentRowIndex: action?.payload,

            };
        case SET_FLOATING_FILTER_DATA:
            return {
                ...state,
                floatingFilterData: action?.payload,

            };

        case SET_UPDATED_CURRENT_ROW_INDEX:
            return {
                ...state,
                currentRowIndex: action.payload
            };

        case SET_UPDATED_PAGE_SIZE:
            return {
                ...state,
                pageSize: action.payload
            }
        case SET_UPDATE_GLOBALE_TAKE:
            return {
                ...state,
                globalTakes: action?.payload
            };
        case SET_UPDATED_PAGE_NUMBER:
            return {
                ...state,
                pageNo: action?.payload
            }
        case SET_SKIP:
            return {
                ...state,
                skip: action?.payload
            }
        case RESET_STATE:
            return initialState;
        default:
            return state;
    }
};

export default paginationReducer;
