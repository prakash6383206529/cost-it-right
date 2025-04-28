/**
 * Define all the constants required in application inside this file and export them
 */

import _ from "lodash";
import { reactLocalStorage } from "reactjs-localstorage";
export const config = () => {

  let headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userDetail'))?.Token}`,
    'Access-From': 'WEB',
    'Api-Key': `${process.env.REACT_APP_API_KEY}`,
  }

  return { headers }
}

const BASE_URL = `${process.env.REACT_APP_BASE_URL}`;
 //const BASE_URL = `http://10.10.1.102:2002/api/v1`;



export const FILE_URL = `${process.env.REACT_APP_FILE_URL}`;


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
  getPlantSelectListByType: `${BASE_URL}/configuration/select-list-get-plants-by-type`,
  getVendorPlantSelectList: `${BASE_URL}/configuration/select-list-get-un-associated-vendor-plants`,
  getPartSelectLists: `${BASE_URL}/masters-part/select-list-component-part-for-convert-to-assembly`,


  //Part Active InActive
  ActiveInActivePartUser: `${BASE_URL}/masters-part/part-active`,

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
  getApprovalTypeSelectList: `${BASE_URL}/configuration/select-list-get-approval-type`,
  getApprovalModuleSelectList: `${BASE_URL}/configuration/select-approval-module-level`,

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


  ///INDEXATION
  getCommoditySelectList: `${BASE_URL}/masters-material/select-list-index-exchange`,
  getCommodityNameInIndexSelectList: `${BASE_URL}/masters-material/select-list-index-exchange-commodity-linking`,
  getCommodityCustomNameSelectList: `${BASE_URL}/masters-material/select-list-commodity-standard-name`,
  createCommodityStandardization: `${BASE_URL}/masters-material/create-commodity-standardization`,
  getCommodityStandardizationDataList: `${BASE_URL}/masters-material/get-all-material-type`,
  getCommodityIndexDataList: `${BASE_URL}/masters-material/get-index-exchange`,
  getCommodityInIndexDataList: `${BASE_URL}/masters-material/get-index-exchange-commodity-linking`,
  getStandardizedCommodityDataList: `${BASE_URL}/masters-material/get-commodity-standardization`,
  getIndexDataList: `${BASE_URL}/masters-material/get-commodity-index-rate-details`,
  deleteIndexData: `${BASE_URL}/masters-material/delete-index-exchange`,
  updateIndexData: `${BASE_URL}/masters-material/update-commodity-material-details`,
  createIndexData: `${BASE_URL}/masters-material/create-commodity-material-details`,
  bulkUploadIndexData: `${BASE_URL}/masters-material/bulk-upload-for-commodity-index-rate-details`,
  bulkUploadStandardizedCommodity: `${BASE_URL}/masters-material/bulk-upload-for-commodity-standardization`,
  updateCommodityStandardization: `${BASE_URL}/masters-material/update-commodity-standardization`,
  createCommodityCustomName: `${BASE_URL}/masters-material/create-commodity-standard-name`,
  bulkUploadIndex: `${BASE_URL}/masters-material/bulk-upload-for-index-exchange`,
  bulkUploadCommodityInIndex: `${BASE_URL}/masters-material/bulk-upload-for-index-exchange-commodity-linking`,
  deleteIndexCommodityLinking: `${BASE_URL}/masters-material/delete-index-exchange-commodity-linking`,
  createIndex: `${BASE_URL}/masters-material/create-index-exchange`,
  updateIndex: `${BASE_URL}/masters-material/update-index-exchange`,
  getCommodityStandardList: `${BASE_URL}/masters-material/get-commodity-standard`,
  bulkUploadCommodityStandard: `${BASE_URL}/masters-material/bulk-upload-for-commodity-standard`,
  deleteCommodityStandard: `${BASE_URL}/masters-material/delete-commodity-standard`,
  deleteCommodityStandardization: `${BASE_URL}/masters-material/delete-commodity-standardization`,
  deleteIndexDetailData: `${BASE_URL}/masters-material/delete-commodity-index-rate-details`,
  getAssociatedMaterial: `${BASE_URL}//masters-material/get-material-type`,
  getLastRevisionRawMaterialDetails: `${BASE_URL}/masters-raw-material/get-last-revision-raw-material-details`,
  getExchangeRateSource: `${BASE_URL}/masters-material/select-list-exchange-rate-source`,
  getFrequencySettlement: `${BASE_URL}/masters-material/select-list-frequency-of-settlement`,
  getCommodityIndexRateAverage: `${BASE_URL}/masters-material/get-commodity-index-rate-average`,
  getRawMaterialDataBySourceVendor: `${BASE_URL}/masters-raw-material/get-source-vendor-raw-material-by-id`,

  // INDEXATION SIMULATION
  getRMIndexationSimulationListing: `${BASE_URL}/simulation/get-raw-material-records-for-simulation`,
  editRMIndexedSimulationData: `${BASE_URL}/simulation/get-all-simulated-raw-material`,
  draftSimulationForRMMaster: `${BASE_URL}/simulation/draft-simulation-raw-material-master`,
  updateSimulationRawMaterial: `${BASE_URL}/simulation/update-simulation-raw-material`,
  runSimulationOnRawMaterial: `${BASE_URL}/simulation/run-simulation-on-raw-material-master`,
  getApprovalSimulatedRawMaterialSummary: `${BASE_URL}/app-simulation-approval-system/get-approval-simulated-raw-material-summary`,
  getRMIndexationCostingSimulationListing: `${BASE_URL}/simulation/get-impacted-raw-material-details`,
  calculateAndSaveRMIndexationSimulation: `${BASE_URL}/simulation/calculate-and-update-simulation-raw-material-master`,


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
  partComponentBulkUpload: `${BASE_URL}/masters-part/bulk-upload-for-component-part-json`,
  activeInactivePartStatus: `${BASE_URL}/masters-part/active-component-part`,
  checkStatusCodeAPI: `${BASE_URL}/masters-part/check-status-code`,
  productComponentBulkUpload: `${BASE_URL}/masters-product/bulk-upload-for-product-json`,
  checkRFQBulkUpload: `${BASE_URL}/rfq-quotation/check-valid-part-via-bulk-upload`,

  CreatComponentBySap: `${BASE_URL}/sap-sync/create-component-by-sap`,
  updateMultiplecomponentTechnology: `${BASE_URL}/masters-part/update-technology-for-multiple-component`,
  checkBoughtOutPartsRFQBulkUpload: `${BASE_URL}/rfq-quotation/save-quotation-bought-out-part-bulk-upload`,
  checkComponentOrAssemblyRFQBulkUpload: `${BASE_URL}/rfq-quotation/save-quotation-assembly-or-component-part-bulk-upload`,
  checkRawMaterialRFQBulkUpload: `${BASE_URL}/rfq-quotation/save-quotation-raw-material-bulk-upload`,
  // PRODUCT MASTER 
  getProductDataList: `${BASE_URL}/masters-product/get-all`,
  getProductById: `${BASE_URL}/masters-product/get-by-id`,
  createProduct: `${BASE_URL}/masters-product/create`,
  updateProduct: `${BASE_URL}/masters-product/update`,
  deleteProduct: `${BASE_URL}/masters-product/delete/productid/loggedinuserid`,
  // deleteProduct: `${BASE_URL}/masters-product/delete`, // MINDA
  productAttachment: `${BASE_URL}/masters-product/product-file-upload`,
  bulkUploadProduct: `${BASE_URL}/masters-product/bulk-upload-for-product-json`,
  productGroupSelectList: `${BASE_URL}/masters-product/select-list-get-product-group-code`,
  getPartDescription: `${BASE_URL}/masters-part/get-info-name-by-part-number-and-type`,
  createProductLevels: `${BASE_URL}/masters-product/create-product-hierarchies`,
  getAllProductLevels: `${BASE_URL}/masters-product/get-all-product-hierarchies`,
  createProductLevelValues: `${BASE_URL}/masters-product/create-product-hierarchy-value-details`,
  getPreFilledProductLevelValues: `${BASE_URL}/masters-product/get-product-hierarchy-value-details-by-id`,
  getProductLabel: `${BASE_URL}/masters-product/get-product-hierarchy-by-id`,
  updateProductLabel: `${BASE_URL}/masters-product/update-product-hierarchy`,

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
  convertPartToAssembly: `${BASE_URL}/masters-part/convert-part-to-assembly`,

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
  createMBOMAssemblyApi: `${BASE_URL}/masters-part/create-mbom-assembly`,

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
  createRM: `${BASE_URL}/masters-raw-material/create-raw-material`,
  getAllRMDataList: `${BASE_URL}/masters-raw-material/get-all-raw-material-list`,
  getRMDataById: `${BASE_URL}/masters-raw-material/get-raw-material-by-id`,
  updateRMAPI: `${BASE_URL}/masters-raw-material/update-raw-material`,
  //RAW MATERIAL DETAILS
  getRawMaterialDetailsDataAPI: `${BASE_URL}/masters-raw-material/get-all-costing-raw-material-details`,

  //RAW MATERIAL DOMESTIC
  deleteRawMaterialDetailAPI: `${BASE_URL}/masters-raw-material/delete-raw-material-details`,
  createRawMaterialNameChild: `${BASE_URL}/masters-raw-material/create-raw-material-name`,
  getRawMaterialNameChild: `${BASE_URL}/masters-raw-material/select-list-raw-material-name-child`,
  getGradeListByRawMaterialNameChild: `${BASE_URL}/masters-raw-material/select-list-raw-material-grade-child`,
  getVendorListByVendorType: `${BASE_URL}/masters-raw-material/select-list-for-raw-material-vendor-by-type`,
  getRMDataList: `${BASE_URL}/masters-raw-material/get-all-raw-material-list`,         // KEEP COMMENTED ON RE						//RE
  fileUploadRMDomestic: `${BASE_URL}/masters-raw-material/raw-material-file-upload`,
  fileUpdateRMDomestic: `${BASE_URL}/masters-raw-material/update-raw-material-file`,
  bulkUploadRM: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material`,
  bulkfileUploadRM: `${BASE_URL}/masters-raw-material/bulk-file-upload-raw-material`,
  getUnassociatedRawMaterial: `${BASE_URL}/masters-raw-material/select-list-raw-material-name-child`,

  //Master Approval 
  masterApprovalAPI: `${BASE_URL}/masters-approval/master-send-to-approver-by-sender`,

  //RM APPROVAL API'S
  getRMApprovalList: `${BASE_URL}/app-approval-system/get-master-approvals-by-filter`,
  getAllMasterApprovalDepartment: `${BASE_URL}/app-approval-system/get-all-master-approval-department`,
  getAllMasterApprovalUserByDepartment: `${BASE_URL}/app-approval-system/get-all-master-approval-users-level-filter-by-department`,
  masterSendToApprover: `${BASE_URL}/masters-approval/master-send-to-approver-by-sender`,
  approveOrRejectMasterByApprover: `${BASE_URL}/app-approval-system/approve-or-reject-master-by-approver`,
  getMasterApprovalSummaryByApprovalNo: `${BASE_URL}/app-approval-system/get-approval-master-summary`,
  masterFinalLeveluser: `${BASE_URL}/app-approval-system/is-this-user-final-master-approver`,

  //RAW MATERIAL DOMESTIC AND IMPORT FILTER API'S
  getRawMaterialFilterSelectList: `${BASE_URL}/masters-raw-material/get-raw-material-filter-select-list`,
  checkAndGetRawMaterialCode: `${BASE_URL}/masters-raw-material/check-raw-material-code-is-unique`,

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
  getGradeByRMTypeSelectListAPI: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-grade`,
  getRMGradeSelectListByRawMaterial: `${BASE_URL}/masters-raw-material/select-list-raw-material-grade`,
  bulkUploadRMSpecification: `${BASE_URL}/masters-raw-material/bulk-upload-for-raw-material-spec-json`,
  getRawMaterialChildById: `${BASE_URL}/masters-raw-material/get-raw-material-child-by-id`,
  updateRawMaterialChildName: `${BASE_URL}/masters-raw-material/update-raw-material-name`,
  getViewRawMaterialDetails: `${BASE_URL}/masters-raw-material/get-view-raw-material`,
  getViewBOPDetails: `${BASE_URL}/masters-bought-out-part/get-view-bought-out-part`,

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
  activeInactiveVendorStatus: `${BASE_URL}/vendor/active-vendor`,
  vendorBulkUpload: `${BASE_URL}/vendor/bulk-upload-for-vendor-json`,
  getReporterList: `${BASE_URL}/rfq-user/get-user-select-list`,
  getContactPerson: `${BASE_URL}/rfq-quotation/get-contact-person-by-vendor-selectlist`,
  getVendorNameByVendorSelectList: `${BASE_URL}/vendor/vendor-name-by-vendor-select-list`,
  getVendorPlantClassificationLpsratingForRFQ: `${BASE_URL}/vendor/check-vendor-plant-classification-lpsrating-for-rfq`,

  //BOP DOMESTIC
  createBOP: `${BASE_URL}/masters-bought-out-part/create-bought-out-part`,
  getBOPDomesticById: `${BASE_URL}/masters-bought-out-part/get-domestic-bought-out-part-by-id`,
  getBOPDataList: `${BASE_URL}/masters-bought-out-part/get-all-bought-out-part-by-filter`,
  updateBOP: `${BASE_URL}/masters-bought-out-part/update-bought-out-part`,
  deleteBOP: `${BASE_URL}/masters-bought-out-part/delete-bought-out-part`,
  fileUploadBOPDomestic: `${BASE_URL}/masters-bought-out-part/bought-out-part-file-upload`,
  bulkUploadBOP: `${BASE_URL}/masters-bought-out-part/bulk-upload-for-bought-out-part-json`,
  getPlantSelectListByVendor: `${BASE_URL}/masters-bought-out-part/get-select-list-plant-by-vendor`,
  checkAndGetBopPartNo: `${BASE_URL}/masters-bought-out-part/check-bought-out-part-number-is-unique`,

  //BOP IMPORT
  getBOPImportById: `${BASE_URL}/masters-bought-out-part/get-import-bought-out-part-by-id`,
  getManageBOPSOBDataList: `${BASE_URL}/masters-bought-out-part/get-bought-out-part-vendor-share-of-business-by-filter`,
  getManageBOPSOBById: `${BASE_URL}/masters-bought-out-part/get-bought-out-part-vendor-share-of-business-by-bop-part-number`,
  updateBOPSOBVendors: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-vendor-share-of-business`,
  getIncoTermSelectList: `${BASE_URL}/masters-bought-out-part/get-select-list-bought-out-part-inco-terms`,
  getPaymentTermSelectList: `${BASE_URL}/masters-bought-out-part/get-select-list-bought-out-part-payment-terms`,
  getViewBoughtOutPart: `${BASE_URL}/masters-bought-out-part/get-all-manage-bought-out-part`,


  //BOP APPROVAL API'S

  masterSendToApproverBop: `${BASE_URL}/masters-approval-Bought-Out-Part/master-send-to-approver-by-sender`,


  //BOP Category
  createBOPCategory: `${BASE_URL}/masters-bought-out-part/add-bought-out-part-category`,
  getBOPCategorySelectList: `${BASE_URL}/masters-bought-out-part/select-list-bought-out-part-category`,

  //PROCESS MASTER
  createProcessAPI: `${BASE_URL}/masters-process/create`,
  getProcessAPI: `${BASE_URL}/masters-process/get`,
  getAllProcessAPI: `${BASE_URL}/masters-process/get-all`,
  updateProcessAPI: `${BASE_URL}/masters-process/update`,
  deleteProcessAPI: `${BASE_URL}/masters-process/delete`,


  //MACHINE APPROVAL API'S

  masterSendToApproverMachine: `${BASE_URL}/masters-machine/master-send-to-approver-by-sender`,


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
  getFuelByPlant: `${BASE_URL}/masters-fuel/get-fuel-by-plant`,
  getFuelList: `${BASE_URL}/masters-fuel/get-fuel-list`,
  getStateListByFuel: `${BASE_URL}/masters-fuel/get-state-by-fuel-select-list`,
  getFuelListByState: `${BASE_URL}/masters-fuel/get-fuel-by-state-select-list`,
  fuelBulkUpload: `${BASE_URL}/masters-fuel/bulk-upload-for-fuel-json`,
  getUOMByFuelId: `${BASE_URL}/masters-fuel/get-uom-by-fuel-id`,

  //POWER MASTER
  createPowerDetail: `${BASE_URL}/masters-power/create-power-detail`,
  getPowerDetailData: `${BASE_URL}/masters-power/get-power-detail`,
  updatePowerDetail: `${BASE_URL}/masters-power/update-power-detail`,
  deletePowerDetail: `${BASE_URL}/masters-power/delete-power-detail`,
  getPowerDetailDataList: `${BASE_URL}/masters-power/get-all-power-details`,
  getPlantListByAddress: `${BASE_URL}/masters-fuel/get-plants-select-list-by-address-details`,
  getDieselRateByStateAndUOM: `${BASE_URL}/masters-fuel/get-fuel-rate-by-state-uom`,
  getZBCPlantList: `${BASE_URL}/masters-fuel/get-all-zbc-plant-select-list`,
  getStateSelectList: `${BASE_URL}/masters-fuel/get-all-state-select-list`,
  getPlantCurrencyByPlantIds: `${BASE_URL}/masters-plant/get-plants-currency`,

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
  fileUploadOperation: `${BASE_URL}/masters-operation/operation-file-upload`,
  checkAndGetOperationCode: `${BASE_URL}/masters-operation/check-operation-code-is-unique`,
  operationBulkUpload: `${BASE_URL}/masters-operation/bulk-upload-operation`,

  getOperationPartSelectList: `${BASE_URL}/masters-operation/get-operation-code-select-list`,

  //OPERATION APPROVAL API'S

  masterSendToApproverOperation: `${BASE_URL}/masters-approval-Operation/master-send-to-approver-by-sender`,

  //FREIGHT MASTER
  createFreight: `${BASE_URL}/masters-freight/create`,
  getFreightData: `${BASE_URL}/masters-freight/get`,
  getFreightDataList: `${BASE_URL}/masters-freight/get-all`,
  updateFright: `${BASE_URL}/masters-freight/update`,
  deleteFright: `${BASE_URL}/masters-freight/delete`,
  getFreightModeSelectList: `${BASE_URL}/configuration/select-list-get-freight-modes`,
  getFreigtFullTruckCapacitySelectList: `${BASE_URL}/configuration/select-list-get-full-truck-capacity`,
  getFreigtRateCriteriaSelectList: `${BASE_URL}/configuration/select-list-get-full-truck-ratecriteria`,
  getTruckDimensionsSelectList: `${BASE_URL}/masters-freight/select-list-dimensions`,
  saveTruckDimensions: `${BASE_URL}/masters-freight/create-dimensions`,
  getTruckDimensionsById: `${BASE_URL}/masters-freight/get-dimensionsId`,

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
  getLabourTypeByPlantSelectList: `${BASE_URL}/masters-labour/get-labour-type-by-plant-select-list`,
  labourBulkUpload: `${BASE_URL}/masters-labour/bulk-upload-for-labour-details-vbc-json`,
  getLabourTypeByMachineTypeSelectList: `${BASE_URL}/masters-labour/get-labour-type-by-machine-type-select-list`,
  getLabourTypeDetailsForMachineType: `${BASE_URL}/masters-labour/get-labour-type-details`,
  updateLabourTypeForMachineType: `${BASE_URL}/masters-labour/update-machine-type`,

  //OVERHEAD AND PROFIT API'S
  createOverhead: `${BASE_URL}/masters-overhead-and-profit/create-overhead`,
  updateOverhead: `${BASE_URL}/masters-overhead-and-profit/update-overhead`,
  getOverheadData: `${BASE_URL}/masters-overhead-and-profit/get`,
  getOverheadDataList: `${BASE_URL}/masters-overhead-and-profit/get-all-overhead-by-filter`,
  deleteOverhead: `${BASE_URL}/masters-overhead-and-profit/delete-overhead`,
  activeInactiveOverhead: `${BASE_URL}/masters-overhead-and-profit/active-inactive-overhead`,
  fileUploadOverHead: `${BASE_URL}/masters-overhead-and-profit/overhead-file-upload`,
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
  bulkUploadInterestRateCBC: `${BASE_URL}/vendor/bulk-upload-for-vendor-interest-rate-cbc-json`,


  //COSTING API
  createCosting: `${BASE_URL}/costing/create-costing`,
  getExistingCosting: `${BASE_URL}/costing/get-exist-costings-list`,
  getZBCDetailByPlantId: `${BASE_URL}/costing/get-zbc-plant-by-id`,
  getVBCDetailByVendorId: `${BASE_URL}/costing/get-vbc-vendor-by-id`,
  updateZBCSOBDetail: `${BASE_URL}/costing/bulk-update-zbc-sob-detail`,
  updateVBCSOBDetail: `${BASE_URL}/costing/bulk-update-vbc-sob-detail`,
  updateSOBDetail: `${BASE_URL}/costing/update-sob-details`,
  getBriefCostingById: `${BASE_URL}/costing/get-costing-detail-by-id`,
  getVBCCostingByCostingId: `${BASE_URL}/costing/get-vbc-costing-detail-by-id`,
  deleteDraftCosting: `${BASE_URL}/costing/delete-draft-costing`,
  getNCCCExistingCosting: `${BASE_URL}/costing/get-ncc-exist-costings-list`,
  createNCCCosting: `${BASE_URL}/costing/create-ncc-costing`,
  getMachineProcessGroupDetail: `${BASE_URL}/costing/get-costing-machine-process-group-detail`,
  getFgWiseImpactDataForCosting: `${BASE_URL}/costing/get-fgwise-impact-detail`,
  // getFgWiseImpactDataForCosting: `${BASE_URL}/sap-integration/get-fg-wise-impact-data-for-costing`,          						//RE
  saveCostingLabourDetails: `${BASE_URL}/costing/save-costing-labour-details`,
  getCostingLabourDetails: `${BASE_URL}/costing/get-costing-labour-details`,
  getLabourDetailsByFilter: `${BASE_URL}/masters-labour/get-all-by-filter`,
  checkPartNoExistInBop: `${BASE_URL}/masters-bought-out-part/check-part-number-exist-in-bought-out-parts-against-vendor`,
  getExternalIntegrationFgWiseImpactData: `${BASE_URL}/ExternalIntegration/get-fg-wise-impact-data`,

  getRMCCTabData: `${BASE_URL}/costing/get-costing-detail-for-rm-bop-cc`,
  getRMDrawerDataList: `${BASE_URL}/costing/get-costing-raw-materials-detail`,
  getBOPDrawerDataList: `${BASE_URL}/costing/get-costing-bop-detail`,
  getOperationDrawerDataList: `${BASE_URL}/costing/get-costing-cc-operation-detail`,
  getProcessDrawerDataList: `${BASE_URL}/costing/get-costing-cc-machine-detail`,
  saveCostingRMCCTab: `${BASE_URL}/costing/save-costing-detail-for-rm-bop-cc`,
  saveComponentCostingRMCCTab: `${BASE_URL}/costing/save-component-costing-detail-for-rm-bop-cc`,
  saveAssemblyCostingRMCCTab: `${BASE_URL}/costing/save-assembly-costing-detail-for-rm-bop-cc`,
  getBOPData: `${BASE_URL}/costing/get-costing-detail-for-assembly-part-bop`,
  getToolCategoryList: `${BASE_URL}/costing/select-list-tool-category`,

  getSurfaceTreatmentTabData: `${BASE_URL}/costing/get-costing-detail-for-surface-treatment`,
  saveCostingSurfaceTab: `${BASE_URL}/costing/save-costing-detail-for-surface-treatment`,
  getSurfaceTreatmentDrawerDataList: `${BASE_URL}/costing/get-costing-surface-treatment-operation-list`,
  getPaintCoatList: `${BASE_URL}/costing/select-list-paint-coat`,
  getSurfaceTreatmentRawMaterialCalculator: `${BASE_URL}/costing/get-costing-surface-treatment-raw-material-paint-coat-details`,
  saveSurfaceTreatmentRawMaterialCalculator: `${BASE_URL}/costing/save-costing-surface-treatment-raw-material-paint-coat-details`,

  getOverheadProfitTabData: `${BASE_URL}/costing/get-costing-detail-for-overhead-and-profit`,
  getOverheadProfitDataByModelType: `${BASE_URL}/costing/get-costing-overhead-profit-details`,
  saveCostingOverheadProfitTab: `${BASE_URL}/costing/save-costing-detail-for-overhead-and-profit`,
  saveComponentOverheadProfitTab: `${BASE_URL}/costing/save-componenet-costing-detail-for-overhead-and-profit`,
  saveAssemblyOverheadProfitTab: `${BASE_URL}/costing/save-assembly-costing-detail-for-overhead-and-profit`,
  getInventoryDataByHeads: `${BASE_URL}/costing/get-costing-interest-rate-icc-applicability`,
  getPaymentTermsDataByHeads: `${BASE_URL}/costing/get-costing-interest-rate-payment-term-applicability`,
  getPaymentTermsAppliSelectListKeyValue: `${BASE_URL}/costing/get-payment-terms-applicability-list-keyvalue`,
  getLastSimulationData: `${BASE_URL}/simulation/get-last-simulation-data`,
  getImpactedMasterData: `${BASE_URL}/app-simulation-approval-system/get-impacted-master-data`,

  getPackageFreightTabData: `${BASE_URL}/costing/get-costing-detail-for-freight-and-packaging`,
  saveCostingPackageFreightTab: `${BASE_URL}/costing/save-costing-detail-for-freight-and-packaging`,

  getToolTabData: `${BASE_URL}/costing/get-costing-detail-for-tools-cost`,
  saveToolTab: `${BASE_URL}/costing/save-costing-detail-for-tool-cost`,
  getToolsProcessWiseDataListByCostingID: `${BASE_URL}/costing/get-tools-cost-process-wise-list-by-costing`,

  getDiscountOtherCostTabData: `${BASE_URL}/costing/get-costing-detail-for-other-cost`,
  saveDiscountOtherCostTab: `${BASE_URL}/costing/save-costing-detail-for-other-cost`,
  getExchangeRateByCurrency: `${BASE_URL}/costing/get-costing-exchange-rate-by-currency`,
  getTaxCodeSelectList: `${BASE_URL}/costing/get-all-tax-codes`,

  fileUploadCosting: `${BASE_URL}/costing/costing-file-upload`,
  fileDeleteCosting: `${BASE_URL}/costing/delete-costing-attachment-file`,

  getRateCriteriaByCapacitySelectList: `${BASE_URL}/costing/get-rate-criteria-by-capacity-select-list`,
  getRateByCapacityCriteria: `${BASE_URL}/costing/get-rate-by-capacity-criteria`,
  getNoOfComponentsPerCrateFromPackaging: `${BASE_URL}/costing/get-packaging-rate`,
  getCostingPartDetails: `${BASE_URL}/costing/get-costing-part-details`,
  getExistingSupplierDetailByPartId: `${BASE_URL}/costing-sheet-metal/get-existing-suppliers-details-by-part`,
  createPartWithSupplier: `${BASE_URL}/costing-sheet-metal/add-part-with-supplier`,
  createNewCosting: `${BASE_URL}/costing-sheet-metal/create`,
  getCostingDetailsById: `${BASE_URL}/costing-sheet-metal/get-costing-details-by-id`,
  getCostingTechnologySelectList: `${BASE_URL}/costing/get-technology-select-list`,
  getPartInfo: `${BASE_URL}/masters-part/get-part-info`,
  checkPartWithTechnology: `${BASE_URL}/costing/check-part-with-technology`,
  getCostingDetailsByCostingId: `${BASE_URL}/costing/get-view-costing`,

  getCostingSummaryByplantIdPartNo: `${BASE_URL}/costing/get-costings-list-for-summary-by-part-and-plant`,
  saveCostingCopy: `${BASE_URL}/costing/exact-or-latest-data-copy-costing`,
  getCostingByVendorVendorPlant: `${BASE_URL}/costing/get-vendor-costing-by-vendor-and-plant-select-list`,
  getPartByTechnologyId: `${BASE_URL}/costing/get-part-select-list-by-technology`,
  getCostingSpecificTechnology: `${BASE_URL}/costing/get-technology-select-list-for-costing`,
  checkDataForCopyCosting: `${BASE_URL}/costing/check-data-for-copy-costing`,
  saveAssemblyPartRowCostingCalculation: `${BASE_URL}/costing/save-assembly-part-row-costing-calculation`,
  checkHistoryCostingAndSAPPoPrice: `${BASE_URL}/sap-integration/check-history-costing-and-sap-po-price`,          						//RE
  saveCostingDetailNpv: `${BASE_URL}/costing/save-costing-detail-for-npv`,
  saveCostingDetailCondition: `${BASE_URL}/costing/save-costing-condition-details`,
  getNpvDetails: `${BASE_URL}/costing/get-costing-detail-for-npv`,
  getConditionDetails: `${BASE_URL}/costing/get-costing-condition-details`,
  getCostingCondition: `${BASE_URL}/costing/get-costing-condition-master-data`,
  getCostingPaymentTermDetail: `${BASE_URL}/costing/get-costing-payment-term-detail`,
  saveCostingPaymentTermDetail: `${BASE_URL}/costing/save-costing-payment-term-detail`,
  getCostingTcoDetails: `${BASE_URL}/costing/get-costing-tco-details`,
  saveCostingBasicDetails: `${BASE_URL}/costing/save-costing-basic-details`,
  getCostingCostDetails: `${BASE_URL}/costing/get-costing-cost-details`,
  getCostingBopAndBopHandlingDetails: `${BASE_URL}/costing/get-costing-bop-and-bop-handling-details`,

  //WEIGHT CALCULATION
  getWeightCalculationInfo: `${BASE_URL}/costing-sheet-metal/get-weight-calculation-info-by-costing`,
  AddCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/add-costing-weight-calculation`,
  UpdateCostingWeightCalculation: `${BASE_URL}/costing-sheet-metal/update-costing-weight-calculation`,
  getRawMaterialCalculationForSheetMetal: `${BASE_URL}/costing/get-raw-material-sheet-metal-calculation-details`,
  saveRawMaterialCalculationForSheetMetal: `${BASE_URL}/costing/save-raw-material-sheet-metal-calculation-details`,
  getRawMaterialCalculationForForging: `${BASE_URL}/costing/get-raw-material-forging-calculation-details`,
  saveRawMaterialCalculationForForging: `${BASE_URL}/costing/save-raw-material-forging-calculation-details`,
  getRawMaterialCalculationForFerrous: `${BASE_URL}/costing/get-raw-material-ferrous-casting-calculation-details`,
  saveRawMaterialCalculationForFerrous: `${BASE_URL}/costing/save-raw-material-ferrous-casting-calculation-details`,
  getRawMaterialCalculationForPlastic: `${BASE_URL}/costing/get-raw-material-plastic-calculation-details`,
  saveRawMaterialCalculationForPlastic: `${BASE_URL}/costing/save-raw-material-plastic-calculation-details`,
  getRawMaterialCalculationForCorrugatedBox: `${BASE_URL}/costing/get-raw-material-corrugated-box-calculation-details`,
  saveRawMaterialCalculationForCorrugatedBox: `${BASE_URL}/costing/save-raw-material-corrugated-box-calculation-details`,
  saveRawMaterialCalculationForMonoCartonCorrugatedBox: `${BASE_URL}/costing/save-raw-material-corrugated-and-mono-carton-box-calculation-details`,
  getRawMaterialCalculationForMonoCartonCorrugatedBox: `${BASE_URL}/costing/get-raw-material-corrugated-and-mono-carton-box-calculation-details`,
  saveRawMaterialCalculationForLamination: `${BASE_URL}/costing/save-raw-material-corrugated-laminate-calculation-details`,
  getRawMaterialCalculationForLamination: `${BASE_URL}/costing/get-raw-material-corrugated-laminate-calculation-details`,
  getRawMaterialCalculationForDieCasting: `${BASE_URL}/costing/get-raw-material-die-casting-calculation-details`,
  saveRawMaterialCalculationForDieCasting: `${BASE_URL}/costing/save-raw-material-die-casting-calculation-details`,
  getRawMaterialCalculationForRubber: `${BASE_URL}/costing/get-raw-material-rubber-calculation-details`,
  getRawMaterialCalculationForRubberStandard: `${BASE_URL}/costing/get-raw-material-rubber-standard-calculation-details`,
  saveRawMaterialCalculationForRubber: `${BASE_URL}/costing/save-raw-material-rubber-calculation-details`,
  getSimulationRmFerrousCastingCalculation: `${BASE_URL}/simulation/get-simulation-raw-material-ferrous-casting-calculation-details`,
  saveRawMaterialCalculationForRubberCompound: `${BASE_URL}/costing/save-raw-material-rubber-calculation-details`,
  saveRawMaterialCalculationForRubberStandard: `${BASE_URL}/costing/save-raw-material-rubber-standard-calculation-details`,
  getSimulationRmRubberCalculation: `${BASE_URL}/simulation/get-simulation-raw-material-rubber-calculation-details`,
  saveRawMaterialCalculationForMachining: `${BASE_URL}/costing/save-raw-material-machining-calculation-details`,
  getRawMaterialCalculationForMachining: `${BASE_URL}/costing/get-raw-material-machining-calculation-details`,
  getSimulationRmMachiningCalculation: `${BASE_URL}/simulation/get-simulation-raw-material-machining-calculation-details`,
  getSimulationCorrugatedAndMonoCartonCalculation: `${BASE_URL}/simulation/get-simulation-raw-material-corrugated-and-mono-carton-box-calculation-details`,
  getSimulationLaminationCalculation: `${BASE_URL}/simulation/get-simulation-raw-material-corrugated-laminate-calculation-details`,
  getPackagingCalculation: `${BASE_URL}/costing/get-costing-packaging-calculation-details`,
  savePackagingCalculation: `${BASE_URL}/costing/save-costing-packaging-calculation-details`,
  getVolumePerDayForPackagingCalculator: `${BASE_URL}/costing/get-volume-per-day-for-packaging-calculator`,
  getSimulationPackagingCalculation: `${BASE_URL}/simulation/get-simulation-costing-packaging-calculation-details`,
  getSimulationFreightCalculation: `${BASE_URL}/simulation/get-simulation-costing-freight-calculation-details`,
  getCarrierTypeList: `${BASE_URL}/costing/get-carrier-type`,
  getFreightCalculation: `${BASE_URL}/costing/get-costing-freight-calculation-details`,
  saveFreightCalculation: `${BASE_URL}/costing/save-costing-freight-calculation-details`,
  getTypeOfCost: `${BASE_URL}/costing/select-list-packaging-cost-type`,
  getCalculationCriteriaList: `${BASE_URL}/costing/select-list-calculation-criteria`,

  //Insulation calculator
  saveRawMaterialCalculationForInsulation: `${BASE_URL}/costing/save-raw-material-insulation-calculation-details`,
  getRawMaterialCalculationForInsulation: `${BASE_URL}/costing/get-raw-material-insulation-calculation-details`,
  // YOY
  getYOYCostList: `${BASE_URL}/rfq-costing/rfq-get-yoy-details`,
  saveYOYCostList: `${BASE_URL}/rfq-costing/rfq-save-yoy-details`,

  // PROCESS COST CALCULATION
  getProcessMachiningCalculation: `${BASE_URL}/costing/get-process-machining-calculation-details`,
  saveProcessCostCalculation: `${BASE_URL}/costing/save-process-calculation-by-technology`,
  saveDefaultProcessCostCalculation: `${BASE_URL}/costing/save-process-default-calculation-details`,
  saveMachiningProcessCostCalculation: `${BASE_URL}/costing/save-process-machining-calculation-details`,
  getProcessDefaultCalculation: `${BASE_URL}/costing/get-process-default-calculation-details`,

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
  generateReport: `${BASE_URL}/reports/update-costing-reports`,
  getErrorFile: `${BASE_URL}`,
  uploadCosting: `${BASE_URL}/bulk-costing/save-costing`,
  uploadOldCosting: `${BASE_URL}/bulk-costing/component-save-costing`,
  uploadPlasticCosting: `${BASE_URL}/bulk-costing/save-costing-plastic`,
  uploadPlasticOldCosting: `${BASE_URL}/bulk-costing/component-save-costing-plastic`,
  uploadMachiningCosting: `${BASE_URL}/bulk-costing/save-costing-machining`,
  uploadMachiningOldCosting: `${BASE_URL}/bulk-costing/component-save-costing-machining`,
  sendStatusForApproval: `${BASE_URL}/bulk-costing/update-bulk-costing`,
  uploadCorrugatedBoxCosting: `${BASE_URL}/bulk-costing/save-costing-corrugated-box`,
  uploadAssemblyCosting: `${BASE_URL}/bulk-costing/save-costing-assembly`,
  uploadWiringHarnessCosting: `${BASE_URL}/bulk-costing/save-costing-wiring-harness`,
  uploadDiecastingCosting: `${BASE_URL}/bulk-costing/save-die-costing`,
  uploadSheetMetal: `${BASE_URL}/bulk-costing/save-costing-sheet-metal-in-mhr-process`,
  getAssemblyChildPartbyAsmCostingId: `${BASE_URL}/costing/get-assembly-child-parts-by-asmCostingId`,
  getProcessAndOperationbyCostingId: `${BASE_URL}/costing/get-process-and-operation-by-asmCostingId-or-childCostingId`,
  getSettledSimulationCostingDetails: `${BASE_URL}/simulation/get-settled-simulation-costing-details`,
  uploadInsulationCosting: `${BASE_URL}/bulk-costing/save-costing-insulation`,
  uploadElectricalStampingCosting: `${BASE_URL}/bulk-costing/save-costing-electrical-stamping`,
  uploadMonocartonCosting: `${BASE_URL}/bulk-costing/save-costing-corrugated-mono-carton-box`,

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
  // login: `${BASE_URL}/user/login-ad`,         //RE
  tokenAPI: `${BASE_URL}/token`,
  refreshTokenAPI: `${BASE_URL}/user/refresh_token`,
  AutoSignin: `${BASE_URL}/user/external-login`,
  logout: `${BASE_URL}/user/logout`,
  register: `${BASE_URL}/user/register`,
  getLoginPageInit: `${BASE_URL}/user/page-init`,
  registerRfqUser: `${BASE_URL}/rfq-user/register-rfq-user`,
  updatePassword: `${BASE_URL}/rfq-user/rfq-users-reset-or-forget-password`,
  forgetPassword: `${BASE_URL}/user/users-forget-mail-send`,

  //USERS API
  getUserSelectList: `${BASE_URL}/configuration/select-list-get-user`,
  getAllUserDataAPI: `${BASE_URL}/user/get-all`,
  getUserDataAPI: `${BASE_URL}/user/get-by-id`,
  deleteUserAPI: `${BASE_URL}/user/delete`,
  activeInactiveUser: `${BASE_URL}/user/active-inactive-user`,
  updateUserAPI: `${BASE_URL}/user/update`,
  updateRfqUser: `${BASE_URL}/rfq-user/update-rfq-user`,
  setUserTechnologyLevelForCosting: `${BASE_URL}/user-level/assign-user-technology-levels-for-costing`,
  getUserTechnologyLevelForCosting: `${BASE_URL}/user-level/get-user-technology-levels`,
  updateUserTechnologyLevelForCosting: `${BASE_URL}/user-level/update-user-technology-levels`,
  getSelectListOfLevel: `${BASE_URL}/configuration/select-list-get-level`,
  getUserByTechnologyAndLevel: `${BASE_URL}/user/get-users-technology-wise-level`,
  getLevelByTechnology: `${BASE_URL}/configuration/select-list-get-level-by-technology`,
  getSimulationLevelByTechnology: `${BASE_URL}/configuration/select-list-get-level-by-simulation-technology`,
  getMasterLevelByMasterId: `${BASE_URL}/configuration/select-list-get-level-by-master`,
  getUserSimulationTechnologyLevel: `${BASE_URL}/user-level/get-user-simulation-technology-levels`,
  getUserSimulationTechnologyLevelForCosting: `${BASE_URL}/user-level/get-user-simulation-technology-levels`,          						//RE
  getUserMasterLevelForCosting: `${BASE_URL}/user-level/get-user-master-levels`,
  checkHighestApprovalLevelForHeadsAndApprovalType: `${BASE_URL}/user-level/check-valid-approval-levels`,
  getOnboardingLevelById: `${BASE_URL}/configuration/select-list-get-level-by-onboarding`,
  getUserOnboardingLevel: `${BASE_URL}/user-level/get-user-onboarding-levels`,
  getDelegateeUserListAPI: `${BASE_URL}/user-delegation/get-delegatee-users`,
  createDelegation: `${BASE_URL}/user-delegation/create-user-delegations`,
  getUserDelegationDetails: `${BASE_URL}/user-delegation/get-user-delegations`,
  revokeDelegation: `${BASE_URL}/user-delegation/revoke-user-delegations`,
  getDelegationHistory: `${BASE_URL}/user-delegation/get-user-delegations-history`,
  getAllUserDelegationApi: `${BASE_URL}/user/get-all-users-delegation`,

  //AUDIT API

  getAuditList: `${BASE_URL}/auditlogs/get-user-audit-log`,

  //ROLES API
  addRoleAPI: `${BASE_URL}/user-role/create-new`,
  getAllRoleAPI: `${BASE_URL}/user-role/get-all`,
  getRoleAPI: `${BASE_URL}/user-role/get-new`,
  updateRoleAPI: `${BASE_URL}/user-role/update-new`,
  deleteRoleAPI: `${BASE_URL}/user-role/delete`,
  rolesSelectList: `${BASE_URL}/configuration/select-list-get-roles`,
  activeInactiveRole: `${BASE_URL}/user-role/active-inactive-role`,

  //DEPARTMENT'S API
  addDepartmentAPI: `${BASE_URL}/user-department/create`,
  getAllDepartmentAPI: `${BASE_URL}/user-department/get-all`,
  getDepartmentAPI: `${BASE_URL}/user-department/get`,
  updateDepartmentAPI: `${BASE_URL}/user-department/update`,
  deleteDepartmentAPI: `${BASE_URL}/user-department/delete`,
  addCompanyAPI: `${BASE_URL}/company/create`,
  getPlantSelectListForDepartment: `${BASE_URL}/user-department/get-all-plants-list-Associated-with-departments`,

  //DIVISION'S API
  addDivisionAPI: `${BASE_URL}/user-department/create-division`,
  updateDivisionAPI: `${BASE_URL}/user-department/update-division`,
  getAllDivisionAPI: `${BASE_URL}/user-department/get-all-division`,
  getDivisionAPI: `${BASE_URL}/user-department/get-division-by-id`,
  deleteDivisionAPI: `${BASE_URL}/user-department/delete-division`,
  getDivisionListAPI: `${BASE_URL}/user-department/select-list-get-divisions`,
  getAllDivisionListAssociatedWithDepartment: `${BASE_URL}/user-department/get-all-division-list-associated-with-departments`,
  checkDivisionByPlantAndGetDivisionIdByPart: `${BASE_URL}/user-department/check-and-get-division-applied-on-plant-and-part`,

  //LEVEL'S API
  assignUserLevelAPI: `${BASE_URL}/user-level/assign-user-level-for-costing`,
  addUserLevelAPI: `${BASE_URL}/user-level/create`,
  getAllLevelAPI: `${BASE_URL}/user-level/get-all`,
  getUserLevelAPI: `${BASE_URL}/user-level/get`,
  updateUserLevelAPI: `${BASE_URL}/user-level/update`,
  deleteUserLevelAPI: `${BASE_URL}/user-level/delete`,

  addSimulationLevel: `${BASE_URL}/costing-old/approval-level-for-simulation-technology/create`,
  updateSimulationLevel: `${BASE_URL}/costing-old/approval-level-for-simulation-technology/update`,
  getSimulationLevel: `${BASE_URL}/costing-old/approval-level-for-simulation-technology/get`,
  getSimulationTechnologySelectList: `${BASE_URL}/simulation/select-list-get-simulation-applied-for-master`,

  getMastersSelectList: `${BASE_URL}/configuration/select-list-get-master`,
  addMasterLevel: `${BASE_URL}/costing-old/approval-level-for-master/create`,
  getMasterLevel: `${BASE_URL}/costing-old/approval-level-for-master/get`,
  updateMasterLevel: `${BASE_URL}/costing-old/approval-level-for-master/update`,

  //ONBOARDING LEVEL'S API
  addOnboardingLevel: `${BASE_URL}/costing-old/approval-level-for-onboarding/create`,
  updateOnboardingLevel: `${BASE_URL}/costing-old/approval-level-for-onboarding/update`,
  getOnboardingLevel: `${BASE_URL}/costing-old/approval-level-for-onboarding/get`,
  getOnboardingLevelDataList: `${BASE_URL}/costing-old/approval-level-for-onboarding/get-all`,



  //SET LEVEL FOR TECHNOLOGY
  setApprovalLevelForTechnology: `${BASE_URL}/costing-old/approval-level-for-technology/create`,
  getLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/get`,
  getAllLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/get-all`,
  updateLevelMappingAPI: `${BASE_URL}/costing-old/approval-level-for-technology/update`,
  getSimulationLevelDataList: `${BASE_URL}/costing-old/approval-level-for-simulation-technology/get-all`,
  getMasterLevelDataList: `${BASE_URL}/costing-old/approval-level-for-master/get-all`,


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
  approvalPushedOnSap: `${BASE_URL}/ExternalIntegration/create-push-pir-data-request-and-push-pir-data-on-sap`,
  checkSAPPoPrice: `${BASE_URL}/ExternalIntegration/check-sap-po-price`,
  getAllApproverList: `${BASE_URL}/app-approval-system/get-approval-user-details`,

  // ApproveReject Drawer final approver
  checkFinalUser: `${BASE_URL}/app-approval-system/final-user-check`,
  getReleaseStrategyApprovalDetails: `${BASE_URL}/app-approval-system/get-release-strategy-approval-details`,
  checkFinalLevelApproverForApproval: `${BASE_URL}/app-approval-system/check-is-user-final-level-approver-for-approvals`,

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
  getTopAndLeftMenuData: `${BASE_URL}/app-privilege-permission/get-user-top-menu-module-page-with-action-by-user`,



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
  checkAndGetMachineNumber: `${BASE_URL}/masters-machine/check-machine-number-is-unique`,
  getFuelUnitCost: `${BASE_URL}/masters-machine/get-fuel-unit-cost`,
  getLabourCost: `${BASE_URL}/masters-machine/get-labour-cost`,
  getPowerCostUnit: `${BASE_URL}/masters-machine/get-power-cost`,

  createMachineDetails: `${BASE_URL}/masters-machine/create-machine-details`,
  updateMachineDetails: `${BASE_URL}/masters-machine/update-machine-Details`,
  getMachineDetailsData: `${BASE_URL}/masters-machine/get-machine-details`,

  bulkUploadMachine: `${BASE_URL}/masters-machine/bulk-upload-for-machine-json`,
  bulkUploadMachineMoreZBC: `${BASE_URL}/masters-machine/bulk-upload-for-machine-details-json`,

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
  getProcessGroupList: `${BASE_URL}/masters-machine/get-process-group`,

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
  volumeBulkUpload: `${BASE_URL}/masters-volume/bulk-upload-for-volume-json`,
  createVolumeLimit: `${BASE_URL}/masters-volume/create-add-limit`,
  updateVolumeLimit: `${BASE_URL}/masters-volume/update-add-limit`,
  getVolumeLimit: `${BASE_URL}/masters-volume/get-add-limit-by-id`,
  checkRegularizationLimit: `${BASE_URL}/app-approval-system/get-ncc-costing-regularization-limit-data`,
  getPartSelectListWtihRevNo: `${BASE_URL}/configuration/get-part-number-and-revision-number`,
  bulkUploadVolume: `${BASE_URL}/masters-volume/save-actual-volume-details`,
  getUnassociatedPartNumber: `${BASE_URL}/configuration/get-part-number-and-revision-number-unupdated-technology`,

  //BUDGET MASTER
  getBudgetDataList: `${BASE_URL}/master-budgeting/get-all`,
  getApprovedPartCostingPrice: `${BASE_URL}/configuration/get-approved-part-costing-price`,
  createBudget: `${BASE_URL}/master-budgeting/create`,
  getPartCostingHead: `${BASE_URL}/configuration/select-list-get-part-costing-head`,
  getMasterBudget: `${BASE_URL}/master-budgeting/get-by-id`,
  updateBudget: `${BASE_URL}/master-budgeting/update`,
  bulkUploadBudgetMaster: `${BASE_URL}/master-budgeting/bulk-upload-for-budgeting`,
  masterApprovalRequestBySenderBudget: `${BASE_URL}/master-budgeting/master-send-to-approver-by-sender`,
  deleteBudget: `${BASE_URL}/master-budgeting/delete-by-id`,

  //CLIENT MASTER
  createClient: `${BASE_URL}/client/create-client`,
  updateClient: `${BASE_URL}/client/update-client`,
  getClientData: `${BASE_URL}/client/get-client-detail-by-id`,
  getClientDataList: `${BASE_URL}/client/get-all-client`,
  deleteClient: `${BASE_URL}/client/delete`,
  getClientSelectList: `${BASE_URL}/client/select-list-client`,
  checkAndGetCustomerCode: `${BASE_URL}/client/generate-customer-company-code`,
  getPoamStatusSelectList: `${BASE_URL}/configuration/select-list-get-poam-status`,

  //EXCHANGE RATE MASTER
  createExchangeRate: `${BASE_URL}/masters-exchange-rate/create`,
  getExchangeRateDataList: `${BASE_URL}/masters-exchange-rate/get-all-exchange-rate`,
  getExchangeRateDataListForSimulation: `${BASE_URL}/masters-exchange-rate/get-old-and-new-all-exchange-rate`,
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

  //OUTSOURCING
  activeInactiveOutsourcingStatus: `${BASE_URL}/masters-outsourcing/active`,
  createOutsourcing: `${BASE_URL}/masters-outsourcing/create`,
  updateOutsourcing: `${BASE_URL}/masters-outsourcing/update`,
  getAllOutsourcing: `${BASE_URL}/masters-outsourcing/get-all`,
  getOutsourcing: `${BASE_URL}/masters-outsourcing/get`,

  //SIMULATION
  getSimulationHistory: `${BASE_URL}/simulation/get-simulation-history`,
  getSelectListOfSimulationMaster: `${BASE_URL}/simulation/select-list-get-simulation-applied-for-master`,
  runSimulation: `${BASE_URL}/simulation/draft-simulation-raw-material`,
  getVerifySimulationList: `${BASE_URL}/simulation/get-all-impacted-simulation-costings`,
  runSimulationOnSelectedCosting: `${BASE_URL}/simulation/run-simulation-on-selected-costing`,
  getCostingSimulationList: `${BASE_URL}/simulation/get-all-simulated-costings`,
  getSimulationApprovalList: `${BASE_URL}/app-simulation-approval-system/get-simulation-approvals-by-filter`,
  getSelectListOfSimulationApplicability: `${BASE_URL}/simulation/select-list-get-simulation-heads`,
  saveSimulationForRawMaterial: `${BASE_URL}/simulation/save-simulation-for-raw-material`,
  getApprovalSimulatedCostingSummary: `${BASE_URL}/app-simulation-approval-system/get-approval-simulated-costing-summary`,
  deleteDraftSimulation: `${BASE_URL}/simulation/delete-draft-simulation`,
  draftExchangeRateSimulation: `${BASE_URL}/simulation/draft-simulation-exchange-rate`,
  getverifyExchangeSimulationList: `${BASE_URL}/simulation/get-all-exchange-rate-impacted-simulation-costings`,
  runSimulationOnSelectedExchangeCosting: `${BASE_URL}/simulation/run-simulation-on-exchange-rate-costing`,
  getExchangeCostingSimulationList: `${BASE_URL}/simulation/get-all-simulated-exchange-rate-costings`,
  getCombinedProcessList: `${BASE_URL}/simulation/get-all-combined-process`,          						//RE
  draftCombinedProcessSimulation: `${BASE_URL}/simulation/draft-simulation-combined-process`,          						//RE
  getverifyCombinedProcessSimulationList: `${BASE_URL}/simulation/get-all-combined-process-impacted-simulation-costings`,          						//RE
  runSimulationOnSelectedCombinedProcessCosting: `${BASE_URL}/simulation/run-simulation-on-selected-combined-process-costing`,          						//RE
  getCombinedProcessCostingSimulationList: `${BASE_URL}/simulation/get-all-simulated-combined-process-costings`,          						//RE
  getSelectListOfSimulationLinkingTokens: `${BASE_URL}/simulation/select-list-get-simulation-linking-tokens`,
  getFgWiseImpactData: `${BASE_URL}/sap-integration/get-fg-wise-impact-data`,          						//RE
  sapPushedInitialMoment: `${BASE_URL}/sap-integration/sap-pushed-initial-moment`,          						//RE
  sapPushedCostingInitialMoment: `${BASE_URL}/sap-integration/insert-costing-data-on-sap`,          						//RE

  uploadFileOnSimulation: `${BASE_URL}/simulation/simulation-file-upload`,
  draftSurfaceTreatmentSimulation: `${BASE_URL}/simulation/draft-simulation-surface-treatment-and-operation`,
  getverifySurfaceTreatmentSimulationList: `${BASE_URL}/simulation/get-all-surface-treatment-and-operation-impacted-simulation-costings`,
  runSimulationOnSelectedSurfaceTreatmentCosting: `${BASE_URL}/simulation/run-simulation-on-selected-surface-treatment-and-operation-costing`,
  draftMachineRateSimulation: `${BASE_URL}/simulation/draft-simulation-machine-process`,
  runSimulationOnSelectedMachineRateCosting: `${BASE_URL}/simulation/run-simulation-on-selected-machine-process-costing`,
  draftBoughtOutpartSimulation: `${BASE_URL}/simulation/draft-simulation-bought-out-part`,
  runSimulationOnSelectedBoughtOutPartCosting: `${BASE_URL}/simulation/run-simulation-on-selected-bought-out-part-costing`,
  runSimulationOnSelectedBoughtOutPart: `${BASE_URL}/simulation/run-simulation-on-selected-bought-out-part`,

  getverifyMachineRateSimulationList: `${BASE_URL}/simulation/get-all-machine-process-impacted-simulation-costings`,
  getverifyBoughtOutPartSimulationList: `${BASE_URL}/simulation/get-all-bought-out-part-impacted-simulation-costings`,
  getCostingSurfaceTreatmentSimulationList: `${BASE_URL}/simulation/get-all-simulated-surface-treatment-and-operation-costings`,
  getCostingBoughtOutPartSimulationList: `${BASE_URL}/simulation/get-all-simulated-bought-out-part-costings`,
  getMachineRateCostingSimulationList: `${BASE_URL}/simulation/get-all-simulated-machine-process-costings`,
  getAllSimulatedBoughtOutPart: `${BASE_URL}/simulation/get-all-simulated-bought-out-part`,

  getSimulatedAssemblyWiseImpactDate: `${BASE_URL}/simulation/get-simulated-assembly-wise-impact-data-by-costingId`,
  getVerifyOverheadProfitSimulationList: `${BASE_URL}/simulation/get-all-overhead-profit-impacted-simulation-costings`,
  runSimulationOnSelectedOverheadCosting: `${BASE_URL}/simulation/run-simulation-on-overhead-costing`,
  getverifyOverheadSimulationList: `${BASE_URL}/simulation/get-all-overhead-impacted-simulation-costings`,
  getVerifyProfitSimulationList: `${BASE_URL}/simulation/get-all-profit-impacted-simulation-costings`,
  runSimulationOnSelectedProfitCosting: `${BASE_URL}/simulation/run-simulation-on-profit-costing`,
  draftOverheadSimulation: `${BASE_URL}/simulation/draft-simulation-overhead`,
  draftProfitSimulation: `${BASE_URL}/simulation/draft-simulation-profit`,
  getTokenSelectListAPI: `${BASE_URL}/simulation/select-list-get-draft-token-number-by-technologyId`,
  getListingForSimulationCombined: `${BASE_URL}/simulation/get-master-details-by-token-number`,
  getAmmendentStatus: `${BASE_URL}/ExternalIntegration/get-ammendent-status`,
  getMasterSelectListSimulation: `${BASE_URL}/simulation/select-list-get-simulation-applied-for-master-with-permission`,
  getAllSimulationBoughtOutPart: `${BASE_URL}/simulation/get-all-simulation-bought-out-part`,
  getSapPushDetailsHeader: `${BASE_URL}/ExternalIntegration/get-sap-push-details-header`,
  sapPushBulkUpload: `${BASE_URL}/ExternalIntegration/bulk-upload-for-sap-push-details`,
  getSimulationCostingStatus: `${BASE_URL}/app-simulation-approval-system/get-simulation-costing-status`,
  getImpactedDataList: `${BASE_URL}/app-simulation-approval-system/get-simulation-costing-status-details`,


  // ASSEMBLY TECHNOLOGY
  getAssemblyTechnologySimulation: `${BASE_URL}/simulation/get-assembly-technology-simulation`,
  runSimulationOnSelectedAssemblyTechnologyCosting: `${BASE_URL}/simulation/run-simulation-on-selected-multi-technology-costing`,
  getAllMultiTechnologyCostings: `${BASE_URL}/simulation/get-all-multi-technology-costings`,
  draftSimulationMultiTechnology: `${BASE_URL}/simulation/draft-simulation-multi-technology`,
  getAllMultiTechnologyImpactedSimulationCostings: `${BASE_URL}/simulation/get-all-multi-technology-impacted-simulation-costings`,
  getAllSimulatedMultiTechnologyCosting: `${BASE_URL}/simulation/get-all-simulated-multi-technology-costings`,

  //SIMULATION APPROVAL
  getAllSimulationApprovalDepartment: `${BASE_URL}/app-simulation-approval-system/get-all-simulation-approval-department`,
  getSimulationApprovalListByDepartment: `${BASE_URL}/app-simulation-approval-system/get-all-simulation-approval-users-level-filter-by-department`,
  simulationApprove: `${BASE_URL}/app-simulation-approval-system/approved-simulated-costing-by-approver`,
  simulationReject: `${BASE_URL}/app-simulation-approval-system/rejected-simulated-costing-by-approver`,
  simulationSendToApprover: `${BASE_URL}/app-simulation-approval-system/simulation-send-to-approver-by-sender`,
  simulationComparisionData: `${BASE_URL}/app-simulation-approval-system/get-simulation-costing-comparison`,
  getallSimualtionStatus: `${BASE_URL}/app-simulation-approval-system/get-all-approval-status`,
  simulationUploadFileByCategory: `${BASE_URL}/simulation/simulation-file-upload-with-form-data`,          						//RE
  simulationUploadFtp: `${BASE_URL}/simulation/simulation-file-upload-on-ftp`,          						//RE
  getSimualtionInsightReport: `${BASE_URL}/app-simulation-approval-system/get-simulation-insights`,
  getCostingHeadsList: `${BASE_URL}/configuration/get-costing-heads`,

  //REPORT
  getReportListing: `${BASE_URL}/dashboard/get-costings-for-dashboard`,
  // getSimualtionInsightReport: `${BASE_URL}/reports/get-simulation-insights`,          						//RE
  getCostingReport: `${BASE_URL}/reports/get-costing-report`,
  getCostingBenchMarkRmReport: `${BASE_URL}/reports/get-rawmaterial-cost-benchmarking-report`,
  getCostingBenchMarkBopReport: `${BASE_URL}/reports/get-bop-cost-benchmarking-report`,
  getCostMovementReport: `${BASE_URL}/reports/get-cost-movement-report-by-master`,
  getRevisionNoFromPartId: `${BASE_URL}/masters-part/select-list-revision-number-by-part-id`,
  getCostMovementReportByPart: `${BASE_URL}/reports/get-cost-movement-report-by-part`,
  getCostRatioReport: `${BASE_URL}/reports/get-cost-ratio-report`,
  getNfrInsightsDetails: `${BASE_URL}/reports/get-nfr-insights-details`,
  getNfrInsightsStatusDetails: `${BASE_URL}/reports/get-nfr-insights-status-details`,

  //RFQ
  getQuotationList: `${BASE_URL}/rfq-quotation/get-quotation-list`,
  getCostingBenchMarkOperationReport: `${BASE_URL}/reports/get-operation-cost-benchmarking-report`,
  getSupplierContributionData: `${BASE_URL}/reports/get-supplier-contribution-report`,
  getCostingBenchMarkMachineReport: `${BASE_URL}/reports/get-process-cost-benchmarking-report`,
  getSalePurchaseProvisionReport: `${BASE_URL}/reports/get-sale-purchase-provision-report`,
  getPoamSummaryReport: `${BASE_URL}/reports/get-poam-summary-report`,
  getPoamImpactReport: `${BASE_URL}/reports/get-poam-impact-report`,
  rfqGetBestCostingDetails: `${BASE_URL}/rfq-costing/rfq-get-best-costing-details`,
  getAllNfrList: `${BASE_URL}/nfr/get-all-nfr-list`,
  getNfrPartDetails: `${BASE_URL}/nfr/get-nfr-part-details`,
  getRMCostMovement: `${BASE_URL}/reports/get-raw-material-cost-movement`,
  getBOPCostMovement: `${BASE_URL}/reports/get-bought-out-part-cost-movement`,
  getOperationMovement: `${BASE_URL}/reports/get-operation-cost-movement`,
  getMachineProcessMovement: `${BASE_URL}/reports/get-machine-process-cost-movement`,
  saveNFRGroupDetails: `${BASE_URL}/nfr/save-nfr-group-details`,
  getNFRPartWiseGroupDetail: `${BASE_URL}/nfr/get-nfr-part-wise-group-detail`,
  nfrSendToApproverBySender: `${BASE_URL}/nfr/nfr-send-to-approver-by-sender`,
  getNFRApprovals: `${BASE_URL}/nfr/get-nfr-approvals`,
  getNFRApprovalSummary: `${BASE_URL}/nfr/get-nfr-approval-summary`,
  approvedCostingByApprover: `${BASE_URL}/nfr/approved-nfr-by-approver`,
  createNFRBOMDetails: `${BASE_URL}/nfr/create-nfr-bom-details`,
  getrRqVendorDetails: `${BASE_URL}/rfq-quotation/get-rfq-vendor-detail`,
  getTargetPrice: `${BASE_URL}/rfq-quotation/get-target-price`,
  saveRfqPartDetails: `${BASE_URL}/rfq-quotation/create-quotation-parts`,
  getRfqRaiseNumber: `${BASE_URL}/rfq-quotation/get-rfq-raise-number`,
  getSpecificationDetailTco: `${BASE_URL}/rfq-quotation/get-costing-specification`,
  getSpecificationDetailBop: `${BASE_URL}/rfq-quotation/get-bought-out-part-specification`,
  deleteQuotationPartDetail: `${BASE_URL}/rfq-quotation/delete-quotation-part-detail`,
  checkRegisteredVendor: `${BASE_URL}/rfq-quotation/check-registered-vendor`,
  getPurchaseRequisitionSelectList: `${BASE_URL}/rfq-quotation/select-list-pr-number`,
  getRfqBopNumberSelectList: `${BASE_URL}/masters-bought-out-part/select-list-bought-out-part-child`,
  getRfqBOPCategorySelectList: `${BASE_URL}/masters-bought-out-part/select-list-bought-out-part-category`,
  createQuotationPrParts: `${BASE_URL}/rfq-quotation/create-quotation-pr-parts`,
  // getRfqRaiseNumber: `${BASE_URL}/rfq-quotation/create-quotation`,
  sendQuotationForReview: `${BASE_URL}/rfq-quotation/review-Quotation`,
  getRfqReviewHistory: `${BASE_URL}/rfq-quotation/get-reviewHistory-by-quotationId`,

  //Auction
  auctionRfqSelectList: `${BASE_URL}/rfq-quotation/select-list-rfq-number`,
  checkQuatationForAuction: `${BASE_URL}/rfq-quotation/check-quotation-auction-part-details`,
  createAuction: `${BASE_URL}/rfq-quotation/create-auction`,
  auctionListByStatus: `${BASE_URL}/rfq-quotation/get-quotation-auction-list`,
  auctionBidDetails: `${BASE_URL}/rfq-quotation/get-quotation-auction-vendor-bid-price-details`,
  auctionHeaderDetails: `${BASE_URL}/rfq-quotation/get-quotation-auction-by-id`,
  sendCounterOffer: `${BASE_URL}/rfq-quotation/create-counter-offer`,
  getLiveAndScheduledCount: `${BASE_URL}/rfq-quotation/get-auction-active-scheduled-and-closed-count`,
  updateShowVendorRank: `${BASE_URL}/rfq-quotation/update-display-rank-to-vendor`,
  updateAuctionDuration: `${BASE_URL}/rfq-quotation/update-auction-duration-extension`,
  closeAuction: `${BASE_URL}/rfq-quotation/closed-auction`,
  reScheduleAuction: `${BASE_URL}/rfq-quotation/re-schedule-auction`,

  //MINDA
  pushNfrOnSap: `${BASE_URL}/nfr/push-nfr-on-sap`,
  // getSapnfrData: `${BASE_URL}/nfr/get-sap-nfr-data`,
  // createPFS2Costing: `${BASE_URL}/nfr/create-pfs2-costing`,
  // getNfrSelectList: `${BASE_URL}/rfq-quotation/select-list-get-nfr`,
  saveNFRCostingInfo: `${BASE_URL}/nfr/save-nfr-costing-info`,
  saveOutsourcingData: `${BASE_URL}/nfr/save-nfr-costing-outsorcing-details`,
  getNFRCostingOutsourcingDetails: `${BASE_URL}/nfr/get-nfr-costing-outsorcing-details`,
  getRMFromNFR: `${BASE_URL}/nfr/get-nfr-part-wise-raw-materials`,
  // pushNfrRmBopOnSap: `${BASE_URL}/nfr/push-nfr-rm-bop-on-sap`,
  deleteNFRDetailAPI: `${BASE_URL}/nfr/delete-nfr`,

  getRawMaterialByNFRPart: `${BASE_URL}/nfr/get-raw-material-by-nfr-part`,
  getGotAndGivenDetails: `${BASE_URL}/reports/get-got-and-given-details`,
  getCostingGotAndGivenDetails: `${BASE_URL}/reports/get-head-wise-costing-got-and-given-details`,
  getPlantWiseGotAndGivenDetails: `${BASE_URL}/reports/get-plant-head-wise-details`,

  getProductlist: `${BASE_URL}/reports/get-product-list`,
  getProductPartDataList: `${BASE_URL}/reports/get-product-parts-list`,
  getStageOfPartDetails: `${BASE_URL}/reports/get-stage-of-parts-details`,
  getProductRolloutCostMovement: `${BASE_URL}/reports/get-cost-movement-details`,
  getTotalPartsDetails: `${BASE_URL}/reports/get-parts-details`,
  getProductRolloutCostRatio: `${BASE_URL}/reports/get-cost-ratio-details`,
  getUsageRmDetails: `${BASE_URL}/reports/get-usage-rm-details`,
  getSupplierContributionDetails: `${BASE_URL}/reports/get-supplier-contribution-details`,
  // updateCostingIdFromRfqToNfrPfs: `${BASE_URL}/nfr/update-costingId-from-rfq-to-nfr-pfs`,//MINDA

  //SUB ASSEMBLY
  getSubAssemblyAPI: `${BASE_URL}/sub-assembly/get-sub-assembly`,
  createMultiTechnologyCosting: `${BASE_URL}/costing/create-multi-technology-costing`,
  getEditPartCostDetails: `${BASE_URL}/sub-assembly/get-edit-part-cost-details`,
  saveEditPartCostDetails: `${BASE_URL}/sub-assembly/save-edit-part-cost-details`,
  getCostingForMultiTechnology: `${BASE_URL}/costing/get-costing-for-multi-technology`,
  saveSettledCostingDetails: `${BASE_URL}/costing/save-settled-costing-details`,
  getSettledCostingDetails: `${BASE_URL}/costing/get-settled-costing-details`,
  updateMultiTechnologyTopAndWorkingRowCalculation: `${BASE_URL}/costing/update-multi-technology-top-and-working-row-calculation`,

  //RFQ
  getQuotationDetailsByVendor: `${BASE_URL}/rfq-quotation/get-quotation-details-by-vendor`,
  createRfqQuotation: `${BASE_URL}/rfq-quotation/create`,
  updateRfqQuotation: `${BASE_URL}/rfq-quotation/update`,
  getQuotationById: `${BASE_URL}/rfq-quotation/get-quotation-by-id`,
  cancelRfqQuotation: `${BASE_URL}/rfq-quotation/cancel-quotation`,
  fileUploadQuotation: `${BASE_URL}/rfq-quotation/quotation-file-upload`,
  fileDeleteQuotation: `${BASE_URL}/rfq-quotation/delete-quotation-attachment-file`,
  sendReminderForQuotation: `${BASE_URL}/rfq-quotation/send-reminder-for-quotation`,
  getQuotationDetailsList: `${BASE_URL}/rfq-quotation/get-quotation-details-list`,
  getCommunicationHistory: `${BASE_URL}/rfq-quotation/get-communication-history`,
  checkExistCosting: `${BASE_URL}/rfq-quotation/rfq-check-exist-costing`,
  rfqSaveBestCosting: `${BASE_URL}/rfq-costing/rfq-save-best-costing`,
  getAssemblyChildpart: `${BASE_URL}/rfq-quotation/get-assembly-child-part`,
  getRfqPartDetails: `${BASE_URL}/rfq-quotation/get-quotation-part-detail`,
  checkRmExistInRfq: `${BASE_URL}/rfq-quotation/rfq-check-exist-raw-matarial`,
  checkBopExistInRfq: `${BASE_URL}/rfq-quotation/rfq-check-exist-bought-out-part`,

  //vendor management
  getVendorClassificationList: `${BASE_URL}/vendor/get-classifications-status`,
  getVendorLpsRatingList: `${BASE_URL}/vendor/get-lpsratings-status`,
  vendorClassificationStatusUpdate: `${BASE_URL}/vendor/update-classification-status`,
  lpsRatingStatusUpdate: `${BASE_URL}/vendor/update-lpsrating-status`,
  sendForUnblocking: `${BASE_URL}/masters-approval/master-send-to-approver-by-sender`,
  getVendorData: `${BASE_URL}/vendor/vendor-name-by-vendor-select-list`,
  getPlantData: `${BASE_URL}/configuration/get-plant-for-deviation-approval-by-vendor`,
  // getMonths : `${BASE_URL}/configuration/get-months-for-deviation-approval-by-vendor`,
  getVendorPlantDetailForDeviation: `${BASE_URL}/vendor/get-vendor-plant-detail-for-deviation-approval`,
  getOnboardingSummaryData: `${BASE_URL}/app-approval-system/get-approval-master-summary`,

  // NFR
  getNfrSelectList: `${BASE_URL}/rfq-quotation/select-list-get-nfr`,
  getNfrAnnualForecastQuantity: `${BASE_URL}/rfq-quotation/get-nfr-annual-forecast-quantity`,
  //MINDA
  // getNFRRMList: `${BASE_URL}/rfq-quotation/get-nfr-rm-list`,
  // getNFRPartRMList: `${BASE_URL}/rfq-quotation/get-nfr-part-raw-material-details`,
  // // SAP PUSH Detail
  saveSAPDetail: `${BASE_URL}/ExternalIntegration/save-sap-push-details`,
  updateSAPDetail: `${BASE_URL}/ExternalIntegration/update-sap-push-details`,
  // getPurcahseOrganisationByPlant: `${BASE_URL}/sap-sync/get-purchase-organization-by-plant-id`,
  getMaterialGroupByPart: `${BASE_URL}/ExternalIntegration/get-material-group-by-part-id`,
  getAllSAPPushDetail: `${BASE_URL}/ExternalIntegration/get-all-sap-push-details`,
  getSAPDetailById: `${BASE_URL}/ExternalIntegration/get-sap-push-details-by-id`,
  getAllPartBopRmList: `${BASE_URL}/ExternalIntegration/get-part-number-and-rm-code-and-bop-number-list`,

  //SAP API FOR APPROVAL PUSH
  getEvaluationType: `${BASE_URL}/ExternalIntegration/select-list-of-valuations`,

}
//VENDOR MANAGEMENT

export const VENDOR_CLASSIFICATION_DATA = 'VENDOR_CLASSIFICATION_DATA';
export const LPS_RATING_DATA = 'LPS_RATING_DATA';
export const UPDATE_VENDOR_CLASSIFICATION_STATUS = 'UPDATE_VENDOR_CLASSIFICATION_STATUS';
export const UPDATE_LPS_RATING_STATUS = 'UPDATE_LPS_RATING_STATUS';
export const MONTHS = 'MONTHS';
export const VENDOR_DATA = 'VENDOR_DATA';
export const VENDOR_PLANT_DATA = 'VENDOR_PLANT_DATA';
export const DETAILS_FOR_DEVIATION_APPROVAL = 'DETAILS_FOR_DEVIATION_APPROVAL';
export const SEND_FOR_UNBLOCKING = 'SEND_FOR_UNBLOCKING';
export const GET_ONBOARDING_SUMMARY_DATA_LIST = 'GET_ONBOARDING_SUMMARY_DATA_LIST';






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
export const GET_ALL_SUPPLIER_DATALIST_SUCCESS = 'GET_ALL_SUPPLIER_DATALIST_SUCCESS'
export const GET_SUPPLIER_CITY_SUCCESS = 'GET_SUPPLIER_CITY_SUCCESS'
export const GET_TECHNOLOGY_SUCCESS = 'GET_TECHNOLOGY_SUCCESS'
export const GET_SUPPLIER_SELECTLIST_SUCCESS = 'GET_SUPPLIER_SELECTLIST_SUCCESS'
export const GET_TECHNOLOGY_SELECTLIST_SUCCESS = 'GET_TECHNOLOGY_SELECTLIST_SUCCESS'
export const GET_PLANT_SELECTLIST_SUCCESS = 'GET_PLANT_SELECTLIST_SUCCESS'
export const GET_PLANT_SELECTLIST_BY_TYPE = 'GET_PLANT_SELECTLIST_BY_TYPE'
export const GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST = 'GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST'
export const GET_USERS_MASTER_LEVEL_API = 'GET_USERS_MASTER_LEVEL_API'

//INDEXATION
export const GET_INDEX_SELECTLIST = 'GET_INDEX_SELECTLIST'
export const GET_COMMODITY_IN_INDEX_SELECTLIST = 'GET_COMMODITY_IN_INDEX_SELECTLIST'
export const GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE = 'GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE'
export const CREATE_COMMODITY_SUCCESS = 'CREATE_COMMODITY_SUCCESS'
export const CREATE_COMMODITY_FAILURE = 'CREATE_COMMODITY_FAILURE'
export const GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS = 'GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS'
export const GET_INDEXCOMMODITY_DATALIST_SUCCESS = 'GET_INDEXCOMMODITY_DATALIST_SUCCESS'
export const GET_COMMODITYININDEX_DATALIST_SUCCESS = 'GET_COMMODITYININDEX_DATALIST_SUCCESS'
export const GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD = 'GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD'
export const GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD = 'GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD'
export const GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS = 'GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS'
export const GET_STANDARDIZEDCOMMODITY_FOR_DOWNLOAD = 'GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD'
export const GET_INDEXDATA_LIST_SUCCESS = 'GET_INDEXDATA_LIST_SUCCESS'
export const GET_INDEXDATA_FOR_DOWNLOAD = 'GET_INDEXDATA_FOR_DOWNLOAD'
export const GET_COMMODITY_STANDARD_FOR_DOWNLOAD = 'GET_COMMODITY_STANDARD_FOR_DOWNLOAD'
export const GET_COMMODITY_STANDARD_DATALIST_SUCCESS = 'GET_COMMODITY_STANDARD_DATALIST_SUCCESS'
export const GET_OTHER_COST_SELECTLIST = 'GET_OTHER_COST_SELECTLIST'
export const GET_OTHER_COST_APPLICABILITY_SELECTLIST = 'GET_OTHER_COST_APPLICABILITY_SELECTLIST'
export const SET_COMMODITY_DETAILS = 'SET_COMMODITY_DETAILS'
export const SET_OTHER_COST_DETAILS = 'SET_OTHER_COST_DETAILS'
export const GET_LAST_REVISION_RAW_MATERIAL_DETAILS = 'GET_LAST_REVISION_RAW_MATERIAL_DETAILS'

//INDEXATION SIMULATION
export const GET_RM_INDEXATION_SIMULATION_LIST = 'GET_RM_INDEXATION_SIMULATION_LIST'
export const GET_SIMULATED_RAW_MATERIAL_SUMMARY = 'GET_SIMULATED_RAW_MATERIAL_SUMMARY'
export const GET_RM_INDEXATION_COSTING_SIMULATION_LIST = 'GET_RM_INDEXATION_COSTING_SIMULATION_LIST'

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
export const GET_APPROVAL_TYPE_SELECT_LIST = 'GET_APPROVAL_TYPE_SELECT_LIST'
export const GET_APPROVAL_MODULE_SELECT_LIST = 'GET_APPROVAL_MODULE_SELECT_LIST'
export const GET_APPROVAL_TYPE_SELECT_LIST_COSTING = 'GET_APPROVAL_TYPE_SELECT_LIST_COSTING'
export const GET_APPROVAL_TYPE_SELECT_LIST_SIMULATION = 'GET_APPROVAL_TYPE_SELECT_LIST_SIMULATION'
export const GET_APPROVAL_TYPE_SELECT_LIST_MASTER = 'GET_APPROVAL_TYPE_SELECT_LIST_MASTER'
export const GET_APPROVAL_TYPE_SELECT_LIST_ONBOARDING = 'GET_APPROVAL_TYPE_SELECT_LIST_ONBOARDING'


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

//PRODUCT MASTER
export const GET_PRODUCT_DATA_LIST = 'GET_PRODUCT_DATA_LIST'
export const GET_PRODUCT_UNIT_DATA = 'GET_PRODUCT_UNIT_DATA'
export const PRODUCT_GROUPCODE_SELECTLIST = 'PRODUCT_GROUPCODE_SELECTLIST'
export const ADD_PRODUCT_HIERARCHY = 'ADD_PRODUCT_HIERARCHY'
export const GET_PRODUCT_HIERARCHY_DATA = 'GET_PRODUCT_HIERARCHY_DATA'
export const GET_PRODUCT_HIERARCHY_LABELS = 'GET_PRODUCT_HIERARCHY_LABELS'
export const ADD_PRODUCT_LABELS = 'ADD_PRODUCT_LABELS'
export const STORE_HIERARCHY_DATA = 'STORE_HIERARCHY_DATA'

//ASSEMBLY PART
export const GET_ASSEMBLY_PART_SELECTLIST = 'GET_ASSEMBLY_PART_SELECTLIST'
export const GET_COMPONENT_PART_SELECTLIST = 'GET_COMPONENT_PART_SELECTLIST'
export const GET_BOUGHTOUT_PART_SELECTLIST = 'GET_BOUGHTOUT_PART_SELECTLIST'

//SUB ASSEMBLY
export const SUB_ASSEMBLY_TECHNOLOGY_ARRAY = 'SUB_ASSEMBLY_TECHNOLOGY_ARRAY'
export const GET_EDIT_PART_COST_DETAILS = 'GET_EDIT_PART_COST_DETAILS'
export const GET_COSTING_FOR_MULTI_TECHNOLOGY = 'GET_COSTING_FOR_MULTI_TECHNOLOGY'

//NEW PART MASTER
export const GET_ALL_NEW_PARTS_SUCCESS = 'GET_ALL_NEW_PARTS_SUCCESS'
export const GET_PART_SELECTLIST_SUCCESS = 'GET_PART_SELECTLIST_SUCCESS'
export const GET_ALL_NEW_PARTS_SUCCESS_PAGINATION = 'GET_ALL_NEW_PARTS_SUCCESS_PAGINATION'

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
export const GET_ALL_RM_DOMESTIC_LIST = 'GET_ALL_RM_DOMESTIC_LIST'
export const GET_RM_IMPORT_LIST = 'GET_RM_IMPORT_LIST'
export const GET_MANAGE_SPECIFICATION = 'GET_MANAGE_SPECIFICATION'
// export const GET_MANAGE_MATERIAL = 'GET_MANAGE_MATERIAL'
export const GET_UNASSOCIATED_RM_NAME_SELECTLIST = 'GET_UNASSOCIATED_RM_NAME_SELECTLIST'
export const SET_FILTERED_RM_DATA = 'SET_FILTERED_RM_DATA'
export const STATUS_COLUMN_DATA = 'STATUS_COLUMN_DATA'
export const IS_RESET = 'IS_RESET'
export const IS_RESET_COSTING_HEAD = 'IS_RESET_COSTING_HEAD'
export const SET_COSTING_HEAD_FILTER = 'SET_COSTING_HEAD_FILTER'


//RM EXCHANGE RATE SOURCE
export const GET_RM_EXCHANGE_RATE_SOURCE = 'GET_RM_EXCHANGE_RATE_SOURCE'
//COST FREQUENCY OF SETTLEMENT
export const GET_COST_FREQUENCY_SETTLEMENT = 'GET_COST_FREQUENCY_SETTLEMENT'

// COMMODITY INDEX RATE AVERAGE
export const COMMODITY_INDEX_RATE_AVERAGE = 'COMMODITY_INDEX_RATE_AVERAGE'
export const GET_COMMODITY_INDEX_RATE_AVERAGE = 'GET_COMMODITY_INDEX_RATE_AVERAGE'
//RAW MATERIAL APPROVAL
export const GET_RM_APPROVAL_LIST = 'GET_RM_APPROVAL_LIST'
export const GET_ALL_MASTER_APPROVAL_DEPARTMENT = 'GET_ALL_MASTER_APPROVAL_DEPARTMENT'
export const GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT = 'GET_ALL_MASTER_APPROVAL_USERS_BY_DEPARTMENT'

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
export const RAW_MATERIAL_DETAILS = 'RAW_MATERIAL_DETAILS'
export const EXCHANGE_RATE_DETAILS = 'EXCHANGE_RATE_DETAILS'



//PLANT MASTER
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS'
export const GET_PLANT_UNIT_SUCCESS = 'GET_PLANT_UNIT_SUCCESS'
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE'
export const GET_PLANT_FAILURE = 'GET_PLANT_FAILURE'
export const GET_PLANT_DATA_SUCCESS = 'GET_PLANT_DATA_SUCCESS'
export const GET_PLANT_FILTER_LIST = 'GET_PLANT_FILTER_LIST'
export const GET_PLANT_CODE_SELECT_LIST = 'GET_PLANT_CODE_SELECT_LIST'


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
export const GET_REPORTER_LIST = 'GET_REPORTER_LIST'

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
export const GET_ALL_BOP_DOMESTIC_DATA_LIST = 'GET_ALL_BOP_DOMESTIC_DATA_LIST'
export const GET_BOP_IMPORT_DATA_LIST = 'GET_BOP_IMPORT_DATA_LIST'
export const GET_SOB_LISTING = 'GET_SOB_LISTING'
export const GET_BOP_APPROVAL_LIST = 'GET_BOP_APPROVAL_LIST'
export const GET_INCO_SELECTLIST_SUCCESS = 'GET_INCO_SELECTLIST_SUCCESS'
export const GET_PAYMENT_SELECTLIST_SUCCESS = 'GET_PAYMENT_SELECTLIST_SUCCESS'
export const GET_VIEW_BOUGHT_OUT_PART_SUCCESS = 'GET_VIEW_BOUGHT_OUT_PART_SUCCESS'

//PROCESS MASTER
export const CREATE_PROCESS_SUCCESS = 'CREATE_PROCESS_SUCCESS'
export const CREATE_PROCESS_FAILURE = 'CREATE_PROCESS_FAILURE'
export const GET_PROCESS_LIST_SUCCESS = 'GET_PROCESS_LIST_SUCCESS'
export const GET_PROCESS_LIST_FAILURE = 'GET_PROCESS_LIST_FAILURE'
export const GET_PROCESS_UNIT_DATA_SUCCESS = 'GET_PROCESS_UNIT_DATA_SUCCESS'
export const GET_PROCESS_DATA_SUCCESS = 'GET_PROCESS_DATA_SUCCESS'
export const GET_INITIAL_PLANT_SELECTLIST_SUCCESS = 'GET_INITIAL_PLANT_SELECTLIST_SUCCESS'
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
export const GET_FUEL_BY_PLANT = 'GET_FUEL_BY_PLANT'
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
export const GET_OPERATION_COMBINED_DATA_LIST = 'GET_OPERATION_COMBINED_DATA_LIST'
export const GET_ALL_OPERATION_COMBINED_DATA_LIST = 'GET_ALL_OPERATION_COMBINED_DATA_LIST'

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
export const GET_GRID_HEIGHT = 'GET_GRID_HEIGHT'
export const GET_STATE_WHILE_DOWNLOADING = 'GET_STATE_WHILE_DOWNLOADING';
export const GET_DATA_WHILE_LOADING = 'GET_DATA_WHILE_LOADING';
export const CORRUGATED_DATA = 'CORRUGATED_DATA';
export const TOUR_START_DATA = 'TOUR_START_DATA';
export const GUIDE_BUTTON_SHOW = true;

//PAGINATION CONTROLS
export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const SET_PAGE_SIZE = 'SET_PAGE_SIZE';
export const INCREMENT_PAGE = 'INCREMENT_PAGE';
export const DECREMENT_PAGE = 'DECREMENT_PAGE';
export const SET_CURRENT_ROW_INDEX = 'SET_CURRENT_ROW_INDEX';
export const SET_FLOATING_FILTER_DATA = 'SET_FLOATING_FILTER_DATA';
export const SET_UPDATED_CURRENT_ROW_INDEX = 'SET_UPDATED_CURRENT_ROW_INDEX';
export const SET_UPDATED_PAGE_SIZE = 'SET_UPDATED_PAGE_SIZE';
export const SET_UPDATE_GLOBALE_TAKE = 'SET_UPDATE_GLOBALE_TAKE';
export const SET_UPDATED_PAGE_NUMBER = 'SET_UPDATED_PAGE_NUMBER';
export const RESET_STATE = 'RESET_STATE';
export const SET_SKIP = 'SET_SKIP';

//OPERATION
export const GET_OPERATION_SUCCESS = 'GET_OPERATION_SUCCESS'
export const GET_UNIT_OPERATION_DATA_SUCCESS = 'GET_UNIT_OPERATION_DATA_SUCCESS'
export const GET_OPERATION_APPROVAL_LIST = 'GET_OPERATION_APPROVAL_LIST'
export const SET_OPERATION_DATA = 'SET_OPERATION_DATA'
export const GET_OPERATION_SELECTLIST = 'GET_OPERATION_SELECTLIST'


//FREIGHT MASTER
export const CREATE_FREIGHT_SUCCESS = 'CREATE_FREIGHT_SUCCESS'
export const CREATE_FREIGHT_FAILURE = 'CREATE_FREIGHT_FAILURE'
export const GET_FREIGHT_SUCCESS = 'GET_FREIGHT_SUCCESS'
export const GET_FREIGHT_DATA_SUCCESS = 'GET_FREIGHT_DATA_SUCCESS'
export const GET_FREIGHT_FAILURE = 'GET_FREIGHT_FAILURE'
export const GET_FREIGHT_MODE_SELECTLIST = 'GET_FREIGHT_MODE_SELECTLIST'
export const GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST = 'GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST'
export const GET_FREIGHT_RATE_CRITERIA_SELECTLIST = 'GET_FREIGHT_RATE_CRITERIA_SELECTLIST'
export const GET_TRUCK_DIMENSIONS_SELECTLIST = 'GET_TRUCK_DIMENSIONS_SELECTLIST'

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
export const GET_LABOUR_TYPE_FOR_MACHINE_TYPE = 'GET_LABOUR_TYPE_FOR_MACHINE_TYPE'
export const UPDATE_LABOUR_FOR_MACHINE_TYPE = 'UPDATE_LABOUR_FOR_MACHINE_TYPE'

//OVERHEAD AND PROFIT
export const GET_OVERHEAD_PROFIT_SUCCESS = 'GET_OVERHEAD_PROFIT_SUCCESS'
export const GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS'
export const GET_OVERHEAD_PROFIT_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_DATA_SUCCESS'
export const GET_MODEL_TYPE_SELECTLIST = 'GET_MODEL_TYPE_SELECTLIST'
export const GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST = 'GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST'
export const GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST = 'GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST'
export const GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST = 'GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST'
export const GET_OVERHEAD_PROFIT_SUCCESS_ALL = 'GET_OVERHEAD_PROFIT_SUCCESS_ALL'

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
export const GET_LAST_SIMULATION_DATA = 'GET_LAST_SIMULATION_DATA'

//AUDIT

export const GET_LOGIN_AUDIT_SUCCESS = 'GET_LOGIN_AUDIT_SUCCESS'

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
export const SET_REJECTION_RECOVERY_DATA = 'SET_REJECTION_RECOVERY_DATA';
export const SET_IS_TOOLCOST_USED = 'SET_IS_TOOLCOST_USED';
export const GET_BULKUPLOAD_COSTING_LIST = 'GET_BULKUPLOAD_COSTING_LIST'
export const GET_PART_SELECTLIST_BY_TECHNOLOGY = 'GET_PART_SELECTLIST_BY_TECHNOLOGY'
export const BOP_DRAWER_LIST = 'BOP_DRAWER_LIST'
export const SET_PLASTIC_ARR = 'SET_PLASTIC_ARR'
export const SET_ASSEM_BOP_CHARGE = 'SET_ASSEM_BOP_CHARGE'
export const GET_TAX_CODE_SELECTLIST = 'GET_TAX_CODE_SELECTLIST'
export const SET_ARRAY_FOR_COSTING = 'SET_ARRAY_FOR_COSTING'
export const CHECK_IS_DATA_CHANGE = 'CHECK_IS_DATA_CHANGE'
export const CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE = 'CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE'
export const CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE = 'CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE'
export const CHECK_IS_TOOL_DATA_CHANGE = 'CHECK_IS_TOOL_DATA_CHANGE'
export const CHECK_IS_DISCOUNT_DATA_CHANGE = 'CHECK_IS_DISCOUNT_DATA_CHANGE'
export const CHECK_IS_PAYMENT_TERMS_DATA_CHANGE = 'CHECK_IS_PAYMENT_TERMS_DATA_CHANGE'
export const CHECK_HISTORY_COSTING_AND_SAP_PO_PRICE = 'CHECK_HISTORY_COSTING_AND_SAP_PO_PRICE'

export const SET_NEW_ARRAY_FOR_COSTING = 'SET_NEW_ARRAY_FOR_COSTING'
export const GET_FG_WISE_IMPACT_DATA_FOR_COSTING = 'GET_FG_WISE_IMPACT_DATA_FOR_COSTING'
export const SAVE_PART_NUMBER_STOP_API_CALL = 'SAVE_PART_NUMBER_STOP_API_CALL'
export const SET_PART_NUMBER_ARRAY_API_CALL = 'SET_PART_NUMBER_ARRAY_API_CALL'
export const SET_MESSAGE_FOR_ASSEMBLY = 'SET_MESSAGE_FOR_ASSEMBLY'
export const SET_PROCESS_GROUP_GRID = 'SET_PROCESS_GROUP_GRID'
export const SAVE_BOM_LEVEL_STOP_API_CALL = 'SAVE_BOM_LEVEL_STOP_API_CALL'
export const SAVE_ASSEMBLY_NUMBER_STOP_API_CALL = 'SAVE_ASSEMBLY_NUMBER_STOP_API_CALL'
export const SET_BREAKUP_BOP = 'SET_BREAKUP_BOP'
export const SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API = 'SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API'
export const SET_COSTING_MODE = 'SET_COSTING_MODE'
export const COSTING_ACC_OPEN_CLOSE_STATUS = 'COSTING_ACC_OPEN_CLOSE_STATUS'
export const SET_TOOL_COST_ICC = 'SET_TOOL_COST_ICC'
export const GET_COSTING_COST_DETAILS = 'GET_COSTING_COST_DETAILS'

export const GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA = 'GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA'
export const GET_TCO_DATA = 'GET_TCO_DATA'
export const SET_RFQ_COSTING_TYPE = 'SET_RFQ_COSTING_TYPE'
export const SET_EXCHANGE_RATE_SOURCE = 'SET_EXCHANGE_RATE_SOURCE'
export const SET_CURRENCY_SOURCE = 'SET_CURRENCY_SOURCE'
export const SET_EXCHANGE_RATE_DATA = 'SET_EXCHANGE_RATE_DATA'
export const SET_OPERATION_APPLICABILITY_SELECT = 'SET_OPERATION_APPLICABILITY_SELECT'
export const SET_PROCESS_APPLICABILITY_SELECT = 'SET_PROCESS_APPLICABILITY_SELECT'

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
export const SET_DISCOUNT_AND_OTHER_TAB_DATA = "SET_DISCOUNT_AND_OTHER_TAB_DATA"
export const SET_PACKAGE_AND_FREIGHT_TAB_DATA = 'SET_PACKAGE_AND_FREIGHT_TAB_DATA';
export const SET_TOOL_TAB_DATA = 'SET_TOOL_TAB_DATA';
export const GET_TOOL_TAB_DATA = 'GET_TOOL_TAB_DATA';
export const SET_TOOL_PROCESS_WISE_DATALIST = 'SET_TOOL_PROCESS_WISE_DATALIST';
export const SET_OTHER_DISCOUNT_TAB_DATA = 'SET_OTHER_DISCOUNT_TAB_DATA';
export const SET_EXCHANGE_RATE_CURRENCY_DATA = 'SET_EXCHANGE_RATE_CURRENCY_DATA';
export const SET_COMPONENT_ITEM_DATA = 'SET_COMPONENT_ITEM_DATA';
export const SET_COMPONENT_OVERHEAD_ITEM_DATA = 'SET_COMPONENT_OVERHEAD_ITEM_DATA';
export const SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA = 'SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA';
export const SET_COMPONENT_TOOL_ITEM_DATA = 'SET_COMPONENT_TOOL_ITEM_DATA';
export const SET_COMPONENT_DISCOUNT_ITEM_DATA = 'SET_COMPONENT_DISCOUNT_ITEM_DATA';
export const SET_COMPONENT_PAYMENT_TERMS_DATA = 'SET_COMPONENT_PAYMENT_TERMS_DATA';
export const GET_RM_DRAWER_DATA_LIST = 'GET_RM_DRAWER_DATA_LIST';
export const GET_PROCESS_DRAWER_DATA_LIST = 'GET_PROCESS_DRAWER_DATA_LIST';
export const SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA = 'SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA';
export const TOOL_CATEGORY_SELECTLIST = 'TOOL_CATEGORY_SELECTLIST';
export const SET_RMCC_ERRORS = 'SET_RMCC_ERRORS';
export const SET_COSTING_EFFECTIVE_DATE = 'SET_COSTING_EFFECTIVE_DATE';
export const CLOSE_OPEN_ACCORDION = 'CLOSE_OPEN_ACCORDION';
export const IS_COSTING_EFFECTIVE_DATE_DISABLED = 'IS_COSTING_EFFECTIVE_DATE_DISABLED';
export const SET_CUTOFF_RMC = 'SET_CUTOFF_RMC';
export const GET_COSTING_SPECIFIC_TECHNOLOGY = 'GET_COSTING_SPECIFIC_TECHNOLOGY'
export const FORGING_CALCULATOR_MACHININGSTOCK_SECTION = 'FORGING_CALCULATOR_MACHININGSTOCK_SECTION';
export const FERROUS_CALCULATOR_RESET = 'FERROUS_CALCULATOR_RESET';
export const RUBBER_CALCULATOR_RESET = 'RUBBER_CALCULATOR_RESET';
export const SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION = 'SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION'
export const SET_MASTER_BATCH_OBJ = 'SET_MASTER_BATCH_OBJ'
export const SELECTED_IDS_OF_OPERATION = 'SELECTED_IDS_OF_OPERATION'
export const SELECTED_PROCESS_AND_GROUPCODE = 'SELECTED_PROCESS_AND_GROUPCODE'
export const SET_PROCESS_ID = 'SET_PROCESS_ID'
export const SET_PROCESSGROUP_ID = 'SET_PROCESSGROUP_ID'
export const SET_SURFACE_COST_FOR_REJECTION_DATA = 'SET_SURFACE_COST_FOR_REJECTION_DATA';
export const SET_OVERHEAD_PROFIT_ERRORS = 'SET_OVERHEAD_PROFIT_ERRORS'
export const SET_TOOLS_ERRORS = 'SET_TOOLS_ERRORS'
export const SET_DISCOUNT_ERRORS = 'SET_DISCOUNT_ERRORS'
export const SET_REJECTED_COSTING_VIEW_DATA = 'SET_REJECTED_COSTING_VIEW_DATA';
export const RESET_EXCHANGE_RATE_DATA = 'RESET_EXCHANGE_RATE_DATA'
export const SET_CALL_ST_API = 'SET_CALL_ST_API';
export const GET_COSTING_PAYMENT_TERM_DETAIL = "GET_COSTING_PAYMENT_TERM_DETAIL"
export const SET_PAYMENT_TERM_COST = "SET_PAYMENT_TERM_COST"
export const SET_COSTING_VIEW_DATA_FOR_ASSEMBLY = 'SET_COSTING_VIEW_DATA_FOR_ASSEMBLY';
export const GET_RM_DETAILS = 'GET_RM_DETAILS';
export const GET_BOP_DETAILS = 'GET_BOP_DETAILS';
export const GET_CARRIER_TYPE_LIST_SUCCESS = 'GET_CARRIER_TYPE_LIST_SUCCESS';
export const SET_PACKAGING_CALCULATOR_AVAILABLE = 'SET_PACKAGING_CALCULATOR_AVAILABLE';
export const SET_FREIGHT_CALCULATOR_AVAILABLE = 'SET_FREIGHT_CALCULATOR_AVAILABLE';
export const GET_PAINT_COAT_LIST = 'GET_PAINT_COAT_LIST';
export const GET_TYPE_OF_COST_SUCCESS = 'GET_TYPE_OF_COST_SUCCESS';
export const GET_CALCULATION_CRITERIA_LIST_SUCCESS = 'GET_CALCULATION_CRITERIA_LIST_SUCCESS';

// YOY
export const SET_YOY_COST_GRID = 'SET_YOY_COST_GRID'
export const SET_TOOL_COST_FOR_OVERHEAD_PROFIT = 'SET_TOOL_COST_FOR_OVERHEAD_PROFIT'
export const SET_NPV_DATA = 'SET_NPV_DATA'
export const SET_OTHER_COST = 'SET_OTHER_COST'
export const SET_OTHER_DISCOUNT_DATA = 'SET_OTHER_DISCOUNT_DATA'
export const SET_OVERHEAD_PROFIT_ICC = 'SET_OVERHEAD_PROFIT_ICC'
export const SET_YOY_COST_GRID_FOR_SAVE = 'SET_YOY_COST_GRID_FOR_SAVE'
export const SET_QUOTATION_ID_FOR_RFQ = 'SET_QUOTATION_ID_FOR_RFQ'

//WEIGHT CALCULATION COSTING RM DRAWER
export const GET_RAW_MATERIAL_CALCI_INFO = 'GET_RAW_MATERIAL_CALCI_INFO'

// ASSEMBLY TECHNOLOGY API
export const GET_SETTLED_COSTING_DETAILS = 'GET_SETTLED_COSTING_DETAILS'
export const GET_SETTLED_COSTING_DETAILS_VIEW = 'GET_SETTLED_COSTING_DETAILS_VIEW'

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
export const GET_RFQ_USER_DATA_SUCCESS = 'GET_RFQ_USER_DATA_SUCCESS'
export const GET_USER_UNIT_DATA_SUCCESS = 'GET_USER_UNIT_DATA_SUCCESS'
export const GET_USERS_BY_TECHNOLOGY_AND_LEVEL = 'GET_USERS_BY_TECHNOLOGY_AND_LEVEL'
export const GET_LEVEL_BY_TECHNOLOGY = 'GET_LEVEL_BY_TECHNOLOGY'
export const GET_SIMULATION_LEVEL_BY_TECHNOLOGY = 'GET_SIMULATION_LEVEL_BY_TECHNOLOGY'
export const GET_MASTER_LEVEL_BY_MASTERID = 'GET_MASTER_LEVEL_BY_MASTERID'
export const COSTINGS_APPROVAL_DASHBOARD = 'COSTINGS_APPROVAL_DASHBOARD'
export const AMENDMENTS_APPROVAL_DASHBOARD = 'AMENDMENTS_APPROVAL_DASHBOARD'
export const GRANT_USER_WISE_DATA = 'GRANT_USER_WISE_DATA'
export const GET_ONBOARDING_LEVEL_BY_ID = 'GET_ONBOARDING_LEVEL_BY_ID'
//ROLE
export const GET_ROLE_SUCCESS = 'GET_ROLE_SUCCESS'
export const GET_UNIT_ROLE_DATA_SUCCESS = 'GET_UNIT_ROLE_DATA_SUCCESS'
export const GET_ROLES_SELECTLIST_SUCCESS = 'GET_ROLES_SELECTLIST_SUCCESS'

//LEVEL USERS
export const GET_LEVEL_USER_SUCCESS = 'GET_LEVEL_USER_SUCCESS'
export const GET_UNIT_LEVEL_DATA_SUCCESS = 'GET_UNIT_LEVEL_DATA_SUCCESS'
export const LEVEL_MAPPING_API = 'LEVEL_MAPPING_API'
export const SIMULATION_LEVEL_DATALIST_API = 'SIMULATION_LEVEL_DATALIST_API'
export const GET_MASTER_SELECT_LIST = 'GET_MASTER_SELECT_LIST'
export const MASTER_LEVEL_DATALIST_API = 'MASTER_LEVEL_DATALIST_API'
export const ONBOARDING_LEVEL_DATALIST_API = 'ONBOARDING_LEVEL_DATALIST_API'
export const ONBOARDING_LEVEL_API = 'ONBOARDING_LEVEL_API'
export const MANAGE_LEVEL_TAB_API = 'MANAGE_LEVEL_TAB_API'

//DEPARTMENT
export const GET_DEPARTMENT_SUCCESS = 'GET_DEPARTMENT_SUCCESS'
export const GET_UNIT_DEPARTMENT_DATA_SUCCESS = 'GET_UNIT_DEPARTMENT_DATA_SUCCESS'
export const GET_TECHNOLOGY_DATA_LIST_SUCCESS = 'GET_TECHNOLOGY_DATA_LIST_SUCCESS'
export const GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS = 'GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS'
export const GET_PLANT_SELECT_LIST_FOR_DEPARTMENT = 'GET_PLANT_SELECT_LIST_FOR_DEPARTMENT'

//DIVISION
export const GET_DIVISION_SUCCESS = 'GET_DIVISION_SUCCESS'
export const GET_DIVISION_DATA_SUCCESS = 'GET_DIVISION_DATA_SUCCESS'
export const GET_DIVISION_LIST_SUCCESS = 'GET_DIVISION_LIST_SUCCESS'
export const GET_DIVISION_LIST_FOR_DEPARTMENT = 'GET_DIVISION_LIST_FOR_DEPARTMENT'

//Common to get plants by supplier
export const GET_PLANTS_BY_SUPPLIER = 'GET_PLANTS_BY_SUPPLIER'


//APPROVAL
export const GET_SEND_FOR_APPROVAL_SUCCESS = 'GET_SEND_FOR_APPROVAL_SUCCESS'
export const GET_ALL_APPROVAL_DEPARTMENT = 'GET_ALL_APPROVAL_DEPARTMENT'
export const GET_ALL_APPROVAL_USERS_BY_DEPARTMENT = 'GET_ALL_APPROVAL_USERS_BY_DEPARTMENT'
export const GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT = 'GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT'
export const GET_ALL_REASON_SELECTLIST = 'GET_ALL_REASON_SELECTLIST'
export const GET_APPROVAL_LIST = 'GET_APPROVAL_LIST'
export const GET_APPROVAL_LIST_DRAFT = 'GET_APPROVAL_LIST_DRAFT'
export const GET_APPROVAL_SUMMARY = 'GET_APPROVAL_SUMMARY'
export const GET_SELECTED_COSTING_STATUS = 'GET_SELECTED_COSTING_STATUS'
export const GET_SELECTLIST_SIMULATION_TOKENS = 'GET_SELECTLIST_SIMULATION_TOKENS'


//PRIVILEGE
export const GET_MODULE_SELECTLIST_SUCCESS = 'GET_MODULE_SELECTLIST_SUCCESS'
export const GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS = 'GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS'
export const GET_PAGES_SELECTLIST_SUCCESS = 'GET_PAGES_SELECTLIST_SUCCESS'
export const GET_ACTION_HEAD_SELECTLIST_SUCCESS = 'GET_ACTION_HEAD_SELECTLIST_SUCCESS'
export const GET_MENU_BY_USER_DATA_SUCCESS = 'GET_MENU_BY_USER_DATA_SUCCESS'
export const GET_LEFT_MENU_BY_MODULE_ID_AND_USER = 'GET_LEFT_MENU_BY_MODULE_ID_AND_USER'
export const GET_MENU_BY_MODULE_ID_AND_USER = 'GET_MENU_BY_MODULE_ID_AND_USER'
export const GET_TOP_AND_LEFT_MENU_DATA = 'GET_TOP_AND_LEFT_MENU_DATA'

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
export const GET_ALL_MACHINE_DATALIST_SUCCESS = 'GET_ALL_MACHINE_DATALIST_SUCCESS'
export const GET_DEPRECIATION_SELECTLIST_SUCCESS = 'GET_DEPRECIATION_SELECTLIST_SUCCESS'
export const GET_MACHINE_APPROVAL_LIST = 'GET_MACHINE_APPROVAL_LIST'
export const SET_PROCESS_GROUP_FOR_API = 'SET_PROCESS_GROUP_FOR_API'
export const SET_PROCESS_GROUP_LIST = 'SET_PROCESS_GROUP_LIST'
export const STORE_PROCESS_LIST = 'STORE_PROCESS_LIST'

//POWER MASTER
export const GET_POWER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_TYPE_SELECTLIST_SUCCESS'
export const GET_CHARGE_TYPE_SELECTLIST_SUCCESS = 'GET_CHARGE_TYPE_SELECTLIST_SUCCESS'
export const GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS'
export const GET_UOM_SELECTLIST_SUCCESS = 'GET_UOM_SELECTLIST_SUCCESS'
export const GET_POWER_DATALIST_SUCCESS = 'GET_POWER_DATALIST_SUCCESS'
export const GET_POWER_DATA_SUCCESS = 'GET_POWER_DATA_SUCCESS'
export const GET_UOM_SELECTLIST_BY_UNITTYPE = 'GET_UOM_SELECTLIST_BY_UNITTYPE'
export const GET_PLANT_CURRENCY_BY_PLANT_IDS = 'GET_PLANT_CURRENCY_BY_PLANT_IDS'

//CURRENCY EXCHANGE
export const GET_CURRENCY_SELECTLIST_SUCCESS = 'GET_CURRENCY_SELECTLIST_SUCCESS'

//VOLUME MASTER
export const GET_VOLUME_DATA_SUCCESS = 'GET_VOLUME_DATA_SUCCESS'
export const GET_FINANCIAL_YEAR_SELECTLIST = 'GET_FINANCIAL_YEAR_SELECTLIST'
export const GET_VOLUME_DATA_BY_PART_AND_YEAR = 'GET_VOLUME_DATA_BY_PART_AND_YEAR'
export const GET_VOLUME_DATA_LIST = 'GET_VOLUME_DATA_LIST'
export const GET_VOLUME_DATA_LIST_FOR_DOWNLOAD = 'GET_VOLUME_DATA_LIST_FOR_DOWNLOAD'
export const GET_VOLUME_LIMIT = 'GET_VOLUME_LIMIT'
export const CHECK_REGULARIZATION_LIMIT = 'CHECK_REGULARIZATION_LIMIT'
//CLIENT MASTER
export const GET_CLIENT_DATA_SUCCESS = 'GET_CLIENT_DATA_SUCCESS';
export const GET_CLIENT_SELECTLIST_SUCCESS = 'GET_CLIENT_SELECTLIST_SUCCESS';
export const GET_CLIENT_DATALIST_SUCCESS = 'GET_CLIENT_DATALIST_SUCCESS';
export const GET_POAM_STATUS_SELECTLIST = 'GET_POAM_STATUS_SELECTLIST'

//EXCHANGE RATE MASTER
export const EXCHANGE_RATE_DATALIST = 'EXCHANGE_RATE_DATALIST'
export const GET_EXCHANGE_RATE_DATA = 'GET_EXCHANGE_RATE_DATA'
export const GET_CURRENCY_SELECTLIST_BY = 'GET_CURRENCY_SELECTLIST_BY'

//TAX DETAIL MASTER
export const GET_TAX_DETAILS_DATALIST = 'GET_TAX_DETAILS_DATALIST'
export const GET_TAX_DETAILS_DATA = 'GET_TAX_DETAILS_DATA'

//COMPANY
export const GET_COMPANY_SELECTLIST = 'GET_COMPANY_SELECTLIST'

//OUTSOURCING
export const GET_OUTSOURCING_DATA = 'GET_OUTSOURCING_DATA'
export const GET_ALL_OUTSOURCING_DATA = 'GET_ALL_OUTSOURCING_DATA'
export const GET_OUTSOURCING_DATA_FOR_DOWNLOAD = 'GET_OUTSOURCING_DATA_FOR_DOWNLOAD'

//SIMULATION
export const GET_SIMULATION_HISTORY = 'GET_SIMULATION_HISTORY'
export const GET_SELECTLIST_MASTERS = 'GET_SELECTLIST_MASTERS'
export const GET_VERIFY_SIMULATION_LIST = 'GET_VERIFY_SIMULATION_LIST'
export const GET_COSTING_SIMULATION_LIST = 'GET_COSTING_SIMULATION_LIST'
export const GET_SIMULATION_APPROVAL_LIST = 'GET_SIMULATION_APPROVAL_LIST'
export const GET_SIMULATION_APPROVAL_LIST_DRAFT = 'GET_SIMULATION_APPROVAL_LIST_DRAFT'
export const SET_SELECTED_MASTER_SIMULATION = 'SET_SELECTED_MASTER_SIMULATION'
export const GET_SELECTLIST_APPLICABILITY_HEAD = 'GET_SELECTLIST_APPLICABILITY_HEAD'
export const SET_SELECTED_TECHNOLOGY_SIMULATION = 'SET_SELECTED_TECHNOLOGY_SIMULATION'
export const SET_TOKEN_CHECK_BOX = 'SET_TOKEN_CHECK_BOX'
export const GET_APPROVAL_SIMULATION_COSTING_SUMMARY = 'GET_APPROVAL_SIMULATION_COSTING_SUMMARY'
export const SET_ATTACHMENT_FILE_DATA = 'SET_ATTACHMENT_FILE_DATA'
export const GET_COMBINED_PROCESS_LIST = 'GET_COMBINED_PROCESS_LIST'          						//RE
export const GET_FG_WISE_IMPACT_DATA = ' GET_FG_WISE_IMPACT_DATA'          						//RE
export const GET_VERIFY_MACHINERATE_SIMULATION_LIST = 'GET_VERIFY_MACHINERATE_SIMULATION_LIST'          						//RE
export const GET_ASSEMBLY_SIMULATION_LIST = 'GET_ASSEMBLY_SIMULATION_LIST'
export const GET_ASSEMBLY_SIMULATION_LIST_SUMMARY = 'GET_ASSEMBLY_SIMULATION_LIST_SUMMARY'
export const SET_DATA_TEMP = 'SET_DATA_TEMP'
export const GET_VERIFY_OVERHEAD_SIMULATION_LIST = 'GET_VERIFY_OVERHEAD_SIMULATION_LIST'
export const GET_VERIFY_PROFIT_SIMULATION_LIST = 'GET_VERIFY_PROFIT_SIMULATION_LIST'
export const SET_SHOW_SIMULATION_PAGE = 'SET_SHOW_SIMULATION_PAGE'
export const GET_TOKEN_SELECT_LIST = 'GET_TOKEN_SELECT_LIST'
export const GET_VALUE_TO_SHOW_COSTING_SIMULATION = 'GET_VALUE_TO_SHOW_COSTING_SIMULATION'
export const GET_KEYS_FOR_DOWNLOAD_SUMMARY = 'GET_KEYS_FOR_DOWNLOAD_SUMMARY'
export const SET_KEY_FOR_API_CALLS = 'SET_KEY_FOR_API_CALLS'
export const SET_TOKEN_FOR_SIMULATION = 'SET_TOKEN_FOR_SIMULATION'
export const GET_AMMENDENT_STATUS_COSTING = 'GET_AMMENDENT_STATUS_COSTING'
export const GET_MASTER_SELECT_LIST_SIMUALTION = 'GET_MASTER_SELECT_LIST_SIMUALTION'
export const SET_SELECTED_ROW_FOR_PAGINATION = 'SET_SELECTED_ROW_FOR_PAGINATION'
export const SET_BOP_ASSOCIATION = 'SET_BOP_ASSOCIATION'
export const SET_SIMULATION_APPLICABILITY = 'SET_SIMULATION_APPLICABILITY'
export const SET_EXCHANGE_RATE_LIST_BEFORE_DRAFT = 'SET_EXCHANGE_RATE_LIST_BEFORE_DRAFT'
export const SET_SELECTED_CUSTOMER_SIMULATION = 'SET_SELECTED_CUSTOMER_SIMULATION'
export const GET_SELECTLIST_COSTING_HEADS = 'GET_SELECTLIST_COSTING_HEADS'
export const SET_EFFECTIVE_DATE = 'SET_EFFECTIVE_DATE';
export const GET_SIMULATION_COSTING_STATUS = 'GET_SIMULATION_COSTING_STATUS'
export const SET_IS_PENDING_SIMULATION_FROM_OTHER_DIV = 'SET_IS_PENDING_SIMULATION_FROM_OTHER_DIV'
export const GET_IMPACTED_DATA_LIST = 'GET_IMPACTED_DATA_LIST'
export const SET_RAW_MATERIALS_EFFECTIVE_DATE = 'SET_RAW_MATERIALS_EFFECTIVE_DATE';
export const SET_LIST_TOGGLE = 'SET_LIST_TOGGLE'


// ASSEMBLY TECHNOLOGY
export const SET_SELECTED_VENDOR_SIMULATION = 'SET_SELECTED_VENDOR_SIMULATION'
export const GET_ALL_MULTI_TECHNOLOGY_COSTING = 'GET_ALL_MULTI_TECHNOLOGY_COSTING'

//SIMULATION APPROVAL
export const GET_SIMULATION_DEPARTMENT_LIST = 'GET_SIMULATION_DEPARTMENT_LIST'
export const GET_IMPACTED_MASTER_DATA = 'GET_IMPACTED_MASTER_DATA'

// REPORT
export const GET_REPORT_LIST = 'GET_REPORT_LIST'
export const GET_SIMULATION_INSIGHT_REPORT = 'GET_SIMULATION_INSIGHT_REPORT'          						//RE

export const RM_APPROVAL_DASHBOARD = 'RM_APPROVAL_DASHBOARD'          						//RE
export const GET_ALL_REPORT_LIST = 'GET_ALL_REPORT_LIST'
export const GET_BENCHMARK_MASTER_LIST = 'GET_BENCHMARK_MASTER_LIST'
export const GET_COST_RATIO_REPORT = 'GET_COST_RATIO_REPORT'
export const GET_REPORT_FORM_GRID_DATA = 'GET_REPORT_FORM_GRID_DATA'
export const GET_DATA_FROM_REPORT = 'GET_DATA_FROM_REPORT'
export const GET_PRODUCT_LIST = 'GET_PRODUCT_LIST'
export const GET_PRODUCT_PART_DATA_LIST = 'GET_PRODUCT_PART_DATA_LIST'
export const GET_STAGE_OF_PART_DETAILS = 'GET_STAGE_OF_PART_DETAILS'
//MINDA
export const GET_NFR_INSIGHT_DETAILS = 'GET_NFR_INSIGHT_DETAILS'
export const GET_NFR_INSIGHT_STATUS_DETAILS = 'GET_NFR_INSIGHT_STATUS_DETAILS'

//RFQ CONSTANTS
export const GET_QUOTATION_BY_ID = 'GET_QUOTATION_BY_ID'
export const GET_QUOTATION_LIST = 'GET_QUOTATION_LIST'
export const GET_QUOTATION_DETAILS_LIST = 'GET_QUOTATION_DETAILS_LIST'
export const CHECK_RFQ_BULK_UPLOAD = 'CHECK_RFQ_BULK_UPLOAD'
export const SELECTED_ROW_ARRAY = 'SELECTED_ROW_ARRAY'
export const GET_NFR_SELECT_LIST = 'GET_NFR_SELECT_LIST'
export const SET_SAP_DATA = 'SET_SAP_DATA'
export const GET_ASSEMBLY_CHILD_SELECT_LIST = 'GET_ASSEMBLY_CHILD_SELECT_LIST'
export const GET_RFQ_VENDOR_DETAIL = 'GET_RFQ_VENDOR_DETAIL'
export const GET_TARGET_PRICE = 'GET_TARGET_PRICE'
export const GET_ASSEMBLY_CHILD_PART = "GET_ASSEMBLY_CHILD_PART"
export const GET_RFQ_PART_DETAILS = "GET_RFQ_PART_DETAILS"
export const GET_RFQ_RAISE_NUMBER = "GET_RFQ_RAISE_NUMBER"
export const PARTSPECIFICATIONRFQDATA = 'PARTSPECIFICATIONRFQDATA'
export const GET_PART_IDENTITY = "GET_PART_IDENTITY"
export const GET_QUOTATION_ID_FOR_RFQ = "GET_QUOTATION_ID_FOR_RFQ"
export const HAVELLS_DESIGN_PARTS = "Havells Design part"
export const GET_SAP_EVALUATIONTYPE = "GET_SAP_EVALUATIONTYPE"
export const SET_RM_SPECIFIC_ROW_DATA = "SET_RM_SPECIFIC_ROW_DATA"
export const SELECT_BOP_NUMBER = "SELECT_BOP_NUMBER"
export const SELECT_BOP_CATEGORY = "SELECT_BOP_CATEGORY"
export const SET_BOP_SPECIFIC_ROW_DATA = "SET_BOP_SPECIFIC_ROW_DATA"
export const GET_BOP_PR_QUOTATION_DETAILS = "GET_BOP_PR_QUOTATION_DETAILS"
export const SET_BOP_PR_QUOTATION_IDENTITY = "SET_BOP_PR_QUOTATION_IDENTITY"
export const GET_RFQ_TOOLING_DETAILS = "GET_RFQ_TOOLING_DETAILS"
export const UPDATED_TOOLING_DATA = "UPDATED_TOOLING_DATA"
export const SET_TOOLING_SPECIFIC_ROW_DATA = "SET_TOOLING_SPECIFIC_ROW_DATA"
export const SET_SAP_DETAIL_KEYS = "SET_SAP_DETAIL_KEYS"
export const BEST_COSTING_DATA = "BEST_COSTING_DATA"

//AUCTION 
export const SET_AUCTION_DATA = 'SET_AUCTION_DATA'
export const SET_AUCTION_DATA_BY_RFQ = 'SET_AUCTION_DATA_BY_RFQ'
export const SELECT_AUCTION_RFQ_LIST = 'SELECT_AUCTION_RFQ_LIST'
export const AUCTION_LIST_BY_STATUS = 'AUCTION_LIST_BY_STATUS'
export const SHOW_HIDE_BID_WINDOW = 'SHOW_HIDE_BID_WINDOW'
export const GET_BID_DETAIL_BY_QUATATION = 'GET_BID_DETAIL_BY_QUATATION'
export const GET_HEADER_DETAIL_BY_QUATATION = 'GET_HEADER_DETAIL_BY_QUATATION'
export const GET_DELEGATEE_USER_LIST_SUCCESS = 'GET_DELEGATEE_USER_LIST_SUCCESS'

export const AuctionScheduledId = 35
export const AuctionClosedId = 37
export const AuctionLiveId = 38
// NFR
export const NFR_DETAILS_FOR_DISCOUNT = 'NFR_DETAILS_FOR_DISCOUNT'
export const SET_OPEN_ALL_TABS = 'SET_OPEN_ALL_TABS'
export const SELECT_PURCHASE_REQUISITION = 'SELECT_PURCHASE_REQUISITION'

//SIMULATION FOR INDEXED RM
export const GET_INDEXED_RM_FOR_SIMULATION = 'GET_INDEXED_RM_FOR_SIMULATION'

//COSTING STATUS
export const GET_COSTING_STATUS = 'GET_COSTING_STATUS'
export const DRAFT = 'Draft'
export const PENDING = 'PendingForApproval'
export const WAITING_FOR_APPROVAL = 'AwaitingApproval'
export const APPROVED = 'Approved'
export const REJECTED = 'Rejected'
export const RETURNED = 'Returned'
export const NON_AWARDED = 'Non Awarded'
export const AWARDED = 'Awarded'
export const HISTORY = 'History'
export const FINAL_APPROVAL = 'Final Approval'
export const CREATED_BY_ASSEMBLY = 'CreatedByAssembly'
export const APPROVED_BY_SIMULATION = 'ApprovedBySimulation'
export const PUSHED = 'Pushed'
export const ERROR = 'Error'
export const POUPDATED = 'POUpdated'
export const LINKED = 'Linked'
export const REJECTED_BY_SYSTEM = 'RejectedBySystem'
export const UNDER_APPROVAL = 'UnderApproval'
export const CANCELLED = 'Cancelled'
export const UNDER_REVISION = 'UnderRevision'
export const RECEIVED = 'Received'
export const SUBMITTED = 'Submitted'
export const SENT = 'Sent'
export const EXTERNAL_REJECT = 'ExternalReject'
export const PREDRAFT = 'PreDraft'
export const DRAFTID = 1
export const REJECTEDID = 4
export const ERRORID = 12
export const PENDING_FOR_APPROVAL_ID = 2
export const AWAITING_APPROVAL_ID = 6

// MASTER APPROVAL STATUS ID
export const APPROVED_STATUS = '3'
export const APPROVAL_CYCLE_STATUS_MASTER = '3,5'
export const NON_APPROVAL_CYCLE_STATUS_MASTER = '3,5,1'
// export const APPROVED_STATUS_MASTER = '3,5' //MINDA

//DECIMAL VALUES FOR PRICE
export const TWO_DECIMAL_PRICE = 2
export const FOUR_DECIMAL_PRICE = 4

//DECIMAL VALUES FOR WEIGHT
export const FIVE_DECIMAL_WEIGHT = 5
//OVERHEAD AND PROCESS APPLICABILITY IDS
export const APPLICABILITY_OVERHEAD = 'Overhead';
export const APPLICABILITY_PROFIT = 'Profit';
export const APPLICABILITY_OVERHEAD_PROFIT = 'Overhead + Profit';
export const APPLICABILITY_OVERHEAD_EXCL = 'Overhead(Excluding Int. + Dep.)';
export const APPLICABILITY_PROFIT_EXCL = 'Profit(Excluding Int. + Dep.)';
export const APPLICABILITY_OVERHEAD_PROFIT_EXCL = 'Overhead + Profit(Excluding Int. + Dep.)';
export const APPLICABILITY_OVERHEAD_EXCL_PROFIT = 'Overhead(Excluding Int. + Dep.) + Profit';
export const APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL = 'Overhead(Excluding Int. + Dep.) + Profit(Excluding Int. + Dep.)';
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
export const RFQ = 'RFQ'
export const ONBOARDING = 'Onboarding & Management'
export const VENDOR_MANAGEMENT = 'Vendor Classification Status'
export const LPS = 'LPS Rating Status'
export const RFQVendor = 'RFQ-Vendor'
export const AUCTION = 'Reverse Auction'


export const APPROVAL_LISTING = 'Approval Listing'
export const VENDOR_MANAGEMENT_ROLE = 'Vendor Management'

//PAGE NAMES
export const DASHBOARD = 'Dashboard'
export const DASHBOARDWITHGRAPH = 'DashboardWithGraph'
export const RAW_MATERIAL = 'Raw Material'
export const RAW_MATERIAL_NAME_AND_GRADE = 'Raw Material Name and Grade'
export const BOP = 'BOP'
export const PART = 'Part'
export const MACHINE = 'Machine'
export const VENDOR = 'Vendor'
export const CLIENT = 'Customer'
export const PLANT = 'Plant'
export const INDEXATION = 'Material Indexation'

export const PRODUCT = 'Product'
export const PRODUCT_ID = '4'
//level manage

export const MODULE_COSTING = 'Costing'
export const MODULE_SIMULATION = 'Simulation'
export const MODULE_MASTER = 'Master'
export const MODULE_ONBOARDING = 'Onboarding&Management'
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
export const COSTING_SUMMARY_ = 'Costing Summary'
export const APPROVAL_APP = 'Approval Status'
export const TAX = 'Tax'
export const COSTING_BREAKUP_DETAILS_REPORT = 'Costing Breakup Details'
export const SIMULATION_APPROVAL_SUM = ' Simulation Approval Summary'
export const SIMULATION_INSIGNTS = 'Simulation Insignts'
export const COSTING_DETAIL = 'Costing Details'
export const COST_RATIO_REPORT = 'Cost Ratio'
export const COST_MOVEMENT_REPORT = 'Cost Movement'
export const MASTER_BENCHMARK_REPORT = 'Master Benchmark'
export const SUPPLIER_CONTRIBUTION_REPORT = 'Supplier Contribution'
export const SALE_PROVISION_REPORT = 'Sale Provision'
export const PURCHASE_PROVISION_REPORT = 'Purchase Provision'
export const CUSTOMER_POAM_REPORT = 'Customer POAM Summary'
export const BUDGETING = 'Budgeting'
export const SALES_PROVISION_FILE_NAME = 'Sales Provision Report'
export const PURCHASE_PROVISION_FILE_NAME = 'Purchase Provision Report'
export const SALES_PROVISION_REPORT = 'Sales Provision Report'          						//RE
// export const PURCHASE_PROVISION_REPORT = 'Purchase Provision Report'          						//RE
export const MASTER_COST_MOVEMENT_REPORT = 'Master Cost Movement'
export const CUSTOMER_POAM_SUMMARY_REPORT = 'Customer Poam Summary Report'
export const MASTER_MOVEMENT_REPORT = 'Master Movement Report'
export const GOT_GIVEN_REPORT = "Got Given Report"
export const HEAD_WISE_COSTING_GOT_GIVEN = "Head Wise Costing Got Given"
export const PLANT_HEAD_WISE = "Plant Head Wise"
export const CUSTOMER_POAM_IMPACT = "Customer POAM Impact"
export const OUTSOURCING = "Outsourcing"
export const INSIGHT_SIMULATION_REPORT = "Simulation Insights"
export const NFR_INSIGHT_DETAILS = 'NFR Insights' //MINDA
export const lOGIN_AUDIT = 'Login Audit'
export const VENDOR_CLASSIFICATION = 'Vendor Classification Status'
export const INITIATE_UNBLOCKING = 'Initiate Unblocking'
export const LPS_RATING = 'LPS Rating Status'
//export const SIMULATION_HISTORY = 'Simulation History'

export const SHEET_METAL = 'Sheet Metal';
export const PLASTICNAME = 'Plastic';
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
export const FORGINGNAME = 'Forging';
// export const FORGING = 'Forging & Machining';          						//RE
export const FORGING = 'Forging';//MINDA
export const FASTNERS = 'Fastners';
export const RIVETS = 'Rivet';
export const MECHANICAL_PROPRIETARY = 'Mechanical Proprietary';
export const ELECTRICAL_PROPRIETARY = 'Electrical Proprieratary';
export const DIECASTING = 'Die Casting'
export const LOGISTICS = 'Logistics'
export const CORRUGATEDBOX = 'Corrugated Box'
export const FABRICATION = 'Fabrication'
export const FERROUSCASTING = 'Ferrous Casting'
export const WIREFORMING = 'Wire Forming'
export const ELECTRIC = 'Electric'
export const ELECTRONICSNAME = 'Electronics'
export const TOOLING = 'Tooling'
export const COSTING_BULKUPLOAD = 'Costing Bulk Upload'
export const COMBINED_PROCESS_NAME = 'Combined Process';          						//RE
export const ZBC_COSTING = 'Costing - ZBC';
export const VBC_COSTING = 'Costing - VBC';
export const CBC_COSTING = 'Costing - CBC';
export const NCC_COSTING = 'Costing - NCC';
export const WAC_COSTING = 'Costing - WAC';

export const costingTypeLabel = [ZBC_COSTING, VBC_COSTING, CBC_COSTING, NCC_COSTING, WAC_COSTING]

export const USER = 'User'
export const ROLE = 'Role'
export const DEPARTMENT = 'Department'
export const LEVELS = 'Levels'
export const COMPANY = 'Company'//MINDA
export const RFQUSER = 'RFQUser'
export const DELEGATION = 'Delegation'
export const DIVISION = 'Division'
export const SELF_DELEGATION = 'Self Delegation'
export const ON_BEHALF_DELEGATION = 'On Behalf Delegation'

//DEPRECIATION TYPE ENUMS
export const SLM = 'SLM'
export const WDM = 'WDM'

export const ZBC = 'ZBC'
export const VBC = 'VBC'
export const NCC = 'NCC'
export const WAC = 'WAC'
export const CBC = 'CBC'
export const NFR = 'NFR'
export const PFS1 = 'PFS1'
export const PFS2 = 'PFS2'
export const PFS3 = 'PFS3'
export const CUD = 'CUD'
export const LPSUD = 'LPSUD'
export const ReleaseStrategyB1 = 'RSB1'
export const ReleaseStrategyB2 = 'RSB2'
export const ReleaseStrategyB3 = 'RSB3'
export const ReleaseStrategyB4 = 'RSB4'
export const ReleaseStrategyB6 = 'RSB6'
export const VendorNeedForm = 'VNF'
export const RAWMATERIAL = 'Raw Materials'
//PART TYPE'S USED AT ASSEMBLY CHILD DRAWER
export const ASSEMBLYNAME = 'Assembly'
export const COMPONENT_PART = 'Component'
export const BOUGHTOUTPART = 'BoughtOutPart'
export const BOUGHTOUTPARTSPACING = 'Bought Out Part'
export const TOOLINGPART = 'Tooling'
export const Assembly = '1'
export const BoughtOutPart = '3'
export const Component = '2'
export const Product = '4'
export const ToolingId = '5'
export const COMPONENTASSEMBLY = "componentAssembly"


export const COSTING_PATH = '/costing'
export const COSTING_SUMMARY = '/costing-summary'
export const APPROVAL_SUMMARY_PATH = '/approval-summary'
export const APPROVAL_LISTING_PATH = '/approval-listing'
export const COSTING_BULK_UPLOAD = "/costing-bulkUpload"
export const SIMULATION_APPROVAL_SUMMARY_PATH = '/simulation-approval-summary'
export const DASHBOARDWITHGRAPH_PATH = '/dashboardWithGraph'
export const DASHBOARD_PATH = '/'
export const DASHBOARD_PATH_SECOND = '/dashboard'
export const SIMULATION_PATH = '/simulation'
export const SIMULATION_HISTORY_PATH = '/simulation-history'
export const USER_PATH = '/users'
export const RFQ_LISTING = '/rfq-listing'
export const AUCTION_LISTING = '/reverse-auction'
export const ADD_AUCTION = '/add-auction'
export const NFR_LISTING = '/nfr'
export const PRODUCT_ROLLOUT = '/product-rollout'
export const RESET_PASSWORD = '/reset-password'
export const FORGET_PASSWORD = '/forget-password'
export const SUPPLIER_MANAGEMENT = '/initiate-unblocking'
export const lOGIN_AUDITS = '/login-audit'
export const SUPPLIER_APPROVAL_SUMMARY = '/supplier-approval-summary'
export const SAP_PUSH_DETAIL = '/sap-push-detail'//MINDA
export const IMPACTED_DATA_LIST = '/impacted-data-list'


export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000"
export const EMPTY_GUID_0 = "0"

export const PART_COST = 'Part Cost'
export const PART_COST_CC = 'Part Cost + CC'

export const VIEW_COSTING_DATA = {
  costingHeadCheck: 'VBC/ZBC/NCC/CBC',
  // costingName: '',
  costingVersion: 'Costing Version',
  PoPriceWithDate: 'Net Cost (Effective from)',
  ExchangeRateSourceName: 'Exchange Rate Source',
  CostingCurrency: 'Costing Currency',
  vendorExcel: 'Vendor (Code)',
  customer: 'Customer (Code)',
  InfoCategory: 'Category',
  partType: 'Part Type',
  partNumber: 'Part Number',
  partName: 'Part Name',
  RevisionNumber: 'Revision Number',
  plantExcel: 'Plant (Code)',
  // status: 'Status',
  // sobPercentageExcel: 'SOB',
  rm: 'RM-Grade',
  rmRate: 'RM Rate',
  scrapRate: 'Scrap Rate',
  scrapRecoveryPercentage: 'Scrap Recovery %',
  gWeight: 'Gross Weight',
  fWeight: 'Finish Weight',
  castingWeightExcel: 'Casting Weight',
  meltingLossExcel: 'Melting Loss (Loss%)',
  BurningLossWeight: 'Burning Loss Weight',
  ScrapWeight: 'Scrap Weight',
  netRM: 'Net RM Cost',
  netBOP: 'Net BOP Cost',
  netChildPartsCost: 'Part Cost/Pc',
  netBoughtOutPartCost: 'BOP Cost/Assembly',
  netProcessCost: 'Process Cost/Assembly',
  netOperationCost: 'Operation Cost/Assembly',
  nTotalRMBOPCC: 'Cost/Assembly',

  pCost: 'Process Cost',
  oCost: 'Operation Cost',
  netOtherOperationCost: 'Other Operation Cost',
  nConvCost: 'Net Conversion Cost',
  sTreatment: 'Surface Treatment',
  tCost: 'Extra Surface Treatment Cost',
  netSurfaceTreatmentCost: 'Net Surface Treatment Cost',
  //tCost: 'Transportation Cost',
  //nConvCost: 'Net Conversion Cost',
  modelType: 'Model Type For Overhead/Profit',
  // aValue: '',
  // overheadOn: 'Overhead On',
  // profitOn: 'Profit On',
  // rejectionOn: 'Rejection On',
  // iccOn: 'ICC On',
  // paymentTerms: 'Payment Terms',
  overHeadApplicablity: 'Overhead Applicability',
  overHeadPercent: 'Overhead %',
  overHeadApplicablityValue: 'Overhead Value',
  // OverheadRemark: 'Overhead Remark',
  ProfitApplicablity: 'Profit Applicability',
  profitPercent: 'Profit %',
  ProfitApplicablityValue: 'Profit Value',
  // ProfitRemark: 'Profit Remark',
  rejectionApplicablity: 'Rejection Applicability',
  rejectionPercent: 'Rejection %',
  rejectionApplicablityValue: 'Rejection Value',
  // RejectionRemark: 'Rejection Remark',
  rejectionRecoveryApplicablity: 'Rejection Recovery Applicability',
  rejectionRecoveryPercent: 'Rejection Recovery %',
  rejectionRecoveryApplicablityValue: 'Rejection Recovery Value',
  // rejectionRecoveryRemark: 'Rejection Recovery Remark',
  iccApplicablity: 'ICC Applicability',
  iccPercent: 'ICC %',
  iccApplicablityValue: 'ICC Value',
  // ICCRemark: 'Icc Remark',
  nOverheadProfit: 'Net Overhead & Profits',
  packagingCost: 'Packaging Cost',
  freight: 'Freight',
  nPackagingAndFreight: 'Net Packaging & Freight',
  toolMaintenanceCostApplicablity: 'Tool Maintenance Cost Applicability',
  toolMaintenanceCost: 'Tool Maintenance Cost Value',
  //toolMaintenanceCost: 'Tool Maintenance Cost',
  toolPrice: 'Tool Price',
  amortizationQty: 'Amortization Quantity',
  toolAmortizationCost: 'Tool Amortization Cost',
  totalToolCost: 'Net Tool Cost',
  // totalCost: 'Total Cost',
  // otherDiscount: 'Hundi/Other Discount',
  // otherDiscountValue: '',
  // otherDiscountApplicablity: 'Hundi/Discount Applicability',
  // otherDiscountValuePercent: 'Hundi/Discount Value',
  otherDiscountCost: 'Hundi/Discount Cost',
  anyOtherCostTotal: 'Any Other Cost',
  saNumber: 'SA Number',
  lineNumber: 'Line Number',
  npvCost: 'Net NPV Cost',
  paymentApplicablity: 'Payment Applicability',
  paymentPercent: 'Payment %',
  paymentcApplicablityValue: 'Payment Value',
  // PaymentTermRemark: 'Payment Remark',
  TaxCode: 'Tax Code',
  BasicRate: 'Basic Price',
  conditionCost: 'Net Condition Cost',
  nPOPrice: `Net Cost (Settlement Currency)`,
  NetPOPriceLocalConversion: `Net Cost (Plant Currency)`,
  NetPOPriceConversion: `Net Cost (Base Currency)`,
  currencyTitle: 'Currency',
  nPoPriceCurrency: 'Net Cost (In Currency)',
  netCost: 'Net Cost',
  // currencyRate: 'Currency Rate',
  NCCPartQuantity: "Quantity",
  IsRegularized: "Is Regularized",
  remark: 'Remarks',
  //nPOPrice: 'Net PO Price',
  // attachment: 'Attachment',
  // approvalButton: '',
}


export const VIEW_COSTING_DATA_TEMPLATE = [
  {
    label: 'VBC/ZBC/NCC/CBC',
    value: 'costingHeadCheck'
  },
  {
    label: 'Costing Version',
    value: 'costingVersion'
  },
  {
    label: 'Net Cost (Effective from)',
    value: 'PoPriceWithDate'
  },
  {
    label: 'Part Type',
    value: 'partType'
  },
  {
    label: 'Part Number',
    value: 'partNumber'
  },
  {
    label: 'Part Name',
    value: 'partName'
  },
  {
    label: 'Revision Number',
    value: 'RevisionNumber'
  },
  {
    label: 'Vendor (Code)',
    value: 'vendorExcel'
  },
  {
    label: 'Customer (Code)',
    value: 'customer'
  },
  {
    label: 'Plant (Code)',
    value: 'plantExcel'
  },
  {
    label: 'Status',
    value: 'status'
  },
  {
    label: 'SOB',
    value: 'sobPercentageExcel'
  },
  {
    label: 'RM-Grade',
    value: 'rm'
  },
  {
    label: 'RM Rate',
    value: 'rmRate'
  },
  {
    label: 'Scrap Rate',
    value: 'scrapRate'
  },
  {
    label: 'Gross Weight',
    value: 'gWeight'
  },
  {
    label: 'Finish Weight',
    value: 'fWeight'
  },
  {
    label: 'Burning Loss Weight',
    value: 'BurningLossWeight'
  },
  {
    label: 'Scrap Weight',
    value: 'ScrapWeight'
  },
  {
    label: 'Net RM Cost',
    value: 'netRM'
  },
  {
    label: 'Net BOP Cost',
    value: 'netBOP'
  },
  {
    label: 'Part Cost/Pc',
    value: 'netChildPartsCost'
  },
  {
    label: 'BOP Cost/Assembly',
    value: 'netBoughtOutPartCost'
  },
  {
    label: 'Process Cost/Assembly',
    value: 'netProcessCost'
  },
  {
    label: 'Operation Cost/Assembly',
    value: 'netOperationCost'
  },
  {
    label: 'Cost/Assembly',
    value: 'nTotalRMBOPCC'
  },
  {
    label: 'Process Cost',
    value: 'pCost'
  },
  {
    label: 'Operation Cost',
    value: 'oCost'
  },
  {
    label: 'Other Operation Cost',
    value: 'netOtherOperationCost'
  },
  {
    label: 'Net Conversion Cost',
    value: 'nConvCost'
  },
  {
    label: 'Surface Treatment',
    value: 'sTreatment'
  },
  {
    label: 'Extra Surface Treatment Cost',
    value: 'tCost'
  },
  {
    label: 'Net Surface Treatment Cost',
    value: 'netSurfaceTreatmentCost'
  },
  {
    label: 'Model Type For Overhead/Profit',
    value: 'modelType'
  },
  {
    label: 'Overhead Applicability',
    value: 'overHeadApplicablity'
  },
  {
    label: 'Overhead %',
    value: 'overHeadPercent'
  },
  {
    label: 'Overhead Value',
    value: 'overHeadApplicablityValue'
  },
  {
    label: 'Overhead Remark',
    value: 'OverHeadRemark'
  },
  {
    label: 'Profit Applicability',
    value: 'ProfitApplicablity'
  },
  {
    label: 'Profit %',
    value: 'profitPercent'
  },
  {
    label: 'Profit Value',
    value: 'ProfitApplicablityValue'
  },
  {
    label: 'Profit Remark',
    value: 'ProfitRemark'
  },
  {
    label: 'Rejection Applicability',
    value: 'rejectionApplicablity'
  },
  {
    label: 'Rejection %',
    value: 'rejectionPercent'
  },
  {
    label: 'Rejection Value',
    value: 'rejectionApplicablityValue'
  },
  {
    label: 'Rejection Remark',
    value: 'RejectionRemark'
  },
  {
    label: 'ICC Applicability',
    value: 'iccApplicablity'
  },
  {
    label: 'ICC %',
    value: 'iccPercent'
  },
  {
    label: 'ICC Value',
    value: 'iccApplicablityValue'
  },
  {
    label: 'ICC Remark',
    value: 'ICCRemark'
  },

  {
    label: 'Net Overhead Profits',
    value: 'nOverheadProfit'
  },
  {
    label: 'Packaging Cost',
    value: 'packagingCost'
  },
  {
    label: 'Freight',
    value: 'freight'
  },
  {
    label: 'Net Packaging and Freight',
    value: 'nPackagingAndFreight'
  },
  {
    label: 'Tool Maintenance Cost Applicability',
    value: 'toolMaintenanceCostApplicablity'
  },
  {
    label: 'Tool Maintenance Cost Value',
    value: 'toolMaintenanceCost'
  },
  {
    label: 'Tool Price',
    value: 'toolPrice'
  },
  {
    label: 'Amortization Quantity',
    value: 'amortizationQty'
  },
  {
    label: 'Tool Amortization Cost',
    value: 'toolAmortizationCost'
  },
  {
    label: 'Net Tool Cost',
    value: 'totalToolCost'
  },

  {
    label: 'Hundi/Discount Applicability',
    value: 'otherDiscountApplicablity'
  },
  {
    label: 'Hundi/Discount Value',
    value: 'otherDiscountValuePercent'
  },
  {
    label: 'Hundi/Discount Cost',
    value: 'otherDiscountCost'
  },
  {
    label: 'Any Other Cost',
    value: 'anyOtherCostTotal'
  },
  {
    label: 'Basic Rate',
    value: 'BasicRate'
  },
  {
    label: 'NPV Cost',
    value: 'npvCost'
  },
  {
    label: 'Costing Condition',
    value: 'conditionCost'
  },
  {
    label: 'Payment Applicability',
    value: 'paymentApplicablity'
  },
  {
    label: 'Payment %',
    value: 'paymentPercent'
  },
  {
    label: 'Payment Value',
    value: 'paymentcApplicablityValue'
  },
  {
    label: 'Payment Remark',
    value: 'PaymentTermRemark'
  },
  {
    label: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    value: 'nPOPrice'
  },
  {
    label: 'Currency',
    value: 'currencyTitle'
  },
  {
    label: 'Currency Rate',
    value: 'currencyRate'
  },
  {
    label: 'Net Cost (In Currency)',
    value: 'nPoPriceCurrency'
  },
  {
    label: 'Quantity',
    value: 'NCCPartQuantity'
  },
  {
    label: 'Is Regularized',
    value: 'IsRegularized'
  },
  {
    label: 'Remarks',
    value: 'remark'
  }
];


export const VIEW_COSTING_DATA_LOGISTICS = {
  costingHeadCheck: 'ZBC v/s VBC v/s NCC v/s CBC',
  costingVersion: 'Costing Version',
  PoPriceWithDate: 'Net Cost (Effective from)',
  partNumber: 'Part Number',
  partName: 'Part Name',
  RevisionNumber: 'Revision Number',
  plantExcel: 'Plant (Code)',
  nPackagingAndFreight: 'Net Freight',
  nPOPrice: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`,
  currencyTitle: 'Currency',
  nPoPriceCurrency: 'Net Cost (In Currency)',
  remark: 'Remarks',
}

//UOM ENUMS (Need to change name)
export const KG = "Kilogram"
export const HOUR = "Hours"
export const NO = "Number"
export const STROKE = "Stroke"
export const SHOTS = "SHOT"
export const MINUTES = 'Minutes'
export const SECONDS = 'Seconds'
export const MILLISECONDS = 'MilliSeconds'
export const MICROSECONDS = 'MicroSeconds'
export const DISPLAY_G = "g"
export const DISPLAY_KG = "kg"
export const DISPLAY_MG = "mg"
export const DISPLAY_HOURS = "hrs"
export const DISPLAY_MINUTES = "min"
export const DISPLAY_SECONDS = "sec"
export const DISPLAY_MILISECONDS = "ms"
export const DISPLAY_MICROSECONDS = "microsec"

// export const INR = "INR"

export const Fixed = 1;
export const Percentage = 2;
export const FullTruckLoad = 3;
export const PartTruckLoad = 4;
export const Per_Kg_Load = 5;
export const INR = "INR"
export const G = "Gram"
export const MG = "Milligram"
export const COSTINGSIMULATIONROUND = 2

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
export const RMDOMESTIC = '1'
export const RMIMPORT = '2'
export const PROCESS = '3'
export const COMBINED_PROCESS = '3'          						//RE
export const BOPDOMESTIC = '4'
export const BOPIMPORT = '5'
export const OPERATIONS = '6'
export const SURFACETREATMENT = '7'
export const EXCHNAGERATE = '8'
export const MACHINERATE = '9'
export const OVERHEAD = 'Overhead'
export const PROFIT = 'Profits'
export const RAWMATERIALINDEX = '11'

// BULK UPLOAD
export const SHEETMETAL_GROUP_BULKUPLOAD = 1
export const PLASTIC_GROUP_BULKUPLOAD = 2
export const MACHINING_GROUP_BULKUPLOAD = 3
export const CORRUGATED_BOX = 4
export const ASSEMBLY = 5
export const WIRINGHARNESS = 6
export const DIE_CASTING = 7
//changed the sheet metal to 8 bcz the version 3 code is not working or deployed
export const SHEETMETAL = 8
export const MONOCARTON = 13
export const PLASTIC_RUBBER_WITH_EXTRUSION = 14

export const REASON_ID = 2
export const TOFIXEDVALUE = 10
export const INSULATION = 11
export const ELECTRICAL_STAMPING = 12

// MASTER PAGES NAME
export const RmDomestic = "Raw-material-domestic"
export const RmImport = "Raw-material-import"
export const RmSpecification = "Raw-material-Specification"
export const RmMaterial = "Raw-material"
export const BopDomestic = "BOP-domestic"
export const BopImport = "BOP-import"
export const Sob = "Manage Specification"
export const sobManage = "SOB"

export const AssemblyPart = "Assembly-part"
export const ComponentPart = "Component-part"
export const AssemblyWiseImpactt = "AssemblyWise-Impact"
export const RMImpact = "RawMaterial-Impact"
export const BOPImpact = "BOP-Impact"
export const OPerationImpact = "Operation-Impact"
export const ExchangeRateImpact = "ExchangeRate-Impact"
export const ImpactMaster = "ImpactMaster"

export const MachineRate = "Machine-rate"
export const ProcessMaster = "Process "

export const VendorMaster = "Vendor"
export const Clientmaster = "Customer"
export const PlantZbc = "Plant-zbc"
export const PlantVbc = "Plant-vbc"

export const OverheadMaster = "Overhead"
export const ProfitMaster = "Profit"
export const LabourMaster = "Labour"
export const Reasonmaster = "Reason"
export const OperationMaster = "Operation"
export const FuelMaster = "Fuel"
export const PowerMaster = "Power"
export const UomMaster = "UOM"
export const VolumeMaster = "Volume"
export const ExchangeMaster = "Exchange-rate"
export const FreightMaster = "Freight"
export const InterestMaster = "Interest-rate"
export const ReportMaster = "Report-rate"
export const ReportSAPMaster = "SAP-Excel Download"//MINDA
export const UserListing = "User-Listing"
export const AuditLisitng = "Audit-Listing"
export const VendorManagement = "Vendor-Management"

export const simulationMaster = "Simulation"
export const DashboardMaster = "Analytics and Reports"
export const IMPORT = "Import"
export const INDEXED = "Indexed"
export const NONINDEXED = "Non Indexed"
export const DOMESTIC = "Domestic"
export const IMPORTED = "Imported"


// SPACE KEY CODE
export const SPACEBAR = 32

// MASTER PAGES NAME END

export const VARIANCE = 'Variance'

//ATTACHMENT CATAGORY
export const IMPACT_SHEET = 'Impact Sheet'          						//RE
export const SUPPLIER_CONFRIM = 'Supplier Confirmation'          						//RE
export const INVOICE_BACKUP = 'Invoice Backups'          						//RE
export const OTHER = 'Others'          						//RE
export const ATTACHMENTS = 'Attachments'          						//RE
export const ATTACHMENT = 'Attachment'
export const FEASIBILITY = 'Feasibility'
export const CAPACITY = 'Capacity'
export const TIMELINE = 'Timeline'

export const APPROVAL_ID = 3
export const RM_MASTER_ID = 1
export const BOP_MASTER_ID = 2
export const OPERATIONS_ID = 3
export const MACHINE_MASTER_ID = 4
export const BUDGET_ID = 5
export const SUPPLIER_MANAGEMENT_ID = 6


//approve reject drawer
export const PROVISIONAL = "Provisional"
export const APPROVER = 'Approver'          						//RE
export const NEW_COMPONENT = "New Component"
export const CUSTOMER_BASED = "Customer Based"

// Original release strategy constants
export const RELEASE_STRATEGY_B1 = "Release Strategy B1"
export const RELEASE_STRATEGY_B2 = "Release Strategy B2"
export const RELEASE_STRATEGY_B3 = "Release Strategy B3"
export const RELEASE_STRATEGY_B4 = "Release Strategy B4"
export const RELEASE_STRATEGY_B6 = "Release Strategy B6"

// Transformed release strategy constants //MINDA
export const RELEASE_STRATEGY_B1_NEW = "Release Strategy B1 (PFS rate increase upto 110%)"
export const RELEASE_STRATEGY_B2_NEW = "Release Strategy B2 (PFS rate increase beyond upto 110%)"
export const RELEASE_STRATEGY_B3_NEW = "Release Strategy B3 (Rate increase BOM budgeted upto 103%)"
export const RELEASE_STRATEGY_B4_NEW = "Release Strategy B4 (Rate increase BOM budgeted beyond 103%)"
export const RELEASE_STRATEGY_B6_NEW = "Release Strategy B6 (Regular BOM)"

//default value for page size
export const defaultPageSize = 10;

//SHOWING POSITIVE AND NEGATIVE SIGN BASIS OF CLIENT REQUIREMENT 
export const SWAP_POSITIVE_NEGATIVE = false;
// export const SWAP_POSITIVE_NEGATIVE = true;          						//RE

//AllConastant File Moved here

export const NAME = 'Name';
export const TYPE = 'Type';
export const CATEGORY = 'Category';
export const MATERIAL = 'Raw Material';
export const GRADE = 'Grade';
export const SPECIFICATION = 'Specification';
export const DATE = 'Created Date';
export const EMPTY_DATA = 'No Record Found';
export const DATE_TYPE = 'Date';

export const LEVEL0 = 'L0';
export const LEVEL1 = 'L1';
export const SUB_ASSEMBLY = 'Sub Assembly';

//MASTER NAMES FOR BULK UPLOAD
export const RMDOMESTICBULKUPLOAD = 'RM Domestic';
export const RMIMPORTBULKUPLOAD = 'RM Import';
export const RMMASTER = 'RM';
export const RMSPECIFICATION = 'RM Specification';
export const RMMATERIALBULKUPLOAD = 'Index Data';
export const INDEXCOMMODITYBULKUPLOAD = 'Index';
export const COMMODITYSTANDARDIZATION = 'Commodity Standardization';
export const COMMODITYININDEXBULKUPLOAD = 'Commodity (In Index)';
export const COMMODITYSTANDARD = 'Commodity Standard'
export const BOPDOMESTICBULKUPLOAD = reactLocalStorage.getObject("BOPLabel") + " Domestic";
export const INSERTDOMESTICBULKUPLOAD = 'Insert Domestic';
export const BOPIMPORTBULKUPLOAD = reactLocalStorage.getObject("BOPLabel") + " Import";
export const INSERTIMPORTBULKUPLOAD = 'Insert Import';
export const BOMBULKUPLOAD = 'BOM';
export const PARTCOMPONENTBULKUPLOAD = 'Part Component';
export const PRODUCTCOMPONENTBULKUPLOAD = 'Product Component';
export const MACHINEBULKUPLOAD = 'Machine';
export const VENDORBULKUPLOAD = 'Vendor';
export const LABOURBULKUPLOAD = 'Labour'
export const OPERAIONBULKUPLOAD = 'Operation';
export const FUELBULKUPLOAD = 'Fuel';
export const INTERESTRATEBULKUPLOAD = 'Interest Rate'
export const ACTUALVOLUMEBULKUPLOAD = 'Actual Volume'
export const BUDGETEDVOLUMEBULKUPLOAD = 'Budgeted Volume'
export const ADDRFQ = 'ADD RFQ'
export const VOLUMEBULKUPLOAD = 'Volume'
export const BUDGETBULKUPLOAD = 'Budget'
//added for OverheadProfit
export const OVERHEADBULKUPLOAD = 'Overhead'
export const PROFITBULKUPLOAD = 'Profit'
export const ASSEMBLYORCOMPONENTSRFQ = "AssemblyOrComponentsRFQ"
export const BOUGHTOUTPARTSRFQ = "BoughtOutPartsRFQ"
export const RAWMATERIALSRFQ = "RawMaterialsRFQ"
export const SAP_PUSH = "SAP Push"




//STATUS FILTER DROPDOWN OPTIONS
export const statusOptionsMasters = _.sortBy([
  { label: "Rejected", value: "4" },
  { label: "Approved", value: "3" },
  { label: "Awaiting Approval", value: "6" },
  { label: "Draft", value: "1" },
  { label: "History", value: "5" },
  { label: "Pending For Approval", value: "2" },
  { label: "Rejected By System", value: "18" },
], ({ label }) => label.toLowerCase());


export const statusOptionsCosting = _.sortBy([
  { label: "Awaiting Approval", value: "6" },
  { label: "Draft", value: "1" },
  { label: "Error", value: "12" },
  { label: "History", value: "5" },
  { label: "Pending For Approval", value: "2" },
  { label: "PO Updated", value: "14" },
  { label: "Pushed", value: "13" },
  { label: "Rejected", value: "4" },
  { label: "Returned", value: "15" },
  { label: "Approved", value: "3" },
]
  , ({ label }) => label.toLowerCase());

export const statusOptionsSimulation = _.sortBy([
  { label: "Awaiting Approval", value: "6" },
  { label: "Draft", value: "1" },
  { label: "Error", value: "12" },
  { label: "History", value: "5" },
  { label: "Linked", value: "17" },
  { label: "Pending For Approval", value: "2" },
  { label: "PO Updated", value: "14" },
  { label: "Provisional", value: "15" },
  { label: "Pushed", value: "13" },
  { label: "Rejected", value: "4" },
  { label: "Approved", value: "3" },
], ({ label }) => label.toLowerCase());

export const ApprovedCostingStatus = ['8', '3', '9', '5', '16']

export const statusOptions = _.sortBy([
  { label: "Approved By Assembly", value: "8" },
  { label: "Approved By Simulation", value: "9" },
  { label: "Approved", value: "3" },
  { label: "Awaiting Approval", value: "6" },
  { label: "Created By Assembly", value: "10" },
  { label: "Created By Simulation", value: "11" },
  { label: "Draft", value: "1" },
  { label: "Error", value: "12" },
  { label: "History", value: "5" },
  { label: "Linked", value: "17" },
  { label: "Pending For Approval", value: "2" },
  { label: "PO Updated", value: "14" },
  { label: "Provisional", value: "15" },
  { label: "Pushed", value: "13" },
  { label: "Rejected", value: "4" },
  { label: "Rejected By System", value: "18" },
  { label: "Approved By ASM Simulation", value: "16" },
  // { label: "SendForApproval", value: "7" },
], ({ label }) => label.toLowerCase());


export const CRMHeads = [
  { label: "Net Sales", value: 1 },
  { label: "Consumption", value: 2 },
  { label: "Labour Cost", value: 3 },
  { label: "Manufacturing Expenses", value: 4 },
  { label: "Office Expenses", value: 5 },
  { label: "Repairs Expenses", value: 6 },
  { label: "Selling & Distribution Expenses", value: 7 },
  { label: "Common Expenses", value: 8 },
  { label: "Staff Cost", value: 9 },
  { label: "EBIDTA", value: 10 },
  { label: "Finance Cost", value: 11 },
  { label: "Depreciation", value: 12 },
  { label: "PBT", value: 13 },
  { label: "Amortization", value: 14 },

]

export const CostData = [
  { label: "Local Logistic", value: 100 },
  { label: "Yield Loss", value: 200 },
  { label: "Packaging and Freight", value: 150 },
  { label: "Overhead Cost", value: 250 },
  { label: "Profit Cost", value: 300 },
  { label: "Discount Cost", value: 50 },
  { label: "Freight Cost", value: 120 },
  { label: "Shearing Cost", value: 180 }
];
export const typeData = [
  { label: "Percentage", value: 'Percentage' },
  { label: "Fixed", value: 'Fixed' }
];

export const LANGUAGES = [
  { value: 'en', label: 'English - EN', },
  { value: 'hi', label: 'हिन्दी - HI', },
  { value: 'mr', label: 'मराठी - MR', },
]

//CONSTANTS FOR COSTING HEAD
export const ZBCTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[ZBC])
export const VBCTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[VBC])
export const CBCTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[CBC])
export const WACTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[WAC])
export const NCCTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[NCC])
export const ZBCTypeIdFull = Number(reactLocalStorage.getObject('CostingHeadsListFullForm')[ZBC])
export const VBCTypeIdFull = Number(reactLocalStorage.getObject('CostingHeadsListFullForm')[VBC])
export const CBCTypeIdFull = Number(reactLocalStorage.getObject('CostingHeadsListFullForm')[CBC])
export const NCCTypeIdFull = Number(reactLocalStorage.getObject('CostingHeadsListFullForm')[NCC])
export const PFS1TypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[PFS1])
export const PFS2TypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[PFS2])
export const PFS3TypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[PFS3])

export const ZBCADDMORE = 15
export const VBCADDMORE = 16
export const CBCADDMORE = 17
export const ZBCADDMOREOPERATION = 18
export const VBCADDMOREOPERATION = 19
export const CBCADDMOREOPERATION = 20

export const NFRTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[NFR])
export const NFRAPPROVALTYPEID = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[NFR])
// export const NFRTypeId = Number(reactLocalStorage.getObject('CostingHeadsListShortForm')[NCC])

//CONSTANTS FOR APPROVAL TYPE 
export const CBCAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[CBC])
export const NCCAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[NCC])
export const VBCAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[VBC])
export const ZBCAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ZBC])
export const WACAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[WAC])
export const PROVISIONALAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm'))
//MINDA
export const PFS1APPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[PFS1])
export const PFS2APPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[PFS2])
export const PFS3APPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[PFS3])

export const CBCAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[CBC])
export const NCCAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[NCC])
export const VBCAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[VBC])
export const ZBCAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[ZBC])
//MINDA
export const PFS2APPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[PFS2])
export const PROVISIONALAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[PROVISIONAL])

export const RELEASESTRATEGYTYPEID1 = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ReleaseStrategyB1])
export const RELEASESTRATEGYTYPEID2 = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ReleaseStrategyB2])
export const RELEASESTRATEGYTYPEID3 = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ReleaseStrategyB3])
export const RELEASESTRATEGYTYPEID4 = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ReleaseStrategyB4])
export const RELEASESTRATEGYTYPEID6 = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[ReleaseStrategyB6])
export const VENDORNEEDFORMID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[VendorNeedForm])
export const RAWMATERIALAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[RAWMATERIAL])
//Supplier approval 

export const CLASSIFICATIONAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[CUD])


export const LPSAPPROVALTYPEID = Number(reactLocalStorage.getObject('ApprovalTypeListShortForm')[LPSUD])
export const LPSAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[LPSUD])
export const CLASSIFICATIONAPPROVALTYPEIDFULL = Number(reactLocalStorage.getObject('ApprovalTypeListFullForm')[CUD])

//CONSTANTS FOR MASTER APPROVAL TYPE 
export const RMTYPE = Number(reactLocalStorage.getObject('masterType')[RAW_MATERIAL])
export const BOPTYPE = Number(reactLocalStorage.getObject('masterType')[BOP])
export const MACHINETYPE = Number(reactLocalStorage.getObject('masterType')[MACHINE])
export const OPERATIONTYPE = Number(reactLocalStorage.getObject('masterType')[OPERATION])
export const BUDGETTYPE = Number(reactLocalStorage.getObject('masterType')[BUDGETING])

//CONSTANTS FOR ONBOARDING
// export const ONBOARDINGNAME = reactLocalStorage.getObject('onboardingName')
// export const ONBOARDINGID = reactLocalStorage.getObject('onboardingId')
export const ONBOARDINGNAME = (() => {
  const storedName = reactLocalStorage.getObject('onboardingName')
  return (storedName &&
    storedName !== 'null' &&
    storedName !== 'undefined' &&
    storedName !== null &&
    storedName !== undefined) ? storedName : ''
})()
// export const ONBOARDINGID = reactLocalStorage.getObject('onboardingId')
export const ONBOARDINGID = (() => {
  const storedId = reactLocalStorage.getObject('onboardingId')
  return (storedId &&
    storedId !== 'null' &&
    storedId !== 'undefined' &&
    storedId !== null &&
    storedId !== undefined) ? storedId : ''
})()
//CONSTANTS FOR MANAGE LEVELS RADIO BUTTON


export const COSTING_LEVEL = Number(reactLocalStorage.getObject('moduleType')[MODULE_COSTING])
export const SIMULATION_LEVEL = Number(reactLocalStorage.getObject('moduleType')[MODULE_SIMULATION])
export const MASTER_LEVEL = Number(reactLocalStorage.getObject('moduleType')[MODULE_MASTER])
export const ONBOARDING_MANAGEMENT_LEVEL = Number(reactLocalStorage.getObject('moduleType')[MODULE_ONBOARDING])

//AUTOCOMPLETE IN PART AND VENDOR
export const searchCount = 3
export const dropdownLimit = 100
export const APPROVED_BY_SAP = "Approved By SAP"

// KEY AND IVgit
export const KEY = 'gQUJ79YKYm22Cazw';
export const IV = 'eTEFSa0PinFKTQNB'
// KEY AND IV
//MINDA

// export const KEY = 'awvmhujtecmcecmj';
// export const IV = 'vuqqsafvwouoqtgh'

// // KEY AND IV          						//RE
// export const KEY = 'ewswymuinfzfskjz';          						//RE
// export const IV = 'ozzzguugcusjqmbj'          						//RE

export const KEYRFQ = "UAGSqTBCbZ8JqHJl"
export const IVRFQ = "8vFNmRQEl91nOtrM"

//CONSTANT FOR DOMESTIC AND IMPORT COMMON LISTING API
export const ENTRY_TYPE_DOMESTIC = 0
export const ENTRY_TYPE_IMPORT = 1

//CONSTANT FOR VENDOR TYPE 
export const VENDOR_TYPE_BOP = 'BOP'
export const VENDOR_TYPE_FREIGHT = 'FREIGHT'
export const VENDOR_TYPE_LABOUR = 'LABOUR'
export const VENDOR_TYPE_RAW_MATERIAL = 'RAW MATERIAL'
export const VENDOR_TYPE_VBC = 'VBC'

export const BOP_VENDOR_TYPE = Number(reactLocalStorage.getObject('vendortype')[VENDOR_TYPE_BOP])
export const FREIGHT_VENDOR_TYPE = Number(reactLocalStorage.getObject('vendortype')[VENDOR_TYPE_FREIGHT])
export const LABOUR_VENDOR_TYPE = Number(reactLocalStorage.getObject('vendortype')[VENDOR_TYPE_LABOUR])
export const RAW_MATERIAL_VENDOR_TYPE = Number(reactLocalStorage.getObject('vendortype')[VENDOR_TYPE_RAW_MATERIAL])
export const VBC_VENDOR_TYPE = Number(reactLocalStorage.getObject('vendortype')[VENDOR_TYPE_VBC])

export const PartTypeIDFromAPI = 2
export const showLogoFromDataBase = false
export const showPaperCorrugatedBox = true

export const showDynamicKeys = false
export const hideDetailOfRubbercalci = false
export const customHavellsChanges = false
export const countDownBlinkingTime = 2
export const clientName = 'Havells'
export const isShowTaxCode = true
export const effectiveDateRangeDayPrevious = 7
export const effectiveDateRangeDayFuture = 7
export const effectiveDateRangeDays = null
// CONSTANT FOR COSTING ENTRY TYPE ID
export const COMMODITYCOST = 'Commodity Cost'
export const RAWMATERIALCOST = 'Raw Material Other Cost'
export const COSTINGCONDITIONCOST = 'Costing Condition Cost'
export const COSTINGOVERHEADANDPROFTFORPROCESS = "Costing Overhead Profit For Process"
export const COSTINGOVERHEADANDPROFTOPERATION = "Costing Overhead Profit For Operation"
export const COSTINGSURFACETREATMENTEXTRACOST = "Costing Surface Treatment Extra Cost"

export const TAPEANDPAINT = "Tape + Paint"
export const TAPE = "Tape"
export const PAINT = "Paint"
export const HANGER = "Hanger"
export const SURFACETREATMENTLABEL = "Surface Treatment"
export const RM = "RM"
export const CC = "CC"
export const RMCC = "RM + CC"

export const PAINTTECHNOLOGY = 31
export const HANGEROVERHEAD = "Hanger Overhead"

export const IsSelectSinglePlant = true
//VERSION 
export const VERSION = "V4.2.36";




