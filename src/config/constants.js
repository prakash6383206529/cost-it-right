/**
 * Define all the constants required in application inside this file and export them
 */
// REGISTRATION TYPE
export const REGISTRATION_TYPE = 'mobile';

// EXPERIENCE TYPE IN EDIT MODE
export const EXPERIENCE_TYPE = 'EXPERIENCE_TYPE';

// STAGE AND SET WEB BASE URL
//const BASE_URL = 'http://183.182.84.26:8085';

//For Development
export const BASE_URL_SOCKET = 'http://183.182.84.26:3034';
const BASE_URL = 'http://183.182.84.26:3030';

//hosting url for api of cost-it-right
//const BASE_URL = 'http://183.182.84.29/cost-it-right-lite';

// const BASE_URL = 'https://qa.stageandset.com';
//const BASE_URL = 'http://183.182.84.26:3032';

// export const BASE_URL_SOCKET = 'http://183.182.84.26:3036';
// const BASE_URL = 'http://183.182.84.26:3035';

// RESET_APP
export const RESET_APP = 'RESET_APP';

// const LOCAL_BASE_URL = 'http://183.182.84.26:3030';
export const PROFILE_MEDIA_URL = `${BASE_URL}/api/account/settings/media/`;

// const BASE_URL_WP = 'http://183.182.84.84/restapi/wp-json/wp/v2';
export const OPPORTUNITY_LOGO_MEDIA_URL = `${BASE_URL}/api/castingCall/logo/`;
export const OPPORTUNITY_APPLIED_USER_MEDIA_URL = `${BASE_URL}/api/castingCall/apply/`;


// API KEY
export const API_KEY = "AIzaSyBRaP2V6woKa6mQ8AE9Sej0YUFd-aO1J-4"

/** Export FILE_CONFIG */
export const FILE_CONFIG = {
  MAX_NUMBER_OF_FILES: 5,
  MAX_FILE_SIZE: 50000 /** In KBs */
}
export const TIME = 3000;
export const FILE_SIZE = 5242880; /** In Bytes or 5MB */
export const FILE_SIZE_8MB = 8388608; /** In Bytes or 8MB */
export const MAX_VIDEO_SIZE = 52428800; /** In Bytes or 50MB */
export const PAGE_LENGTH = 10;
export const MAX_TIMEOUT = 10000; // 1000 = 1sec

/** Export API */
export const API = {
  login: `${BASE_URL}/api/login`,
  logout: `${BASE_URL}/api/logout`,
  updatePassword: `${BASE_URL}/api/account/settings/password`,
  socialMediaLogin: `${BASE_URL}/api/newSocialLogin`,
  updateUserAccountDetail: `${BASE_URL}/api/updateIntermediateStep`,
  register: `${BASE_URL}/api/signup`,
  verifyOtp: `${BASE_URL}/api/mobile/verification`,
  resendOtp: `${BASE_URL}/api/mobile/verification`,
  forgotPassword: `${BASE_URL}/api/login/forgot`,
  getUserProfile: `${BASE_URL}/api/account/settings`,
  getCompanyProfile: `${BASE_URL}/api/account/directoryListing`,
  updateUserProfile: `${BASE_URL}/api/account/settings/profiles`,
  updateUserProductionDetail: `${BASE_URL}/api/account/directoryListing`,
  updateUserSocialLink: `${BASE_URL}/api/account/settings/links`,
  deleteUserMedia: `${BASE_URL}/api/account/settings/media`,
  getSports: `${BASE_URL}/data/sports.json`,
  getPerformances: `${BASE_URL}/data/performances.json`,
  getEyesColor: `${BASE_URL}/data/eyeColors.json`,
  getEthnicAppearence: `${BASE_URL}/data/ethnicAppearances.json`,
  getLanguage: `${BASE_URL}/data/languages.json`,
  getAccents: `${BASE_URL}/data/accents.json`,
  getDisabilities: `${BASE_URL}/data/disabilities.json`,
  postMedia: `${BASE_URL}/api/account/settings/pmedia/`,
  postUserProfileImage: `${BASE_URL}/api/mobile/setImageProfile`,
  postUserHeadShotImage: `${BASE_URL}/api/mobile/setHeadshot`,
  postProductionProfileImage: `${BASE_URL}/api/mobile/dir/setImageProfile`,
  postProductionHeadShotImage: `${BASE_URL}/api/mobile/dir/setHeadshot`,
  postProductiupdateUserProductionDetailnHeadShotImage: `${BASE_URL}/api/mobile/dir/setHeadshot`,
  setProfilePicture: `${BASE_URL}/api/mobile/makeImageProfileImage`,
  setProfilePiupdateUserProductionDetailture: `${BASE_URL}/api/mobile/makeImageProfileImage`,
  getOpportuniupdateUserProductionDetailies: `${BASE_URL}/api/castingCallListing`,
  createOpportupdateUserProductionDetailnity: `${BASE_URL}/api/createCastingCall`,
  getOpportuniupdateUserProductionDetailyRole: `${BASE_URL}/api/castingCallRole`,
  deleteOpportupdateUserProductionDetailnity: `${BASE_URL}/api/castingCall`,
  createOpportupdateUserProductionDetailnityRole: `${BASE_URL}/api/castingCallRole`,
  setOpportuniupdateUserProductionDetailyLogo: `${BASE_URL}/api/castingCallLogo`,
  deleteOpportupdateUserProductionDetailnityRole: `${BASE_URL}/api/castingCallRole`,
  getOpportunities: `${BASE_URL}/api/castingCallListing`,
  createOpportunity: `${BASE_URL}/api/createCastingCall`,
  getOpportunityRole: `${BASE_URL}/api/castingCallRole`,
  deleteOpportunity: `${BASE_URL}/api/castingCall`,
  createOpportunityRole: `${BASE_URL}/api/castingCallRole`,
  setOpportunityLogo: `${BASE_URL}/api/castingCallLogo`,
  deleteOpportunityRole: `${BASE_URL}/api/castingCallRole`,
  updateOpportunityRole: `${BASE_URL}/api/castingCallRole`,
  opportunityDetail: `${BASE_URL}/api/castingCallDetail`,
  applyCastingCallRole: `${BASE_URL}/api/castingCallRoleApply`,
  bookmarkCastingCall: `${BASE_URL}/api/bookmarkCastingCall`,
  myCastingCall: `${BASE_URL}/api/myCastingCall`,
  deleteCastingCall: `${BASE_URL}/api/castingCall`,
  appliedRolesList: `${BASE_URL}/api/appliedRolesList`,
  appliedUsersList: `${BASE_URL}/api/appliedUsersList`,
  getCompanyList: `${BASE_URL}/api/company/listing`,
  blockedUserList: `${BASE_URL}/api/account/blockedUserList`,
  blockTalent: `${BASE_URL}/api/account/blockUser`,
  getTalentDirectoryList: `${BASE_URL}/api/talent/listing`,
  followTalentProfile: `${BASE_URL}/api/talent/follow`,
  followingListing: `${BASE_URL}/api/talent/followingListing`,
  followerListing: `${BASE_URL}/api/talent/followerListing`,
  getNotificationSettingData: `${BASE_URL}/api/account/getNotificationDetails`,
  updateNotificationSettingData: `${BASE_URL}/api/account/updateNotificationDetails`,
  subscriptionPlanList: `${BASE_URL}/api/planList`,
  getChartData: `${BASE_URL}/api/dashboard`,
  updateViewerCountAPI: `${BASE_URL}/api/viewProfile`,
  ViewerListing: `${BASE_URL}/api/viewerListing`,
  notificationListing: `${BASE_URL}/api/inAppNotificationListing`,
  markAsReadNotification: `${BASE_URL}/api/updateInAppNotification`,
  subscribePlan: `${BASE_URL}/api/recurly`,
  contactUs: `${BASE_URL}/api/contact`,
  getMutualFollowers: `${BASE_URL}/api/getFollowUsers`,
  composeMessage: `${BASE_URL}/api/message`,
  getMessageListing: `${BASE_URL}/api/messageListing`,
  updateMessageListing: `${BASE_URL}/api/updateMessage`,
  getMessageDetails : `${BASE_URL}/api/messageDetails`,
  deleteMessageAPI : `${BASE_URL}/api/deleteMessage`,
  createResumeAPI : `${BASE_URL}/api/createResume`,
};

// FETCH USER DATA
export const FETCH_USER_DATA = 'FETCH_USER_DATA';

// Fetch master Data
export const FETCH_MATER_DATA_SUCCESS = 'FETCH_MATER_DATA_SUCCESS';
export const FETCH_MATER_DATA_FAILURE = 'FETCH_MATER_DATA_FAILURE';
export const FETCH_MATER_DATA_REQUEST = 'FETCH_MATER_DATA_REQUEST';

// COMMON API CONSTANT
export const API_REQUEST = 'API_REQUEST';
export const API_FAILURE = 'API_FAILURE';

// AUTH API CONSTANT 
export const AUTH_API_REQUEST = 'AUTH_API_REQUEST';
export const AUTH_API_FAILURE = 'AUTH_API_FAILURE';

// PRODUCTION API CONSTANT
export const PRODUCTION_API_REQUEST = 'PRODUCTION_API_REQUEST';
export const PRODUCTION_API_FAILURE = 'PRODUCTION_API_FAILURE';

// LOGIN
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

// SOCIAL USER DATA
export const SOCIAL_USER_DATA = 'SOCIAL_USER_DATA'

// LOGOUT
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

// UPDATE PASSWORD
export const UPDATE_PASSWORD_SUCCESS = 'UPDATE_PASSWORD_SUCCESS';

// Social Media Login
export const SOCIAL_MEDIA_LOGIN_SUCCESS = 'SOCIAL_MEDIA_LOGIN_SUCCESS';

// User Account Update 
export const UPDATE_USER_ACCOUNT_DETAIL_SUCCESS = 'UPDATE_USER_ACCOUNT_DETAIL_SUCCESS';

// Register
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

// Forgot Password
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS';

// VERIFY OTP
export const VERIFY_OTP_SUCCESS = 'VERIFY_OTP_SUCCESS';

// RESEND OTP 
export const RESEND_OTP_SUCCESS = 'RESEND_OTP_SUCCESS';

// APPLICATION INTRODUCTION 
export const UPDATE_INTRO_STATUS = 'UPDATE_INTRO_STATUS';

// SHOW EDIT BUTTON
export const SHOW_EDIT_BUTTON = 'SHOW_EDIT_BUTTON';

// SHOW EDIT BUTTON
export const SHOW_BLOCK_BUTTON = 'SHOW_BLOCK_BUTTON';

// USER PROFILE VIEW
export const GET_USER_PROFILE_SUCCESS = 'GET_USER_PROFILE_SUCCESS';

// COMPANY PROFILE VIEW
export const GET_COMPANY_PROFILE_SUCCESS = 'GET_COMPANY_PROFILE_SUCCESS';

// UPDATE PRODUCTION UDPATE
export const UPDATE_PRODUCTION_PROFILE_FORM_DATA = 'UPDATE_PRODUCTION_PROFILE_FORM_DATA';

// FORM DATA
export const UPDATE_FORM_DATA = 'UPDATE_FORM_DATA';

// Update User Profile
export const UPDATE_USER_PROFILE_SUCCESS = 'UPDATE_USER_PROFILE_SUCCESS';

//Delete user media 
export const DELETE_USER_MEDIA_SUCCESS = 'DELETE_USER_MEDIA_SUCCESS';

//Post User Media
export const POST_USER_MEDIA_SUCCESS = 'POST_USER_MEDIA_SUCCESS';

// FOR  USER PROFILE & HEADSHOT IMAGE
export const USER_PROFILE_IMAGE_SUCCESS = 'USER_PROFILE_IMAGE_SUCCESS';
export const USER_HEADSHOT_IMAGE_SUCCESS = 'USER_HEADSHOT_IMAGE_SUCCESS';

// FOR  PRODUCTION PROFILE & HEADSHOT IMAGE
export const PRODUCTION_PROFILE_IMAGE_SUCCESS = 'PRODUCTION_PROFILE_IMAGE_SUCCESS';
export const PRODUCTION_HEADSHOT_IMAGE_SUCCESS = 'PRODUCTION_HEADSHOT_IMAGE_SUCCESS';

// UPDATE USER PRODUCTION DETAIL
export const UPDATE_USER_PRODUCTION_DETAIL_SUCCESS = 'UPDATE_USER_PRODUCTION_DETAIL_SUCCESS';

// SET PROFILE PICTURE
export const SET_PROFILE_PICTURE_SUCCESS = 'SET_PROFILE_PICTURE_SUCCESS';

//GET  GETOPPORTUNITIES
export const OPPORTUNITIES_REQUEST = 'OPPORTUNITIES_REQUEST';
export const OPPORTUNITIES_FAILURE = 'OPPORTUNITIES_FAILURE';
export const GET_OPPORTUNITIES_SUCCESS = 'GET_OPPORTUNITIES_SUCCESS';

// CREATE OPPORTUNITY
export const CREATE_OPPORTUNITIES_REQUEST = 'CREATE_OPPORTUNITIES_REQUEST';
export const CREATE_OPPORTUNITIES_SUCCESS = 'CREATE_OPPORTUNITIES_SUCCESS';
export const CREATE_OPPORTUNITIES_FAILURE = 'CREATE_OPPORTUNITIES_FAILURE';
export const CREATE_OPPORTUNITIES_CLONE_SUCCESS = 'CREATE_OPPORTUNITIES_CLONE_SUCCESS';
export const PUBLISH_OPPORTUNITIES_SUCCESS = 'PUBLISH_OPPORTUNITIES_SUCCESS';

// OPPORTUNITY DETAILS
export const OPPORTUNITIES_DETAILS_API_REQUEST = 'OPPORTUNITIES_DETAILS_API_REQUEST';
export const OPPORTUNITY_DETAILS_SUCCESS = 'OPPORTUNITY_DETAILS_SUCCESS';
export const OPPORTUNITY_DETAILS_FAILURE = 'OPPORTUNITY_DETAILS_FAILURE';
export const UPDATE_POST_OPPORTUNITY_DETAILS = 'UPDATE_POST_OPPORTUNITY_DETAILS';
export const UPDATE_OPPORTUNITY_FILTER = 'UPDATE_OPPORTUNITY_FILTER';
export const ROLES_API_REQUEST = 'ROLES_API_REQUEST';
export const ROLES_API_FAILURE = 'ROLES_API_FAILURE';
export const GET_OPPORTUNITY_ROLE_SUCCESS = 'GET_OPPORTUNITY_ROLE_SUCCESS';
export const ADD_OPPORTUNITY_ROLE_SUCCESS = 'ADD_OPPORTUNITY_ROLE_SUCCESS';
export const DELETE_OPPORTUNITY_SUCCESS = 'DELETE_OPPORTUNITY_SUCCESS';
export const SET_OPPORTUNITY_LOGO_SUCCESS = 'SET_OPPORTUNITY_LOGO_SUCCESS';
export const DELETE_OPPORTUNITY_ROLE_SUCCESS = 'DELETE_OPPORTUNITY_ROLE_SUCCESS';
export const UPDATE_OPPORTUNITY_ROLE_SUCCESS = 'UPDATE_OPPORTUNITY_ROLE_SUCCESS';
export const EDIT_INDEX_ROLE = 'EDIT_INDEX_ROLE';
export const SHOW_OPPORTUNITY_DETAIL = 'SHOW_OPPORTUNITY_DETAIL';

// OPPORTUNITY DETAIL DATA AT CREATE OPPORTUNITY
export const OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS = 'OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS';
export const OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE = 'OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE';

// CLONE OPPORTUNITY 
export const CLONE_OPPORTUNITY_API_REQUEST = 'CLONE_OPPORTUNITY_API_REQUEST';
export const CLONE_OPPORTUNITY_SUCCESS = 'CLONE_OPPORTUNITY_SUCCESS';
export const CLONE_OPPORTUNITY_FAILURE = 'CLONE_OPPORTUNITY_FAILURE';
export const CLONE_OPPORTUNITY_DROPDOWN_VALUE = 'CLONE_OPPORTUNITY_DROPDOWN_VALUE';

// CLONE OPPORTUNITY DETAIL
export const OPPORTUNITY_DETAILS_CLONE_SUCCESS = 'OPPORTUNITY_DETAILS_CLONE_SUCCESS';
export const APPLY_OPPORTUNITY_ROLE_SUCCESS = 'APPLY_OPPORTUNITY_ROLE_SUCCESS';
export const OPPORTUNITY_BOOKMARK_REQUEST = 'OPPORTUNITY_BOOKMARK_REQUEST';
export const OPPORTUNITY_BOOKMARK_SUCCESS = 'OPPORTUNITY_BOOKMARK_SUCCESS';
export const OPPORTUNITY_BOOKMARK_FAIL = 'OPPORTUNITY_BOOKMARK_FAIL';
export const UPDATE_BOOKMARK_FLAG = 'UPDATE_BOOKMARK_FLAG';
export const MAP_VIEW_HANDLER = 'MAP_VIEW_HANDLER';

// OPPORTUNITY LISTING 
export const OPPORTUNITIES_LISTING_REQUEST = 'OPPORTUNITIES_LISTING_REQUEST';
export const OPPORTUNITIES_LISTING_FAILURE = 'OPPORTUNITIES_LISTING_FAILURE';
export const CHANGE_CATEGORY_TYPE = 'CHANGE_CATEGORY_TYPE';

// EDIT OPPORTUNITY
export const OPPORTUNITY_EDIT_DETAILS_SUCCESS = 'OPPORTUNITY_EDIT_DETAILS_SUCCESS';

// MY OPPORTUNITY
export const MY_OPPORTUNITY_REQUEST = 'MY_OPPORTUNITY_REQUEST';
export const MY_OPPORTUNITY_SUCCESS = 'MY_OPPORTUNITY_SUCCESS';
export const MY_OPPORTUNITY_FAILURE = 'MY_OPPORTUNITY_FAILURE';
export const DELTE_OPPORTUNITY_FAILURE = 'DELTE_OPPORTUNITY_FAILURE';

// OPPORTUNITY CLONE 
export const OPPORTUNITY_CLONE_REQUEST = 'OPPORTUNITY_CLONE_REQUEST';
export const OPPORTUNITY_CLONE_SUCCESS = 'OPPORTUNITY_CLONE_SUCCESS';
export const OPPORTUNITY_CLONE_FAILURE = 'OPPORTUNITY_CLONE_FAILURE';

// APPLIED OPPORTUNITY DETAIL
export const APPLIED_OPPORTUNITY_DETAIL_REQUEST = 'APPLIED_OPPORTUNITY_DETAIL_REQUEST';
export const APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS = 'APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS';
export const APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE = 'APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE';
export const APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS = 'APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS';
export const SHOW_TAB_BAR = 'SHOW_TAB_BAR';

// NOTIFICATION SETTINGS
export const NOTIFICATION_DATA_REQUEST = 'NOTIFICATION_DATA_REQUEST';
export const NOTIFICATION_DATA_FAILURE = 'NOTIFICATION_DATA_FAILURE';
export const GET_NOTIFICATION_DATA_SUCCESS = 'GET_NOTIFICATION_DATA_SUCCESS';
export const UPDATE_NOTIFICATION_DATA_SUCCESS = 'UPDATE_NOTIFICATION_DATA_SUCCESS';

// BLOCKED USER LIST
export const BLOCKED_USER_API_REQUEST = 'BLOCKED_USER_API_REQUEST';
export const BLOCKED_USER_SUCCESS = 'BLOCKED_USER_SUCCESS';
export const BLOCKED_USER_FAILURE = 'BLOCKED_USER_FAILURE';

// BLOCK TALENT 
export const BLOCK_TALENT_API_REQUEST = 'BLOCK_TALENT_API_REQUEST';
export const BLOCK_TALENT_SUCCESS = 'BLOCK_TALENT_SUCCESS';
export const BLOCK_TALENT_FAILURE = 'BLOCK_TALENT_FAILURE';

// SAVE SCREEN NAME
export const SCREEN_NAME_SAVE_REQUEST = 'SCREEN_NAME_SAVE_REQUEST';

export const SET_BASIC_PROFILE_IMAGE_SUCCESS = 'SET_BASIC_PROFILE_IMAGE_SUCCESS';

// COMPANY DIRECTORY
export const COMPANY_LISTING_REQUEST = 'COMPANY_LISTING_REQUEST';
export const GET_COMPANY_SUCCESS = 'GET_COMPANY_SUCCESS';
export const COMPANY_LISTING_FAILURE = 'COMPANY_LISTING_FAILURE';
export const UPDATE_CURRENT_LOCATION_FOR_COMPANY_DIRECTORY = 'UPDATE_CURRENT_LOCATION_FOR_COMPANY_DIRECTORY';

// UPDATE COMPANY FILTER
export const UPDATE_COMPANY_FILTER = 'UPDATE_COMPANY_FILTER';

// TALENT DIRECTORY
export const TALENT_DIRECTORY_LISTING_REQUEST = 'TALENT_DIRECTORY_LISTING_REQUEST';
export const GET_TALENT_DIRECTORY_SUCCESS = 'GET_TALENT_DIRECTORY_SUCCESS';
export const TALENT_DIRECTORY_LISTING_FAILURE = 'TALENT_DIRECTORY_LISTING_FAILURE';
export const UPDATE_TALENT_DIRECTORY_FILTER = 'UPDATE_TALENT_DIRECTORY_FILTER';
export const TALENT_DIRECTORY_FOLLOW_REQUEST = 'TALENT_DIRECTORY_FOLLOW_REQUEST';
export const TALENT_DIRECTORY_FOLLOW_SUCCESS = 'TALENT_DIRECTORY_FOLLOW_SUCCESS';
export const TALENT_DIRECTORY_FOLLOW_FAIL = 'TALENT_DIRECTORY_FOLLOW_FAIL';
export const UPDATE_FOLLOW_UNFOLLOW_FLAG = 'UPDATE_FOLLOW_UNFOLLOW_FLAG';
export const FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST = 'FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST';
export const GET_FOLLOWING_LISTING_SUCCESS = 'GET_FOLLOWING_LISTING_SUCCESS';
export const FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE = 'FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE';
export const GET_FOLLOWERS_LISTING_SUCCESS = 'GET_FOLLOWERS_LISTING_SUCCESS';

// FOLLOW TALENT
export const TALENT_FOLLOW_REQUEST = 'TALENT_FOLLOW_REQUEST';
export const TALENT_FOLLOW_SUCCESS = 'TALENT_FOLLOW_SUCCESS';
export const TALENT_FOLLOW_FAILURE = 'TALENT_FOLLOW_FAILURE';
export const UPDATE_FOLLOWING_FLAG = 'UPDATE_FOLLOWING_FLAG';
export const UPDATE_FOLLOWER_FLAG = 'UPDATE_FOLLOWER_FLAG';

// SEARCH
export const SEARCH_TEXT_DATA_ON_BACK = 'SEARCH_TEXT_DATA_ON_BACK';

// MATCHING OPPORTUNITY LISTING FOR DASHBOARD
export const DASHBOARD_API_REQUEST = 'DASHBOARD_API_REQUEST';
export const DASHBOARD_API_FAILURE = 'DASHBOARD_API_FAILURE';
export const GET_CHART_DATA_SUCCESS = 'GET_CHART_DATA_SUCCESS';

// VIEWER LISTING
export const GET_VIEWER_LIST_SUCCESS = 'GET_VIEWER_LIST_SUCCESS';

// GET_INAPP_NOTIFICATION_LIST_SUCCESS
export const GET_IN_APP_NOTIFICATION_LIST_SUCCESS = 'GET_IN_APP_NOTIFICATION_LIST_SUCCESS';
export const GET_MARK_AS_READ_NOTIFICATION_SUCCESS = 'GET_MARK_AS_READ_NOTIFICATION_SUCCESS';

// TYPE OF NOTIFICATION
export const MATCHING_OPPORTUNITY = '1';
export const EVENTDATE_NEAR_BY = '2';
export const NEW_MESSAGE = '3';
export const FOLLOW_USER = '4';
export const VIEW_USER = '5';
export const APPLY_TALENT_OPPORTUNITY = '6';

// SUBSCRIPTION PLANS
export const SUBSCRIPTION_PLANS_REQUEST = 'SUBSCRIPTION_PLANS_REQUEST';
export const SUBSCRIPTION_PLANS_FAILURE = 'SUBSCRIPTION_PLANS_FAILURE';
export const GET_SUBSCRIPTION_PLANS_SUCCESS = 'GET_SUBSCRIPTION_PLANS_SUCCESS';
export const PLAN_SUBSCRIPTION_PLANS_SUCCESS = 'PLAN_SUBSCRIPTION_PLANS_SUCCESS';
export const FREE_PLAN_CODE = 'fps';

//Contact Us
export const SEND_MESSAGE_SUCCESS = 'MESSAGE_SENT_SUCCESS';

// EXTRA USED CONST
export const INTERNAL_ROUTE_ID = 'INTERNAL_ROUTE_ID';
export const MESSAGE_API_REQUEST = 'MESSAGE_API_REQUEST';
export const MESSAGE_API_FAILURE = 'MESSAGE_API_FAILURE';
export const SEND_CHAT_MESSAGE_SUCCESS = 'SEND_CHAT_MESSAGE_SUCCESS';
export const GET_MUTUAL_FOLLOWER_LIST_SUCCESS = 'GET_MUTUAL_FOLLOWER_LIST_SUCCESS';
export const GET_MESSAGE_LIST_SUCCESS = 'GET_MESSAGE_LIST_SUCCESS';
export const UPDATE_MESSAGE__FAILURE = 'UPDATE_MESSAGE__FAILURE';
export const GET_MESSAGE_DETAILS = 'GET_MESSAGE_DETAILS';
export const SEARCH_TEXT_DATA = 'SEARCH_TEXT_DATA';
export const DELETE_MESSAGE_SUCCESS = ' DELETE_MESSAGE_SUCCESS';

//RESUME
export const POST_RESUME_DETAILS = 'POST_RESUME_DETAILS';
export const GET_INITIAL_RESUME_DATA = 'GET_INITIAL_RESUME_DATA';
export const UPDATE_RESUME_FILTER = 'UPDATE_RESUME_FILTER';
export const CREATE_RESUME_API_REQUEST = 'CREATE_RESUME_API_REQUEST';
export const CREATE_RESUME_API_FAILURE = 'CREATE_RESUME_API_FAILURE';
export const CREATE_RESUME__SUCCESS = 'CREATE_RESUME__SUCCESS';


