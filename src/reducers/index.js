import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import CommonReducer from './CommonReducer';
import {reducer as toastrReducer} from 'react-redux-toastr';
import {reducer as formReducer} from  'redux-form';
import profile from './Profile';
import production from './Production';
import opportunityList from './OpportunityListing';
import opportunity from './Opportunity';
import roles from './Roles';
import myOpportunity from './MyOpportunity';
import notificationSettingReducer from './NotificationSetting' ;
import blockedUserListReducer from './BlockedUser' ;
import talentDirectoryListReducer from './TalentDirectoryListing';
import followerAndFollowingList from './FollowersAndFollowing';
import companyList from './CompanyDirectory';
import dashboard from './Dashboard';
import ContactReducer from './ContactReducer';
import subscription from './Subscription';
import message from './Message';
import resume from './Resume';

const rootReducer = (state, action) => {
   if (action.type === 'RESET_APP') {
       state = undefined;
   }
   return allReducers(state, action);
};

/**Combine all the reducers */
const allReducers = combineReducers({   
   form                : formReducer,
   toastr              : toastrReducer,
   common              : CommonReducer,
   auth                : AuthReducer, 
   profile             : profile,
   opportunityList     : opportunityList,
   opportunity         : opportunity,
   production          : production,
   myOpportunity       : myOpportunity,
   roles               : roles,
   notificationSetting : notificationSettingReducer,
   blockedUser         : blockedUserListReducer,
   talentDirectory     : talentDirectoryListReducer,
   followingFollower   : followerAndFollowingList,
   companyList         : companyList,
   dashboard           :  dashboard, 
  // contactus           : ContactReducer,
   subscription        : subscription,
   message             : message,
   resume              : resume,
});

export default rootReducer;
