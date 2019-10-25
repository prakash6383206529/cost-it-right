/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
const BASE_URL = 'http://183.182.84.29/cost-it-right-lite/api/v1';


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
  getCostingStatus: `${BASE_URL}/configuration/select-list-get-costing-status`,

  //api's for configure location
  getCountry: `${BASE_URL}/configuration-location/select-list-get-country`,
  getState: `${BASE_URL}/configuration-location/select-list-get-state`,
  getCity: `${BASE_URL}/configuration-location/select-list-get-city`,

  //api's for configure row material
  getRowMaterial: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material`,
  getRowGrade: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-grade`,
  getRowMaterialDetail: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-specification`,
  getRowMaterialCategory: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-categoryy`,

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
  fetchCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,

  //Api for material master
  createMaterialAPI: `${BASE_URL}/masters-material/material-type-create`,
  createRMCategoryAPI: `${BASE_URL}/masters-raw-material/create-category`,
  createRMGradeAPI: `${BASE_URL}/masters-raw-material/create-grade`,
  createRMSpecificationAPI: `${BASE_URL}/masters-raw-material/create-specification`,

  //Api for plant master
  createPlantAPI: `${BASE_URL}/plant/create`,

  //Api for supplier master
  createSupplierAPI: `${BASE_URL}/supplier/create`,

  //Api's for bill of materail
  createBOMAPI: `${BASE_URL}/masters-part-bill-of-material/add-bill-of-material`,
  getBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-material-list`,

  //Api's for bought out parts
  createBOPAPI: `${BASE_URL}//masters-bought-out-part/create`,
  getBOPAPI: `${BASE_URL}/GET /api/v1/masters-bought-out-part/get`,

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
export const GET_TECHNOLOGY_LIST_SUCCESS = 'GET_TECHNOLOGY_LIST_SUCCESS';

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

//for material master
export const CREATE_MATERIAL_SUCCESS = ' CREATE_MATERIAL_SUCCESS';
export const CREATE_MATERIAL_FAILURE = 'CREATE_MATERIAL_FAILURE';
export const GET_ROW_MATERIAL_SUCCESS = 'GET_ROW_MATERIAL_SUCCESS';
export const GET_GRADE_SUCCESS = 'GET_GRADE_SUCCESS';

//for plant master
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';

//for supplier master
export const CREATE_SUPPLIER_SUCCESS = 'CREATE_SUPPLIER_SUCCESS';
export const CREATE_SUPPLIER_FAILURE = 'CREATE_SUPPLIER_FAILURE';

//for BOM master
export const CREATE_BOM_SUCCESS = 'CREATE_BOM_SUCCESS';
export const CREATE_BOM_FAILURE = 'CREATE_BOM_FAILURE';
export const GET_BOM_SUCCESS = 'GET_BOM_SUCCESS';
export const GET_BOM_FAILURE = 'GET_BOM_FAILURE';

//for BOP master
export const CREATE_BOP_SUCCESS = 'CREATE_BOP_SUCCESS';
export const CREATE_BOP_FAILURE = 'CREATE_BOP_FAILURE';
export const GET_BOP_SUCCESS = 'GET_BOP_SUCCESS';
export const GET_BOP_FAILURE = 'GET_BOP_FAILURE';

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