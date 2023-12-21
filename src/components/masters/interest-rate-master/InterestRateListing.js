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
import { checkPermission, searchNocontentFilter } from '../../../helper/util';
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
import { hideCustomerFromExcel } from '../../common/CommonFunctions';
import { agGridStatus, isResetClick } from '../../../actions/Common';

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
    data: { isEditFlag: false, ID: '' },
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
    dataCount: 0
  })
  const [gridApi, setGridApi] = useState(null);
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { interestRateDataList } = useSelector((state) => state.interestRate);
  const statusColumnData = useSelector((state) => state);
  console.log(gridApi);
  const floatingFilterIcc = {
    maxValue: 3,
    suppressFilterButton: true,
    component: "InterestRate"
  }


  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    getTableListData();

  }, []);

 

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



  const getTableListData = (vendor = '', icc_applicability = '', payment_term_applicability = '') => {
    let filterData = {
      vendor: vendor,
      icc_applicability: icc_applicability,
      payment_term_applicability: payment_term_applicability,
      IsCustomerDataShow: reactLocalStorage.getObject('cbcCostingPermission')
    }
    dispatch(getInterestRateDataList(true, filterData, res => {
      if (res.status === 204 && res.data === '') {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false }, () => { setState((prevState) => ({ ...prevState, isLoader: false })) }))
      } else {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      }
    }));
  }


  /**
  * @method viewOrEditItemDetails
  * @description confirm edit oor view item
  */
  const viewOrEditItemDetails = (Id, isViewMode) => {
    setState((prevState) => ({
      ...prevState,
      data: { isEditFlag: true, ID: Id, isViewMode: isViewMode },
      toggleForm: true,
    }))
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
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
  }


  const buttonFormatter = (props) => {

    const cellValue = props?.value;

    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = state;
    return (
      <>
        {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, true)} />}
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, false)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
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
    setState((prevState) => ({ ...prevState, toggleForm: true }))
  }

  const hideForm = (type) => {
    setState((prevState) => ({
      ...prevState,
      toggleForm: false,
      data: { isEditFlag: false, ID: '' }
    }, () => {
      if (type === 'submit')
        getTableListData()
    }
    ))
  }

  const bulkToggle = () => {
    setState((prevState) => ({ ...prevState, isBulkUpload: true }))
  }

  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, isBulkUpload: false }))
    if (type !== 'cancel') {
      getTableListData()
    }
  }




  const onGridReady = (params) => {
    setGridApi(params.api)
    state.gridColumnApi =params.columnApi
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }));
    params.api.paginationGoToPage(0);

  };

  const onPageSizeChanged = (newPageSize) => {
    console.log(newPageSize);
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = gridApi?.getSelectedRows()
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
  }

  const onBtExport = () => {
    let tempArr = []
    tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (interestRateDataList ? interestRateDataList : [])
    return returnExcelColumn(INTERESTRATE_DOWNLOAD_EXCEl, tempArr)
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
      else if (item.VendorName === '-') {
        item.VendorName = ' '
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
    gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    dispatch(agGridStatus("", ""))
    dispatch(isResetClick(true, "ICCApplicability"))
    if (window.screen.width >= 1600) {
      gridApi.sizeColumnsToFit();
    }
  }


  const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData, dataCount } = state;
  const ExcelFile = ReactExport.ExcelFile;

  if (toggleForm) {
    return (
      <AddInterestRate
        hideForm={hideForm}
        data={data}
      />
    )
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
          <form
            // onSubmit={handleSubmit(onSubmit.bind(this))}
            noValidate
          >
            {state.isLoader && <LoaderCustom customClass="loader-center" />}
            <Row className="filter-row-large blue-before">

              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    {state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setState((prevState) => ({ ...prevState, shown: !state.shown }))}>
                        <div className="cancel-icon-white"></div></button>
                    ) : (
                      ""
                    )}
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

                        <ExcelFile filename={'Interest Master'} fileExtension={'.xls'} element={
                          <button title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5'}><div className="download mr-1" ></div>
                            {/* DOWNLOAD */}
                            {`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                          </button>}>
                          {onBtExport()}
                        </ExcelFile>
                      </>

                    }
                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                      <div className="refresh mr-0"></div>
                    </button>

                  </div>
                </div>
              </Col>
            </Row>
          </form>


          <div className={`ag-grid-wrapper height-width-wrapper ${(interestRateDataList && interestRateDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className="ag-grid-header">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
            </div>
            <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
              {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout='autoHeight'
                // columnDefs={c}
                rowData={interestRateDataList}
                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                // loadingOverlayComponent={'customLoadingOverlay'}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: 'imagClass'
                }}
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
                <AgGridColumn field="VendorName" headerName="Vendor (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {reactLocalStorage.getObject('cbcCostingPermission') && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                <AgGridColumn field="ICCApplicability" headerName="ICC Applicability" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterIcc}></AgGridColumn>
                <AgGridColumn width={140} field="ICCPercent" headerName="Annual ICC (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={220} field="PaymentTermApplicability" headerName="Payment Term Applicability" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={210} field="RepaymentPeriod" headerName="Repayment Period (Days)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={245} field="PaymentTermPercent" headerName="Payment Term Interest Rate (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                <AgGridColumn width={150} field="VendorInterestRateId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
              </AgGridReact>
              {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
            </div>
          </div>

          {
            isBulkUpload && <BulkUpload
              isOpen={isBulkUpload}
              closeDrawer={closeBulkUploadDrawer}
              isEditFlag={false}
              fileName={'Interest Rate'}
              isZBCVBCTemplate={true}
              messageLabel={'Interest Rate'}
              anchor={'right'}
            />
          }
          {
            state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.INTEREST_DELETE_ALERT}`} />
          }
        </div>
      </div >
    </ >
  );
}


export default InterestRateListing