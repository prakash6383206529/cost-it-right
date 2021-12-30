import React from 'react';
import { useForm } from 'react-hook-form'
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMDomesticDataList, getRawMaterialNameChild, getGradeSelectList, getVendorListByVendorType,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getVendorFilterByRawMaterialSelectList, setFilterForRM
} from '../actions/Material';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import 'react-input-range/lib/css/index.css'
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import LoaderCustom from '../../common/LoaderCustom';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common'
import { INR, ZBC, RmImport, RM_MASTER_ID, APPROVAL_ID } from '../../../config/constants'
import { costingHeadObjs, RMDOMESTIC_DOWNLOAD_EXCEl, RMIMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CheckApprovalApplicableMaster, getFilteredRMData, userDepartmetList } from '../../../helper';
import { setSelectedRowCountForSimulationMessage } from '../../simulation/actions/Simulation';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const gridOptions = {};


function RMDomesticListing(props) {
    const { AddAccessibility, BulkUploadAccessibility, loading, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, apply } = props;



    const [value, setvalue] = useState({ min: 0, max: 0 });
    const [maxRange, setmaxRange] = useState(0);
    const [isBulkUpload, setisBulkUpload] = useState(false);
    const [shown, setshown] = useState(isSimulation ? true : false);

    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID

    const [loader, setloader] = useState(true);
    const dispatch = useDispatch();

    const rmDataList = useSelector((state) => state.material.rmDataList);
    const filteredRMData = useSelector((state) => state.material.filteredRMData);
    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({ mode: 'onChange', reValidateMode: 'onChange', })
    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [showPopupBulk, setShowPopupBulk] = useState(false)


    /**
    * @method FIRST RNDER COMPONENT
    * @description Called after rendering the component
    */


    const callFilterApi = () => {
        if (isSimulation || shown) {
            dispatch(getRawMaterialNameChild(() => { }))
            dispatch(getGradeSelectList(() => { }))
            dispatch(getVendorListByVendorType(false, () => { }))
            dispatch(getRawMaterialFilterSelectList(() => { }))
            dispatch(getTechnologySelectList(() => { }))
            dispatch(getPlantSelectListByType(ZBC, () => { }))
        }
        getDataList()
    }

    useEffect(() => {
        callFilterApi()
    }, [shown])


    useEffect(() => {

        if (isSimulation) {

            setvalue({ min: 0, max: 0 });
        }
        getDataList()
    }, [])


    const getFilterRMData = () => {
        if (isSimulation) {
            return getFilteredRMData(rmDataList)
        } else {
            return rmDataList
        }
    }



    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0) => {
        const { isSimulation } = props

        const filterData = {
            costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
            plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
            material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
            grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
            vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
            technologyId: isSimulation ? props.technology : technologyId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
            departmentCode: isSimulation ? userDepartmetList() : "",
            statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
        }
        //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
        if (!props.isMasterSummaryDrawer) {
            dispatch(getRMDomesticDataList(filterData, (res) => {
                if (res && res.status === 200) {
                    let Data = res.data.DataList;
                    let DynamicData = res.data.DynamicData;
                    setmaxRange(DynamicData.MaxRange);
                    setloader(false);

                } else if (res && res.response && res.response.status === 412) {
                    setmaxRange(0);
                    setloader(false);

                } else {
                    setmaxRange(0);
                    setloader(false);
                }
            }))
        }
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    const editItemDetails = (Id, rowData = {}) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
        }
        props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    const deleteItem = (Id) => {
        setShowPopup(true)
        setDeletedId(Id)
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        dispatch(deleteRawMaterialAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                Toaster.warning(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                getDataList()
            }
        }));
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
        let isEditbale = false


        if (CheckApprovalApplicableMaster(RM_MASTER_ID)) {
            if (EditAccessibility && !rowData.IsRMAssociated) {
                isEditbale = true
            } else {
                isEditbale = false
            }
        } else {
            isEditbale = EditAccessibility
        }
        return (
            <>
                {isEditbale && <button className="Edit mr-2 align-middle" type={'button'} onClick={() => editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete align-middle" type={'button'} onClick={() => deleteItem(cellValue)} />}
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
        const { initialConfiguration } = props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '';
    }

    const companyFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (cellValue !== null && cellValue !== '-') ? `${cellValue}(${rowData.DepartmentCode !== null ? rowData.DepartmentCode : '-'})` : '-'
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
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

    /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }


    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }



    const formToggle = () => {
        props.formToggle()
    }

    const bulkToggle = () => {
        setisBulkUpload(true);
    }

    const closeBulkUploadDrawer = () => {
        setisBulkUpload(false);
        getDataList(null, null, null)


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

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    const onSubmit = (values) => { }

    const onGridReady = (params) => {
        setgridApi(params.api);

        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={'RmDomestic'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }



    const onBtExport = () => {
        let tempArr = []
        if (isSimulation === true) {
            const data = gridApi && gridApi.getModel().rowsToDisplay
            data && data.map((item => {
                tempArr.push(item.data)
            }))
        } else {
            tempArr = getFilterRMData()
        }

        return returnExcelColumn(RMDOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState(null);
        gridOptions.api.setFilterModel(null);
    }

    /**
    * @method render
    * @description Renders the component
    */


    const isFirstColumn = (params) => {
        if (isSimulation) {

            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;

            return thisIsFirstColumn;
        } else {
            return false
        }
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        // if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        if (isSimulation) {
            let length = gridApi.getSelectedRows().length
            dispatch(setSelectedRowCountForSimulationMessage(length))

            apply(selectedRows)

        }
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadRenderer: costingHeadFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        costFormatter: costFormatter,
        freightCostFormatter: freightCostFormatter,
        shearingCostFormatter: shearingCostFormatter,
        statusFormatter: statusFormatter,
        hyphenFormatter: hyphenFormatter,
        companyFormatter: companyFormatter,
        statusFormatter: statusFormatter,
    }


    return (
        <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>

            < form onSubmit={handleSubmit(onSubmit)} noValidate >
                <Row className="filter-row-large pt-4 ">

                    {
                        // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                        (!isSimulation && !props.isMasterSummaryDrawer) &&
                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    <>
                                        {/* {shown ? (
                                            <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => { setshown(!shown) }}>
                                                <div className="cancel-icon-white"></div>
                                            </button>
                                        ) : (
                                            <button title="Filter" type="button" className="user-btn mr5" onClick={() => { setshown(!shown) }}>
                                                <div className="filter mr-0"></div>
                                            </button>
                                        )} */}
                                        {AddAccessibility && (
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

                                                <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                                                    <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                        {/* DOWNLOAD */}
                                                    </button>}>

                                                    {onBtExport()}
                                                </ExcelFile>


                                            </>


                                        }
                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </>
                                </div>
                            </div>
                        </Col>
                    }
                </Row>
            </form >
            <Row>
                <Col>
                    {(loader && !props.isMasterSummaryDrawer) && <LoaderCustom />}
                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                        >
                            <AgGridReact
                                style={{ height: '100%', width: '100%' }}
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={getFilterRMData()}
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
                                onSelectionChanged={onRowSelect}
                            >
                                <AgGridColumn field="CostingHead" headerName="Head"></AgGridColumn>

                                <AgGridColumn field="TechnologyName" headerName="Technology"></AgGridColumn>

                                <AgGridColumn field="RawMaterial" headerName="Raw Material"></AgGridColumn>

                                <AgGridColumn field="RMGrade" headerName="RM Grade"></AgGridColumn>

                                <AgGridColumn field="RMSpec" headerName="RM Specs"></AgGridColumn>

                                <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>

                                <AgGridColumn field="Category" headerName="Category"></AgGridColumn>

                                <AgGridColumn field="MaterialType" headerName="Material"></AgGridColumn>

                                <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>

                                <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>

                                <AgGridColumn field="DepartmentName" headerName="Company" cellRenderer='companyFormatter'></AgGridColumn>

                                <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>

                                <AgGridColumn field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>

                                <AgGridColumn field="ScrapRate" headerName="Scrap Rate(INR)" ></AgGridColumn>

                                <AgGridColumn field="RMFreightCost" headerName="RM Freight Cost(INR)" cellRenderer='freightCostFormatter'></AgGridColumn>

                                <AgGridColumn field="RMShearingCost" headerName="Shearing Cost(INR)" cellRenderer='shearingCostFormatter'></AgGridColumn>

                                <AgGridColumn field="NetLandedCost" headerName="Net Cost(INR)" cellRenderer='costFormatter'></AgGridColumn>

                                <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>

                                {CheckApprovalApplicableMaster(RM_MASTER_ID) && <AgGridColumn field="DisplayStatus" headerName="Status" cellRenderer='statusFormatter'></AgGridColumn>}

                                {!isSimulation && <AgGridColumn width={120} field="RawMaterialId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer'></AgGridColumn>}

                                <AgGridColumn field="VendorId" hide={true}></AgGridColumn>

                                <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>

                            </AgGridReact>
                            <div className="paging-container d-inline-block float-right">
                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                    <option value="10" selected={true}>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
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
                    />
                )
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



export default RMDomesticListing;

