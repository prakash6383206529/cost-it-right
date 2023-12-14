import React, { useState, useEffect } from "react";
import { reduxForm } from "redux-form";
import { Row, Col } from "reactstrap";
import { focusOnError } from "../../layout/FormInputs";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import Switch from "react-switch";
import BulkUpload from "../../massUpload/BulkUpload";
import AddVendorDrawer from "./AddVendorDrawer";
import {
  checkPermission,
  searchNocontentFilter,
  showTitleForActiveToggle,
} from "../../../helper/util";
import { MASTERS, VENDOR, VendorMaster } from "../../../config/constants";
import { getConfigurationKey, loggedInUserId } from "../../../helper";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import { VENDOR_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import WarningMessage from "../../common/WarningMessage";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import ScrollToTop from "../../common/ScrollToTop";
import { PaginationWrapper } from "../../common/commonPagination";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import { disabledClass, isResetClick } from "../../../actions/Common";
import {
  getSupplierDataList,
  activeInactiveVendorStatus,
  deleteSupplierAPI,
} from "../actions/Supplier";
import _ from "lodash";
import MultiDropdownFloatingFilter from "../material-master/MultiDropdownFloatingFilter";
import { hideMultipleColumnFromExcel } from "../../common/CommonFunctions";
import { useDispatch, useSelector } from "react-redux";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};
const VendorListing = () => {
  const dispatch = useDispatch();
  const { supplierDataList, allSupplierDataList } = useSelector(
    (state) => state.supplier
  );
  const { statusColumnData } = useSelector((state) => state.comman);
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { selectedRowForPagination } = useSelector((state) => state.simulation);
  const [state, setState] = useState({
    isEditFlag: false,
    isOpenVendor: false,
    ID: "",
    shown: false,
    isBulkUpload: false,
    tableData: [],
    vendorType: [],
    vendorName: [],
    country: [],
    currentRowIndex: 0,
    totalRecordCount: 0,
    pageNo: 1,
    pageNoNew: 1,
    floatingFilterData: {
      vendorType: "",
      vendorName: "",
      VendorCode: "",
      Country: "",
      State: "",
      City: "",
      VendorTechnology: "",
      VendorPlant: "",
      IsCriticalVendor: "",
    },
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    ViewAccessibility: false,
    DownloadAccessibility: false,
    BulkUploadAccessibility: false,
    ActivateAccessibility: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    warningMessage: false,
    sideBar: { toolPanels: ["columns"] },
    showData: false,
    showPopup: false,
    deletedId: "",
    isViewMode: false,
    showPopupToggle: false,
    isLoader: false,
    pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    globalTake: defaultPageSize,
    disableFilter: true,
    disableDownload: false,
    noData: false,
    dataCount: 0,
  });

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    getTableListData(0, state.floatingFilterData, defaultPageSize, true);
    return () => {
      dispatch(setSelectedRowForPagination([]));
    };
  }, []);

  useEffect(() => {
    dispatch(setSelectedRowForPagination([]));
    dispatch(isResetClick(true, "vendorType"));
  }, []);

  // Effect to handle updates related to topAndLeftMenuData
  useEffect(() => {
    applyPermission(topAndLeftMenuData);

    setTimeout(() => {
      if (statusColumnData?.data) {
        setState((prevState) => ({
          ...prevState,
          disableFilter: false,
          warningMessage: true,
          floatingFilterData: {
            ...prevState.floatingFilterData,
            VendorType: statusColumnData.data,
          },
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          warningMessage: false,
          disableFilter: false,
          floatingFilterData: {
            ...prevState.floatingFilterData,
            VendorType: "",
          },
        }));
      }
    }, 500);
  }, [topAndLeftMenuData, statusColumnData]);

  /**
   * @method applyPermission
   * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
   */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data =
        topAndLeftMenuData &&
        topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData =
        Data && Data.Pages.find((el) => el.PageName === VENDOR);
      const permmisionData =
        accessData && accessData.Actions && checkPermission(accessData.Actions);

      if (permmisionData !== undefined) {
        setState((prevState) => ({
          ...prevState,
          ViewAccessibility:
            permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility:
            permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility:
            permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility:
            permmisionData && permmisionData.Delete
              ? permmisionData.Delete
              : false,
          DownloadAccessibility:
            permmisionData && permmisionData.Download
              ? permmisionData.Download
              : false,
          BulkUploadAccessibility:
            permmisionData && permmisionData.BulkUpload
              ? permmisionData.BulkUpload
              : false,
          ActivateAccessibility:
            permmisionData && permmisionData.Activate
              ? permmisionData.Activate
              : false,
        }));
      }
    }
  };

  /**
   * @method getTableListData
   * @description Get Table data
   */
  const getTableListData = (
    skip,

    obj,
    take,
    isPagination
  ) => {
    setState((prevState) => ({
      ...prevState,
      isLoader: isPagination ? true : false,
    }));

    let constantFilterData = state.filterModel;
    let object = { ...state.floatingFilterData };
    dispatch(
      getSupplierDataList(skip, obj, take, isPagination, (res) => {
        setTimeout(() => {
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }, 300);
        setState((prevState) => ({ ...prevState, noData: false }));
        if (res.status === 202) {
          setState((prevState) => ({
            ...prevState,
            totalRecordCount: 0,
          }));

          return;
        } else if (res.status === 204 && res.data === "") {
          setState((prevState) => ({ ...prevState, tableData: [] }));
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setState((prevState) => ({
            ...prevState,
            tableData: Data,
            totalRecordCount: Data[0].TotalRecordCount,
          }));
        }

        if (res && isPagination === false) {
          setState((prevState) => ({ ...prevState, disableDownload: false }));
          dispatch(disabledClass(false));
          setTimeout(() => {
            let button = document.getElementById("Excel-Downloads-vendor");
            button && button.click();
          }, 500);
        }

        if (res) {
          if (res && res.status === 204) {
            setState((prevState) => ({
              ...prevState,
              totalRecordCount: 0,
              pageNo: 0,
            }));
          }
          if (res && res.data && res.data.DataList.length > 0) {
            setState((prevState) => ({
              ...prevState,
              totalRecordCount: res.data.DataList[0].TotalRecordCount,
            }));
          }
          let isReset = true;
          setTimeout(() => {
            for (var prop in object) {
              if (prop !== "DepartmentCode" && object[prop] !== "") {
                isReset = false;
              }
            }

            // Sets the filter model via the grid API
            if (isReset) {
              gridOptions?.api?.setFilterModel({});
              setState((prevState) => ({ ...prevState, filterModel: {} }));
            } else {
              gridOptions?.api?.setFilterModel(constantFilterData);
            }

            setTimeout(() => {
              setState((prevState) => ({
                ...prevState,
                warningMessage: false,
              }));
            }, 23);
          }, 300);

          setTimeout(() => {
            setState((prevState) => ({ ...prevState, warningMessage: false }));
          }, 335);

          setTimeout(() => {
            setState((prevState) => ({
              ...prevState,
              isFilterButtonClicked: false,
            }));
          }, 600);
        }
      })
    );
  };

  const floatingFilterVendorType = {
    maxValue: 6,
    suppressFilterButton: true,
    component: "vendorType",
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (supplierDataList?.length !== 0) {
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
      }
    }, 500);
    setState((prevState) => ({ ...prevState, disableFilter: false }));
    const model = gridOptions?.api?.getFilterModel();
    setState((prevState) => ({ ...prevState, filterModel: model }));

    if (!state.isFilterButtonClicked) {
      setState((prevState) => ({ ...prevState, warningMessage: true }));
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
            floatingFilterData: state.floatingFilterData,
          }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({ ...prevState, warningMessage: false }));
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData,
          }));
        }
      }
    } else {
      if (
        value.column.colId === "EffectiveDate" ||
        value.column.colId === "CreatedDate"
      ) {
        return false;
      }
      // setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData }));
      setState((prevState) => ({
        ...prevState,
        floatingFilterData: {
          ...prevState.floatingFilterData,
          [value.column.colId]: value.filterInstance.appliedModel.filter,
        },
      }));
    }
  };

  /**
   * filter data
   */
  const onSearch = () => {
    setState((prevState) => ({
      ...prevState,
      warningMessage: false,
      pageNo: 1,
      pageNoNew: 1,
      currentRowIndex: 0,
    }));
    getTableListData(0, state.floatingFilterData, state.globalTake, true);
  };

  /**
   * pagination previous function
   */
  const onBtPrevious = () => {
    if (state.currentRowIndex >= 10) {
      const previousNo = state.currentRowIndex - 10;
      const newPageNo = state.pageNo - 1;

      setState((prevState) => ({
        ...prevState,
        pageNo: newPageNo >= 1 ? newPageNo : 1,
        pageNoNew: newPageNo >= 1 ? newPageNo : 1,
        currentRowIndex: previousNo,
      }));

      getTableListData(
        previousNo,
        state.floatingFilterData,
        state.globalTake,
        true
      );
    }
  };

  /**
   * pagination next function
   */
  const onBtNext = () => {
    if (
      state.pageSize.pageSize50 &&
      state.pageNo >= Math.ceil(state.totalRecordCount / 50)
    ) {
      return false;
    }

    if (
      state.pageSize.pageSize100 &&
      state.pageNo >= Math.ceil(state.totalRecordCount / 100)
    ) {
      return false;
    }

    if (state.currentRowIndex < state.totalRecordCount - 10) {
      setState((prevState) => ({
        ...prevState,
        pageNo: state.pageNo + 1,
        pageNoNew: state.pageNo + 1,
      }));
      const nextNo = state.currentRowIndex + 10;
      getTableListData(
        nextNo,
        state.floatingFilterData,
        state.globalTake,
        true
      );
      // skip, take, isPagination, floatingFilterData, (res)
      setState((prevState) => ({ ...prevState, currentRowIndex: nextNo }));
    }
  };

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  const viewOrEditItemDetails = (Id, isViewMode) => {
    setState((prevState) => ({
      ...prevState,
      isOpenVendor: true,
      isEditFlag: true,
      ID: Id,
      isViewMode: isViewMode,
    }));
  };

  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteSupplierAPI(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
          filterList();
          //getTableListData(null, null, null)
          dispatch(setSelectedRowForPagination([]));
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
          state.gridApi.deselectAll();
        }
      })
    );
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
  };
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
    setState((prevState) => ({ ...prevState, showPopupToggle: false }));
  };
  const onPopupConfirmToggle = () => {
    confirmDeactivateItem(state.cellData, state.cellValue);
  };
  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  const buttonFormatter = (props) => {
    const cellValue = props?.value;

    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = state;
    return (
      <>
        {ViewAccessibility && (
          <button
            title="View"
            className="View"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, true)}
          />
        )}
        {EditAccessibility && (
          <button
            title="Edit"
            className="Edit"
            type={"button"}
            onClick={() => viewOrEditItemDetails(cellValue, false)}
          />
        )}
        {DeleteAccessibility && (
          <button
            title="Delete"
            className="Delete"
            type={"button"}
            onClick={() => deleteItem(cellValue)}
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
    return cellValue !== " " &&
      cellValue !== null &&
      cellValue !== "" &&
      cellValue !== undefined &&
      String(cellValue) !== "NA"
      ? cellValue
      : "-";
  };

  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (
          item.VolumeApprovedId === props.node.data.VolumeApprovedId &&
          item.VolumeBudgetedId === props.node.data.VolumeBudgetedId
        ) {
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
   * @method handleChange
   * @description handle status change
   */
  const handleChange = (cell, row) => {
    let data = {
      Id: row.VendorId,
      ModifiedBy: loggedInUserId(),
      IsActive: !cell, //Status of the user.
    };
    setState((prevState) => ({
      ...prevState,
      showPopupToggle: true,
      cellData: data,
      cellValue: cell,
    }));
  };

  /**
   * @method confirmDeactivateItem
   * @description confirm deactivate item
   */
  const confirmDeactivateItem = (data, cell) => {
    dispatch(
      activeInactiveVendorStatus(data, (res) => {
        if (res && res.data && res.data.Result) {
          if (cell === true) {
            Toaster.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY);
          } else {
            Toaster.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY);
          }
          filterList();
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
        }
      })
    );
    setState((prevState) => ({ ...prevState, showPopupToggle: false }));
  };
  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  const statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted // Fix: Change 'valueFormatted' to 'props.valueFormatted'
      : props?.value;
    const rowData = props?.valueFormatted
      ? props.valueFormatted // Fix: Change 'valueFormatted' to 'props.valueFormatted'
      : props?.data;
    const { ActivateAccessibility } = state;
    if (rowData.UserId === loggedInUserId()) return null;
    showTitleForActiveToggle(props?.rowIndex);
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() => handleChange(cellValue, rowData)}
            checked={cellValue}
            disabled={!ActivateAccessibility}
            background="#ff6600"
            onColor="#4DC771"
            onHandleColor="#ffffff"
            offColor="#FC5774"
            id="normal-switch"
            height={24}
            className={cellValue ? "active-switch" : "inactive-switch"}
          />
        </label>
      </>
    );
  };
  /**
   * @method indexFormatter
   * @description Renders serial number
   */
  const indexFormatter = (cell, row, enumObject, rowIndex) => {
    let currentPage = state.currPage;
    let sizePerPage = state.sizePerPage;
    let serialNumber = "";
    if (currentPage === 1) {
      serialNumber = rowIndex + 1;
    } else {
      serialNumber = rowIndex + 1 + sizePerPage * (currentPage - 1);
    }
    return serialNumber;
  };

  const bulkToggle = () => {
    // $("html,body").animate({ scrollTop: 0 }, "slow");
    setState((prevState) => ({ ...prevState, isBulkUpload: true }));
  };

  /**
   * @method closeBulkUploadDrawer
   * @description close bulk upload drawer
   */
  const closeBulkUploadDrawer = (event, type) => {
    setState(
      (prevState) => ({
        ...prevState,
        isBulkUpload: false,
      }),
      () => {
        if (type !== "cancel") {
          setTimeout(() => {
            getTableListData(
              state.currentRowIndex,
              state.floatingFilterData,
              100,
              true
            );
          }, 200);
        }
      }
    );
  };

  /**
   * @method filterList
   * @description Filter user listing on the basis of role and department
   */
  const filterList = () => {
    getTableListData(
      state.currentRowIndex,
      state.floatingFilterData,
      100,
      true
    );
  };

  const formToggle = () => {
    setState((prevState) => ({
      ...prevState,
      isOpenVendor: true,
      isViewMode: false,
    }));
  };

  const closeVendorDrawer = (e = "", formdata, type) => {
    setState(
      (prevState) => ({
        ...prevState,
        isOpenVendor: false,
        isEditFlag: false,
        ID: "",
      }),
      () => {
        if (type === "submit") {
          filterList();
        }
      }
    );
  };

  const onGridReady = (params) => {
    const newGridApi = params.api;
    window.screen.width > 1440 && newGridApi.sizeColumnsToFit();
    setState((prevState) => ({
      ...prevState,
      gridApi: newGridApi,
      gridColumnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
  };

  /**
   * @method onPageSizeChanged
   * @description on page size change
   */
  const onPageSizeChanged = (newPageSize) => {
    let pageSize, totalRecordCount;

    if (Number(newPageSize) === 10) {
      pageSize = 10;
    } else if (Number(newPageSize) === 50) {
      pageSize = 50;
    } else if (Number(newPageSize) === 100) {
      pageSize = 100;
    }

    totalRecordCount = Math.ceil(state.totalRecordCount / pageSize);

    getTableListData(
      state.currentRowIndex,
      state.floatingFilterData,
      pageSize,
      true
    );

    setState((prevState) => ({
      ...prevState,
      globalTake: pageSize,
      pageNo: Math.min(state.pageNo, totalRecordCount), // Ensure pageNo is within bounds
      pageSize: {
        pageSize10: pageSize === 10,
        pageSize50: pageSize === 50,
        pageSize100: pageSize === 100,
      },
    }));

    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  /**
   * @method resetState
   * @description reset Column, filter, select cells
   */
  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
    }));
    dispatch(isResetClick(true, "vendorType"));
    setState((prevState) => ({
      ...prevState,

      isFilterButtonClicked: false,
    }));

    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);

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
    getTableListData(0, state.floatingFilterData, 10, true);
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
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(false));

    let tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => {
          return { ...prevState, disableDownload: false };
        });
        dispatch(disabledClass(false));
        let button = document.getElementById("Excel-Downloads-vendor");
        button && button.click();
      }, 400);
    } else {
      getTableListData(
        0,
        state.floatingFilterData,
        state.defaultPageSize,
        false
      ); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };

  const onRowSelect = (event) => {
    let selectedRows = state.gridApi?.getSelectedRows();

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
          if (selectedRowForPagination[i].VendorId === event.data.VendorId) {
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

    let uniqeArray = _.uniqBy(selectedRows, "VendorId"); //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    setSelectedRowForPagination(uniqeArray); //SETTING CHECKBOX STATE DATA IN REDUCER
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length }));
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));
  };

  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : allSupplierDataList
        ? allSupplierDataList
        : [];
    return returnExcelColumn(VENDOR_DOWNLOAD_EXCEl, tempArr);
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    let excelData = [...data];
    if (!getConfigurationKey()?.IsCriticalVendorConfigured) {
      excelData = hideMultipleColumnFromExcel(excelData, [
        "IsCriticalVendor",
        "VendorTechnology",
        "VendorPlant",
      ]);
    }
    temp =
      TempData &&
      TempData.map((item) => {
        if (String(item.Country) === "NA") {
          item.Country = " ";
        } else if (String(item.State) === "NA") {
          item.State = " ";
        } else if (String(item.City) === "NA") {
          item.City = " ";
        }
        return item;
      });
    return (
      <ExcelSheet data={temp} name={VendorMaster}>
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
    state.gridApi.setQuickFilter(e.target.value);
  };

  const {
    isOpenVendor,
    AddAccessibility,
    BulkUploadAccessibility,
    DownloadAccessibility,
  } = state;
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
    customNoRowsOverlay: NoContentFound,
    indexFormatter: indexFormatter,
    statusButtonFormatter: statusButtonFormatter,
    hyphenFormatter: hyphenFormatter,
    checkBoxRenderer: checkBoxRenderer,
    valuesFloatingFilter: MultiDropdownFloatingFilter,
  };

  return (
    <div
      className={`ag-grid-react container-fluid blue-before-inside report-grid custom-pagination ${
        DownloadAccessibility ? "show-table-btn no-tab-page" : ""
      }`}
      id="go-to-top"
    >
      <ScrollToTop pointProp="go-to-top" />
      {state.disableDownload && (
        <LoaderCustom
          message={MESSAGES.DOWNLOADING_MESSAGE}
          customClass="mt-5"
        />
      )}
      {state.isLoader && <LoaderCustom customClass={"loader-center"} />}

      <Row className="pb-4 mb-3 no-filter-row zindex-2">
        <Col md="3">
          {" "}
          <input
            type="text"
            className="form-control table-search"
            id="filter-text-box"
            placeholder="Search"
            autoComplete={"off"}
            onChange={(e) => onFilterTextBoxChanged(e)}
          />
        </Col>
        <Col md="9">
          <div className="d-flex justify-content-end bd-highlight w100 ">
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
                class="user-btn mr5"
                onClick={() => onSearch(this)}
                disabled={state.disableFilter}
              >
                <div class="filter mr-0"></div>
              </button>
              {AddAccessibility && (
                <button
                  type="button"
                  className={"user-btn mr5"}
                  onClick={formToggle}
                  title="Add"
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
                </button>
              )}
              {DownloadAccessibility && (
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
                    filename={"Vendor"}
                    fileExtension={".xls"}
                    element={
                      <button
                        id={"Excel-Downloads-vendor"}
                        className="p-absolute"
                        type="button"
                      ></button>
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
      {!state.isLoader && (
        <div
          className={`ag-grid-wrapper height-width-wrapper ${
            (supplierDataList && supplierDataList?.length <= 0) || state.noData
              ? "overlay-contain"
              : ""
          }`}
        >
          <div className="ag-grid-header col-md-4 pl-0"></div>
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
              rowData={supplierDataList}
              pagination={true}
              paginationPageSize={state.globalTake}
              onGridReady={onGridReady}
              onFilterModified={onFloatingFilterChanged}
              gridOptions={gridOptions}
              suppressRowClickSelection={true}
              noRowsOverlayComponent={"customNoRowsOverlay"}
              rowSelection={"multiple"}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: "imagClass",
              }}
              onRowSelected={onRowSelect}
              frameworkComponents={frameworkComponents}
              enablePivot={true}
              enableBrowserTooltips={true}
            >
              <AgGridColumn
                field="VendorType"
                tooltipField="VendorType"
                width={"240px"}
                headerName="Vendor Type"
                cellRenderer={"checkBoxRenderer"}
                floatingFilterComponent="valuesFloatingFilter"
                floatingFilterComponentParams={floatingFilterVendorType}
              ></AgGridColumn>
              <AgGridColumn
                field="VendorName"
                headerName="Vendor Name"
              ></AgGridColumn>
              <AgGridColumn
                field="VendorCode"
                headerName="Vendor Code"
              ></AgGridColumn>
              <AgGridColumn
                field="Country"
                headerName="Country"
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              <AgGridColumn
                field="State"
                headerName="State"
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              <AgGridColumn
                field="City"
                headerName="City"
                cellRenderer={"hyphenFormatter"}
              ></AgGridColumn>
              {getConfigurationKey()?.IsCriticalVendorConfigured && (
                <AgGridColumn
                  field="IsCriticalVendor"
                  headerName="Is Critical Vendor"
                ></AgGridColumn>
              )}
              <AgGridColumn
                field="VendorId"
                minWidth={"180"}
                cellClass="actions-wrapper ag-grid-action-container"
                headerName="Actions"
                type="rightAligned"
                floatingFilter={false}
                cellRenderer={"totalValueRenderer"}
              ></AgGridColumn>
              <AgGridColumn
                width="150"
                pinned="right"
                field="IsActive"
                headerName="Status"
                floatingFilter={false}
                cellRenderer={"statusButtonFormatter"}
              ></AgGridColumn>
            </AgGridReact>
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
                    disabled={false}
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
      )}

      {state.isBulkUpload && (
        <BulkUpload
          isOpen={state.isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          isZBCVBCTemplate={false}
          fileName={"Vendor"}
          messageLabel={"Vendor"}
          anchor={"right"}
        />
      )}
      {isOpenVendor && (
        <AddVendorDrawer
          isOpen={isOpenVendor}
          closeDrawer={closeVendorDrawer}
          isEditFlag={state.isEditFlag}
          isRM={false}
          isViewMode={state.isViewMode}
          ID={state.ID}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`Are you sure you want to delete this Vendor?`}
        />
      )}
      {state.showPopupToggle && (
        <PopupMsgWrapper
          isOpen={state.showPopupToggle}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirmToggle}
          message={`${
            state.cellValue
              ? MESSAGES.VENDOR_DEACTIVE_ALERT
              : MESSAGES.VENDOR_ACTIVE_ALERT
          }`}
        />
      )}
    </div>
  );
};

export default reduxForm({
  form: "VendorListing",
  onSubmitFail: (errors) => {
    focusOnError(errors);
  },
  enableReinitialize: true,
  touchOnChange: true,
})(VendorListing);
