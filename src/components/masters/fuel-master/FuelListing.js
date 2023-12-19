import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import { Row, Col } from "reactstrap";
import { getFuelDetailDataList, deleteFuelDetailAPI } from "../actions/Fuel";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import "react-input-range/lib/css/index.css";
import DayTime from "../../common/DayTimeWrapper";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { loggedInUserId, searchNocontentFilter } from "../../../helper";
import { FuelMaster } from "../../../config/constants";
import { FUELLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { filterParams } from "../../common/DateFilter";
import { PaginationWrapper } from "../../common/commonPagination";
import Toaster from "../../common/Toaster";
import { reactLocalStorage } from "reactjs-localstorage";
import { ApplyPermission } from ".";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const FuelListing = (props) => {
  const [state, setState] = useState({
    isEditFlag: false,
    shown: false,
    tableData: [],
    isBulkUpload: false,
    fuel: [],
    StateName: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    isLoader: false,
    showPopup: false,
    deletedId: "",
    selectedRowData: false,
    noData: false,
    dataCount: 0,
  });
  const dispatch = useDispatch();
  const permissions = useContext(ApplyPermission);
  const { fuelDataList } = useSelector((state) => state.fuel);
  const { initialConfiguration } = useSelector((state) => state.auth);

  console.log("fuelDataList", fuelDataList, initialConfiguration);
  console.log(permissions);

  useEffect(() => {
    if (permissions) {
      getDataList(null, null);
    }
  }, [permissions]);

  const getDataList = (fuelName = 0, stateName = 0) => {
    const filterData = {
      fuelName: fuelName,
      stateName: stateName,
    };
    dispatch(
      getFuelDetailDataList(true, filterData, (res) => {
        setState((prevState) => ({ ...prevState, isLoader: false }));
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setState((prevState) => ({
            ...prevState,
            tableData: Data,
            isLoader: false,
          }));
        } else if (res && res.response && res.response.status === 412) {
          setState((prevState) => ({
            ...prevState,
            tableData: [],
            isLoader: false,
          }));
        } else {
          setState((prevState) => ({
            ...prevState,
            tableData: [],
            isLoader: false,
          }));
        }
      })
    );
  };

  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    let data = {
      isEditFlag: true,
      Id: rowData?.FuelGroupEntryId,
      isViewMode: isViewMode,
    };
    props.getDetails(data);
  };

  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };

  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    return (
      <>
        {permissions.View && (
          <button
            title="View"
            className="View mr5"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, rowData, true)}
          />
        )}
        {permissions.Edit && (
          <button
            title="Edit"
            className="Edit mr5"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, rowData, false)}
          />
        )}
        {permissions.Delete && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(rowData?.FuelDetailId)}
          />
        )}
      </>
    );
  };

  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteFuelDetailAPI(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_FUEL_DETAIL_SUCCESS);
          getDataList();
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
        }
      })
    );
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  };
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };
  const effectiveDateFormatter = (props) => {
    let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (cellValue?.includes("T")) {
      cellValue = DayTime(cellValue).format("DD/MM/YYYY");
    }
    return !cellValue ? "-" : cellValue;
  };

  const onFloatingFilterChanged = (value) => {
    console.log(value);
    setTimeout(() => {
      fuelDataList.length !== 0 &&
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
    }, 500);
  };

  const formToggle = () => {
    props.formToggle();
  };

  const bulkToggle = () => {
    setState((prevState) => ({ ...prevState, isBulkUpload: true }));
  };

  const closeBulkUploadDrawer = () => {
    setState(
      (prevState) => (
        { ...prevState, isBulkUpload: false },
        () => {
          getDataList(0, 0);
        }
      )
    );
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.IsVendor === true) {
          item.IsVendor = "VBC";
        }
        if (item.IsVendor === false) {
          item.IsVendor = "ZBC";
        }
        if (item.Plants === "-") {
          item.Plants = " ";
        }
        if (item.Vendor === "-") {
          item.Vendor = " ";
        } else if (
          item?.EffectiveDate?.includes("T") ||
          item?.ModifiedDate?.includes("T")
        ) {
          item.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
          item.ModifiedDate = DayTime(item.ModifiedDate).format("DD/MM/YYYY");
        }
        return item;
      });

    return (
      <ExcelSheet data={temp} name={`${FuelMaster}`}>
        {data &&
          data.map((ele, index) => (
            <ExcelColumn
              key={index}
              label={ele.label}
              value={ele.value}
              style={ele.style}
            />
          ))}
      </ExcelSheet>
    );
  };

  const onGridReady = (params) => {
    state.gridApi = params.api;
    window.screen.width >= 1600 && params.api.sizeColumnsToFit();
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
  };
  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };
  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({
      ...prevState,
      selectedRowData: selectedRows,
      dataCount: selectedRows.length,
    }));
  };
  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : fuelDataList
        ? fuelDataList
        : [];

    return returnExcelColumn(FUELLISTING_DOWNLOAD_EXCEl, tempArr);
  };

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  };

  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      isFuelForm: false,
      isPowerForm: false,
      data: {},
      stopApiCallOnCancel: false,
      dataCount: 0,
    }));
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState(null);
    gridOptions.api.setFilterModel(null);
  };

  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : "-";
  };

  const ExcelFile = ReactExport.ExcelFile;

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
    effectiveDateRenderer: effectiveDateFormatter,
    customNoRowsOverlay: NoContentFound,
    commonCostFormatter: commonCostFormatter,
  };

  return (
    <div
      className={`ag-grid-react ${
        permissions.Download ? "show-table-btn" : ""
      }`}
    >
      {state.isLoader && <LoaderCustom />}
      <form
        // onSubmit={handleSubmit(onSubmit.bind(this))}
        noValidate
      >
        <Row className="pt-4">
          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                {state.shown ? (
                  <button
                    type="button"
                    className="user-btn mr5 filter-btn-top"
                    onClick={() =>
                      setState((prevState) => ({
                        ...prevState,
                        shown: !state.shown,
                      }))
                    }
                  >
                    <div className="cancel-icon-white"></div>
                  </button>
                ) : (
                  ""
                )}
                {permissions.Add && (
                  <button
                    type="button"
                    className={"user-btn mr5"}
                    onClick={formToggle}
                    title="Add"
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                )}
                {permissions.BulkUpload && (
                  <button
                    type="button"
                    className={"user-btn mr5"}
                    onClick={bulkToggle}
                    title="Bulk Upload"
                  >
                    <div className={"upload mr-0"}></div>
                  </button>
                )}
                {permissions.Download && (
                  <>
                    <ExcelFile
                      filename={"Fuel"}
                      fileExtension={".xls"}
                      element={
                        <button
                          title={`Download ${
                            state.dataCount === 0
                              ? "All"
                              : "(" + state.dataCount + ")"
                          }`}
                          type="button"
                          className={"user-btn mr5"}
                        >
                          <div className="download mr-1"></div>
                          {`${
                            state.dataCount === 0
                              ? "All"
                              : "(" + state.dataCount + ")"
                          }`}
                        </button>
                      }
                    >
                      {onBtExport()}
                    </ExcelFile>
                  </>
                )}
                <button
                  type="button"
                  className="user-btn"
                  title="Reset Grid"
                  onClick={() => resetState()}
                >
                  <div className="refresh mr-0"></div>
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </form>
      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${
              (fuelDataList && fuelDataList?.length <= 0) || state.noData
                ? "overlay-contain"
                : ""
            }`}
          >
            <div className="ag-grid-header">
              <input
                type="text"
                className="form-control table-search"
                id="filter-text-box"
                placeholder="Search"
                autoComplete={"off"}
                onChange={(e) => onFilterTextBoxChanged(e)}
              />
            </div>
            <div
              className={`ag-theme-material ${
                state.isLoader && "max-loader-height"
              }`}
            >
              {state.noData && (
                <NoContentFound
                  title={EMPTY_DATA}
                  customClassName="no-content-found"
                />
              )}
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                rowData={fuelDataList}
                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={"customNoRowsOverlay"}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: "imagClass",
                }}
                rowSelection={"multiple"}
                onSelectionChanged={onRowSelect}
                frameworkComponents={frameworkComponents}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
              >
                <AgGridColumn
                  field="FuelName"
                  headerName="Fuel"
                  width={250}
                  cellRenderer={"costingHeadFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="UnitOfMeasurementName"
                  headerName="UOM"
                ></AgGridColumn>
                <AgGridColumn
                  field="StateName"
                  headerName="State"
                ></AgGridColumn>
                <AgGridColumn
                  field="Rate"
                  headerName="Rate (INR)"
                  cellRenderer={"commonCostFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="PlantWithCode"
                  headerName="Plant (Code)"
                ></AgGridColumn>
                <AgGridColumn
                  field="VendorWithCode"
                  headerName="Vendor (Code)"
                ></AgGridColumn>
                {reactLocalStorage.getObject("cbcCostingPermission") && (
                  <AgGridColumn
                    field="CustomerWithCode"
                    headerName="Customer (Code)"
                  ></AgGridColumn>
                )}
                <AgGridColumn
                  field="EffectiveDate"
                  headerName="Effective Date"
                  cellRenderer={"effectiveDateRenderer"}
                ></AgGridColumn>
                <AgGridColumn
                  field="ModifiedDate"
                  minWidth={170}
                  headerName="Date of Modification"
                  cellRenderer={"effectiveDateRenderer"}
                  filter="agDateColumnFilter"
                  filterParams={filterParams}
                ></AgGridColumn>
                <AgGridColumn
                  field="FuelDetailId"
                  width={300}
                  cellClass="ag-grid-action-container"
                  headerName="Action"
                  type="rightAligned"
                  pinned="right"
                  floatingFilter={false}
                  cellRenderer={"totalValueRenderer"}
                ></AgGridColumn>
              </AgGridReact>
              {
                <PaginationWrapper
                  gridApi={state.gridApi}
                  setPage={onPageSizeChanged}
                />
              }
            </div>
          </div>
        </Col>
      </Row>
      {state.isBulkUpload && (
        <BulkUpload
          isOpen={state.isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"Fuel"}
          messageLabel={"Fuel"}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.FUEL_DELETE_ALERT}`}
        />
      )}
    </div>
  );
};
export default reduxForm({
  form: "FuelListing",
  enableReinitialize: true,
  touchOnChange: true,
})(FuelListing);
