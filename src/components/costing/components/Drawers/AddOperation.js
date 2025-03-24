import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getOperationDrawerDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import NoContentFound from '../../../common/NoContentFound';
import { CBCTypeId, defaultPageSize, EMPTY_DATA, NCCTypeId, NFRTypeId, PFS1TypeId, PFS2TypeId, PFS3TypeId, VBCTypeId, WACTypeId, ZBCTypeId } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { EMPTY_GUID } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { checkForDecimalAndNull, getConfigurationKey, searchNocontentFilter } from '../../../../helper';
import { PaginationWrapper } from '../../../common/commonPagination';
import _ from 'lodash';
import { useLabels } from '../../../../helper/core';
import WarningMessage from '../../../common/WarningMessage';
const gridOptions = {};

function AddOperation(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  const dispatch = useDispatch()
  const costData = useContext(costingInfoContext)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const { selectedIdsOfOperationAndOtherOperation, selectedIdsOfOperation } = useSelector(state => state.costing)
  let selectedIds = [...selectedIdsOfOperation, ...selectedIdsOfOperationAndOtherOperation]

  const { technologyLabel } = useLabels();
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
    const data = {
      VendorId: costData.VendorId ? costData.VendorId : EMPTY_GUID,
      PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId
        || costData.CostingTypeId === PFS1TypeId || costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId || costData.CostingTypeId === WACTypeId) ? costData.PlantId : EMPTY_GUID,
      TechnologyId: costData?.TechnologyId,
      VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
      EffectiveDate: CostingEffectiveDate,
      CostingId: costData.CostingId,
      CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === PFS1TypeId ||
        Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : Number(costData.CostingTypeId === WACTypeId) ? ZBCTypeId : costData.CostingTypeId,
      CustomerId: costData.CustomerId
    }
    dispatch(getOperationDrawerDataList(data, (res) => {
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
    if ((selectedRowData?.length + 1) === gridApi?.getSelectedRows()?.length) {
      if (_.includes(selectedRowData, event.data) === true) {
        let arrayList = selectedRowData && selectedRowData.filter((item) => item.OperationId !== event.data.OperationId)
        setSelectedRowData(arrayList)
      } else {
        setSelectedRowData([...selectedRowData, event.data])
      }
    } else {
      setSelectedRowData(gridApi?.getSelectedRows())
    }
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
    const rowData = params?.valueFormatted ? params.valueFormatted : params?.data;
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return rowData?.IsValidExchangeRate === true ? thisIsFirstColumn : false;
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

  const rateFormat = (props) => {
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return rowData?.IsValidExchangeRate ? (cellValue ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : '-') : '-'
  }
  const currencyFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== undefined && cellValue !== null && cellValue !== '' && cellValue !== '-' ? cellValue : '-';
  }
  const frameworkComponents = {
    // totalValueRenderer: this.buttonFormatter,
    // effectiveDateRenderer: this.effectiveDateFormatter,
    // costingHeadRenderer: this.costingHeadFormatter,
    // netLandedFormat: netLandedFormat,
    // netLandedConversionFormat: netLandedConversionFormat,
    currencyFormatter: currencyFormatter,
    rateFormat: rateFormat,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  const isRowSelectable = rowNode => rowNode.data ? !selectedIds.includes(rowNode.data.OperationId) : false;

  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (tableData.length !== 0) {
        setNoData(searchNocontentFilter(value, noData))
      }
    }, 500);
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
                    <h3>{'Add Operation:'}</h3>
                  </div>
                  <div
                    onClick={cancel}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>


              <Row className="mx-0">
                <Col className="hidepage-size">
                  <div className={`ag-grid-wrapper min-height-auto height-width-wrapper ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                      <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                      <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                        <div className="refresh mr-0"></div>
                      </button>
                    </div>
                    <div className="d-flex justify-content-end">
                      <WarningMessage message={"Please add the exchange rate for the selected currency in the exchange rate master for the record where the net cost field is marked as '-'."} />
                    </div>
                    <div className="ag-theme-material p-relative">
                      {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found drawer" />}
                      <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        domLayout='autoHeight'
                        // columnDefs={c}
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
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        isRowSelectable={isRowSelectable}
                        onFilterModified={onFloatingFilterChanged}
                        onRowSelected={onRowSelect}
                      >
                        <AgGridColumn field="OperationId" hide={true}></AgGridColumn>
                        <AgGridColumn cellClass="has-checkbox" field="EntryType" headerName="Operation Type"></AgGridColumn>
                        <AgGridColumn  field="OperationName" headerName="Operation Name"></AgGridColumn>
                        <AgGridColumn field="OperationCode" headerName="Operation Code"></AgGridColumn>
                        <AgGridColumn field="Technology" headerName={technologyLabel}></AgGridColumn>
                        <AgGridColumn field="Currency"  headerName="Master Currency" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="CostingCurrency" headerName="Costing Currency" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="CurrencyExchangeRate" headerName="Exchange Rate" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                        <AgGridColumn field="Rate" cellRenderer={'rateFormat'}></AgGridColumn>
                        {initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure && <AgGridColumn field="LabourRate" headerName='Labour Rate' ></AgGridColumn>}


                      </AgGridReact>
                      {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                <div className="col-sm-12 text-left px-3 d-flex bluefooter-butn justify-content-end">
                  <button
                    type={'button'}
                    className="reset mr5 cancel-btn"
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

export default React.memo(AddOperation);