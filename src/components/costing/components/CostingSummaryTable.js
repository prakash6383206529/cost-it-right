import React, { Fragment, useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Row, Col, Table } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import AddToComparisonDrawer from './AddToComparisonDrawer'
import { setCostingViewData, setCostingApprovalData } from '../actions/Costing'
import ViewBOP from './Drawers/ViewBOP'
import $ from 'jquery'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'
import ViewOverheadProfit from './Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight'
import ViewToolCost from './Drawers/viewToolCost'
import SendForApproval from './approval/SendForApproval'
import { toastr } from 'react-redux-toastr'
import { checkForDecimalAndNull } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { FILE_URL } from '../../../config/constants'

const CostingSummaryTable = (props) => {
  const { viewMode } = props
  const dispatch = useDispatch()
  const [addComparisonToggle, setaddComparisonToggle] = useState(false)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [editObject, setEditObject] = useState({})
  /* Constant  for drawer toggle*/
  const [isViewBOP, setViewBOP] = useState(false)
  const [isViewConversionCost, setIsViewConversionCost] = useState(false)
  const [isViewRM, setIsViewRM] = useState(false)
  const [isViewToolCost, setIsViewToolCost] = useState(false)
  const [isViewOverheadProfit, setIsViewOverheadProfit] = useState(false)
  const [isViewPackagingFreight, setIsViewPackagingFreight] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  /*Constants for sendind data in drawer*/
  const [viewBOPData, setViewBOPData] = useState([])
  const [viewConversionCostData, setViewConversionCostData] = useState([])
  const [viewRMData, setViewRMData] = useState([])
  const [viewOverheadData, setViewOverheadData] = useState([])
  const [viewProfitData, setViewProfitData] = useState([])
  const [viewToolCost, setViewToolCost] = useState([])
  const [viewRejectAndModelType, setViewRejectAndModelType] = useState({})
  const [viewPackagingFreight, setViewPackagingFreight] = useState({})
  const [multipleCostings, setMultipleCostings] = useState([])
  const [flag, setFlag] = useState(false)
  const [isAttachment, setAttachment] = useState(false)

  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData,
  )
  const viewApprovalData = useSelector(
    (state) => state.costing.costingApprovalData,
  )

  /**
   * @method ViewBOP
   * @description SET VIEW BOP DATA FOR DRAWER
   */
  const viewBop = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')
    setViewBOP(true)
    setIsViewConversionCost(false)
    if (index != -1) {
      let data = viewCostingData[index].netBOPCostView
      setViewBOPData(data)
    }
  }
  /**
   * @method viewConversionCostData
   * @description SET COVERSION DATA FOR DRAWER
   */
  const viewConversionCost = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')
    setIsViewConversionCost(true)
    setViewBOP(false)
    if (index != -1) {
      let data = viewCostingData[index].netConversionCostView
      setViewConversionCostData(data)
    }
  }
  /**
   * @method viewRM
   * @description SET RM DATA FOR DRAWER
   */
  const viewRM = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')

    let data = viewCostingData[index].netRMCostView

    setIsViewRM(true)
    setViewRMData(data)
  }
  /**
   * @method overHeadProfit
   * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
   */
  const overHeadProfit = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')

    let overHeadData = viewCostingData[index].netOverheadCostView
    let profitData = viewCostingData[index].netProfitCostView
    let rejectData = viewCostingData[index].netRejectionCostView
    let modelType = viewCostingData[index].modelType

    setIsViewOverheadProfit(true)
    setViewOverheadData(overHeadData)
    setViewProfitData(profitData)
    setViewRejectAndModelType({ rejectData: rejectData, modelType: modelType })
  }
  /**
   * @method viewPackagingAndFrieghtData
   * @description SET PACKAGING AND FRIEGHT DATA FOR DRAWER
   */
  const viewPackagingAndFrieghtData = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')

    let packagingData = viewCostingData[index].netPackagingCostView
    let freightData = viewCostingData[index].netFreightCostView

    setIsViewPackagingFreight(true)
    setViewPackagingFreight({
      packagingData: packagingData,
      freightData: freightData,
    })
  }
  /**
   * @method viewToolCostData
   * @description SET TOOL DATA FOR DRAWER
   */
  const viewToolCostData = (index) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')

    let data = viewCostingData[index].netToolCostView
    setIsViewToolCost(true)
    setViewToolCost(data)
  }

  const deleteCostingFromView = (index) => {
    let temp = viewCostingData
    temp.splice(index, 1)
    dispatch(setCostingViewData(temp))
  }

  /**
   * @method editHandler
   * @description HANDLING EDIT OF COSTING SUMMARY
   *
   */
  const editHandler = (index) => {
    const editObject = {
      partId: viewCostingData[index].partId,
      plantId: viewCostingData[index].plantId,
      plantName: viewCostingData[index].plantName,
      costingId: viewCostingData[index].costingId,
      CostingNumber: viewCostingData[index].costingName,
      index: index,
      typeOfCosting: viewCostingData[index].zbc,
    }
    setIsEditFlag(true)
    setaddComparisonToggle(true)
    setEditObject(editObject)
  }

  /**
   * @method addComparisonDrawerToggle
   * @description HANDLE ADD TO COMPARISON DRAWER TOGGLE
   */

  const addComparisonDrawerToggle = () => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')
    setaddComparisonToggle(true)
    setIsEditFlag(false)
    setEditObject({})
  }
  /**
   * @method closeAddComparisonDrawer
   * @description HIDE ADD COMPARISON DRAWER
   */
  const closeAddComparisonDrawer = (e = '') => {
    setaddComparisonToggle(false)
  }

  /**
   * @method closeViewDrawer
   * @description Closing view Drawer
   */
  const closeViewDrawer = (e = ' ') => {
    setViewBOP(false)
    setIsViewPackagingFreight(false)
    setIsViewRM(false)
    setIsViewOverheadProfit(false)
    setIsViewConversionCost(false)
    setIsViewToolCost(false)
  }
  /**
   * @method closeShowApproval
   * @description FOR CLOSING APPROVAL DRAWER
   */
  const closeShowApproval = (e = '') => {
    setShowApproval(false)
  }
  /**
   * @method closeShowApproval
   * @description FOR CLOSING APPROVAL DRAWER
   */
  const closeAttachmentDrawer = (e = '') => {
    setAttachment(false)
  }

  const handleMultipleCostings = (checked, index) => {
    let temp = multipleCostings

    if (checked) {
      temp.push(viewCostingData[index].costingId)
      // setMultipleCostings(temp)
    } else {
      const ind = multipleCostings.findIndex(
        (data) => data == viewCostingData[index].costingId,
      )
      if (ind != -1) {
        temp.splice(ind, 1)
      }
      // setMultipleCostings(temp)
    }

    setMultipleCostings(temp)
    setFlag(!flag)
    // let data = viewCostingData[index].netBOPCostView;
    // setViewBOPData(data)
  }

  const sendForApprovalData = (costingIds) => {
    $('html, body').animate({ scrollTop: 0 }, 'slow')

    let temp = viewApprovalData
    costingIds &&
      costingIds.map((id) => {
        let index = viewCostingData.findIndex((data) => data.costingId == id)
        if (index !== -1) {
          let obj = {}
          // add vendor key here
          obj.typeOfCosting = viewCostingData[index].zbc
          obj.plantCode = viewCostingData[index].plantCode
          obj.plantName = viewCostingData[index].plantName
          obj.plantId = viewCostingData[index].plantId
          obj.vendorId = viewCostingData[index].vendorId
          obj.vendorName = viewCostingData[index].vendorName
          obj.vendorCode = viewCostingData[index].vendorCode
          obj.vendorPlantId = viewCostingData[index].vendorPlantId
          obj.vendorPlantName = viewCostingData[index].vendorPlantName
          obj.vendorPlantCode = viewCostingData[index].vendorPlantCode
          obj.costingName = viewCostingData[index].costingName
          obj.costingId = viewCostingData[index].costingId
          // obj.oldPrice = viewCostingData[index].oldPrice;
          obj.oldPrice = viewCostingData[index].oldPoPrice
          obj.revisedPrice = viewCostingData[index].nPOPrice
          obj.variance =
            viewCostingData[index].oldPoPrice != 0
              ? parseInt(viewCostingData[index].oldPoPrice) -
                parseInt(viewCostingData[index].nPOPrice)
              : ''
          obj.consumptionQty = ''
          obj.remainingQty = ''
          obj.annualImpact = ''
          obj.yearImpact = ''
          obj.reason = ''
          obj.ecnNo = ''
          obj.effectiveDate = ''
          temp.push(obj)
        }
        dispatch(setCostingApprovalData(temp))
      })
  }

  const checkCostings = () => {
    if (multipleCostings.length == 0) {
      toastr.warning(
        'Please select at least one costing for sendig for approval',
      )
      return
    } else {
      sendForApprovalData(multipleCostings)
      setShowApproval(true)
    }
  }

  useEffect(() => {}, [viewCostingData])

  // useEffect(() => {
  //   console.log('multipleCostings: ', multipleCostings);
  // }, [multipleCostings])

  // console.log('multipleCostings: ', multipleCostings);
  return (
    <Fragment>
      <Row>
        {!viewMode && (
          <Col md="4">
            <div className="left-border">{'Summary'}</div>
          </Col>
        )}

        {
          //   <Col md="4">
          //   <button className={'user-btn'} onClick={() => editHandler(index)}>
          //     {'Edit'}
          //   </button>
          // </Col>
        }
        {!viewMode && (
          <Col md="8" className="text-right">
            <button class="user-btn mr-1 mb-2" onClick={() => checkCostings()}>
              <img
                class="mr-1"
                src={require('../../../assests/images/send-for-approval.svg')}
              ></img>{' '}
              {'Send For Approval'}
            </button>
            <button
              type="button"
              className={'user-btn mb-2'}
              onClick={addComparisonDrawerToggle}
            >
              <img src={require('../../../assests/images/compare.svg')}></img>{' '}
              Add To Comparison{' '}
            </button>
          </Col>
        )}
      </Row>
      <Row>
        <Col md="12">
          <div class="table-responsive">
            <table class="table table-bordered costing-summary-table">
              <thead>
                <tr>
                  <th scope="col">ZBC v/s VBC</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <th scope="col">
                          <div class="element w-50 d-inline-block">
                            <div class="custom-check d-inline-block">
                              <input
                                type="checkbox"
                                id="check1"
                                onClick={(e) => {
                                  handleMultipleCostings(
                                    e.target.checked,
                                    index,
                                  )
                                }}
                                value={
                                  multipleCostings.length == 0
                                    ? false
                                    : multipleCostings.includes(
                                        data.costingName,
                                      )
                                    ? true
                                    : false
                                }
                              />
                              {
                                !viewMode && (
                                  <label for="check1"></label>
                                ) /*dont remove it is for check box*/
                              }
                            </div>
                            <span>{data.zbc}</span>
                          </div>
                          {!viewMode && (
                            <div class="action w-50 d-inline-block text-right">
                              <button
                                type="button"
                                class="btn small-square-btn btn-link edit-btn"
                              >
                                <i class="fa fa-pencil"></i>
                              </button>
                              <button
                                type="button"
                                class="btn small-square-btn btn-link file-btn"
                              >
                                <i class="fa fa-file"></i>
                              </button>
                              <button
                                type="button"
                                class="btn small-square-btn btn-link remove-btn"
                                onClick={() => deleteCostingFromView(index)}
                              >
                                <i class="fa fa-times"></i>
                              </button>
                            </div>
                          )}
                        </th>
                      )
                    })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="d-block">Costing Version</span>
                    <span class="d-block">PO Price</span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          <span class="d-flex justify-content-between bg-grey">
                            {data.costingName}{' '}
                            <a
                              class="text-primary d-inline-block"
                              onClick={() => editHandler(index)}
                            >
                              <small>Change version</small>
                            </a>
                          </span>
                          <span class="d-block">{data.poPrice}</span>
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">RM Name-Grade</span>
                    <span class="d-block small-grey-text">Gross Weight</span>
                    <span class="d-block small-grey-text">Finish Weight</span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <span class="d-block small-grey-text">{data.rm}</span>
                          <span class="d-block small-grey-text">
                            {data.gWeight}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.fWeight}
                          </span>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net RM Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.netRM}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => viewRM(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net BOP Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.netBOP}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => viewBop(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">Process Cost</span>
                    <span class="d-block small-grey-text">Operation Cost</span>
                    <span class="d-block small-grey-text">
                      Surface Treatment
                    </span>
                    <span class="d-block small-grey-text">
                      Suportation Cost
                    </span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <span class="d-block small-grey-text">
                            {data.pCost}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.oCost}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.sTreatment}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.tCost}
                          </span>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net Conversion Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.nConvCost}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => viewConversionCost(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">
                      Model Type For Overhead/Profit
                    </span>
                    <br />
                    <span class="d-block small-grey-text">Overhead On</span>
                    <span class="d-block small-grey-text">Profit On</span>
                    <span class="d-block small-grey-text">Rejection On</span>
                    <span class="d-block small-grey-text">ICC On</span>
                    <span class="d-block small-grey-text">Payment Terms</span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <span class="d-block">{data.modelType}</span>
                          <div class="d-flex">
                            <span class="d-inline-block w-50">
                              {data.aValue.applicability}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50">
                              {data.aValue.value}
                            </span>
                          </div>
                          <div class="d-flex">
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.overheadOn.overheadTitle}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.overheadOn.overheadValue}
                            </span>
                          </div>
                          <div class="d-flex">
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.profitOn.profitTitle}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.profitOn.profitValue}
                            </span>
                          </div>
                          <div class="d-flex">
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.rejectionOn.rejectionTitle}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.rejectionOn.rejectionValue}
                            </span>
                          </div>
                          <div class="d-flex">
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.iccOn.iccTitle}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.iccOn.iccValue}
                            </span>
                          </div>
                          <div class="d-flex">
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.paymentTerms.paymentTitle}
                            </span>{' '}
                            &nbsp;{' '}
                            <span class="d-inline-block w-50 small-grey-text">
                              {data.paymentTerms.paymentValue}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net Overhead & Profits</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.nOverheadProfit}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => overHeadProfit(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">Packaging Cost</span>
                    <span class="d-block small-grey-text">Freight</span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <span class="d-block small-grey-text">
                            {data.packagingCost}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.freight}
                          </span>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net Packaging & Freight</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.nPackagingAndFreight}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => viewPackagingAndFrieghtData(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">
                      Tool Maintenance Cost
                    </span>
                    <span class="d-block small-grey-text">Tool Price</span>
                    <span class="d-block small-grey-text">
                      Amortization Quantity(Tool Life)
                    </span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <span class="d-block small-grey-text">
                            {data.toolMaintenanceCost}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.toolPrice}
                          </span>
                          <span class="d-block small-grey-text">
                            {data.amortizationQty}
                          </span>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Total Tool Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.totalToolCost}
                          <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                            onClick={() => viewToolCostData(index)}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Total Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return (
                        <td>
                          {data.totalCost}
                          {/* <button
                            type="button"
                            class="float-right btn small-square-btn btn-link eye-btn"
                          >
                            <i class="fa fa-eye"></i>
                          </button> */}
                        </td>
                      )
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">
                      Hundi/Other Discount
                    </span>
                    <span class="d-block small-grey-text"></span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <div>
                            <span>{data.otherDiscount.discount}</span> &nbsp;{' '}
                            <span>{data.otherDiscount.value}</span>
                          </div>
                          <div>
                            <span>
                              {data.otherDiscountValue.discountPercentValue}
                            </span>{' '}
                            &nbsp;{' '}
                            <span>{data.otherDiscountValue.discountValue}</span>
                          </div>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Any Other Cost</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return <td>{data.anyOtherCost}</td>
                    })}
                </tr>
                <tr>
                  <th>Remark</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return <td>{data.remark}</td>
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net Po PRice(INR)</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return <td>{data.nPOPriceWithCurrency}</td>
                    })}
                </tr>
                <tr>
                  <td>
                    <span class="d-block small-grey-text">Currency</span>
                  </td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          <div>
                            <span>{data.currency.currencyTitle}</span> &nbsp;{' '}
                            <span>{data.currency.currencyValue}</span>
                          </div>
                        </td>
                      )
                    })}
                </tr>
                <tr class="background-light-blue">
                  <th>Net PO PRice</th>
                  {viewCostingData &&
                    viewCostingData.map((data, index) => {
                      return <td>{data.nPOPrice}</td>
                    })}
                </tr>
                <tr>
                  <td>Attachment</td>
                  {viewCostingData &&
                    viewCostingData.map((data) => {
                      return (
                        <td>
                          {data.attachment && data.attachment.length == 0 ? (
                            'No attachment found'
                          ) : data.attachment.length == 1 ? (
                            data.attachment &&
                            data.attachment.map((f) => {
                              const withOutTild = f.FileURL
                                ? f.FileURL.replace('~', '')
                                : ''
                              const fileURL = `${FILE_URL}${withOutTild}`
                              return (
                                <div
                                  className={'image-viwer'}
                                  onClick={() => {}}
                                >
                                  <img
                                    src={fileURL}
                                    height={50}
                                    width={100}
                                    alt="cancel-icon.jpg"
                                  />
                                </div>
                              )
                            })
                          ) : (
                            // <img
                            //   src={require('../../../assests/images/times.png')}
                            //   alt="cancel-icon.jpg"
                            // />
                            <button
                              onClick={() => {
                                setAttachment(true)
                              }}
                            >
                              View Attachment
                            </button>
                          )}
                        </td>
                      )
                    })}
                </tr>
                {!viewMode && (
                  <tr class="background-light-blue">
                    <td className="text-center"></td>
                    {viewCostingData.map((data, index) => {
                      return (
                        <td class="text-center">
                          <button
                            class="user-btn"
                            onClick={() => {
                              sendForApprovalData([data.costingId], index)
                              setShowApproval(true)
                            }}
                          >
                            {' '}
                            <img
                              class="mr-1"
                              src={require('../../../assests/images/send-for-approval.svg')}
                            ></img>
                            Send For Approval
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      {addComparisonToggle && (
        <AddToComparisonDrawer
          isOpen={addComparisonToggle}
          closeDrawer={closeAddComparisonDrawer}
          isEditFlag={isEditFlag}
          editObject={editObject}
          anchor={'right'}
        />
      )}
      {/* DRAWERS FOR VIEW  */}
      {isViewBOP && (
        <ViewBOP
          isOpen={isViewBOP}
          viewBOPData={viewBOPData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewConversionCost && (
        <ViewConversionCost
          isOpen={isViewConversionCost}
          viewConversionCostData={viewConversionCostData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewRM && (
        <ViewRM
          isOpen={isViewRM}
          viewRMData={viewRMData}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewOverheadProfit && (
        <ViewOverheadProfit
          isOpen={isViewOverheadProfit}
          overheadData={viewOverheadData}
          profitData={viewProfitData}
          rejectAndModelType={viewRejectAndModelType}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewPackagingFreight && (
        <ViewPackagingAndFreight
          isOpen={isViewPackagingFreight}
          packagingAndFreightCost={viewPackagingFreight}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {isViewToolCost && (
        <ViewToolCost
          isOpen={isViewToolCost}
          viewToolCost={viewToolCost}
          closeDrawer={closeViewDrawer}
          anchor={'right'}
        />
      )}
      {showApproval && (
        <SendForApproval
          isOpen={showApproval}
          closeDrawer={closeShowApproval}
          anchor={'right'}
        />
      )}
      {isAttachment && (
        <Attachament
          isOpen={isAttachment}
          closeDrawer={closeAttachmentDrawer}
          anchor={'right'}
        />
      )}
    </Fragment>
  )
}

export default CostingSummaryTable
