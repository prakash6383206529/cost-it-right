import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import NoContentFound from '../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants'
import { getSimulationHistory } from '../actions/History'
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { PaginationWrapper } from '../../common/commonPagination'
import { getLocalizedCostingHeadValue } from '../../../helper'
import { useLabels } from '../../../helper/core'
import CostingHeadDropdownFilter from '../../masters/material-master/CostingHeadDropdownFilter'
import { reactLocalStorage } from 'reactjs-localstorage'

function SimulationHistory(props) {

  const { vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels()
  const simulationHistory = useSelector(state => state.history.simulationHistory)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
const {costingHeadFilter} =useSelector(state => state.common )
  const dispatch = useDispatch()

  useEffect(() => {
   
    if (costingHeadFilter && costingHeadFilter.data) {
      const matchedOption = costingHeadFilter.CostingHeadOptions.find(option => option.value === costingHeadFilter.data.value);
      if (matchedOption) {
        gridApi?.setQuickFilter(matchedOption.label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ costingHeadFilter]);
  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };
  const gridOptions = {
    clearSearch: true,
    noDataText: (simulationHistory === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),

  };
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer

    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: false,
    // headerCheckboxSelection: isFirstColumn,
    // checkboxSelection: isFirstColumn
  };
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
  
};
  
  const frameworkComponents = {
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    statusFilter: CostingHeadDropdownFilter,

  };
  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  useEffect(() => {
    dispatch(getSimulationHistory(() => { }))
  }, [])

  return (
    <div className="container-fluid simulation-history-page">
      <Row>
        <Col sm="12" >
          <h1 className="mb-4">{`Simulation Historyff`}</h1>
        </Col>
      </Row>
      <div className="ag-grid-react grid-parent-wrapper">
        <div className={`ag-grid-wrapper height-width-wrapper ${simulationHistory && simulationHistory?.length <= 0 ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            {/* <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} /> */}
          </div>
          <div
            className="ag-theme-material">
            <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              // columnDefs={c}
              rowData={simulationHistory}
              pagination={true}
              paginationPageSize={defaultPageSize}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              loadingOverlayComponent={'customLoadingOverlay'}
              noRowsOverlayComponent={'customNoRowsOverlay'}
              noRowsOverlayComponentParams={{
                title: EMPTY_DATA,
                imagClass: 'imagClass'
              }}
              frameworkComponents={frameworkComponents}
              suppressRowClickSelection={true}
              rowSelection={'multiple'}
            >
              {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
              <AgGridColumn field="TokenNumber" headerName="Token No"></AgGridColumn>
              <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'} floatingFilterComponentParams={floatingFilterStatus}
                floatingFilterComponent="statusFilter"></AgGridColumn>
              <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
              <AgGridColumn field="VendorName" headerName="Simulated By"></AgGridColumn>
              <AgGridColumn field="ImpactCosting" headerName="Impacted Costing" ></AgGridColumn>
              <AgGridColumn field="ImpactParts" headerName="Impacted Parts "></AgGridColumn>
              <AgGridColumn field="SimulatedBy" headerName="Simulated By"></AgGridColumn>
              <AgGridColumn field="SimulatedOn" headerName="Simulated On"></AgGridColumn>
              <AgGridColumn field="ApprovedBy" headerName="Approved By"></AgGridColumn>
              <AgGridColumn field="ApprovedOn" headerName="Approved On"></AgGridColumn>
              <AgGridColumn field="CostingStatus" headerName="Status"></AgGridColumn>
              <AgGridColumn field="SimulationId" cellClass="ag-grid-action-container" headerName="Actions"></AgGridColumn>
            </AgGridReact>
            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationHistory;