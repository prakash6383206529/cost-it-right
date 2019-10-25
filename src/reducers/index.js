import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import {reducer as toastrReducer} from 'react-redux-toastr';
import {reducer as formReducer} from  'redux-form';
import partReducer from './master/Part';
import UOMREducer from './master/unitOfMeasurement';
import categoryReducer from './master/Category';
import materialReducer from './master/Material';
import plantReducer from './master/Plant';
import supplierReducer from './master/Supplier';
import commanReducer from './master/Comman';
import BOMReducer from './master/BillOfMaterial';
import BOPReducer from './master/BoughtOutParts';
import processReducer from './master/Process';
import fuelReducer from './master/Fuel';

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
   category            : categoryReducer,
   material            : materialReducer,
   plant               : plantReducer,
   supplier            : supplierReducer,
   comman              : commanReducer,
   billOfMaterial      : BOMReducer,
   boughtOutparts      : BOPReducer,
   process             : processReducer,
   fuel                : fuelReducer
});

export default rootReducer;
