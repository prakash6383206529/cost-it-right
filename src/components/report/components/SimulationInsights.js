import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster, EMPTY_DATA } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { getSimulationInsightReport } from '../actions/SimulationInsight';
import { useDispatch } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper'


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function SimulationInsights(props) {

  const dispatch = useDispatch()
  const [simulationInsightsReport, setSimulationInsight] = useState([])
  const [simulationInsightsReportExcelData, setSimulationInsightsReportExcelData] = useState([])
  const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [loader, setLoader] = useState(true)
  const [simulationInsightDownloadExcel, setSimulationInsightDownloadExcel] = useState([])


  var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      // var dateAsString = cellValue != null ? DayTime(cellValue).format('MM/DD/YYYY') : '';

      var dateAsString = cellValue != null ? cellValue.split('-') : '';
      if (dateAsString) {
        dateAsString = dateAsString[0] + '/' + dateAsString[1] + '/' + dateAsString[2];
      }
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
  };


  useEffect(() => {
    setLoader(true)
    dispatch(getSimulationInsightReport(res => {
      const data = res.data.DataList
      setSimulationInsight(data[0].Data)
      setSimulationInsightsReportExcelData(data[0].Data)

      let arr = [];
      let simulationInsightExcel = [];

      data[0].TableHeads && data[0].TableHeads.map(ele => {
        if (ele.field === "DisplayStatus") {
          let obj = {
            field: "DisplayStatus",
            headerName: "Display Status",
            cellRendererFramework: (params) => <div className={params.value}>{params.value}</div>,
            //cellStyle: { background: "green" },    // DO NOT DELETE THIS
            //cellClass: ["Draft"]                       // DO NOT DELETE THIS
          }

          let obj1 = {
            label: ele.headerName,
            value: ele.field
          }
          arr.push(obj)
          simulationInsightExcel.push(obj1)

        } else if (ele.field === "SimulationStatus") {
          let obj = {
            field: "SimulationStatus",
            headerName: "Simulation Status",
            cellRendererFramework: (params) => <div className={params.value}>{params.value}</div>
            //cellStyle: { background: "green" },      // DO NOT DELETE THIS
            //cellClass: ["Draft"]                     // DO NOT DELETE THIS
          }

          let obj1 = {
            label: ele.headerName,
            value: ele.field
          }
          arr.push(obj)
          simulationInsightExcel.push(obj1)
        } else if (ele.field === "CreatedDate") {

          let obj = {
            field: "CreatedDate",
            headerName: "Created Date",
            filter: "agDateColumnFilter",
            filterParams: filterParams
          }
          let obj1 = {
            label: ele.headerName,
            value: ele.field
          }
          arr.push(obj)
          simulationInsightExcel.push(obj1)
        } else if (ele.field === "EffectiveDate") {

          let obj = {
            field: "EffectiveDate",
            headerName: "EffectiveDate",
            filter: "agDateColumnFilter",
            filterParams: filterParams
          }
          let obj1 = {
            label: ele.headerName,
            value: ele.field
          }
          arr.push(obj)
          simulationInsightExcel.push(obj1)

        }
        else {
          let obj1 = {
            label: ele.headerName,
            value: ele.field
          }
          arr.push(ele)
          simulationInsightExcel.push(obj1)

        }
        return null;
      })

      setTableHeaderColumnDefs(arr)
      setSimulationInsightDownloadExcel(simulationInsightExcel)

      setLoader(false)

    }))
  }, [])


  const onBtExport = () => {
    return returnExcelColumn(simulationInsightDownloadExcel, simulationInsightsReportExcelData)
  };


  const returnExcelColumn = (data = [], TempData) => {

    return (

      <ExcelSheet data={TempData} name={'Simulation Insights'}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }



  const resetState = () => {
    gridColumnApi.resetColumnState()
    gridApi.setFilterModel(null);
  }


  const onRowSelect = () => {
    var selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length > 0) {
      setSimulationInsightsReportExcelData(selectedRows)
    } else {

      setSimulationInsightsReportExcelData(simulationInsightsReport)
    }

  }


  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };


  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
  }

  const gridOptions = {
    clearSearch: true,
    enableFilter: true,
    noDataText: (simulationInsightsReport === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),

  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: true,
    floatingFilter: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };
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
      {loader && <LoaderCustom />}
      <h1 className="mb-0">Report</h1>
      <Row className="pt-4 blue-before ">
        <Col md="6" lg="6" className="search-user-block mb-3">
          <div className="d-flex justify-content-end bd-highlight excel-btn w100">
            <div>
              <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                {onBtExport()}
              </ExcelFile>
              <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                <div className="refresh mr-0"></div>
              </button>
            </div>
          </div>
        </Col>
      </Row>
      <div className="ag-grid-react">
        <div className={`ag-grid-wrapper height-width-wrapper ${simulationInsightsReport && simulationInsightsReport?.length <= 0 ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
          </div>
          <div
            className="ag-theme-material">
            <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              columnDefs={tableHeaderColumnDefs}
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
              onSelectionChanged={onRowSelect}
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
