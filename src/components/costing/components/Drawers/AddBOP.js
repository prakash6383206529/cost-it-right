import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getBOPDrawerDataList, getBOPDrawerVBCDataList } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { getBOPCategorySelectList } from '../../../masters/actions/BoughtOutParts';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper';
import LoaderCustom from '../../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
const gridOptions = {};

function AddBOP(props) {

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(props.Ids);
  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const { initialConfiguration } = useSelector(state => state.auth)
  const { bopCategorySelectList } = useSelector(state => state.boughtOutparts)
  const { bopDrawerList } = useSelector(state => state.costing)


  const { register, handleSubmit, control, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

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
    dispatch(getBOPCategorySelectList(res => { }))
    getDataList()

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
    noDataText: (bopDrawerList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
    paginationShowsTotal: renderPaginationShowsTotal(),
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,

  };

  const onRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      let tempArr = [...selectedRowData, row]
      setSelectedRowData(tempArr)
    } else {
      const BoughtOutPartId = row.BoughtOutPartId;
      let tempArr = selectedRowData && selectedRowData.filter(el => el.BoughtOutPartId !== BoughtOutPartId)
      setSelectedRowData(tempArr)
    }

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

  const renderNetLandedRate = () => {
    return <>Net Cost<br /> INR/UOM</>
  }

  const renderNetLandedConversionRate = () => {
    return <>Net Cost<br />USD/UOM</>
  }

  const netLandedFormat = (cell, row, enumObject, rowIndex) => {
    return cell !== null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(row.NetLandedCost, getConfigurationKey().NoOfDecimalForPrice)
  }

  const netLandedConversionFormat = (cell, row, enumObject, rowIndex) => {
    return row.Currency !== '-' ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
  }

  const currencyFormatter = (cell, row, enumObject, rowIndex) => {
    return cell !== '-' ? cell : 'INR'
  }

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


  const getDataList = (categoryId = 0) => {
    if (costData.VendorType === ZBC) {

      const data = {
        PlantId: costData.PlantId,
        CostingId: costData.CostingId,
        EffectiveDate: CostingEffectiveDate,
        categoryId: categoryId
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

    } else {

      const data = {
        VendorId: costData.VendorId,
        VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? costData.DestinationPlantId : EMPTY_GUID,
        EffectiveDate: CostingEffectiveDate,
        CostingId: costData.CostingId,
        categoryId: categoryId
      }
      dispatch(getBOPDrawerVBCDataList(data, (res) => {
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
    const categoryId = getValues('Category') ? getValues('Category').value : null;
    getDataList(categoryId)
  }

  const renderListing = (label) => {
    const temp = [];
    if (label === 'category') {
      bopCategorySelectList && bopCategorySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
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

  /**
 * @method resetFilter
 * @description Reset user filter
 */
  const resetFilter = () => {
    setValue('Category', '')
    dispatch(getBOPCategorySelectList(res => { }))
    getDataList()
  }

  const isFirstColumn = (params) => {
    console.log('params: ', params);
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    console.log('displayedColumns: ', displayedColumns);
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    console.log('thisIsFirstColumn: ', thisIsFirstColumn);
    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };


  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container className="add-bop-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD BOP'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            < form onSubmit={handleSubmit(onSubmit)} noValidate >

              <div className="filter-row">
                <Col md="12" lg="11" className="filter-block zindex-12 pt-2 mb-1">
                  <div className="d-inline-flex justify-content-start align-items-top w100 rm-domestic-filter">
                    <div className="flex-fills mb-0">
                      <h5 className="left-border">{`Filter By:`}</h5>
                    </div>

                    <div className="flex-fills hide-label mb-0">
                      <SearchableSelectHookForm
                        label={''}
                        name={'Category'}
                        placeholder={'Category'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        options={renderListing("category")}
                        customClassName="mn-height-auto mb-0"
                        handleChange={() => { }}
                      />
                    </div>


                    <div className="flex-fills mb-0">
                      <button type="button" onClick={resetFilter} className="reset mr10" > {"Reset"}</button>
                      <button type="button" onClick={filterList} className="user-btn" > {"Apply"} </button>
                    </div>
                  </div>
                </Col>
              </div>

            </form >
            <Row className="mx-0">
              <Col className="hidepage-size">
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
                  <TableHeaderColumn dataField="BoughtOutPartId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="EntryType"  >{'BOP Type'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BoughtOutPartNumber" >{'BOP Part No.'}</TableHeaderColumn>
                  <TableHeaderColumn width={70} columnTitle={true} dataAlign="center" dataField="BoughtOutPartName" >{'BOP Part Name'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BoughtOutPartCategory" >{'BOP Category'}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Specification" searchable={false} >{'Specification'}</TableHeaderColumn>
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="Vendor" >Vendor</TableHeaderColumn>}
                  <TableHeaderColumn width={80} columnTitle={true} dataAlign="center" dataField="Currency" dataFormat={currencyFormatter} searchable={false} >Currency</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCostConversion" dataFormat={netLandedFormat} searchable={false} >{renderNetLandedRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCost" dataFormat={netLandedConversionFormat} searchable={false} >{renderNetLandedConversionRate()}</TableHeaderColumn>
                </BootstrapTable> */}
                <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                  <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onFilterTextBoxChanged(e)} />
                  </div>
                  <div
                    className="ag-theme-material"
                    style={{ height: '100%', width: '100%' }}
                  >
                    <AgGridReact
                      style={{ height: '100%', width: '100%' }}
                      defaultColDef={defaultColDef}
                      // columnDefs={c}
                      rowData={tableData}
                      pagination={true}
                      paginationPageSize={10}
                      // onGridReady={onGridReady}
                      gridOptions={gridOptions}
                      loadingOverlayComponent={'customLoadingOverlay'}
                      noRowsOverlayComponent={'customNoRowsOverlay'}
                      noRowsOverlayComponentParams={{
                        title: CONSTANT.EMPTY_DATA,
                      }}
                      suppressRowClickSelection={true}
                      rowSelection={'multiple'}
                    // frameworkComponents={frameworkComponents}
                    >
                      <AgGridColumn field="BoughtOutPartId" hide={true}></AgGridColumn>
                      <AgGridColumn field="EntryType" ></AgGridColumn>
                      <AgGridColumn field="BoughtOutPartNumber"></AgGridColumn>
                      <AgGridColumn field="BoughtOutPartName"></AgGridColumn>
                      <AgGridColumn field="BoughtOutPartCategory"></AgGridColumn>
                      <AgGridColumn field="Specification"></AgGridColumn>
                      {costData && costData.VendorType === ZBC && <AgGridColumn field="Vendor"></AgGridColumn>}
                      <AgGridColumn field="Currency"></AgGridColumn>
                      <AgGridColumn field="VendorName"></AgGridColumn>
                      <AgGridColumn field="UOM"></AgGridColumn>
                      <AgGridColumn field="NetLandedCost"></AgGridColumn>
                      <AgGridColumn field="NetLandedCostConversion" ></AgGridColumn>

                    </AgGridReact>
                    <div className="paging-container d-inline-block float-right">
                      <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
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
                  <div className={'cancel-icon'}></div>
                  {'SELECT'}
                </button>

                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                                      <div className={'save-icon'}></div> {'Cancel'}
                </button>
              </div>
            </Row>

          </div>
        </Container>
      </Drawer>
    </div >
  );
}

export default React.memo(AddBOP);