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

export const RMSpecification = [
    { label: "RawMaterialName", value: "RawMaterialName" },
    { label: "Material", value: "Material" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "Specification", value: "Specification" },
    //{ label: "Plant", value: "Plant" },
]

export const RMSpecificationXLTempData = [
    {
        "RawMaterialName": "Aluminium",
        "Material": "Plastic",
        "RMGrade": "A1",
        "Specification": "Aluminium Wired",
        //"Plant": "Plant Name"
    }
]

export const Vendor = [
    { label: 'VendorType', value: 'VendorType', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
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
        'VendorType': 'Vendor Type Name',
        'VendorName': 'Vendor Name',
        'VendorCode': 'Vendor Code',
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

export const Processes = [
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'ProcessCode', value: 'ProcessCode', },
    { label: 'Description', value: 'Description', },
    { label: 'BasicProcessRate', value: 'BasicProcessRate', },
]

export const MachineClass = [
    { label: 'MachineClassName', value: 'MachineClassName', },
    { label: 'LabourTypeNames', value: 'LabourTypeNames', },
    { label: 'MachineCapacity', value: 'MachineCapacity', },
]

export const Labour = [
    { label: 'TechnologyName', value: 'TechnologyName', },
    { label: 'LabourTypeName', value: 'LabourTypeName', },
    { label: 'LabourRate', value: 'LabourRate', },
    { label: 'IsContractBase', value: 'IsContractBase', },
    { label: 'PlantName', value: 'PlantName', },
    { label: 'CityName', value: 'CityName', },
]

export const Operation = [
    { label: 'OperationName', value: 'OperationName', },
    { label: 'OperationCode', value: 'OperationCode', },
    { label: 'Description', value: 'Description', },
    { label: 'BasicOperationRate', value: 'BasicOperationRate', },
]

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

export const MHR = [
    { label: 'TechnologyName', value: 'TechnologyName', },
    { label: 'SupplierName', value: 'SupplierName', },
    { label: 'SupplierTypeName', value: 'SupplierTypeName', },
    { label: 'MachineName', value: 'MachineName', },
    { label: 'MachineTypeName', value: 'MachineTypeName', },
    { label: 'DepreciationType', value: 'DepreciationType', },
    { label: 'PowerType', value: 'PowerType', },
    { label: 'FuelDetailId', value: 'FuelDetailId', },
    { label: 'UnitOfMeasurementName', value: 'UnitOfMeasurementName', },
    { label: 'PlantName', value: 'PlantName', },
    { label: 'LabourTypes', value: 'LabourTypes', },
    { label: 'PUCCharges', value: 'PUCCharges', },
    { label: 'MaintenanceCharges', value: 'MaintenanceCharges', },
    { label: 'ServiceCharges', value: 'ServiceCharges', },
    { label: 'ConsumableCost', value: 'ConsumableCost', },
    { label: 'OtherCharges', value: 'OtherCharges', },
    { label: 'TotalMachineCost', value: 'TotalMachineCost', },
    { label: 'TotalDepreciationCost', value: 'TotalDepreciationCost', },
    { label: 'PowerRate', value: 'PowerRate', },
    { label: 'TotalPowerCost', value: 'TotalPowerCost', },
    { label: 'FuelRate', value: 'FuelRate', },
    { label: 'TotalFuelCost', value: 'TotalFuelCost', },
    { label: 'DepreciationType', value: 'DepreciationType', },
    { label: 'NumberOfSkilledLabour', value: 'NumberOfSkilledLabour', },
    { label: 'RateSkilledLabour', value: 'RateSkilledLabour', },
    { label: 'SkilledLabourWorkingDays', value: 'SkilledLabourWorkingDays', },
    { label: 'NumberOfSemiSkilledLabour', value: 'NumberOfSemiSkilledLabour', },
    { label: 'RateSemiSkilledLabour', value: 'RateSemiSkilledLabour', },
    { label: 'SemiSkilledLabourWorkingDays', value: 'SemiSkilledLabourWorkingDays', },
    { label: 'NumberOfUnskilledLabour', value: 'NumberOfUnskilledLabour', },
    { label: 'RateUnskilledLabour', value: 'RateUnskilledLabour', },
    { label: 'UnkilledLabourWorkingDays', value: 'UnkilledLabourWorkingDays', },
    { label: 'NumberOfContractLabour', value: 'NumberOfContractLabour', },
    { label: 'RateContractLabour', value: 'RateContractLabour', },
    { label: 'ContractLabourWorkingDays', value: 'ContractLabourWorkingDays', },
    { label: 'TotalLabourCost', value: 'TotalLabourCost', },
    { label: 'IsOtherSource', value: 'IsOtherSource', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'WorkingShift', value: 'WorkingShift', },
    { label: 'NumberOfWorkingDays', value: 'NumberOfWorkingDays', },
    { label: 'CalculatedMHRCost', value: 'CalculatedMHRCost', },
    { label: 'Efficiency', value: 'Efficiency', },
]

export const Fuel = [
    { label: 'Fuel Name', value: 'FuelName', },
    { label: 'State', value: 'State', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Effective Date', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM', },
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