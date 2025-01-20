import axios from 'axios';
import { apiErrors } from '../../helper/util';
import {
    API, AUTH_API_REQUEST, AUTH_API_FAILURE, API_REQUEST, API_FAILURE, API_SUCCESS, LOGIN_SUCCESS, REGISTER_SUCCESS,
    GET_ROLE_SUCCESS, GET_DEPARTMENT_SUCCESS, GET_TECHNOLOGY_DATA_LIST_SUCCESS, GET_LEVEL_USER_SUCCESS, GET_USER_SUCCESS, GET_USER_DATA_SUCCESS,
    GET_USER_UNIT_DATA_SUCCESS, GET_UNIT_ROLE_DATA_SUCCESS, GET_UNIT_DEPARTMENT_DATA_SUCCESS, GET_UNIT_LEVEL_DATA_SUCCESS, GET_ROLES_SELECTLIST_SUCCESS,
    GET_MODULE_SELECTLIST_SUCCESS, GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS, GET_PAGES_SELECTLIST_SUCCESS, GET_ACTION_HEAD_SELECTLIST_SUCCESS,
    GET_MENU_BY_USER_DATA_SUCCESS, GET_LEFT_MENU_BY_MODULE_ID_AND_USER, LOGIN_PAGE_INIT_CONFIGURATION, config, GET_USERS_BY_TECHNOLOGY_AND_LEVEL,
    GET_LEVEL_BY_TECHNOLOGY, GET_MENU_BY_MODULE_ID_AND_USER, LEVEL_MAPPING_API, GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS,
    SIMULATION_LEVEL_DATALIST_API, GET_SIMULATION_LEVEL_BY_TECHNOLOGY, GET_TOP_AND_LEFT_MENU_DATA, GET_MASTER_SELECT_LIST, MASTER_LEVEL_DATALIST_API, GET_MASTER_LEVEL_BY_MASTERID, COSTINGS_APPROVAL_DASHBOARD, AMENDMENTS_APPROVAL_DASHBOARD, GET_USERS_MASTER_LEVEL_API, GET_RFQ_USER_DATA_SUCCESS,
    ONBOARDING_LEVEL_DATALIST_API, GET_ONBOARDING_LEVEL_BY_ID, GET_PLANT_SELECT_LIST_FOR_DEPARTMENT, ONBOARDINGID, MANAGE_LEVEL_TAB_API, GET_DIVISION_SUCCESS, GET_DIVISION_DATA_SUCCESS, GET_DIVISION_LIST_SUCCESS, GET_DIVISION_LIST_FOR_DEPARTMENT
} from '../../config/constants';
import { formatLoginResult } from '../../helper/ApiResponse';
import { MESSAGES } from "../../config/message";
import { loggedInUserId } from '../../helper/auth';
import Toaster from '../../components/common/Toaster';
import axiosInstance from '../../utils/axiosInstance';


/**
 * @method loginUser
 * @description get data from dummy api
 */

// const config() = config;

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
                //already password encryped that's why didnt use axiosInstance here
        axios.post(API.login, requestData, config())
            // axios.post(API.login, requestData, CustomHeader)          						//RE
            .then((response) => {
                if (response && response.data && response.data.Result) {
                    // dispatch(getLoginSuccess(response));
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


const parseUserAgent = (userAgent) => {
    // Define an array of browser regex patterns.
    const browserPatterns = [
        { brand: 'Edge', regex: /Edg\/([\d\.]+)/i },
        { brand: 'Chrome', regex: /Chrome\/([\d\.]+)/i },
        { brand: 'Firefox', regex: /Firefox\/([\d\.]+)/i },
        { brand: 'Safari', regex: /Version\/([\d\.]+).*Safari\//i },
        { brand: 'Opera', regex: /OPR\/([\d\.]+)/i },
        { brand: 'IE', regex: /MSIE\s([\d\.]+);|Trident\/.*rv:([\d\.]+)/i }
    ];

    let brandInfo = { brand: 'Unknown', version: 'Unknown' };

    // Iterate through each pattern and return the brand and version if found.
    for (let pattern of browserPatterns) {
        const match = userAgent.match(pattern.regex);
        if (match) {
            brandInfo = {
                brand: pattern.brand,
                version: match[1] || match[2]
            };
            break;
        }
    }

    return brandInfo;
};

export function TokenAPI(requestData, callback) {
    return async (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        // Parse the User-Agent string.
        const { brand: browserName, version: browserVersion } = parseUserAgent(window.navigator.userAgent);
        // Include the User-Agent details in the requestData object.
        const body = {
            UserName: requestData.username,
            Password: requestData.password,
            RememberMe: requestData.rememberMe || false,
            IPAddress: await getLocalIPAddress(), // Fetch local IP using WebRTC
            MacAddress: '', // Populate this field if you have the MAC address, otherwise remove it.
            UserAgent: `${browserName} ${browserVersion}`,
            Token: requestData.Token,
            Audiance: requestData.audiance
        };


        // Fetch the public IP from a service (if necessary).
        // axios.get('https://api.ipify.org?format=json')
        //     .then(response => {
        //         body.IPAddress = response.data.ip; // Include the IP address.

        // Proceed with the original request now including the IP and User-Agent.
        //already password encryped that's why didnt use axiosInstance here
        axios.post(API.login, body, config()) // Make sure you send a JSON body.
            .then((res) => {
                if (res && res.status === 200) {
                    callback(res);
                }
            }).catch((error) => {
                dispatch(getFailure(error));
                apiErrors(error);
                callback(error);
            });
        // }).catch(error => {
        //     apiErrors(error);
        //     callback(error);
        // });
    };
}
const getLocalIPAddress = async () => {
    try {
        const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const pc = new RTCPeerConnection(rtcConfig);
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        let resolved = false;
        return new Promise((resolve) => {
            pc.onicecandidate = async (event) => {
                if (!resolved && event.candidate && event.candidate.candidate) {
                    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
                    const match = event.candidate.candidate.match(ipRegex);
                    if (match) {
                        const localIP = match[0];
                        resolve(localIP);
                        resolved = true;
                        pc.onicecandidate = null; // Unsubscribe from further ICE candidate events
                    }
                }
            };
        });
    } catch (error) {

        return null;
    }
};



export function AutoSignin(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        let queryParams = `Token=${requestData.Token}&UserName=${requestData.UserName}`;
        axiosInstance.post(API.AutoSignin, requestData, CustomHeader)
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
        axiosInstance.post(API.logout, requestData, config())
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
        axiosInstance.post(API.register, requestData, config())
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


export function registerRfqUser(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.registerRfqUser, requestData, config())
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
        const request = axios.get(`${API.getUserSelectList}`, config());
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
        axios.get(`${API.getAllUserDataAPI}?loggedInUserId=${loggedInUserId()}&department_id=${data?.DepartmentId}&role_id=${data?.RoleId}&logged_in_user=${data?.logged_in_user}&name=${data?.name}&userType=${data?.userType}&email=${data?.email}&mobileNo=${data?.mobileNo}&phoneNo=${data?.phone}&company=${data?.company}&createdBy=${data?.createdBy}&createdDate=${data?.createdDate}&modifiedDate=${data?.modifiedDate}&userName=${data?.userName}&modifiedBy=${data?.modifiedBy}&role=${data?.role}&isApplyPagination=${data?.isPagination}&skip=${data?.skip}&take=${data?.take}`, config())
            .then((response) => {
                if (data?.userType === 'RFQ') {
                    dispatch({
                        type: GET_RFQ_USER_DATA_SUCCESS,
                        payload: response.status === 200 ? response?.data?.DataList : [],
                    });
                } else {
                    dispatch({
                        type: GET_USER_DATA_SUCCESS,
                        payload: response.status === 200 ? response?.data?.DataList : [],
                    });
                }
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({
            type: GET_USER_UNIT_DATA_SUCCESS,
            payload: [],
        });
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserDataAPI}?userId=${UserId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config());
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUserAPI}/${Id}/${loggedInUser?.loggedInUserId}`, config())
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
        axiosInstance.post(`${API.activeInactiveUser}`, requestData, config())
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
        axiosInstance.put(API.updateUserAPI, requestData, config())
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

export function updateRfqUser(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.put(API.updateRfqUser, requestData, config())
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
export function getUsersTechnologyLevelAPI(UserId, technologyId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserTechnologyLevelForCosting}/${UserId}/${technologyId}`, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            callback(response);
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
        axiosInstance.post(API.setUserTechnologyLevelForCosting, requestData, config())
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
        axiosInstance.put(API.updateUserTechnologyLevelForCosting, requestData, config())
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
    const requestedData = { loggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.addRoleAPI, requestedData, config())
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
        const request = axios.get(`${API.getAllRoleAPI}`, config());
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRoleAPI}/${RoleId}/${loggedInUser?.loggedInUserId}`, config());
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
        axios.delete(`${API.deleteRoleAPI}/${Id}`, config())
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
    const requestedData = { ...requestData ,loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.put(API.updateRoleAPI, requestedData, config())
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
        axiosInstance.post(API.addDepartmentAPI, requestData, config())
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
        const request = axios.get(`${API.getAllDepartmentAPI}`, config());
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDepartmentAPI}/${DepartmentId}/${loggedInUser?.loggedInUserId}`, config());
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
        axiosInstance.put(API.updateDepartmentAPI, requestData, config())
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
        const queryParams = `divisionId=${Id}&loggedInUserId=${loggedInUserId}`;
        axios.delete(`${API.deleteDepartmentAPI}${queryParams}`, config())
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
        // const request = axios.get(`${API.getAllLevelAPI}`, config());
        const request = axios.get(`${API.getSelectListOfLevel}`, config());
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
        axiosInstance.post(API.addUserLevelAPI, requestData, config())
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
        const request = axios.get(`${API.getUserLevelAPI}/${LevelId}`, config());
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
        axiosInstance.put(API.updateUserLevelAPI, requestData, config())
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
        axios.delete(`${API.deleteUserLevelAPI}/${Id}`, config())
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
 * @method addSimulationLevel
 * @description ADD SIMULATION LEVEL
 */
export function addSimulationLevel(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.addSimulationLevel, requestData, config())
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
 * @method updateSimulationLevel
 * @description UPDATE SIMULATION LEVEL
 */
export function updateSimulationLevel(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(API.updateSimulationLevel, requestData, config())
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
 * @method getSimulationLevel
 * @description GET SIMULATION LEVEL
 */
export function getSimulationLevel(LevelId, approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getSimulationLevel}/${LevelId}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
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
 * @method assignUserLevelAPI
 * @description assign level of users
 */
export function assignUserLevelAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.assignUserLevelAPI, requestData, config())
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
        axiosInstance.post(API.setApprovalLevelForTechnology, requestData, config())
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
export function getLevelMappingAPI(LevelId, approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getLevelMappingAPI}/${LevelId}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
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
        axiosInstance.put(API.updateLevelMappingAPI, requestData, config())
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
        const request = axios.get(`${API.getAllLevelMappingAPI}`, config());
        request.then((response) => {
            dispatch({
                type: LEVEL_MAPPING_API,
                payload: response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getSimulationLevelDataList
 * @description GET SIMULATION LEVEL DATALIST
 */
export function getSimulationLevelDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSimulationLevelDataList}`, config());
        request.then((response) => {
            dispatch({
                type: SIMULATION_LEVEL_DATALIST_API,
                payload: response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getAllTechnologyAPI
 * @description Used to fetch plant list
 */
export function getAllTechnologyAPI(callback, data, manageLevel = false) {
    const listFor = manageLevel ? data ?? "" : data ?? "users"
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTechnology}?ListFor=${listFor}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TECHNOLOGY_DATA_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getSimulationTechnologySelectList
 * @description GET SELECT LIST OF SIMULATION TECHNOLOGY
 */
export function getSimulationTechnologySelectList(callback, data) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSimulationTechnologySelectList}?ListFor=${data ?? 'Users'}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
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
        axiosInstance.post(API.createPrivilegePage, requestData, config())
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
        const request = axios.get(`${API.moduleSelectList}`, config());
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
        const request = axios.get(`${API.rolesSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROLES_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
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
        const request = axios.get(`${API.getRolePermissionByUser}/${UserId}`, config());
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
        const request = axios.get(`${API.getPermissionByUser}/${UserId}`, config());
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
        const request = axios.get(`${API.getModuleActionInit}`, config());
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
        const request = axios.get(`${API.getModuleActionInitNew}`, config());
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
        const request = axios.get(`${API.getActionHeadsSelectList}`, config());
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
        const request = axios.get(`${API.getPageSelectListByModule}?moduleId=${moduleId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
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
        const request = axios.get(`${API.getPageSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PAGES_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
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
        axiosInstance.post(API.setPagePermissionRoleWise, requestData, config())
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
        const request = axios.get(`${API.getLoginPageInit}`, config());
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
        axiosInstance.post(API.setPagePermissionUserWise, requestData, config())
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
        axiosInstance.post(API.setUserAdditionalPermission, requestData, config())
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
        axiosInstance.post(`${API.revertDefaultPermission}/${UserId}`, config())
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
        const request = axios.get(`${API.getMenuByUser}/${UserId}`, config());
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
        dispatch({
            type: API_REQUEST
        });
        const request = axios.get(`${API.getLeftMenu}/${ModuleId}/${UserId}`, config());
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
        axiosInstance.post(API.checkPageAuthorization, requestData, config())
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
 * @method getUsersByTechnologyAndLevel
 * @description get user by technology and level
 */
export function getUsersByTechnologyAndLevel(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserByTechnologyAndLevel}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_USERS_BY_TECHNOLOGY_AND_LEVEL,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
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
export function getLevelByTechnology(isAPICall, technologyId, approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (isAPICall) {
            if (technologyId !== '') {

                //dispatch({ type: API_REQUEST });
                const request = axios.get(`${API.getLevelByTechnology}/${technologyId}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
                request.then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_LEVEL_BY_TECHNOLOGY,
                            payload: response.data.SelectList,
                        });
                        callback(response);
                    } else {
                        Toaster.error(MESSAGES.SOME_ERROR);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
            }
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
        const request = axios.get(`${API.getLeftMenu}/${ModuleId}/${UserId}`, config());
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
        axiosInstance.post(API.addCompanyAPI, requestData, config())
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
        axiosInstance.put(API.updateCompany, requestData, config())
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

export function getSimualationLevelByTechnology(isAPICall, technologyId, approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (isAPICall) {
            if (technologyId !== '') {
                //dispatch({ type: API_REQUEST });
                const request = axios.get(`${API.getSimulationLevelByTechnology}/${technologyId}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
                request.then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_SIMULATION_LEVEL_BY_TECHNOLOGY,
                            payload: response.data.SelectList,
                        });
                        callback(response);
                    } else {
                        Toaster.error(MESSAGES.SOME_ERROR);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
            }
        } else {
            dispatch({
                type: GET_SIMULATION_LEVEL_BY_TECHNOLOGY,
                payload: [],
            });
            callback();

        }
    };
}

/**
* @method getUsersSimulationTechnologyLevelAPI
* @description get User's technology level
*/
export function getUsersSimulationTechnologyLevelAPI(UserId, technologyId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserSimulationTechnologyLevel}/${UserId}/${technologyId}`, config());
        // const request = axios.get(`${API.getUserSimulationTechnologyLevelForCosting}/${UserId}/${technologyId}`, config());          						//RE
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
 * @method getTopAndLeftMenuData
 * @description GET ALL MENU DATA AND LEFT MENU DATA
 */
export function getTopAndLeftMenuData(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getTopAndLeftMenuData}/${loggedInUserId()}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_TOP_AND_LEFT_MENU_DATA,
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
 * @method getSimulationTechnologySelectList
 * @description GET SELECT LIST OF SIMULATION TECHNOLOGY
 */
export function getMastersSelectList(callback, data) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMastersSelectList}?ListFor=${data ?? 'Users'}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MASTER_SELECT_LIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method addMasterLevel
 * @description ADD MASTER LEVEL
 */
export function addMasterLevel(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.addMasterLevel, requestData, config())
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
 * @method updateMasterLevel
 * @description UPDATE MASTER LEVEL
 */
export function updateMasterLevel(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(API.updateMasterLevel, requestData, config())
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
 * @method getMasterLevel
 * @description GET MASTER LEVEL
 */
export function getMasterLevel(LevelId, approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getMasterLevel}/${LevelId}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
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
 * @method getSimulationLevelDataList
 * @description GET SIMULATION LEVEL DATALIST
 */
export function getMasterLevelDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getMasterLevelDataList}`, config());
        request.then((response) => {
            dispatch({
                type: MASTER_LEVEL_DATALIST_API,
                payload: response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


export function getMasterLevelByMasterId(isAPICall, masterId, approvalId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (isAPICall) {
            if (masterId !== '') {
                //dispatch({ type: API_REQUEST });
                const request = axios.get(`${API.getMasterLevelByMasterId}/${masterId}/${approvalId}/${loggedInUser?.loggedInUserId}`, config());
                request.then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_MASTER_LEVEL_BY_MASTERID,
                            payload: response.data.SelectList,
                        });
                        callback(response);
                    } else {
                        Toaster.error(MESSAGES.SOME_ERROR);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
            }
        } else {
            dispatch({
                type: GET_MASTER_LEVEL_BY_MASTERID,
                payload: [],
            });
            callback();

        }
    };
}

/**
* @method getUsersSimulationTechnologyLevelAPI
* @description get User's technology level
*/
export function getUsersMasterLevelAPI(UserId, technologyId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserMasterLevelForCosting}/${UserId}/${technologyId}`, config());
        request.then((response) => {
            if (response && response.data && response.data.Result) {
                dispatch({
                    type: GET_USERS_MASTER_LEVEL_API,
                    payload: response.data.Data.MasterLevels,
                });
                callback(response);
            } else {
                dispatch({
                    type: GET_USERS_MASTER_LEVEL_API,
                    payload: [],
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
 * @method activeInactiveRole
 * @description active Inactive User
 */
export function activeInactiveRole(requestData, callback) {
    const requestedData = { loggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.post(`${API.activeInactiveRole}`, requestedData, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

export function updatePassword(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.put(API.updatePassword, requestData, config())
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


export function forgetPassword(UserName, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.forgetPassword}/${UserName}`, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            if (response) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

export function getUnassociatedPartNumber(partNumber, technologyId, nfrId, partTypeId, isTechnologyUpdateRequired, callback) {
    return axios.get(`${API.getUnassociatedPartNumber}?loggedInUserId=${loggedInUserId()}${partNumber ? `&partNumber=${partNumber}` : ''}${technologyId ? `&technologyId=${technologyId}` : ''}${nfrId ? `&nfrId=${nfrId}` : ''}${partTypeId ? `&partTypeId=${partTypeId}` : ''}&isTechnologyUpdateRequired=${isTechnologyUpdateRequired}`, config()).catch(error => {
        apiErrors(error);
        callback(error);
        return Promise.reject(error)
    });
}

export function checkHighestApprovalLevelForHeadsAndApprovalType(requestData, callback) {
    const requestedData = { loggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.post(`${API.checkHighestApprovalLevelForHeadsAndApprovalType}`, requestedData, config())
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
 * @method addOnboardingLevel
* @description ADD ONBOARDING LEVEL
 */
export function addOnboardingLevel(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.addOnboardingLevel, requestData, config())
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
 * @method updateOnboardingLevel
 * @description UPDATE ONBOARDING LEVEL
 */
export function updateOnboardingLevel(requestData, callback) {
    return (dispatch) => {
        axiosInstance.put(API.updateOnboardingLevel, requestData, config())
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
 * @method getOnboardingLevelDataList
 * @description GET ONBOARDING LEVEL DATALIST
 */
export function getOnboardingLevelDataList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getOnboardingLevelDataList}`, config());
        request.then((response) => {
            dispatch({
                type: ONBOARDING_LEVEL_DATALIST_API,
                payload: response.status === 204 ? [] : response.data.DataList
            })
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}
/**
 * @method getOnboardingLevel
 * @description GET ONBOARDING LEVEL 
 */
export function getOnboardingLevel(approvalTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getOnboardingLevel}/${ONBOARDINGID}/${approvalTypeId}/${loggedInUser?.loggedInUserId}`, config());
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
 * @method getOnboardingLevelById
 * @description GET ONBOARDING LEVEL BY ID
 */
export function getOnboardingLevelById(isAPICall, approvalId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (isAPICall) {
            //dispatch({ type: API_REQUEST });
            const request = axios.get(`${API.getOnboardingLevelById}/${ONBOARDINGID}/${approvalId}/${loggedInUser?.loggedInUserId}`, config());
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_ONBOARDING_LEVEL_BY_ID,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    Toaster.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_ONBOARDING_LEVEL_BY_ID,
                payload: [],
            });
            callback();

        }
    };
}
/**
 * @method getPlantSelectListForDepartment
 * @description GET SELECT LIST OF DEPARTMENT PLANT 
 */
export function getPlantSelectListForDepartment(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(`${API.getPlantSelectListForDepartment}`, data, config());
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_PLANT_SELECT_LIST_FOR_DEPARTMENT,
                    payload: response.data.DataList,
                });
                callback(response);
            } else if (response.status === 204) {
                dispatch({
                    type: GET_PLANT_SELECT_LIST_FOR_DEPARTMENT,
                    payload: [],
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getUsersOnboardingLevelAPI
* @description get User's Onboarding level
*/
export function getUsersOnboardingLevelAPI(UserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUserOnboardingLevel}/${UserId}/${ONBOARDINGID}`, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            if (response && response.data && response.data.Result) {
                callback(response);
            }
            else if (response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}
export function getAllApproverList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllApproverList}?loggedInUserId=${loggedInUserId()}&processId=${data.processId}&levelId=${data.levelId}&mode=${data.mode}`, config());
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
 * @method:manageLevelTabApi
 * @description: Used for managing level tab apis
 */
export function manageLevelTabApi(isCallApi = false) {
    return (dispatch) => {
        dispatch({
            type: MANAGE_LEVEL_TAB_API,
            payload: isCallApi,
        })
    }
}

/**
 * @method addDivisionAPI
 * @description add Division API 
 */
export function addDivisionAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.post(API.addDivisionAPI, requestData, config())
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
 * @method updateDivisionAPI
 * @description update Division details
 */
export function updateDivisionAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axiosInstance.put(API.updateDivisionAPI, requestData, config())
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
 * @method deleteDivisionAPI
 * @description delete Division
 */
export function deleteDivisionAPI(Id, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `divisionId=${Id}&loggedInUserId=${loggedInUserId}`;
        axios.delete(`${API.deleteDivisionAPI}?${queryParams}`, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method getAllDivisionAPI
 * @description get all divisions
 */
export function getAllDivisionAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllDivisionAPI}`, config());
        request.then((response) => {
            if (response) {
                dispatch({
                    type: GET_DIVISION_SUCCESS,
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

 * @method getDivisionAPI
 * @description get division detail
 */
export function getDivisionAPI(DivisionId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDivisionAPI}/${DivisionId}/${loggedInUser?.loggedInUserId}`, config());
        request.then((response) => {
            if (response) {
                dispatch({
                    type: GET_DIVISION_DATA_SUCCESS,
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
 * @method getDivisionListAPI
 * @description get division list   
 */
export function getDivisionListAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        // const request = axios.get(`${API.getAllLevelAPI}`, config());
        const request = axios.get(`${API.getDivisionListAPI}`, config());
        request.then((response) => {
            if (response) {
                dispatch({
                    type: GET_DIVISION_LIST_SUCCESS,
                    payload: response?.data?.DataList,
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
 * @method getAllDivisionListAssociatedWithDepartment
 * @description get all division list associated with department
 */
export function getAllDivisionListAssociatedWithDepartment(data, callback) {
    const requestData = { loggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(`${API.getAllDivisionListAssociatedWithDepartment}`, requestData, config());
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_DIVISION_LIST_FOR_DEPARTMENT,
                    payload: response.status === 204 ? [] : response.data.DataList,
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
 * @method getDelegateeUserList
 * @description get delegatee user list for dropdown
 */
export function getDelegateeUserList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDelegateeUserListAPI}?loggedInUserId=${loggedInUserId()}&delegatorUserId=${data?.delegatorUserId}&startDate=${data?.startDate}&endDate=${data?.endDate}`, config());
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_DIVISION_LIST_FOR_DEPARTMENT,
                    payload: [],
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}
/**
 * @method createDelegation
 * @description Create delegation for a user
 */
export function createDelegation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(`${API.createDelegation}`, data, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            callback(response);
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getDelegationHistory
 * @description get delegation history
 */
export function getDelegationHistory(delegatorUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDelegationHistory}?delegatorUserId=${delegatorUserId??null}`, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    }
}

export function revokeDelegation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.put(API.revokeDelegation, data, config());
        request.then((response) => {
            dispatch({ type: API_SUCCESS });
            callback(response);
        }).catch((error) => {
            callback(error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    }
}
