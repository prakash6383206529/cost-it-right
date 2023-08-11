export const SALES_PROVISION_EXCEL_TEMPLATE = [

    { label: 'Plant (Code)', value: 'PlantName', },
    { label: 'Vendor (Code)', value: 'VendorName', },
    { label: 'Customer (Code)', value: 'CustomerName', },
    { label: 'Part Number', value: 'PartNumber', },
    { label: 'Part Description', value: 'PartDescription', },
    { label: 'Purchase Doc', value: 'PurchaseOrderNumber', },
    { label: 'Period From', value: 'FromDate', },
    { label: 'Period To', value: 'ToDate', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Existing Net Cost (INR)', value: 'OldRate', },
    { label: 'Revised Net Cost (INR)', value: 'NewRate', },
    { label: 'Variance (w.r.t. Existing)', value: 'Difference', },
    { label: 'Supply Quantity (No.)', value: 'SupplyQuantity', },
    { label: 'Impact', value: 'Impact', }
]
export const CUSTOMER_POAM_EXCEL_TEMPLATE = [

    { label: 'Plant (Code)', value: 'PlantName', },
    { label: 'Customer (Code)', value: 'CustomerName', },
    { label: 'Product Category', value: 'GroupCode', },
    { label: 'Part Description', value: 'PartDescription', },
    { label: 'Status of last Quarter II', value: 'LastQuarterQuantity', },
    { label: 'Sale Parts Quantity (No.)', value: 'TotalDispatchQuantity', },
    { label: 'Poam Received Quantity (No.)', value: 'TotalPOAMReceivedQuantity', },
    { label: 'Poam Received Cost (INR)', value: 'TotalPOAMReceivedCost', },
    { label: 'Tentative Po Quantity (No.)', value: 'TotalTentitivePOQuantity', },
    { label: 'Tentative Po Cost (INR)', value: 'TotalTentitivePOCost', },
    { label: 'No Dispatch Quantity (No.)', value: 'TotalNoDispatchQuantity', },
    { label: 'No Dispatch Cost (INR)', value: 'TotalNoDispatchCost', },
    { label: 'One Time Quantity (No.)', value: 'TotalOneTimeQuantity', },
    { label: 'One Time Cost (INR)', value: 'TotalOneTimeCost', },
    { label: 'Amendmend Awaited Quantity (No.)', value: 'TotalAmendmentAwaitedQuantity', },
    { label: 'Impact Cost (INR)', value: 'TotalImpact', },
    { label: 'Remark', value: 'Remark', },
]

//MASTER MOVEMENT EXCEL TEMPLATE

export const RM_DOMESTIC_TEMPLATE = [
    { label: 'RM Code', value: 'MasterCode' },
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'Freight Cost', value: 'RMFreightCost', },
    { label: 'Shearing Cost', value: 'RMShearingCost', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const RM_IMPORT_TEMPLATE = [
    { label: 'RM Code', value: 'MasterCode' },
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'Freight Cost', value: 'RMFreightCost', },
    { label: 'Shearing Cost', value: 'RMShearingCost', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Currency)', value: 'NetLandedCost', },
    { label: 'Net Landed Total (INR)', value: 'NetLandedCostCurrency', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const BOP_DOMESTIC_TEMPLATE = [
    { label: 'BOP No.', value: 'MasterCode', },
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const BOP_IMPORT_TEMPLATE = [
    { label: 'BOP No.', value: 'MasterCode', },
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Currency)', value: 'NetLandedCost', },
    { label: 'Net Landed Total (INR)', value: 'NetLandedCostCurrency', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const MACHINE_TEMPLATE = [
    { label: 'Machine No', value: 'MasterCode', },
    { label: 'Process Name', value: 'ProcessName', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const OPERATION_TEMPLATE = [
    { label: 'Operation Code', value: 'MasterCode', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]

export const GOT_GIVEN_EXCEL_TEMPLATE = [
    { label: 'Part Number', value: 'PartNumber' },
    { label: 'Revision No.', value: 'PartRevisionNumber' },
    { label: 'Part Description', value: 'PartDescription' },
    { label: 'Type', value: 'PartType' },
    { label: 'GW', value: 'RawMaterialGrossWeight' },
    { label: 'RM Rate', value: 'RawMaterialRate' },
    { label: 'Scrap Rate', value: 'RawMaterialScrapRate' },
    { label: 'Gr RM Cost', value: 'RawMaterialGrossWeightAndRate' },
    { label: 'FW', value: 'RawMaterialFinishWeight' },
    { label: 'Scrap Weight', value: 'RawMaterialScrapWeight' },
    { label: 'Net RM Cost', value: 'NetRawMaterialsCost' },
    { label: 'Profit of Component', value: 'ProfitRMTotalCost' },
    { label: 'Process Cost of Component', value: 'NetProcessCost' },
    { label: 'Profit of Component on CC (%)', value: 'ProfitCCPercentage' },
    { label: 'Sub Total', value: 'SubTotal' },
    { label: 'Revised RM Rate', value: 'NewRawMaterialRate' },
    { label: 'Revised Scrap Rate', value: 'NewRawMaterialScrapRate' },
    { label: 'RM Variance', value: 'RawMaterialCostVariance' },
    { label: 'Sum product', value: 'ProductSum' },
    { label: 'Rejection', value: 'NewRejectionCost' },
    { label: 'Packaging and Freight of Part', value: 'NewNetFreightPackagingCost' },
    { label: 'ICC of Part', value: 'NewICCCost' },
    { label: 'Sub total', value: 'NewSubTotal' },
    { label: 'Total', value: 'Total' },
    { label: '', value: '' },
    { label: '', value: '' },
    //GIVEN DETAILS
    { label: 'Vendor Name', value: 'givenVendorName' },
    { label: 'SAP Code', value: 'givenSAPCode' },
    { label: 'Part Description', value: 'givenPartDescription' },
    { label: 'Type', value: 'givenPartType' },
    { label: 'GW', value: 'givenRawMaterialGrossWeight' },
    { label: 'RM Rate', value: 'givenRawMaterialRate' },
    { label: 'Scrap Rate', value: 'givenRawMaterialScrapRate' },
    { label: 'Gr RM Cost', value: 'givenRawMaterialGrossWeightAndRate' },
    { label: 'FW', value: 'givenRawMaterialFinishWeight' },
    { label: 'Scrap Weight', value: 'givenRawMaterialScrapWeight' },
    { label: 'Net RM Cost', value: 'givenNetRawMaterialsCost' },
    { label: 'Profit of Component', value: 'givenProfitRMTotalCost' },
    { label: 'Process Cost of Component', value: 'givenNetProcessCost' },
    { label: 'Profit of Component on CC (%)', value: 'givenProfitCCPercentage' },
    { label: 'Sub Total', value: 'givenSubTotal' },
    { label: 'Revised RM Rate', value: 'givenNewRawMaterialRate' },
    { label: 'Revised Scrap Rate', value: 'givenNewRawMaterialScrapRate' },
    { label: 'RM Variance', value: 'givenRawMaterialCostVariance' },
    { label: 'Sum product', value: 'givenProductSum' },
    { label: 'Rejection', value: 'givenNewRejectionCost' },
    { label: 'Packaging and Freight of Part', value: 'givenNewNetFreightPackagingCost' },
    { label: 'ICC of Part', value: 'givenNewICCCost' },
    { label: 'Sub total', value: 'givenNewSubTotal' },
    { label: 'Total', value: 'givenTotal' },
    { label: '', value: '' },
    { label: '', value: '' },
    //VARIANCE
    { label: 'Variance', value: 'TotalDelta' },
    { label: 'Variance (%)', value: 'TotalDeltaPercentage' }
]


export const GOT_GIVEN_EXCEL_TEMPLATE_SUMMARY = [
    { label: 'Model No.', value: 'TokenNumber' },
    { label: 'Part No.', value: 'PartNumber' },
    { label: 'Part Description', value: 'PartDescription' },
    { label: 'BAL Sale Rate 01.01.22 (A)', value: 'VendorName' },
    { label: '', value: '' },
    { label: 'Given Cost', value: 'NetPOPrice' },
    { label: '', value: '' },
    { label: 'Variance', value: 'NetPOPriceDelta' },
    { label: 'Variance (%)', value: 'NetPOPriceDeltaPercentage' },
]
