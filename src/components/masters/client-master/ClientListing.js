import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import Toaster from "../../common/Toaster";
import { MESSAGES } from "../../../config/message";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { getClientDataList, deleteClient } from "../actions/Client";
import AddClientDrawer from "./AddClientDrawer";
import { checkPermission, searchNocontentFilter } from "../../../helper/util";
import { CLIENT, Clientmaster, MASTERS } from "../../../config/constants";
import LoaderCustom from "../../common/LoaderCustom";
import ReactExport from "react-export-excel";
import { CLIENT_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import ScrollToTop from "../../common/ScrollToTop";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId } from "../../../helper";
import Button from '../../layout/Button';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const ExcelFile = ReactExport.ExcelFile;
const gridOptions = {};

const ClientListing = React.memo(() => {

  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const clientDataList = useSelector((state) => state.client.clientDataList);
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  const [state, setState] = useState({
    isEditFlag: false,
    isOpenVendor: false,
    tableData: [],
    ID: "",
    isViewMode: false,
    ViewAccessibility: false,
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    DownloadAccessibility: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ["columns"] },
    showData: false,
    showPopup: false,
    deletedId: "",
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,

  });

  useEffect(() => {
    console.log("11111")
    if (!topAndLeftMenuData) {
      setState(prevState => ({ ...prevState, isLoader: true }));
      return;
    }

    applyPermission(topAndLeftMenuData);
    getTableListData();

    setTimeout(() => {
      setState(prevState => ({ ...prevState, isLoader: false }));
    }, 400);

    // return () => clearTimeout(loaderTimeout);

  }, [topAndLeftMenuData]);



  useEffect(() => {
    if (topAndLeftMenuData) {
      console.log("hi2")

      setState((prevState) => ({ ...prevState, isLoader: true }));
      applyPermission(topAndLeftMenuData);
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, isLoader: false }));
      }, 200);
    }
  }, [topAndLeftMenuData]);

  /**
     * @method applyPermission
     * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
     */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === CLIENT);
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionData !== undefined) {
        setState((prevState) => ({
          ...prevState,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        }));
      }
    }
  }
  /**
     * @method buttonFormatter
     * @description Renders buttons
     */

  const buttonFormatter = (props) => {
    const { ViewAccessibility, EditAccessibility, DeleteAccessibility } = state;
    console.log("ViewAccessibility", ViewAccessibility, EditAccessibility, DeleteAccessibility);
    const cellValue = props?.value;

    return (
      <>
        {ViewAccessibility && (<Button id={`clientListing_View${props.rowIndex}`} className={"View mr-2"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, true)} title={"View"} />
        )}
        {EditAccessibility && (<Button id={`clientListing_edit${props.rowIndex}`} className={"Edit mr-2"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, false)} title={"Edit"} />
        )}
        {DeleteAccessibility && (<Button id={`clientListing_delete${props.rowIndex}`} className={"Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />
        )}
      </>
    );
  }


  /**
   * @method getTableListData
   * @description Get user list data
   */

  const getTableListData = useCallback((clientName = null, companyName = null) => {
    const filterData = {
      clientName: clientName,
      companyName: companyName,
    };

    dispatch(
      getClientDataList(filterData, (res) => {
        if (res.status === 204 && res.data === "") {
          setState((prevState) => ({ ...prevState, tableData: [], isLoader: false, }));
        } else if (res && res.data && res.data.DataList) {
          const Data = res.data.DataList;
          setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false, }));
        }
      })
    );
  }, []);

  /**
   * @method editItemDetails
   * @description confirm edit item
   */

  const viewOrEditItemDetails = useCallback((Id, isViewMode) => {
    setState((prevState) => ({ ...prevState, isOpenVendor: true, isEditFlag: true, ID: Id, isViewMode: isViewMode, }));
  }, []);
  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  const deleteItem = useCallback((Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
  }, []);
  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId();
    dispatch(
      deleteClient(ID, loggedInUser, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_CLIENT_SUCCESS);
          setState((prevState) => ({ ...prevState, dataCount: 0 }));
          getTableListData(null, null);
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

  const formToggle = () => {
    setState((prevState) => ({ ...prevState, isOpenVendor: true, isViewMode: false, }));
  };
  const closeVendorDrawer = (e = "", type) => {
    setState(
      (prevState) => ({ ...prevState, isOpenVendor: false, isEditFlag: false, ID: "", }),
      () => {
        if (type === "submit") getTableListData(null, null);
        setState((prevState) => ({ ...prevState, dataCount: 0 }));
      }
    );
  };

  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, prevState.noData), }));
    }, 500);
  };

  const onGridReady = (params) => {
    state.gridApi = params.api;
    state.gridApi.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }));
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows();
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows?.length, }));
  };

  const onBtExport = () => {
    let tempArr = [];
    tempArr = state.gridApi && state.gridApi?.getSelectedRows();
    tempArr = tempArr && tempArr.length > 0 ? tempArr : clientDataList ? clientDataList : [];
    return returnExcelColumn(CLIENT_DOWNLOAD_EXCEl, tempArr);
  };
  const returnExcelColumn = (data = [], TempData) => {
    // let excelData = hideCustomerFromExcel(data, "CustomerName")
    let temp = [];
    temp =
      TempData && TempData.map((item) => {
        if (item.ClientName === null) {
          item.ClientName = " ";
        }
        return item;
      });

    return (
      <ExcelSheet data={temp} name={"Customer"}>
        {data && data.map((ele, index) => (
          <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
        ))}
      </ExcelSheet>
    );
  };


  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  }

  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll();
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null); // Reset any header filters
    if (window.screen.width >= 1600) {
      state.gridApi.sizeColumnsToFit();
    }
    // Update the value of input field
    if (searchRef.current) {
      searchRef.current.value = '';
    }
  };
  const { isOpenVendor, noData } = state;
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
    // customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
  };
  return (
    <div
      className={`ag-grid-react p-relative ${state.DownloadAccessibility ? "show-table-btn" : ""}`} id="go-to-top"    >
      <ScrollToTop pointProp="go-to-top" />
      {state.isLoader ? <LoaderCustom /> : <div className="container-fluid">
        <form noValidate>
          <Row className="no-filter-row">
            <Col md="10" className="filter-block"></Col>
            <Col md="2" className="search-user-block">
              <div className="d-flex justify-content-end bd-highlight">
                {state.AddAccessibility && (

                  <Button id="clientListing_add" className={"mr5"} onClick={formToggle} title={"Add"} icon={"plus"} />
                )}
                {
                  state.DownloadAccessibility &&
                  <>
                    <>
                      <ExcelFile filename={Clientmaster} fileExtension={'.xls'}
                        element={
                          <Button id={"Excel-Downloads-clientListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />

                        }>
                        {onBtExport()
                        }
                      </ExcelFile>
                    </>

                  </>

                }
                <Button
                  id={"clientListing_refresh"} className="user-btn" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
              </div>
            </Col>
          </Row>
        </form>

        <div className={`ag-grid-wrapper height-width-wrapper ${(state.tableData && state.tableData?.length <= 0 && !state.isLoader) || noData ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
          </div>
          <div
            className={`ag-theme-material ${state.isLoader && "max-loader-height"}`} >
            {noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />)}
            {!state.isLoader && <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout="autoHeight"
              // columnDefs={c}
              rowData={clientDataList}
              pagination={true}
              paginationPageSize={defaultPageSize}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              noRowsOverlayComponent={"customNoRowsOverlay"}
              onFilterModified={onFloatingFilterChanged}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: "imagClass",
              }}
              rowSelection={"multiple"}
              onSelectionChanged={onRowSelect}
              frameworkComponents={frameworkComponents}
              suppressRowClickSelection={true}
            >
              <AgGridColumn field="CompanyName" headerName="Customer Name"></AgGridColumn>
              <AgGridColumn field="CompanyCode" headerName="Customer Code"></AgGridColumn>
              <AgGridColumn field="ClientName" headerName="Contact Name" cellRenderer={"hyphenFormatter"}></AgGridColumn>
              <AgGridColumn field="ClientEmailId" headerName="Email Id"></AgGridColumn>
              <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
              <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
              <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
              <AgGridColumn field="ClientId" cellClass="ag-grid-action-container actions-wrapper" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
            </AgGridReact>}
            {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
          </div>
        </div>

        {isOpenVendor && (
          <AddClientDrawer isOpen={state.isOpenVendor} closeDrawer={closeVendorDrawer} isEditFlag={state.isEditFlag} isViewMode={state.isViewMode} ID={state.ID} anchor={"right"} />
        )}
      </div>}

      {state.showPopup && (
        <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CLIENT_DELETE_ALERT}`} />
      )}
    </div>
  );
});

export default ClientListing
