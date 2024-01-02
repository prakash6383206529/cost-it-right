import React, { useState, useEffect, useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import { Row, Col } from "reactstrap";
import { EMPTY_DATA, BOP_MASTER_ID, BOPDOMESTIC, defaultPageSize, ENTRY_TYPE_DOMESTIC, FILE_URL, DRAFTID, ZBCTypeId, } from "../../../config/constants";
import { getBOPDataList, deleteBOP } from "../actions/BoughtOutParts";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import { PaginationWrapper } from "../../common/commonPagination";
import { disabledClass } from "../../../actions/Common";
import DayTime from "../../common/DayTimeWrapper";
import BulkUpload from "../../massUpload/BulkUpload";
import { BOP_DOMESTIC_DOWNLOAD_EXCEl } from "../../../config/masterData";
import LoaderCustom from "../../common/LoaderCustom";
import { getConfigurationKey, loggedInUserId, searchNocontentFilter, } from "../../../helper";
import { ApplyPermission } from ".";
import { BopDomestic } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { getListingForSimulationCombined, setSelectedRowForPagination, } from "../../simulation/actions/Simulation";
import WarningMessage from "../../common/WarningMessage";
import { hyphenFormatter } from "../masterUtil";
import _ from "lodash";
import AnalyticsDrawer from "../material-master/AnalyticsDrawer";
import { reactLocalStorage } from "reactjs-localstorage";
import { hideCustomerFromExcel, hideMultipleColumnFromExcel, hideColumnFromExcel, } from "../../common/CommonFunctions";
import Attachament from "../../costing/components/Drawers/Attachament";
import Button from "../../layout/Button";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const BOPDomesticListing = (props) => {
  const dispatch = useDispatch();
  const { bopDomesticList, allBopDataList } = useSelector(
    (state) => state.boughtOutparts
  );

  const permissions = useContext(ApplyPermission);

  const { initialConfiguration } = useSelector((state) => state.auth);
  const { selectedRowForPagination } = useSelector((state) => state.simulation);

  // Add other states here...

  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    isBulkUpload: false,
    shown: false,
    costingHead: [],
    BOPCategory: [],
    plant: [],
    vendor: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ["columns"] },
    showData: false,
    showPopup: false,
    deletedId: "",
    isLoader: true,
    disableFilter: true,
    disableDownload: false,
    inRangeDate: [],
    analyticsDrawer: false,
    selectedRowData: [],
    floatingFilterData: {
      CostingHead: "",
      BoughtOutPartNumber: "",
      BoughtOutPartName: "",
      BoughtOutPartCategory: "",
      UOM: "",
      Specification: "",
      Plants: "",
      Vendor: "",
      BasicRate: "",
      NetLandedCost: "",
      EffectiveDateNew: "",
      DepartmentName: "",
      CustomerName: "",
      NumberOfPieces: "",
      NetCostWithoutConditionCost: "",
      NetConditionCost: "",
      IsBreakupBoughtOutPart: "",
      TechnologyName: "",
    },
    warningMessage: false,
    filterModel: {},
    pageNo: 1,
    pageNoNew: 1,
    totalRecordCount: 0,
    isFilterButtonClicked: false,
    currentRowIndex: 0,
    pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    globalTake: defaultPageSize,
    noData: false,
    dataCount: 0,
    attachment: false,
    viewAttachment: [],
  });

  useEffect(() => {
    if (!props.stopApiCallOnCancel) {
      getDataList("", 0, "", "", 0, defaultPageSize, true, state.floatingFilterData);
    }
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  useEffect(() => {
    return () => {
      if (!props.stopApiCallOnCancel) {
        dispatch(setSelectedRowForPagination([]));
      }
    };
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  useEffect(() => {
    if (bopDomesticList?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: bopDomesticList[0].TotalRecordCount, }));
    }

    if (props.isSimulation) {
      props.callBackLoader(state.isLoader);
    }
  }, [bopDomesticList, state.isLoader]);

  /**
   * @method getDataList
   * @description GET DETAILS OF BOP DOMESTIC
   */
  const getDataList = useCallback(
    (bopFor = "", CategoryId = 0, vendorId = "", plantId = "", skip = 0, take = 100, isPagination = true, dataObj, isReset = false) => {
      const { floatingFilterData } = state;
      if (state.filterModel?.EffectiveDateNew && !isReset) {
        if (state.filterModel.EffectiveDateNew.dateTo) {
          let temp = [];
          temp.push(DayTime(state.filterModel.EffectiveDateNew.dateFrom).format("DD/MM/YYYY"));
          temp.push(DayTime(state.filterModel.EffectiveDateNew.dateTo).format("DD/MM/YYYY"));
          dataObj.dateArray = temp;
        }
      }
      // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
      let statusString = [props?.approvalStatus].join(",");

      const filterData = {
        ...floatingFilterData,
        bop_for: bopFor,
        category_id: CategoryId,
        vendor_id: vendorId,
        plant_id: plantId,
        ListFor: props.ListFor,
        StatusId: statusString,
        IsBOPAssociated: props?.isBOPAssociated,
      };
      const { isMasterSummaryDrawer } = props;

      if (
        props.isSimulation &&
        props.selectionForListingMasterAPI === "Combined"
      ) {
        props?.changeSetLoader(true);
        dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, BOPDOMESTIC, (res) => {
          props?.changeSetLoader(false);
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }
        )
        );
      } else {
        setState((prevState) => ({
          ...prevState,
          isLoader: isPagination ? true : false,
        }));
        if (isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer) {
          if (props.isSimulation) {
            props?.changeTokenCheckBox(false);
          }

          let constantFilterData = state.filterModel;
          let obj = { ...state.floatingFilterData };
          dataObj.EntryType = ENTRY_TYPE_DOMESTIC;
          dispatch(getBOPDataList(filterData, skip, take, isPagination, dataObj, false, (res) => {
            setState((prevState) => ({ ...prevState, isLoader: false, }));
            setState((prevState) => ({ ...prevState, noData: false, }));
            if (props.isSimulation) {
              props?.changeTokenCheckBox(true);
            }
            if (res && res.status === 200) {
              let Data = res.data.DataList;
              setState((prevState) => ({ ...prevState, tableData: Data }));
            } else if (res && res.response && res.response.status === 412) {
              setState((prevState) => ({ ...prevState, tableData: [] }));
            } else {
              setState((prevState) => ({ ...prevState, tableData: [] }));
            }

            if (res && res.status === 204) {
              setState((prevState) => ({
                ...prevState, totalRecordCount: 0, pageNo: 0,
              }));
            }

            if (res && isPagination === false) {
              setState((prevState) => ({ ...prevState, disableDownload: false, }));
              setTimeout(() => {
                dispatch(disabledClass(false));
                let button = document.getElementById(
                  "Excel-Downloads-bop-domestic"
                );
                button && button.click();
              }, 500);
            }

            if (res) {
              if (res && res.data && res.data.DataList.length > 0) {
                setState((prevState) => ({
                  ...prevState,
                  totalRecordCount: res.data.DataList[0].TotalRecordCount,
                }));
              }
              let isReset = true;
              setTimeout(() => {
                for (var prop in obj) {
                  if (props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                    if (prop !== "DepartmentName" && obj[prop] !== "") {
                      isReset = false;
                    }
                  } else {
                    if (obj[prop] !== "") {
                      isReset = false;
                    }
                  }
                }
                // Sets the filter model via the grid API
                isReset
                  ? gridOptions?.api?.setFilterModel({})
                  : gridOptions?.api?.setFilterModel(constantFilterData);
              }, 300);

              setTimeout(() => {
                setState((prevState) => ({ ...prevState, warningMessage: false, }));
              }, 335);

              setTimeout(() => {
                setState((prevState) => ({ ...prevState, isFilterButtonClicked: false, }));
              }, 600);
            }
          }
          )
          );
        } else {
          setState((prevState) => ({ ...prevState, isLoader: false }));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (bopDomesticList?.length !== 0) {
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), }));
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
      setState((prevState) => ({
        ...prevState,
        floatingFilterData: {
          ...prevState.floatingFilterData,
          [value.column.colId]: value.filterInstance.appliedModel.filter,
        },
      }));
    }
  };

  const onSearch = () => {
    setState((prevState) => ({
      ...prevState,
      warningMessage: false,
      pageNo: 1,
      pageNoNew: 1,
      currentRowIndex: 0,
    }));
    getDataList("", 0, "", "", 0, state.globalTake, true, state.floatingFilterData);
  };

  const resetStates = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
    }));
    state.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null); // COMMON PAGINATION FUNCTION
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, warningMessage: false, pageNo: 1, pageNoNew: 1, currentRowIndex: 0, }));
    getDataList("", 0, "", "", 0, 10, true, state.floatingFilterData);
    dispatch(setSelectedRowForPagination([]));

    setState((prevState) => ({
      ...prevState, globalTake: 10, dataCount: 0, pageSize: { ...prevState.pageSize, pageSize10: true, pageSize50: false, pageSize100: false, },
    }));
  };

  const onBtPrevious = () => {
    if (state.currentRowIndex >= 10) {
      const previousNo = state.currentRowIndex - 10;
      const newPageNo = state.pageNo - 1;

      setState((prevState) => ({
        ...prevState, pageNo: newPageNo >= 1 ? newPageNo : 1, pageNoNew: newPageNo >= 1 ? newPageNo : 1, currentRowIndex: previousNo,
      }));
      getDataList("", 0, "", "", previousNo, state.globalTake, true, state.floatingFilterData);
    }
  };

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
      getDataList("", 0, "", "", nextNo, state.globalTake, true, state.floatingFilterData);
      // skip, take, isPagination, floatingFilterData, (res)
      setState((prevState) => ({ ...prevState, currentRowIndex: nextNo }));
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

    totalRecordCount = Math.ceil(state.totalRecordCount / pageSize);
    getDataList("", 0, "", "", state.currentRowIndex, pageSize, true, state.floatingFilterData);

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
   * @method viewOrEditItemDetails
   * @description edit material type
   */
  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    const data = {
      isEditFlag: true,
      Id: Id,
      IsVendor: rowData.CostingHead,
      isViewMode: isViewMode,
      costingTypeId: rowData.CostingTypeId,
      showPriceFields: rowData.StatusId !== DRAFTID,
    };
    props.getDetails(data, rowData?.IsBOPAssociated);
  };

  /**
   * @method deleteItem
   * @description confirm delete Raw Material details
   */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };

  /**
   * @method confirmDelete
   * @description confirm delete Raw Material details
   */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteBOP(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.BOP_DELETE_SUCCESS);
          resetStates();
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

  const bulkToggle = () => {
    setState((prevState) => ({ ...prevState, isBulkUpload: true }));
  };

  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({
      ...prevState,
      isBulkUpload: false,
    }));
    if (type !== "cancel") {
      resetStates();
    }
  };

  const showAnalytics = (cell, rowData) => {
    setState((prevState) => ({
      ...prevState,
      selectedRowData: rowData,
      analyticsDrawer: true,
    }));
  };

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    let isEditbale = false;
    let isDeleteButton = false;
    if (permissions.Edit) {
      isEditbale = true;
    } else {
      isEditbale = false;
    }

    if (permissions.Delete && !rowData.IsBOPAssociated) {
      isDeleteButton = true;
    } else {
      isDeleteButton = false;
    }

    return (
      <>
        <Button
          id={`bopDomesticListing_movement${props.rowIndex}`}
          className={"mr-1"}
          variant="cost-movement"
          onClick={() => showAnalytics(cellValue, rowData)}
          title={"Cost Movement"}
        />
        {permissions.View && (
          <Button
            id={`bopDomesticListing_view${props.rowIndex}`}
            className={"mr-1"}
            variant="View"
            onClick={() => viewOrEditItemDetails(cellValue, rowData, true)}
            title={"View"}
          />
        )}
        {isEditbale && (
          <Button
            id={`bopDomesticListing_edit${props.rowIndex}`}
            className={"mr-1"}
            variant="Edit"
            onClick={() => viewOrEditItemDetails(cellValue, rowData, false)}
            title={"Edit"}
          />
        )}
        {isDeleteButton && (
          <Button
            id={`bopDomesticListing_delete${props.rowIndex}`}
            className={"mr-1"}
            variant="Delete"
            onClick={() => deleteItem(cellValue)}
            title={"Delete"}
          />
        )}
      </>
    );
  };
  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    // var selectedRows = gridApi?.getSelectedRows();

    if (props.selectedRowForPagination?.length > 0) {
      props.selectedRowForPagination.map((item) => {
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
   * @method commonCostFormatter
   * @description Renders buttons
   */
  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell ? cell : "-";
  };

  /**
   * @method costingHeadFormatter
   * @description Renders Costing head
   */
  const costingHeadFormatter = (props) => {
    let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (cellValue === true) {
      cellValue = "Vendor Based";
    } else if (cellValue === false) {
      cellValue = "Zero Based";
    }
    //return cellValue          // IN SUMMARY DRAWER COSTING HEAD IS ROWDATA.COSTINGHEAD & IN MAIN DOMESTIC LISTING IT IS CELLVALUE
    if (props.selectedRowForPagination?.length > 0) {
      props.selectedRowForPagination.map((item) => {
        if (item.BoughtOutPartId === props.node.data.BoughtOutPartId) {
          props.node.setSelected(true);
        }
        return null;
      });
      return cellValue;
    } else {
      return cellValue;
    }
  };
  const viewAttachmentData = (index) => {
    setState((prevState) => ({
      ...prevState,
      viewAttachment: index,
      attachment: true,
    }));
  };
  const closeAttachmentDrawer = (e = "") => {
    setState((prevState) => ({ ...prevState, attachment: false }));
  };
  const attachmentFormatter = (props) => {
    const row = props?.data;
    let files = row?.Attachements;
    if (files && files?.length === 0) {
      return "-";
    }
    return (
      <>
        <div className={"attachment images"}>
          {files && files.length === 1 ? (
            files.map((f) => {
              const withOutTild = f.FileURL?.replace("~", "");
              const fileURL = `${FILE_URL}${withOutTild}`;
              return (
                <a href={fileURL} target="_blank" rel="noreferrer">
                  {f.OriginalFileName}
                </a>
              );
            })
          ) : (
            <button
              type="button"
              title="View Attachment"
              className="btn-a pl-0"
              onClick={() => viewAttachmentData(row)}
            >
              View Attachment
            </button>
          )}
        </div>
      </>
    );
  };

  const formToggle = () => {
    props.displayForm();
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
  };

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
    const checkBoxInstance = document.querySelectorAll(
      ".ag-input-field-input.ag-checkbox-input"
    );
    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `BOP_Domestic_Checkbox${index / 11}`;
      checkBox.id = specificId;
    });
    const floatingFilterInstances = document.querySelectorAll(
      ".ag-input-field-input.ag-text-field-input"
    );
    floatingFilterInstances.forEach((floatingFilter, index) => {
      const specificId = `BOP_Domestic_Floating${index}`;
      floatingFilter.id = specificId;
    });
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(true));
    let tempArr = selectedRowForPagination;

    // let tempArr = state.gridApi && state.gridApi?.getSelectedRows();
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
      getDataList(
        "",
        0,
        "",
        "",
        0,
        defaultPageSize,
        false,
        state.floatingFilterData
      ); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };

  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    // tempArr = selectedRowForPagination;
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : allBopDataList
          ? allBopDataList
          : [];
    return returnExcelColumn(BOP_DOMESTIC_DOWNLOAD_EXCEl, tempArr);
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    let tempData = [...data];
    tempData = hideCustomerFromExcel(tempData, "CustomerName");
    if (!getConfigurationKey().IsMinimumOrderQuantityVisible) {
      tempData = hideColumnFromExcel(tempData, "Quantity");
    } else if (!getConfigurationKey().IsBasicRateAndCostingConditionVisible) {
      tempData = hideMultipleColumnFromExcel(tempData, [
        "NetConditionCost",
        "NetCostWithoutConditionCost",
      ]);
    } else if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured) {
      tempData = hideMultipleColumnFromExcel(tempData, [
        "IsBreakupBoughtOutPart",
        "TechnologyName",
      ]);
    } else if (!reactLocalStorage.getObject("cbcCostingPermission")) {
      tempData = hideColumnFromExcel(tempData, "CustomerName");
    } else {
      tempData = data;
    }
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.Plants === "-") {
          item.Plants = " ";
        }
        if (item.Vendor === "-") {
          item.Vendor = " ";
        }

        if (item.EffectiveDate?.includes("T")) {
          item.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
        }

        return item;
      });

    return (
      <ExcelSheet data={temp} name={BopDomestic}>
        {tempData &&
          tempData.map((ele, index) => (
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
  const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = props;
  const { isBulkUpload, noData } = state;

  var filterParams = {
    date: "",
    inRangeInclusive: true,
    filterOptions: ["equals", "inRange"],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString =
        cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
      var newDate =
        filterLocalDateAtMidnight != null
          ? DayTime(filterLocalDateAtMidnight).format("DD/MM/YYYY")
          : "";

      handleDate(newDate); // FOR COSTING BENCHMARK BOP REPORT

      let date = document.getElementsByClassName("ag-input-field-input");
      for (let i = 0; i < date.length; i++) {
        if (date[i].type == "radio") {
          date[i].click();
        }
      }

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
    setState((prevState) => ({
      ...prevState,
      floatingFilterData: { ...prevState.floatingFilterData, newDate: date },
    }));
  };


  var handleDate = (newDate) => {
    let temp = state.inRangeDate || []; // Ensure that state.inRangeDate is an array
    temp.push(newDate);
    setState((prevState) => ({ ...prevState, inRangeDate: temp }));
    if (props?.benchMark) {
      handleDate(state.inRangeDate);
    }
    setTimeout(() => {
      var y = document.getElementsByClassName("ag-radio-button-input");
      var radioBtn = y[0];
      radioBtn?.click();
    }, 300);
  };

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    if (props?.isMasterSummaryDrawer) {
      return false;
    } else {
      return thisIsFirstColumn;
    }
  };
  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection:
      props.isSimulation || props.benchMark ? isFirstColumn : false,
    checkboxSelection: isFirstColumn,
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    costingHeadFormatter: costingHeadFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    checkBoxRenderer: checkBoxRenderer,
    commonCostFormatter: commonCostFormatter,
    attachmentFormatter: attachmentFormatter,
  };

  const closeAnalyticsDrawer = () => {
    setState((prevState) => ({ ...prevState, analyticsDrawer: false }));
  };

  const onRowSelect = (event) => {
    var selectedRows = state.gridApi.getSelectedRows();

    if (selectedRows === undefined || selectedRows === null) {
      //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = props.selectedRowForPagination;
    } else if (
      props.selectedRowForPagination &&
      props.selectedRowForPagination.length > 0
    ) {
      // CHECKING IF REDUCER HAS DATA

      let finalData = [];
      if (event.node.isSelected() === false) {
        // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        for (let i = 0; i < props.selectedRowForPagination.length; i++) {
          if (
            props.selectedRowForPagination[i].BoughtOutPartId ===
            event.data.BoughtOutPartId
          ) {
            // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(props.selectedRowForPagination[i]);
        }
      } else {
        finalData = props.selectedRowForPagination;
      }
      selectedRows = [...selectedRows, ...finalData];
    }

    let uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId"); //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray)); //SETTING CHECKBOX STATE DATA IN REDUCER
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length }));
    let finalArr = selectedRows;
    let length = finalArr?.length;
    let uniqueArray = _.uniqBy(finalArr, "BoughtOutPartId");

    if (props.isSimulation) {
      props.apply(uniqueArray, length);
    }
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));

    if (props?.benchMark) {
      let uniqueArrayNew = _.uniqBy(uniqueArray, "CategoryId");
      if (uniqueArrayNew.length > 1) {
        props.setSelectedRowForPagination([]);
        state.gridApi.deselectAll();
        Toaster.warning("Please select multiple bop's with same category");
      }
    }
  };

  return (
    <div
      className={`ag-grid-react ${props?.isMasterSummaryDrawer === undefined ||
        props?.isMasterSummaryDrawer === false
        ? "custom-pagination"
        : ""
        } ${DownloadAccessibility ? "show-table-btn" : ""} ${props.isSimulation
          ? "simulation-height"
          : props?.isMasterSummaryDrawer
            ? ""
            : "min-height100vh"
        }`}
    >
      {/* {state.isLoader && <LoaderCustom />} */}
      {state.isLoader && !props.isMasterSummaryDrawer && (
        <LoaderCustom customClass="simulation-Loader" />
      )}
      {state.disableDownload && (
        <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />
      )}
      <form noValidate>
        <Row
          className={`${props?.isMasterSummaryDrawer ? "" : "pt-4"} ${props?.benchMark ? "zindex-2" : "filter-row-large"
            }  ${props.isSimulation ? "simulation-filter zindex-0 " : ""}`}
        >
          <Col md="3" lg="3">
            <input
              type="text"
              className="form-control table-search"
              id="filter-text-box"
              placeholder="Search"
              autoComplete={"off"}
              onChange={(e) => onFilterTextBoxChanged(e)}
            />
          </Col>
          <Col md="9" lg="9" className="mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              {state.shown ? (
                <button
                  type="button"
                  className="user-btn mr5 filter-btn-top"
                  onClick={(prevState) =>
                    setState(() => ({ ...prevState, shown: !state.shown }))
                  }
                >
                  <div className="cancel-icon-white"></div>
                </button>
              ) : (
                <></>
              )}

              {(props?.isMasterSummaryDrawer === undefined ||
                props?.isMasterSummaryDrawer === false) && (
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
                )}

              {(props?.isMasterSummaryDrawer === undefined ||
                props?.isMasterSummaryDrawer === false) && (
                  <Button
                    id="bopDomesticListing_filter"
                    className={"mr5"}
                    onClick={() => onSearch()}
                    title={"Filtered data"}
                    icon={"filter"}
                    disabled={state.disableFilter}
                  />
                )}

              {AddAccessibility && (
                <Button
                  id="bopDomesticListing_add"
                  className={"mr5"}
                  onClick={formToggle}
                  title={"Add"}
                  icon={"plus"}
                />
              )}
              {BulkUploadAccessibility && (
                <Button
                  id="bopDomesticListing_add"
                  className={"mr5"}
                  onClick={bulkToggle}
                  title={"Bulk Upload"}
                  icon={"upload"}
                />
              )}
              {DownloadAccessibility && (
                <>
                  <Button
                    className="mr5"
                    id={"bopDomesticListing_excel_download"}
                    onClick={onExcelDownload}
                    title={`Download ${state.dataCount === 0
                      ? "All"
                      : "(" + state.dataCount + ")"
                      }`}
                    icon={"download mr-1"}
                    buttonName={`${state.dataCount === 0
                      ? "All"
                      : "(" + state.dataCount + ")"
                      }`}
                  />
                  <ExcelFile
                    filename={"BOP Domestic"}
                    fileExtension={".xls"}
                    element={
                      <Button
                        id={"Excel-Downloads-bop-domestic"}
                        className="p-absolute"
                      />
                    }
                  >
                    {onBtExport()}
                  </ExcelFile>
                </>
              )}
              <Button
                id={"bopDomesticListing_refresh"}
                onClick={() => resetStates()}
                title={"Reset Grid"}
                icon={"refresh"}
              />
            </div>
          </Col>
        </Row>
      </form>

      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper ${props?.isDataInMaster && !noData ? "master-approval-overlay" : ""
              } ${(props.bopDomesticList && props.bopDomesticList?.length <= 0) ||
                noData
                ? "overlay-contain"
                : ""
              }`}
          >
            <div
              className={`ag-theme-material p-relative ${state.isLoader &&
                !props.isMasterSummaryDrawer &&
                "max-loader-height"
                }`}
            >
              {noData && (
                <NoContentFound
                  title={EMPTY_DATA}
                  customClassName="no-content-found bop-drawer"
                />
              )}
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                rowData={bopDomesticList}
                pagination={true}
                paginationPageSize={state.globalTake}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={"customNoRowsOverlay"}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: "imagClass",
                }}
                frameworkComponents={frameworkComponents}
                rowSelection={"multiple"}
                //onSelectionChanged={onRowSelect}
                onRowSelected={onRowSelect}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
                enableBrowserTooltips={true}
              >
                <AgGridColumn
                  field="CostingHead"
                  headerName="Costing Head"
                  cellRenderer={"costingHeadFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="BoughtOutPartNumber"
                  headerName="BOP Part No."
                ></AgGridColumn>
                <AgGridColumn
                  field="BoughtOutPartName"
                  headerName="BOP Part Name"
                ></AgGridColumn>
                <AgGridColumn
                  field="BoughtOutPartCategory"
                  headerName="BOP Category"
                ></AgGridColumn>
                <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                <AgGridColumn
                  field="Specification"
                  headerName="Specification"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="Plants"
                  cellRenderer={"hyphenFormatter"}
                  headerName="Plant (Code)"
                ></AgGridColumn>
                <AgGridColumn
                  field="Vendor"
                  headerName="Vendor (Code)"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                {reactLocalStorage.getObject("cbcCostingPermission") && (
                  <AgGridColumn
                    field="CustomerName"
                    headerName="Customer (Code)"
                    cellRenderer={"hyphenFormatter"}
                  ></AgGridColumn>
                )}
                {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                {props?.isMasterSummaryDrawer && (
                  <AgGridColumn
                    field="IncoSummary"
                    headerName="Inco Terms"
                  ></AgGridColumn>
                )}
                {/* {props?.isMasterSummaryDrawer && <AgGridColumn field="PaymentSummary" headerName="Payment Terms"></AgGridColumn>} */}
                {getConfigurationKey().IsMinimumOrderQuantityVisible && (
                  <AgGridColumn
                    field="NumberOfPieces"
                    headerName="Minimum Order Quantity"
                  ></AgGridColumn>
                )}
                <AgGridColumn
                  field="BasicRate"
                  headerName="Basic Rate"
                  cellRenderer={"commonCostFormatter"}
                ></AgGridColumn>

                {initialConfiguration?.IsBasicRateAndCostingConditionVisible &&
                  ((props.isMasterSummaryDrawer &&
                    props.bopDomesticList[0]?.CostingTypeId === ZBCTypeId) ||
                    !props.isMasterSummaryDrawer) && (
                    <AgGridColumn
                      field="NetCostWithoutConditionCost"
                      headerName="Basic Price"
                      cellRenderer={"commonCostFormatter"}
                    ></AgGridColumn>
                  )}
                {initialConfiguration?.IsBasicRateAndCostingConditionVisible &&
                  ((props.isMasterSummaryDrawer &&
                    props.bopDomesticList[0]?.CostingTypeId === ZBCTypeId) ||
                    !props.isMasterSummaryDrawer) && (
                    <AgGridColumn
                      field="NetConditionCost"
                      headerName="Net Condition Cost"
                      cellRenderer={"commonCostFormatter"}
                    ></AgGridColumn>
                  )}

                <AgGridColumn
                  field="NetLandedCost"
                  headerName="Net Cost"
                  cellRenderer={"commonCostFormatter"}
                ></AgGridColumn>
                {initialConfiguration?.IsBoughtOutPartCostingConfigured && (
                  <AgGridColumn
                    field="IsBreakupBoughtOutPart"
                    headerName="Detailed BOP"
                  ></AgGridColumn>
                )}
                {initialConfiguration?.IsBoughtOutPartCostingConfigured && (
                  <AgGridColumn
                    field="TechnologyName"
                    headerName="Technology"
                    cellRenderer={"hyphenFormatter"}
                  ></AgGridColumn>
                )}
                <AgGridColumn
                  field="EffectiveDateNew"
                  headerName="Effective Date"
                  cellRenderer={"effectiveDateFormatter"}
                  filter="agDateColumnFilter"
                  filterParams={filterParams}
                ></AgGridColumn>
                {!props?.isSimulation && !props?.isMasterSummaryDrawer && (
                  <AgGridColumn
                    field="BoughtOutPartId"
                    width={170}
                    pinned="right"

                    cellClass="ag-grid-action-container"
                    headerName="Action"
                    type="rightAligned"
                    floatingFilter={false}
                    cellRenderer={"totalValueRenderer"}
                  ></AgGridColumn>
                )}
                {props.isMasterSummaryDrawer && (
                  <AgGridColumn
                    field="Attachements"
                    headerName="Attachments"
                    cellRenderer={"attachmentFormatter"}
                  ></AgGridColumn>
                )}
                {props.isMasterSummaryDrawer && (
                  <AgGridColumn
                    field="Remark"
                    tooltipField="Remark"
                  ></AgGridColumn>
                )}
              </AgGridReact>
              <div
                className={`button-wrapper ${props?.isMasterSummaryDrawer ? "mb-5" : ""
                  }`}
              >
                {!state.isLoader && !props.isMasterSummaryDrawer && (
                  <PaginationWrapper
                    gridApi={state.gridApi}
                    setPage={onPageSizeChanged}
                    globalTake={state.globalTake}
                  />
                )}
                <div className="d-flex pagination-button-container">
                  <p>
                    <Button
                      id="bopDomesticListing_previous"
                      variant="previous-btn"
                      onClick={() => onBtPrevious()}
                    />
                  </p>
                  {state?.pageSize?.pageSize10 && (
                    <p className="next-page-pg custom-left-arrow">
                      Page <span className="text-primary">{state.pageNo}</span>{" "}
                      of {Math.ceil(state.totalRecordCount / 10)}
                    </p>
                  )}
                  {state?.pageSize?.pageSize50 && (
                    <p className="next-page-pg custom-left-arrow">
                      Page <span className="text-primary">{state.pageNo}</span>{" "}
                      of {Math.ceil(state.totalRecordCount / 50)}
                    </p>
                  )}
                  {state?.pageSize?.pageSize100 && (
                    <p className="next-page-pg custom-left-arrow">
                      Page <span className="text-primary">{state.pageNo}</span>{" "}
                      of {Math.ceil(state.totalRecordCount / 100)}
                    </p>
                  )}
                  <p>
                    <Button
                      id="bopDomesticListing_next"
                      variant="next-btn"
                      onClick={() => onBtNext()}
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {isBulkUpload && (
        <BulkUpload
          isOpen={isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"BOP Domestic"}
          isZBCVBCTemplate={true}
          messageLabel={"BOP Domestic"}
          anchor={"right"}
          masterId={BOP_MASTER_ID}
          typeOfEntryId={ENTRY_TYPE_DOMESTIC}
        />
      )}

      {state.analyticsDrawer && (
        <AnalyticsDrawer
          isOpen={state.analyticsDrawer}
          ModeId={2}
          closeDrawer={closeAnalyticsDrawer}
          anchor={"right"}
          isReport={state.analyticsDrawer}
          selectedRowData={state.selectedRowData}
          isSimulation={true}
          //cellValue={cellValue}
          rowData={state.selectedRowData}
        />
      )}
      {state.attachment && (
        <Attachament
          isOpen={state.attachment}
          index={state.viewAttachment}
          closeDrawer={closeAttachmentDrawer}
          anchor={"right"}
          gridListing={true}
        />
      )}

      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.BOP_DELETE_ALERT}`}
        />
      )}
      {initialConfiguration?.IsBoughtOutPartCostingConfigured &&
        !props.isSimulation &&
        initialConfiguration.IsMasterApprovalAppliedConfigure && (
          <WarningMessage
            dClass={"w-100 justify-content-end"}
            message={`${MESSAGES.BOP_BREAKUP_WARNING}`}
          />
        )}
    </div>
  );
};

export default reduxForm({
  form: "BOPDomesticListing",
  enableReinitialize: true,
  touchOnChange: true,
})(BOPDomesticListing);
