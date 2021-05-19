import axios from 'axios';
import { apiErrors } from '../../helper/util';
import {
    API, AUTH_API_REQUEST, AUTH_API_FAILURE, API_REQUEST, API_FAILURE, API_SUCCESS, LOGIN_SUCCESS, REGISTER_SUCCESS,
    GET_ROLE_SUCCESS, GET_DEPARTMENT_SUCCESS, GET_TECHNOLOGY_DATA_LIST_SUCCESS, GET_LEVEL_USER_SUCCESS, GET_USER_SUCCESS, GET_USER_DATA_SUCCESS,
    GET_USER_UNIT_DATA_SUCCESS, GET_UNIT_ROLE_DATA_SUCCESS, GET_UNIT_DEPARTMENT_DATA_SUCCESS, GET_UNIT_LEVEL_DATA_SUCCESS, GET_ROLES_SELECTLIST_SUCCESS,
    GET_MODULE_SELECTLIST_SUCCESS, GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS, GET_PAGES_SELECTLIST_SUCCESS, GET_ACTION_HEAD_SELECTLIST_SUCCESS,
    GET_MENU_BY_USER_DATA_SUCCESS, GET_LEFT_MENU_BY_MODULE_ID_AND_USER, LOGIN_PAGE_INIT_CONFIGURATION, config, GET_USERS_BY_TECHNOLOGY_AND_LEVEL,
    GET_LEVEL_BY_TECHNOLOGY, GET_MENU_BY_MODULE_ID_AND_USER, LEVEL_MAPPING_API
} from '../../config/constants';
import { formatLoginResult } from '../../helper/ApiResponse';
import { toastr } from "react-redux-toastr";
import { MESSAGES } from "../../config/message";


/**
 * @method loginUser
 * @description get data from dummy api
 */

const headers = config;

const CustomHeader = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Authorization': `Bearer NRIsJAXFS-IgPMtfW05J1EiTwhv4z37BnFCk2TynvAdVYMuBIal7dTYyfboxRFjvPJ1zPl4r4LfQJ8_1fKDnSxTmGmThhl6YabKHaGvzp2WDQ7P0wFZs2wW10Mcmkt4Xb4ybDGzwSLt6fwRuI1uGNRuyNMxKQz-s533rIF5Qx08vwumo5ogN5x_oyi__b4KXJWbUU_0qLaJGLwISEf4o3_4CPBoP6Gv_tAGIO1W250SzOF3zwYpTxi8LwghOtQse`,
    'Access-From': 'WEB',
    'Api-Key': `${process.env.REACT_APP_API_KEY}`,
}

export function loginUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.login, requestData, headers)
            .then((response) => {
                if (response && response.data && response.data.Result) {
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

export function TokenAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        let queryParams = '';
        if (requestData.IsRefreshToken) {
            queryParams = `refresh_token=${requestData.refresh_token}&ClientId=${requestData.ClientId}&grant_type=${requestData.grant_type}`;
        } else {
            queryParams = `userName=${requestData.username}&password=${requestData.password}&grant_type=${requestData.grant_type}`;
        }
        axios.post(API.tokenAPI, queryParams, CustomHeader)
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                dispatch(getFailure(error));
                apiErrors(error);
                callback(error);
            });
    };
}

export function AutoSignin(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        let queryParams = `Token=${requestData.Token}&UserName=${requestData.UserName}`;
        axios.post(API.AutoSignin, requestData, CustomHeader)
            .then((response) => {
                console.log('response success: ', response);
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                console.log('response error: ', error);
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
        axios.post(API.logout, requestData, headers)
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method registerUserAPI
 * @description Register user by email
 */
export function registerUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.register, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
                dispatch(getRegisterSuccess(response));
            })
            .catch((error) => {
                dispatch(getRegisterFailure(error));
                apiErrors(error);
                callback(error);
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
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getAllUserDataAPI
 * @description get all user's data list
 */
export function getAllUserDataAPI(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getAllUserDataAPI}?department_id=${data.DepartmentId}&role_id=${data.RoleId}&logged_in_user=${data.logged_in_user}`, headers)
            .then((response) => {
                dispatch({
                    type: GET_USER_DATA_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
* @method getUserDataAPI
* @description get User's data
*/
export function getUserDataAPI(UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserDataAPI}?userId=${UserId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_USER_UNIT_DATA_SUCCESS,
                    payload: response.data.Data,
                });
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
 * @method deleteUser
 * @description delete user
 */
export function deleteUser(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUserAPI}/${Id}`, headers)
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
 * @method activeInactiveUser
 * @description active Inactive User
 */
export function activeInactiveUser(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.post(`${API.activeInactiveUser}`, requestData, headers)
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
 * @method updateUserAPI
 * @description update User details
 */
export function updateUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateUserAPI, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                callback(error);
                dispatch({ type: AUTH_API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method setEmptyUserDataAPI
 * @description set empty user detail in reducer
 */
export function setEmptyUserDataAPI(UserId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (UserId === '') {
            dispatch({
                type: GET_USER_UNIT_DATA_SUCCESS,
                payload: '',
            });
            callback();
        }
    }
};

/**
* @method getUsersTechnologyLevelAPI
* @description get User's technology level
*/
export function getUsersTechnologyLevelAPI(UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserTechnologyLevelForCosting}/${UserId}`, headers);
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            if (response && response.data && response.data.Result) {
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
 * @method setUserTechnologyLevelForCosting
 * @description set user technology level for costing
 */
export function setUserTechnologyLevelForCosting(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setUserTechnologyLevelForCosting, requestData, headers)
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
 * @method updateUserTechnologyLevelForCosting
 * @description update User Technology Level For Costing
 */
export function updateUserTechnologyLevelForCosting(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateUserTechnologyLevelForCosting, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
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
 * @method addRoleAPI
 * @description ADD ROLE API
 */
export function addRoleAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.addRoleAPI, requestData, headers)
            .then((response) => {
                if (response.data.Result) {
                    dispatch({ type: API_SUCCESS });
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
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllRoleAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROLE_SUCCESS,
                    payload: response.data.DataList,
                });
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
        if (RoleId === '') {
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
        dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateRoleAPI, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
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
        axios.post(API.addDepartmentAPI, requestData, headers)
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
 * @method getAllRoleAPI
 * @description get all role's
 */
export function getAllDepartmentAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllDepartmentAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_DEPARTMENT_SUCCESS,
                    payload: response.data.DataList,
                });
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
 * @method getDepartmentAPI
 * @description get department detail
 */
export function getDepartmentAPI(DepartmentId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
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
        if (DepartmentId === '') {
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
        dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateDepartmentAPI, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
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
                //callback(error.response);
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
        dispatch({ type: API_REQUEST });
        // const request = axios.get(`${API.getAllLevelAPI}`, headers);
        const request = axios.get(`${API.getSelectListOfLevel}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_LEVEL_USER_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
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
        axios.post(API.addUserLevelAPI, requestData, headers)
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
        if (LevelId === '') {
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
        axios.put(API.updateUserLevelAPI, requestData, headers)
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
        axios.post(API.assignUserLevelAPI, requestData, headers)
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
        axios.post(API.setApprovalLevelForTechnology, requestData, headers)
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
 * @method getLevelMappingAPI
 * @description get Level mapping 
 */
export function getLevelMappingAPI(LevelId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getLevelMappingAPI}/${LevelId}`, headers);
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
 * @method updateLevelMappingAPI
 * @description update Level Mapping
 */
export function updateLevelMappingAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateLevelMappingAPI, requestData, headers)
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
 * @method getAllLevelMappingAPI
 * @description get all level Mapping
 */
export function getAllLevelMappingAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllLevelMappingAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: LEVEL_MAPPING_API,
                    payload: response.data.DataList
                })
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
 * @method fetchPlantDataAPI
 * @description Used to fetch plant list
 */
export function getAllTechnologyAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
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
        axios.post(API.createPrivilegePage, requestData, headers)
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
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRolePermissionByUser}/${UserId}`, headers);
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
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
 * @method getPermissionByUser
 * @description get permission by user
 */
export function getPermissionByUser(UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPermissionByUser}/${UserId}`, headers);
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
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
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getModuleActionInit}`, headers);
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
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
 * @method getModuleActionInitNew
 * @description get Roles permission by user
 */
export function getModuleActionInitNew(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getModuleActionInitNew}`, headers);
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
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
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getActionHeadsSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: API_SUCCESS });
                dispatch({
                    type: GET_ACTION_HEAD_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
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
        axios.post(API.setPagePermissionRoleWise, requestData, headers)
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
 * @method getLoginPageInit
 * @description get Login Page Initial to set Email or Username on login page.
 */
export function getLoginPageInit(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getLoginPageInit}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: LOGIN_PAGE_INIT_CONFIGURATION,
                    payload: response.data.Data,
                });
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
 * @method setPagePermissionUserWise
 * @description set page permission user wise API 
 */
export function setPagePermissionUserWise(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.setPagePermissionUserWise, requestData, headers)
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
        axios.post(API.setUserAdditionalPermission, requestData, headers)
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
 * @method revertDefaultPermission
 * @description revert user additional permission user wise API 
 */
export function revertDefaultPermission(UserId, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(`${API.revertDefaultPermission}/${UserId}`, headers)
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
            //apiErrors(error);
        });
    };
}


/**
 * @method getLeftMenu
 * @description GET LEFT MENU BY MODULEID AND USER
 */
export function getLeftMenu(ModuleId, UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getLeftMenu}/${ModuleId}/${UserId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_LEFT_MENU_BY_MODULE_ID_AND_USER,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
        });
    };
}

export function showUserData(data) {
    return {
        type: LOGIN_SUCCESS,
        payload: (data),
    }
}

export function checkPageAuthorization(requestData, callback) {
    return (dispatch) => {
        axios.post(API.checkPageAuthorization, requestData, headers)
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                callback(error.response);
                apiErrors(error);
            });
    };
}

/**
 * @method getModuleIdByPathName
 * @description GET MODULE ID BY PATH NAME
 */
export function getModuleIdByPathName(pathname, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getModuleIdByPathName}?navigationURL=${pathname}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
        });
    };
}

/**
 * @method getUsersByTechnologyAndLevel
 * @description get user by technology and level
 */
export function getUsersByTechnologyAndLevel(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserByTechnologyAndLevel}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_USERS_BY_TECHNOLOGY_AND_LEVEL,
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
 * @method getLevelByTechnology
 * @description GET LEVEL DROPDOWN BY TECHNOLOGY
 * @param technologyId
 */
export function getLevelByTechnology(technologyId, callback) {
    return (dispatch) => {
        if (technologyId !== '') {

            //dispatch({ type: API_REQUEST });
            const request = axios.get(`${API.getLevelByTechnology}/${technologyId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LEVEL_BY_TECHNOLOGY,
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
        } else {
            dispatch({
                type: GET_LEVEL_BY_TECHNOLOGY,
                payload: [],
            });
            callback();

        }
    };
}

/**
 * @method getLeftMenu
 * @description GET LEFT MENU BY MODULEID AND USER
 */
export function getMenu(ModuleId, UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getLeftMenu}/${ModuleId}/${UserId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MENU_BY_MODULE_ID_AND_USER,
                    payload: response.data.Data,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
        });
    };
}

/**
 * @method addDepartmentAPI
 * @description add Department API 
 */
export function addCompanyAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.addCompanyAPI, requestData, headers)
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
 * @method addDepartmentAPI
 * @description add Department API 
 */
export function updateCompanyAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.put(API.updateCompany, requestData, headers)
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