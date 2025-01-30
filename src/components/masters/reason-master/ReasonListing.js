import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import $ from "jquery";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getAllReasonAPI, deleteReasonAPI, activeInactiveReasonStatus, } from '../actions/ReasonMaster';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import AddReason from './AddReason';
import { ADDITIONAL_MASTERS, REASON, Reasonmaster } from '../../../config/constants';
import { checkPermission, searchNocontentFilter, showTitleForActiveToggle } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { REASON_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import ScrollToTop from '../../common/ScrollToTop';
import { PaginationWrapper } from '../../common/commonPagination';
import Button from '../../layout/Button';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const ReasonListing = (props) => {
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [ID, setID] = useState('');
  const [tableData, setTableData] = useState([]);
  const [ViewAccessibility, setViewAccessibility] = useState(false);
  const [AddAccessibility, setAddAccessibility] = useState(false);
  const [EditAccessibility, setEditAccessibility] = useState(false);
  const [DeleteAccessibility, setDeleteAccessibility] = useState(false);
  const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
  const [ActivateAccessibility, setActivateAccessibility] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isLoader, setIsLoader] = useState(false);
  const [renderState, setRenderState] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [deletedId, setDeletedId] = useState('');
  const [selectedRowData, setSelectedRowData] = useState(false);
  const [showPopupToggle, setShowPopupToggle] = useState(false);
  const [noData, setNoData] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [cellValue, setCellValue] = useState('');
  const [cellData, setCellData] = useState('');
  const [gridLoad, setGridLoad] = useState(false);
  const { reasonDataList } = useSelector(state => state.reason);
  const { topAndLeftMenuData } = useSelector(state => state.auth);
  const [totalRecordCount, setTotalRecordCount] = useState(0)
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllReasonAPI(false, (res) => { }))
    getTableListData()
    // applyPermission(topAndLeftMenuData)
  }, [])


  useEffect(() => {
    applyPermission(topAndLeftMenuData)
  }, [topAndLeftMenuData])
  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      setGridLoad(true)
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === REASON)
      const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
      if (permissionData !== undefined) {
        setViewAccessibility(permissionData && permissionData.View ? permissionData.View : false);
        setAddAccessibility(permissionData && permissionData.Add ? permissionData.Add : false);
        setEditAccessibility(permissionData && permissionData.Edit ? permissionData.Edit : false);
        setDeleteAccessibility(permissionData && permissionData.Delete ? permissionData.Delete : false);
        setDownloadAccessibility(permissionData && permissionData.Download ? permissionData.Download : false);
        setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
      }
    }
  }

  /**
   * @method getTableListData
   * @description Get user list data
   */
  const getTableListData = () => {
    setIsLoader(true)
    dispatch(getAllReasonAPI(true, (res) => {
      setIsLoader(false)
      if (res.status === 204 && res.data === '') {
        setTableData([])
        setIsLoader(false)
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        setTableData(Data)
        setIsLoader(false)
        setTotalRecordCount(Data?.length)
        setRenderState(!renderState)
      } else {
        setTableData([])
        setIsLoader(false)
      }
    }))
  }

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  const editItemDetails = (cellValue, rowData) => {
    if (rowData.IsActive === false) {
      Toaster.warning('You can not edit inactive reason')
    }
    else {
      setIsEditFlag(true);
      setIsOpenDrawer(true);
      setID(rowData.ReasonId);
    }
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  const confirmDeleteItem = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteReasonAPI(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_REASON_SUCCESSFULLY)
        getTableListData()
        setDataCount(0)
      }
    }))
    setShowPopup(false)
  }
  const onPopupConfirm = () => {
    confirmDeleteItem(deletedId);

  }
  const closePopUp = () => {
    setShowPopup(false)
    setShowPopupToggle(false)
  }
  const onPopupConfirmToggle = () => {
    confirmDeactivateItem(cellData, cellValue)
  }
  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    return (
      <>

        {EditAccessibility && <Button id={`reasonListing_edit${props.rowIndex}`} className={"Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, rowData)} title={"Edit"} />}
        {/* {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />} */}
      </>
    )
  };

  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      reasonDataList.length !== 0 && setNoData(searchNocontentFilter(value, noData))
      setTotalRecordCount(gridApi?.getDisplayedRowCount())
    }, 500);
  }
  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  const statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    if (rowData.UserId === loggedInUserId()) return null;
    showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive')
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() => handleChange(cellValue, rowData)}
            checked={cellValue}
            disabled={!ActivateAccessibility}
            background="#ff6600"
            onColor="#4DC771"
            onHandleColor="#ffffff"
            offColor="#FC5774"
            id="normal-switch"
            height={24}
            className={cellValue ? "active-switch" : "inactive-switch"}
          />
        </label>
      </>
    )
  }

  const handleChange = (cell, row) => {
    let data = {
      Id: row.ReasonId,
      LoggedInUserId: loggedInUserId(),
      IsActive: !cell, //Status of the Reason.
    }
    setCellData(data)
    setCellValue(cell)
    setShowPopupToggle(true)
  }
  const confirmDeactivateItem = (data, cell) => {
    dispatch(activeInactiveReasonStatus(data, res => {
      if (res && res.data && res.data.Result) {
        if (cell === true) {
          Toaster.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
        } else {
          Toaster.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
        }
        getTableListData()
        setDataCount(0)
      }
    }))
    setShowPopupToggle(false)
  }

  const formToggle = () => {
    $("html,body").animate({ scrollTop: 0 }, "slow");
    setIsOpenDrawer(true)
  }

  const closeVendorDrawer = (e = '', type) => {
    setIsOpenDrawer(false)
    setIsEditFlag(false)
    setID('')
    if (type === 'submit') {
      getTableListData()
    }
  }

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };
  const onRowSelect = () => {
    const selectedRows = gridApi.getSelectedRows();
    setSelectedRowData(selectedRows)
    setDataCount(selectedRows.length)
  }
  const onBtExport = () => {
    let tempArr = []
    tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (reasonDataList ? reasonDataList : [])
    return returnExcelColumn(REASON_DOWNLOAD_EXCEl, tempArr)
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.ECNNumber === null) {
        item.ECNNumber = ' '
      } else if (item.RevisionNumber === null) {
        item.RevisionNumber = ' '
      } else if (item.DrawingNumber === null) {
        item.DrawingNumber = ' '
      } else if (item.Technology === '-') {
        item.Technology = ' '
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={Reasonmaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const resetState = () => {
    const searchBox = document.getElementById("filter-text-box");
    if (searchBox) {
      searchBox.value = ""; // Reset the input field's value
    }
    gridApi.setQuickFilter(null)
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    gridApi.sizeColumnsToFit();
    gridApi.deselectAll()
  }


  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;

  }
  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    statusButtonFormatter: statusButtonFormatter
  };


  return (
    <>
      <div className={`ag-grid-react container-fluid p-relative ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
        <ScrollToTop pointProp="go-to-top" />
        {isLoader && <LoaderCustom customClass="loader-center" />}
        <Row className="no-filter-row">
          <Col md={6} className="text-right filter-block"></Col>
          <Col md="6" className="text-right search-user-block pr-0">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                {AddAccessibility && (

                  <Button id="reasonListing_add" className={"user-btn mr5"} onClick={formToggle} title={"Add"} icon={"plus"} />
                )}
                {
                  DownloadAccessibility &&
                  <>

                    <ExcelFile filename={'Reason'} fileExtension={'.xls'} element={
                      <button title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" disabled={totalRecordCount === 0} className={'user-btn mr5'}><div className="download mr-1" ></div>
                        {/* DOWNLOAD */}
                        {`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                      </button>}>

                      {totalRecordCount !== 0 ? onBtExport() : null}
                    </ExcelFile>

                  </>

                  //   <button type="button" className={"user-btn mr5"} onClick={onBtExport}><div className={"download"} ></div>Download</button>

                }

                <Button id={"reasonListing_refresh"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

              </div>
            </div>
          </Col>
        </Row>
        {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper  ${(reasonDataList && reasonDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
          </div>
          <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
            <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              // columnDefs={c}
              rowData={reasonDataList}
              pagination={true}
              paginationPageSize={defaultPageSize}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              noRowsOverlayComponent={'customNoRowsOverlay'}
              onFilterModified={onFloatingFilterChanged}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: 'imagClass pt-3'
              }}
              rowSelection={'multiple'}
              suppressRowClickSelection={true}
              onSelectionChanged={onRowSelect}
              frameworkComponents={frameworkComponents}
            >
              <AgGridColumn field="Reason" headerName="Reason"></AgGridColumn>
              <AgGridColumn field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
              <AgGridColumn field="ReasonId" cellClass="ag-grid-action-container" headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer'></AgGridColumn>
            </AgGridReact>
            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
          </div>
        </div>}

        {
          showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.REASON_DELETE_ALERT}`} />
        }
        {
          showPopupToggle && <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue ? MESSAGES.REASON_DEACTIVE_ALERT : MESSAGES.REASON_ACTIVE_ALERT}`} />
        }
      </div>
      {isOpenDrawer && (
        <AddReason
          isOpen={isOpenDrawer}
          closeDrawer={closeVendorDrawer}
          isEditFlag={isEditFlag}
          ID={ID}
          anchor={'right'}
        />
      )}
    </>
  )
}


export default ReasonListing
