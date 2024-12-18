import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster, EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper'
import WarningMessage from '../../common/WarningMessage';
import SelectRowWrapper from '../../common/SelectRowWrapper'
import { getSimulationInsightReport } from '../actions/ReportListing';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from "react-i18next"
import { useLabels } from '../../../helper/core';
import { getLocalizedCostingHeadValue } from '../../../helper';
import CostingHeadDropdownFilter from '../../masters/material-master/CostingHeadDropdownFilter';
import { isResetClick } from '../../../actions/Common';



const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function SimulationInsights(props) {
  const { t } = useTranslation("common")

  const dispatch = useDispatch()
  const [showExtraData, setShowExtraData] = useState(false)
  const [render, setRender] = useState(false)
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
  const { costingHeadFilter } = useSelector((state) => state?.comman);
  const { technologyLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  useEffect(() => {
   
    if (costingHeadFilter && costingHeadFilter?.data) {
      const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
      if (matchedOption) {
        gridApi?.setQuickFilter(matchedOption?.label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ costingHeadFilter]);
  useEffect(() => {
    return () => {
      dispatch(isResetClick(true, "costingHead"))
    }
  }, [])
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
  /**
        * @method toggleExtraData
        * @description Handle specific module tour state to display lorem data
        */
  const toggleExtraData = (showTour) => {

    setRender(true)
    setTimeout(() => {
      setShowExtraData(showTour)
      setRender(false)
    }, 100);


  }
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
      const data = res?.data?.DataList
      if ((res && res.status === 204) || res?.data?.DataList[0]?.Data?.length === 0) {
        setTotalRecordCount(0)
        setPageNo(0)
      }
      if (data) {
        setSimulationInsight(data[0].Data)
        setSimulationInsightsReportExcelData(data[0].Data)

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
      }
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
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
        // setSelectedCostingHead(originalValue);
        // setDisableFilter(false);
        setFloatingFilterData(prevState => ({
            ...prevState,
            CostingHead: value
        }));
    }
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
    floatingFilter: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };
  const frameworkComponents = {
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    statusFilter: CostingHeadDropdownFilter,
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
    <div className="container-fluid report-listing-page ag-grid-react grid-parent-wrapper custom-pagination">
      {loader && <LoaderCustom />}
      <Row className=" blue-before ">
        <Col md="10" lg="10" className="search-user-block mb-3">
          <div className="d-flex justify-content-end bd-highlight excel-btn w100">
            <div className="warning-message d-flex align-items-center">
              {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
            </div>
            <button disabled={isSearchButtonDisable} title="Filtered data" type="button" class="user-btn mr5 Tour_List_Filter" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
            <button type="button" className="user-btn mr5 Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
              <div className="refresh mr-0"></div>
            </button>
            <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn Tour_List_Download'}><div className="download"></div>DOWNLOAD</button>}>
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
            <TourWrapper
              buttonSpecificProp={{ id: "Simulation_Insights_Report", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { addButton: false, bulkUpload: false, viewButton: false, EditButton: false, DeleteButton: false, addLimit: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
              }} />
          </div>

          <div
            className="ag-theme-material">
            <AgGridReact
              defaultColDef={defaultColDef}
              floatingFilter={true}
              domLayout='autoHeight'
              columnDefs={tableHeaderColumnDefs}
              //rowData={showExtraData && simulationInsightsReport.length > 0 ? [...setLoremIpsum(simulationInsightsReport[0]), ...simulationInsightsReport] : simulationInsightsReport}

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
              {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.</AgGridColumn> */}
              <AgGridColumn field="TokenNumber" headerName="Token No"></AgGridColumn>
              <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'}
                 floatingFilterComponentParams={floatingFilterStatus} 
                     floatingFilterComponent="statusFilter"></AgGridColumn>
              <AgGridColumn field="Technology" headerName={technologyLabel}></AgGridColumn>
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
