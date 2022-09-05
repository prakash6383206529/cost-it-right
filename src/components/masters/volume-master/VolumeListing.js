import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'reactstrap'
import Toaster from '../../common/Toaster'
import { MESSAGES } from '../../../config/message'
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound'
import { getVolumeDataList, deleteVolume, } from '../actions/Volume'
import { VOLUME_DOWNLOAD_EXCEl } from '../../../config/masterData'
import AddVolume from './AddVolume'
import BulkUpload from '../../massUpload/BulkUpload'
import { ADDITIONAL_MASTERS, VOLUME, VolumeMaster } from '../../../config/constants'
import { checkPermission, searchNocontentFilter } from '../../../helper/util'
import LoaderCustom from '../../common/LoaderCustom'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper'
import ScrollToTop from '../../common/ScrollToTop'
import AddLimit from './AddLimit'
import { PaginationWrapper } from '../../common/commonPagination'
import WarningMessage from '../../common/WarningMessage'
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation'
import _ from 'lodash'

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const initialTableData = [
  {
    VolumeApprovedDetailId: 0,
    Month: 'April',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  { VolumeApprovedDetailId: 1, Month: 'May', BudgetedQuantity: 0, ApprovedQuantity: 0 },
  {
    VolumeApprovedDetailId: 2,
    Month: 'June',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 3,
    Month: 'July',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 4,
    Month: 'August',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 5,
    Month: 'September',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 6,
    Month: 'October',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 7,
    Month: 'November',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 8,
    Month: 'December',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 9,
    Month: 'January',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 10,
    Month: 'February',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 11,
    Month: 'March',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
]

function VolumeListing(props) {

  const [shown, setShown] = useState(false);
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [data, setData] = useState({ isEditFlag: false, ID: '' });
  const [isActualBulkUpload, setIsActualBulkUpload] = useState(false);
  const [isBudgetedBulkUpload, setIsBudgetedBulkUpload] = useState(false);
  const [addAccessibility, setAddAccessibility] = useState(false);
  const [editAccessibility, setEditAccessibility] = useState(false);
  const [deleteAccessibility, setDeleteAccessibility] = useState(false);
  const [bulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
  const [downloadAccessibility, setDownloadAccessibility] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deletedId, setDeletedId] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [limit, setLimit] = useState(false);

  //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
  const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX SELECTION
  const [warningMessage, setWarningMessage] = useState(false)
  const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [filterModel, setFilterModel] = useState({});
  const [pageNo, setPageNo] = useState(1)
  const [pageNoNew, setPageNoNew] = useState(1)
  const [totalRecordCount, setTotalRecordCount] = useState(1)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
  const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: '', Year: '', Month: '', VendorName: '', Plant: '', PartNumber: '', PartName: '', BudgetedQuantity: '', ApprovedQuantity: '', applyPagination: '', skip: '', take: '' })
  const [disableDownload, setDisableDownload] = useState(false)
  const [noData, setNoData] = useState(false)

  const { topAndLeftMenuData } = useSelector(state => state.auth);
  const { volumeDataList, volumeDataListForDownload } = useSelector(state => state.volume);
  const { selectedRowForPagination } = useSelector((state => state.simulation))


  const dispatch = useDispatch();

  useEffect(() => {
    applyPermission(topAndLeftMenuData)
    getTableListData(0, defaultPageSize, true)
    return () => {
      dispatch(setSelectedRowForPagination([]))
    }

  }, [])

  useEffect(() => {
    setIsLoader(true)
    applyPermission(topAndLeftMenuData)
    setTimeout(() => {
      setIsLoader(false)
    }, 200);
  }, [topAndLeftMenuData])

  useEffect(() => {
    if (volumeDataList?.length > 0) {
      setTotalRecordCount(volumeDataList[0].TotalRecordCount)
    }
    else {
      setNoData(false)
    }
  }, [volumeDataList])

  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === VOLUME)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
      if (permmisionData !== undefined) {
        setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false)
        setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false)
        setDeleteAccessibility(permmisionData && permmisionData.Delete ? permmisionData.Delete : false)
        setBulkUploadAccessibility(permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false)
        setDownloadAccessibility(permmisionData && permmisionData.Download ? permmisionData.Download : false)
      }

    }
  }

  /**
   * @method getTableListData
   * @description Get user list data
   */
  const getTableListData = (skip = 0, take = 10, isPagination = true) => {
    if (isPagination === true || isPagination === null) setIsLoader(true)
    dispatch(getVolumeDataList(skip, take, isPagination, floatingFilterData, (res) => {
      if (isPagination === true || isPagination === null) setIsLoader(false)

      if (res && isPagination === false) {
        setDisableDownload(false)
        setTimeout(() => {
          let button = document.getElementById('Excel-Downloads-volume')
          button && button.click()
        }, 500);
      }
      if (res) {
        console.log(res.status, "res", res)
        if ((res && res.status === 204) || res.length === 0) {
          setTotalRecordCount(0)
          setPageNo(0)
        }
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
   * @method editItemDetails
   * @description confirm edit item
   */
  const editItemDetails = (Id) => {
    setData({ isEditFlag: true, ID: Id })
    setShowVolumeForm(true)
  }

  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  const deleteItem = (obj) => {
    setShowPopup(true)
    setDeletedId(obj)
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  const confirmDeleteItem = (ID) => {
    dispatch(deleteVolume(ID, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_VOLUME_SUCCESS)
        getTableListData(0, globalTake, true)
      }
    }))
    setShowPopup(false)
  }

  const onPopupConfirm = () => {
    confirmDeleteItem(deletedId);
  }

  const closePopUp = () => {
    setShowPopup(false)
  }

  /**
* @method buttonFormatter
* @description Renders buttons
*/
  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;
    let obj = {}
    obj.volumeId = rowData.VolumeId
    obj.volumeApprovedId = rowData.VolumeApprovedId
    obj.volumeBudgetedId = rowData.VolumeBudgetedId
    return (
      <>
        {editAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => editItemDetails(cellValue, rowData)} />}
        {deleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(obj)} />}
      </>
    )
  };

  /**
  * @method hyphenFormatter
  */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }

  /**
   * @method actualBulkToggle
   * @description OPEN ACTUAL BULK UPLOAD DRAWER FOR BULK UPLOAD
   */
  const actualBulkToggle = () => {
    setIsActualBulkUpload(true)
  }

  /**
   * @method closeActualBulkUploadDrawer
   * @description CLOSE ACTUAL BULK DRAWER
   */
  const closeActualBulkUploadDrawer = () => {
    setIsActualBulkUpload(false)
    setTimeout(() => {
      getTableListData(0, globalTake, true)
    }, 200);
  }

  /**
   * @method budgetedBulkToggle
   * @description OPEN BUDGETED BULK UPLOAD DRAWER FOR BULK UPLOAD
   */
  const budgetedBulkToggle = () => {
    setIsBudgetedBulkUpload(true)
  }

  /**
   * @method closeBudgetedBulkUploadDrawer
   * @description CLOSE BUDGETED BULK DRAWER
   */
  const closeBudgetedBulkUploadDrawer = () => {
    setIsBudgetedBulkUpload(false)
    setTimeout(() => {
      getTableListData(0, globalTake, true)
    }, 200);
  }

  const formToggle = () => {
    setShowVolumeForm(true)
  }

  const returnExcelColumn = (data = [], TempData) => {
    return (
      <ExcelSheet data={TempData} name={VolumeMaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  const onRowSelect = (event) => {
    var selectedRows = gridApi && gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA
      let finalData = []
      if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].RawMaterialId === event.data.RawMaterialId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i])
        }
      } else {
        finalData = selectedRowForPagination
      }
      selectedRows = [...selectedRows, ...finalData]
    }
    let uniqeArray = _.uniqBy(selectedRows, "VolumeId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
  }


  const onExcelDownload = () => {
    setDisableDownload(true)

    //let tempArr = gridApi && gridApi?.getSelectedRows()
    let tempArr = volumeDataListForDownload
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setDisableDownload(false)
        let button = document.getElementById('Excel-Downloads-volume')
        button && button.click()
      }, 400);


    } else {
      getTableListData(0, defaultPageSize, false)
      // getDataList(, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }

  }

  const onBtExport = () => {
    let tempArr = []
    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (volumeDataListForDownload ? volumeDataListForDownload : [])
    return returnExcelColumn(VOLUME_DOWNLOAD_EXCEl, tempArr)
  };

  /**
   * @method hideForm
   * @description HIDE FORM
   */
  const hideForm = (type) => {
    setShowVolumeForm(false)
    setData({ isEditFlag: false, ID: '' })
    setTimeout(() => {
      if (type === 'submit')
        getTableListData(0, globalTake, true)
    }, 200);
  }

  const onBtPrevious = () => {
    if (currentRowIndex >= 10) {
      setPageNo(pageNo - 1)
      setPageNoNew(pageNo - 1)
      const previousNo = currentRowIndex - 10;
      getTableListData(previousNo, globalTake, true)
      setCurrentRowIndex(previousNo)
    }
  }

  const onBtNext = () => {
    if (pageSize.pageSize50 && pageNo >= Math.ceil(totalRecordCount / 50)) {
      return false
    }

    if (pageSize.pageSize100 && pageNo >= Math.ceil(totalRecordCount / 100)) {
      return false
    }

    if (currentRowIndex < (totalRecordCount - 10)) {
      setPageNo(pageNo + 1)
      setPageNoNew(pageNo + 1)
      const nextNo = currentRowIndex + 10;
      getTableListData(nextNo, globalTake, true)
      // skip, take, isPagination, floatingFilterData, (res)
      setCurrentRowIndex(nextNo)
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {

    if (Number(newPageSize) === 10) {
      getTableListData(currentRowIndex, 10, true)
      setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
      setGlobalTake(10)
      setPageNo(pageNoNew)
    }
    else if (Number(newPageSize) === 50) {
      getTableListData(currentRowIndex, 50, true)
      setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
      setGlobalTake(50)
      setPageNo(pageNoNew)
      if (pageNo >= Math.ceil(totalRecordCount / 50)) {
        setPageNo(Math.ceil(totalRecordCount / 50))
        getTableListData(0, 50, true)
      }
    }
    else if (Number(newPageSize) === 100) {
      getTableListData(currentRowIndex, 100, true)
      setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
      setGlobalTake(100)
      if (pageNo >= Math.ceil(totalRecordCount / 100)) {
        setPageNo(Math.ceil(totalRecordCount / 100))
        getTableListData(0, 100, true)
      }
    }

    gridApi.paginationSetPageSize(Number(newPageSize));

  };

  const onSearch = () => {

    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    setPageNo(1)
    setPageNoNew(1)
    setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getTableListData(0, globalTake, true)
  }

  const onFloatingFilterChanged = (value) => {
    if (volumeDataList?.length !== 0) {
      setNoData(searchNocontentFilter(value, noData))
    }
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
      }

    } else {

      if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
        return false
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
    }
  }

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }

  const resetState = () => {
    gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);

    for (var prop in floatingFilterData) {
      floatingFilterData[prop] = ""
    }

    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    setPageNo(1)
    setPageNoNew(1)
    setCurrentRowIndex(0)
    getTableListData(0, 10, true)
    dispatch(setSelectedRowForPagination([]))
    setGlobalTake(10)
    setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))

  }

  /**
 * @method LimitHandleChange
 * @description Open Limit Side Drawer
 */
  const limitHandler = () => {
    setLimit(true)
  };


  /**
  * @method  closeLimitDrawer
  * @description CLOSE Limit Side Drawer
  */
  const closeLimitDrawer = () => {
    setLimit(false)
  };


  const ExcelFile = ReactExport.ExcelFile;

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn
  };

  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.VolumeId === props.node.data.VolumeId) {
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
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
  };

  if (showVolumeForm) {
    return (
      <AddVolume
        initialTableData={initialTableData}
        hideForm={hideForm}
        data={data}
      />
    )
  }

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className={`ag-grid-react container-fluid blue-before-inside ${downloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
        <ScrollToTop pointProp="go-to-top" />
        {isLoader ? <LoaderCustom customClass={"loader-center"} /> :
          <>
            <form noValidate>
              <Row>
                <Col md="12"><h1 className="mb-0">Volume Master</h1></Col>
              </Row>
              <Row className="pt-4 blue-before">
                <Col md="8" className="search-user-block mb-3">
                  <div className="d-flex justify-content-end bd-highlight">
                    <div className="warning-message d-flex align-items-center">
                      {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                    </div>
                    <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                    {shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setShown(!shown)}>
                        <div className="cancel-icon-white"></div></button>
                    ) : (
                      ""
                    )}
                    <button
                      type="button"
                      className={"user-btn mr5"}
                      onClick={limitHandler}
                    >
                      Add Limit
                    </button>
                    {addAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={formToggle}
                        title="Add"
                      >
                        <div className={"plus mr-0"}></div>
                        {/* ADD */}
                      </button>
                    )}
                    {bulkUploadAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={actualBulkToggle}
                        title="Actual Volume Upload"
                      >{"A"}
                        <div className={"ml5 upload mr-0"}></div>
                        {/* Actual Upload */}
                      </button>
                    )}
                    {bulkUploadAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={budgetedBulkToggle}
                        title="Budgeted Volume Upload"
                      >{"B"}
                        <div className={"ml5 upload mr-0"}></div>
                        {/* Budgeted Bulk Upload */}
                      </button>
                    )}
                    {
                      downloadAccessibility &&
                      <>
                        {disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                        </button></div> :
                          <>
                            <button type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                              {/* DOWNLOAD */}
                            </button>
                            <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                              <button id={'Excel-Downloads-volume'} className="p-absolute" type="button" >
                              </button>}>
                              {onBtExport()}
                            </ExcelFile>
                          </>}
                      </>
                    }
                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                      <div className="refresh mr-0"></div>
                    </button>
                  </div>
                </Col>
              </Row>
            </form>

            <div className={`ag-grid-wrapper height-width-wrapper  ${(volumeDataList && volumeDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
              </div>
              <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={volumeDataList}
                  editable={true}
                  // pagination={true}
                  paginationPageSize={globalTake}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                    imagClass: 'imagClass'
                  }}
                  rowSelection={'multiple'}
                  frameworkComponents={frameworkComponents}
                  onFilterModified={onFloatingFilterChanged}
                  onRowSelected={onRowSelect}
                >
                  <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={checkBoxRenderer}></AgGridColumn>
                  <AgGridColumn field="Year" headerName="Year"></AgGridColumn>
                  <AgGridColumn field="Month" headerName="Month"></AgGridColumn>
                  <AgGridColumn field="VendorName" headerName="Vendor (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                  <AgGridColumn field="Plant" headerName="Plant (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                  <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                  <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                  <AgGridColumn field="BudgetedQuantity" headerName="Budgeted Quantity"></AgGridColumn>
                  <AgGridColumn field="ApprovedQuantity" headerName="Approved Quantity"></AgGridColumn>
                  <AgGridColumn field="VolumeId" width={120} headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>
                <div className='button-wrapper'>
                  {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                  {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                    <div className="d-flex pagination-button-container">
                      <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                      {pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                      {pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                      {pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                      <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </>
        }

        {isActualBulkUpload && (
          <BulkUpload
            isOpen={isActualBulkUpload}
            closeDrawer={closeActualBulkUploadDrawer}
            isEditFlag={false}
            fileName={'ActualVolume'}
            isZBCVBCTemplate={true}
            messageLabel={'Volume Actual'}
            anchor={'right'}
          />
        )}
        {isBudgetedBulkUpload && (
          <BulkUpload
            isOpen={isBudgetedBulkUpload}
            closeDrawer={closeBudgetedBulkUploadDrawer}
            isEditFlag={false}
            fileName={'BudgetedVolume'}
            isZBCVBCTemplate={true}
            messageLabel={'Volume Budgeted'}
            anchor={'right'}
          />
        )}
        {
          showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.VOLUME_DELETE_ALERT}`} />
        }

        {limit && (
          <AddLimit
            isOpen={limit}
            closeDrawer={closeLimitDrawer}
            isEditFlag={false}
            ID={""}
            anchor={"right"}
          />
        )}
      </div>
    </>
  )
}

export default VolumeListing;