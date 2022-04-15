import React, { useState, useEffect, useContext, } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getProcessDrawerDataList, getProcessDrawerVBCDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
const gridOptions = {};

function AddProcess(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  const { processDrawerList, CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)

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
      dispatch(getProcessDrawerDataList(data, (res) => {
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
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,
      }
      dispatch(getProcessDrawerVBCDataList(data, (res) => {
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


  const onRowSelect = (row, isSelected, e) => {
    var selectedRows = gridApi.getSelectedRows();
    if (JSON.stringify(selectedRows) === JSON.stringify(props.Ids)) return false
    setSelectedRowData(selectedRows)
    // if (isSelected) {
    //   let tempArr = [...selectedRowData, row]
    //   setSelectedRowData(tempArr)
    // } else {
    //   const MachineRateId = row.MachineRateId;
    //   let tempArr = selectedRowData && selectedRowData.filter(el => el.MachineRateId !== MachineRateId)
    //   setSelectedRowData(tempArr)
    // }
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedRowData.length === 0) {
      Toaster.warning('Please select row.')
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
    gridApi.setQuickFilter(e.target.value);
  }

  const frameworkComponents = {
    // totalValueRenderer: this.buttonFormatter,
    // effectiveDateRenderer: this.effectiveDateFormatter,
    // costingHeadRenderer: this.costingHeadFormatter,
    // netLandedFormat: netLandedFormat,
    // netLandedConversionFormat: netLandedConversionFormat,
    // currencyFormatter: currencyFormatter,
    //  specificationFormat: specificationFormat,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  useEffect(() => {

  }, [tableData])

  const isRowSelectable = rowNode => rowNode.data ? !props.Ids.includes(rowNode.data.ProcessId) || !props.MachineIds.includes(rowNode.data.MachineRateId) : false;

  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);

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
                    <h3>{'ADD Process:'}</h3>
                  </div>
                  <div
                    onClick={cancel}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>

              <Row className="mx-0">
                <Col className="hidepage-size">

                  <div className={`ag-grid-wrapper min-height-auto height-width-wrapper ${processDrawerList && processDrawerList?.length <= 0 ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                      <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                      <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                        <div className="refresh mr-0"></div>
                      </button>
                    </div>
                    <div
                      className="ag-theme-material"
                    >
                      <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        domLayout='autoHeight'
                        // columnDefs={c}
                        rowData={processDrawerList}
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
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                        isRowSelectable={isRowSelectable}
                      >
                        <AgGridColumn field="MachineRateId" hide={true}></AgGridColumn>
                        <AgGridColumn cellClass="has-checkbox" field="ProcessName" headerName="Process Name"  ></AgGridColumn>
                        <AgGridColumn field="MachineNumber" headerName="Machine No."></AgGridColumn>
                        <AgGridColumn field="MachineName" headerName="Machine Name"></AgGridColumn>
                        <AgGridColumn field="MachineTypeName" headerName="Machine Type"></AgGridColumn>
                        <AgGridColumn field="MachineTonnage" headerName="Machine Tonnage"></AgGridColumn>
                        <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                        <AgGridColumn field="MachineRate" headerName={'Machine Rate'}></AgGridColumn>

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

              <Row className="sf-btn-footer no-gutters justify-content-between mx-0">
                <div className="col-sm-12 text-left px-3 d-flex justify-content-end">
                  <button
                    type={'button'}
                    className="reset cancel-btn mr5"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'button'}
                    className="submit-button save-btn"
                    onClick={addRow} >
                    <div className={'save-icon'}></div>
                    {'SELECT'}
                  </button>
                </div>
              </Row>

            </div>
          </Container>
        </div>
      </Drawer>
    </div>
  );
}

export default React.memo(AddProcess);