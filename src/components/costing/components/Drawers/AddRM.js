import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { useForm, Controller } from 'react-hook-form'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getRMDrawerDataList, getRMDrawerVBCDataList } from '../../actions/Costing';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../config/constants';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { toastr } from 'react-redux-toastr';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { EMPTY_GUID, PLASTIC, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { getGradeFilterByRawMaterialSelectList, getGradeSelectList, getRawMaterialFilterSelectList, getRawMaterialNameChild } from '../../../masters/actions/Material';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, getConfigurationKey, isMultipleRMAllow } from '../../../../helper';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
const gridOptions = {};

function AddRM(props) {

  const { IsApplyMasterBatch, Ids } = props;
  const { register, handleSubmit, control, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(Ids);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  const { rmDrawerList, CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)
  const { filterRMSelectList } = useSelector(state => state.material)

  useEffect(() => {
    setSelectedRowData([])
    dispatch(getGradeSelectList(res => { }))
    dispatch(getRawMaterialFilterSelectList(() => { }))
    getDataList()
  }, []);

  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }
  /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
  const handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      dispatch(getGradeFilterByRawMaterialSelectList(newValue.value, res => { }))

    } else {
      dispatch(getGradeSelectList(res => { }))
    }
  }
  const options = {
    clearSearch: true,
    noDataText: (rmDrawerList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
    paginationShowsTotal: renderPaginationShowsTotal,
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,

  };

  // const onRowSelect = (row, isSelected, e) => {
  //   setSelectedRowData(row)
  // }

  // const onSelectAll = (isSelected, rows) => { }

  const onRowSelect = (row, isSelected, e) => {

    //BELOW CONDITION, WHEN PLASTIC TECHNOLOGY SELECTED, MULTIPLE RM'S CAN BE ADDED
    if (isMultipleRMAllow(costData.TechnologyName)) {
      var selectedRows = gridApi.getSelectedRows();
      if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
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
      var selectedRows = gridApi.getSelectedRows();
      if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
      setSelectedRowData(selectedRows[0])
      // if (isSelected) {
      //   setSelectedRowData(row)
      // } else {
      //   setSelectedRowData({})
      // }
    }
  }

  const onSelectAll = (isSelected, rows) => {
    if (isMultipleRMAllow(costData.TechnologyName)) {
      if (isSelected) {
        setSelectedRowData(rows)
      } else {
        setSelectedRowData([])
      }
    } else {

    }
  }

  const selectRowProp = {
    mode: isMultipleRMAllow(costData.TechnologyName) ? 'checkbox' : 'radio',
    //onSelect: onRowSelect,
    //mode: 'checkbox',
    clickToSelect: true,
    unselectable: selectedIds,
    onSelect: onRowSelect,
    onSelectAll: onSelectAll
  };

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
      toastr.warning('Please select row.')
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

  /**
  * @method filterList
  * @description Filter user listing on the basis of role and department
  */
  const filterList = () => {
    const RMid = getValues('RawMaterialId') ? getValues('RawMaterialId').value : null;
    const RMGradeid = getValues('RawMaterialGradeId') ? getValues('RawMaterialGradeId').value : null;
    getDataList(RMid, RMGradeid)
  }

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  const renderListing = (label) => {


    const temp = [];

    if (label === 'material') {
      filterRMSelectList && filterRMSelectList.RawMaterials && filterRMSelectList.RawMaterials.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'grade') {
      filterRMSelectList && filterRMSelectList.Grades && filterRMSelectList.Grades.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

  }

  /**
  * @method resetFilter
  * @description Reset user filter
  */
  const resetFilter = () => {
    setValue('RawMaterialId', '')
    setValue('RawMaterialGradeId', '')
    dispatch(getRawMaterialFilterSelectList(res => { }))
    dispatch(getRawMaterialNameChild(() => { }))
    getDataList()
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
    headerCheckboxSelection: isMultipleRMAllow(costData.TechnologyName) ? isFirstColumn : false,
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

  const isRowSelectable = rowNode => rowNode.data ? !selectedIds.includes(rowNode.data.RawMaterialId) : false;

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
                    <h3>{'ADD RM'}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
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
                          title: CONSTANT.EMPTY_DATA,
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={isMultipleRMAllow(costData.TechnologyName) && !IsApplyMasterBatch ? 'multiple' : 'single'}
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
                <div className="col-sm-12 text-left bluefooter-butn">
                  <button
                    type={'button'}
                    className="submit-button mr5 save-btn"
                    onClick={addRow} >
                    <div className={'save-icon'}></div>
                    {'SELECT'}
                  </button>

                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
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