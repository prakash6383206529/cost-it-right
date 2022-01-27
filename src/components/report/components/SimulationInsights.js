import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import {ReportMaster, EMPTY_DATA } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { getSimulationInsightReport } from '../actions/SimulationInsight';
import { useDispatch } from 'react-redux';


const ExcelFile = ReactExport.ExcelFile;

function SimulationInsights(props) {
  
  const dispatch = useDispatch()
  const [simulationInsightsReport,setSimulationInsight] = useState([])
  const [tableHeader,setTableHeader] = useState([])
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [loader,setLoader] = useState(false)

  useEffect(()=>{
    setLoader(true)
   dispatch(getSimulationInsightReport(res=>{
     console.log('res: ', res);
    const data = res.data.DataList
    console.log('data: ', data);
    setSimulationInsight(data[0].Data)
    setTableHeader(data[0].TableHeads)
    setLoader(false)
   }))
  },[])


  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };
  const gridOptions = {
    clearSearch: true,
    noDataText: (simulationInsightsReport === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),

  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: true,
  };
  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
}
  const frameworkComponents = {
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };
  const onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    gridApi.paginationSetPageSize(Number(value));
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
}

    return (
      // <div>{`hello`}</div>
        <div className="container-fluid report-listing-page ag-grid-react">
                <h1 className="mb-0">Report</h1>
                <Row className="pt-4 blue-before ">
                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                            <div>
                               <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                              
                                </ExcelFile>
                            </div>
                        </div>
                    </Col>
                </Row>
            <div className="ag-grid-react">
        <div className={`ag-grid-wrapper height-width-wrapper ${simulationInsightsReport && simulationInsightsReport?.length <=0 ?"overlay-contain": ""}`}>
          <div className="ag-grid-header">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
          </div>
          <div
            className="ag-theme-material">
            <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              columnDefs={tableHeader}
              rowData={simulationInsightsReport}              
              pagination={true}
              paginationPageSize={10}
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
           
            </AgGridReact>
            <div className="paging-container d-inline-block float-right">
              <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                <option value="10" selected={true}>10</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
        </div>
    );
}


export default SimulationInsights