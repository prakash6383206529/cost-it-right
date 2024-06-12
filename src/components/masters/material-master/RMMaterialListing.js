import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { deleteMaterialTypeAPI } from "../actions/Material";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { searchNocontentFilter, setLoremIpsum } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import AddRMDrawer from "./AddRMDrawer";
import { RMMATERIALISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { RmMaterial } from "../../../config/constants";
import ReactExport from "react-export-excel";
import BulkUpload from "../../massUpload/BulkUpload";
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import WarningMessage from '../../common/WarningMessage';
import { disabledClass } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import { getIndexDataListAPI } from "../actions/Indexation";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const RMMaterialListing = () => {
  const dispatch = useDispatch();
  const { rmIndexDataList } = useSelector((state) => state.indexation);
  const permissions = useContext(ApplyPermission);
  const { globalTakes } = useSelector((state) => state.pagination)
  const { t } = useTranslation("common")

  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    ID: "",
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    showPopup: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    render: false,
    showExtraData: false,
    isBulkUpload: false,
  });
  const [floatingFilterData, setFloatingFilterData] = useState({ IndexExchangeName: '' })
  const [isLoader, setIsLoader] = useState(false);
  const [totalRecordCount, setTotalRecordCount] = useState(1)
  const [filterModel, setFilterModel] = useState({});
  const [warningMessage, setWarningMessage] = useState(false)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  const [noData, setNoData] = useState(false)
  const [disableFilter, setDisableFilter] = useState(true)
  const [disableDownload, setDisableDownload] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [dataCount, setDataCount] = useState(0)
  const [gridLoad, setGridLoad] = useState(false);
  useEffect(() => {
    getTableListData(0, defaultPageSize, true)
    return () => {
      dispatch(resetStatePagination());

    }
  }, [])
  const getTableListData = (skip = 0, take = 10, isPagination = true) => {
    if (isPagination === true || isPagination === null) setIsLoader(true)
    let dataObj = { ...floatingFilterData }
    dispatch(getIndexDataListAPI(dataObj, isPagination, skip, take, (res) => {
      if (isPagination === true || isPagination === null) setIsLoader(false)
      if ((res && res.status === 204) || res.length === 0) {
        setTotalRecordCount(0)
        dispatch(updatePageNumber(0))
        // setPageNo(0)
      }
      if (res && isPagination === false) {
        setDisableDownload(false)
        dispatch(disabledClass(false))
        setTimeout(() => {
          let button = document.getElementById('Excel-Downloads-rmMaterialList')
          button && button.click()
        }, 500);
      }
      if (res) {
        let isReset = true
        setTimeout(() => {
          for (var prop in floatingFilterData) {
            if (floatingFilterData[prop] !== "") {
              isReset = false
            }
          }
          // Sets the filter model via the grid API
          isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))

        }, 300);

        setTimeout(() => {
          setWarningMessage(false)
        }, 330);

        setTimeout(() => {
          setIsFilterButtonClicked(false)
        }, 600);
      }
    }))
  }
  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  const closeDrawer = (e = "", formData, type) => {
    setState((prevState) => ({
      ...prevState, isOpen: false, isLoader: type === "submit" ? true : prevState.isLoader, dataCount: type === "submit" ? 0 : prevState.dataCount,
    }));
    if (type === "submit") {
      getTableListData();
    }
  };
  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (rmIndexDataList?.length !== 0) {
        setNoData(searchNocontentFilter(value, noData))
      }
    }, 500);
    setDisableFilter(false)
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model)
    if (!isFilterButtonClicked) {
      setWarningMessage(true)
    }

    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
      let isFilterEmpty = true
      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false
          for (var property in floatingFilterData) {
            if (property === value.column.colId) {
              floatingFilterData[property] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
        }

        if (isFilterEmpty) {
          setWarningMessage(false)
          for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""
          }
          setFloatingFilterData(floatingFilterData)
        }
      } else {
        setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
      }

    } else {

      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
    }
  }
  /**
   * @method editItemDetails
   * @description edit Raw Material
   */
  const editItemDetails = (Id) => {
    setState((prevState) => ({
      ...prevState, isEditFlag: true, isOpen: true, ID: Id,
    }));
  };
  /**
   * @method deleteItem
   * @description confirm delete Raw Material
   */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };

  const confirmDelete = (ID) => {
    dispatch(
      deleteMaterialTypeAPI(ID, (res) => {
        if (res.status === 417 && res.data.Result === false) {
          Toaster.error(res.data.Message);
        } else if (res && res.data && res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
          getTableListData();
        }
      })
    );
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const toggleExtraData = (showTour) => {
    setState((prevState) => ({ ...prevState, render: true, showExtraData: showTour }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, render: false }));
    }, 100);
  }
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  };

  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }));
  };

  const openModel = () => {
    setState((prevState) => ({
      ...prevState, isOpen: true, isEditFlag: false,
    }));
  };

  const buttonFormatter = (props) => {
    const { showExtraData } = state
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    let isEditbale = false
    let isDeleteButton = false
    isEditbale = permissions.Edit;
    isDeleteButton = (showExtraData && props.rowIndex === 0) || (permissions.Delete);

    return (
      <>
        {isEditbale && (
          <Button
            title="Edit"
            variant="Edit"
            id={`rmMaterialList_edit${props?.rowIndex}`}
            className="mr-2 Tour_List_Edit"
            onClick={() => editItemDetails(cellValue, rowData)}
          />
        )}
        {isDeleteButton && (
          <Button
            title="Delete"
            variant="Delete"
            className={"Tour_List_Delete"}
            id={`rmMaterialList_edit_delete${props?.rowIndex}`}
            onClick={() => deleteItem(cellValue)}
          />
        )}
      </>
    );
  };

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
    params.api.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }));
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length, }));
  };


  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  };


  const resetState = () => {
    setNoData(false)
    setIsFilterButtonClicked(false)
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);

    for (var prop in floatingFilterData) {
      floatingFilterData[prop] = ""

    }
    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    dispatch(resetStatePagination())
    getTableListData(0, 10, true)
    dispatch(updateGlobalTake(10))
    setDataCount(0)
    reactLocalStorage.setObject('selectedRow', {})
  }

  const onSearch = () => {
    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    dispatch(updatePageNumber(1))
    dispatch(updateCurrentRowIndex(0))
    gridOptions?.columnApi?.resetColumnState();
    getTableListData(0, globalTakes, true)
  }

  const { isOpen, isEditFlag, ID, showExtraData, render, isBulkUpload } = state;

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };
  
  const defaultColDef = {
    resizable: true,
    filter: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn,
  };
  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    hyphenFormatter: hyphenFormatter,
    customNoRowsOverlay: NoContentFound,
  };
  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : rmIndexDataList
          ? rmIndexDataList
          : [];
    return returnExcelColumn(RMMATERIALISTING_DOWNLOAD_EXCEl, tempArr);
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.RMName === "-") {
          item.RMName = " ";
        }
        if (item.RMGrade === "-") {
          item.RMGrade = " ";
        }
        return item;
      });
    return (
      <ExcelSheet data={temp} name={RmMaterial}>
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
  const bulkToggle = () => {
    setState((prevState) => ({ ...prevState, isBulkUpload: true }));
  };
  const closeBulkUploadDrawer = () => {
    setState(
      (prevState) => {
        return {
          ...prevState,
          isBulkUpload: false,
        };
      },
      () => {
        getTableListData("", "");
      }
    );
  };

  return (
    <div
      className={`ag-grid-react min-height100vh`}
    >
      {state.isLoader && <LoaderCustom customClass="loader-center" />}
      <Row className="pt-4">
        <Col md={9} className="search-user-block mb-3 pl-0">
          <div className="d-flex justify-content-end bd-highlight w100">
            <div className="d-flex justify-content-end bd-highlight w100">
              {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
              <Button id="rmMaerialListing_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
            </div>
            {/* {permissions.Add && (
            <Button id="rmSpecification_addMaterial" className="mr5 Tour_List_AddMaterial" onClick={openModel} title="Add Material" icon={"plus mr-0 ml5"} buttonName="M" />
          )} */}
            {permissions.BulkUpload && (<Button id="rmMaterialListing_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}

            {permissions.Download && (
              <>
                <>
                  <ExcelFile
                    filename={"Index Data"}
                    fileExtension={".xls"}
                    element={
                      <Button id={"Excel-Downloads-Rm MaterialList"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                    }
                  >
                    {onBtExport()}
                  </ExcelFile>
                </>
              </>
            )}
            <Button id={"rmMaterialListing_refresh"} className={" Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${true
              ? "overlay-contain"
              : ""
              }`}
          >
            <div className="ag-grid-header">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
              <TourWrapper
                buttonSpecificProp={{ id: "RM_Listing_Tour", onClick: toggleExtraData }}
                stepsSpecificProp={{
                  steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, bulkUpload: false, addButton: false, filterButton: false, costMovementButton: false, viewButton: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                }}
              />
            </div>
            <div
              className={`ag-theme-material ${state.isLoader && "max-loader-height"
                }`}
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
                // columnDefs={c}
                rowData={rmIndexDataList}

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
                frameworkComponents={frameworkComponents}
                onSelectionChanged={onRowSelect}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
              >

                <AgGridColumn field="IndexExchangeName" headerName="Index"></AgGridColumn>
                <AgGridColumn field="CommodityName" headerName="Commodity Name" ></AgGridColumn>
                <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date"></AgGridColumn>
                <AgGridColumn field="Rate" headerName="Index Rate (Currency)"></AgGridColumn>
                <AgGridColumn field="ExchangeRateSourceName" headerName="Premium (Charge)"></AgGridColumn>
                <AgGridColumn field="ExchangeRate" headerName="Exchange rate (INR)"></AgGridColumn>
                <AgGridColumn field="CurrencyCharge" headerName="Currency Rate"></AgGridColumn>
                <AgGridColumn field="RateConversion" headerName="Conversion Rate (INR)"></AgGridColumn>
                <AgGridColumn field="MaterialId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
              </AgGridReact>

              {<PaginationWrappers gridApi={state.gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="IndexData"/>}

            </div>
          </div>
        </Col>
      </Row>

      {isOpen && (<AddRMDrawer isEditFlag={isEditFlag} isOpen={isOpen} closeDrawer={closeDrawer} anchor={"right"} />)}

      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.MATERIAL1_DELETE_ALERT}`}
        />
      )}
      {isBulkUpload && (
        <BulkUpload
          isOpen={isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={"Index Data"}
          messageLabel={"Index Data"}
          anchor={"right"}
        />
      )}
    </div>
  );
};

export default RMMaterialListing;
