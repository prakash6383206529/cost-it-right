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

export const Supplier = [
    { label: 'SupplierName', value: 'SupplierName', },
    { label: 'SupplierCode', value: 'SupplierCode', },
    { label: 'SupplierEmail', value: 'SupplierEmail', },
    { label: 'Description', value: 'Description', },
    { label: 'AddressLine1', value: 'AddressLine1', },
    { label: 'AddressLine2', value: 'AddressLine2', },
    { label: 'ZipCode', value: 'ZipCode', },
    { label: 'PhoneNumber', value: 'PhoneNumber', },
    { label: 'Extension', value: 'Extension', },
    { label: 'SupplierType', value: 'SupplierType', },
    { label: 'CityName', value: 'CityName', },
    { label: 'Plants', value: 'Plants', },
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

export const OverheadAndProfit = [
    { label: 'OverheadPercentage', value: 'OverheadPercentage', },
    { label: 'ProfitPercentage', value: 'ProfitPercentage', },
    { label: 'OverheadMachiningCCPercentage', value: 'OverheadMachiningCCPercentage', },
    { label: 'ProfitMachiningCCPercentage', value: 'ProfitMachiningCCPercentage', },
    { label: 'SupplierCode', value: 'SupplierCode', },
    { label: 'TechnologyName', value: 'TechnologyName', },
    { label: 'SupplierName', value: 'SupplierName', },
    { label: 'OverheadTypeName', value: 'OverheadTypeName', },
    { label: 'ProfitTypeName', value: 'ProfitTypeName', },
    { label: 'CostingModelNmae', value: 'CostingModelNmae', },
    { label: 'PlantName', value: 'PlantName', },
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
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const RM = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
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