import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, } from '../.././config/constants'
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
import { getQuotationList, cancelRfqQuotation, sendReminderForQuotation } from './actions/rfq';
import ViewRfq from './ViewRfq';
import AddRfq from './AddRfq';
const gridOptions = {};


function RfqListing(props) {
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false)
    const [addRfq, setAddRfq] = useState(false);
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([])
    const [noData, setNoData] = useState(false)
    const [dataCount, setDataCount] = useState(0)
    const [viewRfq, setViewRfq] = useState(false)
    const [viewRfqData, setViewRfqData] = useState("")


    useEffect(() => {
        getDataList()

    }, [])

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = () => {
        dispatch(getQuotationList((res) => {

            setRowData(res?.data?.DataList)
        }))
    }

    const resetState = () => {

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
    }


    /**
    * @method editItemDetails
    * @description edit material type
    */
    const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {

        let data = {
            isEditFlag: true,
            isViewFlag: isViewMode,
            rowData: rowData,
            Id: Id
        }
        setIsEdit(true)
        setAddRfqData(data)
        setAddRfq(true)
    }

    const cancelItem = (id) => {
        dispatch(cancelRfqQuotation(id, (res) => {
            if (res.status === 200) {
                Toaster.success('Quotation has been cancelled successfully.')
            }
        }))
        getDataList()
    }


    const sendReminder = (data) => {
        dispatch(sendReminderForQuotation(data, (res) => { }))

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


        return (
            <>
                {< button title='View' className="View mr-1" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {<button title='Edit' className="Edit mr-1" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {<button title='Delete' className="Delete mr-1" type={'button'} onClick={() => cancelItem(cellValue)} />}
                {<button title='Reminder: 5' className="btn-reminder mr-1" type={'button'} onClick={() => { sendReminder(cellValue) }}><div className="reminder"><div className="count">5</div></div></button>}
            </>
        )
    };



    const formToggle = () => {
        setAddRfq(true)
    }

    const closeDrawer = () => {
        setAddRfqData({})
        setAddRfq(false)
        getDataList()

    }

    const closeDrawerViewRfq = () => {
        setViewRfq(false)
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
                    onClick={() => viewDetails(row.QuotationId)}
                    className={'link'}
                >{cell}</div>
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
        sortable: true,
        headerCheckboxSelection: true ? isFirstColumn : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
    };


    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        linkableFormatter: linkableFormatter
    }


    return (
        <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
            {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
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
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <>

                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={formToggle}
                                                title="Add"
                                            >
                                                <div className={"plus mr-0"}></div>
                                                {/* ADD */}
                                            </button>

                                        </>
                                    </div>

                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
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
                                    // suppressRowClickSelection={true}
                                    >
                                        <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='RFQ Id' cellRenderer={'linkableFormatter'} ></AgGridColumn>
                                        <AgGridColumn field="VendorName" headerName='Vendors'></AgGridColumn>
                                        <AgGridColumn field="PlantName" headerName='Plant'></AgGridColumn>
                                        <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                                        <AgGridColumn field="PartNumber" headerName="Part Nos"></AgGridColumn>
                                        <AgGridColumn field="Attachments" headerName='Attachment' cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn field="Remark" headerName='Remark'></AgGridColumn>
                                        <AgGridColumn field="MaterialType" headerName='No. Of Quotation Received'></AgGridColumn>
                                        <AgGridColumn field="Status" headerName="Status"></AgGridColumn>
                                        {<AgGridColumn width={200} field="QuotationId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                    </AgGridReact>
                                    <div className='button-wrapper'>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />}

                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                </>)
            }

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


            {viewRfq &&

                <ViewRfq
                    data={viewRfqData}
                    isOpen={viewRfq}
                    closeDrawer={closeDrawerViewRfq}
                />

            }

            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }

        </div >
    );
}

export default RfqListing;

