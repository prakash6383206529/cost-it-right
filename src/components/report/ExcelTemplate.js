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
    { label: 'Existing Po Price (INR)', value: 'OldRate', },
    { label: 'Revised Po Price (INR)', value: 'NewRate', },
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
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'Freight Cost', value: 'RMFreightCost', },
    { label: 'Shearing Cost', value: 'RMShearingCost', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const RM_IMPORT_TEMPLATE = [
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'Freight Cost', value: 'RMFreightCost', },
    { label: 'Shearing Cost', value: 'RMShearingCost', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Currency)', value: 'NetLandedCost', },
    { label: 'Net Landed Total (INR)', value: 'NetLandedCostCurrency', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const BOP_DOMESTIC_TEMPLATE = [
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const BOP_IMPORT_TEMPLATE = [
    { label: 'Basic Rate', value: 'BasicRatePerUOM', },
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Currency)', value: 'NetLandedCost', },
    { label: 'Net Landed Total (INR)', value: 'NetLandedCostCurrency', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]
export const MACHINE_OPERATION_TEMPLATE = [
    { label: 'UOM', value: 'UnitOfMeasurement', },
    { label: 'Net Landed (Total)', value: 'NetLandedCost', },
    { label: 'Effective Date', value: 'EffectiveDate', }
]