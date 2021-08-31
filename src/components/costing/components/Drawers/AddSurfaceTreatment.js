import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getSurfaceTreatmentDrawerDataList, getSurfaceTreatmentDrawerVBCDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper';
const gridOptions = {};


function AddSurfaceTreatment(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(props.Ids);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState(null);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', selectedRowData)
  };

  useEffect(() => {
    if (costData.VendorType === ZBC) {
      const data = {
        PlantId: costData.PlantId,
        TechnologyId: costData.TechnologyId,
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,
      }
      dispatch(getSurfaceTreatmentDrawerDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))
    } else {

      const data = {
        VendorId: costData.VendorId,
        TechnologyId: costData.TechnologyId,
        VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? costData.DestinationPlantId : EMPTY_GUID,
        EffectiveDate: CostingEffectiveDate,
        CostingId: costData.CostingId,
      }
      dispatch(getSurfaceTreatmentDrawerVBCDataList(data, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          setTableDataList(Data)
        } else if (res && res.response && res.response.status === 412) {
          setTableDataList([])
        } else {
          setTableDataList([])
        }
      }))

    }
  }, []);

  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    paginationShowsTotal: renderPaginationShowsTotal(),

  };

  const onRowSelect = (row, isSelected, e) => {

    var selectedRows = gridApi.getSelectedRows();
    setSelectedRowData(selectedRows)
    // if (isSelected) {
    //   let tempArr = [...selectedRowData, row]
    //   setSelectedRowData(tempArr)
    // } else {
    //   const OperationId = row.OperationId;
    //   let tempArr = selectedRowData && selectedRowData.filter(el => el.OperationId !== OperationId)
    //   setSelectedRowData(tempArr)
    // }

  }

  const onSelectAll = (isSelected, rows) => {
    if (isSelected) {
      setSelectedRowData(rows)
    } else {
      setSelectedRowData([])
    }
  }

  const selectRowProp = {
    mode: 'checkbox',
    clickToSelect: true,
    unselectable: selectedIds,
    onSelect: onRowSelect,
    onSelectAll: onSelectAll
  };

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedRowData.length === 0) {
      toastr.warning('Please select row.')
      return false;
    }
    toggleDrawer('')
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const onSubmit = data => {
    toggleDrawer('')
  }

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };


  const onGridReady = (params) => {
    // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    // getDataList()
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };

  const onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    gridApi.paginationSetPageSize(Number(value));
  };

  const onFilterTextBoxChanged = (e) => {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  const rateFormat = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== null ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : '-'
  }

  const frameworkComponents = {
    // totalValueRenderer: this.buttonFormatter,
    // effectiveDateRenderer: this.effectiveDateFormatter,
    // costingHeadRenderer: this.costingHeadFormatter,
    // netLandedFormat: netLandedFormat,
    // netLandedConversionFormat: netLandedConversionFormat,
    // currencyFormatter: currencyFormatter,
    rateFormat: rateFormat,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  const isRowSelectable = rowNode => rowNode.data ? !selectedIds.includes(rowNode.data.OperationId) : false;

  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
  }


  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        < div className={`ag-grid-react`}>
          <Container>
            <div className={'drawer-wrapper drawer-1500px'}>

              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{'ADD Surface Treatment'}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>


              <Row className="mx-0 mb-3">
                <Col>
                  {/* <BootstrapTable
                  data={tableData}
                  striped={false}
                  bordered={false}
                  hover={false}
                  options={options}
                  selectRow={selectRowProp}
                  search
                  multiColumnSearch={true}
                  //exportCSV
                  //ignoreSinglePage
                  //ref={'table'}
                  pagination>
                  <TableHeaderColumn dataField="OperationId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="OperationName"  >{'Operation Name'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="OperationCode" >{'Operation Code'}</TableHeaderColumn>
                  <TableHeaderColumn width={70} columnTitle={true} dataAlign="center" dataField="Technology" >{'Technology'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="UnitOfMeasurement" >{'UOM'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Rate" searchable={false} >{'Rate'}</TableHeaderColumn>
                  {initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure && <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="LabourRate" searchable={false} >{'LabourRate'}</TableHeaderColumn>}
                 
                </BootstrapTable> */}
                  <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                    <div className="ag-grid-header">
                      <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                      <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                        <div className="refresh mr-0"></div>
                      </button>
                    </div>
                    <div
                      className="ag-theme-material"
                      style={{ height: '100%', width: '100%' }}
                    >
                      <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        defaultColDef={defaultColDef}
                        domLayout='autoHeight'
                        // columnDefs={c}
                        rowData={tableData}
                        pagination={true}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                          title: CONSTANT.EMPTY_DATA,
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                        isRowSelectable={isRowSelectable}
                      >
                        <AgGridColumn field="OperationId" hide={true}></AgGridColumn>
                        <AgGridColumn field="OperationName" headerName="Operation Name"></AgGridColumn>
                        <AgGridColumn field="OperationCode" headerName="Operation Code"></AgGridColumn>
                        <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
                        <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                        <AgGridColumn field="Rate" cellRenderer={'rateFormat'}></AgGridColumn>
                        {initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure && <AgGridColumn field="LabourRate" headerName='Labour Rate' ></AgGridColumn>}


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
                </Col>
              </Row>


              <div className="col-sm-12 text-left ">
                <button
                  type={'button'}
                  className="submit-button mr5 save-btn"
                  onClick={addRow} >
                  <div className={'save-icon'}></div>
                  {'SELECT'}
                </button>

                <button
                  type={'button'}
                  className="reset cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
              </div>


            </div>
          </Container>
        </div>
      </Drawer>
    </div>
  );
}

export default React.memo(AddSurfaceTreatment);