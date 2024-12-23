import { reactLocalStorage } from 'reactjs-localstorage';
import DayTime from '../components/common/DayTimeWrapper';


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
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyName", value: "TechnologyName" },
    { label: "PlantCode", value: "DestinationPlantCode" }, //*
    { label: "VendorCode", value: "VendorCode" }, //*
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" }, //NOUI
    { label: "SourceLocation", value: "SourceLocation" }, //NOUI
    { label: "UOM", value: "UOM" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*
    { label: "CutOffPrice", value: "CutOffPrice" }, //*    // KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*    // KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*    // KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" },
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]/* .filter(item => IsShowFreightAndShearingCostFields() || item.value !== 'FreightCost' && item.value !== 'ShearingCost'); */

export const RMDomesticZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "Note": "If you add different Scrap UOMs for the 'ScrapRate/JaliScrapRate/ForgingScrapRate,' enter the scrap rate in the 'ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "1511",
        "VendorCode": "P123",
        "HasDifferentSource": "Yes",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "BasicRate": "20",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",    // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",    // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",    // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "-",
        "ScrapRatePerScrapUOM": "-",
        "ScrapRate": "50",
        "CutOffPrice": "10",
        "FreightCost": "10",    // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",    // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "shot/stroke/Number",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",
        "FreightCost": "10",    // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",    // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",    // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",    // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",    // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMDomesticVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" }, //*
    { label: "VendorCode", value: "VendorCode" }, //NOUI,*
    { label: "PlantCode", value: "DestinationPlantCode" }, //NOUI
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*
    { label: "CutOffPrice", value: "CutOffPrice" }, //*// KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*// KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*// KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" },
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMDomesticVBCTempData = [
    {
        //"CostingHead": "VBC",
        "Note": "If you add different Scrap UOMs for the 'Scrap Rate,' enter the scrap rate in the 'ScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",// KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",// KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",// KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",
        "FreightCost": "10",// KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",// KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "shot/stroke/Number",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "0",
        "ScrapRatePerScrapUOM": "0",
        "ScrapRate": "50",
        "CutOffPrice": "10",
        "FreightCost": "10",// KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",// KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",// KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",// KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",// KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportZBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" }, //*
    { label: "PlantCode", value: "DestinationPlantCode" }, //*
    { label: "VendorCode", value: "VendorCode" }, //NOUI
    { label: "HasDifferentSource", value: "HasDifferentSource" },
    { label: "Source", value: "Source" }, //NOUI
    { label: "SourceLocation", value: "SourceLocation" }, //NOUI
    { label: "UOM", value: "UOM" }, //*
    { label: "Currency", value: "Currency" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*
    { label: "CutOffPrice", value: "CutOffPrice" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" },
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMDomesticCBCTempData = [
    {
        "Note": "If you add different Scrap UOMs for the 'Scrap Rate,' enter the scrap rate in the 'ScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "1032",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "shot/stroke/Number",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "0",
        "ScrapRatePerScrapUOM": "0",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Content",
    }
]

export const RMImportZBCTempData = [
    {
        //"CostingHead": "ZBC",
        "Note": "If you add different Scrap UOMs for the 'Scrap Rate,' enter the scrap rate in the 'ScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "Yes",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "Currency": "INR",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "0",
        "ScrapRatePerScrapUOM": "0",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "shot/stroke/Number",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "ZBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "DestinationPlantCode": "PC01",
        "VendorCode": "P123",
        "HasDifferentSource": "No",
        "Source": "Tata Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    }
]
export const RMDomesticCBC = [
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" }, //*
    { label: "CustomerCode", value: "CustomerCode" }, //NOUI,*
    { label: "UOM", value: "UOM" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*s
    { label: "CutOffPrice", value: "CutOffPrice" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMImportVBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" }, //*
    { label: "VendorCode", value: "VendorCode" }, //NOUI
    { label: "PlantCode", value: "DestinationPlantCode" }, //NOUI
    { label: "Source", value: "Source" },
    { label: "SourceLocation", value: "SourceLocation" },
    { label: "UOM", value: "UOM" }, //*
    { label: "Currency", value: "Currency" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*
    { label: "CutOffPrice", value: "CutOffPrice" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" }, //*
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMImportVBCTempData = [
    {
        //"CostingHead": "VBC",
        "Note": "If you add different Scrap UOMs for the 'Scrap Rate,' enter the scrap rate in the 'ScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "Currency": "INR",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "0",
        "ScrapRatePerScrapUOM": "0",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "shot/stroke/Number",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        //"CostingHead": "VBC",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "VendorCode": "V123",
        "DestinationPlantCode": "P123",
        "Source": "TATA Steel",
        "SourceLocation": "Jamshedpur",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    }
]
export const RMImportCBC = [
    //{ label: "CostingHead", value: "CostingHead" },
    { label: "Note", value: "Note" }, //*
    { label: "RawMaterial", value: "RawMaterial" }, //*
    { label: "Grade", value: "RMGrade" }, //*
    { label: "Spec", value: "RMSpec" }, //*
    { label: "Code", value: "RawMaterialCode" }, //*
    { label: "Category", value: "Category" }, //*
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" }, //*
    { label: "CustomerCode", value: "CustomerCode" }, //NOUI
    { label: "UOM", value: "UOM" }, //*
    { label: "Currency", value: "Currency" }, //*
    { label: "BasicRate", value: "BasicRate" }, //*
    { label: "IsScrapUOMApply", value: "IsScrapUOMApply", },
    { label: "ScrapUnitOfMeasurement", value: "ScrapUnitOfMeasurement", },
    { label: "UOMToScrapUOMRatio", value: "UOMToScrapUOMRatio", },
    { label: "ScrapRatePerScrapUOM/JaliScrapRatePerScrapUOM/ForgingScrapRatePerScrapUOM", value: "ScrapRatePerScrapUOM", },
    { label: "ScrapRate/JaliScrapRate/ForgingScrapRate", value: "ScrapRate" }, //*
    { label: "CutOffPrice", value: "CutOffPrice" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "FreightCost", value: "FreightCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "ShearingCost", value: "ShearingCost" }, //*         // KEEP COMMENTED ON RE						//RE
    { label: "CircleScrapRate", value: "CircleScrapRate" }, //*
    { label: "MachiningScrapRate", value: "MachiningScrapRate" }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: "EffectiveDate", value: "EffectiveDate" }, //*
    { label: "Remark", value: "Remark" },
]

export const RMImportCBCTempData = [
    {
        "Note": "If you add different Scrap UOMs for the 'Scrap Rate,' enter the scrap rate in the 'ScrapRatePerScrapUOM' column. Otherwise, add the scrap rate in the 'ScrapRate' field.",
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000001",
        "Category": "STD",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "Currency": "INR",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "No",
        "ScrapUnitOfMeasurement": "-",
        "UOMToScrapUOMRatio": "0",
        "ScrapRatePerScrapUOM": "0",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "shot/stroke/Number",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    },
    {
        "RawMaterial": "CRCA",
        "RMGrade": "15Cr3",
        "RMSpec": "50 mm",
        "RawMaterialCode": "RM-10000002",
        "Category": "CTS",
        "TechnologyName": "Sheet Metal",
        "CustomerCode": "C-10008",
        "UOM": "micrometer/kilometer/Feet/Inch/Millimeter/Centimeter/Meter",
        "Currency": "USD",
        "BasicRate": "500",
        "IsScrapUOMApply": "Yes",
        "ScrapUnitOfMeasurement": "Kilogram",
        "UOMToScrapUOMRatio": "10",
        "ScrapRatePerScrapUOM": "5",
        "ScrapRate": "50",
        "CutOffPrice": "10",         // KEEP COMMENTED ON RE						//RE
        "FreightCost": "10",         // KEEP COMMENTED ON RE						//RE
        "ShearingCost": "10",         // KEEP COMMENTED ON RE						//RE
        "CircleScrapRate": "20",
        "MachiningScrapRate": "20",
        "DestinationPlantCode": "EC1",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark Text",
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const RMSpecification = [
    { label: "RawMaterialName", value: "RawMaterialName" },//*
    { label: "Grade", value: "RMGrade" },//*
    { label: "Specification", value: "Specification" },//*
    { label: "Code", value: "RawMaterialCode" },//*
]

export const RMSpecificationXLTempData = [
    {
        "RawMaterialName": "CRCA",
        "RMGrade": "15Cr3",
        "Specification": "50 mm",
        "RawMaterialCode": "RM-10000001",
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const IndexDataListing = [
    { label: "Index", value: "IndexExchangeName", },
    { label: "CommodityName", value: "CommodityName", },
    { label: "Index UOM", value: "UOM", },
    { label: "From Currency", value: "FromCurrency", },
    { label: "To Currency", value: "ToCurrency", },
    { label: "EffectiveDate", value: "EffectiveDate", },
    { label: "Index Rate (From Currency)", value: "Rate", },
    { label: "ExchangeRateSourceName", value: "ExchangeRateSourceName", },
    { label: "Exchangerate", value: "ExchangeRate", },
]

export const IndexDataListingTempData = [
    {
        "IndexExchangeName": "LME",
        "CommodityName": "CU",
        "UOM": "kg",
        "FromCurrency": "USD",
        "ToCurrency": "INR",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Rate": "10",
        "ExchangeRateSourceName": "SBI",
        "ExchangeRate": "84",
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const IndexCommodityListing = [
    { label: "Index", value: "IndexExchangeName" },
]
export const IndexCommodityListingTempData = [
    {
        "IndexExchangeName": "13CF2",
    }
]
export const CommodityInIndexListing = [
    { label: "Index", value: "IndexExchangeName" },
    { label: "Commodity (In Index)", value: "CommodityName" },
]
export const CommodityInIndexListingTempData = [
    {
        "IndexExchangeName": "LME",
        "CommodityName": "Al",
    }
]
export const StandardizedCommodityNameListing = [
    { label: "Index", value: "IndexExchangeName" },
    { label: "Commodity Name (In Index)", value: "CommodityName" },
    { label: "Commodity Name (In CIR)", value: "CustomMaterialName" },
]
export const StandardizedCommodityNameTempData = [
    {
        "IndexExchangeName": "21FD2",
        "CommodityName": "al",
        "CustomMaterialName": "alloy",
    }
]
export const CommodityStandard = [
    { label: "Commodity Name (Standard)", value: "CommodityStandardName" },
]
export const CommodityStandardTempData = [
    {
        "CommodityStandardName": "Alluminum",
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
    { label: 'Potential Vendor', value: 'IsCriticalVendor' },
    { label: "Technology", value: 'Technology', defaultValue: "Technology" },
    { label: 'PlantCode', value: 'PlantCode' }
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
        'State': 'Madhya Pradesh',
        'City': 'Indore',
        'ZipCode': '123456',
        'AddressLine1': '123, Area location',
        'AddressLine2': '123, Area location',
        'IsCriticalVendor': 'YES OR NO',
        'Technology': 'Plastic,Sheet Metal,Die Casting',
        'PlantCode': '1001,952,100',
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Overhead = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'OverheadApplicability', value: 'OverheadApplicability', },
    { label: 'OverheadPercentage', value: 'OverheadPercentage', },
    { label: 'OverheadCCPercentage', value: 'OverheadCCPercentage', },
    { label: 'OverheadBOPPercentage', value: 'OverheadBOPPercentage', },
    { label: 'OverheadRMPercentage', value: 'OverheadRMPercentage', },
    { label: 'PlantCode', value: 'PlantCode', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const OverheadTempData = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'OverheadApplicability': 'RM',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '',
        'OverheadRMPercentage': '10',
        "PlantCode": '0503',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (OverheadApplicability).',
        'ModelType': 'High volume',
        'OverheadApplicability': 'BOP',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '10',
        'OverheadRMPercentage': '',
        "PlantCode": '0503',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]


export const OverheadVBC = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'OverheadApplicability', value: 'OverheadApplicability', },
    { label: 'OverheadPercentage', value: 'OverheadPercentage', },
    { label: 'OverheadCCPercentage', value: 'OverheadCCPercentage', },
    { label: 'OverheadBOPPercentage', value: 'OverheadBOPPercentage', },
    { label: 'OverheadRMPercentage', value: 'OverheadRMPercentage', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const OverheadVBC_TempData = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'OverheadApplicability': 'RM',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '',
        'OverheadRMPercentage': '10',
        'VendorCode': '1313',
        "PlantCode": '0503',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (OverheadApplicability).',
        'ModelType': 'High volume',
        'OverheadApplicability': 'BOP',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '10',
        'OverheadRMPercentage': '',
        'VendorCode': '1313',
        "PlantCode": '0503',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]
export const OverheadCBC = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'OverheadApplicability', value: 'OverheadApplicability', },
    { label: 'OverheadPercentage', value: 'OverheadPercentage', },
    { label: 'OverheadCCPercentage', value: 'OverheadCCPercentage', },
    { label: 'OverheadBOPPercentage', value: 'OverheadBOPPercentage', },
    { label: 'OverheadRMPercentage', value: 'OverheadRMPercentage', },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: "CustomerCode", value: "CustomerCode" },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const OverheadCBC_TempData = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'OverheadApplicability': 'RM',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '',
        'OverheadRMPercentage': '10',
        "PlantCode": '3456',
        "CustomerCode": 'C-10006',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (OverheadApplicability).',
        'ModelType': 'High volume',
        'OverheadApplicability': 'BOP',
        'OverheadPercentage': '',
        'OverheadCCPercentage': '',
        'OverheadBOPPercentage': '10',
        'OverheadRMPercentage': '',
        "PlantCode": '3456',
        "CustomerCode": 'C-10006',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }

]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const ZBCOperation = [

    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'OperationName', value: 'OperationName' },
    { label: 'Description', value: 'Description' },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" },
    { label: 'EffectiveDate', value: 'EffectiveDate' },
    { label: 'OperationType', value: 'OperationType' },
    { label: 'MaterialGasCRMHead/NiScrapCrmHead', value: 'MaterialGasCRMHead' },
    { label: 'MaterialGasRate/NiScrapRate', value: 'MaterialGasRate' },
    { label: 'MaterialGasConsumption/NiScrapRateConsumption', value: 'MaterialGasConsumption' },
    { label: 'MaterialWireCRMHead/NiRateCrmHead', value: 'MaterialWireCRMHead' },
    { label: 'MaterialWireRate/NiRate', value: 'MaterialWireRate' },
    { label: 'MaterialWireConsumption/NiRateConsumption', value: 'MaterialWireConsumption' },
    { label: 'PowerCRMHead', value: 'PowerCRMHead' },
    { label: 'PowerElectricityRate', value: 'PowerElectricityRate' },
    { label: 'PowerElectricityConsumption', value: 'PowerElectricityConsumption' },
    { label: 'LabourCRMHead', value: 'LabourCRMHead' },
    { label: 'LabourManPowerCost', value: 'LabourManPowerCost' },
    { label: 'LabourStaffCRMHead', value: 'LabourStaffCRMHead' },
    { label: 'LabourStaffCost', value: 'LabourStaffCost' },
    { label: 'ConsumableMaintenanceCRMHead', value: 'ConsumableMaintenanceCRMHead' },
    { label: 'ConsumableMaintenanceCost', value: 'ConsumableMaintenanceCost' },
    { label: 'ConsumableCRMHead/NiOfficeExpCrmHead', value: 'ConsumableCRMHead' },
    { label: 'ConsumableCost/NiOfficeExp', value: 'ConsumableCost' },
    { label: 'ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead', value: 'ConsumableWaterCRMHead' },
    { label: 'ConsumableWaterCost/AdditionalChemicalCost', value: 'ConsumableWaterCost' },
    { label: 'ConsumableJigStrippingCRMHead/CETPChargeCrmHead', value: 'ConsumableJigStrippingCRMHead' },
    { label: 'ConsumableJigStrippingCost/CETPCharge', value: 'ConsumableJigStrippingCost' },
    { label: 'ConsumableMachineCRMHead', value: 'ConsumableMachineCRMHead' },
    { label: 'MachineConsumptionCost', value: 'MachineConsumptionCost' },
    { label: 'ConsumableWelderCRMHead', value: 'ConsumableWelderCRMHead' },
    { label: 'WelderCost', value: 'WelderCost' },
    { label: 'InterestCRMHead', value: 'InterestCRMHead' },
    { label: 'InterestCost', value: 'InterestCost' },
    { label: 'DepriciationCRMHead', value: 'DepriciationCRMHead' },
    { label: 'DepriciationCost', value: 'DepriciationCost' },
    { label: 'OtherOperationCRMHead', value: 'OtherOperationCRMHead' },
    { label: 'OtherOperationCode', value: 'OtherOperationCode' },
    { label: 'OtherOperationCost', value: 'OtherOperationCost' },
    { label: 'StatuatoryAndLicenseCRMHead/FixedCostCrmHead', value: 'StatuatoryAndLicenseCRMHead' },
    { label: 'StatuatoryAndLicenseCost/FixedCost', value: 'StatuatoryAndLicenseCost' },
    { label: 'RejectionAndReworkCRMHead', value: 'RejectionAndReworkCRMHead' },
    { label: 'RejectionAndReworkPercentage', value: 'RejectionAndReworkPercentage' },
    { label: 'ProfitCRMHead', value: 'ProfitCRMHead' },
    { label: 'ProfitCRMPercentage', value: 'ProfitCRMPercentage' },
    { label: 'OtherCostCRMHead', value: 'OtherCostCRMHead' },
    { label: 'OtherCostDescription', value: 'OtherCostDescription' },
    { label: 'OtherCost', value: 'OtherCost' },
    { label: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit', value: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit' },
    { label: 'InterestAndDepriciationCRMHead', value: 'InterestAndDepriciationCRMHead' },
    { label: 'InterestAndDepriciationCost', value: 'InterestAndDepriciationCost' }
]
export const ZBCOperationSmallForm = [
    { label: "Note", value: "Note" },
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'OperationType', value: 'OperationType', },
    { label: 'OperationName', value: 'OperationName', }, //*
    { label: "OperationCode", value: "OperationCode" },
    { label: 'Description', value: 'Description', },
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'WeldingMaterialRate/kg', value: 'WeldingRate', },
    { label: 'Consumption', value: 'Consumption', },
    { label: 'Rate', value: 'Rate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //NOUI
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'Remark', value: 'Remark', },

]


export const ZBCOperationTempData = [
    {
        "Note": "When the 'OperationType' is Welding, the rate will be automatically calculated based on the values in the 'WeldingMaterialRate/kg' and 'Consumption' columns.",
        'Technology': 'Sheet Metal',
        'OperationType': 'Surface Treatment',
        'OperationName': 'Crushing',
        'OperationCode': '101',
        'Description': 'Description Text',
        'PlantCode': 'PLT-A',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'WeldingRate': 10,
        'Consumption': 20,
        'Rate': 50,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "SurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 5,
        'Remark': 'Remark Text',
        "DestinationPlantCode": "PLT-A",
        "LabourRatePerUOM": "0.5",
        "MaterialGasCRMHead": "Argon",
        "MaterialGasRate": "10",
        "MaterialGasConsumption": "5",
        "MaterialWireCRMHead": "Welding Wire",
        "MaterialWireRate": "2",
        "MaterialWireConsumption": "20",
        "PowerCRMHead": "Electricity",
        "PowerElectricityRate": "0.5",
        "PowerElectricityConsumption": "100",
        "LabourCRMHead": "Manpower",
        "LabourManPowerCost": "200",
        "LabourStaffCRMHead": "Supervisor",
        "LabourStaffCost": "100",
        "ConsumableMaintenanceCRMHead": "Maintenance",
        "ConsumableMaintenanceCost": "30",
        "ConsumableCRMHead": "Tools",
        "ConsumableCost": "50",
        "ConsumableWaterCRMHead": "Water",
        "ConsumableWaterCost": "20",
        "ConsumableJigStrippingCRMHead": "Jig Stripping",
        "ConsumableJigStrippingCost": "60",
        "ConsumableMachineCRMHead": "Machine",
        "MachineConsumptionCost": "80",
        "ConsumableWelderCRMHead": "Welder",
        "WelderCost": "150",
        "InterestCRMHead": "Interest",
        "InterestCost": "10",
        "DepriciationCRMHead": "Depreciation",
        "DepriciationCost": "30",
        "OtherOperationCRMHead": "Other Operations",
        "OtherOperationCode": "OTH",
        "OtherOperationCost": "50",
        "StatuatoryAndLicenseCRMHead": "License",
        "StatuatoryAndLicenseCost": "20",
        "RejectionAndReworkCRMHead": "Rework",
        "RejectionAndReworkPercentage": "2",
        "ProfitCRMHead": "Profit",
        "ProfitCRMPercentage": "10",
        "OtherCostCRMHead": "Other Costs",
        "OtherCost": "20",
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1500'

    },
    {
        "DestinationPlantCode": "PLT-A",
        'PlantCode': 'PLT-A',
        "OperationType": "Welding",
        "OperationName": "Assembly",
        'OperationCode': '101',
        "Description": "Final product assembly",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "LabourRate": "25.50",
        "SurfaceTreatmentOperation": "Yes or No",
        "WeldingRate": "10.00",
        "Consumption": "10.00",
        "Rate": "100.00",
        "LabourRatePerUOM": "2.00",
        'Technology': 'Plastic',
        "Remark": "Quality control passed",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "MaterialGasCRMHead": "Argon Gas",
        "MaterialGasRate": "2.50",
        "MaterialGasConsumption": "15",
        "MaterialWireCRMHead": "Welding Wire",
        "MaterialWireRate": "1.75",
        "MaterialWireConsumption": "10",
        "PowerCRMHead": "Electricity",
        "PowerElectricityRate": "0.15",
        "PowerElectricityConsumption": "200",
        "LabourCRMHead": "Labor",
        "LabourManPowerCost": "180.00",
        "LabourStaffCRMHead": "Supervisor",
        "LabourStaffCost": "150.00",
        "ConsumableMaintenanceCRMHead": "Cleaning Supplies",
        "ConsumableMaintenanceCost": "25.00",
        "ConsumableCRMHead": "Welding Supplies",
        "ConsumableCost": "50.00",
        "ConsumableWaterCRMHead": "Water",
        "ConsumableWaterCost": "10.00",
        "ConsumableJigStrippingCRMHead": "Jig Stripping Supplies",
        "ConsumableJigStrippingCost": "40.00",
        "ConsumableMachineCRMHead": "Machine Maintenance",
        "MachineConsumptionCost": "75.00",
        "ConsumableWelderCRMHead": "Welding Consumables",
        "WelderCost": "30.00",
        "InterestCRMHead": "Interest",
        "InterestCost": "10.00",
        "DepriciationCRMHead": "Depreciation",
        "DepriciationCost": "50.00",
        "OtherOperationCRMHead": "Other",
        "OtherOperationCode": "OTH-789",
        "OtherOperationCost": "75.00",
        "StatuatoryAndLicenseCRMHead": "Permits",
        "StatuatoryAndLicenseCost": "20.00",
        "RejectionAndReworkCRMHead": "Rework",
        "RejectionAndReworkPercentage": "5",
        "ProfitCRMHead": "Profit",
        "ProfitCRMPercentage": "10",
        "OtherCostCRMHead": "Miscellaneous",
        "OtherCost": "50.00",
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1600'
    },

    {
        "DestinationPlantCode": "PLT-A",
        'PlantCode': 'PLT-A',
        "OperationType": "Surface Treatment",
        "OperationName": "Molding",
        'OperationCode': '101',
        "Description": "Injection molding process",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "LabourRate": "40",
        "SurfaceTreatmentOperation": "Yes or No",
        "WeldingRate": "10",
        "Consumption": "10",
        "Rate": "150",
        "LabourRatePerUOM": "0.3",
        "Technology": "Rubber",
        "Remark": "Avoid moisture",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "MaterialGasCRMHead": "Nitrogen",
        "MaterialGasRate": "8",
        "MaterialGasConsumption": "10",
        "MaterialWireCRMHead": "Solder Wire",
        "MaterialWireRate": "4",
        "MaterialWireConsumption": "15",
        "PowerCRMHead": "Electricity",
        "PowerElectricityRate": "0.6",
        "PowerElectricityConsumption": "120",
        "LabourCRMHead": "Manpower",
        "LabourManPowerCost": "200",
        "LabourStaffCRMHead": "Engineer",
        "LabourStaffCost": "150",
        "ConsumableMaintenanceCRMHead": "Maintenance",
        "ConsumableMaintenanceCost": "40",
        "ConsumableCRMHead": "Blades",
        "ConsumableCost": "30",
        "ConsumableWaterCRMHead": "Water",
        "ConsumableWaterCost": "15",
        "ConsumableJigStrippingCRMHead": "Mold Release",
        "ConsumableJigStrippingCost": "45",
        "ConsumableMachineCRMHead": "Mold",
        "MachineConsumptionCost": "100",
        "ConsumableWelderCRMHead": "Soldering Gun",
        "WelderCost": "120",
        "InterestCRMHead": "Interest",
        "InterestCost": "15",
        "DepriciationCRMHead": "Depreciation",
        "DepriciationCost": "25",
        "OtherOperationCRMHead": "Other Operations",
        "OtherOperationCode": "OTH",
        "OtherOperationCost": "60",
        "StatuatoryAndLicenseCRMHead": "License",
        "StatuatoryAndLicenseCost": "25",
        "RejectionAndReworkCRMHead": "Rework",
        "RejectionAndReworkPercentage": "3",
        "ProfitCRMHead": "Profit",
        "ProfitCRMPercentage": "12",
        "OtherCostCRMHead": "Other Costs",
        "OtherCost": "35",
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1700'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCOperation = [

    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'OperationName', value: 'OperationName' },
    { label: "OperationCode", value: "OperationCode" },
    { label: 'Description', value: 'Description' },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: 'LabourRatePerUOM', value: 'LabourRatePerUOM' },
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" },
    { label: 'Remark', value: 'Remark' },
    { label: 'Plant', value: 'Plant' },
    { label: 'EffectiveDate', value: 'EffectiveDate' },
    { label: 'OperationType', value: 'OperationType' },
    { label: 'MaterialGasCRMHead/NiScrapCrmHead', value: 'MaterialGasCRMHead' },
    { label: 'MaterialGasRate/NiScrapRate', value: 'MaterialGasRate' },
    { label: 'MaterialGasConsumption/NiScrapRateConsumption', value: 'MaterialGasConsumption' },
    { label: 'MaterialWireCRMHead/NiRateCrmHead', value: 'MaterialWireCRMHead' },
    { label: 'MaterialWireRate/NiRate', value: 'MaterialWireRate' },
    { label: 'MaterialWireConsumption/NiRateConsumption', value: 'MaterialWireConsumption' },
    { label: 'PowerCRMHead', value: 'PowerCRMHead' },
    { label: 'PowerElectricityRate', value: 'PowerElectricityRate' },
    { label: 'PowerElectricityConsumption', value: 'PowerElectricityConsumption' },
    { label: 'LabourCRMHead', value: 'LabourCRMHead' },
    { label: 'LabourManPowerCost', value: 'LabourManPowerCost' },
    { label: 'LabourStaffCRMHead', value: 'LabourStaffCRMHead' },
    { label: 'LabourStaffCost', value: 'LabourStaffCost' },
    { label: 'ConsumableMaintenanceCRMHead', value: 'ConsumableMaintenanceCRMHead' },
    { label: 'ConsumableMaintenanceCost', value: 'ConsumableMaintenanceCost' },
    { label: 'ConsumableCRMHead/NiOfficeExpCrmHead', value: 'ConsumableCRMHead' },
    { label: 'ConsumableCost/NiOfficeExp', value: 'ConsumableCost' },
    { label: 'ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead', value: 'ConsumableWaterCRMHead' },
    { label: 'ConsumableWaterCost/AdditionalChemicalCost', value: 'ConsumableWaterCost' },
    { label: 'ConsumableJigStrippingCRMHead/CETPChargeCrmHead', value: 'ConsumableJigStrippingCRMHead' },
    { label: 'ConsumableJigStrippingCost/CETPCharge', value: 'ConsumableJigStrippingCost' },
    { label: 'ConsumableMachineCRMHead', value: 'ConsumableMachineCRMHead' },
    { label: 'MachineConsumptionCost', value: 'MachineConsumptionCost' },
    { label: 'ConsumableWelderCRMHead', value: 'ConsumableWelderCRMHead' },

    { label: 'WelderCost', value: 'WelderCost' },
    { label: 'InterestCRMHead', value: 'InterestCRMHead' },
    { label: 'InterestCost', value: 'InterestCost' },
    { label: 'DepriciationCRMHead', value: 'DepriciationCRMHead' },
    { label: 'DepriciationCost', value: 'DepriciationCost' },
    { label: 'OtherOperationCRMHead', value: 'OtherOperationCRMHead' },
    { label: 'OtherOperationCode', value: 'OtherOperationCode' },
    { label: 'OtherOperationCost', value: 'OtherOperationCost' },
    { label: 'StatuatoryAndLicenseCRMHead/FixedCostCrmHead', value: 'StatuatoryAndLicenseCRMHead' },
    { label: 'StatuatoryAndLicenseCost/FixedCost', value: 'StatuatoryAndLicenseCost' },
    { label: 'RejectionAndReworkCRMHead', value: 'RejectionAndReworkCRMHead' },
    { label: 'RejectionAndReworkPercentage', value: 'RejectionAndReworkPercentage' },
    { label: 'ProfitCRMHead', value: 'ProfitCRMHead' },
    { label: 'ProfitCRMPercentage', value: 'ProfitCRMPercentage' },
    { label: 'OtherCostCRMHead', value: 'OtherCostCRMHead' },
    { label: 'OtherCostDescription', value: 'OtherCostDescription' },
    { label: 'OtherCost', value: 'OtherCost' },
    { label: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit', value: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit' },
    { label: 'InterestAndDepriciationCRMHead', value: 'InterestAndDepriciationCRMHead' },
    { label: 'InterestAndDepriciationCost', value: 'InterestAndDepriciationCost' }

]
export const VBCOperationSmallForm = [
    { label: "Note", value: "Note" },
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'OperationType', value: 'OperationType', },
    { label: 'OperationName', value: 'OperationName', }, //*
    { label: "OperationCode", value: "OperationCode" },
    { label: 'Description', value: 'Description', },
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'WeldingMaterialRate/kg', value: 'WeldingRate', },
    { label: 'Consumption', value: 'Consumption', },
    { label: 'Rate', value: 'Rate', }, //
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'Remark', value: 'Remark', },

]

export const VBCOperationTempData = [
    {
        "Note": "When the 'OperationType' is Welding, the rate will be automatically calculated based on the values in the 'WeldingMaterialRate/kg' and 'Consumption' columns.",
        'Technology': 'Sheet Metal',
        'OperationType': 'Welding',
        'OperationName': 'Crushing',
        'OperationCode': '101',
        'Description': 'Description Text',
        'VendorCode': 'Vendor123',
        'DestinationPlantCode': "1032",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'WeldingRate': 10,
        'Consumption': 20,
        'Rate': 50,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "SurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 5,
        'Remark': 'Remark',
        "LabourRatePerUOM": 20,
        "Plant": 'Plant A',
        'Operation Type': 'Type A',
        "MaterialGasCRMHead": 'Material Gas',
        "MaterialGasRate": 5,
        "MaterialGasConsumption": 10,
        "MaterialWireCRMHead": 'Material Wire',
        "MaterialWireRate": 3,
        "MaterialWireConsumption": 15,
        "PowerCRMHead": 'Power',
        "PowerElectricityRate": 0.5,
        "PowerElectricityConsumption": 20,
        "LabourCRMHead": 'Labour',
        "LabourManPowerCost": 100,
        "LabourStaffCRMHead": 'Staff',
        "LabourStaffCost": 50,
        "ConsumableMaintenanceCRMHead": 'Maintenance',
        "ConsumableMaintenanceCost": 20,
        "ConsumableCRMHead": 'Consumable',
        "ConsumableCost": 30,
        "ConsumableWaterCRMHead": 'Water',
        "ConsumableWaterCost": 5,
        "ConsumableJigStrippingCRMHead": 'Jig Stripping',
        "ConsumableJigStrippingCost": 15,
        "ConsumableMachineCRMHead": 'Machine',
        "MachineConsumptionCost": 75,
        "ConsumableWelderCRMHead": 'Welder',
        "WelderCost": 50,
        "InterestCRMHead": 'Interest',
        "InterestCost": 25,
        "DepriciationCRMHead": 'Depreciation',
        "DepriciationCost": 20,
        "OtherOperationCRMHead": 'Other',
        "OtherOperationCode": 'O-002',
        "OtherOperationCost": 75,
        "StatuatoryAndLicenseCRMHead": 'Statutory and License',
        "StatuatoryAndLicenseCost": 35,
        "RejectionAndReworkCRMHead": 'Rejection and Rework',
        "RejectionAndReworkPercentage": 5,
        "ProfitCRMHead": 'Profit',
        "ProfitCRMPercentage": "20",
        "OtherCostCRMHead": "Maintenance",
        "OtherCostDescription": "Monthly maintenance cost for machinery",
        "OtherCost": '5000',
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1500',
    },
    {
        'Technology': 'Rubber',
        'OperationType': 'Surface Treatment',
        'OperationName': 'Drilling',
        'OperationCode': '102',
        'Description': 'Description Text',
        'VendorCode': 'Vendor456',
        'DestinationPlantCode': "1032",
        'UOM': 'Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram',
        'WeldingRate': 15,
        'Consumption': 25,
        'Rate': 30,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "SurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 6,
        'Remark': 'Remark',
        "LabourRatePerUOM": 24,
        "Plant": 'Plant B',
        'Operation Type': 'Type B',
        "MaterialGasCRMHead": 'Material Gas',
        "MaterialGasRate": 6,
        "MaterialGasConsumption": 8,
        "MaterialWireCRMHead": 'Material Wire',
        "MaterialWireRate": 4,
        "MaterialWireConsumption": 12,
        "PowerCRMHead": 'Power',
        "PowerElectricityRate": 0.6,
        "PowerElectricityConsumption": 25,
        "LabourCRMHead": 'Labour',
        "LabourManPowerCost": 96,
        "LabourStaffCRMHead": 'Staff',
        "LabourStaffCost": 60,
        "ConsumableMaintenanceCRMHead": 'Maintenance',
        "ConsumableMaintenanceCost": 15,
        "ConsumableCRMHead": 'Consumable',
        "ConsumableCost": 20,
        "ConsumableWaterCRMHead": 'Water',
        "ConsumableWaterCost": 8,
        "ConsumableJigStrippingCRMHead": 'Jig Stripping',
        "ConsumableJigStrippingCost": 10,
        "ConsumableMachineCRMHead": 'Machine',
        "MachineConsumptionCost": 70,
        "ConsumableWelderCRMHead": 'Welder',
        "WelderCost": 40,
        "InterestCRMHead": 'Interest',
        "InterestCost": 20,
        "DepriciationCRMHead": 'Depreciation',
        "DepriciationCost": 15,
        "OtherOperationCRMHead": 'Other',
        "OtherOperationCode": 'O-003',
        "OtherOperationCost": 65,
        "StatuatoryAndLicenseCRMHead": 'Statutory and License',
        "StatuatoryAndLicenseCost": 30,
        "RejectionAndReworkCRMHead": 'Rejection and Rework',
        "RejectionAndReworkPercentage": 2,
        "ProfitCRMHead": 'Profit',
        "ProfitCRMPercentage": "15",
        "OtherCostCRMHead": "Maintenance",
        "OtherCostDescription": "Yearly maintenance cost for machinery",
        "OtherCost": '10000',
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1200',
    },
    {
        'Technology': 'Plastic',
        'OperationType': 'Surface Treatment',
        'OperationName': 'Trimming',
        'OperationCode': '103',
        'Description': 'Description Text',
        'VendorCode': 'Vendor456',
        'DestinationPlantCode': '1032',
        'UOM': 'Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram',
        'WeldingRate': 20,
        'Consumption': 30,
        'Rate': 35,
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'SurfaceTreatmentOperation': "Yes or No",
        'LabourRate': 10,
        'Remark': 'Remark',
        'LabourRatePerUOM': 25,
        'Plant': 'Plant B',
        'Operation Type': 'Type B',
        'MaterialGasCRMHead': 'Material Gas',
        'MaterialGasRate': 2,
        'MaterialGasConsumption': 5,
        'MaterialWireCRMHead': 'Material Wire',
        'MaterialWireRate': 4,
        'MaterialWireConsumption': 20,
        'PowerCRMHead': 'Power',
        'PowerElectricityRate': 0.4,
        'PowerElectricityConsumption': 15,
        'LabourCRMHead': 'Labour',
        'LabourManPowerCost': 96,
        'LabourStaffCRMHead': 'Staff',
        'LabourStaffCost': 30,
        'ConsumableMaintenanceCRMHead': 'Maintenance',
        'ConsumableMaintenanceCost': 15,
        'ConsumableCRMHead': 'Consumable',
        'ConsumableCost': 25,
        'ConsumableWaterCRMHead': 'Water',
        'ConsumableWaterCost': 3,
        'ConsumableJigStrippingCRMHead': 'Jig Stripping',
        'ConsumableJigStrippingCost': 10,
        'ConsumableMachineCRMHead': 'Machine',
        'MachineConsumptionCost': 50,
        'ConsumableWelderCRMHead': 'Welder',
        'WelderCost': 20,
        'InterestCRMHead': 'Interest',
        'InterestCost': 10,
        'DepriciationCRMHead': 'Depreciation',
        'DepriciationCost': 15,
        'OtherOperationCRMHead': 'Other',
        'OtherOperationCode': 'O-001',
        'OtherOperationCost': 45,
        'StatuatoryAndLicenseCRMHead': 'Statutory and License',
        'StatuatoryAndLicenseCost': 20,
        'RejectionAndReworkCRMHead': 'Rejection and Rework',
        'RejectionAndReworkPercentage': 2,
        'ProfitCRMHead': 'Profit',
        'ProfitCRMPercentage': '15',
        'OtherCostCRMHead': 'Maintenance',
        'OtherCostDescription': 'Monthly maintenance cost for machinery',
        'OtherCost': '3500',
        'IsIncludeInterestRateAndDepriciationInRejectionAndProfit': "Yes or No",
        'InterestAndDepriciationCRMHead': 'Interest',
        "InterestAndDepriciationCost": '1200',
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const CBCOperation = [

    { label: 'CustomerCode', value: 'CustomerCode', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'OperationName', value: 'OperationName' },
    { label: "OperationCode", value: "OperationCode" },
    { label: 'Description', value: 'Description' },
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: 'LabourRatePerUOM', value: 'LabourRatePerUOM' },
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" },
    { label: 'Remark', value: 'Remark' },
    { label: 'Plant', value: 'Plant' },
    { label: 'EffectiveDate', value: 'EffectiveDate' },
    { label: 'OperationType', value: 'OperationType' },
    { label: 'MaterialGasCRMHead/NiScrapCrmHead', value: 'MaterialGasCRMHead' },
    { label: 'MaterialGasRate/NiScrapRate', value: 'MaterialGasRate' },
    { label: 'MaterialGasConsumption/NiScrapRateConsumption', value: 'MaterialGasConsumption' },
    { label: 'MaterialWireCRMHead/NiRateCrmHead', value: 'MaterialWireCRMHead' },
    { label: 'MaterialWireRate/NiRate', value: 'MaterialWireRate' },
    { label: 'MaterialWireConsumption/NiRateConsumption', value: 'MaterialWireConsumption' },
    { label: 'PowerCRMHead', value: 'PowerCRMHead' },
    { label: 'PowerElectricityRate', value: 'PowerElectricityRate' },
    { label: 'PowerElectricityConsumption', value: 'PowerElectricityConsumption' },
    { label: 'LabourCRMHead', value: 'LabourCRMHead' },
    { label: 'LabourManPowerCost', value: 'LabourManPowerCost' },
    { label: 'LabourStaffCRMHead', value: 'LabourStaffCRMHead' },
    { label: 'LabourStaffCost', value: 'LabourStaffCost' },
    { label: 'ConsumableMaintenanceCRMHead', value: 'ConsumableMaintenanceCRMHead' },
    { label: 'ConsumableMaintenanceCost', value: 'ConsumableMaintenanceCost' },
    { label: 'ConsumableCRMHead/NiOfficeExpCrmHead', value: 'ConsumableCRMHead' },
    { label: 'ConsumableCost/NiOfficeExp', value: 'ConsumableCost' },
    { label: 'ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead', value: 'ConsumableWaterCRMHead' },
    { label: 'ConsumableWaterCost/AdditionalChemicalCost', value: 'ConsumableWaterCost' },
    { label: 'ConsumableJigStrippingCRMHead/CETPChargeCrmHead', value: 'ConsumableJigStrippingCRMHead' },
    { label: 'ConsumableJigStrippingCost/CETPCharge', value: 'ConsumableJigStrippingCost' },
    { label: 'ConsumableMachineCRMHead', value: 'ConsumableMachineCRMHead' },
    { label: 'MachineConsumptionCost', value: 'MachineConsumptionCost' },
    { label: 'ConsumableWelderCRMHead', value: 'ConsumableWelderCRMHead' },
    { label: 'WelderCost', value: 'WelderCost' },
    { label: 'InterestCRMHead', value: 'InterestCRMHead' },
    { label: 'InterestCost', value: 'InterestCost' },
    { label: 'DepriciationCRMHead', value: 'DepriciationCRMHead' },
    { label: 'DepriciationCost', value: 'DepriciationCost' },
    { label: 'OtherOperationCRMHead', value: 'OtherOperationCRMHead' },
    { label: 'OtherOperationCode', value: 'OtherOperationCode' },
    { label: 'OtherOperationCost', value: 'OtherOperationCost' },
    { label: 'StatuatoryAndLicenseCRMHead/FixedCostCrmHead', value: 'StatuatoryAndLicenseCRMHead' },
    { label: 'StatuatoryAndLicenseCost/FixedCost', value: 'StatuatoryAndLicenseCost' },
    { label: 'RejectionAndReworkCRMHead', value: 'RejectionAndReworkCRMHead' },
    { label: 'RejectionAndReworkPercentage', value: 'RejectionAndReworkPercentage' },
    { label: 'ProfitCRMHead', value: 'ProfitCRMHead' },
    { label: 'ProfitCRMPercentage', value: 'ProfitCRMPercentage' },
    { label: 'OtherCostCRMHead', value: 'OtherCostCRMHead' },
    { label: 'OtherCostDescription', value: 'OtherCostDescription' },
    { label: 'OtherCost', value: 'OtherCost' },
    { label: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit', value: 'IsIncludeInterestRateAndDepriciationInRejectionAndProfit' },
    { label: 'InterestAndDepriciationCRMHead', value: 'InterestAndDepriciationCRMHead' },
    { label: 'InterestAndDepriciationCost', value: 'InterestAndDepriciationCost' }

]
export const CBCOperationSmallForm = [
    { label: "Note", value: "Note" }, //*
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'OperationType', value: 'OperationType', },
    { label: 'OperationName', value: 'OperationName', }, //*
    { label: "OperationCode", value: "OperationCode" },
    { label: 'Description', value: 'Description', },
    { label: 'CustomerCode', value: 'CustomerCode', }, //*
    { label: 'DestinationPlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'WeldingMaterialRate/kg', value: 'WeldingRate', },
    { label: 'Consumption', value: 'Consumption', },
    { label: 'Rate', value: 'Rate', }, //
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
    { label: 'SurfaceTreatmentOperation', value: 'SurfaceTreatmentOperation' },
    { label: 'LabourRate', value: 'LabourRate', }, //NOUI
    { label: 'Remark', value: 'Remark', },
]

export const CBCOperationTempData = [

    {
        "Note": "When the 'OperationType' is Welding, the rate will be automatically calculated based on the values in the 'WeldingMaterialRate/kg' and 'Consumption' columns.",
        'Technology': 'Sheet Metal',
        'OperationType': 'Welding',
        'OperationName': 'Crushing',
        "OperationCode": "10001",
        'Description': 'Description Text',
        "CustomerCode": "C-10008",
        'DestinationPlantCode': "1032",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "WeldingRate": 10,
        "Consumption": 1000,
        'Rate': 50,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "SurfaceTreatmentOperation": "Yes or No",
        'LabourRate': 5,
        'Remark': 'Remark',
        "LabourRatePerUOM": "5",
        "Plant": "Plant A",
        "Operation Type": "Manufacturing",
        "MaterialGasCRMHead": "Gas Material",
        "MaterialGasRate": "2",
        "MaterialGasConsumption": "10",
        "MaterialWireCRMHead": "Wire Material",
        "MaterialWireRate": "1",
        "MaterialWireConsumption": "20",
        "PowerCRMHead": "Power",
        "PowerElectricityRate": "0.15",
        "PowerElectricityConsumption": "5",
        "LabourCRMHead": "Labour",
        "LabourManPowerCost": "40",
        "LabourStaffCRMHead": "Staff",
        "LabourStaffCost": "25",
        "ConsumableMaintenanceCRMHead": "Maintenance",
        "ConsumableMaintenanceCost": "10",
        "ConsumableCRMHead": "Consumables",
        "ConsumableCost": "15",
        "ConsumableWaterCRMHead": "Water",
        "ConsumableWaterCost": "5",
        "ConsumableJigStrippingCRMHead": "Jig Stripping",
        "ConsumableJigStrippingCost": "8",
        "ConsumableMachineCRMHead": "Machine",
        "MachineConsumptionCost": "12",
        "ConsumableWelderCRMHead": "Welder",
        "WelderCost": "7",
        "InterestCRMHead": "Interest",
        "InterestCost": "50",
        "DepriciationCRMHead": "Depreciation",
        "DepriciationCost": "30",
        "OtherOperationCRMHead": "Other Operation",
        "OtherOperationCode": "OTH001",
        "OtherOperationCost": "20",
        "StatuatoryAndLicenseCRMHead": "Statutory and License",
        "StatuatoryAndLicenseCost": "5",
        "RejectionAndReworkCRMHead": "Rejection and Rework",
        "RejectionAndReworkPercentage": "5",
        "ProfitCRMHead": "Profit",
        "ProfitCRMPercentage": "20",
        "OtherCostCRMHead": "Maintenance",
        "OtherCostDescription": "Monthly maintenance cost for machinery",
        "OtherCost": '5000',
        "IsIncludeInterestRateAndDepriciationInRejectionAndProfit": "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1500',
    },


    {
        'Technology': 'Plastic',
        'OperationType': 'Welding',
        'OperationName': 'Molding',
        'OperationCode': '10002',
        'Description': 'Description Text 2',
        'CustomerCode': 'C-10009',
        'DestinationPlantCode': '1032',
        'UOM': 'Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram',
        'WeldingMaterialRate/kg': 15,
        'Consumption': 2000,
        'Rate': 70,
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'SurfaceTreatmentOperation': "Yes or No",
        'LabourRate': 7,
        'Remark': 'Remark 2',
        'LabourRatePerUOM': '8',
        'Plant': 'Plant B',
        'Operation Type': 'Assembly',
        'MaterialGasCRMHead': 'Gas Material',
        'MaterialGasRate': '3',
        'MaterialGasConsumption': '15',
        'MaterialWireCRMHead': 'Wire Material',
        'MaterialWireRate': '2',
        'MaterialWireConsumption': '25',
        'PowerCRMHead': 'Power',
        'PowerElectricityRate': '0.20',
        'PowerElectricityConsumption': '7',
        'LabourCRMHead': 'Labour',
        'LabourManPowerCost': '75',
        'LabourStaffCRMHead': 'Staff',
        'LabourStaffCost': '30',
        'ConsumableMaintenanceCRMHead': 'Maintenance',
        'ConsumableMaintenanceCost': '20',
        'ConsumableCRMHead': 'Consumables',
        'ConsumableCost': '10',
        'ConsumableWaterCRMHead': 'Water',
        'ConsumableWaterCost': '10',
        'ConsumableJigStrippingCRMHead': 'Jig Stripping',
        'ConsumableJigStrippingCost': '12',
        'ConsumableMachineCRMHead': 'Machine',
        'MachineConsumptionCost': '20',
        'ConsumableWelderCRMHead': 'Welder',
        'WelderCost': '15',
        'InterestCRMHead': 'Interest',
        'InterestCost': '75',
        'DepriciationCRMHead': 'Depreciation',
        'DepriciationCost': '40',
        'OtherOperationCRMHead': 'Other Operation',
        'OtherOperationCode': 'OTH002',
        'OtherOperationCost': '25',
        'StatuatoryAndLicenseCRMHead': 'Statutory and License',
        'StatuatoryAndLicenseCost': '10',
        'RejectionAndReworkCRMHead': 'Rejection and Rework',
        'RejectionAndReworkPercentage': '8',
        'ProfitCRMHead': 'Profit',
        'ProfitCRMPercentage': '15',
        'OtherCostCRMHead': 'Maintenance',
        'OtherCostDescription': 'Quarterly maintenance cost for machinery',
        'OtherCost': '3000',
        'IsIncludeInterestRateAndDepriciationInRejectionAndProfit': "Yes or No",
        "InterestAndDepriciationCRMHead": "Depreciation",
        "InterestAndDepriciationCost": '1500',
    }, {
        'Technology': 'Rubber',
        'OperationType': 'SurfaceTreatment',
        'OperationName': 'Sintering',
        'OperationCode': '10003',
        'Description': 'Description Text 3',
        'CustomerCode': 'C-10010',
        'DestinationPlantCode': '1032',
        'UOM': 'Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram',
        'WeldingRate': 20,
        'Consumption': 3000,
        'Rate': 90,
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'SurfaceTreatmentOperation': "Yes or No",
        'LabourRate': 8,
        'Remark': 'Remark 3',
        'LabourRatePerUOM': '9',
        'Plant': 'Plant C',
        'Operation Type': 'Machining',
        'MaterialGasCRMHead': 'Gas Material',
        'MaterialGasRate': '4',
        'MaterialGasConsumption': '20',
        'MaterialWireCRMHead': 'Wire Material',
        'MaterialWireRate': '3',
        'MaterialWireConsumption': '30',
        'PowerCRMHead': 'Power',
        'PowerElectricityRate': '0.25',
        'PowerElectricityConsumption': '10',
        'LabourCRMHead': 'Labour',
        'LabourManPowerCost': '120',
        'LabourStaffCRMHead': 'Staff',
        'LabourStaffCost': '40',
        'ConsumableMaintenanceCRMHead': 'Maintenance',
        'ConsumableMaintenanceCost': '30',
        'ConsumableCRMHead': 'Consumables',
        'ConsumableCost': '15',
        'ConsumableWaterCRMHead': 'Water',
        'ConsumableWaterCost': '15',
        'ConsumableJigStrippingCRMHead': 'Jig Stripping',
        'ConsumableJigStrippingCost': '18',
        'ConsumableMachineCRMHead': 'Machine',
        'MachineConsumptionCost': '30',
        'ConsumableWelderCRMHead': 'Welder',
        'WelderCost': '20',
        'InterestCRMHead': 'Interest',
        'InterestCost': '100',
        'DepriciationCRMHead': 'Depreciation',
        'DepriciationCost': '50',
        'OtherOperationCRMHead': 'Other Operation',
        'OtherOperationCode': 'OTH003',
        'OtherOperationCost': '30',
        'StatuatoryAndLicenseCRMHead': 'Statutory and License',
        'StatuatoryAndLicenseCost': '15',
        'RejectionAndReworkCRMHead': 'Rejection and Rework',
        'RejectionAndReworkPercentage': '6',
        'ProfitCRMHead': 'Profit',
        'ProfitCRMPercentage': '18',
        'OtherCostCRMHead': 'Transportation',
        'OtherCostDescription': 'Transportation cost for raw materials',
        'OtherCost': '4000',
        'IsIncludeInterestRateAndDepriciationInRejectionAndProfit': "Yes or No",
        "InterestAndDepriciationCRMHead": "Interest",
        "InterestAndDepriciationCost": '1900',
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Profit = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'ProfitApplicability', value: 'ProfitApplicability', },
    { label: 'ProfitPercentage', value: 'ProfitPercentage', },
    { label: 'ProfitCCPercentage', value: 'ProfitCCPercentage', },
    { label: 'ProfitBOPPercentage', value: 'ProfitBOPPercentage', },
    { label: 'ProfitRMPercentage', value: 'ProfitRMPercentage', },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const ProfitTempData = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'ProfitApplicability': 'RM',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '',
        'ProfitRMPercentage': '10',
        "PlantCode": '3456',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (ProfitApplicability).',
        'ModelType': 'High volume',
        'ProfitApplicability': 'BOP',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '10',
        'ProfitRMPercentage': '',
        "PlantCode": '3456',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]

export const ProfitVBC = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'ProfitApplicability', value: 'ProfitApplicability', },
    { label: 'ProfitPercentage', value: 'ProfitPercentage', },
    { label: 'ProfitCCPercentage', value: 'ProfitCCPercentage', },
    { label: 'ProfitBOPPercentage', value: 'ProfitBOPPercentage', },
    { label: 'ProfitRMPercentage', value: 'ProfitRMPercentage', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', }
]

export const ProfitTempDataVBC = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'ProfitApplicability': 'RM',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '',
        'ProfitRMPercentage': '10',
        'VendorCode': '1313',
        "PlantCode": '3456',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (ProfitApplicability).',
        'ModelType': 'High volume',
        'ProfitApplicability': 'BOP',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '10',
        'ProfitRMPercentage': '',
        'VendorCode': '1313',
        "PlantCode": '3456',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]
export const ProfitCBC = [
    { label: 'Note', value: 'Note', },
    { label: 'ModelType', value: 'ModelType', },
    { label: 'ProfitApplicability', value: 'ProfitApplicability', },
    { label: 'ProfitPercentage', value: 'ProfitPercentage', },
    { label: 'ProfitCCPercentage', value: 'ProfitCCPercentage', },
    { label: 'ProfitBOPPercentage', value: 'ProfitBOPPercentage', },
    { label: 'ProfitRMPercentage', value: 'ProfitRMPercentage', },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'CustomerCode', value: 'CustomerCode' },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', }
]

export const ProfitTempDataCBC = [
    {
        'Note': 'If Applicability is single input percentage in relevant applicability field.',
        'ModelType': 'High volume',
        'ProfitApplicability': 'RM',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '',
        'ProfitRMPercentage': '10',
        "PlantCode": '3456',
        "CustomerCode": 'C-10006',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'Note': 'If Applicability is combined either input percentage in relevant applicability fields Or in combine percentage field (ProfitApplicability).',
        'ModelType': 'High volume',
        'ProfitApplicability': 'BOP',
        'ProfitPercentage': '',
        'ProfitCCPercentage': '',
        'ProfitBOPPercentage': '10',
        'ProfitRMPercentage': '',
        "PlantCode": '3456',
        "CustomerCode": 'C-10006',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Labour = [

    { label: 'CustomerCode', value: 'CustomerCode', }, //*
    { label: 'EmploymentTerms', value: 'EmploymentTerms', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'State', value: 'State', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'MachineType', value: 'MachineType', }, //*
    { label: 'LabourType', value: 'LabourType', }, //*
    { label: 'RatePerPersonPerAnnum', value: 'RatePerPersonPerAnnum', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'ProductNumber', value: 'ProductNumber', },
]
export const LabourTempData = [
    {
        "CustomerCode": 'C-10008',
        'EmploymentTerms': 'Contractual',
        'VendorCode': 'VC123',
        'State': 'Madhya Pradesh',
        'PlantCode': 'Plant01',
        'MachineType': 'Grinder',
        'LabourType': 'Skilled',
        'RatePerPersonPerAnnum': 2000000,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "ProductNumber": 'Silencer'
    },
    {
        "CustomerCode": 'C-10008',
        'EmploymentTerms': 'Employed',
        'VendorCode': 'VC124',
        'State': 'Madhya Pradesh',
        'PlantCode': 'Plant02',
        'MachineType': 'Grinder',
        'LabourType': 'Semi-Skilled',
        'RatePerPersonPerAnnum': 300000,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "ProductNumber": 'Silencer'
    }
]
export const Volume = [
    { label: 'ActualVolumeDetailId', value: 'ActualVolumeDetailId', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'PlantCode', value: 'PlantCode', },
    { label: 'VendorCode', value: 'VendorCode', },
    { label: 'ActualVolumeDate', value: 'ActualVolumeDate', },
    { label: 'ActualQuantity', value: 'ActualQuantity', },
]
export const VolumeTempData = [
    {
        'ActualVolumeDetailId': '1',
        'PartNumber': 'DH103776',
        'RevisionNumber': '1',
        'PlantCode': '911',
        'VendorCode': '1517',
        'ActualVolumeDate': '16-12-2022',
        'ActualQuantity': '15',
    },
    {
        'ActualVolumeDetailId': '2',
        'PartNumber': 'Component-TEST-M-07',
        'RevisionNumber': '0',
        'PlantCode': '1569',
        'VendorCode': '1569',
        'ActualVolumeDate': '14-12-2022',
        'ActualQuantity': '100',
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Fuel = [
    { label: 'FuelName', value: 'FuelName', },
    { label: 'UOM', value: 'UOM', },
    { label: 'State', value: 'State', },
    { label: 'FuelRate', value: 'FuelRate', },
    { label: 'PlantCode', value: 'PlantCode', },
    { label: 'Country', value: 'Country', },
    { label: 'City', value: 'City', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
]

export const FuelTempData = [
    {
        'FuelName': 'Petrol',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram/Liter",
        'State': 'Madhya Pradesh',
        'FuelRate': '100',
        'PlantCode': '1001',
        'Country': 'India',
        'City': 'Indore',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
    }, {
        'FuelName': 'Petrol',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram/Liter",
        'State': 'Maharashtra',
        'FuelRate': '108',
        'PlantCode': '1001',
        'Country': 'India',
        'City': 'Mumbai',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
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
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', },
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_ZBC_DOMESTIC_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': 'Plant101',
        'VendorCode': 'Sys01',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': 'Plant101',
        'VendorCode': 'Sys01',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': 'Plant101',
        'VendorCode': 'Sys01',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_DOMESTIC = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'ClientApprovedVendor', value: 'IsClientVendorBOP', },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'Source', value: 'Source', },
    { label: 'SourceLocation', value: 'SourceLocation', },
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', },
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_VBC_DOMESTIC_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': "1032",
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': "1032",
        "IsClientVendorBOP": "NO",
        'VendorCode': 'Sys01',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': "1032",
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

export const BOP_DETAILED_DOMESTIC = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'IsBreakupBoughtOutPart', value: 'IsBreakupBoughtOutPart', }, //NOUI
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" }, //NOUI
    { label: 'Source', value: 'Source', },
    { label: 'SourceLocation', value: 'SourceLocation', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_DETAILED_DOMESTIC_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': "1032",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': "1032",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': "1032",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'VendorPlant': 'VPlant',
        'Source': 'VPlant01',
        'VendorSourceName': 'TATA Steel',
        'SourceLocation': 'Jamshedpur',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_ZBC_IMPORT = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', },
    { label: 'IncoTerm', value: 'IncoTerm', },
    { label: 'PaymentTerm', value: 'PaymentTerm', }, // FOR MINDA ONLY
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' },
]

export const BOP_ZBC_IMPORT_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': 'Plant101',
        'VendorName': 'Systematix',
        'VendorCode': 'VC1',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': 'Plant101',
        'VendorName': 'Systematix',
        'VendorCode': 'VC1',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': 'Plant101',
        'VendorName': 'Systematix',
        'VendorCode': 'VC1',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        'EffectiveDate': DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]
export const BOP_CBC_DOMESTIC = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', }, //*
    { label: 'CustomerCode', value: 'CustomerCode', }, //NOUI
    { label: 'ClientApprovedVendor', value: 'IsClientVendorBOP', },
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', },
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_CBC_DOMESTIC_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': "1032",
        "CustomerCode": "C-10008",
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "IsClientVendorBOP": "YES",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': "1032",
        "CustomerCode": "C-10008",
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "IsClientVendorBOP": "YES",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': "1032",
        "CustomerCode": "C-10008",
        'NumberOfPieces': '1',
        'BasicRate': '100',
        "IsClientVendorBOP": "YES",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_DETAILED_IMPORT = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: 'IsBreakupBoughtOutPart', value: 'IsBreakupBoughtOutPart', }, //NOUI
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" }, //NOUI
    // { label: 'VendorPlant', value: 'VendorPlant' },
    // { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'IncoTerm', value: 'IncoTerm', },
    { label: 'PaymentTerm', value: 'PaymentTerm', },
    // { label: 'MinimumOrderQuantity', value: 'MinimumOrderQuantity', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_DETAILED_IMPORT_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "NO",
        'VendorCode': 'Sys01',
        'IsBreakupBoughtOutPart': 'Yes',
        'TechnologyName': 'Sheet Metal',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const BOP_VBC_IMPORT = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', },
    { label: 'ClientApprovedVendor', value: 'IsClientVendorBOP', },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    // { label: 'VendorPlant', value: 'VendorPlant' },
    // { label: 'VendorPlantCode', value: 'VendorPlantCode', }, //NOUI
    { label: 'SourceVendorName', value: 'SourceVendorName', },
    { label: 'SourceVendorLocation', value: 'SourceVendorLocation', },
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', }, //*
    { label: 'IncoTerm', value: 'IncoTerm', },
    { label: 'PaymentTerm', value: 'PaymentTerm', },    // FOR MINDA ONLY
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_VBC_IMPORT_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "YES",
        'VendorCode': 'Sys01',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': '1032',
        "IsClientVendorBOP": "NO",
        'VendorCode': 'Sys01',
        'SourceVendorName': 'TATA Steel',
        'SourceVendorLocation': 'Jamshedpur',
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]
export const BOP_CBC_IMPORT = [
    { label: 'BoughtOutPartNumber', value: 'BoughtOutPartNumber', }, //*
    { label: 'BoughtOutPartName', value: 'BoughtOutPartName', }, //*
    { label: 'CategoryName', value: 'CategoryName', }, //*
    { label: 'Specification', value: 'Specification', },
    { label: "SAPCode", value: "SAPPartNumber", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: 'PlantCode', value: 'DestinationPlantCode', },
    { label: 'CustomerCode', value: 'CustomerCode', }, //NOUI
    { label: 'MinimumOrderQuantity', value: 'NumberOfPieces', }, //*
    { label: 'Currency', value: 'Currency', }, //*
    { label: 'IncoTerm', value: 'IncoTerm', },
    { label: 'PaymentTerm', value: 'PaymentTerm', },  // FOR MINDA ONLY
    { label: 'ClientApprovedVendor', value: 'IsClientVendorBOP', },
    { label: 'BasicRate', value: 'BasicRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark' }
]

export const BOP_CBC_IMPORT_TempData = [
    {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'DestinationPlantCode': '1032',
        "CustomerCode": "C-10008",
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "IsClientVendorBOP": "NO",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'DestinationPlantCode': '1032',
        "CustomerCode": "C-10008",
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "IsClientVendorBOP": "NO",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }, {
        'BoughtOutPartNumber': 'Part123',
        'BoughtOutPartName': 'Screw',
        'CategoryName': 'Machine',
        'Specification': '20 mm',
        'SAPPartNumber': 'SAP 01',
        "UnitOfMeasurement": "shot/stroke/Number",
        'DestinationPlantCode': '1032',
        "CustomerCode": "C-10008",
        'Currency': 'INR or USD',
        'NumberOfPieces': '1',
        'IncoTerm': 'CFR',
        'PaymentTerm': 'A000',
        'BasicRate': '100',
        "IsClientVendorBOP": "NO",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text'
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_ZBC = [
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI,*
    { label: 'ActualQuantity', value: 'ActualQuantity', }, //*
]

export const VOLUME_ACTUAL_ZBC_TEMPDATA = [
    {
        'PlantCode': 'P1',
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw01',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'ActualQuantity': 100,
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_VBC = [
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI ,*
    { label: 'ActualQuantity', value: 'ActualQuantity', }, //*
]

export const VOLUME_ACTUAL_VBC_TEMPDATA = [
    {
        'VendorCode': 'Tata01',
        'PlantCode': 1032,
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw Jack',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'ActualQuantity': 50,
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_ACTUAL_CBC = [
    { label: 'CustomerCode', value: 'CustomerCode', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI ,*
    { label: 'ActualQuantity', value: 'ActualQuantity', }, //*
]

export const VOLUME_ACTUAL_CBC_TEMPDATA = [
    {
        'CustomerCode': 'C-10008',
        'PlantCode': 1032,
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw Jack',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'ActualQuantity': 50,
    }
]
/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_ZBC = [
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', }, //*
    { label: 'BudgetedPrice', value: 'BudgetedPrice', }, //*
]

export const VOLUME_BUDGETED_ZBC_TEMPDATA = [
    {
        'PlantCode': 'Systematix01',
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw01',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'BudgetedQuantity': 10,
        'BudgetedPrice': 200,
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VOLUME_BUDGETED_VBC = [
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', }, //*
    { label: 'BudgetedPrice', value: 'BudgetedPrice', }, //*
]

export const VOLUME_BUDGETED_VBC_TEMPDATA = [
    {
        'VendorCode': 'Tata01',
        'PlantCode': "1032",
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw01',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'BudgetedQuantity': 25,
        'BudgetedPrice': 200,
    }
]
export const VOLUME_BUDGETED_CBC = [
    { label: 'CustomerCode', value: 'CustomerCode', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'Month', value: 'Month', }, //NOUI
    { label: 'BudgetedQuantity', value: 'BudgetedQuantity', }, //*
    { label: 'BudgetedPrice', value: 'BudgetedPrice', }, //*
]

export const VOLUME_BUDGETED_CBC_TEMPDATA = [
    {
        'CustomerCode': 'C-10008',
        'PlantCode': "1032",
        'PartType': 'Component/Assembly/BoughtOutPart',
        'PartNumber': 'Screw01',
        'RevisionNumber': '1',
        'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
        'Month': DayTime().format('MMMM'),
        'BudgetedQuantity': 25,
        'BudgetedPrice': 200,
    }
]


//DYNAMIC BUDGET MASTER BULKUPLOAD COSTING HEADS
let budgetCostingHeads = reactLocalStorage.getObject('budgetCostingHeads')

export const BUDGET_ZBC = [
    { label: 'PartCostingHead', value: 'PartCostingHead', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //
    { label: 'Delta', value: 'Delta', }, //
]

let BUDGET_ZBC_DATA = []

Array.isArray(budgetCostingHeads) && budgetCostingHeads.map((item, index) => {
    BUDGET_ZBC_DATA.push(

        {
            'PartCostingHead': `${item.Text}`,
            'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
            'PartType': 'Component/Assembly/BoughtOutPart',
            'PartNumber': 'Screw01',
            'RevisionNumber': '1',
            'PlantCode': '1032',
            'EffectiveDate': DayTime().format('DD-MM-YYYY'),
            'Delta': Number(25) + Number(index),
        }
    )

})

export const BUDGET_ZBC_TEMPDATA = BUDGET_ZBC_DATA

export const BUDGET_VBC = [

    { label: 'PartCostingHead', value: 'PartCostingHead', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'VendorCode', value: 'VendorCode', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //
    { label: 'Delta', value: 'Delta', }, //NOUI

]

let BUDGET_VBC_DATA = []

Array.isArray(budgetCostingHeads) && budgetCostingHeads.map((item, index) => {
    BUDGET_VBC_DATA.push(
        {
            'PartCostingHead': `${item.Text}`,
            'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
            'PartType': 'Component/Assembly/BoughtOutPart',
            'PartNumber': 'Screw01',
            'RevisionNumber': '1',
            'VendorCode': "Tata01",
            'PlantCode': '1032',
            'EffectiveDate': DayTime().format('DD-MM-YYYY'),
            'Delta': Number(25) + Number(index),
        }
    )
})

export const BUDGET_VBC_TEMPDATA = BUDGET_VBC_DATA

export const BUDGET_CBC = [

    { label: 'PartCostingHead', value: 'PartCostingHead', },
    { label: 'Year', value: 'Year', }, //*
    { label: 'PartType', value: 'PartType', }, //*
    { label: 'PartNumber', value: 'PartNumber', }, //*
    { label: 'RevisionNumber', value: 'RevisionNumber', }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'CustomerCode', value: 'CustomerCode', },//NOUI
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //
    { label: 'Delta', value: 'Delta', }, //NOUI

]

export const BUDGET_CBC_DATA = []

Array.isArray(budgetCostingHeads) && budgetCostingHeads.map((item, index) => {
    BUDGET_CBC_DATA.push(
        {
            'PartCostingHead': `${item.Text}`,
            'Year': `${DayTime().$y}-${DayTime().$y + 1}`,
            'PartType': 'Component/Assembly/BoughtOutPart',
            'PartNumber': 'Screw01',
            'RevisionNumber': '1',
            'PlantCode': '1032',
            'CustomerCode': 'C-10008',
            'EffectiveDate': DayTime().format('DD-MM-YYYY'),
            'Delta': Number(25) + Number(index),
        }
    )
})

export const BUDGET_CBC_TEMPDATA = BUDGET_CBC_DATA

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const Bought_Out_Parts = [
    { label: 'BasicRate', value: 'BasicRate', },
    { label: 'Quantity', value: 'Quantity', },
    { label: 'NetLandedCost', value: 'NetLandedCost', },
    { label: 'PartNumber', value: 'PartNumber', },
    { label: 'TechnologyLabel', value: 'TechnologyName', defaultValue: "Technology" },
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
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" },
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
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'PlantCode', value: 'PlantCode', }, //*
    { label: 'MachineNo', value: 'MachineNo', }, //*
    { label: 'MachineSpecification', value: 'MachineSpecification', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapacityAndTonnage', value: 'MachineCapacityAndTonnage', },
    { label: 'ProcessName', value: 'ProcessName', }, //*
    { label: 'ProcessCode', value: 'ProcessCode', }, //*
    { label: 'UOM', value: 'UOM', }, //*
    { label: 'MachineRate', value: 'MachineRate', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
    { label: 'Remark', value: 'Remark', },
]

export const MachineZBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'PlantCode': '8820',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'MachineRate': 55,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'PlantCode': '8820',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'MachineRate': 55,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'PlantCode': '8820',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "shot/stroke/Number",
        'MachineRate': 55,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'PlantCode': '8820',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Square Millimeter/Square Inch/Square Feet/Square Centimeter/Square Meter',
        'MachineRate': 55,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'PlantCode': '8820',
        'MachineNo': 'SM1002',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Seconds/Minutes/Hours/MilliSeconds',
        'MachineRate': 55,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBC = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" }, //*
    { label: "PlantCode", value: "PlantCode", }, //*
    { label: "VendorCode", value: "VendorCode", },
    { label: "CustomerCode", value: "CustomerCode", },
    { label: "MachineNo", value: "MachineNo", }, //*
    { label: "MachineName", value: "MachineName", }, //*
    { label: "MachineSpecification", value: "MachineSpecification", },
    { label: "Description", value: "Description", },
    { label: "MachineType", value: "MachineType", },
    { label: 'MachineRate', value: 'MachineRate', },
    { label: "Manufacturer", value: "Manufacturer", },
    { label: "YearOfManufacturing", value: "YearOfManufacturing", },
    { label: "MachineCapacityAndTonnage", value: "MachineCapacityAndTonnage", },
    { label: "MachineCost", value: "MachineCost", }, //*
    { label: "IsIncludeMachineCost", value: "IsIncludeMachineCost", },
    { label: "AccessoriesCost", value: "AccessoriesCost", },
    { label: "InstallationCost", value: "InstallationCost", },
    { label: "LoanCRMHead", value: "LoanCRMHead", },
    { label: "LoanPercentage", value: "LoanPercentage", },
    // { label: "EquityPercentage", value: "EquityPercentage", },         // KEEP COMMENTED ON RE						//RE
    { label: "InterestCRMHead", value: "InterestCRMHead", },
    { label: "RateOfInterest", value: "RateOfInterest", },
    { label: "WorkingShiftCRMHead", value: "WorkingShiftCRMHead", },
    { label: "NoOfShifts", value: "NoOfShifts", },
    { label: "WorkingHoursPerShift", value: "WorkingHoursPerShift", },
    { label: "NoOfWorkingDaysPerAnnum", value: "NoOfWorkingDaysPerAnnum", },
    // { label: "Availability", value: "Availability", },         // KEEP COMMENTED ON RE						//RE
    { label: "ActualWorkingHours", value: "ActualWorkingHours", },
    { label: "DepreciationCRMHead", value: "DepreciationCRMHead", },
    { label: "DepreciationType", value: "DepreciationType", },
    { label: "DepreciationRate", value: "DepreciationRate", },
    { label: "LifeOfAsset", value: "LifeOfAsset", },//NOUI
    { label: "CostOfScrap", value: "CostOfScrap", },
    { label: "DateOfPurchase", value: "DateOfPurchase", },
    { label: "IsMaintenanceFixed", value: "IsMaintenanceFixed", },
    { label: "AnnualMaintanceCRMHead", value: "AnnualMaintanceCRMHead", },
    { label: "AnnualMaintenancePercentage ", value: "AnnualMaintenancePercentage ", },
    { label: "AnnualMaintenanceAmount", value: "AnnualMaintenanceAmount", },
    { label: "IsConsumableFixed", value: "IsConsumableFixed", },
    { label: "AnnualConsumableCRMHead", value: "AnnualConsumableCRMHead", },
    { label: "AnnualConsumablePercentage", value: "AnnualConsumablePercentage", },
    { label: "AnnualConsumableAmount", value: "AnnualConsumableAmount", },
    { label: "InsuranceTypeFixed", value: "InsuranceTypeFixed", },
    { label: "AnnualInsuranceCRMHead", value: "AnnualInsuranceCRMHead", },
    { label: "InsuranceAmount", value: "InsuranceAmount", },
    { label: "AnnualInsurancePercentage", value: "AnnualInsurancePercentage", },
    { label: "BuildingCRMHead", value: "BuildingCRMHead", },
    { label: "BuildingCostPerSqFt", value: "BuildingCostPerSqFt", },
    { label: "MachineFloorCRMHead", value: "MachineFloorCRMHead", },
    { label: "MachineFloorAreaSqPerFt", value: "MachineFloorAreaSqPerFt", },
    { label: "OtherYearlyCRMHead", value: "OtherYearlyCRMHead", },
    { label: "OtherYearlyCost", value: "OtherYearlyCost", },
    { label: "UsesFuel", value: "UsesFuel", },
    { label: "FuelCRMHead", value: "FuelCRMHead", },
    { label: "Fuel", value: "Fuel", },
    { label: "ConsumptionPerAnnum", value: "ConsumptionPerAnnum", },
    { label: "Efficiency (%)", value: "Efficiency (%)", },
    { label: "PowerCRMHead", value: "PowerCRMHead", },
    { label: "PowerRatingKW", value: "PowerRatingKW", },
    { label: "UsesSolarPower", value: "UsesSolarPower", },
    { label: "LabourType", value: "LabourType", },
    // { label: "LabourRate", value: "LabourRate", },
    { label: "LabourCRMHead", value: "LabourCRMHead", },
    { label: "NoOfPeople", value: "NoOfPeople", },
    { label: "ProcessName", value: "ProcessName", },
    { label: "ProcessCode", value: "ProcessCode", },
    { label: "UOM", value: "UOM", },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const CLIENT_DOWNLOAD_EXCEl = [
    { label: "Customer Name", value: "CompanyName", },
    { label: "Customer Code", value: "CompanyCode", },
    // { label: "Company Name", value: "CompanyName", },         // KEEP COMMENTED ON RE						//RE
    // { label: "Company Code", value: "CompanyCode", },         // KEEP COMMENTED ON RE						//RE
    { label: "Contact Name", value: "ClientName", },
    { label: "Email Id", value: "ClientEmailId", },
    { label: "Phone No.", value: "PhoneNumber", },
    { label: "Ext.", value: "Extension", },
    { label: "Mobile No.", value: "MobileNumber", },
    { label: "Country", value: "CountryName", },
    { label: "State", value: "StateName", },
    { label: "City", value: "CityName", },
    { label: "ZipCode", value: "ZipCode", },
    { label: "Address 1", value: "AddressLine1", },
    { label: "Address 2", value: "AddressLine2", },
]


/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MHRMoreZBCTempData = [
    {
        "Technology": "Sheet Metal",
        'PlantCode': '8820',
        'VendorCode': '1111',
        'CustomerCode': 'C-100019',
        "MachineNo": "MAC-001",
        "MachineName": "Power Press",
        "MachineSpecification": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "MachineRate": 55,
        "Manufacturer": "TATA",
        "YearOfManufacturing": DayTime().format('YYYY'),
        "MachineCapacityAndTonnage": 40,
        "MachineCost": 5000,
        "IsIncludeMachineCost": "YES",
        "AccessoriesCost": 500,
        "InstallationCost": 500,
        "LoanPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": 2,
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "ActualWorkingHours": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "SLM",
        "DepreciationRate": 0,
        "LifeOfAsset": 5,
        "CostOfScrap": 100,
        "DateOfPurchase": DayTime().format('DD-MM-YYYY'),
        "IsMaintenanceFixed": "YES",
        "AnnualMaintenancePercentage ": 0,
        "AnnualMaintenanceAmount": 1000,
        "IsConsumableFixed": "YES",
        "AnnualConsumablePercentage": 0,
        "AnnualConsumableAmount": 1000,
        "InsuranceTypeFixed": "YES",
        "InsuranceAmount": 1000,
        "AnnualInsurancePercentage": 0,
        "BuildingCostPerSqFt": 100,
        "MachineFloorAreaSqPerFt": 2500,
        "OtherYearlyCost": 500,
        "UsesFuel": "YES",
        "Fuel": "CNG",
        "ConsumptionPerAnnum": 85,
        "Efficiency (%)": 0,
        "PowerRatingKW": "100",
        "UsesSolarPower": "NO",
        "LabourType": "Skilled",
        "NoOfPeople": 5,
        "ProcessName": "Grinding",
        "ProcessCode": "PR-1000001",
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark",
        "LoanCRMHead": "Net Sales",
        "InterestCRMHead": "Consumption",
        "WorkingShiftCRMHead": "Labour Cost",
        "DepreciationCRMHead": "Net Sales",
        "AnnualMaintanceCRMHead": "Manufacturing Expenses",
        "AnnualConsumableCRMHead": "Office Expenses",
        "AnnualInsuranceCRMHead": "Repairs Expenses",
        "BuildingCRMHead": "Selling & Distribution Expenses",
        "MachineFloorCRMHead": "Net Sales",
        "OtherYearlyCRMHead": "Common Expenses",
        "PowerCRMHead": "Staff Cost",
        "FuelCRMHead": "EBIDTA",
        "LabourCRMHead": "Net Sales",
    },
    {
        "Technology": "Sheet Metal",
        'PlantCode': '8820',
        'VendorCode': '1111',
        'CustomerCode': 'C-100019',
        "MachineNo": "MAC-002",
        "MachineName": "Hydraulic Press",
        "MachineSpecification": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "MachineRate": 55,
        "Manufacturer": "TATA",
        "YearOfManufacturing": DayTime().format('YYYY'),
        "MachineCapacityAndTonnage": 50,
        "MachineCost": 5000,
        "IsIncludeMachineCost": "YES",
        "AccessoriesCost": 500,
        "InstallationCost": 500,
        "LoanPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": '',
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "ActualWorkingHours": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "WDM",
        "DepreciationRate": 25,
        "LifeOfAsset": 0,
        "CostOfScrap": 100,
        "DateOfPurchase": DayTime().format('DD-MM-YYYY'),
        "IsMaintenanceFixed": "NO",
        "AnnualMaintenancePercentage ": 10,
        "AnnualMaintenanceAmount": 0,
        "IsConsumableFixed": "NO",
        "AnnualConsumablePercentage": 10,
        "AnnualConsumableAmount": 0,
        "InsuranceTypeFixed": "NO",
        "InsuranceAmount": 0,
        "AnnualInsurancePercentage": 10,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "OtherYearlyCost": 0,
        "UsesFuel": "NO",
        "Fuel": "",
        "ConsumptionPerAnnum": 0,
        "Efficiency (%)": 75,
        "PowerRatingKW": "100",
        "UsesSolarPower": "YES",
        "LabourType": "Semi-Skilled",
        "NoOfPeople": 10,
        "ProcessName": "Turning",
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark",
        "LoanCRMHead": "Net Sales",
        "InterestCRMHead": "Consumption",
        "WorkingShiftCRMHead": "Labour Cost",
        "DepreciationCRMHead": "Net Sales",
        "AnnualMaintanceCRMHead": "Manufacturing Expenses",
        "AnnualConsumableCRMHead": "Office Expenses",
        "AnnualInsuranceCRMHead": "Repairs Expenses",
        "BuildingCRMHead": "Selling & Distribution Expenses",
        "MachineFloorCRMHead": "Net Sales",
        "OtherYearlyCRMHead": "Common Expenses",
        "PowerCRMHead": "Staff Cost",
        "FuelCRMHead": "EBIDTA",
        "LabourCRMHead": "Net Sales",
    }, {
        "Technology": "Sheet Metal",
        'PlantCode': '8820',
        'VendorCode': '1111',
        'CustomerCode': 'C-100019',
        "MachineNo": "MAC-002",
        "MachineName": "Hydraulic Press",
        "MachineSpecification": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "MachineRate": 55,
        "Manufacturer": "TATA",
        "YearOfManufacturing": DayTime().format('YYYY'),
        "MachineCapacityAndTonnage": 50,
        "MachineCost": 5000,
        "IsIncludeMachineCost": "YES",
        "AccessoriesCost": 500,
        "InstallationCost": 500,
        "LoanPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": '',
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "ActualWorkingHours": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "WDM",
        "DepreciationRate": 25,
        "LifeOfAsset": 0,
        "CostOfScrap": 100,
        "DateOfPurchase": DayTime().format('DD-MM-YYYY'),
        "IsMaintenanceFixed": "NO",
        "AnnualMaintenancePercentage ": 10,
        "AnnualMaintenanceAmount": 0,
        "IsConsumableFixed": "NO",
        "AnnualConsumablePercentage": 10,
        "AnnualConsumableAmount": 0,
        "InsuranceTypeFixed": "NO",
        "InsuranceAmount": 0,
        "AnnualInsurancePercentage": 10,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "OtherYearlyCost": 0,
        "UsesFuel": "NO",
        "Fuel": "",
        "ConsumptionPerAnnum": 0,
        "Efficiency (%)": 75,
        "PowerRatingKW": "100",
        "UsesSolarPower": "YES",
        "LabourType": "Semi-Skilled",
        "NoOfPeople": 10,
        "ProcessName": "Turning",
        "UOM": "shot/stroke/Number",
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark",
        "LoanCRMHead": "Net Sales",
        "InterestCRMHead": "Consumption",
        "WorkingShiftCRMHead": "Labour Cost",
        "DepreciationCRMHead": "Net Sales",
        "AnnualMaintanceCRMHead": "Manufacturing Expenses",
        "AnnualConsumableCRMHead": "Office Expenses",
        "AnnualInsuranceCRMHead": "Repairs Expenses",
        "BuildingCRMHead": "Selling & Distribution Expenses",
        "MachineFloorCRMHead": "Net Sales",
        "OtherYearlyCRMHead": "Common Expenses",
        "PowerCRMHead": "Staff Cost",
        "FuelCRMHead": "EBIDTA",
        "LabourCRMHead": "Net Sales",
    }, {
        "Technology": "Sheet Metal",
        'PlantCode': '8820',
        'VendorCode': '1111',
        'CustomerCode': 'C-100019',
        "MachineNo": "MAC-002",
        "MachineName": "Hydraulic Press",
        "MachineSpecification": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "MachineRate": 55,
        "Manufacturer": "TATA",
        "YearOfManufacturing": DayTime().format('YYYY'),
        "MachineCapacityAndTonnage": 50,
        "MachineCost": 5000,
        "IsIncludeMachineCost": "YES",
        "AccessoriesCost": 500,
        "InstallationCost": 500,
        "LoanPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": '',
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "ActualWorkingHours": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "WDM",
        "DepreciationRate": 25,
        "LifeOfAsset": 0,
        "CostOfScrap": 100,
        "DateOfPurchase": DayTime().format('DD-MM-YYYY'),
        "IsMaintenanceFixed": "NO",
        "AnnualMaintenancePercentage ": 10,
        "AnnualMaintenanceAmount": 0,
        "IsConsumableFixed": "NO",
        "AnnualConsumablePercentage": 10,
        "AnnualConsumableAmount": 0,
        "InsuranceTypeFixed": "NO",
        "InsuranceAmount": 0,
        "AnnualInsurancePercentage": 10,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "OtherYearlyCost": 0,
        "UsesFuel": "NO",
        "Fuel": "",
        "ConsumptionPerAnnum": 0,
        "Efficiency (%)": 75,
        "PowerRatingKW": "100",
        "UsesSolarPower": "YES",
        "LabourType": "Semi-Skilled",
        "NoOfPeople": 10,
        "ProcessName": "Turning",
        'UOM': 'Square Millimeter/Square Inch/Square Feet/Square Centimeter/Square Meter',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark",
        "LoanCRMHead": "Net Sales",
        "InterestCRMHead": "Consumption",
        "WorkingShiftCRMHead": "Labour Cost",
        "DepreciationCRMHead": "Net Sales",
        "AnnualMaintanceCRMHead": "Manufacturing Expenses",
        "AnnualConsumableCRMHead": "Office Expenses",
        "AnnualInsuranceCRMHead": "Repairs Expenses",
        "BuildingCRMHead": "Selling & Distribution Expenses",
        "MachineFloorCRMHead": "Net Sales",
        "OtherYearlyCRMHead": "Common Expenses",
        "PowerCRMHead": "Staff Cost",
        "FuelCRMHead": "EBIDTA",
        "LabourCRMHead": "Net Sales",
    }, {
        "Technology": "Sheet Metal",
        'PlantCode': '8820',
        'VendorCode': '1111',
        'CustomerCode': 'C-100019',
        "MachineNo": "MAC-002",
        "MachineName": "Hydraulic Press",
        "MachineSpecification": "Machine Specification",
        "Description": "Description text",
        "MachineType": "Mechanical",
        "MachineRate": 55,
        "Manufacturer": "TATA",
        "YearOfManufacturing": DayTime().format('YYYY'),
        "MachineCapacityAndTonnage": 50,
        "MachineCost": 5000,
        "IsIncludeMachineCost": "YES",
        "AccessoriesCost": 500,
        "InstallationCost": 500,
        "LoanPercentage": 10,
        "RateOfInterest": 7,
        "NoOfShifts": '',
        "WorkingHoursPerShift": 8,
        "NoOfWorkingDaysPerAnnum": 250,
        "ActualWorkingHours": 80,
        "NoOfWorkingHourPerAnnum": 0,
        "DepreciationType": "WDM",
        "DepreciationRate": 25,
        "LifeOfAsset": 0,
        "CostOfScrap": 100,
        "DateOfPurchase": DayTime().format('DD-MM-YYYY'),
        "IsMaintenanceFixed": "NO",
        "AnnualMaintenancePercentage ": 10,
        "AnnualMaintenanceAmount": 0,
        "IsConsumableFixed": "NO",
        "AnnualConsumablePercentage": 10,
        "AnnualConsumableAmount": 0,
        "InsuranceTypeFixed": "NO",
        "InsuranceAmount": 0,
        "AnnualInsurancePercentage": 10,
        "BuildingCostPerSqFt": 0,
        "MachineFloorAreaSqPerFt": 0,
        "OtherYearlyCost": 0,
        "UsesFuel": "NO",
        "Fuel": "",
        "ConsumptionPerAnnum": 0,
        "Efficiency (%)": 75,
        "PowerRatingKW": "100",
        "UsesSolarPower": "YES",
        "LabourType": "Semi-Skilled",
        "NoOfPeople": 10,
        "ProcessName": "Turning",
        'UOM': 'Seconds/Minutes/Hours/MilliSeconds',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": "Remark",
        "LoanCRMHead": "Net Sales",
        "InterestCRMHead": "Consumption",
        "WorkingShiftCRMHead": "Labour Cost",
        "DepreciationCRMHead": "Net Sales",
        "AnnualMaintanceCRMHead": "Manufacturing Expenses",
        "AnnualConsumableCRMHead": "Office Expenses",
        "AnnualInsuranceCRMHead": "Repairs Expenses",
        "BuildingCRMHead": "Selling & Distribution Expenses",
        "MachineFloorCRMHead": "Net Sales",
        "OtherYearlyCRMHead": "Common Expenses",
        "PowerCRMHead": "Staff Cost",
        "FuelCRMHead": "EBIDTA",
        "LabourCRMHead": "Net Sales",
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const MachineVBC = [
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'VendorCode', value: 'VendorCode', }, // not on UI
    { label: 'PlantCode', value: 'PlantCode', }, // not on UI
    { label: 'MachineNo', value: 'MachineNo', }, //*
    { label: 'MachineSpecification', value: 'MachineSpecification', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapacityAndTonnage', value: 'MachineCapacityAndTonnage', },
    { label: 'ProcessName', value: 'ProcessName', }, //*
    { label: 'ProcessCode', value: 'ProcessCode', }, //*
    { label: 'UOM', value: 'UOM', }, //* maybe
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineVBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'VendorCode': '10222',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'VendorCode': '10222',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'VendorCode': '10222',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "shot/stroke/Number",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'VendorCode': '10222',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Square Millimeter/Square Inch/Square Feet/Square Centimeter/Square Meter',
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'VendorCode': '10222',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Seconds/Minutes/Hours/MilliSeconds',
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]
export const MachineCBC = [
    { label: "TechnologyLabel", value: 'Technology', defaultValue: "Technology" }, //*
    { label: 'CustomerCode', value: 'CustomerCode', }, // not on UI
    { label: 'PlantCode', value: 'PlantCode', }, // not on UI
    { label: 'MachineNo', value: 'MachineNo', }, //*
    { label: 'MachineSpecification', value: 'MachineSpecification', },
    { label: 'MachineName', value: 'MachineName', }, //*
    { label: 'MachineType', value: 'MachineType', },
    { label: 'MachineCapacityAndTonnage', value: 'MachineCapacityAndTonnage', },
    { label: 'ProcessName', value: 'ProcessName', }, //*
    { label: 'ProcessCode', value: 'ProcessCode', }, //*
    { label: 'UOM', value: 'UOM', }, //* maybe
    { label: 'MachineRate', value: 'MachineRate', },
    { label: 'EffectiveDate', value: 'EffectiveDate', },
    { label: 'Remark', value: 'Remark', },
]

export const MachineCBCTempData = [
    {
        'Technology': 'Sheet Metal',
        'CustomerCode': 'C-10008',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'CustomerCode': 'C-10008',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "Gallon/Cubic Centimeter/Cubic Meter/Milliliter/Liter",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'CustomerCode': 'C-10008',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        "UOM": "shot/stroke/Number",
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'CustomerCode': 'C-10008',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Square Millimeter/Square Inch/Square Feet/Square Centimeter/Square Meter',
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }, {
        'Technology': 'Sheet Metal',
        'CustomerCode': 'C-10008',
        'PlantCode': '1032',
        'MachineNo': 'SM101',
        'MachineSpecification': 'Mechanical Power Press',
        'MachineName': 'Power Press',
        'MachineType': 'Mechanical',
        'MachineCapacityAndTonnage': '40',
        'ProcessName': 'Punching',
        'ProcessCode': 'PR-1000001',
        'UOM': 'Seconds/Minutes/Hours/MilliSeconds',
        'MachineRate': '20',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
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
    { label: "SAPCode", value: "SAPCode", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" },
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
        'SAPCode': 'sap-1001',
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        'TechnologyName': 'Sheet Metal',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
    }
]


// USED IN BULK UPLOAD FOR PRODUCT COMPONENT

export const ProductComponent = [
    { label: 'ProductName', value: 'ProductName', }, //*
    { label: 'ProductNumber', value: 'ProductNumber', }, //*
    { label: 'Note', value: 'Note', },
    { label: 'ProductGroupCode', value: 'ProductGroupCode', }, //*
    { label: 'ProductDescription', value: 'ProductDescription', },
    { label: 'ECNNumber', value: 'ECNNumber', },
    { label: 'RevisionNo', value: 'RevisionNo', },
    { label: 'DrawingNo', value: 'DrawingNo', },
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //,* maybe only star
    { label: 'Remark', value: 'Remark', },
    { label: 'PreferredForImpactCalculation', value: "IsConsideredForMBOM" },
    // { label: 'IsConsideredForMBOM', value: "IsConsideredForMBOM" },         // KEEP COMMENTED ON RE						//RE
]

export const ProductComponentTempData = [
    {
        'ProductName': 'Screw',
        'ProductNumber': 'Product123',
        'Note': 'Add all the levels here to the ProductGroupCode, separated by a colon (:). Dummy data for 4 levels has been provided.',
        'ProductGroupCode': 'ICE:MoterCycle:Rider 125 CC',
        'ProductDescription': 'Part Description',
        'ECNNumber': '1',
        'RevisionNo': '1',
        'DrawingNo': '1',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        'Remark': 'Remark Text',
        "IsConsideredForMBOM": "YES or NO"                      //correction done
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
        'ICCApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'ICCPercent': 10,
        'PaymentTermApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'RepaymentPeriod': 30,
        'PaymentTermPercent': 10,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
    }
]

/**
* @desc USED IN EXCEL HEADER FOR BULK UPLOAD
*/
export const VBCInterestRate = [
    { label: "RawMaterialName", value: "RawMaterialName", },
    { label: "RawMaterialGrade", value: "RawMaterialGrade", },
    { label: 'VendorCode', value: 'VendorCode', }, //NOUI
    { label: "PlantCode", value: "PlantCode", },
    { label: 'ICCApplicability', value: 'ICCApplicability', }, //*
    { label: 'ICCPercent', value: 'ICCPercent', }, //*
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', }, //*
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', }, //*
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
]

export const VBCInterestRateTempData = [
    {
        'RawMaterialName': '45455457',
        'RawMaterialGrade': '2',
        'VendorCode': 'VCode001',
        "PlantCode": "1511",
        'ICCApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'ICCPercent': '10   ',
        'PaymentTermApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'RepaymentPeriod': '30',
        'PaymentTermPercent': '10',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
    }
]
export const CBCInterestRate = [
    { label: "RawMaterialName", value: "RawMaterialName", },
    { label: "RawMaterialGrade", value: "RawMaterialGrade", },
    { label: 'CustomerCode', value: 'CustomerCode', }, //NOUI
    { label: "PlantCode", value: "PlantCode", },
    { label: 'ICCApplicability', value: 'ICCApplicability', }, //*
    { label: 'ICCPercent', value: 'ICCPercent', }, //*
    { label: 'PaymentTermApplicability', value: 'PaymentTermApplicability', }, //*
    { label: 'RepaymentPeriod', value: 'RepaymentPeriod', }, //*
    { label: 'PaymentTermPercent', value: 'PaymentTermPercent', }, //*
    { label: 'EffectiveDate', value: 'EffectiveDate', }, //*
]

export const CBCInterestRateTempData = [
    {
        'RawMaterialName': '45455457',
        'RawMaterialGrade': '2',
        'CustomerCode': 'C-10008',
        "PlantCode": "1511",
        'ICCApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'ICCPercent': '10   ',
        'PaymentTermApplicability': 'RM/RM + CC/RM + CC + BOP/RM + BOP/Fixed/Part cost/Part cost + CC/Part Cost + BOP/Part cost + CC + BOP/BOP + CC/BOP/CC',
        'RepaymentPeriod': '30',
        'PaymentTermPercent': '10',
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
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
    { label: "SAPCode", value: "SAPCode", },
    { label: "IsAssembly", value: "IsAssembly" }, //NOUI,*
    { label: "BOMLevel", value: "BOMLevel" }, //NOUI,*
    { label: "Quantity", value: "Quantity" }, //NOUI
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "Remark", value: "Remark" },
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
]

export const BOMUploadTempData = [
    // ASSEMBLY
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
        "SAPCode": "sap-1001",
        "IsAssembly": "YES",
        "BOMLevel": 0,
        "Quantity": 2,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": 'Remark',
        "ProductGroupCode": "VB",
        "TechnologyName": "Sheet Metal",
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",

    },
    // COMPONENT
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
        "SAPCode": "sap-1002",
        "IsAssembly": "NO",
        "BOMLevel": 1,
        "Quantity": 3,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": 'Remark',
        "ProductGroupCode": "VB",
        "TechnologyName": "Sheet Metal",
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",

    },
    // BOP
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
        "SAPCode": "sap-1003",
        "IsAssembly": "NO",
        "BOMLevel": 1,
        "Quantity": 4,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": 'Remark',
        "ProductGroupCode": "VB",
        "TechnologyName": "Sheet Metal",
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",

    },
    // SUB ASSEMBLY
    {
        "BOMNo": "BOM123",
        "AssemblyPartNo": "APart1",
        "AssemblyPartName": "Screw Jack",
        "PartNo": "SubAsm1",
        "PartName": "SubAsm1",
        "Description": "Description Text",
        "PartType": "Assembly",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "SAPCode": "sap-1004",
        "IsAssembly": "YES",
        "BOMLevel": 1,
        "Quantity": 2,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": 'Remark',
        "ProductGroupCode": "VB",
        "TechnologyName": "Sheet Metal",
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",

    },
    // COMPONENT
    {
        "BOMNo": "BOM123",
        "AssemblyPartNo": "SubAsm1",
        "AssemblyPartName": "SubAsm1",
        "PartNo": "Comp_Nut2",
        "PartName": "Nut2",
        "Description": "Description Text",
        "PartType": "Component",
        "GroupCode": "GC1",
        "ECNNumber": 1,
        "RevisionNo": 1,
        "DrawingNo": 1,
        "SAPCode": "sap-1005",
        "IsAssembly": "NO",
        "BOMLevel": 2,
        "Quantity": 3,
        "EffectiveDate": DayTime().format('DD-MM-YYYY'),
        "Remark": 'Remark',
        "ProductGroupCode": "VB",
        "TechnologyName": "Sheet Metal",
        "UnitOfMeasurement": "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",

    },
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

export const AcceptableRMUOM = ['Mass', 'Dimensionless', 'Volume', 'Dimension', 'Area']
export const AcceptableBOPUOM = ['Mass', 'Dimensionless', 'Volume', 'Dimension', 'Area']
export const AcceptableMachineUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Time']
export const AcceptableOperationUOM = ['Mass', 'Dimensionless', 'Volume', 'Area', 'Dimension', 'Time']
export const AcceptableFuelUOM = ['Mass', 'Volume']
export const AcceptablePowerUOM = ['Power']
export const AcceptableSheetMetalUOM = ['Kilogram', 'Gram', 'Milligram']
export const MULTIPLERMTECHNOLOGY = [4, 5, 7, 8, 14, 16, 17, 6, 9, 10, 2, 15, 23]

export function isMultipleRMAllow(technology) {
    const allowedMultipleRM = [1, 4, 5, 7, 8, 14, 16, 17, 6, 9, 10, 2, 15, 23, 20]
    return allowedMultipleRM.includes(technology);
}

export const SHEETMETAL = 1
export const FORGING = 2
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
export const CORRUGATEDBOX = 20
export const WIRING_HARNESS = 16
export const ELECTRONICS = 17
export const HARDWARE = 18
export const RIVET = 19
export const PLATING = 21
export const DIE_CASTING = 23
export const ASSEMBLY_TECHNOLOGY_MASTER = 10
export const LOGISTICS = 24
export const WIREFORMING = 25
export const ELECTRICAL_STAMPING = 26
export const INSULATION = 28
export const TOOLING_ID = 27

// PART TYPE
export const PART_TYPE_ASSEMBLY = 1


export const STRINGMAXLENGTH = 50
export const NUMBERMAXLENGTH = 6
export const REMARKMAXLENGTH = 512
export const HAVELLSREMARKMAXLENGTH = 1000

export const SIMULATION_LEFT_MENU_NOT_INCLUDED = ["Simulation Upload", "RM Import", "RM Domestic", "BOP Domestic", "BOP Import", "Process-Simulation", "Process", "Operation-Simulation", "Surface Treatment", "Overhead-Simulation", "Overhead", "Profits", "Profits-Simulation", "Freight-Simulation", "Combined Process", "Operations", "Exchange Rates", "Machine Rate"]

export const RMDomesticSimulation = [
    // ******* RMShearingCost AND RMFreightCost WILL NOT COME IN RE *****

    { label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterialName" },
    { label: "Grade", value: "RawMaterialGradeName" },
    { label: "Spec", value: "RawMaterialSpecificationName" },
    { label: "Code", value: "RawMaterialCode", },
    { label: "Category", value: "Category" },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "Plant (Code)", value: "DestinationPlantName" },
    { label: "Vendor (Code)", value: "VendorName" },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "UOM", value: "UnitOfMeasurementName" },
    { label: "BasicRate", value: "BasicRatePerUOM" },
    { label: 'RevisedBasicRate', value: 'NewBasicRate' },
    { label: 'RMFreightCost', value: "RMFreightCost" },         // KEEP COMMENTED ON RE						//RE
    { label: "RMShearingCost", value: "RMShearingCost" },         // KEEP COMMENTED ON RE						//RE
    { label: "ScrapRate", value: "ScrapRate" },
    { label: 'RevisedScrapRate', value: 'NewScrapRate' },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "RawMaterialId", value: "RawMaterialId" },
    { label: "VendorId", value: "Vendor" },
    { label: "PlantId", value: "DestinationPlantId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const RMImportSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "RawMaterial", value: "RawMaterialName" },
    { label: "Grade", value: "RawMaterialGradeName" },
    { label: "Spec", value: "RawMaterialSpecificationName" },
    { label: "Code", value: "RawMaterialCode", },
    { label: "Category", value: "Category" },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "Plant (Code)", value: "DestinationPlantName" },
    { label: "Vendor (Code)", value: "VendorName" },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "VendorLocation", value: "VendorLocation" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "UOM", value: "UnitOfMeasurementName" },
    { label: "BasicRate", value: "BasicRatePerUOM" },
    { label: 'RevisedBasicRate', value: 'NewBasicRate' },
    { label: "ScrapRate", value: "ScrapRate" },
    { label: 'RevisedScrapRate', value: 'NewScrapRate' },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "RawMaterialId", value: "RawMaterialId" },
    { label: "VendorId", value: "Vendor" },
    { label: "PlantId", value: "DestinationPlantId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const SurfaceTreatmentSimulation = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "CostingHead", value: "CostingHead" },
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "DestinationPlant (Code)", value: "Plants" },
    { label: "Vendor (Code)", value: "VendorName", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "UOM", value: "UOM" },
    { label: "Rate", value: "Rate" },
    { label: "RevisedRate", value: "NewRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "OperationId", value: "OperationId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const OperationSimulation = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "CostingHead", value: "CostingHead" },
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "OperationType", value: "ForType", },
    { label: "DestinationPlant (Code)", value: "Plants" },
    { label: "Vendor (Code)", value: "VendorName", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "UOM", value: "UOM" },
    { label: "Consumption", value: "OperationConsumption" },
    { label: "WeldingMaterialRate/kg", value: "OperationBasicRate" },
    { label: "Revised WeldingMaterialRate/kg", value: "NewOperationBasicRate" },
    { label: "Rate", value: "Rate" },
    { label: "RevisedRate", value: "NewRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "OperationId", value: "OperationId" },
    { label: "CostingTypeId", value: "CostingTypeId" }

]

export const MachineRateSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "MachineName", value: "MachineName", },
    { label: "MachineNumber", value: "MachineNumber", },
    { label: "MachineTypeName", value: "MachineTypeName" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "Plant" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "MachineTonnage", value: "MachineTonnage" },
    { label: "ProcessName", value: "ProcessName" },
    { label: "MachineRate", value: "MachineRate" },
    { label: "RevisedMachineRate", value: "NewMachineRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "MachineId", value: "MachineId" },
    { label: "MachineProcessRateId", value: "MachineProcessRateId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const BOPDomesticSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber" },
    { label: "BoughtOutPartName", value: "BoughtOutPartName" },
    { label: "BoughtOutPartCategory", value: "BoughtOutPartCategory" },
    { label: "Plant (Code)", value: "Plants", },
    { label: "Vendor (Code)", value: "Vendor" },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "NumberOfPieces", value: "NumberOfPieces" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Percentage", value: "Percentage" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "RevisedBasicRate", value: "NewBasicRate" },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "BoughtOutPartId", value: "BoughtOutPartId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const BOPImportSimulation = [
    { label: "CostingHead", value: "CostingHead" },
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber" },
    { label: "BoughtOutPartName", value: "BoughtOutPartName" },
    { label: "BoughtOutPartCategory", value: "BoughtOutPartCategory" },
    { label: "Plant (Code)", value: "Plants", },
    { label: "Vendor (Code)", value: "Vendor" },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "NumberOfPieces", value: "NumberOfPieces" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Percentage", value: "Percentage" },
    { label: "BasicRate", value: "BasicRate" },
    { label: "RevisedBasicRate", value: "NewBasicRate" },
    { label: "NetLandedCost", value: "NetLandedCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "BoughtOutPartId", value: "BoughtOutPartId" },
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const OverheadProfitSimulation = [
    { label: "CostingHead", value: "IsVendor" },
    { label: "CustomerName", value: "ClientName" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "ModelType", value: "ModelType" },
    { label: "OverheadApplicabilityType", value: "OverheadApplicabilityType", },
    { label: "OverheadPercentage", value: "OverheadPercentage" },
    { label: "OverheadRMPercentage", value: "OverheadRMPercentage" },
    { label: "OverheadBOPPercentage", value: "OverheadBOPPercentage" },
    { label: "OverheadMachiningCCPercentage", value: "OverheadMachiningCCPercentage" },
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
export const BROACHING = 'Broaching'
export const HARDFACING = 'Hard Facing'

export const getTechnology = [1, 8, 2, 4, 20, 23, 14, 25, 26, 28]
export const technologyForDensity = [1, 2, 14, 25]
export const getTechnologyForRecoveryPercent = [4, 6, 3, 5, 2]
export const getTechnologyForSimulation = ['0', '1', '2', '3', '4', '5', '6', '7', '9', '10']
export const IdForMultiTechnology = ['13', '10', '9']   //Assembly, Electrical Proprietary, Mechanical Proprietary


export const CostingSimulationDownloadRM = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Raw Material", value: "RMName" },
    { label: "Grade", value: "RMGrade" },
    { label: "Spec", value: "RMSpec" },
    { label: "Code", value: "RMCode" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Finish Weight", value: "RawMaterialFinishWeight" },
    { label: "Gross Weight", value: "RawMaterialGrossWeight" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "Existing Basic Rate", value: "OldRMRate" },
    { label: 'Revised Basic Rate', value: 'NewRMRate' },
    { label: "ScrapRate", value: "OldScrapRate" },
    { label: 'RevisedScrapRate', value: 'NewScrapRate' },
    { label: "Existing RM Cost/Pc", value: "OldRMPrice" },
    { label: "Revised RM Cost/Pc", value: "NewRMPrice" },
    { label: "Variance (RM Cost)", value: "RMCVariance" },

    { label: "Existing Exchange Rate", value: "OldExchangeRate" },
    { label: "RevisedExchangeRate", value: "NewExchangeRate" },
    { label: "Variance (w.r.t. Existing)", value: "ERVariance" },

    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },

    // { label: "EffectiveDate", value: "EffectiveDate" },
]

export const COMBINEDPROCESSSIMULATION = [          			//RE
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "Vendor Name", value: "VendorName" },
    { label: "Plant", value: "PlantName" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    //{ label: "Raw Material", value: "RMName" },
    //{ label: "RawMaterial Grade", value: "RMGrade" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Existing PO Price", value: "OldPOPrice" },
    { label: "Revised PO Price", value: "NewPOPrice" },
    { label: "PO Variance", value: "POVariance" },
    { label: 'Existing Net CC', value: 'OldNetCC' },
    { label: "Revised Net CC", value: "NewNetCC" },
    { label: "Variance", value: "CPVariance" },

    { label: `Impact for Quarter (${reactLocalStorage.getObject("baseCurrency")})`, value: "ImpactPerQuarter" },

    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },

    // { label: "EffectiveDate", value: "EffectiveDate" },
]

export const CostingSimulationDownloadST = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "SurfaceArea", value: "SurfaceArea" },
    { label: "ExistingSTRate", value: "OldSurfaceTreatmentRate" },
    { label: "RevisedSTRate", value: "NewSurfaceTreatmentRate" },
    { label: "ExistingSTCost", value: "OldSTCost" },
    { label: "RevisedSTCost", value: "NewSTCost" },
    { label: "ExistingSTCost", value: "OldSurfaceTreatmentCost" },
    { label: "RevisedSTCost", value: "NewSurfaceTreatmentCost" },
    { label: "ExistingTranspotationCost", value: "OldTranspotationCost" },
    { label: "RevisedTranspotationCost", value: "NewTranspotationCost" },
    { label: "ExistingNetSTCost", value: "OldNetSurfaceTreatmentCost" },
    { label: "RevisedNetSTCost", value: "NewNetSurfaceTreatmentCost" },
    { label: "Variance (ST Cost)", value: "STVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const CostingSimulationDownloadOperation = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "Operation Quantity", value: "Quantity" },
    { label: "ExistingOperationRate", value: "OldOperationRate" },
    { label: "RevisedOperationRate", value: "NewOperationRate" },
    { label: "OperationVariance", value: "OperationVariance" },
    { label: "ExistingOperationCost", value: "OldOperationCost" },
    { label: "RevisedOperationCost", value: "NewOperationCost" },
    { label: "ExistingNetOperationCost", value: "OldNetOperationCost" },
    { label: "RevisedNetOperationCost", value: "NewNetOperationCost" },
    { label: "Variance (Oper. Cost)", value: "OperationCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const CostingSimulationDownloadBOP = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "BoughtOutPartName", value: "BoughtOutPartName" },
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber" },
    { label: "BOP Quantity", value: "BoughtOutPartQuantity" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "ExistingBOPRate", value: "OldBOPRate" },
    { label: "RevisedBOPRate", value: "NewBOPRate" },
    { label: "ExistingBOPCost", value: "OldBOPCost" },
    { label: "RevisedBOPCost", value: "NewBOPCost" },
    { label: "Variance (BOP Cost)", value: "BOPVariance" },
    { label: "ExistingNetBoughtOutPartCost", value: "OldNetBoughtOutPartCost" },
    { label: "RevisedNetBoughtOutPartCost", value: "NewNetBoughtOutPartCost" },
    { label: "NetBoughtOutPartCostVariance", value: "NetBoughtOutPartCostVariance" },

    { label: "Existing Exchange Rate", value: "OldExchangeRate" },
    { label: "RevisedExchangeRate", value: "NewExchangeRate" },
    { label: "Variance (w.r.t. Existing)", value: "ERVariance" },

    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const SimulationDownloadBOP = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "ExistingBOPRate", value: "OldBOPRate" },
    { label: "RevisedBOPRate", value: "NewBOPRate" },
    { label: "Variance (BOP Cost)", value: "BOPNONVariance" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADRM = [
    { label: "Costing Id", value: "CostingNumber" },
    { label: "RawMaterial Name", value: "RMName" },
    { label: "Grade", value: "RMGrade" },
    { label: "Code", value: "RMCode" },
    { label: "Spec", value: "RMSpecs" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Existing RM Cost", value: "OldRMPrice" },
    { label: "Revised RM Cost", value: "NewRMPrice" },
    { label: "Variance (RM Cost)", value: "RMVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADER = [
    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Existing Net PO Price Other Currency", value: "OldNetPOPriceOtherCurrency" },
    { label: "Revised Net PO Price Other Currency", value: "NewNetPOPriceOtherCurrency" },
    { label: "Existing Exchange Rate", value: "OldExchangeRate" },
    { label: "Revised Exchange Rate", value: "NewExchangeRate" },
    { label: "Variance (ER Cost)", value: "Variance" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADST = [

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Operation Name", value: "OperationName" },
    { label: "Operation Code", value: "OperationCode" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Existing Net ST Cost", value: "OldNetSurfaceTreatmentCost" },
    { label: "Revised Net ST Cost", value: "NewNetSurfaceTreatmentCost" },
    { label: "Variance (ST Cost)", value: "NetSurfaceTreatmentCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
]
export const SIMULATIONAPPROVALSUMMARYDOWNLOADCP = [         // KEEP COMMENTED ON RE						//RE

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Vendor Name", value: "VendorName" },
    { label: "Plant", value: "PlantName" },
    { label: "Existing PO Price", value: "OldPOPrice" },
    { label: "Revised PO Price", value: "NewPOPrice" },
    { label: "PO Variance", value: "POVariance" },
    { label: "Existing CC", value: "OldNetCC" },
    { label: "Revised CC", value: "NewNetCC" },
    { label: "CC Variance", value: "Variance" },
    { label: `Impact for Quarter (${reactLocalStorage.getObject("baseCurrency")})`, value: "ImpactPerQuarter" },

]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADOPERATION = [

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "ExistingOperationCost", value: "OldOperationCost" },
    { label: "RevisedOperationCost", value: "NewOperationCost" },
    { label: "Variance (Oper. Cost)", value: "OperationCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADBOP = [

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "BOP Name", value: "BoughtOutPartName" },
    { label: "BOP Number", value: "BoughtOutPartNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "Existing BOP Cost", value: "OldNetBoughtOutPartCost" },
    { label: "Revised BOP Cost", value: "NewNetBoughtOutPartCost" },
    { label: "Variance (BOP Cost)", value: "NetBoughtOutPartCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADBOPWITHOUTCOSTING = [
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Percentage", value: "PercentageChange" },
    { label: "Existing BOP Cost", value: "OldNetBoughtOutPartCost" },
    { label: "Revised BOP Cost", value: "NewNetBoughtOutPartCost" },
    { label: "Variance (BOP Cost)", value: "NetBoughtOutPartCostVariance" },
]

export const BOP_DOMESTIC_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "BOP Part No.", value: "BoughtOutPartNumber", },
    { label: "BOP Part Name", value: "BoughtOutPartName", },
    { label: "BOP Part Category", value: "BoughtOutPartCategory", },
    { label: "UOM", value: "UOM", },
    { label: "Specification", value: "Specification", },
    { label: "SAP Code", value: "SAPPartNumber", },
    { label: "Plant (Code)", value: "Plants", },
    { label: "Vendor (Code)", value: "Vendor", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: 'IsBreakupBoughtOutPart', value: 'IsBreakupBoughtOutPart', },
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "Minimum Order Quantity", value: "NumberOfPieces", },
    { label: "Basic Rate", value: "BasicRate", },
    { label: "Basic Price", value: "NetCostWithoutConditionCost", },
    { label: "Net Condition Cost", value: "NetConditionCost", },
    { label: "Net Cost", value: "NetLandedCost", },



    { label: "Effective Date", value: "EffectiveDate", }
]

export const BOP_IMPORT_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "BOP Part No.", value: "BoughtOutPartNumber" },
    { label: "BOP Part Name", value: "BoughtOutPartName" },
    { label: "BOP Category", value: "BoughtOutPartCategory" },
    { label: "UOM", value: "UOM" },
    { label: "Currency", value: "Currency" },
    { label: "Specification", value: "Specification" },
    { label: "SAP Code", value: "SAPPartNumber", },
    { label: "Plant (Code)", value: "Plants" },
    { label: "Vendor (Code)", value: "Vendor" },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: 'IsBreakupBoughtOutPart', value: 'IsBreakupBoughtOutPart', },
    { label: "TechnologyLabel", value: 'TechnologyName', defaultValue: "Technology" },
    { label: "Inco Terms", value: "IncoTermDescriptionAndInfoTerm" },
    { label: "Payment Terms", value: "PaymentTermDescriptionAndPaymentTerm" },
    { label: "Minimum Order Quantity", value: "NumberOfPieces", },
    { label: "Basic Rate (Currency)", value: "BasicRate", },
    { label: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "BasicRateConversion", },
    { label: "Basic Price (Currency)", value: "NetCostWithoutConditionCost", },
    { label: `Basic Price (${reactLocalStorage.getObject("baseCurrency")})`, value: "NetCostWithoutConditionCostConversion", },
    { label: "Net Condition Cost (Currency)", value: "NetConditionCost", },
    { label: `Net Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "NetConditionCostConversion", },
    { label: `Net Cost (Currency)`, value: "NetLandedCost", },
    { label: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "NetLandedCostConversion", },
    { label: "Effective Date", value: "EffectiveDate" },
]

export const BOP_SOBLISTING_DOWNLOAD_EXCEl = [
    { label: "BOP Part No.", value: "BoughtOutPartNumber", },
    { label: "BOP Part Name", value: "BoughtOutPartName", },
    { label: "BOP Category", value: "BoughtOutPartCategoryName", },
    { label: "Entry Type", value: "BoughtOutPartEntryType", },
]

export const BOP_SOB_DOWNLOAD_EXCEL = [
    { label: "BOP Part No.", value: "BoughtOutPartNumber" },
    { label: "BOP Part Name", value: "BoughtOutPartName" },
    { label: "BOP Category", value: "BoughtOutPartCategory" },
    { label: "Specification", value: "Specification" },
    { label: "UOM", value: "UOM" },
    { label: "Plant", value: "Plant" },
    { label: "No. of Vendors", value: "NoOfVendors" },
    { label: "Net Landed Cost", value: "NetLandedCost" },
    { label: "Share of Business (%)", value: "ShareOfBusinessPercentage" },
    { label: "Weighted Net Landed Cost", value: "WeightedNetLandedCost" },
    { label: "Effective Date", value: "EffectiveDate" }
];

export const EXCHANGERATE_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Vendor (Code)", value: "vendorWithCode", },
    { label: "Customer (Code)", value: "customerWithCode", },
    { label: "From Currency", value: "FromCurrency", },
    { label: "To Currency", value: "ToCurrency", },
    { label: `Exchange Rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "CurrencyExchangeRate", },
    { label: `Bank Rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "BankRate", },
    { label: "Bank Commission (%)", value: "BankCommissionPercentage", },
    { label: `Custom Rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "CustomRate", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: "Date of Modification", value: "DateOfModification", },
    { label: "Is Budgeting", value: "IsBudgeting", },
]

export const FREIGHT_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "Mode", value: "Mode" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "Plant" },
    { label: "Customer (Code)", value: "CustomerName" },
    // { label: "Source City", value: "SourceCity" },
    // { label: "Destination City", value: "DestinationCity" },
    { label: "Load", value: "FreightLoadType" },
    { label: "Capacity", value: "Capacity" },
    { label: "Criteria", value: "RateCriteria" },
    { label: "Rate", value: "Rate" },
    { label: "Effective Date", value: "EffectiveDate" }
];


export const FUELLISTING_DOWNLOAD_EXCEl = [
    { label: "Fuel", value: "FuelName", },
    { label: "UOM", value: "UnitOfMeasurementName", },
    { label: "State", value: "StateName", },
    { label: `Rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "Rate", },
    { label: "Plant (Code)", value: "PlantWithCode", },
    { label: "Vendor (Code)", value: "VendorWithCode", },
    { label: "Customer (Code)", value: "CustomerWithCode", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: "Date of Modification", value: "ModifiedDate", },
]

export const POWERLISTING_DOWNLOAD_EXCEl = [
    { label: "State Name", value: "StateName", },
    { label: "Plant (Code)", value: "PlantWithCode", },
    { label: "Vendor (Code)", value: "VendorWithCode" },
    { label: "Customer (Code)", value: "CustomerWithCode", },
    { label: "Net Power Cost per Unit", value: "NetPowerCostPerUnit", },
    { label: "Effective Date", value: "EffectiveDate" }
]

export const INTERESTRATE_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Raw Material Name", value: "RawMaterialName", },
    { label: "Raw Material Grade", value: "RawMaterialGrade", },
    { label: "Plant (Code)", value: "PlantName", },
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "ICC Applicability", value: "ICCApplicability", },
    { label: "Annual ICC (%)", value: "ICCPercent", },
    { label: "Payment Term Applicability", value: "PaymentTermApplicability", },
    { label: "Repayment Period (Days)", value: "RepaymentPeriod", },
    { label: "Payment Term Interest Rate (%)", value: "PaymentTermPercent", },
    { label: "Effective Date", value: "EffectiveDate", }
]

export const LABOUR_DOWNLOAD_EXCEl = [
    { label: "Employment Terms", value: "IsContractBase", },
    { label: "Vendor (Code)", value: "Vendor", },
    { label: "Plant (Code)", value: "Plant", },
    { label: "State", value: "State", },
    { label: "Machine Type", value: "MachineType", },
    { label: "Labour Type", value: "LabourType", },
    { label: "Rate per Person/Annum", value: "LabourRate", },
    { label: "Effective Date", value: "EffectiveDate", }
]

export const MACHINERATE_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Machine Name", value: "MachineName" },
    { label: "Machine Number", value: "MachineNumber", },
    { label: "Machine Type", value: "MachineTypeName", },
    { label: "Machine Tonnage", value: "TonnageCapacity", },
    { label: "Process Name", value: "ProcessName", },
    { label: "UOM", value: "UOM" },
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Plant (Code)", value: "Plant", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "Machine Rate", value: "MachineRate", },
    { label: "Effective Date", value: "EffectiveDateNew", },
]

export const PROCESSLISTING_DOWNLOAD_EXCEl = [
    { label: "Process Name", value: "ProcessName", },
    { label: "Process Code", value: "ProcessCode", },
]

export const RMDOMESTIC_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "Raw Material", value: "RawMaterialName", },
    { label: "Grade", value: "RawMaterialGradeName", },
    { label: "Spec", value: "RawMaterialSpecificationName", },
    { label: "Code", value: "RawMaterialCode", },
    { label: "Category", value: "Category", },
    { label: "Material Type", value: "MaterialType", },
    { label: "Plant (Code)", value: "DestinationPlantName", },
    { label: "Vendor (code)", value: "VendorName", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "UOM", value: "UnitOfMeasurementName", },

    { label: "Cut Off Price", value: "CutOffPrice", },
    { label: "Basic Rate", value: "BasicRatePerUOM", },
    { label: "Basic Price", value: "NetCostWithoutConditionCost", },
    { label: "Net Condition Cost", value: "NetConditionCost", },
    { label: "Freight Cost", value: "RMFreightCost", },         // KEEP COMMENTED ON RE						//RE
    { label: "Shearing Cost", value: "RMShearingCost", },         // KEEP COMMENTED ON RE						//RE
    { label: "Has different Scrap Rate UOM", value: "IsScrapUOMApply", },
    { label: "Scrap UOM", value: "ScrapUnitOfMeasurement", },
    { label: "UOM To Scrap UOM Ratio", value: "UOMToScrapUOMRatio", },
    { label: "Calculated Factor", value: "CalculatedFactor", },
    { label: "Machining Scrap Rate", value: "MachiningScrapRate", },
    { label: "Circle Scrap Rate", value: "JaliScrapCost", },
    { label: "Scrap Rate", value: "ScrapRate", },
    { label: "Net Cost", value: "NetLandedCost", },
    // KEEP COMMENTED ON RE
    //  { label: "Cut Off Price", value: "CutOffPrice", },
    { label: "Effective Date", value: "EffectiveDate", },
]

export const RMIMPORT_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "Raw Material", value: "RawMaterialName", },
    { label: "Grade", value: "RawMaterialGradeName", },
    { label: "Spec", value: "RawMaterialSpecificationName", },
    { label: "Code", value: "RawMaterialCode", },
    { label: "Material Type", value: "MaterialType", },
    { label: "Category", value: "Category", },
    { label: "Plant (Code)", value: "DestinationPlantName", },
    { label: "Vendor (Code)", value: "VendorName", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "UOM", value: "UnitOfMeasurementName", },
    { label: "Currency", value: "Currency", },

    { label: "CutOff Price", value: "CutOffPrice", },
    { label: "CutOff Price Conversion", value: "CutOffPriceInINR", },
    { label: "Basic Rate", value: "BasicRatePerUOM", },
    { label: "Basic Rate Conversion", value: "BasicRatePerUOMConversion", },
    { label: "Net Condition Cost", value: "NetConditionCost", },
    { label: "Net Condition Cost Conversion", value: "NetConditionCostConversion", },
    { label: "Basic Price", value: "NetCostWithoutConditionCost", },
    { label: "Basic Price Conversion", value: "NetCostWithoutConditionCostConversion", },
    { label: "Freight Cost", value: "RMFreightCost", },         // KEEP COMMENTED ON RE						//RE
    { label: "Freight Cost Conversion", value: "RawMaterialFreightCostConversion", },         // KEEP COMMENTED ON RE						//RE
    { label: "Shearing Cost", value: "RMShearingCost", },         // KEEP COMMENTED ON RE						//RE
    { label: "Shearing Cost Conversion", value: "RawMaterialShearingCostConversion", },         // KEEP COMMENTED ON RE						//RE
    { label: "Has different Scrap Rate UOM", value: "IsScrapUOMApply", },
    { label: "Scrap UOM", value: "ScrapUnitOfMeasurement", },
    { label: "UOM To Scrap UOM Ratio", value: "UOMToScrapUOMRatio", },
    { label: "Calculated Factor", value: "CalculatedFactor", },
    { label: "Machining Scrap Rate", value: "MachiningScrapRate", },
    { label: "Machining Scrap Rate Conversion", value: "MachiningScrapRateInINR", },
    { label: "Circle Scrap Rate", value: "JaliScrapCost", },
    { label: "Circle Scrap Rate Conversion", value: "JaliScrapCostConversion", },
    { label: "Scrap Rate", value: "ScrapRate", },
    { label: "Scrap Rate Conversion", value: "ScrapRateInINR", },
    { label: "Net Landed Cost", value: "NetLandedCost", },
    { label: "Net Landed Cost Conversion", value: "NetLandedCostConversion", },

]

export const RMLISTING_DOWNLOAD_EXCEl = [
    { label: "Material", value: "RawMaterial", },
    { label: "Density", value: "Density", },
    { label: "RM Name", value: "RMName", },
    { label: "Grade", value: "RMGrade", },
]

export const RMDETAILLISTING_DOWNLOAD_EXCEl = [
    { label: "Index", value: "IndexExchangeName", },
    { label: "Commodity Name (In Index)", value: "CommodityName", },
    { label: "Commodity Name (In CIR)", value: "CustomMaterialName", },
]

export const INDEXCOMMODITYlISTING_DOWNLOAD_EXCEl = [
    { label: "Index", value: "IndexExchangeName", },
]

export const COMMODITYININDEXlISTING_DOWNLOAD_EXCEl = [
    { label: "Commodity (In Index)", value: "CommodityName", },
]
export const COMMODITYSTANDARD_DOWNLOAD_EXCEl = [
    { label: "Commodity Name (Standard)", value: "CommodityStandardName", },
]

export const RMMATERIALISTING_DOWNLOAD_EXCEl = [
    { label: "Index", value: "IndexExchangeName", },
    { label: "Commodity Name", value: "CommodityName", },
    { label: "Commodity Name (In CIR)", value: "CommodityStandardName", },
    { label: "Index UOM", value: "IndexUOM", },
    { label: "UOM", value: "UOM", },
    { label: "From Currency", value: "FromCurrency", },
    { label: "To Currency", value: "ToCurrency", },
    { label: "Exchange Rate Source", value: "ExchangeRateSourceName", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: "Index Rate/Index UOM", value: "RatePerIndexUOM", },
    { label: "Index Rate/UOM", value: "RatePerConvertedUOM", },
    { label: `Exchange rate (${reactLocalStorage.getObject("baseCurrency")})`, value: "ExchangeRate", },
    { label: "Conversion Rate/Index UOM", value: "RateConversionPerIndexUOM", },
    { label: "Conversion Rate/UOM", value: "RateConversionPerConvertedUOM", },
]

export const SPECIFICATIONLISTING_DOWNLOAD_EXCEl = [
    { label: "RM Name", value: "RMName", },
    { label: "Grade", value: "RMGrade", },
    { label: "Spec", value: "RMSpec", },
    { label: "Code", value: "RawMaterialCode", },
]
export const RMINDEXATION = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Material Name (main)", value: "RawMaterialName", },
    { label: "Material Name", value: "RawMaterialGrade", },
    { label: "Plant (Code)", value: "RawMaterialSpecification", },
    { label: "Vendor (Code)", value: "RawMaterialCode", },
    { label: "Customer (Code)", value: "MaterialType", },
    { label: "Exchange Rate Source", value: "Category", },
    { label: "Index (LME)", value: "DestinationPlantName", },
    { label: "From Date", value: "VendorName", },
    { label: "To Date", value: "CustomerName", },
    { label: "Effective Date", value: "CustomerName", },
    { label: "UOM", value: "UnitOfMeasurement", },
    { label: "Currency", value: "Currency", },
    { label: "Frequency of settlement", value: "CustomerName", },
    { label: "Index Premium(Currency)", value: "CustomerName", },
    { label: "Exchange Rate Source Premium(Currency)", value: "CustomerName", },
    { label: "Index Rate(Currency)", value: "Rate", },
    { label: "Basic rate(Base Currency)", value: "EffectiveDate", },
]
export const OPERATION_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Operation Name", value: "OperationName", },
    { label: "Operation Code", value: "OperationCode", },
    { label: "Plant (Code)", value: "Plants", },
    { label: "Vendor (Code)", value: "VendorName", },
    //MINDA
    // { label: "Company (Code)", value: "DepartmentName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "UOM", value: "UOM", },
    { label: "Rate", value: "Rate", },
    { label: "Effective Date", value: "EffectiveDate", },
]

export const OVERHEAD_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Raw Material Name", value: "RawMaterialName", },
    { label: "Raw Material Grade", value: "RawMaterialGrade", },
    { label: "Plant (Code)", value: "PlantName", },
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "Model Type", value: "ModelType", },
    { label: "Overhead Applicability", value: "OverheadApplicabilityType", },
    { label: "Overhead Applicability (%)", value: "OverheadPercentage", },
    { label: "Overhead on RM/ Part Cost (%)", value: "OverheadRMPercentage", },
    { label: "Overhead on BOP (%)", value: "OverheadBOPPercentage", },
    { label: "Overhead on CC (%)", value: "OverheadMachiningCCPercentage", },
    { label: "Effective Date", value: "EffectiveDate", },
]

export const ASSEMBLYPART_DOWNLOAD_EXCEl = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "BOM No.", value: "BOMNumber", },
    { label: "Part No.", value: "PartNumber", },
    { label: "Name", value: "PartName", },
    { label: "SAP Code", value: "SAPCode", },
    { label: "No.of Child Parts", value: "NumberOfParts", },
    { label: "BOM Level Count", value: "BOMLevelCount", },
    { label: "ECN No.", value: "ECNNumber", },
    { label: "Revision No.", value: "RevisionNumber", },
    { label: "Drawing No.", value: "DrawingNumber", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', }, //*
    { label: "Status", value: "IsActive", },

]

export const INDIVIDUALPART_DOWNLOAD_EXCEl = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No.", value: "PartNumber", },
    { label: "Name", value: "PartName", },
    { label: "SAP Code", value: "SAPCode", },
    { label: "ECN No.", value: "ECNNumber", },
    { label: "Revision No.", value: "RevisionNumber", },
    { label: "Drawing No.", value: "DrawingNumber", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: "Status", value: "IsActive", },
    { label: 'UnitOfMeasurement', value: 'UnitOfMeasurement', },

]

export const INDIVIDUAL_PRODUCT_DOWNLOAD_EXCEl = [
    { label: "Product No.", value: "ProductNumber" },
    { label: "Name", value: "ProductName" },
    { label: "Group Code", value: "ProductGroupCode" },
    { label: "ECN No.", value: "ECNNumber" },
    { label: "Revision No.", value: "RevisionNumber" },
    { label: "Drawing No.", value: "DrawingNumber" },
    { label: "Preferred for Impact Calculation", value: "IsConsideredForMBOM" },
    { label: "Effective Date", value: "EffectiveDate" },
]

export const VBCPLANT_DOWNLOAD_EXCEl = [
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Plant Name", value: "PlantName", },
    { label: "Plant Code", value: "PlantCode", },
    { label: "Country", value: "CountryName", },
    { label: "State", value: "StateName", },
    { label: "City", value: "CityName", },
]

export const REASON_DOWNLOAD_EXCEl = [
    { label: "Reason", value: "Reason", },
    { label: "Status", value: "status", }

]

export const VENDOR_DOWNLOAD_EXCEl = [
    { label: "Vendor Type", value: "VendorType", },
    { label: "Vendor Name", value: "VendorName", },
    { label: "Vendor Code", value: "VendorCode", },
    { label: "Email Id", value: "Email", },
    { label: "Phone Number", value: "PhoneNumber", },
    { label: "Ext.", value: "Extension", },
    { label: "Mobile Number", value: "MobileNumber", },
    { label: "Country", value: "Country", },
    { label: "State", value: "State", },
    { label: "City", value: "City", },
    { label: "Potential Vendor", value: "IsCriticalVendor", },
    { label: "ZipCode", value: "ZipCode", },
    { label: "Address 1", value: "AddressLine1", },
    { label: "Address 2", value: "AddressLine2", },
    { label: "Vendor Classification", value: "VendorClassification" },
    { label: "Vendor LPS Rating", value: "VendorLPSRating" },
    { label: "Status", value: "status", }
]

export const UOM_DOWNLOAD_EXCEl = [
    { label: "Unit", value: "Unit", },
    { label: "Unit Symbol", value: "UnitSymbol", },
    { label: "Unit Type", value: "UnitType", },
]

export const VOLUME_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Year", value: "Year", },
    { label: "Month", value: "Month", },
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "Plant (Code)", value: "Plant", },
    { label: "Part Type", value: "PartType", },
    { label: "Part No. (Revision No.)", value: "PartNumber", },
    { label: "Part Name", value: "PartName", },
    { label: "Budgeted Quantity", value: "BudgetedQuantity", },
    //  { label: 'BudgetedPrice', value: 'BudgetedPrice', }, //ONCE CODE DEPLOY FROM BACKEND THEN UNCOMENT THE LINE
    { label: "Actual Quantity", value: "ApprovedQuantity", },
]

export const BUDGET_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Vendor (Code)", value: "vendorNameWithCode", },
    { label: "Customer (Code)", value: "customerNameWithCode", },
    { label: "Plant (Code)", value: "plantNameWithCode", },
    { label: "Part Type", value: "PartType", },
    { label: "Part No. (Revision No.)", value: "partNoWithRevNo" },
    { label: "Financial Year", value: "FinancialYear", },
    { label: "Net Cost", value: "NetPoPrice" },
    { label: "Budgeted Net Cost", value: "BudgetedPoPrice" },
]

export const PROFIT_DOWNLOAD_EXCEl = [
    { label: "Costing Head", value: "CostingHead", },
    { label: "Raw Material Name", value: "RawMaterialName", },
    { label: "Raw Material Grade", value: "RawMaterialGrade", },
    { label: "Plant (Code)", value: "PlantName", },
    { label: "Vendor (Code)", value: "VendorName", },
    { label: "Customer (Code)", value: "CustomerName", },
    { label: "Model Type", value: "ModelType", },
    { label: "Profit Applicability", value: "ProfitApplicabilityType", },
    { label: "Profit Applicability (%)", value: "ProfitPercentage", },
    { label: "Profit on RM/ Part Cost (%)", value: "ProfitRMPercentage", },
    { label: "Profit on BOP (%)", value: "ProfitBOPPercentage", },
    { label: "Profit on CC (%)", value: "ProfitMachiningCCPercentage", },
    { label: "Effective Date", value: "EffectiveDate", },
]
export const ZBCPLANT_DOWNLOAD_EXCEl = [
    { label: "Plant Name", value: "PlantName", },
    { label: "Plant Code", value: "PlantCode", },
    { label: "Company Name", value: "CompanyName", },
    { label: "Phone Number", value: "PhoneNumber", },
    { label: "Ext.", value: "Extension", },
    { label: "Address 1", value: "AddressLine1", },
    { label: "Address 2", value: "AddressLine2", },
    { label: "Country", value: "CountryName", },
    { label: "State", value: "StateName", },
    { label: "City", value: "CityName", },
    { label: "ZipCode", value: "ZipCode", },
    { label: "Status", value: "status", },
]
export const REPORT_DOWNLOAD_EXCEl = [
    { label: "Costing Version", value: "CostingNumber", },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "Plant (Code)", value: "Plant", },
    { label: "Vendor (Code)", value: "Vendor", },
    { label: "Customer (Code)", value: "Customer", },
    { label: "Part No.", value: "PartNumber", },
    { label: "Part Name", value: "PartName", },
    { label: "ECN No.", value: "ECNNumber", },
    { label: "Part Type", value: "PartType", },
    { label: "Department Code", value: "DepartmentCode", },
    { label: "Department Name", value: "DepartmentName", },
    { label: "Revision No.", value: "RevisionNumber", },
    { label: "Code", value: "RawMaterialCode", },
    { label: "RM Name", value: "RawMaterialName", },
    { label: "Grade", value: "RawMaterialGrade", },
    { label: "Spec", value: "RawMaterialSpecification", },
    { label: "RM Rate", value: "RawMaterialRate", },
    { label: "Gross Weight", value: "RawMaterialGrossWeight", },
    { label: "Finish Weight", value: "RawMaterialFinishWeight", },
    { label: "Scrap Weight", value: "RawMaterialScrapWeight", },
    { label: "Net RM Cost", value: "NetRawMaterialsCost", },
    { label: "Net BOP Cost", value: "NetBoughtOutPartCost", },
    { label: "Net Process Cost", value: "NetProcessCost", },
    { label: "Net Operation Cost", value: "NetOperationCost", },
    { label: "Surface Treatment Cost", value: "SurfaceTreatmentCost", },
    { label: "Extra Cost", value: "TransportationCost", },
    { label: "Net Surface Treatment Cost", value: "NetSurfaceTreatmentCost", },
    { label: "Net Conversion Cost", value: "NetConversionCost", },
    { label: "Model Type", value: "ModelTypeForOverheadAndProfit", },
    { label: "Overhead Applicability", value: "OverheadApplicability", },
    { label: "Overhead Percentage", value: "OverheadPercentage", },
    { label: "Overhead Combined Cost", value: "OverheadCombinedCost", },
    { label: "Profit Applicability", value: "ProfitApplicability", },
    { label: "Profit Percentage (Overall)", value: "ProfitPercentage", },
    { label: "Profit Cost", value: "ProfitCost", },
    { label: "Net Overhead And Profit Cost", value: "NetOverheadAndProfitCost", },
    { label: "Rejection Applicability", value: "RejectionApplicability", },
    { label: "Rejection Percentage", value: "RejectionPercentage", },
    { label: "Rejection Cost", value: "RejectionCost", },
    { label: "ICC Applicability", value: "ICCApplicability", },
    { label: "ICC Interest Rate", value: "ICCInterestRate", },
    { label: "Net ICC Cost", value: "NetICCCost", },

    { label: "Overhead CC Percentage", value: "OverheadCCPercentage", },
    { label: "Overhead BOP Percentage", value: "OverheadBOPPercentage", },
    { label: "Overhead RM Percentage", value: "OverheadRMPercentage", },
    { label: "Overhead Fixed Percentage", value: "OverheadFixedPercentage", },
    { label: "Profit CC Percentage", value: "ProfitCCPercentage", },
    { label: "Profit BOP Percentage", value: "ProfitBOPPercentage", },
    { label: "Profit RM Percentage", value: "ProfitRMPercentage", },
    { label: "Profit Fixed Percentage", value: "ProfitFixedPercentage", },


    { label: "Packaging Cost Percentage", value: "PackagingCostPercentage", },
    { label: "Packaging Cost", value: "PackagingCost", },
    { label: "Freight Percentage", value: "FreightPercentage", },
    { label: "Freight Cost", value: "FreightCost", },
    { label: "Freight Type", value: "FreightType", },
    { label: "Hundi/Discount Percentage", value: "HundiOrDiscountPercentage", },
    { label: "Hundi/Discount Value", value: "HundiOrDiscountValue", },
    { label: "Tool Cost", value: "ToolCost", },
    { label: "Amortization Quantity (Tool Life)", value: "ToolLife", },
    { label: "Tool Maintenance Cost (per pcs)", value: "ToolMaintenanceCost" },
    { label: "Net Tool Cost", value: "NetToolCost", },
    { label: "Other Cost Percentage", value: "OtherCostPercentage", },
    { label: "Any Other Cost", value: "AnyOtherCost", },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Effective Date", value: "EffectiveDate", },
    { label: "Currency", value: "Currency", },
    { label: "Costing Head", value: "CostingHead", },
    { label: "Quantity", value: "NCCPartQuantity", },
    { label: "Is Regularized", value: "IsRegularized", },
    { label: "Basic Price", value: "BasicRate", },
    { label: "Payment Terms On", value: "PaymentTermsOn", },
    { label: "Payment Term Cost", value: "PaymentTermCost", },
    { label: "Net Cost Other Currency", value: "NetPOPriceOtherCurrency", },
    { label: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "NetPOPriceINR", },
    { label: "Remark", value: "Remark", },
    //MINDA
    { label: 'Status', value: 'Status' }
]

export const CombinedProcessSimulation = [         //  						//RE
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "PartName", value: "PartName" },
    { label: "PartNumber", value: "PartNumber" },
    { label: "PlantName", value: "PlantName" },
    { label: "ConversionCost", value: "ConversionCost" },
    { label: "RevisedCC", value: "NewCC" },
    { label: "RemainingTotal", value: "RemainingTotal" },
    { label: "TotalCost", value: "TotalCost" },
    { label: "EffectiveDate", value: "EffectiveDate" },
    { label: "CostingId", value: "CostingId" },
    // { label: "DisplayStatus", value: "DisplayStatus" }
    { label: "CostingTypeId", value: "CostingTypeId" }
]

export const CombinedProcessSimulationFinal = [         //  					//RE
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "PartNo", value: "PartNo" },
    { label: "PartName", value: "PartName" },
    { label: "ECNNumber", value: "ECNNumber" },
    { label: "RevisionNumber", value: "RevisionNumber" },
    { label: "VendorName", value: "VendorName" },
    { label: "ExistingCC", value: "OldCC" },
    { label: "RevisedCC", value: "NewCC" },
    { label: "Variance", value: "Variance" },
    { label: "Actions", value: "Actions" },
    { label: "CostingId", value: "CostingId" },
    { label: "Status", value: "Status", },
]

export const REPORT_DOWNLOAD_SAP_EXCEl = [
    { label: "Sr No", value: "SrNo" }, //Serial no
    { label: "evrtn", value: "SANumber" },//SA no
    { label: "ebelp", value: "LineNumber" },//Line no
    { label: "datab", value: "CreatedDate", },//Date
    { label: "kbetr", value: "NetPOPrice" }, //Price
    { label: "Reason", value: "Reason" }, //Reason
    { label: "Text", value: "Text" }, //Text
    { label: "Person Requesting Change", value: "PersonRequestingChange" }, //Person CLICKING DOWNLOAD BUTTON (lOGGED IN USER)
]

export const decimalOption = [
    { label: 'Round Off', value: 'RoundOff' },
    { label: 'Truncate', value: 'Truncate' },
    { label: 'Per 100', value: 'Per100' },
]

export const ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl = [
    { label: "Assembly Number", value: "PartNumber", },
    { label: "Revision Number", value: "RevisionNumber", },
    { label: "Name", value: "PartName", },
    { label: "Child's Level", value: "Level", },
    { label: "Existing Net Cost/Assembly", value: "OldPrice", },
    { label: "Revised Net Cost/Assembly", value: "NewPrice", },
    { label: "Variance/Assembly (w.r.t. Existing)", value: "Variance", },

]


export const USER_LISTING_DOWNLOAD_EXCEl = [
    { label: "Name", value: "FullName", },
    { label: "User Name", value: "UserName", },
    { label: "Vendor(code)", value: "VendorName", },
    { label: "Email Id", value: "EmailAddress", },
    { label: "Mobile No", value: "Mobile", },
    { label: "Phone No", value: "PhoneNumber", },
    { label: "Point of Contact", value: "PointOfContact", },
    { label: "Department", value: "DepartmentName", },
    { label: "Role", value: "RoleName", },
    { label: "Created By", value: "CreatedBy", },
    { label: "Created Date (Created Time)", value: "CreatedDateExcel", },
    { label: "Modified Date (Modified Time)", value: "ModifiedDateExcel", },
    { label: "Modified By", value: "ModifiedBy", },
    { label: "Status", value: "status", },
    { label: "Created Date (Created Time)", value: "CreatedDate", },
    { label: "Modified Date (Modified Time)", value: "ModifiedDate", },
]

export const AUDIT_LISTING_DOWNLOAD_EXCEl = [
    { label: "User Name", value: "UserName", },
    { label: "IP Address", value: "IPAddress", },
    { label: "User Agent", value: "UserAgent", },
    { label: "Login Date - Login Time", value: "LoginTime", },


]

export const RM_IMPACT_DOWNLOAD_EXCEl = [
    { label: "Raw Material", value: "RawMaterialName", },
    { label: "Grade", value: "RawMaterialGradeName", },
    { label: "Spec", value: "RawMaterialSpecificationName", },
    { label: "Code", value: "RawMaterialCode", },
    { label: "UOM", value: "UnitOfMeasurementName", },
    { label: "Currency", value: "Currency" },
    { label: "Existing Basic Rate", value: "OldBasicRate", },
    { label: "Revised Basic Rate", value: "NewBasicRate", },
    { label: "Existing Scrap Rate", value: "OldScrapRate", },
    { label: "Revised Scrap Rate", value: "NewScrapRate", },
    { label: "Freight Cost", value: "RMFreightCost", },
    { label: "Shearing Cost", value: "RMShearingCost", },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]
export const RM_IMPACT_DOWNLOAD_EXCEl_IMPORT = [
    { label: "Raw Material", value: "RawMaterialName", },
    { label: "Grade", value: "RawMaterialGradeName", },
    { label: "Spec", value: "RawMaterialSpecificationName", },
    { label: "Code", value: "RawMaterialCode", },
    { label: "UOM", value: "UnitOfMeasurementName", },
    { label: "Currency", value: "Currency" },
    { label: "Existing Basic Rate", value: "OldBasicRate", },
    { label: "Revised Basic Rate", value: "NewBasicRate", },
    { label: "Existing Scrap Rate", value: "OldScrapRate", },
    { label: "Revised Scrap Rate", value: "NewScrapRate", },
    { label: "Freight Cost", value: "RMFreightCost", },
    { label: "Shearing Cost", value: "RMShearingCost", },
    { label: "Existing Net Cost (Currency)", value: "OldNetLandedCost" },
    { label: "Revised Net Cost (Currency)", value: "NewNetLandedCost" },
    { label: `Existing Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "OldRMNetLandedCostConversion" },
    { label: `Revised Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "NewRMNetLandedCostConversion" },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]

export const BOP_IMPACT_DOWNLOAD_EXCEl = [
    { label: "BOP Part No", value: "BoughtOutPartNumber", },
    { label: "BOP Part Name", value: "BoughtOutPartName", },
    { label: "Existing Basic Rate", value: "OldBOPRate", },
    { label: "Revised Basic Rate", value: "NewBOPRate", },
    { label: "Minimum Order Quantity", value: "Quantity", },
    { label: "Existing Net Cost", value: "OldNetBoughtOutPartCost", },
    { label: "Revised Net Cost", value: "NewNetBoughtOutPartCost", },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]
export const BOP_IMPACT_DOWNLOAD_EXCEl_IMPORT = [
    { label: "BOP Part No", value: "BoughtOutPartNumber", },
    { label: "BOP Part Name", value: "BoughtOutPartName", },
    { label: "Existing Basic Rate", value: "OldBOPRate", },
    { label: "Revised Basic Rate", value: "NewBOPRate", },
    { label: "Minimum Order Quantity", value: "Quantity", },
    { label: "Currency", value: "Currency" },
    { label: "Existing Net Cost", value: "OldNetBoughtOutPartCost", },
    { label: "Revised Net Cost", value: "NewNetBoughtOutPartCost", },
    { label: `Existing Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "OldBoughtOutPartNetLandedCostConversion" },
    { label: `Revised Net Cost (${reactLocalStorage.getObject("baseCurrency")})`, value: "NewBoughtOutPartNetLandedCostConversion" },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]

export const MACHINE_IMPACT_DOWNLOAD_EXCEl = [
    { label: "Machine Name", value: "MachineName", },
    { label: "Machine Number", value: "MachineNumber", },
    { label: "Process Name", value: "ProcessName", },
    { label: "Existing Machine Rate", value: "OldMachineRate", },
    { label: "Revised Machine Rate", value: "NewMachineRate", },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]

export const OPERATION_IMPACT_DOWNLOAD_EXCEl = [
    { label: "Operation Type", value: "ForType", },
    { label: "Operation Name", value: "OperationName", },
    { label: "Operation Code", value: "OperationCode", },
    { label: "Consumption", value: "OldOperationConsumption", },
    { label: "Existing Welding Material Rate/Kg", value: "OldOperationBasicRate", },
    { label: "Revised Welding Material Rate/Kg", value: "NewOperationBasicRate", },
    { label: "Existing Net Rate", value: "OldOperationRate", },
    { label: "Revised Net Rate", value: "NewOperationRate", },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]

export const EXCHANGE_IMPACT_DOWNLOAD_EXCEl = [
    { label: "Currency", value: "Currency", },
    { label: `Bank Rate(${reactLocalStorage.getObject("baseCurrency")})`, value: "BankRate", },
    { label: "Bank Commission %", value: "BankCommissionPercentage", },
    { label: `Custom Rate(${reactLocalStorage.getObject("baseCurrency")})`, value: "CustomRate", },
    { label: `Existing Exchange Rate(${reactLocalStorage.getObject("baseCurrency")})`, value: "OldExchangeRate", },
    { label: `Revised Exchange Rate(${reactLocalStorage.getObject("baseCurrency")})`, value: "NewExchangeRate", },
    { label: "Previous Min.", value: "PreviousMinimum", },
    { label: "Previous Max.", value: "PreviousMaximum", },
    { label: "Previous Avg.", value: "PreviousAverage", },
    { label: "Current Min.", value: "Minimum", },
    { label: "Current Max.", value: "Maximum", },
    { label: "Current Avg.", value: "Average", },
    { label: "Current Effective date", value: "EffectiveDate", },
]


export const OperationGridForToken = [
    { label: "Operation Name", value: "OperationName" },
    { label: "Operation Code", value: "OperationCode" },
    { label: "Operation Quantity", value: "Quantity" },
    { label: "ExistingOperationCost", value: "OldOperationCost" },
    { label: "RevisedOperationCost", value: "NewOperationCost" },
    { label: "Variance (Oper. Cost)", value: "OperationCostVariance" },

]

export const RMGridForToken = [
    { label: "Existing RM Cost/Pc", value: "OldNetRawMaterialsCost" },
    { label: 'Revised RM Cost/Pc', value: 'NewNetRawMaterialsCost' },
    { label: "Variance (RM Cost)", value: "RMVariance" }
]

export const STGridForToken = [
    { label: "ExistingSTRate", value: "OldSurfaceTreatmentRate" },
    { label: "RevisedSTRate", value: "NewSurfaceTreatmentRate" },
    { label: "SurfaceArea", value: "SurfaceArea" },
    { label: "ExistingSTCost", value: "OldSurfaceTreatmentCost" },
    { label: "RevisedSTCost", value: "NewSurfaceTreatmentCost" },
    { label: "ExistingTranspotationCost", value: "OldTranspotationCost" },
    { label: "RevisedTranspotationCost", value: "NewTranspotationCost" },
    { label: "ExistingNetSTCost", value: "OldNetSurfaceTreatmentCost" },
    { label: "RevisedNetSTCost", value: "NewNetSurfaceTreatmentCost" },
    { label: "Variance (ST Cost)", value: "STVariance" },

]

export const BOPGridForToken = [
    { label: "BOP Quantity", value: "BoughtOutPartQuantity" },
    { label: "ExistingBOPCost", value: "OldNetBoughtOutPartCost" },
    { label: "RevisedBOPCost", value: "NewNetBoughtOutPartCost" },
    { label: "Variance (BOP Cost)", value: "NetBoughtOutPartCostVariance" },
]
export const ERGridForToken = [
    { label: "Currency", value: "Currency" },
    { label: "ExistingPOPrice", value: "OldPOPrice" },
    { label: "ExistingNetPOPriceOtherCurrency", value: "OldNetPOPriceOtherCurrency" },
    { label: "RevisedNetPOPriceOtherCurrency", value: "NewNetPOPriceOtherCurrency" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "ExistingExchangeRate", value: "OldExchangeRate" },
    { label: "RevisedExchangeRate", value: "NewExchangeRate" },
]

export const ExchangeRateGridForToken = [         // KEEP COMMENTED ON RE						//RE
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "OldOperationRate", value: "OldOperationRate" },
    { label: "NewOperationRate", value: "NewOperationRate" },
    { label: "OperationVariance", value: "OperationVariance" },
    { label: "OldOperationCost", value: "OldOperationCost" },
    { label: "NewOperationCost", value: "NewOperationCost" },
    { label: "OperationCostVariance", value: "OperationCostVariance" },

]

export const InitialGridForToken = [

    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant", value: "PlantName" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
]

export const LastGridForToken = [
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const InitialGridForTokenSummary = [

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Plant", value: "PlantName" },
    { label: "Plant Code", value: "PlantCode" },
]

export const LastGridForTokenSummary = [
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Draft Net Cost", value: "DraftPOPrice" },
]

export const OperationGridForTokenSummary = [
    { label: "Operation Name", value: "OperationName" },
    { label: "Operation Code", value: "OperationCode" },
    { label: "Existing Operation Cost", value: "OldOperationCost" },
    { label: "Revised Operation Cost", value: "NewOperationCost" },
    { label: "Variance (Oper. Cost)", value: "OperationCostVariance" },

]

export const RMGridForTokenSummary = [
    { label: "RawMaterial Name", value: "RMName" },
    { label: "Grade", value: "RMGrade" },
    { label: "Code", value: "RMCode" },
    { label: "Spec", value: "RMSpecs" },
    { label: "Existing RM Cost", value: "OldRMPrice" },
    { label: "Revised RM Cost", value: "NewRMPrice" },
    { label: "Variance (RM Cost)", value: "RMVariance" },

]

export const STGridForTokenSummary = [
    { label: "Operation Name", value: "OperationName" },
    { label: "Operation Code", value: "OperationCode" },
    { label: "Existing Net ST Cost", value: "OldNetSurfaceTreatmentCost" },
    { label: "Revised Net ST Cost", value: "NewNetSurfaceTreatmentCost" },
    { label: "Variance (ST Cost)", value: "NetSurfaceTreatmentCostVariance" },
]

export const BOPGridForTokenSummary = [
    { label: "BOP Name", value: "BoughtOutPartName" },
    { label: "BOP Number", value: "BoughtOutPartNumber" },
    { label: "Existing BOP Cost", value: "OldBOPCost" },
    { label: "Revised BOP Cost", value: "NewBOPCost" },
    { label: "Variance (BOP Cost)", value: "NetBoughtOutPartCostVariance" },
]

export const CPGridForToken = [         // KEEP COMMENTED ON RE						//RE
    { label: 'Existing Net CC', value: 'OldNetCC' },
    { label: "Revised Net CC", value: "NewNetCC" },
    { label: "Variance", value: "CPVariance" },
]

export const CPGridForTokenSummary = [         // KEEP COMMENTED ON RE						//RE
    { label: 'Existing Net CC', value: 'OldNetCC' },
    { label: "Revised Net CC", value: "NewNetCC" },
    { label: "Variance", value: "Variance" },
]

export const ImpactedRMDownload = [
    { label: "RawMaterial", value: "RawMaterial" },
    { label: "Grade", value: "RMGrade" },
    { label: "Spec", value: "RMSpec" },
    { label: "Code", value: "RawMaterialCode" },
    { label: "Category", value: "Category" },
    { label: "TechnologyLabel", value: "TechnologyName", defaultValue: "Technology" },
    { label: "VendorName", value: "VendorName" },
    { label: "UOM", value: "UOM" },
    { label: "ExistingBasicRate", value: "OldBasicRate" },
    { label: "RevisedBasicRate", value: "NewBasicRate" },
    { label: "ExistingScrapRate", value: "OldScrapRate" },
    { label: "RevisedScrapRate", value: "NewScrapRate" },
    { label: "RMFreightCost", value: "RMFreightCost" },         // KEEP COMMENTED ON RE						//RE
    { label: "RMShearingCost", value: "RMShearingCost" },         // KEEP COMMENTED ON RE						//RE
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const ImpactedBOPDownload = [
    { label: "BoughtOutPartNumber", value: "BoughtOutPartNumber" },
    { label: "BoughtOutPartName", value: "BoughtOutPartName" },
    { label: "Category", value: "Category" },
    { label: "Vendor", value: "Vendor" },
    { label: "PartNumber", value: "PartNumber" },
    { label: "ExistingBOPRate", value: "OldBOPRate" },
    { label: "RevisedBOPRate", value: "NewBOPRate" },
    { label: "ExistingPOPrice", value: "OldPOPrice" },
    { label: "RevisedPOPrice", value: "NewPOPrice" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]
export const ImpactedOPERATIONDownload = [
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "UOM", value: "UOM" },
    { label: "ExistingOperationRate", value: "OldOperationRate" },
    { label: "RevisedOperationRate", value: "NewOperationRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]
export const ImpactedSTDownload = [
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "VendorName", value: "VendorName" },
    { label: "OperationName", value: "OperationName" },
    { label: "OperationCode", value: "OperationCode" },
    { label: "DestinationPlant", value: "DestinationPlant" },
    { label: "Plants", value: "Plants" },
    { label: "Rate", value: "Rate" },
    { label: "RevisedRate", value: "NewRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const ImpactedERDownload = [
    { label: "Currency", value: "Currency" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "PartNumber", value: "PartNumber" },
    { label: "BankRate", value: "BankRate" },
    { label: "BankCommissionPercentage", value: "BankCommissionPercentage" },
    { label: "CustomRate", value: "CustomRate" },
    { label: "CurrencyExchangeRate", value: "CurrencyExchangeRate" },
    { label: "RevisedExchangeRate", value: "NewExchangeRate" },
    { label: "ExistingExchangeRate", value: "OldExchangeRate" },
    { label: "EffectiveDate", value: "EffectiveDate" },
]

export const EXCHANGESIMULATIONDOWNLOAD = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Currency", value: "Currency" },
    { label: "Existing Exchange Rate", value: "OldExchangeRate" },
    { label: "RevisedExchangeRate", value: "NewExchangeRate" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "ExistingNetPOPriceOtherCurrency", value: "OldNetPOPriceOtherCurrency" },
    { label: "RevisedNetPOPriceOtherCurrency", value: "NewNetPOPriceOtherCurrency" },
    { label: "Net Cost", value: "OldPOPrice" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
]

export const CostingSimulationDownloadMR = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SA Number", value: "SANumber" },
    { label: "Line Number", value: "LineNumber" },
    { label: "Quantity", value: "Quantity" },
    { label: "MachineName", value: "MachineName" },
    { label: "MachineNumber", value: "MachineNumber" },
    { label: "ProcessName", value: "ProcessName" },
    { label: "ProcessCode", value: "ProcessCode" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "ExistingMachineRate", value: "OldMachineRate" },
    { label: "RevisedMachineRate", value: "NewMachineRate" },
    { label: "Variance (MR cost)", value: "MRVariance" },
    { label: "ExistingProcessCost", value: "OldProcessCost" },
    { label: "RevisedProcessCost", value: "NewProcessCost" },
    { label: "Variance (Proc. Cost)", value: "ProcessCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const MRGridForToken = [
    { label: "ExistingNetProcessCost", value: "OldNetProcessCost" },
    { label: "RevisedNetProcessCost", value: "NewNetProcessCost" },
    { label: "Variance (Proc. Cost)", value: "NetProcessCostVariance" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADMR = [

    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "Part Type", value: "PartType" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "SANumber", value: "SANumber", },
    { label: "LineNumber", value: "LineNumber", },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant (Code)", value: "PlantName" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Budgeted Price", value: "BudgetedPrice" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "Existing Net Process Cost", value: "OldNetProcessCost" },
    { label: "Revised Net Process Cost", value: "NewNetProcessCost" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
]

export const MRGridForTokenSummary = [
    { label: "Process Name", value: "ProcessName" },
    { label: "Process Code", value: "ProcessCode" },
    { label: "Existing Net Process Cost", value: "OldNetProcessCost" },
    { label: "Revised Net Process Cost", value: "NewNetProcessCost" },
    { label: "Variance (Proc. Cost)", value: "NetProcessCostVariance" },
]

export const RMImpactedDownloadArray = ["RawMaterial", "RMGrade", "RMSpec", "RawMaterialCode", "Category", "UOM", "TechnologyName", "Vendor", "ExistingBasicRate", "RevisedBasicRate", "ExistingScrapRate", "RevisedScrapRate", "RMFreightCost", "RMShearingCost", "CurrentEffectiveDate"]
// KEEP COMMENTED ON RE   "RMFreightCost", "RMShearingCost",						//RE
export const OperationImpactDownloadArray = ["OperationName", "OperationCode", "UOM", "ExistingOperationRate", "RevisedOperationRate", "CurrentEffectiveDate",]

export const STOperationImpactDownloadArray = ["STOperationName", "OperationCode", "UOM", "ExistingOperationRate", "RevisedOperationRate", "CurrentEffectiveDate",]

export const BOPImpactDownloadArray = ["BoughtOutPartNumber", "BoughtOutPartName", "Category", "Vendor", "ExistingBOPRate", "RevisedBOPRate", "CurrentEffectiveDate",]

export const ERImpactDownloadArray = ["Currency", "BankRate", "BankCommissionPercentage", "CustomRate", "CurrencyExchangeRate", "ExistingExchangeRate", "RevisedExchangeRate", "CurrentEffectiveDate",]

export const MachineImpactDownloadArray = ['MachineName', 'MachineNumber', 'MachineTypeName', 'ProcessName', 'ProcessCode', 'UOM', 'Vendor', 'ExistingMachineRate', 'RevisedMachineRate', 'CurrentEffectiveDate']

export const CPImpactDownloadArray = ["CostingNumber", "PartNumber", "ExistingNetCC", "RevisedNetCC", "ExistingPOPrice", "RevisedPOPrice", "EffectiveDate"]         // KEEP COMMENTED ON RE						//RE

export const RawMaterialDomesticFileHeads = ["CostingHead", "RawMaterial", "Grade", "Spec", "Code", "Category", "Technology"]

export const RawMaterialImportFileHeads = ["CostingHead", "RawMaterial", "Grade", "Spec", "Code", "Category", "Technology"]

export const OperationFileHeads = ['Technology', 'CostingHead', 'OperationName', 'OperationCode']

export const BoughtOutPartDomesticFileHeads = ['CostingHead', 'BoughtOutPartNumber', 'BoughtOutPartName', 'BoughtOutPartCategory']

export const BoughtOutPartImportFileHeads = ['CostingHead', 'BoughtOutPartNumber', 'BoughtOutPartName', 'BoughtOutPartCategory']

export const MachineRateFileHeads = ['CostingHead', 'Technology', 'MachineName', 'MachineNumber']

export const CombinedProcessFileHeads = ['TechnologyName', 'PartName', 'PartNumber', 'PlantName', 'ConversionCost']         // KEEP COMMENTED ON RE						//RE
export const TechnologyDropdownBulkUploadV1 = [
    { label: 'Mechanical Proprietary, Sheet Metal, Hardware, Spring, Rivet', value: '1' },
    { label: 'Rubber, Plastic, Die Costing', value: '2' },
    { label: 'Forging, Machining, Turn Part', value: '3' }
]

export const TechnologyDropdownBulkUploadV2 = [
    { label: 'Mechanical Proprietary, Sheet Metal, Hardware, Spring, Rivet', value: '1' },
    { label: 'Rubber, Plastic, Die Costing, Corrugated Box (EPS / Label & Manual)', value: '2' },
    { label: 'Forging, Machining, Turn Part', value: '3' },
    { label: 'Corrugated Box', value: '4' },
    { label: 'Assembly', value: '5' },
    { label: 'Wiring Harness', value: '6' }
]
// export const TechnologyDropdownBulkUpload = [
//     { label: 'Mechanical Proprietary, Sheet Metal, Hardware, Spring, Rivet', value: '1' },
//     { label: 'Rubber, Plastic, Die Costing, Corrugated Box (EPS / Label & Manual)', value: '2' },
//     { label: 'Forging, Machining, Turn Part', value: '3' },
//     { label: 'Corrugated Box', value: '4' },
//     { label: 'Assembly', value: '5' },
//     { label: 'Wiring Harness', value: '6' }
// ]
export const TechnologyDropdownBulkUploadV4 = [
    { label: 'Mechanical Proprietary, Sheet Metal, Hardware, Rivet, Wire Forming , Sintered Proprietary , Electronics ,Extrusion', value: '1' },
    { label: 'Rubber, Plastic,Corrugated Box (EPS / Label & Manual)', value: '2' },
    { label: 'Forging, Machining, Springs', value: '3' },
    { label: 'Corrugated Box', value: '4' },
    { label: 'Assembly , Electrical Proprietary', value: '5' },
    { label: 'Wiring Harness', value: '6' },
    { label: 'Die Casting', value: '7' },
    { label: 'Electrical Stamping', value: '12' },
    { label: 'Insulation', value: '11' },
    { label: 'Monocarton', value: '13' }
]


export const constRMCCTabData = [{
    JsonStage: "_assemblyCosting",
    CostingId: "1f91aba6-d4e8-48be-8a21-e24e8af5803f",
    AssemblyCostingId: "1f91aba6-d4e8-48be-8a21-e24e8af5803f",
    CostingNumber: "ASY-124001",
    Version: "1.0.43.989",
    CostingDate: "2022-03-21T15:06:23.177",
    CreatedBy: "Chandler",
    ShareOfBusinessPercent: 0,
    PlantId: null,
    PlantName: null,
    PlantCode: null,
    VendorType: "VBC",
    VendorId: "4d0df0c4-4b19-40d1-bd7d-d7932c241b19",
    VendorName: "0101KN",
    VendorCode: "0101KN",
    VendorPlantId: null,
    VendorPlantName: null,
    VendorPlantCode: null,
    TechnologyId: 13,
    Technology: "Assembly",
    IsScrapRecoveryPercentageApplied: false,
    PartTypeId: 1,
    PartType: "Assembly",
    AssemblyPartId: "75dc678a-3b90-4c88-a4cd-64f81bd0fdf5",
    AssemblyPartNumber: "32",
    AssemblyPartName: "XYZ",
    PartId: "75dc678a-3b90-4c88-a4cd-64f81bd0fdf5",
    PartNumber: "32",
    PartName: "XYZ",
    BOMLevel: "L0",
    IsAssemblyPart: true,
    Quantity: 5,
    CostPerPiece: undefined,
    CostPerAssembly: undefined,
    QuantityForSubAssembly: 68,
    IsLocked: false,
    IsPartLocked: false,
    CostingPartDetails: [{
        JsonStage: "_part",
        AssemblyPartId: "75dc678a-3b90-4c88-a4cd-64f81bd0fdf5",
        AssemblyPartNumber: "32",
        AssemblyPartName: "XYZ",
        PartId: "75dc678a-3b90-4c88-a4cd-64f81bd0fdf5",
        PartNumber: "32",
        PartName: "XYZ",
        BOMNumber: null,
        BOMLevel: "L0",
        CostingDetailId: null,
        PartTypeId: 1,
        PartType: "Assembly",
        IsApplyBOPHandlingCharges: null,
        BOPHandlingPercentage: null,
        BOPHandlingCharges: null,
        TotalRawMaterialsCost: 0,
        TotalBoughtOutPartCost: 0,
        TotalConversionCost: 0,
        TotalProcessCost: 0,
        TotalOperationCost: 0,
        TotalOtherOperationCost: null,
        TotalToolCost: 0,
        BoughtOutPartUOM: null,
        BoughtOutPartRate: null,
        TotalCalculatedRMBOPCCCost: 0,
        TotalRawMaterialsCostWithQuantity: 0,
        TotalBoughtOutPartCostWithQuantity: 0,
        TotalCalculatedRMBOPCCCostWithQuantity: 0,
        TotalCalculatedRMBOPCCCostPerAssembly: 0,
        TotalConversionCostWithQuantity: 0,
        Quantity: 5,
        CostPerPiece: undefined,
        CostPerAssembly: undefined,
        QuantityForSubAssembly: 1,
        GrandTotalCost: 0,
        IsOpen: false,
        IsShowToolCost: false,
        IsToolCostProcessWise: false,
        IsAssemblyPart: true,
        Sequence: 0,
        TotalOperationCostSubAssembly: 0,
        TotalOperationCostComponent: 0,
        TotalOperationCostPerAssembly: 0,
        TotalOtherOperationCostPerAssembly: 0,
        TotalOtherOperationCostPerSubAssembly: 0,
        TotalToolCostPerAssembly: 0,
        CostingOperationCostResponse: [],
        CostingToolCostResponse: [],
        TempRM: null,
        TempBOP: null,
        TempCC: null,
        TempRMBOPCC: null,
        IsLocked: false,
        IsPartLocked: false,

    }],
    CostingChildPartDetails:
        [{
            JsonStage: "_apart",
            IsCostingLocked: false,
            AssemblyPartId: "75dc678a-3b90-4c88-a4cd-64f81bd0fdf5",
            AssemblyCostingId: "1f91aba6-d4e8-48be-8a21-e24e8af5803f",
            AssemblyPartNumber: "32",
            AssemblyPartName: "XYZ",
            SubAssemblyCostingId: "1f91aba6-d4e8-48be-8a21-e24e8af5803f",
            CostingId: "170c08fd-975d-4cdc-8815-6097af59221a",
            PartId: "462ce172-f569-473c-a3d7-8a0875858bfa",
            PartNumber: " BOM RM-1000393",
            PartName: " BOM RM-1000393",
            BOMNumber: null,
            BOMLevel: "L1",
            ParentCostingDetailId: null,
            CostingDetailId: null,
            PartTypeId: 1,
            PartType: "Sub Assembly",
            IsScrapRecoveryPercentageApplied: false,
            Quantity: 5,
            CostPerPiece: undefined,
            CostPerAssembly: undefined,
            QuantityForSubAssembly: 68,
            IsOpen: false,
            IsShowToolCost: null,
            IsAssemblyPart: true,
            Sequence: 0,
            IsLocked: false,
            IsPartLocked: false,
            CostingPartDetails: {
                JsonStage: "_innerPartDetail",
                AssemblyPartId: null,
                AssemblyPartNumber: null,
                AssemblyPartName: null,
                PartId: null,
                PartNumber: null,
                PartName: null,
                BOMNumber: null,
                BOMLevel: null,
                CostingDetailId: null,
                PartTypeId: null,
                PartType: null,
                IsApplyBOPHandlingCharges: null,
                BOPHandlingPercentage: null,
                BOPHandlingCharges: null,
                TotalRawMaterialsCost: 0,
                TotalBoughtOutPartCost: 0,
                TotalConversionCost: 0,
                TotalProcessCost: 0,
                TotalOperationCost: 0,
                TotalOtherOperationCost: null,
                TotalToolCost: 0,
                BoughtOutPartUOM: null,
                BoughtOutPartRate: null,
                TotalCalculatedRMBOPCCCost: 0,
                TotalRawMaterialsCostWithQuantity: 0,
                TotalBoughtOutPartCostWithQuantity: 0,
                TotalCalculatedRMBOPCCCostWithQuantity: 0,
                TotalCalculatedRMBOPCCCostPerAssembly: 0,
                TotalConversionCostWithQuantity: 0,
                Quantity: 5,
                CostPerPiece: undefined,
                CostPerAssembly: undefined,
                QuantityForSubAssembly: 68,
                GrandTotalCost: null,
                IsOpen: false,
                IsShowToolCost: null,
                IsToolCostProcessWise: null,
                IsAssemblyPart: null,
                Sequence: null,
                TotalOperationCostSubAssembly: 0,
                TotalOperationCostComponent: 0,
                TotalOperationCostPerAssembly: null,
                TotalOtherOperationCostPerAssembly: 0,
                TotalOtherOperationCostPerSubAssembly: 0,
                TotalToolCostPerAssembly: null,
                CostingOperationCostResponse: null,
                CostingToolCostResponse: null,
                TempRM: null,
                TempBOP: null,
                TempCC: null,
                TempRMBOPCC: null,
                IsLocked: false,
                IsPartLocked: false,

            },
            CostingChildPartDetails: []
        }]
}]

export const tempObject = [
    {
        "JsonStage": "_assemblyCosting",
        "CostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
        "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
        "CostingNumber": "ASY-123800",
        "Version": "1.0.76.1292",
        "CostingDate": "2022-03-24T16:21:17.39",
        "CreatedBy": "Rushaliii",
        "ShareOfBusinessPercent": 0,
        "PlantId": null,
        "PlantName": null,
        "PlantCode": null,
        "VendorType": "VBC",
        "VendorId": "bcffb6f5-d9e8-403a-aa6f-85c92ba95f2d",
        "VendorName": "Dummy Vendor ",
        "VendorCode": "07102021",
        "VendorPlantId": null,
        "VendorPlantName": null,
        "VendorPlantCode": null,
        "TechnologyId": 13,
        "Technology": "Assembly",
        "IsScrapRecoveryPercentageApplied": false,
        "PartTypeId": 1,
        "PartType": "Assembly",
        "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
        "AssemblyPartNumber": "03022022",
        "AssemblyPartName": "03022022",
        "PartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
        "PartNumber": "03022022",
        "PartName": "03022022",
        "BOMLevel": "L0",
        "IsAssemblyPart": true,
        "IsLocked": null,
        "IsPartLocked": false,
        "IsCostingLocked": false,
        "CostPerPiece": 43,
        "NetChildPartsCost": undefined,
        "Quantity": 1,


        "CostingPartDetails": {
            "JsonStage": "_part",
            "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
            "AssemblyPartNumber": "03022022",
            "AssemblyPartName": "03022022",
            "PartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
            "PartNumber": "03022022",
            "PartName": "03022022",
            "BOMNumber": null,
            "BOMLevel": "L0",
            "CostingDetailId": null,
            "PartTypeId": 1,
            "PartType": "Assembly",
            "IsApplyBOPHandlingCharges": null,
            "BOPHandlingPercentage": null,
            "BOPHandlingCharges": null,
            "TotalRawMaterialsCost": 0,
            "TotalBoughtOutPartCost": 0,
            "TotalConversionCost": 0,
            "TotalProcessCost": 0,
            "TotalOperationCost": 0,
            "TotalOtherOperationCost": null,
            "TotalToolCost": 0,
            "BoughtOutPartUOM": null,
            "BoughtOutPartRate": null,
            "TotalCalculatedRMBOPCCCost": 0,
            "TotalRawMaterialsCostWithQuantity": 0,
            "TotalBoughtOutPartCostWithQuantity": 0,
            "TotalCalculatedRMBOPCCCostWithQuantity": 0,
            "TotalCalculatedRMBOPCCCostPerAssembly": 0,
            "TotalConversionCostWithQuantity": 0,
            "CostPerPiece": undefined,
            "NetChildPartsCost": undefined,
            "Quantity": 1,
            "GrandTotalCost": 0,
            "IsOpen": false,
            "IsShowToolCost": false,
            "IsToolCostProcessWise": false,
            "IsAssemblyPart": true,
            "Sequence": 0,
            "TotalOperationCostSubAssembly": 0,
            "TotalOperationCostComponent": 0,
            "TotalOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerSubAssembly": 0,
            "TotalToolCostPerAssembly": 0,
            "CostingOperationCostResponse": [],
            "CostingToolCostResponse": [],
            "TempRM": null,
            "TempBOP": null,
            "TempCC": null,
            "TempRMBOPCC": null,
            "IsLocked": null,
            "IsPartLocked": false,
            "CostingConversionCost": {
                "IsShowToolCost": false,
                "ProcessCostTotal": 0,
                "OperationCostTotal": 0,
                "OtherOperationCostTotal": null,
                "ToolsCostTotal": 0,
                "NetConversionCost": 0,
                "IsProcessCostChanged": null,
                "CostingProcessCostResponse": [],
                "CostingGroupWiseProcessCostResponse": null,
                "IsOperationCostChanged": null,
                "CostingOperationCostResponse": [],
                "CostingOtherOperationCostResponse": [],
                "IsToolCostChanged": null,
                "CostingToolsCostResponse": []
            }
        },
        "CostingChildPartDetails": [
            // Bop11    
            {
                "JsonStage": "_apart",
                "IsLocked": null,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
                "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "AssemblyPartNumber": "03022022",
                "AssemblyPartName": "03022022",
                "SubAssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "CostingId": null,
                "PartId": "21444211-078c-4f77-876b-45369efb6528",
                "PartNumber": "011",
                "PartName": "Bop11",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 3,
                "PartType": "BOP",
                "IsScrapRecoveryPercentageApplied": null,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,

                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": null,
                    "TotalOperationCost": null,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": null,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": 0,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": null,
                    "TotalBoughtOutPartCostWithQuantity": null,
                    "TotalCalculatedRMBOPCCCostWithQuantity": null,
                    "TotalCalculatedRMBOPCCCostPerAssembly": null,
                    "TotalConversionCostWithQuantity": null,
                    "CostPerPiece": 50,
                    // "NetChildPartsCost": 1000,
                    "CostPerAssemblyBOP": 1000,
                    "Quantity": 20,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": null,
                    "TotalOperationCostComponent": null,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerSubAssembly": null,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null,
                    "IsLocked": null,
                    "IsPartLocked": false,

                },
                "CostingChildPartDetails": []
            },
            // LOWER CROSS BEAM FABRICATED 
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
                "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "AssemblyPartNumber": "03022022",
                "AssemblyPartName": "03022022",
                "SubAssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "CostingId": "7f0273e4-36f4-434a-8db6-734f359cb8b9",
                "PartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
                "PartNumber": "010101",
                "PartName": "LOWER CROSS BEAM FABRICATED",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 1,
                "PartType": "Sub Assembly",
                "IsScrapRecoveryPercentageApplied": false,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": true,
                "Sequence": 0,

                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 50.75,
                    "TotalBoughtOutPartCost": 55,
                    "TotalConversionCost": 303.1,
                    "TotalProcessCost": 3.1,
                    "TotalOperationCost": 300,
                    "TotalOtherOperationCost": 0,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 408.85,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 55,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 408.85,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 303.1,
                    "CostPerPiece": undefined,
                    "NetChildPartsCost": undefined,
                    "Quantity": 68,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null,
                    "IsLocked": null,
                    "IsPartLocked": false,

                },
                "CostingChildPartDetails": []
            },
            // Test 07 
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
                "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "AssemblyPartNumber": "03022022",
                "AssemblyPartName": "03022022",
                "SubAssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "CostingId": "e4c001ff-06a7-4587-8963-5cbf8ef091e4",
                "PartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
                "PartNumber": "Assem Part No. 10",
                "PartName": "Test 07",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 1,
                "PartType": "Sub Assembly",
                "IsScrapRecoveryPercentageApplied": false,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": true,
                "Sequence": 0,

                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": 0,
                    "TotalOperationCost": 0,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 0,
                    "CostPerPiece": undefined,
                    "NetChildPartsCost": undefined,
                    "Quantity": 68,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null,
                    "IsLocked": null,
                    "IsPartLocked": false,

                },
                "CostingChildPartDetails": []
            },
            // demo part1   
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
                "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "AssemblyPartNumber": "03022022",
                "AssemblyPartName": "03022022",
                "SubAssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "CostingId": "3d261dbd-e4ac-43f5-8e46-9e0050b86e0d",
                "PartId": "86c108a3-9ad3-43bc-9b39-6638ce359b7b",
                "PartNumber": "001",
                "PartName": "demo part1",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 2,
                "PartType": "Part",
                "IsScrapRecoveryPercentageApplied": false,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,

                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": 0,
                    "TotalOperationCost": 0,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 0,
                    "CostPerPiece": undefined,
                    "NetChildPartsCost": undefined,
                    "Quantity": 68,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null,
                    "IsLocked": null,
                    "IsPartLocked": false,

                },
                "CostingChildPartDetails": []
            },
            // Bop12     
            {
                "JsonStage": "_apart",
                "IsLocked": null,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "cfec4c09-84c8-4558-84a5-a9471c467aa6",
                "AssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "AssemblyPartNumber": "03022022",
                "AssemblyPartName": "03022022",
                "SubAssemblyCostingId": "62b5325b-5f93-4848-a699-2020cd95038d",
                "CostingId": null,
                "PartId": "21444211-078c-4f77-876b-45369efb6528",
                "PartNumber": "011",
                "PartName": "Bop12",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 3,
                "PartType": "BOP",
                "IsScrapRecoveryPercentageApplied": null,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,

                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": null,
                    "TotalOperationCost": null,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": null,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": 0,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": null,
                    "TotalBoughtOutPartCostWithQuantity": null,
                    "TotalCalculatedRMBOPCCCostWithQuantity": null,
                    "TotalCalculatedRMBOPCCCostPerAssembly": null,
                    "TotalConversionCostWithQuantity": null,
                    "CostPerPiece": 50,
                    // "NetChildPartsCost": 1000,
                    "CostPerAssemblyBOP": 1000,
                    "Quantity": 20,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": null,
                    "TotalOperationCostComponent": null,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerSubAssembly": null,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null,
                    "IsLocked": null,
                    "IsPartLocked": false,

                },
                "CostingChildPartDetails": []
            },
        ]
    }
]

export const ListForPartCost = [
    {
        VendorName: 'Vendor 1',
        SettledPrice: 10,
        SOBPercentage: 50,
        DeltaValue: 5,
        // NetCost: 7.5
    }, {
        VendorName: 'Vendor 2',
        SettledPrice: 15,
        SOBPercentage: 0,
        DeltaValue: 5,
        // NetCost: 0
    }, {
        VendorName: 'Vendor 3',
        SettledPrice: 10,
        SOBPercentage: 0,
        DeltaValue: 5,
        // NetCost: 0
    }, {
        VendorName: 'Vendor 4',
        SettledPrice: 20,
        SOBPercentage: 50,
        DeltaValue: 10,
        // NetCost: 5
    },
]

export const optionsForDelta = [
    {
        label: '+',
        value: '+'
    }, {
        label: '-',
        value: '-'
    }

]

export const subAssembly010101 = [
    {
        "JsonStage": "_assemblyCosting",
        "CostingId": "ebc314b1-7eea-4c15-a84b-20a2939ffecf",
        "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
        "CostingNumber": "ASY-123809",
        "Version": "1.0.65.130",
        "CostingDate": "2022-03-24T16:24:02.513",
        "CreatedBy": "Chandler",
        "ShareOfBusinessPercent": 0,
        "PlantId": null,
        "PlantName": null,
        "PlantCode": null,
        "VendorType": "VBC",
        "VendorId": "bcffb6f5-d9e8-403a-aa6f-85c92ba95f2d",
        "VendorName": "Dummy Vendor ",
        "VendorCode": "07102021",
        "VendorPlantId": null,
        "VendorPlantName": null,
        "VendorPlantCode": null,
        "TechnologyId": 13,
        "Technology": "Assembly",
        "IsScrapRecoveryPercentageApplied": false,
        "PartTypeId": 1,
        "PartType": "Assembly",
        "AssemblyPartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
        "AssemblyPartNumber": "010101",
        "AssemblyPartName": "LOWER CROSS BEAM FABRICATED",
        "PartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
        "PartNumber": "010101",
        "PartName": "LOWER CROSS BEAM FABRICATED",
        "BOMLevel": "L0",
        "IsAssemblyPart": true,
        "IsLocked": null,
        "IsPartLocked": false,
        "IsCostingLocked": false,
        "CostingPartDetails": {
            "JsonStage": "_part",
            "AssemblyPartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
            "AssemblyPartNumber": "010101",
            "AssemblyPartName": "LOWER CROSS BEAM FABRICATED",
            "PartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
            "PartNumber": "010101",
            "PartName": "LOWER CROSS BEAM FABRICATED",
            "BOMNumber": null,
            "BOMLevel": "L0",
            "CostingDetailId": null,
            "PartTypeId": 1,
            "PartType": "Assembly",
            "IsApplyBOPHandlingCharges": null,
            "BOPHandlingPercentage": null,
            "BOPHandlingCharges": null,
            "TotalRawMaterialsCost": 50.75,
            "TotalBoughtOutPartCost": 55,
            "TotalConversionCost": 303.1,
            "TotalProcessCost": 3.1,
            "TotalOperationCost": 300,
            "TotalOtherOperationCost": 0,
            "TotalToolCost": 0,
            "BoughtOutPartUOM": null,
            "BoughtOutPartRate": null,
            "TotalCalculatedRMBOPCCCost": 408.85,
            "TotalRawMaterialsCostWithQuantity": 50.75,
            "TotalBoughtOutPartCostWithQuantity": 55,
            "TotalCalculatedRMBOPCCCostWithQuantity": 408.85,
            "TotalCalculatedRMBOPCCCostPerAssembly": 0,
            "TotalConversionCostWithQuantity": 303.1,
            "Quantity": 1,
            "GrandTotalCost": 0,
            "IsOpen": false,
            "IsShowToolCost": false,
            "IsToolCostProcessWise": false,
            "IsAssemblyPart": true,
            "Sequence": 0,
            "TotalOperationCostSubAssembly": 0,
            "TotalOperationCostComponent": 0,
            "TotalOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerSubAssembly": 0,
            "TotalToolCostPerAssembly": 0,
            "CostingOperationCostResponse": [],
            "CostingToolCostResponse": [],
            "TempRM": null,
            "TempBOP": null,
            "TempCC": null,
            "TempRMBOPCC": null
        },
        "CostingChildPartDetails": [
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
                "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
                "AssemblyPartNumber": "010101",
                "AssemblyPartName": "LOWER CROSS BEAM FABRICATED",
                "SubAssemblyCostingId": "ebc314b1-7eea-4c15-a84b-20a2939ffecf",
                "CostingId": "54a227f4-cae3-4940-bac7-f54398ad8c63",
                "PartId": "222b057d-fc6b-463e-807f-30c468fe7aec",
                "PartNumber": "1628",
                "PartName": "BRACKET, CENTER STANDUP-STOP",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 2,
                "PartType": "Part",
                "IsScrapRecoveryPercentageApplied": false,
                "Quantity": 1,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,
                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": 0,
                    "TotalOperationCost": 0,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 0,
                    "Quantity": 1,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null
                },
                "CostingChildPartDetails": []
            },
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
                "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
                "AssemblyPartNumber": "010101",
                "AssemblyPartName": "LOWER CROSS BEAM FABRICATED",
                "SubAssemblyCostingId": "ebc314b1-7eea-4c15-a84b-20a2939ffecf",
                "CostingId": "17137bf4-54a0-4162-b939-b8e06fff1243",
                "PartId": "e1a3418a-82ad-4a9b-951e-ed04e6c745ed",
                "PartNumber": "1627",
                "PartName": "BRACKET, EVAP CANISTER",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 2,
                "PartType": "Part",
                "IsScrapRecoveryPercentageApplied": false,
                "Quantity": 1,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,
                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": 0,
                    "TotalOperationCost": 0,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 0,
                    "Quantity": 1,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null
                },
                "CostingChildPartDetails": []
            },
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "25661f2f-0d3f-43cd-b20f-003da2344195",
                "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
                "AssemblyPartNumber": "010101",
                "AssemblyPartName": "LOWER CROSS BEAM FABRICATED",
                "SubAssemblyCostingId": "ebc314b1-7eea-4c15-a84b-20a2939ffecf",
                "CostingId": "aad3830b-f000-4b3e-b6fd-950d329441cd",
                "PartId": "08826230-addd-4129-9d8d-3080e072f7db",
                "PartNumber": "1629",
                "PartName": "TUBE, LOWER CROSS BEAM",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 2,
                "PartType": "Part",
                "IsScrapRecoveryPercentageApplied": false,
                "Quantity": 1,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,
                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": 0,
                    "TotalOperationCost": 0,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": 0,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": null,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": 0,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostPerAssembly": 0,
                    "TotalConversionCostWithQuantity": 0,
                    "Quantity": 1,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": 0,
                    "TotalOperationCostComponent": 0,
                    "TotalOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerAssembly": 0,
                    "TotalOtherOperationCostPerSubAssembly": 0,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null
                },
                "CostingChildPartDetails": []
            }
        ]
    }
]

export const subAssemblyAssemPart = [
    {
        "JsonStage": "_assemblyCosting",
        "CostingId": "fa58563f-7537-406d-9909-f130ee12629e",
        "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
        "CostingNumber": "ASY-124825",
        "Version": "1.0.86.258",
        "CostingDate": "2022-03-24T16:24:03.06",
        "CreatedBy": "Chandler",
        "ShareOfBusinessPercent": 0,
        "PlantId": null,
        "PlantName": null,
        "PlantCode": null,
        "VendorType": "VBC",
        "VendorId": "bcffb6f5-d9e8-403a-aa6f-85c92ba95f2d",
        "VendorName": "Dummy Vendor ",
        "VendorCode": "07102021",
        "VendorPlantId": null,
        "VendorPlantName": null,
        "VendorPlantCode": null,
        "TechnologyId": 13,
        "Technology": "Assembly",
        "IsScrapRecoveryPercentageApplied": false,
        "PartTypeId": 1,
        "PartType": "Assembly",
        "AssemblyPartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
        "AssemblyPartNumber": "Assem Part No. 10",
        "AssemblyPartName": "Test 07",
        "PartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
        "PartNumber": "Assem Part No. 10",
        "PartName": "Test 07",
        "BOMLevel": "L0",
        "IsAssemblyPart": true,
        "IsLocked": null,
        "IsPartLocked": false,
        "IsCostingLocked": false,
        "CostingPartDetails": {
            "JsonStage": "_part",
            "AssemblyPartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
            "AssemblyPartNumber": "Assem Part No. 10",
            "AssemblyPartName": "Test 07",
            "PartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
            "PartNumber": "Assem Part No. 10",
            "PartName": "Test 07",
            "BOMNumber": null,
            "BOMLevel": "L0",
            "CostingDetailId": null,
            "PartTypeId": 1,
            "PartType": "Assembly",
            "IsApplyBOPHandlingCharges": null,
            "BOPHandlingPercentage": null,
            "BOPHandlingCharges": null,
            "TotalRawMaterialsCost": 0,
            "TotalBoughtOutPartCost": 0,
            "TotalConversionCost": 0,
            "TotalProcessCost": 0,
            "TotalOperationCost": 0,
            "TotalOtherOperationCost": null,
            "TotalToolCost": 0,
            "BoughtOutPartUOM": null,
            "BoughtOutPartRate": null,
            "TotalCalculatedRMBOPCCCost": 0,
            "TotalRawMaterialsCostWithQuantity": 0,
            "TotalBoughtOutPartCostWithQuantity": 0,
            "TotalCalculatedRMBOPCCCostWithQuantity": 0,
            "TotalCalculatedRMBOPCCCostPerAssembly": 0,
            "TotalConversionCostWithQuantity": 0,
            "Quantity": 1,
            "GrandTotalCost": 0,
            "IsOpen": false,
            "IsShowToolCost": false,
            "IsToolCostProcessWise": false,
            "IsAssemblyPart": true,
            "Sequence": 0,
            "TotalOperationCostSubAssembly": 0,
            "TotalOperationCostComponent": 0,
            "TotalOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerAssembly": 0,
            "TotalOtherOperationCostPerSubAssembly": 0,
            "TotalToolCostPerAssembly": 0,
            "CostingOperationCostResponse": [],
            "CostingToolCostResponse": [],
            "TempRM": null,
            "TempBOP": null,
            "TempCC": null,
            "TempRMBOPCC": null
        },
        "CostingChildPartDetails": [
            {
                "JsonStage": "_apart",
                "IsLocked": false,
                "IsPartLocked": false,
                "IsCostingLocked": false,
                "AssemblyPartId": "589525ee-3f45-4ee3-8748-4dff12a869d1",
                "AssemblyCostingId": "79025e8e-e8f0-42f7-862e-1e212da28c49",
                "AssemblyPartNumber": "Assem Part No. 10",
                "AssemblyPartName": "Test 07",
                "SubAssemblyCostingId": "fa58563f-7537-406d-9909-f130ee12629e",
                "CostingId": null,
                "PartId": "c0e3482d-b867-458b-9b06-7041f503121f",
                "PartNumber": "BOP 10",
                "PartName": "BOP Insert",
                "BOMNumber": null,
                "BOMLevel": "L1",
                "ParentCostingDetailId": null,
                "CostingDetailId": null,
                "PartTypeId": 3,
                "PartType": "BOP",
                "IsScrapRecoveryPercentageApplied": null,
                "Quantity": 5,
                "IsOpen": false,
                "IsShowToolCost": null,
                "IsAssemblyPart": false,
                "Sequence": 0,
                "CostingPartDetails": {
                    "JsonStage": "_innerPartDetail",
                    "AssemblyPartId": null,
                    "AssemblyPartNumber": null,
                    "AssemblyPartName": null,
                    "PartId": null,
                    "PartNumber": null,
                    "PartName": null,
                    "BOMNumber": null,
                    "BOMLevel": null,
                    "CostingDetailId": null,
                    "PartTypeId": null,
                    "PartType": null,
                    "IsApplyBOPHandlingCharges": null,
                    "BOPHandlingPercentage": null,
                    "BOPHandlingCharges": null,
                    "TotalRawMaterialsCost": 0,
                    "TotalBoughtOutPartCost": 0,
                    "TotalConversionCost": 0,
                    "TotalProcessCost": null,
                    "TotalOperationCost": null,
                    "TotalOtherOperationCost": null,
                    "TotalToolCost": null,
                    "BoughtOutPartUOM": null,
                    "BoughtOutPartRate": 0,
                    "TotalCalculatedRMBOPCCCost": 0,
                    "TotalRawMaterialsCostWithQuantity": null,
                    "TotalBoughtOutPartCostWithQuantity": 0,
                    "TotalCalculatedRMBOPCCCostWithQuantity": null,
                    "TotalCalculatedRMBOPCCCostPerAssembly": null,
                    "TotalConversionCostWithQuantity": null,
                    "Quantity": 5,
                    "GrandTotalCost": null,
                    "IsOpen": false,
                    "IsShowToolCost": null,
                    "IsToolCostProcessWise": null,
                    "IsAssemblyPart": null,
                    "Sequence": null,
                    "TotalOperationCostSubAssembly": null,
                    "TotalOperationCostComponent": null,
                    "TotalOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerAssembly": null,
                    "TotalOtherOperationCostPerSubAssembly": null,
                    "TotalToolCostPerAssembly": null,
                    "CostingOperationCostResponse": null,
                    "CostingToolCostResponse": null,
                    "TempRM": null,
                    "TempBOP": null,
                    "TempCC": null,
                    "TempRMBOPCC": null
                },
                "CostingChildPartDetails": []
            }
        ]
    }
]

export const CostingSimulationDownloadAssemblyTechnology = [
    { label: "Costing Head", value: "CostingHead" },
    { label: "CostingNumber", value: "CostingNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant", value: "PlantName" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "TechnologyLabel", value: "Technology", defaultValue: "Technology" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },

    { label: "ExistingNetChildPartsCostWithQuantity", value: "OldNetChildPartsCostWithQuantity" },
    { label: "RevisedNetChildPartsCostWithQuantity", value: "NewNetChildPartsCostWithQuantity" },
    { label: "Variance (w.r.t. Existing)", value: "Variance" },
    { label: "ExistingNetBoughtOutPartCost", value: "OldNetBoughtOutPartCost" },
    { label: "RevisedNetBoughtOutPartCost", value: "NewNetBoughtOutPartCost" },
    { label: "NetBoughtOutPartCostVariance", value: "NetBoughtOutPartCostVariance" },

    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
    { label: "Impact/Quarter (w.r.t. Budgeted Price)", value: "BudgetedPriceImpactPerQuarter" },
    { label: "Variance (w.r.t. Budgeted)", value: "BudgetedPriceVariance" },
    { label: "Budgeted Price", value: "BudgetedPrice" },

    { label: "ExistingOverheadCost", value: "OldOverheadCost" },
    { label: "RevisedOverheadCost", value: "NewOverheadCost" },
    { label: "ExistingProfitCost", value: "OldProfitCost" },
    { label: "RevisedProfitCost", value: "NewProfitCost" },
    { label: "ExistingRejectionCost", value: "OldRejectionCost" },
    { label: "RevisedRejectionCost", value: "NewRejectionCost" },
    { label: "ExistingICCCost", value: "OldICCCost" },
    { label: "RevisedICCCost", value: "NewICCCost" },
    { label: "ExistingPaymentTermsCost", value: "OldPaymentTermsCost" },
    { label: "RevisedPaymentTermsCost", value: "NewPaymentTermsCost" },
    { label: "ExistingOtherCost", value: "OldOtherCost" },
    { label: "RevisedOtherCost", value: "NewOtherCost" },
    { label: "ExistingDiscountCost", value: "OldDiscountCost" },
    { label: "RevisedDiscountCost", value: "NewDiscountCost" },
    { label: "ExistingNetOverheadAndProfitCost", value: "OldNetOverheadAndProfitCost" },
    { label: "RevisedNetOverheadAndProfitCost", value: "NewNetOverheadAndProfitCost" },
    { label: "ExistingNetToolCost", value: "OldNetToolCost" },
    { label: "RevisedNetToolCost", value: "NewNetToolCost" },
    { label: "ExistingNetFreightCost", value: "OldNetFreightCost" },
    { label: "RevisedNetFreightCost", value: "NewNetFreightCost" },
    { label: "ExistingNetPackagingCost", value: "OldNetPackagingCost" },
    { label: "RevisedNetPackagingCost", value: "NewNetPackagingCost" },
    { label: "ExistingNetFreightAndPackagingCost", value: "OldNetFreightPackagingCost" },
    { label: "RevisedNetFreightAndPackagingCost", value: "NewNetFreightPackagingCost" },
]

export const NFR_INSIGHT_REPORT = [
    { label: "Company", value: "Company" },
    { label: "PlantCode", value: "PlantCode" },
    { label: "TotalNfrCount", value: "TotalNfrCount" },
    { label: "TotalOEQA1Count", value: "TotalOEQA1Count" },
    { label: "TotalOEQA2Count", value: "TotalOEQA2Count" },
    { label: "TotalOEQA3Count", value: "TotalOEQA3Count" },
    { label: "TotalOEQA4Count", value: "TotalOEQA4Count" },
    { label: "TotalPFS1Count", value: "TotalPFS1Count" },
    { label: "TotalPFS2Count", value: "TotalPFS2Count" },
    { label: "TotalPFS3Count", value: "TotalPFS3Count" },
    { label: "OEQA1DraftCount", value: "OEQA1DraftCount" },
    { label: "OEQA1PendingForApprovalCount", value: "OEQA1PendingForApprovalCount" },
    { label: "OEQA1ApprovedCount", value: "OEQA1ApprovedCount" },
    { label: "OEQA1RejectedCount", value: "OEQA1RejectedCount" },
    { label: "OEQA1ErrorCount", value: "OEQA1ErrorCount" },
    { label: "OEQA1PushedCount", value: "OEQA1PushedCount" },
    { label: "OEQA1ExternalRejectCount", value: "OEQA1ExternalRejectCount" },
    { label: "OEQA2DraftCount", value: "OEQA2DraftCount" },
    { label: "OEQA2PendingForApprovalCount", value: "OEQA2PendingForApprovalCount" },
    { label: "OEQA2ApprovedCount", value: "OEQA2ApprovedCount" },
    { label: "OEQA2RejectedCount", value: "OEQA2RejectedCount" },
    { label: "OEQA2ErrorCount", value: "OEQA2ErrorCount" },
    { label: "OEQA2PushedCount", value: "OEQA2PushedCount" },
    { label: "OEQA2ExternalRejectCount", value: "OEQA2ExternalRejectCount" },
    { label: "OEQA3DraftCount", value: "OEQA3DraftCount" },
    { label: "OEQA3PendingForApprovalCount", value: "OEQA3PendingForApprovalCount" },
    { label: "OEQA3ApprovedCount", value: "OEQA3ApprovedCount" },
    { label: "OEQA3RejectedCount", value: "OEQA3RejectedCount" },
    { label: "OEQA3ErrorCount", value: "OEQA3ErrorCount" },
    { label: "OEQA3PushedCount", value: "OEQA3PushedCount" },
    { label: "OEQA3ExternalRejectCount", value: "OEQA3ExternalRejectCount" },
    { label: "OEQA4DraftCount", value: "OEQA4DraftCount" },
    { label: "OEQA4PendingForApprovalCount", value: "OEQA4PendingForApprovalCount" },
    { label: "OEQA4ApprovedCount", value: "OEQA4ApprovedCount" },
    { label: "OEQA4RejectedCount", value: "OEQA4RejectedCount" },
    { label: "OEQA4ErrorCount", value: "OEQA4ErrorCount" },
    { label: "OEQA4PushedCount", value: "OEQA4PushedCount" },
    { label: "OEQA4ExternalRejectCount", value: "OEQA4ExternalRejectCount" },
    { label: "PFS1DraftCount", value: "PFS1DraftCount" },
    { label: "PFS1PendingForApprovalCount", value: "PFS1PendingForApprovalCount" },
    { label: "PFS1ApprovedCount", value: "PFS1ApprovedCount" },
    { label: "PFS1RejectedCount", value: "PFS1RejectedCount" },
    { label: "PFS1ErrorCount", value: "PFS1ErrorCount" },
    { label: "PFS1PushedCount", value: "PFS1PushedCount" },
    { label: "PFS1ExternalRejectCount", value: "PFS1ExternalRejectCount" },
    { label: "PFS2DraftCount", value: "PFS2DraftCount" },
    { label: "PFS2PendingForApprovalCount", value: "PFS2PendingForApprovalCount" },
    { label: "PFS2ApprovedCount", value: "PFS2ApprovedCount" },
    { label: "PFS2RejectedCount", value: "PFS2RejectedCount" },
    { label: "PFS2ErrorCount", value: "PFS2ErrorCount" },
    { label: "PFS2PushedCount", value: "PFS2PushedCount" },
    { label: "PFS2ExternalRejectCount", value: "PFS2ExternalRejectCount" },
    { label: "PFS3DraftCount", value: "PFS3DraftCount" },
    { label: "PFS3PendingForApprovalCount", value: "PFS3PendingForApprovalCount" },
    { label: "PFS3ApprovedCount", value: "PFS3ApprovedCount" },
    { label: "PFS3ErrorCount", value: "PFS3ErrorCount" },
    { label: "PFS3PushedCount", value: "PFS3PushedCount" },
    { label: "PFS3ExternalRejectCount", value: "PFS3ExternalRejectCount" },
]

export const SIMULATIONAPPROVALSUMMARYDOWNLOADASSEMBLYTECHNOLOGY = [
    { label: "Costing Id", value: "CostingNumber" },
    { label: "Part No", value: "PartNo" },
    { label: "Part Name", value: "PartName" },
    { label: "ECN Number", value: "ECNNumber" },
    { label: "Revision Number", value: "RevisionNumber" },
    { label: "Vendor (Code)", value: "VendorName" },
    { label: "Plant", value: "PlantName" },
    { label: "Plant Code", value: "PlantCode" },
    { label: "Customer (Code)", value: "CustomerName" },
    { label: "Existing Net Cost", value: "OldPOPrice" },
    { label: "Revised Net Cost", value: "NewPOPrice" },
    { label: "Variance (w.r.t. Existing)", value: "POVariance" },
    { label: "ExistingNetBoughtOutPartCost", value: "OldNetBoughtOutPartCost" },
    { label: "RevisedNetBoughtOutPartCost", value: "NewNetBoughtOutPartCost" },
    { label: "NetBoughtOutPartCostVariance", value: "NetBoughtOutPartCostVariance" },
    { label: "Impact/Quarter (w.r.t. Existing)", value: "ImpactPerQuarter" },
]
export const AddRFQUpload = [
    { label: "PartNumber", value: "PartNumber" },
    { label: 'RevisionNumber', value: 'RevisionNumber' },
]
export const AddRFQTempData = [
    {
        PartNumber: "Part_1",
        RevisionNumber: 'A',
        Quantity: 2
    },
    {
        PartNumber: "Part_2",
        RevisionNumber: 'B',
        Quantity: 5
    }
]
export const AddAssemblyOrComponentHeaderData = [
    { label: 'Technology', value: 'Technology' },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: "Part Type", value: "PartType" },
    { label: "Part Number", value: "PartNumber" },
    { label: 'Assembly Part No', value: 'AssemblyPartNo' },
    { label: 'Part Design Source Name', value: 'PartDesignSourceName' },
    { label: "PartUOM", value: "PartUOM" },
    { label: 'RM Code', value: 'RMCode' },
    { label: 'RM Name', value: 'RMName' },
    { label: "RM Grade", value: "RMGrade" },
    { label: 'RM Specification', value: 'RMSpecification' },
    { label: 'Specification Description', value: 'SpecificationDescription' },
    { label: "Specification Value", value: "SpecificationValue" },
    { label: 'SOP Date', value: 'SOPDate' },
    { label: 'Production Year', value: 'ProductionYear' },
    { label: 'Annual Forecast Quantity', value: 'AnnualForecastQuantity' },
    { label: "N-100 Timeline", value: "N100Timeline" },
    { label: 'Remarks', value: 'Remarks' },



]
export const AddRawMaterialHeaderData = [


    { label: 'Technology', value: 'Technology' },
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'RM Code', value: 'RMCode' },
    { label: 'RM Name', value: 'RMName' },
    { label: "RM Grade", value: "RMGrade" },
    { label: 'RM Specification', value: 'RMSpecification' },
    { label: 'UOM', value: 'UOM' },
    { label: "N-100 Timeline", value: "N100Timeline" },
    { label: 'Remark', value: 'Remark' },
]
export const AddBoughtOutPartsHeaderData = [
    { label: 'PlantCode', value: 'PlantCode' },
    { label: 'BOP Number', value: 'BOPNumber' },
    { label: 'BOP Category', value: 'BOPCategory' },
    { label: "PartUOM", value: "PartUOM" },
    { label: 'Specification Description', value: 'SpecificationDescription' },
    { label: "Specification Value", value: "SpecificationValue" },
    { label: "N-100 Timeline", value: "N100Timeline" },

    { label: 'Remarks', value: 'Remarks' },
]

export const AddRawMaterialTempData = [
    {
        Technology: "Casting",
        PlantCode: "Plant A",
        RMCode: "RM001",
        RMName: "Aluminum Ingot",
        RMGrade: "6061",
        RMSpecification: "3mm thickness",
        UOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        N100Timeline: "2024-07-15",
        Remark: "Test batch required"
    },
    {
        Technology: "Casting",
        PlantCode: "Plant A",
        RMCode: "RM002",
        RMName: "Copper Wire",
        RMGrade: "C11000",
        RMSpecification: "High conductivity",
        UOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        N100Timeline: "2024-10-01",
        Remark: "Rush order"
    },
    {
        Technology: "Casting",
        PlantCode: "Plant A",
        RMCode: "RM003",
        RMName: "Polypropylene",
        RMGrade: "PP123",
        RMSpecification: "Injection grade",
        UOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        N100Timeline: "2025-01-20",
        Remark: "Pending approval"
    }
];
export const AddBoughtOutPartsTempData = [
    {
        PlantCode: "Plant X",
        BOPNumber: "BOP001",
        BOPCategory: "Fasteners",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        SpecificationDescription: "Stainless steel bolts",
        SpecificationValue: "M10 x 50mm",
        N100Timeline: "2024-07-15",

        Remarks: "High tensile strength"
    },
    {
        PlantCode: "Plant X",
        BOPNumber: "BOP001",
        BOPCategory: "Fasteners",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        SpecificationDescription: "Ball bearing",
        SpecificationValue: "SKF 6205",
        N100Timeline: "2024-07-15",

        Remarks: "Standard size"
    },
    {
        PlantCode: "Plant X",
        BOPNumber: "BOP001",
        BOPCategory: "Fasteners",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        SpecificationDescription: "High-temperature grease",
        SpecificationValue: "Mobil SHC 460",
        N100Timeline: "2024-07-15",

        Remarks: "High load-bearing capacity"
    }
];
export const AddAssemblyOrComponentTempData = [
    {
        Technology: "Forging",
        PlantCode: "Plant C",
        PartType: "Assembly",
        PartNumber: "A12345",
        AssemblyPartNo: "APN123",
        PartDesignSourceName: "Havells Design part /Proprietary part",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        RMCode: "RM123",
        RMName: "Steel",
        RMGrade: "A36",
        RMSpecification: "2.5mm Thickness",
        SpecificationDescription: "Mild steel with rust resistance",
        SpecificationValue: "Good",
        SOPDate: "15-09-2024",
        ProductionYear: "2025",
        AnnualForecastQuantity: 10000,
        N100Timeline: "13-09-2024",
        Remarks: "Urgent requirement",


    },
    {
        Technology: "Forging",
        PlantCode: "Plant C",
        PartType: "Component",
        PartNumber: "C67890",
        AssemblyPartNo: "APN678",
        PartDesignSourceName: "Havells Design part /Proprietary part",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        RMCode: "RM456",
        RMName: "Aluminum",
        RMGrade: "6061",
        RMSpecification: "1.2mm Thickness",
        SpecificationDescription: "High strength alloy",
        SpecificationValue: "Excellent",
        SOPDate: "15-09-2024",
        ProductionYear: "2024",
        AnnualForecastQuantity: 5000,
        N100Timeline: "14-09-2024",
        Remarks: "Review specification",

    },
    {
        Technology: "Forging",
        PlantCode: "Plant C",
        PartType: "Assembly",
        PartNumber: "A78901",
        AssemblyPartNo: "APN789",
        PartDesignSourceName: "Havells Design part /Proprietary part",
        PartUOM: "Ounce/Pound/Metric Ton/Milligram/Gram/Kilogram",
        RMCode: "RM789",
        RMName: "Plastic",
        RMGrade: "Polypropylene",
        RMSpecification: "High density",
        SpecificationDescription: "Durable with chemical resistance",
        SpecificationValue: "Very Good",
        SOPDate: "15-09-2024",
        ProductionYear: "2026",
        AnnualForecastQuantity: 20000,
        N100Timeline: "15-09-2024",
        Remarks: "Awaiting approval",

    }
];
export const getSAPPushHeaderData = () => {
    // Retrieve the stored data from reactLocalStorage
    const storedSAPDetailKeys = Object.keys(reactLocalStorage.getObject('SAPDetailKeys')).length === 0 ? [] : reactLocalStorage.getObject('SAPDetailKeys');
    // If there's no stored data, return the default array
    if (!storedSAPDetailKeys || storedSAPDetailKeys.length === 0) {
        return [
            { label: 'Part Number', value: 'PartNumber' },
            { label: 'Plant Code', value: 'PlantCode' },
            { label: 'Vendor Code', value: 'VendorCode' },
            { label: 'Purchase Org', value: 'PurchaseOrg' },
            { label: 'Valuation Type', value: 'ValuationType' },
            { label: 'Info Category', value: 'InfoCategory' },
            { label: 'Planned Del Time', value: 'PlannedDelTime' },
            { label: 'Tax Code', value: 'TaxCode' },
        ];
    }

    return storedSAPDetailKeys.map(item => {
        const key = Object.keys(item)[0];
        return {
            label: key,
            value: key
        };
    });
};

export const SAP_PUSH_HEADER_DATA = getSAPPushHeaderData()
export const generateSAPPushTempData = (count = 3) => {
    const headers = getSAPPushHeaderData();

    return Array.from({ length: count }, (_, index) => {
        const item = {};
        headers && headers.forEach(header => {
            if (header.value === 'PlannedDelTime') {
                item[header.value] = (index + 1) * 10; // 10, 20, 30, ...
            } else {
                item[header.value] = `${header.value}${index + 1}`;
            }
        });
        return item;
    });
};
export const SAP_PUSH_TEMP_DATA = generateSAPPushTempData(3)

export const AddAssemblyOrComponentAdditionalInfoTempData = [
    {
        Notes: "For Component, please leave Asembly Part Number empty"
    }

]
export const AddAssemblyOrComponentAdditionalInfoHeaderData = [
    { label: 'Notes', value: 'Notes' }
]





// VISIBILITY MODE ADD RFQ
export const DATE_STRING = 'Date'
export const DURATION_STRING = 'Duration'

export const visibilityModeDropdownArray = [
    { label: 'Date', value: 'Date' },
    { label: 'Duration', value: 'Duration' },
]

export const typeofNpvDropdown = [
    { label: 'Tool Investment', value: 'Tool Investment' },
    { label: 'Additional Investment', value: 'Additional Investment' },
    { label: 'One Time Investment', value: 'One Time Investment' }
]



export const tokenStatus = {
    PendingForApproval: 'The token is pending for approval from your side.',
    AwaitingForApproval: 'The token is pending for approval from your higher authority.',
    Draft: 'The token is pending to send for approval from your side.',
    Approved: 'The token is approved.',
    Rejected: 'The token is rejected.',
    Pushed: 'The token is pushed to SAP.',
    Error: 'An error occurred while pushing the approved token to SAP.',
    History: 'The token is now old, it has new updated costing.',
    Linked: 'The token is linked to another token.',
    Provisional: 'The token is provisional, will not go for approval.',
    POUpdated: 'Net Cost updated successfully on SAP.'
};
export const tokenStatusName = {
    PENDING_FOR_APPROVAL: 'PendingForApproval',
    AWAITING_FOR_APPROVAL: 'AwaitingApproval',
    DRAFT: 'Draft',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PUSHED: 'Pushed',
    ERROR: 'Error',
    HISTORY: 'History',
    LINKED: 'Linked',
    PROVISIONAL: 'Provisional',
    POUPDATED: 'POUpdated'
}
export const typePercentageAndFixed = [
    { label: 'Fixed', value: 'Fixed' },
    { label: 'Percentage', value: 'Percentage' },
];
export const associationDropdownList = [
    { label: 'Associated with costing', value: 'Associated with costing' },
    { label: 'Not associated with costing', value: 'Not associated with costing' },
]

export const NON_ASSOCIATED = "Not associated with costing"
export const ASSOCIATED = "Associated with costing"
//Status dropdown for RFQ and NFR
export const statusDropdownforRfq = [
    { label: "Approved", value: "1" },
    { label: "Draft", value: "2" },
    { label: "Received", value: "3" },
    { label: "Under Revision", value: "4" },
    { label: "Sent", value: "5" },
    { label: "Cancelled", value: "6" },
    { label: "Rejected", value: "7" },
    { label: "Returned", value: "8" },
    { label: "Pending For Approval", value: "9" },
    { label: "History", value: "10" },
    { label: "Not Selected", value: "11" },
    { label: "PreDraft", value: "12" },
];
export const statusDropdownforNfr = [
    { label: 'Draft', value: 1 },
    { label: 'Pending For Approval', value: 2 },
    { label: 'Approved', value: 3 },
    { label: 'Rejected', value: 4 },
    { label: 'History', value: 5 },
    { label: 'Awaiting Approval', value: 6 },
    { label: 'Error', value: 12 },
    { label: 'Pushed', value: 13 },
    { label: 'Under Approval', value: 21 },
    { label: 'External Reject', value: 27 },
];
export const CostingBulkUploadTechnologyDropdown = [
    { label: "Sheet Metal", value: "8" },
]

export const applicabilityList = [
    { label: 'RM', value: 'RM' },
    { label: 'BOP', value: 'BOP' },
    { label: 'Part', value: 'Part' },
];

export const APPLICABILITY_RM_SIMULATION = "RM"
export const APPLICABILITY_BOP_SIMULATION = "BOP"
export const APPLICABILITY_PART_SIMULATION = "Part"

export const nfrDropdown = [
    { label: "00000563", value: "160e1194-ae06-4ab8-a1ca-98acc064a017" },
    { label: "00000570", value: "da6d8995-14a7-46d9-9383-9eace3e6df29" },
    { label: "00000571", value: "4123a4d5-1226-486e-8973-8af4111b3b7f" },
    { label: "00000572", value: "beac508c-27f3-4d99-8b76-88b53e449f24" },
    { label: "00000574", value: "c393ead1-4698-402e-9b67-fc2e8964105a" },
    { label: "00000575", value: "18ba3689-ee0e-4afe-907a-373df9a62446" },
    { label: "00000578", value: "67c812bd-7045-440a-ba84-e9ce7131b82a" },
    { label: "00000579", value: "5e8c78e6-ecc6-4034-b1fd-47c72d2efdc0" },
]

export const partTypeDropdownList = [
    { label: 'Part', value: 'Part' },
    { label: 'BOP', value: 'BOP' },
]

export const DETAILED_BOP = "Detailed BOP"
export const DETAILED_BOP_ID = "3"

export const PART_TYPE_LIST_FOR_NFR = [
    { label: "Component (Customized)", value: 1 },
    { label: "BOP (Standard)", value: 2 },
    { label: "Raw Material", value: 3 },
]

export const NFR_COMPONENT_CUSTOMIZED_ID = 1
export const NFR_BOP_STANDARD_ID = 2
export const NFR_RAW_MATERIAL_ID = 3

export const NFR_COMPONENT_CUSTOMIZED_LABEL = 'Component (Customized)'
export const NFR_BOP_STANDARD_LABEL = 'BOP (Standard)'
export const NFR_RAW_MATERIAL_LABEL = 'Raw Material'

export const NFR_COMPONENT_CUSTOMIZED_NAME = 'Part'
export const NFR_BOP_STANDARD_NAME = 'BoughtOutPart'
export const NFR_RAW_MATERIAL_NAME = 'RawMaterial'

export const REJECTION_RECOVERY_APPLICABILITY = [
    { label: "Scrap Rate * Net Weight", value: '24' },
    // { label: "Scap Rate * Net weight", value: 1 },
    { label: "Fixed", value: '7' },
]

export const PACK_AND_FREIGHT_PER_KG = 'Per kg'

export const FREIGHT_LOAD_OPTIONS = [
    { label: "Full Truck Load", value: 3 },
    { label: "Part Truck Load", value: 4 },
]

export const indexationDropdown = [
    { label: 'Indexed', value: 'Indexed' },
    { label: 'Non Indexed', value: 'Non Indexed' },
]
