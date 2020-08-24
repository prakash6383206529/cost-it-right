/**
 * Define all the constants required in application inside this file and export them
 */

//hosting url for api of cost-it-right
//const BASE_URL = 'http://10.10.1.100:8081/CIRLite';
const BASE_URL = 'http://10.10.1.100:8090/api/v1';
export const FILE_URL = 'http://10.10.1.100:8090/';

/** Export API */
export const API = {
  //configure api's

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
  getRawMaterialSelectList: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material`,
  getRowGrade: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-grade`,
  getRowMaterialSpecification: `${BASE_URL}/configuration-raw-material /select-list-get-raw-material-specification`,
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

  //Api for the part master

  // partCreateAPI: `${BASE_URL}/masters-part/create`,
  createAssemblyPartAPI: `${BASE_URL}/masters-part/create-assembly-part`,
  getAssemblyPartDataListAPI: `${BASE_URL}/masters-part/get-all-assembly-parts`,
  getAssemblyPartDetailAPI: `${BASE_URL}/masters-part/get-assembly-part`,
  updateAssemblyPartAPI: `${BASE_URL}/masters-part/update-assembly-part`,
  deleteAssemblyPartAPI: `${BASE_URL}/masters-part/delete-assembly-part`,
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

  //BOP DOMESTIC
  createBOPDomestic: `${BASE_URL}/masters-bought-out-part/create-bought-out-part-domestic`,
  getBOPDomesticById: `${BASE_URL}/masters-bought-out-part/get-domestic-bought-out-part-by-id`,
  getBOPDomesticDataList: `${BASE_URL}/masters-bought-out-part/get-all-domestic-bought-out-part-by-filter`,
  updateBOPDomestic: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-domestic`,
  deleteBOPAPI: `${BASE_URL}/masters-bought-out-part/delete`,

  //BOP IMPORT
  createBOPImport: `${BASE_URL}/masters-bought-out-part/create-bought-out-part-import`,
  getBOPImportById: `${BASE_URL}/masters-bought-out-part/get-import-bought-out-part-by-id`,
  getBOPImportDataList: `${BASE_URL}/masters-bought-out-part/get-all-import-bought-out-part-by-filter`,
  updateBOPImport: `${BASE_URL}/masters-bought-out-part/update-bought-out-part-import`,

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
  getFuelDetailDataList: `${BASE_URL}/masters-fuel/get-all-fuel-details`,
  deleteFuelAPI: `${BASE_URL}/masters-fuel/delete-fuel`,
  deleteFuelDetailAPI: `${BASE_URL}/masters-fuel/delete-fuel-detail`,
  getFuelComboData: `${BASE_URL}/configuration-master/get-fuel-details-combo-select-list`,
  fuelBulkUpload: `${BASE_URL}/masters-fuel/bulk-upload-for-fuel-details-json`,

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

  //OVERHEAD AND PROFIT API'S
  createOverhead: `${BASE_URL}/masters-overhead-and-profit/create-overhead`,
  updateOverhead: `${BASE_URL}/masters-overhead-and-profit/update-overhead`,
  getOverheadData: `${BASE_URL}/masters-overhead-and-profit/get`,
  getOverheadDataList: `${BASE_URL}/masters-overhead-and-profit/get-all-overhead-by-filter`,
  activeInactiveOverhead: `${BASE_URL}/masters-overhead-and-profit/active-inactive-overhead`,

  createProfit: `${BASE_URL}/masters-overhead-and-profit/create-profit`,
  updateProfit: `${BASE_URL}/masters-overhead-and-profit/update-profit`,
  getProfitData: `${BASE_URL}/masters-overhead-and-profit/get-profit`,
  getProfitDataList: `${BASE_URL}/masters-overhead-and-profit/get-all-profit-by-filter`,
  deleteOverhead: `${BASE_URL}/masters-overhead-and-profit/delete`,
  activeInactiveProfit: `${BASE_URL}/masters-overhead-and-profit/active-inactive-profit`,
  getOverheadProfitComboDataAPI: `${BASE_URL}/configuration-master/get-overhead-and-profit-combo-select-list`,

  //Api's for depreciation master
  createDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/create-depreciation-type`,
  getDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/get-all-depreciation-type`,
  deleteDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/delete-depreciation-type`,
  getDepreciationDataAPI: `${BASE_URL}/masters-machine-hour-rate/get-depreciation-type`,
  updateDepreciationAPI: `${BASE_URL}/masters-machine-hour-rate/update-depreciation-type`,

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
  getZBCCostingSelectListByPart: `${BASE_URL}/costing-sheet-metal/get-costing-select-list-by-part`,

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

  //cost summary 
  getCostingByCostingId: `${BASE_URL}/costing-sheet-metal/get-costing-by-id`,
  getCostSummaryOtherOperationList: `${BASE_URL}/costing-sheet-metal/get-other-operation-by-supplier`,
  fetchFreightHeadsAPI: `${BASE_URL}/configuration/get-freight-heads`,
  getCostingFreight: `${BASE_URL}/costing-sheet-metal/get-costing-freight`,
  copyCostingAPI: `${BASE_URL}/costing/copy-costing`,

  // Login API
  login: `${BASE_URL}/user/login`,
  logout: `${BASE_URL}/user/logout`,
  register: `${BASE_URL}/user/register`,

  //User's API
  getUserSelectList: `${BASE_URL}/configuration/select-list-get-user`,
  getAllUserDataAPI: `${BASE_URL}/user/get-all`,
  getUserDataAPI: `${BASE_URL}/user/get-by-id`,
  deleteUserAPI: `${BASE_URL}/user/delete`,
  activeInactiveUser: `${BASE_URL}/user/active-inactive-user`,
  updateUserAPI: `${BASE_URL}/user/update`,
  setUserTechnologyLevelForCosting: `${BASE_URL}/user-level/assign-user-technology-levels-for-costing`,
  getUserTechnologyLevelForCosting: `${BASE_URL}/user-level/get-user-technology-levels`,
  updateUserTechnologyLevelForCosting: `${BASE_URL}/user-level/update-user-technology-levels`,

  //Role's API
  addRoleAPI: `${BASE_URL}/user-role/create-new`,
  getAllRoleAPI: `${BASE_URL}/user-role/get-all`,
  getRoleAPI: `${BASE_URL}/user-role/get-new`,
  updateRoleAPI: `${BASE_URL}/user-role/update-new`,
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
  //getAllApprovalUserByDepartment: `${BASE_URL}/app-approval-system/get-all-approval-users-by-department`,
  getAllApprovalUserByDepartment: `${BASE_URL}/app-approval-system/get-all-approval-users-level-filter-by-department`,
  sendForApproval: `${BASE_URL}/app-approval-system/send-for-approval`,
  approvalProcess: `${BASE_URL}/app-approval-system/approval-process`,
  finalApprovalProcess: `${BASE_URL}/app-approval-system/final-approval-process`,
  reassignCosting: `${BASE_URL}/app-approval-system/reassign-send-for-approval-click`,
  cancelCosting: `${BASE_URL}/app-approval-system/cancel-for-approval-click`,
  getReasonSelectList: `${BASE_URL}/configuration/select-list-get-reasons`,

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

  //MACHINE
  createMachineAPI: `${BASE_URL}/masters-machine/create`,
  getMachineListAPI: `${BASE_URL}/masters-machine/get-all`,
  deleteMachineAPI: `${BASE_URL}/masters-machine/delete`,
  getMachineDataAPI: `${BASE_URL}/masters-machine/get`,
  updateMachineAPI: `${BASE_URL}/masters-machine/update`,
  getProcessCode: `${BASE_URL}/masters-machine/generate-process-code`,
  createProcess: `${BASE_URL}/masters-machine/create-process`,

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

  //CLIENT MASTER
  createClient: `${BASE_URL}/client/create-client`,
  updateClient: `${BASE_URL}/client/update-client`,
  getClientData: `${BASE_URL}/client/get-client-detail-by-id`,
  getClientDataList: `${BASE_URL}/client/get-all-client`,
  deleteClient: `${BASE_URL}/client/delete`,
  getClientSelectList: `${BASE_URL}/client/select-list-client`,

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
export const GET_SUPPLIER_DATALIST_SUCCESS = 'GET_SUPPLIER_DATALIST_SUCCESS';
export const GET_SUPPLIER_CITY_SUCCESS = 'GET_SUPPLIER_CITY_SUCCESS';
export const GET_TECHNOLOGY_SUCCESS = 'GET_TECHNOLOGY_SUCCESS';
export const GET_SUPPLIER_SELECTLIST_SUCCESS = 'GET_SUPPLIER_SELECTLIST_SUCCESS';
export const GET_TECHNOLOGY_SELECTLIST_SUCCESS = 'GET_TECHNOLOGY_SELECTLIST_SUCCESS';
export const GET_PLANT_SELECTLIST_SUCCESS = 'GET_PLANT_SELECTLIST_SUCCESS';
export const GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST = 'GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST';

//CATEGORY MASTER
export const GET_CATEGORY_SUCCESS = 'GET_CATEGORY_SUCCESS';
export const GET_CATEGORY_TYPE_DATA_SUCCESS = 'GET_CATEGORY_TYPE_DATA_SUCCESS';
export const GET_CATEGORY_TYPE_SUCCESS = ' GET_CATEGORY_TYPE_SUCCESS';
export const GET_TECHNOLOGY_LIST_SUCCESS = 'GET_TECHNOLOGY_LIST_SUCCESS';
export const GET_CATEGORY_MASTER_DATA_SUCCESS = 'GET_CATEGORY_MASTER_DATA_SUCCESS';

//LABOUR
export const GET_LABOUR_TYPE_SUCCESS = 'GET_LABOUR_TYPE_SUCCESS';
export const GET_COSTING_HEAD_SUCCESS = 'GET_COSTING_HEAD_SUCCESS';
export const GET_MODEL_TYPE_SUCCESS = 'GET_MODEL_TYPE_SUCCESS';
export const GET_LABOUR_TYPE_SELECTLIST_SUCCESS = 'GET_LABOUR_TYPE_SELECTLIST_SUCCESS';

//UOM MASTER
export const GET_UOM_DATA_SUCCESS = 'GET_UOM_DATA_SUCCESS';
export const GET_UOM_DATA_FAILURE = 'GET_UOM_DATA_FAILURE';
export const GET_UOM_SUCCESS = 'GET_UOM_SUCCESS';
export const UNIT_OF_MEASUREMENT_API_FAILURE = 'UNIT_OF_MEASUREMENT_API_FAILURE';
export const GET_UNIT_TYPE_SELECTLIST_SUCCESS = 'GET_UNIT_TYPE_SELECTLIST_SUCCESS';

//PART MASTER
export const CREATE_PART_REQUEST = 'CREATE_PART_REQUEST';
export const CREATE_PART_FAILURE = 'CREATE_PART_FAILURE';
export const CREATE_PART_SUCCESS = 'CREATE_PART_SUCCESS';
export const GET_ALL_PARTS_SUCCESS = 'GET_ALL_PARTS_SUCCESS';
export const GET_PART_SUCCESS = 'GET_PART_SUCCESS';
export const GET_UNIT_PART_DATA_SUCCESS = 'GET_UNIT_PART_DATA_SUCCESS';
export const GET_ALL_PARTS_FAILURE = 'GET_ALL_PARTS_FAILURE';
export const GET_MATERIAL_TYPE_SUCCESS = 'GET_MATERIAL_TYPE_SUCCESS';

//NEW PART MASTER
export const GET_ALL_NEW_PARTS_SUCCESS = 'GET_ALL_NEW_PARTS_SUCCESS';
export const GET_UNIT_NEW_PART_DATA_SUCCESS = 'GET_UNIT_NEW_PART_DATA_SUCCESS';
export const GET_PART_SELECTLIST_SUCCESS = 'GET_PART_SELECTLIST_SUCCESS';

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

//RAW MATERIAL
export const CREATE_MATERIAL_SUCCESS = ' CREATE_MATERIAL_SUCCESS';
export const CREATE_MATERIAL_FAILURE = 'CREATE_MATERIAL_FAILURE';
export const GET_RAW_MATERIAL_SUCCESS = 'GET_RAW_MATERIAL_SUCCESS';
export const GET_RAW_MATERIAL_DATA_SUCCESS = 'GET_RAW_MATERIAL_DATA_SUCCESS';
export const GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS = 'GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS';
export const GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS = 'GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS';
export const GET_RM_TYPE_DATALIST_SUCCESS = 'GET_RM_TYPE_DATALIST_SUCCESS';
export const GET_RM_NAME_SELECTLIST = 'GET_RM_NAME_SELECTLIST';
export const GET_GRADELIST_BY_RM_NAME_SELECTLIST = 'GET_GRADELIST_BY_RM_NAME_SELECTLIST';
export const GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST = 'GET_VENDORLIST_BY_VENDORTYPE_SELECTLIST';
export const GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA = 'GET_RAW_MATERIAL_FILTER_DYNAMIC_DATA';
export const GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST = 'GET_GRADE_FILTER_BY_RAW_MATERIAL_SELECTLIST';
export const GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST = 'GET_VENDOR_FILTER_BY_RAW_MATERIAL_SELECTLIST';
export const GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST = 'GET_RAW_MATERIAL_FILTER_BY_GRADE_SELECTLIST';
export const GET_VENDOR_FILTER_BY_GRADE_SELECTLIST = 'GET_VENDOR_FILTER_BY_GRADE_SELECTLIST';
export const GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST = 'GET_RAWMATERIAL_FILTER_BY_VENDOR_SELECTLIST';
export const GET_GRADE_FILTER_BY_VENDOR_SELECTLIST = 'GET_GRADE_FILTER_BY_VENDOR_SELECTLIST';

//RM GRADE
export const GET_GRADE_SUCCESS = 'GET_GRADE_SUCCESS';
export const GET_GRADE_DATA_SUCCESS = 'GET_GRADE_DATA_SUCCESS';
export const GET_RM_GRADE_LIST_SUCCESS = 'GET_RM_GRADE_LIST_SUCCESS';

//RM SPECIFICATION
export const GET_RM_SPECIFICATION_LIST_SUCCESS = 'GET_RM_SPECIFICATION_LIST_SUCCESS';
export const GET_SPECIFICATION_DATA_SUCCESS = 'GET_SPECIFICATION_DATA_SUCCESS';
export const GET_RMTYPE_SELECTLIST_SUCCESS = 'GET_RMTYPE_SELECTLIST_SUCCESS';
export const GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS = 'GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS';
export const GET_GRADE_SELECTLIST_BY_RAWMATERIAL = 'GET_GRADE_SELECTLIST_BY_RAWMATERIAL';
export const GET_GRADE_SELECTLIST_SUCCESS = 'GET_GRADE_SELECTLIST_SUCCESS';

export const GET_RM_LIST_SUCCESS = 'GET_RM_LIST_SUCCESS';
export const GET_RM_CATEGORY_LIST_SUCCESS = 'GET_RM_CATEGORY_LIST_SUCCESS';
export const GET_MATERIAL_LIST_SUCCESS = 'GET_MATERIAL_LIST_SUCCESS';
export const GET_MATERIAL_LIST_TYPE_SUCCESS = 'GET_MATERIAL_LIST_TYPE_SUCCESS';
export const RAWMATERIAL_ADDED_FOR_COSTING = 'RAWMATERIAL_ADDED_FOR_COSTING';
export const GET_MATERIAL_TYPE_DATA_SUCCESS = 'GET_MATERIAL_TYPE_DATA_SUCCESS';

//PLANT MASTER
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
export const GET_PLANT_UNIT_SUCCESS = 'GET_PLANT_UNIT_SUCCESS';
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';
export const GET_PLANT_FAILURE = 'GET_PLANT_FAILURE';
export const GET_PLANT_DATA_SUCCESS = 'GET_PLANT_DATA_SUCCESS';

//SUPPLIER MASTER
export const CREATE_SUPPLIER_SUCCESS = 'CREATE_SUPPLIER_SUCCESS';
export const CREATE_SUPPLIER_FAILURE = 'CREATE_SUPPLIER_FAILURE';
export const GET_SUPPLIER_FAILURE = 'GET_SUPPLIER_FAILURE';
export const GET_SUPPLIER_DATA_SUCCESS = 'GET_SUPPLIER_DATA_SUCCESS';
export const GET_RADIO_SUPPLIER_TYPE_SUCCESS = 'GET_RADIO_SUPPLIER_TYPE_SUCCESS';
export const GET_VENDOR_TYPE_SELECTLIST_SUCCESS = 'GET_VENDOR_TYPE_SELECTLIST_SUCCESS';

//BOM MASTER
export const CREATE_BOM_SUCCESS = 'CREATE_BOM_SUCCESS';
export const CREATE_BOM_FAILURE = 'CREATE_BOM_FAILURE';
export const GET_BOM_SUCCESS = 'GET_BOM_SUCCESS';
export const GET_BOM_FAILURE = 'GET_BOM_FAILURE';
export const UPLOAD_BOM_XLS_SUCCESS = 'UPLOAD_BOM_XLS_SUCCESS';
export const GET_BOM_UNIT_DATA_BY_PART_SUCCESS = 'GET_BOM_UNIT_DATA_BY_PART_SUCCESS';
export const GET_ASSEMBLY_PART_DATALIST_SUCCESS = 'GET_ASSEMBLY_PART_DATALIST_SUCCESS';
export const GET_ASSEMBLY_PART_DATA_SUCCESS = 'GET_ASSEMBLY_PART_DATA_SUCCESS';

//BOP MASTER
export const CREATE_BOP_SUCCESS = 'CREATE_BOP_SUCCESS';
export const CREATE_BOP_FAILURE = 'CREATE_BOP_FAILURE';
export const GET_BOP_SUCCESS = 'GET_BOP_SUCCESS';
export const GET_BOP_DOMESTIC_DATA_SUCCESS = 'GET_BOP_DOMESTIC_DATA_SUCCESS';
export const GET_BOP_IMPORT_DATA_SUCCESS = 'GET_BOP_IMPORT_DATA_SUCCESS';
export const GET_BOP_FAILURE = 'GET_BOP_FAILURE';
export const UPDATE_BOP_SUCCESS = 'UPDATE_BOP_SUCCESS';
export const GET_BOP_CATEGORY_SELECTLIST_SUCCESS = 'GET_BOP_CATEGORY_SELECTLIST_SUCCESS';

//PROCESS MASTER
export const CREATE_PROCESS_SUCCESS = 'CREATE_PROCESS_SUCCESS';
export const CREATE_PROCESS_FAILURE = 'CREATE_PROCESS_FAILURE';
export const GET_PROCESS_LIST_SUCCESS = 'GET_PROCESS_LIST_SUCCESS';
export const GET_PROCESS_LIST_FAILURE = 'GET_PROCESS_LIST_FAILURE';
export const GET_PROCESS_UNIT_DATA_SUCCESS = 'GET_PROCESS_UNIT_DATA_SUCCESS';
export const GET_PROCESS_DATA_SUCCESS = 'GET_PROCESS_DATA_SUCCESS';

//FUEL MASTER
export const CREATE_FUEL_SUCCESS = 'CREATE_FUEL_SUCCESS';
export const CREATE_FUEL_FAILURE = 'CREATE_FUEL_FAILURE';
export const GET_FUEL_SUCCESS = 'GET_FUEL_SUCCESS';
export const GET_FUEL_DATALIST_SUCCESS = 'GET_FUEL_DATALIST_SUCCESS';
export const GET_FUEL_DATA_SUCCESS = 'GET_FUEL_DATA_SUCCESS';
export const GET_FUEL_FAILURE = 'GET_FUEL_FAILURE';
export const GET_FUEL_UNIT_DATA_SUCCESS = 'GET_FUEL_UNIT_DATA_SUCCESS';
export const CREATE_FUEL_DETAIL_FAILURE = 'CREATE_FUEL_DETAIL_FAILURE';
export const CREATE_FUEL_DETAIL_SUCCESS = 'CREATE_FUEL_DETAIL_SUCCESS';
export const GET_FUEL_DETAIL_SUCCESS = 'GET_FUEL_DETAIL_SUCCESS';
export const GET_FUEL__DETAIL_DATA_SUCCESS = 'GET_FUEL_DETAIL_DATA_SUCCESS';
export const GET_FULE_COMBO_SUCCESS = 'GET_FULE_COMBO_SUCCESS';

//OTHER OPERATION MASTER
export const GET_OTHER_OPERATION_SUCCESS = 'GET_OTHER_OPERATION_SUCCESS';
export const GET_UNIT_OTHER_OPERATION_DATA_SUCCESS = 'GET_UNIT_OTHER_OPERATION_DATA_SUCCESS';
export const GET_OTHER_OPERATION_FAILURE = 'GET_OTHER_OPERATION_FAILURE';
export const CREATE_OTHER_OPERATION_REQUEST = 'CREATE_OTHER_OPERATION_REQUEST';
export const CREATE_OTHER_OPERATION_FAILURE = 'CREATE_OTHER_OPERATION_FAILURE';
export const CREATE_OTHER_OPERATION_SUCCESS = 'CREATE_OTHER_OPERATION_SUCCESS';
export const GET_OTHER_OPERATION_FORMDATA_SUCCESS = 'GET_OTHER_OPERATION_FORMDATA_SUCCESS';
export const GET_OTHER_OPERATION_FORMDATA_FAILURE = 'GET_OTHER_OPERATION_FORMDATA_FAILURE';

//CED OTHER OPERATION
export const GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS = 'GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS';
export const GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE = 'GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE';
export const GET_CED_OTHER_OPERATION_SUCCESS = 'GET_CED_OTHER_OPERATION_SUCCESS';
export const GET_CED_OTHER_OPERATION_DATA_SUCCESS = 'GET_CED_OTHER_OPERATION_DATA_SUCCESS';
export const GET_CED_OTHER_OPERATION_FAILURE = 'GET_CED_OTHER_OPERATION_FAILURE';
export const GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS = 'GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS';

//COMMON
export const DATA_FAILURE = 'DATA_FAILURE';
export const CREATE_SUCCESS = 'CREATE_SUCCESS';
export const CREATE_FAILURE = 'CREATE_FAILURE';
export const GET_PLANTS_BY_CITY = 'GET_PLANTS_BY_CITY';
export const GET_CITY_BY_SUPPLIER = 'GET_CITY_BY_SUPPLIER';
export const GET_PLANTS_BY_SUPPLIER_AND_CITY = 'GET_PLANTS_BY_SUPPLIER_AND_CITY';
export const GET_SOURCE_PLANTS_BY_SOURCE_CITY = 'GET_SOURCE_PLANTS_BY_SOURCE_CITY';
export const GET_DESTINATION_PLANTS_BY_DESTINATION_CITY = 'GET_DESTINATION_PLANTS_BY_DESTINATION_CITY';

//OPERATION
export const GET_OPERATION_SUCCESS = 'GET_OPERATION_SUCCESS';
export const GET_UNIT_OPERATION_DATA_SUCCESS = 'GET_UNIT_OPERATION_DATA_SUCCESS';
export const GET_OPERATION_SELECTLIST_SUCCESS = 'GET_OPERATION_SELECTLIST_SUCCESS';

//FREIGHT MASTER
export const CREATE_FREIGHT_SUCCESS = 'CREATE_FREIGHT_SUCCESS';
export const CREATE_FREIGHT_FAILURE = 'CREATE_FREIGHT_FAILURE';
export const GET_FREIGHT_SUCCESS = 'GET_FREIGHT_SUCCESS';
export const GET_FREIGHT_DATA_SUCCESS = 'GET_FREIGHT_DATA_SUCCESS';
export const GET_FREIGHT_FAILURE = 'GET_FREIGHT_FAILURE';

//ADDITIONAL FREIGHT MASTER
export const GET_ALL_ADDITIONAL_FREIGHT_SUCCESS = 'GET_ALL_ADDITIONAL_FREIGHT_SUCCESS';
export const GET_ADDITIONAL_FREIGHT_DATA_SUCCESS = 'GET_ADDITIONAL_FREIGHT_DATA_SUCCESS';
export const GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS = 'GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS';

//LABOUR MASTER
export const CREATE_LABOUR_SUCCESS = 'CREATE_LABOUR_SUCCESS';
export const CREATE_LABOUR_FAILURE = 'CREATE_LABOUR_FAILURE';
export const GET_LABOUR_SUCCESS = 'GET_LABOUR_SUCCESS';
export const GET_LABOUR_FAILURE = 'GET_LABOUR_FAILURE';
export const GET_LABOUR_DATA_SUCCESS = 'GET_LABOUR_DATA_SUCCESS';

//OVERHEAD AND PROFIT
export const GET_OVERHEAD_PROFIT_SUCCESS = 'GET_OVERHEAD_PROFIT_SUCCESS';
export const GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS';
export const GET_OVERHEAD_PROFIT_DATA_SUCCESS = 'GET_OVERHEAD_PROFIT_DATA_SUCCESS';

//DEPRECIATION
export const CREATE_DEPRICIATION_SUCCESS = 'CREATE_LABOUR_SUCCESS';
export const GET_DEPRICIATION_SUCCESS = 'GET_LABOUR_SUCCESS';
export const GET_DEPRECIATION_DATA_SUCCESS = 'GET_DEPRECIATION_DATA_SUCCESS';

//INTEREST RATE
export const GET_INTEREST_RATE_SUCCESS = 'GET_INTEREST_RATE_SUCCESS';
export const GET_INTEREST_RATE_COMBO_DATA_SUCCESS = 'GET_INTEREST_RATE_COMBO_DATA_SUCCESS';
export const GET_INTEREST_RATE_DATA_SUCCESS = 'GET_INTEREST_RATE_DATA_SUCCESS';

//COSTING
export const GET_PLANT_COMBO_SUCCESS = 'GET_PLANT_COMBO_SUCCESS';
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

//Login const
export const AUTH_API_FAILURE = 'AUTH_API_FAILURE';
export const AUTH_API_REQUEST = 'AUTH_API_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

//User 
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_DATA_SUCCESS = 'GET_USER_DATA_SUCCESS';
export const GET_USER_UNIT_DATA_SUCCESS = 'GET_USER_UNIT_DATA_SUCCESS';

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
export const GET_ALL_REASON_SELECTLIST = 'GET_ALL_REASON_SELECTLIST';

//PRIVILEGE
export const GET_MODULE_SELECTLIST_SUCCESS = 'GET_MODULE_SELECTLIST_SUCCESS';
export const GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS = 'GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS';
export const GET_PAGES_SELECTLIST_SUCCESS = 'GET_PAGES_SELECTLIST_SUCCESS';
export const GET_ACTION_HEAD_SELECTLIST_SUCCESS = 'GET_ACTION_HEAD_SELECTLIST_SUCCESS';
export const GET_MENU_BY_USER_DATA_SUCCESS = 'GET_MENU_BY_USER_DATA_SUCCESS';
export const GET_LEFT_MENU_BY_MODULE_ID_AND_USER = 'GET_LEFT_MENU_BY_MODULE_ID_AND_USER';

//REASON
export const GET_REASON_DATA_SUCCESS = 'GET_REASON_DATA_SUCCESS';
export const GET_REASON_SUCCESS = 'GET_REASON_SUCCESS';

//MHR
export const GET_MHR_COMBO_DATA_SUCCESS = 'GET_MHR_COMBO_DATA_SUCCESS';
export const GET_MHR_COMBO_DATA_FAILURE = 'GET_MHR_COMBO_DATA_FAILURE';
export const GET_MHR_DATALIST_SUCCESS = 'GET_MHR_DATALIST_SUCCESS';
export const GET_MHR_DATA_SUCCESS = 'GET_MHR_DATA_SUCCESS';
export const GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS = 'GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS';
export const GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS = 'GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS';

//MACHINE TYPE
export const CREATE_MACHINE_TYPE_SUCCESS = 'CREATE_MACHINE_TYPE_SUCCESS';
export const GET_MACHINE_TYPE_DATALIST_SUCCESS = 'GET_MACHINE_TYPE_DATALIST_SUCCESS';
export const GET_MACHINE_TYPE_DATA_SUCCESS = 'GET_MACHINE_TYPE_DATA_SUCCESS';
export const GET_MACHINE_TYPE_SELECTLIST_SUCCESS = 'GET_MACHINE_TYPE_SELECTLIST_SUCCESS';
export const GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS = 'GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS';
export const GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS = 'GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS';
export const GET_SHIFT_TYPE_SELECTLIST_SUCCESS = 'GET_SHIFT_TYPE_SELECTLIST_SUCCESS';
export const GET_MACHINE_TYPE_SELECTLIST = 'GET_MACHINE_TYPE_SELECTLIST';

//MACHINE
export const GET_MACHINE_DATALIST_SUCCESS = 'GET_MACHINE_DATALIST_SUCCESS';
export const GET_MACHINE_DATA_SUCCESS = 'GET_MACHINE_DATA_SUCCESS';
export const GET_DEPRECIATION_SELECTLIST_SUCCESS = 'GET_DEPRECIATION_SELECTLIST_SUCCESS';

//POWER MASTER
export const GET_POWER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_TYPE_SELECTLIST_SUCCESS';
export const GET_CHARGE_TYPE_SELECTLIST_SUCCESS = 'GET_CHARGE_TYPE_SELECTLIST_SUCCESS';
export const GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS = 'GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS';
export const GET_UOM_SELECTLIST_SUCCESS = 'GET_UOM_SELECTLIST_SUCCESS';
export const GET_POWER_DATALIST_SUCCESS = 'GET_POWER_DATALIST_SUCCESS';
export const GET_POWER_DATA_SUCCESS = 'GET_POWER_DATA_SUCCESS';

//CURRENCY EXCHANGE
export const GET_CURRENCY_SELECTLIST_SUCCESS = 'GET_CURRENCY_SELECTLIST_SUCCESS';

//VOLUME MASTER
export const GET_VOLUME_DATA_SUCCESS = 'GET_VOLUME_DATA_SUCCESS';

//CLIENT MASTER
export const GET_CLIENT_DATA_SUCCESS = 'GET_CLIENT_DATA_SUCCESS';
export const GET_CLIENT_SELECTLIST_SUCCESS = 'GET_CLIENT_SELECTLIST_SUCCESS';

//COSTING STATUS
export const DRAFT = 'Draft';
export const PENDING = 'PendingForApproval';
export const WAITING_FOR_APPROVAL = 'WaitingForApproval';
export const APPROVED = 'Approved';
export const REJECTED = 'Rejected';
export const FINAL_APPROVAL = 'Final Approval';

//DECIMAL VALUES FOR PRICE
export const TWO_DECIMAL_PRICE = 2;
export const FOUR_DECIMAL_PRICE = 4;

//DECIMAL VALUES FOR WEIGHT
export const FIVE_DECIMAL_WEIGHT = 5;

//LABOUR ENUMS
export const SKILLED = 'Skilled';
export const CONTRACT = 'Contract';
export const SEMI_SKILLED = 'Semi-Skilled';
export const UNSKILLED = 'Unskilled';


//POWER LIST ENUMS
export const SOLAR_POWER = 'Solar Power';
export const HYDRO_POWER = 'Hydro Power';
export const WIND_POWER = 'Wind Power';
export const GENERATOR_DIESEL = 'Generator Diesel';

//MODULE NAME ENUMS
export const DASHBOARD_AND_AUDIT = 'Dashboard And Audit';
export const MASTERS = 'Master';
export const ADDITIONAL_MASTERS = 'Additional Masters';
export const COSTING = 'Costing';
export const SIMULATION = 'Simulation';
export const REPORTS_AND_ANALYTICS = 'Reports And Analytics';
export const USERS = 'Users';

//PAGE NAMES
export const USER = 'User';
export const ROLE = 'Role';
export const DEPARTMENT = 'Department';
export const LEVELS = 'Levels';