import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import {} from "../../../actions/Common";
import {
  getPartDataList,
  deletePart,
  activeInactivePartStatus,
  checkStatusCodeAPI,
} from "../actions/Part";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import Switch from "react-switch";
import { loggedInUserId } from "../../../helper/auth";
import BulkUpload from "../../massUpload/BulkUpload";
import { GridTotalFormate } from "../../common/TableGridFunctions";
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
import { MASTERS, PART } from "../../../config/constants";

import _ from "lodash";
import {
  onFloatingFilterChanged,
  onSearch,
  resetState,
  onBtPrevious,
  onBtNext,
  onPageSizeChanged,
  PaginationWrapper,
} from "../../common/commonPagination";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import { checkPermission, searchNocontentFilter } from "../../../helper";
import { disabledClass } from "../../../actions/Common";

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const IndivisualPartListing = (props) => {
  const dispatch = useDispatch();
  const [pageNo, setPageNo] = useState(1);
  const [gridApi, setGridApi] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [addAccessibility, setAddAccessibility] = useState(false);
  const [editAccessibility, setEditAccessibility] = useState(false);
  const [deleteAccessibility, setDeleteAccessibility] = useState(false);
  const [bulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
  const [downloadAccessibility, setDownloadAccessibility] = useState(false);
  const [dataCount, setDataCount] = useState(0);

  const [totalRecordCount, setTotalRecordCount] = useState(1);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [pageNoNew, setPageNoNew] = useState(1);
  const [globalTake, setGlobalTake] = useState(defaultPageSize);
  const [isLoader, setIsLoader] = useState(false);
  const [viewAccessibility, setViewAccessibility] = useState(false);
  const [disableDownload, setDisableDownload] = useState(false);

  const [noData, setNoData] = useState(false);

  //   const [dataCount, setDataCount] = useState(0);
  const [disableFilter, setDisableFilter] = useState(true); // STATE MADE FOR CHECKBOX SELECTION
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

  const [state, setState] = useState({
    isEditFlag: false,
    isOpen: false,
    tableData: [],
    startIndexCurrentPage: 0,
    endIndexCurrentPage: 9,
    isBulkUpload: false,
    ActivateAccessibility: true,
    showPopup: false,
    deletedId: "",
    noData: false,
  });
  const { topAndLeftMenuData } = useSelector((state) => state.auth);

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
  console.log(
    "selectedRowForPagination",
    selectedRowForPagination,
    selectedCostingListSimulation,
    partsListing,
    // productDataList,
    initialConfiguration
  );
  useEffect(() => {
    ApiActionCreator(0, defaultPageSize, {}, false);
    applyPermission(topAndLeftMenuData);
    return () => {
      dispatch(setSelectedRowForPagination([]));
    };
  }, []);

  useEffect(() => {
    setIsLoader(true);
    applyPermission(topAndLeftMenuData);
    setTimeout(() => {
      setIsLoader(false);
    }, 200);
  }, [topAndLeftMenuData]);
  useEffect(() => {
    if (partsListing?.length > 0) {
      setTotalRecordCount(partsListing[0].TotalRecordCount);
    } else {
      setNoData(false);
    }
  }, [partsListing]);

  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data =
        topAndLeftMenuData &&
        topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === PART);
      const permmisionData =
        accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionData !== undefined) {
        setAddAccessibility(
          permmisionData && permmisionData.Add ? permmisionData.Add : false
        );
        setEditAccessibility(
          permmisionData && permmisionData.Edit ? permmisionData.Edit : false
        );
        setDeleteAccessibility(
          permmisionData && permmisionData.Delete
            ? permmisionData.Delete
            : false
        );
        setBulkUploadAccessibility(
          permmisionData && permmisionData.BulkUpload
            ? permmisionData.BulkUpload
            : false
        );
        setDownloadAccessibility(
          permmisionData && permmisionData.Download
            ? permmisionData.Download
            : false
        );
      }
    }
  };

  const ApiActionCreator = (skip, take, obj, isPagination) => {
    setState({ isLoader: isPagination ? true : false });

    let constantFilterData = filterModel;
    let object = { ...floatingFilterData };
    dispatch(
      getPartDataList(skip, take, obj, isPagination, (res) => {
        setState({ isLoader: false });
        setState({ noData: false });
        if ((res && res.status === 204) || res.length === 0) {
          setTotalRecordCount(0);
          setPageNo(1);

          //   setState({ totalRecordCount: 0 });

          return;
        } else if (res.status === 204 && res.data === "") {
          setState({ tableData: [] });
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;

          setState({
            tableData: Data,
            // totalRecordCount: Data[0].TotalRecordCount,
          });
        }
        if (res && res.status === 204) {
          //   setState({ totalRecordCount: 0, pageNo: 0 });
        }

        if (res && isPagination === false) {
          setState({ disableDownload: false });
          dispatch(disabledClass(false));
          setTimeout(() => {
            let button = document.getElementById(
              "Excel-Downloads-component-part"
            );
            button && button.click();
          }, 500);
        }

        if (res) {
          if (res && res.data && res.data.DataList.length > 0) {
            setState({
              totalRecordCount: res.data.DataList[0].TotalRecordCount,
            });
          }
          let isReset = true;
          setTimeout(() => {
            for (var prop in object) {
              if (prop !== "DepartmentCode" && object[prop] !== "") {
                isReset = false;
              }
            }
            // Sets the filter model via the grid API
            isReset
              ? gridOptions?.api?.setFilterModel({})
              : gridOptions?.api?.setFilterModel(constantFilterData);
            setTimeout(() => {
              setState({ warningMessage: false });
            }, 23);
          }, 300);

          setTimeout(() => {
            setState({ warningMessage: false });
          }, 335);

          setTimeout(() => {
            setState({ isFilterButtonClicked: false });
          }, 600);
        }
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
    getTableListData(0, globalTake, true);
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
    getTableListData(0, 10, true);
    dispatch(setSelectedRowForPagination([]));
    setGlobalTake(10);
    setPageSize((prevState) => ({
      ...prevState,
      pageSize10: true,
      pageSize50: false,
      pageSize100: false,
    }));
    // setDataCount(0);
  };
  const onBtPrevious = () => {
    onBtPrevious(this, "Part"); //COMMON PAGINATION FUNCTION
  };

  const onBtNext = () => {
    if (pageSize.pageSize50 && pageNo >= Math.ceil(totalRecordCount / 50)) {
      return false;
    }

    if (pageSize.pageSize100 && pageNo >= Math.ceil(totalRecordCount / 100)) {
      return false;
    }

    if (currentRowIndex < totalRecordCount - 10) {
      setPageNo(pageNo + 1);
      setPageNoNew(pageNo + 1);
      const nextNo = currentRowIndex + 10;
      getTableListData(nextNo, globalTake, true);
      // skip, take, isPagination, floatingFilterData, (res)
      setCurrentRowIndex(nextNo);
    }
  };

  const onPageSizeChanged = (newPageSize) => {
    if (Number(newPageSize) === 10) {
      getTableListData(currentRowIndex, 10, true);
      setPageSize((prevState) => ({
        ...prevState,
        pageSize10: true,
        pageSize50: false,
        pageSize100: false,
      }));
      setGlobalTake(10);
      setPageNo(pageNoNew);
    } else if (Number(newPageSize) === 50) {
      getTableListData(currentRowIndex, 50, true);
      setPageSize((prevState) => ({
        ...prevState,
        pageSize50: true,
        pageSize10: false,
        pageSize100: false,
      }));
      setGlobalTake(50);
      setPageNo(pageNoNew);
      if (pageNo >= Math.ceil(totalRecordCount / 50)) {
        setPageNo(Math.ceil(totalRecordCount / 50));
        getTableListData(0, 50, true);
      }
    } else if (Number(newPageSize) === 100) {
      getTableListData(currentRowIndex, 100, true);
      setPageSize((prevState) => ({
        ...prevState,
        pageSize100: true,
        pageSize10: false,
        pageSize50: false,
      }));
      setGlobalTake(100);
      if (pageNo >= Math.ceil(totalRecordCount / 100)) {
        setPageNo(Math.ceil(totalRecordCount / 100));
        getTableListData(0, 100, true);
      }
    }

    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  // componentDidMount() {
  //     setTimeout(() => {
  //         if (!props.stopApiCallOnCancel) {
  //             ApiActionCreator(0, 100, floatingFilterData, true)
  //         }
  //     }, 200);
  // }

  //   Get updated list after any action performed.
  const getUpdatedData = () => {
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
        setState(() => {
          getTableListData();
        });
      }
    }, 200);
  };

  const getTableListData = () => {
    setState({ isLoader: true });
    dispatch(
      getPartDataList((res) => {
        setState({ isLoader: false });
        setState({ noData: false });
        if (res.status === 204 && res.data === "") {
          setState({ tableData: [] });
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setState({
            tableData: Data,
          });
        } else {
        }
      })
    );
  };

  const viewOrEditItemDetails = (Id, isViewMode) => {
    let requestData = {
      isEditFlag: true,
      Id: Id,
      isViewMode: isViewMode,
    };
    props.getDetails(requestData);
  };

  const deleteItem = (Id) => {
    setState({ showPopup: true, deletedId: Id });
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
    confirmDeleteItem(state.deletedId);
  };
  const closePopUp = () => {
    setState({ showPopup: false });
  };

  console.log(viewAccessibility, "set");
  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;
    let obj = {};
    obj.partId = rowData.PartId;
    obj.partApprovedId = rowData.PartApprovedId;
    obj.partBudgetedId = rowData.PartBudgetedId;

    return (
      <>
        {viewAccessibility && (
          <button
            title="View"
            className="View"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, true)}
          />
        )}
        {editAccessibility && (
          <button
            title="Edit"
            className="Edit mr-2"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, rowData)}
          />
        )}
        {deleteAccessibility && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(obj)}
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
  //   const renderEffectiveDate = () => {
  //     return (
  //       <>
  //         {" "}
  //         Effective <br /> Date{" "}
  //       </>
  //     );
  //   };

  //   const onExportToCSV = (row) => {
  //     return state.userData; // must return the data which you want to be exported
  //   };

  //   const renderPaginationShowsTotal = (start, to, total) => {
  //     return <GridTotalFormate start={start} to={to} total={total} />;
  //   };

  const bulkToggle = () => {
    setState({ isBulkUpload: true });
  };

  const closeBulkUploadDrawer = (event, type) => {
    setState({ isBulkUpload: false });
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
      setState({ disableDownload: true });
      dispatch(disabledClass(false));

      //let tempArr = gridApi && gridApi?.getSelectedRows()
      let tempArr = props.selectedCostingListSimulation;
      if (tempArr?.length > 0) {
        setTimeout(() => {
          setState({ disableDownload: false });
          dispatch(disabledClass(false));
          let button = document.getElementById("Excel-Downloads-component-part");
          button && button.click();
        }, 400);
      } else {
        ApiActionCreator(0, defaultPageSize, floatingFilterData, false); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
      }
    };

  const onBtExport = () => {
    let tempArr = [];
    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = props.selectedRowForPagination;
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : productDataList
        ? productDataList
        : [];
    return returnExcelColumn(INDIVIDUALPART_DOWNLOAD_EXCEl, tempArr);
  };

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
    gridApi.setQuickFilter(e.target.value);
  };

  /**
   * @method render
   * @description Renders the component
   */

  const { isBulkUpload } = state;
  const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } =
    props;
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
    setState({
      floatingFilterData: { ...floatingFilterData, newDate: date },
    });
  };

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };

  const onRowSelect = (event) => {
    var selectedRows = gridApi && gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {
      //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination;
    } else if (
      selectedRowForPagination &&
      selectedRowForPagination.length > 0
    ) {
      // CHECKING IF REDUCER HAS DATA
      let finalData = [];
      if (event.node.isSelected() === false) {
        // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (
            selectedRowForPagination[i].VolumeApprovedId ===
              event.data.VolumeApprovedId &&
            selectedRowForPagination[i].VolumeBudgetedId ===
              event.data.VolumeBudgetedId
          ) {
            // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i]);
        }
      } else {
        finalData = selectedRowForPagination;
      }
      selectedRows = [...selectedRows, ...finalData];
    }

    let uniqeArrayVolumeBudgetedId = _.uniqBy(selectedRows, (v) =>
      [v.VolumeApprovedId, v.VolumeBudgetedId].join()
    ); //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArrayVolumeBudgetedId)); //SETTING CHECKBOX STATE DATA IN REDUCER
    // setDataCount(uniqeArrayVolumeBudgetedId.length);
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
        className={`ag-grid-react custom-pagination ${
          DownloadAccessibility ? "show-table-btn" : ""
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
                {state.warningMessage && !disableDownload && (
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
                {AddAccessibility && (
                  <button
                    type="button"
                    className={"user-btn mr5"}
                    title="Add"
                    onClick={formToggle}
                  >
                    <div className={"plus mr-0"}></div>
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
                {/* {DownloadAccessibility && (
                  <>
                    <button
                      title={`Download ${
                        state.dataCount === 0
                          ? "All"
                          : "(" + state.dataCount + ")"
                      }`}
                      type="button"
                      onClick={onExcelDownload}
                      className={"user-btn mr5"}
                    >
                      <div className="download mr-1"></div>
                      {`${
                        state.dataCount === 0
                          ? "All"
                          : "(" + state.dataCount + ")"
                      }`}
                    </button>
                    <ExcelFile
                      filename={"Component Part"}
                      fileExtension={".xls"}
                      element={
                        <button
                          id={"Excel-Downloads-component-part"}
                          className="p-absolute"
                          type="button"
                        ></button>
                      }
                    >
                      {onBtExport()}
                    </ExcelFile>
                  </>
                )
                } */}
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
              rowData={partsListing}
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
                  {/* <button
                    className="previous-btn"
                    type="button"
                    disabled={pageNo === 1 ? true : false}
                    onClick={() => onBtPrevious(this)}
                  >
                    {" "}
                  </button> */}
                  <p>
                    <button
                      className="previous-btn"
                      type="button"
                      disabled={false}
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
