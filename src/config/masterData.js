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
        label: 'BOP-Domestic',
        value: 24
    },
    {
        label: 'BOP-Import',
        value: 22
    },
    {
        label: 'Fuel',
        value: 51
    },
    {
        label: 'MHR-Casting-Ferrous-VBC',
        value: 29
    },
    {
        label: 'MHR-Forging-VBC',
        value: 30
    },
    {
        label: 'MHR-VBC',
        value: 28
    },
    {
        label: 'MHR-ZBC',
        value: 27
    },
    {
        label: 'OtherOperation',
        value: 55
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
        label: 'RawMaterial-Domestic',
        value: 25
    },
    {
        label: 'RawMaterial-Import',
        value: 23
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

export const BOP_Domestic = [
    { label: 'Technology', value: 'Technology', },
    { label: 'SupplierPartNo', value: 'SupplierPartNo', },
    { label: 'Category', value: 'Category', },
    { label: 'Specification', value: 'Specification', },
    { label: 'Material', value: 'Material', },
    { label: 'SourceSupplier', value: 'SourceSupplier', },
    { label: 'SourceSupplierLocation', value: 'SourceSupplierLocation', },
    { label: 'DestinationSupplier', value: 'DestinationSupplier', },
    { label: 'DestinationSupplierLocation', value: 'DestinationSupplierLocation', },
]

export const BOP_Import = [
    { label: 'Technology', value: 'Technology', },
    { label: 'SupplierPartNo', value: 'SupplierPartNo', },
    { label: 'Category', value: 'Category', },
    { label: 'Specification', value: 'Specification', },
    { label: 'Material', value: 'Material', },
    { label: 'SourceSupplier', value: 'SourceSupplier', },
    { label: 'SourceSupplierLocation', value: 'SourceSupplierLocation', },
    { label: 'DestinationSupplier', value: 'DestinationSupplier', },
    { label: 'DestinationSupplierLocation', value: 'DestinationSupplierLocation', },
]

export const MHR_Casting_Ferrous_VBC = [
    { label: 'Technology', value: 'Technology', },
    { label: 'SupplierPartNo', value: 'SupplierPartNo', },
    { label: 'Category', value: 'Category', },
    { label: 'Specification', value: 'Specification', },
    { label: 'Material', value: 'Material', },
    { label: 'SourceSupplier', value: 'SourceSupplier', },
    { label: 'SourceSupplierLocation', value: 'SourceSupplierLocation', },
    { label: 'DestinationSupplier', value: 'DestinationSupplier', },
    { label: 'DestinationSupplierLocation', value: 'DestinationSupplierLocation', },
]

export const Fuel = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const MHR_Forging_VBC = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const MHR_VBC = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const MHR_ZBC = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const OtherOperation = [
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

export const RawMaterial_Domestic = [
    { label: 'State', value: 'State', },
    { label: 'Fuel', value: 'Fuel', },
    { label: 'UOM', value: 'UOM', },
    { label: 'Rate', value: 'Rate', },
    { label: 'Date', value: 'Date', },
]

export const RawMaterial_Import = [
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