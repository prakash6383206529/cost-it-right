import React from 'react';
import { useSelector } from 'react-redux';
import { Table } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import { DATE_TYPE } from '../../../../config/constants';
import { useState } from 'react';
import { useEffect } from 'react';
const DUMMY_DATA = {
    "BaseCostingId": "00000000-0000-0000-0000-000000000000",
    "CostingNumber": "string",
    "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
    "Month": "string",
    "PartNumber": "string",
    "PartName": "string",
    "Mod": "string",
    "Plant": "string",
    "PlantName": "string",
    "PlantCode": "string",
    "PlantAddress": "string",
    "Vendor": "string",
    "VendorName": "string",
    "VendorCode": "string",
    "Customer": "string",
    "CustomerName": "string",
    "CustomerCode": "string",
    "BudgetedQuantity": 0,
    "ApprovedQuantity": 0,
    "GotDetails": {
        "HeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "HeadWiseSurfaceTreatmentDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "HeadWiseCostingAndSurfaceTreatmentSumDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "BudgetedHeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "ApprovedHeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        }
    },
    "GivenDetails": {
        "HeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "HeadWiseSurfaceTreatmentDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "HeadWiseCostingAndSurfaceTreatmentSumDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "BudgetedHeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        },
        "ApprovedHeadWiseCostingDetails": {
            "BaseCostingId": "00000000-0000-0000-0000-000000000000",
            "CostingNumber": "string",
            "CostingEffectiveDate": "2023-06-22T11:12:00.057Z",
            "Month": "string",
            "PartNumber": "string",
            "PartName": "string",
            "Mod": "string",
            "Plant": "string",
            "PlantName": "string",
            "PlantCode": "string",
            "PlantAddress": "string",
            "Vendor": "string",
            "VendorName": "string",
            "VendorCode": "string",
            "Customer": "string",
            "CustomerName": "string",
            "CustomerCode": "string",
            "BudgetedQuantity": 0,
            "ApprovedQuantity": 0,
            "CurrentTentativeSaleRate": "string",
            "RawMaterialEffectiveDate": "2023-06-22T11:12:00.057Z",
            "NetPOPrice": 0,
            "ProvisionPrice": 0,
            "NetSales": 0,
            "Consumption": 0,
            "LabourCost": 0,
            "ManufacturingExpenses": 0,
            "OfficeExpenses": 0,
            "RepairsExpenses": 0,
            "SellingAndDistributionExpenses": 0,
            "CommonExpenses": 0,
            "StaffCost": 0,
            "EBIDTA": 0,
            "FinanceCost": 0,
            "Depreciation": 0,
            "PBT": 0,
            "Amortization": 0
        }
    }
}
//ONCE API DEPLOY FROM BACKEND THE DUMMY JSON WILL BE REMOVED

const mainHeaders = ["Month", "Part Number", "Part Name", "Revision Number", "Plant(Code)", "Plant Address", "Vendor(Code)", "Customer(Code)", "Budgeted Quantity", "Approved Quantity", "Effective Date"]
function GotGivenListing(props) {

    const formData = useSelector(state => state.report.costReportFormGridData);
    const { initialConfiguration } = useSelector(state => state.auth)
    const [tableData, setTableData] = useState([]);

    const cancelReport = () => {
        props.closeDrawer('')
    }
    const { Month, PartNumber, PartName, RevisionNumber, PlantName, PlantAddress, VendorName, CustomerName, BudgetedQuantity, ApprovedQuantity, EffectiveDate, GotDetails, GivenDetails } = DUMMY_DATA;


    const leftHeaderClass = "font-weight-500 custom-min-width-140px"
    const checkValidData = (value, type = '') => {
        if (type === DATE_TYPE) {
            return value ? DayTime(value).format('DD/MM/YYYY') : '-'
        } else {
            return value ? value : '-'
        }
    }

    const renderTableHeaders = (headers) => {
        return headers.map((item, index) => {
            return <td key={index}>{item}</td>;
        });
    };
    const renderTableCells = (data) => {
        return data.map((value, index) => {
            if (value === EffectiveDate) {
                return <td key={index}>{checkValidData(value, DATE_TYPE)}</td>;
            } else {
                return <td key={index}>{checkValidData(value)}</td>;
            }

        });
    };
    const Data = [{
        label: 'Current Tentative Sale Rate',
        fields: [
            GotDetails.HeadWiseCostingDetails.CurrentTentativeSaleRate,
            GotDetails.HeadWiseSurfaceTreatmentDetails.CurrentTentativeSaleRate,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.CurrentTentativeSaleRate,
            GotDetails.BudgetedHeadWiseCostingDetails.CurrentTentativeSaleRate,
            GotDetails.ApprovedHeadWiseCostingDetails.CurrentTentativeSaleRate,
            GivenDetails.HeadWiseCostingDetails.CurrentTentativeSaleRate,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.CurrentTentativeSaleRate,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.CurrentTentativeSaleRate,
            GivenDetails.BudgetedHeadWiseCostingDetails.CurrentTentativeSaleRate,
            GivenDetails.ApprovedHeadWiseCostingDetails.CurrentTentativeSaleRate,
        ],
    },
    {
        label: 'Raw Material Effective Date',
        fields: [
            GotDetails.HeadWiseCostingDetails.RawMaterialEffectiveDate,
            GotDetails.HeadWiseSurfaceTreatmentDetails.RawMaterialEffectiveDate,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.RawMaterialEffectiveDate,
            GotDetails.BudgetedHeadWiseCostingDetails.RawMaterialEffectiveDate,
            GotDetails.ApprovedHeadWiseCostingDetails.RawMaterialEffectiveDate,
            GivenDetails.HeadWiseCostingDetails.RawMaterialEffectiveDate,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.RawMaterialEffectiveDate,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.RawMaterialEffectiveDate,
            GivenDetails.BudgetedHeadWiseCostingDetails.RawMaterialEffectiveDate,
            GivenDetails.ApprovedHeadWiseCostingDetails.RawMaterialEffectiveDate
        ]
    },
    {
        label: 'Net POPrice',
        fields: [
            GotDetails.HeadWiseCostingDetails.NetPOPrice,
            GotDetails.HeadWiseSurfaceTreatmentDetails.NetPOPrice,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.NetPOPrice,
            GotDetails.BudgetedHeadWiseCostingDetails.NetPOPrice,
            GotDetails.ApprovedHeadWiseCostingDetails.NetPOPrice,
            GivenDetails.HeadWiseCostingDetails.NetPOPrice,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.NetPOPrice,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.NetPOPrice,
            GivenDetails.BudgetedHeadWiseCostingDetails.NetPOPrice,
            GivenDetails.ApprovedHeadWiseCostingDetails.NetPOPrice
        ]
    },
    {
        label: 'Provision Price',
        fields: [
            GotDetails.HeadWiseCostingDetails.ProvisionPrice,
            GotDetails.HeadWiseSurfaceTreatmentDetails.ProvisionPrice,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.ProvisionPrice,
            GotDetails.BudgetedHeadWiseCostingDetails.ProvisionPrice,
            GotDetails.ApprovedHeadWiseCostingDetails.ProvisionPrice,
            GivenDetails.HeadWiseCostingDetails.ProvisionPrice,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.ProvisionPrice,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.ProvisionPrice,
            GivenDetails.BudgetedHeadWiseCostingDetails.ProvisionPrice,
            GivenDetails.ApprovedHeadWiseCostingDetails.ProvisionPrice
        ]
    },
    {
        label: 'Net Sales',
        fields: [
            GotDetails.HeadWiseCostingDetails.NetSales,
            GotDetails.HeadWiseSurfaceTreatmentDetails.NetSales,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.NetSales,
            GotDetails.BudgetedHeadWiseCostingDetails.NetSales,
            GotDetails.ApprovedHeadWiseCostingDetails.NetSales,
            GivenDetails.HeadWiseCostingDetails.NetSales,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.NetSales,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.NetSales,
            GivenDetails.BudgetedHeadWiseCostingDetails.NetSales,
            GivenDetails.ApprovedHeadWiseCostingDetails.NetSales
        ]
    },
    {
        label: 'Consumption',
        fields: [
            GotDetails.HeadWiseCostingDetails.Consumption,
            GotDetails.HeadWiseSurfaceTreatmentDetails.Consumption,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Consumption,
            GotDetails.BudgetedHeadWiseCostingDetails.Consumption,
            GotDetails.ApprovedHeadWiseCostingDetails.Consumption,
            GivenDetails.HeadWiseCostingDetails.Consumption,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.Consumption,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Consumption,
            GivenDetails.BudgetedHeadWiseCostingDetails.Consumption,
            GivenDetails.ApprovedHeadWiseCostingDetails.Consumption
        ]
    },
    {
        label: 'Labour Cost',
        fields: [
            GotDetails.HeadWiseCostingDetails.LabourCost,
            GotDetails.HeadWiseSurfaceTreatmentDetails.LabourCost,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.LabourCost,
            GotDetails.BudgetedHeadWiseCostingDetails.LabourCost,
            GotDetails.ApprovedHeadWiseCostingDetails.LabourCost,
            GivenDetails.HeadWiseCostingDetails.LabourCost,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.LabourCost,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.LabourCost,
            GivenDetails.BudgetedHeadWiseCostingDetails.LabourCost,
            GivenDetails.ApprovedHeadWiseCostingDetails.LabourCost
        ]
    },
    {
        label: 'Manufacturing Expenses',
        fields: [
            GotDetails.HeadWiseCostingDetails.ManufacturingExpenses,
            GotDetails.HeadWiseSurfaceTreatmentDetails.ManufacturingExpenses,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.ManufacturingExpenses,
            GotDetails.BudgetedHeadWiseCostingDetails.ManufacturingExpenses,
            GotDetails.ApprovedHeadWiseCostingDetails.ManufacturingExpenses,
            GivenDetails.HeadWiseCostingDetails.ManufacturingExpenses,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.ManufacturingExpenses,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.ManufacturingExpenses,
            GivenDetails.BudgetedHeadWiseCostingDetails.ManufacturingExpenses,
            GivenDetails.ApprovedHeadWiseCostingDetails.ManufacturingExpenses
        ]
    },
    {
        label: 'Office Expenses',
        fields: [
            GotDetails.HeadWiseCostingDetails.OfficeExpenses,
            GotDetails.HeadWiseSurfaceTreatmentDetails.OfficeExpenses,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.OfficeExpenses,
            GotDetails.BudgetedHeadWiseCostingDetails.OfficeExpenses,
            GotDetails.ApprovedHeadWiseCostingDetails.OfficeExpenses,
            GivenDetails.HeadWiseCostingDetails.OfficeExpenses,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.OfficeExpenses,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.OfficeExpenses,
            GivenDetails.BudgetedHeadWiseCostingDetails.OfficeExpenses,
            GivenDetails.ApprovedHeadWiseCostingDetails.OfficeExpenses
        ]
    },
    {
        label: 'Repairs Expenses',
        fields: [
            GotDetails.HeadWiseCostingDetails.RepairsExpenses,
            GotDetails.HeadWiseSurfaceTreatmentDetails.RepairsExpenses,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.RepairsExpenses,
            GotDetails.BudgetedHeadWiseCostingDetails.RepairsExpenses,
            GotDetails.ApprovedHeadWiseCostingDetails.RepairsExpenses,
            GivenDetails.HeadWiseCostingDetails.RepairsExpenses,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.RepairsExpenses,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.RepairsExpenses,
            GivenDetails.BudgetedHeadWiseCostingDetails.RepairsExpenses,
            GivenDetails.ApprovedHeadWiseCostingDetails.RepairsExpenses
        ]
    },
    {
        label: 'Selling and Distribution Expenses',
        fields: [
            GotDetails.HeadWiseCostingDetails.SellingAndDistributionExpenses,
            GotDetails.HeadWiseSurfaceTreatmentDetails.SellingAndDistributionExpenses,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.SellingAndDistributionExpenses,
            GotDetails.BudgetedHeadWiseCostingDetails.SellingAndDistributionExpenses,
            GotDetails.ApprovedHeadWiseCostingDetails.SellingAndDistributionExpenses,
            GivenDetails.HeadWiseCostingDetails.SellingAndDistributionExpenses,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.SellingAndDistributionExpenses,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.SellingAndDistributionExpenses,
            GivenDetails.BudgetedHeadWiseCostingDetails.SellingAndDistributionExpenses,
            GivenDetails.ApprovedHeadWiseCostingDetails.SellingAndDistributionExpenses
        ]
    },
    {
        label: 'Common Expenses',
        fields: [
            GotDetails.HeadWiseCostingDetails.CommonExpenses,
            GotDetails.HeadWiseSurfaceTreatmentDetails.CommonExpenses,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.CommonExpenses,
            GotDetails.BudgetedHeadWiseCostingDetails.CommonExpenses,
            GotDetails.ApprovedHeadWiseCostingDetails.CommonExpenses,
            GivenDetails.HeadWiseCostingDetails.CommonExpenses,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.CommonExpenses,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.CommonExpenses,
            GivenDetails.BudgetedHeadWiseCostingDetails.CommonExpenses,
            GivenDetails.ApprovedHeadWiseCostingDetails.CommonExpenses
        ]
    },
    {
        label: 'Staff Cost',
        fields: [
            GotDetails.HeadWiseCostingDetails.StaffCost,
            GotDetails.HeadWiseSurfaceTreatmentDetails.StaffCost,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.StaffCost,
            GotDetails.BudgetedHeadWiseCostingDetails.StaffCost,
            GotDetails.ApprovedHeadWiseCostingDetails.StaffCost,
            GivenDetails.HeadWiseCostingDetails.StaffCost,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.StaffCost,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.StaffCost,
            GivenDetails.BudgetedHeadWiseCostingDetails.StaffCost,
            GivenDetails.ApprovedHeadWiseCostingDetails.StaffCost
        ]
    },
    {
        label: 'EBIDTA',
        fields: [
            GotDetails.HeadWiseCostingDetails.EBIDTA,
            GotDetails.HeadWiseSurfaceTreatmentDetails.EBIDTA,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.EBIDTA,
            GotDetails.BudgetedHeadWiseCostingDetails.EBIDTA,
            GotDetails.ApprovedHeadWiseCostingDetails.EBIDTA,
            GivenDetails.HeadWiseCostingDetails.EBIDTA,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.EBIDTA,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.EBIDTA,
            GivenDetails.BudgetedHeadWiseCostingDetails.EBIDTA,
            GivenDetails.ApprovedHeadWiseCostingDetails.EBIDTA
        ]
    },
    {
        label: 'Finance Cost',
        fields: [
            GotDetails.HeadWiseCostingDetails.FinanceCost,
            GotDetails.HeadWiseSurfaceTreatmentDetails.FinanceCost,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.FinanceCost,
            GotDetails.BudgetedHeadWiseCostingDetails.FinanceCost,
            GotDetails.ApprovedHeadWiseCostingDetails.FinanceCost,
            GivenDetails.HeadWiseCostingDetails.FinanceCost,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.FinanceCost,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.FinanceCost,
            GivenDetails.BudgetedHeadWiseCostingDetails.FinanceCost,
            GivenDetails.ApprovedHeadWiseCostingDetails.FinanceCost
        ]
    },
    {
        label: 'Depreciation',
        fields: [
            GotDetails.HeadWiseCostingDetails.Depreciation,
            GotDetails.HeadWiseSurfaceTreatmentDetails.Depreciation,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Depreciation,
            GotDetails.BudgetedHeadWiseCostingDetails.Depreciation,
            GotDetails.ApprovedHeadWiseCostingDetails.Depreciation,
            GivenDetails.HeadWiseCostingDetails.Depreciation,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.Depreciation,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Depreciation,
            GivenDetails.BudgetedHeadWiseCostingDetails.Depreciation,
            GivenDetails.ApprovedHeadWiseCostingDetails.Depreciation
        ]
    },
    {
        label: 'PBT',
        fields: [
            GotDetails.HeadWiseCostingDetails.PBT,
            GotDetails.HeadWiseSurfaceTreatmentDetails.PBT,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.PBT,
            GotDetails.BudgetedHeadWiseCostingDetails.PBT,
            GotDetails.ApprovedHeadWiseCostingDetails.PBT,
            GivenDetails.HeadWiseCostingDetails.PBT,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.PBT,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.PBT,
            GivenDetails.BudgetedHeadWiseCostingDetails.PBT,
            GivenDetails.ApprovedHeadWiseCostingDetails.PBT
        ]
    },
    {
        label: 'Amortization',
        fields: [
            GotDetails.HeadWiseCostingDetails.Amortization,
            GotDetails.HeadWiseSurfaceTreatmentDetails.Amortization,
            GotDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Amortization,
            GotDetails.BudgetedHeadWiseCostingDetails.Amortization,
            GotDetails.ApprovedHeadWiseCostingDetails.Amortization,
            GivenDetails.HeadWiseCostingDetails.Amortization,
            GivenDetails.HeadWiseSurfaceTreatmentDetails.Amortization,
            GivenDetails.HeadWiseCostingAndSurfaceTreatmentSumDetails.Amortization,
            GivenDetails.BudgetedHeadWiseCostingDetails.Amortization,
            GivenDetails.ApprovedHeadWiseCostingDetails.Amortization
        ]
    }]
    useEffect(() => {
        setTableData(Data)
    }, [])
    return <>
        <div className='d-flex justify-content-end'>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
        <div>
            <Table className='mt-2 table-bordered'>
                <thead>
                    <tr>
                        {renderTableHeaders(mainHeaders)}
                    </tr>
                </thead>
                <thead>
                    <tr>
                        {renderTableCells([Month, PartNumber, PartName, RevisionNumber, PlantName, PlantAddress, VendorName, CustomerName, BudgetedQuantity, ApprovedQuantity, EffectiveDate])}
                    </tr>
                </thead>
            </Table>
            <Table responsive className='table-bordered mb-0'>
                <tbody>
                    <tr>
                        <td></td>
                        <td colSpan={5} className='text-center font-weight-500 font-size-16'>Got Details</td>
                        <td colSpan={5} className='text-center font-weight-500 font-size-16'>Given Details</td>
                    </tr>
                    {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className={leftHeaderClass}>{row.label}</td>
                            {row.fields.map((field, fieldIndex) => (
                                <td key={fieldIndex}>
                                    {row.label === 'Raw Material Effective Date' ? checkValidData(field, DATE_TYPE) : checkForDecimalAndNull(field, initialConfiguration.NoOfDecimalForPrice)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    </>
}
export default GotGivenListing