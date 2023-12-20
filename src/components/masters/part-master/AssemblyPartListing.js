import React, { useState, useEffect, useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { getAssemblyPartDataList, deleteAssemblyPart } from "../actions/Part";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { ASSEMBLYNAME, defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import DayTime from "../../common/DayTimeWrapper";
import BOMViewer from "./BOMViewer";
import BOMUploadDrawer from "../../massUpload/BOMUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { AssemblyPart } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { ASSEMBLYPART_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { filterParams } from "../../common/DateFilter";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter } from "../../../helper";
import { ApplyPermission } from ".";
import TechnologyUpdateDrawer from './TechnologyUpdateDrawer';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const AssemblyPartListing = React.memo((props) => {
  console.log(props);
  const dispatch = useDispatch();
  const partsListing = useSelector((state) => state.part.partsListing);
  const initialConfiguration = useSelector(
    (state) => state.auth.initialConfiguration
  );
  const { getDetails } = props;

  const [tableData, setTableData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);

  const [state, setState] = useState({
    isEditFlag: false,
    isOpen: false,
    disableDownload: false,
    isOpenVisualDrawer: false,
    visualAdId: "",
    BOMId: "",
    isBulkUpload: false,
    showPopup: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    ID: "",
    isViewMode: false,
    isActivate: false,
    isDownload: false,
    gridApi: null,
    columnApi: null,
    paginationPageSize: defaultPageSize,
    openTechnologyUpdateDrawer: false
  });

  const permissions = useContext(ApplyPermission);

  const getTableListData = () => {
    setState((prevState) => ({
      ...prevState,
      isLoader: true,
    }));
    dispatch(
      getAssemblyPartDataList((res) => {
        setState((prevState) => ({
          ...prevState,
          isLoader: false,
        }));
        if (res.status === 204 && res.data === "") {
          setTableData([]);
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setTableData(Data);
        }
      })
    );
  };

  useEffect(() => {
    getTableListData();
  }, []);

  const viewOrEditItemDetails = (Id, isViewMode) => {
    let requestData = {
      isEditFlag: true,
      Id: Id,
      isViewMode: isViewMode,
    }
    getDetails(requestData);
  }

  
  const deleteItem = (Id) => {

    setState((prevState) => ({
      ...prevState,
      showPopup: true,
      deletedId: Id,
    }));
  }

  const confirmDeleteItem = (ID) => {
    setState((prevState) => ({
      ...prevState,
      showPopup: false,
      deletedId: "",
    }));
    dispatch(
      deleteAssemblyPart(ID, loggedInUserId, (res) => getTableListData())
    );
    Toaster.success(MESSAGES.DELETE_SUCCESSFULLY);
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  };

  const closePopUp = () => {
    // Correctly access the previous state using a callback function
    setState((prevState) => ({
      ...prevState,
      showPopup: false,
    }));
  };
  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
  };

  const visualAdDetails = (cell) => {
    setState((prevState) => ({
      ...prevState,
      isOpenVisualDrawer: true,
      visualAdId: cell,
    }));
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      partsListing.length !== 0 &&
        setState((prevState) => ({
          ...prevState,
          tableData: searchNocontentFilter(partsListing, value),
        }));
    }, 500);
  };



  
  const closeVisualDrawer = () => {
    setState((prevState) => ({
      ...prevState,
      isOpenVisualDrawer: false,
    }));
  };
  console.log(permissions);

  const buttonFormatter = useCallback((props) => {
    const cellValue = props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    console.log(permissions, "permissions");
    return (
      <>
        {permissions.View && (
          <button
            title="button"
            className="hirarchy-btn"
            type={"button"}
            onClick={() => visualAdDetails(cellValue)}
          />
        )}
        {permissions.View && (
          <button
            title="View"
            className="View"
            type={"button"}
            onClick={() => viewOrEditItemDetails(
              cellValue,
              true
            )}
          />
        )}
        {permissions.Edit && (
          <button
            title="Edit"
            className="Edit"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, false)}
          />
        )}
        {permissions.Delete && !rowData?.IsAssociate && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(cellValue)}
          />
        )}
      </>
    );
  }, []);


  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue !== " " &&
      cellValue !== null &&
      cellValue !== "" &&
      cellValue !== undefined
      ? cellValue
      : "-";
  };

  const indexFormatter = (cell, row, enumObject, rowIndex) => {
    let currentPage = state.gridApi.state.currPage;
    let sizePerPage = state.gridApi.state.sizePerPage;
    let serialNumber = "";
    if (currentPage === 1) {
      serialNumber = rowIndex + 1;
    } else {
      serialNumber = rowIndex + 1 + sizePerPage * (currentPage - 1);
    }
    return serialNumber;
  };

  const displayForm = () => {
    props.displayForm();
  };

  const bulkToggle = () => {
    setState((prevState) => ({
      ...prevState,
      isBulkUpload: true,
    }));
  };

  const closeBulkUploadDrawer = (isCancel) => {
    setState((prevState) => ({
      ...prevState,
      isBulkUpload: false,
    }));
    if (!isCancel) {
      getTableListData();
    }
  };

  const frameworkComponents = {
    buttonRenderer: buttonFormatter,
    indexRenderer: indexFormatter,
    hyphenRenderer: hyphenFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
  };

  const onGridReady = (params) => {
    window.screen.width >= 1600 && params.api.sizeColumnsToFit();
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      columnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = useCallback(() => {
    if (state.gridApi) {
      const selectedRows = state.gridApi.getSelectedRows();
      console.log(selectedRows, "selec");
      setSelectedRowData(selectedRows);
      setState((prevState) => ({
        ...prevState,
        dataCount: selectedRows.length,
      }));
    }
  }, [state.gridApi]);

  const onBtExport = useCallback(() => {
    // Use the selectedRowData for export
    const tempArr = selectedRowData.length > 0 ? selectedRowData : tableData;
    console.log(tempArr);
    return returnExcelColumn(ASSEMBLYPART_DOWNLOAD_EXCEl, tempArr);
  }, [selectedRowData, tableData]);

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.Technology === "-") {
          item.Technology = " ";
        }
        if (item.EffectiveDate?.includes("T")) {
          item.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
        }
        return item;
      });
    return (
      <ExcelSheet data={temp} name={AssemblyPart}>
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

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  };

  const resetState = () => {
    console.log("COMING IN RESET FUNCTION", state);
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    if (window.screen.width >= 1600) {
      state.gridApi.sizeColumnsToFit();
    }
  };

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

  const associatePartWithTechnology = () => {
    setState((prevState) => ({ ...prevState, openTechnologyUpdateDrawer: true }));

  }

  const closeTechnologyUpdateDrawer = (type = '') => {
    setState((prevState) => ({ ...prevState, openTechnologyUpdateDrawer: false }));
    if (type === 'submit') {
      getTableListData()
    }

  }


  return (
    <div
      className={`ag-grid-react p-relative ${
        permissions.Download ? "show-table-btn" : ""
      }`}
    >
      {state.isLoader ? <LoaderCustom /> : ""}
      <Row className="pt-4 no-filter-row">
        <Col md="8" className="filter-block"></Col>
        <Col md="6" className="search-user-block pr-0">
          <div className="d-flex justify-content-end bd-highlight w100">
            <div>
              {permissions.Add && (
                <button
                  type="button"
                  className={"user-btn mr5"}
                  title="Add"
                  onClick={displayForm}
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
                    filename={"BOM"}
                    fileExtension={".xls"}
                    element={
                      <button
                        title={`Download ${
                          selectedRowData.length === 0
                            ? "All"
                            : `(${selectedRowData.length})`
                        }`}
                        type="button"
                        className={"user-btn mr5"}
                        onClick={onBtExport}
                      >
                        <div className="download mr-1"></div>
                        {`${
                          selectedRowData.length === 0
                            ? "All"
                            : `(${selectedRowData.length})`
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
      {Object.keys(permissions).length > 0 && (
        <div
          className={`ag-grid-wrapper height-width-wrapper ${
            (partsListing && partsListing?.length <= 0) || state.noData
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
              rowData={partsListing}
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
                cellClass="has-checkbox"
                field="Technology"
                headerName="Technology"
                cellRenderer={"checkBoxRenderer"}
              ></AgGridColumn>
              <AgGridColumn
                field="BOMNumber"
                headerName="BOM No."
              ></AgGridColumn>
              <AgGridColumn
                field="PartNumber"
                headerName="Part No."
              ></AgGridColumn>
              <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
              {initialConfiguration?.IsSAPCodeRequired && (
                <AgGridColumn
                  field="SAPCode"
                  headerName="SAP Code"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
              )}
              <AgGridColumn
                field="NumberOfParts"
                headerName="No. of Child Parts"
              ></AgGridColumn>
              <AgGridColumn
                field="BOMLevelCount"
                headerName="BOM Level Count"
              ></AgGridColumn>
              <AgGridColumn
                field="ECNNumber"
                headerName="ECN No."
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              <AgGridColumn
                field="RevisionNumber"
                headerName="Revision No."
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              <AgGridColumn
                field="DrawingNumber"
                headerName="Drawing No."
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              <AgGridColumn
                field="EffectiveDateNew"
                headerName="Effective Date"
                cellRenderer={"effectiveDateFormatter"}
                filter="agDateColumnFilter"
                filterParams={filterParams}
              ></AgGridColumn>
              <AgGridColumn
                field="PartId"
                width={180}
                cellClass="ag-grid-action-container actions-wrapper"
                headerName="Action"
                pinned="right"
                type="rightAligned"
                floatingFilter={false}
                cellRenderer={"buttonRenderer"}
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
      )}
      {state.isOpenVisualDrawer && (
        <BOMViewer
          isOpen={state.isOpenVisualDrawer}
          closeDrawer={closeVisualDrawer}
          isEditFlag={true}
          PartId={state.visualAdId}
          anchor={"right"}
          isFromVishualAd={true}
          NewAddedLevelOneChilds={[]}
        />
      )}
      {state.isBulkUpload && (
        <BOMUploadDrawer
          isOpen={state.isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"BOM"}
          messageLabel={"BOM"}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.BOM_DELETE_ALERT}`}
        />
      )}
    </div>
  );
});

export default AssemblyPartListing;
