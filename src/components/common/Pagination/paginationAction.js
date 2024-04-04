import { DECREMENT_PAGE, INCREMENT_PAGE, RESET_STATE, SET_CURRENT_ROW_INDEX, SET_FLOATING_FILTER_DATA, SET_PAGE_NUMBER, SET_PAGE_SIZE, SET_SKIP, SET_UPDATED_CURRENT_ROW_INDEX, SET_UPDATED_PAGE_NUMBER, SET_UPDATED_PAGE_SIZE, SET_UPDATE_GLOBALE_TAKE } from "../../../config/constants";

export const setPageNumber = (pageNo) => ({
    type: SET_PAGE_NUMBER,
    payload: pageNo,
});
export const updatePageNumber = (data) => ({
    type: SET_UPDATED_PAGE_NUMBER,
    payload: data
})

export const setPageSize = (pageSize) => ({
    type: SET_PAGE_SIZE,
    payload: pageSize,
});


export const incrementPage = (data) => ({
    type: INCREMENT_PAGE,
    payload: data
});

export const decrementPage = (data) => ({
    type: DECREMENT_PAGE,
    payload: data
});

export const setCurrentRowIndex = (currentRowIndex) => ({
    type: SET_CURRENT_ROW_INDEX,
    payload: currentRowIndex,
});

export const setFloatingFilterData = (floatingFilterData) => ({
    type: SET_FLOATING_FILTER_DATA,
    payload: floatingFilterData,
});
export const updateCurrentRowIndex = (data) => ({
    type: SET_UPDATED_CURRENT_ROW_INDEX,
    payload: data,
});
export const updatePageSize = (data) => ({

    type: SET_UPDATED_PAGE_SIZE,
    payload: data
})
export const updateGlobalTake = (data) => ({
    type: SET_UPDATE_GLOBALE_TAKE,
    payload: data
})
export const skipUpdate = (data) => ({
    type: SET_SKIP,
    payload: data
})
export const resetStatePagination = () => ({
    type: RESET_STATE,
});