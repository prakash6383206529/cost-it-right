import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { APPROVED, CANCELLED, EMPTY_DATA, FILE_URL, RECEIVED, RFQ, SUBMITTED, UNDER_APPROVAL, UNDER_REVISION, } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
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
const gridOptions = {};


function NfrPartsListing(props) {
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
    const { topAndLeftMenuData } = useSelector(state => state.auth);

    useEffect(() => {
        setloader(true)
        getDataList()
        applyPermission(topAndLeftMenuData)

        let obj = {
            technology: 'Sheet Metal',
            partType: 'Z',
            partNo: 5,
            partName: 'Silencer',
            noOfSimulations: 5,
            createdOn: '25/05/2022',
            pushedOn: '27/05/2022',
            status: 'Draft'
        }

        let temp = []
        for (let i = 0; i < 10; i++) {
            temp.push(obj)
        }
        setRowData(temp)

    }, [topAndLeftMenuData])
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
        // dispatch(getQuotationList(userDetails()?.DepartmentCode, (res) => {
        //     let temp = []
        //     res?.data?.DataList && res?.data?.DataList.map((item) => {
        //         if (item.IsActive === false) {
        //             item.Status = "Cancelled"
        //         }
        //         item.tooltipText = ''
        //         switch (item.Status) {
        //             case APPROVED:
        //                 item.tooltipText = 'Total no. of parts for which costing has been approved from that quotation / Total no. of parts exist in that quotation'
        //                 break;
        //             case RECEIVED:
        //                 item.tooltipText = 'Total no. of costing received / Total no. of expected costing in that quotation'
        //                 break;
        //             case UNDER_REVISION:
        //                 item.tooltipText = 'Total no. of costing under revision / Total no. of expected costing in that quotation'
        //                 break;
        //             default:
        //                 break;
        //         }
        //         temp.push(item)
        //         return null
        //     })
        //     setRowData(temp)
        //     setloader(false)
        // }))
        setTimeout(() => {
            setloader(false)
        }, 1000);
    }

    const resetState = () => {

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();
        gridApi.deselectAll()
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
        // dispatch(cancelRfqQuotation(deleteId, (res) => {
        //     if (res.status === 200) {
        //         Toaster.success('Quotation has been cancelled successfully.')
        //         setTimeout(() => {
        //             getDataList()
        //         }, 500);
        //     }
        //     setConfirmPopup(false)
        // }))
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
                {<button title='View' className="View mr-1" type={'button'} onClick={() => { }} />}
                <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => { }} />

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

    const closeDrawerViewRfq = () => {
        setViewRfq(false)
        getDataList()

    }


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
        tempStatus = row?.status

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


    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter,
        attachmentFormatter: attachmentFormatter,
        statusFormatter: statusFormatter,
        dateFormater: dateFormater
    }


    return (
        <>
            {!addRfq &&
                <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                    {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                        <>
                            <h1 className='mb-0'>View Parts</h1>
                            <Row className={`filter-row-large ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                                <Col md="3" lg="3" className='mb-2'>
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                </Col>
                                <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                    {
                                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                        (!props.isMasterSummaryDrawer) &&
                                        <>

                                            {/* <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button> */}
                                            <div className={`d-flex align-items-center simulation-label-container mr-2`}>
                                                <div className='d-flex pl-3'>
                                                    <label>NFR ID: </label>
                                                    <p className='technology ml-1' >{5}</p>
                                                </div>
                                            </div>
                                            <button type="button" className={"apply ml-1"} onClick={props?.closeDrawer}> <div className={'back-icon'}></div>Back</button>

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
                                                <AgGridColumn field="technology" headerName="Technology" width={150}></AgGridColumn>
                                                <AgGridColumn field="partType" headerName='Part Type' maxWidth={150}></AgGridColumn>
                                                <AgGridColumn field="partNo" headerName='Part No.'></AgGridColumn>
                                                <AgGridColumn field="partName" headerName='Part Name'></AgGridColumn>
                                                <AgGridColumn field="noOfSimulations" headerName='No. of Simulations'></AgGridColumn>
                                                <AgGridColumn field="createdOn" headerName='Created On'></AgGridColumn>
                                                <AgGridColumn field="pushedOn" headerName='Pushed On'></AgGridColumn>
                                                <AgGridColumn field="status" headerName="Status" cellClass="text-center" minWidth={170} cellRenderer="statusFormatter"></AgGridColumn>
                                                {<AgGridColumn field="QuotationId" width={180} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                            </AgGridReact>
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                                        </div>
                                    </div>
                                </Col>
                            </Row>


                        </>))
                    }

                    {/* {viewRfq &&

                        <ViewRfq
                            data={viewRfqData}
                            isOpen={viewRfq}
                            closeDrawer={closeDrawerViewRfq}
                        />

                    } */}

                    {
                        confirmPopup && <PopupMsgWrapper isOpen={confirmPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_DETAIL_CANCEL_ALERT}`} />
                    }

                </div >
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

export default NfrPartsListing;

