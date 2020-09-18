import moment from 'moment';
/**
 * master listing used in Mass Upload
 * 
 */
export const Masters = [
    {
        label: 'Supplier',
        value: 1
    },
    {
        label: 'Plant',
        value: 2
    },
    {
        label: 'BOP',
        value: 3
    },
    {
        label: 'Processes',
        value: 4
    },
    {
        label: 'MachineClass',
        value: 5
    },
    {
        label: 'Labour',
        value: 6
    },
    {
        label: 'Operation',
        value: 7
    },
    {
        label: 'OtherOperation',
        value: 8
    },
    {
        label: 'Power',
        value: 9
    },
    {
        label: 'OverheadAndProfit',
        value: 10
    },
    {
        label: 'MHR',
        value: 11
    },
    {
        label: 'Fuel',
        value: 51
    },
    {
        label: 'RM',
        value: 9
    },
];

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMDomesticZBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "Material", value: "Material" },
    { label: "Plant", value: "Plant" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: "Remark", value: "Remark" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const RMDomesticZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "RawMaterial Name",
        "RMGrade": "RMGrade Name",
        "RMSpec": "RMSpec Name",
        "Category": "Category Name",
        "Material": "Aluminium",
        "Plant": "Plant Name",
        "VendorName": "Vendor Name",
        "VendorCode": "Vendor123",
        "VendorLocation": "Vendor Location",
        "HasDifferentSource": "YES or NO",
        "Source": "Source Name",
        "SourceLocation": "Source Location",
        "UOM": "Kilogram or Litre",
        "BasicRate": "0",
        "ScrapRate": "0",
        "Remark": "Remark Content",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMDomesticVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "Material", value: "Material" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" },
    { label: "VendorPlant", value: "VendorPlant" },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: "Remark", value: "Remark" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const RMDomesticVBCTempData = [
    {
        //"CostingHead": "VBC",
        "RawMaterial": "RawMaterial Name",
        "RMGrade": "RMGrade Name",
        "RMSpec": "RMSpec Name",
        "Category": "Category Name",
        "Material": "Aluminium",
        "VendorName": "Vendor Name",
        "VendorCode": "Vendor123",
        "VendorPlant": "VendorPlant",
        "VendorLocation": "Vendor Location",
        "Source": "Source Name",
        "SourceLocation": "Source Location",
        "UOM": "Unit Of Measurement",
        "BasicRate": "0",
        "ScrapRate": "0",
        "Remark": "Remark Content",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportZBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "Material", value: "Material" },
    { label: "Plant", value: "Plant" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "Currency", value: "Currency" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: "Remark", value: "Remark" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]


export const RMImportZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "RawMaterial Name",
        "RMGrade": "RMGrade Name",
        "RMSpec": "RMSpec Name",
        "Category": "Category Name",
        "Material": "Aluminium",
        "Plant": "Plant Name",
        "VendorName": "Vendor Name",
        "VendorCode": "Vendor123",
        "VendorLocation": "Vendor Location",
        "HasDifferentSource": "YES or NO",
        "Source": "Source Name",
        "SourceLocation": "Source Location",
        "Currency": "Currency USD or INR",
        "UOM": "Kilogram or Litre",
        "BasicRate": "0",
        "ScrapRate": "0",
        "Remark": "Remark Content",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "Material", value: "Material" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" },
    { label: "VendorPlant", value: "VendorPlant" },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "Currency", value: "Currency" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: "Remark", value: "Remark" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const RMImportVBCTempData = [
    {
        //"CostingHead": "VBC",
        "RawMaterial": "RawMaterial Name",
        "RMGrade": "RMGrade Name",
        "RMSpec": "RMSpec Name",
        "Category": "Category Name",
        "Material": "Aluminium",
        "VendorName": "Vendor Name",
        "VendorCode": "Vendor123",
        "VendorPlant": "VendorPlant",
        "VendorLocation": "Vendor Location",
        "Source": "Source Name",
        "SourceLocation": "Source Location",
        "Currency": "Currency USD or INR",
        "UOM": "Kilogram or Litre",
        "BasicRate": "0",
        "ScrapRate": "0",
        "Remark": "Remark Content",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMSpecification = [
    { label: "RawMaterialName", value: "RawMaterialName" },
    { label: "Material", value: "Material" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "Specification", value: "Specification" },
]

export const RMSpecificationXLTempData = [
    {
        "RawMaterialName": "Aluminium",
        "Material": "Plastic",
        "RMGrade": "A1",
        "Specification": "Aluminium Wired",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Vendor = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'RawMaterialVendor', value: 'RawMaterialVendor', },
    { label: 'LabourVendor', value: 'LabourVendor', },
    { label: 'VBCVendor', value: 'VBCVendor', },
    { label: 'BOPVendor', value: 'BOPVendor', },
    { label: 'VendorEmail', value: 'VendorEmail', },
    { label: 'MobileNumber', value: 'MobileNumber', },
    { label: 'AddressLine1', value: 'AddressLine1', },
    { label: 'AddressLine2', value: 'AddressLine2', },
    { label: 'ZipCode', value: 'ZipCode', },
    { label: 'PhoneNumber', value: 'PhoneNumber', },
    { label: 'Extension', value: 'Extension', },
    { label: 'City', value: 'City', },
    { label: 'State', value: 'State', },
    { label: 'Country', value: 'Country', },
]

export const VendorTempData = [
    {
        'VendorName': 'Vendor Name',
        'VendorCode': 'Vendor Code',
        'RawMaterialVendor': 'YES OR NO',
        'LabourVendor': 'YES OR NO',
        'VBCVendor': 'YES OR NO',
        'BOPVendor': 'YES OR NO',
        'VendorEmail': 'Vendor Email',
        'MobileNumber': 'Mobile Number',
        'AddressLine1': 'Address',
        'AddressLine2': 'Address',
        'ZipCode': 'Zip Code',
        'PhoneNumber': 'Phone Number',
        'Extension': 'Extension',
        'City': 'City',
        'State': 'State',
        'Country': 'Country',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Overhead = [
    { label: 'CostingHead', value: 'CostingHead', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'OverheadApplicability', value: 'OverheadApplicability', },
    { label: 'OverheadPercentage', value: 'OverheadPercentage', },
    { label: 'OverheadMachiningCCPercentage', value: 'OverheadMachiningCCPercentage', },
    { label: 'OverheadBOPPercentage', value: 'OverheadBOPPercentage', },
    { label: 'OverheadRMPercentage', value: 'OverheadRMPercentage', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'Remark', value: 'Remark', },
]

export const OverheadTempData = [
    {
        'CostingHead': 'CostingHead',
        'ModelType': 'ModelType',
        'OverheadApplicability': 'OverheadApplicability',
        'OverheadPercentage': 'OverheadPercentage',
        'OverheadMachiningCCPercentage': 'OverheadMachiningCCPercentage',
        'OverheadBOPPercentage': 'OverheadBOPPercentage',
        'OverheadRMPercentage': 'OverheadRMPercentage',
        'VendorName': 'VendorName',
        'VendorCode': 'VendorCode',
        'Remark': 'Remark',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const ZBCOperation = [
    { label: 'Technology', value: 'Technology', },
    { label: 'OperationName', value: 'OperationName', },
    { label: 'OperationCode', value: 'OperationCode', },
    { label: 'Description', value: 'Description', },
    { label: 'Plant', value: 'Plant', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'LabourRate', value: 'LabourRate', },
    { label: 'Remark', value: 'Remark', },
]

export const ZBCOperationTempData = [
    {
        'Technology': 'Technology',
        'OperationName': 'Operation Name',
        'OperationCode': 'Operation Code',
        'Description': 'Description',
        'Plant': 'Plant',
        'UOM': 'Unit of Measurement',
        'Rate': 0,
        'LabourRate': 0,
        'Remark': 'Remark',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCOperation = [
    { label: 'Technology', value: 'Technology', },
    { label: 'OperationName', value: 'OperationName', },
    { label: 'OperationCode', value: 'OperationCode', },
    { label: 'Description', value: 'Description', },
    { label: 'Plant', value: 'Plant', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'VendorPlant', value: 'VendorPlant', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'LabourRate', value: 'LabourRate', },
    { label: 'Remark', value: 'Remark', },
]

export const VBCOperationTempData = [
    {
        'Technology': 'Technology',
        'OperationName': 'OperationName',
        'OperationCode': 'OperationCode',
        'Description': 'Description',
        'Plant': 'Plant',
        'VendorName': 'VendorName',
        'VendorCode': 'VendorCode',
        'VendorPlant': 'VendorPlant',
        'UOM': 'Unit of Measurement',
        'Rate': 0,
        'LabourRate': 0,
        'Remark': 'Remark',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Profit = [
    { label: 'CostingHead', value: 'CostingHead', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'ProfitApplicability', value: 'ProfitApplicability', },
    { label: 'ProfitPercentage', value: 'ProfitPercentage', },
    { label: 'ProfitMachiningCCPercentage', value: 'ProfitMachiningCCPercentage', },
    { label: 'ProfitBOPPercentage', value: 'ProfitBOPPercentage', },
    { label: 'ProfitRMPercentage', value: 'ProfitRMPercentage', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'Remark', value: 'Remark', },
]

export const ProfitTempData = [
    {
        'CostingHead': 'CostingHead',
        'ModelType': 'ModelType',
        'ProfitApplicability': 'ProfitApplicability',
        'ProfitPercentage': 'ProfitPercentage',
        'ProfitMachiningCCPercentage': 'ProfitMachiningCCPercentage',
        'ProfitBOPPercentage': 'ProfitBOPPercentage',
        'ProfitRMPercentage': 'ProfitRMPercentage',
        'VendorName': 'VendorName',
        'VendorCode': 'VendorCode',
        'Remark': 'Remark',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Labour = [
    { label: 'EmploymentTerms', value: 'EmploymentTerms', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'State', value: 'State', },
    { label: 'Plant', value: 'Plant', },
    { label: 'MachineType', value: 'MachineType', },
    { label: 'LabourType', value: 'LabourType', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'LabourRate', value: 'LabourRate', },
]

export const LabourTempData = [
    {
        'EmploymentTerms': 'Employ or Contractual',
        'VendorName': 'Vendor Name',
        'State': 'State',
        'Plant': 'Plant',
        'MachineType': 'Machine Type',
        'LabourType': 'Labour Type',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'LabourRate': 0,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Fuel = [
    { label: 'FuelName', value: 'FuelName', },
    { label: 'State', value: 'State', },
    { label: 'Rate', value: 'Rate', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM', },
]

export const FuelTempData = [
    {
        'FuelName': 'FuelName',
        'State': 'State',
        'Rate': 'Rate',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'UOM',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Plant = [
    { label: 'PlantName', value: 'PlantName', },
    { label: 'PlantTitle', value: 'PlantTitle', },
    { label: 'UnitNumber', value: 'UnitNumber', },
    { label: 'AddressLine1', value: 'AddressLine1', },
    { label: 'AddressLine2', value: 'AddressLine2', },
    { label: 'ZipCode', value: 'ZipCode', },
    { label: 'PhoneNumber', value: 'PhoneNumber', },
    { label: 'Extension', value: 'Extension', },
    { label: 'CityName', value: 'CityName', },
    { label: 'IsPlantForZBC', value: 'IsPlantForZBC', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Bought_Out_Parts = [
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Quantity', value: 'Quantity', },
    { label: 'NetLandedCost', value: 'NetLandedCost', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'TechnologyName', value: 'TechnologyName', },
    { label: 'CategoryName', value: 'CategoryName', },
    { label: 'CategoryTypeName', value: 'CategoryTypeName', },
    { label: 'Specification', value: 'Specification', },
    { label: 'MaterialTypeName', value: 'MaterialTypeName', },
    { label: 'SourceSupplierCityName', value: 'SourceSupplierCityName', },
    { label: 'SourceSupplierName', value: 'SourceSupplierName', },
    { label: 'UnitOfMeasurementName', value: 'UnitOfMeasurementName', },
    { label: 'PlantName', value: 'PlantName', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Processes = [
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'ProcessCode', value: 'ProcessCode', },
    { label: 'Description', value: 'Description', },
    { label: 'BasicProcessRate', value: 'BasicProcessRate', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineClass = [
    { label: 'MachineClassName', value: 'MachineClassName', },
    { label: 'LabourTypeNames', value: 'LabourTypeNames', },
    { label: 'MachineCapacity', value: 'MachineCapacity', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const OtherOperation = [
    { label: 'Rate', value: 'Rate', },
    { label: 'OtherOperationName', value: 'OtherOperationName', },
    { label: 'OperationProcessCode', value: 'OperationProcessCode', },
    { label: 'Description', value: 'Description', },
    { label: 'TechnologyName', value: 'TechnologyName', },
    { label: 'SupplierName', value: 'SupplierName', },
    { label: 'OperationName', value: 'OperationName', },
    { label: 'UnitOfMeasurementName', value: 'UnitOfMeasurementName', },
    { label: 'PlantName', value: 'PlantName', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Power = [
    { label: 'PowerChargesType', value: 'PowerChargesType', },
    { label: 'PowerType', value: 'PowerType', },
    { label: 'PowerSupplierName', value: 'PowerSupplierName', },
    { label: 'PlantName', value: 'PlantName', },
    { label: 'UnitOfMeasurementName', value: 'UnitOfMeasurementName', },
    { label: 'FuelName', value: 'FuelName', },
    { label: 'ContractDemandKVA', value: 'ContractDemandKVA', },
    { label: 'DemandChargesRsPerKVA', value: 'DemandChargesRsPerKVA', },
    { label: 'AvgUnitConsumptionPerMonth', value: 'AvgUnitConsumptionPerMonth', },
    { label: 'MaxDemandCharges', value: 'MaxDemandCharges', },
    { label: 'EnergyChargesUnit', value: 'EnergyChargesUnit', },
    { label: 'MeterRent', value: 'MeterRent', },
    { label: 'FuelCostPerUnit', value: 'FuelCostPerUnit', },
    { label: 'DutyOnEnergyCharges', value: 'DutyOnEnergyCharges', },
    { label: 'DutyOnEnergyFCA', value: 'DutyOnEnergyFCA', },
    { label: 'TotalUnitCharge', value: 'TotalUnitCharge', },
    { label: 'PercentOfUsageToStateElectricityBoard', value: 'PercentOfUsageToStateElectricityBoard', },
    { label: 'PercentOfUsageToSelfGenerated', value: 'PercentOfUsageToSelfGenerated', },
    { label: 'NetPowerCost', value: 'NetPowerCost', },
    { label: 'Remark', value: 'Remark', },
    { label: 'Division', value: 'Division', },
    { label: 'PercentFCA', value: 'PercentFCA', },
    { label: 'PowerRateing', value: 'PowerRateing', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineZBC = [
    { label: 'Technology', value: 'Technology', },
    { label: 'Plant', value: 'Plant', },
    { label: 'MachineNo', value: 'MachineNo', },
    { label: 'MachineName', value: 'MachineName', },
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapicityAndTonnage', value: 'MachineCapicityAndTonnage', },
    { label: 'Description', value: 'Description', },
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'UOM', value: 'UOM', },
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineZBCTempData = [
    {
        'Technology': 'Technology',
        'Plant': 'Plant',
        'MachineNo': 'Machine No',
        'MachineName': 'Machine Name',
        'MachineType': 'Machine Type',
        'MachineCapicityAndTonnage': 'Machine Capicity And Tonnage',
        'Description': 'Description',
        'ProcessName': 'Process Name',
        'UOM': 'UOM',
        'MachineRate': 0,
        'Remark': 'Remark',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBC = [
    { label: "Technology", value: "Technology", },
    { label: "Ownership", value: "Ownership", },
    { label: "Plant", value: "Plant", },
    { label: "MachineNo", value: "MachineNo", },
    { label: "MachineName", value: "MachineName", },
    { label: "MachineType", value: "MachineType", },
    { label: "Manufacturer", value: "Manufacturer", },
    { label: "YearOfManufacturing", value: "YearOfManufacturing", },
    { label: "MachineCapicityAndTonnage", value: "MachineCapicityAndTonnage", },
    { label: "MachineCost", value: "MachineCost", },
    { label: "AccessoriesCost", value: "AccessoriesCost", },
    { label: "UOM", value: "UOM", },
    { label: "InstallationCost", value: "InstallationCost", },
    { label: "TotalCost", value: "TotalCost", },
    { label: "Loan", value: "Loan", },
    { label: "LoanValue", value: "LoanValue", },
    { label: "Equity", value: "Equity", },
    { label: "EquityValue", value: "EquityValue", },
    { label: "RateOfInterest", value: "RateOfInterest", },
    { label: "RateOfInterestValue", value: "RateOfInterestValue", },
    { label: "NoOfShifts", value: "NoOfShifts", },
    { label: "WorkingHoursPerShift", value: "WorkingHoursPerShift", },
    { label: "NoOfWorkingDaysPerYear", value: "NoOfWorkingDaysPerYear", },
    { label: "Efficiency", value: "Efficiency", },
    { label: "NoOfWorkingHourPerYear", value: "NoOfWorkingHourPerYear", },
    { label: "DepreciationType", value: "DepreciationType", },
    { label: "DepriciationRate", value: "DepriciationRate", },
    { label: "LifeOfAsset", value: "LifeOfAsset", },
    { label: "CostOfScrap", value: "CostOfScrap", },
    { label: "DateOfPurchase", value: "DateOfPurchase", },
    { label: "DepriciationAmount", value: "DepriciationAmount", },
    { label: "AnnualMaintance", value: "AnnualMaintance", },
    { label: "AnnualMaintanaceAmount", value: "AnnualMaintanaceAmount", },
    { label: "AnnualConsumable", value: "AnnualConsumable", },
    { label: "AnnualConsumableAmount", value: "AnnualConsumableAmount", },
    { label: "InsuaranceType", value: "InsuaranceType", },
    { label: "InsuraceAmount", value: "InsuraceAmount", },
    { label: "BuildingCostPerSqFt", value: "BuildingCostPerSqFt", },
    { label: "MachineFloorAreaSqPerFt", value: "MachineFloorAreaSqPerFt", },
    { label: "AnnualAreaCost", value: "AnnualAreaCost", },
    { label: "OtherYearlyCost", value: "OtherYearlyCost", },
    { label: "TotalMachineCostPerAnnum", value: "TotalMachineCostPerAnnum", },
    { label: "UsesFuel", value: "UsesFuel", },
    { label: "Fuel", value: "Fuel", },
    { label: "FuelCostPerUOM", value: "FuelCostPerUOM", },
    { label: "ConsumptionPerAnnum", value: "ConsumptionPerAnnum", },
    { label: "UtilizingFactor", value: "UtilizingFactor", },
    { label: "PowerRatingKW", value: "PowerRatingKW", },
    { label: "UsesSolarPower", value: "UsesSolarPower", },
    { label: "TotalPowerCostAnnum", value: "TotalPowerCostAnnum", },
    { label: "LabourType", value: "LabourType", },
    { label: "NoOfPeople", value: "NoOfPeople", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "OutputPerHoursr", value: "OutputPerHoursr", },
    { label: "OutputPerAnnum", value: "OutputPerAnnum", },
    { label: "MachineRate", value: "MachineRate", }

]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBCTempData = [
    {
        "Technology": "Technology",
        "Ownership": "Ownership",
        "Plant": "Plant",
        "MachineNo": "MAC-001",
        "MachineName": "Machine Name",
        "MachineType": "Machine Type",
        "Manufacturer": "Manufacturer",
        "YearOfManufacturing": moment().format('YYYY'),
        "MachineCapicityAndTonnage": "MachineCapicityAndTonnage",
        "MachineCost": 0,
        "AccessoriesCost": 0,
        "UOM": "UOM",
        "InstallationCost": 0,
        "TotalCost": 0,
        "Loan": 0,
        "LoanValue": 0,
        "Equity": "Equity %",
        "EquityValue": 0,
        "RateOfInterest": "RateOfInterest",
        "RateOfInterestValue": 0,
        "NoOfShifts": "NoOfShifts",
        "WorkingHoursPerShift": 0,
        "NoOfWorkingDaysPerYear": 0,
        "Efficiency": "Availability",
        "NoOfWorkingHourPerYear": 0,
        "DepreciationType": "DepreciationType",
        "DepriciationRate": 0,
        "LifeOfAsset": 0,
        "CostOfScrap": 0,
        "DateOfPurchase": moment().format('DD-MM-YYYY'),
        "DepriciationAmount": 0,
        "AnnualMaintance": 0,
        "AnnualMaintanaceAmount": 0,
        "AnnualConsumable": 0,
        "AnnualConsumableAmount": 0,
        "InsuaranceType": "InsuaranceType",
        "InsuraceAmount": 0,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "AnnualAreaCost": 0,
        "OtherYearlyCost": 0,
        "TotalMachineCostPerAnnum": 0,
        "UsesFuel": "Uses Fuel",
        "Fuel": "Fuel",
        "FuelCostPerUOM": 0,
        "ConsumptionPerAnnum": 0,
        "UtilizingFactor": "UtilizingFactor",
        "PowerRatingKW": "Power Rating KW",
        "UsesSolarPower": "YES OR NO",
        "TotalPowerCostAnnum": "TotalPowerCostAnnum",
        "LabourType": "LabourType",
        "NoOfPeople": 0,
        "ProcessName": "Process Name",
        "OutputPerHoursr": 0,
        "OutputPerAnnum": 0,
        "MachineRate": 0,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineVBC = [
    { label: 'Technology', value: 'Technology', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'VendorPlant', value: 'VendorPlant', },
    { label: 'MachineNo', value: 'MachineNo', },
    { label: 'MachineName', value: 'MachineName', },
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapicityAndTonnage', value: 'MachineCapicityAndTonnage', },
    { label: 'Description', value: 'Description', },
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'UOM', value: 'UOM', },
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineVBCTempData = [
    {
        'Technology': 'Technology',
        'VendorName': 'Vendor Name',
        'VendorCode': 'Vendor Code',
        'VendorPlant': 'Vendor Plant',
        'MachineNo': 'Machine No',
        'MachineName': 'Machine Name',
        'MachineType': 'Machine Type',
        'MachineCapicityAndTonnage': 'Machine Capicity And Tonnage',
        'Description': 'Description',
        'ProcessName': 'ProcessName',
        'UOM': 'UOM',
        'MachineRate': 'Machine Rate',
        'Remark': 'Remark',
    }
]

export const EAccessType = [
    { label: '--Select EAccess Type--', value: '', },
    { label: 'ReadOnly', value: 0, },
    { label: 'Self', value: 1, },
    { label: 'Group', value: 2, },
    { label: 'Everyone', value: 3, },
]

export const Months = [
    { Text: 'January', Value: 'January' },
    { Text: 'February', Value: 'February' },
    { Text: 'March', Value: 'March' },
    { Text: 'April', Value: 'April' },
    { Text: 'May', Value: 'May' },
    { Text: 'June', Value: 'June' },
    { Text: 'July', Value: 'July' },
    { Text: 'August', Value: 'August' },
    { Text: 'September', Value: 'September' },
    { Text: 'October', Value: 'October' },
    { Text: 'November', Value: 'November' },
    { Text: 'December', Value: 'December' },
]

export const Years = [
    { Text: '2010', Value: '2010' },
    { Text: '2011', Value: '2011' },
    { Text: '2012', Value: '2012' },
    { Text: '2013', Value: '2013' },
    { Text: '2014', Value: '2014' },
    { Text: '2015', Value: '2015' },
    { Text: '2016', Value: '2016' },
    { Text: '2017', Value: '2017' },
    { Text: '2018', Value: '2018' },
    { Text: '2019', Value: '2019' },
    { Text: '2020', Value: '2020' },
    { Text: '2021', Value: '2021' },
]

export const monthSequence = [
    { seq: 0, month: 'April' },
    { seq: 1, month: 'May' },
    { seq: 2, month: 'June' },
    { seq: 3, month: 'July' },
    { seq: 4, month: 'August' },
    { seq: 5, month: 'September' },
    { seq: 6, month: 'October' },
    { seq: 7, month: 'November' },
    { seq: 8, month: 'December' },
    { seq: 9, month: 'January' },
    { seq: 10, month: 'February' },
    { seq: 11, month: 'March' },
] 