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
    { label: "TechnologyName", value: "TechnologyName" },
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
        "RMGrade": "1",
        "RMSpec": "2",
        "Category": "Category Name",
        "TechnologyName": "Technology Name",
        "Material": "Material Name",
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
    { label: "TechnologyName", value: "TechnologyName" },
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
        "TechnologyName": "Technology Name",
        "Material": "Material Name",
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
    { label: "TechnologyName", value: "TechnologyName" },
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
        "TechnologyName": "Technology Name",
        "Material": "Material Name",
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
    { label: "TechnologyName", value: "TechnologyName" },
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
        "TechnologyName": "Technology Name",
        "Material": "Material Name",
        "VendorName": "Vendor Name",
        "VendorCode": "Vendor123",
        "VendorPlant": "Vendor Plant Name",
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
        "RawMaterialName": "Raw Material 1",
        "Material": "Material 1",
        "RMGrade": "RM Grade 1",
        "Specification": "10mm",
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
        'VendorEmail': 'Vendor@gmail.com',
        'MobileNumber': '1234567890',
        'AddressLine1': '123, Area location',
        'AddressLine2': '123, Area location',
        'ZipCode': '123456',
        'PhoneNumber': '1234567899',
        'Extension': '123',
        'City': 'Indore',
        'State': 'MP',
        'Country': 'India',
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
        'CostingHead': 'Costing Head',
        'ModelType': 'High',
        'OverheadApplicability': 'RM',
        'OverheadPercentage': '10',
        'OverheadMachiningCCPercentage': '10',
        'OverheadBOPPercentage': '10',
        'OverheadRMPercentage': '10',
        'VendorName': 'Vendor123',
        'VendorCode': 'Vendor Code1',
        'Remark': 'Remark Text',
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
        'Technology': 'Technology Name',
        'OperationName': 'Operation 1',
        'OperationCode': 'Operation 123',
        'Description': 'Description Text',
        'Plant': 'Plant123',
        'UOM': 'Unit of Measurement',
        'Rate': 0,
        'LabourRate': 0,
        'Remark': 'Remark Text',
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
        'Technology': 'Technology Name',
        'OperationName': 'Operation 1',
        'OperationCode': 'Operation Code123',
        'Description': 'Description',
        'Plant': 'P123',
        'VendorName': 'Vendor 123',
        'VendorCode': 'Vendor Code123',
        'VendorPlant': 'Vendor Plant',
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
        'ModelType': 'High',
        'ProfitApplicability': 'RM',
        'ProfitPercentage': '10',
        'ProfitMachiningCCPercentage': '10',
        'ProfitBOPPercentage': '10',
        'ProfitRMPercentage': '10',
        'VendorName': 'Vendor Name',
        'VendorCode': 'Vendor Code123',
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
        'State': 'MP',
        'Plant': 'P1',
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
        'FuelName': 'Petrol',
        'State': 'MP',
        'Rate': '100',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'Litre',
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
export const BOP_ZBC_DOMESTIC = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', },
    { label: 'BOPPartName', value: 'BOPPartName', },
    { label: 'BOPCategory', value: 'BOPCategory', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'Specification', value: 'Specification', },
    { label: 'Plant', value: 'Plant', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'NoOfPcs', value: 'NoOfPcs', },
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Remark', value: 'Remark', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM' }
]

export const BOP_ZBC_DOMESTIC_TempData = [
    {
        'BOPPartNumber': 'BOP1',
        'BOPPartName': 'BOP Name',
        'BOPCategory': 'Category 1',
        'PartNumber': 'P1',
        'Specification': 'BOP Specification',
        'Plant': 'Plant1',
        'VendorName': 'Vendor Name123',
        'NoOfPcs': '1',
        'BasicRate': '100',
        'Remark': 'Remark Text',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'Kilogram'
    },
    {
        'BOPPartNumber': 'BOP1',
        'BOPPartName': 'BOP Name',
        'BOPCategory': 'Category 1',
        'PartNumber': 'P1',
        'Specification': 'BOP Specification',
        'Plant': 'Plant1',
        'VendorName': 'Vendor Name123',
        'NoOfPcs': '1',
        'BasicRate': '100',
        'Remark': 'Remark Text',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'Kilogram'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_DOMESTIC = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', },
    { label: 'BOPPartName', value: 'BOPPartName', },
    { label: 'BOPCategory', value: 'BOPCategory', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'Specification', value: 'Specification', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'VendorLocation', value: 'VendorLocation', },
    { label: 'VendorPlant', value: 'VendorPlant', },
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'NoOfPcs', value: 'NoOfPcs', },
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Remark', value: 'Remark', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM' }
]

export const BOP_VBC_DOMESTIC_TempData = [
    {
        'BOPPartNumber': 'BOP1',
        'BOPPartName': 'BOP Part Name123',
        'BOPCategory': 'Category1',
        'PartNumber': 'P1',
        'Specification': 'BOP Specification',
        'VendorName': 'Vendor Name123',
        'VendorCode': 'Vendor Code123',
        'VendorLocation': 'Vendor Location',
        'VendorPlant': 'Vendor Plant123',
        'SourceVendorName': 'Source Vendor Name',
        'SourceVendorLocation': 'Source Vendor Location',
        'NoOfPcs': '10',
        'BasicRate': '100',
        'Remark': 'Remark Text',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'Kilogram'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_ZBC_IMPORT = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', },
    { label: 'BOPPartName', value: 'BOPPartName', },
    { label: 'BOPCategory', value: 'BOPCategory', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'Specification', value: 'Specification', },
    { label: 'Plant', value: 'Plant', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'NoOfPcs', value: 'NoOfPcs', },
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Currency', value: 'Currency', },
    { label: 'Remark', value: 'Remark', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM' },
]

export const BOP_ZBC_IMPORT_TempData = [
    {
        'BOPPartNumber': 'BOP Part Number123',
        'BOPPartName': 'Part1',
        'BOPCategory': 'Category1',
        'PartNumber': 'P1',
        'Specification': 'Specification',
        'Plant': 'Plant',
        'VendorName': 'Vendor Name123',
        'NoOfPcs': '10',
        'BasicRate': '100',
        'Currency': 'INR',
        'Remark': 'Remark Text',
        'EffectiveDate': moment().format('DD-MM-YYYY'),
        'UOM': 'Kilogram'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_IMPORT = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', },
    { label: 'BOPPartName', value: 'BOPPartName', },
    { label: 'BOPCategory', value: 'BOPCategory', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'Specification', value: 'Specification', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'VendorLocation', value: 'VendorLocation', },
    { label: 'VendorPlant', value: 'VendorPlant', },
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'NoOfPcs', value: 'NoOfPcs', },
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Currency', value: 'Currency', },
    { label: 'Remark', value: 'Remark', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'UOM', value: 'UOM' }
]

export const BOP_VBC_IMPORT_TempData = [
    {
        'BOPPartNumber': 'BOP Part Number123',
        'BOPPartName': 'Part1',
        'BOPCategory': 'Category1',
        'PartNumber': 'P1',
        'Specification': 'Specification',
        'VendorName': 'Vendor Name',
        'VendorCode': 'Vendor Code123',
        'VendorLocation': 'Vendor Location',
        'VendorPlant': 'Vendor Plant123',
        'SourceVendorName': 'Vendor Name123',
        'SourceVendorLocation': 'Vendor Location',
        'NoOfPcs': '10',
        'BasicRate': '100',
        'Currency': 'INR',
        'Remark': 'Remark Text',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'UOM': 'Kilogram'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_ZBC = [
    { label: 'Plant', value: 'Plant', },
    { label: 'PartNo', value: 'PartNo', },
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', },
    { label: 'Year', value: 'Year', },
    { label: 'Month', value: 'Month', },
    { label: 'ActualQuantity', value: 'ActualQuantity', },
]

export const VOLUME_ACTUAL_ZBC_TEMPDATA = [
    {
        'Plant': 'P1',
        'PartNo': 'Part 1',
        // 'OldPartNo': 'Old Part 2',
        'PartName': 'Part 1',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'ActualQuantity': 1,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_VBC = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'PartNo', value: 'PartNo', },
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', },
    { label: 'Year', value: 'Year', },
    { label: 'Month', value: 'Month', },
    { label: 'ActualQuantity', value: 'ActualQuantity', },
]

export const VOLUME_ACTUAL_VBC_TEMPDATA = [
    {
        'VendorName': 'Vendor Name',
        'PartNo': 'Part1',
        // 'OldPartNo': 'Old Part1',
        'PartName': 'Part Name1',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'ActualQuantity': 1,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_ZBC = [
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', },
    { label: 'Plant', value: 'Plant', },
    { label: 'PartNo', value: 'PartNo', },
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', },
    { label: 'Year', value: 'Year', },
    { label: 'Month', value: 'Month', },
]

export const VOLUME_BUDGETED_ZBC_TEMPDATA = [
    {
        'BudgetedQuantity': 'BudgetedQuantity',
        'Plant': 'Plant1',
        'PartNo': 'Part No1',
        // 'OldPartNo': 'Old Part1',
        'PartName': 'PartName',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_VBC = [
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'PartNo', value: 'PartNo', },
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', },
    { label: 'Year', value: 'Year', },
    { label: 'Month', value: 'Month', },
]

export const VOLUME_BUDGETED_VBC_TEMPDATA = [
    {
        'BudgetedQuantity': 'BudgetedQuantity',
        'VendorName': 'VendorName',
        'PartNo': 'PartNo',
        // 'OldPartNo': 'OldPartNo',
        'PartName': 'PartName',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
    }
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
    { label: 'MachineCapacityAndTonnage', value: 'MachineCapacityAndTonnage', },
    { label: 'Description', value: 'Description', },
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'UOM', value: 'UOM', },
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineZBCTempData = [
    {
        'Technology': 'Technology Name',
        'Plant': 'Plant1',
        'MachineNo': 'Machine 1',
        'MachineName': 'Machine Name1',
        'MachineType': 'Machine Type',
        'MachineCapacityAndTonnage': '10',
        'Description': 'Description Text',
        'ProcessName': 'Process Name1',
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
    { label: "MachineCapacityAndTonnage", value: "MachineCapacityAndTonnage", },
    { label: "MachineCost", value: "MachineCost", },
    { label: "AccessoriesCost", value: "AccessoriesCost", },
    { label: "UOM", value: "UOM", },
    { label: "InstallationCost", value: "InstallationCost", },
    { label: "TotalCost", value: "TotalCost", },
    { label: "LoanPercentage", value: "LoanPercentage", },
    { label: "LoanValue", value: "LoanValue", },
    { label: "EquityPercentage", value: "EquityPercentage", },
    { label: "EquityValue", value: "EquityValue", },
    { label: "RateOfInterest", value: "RateOfInterest", },
    { label: "RateOfInterestValue", value: "RateOfInterestValue", },
    { label: "NoOfShifts", value: "NoOfShifts", },
    { label: "WorkingHoursPerShift", value: "WorkingHoursPerShift", },
    { label: "NoOfWorkingDaysPerAnnum", value: "NoOfWorkingDaysPerAnnum", },
    { label: "Availability", value: "Availability", },
    { label: "NoOfWorkingHourPerAnnum", value: "NoOfWorkingHourPerAnnum", },
    { label: "DepreciationType", value: "DepreciationType", },
    { label: "DepriciationRate", value: "DepriciationRate", },
    { label: "LifeOfAsset", value: "LifeOfAsset", },
    { label: "CostOfScrap", value: "CostOfScrap", },
    { label: "DateOfPurchase", value: "DateOfPurchase", },
    { label: "DepriciationAmount", value: "DepriciationAmount", },
    { label: "IsMaintanceFixed", value: "IsMaintanceFixed", },
    { label: "AnnualMaintance", value: "AnnualMaintance", },
    { label: "AnnualMaintanaceAmount", value: "AnnualMaintanaceAmount", },
    { label: "IsConsumableFixed", value: "IsConsumableFixed", },
    { label: "AnnualConsumable", value: "AnnualConsumable", },
    { label: "AnnualConsumableAmount", value: "AnnualConsumableAmount", },
    { label: "InsuaranceTypeFixed", value: "InsuaranceTypeFixed", },
    { label: "InsuranceAmount", value: "InsuranceAmount", },
    { label: "AnnualInsurancePercentage", value: "AnnualInsurancePercentage", },
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
    { label: "PowerCostPerUnit", value: "PowerCostPerUnit", },
    { label: "UsesSolarPower", value: "UsesSolarPower", },
    { label: "TotalPowerCostAnnum", value: "TotalPowerCostAnnum", },
    { label: "LabourType", value: "LabourType", },
    { label: "LabourRate", value: "LabourRate", },
    { label: "NoOfPeople", value: "NoOfPeople", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "OutputPerHours", value: "OutputPerHours", },
    { label: "OutputPerAnnum", value: "OutputPerAnnum", },
    { label: "MachineRate", value: "MachineRate", }

]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBCTempData = [
    {
        "Technology": "Technology",
        "Ownership": "YES or NO",
        "Plant": "Plant",
        "MachineNo": "MAC-001",
        "MachineName": "Machine Name",
        "MachineType": "Machine Type",
        "Manufacturer": "Manufacturer",
        "YearOfManufacturing": moment().format('YYYY'),
        "MachineCapacityAndTonnage": 0,
        "MachineCost": 0,
        "AccessoriesCost": 0,
        "UOM": "UOM",
        "InstallationCost": 0,
        "TotalCost": 0,
        "LoanPercentage": 0,
        "LoanValue": 0,
        "EquityPercentage": 0,
        "EquityValue": 0,
        "RateOfInterest": 0,
        "RateOfInterestValue": 0,
        "NoOfShifts": 0,
        "WorkingHoursPerShift": 0,
        "NoOfWorkingDaysPerAnnum": 0,
        "Availability": 0,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "DepreciationType",
        "DepriciationRate": 0,
        "LifeOfAsset": 0,
        "CostOfScrap": 0,
        "DateOfPurchase": moment().format('DD-MM-YYYY'),
        "DepriciationAmount": 0,
        "IsMaintanceFixed": "YES or NO",
        "AnnualMaintance": 0,
        "AnnualMaintanaceAmount": 0,
        "IsConsumableFixed": "YES or NO",
        "AnnualConsumable": 0,
        "AnnualConsumableAmount": 0,
        "InsuaranceTypeFixed": "YES or NO",
        "InsuranceAmount": 0,
        "AnnualInsurancePercentage": 0,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "AnnualAreaCost": 0,
        "OtherYearlyCost": 0,
        "TotalMachineCostPerAnnum": 0,
        "UsesFuel": "YES or NO",
        "Fuel": "Fuel",
        "FuelCostPerUOM": 0,
        "ConsumptionPerAnnum": 0,
        "UtilizingFactor": 0,
        "PowerRatingKW": "Power Rating KW",
        "PowerCostPerUnit": 0,
        "UsesSolarPower": "YES OR NO",
        "TotalPowerCostAnnum": 0,
        "LabourType": "LabourType",
        "LabourRate": 0,
        "NoOfPeople": 0,
        "ProcessName": "Process Name",
        "OutputPerHours": 0,
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
    { label: 'MachineCapacityAndTonnage', value: 'MachineCapacityAndTonnage', },
    { label: 'Description', value: 'Description', },
    { label: 'ProcessName', value: 'ProcessName', },
    { label: 'UOM', value: 'UOM', },
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineVBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'VendorName': 'Vendor Name1',
        'VendorCode': 'Vendor Code123',
        'VendorPlant': 'Vendor Plant123',
        'MachineNo': 'Machine1',
        'MachineName': 'Machine Name1',
        'MachineType': 'Machine Type',
        'MachineCapacityAndTonnage': '10',
        'Description': 'Description Text',
        'ProcessName': 'Process1',
        'UOM': 'UOM',
        'MachineRate': '100',
        'Remark': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const PartComponent = [
    { label: 'PartNo', value: 'PartNo', },
    { label: 'PartName', value: 'PartName', },
    { label: 'PartDescription', value: 'PartDescription', },
    { label: 'GroupCode', value: 'GroupCode', },
    { label: 'ECNNumber', value: 'ECNNumber', },
    { label: 'RevisionNo', value: 'RevisionNo', },
    { label: 'DrawingNo', value: 'DrawingNo', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const PartComponentTempData = [
    {
        'PartNo': 'Part1',
        'PartName': 'Part Name',
        'PartDescription': 'Part Description',
        'GroupCode': 'GC1',
        'ECNNumber': '1',
        'RevisionNo': '1',
        'DrawingNo': '1',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]


/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const ZBCInterestRate = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'ICCApplicability', value: 'ICCApplicability', },
    { label: 'ICCPercent', value: 'ICCPercent', },
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', },
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', },
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
]

export const ZBCInterestRateTempData = [
    {
        'VendorName': 'Vendor Name1',
        'VendorCode': 'Vendor Code123',
        'ICCApplicability': 'RM',
        'ICCPercent': 0,
        'PaymentTermApplicability': 'RM',
        'PaymentTermPercent': 0,
        'RepaymentPeriod': 0,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCInterestRate = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'ICCApplicability', value: 'ICCApplicability', },
    { label: 'ICCPercent', value: 'ICCPercent', },
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', },
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', },
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
]

export const VBCInterestRateTempData = [
    {
        'VendorName': 'Vendor Name1',
        'VendorCode': 'Vendor Code123',
        'ICCApplicability': 'RM',
        'ICCPercent': '10',
        'PaymentTermApplicability': 'RM',
        'PaymentTermPercent': '10',
        'RepaymentPeriod': '30',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOMUpload = [
    { label: "BOMNo", value: "BOMNo" },
    { label: "AssemblyPartNo", value: "AssemblyPartNo" },
    { label: "AssemblyPartName", value: "AssemblyPartName" },
    { label: "PartNo", value: "PartNo" },
    { label: "PartName", value: "PartName" },
    { label: "Description", value: "Description" },
    { label: "PartType", value: "PartType" },
    { label: "GroupCode", value: "GroupCode" },
    { label: "ECNNumber", value: "ECNNumber" },
    { label: "RevisionNo", value: "RevisionNo" },
    { label: "DrawingNo", value: "DrawingNo" },
    { label: "IsAssembly", value: "IsAssembly" },
    { label: "BOMLevel", value: "BOMLevel" },
    { label: "Quantity", value: "Quantity" },
    { label: "Remark", value: "Remark" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const BOMUploadTempData = [
    {
        "BOMNo": "123",
        "AssemblyPartNo": "Part1",
        "AssemblyPartName": "Part Name1",
        "PartNo": "Part No",
        "PartName": "Part Name",
        "Description": "Description Text",
        "PartType": "Part Type",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "IsAssembly": "True Or False",
        "BOMLevel": 0,
        "Quantity": 0,
        "Remark": 'Remark',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
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

// COSTING HEAD WITH ZBC,VBC,CBC
export const costingHeadObj = [
    { label: 'Zero Based', value: 'ZBC' },
    { label: 'Vendor Based', value: 'VBC' },
    { label: 'Client Based', value: 'CBC' }
]

// COSTING HEAD WITHOUT CBC
export const costingHeadObjs = [
    { label: 'Zero Based', value: 'ZBC' },
    { label: 'Vendor Based', value: 'VBC' },
]
export const SurfaceTreatmentAssemblySaveJSON = [
    {
        "CostingId": "1b9c72b6-c7fe-48fb-ace7-52b5fb001042",
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": true,
        "PartId": "bc3989f4-8c60-4442-8bd9-3a91a8e05d47",
        "PartNumber": "PISTON",
        "BOMLevel": "L0",
        "CostingPartDetails": {
            "CostingDetailId": "32867950-5a1e-4aec-93d9-c5fc19255e57",
            "IsAssemblyPart": true,
            //"Type": "Assembly",
            "NetSurfaceTreatmentCost": 500,
            "NetSurfaceTreatmentCostAssembly": 500,
            "NetTransportationCostAssembly": 500,
            "SurfaceTreatmentCost": 0,
            "TransportationCost": 10,
            "SurfaceTreatmentDetails": [
                {
                    "SurfaceTreatmentDetailsId": "de0d548f-f2b1-4e8c-82c1-dc792398554e",
                    "OperationId": 123,
                    "OperationName": 'Test1',
                    "SurfaceArea": 100,
                    "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                    "UOM": 'UOM Label',
                    "RatePerUOM": 20,
                    "IsLabourRateExist": true,
                    "LabourRate": 300,
                    "LabourQuantity": 2,
                    "SurfaceTreatmentCost": 500
                }
            ],
            "TransportationDetails": {
                "TransportationDetailId": "e391f71d-b199-416e-8b53-54f3cdfbe8b9",
                "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                "UOM": "Cubic metre",
                "Rate": 10,
                "Quantity": 1,
                "TransportationCost": 10
            }
        },
    }
]

export const SurfaceTreatmentAssemblyGetJSON = [
    {
        "CostingId": "1b9c72b6-c7fe-48fb-ace7-52b5fb001042",
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": true,
        "PartId": "bc3989f4-8c60-4442-8bd9-3a91a8e05d47",
        "PartNumber": "PISTON",
        "BOMLevel": "L0",
        "IsAssemblyPart": true,
        "IsOpen": false,
        "PartType": "Assembly",
        "CostingPartDetails": {
            "CostingDetailId": "32867950-5a1e-4aec-93d9-c5fc19255e57",
            "IsAssemblyPart": true,
            //"Type": "Assembly",
            "NetSurfaceTreatmentCost": 500, //Total cost that includes total of surface, total of transportation, total of All surface treatment assembly
            "NetSurfaceTreatmentCostAssembly": 500,
            "NetTransportationCostAssembly": 500,
            "SurfaceTreatmentCost": 0,
            "TransportationCost": 10,
            "SurfaceTreatmentDetails": [
                {
                    "SurfaceTreatmentDetailsId": "de0d548f-f2b1-4e8c-82c1-dc792398554e",
                    "OperationId": 123,
                    "OperationName": 'Test1',
                    "SurfaceArea": 100,
                    "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                    "UOM": 'UOMID',
                    "RatePerUOM": 20,
                    "IsLabourRateExist": true,
                    "LabourRate": 300,
                    "LabourQuantity": 2,
                    "SurfaceTreatmentCost": 500
                }
            ],
            "TransportationDetails": {
                "TransportationDetailId": "e391f71d-b199-416e-8b53-54f3cdfbe8b9",
                "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                "UOM": "Cubic metre",
                "Rate": 10,
                "Quantity": 1,
                "TransportationCost": 10
            }
        },
        "CostingChildPartDetails": [
            {
                "JsonStage": "_apart",
                "CostingId": "1b9c72b6-c7fe-48fb-ace7-52b5fb001042",
                "IsIncludeSurfaceTreatmentWithOverheadAndProfit": true,
                "PartId": "bc3989f4-8c60-4442-8bd9-3a91a8e05d47",
                "PartNumber": "CompA",
                "BOMLevel": "L1",
                "IsAssemblyPart": false,
                "IsOpen": false,
                "PartType": "Part",
                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "NetSurfaceTreatmentCost": 10,
                    "SurfaceTreatmentCost": 0,
                    "TransportationCost": 10,
                    "SurfaceTreatmentDetails": [
                        {
                            "SurfaceTreatmentDetailsId": "de0d548f-f2b1-4e8c-82c1-dc792398554e",
                            "OperationId": null,
                            "OperationName": null,
                            "SurfaceArea": null,
                            "UOM": null,
                            "RatePerUOM": null,
                            "IsLabourRateExist": null,
                            "LabourRate": null,
                            "LabourQuantity": null,
                            "SurfaceTreatmentCost": null
                        }
                    ],
                    "TransportationDetails": {
                        "TransportationDetailId": "e391f71d-b199-416e-8b53-54f3cdfbe8b9",
                        "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                        "UOM": "Cubic metre",
                        "Rate": 10,
                        "Quantity": 1,
                        "TransportationCost": 10
                    }
                },
            },
        ],
    }
]

export const SurfaceTreatmentPartSaveJSON = [
    {
        "CostingId": "1b9c72b6-c7fe-48fb-ace7-52b5fb001042",
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": true,
        "PartId": "bc3989f4-8c60-4442-8bd9-3a91a8e05d47",
        "PartNumber": "PISTON",
        "BOMLevel": "L0",
        "CostingPartDetails": {
            "CostingDetailId": "32867950-5a1e-4aec-93d9-c5fc19255e57",
            "NetSurfaceTreatmentCost": 500,
            "SurfaceTreatmentCost": 0,
            "TransportationCost": 10,
            "SurfaceTreatmentDetails": [
                {
                    "SurfaceTreatmentDetailsId": "de0d548f-f2b1-4e8c-82c1-dc792398554e",
                    "OperationId": 123,
                    "OperationName": 'Test1',
                    "SurfaceArea": 100,
                    "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                    "UOM": 'UOMID',
                    "RatePerUOM": 20,
                    "IsLabourRateExist": true,
                    "LabourRate": 300,
                    "LabourQuantity": 2,
                    "SurfaceTreatmentCost": 500
                }
            ],
            "TransportationDetails": {
                "TransportationDetailId": "e391f71d-b199-416e-8b53-54f3cdfbe8b9",
                "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                "UOM": "Cubic metre",
                "Rate": 10,
                "Quantity": 1,
                "TransportationCost": 10
            }
        },
    }
]

export const SurfaceTreatmentPartGetJSON = [
    {
        "CostingId": "1b9c72b6-c7fe-48fb-ace7-52b5fb001042",
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": true,
        "PartId": "bc3989f4-8c60-4442-8bd9-3a91a8e05d47",
        "PartNumber": "PISTON",
        "BOMLevel": "L0",
        "IsOpen": true,
        "IsAssemblyPart": true,
        "PartType": "Part",
        "CostingPartDetails": {
            "CostingDetailId": "32867950-5a1e-4aec-93d9-c5fc19255e57",
            "NetSurfaceTreatmentCost": 500,
            "SurfaceTreatmentCost": 0,
            "TransportationCost": 10,
            "SurfaceTreatmentDetails": [
                {
                    "SurfaceTreatmentDetailsId": "de0d548f-f2b1-4e8c-82c1-dc792398554e",
                    "OperationId": 123,
                    "OperationName": 'Test1',
                    "SurfaceArea": 100,
                    "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                    "UOM": 'UOMID',
                    "RatePerUOM": 20,
                    "IsLabourRateExist": true,
                    "LabourRate": 300,
                    "LabourQuantity": 2,
                    "SurfaceTreatmentCost": 500
                }
            ],
            "TransportationDetails": {
                "TransportationDetailId": "e391f71d-b199-416e-8b53-54f3cdfbe8b9",
                "UOMId": "fe849b46-4d46-4806-9eb0-564edb6baa40",
                "UOM": "Cubic metre",
                "Rate": 10,
                "Quantity": 1,
                "TransportationCost": 10
            }
        },
    }
]

export const AcceptableRMUOM = ['Mass', 'Dimensionless', 'Volume']
export const AcceptableBOPUOM = ['Mass', 'Dimensionless', 'Volume']
export const AcceptableMachineUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Dimension', 'Time']
export const AcceptableOperationUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Dimension', 'Time']
export const AcceptableFuelUOM = ['Mass', 'Volume']
export const AcceptablePowerUOM = ['Power']
export const AcceptableSheetMetalUOM = ['Kilogram', 'Gram', 'Milligram']


export const CostingBulkUpload = [
    { label: "SlNo", value: "SlNo", },
    { label: "Class", value: "Class" },
    { label: "BOMLevel", value: "BOMLevel" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "PartType", value: "PartType" },
    { label: "PartNo", value: "PartNo" },
    { label: "PartName", value: "PartName" },
    { label: "Technology", value: "Technology" },
    { label: "Quantity", value: "Quantity" },
    { label: "RMCommodity", value: "RMCommodity" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMType", value: "RMType" },
    { label: "Specification", value: "Specification" },
    { label: "MultipleRM", value: "MultipleRM" },
    { label: "BlankSizeT", value: "BlankSizeT" },
    { label: "BlankSizeL", value: "BlankSizeL" },
    { label: "BlankSizeW", value: "BlankSizeW" },
    { label: "BlankSizeP", value: "BlankSizeP" },
    { label: "GrossWeight", value: "GrossWeight" },
    { label: "FinishWeight", value: "FinishWeight" },
    { label: "CircleScrapWeight", value: "CircleScrapWeight" },
    { label: "JaliScrapWeight", value: "JaliScrapWeight" },
    { label: "SupplierName", value: "SupplierName" },
    { label: "SupplierCode", value: "SupplierCode" },
    { label: "SOB", value: "SOB" },
    { label: "RMRatePerKg", value: "RMRatePerKg" },
    { label: "RMFreightCostPerKg", value: "RMFreightCostPerKg" },
    { label: "LandedRMCostPerKg", value: "LandedRMCostPerKg" },
    { label: "ShearingCostPerKg", value: "ShearingCostPerKg" },
    { label: "NetRMCostPerKg", value: "NetRMCostPerKg" },
    { label: "JaliScrapCostPerKg", value: "JaliScrapCostPerKg" },
    { label: "CircleScrapCostPerKg", value: "CircleScrapCostPerKg" },
    { label: "RMCostPerPiece", value: "RMCostPerPiece" },
    { label: "BOPCostPerPiece", value: "BOPCostPerPiece" },
    { label: "BOPCostPerAssembly", value: "BOPCostPerAssembly" },
    { label: "BOPHandlingCharges", value: "BOPHandlingCharges" },
    { label: "BOPHandlingCost", value: "BOPHandlingCost" },
    { label: "ProgressiveStamping_NoOfCavity", value: "ProgressiveStamping_NoOfCavity" },
    { label: "ProgressiveStamping_StrokeRate", value: "ProgressiveStamping_StrokeRate" },
    { label: "ProgressiveStamping_Cost", value: "ProgressiveStamping_Cost" },
    { label: "TotalProcessCost", value: "TotalProcessCost" },
    { label: "InspectionCost", value: "InspectionCost" },
    { label: "AdditionalAssemblyCost", value: "AdditionalAssemblyCost" },
    { label: "TotalOperationCost", value: "TotalOperationCost" },
    { label: "TypesOfPlating", value: "TypesOfPlating" },
    { label: "RateUOM", value: "RateUOM" },
    { label: "Rate", value: "Rate" },
    { label: "Quantity", value: "Quantity" },
    { label: "CostPerPiece", value: "CostPerPiece" },
    { label: "TransportationCost", value: "TransportationCost" },
    { label: "ICCPercentOnRM", value: "ICCPercentOnRM" },
    { label: "ICCCostOnRM", value: "ICCCostOnRM" },
    { label: "RejectionDescription", value: "RejectionDescription" },
    { label: "RejectionPercent", value: "RejectionPercent" },
    { label: "RejectionCost", value: "RejectionCost" },
    { label: "RejectionFixed", value: "RejectionFixed" },
    { label: "OverheadDescription", value: "OverheadDescription" },
    { label: "OverheadPercent", value: "OverheadPercent" },
    { label: "OverheadCost", value: "OverheadCost" },
    { label: "OverheadFixed", value: "OverheadFixed" },
    { label: "ProfitDescription", value: "ProfitDescription" },
    { label: "ProfitPercent", value: "ProfitPercent" },
    { label: "ProfitCost", value: "ProfitCost" },
    { label: "ProfitFixed", value: "ProfitFixed" },
    { label: "ToolMaintenanceCost", value: "ToolMaintenanceCost" },
    { label: "ToolAmortisationCost", value: "ToolAmortisationCost" },
    { label: "PackagingCost", value: "PackagingCost" },
    { label: "TransportationCost", value: "TransportationCost" },
    { label: "OtherCostIfAny", value: "OtherCostIfAny" },
    { label: "OtherPermiumCostIfAny", value: "OtherPermiumCostIfAny" },
    { label: "SpecialDiscountIfAny", value: "SpecialDiscountIfAny" },
    { label: "FinalComponentRate", value: "FinalComponentRate" },
]

// export const CostingBulkUpload = [
//     { label: "SlNo", value: "SlNo", },
//     { label: "Class", value: "Class" },
//     { label: "BOMLevel", value: "BOMLevel" },
//     { label: "Technology", value: "Technology" },
//     { label: "PartType", value: "PartType" },
//     { label: "PartNo", value: "PartNo" },
//     { label: "PartName", value: "PartName" },
//     { label: "ChildPartNo", value: "ChildPartNo" },
//     { label: "ChildPartName", value: "ChildPartName" },
//     { label: "NoOf", value: "NoOf" },
//     { label: "EngineOrVehicle", value: "EngineOrVehicle" },
//     { label: "IsMultipleRM", value: "IsMultipleRM" },
//     { label: "RMGrade", value: "RMGrade" },
//     { label: "RMDiameter", value: "RMDiameter" },
//     { label: "InputWeight", value: "InputWeight" },
//     { label: "FinishWeight", value: "FinishWeight" },
//     { label: "L1Supplier", value: "L1Supplier" },
//     { label: "L1SupplierCode", value: "L1SupplierCode" },
//     { label: "L1NetPrice", value: "L1NetPrice" },
//     { label: "L1SOB", value: "L1SOB" },
//     { label: "L1RMCostPerKG", value: "L1RMCostPerKG" },
//     { label: "L1ScrapRate", value: "L1ScrapRate" },
//     { label: "L1RMCostPerComp", value: "L1RMCostPerComp" },
//     { label: "L1ProcessCost", value: "L1ProcessCost" },
//     { label: "L1OperationCost", value: "L1OperationCost" },
//     { label: "L1SurfaceTreatmentCost", value: "L1SurfaceTreatmentCost" },
//     { label: "L1ICCPercent", value: "L1ICCPercent" },
//     { label: "L1ICC", value: "L1ICC" },
//     { label: "L1RejectionPercent", value: "L1RejectionPercent" },
//     { label: "L1Rejection", value: "L1Rejection" },
//     { label: "L1OverHeadPercent", value: "L1OverHeadPercent" },
//     { label: "L1OverHead", value: "L1OverHead" },
//     { label: "L1ProfitPercent", value: "L1ProfitPercent" },
//     { label: "L1Profit", value: "L1Profit" },
//     { label: "L1PackAndTransportPercent", value: "L1PackAndTransportPercent" },
//     { label: "L1PackAndTransport", value: "L1PackAndTransport" },
//     { label: "L1Others", value: "L1Others" },
//     { label: "L1Total", value: "L1Total" },
//     { label: "L2Supplier", value: "L2Supplier" },
//     { label: "L2SupplierCode", value: "L2SupplierCode" },
//     { label: "L2NetPrice", value: "L2NetPrice" },
//     { label: "L2SOB", value: "L2SOB" },
//     { label: "L2RMCostPerKG", value: "L2RMCostPerKG" },
//     { label: "L2ScrapRate", value: "L2ScrapRate" },
//     { label: "L2RMCostPerComp", value: "L2RMCostPerComp" },
//     { label: "L2ProcessCost", value: "L2ProcessCost" },
//     { label: "L2OperationCost", value: "L2OperationCost" },
//     { label: "L2SurfaceTreatmentCost", value: "L2SurfaceTreatmentCost" },
//     { label: "L2ICCPercent", value: "L2ICCPercent" },
//     { label: "L2ICC", value: "L2ICC" },
//     { label: "L2RejectionPercent", value: "L2RejectionPercent" },
//     { label: "L2Rejection", value: "L2Rejection" },
//     { label: "L2OverHeadPercent", value: "L2OverHeadPercent" },
//     { label: "L2OverHead", value: "L2OverHead" },
//     { label: "L2ProfitPercent", value: "L2ProfitPercent" },
//     { label: "L2Profit", value: "L2Profit" },
//     { label: "L2PackAndTransportPercent", value: "L2PackAndTransportPercent" },
//     { label: "L2PackAndTransport", value: "L2PackAndTransport" },
//     { label: "L2Others", value: "L2Others" },
//     { label: "L2Total", value: "L2Total" },
//     { label: "L3Supplier", value: "L3Supplier" },
//     { label: "L3SupplierCode", value: "L3SupplierCode" },
//     { label: "L3NetPrice", value: "L3NetPrice" },
//     { label: "L3SOB", value: "L3SOB" },
//     { label: "L3RMCostPerKG", value: "L3RMCostPerKG" },
//     { label: "L3ScrapRate", value: "L3ScrapRate" },
//     { label: "L3RMCostPerComp", value: "L3RMCostPerComp" },
//     { label: "L3ProcessCost", value: "L3ProcessCost" },
//     { label: "L3OperationCost", value: "L3OperationCost" },
//     { label: "L3SurfaceTreatmentCost", value: "L3SurfaceTreatmentCost" },
//     { label: "L3ICCPercent", value: "L3ICCPercent" },
//     { label: "L3ICC", value: "L3ICC" },
//     { label: "L3RejectionPercent", value: "L3RejectionPercent" },
//     { label: "L3Rejection", value: "L3Rejection" },
//     { label: "L3OverHeadPercent", value: "L3OverHeadPercent" },
//     { label: "L3OverHead", value: "L3OverHead" },
//     { label: "L3ProfitPercent", value: "L3ProfitPercent" },
//     { label: "L3Profit", value: "L3Profit" },
//     { label: "L3PackAndTransportPercent", value: "L3PackAndTransportPercent" },
//     { label: "L3PackAndTransport", value: "L3PackAndTransport" },
//     { label: "L3Others", value: "L3Others" },
//     { label: "L3Total", value: "L3Total" }
// ]

export const CostingBulkUloadTempData = [
    {
        "SlNo": "0",
        "Class": "\u0000",
        "BOMLevel": "0",
        "Technology": "Tehnology Name",
        "PartType": "Part Type",
        "PartNo": "123",
        "PartName": "Part_123",
        "ChildPartNo": "456",
        "ChildPartName": "C_part456",
        "NoOf": "5",
        "EngineOrVehicle": "Engine",
        "IsMultipleRM": "true OR false",
        "RMGrade": "123",
        "RMDiameter": "52",
        "InputWeight": "24",
        "FinishWeight": "2.56",
        "L1Supplier": "L1",
        "L1SupplierCode": "L21",
        "L1NetPrice": "0.0",
        "L1SOB": "0",
        "L1RMCostPerKG": "500",
        "L1ScrapRate": "0",
        "L1RMCostPerComp": "0.0",
        "L1ProcessCost": "200",
        "L1OperationCost": "222.12",
        "L1SurfaceTreatmentCost": "500",
        "L1ICCPercent": "10",
        "L1ICC": "123",
        "L1RejectionPercent": "5",
        "L1Rejection": "50",
        "L1OverHeadPercent": "2",
        "L1OverHead": "20",
        "L1ProfitPercent": "50",
        "L1Profit": "500",
        "L1PackAndTransportPercent": "21",
        "L1PackAndTransport": "800",
        "L1Others": "10",
        "L1Total": "1500",
        "L2Supplier": "L2 Supplier Name",
        "L2SupplierCode": "L2 Code",
        "L2NetPrice": "100",
        "L2SOB": "10",
        "L2RMCostPerKG": "20",
        "L2ScrapRate": "20",
        "L2RMCostPerComp": "40",
        "L2ProcessCost": "21.89",
        "L2OperationCost": "0.0",
        "L2SurfaceTreatmentCost": '0.0',
        "L2ICCPercent": "10",
        "L2ICC": "120.12",
        "L2RejectionPercent": "5",
        "L2Rejection": "450",
        "L2OverHeadPercent": "5",
        "L2OverHead": "500",
        "L2ProfitPercent": "2",
        "L2Profit": "10",
        "L2PackAndTransportPercent": "10",
        "L2PackAndTransport": "210",
        "L2Others": "500",
        "L2Total": "1000",
        "L3Supplier": "L3 Supplier Name",
        "L3SupplierCode": "L3 code",
        "L3NetPrice": "500",
        "L3SOB": "10",
        "L3RMCostPerKG": "450",
        "L3ScrapRate": "100.45",
        "L3RMCostPerComp": "45.12",
        "L3ProcessCost": "21.12",
        "L3OperationCost": "0.00",
        "L3SurfaceTreatmentCost": "400",
        "L3ICCPercent": '10',
        "L3ICC": "100",
        "L3RejectionPercent": "10",
        "L3Rejection": "100",
        "L3OverHeadPercent": "20.15",
        "L3OverHead": "1200",
        "L3ProfitPercent": "10",
        "L3Profit": "100.15",
        "L3PackAndTransportPercent": "800",
        "L3PackAndTransport": "1000",
        "L3Others": "50",
        "L3Total": "2000"
    }
]

export const SHEETMETAL = 1
export const FORGINING = 2
export const Non_Ferrous_LPDC = 3
export const Non_Ferrous_HPDC = 4
export const Non_Ferrous_GDC = 5
export const Ferrous_Casting = 6
export const RUBBER = 7
export const PLASTIC = 8
export const Mechanical_Proprietary = 9
export const Electrical_Proprietary = 10
export const SPRING = 11
export const FASTNERS = 12
export const ASSEMBLY = 13
export const MACHINING = 14
export const FABRICATION = 15
