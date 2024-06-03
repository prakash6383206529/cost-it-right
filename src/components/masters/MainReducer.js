import partReducer from './reducers/Part';
import UOMREducer from './reducers/unitOfMeasurement';
import categoryReducer from './reducers/Category';
import materialReducer from './reducers/Material';
import plantReducer from './reducers/Plant';
import supplierReducer from './reducers/Supplier';
import BOMReducer from './reducers/BillOfMaterial';
import BOPReducer from './reducers/BoughtOutParts';
import processReducer from './reducers/Process';
import fuelReducer from './reducers/Fuel';
import OtherOperationReducer from './reducers/OtherOperation';
import MHRReducer from './reducers/MHR';
import freightReducer from './reducers/Freight';
import labourReducer from './reducers/Labour';
import OverheadProfitReducer from './reducers/OverheadProfit';
import InterestRateReducer from './reducers/InterestRate';
import MachineReducer from './reducers/MachineMaster';
import PowerReducer from './reducers/PowerMaster';
import ReasonReducer from './reducers/ReasonMaster';
import VolumeReducer from './reducers/Volume';
import ClientReducer from './reducers/Client';
import ExchangeRateReducer from './reducers/ExchangeRate';
import TaxReducer from './reducers/Tax';
import OutsourcingReducer from './reducers/Outsourcing';
import AuditReducer from '../audit/reducers/AuditLisitng';
import paginationReducer from '../common/Pagination/paginationReducer';
import supplierManagementReducer from '../vendorManagement/Reducer';
import indexationReducer from './reducers/Indexation';

const mainReducer = {
  part: partReducer,
  unitOfMeasrement: UOMREducer,
  category: categoryReducer,
  material: materialReducer,
  plant: plantReducer,
  supplier: supplierReducer,
  billOfMaterial: BOMReducer,
  boughtOutparts: BOPReducer,
  process: processReducer,
  fuel: fuelReducer,
  otherOperation: OtherOperationReducer,
  MHRReducer: MHRReducer,
  freight: freightReducer,
  labour: labourReducer,
  overheadProfit: OverheadProfitReducer,
  interestRate: InterestRateReducer,
  machine: MachineReducer,
  power: PowerReducer,
  reason: ReasonReducer,
  volume: VolumeReducer,
  client: ClientReducer,
  exchangeRate: ExchangeRateReducer,
  tax: TaxReducer,
  outsourcing: OutsourcingReducer,
  audit: AuditReducer,
  pagination: paginationReducer,
  supplierManagement: supplierManagementReducer,
  indexation: indexationReducer
}
export default mainReducer;
