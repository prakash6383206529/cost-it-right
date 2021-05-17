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
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "RMGrade", value: "RMGrade" }, //*
    { label: "RMSpec", value: "RMSpec" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyName", value: "TechnologyName" }, //*
    { label: "PlantCode", value: "PlantCode" }, //*
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" }, //*
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" }, //NOUI
    { label: "SourceLocation", value: "SourceLocation" }, //NOUI
    { label: "UOM", value: "UOM" }, //*
    { label: "BasicRate(INR)", value: "BasicRate(INR)" }, //*
    { label: "ScrapRate(INR)", value: "ScrapRate(INR)" }, //*
    { label: "RMFreightCost(INR)", value: "RMFreightCost(INR)" },
    { label: "ShearingCost(INR)", value: "ShearingCost(INR)" },
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMDomesticZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "PlantCode": "PC01",
        "VendorName": "Systematix",
        "VendorCode": "VP123",
        "HasDifferentSource": "Yes",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Kilogram",
        "BasicRate(INR)": "100",
        "ScrapRate(INR)": "10",
        "RMFreightCost(INR)": "10",
        "ShearingCost(INR)": "10",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "PlantCode": "PC01",
        "VendorName": "Systematix",
        "VendorCode": "VP123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon",
        "BasicRate(INR)": "500",
        "ScrapRate(INR)": "50",
        "RMFreightCost(INR)": "50",
        "ShearingCost(INR)": "50",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMDomesticVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "RMGrade", value: "RMGrade" }, //*
    { label: "RMSpec", value: "RMSpec" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyName", value: "TechnologyName" }, //*
    { label: "VendorName", value: "VendorName" }, //*
    { label: "VendorCode", value: "VendorCode" }, //NOUI,*
    { label: "PlantCode", value: "PlantCode" }, //NOUI
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" }, //*
    { label: "BasicRate(INR)", value: "BasicRate(INR)" }, //*
    { label: "ScrapRate(INR)", value: "ScrapRate(INR)" }, //*
    { label: "RMFreightCost(INR)", value: "RMFreightCost(INR)" }, //New Added
    { label: "ShearingCost(INR)", value: "ShearingCost(INR)" }, //New Added
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMDomesticVBCTempData = [
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "VendorName": "Systematix",
        "VendorCode": "V123",
        "PlantCode": "VP123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Kilogram",
        "BasicRate(INR)": "100",
        "ScrapRate(INR)": "10",
        "RMFreightCost(INR)": "10",
        "ShearingCost(INR)": "10",
        "DestinationPlant": "Manesar",
        "DestinationPlantCode": "1032",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorName": "Systematix",
        "VendorCode": "V123",
        "PlantCode": "VP123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon",
        "BasicRate(INR)": "500",
        "ScrapRate(INR)": "50",
        "RMFreightCost(INR)": "10",
        "ShearingCost(INR)": "10",
        "DestinationPlant": "Manesar",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportZBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "RMGrade", value: "RMGrade" }, //*
    { label: "RMSpec", value: "RMSpec" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyName", value: "TechnologyName" }, //*
    { label: "PlantCode", value: "PlantCode" }, //*
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" }, //NOUI
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" }, //NOUI
    { label: "SourceLocation", value: "SourceLocation" }, //NOUI
    { label: "UOM", value: "UOM" }, //*
    { label: "Currency", value: "Currency" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "ScrapRate", value: "ScrapRate" }, //*
    { label: "RMFreightCost", value: "RMFreightCost" }, //New Added
    { label: "ShearingCost", value: "ShearingCost" }, //New Added
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },


]


export const RMImportZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "PlantCode": "PC01",
        "VendorName": "Systematix",
        "VendorCode": "VP123",
        "HasDifferentSource": "Yes",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Kilogram",
        "Currency": "INR",
        "BasicRate": "100",
        "ScrapRate": "10",
        "RMFreightCost": "10",
        "ShearingCost": "10",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "PlantCode": "PC01",
        "VendorName": "Systematix",
        "VendorCode": "VP123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon",
        "Currency": "USD",
        "BasicRate": "500",
        "ScrapRate": "50",
        "RMFreightCost": "10",
        "ShearingCost": "10",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "RMGrade", value: "RMGrade" }, //*
    { label: "RMSpec", value: "RMSpec" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyName", value: "TechnologyName" }, //*
    { label: "VendorName", value: "VendorName" },
    { label: "VendorCode", value: "VendorCode" }, //NOUI
    { label: "PlantCode", value: "PlantCode" }, //NOUI
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" }, //*
    { label: "Currency", value: "Currency" }, //*
    { label: "BasicRate", value: "BasicRate" },  //*
    { label: "ScrapRate", value: "ScrapRate" }, //*
    { label: "RMFreightCost", value: "RMFreightCost" },
    { label: "ShearingCost", value: "ShearingCost" },
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMImportVBCTempData = [
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "VendorName": "Systematix",
        "VendorCode": "V123",
        "PlantCode": "VP123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Kilogram",
        "Currency": "INR",
        "BasicRate(INR)": "100",
        "ScrapRate(INR)": "10",
        "RMFreightCost(INR)": "10",
        "ShearingCost(INR)": "10",
        "DestinationPlant": "Manesar",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorName": "Systematix",
        "VendorCode": "V123",
        "PlantCode": "VP123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon",
        "Currency": "USD",
        "BasicRate(INR)": "500",
        "ScrapRate(INR)": "50",
        "RMFreightCost(INR)": "10",
        "ShearingCost(INR)": "10",
        "DestinationPlant": "Manesar",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMSpecification = [
    { label: "RawMaterialName", value: "RawMaterialName" },//*
    { label: "RMGrade", value: "RMGrade" },//*
    { label: "Material", value: "Material" },//*
    { label: "Density", value: "Density" },//*
    { label: "Specification", value: "Specification" },//*
]

export const RMSpecificationXLTempData = [
    {
        "RawMaterialName": "CRCA",
        "RMGrade": "15Cr3",
        "Material": "Stainless Steel",
        "Density": "3.3",
        "Specification": "50 mm",
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Vendor = [
    { label: 'RawMaterialVendor', value: 'RawMaterialVendor' },//*
    { label: 'LabourVendor', value: 'LabourVendor', }, //*
    { label: 'PartVendor', value: 'PartVendor', }, //*
    { label: 'BOPVendor', value: 'BOPVendor', },//*
    { label: 'VendorName', value: 'VendorName', },//*
    { label: 'VendorCode', value: 'VendorCode', },//*
    { label: 'VendorEmail', value: 'VendorEmail', },//*
    { label: 'PhoneNumber', value: 'PhoneNumber', },
    { label: 'Extension', value: 'Extension', },
    { label: 'MobileNumber', value: 'MobileNumber', },
    { label: 'Country', value: 'Country', },//*
    { label: 'State', value: 'State', },//*
    { label: 'City', value: 'City', },//*
    { label: 'ZipCode', value: 'ZipCode', },//*
    { label: 'AddressLine1', value: 'AddressLine1', },
    { label: 'AddressLine2', value: 'AddressLine2', },
]

export const VendorTempData = [
    {
        'RawMaterialVendor': 'YES OR NO',
        'LabourVendor': 'YES OR NO',
        'PartVendor': 'YES OR NO',
        'BOPVendor': 'YES OR NO',
        'VendorName': 'TATA Steel',
        'VendorCode': 'VC01',
        'VendorEmail': 'Vendor@gmail.com',
        'PhoneNumber': '1234567899',
        'Extension': '123',
        'MobileNumber': '1234567890',
        'Country': 'India',
        'State': 'MP',
        'City': 'Indore',
        'ZipCode': '123456',
        'AddressLine1': '123, Area location',
        'AddressLine2': '123, Area location',
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
    { label: 'Remarks', value: 'Remarks', },
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
        'Remarks': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const ZBCOperation = [
    { label: 'Technology', value: 'Technology', }, //*
    { label: 'OperationName', value: 'OperationName', }, //*
    { label: 'OperationCode', value: 'OperationCode', },
    { label: 'Description', value: 'Description', },
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'Rate', value: 'Rate', }, //*
    { label: 'Rate', value: 'Rate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //NOUI
    { label: 'IsSurfaceTreatmentOperation', value: 'IsSurfaceTreatmentOperation' },
    { label: 'Remark', value: 'Remark', },
]

export const ZBCOperationTempData = [
    {
        'Technology': 'Sheet Metal',
        'OperationName': 'Crushing',
        'OperationCode': 'Crushing123',
        'Description': 'Description Text',
        'PlantCode': 'Systematix01',
        'UOM': 'Litre',
        'Rate': 50,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "IsSurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 5,
        'Remark': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCOperation = [
    { label: 'Technology', value: 'Technology', }, //*
    { label: 'OperationName', value: 'OperationName', }, //*
    { label: 'OperationCode', value: 'OperationCode', },
    { label: 'Description', value: 'Description', },
    { label: 'VendorName', value: 'VendorName', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'Rate', value: 'Rate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
    { label: 'IsSurfaceTreatmentOperation', value: 'IsSurfaceTreatmentOperation' },
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'Remark', value: 'Remark', },
]

export const VBCOperationTempData = [
    {
        'Technology': 'Sheet Metal',
        'OperationName': 'Crushing',
        'OperationCode': 'Crushing123',
        'Description': 'Description Text',
        'VendorName': 'Tata Steel',
        'VendorCode': 'Vendor123',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': "1032",
        'VendorPlantCode': 'VP01',
        'UOM': 'Litre',
        'Rate': 50,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "IsSurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 5,
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
    { label: 'Remarks', value: 'Remarks', },
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
        'Remarks': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Labour = [
    { label: 'EmploymentTerms', value: 'EmploymentTerms', }, //*
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'State', value: 'State', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'MachineType', value: 'MachineType', }, //*
    { label: 'LabourType', value: 'LabourType', }, //*
    { label: 'RatePerPerson/Annum(INR)', value: 'RatePerPerson/Annum(INR)', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
]

export const LabourTempData = [
    {
        'EmploymentTerms': 'Contractual',
        'VendorName': 'Tata Steel',
        'VendorCode': 'VC123',
        'State': 'MP',
        'PlantCode': 'Plant01',
        'MachineType': 'Grinder',
        'LabourType': 'Skilled',
        'RatePerPerson/Annum(INR)': 2000000,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    },
    {
        'EmploymentTerms': 'Employed',
        'VendorName': 'Reliance',
        'VendorCode': 'VC124',
        'State': 'MP',
        'PlantCode': 'Plant02',
        'MachineType': 'Grinder',
        'LabourType': 'Semi-Skilled',
        'RatePerPerson/Annum': 300000,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Fuel = [
    { label: 'FuelName', value: 'FuelName', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'State', value: 'State', }, //*
    { label: 'Rate', value: 'Rate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
]

export const FuelTempData = [
    {
        'FuelName': 'Petrol',
        'UOM': 'Mililitre',
        'State': 'MP',
        'Rate': '100',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
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
    { label: 'BOPPartNumber', value: 'BOPPartNumber', }, //*
    { label: 'BOPPartName', value: 'BOPPartName', }, //*
    { label: 'BOPCategory', value: 'BOPCategory', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate(INR)', value: 'BasicRate(INR)', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_ZBC_DOMESTIC_TempData = [
    {
        'BOPPartNumber': 'BOP Part123',
        'BOPPartName': 'Screw',
        'BOPCategory': 'Machine',
        'Specification': '20 mm',
        'UOM': 'Gallon',
        'PlantCode': 'Plant101',
        'VendorCode': 'Systematix',
        'MinimumOrderQuantity': '10',
        'BasicRate(INR)': '100',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_DOMESTIC = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', }, //*
    { label: 'BOPPartName', value: 'BOPPartName', }, //*
    { label: 'BOPCategory', value: 'BOPCategory', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'VendorSourceName', value: 'VendorSourceName', },
    { label: 'VendorSourceLocation', value: 'VendorSourceLocation', },
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate(INR)', value: 'BasicRate(INR)', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_VBC_DOMESTIC_TempData = [
    {
        'BOPPartNumber': 'BOP Part123',
        'BOPPartName': 'Screw',
        'BOPCategory': 'Machine',
        'Specification': '20 mm',
        'UOM': 'Gallon',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': "1032",
        'VendorCode': 'Sys01',
        'VendorPlantCode': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'VendorSourceLocation': 'Jamshedpur',
        'MinimumOrderQuantity': '10',
        'BasicRate(INR)': '100',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_ZBC_IMPORT = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', }, //*
    { label: 'BOPPartName', value: 'BOPPartName', }, //*
    { label: 'BOPCategory', value: 'BOPCategory', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' },
]

export const BOP_ZBC_IMPORT_TempData = [
    {
        'BOPPartNumber': 'BOP Part123',
        'BOPPartName': 'Screw',
        'BOPCategory': 'Machine',
        'Specification': '20 mm',
        'UOM': 'Gallon',
        'PlantCode': 'Plant101',
        'VendorName': 'Systematix',
        'VendorCode': 'VC1',
        'Currency': 'INR or USD',
        'MinimumOrderQuantity': '10',
        'BasicRate': '100',
        'EffectiveDate': moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_IMPORT = [
    { label: 'BOPPartNumber', value: 'BOPPartNumber', }, //*
    { label: 'BOPPartName', value: 'BOPPartName', }, //*
    { label: 'BOPCategory', value: 'BOPCategory', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'DestinationPlant', value: 'DestinationPlant', },
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', },
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'VendorSourceName', value: 'VendorSourceName', },
    { label: 'VendorSourceLocation', value: 'VendorSourceLocation', },
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate(INR)', value: 'BasicRate(INR)', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_VBC_IMPORT_TempData = [
    {
        'BOPPartNumber': 'BOP Part123',
        'BOPPartName': 'Screw',
        'BOPCategory': 'Machine',
        'Specification': '20 mm',
        'UOM': 'Gallon',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': 1032,
        'VendorName': 'Systematix',
        'VendorCode': 'Sys01',
        'VendorPlantCode': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'VendorSourceLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'MinimumOrderQuantity': '10',
        'BasicRate(INR)': '100',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_ZBC = [
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartNo', value: 'PartNo', }, //*
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', }, //NOUI
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI,*
    { label: 'ActualQuantity', value: 'ActualQuantity', }, //*
]

export const VOLUME_ACTUAL_ZBC_TEMPDATA = [
    {
        'PlantCode': 'P1',
        'PartNo': 'Screw01',
        // 'OldPartNo': 'Old Part 2',
        'PartName': 'Screw',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'ActualQuantity': 100,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_VBC = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'PartNo', value: 'PartNo', }, //*
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', }, //NOUI
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI ,*
    { label: 'ActualQuantity', value: 'ActualQuantity', }, //*
]

export const VOLUME_ACTUAL_VBC_TEMPDATA = [
    {
        'VendorName': 'Tata Steel',
        'VendorCode': 'Tata01',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': 1032,
        'PartNo': 'Screw Jack',
        // 'OldPartNo': 'Old Part1',
        'PartName': 'Screw',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'ActualQuantity': 50,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_ZBC = [
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartNo', value: 'PartNo', }, //*
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', }, //NOUI
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', }, //*
]

export const VOLUME_BUDGETED_ZBC_TEMPDATA = [
    {
        'PlantCode': 'Systematix01',
        'PartNo': 'Screw01',
        // 'OldPartNo': 'Old Part1',
        'PartName': 'Screw',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'BudgetedQuantity': 10,
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_VBC = [
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'DestinationPlant', value: 'DestinationPlant', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'PartNo', value: 'PartNo', }, //*
    // { label: 'OldPartNo', value: 'OldPartNo', },
    { label: 'PartName', value: 'PartName', },//NOUI
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', }, //*
]

export const VOLUME_BUDGETED_VBC_TEMPDATA = [
    {
        'VendorName': 'Tata Steel',
        'VendorCode': 'Tata01',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': "1032",
        'PartNo': 'Screw01',
        // 'OldPartNo': 'OldPartNo',
        'PartName': 'Screw',
        'Year': moment().format('YYYY'),
        'Month': moment().format('MM'),
        'BudgetedQuantity': 25,
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
    { label: 'DestinationPlant', value: 'DestinationPlant', },
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', },
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
    { label: 'PowerType', value: 'PowerType', },
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
    { label: 'Remarks', value: 'Remarks', },
    { label: 'Division', value: 'Division', },
    { label: 'PercentFCA', value: 'PercentFCA', },
    { label: 'PowerRateing', value: 'PowerRateing', },
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineZBC = [
    { label: 'Technology', value: 'Technology', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'MachineNo', value: 'MachineNo', }, //*
    { label: 'MachineSpecification', value: 'MachineSpecification', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineTonnage', value: 'MachineTonnage', },
    { label: 'ProcessName', value: 'ProcessName', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'MachineRate', value: 'MachineRate', }, //* 
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //* 
    { label: 'Remark', value: 'Remark', },
]

export const MachineZBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'PlantCode': '1001',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineTonnage': '40',
        'ProcessName': 'Punching',
        'UOM': 'Stroke',
        'MachineRate': 55,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBC = [
    { label: "Technology", value: "Technology", }, //*
    { label: "PlantCode", value: "PlantCode", }, //*
    { label: "MachineNo", value: "MachineNo", }, //*
    { label: "MachineName", value: "MachineName", }, //*
    { label: "MachineSpec", value: "MachineSpec", },
    { label: "Description", value: "Description", },
    { label: "MachineType", value: "MachineType", },
    { label: "Manufacturer", value: "Manufacturer", },
    { label: "YearOfManufacturing", value: "YearOfManufacturing", },
    { label: "MachineTonnage", value: "MachineTonnage", },
    { label: "MachineCost(INR)", value: "MachineCost(INR)", }, //*
    { label: "AccessoriesCost(INR)", value: "AccessoriesCost(INR)", },
    { label: "InstallationCost(INR)", value: "InstallationCost(INR)", },
    { label: "LoanPercentage", value: "LoanPercentage", },
    { label: "EquityPercentage", value: "EquityPercentage", },
    { label: "RateOfInterest", value: "RateOfInterest", },
    { label: "NoOfShifts", value: "NoOfShifts", },
    { label: "WorkingHoursPerShift", value: "WorkingHoursPerShift", },
    { label: "NoOfWorkingDaysPerAnnum", value: "NoOfWorkingDaysPerAnnum", },
    { label: "Availability", value: "Availability", },
    { label: "DepreciationType", value: "DepreciationType", },
    { label: "DepriciationRate", value: "DepriciationRate", },
    { label: "LifeOfAsset", value: "LifeOfAsset", },//NOUI
    { label: "CostOfScrap", value: "CostOfScrap", },
    { label: "DateOfPurchase", value: "DateOfPurchase", },
    { label: "IsMaintanceFixed", value: "IsMaintanceFixed", },
    { label: "AnnualMaintance", value: "AnnualMaintance", },
    { label: "AnnualMaintanaceAmount(INR)", value: "AnnualMaintanaceAmount(INR)", },
    { label: "IsConsumableFixed", value: "IsConsumableFixed", },
    { label: "AnnualConsumable", value: "AnnualConsumable", },
    { label: "AnnualConsumableAmount(INR)", value: "AnnualConsumableAmount(INR)", },
    { label: "InsuaranceTypeFixed", value: "InsuaranceTypeFixed", },
    { label: "InsuranceAmount(INR)", value: "InsuranceAmount(INR)", },
    { label: "AnnualInsurancePercentage", value: "AnnualInsurancePercentage", },
    { label: "BuildingCostPerSqFt", value: "BuildingCostPerSqFt", },
    { label: "MachineFloorAreaSqPerFt", value: "MachineFloorAreaSqPerFt", },
    { label: "OtherYearlyCost", value: "OtherYearlyCost", },
    { label: "UsesFuel", value: "UsesFuel", },
    { label: "Fuel", value: "Fuel", },
    { label: "ConsumptionPerAnnum", value: "ConsumptionPerAnnum", },
    { label: "UtilizingFactor", value: "UtilizingFactor", },
    { label: "PowerRatingKW", value: "PowerRatingKW", },
    { label: "UsesSolarPower", value: "UsesSolarPower", },
    // { label: "PowerCostPerUnit", value: "PowerCostPerUnit", },
    { label: "LabourType", value: "LabourType", },
    // { label: "LabourRate", value: "LabourRate", },
    { label: "NoOfPeople", value: "NoOfPeople", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "UOM", value: "UOM", },
    { label: "OutputPerHours", value: "OutputPerHours", },
    { label: 'EffectiveDate', value: 'EffectiveDate', },

]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBCTempData = [
    {
        "Technology": "Sheet Metal",
        "PlantCode": "P101",
        "MachineNo": "MAC-001",
        "MachineName": "Power Press",
        "MachineSpec": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "Manufacturer": "TATA",
        "YearOfManufacturing": moment().format('YYYY'),
        "MachineTonnage": 40,
        "MachineCost(INR)": 5000,
        "AccessoriesCost(INR)": 500,
        "InstallationCost(INR)": 500,
        "LoanPercentage": 10,
        "EquityPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": 2,
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "Availability": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "SLM",
        "DepriciationRate": 0,
        "LifeOfAsset": 5,
        "CostOfScrap": 100,
        "DateOfPurchase": moment().format('DD-MM-YYYY'),
        "IsMaintanceFixed": "YES",
        "AnnualMaintance": 0,
        "AnnualMaintanaceAmount": 1000,
        "IsConsumableFixed": "YES",
        "AnnualConsumable": 0,
        "AnnualConsumableAmount(INR)": 1000,
        "InsuaranceTypeFixed": "YES",
        "InsuranceAmount(INR)": 1000,
        "AnnualInsurancePercentage": 0,
        "BuildingCostPerSqFt": 100,
        "MachineFloorAreaSqPerFt": 2500,
        "OtherYearlyCost": 500,
        "UsesFuel": "YES",
        "Fuel": "CNG",
        "ConsumptionPerAnnum": 85,
        "UtilizingFactor": 0,
        "PowerRatingKW": "Power Rating KW",
        "UsesSolarPower": "NO",
        // "PowerCostPerUnit": 0,
        "LabourType": "Skilled",
        // "LabourRate": 0,
        "NoOfPeople": 5,
        "ProcessName": "Grinding",
        "UOM": "Hours",
        "OutputPerHours": 50,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    },
    {
        "Technology": "Sheet Metal",
        "PlantCode": "P101",
        "MachineNo": "MAC-002",
        "MachineName": "Hydraulic Press",
        "MachineSpec": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "Manufacturer": "TATA",
        "YearOfManufacturing": moment().format('YYYY'),
        "MachineTonnage": 50,
        "MachineCost(INR)": 5000,
        "AccessoriesCost(INR)": 500,
        "InstallationCost(INR)": 500,
        "LoanPercentage": 10,
        "EquityPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": '',
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "Availability": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "WDM",
        "DepriciationRate": 25,
        "LifeOfAsset": 0,
        "CostOfScrap": 100,
        "DateOfPurchase": moment().format('DD-MM-YYYY'),
        "IsMaintanceFixed": "NO",
        "AnnualMaintance": 10,
        "AnnualMaintanaceAmount": 0,
        "IsConsumableFixed": "NO",
        "AnnualConsumable": 10,
        "AnnualConsumableAmount(INR)": 0,
        "InsuaranceTypeFixed": "NO",
        "InsuranceAmount(INR)": 0,
        "AnnualInsurancePercentage": 10,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "OtherYearlyCost": 0,
        "UsesFuel": "NO",
        "Fuel": "",
        "ConsumptionPerAnnum": 0,
        "UtilizingFactor": 75,
        "PowerRatingKW": "100",
        "UsesSolarPower": "YES",
        // "PowerCostPerUnit": 0,
        "LabourType": "Semi-Skilled",
        // "LabourRate": 0,
        "NoOfPeople": 10,
        "ProcessName": "Turning",
        "UOM": "Gram",
        "OutputPerHours": 40,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineVBC = [
    { label: 'Technology', value: 'Technology', }, //*
    { label: 'VendorName', value: 'VendorName', }, //*, co
    { label: 'VendorCode', value: 'VendorCode', }, // not on UI
    { label: 'DestinationPlant', value: 'DestinationPlant', }, // not on UI
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, // not on UI
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, // not on UI
    { label: 'MachineNo', value: 'MachineNo', }, //*
    { label: 'MachineSpecification', value: 'MachineSpecification', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineTonnage', value: 'MachineTonnage', },
    { label: 'ProcessName', value: 'ProcessName', }, //*
    { label: 'UOM', value: 'UOM', }, //* maybe
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineVBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'VendorName': 'SIPL',
        'VendorCode': '10222',
        'DestinationPlant': 'Manesar',
        'DestinationPlantCode': 1032,
        'VendorPlantCode': 'VPlant01',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineTonnage': '40',
        'ProcessName': 'Punching',
        'UOM': 'Stroke',
        'MachineRate': '20',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const PartComponent = [
    { label: 'PartNo', value: 'PartNo', }, //*
    { label: 'PartName', value: 'PartName', }, //*
    { label: 'PartDescription', value: 'PartDescription', }, //*
    { label: 'GroupCode', value: 'GroupCode', },
    { label: 'ECNNumber', value: 'ECNNumber', },
    { label: 'RevisionNo', value: 'RevisionNo', },
    { label: 'DrawingNo', value: 'DrawingNo', },
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //,* maybe only star
    { label: 'Remark', value: 'Remark', },
]

export const PartComponentTempData = [
    {
        'PartNo': 'Part123',
        'PartName': 'Screw',
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
    { label: 'VendorName', value: 'VendorName', }, //NOUI
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'ICCApplicability', value: 'ICCApplicability', }, //*
    { label: 'ICCPercent', value: 'ICCPercent', }, //*
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', }, //*
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', }, //*
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
]

export const ZBCInterestRateTempData = [
    {
        'VendorName': 'Systematix',
        'VendorCode': 'VCode001',
        'ICCApplicability': 'RM+CC',
        'ICCPercent': 10,
        'PaymentTermApplicability': 'RM',
        'RepaymentPeriod': 30,
        'PaymentTermPercent': 10,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCInterestRate = [
    { label: 'VendorName', value: 'VendorName', }, //NOUI
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'ICCApplicability', value: 'ICCApplicability', }, //*
    { label: 'ICCPercent', value: 'ICCPercent', }, //*
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', }, //*
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', }, //*
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
]

export const VBCInterestRateTempData = [
    {
        'VendorName': 'Systematix',
        'VendorCode': 'VCode001',
        'ICCApplicability': 'RM+CC',
        'ICCPercent': '10   ',
        'PaymentTermApplicability': 'RM',
        'RepaymentPeriod': '30',
        'PaymentTermPercent': '10',
        "EffectiveDate": moment().format('DD-MM-YYYY'),
    }
]

/** 
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOMUpload = [
    { label: "BOMNo", value: "BOMNo" }, //*
    { label: "AssemblyPartNo", value: "AssemblyPartNo" }, //*
    { label: "AssemblyPartName", value: "AssemblyPartName" }, //*
    { label: "PartNo", value: "PartNo" }, //NOUI,*
    { label: "PartName", value: "PartName" }, //NOUI,*
    { label: "Description", value: "Description" }, //*
    { label: "PartType", value: "PartType" }, //NOUI,*
    { label: "GroupCode", value: "GroupCode" },
    { label: "ECNNumber", value: "ECNNumber" },
    { label: "RevisionNo", value: "RevisionNo" },
    { label: "DrawingNo", value: "DrawingNo" },
    { label: "IsAssembly", value: "IsAssembly" }, //NOUI,*
    { label: "BOMLevel", value: "BOMLevel" }, //NOUI,*
    { label: "Quantity", value: "Quantity" }, //NOUI
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "Remark", value: "Remark" },

]

export const BOMUploadTempData = [
    {
        "BOMNo": "BOM123",
        "AssemblyPartNo": "APart1",
        "AssemblyPartName": "Screw Jack",
        "PartNo": "SJ01",
        "PartName": "Screw",
        "Description": "Description Text",
        "PartType": "Assembly",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "IsAssembly": "YES",
        "BOMLevel": 0,
        "Quantity": 2,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": 'Remark',

    },
    {
        "BOMNo": "BOM123",
        "AssemblyPartNo": "APart1",
        "AssemblyPartName": "Screw Jack",
        "PartNo": "Comp_Nut",
        "PartName": "Nut",
        "Description": "Description Text",
        "PartType": "Component",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "IsAssembly": "NO",
        "BOMLevel": 1,
        "Quantity": 3,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": 'Remark',

    },
    {
        "BOMNo": "BOM123",
        "AssemblyPartNo": "APart1",
        "AssemblyPartName": "Screw Jack",
        "PartNo": "BOP_Cap",
        "PartName": "Cap",
        "Description": "Description Text",
        "PartType": "BoughtOutPart",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "IsAssembly": "YES",
        "BOMLevel": 1,
        "Quantity": 4,
        "EffectiveDate": moment().format('DD-MM-YYYY'),
        "Remark": 'Remark',

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


export const SIMULATION_LEFT_MENU_NOT_INCLUDED = ["Simulation Upload", "RM Import", "RM Domestic", "BOP Domestic", "BOP Import", "Process-Simulation", "Process", "Operation-Simulation", "Surface Treatment", "Overhead-Simulation", "Overhead", "Profits", "Profits-Simulation", "Freight-Simulation"]

export const RMDomesticSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "TechnologyName", value: "TechnologyName" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorLocation", value: "VendorLocation" },
    // { label: "Plant", value: "Plant" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: 'NewBasicRate', value: 'NewBasicRate' },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: 'NewScrapRate', value: 'NewScrapRate' },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const RMImportSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "RMGrade", value: "RMGrade" },
    { label: "RMSpec", value: "RMSpec" },
    { label: "Category", value: "Category" },
    { label: "TechnologyName", value: "TechnologyName" },
    //{ label: "Plant", value: "Plant" },
    { label: "VendorName", value: "VendorName" },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "UOM", value: "UOM" },
    { label: "BasicRate", value: "BasicRate" },
    { label: 'NewBasicRate', value: 'NewBasicRate' },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: 'NewScrapRate', value: 'NewScrapRate' },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]