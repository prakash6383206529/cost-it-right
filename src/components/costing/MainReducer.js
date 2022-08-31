import Approval from './reducers/Approval';
import Costing from './reducers/Costing';
import CostWorking from './reducers/CostWorking';

const mainReducer = {
  approval: Approval,
  costing: Costing,
  costWorking: CostWorking,
}
export default mainReducer;