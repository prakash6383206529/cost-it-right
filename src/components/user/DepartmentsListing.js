import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDepartmentAPI, deleteDepartmentAPI } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import { getConfigurationKey, handleDepartmentHeader } from '../../helper/auth';
import { checkPermission, searchNocontentFilter } from '../../helper/util';
import Department from './Department';
import { DEPARTMENT } from '../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import { PaginationWrapper } from '../common/commonPagination';
import ScrollToTop from '../common/ScrollToTop';
import Button from '../layout/Button';

const gridOptions = {};
const DepartmentsListing = () => {
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    tableData: [],
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    isLoader: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ['columns'] },
    showData: false,
    showPopup: false,
    deletedId: '',
    noData: false
  });
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const { topAndLeftMenuData } = useSelector((state) => state.auth)
  useEffect(() => {
    setState((prevState) => ({ ...prevState, isLoader: true, showGrid: true }));
    if (topAndLeftMenuData) {
      const userMenu = topAndLeftMenuData.find(el => el.ModuleName === 'Users');
      const accessData = userMenu?.Pages.find(el => el.PageName === DEPARTMENT);
      const permissionData = accessData?.Actions && checkPermission(accessData.Actions);
      if (permissionData) {
        setState((prevState) => ({ ...prevState, AddAccessibility: permissionData.Add ?? false, EditAccessibility: permissionData.Edit ?? false, DeleteAccessibility: permissionData.Delete ?? false }));
      }
    }
    getDepartmentListData();

  }, []);

  const getDepartmentListData = () => {
    dispatch(getAllDepartmentAPI((res) => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false }));
      }
      else {
        setState((prevState) => ({ ...prevState, isLoader: false }));
      }
    }
    ));
  };

  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */

  const closeDrawer = (e = '', type) => {
    setState((prevState) => ({ ...prevState, isOpen: false }))
    if (type === 'submit') {
      getDepartmentListData();
    }

  };
  /**
   * @method openModel
   * @description  used to open filter form 
   */
  const openModel = () => {
    setState((prevState) => ({ ...prevState, isOpen: true, isEditFlag: false }))
  }

  /**
  * @method editItemDetails
  * @description confirm edit item
  */
  const editItemDetails = (Id) => {
    setState((prevState) => ({ ...prevState, isEditFlag: true, isOpen: true, DepartmentId: Id, }))
  }

  /**
  * @method deleteItem
  * @description confirm delete Department
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }

  const onPopupConfirm = () => {
    confirmDeleteItem(state.deletedId);

  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }
  /**
   * @method confirmDeleteItem
   * @description confirm delete Department item
   */
  const confirmDeleteItem = (DepartmentId) => {
    dispatch(deleteDepartmentAPI(DepartmentId, (res) => {
      if (res && res.data && res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_DEPARTMENT_SUCCESSFULLY);
        getDepartmentListData();
      } else if (res.data.Result === false && res.statusText === "Found") {
        Toaster.warning(res.data.Message)
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */

  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    const { EditAccessibility, DeleteAccessibility } = state;


    return (
      <>
        {EditAccessibility && <Button id={`departmentListing_edit${props.rowIndex}`} className={"Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, rowData)} title={"Edit"} />}
        {DeleteAccessibility && <Button id={`departmentListing_delete${props.rowIndex}`} className={"Delete m15"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
      </>
    )
  };


  const onGridReady = (params) => {
    state.gridApi = params.api;
    state.gridApi.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value)
  }

  const resetState = () => {
    state.gridApi.setQuickFilter(null)
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    if (searchRef.current) {
      searchRef.current.value = '';
    }
  }

  const { isOpen, isEditFlag, DepartmentId, AddAccessibility, noData } = state;
  const defaultColDef = { resizable: true, filter: true, sortable: false, };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
  };
  return (
    <div className={"ag-grid-react"} id="department-go-to-top">
      <ScrollToTop pointProp={"department-go-to-top"} />
      <>
        {state.isLoader && <LoaderCustom />}
        <Row className="pt-4 no-filter-row">
          <Col md="6" className="filter-block"></Col>
          <Col md="6" className="text-right search-user-block pr-0">
            {AddAccessibility && (<>    <Button id="departmentListing_add" className={"mr5"} onClick={openModel} title={"Add"} icon={"plus"} />              </>
            )}
            <Button id={"clientListing_refresh"} className="user-btn" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
          </Col>

        </Row>

        <Row>
          <Col>
            <div className={`ag-grid-wrapper height-width-wrapper ${(state.tableData && state.tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              <div className="ag-grid-header">
                <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
              </div>
              <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                {!state.isLoader && <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={state.tableData}
                  pagination={true}
                  paginationPageSize={defaultPageSize}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
                  loadingOverlayComponent={'customLoadingOverlay'}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  onFilterModified={(e) => {
                    setTimeout(() => {
                      setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(e) }));
                    }, 500);
                  }}
                  noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                  frameworkComponents={frameworkComponents}
                >
                  {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                  <AgGridColumn field="DepartmentName" headerName={handleDepartmentHeader()}></AgGridColumn>
                  {/* <AgGridColumn field="DepartmentName" headerName={getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Purchase Group'}></AgGridColumn>   //RE */}
                  <AgGridColumn field="DepartmentCode" headerName={`${handleDepartmentHeader()} Code`}></AgGridColumn>
                  {/* <AgGridColumn field="DepartmentCode" headerName={getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company Code' : 'Purchase Group Code'}></AgGridColumn> //RE */}
                  <AgGridColumn field="DepartmentId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>}
                {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
              </div>
            </div>


          </Col>
        </Row>
        {isOpen && (<Department isOpen={isOpen} closeDrawer={closeDrawer} isEditFlag={isEditFlag} DepartmentId={DepartmentId} anchor={"right"} className={"test-rahul"} />)}
        {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.DEPARTMENT_DELETE_ALERT}`} />}
      </>
    </div>
  );

};
export default DepartmentsListing