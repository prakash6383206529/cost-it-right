import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import AddToComparisonDrawer from './AddToComparisonDrawer'
import {
  setCostingViewData, setCostingApprovalData, createZBCCosting, createVBCCosting, getZBCCostingByCostingId,
  storePartNumber, getSingleCostingDetails
} from '../actions/Costing'
import ViewBOP from './Drawers/ViewBOP'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'
import ViewOverheadProfit from './Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight'
import ViewToolCost from './Drawers/viewToolCost'
import SendForApproval from './approval/SendForApproval'
import { toastr } from 'react-redux-toastr'
import { checkForDecimalAndNull, checkForNull, formViewData, loggedInUserId, userDetails } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { DRAFT, EMPTY_GUID_0, FILE_URL, REJECTED, VARIANCE, VBC, ZBC } from '../../../config/constants'
import { useHistory } from "react-router-dom";
import WarningMessage from '../../common/WarningMessage'
import moment from 'moment'
import { getVolumeDataByPartAndYear } from '../../masters/actions/Volume'
import { isFinalApprover } from '../actions/Approval'
import { isSafeInteger } from 'lodash'
const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const CostingSummaryTable = (props) => {
  const { viewMode, showDetail, technologyId, costingID, showWarningMsg, simulationMode, isApproval, simulationDrawer, customClass } = props
  let history = useHistory();

  const dispatch = useDispatch()
  const [addComparisonToggle, setaddComparisonToggle] = useState(false)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [editObject, setEditObject] = useState({})
  const [isFinalApproverShow, setIsFinalApproverShow] = useState(false)

  /* Constant  for drawer toggle*/
  const [isViewBOP, setViewBOP] = useState(false)
  const [isViewConversionCost, setIsViewConversionCost] = useState(false)
  const [isViewRM, setIsViewRM] = useState(false)
  const [isViewToolCost, setIsViewToolCost] = useState(false)
  const [isViewOverheadProfit, setIsViewOverheadProfit] = useState(false)
  const [isViewPackagingFreight, setIsViewPackagingFreight] = useState(false)
  const [showApproval, setShowApproval] = useState(false)

  /*Constants for sending data in drawer*/
  const [viewBOPData, setViewBOPData] = useState([])
  const [viewConversionCostData, setViewConversionCostData] = useState([])
  const [viewRMData, setViewRMData] = useState([])
  const [viewOverheadData, setViewOverheadData] = useState([])
  const [viewProfitData, setViewProfitData] = useState([])
  const [viewToolCost, setViewToolCost] = useState([])
  const [viewRejectAndModelType, setViewRejectAndModelType] = useState({})
  const [viewPackagingFreight, setViewPackagingFreight] = useState({})
  const [multipleCostings, setMultipleCostings] = useState([])
  const [isWarningFlag, setIsWarningFlag] = useState(false)


  const [flag, setFlag] = useState(false)
  const [isAttachment, setAttachment] = useState(false)

  /*CONSTANT FOR  CREATING AND EDITING COSTING*/
  const [stepOne, setStepOne] = useState(true);
  const [stepTwo, setStepTwo] = useState(false);
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [index, setIndex] = useState('')

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)

  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const partNumber = useSelector(state => state.costing.partNo);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const [warningMsg, setShowWarningMsg] = useState(false)

  useEffect(() => {

  }, [multipleCostings])

  // useEffect(() => {
  //   
  // }, [showWarningMsg])

  useEffect(() => {
    if (!viewMode && viewCostingData && partInfo) {
      let obj = {}
      obj.TechnologyId = partInfo.TechnologyId
      obj.DepartmentId = '00000000-0000-0000-0000-000000000000'
      obj.LoggedInUserLevelId = userDetails().LoggedInLevelId
      obj.LoggedInUserId = userDetails().LoggedInUserId

      dispatch(isFinalApprover(obj, res => {
        if (res.data.Result) {
          setIsFinalApproverShow(res.data.Data.IsFinalApprovar) // UNCOMMENT IT AFTER DEPLOTED FROM KAMAL SIR END
          // setIsFinalApproverShow(false)
        }
      }))
    }

  }, [])

  /**
   * @method ViewBOP
   * @description SET VIEW BOP DATA FOR DRAWER
   */
  const viewBop = (index) => {
    setViewBOP(true)
    setIsViewConversionCost(false)
    if (index != -1) {
      let data = viewCostingData[index].netBOPCostView
      let bopPHandlingCharges = viewCostingData[index].bopPHandlingCharges
      let bopHandlingPercentage = viewCostingData[index].bopHandlingPercentage
      setViewBOPData({ BOPData: data, bopPHandlingCharges: bopPHandlingCharges, bopHandlingPercentage: bopHandlingPercentage })
    }
  }

  /**
   * @method viewConversionCostData
   * @description SET COVERSION DATA FOR DRAWER
   */
  const viewConversionCost = (index) => {
    setIsViewConversionCost(true)
    setViewBOP(false)
    if (index != -1) {
      let data = viewCostingData[index].netConversionCostView
      let netTransportationCostView = viewCostingData[index].netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index].surfaceTreatmentDetails
      setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails })
    }
  }

  /**
   * @method viewRM
   * @description SET RM DATA FOR DRAWER
   */
  const viewRM = (index) => {
    let data = viewCostingData[index].netRMCostView
    setIsViewRM(true)
    setIndex(index)
    setViewRMData(data)
  }

  /**
   * @method overHeadProfit
   * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
   */
  const overHeadProfit = (index) => {
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
      VendorId: viewCostingData[index].vendorId,
      vendorName: viewCostingData[index].vendorName,
      vendorPlantName: viewCostingData[index].vendorPlantName,
      vendorPlantId: viewCostingData[index].vendorPlantId,
      destinationPlantCode: viewCostingData[index].destinationPlantCode,
      destinationPlantName: viewCostingData[index].destinationPlantName,
      destinationPlantId: viewCostingData[index].destinationPlantId,
    }

    setIsEditFlag(true)
    setaddComparisonToggle(true)
    setEditObject(editObject)
  }

  /**
   * @method addNewCosting
   * @description ADD NEW COSTING (GO TO COSTING DETAIL)
  */
  const addNewCosting = (index) => {
    partNumber.isChanged = false
    dispatch(storePartNumber(partNumber))
    history.push('/costing')
    const userDetail = userDetails()
    let tempData = viewCostingData[index]
    const type = viewCostingData[index].zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      const data = {
        PartId: partNumber.partId,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: tempData.technologyId,
        ZBCId: userDetail.ZBCSupplierInfo.VendorId,
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        PlantId: tempData.plantId,
        PlantName: tempData.plantName,
        PlantCode: tempData.plantCode,
        ShareOfBusinessPercent: tempData.shareOfBusinessPercent,
        IsAssemblyPart: partInfo.IsAssemblyPart,
        PartNumber: partInfo.PartNumber,
        PartName: partInfo.PartName,
        Description: partInfo.Description,
        ECNNumber: partInfo.ECNNumber,
        RevisionNumber: partInfo.RevisionNumber,
        DrawingNumber: partInfo.DrawingNumber,
        Price: partInfo.Price,
        EffectiveDate: partInfo.EffectiveDate,
      }

      dispatch(createZBCCosting(data, (res) => {
        if (res.data.Result) {
          setPartInfo(res.data.Data)
          dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, (res) => { }))
          showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
        }
      }),
      )

    } else if (type === VBC) {
      const data = {
        PartId: partInfo.PartId,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: tempData.technologyId,
        VendorId: tempData.vendorId,
        VendorPlantId: tempData.vendorPlantId,
        VendorPlantName: tempData.vendorPlantName,
        VendorPlantCode: tempData.vendorPlantCode,
        VendorName: tempData.vendorName,
        VendorCode: tempData.vendorCode,
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantId : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantName : '',
        DestinationPlantCode: initialConfiguration?.IsDestinationPlantConfigure ? tempData.DestinationPlantCode : '',
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        ShareOfBusinessPercent: tempData.shareOfBusinessPercent,
        IsAssemblyPart: partInfo.IsAssemblyPart,
        PartNumber: partInfo.PartNumber,
        PartName: partInfo.PartName,
        Description: partInfo.Description,
        ECNNumber: partInfo.ECNNumber,
        RevisionNumber: partInfo.RevisionNumber,
        DrawingNumber: partInfo.DrawingNumber,
        Price: partInfo.Price,
        EffectiveDate: partInfo.EffectiveDate,
      }

      dispatch(createVBCCosting(data, (res) => {
        if (res.data.Result) {
          dispatch(getZBCCostingByCostingId(res.data.Data.CostingId, (res) => { }))
          setPartInfo(res.data.Data)
          showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
        }
      }),
      )
    }
  }

  /**
 * @method editCostingDetail
 * @description EDIT COSTING DETAIL (WILL GO TO COSTING DETAIL PAGE)
 */
  const editCostingDetail = (index) => {
    partNumber.isChanged = false
    dispatch(storePartNumber(partNumber))
    history.push('/costing')
    let tempData = viewCostingData[index]
    const type = viewCostingData[index].zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      dispatch(getZBCCostingByCostingId(tempData.costingId, (res) => { }))
      showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
    }
    if (type === VBC) {
      dispatch(getZBCCostingByCostingId(tempData.costingId, (res) => { }))
      showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
    }
  }

  /**
   * @method addComparisonDrawerToggle
   * @description HANDLE ADD TO COMPARISON DRAWER TOGGLE
   */

  const addComparisonDrawerToggle = () => {
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
    setMultipleCostings([])
    setShowWarningMsg(true)
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
  const closeShowApproval = (e = '', type) => {
    setShowApproval(false)

    setMultipleCostings([])

    if (type === 'Submit') {
      dispatch(storePartNumber(''))
      props.resetData()
    }
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
      const ind = multipleCostings.findIndex((data) => data === viewCostingData[index].costingId,)
      if (ind !== -1) {
        temp.splice(ind, 1)
      }
      // setMultipleCostings(temp)
    }

    setMultipleCostings(temp)
    setFlag(!flag)
    // let data = viewCostingData[index].netBOPCostView;
    // setViewBOPData(data)
  }

  const moduleHandler = (id) => {
    let temp = multipleCostings
    if (temp.includes(id)) {
      const ind = multipleCostings.findIndex((data) => data === id)

      if (ind !== -1) {
        temp.splice(ind, 1)
      }

      const checkInd = viewCostingData.findIndex((data) => data.costingId === id)
      if (checkInd !== -1) {
        if (viewCostingData[checkInd].IsApprovalLocked) {
          setIsWarningFlag(!viewCostingData[checkInd].IsApprovalLocked)   // CONDITION IF ALREADY FOR A PART +PLANT /VENDOR+PLANT ,COSTING IS ALREADY SENT FOR APPROVAL
        }
      }

    } else {

      temp.push(id)
      const ind = multipleCostings.findIndex((data) => data === id)
      const checkInd = viewCostingData.findIndex((data) => data.costingId === id)

      if (temp.length > 1 && isWarningFlag) {
        if (viewCostingData[checkInd].IsApprovalLocked === true) {
          setIsWarningFlag(viewCostingData[checkInd].IsApprovalLocked)
        }
      } else {
        setIsWarningFlag(viewCostingData[checkInd].IsApprovalLocked)
      }
    }

    setMultipleCostings(temp)
    setFlag(!flag)
  }

  const sendForApprovalData = (costingIds) => {

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
          obj.costingName = viewCostingData[index].CostingNumber
          obj.costingId = viewCostingData[index].costingId
          obj.oldPrice = viewCostingData[index].oldPoPrice
          obj.revisedPrice = viewCostingData[index].poPrice
          obj.nPOPriceWithCurrency = viewCostingData[index].nPOPriceWithCurrency
          obj.currencyRate = viewCostingData[index].currency.currencyValue
          obj.variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0) - Number(viewCostingData[index].oldPoPrice && viewCostingData[index].oldPoPrice !== '-' ? viewCostingData[index].oldPoPrice : 0)
          let consumptionQty;
          let remainingQty;
          let annualImpact;
          let yearImpact;
          let date = viewCostingData[index].effectiveDate
          if (viewCostingData[index].effectiveDate) {
            let variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0) - Number(viewCostingData[index].oldPoPrice && viewCostingData[index].oldPoPrice !== '-' ? viewCostingData[index].oldPoPrice : 0)
            let month = new Date(date).getMonth()
            let year = ''
            let sequence = SEQUENCE_OF_MONTH[month]

            if (month <= 2) {
              year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
            } else {
              year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
            }
            dispatch(getVolumeDataByPartAndYear(partNumber.value ? partNumber.value : partNumber.partId, year, res => {
              if (res.data.Result === true || res.status === 202) {
                let approvedQtyArr = res.data.Data.VolumeApprovedDetails
                let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
                let actualQty = 0
                let totalBudgetedQty = 0
                let actualRemQty = 0

                approvedQtyArr.map((data) => {
                  if (data.Sequence < sequence) {
                    // if(data.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
                    //   actualQty += parseInt(data.ApprovedQuantity)
                    // }
                    actualQty += parseInt(data.ApprovedQuantity)
                  } else if (data.Sequence >= sequence) {
                    actualRemQty += parseInt(data.ApprovedQuantity)
                  }
                })
                budgetedQtyArr.map((data) => {
                  // if (data.Sequence >= sequence) {
                  totalBudgetedQty += parseInt(data.BudgetedQuantity)
                  // }
                })
                obj.consumptionQty = checkForNull(actualQty)
                obj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
                obj.annualImpact = variance != '' ? totalBudgetedQty * variance : 0
                obj.yearImpact = variance != '' ? (totalBudgetedQty - actualQty) * variance : 0

              }
            })

            )
          }
          // obj.consumptionQty = viewCostingData[index].effectiveDate ? consumptionQty : ''
          // obj.remainingQty = viewCostingData[index].effectiveDate ? remainingQty : ''
          // obj.annualImpact = viewCostingData[index].effectiveDate ? annualImpact : ''
          // obj.yearImpact = viewCostingData[index].effectiveDate ? yearImpact : ''
          obj.reason = ''
          obj.ecnNo = ''
          obj.effectiveDate = viewCostingData[index].effectiveDate
          obj.isDate = viewCostingData[index].effectiveDate ? true : false
          obj.partNo = viewCostingData[index].partId
          obj.destinationPlantCode = viewCostingData[index].destinationPlantCode
          obj.destinationPlantName = viewCostingData[index].destinationPlantName
          obj.destinationPlantId = viewCostingData[index].destinationPlantId
          temp.push(obj)
        }
        dispatch(setCostingApprovalData(temp))
      })
  }

  const checkCostings = () => {
    if (multipleCostings.length === 0) {
      toastr.warning('Please select at least one costing to send for approval')
      return
    } else {
      sendForApprovalData(multipleCostings)
      setShowApproval(true)
    }
  }

  useEffect(() => {
    if (viewCostingData.length === 1) {

      setIsWarningFlag(viewCostingData && viewCostingData.length === 1 && viewCostingData[0].IsApprovalLocked)
      // setIsWarningFlag(false)
    }
  }, [viewCostingData])

  useEffect(() => {
    if (costingID && Object.keys(costingID).length > 0 && !simulationMode) {
      dispatch(getSingleCostingDetails(costingID, (res) => {
        if (res.data.Data) {
          let dataFromAPI = res.data.Data
          const tempObj = formViewData(dataFromAPI)
          dispatch(setCostingViewData(tempObj))
        }
      },
      ))
    }
  }, [costingID])

  // useEffect(() => {
  //   
  // }, [multipleCostings])

  // 

  return (

    <Fragment>
      {
        stepOne &&
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
            {
              !simulationMode &&
              <Col md="8" className="text-right">
                {(!viewMode && !isFinalApproverShow) && (
                  <button class="user-btn mr-1 mb-2 approval-btn" disabled={isWarningFlag} onClick={() => checkCostings()}>
                    <img
                      class="mr-1"
                      src={require('../../../assests/images/send-for-approval.svg')}
                    ></img>{' '}
                    {'Send For Approval'}
                  </button>
                )}
                <button
                  type="button"
                  className={'user-btn mb-2 comparison-btn'}
                  onClick={addComparisonDrawerToggle}
                >
                  <img className="mr-2" src={require('../../../assests/images/compare.svg')}></img>{' '}
                  Add To Comparison{' '}
                </button>
                {isWarningFlag && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'A costing is pending for approval for this part or one of it\'s child part. Please approve that first'} />}
                {(showWarningMsg && !warningMsg) && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Costing for this part/Assembly is not yet done!'} />}
              </Col>
            }
          </Row>

          <Row className={customClass}>
            <Col md="12">
              <div class="table-responsive">
                <table class="table table-bordered costing-summary-table">
                  <thead>
                    <tr className="main-row">
                      {
                        isApproval ? <th scope="col">{props.id}</th> : <th scope="col">VBC</th>
                      }

                      {viewCostingData &&
                        viewCostingData.map((data, index) => {

                          return (
                            <th scope="col">
                              <div class="element w-60 d-inline-flex align-items-center">
                                {
                                  (data.status === DRAFT || data.status === REJECTED) &&
                                  <div class="custom-check1 d-inline-block">
                                    <label
                                      className="custom-checkbox pl-0 mb-0"
                                      onChange={() => moduleHandler(data.costingId)}
                                    >
                                      {''}
                                      <input
                                        type="checkbox"
                                        value={"All"}
                                        // disabled={true}
                                        checked={multipleCostings.includes(data.costingId)}
                                      />
                                      <span
                                        className=" before-box"
                                        checked={multipleCostings.includes(data.costingId)}
                                        onChange={() => moduleHandler(data.costingId)}
                                      />
                                    </label>
                                  </div>
                                  // <div class="custom-check d-inline-block">

                                  //   <input
                                  //     type="checkbox"
                                  //     id={`check${index}`}
                                  //     // disabled={(data.status === DRAFT || data.status === WAITING_FOR_APPROVAL) ? false : true}
                                  //     onClick={(e) => {
                                  //       handleMultipleCostings(e.target.checked, index)
                                  //     }}
                                  //     value={multipleCostings.length === 0 ? false : (multipleCostings.includes(data.costingName,) ? true : false)} />

                                  //   {
                                  //     !viewMode && (<label for={`check${index}`}></label>) /*dont remove it is for check box*/
                                  //   }
                                  // </div>
                                }
                                {
                                  isApproval ? <span className="checkbox-text">{data.CostingHeading}</span> : <span className="checkbox-text">{data.zbc === 0 ? `ZBC(${data.plantName})` : data.zbc === 1 ? `${data.vendorName}(${data.vendorCode}) ${localStorage.IsVendorPlantConfigurable ? `(${data.vendorPlantName})` : ''}` : 'CBC'}{` (SOB: ${data.shareOfBusinessPercent}%)`}</span>
                                }
                              </div>
                              {!viewMode && (
                                <div class="action w-40 d-inline-block text-right">
                                  {(data.status === DRAFT || data.status === REJECTED) && <button className="Edit mr-2 mb-0 align-middle" type={"button"} title={"Edit Costing"} onClick={() => editCostingDetail(index)} />}
                                  <button className="Add-file mr-2 mb-0 align-middle" type={"button"} title={"Add Costing"} onClick={() => addNewCosting(index)} />
                                  <button type="button" class="CancelIcon mb-0 align-middle" title={"Remove Costing"} onClick={() => deleteCostingFromView(index)}></button>
                                </div>
                              )}
                            </th>
                          )
                        })}
                    </tr>
                  </thead>
                  <tbody>
                    {
                      !isApproval ?
                        <tr>
                          <td>
                            <span class="d-block">Costing Version</span>
                            <span class="d-block">PO Price</span>
                            <span class="d-block">Part Number</span>
                            <span class="d-block">Part Name</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData.map((data, index) => {
                              return (
                                <td>
                                  <span class="d-flex justify-content-between bg-grey">
                                    {`${moment(data.costingDate).format('DD-MM-YYYY')}-${data.CostingNumber}-${data.status}`}{' '}
                                    {
                                      !viewMode &&
                                      <a
                                        class="text-primary d-inline-block change-version-block"
                                        onClick={() => editHandler(index)}
                                      >
                                        <small>Change version</small>
                                      </a>
                                    }
                                  </span>
                                  <span class="d-block">{checkForDecimalAndNull(data.poPrice, initialConfiguration.NoOfDecimalForPrice)}</span>
                                  <span class="d-block">{data.partId}</span>
                                  <span class="d-block">{data.partName}</span>

                                </td>
                              )
                            })}
                        </tr> :
                        <tr>
                          <td>
                            <span class="d-block">Part Number</span>
                            <span class="d-block">Part Name</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData.map((data, index) => {
                              return (
                                <td>
                                  <span class="d-block">{data.CostingHeading !== VARIANCE ? data.partId : ''}</span>
                                  <span class="d-block">{data.CostingHeading !== VARIANCE ? data.partName : ''}</span>

                                </td>
                              )
                            })}
                        </tr>
                    }

                    <tr>
                      <td>
                        <span class="d-block small-grey-text">RM Name-Grade</span>
                        <span class="d-block small-grey-text">Gross Weight</span>
                        <span class="d-block small-grey-text">Finish Weight</span>
                        <span class="d-block small-grey-text">Scrap Weight</span>
                      </td>
                      {viewCostingData &&
                        viewCostingData.map((data) => {
                          return (
                            <td>
                              <span class="d-block small-grey-text">{data.CostingHeading !== VARIANCE ? data.rm : ''}</span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.gWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.gWeight - data.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                              </span>
                            </td>
                          )
                        })}
                    </tr>

                    <tr class={`background-light-blue  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].netRM > viewCostingData[1].netRM ? 'green-row' : 'red-row' : '-'}`}>
                      <th>Net RM Cost</th>
                      {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return (
                            <td>
                              <span>{checkForDecimalAndNull(data.netRM, initialConfiguration.NoOfDecimalForPrice)}</span>
                              <button
                                type="button"
                                class="float-right mb-0 View "
                                onClick={() => viewRM(index)}
                              >
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
                              <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.netBOP, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              {
                                data.CostingHeading !== VARIANCE &&
                                <button
                                  type="button"
                                  class="float-right mb-0 View "
                                  onClick={() => viewBop(index)}
                                >
                                </button>
                              }

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
                          Transportation Cost
                        </span>
                      </td>
                      {viewCostingData &&
                        viewCostingData.map((data) => {
                          return (
                            <td>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.pCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.oCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.sTreatment, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.tCost, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                              <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.nConvCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              {
                                data.CostingHeading !== VARIANCE &&
                                <button
                                  type="button"
                                  class="float-right mb-0 View "
                                  onClick={() => viewConversionCost(index)}
                                >
                                </button>
                              }
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
                              <span class="d-block">{data.CostingHeading !== VARIANCE ? data.modelType : ''}</span>
                              <div class="d-flex">
                                <span class="d-inline-block w-50">
                                  {data.CostingHeading !== VARIANCE ? data.aValue.applicability : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50">
                                  {data.CostingHeading !== VARIANCE ? data.aValue.value : ''}
                                </span>
                              </div>
                              <div class="d-flex">
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.overheadOn.overheadTitle : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.overheadOn.overheadValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                              </div>
                              <div class="d-flex">
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.profitOn.profitTitle : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.profitOn.profitValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                              </div>
                              <div class="d-flex">
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.rejectionOn.rejectionTitle : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.rejectionOn.rejectionValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                              </div>
                              <div class="d-flex">
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.iccOn.iccTitle : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.iccOn.iccValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                              </div>
                              <div class="d-flex">
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.paymentTerms.paymentTitle : ''}
                                </span>{' '}
                                &nbsp;{' '}
                                <span class="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.paymentTerms.paymentValue, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                              <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              {
                                data.CostingHeading !== VARIANCE &&
                                <button
                                  type="button"
                                  class="float-right mb-0 View "
                                  onClick={() => overHeadProfit(index)}
                                >

                                </button>
                              }
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
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.packagingCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.freight, initialConfiguration.NoOfDecimalForPrice) : ''}
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
                              <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              {
                                data.CostingHeading !== VARIANCE &&
                                <button
                                  type="button"
                                  class="float-right mb-0 View "
                                  onClick={() => viewPackagingAndFrieghtData(index)}
                                >

                                </button>
                              }
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
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.toolPrice, initialConfiguration.NoOfDecimalForPrice) : ''}
                              </span>
                              <span class="d-block small-grey-text">
                                {data.CostingHeading !== VARIANCE ? data.amortizationQty : ''}
                              </span>
                            </td>
                          )
                        })}
                    </tr>

                    <tr class="background-light-blue">
                      <th>Net Tool Cost</th>
                      {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return (
                            <td>
                              <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.totalToolCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              {
                                data.CostingHeading !== VARIANCE &&
                                <button
                                  type="button"
                                  class="float-right mb-0 View "
                                  onClick={() => viewToolCostData(index)}
                                >

                                </button>
                              }
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
                              {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.totalCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                              {/* <button
                            type="button"
                            class="float-right mb-0 View "
                          >
                            
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
                              <div className="d-flex">
                                <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.otherDiscount.discount : ''}</span> &nbsp;{' '}
                                <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.otherDiscount.value : ''}</span>
                              </div>
                              <div className="d-flex">
                                <span className="d-inline-block w-50 small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.otherDiscountValue.discountPercentValue : ''}
                                </span>{' '}
                                {' '}
                                <span className="d-inline-block w-50 small-grey-text">{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.otherDiscountValue.discountValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              </div>
                            </td>
                          )
                        })}
                    </tr>

                    <tr class="background-light-blue">
                      <th>Any Other Cost</th>
                      {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return <td>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.anyOtherCost, initialConfiguration.NoOfDecimalForPrice) : ''}</td>
                        })}
                    </tr>
                    {
                      !simulationDrawer &&
                      <tr class={`background-light-blue ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nPOPrice > viewCostingData[1].nPOPrice ? 'green-row' : 'red-row' : '-'}`}>
                        <th>Net PO Price(INR)</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return <td>{checkForDecimalAndNull(data.nPOPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                          })}

                      </tr>
                    }

                    <tr>
                      <td>
                        <span class="d-block small-grey-text">Currency</span>
                      </td>
                      {viewCostingData &&
                        viewCostingData.map((data) => {
                          return (
                            <td>
                              <div>
                                <span className="d-inline-block w-50 small-grey-text">{data.CostingHeading !== VARIANCE ? data.currency.currencyTitle : ''}</span> {' '}
                                <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.currency.currencyValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                              </div>
                            </td>
                          )
                        })}
                    </tr>
                    {
                      !simulationDrawer &&
                      <tr class="background-light-blue">
                        <th>Net PO Price (in Currency)</th>
                        {/* {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return <td>Net PO Price({(data.currency.currencyTitle !== '-' ? data.currency.currencyTitle : 'INR')})</td>
                        })} */}
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return <td>{data.nPOPriceWithCurrency !== 0 ? checkForDecimalAndNull(data.nPOPriceWithCurrency, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data.nPOPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                          })}
                      </tr>
                    }

                    <tr>
                      <td>Attachment</td>
                      {viewCostingData &&
                        viewCostingData.map((data) => {
                          return (

                            <td>
                              {
                                data.CostingHeading !== VARIANCE &&
                                  data.attachment && data.attachment.length == 0 ? (
                                  'No attachment found'
                                ) : data.attachment.length == 1 ? (

                                  <td>
                                    {data.attachment && data.CostingHeading !== VARIANCE &&
                                      data.attachment.map((f) => {
                                        const withOutTild = f.FileURL
                                          ? f.FileURL.replace('~', '')
                                          : ''
                                        const fileURL = `${FILE_URL}${withOutTild}`
                                        return (
                                          <div className={"single-attachment images"}>
                                            <a href={fileURL} target="_blank">
                                              {f.OriginalFileName}
                                            </a>
                                          </div>
                                        )
                                      })}
                                  </td>
                                )
                                  : (

                                    <a
                                      href="javascript:void(0)"
                                      onClick={() => setAttachment(true)}
                                    > {data.CostingHeading !== VARIANCE ? 'View Attachment' : ''}</a>
                                  )
                              }
                            </td>
                          )
                        })}
                    </tr>

                    <tr>
                      <th>Remark</th>
                      {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return <td><span className="d-block small-grey-text">{data.CostingHeading !== VARIANCE ? data.remark : ''}</span></td>
                        })}
                    </tr>

                    {!viewMode && (
                      <tr class="background-light-blue">
                        <td className="text-center"></td>

                        {viewCostingData.map((data, index) => {

                          return (

                            <td class="text-center">
                              {
                                data.status === DRAFT &&
                                <button
                                  class="user-btn"
                                  //   disabled={(data.status === DRAFT || data.status === WAITING_FOR_APPROVAL) ? false : true}
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
                              }
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

        </Fragment>
      }
      {addComparisonToggle && (
        <AddToComparisonDrawer
          isOpen={addComparisonToggle}
          closeDrawer={closeAddComparisonDrawer}
          isEditFlag={isEditFlag}
          editObject={editObject}
          anchor={'right'}
          viewMode={viewMode}
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
          index={index}
          technologyId={technologyId}
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
