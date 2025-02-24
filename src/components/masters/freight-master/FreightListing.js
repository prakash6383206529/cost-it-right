import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import { getFreightDataList, deleteFright, } from '../actions/Freight';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { FREIGHT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import { FreightMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { getLocalizedCostingHeadValue, loggedInUserId, searchNocontentFilter } from '../../../helper';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission } from '../../common/CommonFunctions';
import { ApplyPermission } from '.';
import Button from '../../layout/Button';
import DayTime from '../../common/DayTimeWrapper';
import { useLabels, useWithLocalization } from '../../../helper/core';
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';
import { setResetCostingHead } from '../../../actions/Common';
const gridOptions = {};
const FreightListing = (props) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    tableData: [],
    isBulkUpload: false,
    shown: false,
    costingHead: [],
    destinationLocation: [],
    sourceLocation: [],
    vendor: [],
    isLoader: false,
    showPopup: false,
    deletedId: '',
    selectedRowData: false,
    noData: false,
    dataCount: 0
  })
  const permissions = useContext(ApplyPermission);
  const { freightDetail } = useSelector((state) => state.freight);
  const { vendorLabel,vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  const { costingHeadFilter } = useSelector((state) => state?.comman);

  useEffect(() => {
    !props.stopApiCallOnCancel && setState((prevState) => ({ ...prevState, isLoader: true }))
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
        setTimeout(() => {
          getDataList()
        }, 500);
      }
    }, 300);
  }, [props.stopApiCallOnCancel])
  //for static dropdown
  useEffect(() => {
   
    if (costingHeadFilter && costingHeadFilter?.data) {
      const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
      if (matchedOption) {
        state.gridApi?.setQuickFilter(matchedOption?.label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ costingHeadFilter]);
  useEffect(() => {
    return () => {
      dispatch(setResetCostingHead(true, "costingHead"))
    }
  }, [])
  /**
  * @method getDataList
  * @description GET DETAILS OF BOP DOMESTIC
  */
  const getDataList = (freight_for = '', vendor_id = '', source_city_id = 0, destination_city_id = 0,) => {
    const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
    const filterData = { freight_for: freight_for, vendor_id: vendor_id, source_city_id: source_city_id, destination_city_id: destination_city_id, IsCustomerDataShow: cbc, IsVendorDataShow: vbc, IsZeroDataShow: zbc }
    dispatch(getFreightDataList(filterData, (res) => {
      setState((prevState) => ({ ...prevState, isLoader: false }))
      if (res && res.status === 200) {
        let Data = res.data.DataList;
        setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false }))
      } else if (res && res.response && res.response.status === 412) {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      } else {
        setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
      }
    }))
  }
  /**
  * @method viewOrEditItemDetails
  * @description edit or view material type
  */
  const viewOrEditItemDetails = (Id, rowData, isViewMode, isEditMode) => {
    let data = { isEditFlag: true, Id: Id, IsVendor: rowData.CostingHead, isViewMode: isViewMode, isEditMode: isEditMode }
    props.getDetails(data);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteFright(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_FREIGHT_SUCCESSFULLY);
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
        getDataList()
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      freightDetail.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }))
    }, 500);
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
        {permissions.View && <Button id={`freightListing_view${props.rowIndex}`} className={"View mr-2"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true, false)} title={"View"} />}
        {permissions.Edit && <Button id={`freightListing_edit${props.rowIndex}`} className={"Edit mr-2"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, rowData, false, true)} title={"Edit"} />}
        {permissions.Delete && !rowData?.IsFreightAssociated && <Button id={`freightListing_delete${props.rowIndex}`} className={"Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
      </>
    )
  };
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
      setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, CostingHead: value } }));   
      setState((prevState) => ({ ...prevState, disableFilter: false }));
    }
};
  
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer
    costingHeadFormatter(props);
  
    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);
  
    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
  };
  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? cellValue : ""

  }

  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      props.displayForm()
    }
  }

  /**
  * @method hyphenFormatter
  */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }

  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
  }

  const returnExcelColumn = (data = [], TempData) => {
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

    // Map TempData to replace "NA" with "-"
    let temp = [];  
    temp = TempData && TempData.map((item) => {
        const newItem = { ...item }; // Create a copy of the object to avoid mutating original data
        for (let key in newItem) {
         if (newItem[key] === 'NA'||newItem[key] === ' '||newItem[key] === null||newItem[key] === undefined) {
                newItem[key] = '-';
            }
          }
        return newItem;
    });
    

 return (<ExcelSheet data={temp} name={`${FreightMaster}`}>
       {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
     </ExcelSheet>);
  }


  
  const onGridReady = (params) => {
    state.gridApi = params.api;
    state.gridApi.sizeColumnsToFit();
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
  };
  const onPageSizeChanged = (newPageSize) => {
    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onRowSelect = () => {
    const selectedRows = state.gridApi?.getSelectedRows()
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
  }
  const FREIGHT_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(FREIGHT_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = []
    tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (freightDetail ? freightDetail : [])
    return returnExcelColumn(FREIGHT_DOWNLOAD_EXCEl_LOCALIZATION, tempArr)
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
    state.gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }


  const ExcelFile = ReactExport.ExcelFile;
  const { noData } = state;

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
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    statusFilter: CostingHeadDropdownFilter,
  };

  return (
    <div className={`ag-grid-react grid-parent-wrapper ${permissions.Download ? "show-table-btn" : ""}`}>
      {state.isLoader && <LoaderCustom />}
      <form noValidate>
        <Row className="pt-4">
          <Col md="6" className="search-user-block mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                             {/* Add button */}
                             {permissions.Add && (
                  <Button
                    id="freightListing_add"
                    className={"user-btn mr5"}
                    onClick={formToggle}
                    title={"Add"}
                    icon={"plus mr-0"}
                  />
                )}

                {/* Excel Download Button */}
                {permissions.Download && (
                  <>
                    <ExcelFile
                      filename="FreightMaster"
                      fileExtension={'.xls'}
                      element={
                        <Button
                          id={"Excel-Downloads-freightListing"}
                          title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                          type="button"
                          className={'user-btn mr5'}
                          icon={"download mr-1"}
                          buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                        />
                      }
                    >
                      {onBtExport()}
                    </ExcelFile>
                  </>
                )}

                {/* Reset Button */}
                <Button
                  id={"freightListing_refresh"}
                  onClick={resetState}
                  title={"Reset Grid"}
                  icon={"refresh"}
                />
              </div>
            </div>
          </Col>
        </Row>
      </form>
      <Row>
        <Col>
          <div
            className={`ag-grid-wrapper height-width-wrapper ${(freightDetail && freightDetail.length <= 0) || noData
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
            <div className={`ag-theme-material`}>
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
                rowData={freightDetail}
                pagination={true}
                paginationPageSize={10}
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
                <AgGridColumn width='240px' field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'}   floatingFilterComponentParams={floatingFilterStatus} 
                                            floatingFilterComponent="statusFilter"></AgGridColumn>
                <AgGridColumn field="Mode" headerName="Mode"></AgGridColumn>
                <AgGridColumn
                  field="VendorName"
                  headerName={`${vendorLabel} (Code)`}
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  field="Plant"
                  headerName="Plant (Code)"
                  cellRenderer={"hyphenFormatter"}
                ></AgGridColumn>
                {reactLocalStorage.getObject("CostingTypePermission").cbc && (
                  <AgGridColumn
                    field="CustomerName"
                    headerName="Customer (Code)"
                    cellRenderer={"hyphenFormatter"}
                  ></AgGridColumn>
                )}

                {/* New Columns */}
                <AgGridColumn
                  field="Load"
                  headerName="Load"
                  valueGetter={(params) => params.data?.FreightLoadType || "-"}
                ></AgGridColumn>
                <AgGridColumn
                  field="DimensionsName"
                  headerName="Truck Dimensions (mm)"
                  valueGetter={(params) => params.data?.DimensionsName || "-"}
                ></AgGridColumn>
                <AgGridColumn
                  field="Capacity"
                  headerName="Capacity"
                  valueGetter={(params) => params.data?.Capacity || "-"}
                ></AgGridColumn>
                <AgGridColumn
                  field="Criteria"
                  headerName="Criteria"
                  valueGetter={(params) => params.data?.RateCriteria || "-"}
                ></AgGridColumn>
                <AgGridColumn field="Rate" headerName="Rate"></AgGridColumn>
                <AgGridColumn
                  field="EffectiveDate"
                  headerName="Effective Date"
                  cellRenderer={"effectiveDateFormatter"}
                ></AgGridColumn>
                <AgGridColumn
                  width="200px"
                  field="FreightId"
                  cellClass="ag-grid-action-container"
                  headerName="Action"
                  type="rightAligned"
                  floatingFilter={false}
                  cellRenderer={"totalValueRenderer"}
                ></AgGridColumn>
              </AgGridReact>
              {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
            </div>
          </div>
        </Col>
      </Row>

      {state.showPopup && (
        <PopupMsgWrapper
          isOpen={state.showPopup}
          closePopUp={closePopUp}
          confirmPopup={onPopupConfirm}
          message={`${MESSAGES.FREIGHT_DELETE_ALERT}`}
        />
      )}
    </div>
  );
};

export default FreightListing;