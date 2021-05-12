import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector, } from 'react-redux';
import { useForm, Controller } from 'react-hook-form'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { getRMDrawerDataList, getRMDrawerVBCDataList } from '../../actions/Costing';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { toastr } from 'react-redux-toastr';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { EMPTY_GUID, ZBC } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { getGradeFilterByRawMaterialSelectList, getGradeSelectList, getRawMaterialFilterSelectList, getRawMaterialNameChild } from '../../../masters/actions/Material';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper';

function AddRM(props) {

  const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const [tableData, setTableDataList] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext)

  const { rmDrawerList, CostingEffectiveDate } = useSelector(state => state.costing)
  console.log('rmDrawerList: ', rmDrawerList);
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
    paginationShowsTotal: renderPaginationShowsTotal(),
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,

  };

  const onRowSelect = (row, isSelected, e) => {
    setSelectedRowData(row)
  }

  const onSelectAll = (isSelected, rows) => { }

  const selectRowProp = {
    mode: 'radio',
    onSelect: onRowSelect,
  };

  const renderBasicRate = () => {
    return <>Basic Rate /<br />UOM </>
  }
  const renderRmType = () => {
    return <>RM <br />Type</>
  }
  const renderRmName = () => {
    return <>RM <br />Name</>
  }
  const renderRmGrade = () => {
    return <>RM <br />Grade</>
  }
  const renderRmSpec = () => {
    return <>RM <br />Spec</>
  }
  const renderVendorLocation = () => {
    return <>Vendor<br /> Location</>
  }

  const renderScrapRate = () => {
    return <>Scrap Rate /<br />UOM </>
  }

  const renderNetLandedRate = () => {
    return <>Net Cost<br />INR/UOM</>
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
    if (selectedRowData.length === 0) {
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
        VendorPlantId: costData.VendorPlantId !== null ? costData.VendorPlantId : EMPTY_GUID,
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

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
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

              <Row className="filter-row-large pt-4 ">
                <Col md="12" lg="11" className="filter-block ">
                  <div className="d-inline-flex justify-content-start align-items-top w100 rm-domestic-filter">
                    <div className="flex-fills">
                      <h5>{`Filter By:`}</h5>
                    </div>

                    <div className="flex-fill mr-2">
                      <SearchableSelectHookForm
                        label={''}
                        name={'RawMaterialId'}
                        placeholder={'Raw Material'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        options={renderListing("material")}
                        handleChange={handleRMChange}
                      />

                    </div>
                    <div className="flex-fill">

                      <SearchableSelectHookForm
                        label={''}
                        name={'RawMaterialGradeId'}
                        placeholder={'RM Grade'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        options={renderListing("grade")}
                        handleChange={() => { }}
                      />
                    </div>

                    <div className="flex-fill">
                      <button
                        type="button"
                        onClick={resetFilter}
                        className="reset mr10"
                      >
                        {"Reset"}
                      </button>

                      <button
                        type="button"
                        onClick={filterList}
                        className="user-btn"
                      >
                        {"Apply"}
                      </button>
                    </div>
                  </div>
                </Col>
              </Row>

            </form >

            <Row className="mx-0">
              <Col>
                <BootstrapTable
                  data={rmDrawerList}
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
                  <TableHeaderColumn dataField="RawMaterialId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="EntryType"  >{renderRmType()}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="RawMaterial" >{renderRmName()}</TableHeaderColumn>
                  <TableHeaderColumn width={80} columnTitle={true} dataAlign="center" dataField="RMGrade" >{renderRmGrade()}</TableHeaderColumn>
                  <TableHeaderColumn width={80} columnTitle={true} dataAlign="center" dataField="RMSpec" >{renderRmSpec()}</TableHeaderColumn>
                  <TableHeaderColumn width={80} columnTitle={true} dataAlign="center" dataField="Category" searchable={false} >Category</TableHeaderColumn>
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="VendorName" >Vendor</TableHeaderColumn>}
                  {costData && costData.VendorType === ZBC && <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="VendorLocation" searchable={false} >{renderVendorLocation()}</TableHeaderColumn>}
                  <TableHeaderColumn width={80} columnTitle={true} dataAlign="center" dataField="Currency" dataFormat={currencyFormatter} searchable={false} >Currency</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="UOM" searchable={false} >UOM</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="BasicRatePerUOM" searchable={false} >{renderBasicRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={100} columnTitle={true} dataAlign="center" dataField="ScrapRate" searchable={false} >{renderScrapRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCostConversion" dataFormat={netLandedFormat} searchable={false} >{renderNetLandedRate()}</TableHeaderColumn>
                  <TableHeaderColumn width={120} columnTitle={true} dataAlign="center" dataField="NetLandedCost" dataFormat={netLandedConversionFormat} searchable={false} >{renderNetLandedConversionRate()}</TableHeaderColumn>
                </BootstrapTable>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mx-0">
              <div className="col-sm-12 text-left bluefooter-butn">
                <button
                  type={'button'}
                  className="submit-button mr5 save-btn"
                  onClick={addRow} >
                  <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'SELECT'}
                </button>

                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button>
              </div>
            </Row>

          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddRM);