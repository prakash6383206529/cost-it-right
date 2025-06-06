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
import { checkPermission, getLocalizedCostingHeadValue, searchNocontentFilter, setLoremIpsum } from '../../../helper/util';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { INTERESTRATE_DOWNLOAD_EXCEl, PAYMENTTERMS_DOWNLOAD_EXCEl } from '../../../config/masterData';
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
import { TourStartAction, agGridStatus, isResetClick, setResetCostingHead, disabledClass, getGridHeight } from '../../../actions/Common';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels, useWithLocalization } from '../../../helper/core';
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import WarningMessage from '../../common/WarningMessage';
import { setCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize, skipUpdate, resetStatePagination, updateCurrentRowIndex } from '../../common/Pagination/paginationAction';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const PaymentTermsListing = (props) => {
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
    showExtraData: false,
    totalRecordCount: 0,
    globalTake: defaultPageSize
  })
  const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel, technologyLabel } = useLabels()
  const [gridApi, setGridApi] = useState(null);
  const { statusColumnData } = useSelector((state) => state.comman);
  const { costingHeadFilter } = useSelector((state) => state?.comman);
  const { globalTakes } = useSelector((state) => state.pagination);
  const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", VendorName: "", EffectiveDateNew: "", RawMaterialName: "", RawMaterialGrade: "", PartFamily: "", PaymentTermApplicability: "", ICCModelType: "" })
  const [filterModel, setFilterModel] = useState({});
  const [warningMessage, setWarningMessage] = useState(false);
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  const [pageRecord, setPageRecord] = useState(0);
  const [disableFilter, setDisableFilter] = useState(true)
  const [disableDownload, setDisableDownload] = useState(false);

  const { t } = useTranslation("common")
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { interestRateDataList } = useSelector((state) => state.interestRate);
  const floatingFilterIcc = { maxValue: 3, suppressFilterButton: true, component: "InterestRate" }
  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    setState((prevState) => ({ ...prevState, isLoader: true }))
    dispatch(agGridStatus("", ""))
    setSelectedRowForPagination([])
    dispatch(resetStatePagination());
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
          getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
      }
    }, 500);
    return () => {
      dispatch(setResetCostingHead(true, "costingHead"))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (statusColumnData) {
      state.gridApi?.setQuickFilter(statusColumnData.data);
    }
    if (costingHeadFilter && costingHeadFilter?.data) {
      const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
      if (matchedOption) {
        state.gridApi?.setQuickFilter(matchedOption?.label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusColumnData, costingHeadFilter]);

  useEffect(() => {
    if (statusColumnData?.id) {
        setDisableFilter(false)
        setWarningMessage(true)
    }
  }, [statusColumnData])

  useEffect(() => {
    if (interestRateDataList?.length > 0) {
        setState((prevState) => ({ ...prevState, totalRecordCount: interestRateDataList[0]?.TotalRecordCount }))
    }
    else {
        setState((prevState) => ({ ...prevState, noData: false }));
    }
    dispatch(getGridHeight({ value: interestRateDataList?.length, component: 'paymentTerms' }))
  }, [interestRateDataList])

  useEffect(() => {
    if (topAndLeftMenuData) {
      applyPermission(topAndLeftMenuData);
      setTimeout(() => {
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

  const getDataList = (costingHead = null, vendorName = null, iccApplicability = null, modelType = null, skip = 0, take = 10, isPagination = true, dataObj) => {
    setPageRecord(skip);
    const filterData = {
      costing_head: costingHead,
      vendor_id: vendorName,
      model_type_id: modelType,
    }
    const cleanedDataObj = {
      ...dataObj,
      // OverheadApplicabilityType: dataObj?.OverheadApplicabilityType
      //     ? decodeURIComponent(dataObj?.OverheadApplicabilityType)
      //     : ''
    };
    if (isPagination === true) {
        setState((prevState) => ({ 
          ...prevState, 
          isLoader: true
        }));
    }

    dispatch(getInterestRateDataList(filterData, skip, take, isPagination, cleanedDataObj, true, (res) =>{
      setState((prevState) => ({ 
          ...prevState, 
          isLoader: false
        }));
      if (res && res.status === 204) {
        setState((prevState) => ({ ...prevState, totalRecordCount: 0 }))
        dispatch(updatePageNumber(0))
      }

      if (res && isPagination === false) {
          setDisableDownload(false)
          dispatch(disabledClass(false))
          setTimeout(() => {
              let button = document.getElementById('Excel-Downloads-interestRateListing');
              button && button.click()
          }, 500);
      }

      if (res) {
        let isReset = true
        setTimeout(() => {
            for (var prop in floatingFilterData) {
                if (prop !== "DepartmentName" && floatingFilterData[prop] !== "") {
                    isReset = false
                }
            }
            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
        }, 300);

        setTimeout(() => {
            setWarningMessage(false)
            if (take == 100) {
                setTimeout(() => {
                    setWarningMessage(false)
                }, 100);
            }
            dispatch(isResetClick(false, "applicablity"))
            dispatch(setResetCostingHead(false, "costingHead"))
        }, 330);

        setTimeout(() => {
            setIsFilterButtonClicked(false)
        }, 600);
      }
    }))
  };

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
  // const viewOrEditItemDetails = (Id, isViewMode, IsAssociatedData) => {
  //   setState((prevState) => ({ ...prevState, data: { isEditFlag: true, ID: Id, isViewMode: isViewMode, IsAssociatedData: IsAssociatedData }, toggleForm: true, }))
  // }

  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
      let data = {
          isEditFlag: true,
          Id: Id,
          IsVendor: rowData.CostingHead,
          isViewMode: isViewMode,
          costingTypeId: rowData.CostingTypeId,
      }
      props.getDetails(data, rowData?.IsAssociated);
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
        // getTableListData()
        getDataList(null, null, null, null, pageRecord, globalTakes, true, floatingFilterData);
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
    // const cellValue = props?.value;

    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = state;
    return (
      <>
        {ViewAccessibility && <Button id={`interesetRateListing_view${props.rowIndex}`} className={"View mr-2 Tour_List_View"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} title={"View"} />}
        {EditAccessibility && props?.data?.IsEditable && <Button id={`interesetRateListing_edit${props.rowIndex}`} className={"Edit mr-2 Tour_List_Edit"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} title={"Edit"} />}
        {/* DeleteAccessibility && */ !rowData?.IsAssociated && <Button id={`interesetRateListing_delete${props.rowIndex}`} className={"Delete Tour_List_Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
      </>
    )
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
  // const onFloatingFilterChanged = (value) => {
  //   setTimeout(() => {
  //     interestRateDataList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), totalRecordCount: state?.gridApi?.getDisplayedRowCount() }))
  //   }, 500);
  // }

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (interestRateDataList.length !== 0) {
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), totalRecordCount: state?.gridApi?.getDisplayedRowCount() }))
      }
    }, 500);
    setDisableFilter(false)
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model);
    if (!isFilterButtonClicked) {
      setWarningMessage(true);
    }
    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
      let isFilterEmpty = true;
      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
            isFilterEmpty = false
            for (var property in floatingFilterData) {
                if (property === value.column.colId) {
                    floatingFilterData[property] = ""
                }
            }
            setFloatingFilterData(floatingFilterData)
        }
        if (isFilterEmpty) {
          setWarningMessage(false)
          for (var prop in floatingFilterData) {
              floatingFilterData[prop] = ""
          }
          setFloatingFilterData(floatingFilterData)
        }
      }
    } else {
      let valueString = value?.filterInstance?.appliedModel?.filter
      if (valueString.includes("+")) {
          valueString = encodeURIComponent(valueString)
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: valueString })
    }
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
        props?.formToggle()
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
      // getTableListData()
      resetState();
    }
  }

  const onGridReady = (params) => {
      setGridApi(params.api)
      state.gridColumnApi = params.columnApi
      setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }));
      params.api.paginationGoToPage(0);
      // params.api.sizeColumnsToFit();
  };

  const onSearch = () => {
    setState((prevState) => ({ ...prevState, noData: false }));
    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    dispatch(updatePageNumber(1))
    dispatch(updateCurrentRowIndex(0))
    gridOptions?.columnApi?.resetColumnState();
    getDataList(null, null, null, null, 0, globalTakes, true, floatingFilterData)
  }

  const onRowSelect = () => {
    const selectedRows = gridApi?.getSelectedRows()
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
  }
  const PAYMENTTERMS_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(PAYMENTTERMS_DOWNLOAD_EXCEl, "MasterLabels")
  
  const onBtExport = () => {
    let tempArr = []
    tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (interestRateDataList ? interestRateDataList : [])
    return returnExcelColumn(PAYMENTTERMS_DOWNLOAD_EXCEl_LOCALIZATION, tempArr)
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
    setState((prevState) => ({ ...prevState, noData: false }));
    dispatch(agGridStatus("", ""))
    dispatch(isResetClick(true, "applicablity"))
    dispatch(setResetCostingHead(true, "costingHead"))
    setIsFilterButtonClicked(false)
    gridApi.deselectAll()
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    for (var prop in floatingFilterData) {
        floatingFilterData[prop] = ""
    }
    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
    dispatch(setSelectedRowForPagination([]))
    dispatch(resetStatePagination())
    setState((prevState) => ({ ...prevState, dataCount: 0 }))
  }

  const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData, dataCount } = state;
  const ExcelFile = ReactExport.ExcelFile;

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
  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    hyphenFormatter: hyphenFormatter,
    valuesFloatingFilter: SingleDropdownFloationFilter,
    statusFilter: CostingHeadDropdownFilter,
  };


  return (
    <>
      <div className={`ag-grid-react grid-parent-wrapper p-relative ${DownloadAccessibility ? "show-table-btn" : ""}`} id='go-to-top'>
        <div className="container-fluid">
          <ScrollToTop pointProp='go-to-top' />
          <form noValidate  >
            {state.isLoader && <LoaderCustom customClass="loader-center" />}
            <Row className="filter-row-large blue-before pt-4">

              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div className="warning-message d-flex align-items-center">
                      {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                      <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5 Tour_List_Filter" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                  </div>
                  <div>
                    {AddAccessibility && (<Button id="interestRateListing_add" className={"user-btn mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />)}
                    {BulkUploadAccessibility && (<Button id="paymentTermsListing_bulkUpload" className={"user-btn mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}
                    {DownloadAccessibility &&
                      <>
                        <ExcelFile filename={'Interest Master'} fileExtension={'.xls'} element={
                          <Button id={"Excel-Downloads-paymentTermsListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" disabled={state?.totalRecordCount === 0} className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />}>
                          {state?.totalRecordCount !== 0 ? onBtExport() : null}
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
                // pagination={true}
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
                <AgGridColumn minWidth={180} field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'} floatingFilterComponentParams={floatingFilterStatus}
                  floatingFilterComponent="statusFilter"></AgGridColumn>
                <AgGridColumn field="Technologies" tooltipField='Technologies' filter={true} floatingFilter={true} headerName={technologyLabel}></AgGridColumn>
                {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialName" headerName='Raw Material Name'></AgGridColumn>}
                {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialGrade" headerName="Raw Material Grade"></AgGridColumn>}
                {(getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate || getConfigurationKey().IsDestinationPlantConfigure) && <AgGridColumn field="PlantName" headerName="Plant (Code)"></AgGridColumn>}
                <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                {getConfigurationKey()?.PartAdditionalMasterFields?.IsShowPartFamily && <AgGridColumn field="PartFamily" headerName="Part Family (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                {/* <AgGridColumn field="ICCModelType" headerName="Model Type" cellRenderer={'hyphenFormatter'}></AgGridColumn> */}
                {/* <AgGridColumn field="ICCMethod" headerName="ICC Method" cellRenderer={'hyphenFormatter'}></AgGridColumn> */}
                <AgGridColumn width={220} field="PaymentTermApplicability" headerName="Payment Term Applicability" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={210} field="RepaymentPeriod" headerName="Repayment Period (Days)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={245} field="PaymentTermPercent" headerName="Payment Term Interest Rate (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                <AgGridColumn width={150} field="VendorInterestRateId" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
              </AgGridReact>}
              {/* {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />} */}
              <div className='button-wrapper'>
                  {<PaginationWrappers gridApi={gridApi} totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="interestRate" />}
                  {<PaginationControls totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="interestRate" />
                  }
              </div>
            </div>
          </div>

          {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={'Payment Terms'} isZBCVBCTemplate={true} messageLabel={'Payment Terms'} anchor={'right'} />}
          {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.INTEREST_DELETE_ALERT}`} />}
        </div >
      </div >
    </ >
  );
}


export default PaymentTermsListing