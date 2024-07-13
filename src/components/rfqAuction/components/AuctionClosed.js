import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
// import AddProcessDrawer from "./AddProcessDrawer";
import LoaderCustom from "../../common/LoaderCustom";
import { ProcessMaster } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { PROCESSLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter, setLoremIpsum, } from "../../../helper";
//import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import Button from "../../layout/Button";

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const AuctionClosed = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("common");

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
  });
  //const permissions = useContext(ApplyPermission);

  const { processList } = useSelector((state) => state.process);

  useEffect(() => {
    getDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (processList && processList.length > 0) {
      setState((prevState) => ({ ...prevState, tableData: processList }));
    }
  }, [processList]);
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
  };

  const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? "VBC" : "ZBC";
  };

  const getDataList = (RFQ = "", ProcessCode = "") => {
    const filterData = {
      RFQ: RFQ,
      ProcessCode: ProcessCode,
    };
    setState((prevState) => ({ ...prevState, isLoader: true }));

  };

  /**
                 @method toggleExtraData
                 @description Handle specific module tour state to display lorem data
                */
  const toggleExtraData = (showTour) => {
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        showExtraData: showTour,
        render: false,
      }));
    }, 100);
  };
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      processList.length !== 0 &&
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
    }, 500);
  };

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
    params.api.sizeColumnsToFit();
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
    state.gridApi.setQuickFilter(null);
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  };

  const { noData } = state;
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
    <>
      <div className={`ag-grid-react`}>
        {false && <LoaderCustom />}
        <form noValidate>
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
                  {/* {permissions.Add && (
                  <button
                    type="button"
                    className={"user-btn mr5 Tour_List_Add"}
                    title="Add"
                    onClick={processToggler}
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                )} */}
                  {/* {permissions.Download && (
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
                )} */}
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
              className={`ag-grid-wrapper height-width-wrapper ${true ? "overlay-contain" : ""}`}>
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
                  buttonSpecificProp={{
                    id: "Process_Listing_Tour",
                    onClick: toggleExtraData,
                  }}
                  stepsSpecificProp={{
                    steps: Steps(t, {
                      addLimit: false,
                      bulkUpload: false,
                      filterButton: false,
                      costMovementButton: false,
                      viewButton: false,
                      copyButton: false,
                      viewBOM: false,
                      status: false,
                      updateAssociatedTechnology: false,
                      addMaterial: false,
                      addAssociation: false,
                      generateReport: false,
                      approve: false,
                      reject: false,
                    }).COMMON_LISTING,
                  }}
                />
              </div>
              <div
                className={`ag-theme-material ${false && "max-loader-height"
                  }`}
              >
                {noData && (
                  <NoContentFound
                    title={EMPTY_DATA}
                    customClassName="no-content-found"
                  />
                )}
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout="autoHeight"
                  // columnDefs={c}
                  rowData={[]}
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
                  <AgGridColumn field="RFQ" headerName="RFQ No." cellRenderer={"costingHeadFormatter"} />
                  <AgGridColumn field="Technology" headerName="Technology" cellRenderer={"costingHeadFormatter"} />
                  <AgGridColumn field="PartType" headerName="Part Type" cellRenderer={"costingHeadFormatter"} />
                  <AgGridColumn field="PartNo" headerName="Part No." />
                  <AgGridColumn field="AuctionName" headerName="Auction Name" />
                  <AgGridColumn field="RMName" headerName="RM Name" />
                  <AgGridColumn field="RMGrade" headerName="RM Grade" />
                  <AgGridColumn field="RMSpecification" headerName="RM Specification" />
                  <AgGridColumn field="RMCode" headerName="RM Code" />
                  <AgGridColumn field="BOPNumber" headerName="BOP No." />
                  <AgGridColumn field="BOPName" headerName="BOP Name" />
                  <AgGridColumn field="BOPCategory" headerName="Category" />
                  <AgGridColumn field="VendorName" headerName="Vendor Name" />
                  <AgGridColumn field="Plant" headerName="Plant" />
                  <AgGridColumn field="Date" headerName="Date" />
                  <AgGridColumn field="Time" headerName="Time" />
                  <AgGridColumn field="TotalVendors" headerName="Total Vendors" />
                  <AgGridColumn field="BasePrice" headerName="Base Price" />
                  <AgGridColumn field="LevelOnePrice" headerName="Level One Price" />
                  <AgGridColumn field="LevelOneVendorName" headerName="Level One Vendor" />
                  <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={180} headerName="Color Codes" marryChildren={true}>
                    <AgGridColumn width={50} cellRenderer="oldBasicRateFormatter" field="RedCode" headerName="R" />
                    <AgGridColumn width={50} cellRenderer="newBasicRateFormatter" onCellValueChanged="cellChange" field="GreenCode" headerName="G" colId="GreenColor" />
                    <AgGridColumn width={50} cellRenderer="newBasicRateFormatter" onCellValueChanged="cellChange" field="BlueCode" headerName="B" colId="BlueColor" />
                  </AgGridColumn>
                  <AgGridColumn field="ProcessId" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"} />
                </AgGridReact>
                {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AuctionClosed;
