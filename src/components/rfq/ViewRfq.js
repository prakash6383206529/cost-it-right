import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch } from 'react-redux'
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
import SelectRowWrapper from '.././common/SelectRowWrapper';
import { getQuotationList, cancelRfqQuotation, sendReminderForQuotation, getQuotationDetailsList, getMultipleCostingDetails } from './actions/rfq';
import AddRfq from './AddRfq';
import SendForApproval from '../costing/components/approval/SendForApproval';
import { getSingleCostingDetails, setCostingApprovalData, setCostingViewData, storePartNumber } from '../costing/actions/Costing';
import { getVolumeDataByPartAndYear } from '../masters/actions/Volume';
import { checkForNull, formViewData } from '../../helper';
import ApproveRejectDrawer from '../costing/components/approval/ApproveRejectDrawer';
import CostingSummaryTable from '../costing/components/CostingSummaryTable';
import { Fragment } from 'react';
import { Link } from 'react-scroll';
import RemarkHistoryDrawer from './RemarkHistoryDrawer';
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
    const [dataCount, setDataCount] = useState(0)
    const [sendForApproval, setSendForApproval] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const [addComparisonToggle, setaddComparisonToggle] = useState(false)
    const [addComparisonButton, setAddComparisonButton] = useState(true)
    const [technologyId, setTechnologyId] = useState("")
    const [remarkHistoryDrawer, setRemarkHistoryDrawer] = useState(false)
    const [disableApproveRejectButton, setDisableApproveRejectButton] = useState(true)
    const [remarkRowData, setRemarkRowData] = useState([])

    const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]


    useEffect(() => {
        getDataList()

    }, [])

    useEffect(() => {


        if (selectedCostings?.length === selectedRows?.length && selectedRows?.length > 0) {

            dispatch(setCostingViewData(selectedCostings))
            setaddComparisonToggle(true)
        }

    }, [selectedCostings])

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = () => {
        dispatch(getQuotationDetailsList(props.data, (res) => {

            setRowData(res?.data?.DataList)
            setTechnologyId(res?.data?.DataList[0].TechnologyId)
        }))
    }

    const resetState = () => {

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
    }

    //   const cancel =()=> {
    //     props.closeDrawer()
    //   }
    /**
    * @method editItemDetails
    * @description edit material type
    */
    const approvemDetails = (Id, rowData = {}) => {

        // let data = {
        //     isEditFlag: true,
        //     rowData: rowData,
        //     Id: Id
        // }
        // setIsEdit(true)
        // setAddRfqData(data)
        // setAddRfq(true)
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
        let index = 0

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
            }
            )

        dispatch(setCostingApprovalData(temp))
    }



    const cancelItem = (id) => {
        dispatch(cancelRfqQuotation(id, (res) => {
            if (res.status === 200) {
                Toaster.success('Quotation has been cancelled successfully.')
            }
        }))
        getDataList()
    }


    const sendReminder = (id, rowData) => {

        let data = {
            quotationId: rowData?.QuotationId,
            vendorId: rowData?.VendorId
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
                {showActionIcons && <button title='Approve' className="approve-icon mr-1" type={'button'} onClick={() => approvemDetails(cellValue, rowData)}><div className='approve-save-tick'></div></button>}
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
        setgridApi(params.api);

        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };


    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));

    };


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }


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

        let temp = []
        let tempObj = {}

        selectedRows && selectedRows.map((item) => {
            if (item?.ShowApprovalButton === false) {
                setDisableApproveRejectButton(false)
            }

        })

        dispatch(getMultipleCostingDetails(selectedRows, (res) => {


            if (res) {
                res.map((item) => {
                    tempObj = formViewData(item?.data?.Data)

                    temp.push(tempObj[0])

                })

                dispatch(setCostingViewData(temp))
                setaddComparisonToggle(true)
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
        const selectedRows = gridApi?.getSelectedRows()
        setSelectedRows(selectedRows)
        setDataCount(selectedRows.length)
        if (selectedRows.length === 0) {
            setAddComparisonButton(true)
        } else {
            setAddComparisonButton(false)
            setTechnologyId(selectedRows[0]?.TechnologyId)
        }
    }


    const isRowSelectable = rowNode => rowNode.data ? (rowNode?.data?.CostingId !== null) : false;


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: true ? isFirstColumn : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
    };


    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter
    }

    const closeSendForApproval = () => {

        setSendForApproval(false)
        getDataList()
    }


    return (
        <>
            <div className={`ag-grid-react rfq-portal ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
                    <>

                        <Row className={`filter-row-large pt-4 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                            <Col md="3" lg="3" className='mb-2'>
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </Col>
                            <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
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
                                                className={'user-btn mb-2 comparison-btn ml-2'}
                                                disabled={addComparisonButton}
                                                onClick={addComparisonDrawerToggle}
                                            >
                                                <div className="compare-arrows"></div>Compare</button>
                                        </Link>
                                    </>
                                }
                            </Col>

                        </Row>
                        <Row>
                            <Col>
                                <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                    <SelectRowWrapper dataCount={dataCount} className="mb-1 mt-n1" />
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
                                        // suppressRowClickSelection={true}
                                        >
                                            <AgGridColumn cellClass="has-checkbox" field="PartNumber" headerName='Part No'  ></AgGridColumn>
                                            <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                                            <AgGridColumn field="VendorName" headerName='Vendor'></AgGridColumn>
                                            <AgGridColumn field="PlantName" headerName='Plant'></AgGridColumn>
                                            {/* <AgGridColumn field="PartNumber" headerName="Attachment "></AgGridColumn> */}
                                            <AgGridColumn field="Remark" headerName='Remark' cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn field="CostingNumber" headerName=' Costing Number'></AgGridColumn>
                                            <AgGridColumn field="CostingId" headerName='Costing Id ' hide={true}></AgGridColumn>
                                            <AgGridColumn field="NetPOPrice" headerName=" Net PO"></AgGridColumn>
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
                        />
                    )
                }


                {rejectDrawer && (
                    <ApproveRejectDrawer
                        type={'Reject'}
                        isOpen={rejectDrawer}
                        approvalData={selectedRows}
                        closeDrawer={closeDrawer}
                        //  tokenNo={approvalNumber}
                        anchor={'right'}
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
                                simulationMode={false} />
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
            <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                    <Fragment>
                        <button
                            type={'button'}
                            className=" mr5 cancel-btn"
                            onClick={cancel}
                        >
                            <div className={'cancel-icon'}></div> {'Cancel'}
                        </button>
                        {addComparisonToggle && disableApproveRejectButton && <>
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
                        </>}

                    </Fragment>

                </div>
            </Row>



            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
        </>
    );
}

export default RfqListing;

