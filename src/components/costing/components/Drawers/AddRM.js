import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { useForm } from 'react-hook-form'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getRMDrawerDataList } from '../../actions/Costing';
import NoContentFound from '../../../common/NoContentFound';
import { CBCTypeId, defaultPageSize, EMPTY_DATA, NCC, VBC, NCCTypeId, NFRTypeId, PFS1TypeId, PFS2TypeId, PFS3TypeId, VBCTypeId, ZBCTypeId } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { checkForDecimalAndNull, getConfigurationKey, searchNocontentFilter } from '../../../../helper';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../../common/commonPagination';
import _ from 'lodash';
import { IsNFR } from '../CostingDetails';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useLabels } from '../../../../helper/core';
const gridOptions = {};

function AddRM(props) {
  const { vendorLabel } = useLabels()
  const { IsApplyMasterBatch, Ids, rmNameList, item } = props;

  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [noData, setNoData] = useState(false);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  const { rmDrawerList, CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)
  const isNFR = useContext(IsNFR);

  useEffect(() => {
    setSelectedRowData([])
    getDataList()
  }, []);

  const onRowSelect = (event) => {
    var selectedRows = gridApi && gridApi?.getSelectedRows();


    //BELOW CONDITION, WHEN PLASTIC TECHNOLOGY SELECTED, MULTIPLE RM'S CAN BE ADDED
    if (item?.IsMultipleRMApplied) {
      if ((selectedRowData?.length + 1) === gridApi?.getSelectedRows()?.length) {
        if (selectedRows?.length === 0) {
          setSelectedRowData([])
        } else {
          if (_.includes(selectedRowData, event.data) === true) {
            let arrayList = selectedRowData && selectedRowData.filter((item) => item.RawMaterialId !== event.data.RawMaterialId)
            setSelectedRowData(arrayList)
          } else {
            setSelectedRowData([...selectedRowData, event.data])
          }
        }
      } else {
        setSelectedRowData(gridApi?.getSelectedRows())
      }
    } else {
      if (selectedRows?.length === 0) {
        setSelectedRowData([])
      } else {
        setSelectedRowData(selectedRows[0])
      }
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

  const priceFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : '-'
  }

  /**
  * @method sourceVendorFormatter
  */
  const sourceVendorFormatter = (props) => {
    const cellValue = props?.value;
    return cellValue ? cellValue : '-';
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
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

  const getDataList = (materialId = null, gradeId = null) => {
    const data = {
      VendorId: costData.VendorId ? costData.VendorId : EMPTY_GUID,

      PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId || costData.CostingTypeId === PFS1TypeId
        || costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId) ? costData.PlantId : EMPTY_GUID,

      TechnologyId: costData?.TechnologyId,
      VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
      EffectiveDate: CostingEffectiveDate,
      CostingId: costData.CostingId,
      material_id: materialId,
      grade_id: gradeId,

      CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === VBCTypeId || Number(costData.CostingTypeId) === PFS1TypeId
        || Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : costData.CostingTypeId,

      CustomerId: costData.CustomerId,
      PartId: costData?.PartId,
      IsRFQ: false,
      QuotationPartId: null
    }
    dispatch(getRMDrawerDataList(data, isNFR, rmNameList, (res) => {
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



  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', selectedRowData)
  };

  const onSubmit = data => { }

  const isFirstColumn = (params) => {
    const allRMsSelected = rmDrawerList?.every(rm => Ids.includes(rm.RawMaterialId));
    if (allRMsSelected) {
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
    headerCheckboxSelection: item?.IsMultipleRMApplied ? isFirstColumn : false,
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
      if (rmDrawerList.length !== 0) {
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
    //  specificationFormat: specificationFormat,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    priceFormatter: priceFormatter,
    sourceVendorFormatter: sourceVendorFormatter
  };

  const isRowSelectable = (rowNode) => {


    return rowNode.data ? !Ids.includes(rowNode.data.RawMaterialId) : false;
  }

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
          <Container className="costing-rm-drawer">
            <div className={'drawer-wrapper drawer-1500px'}>

              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{'Add RM: '}</h3>
                  </div>
                  <div
                    onClick={cancel}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>

              < form onSubmit={handleSubmit(onSubmit)} noValidate >

                {/* <div className="filter-row">
                  <Col md="12" lg="11" className="filter-block zindex-12 pt-2 mb-1">
                    <div className="d-inline-flex justify-content-start align-items-top w100 rm-domestic-filter">
                      <div className="flex-fills mb-0">
                        <h5 className="left-border">{`Filter By:`}</h5>
                      </div>

                      <div className="flex-fills hide-label mb-0">
                        <SearchableSelectHookForm
                          label={''}
                          name={'RawMaterialId'}
                          placeholder={'Raw Material'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          options={renderListing("material")}
                          customClassName="mn-height-auto mb-0"
                          handleChange={handleRMChange} />
                      </div>

                      <div className="flex-fills hide-label mb-0">
                        <SearchableSelectHookForm
                          label={''}
                          name={'RawMaterialGradeId'}
                          placeholder={'RM Grade'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          options={renderListing("grade")}
                          customClassName="mn-height-auto mb-0"
                          handleChange={() => { }} />
                      </div>

                      <div className="flex-fills mb-0">
                        <button type="button" onClick={resetFilter} className="reset mr10" > {"Reset"} </button>
                        <button type="button" onClick={filterList} className="user-btn" > {"Apply"} </button>
                      </div>

                    </div>
                  </Col>
                </div> */}

              </form >

              <Row className="mx-0">
                <Col className="hidepage-size">
                  <div className={`ag-grid-wrapper height-width-wrapper  min-height-auto ${(rmDrawerList && rmDrawerList?.length <= 0) || noData ? "overlay-contain" : ""} `}>
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
                        rowData={rmDrawerList}
                        pagination={true}
                        paginationPageSize={defaultPageSize}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                          title: EMPTY_DATA,
                          imagClass: "imagClass"
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={item?.IsMultipleRMApplied && !IsApplyMasterBatch ? 'multiple' : 'single'}
                        frameworkComponents={frameworkComponents}
                        onRowSelected={onRowSelect}
                        isRowSelectable={isRowSelectable}
                        onFilterModified={onFloatingFilterChanged}
                      >
                        <AgGridColumn field="RawMaterialId" hide={true}></AgGridColumn>
                        <AgGridColumn cellClass="has-checkbox" field="EntryType" headerName="RM Type"  ></AgGridColumn>
                        <AgGridColumn field="RawMaterial" headerName="RM Name"></AgGridColumn>
                        <AgGridColumn field="RMGrade" headerName="Grade"></AgGridColumn>
                        <AgGridColumn field="RMSpec" headerName="Spec"></AgGridColumn>
                        <AgGridColumn field="Category" ></AgGridColumn>
                        {costData && costData.VendorType === ZBC && <AgGridColumn dataAlign="center" field="VendorName" headerName={vendorLabel} ></AgGridColumn>}
                        {costData && costData.VendorType === ZBC && <AgGridColumn dataAlign="center" field="VendorLocation" headerName={`${vendorLabel} Location`}></AgGridColumn>}
                        {initialConfiguration?.IsShowSourceVendorInRawMaterial && <AgGridColumn field="SourceVendorName" headerName={`Source ${vendorLabel} Name`} cellRenderer={'sourceVendorFormatter'}></AgGridColumn>}
                        <AgGridColumn field="Currency" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="UOM"></AgGridColumn>
                        <AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate/UOM" cellRenderer={'priceFormatter'}></AgGridColumn>
                        <AgGridColumn field="ScrapRate" headerName='Scrap Rate/UOM' cellRenderer={'priceFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetLandedCostCombine" headerName={'Net Cost INR/UOM'} cellRenderer={'netLandedFormat'}></AgGridColumn>
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
                    <div className={'save-icon'}></div>
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

export default React.memo(AddRM);