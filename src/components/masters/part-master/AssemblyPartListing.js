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
import { AssemblyPart } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { ASSEMBLYPART_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { filterParams } from "../../common/DateFilter";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { TourStartAction } from "../../../actions/Common";
import { showTitleForActiveToggle } from '../../../../src/helper/util';
import Switch from "react-switch";
import { useLabels, useWithLocalization } from "../../../helper/core";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const AssemblyPartListing = React.memo((props) => {
  // 
  const dispatch = useDispatch();
  const partsListing = useSelector((state) => state.part.partsListing);
  const initialConfiguration = useSelector(
    (state) => state.auth.initialConfiguration
  );
  const { getDetails } = props;

  const [tableData, setTableData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslation("common")
  const tourStartData = useSelector(state => state.comman.tourStartData);
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

  const permissions = useContext(ApplyPermission);

  const getTableListData = () => {
    setState((prevState) => ({
      ...prevState,
      isLoader: true,
    }));
    dispatch(
      getAssemblyPartDataList((res) => {
        setState((prevState) => ({
          ...prevState,
          isLoader: false,
        }));
        if (res.status === 204 && res.data === "") {
          setTableData([]);
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setTableData(Data);
        }
      })
    );
  };

  useEffect(() => {
    getTableListData();
    // eslint-disable-next-line
  }, []);

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
          getTableListData()
        }
      })
    );
  };

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);
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
        getTableListData();
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
    if (tourStartData?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
      return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
    }
  };

  const visualAdDetails = (cell) => {
    setState((prevState) => ({
      ...prevState,
      isOpenVisualDrawer: true,
      visualAdId: cell,
    }));
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      partsListing.length !== 0 &&
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
    }, 500);
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
          <Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!permissions.Activate} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
        </label>
      </>
    )
  }

  const buttonFormatter = useMemo(() => {
    return (props) => {
      const cellValue = props?.value;
      const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
      let isDeleteButton = false;

      if (tourStartData.showExtraData && props.rowIndex === 0) {
        isDeleteButton = true;
      } else {
        if (permissions.Delete && !rowData?.IsAssociate) {
          isDeleteButton = true;
        }
      }

      return (
        <>
          {permissions.View && (
            <button
              title="button"
              className="hirarchy-btn Tour_List_View_BOM"
              type={"button"}
              onClick={() => visualAdDetails(cellValue)}
            />
          )}
          {permissions.View && (
            <button
              title="View"
              className="View Tour_List_View"
              type={"button"}
              onClick={() => viewOrEditItemDetails(cellValue, true)}
            />
          )}
          {permissions.Edit && (
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
  }, [permissions.View, permissions.Edit, tourStartData.showExtraData]);



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
    let currentPage = state.gridApi.state.currPage;
    let sizePerPage = state.gridApi.state.sizePerPage;
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
      getTableListData();
    }
  };

  const frameworkComponents = {
    buttonFormatter: buttonFormatter,
    indexFormatter: indexFormatter,
    hyphenFormatter: hyphenFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    statusButtonFormatter: statusButtonFormatter,
  };

  const onGridReady = (params) => {
    window.screen.width >= 1600 && params.api.sizeColumnsToFit();
    setState((prevState) => ({
      ...prevState,
      gridApi: params.api,
      columnApi: params.columnApi,
    }));
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = useCallback(() => {
    if (state.gridApi) {
      const selectedRows = state.gridApi.getSelectedRows();
      // 
      setSelectedRowData(selectedRows);
      setState((prevState) => ({
        ...prevState,
        dataCount: selectedRows.length,
      }));
    }
  }, [state.gridApi]);
  const ASSEMBLYPART_DOWNLOAD_EXCEL_LOCALIZATION = useWithLocalization(ASSEMBLYPART_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = useCallback(() => {
    // Use the selectedRowData for export
    const tempArr = selectedRowData.length > 0 ? selectedRowData : tableData;
    const filteredLabels = ASSEMBLYPART_DOWNLOAD_EXCEL_LOCALIZATION.filter(column => {
      if (column.value === "UnitOfMeasurement") {
        return initialConfiguration?.IsShowUnitOfMeasurementInPartMaster
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr);
  }, [selectedRowData, tableData]);

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
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

        // Format dates if they are not empty
        if (item.EffectiveDate?.includes("T")) {
          newItem.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
        }
        // Set IsActive status
        newItem.IsActive = item.IsActive ? 'Active' : 'Inactive';

        return newItem;
      });
    return (
      <ExcelSheet data={temp} name={AssemblyPart}>
        {data && data.map((ele, index) => (
          <ExcelColumn
            key={index} // index as key is generally an anti-pattern, use unique identifiers from `ele` if available
            label={ele.label}
            value={ele.value}
            style={ele.style}
          />
        ))}
      </ExcelSheet>
    );
  };

  const onFilterTextBoxChanged = (e) => {
    setSearchText(state.gridApi.setQuickFilter(e.target.value))
  };

  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    // if (window.screen.width >= 1600) {
    //   state.gridApi.sizeColumnsToFit();
    // }
  };

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



  return (
    <div
      className={`ag-grid-react p-relative ${permissions.Download ? "show-table-btn" : ""
        }`}
    >
      {state.isLoader ? <LoaderCustom /> : ""}
      <Row className="pt-4 no-filter-row">
        <Col md="8" className="filter-block"></Col>
        <Col md="6" className="search-user-block pr-0">
          <div className="d-flex justify-content-end bd-highlight w100">
            <div>
              {permissions.Add && (
                <button
                  type="button"
                  className={"user-btn mr5 Tour_List_Add"}
                  title="Add"
                  onClick={displayForm}
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
                  <ExcelFile
                    filename={"BOM"}
                    fileExtension={".xls"}
                    element={
                      <button
                        title={`Download ${state.dataCount === 0
                          ? "All"
                          : `(${state.dataCount})`
                          }`}
                        type="button"
                        className={"user-btn mr5 Tour_List_Download"}
                        onClick={onBtExport}
                      >
                        <div className="download mr-1"></div>
                        {`${state.dataCount === 0
                          ? "All"
                          : `(${state.dataCount})`
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
      {Object.keys(permissions).length > 0 && (
        <div
          className={`ag-grid-wrapper height-width-wrapper ${(partsListing && partsListing?.length <= 0) || state.noData
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
            <TourWrapper
              buttonSpecificProp={{ id: "Assembly_Part_Listing_Tour", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { addLimit: false, costMovementButton: false, updateAssociatedTechnology: false, copyButton: false, status: false, filterButton: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
              }} />
          </div>
          <div
            className={`ag-theme-material ${state.isLoader && "max-loader-height"
              }`}
          >
            {state.noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found"
            />
            )}
            {(!state.render) ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

              style={{ height: '100%', width: '100%' }}
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout="autoHeight"
              rowData={tourStartData.showExtraData ? [...setLoremIpsum(partsListing[0]), ...partsListing] : partsListing}

              pagination={true}
              paginationPageSize={defaultPageSize}
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
            >
              <AgGridColumn cellClass="has-checkbox" field="Technology" headerName={technologyLabel} cellRenderer={"checkBoxRenderer"}              ></AgGridColumn>
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
              <AgGridColumn field="Division" headerName="Division" cellRenderer={"hyphenFormatter"}  ></AgGridColumn>
              <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" filterParams={filterParams}              ></AgGridColumn>
              <AgGridColumn pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={"statusButtonFormatter"} ></AgGridColumn>
              <AgGridColumn field="PartId" width={250} cellClass="ag-grid-action-container actions-wrapper" headerName="Action" pinned={window.screen.width < 1920 ? "right" : ""} type="rightAligned" floatingFilter={false} cellRenderer={"buttonFormatter"}              ></AgGridColumn>
            </AgGridReact>}

            {
              <PaginationWrapper
                gridApi={state.gridApi}
                setPage={onPageSizeChanged}
              />
            }
          </div>
        </div>
      )}
      {state.isOpenVisualDrawer && (
        <BOMViewer
          isOpen={state.isOpenVisualDrawer}
          closeDrawer={closeVisualDrawer}
          isEditFlag={true}
          PartId={state.visualAdId}
          anchor={"right"}
          isFromVishualAd={true}
          NewAddedLevelOneChilds={[]}
        />
      )}
      {state.isBulkUpload && (
        <BOMUploadDrawer
          isOpen={state.isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"BOM"}
          messageLabel={"BOM"}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.BOM_DELETE_ALERT}`}
        />
      )}
      {state.showPopupToggle && (
        <PopupMsgWrapper
          isOpen={state.showPopupToggle}
          closePopUp={closeTogglePopup}
          confirmPopup={onPopupToggleConfirm}
          message={`${state.cell ? MESSAGES.PART_DEACTIVE_ALERT : MESSAGES.PART_ACTIVE_ALERT}`} />)}
    </div>
  );
});

export default AssemblyPartListing;
