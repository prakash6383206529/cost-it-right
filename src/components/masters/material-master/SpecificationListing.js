import React, { useState, useEffect, useCallback, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reduxForm } from "redux-form";
import { Row, Col } from "reactstrap";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import AddSpecification from "./AddSpecification";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { RmSpecification } from "../../../config/constants";
import { SPECIFICATIONLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { ApplyPermission } from ".";
import {
  getRMSpecificationDataList,
  deleteRMSpecificationAPI,
} from "../actions/Material";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter } from "../../../helper";
import Button from "../../layout/Button";
const gridOptions = {};
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const SpecificationListing = (props) => {
  const dispatch = useDispatch();
  const { rmSpecificationList } = useSelector((state) => state.material);
  const permissions = useContext(ApplyPermission);
  const [state, setState] = useState({
    isOpen: false,
    shown: false,
    isEditFlag: false,
    isBulkUpload: false,
    ID: "",
    specificationData: [],
    RawMaterial: [],
    RMGrade: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    showPopup: false,
    showPopup2: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
  });

  useEffect(() => {
    getSpecificationListData("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSpecificationListData = useCallback(
    (materialId = "", gradeId = "") => {
      const data = { MaterialId: materialId, GradeId: gradeId, };

      setState((prev) => ({ ...prev, isLoader: true }));
      dispatch(
        getRMSpecificationDataList(data, (res) => {
          if (res.status === 204 && res.data === "") {
            setState((prev) => ({
              ...prev,
              specificationData: [],
              isLoader: false,
            }));
          } else if (res && res.data && res.data.DataList) {
            const Data = res.data.DataList;
            setState((prev) => ({
              ...prev,
              specificationData: Data,
              isLoader: false,
            }));
          }
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const closeDrawer = useCallback(
    (e = "", data, type) => {
      setState(
        (prev) => ({
          ...prev, isOpen: false, dataCount: 0,
        }),
        () => {
          if (type === "submit") getSpecificationListData("", "");
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const editItemDetails = useCallback((Id) => {
    setState((prev) => ({
      ...prev, isEditFlag: true, isOpen: true, ID: Id,
    }));
  }, []);

  const openModel = useCallback(() => {
    setState((prev) => ({
      ...prev, isOpen: true, isEditFlag: false,
    }));
  }, []);
  /**
     * @method deleteItem
     * @description confirm delete RM Specification
     */
  const deleteItem = useCallback((Id) => {
    setState((prev) => ({ ...prev, showPopup: true, deletedId: Id }));
  }, []);
  /**
      * @method confirmDelete
      * @description confirm delete RM Specification
      */
  const confirmDelete = useCallback(
    (ID) => {
      const loggedInUser = loggedInUserId();
      dispatch(
        deleteRMSpecificationAPI(ID, loggedInUser, (res) => {
          if (res.status === 417 && res.data.Result === false) {
            Toaster.error(
              "The specification is associated in the system. Please remove the association to delete"
            );
          } else if (res && res.data && res.data.Result === true) {
            Toaster.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
            getSpecificationListData("", "");
            setState((prev) => ({ ...prev, dataCount: 0 }));
          }
          setState((prev) => ({ ...prev, showPopup: false }));
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPopupConfirm = useCallback(() => {
    confirmDelete(state.deletedId);
  }, [confirmDelete, state.deletedId]);
  /**
* @method buttonFormatter
* @description Renders buttons
*/
  const buttonFormatter = useCallback(
    (props) => {
      const cellValue = props?.value;
      const rowData = props?.data;
      return (
        <>
          {permissions.Edit && (
            <Button
              id={`rmSpecification_edit${props.rowIndex}`}
              className={"mr-1"}
              variant="Edit"
              onClick={() => editItemDetails(cellValue, rowData, false)}
              title={"Edit"}
            />
          )}
          {permissions.Delete && (
            <Button
              id={`rmSpecification_delete${props.rowIndex}`}
              className={"mr-1"}
              variant="Delete"
              onClick={() => deleteItem(cellValue)}
              title={"Delete"}
            />
          )}
        </>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      rmSpecificationList.length !== 0 &&
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
    }, 500);
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
        getSpecificationListData("", "");
      }
    );
  };


  const densityAlert = () => {
    setState((prevState) => ({ ...prevState, showPopup2: true }));
  };

  const confirmDensity = () => {
    props.toggle("4");
  };

  const onPopupConfirm2 = () => {
    confirmDensity(state.deletedId);
  };

  const closePopUp = () => {
    setState((propState) => ({
      ...propState,
      showPopup: false,
      showPopup2: false,
    }));
  };

  const onGridReady = (params) => {
    state.gridApi = params.api;
    state.gridApi.sizeColumnsToFit();
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

  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();

    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : rmSpecificationList
          ? rmSpecificationList
          : [];
    return returnExcelColumn(SPECIFICATIONLISTING_DOWNLOAD_EXCEl, tempArr);
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = [];
    temp =
      TempData &&
      TempData.map((item) => {
        if (item.RMName === "-") {
          item.RMName = " ";
        } else if (item.RMGrade === "-") {
          item.RMGrade = " ";
        }
        return item;
      });
    return (
      <ExcelSheet data={temp} name={RmSpecification}>
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
    state.gridApi.setQuickFilter(e.target.value);
  };

  const resetState = () => {
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState(null);
    state.gridApi.setFilterModel(null);
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

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({
      ...prevState,
      selectedRowData: selectedRows,
      dataCount: selectedRows?.length,
    }));
  };

  const { isOpen, isEditFlag, ID, isBulkUpload, noData } = state;
  const isFirstColumn = (params) => {
    const displayedColumns = params.columnApi.getAllDisplayedColumns();
    const thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  };

  const defaultColDef = {
    resizable: true, filter: true, sortable: false, headerCheckboxSelectionFilteredOnly: true, checkboxSelection: isFirstColumn,
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    hyphenFormatter: hyphenFormatter,
    customNoRowsOverlay: NoContentFound,
  };
  return (
    <div
      className={`ag-grid-react min-height100vh ${permissions.Download ? "show-table-btn" : ""
        }`}
    >
      {state.isLoader && <LoaderCustom />}
      <form noValidate>
        <Row className="pt-4">
          <Col md={6} className="text-right mb-3 search-user-block">
            {permissions.Add && (
              <Button
                id="rmSpecification_filter"
                className={"mr5"}
                onClick={openModel}
                title={"Add"}
                icon={"plus"}
              />
            )}
            {permissions.BulkUpload && (
              <Button
                id="rmSpecification_add"
                className={"mr5"}
                onClick={bulkToggle}
                title={"Bulk Upload"}
                icon={"upload"}
              />
            )}
            {permissions.Download && (
              <>
                <>
                  <ExcelFile
                    filename={"RM Specification"}
                    fileExtension={".xls"}
                    element={
                      <Button
                        className="mr5"
                        id={"rmSpecification_excel_download"}
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
      </form>

      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${(rmSpecificationList && rmSpecificationList?.length <= 0) ||
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
                rowData={rmSpecificationList}
                pagination={true}
                paginationPageSize={defaultPageSize}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                rowSelection={"multiple"}
                noRowsOverlayComponent={"customNoRowsOverlay"}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: "imagClass",
                }}
                onSelectionChanged={onRowSelect}
                frameworkComponents={frameworkComponents}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
              >
                <AgGridColumn field="RMName"></AgGridColumn>
                <AgGridColumn field="RMGrade" headerName="Grade"></AgGridColumn>
                <AgGridColumn field="RMSpec" headerName="Spec"></AgGridColumn>
                <AgGridColumn
                  field="RawMaterialCode"
                  headerName="Code"
                  cellRenderer="hyphenFormatter"
                ></AgGridColumn>
                <AgGridColumn
                  field="SpecificationId"
                  cellClass="ag-grid-action-container"
                  headerName="Action"
                  type="rightAligned"
                  floatingFilter={false}
                  cellRenderer={"totalValueRenderer"}
                ></AgGridColumn>
              </AgGridReact>
              {
                <PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />
              }
            </div>
          </div>
        </Col>
      </Row>
      {isOpen && (
        <AddSpecification
          isOpen={isOpen}
          closeDrawer={closeDrawer}
          isEditFlag={isEditFlag}
          ID={ID}
          anchor={"right"}
          AddAccessibilityRMANDGRADE={props.AddAccessibilityRMANDGRADE}
          EditAccessibilityRMANDGRADE={props.EditAccessibilityRMANDGRADE}
          isRMDomesticSpec={false}
        />
      )}
      {isBulkUpload && (
        <BulkUpload
          isOpen={isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          densityAlert={densityAlert}
          fileName={"RM Specification"}
          messageLabel={"RM Specification"}
          anchor={"right"}
        />
      )}
      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.SPECIFICATION_DELETE_ALERT}`}
        />
      )}
      {state.showPopup2 && (
        <PopupMsgWrapper
          isOpen={state.showPopup2}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm2}
          message={`Recently Created Material Density is not created, Do you want to create?`}
        />
      )}
    </div>
  );
};

export default reduxForm({
  form: "SpecificationListing",
  enableReinitialize: true,
})(SpecificationListing);
