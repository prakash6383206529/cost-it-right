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
import { checkPermission, searchNocontentFilter, userDetails } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper';
import Attachament from '../../costing/components/Drawers/Attachament';
import NfrPartsListing from './NfrPartsListing';
import { fetchNfrDetailFromSap, getAllNfrList, nfrDetailsForDiscountAction } from './actions/nfr';
import { StatusTooltip, hyphenFormatter } from '../masterUtil';
import Toaster from '../../common/Toaster';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { useRef } from 'react';
import { agGridStatus, getGridHeight, isResetClick } from '../../../actions/Common';
const gridOptions = {};


function NfrListing(props) {
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
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const agGridRef = useRef(null);
    const floatingFilterNfr = {
        maxValue: 12,
        suppressFilterButton: true,
        component: "NFR",
    }
    useEffect(() => {
        setloader(true)
        getDataList()
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])

    useEffect(() => {
        if (statusColumnData) {
            gridApi?.setQuickFilter(statusColumnData?.data);
        }
    }, [statusColumnData])

    useEffect(() => {
        getDataList()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
    }, [])

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
    const getDataList = () => {
        dispatch(getAllNfrList((res) => {
            if (res?.data?.DataList?.length > 0) {
                setRowData(StatusTooltip(res?.data?.DataList))
            }
            setloader(false)
        }))
        setloader(false)
    }

    const resetState = () => {

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();
        gridApi.deselectAll()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
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

        setSelectedPartData(rowData)
        setNfrId(rowData?.NfrNumber)
        let obj = { ...nfrDetailsForDiscount, rowData: rowData }
        dispatch(nfrDetailsForDiscountAction(obj))
        setIsEdit(true)
        setAddRfqData(data)
        setAddRfq(true)
    }


    const onPopupConfirm = () => {

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
        let status = rowData?.Status

        return (
            <>
                {<button title='View' className="View mr-1" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}

            </>
        )
    };


    const closeDrawer = () => {
        setAddRfqData({})
        setAddRfq(false)
        getDataList()
        setIsEdit(false)

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
    const statusFormatter = (props) => {
        dispatch(getGridHeight({ value: props.rowIndex, component: 'NFR' }))
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let tempStatus = '-'
        tempStatus = row?.DisplayStatus
        let displayCount = `${row?.ApprovalPartCount}/${row?.NumberOfParts}`
        return <div className={cell}>{`${tempStatus} ${displayCount}`}</div>
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
        rowData.length !== 0 && setNoData(searchNocontentFilter(value, noData))
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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };


    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter,
        attachmentFormatter: attachmentFormatter,
        statusFormatter: statusFormatter,
        dateFormater: dateFormater,
        valuesFloatingFilter: SingleDropdownFloationFilter,
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

    return (
        <>
            {!addRfq &&
                <div className={`ag-grid-react report-grid p-relative${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                    {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                        <>
                            {sapLoader && <LoaderCustom message="Fetching data from SAP" />}
                            <Row className={`filter-row-large pt-2 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>

                                <Col md="3" lg="3" className='mb-2'>
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                </Col>

                                <Col md="9" className="mb-3 d-flex justify-content-end">
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
                                    <button
                                        type="button"
                                        className={'secondary-btn ml-1'}
                                        title="Fetch"
                                        onClick={openFetchDrawer}
                                        onMouseOver={handleMouse}
                                        onMouseOut={handleMouseOut}
                                    >
                                        <div className={`${isHover ? "swap-hover" : "swap"} mr-0`}></div>
                                    </button>
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                        <div className={`ag-theme-material`}>
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
                                                suppressRowClickSelection={true}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                                ref={agGridRef}
                                            >
                                                {/* <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='RFQ No.' cellRenderer={'linkableFormatter'} ></AgGridColumn> */}
                                                <AgGridColumn field="NfrNumber" headerName="NFR Id" width={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="ProductCode" headerName='Product Code' maxWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NfrRefNumber" headerName='Nfr Ref. Number' maxWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NfrVersion" headerName='Version/Revision' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NumberOfParts" headerName='No. of Parts' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="SimulatedOn" headerName='Simulated On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="ApprovedOn" headerName='Approved On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="Status" tooltipField="tooltipText" cellClass="text-center" headerName="Status" headerClass="justify-content-center" minWidth={170} cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterNfr}></AgGridColumn>
                                                {<AgGridColumn field="Status" width={180} cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                            </AgGridReact>
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                        </>))
                    }


                    {
                        confirmPopup && <PopupMsgWrapper isOpen={confirmPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_DETAIL_CANCEL_ALERT}`} />
                    }

                </div >
            }

            {
                addRfq &&

                <NfrPartsListing
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
                />

            }
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

export default NfrListing;

