import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { isResetClick } from "../../../actions/Common";
import { getPartDataList, deletePart, activeInactivePartUser } from "../actions/Part";
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
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { updateGlobalTake, updatePageNumber, updatePageSize, updateCurrentRowIndex, resetStatePagination } from "../../common/Pagination/paginationAction";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import { getConfigurationKey, loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
import { disabledClass } from "../../../actions/Common";
import { ApplyPermission } from ".";
import Button from "../../layout/Button";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { showTitleForActiveToggle } from '../../../../src/helper/util';
import Switch from "react-switch";
import { useLabels, useWithLocalization } from "../../../helper/core";
import { divisionApplicableFilter } from "../masterUtil";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const IndivisualPartListing = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("common")

  const [state, setState] = useState({
    // pageNo: 1,
    gridApi: null,
    showPopup: false,
    gridColumnApi: null,
    dataCount: 0,
    totalRecordCount: 0,
    // currentRowIndex: 0,
    // pageNoNew: 1,
    // globalTake: defaultPageSize,
    isLoader: true,
    disableDownload: false,
    noData: false,
    disableFilter: true,
    filterModel: {},
    warningMessage: false,
    searchText: "",
    isFilterButtonClicked: false,
    // : { pageSize10: true, pageSize50: false, pageSize100: false, },
    floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "", NEPNumber: "", PartFamily: "", PartsModelMaster: "" },
    tableData: [],
    isBulkUpload: false,
    deletedId: "",
    render: false,
    showExtraData: false,
    rowData: null,
    row: [],
    cell: [],
    showPopupToggle: false,
    showPopupToggle2: false,
  });
  const { technologyLabel, revisionNoLabel, drawingNoLabel } = useLabels();
  const [searchText, setSearchText] = useState('');
  const { newPartsListing, allNewPartsListing } = useSelector((state) => state.part);
  const { initialConfiguration } = useSelector((state) => state.auth);
  const { currentRowIndex, globalTakes } = useSelector((state) => state.pagination);
  const PartMasterConfigurable = initialConfiguration?.PartAdditionalMasterFields
  const [skipRecord, setSkipRecord] = useState(0)
  const { selectedRowForPagination } = useSelector((state) => state.simulation);
  const permissions = useContext(ApplyPermission);
  useEffect(() => {
    getTableListData(0, defaultPageSize, state.floatingFilterData, true);
    return () => {
      dispatch(setSelectedRowForPagination([]))
      dispatch(resetStatePagination());
      ;
    };
  }, []);

  useEffect(() => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, isLoader: false }));
    }, 200);
  }, []);
  useEffect(() => {
    if (newPartsListing?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: newPartsListing?.length }));
    } else {
      setState((prevState) => ({ ...prevState, noData: 0 }));
    }
  }, [newPartsListing]);

  const getTableListData = (skip, take, obj, isPagination) => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    setSkipRecord(skip);
    let constantFilterData = state.filterModel;
    dispatch(
      getPartDataList(skip, take, obj, isPagination, (res) => {
        setTimeout(() => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }, 300);
        setState((prevState) => ({ ...prevState, noData: false }));

        if (res.status === 202) {
          setState((prevState) => ({
            ...prevState, totalRecordCount: 0,
            // pageNo: 0
          }));
          dispatch(updatePageNumber(0));
        } else if (res.status === 204 && (!res.data || res.data === "")) {
          setState((prevState) => ({
            ...prevState, /* noData: true, */ tableData: [],
            // pageNo: 0, 
            totalRecordCount: 0, isFilterButtonClicked: false
          }))
          dispatch(updatePageNumber(0));

        } else if (res.status === 200 && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setState((prevState) => ({ ...prevState, /* noData: false, */ tableData: Data, totalRecordCount: Data[0].TotalRecordCount, isFilterButtonClicked: false }));
        }

        if (isPagination === false) {
          setState((prevState) => ({ ...prevState, disableDownload: false }));
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
            setTimeout(() => {
              setState((prevState) => ({ ...prevState, warningMessage: false }));
            }, 23);
          }, 300);
        }

        setState((prevState) => ({
          ...prevState,
          totalRecordCount: (res.data && res.data.DataList && res.data.DataList[0]?.TotalRecordCount) || 0,
          tableData: res.data?.DataList || [],
          isFilterButtonClicked: false
        }));

        setTimeout(() => {
          setState((prevState) => ({
            ...prevState, isFilterButtonClicked: false,
          }));
        }, 600);
      })
    );
  };




  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {  // <-- this may introduce asynchronous behavior
      if (newPartsListing?.length !== 0) {
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), disableFilter: false,totalRecordCount: state?.gridApi?.getDisplayedRowCount() }));
      }
    }, 500);
    setState((prevState) => ({ ...prevState, disableFilter: false }));


    const model = gridOptions?.api?.getFilterModel();

    setState((prevState) => ({ ...prevState, filterModel: model, }))
    if (!state.isFilterButtonClicked) {

      setState((prevState) => ({ ...prevState, warningMessage: true }))
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
    setState((prevState) => ({
      ...prevState, warningMessage: false,
      //  pageNo: 1, pageNoNew: 1, currentRowIndex: 0 
    }));
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(0))
    getTableListData(0, globalTakes, state.floatingFilterData, true);
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
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(0))
    setState((prevState) => ({
      ...prevState,
      floatingFilterData: state.floatingFilterData,
      warningMessage: false,
      // pageNo: 1,
      // pageNoNew: 1,
      // currentRowIndex: 0,
    }));

    getTableListData(0, 10, state.floatingFilterData, true);
    dispatch(setSelectedRowForPagination([]));
    dispatch(updateGlobalTake(10))
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))
    setState((prevState) => ({
      ...prevState,
      // globalTake: 10,
      dataCount: 0,
      // pageSize: {
      //   ...prevState.pageSize,
      //   pageSize10: true,
      //   pageSize50: false,
      //   pageSize100: false,
      // },
    }));
    setSearchText(''); // Assuming this state is bound to the input value

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
      if (res?.data?.Result) {
        dispatch(setSelectedRowForPagination([]));
        if (state?.gridApi) {
          state?.gridApi?.deselectAll();
        }
        Toaster.success(MESSAGES.PART_DELETE_SUCCESS);
        getTableListData(skipRecord, globalTakes, state?.floatingFilterData, true)
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false, }))
  }


  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  };
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const handleChange = (cell, row) => {
    setState((prevState) => ({ ...prevState, showPopupToggle: true, row: row, cell: cell }))
  }

  /**
      * @method statusButtonFormatter
      * @description Renders buttons
      */

  const statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive');
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch Tour_List_Status">
          <Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!permissions.Activate} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
        </label>
      </>
    )
  }
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
            className="View Tour_List_View mr-2"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, rowData)}
          />
        )}
        {permissions.View && (
          <button
            title="Edit"
            className="Edit mr-2 Tour_List_Edit"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, false)}
          />
        )}
        {permissions.Delete && (
          <button
            title="Delete"
            className="Delete Tour_List_Delete"
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

    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
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
   * @method onPopupToggleConfirm
   * @description popup for toggle status
   */
  const onPopupToggleConfirm = () => {
    let data = { Id: state.row.PartId, LoggedInUserId: loggedInUserId(), IsActive: !state.cell, }
    dispatch(activeInactivePartUser(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (Boolean(state.cell) === true) {
          Toaster.success(MESSAGES.PART_INACTIVE_SUCCESSFULLY)
        } else {
          Toaster.success(MESSAGES.PART_ACTIVE_SUCCESSFULLY)

        }
        getTableListData(skipRecord, globalTakes, state.floatingFilterData, true)
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
      }
    }))
    setState((prevState) => ({ ...prevState, showPopupToggle: false }))
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }))

  }

  /**
    * @method closeTogglePopup
    * @description used for closing status toggle popup
    */
  const closeTogglePopup = () => {
    setState((prevState) => ({ ...prevState, showPopupToggle: false }))
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }))
  }

  /**
   * @method effectiveDateFormatter
   * @description Renders buttons
   */
  const effectiveDateFormatter = (props) => {
    if (state?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted
        ? props.valueFormatted
        : props?.value;

      return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
      // return cellValue != null ? cellValue : '';
    }
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
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }))
    params.api.paginationGoToPage(0);
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
  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(true));

    let tempArr = selectedRowForPagination; // Assuming `selectedRowForPagination` is an array


    // let tempArr = state.gridApi && state.gridApi?.getSelectedRows()

    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => { return { ...prevState, disableDownload: false }; });
        dispatch(disabledClass(false));
        let button = document.getElementById("Excel-Downloads-component-part");
        button && button.click();
      }, 500);
    } else {
      getTableListData(0, defaultPageSize, state.floatingFilterData, false); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };

  const INDIVIDUALPART_DOWNLOAD_EXCEL_LOCALIZATION = useWithLocalization(divisionApplicableFilter(INDIVIDUALPART_DOWNLOAD_EXCEl, "Division"), "MasterLabels")
  const onBtExport = () => {

    let tempArr = [];
    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination;
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : allNewPartsListing ? allNewPartsListing : []
    const filteredLabels = INDIVIDUALPART_DOWNLOAD_EXCEL_LOCALIZATION.filter(column => {
      if (column.value === "UnitOfMeasurement") {
        return initialConfiguration?.IsShowUnitOfMeasurementInPartMaster
      }
      if (column.value === "SAPCode") {
        return initialConfiguration?.IsSAPCodeRequired
      }
      if (column.value === "PartFamily") {
        return PartMasterConfigurable?.IsShowPartFamily
    }
    // Check for Part Model
    if (column.value === "PartsModelMaster") {
        return PartMasterConfigurable?.IsShowPartModel
    }
    // Check for NEP Number
    if (column.value === "NEPNumber") {
        return PartMasterConfigurable?.IsShowNepNumber
    }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr);


  };


  const returnExcelColumn = (data = [], TempData) => {

    let excelData = [...data];

    let temp = [];
    temp = TempData && TempData.map((item) => {
      let newItem = { ...item };
      const defaultValues = {
        ECNNumber: " ",
        RevisionNumber: " ",
        DrawingNumber: " ",
        Technology: " ",
      };

      // Assign default values if necessary
      Object.keys(defaultValues).forEach(key => {
        if (item[key] === null || item[key] === "-") {
          newItem[key] = defaultValues[key];
        }
      });

      ["EffectiveDate", "EffectiveDateNew"].forEach(dateKey => {
        if (item[dateKey]) {
          newItem[dateKey] = DayTime(item[dateKey]).format("DD/MM/YYYY");
        }
      });
      newItem.IsActive = item.IsActive ? 'Active' : 'Inactive';
      return newItem;
    });

    return (

      <ExcelSheet data={temp} name={ComponentPart}>
        {excelData &&
          excelData.map((ele, index) => (

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

    var selectedRows = state.gridApi.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {   //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA

      let finalData = []
      if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].PartId === event.data.PartId) {     // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i])
        }

      } else {
        finalData = selectedRowForPagination
      }
      selectedRows = [...selectedRows, ...finalData]
    }


    let uniqeArray = _.uniqBy(selectedRows, "PartId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray))                     //SETTING CHECKBOX STATE DATA IN REDUCER
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length }));
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }))


  }
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
    statusButtonFormatter: statusButtonFormatter,
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
                  className="user-btn mr5 Tour_List_Filter"
                  onClick={() => onSearch()}
                  disabled={state.disableFilter}
                >
                  <div className="filter mr-0"></div>
                </button>
                {permissions.Add && (
                  <button
                    type="button"
                    className={"user-btn mr5 Tour_List_Add"}
                    title="Add"
                    onClick={formToggle}
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                )}
                {permissions.BulkUpload && (
                  <button
                    type="button"
                    className={"user-btn mr5 Tour_List_BulkUpload"}
                    onClick={bulkToggle}
                    title="Bulk Upload"
                  >
                    <div className={"upload mr-0"}></div>
                  </button>
                )}
                {permissions.Download && (
                  <>
                    <Button className="mr5 Tour_List_Download" id={"individualPartListing_excel_download"} onClick={onExcelDownload} disabled={state?.totalRecordCount === 0} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                    />
                    <ExcelFile filename={'Component Part'} fileExtension={'.xls'} element={<Button id={"Excel-Downloads-component-part"} className="p-absolute" />}>
                      {onBtExport()}
                    </ExcelFile>
                  </>

                )}

                <button
                  type="button"
                  className="user-btn Tour_List_Reset"

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
          className={`ag-grid-wrapper height-width-wrapper ${(newPartsListing && newPartsListing?.length <= 0) || state.noData
            ? "overlay-contain"
            : ""
            }`}
        >
          <div className="ag-grid-header">
            <input type="text" value={searchText} className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={onFilterTextBoxChanged} />
            <TourWrapper
              buttonSpecificProp={{ id: "Indivisual_Part_Listing_Tour", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { addLimit: false, costMovementButton: false, updateAssociatedTechnology: false, copyButton: false, viewBOM: false, status: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
              }} />
          </div>
          <div
            className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}
          >
            {(state.noData && newPartsListing.length !== 0) ? (
              <NoContentFound
                title={EMPTY_DATA}
                customClassName="no-content-found"
              />
            ) : <></>}
            {!state.isLoader &&
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                rowData={state.showExtraData && newPartsListing ? [...setLoremIpsum(newPartsListing[0]), ...newPartsListing] : newPartsListing}

                pagination={true}
                paginationPageSize={globalTakes}
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
                <AgGridColumn field="Technology" headerName={technologyLabel} cellRenderer={checkBoxRenderer} ></AgGridColumn>
                <AgGridColumn field="PartNumber" headerName="Part No." ></AgGridColumn>
                <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                {initialConfiguration?.IsSAPCodeRequired && (
                  <AgGridColumn field="SAPCode" headerName="SAP Code" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>
                )}
                <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                <AgGridColumn field="RevisionNumber" headerName={revisionNoLabel} cellRenderer={"hyphenFormatter"}  ></AgGridColumn>
                <AgGridColumn field="DrawingNumber" headerName={drawingNoLabel} cellRenderer={"hyphenFormatter"}  ></AgGridColumn>
                {PartMasterConfigurable?.IsShowPartModel && <AgGridColumn field="PartsModelMaster" headerName="Parts Model" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                {PartMasterConfigurable?.IsShowPartFamily && <AgGridColumn field="PartFamily" headerName="Part Family (Code)" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                {PartMasterConfigurable?.IsShowNepNumber && <AgGridColumn field="NEPNumber" headerName="NEP No." cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                {initialConfiguration?.IsShowUnitOfMeasurementInPartMaster && <AgGridColumn field="UnitOfMeasurementSymbol" headerName="UOM" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>}
                {getConfigurationKey()?.IsDivisionAllowedForDepartment && <AgGridColumn field="Division" headerName="Division" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>}
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>
                <AgGridColumn pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={"statusButtonFormatter"} ></AgGridColumn>
                <AgGridColumn field="PartId" pinned="right" cellClass="ag-grid-action-container" headerName="Action" width={160} type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"} ></AgGridColumn>
              </AgGridReact>}
            <div className="button-wrapper">
              {!state.isLoader && (
                <PaginationWrappers gridApi={state.gridApi} totalRecordCount={state.totalRecordCount} getDataList={getTableListData} floatingFilterData={state.floatingFilterData} module="Part" />
              )}
              <PaginationControls
                totalRecordCount={state.totalRecordCount}
                getDataList={getTableListData}
                floatingFilterData={state.floatingFilterData}
                module="Part"
              />

            </div>
          </div>
        </div>

        {state.isBulkUpload && (
          <BulkUpload isOpen={state.isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={"Part Component"} isZBCVBCTemplate={false} messageLabel={"Part"} anchor={"right"} />
        )}
        {state.showPopup && (
          <PopupMsgWrapper
            isOpen={state.showPopup}
            closePopUp={closePopUp}
            confirmPopup={onPopupConfirm}
            message={`${MESSAGES.CONFIRM_DELETE}`}
          />
        )}
        {state.showPopupToggle && (
          <PopupMsgWrapper
            isOpen={state.showPopupToggle}
            closePopUp={closeTogglePopup}
            confirmPopup={onPopupToggleConfirm}
            message={`${state.cell ? MESSAGES.PART_DEACTIVE_ALERT : MESSAGES.PART_ACTIVE_ALERT}`} />)}
      </div>
    </>
  );
};
export default IndivisualPartListing;
