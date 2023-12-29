import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import AddMaterialType from "./AddMaterialType";
import {
  getMaterialTypeDataListAPI,
  deleteMaterialTypeAPI,
} from "../actions/Material";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import Association from "./Association";
import { RmMaterial } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { RMLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { PaginationWrapper } from "../../common/commonPagination";
import { searchNocontentFilter } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};
const RMListing = (props) => {
  const dispatch = useDispatch();
  const { rawMaterialTypeDataList } = useSelector((state) => state.material);
  const permissions = useContext(ApplyPermission);
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    ID: "",
    isOpenAssociation: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    showPopup: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
  });
  const [searchFilter, setSearchFilter] = useState("")
  useEffect(() => {
    getListData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**+-
   * @method getListData
   * @description Get list data
   */
  const getListData = () => {
    setState((prevState) => ({ ...prevState, isLoader: true }));
    dispatch(
      getMaterialTypeDataListAPI((res) =>
        setState((prevState) => ({ ...prevState, isLoader: false }))
      )
    );
  };
  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  const closeDrawer = (e = "", formData, type) => {
    setState((prevState) => ({
      ...prevState,isOpen: false,isLoader: type === "submit" ? true : prevState.isLoader, dataCount: type === "submit" ? 0 : prevState.dataCount,
   }));
    if (type === "submit") {
      getListData();
    }
  };
  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      rawMaterialTypeDataList.length !== 0 &&
        setState((prevState) => ({
          ...prevState,  noData: searchNocontentFilter(value, prevState.noData),}));
    }, 500);
  };
  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  const closeAssociationDrawer = (e = "") => {
    setState((prevState) => ({ ...prevState, isOpenAssociation: false }));
    getListData();
  };
  /**
   * @method editItemDetails
   * @description edit Raw Material
   */
  const editItemDetails = (Id) => {
    setState((prevState) => ({
      ...prevState,isEditFlag: true, isOpen: true, ID: Id, }));
  };
  /**
   * @method deleteItem
   * @description confirm delete Raw Material
   */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  };
  /**
   * @method confirmDelete
   * @description confirm delete Raw Material
   */

  const confirmDelete = (ID) => {
    dispatch(
      deleteMaterialTypeAPI(ID, (res) => {
        if (res.status === 417 && res.data.Result === false) {
          Toaster.error(res.data.Message);
        } else if (res && res.data && res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_MATERIAL_SUCCESS);
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
          getListData();
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

  const openModel = () => {
    setState((prevState) => ({
      ...prevState, isOpen: true,isEditFlag: false,}));
  };

  const openAssociationModel = () => {
    setState((prevState) => ({ ...prevState, isOpenAssociation: true }));
  };

  /**
   * @method buttonFormatter
   * @description show and hide edit and delete
   */
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    return (
      <>
        {permissions.Edit && (
          <Button
            title="Edit"
            variant="Edit"
            id={`addSpecificationList_edit${props?.rowIndex}`}
            className="mr-2"
            onClick={() => editItemDetails(cellValue, rowData)}
          />
        )}
        {permissions.Delete && (
          <Button
            title="Delete"
            variant="Delete"
            id={`addSpecificationList_delete${props?.rowIndex}`}
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

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({
      ...prevState,
      selectedRowData: selectedRows,
      dataCount: selectedRows.length,
    }));
  };

  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : rawMaterialTypeDataList
        ? rawMaterialTypeDataList
        : [];
    return returnExcelColumn(RMLISTING_DOWNLOAD_EXCEl, tempArr);
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

  const onFilterTextBoxChanged = (e) => {
    setSearchFilter(state.gridApi.setQuickFilter(e.target.value));
  };

  /**
   * @method resetState
   * @description Resets the state
   */
  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
        if (searchBox) {
            searchBox.value = ""; // Reset the input field's value
        }
        state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    
   
  };
  const { isOpen, isEditFlag, ID, noData } = state;

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

  return (
    <div
      className={`ag-grid-react min-height100vh ${
        permissions.Download ? "show-table-btn" : ""
      }`}
    >
      {state.isLoader && <LoaderCustom />}
      <Row className="pt-4 no-filter-row">
        <Col md={6} className="text-right search-user-block pr-0">
          {permissions.Add && (
            <Button
              id="rmSpecification_addAssociation"
              className="mr5"
              onClick={openAssociationModel}
              title="Add Association"
              icon="plus mr-0 ml5"
              buttonName="A"
            />
          )}
          {permissions.Add && (
            <Button
              id="rmSpecification_addMaterial"
              className="mr5"
              onClick={openModel}
              title="Add Material"
              icon={"plus mr-0 ml5"}
              buttonName="M"
            />
          )}
          {permissions.Download && (
            <>
              <>
                <ExcelFile
                  filename={"Rm Material"}
                  fileExtension={".xls"}
                  element={
                    <button
                      title={`Download ${
                        state.dataCount === 0
                          ? "All"
                          : "(" + state.dataCount + ")"
                      }`}
                      type="button"
                      className={"user-btn mr5"}
                    >
                      <div className="download mr-1"></div>
                      {`${
                        state.dataCount === 0
                          ? "All"
                          : "(" + state.dataCount + ")"
                      }`}
                    </button>
                  }
                >
                  {onBtExport()}
                </ExcelFile>
              </>
            </>
          )}
          <Button
            id={"rmSpecification_refresh"}
            onClick={() => resetState()}
            title={"Reset Grid"}
            icon={"refresh"}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${
              (rawMaterialTypeDataList &&
                props.rawMaterialTypeDataList?.length <= 0) ||
              noData
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
              className={`ag-theme-material ${
                state.isLoader && "max-loader-height"
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
                rowData={rawMaterialTypeDataList}
                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                // loadingOverlayComponent={'customLoadingOverlay'}
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
                {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                <AgGridColumn
                  field="RawMaterial"
                  headerName="Material"
                ></AgGridColumn>
                <AgGridColumn field="Density"></AgGridColumn>
                <AgGridColumn
                  field="RMName"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="RMGrade"
                  headerName="Grade"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="MaterialId"
                  cellClass="ag-grid-action-container"
                  headerName="Action"
                  type="rightAligned"
                  floatingFilter={false}
                  cellRenderer={"totalValueRenderer"}
                ></AgGridColumn>
              </AgGridReact>
              {
                <PaginationWrapper
                  gridApi={state.gridApi}
                  setPage={onPageSizeChanged}
                />
              }
            </div>
          </div>
        </Col>
      </Row>
      {isOpen && (
        <AddMaterialType
          isOpen={isOpen}
          closeDrawer={closeDrawer}
          isEditFlag={isEditFlag}
          ID={ID}
          anchor={"right"}
        />
      )}
      {state.isOpenAssociation && (
        <Association
          isOpen={state.isOpenAssociation}
          closeDrawer={closeAssociationDrawer}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.MATERIAL1_DELETE_ALERT}`}
        />
      )}
    </div>
  );
};

export default RMListing;
