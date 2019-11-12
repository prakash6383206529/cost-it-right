/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
//const BASE_URL = 'http://183.182.84.29/cost-it-right-lite/api/v1';
const BASE_URL = 'http://10.10.1.100:8090/api/v1';

/** Export API */
export const API = {
  //configure api's
  getPart: `${BASE_URL}/configuration/select-list-get-part`,
  getMasterFilterUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get`,
  getMaterialType: `${BASE_URL}/configuration/select-list-get-material-type`,
  getPlant: `${BASE_URL}/configuration/select-list-get-plant`,
  getTechnology: `${BASE_URL}/configuration/select-list-get-technology`,
  getSupplier: `${BASE_URL}/configuration/select-list-get-supplier`,
  getSupplierCode: `${BASE_URL}/configuration/select-list-get-supplier-code`,
  getCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,
  getCategory: `${BASE_URL}/configuration/select-list-get-category`,
  getCostingStatus: `${BASE_URL}/configuration/select-list-get-costing-status`,
  getCostingHeads: `${BASE_URL}/configuration/select-list-get-costing-heads`,

  //Combo apis
  //configure api's
  getFuelComboAPI: `${BASE_URL}/configuration-master/get-fuel-details-combo-select-list`,
  getOtherOperationComboAPI: `${BASE_URL}/configuration-master/get-other-operation-combo-select-list`,
  getCEDComboAPI: `${BASE_URL}/configuration-master/get-ced-other-operation-combo-select-list`,
  getMHRComboAPI: `${BASE_URL}/configuration-master/get-machine-hour-rate-combo-select-list`,
  getPartComboAPI: `${BASE_URL}/configuration-master/get-part-combo-select-list`,
  getRMComboAPI: `${BASE_URL}/configuration-master/get-raw-material-details-combo-select-list`,
  getBOMComboAPI: `${BASE_URL}/configuration-master/get-bill-of-materials-combo-select-list`,
  getBOPComboAPI: `${BASE_URL}/configuration-master/get-bought-out-part-combo-select-list`,
  getFreightComboAPI: `${BASE_URL}/configuration-master/get-freight-combo-select-list`,
  getLabourComboAPI: `${BASE_URL}/configuration-master/get-labour-combo-select-list`,
  getWeightCalculationLayoutType: `${BASE_URL}/configuration/radio-button-list-get-weight-calculate-layout-type`,


  //api's for configure location
  getSupplierCity: `${BASE_URL}/configuration-location/select-list-get-supplier-city`,
  getCountry: `${BASE_URL}/configuration-location/select-list-get-country`,
  getState: `${BASE_URL}/configuration-location/select-list-get-state`,
  getCity: `${BASE_URL}/configuration-location/select-list-get-city`,

  //api's for configure row material
  getRowMaterial: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material`,
  getRowGrade: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-grade`,
  getRowMaterialSpecification: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-specification`,
  getRowMaterialCategory: `${BASE_URL}/configuration-raw-material/select-list-get-raw-material-categoryy`,

  //Api's for material
  createMaterialType: `${BASE_URL}/masters-material/create-material-type`,
  createMaterial: `${BASE_URL}/masters-raw-material/add-costing-raw-material-details`,
  getMaterialType: `${BASE_URL}/masters-material/get-material-type`,
  getMaterial: `${BASE_URL}/masters-raw-material/get-costing-raw-material-details`,

  //Api for Unit of measurement master
  createUOMAPI: `${BASE_URL}/masters-unit-of-measurement/create`,
  getUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get`,
  getAllMasterUOMAPI: `${BASE_URL}/configuration/select-list-get-unit-of-measurement`,
  updateUOMAPI: `${BASE_URL}/masters-unit-of-measurement/update`,
  deleteUOMAPI: `${BASE_URL}/masters-unit-of-measurement/delete`,

  //Api for the part master
  partCreateAPI: `${BASE_URL}/masters-part/create`,
  getAllPartsAPI: `${BASE_URL}/masters-part/get`,
  getOnePartAPI: `${BASE_URL}/masters-part/get`,
  filterPartAPI: `${BASE_URL}/masters-part/get`,
  deletePartAPI: `${BASE_URL}/masters-part/delete`,
  updatePartAPI: `${BASE_URL}/masters-part/update`,

  //Api for category master
  createcategoryTypeAPI: `${BASE_URL}/masters-category/create-type`,
  createCategoryAPI: `${BASE_URL}/masters-category/create`,
  getCategoryTypeAPI: `${BASE_URL}/masters-category/get-category-type`,
  getCategoryAPI: `${BASE_URL}/masters-category/get-category`,
  fetchCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,

  //Api for row material master
  //createMaterialAPI: `${BASE_URL}/masters-material/material-type-create`,
  createMaterialAPI: `${BASE_URL}/masters-raw-material/create`,
  createRMCategoryAPI: `${BASE_URL}/masters-raw-material/create-category`,
  createRMGradeAPI: `${BASE_URL}/masters-raw-material/create-grade`,
  createRMSpecificationAPI: `${BASE_URL}/masters-raw-material/create-specification`,

  getRMMaterialAPI: `${BASE_URL}/masters-raw-material/get-raw-materials`,
  getRMGradeAPI: `${BASE_URL}/masters-raw-material/get-raw-material-grades`,
  getRMSpecificationAPI: `${BASE_URL}/masters-raw-material/get-raw-material-specifications`,
  getRMCategoryAPI: `${BASE_URL}/masters-raw-material/get-raw-material-category`,

  //Api for plant master
  //createPlantAPI: `${BASE_URL}/plant/create`,
  createPlantAPI: `${BASE_URL}/masters-plant/create`,
  getPlantAPI: `${BASE_URL}/masters-plant/get`,
  updatePlantAPI: `${BASE_URL}/masters-plant/update`,
  deletePlantAPI: `${BASE_URL}/masters-plant/delete`,

  //Api for supplier master
  createSupplierAPI: `${BASE_URL}/supplier/create`,
  getSupplierAPI: `${BASE_URL}/supplier/get`,
  updateSupplierAPI: `${BASE_URL}/supplier/update`,
  deleteSupplierAPI: `${BASE_URL}/supplier/delete`,

  //Api's for bill of materail
  createBOMAPI: `${BASE_URL}/masters-part-bill-of-material/add-bill-of-material`,
  getBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-material-list`,

  //Api's for bought out parts
  createBOPAPI: `${BASE_URL}/masters-bought-out-part/create`,
  getBOPAPI: `${BASE_URL}/masters-bought-out-part/get`,
  updateBOPAPI: `${BASE_URL}/masters-bought-out-part/update`,
  deleteBOPAPI: `${BASE_URL}/masters-bought-out-part/delete`,

  //Api's for process master
  createProcessAPI: `${BASE_URL}/masters-process/create`,
  getProcessAPI: `${BASE_URL}/masters-process/get`,
  updateProcessAPI: `${BASE_URL}/masters-process/update`,
  deleteProcessAPI: `${BASE_URL}/masters-process/delete`,

  //Api's for fuel master
  createFuelAPI: `${BASE_URL}/masters-fuel/create-fuel`,
  createFuelDetailAPI: `${BASE_URL}/masters-fuel/create-fuel-details`,
  getFuelAPI: `${BASE_URL}/masters-fuel/get-fuel`,
  getFuelDetailAPI: `${BASE_URL}/masters-fuel/get-fuel-details`,
  deleteFuelAPI: `${BASE_URL}/masters-fuel/delete-fuel`,
  deleteFuelDetailAPI: `${BASE_URL}/masters-fuel/delete-fuel-detail`,



  //API's for other operations
  getOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-other-operation`,
  getOtherOperationsFormDataAPI: `${BASE_URL}/configuration-master/get-other-operation-combo-select-list`,
  createOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-other-operation`,

  //API's for CED other operations
  getCEDotherOperationsComboDataAPI: `${BASE_URL}/configuration-master/get-ced-other-operation-combo-select-list`,
  createCEDOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-ced-other-operation`,
  getCEDOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-ced-other-operation`,

  //API's for MHR combo data
  getMHRComboDataAPI: `${BASE_URL}/configuration-master/get-machine-hour-rate-combo-select-list`,
  createMHRMasterAPI: `${BASE_URL}/masters-machine-hour-rate/create`,
  getMHRList: `${BASE_URL}/masters-machine-hour-rate/get`,

  //API's for MHR combo data
  getOperationsAPI: `${BASE_URL}/masters-other-operation/get-operation`,
  createOperationAPI: `${BASE_URL}/masters-other-operation/create-operation`,

  //Api's for fright master
  createFreightAPI: `${BASE_URL}/masters-freight/create`,
  getFreightAPI: `${BASE_URL}/masters-freight/get`,
  updateFrightAPI: `${BASE_URL}/masters-freight/update`,
  deleteFrightAPI: `${BASE_URL}/masters-freight/delete`,

  //Api's for labour master
  createLabourAPI: `${BASE_URL}/masters-labour/create`,
  getLabourAPI: `${BASE_URL}/masters-labour/get`,
  updateLabourAPI: `${BASE_URL}/masters-labour/update`,
  deleteLabourAPI: `${BASE_URL}/masters-labour/delete`,

  //Api's for overhead profit
  getOverheadProfitAPI: `${BASE_URL}/masters-overhead-and-profit/get`,
  getOverheadProfitComboDataAPI: `${BASE_URL}/configuration-master/get-overhead-and-profit-combo-select-list`,
  createOverheadProfitAPI: `${BASE_URL}/masters-overhead-and-profit/create`,

  //Api's for depreciation master
  createDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/create-depreciation`,
  getDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/get-depreciations`,

  //Api's for interest rate master
  getInterestRateAPI: `${BASE_URL}/supplier/get-supplier-interest-rate`,
  updateInterestRateAPI: `${BASE_URL}/supplier/update-supplier-interest-rate`,
  deleteInterestRateAPI: `${BASE_URL}/supplier/delete-supplier-interest-rate`,
  createInterestRateAPI: `${BASE_URL}/supplier/create-supplier-interest-rate`,

  //Api's for costing
  getPlantCombo: `${BASE_URL}/costing-sheet-metal/get-plant-combo-select-list`,
  getExistingSupplierDetailByPartId: `${BASE_URL}/costing-sheet-metal/get-existing-suppliers-details-by-part`,
  createPartWithSupplier: `${BASE_URL}/costing-sheet-metal/add-part-with-supplier`,
  checkPartWithTechnology: `${BASE_URL}/costing-sheet-metal/check-part-with-technology`,
  createNewCosting: `${BASE_URL}/costing-sheet-metal/create`,
  getCostingDetailsById: `${BASE_URL}/costing-sheet-metal/get-costing-details-by-id`,

  //weight calculation costing
  getWeightCalculationInfo: `${BASE_URL}/costing-sheet-metal/get-weight-calculation-info-by-costing`,
  AddCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/add-costing-weight-calculation`,
  UpdateCostingWeightCalculation: `${BASE_URL}/api/v1/costing-sheet-metal/update-costing-weight-calculation`,

  //cost working API's
  getCostingBySupplier: `${BASE_URL}/costing-sheet-metal/get-costings-by-supplier`,
  getRawMaterialListBySupplierId: `${BASE_URL}/costing-sheet-metal/get-raw-material-by-supplier`,
  addCostingRawMaterial: `${BASE_URL}/costing-sheet-metal/add-costing-raw-material`,
}


//Api constants
export const API_REQUEST = 'API_REQUEST';
export const API_FAILURE = 'API_FAILURE';

// Masters api constant
export const FETCH_MATER_DATA_REQUEST = 'FETCH_MATER_DATA_REQUEST';
export const FETCH_MATER_DATA_FAILURE = 'FETCH_MATER_DATA_FAILURE';
export const GET_COUNTRY_SUCCESS = 'GET_COUNTRY_SUCCESS';
export const GET_STATE_SUCCESS = 'GET_STATE_SUCCESS';
export const GET_CITY_SUCCESS = 'GET_CITY_SUCCESS';
export const GET_PLANT_SUCCESS = 'GET_PLANT_SUCCESS';
export const GET_SUPPLIER_SUCCESS = 'GET_SUPPLIER_SUCCESS';
export const GET_SUPPLIER_CITY_SUCCESS = 'GET_SUPPLIER_CITY_SUCCESS';
export const GET_TECHNOLOGY_SUCCESS = 'GET_TECHNOLOGY_SUCCESS';
export const GET_CATEGORY_SUCCESS = 'GET_CATEGORY_SUCCESS';
export const GET_CATEGORY_TYPE_SUCCESS = ' GET_CATEGORY_TYPE_SUCCESS';
export const GET_TECHNOLOGY_LIST_SUCCESS = 'GET_TECHNOLOGY_LIST_SUCCESS';
export const GET_LABOUR_TYPE_SUCCESS = 'GET_LABOUR_TYPE_SUCCESS';
export const GET_COSTING_HEAD_SUCCESS = 'GET_COSTING_HEAD_SUCCESS';

//For unit of measurement master
export const GET_UOM_DATA_SUCCESS = 'GET_UOM_DATA_SUCCESS';
export const GET_UOM_DATA_FAILURE = 'GET_UOM_DATA_FAILURE';
export const GET_UOM_SUCCESS = 'GET_UOM_SUCCESS';
export const UNIT_OF_MEASUREMENT_API_FAILURE = 'UNIT_OF_MEASUREMENT_API_FAILURE';

//for part master
export const CREATE_PART_REQUEST = 'CREATE_PART_REQUEST';
export const CREATE_PART_FAILURE = 'CREATE_PART_FAILURE';
export const CREATE_PART_SUCCESS = 'CREATE_PART_SUCCESS';
export const GET_ALL_PARTS_SUCCESS = 'GET_ALL_PARTS_SUCCESS';
export const GET_PART_SUCCESS = 'GET_PART_SUCCESS';
export const GET_ALL_PARTS_FAILURE = 'GET_ALL_PARTS_FAILURE';
export const GET_MATERIAL_TYPE_SUCCESS = 'GET_MATERIAL_TYPE_SUCCESS';

//for category master
export const CREATE_CATEGORY_TYPE_SUCCESS = 'CREATE_CATEGORY_TYPE_SUCCESS';
export const CREATE_CATEGORY_TYPE_FAILURE = 'CREATE_CATEGORY_TYPE_FAILURE';
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE';
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS';
export const FETCH_CATEGORY_DATA_FAILURE = 'FETCH_CATEGORY_DATA_FAILURE';
export const GET_CATEGORY_DATA_SUCCESS = 'GET_CATEGORY_DATA_SUCCESS';
export const GET_DATA_FAILURE = 'GET_DATA_FAILURE';
export const GET_CATEGORY_LIST_SUCCESS = 'GET_CATEGORY_LIST_SUCCESS';
export const GET_CATEGORY_TYPE_LIST_SUCCESS = 'GET_CATEGORY_TYPE_SUCCESS';

//for material master
export const CREATE_MATERIAL_SUCCESS = ' CREATE_MATERIAL_SUCCESS';
export const CREATE_MATERIAL_FAILURE = 'CREATE_MATERIAL_FAILURE';
export const GET_ROW_MATERIAL_SUCCESS = 'GET_ROW_MATERIAL_SUCCESS';
export const GET_GRADE_SUCCESS = 'GET_GRADE_SUCCESS';
export const GET_RM_LIST_SUCCESS = 'GET_RM_LIST_SUCCESS';
export const GET_RM_GRADE_LIST_SUCCESS = 'GET_RM_GRADE_LIST_SUCCESS';
export const GET_RM_CATEGORY_LIST_SUCCESS = 'GET_RM_CATEGORY_LIST_SUCCESS';
export const GET_RM_SPECIFICATION_LIST_SUCCESS = 'GET_RM_SPECIFICATION_LIST_SUCCESS';
export const GET_MATERIAL_LIST_SUCCESS = 'GET_MATERIAL_LIST_SUCCESS';
export const GET_MATERIAL_LIST_TYPE_SUCCESS = 'GET_MATERIAL_LIST_TYPE_SUCCESS';

//for plant master
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
export const GET_PLANT_UNIT_SUCCESS = 'GET_PLANT_UNIT_SUCCESS';
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';
export const GET_PLANT_FAILURE = 'GET_PLANT_FAILURE';
export const GET_PLANT_DATA_SUCCESS = 'GET_PLANT_DATA_SUCCESS';

//for supplier master
export const CREATE_SUPPLIER_SUCCESS = 'CREATE_SUPPLIER_SUCCESS';
export const CREATE_SUPPLIER_FAILURE = 'CREATE_SUPPLIER_FAILURE';
export const GET_SUPPLIER_FAILURE = 'GET_SUPPLIER_FAILURE';
export const GET_SUPPLIER_DATA_SUCCESS = 'GET_SUPPLIER_DATA_SUCCESS';

//for BOM master
export const CREATE_BOM_SUCCESS = 'CREATE_BOM_SUCCESS';
export const CREATE_BOM_FAILURE = 'CREATE_BOM_FAILURE';
export const GET_BOM_SUCCESS = 'GET_BOM_SUCCESS';
export const GET_BOM_FAILURE = 'GET_BOM_FAILURE';

//for BOP master
export const CREATE_BOP_SUCCESS = 'CREATE_BOP_SUCCESS';
export const CREATE_BOP_FAILURE = 'CREATE_BOP_FAILURE';
export const GET_BOP_SUCCESS = 'GET_BOP_SUCCESS';
export const GET_BOP_DATA_SUCCESS = 'GET_BOP_DATA_SUCCESS';
export const GET_BOP_FAILURE = 'GET_BOP_FAILURE';
export const UPDATE_BOP_SUCCESS = 'UPDATE_BOP_SUCCESS';

//For process master 
export const CREATE_PROCESS_SUCCESS = 'CREATE_PROCESS_SUCCESS';
export const CREATE_PROCESS_FAILURE = 'CREATE_PROCESS_FAILURE';
export const GET_PROCESS_LIST_SUCCESS = 'GET_PROCESS_LIST_SUCCESS';
export const GET_PROCESS_LIST_FAILURE = 'GET_PROCESS_LIST_FAILURE';
export const GET_PROCESS_UNIT_DATA_SUCCESS = 'GET_PROCESS_UNIT_DATA_SUCCESS';
export const GET_PROCESS_DATA_SUCCESS = 'GET_PROCESS_DATA_SUCCESS';

//For Fuel master 
export const CREATE_FUEL_SUCCESS = 'CREATE_FUEL_SUCCESS';
export const CREATE_FUEL_FAILURE = 'CREATE_FUEL_FAILURE';
export const GET_FUEL_SUCCESS = 'GET_FUEL_SUCCESS';
export const GET_FUEL_DATA_SUCCESS = 'GET_FUEL_DATA_SUCCESS';
export const GET_FUEL_FAILURE = 'GET_FUEL_FAILURE';
export const GET_FUEL_UNIT_DATA_SUCCESS = 'GET_FUEL_UNIT_DATA_SUCCESS';
export const CREATE_FUEL_DETAIL_FAILURE = 'CREATE_FUEL_DETAIL_FAILURE';
export const CREATE_FUEL_DETAIL_SUCCESS = 'CREATE_FUEL_DETAIL_SUCCESS';
export const GET_FUEL_DETAIL_SUCCESS = 'GET_FUEL_DETAIL_SUCCESS';
export const GET_FUEL__DETAIL_DATA_SUCCESS = 'GET_FUEL_DETAIL_DATA_SUCCESS';

//for Other Operation master
export const GET_OTHER_OPERATION_SUCCESS = 'GET_OTHER_OPERATION_SUCCESS';
export const GET_OTHER_OPERATION_FAILURE = 'GET_OTHER_OPERATION_FAILURE';
export const CREATE_OTHER_OPERATION_REQUEST = 'CREATE_OTHER_OPERATION_REQUEST';
export const CREATE_OTHER_OPERATION_FAILURE = 'CREATE_OTHER_OPERATION_FAILURE';
export const CREATE_OTHER_OPERATION_SUCCESS = 'CREATE_OTHER_OPERATION_SUCCESS';
export const GET_OTHER_OPERATION_FORMDATA_SUCCESS = 'GET_OTHER_OPERATION_FORMDATA_SUCCESS';
export const GET_OTHER_OPERATION_FORMDATA_FAILURE = 'GET_OTHER_OPERATION_FORMDATA_FAILURE';

//for CED Other Operation master
export const GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS = 'GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS';
export const GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE = 'GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE';
export const GET_CED_OTHER_OPERATION_SUCCESS = 'GET_CED_OTHER_OPERATION_SUCCESS';
export const GET_CED_OTHER_OPERATION_FAILURE = 'GET_CED_OTHER_OPERATION_FAILURE';

//for MHR master
export const GET_MHR_COMBO_DATA_SUCCESS = 'GET_MHR_COMBO_DATA_SUCCESS';
export const GET_MHR_COMBO_DATA_FAILURE = 'GET_MHR_COMBO_DATA_FAILURE';
export const GET_MHR_DATA_SUCCESS = 'GET_MHR_DATA_SUCCESS';

//for common
export const DATA_FAILURE = 'DATA_FAILURE';
export const CREATE_SUCCESS = 'CREATE_SUCCESS';
export const CREATE_FAILURE = 'CREATE_FAILURE';

//for Operation
export const GET_OPERATION_SUCCESS = 'GET_OPERATION_SUCCESS';

//for freight master
export const CREATE_FREIGHT_SUCCESS = 'CREATE_FREIGHT_SUCCESS';
export const CREATE_FREIGHT_FAILURE = 'CREATE_FREIGHT_FAILURE';
export const GET_FREIGHT_SUCCESS = 'GET_FREIGHT_SUCCESS';
export const GET_FREIGHT_DATA_SUCCESS = 'GET_FREIGHT_DATA_SUCCESS';
export const GET_FREIGHT_FAILURE = 'GET_FREIGHT_FAILURE';

//for labour master
export const CREATE_LABOUR_SUCCESS = 'CREATE_LABOUR_SUCCESS';
export const CREATE_LABOUR_FAILURE = 'CREATE_LABOUR_FAILURE';
export const GET_LABOUR_SUCCESS = 'GET_LABOUR_SUCCESS';
export const GET_LABOUR_FAILURE = 'GET_LABOUR_FAILURE';
export const GET_LABOUR_DATA_SUCCESS = 'GET_LABOUR_DATA_SUCCESS';

//for overhead profit
export const GET_OVERHEAD_PROFIT_SUCCESS = 'GET_OVERHEAD_PROFIT_SUCCESS';
export const GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS';

//For depreciation
export const CREATE_DEPRICIATION_SUCCESS = 'CREATE_LABOUR_SUCCESS';
export const GET_DEPRICIATION_SUCCESS = 'GET_LABOUR_SUCCESS';

//For Interest Rate 
export const GET_INTEREST_RATE_SUCCESS = 'GET_INTEREST_RATE_SUCCESS';
export const GET_INTEREST_RATE_COMBO_DATA_SUCCESS = 'GET_INTEREST_RATE_COMBO_DATA_SUCCESS';
export const GET_INTEREST_RATE_DATA_SUCCESS = 'GET_INTEREST_RATE_DATA_SUCCESS';

//for costing 
export const GET_PLANT_COMBO_SUCCESS = 'GET_PLANT_COMBO_SUCCESS';
export const GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS = 'GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS';
export const CREATE_PART_WITH_SUPPLIER_SUCCESS = 'CREATE_PART_WITH_SUPPLIER_SUCCESS';
export const CREATE_SHEETMETAL_COSTING_SUCCESS = 'CREATE_SHEETMETAL_COSTING_SUCCESS';
export const GET_COSTING_DATA_SUCCESS = 'GET_COSTING_DATA_SUCCESS';

//weight calculation costing
export const GET_WEIGHT_CALC_INFO_SUCCESS = 'GET_WEIGHT_CALC_INFO_SUCCESS';
export const CREATE_WEIGHT_CALC_COSTING_SUCCESS = 'CREATE_WEIGHT_CALC_COSTING_SUCCESS';
export const UPDATE_WEIGHT_CALC_SUCCESS = 'UPDATE_WEIGHT_CALC_SUCCESS';
export const GET_WEIGHT_CALC_LAYOUT_SUCCESS = 'GET_WEIGHT_CALC_LAYOUT_SUCCESS';
export const GET_COSTING_BY_SUPPLIER_SUCCESS = 'GET_COSTING_BY_SUPPLIER_SUCCESS';
export const GET_RM_LIST_BY_SUPPLIER_SUCCESS = 'GET_RM_LIST_BY_SUPPLIER_SUCCESS';
export const ADD_RAW_MATERIAL_COSTING_SUCCESS = 'ADD_RAW_MATERIAL_COSTING_SUCCESS';