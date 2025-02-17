import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import { deleteProcess, getProcessDataList, } from "../actions/Process";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import AddProcessDrawer from "./AddProcessDrawer";
import LoaderCustom from "../../common/LoaderCustom";
import { ProcessMaster } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { PROCESSLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const ProcessListing = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("common")

  const [state, setState] = useState({
    isOpenProcessDrawer: false,
    isEditFlag: false,
    Id: "",
    tableData: [],
    plant: [],
    machine: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    showPopup: false,
    deletedId: "",
    isLoader: false,
    noData: false,
    dataCount: 0,
    render: false,
    showExtraData: false,
    globalTake: defaultPageSize,
  });
  const permissions = useContext(ApplyPermission);

  const { processList } = useSelector((state) => state.process);


  useEffect(() => {
    getDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (processList && processList.length > 0) {
      setState((prevState) => ({ ...prevState, tableData: processList, }));
    }
  }, [processList]);

  const editItemDetails = (Id) => {
    setState((prevState) => ({
      ...prevState,
      isOpenProcessDrawer: true,
      isEditFlag: true,
      Id: Id,
      // dataCount: 0,
    }));
    getDataList();

  };

  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    return (
      <>
        {permissions.Edit && (
          <button
            title="Edit"
            className="Edit mr-2 Tour_List_Edit"
            type={"button"}
            onClick={() => editItemDetails(cellValue, rowData)}
          />
        )}
        {permissions.Delete && (
          <button
            title="Delete"
            className="Delete Tour_List_Delete"
            type={"button"}
            onClick={() => deleteItem(cellValue)}
          />
        )}
      </>
    );
  };

  const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? "VBC" : "ZBC";
  };

  const getDataList = (ProcessName = "", ProcessCode = "") => {
    const filterData = {
      ProcessName: ProcessName,
      ProcessCode: ProcessCode,
    };
    setState((prevState) => ({ ...prevState, isLoader: true }));
    dispatch(
      getProcessDataList(filterData, (res) => {

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
  };

  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id, }));
  };

  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteProcess(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY);
          getDataList();
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
        }
      })
    );
    setState((prevState) => ({ ...prevState, showPopup: false }))
  };
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  };

  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const processToggler = () => {
    setState((prevState) => ({ ...prevState, isOpenProcessDrawer: true, isEditFlag: false, Id: "" }));
  };

  const closeProcessDrawer = (e = "", formData, type) => {
    setState((prevState) => ({ ...prevState, isOpenProcessDrawer: false }
    ));
    if (type === "submit") { getDataList(); }
    setState((prevState) => ({ ...prevState, dataCount: 0 }));

  };
  /**
                 @method toggleExtraData
                 @description Handle specific module tour state to display lorem data
                */
  const toggleExtraData = (showTour) => {
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
    }, 100);
  }
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      processList.length !== 0 &&
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }));
    }, 500);
  };


  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp = TempData;

    return (
      <ExcelSheet data={temp} name={`${ProcessMaster}`}>
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
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,

    }));
    params.api.paginationGoToPage(0);
    params.api.sizeColumnsToFit()

  };
  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
    setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
  };
  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }));
  };
  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : processList
          ? processList
          : [];
    return returnExcelColumn(PROCESSLISTING_DOWNLOAD_EXCEl, tempArr);
  };

  const onFilterTextBoxChanged = (e) => {

    state.gridApi.setQuickFilter(e.target.value);
    if (
      e.target.value === "" ||
      e.target.value === null ||
      e.target.value === undefined
    ) {
      resetState();

    }
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
    setState((prevState) => ({ ...prevState, isLoader: true, dataCount: 0, globalTake: defaultPageSize, }));
    getDataList();
  };

  const { isOpenProcessDrawer, isEditFlag, noData } = state;
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
    costingHeadRenderer: costingHeadFormatter,
    customNoRowsOverlay: NoContentFound,
  };
  return (
    <div
      className={`ag-grid-react ${permissions.Download ? "show-table-btn" : ""
        }`}
    >
      {state.isLoader && <LoaderCustom />}
      <form noValidate>
        <Row className="pt-4">
          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                {state.shown ? (
                  <button
                    type="button"
                    className="user-btn mr5 filter-btn-top"
                    onClick={() => setState((prevState) => ({ ...prevState, shown: !state.shown }))}
                  >
                    <div className="cancel-icon-white"></div>
                  </button>
                ) : (
                  ""
                )}
                {permissions.Add && (
                  <button
                    type="button"
                    className={"user-btn mr5 Tour_List_Add"}
                    title="Add"
                    onClick={processToggler}
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                )}
                {permissions.Download && (
                  <>
                    <ExcelFile
                      filename={ProcessMaster}
                      fileExtension={".xls"}
                      element={
                        <button
                          title={`Download ${state.dataCount === 0
                            ? "All"
                            : "(" + state.dataCount + ")"
                            }`}
                          type="button"
                          className={"user-btn mr5 Tour_List_Download"}
                        >
                          <div className="download mr-1"></div>
                          {`${state.dataCount === 0
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
                  className="user-btn Tour_List_Reset "
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
            className={`ag-grid-wrapper height-width-wrapper ${(processList && processList?.length <= 0) || noData
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
              <TourWrapper
                buttonSpecificProp={{ id: "Process_Listing_Tour", onClick: toggleExtraData }}
                stepsSpecificProp={{
                  steps: Steps(t, { addLimit: false, bulkUpload: false, filterButton: false, costMovementButton: false, viewButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                }} />
            </div>
            <div
              className={`ag-theme-material ${state.isLoader && "max-loader-height"
                }`}
            >
              {noData && (
                <NoContentFound
                  title={EMPTY_DATA}
                  customClassName="no-content-found"
                />
              )}
              {!state.isLoader &&
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                // columnDefs={c}
                rowData={state.showExtraData && processList ? [...setLoremIpsum(processList[0]), ...processList] : processList}

                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                rowSelection={"multiple"}
                onSelectionChanged={onRowSelect}
                noRowsOverlayComponent={"customNoRowsOverlay"}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                }}
                frameworkComponents={frameworkComponents}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
              >
                <AgGridColumn
                  field="ProcessName"
                  headerName="Process Name"
                  cellRenderer={"costingHeadFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="ProcessCode"
                  headerName="Process Code"
                ></AgGridColumn>
                <AgGridColumn
                  field="ProcessId"
                  cellClass="ag-grid-action-container"
                  headerName="Action"
                  type="rightAligned"
                  floatingFilter={false}
                  cellRenderer={"totalValueRenderer"}
                ></AgGridColumn>
              </AgGridReact>
              }
              {
                <PaginationWrapper
                  gridApi={state.gridApi}
                  setPage={onPageSizeChanged}
                  globalTake={state.globalTake}
                />
              }
            </div>
          </div>
        </Col>
      </Row>
      {isOpenProcessDrawer && (
        <AddProcessDrawer
          isOpen={isOpenProcessDrawer}
          closeDrawer={closeProcessDrawer}
          isEditFlag={isEditFlag}
          isMachineShow={true}
          ID={state.Id}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.PROCESS_DELETE_ALERT}`}
        />
      )}
    </div>
  );
};

export default ProcessListing
