import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA, sobManage } from '../../../config/constants';
import { getManageBOPSOBDataList } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { BOP_SOB_DOWNLOAD_EXCEL, BOP_SOBLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey, searchNocontentFilter, setLoremIpsum, showBopLabel } from '../../../helper';
import { Sob } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import DayTime from '../../common/DayTimeWrapper';
import { useContext } from 'react';
import { useState } from 'react';
import { ApplyPermission } from '.';
import { useRef } from 'react';
import Button from '../../layout/Button';
import { reactLocalStorage } from 'reactjs-localstorage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels, useWithLocalization } from '../../../helper/core';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../../common/Pagination/paginationAction';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import { disabledClass } from '../../../actions/Common';
import _ from 'lodash';
import Toaster from '../../common/Toaster';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const SOBListing = (props) => {
  const { vendorLabel } = useLabels();
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const { t } = useTranslation("common")
  const bopSobList = useSelector((state) => state.boughtOutparts?.bopSobList);
  
  
  const permissions = useContext(ApplyPermission);
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    ID: '',
    tableData: [],
    shown: false,
    costingHead: [],
    BOPCategory: [],
    plant: [],
    vendor: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ['columns'] },
    showData: false,
    isLoader: false,
    selectedRowData: false,
    noData: false,
    dataCount: 0,
    showExtraData: false,
    render: false,
    filterModel: {},
    disableDownload: false,


  });
  const [floatingFilterData, setFloatingFilterData] = useState({
    BoughtOutPartNumber: "",
    BoughtOutPartName: "",
    BoughtOutPartCategory: "",
    Specification: "",
    NoOfVendors: "",
    Plant: "",
    ShareOfBusinessPercentage: "",
    WeightedNetLandedCost: "",
    VendorName: "",
    EffectiveDate: ""
  });
  const { globalTakes } = useSelector((state) => state.pagination);
  const [disableFilter, setDisableFilter] = useState(true); // Correct syntax for useState
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  const [warningMessage, setWarningMessage] = useState(false);
  const selectedRowForPagination = useSelector((state => state?.simulation?.selectedRowForPagination))
  
  useEffect(() => {
    getDataList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        if (!props.stopApiCallOnCancel) {
          dispatch(setSelectedRowForPagination([]));
          dispatch(resetStatePagination());

        }
      }, 300)
    };
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  
  /**
  * @method getDataList
  * @description GET DATALIST OF IMPORT BOP
  */

  const getDataList = (skip = 0, take = defaultPageSize,  dataObj = {},isPagination = true, isReset = false) => {
    // Construct filter data with all required parameters
    

    const filterData = {
      // Required API parameters
      boughtOutPartNumber: isReset ? '' : floatingFilterData.BoughtOutPartNumber || '',
      boughtOutPartName: isReset ? '' : floatingFilterData.BoughtOutPartName || '',
      category: isReset ? '' : floatingFilterData.BoughtOutPartCategory || '',
      specification: isReset ? '' : floatingFilterData.Specification || '',
      noOfVendor: isReset ? 0 : floatingFilterData.NoOfVendors || 0,
      plantCode: isReset ? '' : floatingFilterData.Plant || '',
      totalSOB: isReset ? '' : floatingFilterData.ShareOfBusinessPercentage || '',
      weightedNetLandedCost: isReset ? '' : floatingFilterData.WeightedNetLandedCost || '',
      vendor: isReset ? '' : floatingFilterData.VendorName || '',
      effectiveDate: isReset ? '' : floatingFilterData.EffectiveDate || '',


      // Pagination parameters
      applyPagination: isPagination,
      skip: skip,
      take: take,

      // Legacy parameters if needed
      bought_out_part_id: null,
      plant_id: null
    };

    

    // Set loader
    setState(prevState => ({
      ...prevState,
      isLoader: true
    }));
    const currentSelections = reactLocalStorage.getObject('selectedRow').selectedRow || [];


    // Dispatch action with callback
    dispatch(getManageBOPSOBDataList(filterData, (res) => {
      // Reset loader
      setState(prevState => ({
        ...prevState,
        isLoader: false
      }));

      if (res?.status === 200) {
        // Handle success
        setState(prevState => ({
          ...prevState,
          tableData: res.data.DataList[0].Records || [],
                      dataCount: isReset ? 0 : currentSelections.length

        }));


        // setTotalRecordCount(res.data.DataList[0].length || 0);
        setTotalRecordCount(res.data.DataList[0].TotalRecordCount || 0);
        if (res && isPagination === false) {
          setState(prevState => ({
            ...prevState,
            disableDownload: false
          }));

          setTimeout(() => {
            dispatch(disabledClass(false));
            let button = document.getElementById('Excel-Downloads-sobListing');
            button && button.click();
          }, 500);
        }
      } else if (res?.status === 204) {
        // Handle no content
        setTotalRecordCount(0);
        setState(prevState => ({
          ...prevState,
          tableData: []
        }));
        dispatch(updatePageNumber(0))
      } else {
        // Handle error
        setState(prevState => ({
          ...prevState,
          tableData: []
        }));
        setTotalRecordCount(0);
      }

      // Handle filter model reset
      if (res) {
        let shouldReset = true;

        setTimeout(() => {
          // Check if any filter is applied
          Object.keys(filterData).forEach(key => {
            if (filterData[key] !== "") {
              shouldReset = false;
            }
          });
          isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(state.filterModel))
//  if (isReset) {
//             dispatch(setSelectedRowForPagination([]));
//             reactLocalStorage.setObject('selectedRow', {});
//         }
        }, 300);

        // Reset warning messages
        setTimeout(() => {
          setWarningMessage(false);
          setIsFilterButtonClicked(false);
        }, 330);
      }
    }));
  };

  /**
 * @method editItemDetails
 * @description edit material type
 */
  const editItemDetails = (Id) => {
    setState((prevState) => ({
      ...prevState,
      isEditFlag: true,
      ID: Id,
      isOpen: true,
    }));
  };


  /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      bopSobList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }));
    }, 500);
    setDisableFilter(false)

    // Get current filter model
    const model = gridOptions?.api?.getFilterModel();
    setState((prevState) => ({
      ...prevState,
      filterModel: model
    }));

    // Show warning if filter changed but not applied
    if (!isFilterButtonClicked) {
      setWarningMessage(true);
    }
    

    // Update floating filter data
    if (value?.filterInstance?.appliedModel === null ||
      value?.filterInstance?.appliedModel?.filter === "") {
      if (value.column.colId === value.column.colId) {
        setFloatingFilterData(prev => ({
          ...prev,
          [value.column.colId]: ""
        }));
      }
    } else {
      // Handle effective date separately
      if (value.column.colId === "EffectiveDate") {
          const dateValue = value.filterInstance.appliedModel.dateFrom;
          setFloatingFilterData(prev => ({
              ...prev,
              EffectiveDate: dateValue ? DayTime(dateValue).format('DD/MM/YYYY') : ""
          }));
      } else {
          setFloatingFilterData(prev => ({
              ...prev,
              [value.column.colId]: value.filterInstance.appliedModel.filter
          }));
      }
  }
}

  /**
    * @method buttonFormatter
    * @description Renders buttons
    */
  const buttonFormatter = (params) => {

    const cellValue = params?.valueFormatted ? params.valueFormatted : params?.value;
    return (
      <>
        {permissions.Edit && <Button id={`clientListing_edit${props.rowIndex}`} className={"Edit Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue)} title={"Edit"} />
        }
      </>
    );
  };

  /**
   * @method costingHeadFormatter
   * @description Renders Costing head
   */
  const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? `${vendorLabel} Based` : 'Zero Based';
  }




  /**
  * @method closeDrawer
  * @description Filter listing
  */
  const closeDrawer = (e = '', type) => {
    setState((prevState) => ({ ...prevState, isOpen: false, isEditFlag: false, ID: '', }))
    if (type === 'submit') {
      getDataList();
    }

  };


  /**
    * @method hyphenFormatter
    */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }
  const onGridReady = (params) => {
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
  };
  const onRowSelect = (event) => {
    let selectedRows = state.gridApi.getSelectedRows() || [];
    
    
    // Get stored selections from localStorage
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow || [];
    

    if (selectedRows === undefined || selectedRows === null) {   
      // First render - use stored selections
      selectedRows = selectedRowForPagination;
    } 
    else if (selectedRowForPagination?.length > 0) {   
      let finalData = [];

      if (event.node.isSelected() === false) {    
        // Handle deselection
        
        finalData = selectedRowForPagination.filter(item => 
          item.BoughtOutPartNumber !== event.data.BoughtOutPartNumber
        );
      } else {
        // Keep existing selections
        finalData = selectedRowForPagination;
      }

      // Combine with current selections
      selectedRows = [...selectedRows, ...finalData];
    }

    // Remove duplicates
    let uniqueArray = _.uniqBy(selectedRows, "BoughtOutPartNumber")
    
    // Update state and storage
    dispatch(setSelectedRowForPagination(uniqueArray))
    reactLocalStorage.setObject('selectedRow', { selectedRow: uniqueArray })
    
    const newDataCount = uniqueArray.length;
    setState((prevState) => ({ 
      ...prevState, 
      dataCount: newDataCount 
    }))
  }

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }))
    dispatch(disabledClass(true))

    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      // Download selected rows
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, disableDownload: false }))
        dispatch(disabledClass(false))
        let button = document.getElementById('Excel-Downloads-sobListing')
        button && button.click()
      }, 400)
    } else {
      // Download all data
      getDataList(0, globalTakes,floatingFilterData, true )
    }
  }

  const onBtExport = () => {
    let tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (bopSobList ? bopSobList : [])
    return returnExcelColumn(BOP_SOB_DOWNLOAD_EXCEL, tempArr)
  }

  const setDate = (date) => {
    setFloatingFilterData(prevState => ({
      ...prevState,
      EffectiveDate: date
    }));
  }

  var filterParams = {
    date: "", inRangeInclusive: true, filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
        var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
        let date = document.getElementsByClassName('ag-input-field-input')
        for (let i = 0; i < date.length; i++) {
            if (date[i].type == 'radio') {
                date[i].click()
            }
        }

        setDate(newDate)
        if (dateAsString == null) return -1;
        var dateParts = dateAsString.split('/');
        var cellDate = new Date(
            Number(dateParts[2]),
            Number(dateParts[1]) - 1,
            Number(dateParts[0])
        );
        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
    },

    browserDatePicker: true,
    minValidYear: 2000,
  }
  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.Specification === null) {
        item.Specification = ' '
      } if (item.Plants === '-') {
        item.Plants = ' '
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={sobManage}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }
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
  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  }

  /**
   * @method effectiveDateFormatter
   * @description Renders buttons
   */
  const effectiveDateFormatter = (props) => {
    if (state?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted
        ? props.valueFormatted
        : props?.value;

      return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
    }
  };


  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
      dataCount: 0,
      filterModel: {}
    }))
    setDisableFilter(true)
    setIsFilterButtonClicked(false)
    setWarningMessage(false)

    // Reset grid state
    gridOptions?.columnApi?.resetColumnState(null)
    gridOptions?.api?.setFilterModel(null)
    dispatch(resetStatePagination())
    // Reset filters
    setFloatingFilterData({
      BoughtOutPartNumber: "",
      BoughtOutPartName: "",
      // ... other filter resets ...
    })

    // Reset pagination
    dispatch(updatePageNumber(1))
    dispatch(updateCurrentRowIndex(0))
    dispatch(updateGlobalTake(10))
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))

    // Clear selections
    dispatch(setSelectedRowForPagination([]))
    reactLocalStorage.setObject('selectedRow', {})

    // Fetch fresh data
    getDataList(0, globalTakes, floatingFilterData, true,true)
  }
  const handleShown = () => {
    setState((prevState) => ({ ...prevState, shown: !state.shown }))
  }

  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }

  const { isOpen, isEditFlag, noData } = state;
  const isFirstColumn = (params) => {

    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    if (props?.isMasterSummaryDrawer) {
      return false
    } else {
      return thisIsFirstColumn;
    }

  }
  const checkBoxRenderer = (props) => {
    // Get stored selections
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow || [];
    
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    
    // Check if row should be selected based on stored selections
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.forEach(item => {
        if (item.BoughtOutPartNumber === props.node.data.BoughtOutPartNumber) {
          props.node.setSelected(true);
        }
      });
    }
    return cellValue;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelection: isFirstColumn,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    costingHeadFormatter: costingHeadFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    commonCostFormatter: commonCostFormatter,
    checkBoxRenderer: checkBoxRenderer,

  };
  const onSearch = () => {
    setState((prevState) => ({ ...prevState, noData: false }))
    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    // setPageNo(1)
    dispatch(updatePageNumber(1))
    dispatch(updateCurrentRowIndex(0))
    
    
    // setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getDataList(0, globalTakes, floatingFilterData,true)
  }
  return (
    <div className={`ag-grid-react ${permissions.Download ? "show-table-btn" : ""} min-height100vh`}>
      {state.isLoader && <LoaderCustom />}
      <form noValidate>
        <Row className="pt-4 ">


          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              {state.shown ? (
                <button type="button" className="user-btn filter-btn-top" onClick={handleShown()} >
                  <div className="cancel-icon-white"></div></button>
                // <Button id={"sobListing_close"} className="user-btn filter-btn-top" onClick={handleShown()} icon={"cancel-icon-white"} />
              ) : (
                <>
                </>
              )}
              ' <div className="warning-message d-flex align-items-center">
                {warningMessage && !state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}

                <Button
                  id="sobListing_filter"
                  className={"mr5 Tour_List_Filter"}
                  onClick={() => onSearch()}
                  title={"Filtered data"}
                  icon={"filter"}
                  disabled={disableFilter}
                />
              </div>
              {
                permissions.Download &&
                <>

                  <Button
                    className="mr5 Tour_List_Download"
                    id={"sobListing_excel_download"}
                    onClick={onExcelDownload}
                    title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                    icon={"download mr-1"}
                    buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                  />
                  <ExcelFile filename={Sob} fileExtension={'.xls'}
                    element={
                      <Button id={"Excel-Downloads-sobListing"} className="p-absolute" />

                    }>
                    {onBtExport()}
                  </ExcelFile>
                </>

              }
              <Button
                id={"sobListing_refresh"} className="user-btn Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
            </div>
          </Col>
        </Row>

      </form>
      <Row>
        <Col>
          <div className={`ag-grid-wrapper height-width-wrapper ${(bopSobList && bopSobList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className="ag-grid-header">
              <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
              <TourWrapper
                buttonSpecificProp={{ id: "SOB_listing_Tour", onClick: toggleExtraData }}
                stepsSpecificProp={{
                  steps: Steps(t, { addLimit: false, filterButton: false, addButton: false, bulkUpload: false, downloadButton: true, viewButton: false, EditButton: true, DeleteButton: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                }} />
            </div>
            <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
              {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout='autoHeight'
                // columnDefs={c}
                rowData={state.showExtraData && bopSobList ? [...setLoremIpsum(bopSobList[0]), ...bopSobList] : bopSobList}
                // pagination={true}
                paginationPageSize={globalTakes}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: 'imagClass'
                }}
                frameworkComponents={frameworkComponents}
                rowSelection={'multiple'}
                onRowSelected={onRowSelect}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
              >
                {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                <AgGridColumn 
                  field="BoughtOutPartNumber" 
                  headerName={`${showBopLabel()} Part No.`}
                  cellRenderer={'checkBoxRenderer'}
                  cellClass="has-checkbox"
                />
                <AgGridColumn field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>
                <AgGridColumn field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="NoOfVendors" headerName={`No. of ${vendorLabel}s`} ></AgGridColumn>

                <AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>
                <AgGridColumn field="ShareOfBusinessPercentage" headerName="Total SOB (%)"></AgGridColumn>
                <AgGridColumn width={205} field="WeightedNetLandedCost" headerName={`Weighted Net Cost (${reactLocalStorage.getObject("baseCurrency")}) `} cellRenderer={'commonCostFormatter'}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={effectiveDateFormatter} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>

                <AgGridColumn field="BoughtOutPartNumber" width={120} cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
              </AgGridReact>
              {/* {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />} */}
              <div className='button-wrapper'>
                {<PaginationWrappers gridApi={state.gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="SOB" />}
                {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                  <PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="SOB" />

                }

              </div>
            </div>
          </div>

        </Col>
      </Row>
      {isOpen && <ManageSOBDrawer
        isOpen={isOpen}
        closeDrawer={closeDrawer}
        isEditFlag={isEditFlag}
        ID={state.ID}
        anchor={'right'}
      />}

    </div >
  );
};

export default SOBListing