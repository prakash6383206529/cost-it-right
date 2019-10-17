/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
const BASE_URL = 'http://183.182.84.29/cost-it-right-lite';
//const BASE_URL = 'http://10.10.10.235';


/** Export API */
export const API = {
  //Api for Unit of measurement
  createUOMAPI: `${BASE_URL}/api/v1/masters-unit-of-measurement/create`,
  getUOMAPI: `${BASE_URL}/api/v1/masters-unit-of-measurement/get`,
  getAllMasterUOMAPI: `${BASE_URL}/api/v1/configuration/select-list-get-unit-of-measurement`,
  getMasterFilterUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/get`,
  updateUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/update`,
  deleteUOMAPI : `${BASE_URL}/api/v1/masters-unit-of-measurement/delete`,

  //Api for the part
  getMaterialType: `${BASE_URL}/api/v1/configuration/select-list-get-material-type`,
  partCreateAPI: `${BASE_URL}/api/v1/masters-part/create`,
  getAllPartsAPI: `${BASE_URL}/api/v1/masters-part/get`,
  getOnePartAPI: `${BASE_URL}/api/v1/masters-part/get`,
  filterPartAPI : `${BASE_URL}/api/v1/masters-part/get`,
  deletePartAPI : `${BASE_URL}/api/v1/masters-part/delete`,
  updatePartAPI : `${BASE_URL}/api/v1/masters-part/update`,

  //Api for category
  createcategoryTypeAPI: `${BASE_URL}/api/v1/masters-category/create-type`,
  createCategoryAPI: `${BASE_URL}/api/v1/masters-category/create`,
  fetchCategoryType: `${BASE_URL}/api/v1/configuration/select-list-get-category-type`
}


//unit of measurement 
export const  API_REQUEST = 'API_REQUEST';
export const FETCH_MATER_DATA_FAILURE = 'FETCH_MATER_DATA_FAILURE';
export const FETCH_MATER_DATA_REQUEST = 'FETCH_MATER_DATA_REQUEST';
export const GET_UOM_DATA_SUCCESS = 'GET_UOM_DATA_SUCCESS';
export const GET_UOM_SUCCESS = 'GET_UOM_SUCCESS';
export const UNIT_OF_MEASUREMENT_API_FAILURE = 'UNIT_OF_MEASUREMENT_API_FAILURE';
export const CREATE_PART_REQUEST = 'CREATE_PART_REQUEST';
export const CREATE_PART_FAILURE = 'CREATE_PART_FAILURE';
export const CREATE_PART_SUCCESS = 'CREATE_PART_SUCCESS';
export const GET_ALL_PARTS_SUCCESS = 'GET_ALL_PARTS_SUCCESS';
export const  GET_PART_SUCCESS = 'GET_PART_SUCCESS';
export const GET_ALL_PARTS_FAILURE = 'GET_ALL_PARTS_FAILURE';
export const API_FAILURE = 'API_FAILURE';
export const GET_MATERIAL_TYPE_SUCCESS = 'GET_MATERIAL_TYPE_SUCCESS';
export const GET_UOM_DATA_FAILURE = 'GET_UOM_DATA_FAILURE';
export const CREATE_CATEGORY_TYPE_SUCCESS = 'CREATE_CATEGORY_TYPE_SUCCESS';
export const CREATE_CATEGORY_TYPE_FAILURE = 'CREATE_CATEGORY_TYPE_FAILURE';
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE';
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS';
export const FETCH_CATEGORY_DATA_FAILURE = 'FETCH_CATEGORY_DATA_FAILURE';
export const  GET_CATEGORY_DATA_SUCCESS = 'GET_CATEGORY_DATA_SUCCESS';

