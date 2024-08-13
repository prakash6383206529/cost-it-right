import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { APPROVED, CANCELLED, DRAFT, EMPTY_DATA, FILE_URL, PREDRAFT, RECEIVED, REJECTED, RETURNED, RFQ, RFQVendor, SENT, SUBMITTED, UNDER_APPROVAL, UNDER_REVISION, } from '../.././config/constants'
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
import { getQuotationList, cancelRfqQuotation } from './actions/rfq';
import ViewRfq from './ViewRfq';
import AddRfq from './AddRfq';
import { checkPermission, getTimeZone, searchNocontentFilter, setLoremIpsum, userDetails } from '../../helper';
import DayTime from '../common/DayTimeWrapper';
import Attachament from '../costing/components/Drawers/Attachament';
import { useRef } from 'react';
import SingleDropdownFloationFilter from '../masters/material-master/SingleDropdownFloationFilter';
import { agGridStatus, getGridHeight, isResetClick, showQuotationDetails } from '../../actions/Common';
import TourWrapper from '../common/Tour/TourWrapper';
import { Steps } from '../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { filterParams } from '../common/DateFilter';
import CustomCellRenderer from './CommonDropdown';
import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom";
export const ApplyPermission = React.createContext();
const gridOptions = {};



function RfqListing(props) {

    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const [addRfq, setAddRfq] = useState(false);
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
    const [deleteId, setDeleteId] = useState('');
    const { t } = useTranslation("Common");
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
    const [permissionDataPart, setPermissionDataPart] = useState()
    const [permissionDataVendor, setPermissionDataVendor] = useState()
    const [permissionData, setPermissionData] = useState()


    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const agGridRef = useRef(null);
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const history = useHistory();
    const location = useLocation();
    const handleFilterChange = () => {
        if (agGridRef.current) {

            //MINDA
            setTimeout(() => {
                if (!agGridRef.current.rowRenderer.allRowCons.length) {
                    setNoData(true)
                    // dispatch(getGridHeight({ value: 3, component: 'RFQ' }))
                } else {
                    setNoData(false)
                }
            }, 100);

            const gridApi = agGridRef.current.api;
            if (gridApi) {
                const displayedRowCount = gridApi.getDisplayedRowCount();
                const allRowData = [];
                for (let i = 0; i < displayedRowCount; i++) {
                    const rowNode = gridApi.getDisplayedRowAtIndex(i);
                    if (rowNode) {
                        allRowData.push(rowNode.data);
                    }
                }
                setNoData(!allRowData.length)
            }
        }
    };
    const floatingFilterRFQ = {
        maxValue: 11,
        suppressFilterButton: true,
        component: "RFQ",
        onFilterChange: handleFilterChange,
        notPagination: true
    }
    useEffect(() => {
        // setloader(true)
        getDataList()
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])

    useEffect(() => {
        if (statusColumnData) {



            gridApi?.setQuickFilter(statusColumnData?.data);
        }
    }, [statusColumnData])
    useEffect(() => {
        const { source, quotationId } = location.state || {};

        if (source === 'auction') {
            if (rowData && rowData.length !== 0) {
                const fiterRowData = rowData.find(item => item?.QuotationId === quotationId);
                viewDetails(fiterRowData);
            }
        }
    }, [rowData])
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            history.push({
                pathname: '/rfq-listing',
                state: { source: 'rfq' }
            })
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    /**
      * @method applyPermission
      * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
      */
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === RFQ);
            const accessData = Data && Data.Pages.find(el => el.PageName === RFQ)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            const accessDataVendor = Data && Data.Pages.find(el => el.PageName === RFQVendor)
            const permmisionDataVendor = accessDataVendor && accessDataVendor.Actions && checkPermission(accessDataVendor.Actions)

            if (permmisionData !== undefined || permmisionDataVendor !== undefined) {
                setPermissionData({
                    permissionDataPart: permmisionData,
                    permissionDataVendor: permmisionDataVendor
                });
                setPermissionDataPart(permmisionData);
                setPermissionDataVendor(permmisionDataVendor)
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
    const getDataList = () => {
        const Timezone = getTimeZone()
        setloader(true)
        dispatch(getQuotationList(userDetails()?.DepartmentCode, Timezone, (res) => {
            let temp = []
            res?.data?.DataList && res?.data?.DataList.map((item) => {
                if (item?.IsActive === false) {
                    item.Status = "Cancelled"
                }

                item.tooltipText = ''
                switch (item?.Status) {
                    case APPROVED:
                        item.tooltipText = 'Total no. of parts for which costing has been approved from that quotation / Total no. of parts exist in that quotation'
                        break;
                    case RECEIVED:
                        item.tooltipText = 'Total no. of costing received / Total no. of expected costing in that quotation'
                        break;
                    case UNDER_REVISION:
                        item.tooltipText = 'Total no. of costing under revision / Total no. of expected costing in that quotation'
                        break;
                    case DRAFT:
                        item.tooltipText = 'The token is pending to send for approval from your side.'
                        break;
                    case CANCELLED:
                        item.tooltipText = 'Quotation has been cancelled.'
                        break;
                    case SENT:
                        item.tooltipText = 'Costing under the quotation has been sent.'
                        break;
                    case REJECTED:
                        item.tooltipText = 'Quotation has been rejected.'
                        break;
                    case RETURNED:
                        item.tooltipText = 'Quotation has been returned.'
                        break;
                    case PREDRAFT:
                        item.tooltipText = 'Quotation pre-drafted, parts details saved.'
                        break;
                    default:
                        break;
                }
                temp.push(item)
                return null
            })
            setRowData(temp)
            setloader(false)
        }))
    }

    const resetState = () => {

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        gridApi.deselectAll()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
        setNoData(false)
    }
    //**  HANDLE TOGGLE EXTRA DATA */
    const toggleExtraData = (showTour) => {
        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);


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
        setIsEdit(true)
        setAddRfqData(data)
        setAddRfq(true)
    }

    const cancelItem = (id) => {
        setConfirmPopup(true)
        setDeleteId(id)
    }

    const onPopupConfirm = () => {
        dispatch(cancelRfqQuotation(deleteId, (res) => {
            if (res.status === 200) {
                Toaster.success('Quotation has been cancelled successfully.')
                setTimeout(() => {
                    getDataList()
                }, 500);
            }
            setConfirmPopup(false)
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

        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let status = rowData?.Status

        return (
            <>
                {(viewAccessibility || permissionData?.permissionDataVendor?.View) && <button title='View' className="View mr-1 Tour_List_View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {((status !== APPROVED && status !== CANCELLED) && (editAccessibility || permissionData?.permissionDataVendor?.Edit)) && <button title='Edit' className="Edit mr-1 Tour_List_Edit" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {(status !== APPROVED && status !== UNDER_APPROVAL && status !== CANCELLED && status !== RECEIVED) && rowData?.IsShowCancelIcon && <button title='Cancel' className="CancelIcon mr-1  Tour_List_Cancel" type={'button'} onClick={() => cancelItem(cellValue)} />}
            </>
        )
    };


    const formToggle = () => {
        setAddRfq(true)
        let data = {
            isAddFlag: true,
        }
        setAddRfqData(data)
    }

    const closeDrawer = () => {
        setAddRfqData({})
        setAddRfq(false)
        getDataList()
        setIsEdit(false)

    }

    const closeDrawerViewRfq = (value) => {
        value === true ? setViewRfq(true) : setViewRfq(false)
        // setViewRfq(false)
        getDataList()

    }


    const onGridReady = (params) => {
        agGridRef.current = params.api;
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


    const linkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;

        if (row?.IsActive) {
            return (
                <>
                    <div
                        id='showRfq_detail'
                        onClick={() => viewDetails(row)}
                        className={'link'}
                    >{cell}</div>
                </>
            )
        } else {

            return cell ? cell : "-"

        }
    }
    const quotationReceiveFormatter = (props) => {

        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;

        if (row?.IsActive) {
            return (
                <>
                    {cell >= 1 ? <div
                        onClick={() => viewDetails(row)}
                        className={'link'}
                    >{cell}</div> : <div>{cell}</div>}
                </>
            )
        } else {

            return cell ? cell : "-"

        }
    }
    const statusFormatter = (props) => {
        dispatch(getGridHeight({ value: agGridRef.current.rowRenderer.allRowCons.length, component: 'RFQ' }))
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let tempStatus = '-'
        if (row?.Status === APPROVED || row?.Status === UNDER_REVISION || row?.Status === RECEIVED || row?.Status === SUBMITTED || row?.Status === UNDER_APPROVAL) {
            tempStatus = row?.DisplayStatus + ' (' + row?.CostingReceived + '/' + row?.TotalCostingCount + ')'
        } else {
            tempStatus = row?.DisplayStatus ?? '-'
        }
        return <div className={cell}>{tempStatus}</div>
    }

    const viewAttachmentData = (index) => {
        setAttachment(true)
        setViewAttachment(index)
    }

    const closeAttachmentDrawer = (e = '') => {
        setAttachment(false)
    }
    const dashFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-';
    }
    const timeZoneFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-'
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const dateTimeFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY  hh:mm') : '-';
    }
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            rowData.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
    }

    const attachmentFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
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
    const raisedOnFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-'
    }

    const viewDetails = (rowData) => {

        setViewRfqData(rowData)

        setViewRfq(true)
        // this.setState({
        //     UserId: UserId,
        //     isOpen: true,
        // })

    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };
    const hyphenFormatter = (props) => {

        const cellValue = props?.value;
        return cellValue !== " " &&
            cellValue !== null &&
            cellValue !== "" &&
            cellValue !== undefined
            ? cellValue
            : "-";
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter,
        customNoRowsOverlay: NoContentFound,
        quotationReceiveFormatter: quotationReceiveFormatter,
        attachmentFormatter: attachmentFormatter,
        statusFormatter: statusFormatter,
        dateFormatter: dateFormatter,
        dashFormatter: dashFormatter,
        dateTimeFormatter: dateTimeFormatter,
        valuesFloatingFilter: SingleDropdownFloationFilter,
        hyphenFormatter: hyphenFormatter,
        cellRendererFramework: CustomCellRenderer
    }


    return (
        <>
            {!addRfq && permissionData !== undefined &&
                <div className={`ag-grid-react report-grid p-relative  ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                    {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                        <>
                            <Row className={`filter-row-large pt-2 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>

                                <Col md="3" lg="3" className='mb-2'>
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                    <TourWrapper
                                        buttonSpecificProp={{ id: "Rfq_listing_Tour", onClick: toggleExtraData }}
                                        stepsSpecificProp={{
                                            steps: Steps(t, { Cancel: true, showRfqDetail: true, filterButton: false, downloadButton: false, bulkUpload: false, DeleteButton: false, costMovementButton: false, addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                        }} />
                                </Col>
                                <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                    {
                                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                        (!props?.isMasterSummaryDrawer) &&
                                        <>
                                            <div className="d-flex justify-content-end bd-highlight w100">
                                                <>
                                                    {(addAccessibility || permissionData?.permissionDataVendor?.Add) && (<button
                                                        type="button"
                                                        className={"user-btn mr5 Tour_List_Add"}
                                                        onClick={formToggle}
                                                        title="Add"
                                                    >
                                                        <div className={"plus mr-0"}></div>
                                                        {/* ADD */}
                                                    </button>)}

                                                </>
                                            </div>

                                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0 Tour_List_Reset"></div>
                                            </button>
                                        </>
                                    }
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                        <div className={`ag-theme-material ${(loader) && "max-loader-height"}`}>
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                            <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                ref={agGridRef}
                                                domLayout='autoHeight'
                                                rowData={showExtraData ? [...setLoremIpsum(rowData[0]), ...rowData] : rowData}

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
                                                suppressRowClickSelection={true}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                            >
                                                <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='RFQ No.' cellRenderer={'linkableFormatter'} ></AgGridColumn>
                                                {/* <AgGridColumn field="NfrId" headerName='NFR Id' width={150}></AgGridColumn> */}
                                                <AgGridColumn field="PartType" headerName="Part Type" width={150} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                <AgGridColumn field="PartNumber" tooltipField="PartNumber" headerName="Part No." width={150} cellRendererFramework={CustomCellRenderer} />
                                                <AgGridColumn field="RawMaterial" tooltipField="PartNumber" headerName="Raw Material Name-Grade-Specification" width={230} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                <AgGridColumn field="PRNumber" headerName="PR No." width={150} cellRenderer={"hyphenFormatter"}></AgGridColumn>

                                                <AgGridColumn field="NoOfQuotationReceived" headerName='Quotation Received (No.)' maxWidth={150} cellRenderer={'quotationReceiveFormatter'}></AgGridColumn>
                                                <AgGridColumn field="VendorName" tooltipField="VendorName" headerName='Vendor (Code)' cellRendererFramework={CustomCellRenderer}></AgGridColumn>
                                                <AgGridColumn field="PlantName" tooltipField="PlantName" headerName='Plant (Code)'></AgGridColumn>
                                                <AgGridColumn field="TechnologyName" width={"160px"} headerName='Technology'></AgGridColumn>
                                                <AgGridColumn field="RaisedBy" width={"160px"} headerName='Initiated By'></AgGridColumn>
                                                <AgGridColumn field="RaisedOn" width={"145px"} headerName='Raised On' cellRenderer='dateFormatter' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                <AgGridColumn field="PartDataSentDate" width={"145px"} headerName='RFI Date' cellRenderer='dateFormatter' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>

                                                <AgGridColumn field="VisibilityMode" width={"200px"} headerName='Visibility Mode' cellRenderer='dashFormatter'></AgGridColumn>
                                                <AgGridColumn field="VisibilityDate" width={"160px"} headerName='Visibility Date' cellRenderer='dateTimeFormatter'></AgGridColumn>
                                                <AgGridColumn field="VisibilityDuration" width={"150px"} headerName='Visibility Duration' cellRenderer='dashFormatter'></AgGridColumn>
                                                {/* <AgGridColumn field="TimeZone" width={"150px"} headerName='Time Zone' cellRenderer='timeZoneFormatter'></AgGridColumn> */}
                                                <AgGridColumn field="LastSubmissionDate" width={"160px"} headerName='Quote Submission Date' cellRenderer='dateFormatter' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                {/* <AgGridColumn field="QuotationNumber" headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn> */}
                                                <AgGridColumn field="Remark" tooltipField="Remark" headerName='Notes' cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                <AgGridColumn field="Status" tooltipField="tooltipText" pinned="right" headerName="Status" headerClass="justify-content-center" cellClass="text-center" cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterRFQ}></AgGridColumn>
                                                {<AgGridColumn field="QuotationId" width={180} cellClass="ag-grid-action-container rfq-listing-action" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                            </AgGridReact>
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                        </>))
                    }

                    {viewRfq &&

                        <ViewRfq
                            data={viewRfqData}
                            isOpen={viewRfq}
                            getDataList={getDataList}
                            closeDrawer={closeDrawerViewRfq}
                        />

                    }

                    {
                        confirmPopup && <PopupMsgWrapper isOpen={confirmPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_DETAIL_CANCEL_ALERT}`} />
                    }

                </div >
            }
            <ApplyPermission.Provider value={permissionData}>

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
            </ApplyPermission.Provider>

            {
                attachment && (
                    <Attachament
                        isOpen={attachment}
                        index={viewAttachment}
                        closeDrawer={closeAttachmentDrawer}
                        anchor={'right'}
                        gridListing={true}
                    />
                )
            }


        </>
    );
}

export default RfqListing;

