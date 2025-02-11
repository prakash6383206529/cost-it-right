import React, { useContext, useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { BOPIMPORT, EMPTY_DATA, defaultPageSize, ENTRY_TYPE_IMPORT, FILE_URL, DRAFTID, ZBCTypeId, } from "../../../config/constants";
import { getBOPDataList, deleteBOP } from "../actions/BoughtOutParts";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import DayTime from "../../common/DayTimeWrapper";
import BulkUpload from "../../massUpload/BulkUpload";
import { BOP_IMPORT_DOWNLOAD_EXCEl } from "../../../config/masterData";
import LoaderCustom from "../../common/LoaderCustom";
import { BopImport, BOP_MASTER_ID } from "../../../config/constants";
import { getConfigurationKey, getLocalizedCostingHeadValue, loggedInUserId, searchNocontentFilter, setLoremIpsum, showBopLabel, updateBOPValues, userDepartmetList, } from "../../../helper";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { getListingForSimulationCombined, setSelectedRowForPagination, } from "../../simulation/actions/Simulation";
import WarningMessage from "../../common/WarningMessage";
import { TourStartAction, disabledClass, setResetCostingHead } from "../../../actions/Common";
import _ from "lodash";
import AnalyticsDrawer from "../material-master/AnalyticsDrawer";
import { reactLocalStorage } from "reactjs-localstorage";
import { ApplyPermission } from ".";
import { hideCustomerFromExcel, hideMultipleColumnFromExcel, hideColumnFromExcel, checkMasterCreateByCostingPermission, } from "../../common/CommonFunctions";
import Attachament from "../../costing/components/Drawers/Attachament";
import Button from "../../layout/Button";
import PaginationControls from "../../common/Pagination/PaginationControls";
import BDSimulation from "../../simulation/components/SimulationPages/BDSimulation";
import { useDispatch, useSelector } from "react-redux";
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from "../../common/Pagination/paginationAction";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { useLabels, useWithLocalization } from "../../../helper/core";
import CostingHeadDropdownFilter from "../material-master/CostingHeadDropdownFilter";
import { divisionApplicableFilter } from "../masterUtil";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};
const BOPImportListing = (props) => {
  const { t } = useTranslation("common")
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    tableData: [],
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
    isLoader: true,
    showPopup: false,
    deletedId: "",
    disableFilter: true,
    disableDownload: false,
    inRangeDate: [],
    analyticsDrawer: false,
    selectedRowData: [],
    //states for pagination purpose
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
      EffectiveDate: "",
      Currency: "",
      DepartmentName: props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "",
      CustomerName: "",
      PaymentTermDescriptionAndPaymentTerm: "",
      IncoTermDescriptionAndInfoTerm: "",
      IsBreakupBoughtOutPart: "",
      TechnologyName: "",
      BasicRateConversion: "",
      NetCostWithoutConditionCost: "",
      NetCostWithoutConditionCostConversion: "",
      NetConditionCost: "",
      NetConditionCostConversion: "",
      NetLandedCostConversion: "",
      SAPPartNumber: ""
    },
    warningMessage: false,
    filterModel: {},
    // pageNo: 1,
    // pageNoNew: 1,
    totalRecordCount: 0,
    isFilterButtonClicked: false,
    currentRowIndex: 0,
    // pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    noData: false,
    dataCount: 0,
    attachment: false,
    viewAttachment: [],
    editSelectedList: false,
    tempList: [],
    render: false,
    disableEdit: true,
  });
  const dispatch = useDispatch();
  const permissions = useContext(ApplyPermission);
  const { bopImportList, allBopDataList } = useSelector((state) => state.boughtOutparts);
  const { filteredRMData } = useSelector((state) => state.material);
  const { globalTakes } = useSelector((state) => state.pagination);

  const { initialConfiguration } = useSelector((state) => state.auth);
  const tourStartData = useSelector(state => state.comman.tourStartData);
  const { technologyLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  const { selectedRowForPagination, tokenForSimulation } = useSelector(
    (state) => state.simulation
  );
  useEffect(() => {
    if (bopImportList?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: bopImportList[0].TotalRecordCount }));
    }
    else {
      setState((prevState) => ({ ...prevState, noData: false }));
    }
  }, [bopImportList])

  useEffect(() => {
    setTimeout(() => {
      // reactLocalStorage.setObject('selectedRow', {})
      if (!props?.stopApiCallOnCancel) {

        return () => {
          dispatch(setSelectedRowForPagination([]))
          dispatch(resetStatePagination());


          // reactLocalStorage.setObject('selectedRow', {})
        }
      }
    }, 300);
    return () => {
      dispatch(setResetCostingHead(true, "costingHead"))
    }

  }, [])
  useEffect(() => {
    setTimeout(() => {
      if (!props?.stopApiCallOnCancel) {
        if (props.isSimulation) {
          if (props.selectionForListingMasterAPI === "Combined") {
            props?.changeSetLoader(true);
            dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, BOPIMPORT, () => {
              props?.changeSetLoader(false);
              setState((prevState) => ({ ...prevState, isLoader: false }));
            }))
          } else {
            getDataList("", 0, "", "", 0, defaultPageSize, true, state.floatingFilterData);
          }
        } else {
          getDataList("", 0, "", "", 0, defaultPageSize, true, state.floatingFilterData);
        }
      } else {
        setState((prevState) => ({ ...prevState, isLoader: false }));
      }
    }, 300);
    if (props.isSimulation && !props?.isFromVerifyPage) {
      props?.callBackLoader(state.isLoader);
    }
    if (props.isMasterSummaryDrawer) {
      setState((prevState) => ({
        ...prevState, totalRecordCount: bopImportList.length,
      }));
    }
  }, []);


  /**
   * @method getDataList
   * @description GET DATALIST OF IMPORT BOP
   */
  const getDataList = (
    bopFor = "", CategoryId = 0, vendorId = "", plantId = "", skip = 0, take = 10, isPagination = true, dataObj = {}, isReset = false) => {
    const { floatingFilterData } = state;
    if (props.isSimulation && !props?.isFromVerifyPage) {
      props?.changeTokenCheckBox(false);
    }

    if (state.filterModel?.EffectiveDateNew && !isReset) {
      if (state.filterModel.EffectiveDateNew.dateTo) {
        let temp = []
        temp.push(DayTime(state.filterModel.EffectiveDateNew.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(state.filterModel.EffectiveDateNew.dateTo).format('DD/MM/YYYY'))

        dataObj.dateArray = temp
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
    if (isPagination === true) {
      setState((prevState) => ({ ...prevState, isLoader: true }));
    }

    if (props?.isFromVerifyPage) {
      dataObj.VendorId =
        filteredRMData && filteredRMData?.VendorId
          ? filteredRMData?.VendorId
          : vendorId;
      dataObj.CustomerId =
        filteredRMData && filteredRMData?.CustomerId
          ? filteredRMData?.CustomerId
          : "";
      dataObj.Currency = filteredRMData?.Currency;
    }
    dataObj.EntryType = Number(ENTRY_TYPE_IMPORT);
    if (!props?.isMasterSummaryDrawer) {
      dispatch(
        getBOPDataList(filterData, skip, take, isPagination, dataObj, true, (res) => {
          setState((prevState) => ({ ...prevState, noData: false }));
          if (props.isSimulation && !props?.isFromVerifyPage) {
            props?.changeTokenCheckBox(true);
          }
          setState((prevState) => ({ ...prevState, isLoader: false }));
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
              ...prevState,
              totalRecordCount: 0,
              // pageNo: 0,
            }))
            dispatch(updatePageNumber(0))
          }

          if (res && isPagination === false) {
            dispatch(disabledClass(false))
            setState((prevState) => ({
              ...prevState,
              disableDownload: false,
            }));

            setTimeout(() => {
              let button = document.getElementById(
                "Excel-Downloads-bop-import"
              );
              button && button.click();
            }, 500);
          }

          if (res) {
            if (res && res.status === 204) {
              setState((prevState) => ({
                ...prevState, totalRecordCount: 0,
                // pageNo: 0,
              }))
              dispatch(updatePageNumber(0));
            }
            if (res && res.data && res.data.DataList.length > 0) {
              setState((prevState) => ({
                ...prevState, totalRecordCount: res.data.DataList[0].TotalRecordCount,
              }));
            }
            let isReset = true;
            setTimeout(() => {
              for (var prop in floatingFilterData) {

                if (prop !== "DepartmentName" && prop !== 'EntryType' && floatingFilterData[prop] !== "") {
                  isReset = false
                }

              }

              // Sets the filter model via the grid API
              isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(state.filterModel))
            }, 300);

            setTimeout(() => {
              setState((prevState) => ({
                ...prevState, warningMessage: false,
              }));
              dispatch(setResetCostingHead(false, "costingHead"))

            }, 335);

            setTimeout(() => {
              setState((prevState) => ({
                ...prevState, isFilterButtonClicked: false,
              }));
            }, 600);
          }
        }
        )
      );
    } else {
      setState((prevState) => ({ ...prevState, isLoader: false }));

    }
  };
  /**
            * @method toggleExtraData
            * @description Handle specific module tour state to display lorem data
            */
  const toggleExtraData = (showTour) => {
    dispatch(TourStartAction({
      showExtraData: showTour,
    }));
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, render: false }));
    }, 100);

  }
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (bopImportList?.length !== 0) {
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
            ...prevState, floatingFilterData: state.floatingFilterData,
          }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({ ...prevState, warningMessage: false }));
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({
            ...prevState, floatingFilterData: state.floatingFilterData,
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
        ...prevState, floatingFilterData: {
          ...prevState.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter,
        },
      }));
    }
  };

  const onSearch = () => {
    setState((prevState) => ({
      ...prevState, warningMessage: false,
      // pageNo: 1, pageNoNew: 1,
      // currentRowIndex: 0,
    }));
    dispatch(updateCurrentRowIndex(0));
    dispatch(updatePageNumber(1));
    getDataList("", 0, "", "", 0, globalTakes, true, state.floatingFilterData);
  };
  const resetState = () => {
    setState((prevState) => ({
      ...prevState, noData: false, inRangeDate: [], isFilterButtonClicked: false
    }));
    state.gridApi.deselectAll();
    dispatch(setResetCostingHead(true, "costingHead"))

    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    setState((prevState) => ({
      ...prevState, floatingFilterData: state.floatingFilterData, warningMessage: false,
      // pageNo: 1, pageNoNew: 1,
      // currentRowIndex: 0,
    }));
    dispatch(updateCurrentRowIndex(0));
    dispatch(updatePageNumber(1));
    getDataList("", 0, "", "", 0, 10, true, state.floatingFilterData);
    dispatch(setSelectedRowForPagination([]));

    setState((prevState) => ({
      ...prevState, dataCount: 0,
      // pageSize: {
      //   ...prevState.pageSize,
      //   pageSize10: true,
      //   pageSize50: false,
      //   pageSize100: false,
      // },
    }));
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))

    dispatch(updateGlobalTake(10));

  };

  /**
   * @method editItemDetails
   * @description edit material type
   */
  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    let data = {
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
  };

  /**
   * @method confirmDelete
   * @description confirm delete BOP
   */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteBOP(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.BOP_DELETE_SUCCESS);
          resetState();
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
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
    if (checkMasterCreateByCostingPermission(true)) {
      setState((prevState) => ({ ...prevState, isBulkUpload: true }));
    }
  };
  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, isBulkUpload: false }));
    if (type !== "cancel") {
      resetState();
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
  const { benchMark } = props
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    let isEditable = false;
    let isDeleteButton = false;

    if (permissions?.Edit) {
      isEditable = true;
    }
    if (tourStartData.showExtraData && props.rowIndex === 0) {
      isDeleteButton = true
    } else {
      if (permissions?.Delete && !rowData.IsBOPAssociated) {
        isDeleteButton = true
      }
    }
    return (
      <>

        <Button
          id={`bopimporting_movement${props.rowIndex}`}
          className="cost-movement Tour_List_Cost_Movement" title="Cost Movement" type={"button"} variant="cost-movement" onClick={() => showAnalytics(cellValue, rowData)} />

        {(!benchMark) && (
          <>
            {permissions?.View && (
              <Button
                id={`bopImportingListing_View${props.rowIndex}`}
                title="View" className="View Tour_List_View" variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />

            )}
            {isEditable && (


              <Button id={`bopImportingListing_Edit${props.rowIndex}`} title={"Edit"} className={"Edit Tour_List_Edit"} variant={"Edit"} type={"button"} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)}
              />
            )}
            {isDeleteButton && (

              <Button
                id={`bopImportingListing_Delete${props.rowIndex}`}
                title={"Delete"}
                className={"Delete Tour_List_Delete"}
                variant={"Delete"}
                type={"button"}
                onClick={() => deleteItem(cellValue)}
              />

            )}
          </>
        )}
      </>
    );
  };
  /**
   * @method commonCostFormatter
   * @description Renders buttons
   */
  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : "-";
  };
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer
    costingHeadFormatter(props);

    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
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
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
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
  /**
     * @method effectiveDateFormatter
     * @description Renders buttons
     */
  const effectiveDateFormatter = (props) => {
    if (tourStartData?.showExtraData) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted
        ? props.valueFormatted
        : props?.value;

      return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
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

            // <Button

            //   title="View Attachment"
            //   className="btn-a pl-0"
            //   onClick={() => viewAttachmentData(row)}
            //   buttonName={"View Attachment"}/>

          )}
        </div>
      </>
    );
  };
  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      props.displayForm();
    }
  };



  /**
   * @method hyphenFormatter
   */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue !== " " &&
      cellValue !== null &&
      cellValue !== "" &&
      cellValue !== undefined
      ? cellValue
      : "-";
  };

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      gridColumnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }));
    dispatch(disabledClass(true));

    //let tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination;
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, disableDownload: false }));
        dispatch(disabledClass(false));
        let button = document.getElementById("Excel-Downloads-bop-import");
        button && button.click();
      }, 400);
    } else {
      getDataList("", 0, "", "", 0, defaultPageSize, false, state.floatingFilterData); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };

  const BOP_IMPORT_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(divisionApplicableFilter(BOP_IMPORT_DOWNLOAD_EXCEl, "Division"), "MasterLabels")
  const onBtExport = () => {
    let tempArr = [];
    //tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination;
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : allBopDataList
          ? allBopDataList
          : [];
    const bopMasterName = showBopLabel();
    const { updatedLabels } = updateBOPValues(BOP_IMPORT_DOWNLOAD_EXCEl_LOCALIZATION, [], bopMasterName, 'label');
    const filteredLabels = updatedLabels.filter(column => {
      if (column.value === "PaymentTermDescriptionAndPaymentTerm") {

        return getConfigurationKey().IsShowPaymentTermsFields;
      }
      if (column.value === "NumberOfPieces") {

        return getConfigurationKey().IsMinimumOrderQuantityVisible
      }
      if (column.value === "CustomerName") {

        return reactLocalStorage.getObject('CostingTypePermission').cbc
      }
      if (column.value === "NetConditionCostConversion" || column.value === "NetConditionCost" || column.value === "NetCostWithoutConditionCostConversion" || column.value === "NetCostWithoutConditionCost") {

        return getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopImportList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && !props?.isFromVerifyPage
      }
      if (column.value === "TechnologyName" || column.value === "IsBreakupBoughtOutPart") {

        return initialConfiguration?.IsBoughtOutPartCostingConfigured
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr)
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    let tempData = [...data];
    tempData = hideCustomerFromExcel(tempData, "CustomerName");
    if (!getConfigurationKey().IsMinimumOrderQuantityVisible) {
      tempData = hideColumnFromExcel(tempData, "Quantity");
    } else if (!getConfigurationKey().IsBoughtOutPartCostingConfigured) {
      tempData = hideMultipleColumnFromExcel(tempData, ["IsBreakupBoughtOutPart", "TechnologyName",]);
    } else if (!getConfigurationKey().IsBasicRateAndCostingConditionVisible) {
      tempData = hideMultipleColumnFromExcel(tempData, ["NetCostWithoutConditionCost", "NetCostWithoutConditionCostConversion", "NetConditionCost", "NetConditionCostConversion",]);
    } else if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
      tempData = hideColumnFromExcel(tempData, "CustomerName");
    } else if (!getConfigurationKey().IsShowPaymentTermsFields) {
      tempData = hideColumnFromExcel(tempData, "PaymentTermDescriptionAndPaymentTerm");
    } else {
      tempData = data;
    }
    if (!getConfigurationKey().IsSAPCodeRequired) {
      tempData = hideColumnFromExcel(tempData, 'SAPPartNumber')
    }
    temp =
      TempData && TempData.map((item) => {
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
      <ExcelSheet data={temp} name={BopImport}>
        {tempData && tempData.map((ele, index) => (
          <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
        ))}
      </ExcelSheet>
    );
  };
  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  };
  const { isBulkUpload, noData, editSelectedList } = state;
  const ExcelFile = ReactExport.ExcelFile;
  const headerNames = {
    BasicRate: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`,
    BasicPrice: `Basic Price (${reactLocalStorage.getObject("baseCurrency")})`,
    NetConditionCost: `Net Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    NetCost: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`,
  };

  var filterParams = {
    date: "",
    inRangeInclusive: true,
    filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format("DD/MM/YYYY") : ""; handleDate(newDate); // FOR COSTING BENCHMARK BOP REPORT
      let date = document.getElementsByClassName('ag-input-field-input')
      for (let i = 0; i < date.length; i++) {
        if (date[i].type == 'radio') {
          date[i].click()
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
      ...prevState, floatingFilterData: { ...prevState.floatingFilterData, newDate: date },
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

  const closeAnalyticsDrawer = () => {
    setState((prevState) => ({ ...prevState, analyticsDrawer: false }));
  };

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    checkboxSelection: isFirstColumn,
    headerCheckboxSelection:
      props.isSimulation || props.benchMark ? isFirstColumn : false,
  };
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
      setState((prevState) => ({ ...prevState, disableFilter: false }));
      setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, CostingHead: value } }));

    }
  };
  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    costingHeadFormatter: combinedCostingHeadRenderer,
    effectiveDateFormatter: effectiveDateFormatter,
    commonCostFormatter: commonCostFormatter,
    attachmentFormatter: attachmentFormatter,
    statusFilter: CostingHeadDropdownFilter
  };

  const onRowSelect = (event) => {
    var selectedRows = state.gridApi.getSelectedRows();
    if (props?.isSimulation) {
      setState((prevState) => ({ ...prevState, disableEdit: false }));
    } else {
      setState((prevState) => ({ ...prevState, disableEdit: true }));

    }
    if (selectedRows === undefined || selectedRows === null) {
      //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination;
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {
      let finalData = [];
      if (event.node.isSelected() === false) {
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].BoughtOutPartId === event.data.BoughtOutPartId) {
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

    let uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId"); //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray));
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length })); //SETTING CHECKBOX STATE DATA IN REDUCER
    let finalArr = selectedRows;
    let length = finalArr?.length;
    let uniqueArray = _.uniqBy(finalArr, "BoughtOutPartId");
    if (props.isSimulation && !props?.isFromVerifyPage) {
      props.apply(uniqueArray, length);
    }
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));
    if (props?.benchMark) {
      let uniqueArrayNew = _.uniqBy(uniqueArray, "CategoryId");
      if (uniqueArrayNew.length > 1) {
        dispatch(setSelectedRowForPagination([]));
        state.gridApi.deselectAll();
        Toaster.warning("Please select multiple bop's with same category");
      }
    }
  };
  const cancel = () => {
    props?.cancelImportList();
  };
  const editSelectedData = () => {
    setState((prevState) => ({ ...prevState, editSelectedList: true, tempList: state.gridApi?.getSelectedRows() ? state.gridApi?.getSelectedRows() : [], }));
  };


  const backToSimulation = (value) => {
    setState((prevState) => ({ ...prevState, editSelectedList: false }));
  };
  return (
    <div>
      {!editSelectedList && (
        <div
          className={`ag-grid-react grid-parent-wrapper custom-pagination ${permissions?.Download ? "show-table-btn" : ""
            } ${props.isSimulation ? "simulation-height" : props.isMasterSummaryDrawer ? "" : "min-height100vh"}`}
        >
          {state.isLoader && !props.isMasterSummaryDrawer ? (
            <LoaderCustom customClass="simulation-Loader" />
          ) : (
            <>
              {state.disableDownload && (
                <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />
              )}
              <form noValidate>
                <Row
                  className={`pt-4  ${props?.benchMark ? "zindex-2" : "filter-row-large"} ${props.isSimulation ? "simulation-filter zindex-0" : ""}`}                >
                  <Col md="3" lg="3">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                    {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
                      buttonSpecificProp={{ id: "BOP_Importing_Listing_Tour", onClick: toggleExtraData }}
                      stepsSpecificProp={{
                        steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                      }} />)}
                  </Col>
                  <Col md="9" lg="9" className=" mb-3">
                    <div className="d-flex justify-content-end bd-highlight w100">

                      {!props.isMasterSummaryDrawer && (
                        <>
                          {
                            <div className="warning-message d-flex align-items-center">
                              {state.warningMessage &&
                                !state.disableDownload && (
                                  <>
                                    <WarningMessage dClass="mr-3" message={"Please click on filter button to filter all data"} />
                                    <div className="right-hand-arrow mr-2"></div>
                                  </>
                                )}
                            </div>
                          }

                          {
                            <Button id="bopImportListing_filterData" disabled={state.disableFilter} title={"Filtered data"} type="button" className={"user-btn mr5 Tour_List_Filter"} icon={"filter mr-0"} onClick={() => onSearch()} />
                          }
                          {permissions?.Add && (
                            <Button id="bopImportListing_add" className={"mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus"} />
                          )}
                          {permissions?.BulkUpload && (
                            <Button id="bopImportListing_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />
                          )}
                          {permissions?.Download && (
                            <>
                              <Button className={"user-btn mr5 Tour_List_Download"} id={"bopImportingListing_excel_download"} onClick={onExcelDownload} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />

                              <ExcelFile filename={`${showBopLabel()} Import`} fileExtension={".xls"} element={<Button id={"Excel-Downloads-bop-import"} className="p-absolute" />}>
                                {onBtExport()}
                              </ExcelFile>
                            </>
                          )}

                        </>
                      )}
                      <Button id={"bopImportingListing_refresh"} className={"user-btn mr-1 Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                    </div>
                    {props.isSimulation && props.isFromVerifyPage && (
                      <button type="button" className={"apply"} onClick={cancel}                        >
                        <div className={"back-icon"}></div>Back
                      </button>
                      // <Button
                      //   id={"bopImportingListing_back"}
                      //   className={"apply"}
                      //   onClick={cancel}
                      //   icon={"back-icon"}
                      //   buttonName={"Back"}
                      // />
                    )}

                  </Col>
                </Row>
              </form>
              <Row>
                <Col>
                  <div
                    className={`ag-grid-wrapper bop-import-listing ${(bopImportList && bopImportList?.length <= 0) || noData ? "overlay-contain" : ""}`}
                  >
                    <div
                      className={`ag-theme-material p-relative ${state.isLoader && "max-loader-height"}`}
                    >
                      {noData && (
                        <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />
                      )}
                      {(state.render || state.isLoader) ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        domLayout="autoHeight"
                        // columnDefs={c}
                        rowData={tourStartData.showExtraData && bopImportList ? [...setLoremIpsum(bopImportList[0]), ...bopImportList] : bopImportList}

                        pagination={true}
                        paginationPageSize={globalTakes}
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
                        suppressRowClickSelection={true}
                        onFilterModified={onFloatingFilterChanged}
                      >
                        {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                        <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={"costingHeadFormatter"} floatingFilterComponentParams={floatingFilterStatus}
                          floatingFilterComponent="statusFilter"></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartNumber" headerName={`${showBopLabel()} No.`}></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartName" headerName={`${showBopLabel()} Name`}></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                        <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                        <AgGridColumn field="Specification" headerName="Specification" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                        {getConfigurationKey().IsSAPCodeRequired && <AgGridColumn field="SAPPartNumber" headerName="SAP Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                        <AgGridColumn field="Plants" cellRenderer={"hyphenFormatter"} headerName="Plant (Code)"></AgGridColumn>
                        <AgGridColumn field="Vendor" headerName={`${vendorLabel} (Code)`} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                        {reactLocalStorage.getObject('CostingTypePermission').cbc && (<AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={"hyphenFormatter"}></AgGridColumn>)}
                        {getConfigurationKey().IsDivisionAllowedForDepartment && <AgGridColumn field="Division" headerName="Division" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>}
                        <AgGridColumn field="IncoTermDescriptionAndInfoTerm" headerName="Inco Terms"></AgGridColumn>
                        {getConfigurationKey().IsShowPaymentTermsFields && <AgGridColumn field="PaymentTermDescriptionAndPaymentTerm" headerName="Payment Terms" ></AgGridColumn>}
                        {getConfigurationKey().IsMinimumOrderQuantityVisible && (<AgGridColumn field="NumberOfPieces" headerName="Minimum Order Quantity"></AgGridColumn>)}
                        {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                        {initialConfiguration?.IsBoughtOutPartCostingConfigured && (<AgGridColumn field="IsBreakupBoughtOutPart" headerName={`Detailed ${showBopLabel()}`}></AgGridColumn>)}
                        {initialConfiguration?.IsBoughtOutPartCostingConfigured && (<AgGridColumn field="TechnologyName" headerName={technologyLabel} cellRenderer={"hyphenFormatter"}></AgGridColumn>)}
                        <AgGridColumn field="Currency"></AgGridColumn>
                        <AgGridColumn field="BasicRate" headerName="Basic Rate (Currency)" cellRenderer={"commonCostFormatter"} ></AgGridColumn>
                        <AgGridColumn field="BasicRateConversion" headerName={headerNames?.BasicRate} cellRenderer={"commonCostFormatter"}></AgGridColumn>
                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopImportList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && !props?.isFromVerifyPage && (<AgGridColumn field="NetCostWithoutConditionCost" headerName="Basic Price (Currency)" cellRenderer={"commonCostFormatter"}></AgGridColumn>)}
                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopImportList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && !props?.isFromVerifyPage && (<AgGridColumn field="NetCostWithoutConditionCostConversion" headerName={headerNames?.BasicPrice} cellRenderer={"commonCostFormatter"}></AgGridColumn>)}

                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopImportList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && !props?.isFromVerifyPage && (<AgGridColumn field="NetConditionCost" headerName="Net Condition Cost (Currency)" cellRenderer={"commonCostFormatter"}></AgGridColumn>)}
                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopImportList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && !props?.isFromVerifyPage && (<AgGridColumn field="NetConditionCostConversion" headerName={headerNames?.NetConditionCost} cellRenderer={"commonCostFormatter"}></AgGridColumn>)}
                        <AgGridColumn field="NetLandedCost" headerName="Net Cost (Currency)" cellRenderer="costFormatter"></AgGridColumn>
                        <AgGridColumn field="NetLandedCostConversion" headerName={headerNames?.NetCost} cellRenderer={"commonCostFormatter"}></AgGridColumn>
                        <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                        {!props.isSimulation && !props.isMasterSummaryDrawer && (<AgGridColumn field="BoughtOutPartId" width={160} pinned="right" cellClass="ag-grid-action-container actions-wrapper" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"} ></AgGridColumn>)}
                        {props.isMasterSummaryDrawer && (<AgGridColumn field="Attachements" headerName="Attachments" cellRenderer={"attachmentFormatter"}></AgGridColumn>)}
                        {props.isMasterSummaryDrawer && (<AgGridColumn field="Remark" tooltipField="Remark"></AgGridColumn>)}</AgGridReact>}
                      <div>
                        {!state.isLoader && !props.isMasterSummaryDrawer &&
                          (<PaginationWrappers gridApi={state.gridApi} totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={state.floatingFilterData} module='BOP' />
                          )}
                        <PaginationControls totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={state.floatingFilterData} module='BOP'
                        />
                      </div>
                    </div>
                  </div>
                  {state.showPopup && (
                    <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.BOP_DELETE_ALERT}`} />
                  )}
                  {initialConfiguration?.IsBoughtOutPartCostingConfigured && !props.isSimulation && initialConfiguration.IsMasterApprovalAppliedConfigure && !props.isMasterSummaryDrawer && (<WarningMessage dClass={"w-100 justify-content-end"} message={`${MESSAGES.BOP_BREAKUP_WARNING}`} />)}
                </Col>
              </Row>
              {props.isSimulation && props.isFromVerifyPage && (
                <Row>
                  <Col md="12" className="d-flex justify-content-end align-items-center">
                    <WarningMessage dClass="mr-5" message={`Please check the ${showBopLabel()} that you want to edit.`} />
                    <Button className={"apply"} id={"bopImportListing_editSelectedData"} disabled={state.gridApi?.getSelectedRows()?.length === 0} onClick={editSelectedData} icon="edit-icon" buttonName="Edit" />
                  </Col>
                </Row>
              )}
            </>
          )}
          {isBulkUpload && (<BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={`${showBopLabel()} Import`} isZBCVBCTemplate={true} messageLabel={`${showBopLabel()} Import`} anchor={"right"} masterId={BOP_MASTER_ID} typeOfEntryId={ENTRY_TYPE_IMPORT} />)}

          {state.analyticsDrawer && (
            <AnalyticsDrawer isOpen={state.analyticsDrawer} ModeId={2} closeDrawer={closeAnalyticsDrawer} anchor={"right"} importEntry={true} isReport={state.analyticsDrawer} selectedRowData={state.selectedRowData} isSimulation={true} rowData={state.selectedRowData} import={true} />
          )}
          {state.attachment && (
            <Attachament isOpen={state.attachment} index={state.viewAttachment} closeDrawer={closeAttachmentDrawer} anchor={"right"} gridListing={true} />
          )}
        </div>
      )}
      {editSelectedList && (
        <BDSimulation isDomestic={false}
          backToSimulation={backToSimulation}
          // isbulkUpload={isbulkUpload}
          // rowCount={rowCount}
          list={state?.tempList ? state?.tempList : []}
          // technology={technology.label}
          // technologyId={technology.value}
          // master={master.label}
          tokenForMultiSimulation={
            tokenForSimulation?.length !== 0
              ? [{ SimulationId: tokenForSimulation?.value }]
              : []
          }
        />
      )}
    </div>
  );
};

export default BOPImportListing
