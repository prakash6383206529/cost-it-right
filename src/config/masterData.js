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
        label: 'Fuel',
        value: 51
    },
    {
        label: 'OverheadAndProfit',
        value: 20
    },
    {
        label: 'Power',
        value: 12
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
    { label: 'CreatedBy', value: 'CreatedBy', },
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

export const Fuel = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const OverheadAndProfit = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const Power = [
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