/* eslint-disable no-case-declarations */
import {
    FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST,
    GET_FOLLOWING_LISTING_SUCCESS,
    FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE,
    GET_FOLLOWERS_LISTING_SUCCESS,
    TALENT_FOLLOW_REQUEST,
    TALENT_FOLLOW_FAILURE,
    TALENT_FOLLOW_SUCCESS,
    UPDATE_FOLLOWING_FLAG,
    UPDATE_FOLLOWER_FLAG
} from '../config/constants';

import { PAGE_LENGTH } from '../config';

const initialState = {
    error: false,
    loading: false,
    FollowingData: {
        followingList: [],
        currentPage: 1,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    FollowerData: {
        followerList: [],
        currentPage: 1,
        nextPage: 2,
        totalPage: 0,
        totalRecords: 0,
    },
    FollowingAndFollowerFilter: {
        limit: PAGE_LENGTH,
    },
};


export default function followingFollowerReducer(state = initialState, action) {
    switch (action.type) {
        case FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };
        case GET_FOLLOWING_LISTING_SUCCESS:
            if (action.loadMore) {
                const List = {
                    followingList: [...state.FollowingData.followingList, ...action.payload.followingList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalPage: action.payload.totalPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.FollowingData = List;
            } else {
                state.FollowingData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };
        case GET_FOLLOWERS_LISTING_SUCCESS:
            if (action.loadMore) {
                const List = {
                    followerList: [...state.FollowerData.followerList, ...action.payload.followerList],
                    currentPage: action.payload.currentPage,
                    nextPage: action.payload.nextPage,
                    totalPage: action.payload.totalPage,
                    totalRecords: action.payload.totalRecords,
                };
                state.FollowerData = List;
            } else {
                state.FollowerData = action.payload;
            }
            return {
                ...state,
                error: '',
                loading: false,
            };

        case TALENT_FOLLOW_REQUEST:
            return {
                ...state,
                loading: true
            };
        case TALENT_FOLLOW_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };
        case TALENT_FOLLOW_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case UPDATE_FOLLOWING_FLAG:
            const List = {
                followingList: action.payload,
                currentPage: action.payload.currentPage,
                nextPage: action.payload.nextPage,
                totalPage: action.payload.totalPage,
                totalRecords: action.payload.totalRecords,
            };
            state.FollowingData = List;
            return {
                ...state,
                error: '',
                loading: false,
            };
        case UPDATE_FOLLOWER_FLAG:
            const List1 = {
                followerList: action.payload,
                currentPage: action.payload.currentPage,
                nextPage: action.payload.nextPage,
                totalPage: action.payload.totalPage,
                totalRecords: action.payload.totalRecords,
            };
            state.FollowerData = List1;
            return {
                ...state,
                error: '',
                loading: false,
            };
        default:
            return state;
    }
}
