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
    { label: 'VendorName', value: 'VendorName', },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate', value: 'BasicRate', }, //*
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
        'VendorName': 'Systematix',
        'VendorCode': 'Sys01',
        'VendorPlant': 'VPlant',
        'SourceVendorName': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
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
    { label: 'VendorPlant', value: 'VendorPlant' },
    { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'BasicRate', value: 'BasicRate', }, //*
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
        'DestinationPlantCode': '1032',
        'VendorName': 'Systematix',
        'VendorCode': 'Sys01',
        'VendorPlant': 'VPlant',
        'VendorPlantCode': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'VendorSourceLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'MinimumOrderQuantity': '10',
        'BasicRate': '100',
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

export const CLIENT_DOWNLOAD_EXCEl = [
    { label: "CompanyName", value: "CompanyName", },
    { label: "ClientName", value: "ClientName", },
    { label: "ClientEmailId", value: "ClientEmailId", },
    { label: "CountryName", value: "CountryName", },
    { label: "StateName", value: "StateName", },
    { label: "CityName", value: "CityName", },
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
    { label: 'MachineSpecification', value: 'Description', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapicityAndTonnage', value: 'MachineCapicityAndTonnage', },
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
        'DestinationPlantCode': '1032',
        'VendorPlantCode': 'VPlant01',
        'MachineNo': 'SM101',
        'Description': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapicityAndTonnage': '40',
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
export const AcceptableBOPUOM = ['Mass', 'Dimensionless', 'Volume', 'Dimension']
export const AcceptableMachineUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Dimension', 'Time']
export const AcceptableOperationUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Dimension', 'Time']
export const AcceptableFuelUOM = ['Mass', 'Volume']
export const AcceptablePowerUOM = ['Power']
export const AcceptableSheetMetalUOM = ['Kilogram', 'Gram', 'Milligram']





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


export const SIMULATION_LEFT_MENU_NOT_INCLUDED = ["Simulation Upload", "RM Import", "RM Domestic", "BOP Domestic", "BOP Import", "Process-Simulation", "Process", "Operation-Simulation", "Surface Treatment", "Overhead-Simulation", "Overhead", "Profits", "Profits-Simulation", "Freight-Simulation", "Combined Process", "Operations", "Exchange Rate", "Machine Rate"]

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

// Purchasing Group
export const purchasingGroup = [
    { label: 'A01', value: '1001-Domestic PGrp' },
    { label: 'A02', value: '1001-Imports P Grp' },
    { label: 'A03', value: '1001-General P Grp' },
    { label: 'A11', value: '1001-Domestic Engg' },
    { label: 'A12', value: '1001-Imports Engg' },
    { label: 'A13', value: '1001-General Engg' },
    { label: 'A21', value: 'Corp-SAP Centre' },
    { label: 'A22', value: 'Lighting-R&DCentre' },
    { label: 'A23', value: 'Corp-Pathshala' },
    { label: 'A24', value: 'Corp-Marketing' },
    { label: 'A25', value: 'Corp-Finance' },
    { label: 'A26', value: 'Corp-HRM' },
    { label: 'A27', value: 'Corp-Export' },
    { label: 'A28', value: 'Corp-Materials' },
    { label: 'A29', value: 'Corp-Mfg' },
    { label: 'A30', value: 'Corp-NonAutomotive' },
    { label: 'A31', value: 'Corp-Strategy' },
    { label: 'AA1', value: '2121-Domestic PGrp' },
    { label: 'AA2', value: '2121-Imports P Grp' },
    { label: 'AA3', value: '2121-General P Grp' },
    { label: 'AB1', value: '2201-Domestic PGrp' },
    { label: 'AB2', value: '2201-Imports P Grp' },
    { label: 'AB3', value: '2201-General P Grp' },
    { label: 'AC1', value: '1061-Domestic PGrp' },
    { label: 'AC2', value: '1061-Imports P Grp' },
    { label: 'AC3', value: '1061-General P Grp' },
    { label: 'AD1', value: '2301-Domestic PGrp' },
    { label: 'AD2', value: '2301-Imports P Grp' },
    { label: 'AD3', value: '2301-General P Grp' },
    { label: 'AE1', value: '1702-Domestic PGrp' },
    { label: 'AE2', value: '1702-Imports P Grp' },
    { label: 'AE3', value: '1702-General P Grp' },
    { label: 'AF1', value: '1008-Domestic PGrp' },
    { label: 'AF2', value: '1008-Imports P Grp' },
    { label: 'AF3', value: '1008-General P Grp' },
    { label: 'AG1', value: '5001-Domestic PGrp' },
    { label: 'AG2', value: '5001-Imports P Grp' },
    { label: 'AG3', value: '5001-General P Grp' },
    { label: 'AH1', value: '2001-Domestic PGrp' },
    { label: 'AH2', value: '2001-Imports P Grp' },
    { label: 'AH3', value: '2001-General P Grp' },
    { label: 'AI1', value: '2401-Domestic PGrp' },
    { label: 'AI2', value: '2401-Imports P Grp' },
    { label: 'AI3', value: '2401-General P Grp' },
    { label: 'AJ1', value: '1206-Domestic PGrp' },
    { label: 'AJ2', value: '1206-Imports P Grp' },
    { label: 'AJ3', value: '1206-General P Grp' },
    { label: 'AK1', value: '1207-Domestic PGrp' },
    { label: 'AK2', value: '1207-Imports P Grp' },
    { label: 'AK3', value: '1207-General P Grp' },
    { label: 'AM1', value: '2002-Domestic PGrp' },
    { label: 'AM2', value: '2002-Imports P Grp' },
    { label: 'AM3', value: '2002-General P Grp' },
    { label: 'AN1', value: '2711-Domestic PGrp' },
    { label: 'AN2', value: '2711-Imports P Grp' },
    { label: 'AN3', value: '2711-General P Grp' },
    { label: 'AO1', value: '2712-Domestic PGrp' },
    { label: 'AO2', value: '2712-Imports P Grp' },
    { label: 'AO3', value: '2712-General P Grp' },
    { label: 'AP1', value: '2713-Domestic PGrp' },
    { label: 'AP2', value: '2713-Imports P Grp' },
    { label: 'AP3', value: '2713-General P Grp' },
    { label: 'AQ1', value: '2714-Domestic PGrp' },
    { label: 'AQ2', value: '2714-Imports P Grp' },
    { label: 'AQ3', value: '2714-General P Grp' },
    { label: 'AR1', value: '2715-Domestic PGrp' },
    { label: 'AR2', value: '2715-Imports P Grp' },
    { label: 'AR3', value: '2715-General P Grp' },
    { label: 'AS1', value: '2716-Domestic PGrp' },
    { label: 'AS2', value: '2716-Imports P Grp' },
    { label: 'AS3', value: '2716-General P Grp' },
    { label: 'AT1', value: '1211-Domestic PGrp' },
    { label: 'AT2', value: '1211-Imports P Grp' },
    { label: 'AT3', value: '1211-General P Grp' },
    { label: 'AU1', value: '1212-Domestic PGrp' },
    { label: 'AU2', value: '1212-Imports P Grp' },
    { label: 'AU3', value: '1212-General P Grp' },
    { label: 'AV1', value: '1213-Domestic PGrp' },
    { label: 'AV2', value: '1213-Imports P Grp' },
    { label: 'AV3', value: '1213-General P Grp' },
    { label: 'AW1', value: '3201-Domestic PGrp' },
    { label: 'AW2', value: '3201-Imports P Grp' },
    { label: 'AW3', value: '3201-General P Grp' },
    { label: 'AX1', value: '3202-Domestic PGrp' },
    { label: 'AX2', value: '3202-Imports P Grp' },
    { label: 'AX3', value: '3202-General P Grp' },
    { label: 'AY1', value: '3203-Domestic PGrp' },
    { label: 'AY2', value: '3203-Imports P Grp' },
    { label: 'AY3', value: '3203-General P Grp' },
    { label: 'AZ1', value: '1604-Domestic PGrp' },
    { label: 'AZ2', value: '1604-Imports P Grp' },
    { label: 'AZ3', value: '1604-General P Grp' },
    { label: 'B01', value: '1002-Domestic PGrp' },
    { label: 'B02', value: '1002-Imports P Grp' },
    { label: 'B03', value: '1002-General P Grp' },
    { label: 'B11', value: '1002-Domestic Engg' },
    { label: 'B12', value: '1002-Imports Engg' },
    { label: 'B13', value: '1002-General Engg' },
    { label: 'B21', value: '1005-Domestic OPER' },
    { label: 'B22', value: '1005-Imports OPER' },
    { label: 'B23', value: '1005-General OPER' },
    { label: 'B31', value: '1006-P Group SPM' },
    { label: 'B41', value: '1007-P Group R & D' },
    { label: 'B51', value: '1005-P Group R & D' },
    { label: 'B61', value: '1005-Domestic ENGG' },
    { label: 'B62', value: '1005-Imports ENGG' },
    { label: 'B63', value: '1005-General ENGG' },
    { label: 'BA1', value: '2502-Domestic PGrp' },
    { label: 'BA2', value: '2502-Imports P Grp' },
    { label: 'BA3', value: '2502-General P Grp' },
    { label: 'BAA', value: '3101-Domestic PGrp' },
    { label: 'BAB', value: '3101-Imports P Grp' },
    { label: 'BAC', value: '3101-General P Grp' },
    { label: 'BAD', value: '1037-Domestic PGrp' },
    { label: 'BAE', value: '1037-Imports P Grp' },
    { label: 'BAF', value: '1037-General P Grp' },
    { label: 'BB1', value: '2503-Domestic PGrp' },
    { label: 'BB2', value: '2503-Imports P Grp' },
    { label: 'BB3', value: '2503-General P Grp' },
    { label: 'BBA', value: '5301-Domestic PGrp' },
    { label: 'BBB', value: '5301-Imports P Grp' },
    { label: 'BBC', value: '5301-General P Grp' },
    { label: 'BBD', value: '1703-Domestic PGrp' },
    { label: 'BBE', value: '1703-Imports P Grp' },
    { label: 'BBF', value: '1703-General P Grp' },
    { label: 'BBG', value: '5201-Domestic PGrp' },
    { label: 'BBH', value: '5201-Imports P Grp' },
    { label: 'BBI', value: '5201-General P Grp' },
    { label: 'BC1', value: '2504-Domestic PGrp' },
    { label: 'BC2', value: '2504-Imports P Grp' },
    { label: 'BC3', value: '2504-General P Grp' },
    { label: 'BD1', value: '2505-Domestic PGrp' },
    { label: 'BD2', value: '2505-Imports P Grp' },
    { label: 'BD3', value: '2505-General P Grp' },
    { label: 'BE1', value: '2506-Domestic PGrp' },
    { label: 'BE2', value: '2506-Imports P Grp' },
    { label: 'BE3', value: '2506-General P Grp' },
    { label: 'BF1', value: '2507-Domestic PGrp' },
    { label: 'BF2', value: '2507-Imports P Grp' },
    { label: 'BF3', value: '2507-General P Grp' },
    { label: 'BG1', value: '2508-Domestic PGrp' },
    { label: 'BG2', value: '2508-Imports P Grp' },
    { label: 'BG3', value: '2508-General P Grp' },
    { label: 'BH1', value: '2509-Domestic PGrp' },
    { label: 'BH2', value: '2509-Imports P Grp' },
    { label: 'BH3', value: '2509-General P Grp' },
    { label: 'BI1', value: '2510-Domestic PGrp' },
    { label: 'BI2', value: '2510-Imports P Grp' },
    { label: 'BI3', value: '2510-General P Grp' },
    { label: 'BJ1', value: '2511-Domestic PGrp' },
    { label: 'BJ2', value: '2511-Imports P Grp' },
    { label: 'BJ3', value: '2511-General P Grp' },
    { label: 'BK1', value: '1711-Domestic PGrp' },
    { label: 'BK2', value: '1711-General P Grp' },
    { label: 'BK3', value: '1711-Imports P Grp' },
    { label: 'BL1', value: '1712-Domestic PGrp' },
    { label: 'BL2', value: '1712-General P Grp' },
    { label: 'BL3', value: '1712-Imports P Grp' },
    { label: 'BM1', value: '1713-Domestic PGrp' },
    { label: 'BM2', value: '1713-General P Grp' },
    { label: 'BM3', value: '1713-Imports P Grp' },
    { label: 'BV1', value: '5401-Domestic PGrp' },
    { label: 'BV2', value: '5401-General P Grp' },
    { label: 'BV3', value: '5401-Imports P Grp' },
    { label: 'C01', value: '1003-Domestic PGrp' },
    { label: 'C02', value: '1003-Imports P Grp' },
    { label: 'C03', value: '1003-General P Grp' },
    { label: 'CC1', value: '1010-Domestic PGrp' },
    { label: 'CC2', value: '1010-Imports P Grp' },
    { label: 'CC3', value: '1010-General P Grp' },
    { label: 'D01', value: '1004-Domestic PGrp' },
    { label: 'D02', value: '1004-Imports P Grp' },
    { label: 'D03', value: '1004-General P Grp' },
    { label: 'E01', value: '1021-Domestic PGrp' },
    { label: 'E02', value: '1021-Imports P Grp' },
    { label: 'E03', value: '1021-General P Grp' },
    { label: 'F01', value: '1031-Domestic PGrp' },
    { label: 'F02', value: '1031-Imports P Grp' },
    { label: 'F03', value: '1031-General P Grp' },
    { label: 'G01', value: '1032-Domestic PGrp' },
    { label: 'G02', value: '1032-Imports P Grp' },
    { label: 'G03', value: '1032-General P Grp' },
    { label: 'H01', value: '1033-Domestic PGrp' },
    { label: 'H02', value: '1033-Imports P Grp' },
    { label: 'H03', value: '1033-General P Grp' },
    { label: 'H04', value: '1033- Ligh Engg' },
    { label: 'I01', value: '1801-Domestic PGrp' },
    { label: 'I02', value: '1801-Imports P Grp' },
    { label: 'I03', value: '1801-General P Grp' },
    { label: 'I11', value: '1802-Domestic PGrp' },
    { label: 'I12', value: '1802-Imports P Grp' },
    { label: 'I13', value: '1802-General P Grp' },
    { label: 'I21', value: '1805-Domestic PGrp' },
    { label: 'I22', value: '1805-Imports P Grp' },
    { label: 'I23', value: '1805-General P Grp' },
    { label: 'I31', value: '1806-Domestic PGrp' },
    { label: 'I32', value: '1806-Imports P Grp' },
    { label: 'I33', value: '1806-General P Grp' },
    { label: 'J01', value: '1101-Domestic PGrp' },
    { label: 'J02', value: '1101-Imports P Grp' },
    { label: 'J03', value: '1101-General P Grp' },
    { label: 'J11', value: '1104-Domestic PGrp' },
    { label: 'J12', value: '1104-Imports P Grp' },
    { label: 'J13', value: '1104-General P Grp' },
    { label: 'J21', value: '1103-Domestic PGrp' },
    { label: 'J31', value: '1111-Domestic PGrp' },
    { label: 'J32', value: '1111-Imports P Grp' },
    { label: 'J33', value: '1111-General P Grp' },
    { label: 'J41', value: 'MAGL-HO (Domestic)' },
    { label: 'J42', value: 'MAGL-HO (imports)' },
    { label: 'J43', value: 'MAGL-HO ( General)' },
    { label: 'K01', value: '1102-Domestic PGrp' },
    { label: 'K02', value: '1102-Imports P Grp' },
    { label: 'K03', value: '1102-General P Grp' },
    { label: 'K11', value: '1112-Domestic PGrp' },
    { label: 'K12', value: '1112-Imports P Grp' },
    { label: 'K13', value: '1112-General P Grp' },
    { label: 'K21', value: '1113-Domestic PGrp' },
    { label: 'K22', value: '1113-Imports P Grp' },
    { label: 'K23', value: '1113-General P Grp' },
    { label: 'L01', value: '1201-Domestic PGrp' },
    { label: 'L02', value: '1201-Imports P Grp' },
    { label: 'L03', value: '1201-General P Grp' },
    { label: 'M01', value: '1202-Domestic PGrp' },
    { label: 'M02', value: '1202-Imports P Grp' },
    { label: 'M03', value: '1202-General P Grp' },
    { label: 'MT1', value: '2902-Domestic PGrp' },
    { label: 'MT2', value: '2902-Imports P Grp' },
    { label: 'MT3', value: '2902-General P Grp' },
    { label: 'N01', value: '1203-Domestic PGrp' },
    { label: 'N02', value: '1203-Imports P Grp' },
    { label: 'N03', value: '1203-General P Grp' },
    { label: 'O01', value: '1401-Domestic PGrp' },
    { label: 'O02', value: '1401-Imports P Grp' },
    { label: 'O03', value: '1401-General P Grp' },
    { label: 'P01', value: '1402-Domestic PGrp' },
    { label: 'P02', value: '1402-Imports P Grp' },
    { label: 'P03', value: '1402-General P Grp' },
    { label: 'Q01', value: '1403-Domestic PGrp' },
    { label: 'Q02', value: '1403-Imports P Grp' },
    { label: 'Q03', value: '1403-General P Grp' },
    { label: 'R01', value: '1404-Domestic PGrp' },
    { label: 'R02', value: '1404-Imports P Grp' },
    { label: 'R03', value: '1404-General P Grp' },
    { label: 'S01', value: '1511-Domestic PGrp' },
    { label: 'S02', value: '1511-Imports P Grp' },
    { label: 'S03', value: '1511-General P Grp' },
    { label: 'T01', value: '1512-Domestic PGrp' },
    { label: 'T02', value: '1512-Imports P Grp' },
    { label: 'T03', value: '1512-General P Grp' },
    { label: 'U01', value: '1513-Domestic PGrp' },
    { label: 'U02', value: '1513-Imports P Grp' },
    { label: 'U03', value: '1513-General P Grp' },
    { label: 'V01', value: '1514-Domestic PGrp' },
    { label: 'V02', value: '1514-Imports P Grp' },
    { label: 'V03', value: '1514-General P Grp' },
    { label: 'W01', value: '1405-Domestic PGrp' },
    { label: 'W02', value: '1405-Imports P Grp' },
    { label: 'W03', value: '1405-General P Grp' },
    { label: 'X01', value: '1601-Domestic PGrp' },
    { label: 'X02', value: '1601-Imports P Grp' },
    { label: 'X03', value: '1601-General P Grp' },
    { label: 'Y01', value: '1701-Domestic PGrp' },
    { label: 'Y02', value: '1701-Imports P Grp' },
    { label: 'Y03', value: '1701-General P Grp' },
    { label: 'Z01', value: '1901-Domestic PGrp' },
    { label: 'Z02', value: '1901-Imports P Grp' },
    { label: 'Z03', value: '1901-General P Grp' },
    { label: 'ZA1', value: '2601-Domestic PGrp' },
    { label: 'ZA2', value: '2601-Imports P Grp' },
    { label: 'ZA3', value: '2601-General P Grp' },
    { label: 'ZB1', value: '2701-Domestic PGrp' },
    { label: 'ZB2', value: '2701-Imports P Grp' },
    { label: 'ZB3', value: '2701-General P Grp' },
    { label: 'ZC1', value: '2702-Domestic PGrp' },
    { label: 'ZC2', value: '2702-Imports P Grp' },
    { label: 'ZC3', value: '2702-General P Grp' },
    { label: 'ZD1', value: '1515-Domestic PGrp' },
    { label: 'ZD2', value: '1515-Imports P Grp' },
    { label: 'ZD3', value: '1515-General P Grp' },
    { label: 'ZE1', value: '2703-Domestic PGrp' },
    { label: 'ZE2', value: '2703-Imports P Grp' },
    { label: 'ZE3', value: '2703-General P Grp' },
    { label: 'ZF1', value: '1407-Domestic PGrp' },
    { label: 'ZF2', value: '1407-Imports P Grp' },
    { label: 'ZF3', value: '1407-General P Grp' },
    { label: 'ZG1', value: '2801-Domestic PGrp' },
    { label: 'ZG2', value: '2801-Imports P Grp' },
    { label: 'ZG3', value: '2801-General P Grp' },
    { label: 'ZH1', value: '2901-Domestic PGrp' },
    { label: 'ZH2', value: '2901-Imports P Grp' },
    { label: 'ZH3', value: '2901-General P Grp' },
    { label: 'ZJ1', value: '1009-Domestic PGrp' },
    { label: 'ZJ2', value: '1009-Imports P Grp' },
    { label: 'ZJ3', value: '1009-General P Grp' },
    { label: 'ZK1', value: '2402-Domestic PGrp' },
    { label: 'ZK2', value: '2402-Imports P Grp' },
    { label: 'ZK3', value: '2402-General P Grp' },
    { label: 'ZL1', value: '3001-Domestic PGrp' },
    { label: 'ZL2', value: '3001-Imports P Grp' },
    { label: 'ZL3', value: '3001-General P Grp' },
    { label: 'ZM1', value: '1034-Domestic PGrp' },
    { label: 'ZM2', value: '1034-Imports P Grp' },
    { label: 'ZM3', value: '1034-General P Grp' },
    { label: 'ZN1', value: '1035-Domestic PGrp' },
    { label: 'ZN2', value: '1035-Imports P Grp' },
    { label: 'ZN3', value: '1035-General P Grp' },
    { label: 'ZO1', value: '1036-Domestic PGrp' },
    { label: 'ZO2', value: '1036-Imports P Grp' },
    { label: 'ZO3', value: '1036-General P Grp' },
    { label: 'ZP1', value: '2704-Domestic PGrp' },
    { label: 'ZP2', value: '2704-Imports P Grp' },
    { label: 'ZP3', value: '2704-General P Grp' },
    { label: 'ZQ1', value: '2705-Domestic PGrp' },
    { label: 'ZQ2', value: '2705-Imports P Grp' },
    { label: 'ZQ3', value: '2705-General P Grp' },
    { label: 'ZR1', value: '2706-Domestic PGrp' },
    { label: 'ZR2', value: '2706-Imports P Grp' },
    { label: 'ZR3', value: '2706-General P Grp' },
    { label: 'ZS1', value: '1022-Domestic PGrp' },
    { label: 'ZS2', value: '1022-Imports P Grp' },
    { label: 'ZS3', value: '1022-General P Grp' },
    { label: 'ZT1', value: '1053-Domestic PGrp' },
    { label: 'ZT2', value: '1053-Imports P Grp' },
    { label: 'ZT3', value: '1053-General P Grp' },
    { label: 'ZU1', value: '1408-Domestic PGrp' },
    { label: 'ZU2', value: '1408-Imports P Grp' },
    { label: 'ZU3', value: '1408-General P Grp' },
    { label: 'ZV1', value: '2707-Domestic PGrp' },
    { label: 'ZV2', value: '2707-Imports P Grp' },
    { label: 'ZV3', value: '2707-General P Grp' },
    { label: 'ZW1', value: '5101-Domestic PGrp' },
    { label: 'ZW2', value: '5101-Imports P Grp' },
    { label: 'ZW3', value: '5101-General P Grp' },
    { label: 'ZX1', value: '5102-Domestic PGrp' },
    { label: 'ZX2', value: '5102-Imports P Grp' },
    { label: 'ZX3', value: '5102-General P Grp' },
    { label: 'ZY1', value: '1071-Domestic PGrp' },
    { label: 'ZY2', value: '1071-Imports P Grp' },
    { label: 'ZY3', value: '1071-General P Grp' },
    { label: 'ZZ1', value: '1066-Domestic PGrp' },
    { label: 'ZZ2', value: '1066-Imports P Grp' },
    { label: 'ZZ3', value: '1066-General P Grp' },
]

// Material Group
export const materialGroup = [
    { label: 'M001', value: 'Assets' },
    { label: 'M002', value: 'Bulb - Import' },
    { label: 'M003', value: 'Bulb- Domestic' },
    { label: 'M004', value: 'Cable - Domestic' },
    { label: 'M005', value: 'Cable - Import' },
    { label: 'M006', value: 'Chemical ,Paints & P' },
    { label: 'M007', value: 'Consumables-Domestic' },
    { label: 'M008', value: 'Copper Wire - Domest' },
    { label: 'M009', value: 'Copper Wire - Import' },
    { label: 'M010', value: 'Die casting - Domest' },
    { label: 'M011', value: 'Die casting - Import' },
    { label: 'M012', value: 'Electronics - Import' },
    { label: 'M013', value: 'Electronics- Domesti' },
    { label: 'M014', value: 'Finish Products' },
    { label: 'M015', value: 'Gauges' },
    { label: 'M016', value: 'Glass - Domestic' },
    { label: 'M017', value: 'Glass - Import' },
    { label: 'M018', value: 'Handle Bar - Domesti' },
    { label: 'M019', value: 'Handle Bar - Import' },
    { label: 'M020', value: 'Hardware - Domestic' },
    { label: 'M021', value: 'Hardware - Import' },
    { label: 'M022', value: 'Hazardous Material' },
    { label: 'M023', value: 'Jigs & Fixtures' },
    { label: 'M024', value: 'Electrical spares' },
    { label: 'M025', value: 'Measuring Equipments' },
    { label: 'M026', value: 'Others' },
    { label: 'M027', value: 'Packaging - Domestic' },
    { label: 'M028', value: 'Packaging - Import' },
    { label: 'M029', value: 'Electronics spares' },
    { label: 'M030', value: 'Plastics - Domestic' },
    { label: 'M031', value: 'Plastics - Import' },
    { label: 'M032', value: 'Returnable Transport' },
    { label: 'M033', value: 'RM - Al & Al Alloy' },
    { label: 'M034', value: 'RM - ABS - Domestic' },
    { label: 'M035', value: 'RM - ABS - Import' },
    { label: 'M036', value: 'RM - Acrylic - Dome' },
    { label: 'M037', value: 'RM - Acrylic - Impo' },
    { label: 'M038', value: 'RM - Al & Al Alloys' },
    { label: 'M039', value: 'RM - Brass - Domest' },
    { label: 'M040', value: 'RM - Brass - Import' },
    { label: 'M041', value: 'RM - Copper - Domes' },
    { label: 'M042', value: 'RM - Copper - Impor' },
    { label: 'M043', value: 'RM - CRCA - Domesti' },
    { label: 'M044', value: 'RM - CRCA - Import' },
    { label: 'M045', value: 'RM - Nylon - Domes' },
    { label: 'M046', value: 'RM - Nylon - Impor' },
    { label: 'M047', value: 'RM - PB - Domestic' },
    { label: 'M048', value: 'RM - PB - Import' },
    { label: 'M049', value: 'RM - PBT - Domestic' },
    { label: 'M050', value: 'RM - PBT - Import' },
    { label: 'M051', value: 'RM - PC - Domestic' },
    { label: 'M052', value: 'RM - PC - Import' },
    { label: 'M053', value: 'RM - PCB - Domestic' },
    { label: 'M054', value: 'RM - PCB - Import' },
    { label: 'M055', value: 'RM - PET - Domestic' },
    { label: 'M056', value: 'RM - PET - Import' },
    { label: 'M057', value: 'RM - POM - Domestic' },
    { label: 'M058', value: 'RM - POM - Import' },
    { label: 'M059', value: 'RM - PP - Domestic' },
    { label: 'M060', value: 'RM - PP - Import' },
    { label: 'M061', value: 'RM - PPCP - Domesti' },
    { label: 'M062', value: 'RM - PPCP - Import' },
    { label: 'M063', value: 'RM - Spring Steel -' },
    { label: 'M064', value: 'RM - Spring Steel -' },
    { label: 'M065', value: 'RM - Stainless Stee' },
    { label: 'M066', value: 'RM - Stainless Stee' },
    { label: 'M067', value: 'RM - Zn & Zn Alloys' },
    { label: 'M068', value: 'RM - Zn & Zn Alloys' },
    { label: 'M069', value: 'RM -Lead / Lead Allo' },
    { label: 'M070', value: 'RM -Lead / Lead Allo' },
    { label: 'M071', value: 'RM -Others' },
    { label: 'M072', value: 'Rubber - Domestic' },
    { label: 'M073', value: 'Rubber - Import' },
    { label: 'M074', value: 'Scrap' },
    { label: 'M075', value: 'Sheet Metal - Domest' },
    { label: 'M076', value: 'Sheet Metal - Import' },
    { label: 'M077', value: 'Silver' },
    { label: 'M078', value: 'Solder - Domestic' },
    { label: 'M079', value: 'Solder - Import' },
    { label: 'M080', value: 'Springs - Domestic' },
    { label: 'M081', value: 'Springs - Import' },
    { label: 'M082', value: 'Sub Assy - Domestic' },
    { label: 'M083', value: 'Sub Assy - Import' },
    { label: 'M084', value: 'Sub Assy - Inhouse' },
    { label: 'M085', value: 'Surface Treatment -' },
    { label: 'M086', value: 'Mechanical spares' },
    { label: 'M087', value: 'Turned parts - Domes' },
    { label: 'M088', value: 'Turned parts - Impor' },
    { label: 'M089', value: 'Wiring Harness - Dom' },
    { label: 'M090', value: 'Wiring Harness - Imp' },
    { label: 'M091', value: 'Sheet metal - In-hou' },
    { label: 'M092', value: 'Plastics - In-house' },
    { label: 'M093', value: 'Die Casting - In-hou' },
    { label: 'M094', value: 'Mirror - Domestic' },
    { label: 'M095', value: 'Mirror - Import' },
    { label: 'M096', value: 'RM -AGM - Import' },
    { label: 'M097', value: 'RM -AGM - -Domestic' },
    { label: 'M098', value: 'IT Spares' },
    { label: 'M099', value: 'Internal Finish Prod' },
    { label: 'M100', value: 'RM - Carbon Steel -' },
    { label: 'M101', value: 'Hydraulic spares' },
    { label: 'M102', value: 'Pneumatic Spares' },
    { label: 'M103', value: 'Hydro-pneumatic' },
    { label: 'M104', value: 'Rivet' },
    { label: 'M105', value: 'Powder Coating' },
    { label: 'M106', value: 'Solar Energy Materia' },
    { label: 'M107', value: 'Battery' },
    { label: 'M108', value: 'Consumables-Imported' },
    { label: 'M109', value: 'Chemical ,Paints-Imp' },
    { label: 'M110', value: 'Proto Finish Product' },
]


export const FACING = 'Facing'
export const DRILLING = 'Drilling'
export const TURNING = 'Turning'
export const CHAMFERING = 'Chamfering'
export const FACEMILING = 'Face Milling'
export const SIDEFACEMILING = 'Side Face Miling'
export const SLOTCUTTING = 'Slot Cutting'
export const CHAMFERINGMILLER = 'Chamfering Miller'
export const ENDMILL = 'End Mill'

export const getTechnology = [1, 8, 7, 2, 4]
export const technologyForDensity = [1, 7]


export const CostingSimulationDownload = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "Vendor Name", value: "VendorName" },
    { label: "Plant Code", value: "PlantCode" },
    { label: "Technology", value: "Technology" },
    { label: "Raw Material", value: "RMName" },
    { label: "RawMaterial Grade", value: "RMGrade" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "PO Price Old", value: "OldPOPrice" },
    { label: "PO Price New", value: "NewPOPrice" },
    { label: "Old Basic Rate", value: "OldRMRate" },
    { label: 'New Basic Rate', value: 'NewRMRate' },
    { label: "ScrapRate", value: "OldScrapRate" },
    { label: 'NewScrapRate', value: 'NewScrapRate' },
    { label: "RM Cost Old", value: "OldRMPrice" },
    { label: "RM Cost New", value: "NewRMPrice" },
    { label: "Finish Weight", value: "RawMaterialFinishWeight" },
    { label: "Gross Weight", value: "RawMaterialGrossWeight" },

    // { label: "EffectiveDate", value: "EffectiveDate" },
]

export const BOP_DOMESTIC_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber", },
    { label: "BoughtOutPartName", value: "BoughtOutPartName", },
    { label: "BoughtOutPartCategory", value: "BoughtOutPartCategory", },
    { label: "UOM", value: "UOM", },
    { label: "Specification", value: "Specification", },
    { label: "Plants", value: "Plants", },
    { label: "Vendor", value: "Vendor", },
    { label: "NumberOfPieces", value: "NumberOfPieces", },
    { label: "BasicRate", value: "BasicRate", },
    { label: "NetLandedCost", value: "NetLandedCost", },
    { label: "EffectiveDate", value: "EffectiveDate", }
]

export const BOP_IMPORT_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber", },
    { label: "BoughtOutPartName", value: "BoughtOutPartName", },
    { label: "BoughtOutPartCategory", value: "BoughtOutPartCategory", },
    { label: "UOM", value: "UOM", },
    { label: "Specification", value: "Specification", },
    { label: "Plants", value: "Plants", },
    { label: "Vendor", value: "Vendor", },
    { label: "NumberOfPieces", value: "NumberOfPieces", },
    { label: "BasicRate", value: "BasicRate", },
    { label: "NetLandedCostConversion", value: "NetLandedCostConversion", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const BOP_SOBLISTING_DOWNLOAD_EXCEl = [
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber", },
    { label: "BoughtOutPartName", value: "BoughtOutPartName", },
    { label: "BoughtOutPartCategory", value: "BoughtOutPartCategory", },
    { label: "Specification", value: "Specification", },
    { label: "NoOfVendors", value: "NoOfVendors", },
    { label: "Plant", value: "Plant", },
    { label: "ShareOfBusinessPercentage", value: "ShareOfBusinessPercentage", },
    { label: "WeightedNetLandedCost", value: "WeightedNetLandedCost", },
]

export const EXCHANGERATE_DOWNLOAD_EXCEl = [
    { label: "Currency", value: "Currency", },
    { label: "CurrencyExchangeRate", value: "CurrencyExchangeRate", },
    { label: "BankRate", value: "BankRate", },
    { label: "BankCommissionPercentage", value: "BankCommissionPercentage", },
    { label: "CustomRate", value: "CustomRate", },
    { label: "EffectiveDate", value: "EffectiveDate", },
    { label: "DateOfModification", value: "DateOfModification", },
]

export const FREIGHT_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "Mode", value: "Mode", },
    { label: "VendorName", value: "VendorName", },
    { label: "SourceCity", value: "SourceCity", },
    { label: "DestinationCity", value: "DestinationCity", },
]

export const FUELLISTING_DOWNLOAD_EXCEl = [
    { label: "FuelName", value: "FuelName", },
    { label: "UnitOfMeasurementName", value: "UnitOfMeasurementName", },
    { label: "StateName", value: "StateName", },
    { label: "Rate", value: "Rate", },
    { label: "EffectiveDate", value: "EffectiveDate", },
    { label: "ModifiedDate", value: "ModifiedDate", },
]

export const POWERLISTING_DOWNLOAD_EXCEl = [
    { label: "StateName", value: "StateName", },
    { label: "PlantName", value: "PlantName", },
    { label: "NetPowerCostPerUnit", value: "NetPowerCostPerUnit", }
]

export const INTERESTRATE_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "VendorName", value: "VendorName", },
    { label: "ICCApplicability", value: "ICCApplicability", },
    { label: "ICCPercent", value: "ICCPercent", },
    { label: "PaymentTermApplicability", value: "PaymentTermApplicability", },
    { label: "RepaymentPeriod", value: "RepaymentPeriod", },
    { label: "PaymentTermPercent", value: "PaymentTermPercent", },
    { label: "EffectiveDate", value: "EffectiveDate", }
]

export const LABOUR_DOWNLOAD_EXCEl = [
    { label: "IsContractBase", value: "IsContractBase", },
    { label: "Vendor", value: "Vendor", },
    { label: "Plant", value: "Plant", },
    { label: "State", value: "State", },
    { label: "MachineType", value: "MachineType", },
    { label: "LabourType", value: "LabourType", },
    { label: "LabourRate", value: "LabourRate", },
    { label: "EffectiveDate", value: "EffectiveDate", }
]

export const MACHINERATE_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "Technologies", value: "Technologies", },
    { label: "VendorName", value: "VendorName", },
    { label: "Plants", value: "Plants", },
    { label: "MachineNumber", value: "MachineNumber", },
    { label: "MachineTypeName", value: "MachineTypeName", },
    { label: "MachineTonnage", value: "MachineTonnage", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "MachineRate", value: "MachineRate", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const PROCESSLISTING_DOWNLOAD_EXCEl = [
    { label: "ProcessName", value: "ProcessName", },
    { label: "ProcessCode", value: "ProcessCode", },
]

export const RMDOMESTIC_DOWNLOAD_EXCEl = [
    { label: "CostingHead", value: "CostingHead", },
    { label: "RawMaterial", value: "RawMaterial", },
    { label: "RMGrade", value: "RMGrade", },
    { label: "RMSpec", value: "RMSpec", },
    { label: "MaterialType", value: "MaterialType", },
    { label: "Category", value: "Category", },
    { label: "TechnologyName", value: "TechnologyName", },
    { label: "Plant", value: "Plant", },
    { label: "VendorName", value: "VendorName", },
    { label: "UOM", value: "UOM", },
    { label: "BasicRate", value: "BasicRate", },
    { label: "RMFreightCost", value: "RMFreightCost", },
    { label: "RMShearingCost", value: "RMShearingCost", },
    { label: "ScrapRate", value: "ScrapRate", },
    { label: "NetLandedCost", value: "NetLandedCost", },
    { label: "EffectiveDate", value: "EffectiveDate", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "ProcessName", value: "ProcessName", },
]

export const RMIMPORT_DOWNLOAD_EXCEl = [
    { label: "CostingHead", value: "CostingHead", },
    { label: "RawMaterial", value: "RawMaterial", },
    { label: "RMGrade", value: "RMGrade", },
    { label: "RMSpec", value: "RMSpec", },
    { label: "MaterialType", value: "MaterialType", },
    { label: "Category", value: "Category", },
    { label: "TechnologyName", value: "TechnologyName", },
    { label: "Plant", value: "Plant", },
    { label: "VendorName", value: "VendorName", },
    { label: "UOM", value: "UOM", },
    { label: "BasicRate", value: "BasicRate", },
    { label: "RMFreightCost", value: "RMFreightCost", },
    { label: "RMShearingCost", value: "RMShearingCost", },
    { label: "ScrapRate", value: "ScrapRate", },
    { label: "NetLandedCost", value: "NetLandedCost", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const RMLISTING_DOWNLOAD_EXCEl = [
    { label: "RawMaterial", value: "RawMaterial", },
    { label: "Density", value: "Density", },
    { label: "RMName", value: "RMName", },
    { label: "RMGrade", value: "RMGrade", },
]

export const SPECIFICATIONLISTING_DOWNLOAD_EXCEl = [
    { label: "RMName", value: "RMName", },
    { label: "RMGrade", value: "RMGrade", },
    { label: "RMSpec", value: "RMSpec", },
]

export const OPERATION_DOWNLOAD_EXCEl = [
    { label: "CostingHead", value: "CostingHead", },
    { label: "Technology", value: "Technology", },
    { label: "OperationName", value: "OperationName", },
    { label: "OperationCode", value: "OperationCode", },
    { label: "Plants", value: "Plants", },
    { label: "VendorName", value: "VendorName", },
    { label: "UnitOfMeasurement", value: "UnitOfMeasurement", },
    { label: "Rate", value: "Rate", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const OVERHEAD_DOWNLOAD_EXCEl = [
    { label: "TypeOfHead", value: "TypeOfHead", },
    { label: "VendorName", value: "VendorName", },
    { label: "ClientName", value: "ClientName", },
    { label: "ModelType", value: "ModelType", },
    { label: "OverheadApplicabilityType", value: "OverheadApplicabilityType", },
    { label: "OverheadPercentage", value: "OverheadPercentage", },
    { label: "OverheadRMPercentage", value: "OverheadRMPercentage", },
    { label: "OverheadBOPPercentage", value: "OverheadBOPPercentage", },
    { label: "OverheadMachiningCCPercentage", value: "OverheadMachiningCCPercentage", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const ASSEMBLYPART_DOWNLOAD_EXCEl = [
    { label: "Technology", value: "Technology", },
    { label: "BOMNumber", value: "BOMNumber", },
    { label: "PartNumber", value: "PartNumber", },
    { label: "PartName", value: "PartName", },
    { label: "NumberOfParts", value: "NumberOfParts", },
    { label: "BOMLevelCount", value: "BOMLevelCount", },
    { label: "ECNNumber", value: "ECNNumber", },
    { label: "RevisionNumber", value: "RevisionNumber", },
    { label: "DrawingNumber", value: "DrawingNumber", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const INDIVIDUALPART_DOWNLOAD_EXCEl = [
    { label: "Technology", value: "Technology", },
    { label: "PartNumber", value: "PartNumber", },
    { label: "PartName", value: "PartName", },
    { label: "ECNNumber", value: "ECNNumber", },
    { label: "RevisionNumber", value: "RevisionNumber", },
    { label: "DrawingNumber", value: "DrawingNumber", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]

export const VBCPLANT_DOWNLOAD_EXCEl = [
    { label: "VendorName", value: "VendorName", },
    { label: "PlantName", value: "PlantName", },
    { label: "PlantCode", value: "PlantCode", },
    { label: "CountryName", value: "CountryName", },
    { label: "StateName", value: "StateName", },
    { label: "CityName", value: "CityName", },
]

export const REASON_DOWNLOAD_EXCEl = [
    { label: "Reason", value: "Reason", },
]

export const VENDOR_DOWNLOAD_EXCEl = [
    { label: "VendorType", value: "VendorType", },
    { label: "VendorName", value: "VendorName", },
    { label: "VendorCode", value: "VendorCode", },
    { label: "Country", value: "Country", },
    { label: "State", value: "State", },
    { label: "City", value: "City", },
]

export const UOM_DOWNLOAD_EXCEl = [
    { label: "Unit", value: "Unit", },
    { label: "UnitSymbol", value: "UnitSymbol", },
    { label: "UnitType", value: "UnitType", },
]

export const VOLUME_DOWNLOAD_EXCEl = [
    { label: "IsVendor", value: "IsVendor", },
    { label: "Year", value: "Year", },
    { label: "Month", value: "Month", },
    { label: "VendorName", value: "VendorName", },
    { label: "PartNumber", value: "PartNumber", },
    { label: "PartName", value: "PartName", },
    { label: "Plant", value: "Plant", },
    { label: "BudgetedQuantity", value: "BudgetedQuantity", },
    { label: "ApprovedQuantity", value: "ApprovedQuantity", },
]

export const PROFIT_DOWNLOAD_EXCEl = [
    { label: "TypeOfHead", value: "TypeOfHead", },
    { label: "VendorName", value: "VendorName", },
    { label: "ClientName", value: "ClientName", },
    { label: "ModelType", value: "ModelType", },
    { label: "ProfitApplicabilityType", value: "ProfitApplicabilityType", },
    { label: "ProfitPercentage", value: "ProfitPercentage", },
    { label: "ProfitRMPercentage", value: "ProfitRMPercentage", },
    { label: "ProfitBOPPercentage", value: "ProfitBOPPercentage", },
    { label: "ProfitMachiningCCPercentage", value: "ProfitMachiningCCPercentage", },
    { label: "EffectiveDate", value: "EffectiveDate", },
]
export const ZBCPLANT_DOWNLOAD_EXCEl = [
    { label: "PlantName", value: "PlantName", },
    { label: "PlantCode", value: "PlantCode", },
    { label: "CompanyName", value: "CompanyName", },
    { label: "CountryName", value: "CountryName", },
    { label: "StateName", value: "StateName", },
    { label: "CityName", value: "CityName", },
]
