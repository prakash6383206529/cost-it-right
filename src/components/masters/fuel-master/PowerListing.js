import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { checkForDecimalAndNull } from "../../../helper/validation";
import { getPowerDetailDataList, getVendorPowerDetailDataList, deletePowerDetail, deleteVendorPowerDetail, } from "../actions/Fuel";
import { EMPTY_DATA, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import DayTime from "../../common/DayTimeWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { PowerMaster } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { POWERLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import { getConfigurationKey, loggedInUserId, searchNocontentFilter } from "../../../helper";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { PaginationWrapper } from "../../common/commonPagination";
import { reactLocalStorage } from "reactjs-localstorage";
import { ApplyPermission } from ".";
import { checkMasterCreateByCostingPermission } from '../../common/CommonFunctions';
import { useRef } from 'react';
import Button from "../../layout/Button";
import { useLabels, useWithLocalization } from "../../../helper/core";
import Switch from 'react-switch'

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const PowerListing = (props) => {
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    IsVendor: false,
    tableData: [],
    shown: false,
    StateName: [],
    plant: [],
    vendorName: [],
    vendorPlant: [],
    showPopup: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    isImport: false,
  });
  const dispatch = useDispatch();
  const permissions = useContext(ApplyPermission);
  const { powerDataList } = useSelector((state) => state.fuel);
  const { initialConfiguration } = useSelector((state) => state.auth);
  const { vendorLabel } = useLabels()
  useEffect(() => {
    if (permissions) {
      getDataList(null, null);
    }
  }, [permissions]);

  const getDataList = (isImport = false) => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    if (!state.IsVendor) {
      const filterData = { plantID: state.plant ? state.plant.value : "", stateID: state.StateName ? state.StateName.value : "", PowerEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC };
      dispatch(
        getPowerDetailDataList(filterData, (res) => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
          if (res && res.status === 200) {
            let Data = res.data.DataList;
            setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false, }));
          } else if (res && res.response && res.response.status === 412) {
            setState((prevState) => ({ ...prevState, tableData: [], isLoader: false, }));
          }
          else {
            setState((prevState) => ({ ...prevState, tableData: [], isLoader: false, }));
          }
        })
      );
    } else {
      const filterData = { vendorID: state.vendorName && state.vendorName !== undefined ? state.vendorName.value : "", plantID: state.vendorPlant && state.vendorPlant !== undefined ? state.vendorPlant.value : "", };
      dispatch(
        getVendorPowerDetailDataList(filterData, (res) => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
          if (res && res.status === 200) {
            let Data = res.data.DataList;
            setState((prevState) => ({ ...prevState, tableData: Data }));
          } else if (res && res.response && res.response.status === 412) {
            setState((prevState) => ({ ...prevState, tableData: [] }));
          } else {
            setState((prevState) => ({ ...prevState, tableData: [] }));
          }
        })
      );
    }
  };

  /**
   * @method viewOrEditItemDetails
   * @description edit or view material type
   */
  const viewOrEditItemDetails = (Id, isViewMode) => {
    let data = { isEditFlag: true, Id: state.IsVendor ? Id?.PowerDetailId : Id?.PowerId, IsVendor: state.IsVendor, isViewMode: isViewMode, plantId: Id?.PlantId, };
    props.getDetails(data);
  };

  /**
   * @method deleteItem
   * @description confirm delete Raw Material details
   */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };

  /**
   * @method confirmDelete
   * @description confirm delete Raw Material details
   */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId();
    if (state.IsVendor) {
      dispatch(deleteVendorPowerDetail(ID?.PowerDetailId, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          getDataList();
        }
      })
      );
      setState((prevState) => ({ ...prevState, showPopup: false }));
    } else {
      dispatch(deletePowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          getDataList();
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
        }
      })
      );
      setState((prevState) => ({ ...prevState, showPopup: false }));
    }
  };
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  };
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const buttonFormatter = (props) => {
    const rowData = props?.data;
    let obj = {};
    obj.PowerId = rowData?.PowerId;
    obj.PlantId = rowData?.PlantId;
    obj.PowerDetailId = rowData?.PowerDetailId;
    return (
      <>
        {permissions.View && (<Button id={`powerListing_view${props.rowIndex}`} className={"View mr-2"} variant="View" onClick={() => viewOrEditItemDetails(obj, true)} title={"View"} />)}
        {[permissions.Edit] && (<Button id={`powerListing_edit${props.rowIndex}`} className={"Edit mr-2"} variant="Edit" onClick={() => viewOrEditItemDetails(obj, false)} title={"Edit"} />)}
        {permissions.Delete && (<Button id={`powerListing_delete${props.rowIndex}`} className={"Delete"} variant="Delete" onClick={() => deleteItem(obj)} title={"Delete"} />)}
      </>
    );
  };

  /**
   * @method effectiveDateFormatter
   * @description Renders buttons
   */
  const effectiveDateFormatter = (props) => {
    let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (cellValue?.includes("T")) {
      cellValue = DayTime(cellValue).format("DD/MM/YYYY");
    }
    return !cellValue ? "-" : cellValue;
  };

  const costFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue != null ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : "";
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      powerDataList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), }));
    }, 500);
  };

  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      props.formToggle();
    }
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp = TempData && TempData.map((item) => {
      if (item.Plants === "-") {
        item.Plants = " ";
      }
      if (item.Vendor === "-") {
        item.Vendor = " ";
      } else if (item?.EffectiveDate?.includes("T")) {
        item.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
      }
      return item;
    });

    return (
      <ExcelSheet data={temp} name={`${PowerMaster}`}>
        {data && data.map((ele, index) => (<ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />))}
      </ExcelSheet>
    );
  };

  const onGridReady = (params) => {
    state.gridApi = params.api;
    window.screen.width >= 1600 && state.gridApi.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }));
    params.api.paginationGoToPage(0);
  };
  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };
  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length, }));
  };
  const POWERLISTING_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(POWERLISTING_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr = tempArr && tempArr.length > 0 ? tempArr : powerDataList ? powerDataList : [];
    const filteredLabels = POWERLISTING_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
      if (column.value === "ExchangeRateSourceName") {
        return getConfigurationKey().IsSourceExchangeRateNameVisible
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr);
  };

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  };

  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);



  };

  const ExcelFile = ReactExport.ExcelFile;
  var filterParams = {
    date: "", comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
      if (dateAsString == null) return -1;
      var dateParts = dateAsString.split("/");
      var cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },
    browserDatePicker: true,
    minValidYear: 2000,
  };
  const importToggle = () => {
    setState((prevState) => ({ ...prevState, isImport: !state.isImport }));
    getDataList(!state.isImport)
  }
  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };
  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn,
  };
  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    costFormatter: costFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
  };

  return (
    <div
      className={`ag-grid-react pt-4 ${permissions.Download ? "show-table-btn" : ""
        }`}
    >
      {state.isLoader && <LoaderCustom />}
      <form noValidate      >
        <Row>
          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                <>
                  {permissions.Add && (<Button id="powerListing_add" className={"user-btn mr5"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />
                  )}
                  {permissions.Download && (
                    <>
                      <ExcelFile filename={"Power"} fileExtension={".xls"} element={<Button id={"Excel-Downloads-powerListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />}                      >
                        {onBtExport()}
                      </ExcelFile>
                    </>
                  )}
                  <Button id={"powerListing_refresh"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

                </>
              </div >
            </div >
          </Col >
        </Row >
      </form >
      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${(powerDataList && powerDataList?.length <= 0) ||
              state.noData || state.tableData.length === 0 ? "overlay-contain" : ""}`}
          >
            {/* ZBC Listing */}
            <div className="ag-grid-header">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
            </div>
            <Row>
              <Col md="4" className="switch mb15">
                <label className="switch-level">
                  <div className="left-title">Domestic</div>
                  <Switch
                    onChange={importToggle}
                    checked={state.isImport}
                    id="normal-switch"
                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#4DC771"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className="right-title">Import</div>
                </label>
              </Col>
            </Row>
            <div
              className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}
            >
              {state.noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />
              )}
              {!state.IsVendor && (<AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                // columnDefs={c}
                rowData={powerDataList}
                pagination={true}
                paginationPageSize={10}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={"customNoRowsOverlay"}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: "imagClass power-listing",
                }}
                rowSelection={"multiple"}
                onFilterModified={onFloatingFilterChanged}
                onSelectionChanged={onRowSelect}
                frameworkComponents={frameworkComponents}
                suppressRowClickSelection={true}
              >
                <AgGridColumn field="CostingType"></AgGridColumn>
                <AgGridColumn field="CountryName"></AgGridColumn>
                <AgGridColumn field="StateName"></AgGridColumn>
                <AgGridColumn field="CityName"></AgGridColumn>
                <AgGridColumn field="PlantWithCode" headerName="Plant (Code)" ></AgGridColumn>
                <AgGridColumn field="VendorWithCode" headerName={`${vendorLabel} (Code)`}></AgGridColumn>
                {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <AgGridColumn field="CustomerWithCode" headerName="Customer (Code)"></AgGridColumn>}
                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={"costFormatter"}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" cellRenderer="effectiveDateFormatter" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                <AgGridColumn field="PowerId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
              </AgGridReact>
              )}
              {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
            </div>
          </div>
        </Col>
      </Row>
      {
        state.showPopup && (<PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.POWER_DELETE_ALERT}`} />
        )
      }
    </div >
  );
};

export default PowerListing
