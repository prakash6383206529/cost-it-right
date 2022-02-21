import React, { useState, useEffect, Fragment } from 'react'
import DayTime from '../../common/DayTimeWrapper'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import NoContentFound from '../../common/NoContentFound'
import { REPORT_DOWNLOAD_EXCEl, REPORT_DOWNLOAD_SAP_EXCEl } from '../../../config/masterData';
import { GridTotalFormate } from '../../common/TableGridFunctions'
import { getCostingReport, getReportListing } from '.././actions/ReportListing'
import { getSingleCostingDetails, setCostingViewData } from '../../costing/actions/Costing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { CREATED_BY_ASSEMBLY, DRAFT, ReportMaster, ReportSAPMaster, EMPTY_DATA } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import CostingDetailSimulationDrawer from '../../simulation/components/CostingDetailSimulationDrawer'
import { formViewData } from '../../../helper'


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};


function ReportListing(props) {




    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState(props.Ids);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [createDate, setCreateDate] = useState(Date);
    const [costingVersionChange, setCostingVersion] = useState('');
    const [tableData, setTableData] = useState([])
    const [isLoader, setLoader] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [userId, setUserId] = useState(false)
    const [warningMessage, setWarningMessage] = useState(false)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [pageSize10, setPageSize10] = useState(true)
    const [pageSize50, setPageSize50] = useState(false)
    const [pageSize100, setPageSize100] = useState(false)
    const [pageNo, setPageNo] = useState(1)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingNumber: "", TechnologyName: "", AmorizationQuantity: "", AnyOtherCost: "", CostingVersion: "", DisplayStatus: "", EffectiveDate: "", Currency: "", DepartmentCode: "", DepartmentName: "", DiscountCost: "", ECNNumber: "", FinalPOPrice: "", FinishWeight: "", FreightCost: "", FreightPercentage: "", FreightType: "", GrossWeight: "", HundiOrDiscountValue: "", ICCApplicability: "", ICCCost: "", ICCInterestRate: "", ICCOn: "", MasterBatchTotal: "", ModelTypeForOverheadAndProfit: "", ModifiedByName: "", ModifiedByUserName: "", ModifiedDate: "", NetBoughtOutPartCost: "", NetConversionCost: "", NetConvertedPOPrice: "", NetDiscountsCost: "", NetFreightPackaging: "", NetFreightPackagingCost: "", NetICCCost: "", NetOperationCost: "", NetOtherCost: "", NetOverheadAndProfitCost: "", NetPOPrice: "", NetPOPriceINR: "", NetPOPriceInCurrency: "", NetPOPriceOtherCurrency: "", NetProcessCost: "", NetRawMaterialsCost: "", NetSurfaceTreatmentCost: "", NetToolCost: "", NetTotalRMBOPCC: "", OtherCost: "", OtherCostPercentage: "", OverheadApplicability: "", OverheadCombinedCost: "", OverheadCost: "", OverheadOn: "", OverheadPercentage: "", PackagingCost: "", PackagingCostPercentage: "", PartName: "", PartNumber: "", PartType: "", PaymentTermCost: "", PaymentTermsOn: "", PlantCode: "", PlantName: "", ProfitApplicability: "", ProfitCost: "", ProfitOn: "", ProfitPercentage: "", RMGrade: "", RMSpecification: "", RawMaterialCode: "", RawMaterialGrossWeight: "", RawMaterialName: "", RawMaterialRate: "", RawMaterialScrapWeight: "", RawMaterialSpecification: "", RecordInsertedBy: "", RejectOn: "", RejectionApplicability: "", RejectionCost: "", RejectionPercentage: "", Remark: "", Rev: "", RevisionNumber: "", ScrapRate: "", ScrapWeight: "", SurfaceTreatmentCost: "", ToolCost: "", ToolLife: "", ToolMaintenaceCost: "", ToolPrice: "", ToolQuantity: "", TotalCost: "", TotalOtherCost: "", TotalRecordCount: "", TransportationCost: "", VendorCode: "", VendorName: "", Version: "" })
    const [enableSearchFilterSearchButton, setEnableSearchFilterButton] = useState(true)


    const [reportListingDataStateArray, setReportListingDataStateArray] = useState([])


    const dispatch = useDispatch()

    const { handleSubmit, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })


    let reportListingData = useSelector((state) => state.report.reportListing)


    const simulatedOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cellValue != null ? cellValue : '';
    }


    const createDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        setCreateDate(cellValue)
    }

    const linkableFormatter = (props) => {
        let tempDate = props.data.CreatedDate
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = `${DayTime(tempDate).format('DD/MM/YYYY')}-${cellValue}`
        setCostingVersion(temp);
        return temp
    }




    // @method hyperLinkFormatter( This function will make the first column details into hyperlink )

    const hyperLinkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <div
                    onClick={() => viewDetails(row.UserId, cell, row)}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }


    const viewDetails = (UserId, cell, row) => {

        if (row.BaseCostingId && Object.keys(row.BaseCostingId).length > 0) {
            dispatch(getSingleCostingDetails(row.BaseCostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data

                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
            },
            ))
        }

        setIsOpen(true)
        setUserId(UserId)

    }

    const closeUserDetails = () => {
        setIsOpen(false)
        setUserId("")

    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = DayTime(cellValue).format('DD/MM/YYYY h:m:s')
        return temp
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
    * @method effectiveDateFormatter
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.Status}</div>
    }

    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = (skip, take, isPagination, data) => {


        dispatch(getCostingReport(skip, take, isPagination, data, (res) => {
            if (res) {
                setLoader(false)
            }

        }))

    }


    useEffect(() => {

        setLoader(true)
        getTableData(0, 100, true, floatingFilterData);


    }, [])




    const onBtNext = () => {

        if (currentRowIndex < (totalRecordCount - 10)) {

            setPageNo(pageNo + 1)
            const nextNo = currentRowIndex + 10;

            getTableData(nextNo, 100, true, floatingFilterData);
            setCurrentRowIndex(nextNo)
        }

    };

    const onBtPrevious = () => {

        if (currentRowIndex >= 10) {

            setPageNo(pageNo - 1)
            const previousNo = currentRowIndex - 10;

            getTableData(previousNo, 100, true, floatingFilterData);
            setCurrentRowIndex(previousNo)

        }
    }




    useEffect(() => {

        setReportListingDataStateArray(reportListingData)
        if (reportListingData.length > 0) {

            if (totalRecordCount === 0) {
                setTotalRecordCount(reportListingData[0].TotalRecordCount)

            }

        }


    }, [reportListingData])


    const onFloatingFilterChanged = (value) => {


        setWarningMessage(true)
        setEnableSearchFilterButton(false)

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            setWarningMessage(false)

            return false
        } else {

            if (value.column.colId === 'CostingNumber') { setFloatingFilterData({ ...floatingFilterData, CostingNumber: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'TechnologyName') { setFloatingFilterData({ ...floatingFilterData, TechnologyName: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'AmorizationQuantity') { setFloatingFilterData({ ...floatingFilterData, AmorizationQuantity: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'AnyOtherCost') { setFloatingFilterData({ ...floatingFilterData, AnyOtherCost: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'CostingVersion') { setFloatingFilterData({ ...floatingFilterData, CostingVersion: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'DisplayStatus') { setFloatingFilterData({ ...floatingFilterData, DisplayStatus: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'EffectiveDate') { setFloatingFilterData({ ...floatingFilterData, EffectiveDate: DayTime(value.filterInstance.appliedModel.filter).format("YYYY-DD-MMTHH:mm:ss") }) }

            if (value.column.colId === 'Currency') { setFloatingFilterData({ ...floatingFilterData, Currency: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'DepartmentCode') { setFloatingFilterData({ ...floatingFilterData, DepartmentCode: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'DepartmentName') { setFloatingFilterData({ ...floatingFilterData, DepartmentName: value.filterInstance.appliedModel.filter }) }


            if (value.column.colId === 'DiscountCost') { setFloatingFilterData({ ...floatingFilterData, DiscountCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ECNNumber') { setFloatingFilterData({ ...floatingFilterData, ECNNumber: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'FinalPOPrice') { setFloatingFilterData({ ...floatingFilterData, FinalPOPrice: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'FinishWeight') { setFloatingFilterData({ ...floatingFilterData, FinishWeight: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'FreightCost') { setFloatingFilterData({ ...floatingFilterData, FreightCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'FreightPercentage') { setFloatingFilterData({ ...floatingFilterData, FreightPercentage: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'FreightType') { setFloatingFilterData({ ...floatingFilterData, FreightType: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'GrossWeight') { setFloatingFilterData({ ...floatingFilterData, GrossWeight: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'HundiOrDiscountValue') { setFloatingFilterData({ ...floatingFilterData, HundiOrDiscountValue: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ICCApplicability') { setFloatingFilterData({ ...floatingFilterData, ICCApplicability: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ICCCost') { setFloatingFilterData({ ...floatingFilterData, ICCCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ICCInterestRate') { setFloatingFilterData({ ...floatingFilterData, ICCInterestRate: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ICCOn') { setFloatingFilterData({ ...floatingFilterData, ICCOn: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'MasterBatchTotal') { setFloatingFilterData({ ...floatingFilterData, MasterBatchTotal: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ModelTypeForOverheadAndProfit') { setFloatingFilterData({ ...floatingFilterData, ModelTypeForOverheadAndProfit: value.filterInstance.appliedModel.filter }) }


            if (value.column.colId === 'ModifiedByName') { setFloatingFilterData({ ...floatingFilterData, ModifiedByName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ModifiedByUserName') { setFloatingFilterData({ ...floatingFilterData, ModifiedByUserName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ModifiedDate') { setFloatingFilterData({ ...floatingFilterData, ModifiedDate: DayTime(value.filterInstance.appliedModel.filter).format("YYYY-DD-MMTHH:mm:ss") }) }
            if (value.column.colId === 'NetBoughtOutPartCost') { setFloatingFilterData({ ...floatingFilterData, NetBoughtOutPartCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetConversionCost') { setFloatingFilterData({ ...floatingFilterData, NetConversionCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetConvertedPOPrice') { setFloatingFilterData({ ...floatingFilterData, NetConvertedPOPrice: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetDiscountsCost') { setFloatingFilterData({ ...floatingFilterData, NetDiscountsCost: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'NetFreightPackaging') { setFloatingFilterData({ ...floatingFilterData, NetFreightPackaging: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetFreightPackagingCost') { setFloatingFilterData({ ...floatingFilterData, NetFreightPackagingCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetICCCost') { setFloatingFilterData({ ...floatingFilterData, NetICCCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetOperationCost') { setFloatingFilterData({ ...floatingFilterData, NetOperationCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetOtherCost') { setFloatingFilterData({ ...floatingFilterData, NetOtherCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetOverheadAndProfitCost') { setFloatingFilterData({ ...floatingFilterData, NetOverheadAndProfitCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetPOPrice') { setFloatingFilterData({ ...floatingFilterData, NetPOPrice: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetPOPriceINR') { setFloatingFilterData({ ...floatingFilterData, NetPOPriceINR: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetPOPriceInCurrency') { setFloatingFilterData({ ...floatingFilterData, NetPOPriceInCurrency: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetPOPriceOtherCurrency') { setFloatingFilterData({ ...floatingFilterData, NetPOPriceOtherCurrency: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetProcessCost') { setFloatingFilterData({ ...floatingFilterData, NetProcessCost: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'NetRawMaterialsCost') { setFloatingFilterData({ ...floatingFilterData, NetRawMaterialsCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetSurfaceTreatmentCost') { setFloatingFilterData({ ...floatingFilterData, NetSurfaceTreatmentCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetToolCost') { setFloatingFilterData({ ...floatingFilterData, NetToolCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'NetTotalRMBOPCC') { setFloatingFilterData({ ...floatingFilterData, NetTotalRMBOPCC: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OtherCost') { setFloatingFilterData({ ...floatingFilterData, OtherCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OtherCostPercentage') { setFloatingFilterData({ ...floatingFilterData, OtherCostPercentage: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OverheadApplicability') { setFloatingFilterData({ ...floatingFilterData, OverheadApplicability: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OverheadCombinedCost') { setFloatingFilterData({ ...floatingFilterData, OverheadCombinedCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OverheadCost') { setFloatingFilterData({ ...floatingFilterData, OverheadCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OverheadOn') { setFloatingFilterData({ ...floatingFilterData, OverheadOn: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'OverheadPercentage') { setFloatingFilterData({ ...floatingFilterData, OverheadPercentage: value.filterInstance.appliedModel.filter }) }

            if (value.column.colId === 'PackagingCost') { setFloatingFilterData({ ...floatingFilterData, PackagingCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PackagingCostPercentage') { setFloatingFilterData({ ...floatingFilterData, PackagingCostPercentage: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PartName') { setFloatingFilterData({ ...floatingFilterData, PartName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PartNumber') { setFloatingFilterData({ ...floatingFilterData, PartNumber: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PartType') { setFloatingFilterData({ ...floatingFilterData, PartType: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PaymentTermCost') { setFloatingFilterData({ ...floatingFilterData, PaymentTermCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PaymentTermsOn') { setFloatingFilterData({ ...floatingFilterData, PaymentTermsOn: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PlantCode') { setFloatingFilterData({ ...floatingFilterData, PlantCode: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'PlantName') { setFloatingFilterData({ ...floatingFilterData, PlantName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ProfitApplicability') { setFloatingFilterData({ ...floatingFilterData, ProfitApplicability: value.filterInstance.appliedModel.filter }) }


            if (value.column.colId === 'ProfitCost') { setFloatingFilterData({ ...floatingFilterData, ProfitCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ProfitOn') { setFloatingFilterData({ ...floatingFilterData, ProfitOn: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ProfitPercentage') { setFloatingFilterData({ ...floatingFilterData, ProfitPercentage: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RMGrade') { setFloatingFilterData({ ...floatingFilterData, RMGrade: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RMSpecification') { setFloatingFilterData({ ...floatingFilterData, RMSpecification: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialCode') { setFloatingFilterData({ ...floatingFilterData, RawMaterialCode: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialGrade') { setFloatingFilterData({ ...floatingFilterData, RawMaterialGrade: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialGrossWeight') { setFloatingFilterData({ ...floatingFilterData, RawMaterialGrossWeight: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialName') { setFloatingFilterData({ ...floatingFilterData, RawMaterialName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialRate') { setFloatingFilterData({ ...floatingFilterData, RawMaterialRate: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialScrapWeight') { setFloatingFilterData({ ...floatingFilterData, RawMaterialScrapWeight: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RawMaterialSpecification') { setFloatingFilterData({ ...floatingFilterData, RawMaterialSpecification: value.filterInstance.appliedModel.filter }) }



            if (value.column.colId === 'RecordInsertedBy') { setFloatingFilterData({ ...floatingFilterData, RecordInsertedBy: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RejectOn') { setFloatingFilterData({ ...floatingFilterData, RejectOn: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RejectionApplicability') { setFloatingFilterData({ ...floatingFilterData, RejectionApplicability: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RejectionCost') { setFloatingFilterData({ ...floatingFilterData, RejectionCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RejectionPercentage') { setFloatingFilterData({ ...floatingFilterData, RejectionPercentage: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'Remark') { setFloatingFilterData({ ...floatingFilterData, Remark: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'Rev') { setFloatingFilterData({ ...floatingFilterData, Rev: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'RevisionNumber') { setFloatingFilterData({ ...floatingFilterData, RevisionNumber: value.filterInstance.appliedModel.filter }) }


            if (value.column.colId === 'ScrapRate') { setFloatingFilterData({ ...floatingFilterData, ScrapRate: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ScrapWeight') { setFloatingFilterData({ ...floatingFilterData, ScrapWeight: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'SurfaceTreatmentCost') { setFloatingFilterData({ ...floatingFilterData, SurfaceTreatmentCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ToolCost') { setFloatingFilterData({ ...floatingFilterData, ToolCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ToolLife') { setFloatingFilterData({ ...floatingFilterData, ToolLife: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ToolMaintenaceCost') { setFloatingFilterData({ ...floatingFilterData, ToolMaintenaceCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ToolPrice') { setFloatingFilterData({ ...floatingFilterData, RevisionNumber: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'ToolQuantity') { setFloatingFilterData({ ...floatingFilterData, ToolQuantity: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'TotalCost') { setFloatingFilterData({ ...floatingFilterData, TotalCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'TotalOtherCost') { setFloatingFilterData({ ...floatingFilterData, TotalOtherCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'TotalRecordCount') { setFloatingFilterData({ ...floatingFilterData, TotalRecordCount: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'TransportationCost') { setFloatingFilterData({ ...floatingFilterData, TransportationCost: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'VendorCode') { setFloatingFilterData({ ...floatingFilterData, VendorCode: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'VendorName') { setFloatingFilterData({ ...floatingFilterData, VendorName: value.filterInstance.appliedModel.filter }) }
            if (value.column.colId === 'Version') { setFloatingFilterData({ ...floatingFilterData, Version: value.filterInstance.appliedModel.filter }) }

        }


    }




    const onSearch = () => {

        setWarningMessage(false)
        setPageNo(1)
        setCurrentRowIndex(0)

        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        getTableData(0, 100, true, floatingFilterData);

        setEnableSearchFilterButton(true)

    }





    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };


    const onGridReady = (params) => {

        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);



    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));


        if (Number(newPageSize) === 10) {
            setPageSize10(true)
            setPageSize50(false)
            setPageSize100(false)

        }
        else if (Number(newPageSize) === 50) {
            setPageSize10(false)
            setPageSize50(true)
            setPageSize100(false)
        }

        else if (Number(newPageSize) === 100) {
            setPageSize10(false)
            setPageSize50(false)
            setPageSize100(true)
        }


    };


    useEffect(() => {

    }, [tableData])


    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        createDateFormatter: createDateFormatter,
        hyphenFormatter: hyphenFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter,
        statusFormatter: statusFormatter,
        //customLoadingOverlay: LoaderCustom
        hyperLinkableFormatter: hyperLinkableFormatter,
        effectiveDateFormatter: effectiveDateFormatter,

    };



    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);



        //this.setState({ floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "" } })
        let emptyObj = { CostingNumber: "", TechnologyName: "", AmorizationQuantity: "", AnyOtherCost: "", CostingVersion: "", DisplayStatus: "", EffectiveDate: "", Currency: "", DepartmentCode: "", DepartmentName: "", DiscountCost: "", ECNNumber: "", FinalPOPrice: "", FinishWeight: "", FreightCost: "", FreightPercentage: "", FreightType: "", GrossWeight: "", HundiOrDiscountValue: "", ICCApplicability: "", ICCCost: "", ICCInterestRate: "", ICCOn: "", MasterBatchTotal: "", ModelTypeForOverheadAndProfit: "", ModifiedByName: "", ModifiedByUserName: "", ModifiedDate: "", NetBoughtOutPartCost: "", NetConversionCost: "", NetConvertedPOPrice: "", NetDiscountsCost: "", NetFreightPackaging: "", NetFreightPackagingCost: "", NetICCCost: "", NetOperationCost: "", NetOtherCost: "", NetOverheadAndProfitCost: "", NetPOPrice: "", NetPOPriceINR: "", NetPOPriceInCurrency: "", NetPOPriceOtherCurrency: "", NetProcessCost: "", NetRawMaterialsCost: "", NetSurfaceTreatmentCost: "", NetToolCost: "", NetTotalRMBOPCC: "", OtherCost: "", OtherCostPercentage: "", OverheadApplicability: "", OverheadCombinedCost: "", OverheadCost: "", OverheadOn: "", OverheadPercentage: "", PackagingCost: "", PackagingCostPercentage: "", PartName: "", PartNumber: "", PartType: "", PaymentTermCost: "", PaymentTermsOn: "", PlantCode: "", PlantName: "", ProfitApplicability: "", ProfitCost: "", ProfitOn: "", ProfitPercentage: "", RMGrade: "", RMSpecification: "", RawMaterialCode: "", RawMaterialGrossWeight: "", RawMaterialName: "", RawMaterialRate: "", RawMaterialScrapWeight: "", RawMaterialSpecification: "", RecordInsertedBy: "", RejectOn: "", RejectionApplicability: "", RejectionCost: "", RejectionPercentage: "", Remark: "", Rev: "", RevisionNumber: "", ScrapRate: "", ScrapWeight: "", SurfaceTreatmentCost: "", ToolCost: "", ToolLife: "", ToolMaintenaceCost: "", ToolPrice: "", ToolQuantity: "", TotalCost: "", TotalOtherCost: "", TotalRecordCount: "", TransportationCost: "", VendorCode: "", VendorName: "", Version: "" }


        setFloatingFilterData({ CostingNumber: "", TechnologyName: "", AmorizationQuantity: "", AnyOtherCost: "", CostingVersion: "", DisplayStatus: "", EffectiveDate: "", Currency: "", DepartmentCode: "", DepartmentName: "", DiscountCost: "", ECNNumber: "", FinalPOPrice: "", FinishWeight: "", FreightCost: "", FreightPercentage: "", FreightType: "", GrossWeight: "", HundiOrDiscountValue: "", ICCApplicability: "", ICCCost: "", ICCInterestRate: "", ICCOn: "", MasterBatchTotal: "", ModelTypeForOverheadAndProfit: "", ModifiedByName: "", ModifiedByUserName: "", ModifiedDate: "", NetBoughtOutPartCost: "", NetConversionCost: "", NetConvertedPOPrice: "", NetDiscountsCost: "", NetFreightPackaging: "", NetFreightPackagingCost: "", NetICCCost: "", NetOperationCost: "", NetOtherCost: "", NetOverheadAndProfitCost: "", NetPOPrice: "", NetPOPriceINR: "", NetPOPriceInCurrency: "", NetPOPriceOtherCurrency: "", NetProcessCost: "", NetRawMaterialsCost: "", NetSurfaceTreatmentCost: "", NetToolCost: "", NetTotalRMBOPCC: "", OtherCost: "", OtherCostPercentage: "", OverheadApplicability: "", OverheadCombinedCost: "", OverheadCost: "", OverheadOn: "", OverheadPercentage: "", PackagingCost: "", PackagingCostPercentage: "", PartName: "", PartNumber: "", PartType: "", PaymentTermCost: "", PaymentTermsOn: "", PlantCode: "", PlantName: "", ProfitApplicability: "", ProfitCost: "", ProfitOn: "", ProfitPercentage: "", RMGrade: "", RMSpecification: "", RawMaterialCode: "", RawMaterialGrossWeight: "", RawMaterialName: "", RawMaterialRate: "", RawMaterialScrapWeight: "", RawMaterialSpecification: "", RecordInsertedBy: "", RejectOn: "", RejectionApplicability: "", RejectionCost: "", RejectionPercentage: "", Remark: "", Rev: "", RevisionNumber: "", ScrapRate: "", ScrapWeight: "", SurfaceTreatmentCost: "", ToolCost: "", ToolLife: "", ToolMaintenaceCost: "", ToolPrice: "", ToolQuantity: "", TotalCost: "", TotalOtherCost: "", TotalRecordCount: "", TransportationCost: "", VendorCode: "", VendorName: "", Version: "" })


        setPageNo(1)
        getTableData(0, 100, true, emptyObj);




    }

    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        var selected = gridApi.getSelectedNodes()
        setSelectedRowData(selectedRows)

    }

    const renderColumn = (fileName) => {

        let tempData
        if (selectedRowData.length == 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumn(REPORT_DOWNLOAD_EXCEl, tempData)

    }

    const returnExcelColumn = (data = [], TempData) => {
        // console.log('TempData: ', TempData);



        return (<ExcelSheet data={TempData} name={ReportMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    const renderColumnSAP = (fileName) => {
        let tempData = []

        if (selectedRowData.length === 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumnSAP(REPORT_DOWNLOAD_SAP_EXCEl, tempData)


    }


    const renderColumnSAPEncoded = (fileName) => {
        console.log('fileName: ', fileName);
        let tempData = []

        if (selectedRowData.length === 0) {


            tempData = reportListingData

        }
        else {
            tempData = selectedRowData

        }
        return returnExcelColumnSAPEncoded(REPORT_DOWNLOAD_SAP_EXCEl, tempData)


    }




    const returnExcelColumnSAP = (data = [], TempData) => {

        // console.log('TempData: ', TempData);
        let temp = []

        return (<ExcelSheet data={TempData} name={ReportSAPMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }


    const returnExcelColumnSAPEncoded = (data = [], TempData) => {

        // console.log('TempData: ', TempData);
        let temp = []



        TempData && TempData.map(item => {

            temp.push({ SrNo: btoa(item.SrNo), SANumber: btoa(item.SANumber), LineNumber: btoa(item.LineNumber), CreatedDate: btoa(item.CreatedDate), NetPOPrice: btoa(item.NetPOPrice), Reason: btoa(item.Reason), Text: btoa(item.Text), PersonRequestingChange: btoa(item.PersonRequestingChange) })
            return null;
        });




        return (<ExcelSheet data={temp} name={ReportSAPMaster}>
            {data && data.map((ele, index) => < ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    /**
    * @method onSubmit
    * @description filtering data on Apply button
    */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }


    return (
        <div className="container-fluid part-manage-component report-listing-page ag-grid-react">
            {isLoader && <LoaderCustom />}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>

                <Row className="pt-4 blue-before ">

                    <Col md="8">
                        <div className="warning-message mt-1">
                            {warningMessage && <WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} />}
                        </div>
                    </Col>


                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100 mb-4 pb-2">
                            <div>
                                <button disabled={enableSearchFilterSearchButton} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                    {renderColumn(ReportMaster)}
                                </ExcelFile>
                                <ExcelFile filename={ReportSAPMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>SAP Excel Download</button>}>
                                    {renderColumnSAP(ReportSAPMaster)}
                                </ExcelFile>

                                <ExcelFile filename={ReportSAPMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>Encoded Download</button>}>
                                    {renderColumnSAPEncoded(ReportSAPMaster)}
                                </ExcelFile>


                            </div>
                        </div>

                    </Col>
                </Row>
            </form>

            <div className={`ag-grid-wrapper height-width-wrapper  ${reportListingDataStateArray && reportListingDataStateArray?.length <= 0 ? "overlay-contain" : ""}`}>
            <div className={`ag-theme-material mt-2 ${isLoader && "max-loader-height"}`}>
                    <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        domLayout="autoHeight"
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        rowData={reportListingData}
                        pagination={true}
                        onFilterModified={onFloatingFilterChanged}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: EMPTY_DATA,
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                    >



                        <AgGridColumn field="CostingNumber" headerName="Costing Version" cellRenderer={'hyperLinkableFormatter'}></AgGridColumn>
                        <AgGridColumn field="TechnologyName" headerName="Technology" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='VendorName' headerName='Vendor' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='VendorCode' headerName='Vendor(Code)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PlantName' headerName='Plant' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PlantCode' headerName='Plant(Code)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartName' headerName='Part' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartNumber' headerName='Part Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ECNNumber' headerName='ECN Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartType' headerName='Part Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentCode' headerName='Department Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentName' headerName='Department Name' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RevisionNumber' headerName='Revision Number' cellRenderer='hyphenFormatter'></AgGridColumn>

                        <AgGridColumn field='RawMaterialCode' headerName='RM Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialName' headerName='RM Name' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrade' headerName='RM Grade' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RMSpecification' headerName='RM Specs' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialSpecification' headerName='RM Specs' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialRate' headerName='RM Rate' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialScrapWeight' headerName='Scrap Weight' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrossWeight' headerName='Gross Weight' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='GrossWeight' headerName='Gross Weight' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='FinishWeight' headerName='Finish Weight' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetRawMaterialsCost' headerName='Net RM Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetBoughtOutPartCost' headerName='Net BOP Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetProcessCost' headerName='Net Process Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOperationCost' headerName='Net Operation Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetConversionCost' headerName='Net Conversion Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='SurfaceTreatmentCost' headerName='Surface Treatment Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetSurfaceTreatmentCost' headerName='Net Surface Treatment Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ModelTypeForOverheadAndProfit' headerName='Model Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadApplicability' headerName='Overhead Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadPercentage' headerName='Overhead Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadCombinedCost' headerName='Overhead Combined Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadCost' headerName='Overhead Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='OverheadOn' headerName='Overhead On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='ProfitApplicability' headerName='Profit Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitPercentage' headerName='Profit Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitCost' headerName='Profit Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='ProfitOn' headerName='Profit On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetOverheadAndProfitCost' headerName='Net Overhead And Profit Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionApplicability' headerName='Rejection Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionPercentage' headerName='Rejection Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionCost' headerName='Rejection Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='RejectOn' headerName='Reject On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='ICCApplicability' headerName='ICC Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ICCInterestRate' headerName='ICC Interest Rate' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ICCCost' headerName='ICC Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='ICCOn' headerName='ICC On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetICCCost' headerName='Net ICC Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermsOn' headerName='Payment Terms On' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermCost' headerName='Payment Term Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCostPercentage' headerName='Packaging Cost Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCost' headerName='Packaging Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightPercentage' headerName='Freight Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightCost' headerName='Freight Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='TransportationCost' headerName='Transportation Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightType' headerName='Freight Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetFreightPackaging' headerName='Net Freight Packaging' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetFreightPackagingCost' headerName='Net Freight Packaging Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DiscountCost' headerName='Discount Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetDiscountsCost' headerName='Net Discounts Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='HundiOrDiscountValue' headerName='Hundi/Discount Value' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolCost' headerName='Tool Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolLife' headerName='Tool Life' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolMaintenanceCost' headerName='Tool Maintenance Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolPrice' headerName='Tool Price' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolQuantity' headerName='Tool Quantity' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='AmorizationQuantity' headerName='Amortization Quantity (Tool Life)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetToolCost' headerName='Net Tool Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OtherCostPercentage' headerName='Other Cost Percentage' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='AnyOtherCost' headerName='Any Other Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OtherCost' headerName='Other Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOtherCost' headerName='Net Other Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='TotalOtherCost' headerName='Total Other Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='EffectiveDate' headerName='Effective Date' cellRenderer='effectiveDateFormatter'></AgGridColumn>


                        <AgGridColumn field='Currency' headerName='Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetConvertedPOPrice' headerName='Net Converted PO Price' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPrice' headerName='Net PO Price' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceINR' headerName='Net PO Price (INR)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceInCurrency' headerName='Net PO Price In Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceOtherCurrency' headerName='Net PO Price Other Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetTotalRMBOPCC' headerName='Net Total RM BOP CC' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='TotalCost' headerName='Total Cost' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="LineNumber" headerName="Line Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="SANumber" headerName="SANumber" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field='Remark' headerName='Remark' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn pinned="right" field="DisplayStatus" headerName="Status" cellRenderer={'statusFormatter'}></AgGridColumn>


                        {/* <AgGridColumn field='BaseCostingId' headerName='BaseCostingId' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='CreatedBy' headerName='CreatedBy' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='CreatedByName' headerName='CreatedByName' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='CreatedByUserName' headerName='CreatedByUserName' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='CreatedDate' headerName='CreatedDate' cellRenderer='effectiveDateFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='DisplayStatus' headerName='DisplayStatus' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='ECN' headerName='ECN' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='IsActive' headerName='IsActive' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='IsDeleted' headerName='IsDeleted' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='Rev' headerName='Rev' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='Status' headerName='Status' cellRenderer='hyphenFormatter'></AgGridColumn> */}


                    </AgGridReact>
                    <div className='button-wrapper'>
                        <div className="paging-container d-inline-block float-right">
                            <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                <option value="10" selected={true}>10</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>


                        <div className="d-flex pagination-button-container">
                            <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                            {pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                            {pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                            {pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                            <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                        </div>

                    </div>
                </div>
            </div>


            {
                isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeUserDetails}
                    anchor={"right"}
                    isReport={isOpen}
                    selectedRowData={selectedRowData}
                    isSimulation={true}
                />
            }


        </div >
    );
}



export default ReportListing