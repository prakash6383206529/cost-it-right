/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
const BASE_URL = 'http://183.182.84.29/cost-it-right-lite';


/** Export API */
export const API = {
  //configure api's
  getMasterFilterUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/get`,
  getMaterialType: `${BASE_URL}/api/v1/configuration/select-list-get-material-type`,
  getCountry: `${BASE_URL}/api/v1/configuration/select-list-get-country`,
  getState: `${BASE_URL}/api/v1/configuration/select-list-get-state`,
  getCity: `${BASE_URL}/api/v1/configuration/select-list-get-city`,

  //Api for Unit of measurement master
  createUOMAPI: `${BASE_URL}/api/v1/masters-unit-of-measurement/create`,
  getUOMAPI: `${BASE_URL}/api/v1/masters-unit-of-measurement/get`,
  getAllMasterUOMAPI: `${BASE_URL}/api/v1/configuration/select-list-get-unit-of-measurement`,
  updateUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/update`,
  deleteUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/delete`,

  //Api for the part master
  partCreateAPI: `${BASE_URL}/api/v1/masters-part/create`,
  getAllPartsAPI: `${BASE_URL}/api/v1/masters-part/get`,
  getOnePartAPI: `${BASE_URL}/api/v1/masters-part/get`,
  filterPartAPI : `${BASE_URL}/api/v1/masters-part/get`,
  deletePartAPI : `${BASE_URL}/api/v1/masters-part/delete`,
  updatePartAPI : `${BASE_URL}/api/v1/masters-part/update`,

  //Api for category master
  createcategoryTypeAPI: `${BASE_URL}/api/v1/masters-category/create-type`,
  createCategoryAPI: `${BASE_URL}/api/v1/masters-category/create`,
  fetchCategoryType: `${BASE_URL}/api/v1/configuration/select-list-get-category-type`,

  //Api for material master
  createMaterialAPI: `${BASE_URL}/api/v1/masters-material/create`,

  //Api for plant master
  createPlantAPI: `${BASE_URL}/api/v1/plant/create`,

  //Api for supplier master
  createSupplierAPI: `${BASE_URL}/api/v1/supplier/create`,
}


//Api constants
export const  API_REQUEST = 'API_REQUEST';
export const API_FAILURE = 'API_FAILURE';

// Masters api constant
export const FETCH_MATER_DATA_REQUEST = 'FETCH_MATER_DATA_REQUEST';
export const FETCH_MATER_DATA_FAILURE = 'FETCH_MATER_DATA_FAILURE';
export const GET_COUNTRY_SUCCESS = 'GET_COUNTRY_SUCCESS';
export const GET_STATE_SUCCESS = 'GET_STATE_SUCCESS';
export const GET_CITY_SUCCESS = 'GET_CITY_SUCCESS';

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

//for plant master
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';

//for supplier master
export const CREATE_SUPPLIER_SUCCESS = 'CREATE_SUPPLIER_SUCCESS';
export const CREATE_SUPPLIER_FAILURE = 'CREATE_SUPPLIER_FAILURE';


