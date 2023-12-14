import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import {} from "../../../actions/Common";
import {
  getPartDataList,
  deletePart,
  //   activeInactivePartStatus,
  //   checkStatusCodeAPI,
} from "../actions/Part";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { ComponentPart } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { INDIVIDUALPART_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import WarningMessage from "../../common/WarningMessage";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import DayTime from "../../common/DayTimeWrapper";
import _ from "lodash";
import { PaginationWrapper } from "../../common/commonPagination";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import { searchNocontentFilter } from "../../../helper";
import { disabledClass } from "../../../actions/Common";
import { ApplyPermission } from ".";

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const IndivisualPartListing = (props) => {
  const dispatch = useDispatch();
  const [pageNo, setPageNo] = useState(1);
  const [gridApi, setGridApi] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [dataCount, setDataCount] = useState(0);
  const [totalRecordCount, setTotalRecordCount] = useState(1);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [pageNoNew, setPageNoNew] = useState(1);
  const [globalTake, setGlobalTake] = useState(defaultPageSize);
  const [isLoader, setIsLoader] = useState(false);
  const [disableDownload, setDisableDownload] = useState(false);
  const [noData, setNoData] = useState(false);
  const [disableFilter, setDisableFilter] = useState(true);
  const [filterModel, setFilterModel] = useState({});
  const [warningMessage, setWarningMessage] = useState(false);
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  const [pageSize, setPageSize] = useState({
    pageSize10: true,
    pageSize50: false,
    pageSize100: false,
  });
  const [floatingFilterData, setFloatingFilterData] = useState({
    Technology: "",
    PartNumber: "",
    PartName: "",
    ECNNumber: "",
    RevisionNumber: "",
    DrawingNumber: "",
    EffectiveDate: "",
  });
  const [tableData, setTableData] = useState([]);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [deletedId, setDeletedId] = useState("");
  const [selectedRowData, setSelectedRowData] = useState([]);

  const {
    partsListing,
    productDataList,
    initialConfiguration,
    selectedCostingListSimulation,
    selectedRowForPagination,
  } = useSelector((state) => ({
    partsListing: state.part.partsListing,
    productDataList: state.part.productDataList,
    initialConfiguration: state.auth.initialConfiguration,
    selectedCostingListSimulation:
      state.simulation.selectedCostingListSimulation,
    selectedRowForPagination: state.simulation.selectedRowForPagination,
  }));

  const permissions = useContext(ApplyPermission);
  useEffect(() => {
    getTableListData(0, defaultPageSize, floatingFilterData, true);
    return () => {
      dispatch(setSelectedRowForPagination([]));
    };
  }, []);

  useEffect(() => {
    setIsLoader(true);
    setTimeout(() => {
      setIsLoader(false);
    }, 200);
  }, []);
  useEffect(() => {
    if (partsListing?.length > 0) {
      setTotalRecordCount(partsListing?.length);
    } else {
      setNoData(false);
    }
  }, [partsListing]);

  const getTableListData = (skip, take, obj, isPagination) => {
    setIsLoader(true);

    let constantFilterData = filterModel;
    let object = { ...floatingFilterData };

    dispatch(
      getPartDataList(skip, take, obj, isPagination, (res) => {
        setTimeout(() => {
          setIsLoader(false);
        }, 300);

        if (res.status === 202) {
          setTotalRecordCount(0);
          setPageNo(0);
        } else if (res.status === 204 && (!res.data || res.data === "")) {
          setTableData([]);
          setNoData(true);
          setTotalRecordCount(0);
          setPageNo(0);
          // if (isPagination) {
          //   console.log("No more data available for pagination.");
          // } else {
          //   setTableData([]);
          //   setNoData(true);
          //   setTotalRecordCount(0);
          //   setPageNo(0);
          // }
        } else if (res.status === 200 && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setTableData(Data);
          setTotalRecordCount(Data[0].TotalRecordCount);
          setNoData(false);
        }

        if (isPagination === false) {
          setDisableDownload(false);
          dispatch(disabledClass(false));
          setTimeout(() => {
            let button = document.getElementById(
              "Excel-Downloads-component-part"
            );
            button && button.click();
          }, 500);
        }

        let isReset = true;
        for (let prop in object) {
          if (object[prop] !== "") {
            isReset = false;
            break;
          }
        }

        if (isReset) {
          gridOptions?.api?.setFilterModel({});
        } else {
          gridOptions?.api?.setFilterModel(constantFilterData);
        }
        setTotalRecordCount(
          (res.data && res.data.DataList[0].TotalRecordCount) || 0
        );
        setTableData(res.data.DataList || []);
        setNoData(!res.data.DataList || res.data.DataList.length === 0);
        setWarningMessage(false);
        setIsFilterButtonClicked(false);
      })
    );
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (partsListing?.length !== 0) {
        setNoData(searchNocontentFilter(value, noData));
      }
    }, 500);
    setDisableFilter(false);
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model);
    if (!isFilterButtonClicked) {
      setWarningMessage(true);
    }

    if (
      value?.filterInstance?.appliedModel === null ||
      value?.filterInstance?.appliedModel?.filter === ""
    ) {
      let isFilterEmpty = true;

      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false;

          for (var property in floatingFilterData) {
            if (property === value.column.colId) {
              floatingFilterData[property] = "";
            }
          }
          setFloatingFilterData(floatingFilterData);
        }

        if (isFilterEmpty) {
          setWarningMessage(false);
          for (var prop in floatingFilterData) {
            floatingFilterData[prop] = "";
          }
          setFloatingFilterData(floatingFilterData);
        }
      }
    } else {
      if (
        value.column.colId === "EffectiveDate" ||
        value.column.colId === "CreatedDate"
      ) {
        return false;
      }
      setFloatingFilterData({
        ...floatingFilterData,
        [value.column.colId]: value.filterInstance.appliedModel.filter,
      });
    }
  };

  const onSearch = () => {
    setWarningMessage(false);
    setIsFilterButtonClicked(true);
    setPageNo(1);
    setPageNoNew(1);
    setCurrentRowIndex(0);
    gridOptions?.columnApi?.resetColumnState();
    getTableListData(0, globalTake, floatingFilterData, true);
  };

  const resetState = () => {
    setNoData(false);
    gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);

    for (var prop in floatingFilterData) {
      floatingFilterData[prop] = "";
    }

    setFloatingFilterData(floatingFilterData);
    setWarningMessage(false);
    setPageNo(1);
    setPageNoNew(1);
    setCurrentRowIndex(0);
    getTableListData(0, 10, floatingFilterData, true);
    dispatch(setSelectedRowForPagination([]));
    setGlobalTake(10);
    setPageSize((prevState) => ({
      ...prevState,
      pageSize10: true,
      pageSize50: false,
      pageSize100: false,
    }));
  };

  const onBtPrevious = () => {
    const newPageNo = pageNo - 1;
    if (newPageNo > 0) {
      const skip = (newPageNo - 1) * globalTake;
      setPageNo(newPageNo);
      getTableListData(skip, globalTake, floatingFilterData, true);
    }
  };

  const onBtNext = () => {
    const newPageNo = pageNo + 1;
    const totalPages = Math.ceil(totalRecordCount / globalTake);

    if (newPageNo <= totalPages) {
      const skip = (newPageNo - 1) * globalTake;
      setPageNo(newPageNo);
      getTableListData(skip, globalTake, floatingFilterData, true);
    }
  };

  const onPageSizeChanged = (newPageSize) => {
    let pageSize, totalRecordCount;

    if (Number(newPageSize) === 10) {
      pageSize = 10;
    } else if (Number(newPageSize) === 50) {
      pageSize = 50;
    } else if (Number(newPageSize) === 100) {
      pageSize = 100;
    }

    totalRecordCount = Math.ceil(totalRecordCount / pageSize);

    getTableListData(currentRowIndex, pageSize, floatingFilterData, true);

    setGlobalTake(pageSize);
    setPageNo(1);
    setPageNoNew(Math.min(pageNo, totalRecordCount));
    setPageSize({
      pageSize10: pageSize === 10,
      pageSize50: pageSize === 50,
      pageSize100: pageSize === 100,
    });

    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const viewOrEditItemDetails = (Id, isViewMode) => {
    let requestData = {
      isEditFlag: true,
      Id: Id,
      isViewMode: isViewMode,
    };
    props.getDetails(requestData);
    // dispatch(getDetails(requestData));
  };

  const deleteItem = (ID) => {
    setShowPopup(true);
    setDeletedId(ID);
  };

  const confirmDeleteItem = (ID) => {
    dispatch(
      deletePart(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_VOLUME_SUCCESS);
          getTableListData(0, globalTake, true);
          gridApi.deselectAll();
          dispatch(setSelectedRowForPagination([]));
          setDataCount(0);
        }
      })
    );
    setShowPopup(false);
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(deletedId);
  };
  const closePopUp = () => {
    setShowPopup(false);
  };

  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;
    let ID = {};
    ID.partId = rowData.PartId;
    ID.partApprovedId = rowData.PartApprovedId;
    ID.partBudgetedId = rowData.PartBudgetedId;

    return (
      <>
        {permissions.View && (
          <button
            title="View"
            className="View"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, true)}
          />
        )}
        {permissions.View && (
          <button
            title="Edit"
            className="Edit mr-2"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, rowData)}
          />
        )}
        {permissions.Delete && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(ID)}
          />
        )}
      </>
    );
  };

  /**
   * @method hyphenFormatter
   */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;

    if (props.selectedCostingListSimulation?.length > 0) {
      props.selectedCostingListSimulation.map((item) => {
        if (item.PartId === props.node.data.PartId) {
          props.node.setSelected(true);
        }
        return null;
      });

      return cellValue !== " " &&
        cellValue !== null &&
        cellValue !== "" &&
        cellValue !== undefined
        ? cellValue
        : "-";
    } else {
      return cellValue !== " " &&
        cellValue !== null &&
        cellValue !== "" &&
        cellValue !== undefined
        ? cellValue
        : "-";
    }
  };

  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    // var selectedRows = gridApi?.getSelectedRows();

    if (props.selectedCostingListSimulation?.length > 0) {
      props.selectedCostingListSimulation.map((item) => {
        if (item.RawMaterialId === props.node.data.RawMaterialId) {
          props.node.setSelected(true);
        }
        return null;
      });
      return cellValue;
    } else {
      return cellValue;
    }
  };

  /**
   * @method effectiveDateFormatter
   * @description Renders buttons
   */
  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
    // return cellValue != null ? cellValue : '';
  };

  const bulkToggle = () => {
    setIsBulkUpload(true);
  };

  const closeBulkUploadDrawer = (event, type) => {
    setIsBulkUpload(false);
    if (type !== "cancel") {
      resetState();
    }
  };

  const formToggle = () => {
    props.formToggle();
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
  };

  const onExcelDownload = () => {
    setDisableDownload(true);
    dispatch(disabledClass(true));

    let tempArr = selectedCostingListSimulation; // Assuming `selectedCostingListSimulation` is an array

    if (tempArr?.length > 0) {
      setTimeout(() => {
        setDisableDownload(false);
        dispatch(disabledClass(false));

        const button = document.getElementById(
          "Excel-Downloads-component-part"
        );
        button?.click();
      }, 500);
    } else {
      getTableListData(0, defaultPageSize, floatingFilterData, false); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };

  const onBtExport = useCallback(() => {
    // Use the selectedRowData for export
    const tempArr = selectedRowData.length > 0 ? selectedRowData : tableData;
    console.log(tempArr);
    return returnExcelColumn(INDIVIDUALPART_DOWNLOAD_EXCEl, tempArr);
  }, [selectedRowData, tableData]);

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.ECNNumber === null) {
          item.ECNNumber = " ";
        } else if (item.RevisionNumber === null) {
          item.RevisionNumber = " ";
        } else if (item.DrawingNumber === null) {
          item.DrawingNumber = " ";
        } else if (item.Technology === "-") {
          item.Technology = " ";
        }

        return item;
      });
    return (
      <ExcelSheet data={temp} name={ComponentPart}>
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
    console.log(e.target.value, "e");
    gridApi.setQuickFilter(e.target.value);
  };

  const ExcelFile = ReactExport.ExcelFile;

  var filterParams = {
    date: "",
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString =
        cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
      var newDate =
        filterLocalDateAtMidnight != null
          ? DayTime(filterLocalDateAtMidnight).format("DD/MM/YYYY")
          : "";
      setDate(newDate);
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

  var setDate = (date) => {
    setFloatingFilterData((prevData) => ({
      ...prevData,
      newDate: date,
    }));
  };

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };


  const onRowSelect = useCallback(() => {
    if (gridApi) {
      const selectedRows = gridApi.getSelectedRows();
      console.log(selectedRows, "selec");
      setSelectedRowData(selectedRows);
      setDataCount(
        selectedRows.length
      )
    }
  }, [gridApi]);

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
    hyphenFormatter: hyphenFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    checkBoxRenderer: checkBoxRenderer,
  };
  return (
    <>
      <div
        className={`ag-grid-react custom-pagination ${
          permissions.Download ? "show-table-btn" : ""
        }`}
      >
        {isLoader && <LoaderCustom />}
        {disableDownload && (
          <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />
        )}
        <Row className="pt-4 no-filter-row">
          <Col md="9" className="search-user-block pr-0">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div className="warning-message d-flex align-items-center">
                {warningMessage && !disableDownload && (
                  <>
                    <WarningMessage
                      dClass="mr-3"
                      message={
                        "Please click on filter button to filter all data"
                      }
                    />
                    <div className="right-hand-arrow mr-2"></div>
                  </>
                )}
              </div>
              <div className="d-flex">
                <button
                  title="Filtered data"
                  type="button"
                  className="user-btn mr5"
                  onClick={() => onSearch(this)}
                  disabled={disableFilter}
                >
                  <div className="filter mr-0"></div>
                </button>
                {permissions.Add && (
                  <button
                    type="button"
                    className={"user-btn mr5"}
                    title="Add"
                    onClick={formToggle}
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
        <div
          className={`ag-grid-wrapper height-width-wrapper ${
            (partsListing && partsListing?.length <= 0) || noData
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
            className={`ag-theme-material ${isLoader && "max-loader-height"}`}
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
              rowData={tableData}
              pagination={true}
              paginationPageSize={globalTake}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              onFilterModified={onFloatingFilterChanged}
              rowSelection={"multiple"}
              onRowSelected={onRowSelect}
              noRowsOverlayComponent={"customNoRowsOverlay"}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: "imagClass",
              }}
              frameworkComponents={frameworkComponents}
              suppressRowClickSelection={true}
            >
              <AgGridColumn
                field="Technology"
                headerName="Technology"
                cellRenderer={"hyphenFormatter"}
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
                cellClass="ag-grid-action-container"
                headerName="Action"
                width={160}
                pinned="right"
                type="rightAligned"
                floatingFilter={false}
                cellRenderer={"totalValueRenderer"}
              ></AgGridColumn>
            </AgGridReact>
            <div className="button-wrapper">
              {!isLoader && (
                <PaginationWrapper
                  gridApi={gridApi}
                  setPage={onPageSizeChanged}
                  globalTake={globalTake}
                />
              )}

              <div className="d-flex pagination-button-container">
                <p>
                  <button
                    className="previous-btn"
                    type="button"
                    disabled={pageNo === 1 ? true : false}
                    onClick={() => onBtPrevious()}
                  >
                    {" "}
                  </button>
                </p>
                {pageSize.pageSize10 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of{" "}
                    {Math.ceil(totalRecordCount / 10)}
                  </p>
                )}
                {pageSize.pageSize50 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of{" "}
                    {Math.ceil(totalRecordCount / 50)}
                  </p>
                )}
                {pageSize.pageSize100 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{pageNo}</span> of{" "}
                    {Math.ceil(totalRecordCount / 100)}
                  </p>
                )}
                <p>
                  <button
                    className="next-btn"
                    type="button"
                    onClick={() => onBtNext()}
                  >
                    {" "}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {isBulkUpload && (
          <BulkUpload
            isOpen={isBulkUpload}
            closeDrawer={closeBulkUploadDrawer}
            isEditFlag={false}
            fileName={"Part Component"}
            isZBCVBCTemplate={false}
            messageLabel={"Part"}
            anchor={"right"}
          />
        )}
        {showPopup && (
          <PopupMsgWrapper
            isOpen={showPopup}
            closePopUp={closePopUp}
            confirmPopup={onPopupConfirm}
            message={`${MESSAGES.CONFIRM_DELETE}`}
          />
        )}
      </div>
    </>
  );
};
export default IndivisualPartListing;
