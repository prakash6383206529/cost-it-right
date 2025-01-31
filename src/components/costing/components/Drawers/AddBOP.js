import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getBOPDrawerDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { CBCTypeId, defaultPageSize, EMPTY_GUID, NCCTypeId, NCC, NFRTypeId, PFS1TypeId, PFS2TypeId, PFS3TypeId, VBCTypeId, ZBC, VBC, ZBCTypeId } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { checkForDecimalAndNull, getConfigurationKey, searchNocontentFilter, showBopLabel } from '../../../../helper';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../../common/commonPagination';
import _ from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
const gridOptions = {};

function AddBOP(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)
  const { bopDrawerList } = useSelector(state => state.costing)

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
    getDataList()

  }, []);

  const onRowSelect = (event) => {
    if ((selectedRowData?.length + 1) === gridApi?.getSelectedRows()?.length) {
      if ((gridApi && gridApi?.getSelectedRows())?.length === 0) {
        setSelectedRowData([])
      } else {
        if (_.includes(selectedRowData, event.data) === true) {
          let arrayList = selectedRowData && selectedRowData.filter((item) => item.BoughtOutPartId !== event.data.BoughtOutPartId)
          setSelectedRowData(arrayList)
        } else {
          setSelectedRowData([...selectedRowData, event.data])
        }
      }
    } else {
      setSelectedRowData(gridApi?.getSelectedRows())
    }
  }

  const netLandedFormat = (props) => {
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    return checkForDecimalAndNull(rowData.NetLandedCostCombine, getConfigurationKey().NoOfDecimalForPrice)
  }

  const netLandedConversionFormat = (props) => {
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    return rowData.NetLandedCostCurrency !== '-' ? checkForDecimalAndNull(rowData.NetLandedCostCurrency, getConfigurationKey().NoOfDecimalForPrice) : '-'
  }

  const currencyFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== '-' ? cellValue : reactLocalStorage.getObject("baseCurrency")
  }

  const specificationFormat = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? cellValue : '-'
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO RM COST GRID
  */
  const addRow = () => {
    if (selectedRowData?.length === 0) {
      Toaster.warning('Please select row.')
      return false;
    }
    toggleDrawer('')
  }

  const getDataList = (categoryId = 0) => {
    const data = {
      VendorId: costData.VendorId ? costData.VendorId : EMPTY_GUID,

      PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId || costData.CostingTypeId === PFS1TypeId
        || costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId) ? costData.PlantId : EMPTY_GUID,

      VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
      EffectiveDate: CostingEffectiveDate,
      CostingId: costData.CostingId,
      categoryId: categoryId,

      CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === VBCTypeId || Number(costData.CostingTypeId) === PFS1TypeId
        || Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : costData.CostingTypeId,

      CustomerId: costData.CustomerId
    }
    dispatch(getBOPDrawerDataList(data, (res) => {
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

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }

  const isFirstColumn = (params) => {
    const allBopSelected = bopDrawerList?.every(bop => props?.Ids?.includes(bop.BoughtOutPartId));
    if (allBopSelected) {
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
  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (bopDrawerList.length !== 0) {
        setNoData(searchNocontentFilter(value, noData))
      }
    }, 500);
  }
  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }

  const frameworkComponents = {
    // totalValueRenderer: this.buttonFormatter,
    // effectiveDateRenderer: this.effectiveDateFormatter,
    // costingHeadRenderer: this.costingHeadFormatter,
    netLandedFormat: netLandedFormat,
    netLandedConversionFormat: netLandedConversionFormat,
    currencyFormatter: currencyFormatter,
    specificationFormat: specificationFormat,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
  };

  useEffect(() => {

  }, [tableData])

  const isRowSelectable = rowNode => rowNode.data ? !props.Ids.includes(rowNode.data.BoughtOutPartId) : false;


  const resetState = () => {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    < div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        < div className={`ag-grid-react`}>
          <Container className="add-bop-drawer">
            <div className={'drawer-wrapper drawer-1500px'}>

              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`Add ${showBopLabel()}:`}</h3>
                  </div >
                  <div
                    onClick={cancel}
                    className={'close-button right'}>
                  </div>
                </Col >
              </Row >

              <Row className="mx-0">
                <Col className="hidepage-size">
                  <div className={`ag-grid-wrapper min-height-auto height-width-wrapper ${(bopDrawerList && bopDrawerList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
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
                        // columnDefs={c}
                        rowData={bopDrawerList}
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
                        onRowSelected={onRowSelect}
                        isRowSelectable={isRowSelectable}
                        onFilterModified={onFloatingFilterChanged}
                      >
                        <AgGridColumn field="BoughtOutPartId" hide={true}></AgGridColumn>
                        <AgGridColumn cellClass="has-checkbox" field="EntryType" headerName={`${showBopLabel()} Type`} ></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartNumber" headerName={`${showBopLabel()} Part No.`}></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>
                        <AgGridColumn field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                        <AgGridColumn field="Specification" cellRenderer={'specificationFormat'}></AgGridColumn>
                        {costData && costData.VendorType === ZBC && <AgGridColumn field="Vendor"></AgGridColumn>}
                        <AgGridColumn field="Currency" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field='UOM' ></AgGridColumn>
                        <AgGridColumn field="NetLandedCostCombine" headerName={`Net Cost ${reactLocalStorage.getObject("baseCurrency")}/UOM`} cellRenderer={'netLandedFormat'}></AgGridColumn>
                        <AgGridColumn field="NetLandedCostCurrency" headerName={'Net Cost Currency/UOM'} cellRenderer={'netLandedConversionFormat'}></AgGridColumn>

                      </AgGridReact >
                      {< PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div >
                  </div >
                </Col >
              </Row >

              <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
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
                    <div className={"save-icon"}></div>
                    {'SELECT'}
                  </button>
                </div>
              </Row>

            </div >
          </Container >
        </div >
      </Drawer >
    </div >
  );
}

export default React.memo(AddBOP);