import React, { useState, useEffect, useContext, } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { Container, Row, Col, NavItem, TabContent, TabPane, Nav, NavLink } from 'reactstrap';
import { getProcessDrawerDataList, getProcessDrawerVBCDataList, setIdsOfProcess, setIdsOfProcessGroup, setSelectedDataOfCheckBox } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import classnames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { FORGING, Ferrous_Casting, DIE_CASTING } from '../../../../config/masterData'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import GroupProcess from './GroupProcess';
import _ from 'lodash'
import { getConfigurationKey } from '../../../../helper';

const gridOptions = {};

function AddProcess(props) {
  const { groupMachineId } = props
  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [updatedRowData, setUpdatedRowData] = useState([])
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  // const [processGroup, setProcessGroup] = useState(true)
  const processGroup = getConfigurationKey().IsMachineProcessGroup // UNCOMMENT IT AFTER KEY IS ADDED IN WEB CONFIG N BACKEND AND REMOVE BELOW LINE
  // const processGroup = true
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('1');

  const costData = useContext(costingInfoContext)
  const { processDrawerList, CostingEffectiveDate, selectedProcessAndGroup, selectedProcessId, selectedProcessGroupId } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event, data) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    let tempArr = selectedProcessGroupId
    let tempArr1 = selectedProcessId
    let rowData = selectedProcessAndGroup && selectedProcessAndGroup.map((item) => {
      if (item.GroupName) {
        tempArr.push({ MachineId: item.MachineId, GroupName: item.GroupName })
      } else {
        tempArr1.push({ MachineRateId: item.MachineRateId, ProcessId: item.ProcessId })
      }

      let obj = item
      obj.GroupName = item.GroupName ? item.GroupName : ''

      obj.ProcessList = item.ProcessList ? item.ProcessList : []
      return obj
    })

    dispatch(setIdsOfProcess(tempArr1))
    dispatch(setIdsOfProcessGroup(tempArr))
    if (data) {
      props.closeDrawer('', rowData)
    }
  };

  useEffect(() => {
    if (groupMachineId === '') {
      setTableDataList(processDrawerList)
    } else {
      let filteredData = processDrawerList && processDrawerList.filter(item => item.MachineId === groupMachineId)
      setTableDataList(filteredData)
    }
  }, [processDrawerList])

  useEffect(() => {
    if (costData.VendorType === ZBC) {
      let data = {}

      if (Number(costData.TechnologyId) === Number(FORGING) || Number(costData.TechnologyId) === Number(DIE_CASTING) || Number(costData.TechnologyId) === Number(Ferrous_Casting)) {
        data = {
          PlantId: costData.PlantId,
          TechnologyId: String(`${costData.TechnologyId},14`),
          CostingId: costData.CostingId,
          EffectiveDate: CostingEffectiveDate,
        }
      } else {
        data = {
          PlantId: costData.PlantId,
          TechnologyId: String(costData.TechnologyId),
          CostingId: costData.CostingId,
          EffectiveDate: CostingEffectiveDate,
        }
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
      let data = {}
      if (Number(costData.TechnologyId) === Number(FORGING) || Number(costData.TechnologyId) === Number(DIE_CASTING) || Number(costData.TechnologyId) === Number(Ferrous_Casting)) {
        data = {
          VendorId: costData.VendorId,
          TechnologyId: String(`${costData.TechnologyId},14`),
          VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
          DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? costData.DestinationPlantId : EMPTY_GUID,
          CostingId: costData.CostingId,
          EffectiveDate: CostingEffectiveDate,
        }
      }
      else {
        data = {
          VendorId: costData.VendorId,
          TechnologyId: String(costData.TechnologyId),
          VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
          DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? costData.DestinationPlantId : EMPTY_GUID,
          CostingId: costData.CostingId,
          EffectiveDate: CostingEffectiveDate,
        }
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

  const onRowSelect = (event) => {

    let rowData = event.data
    let processData = selectedProcessAndGroup
    if (event.node.isSelected()) {
      processData.push(rowData)
    } else {
      processData = selectedProcessAndGroup && selectedProcessAndGroup.filter(el => el.MachineRateId !== rowData.MachineRateId && el.ProcessId !== rowData.ProcessId)
    }
    dispatch(setSelectedDataOfCheckBox(processData))

    var selectedRows = gridApi.getSelectedRows();

    // if (JSON.stringify(selectedRows) === JSON.stringify(props.Ids)) return false
    setSelectedRowData(selectedRows)
  }



  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedProcessAndGroup.length === 0) {
      Toaster.warning('Please select row.')
      return false;
    }
    toggleDrawer('', true)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {

    setSelectedRowData([])
    dispatch(setSelectedDataOfCheckBox([]))
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

  const findProcessId = (rowNode) => {
    let isContainProcess = _.find(selectedProcessId, function (obj) {
      if (obj.ProcessId === rowNode.ProcessId && obj.MachineRateId === rowNode.MachineRateId) {
        return true;
      } else {
        return false
      }
    });
    return isContainProcess
  }
  const isRowSelectable = rowNode => !findProcessId(rowNode.data)

  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);

  }
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab)
    }
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
              <Row>
                <Col className='px-3'>
                  {processGroup && groupMachineId === '' && <Nav tabs className="subtabs cr-subtabs-head process-wrapper">
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '1' })}
                        onClick={() => {
                          toggle('1')
                        }}>
                        Process
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: activeTab === '2' })}
                        onClick={() => {
                          toggleDrawer('', false)
                          toggle('2')
                        }}  >
                        Group Process
                      </NavLink>
                    </NavItem>

                  </Nav>}
                  <TabContent activeTab={activeTab}>
                    {activeTab === '1' && (
                      <TabPane tabId="1">
                        <Row className="mx-0">
                          <Col className="hidepage-size mt-2 px-0">

                            <div className={`ag-grid-wrapper min-height-auto mt-2 height-width-wrapper ${tableData && tableData?.length <= 0 ? "overlay-contain" : ""}`}>
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
                                  rowData={tableData}
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
                                  onRowSelected={onRowSelect}
                                  isRowSelectable={isRowSelectable}
                                >
                                  <AgGridColumn field="MachineRateId" hide={true}></AgGridColumn>
                                  <AgGridColumn cellClass="has-checkbox" field="ProcessName" headerName="Process Name"  ></AgGridColumn>
                                  <AgGridColumn field='Technologies' headerName='Technology'></AgGridColumn>
                                  <AgGridColumn field="MachineNumber" headerName="Machine No."></AgGridColumn>
                                  <AgGridColumn field="MachineName" headerName="Machine Name"></AgGridColumn>
                                  <AgGridColumn field="MachineTypeName" headerName="Machine Type"></AgGridColumn>
                                  <AgGridColumn field="Tonnage" headerName="Machine Tonnage"></AgGridColumn>
                                  <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
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
                      </TabPane>
                    )}
                    {activeTab === '2' && (
                      <TabPane tabId="2">
                        <GroupProcess />
                      </TabPane>
                    )}

                  </TabContent>
                </Col>
              </Row>


              <Row className="sf-btn-footer no-gutters justify-content-between mx-0">
                <div className="col-sm-12 text-left d-flex justify-content-end">
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