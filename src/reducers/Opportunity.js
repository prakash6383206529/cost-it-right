import {
    OPPORTUNITIES_REQUEST,
    OPPORTUNITIES_FAILURE,
    // GET_OPPORTUNITIES_SUCCESS,
    UPDATE_POST_OPPORTUNITY_DETAILS,
    UPDATE_OPPORTUNITY_FILTER,
    CREATE_OPPORTUNITIES_REQUEST,
    CREATE_OPPORTUNITIES_SUCCESS,
    CREATE_OPPORTUNITIES_FAILURE,
    SET_OPPORTUNITY_LOGO_SUCCESS,
    OPPORTUNITIES_DETAILS_API_REQUEST,
    OPPORTUNITY_DETAILS_SUCCESS,
    OPPORTUNITY_DETAILS_FAILURE,
    OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS,
    OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE,
    CLONE_OPPORTUNITY_API_REQUEST,
    CLONE_OPPORTUNITY_SUCCESS,
    CLONE_OPPORTUNITY_FAILURE,
    OPPORTUNITY_DETAILS_CLONE_SUCCESS,
    CREATE_OPPORTUNITIES_CLONE_SUCCESS,
    PUBLISH_OPPORTUNITIES_SUCCESS,
    OPPORTUNITY_EDIT_DETAILS_SUCCESS,
    OPPORTUNITY_CLONE_REQUEST,
    OPPORTUNITY_CLONE_SUCCESS,
    OPPORTUNITY_CLONE_FAILURE,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE,
    EDIT_INDEX_ROLE,
    CLONE_OPPORTUNITY_DROPDOWN_VALUE,
    SHOW_OPPORTUNITY_DETAIL
} from '../config/constants';
import {
    formatCreateOpportunitiesResult, formatCreateOpportunitiesDetailCloneResult,
    formatCreateOpportunitiesCloneResult, formatCreateOpportunitiesPublishResult,
    formatCreateOpportunitiesDetailResult, formatCloneOpportunityListData
} from '../helper/ApiResponse';


import { PAGE_LENGTH } from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    opportunityData: null,
    opportunityFilter: {
        limit: PAGE_LENGTH,
        name: '',
        opportunityType: '',
        opportunitySubType: '',
        gender: '',
        location: '',
        ageRange: [0, 100],
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
    opportunityDetail: {
        _id: '',
        isClone: false,
        clonedOpportunityId: '',
        cloneOpportunityValue: '',
        draftedStep: 1,
        name: '',
        opportunityType: '',
        opportunitySubType: '',
        eventDate: '',
        synopsis: '',
        compensation: false,
        compensationTypes: [],
        workPermit: false,
        unionStatus: false,
        media: [],
        productionCompany: '',
        address: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        loc: [],
        additionalInformation: '',
        website: '',
        contact: '',
        director: '',
        directorLink: '',
        producer: '',
        producerLink: '',
        conductor: '',
        conductorLink: '',
        holdingAuditions: false,
        scheduleAuditions: false,
        auditionSlotScedule: [
        ],
        callbackDate: '',
        expiryDate: '',
        rehearsalStart: '',
        isRehearsalLocationSameAsTheterLocation: false,
        rehearsalLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        productionDatesAndTimes: [],
        isProducationLocationSameAsTheterLocation: false,
        productionLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        published: false,
        publishedOn: '',
        isActive: false,
        isExpired: false,
        bookMarkFlag: false,
        bookMarkDate: '',
        roleCount: 0,
    },
    newOpportunity: {
        _id: '',
        isClone: false,
        clonedOpportunityId: '',
        cloneOpportunityValue: '',
        draftedStep: 1,
        name: '',
        opportunityType: '',
        opportunitySubType: '',
        eventDate: '',
        synopsis: '',
        compensation: false,
        compensationTypes: [],
        workPermit: false,
        unionStatus: false,
        media: [],
        productionCompanyId: '',
        // productionCompany: '',
        // address: '',
        // country: '',
        // state: '',
        // city: '',
        // zipCode: '',
        // loc: [],
        // additionalInformation: '',
        // website: '',
        // contact: '',
        // director: '',
        // directorLink: '',
        // producer: '',
        // producerLink: '',
        // conductor: '',
        // conductorLink: '',
        holdingAuditions: false,
        scheduleAuditions: false,
        auditionSlotScedule: [
        ],
        callbackDate: '',
        expiryDate: '',
        rehearsalStart: '',
        isRehearsalLocationSameAsTheterLocation: false,
        rehearsalLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        productionDatesAndTimes: [],
        isProducationLocationSameAsTheterLocation: false,
        productionLocation: {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: ''
        },
        published: false,
        publishedOn: '',
        isActive: false,
        isExpired: false
    },
    cloneOpportunity: [
    ],
    appliaedOpportunityDetail: {
        'id': '',
        'name': '',
        'synopsis': '',
        'media': [
        ],
        'userCreated': {
            'name': '',
            'id': '',
            'time': ''
        },
        'roles': [
        ],
        'appliedRoleDetails': [
        ]
    },
    myOpportunityType: 0,
};

export default function opportunityReducer(state = initialState, action) {
    switch (action.type) {
        case CREATE_OPPORTUNITIES_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_OPPORTUNITIES_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case PUBLISH_OPPORTUNITIES_SUCCESS: {
            const createOpportunityPublishFormatedData = formatCreateOpportunitiesPublishResult(state.newOpportunity);
            console.log("create opportunity publish formatted data => " + JSON.stringify(createOpportunityPublishFormatedData));

            return {
                ...state,
                loading: false,
                newOpportunity: createOpportunityPublishFormatedData,
                error: false
            };
        }
        case CREATE_OPPORTUNITIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case CREATE_OPPORTUNITIES_CLONE_SUCCESS: {
            const createOpportunityCloneFormatedData = formatCreateOpportunitiesCloneResult(action.payload, state.newOpportunity);
            console.log("create opportunity clone success formatted data => " + JSON.stringify(createOpportunityCloneFormatedData));
            return {
                ...state,
                loading: false,
                newOpportunity: createOpportunityCloneFormatedData,
                error: false
            };
        }

        case OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS: {
            const createOpportunityFormatedData = formatCreateOpportunitiesResult(action.payload, state.newOpportunity);
            console.log("create opportunity create success formatted data => ", createOpportunityFormatedData);
            return {
                ...state,
                loading: false,
                newOpportunity: createOpportunityFormatedData,
                error: false
            };
        }

        case OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };

        case OPPORTUNITIES_DETAILS_API_REQUEST:
            return {
                ...state,
                loading: true
            };
            
        case OPPORTUNITY_DETAILS_SUCCESS: {
            const createOpportunityDetailFormatedData = formatCreateOpportunitiesDetailResult(action.payload, state.opportunityDetail);
            console.log("create opportunity detail success formatted data => ", createOpportunityDetailFormatedData);

            return {
                ...state,
                loading: false,
                opportunityDetail: createOpportunityDetailFormatedData,
                error: false
            };
        }
        case SHOW_OPPORTUNITY_DETAIL: {
            const data = action.payload.data.opportunityDetails.userCreated.id;
            return {
                ...state,
                loading: false,
                createdUserId: data,
                error: false
            };
        }
        case OPPORTUNITY_EDIT_DETAILS_SUCCESS: {
            const createOpportunityDetailFormatedData = formatCreateOpportunitiesDetailResult(action.payload, state.opportunityDetail);
            //console.log("create opportunity edit detail success formatted data => " + JSON.stringify(createOpportunityDetailFormatedData));
            return {
                ...state,
                loading: false,
                newOpportunity: createOpportunityDetailFormatedData,
                error: false
            };
        }
        case OPPORTUNITY_DETAILS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case OPPORTUNITIES_REQUEST:
            return {
                ...state,
                loading: true
            };
        case OPPORTUNITIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        // case GET_OPPORTUNITIES_SUCCESS:
        //     if (action.loadMore) {
        //         const List = {
        //             opportunityList: [...state.opportunityData[0].opportunityList, ...action.payload[0].opportunityList],
        //             currentPage: action.payload[0].currentPage,
        //             nextPage: action.payload[0].nextPage,
        //             totalPage: action.payload[0].totalPage,
        //             totalRecords: action.payload[0].totalRecords,
        //         };
        //         state.opportunityData = [List];
        //     } else {
        //         state.opportunityData = action.payload;
        //     }
        //     return {
        //         ...state,
        //         error: '',
        //         loading: false,
        //     };
        case UPDATE_POST_OPPORTUNITY_DETAILS: {
            return {
                ...state,
                loading: false,
                newOpportunity: action.payload,
                error: false
            };
        }
        case UPDATE_OPPORTUNITY_FILTER:
            state.opportunityData = null;

            return {
                ...state,
                loading: false,
                opportunityFilter: { ...state.opportunityFilter, ...action.payload },
                error: false
            };

        case SET_OPPORTUNITY_LOGO_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };
        case CLONE_OPPORTUNITY_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CLONE_OPPORTUNITY_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };

        }
        case CLONE_OPPORTUNITY_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case OPPORTUNITY_DETAILS_CLONE_SUCCESS: {
            const createOpportunityDetailCloneFormatedData = formatCreateOpportunitiesDetailCloneResult(action.payload, state.newOpportunity);
            return {
                ...state,
                loading: false,
                newOpportunity: createOpportunityDetailCloneFormatedData,
                error: false
            };
        }
        case OPPORTUNITY_CLONE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case OPPORTUNITY_CLONE_SUCCESS:
            if (action.myOpportunityType === 1) {
                const cloneOpportunityListData = formatCloneOpportunityListData(action.payload, state.cloneOpportunity);
                //console.log("cloneOpportunityListData => " + JSON.stringify(cloneOpportunityListData));
                state.cloneOpportunity = cloneOpportunityListData;
                //state.postedOpportunity = action.payload;
            }
            state.myOpportunityType = action.myOpportunityType;
            return {
                ...state,
                loading: false,
                error: false
            };
        case OPPORTUNITY_CLONE_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };

        case APPLIED_OPPORTUNITY_DETAIL_REQUEST:
            return {
                ...state,
                loading: true
            };
        case APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS: {
            return {
                ...state,
                loading: false,
                appliaedOpportunityDetail: action.payload,
                error: false
            };
        }
        case APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };
        case EDIT_INDEX_ROLE:
            return {
                ...state,
                loading: false,
                error: false,
                dateUpdateIndex: action.payload
            }  
        case CLONE_OPPORTUNITY_DROPDOWN_VALUE:
            return {
                ...state,
                loading: false,
                error: false,
                clonedropdownid: action.payload
            }    

        default:
            return state;
    }
}
