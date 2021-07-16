import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import moment from 'moment';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Drawer from '@material-ui/core/Drawer'
import HeaderTitle from '../../common/HeaderTitle';
import NoContentFound from '../../common/NoContentFound';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import { runVerifySimulation } from '../actions/Simulation';
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';



function VerifyImpactDrawer(props) {
  const { isDomestic, list, isbulkUpload, rowCount, technology, master } = props
  const [colorClass, setColorClass] = useState('')
  const [token, setToken] = useState('')
  const [showverifyPage, setShowVerifyPage] = useState(false)
  const [shown, setshown] = useState(false)
  const [acc1, setAcc1] = useState(false)
  const [acc2, setAcc2] = useState(false)
  const [acc3, setAcc3] = useState(false)

  const rmDomesticListing = useSelector(state => state.material.rmDataList)

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()

  const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)

  const toggleDrawer = (event, type = 'cancel') => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', type)
  }

  /**
   * @method shearingCostFormatter
   * @description Renders buttons
   */
  const shearingCostFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? cell : '-';
  }

  const verifySimulation = () => {
    let basicRateCount = 0
    let basicScrapCount = 0

    list && list.map((li) => {
      if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

        basicRateCount = basicRateCount + 1
      }
      if (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined) {
        basicScrapCount = basicScrapCount + 1
      }
      return null;
    })

    if (basicRateCount === list.length && basicScrapCount === list.length) {
      toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
      return false
    }

    // setShowVerifyPage(true)
    /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
    let obj = {}
    obj.Technology = technology
    obj.SimulationTechnologyId = selectedTechnologyForSimulation.value
    obj.Vendor = list[0].VendorName
    obj.Masters = master
    obj.LoggedInUserId = loggedInUserId()

    let tempArr = []
    list && list.map(item => {
      let tempObj = {}
      tempObj.CostingHead = item.CostingHead
      tempObj.RawMaterialName = item.RawMaterial
      tempObj.MaterialType = item.MaterialType
      tempObj.RawMaterialGrade = item.RMGrade
      tempObj.RawMaterialSpecification = item.RMSpec
      tempObj.RawMaterialCategory = item.Category
      tempObj.UOM = item.UOM
      tempObj.OldBasicRate = item.BasicRate
      tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
      tempObj.OldScrapRate = item.ScrapRate
      tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
      tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
      tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
      tempObj.OldNetLandedCost = item.NetLandedCost
      tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
      tempObj.EffectiveDate = item.EffectiveDate
      tempArr.push(tempObj)
    })
    obj.SimulationRawMaterials = tempArr

    dispatch(runVerifySimulation(obj, res => {

      if (res.data.Result) {
        setToken(res.data.Identity)
        setShowVerifyPage(true)
      }
    }))
  }

  /**
  * @method freightCostFormatter
  * @description Renders buttons
  */
  const freightCostFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? cell : '-';
  }


  const effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
  }


  const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
  }

  const newBasicRateFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
      </>
    )
  }

  const newScrapRateFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
      </>
    )
  }

  // const colorCheck = 

  const costFormatter = (cell, row, enumObject, rowIndex) => {
    const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
    const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
    return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
  }

  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }


  const beforeSaveCell = (row, cellName, cellValue) => {
    if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
      if (cellValue.length > 8) {
        toastr.warning("Value should not be more than 8")
        return false
      }
      return true
    } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
      toastr.warning('Please enter a valid positive numbers.')
      return false
    }
  }

  const afterSaveCell = (row, cellName, cellValue, index) => {

    if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) > row.NetLandedCost) {
      setColorClass('red-value form-control')
    } else if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) < row.NetLandedCost) {
      setColorClass('green-value form-control')
    } else {
      setColorClass('form-class')
    }
    return false

  }

  const NewcostFormatter = (cell, row, enumObject, rowIndex) => {
    const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
    const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
    return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
  }

  const renderCostingHead = () => {
    return <>Costing Head </>
  }

  const renderRawMaterial = () => {
    return <>Raw Material </>
  }

  const renderRMGrade = () => {
    return <>RM Grade </>
  }

  const renderRMSpec = () => {
    return <>RM Spec </>
  }



  const rendorFreightRate = () => {
    return <>RM Freight <br /> Cost</>
  }

  const renderShearingCost = () => {
    return <>Shearing <br /> Cost</>
  }

  const renderEffectiveDate = () => {
    return <>Effective <br /> Date</>
  }

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    paginationShowsTotal: renderPaginationShowsTotal(),
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,

  };

  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className="drawer-full-top"
      //onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <form>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`Impact`}</h3>
                  </div>
                  <div onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              <Row >
                <Col md="12" className="mt-3">
                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Vendor Name:</span>
                    <span>M/S Vendor</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Vendor Code:</span>
                    <span>12001</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Technology:</span>
                    <span>SheetMetal</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Parts Supplied:</span>
                    <span>120</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Parts Amended:</span>
                    <span>120</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Master:</span>
                    <span>RM domestic</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Costing Head:</span>
                    <span>VBC</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Effective Date:</span>
                    <span>21-06-21</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Impact for Annum(INR):</span>
                    <span>5000</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Impact for the Quarter(INR):</span>
                    <span>12500</span>
                  </span>

                  <span class="d-inline-block mr-2 mb-4 pl-3">
                    <span class="cr-tbl-label d-block">Reason:</span>
                    <span>Test</span>
                  </span>
                </Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Impacted Master Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setshown(!shown)} className={`${shown ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                {shown &&
                  <div className="accordian-content w-100">
                    <Col md="12" className="mb-3">
                      <BootstrapTable
                        data={rmDomesticListing}
                        striped={false}
                        bordered={true}
                        hover={false}
                        options={options}
                        // exportCSV
                        //ignoreSinglePage
                        className="add-volume-table sm-headrgroup-table"
                        pagination>
                        {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                        <TableHeaderColumn row='0' rowSpan='2' dataField="CostingHead" width={115} columnTitle={true} editable={false} dataAlign="left" dataSort={true} dataFormat={costingHeadFormatter}>{renderCostingHead()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' dataField="RawMaterial" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRawMaterial()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' dataField="RMGrade" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRMGrade()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="RMSpec" >{renderRMSpec()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="Category" >Category</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="TechnologyName" searchable={false} >Technology</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={150} columnTitle={true} dataAlign="left" editable={false} dataField="VendorName" >Vendor</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={110} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="UOM" >UOM</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false} >Basic Rate (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="BasicRate"  >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newBasicRateFormatter} dataField="NewBasicRate">New</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false}  >Scrap Rate (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="ScrapRate" >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newScrapRateFormatter} dataField="NewScrapRate">New</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMFreightCost" dataFormat={freightCostFormatter} searchable={false}>{rendorFreightRate()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMShearingCost" dataFormat={shearingCostFormatter} searchable={false}>{renderShearingCost()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' columnTitle={false} dataAlign="center" editable={false} searchable={false} >Net Cost (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NetLandedCost" dataFormat={costFormatter} >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NewNetLandedCost" dataFormat={NewcostFormatter} >New</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataSort={true} dataField="EffectiveDate" dataFormat={effectiveDateFormatter} >{renderEffectiveDate()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} hidden isKey={true}>Actions</TableHeaderColumn>
                      </BootstrapTable>

                    </Col>
                  </div>
                }
              </Row>

              <Row className="pr-0 mx-0">
                <Col md="12"> <HeaderTitle title={'FG wise Impact:'} /></Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="12">
                  <div className="table-responsive">
                    <table className="table cr-brdr-main accordian-table-with-arrow">
                      <thead>
                        <tr>
                          <th><span>Part Number</span></th>
                          <th><span>Rev Number/ECN Number</span></th>
                          <th><span>Part Name</span></th>
                          <th><span>Old Cost/Pc</span></th>
                          <th><span>New Cost/pc</span></th>
                          <th><span>Impact/Pc</span></th>
                          <th><span>Volume</span></th>
                          <th><span>Impact/Month</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="accordian-with-arrow">
                          <td className="arrow-accordian"><span><div class="Close" onClick={() => setAcc1(!acc1)}></div>Model 1</span></td>
                          <td><span>1</span></td>
                          <td><span>This is A model</span></td>
                          <td><span>0</span></td>
                          <td><span>0</span></td>
                          <td><span>24(INR)</span></td>
                          <td><span>2000</span></td>
                          <td><span>48000(INR) <a onClick={() => setAcc1(!acc1)} className={`${acc1 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                        </tr>
                        {acc1 &&
                          <>
                            <tr className="accordian-content">
                              <td><span>Part 1</span></td>
                              <td><span>1</span></td>
                              <td><span>Part number</span></td>
                              <td><span>24(INR)</span></td>
                              <td><span>26(INR)</span></td>
                              <td><span>2(INR)</span></td>
                              <td><span>1000</span></td>
                              <td><span>2000 (INR)</span></td>
                            </tr>
                            <tr className="accordian-content">
                              <td><span>Part 2</span></td>
                              <td><span>1</span></td>
                              <td><span>Part number</span></td>
                              <td><span>24(INR)</span></td>
                              <td><span>26(INR)</span></td>
                              <td><span>2(INR)</span></td>
                              <td><span>1000</span></td>
                              <td><span>2000 (INR)</span></td>
                            </tr>
                            <tr className="accordian-content">
                              <td><span>Part 3</span></td>
                              <td><span>1</span></td>
                              <td><span>Part number</span></td>
                              <td><span>24(INR)</span></td>
                              <td><span>26(INR)</span></td>
                              <td><span>2(INR)</span></td>
                              <td><span>1000</span></td>
                              <td><span>2000 (INR)</span></td>
                            </tr>
                          </>
                        }
                      </tbody>

                      <tbody>
                        <tr className="accordian-with-arrow">
                          <td className="arrow-accordian"><span><div onClick={() => setAcc2(!acc2)} class="Close"></div>Model 2</span></td>
                          <td><span>1</span></td>
                          <td><span>This is A model</span></td>
                          <td><span>0</span></td>
                          <td><span>0</span></td>
                          <td><span>24(INR)</span></td>
                          <td><span>2000</span></td>
                          <td><span>48000(INR) <a onClick={() => setAcc2(!acc2)} className={`${acc2 ? 'minus-icon' : 'plus-icon'} pull-right pl-3`}></a></span></td>
                        </tr>
                        {acc2 &&
                          <>
                            <tr className="accordian-content">
                              <td><span>Part 1</span></td>
                              <td><span>1</span></td>
                              <td><span>Part number</span></td>
                              <td><span>24(INR)</span></td>
                              <td><span>26(INR)</span></td>
                              <td><span>2(INR)</span></td>
                              <td><span>1000</span></td>
                              <td><span>2000 (INR)</span></td>
                            </tr>
                            <tr className="accordian-content">
                              <td><span>Part 2</span></td>
                              <td><span>1</span></td>
                              <td><span>Part number</span></td>
                              <td><span>24(INR)</span></td>
                              <td><span>26(INR)</span></td>
                              <td><span>2(INR)</span></td>
                              <td><span>1000</span></td>
                              <td><span>2000 (INR)</span></td>
                            </tr>
                          </>
                        }
                      </tbody>
                    </table>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3 pr-0 mx-0">
                <Col md="6"> <HeaderTitle title={'Last Revision Data:'} /></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <a onClick={() => setAcc3(!acc3)} className={`${acc3 ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                  </div>
                </Col>
                {acc3 &&
                  <div className="accordian-content w-100">
                    <Col md="12" className="mb-3">
                      <BootstrapTable
                        data={rmDomesticListing}
                        striped={false}
                        bordered={true}
                        hover={false}
                        options={options}
                        // exportCSV
                        //ignoreSinglePage
                        className="add-volume-table sm-headrgroup-table impact-drawer-table"
                        pagination>
                        {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                        {/* <TableHeaderColumn row='0' rowSpan='2' dataField="CostingHead" width={115} columnTitle={true} editable={false} dataAlign="left" dataSort={true} dataFormat={costingHeadFormatter}>{renderCostingHead()}</TableHeaderColumn> */}
                        <TableHeaderColumn row='0' rowSpan='2' dataField="RawMaterial" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRawMaterial()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' dataField="RMGrade" width={110} columnTitle={true} editable={false} dataAlign="left" >{renderRMGrade()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="RMSpec" >{renderRMSpec()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="Category" >Category</TableHeaderColumn>
                        {/* <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} dataField="TechnologyName" searchable={false} >Technology</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={150} columnTitle={true} dataAlign="left" editable={false} dataField="VendorName" >Vendor</TableHeaderColumn> */}
                        <TableHeaderColumn row='0' rowSpan='2' width={110} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="UOM" >UOM</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false} >Basic Rate (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="BasicRate"  >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newBasicRateFormatter} dataField="NewBasicRate">New</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' dataAlign="center" columnTitle={false} editable={false} searchable={false}  >Scrap Rate (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" editable={false} searchable={false} dataField="ScrapRate" >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={false} dataAlign="left" searchable={false} editable={isbulkUpload ? false : true} dataFormat={newScrapRateFormatter} dataField="NewScrapRate">New</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMFreightCost" dataFormat={freightCostFormatter} searchable={false}>{rendorFreightRate()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' columnTitle={true} width={100} dataAlign="left" dataField="RMShearingCost" dataFormat={shearingCostFormatter} searchable={false}>{renderShearingCost()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' tdStyle={{ minWidth: '200px', width: '200px' }} width={200} colSpan='2' columnTitle={false} dataAlign="center" editable={false} searchable={false} >Net Cost (INR)</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NetLandedCost" dataFormat={costFormatter} >Old</TableHeaderColumn>
                        <TableHeaderColumn row='1' columnTitle={true} dataAlign="left" editable={false} searchable={false} dataField="NewNetLandedCost" dataFormat={NewcostFormatter} >New</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} columnTitle={true} dataAlign="left" editable={false} searchable={false} dataSort={true} dataField="EffectiveDate" dataFormat={effectiveDateFormatter} >{renderEffectiveDate()}</TableHeaderColumn>
                        <TableHeaderColumn row='0' rowSpan='2' width={100} dataAlign="right" dataField="RawMaterialId" export={false} searchable={false} hidden isKey={true}>Actions</TableHeaderColumn>
                      </BootstrapTable>

                    </Col>
                  </div>
                }
              </Row>


              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button type={'button'} className="reset mr15 cancel-btn" onClick={toggleDrawer}>
                    <div className={"cancel-icon"}></div>{'Cancel'}
                  </button>

                  <button type="submit" className="submit-button  save-btn" >
                    <div className={"save-icon"}></div>{'Submit'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(VerifyImpactDrawer)
