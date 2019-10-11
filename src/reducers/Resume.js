import {
    POST_RESUME_DETAILS,
    GET_INITIAL_RESUME_DATA,
    CREATE_RESUME__SUCCESS,
    CREATE_RESUME_API_REQUEST,
    CREATE_RESUME_API_FAILURE
} from '../config/constants';


const initialState = {
    error: false,
    loading: false,
    resumeData: {
        profileImage: '',
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        email: '',
        contactNumber: '',
        unionStatus: '',
        height: '',
        weight: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        aboutSummary: '',
        categories: [],
        ethnics: [],
        sports: [],
        performances: [],
        links: [],
        accolades: [],
        languages: [],
        accents: [],
        disabilities: [],
        theatreExperiences: [],
        filmExperiences: [],
        tvExperiences: [],
        educationalTraining: [],
    },
    resumeFilter: {
        profileImage: '',
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        email: '',
        contactNumber: '',
        unionStatus: '',
        height: '',
        weight: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        aboutSummary: '',
        categories: [],
        ethnics: [],
        sports: [],
        performances: [],
        links: [],
        accolades: [],
        languages: [],
        accents: [],
        disabilities: [],
        theatreExperiences: [],
        filmExperiences: [],
        tvExperiences: [],
        educationalTraining: [],
    }
}

export default function resumeReducer(state = initialState, action) {
    switch (action.type) {
        case GET_INITIAL_RESUME_DATA: {

            return {
                ...state,
                loading: false,
                resumeFilter: { ...action.payload },
                error: false
            };
        }

        case POST_RESUME_DETAILS: {

            return {
                ...state,
                loading: false,
                resumeData: { ...action.payload },
                error: false
            };
        }
        case CREATE_RESUME_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_RESUME_API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case CREATE_RESUME__SUCCESS:
            return {
                ...state,
                error: false,
                loading: false
            };
        default:
            return state;
    }
}

