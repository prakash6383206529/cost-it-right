import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, NavItem, TabContent, TabPane, Nav, NavLink, Container, } from "reactstrap";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { getVolumeDataList, deleteVolume } from "../actions/Volume";
import { VOLUME_DOWNLOAD_EXCEl } from "../../../config/masterData";
import AddVolume from "./AddVolume";
import BulkUpload from "../../massUpload/BulkUpload";
import { ADDITIONAL_MASTERS, VOLUME, VolumeMaster, } from "../../../config/constants";
import { checkPermission, searchNocontentFilter, setLoremIpsum } from "../../../helper/util";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import ScrollToTop from "../../common/ScrollToTop";
import AddLimit from "./AddLimit";
import WarningMessage from "../../common/WarningMessage";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import _ from "lodash";
import { disabledClass } from "../../../actions/Common";
import { reactLocalStorage } from "reactjs-localstorage";
import VolumeBulkUploadDrawer from "../../massUpload/VolumeBulkUploadDrawer";
import { Drawer } from "@material-ui/core";
import classnames from "classnames";
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel } from "../../common/CommonFunctions";
import Button from "../../layout/Button";
import PaginationControls from "../../common/Pagination/PaginationControls";
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber } from "../../common/Pagination/paginationAction";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { useLabels, useWithLocalization } from "../../../helper/core";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const initialTableData = [
  {
    VolumeApprovedDetailId: 0,
    Month: "April",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 1,
    Month: "May",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 2,
    Month: "June",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 3,
    Month: "July",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 4,
    Month: "August",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 5,
    Month: "September",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 6,
    Month: "October",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 7,
    Month: "November",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 8,
    Month: "December",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 9,
    Month: "January",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 10,
    Month: "February",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 11,
    Month: "March",
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
];

function VolumeListing(props) {
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [data, setData] = useState({ isEditFlag: false, ID: "" });
  const [bulkUploadBtn, setBulkUploadBtn] = useState(false);
  const [addAccessibility, setAddAccessibility] = useState(false);
  const [editAccessibility, setEditAccessibility] = useState(false);
  const [deleteAccessibility, setDeleteAccessibility] = useState(false);
  const [bulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
  const [downloadAccessibility, setDownloadAccessibility] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deletedId, setDeletedId] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [limit, setLimit] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [activeTab, setactiveTab] = useState("1");
  const [showExtraData, setShowExtraData] = useState(false)

  //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
  const [disableFilter, setDisableFilter] = useState(true); // STATE MADE FOR CHECKBOX SELECTION
  const [warningMessage, setWarningMessage] = useState(false);
  // const [globalTake, setGlobalTake] = useState(defaultPageSize);
  const [filterModel, setFilterModel] = useState({});
  // const [pageNo, setPageNo] = useState(1);
  // const [pageNoNew, setPageNoNew] = useState(1);
  const [totalRecordCount, setTotalRecordCount] = useState(1);
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  // const [currentRowIndex, setCurrentRowIndex] = useState(0);
  // const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false, });
  const [floatingFilterData, setFloatingFilterData] = useState({
    CostingHead: "",
    Year: "",
    Month: "",
    VendorName: "",
    Plant: "",
    PartNumber: "",
    PartName: "",
    BudgetedQuantity: "",
    ApprovedQuantity: "",
    applyPagination: "",
    skip: "",
    take: "",
    CustomerName: "",
    PartType: "",
  });
  const [disableDownload, setDisableDownload] = useState(false);
  const [noData, setNoData] = useState(false);
  const [pageRecord, setPageRecord] = useState(0);
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const { volumeDataList, volumeDataListForDownload } = useSelector((state) => state.volume);
  const { globalTakes } = useSelector((state) => state.pagination);
  const { selectedRowForPagination } = useSelector((state) => state.simulation);
  const dispatch = useDispatch();
  const { t } = useTranslation("Common");
  const { vendorLabel } = useLabels()

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    getTableListData(0, defaultPageSize, true);
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
    if (volumeDataList?.length > 0) {
      setTotalRecordCount(volumeDataList[0].TotalRecordCount);
    } else {
      setNoData(false);
    } // eslint-disable-next-line

  }, [volumeDataList]);

  /**
   * @method applyPermission
   * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
   */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === VOLUME);
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionData !== undefined) {
        setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false);
        setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false);
        setDeleteAccessibility(permmisionData && permmisionData.Delete ? permmisionData.Delete : false);
        setBulkUploadAccessibility(permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false);
        setDownloadAccessibility(permmisionData && permmisionData.Download ? permmisionData.Download : false);
      }
    }
  };

  /**
   * @method getTableListData
   * @description Get user list data
   */
  const getTableListData = (skip = 0, take = 10, isPagination = true) => {
    setPageRecord(skip)
    if (isPagination === true || isPagination === null) setIsLoader(true);
    let dataObj = { ...floatingFilterData };
    const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
    dataObj.IsCustomerDataShow = cbc
    dataObj.IsVendorDataShow = vbc
    dataObj.IsZeroDataShow = zbc
    dispatch(getVolumeDataList(skip, take, isPagination, dataObj, (res) => {
      if (isPagination === true || isPagination === null) setIsLoader(false);

      if (res && isPagination === false) {
        setDisableDownload(false);
        dispatch(disabledClass(false));
        setTimeout(() => {
          let button = document.getElementById("Excel-Downloads-volume");
          button && button.click();
        }, 500);
      }
      if (res) {
        if ((res && res.status === 204) || res.length === 0) {
          setTotalRecordCount(0);
          // setPageNo(0);
          dispatch(updatePageNumber(0));
        }
        let isReset = true;
        setTimeout(() => {
          for (var prop in floatingFilterData) {
            if (floatingFilterData[prop] !== "") {
              isReset = false;
            }
          }
          // Sets the filter model via the grid API
          isReset ? gridOptions?.api?.setFilterModel({}) : gridOptions?.api?.setFilterModel(filterModel);
        }, 300);

        setTimeout(() => {
          setWarningMessage(false);
        }, 330);

        setTimeout(() => {
          setIsFilterButtonClicked(false);
        }, 600);
      }
    })
    );
  };
  const toggleExtraData = (showTour) => {
    setShowExtraData(showTour)


  }
  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  const editItemDetails = (Id) => {
    setData({ isEditFlag: true, ID: Id });
    setShowVolumeForm(true);
  };

  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  const deleteItem = (obj) => {
    setShowPopup(true);
    setDeletedId(obj);
  };

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  const confirmDeleteItem = (ID) => {
    dispatch(deleteVolume(ID, (res) => {
      if (res?.data?.Result === true) {
        dispatch(setSelectedRowForPagination([]));
        if (gridApi) {
          gridApi?.deselectAll();
        }
        Toaster.success(MESSAGES.DELETE_VOLUME_SUCCESS);
        getTableListData(pageRecord, globalTakes, true);
        setDataCount(0);
      }
    }));
    setShowPopup(false);
  };


  const onPopupConfirm = () => {
    confirmDeleteItem(deletedId);
  };

  const closePopUp = () => {
    setShowPopup(false);
  };

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;
    let obj = {};
    obj.volumeId = rowData.VolumeId;
    obj.volumeApprovedId = rowData.VolumeApprovedId;
    obj.volumeBudgetedId = rowData.VolumeBudgetedId;
    return (
      <>
        {editAccessibility && (<Button id={`volumeListing_edit${props.rowIndex}`} className={"Edit mr-2 Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, rowData)} title={"Edit"} />
        )}
        {deleteAccessibility && (<Button id={`volumeListing_delete${props.rowIndex}`} className={"Delete Tour_List_Delete"} variant="Delete" onClick={() => deleteItem(obj)} title={"Delete"} />
        )}
      </>
    );
  };

  /**
   * @method hyphenFormatter
   */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue !== " " && cellValue !== null && cellValue !== "" && cellValue !== undefined ? cellValue : "-";
  };

  /**
   * @method closeActualBulkUploadDrawer
   * @description CLOSE ACTUAL BULK DRAWER
   */
  const closeBulkUploadDrawer = (event, type) => {
    setBulkUploadBtn(false);
    if (type !== "cancel") {
      setTimeout(() => {
        getTableListData(0, globalTakes, true);
      }, 200);
    }
  };
  /**
   * @method closeActualBulkUploadDrawer
   * @description CLOSE ACTUAL BULK DRAWER
   */
  const closeActualBulkUploadDrawer = (event, type) => {
    setBulkUploadBtn(false);
    if (type !== "cancel") {
      setTimeout(() => {
        getTableListData(0, globalTakes, true);
      }, 200);
    }
  };

  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      setShowVolumeForm(true);
    }
  };
  const returnExcelColumn = (data = [], TempData) => {
    let excelData = hideCustomerFromExcel(data, "CustomerName")
    return (
      <ExcelSheet data={TempData} name={VolumeMaster}>
        {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }


  const onRowSelect = (event) => {
    var selectedRows = gridApi && gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {
      //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination;
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {
      // CHECKING IF REDUCER HAS DATA
      let finalData = [];
      if (event.node.isSelected() === false) {
        // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].VolumeApprovedId === event.data.VolumeApprovedId && selectedRowForPagination[i].VolumeBudgetedId === event.data.VolumeBudgetedId) {
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

    let uniqeArrayVolumeBudgetedId = _.uniqBy(selectedRows, (v) => [v.VolumeApprovedId, v.VolumeBudgetedId].join()); //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArrayVolumeBudgetedId)); //SETTING CHECKBOX STATE DATA IN REDUCER
    setDataCount(uniqeArrayVolumeBudgetedId.length);
  };

  const onExcelDownload = () => {
    setDisableDownload(true);
    dispatch(disabledClass(false));
    //let tempArr = gridApi && gridApi?.getSelectedRows()
    let tempArr = volumeDataListForDownload;
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setDisableDownload(false);
        dispatch(disabledClass(false));
        let button = document.getElementById("Excel-Downloads-volume");
        button && button.click();
      }, 400);
    } else {
      getTableListData(0, defaultPageSize, false);
      // getDataList(, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  };
  const VOLUME_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(VOLUME_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = [];
    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination;
    tempArr = tempArr && tempArr.length > 0 ? tempArr : volumeDataListForDownload ? volumeDataListForDownload : [];
    return returnExcelColumn(VOLUME_DOWNLOAD_EXCEl_LOCALIZATION, tempArr);
  };

  /**
   * @method hideForm
   * @description HIDE FORM
   */
  const hideForm = (type) => {
    setShowVolumeForm(false);
    setData({ isEditFlag: false, ID: "" });
    setTimeout(() => {
      if (type === "submit") getTableListData(0, globalTakes, true);
    }, 200);
  };



  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
  };


  const onSearch = () => {
    setWarningMessage(false);
    setIsFilterButtonClicked(true);
    dispatch(updatePageNumber(1));
    updateCurrentRowIndex(0);
    // setPageNo(1);
    // setPageNoNew(1);
    // setCurrentRowIndex(0);
    gridOptions?.columnApi?.resetColumnState();
    getTableListData(0, globalTakes, true);
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (volumeDataList?.length !== 0) {
        setNoData(searchNocontentFilter(value, noData));
        setTotalRecordCount(gridApi?.getDisplayedRowCount())
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
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, });
    }
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
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
    dispatch(updateGlobalTake(10));
    dispatch(resetStatePagination());
    // setPageNo(1);
    // setPageNoNew(1);
    // setCurrentRowIndex(0);
    getTableListData(0, 10, true);
    dispatch(setSelectedRowForPagination([]));
    // setGlobalTake(10);
    // setPageSize((prevState) => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false, }));
    setDataCount(0);
  };

  /**
   * @method LimitHandleChange
   * @description Open Limit Side Drawer
   */
  const limitHandler = () => {
    setLimit(true);
  };
  const BulkToggle = () => {
    if (checkMasterCreateByCostingPermission(true)) {
      setBulkUploadBtn(true);
    }
  };
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setactiveTab(tab);
    }
  };

  /**
   * @method  closeLimitDrawer
   * @description CLOSE Limit Side Drawer
   */
  const closeLimitDrawer = () => {
    setLimit(false);
  };

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

  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
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

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
  };

  if (showVolumeForm) {
    return (
      <AddVolume initialTableData={initialTableData} hideForm={hideForm} data={data} />
    );
  }

  const toggleDrawer = () => {
    setBulkUploadBtn(false);
  };
  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div
        className={`ag-grid-react container-fluid blue-before-inside ${downloadAccessibility ? "show-table-btn no-tab-page" : ""
          }`}
        id="go-to-top"
      >
        <ScrollToTop pointProp="go-to-top" />
        {isLoader ? (<LoaderCustom customClass={"loader-center"} />
        ) : (
          <>
            {disableDownload && (<LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} customClass="mt-5" />
            )}
            <form noValidate>
              <Row className="blue-before">
                <Col md="9" className="search-user-block mb-3">
                  <div className="d-flex justify-content-end bd-highlight">
                    <div className="warning-message d-flex align-items-center">
                      {warningMessage && !disableDownload && (
                        <>
                          <WarningMessage dClass="mr-3" message={"Please click on filter button to filter all data"} />
                          <div className="right-hand-arrow mr-2"></div>
                        </>
                      )}
                    </div>

                    <Button id="volumeListing_filter" className={"user-btn mr5  Tour_List_Filter"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                    <Button id="volumeListing_addLimit" type="button" className={"user-btn mr5 Tour_List_Limit"} onClick={limitHandler} buttonName={"Add Limit"} />
                    {addAccessibility && (<Button id="volumeListing_add" className={"user-btn mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />)}
                    {bulkUploadAccessibility && (<Button id="volumeListing_bulkUpload" className={"user-btn mr5  Tour_List_BulkUpload"} onClick={BulkToggle} title={"Bulk Upload"} icon={"upload mr-0"} />)}

                    {downloadAccessibility && (<><Button className="user-btn mr5 Tour_List_Download" id={"volumeListing_excel_download"} onClick={onExcelDownload} disabled={totalRecordCount === 0} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                      icon={"download mr-1"}
                      buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                    />
                      <ExcelFile filename={"Volume"} fileExtension={".xls"} element={<Button id={"Excel-Downloads-volume"} className="p-absolute" />}                      >
                        {onBtExport()}
                      </ExcelFile>
                    </>
                    )}

                    <Button id={"volumeListing_refresh "} className={"Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

                  </div>
                </Col>
              </Row>
            </form>

            <div
              className={`ag-grid-wrapper height-width-wrapper  ${(volumeDataList && volumeDataList?.length <= 0) || noData
                ? "overlay-contain" : ""}`}
            >
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />

                <TourWrapper
                  buttonSpecificProp={{ id: "Volume_Listing_Tour", onClick: toggleExtraData }}
                  stepsSpecificProp={{
                    steps: Steps(t,
                      { viewButton: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }
                    ).COMMON_LISTING
                  }} />
              </div>
              <div
                className={`ag-theme-material ${isLoader && "max-loader-height"}`}
              >
                {noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />
                )}
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout="autoHeight"
                  // columnDefs={c}
                  rowData={showExtraData ? [...setLoremIpsum(volumeDataList[0]), ...volumeDataList] : volumeDataList}

                  editable={true}
                  // pagination={true}
                  paginationPageSize={globalTakes}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
                  noRowsOverlayComponent={"customNoRowsOverlay"}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                    imagClass: "imagClass",
                  }}
                  rowSelection={"multiple"}
                  frameworkComponents={frameworkComponents}
                  onFilterModified={onFloatingFilterChanged}
                  onRowSelected={onRowSelect}
                  suppressRowClickSelection={true}
                >
                  <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={checkBoxRenderer}></AgGridColumn>
                  <AgGridColumn field="Year" headerName="Year"></AgGridColumn>
                  <AgGridColumn field="Month" headerName="Month"></AgGridColumn>
                  <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                  {reactLocalStorage.getObject('CostingTypePermission').cbc && (<AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={"hyphenFormatter"}></AgGridColumn>)}
                  <AgGridColumn field="Plant" headerName="Plant (Code)" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                  <AgGridColumn field="PartType" headerName="Part Type" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                  <AgGridColumn field="PartNumber" headerName="Part No. (Revision No.)" width={200}></AgGridColumn>
                  <AgGridColumn field="PartName" headerName="Part Name"                  ></AgGridColumn>
                  <AgGridColumn field="BudgetedQuantity" headerName="Budgeted Quantity"                  ></AgGridColumn>
                  {/*  <AgGridColumn field="BudgetedPrice" headerName="Budgeted Price"></AgGridColumn>   ONCE CODE DEPLOY FROM BACKEND THEN UNCOMENT THE LINE */}
                  <AgGridColumn field="ApprovedQuantity" headerName="Actual Quantity"                  ></AgGridColumn>
                  <AgGridColumn field="VolumeId" width={120} cellClass="ag-grid-action-container" pinned="right" headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
                </AgGridReact >
                <div className="button-wrapper">
                  {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="Volume" />
                  }
                  {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) && (
                    <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="Volume" />

                  )}
                </div>
              </div >
            </div >
          </>
        )
        }
        {
          bulkUploadBtn && (<Drawer anchor={"right"} open={bulkUploadBtn}>
            <Container>
              <div className="drawer-wrapper volume-drawer">
                <Row className="drawer-heading mb-0">
                  <Col>
                    <div className={"header-wrapper left"}>
                      <h3>Bulk Upload</h3>
                    </div>
                    <div
                      onClick={toggleDrawer}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <Row className="">
                  <Col md="12" className="">
                    {" "}
                    <Nav tabs className="subtabs">
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "1" })}
                          onClick={() => {
                            toggle("1");
                          }}
                        >
                          Actual (Monthly)
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "2" })}
                          onClick={() => {
                            toggle("2");
                          }}
                        >
                          Budgeted (Monthly)
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: activeTab === "3" })}
                          onClick={() => {
                            toggle("3");
                          }}
                        >
                          Actual (Daily)
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </Col>
                  <Col md="12" className="px-0 mt-3">
                    <TabContent activeTab={activeTab}>
                      {Number(activeTab) === 1 && (
                        <TabPane tabId="1">
                          <BulkUpload closeDrawer={closeActualBulkUploadDrawer} isEditFlag={false} fileName={"Actual Volume"} isZBCVBCTemplate={true} messageLabel={"Volume Actual"} anchor={"right"} isDrawerfasle={true} />
                        </TabPane>
                      )}
                      {Number(activeTab) === 2 && (
                        <TabPane tabId="2">
                          <BulkUpload closeDrawer={closeActualBulkUploadDrawer} isEditFlag={false} fileName={"Budgeted Volume"} isZBCVBCTemplate={true} messageLabel={"Volume Budgeted"} anchor={"right"} isDrawerfasle={true} />
                        </TabPane>
                      )}
                      {Number(activeTab) === 3 && (
                        <TabPane tabId="3">
                          <VolumeBulkUploadDrawer closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={"Volume"} isZBCVBCTemplate={true} messageLabel={"Volume"} />
                        </TabPane>
                      )}
                    </TabContent>
                  </Col>
                </Row>
              </div>
            </Container>
          </Drawer>
          )
        }
        {
          showPopup && (<PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.VOLUME_DELETE_ALERT}`} />
          )
        }

        {limit && (<AddLimit isOpen={limit} closeDrawer={closeLimitDrawer} isEditFlag={false} ID={""} anchor={"right"} />)}
      </div >
    </>
  );
}

export default VolumeListing;
