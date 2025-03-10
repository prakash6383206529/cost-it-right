import RFQReducer from '../rfq/reducer/rfq';
import Approval from './reducers/Approval';
import Costing from './reducers/Costing';
import CostWorking from './reducers/CostWorking';
import SubAssembly from './reducers/SubAssembly';

const mainReducer = {
  approval: Approval,
  costing: Costing,
  costWorking: CostWorking,
  subAssembly: SubAssembly,
  rfq: RFQReducer,
}
export default mainReducer;
