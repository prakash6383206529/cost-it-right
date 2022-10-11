import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { userDepartmetList } from "../.././helper/auth"
import { defaultPageSize, EMPTY_DATA, } from '../.././config/constants'
import NoContentFound from '.././common/NoContentFound';
import { MESSAGES } from '../.././config/message';
import Toaster from '.././common/Toaster';
import 'react-input-range/lib/css/index.css'
import DayTime from '.././common/DayTimeWrapper'
import BulkUpload from '.././massUpload/BulkUpload'
import LoaderCustom from '.././common/LoaderCustom';
import { RMDOMESTIC_DOWNLOAD_EXCEl } from '../.././config/masterData';
import { RmDomestic } from '../.././config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import PopupMsgWrapper from '.././common/PopupMsgWrapper';
import WarningMessage from '.././common/WarningMessage';
import { PaginationWrapper } from '.././common/commonPagination'
import SelectRowWrapper from '.././common/SelectRowWrapper';
import _ from 'lodash';
import { useRef } from 'react';
import { getQuotationList } from './actions/rfq';
import AddRfq from './AddRfq';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};


function RfqListing(props) {
    const { AddAccessibility, BulkUploadAccessibility, ViewRMAccessibility, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, apply, selectionForListingMasterAPI, objectForMultipleSimulation, ListFor } = props;
    const [value, setvalue] = useState({ min: 0, max: 0 });
    const [isBulkUpload, setisBulkUpload] = useState(false);
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const rmDataList = useSelector((state) => state.material.rmDataList);
    const allRmDataList = useSelector((state) => state.material.allRmDataList);
    const filteredRMData = useSelector((state) => state.material.filteredRMData);
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [showPopupBulk, setShowPopupBulk] = useState(false)
    const [isFinalLevelUser, setIsFinalLevelUser] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX IN SIMULATION
    const [disableDownload, setDisableDownload] = useState(false)
    const [addRfq, setAddRfq] = useState(false);
    const [addRfqData, setAddRfqData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [rowData, setRowData] = useState([{ TechnologyName: "sheet", QuotationId: "2424", RMGrade: "" }])
    const [noData, setNoData] = useState(false)
    const [dataCount, setDataCount] = useState(0)
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", UOM: "", VendorName: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", DepartmentName: isSimulation ? userDepartmetList() : "", CustomerName: "" })



    useEffect(() => {
        getDataList()
        return () => {

        }

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
            rowData: rowData
        }
        setIsEdit(true)
        setAddRfqData(data)
        setAddRfq(true)
    }


    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        // dispatch(deleteRawMaterialAPI(ID, (res) => {
        //     if (res !== undefined && res.status === 417 && res.data.Result === false) {
        //         Toaster.error(res.data.Message)
        //     } else if (res && res.data && res.data.Result === true) {
        //         Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
        //         resetState()
        //     }
        // }));
        setShowPopup(false)
    }

    const onPopupConfirm = () => {
        confirmDelete(deletedId);
    }
    const onPopupConfirmBulk = () => {
        confirmDensity()
    }
    const closePopUp = () => {
        setShowPopup(false)
        setShowPopupBulk(false)
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
                {/* {isDeleteButton && <button title='Delete' className="Delete mr-1" type={'button'} onClick={() => deleteItem(cellValue)} />} */}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

        let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';

        return data;
    }


    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value = cell != null ? cell : '';
        return value
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const statusFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    /**
    * @method commonCostFormatter
    * @description Renders buttons
    */
    const commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }


    const formToggle = () => {
        // props.formToggle()
        setAddRfq(true)
    }

    const bulkToggle = () => {
        setisBulkUpload(true);
    }

    const closeBulkUploadDrawer = () => {
        setisBulkUpload(false);
        // resetState()
    }

    const closeDrawer = () => {
        setAddRfqData({})
        setAddRfq(false)
        getDataList()

    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    const densityAlert = () => {
    }


    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    const confirmDensity = () => {
        props.toggle('4')
    }


    const onGridReady = (params) => {
        setgridApi(params.api);

        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {

        gridApi.paginationSetPageSize(Number(newPageSize));

    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []

        temp = TempData && TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            } else {
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            }
            return item
        })

        return (

            <ExcelSheet data={temp} name={RmDomestic}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }



    const onExcelDownload = () => {
        setDisableDownload(true)
        // dispatch(disabledClass(true))
        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                // dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-rm-import')
                button && button.click()
            }, 400);


        } else {

            getDataList(null, null, null, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }

    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination


        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allRmDataList ? allRmDataList : [])
        return returnExcelColumn(RMDOMESTIC_DOWNLOAD_EXCEl, tempArr)
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

    const onRowSelect = (event) => {
        var selectedRows = gridApi && gridApi?.getSelectedRows();

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isSimulation ? isFirstColumn : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.RawMaterialId === props.node.data.RawMaterialId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadRenderer: costingHeadFormatter,
        customNoRowsOverlay: NoContentFound,
        costFormatter: costFormatter,
        commonCostFormatter: commonCostFormatter,
        statusFormatter: statusFormatter,
        hyphenFormatter: hyphenFormatter,
        checkBoxRenderer: checkBoxRenderer

    }


    return (
        <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""} ${isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
            {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
                <>

                    <Row className={`filter-row-large pt-4 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                        <Col md="3" lg="3" className='mb-2'>
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                        </Col>
                        <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                            {disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
                            {
                                // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                (!props.isMasterSummaryDrawer) &&
                                <>

                                    {!isSimulation &&
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            <>


                                                {true && (
                                                    <button
                                                        type="button"
                                                        className={"user-btn mr5"}
                                                        onClick={formToggle}
                                                        title="Add"
                                                    >
                                                        <div className={"plus mr-0"}></div>
                                                        {/* ADD */}
                                                    </button>
                                                )}
                                                {BulkUploadAccessibility && (
                                                    <button
                                                        type="button"
                                                        className={"user-btn mr5"}
                                                        onClick={bulkToggle}
                                                        title="Bulk Upload"
                                                    >
                                                        <div className={"upload mr-0"}></div>
                                                        {/* Bulk Upload */}
                                                    </button>
                                                )}
                                                {
                                                    DownloadAccessibility &&
                                                    <>
                                                        {disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                                                        </button></div> :

                                                            <>
                                                                <button type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                                    {/* DOWNLOAD */}
                                                                </button>

                                                                <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                                                                    <button id={'Excel-Downloads-rm-import'} className="p-absolute" type="button" >
                                                                    </button>}>
                                                                    {onBtExport()}
                                                                </ExcelFile>

                                                            </>

                                                        }
                                                    </>
                                                }

                                            </>
                                        </div>
                                    }
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
                                </>
                            }
                        </Col>

                    </Row>
                    <Row>
                        <Col>
                            <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rmDataList && rmDataList?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
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

                                        suppressRowClickSelection={true}
                                    >
                                        <AgGridColumn cellClass="has-checkbox" field="QuotationId" headerName='RFQ Id' cellRenderer={checkBoxRenderer}></AgGridColumn>
                                        <AgGridColumn field="VendorName" headerName='Vendors'></AgGridColumn>
                                        <AgGridColumn field="PlantName" headerName='Plant'></AgGridColumn>
                                        <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                                        <AgGridColumn field="PartNumber" headerName="Part Nos"></AgGridColumn>
                                        <AgGridColumn field="Attachments" headerName='Attachment' cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn field="Remark" headerName='Remark'></AgGridColumn>
                                        <AgGridColumn field="MaterialType" headerName='No. Of Quotation Received'></AgGridColumn>
                                        <AgGridColumn field="Status" headerName="Status"></AgGridColumn>
                                        {/* <AgGridColumn field="TechnologyId" headerName="Action"></AgGridColumn> */}

                                        {/* <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn> */}
                                        {<AgGridColumn width={160} field="QuotationId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                    </AgGridReact>
                                    <div className='button-wrapper'>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />}

                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            }
            {
                isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={closeBulkUploadDrawer}
                        isEditFlag={false}
                        densityAlert={densityAlert}
                        fileName={"RMDomestic"}
                        isZBCVBCTemplate={true}
                        messageLabel={"RM Domestic"}
                        anchor={"right"}
                        isFinalApprovar={isFinalLevelUser}
                    />
                )
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
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
            {
                showPopupBulk && <PopupMsgWrapper isOpen={showPopupBulk} closePopUp={closePopUp} confirmPopup={onPopupConfirmBulk} message={`Recently Created Material's Density is not created, Do you want to create?`} />
            }

        </div >
    );
}

export default RfqListing;

