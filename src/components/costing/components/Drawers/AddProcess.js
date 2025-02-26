import React, { useState, useEffect, useContext, } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { Container, Row, Col, NavItem, TabContent, TabPane, Nav, NavLink } from 'reactstrap';
import { getProcessDrawerDataList, setIdsOfProcess, setIdsOfProcessGroup, setSelectedDataOfCheckBox } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import NoContentFound from '../../../common/NoContentFound';
import { CBCTypeId, defaultPageSize, EMPTY_DATA, NCC, NCCTypeId, VBC, VBCTypeId, COMBINED_PROCESS_NAME, ZBCTypeId, NFRTypeId, WACTypeId, PFS1TypeId, PFS2TypeId, PFS3TypeId } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import classnames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import { EMPTY_GUID } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { FORGING, Ferrous_Casting, DIE_CASTING, MACHINING } from '../../../../config/masterData'
import GroupProcess from './GroupProcess';
import _ from 'lodash'
import { getConfigurationKey, searchNocontentFilter } from '../../../../helper';
import { PaginationWrapper } from '../../../common/commonPagination';
import { hyphenFormatter } from '../../../masters/masterUtil';
import { ViewCostingContext } from '../CostingDetails';
import { useLabels } from '../../../../helper/core';

const gridOptions = {};

function AddProcess(props) {
  const { groupMachineId } = props
  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [isTabSwitch, setIsTabSwitch] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  // const [processGroup, setProcessGroup] = useState(true)
  // const processGroup = getConfigurationKey().IsMachineProcessGroup // UNCOMMENT IT AFTER KEY IS ADDED IN WEB CONFIG N BACKEND AND REMOVE BELOW LINE
  const processGroup = getConfigurationKey().IsMachineProcessGroup
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('1');

  const costData = useContext(costingInfoContext)
  const { processDrawerList, CostingEffectiveDate, selectedProcessAndGroup, selectedProcessId, selectedProcessGroupId } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)
  const CostingViewMode = useContext(ViewCostingContext);
  const { technologyLabel } = useLabels();
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
      } else if (tempArr?.IsChild) {      //  THIS CONDITION STOP MULTIPLE TIMES ADDING SAME CHILD AS PARENT AT TIME OF OPENING-CLOSING ACCORDION
        return false
      } else {
        tempArr1.push({ MachineRateId: item.MachineRateId, ProcessId: item.ProcessId, IsChild: true })        // IsChild KEY ADDED TO IDENTIFY CHILD-PARENT OBJECT
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
      const filteredData = processDrawerList && processDrawerList.filter(item => item);
      setTableDataList(filteredData)
    } else {
      let filteredData = processDrawerList && processDrawerList.filter(item => item.MachineId === groupMachineId)
      setTableDataList(filteredData)
    }
  }, [processDrawerList])

  useEffect(() => {
    let data = {}
    if (Number(costData?.TechnologyId) === Number(FORGING) || Number(costData?.TechnologyId) === Number(DIE_CASTING) || Number(costData?.TechnologyId) === Number(Ferrous_Casting)) {
      data = {
        VendorId: costData.VendorId ? costData.VendorId : EMPTY_GUID,

        PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId || costData.CostingTypeId === PFS1TypeId ||
          costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId || costData.CostingTypeId === WACTypeId) ? costData.PlantId : EMPTY_GUID,

        TechnologyId: String(`${costData?.TechnologyId},${MACHINING}`),
        VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,

        CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === VBCTypeId || Number(costData.CostingTypeId) === PFS1TypeId
          || Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,

        CustomerId: costData.CustomerId
      }
    }
    else {



      data = {
        VendorId: costData.VendorId ? costData.VendorId : EMPTY_GUID,

        PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId || costData.CostingTypeId === PFS1TypeId
          || costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId || costData.CostingTypeId === WACTypeId) ? costData.PlantId : EMPTY_GUID,

        TechnologyId: String(costData?.TechnologyId),
        VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,

        CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === VBCTypeId || Number(costData.CostingTypeId) === PFS1TypeId
          || Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,

        CustomerId: costData.CustomerId
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
  }, []);

  const onRowSelect = (event) => {
    let Execute = true
    let rowData = event.data

    if (isTabSwitch) {
      selectedProcessAndGroup && selectedProcessAndGroup.map((item) => {
        if (item.ProcessId === rowData.ProcessId && item.MachineRateId === rowData.MachineRateId) {
          Execute = false
        }
        return null
      })
    }

    let processData = selectedProcessAndGroup
    if (event.node.isSelected()) {

      if (Execute) {
        processData.push(rowData)
      }

    } else {
      processData = selectedProcessAndGroup && selectedProcessAndGroup.filter(el => el.MachineRateId !== rowData.MachineRateId && el.ProcessId !== rowData.ProcessId)
    }

    var selectedRows = gridApi.getSelectedRows();
    if (selectedRows?.length === 0) {
      dispatch(setSelectedDataOfCheckBox([]))
    } else {
      dispatch(setSelectedDataOfCheckBox(processData))
    }
    setSelectedRowData(selectedRows)
  }
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (tableData.length !== 0) {
        setNoData(searchNocontentFilter(value, noData))
      }
    }, 500);
  }
  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedProcessAndGroup?.length === 0) {
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
    const allProcessSelected = processDrawerList?.every(process => props?.Ids?.includes(process.ProcessId));
    if (allProcessSelected) {
      return false;
    }
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
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
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

    if (selectedRowData?.length > 0) {
      selectedRowData.map((item) => {
        if (item.ProcessId === props.node.data.ProcessId && item.MachineRateId === props.node.data.MachineRateId) {
          props.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }

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
    checkBoxRenderer: checkBoxRenderer,
    hyphenFormatter: hyphenFormatter
  };

  useEffect(() => {

    var selectedRows = gridApi?.getSelectedRows();
    if (selectedRowData === undefined) {
      setSelectedRowData([...selectedRows])
    }

  }, [selectedRowData])

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
  const isRowSelectable = rowNode => initialConfiguration?.IsAllowSingleProcessMultipleTime ? true : !findProcessId(rowNode.data)

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
                    <h3>{'Add Process:'}</h3>
                  </div>
                  <div
                    onClick={cancel}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col className="hidepage-size">
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
                          setIsTabSwitch(true)
                          // toggleDrawer('', false)
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
                          <Col className="pt-2 px-0">
                            <div className={`ag-grid-wrapper min-height-auto mt-2 height-width-wrapper ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                              <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                  <div className="refresh mr-0"></div>
                                </button>
                              </div>
                              <div className="ag-theme-material p-relative">
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found drawer" />}
                                <AgGridReact
                                  style={{ height: '100%', width: '100%' }}
                                  defaultColDef={defaultColDef}
                                  floatingFilter={true}
                                  domLayout='autoHeight'
                                  rowData={tableData}
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
                                  suppressRowClickSelection={true}
                                  onFilterModified={onFloatingFilterChanged}
                                  rowSelection={'multiple'}
                                  frameworkComponents={frameworkComponents}
                                  onRowSelected={onRowSelect}
                                  isRowSelectable={isRowSelectable}
                                >
                                  <AgGridColumn field="MachineRateId" hide={true}></AgGridColumn>
                                  <AgGridColumn cellClass="has-checkbox" field="ProcessName" headerName="Process Name" cellRenderer={checkBoxRenderer}  ></AgGridColumn>
                                  <AgGridColumn field='Technologies' headerName={technologyLabel}></AgGridColumn>
                                  <AgGridColumn field="MachineNumber" headerName="Machine No."></AgGridColumn>
                                  <AgGridColumn field="MachineName" headerName="Machine Name" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                  <AgGridColumn field="MachineTypeName" headerName="Machine Type"></AgGridColumn>
                                  <AgGridColumn field="Tonnage" headerName="Machine Tonnage" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                  <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                  <AgGridColumn field="MachineRate" headerName={'Machine Rate'}></AgGridColumn>

                                </AgGridReact>
                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
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


              <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                <div className="col-sm-12 text-left d-flex justify-content-end bluefooter-butn">
                  <button
                    type={'button'}
                    className="reset cancel-btn mr5"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'button'}
                    className="submit-button save-btn"
                    onClick={addRow}
                    disabled={CostingViewMode}
                  >
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