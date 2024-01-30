import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { isResetClick } from "../../../actions/Common";
import { getPartDataList, deletePart, } from "../actions/Part";
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
import { loggedInUserId, searchNocontentFilter } from "../../../helper";
import { disabledClass } from "../../../actions/Common";
import { ApplyPermission } from ".";

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const IndivisualPartListing = (props) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    pageNo: 1,
    gridApi: null,
    showPopup: false,
    gridColumnApi: null,
    dataCount: 0,
    totalRecordCount: 1,
    currentRowIndex: 0,
    pageNoNew: 1,
    globalTake: defaultPageSize,
    isLoader: true,
    disableDownload: false,
    noData: false,
    disableFilter: true,
    filterModel: {},
    warningMessage: false,
    searchText: "",
    isFilterButtonClicked: false,
    pageSize: { pageSize10: true, pageSize50: false, pageSize100: false, },
    floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "", },
    tableData: [],
    isBulkUpload: false,
    deletedId: "",
  });
  const [searchText, setSearchText] = useState('');

  const { partsListing, initialConfiguration, selectedRowForPagination, } = useSelector((state) => ({
    partsListing: state.part.partsListing,
    initialConfiguration: state.auth.initialConfiguration,
    selectedRowForPagination: state.simulation.selectedRowForPagination,
  }));
  const permissions = useContext(ApplyPermission);
  useEffect(() => {
    getTableListData(0, defaultPageSize, state.floatingFilterData, true);
    return () => {
      dispatch(setSelectedRowForPagination([]));
    };
  }, []);

  useEffect(() => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, isLoader: false }));
    }, 200);
  }, []);
  useEffect(() => {
    if (partsListing?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: partsListing?.length }));
    } else {
      setState((prevState) => ({ ...prevState, noData: 0 }));
    }
  }, [partsListing]);

  const getTableListData = (skip, take, obj, isPagination) => {
    setState((prevState) => ({ ...prevState, isLoader: true }));

    let constantFilterData = state.filterModel;
    dispatch(
      getPartDataList(skip, take, obj, isPagination, (res) => {
        setTimeout(() => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }, 300);

        if (res.status === 202) {
          setState((prevState) => ({ ...prevState, totalRecordCount: 0, pageNo: 0 }));
        } else if (res.status === 204 && (!res.data || res.data === "")) {
          setState((prevState) => ({ ...prevState, noData: true, tableData: [], pageNo: 0, totalRecordCount: 0 }))

        } else if (res.status === 200 && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setState((prevState) => ({ ...prevState, noData: false, tableData: Data, totalRecordCount: Data[0].TotalRecordCount }));
        }

        if (isPagination === false) {
          setState((prevState) => ({ ...prevState, disableFilter: false, disableDownload: false }));
          dispatch(disabledClass(false));
          setTimeout(() => {
            let button = document.getElementById(
              "Excel-Downloads-component-part"
            );
            button && button.click();
          }, 500);
        }

        if (res) {
          let isReset = true
          setTimeout(() => {
            for (var prop in state.floatingFilterData) {
              if (state.floatingFilterData[prop] !== "") {
                isReset = false
              }
            }
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData))
          }, 300);
        }
        setState((prevState) => ({
          ...prevState,
          totalRecordCount: res.data && res.data.DataList[0].TotalRecordCount || 0,
          tableData: res.data.DataList || [], noData: !res.data.DataList || res.data.DataList.length === 0, isFilterButtonClicked: false
        }))
      })
    );
  };




  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {  // <-- this may introduce asynchronous behavior
      if (partsListing?.length !== 0) {
        setState((prevState) => ({
          ...prevState, noData
            : searchNocontentFilter(value, state.noData), disableFilter: false
        }));
      }
    }, 500);


    const model = gridOptions?.api?.getFilterModel();

    setState((prevState) => ({
      ...prevState,
      filterModel: model,
    }))
    if (!state.isFilterButtonClicked) {
      setState((prevState) => ({
        ...prevState,
        warningMessage: true
      }))
    }
    if (
      value?.filterInstance?.appliedModel === null ||
      value?.filterInstance?.appliedModel?.filter === ""
    ) {
      let isFilterEmpty = true;
      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false;
          for (var property in state.floatingFilterData) {
            if (property === value.column.colId) {
              state.floatingFilterData[property] = "";
            }
          }
          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData
          }))
        }

        if (isFilterEmpty) {
          setState((prevState) => ({
            ...prevState,
            warningMessage: false
          }))
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData
          }))
        }
      }
    } else {
      if (
        value.column.colId === "EffectiveDate" ||
        value.column.colId === "CreatedDate"
      ) {
        return false;
      }
      setState((prevState) => ({
        ...prevState,
        floatingFilterData: {
          ...prevState.floatingFilterData,
          [value.column.colId]: value.filterInstance.appliedModel.filter
        }
      }))
    }
  };


  const onSearch = () => {
    setState((prevState) => ({ ...prevState, warningMessage: false, isFilterButtonClicked: true, pageNo: 1, pageNoNew: 1, currentRowIndex: 0 }));
    getTableListData(0, state.globalTake, state.floatingFilterData, true);
  };

  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
      warningMessage: false,

    }));
    dispatch(isResetClick(true, "Operation"));
    setState((prevState) => ({
      ...prevState,

      isFilterButtonClicked: false,
    }));
    setSearchText(''); // Clear the search text state
    if (state.gridApi) {
      state.gridApi.setQuickFilter(''); // Clear the Ag-Grid quick filter
    }
    state.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    setState((prevState) => ({
      ...prevState,
      floatingFilterData: state.floatingFilterData,
      warningMessage: false,
      pageNo: 1,
      pageNoNew: 1,
      currentRowIndex: 0,
    }));

    getTableListData(0, 10, state.floatingFilterData, true);
    dispatch(setSelectedRowForPagination([]));

    setState((prevState) => ({
      ...prevState,
      globalTake: 10,
      dataCount: 0,
      pageSize: {
        ...prevState.pageSize,
        pageSize10: true,
        pageSize50: false,
        pageSize100: false,
      },
    }));
    setSearchText(''); // Assuming this state is bound to the input value

  };

  const onBtPrevious = () => {
    const newPageNo = state.pageNo - 1;
    if (newPageNo > 0) {
      const skip = (newPageNo - 1) * state.globalTake;
      setState((prevState) => ({ ...prevState, pageNo: newPageNo }));
      getTableListData(skip, state.globalTake, state.floatingFilterData, true);
    }
  };

  const onBtNext = () => {
    const newPageNo = state.pageNo + 1;
    const totalPages = Math.ceil(state.totalRecordCount / state.globalTake);

    if (newPageNo <= totalPages) {
      const skip = (newPageNo - 1) * state.globalTake;
      setState((prevState) => ({ ...prevState, pageNo: newPageNo }));
      getTableListData(skip, state.globalTake, state.floatingFilterData, true);
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

    getTableListData(state.currentRowIndex, pageSize, state.floatingFilterData, true);
    setState((prevState) => ({
      ...prevState, globalTake: pageSize, pageNo: 1, pageNoNew: Math.min(state.pageNo, totalRecordCount),
      pageSize: {
        ...prevState.pageSize,
        pageSize10: pageSize === 10,
        pageSize50: pageSize === 50,
        pageSize100: pageSize === 100,
      },
    }));

    state.gridApi.paginationSetPageSize(Number(newPageSize));
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
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: ID }));
  };

  const confirmDeleteItem = (ID) => {


    const loggedInUser = loggedInUserId()
    dispatch(deletePart(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.PART_DELETE_SUCCESS);
        //getTableListData();
        getTableListData(state.currentRowIndex, defaultPageSize, state.floatingFilterData, true)
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }


  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  };
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
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
            onClick={() => viewOrEditItemDetails(cellValue, rowData)}
          />
        )}
        {permissions.View && (
          <button
            title="Edit"
            className="Edit mr-2"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, false)}
          />
        )}
        {permissions.Delete && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(ID.partId)}
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

    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;


    if (selectedRowForPagination?.length > 0) {


      selectedRowForPagination.map((item) => {

        if (item.PartId === props.node.data.PartId) {

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
    setState((prevState) => ({ ...prevState, isBulkUpload: true }));
  };

  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, isBulkUpload: false }));
    if (type !== "cancel") {
      resetState();
    }
  };

  const formToggle = () => {
    props.formToggle();
  };

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,
    }))
    params.api.paginationGoToPage(0);
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(true));

    let tempArr = selectedRowForPagination; // Assuming `selectedCostingListSimulation` is an array

    // let tempArr = state.gridApi && state.gridApi?.getSelectedRows()

    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, disableDownload: false }));
        dispatch(disabledClass(false));

        const button = document.getElementById(
          "Excel-Downloads-Component-part"
        );
        button?.click();
      }, 500);
    } else {
      getTableListData(0, defaultPageSize, state.floatingFilterData, false); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };


  const onBtExport = () => {

    let tempArr = [];
    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination;
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (partsListing ? partsListing : [])

    return returnExcelColumn(INDIVIDUALPART_DOWNLOAD_EXCEl, tempArr);
  };


  const returnExcelColumn = (data = [], TempData) => {


    let temp = [];
    temp = TempData && TempData.map((item) => {
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
    setSearchText(state.gridApi.setQuickFilter(e.target.value));
  }
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
    setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, newDate: date } }));

  };

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };

  const onRowSelected = (event) => {


    var selectedRows = state.gridApi && state.gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {
      selectedRows = selectedRowForPagination;

    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {

      let finalData = [];
      if (event.node.isSelected() === false) {
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].PartId === event.data.PartId
          ) {
            continue;
          }
          finalData.push(selectedRowForPagination[i]);
        }
      } else {
        finalData = selectedRowForPagination;
      }
      selectedRows = [...selectedRows, ...finalData];
    }

    let uniqeArrayPartId = _.uniqBy(selectedRows, (v) =>
      [v.PartId, v.PartId].join()
    );
    setState((prevState) => ({ ...prevState, dataCount: uniqeArrayPartId.length }));
    dispatch(setSelectedRowForPagination(uniqeArrayPartId)); //SETTING CHECKBOX STATE DATA IN REDUCER
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
    hyphenFormatter: hyphenFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    checkBoxRenderer: checkBoxRenderer,
  };
  return (
    <>
      <div
        className={`ag-grid-react custom-pagination ${permissions.Download ? "show-table-btn" : ""
          }`}
      >
        {state.isLoader && <LoaderCustom />}
        {state.disableDownload && (
          <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />
        )}
        <Row className="pt-4 no-filter-row">
          <Col md="9" className="search-user-block pr-0">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div className="warning-message d-flex align-items-center">
                {state.warningMessage && !state.disableDownload && (
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
                  disabled={state.disableFilter}
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
                    <button title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-1" ></div>
                      {/* DOWNLOAD */}
                      {`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                    </button>
                    <ExcelFile filename={'Component Part'} fileExtension={'.xls'} element={
                      <button id={'Excel-Downloads-component-part'} className="p-absolute" type="button" >
                      </button>}>
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
          className={`ag-grid-wrapper height-width-wrapper ${(partsListing && partsListing?.length <= 0) || state.noData
            ? "overlay-contain"
            : ""
            }`}
        >
          <div className="ag-grid-header">
            <input
              type="text"
              value={searchText}
              className="form-control table-search"
              id="filter-text-box"
              placeholder="Search"
              autoComplete={"off"}
              onChange={onFilterTextBoxChanged}
            />
          </div>
          <div
            className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}
          >
            {state.noData && (
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
                rowData={state.tableData}
                pagination={true}
                paginationPageSize={state.globalTake}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                onFilterModified={onFloatingFilterChanged}
                rowSelection={"multiple"}
                onRowSelected={onRowSelected}
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
                  cellRenderer={checkBoxRenderer}

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
                  field="EffectiveDate"
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
              </AgGridReact>}
            <div className="button-wrapper">
              {!state.isLoader && (
                <PaginationWrapper
                  gridApi={state.gridApi}
                  setPage={onPageSizeChanged}
                  globalTake={state.globalTake}
                />
              )}

              <div className="d-flex pagination-button-container">
                <p>
                  <button
                    className="previous-btn"
                    type="button"
                    disabled={state.pageNo === 1 ? true : false}
                    onClick={() => onBtPrevious()}
                  >
                    {" "}
                  </button>
                </p>
                {state?.pageSize?.pageSize10 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{state.pageNo}</span> of{" "}
                    {Math.ceil(state.totalRecordCount / 10)}
                  </p>
                )}
                {state?.pageSize?.pageSize50 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{state.pageNo}</span> of{" "}
                    {Math.ceil(state.totalRecordCount / 50)}
                  </p>
                )}
                {state?.pageSize?.pageSize100 && (
                  <p className="next-page-pg custom-left-arrow">
                    Page <span className="text-primary">{state.pageNo}</span> of{" "}
                    {Math.ceil(state.totalRecordCount / 100)}
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

        {state.isBulkUpload && (
          <BulkUpload
            isOpen={state.isBulkUpload}
            closeDrawer={closeBulkUploadDrawer}
            isEditFlag={false}
            fileName={"Part Component"}
            isZBCVBCTemplate={false}
            messageLabel={"Part"}
            anchor={"right"}
          />
        )}
        {state.showPopup && (
          <PopupMsgWrapper
            isOpen={state.showPopup}
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
