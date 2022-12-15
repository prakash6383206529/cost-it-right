import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster, EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { getSimulationInsightReport } from '../actions/SimulationInsight';
import { useDispatch } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper'
import WarningMessage from '../../common/WarningMessage';
import SelectRowWrapper from '../../common/SelectRowWrapper'


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
  const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalTokenNumber: "", createdDate: "", SimulatedByName: "", CostingHead: "", TechnologyName: "", masters: "", DepartmentName: "", DepartmentCode: "", initiatedBy: "", SimulationStatus: "", EffectiveDate: "", requestedOn: "", SimulationTechnologyHead: "", SenderUserName: "", SentDate: "" })
  const [pageSize10, setPageSize10] = useState(true)
  const [pageSize50, setPageSize50] = useState(false)
  const [pageSize100, setPageSize100] = useState(false)
  const [pageNo, setPageNo] = useState(1)
  const [totalRecordCount, setTotalRecordCount] = useState(0)
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [filterModel, setFilterModel] = useState({});
  const [isSearchButtonDisable, setIsSearchButtonDisable] = useState(true);
  const [warningMessage, setWarningMessage] = useState(false)
  const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [dataCount, setDataCount] = useState(0)


  var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      // var dateAsString = cellValue != null ? DayTime(cellValue).format('MM/DD/YYYY') : '';

      var dateAsString = cellValue != null ? cellValue.split('-') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      setFloatingFilterData({ ...floatingFilterData, EffectiveDate: newDate })
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

  var filterParamsSecond = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      // var dateAsString = cellValue != null ? DayTime(cellValue).format('MM/DD/YYYY') : '';

      var dateAsString = cellValue != null ? cellValue.split('-') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      setFloatingFilterData({ ...floatingFilterData, createdDate: newDate })
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
    getTableData(0, defaultPageSize, true, floatingFilterData)
  }, [])


  useEffect(() => {

    if (simulationInsightsReport.length > 0) {

      setTotalRecordCount(simulationInsightsReport[0].TotalRecordCount)

    }

  }, [simulationInsightsReport])


  const onBtPrevious = () => {
    if (currentRowIndex >= 10) {
      setPageNo(pageNo - 1)
      const previousNo = currentRowIndex - 10;
      getTableData(previousNo, globalTake, true, floatingFilterData)
      setCurrentRowIndex(previousNo)
    }
  }


  const onBtNext = () => {
    if (currentRowIndex < (totalRecordCount - 10)) {
      setPageNo(pageNo + 1)
      const nextNo = currentRowIndex + 10;
      getTableData(nextNo, globalTake, true, floatingFilterData)
      setCurrentRowIndex(nextNo)
    }
  };

  const getTableData = (skip, take, isPagination, data) => {

    setLoader(true)
    dispatch(getSimulationInsightReport(skip, take, isPagination, data, res => {
      const data = res.data.DataList
      setSimulationInsight(data[0].Data)
      setSimulationInsightsReportExcelData(data[0].Data)

      if ((res && res.status === 204) || res?.data?.DataList[0]?.Data?.length === 0) {
        setTotalRecordCount(0)
        setPageNo(0)
      }

      let arr = [];
      let simulationInsightExcel = [];

      data[0].TableHeads && data[0].TableHeads.map(ele => {
        if (ele.field === "DisplayStatus") {
          let obj = {
            field: "DisplayStatus",
            headerName: "Status",
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
            cellRendererFramework: (params) => <div className={params.value}>{params.value}</div>,
            //cellStyle: { background: "green" },      // DO NOT DELETE THIS
            //cellClass: ["Draft"]                     // DO NOT DELETE THIS
            hide: true,
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
            filterParams: filterParamsSecond
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

  }



  const onSearch = () => {


    setWarningMessage(false)
    setPageNo(1)
    setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getTableData(0, globalTake, true, floatingFilterData)
  }



  const onFloatingFilterChanged = (value) => {
    //setEnableSearchFilterButton(false)

    // Gets filter model via the grid API
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model)
    setWarningMessage(true)

    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {

      setWarningMessage(false)

    } else {

      if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
        setIsSearchButtonDisable(false)
        return false
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
      setIsSearchButtonDisable(false)

    }

  }


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
    for (var prop in floatingFilterData) {
      floatingFilterData[prop] = ""
    }

    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    setPageNo(1)
    setCurrentRowIndex(0)
    getTableData(0, defaultPageSize, true, floatingFilterData)
    setGlobalTake(10)
    setPageSize10(true)
    setPageSize50(false)
    setPageSize100(false)
    setDataCount(0)
  }


  const onRowSelect = () => {
    var selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length > 0) {
      setSimulationInsightsReportExcelData(selectedRows)
    } else {

      setSimulationInsightsReportExcelData(simulationInsightsReport)
    }
    setDataCount(selectedRows.length)
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
    sortable: false,
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

    if (Number(newPageSize) === 10) {
      getTableData(currentRowIndex, 10, true, floatingFilterData)
      setPageSize10(true)
      setPageSize50(false)
      setPageSize100(false)
      setGlobalTake(10)
    }
    else if (Number(newPageSize) === 50) {
      getTableData(currentRowIndex, 50, true, floatingFilterData)
      setPageSize10(false)
      setPageSize50(true)
      setPageSize100(false)
      setGlobalTake(50)
    }
    else if (Number(newPageSize) === 100) {
      getTableData(currentRowIndex, 100, true, floatingFilterData)
      setPageSize10(false)
      setPageSize50(false)
      setPageSize100(true)
      setGlobalTake(100)
    }

  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }

  return (
    // <div>{`hello`}</div>
    <div className="container-fluid report-listing-page ag-grid-react custom-pagination">
      {loader && <LoaderCustom />}
      <h1 className="mb-0">Simulation Insights Report</h1>
      <Row className="pt-4 blue-before ">
        <Col md="10" lg="10" className="search-user-block mb-3">
          <div className="d-flex justify-content-end bd-highlight excel-btn w100">
            <div className="warning-message d-flex align-items-center">
              {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
            </div>
            <button disabled={isSearchButtonDisable} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
              <div className="refresh mr-0"></div>
            </button>
            <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn'}><div className="download"></div>DOWNLOAD</button>}>
              {onBtExport()}
            </ExcelFile>
          </div>
        </Col>
      </Row>
      <div className="ag-grid-react">
        <div className={`ag-grid-wrapper height-width-wrapper ${simulationInsightsReport && simulationInsightsReport?.length <= 0 ? "overlay-contain" : ""}`}>
          <div className="ag-grid-header">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
            <SelectRowWrapper dataCount={dataCount} className="mb-1 mt-n1" />
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
              paginationPageSize={globalTake}
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
              onFilterModified={onFloatingFilterChanged}
            >

            </AgGridReact>

            <div className='button-wrapper'>
              <div className="paging-container d-inline-block float-right">
                <select className="form-control paging-dropdown" defaultValue={globalTake} onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                  <option value="10" selected={true}>10</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="d-flex pagination-button-container">
                <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                {pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                {pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                {pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


export default SimulationInsights
