import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { DRAFT, EMPTY_DATA, EMPTY_GUID, VBCTypeId, } from '../.././config/constants'
import NoContentFound from '.././common/NoContentFound';
import { MESSAGES } from '../.././config/message';
import Toaster from '.././common/Toaster';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '.././common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '.././common/PopupMsgWrapper';
import { PaginationWrapper } from '.././common/commonPagination'
import { sendReminderForQuotation, getQuotationDetailsList, getMultipleCostingDetails } from './actions/rfq';
import AddRfq from './AddRfq';
import SendForApproval from '../costing/components/approval/SendForApproval';
import { setCostingApprovalData, setCostingViewData, storePartNumber } from '../costing/actions/Costing';
import { getVolumeDataByPartAndYear } from '../masters/actions/Volume';
import { checkForNull, formViewData } from '../../helper';
import ApproveRejectDrawer from '../costing/components/approval/ApproveRejectDrawer';
import CostingSummaryTable from '../costing/components/CostingSummaryTable';
import { Fragment } from 'react';
import { Link } from 'react-scroll';
import RemarkHistoryDrawer from './RemarkHistoryDrawer';
import DayTime from '../common/DayTimeWrapper';
import { hyphenFormatter } from '../masters/masterUtil';
import _ from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
const gridOptions = {};


function RfqListing(props) {
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false)

    const [selectedCostings, setSelectedCostings] = useState([])

    const [addRfq, setAddRfq] = useState(false);
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([])
    const [noData, setNoData] = useState(false)
    const [sendForApproval, setSendForApproval] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const [addComparisonToggle, setaddComparisonToggle] = useState(false)
    const [addComparisonButton, setAddComparisonButton] = useState(true)
    const [technologyId, setTechnologyId] = useState("")
    const [remarkHistoryDrawer, setRemarkHistoryDrawer] = useState(false)
    const [disableApproveRejectButton, setDisableApproveRejectButton] = useState(true)
    const [remarkRowData, setRemarkRowData] = useState([])
    const [comparisonToggle, setComparisonToggle] = useState(false)
    const [gridLoader, setGridLoader] = useState(false)
    const [rejectDrawerData, setRejectDrawerData] = useState([])
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const approvalData = useSelector((state) => state.rfq.selectedRowRFQ)
    const { data } = props

    const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]


    useEffect(() => {
        getDataList()

    }, [])




    useEffect(() => {
        if (comparisonToggle) {
            let temp = []

            if (selectedRows && selectedRows.length == 0) {
                setGridLoader(true)
            }
            Array.isArray(viewCostingData) && viewCostingData.length > 0 && viewCostingData.map((item, index) => {
                setGridLoader(true)
                selectedRows?.map((ele, ind) => {
                    if (ele.CostingNumber == item.CostingNumber) {
                        temp.push(ele)
                    }
                })
            })

            setSelectedRows(temp)
            setTimeout(() => {

                setGridLoader(false)
            }, 50);
        }

        setaddComparisonToggle(viewCostingData.length > 0)
        let rejectedDataTemp = [];
        approvalData && approvalData.map(item => {
            if (item.ApprovalToken && item.ShowApprovalButton) {
                rejectedDataTemp.push(item)
            }
        })
        setRejectDrawerData(rejectedDataTemp)
    }, [viewCostingData])




    useEffect(() => {

        if (selectedCostings?.length === selectedRows?.length && selectedRows?.length > 0) {
            dispatch(setCostingViewData(selectedCostings))
            setaddComparisonToggle(true)
        }

    }, [selectedCostings])

    useEffect(() => {
        let filteredArr = _.map(viewCostingData, 'costingId')
        let arr = []
        filteredArr.map(item => selectedRows.filter(el => {
            if (el.CostingId === item) {
                arr.push(el)
            }
        }))
        const isApproval = arr.filter(item => item.ShowApprovalButton)
        setDisableApproveRejectButton(isApproval.length > 0)
    }, [viewCostingData])

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = () => {
        dispatch(getQuotationDetailsList(data.QuotationId, (res) => {

            let grouped_data = _.groupBy(res?.data?.DataList, 'PartNumber')                           // GROUPING OF THE ROWS FOR SEPERATE PARTS
            let data = []
            for (let x in grouped_data) {
                let seprateData = grouped_data[x]
                seprateData[Math.round(seprateData.length / 2) - 1].PartNo = x;                      // SHOWING PART NUMBER IN MIDDLE
                seprateData[seprateData.length - 1].LastRow = true;                                 // ADDING LASTROW KEY FOR SHOWING SEPERATE BORDER
                seprateData[Math.round(seprateData.length / 2) - 1].RowMargin = seprateData.length >= 2 && seprateData.length % 2 === 0 && 'margin-top';    // ADDING ROWMARGIN KEY IN THE GRID FOR EVEN ROW AND AS WELL AS PARTS HAVE TWO OR MORE COSTING
                data.push(seprateData)
            }

            let newArray = []
            // SET ROW DATA FOR GRID
            data.map((item) => {
                newArray = [...newArray, ...item]
                let temp = item.filter(el => el.CostingId !== null)
                if (temp.length > 0) {
                    item[Math.round(item.length / 2) - 1].ShowCheckBox = true;                      // SET CHECKBOX FOR CREATED COSTINGS
                }
            })

            setRowData(newArray)

            setTechnologyId(res?.data?.DataList[0].TechnologyId)
        }))
    }

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        gridApi.sizeColumnsToFit()
        gridApi.deselectAll()
        setSelectedCostings([])
        setaddComparisonToggle(false)
    }

    //   const cancel =()=> {
    //     props.closeDrawer()
    //   }
    /**
    * @method editItemDetails
    * @description edit material type
    */
    const approvemDetails = (Id, rowData = {}) => {
        let filteredArr = _.map(viewCostingData, 'costingId')
        let arr = []
        filteredArr.map(item => rowData.filter(el => {
            if (el.CostingId === item) {
                arr.push(el)
            }
            return null
        }))

        // let data = {
        //     isEditFlag: true,
        //     rowData: rowData,
        //     Id: Id
        // }
        // setIsEdit(true)
        // setAddRfqData(data)
        // setAddRfq(true)
        dispatch(storePartNumber(rowData))

        sendForApprovalData(arr)
        setSendForApproval(true)
    }

    /**
    * @method singleApprovalDetails
    * @description singleApprovalDetails
    */
    const singleApprovalDetails = (Id, rowData = {}) => {
        dispatch(storePartNumber(rowData))
        sendForApprovalData(rowData)
        setSendForApproval(true)
    }

    const rejectDetails = (Id, rowData = {}) => {

        if (selectedRows.length === 0) {
            setSelectedRows([rowData])
        }

        setTimeout(() => {
            setRejectDrawer(true)
        }, 600);
    }

    const cancel = () => {
        props.closeDrawer()
    }

    const sendForApprovalData = (rowData) => {

        let temp = []

        let quotationGrid;
        if (Array.isArray(rowData)) {
            quotationGrid = rowData
        } else {
            quotationGrid = [rowData]
        }

        quotationGrid &&
            quotationGrid.map((id, index) => {

                if (index !== -1) {
                    let obj = {}
                    // add vendor key here
                    obj.ApprovalProcessSummaryId = quotationGrid[index].ApprovalProcessSummaryId
                    obj.ApprovalToken = quotationGrid[index].ApprovalToken
                    obj.typeOfCosting = 1
                    obj.partNo = quotationGrid[index]?.PartNumber
                    obj.plantCode = quotationGrid[index]?.DestinationPlantCode
                    obj.plantName = quotationGrid[index]?.DestinationPlantName
                    obj.plantId = quotationGrid[index]?.DestinationPlantId

                    obj.vendorId = quotationGrid[index]?.VendorId

                    obj.vendorName = quotationGrid[index]?.VendorName

                    obj.vendorCode = quotationGrid[index]?.VendorName
                    obj.vendorPlantId = quotationGrid[index]?.vendorPlantId
                    obj.vendorPlantName = quotationGrid[index]?.vendorPlantName
                    obj.vendorPlantCode = quotationGrid[index]?.vendorPlantCode
                    obj.costingName = quotationGrid[index]?.CostingNumber
                    obj.costingId = quotationGrid[index]?.CostingId
                    obj.oldPrice = quotationGrid[index]?.oldPoPrice
                    obj.revisedPrice = quotationGrid[index]?.NetPOPrice

                    obj.nPOPriceWithCurrency = quotationGrid[index]?.nPOPriceWithCurrency
                    obj.currencyRate = quotationGrid[index]?.currency?.currencyValue
                    obj.variance = Number(quotationGrid[index]?.Price && quotationGrid[index]?.Price !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.Price && quotationGrid[index]?.Price !== '-' ? quotationGrid[index]?.Price : 0)
                    let date = quotationGrid[index]?.EffectiveDate

                    obj.partNo = quotationGrid[index]?.PartNumber

                    if (quotationGrid[index]?.EffectiveDate) {
                        let variance = Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.poPrice : 0)
                        let month = new Date(date).getMonth()
                        let year = ''
                        let sequence = SEQUENCE_OF_MONTH[month]

                        if (month <= 2) {
                            year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
                        } else {
                            year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
                        }
                        dispatch(getVolumeDataByPartAndYear(quotationGrid[index].PartId, year, quotationGrid[index].PlantId, quotationGrid[index].VendorId, '', VBCTypeId, res => {
                            if (res.data?.Result === true || res.status === 202) {
                                let approvedQtyArr = res.data?.Data?.VolumeApprovedDetails
                                let budgetedQtyArr = res.data?.Data?.VolumeBudgetedDetails
                                let actualQty = 0
                                let totalBudgetedQty = 0
                                let actualRemQty = 0

                                approvedQtyArr.map((data) => {
                                    if (data?.Sequence < sequence) {
                                        // if(data?.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
                                        //   actualQty += parseInt(data?.ApprovedQuantity)
                                        // }
                                        actualQty += parseInt(data?.ApprovedQuantity)
                                    } else if (data?.Sequence >= sequence) {
                                        actualRemQty += parseInt(data?.ApprovedQuantity)
                                    }
                                    return null
                                })
                                budgetedQtyArr.map((data) => {
                                    // if (data?.Sequence >= sequence) {
                                    totalBudgetedQty += parseInt(data?.BudgetedQuantity)
                                    return null
                                    // }
                                })
                                obj.consumptionQty = checkForNull(actualQty)
                                obj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
                                obj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
                                obj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

                            }
                        })

                        )
                    }


                    obj.reason = ''
                    obj.ecnNo = ''
                    obj.effectiveDate = quotationGrid[index]?.EffectiveDate

                    obj.isDate = quotationGrid[index]?.EffectiveDate ? true : false
                    obj.partNo = quotationGrid[index]?.PartNumber // Part id id part number here  USE PART NUMBER KEY HERE      
                    obj.partId = quotationGrid[index]?.PartId
                    obj.technologyId = quotationGrid[index]?.TechnologyId

                    obj.CostingHead = quotationGrid[index]?.costingHeadCheck

                    obj.destinationPlantCode = quotationGrid[index]?.destinationPlantCode
                    obj.destinationPlantName = quotationGrid[index]?.destinationPlantName
                    obj.destinationPlantId = quotationGrid[index]?.destinationPlantId
                    obj.costingTypeId = VBCTypeId
                    obj.customerName = quotationGrid[index]?.customerName
                    obj.customerId = quotationGrid[index]?.customerId
                    obj.customerCode = quotationGrid[index]?.customerCode
                    obj.customer = quotationGrid[index]?.customer



                    // if (quotationGrid[index]?.EffectiveDate) {
                    //     let variance = Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.oldPoPrice : 0) - Number(quotationGrid[index]?.poPrice && quotationGrid[index]?.poPrice !== '-' ? quotationGrid[index]?.poPrice : 0)
                    //     let month = new Date(date).getMonth()
                    //     let year = ''
                    //     // let sequence = SEQUENCE_OF_MONTH[month]

                    //     if (month <= 2) {
                    //         year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
                    //     } else {
                    //         year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
                    //     }


                    //     dispatch(getVolumeDataByPartAndYear(quotationGrid[0].PartId, year, (res) => {


                    //         

                    //     }))

                    //     obj.consumptionQty = 0
                    //     obj.remainingQty = 0
                    //     obj.annualImpact = 0
                    //     obj.yearImpact = 0


                    //     // obj.consumptionQty = quotationGrid[index]?.effectiveDate ? consumptionQty : ''
                    //     // obj.remainingQty = quotationGrid[index]?.effectiveDate ? remainingQty : ''
                    //     // obj.annualImpact = quotationGrid[index]?.effectiveDate ? annualImpact : ''
                    //     // obj.yearImpact = quotationGrid[index]?.effectiveDate ? yearImpact : ''


                    // }


                    temp.push(obj)
                    return null
                }
                return null
            }
            )

        dispatch(setCostingApprovalData(temp))
    }




    const sendReminder = (id, rowData) => {

        let data = {
            quotationId: rowData?.QuotationId,
            vendorId: rowData?.VendorId,
            PartId: rowData?.PartId
        }
        dispatch(sendReminderForQuotation(data, (res) => {

            if (res) {
                Toaster.success('Reminder sent successfully.')
                getDataList()
            }
        }))

    }


    const getRemarkHistory = (cell, rowData) => {
        setRemarkRowData(rowData)

        setTimeout(() => {
            setRemarkHistoryDrawer(true)
        }, 500);

    }


    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        setShowPopup(false)
    }

    const onPopupConfirm = () => {
        confirmDelete();
    }

    const closePopUp = () => {
        setShowPopup(false)
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        let showActionIcons = false
        let showReminderIcon = false
        let showRemarkHistory = false

        if (rowData?.CostingNumber === null) {
            showReminderIcon = true

        } else {

            showRemarkHistory = true
            if (rowData.ShowApprovalButton) {
                showActionIcons = true

            } else {

                showActionIcons = false
            }
        }

        let reminderCount = rowData?.RemainderCount

        return (
            <>
                {/* {< button title='View' className="View mr-1" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />} */}
                {showActionIcons && <button title='Approve' className="approve-icon mr-1" type={'button'} onClick={() => singleApprovalDetails(cellValue, rowData)}><div className='approve-save-tick'></div></button>}
                {showActionIcons && <button title='Reject' className="CancelIcon mr-1" type={'button'} onClick={() => rejectDetails(cellValue, rowData)} />}
                {showRemarkHistory && <button title='Remark History' className="btn-history-remark mr-1" type={'button'} onClick={() => { getRemarkHistory(cellValue, rowData) }}><div className='history-remark'></div></button>}
                {showReminderIcon && <button title={`Reminder: ${reminderCount}`} className="btn-reminder mr-1" type={'button'} onClick={() => { sendReminder(cellValue, rowData) }}><div className="reminder"><div className="count">{reminderCount}</div></div></button>}

            </>
        )
    };


    const closeDrawer = () => {
        setAddRfqData({})
        setAddRfq(false)
        setRejectDrawer(false)
        getDataList()

    }

    const closeRemarkDrawer = () => {

        setRemarkHistoryDrawer(false)
        getDataList()
    }


    const onGridReady = (params) => {
        setTimeout(() => {
            setgridApi(params.api);
            setgridColumnApi(params.columnApi);
            params.api.paginationGoToPage(0);
            params.api.sizeColumnsToFit()
        }, 400);

    };


    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));

    };


    const isFirstColumn = (params) => {

        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }

    }

    const linkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <div
                    onClick={() => viewDetails(row.UserId)}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }




    const addComparisonDrawerToggle = () => {
        setComparisonToggle(true)
        let temp = []
        let tempObj = {}

        const isApproval = selectedRows.filter(item => item.ShowApprovalButton)
        setDisableApproveRejectButton(isApproval.length > 0)

        dispatch(getMultipleCostingDetails(selectedRows, (res) => {


            if (res) {
                res.map((item) => {
                    tempObj = formViewData(item?.data?.Data)

                    temp.push(tempObj[0])
                    return null
                })

                dispatch(setCostingViewData(temp))
                setaddComparisonToggle(true)
                setComparisonToggle(false)
            }
        },
        ))


    }


    const viewDetails = (UserId) => {

        // this.setState({
        //     UserId: UserId,
        //     isOpen: true,
        // })

    }

    const onRowSelect = () => {
        const selectedRowss = gridApi?.getSelectedRows() ? gridApi?.getSelectedRows() : selectedRows
        console.log('selectedRows: ', selectedRows);
        let partNumber = []

        selectedRowss?.map(item => partNumber.push(item.PartNo))                 //STORE ALL PARS NUMBER

        let data = partNumber.map(item => rowData.filter(el => el.PartNumber === item))             // SELECTED ALL COSTING ON THE CLICK ON PART
        let newArray = []

        data.map((item) => {
            newArray = [...newArray, ...item]
            return null
        })


        setSelectedRows(newArray)
        if (selectedRows.length === 0) {
            setAddComparisonButton(true)
        } else {
            setAddComparisonButton(false)
            setTechnologyId(selectedRowss[0]?.TechnologyId)
        }
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue != null && cellValue !== '' && cellValue !== undefined) ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    const isRowSelectable = rowNode => rowNode.data ? rowNode?.data?.ShowCheckBox : false;

    // const checkBoxRenderer = (props) => {
    //     console.log('props: ', props);
    //     let selectedRowForPagination = selectedRows
    //     if (!props.value) {
    //         return false
    //     }
    //     const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    //     if (selectedRowForPagination?.length > 0) {
    //         selectedRowForPagination.map((item) => {
    //             if (item.CostingNumber === props.node.data.CostingNumber) {
    //                 props.node.setSelected(true)
    //             }
    //             return null
    //         })
    //         return cellValue
    //     } else {
    //         return cellValue
    //     }
    // }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: true ? isFirstColumn : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
        hyphenFormatter: hyphenFormatter
    };

    const cellClass = (props) => {
        return `${props?.data?.LastRow ? `border-color` : ''} ${props?.data?.RowMargin} colorWhite`          // ADD SCSS CLASSES FOR ROW MERGING
    }

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter,
        dateFormatter: dateFormatter,
        // checkBoxRenderer: checkBoxRenderer
    }

    const closeSendForApproval = () => {

        setSendForApproval(false)
        getDataList()
    }


    return (
        <>
            <div className={`ag-grid-react rfq-portal ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                {(loader && !props.isMasterSummaryDrawer) || gridLoader ? <LoaderCustom customClass="simulation-Loader" /> :
                    <>

                        <Row className={`filter-row-large`}>
                            <Col md="6" lg="6" className='mb-2'>
                                <div className='header-title heading-container'>
                                    <div>Raised On: <span>{DayTime(data.RaisedOn).format('DD/MM/YYYY')}</span></div>
                                    <div>Raised By: <span>{data.RaisedBy}</span></div>
                                </div>
                            </Col>
                            <Col md="6" lg="6" className="mb-1 d-flex justify-content-end align-items-center">
                                {
                                    // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                    (!props.isMasterSummaryDrawer) &&
                                    <>

                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                        <Link to={"rfq-compare-drawer"} smooth={true} spy={true} offset={-250}>
                                            <button
                                                type="button"
                                                className={'user-btn comparison-btn ml-1'}
                                                disabled={addComparisonButton}
                                                onClick={addComparisonDrawerToggle}
                                            >
                                                <div className="compare-arrows"></div>Compare</button>
                                        </Link>
                                        <button type="button" className={"apply ml-1"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>

                                    </>
                                }
                            </Col>

                        </Row>
                        <Row>
                            <Col>
                                <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                    <div className={`ag-theme-material ${(loader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
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
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: 'imagClass'
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            rowSelection={'multiple'}
                                            onRowSelected={onRowSelect}
                                            isRowSelectable={isRowSelectable}
                                            suppressRowClickSelection={true}
                                        >
                                            <AgGridColumn cellClass={cellClass} field="PartNo" headerName='Part No'></AgGridColumn>
                                            <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                                            <AgGridColumn field="VendorName" headerName='Vendor (Code)'></AgGridColumn>
                                            <AgGridColumn field="PlantName" headerName='Plant (Code)'></AgGridColumn>
                                            {/* <AgGridColumn field="PartNumber" headerName="Attachment "></AgGridColumn> */}
                                            <AgGridColumn field="Remark" headerName='Remark' cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn field="CostingNumber" headerName=' Costing Number'></AgGridColumn>
                                            <AgGridColumn field="CostingId" headerName='Costing Id ' hide={true}></AgGridColumn>
                                            <AgGridColumn field="NetPOPrice" headerName=" Net PO Price"></AgGridColumn>
                                            <AgGridColumn field="SubmissionDate" headerName='Submission Date' cellRenderer='dateFormatter'></AgGridColumn>
                                            <AgGridColumn field="EffectiveDate" headerName='Effective Date' cellRenderer='dateFormatter'></AgGridColumn>
                                            {<AgGridColumn width={200} field="QuotationId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                        </AgGridReact>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                }



                {
                    sendForApproval && (
                        <SendForApproval
                            isOpen={sendForApproval}
                            closeDrawer={closeSendForApproval}
                            anchor={'right'}
                            isApprovalisting={true}
                            isRfq={true}
                            technologyId={technologyId}
                            cancel={cancel}
                        />
                    )
                }


                {rejectDrawer && (
                    <ApproveRejectDrawer
                        type={'Reject'}
                        isOpen={rejectDrawer}
                        approvalData={rejectDrawerData}
                        closeDrawer={closeDrawer}
                        //  tokenNo={approvalNumber}
                        anchor={'right'}
                        isRFQApproval={true}
                        cancel={cancel}
                    // IsFinalLevel={!showFinalLevelButtons}
                    // reasonId={approvalDetails.ReasonId}
                    // IsPushDrawer={showPushDrawer}
                    // dataSend={[approvalDetails, partDetail]}
                    />
                )}

                {addRfq &&

                    <AddRfq
                        data={addRfqData}
                        //hideForm={hideForm}
                        AddAccessibilityRMANDGRADE={true}
                        EditAccessibilityRMANDGRADE={true}
                        isRMAssociated={true}
                        isOpen={addRfq}
                        anchor={"right"}
                        isEditFlag={isEdit}
                        closeDrawer={closeDrawer}
                    />

                }



                {
                    <div id='rfq-compare-drawer'>
                        {addComparisonToggle && (

                            <CostingSummaryTable viewMode={true}
                                isRfqCosting={true}
                                // costingID={approvalDetails.CostingId}
                                approvalMode={true}
                                // isApproval={approvalData.LastCostingId !== EMPTY_GUID ? true : false}
                                simulationMode={false}
                                costingIdExist={true} />
                        )}
                    </div>
                }


                {remarkHistoryDrawer &&

                    <RemarkHistoryDrawer
                        data={remarkRowData}
                        //hideForm={hideForm}
                        AddAccessibilityRMANDGRADE={true}
                        EditAccessibilityRMANDGRADE={true}
                        isRMAssociated={true}
                        isOpen={remarkHistoryDrawer}
                        anchor={"right"}
                        isEditFlag={isEdit}
                        closeDrawer={closeRemarkDrawer}
                    />
                }

            </div >
            {addComparisonToggle && disableApproveRejectButton && viewCostingData.length > 0 && <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">

                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => setRejectDrawer(true)} >
                        <div className={'cancel-icon-white mr5'}></div>
                        {'Reject'}
                    </button>
                    <button
                        type="button"
                        className="approve-button mr5 approve-hover-btn"
                        onClick={() => approvemDetails("", selectedRows)}
                    >
                        <div className={'save-icon'}></div>
                        {'Approve'}
                    </button>
                </div>
            </Row>}
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
        </>
    );
}

export default RfqListing;

