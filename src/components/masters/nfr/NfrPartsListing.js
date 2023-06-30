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
import { getNfrPartDetails, nfrDetailsForDiscountAction, pushNfrRmBopOnSap } from './actions/nfr';
import { StatusTooltip, hyphenFormatter } from '../masterUtil';
import AddNfr from './AddNfr';
import DrawerTechnologyUpdate from './DrawerTechnologyUpdate';
import { ASSEMBLY } from '../../../config/masterData';
import Toaster from '../../common/Toaster';
import RMDrawer from './RMDrawer';
import OutsourcingDrawer from './OutsourcingDrawer';
const gridOptions = {};


function NfrPartsListing(props) {
    const { nfrDetailsForDiscount } = useSelector(state => state.costing)
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const [addRfq, setAddRfq] = useState(false);
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([])
    const [estimationData, setEstimationData] = useState(props?.isFromDiscount ? nfrDetailsForDiscount?.objForpart : [])
    const [noData, setNoData] = useState(false)
    const [viewRfq, setViewRfq] = useState(false)
    const [viewRfqData, setViewRfqData] = useState("")
    const [addAccessibility, setAddAccessibility] = useState(false);
    const [editAccessibility, setEditAccessibility] = useState(false);
    const [viewAccessibility, setViewAccessibility] = useState(false);
    const [editPart, setEditPart] = useState(props?.isFromDiscount ? true : false)
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [attachment, setAttachment] = useState(false);
    const [viewAttachment, setViewAttachment] = useState([])
    const [nfrIdsList, setNFRIdsList] = useState(props?.isFromDiscount ? nfrDetailsForDiscount?.objectFordisc : {})
    const [isViewMode, setIsViewMode] = useState(false)
    const [showDrawer, setShowDrawer] = useState(false)
    const [rmDrawer, setRMDrawer] = useState(false)
    const [rowDataFortechnologyUpdate, setRowDataFortechnologyUpdate] = useState({})
    const [showOutsourcingDrawer, setShowOutsourcingDrawer] = useState('');
    const [viewMode, setViewMode] = useState(false);
    const [outsourcingCostingData, setOutsourcingCostingData] = useState({});
    const { topAndLeftMenuData } = useSelector(state => state.auth);

    useEffect(() => {
        setloader(true)
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])


    useEffect(() => {
        getDataList()
        props?.changeIsFromDiscount(false)
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
        dispatch(getNfrPartDetails(props?.isFromDiscount ? nfrDetailsForDiscount?.rowData?.NfrId : props?.data?.NfrId, (res) => {
            if (res?.data?.DataList?.length > 0) {
                setRowData(StatusTooltip(res?.data?.DataList))
            }
            setloader(false)
        }))
        setloader(false)
    }


    const onPopupConfirm = () => {

    }
    const editPartHandler = (value, rowData, viewMode) => {
        if (Number(rowData?.TechnologyId) === ASSEMBLY) {
            Toaster.warning("Please update the technology of this part to create costing of this part.")
            return false
        }
        setIsViewMode(viewMode)
        setEstimationData(rowData)
        setEditPart(true)
        setNFRIdsList({ NfrMasterId: rowData?.NfrMasterId, NfrPartWiseDetailId: rowData?.NfrPartWiseDetailId })
        let obj = {
            ...nfrDetailsForDiscount,
            objectFordisc: {
                NfrMasterId: rowData?.NfrMasterId, NfrPartWiseDetailId: rowData?.NfrPartWiseDetailId,
            },
            objForpart: {
                NfrPartStatusId: rowData?.NfrPartStatusId, PartNumber: rowData?.PartNumber, PartName: rowData?.PartName
                , PartId: rowData?.PartId, PartType: rowData?.PartType, TechnologyId: rowData?.TechnologyId, PlantId: rowData.PlantId
            }
        }
        dispatch(nfrDetailsForDiscountAction(obj))
    }

    const viewRM = (rowData) => {
        setNFRIdsList({ NfrMasterId: rowData?.NfrMasterId, NfrPartWiseDetailId: rowData?.NfrPartWiseDetailId })
        setTimeout(() => {
            setRMDrawer(true)
        }, 300);
    }

    const associatePartWithTechnology = (value, rowData, viewMode) => {
        setRowDataFortechnologyUpdate(rowData)
        setShowDrawer(true)
    }

    const closePopUp = () => {
        setConfirmPopup(false)
    }

    const formToggle = (data, viewMode) => {
        // setIndexOuter(indexOuter)
        // setIndexInside(indexInside)
        setOutsourcingCostingData(data)
        setTimeout(() => {
            setShowOutsourcingDrawer(true)
            setViewMode(viewMode)
        }, 300);
    }

    const pushToSap = (data) => {
        let obj = {
            NfrRawMaterialAndBoughtOutPartDetailIds: [
                data?.NfrRawMaterialAndBoughtOutPartDetailId
            ],
            LoggedInUserId: loggedInUserId()
        }
        dispatch(pushNfrRmBopOnSap(obj, (res) => {
            if (res?.data?.Result) {
                Toaster.warining(MESSAGES.BOP_RM_PUSHED)
            }
            getDataList()
        }))
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {

        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let status = rowData?.Status
        let showOutsourcing = false
        if (rowData?.PartType === "Raw Material" && rowData?.RawMaterialId !== null) {
            showOutsourcing = true
        } else if (rowData?.PartType === "Bought Out Part" && rowData?.BoughtOutPartId !== null) {
            showOutsourcing = true
        }
        let showPush = rowData?.IsPushedButtonShow && (rowData?.NetLandedCost !== null || rowData?.NetLandedCost !== 0)
        return (
            <>
                {showOutsourcing && !rowData?.IsRmAndBopActionEditable && < button type="button" className={"View mr-1"} onClick={() => { formToggle(rowData, true) }} disabled={false} title="View"></button >}
                {showOutsourcing && rowData?.IsRmAndBopActionEditable && < button type="button" className={"add-out-sourcing mr-1"} onClick={() => { formToggle(rowData, false) }} disabled={false} title="Add"></button >}
                {showOutsourcing && showPush && < button type="button" className={"view-masters mr-1"} onClick={() => { pushToSap(rowData) }} disabled={false} title="Push"></button >}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='View RM' className="view-masters mr-1" type={'button'} onClick={() => viewRM(rowData)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='View' className="View mr-1" type={'button'} onClick={() => editPartHandler(cellValue, rowData, true)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editPartHandler(cellValue, rowData, false)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='Associate part with technology' className="create-rfq mr-1" type={'button'} onClick={() => associatePartWithTechnology(cellValue, rowData, false)} />}

            </>
        )
    };


    const onGridReady = (params) => {
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
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let tempStatus = '-'
        tempStatus = row?.Status

        return <div className={cell}>{tempStatus}</div>
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

    const closeTechnologyUpdateDrawer = (e = '') => {
        if (e === 'submit') {
            getDataList()
        }
        setShowDrawer(false)
    }

    const closeRMDrawer = (e = '') => {
        setRMDrawer(false)
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

    const closeOutsourcingDrawer = (type) => {
        if (type === 'submit') {
            // getDetails(true)
        }
        setShowOutsourcingDrawer(false)
    }

    const viewDetails = (UserId) => {
        setViewRfqData(UserId)
        setViewRfq(true)

    }
    const close = (type) => {
        if (type === 'submit') {
            props?.closeDrawer()
        }
        setEditPart(false)
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
        dateFormater: dateFormater
    }

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();
        getDataList()
    }
    return (
        <>
            {!addRfq && !editPart &&
                <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                    {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                        <>
                            <Row className={`filter-row-large ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                                <Col md="3" lg="3" className='mb-2'>
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                </Col>
                                <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                    {
                                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                        (!props.isMasterSummaryDrawer) &&
                                        <>


                                            <div className={`d-flex align-items-center simulation-label-container mr-2`}>
                                                <div className='d-flex pl-3'>
                                                    <label>NFR Id: </label>
                                                    <p className='technology ml-1 nfr-id-wrapper' >{rowData && rowData[0]?.NfrNumber ? rowData[0]?.NfrNumber : ''}</p>
                                                </div>
                                            </div>
                                            <button type="button" className={"apply ml-1"} onClick={props?.closeDrawer}> <div className={'back-icon'}></div>Back</button>
                                        </>
                                    }
                                    <button type="button" className="ml-1 user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
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
                                            >
                                                {/* <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='RFQ No.' cellRenderer={'linkableFormatter'} ></AgGridColumn> */}
                                                <AgGridColumn field="Technology" headerName="Technology" width={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartType" headerName='Part Type' maxWidth={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartNumber" headerName='Part No.' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartName" headerName='Part Name' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NumberOfSimulation" headerName='No. of Simulations' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NetLandedCost" headerName='Cost/Rate' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="OutsourcingCost" headerName='Outsourcing Cost' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="CreatedOn" headerName='Created On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="PushedOn" headerName='Pushed On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="Status" tooltipField="tooltipText" headerName="Status" cellClass="text-center" minWidth={170} cellRenderer="statusFormatter"></AgGridColumn>
                                                {<AgGridColumn field="Status" width={180} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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
            {showOutsourcingDrawer &&
                <OutsourcingDrawer
                    isOpen={showOutsourcingDrawer}
                    closeDrawer={closeOutsourcingDrawer}
                    anchor={'right'}
                    outsourcingCostingData={outsourcingCostingData}
                    viewMode={viewMode}
                // CostingId={OutsourcingCostingData?.CostingId}
                />}
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
            {editPart && <AddNfr showAddNfr={editPart} nfrData={estimationData} close={close} nfrIdsList={nfrIdsList} isViewEstimation={isViewMode} changeIsFromDiscount={props?.changeIsFromDiscount} NfrNumber={rowData && rowData[0]?.NfrNumber} />}
            {showDrawer &&
                <DrawerTechnologyUpdate
                    isOpen={showDrawer}
                    closeDrawer={closeTechnologyUpdateDrawer}
                    anchor={'right'}
                    rowDataFortechnologyUpdate={rowDataFortechnologyUpdate}
                />
            }
            {rmDrawer &&
                <RMDrawer
                    isOpen={rmDrawer}
                    closeDrawer={closeRMDrawer}
                    anchor={'right'}
                    NfrPartWiseDetailId={nfrIdsList?.NfrPartWiseDetailId}
                />
            }

        </>
    );
}

export default NfrPartsListing;

