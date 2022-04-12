import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { useForm } from 'react-hook-form'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getRMDrawerDataList, getRMDrawerVBCDataList } from '../../actions/Costing';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { getGradeSelectList, getRawMaterialFilterSelectList } from '../../../masters/actions/Material';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper';
import { isMultipleRMAllow } from '../../../../config/masterData'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
const gridOptions = {};

function AddRM(props) {

  const { IsApplyMasterBatch, Ids } = props;
  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  const { rmDrawerList, CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)

  useEffect(() => {
    setSelectedRowData([])
    dispatch(getGradeSelectList(res => { }))
    dispatch(getRawMaterialFilterSelectList(() => { }))
    getDataList()
  }, []);

  const onRowSelect = (row, isSelected, e) => {

    //BELOW CONDITION, WHEN PLASTIC TECHNOLOGY SELECTED, MULTIPLE RM'S CAN BE ADDED
    if (isMultipleRMAllow(costData.ETechnologyType)) {
      var selectedRows = gridApi.getSelectedRows();
      if (JSON.stringify(selectedRows) === JSON.stringify(Ids)) return false
      setSelectedRowData(selectedRows)
      // if (isSelected) {
      //   let tempArr = [...selectedRowData, row]
      //   setSelectedRowData(tempArr)
      // } else {
      //   const RawMaterialId = row.RawMaterialId;
      //   let tempArr = selectedRowData && selectedRowData.filter(el => el.RawMaterialId !== RawMaterialId)
      //   setSelectedRowData(tempArr)
      // }
    } else {
      if (JSON.stringify(selectedRows) === JSON.stringify(Ids)) return false
      setSelectedRowData(selectedRows[0])
      // if (isSelected) {
      //   setSelectedRowData(row)
      // } else {
      //   setSelectedRowData({})
      // }
    }
  }


  const netLandedFormat = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    return cellValue !== null ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(rowData.NetLandedCost, getConfigurationKey().NoOfDecimalForPrice)
  }

  const netLandedConversionFormat = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    return rowData.Currency !== '-' ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : '-'
  }

  const currencyFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== '-' ? cellValue : 'INR'
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
    if (Object.keys(selectedRowData).length === 0) {
      Toaster.warning('Please select row.')
      return false;
    }
    toggleDrawer('')
  }

  const getDataList = (materialId = null, gradeId = null) => {
    if (costData.VendorType === ZBC) {

      const data = {
        TechnologyId: costData.TechnologyId,
        PlantId: costData.PlantId,
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,
        material_id: materialId,
        grade_id: gradeId,
      }
      dispatch(getRMDrawerDataList(data, (res) => {
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
        material_id: materialId,
        grade_id: gradeId,
      }
      dispatch(getRMDrawerVBCDataList(data, (res) => {
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

  }


  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', selectedRowData)
  };

  const onSubmit = data => { }

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    headerCheckboxSelection: isMultipleRMAllow(costData.ETechnologyType) ? isFirstColumn : false,
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
  };

  const isRowSelectable = rowNode => rowNode.data ? !Ids.includes(rowNode.data.RawMaterialId) : false;

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
                    <h3>{'ADD RM: '}</h3>
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
                  <div className={`ag-grid-wrapper height-width-wrapper  min-height-auto ${rmDrawerList && rmDrawerList?.length <= 0 ? "overlay-contain" : ""} `}>
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
                        floatingFilter={true}
                        domLayout='autoHeight'
                        // columnDefs={c}
                        rowData={rmDrawerList}
                        pagination={true}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                          title: EMPTY_DATA,
                          imagClass: "imagClass"
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={isMultipleRMAllow(costData.ETechnologyType) && !IsApplyMasterBatch ? 'multiple' : 'single'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                        isRowSelectable={isRowSelectable}
                      >
                        <AgGridColumn field="RawMaterialId" hide={true}></AgGridColumn>
                        <AgGridColumn cellClass="has-checkbox" field="EntryType" headerName="RM Type"  ></AgGridColumn>
                        <AgGridColumn field="RawMaterial" headerName="RM Name"></AgGridColumn>
                        <AgGridColumn field="RMGrade" headerName="RM Grade"></AgGridColumn>
                        <AgGridColumn field="RMSpec" headerName="RM Spec"></AgGridColumn>
                        <AgGridColumn field="Category" ></AgGridColumn>
                        {costData && costData.VendorType === ZBC && <AgGridColumn dataAlign="center" field="VendorName" headerName="Vendor" ></AgGridColumn>}
                        {costData && costData.VendorType === ZBC && <AgGridColumn dataAlign="center" field="VendorLocation" headerName="Vendor Location" ></AgGridColumn>}
                        <AgGridColumn field="Currency" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="UOM"></AgGridColumn>
                        <AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate/UOM" cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="ScrapRate" headerName='Scrap Rate/UOM' cellRenderer={'currencyFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetLandedCostConversion" headerName={'Net Cost INR/UOM'} cellRenderer={'netLandedFormat'}></AgGridColumn>
                        <AgGridColumn field="NetLandedCost" headerName={'Net Cost Currency/UOM'} cellRenderer={'netLandedConversionFormat'}></AgGridColumn>

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

            </div>
          </Container>
        </div>
      </Drawer>
    </div>
  );
}

export default React.memo(AddRM);