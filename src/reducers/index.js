import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import { reducer as toastrReducer } from 'react-redux-toastr';
import { reducer as formReducer } from 'redux-form';
import commanReducer from './Common';
import CostingReducer from '../components/costing/MainReducer';
import MastersReducer from '../components/masters/MainReducer';
import SimulationReducers from '../components/simulation/MainReducer'

const rootReducer = (state, action) => {
   if (action.type === 'RESET_APP') {
      state = undefined;
   }
   return allReducers(state, action);
};

/**Combine all the reducers */
const allReducers = combineReducers({
   form: formReducer,
   toastr: toastrReducer,
   auth: AuthReducer,
   comman: commanReducer,
   ...CostingReducer,
   ...MastersReducer,
   ...SimulationReducers
});

export default rootReducer;
