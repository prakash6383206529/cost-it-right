import axios from "axios/index";
import { reactLocalStorage } from 'reactjs-localstorage';
/**
* add a Bearer Token as a header 
*/

let loggedInDetail = reactLocalStorage.getObject('userResponse')
console.log("loggedInDetail", typeof loggedInDetail )
if (loggedInDetail !== '') {
    
    const userAuthToken = axios.defaults.headers.common['Authorization'];
    if (loggedInDetail && (userAuthToken === undefined || userAuthToken === '' || userAuthToken === null)) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${loggedInDetail.token}`;
    }
}

export const ASSET_DETAIL                  = 'asset_detail';
export const ASSET_LIST                    = 'asset_list';
export const EDIT_USER_DATA                = "edit_user_data";
export const GET_ALERTS                    = "get_alerts";
export const GET_ALERT_HISTORY             = "get_alert_history";
export const GET_ASSET_HISTORIAN           = "get_asset_historian";
export const GET_PARAMETERS                = "get_parameters";
export const GET_AVAIL_PRIVS               = "get_avail_privs";
export const GET_ROLE_PRIVS                = "get_role_privs";
export const UPDATE_PRIV_EXPANDED          = "update_priv_expanded";
export const SET_PRIVS                     = "set_privs";
export const GET_ROLES                     = "get_roles";
export const GET_ROLES_FOR_LOGGED_USER     = "get_roles_for_logged_user";
export const GET_USERS                     = "get_users";
export const LOCATION_LIST                 = 'location_list';
export const ORGANISATION_LIST             = 'organisation_list';
export const RESET_PROPS_DATA              = "reset_props_data";
export const SET_CURRENT_PROPS             = 'set_current_props';
export const SITE_DETAIL                   = 'site_detail';
export const SITE_LIST                     = 'site_list';
export const STATUS_LIST                   = 'status_list';
export const GET_ORGANISATION              = 'get_organisation';
export const INVITE_USER                   = 'invite_user';
export const GET_ORGANISATION_ROLES        = 'get_organisation_roles';
export const GET_ORGANISATION_MEMBER       = 'get_organisation_member';
export const ADD_USER                      = 'add_user';
export const GET_INVITED_USER              = 'get_invited_user';
export const UPDATE_ORGANISATION_MEMBER    = 'update_organisation_member';
export const GET_SINGLE_ORGANISATION       = 'get_singleOrganisation';
export const UPDATE_ORGANISATION_DETAIL    = 'update_organisation_detail';
export const UPDATE_ORGANISATION_IMAGE     = 'update_organisation_image';
export const UPDATE_USER_DETAIL            = 'update_user_image';
export const UPDATE_ORGANISATION_ADDRESS   = 'update_organisation_address';
export const UPDATE_DEVICE_STATUS          = 'update_device_status';
export const DEVICE_ON_OFF_EVENT           = 'device_on_off_event';
export const API_REQUEST                   = 'api_reqeust';
export const API_FAILURE                   = 'api_failure';
export const GET_SITE_DATA_SUCCESS         = 'get_site_data_success';
export const GET_SITE_DEVICES_SUCCESS      = 'get_site_device_success';
export const GET_SINGLE_DEVICE_SUCCESS     = 'get_single_device_sucess';
export const DEVICE_STATUS_CHANGED         = 'device_status_changed';
export const ADMIN_AND_MEMBER_COUNT        = 'admin_and_member_count';
export const DEVICE_LOADER_EVENT           = 'device_loader_event';
export const GET_USER_PROFILE_SUCCESS      = 'get_user_data';
export const UPDATE_FORM_DATA              = 'update user form';
export const SHOW_EDIT_BUTTON              = 'show edit button';




