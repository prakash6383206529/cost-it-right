import Approval from './reducers/Approval';
import Costing from './reducers/Costing';
import CostWorking from './reducers/CostWorking';
import SubAssembly from './reducers/SubAssembly';

const mainReducer = {
  approval: Approval,
  costing: Costing,
  costWorking: CostWorking,
  SubAssembly: SubAssembly
}
export default mainReducer;
