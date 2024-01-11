import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col } from "reactstrap";
import { } from "../../../actions/Common";
import { getProductDataList, deleteProduct } from "../actions/Part";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import DayTime from "../../common/DayTimeWrapper";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import Toaster from "../../common/Toaster";
import { ComponentPart } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { INDIVIDUAL_PRODUCT_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { filterParams } from "../../common/DateFilter";
import { PaginationWrapper } from "../../common/commonPagination";
import { hyphenFormatter } from "../masterUtil";
import { searchNocontentFilter } from "../../../helper";
import { ApplyPermission } from ".";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const IndivisualProductListing = (props) => {
  const [tableData, setTableData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [deletedId, setDeletedId] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [noData, setNoData] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [searchText, setSearchText] = useState("")
  const dispatch = useDispatch();
  const permissions = useContext(ApplyPermission);

  useEffect(() => {
    getTableListData();
    // eslint-disable-next-line
  }, []);



  const getTableListData = () => {
    setIsLoader(true);
    dispatch(
      getProductDataList((res) => {
        setIsLoader(false);
        if (res.status === 204 && res.data === "") {
          setTableData([]);
          setIsLoader(false);
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList;
          setTableData(Data);
        } else {
        }
      })
    );
  };

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  const viewOrEditItemDetails = (Id, isViewMode) => {
    let requestData = {
      isEditFlag: true,
      Id: Id,
      isViewMode: isViewMode,
    };
    props.getDetails(requestData);
  };

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      props.productDataList.length !== 0 &&
        setNoData(searchNocontentFilter(value, noData));
    }, 500);
  };

  const deleteItem = (Id) => {
    setShowPopup(true);
    setDeletedId(Id);
  };

  const confirmDeleteItem = (ID) => {
    dispatch(
      deleteProduct(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.PRODUCT_DELETE_SUCCESS);
          getTableListData();
          setDataCount(0);
        }
      })
    );
    setShowPopup(false);
  };
  const onPopupConfirm = () => {
    confirmDeleteItem(deletedId);
  };
  const closePopUp = () => {
    setShowPopup(false);
  };

  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted
      ? props.valueFormatted
      : props?.value;
    return (
      <>
        {permissions.View && (<button title="View" className="View" type={"button"} onClick={() => viewOrEditItemDetails(cellValue, true)} />)}
        {permissions.View && (<button title="Edit" className="Edit mr-2" type={"button"} onClick={() => viewOrEditItemDetails(cellValue, false)} />)}
        {permissions.Delete && (<button title="Delete" className="Delete" type={"button"} onClick={() => deleteItem(cellValue)} />)}
      </>
    );
  };


  const effectiveDateFormatter = (props) => {
    let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (cellValue !== null && cellValue.includes("T")) {
      cellValue = DayTime(cellValue).format("DD/MM/YYYY");
      return cellValue;
    } else {
      return cellValue != null ? cellValue : "-";
    }
  };


  const bulkToggle = () => {
    setIsBulkUpload(true);
  };

  const closeBulkUploadDrawer = (event, type) => {
    if (type !== "cancel") {
      getTableListData();
    }
    setIsBulkUpload(false);
  };

  const formToggle = () => {
    props.formToggle();
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
    window.screen.width >= 1920 && params.api.sizeColumnsToFit();
  };

  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };
  const onRowSelect = () => {
    const selectedRows = gridApi?.getSelectedRows();
    setSelectedRowData(selectedRows);
    setDataCount(selectedRows.length);
  };
  const onBtExport = () => {
    let tempArr = [];
    tempArr = gridApi && gridApi?.getSelectedRows();
    tempArr =
      tempArr && tempArr.length > 0
        ? tempArr
        : props.productDataList
          ? props.productDataList
          : [];
    return returnExcelColumn(INDIVIDUAL_PRODUCT_DOWNLOAD_EXCEl, tempArr);
  };

  const returnExcelColumn = (data = [], tempArr) => {
    let temp = tempArr;
    temp &&
      temp.map((item) => {
        if (item.ECNNumber === null) {
          item.ECNNumber = " ";
        }
        if (item.RevisionNumber === null) {
          item.RevisionNumber = " ";
        }
        if (item.DrawingNumber === null) {
          item.DrawingNumber = " ";
        }
        if (item.EffectiveDate?.includes("T")) {
          item.EffectiveDate = DayTime(item.EffectiveDate).format("DD/MM/YYYY");
        }
        return item;
      });
    return (
      <ExcelSheet data={temp} name={ComponentPart}>
        {data &&
          data.map((ele, index) => (
            <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
          ))}
      </ExcelSheet>
    );
  };

  const onFilterTextBoxChanged = (e) => {
    setSearchText(gridApi.setQuickFilter(e.target.value))
  };

  const resetState = () => {

    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    gridApi.setQuickFilter(null)
    gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    if (window.screen.width >= 1600) {
      gridApi.sizeColumnsToFit();
    }
  };

  /**
    * @method impactCalculationFormatter
    * @description Renders buttons
    */
  const impactCalculationFormatter = (props) => {           //RE
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    let val = ''
    val = (cellValue === false || cellValue === null) ? 'No' : 'Yes'
    return val
  }

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
    effectiveDateFormatter: effectiveDateFormatter,
    hyphenFormatter: hyphenFormatter,
    impactCalculationFormatter: impactCalculationFormatter,            //RE
  };

  return (
    <div className={`ag-grid-react ${permissions.Download ? "show-table-btn" : ""}`} >
      {isLoader && <LoaderCustom />}
      <Row className="pt-4 no-filter-row">
        <Col md="8" className="filter-block"></Col>
        <Col md="6" className="search-user-block pr-0">
          <div className="d-flex justify-content-end bd-highlight w100">
            <div>
              {permissions.Add && (
                <button type="button" className={"user-btn mr5"} title="Add" onClick={formToggle} >
                  <div className={"plus mr-0"}></div>
                </button>
              )}

              {permissions.BulkUpload && (
                <button type="button" className={"user-btn mr5"} onClick={bulkToggle} title="Bulk Upload" >
                  <div className={"upload mr-0"}></div>
                  {/* Bulk Upload */}
                </button>
              )}

              {permissions.Download && (
                <>
                  <ExcelFile filename={"Product"} fileExtension={".xls"} element={<button title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" className={"user-btn mr5"} >
                    <div className="download mr-1"></div> {`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                  </button>} >  {onBtExport()}  </ExcelFile>
                </>
              )}
              <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()} >
                <div className="refresh mr-0"></div>
              </button>
            </div>
          </div>
        </Col>
      </Row>

      <div
        className={`ag-grid-wrapper height-width-wrapper ${(props.productDataList && props.productDataList?.length <= 0) || noData ? "overlay-contain" : ""}`} >
        <div className="ag-grid-header">
          <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
        </div>
        <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
          {noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />)}
          <AgGridReact
            defaultColDef={defaultColDef}
            floatingFilter={true}
            domLayout="autoHeight"
            rowData={tableData}
            pagination={true}
            paginationPageSize={defaultPageSize}
            onGridReady={onGridReady}
            gridOptions={gridOptions}
            noRowsOverlayComponent={"customNoRowsOverlay"}
            noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: "imagClass", }}
            rowSelection={"multiple"}
            onSelectionChanged={onRowSelect}
            frameworkComponents={frameworkComponents}
            onFilterModified={onFloatingFilterChanged}
            suppressRowClickSelection={true} >
            <AgGridColumn field="ProductNumber" headerName="Product No."></AgGridColumn>
            <AgGridColumn field="ProductName" headerName="Name"></AgGridColumn>
            {/* <AgGridColumn field="Description" headerName="Description" ></AgGridColumn>         //RE */}
            <AgGridColumn field="ProductGroupCode" headerName="Group Code" cellRenderer={"hyphenFormatter"}></AgGridColumn>
            <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
            <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
            <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={"hyphenFormatter"}></AgGridColumn>
            <AgGridColumn field="IsConsideredForMBOM" headerName="Preferred for Impact Calculation"></AgGridColumn>
            {/* <AgGridColumn field="IsConsideredForMBOM" headerName="Preferred for Impact Calculation" cellRenderer={'impactCalculationFormatter'}></AgGridColumn>      //RE */}
            <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
            <AgGridColumn field="ProductId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn></AgGridReact>
          {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
        </div>
      </div>
      {isBulkUpload && (
        <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={"Product Component"} isZBCVBCTemplate={false} messageLabel={"Product"} anchor={"right"} />
      )}
      {showPopup && (
        <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CONFIRM_DELETE}`} />
      )}
    </div>
  );
};

export default IndivisualProductListing;
