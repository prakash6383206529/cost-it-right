import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getInterestRateDataList, deleteInterestRate } from '../actions/InterestRateMaster';
import DayTime from '../../common/DayTimeWrapper'
import AddInterestRate from './AddInterestRate';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, InterestMaster, INTEREST_RATE } from '../../../config/constants';
import { checkPermission, searchNocontentFilter, setLoremIpsum } from '../../../helper/util';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { INTERESTRATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'
import ScrollToTop from '../../common/ScrollToTop';
import { PaginationWrapper } from '../../common/commonPagination';
import { getConfigurationKey, loggedInUserId } from '../../../helper';
import { reactLocalStorage } from 'reactjs-localstorage';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel } from '../../common/CommonFunctions';
import { TourStartAction, agGridStatus, isResetClick } from '../../../actions/Common';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels, useWithLocalization } from '../../../helper/core';
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const InterestRateListing = (props) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    tableData: [],
    vendorName: [],
    ICCApplicability: [],
    PaymentTermsApplicability: [],
    shown: false,
    data: { isEditFlag: false, ID: '', IsAssociatedData: false },
    toggleForm: false,
    isBulkUpload: false,
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    BulkUploadAccessibility: false,
    DownloadAccessibility: false,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ['columns'] },
    showData: false,
    isLoader: false,
    showPopup: false,
    deletedId: '',
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    showExtraData: false
  })
  const { vendorLabel } = useLabels()
  const [gridApi, setGridApi] = useState(null);
  const { statusColumnData } = useSelector((state) => state.comman);
  const { t } = useTranslation("common")
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { interestRateDataList } = useSelector((state) => state.interestRate);
  const floatingFilterIcc = { maxValue: 3, suppressFilterButton: true, component: "InterestRate" }
  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    setState((prevState) => ({ ...prevState, isLoader: true }))
    setTimeout(() => {
      getTableListData()
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);
  useEffect(() => {

    if (statusColumnData) {
      state.gridApi?.setQuickFilter(statusColumnData.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [statusColumnData])

  useEffect(() => {
    if (topAndLeftMenuData) {
      setState((prevState) => ({ ...prevState, isLoader: true }));
      applyPermission(topAndLeftMenuData);
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, isLoader: false }));
      }, 200);
    }
  }, [topAndLeftMenuData,]);


  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find(el => el.PageName === INTEREST_RATE)
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
        }))
      }

    }
  }

  /**
    * @method getTableListData
    * @description Get list data
    */
  const getTableListData = (vendor = '', icc_applicability = '', payment_term_applicability = '') => {
    const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
    let filterData = { vendor: vendor, icc_applicability: icc_applicability, payment_term_applicability: payment_term_applicability, IsCustomerDataShow: cbc, IsVendorDataShow: vbc, IsZeroDataShow: zbc }
    dispatch(getInterestRateDataList(true, filterData, res => {
      if (res.status === 204 && res.data === '') {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false }))
      } else {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      }
    }));
  }
  /**
       * @method toggleExtraData
       * @description Handle specific module tour state to display lorem data
       */
  const toggleExtraData = (showTour) => {
    dispatch(TourStartAction({
      showExtraData: showTour,
    }));
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
    }, 100);

  }
  /**
    * @method viewOrEditItemDetails
    * @description confirm edit oor view item
    */
  const viewOrEditItemDetails = (Id, isViewMode, IsAssociatedData) => {
    setState((prevState) => ({ ...prevState, data: { isEditFlag: true, ID: Id, isViewMode: isViewMode, IsAssociatedData: IsAssociatedData }, toggleForm: true, }))
  }


  /**
  * @method deleteItem
  * @description confirm delete Item.
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }

  /**
  * @method confirmDeleteItem
  * @description confirm delete item
  */
  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteInterestRate(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_INTEREST_RATE_SUCCESS);
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
        getTableListData()
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }
  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }
  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  const effectiveDateFormatter = (props) => {
    if (state?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
      return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }
  }

  const buttonFormatter = (props) => {
    const IsAssociatedData = props?.data?.IsAssociated
    const cellValue = props?.value;
    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = state;
    return (
      <>
        {ViewAccessibility && <Button id={`interesetRateListing_view${props.rowIndex}`} className={"View mr-2 Tour_List_View"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, true, IsAssociatedData)} title={"View"} />}
        {EditAccessibility && <Button id={`interesetRateListing_edit${props.rowIndex}`} className={"Edit mr-2 Tour_List_Edit"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, false, IsAssociatedData)} title={"Edit"} />}
        {/* DeleteAccessibility && */ !IsAssociatedData && <Button id={`interesetRateListing_delete${props.rowIndex}`} className={"Delete Tour_List_Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
      </>
    )
  };

  /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue;
  }

  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      interestRateDataList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }))
    }, 500);
  }

  /**
    * @method hyphenFormatter
    */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }
  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      setState((prevState) => ({ ...prevState, toggleForm: true }))
    }
  }

  const hideForm = (type) => {
    setState((prevState) => ({ ...prevState, toggleForm: false, data: { isEditFlag: false, ID: '' } })
    );
    if (type === 'submit') {
      getTableListData();
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
      getTableListData()
    }
  }




  const onGridReady = (params) => {
    setGridApi(params.api)
    state.gridColumnApi = params.columnApi
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }));
    params.api.paginationGoToPage(0);

  };

  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = gridApi?.getSelectedRows()
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
  }
  const INTERESTRATE_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(INTERESTRATE_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = []
    tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (interestRateDataList ? interestRateDataList : [])
    return returnExcelColumn(INTERESTRATE_DOWNLOAD_EXCEl_LOCALIZATION, tempArr)
  };

  const returnExcelColumn = (data = [], TempData) => {
    let excelData = hideCustomerFromExcel(data, "CustomerName")
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.ICCPercent === null) {
        item.ICCPercent = ' '
      } else if (item.PaymentTermPercent === null) {
        item.PaymentTermPercent = ' '
      }
      else if (item?.VendorName === '' || item?.VendorName === null) {
        item.VendorName = '-'
      }
      return item
    })
    const isShowRawMaterial = getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC
    const excelColumns = excelData && excelData.map((ele, index) => {
      if ((ele.label === 'Raw Material Name' || ele.label === 'Raw Material Grade') && !isShowRawMaterial) {
        return null // hide column
      } else {
        return <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
      }
    }).filter(Boolean) // remove null columns
    return <ExcelSheet data={temp} name={InterestMaster}>{excelColumns}</ExcelSheet>
  }

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }

  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    gridApi.setQuickFilter(null)
    gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    dispatch(agGridStatus("", ""))
    dispatch(isResetClick(true, "ICCApplicability"))

  }


  const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData, dataCount } = state;
  const ExcelFile = ReactExport.ExcelFile;

  if (toggleForm) {
    return (<AddInterestRate hideForm={hideForm} data={data} />)
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

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    costingHeadFormatter: costingHeadFormatter,
    hyphenFormatter: hyphenFormatter,
    valuesFloatingFilter: SingleDropdownFloationFilter,
  };


  return (
    <>
      <div className={`ag-grid-react report-grid p-relative ${DownloadAccessibility ? "show-table-btn" : ""}`} id='go-to-top'>
        <div className="container-fluid">
          <ScrollToTop pointProp='go-to-top' />
          <form noValidate  >
            {state.isLoader && <LoaderCustom customClass="loader-center" />}
            <Row className="filter-row-large blue-before">

              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    {AddAccessibility && (<Button id="interestRateListing_add" className={"user-btn mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />)}
                    {BulkUploadAccessibility && (<Button id="interestRateListing_bulkUpload" className={"user-btn mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}
                    {DownloadAccessibility &&
                      <>
                        <ExcelFile filename={'Interest Master'} fileExtension={'.xls'} element={
                          <Button id={"Excel-Downloads-interestRateListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />}>
                          {onBtExport()}
                        </ExcelFile>
                      </>

                    }
                    <Button id={"interestRateListing_refresh"} className={"Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                  </div>
                </div>
              </Col>
            </Row>
          </form>
          <div className={`ag-grid-wrapper height-width-wrapper ${(interestRateDataList && interestRateDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className="ag-grid-header">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
              <TourWrapper
                buttonSpecificProp={{ id: "Interest_Listing_Tour", onClick: toggleExtraData }}
                stepsSpecificProp={{
                  steps: Steps(t, { addLimit: false, filterButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, costMovementButton: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                }} />
            </div>
            <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
              {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
              {!state.isLoader && <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout='autoHeight'
                // columnDefs={c}
                rowData={state.showExtraData ? [...setLoremIpsum(interestRateDataList[0]), ...interestRateDataList] : interestRateDataList}

                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                // loadingOverlayComponent={'customLoadingOverlay'}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                rowSelection={'multiple'}
                onFilterModified={onFloatingFilterChanged}
                onSelectionChanged={onRowSelect}
                frameworkComponents={frameworkComponents}
                suppressRowClickSelection={true}
              >
                <AgGridColumn width={180} field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialName" headerName='Raw Material Name'></AgGridColumn>}
                {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialGrade" headerName="Raw Material Grade"></AgGridColumn>}
                {(getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate || getConfigurationKey().IsDestinationPlantConfigure) && <AgGridColumn field="PlantName" headerName="Plant (Code)"></AgGridColumn>}
                <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                <AgGridColumn field="ICCApplicability" headerName="ICC Applicability" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterIcc}></AgGridColumn>
                <AgGridColumn width={140} field="ICCPercent" headerName="Annual ICC (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={220} field="PaymentTermApplicability" headerName="Payment Term Applicability" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={210} field="RepaymentPeriod" headerName="Repayment Period (Days)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={245} field="PaymentTermPercent" headerName="Payment Term Interest Rate (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                <AgGridColumn width={150} field="VendorInterestRateId" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
              </AgGridReact>}
              {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
            </div>
          </div>

          {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={'Interest Rate'} isZBCVBCTemplate={true} messageLabel={'Interest Rate'} anchor={'right'} />}
          {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.INTEREST_DELETE_ALERT}`} />}
        </div >
      </div >
    </ >
  );
}


export default InterestRateListing