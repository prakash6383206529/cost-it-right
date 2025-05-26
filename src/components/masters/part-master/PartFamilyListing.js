import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { isResetClick } from "../../../actions/Common";
import { getPartDataList, deletePart, activeInactivePartUser, getPartFamilyList, deletePartFamily, activeInactivePartFamily } from "../actions/Part";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { ComponentPart } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { INDIVIDUALPART_DOWNLOAD_EXCEl, PART_FAMILY_DOWNLOAD_EXCEl } from "../../../config/masterData";
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
import { loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
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
import PartFamilyDrawer from "./AddPartFamily";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const PartFamilyListing = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation("common")

  const [state, setState] = useState({
    gridApi: null,
    showPopup: false,
    gridColumnApi: null,
    dataCount: 0,
    totalRecordCount: 0,
    isLoader: true,
    disableDownload: false,
    noData: false,
    disableFilter: true,
    filterModel: {},
    warningMessage: false,
    searchText: "",
    isFilterButtonClicked: false,
    floatingFilterData: { PartFamilyCode: "", PartFamilyName: "", description: "", effectiveDate: "" },
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
    isOpen: false,
    isEditFlag: false,
    isViewFlag: false
  });
  const [searchText, setSearchText] = useState('');
  const { partFamilyList, allPartFamilyList } = useSelector((state) => state.part);
  const { initialConfiguration } = useSelector((state) => state.auth);

  const { currentRowIndex, globalTakes } = useSelector((state) => state.pagination);
  const [skipRecord, setSkipRecord] = useState(0);
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
    if (partFamilyList?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: partFamilyList?.length }));
    } else {
      setState((prevState) => ({ ...prevState, noData: 0 }));
    }
  }, [partFamilyList]);

  const getTableListData = (skip, take, obj, isPagination) => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    setSkipRecord(skip);
    let constantFilterData = state.filterModel;
    dispatch(
      getPartFamilyList(skip, take, obj, isPagination, (res) => {
        setTimeout(() => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }, 300);
        setState((prevState) => ({ ...prevState, noData: false }));

        if (res.status === 202) {
          setState((prevState) => ({
            ...prevState, totalRecordCount: 0,
          }));
          dispatch(updatePageNumber(0));
        } else if (res.status === 204 && (!res.data || res.data === "")) {
          setState((prevState) => ({
            ...prevState, tableData: [],
            totalRecordCount: 0, isFilterButtonClicked: false
          }));
          dispatch(updatePageNumber(0));
        } else if (res.status === 200 && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setState((prevState) => ({
            ...prevState,
            tableData: Data,
            totalRecordCount: Data[0]?.TotalRecordCount || 0,
            isFilterButtonClicked: false
          }));
        }

        if (isPagination === false) {
          setState((prevState) => ({ ...prevState, disableDownload: false }));
          dispatch(disabledClass(false));
          setTimeout(() => {
            let button = document.getElementById("Excel-Downloads-part-family");
            button && button.click();
          }, 500);
        }
        if (res) {
          let isReset = true;
          setTimeout(() => {
            for (var prop in state.floatingFilterData) {
              if (state.floatingFilterData[prop] !== "") {
                isReset = false;
              }
            }
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData));
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
    setTimeout(() => {
      if (partFamilyList?.length !== 0) {
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
          disableFilter: false,
          totalRecordCount: state?.gridApi?.getDisplayedRowCount()
        }));
      }
    }, 500);
    setState((prevState) => ({ ...prevState, disableFilter: false }));

    const model = gridOptions?.api?.getFilterModel();

    setState((prevState) => ({ ...prevState, filterModel: model }));

    if (!state.isFilterButtonClicked) {
      setState((prevState) => ({ ...prevState, warningMessage: true }));
    }

    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
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
          }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({
            ...prevState,
            warningMessage: false
          }));
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData
          }));
        }
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        floatingFilterData: {
          ...prevState.floatingFilterData,
          [value.column.colId]: value.filterInstance.appliedModel.filter
        }
      }));
    }
  };


  const onSearch = () => {
    setState((prevState) => ({
      ...prevState, warningMessage: false, noData: false, isFilterButtonClicked: true
    }));
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(0));
    getTableListData(0, globalTakes, state.floatingFilterData, true);
  };

  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
      warningMessage: false,
    }));
    dispatch(isResetClick(true, "PartFamily"));
    setState((prevState) => ({
      ...prevState,
      isFilterButtonClicked: false,
    }));
    setSearchText('');
    if (state.gridApi) {
      state.gridApi.setQuickFilter('');
    }
    state.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(0));
    setState((prevState) => ({
      ...prevState,
      floatingFilterData: state.floatingFilterData,
      warningMessage: false,
    }));

    getTableListData(0, 10, state.floatingFilterData, true);
    dispatch(setSelectedRowForPagination([]));
    dispatch(updateGlobalTake(10));
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }));
    setState((prevState) => ({
      ...prevState,
      dataCount: 0,
    }));
    setSearchText('');
  };

  const viewOrEditItemDetails = (Id, isViewMode) => {
    setState((prevState) => ({
      ...prevState,
      isOpen: true,
      isEditFlag: true,
      ID: Id,
      isViewFlag: isViewMode
    }));
  };

  const deleteItem = (ID) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: ID }));
  };

  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(deletePartFamily(ID, loggedInUser, (res) => {
      if (res?.data?.Result) {
        dispatch(setSelectedRowForPagination([]));
        if (state?.gridApi) {
          state?.gridApi?.deselectAll();
        }
        Toaster.success("Part family deleted successfully");
        getTableListData(skipRecord, globalTakes, state?.floatingFilterData, true);
        setState((prevState) => ({ ...prevState, dataCount: 0 }));
      }
    }));
    getTableListData(0, defaultPageSize, state.floatingFilterData, true);
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  };

  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const handleChange = (cell, row) => {
    setState((prevState) => ({ ...prevState, showPopupToggle: true, row: row, cell: cell }));
  };


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
    const isAssociated = rowData?.IsAssociated;
    return (
      <>
        {permissions.View && (
          <button
            title="View"
            className="View Tour_List_View mr-2"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, true)}
          />
        )}
        {isAssociated && (
          <>
            {permissions.Edit && (
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
                onClick={() => deleteItem(rowData.PartFamilyId)}
              />
            )}
          </>
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
        if (item.PartFamilyId === props.node.data.PartFamilyId) {
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
        if (item.PartFamilyId === props.node.data.PartFamilyId) {
          props.node.setSelected(true);
        }
        return null;
      });
      return cellValue;
    } else {
      return cellValue;
    }
  };

  const onPopupToggleConfirm = () => {
    let data = {
      Id: state.row.PartFamilyId,
      LoggedInUserId: loggedInUserId(),
      IsActive: !state.cell
    };

    dispatch(activeInactivePartFamily(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (Boolean(state.cell) === true) {
          Toaster.success(MESSAGES.PART_FAMILY_INACTIVE_SUCCESSFULLY);
        } else {
          Toaster.success(MESSAGES.PART_FAMILY_ACTIVE_SUCCESSFULLY);
        }
        getTableListData(currentRowIndex, defaultPageSize, state.floatingFilterData, true);
        setState((prevState) => ({ ...prevState, dataCount: 0 }));
      }
    }));
    setState((prevState) => ({ ...prevState, showPopupToggle: false }));
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }));
  };

  const closeTogglePopup = () => {
    setState((prevState) => ({ ...prevState, showPopupToggle: false }));
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }));
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

  const openModel = useCallback(() => {
    setState((prev) => ({
      ...prev, isOpen: true, isEditFlag: false,
    }));
  }, []);

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi
    }));
    params.api.sizeColumnsToFit();
    params.api.paginationGoToPage(0);
  };

  const toggleExtraData = (showTour) => {
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
    }, 100);
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(true));

    let tempArr = selectedRowForPagination;

    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => { return { ...prevState, disableDownload: false }; });
        dispatch(disabledClass(false));
        let button = document.getElementById("Excel-Downloads-part-family");
        button && button.click();
      }, 500);
    } else {
      getTableListData(0, defaultPageSize, state.floatingFilterData, false);
    }
  };
  const PART_FAMILY_DOWNLOAD_EXCEL = useWithLocalization(divisionApplicableFilter(PART_FAMILY_DOWNLOAD_EXCEl, "Division"), "MasterLabels")
  const onBtExport = () => {
    let tempArr = [];
    tempArr = selectedRowForPagination;
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : allPartFamilyList ? allPartFamilyList : [];

    return returnExcelColumn(PART_FAMILY_DOWNLOAD_EXCEL, tempArr);
  };

  const returnExcelColumn = (data = [], TempData) => {
    let excelData = [...data];
    let temp = [];

    temp = TempData && TempData.map((item) => {
      let newItem = { ...item };
      newItem.IsActive = item.IsActive ? 'Active' : 'Inactive';
      return newItem;
    });

    return (
      <ExcelSheet data={temp} name="Part Family">
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
  };

  const ExcelFile = ReactExport.ExcelFile;

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };

  const onRowSelected = (event) => {
    var selectedRows = state.gridApi.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {
      selectedRows = selectedRowForPagination;
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {
      let finalData = [];
      if (event.node.isSelected() === false) {
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].PartFamilyId === event.data.PartFamilyId) {
            continue;
          }
          finalData.push(selectedRowForPagination[i]);
        }
      } else {
        finalData = selectedRowForPagination;
      }
      selectedRows = [...selectedRows, ...finalData];
    }

    let uniqeArray = _.uniqBy(selectedRows, "PartFamilyId");
    dispatch(setSelectedRowForPagination(uniqeArray));
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length }));
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));
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
    checkBoxRenderer: checkBoxRenderer,
    statusButtonFormatter: statusButtonFormatter,
  };

  return (
    <>
      <div
        className={`ag-grid-react custom-pagination ${permissions.Download ? "show-table-btn" : ""}`}
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
                      message={"Please click on filter button to filter all data"}
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
                    onClick={openModel}
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
                    <Button
                      className="mr5 Tour_List_Download"
                      id={"partFamilyListing_excel_download"}
                      onClick={onExcelDownload}
                      disabled={state?.totalRecordCount === 0}
                      title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                      icon={"download mr-1"}
                      buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                    />
                    <ExcelFile
                      filename={'Part Family'}
                      fileExtension={'.xls'}
                      element={<Button id={"Excel-Downloads-part-family"} className="p-absolute" />}
                    >
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
          className={`ag-grid-wrapper  height-width-wrapper ${(partFamilyList && partFamilyList?.length <= 0) || state.noData
            ? "overlay-contain"
            : ""}`}
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

            {/* <TourWrapper
              buttonSpecificProp={{ id: "Part_Family_Listing_Tour", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { 
                  addLimit: false, 
                  costMovementButton: false, 
                  updateAssociatedTechnology: false, 
                  copyButton: false, 
                  viewBOM: false, 
                  status: false, 
                  addMaterial: false, 
                  addAssociation: false, 
                  generateReport: false, 
                  approve: false, 
                  reject: false 
                }).COMMON_LISTING
              }} 
            /> */}
          </div>
          <div
            className={`ag-grid-wrapper overlay-contain height-width-wrapper ${(partFamilyList && partFamilyList?.length <= 0) || state?.noData
              ? "overlay-contain"
              : ""
              }`}
          >


            <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
              {state.noData ? (
                <NoContentFound
                  title={EMPTY_DATA}
                  customClassName="no-content-found"
                />
              ) : <></>}
              {!state.isLoader &&
                <AgGridReact
                  // className="ag-theme-material"
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout="autoHeight"
                  rowData={state.showExtraData && partFamilyList ? [...setLoremIpsum(partFamilyList[0]), ...partFamilyList] : partFamilyList}
                  // pagination={true}
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
                  <AgGridColumn field="PartFamilyCode" headerName="Part Family Code" cellRenderer={checkBoxRenderer} />
                  <AgGridColumn field="PartFamilyName" headerName="Part Family Name" />
                  <AgGridColumn pinned="right" cellClass="ag-grid-action-container" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={"statusButtonFormatter"} />
                  <AgGridColumn
                    field="PartFamilyId"
                    pinned="right"
                    cellClass="ag-grid-action-container"
                    headerName="Action"
                    width={160}
                    type="rightAligned"
                    floatingFilter={false}
                    cellRenderer={"totalValueRenderer"}
                  />
                </AgGridReact>}
              <div className="button-wrapper">
                {!state.isLoader && (
                  <PaginationWrappers
                    gridApi={state.gridApi}
                    totalRecordCount={state.totalRecordCount}
                    getDataList={getTableListData}
                    floatingFilterData={state.floatingFilterData}
                    module="PartFamily"
                  />
                )}

                <PaginationControls
                  totalRecordCount={state.totalRecordCount}
                  getDataList={getTableListData}
                  floatingFilterData={state.floatingFilterData}
                  module="PartFamily"
                />
              </div>
            </div>
          </div>
        </div>
        {state.isOpen && (
          <PartFamilyDrawer
            isOpen={state.isOpen}
            anchor="right"
            onClose={() => setState((prev) => ({ ...prev, isOpen: false }))}
            isEditFlag={state.isEditFlag}
            isViewFlag={state.isViewFlag}
            ID={state.ID}
            refreshFamilyList={() => getTableListData(skipRecord, globalTakes, state.floatingFilterData, true)}
            partFamilyList={partFamilyList}
          />
        )}


        {state.isBulkUpload && (
          <BulkUpload isOpen={state.isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={"Part Family"} isZBCVBCTemplate={false} messageLabel={"Part Family"} anchor={"right"} />
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
            message={`${state.cell ? MESSAGES.PART_FAMILY_DEACTIVE_ALERT : MESSAGES.PART_FAMILY_ACTIVE_ALERT}`} />)}
      </div>
    </>
  );
};
export default PartFamilyListing;
