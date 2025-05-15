import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { BOUGHTOUTPARTSPACING, COMPONENT_PART, EMPTY_DATA, FILE_URL, RAW_MATERIAL, RFQ, } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination'
import { checkForDecimalAndNull, checkPermission, getConfigurationKey, labelWithUOMAndCurrency, loggedInUserId, searchNocontentFilter, setLoremIpsum, showBopLabel } from '../../../helper';
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
import WarningMessage from '../../common/WarningMessage';
import { reactLocalStorage } from 'reactjs-localstorage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../../helper/core';
const gridOptions = {};


function NfrPartsListing(props) {
    const { showNfrPartListing, activeTab } = props || {};
    const { t } = useTranslation("Nfr")
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
    const [showWarning, setShowWarning] = useState(false);
    const [outsourcingCostingData, setOutsourcingCostingData] = useState({});
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
    const [editNfr, setEditNfr] = useState(false)
    const [fetchData, setFetchData] = useState(false)
    const { technologyLabel } = useLabels();
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
                setFetchData(true)
                setRowData(StatusTooltip(res?.data?.DataList))
                let data = [...res?.data?.DataList]
                let showOutsourcing = false
                data && data?.map(item => {
                    if (item?.PartType === "Raw Material") {
                        showOutsourcing = true
                    } else if (item?.PartType === "Bought Out Part") {
                        showOutsourcing = true
                    }
                })
                if (showOutsourcing) {
                    setShowWarning(true)
                } else {
                    setShowWarning(false)
                }
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
        setEditNfr(true)
        setIsViewMode(viewMode)
        setEstimationData(rowData)
        setEditPart(true)
        setEditNfr(true)
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
    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);


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
                Toaster.success(MESSAGES.BOP_RM_PUSHED)
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
                {(showExtraData && props.rowIndex === 0) && (
                    <>
                        < button type="button" id="viewNfrPart_list" className={"View mr-1"} onClick={() => { formToggle(rowData, true) }} disabled={false} title="View"></button >
                        < button type="button" id="addNfrPart_list" className={"add-out-sourcing mr-1"} onClick={() => { formToggle(rowData, false) }} disabled={false} title="Add"></button >
                        <button type="button" className={"pushed-action-btn mr-1"} id="pushedNfrToSap" onClick={() => { pushToSap(rowData) }} disabled={!showPush} title="Please add RM/BOP price in master, to add outsourcing cost and push the price on SAP"></button >                    {/* Add more buttons as needed */}
                        <button title='View RM' id="viewNfrRM_list" className="view-masters mr-1" type={'button'} onClick={() => viewRM(rowData)} />
                        <button title='View' className="View mr-1" id="viewOutSourcing_list" type={'button'} onClick={() => editPartHandler(cellValue, rowData, true)} />
                        <button title='Edit' className="Edit mr-1" type={'button'} id="editNfr_list" onClick={() => editPartHandler(cellValue, rowData, false)} />
                        <button title='Associate part with technology' id="associatePartWithTechnology" className="create-rfq mr-1" type={'button'} onClick={() => associatePartWithTechnology(cellValue, rowData, false)} />
                    </>
                )}
                {showOutsourcing && !rowData?.IsRmAndBopActionEditable && < button type="button" id="viewNfrPart_list" className={"View mr-1"} onClick={() => { formToggle(rowData, true) }} disabled={false} title="View"></button >}
                {showOutsourcing && rowData?.IsRmAndBopActionEditable && < button type="button" className={"add-out-sourcing mr-1"} onClick={() => { formToggle(rowData, false) }} disabled={false} title="Add"></button >}
                {showOutsourcing && < button type="button" className={"pushed-action-btn mr-1"} onClick={() => { pushToSap(rowData) }} disabled={!showPush} title={`Please add RM/${showBopLabel()} price in master, to add outsourcing cost and push the price on SAP`}></button >}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='View RM' className="view-masters mr-1" type={'button'} onClick={() => viewRM(rowData)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='View' className="View mr-1" type={'button'} onClick={() => editPartHandler(cellValue, rowData, true)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editPartHandler(cellValue, rowData, false)} />}
                {!rowData?.IsRmAndBopActionEditable && !showOutsourcing && <button title='Associate part with technology' className="create-rfq mr-1" type={'button'} onClick={() => associatePartWithTechnology(cellValue, rowData, false)} />}

            </>
        )
    };


    const onGridReady = (params) => {
        setgridApi(params.api);
        window.screen.width >= 1921 && params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };


    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
        window.screen.width >= 1921 && gridApi.sizeColumnsToFit();

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
        tempStatus = row?.DisplayStatus
        return <div className={cell}>{tempStatus}</div>
    }

    const dateFormater = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }
    const partTypeFormater = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null && cellValue === BOUGHTOUTPARTSPACING ? `${showBopLabel()} (Standard)` : cellValue === COMPONENT_PART ? 'Component (Customized)' : cellValue === RAW_MATERIAL ? 'Raw Material' : ' -';
    }

    /**
     * @method costFormatter
     */
    const costFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? checkForDecimalAndNull(cellValue, getConfigurationKey()?.NoOfDecimalForPrice) : '-';
    }

    /**
     * @method netLandedFormatter
     */
    const netLandedFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const tempValue = `${checkForDecimalAndNull(row?.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice)} (${row?.Currency ? row?.Currency : reactLocalStorage.getObject("baseCurrency")}/${row?.UOM ? row?.UOM : 'UOM'})`
        return tempValue;
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
        setTimeout(() => {
            rowData.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
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
            getDataList()
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
        setEditNfr(false)
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
        partTypeFormater: partTypeFormater,
        costFormatter: costFormatter,
        netLandedFormatter: netLandedFormatter,
    }

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        window.screen.width >= 1921 && gridApi.sizeColumnsToFit();
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
                                    <TourWrapper
                                        buttonSpecificProp={{ id: "Nfr_Parts_Listing_Tour", onClick: toggleExtraData }}
                                        stepsSpecificProp={{
                                            steps: Steps(t, { activeTab, editNfr, showNfrPartListing }).NFR_lISTING
                                        }} />
                                </Col>
                                <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                    {
                                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                        (!props.isMasterSummaryDrawer) &&
                                        <>


                                            <div className={`d-flex align-items-center simulation-label-container mr-2`}>
                                                <div className='d-flex pl-3'>
                                                    <label>Customer RFQ Ref. Number : </label>
                                                    <p className='technology ml-1 nfr-id-wrapper' >{rowData && rowData[0]?.NfrRefNumber ? rowData[0]?.NfrRefNumber : ''}</p>
                                                </div>
                                            </div>
                                            <button type="button" id="backNFR_listing" className={"apply ml-1"} onClick={props?.closeDrawer}> <div id="backNFR_listing" className={'back-icon'}></div>Back</button>
                                        </>
                                    }
                                    <button type="button" id="resetNFR_listing" className="ml-1 user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
                                </Col>

                            </Row>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                        <div className={`ag-theme-material ${(loader) && "max-loader-height"}`}>
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                            {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                rowData={rowData && rowData.length > 0 ? showExtraData && fetchData ? [...setLoremIpsum(rowData[0]), ...rowData] : rowData : []}
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
                                                <AgGridColumn field="Technology" headerName={technologyLabel} width={150} cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartType" headerName='Part Type' width={150} cellRenderer={partTypeFormater}></AgGridColumn>
                                                <AgGridColumn field="PartNumber" headerName='Part No.' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PartName" headerName='Part Name' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="ComponentQty" headerName='Component Quantity' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="NetLandedCost" headerName='Cost (Currency/UOM)' cellRenderer={netLandedFormatter}></AgGridColumn>
                                                <AgGridColumn field="OutsourcingCost" headerName='Outsourcing Cost' cellRenderer={costFormatter}></AgGridColumn>
                                                <AgGridColumn field="CreatedOn" headerName='Created On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="PlantName" headerName='Plant Name' cellRenderer={hyphenFormatter}></AgGridColumn>
                                                <AgGridColumn field="PushedOn" headerName='Pushed On' cellRenderer={dateFormater}></AgGridColumn>
                                                <AgGridColumn field="Status" tooltipField="tooltipText" headerName="Status" headerClass="justify-content-center" cellClass="text-center" minWidth={170} cellRenderer="statusFormatter"></AgGridColumn>
                                                {<AgGridColumn field="Status" width={250} cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                            </AgGridReact>}
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                                        </div>
                                    </div>
                                </Col>
                                <Col md="12" className='justify-content-end d-flex'>
                                    {showWarning && <WarningMessage dClass="mt-2" message={`Please add RM/${showBopLabel()} price in master, to add outsourcing cost and push the price on SAP`} />}
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
            {editPart && <AddNfr showAddNfr={editPart} nfrData={estimationData} close={close} nfrIdsList={nfrIdsList} isViewEstimation={isViewMode} changeIsFromDiscount={props?.changeIsFromDiscount} NfrNumber={rowData && rowData[0]?.NfrRefNumber} showNfrPartListing={showNfrPartListing} activeTab={activeTab} editNfr={editNfr} showExtraData={showExtraData} />}
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

