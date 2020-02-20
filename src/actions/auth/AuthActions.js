import axios from 'axios';
import { apiErrors } from '../../helper/util';
import {
    API,
    AUTH_API_REQUEST,
    AUTH_API_FAILURE,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    LOGIN_SUCCESS,
    UPDATE_PASSWORD_SUCCESS,
    REGISTER_SUCCESS,
    FORGOT_PASSWORD_SUCCESS,
    VERIFY_OTP_SUCCESS,
    RESEND_OTP_SUCCESS,
    SOCIAL_MEDIA_LOGIN_SUCCESS,
    UPDATE_USER_ACCOUNT_DETAIL_SUCCESS,
    SOCIAL_USER_DATA,
    INTERNAL_ROUTE_ID,
    SEND_MESSAGE_SUCCESS,
    GET_ROLE_SUCCESS,
    GET_DEPARTMENT_SUCCESS,
    GET_TECHNOLOGY_DATA_LIST_SUCCESS,
    GET_LEVEL_USER_SUCCESS,
    GET_USER_SUCCESS,
    GET_UNIT_ROLE_DATA_SUCCESS,
    GET_UNIT_DEPARTMENT_DATA_SUCCESS,
    GET_UNIT_LEVEL_DATA_SUCCESS,
    GET_ROLES_SELECTLIST_SUCCESS,
    GET_MODULE_SELECTLIST_SUCCESS,
    GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS,
    GET_PAGES_SELECTLIST_SUCCESS,
    GET_ACTION_HEAD_SELECTLIST_SUCCESS,
    GET_MENU_BY_USER_DATA_SUCCESS,
} from '../../config/constants';
import { formatLoginResult } from '../../helper/ApiResponse';
import { toastr } from "react-redux-toastr";
import { MESSAGES } from "../../config/message";


/**
 * @method loginUser
 * @description get data from dummy api
 */

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function loginUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.login, requestData, { headers })
            .then((response) => {
                if (response && response.data && response.data.Result) {
                    //console.log("login res", response)
                    dispatch(getLoginSuccess(response));
                    callback(response);
                }
            })
            .catch((error) => {
                dispatch(getFailure(error));
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getLoginSuccess
 * @description return object containing action type
 */
export function getLoginSuccess(res) {
    return {
        type: LOGIN_SUCCESS,
        payload: formatLoginResult(res.data),
    };
}

/**
 * @method getFailure
 * @description return object containing action type
 */
export function getFailure() {
    return {
        type: AUTH_API_FAILURE
    };
}

/**
 * @method logoutUserAPI
 * @description Used for logout, logged in user
 */
export function logoutUserAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.logout, requestData, { headers })
            .then((response) => {
                console.log("logout res", response)
                if (response && response.status == 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method socialLoginAPI
 * @description get data from social Media
 */
// export function socialLoginAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.socialMediaLogin, requestData, { headers })
//             .then((response) => {
//                 dispatch(getSocialMediaLoginSuccess(response));
//                 callback(response);
//             }).catch((error) => {
//                 dispatch(getSocialMediaLoginFailure(error));
//                 apiErrors(error);
//                 callback(error);
//                 // console.log("Social Response Error", error.response);
//             });
//     };
// }

// /**
//  * @method getSocialMediaLoginSuccess
//  * @description return object containing action type
//  */
// export function getSocialMediaLoginSuccess(data) {
//     return {
//         type: SOCIAL_MEDIA_LOGIN_SUCCESS,
//         payload: formatLoginResult(data),
//     };
// }

// /**
//  * @method getSocialMediaLoginFailure
//  * @description return object containing action type
//  */
// export function getSocialMediaLoginFailure() {
//     return {
//         type: AUTH_API_FAILURE
//     };
// }


// /**
//  * @method forgotPasswordAPI
//  * @description Register user by email
//  */
// export function forgotPasswordAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.forgotPassword, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch(getForgotPasswordSuccess(response));
//             })
//             .catch((error) => {
//                 dispatch(getForgotPasswordFailure(error));
//                 apiErrors(error);
//                 callback(error);
//             });
//     };
// }

// /**
//  * @method getForgotPasswordSuccess
//  * @description return object containing action type
//  */
// export function getForgotPasswordSuccess(data) {
//     return {
//         type: FORGOT_PASSWORD_SUCCESS,
//         data,
//     };
// }


// /**
//  * @method getForgotPasswordFailure
//  * @description return object containing action type
//  */
// export function getForgotPasswordFailure() {
//     return {
//         type: AUTH_API_FAILURE
//     };
// }

/**
 * @method registerUserAPI
 * @description Register user by email
 */
export function registerUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.register, requestData, { headers })
            .then((response) => {
                console.log("response", response)
                callback(response);
                dispatch(getRegisterSuccess(response));
            })
            .catch((error) => {
                console.log("error", error)
                dispatch(getRegisterFailure(error));
                apiErrors(error);
                //callback(error);
            });
    };
}

/**
 * @method getRegisterSuccess
 * @description return object containing action type
 */
export function getRegisterSuccess(data) {
    return {
        type: REGISTER_SUCCESS,
        data,
    };
}

/**
* @method getRegisterFailure
* @description return object containing action type
*/
export function getRegisterFailure() {
    return {
        type: AUTH_API_FAILURE
    };
}

/**
 * @method getAllUserAPI
 * @description get all user's select list
 */
export function getAllUserAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_USER_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method addRoleAPI
 * @description add Role API 
 */
export function addRoleAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.addRoleAPI, requestData, { headers })
            .then((response) => {
                if (response.data.Result) {
                    callback(response);
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getAllRoleAPI
 * @description get all role's
 */
export function getAllRoleAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllRoleAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROLE_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method getRoleDataAPI
 * @description get role detail
 */
export function getRoleDataAPI(RoleId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRoleAPI}/${RoleId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UNIT_ROLE_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method setEmptyRoleDataAPI
 * @description set empty role detail in reducer
 */
export function setEmptyRoleDataAPI(RoleId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (RoleId == '') {
            dispatch({
                type: GET_UNIT_ROLE_DATA_SUCCESS,
                payload: '',
            });
            callback();
        }
    }
};


/**
 * @method deleteRoleAPI
 * @description delete Role
 */
export function deleteRoleAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRoleAPI}/${Id}`, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateRoleAPI
 * @description update Role details
 */
export function updateRoleAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateRoleAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: AUTH_API_FAILURE });
                apiErrors(error);
                //callback(error);
            });
    };
}

/**
 * @method addDepartmentAPI
 * @description add Department API 
 */
export function addDepartmentAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.addDepartmentAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getAllRoleAPI
 * @description get all role's
 */
export function getAllDepartmentAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllDepartmentAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_DEPARTMENT_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method getDepartmentAPI
 * @description get department detail
 */
export function getDepartmentAPI(DepartmentId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDepartmentAPI}/${DepartmentId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UNIT_DEPARTMENT_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method setEmptyDepartmentAPI
 * @description set empty department detail in reducer
 */
export function setEmptyDepartmentAPI(DepartmentId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (DepartmentId == '') {
            dispatch({
                type: GET_UNIT_DEPARTMENT_DATA_SUCCESS,
                payload: '',
            });
            callback();
        }
    }
};


/**
 * @method updateDepartmentAPI
 * @description update Department details
 */
export function updateDepartmentAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateDepartmentAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: AUTH_API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method deleteDepartmentAPI
 * @description delete Department
 */
export function deleteDepartmentAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteDepartmentAPI}/${Id}`, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getAllLevelAPI
 * @description get all level's
 */
export function getAllLevelAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllLevelAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_LEVEL_USER_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method addUserLevelAPI
 * @description add Users Level API 
 */
export function addUserLevelAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.addUserLevelAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getUserLevelAPI
 * @description get department detail
 */
export function getUserLevelAPI(LevelId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserLevelAPI}/${LevelId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UNIT_LEVEL_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method setEmptyLevelAPI
 * @description set empty level detail in reducer
 */
export function setEmptyLevelAPI(LevelId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (LevelId == '') {
            dispatch({
                type: GET_UNIT_LEVEL_DATA_SUCCESS,
                payload: '',
            });
            callback();
        }
    }
};

/**
 * @method updateUserLevelAPI
 * @description update Level details
 */
export function updateUserLevelAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateUserLevelAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: AUTH_API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method deleteUserLevelAPI
 * @description delete Level
 */
export function deleteUserLevelAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUserLevelAPI}/${Id}`, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method assignUserLevelAPI
 * @description assign level of users
 */
export function assignUserLevelAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.assignUserLevelAPI, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method addRoleAPI
 * @description add Role API 
 */
export function setApprovalLevelForTechnology(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setApprovalLevelForTechnology, requestData, { headers })
            .then((response) => {
                console.log('response >>>', response)
                if (response.data.Result) {
                    callback(response);
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method fetchPlantDataAPI
 * @description Used to fetch plant list
 */
export function getAllTechnologyAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTechnology}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TECHNOLOGY_DATA_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}



/**
 * @method createPrivilegePage
 * @description add Privilege Page API 
 */
export function createPrivilegePage(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.createPrivilegePage, requestData, { headers })
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getModuleSelectList
 * @description get Modules select list
 */
export function getModuleSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.moduleSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MODULE_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method rolesSelectList
 * @description get Roles select list
 */
export function rolesSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.rolesSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROLES_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getRolePermissionByUser
 * @description get Roles permission by user
 */
export function getRolePermissionByUser(UserId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRolePermissionByUser}/${UserId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getModuleActionInit
 * @description get Roles permission by user
 */
export function getModuleActionInit(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getModuleActionInit}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getPageSelectList
 * @description get Page select list
 */
export function getActionHeadsSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getActionHeadsSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ACTION_HEAD_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getPageSelectListByModule
 * @description get page select list by module
 */
export function getPageSelectListByModule(moduleId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPageSelectListByModule}?moduleId=${moduleId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getPageSelectList
 * @description get Page select list
 */
export function getPageSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPageSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PAGES_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method setPagePermissionRoleWise
 * @description set page permission role wise API 
 */
export function setPagePermissionRoleWise(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setPagePermissionRoleWise, requestData, { headers })
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method setPagePermissionUserWise
 * @description set page permission user wise API 
 */
export function setPagePermissionUserWise(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setPagePermissionUserWise, requestData, { headers })
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method setUserAdditionalPermission
 * @description set user additional permission user wise API 
 */
export function setUserAdditionalPermission(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setUserAdditionalPermission, requestData, { headers })
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}


/**
 * @method getMenuByUser
 * @description get department detail
 */
export function getMenuByUser(UserId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMenuByUser}/${UserId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MENU_BY_USER_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}



// /**
//  * @method verifyOtpAPI
//  * @description Verify otp sent on email
//  */
// export function verifyOtpAPI(requestData, callback) {

//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.verifyOtp, requestData, { headers })
//             .then((response) => {
//                 dispatch({ type: VERIFY_OTP_SUCCESS });
//                 callback(response);
//             })
//             .catch((error) => {
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method resendOtpAPI
//  * @description  Resned Verification code if expired or not found
//  */
// export function resendOtpAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.get(`${API.resendOtp}?email=${requestData.email}&registrationType=${requestData.registrationType}`, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch({ type: RESEND_OTP_SUCCESS });
//             })
//             .catch((error) => {
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method updatePasswordAPI
//  * @description update Password
//  */
// export function updatePasswordAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.put(API.updatePassword, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch(getUpdatePasswordSuccess(response));
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: AUTH_API_FAILURE,
//                 });
//                 apiErrors(error);
//                 callback(error);
//             });
//     };
// }

// /**
//  * @method getUpdatePasswordSuccess
//  * @description return object containing action type
//  */
// export function getUpdatePasswordSuccess(data) {
//     return {
//         type: UPDATE_PASSWORD_SUCCESS,
//     };
// }


// /**
//  * @method updatePasswordAPI
//  * @description update Password
//  */
// export function updateUserAccountDetailsAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.updateUserAccountDetail, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 // console.log("updateUserAccountDetailsAPI", response);
//                 dispatch({
//                     type: UPDATE_USER_ACCOUNT_DETAIL_SUCCESS,
//                     payload: formatLoginResult(response)
//                 });
//             })
//             .catch((error) => {
//                 // console.log("updateUserAccountDetailsAPI error", error);
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method socialLoginValues
//  * @description return new logged in user data
//  */
// export function getsocialLoginValuesAPI(data) {
//     // console.log(data);
//     return {
//         type: SOCIAL_USER_DATA,
//         payload: data
//     };
// }

export function showUserData(data) {
    return {
        type: LOGIN_SUCCESS,
        payload: (data),
    }
}

// /**
//  * @method getEditExperienceType
//  * @description edit experience type
//  */
// // export function internalRouteANDID(data) {
// //    console.log('data: ', data);
// //     return (dispatch) => {
// //         dispatch({
// //             type: INTERNAL_ROUTE_ID,
// //             payload: data
// //         });
// //     }
// // }

// /**
// * @method contactUsAPI
// * @description send contact us message
// */
// export function contactUsAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.contactUs, requestData, { headers })
//             .then((response) => {
//                 dispatch({
//                     type: SEND_MESSAGE_SUCCESS
//                 });
//                 callback(response);
//             }).catch((error) => {
//                 dispatch({
//                     type: AUTH_API_FAILURE,
//                 });
//                 apiErrors(error);
//             });
//     };
// }