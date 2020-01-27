/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
//const BASE_URL = 'http://10.10.1.100:8081/CIRLite';
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
  getModelTypes: `${BASE_URL}/configuration/select-list-get-costing-model-type`,

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
  getMaterialTypeDataList: `${BASE_URL}/masters-material/get-all-material-type`,
  getMaterial: `${BASE_URL}/masters-raw-material/get-all-costing-raw-material-details`,

  //Api for Unit of measurement master
  createUOMAPI: `${BASE_URL}/masters-unit-of-measurement/create`,
  getUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get`,
  getAllUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get-all`,
  getAllMasterUOMAPI: `${BASE_URL}/configuration/select-list-get-unit-of-measurement`,
  updateUOMAPI: `${BASE_URL}/masters-unit-of-measurement/update`,
  deleteUOMAPI: `${BASE_URL}/masters-unit-of-measurement/delete`,

  //Api for the part master

  // partCreateAPI: `${BASE_URL}/masters-part/create`,
  // getAllPartsAPI: `${BASE_URL}/masters-part/get-all`,
  // getOnePartAPI: `${BASE_URL}/masters-part/get`,
  // filterPartAPI: `${BASE_URL}/masters-part/get`,
  // deletePartAPI: `${BASE_URL}/masters-part/delete`,
  // updatePartAPI: `${BASE_URL}/masters-part/update`,

  partCreateAPI: `${BASE_URL}/masters-part-bill-of-material/create-part`,
  getAllPartsAPI: `${BASE_URL}/masters-part-bill-of-material/get-all-part`,
  getOnePartAPI: `${BASE_URL}/masters-part-bill-of-material/get-part`,
  filterPartAPI: `${BASE_URL}/masters-part-bill-of-material/get-part`,
  deletePartAPI: `${BASE_URL}/masters-part-bill-of-material/delete-part`,
  updatePartAPI: `${BASE_URL}/masters-part-bill-of-material/update-part`,

  //Api's for bill of materail
  createBOMAPI: `${BASE_URL}/masters-part-bill-of-material/generate-bill-of-material`,
  createNewBOMAPI: `${BASE_URL}/masters-part-bill-of-material/generate-new-bill-of-material`,
  getBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-materials`,
  getAllBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-all-bill-of-materials`,
  uploadBOMxlsAPI: `${BASE_URL}/masters-part-bill-of-material/upload-bill-of-material`,
  deleteBOMAPI: `${BASE_URL}/masters-part-bill-of-material/delete-bill-of-material`,
  getBOMByPartAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-material-by-part`,
  checkCostingExistForPart: `${BASE_URL}/masters-part-bill-of-material/check-exist-costing-by-part`,
  deleteExisCostingByPartID: `${BASE_URL}/masters-part-bill-of-material/delete-exist-costing-by-part`,

  //Api for category master
  createcategoryTypeAPI: `${BASE_URL}/masters-category/create-type`,
  createCategoryAPI: `${BASE_URL}/masters-category/create`,
  getCategoryTypeAPI: `${BASE_URL}/masters-category/get-all-category-type`,
  getCategoryAPI: `${BASE_URL}/masters-category/get-all-category`,
  fetchCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,

  //Api for row material master
  //createMaterialAPI: `${BASE_URL}/masters-material/material-type-create`,
  createMaterialAPI: `${BASE_URL}/masters-raw-material/create`,
  createRMCategoryAPI: `${BASE_URL}/masters-raw-material/create-category`,
  createRMGradeAPI: `${BASE_URL}/masters-raw-material/create-grade`,
  createRMSpecificationAPI: `${BASE_URL}/masters-raw-material/create-specification`,

  getRMMaterialAPI: `${BASE_URL}/masters-raw-material/get-all-raw-materials`,
  getRMGradeAPI: `${BASE_URL}/masters-raw-material/get-all-raw-material-grades`,
  getRMSpecificationAPI: `${BASE_URL}/masters-raw-material/get-all-raw-material-specifications`,
  getRMCategoryAPI: `${BASE_URL}/masters-raw-material/get-raw-material-category`,

  //Api for plant master
  //createPlantAPI: `${BASE_URL}/plant/create`,
  createPlantAPI: `${BASE_URL}/masters-plant/create`,
  getPlantAPI: `${BASE_URL}/masters-plant/get`,
  getAllPlantAPI: `${BASE_URL}/masters-plant/get-all`,
  updatePlantAPI: `${BASE_URL}/masters-plant/update`,
  deletePlantAPI: `${BASE_URL}/masters-plant/delete`,

  //Api for supplier master
  createSupplierAPI: `${BASE_URL}/supplier/create`,
  getSupplierAPI: `${BASE_URL}/supplier/get`,
  getAllSupplierAPI: `${BASE_URL}/supplier/get-all`,
  updateSupplierAPI: `${BASE_URL}/supplier/update`,
  deleteSupplierAPI: `${BASE_URL}/supplier/delete`,
  getRadioButtonSupplierType: `${BASE_URL}/configuration/radio-button-list-get-supplier-type`,

  //Api's for bought out parts
  createBOPAPI: `${BASE_URL}/masters-bought-out-part/create`,
  getBOPAPI: `${BASE_URL}/masters-bought-out-part/get`,
  getAllBOPAPI: `${BASE_URL}/masters-bought-out-part/get-all`,
  updateBOPAPI: `${BASE_URL}/masters-bought-out-part/update`,
  deleteBOPAPI: `${BASE_URL}/masters-bought-out-part/delete`,

  //Api's for process master
  createProcessAPI: `${BASE_URL}/masters-process/create`,
  getProcessAPI: `${BASE_URL}/masters-process/get`,
  getAllProcessAPI: `${BASE_URL}/masters-process/get-all`,
  updateProcessAPI: `${BASE_URL}/masters-process/update`,
  deleteProcessAPI: `${BASE_URL}/masters-process/delete`,

  //Api's for fuel master
  createFuelAPI: `${BASE_URL}/masters-fuel/create-fuel`,
  createFuelDetailAPI: `${BASE_URL}/masters-fuel/create-fuel-details`,
  getFuelAPI: `${BASE_URL}/masters-fuel/get-fuel`,
  getAllFuelAPI: `${BASE_URL}/masters-fuel/get-all-fuel`,
  getFuelDetailAPI: `${BASE_URL}/masters-fuel/get-fuel-details`,
  getAllFuelDetailAPI: `${BASE_URL}/masters-fuel/get-all-fuel-details`,
  deleteFuelAPI: `${BASE_URL}/masters-fuel/delete-fuel`,
  deleteFuelDetailAPI: `${BASE_URL}/masters-fuel/delete-fuel-detail`,

  //API's for other operations
  getOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-all-other-operation`,
  getOtherOperationsFormDataAPI: `${BASE_URL}/configuration-master/get-other-operation-combo-select-list`,
  createOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-other-operation`,

  //API's for CED other operations
  getCEDotherOperationsComboDataAPI: `${BASE_URL}/configuration-master/get-ced-other-operation-combo-select-list`,
  createCEDOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-ced-other-operation`,
  getCEDOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-all-ced-other-operation`,
  getCEDOtherOperationBySupplierID: `${BASE_URL}/costing-sheet-metal/get-ced-other-operation-by-supplier`,

  //API's for MHR combo data
  getMHRComboDataAPI: `${BASE_URL}/configuration-master/get-machine-hour-rate-combo-select-list`,
  createMHRMasterAPI: `${BASE_URL}/masters-machine-hour-rate/create`,
  getMHRList: `${BASE_URL}/masters-machine-hour-rate/get-all`,

  //API's for MHR combo data
  getOperationsAPI: `${BASE_URL}/masters-other-operation/get-all-operation`,
  createOperationAPI: `${BASE_URL}/masters-other-operation/create-operation`,

  //Api's for fright master
  createFreightAPI: `${BASE_URL}/masters-freight/create`,
  getFreightAPI: `${BASE_URL}/masters-freight/get`,
  getAllFreightAPI: `${BASE_URL}/masters-freight/get-all`,
  updateFrightAPI: `${BASE_URL}/masters-freight/update`,
  deleteFrightAPI: `${BASE_URL}/masters-freight/delete`,

  //API's for Additional freight master
  createAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/create`,
  getAllAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/get-all`,
  deleteAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/delete`,
  getAdditionalFreightByIdAPI: `${BASE_URL}/masters-additional-freight/get`,
  updateAdditionalFreightByIdAPI: `${BASE_URL}/masters-additional-freight/update`,
  getAdditionalFreightBySupplier: `${BASE_URL}/costing-sheet-metal/get-costing-addtional-freight`,

  //Api's for labour master
  createLabourAPI: `${BASE_URL}/masters-labour/create`,
  getLabourAPI: `${BASE_URL}/masters-labour/get`,
  getAllLabourAPI: `${BASE_URL}/masters-labour/get-all`,
  updateLabourAPI: `${BASE_URL}/masters-labour/update`,
  deleteLabourAPI: `${BASE_URL}/masters-labour/delete`,

  //Api's for overhead profit
  getOverheadProfitAPI: `${BASE_URL}/masters-overhead-and-profit/get-all`,
  getOverheadProfitComboDataAPI: `${BASE_URL}/configuration-master/get-overhead-and-profit-combo-select-list`,
  createOverheadProfitAPI: `${BASE_URL}/masters-overhead-and-profit/create`,

  //Api's for depreciation master
  createDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/create-depreciation`,
  getDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/get-all-depreciations`,

  //Api's for interest rate master
  getInterestRateAPI: `${BASE_URL}/supplier/get-supplier-interest-rate`,
  getAllInterestRateAPI: `${BASE_URL}/supplier/get-all-supplier-interest-rate`,
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
  UpdateCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/update-costing-weight-calculation`,

  //cost working API's
  getCostingBySupplier: `${BASE_URL}/costing-sheet-metal/get-costings-by-supplier`,
  getRawMaterialListBySupplierId: `${BASE_URL}/costing-sheet-metal/get-raw-material-by-supplier`,
  addCostingRawMaterial: `${BASE_URL}/costing-sheet-metal/add-costing-raw-material`,
  updateCostingRawMatrial: `${BASE_URL}/costing-sheet-metal/update-costing-raw-material`,
  getBoughtOutPartList: `${BASE_URL}/costing-sheet-metal/get-bought-out-part-by-supplier`,
  addCostingBoughtOutPart: `${BASE_URL}/costing-sheet-metal/add-costing-bought-out-part`,
  getOtherOperationList: `${BASE_URL}/costing-sheet-metal/get-other-operation-by-supplier`,
  addCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/add-costing-other-operations`,
  getCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/get-costing-other-operations`,
  getMHRCostingList: `${BASE_URL}/costing-sheet-metal/get-machine-hour-rate-by-supplier`,
  addCostingProcesses: `${BASE_URL}/costing-sheet-metal/add-costing-process`,
  getCostingProcesses: `${BASE_URL}/costing-sheet-metal/get-costing-process`,
  getProcessesSelectList: `${BASE_URL}/configuration/select-list-get-process`,
  saveProcessCosting: `${BASE_URL}/costing-sheet-metal/save-costing-process`,
  getOtherOpsSelectList: `${BASE_URL}/configuration/select-list-get-operation`,
  saveOtherOpsCosting: `${BASE_URL}/costing-sheet-metal/save-costing-other-operations`,
  getMaterialTypeSelectList: `${BASE_URL}/configuration/select-list-get-material-type`,
  updateCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/update-costing-other-operation`,
  saveCostingAsDraft: `${BASE_URL}/costing-sheet-metal/save-costing-details-as-draft`,
  getCostingOverHeadProByModelType: `${BASE_URL}/costing-sheet-metal/get-costing-overhead-profit-by-model-type`,
  saveCosting: `${BASE_URL}/costing-sheet-metal/save-costing`,

  //cost summary 
  getCostingByCostingId: `${BASE_URL}/costing-sheet-metal/get-costing-by-id`,
  getCostSummaryOtherOperationList: `${BASE_URL}/costing-sheet-metal/get-other-operation-by-supplier`,
  fetchFreightHeadsAPI: `${BASE_URL}/configuration/get-freight-heads`,
  getCostingFreight: `${BASE_URL}/costing-sheet-metal/get-costing-freight`,

  // Login API
  login: `${BASE_URL}/user/login`,
  logout: `${BASE_URL}/user/logout`,
  register: `${BASE_URL}/user/register`,

  //User's API
  getAllUserAPI: `${BASE_URL}/configuration/select-list-get-user`,

  //Role's API
  addRoleAPI: `${BASE_URL}/user-role/create`,
  getAllRoleAPI: `${BASE_URL}/user-role/get-all`,
  getRoleAPI: `${BASE_URL}/user-role/get`,
  updateRoleAPI: `${BASE_URL}/user-role/update`,
  deleteRoleAPI: `${BASE_URL}/user-role/delete`,
  rolesSelectList: `${BASE_URL}/configuration/select-list-get-roles`,

  //Department's API
  addDepartmentAPI: `${BASE_URL}/user-department/create`,
  getAllDepartmentAPI: `${BASE_URL}/user-department/get-all`,
  getDepartmentAPI: `${BASE_URL}/user-department/get`,
  updateDepartmentAPI: `${BASE_URL}/user-department/update`,
  deleteDepartmentAPI: `${BASE_URL}/user-department/delete`,

  //Level's API
  assignUserLevelAPI: `${BASE_URL}/user-level/assign-user-level-for-costing`,
  addUserLevelAPI: `${BASE_URL}/user-level/create`,
  getAllLevelAPI: `${BASE_URL}/user-level/get-all`,
  getUserLevelAPI: `${BASE_URL}/user-level/get`,
  updateUserLevelAPI: `${BASE_URL}/user-level/update`,
  deleteUserLevelAPI: `${BASE_URL}/user-level/delete`,

  //Common API for Plant by supplier
  getPlantBySupplier: `${BASE_URL}/configuration/get-plant-by-supplier`,

  //APPROVAL
  getSendForApproval: `${BASE_URL}/app-approval-system/send-for-approval`,
  getAllApprovalDepartment: `${BASE_URL}/app-approval-system/get-all-approval-department`,
  getAllApprovalUserByDepartment: `${BASE_URL}/app-approval-system/get-all-approval-users-by-department`,
  sendForApproval: `${BASE_URL}/app-approval-system/send-for-approval`,

  //PRIVILEGE
  createPrivilegePage: `${BASE_URL}/app-privilege-permission/create-privilege-page`,
  moduleSelectList: `${BASE_URL}/app-privilege-permission/get-module-select-list`,
  getPageSelectListByModule: `${BASE_URL}/app-privilege-permission/get-page-select-list-by-module`,
  getPageSelectList: `${BASE_URL}/app-privilege-permission/get-page-select-list`,
  setPagePermissionRoleWise: `${BASE_URL}/app-privilege-permission/set-page-permission-role-wise`,
  setPagePermissionUserWise: `${BASE_URL}/app-privilege-permission/set-page-permission-user-wise`,


}

//Api constants
export const API_REQUEST = 'API_REQUEST';
export const API_FAILURE = 'API_FAILURE';
export const API_SUCCESS = 'API_SUCCESS';

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
export const GET_MODEL_TYPE_SUCCESS = 'GET_MODEL_TYPE_SUCCESS';

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
export const GET_UNIT_PART_DATA_SUCCESS = 'GET_UNIT_PART_DATA_SUCCESS';
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
export const RAWMATERIAL_ADDED_FOR_COSTING = 'RAWMATERIAL_ADDED_FOR_COSTING';

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
export const GET_RADIO_SUPPLIER_TYPE_SUCCESS = 'GET_RADIO_SUPPLIER_TYPE_SUCCESS';

//for BOM master
export const CREATE_BOM_SUCCESS = 'CREATE_BOM_SUCCESS';
export const CREATE_BOM_FAILURE = 'CREATE_BOM_FAILURE';
export const GET_BOM_SUCCESS = 'GET_BOM_SUCCESS';
export const GET_BOM_FAILURE = 'GET_BOM_FAILURE';
export const UPLOAD_BOM_XLS_SUCCESS = 'UPLOAD_BOM_XLS_SUCCESS';
export const GET_BOM_UNIT_DATA_BY_PART_SUCCESS = 'GET_BOM_UNIT_DATA_BY_PART_SUCCESS';

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
export const GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS = 'GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS';

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

//For Additional Freight Master
export const GET_ALL_ADDITIONAL_FREIGHT_SUCCESS = 'GET_ALL_ADDITIONAL_FREIGHT_SUCCESS';
export const GET_ADDITIONAL_FREIGHT_DATA_SUCCESS = 'GET_ADDITIONAL_FREIGHT_DATA_SUCCESS';
export const GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS = 'GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS';

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
export const GET_FREIGHT_HEAD_SUCCESS = 'GET_FREIGHT_HEAD_SUCCESS';
export const GET_FREIGHT_AMOUNT_DATA_SUCCESS = 'GET_FREIGHT_AMOUNT_DATA_SUCCESS';
export const EMPTY_COSTING_DATA = 'EMPTY_COSTING_DATA';

//weight calculation costing
export const GET_WEIGHT_CALC_INFO_SUCCESS = 'GET_WEIGHT_CALC_INFO_SUCCESS';
export const CREATE_WEIGHT_CALC_COSTING_SUCCESS = 'CREATE_WEIGHT_CALC_COSTING_SUCCESS';
export const UPDATE_WEIGHT_CALC_SUCCESS = 'UPDATE_WEIGHT_CALC_SUCCESS';
export const GET_WEIGHT_CALC_LAYOUT_SUCCESS = 'GET_WEIGHT_CALC_LAYOUT_SUCCESS';
export const GET_COSTING_BY_SUPPLIER_SUCCESS = 'GET_COSTING_BY_SUPPLIER_SUCCESS';
export const GET_RM_LIST_BY_SUPPLIER_SUCCESS = 'GET_RM_LIST_BY_SUPPLIER_SUCCESS';
export const ADD_RAW_MATERIAL_COSTING_SUCCESS = 'ADD_RAW_MATERIAL_COSTING_SUCCESS';
export const UPDATE_COSTING_RM_SUCCESS = 'UPDATE_COSTING_RM_SUCCESS';
export const GET_BOP_LIST_SUCCESS = 'GET_BOP_LIST_SUCCESS';
export const ADD_BOP_COSTING_SUCCESS = 'ADD_BOP_COSTING_SUCCESS';
export const GET_OTHER_OPERATION_LIST_SUCCESS = 'GET_OTHER_OPERATION_LIST_SUCCESS';
export const ADD_OTHER_OPERATION_COSTING_SUCCESS = 'ADD_OTHER_OPERATION_COSTING_SUCCESS';
export const ADD_UNIT_OTHER_OPERATION_COSTING_DATA = 'ADD_UNIT_OTHER_OPERATION_COSTING_DATA';

export const GET_COSTING_BY_COSTINGID = 'GET_COSTING_BY_COSTINGID';
export const GET_MHR_LIST_SUCCESS = 'GET_MHR_LIST_SUCCESS';
export const ADD_MHR_FOR_PROCESS_GRID_DATA = 'ADD_MHR_FOR_PROCESS_GRID_DATA';
export const GET_PROCESSES_LIST_SUCCESS = 'GET_PROCESSES_LIST_SUCCESS';
export const SAVE_PROCESS_COSTING_SUCCESS = 'SAVE_PROCESS_COSTING_SUCCESS';
export const GET_OTHER_OPERATION_SELECT_LIST_SUCCESS = 'GET_OTHER_OPERATION_SELECT_LIST_SUCCESS';
export const SAVE_OTHER_OPERATION_COSTING_SUCCESS = 'SAVE_OTHER_OPERATION_COSTING_SUCCESS';
export const ADD_PROCESS_COSTING_SUCCESS = 'ADD_PROCESS_COSTING_SUCCESS';
export const GET_MATERIAL_DATA_SELECTLIST_SUCCESS = 'GET_MATERIAL_DATA_SELECTLIST_SUCCESS';
export const GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS = 'GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS';
export const SET_CED_ROW_DATA_TO_COST_SUMMARY = 'SET_CED_ROW_DATA_TO_COST_SUMMARY';
export const SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY = 'SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY';
export const SET_COSTING_DETAIL_ROW_DATA = 'SET_COSTING_DETAIL_ROW_DATA';
export const SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY = 'SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY';
export const UPDATE_COSTING_OTHER_OPERATION_SUCCESS = 'UPDATE_COSTING_OTHER_OPERATION_SUCCESS';
export const SAVE_COSTING_AS_DRAFT_SUCCESS = 'SAVE_COSTING_AS_DRAFT_SUCCESS';

// Login const
export const AUTH_API_FAILURE = 'AUTH_API_FAILURE';
export const AUTH_API_REQUEST = 'AUTH_API_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

//User 
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';

//Role
export const GET_ROLE_SUCCESS = 'GET_ROLE_SUCCESS';
export const GET_UNIT_ROLE_DATA_SUCCESS = 'GET_UNIT_ROLE_DATA_SUCCESS';
export const GET_ROLES_SELECTLIST_SUCCESS = 'GET_ROLES_SELECTLIST_SUCCESS';

//level users
export const GET_LEVEL_USER_SUCCESS = 'GET_LEVEL_USER_SUCCESS';
export const GET_UNIT_LEVEL_DATA_SUCCESS = 'GET_UNIT_LEVEL_DATA_SUCCESS';

//Department
export const GET_DEPARTMENT_SUCCESS = 'GET_DEPARTMENT_SUCCESS';
export const GET_UNIT_DEPARTMENT_DATA_SUCCESS = 'GET_UNIT_DEPARTMENT_DATA_SUCCESS';
export const GET_TECHNOLOGY_DATA_LIST_SUCCESS = 'GET_TECHNOLOGY_DATA_LIST_SUCCESS';

//Common to get plants by supplier
export const GET_PLANTS_BY_SUPPLIER = 'GET_PLANTS_BY_SUPPLIER';

//APPROVAL
export const GET_SEND_FOR_APPROVAL_SUCCESS = 'GET_SEND_FOR_APPROVAL_SUCCESS';
export const GET_ALL_APPROVAL_DEPARTMENT = 'GET_ALL_APPROVAL_DEPARTMENT';
export const GET_ALL_APPROVAL_USERS_BY_DEPARTMENT = 'GET_ALL_APPROVAL_USERS_BY_DEPARTMENT';

//PRIVILEGE
export const GET_MODULE_SELECTLIST_SUCCESS = 'GET_MODULE_SELECTLIST_SUCCESS';
export const GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS = 'GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS';
export const GET_PAGES_SELECTLIST_SUCCESS = 'GET_PAGES_SELECTLIST_SUCCESS';

//COSTING STATUS
export const APPROVED = 'Approved';
export const PENDING = 'Pending';
export const DRAFT = 'Draft';
export const REJECTED = 'Rejected';

//DECIMAL VALUES FOR PRICE
export const TWO_DECIMAL_PRICE = 2;
export const FOUR_DECIMAL_PRICE = 4;

//DECIMAL VALUES FOR WEIGHT
export const FIVE_DECIMAL_WEIGHT = 5;