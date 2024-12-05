import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { getAssemblyPartDataList, deleteAssemblyPart, activeInactivePartUser } from "../actions/Part";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import DayTime from "../../common/DayTimeWrapper";
import BOMViewer from "./BOMViewer";
import BOMUploadDrawer from "../../massUpload/BOMUpload";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import { ASSEMBLYPART_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { disabledClass, TourStartAction } from "../../../actions/Common";
import { showTitleForActiveToggle } from '../../../../src/helper/util';
import Switch from "react-switch";
import { useLabels, useWithLocalization } from "../../../helper/core";
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import PaginationControls from "../../common/Pagination/PaginationControls";
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from "../../common/Pagination/paginationAction";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import WarningMessage from "../../common/WarningMessage";
import Button from "../../layout/Button";
import { reactLocalStorage } from "reactjs-localstorage";
import _ from "lodash";
const ExcelFile = ReactExport?.ExcelFile;
const ExcelSheet = ReactExport?.ExcelFile?.ExcelSheet;
const ExcelColumn = ReactExport?.ExcelFile?.ExcelColumn;
const gridOptions = {};

const AssemblyPartListing = React.memo((props) => {
  // 
  const dispatch = useDispatch();
  const partsListing = useSelector((state) => state?.part?.partsListing);
  const initialConfiguration = useSelector(
    (state) => state?.auth?.initialConfiguration
  );
  const { getDetails, apply } = props;

  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation("common")
  const tourStartData = useSelector(state => state?.comman?.tourStartData);
  const { technologyLabel } = useLabels();
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
    Id: "",
    isViewMode: false,
    isActivate: false,
    isDownload: false,
    gridApi: null,
    columnApi: null,
    paginationPageSize: defaultPageSize,
    openTechnologyUpdateDrawer: false,
    render: true,
    rowData: null,
    row: [],
    cell: [],
    showPopupToggle: false,
    showPopupToggle2: false,
  });
  const { isSimulation } = props;
  const { selectedRowForPagination } = useSelector((state => state?.simulation))
  const [filterModel, setFilterModel] = useState({});
  const { globalTakes } = useSelector((state) => state?.pagination);
  const [disableFilter, setDisableFilter] = useState(true)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  const [warningMessage, setWarningMessage] = useState(false)
  const [disableDownload, setDisableDownload] = useState(false)
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [floatingFilterData, setFloatingFilterData] = useState({
    BOMNumber: "", PartNumber: "", PartName: "", NumberOfParts: "", BOMLevelCount: "", Technology
      : "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", UnitOfMeasurementSymbol: "", EffectiveDateNew
      : "", isApplyPagination: true, skip: 0, take: 10,
  });

  const permissions = useContext(ApplyPermission);

  const getTableListData = (newSkip, numericPageSize, floatingFilterData, isPagination) => {
    setState((prevState) => ({
      ...prevState,
      isLoader: true,
    }));

    const params = {
      bomNumber: floatingFilterData?.BOMNumber,
      partNumber: floatingFilterData?.PartNumber,
      name: floatingFilterData?.PartName,
      noOfChildParts: floatingFilterData?.NumberOfParts,
      bomLevelCount: floatingFilterData?.BOMLevelCount,
      technology: floatingFilterData?.Technology,
      ecnNumber: floatingFilterData?.ECNNumber,
      revisionNumber: floatingFilterData?.RevisionNumber,
      drawingNumber: floatingFilterData?.DrawingNumber,
      unitOfMeasurement: floatingFilterData?.UnitOfMeasurementSymbol,
      effectiveDate: floatingFilterData?.EffectiveDateNew,
      isApplyPagination: isPagination,
      skip: newSkip,
      take: numericPageSize,
    };

    dispatch(
      getAssemblyPartDataList(params, (res) => {
        setState((prevState) => ({
          ...prevState,
          isLoader: false,
        }));

        let isReset = true;
        Object.keys(floatingFilterData).forEach((prop) => {
          if (floatingFilterData[prop] !== "") {
            isReset = false;
          }
        });

        setTimeout(() => {
          if (isReset) {
            gridOptions?.api?.setFilterModel({});
          } else {
            gridOptions?.api?.setFilterModel(filterModel);
          }
        }, 300);

        if (res?.status === 204 && res?.data === "") {
          setTotalRecordCount(0);
          setState((prevState) => ({ ...prevState, noData: true }))
          dispatch(updatePageNumber(0))
          setSelectedRowForPagination([]);
        } else if (res?.data?.DataList) {
          const data = res?.data?.DataList;
          setTotalRecordCount(data[0]?.TotalRecordCount || 0);
          setTableData(data);
          setTimeout(() => {
            setWarningMessage(false);
          }, 300);

          if (!isPagination) {
            setTimeout(() => {
              dispatch(disabledClass(false));
              const button = document.getElementById("Excel-Downloads-BOM");
              if (button) button.click();
            }, 500);
          }
        }
      })
    );
  };




  useEffect(() => {
    getTableListData(0, 10, floatingFilterData, true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    reactLocalStorage.setObject('selectedRow', {})
    if (!props.stopApiCallOnCancel) {
      return () => {
        dispatch(setSelectedRowForPagination([]))
        dispatch(resetStatePagination());

        reactLocalStorage.setObject('selectedRow', {})
      }
    }
  }, [])

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
      deleteAssemblyPart(ID, loggedInUserId(), (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.PART_DELETE_SUCCESSFULLY);
          getTableListData(0, 10, floatingFilterData, true)
        }
      })
    );
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(state?.deletedId);
  };


  /**
    * @method onPopupToggleConfirm
    * @description popup for toggle status
    */
  const onPopupToggleConfirm = () => {
    let data = { Id: state?.row?.PartId, LoggedInUserId: loggedInUserId(), IsActive: !state?.cell, }
    dispatch(activeInactivePartUser(data, (res) => {
      if (res && res?.data && res?.data?.Result) {
        if (Boolean(state?.cell) === true) {
          Toaster.success(MESSAGES.PART_INACTIVE_SUCCESSFULLY)
        } else {
          Toaster.success(MESSAGES.PART_ACTIVE_SUCCESSFULLY)

        }
        getTableListData(0, 10, floatingFilterData, true);
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
      }
    }))
    setState((prevState) => ({ ...prevState, showPopupToggle: false }))
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }))

  }
  const closePopUp = () => {
    // Correctly access the previous state using a callback function
    setState((prevState) => ({
      ...prevState,
      showPopup: false,
    }));
  };

  /**
     * @method closeTogglePopup
     * @description used for closing status toggle popup
     */
  const closeTogglePopup = () => {
    setState((prevState) => ({ ...prevState, showPopupToggle: false }))
    setState((prevState) => ({ ...prevState, showPopupToggle2: false }))
  }
  const effectiveDateFormatter = (props) => {
    if (props?.value) {
      const cellValue = props.value;
      return DayTime(cellValue).format('DD/MM/YYYY')
    }
    return "";
  };


  const visualAdDetails = (cell) => {
    setState((prevState) => ({
      ...prevState,
      isOpenVisualDrawer: true,
      visualAdId: cell,
    }));
  };

  var filterParams = ({
    date: "",
    inRangeInclusive: true,
    filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      if (!cellValue || typeof cellValue !== 'string') {
        return -1;
      }

      var dateAsString = cellValue?.split('T')[0];
      var newDate = filterLocalDateAtMidnight != null
        ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY')
        : '';
      setDate(newDate);

      if (dateAsString == null) {
        return -1;
      }

      var dateParts = dateAsString?.split('-');
      var cellDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
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
  });

  var setDate = (date) => {
    setFloatingFilterData((prevState) => ({ ...prevState, EffectiveDateNew: date }));
  };

  const onSearch = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
    }));
    setWarningMessage(false);
    setIsFilterButtonClicked(true);
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(10));
    gridOptions?.columnApi?.resetColumnState();
    getTableListData(0, 10, floatingFilterData, true);
  };

  useEffect(() => {
    reactLocalStorage.setObject('selectedRow', {})
    if (!props.stopApiCallOnCancel) {
      return () => {
        dispatch(setSelectedRowForPagination([]))
        dispatch(resetStatePagination());

        reactLocalStorage.setObject('selectedRow', {})
      }
    }
  }, [])

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (partsListing?.length !== 0) {
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state?.noData),
        }));
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
      if (model && Object.keys(model)?.length > 0) {
        isFilterEmpty = false;
        setFloatingFilterData((prevData) => ({
          ...prevData,
          [value.column.colId]: "",
        }));
      }

      if (isFilterEmpty) {
        setWarningMessage(false);
        setFloatingFilterData((prevData) =>
          Object.keys(prevData).reduce((acc, key) => {
            acc[key] = "";
            return acc;
          }, {})
        );
      }
    } else {
      if (value?.column?.colId === "EffectiveDateNew") {
        return false;
      }
      setFloatingFilterData((prevData) => ({
        ...prevData,
        [value?.column?.colId]: value?.filterInstance?.appliedModel?.filter,
      }));
    }
  };

  /**
               @method toggleExtraData
               @description Handle specific module tour state to display lorem data
              */
  const toggleExtraData = (showTour) => {
    dispatch(TourStartAction({
      showExtraData: showTour,
    }));
    setState((prevState) => ({ ...prevState, render: false }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, render: true }));
    }, 100);

  }
  const closeVisualDrawer = () => {
    setState((prevState) => ({
      ...prevState,
      isOpenVisualDrawer: false,
    }));
  };
  // 
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
          <Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!permissions?.Activate} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
        </label>
      </>
    )
  }

  const buttonFormatter = useMemo(() => {
    return (props) => {
      const cellValue = props?.value;
      const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
      let isDeleteButton = false;

      if (tourStartData?.showExtraData && props?.rowIndex === 0) {
        isDeleteButton = true;
      } else {
        if (permissions?.Delete && !rowData?.IsAssociate) {
          isDeleteButton = true;
        }
      }

      return (
        <>
          {permissions?.View && (
            <button
              title="button"
              className="hirarchy-btn Tour_List_View_BOM"
              type={"button"}
              onClick={() => visualAdDetails(cellValue)}
            />
          )}
          {permissions?.View && (
            <button
              title="View"
              className="View Tour_List_View"
              type={"button"}
              onClick={() => viewOrEditItemDetails(cellValue, true)}
            />
          )}
          {permissions?.Edit && (
            <button
              title="Edit"
              className="Edit Tour_List_Edit"
              type={"button"}
              onClick={() => viewOrEditItemDetails(cellValue, false)}
            />
          )}
          {isDeleteButton && (
            <button
              title="Delete"
              className="Delete Tour_List_Delete"
              type={"button"}
              onClick={() => deleteItem(cellValue)}
            />
          )}
        </>
      );
    };
  }, [permissions?.View, permissions?.Edit, tourStartData?.showExtraData]);



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
    let currentPage = state?.gridApi.state?.currPage;
    let sizePerPage = state?.gridApi.state?.sizePerPage;
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
      getTableListData(0, 10, floatingFilterData, true);
    }
  };

  const checkBoxRenderer = (props) => {
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.PartId === props?.node?.data?.PartId) {
          props.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }
  }

  const frameworkComponents = {
    buttonFormatter: buttonFormatter,
    indexFormatter: indexFormatter,
    hyphenFormatter: hyphenFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    statusButtonFormatter: statusButtonFormatter,
    checkBoxRenderer: checkBoxRenderer,
  };

  const onGridReady = (params) => {
    setState((prevState) => ({ ...prevState, gridApi: params?.api, gridColumnApi: params?.columnApi }))
    params.api.paginationGoToPage(0);
    window.screen.width >= 1920 && params.api.sizeColumnsToFit()
  };


  const onRowSelect = () => {
    const selectedRows = state.gridApi.getSelectedRows();
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow')?.selectedRow || [];

    const allNodes = [];
    state.gridApi.forEachNode(node => allNodes?.push(node));

    allNodes?.forEach(node => {
      const rowData = node.data;

      if (node?.isSelected()) {
        if (!selectedRowForPagination?.some(existingRow => existingRow?.PartId === rowData?.PartId)) {
          selectedRowForPagination?.push(rowData);
        }
      } else {
        const indexToRemove = selectedRowForPagination?.findIndex(existingRow => existingRow?.PartId === rowData?.PartId);
        if (indexToRemove !== -1) {
          selectedRowForPagination?.splice(indexToRemove, 1);
        }
      }
    });

    const uniqueSelectedRows = _.uniqBy(selectedRowForPagination, "PartId");
    reactLocalStorage.setObject('selectedRow', { selectedRow: uniqueSelectedRows });

    setState((prevState) => ({
      ...prevState,
      dataCount: uniqueSelectedRows.length,
    }));
    dispatch(setSelectedRowForPagination(uniqueSelectedRows));
  };


  const ASSEMBLYPART_DOWNLOAD_EXCEL_LOCALIZATION = useWithLocalization(ASSEMBLYPART_DOWNLOAD_EXCEl, "MasterLabels")

  const onExcelDownload = () => {
    setDisableDownload(true);
    dispatch(disabledClass(true));

    let tempArr = selectedRowForPagination;
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setDisableDownload(false);
        dispatch(disabledClass(false));
        let button = document.getElementById('Excel-Downloads-BOM');
        button && button.click();
      }, 400);
    } else {
      getTableListData(0, globalTakes, floatingFilterData, false);
    }
  };

  const onBtExport = () => {
    let tempArr = [];
    tempArr = selectedRowForPagination
    if (tempArr?.length === 0) {
      tempArr = tableData;
    }

    if (tempArr?.length > 0) {
      const filteredLabels = ASSEMBLYPART_DOWNLOAD_EXCEL_LOCALIZATION.filter(column => {
        if (column?.value === "UnitOfMeasurement") {
          return initialConfiguration?.IsShowUnitOfMeasurementInPartMaster;
        }
        if (column?.value === "SAPCode") {
          return initialConfiguration?.IsSAPCodeRequired;
        }
        return true;
      });
      return returnExcelColumn(filteredLabels, tempArr);
    } else {
      return null;
    }
  };

  const returnExcelColumn = (data = [], TempData) => {
    const temp =
      TempData &&
      TempData?.map((item) => {
        let newItem = { ...item };

        // Default fallback values
        const defaultValues = {
          ECNNumber: " ",
          RevisionNumber: " ",
          DrawingNumber: " ",
          Technology: " ",
        };

        // Replace null or "-" with defaults
        Object.keys(defaultValues).forEach((key) => {
          if (item[key] === null || item[key] === "-") {
            newItem[key] = defaultValues[key];
          }
        });

        // Format EffectiveDate to 'DD/MM/YYYY'
        if (item?.EffectiveDate?.includes("T")) {
          newItem.EffectiveDate = DayTime(item?.EffectiveDate).format("DD/MM/YYYY");
        }

        // Format IsActive field
        newItem.IsActive = item?.IsActive ? "Active" : "Inactive";

        return newItem;
      });

    return (
      <ExcelSheet data={temp} name={"AssemblyPart"}>
        {data &&
          data?.map((ele, index) => (
            <ExcelColumn
              key={index}
              label={ele?.label}
              value={ele?.value}
              style={ele?.style}
            />
          ))}
      </ExcelSheet>
    );
  };



  const onFilterTextBoxChanged = (e) => {
    setSearchText(state?.gridApi.setQuickFilter(e.target.value))
  };

  const resetState = () => {
    setState(prevState => ({
      ...prevState,
      dataCount: 0,
      noData: false
    }));
    setSearchText("")
    state?.gridApi?.setQuickFilter(null)
    setIsFilterButtonClicked(false);
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);

    for (let prop in floatingFilterData) {
      floatingFilterData[prop] = "";
    }

    setWarningMessage(false);
    setFloatingFilterData(floatingFilterData);
    dispatch(updatePageNumber(1));
    getTableListData(0, 10, floatingFilterData, true);
    setDisableFilter(true);
    dispatch(updateCurrentRowIndex(10));
    dispatch(setSelectedRowForPagination([]));
    dispatch(updateGlobalTake(10));
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }));
    dispatch(resetStatePagination());
    reactLocalStorage.remove('selectedRow');
    if (isSimulation) {
      props?.isReset();
    }
  };

  const isFirstColumn = (params) => {
    var displayedColumns = params?.columnApi?.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params?.column;
    return thisIsFirstColumn;
  };

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelection: (isSimulation || props?.benchMark) ? isFirstColumn : false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn,
  };


  return (
    <div
      className={`ag-grid-react custom-pagination p-relative ${permissions?.Download ? "show-table-btn" : ""
        }`}
    >
      {state?.isLoader ? <LoaderCustom /> : ""}
      <Row className="pt-4 no-filter-row">
        <Col md="8" className="filter-block"></Col>
        <Col md="6" className="search-user-block pr-0">
          <div className="d-flex justify-content-end bd-highlight w100">
            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
            <div>

              <button
                id="assemblyPartListing_filter"
                type="button"
                className={"user-btn mr5 Tour_List_Filter"}
                onClick={() => onSearch()}
                title="Filter"
                disabled={disableFilter}
              >
                <div className={"filter mr-0"}></div>
              </button>
              {permissions?.Add && (
                <button
                  type="button"
                  className={"user-btn mr5 Tour_List_Add"}
                  title="Add"
                  onClick={displayForm}
                >
                  <div className={"plus mr-0"}></div>
                </button>
              )}
              {permissions?.BulkUpload && (
                <button
                  type="button"
                  className={"user-btn mr5 Tour_List_BulkUpload"}
                  onClick={bulkToggle}
                  title="Bulk Upload"
                >
                  <div className={"upload mr-0"}></div>
                </button>
              )}
              {permissions?.Download && (
                <>
                  <button title={`Download ${state?.dataCount === 0 ? "All" : "(" + state?.dataCount + ")"}`} type="button" onClick={onExcelDownload} className={'user-btn mr5 Tour_List_Download'}><div className="download mr-1" title="Download"></div>  {`${state?.dataCount === 0 ? "All" : "(" + state?.dataCount + ")"}`} </button>
                  <ExcelFile
                    filename={'BOM'}
                    fileExtension={'.xls'}
                    element={
                      <Button
                        id={"Excel-Downloads-BOM"}
                        className="p-absolute"
                        onClick={onBtExport}
                      />
                    }
                  >
                    {onBtExport()}
                  </ExcelFile>
                </>
              )}
              <button
                type="button"
                className="user-btn Tour_List_Reset "
                title="Reset Grid"
                onClick={() => resetState()}
              >
                <div className="refresh mr-0"></div>
              </button>
            </div>
          </div>
        </Col>
      </Row>
      {Object.keys(permissions)?.length > 0 && (
        <div
          className={`ag-grid-wrapper height-width-wrapper ${(partsListing && partsListing?.length <= 0) || state?.noData
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
              value={searchText}
              onChange={(e) => onFilterTextBoxChanged(e)}
            />
            <TourWrapper
              buttonSpecificProp={{ id: "Assembly_Part_Listing_Tour", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { addLimit: false, costMovementButton: false, updateAssociatedTechnology: false, copyButton: false, status: false, filterButton: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
              }} />
          </div>
          <div
            className={`ag-theme-material ${state?.isLoader && "max-loader-height"
              }`}
          >
            {state?.noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found"
            />
            )}
            {(!state?.render) ? <LoaderCustom customClass="loader-center" /> :
              <AgGridReact

                style={{ height: '100%', width: '100%' }}
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout="autoHeight"
                rowData={tourStartData?.showExtraData ? [...setLoremIpsum(partsListing[0]), ...partsListing] : partsListing}
                pagination={true}
                paginationPageSize={globalTakes}
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
                enableBrowserTooltips={true}
              >
                <AgGridColumn cellClass="has-checkbox" field="Technology" headerName={technologyLabel} cellRenderer={checkBoxRenderer}              ></AgGridColumn>
                <AgGridColumn field="BOMNumber" headerName="BOM No."              ></AgGridColumn>
                <AgGridColumn field="PartNumber" headerName="Part No."              ></AgGridColumn>
                <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                {initialConfiguration?.IsSAPCodeRequired && (
                  <AgGridColumn field="SAPCode" headerName="SAP Code" cellRenderer={"hyphenFormatter"}                ></AgGridColumn>
                )}
                <AgGridColumn field="NumberOfParts" headerName="No. of Child Parts"              ></AgGridColumn>
                <AgGridColumn field="BOMLevelCount" headerName="BOM Level Count" ></AgGridColumn>
                <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={"hyphenFormatter"}></AgGridColumn>
                {initialConfiguration?.IsShowUnitOfMeasurementInPartMaster && <AgGridColumn field="UnitOfMeasurementSymbol" headerName="UOM" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>}

                <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" filterParams={filterParams}              ></AgGridColumn>
                <AgGridColumn pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={"statusButtonFormatter"} ></AgGridColumn>
                <AgGridColumn field="PartId" width={250} cellClass="ag-grid-action-container actions-wrapper" headerName="Action" pinned={window.screen.width < 1920 ? "right" : ""} type="rightAligned" floatingFilter={false} cellRenderer={"buttonFormatter"}              ></AgGridColumn>
              </AgGridReact>}
            <div className='button-wrapper'>
              {<PaginationWrappers gridApi={state?.gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="AssemblyPart" />}
              <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="AssemblyPart" />
            </div>
          </div>
        </div>
      )}
      {state?.isOpenVisualDrawer && (
        <BOMViewer
          isOpen={state?.isOpenVisualDrawer}
          closeDrawer={closeVisualDrawer}
          isEditFlag={true}
          PartId={state?.visualAdId}
          anchor={"right"}
          isFromVishualAd={true}
          NewAddedLevelOneChilds={[]}
        />
      )}
      {state?.isBulkUpload && (
        <BOMUploadDrawer
          isOpen={state?.isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"BOM"}
          messageLabel={"BOM"}
          anchor={"right"}
        />
      )}
      {state?.showPopup && (
        <PopupMsgWrapper
          isOpen={state?.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.BOM_DELETE_ALERT}`}
        />
      )}
      {state?.showPopupToggle && (
        <PopupMsgWrapper
          isOpen={state?.showPopupToggle}
          closePopUp={closeTogglePopup}
          confirmPopup={onPopupToggleConfirm}
          message={`${state?.cell ? MESSAGES.PART_DEACTIVE_ALERT : MESSAGES.PART_ACTIVE_ALERT}`} />)}
    </div>
  );
});

export default AssemblyPartListing;
