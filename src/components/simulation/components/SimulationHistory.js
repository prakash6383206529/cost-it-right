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

function SimulationHistory(props) {

  const simulationHistory = useSelector(state => state.history.simulationHistory)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const dispatch = useDispatch()

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };
  const gridOptions = {
    clearSearch: true,
    noDataText: (simulationHistory === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),

  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: false,
    // headerCheckboxSelection: isFirstColumn,
    // checkboxSelection: isFirstColumn
  };
  const frameworkComponents = {
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
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
      <div className="ag-grid-react">
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
              <AgGridColumn field="CostingHead" headerName="Costing Head"></AgGridColumn>
              <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
              <AgGridColumn field="VendorName" headerName="Simulated By"></AgGridColumn>
              <AgGridColumn field="ImpactCosting" headerName="Impacted Costing" ></AgGridColumn>
              <AgGridColumn field="ImpactParts" headerName="Impacted Parts "></AgGridColumn>
              <AgGridColumn field="SimulatedBy" headerName="Simulated By"></AgGridColumn>
              <AgGridColumn field="SimulatedOn" headerName="Simulated On"></AgGridColumn>
              <AgGridColumn field="ApprovedBy" headerName="Approved By"></AgGridColumn>
              <AgGridColumn field="ApprovedOn" headerName="Approved On"></AgGridColumn>
              <AgGridColumn field="CostingStatus" headerName="Status"></AgGridColumn>
              <AgGridColumn field="SimulationId" headerName="Actions"></AgGridColumn>
            </AgGridReact>
            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationHistory;