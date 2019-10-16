import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import {reducer as toastrReducer} from 'react-redux-toastr';
import {reducer as formReducer} from  'redux-form';
import partReducer from './Part';
import UOMREducer from './unitOfMeasurement';
import categoryReducer from './Category';

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
   auth                : AuthReducer, 
   part                : partReducer,
   unitOfMeasrement    : UOMREducer,
   category            : categoryReducer
});

export default rootReducer;
