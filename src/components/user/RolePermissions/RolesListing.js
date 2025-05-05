import React, { useState, useEffect } from 'react';
import { Row, Col, } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllRoleAPI, activeInactiveRole } from '../../../actions/auth/AuthActions';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { checkPermission, searchNocontentFilter, setLoremIpsum, showTitleForActiveToggle } from '../../../helper/util';
import { ROLE } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { loggedInUserId, userDetails } from '../../../helper';
import Switch from "react-switch";
import ScrollToTop from '../../common/ScrollToTop';
import { useRef } from 'react';
import Button from '../../layout/Button';
import { useTranslation } from 'react-i18next'
import { Steps } from '../../common/Tour/TourMessages';
import TourWrapper from '../../common/Tour/TourWrapper';
const gridOptions = {};
const RolesListing = (props) => {
  const { t } = useTranslation("common")
  const [state, setState] = useState({
    isEditFlag: false,
    RoleId: '',
    tableData: [],
    AddAccessibility: false,
    EditAccessibility: false,
    DeleteAccessibility: false,
    ActivateAccessibility: false,
    isLoader: false,
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ['columns'] },
    showData: false,
    showPopup: false,
    deletedId: '',
    cell: '',
    noData: false,
    globalTake: defaultPageSize
  });

  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const { topAndLeftMenuData } = useSelector((state) => state.auth);
  useEffect(() => {
    setState((prevState) => ({ ...prevState, isLoader: true }))
    if (topAndLeftMenuData !== undefined) {
      const userMenu = topAndLeftMenuData?.find(el => el.ModuleName === 'Users');
      const accessData = userMenu?.Pages.find(el => el.PageName === ROLE);
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permmisionData !== undefined) {
        setState((prevState) => ({
          ...prevState,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
        }));
      }
    }
    setTimeout(() => {
      getRolesListData();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRolesListData = () => {
    dispatch(getAllRoleAPI(res => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        setState(prevState => ({ ...prevState, tableData: Data, isLoader: false, noData: false}));
      }
      else {
        setState((prevState) => ({ ...prevState, isLoader: false }));
      }
    }));
  };

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  const editItemDetails = (Id) => {
    let requestData = { isEditFlag: true, RoleId: Id, isNewRole: false }
    props.getDetail(requestData)
  }

  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  /**
    * @method buttonFormatter
    * @description Renders buttons
    */

  const { EditAccessibility } = state;
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data
    const userRoleCheck = userDetails()?.Role
    return (
      <>
        {!(rowData?.RoleName === 'RFQUser') && !(userRoleCheck === rowData?.RoleName) && (rowData?.IsActive) && EditAccessibility && <Button id={`roleListing_edit${props.rowIndex}`} className={"Edit mr-2 Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, rowData)} title={"Edit"} />
        }

        {/* {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />} */}
      </>
    )
  };
  /**
            * @method toggleExtraData
            * @description Handle specific module tour state to display lorem data
            */
  const toggleExtraData = (showTour) => {
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
    }, 100);

  }
  const formToggle = () => {
    props.formToggle()
  }

  const onGridReady = (params) => {
    state.gridApi = params.api;
    state.gridApi.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
    setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
  };

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value)
  }

  const resetState = () => {
    state?.gridApi?.setQuickFilter(null)
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    setState((prevState) => ({ ...prevState, isLoader: true, globalTake: defaultPageSize }));
    getRolesListData();
  }

  const handleChange = (cell, row) => {
    setState((prevState) => ({ ...prevState, showPopup: true, row: row, cell: cell }))

  }
  const onPopupConfirm = () => {
    let data = { Id: state.row.RoleId, ModifiedBy: loggedInUserId(), IsActive: !state.cell, }
    dispatch(activeInactiveRole(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (Boolean(state.cell) === true) {
          Toaster.success(MESSAGES.ROLE_INACTIVE_SUCCESSFULLY)
        } else {
          Toaster.success(MESSAGES.ROLE_ACTIVE_SUCCESSFULLY)
        }
        getRolesListData();
      }
    }))
    setState((prevState) => ({ ...prevState, showPopup: false }))
    setState((prevState) => ({ ...prevState, showPopup2: false }))

  }

  /**
* @method statusButtonFormatter
* @description Renders buttons
*/

  const { ActivateAccessibility } = state;
  const statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    if (rowData.UserId === loggedInUserId() || rowData.RoleName === 'RFQUser') return null;
    showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive');
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch Tour_List_Status">
          {/* <span>Switch with default style</span> */}
          <Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!ActivateAccessibility} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
        </label>
      </>
    )
  }

  const { AddAccessibility, noData } = state;
  const defaultColDef = { resizable: true, filter: true, sortable: false, };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    statusButtonFormatter: statusButtonFormatter,
  };
  return (
    <div className={"ag-grid-react"} id={'role-go-to-top'}>
      <ScrollToTop pointProp={"role-go-to-top"} />
      <>
        {state.isLoader && <LoaderCustom />}
        <Row className="pt-4 ">
          <Col md="8" className="mb-2">
          </Col>
          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              {AddAccessibility &&
                <div>
                  <Button id="roletListing_add" className={"mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />
                </div>
              }
              <Button
                id={"roleListing_refresh"} className="user-btn Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
            </div>
          </Col>
        </Row>
        <Row class="">
          <Col className="table-mt-0">
            <div className={`ag-grid-wrapper height-width-wrapper ${(state.tableData && state.tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              <div className="ag-grid-header">
                <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                <TourWrapper
                  buttonSpecificProp={{ id: "Role_listing_Tour", onClick: toggleExtraData }}
                  stepsSpecificProp={{
                    steps: Steps(t, { filterButton: false, bulkUpload: false, downloadButton: false, addLimit: false, viewButton: false, DeleteButton: false, costMovementButton: false, copyButton: false, viewBOM: false, updateAssociatedTechnology: false, addAssociation: false, addMaterial: false, generateReport: false, approve: false, reject: false, }).COMMON_LISTING
                  }} />
              </div>
              <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                {!state.isLoader && <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={state.showExtraData ? [...setLoremIpsum(state.tableData[0]), ...state.tableData] : state.tableData}
                  pagination={true}
                  paginationPageSize={10}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
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
                  <AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
                  <AgGridColumn field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                  <AgGridColumn field="RoleId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>
                }

                {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake}/>}
              </div>
            </div>
            {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${state.cell ? MESSAGES.ROLE_DEACTIVE_ALERT : MESSAGES.ROLE_ACTIVE_ALERT}`} />}

          </Col>
        </Row>
      </ >
    </div>
  );


};
export default RolesListing