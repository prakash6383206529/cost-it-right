/**
 * Define all the constants required in application inside this file and export them
 */

import { getAuthToken } from '../helper/auth'

export const config = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Authorization': `Bearer ${getAuthToken()}`,
    'Access-From': 'WEB',
    'Api-Key': `${process.env.REACT_APP_API_KEY}`,
  },
}

// DEVELOPMENT MIL URL
const BASE_URL = 'http://10.10.1.100:1002/api/v1';

//MINDA QA
// const BASE_URL = 'https://apiinsightqa.unominda.com/api/v1';

//MINDA PRODUCTION
// const BASE_URL = 'https://apiinsight.unominda.com/api/v1';


//DEVELOPMENT MIL URL
export const FILE_URL = 'http://10.10.1.100:1002/';

//MINDA QA FILE URL
// export const FILE_URL = 'https://apiinsightqa.unominda.com/';

//MINDA PRODUCTION FILE URL
// export const FILE_URL = 'https://apiinsight.unominda.com/';

/** Export API */
export const API = {

  getMasterFilterUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get`,
  getMaterialType: `${BASE_URL}/configuration/select-list-get-material-type`,
  getPlant: `${BASE_URL}/configuration/select-list-get-plant`,
  getTechnology: `${BASE_URL}/configuration/select-list-get-technology`,
  getSupplierCode: `${BASE_URL}/configuration/select-list-get-vendor-code`,
  getCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,
  getCategory: `${BASE_URL}/configuration/select-list-get-category`,
  getCostingStatus: `${BASE_URL}/configuration/select-list-get-costing-status`,
  getCostingHeads: `${BASE_URL}/configuration/select-list-get-costing-heads`,
  getModelTypes: `${BASE_URL}/configuration/select-list-get-costing-model-type`,
  getTechnologySelectList: `${BASE_URL}/configuration/select-list-get-technology`,
  getPlantSelectList: `${BASE_URL}/configuration/select-list-get-plant`,
  getPlantSelectListByType: `${BASE_URL}/configuration/select-list-get-plants-by-type`,
  getVendorPlantSelectList: `${BASE_URL}/configuration/select-list-get-un-associated-vendor-plants`,

  //Combo apis

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
  getLabourTypeSelectList: `${BASE_URL}/configuration/select-list-get-labour-type`,

  //LOCATION API
  getAllCities: `${BASE_URL}/configuration-location/select-list-get-vendor-city`,
  getSupplierCity: `${BASE_URL}/configuration-location/select-list-get-vendor-city`,
  getCountry: `${BASE_URL}/configuration-location/select-list-get-country`,
  getState: `${BASE_URL}/configuration-location/select-list-get-state`,
  getCity: `${BASE_URL}/configuration-location/select-list-get-city`,
  getCityByCountry: `${BASE_URL}/configuration-location/select-list-get-city-by-request`,

  //api's for configure raw material
  getRawMaterialSelectList: `${BASE_URL}/configuration-raw-material/select-list-get-raw-material`,
  getRowGrade: `${BASE_URL}/configuration-raw-material/select-list-get-raw-material-grade`,
  getRowMaterialSpecification: `${BASE_URL}/configuration-raw-material/select-list-get-raw-material-specification`,
  getRawMaterialCategory: `${BASE_URL}/configuration-raw-material/select-list-get-raw-material-category`,

  //MATERIAL TYPE
  createMaterialType: `${BASE_URL}/masters-material/create-material-type`,
  getMaterialTypeDataAPI: `${BASE_URL}/masters-material/get-material-type`,
  deleteMaterialTypeAPI: `${BASE_URL}/masters-material/delete-material-type`,
  updateMaterialtypeAPI: `${BASE_URL}/masters-material/update-material-type`,
  createMaterial: `${BASE_URL}/masters-raw-material/add-costing-raw-material-details`,
  getMaterialTypeDataList: `${BASE_URL}/masters-material/get-all-material-type`,
  getMaterial: `${BASE_URL}/masters-raw-material/get-all-costing-raw-material-details`,

  //UOM MASTER
  createUOMAPI: `${BASE_URL}/masters-unit-of-measurement/create`,
  getUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get`,
  getAllUOMAPI: `${BASE_URL}/masters-unit-of-measurement/get-all`,
  getAllMasterUOMAPI: `${BASE_URL}/configuration/select-list-get-unit-of-measurement`,
  updateUOMAPI: `${BASE_URL}/masters-unit-of-measurement/update`,
  deleteUOMAPI: `${BASE_URL}/masters-unit-of-measurement/delete`,
  getUnitTypeListAPI: `${BASE_URL}/configuration/select-list-get-unit-type`,
  activeInactiveUOM: `${BASE_URL}/masters-unit-of-measurement/active`,
  getUOMListByUnitType: `${BASE_URL}/configuration/select-list-get-unit-of-measurement-by-unit-type`,

  //NEW PART API
  createNewPartAPI: `${BASE_URL}/masters-part/create-part`,
  getAllNewPartsAPI: `${BASE_URL}/masters-part/get-all-parts`,
  deleteNewPartsAPI: `${BASE_URL}/masters-part/delete-part`,
  getNewPartsDataAPI: `${BASE_URL}/masters-part/get-part`,
  updateNewPartsAPI: `${BASE_URL}/masters-part/update-part`,

  //PART MASTER INDIVISUAL COMPONENT
  createPart: `${BASE_URL}/masters-part/create-component-part`,
  updatePart: `${BASE_URL}/masters-part/update-component-part`,
  deletePart: `${BASE_URL}/masters-part/delete-component-part`,
  getPartData: `${BASE_URL}/masters-part/get-component-part`,
  getPartDataList: `${BASE_URL}/masters-part/get-all-component-part`,
  getPart: `${BASE_URL}/configuration/select-list-get-part`,
  getPartSelectList: `${BASE_URL}/configuration/select-list-get-part`,
  fileUploadPart: `${BASE_URL}/masters-part/part-file-upload`,
  fileDeletePart: `${BASE_URL}/masters-part/delete-part-attachment-file`,
  partComponentBulkUpload: `${BASE_URL}/masters-part/bulk-upload-for-component-part-json`,
  activeInactivePartStatus: `${BASE_URL}/masters-part/active-component-part`,
  checkStatusCodeAPI: `${BASE_URL}/masters-part/check-status-code`,

  //ASSEMBLY PART
  createAssemblyPart: `${BASE_URL}/masters-part/create-assembly-part`,
  getAssemblyPartDataList: `${BASE_URL}/masters-part/get-all-assembly-part`,
  getAssemblyPartDetail: `${BASE_URL}/masters-part/get-assembly-part`,
  updateAssemblyPart: `${BASE_URL}/masters-part/update-assembly-part`,
  deleteAssemblyPart: `${BASE_URL}/masters-part/delete-assembly-part`,
  getSelectListPartType: `${BASE_URL}/masters-part/select-list-part-type`,
  getAssemblyPartSelectList: `${BASE_URL}/masters-part/select-list-assambly-part`,
  getComponentPartSelectList: `${BASE_URL}/masters-part/select-list-component-part`,
  getBoughtOutPartSelectList: `${BASE_URL}/masters-part/select-list-boughtout-part`,
  getBOMViewerTree: `${BASE_URL}/masters-part/get-visual-aid-bom-level-tree-view`,
  getChildDrawerBOPData: `${BASE_URL}/masters-bought-out-part/get-bought-out-part-by-id`,
  BOMUploadPart: `${BASE_URL}/masters-part/upload-bom-json`,

  //BOM API'S
  createBOMAPI: `${BASE_URL}/masters-part-bill-of-material/generate-bill-of-material`,
  createNewBOMAPI: `${BASE_URL}/masters-part-bill-of-material/generate-new-bill-of-material`,
  getBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-materials`,
  getAllBOMAPI: `${BASE_URL}/masters-part-bill-of-material/get-all-bill-of-materials`,
  uploadBOMxlsAPI: `${BASE_URL}/masters-part-bill-of-material/upload-bill-of-material`,
  uploadBOMAPI: `${BASE_URL}/masters-part/mass-upload-bom`,
  deleteBOMAPI: `${BASE_URL}/masters-part-bill-of-material/delete-bill-of-material`,
  getBOMByPartAPI: `${BASE_URL}/masters-part-bill-of-material/get-bill-of-material-by-part`,
  checkCostingExistForPart: `${BASE_URL}/masters-part-bill-of-material/check-exist-costing-by-part`,
  deleteExisCostingByPartID: `${BASE_URL}/masters-part-bill-of-material/delete-exist-costing-by-part`,

  //CATEGORY MASTER
  createcategoryTypeAPI: `${BASE_URL}/masters-category/create-type`,
  createCategoryAPI: `${BASE_URL}/masters-category/create`,
  getCategoryTypeDataAPI: `${BASE_URL}/masters-category/get-category-type`,
  updateCategoryTypeAPI: `${BASE_URL}/masters-category/update-category-type`,
  deleteCategoryTypeAPI: `${BASE_URL}/masters-category/delete-category-type`,
  getCategoryTypeAPI: `${BASE_URL}/masters-category/get-all-category-type`,
  fetchCategoryType: `${BASE_URL}/configuration/select-list-get-category-type`,
  getCategoryAPI: `${BASE_URL}/masters-category/get-all-category`,
  getCategoryData: `${BASE_URL}/masters-category/get-category`,
  updateCategoryMasterAPI: `${BASE_URL}/masters-category/update-category`,
  deleteCategoryMasterAPI: `${BASE_URL}/masters-category/delete-category`,

  //RAW MATERIAL MASTER
  createMaterialAPI: `${BASE_URL}/masters-raw-material/create-raw-material`,
  getRawMaterialDataAPI: `${BASE_URL}/masters-raw-material/get-raw-material`,
  updateRawMaterialAPI: `${BASE_URL}/masters-raw-material/update-raw-material`,
  deleteRawMaterialAPI: `${BASE_URL}/masters-raw-material/delete-raw-material`,

  //RAW MATERIAL DETAILS
  getRawMaterialDetailsDataAPI: `${BASE_URL}/masters-raw-material/get-all-costing-raw-material-details`,

  //RAW MATERIAL DOMESTIC
  createRMDomestic: `${BASE_URL}/masters-raw-material/create-raw-material-domestic`,
  updateRMDomesticAPI: `${BASE_URL}/masters-raw-material/update-raw-material-domestic`,
  deleteRawMaterialDetailAPI: `${BASE_URL}/masters-raw-material/delete-raw-material-details`,
  getRMDomesticDataById: `${BASE_URL}/masters-raw-material/get-raw-material-domestic-by-id`,
  createRawMaterialNameChild: `${BASE_URL}/masters-raw-material/create-raw-material-name-child`,
  getRawMaterialNameChild: `${BASE_URL}/masters-raw-material/select-list-raw-material-name-child`,
  getGradeListByRawMaterialNameChild: `${BASE_URL}/masters-raw-material/select-list-raw-material-grade-child`,
  getVendorListByVendorType: `${BASE_URL}/masters-raw-material/select-list-for-raw-material-vendor-by-type`,
  getRMDomesticDataList: `${BASE_URL}/masters-raw-material/get-all-raw-material-domestic-list`,
  fileUploadRMDomestic: `${BASE_URL}/masters-raw-material/raw-material-file-upload`,
  fileUpdateRMDomestic: `${BASE_URL}/masters-raw-material/update-raw-material-file`,
  fileDeleteRMDomestic: `${BASE_URL}/masters-raw-material/delete-raw-material-file`,
  bulkUploadRMDomesticZBC: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-zbc-domestic-json`,
  bulkUploadRMDomesticVBC: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-vbc-domestic-json`,
  bulkfileUploadRM: `${BASE_URL}/masters-raw-material/bulk-file-upload-raw-material`,
  getUnassociatedRawMaterial: `${BASE_URL}/masters-raw-material/select-list-raw-material-not-associated-name-child`,

  //RAW MATERIAL IMPORT
  createRMImport: `${BASE_URL}/masters-raw-material/create-raw-material-import`,
  updateRMImportAPI: `${BASE_URL}/masters-raw-material/update-raw-material-import`,
  getRMImportDataById: `${BASE_URL}/masters-raw-material/get-raw-material-import-by-id`,
  getRMImportDataList: `${BASE_URL}/masters-raw-material/get-all-raw-material-import-list`,
  bulkUploadRMImportZBC: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-zbc-import-json`,
  bulkUploadRMImportVBC: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-vbc-import-json`,

  //RAW MATERIAL DOMESTIC AND IMPORT FILTER API'S
  getRawMaterialFilterSelectList: `${BASE_URL}/masters-raw-material/get-raw-material-filter-select-list`,
  //BY RM
  getGradeFilterByRawMaterialSelectList: `${BASE_URL}/masters-raw-material/get-grades-select-list-by-raw-material`,
  getVendorFilterByRawMaterialSelectList: `${BASE_URL}/masters-raw-material/get-vendors-select-list-by-raw-material`,
  //BY GRADE
  getRawMaterialFilterByGradeSelectList: `${BASE_URL}/masters-raw-material/get-raw-materils-select-list-by-grade`,
  getVendorFilterByGradeSelectList: `${BASE_URL}/masters-raw-material/get-vendors-select-list-by-grade`,
  //BY VENDOR
  getRawMaterialFilterByVendorSelectList: `${BASE_URL}/masters-raw-material/get-raw-material-select-list-by-vendor`,
  getGradeFilterByVendorSelectList: `${BASE_URL}/masters-raw-material/get-grade-select-list-by-vendor`,

  //RAW MATERIAL CATEGORY
  getCategoryDataAPI: `${BASE_URL}/masters-raw-material/get-raw-material-category`,
  updateCategoryAPI: `${BASE_URL}/masters-raw-material/update-material-category`,
  deleteCategoryAPI: `${BASE_URL}/masters-raw-material/delete-material-category`,
  createRMCategoryAPI: `${BASE_URL}/masters-raw-material/create-category`,
  createRMGradeAPI: `${BASE_URL}/masters-raw-material/create-grade`,
  createRMSpecificationAPI: `${BASE_URL}/masters-raw-material/create-specification`,
  createAssociation: `${BASE_URL}/masters-material/associate-raw-material`,
  getRMMaterialAPI: `${BASE_URL}/masters-raw-material/get-all-raw-materials`,

  //RM GRADE
  getRMGradeAPI: `${BASE_URL}/masters-raw-material/get-all-raw-material-grades`,
  deleteRMGradeAPI: `${BASE_URL}/masters-raw-material/delete-material-grade`,
  getRMGradeDataAPI: `${BASE_URL}/masters-raw-material/get-raw-material-grades`,
  updateRMGradeAPI: `${BASE_URL}/masters-raw-material/update-material-grade`,

  //RM SPECIFICATION
  getRMSpecificationAPI: `${BASE_URL}/masters-raw-material/get-all-specifications`,
  getRMSpecificationDataList: `${BASE_URL}/masters-raw-material/get-all-raw-material-specifications`,
  getRMSpecificationDataAPI: `${BASE_URL}/masters-raw-material/get-raw-material-specifications`,
  updateRMSpecificationAPI: `${BASE_URL}/masters-raw-material/update-material-specification`,
  deleteRMSpecificationAPI: `${BASE_URL}/masters-raw-material/delete-material-specification`,
  getRMCategoryAPI: `${BASE_URL}/masters-raw-material/get-raw-material-category`,
  getRMTypeSelectListAPI: `${BASE_URL}/configuration-raw-material /select-list-get-material-type`,
  getGradeSelectList: `${BASE_URL}/masters-raw-material/select-list-raw-material-grade`,
  getGradeByRMTypeSelectListAPI: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-grade`,
  getRMGradeSelectListByRawMaterial: `${BASE_URL}/masters-raw-material/select-list-raw-material-grade-by-raw-material-id`,
  bulkUploadRMSpecification: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-spec-json`,
  getRawMaterialChildById: `${BASE_URL}/masters-raw-material/get-raw-material-child-by-id`,
  updateRawMaterialChildName: `${BASE_URL}/masters-raw-material/update-raw-material-name-child`,

  //PLANT MASTER
  //createPlantAPI: `${BASE_URL}/plant/create`,
  createPlantAPI: `${BASE_URL}/masters-plant/create`,
  getPlantAPI: `${BASE_URL}/masters-plant/get`,
  getAllPlantAPI: `${BASE_URL}/masters-plant/get-all`,
  updatePlantAPI: `${BASE_URL}/masters-plant/update`,
  deletePlantAPI: `${BASE_URL}/masters-plant/delete`,
  activeInactiveStatus: `${BASE_URL}/masters-plant/active`,
  getFilteredPlantList: `${BASE_URL}/masters-plant/get-all-by-filter`,

  //VENDOR MASTER
  createSupplierAPI: `${BASE_URL}/vendor/create-vendor`,
  getSupplierAPI: `${BASE_URL}/vendor/get-vendor`,
  getAllSupplierAPI: `${BASE_URL}/vendor/get-all-vendors`,
  updateSupplierAPI: `${BASE_URL}/vendor/update-vendor`,
  deleteSupplierAPI: `${BASE_URL}/vendor/delete-vendor`,
  getRadioButtonSupplierType: `${BASE_URL}/configuration/radio-button-list-get-supplier-type`,
  getVendorTypesSelectList: `${BASE_URL}/vendor/vendor-types-select-list`,
  getSupplierLists: `${BASE_URL}/configuration/select-list-get-vendor`,
  activeInactiveVendorStatus: `${BASE_URL}/vendor/active-vendor`,
  getVendorsByVendorTypeID: `${BASE_URL}/vendor/vendor-by-vendor-type-select-list`,
  vendorBulkUpload: `${BASE_URL}/vendor/bulk-upload-for-vendor-json`,
  getAllVendorSelectList: `${BASE_URL}/vendor/all-vendor-select-list`,
  getVendorTypeByVendorSelectList: `${BASE_URL}/vendor/vendor-type-by-vendor-select-list`,
  getVendorWithVendorCodeSelectList: `${BASE_URL}/vendor/vbc-vendor-with-code-select-list`,
  getVendorTypeBOPSelectList: `${BASE_URL}/vendor/vendor-bop-type-select-list`,

  //BOP DOMESTIC
  createBOPDomestic: `${BASE_URL}/masters-bought-out-part/create-bought-out-part-domestic`,
  getBOPDomesticById: `${BASE_URL}/masters-bought-out-part/get-domestic-bought-out-part-by-id`,
  getBOPDomesticDataList: `${BASE_URL}/masters-bought-out-part/get-all-domestic-bought-out-part-by-filter`,
  updateBOPDomestic: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-domestic`,
  deleteBOP: `${BASE_URL}/masters-bought-out-part/delete-bought-out-part`,
  fileUploadBOPDomestic: `${BASE_URL}/masters-bought-out-part/bought-out-part-file-upload`,
  fileDeleteBOPDomestic: `${BASE_URL}/masters-bought-out-part/delete-bought-out-part-file`,
  bulkUploadBOPDomesticZBC: `${BASE_URL}/masters-bought-out-part/bulk-upload-for-bought-out-part-zbc-domestic-json`,
  bulkUploadBOPDomesticVBC: `${BASE_URL}/masters-bought-out-part/bulk-upload-for-bought-out-part-vbc-domestic-json`,
  getPlantSelectListByVendor: `${BASE_URL}/masters-bought-out-part/get-select-list-plant-by-vendor`,

  //BOP IMPORT
  createBOPImport: `${BASE_URL}/masters-bought-out-part/create-bought-out-part-import`,
  getBOPImportById: `${BASE_URL}/masters-bought-out-part/get-import-bought-out-part-by-id`,
  getBOPImportDataList: `${BASE_URL}/masters-bought-out-part/get-all-import-bought-out-part-by-filter`,
  updateBOPImport: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-import`,
  bulkUploadBOPImportZBC: `${BASE_URL}/masters-bought-out-part/bulk-upload-for-bought-out-part-zbc-import-json`,
  bulkUploadBOPImportVBC: `${BASE_URL}/masters-bought-out-part/bulk-upload-for-bought-out-part-vbc-import-json`,

  getManageBOPSOBDataList: `${BASE_URL}/masters-bought-out-part/get-bought-out-part-vendor-share-of-business-by-filter`,
  getManageBOPSOBById: `${BASE_URL}/masters-bought-out-part/get-bought-out-part-vendor-share-of-business-by-bop-part-number`,
  updateBOPSOBVendors: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-vendor-share-of-business`,

  //BOP Category
  createBOPCategory: `${BASE_URL}/masters-bought-out-part/add-bought-out-part-category`,
  getBOPCategorySelectList: `${BASE_URL}/masters-bought-out-part/select-list-bought-out-part-category`,

  //PROCESS MASTER
  createProcessAPI: `${BASE_URL}/masters-process/create`,
  getProcessAPI: `${BASE_URL}/masters-process/get`,
  getAllProcessAPI: `${BASE_URL}/masters-process/get-all`,
  updateProcessAPI: `${BASE_URL}/masters-process/update`,
  deleteProcessAPI: `${BASE_URL}/masters-process/delete`,

  //FUEL MASTER
  createFuel: `${BASE_URL}/masters-fuel/create-fuel`,
  createFuelDetail: `${BASE_URL}/masters-fuel/create-fuel-details`,
  updateFuelDetail: `${BASE_URL}/masters-fuel/update-fuel-details`,
  getFuelAPI: `${BASE_URL}/masters-fuel/get-fuel`,
  getAllFuelAPI: `${BASE_URL}/masters-fuel/get-all-fuel`,
  getFuelDetailData: `${BASE_URL}/masters-fuel/get-fuel-details`,
  getFuelDetailDataList: `${BASE_URL}/masters-fuel/get-all-fuel-details-by-filter`,
  deleteFuelAPI: `${BASE_URL}/masters-fuel/delete-fuel`,
  deleteFuelDetailAPI: `${BASE_URL}/masters-fuel/delete-fuel-detail`,
  getFuelComboData: `${BASE_URL}/configuration-master/get-fuel-details-combo-select-list`,
  getStateListByFuel: `${BASE_URL}/masters-fuel/get-state-by-fuel-select-list`,
  getFuelListByState: `${BASE_URL}/masters-fuel/get-fuel-by-state-select-list`,
  fuelBulkUpload: `${BASE_URL}/masters-fuel/bulk-upload-for-fuel-details-json`,

  //POWER MASTER
  createPowerDetail: `${BASE_URL}/masters-power/create-power-detail`,
  getPowerDetailData: `${BASE_URL}/masters-power/get-power-detail`,
  updatePowerDetail: `${BASE_URL}/masters-power/update-power-detail`,
  deletePowerDetail: `${BASE_URL}/masters-power/delete-power-detail`,
  getPowerDetailDataList: `${BASE_URL}/masters-power/get-all-power-details`,
  getPlantListByState: `${BASE_URL}/masters-fuel/get-plant-by-state-select-list`,
  getDieselRateByStateAndUOM: `${BASE_URL}/masters-fuel/get-fuel-rate-by-state-uom`,
  getZBCPlantList: `${BASE_URL}/masters-fuel/get-all-zbc-plant-select-list`,
  getStateSelectList: `${BASE_URL}/masters-fuel/get-all-state-select-list`,

  createVendorPowerDetail: `${BASE_URL}/masters-power/create-vendor-power-details`,
  updateVendorPowerDetail: `${BASE_URL}/masters-power/update-vendor-power-detail`,
  getVendorPowerDetailData: `${BASE_URL}/masters-power/get-vendor-power-detail`,
  deleteVendorPowerDetail: `${BASE_URL}/masters-power/delete-vendor-power-detail`,
  getVendorPowerDetailDataList: `${BASE_URL}/masters-power/get-all-vender-power-details`,

  //API's for other operations
  getOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-all-other-operation`,
  getOtherOperationsFormDataAPI: `${BASE_URL}/configuration-master/get-other-operation-combo-select-list`,
  createOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-other-operation`,
  deleteOtherOperationAPI: `${BASE_URL}/masters-other-operation/delete-other-operation`,
  getOtherOperationDataAPI: `${BASE_URL}/masters-other-operation/get-other-operation`,
  updateOtherOperationAPI: `${BASE_URL}/masters-other-operation/update-other-operation`,

  //API's for CED other operations
  getCEDotherOperationsComboDataAPI: `${BASE_URL}/configuration-master/get-ced-other-operation-combo-select-list`,
  getCEDOtherOperationBySupplierID: `${BASE_URL}/costing-sheet-metal/get-ced-other-operation-by-supplier`,
  createCEDOtherOperationAPI: `${BASE_URL}/masters-other-operation/create-ced-other-operation`,
  getCEDOtherOperationsAPI: `${BASE_URL}/masters-other-operation/get-all-ced-other-operation`,
  getCEDoperationDataAPI: `${BASE_URL}/masters-other-operation/get-ced-other-operation`,
  deleteCEDotherOperationAPI: `${BASE_URL}/masters-other-operation/delete-ced-other-operation`,
  updateCEDoperationAPI: `${BASE_URL}/masters-other-operation/update-ced-other-operation`,

  //OPERATION MASTER
  createOperationAPI: `${BASE_URL}/masters-operation/create-operation`,
  updateOperationAPI: `${BASE_URL}/masters-operation/update-operation`,
  getOperationsDataList: `${BASE_URL}/masters-operation/get-all-operation-by-filter`,
  getOperationDataAPI: `${BASE_URL}/masters-operation/get-operation`,
  deleteOperationAPI: `${BASE_URL}/masters-operation/delete-operation`,
  getOperationSelectList: `${BASE_URL}/configuration/select-list-get-operation`,
  fileUploadOperation: `${BASE_URL}/masters-operation/operation-file-upload`,
  fileDeleteOperation: `${BASE_URL}/masters-operation/delete-operation-file`,
  checkAndGetOperationCode: `${BASE_URL}/masters-operation/check-operation-code-is-unique`,
  operationZBCBulkUpload: `${BASE_URL}/masters-operation/bulk-upload-for-operation-zbc-json`,
  operationVBCBulkUpload: `${BASE_URL}/masters-operation/bulk-upload-for-operation-vbc-json`,

  getVendorListByTechnology: `${BASE_URL}/masters-operation/get-operation-vendor-by-technology-select-list`,
  getOperationListByTechnology: `${BASE_URL}/masters-operation/get-operation-by-technology-select-list`,
  getTechnologyListByOperation: `${BASE_URL}/masters-operation/get-operation-technology-by-operation-select-list`,
  getVendorListByOperation: `${BASE_URL}/masters-operation/get-operation-vendor-by-operation-select-list`,
  getTechnologyListByVendor: `${BASE_URL}/masters-operation/get-operation-technology-by-vendor-select-list`,
  getOperationListByVendor: `${BASE_URL}/masters-operation/get-operation-by-vendor-select-list`,

  //FREIGHT MASTER
  createFreight: `${BASE_URL}/masters-freight/create`,
  getFreightData: `${BASE_URL}/masters-freight/get`,
  getFreightDataList: `${BASE_URL}/masters-freight/get-all`,
  updateFright: `${BASE_URL}/masters-freight/update`,
  deleteFright: `${BASE_URL}/masters-freight/delete`,
  getFreightModeSelectList: `${BASE_URL}/configuration/select-list-get-freight-modes`,
  getFreigtFullTruckCapacitySelectList: `${BASE_URL}/configuration/select-list-get-full-truck-capacity`,
  getFreigtRateCriteriaSelectList: `${BASE_URL}/configuration/select-list-get-full-truck-ratecriteria`,

  //API's for Additional freight master
  createAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/create`,
  getAllAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/get-all`,
  deleteAdditionalFreightAPI: `${BASE_URL}/masters-additional-freight/delete`,
  getAdditionalFreightByIdAPI: `${BASE_URL}/masters-additional-freight/get`,
  updateAdditionalFreightByIdAPI: `${BASE_URL}/masters-additional-freight/update`,
  getAdditionalFreightBySupplier: `${BASE_URL}/costing-sheet-metal/get-costing-addtional-freight`,

  //LABOUR MASTER
  createLabour: `${BASE_URL}/masters-labour/create`,
  getLabourData: `${BASE_URL}/masters-labour/get`,
  getLabourDataList: `${BASE_URL}/masters-labour/get-all-by-filter`,
  updateLabour: `${BASE_URL}/masters-labour/update`,
  deleteLabour: `${BASE_URL}/masters-labour/delete-individual`,
  labourTypeVendorSelectList: `${BASE_URL}/vendor/vendor-labour-type-select-list`,
  getLabourTypeByPlantSelectList: `${BASE_URL}/masters-labour/get-labour-type-by-plant-select-list`,
  labourBulkUpload: `${BASE_URL}/masters-labour/bulk-upload-for-labour-details-vbc-json`,
  getLabourTypeByMachineTypeSelectList: `${BASE_URL}/masters-labour/get-labour-type-by-machine-type-select-list`,

  //OVERHEAD AND PROFIT API'S
  createOverhead: `${BASE_URL}/masters-overhead-and-profit/create-overhead`,
  updateOverhead: `${BASE_URL}/masters-overhead-and-profit/update-overhead`,
  getOverheadData: `${BASE_URL}/masters-overhead-and-profit/get`,
  getOverheadDataList: `${BASE_URL}/masters-overhead-and-profit/get-all-overhead-by-filter`,
  deleteOverhead: `${BASE_URL}/masters-overhead-and-profit/delete-overhead`,
  activeInactiveOverhead: `${BASE_URL}/masters-overhead-and-profit/active-inactive-overhead`,
  fileUploadOverHead: `${BASE_URL}/masters-overhead-and-profit/overhead-file-upload`,
  fileDeleteOverhead: `${BASE_URL}/masters-overhead-and-profit/delete-overhead-file`,
  overheadBulkUpload: `${BASE_URL}/masters-overhead-and-profit/bulk-upload-for-overhead-json`,
  getVendorFilterByModelTypeSelectList: `${BASE_URL}/masters-overhead-and-profit/overhead-vendor-with-code-by-model-type-select-list`,
  getModelTypeFilterByVendorSelectList: `${BASE_URL}/masters-overhead-and-profit/overhead-model-type-by-vendor-select-list`,

  createProfit: `${BASE_URL}/masters-overhead-and-profit/create-profit`,
  updateProfit: `${BASE_URL}/masters-overhead-and-profit/update-profit`,
  getProfitData: `${BASE_URL}/masters-overhead-and-profit/get-profit`,
  deleteProfit: `${BASE_URL}/masters-overhead-and-profit/delete-profit`,
  getProfitDataList: `${BASE_URL}/masters-overhead-and-profit/get-all-profit-by-filter`,
  activeInactiveProfit: `${BASE_URL}/masters-overhead-and-profit/active-inactive-profit`,
  getOverheadProfitComboDataAPI: `${BASE_URL}/configuration-master/get-overhead-and-profit-combo-select-list`,
  fileUploadProfit: `${BASE_URL}/masters-overhead-and-profit/profit-file-upload`,
  fileDeleteProfit: `${BASE_URL}/masters-overhead-and-profit/delete-profit-file`,
  profitBulkUpload: `${BASE_URL}/masters-overhead-and-profit/bulk-upload-for-profit-json`,
  getProfitVendorFilterByModelSelectList: `${BASE_URL}/masters-overhead-and-profit/profit-vendor-with-code-by-model-type-select-list`,
  getProfitModelFilterByVendorSelectList: `${BASE_URL}/masters-overhead-and-profit/profit-model-type-by-vendor-select-list`,

  //DEPRECIATION MASTER
  createDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/create-depreciation-type`,
  getDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/get-all-depreciation-type`,
  deleteDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/delete-depreciation-type`,
  getDepreciationDataAPI: `${BASE_URL}/masters-machine-hour-rate/get-depreciation-type`,
  updateDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/update-depreciation-type`,

  //INTEREST MASTER
  createInterestRate: `${BASE_URL}/vendor/create-vendor-interest-rate`,
  getInterestRateDataList: `${BASE_URL}/vendor/get-all-vendor-interest-rate`,
  getInterestRateData: `${BASE_URL}/vendor/get-vendor-interest-rate`,
  updateInterestRate: `${BASE_URL}/vendor/update-vendor-interest-rate`,
  deleteInterestRate: `${BASE_URL}/vendor/delete-vendor-interest-rate`,
  getPaymentTermsAppliSelectList: `${BASE_URL}/configuration/get-payment-terms-applicability-list`,
  getICCAppliSelectList: `${BASE_URL}/configuration/get-icc-applicability-list`,
  bulkUploadInterestRateZBC: `${BASE_URL}/vendor/bulk-upload-for-vendor-interest-rate-zbc-json`,
  bulkUploadInterestRateVBC: `${BASE_URL}/vendor/bulk-upload-for-vendor-interest-rate-vbc-json`,

  //COSTING API
  createZBCCosting: `${BASE_URL}/costing/create-zbc-costing`,
  createVBCCosting: `${BASE_URL}/costing/create-vbc-costing`,
  getZBCExistingCosting: `${BASE_URL}/costing/get-zbc-exist-costings-list`,
  getVBCExistingCosting: `${BASE_URL}/costing/get-vbc-exist-costings-list`,
  getZBCDetailByPlantId: `${BASE_URL}/costing/get-zbc-plant-by-id`,
  getVBCDetailByVendorId: `${BASE_URL}/costing/get-vbc-vendor-by-id`,
  updateZBCSOBDetail: `${BASE_URL}/costing/bulk-update-zbc-sob-detail`,
  updateVBCSOBDetail: `${BASE_URL}/costing/bulk-update-vbc-sob-detail`,
  getZBCCostingByCostingId: `${BASE_URL}/costing/get-zbc-costing-detail-by-id`,
  getVBCCostingByCostingId: `${BASE_URL}/costing/get-vbc-costing-detail-by-id`,
  deleteDraftCosting: `${BASE_URL}/costing/delete-draft-costing`,
  //getRMCCTabData: `${BASE_URL}/costing/get-zbc-costing-rm-bop-cc-detail-for-tab-grid`,

  getRMCCTabData: `${BASE_URL}/costing/get-costing-detail-for-rm-bop-cc`,
  getRMDrawerDataList: `${BASE_URL}/costing/get-zbc-costing-raw-materials-detail`,
  getRMDrawerVBCDataList: `${BASE_URL}/costing/get-vbc-costing-raw-materials-detail`,
  getBOPDrawerDataList: `${BASE_URL}/costing/get-zbc-costing-bop-detail`,
  getBOPDrawerVBCDataList: `${BASE_URL}/costing/get-vbc-costing-bop-detail`,
  getOperationDrawerDataList: `${BASE_URL}/costing/get-zbc-costing-cc-operation-detail`,
  getOperationDrawerVBCDataList: `${BASE_URL}/costing/get-vbc-costing-cc-operation-detail`,
  getProcessDrawerDataList: `${BASE_URL}/costing/get-zbc-costing-cc-machine-detail`,
  getProcessDrawerVBCDataList: `${BASE_URL}/costing/get-vbc-costing-cc-machine-detail`,
  saveCostingRMCCTab: `${BASE_URL}/costing/save-costing-detail-for-rm-bop-cc`,
  saveComponentCostingRMCCTab: `${BASE_URL}/costing/save-componenet-costing-detail-for-rm-bop-cc`,
  saveAssemblyCostingRMCCTab: `${BASE_URL}/costing/save-assembly-costing-detail-for-rm-bop-cc`,
  getBOPData: `${BASE_URL}/costing/get-costing-detail-for-assembly-part-bop`,
  getToolCategoryList: `${BASE_URL}/costing/select-list-tool-category`,

  getSurfaceTreatmentTabData: `${BASE_URL}/costing/get-costing-detail-for-surface-treatment`,
  saveCostingSurfaceTreatmentTab: `${BASE_URL}/costing/save-costing-detail-for-surface-treatment`,
  saveComponentCostingSurfaceTab: `${BASE_URL}/costing/save-componenet-costing-detail-for-surface-treatment`,
  getSurfaceTreatmentDrawerDataList: `${BASE_URL}/costing/get-zbc-costing-surface-treatment-operation-list`,
  getSurfaceTreatmentDrawerVBCDataList: `${BASE_URL}/costing/get-vbc-costing-surface-treatment-operation-list`,

  getOverheadProfitTabData: `${BASE_URL}/costing/get-costing-detail-for-overhead-and-profit`,
  getOverheadProfitDataByModelType: `${BASE_URL}/costing/get-zbc-costing-overhead-profit-details`,
  saveCostingOverheadProfitTab: `${BASE_URL}/costing/save-costing-detail-for-overhead-and-profit`,
  saveComponentOverheadProfitTab: `${BASE_URL}/costing/save-componenet-costing-detail-for-overhead-and-profit`,
  saveAssemblyOverheadProfitTab: `${BASE_URL}/costing/save-assembly-costing-detail-for-overhead-and-profit`,
  getInventoryDataByHeads: `${BASE_URL}/costing/get-zbc-costing-interest-rate-icc-applicability`,
  getPaymentTermsDataByHeads: `${BASE_URL}/costing/get-zbc-costing-interest-rate-payment-term-applicability`,
  getICCAppliSelectListKeyValue: `${BASE_URL}/costing/get-icc-applicability-list-keyvalue`,
  getPaymentTermsAppliSelectListKeyValue: `${BASE_URL}/costing/get-payment-terms-applicability-list-keyvalue`,

  getPackageFreightTabData: `${BASE_URL}/costing/get-costing-detail-for-freight-and-packaging`,
  saveCostingPackageFreightTab: `${BASE_URL}/costing/save-costing-detail-for-freight-and-packaging`,

  getToolTabData: `${BASE_URL}/costing/get-costing-detail-for-tools-cost`,
  saveToolTab: `${BASE_URL}/costing/save-costing-detail-for-tool-cost`,
  getToolsProcessWiseDataListByCostingID: `${BASE_URL}/costing/get-tools-cost-process-wise-list-by-costing`,

  getDiscountOtherCostTabData: `${BASE_URL}/costing/get-costing-detail-for-other-cost`,
  saveDiscountOtherCostTab: `${BASE_URL}/costing/save-costing-detail-for-other-cost`,
  getExchangeRateByCurrency: `${BASE_URL}/costing/get-costing-exchange-rate-by-currency`,

  fileUploadCosting: `${BASE_URL}/costing/costing-file-upload`,
  fileDeleteCosting: `${BASE_URL}/costing/delete-costing-attachment-file`,

  getRateCriteriaByCapacitySelectList: `${BASE_URL}/costing/get-rate-criteria-by-capacity-select-list`,
  getRateByCapacityCriteria: `${BASE_URL}/costing/get-rate-by-capacity-criteria`,

  getCostingPartDetails: `${BASE_URL}/costing/get-costing-part-details`,
  getExistingSupplierDetailByPartId: `${BASE_URL}/costing-sheet-metal/get-existing-suppliers-details-by-part`,
  createPartWithSupplier: `${BASE_URL}/costing-sheet-metal/add-part-with-supplier`,
  createNewCosting: `${BASE_URL}/costing-sheet-metal/create`,
  getCostingDetailsById: `${BASE_URL}/costing-sheet-metal/get-costing-details-by-id`,
  getZBCCostingSelectListByPart: `${BASE_URL}/costing-sheet-metal/get-costing-select-list-by-part`,
  getCostingTechnologySelectList: `${BASE_URL}/costing/get-technology-select-list`,
  getAllPartSelectList: `${BASE_URL}/costing/get-part-select-list`,
  getPartInfo: `${BASE_URL}/masters-part/get-part-info`,
  checkPartWithTechnology: `${BASE_URL}/costing/check-part-with-technology`,
  getCostingDetailsByCostingId: `${BASE_URL}/costing/get-view-costing`,
  getCostingSummaryByplantIdPartNo: `${BASE_URL}/costing/get-costings-list-for-summary-by-part-and-plant`,
  saveCostingCopy: `${BASE_URL}/costing/copy-costing`,
  getCostingByVendorVendorPlant: `${BASE_URL}/costing/get-vendor-costing-by-vendor-and-plant-select-list`,
  getPartByTechnologyId: `${BASE_URL}/costing/get-part-select-list-by-technology`,

  //WEIGHT CALCULATION
  getWeightCalculationInfo: `${BASE_URL}/costing-sheet-metal/get-weight-calculation-info-by-costing`,
  AddCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/add-costing-weight-calculation`,
  UpdateCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/update-costing-weight-calculation`,
  getRawMaterialCalculationByTechnology: `${BASE_URL}/costing/get-raw-material-calculation-by-technology`,
  saveRawMaterialCalciData: `${BASE_URL}/costing/save-raw-material-calculation-by-technology`,

  // PROCESS COST CALCULATION
  getProcessCalculation: `${BASE_URL}/costing/get-process-calculation-by-technology`,
  saveProcessCostCalculation: `${BASE_URL}/costing/save-process-calculation-by-technology`,

  //COST WORKING API
  getCostingBySupplier: `${BASE_URL}/costing-sheet-metal/get-costings-by-supplier`,
  getRawMaterialListBySupplierId: `${BASE_URL}/costing-sheet-metal/get-raw-material-by-supplier`,
  addCostingRawMaterial: `${BASE_URL}/costing-sheet-metal/add-costing-raw-material`,
  updateCostingRawMatrial: `${BASE_URL}/costing-sheet-metal/update-costing-raw-material`,
  getBoughtOutPartList: `${BASE_URL}/costing-sheet-metal/get-bought-out-part-by-supplier`,
  getBoughtOutPartListBySupplierAndPlant: `${BASE_URL}/costing-sheet-metal/get-bought-out-part-by-supplier-and-plant`,
  addCostingBoughtOutPart: `${BASE_URL}/costing-sheet-metal/add-costing-bought-out-part`,
  getOtherOperationList: `${BASE_URL}/costing-sheet-metal/get-other-operation-by-supplier`,
  addCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/add-costing-other-operations`,
  getCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/get-costing-other-operations`,
  getMHRCostingList: `${BASE_URL}/costing-sheet-metal/get-machine-hour-rate-by-supplier`,
  addCostingProcesses: `${BASE_URL}/costing-sheet-metal/add-costing-process`,
  getCostingProcesses: `${BASE_URL}/costing-sheet-metal/get-costing-process`,
  getCostingBOP: `${BASE_URL}/costing-sheet-metal/get-costing-bought-out-parts`,
  getProcessesSelectList: `${BASE_URL}/configuration/select-list-get-process`,
  saveProcessCosting: `${BASE_URL}/costing-sheet-metal/save-costing-process`,
  getOtherOpsSelectList: `${BASE_URL}/configuration/select-list-get-operation`,
  saveOtherOpsCosting: `${BASE_URL}/costing-sheet-metal/save-costing-other-operations`,
  getMaterialTypeSelectList: `${BASE_URL}/configuration/select-list-get-material-type`,
  updateCostingOtherOperation: `${BASE_URL}/costing-sheet-metal/update-costing-other-operation`,
  saveCostingAsDraft: `${BASE_URL}/costing-sheet-metal/save-costing-details-as-draft`,
  getCostingOverHeadProByModelType: `${BASE_URL}/costing-sheet-metal/get-costing-overhead-profit-by-model-type`,
  saveCosting: `${BASE_URL}/costing-sheet-metal/save-costing`,
  saveBOPCosting: `${BASE_URL}/costing-sheet-metal/save-costing-bought-out-part`,
  getCostingBulkUploadList: `${BASE_URL}/bulk-costing/get-all-bulk-costings-files-info-by-filter`,
  getErrorFile: `${BASE_URL}`,
  uploadCosting: `${BASE_URL}/bulk-costing/save-costing`,
  uploadPlasticCosting: `${BASE_URL}/bulk-costing/save-costing-plastic`,
  sendStatusForApproval: `${BASE_URL}/bulk-costing/update-bulk-costing`,


  //COST SUMMARY
  getCostingByCostingId: `${BASE_URL}/costing-sheet-metal/get-costing-by-id`,
  getCostSummaryOtherOperationList: `${BASE_URL}/costing-sheet-metal/get-other-operation-by-supplier`,
  fetchFreightHeadsAPI: `${BASE_URL}/configuration/get-freight-heads`,
  getCostingFreight: `${BASE_URL}/costing-sheet-metal/get-costing-freight`,
  copyCostingAPI: `${BASE_URL}/costing/copy-costing`,
  getPartCostingPlantSelectList: `${BASE_URL}/costing/get-part-costing-plant-select-list`,
  getPartCostingVendorSelectList: `${BASE_URL}/costing/get-part-costing-vendor-select-list`,


  //LOGIN API
  login: `${BASE_URL}/user/login`,
  tokenAPI: `${BASE_URL}/token`,
  AutoSignin: `${BASE_URL}/user/external-login`,
  logout: `${BASE_URL}/user/logout`,
  register: `${BASE_URL}/user/register`,
  getLoginPageInit: `${BASE_URL}/user/page-init`,

  //USERS API
  getUserSelectList: `${BASE_URL}/configuration/select-list-get-user`,
  getAllUserDataAPI: `${BASE_URL}/user/get-all`,
  getUserDataAPI: `${BASE_URL}/user/get-by-id`,
  deleteUserAPI: `${BASE_URL}/user/delete`,
  activeInactiveUser: `${BASE_URL}/user/active-inactive-user`,
  updateUserAPI: `${BASE_URL}/user/update`,
  setUserTechnologyLevelForCosting: `${BASE_URL}/user-level/assign-user-technology-levels-for-costing`,
  getUserTechnologyLevelForCosting: `${BASE_URL}/user-level/get-user-technology-levels`,
  updateUserTechnologyLevelForCosting: `${BASE_URL}/user-level/update-user-technology-levels`,
  getSelectListOfLevel: `${BASE_URL}/configuration/select-list-get-level`,
  getUserByTechnologyAndLevel: `${BASE_URL}/user/get-users-technology-wise-level`,
  getLevelByTechnology: `${BASE_URL}/configuration/select-list-get-level-by-technology`,

  //ROLES API
  addRoleAPI: `${BASE_URL}/user-role/create-new`,
  getAllRoleAPI: `${BASE_URL}/user-role/get-all`,
  getRoleAPI: `${BASE_URL}/user-role/get-new`,
  updateRoleAPI: `${BASE_URL}/user-role/update-new`,
  deleteRoleAPI: `${BASE_URL}/user-role/delete`,
  rolesSelectList: `${BASE_URL}/configuration/select-list-get-roles`,

  //DEPARTMENT'S API
  addDepartmentAPI: `${BASE_URL}/user-department/create`,
  getAllDepartmentAPI: `${BASE_URL}/user-department/get-all`,
  getDepartmentAPI: `${BASE_URL}/user-department/get`,
  updateDepartmentAPI: `${BASE_URL}/user-department/update`,
  deleteDepartmentAPI: `${BASE_URL}/user-department/delete`,
  addCompanyAPI: `${BASE_URL}/company/create`,

  //LEVEL'S API
  assignUserLevelAPI: `${BASE_URL}/user-level/assign-user-level-for-costing`,
  addUserLevelAPI: `${BASE_URL}/user-level/create`,
  getAllLevelAPI: `${BASE_URL}/user-level/get-all`,
  getUserLevelAPI: `${BASE_URL}/user-level/get`,
  updateUserLevelAPI: `${BASE_URL}/user-level/update`,
  deleteUserLevelAPI: `${BASE_URL}/user-level/delete`,

  //SET LEVEL FOR TECHNOLOGY
  setApprovalLevelForTechnology: `${BASE_URL}/costing-old/approval-level-for-technology/create`,
  getLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/get`,
  getAllLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/get-all`,
  updateLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/update`,

  //Common API for Plant by supplier
  getPlantBySupplier: `${BASE_URL}/configuration/get-plant-by-vendor`,
  getPlantByCity: `${BASE_URL}/configuration/get-plant-by-city`,
  getCityBySupplier: `${BASE_URL}/configuration/get-city-by-vendor`,
  getPlantByCityAndSupplier: `${BASE_URL}/configuration/get-plant-by-vendor-and-city`,

  //APPROVAL
  getSendForApproval: `${BASE_URL}/app-approval-system/send-for-approval-click`,
  getAllApprovalDepartment: `${BASE_URL}/app-approval-system/get-all-approval-department`,
  getAllApprovalUserByDepartment: `${BASE_URL}/app-approval-system/get-all-approval-users-by-department`,
  getAllApprovalUserFilterByDepartment: `${BASE_URL}/app-approval-system/get-all-approval-users-level-filter-by-department`,
  sendForApproval: `${BASE_URL}/app-approval-system/send-for-approval`,
  sendForApprovalBySender: `${BASE_URL}/app-approval-system/send-to-approver-by-sender`,
  approvalProcess: `${BASE_URL}/app-approval-system/approval-process`,
  finalApprovalProcess: `${BASE_URL}/app-approval-system/final-approval-process`,
  reassignCosting: `${BASE_URL}/app-approval-system/reassign-send-for-approval-click`,
  cancelCosting: `${BASE_URL}/app-approval-system/cancel-for-approval-click`,
  getReasonSelectList: `${BASE_URL}/configuration/select-list-get-reasons`,
  getApprovalList: `${BASE_URL}/app-approval-system/get-costing-approvals-by-filter`,
  approveCostingByApprover: `${BASE_URL}/app-approval-system/approved-costing-by-approver`,
  rejectCostingByApprover: `${BASE_URL}/app-approval-system/rejected-costing-by-approver`,
  getApprovalSummaryByApprovalNo: `${BASE_URL}/app-approval-system/get-approval-costing-summary`,
  isFinalApprover: `${BASE_URL}/app-approval-system/is-this-user-final-approver`,
  approvalPushed: `${BASE_URL}/app-approval-system/approval-pushed`,
  getSelectedCostingStatusList: `${BASE_URL}/app-approval-system/get-all-approval-status`,
  createRawMaterialSAP: `${BASE_URL}/sap-sync/create-raw-material-sap`,
  approvalPushedOnSap: `${BASE_URL}/app-approval-system/approval-pushed-on-sap`,

  //PRIVILEGE
  createPrivilegePage: `${BASE_URL}/app-privilege-permission/create-privilege-page`,
  moduleSelectList: `${BASE_URL}/app-privilege-permission/get-module-select-list`,
  getPageSelectListByModule: `${BASE_URL}/app-privilege-permission/get-page-select-list-by-module`,
  getPageSelectList: `${BASE_URL}/app-privilege-permission/get-page-select-list`,
  setPagePermissionRoleWise: `${BASE_URL}/app-privilege-permission/set-page-permission-role-wise`,
  setPagePermissionUserWise: `${BASE_URL}/app-privilege-permission/set-page-permission-user-wise`,
  setUserAdditionalPermission: `${BASE_URL}/app-privilege-permission/set-user-additional-permissions`,
  getRolePermissionByUser: `${BASE_URL}/app-privilege-permission/get-role-permissions-by-user`,
  getPermissionByUser: `${BASE_URL}/app-privilege-permission/get-permissions-by-user`,
  revertDefaultPermission: `${BASE_URL}/app-privilege-permission/reset-default-permissions-by-user`,
  getActionHeadsSelectList: `${BASE_URL}/app-privilege-permission/get-action-heads-list`,
  getMenuByUser: `${BASE_URL}/app-privilege-permission/get-user-menu-by-user`,
  getModuleActionInit: `${BASE_URL}/user-role/get-module-action-init`,
  getModuleActionInitNew: `${BASE_URL}/user-role/get-module-page-action-init_new`,
  getLeftMenu: `${BASE_URL}/app-privilege-permission/get-left-menu-module-by-user-and-module-click`,
  checkPageAuthorization: `${BASE_URL}/app-privilege-permission/check-authorization-for-access-page-url`,
  getModuleIdByPathName: `${BASE_URL}/app-privilege-permission/get-module-by-page-url`,



  //REASON
  createReason: `${BASE_URL}/masters-reason/create`,
  getAllReasonAPI: `${BASE_URL}/masters-reason/get-all`,
  getReasonAPI: `${BASE_URL}/masters-reason/get`,
  updateReasonAPI: `${BASE_URL}/masters-reason/update`,
  deleteReasonAPI: `${BASE_URL}/masters-reason/delete`,
  activeInactiveReasonStatus: `${BASE_URL}/masters-reason/active`,

  //MHR
  getMHRComboDataAPI: `${BASE_URL}/configuration-master/get-machine-hour-rate-combo-select-list`,
  createMHRMasterAPI: `${BASE_URL}/masters-machine-hour-rate/create`,
  getMHRList: `${BASE_URL}/masters-machine-hour-rate/get-all`,
  getMHRDataAPI: `${BASE_URL}/masters-machine-hour-rate/get`,
  updateMHRAPI: `${BASE_URL}/masters-machine-hour-rate/update`,
  deleteMHRAPI: `${BASE_URL}/masters-machine-hour-rate/delete`,
  getLabourDetailsSelectListByMachine: `${BASE_URL}/masters-labour/get-labour-details`,
  getSupplierType: `${BASE_URL}/configuration/radio-button-list-get-costing-supplier-type`,

  //MACHINE TYPE
  createMachineType: `${BASE_URL}/masters-machine/create-machine-type`,
  getMachineTypeSelectList: `${BASE_URL}/masters-machine/get-machine-type-select-list`,
  getMachineTypeListAPI: `${BASE_URL}/masters-machine/get-all-machine-type`,
  getMachineTypeDataAPI: `${BASE_URL}/masters-machine/get-machine-type`,
  updateMachineTypeAPI: `${BASE_URL}/masters-machine/update-machine-type`,
  deleteMachineTypeAPI: `${BASE_URL}/masters-machine/delete-machine-type`,
  getMachineSelectListByMachineType: `${BASE_URL}/configuration/select-list-get-machine`,
  getDepreciationTypeSelectList: `${BASE_URL}/configuration/select-list-get-depreciation-type`, //Used in Depreciation master
  getDepreciationSelectList: `${BASE_URL}/configuration/select-list-get-depreciation`,
  getShiftTypeSelectList: `${BASE_URL}/configuration/select-list-get-shifts`,

  //MACHINE & PROCESS
  createMachine: `${BASE_URL}/masters-machine/create-machine`,
  copyMachine: `${BASE_URL}/masters-machine/copy-machine`,
  getMachineDataList: `${BASE_URL}/masters-machine/get-machine-list-by-filter`,
  deleteMachine: `${BASE_URL}/masters-machine/delete-machine`,
  getMachineData: `${BASE_URL}/masters-machine/get-machine`,
  updateMachine: `${BASE_URL}/masters-machine/update-machine`,
  getMachineSelectList: `${BASE_URL}/configuration/select-list-get-machine`,
  fileUploadMachine: `${BASE_URL}/masters-machine/machines-file-upload`,
  fileDeleteMachine: `${BASE_URL}/masters-machine/delete-machine-attachment-file`,
  checkAndGetMachineNumber: `${BASE_URL}/masters-machine/check-machine-number-is-unique`,
  getFuelUnitCost: `${BASE_URL}/masters-machine/get-fuel-unit-cost`,
  getLabourCost: `${BASE_URL}/masters-machine/get-labour-cost`,
  getPowerCostUnit: `${BASE_URL}/masters-machine/get-zbc-power-cost`,

  createMachineDetails: `${BASE_URL}/masters-machine/create-machine-details`,
  updateMachineDetails: `${BASE_URL}/masters-machine/update-machine-Details`,
  getMachineDetailsData: `${BASE_URL}/masters-machine/get-machine-details`,

  bulkUploadMachineZBC: `${BASE_URL}/masters-machine/bulk-upload-for-machine-zbc-json`,
  bulkUploadMachineVBC: `${BASE_URL}/masters-machine/bulk-upload-for-machine-vbc-json`,
  bulkUploadMachineMoreZBC: `${BASE_URL}/masters-machine/bulk-upload-for-machine-zbc-details-json`,

  createProcess: `${BASE_URL}/masters-machine/create-process`,
  getProcessCode: `${BASE_URL}/masters-machine/generate-process-code`,
  deleteProcess: `${BASE_URL}/masters-machine/delete-process`,
  getProcessData: `${BASE_URL}/masters-machine/get-process`,
  getProcessDataList: `${BASE_URL}/masters-machine/get-all-process-by-filter`,
  updateProcess: `${BASE_URL}/masters-machine/update-process`,
  getMachineSelectListByPlant: `${BASE_URL}/masters-machine/get-machine-select-list-by-plant`,
  getPlantSelectListByMachine: `${BASE_URL}/masters-machine/get-plant-select-list-by-machine`,

  getMachineTypeSelectListByPlant: `${BASE_URL}/masters-machine/get-machine-type-select-list-by-plant-id`,
  getVendorSelectListByTechnology: `${BASE_URL}/masters-machine/get-vendor-select-list-by-technology`,
  getMachineTypeSelectListByTechnology: `${BASE_URL}/masters-machine/get-machine-type-select-list-by-technology`,
  getMachineTypeSelectListByVendor: `${BASE_URL}/masters-machine/get-machine-type-select-list-by-vendor`,
  getProcessSelectListByMachineType: `${BASE_URL}/masters-machine/get-process-select-list-by-machine-type`,

  //POWER MASTER
  getPowerTypeSelectList: `${BASE_URL}/configuration/select-list-get-power-type`,
  getChargeTypeSelectList: `${BASE_URL}/configuration/select-list-get-power-charges-type`,
  getPowerSupplierTypeSelectList: `${BASE_URL}/configuration/select-list-get-power-supplier-type`,
  getUOMSelectList: `${BASE_URL}/configuration/select-list-get-unit-of-measurement`,
  createPowerAPI: `${BASE_URL}/masters-power/create`,
  getPowerDataListAPI: `${BASE_URL}/masters-power/get-all`,
  deletePowerAPI: `${BASE_URL}/masters-power/delete`,
  getPowerDataAPI: `${BASE_URL}/masters-power/get`,
  updatePowerAPI: `${BASE_URL}/masters-power/update`,

  //MASS UPLOAD
  supplierMassUpload: `${BASE_URL}/supplier/mass-upload-supplier`,
  plantMassUpload: `${BASE_URL}/masters-plant/mass-upload-plant`,
  BOPMassUpload: `${BASE_URL}/masters-bought-out-part/mass-upload-bought-out-part`,
  ProcessesMassUpload: `${BASE_URL}/masters-process/mass-upload-process`,
  MachineClassMassUpload: `${BASE_URL}/masters-machine/mass-upload-machine-type`,
  LabourMassUpload: `${BASE_URL}/masters-labour/mass-upload-labour`,
  OperationMassUpload: `${BASE_URL}/masters-other-operation/mass-upload-operation`,
  OtherOperationMassUpload: `${BASE_URL}/masters-other-operation/mass-upload-other-operation`,
  PowerMassUpload: `${BASE_URL}/masters-power/mass-upload-power`,
  OverheadAndProfitMassUpload: `${BASE_URL}/masters-overhead-and-profit/mass-upload-overhead-profit`,
  MHRMassUpload: `${BASE_URL}/masters-machine-hour-rate/mass-upload-machine-hour-rate`,

  //EXCHANGE RATE
  getCurrencySelectList: `${BASE_URL}/masters-exchange-rate/select-list-get-currency`,

  //VOLUME MASTER
  createVolume: `${BASE_URL}/masters-volume/create-volume`,
  updateVolume: `${BASE_URL}/masters-volume/update`,
  getVolumeData: `${BASE_URL}/masters-volume/get-volume-by-id`,
  getVolumeDataList: `${BASE_URL}/masters-volume/get-all-volume-by-filter`,
  deleteVolume: `${BASE_URL}/masters-volume/delete-volume`,
  getFinancialYearSelectList: `${BASE_URL}/masters-volume/get-select-list-for-financial-year`,
  bulkUploadVolumeActualZBC: `${BASE_URL}/masters-volume/bulk-upload-for-actual-volume-zbc-json`,
  bulkUploadVolumeActualVBC: `${BASE_URL}/masters-volume/bulk-upload-for-actual-volume-vbc-json`,
  bulkUploadVolumeBudgetedZBC: `${BASE_URL}/masters-volume/bulk-upload-for-budgeted-volume-zbc-json`,
  bulkUploadVolumeBudgetedVBC: `${BASE_URL}/masters-volume/bulk-upload-for-budgeted-volume-vbc-json`,

  //CLIENT MASTER
  createClient: `${BASE_URL}/client/create-client`,
  updateClient: `${BASE_URL}/client/update-client`,
  getClientData: `${BASE_URL}/client/get-client-detail-by-id`,
  getClientDataList: `${BASE_URL}/client/get-all-client`,
  deleteClient: `${BASE_URL}/client/delete`,
  getClientSelectList: `${BASE_URL}/client/select-list-client`,

  //EXCHANGE RATE MASTER
  createExchangeRate: `${BASE_URL}/masters-exchange-rate/create`,
  getExchangeRateDataList: `${BASE_URL}/masters-exchange-rate/get-all-exchange-rate`,
  getExchangeRateData: `${BASE_URL}/masters-exchange-rate/get-exchange-rate-by-id`,
  deleteExchangeRate: `${BASE_URL}/masters-exchange-rate/delete-exchange-rate`,
  updateExchangeRate: `${BASE_URL}/masters-exchange-rate/update-exchange-rate`,

  //TAX DETAILS MASTER
  createTaxDetails: `${BASE_URL}/masters-tax-details/create`,
  getTaxDetailsDataList: `${BASE_URL}/masters-tax-details/get-all`,
  getTaxDetailsData: `${BASE_URL}/masters-tax-details/get`,
  deleteTaxDetails: `${BASE_URL}/masters-tax-details/delete`,
  updateTaxDetails: `${BASE_URL}/masters-tax-details/update`,

  //COMPANY
  getComapanySelectList: `${BASE_URL}/company/get-company-select-list`,
  updateCompany: `${BASE_URL}/company/update`,

  //SIMULATION
  getSimulationHistory: `${BASE_URL}/`,
  getSelectListOfSimulationMaster: `${BASE_URL}/`,
  runSimulation: `${BASE_URL}/simulation/draft-simulation-raw-material`,
  getVerifySimulationList: `${BASE_URL}/simulation/get-all-impacted-simulation-costings`,
  runSimulationOnSelectedCosting: `${BASE_URL}/simulation/run-simulation-on-selected-costing`,
  getCostingSimulationList: `${BASE_URL}/simulation/get-all-simulated-costings`,

  //REPORT
  getReportListing: `${BASE_URL}/report/get-report-listing`,

}

//Api constants
export const API_REQUEST = 'API_REQUEST'
export const API_FAILURE = 'API_FAILURE'
export const API_SUCCESS = 'API_SUCCESS'

export const CUSTOM_LOADER_SHOW = 'CUSTOM_LOADER_SHOW'
export const CUSTOM_LOADER_HIDE = 'CUSTOM_LOADER_HIDE'

// Masters api constant
export const FETCH_MATER_DATA_REQUEST = 'FETCH_MATER_DATA_REQUEST'
export const FETCH_MATER_DATA_FAILURE = 'FETCH_MATER_DATA_FAILURE'
export const GET_COUNTRY_SUCCESS = 'GET_COUNTRY_SUCCESS'
export const GET_STATE_SUCCESS = 'GET_STATE_SUCCESS'
export const GET_CITY_SUCCESS = 'GET_CITY_SUCCESS'
export const GET_PLANT_SUCCESS = 'GET_PLANT_SUCCESS'
export const GET_SUPPLIER_SUCCESS = 'GET_SUPPLIER_SUCCESS'
export const GET_SUPPLIER_DATALIST_SUCCESS = 'GET_SUPPLIER_DATALIST_SUCCESS'
export const GET_SUPPLIER_CITY_SUCCESS = 'GET_SUPPLIER_CITY_SUCCESS'
export const GET_TECHNOLOGY_SUCCESS = 'GET_TECHNOLOGY_SUCCESS'
export const GET_SUPPLIER_SELECTLIST_SUCCESS = 'GET_SUPPLIER_SELECTLIST_SUCCESS'
export const GET_TECHNOLOGY_SELECTLIST_SUCCESS = 'GET_TECHNOLOGY_SELECTLIST_SUCCESS'
export const GET_PLANT_SELECTLIST_SUCCESS = 'GET_PLANT_SELECTLIST_SUCCESS'
export const GET_PLANT_SELECTLIST_BY_TYPE = 'GET_PLANT_SELECTLIST_BY_TYPE'
export const GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST = 'GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST'

//CATEGORY MASTER
export const GET_CATEGORY_SUCCESS = 'GET_CATEGORY_SUCCESS'
export const GET_CATEGORY_TYPE_DATA_SUCCESS = 'GET_CATEGORY_TYPE_DATA_SUCCESS'
export const GET_CATEGORY_TYPE_SUCCESS = ' GET_CATEGORY_TYPE_SUCCESS'
export const GET_TECHNOLOGY_LIST_SUCCESS = 'GET_TECHNOLOGY_LIST_SUCCESS'
export const GET_CATEGORY_MASTER_DATA_SUCCESS = 'GET_CATEGORY_MASTER_DATA_SUCCESS'

//LABOUR
export const GET_LABOUR_TYPE_SUCCESS = 'GET_LABOUR_TYPE_SUCCESS'
export const GET_COSTING_HEAD_SUCCESS = 'GET_COSTING_HEAD_SUCCESS'
export const GET_MODEL_TYPE_SUCCESS = 'GET_MODEL_TYPE_SUCCESS'
export const GET_LABOUR_TYPE_SELECTLIST_SUCCESS = 'GET_LABOUR_TYPE_SELECTLIST_SUCCESS'

//UOM MASTER
export const GET_UOM_DATA_SUCCESS = 'GET_UOM_DATA_SUCCESS'
export const GET_UOM_DATA_FAILURE = 'GET_UOM_DATA_FAILURE'
export const GET_UOM_SUCCESS = 'GET_UOM_SUCCESS'
export const UNIT_OF_MEASUREMENT_API_FAILURE = 'UNIT_OF_MEASUREMENT_API_FAILURE'
export const GET_UNIT_TYPE_SELECTLIST_SUCCESS = 'GET_UNIT_TYPE_SELECTLIST_SUCCESS'

//PART MASTER
export const CREATE_PART_REQUEST = 'CREATE_PART_REQUEST'
export const CREATE_PART_FAILURE = 'CREATE_PART_FAILURE'
export const CREATE_PART_SUCCESS = 'CREATE_PART_SUCCESS'
export const GET_ALL_PARTS_SUCCESS = 'GET_ALL_PARTS_SUCCESS'
export const GET_PART_SUCCESS = 'GET_PART_SUCCESS'
export const GET_UNIT_PART_DATA_SUCCESS = 'GET_UNIT_PART_DATA_SUCCESS'
export const GET_ALL_PARTS_FAILURE = 'GET_ALL_PARTS_FAILURE'
export const GET_MATERIAL_TYPE_SUCCESS = 'GET_MATERIAL_TYPE_SUCCESS'
export const GET_DRAWER_CHILD_PART_DATA = 'GET_DRAWER_CHILD_PART_DATA'
export const SET_ACTUAL_BOM_DATA = 'SET_ACTUAL_BOM_DATA'

//ASSEMBLY PART
export const GET_ASSEMBLY_PART_SELECTLIST = 'GET_ASSEMBLY_PART_SELECTLIST'
export const GET_COMPONENT_PART_SELECTLIST = 'GET_COMPONENT_PART_SELECTLIST'
export const GET_BOUGHTOUT_PART_SELECTLIST = 'GET_BOUGHTOUT_PART_SELECTLIST'

//NEW PART MASTER
export const GET_ALL_NEW_PARTS_SUCCESS = 'GET_ALL_NEW_PARTS_SUCCESS'
export const GET_PART_SELECTLIST_SUCCESS = 'GET_PART_SELECTLIST_SUCCESS'

//for category master
export const CREATE_CATEGORY_TYPE_SUCCESS = 'CREATE_CATEGORY_TYPE_SUCCESS'
export const CREATE_CATEGORY_TYPE_FAILURE = 'CREATE_CATEGORY_TYPE_FAILURE'
export const CREATE_CATEGORY_FAILURE = 'CREATE_CATEGORY_FAILURE'
export const CREATE_CATEGORY_SUCCESS = 'CREATE_CATEGORY_SUCCESS'
export const FETCH_CATEGORY_DATA_FAILURE = 'FETCH_CATEGORY_DATA_FAILURE'
export const GET_CATEGORY_DATA_SUCCESS = 'GET_CATEGORY_DATA_SUCCESS'
export const GET_DATA_FAILURE = 'GET_DATA_FAILURE'
export const GET_CATEGORY_LIST_SUCCESS = 'GET_CATEGORY_LIST_SUCCESS'
export const GET_CATEGORY_TYPE_LIST_SUCCESS = 'GET_CATEGORY_TYPE_SUCCESS'

//RAW MATERIAL
export const CREATE_MATERIAL_SUCCESS = ' CREATE_MATERIAL_SUCCESS'
export const CREATE_MATERIAL_FAILURE = 'CREATE_MATERIAL_FAILURE'
export const GET_RAW_MATERIAL_SUCCESS = 'GET_RAW_MATERIAL_SUCCESS'
export const GET_RAW_MATERIAL_DATA_SUCCESS = 'GET_RAW_MATERIAL_DATA_SUCCESS'
export const GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS = 'GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS'
export const GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS = 'GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS'
export const GET_RM_TYPE_DATALIST_SUCCESS = 'GET_RM_TYPE_DATALIST_SUCCESS'
export const GET_RM_NAME_SELECTLIST = 'GET_RM_NAME_SELECTLIST'
export const GET_GRADELIST_BY_RM_NAME_SELECTLIST = 'GET_GRADELIST_BY_RM_NAME_SELECTLIST'
export const GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST = 'GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST'
export const GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA = 'GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA'
export const GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST = 'GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST'
export const GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST = 'GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST'
export const GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST = 'GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST'
export const GET_VENDOR_FILTER_BY_GRADE_SELECTLIST = 'GET_VENDOR_FILTER_BY_GRADE_SELECTLIST'
export const GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST = 'GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST'
export const GET_GRADE_FILTER_BY_VENDOR_SELECTLIST = 'GET_GRADE_FILTER_BY_VENDOR_SELECTLIST'
export const GET_RM_DOMESTIC_LIST = 'GET_RM_DOMESTIC_LIST'
export const GET_RM_IMPORT_LIST = 'GET_RM_IMPORT_LIST'
export const GET_MANAGE_SPECIFICATION = 'GET_MANAGE_SPECIFICATION'
// export const GET_MANAGE_MATERIAL = 'GET_MANAGE_MATERIAL'
export const GET_UNASSOCIATED_RM_NAME_SELECTLIST = 'GET_UNASSOCIATED_RM_NAME_SELECTLIST'

//RM GRADE
export const GET_GRADE_SUCCESS = 'GET_GRADE_SUCCESS'
export const GET_GRADE_DATA_SUCCESS = 'GET_GRADE_DATA_SUCCESS'
export const GET_RM_GRADE_LIST_SUCCESS = 'GET_RM_GRADE_LIST_SUCCESS'

//RM SPECIFICATION
export const GET_RM_SPECIFICATION_LIST_SUCCESS = 'GET_RM_SPECIFICATION_LIST_SUCCESS'
export const GET_SPECIFICATION_DATA_SUCCESS = 'GET_SPECIFICATION_DATA_SUCCESS'
export const GET_RMTYPE_SELECTLIST_SUCCESS = 'GET_RMTYPE_SELECTLIST_SUCCESS'
export const GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS = 'GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS'
export const GET_GRADE_SELECTLIST_BY_RAWMATERIAL = 'GET_GRADE_SELECTLIST_BY_RAWMATERIAL'
export const GET_GRADE_SELECTLIST_SUCCESS = 'GET_GRADE_SELECTLIST_SUCCESS'

export const GET_RM_LIST_SUCCESS = 'GET_RM_LIST_SUCCESS'
export const GET_RM_CATEGORY_LIST_SUCCESS = 'GET_RM_CATEGORY_LIST_SUCCESS'
export const GET_MATERIAL_LIST_SUCCESS = 'GET_MATERIAL_LIST_SUCCESS'
export const GET_MATERIAL_LIST_TYPE_SUCCESS = 'GET_MATERIAL_LIST_TYPE_SUCCESS'
export const RAWMATERIAL_ADDED_FOR_COSTING = 'RAWMATERIAL_ADDED_FOR_COSTING'
export const GET_MATERIAL_TYPE_DATA_SUCCESS = 'GET_MATERIAL_TYPE_DATA_SUCCESS'

//PLANT MASTER
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS'
export const GET_PLANT_UNIT_SUCCESS = 'GET_PLANT_UNIT_SUCCESS'
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE'
export const GET_PLANT_FAILURE = 'GET_PLANT_FAILURE'
export const GET_PLANT_DATA_SUCCESS = 'GET_PLANT_DATA_SUCCESS'
export const GET_PLANT_FILTER_LIST = 'GET_PLANT_FILTER_LIST'

//SUPPLIER MASTER
export const CREATE_SUPPLIER_SUCCESS = 'CREATE_SUPPLIER_SUCCESS'
export const CREATE_SUPPLIER_FAILURE = 'CREATE_SUPPLIER_FAILURE'
export const GET_SUPPLIER_FAILURE = 'GET_SUPPLIER_FAILURE'
export const GET_SUPPLIER_DATA_SUCCESS = 'GET_SUPPLIER_DATA_SUCCESS'
export const GET_RADIO_SUPPLIER_TYPE_SUCCESS = 'GET_RADIO_SUPPLIER_TYPE_SUCCESS'
export const GET_VENDOR_TYPE_SELECTLIST_SUCCESS = 'GET_VENDOR_TYPE_SELECTLIST_SUCCESS'
export const GET_ALL_VENDOR_SELECTLIST_SUCCESS = 'GET_ALL_VENDOR_SELECTLIST_SUCCESS'
export const GET_VENDOR_TYPE_SELECTLIST_BY_VENDOR = 'GET_VENDOR_TYPE_SELECTLIST_BY_VENDOR'
export const GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST = 'GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST'
export const GET_VENDOR_TYPE_BOP_SELECTLIST = 'GET_VENDOR_TYPE_BOP_SELECTLIST'

//BOM MASTER
export const CREATE_BOM_SUCCESS = 'CREATE_BOM_SUCCESS'
export const CREATE_BOM_FAILURE = 'CREATE_BOM_FAILURE'
export const GET_BOM_SUCCESS = 'GET_BOM_SUCCESS'
export const GET_BOM_FAILURE = 'GET_BOM_FAILURE'
export const UPLOAD_BOM_XLS_SUCCESS = 'UPLOAD_BOM_XLS_SUCCESS'
export const GET_BOM_UNIT_DATA_BY_PART_SUCCESS = 'GET_BOM_UNIT_DATA_BY_PART_SUCCESS'
export const GET_ASSEMBLY_PART_DATALIST_SUCCESS = 'GET_ASSEMBLY_PART_DATALIST_SUCCESS'
export const GET_ASSEMBLY_PART_DATA_SUCCESS = 'GET_ASSEMBLY_PART_DATA_SUCCESS'

//BOP MASTER
export const CREATE_BOP_SUCCESS = 'CREATE_BOP_SUCCESS';
export const CREATE_BOP_FAILURE = 'CREATE_BOP_FAILURE';
export const GET_BOP_SUCCESS = 'GET_BOP_SUCCESS';
export const GET_BOP_DOMESTIC_DATA_SUCCESS = 'GET_BOP_DOMESTIC_DATA_SUCCESS';
export const GET_BOP_IMPORT_DATA_SUCCESS = 'GET_BOP_IMPORT_DATA_SUCCESS';
export const GET_BOP_FAILURE = 'GET_BOP_FAILURE';
export const UPDATE_BOP_SUCCESS = 'UPDATE_BOP_SUCCESS';
export const GET_BOP_CATEGORY_SELECTLIST_SUCCESS = 'GET_BOP_CATEGORY_SELECTLIST_SUCCESS';
export const GET_PLANT_SELECTLIST_BY_VENDOR = 'GET_PLANT_SELECTLIST_BY_VENDOR';
export const GET_BOP_SOB_VENDOR_DATA_SUCCESS = 'GET_BOP_SOB_VENDOR_DATA_SUCCESS';
export const GET_INITIAL_SOB_VENDORS_SUCCESS = 'GET_INITIAL_SOB_VENDORS_SUCCESS';
export const GET_BOP_DOMESTIC_DATA_LIST = 'GET_BOP_DOMESTIC_DATA_LIST'
export const GET_BOP_IMPORT_DATA_LIST = 'GET_BOP_IMPORT_DATA_LIST'
export const GET_SOB_LISTING = 'GET_SOB_LISTING'

//PROCESS MASTER
export const CREATE_PROCESS_SUCCESS = 'CREATE_PROCESS_SUCCESS'
export const CREATE_PROCESS_FAILURE = 'CREATE_PROCESS_FAILURE'
export const GET_PROCESS_LIST_SUCCESS = 'GET_PROCESS_LIST_SUCCESS'
export const GET_PROCESS_LIST_FAILURE = 'GET_PROCESS_LIST_FAILURE'
export const GET_PROCESS_UNIT_DATA_SUCCESS = 'GET_PROCESS_UNIT_DATA_SUCCESS'
export const GET_PROCESS_DATA_SUCCESS = 'GET_PROCESS_DATA_SUCCESS'
export const GET_INITIAL_PLANT_SELECTLIST_SUCCESS = 'GET_INITIAL_PLANT_SELECTLIST_SUCCESS'
//export const GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST = 'GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST';
export const GET_INITIAL_MACHINE_TYPE_SELECTLIST = 'GET_INITIAL_MACHINE_TYPE_SELECTLIST'
export const GET_INITIAL_MACHINE_LIST_SUCCESS = 'GET_INITIAL_MACHINE_LIST_SUCCESS'
export const GET_INITIAL_PROCESSES_LIST_SUCCESS = 'GET_INITIAL_PROCESSES_LIST_SUCCESS'
export const GET_MACHINE_LIST_BY_PLANT = 'GET_MACHINE_LIST_BY_PLANT'
export const GET_PLANT_LIST_BY_MACHINE = 'GET_PLANT_LIST_BY_MACHINE'

export const GET_MACHINE_TYPE_LIST_BY_PLANT = 'GET_MACHINE_TYPE_LIST_BY_PLANT'
export const GET_VENDOR_LIST_BY_TECHNOLOGY = 'GET_VENDOR_LIST_BY_TECHNOLOGY'
export const GET_MACHINE_TYPE_LIST_BY_TECHNOLOGY = 'GET_MACHINE_TYPE_LIST_BY_TECHNOLOGY'
export const GET_MACHINE_TYPE_LIST_BY_VENDOR = 'GET_MACHINE_TYPE_LIST_BY_VENDOR'
export const GET_PROCESS_LIST_BY_MACHINE_TYPE = 'GET_PROCESS_LIST_BY_MACHINE_TYPE'

//FUEL MASTER
export const CREATE_FUEL_SUCCESS = 'CREATE_FUEL_SUCCESS'
export const CREATE_FUEL_FAILURE = 'CREATE_FUEL_FAILURE'
export const GET_FUEL_SUCCESS = 'GET_FUEL_SUCCESS'
export const GET_FUEL_DATALIST_SUCCESS = 'GET_FUEL_DATALIST_SUCCESS'
export const GET_FUEL_DATA_SUCCESS = 'GET_FUEL_DATA_SUCCESS'
export const GET_FUEL_FAILURE = 'GET_FUEL_FAILURE'
export const GET_FUEL_UNIT_DATA_SUCCESS = 'GET_FUEL_UNIT_DATA_SUCCESS'
export const CREATE_FUEL_DETAIL_FAILURE = 'CREATE_FUEL_DETAIL_FAILURE'
export const CREATE_FUEL_DETAIL_SUCCESS = 'CREATE_FUEL_DETAIL_SUCCESS'
export const GET_FUEL_DETAIL_SUCCESS = 'GET_FUEL_DETAIL_SUCCESS'
export const GET_FUEL__DETAIL_DATA_SUCCESS = 'GET_FUEL_DETAIL_DATA_SUCCESS'
export const GET_FULE_COMBO_SUCCESS = 'GET_FULE_COMBO_SUCCESS'
export const GET_STATELIST_BY_FUEL = 'GET_STATELIST_BY_FUEL'
export const GET_FULELIST_BY_STATE = 'GET_FULELIST_BY_STATE'
export const GET_PLANT_SELECTLIST_BY_STATE = 'GET_PLANT_SELECTLIST_BY_STATE'
export const GET_ZBC_PLANT_SELECTLIST = 'GET_ZBC_PLANT_SELECTLIST'
export const GET_STATE_SELECTLIST = 'GET_STATE_SELECTLIST'
export const GET_ZBC_POWER_DATA_SUCCESS = 'GET_ZBC_POWER_DATA_SUCCESS'
export const GET_POWER_DATA_LIST = 'GET_POWER_DATA_LIST'
export const GET_POWER_VENDOR_DATA_LIST = 'GET_POWER_VENDOR_DATA_LIST'

//OTHER OPERATION MASTER
export const GET_OTHER_OPERATION_SUCCESS = 'GET_OTHER_OPERATION_SUCCESS'
export const GET_UNIT_OTHER_OPERATION_DATA_SUCCESS = 'GET_UNIT_OTHER_OPERATION_DATA_SUCCESS'
export const GET_OTHER_OPERATION_FAILURE = 'GET_OTHER_OPERATION_FAILURE'
export const CREATE_OTHER_OPERATION_REQUEST = 'CREATE_OTHER_OPERATION_REQUEST'
export const CREATE_OTHER_OPERATION_FAILURE = 'CREATE_OTHER_OPERATION_FAILURE'
export const CREATE_OTHER_OPERATION_SUCCESS = 'CREATE_OTHER_OPERATION_SUCCESS'
export const GET_OTHER_OPERATION_FORMDATA_SUCCESS = 'GET_OTHER_OPERATION_FORMDATA_SUCCESS'
export const GET_OTHER_OPERATION_FORMDATA_FAILURE = 'GET_OTHER_OPERATION_FORMDATA_FAILURE'
export const GET_OPERATION_DATA_LIST = 'GET_OPERATION_DATA_LIST'

//CED OTHER OPERATION
export const GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS = 'GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS'
export const GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE = 'GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE'
export const GET_CED_OTHER_OPERATION_SUCCESS = 'GET_CED_OTHER_OPERATION_SUCCESS'
export const GET_CED_OTHER_OPERATION_DATA_SUCCESS = 'GET_CED_OTHER_OPERATION_DATA_SUCCESS'
export const GET_CED_OTHER_OPERATION_FAILURE = 'GET_CED_OTHER_OPERATION_FAILURE'
export const GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS = 'GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS'

//COMMON
export const DATA_FAILURE = 'DATA_FAILURE'
export const CREATE_SUCCESS = 'CREATE_SUCCESS'
export const CREATE_FAILURE = 'CREATE_FAILURE'
export const GET_PLANTS_BY_CITY = 'GET_PLANTS_BY_CITY'
export const GET_CITY_BY_SUPPLIER = 'GET_CITY_BY_SUPPLIER'
export const GET_PLANTS_BY_SUPPLIER_AND_CITY = 'GET_PLANTS_BY_SUPPLIER_AND_CITY'
export const GET_SOURCE_PLANTS_BY_SOURCE_CITY = 'GET_SOURCE_PLANTS_BY_SOURCE_CITY'
export const GET_DESTINATION_PLANTS_BY_DESTINATION_CITY = 'GET_DESTINATION_PLANTS_BY_DESTINATION_CITY'

//OPERATION
export const GET_OPERATION_SUCCESS = 'GET_OPERATION_SUCCESS'
export const GET_UNIT_OPERATION_DATA_SUCCESS = 'GET_UNIT_OPERATION_DATA_SUCCESS'
export const GET_OPERATION_SELECTLIST_SUCCESS = 'GET_OPERATION_SELECTLIST_SUCCESS'
export const GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST = 'GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST'
export const GET_INITIAL_TECHNOLOGY_SELECTLIST = 'GET_INITIAL_TECHNOLOGY_SELECTLIST'

//FREIGHT MASTER
export const CREATE_FREIGHT_SUCCESS = 'CREATE_FREIGHT_SUCCESS'
export const CREATE_FREIGHT_FAILURE = 'CREATE_FREIGHT_FAILURE'
export const GET_FREIGHT_SUCCESS = 'GET_FREIGHT_SUCCESS'
export const GET_FREIGHT_DATA_SUCCESS = 'GET_FREIGHT_DATA_SUCCESS'
export const GET_FREIGHT_FAILURE = 'GET_FREIGHT_FAILURE'
export const GET_FREIGHT_MODE_SELECTLIST = 'GET_FREIGHT_MODE_SELECTLIST'
export const GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST = 'GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST'
export const GET_FREIGHT_RATE_CRITERIA_SELECTLIST = 'GET_FREIGHT_RATE_CRITERIA_SELECTLIST'

//ADDITIONAL FREIGHT MASTER
export const GET_ALL_ADDITIONAL_FREIGHT_SUCCESS = 'GET_ALL_ADDITIONAL_FREIGHT_SUCCESS'
export const GET_ADDITIONAL_FREIGHT_DATA_SUCCESS = 'GET_ADDITIONAL_FREIGHT_DATA_SUCCESS'
export const GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS = 'GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS'

//LABOUR MASTER
export const CREATE_LABOUR_SUCCESS = 'CREATE_LABOUR_SUCCESS'
export const CREATE_LABOUR_FAILURE = 'CREATE_LABOUR_FAILURE'
export const GET_LABOUR_SUCCESS = 'GET_LABOUR_SUCCESS'
export const GET_LABOUR_FAILURE = 'GET_LABOUR_FAILURE'
export const GET_LABOUR_DATA_SUCCESS = 'GET_LABOUR_DATA_SUCCESS'
export const LABOUR_TYPE_VENDOR_SELECTLIST = 'LABOUR_TYPE_VENDOR_SELECTLIST'
export const GET_LABOUR_TYPE_BY_PLANT_SELECTLIST = 'GET_LABOUR_TYPE_BY_PLANT_SELECTLIST'
export const GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST = 'GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST'
export const GET_LABOUR_DATA_LIST = 'GET_LABOUR_DATA_LIST'

//OVERHEAD AND PROFIT
export const GET_OVERHEAD_PROFIT_SUCCESS = 'GET_OVERHEAD_PROFIT_SUCCESS'
export const GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS'
export const GET_OVERHEAD_PROFIT_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_DATA_SUCCESS'
export const GET_MODEL_TYPE_SELECTLIST = 'GET_MODEL_TYPE_SELECTLIST'
export const GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST = 'GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST'
export const GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST = 'GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST'
export const GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST = 'GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST'

//DEPRECIATION
export const CREATE_DEPRICIATION_SUCCESS = 'CREATE_LABOUR_SUCCESS'
export const GET_DEPRICIATION_SUCCESS = 'GET_LABOUR_SUCCESS'
export const GET_DEPRECIATION_DATA_SUCCESS = 'GET_DEPRECIATION_DATA_SUCCESS'

//INTEREST RATE
export const GET_INTEREST_RATE_SUCCESS = 'GET_INTEREST_RATE_SUCCESS'
export const GET_INTEREST_RATE_COMBO_DATA_SUCCESS = 'GET_INTEREST_RATE_COMBO_DATA_SUCCESS'
export const GET_INTEREST_RATE_DATA_SUCCESS = 'GET_INTEREST_RATE_DATA_SUCCESS'
export const GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST = 'GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST'
export const GET_ICC_APPLICABILITY_SELECTLIST = 'GET_ICC_APPLICABILITY_SELECTLIST'

//COSTING
export const GET_COSTING_TECHNOLOGY_SELECTLIST = 'GET_COSTING_TECHNOLOGY_SELECTLIST';
export const GET_COSTING_PART_SELECTLIST = 'GET_COSTING_PART_SELECTLIST';
export const GET_PART_INFO = 'GET_PART_INFO';
export const GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS = 'GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS';
export const CREATE_PART_WITH_SUPPLIER_SUCCESS = 'CREATE_PART_WITH_SUPPLIER_SUCCESS';
export const CREATE_SHEETMETAL_COSTING_SUCCESS = 'CREATE_SHEETMETAL_COSTING_SUCCESS';
export const GET_COSTING_DATA_SUCCESS = 'GET_COSTING_DATA_SUCCESS';
export const GET_FREIGHT_HEAD_SUCCESS = 'GET_FREIGHT_HEAD_SUCCESS';
export const GET_FREIGHT_AMOUNT_DATA_SUCCESS = 'GET_FREIGHT_AMOUNT_DATA_SUCCESS';
export const EMPTY_COSTING_DATA = 'EMPTY_COSTING_DATA';
export const GET_ZBC_COSTING_SELECTLIST_BY_PART = 'GET_ZBC_COSTING_SELECTLIST_BY_PART';
export const ADD_BOP_GRID_COSTING_SUCCESS = 'ADD_BOP_GRID_COSTING_SUCCESS';
export const SAVE_BOP_COSTING_SUCCESS = 'SAVE_BOP_COSTING_SUCCESS';
export const GET_COSTING_DATA_BY_COSTINGID = 'GET_COSTING_DATA_BY_COSTINGID';
export const GET_RATE_CRITERIA_BY_CAPACITY = 'GET_RATE_CRITERIA_BY_CAPACITY';
export const SET_COSTING_DATALIST_BY_COSTINGID = 'SET_COSTING_DATALIST_BY_COSTINGID';
export const SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID = 'SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID';
export const SET_PO_PRICE = 'SET_PO_PRICE';
export const SET_RMCCBOP_DATA = 'SET_RMCCBOP_DATA';
export const SET_SURFACE_COST_DATA = 'SET_SURFACE_COST_DATA';
export const SET_OVERHEAD_PROFIT_COST_DATA = 'SET_OVERHEAD_PROFIT_COST_DATA';
export const SET_DISCOUNT_COST_DATA = 'SET_DISCOUNT_COST_DATA';
export const SET_IS_TOOLCOST_USED = 'SET_IS_TOOLCOST_USED';
export const GET_BULKUPLOAD_COSTING_LIST = 'GET_BULKUPLOAD_COSTING_LIST'
export const GET_PART_SELECTLIST_BY_TECHNOLOGY = 'GET_PART_SELECTLIST_BY_TECHNOLOGY'
export const BOP_DRAWER_LIST = 'BOP_DRAWER_LIST'

//WEIGHT CALCULATION COSTING

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
export const SET_RMCC_TAB_DATA = 'SET_RMCC_TAB_DATA';
export const GET_COSTING_DETAILS_BY_COSTING_ID = 'GET_COSTING_DETAILS_BY_COSTING_ID';
export const SET_COSTING_VIEW_DATA = 'SET_COSTING_VIEW_DATA';
export const SET_COSTING_APPROVAL_DATA = 'SET_COSTING_APPROVAL_DATA';
export const STORE_PART_VALUE = 'STORE_PART_VALUE';
export const GET_COST_SUMMARY_BY_PART_PLANT = 'GET_COST_SUMMARY_BY_PART_PLANT';
export const GET_COSTING_BY_VENDOR_VENDOR_PLANT = 'GET_COSTING_BY_VENDOR_VENDOR_PLANT';
export const GET_INTEREST_RATE_DATA_LIST = 'GET_INTEREST_RATE_DATA_LIST';
export const SET_ITEM_DATA = 'SET_ITEM_DATA';
export const SET_SURFACE_TAB_DATA = 'SET_SURFACE_TAB_DATA';
export const SET_OVERHEAD_PROFIT_TAB_DATA = 'SET_OVERHEAD_PROFIT_TAB_DATA';
export const SET_PACKAGE_AND_FREIGHT_TAB_DATA = 'SET_PACKAGE_AND_FREIGHT_TAB_DATA';
export const SET_TOOL_TAB_DATA = 'SET_TOOL_TAB_DATA';
export const SET_TOOL_PROCESS_WISE_DATALIST = 'SET_TOOL_PROCESS_WISE_DATALIST';
export const SET_OTHER_DISCOUNT_TAB_DATA = 'SET_OTHER_DISCOUNT_TAB_DATA';
export const SET_EXCHANGE_RATE_CURRENCY_DATA = 'SET_EXCHANGE_RATE_CURRENCY_DATA';
export const SET_COMPONENT_ITEM_DATA = 'SET_COMPONENT_ITEM_DATA';
export const SET_COMPONENT_OVERHEAD_ITEM_DATA = 'SET_COMPONENT_OVERHEAD_ITEM_DATA';
export const SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA = 'SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA';
export const SET_COMPONENT_TOOL_ITEM_DATA = 'SET_COMPONENT_TOOL_ITEM_DATA';
export const SET_COMPONENT_DISCOUNT_ITEM_DATA = 'SET_COMPONENT_DISCOUNT_ITEM_DATA';
export const GET_RM_DRAWER_DATA_LIST = 'GET_RM_DRAWER_DATA_LIST';
export const GET_PROCESS_DRAWER_DATA_LIST = 'GET_PROCESS_DRAWER_DATA_LIST';
export const SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA = 'SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA';
export const TOOL_CATEGORY_SELECTLIST = 'TOOL_CATEGORY_SELECTLIST';
export const SET_RMCC_ERRORS = 'SET_RMCC_ERRORS';
export const SET_COSTING_EFFECTIVE_DATE = 'SET_COSTING_EFFECTIVE_DATE';
export const CLOSE_OPEN_ACCORDION = 'CLOSE_OPEN_ACCORDION';
export const IS_COSTING_EFFECTIVE_DATE_DISABLED = 'IS_COSTING_EFFECTIVE_DATE_DISABLED';

//WEIGHT CALCULATION COSTING RM DRAWER
export const GET_RAW_MATERIAL_CALCI_INFO = 'GET_RAW_MATERIAL_CALCI_INFO'

//COSTING SUMMARY
export const GET_PART_COSTING_PLANT_SELECTLIST = 'GET_PART_COSTING_PLANT_SELECTLIST';
export const GET_PART_COSTING_VENDOR_SELECT_LIST = 'GET_PART_COSTING_VENDOR_SELECT_LIST'

//LOGIN
export const AUTH_API_FAILURE = 'AUTH_API_FAILURE'
export const AUTH_API_REQUEST = 'AUTH_API_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS'
export const LOGIN_PAGE_INIT_CONFIGURATION = 'LOGIN_PAGE_INIT_CONFIGURATION'

//USER
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS'
export const GET_USER_DATA_SUCCESS = 'GET_USER_DATA_SUCCESS'
export const GET_USER_UNIT_DATA_SUCCESS = 'GET_USER_UNIT_DATA_SUCCESS'
export const GET_USERS_BY_TECHNOLOGY_AND_LEVEL = 'GET_USERS_BY_TECHNOLOGY_AND_LEVEL'
export const GET_LEVEL_BY_TECHNOLOGY = 'GET_LEVEL_BY_TECHNOLOGY'

//ROLE
export const GET_ROLE_SUCCESS = 'GET_ROLE_SUCCESS'
export const GET_UNIT_ROLE_DATA_SUCCESS = 'GET_UNIT_ROLE_DATA_SUCCESS'
export const GET_ROLES_SELECTLIST_SUCCESS = 'GET_ROLES_SELECTLIST_SUCCESS'

//LEVEL USERS
export const GET_LEVEL_USER_SUCCESS = 'GET_LEVEL_USER_SUCCESS'
export const GET_UNIT_LEVEL_DATA_SUCCESS = 'GET_UNIT_LEVEL_DATA_SUCCESS'
export const LEVEL_MAPPING_API = 'LEVEL_MAPPING_API'

//DEPARTMENT
export const GET_DEPARTMENT_SUCCESS = 'GET_DEPARTMENT_SUCCESS'
export const GET_UNIT_DEPARTMENT_DATA_SUCCESS = 'GET_UNIT_DEPARTMENT_DATA_SUCCESS'
export const GET_TECHNOLOGY_DATA_LIST_SUCCESS = 'GET_TECHNOLOGY_DATA_LIST_SUCCESS'


//Common to get plants by supplier
export const GET_PLANTS_BY_SUPPLIER = 'GET_PLANTS_BY_SUPPLIER'

//APPROVAL
export const GET_SEND_FOR_APPROVAL_SUCCESS = 'GET_SEND_FOR_APPROVAL_SUCCESS'
export const GET_ALL_APPROVAL_DEPARTMENT = 'GET_ALL_APPROVAL_DEPARTMENT'
export const GET_ALL_APPROVAL_USERS_BY_DEPARTMENT = 'GET_ALL_APPROVAL_USERS_BY_DEPARTMENT'
export const GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT = 'GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT'
export const GET_ALL_REASON_SELECTLIST = 'GET_ALL_REASON_SELECTLIST'
export const GET_APPROVAL_LIST = 'GET_APPROVAL_LIST'
export const GET_APPROVAL_SUMMARY = 'GET_APPROVAL_SUMMARY'
export const GET_SELECTED_COSTING_STATUS = 'GET_SELECTED_COSTING_STATUS'

//PRIVILEGE
export const GET_MODULE_SELECTLIST_SUCCESS = 'GET_MODULE_SELECTLIST_SUCCESS'
export const GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS = 'GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS'
export const GET_PAGES_SELECTLIST_SUCCESS = 'GET_PAGES_SELECTLIST_SUCCESS'
export const GET_ACTION_HEAD_SELECTLIST_SUCCESS = 'GET_ACTION_HEAD_SELECTLIST_SUCCESS'
export const GET_MENU_BY_USER_DATA_SUCCESS = 'GET_MENU_BY_USER_DATA_SUCCESS'
export const GET_LEFT_MENU_BY_MODULE_ID_AND_USER = 'GET_LEFT_MENU_BY_MODULE_ID_AND_USER'
export const GET_MENU_BY_MODULE_ID_AND_USER = 'GET_MENU_BY_MODULE_ID_AND_USER'

//REASON
export const GET_REASON_DATA_SUCCESS = 'GET_REASON_DATA_SUCCESS'
export const GET_REASON_SUCCESS = 'GET_REASON_SUCCESS'

//MHR
export const GET_MHR_COMBO_DATA_SUCCESS = 'GET_MHR_COMBO_DATA_SUCCESS'
export const GET_MHR_COMBO_DATA_FAILURE = 'GET_MHR_COMBO_DATA_FAILURE'
export const GET_MHR_DATALIST_SUCCESS = 'GET_MHR_DATALIST_SUCCESS'
export const GET_MHR_DATA_SUCCESS = 'GET_MHR_DATA_SUCCESS'
export const GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS = 'GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS'
export const GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS = 'GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS'

//MACHINE TYPE
export const CREATE_MACHINE_TYPE_SUCCESS = 'CREATE_MACHINE_TYPE_SUCCESS'
export const GET_MACHINE_TYPE_DATALIST_SUCCESS = 'GET_MACHINE_TYPE_DATALIST_SUCCESS'
export const GET_MACHINE_TYPE_DATA_SUCCESS = 'GET_MACHINE_TYPE_DATA_SUCCESS'
export const GET_MACHINE_TYPE_SELECTLIST_SUCCESS = 'GET_MACHINE_TYPE_SELECTLIST_SUCCESS'
export const GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS = 'GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS'
export const GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS = 'GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS'
export const GET_SHIFT_TYPE_SELECTLIST_SUCCESS = 'GET_SHIFT_TYPE_SELECTLIST_SUCCESS'
export const GET_MACHINE_TYPE_SELECTLIST = 'GET_MACHINE_TYPE_SELECTLIST'

//MACHINE
export const GET_MACHINE_DATALIST_SUCCESS = 'GET_MACHINE_DATALIST_SUCCESS'
export const GET_MACHINE_DATA_SUCCESS = 'GET_MACHINE_DATA_SUCCESS'
export const GET_MACHINE_LIST_SUCCESS = 'GET_MACHINE_LIST_SUCCESS'
export const GET_DEPRECIATION_SELECTLIST_SUCCESS = 'GET_DEPRECIATION_SELECTLIST_SUCCESS'

//POWER MASTER
export const GET_POWER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_TYPE_SELECTLIST_SUCCESS'
export const GET_CHARGE_TYPE_SELECTLIST_SUCCESS = 'GET_CHARGE_TYPE_SELECTLIST_SUCCESS'
export const GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS'
export const GET_UOM_SELECTLIST_SUCCESS = 'GET_UOM_SELECTLIST_SUCCESS'
export const GET_POWER_DATALIST_SUCCESS = 'GET_POWER_DATALIST_SUCCESS'
export const GET_POWER_DATA_SUCCESS = 'GET_POWER_DATA_SUCCESS'
export const GET_UOM_SELECTLIST_BY_UNITTYPE = 'GET_UOM_SELECTLIST_BY_UNITTYPE'

//CURRENCY EXCHANGE
export const GET_CURRENCY_SELECTLIST_SUCCESS = 'GET_CURRENCY_SELECTLIST_SUCCESS'

//VOLUME MASTER
export const GET_VOLUME_DATA_SUCCESS = 'GET_VOLUME_DATA_SUCCESS'
export const GET_FINANCIAL_YEAR_SELECTLIST = 'GET_FINANCIAL_YEAR_SELECTLIST'
export const GET_VOLUME_DATA_BY_PART_AND_YEAR = 'GET_VOLUME_DATA_BY_PART_AND_YEAR'
export const GET_VOLUME_DATA_LIST = 'GET_VOLUME_DATA_LIST'

//CLIENT MASTER
export const GET_CLIENT_DATA_SUCCESS = 'GET_CLIENT_DATA_SUCCESS';
export const GET_CLIENT_SELECTLIST_SUCCESS = 'GET_CLIENT_SELECTLIST_SUCCESS';
export const GET_CLIENT_DATALIST_SUCCESS = 'GET_CLIENT_DATALIST_SUCCESS';

//EXCHANGE RATE MASTER
export const EXCHANGE_RATE_DATALIST = 'EXCHANGE_RATE_DATALIST'
export const GET_EXCHANGE_RATE_DATA = 'GET_EXCHANGE_RATE_DATA'
export const GET_CURRENCY_SELECTLIST_BY = 'GET_CURRENCY_SELECTLIST_BY'

//TAX DETAIL MASTER
export const GET_TAX_DETAILS_DATALIST = 'GET_TAX_DETAILS_DATALIST'
export const GET_TAX_DETAILS_DATA = 'GET_TAX_DETAILS_DATA'

//COMPANY
export const GET_COMPANY_SELECTLIST = 'GET_COMPANY_SELECTLIST'

//SIMULATION
export const GET_SIMULATION_HISTORY = 'GET_SIMULATION_HISTORY'
export const GET_SELECTLIST_MASTERS = 'GET_SELECTLIST_MASTERS'
export const GET_VERIFY_SIMULATION_LIST = 'GET_VERIFY_SIMULATION_LIST'
export const GET_COSTING_SIMULATION_LIST = 'GET_COSTING_SIMULATION_LIST'

// REPORT
export const GET_REPORT_LIST = 'GET_REPORT_LIST'


//COSTING STATUS
export const GET_COSTING_STATUS = 'GET_COSTING_STATUS'
export const DRAFT = 'Draft'
export const PENDING = 'PendingForApproval'
export const WAITING_FOR_APPROVAL = 'AwaitingApproval'
export const APPROVED = 'Approved'
export const REJECTED = 'Rejected'
export const HISTORY = 'History'
export const FINAL_APPROVAL = 'Final Approval'

//DECIMAL VALUES FOR PRICE
export const TWO_DECIMAL_PRICE = 2
export const FOUR_DECIMAL_PRICE = 4

//DECIMAL VALUES FOR WEIGHT
export const FIVE_DECIMAL_WEIGHT = 5

//LABOUR ENUMS
export const SKILLED = 'Skilled'
export const CONTRACT = 'Contract'
export const SEMI_SKILLED = 'Semi-Skilled'
export const UNSKILLED = 'Unskilled'

//POWER LIST ENUMS
export const SOLAR_POWER = 'Solar Power'
export const HYDRO_POWER = 'Hydro Power'
export const WIND_POWER = 'Wind Power'
export const GENERATOR_DIESEL = 'Generator Diesel'

//MODULE NAME ENUMS
export const DASHBOARD_AND_AUDIT = 'Dashboard'
export const MASTERS = 'Master'
export const ADDITIONAL_MASTERS = 'Additional Masters'
export const COSTING = 'Costing'
export const SIMULATION = 'Simulation'
export const REPORTS_AND_ANALYTICS = 'Reports And Analytics'
export const USERS = 'Users'
export const AUDIT = 'Audit'

//PAGE NAMES
export const DASHBOARD = 'Dashboard'

export const RAW_MATERIAL = 'Raw Material'
export const RAW_MATERIAL_NAME_AND_GRADE = 'Raw Material Name and Grade'
export const BOP = 'BOP'
export const PART = 'Part'
export const MACHINE = 'Machine'
export const VENDOR = 'Vendor'
export const CLIENT = 'Client'
export const PLANT = 'Plant'

export const OVERHEAD_AND_PROFIT = 'Overhead and Profits'
export const LABOUR = 'Labour'
export const REASON = 'Reason'
export const OPERATION = 'Operation'
export const FUEL_AND_POWER = 'Fuel and Power'
export const UOM = 'UOM'
export const VOLUME = 'Volume'
export const EXCHANGE_RATE = 'Exchange Rate'
export const FREIGHT = 'Freight'
export const INTEREST_RATE = 'Interest Rate'
export const Approval_Summary = 'Approval Summary'
export const Approval_Listing = 'Approval Listing'
export const CostingSummary_BulkUpload = 'Costing Summary BulkUpload'
export const Simulation_History = 'Simulation History'
export const Simulation_Page = "Simulation"
export const Simulation_Upload = 'Simulation Upload'

export const TAX = 'Tax'

export const SHEET_METAL = 'Sheet Metal';
export const PLASTIC = 'Plastic';
export const WIRING_HARNESS = 'Wiring Harness';
export const NON_FERROUS_GDC = 'Non Ferrous GDC';
export const PLATING = 'Plating';
export const SPRINGS = 'Springs';
export const HARDWARE = 'Hardware';
export const NON_FERROUS_LPDDC = 'Non Ferrous LPDC';
export const MACHINING = 'Machining';
export const ELECTRONICS = 'Electronics';
export const RIVET = 'Rivet';
export const NON_FERROUS_HPDC = 'Non Ferrous HPDC';
export const RUBBER = 'Rubber';

export const USER = 'User'
export const ROLE = 'Role'
export const DEPARTMENT = 'Department'
export const LEVELS = 'Levels'

//DEPRECIATION TYPE ENUMS
export const SLM = 'SLM'
export const WDM = 'WDM'

export const ZBC = 'ZBC'
export const VBC = 'VBC'

//PART TYPE'S USED AT ASSEMBLY CHILD DRAWER
export const ASSEMBLY = 'Assembly'
export const COMPONENT_PART = 'Component'
export const BOUGHTOUTPART = 'BoughtOutPart'

export const COSTING_PATH = '/costing'
export const COSTING_SUMMARY = '/costing-summary'
export const APPROVAL_SUMMARY_PATH = '/approval-summary'
export const APPROVAL_LISTING_PATH = '/approval-listing'
export const COSTING_BULK_UPLOAD = "/costing-bulkUpload"

export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"
export const EMPTY_GUID_0 = "0"

export const VIEW_COSTING_DATA = {
  zbc: 'ZBC v/s VBC',
  costingName: '',
  poPrice: 'PO Price',
  status: 'Status',
  rm: 'RM name-Grade',
  gWeight: 'Gross Weight',
  fWeight: 'Finish Weight',
  netRM: 'Net RM Cost',
  netBOP: 'Net BOP Cost',
  pCost: 'Process Cost',
  oCost: 'Operation Cost',
  sTreatment: 'Surface Treatment',
  tCost: 'Transportation Cost',
  nConvCost: 'Net Conversion Cost',
  modelType: 'Model Type For Overhead/Profit',
  aValue: '',
  overheadOn: 'Overhead On',
  profitOn: 'Profit On',
  rejectionOn: 'Rejection On',
  iccOn: 'ICC On',
  paymentTerms: 'Payment Terms',
  nOverheadProfit: 'Net Overhead Profits',
  packagingCost: 'Packaging Cost',
  freight: 'Freight',
  nPackagingAndFreight: 'Net Packaging and Freight',
  toolMaintenanceCost: 'Tool Maintenance Cost',
  toolPrice: 'Tool Price',
  amortizationQty: 'Amortization Quantity',
  totalToolCost: 'Total Tool Cost',
  totalCost: 'Total Cost',
  otherDiscount: 'Hundi/Other Discount',
  otherDiscountValue: '',
  anyOtherCost: 'Any Other Cost',
  remark: 'Remark',
  nPOPriceWithCurrency: 'Net PO Price(INR)',
  currency: 'Currency',
  nPOPrice: 'Net PO Price',
  attachment: 'Attachment',
  approvalButton: '',
}

//UOM ENUMS (Need to change name)
export const KG = "Kilogram"
export const HOUR = "Hours"
export const NO = "Number"
export const STROKE = "Stroke"
export const SHOTS = "SHOT"

// export const INR = "INR"

export const Fixed = 1;
export const Percentage = 2;
export const FullTruckLoad = 3;
export const PartTruckLoad = 4;
export const INR = "INR"
export const G = "Gram"
export const MG = "Milligram"

// UOM TYPE ENUM
export const MASS = 'Mass'
export const VOLUMETYPE = 'Volume'
export const PRESSURE = 'Pressure'
export const DIMENSION = 'Dimension'
export const TIME = 'Time'
export const POWER = 'Power'
export const DENSITY = 'Density'
export const AREA = 'Area'
export const DIMENSIONLESS = 'Dimensionless'

//UOM CATEGORY
export const STD = 'STD'


//SIMULATION MASTER NAME
export const RMDOMESTIC = 'Raw Material(Domestic)'
export const RMIMPORT = 'Raw Material(Import)'
export const BOPDOMESTIC = 'BOP (Domestic)'
export const BOPIMPORT = 'BOP (Import)'
export const PROCESS = 'Process'
export const OPERATIONSIM = 'Operation'
export const SURFACETREATMENT = 'SURFACE TREATMENT'
export const OVERHEAD = 'Overhead'
export const PROFIT = 'Profits'
// export constse

export const REASON_ID = 2