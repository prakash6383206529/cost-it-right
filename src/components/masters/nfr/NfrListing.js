import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, FILE_URL, RFQ, } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination'
import { checkPermission, loggedInUserId, searchNocontentFilter } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper';
import Attachament from '../../costing/components/Drawers/Attachament';
import NfrPartsListing from './NfrPartsListing';
import { deleteCustomerRfq, fetchNfrDetailFromSap, getCustomerRfqListing, nfrDetailsForDiscountAction } from './actions/nfr';
import { StatusTooltip, hyphenFormatter } from '../masterUtil';
import Toaster from '../../common/Toaster';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { useRef } from 'react';
import { agGridStatus, disabledClass, getGridHeight, isResetClick } from '../../../actions/Common';
import Button from '../../layout/Button';
import CreateManualNFR from './CreateManualNFR';
import { useTranslation } from 'react-i18next';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { updateCurrentRowIndex, updatePageNumber } from '../../common/Pagination/paginationAction';
import ReactExport from "react-export-excel";
import { reactLocalStorage } from 'reactjs-localstorage';
import _ from 'lodash';
import { NFR_LISTING_DOWNLOAD_EXCEL } from '../../../config/masterData';
import { filterParams } from '../../common/DateFilter';
// import { ExcelFile } from 'react-excel';
const ExcelFile = ReactExport.ExcelFile;

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};


function NfrListing(props) {
    const { activeTab } = props
    const { t } = useTranslation("Nfr")
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const [sapLoader, setSapLoader] = useState(false);
    const dispatch = useDispatch();
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([])
    const [noData, setNoData] = useState(false)
    const [viewRfq, setViewRfq] = useState(false)
    const [viewRfqData, setViewRfqData] = useState("")
    const [addAccessibility, setAddAccessibility] = useState(false);
    const [editAccessibility, setEditAccessibility] = useState(false);
    const [viewAccessibility, setViewAccessibility] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [attachment, setAttachment] = useState(false);
    const [viewAttachment, setViewAttachment] = useState([])
    const { nfrDetailsForDiscount } = useSelector(state => state.costing)
    const [nfrId, setNfrId] = useState('');
    const [selectedPartData, setSelectedPartData] = useState([]);
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const [addRfq, setAddRfq] = useState(props?.isFromDiscount ? true : false);
    const [isHover, setIsHover] = useState(false)
    const [showAddNFRDrawer, setShowAddNFRDrawer] = useState(false)
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
    const [showNfrPartListing, setShowNfrPartListing] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true)
    const [disableDownload, setDisableDownload] = useState(false)
    const [dataCount, setDataCount] = useState(0)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [isViewMode, setIsViewMode] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([])
    const agGridRef = useRef(null);
    const [floatingFilterData, setFloatingFilterData] = useState({
        CustomerRfqNo: "",
        CustomerName: "",
        CustomerPartNo: "",
        ProductCode: "",
        PlantNameDescription: "",
        UOM: "",
        Segment: "",
        PlantName: "",
        ZBCSubmissionDate: "",
        QuotationSubmissionDate: "",
        SopDate: "",
        CreatedBy: "",
        CreatedDate: "",
        Status: ""
    });
    const [filterModel, setFilterModel] = useState({});
    const [warningMessage, setWarningMessage] = useState(false);
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);

    const floatingFilterNfr = {
        maxValue: 12,
        suppressFilterButton: true,
        component: "NFR",
    }
    useEffect(() => {
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])

    useEffect(() => {
        if (statusColumnData) {
            gridApi?.setQuickFilter(statusColumnData?.data);
        }
    }, [statusColumnData])

    useEffect(() => {
        setloader(true)
        getDataList()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
        // Clear selectedRow from localStorage when component renders
        reactLocalStorage.remove('selectedRow');
    }, [])

    const transformApiResponse = (apiData) => {
        return {
            CustomerRFQNumber: apiData.CustomerRFQNumber || '-',
            CustomerName: apiData.CustomerName || '-',
            CustomerPartNo: apiData.NfrPartwiseDetailResponse?.[0]?.PartNumber || '-',
            GroupCode: apiData.NfrPartwiseDetailResponse?.[0]?.GroupCode || '-',
            PartType:apiData.NfrPartwiseDetailResponse?.[0]?.PartType || "-",
            PartName: apiData.NfrPartwiseDetailResponse?.[0]?.PartName || '-',
            UOM: apiData.NfrPartwiseDetailResponse?.[0]?.UOM || '-',
            Segment: apiData.Segment || '-',
            PlantName: apiData.PlantName || '-',
            ZBCLastSubmissionDate: apiData.ZBCLastSubmissionDate || '-',
            QuotationLastSubmissionDate: apiData.QuotationLastSubmissionDate || '-',
            SopDate: apiData.NfrPartwiseDetailResponse?.[0]?.SOPDate || '-',
            CreatedByName: apiData.CreatedByName || '-',
            CreatedDate: apiData.CreatedDate || '-',
            Status: apiData.Status || '-',
            NfrId: apiData.NfrId,
            NumberOfParts: apiData.NfrPartwiseDetailResponse?.length || 0
        };
    };


    /**
      * @method applyPermission
      * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
      */
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === RFQ);
            const accessData = Data && Data.Pages.find(el => el.PageName === RFQ)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false)
                setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false)
                setViewAccessibility(permmisionData && permmisionData.View ? permmisionData.View : false)
            }
        }
    }
    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = (skip = 0, take = 10, isPagination = true, dataObj, isReset = false) => {
        const requestOBj = { skip, take, isPagination, dataObj, isReset }
        dispatch(getCustomerRfqListing(requestOBj, (res) => {
            if (res?.data?.Data?.length > 0) {
                // Transform the API response data
                const transformedData = res.data.Data.map(item => transformApiResponse(item));
                setRowData(StatusTooltip(transformedData));
                setTotalRecordCount(res?.data?.Data?.length);
            } else {
                setRowData([]);
                setTotalRecordCount(0);
                setNoData(true);
            }
            if (res && isPagination === false) {
                setDisableDownload(false)
                setTimeout(() => {
                    dispatch(disabledClass(false))
                    const excelDownloadBtn = document.getElementById('nfr-excel-download')
                    excelDownloadBtn && excelDownloadBtn.click()
                }, 500);
            }
            setloader(false);
            if (res) {
                setTimeout(() => {
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
                }, 300);

                setTimeout(() => {
                    setWarningMessage(false)
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }

    const resetState = () => {
        setDisableFilter(true);
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();
        gridApi.deselectAll();
        dispatch(agGridStatus("", ""));
        dispatch(isResetClick(true, "status"));
        setNoData(false);
        setDataCount(0);
        setSelectedRowData([]);
        // Clear selectedRow from localStorage
        reactLocalStorage.remove('selectedRow');
    }


    /**
    * @method editItemDetails
    * @description edit material type
    */
    const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {

        let data = {
            isEditFlag: !isViewMode,
            isViewFlag: isViewMode,
            rowData: rowData,
            Id: Id
        }
        // setShowNfrPartListing(true)
        // setIsViewMode(true)
        setShowAddNFRDrawer(true)
        setSelectedPartData(rowData)
        setNfrId(rowData?.NfrNumber)
        props.openAddNFRDrawer(true)
        setShowAddNFRDrawer(true)
        // let obj = { ...nfrDetailsForDiscount, rowData: rowData }
        // dispatch(nfrDetailsForDiscountAction(obj))
        setIsViewMode(isViewMode)
        setIsEdit(!isViewMode)
        setAddRfqData(data)
        // setAddRfq(true)
    }

    const viewPartDetails = (rowData = {}) => {

        let data = {
            isEditFlag: false,
            isViewFlag: true,
            rowData: rowData,
        }
        setShowNfrPartListing(true)
        setIsViewMode(true)
        setAddRfq(true)
        setSelectedPartData(rowData)
        setNfrId(rowData?.NfrNumber)
        let obj = { ...nfrDetailsForDiscount, rowData: rowData }
        dispatch(nfrDetailsForDiscountAction(obj))
        setIsViewMode(true)
        setIsEdit(false)
        setAddRfqData(data)
    }

    /**
    * @method deleteItemDetails
    * @description delete Item Details
    */
    const deleteItemDetails = (rowData = {}) => {
        setConfirmPopup(true)
        setSelectedRowData(rowData)
    }

    const onPopupConfirm = () => {
        dispatch(deleteCustomerRfq(selectedRowData?.NfrId, loggedInUserId(), (res) => {
            if (res?.data?.Result) {
                getDataList()
                Toaster.success("Customer RFQ deleted successfully.")
                setConfirmPopup(false)
            }
        }))
    }

    const closePopUp = () => {
        setConfirmPopup(false)
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {

        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const Status = rowData?.Status
        return (
            <>
                {/* <button className="Add-file mr-1" id="nfr_AddCosting" type={"button"} title={`Add Costing`} /> */}
                { <button title='View' className="View mr-1" id="viewNfr_list" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {Status === "Draft" && <button className="Edit mr-1" id="nfr_EditCosting" type={"button"} title={"Edit Details"} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {Status === "Draft" && <button title='Delete' className="Delete mr-1" id="deleteNfr_list" type={'button'} onClick={() => deleteItemDetails(rowData)} />}
            </>
        )
    };


    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 200);
    }

    const closeDrawer = () => {
        setDataCount(0)
        setSelectedRowData([])
        reactLocalStorage.remove('selectedRow');
        setAddRfqData({})
        setAddRfq(false)
        getDataList()
        setIsEdit(false)
        setShowNfrPartListing(false)

    }

    const closeNFRDrawer = (isSaveAPICalled) => {
        if (isSaveAPICalled === true) {
            getDataList()
        }
        props.openAddNFRDrawer(false)
        setShowAddNFRDrawer(false)
    }

    const onGridReady = (params) => {
        agGridRef.current = params.api;
        setgridApi(params.api);
        window.screen.width >= 1920 && params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };


    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();

    };


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }


    const linkableFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        if (row?.IsActive) {
            return (
                <>
                    <div
                        onClick={() => viewDetails(row.QuotationId)}
                        className={'link'}
                    >{cell}</div>
                </>
            )
        } else {

            return cell ? cell : "-"

        }
    }

    const customerRfqFormatter = (props) => {
        const cell = props?.valueFormatted || props?.value;
        const row = props?.data || {};
        const Status = row?.Status;
    
        const isClickable = Status === 'ZBC Created';
    
        return (
            <div
                onClick={isClickable ? () => viewPartDetails(row) : undefined}
                className={isClickable ? 'link' : ''}
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
                {cell || '-'}
            </div>
        );
    };

    const statusFormatter = (props) => {
        dispatch(getGridHeight({ value: agGridRef.current.rowRenderer.allRowCons.length, component: 'NFR' }))
        //MINDA
        // dispatch(getGridHeight({ value: props.rowIndex, component: 'NFR' }))
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const cellValue = cell==="ZBC Created" ? "Approved" : cell==="ZBC Pending" ? "Pending" : cell==="Draft" ? "Draft" : cell
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let tempStatus = '-'
        tempStatus = row?.Status
        // let displayCount = `${row?.ApprovalPartCount}/${row?.NumberOfParts}`
        let displayCount = ' (' + row?.ApprovalPartCount + '/' + row?.NumberOfParts + ')'

        return <div className={cellValue}>{`${tempStatus}`}</div>
    }

    const dateFormater = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const viewAttachmentData = (index) => {
        setAttachment(true)
        setViewAttachment(index)
    }

    const closeAttachmentDrawer = (e = '') => {
        setAttachment(false)
    }
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (rowData.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
                setTotalRecordCount(gridApi?.getDisplayedRowCount())
            }
        }, 500);
        setDisableFilter(false)
        const model = gridOptions?.api?.getFilterModel();
        setFilterModel(model)

        if (!isFilterButtonClicked) {
            setWarningMessage(true)
        }

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            let isFilterEmpty = true
            if (model !== undefined && model !== null) {
                if (Object.keys(model).length > 0) {
                    isFilterEmpty = false

                    for (var property in floatingFilterData) {
                        if (property === value.column.colId) {
                            floatingFilterData[property] = ""
                        }
                    }
                    setFloatingFilterData(floatingFilterData)
                }

                if (isFilterEmpty) {
                    setWarningMessage(false)
                    for (var prop in floatingFilterData) {
                        floatingFilterData[prop] = ""
                    }
                    setFloatingFilterData(floatingFilterData)
                }
            }
        } else {
            if (value.column.colId === "ZBCSubmissionDate" || value.column.colId === "QuotationSubmissionDate" || value.column.colId === "SopDate" || value.column.colId === "CreatedDate") {
                return false
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }

    const attachmentFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let files = row?.Attachments

        return (
            <>
                <div className={"attachment images"}>
                    {files && files.length === 1 ?
                        files.map((f) => {
                            const withOutTild = f.FileURL?.replace("~", "");
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                                <a href={fileURL} target="_blank" rel="noreferrer">
                                    {f.OriginalFileName}
                                </a>
                            )

                        }) : <button
                            type='button'
                            title='View Attachment'
                            className='btn-a pl-0'
                            onClick={() => viewAttachmentData(row)}
                        >View Attachment</button>}
                </div>
            </>
        )

    }

    const viewDetails = (UserId) => {
        setViewRfqData(UserId)
        setViewRfq(true)

    }
    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    };

    const effectiveDateFormatter = (props) => {
        if (showExtraData) {
            return "Lorem Ipsum";
        } else {
            const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
            return cellValue?.includes('T') ?  DayTime(cellValue).format('DD/MM/YYYY'): '-';
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };



    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter,
        attachmentFormatter: attachmentFormatter,
        statusFormatter: statusFormatter,
        dateFormater: dateFormater,
        effectiveDateRenderer: effectiveDateFormatter,
        valuesFloatingFilter: SingleDropdownFloationFilter,
        customNoRowsOverlay: NoContentFound,
        customerRfqFormatter: customerRfqFormatter
    }
    const handleMouse = () => {
        setIsHover(true)
    }
    /**
    * @method handleMouseOut
    * @description FOR FETCH BUTTON CHANGE CSS ON MOUSE LEAVE
    */
    const handleMouseOut = () => {
        setIsHover(false)
    }

    const openFetchDrawer = () => {
        setSapLoader(true)
        dispatch(fetchNfrDetailFromSap(res => {
            setSapLoader(false)
            getDataList()
            if (res && res.data && res.data.Result) {
                Toaster.success('Data has been pulled successfully')
            }
        }))
    }
    const onSearch = () => {
        setNoData(false)
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        gridApi.setQuickFilter(null)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(0))
        getDataList(0, 10, true, floatingFilterData)
    }


    const onRowSelect = (event) => {
        let selectedRowForPagination = reactLocalStorage.getObject('selectedRow')?.selectedRow || [];
        var selectedRows = gridApi.getSelectedRows();

        if (selectedRows === undefined || selectedRows === null) {
            selectedRows = selectedRowForPagination;
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {
            let finalData = [];
            if (event.node.isSelected() === false) {
                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].NfrId === event.data.NfrId) {
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i]);
                }
            } else {
                finalData = selectedRowForPagination;
            }
            selectedRows = [...selectedRows, ...finalData];
        }

        let uniqeArray = _.uniqBy(selectedRows, "NfrId");
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray });

        const newDataCount = uniqeArray.length;
        setDataCount(newDataCount);
        setSelectedRowData(uniqeArray);
    };

    const onExcelDownload = () => {
        setDisableDownload(true);
        dispatch(disabledClass(true));

        let tempArr = selectedRowData;
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false);
                dispatch(disabledClass(false));
                const downloadButton = document.getElementById("nfr-excel-download");
                downloadButton?.click();
            }, 400);
        } else {
            getDataList(0, 10, false, {}, true)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    };

    const bulkToggle = () => {
        // if (checkMasterCreateByCostingPermission(true)) {
        //   setState((prevState) => ({ ...prevState, isBulkUpload: true }));
        // }
    };

    const onBtExport = () => {
        let tempArr = [];
        tempArr = selectedRowData && selectedRowData.length > 0 ? selectedRowData : rowData;
        const filteredLabels = NFR_LISTING_DOWNLOAD_EXCEL;
        // = NFR_LISTING_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
        //   if (column.value === "ExchangeRateSourceName") {
        //     return getConfigurationKey().IsSourceExchangeRateNameVisible
        //   }
        //   return true;
        // })
        return returnExcelColumn(filteredLabels, tempArr);
    };


    const returnExcelColumn = (data = [], TempData) => {
        let temp = [];
        temp = TempData.map(item => {
            const newItem = { ...item };
            data.forEach(column => {
                if (newItem[column.value] == null || newItem[column.value] === "") {
                    newItem[column.value] = "-";
                }
            });
            ["SopDate", "LastSubmissionDate", "CreatedDate"].forEach(dateField => {
                if (newItem[dateField] && newItem[dateField] !== "-") {
                    try {
                        newItem[dateField] = DayTime(newItem[dateField]).format("DD/MM/YYYY");
                    } catch (e) {
                        newItem[dateField] = "-";
                    }
                }
            });

            return newItem;
        });
        return (
            <ExcelSheet data={temp} name={`NFR Listing`}>
                {data && data.map((ele, index) => (
                    <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style || {}} />
                ))}
            </ExcelSheet>
        );
    }

    const addNFRFunction = () => {
        setIsViewMode(false)
        setIsEdit(false)
        props.openAddNFRDrawer(true)
        setShowAddNFRDrawer(true)
    }

    return (
        <>
            {!addRfq && !showAddNFRDrawer &&
                <div className={`ag-grid-react grid-parent-wrapper p-relative${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                    {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                        <>
                            {sapLoader && <LoaderCustom message="Fetching data from SAP" />}
                            <Row className={`filter-row-large pt-2 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>

                                <Col md="3" lg="3" className='mb-2'>
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                    <TourWrapper
                                        buttonSpecificProp={{ id: "Nfr_Listing_Tour", onClick: toggleExtraData }}
                                        stepsSpecificProp={{
                                            steps: Steps(t, { activeTab }).NFR_lISTING
                                        }} />
                                </Col>

                                <Col md="9" className="mb-3 d-flex justify-content-end">
                                    {
                                        <Button id="NFRListing_filterData" disabled={disableFilter} title={"Filtered data"} type="button" className={"user-btn mr5 Tour_List_Filter"} icon={"filter mr-0"} onClick={() => onSearch()} />
                                    }
                                    {true && (<Button id="NFRListing_add" className={"mr5"} onClick={addNFRFunction} title={"Add"} icon={"plus"} />)}

                                    {/* <Button id="bopImportListing_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} /> */}


                                    <>
                                        <Button className={"user-btn mr5 Tour_List_Download"} id={"NfrListing_excel_download"} disabled={rowData.length === 0} onClick={onExcelDownload} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} icon={"download mr-1"} buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} />

                                        <ExcelFile filename={`NFR Listing`} fileExtension={".xls"} element={<Button id={"nfr-excel-download"} className="p-absolute" />}>
                                            {onBtExport()}
                                        </ExcelFile>
                                    </>
                                    <button type="button" className="user-btn mr-2" id="resetNFR_listing" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                    {/* <button
                                        id="fetchNFR_btn"
                                        type="button"
                                        className={'secondary-btn ml-1 mr-2'}
                                        title="Fetch"
                                        onClick={openFetchDrawer}
                                        onMouseOver={handleMouse}
                                        onMouseOut={handleMouseOut}
                                    >
                                        <div className={`${isHover ? "swap-hover" : "swap"} mr-0`}></div>
                                    </button> */}
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                        <div className={`ag-theme-material`}>
                                            {/* {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />} */}
                                            <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                rowData={rowData}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                    imagClass: 'imagClass'
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                rowSelection={'multiple'}
                                                suppressRowClickSelection={true}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                                ref={agGridRef}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                onRowSelected={onRowSelect}
                                            >
                                                <AgGridColumn field="CustomerRFQNumber" headerName="Customer RFQ No." minWidth={160} cellRenderer="customerRfqFormatter"></AgGridColumn>
                                                <AgGridColumn field="CustomerName" headerName="Customer Name" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartType" headerName="Part Type" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="CustomerPartNo" headerName="Part No." minWidth={160} cellRenderer={hyphenFormatter}></AgGridColumn>
                                               
                                                <AgGridColumn field="PartName" headerName="Part Name" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="GroupCode" headerName='Group Code' minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                {/* <AgGridColumn field="PartDescription" headerName="Part Description" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn> */}
                                                <AgGridColumn field="Segment" headerName="Segment" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PlantName" headerName='Plant Name' minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="ZBCLastSubmissionDate" headerName="ZBC Last Submission Date" minWidth={150} cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                <AgGridColumn field="QuotationLastSubmissionDate" headerName="Quotation Submission Date" minWidth={150} cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                <AgGridColumn field="SopDate" headerName="SOP Date" minWidth={150} cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                <AgGridColumn field="CreatedByName" headerName="Created By" minWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="CreatedDate" headerName="Created Date" minWidth={150} cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                <AgGridColumn field="Status" tooltipField="tooltipText" cellClass="text-center"   headerName="Status" headerClass="justify-content-center" minWidth={170} cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterNfr}></AgGridColumn>
                                                <AgGridColumn field="Status" minWidth={180} cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                            </AgGridReact >
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                                        </div >
                                    </div >
                                </Col >
                            </Row >
                        </>))
                    }
                    {confirmPopup && <PopupMsgWrapper isOpen={confirmPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_DETAIL_CANCEL_ALERT}`} />}
                </div >
            }

            {addRfq && <NfrPartsListing
                data={selectedPartData}
                //hideForm={hideForm}
                AddAccessibilityRMANDGRADE={true}
                EditAccessibilityRMANDGRADE={true}
                isRMAssociated={true}
                isOpen={addRfq}
                anchor={"right"}
                isEditFlag={isEdit}
                nfrId={nfrId}
                closeDrawer={closeDrawer}
                nfrDataFromAdd={props?.location?.state}
                isFromDiscount={props?.isFromDiscount}
                changeIsFromDiscount={props?.changeIsFromDiscount}
                showExtraData={showExtraData}
                showNfrPartListing={showNfrPartListing}
                activeTab={activeTab}
            />}

            {showAddNFRDrawer && <CreateManualNFR
                data={selectedPartData}
                AddAccessibilityRMANDGRADE={true}
                EditAccessibilityRMANDGRADE={true}
                isRMAssociated={true}
                isOpen={addRfq}
                anchor={"right"}
                isEditFlag={isEdit}
                nfrId={nfrId}
                isViewFlag={isViewMode}
                closeDrawer={closeNFRDrawer}
                nfrDataFromAdd={props?.location?.state}
                isFromDiscount={props?.isFromDiscount}
                changeIsFromDiscount={props?.changeIsFromDiscount}
            />}
            {attachment && <Attachament
                isOpen={attachment}
                index={viewAttachment}
                closeDrawer={closeAttachmentDrawer}
                anchor={'right'}
                gridListing={true}
            />}
        </>
    );
}

export default NfrListing;

