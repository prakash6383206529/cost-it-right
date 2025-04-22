import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA, ZBCTypeId } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getLabourDataList, deleteLabour } from '../actions/Labour';
import AddLabour from './AddLabour';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, LABOUR, LabourMaster } from '../../../config/constants';
import { checkPermission, getLocalizedCostingHeadValue, searchNocontentFilter } from '../../../helper/util';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import { LABOUR_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'
import ScrollToTop from '../../common/ScrollToTop';
import { PaginationWrapper } from '../../common/commonPagination';
import { getConfigurationKey, loggedInUserId } from '../../../helper';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission } from '../../common/CommonFunctions';
import Button from '../../layout/Button';
import { useLabels } from '../../../helper/core';
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function LabourListing(props) {
  const { vendorLabel } = useLabels()
  const [state, setState] = useState({
    tableData: [],
    shown: false,
    EmploymentTerms: [],
    vendorName: [],
    stateName: [],

    data: { isEditFlag: false, ID: '' },
    toggleForm: false,
    isBulkUpload: false,

    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    isLoader: false,
    showPopup: false,
    deletedId: '',
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    effectiveDate: '',
    selectedVendor: [],
    selectedCustomer: [],
    costingTypeId: ZBCTypeId,
    totalRecordCount: 0,
    globalTake: defaultPageSize
  });
  const dispatch = useDispatch();
  const { labourDataList, topAndLeftMenuData } = useSelector(state => ({ labourDataList: state.labour.labourDataList, topAndLeftMenuData: state.auth.topAndLeftMenuData, }));
  useEffect(() => {
    if (!topAndLeftMenuData) {
      setState(prevState => ({ ...prevState, isLoader: true }));
      return;
    }
    if (topAndLeftMenuData !== undefined) {
      applyPermission(topAndLeftMenuData)
      setState((prevState) => ({ ...prevState, isLoader: true }))
    } setTimeout(() => { filterList() }, 500);
  }, [topAndLeftMenuData])
  const {  vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();


  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === LABOUR)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        setState((prevState) => ({
          ...prevState,
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        })
        )
      }
    }
  }




  const getTableListData = (employment_terms = '', state = 0, plant = '', labour_type = 0, machine_type = 0, effectiveDate = '', vendorId = '', customerId = '', costingHeadId = '', selectedPart = '') => {
    let filterData = {
      employment_terms: employment_terms,
      state: state,
      plant: plant,
      labour_type: labour_type,
      machine_type: machine_type,
      isCustomerDataShow: reactLocalStorage.getObject('CostingTypePermission').cbc,
      isVendorDataShow: reactLocalStorage.getObject('CostingTypePermission').vbc,
      isZeroDataShow: reactLocalStorage.getObject('CostingTypePermission').zbc,
      effectiveDate: /* DayTime(effectiveDate).isValid() ? DayTime(effectiveDate).format('YYYY-MM-DD') :  */'',
      vendorId: "",
      customerId: "",
      costingHeadId: null,
      partId: "",
      isRequestForCosting: null,
      baseCostingId: null,
    }
    dispatch(getLabourDataList(true, filterData, (res) => {
      setState((prevState) => ({ ...prevState, isLoader: false }))
      if (res.status === 204 && res.data === '') {
        setState((prevState) => ({ ...prevState, tableData: [] }))
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        setState((prevState) => ({ ...prevState, tableData: Data, totalRecordCount: Data?.length }))
      } else {
      }
    }))
  }


  const viewOrEditItemDetails = (Id, isViewMode) => {
    setState((prevState) => ({ ...prevState, data: { isEditFlag: true, ID: Id, isViewMode: isViewMode }, toggleForm: true, }))
  }


  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }


  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteLabour(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_LABOUR_SUCCESS)
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
        getTableListData();
      }

    }))
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  const buttonFormatter = (props) => {
    const labourDetailsId = props.data.LabourDetailsId;
    const cellValue = props?.value;


    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = state;

    return (
      <>
        {ViewAccessibility && (<Button id={`labourListing_View${props.rowIndex}`} className={"View mr-2"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, true)} title={"View"} />)}
        {(EditAccessibility && props?.data?.IsEditable) && (<Button id={`labourListing_edit${props.rowIndex}`} className={"Edit mr-2"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, false)} title={"Edit"} />)}
        {(DeleteAccessibility && !(props?.data?.IsLabourAssociated)) && (<Button id={`labourListing_delete${props.rowIndex}`} className={"Delete"} variant="Delete" onClick={() => deleteItem(labourDetailsId)} title={"Delete"} />
        )}
      </>
    );

  };


  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue === 'Contractual' ? 'Contractual' : 'Employed'
  }

  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }

  const customerFormatter = (props) => {
    const cellValue = props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== "NA") ? `${cellValue}` : '-';
  }


  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
  }


  const filterList = () => {
    const { EmploymentTerms, StateName, plant, labourType, machineType, } = state
    const ETerms = EmploymentTerms ? EmploymentTerms.value : ''
    const State = StateName ? StateName.value : 0
    const Plant = plant ? plant.value : ''
    const labour = labourType ? labourType.value : 0
    const machine = machineType ? machineType.value : 0
    getTableListData(ETerms, State, Plant, labour, machine)
    setTimeout(() => {
      setState(prevState => ({ ...prevState, isLoader: false }));
    }, 400);
  }

  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      setState((prevState) => ({ ...prevState, toggleForm: true }))
    }
  }

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      labourDataList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), totalRecordCount: state?.gridApi?.getDisplayedRowCount() }))
    }, 500);
  }

  const hideForm = (type) => {
    setState((prevState) => ({ ...prevState, toggleForm: false, data: { isEditFlag: false, ID: '' }, }))

    if (type === 'submit') {
      filterList();
    }



  }


  const bulkToggle = () => {
    if (checkMasterCreateByCostingPermission(true)) {
      setState((prevState) => ({ ...prevState, isBulkUpload: true }))
    }
  }


  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, isBulkUpload: false }))
    if (type !== 'cancel') {
      getTableListData('', 0, '', 0, 0)
    }
  }


  const onGridReady = (params) => {
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
    setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
  };

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows()
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))

  }

  const onBtExport = () => {
    let tempArr = []
    tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (labourDataList ? labourDataList : [])
    const filteredLabels = LABOUR_DOWNLOAD_EXCEl.filter(column => {
      if (column.value === "ExchangeRateSourceName") {
        return getConfigurationKey().IsSourceExchangeRateNameVisible
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr)
  };
  const handleShown = () => {
    setState((prevState) => ({ ...prevState, shown: !state.shown }))
  }
  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.Specification === null) {
        item.Specification = ' '
      } else if (item.IsContractBase === true) {
        item.IsContractBase = 'Contractual'
      } else if (item.IsContractBase === false) {
        item.IsContractBase = 'Employed'
      } else if (item.Vendor === '-') {
        item.Vendor = ' '
      } else if (item.Plant === '-') {
        item.Plant = ' '
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={LabourMaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  }

  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    setState((prevState) => ({ ...prevState, isLoader: true, dataCount: 0, globalTake: defaultPageSize }));
    filterList()
  }

  const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData, } = state
  const ExcelFile = ReactExport.ExcelFile;

  if (toggleForm) {
    return <AddLabour hideForm={hideForm} data={data} />
  }
  const isFirstColumn = (params) => {

    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;

  }
  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn
  };
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
        setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, CostingHead: value } }));
        setState((prevState) => ({ ...prevState, disableFilter: false, warningMessage: true }));
    }
};
const combinedCostingHeadRenderer = (props) => {
  // Call the existing checkBoxRenderer
  costingHeadFormatter(props);

  // Get and localize the cell value
  const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
  const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

  // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
  return localizedValue;
};
  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    costingHeadFormatter: costingHeadFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    hyphenFormatter: hyphenFormatter,
    commonCostFormatter: commonCostFormatter,
    customerFormatter: customerFormatter,
    statusFilter: CostingHeadDropdownFilter,
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    
  };

  return (
    <>
      <div className={`ag-grid-react container-fluid ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
        {state.isLoader && <LoaderCustom customClass="loader-center" />}
        <ScrollToTop pointProp="go-to-top" />
        <form noValidate>
          <Row className=" filter-row-large blue-before">

            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  {state.shown ? (
                    <button type="button" className="user-btn mr5 filter-btn-top " onClick={() => setState((prevState) => ({ ...prevState, shown: !state.shown }))}>
                      <div className="cancel-icon-white"></div></button>
                    // <Button type="button" className="user-btn mr5 filter-btn-top" onClick={handleShown()} icon="cancel-icon-white"/>

                  ) : (
                    ""
                  )}
                  {AddAccessibility && (
                    <Button id="labourListing_add" className={"mr5"} onClick={formToggle} title={"Add"} icon={"plus"} />
                  )}
                  {BulkUploadAccessibility && (

                    <Button id="labourListing_bulkUpload" className={"mr5"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />
                  )}
                  {
                    DownloadAccessibility &&
                    <>

                      <ExcelFile filename={'Labour'} fileExtension={'.xls'} element={
                        <Button id={"Excel-Downloads-labourListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" disabled={state?.totalRecordCount === 0} className={'user-btn mr5'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                      }>
                        {state?.totalRecordCount !== 0 ? onBtExport() : null}
                      </ExcelFile>
                    </>
                  }
                  <Button id={"labourListing_refresh"} className="user-btn" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

                </div>
              </div>
            </Col>
          </Row>
        </form>

        <div className={`ag-grid-wrapper grid-parent-wrapper height-width-wrapper ${(labourDataList && labourDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
          </div>
          <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
            {!state.isLoader && <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              rowData={labourDataList}
              pagination={true}
              paginationPageSize={defaultPageSize}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              noRowsOverlayComponent={'customNoRowsOverlay'}
              onFilterModified={onFloatingFilterChanged}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: 'imagClass'
              }}
              rowSelection={'multiple'}
              onSelectionChanged={onRowSelect}
              frameworkComponents={frameworkComponents}
              suppressRowClickSelection={true}
            >
              <AgGridColumn field="IsContractBase" headerName="Employment Terms" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
              <AgGridColumn field="CostingHead" minWidth={170} headerName="Costing Head" floatingFilterComponentParams={floatingFilterStatus}
                                            floatingFilterComponent="statusFilter"
                                            cellRenderer={"combinedCostingHeadRenderer"}></AgGridColumn>
              <AgGridColumn field="Vendor" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
              {reactLocalStorage.getObject('CostingTypePermission').cbc && < AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'customerFormatter'}></AgGridColumn>}
              <AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>
              <AgGridColumn field="Country" headerName="Country" cellRenderer={'customerFormatter'}></AgGridColumn>
              <AgGridColumn field="State" headerName="State"></AgGridColumn>
              <AgGridColumn field="City" headerName="City" cellRenderer={'customerFormatter'}></AgGridColumn>
              <AgGridColumn field="MachineType" headerName="Machine Type"></AgGridColumn>
              <AgGridColumn field="LabourType" headerName="Labour Type"></AgGridColumn>
              {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source" cellRenderer={'hyphenFormatter'}></AgGridColumn>}

              <AgGridColumn width={205} field="LabourRate" headerName="Rate per Person/Annum" cellRenderer={'commonCostFormatter'}></AgGridColumn>
              <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
              <AgGridColumn field="LabourId" width={150} cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
            </AgGridReact>}
            {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />}
          </div>
        </div>

        {isBulkUpload && (
          <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={'Labour'} isZBCVBCTemplate={true} messageLabel={'Labour'} anchor={'right'} />
        )}
        {
          state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.LABOUR_DELETE_ALERT}`} />
        }
      </div >
    </>
  )
}


export default LabourListing
