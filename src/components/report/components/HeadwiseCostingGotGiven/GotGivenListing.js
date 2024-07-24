import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table } from 'reactstrap';
import { checkForDecimalAndNull } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper';
import { DATE_TYPE, EMPTY_DATA, HEAD_WISE_COSTING_GOT_GIVEN } from '../../../../config/constants';
import { useState } from 'react';
import { useEffect } from 'react';
import { getCostingGotAndGivenDetails } from '../../actions/ReportListing';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
// import ReactExport from 'react-export-excel';
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const mainHeaders = ["Month", "Part Number", "Part Name", "Revision Number", "Plant(Code)", "Plant Address", "Vendor(Code)", "Customer(Code)", "Budgeted Quantity", "Approved Quantity", "Effective Date"]
const gotHeader = ['', '', 'Got Details', '', '', '', 'Given Details']
function GotGivenListing(props) {
    const formData = useSelector(state => state.report.costReportFormGridData);
    const { initialConfiguration } = useSelector(state => state.auth)
    const [tableData, setTableData] = useState([]);
    const [gotDetails, setGotDetails] = useState([]);
    const [givenDetails, setGivenDetails] = useState([]);
    const [isLoader, setIsLoader] = useState('')
    const [topHeaderData, setTopHeaderData] = useState([])
    const dispatch = useDispatch()

    const cancelReport = () => {
        props.closeDrawer('')
    }

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
            if (DayTime(value).format('DD/MM/YYYY') === DayTime(formData?.EffectiveDate).format('DD/MM/YYYY')) {
                return <td key={index}>{checkValidData(value, DATE_TYPE)}</td>;
            } else {
                return <td key={index}>{checkValidData(value)}</td>;
            }

        });
    };


    const gotGivenLabels = () => {
        let Data = gotDetails.HeaderName
        let DataSecond = givenDetails.HeaderName
        const headerClass = `text-center font-weight-500`
        return (<>
            <td className={headerClass}> {Data?.Part}</td >
            {
                Data?.SurfaceTreatmentNames.map((item) => {
                    return < td className={headerClass}> {item}</td >
                })
            }
            <td className={headerClass}> {Data?.TotalOfPartAndSurfaceTreatment}</td >
            <td className={headerClass}> {Data?.BudgetedHeadWiseCosting}</td >
            <td className={headerClass}> {Data?.ActualHeadWiseCosting}</td >

            {/* GIVEN DETAILS */}
            <td className={headerClass}> {DataSecond?.Part}</td >
            {
                DataSecond?.SurfaceTreatmentNames.map((item) => {
                    return <td className={headerClass}> {item}</td >
                })
            }
            <td className={headerClass}> {DataSecond?.TotalOfPartAndSurfaceTreatment}</td >
            <td className={headerClass}> {DataSecond?.BudgetedHeadWiseCosting}</td >
            <td className={headerClass}> {DataSecond?.ActualHeadWiseCosting}</td >
        </>
        )
    }

    useEffect(() => {
        let obj = {}
        obj.effectiveDate = DayTime(formData?.EffectiveDate).format('YYYY-MM-DDTHH:mm:ss')
        obj.partId = formData?.part?.value
        obj.plantId = formData?.plant?.value
        obj.vendorId = formData?.vendor?.value
        obj.customerId = formData?.customer?.value

        setIsLoader(true)
        dispatch(getCostingGotAndGivenDetails(obj, (res) => {
            let Data = res.data && res.data.Data
            if (res.status === 200) {
                let GotDetails = Data.GotDetails
                let GivenDetails = Data.GivenDetails
                setGivenDetails(Data.GivenDetails)
                setGotDetails(Data.GotDetails)

                const DataTemplate = [{
                    label: 'Current Tentative Sale Rate',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.CurrentTentativeSaleRate,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.CurrentTentativeSaleRate }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.CurrentTentativeSaleRate,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.CurrentTentativeSaleRate,
                        GotDetails?.ActualHeadWiseCostingDetails?.CurrentTentativeSaleRate,
                        GivenDetails?.HeadWiseCostingDetails?.CurrentTentativeSaleRate,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.CurrentTentativeSaleRate }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.CurrentTentativeSaleRate,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.CurrentTentativeSaleRate,
                        GivenDetails?.ActualHeadWiseCostingDetails?.CurrentTentativeSaleRate,
                    ],
                },
                {
                    label: 'Raw Material Effective Date',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.RawMaterialEffectiveDate,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.RawMaterialEffectiveDate }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.RawMaterialEffectiveDate,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.RawMaterialEffectiveDate,
                        GotDetails?.ActualHeadWiseCostingDetails?.RawMaterialEffectiveDate,
                        GivenDetails?.HeadWiseCostingDetails?.RawMaterialEffectiveDate,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.RawMaterialEffectiveDate }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.RawMaterialEffectiveDate,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.RawMaterialEffectiveDate,
                        GivenDetails?.ActualHeadWiseCostingDetails?.RawMaterialEffectiveDate
                    ]
                },
                {
                    label: 'Net POPrice',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.NetPOPrice,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.NetPOPrice }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.NetPOPrice,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.NetPOPrice,
                        GotDetails?.ActualHeadWiseCostingDetails?.NetPOPrice,
                        GivenDetails?.HeadWiseCostingDetails?.NetPOPrice,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.NetPOPrice }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.NetPOPrice,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.NetPOPrice,
                        GivenDetails?.ActualHeadWiseCostingDetails?.NetPOPrice
                    ]
                },
                {
                    label: 'Provision Price',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.ProvisionPrice,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.ProvisionPrice }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.ProvisionPrice,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.ProvisionPrice,
                        GotDetails?.ActualHeadWiseCostingDetails?.ProvisionPrice,
                        GivenDetails?.HeadWiseCostingDetails?.ProvisionPrice,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.ProvisionPrice }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.ProvisionPrice,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.ProvisionPrice,
                        GivenDetails?.ActualHeadWiseCostingDetails?.ProvisionPrice
                    ]
                },
                {
                    label: 'Net Sales',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.NetSales,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.NetSales }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.NetSales,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.NetSales,
                        GotDetails?.ActualHeadWiseCostingDetails?.NetSales,
                        GivenDetails?.HeadWiseCostingDetails?.NetSales,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.NetSales }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.NetSales,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.NetSales,
                        GivenDetails?.ActualHeadWiseCostingDetails?.NetSales
                    ]
                },
                {
                    label: 'Consumption',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.Consumption,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Consumption }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Consumption,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.Consumption,
                        GotDetails?.ActualHeadWiseCostingDetails?.Consumption,
                        GivenDetails?.HeadWiseCostingDetails?.Consumption,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Consumption }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Consumption,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.Consumption,
                        GivenDetails?.ActualHeadWiseCostingDetails?.Consumption
                    ]
                },
                {
                    label: 'Labour Cost',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.LabourCost,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.LabourCost }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.LabourCost,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.LabourCost,
                        GotDetails?.ActualHeadWiseCostingDetails?.LabourCost,
                        GivenDetails?.HeadWiseCostingDetails?.LabourCost,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.LabourCost }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.LabourCost,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.LabourCost,
                        GivenDetails?.ActualHeadWiseCostingDetails?.LabourCost
                    ]
                },
                {
                    label: 'Manufacturing Expenses',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.ManufacturingExpenses,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.ManufacturingExpenses }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.ManufacturingExpenses,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.ManufacturingExpenses,
                        GotDetails?.ActualHeadWiseCostingDetails?.ManufacturingExpenses,
                        GivenDetails?.HeadWiseCostingDetails?.ManufacturingExpenses,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.ManufacturingExpenses }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.ManufacturingExpenses,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.ManufacturingExpenses,
                        GivenDetails?.ActualHeadWiseCostingDetails?.ManufacturingExpenses
                    ]
                },
                {
                    label: 'Office Expenses',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.OfficeExpenses,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.OfficeExpenses }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.OfficeExpenses,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.OfficeExpenses,
                        GotDetails?.ActualHeadWiseCostingDetails?.OfficeExpenses,
                        GivenDetails?.HeadWiseCostingDetails?.OfficeExpenses,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.OfficeExpenses }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.OfficeExpenses,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.OfficeExpenses,
                        GivenDetails?.ActualHeadWiseCostingDetails?.OfficeExpenses
                    ]
                },
                {
                    label: 'Repairs Expenses',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.RepairsExpenses,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.RepairsExpenses }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.RepairsExpenses,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.RepairsExpenses,
                        GotDetails?.ActualHeadWiseCostingDetails?.RepairsExpenses,
                        GivenDetails?.HeadWiseCostingDetails?.RepairsExpenses,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.RepairsExpenses }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.RepairsExpenses,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.RepairsExpenses,
                        GivenDetails?.ActualHeadWiseCostingDetails?.RepairsExpenses
                    ]
                },
                {
                    label: 'Selling and Distribution Expenses',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.SellingAndDistributionExpenses,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.SellingAndDistributionExpenses }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.SellingAndDistributionExpenses,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.SellingAndDistributionExpenses,
                        GotDetails?.ActualHeadWiseCostingDetails?.SellingAndDistributionExpenses,
                        GivenDetails?.HeadWiseCostingDetails?.SellingAndDistributionExpenses,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.SellingAndDistributionExpenses }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.SellingAndDistributionExpenses,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.SellingAndDistributionExpenses,
                        GivenDetails?.ActualHeadWiseCostingDetails?.SellingAndDistributionExpenses
                    ]
                },
                {
                    label: 'Common Expenses',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.CommonExpenses,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.CommonExpenses }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.CommonExpenses,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.CommonExpenses,
                        GotDetails?.ActualHeadWiseCostingDetails?.CommonExpenses,
                        GivenDetails?.HeadWiseCostingDetails?.CommonExpenses,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.CommonExpenses }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.CommonExpenses,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.CommonExpenses,
                        GivenDetails?.ActualHeadWiseCostingDetails?.CommonExpenses
                    ]
                },
                {
                    label: 'Staff Cost',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.StaffCost,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.StaffCost }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.StaffCost,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.StaffCost,
                        GotDetails?.ActualHeadWiseCostingDetails?.StaffCost,
                        GivenDetails?.HeadWiseCostingDetails?.StaffCost,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.StaffCost }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.StaffCost,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.StaffCost,
                        GivenDetails?.ActualHeadWiseCostingDetails?.StaffCost
                    ]
                },
                {
                    label: 'EBIDTA',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.EBIDTA,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.EBIDTA }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.EBIDTA,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.EBIDTA,
                        GotDetails?.ActualHeadWiseCostingDetails?.EBIDTA,
                        GivenDetails?.HeadWiseCostingDetails?.EBIDTA,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.EBIDTA }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.EBIDTA,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.EBIDTA,
                        GivenDetails?.ActualHeadWiseCostingDetails?.EBIDTA
                    ]
                },
                {
                    label: 'Finance Cost',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.FinanceCost,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.FinanceCost }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.FinanceCost,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.FinanceCost,
                        GotDetails?.ActualHeadWiseCostingDetails?.FinanceCost,
                        GivenDetails?.HeadWiseCostingDetails?.FinanceCost,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.FinanceCost }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.FinanceCost,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.FinanceCost,
                        GivenDetails?.ActualHeadWiseCostingDetails?.FinanceCost
                    ]
                },
                {
                    label: 'Depreciation',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.Depreciation,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Depreciation }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Depreciation,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.Depreciation,
                        GotDetails?.ActualHeadWiseCostingDetails?.Depreciation,
                        GivenDetails?.HeadWiseCostingDetails?.Depreciation,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Depreciation }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Depreciation,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.Depreciation,
                        GivenDetails?.ActualHeadWiseCostingDetails?.Depreciation
                    ]
                },
                {
                    label: 'PBT',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.PBT,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.PBT }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.PBT,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.PBT,
                        GotDetails?.ActualHeadWiseCostingDetails?.PBT,
                        GivenDetails?.HeadWiseCostingDetails?.PBT,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.PBT }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.PBT,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.PBT,
                        GivenDetails?.ActualHeadWiseCostingDetails?.PBT
                    ]
                },
                {
                    label: 'Amortization',
                    fields: [
                        GotDetails?.HeadWiseCostingDetails?.Amortization,
                        ...GotDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Amortization }),
                        GotDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Amortization,
                        GotDetails?.BudgetedHeadWiseCostingDetails?.Amortization,
                        GotDetails?.ActualHeadWiseCostingDetails?.Amortization,
                        GivenDetails?.HeadWiseCostingDetails?.Amortization,
                        ...GivenDetails?.HeadWiseSurfaceTreatmentDetails.map((item) => { return item.Amortization }),
                        GivenDetails?.HeadWiseCostingAndSurfaceTreatmentSumDetails?.Amortization,
                        GivenDetails?.BudgetedHeadWiseCostingDetails?.Amortization,
                        GivenDetails?.ActualHeadWiseCostingDetails?.Amortization
                    ]
                }]
                let obj = {
                    Month: Data.Month,
                    PartNumber: Data.PartNumber,
                    PartName: Data.PartName,
                    RevisionNumber: Data.RevisionNumber,
                    PlantName: Data.Plant,
                    PlantAddress: Data.PlantAddress,
                    VendorName: Data.Vendor,
                    CustomerName: Data.Customer,
                    BudgetedQuantity: Data.CBCBudgetedQuantity,
                    ApprovedQuantity: Data.CBCApprovedQuantity,
                    EffectiveDate: Data.SelectedEffectiveDate ? DayTime(Data.SelectedEffectiveDate).format('DD/MM/YYYY') : '-',
                }
                setTopHeaderData([obj]);
                setIsLoader(false)
                setTableData(DataTemplate)
            } else {
                setIsLoader(false)
            }
        }))

    }, [])

    const renderexcel = () => {
        const detailHeaders = [gotDetails?.HeaderName?.CRMHeader, gotDetails?.HeaderName?.Part, gotDetails?.HeaderName?.TotalOfPartAndSurfaceTreatment, gotDetails?.HeaderName?.BudgetedHeadWiseCosting, gotDetails?.HeaderName?.ActualHeadWiseCosting, givenDetails?.HeaderName?.Part, givenDetails?.HeaderName?.TotalOfPartAndSurfaceTreatment, givenDetails?.HeaderName?.BudgetedHeadWiseCosting, givenDetails?.HeaderName?.ActualHeadWiseCosting]
        let mainArray = []
        let tableArray = []
        topHeaderData?.map((item) => {
            let tempArray = []
            tempArray?.push(item?.Month)
            tempArray?.push(item?.PartNumber)
            tempArray?.push(item?.PartName)
            tempArray?.push(item?.RevisionNumber)
            tempArray?.push(item?.PlantName)
            tempArray?.push(item?.PlantAddress)
            tempArray?.push(item?.VendorName)
            tempArray?.push(item?.CustomerName)
            tempArray?.push(item?.BudgetedQuantity)
            tempArray?.push(item?.ApprovedQuantity)
            tempArray?.push(item?.EffectiveDate)
            mainArray.push(tempArray)
            return null
        })
        tableData?.map((item) => {
            const fieldsArray = item?.fields?.map(field => field ?? '-');
            tableArray.push([item?.label, ...fieldsArray]);
            return null;
        });
        const multiDataSet = [
            {
                columns: mainHeaders,
                data: mainArray
            },
            {
                ySteps: 2, //will put space of 2 rows,
                columns: gotHeader,
                data: []
            },
            {
                ySteps: 0, //will put space of 0 rows,
                columns: detailHeaders,
                data: tableArray
            }
        ];
        return multiDataSet
    }


    const returnExcelColumn = () => {
        let multiDataSet = renderexcel()
        // return (
        //     <ExcelSheet dataSet={multiDataSet} name={HEAD_WISE_COSTING_GOT_GIVEN} />
        // );
    }

    return <>
        {isLoader && <LoaderCustom />}
        <div className='d-flex justify-content-end'>
            {/* <ExcelFile filename={HEAD_WISE_COSTING_GOT_GIVEN} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                {returnExcelColumn()}
            </ExcelFile> */}
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div >
        <div>
            <Table className='mt-2 table-bordered'>
                <thead>
                    <tr>
                        {renderTableHeaders(mainHeaders)}
                    </tr>
                </thead>
                <thead>
                    <tr>
                        {renderTableCells([topHeaderData[0]?.Month, topHeaderData[0]?.PartNumber, topHeaderData[0]?.PartName, topHeaderData[0]?.RevisionNumber, topHeaderData[0]?.PlantName, topHeaderData[0]?.PlantAddress, topHeaderData[0]?.VendorName, topHeaderData[0]?.CustomerName, topHeaderData[0]?.BudgetedQuantity, topHeaderData[0]?.ApprovedQuantity, topHeaderData[0]?.EffectiveDate])}
                    </tr >
                </thead >
            </Table >
            <Table responsive className='table-bordered mb-0 got-given-listing'>
                <tbody>
                    <tr className='sub-headers'>
                        <td></td>
                        <td colSpan={tableData ? (tableData[0]?.fields?.length) / 2 : 5} className='text-center font-weight-500 font-size-16'>Got Details</td>
                        <td colSpan={tableData ? (tableData[0]?.fields?.length) / 2 : 5} className='text-center font-weight-500 font-size-16'>Given Details</td>
                    </tr>
                    {gotDetails?.length === 0 && givenDetails?.length === 0 ? <tr><td colSpan={3}><NoContentFound title={EMPTY_DATA} /></td></tr> : <tr>
                        <td className='text-center font-weight-500 font-size-16'>Parameters</td>
                        {gotGivenLabels()}
                    </tr>}
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
        </div >
    </>
}
export default GotGivenListing
