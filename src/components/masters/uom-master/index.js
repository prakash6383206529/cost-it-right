import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI } from '../actions/unitOfMeasurment';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { ADDITIONAL_MASTERS, UOM, UomMaster } from '../../../config/constants';
import { checkPermission, searchNocontentFilter } from '../../../helper/util';
import ReactExport from 'react-export-excel';
import { UOM_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import ScrollToTop from '../../common/ScrollToTop';
import LoaderCustom from '../../common/LoaderCustom';
import { PaginationWrapper } from '../../common/commonPagination';
import { displayUOM } from '../../../helper/util';
import Button from '../../layout/Button';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const UOMMaster = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [uomId, setUomId] = useState('');
  const [dataList, setDataList] = useState([]);
  const [ViewAccessibility, setViewAccessibility] = useState(false);
  const [AddAccessibility, setAddAccessibility] = useState(false);
  const [EditAccessibility, setEditAccessibility] = useState(false);
  const [DeleteAccessibility, setDeleteAccessibility] = useState(false);
  const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deletedId, setDeletedId] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(false);
  const [noData, setNoData] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const dispatch = useDispatch();
  const { topAndLeftMenuData } = useSelector(state => state.auth);
  const unitOfMeasurementList = useSelector(state => state.unitOfMeasrement.unitOfMeasurementList);
  /**
   * @method componentDidMount
   * @description  called before rendering the component
   */

  useEffect(() => {
    applyPermission(topAndLeftMenuData);
    getUOMDataList();
  }, [topAndLeftMenuData]);


  const getUOMDataList = () => {
    setIsLoader(true);
    dispatch(getUnitOfMeasurementAPI(response => {
      setIsLoader(false);
      if (response && response.data && response.data.DataList) {
        const data = response.data.DataList;
        setDataList(data);
      }
    }));
  }
  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const data = topAndLeftMenuData && topAndLeftMenuData?.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = data && data.Pages.find(el => el.PageName === UOM)
      const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions);
      if (permissionData !== undefined) {
        setViewAccessibility(permissionData && permissionData.View ? permissionData.View : false);
        setAddAccessibility(permissionData && permissionData.Add ? permissionData.Add : false);
        setEditAccessibility(permissionData && permissionData.Edit ? permissionData.Edit : false);
        setDeleteAccessibility(permissionData && permissionData.Delete ? permissionData.Delete : false);
        setDownloadAccessibility(permissionData && permissionData.Download ? permissionData.Download : false);
      }
    }
  }

  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  const closeDrawer = (e = '') => {
    setIsOpen(false);
    getUOMDataList();
  }


  /**
  * @method editItemDetails
  * @description confirm delete UOM
  */
  const editItemDetails = (Id) => {
    setIsEditFlag(true);
    setIsOpen(true);
    setUomId(Id);
  }

  /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      dataList.length !== 0 && setNoData(searchNocontentFilter(value, noData))
    }, 500);
  }

  const onPopupConfirm = () => {
    confirmDeleteUOM(deletedId);
  }
  const closePopUp = () => {
    setShowPopup(false);
  }
  /**
   * @method confirmDeleteUOM
   * @description confirm delete unit of measurement
   */
  const confirmDeleteUOM = (Id) => {
    dispatch(deleteUnitOfMeasurementAPI(Id, (res) => {
      if (res.data.Result) {
        Toaster.success(MESSAGES.DELETE_UOM_SUCCESS);
        getUOMDataList()
      }
    }));
    setShowPopup(false);
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    return (
      <>        {EditAccessibility && <Button id={`uomListing_edit${props.rowIndex}`} className={"Edit mr5"} variant="Edit" onClick={() => editItemDetails(cellValue)} title={"Edit"} />}
        {/* <button className="Delete" type={'button'} onClick={() => deleteItem(cell)} /> */}
      </>
    )
  }

  const unitSymbol = (props) => {
    const cellValue = props?.value;
    return (
      <div>{displayUOM(cellValue)}
      </div>
    )
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
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (unitOfMeasurementList ? unitOfMeasurementList : [])
    return returnExcelColumn(UOM_DOWNLOAD_EXCEl, tempArr)
  };

  const returnExcelColumn = (data = [], TempData) => {
    return (
      <ExcelSheet data={TempData} name={UomMaster}>
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


  /**
  * @method render
  * @description Renders the component
  */
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
    unitSymbol: unitSymbol
  };

  return (
    <>
      <div className={`ag-grid-react container-fluid ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
        {isLoader && <LoaderCustom customClass={"loader-center"} />}
        <ScrollToTop pointProp="go-to-top" />
        <Row className="no-filter-row">
          {AddAccessibility && (
            <>
              <Col md={6} className="text-right filter-block mr5"></Col>
              {/* <Col md={6} className="text-right search-user-block pr-0">
                  <button
                    type={"button"}
                    className={"user-btn"}
                    onClick={openModel}
                  >
                    <div className={"plus"}></div>
                    {`ADD`}
                  </button>
                </Col> */}
            </>
          )}
          <Col md={6} className="text-right search-user-block pr-0">
            {
              DownloadAccessibility &&
              <>
                <ExcelFile filename={UomMaster} fileExtension={'.xls'} element={<Button id={"Excel-Downloads-uomListing"} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" className={'user-btn mr5'} icon={"download mr-1"} buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} />
                }>
                  {onBtExport()}
                </ExcelFile>
              </>
              //   <button type="button" className={"user-btn mr5"} onClick={onBtExport}><div className={"download"} ></div>Download</button>
            }

            <Button id={"uomListing_refresh"} className="user-btn" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

          </Col>
        </Row>

        <Row>
          <Col>

            <div className={`ag-grid-wrapper height-width-wrapper  ${(dataList && dataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
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
                  rowData={dataList}
                  pagination={true}
                  paginationPageSize={defaultPageSize}
                  onGridReady={onGridReady}
                  gridOptions={gridOptions}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  onFilterModified={onFloatingFilterChanged}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                  }}
                  rowSelection={'multiple'}
                  onSelectionChanged={onRowSelect}
                  frameworkComponents={frameworkComponents}
                  suppressRowClickSelection={true}
                >
                  <AgGridColumn field="Unit" headerName="Unit"></AgGridColumn>
                  <AgGridColumn field="UnitSymbol" headerName="Unit Symbol" cellRenderer={"unitSymbol"}></AgGridColumn>
                  <AgGridColumn field="UnitType" headerName="Unit Type"></AgGridColumn>
                </AgGridReact>
                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
              </div>
            </div>


          </Col>
        </Row>
        {isOpen && (<AddUOM isOpen={isOpen} closeDrawer={closeDrawer} isEditFlag={isEditFlag} ID={uomId} anchor={"right"} />
        )}
        {
          showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Are you sure you want to delete UOM?`} />
        }
      </div>
    </>
  );
}


export default UOMMaster
