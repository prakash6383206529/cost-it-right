import React, { Fragment, useEffect, useState, useRef, useCallback } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import AddToComparisonDrawer from './AddToComparisonDrawer'
import {
  setCostingViewData, setCostingApprovalData, createZBCCosting, createVBCCosting, getBriefCostingById,
  storePartNumber, getSingleCostingDetails
} from '../actions/Costing'
import ViewBOP from './Drawers/ViewBOP'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'
import ViewOverheadProfit from './Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight'
import ViewToolCost from './Drawers/viewToolCost'
import SendForApproval from './approval/SendForApproval'
import Toaster from '../../common/Toaster'
import { checkForDecimalAndNull, checkForNull, checkPermission, formViewData, getTechnologyPermission, loggedInUserId, userDetails, calculatePercentage } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { BOPDOMESTIC, BOPIMPORT, COSTING, DRAFT, EMPTY_GUID_0, FILE_URL, OPERATIONS, REJECTED, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, VARIANCE, VBC, ZBC } from '../../../config/constants'
import { useHistory } from "react-router-dom";
import WarningMessage from '../../common/WarningMessage'
import DayTime from '../../common/DayTimeWrapper'
import { getVolumeDataByPartAndYear } from '../../masters/actions/Volume'
import { isFinalApprover } from '../actions/Approval';
import cirHeader from "../../../assests/images/logo/CIRlogo.jpg";
import Logo from '../../../assests/images/logo/company-logo.png';
import LoaderCustom from '../../common/LoaderCustom'
import ReactToPrint from 'react-to-print';

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const CostingSummaryTable = (props) => {
  const { viewMode, showDetail, technologyId, costingID, showWarningMsg, simulationMode, isApproval, simulationDrawer, customClass, selectedTechnology, master } = props
  let history = useHistory();

  const dispatch = useDispatch()
  const [addComparisonToggle, setaddComparisonToggle] = useState(false)
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [isAssemblyCosting, setIsAssemblyCosting] = useState(false)
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
  const [rmMBDetail, setrmMBDetail] = useState({})
  const [viewAtttachments, setViewAttachment] = useState([])
  const [pdfHead, setPdfHead] = useState(false);
  const [drawerDetailPDF, setDrawerDetailPDF] = useState(false);
  const [icons, setIcon] = useState(true);
  const [loader, setLoader] = useState(false);



  const [flag, setFlag] = useState(false)
  const [isAttachment, setAttachment] = useState(false)

  /*CONSTANT FOR  CREATING AND EDITING COSTING*/
  const [stepOne, setStepOne] = useState(true);
  const [stepTwo, setStepTwo] = useState(false);
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [index, setIndex] = useState('')

  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [iccPaymentData, setIccPaymentData] = useState("")

  const [warningMsg, setShowWarningMsg] = useState(false)

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const partNumber = useSelector(state => state.costing.partNo);
  const { initialConfiguration, topAndLeftMenuData } = useSelector(state => state.auth)
  const [pdfName, setPdfName] = useState('')

  const componentRef = useRef();
  const onBeforeContentResolve = useRef(null)
  const onBeforeContentResolveDetail = useRef(null)

  useEffect(() => {

  }, [multipleCostings])

  // useEffect(() => {
  //   
  // }, [showWarningMsg])

  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology)

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

  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology)
  }, [topAndLeftMenuData, selectedTechnology])

  useEffect(() => {
    if (viewCostingData && viewCostingData.length === 1) {
      viewBop(0)
      viewRM(0)
      viewConversionCost(0)
      viewSurfaceTreatmentCost(0)
      overHeadProfit(0)
      viewToolCostData(0)
      viewPackagingAndFrieghtData(0)
      setIsViewPackagingFreight(false)
      setIsViewOverheadProfit(false)
      setIsViewToolCost(false)
      setIsViewRM(false)
      setIsViewConversionCost(false)
      setViewBOP(false)
      setPdfName(viewCostingData[0].partId)
      console.log('viewCostingData[0]: ', viewCostingData[0].partId);
    }
  }, [viewCostingData])



  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData, selectedTechnology) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === COSTING);
      const accessData = Data && Data.Pages.find(el => el.PageName === getTechnologyPermission(selectedTechnology))
      const permmisionData = accessData?.Actions && checkPermission(accessData.Actions)
      if (permmisionData !== undefined) {
        setAddAccessibility(permmisionData?.Add ? permmisionData.Add : false)
        setEditAccessibility(permmisionData?.Edit ? permmisionData.Edit : false)
      }
    }
  }

  /**
   * @method ViewBOP
   * @description SET VIEW BOP DATA FOR DRAWER
   */
  const viewBop = (index) => {
    setViewBOP(true)
    setIsViewConversionCost(false)
    if (index !== -1) {
      let data = viewCostingData[index].netBOPCostView
      let bopPHandlingCharges = viewCostingData[index].bopPHandlingCharges
      let bopHandlingPercentage = viewCostingData[index].bopHandlingPercentage
      let childPartBOPHandlingCharges = viewCostingData[index].childPartBOPHandlingCharges
      let IsAssemblyCosting = viewCostingData[index].IsAssemblyCosting
      setViewBOPData({ BOPData: data, bopPHandlingCharges: bopPHandlingCharges, bopHandlingPercentage: bopHandlingPercentage, childPartBOPHandlingCharges: childPartBOPHandlingCharges, IsAssemblyCosting: IsAssemblyCosting })
    }
  }

  /**
   * @method viewConversionCostData
   * @description SET COVERSION DATA FOR DRAWER
   */
  const viewConversionCost = (index) => {
    setIsViewConversionCost(true)
    setViewBOP(false)
    setIndex(index)
    if (index !== -1) {
      let data = viewCostingData[index].netConversionCostView
      let netTransportationCostView = viewCostingData[index].netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index].surfaceTreatmentDetails
      let IsAssemblyCosting = viewCostingData[index].IsAssemblyCosting
      setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails, IsAssemblyCosting: IsAssemblyCosting, isSurfaceTreatmentCost: false })
    }
  }


  /**
 * @method viewSurfaceTreatmentCostData
 * @description SET SURFACE TREATMENT DATA FOR DRAWER  :REUSED CONVERSION COST DRAWER
 */
  const viewSurfaceTreatmentCost = (index) => {

    setIsViewConversionCost(true)
    setViewBOP(false)
    if (index !== -1) {
      let data = viewCostingData[index].netConversionCostView
      let netTransportationCostView = viewCostingData[index].netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index].surfaceTreatmentDetails
      let IsAssemblyCosting = viewCostingData[index].IsAssemblyCosting
      setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails, IsAssemblyCosting: IsAssemblyCosting, isSurfaceTreatmentCost: true })
    }

  }

  /**
   * @method viewRM
   * @description SET RM DATA FOR DRAWER
   */
  const viewRM = (index) => {
    let data = viewCostingData[index].netRMCostView
    setIsAssemblyCosting(viewCostingData[index].IsAssemblyCosting)
    setIsViewRM(true)
    setIndex(index)
    setViewRMData(data)
    setrmMBDetail({
      MasterBatchTotal: viewCostingData[index].masterBatchTotal,
      MasterBatchRMPrice: viewCostingData[index].masterBatchRMPrice,
      MasterBatchPercentage: viewCostingData[index].masterBatchPercentage,
      IsApplyMasterBatch: viewCostingData[index].isApplyMasterBatch
    })
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
    let IccPaymentData = viewCostingData[index].netPaymentIccCostView


    setIsViewOverheadProfit(true)
    setViewOverheadData(overHeadData)
    setViewProfitData(profitData)
    setIccPaymentData(IccPaymentData)
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


  const viewAttachmentData = (index) => {


    let data = viewCostingData[index].attachment
    setAttachment(true)
    setViewAttachment(index)
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
          dispatch(getBriefCostingById(res.data.Data.CostingId, () => {
            setPartInfo(res.data.Data)

            showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
          }))
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
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? tempData.destinationPlantId : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration?.IsDestinationPlantConfigure ? tempData.destinationPlantName : '',
        DestinationPlantCode: initialConfiguration?.IsDestinationPlantConfigure ? tempData.destinationPlantCode : '',
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
      dispatch(getBriefCostingById('', (res) => { }))
      dispatch(createVBCCosting(data, (res) => {
        if (res.data.Result) {

          dispatch(getBriefCostingById(res.data.Data.CostingId, () => {
            showDetail(res.data.Data, { costingId: res.data.Data.CostingId, type })
            setPartInfo(res.data.Data)
          }))
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

    let tempData = viewCostingData[index]
    const type = viewCostingData[index].zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      dispatch(getBriefCostingById(tempData.costingId, (res) => {
        history.push('/costing')
        showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
      }))
    }
    if (type === VBC) {
      dispatch(getBriefCostingById(tempData.costingId, (res) => {
        if (res.data.Result) {
          history.push('/costing')
          showDetail(partInfoStepTwo, { costingId: tempData.costingId, type })
        }


      }))
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
          obj.variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].oldPoPrice : 0) - Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0)
          let consumptionQty;
          let remainingQty;
          let annualImpact;
          let yearImpact;
          let date = viewCostingData[index].effectiveDate
          if (viewCostingData[index].effectiveDate) {
            let variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].oldPoPrice : 0) - Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0)
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
      Toaster.warning('Please select at least one costing to send for approval')
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


  const reducer = (array) => {
    const arr = array.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.GrossWeight
    }, 0)

    return checkForDecimalAndNull(arr, initialConfiguration.NoOfDecimalForInputOutput)
  }


  const reducerFinish = (array) => {
    const arr = array.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.FinishWeight
    }, 0)

    return checkForDecimalAndNull(arr, initialConfiguration.NoOfDecimalForInputOutput)
  }
  const reactToPrintTriggerDetail = useCallback(() => {
    return <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length === 1 ? false : true}> <div className='pdf-detail'></div>  D </button>
  }, [viewCostingData])

  const handleAfterPrintDetail = () => {
    setDrawerDetailPDF(false)
    setPdfHead(false)
    setLoader(false)
  }
  const handleOnBeforeGetContentDetail = () => {
    setLoader(true)
    setDrawerDetailPDF(true)
    return new Promise((resolve) => {
      onBeforeContentResolveDetail.current = resolve;
      setTimeout(() => {
        resolve();
      }, 1500);
    })
  }
  const handleAfterPrint = () => {
    setPdfHead(false)
    setLoader(false)
  }
  const handleOnBeforeGetContent = () => {
    setLoader(true)
    setPdfHead(true)
    return new Promise((resolve) => {
      onBeforeContentResolve.current = resolve
      setTimeout(() => {
        resolve();
      }, 1500);
    })
  }
  const reactToPrintTrigger = useCallback(() => {
    return (simulationMode ? <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length > 3 ? true : false}> <div className='pdf-detail'></div></button> : <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length > 2 ? true : false}> <div className='pdf-detail'></div></button>)
  }, [viewCostingData])

  const reactToPrintContent = () => {
    return componentRef.current;
  };

  return (
    <Fragment>
      {
        stepOne &&
        <Fragment>
          {(loader && <LoaderCustom customClass="pdf-loader" />)}
          <Row>
            {!viewMode && (
              <Col md="4">
                <div className="left-border">{'Summary'}</div>
              </Col>
            )}

            <Col md={simulationMode ? "12" : "8"} className="text-right">
              {!simulationMode &&
                <ReactToPrint
                  bodyClass='mx-2 my-3 remove-space-border'
                  documentTitle={`${pdfName}-detailed-costing`}
                  content={reactToPrintContent}
                  onAfterPrint={handleAfterPrintDetail}
                  onBeforeGetContent={handleOnBeforeGetContentDetail}
                  trigger={reactToPrintTriggerDetail}
                />
              }
              {!simulationDrawer && <ReactToPrint
                bodyClass={`my-3 ${simulationMode ? 'mx-1 simulation-print' : 'mx-2'}`}
                documentTitle={`${simulationMode ? 'Compare-costing.pdf' : `${pdfName}-costing`}`}
                content={reactToPrintContent}
                onAfterPrint={handleAfterPrint}
                onBeforeGetContent={handleOnBeforeGetContent}
                trigger={reactToPrintTrigger}
              />}
              {
                !simulationMode && <>

                  {(!viewMode && !isFinalApproverShow) && (
                    <button class="user-btn mr-1 mb-2 approval-btn" disabled={isWarningFlag} onClick={() => checkCostings()}>
                      <div className="send-for-approval"></div>
                      {'Send For Approval'}
                    </button>
                  )}
                  <button
                    type="button"
                    className={'user-btn mb-2 comparison-btn'}
                    onClick={addComparisonDrawerToggle}
                  >
                    <div className="compare-arrows"></div>
                    Add To Comparison{' '}
                  </button>
                  {isWarningFlag && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'A costing is pending for approval for this part or one of it\'s child part. Please approve that first'} />}
                  {(showWarningMsg && !warningMsg) && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Costing for this part/Assembly is not yet done!'} />}
                </>}
            </Col>
          </Row>
          <div ref={componentRef}>
            <Row id="summaryPdf" className={`${customClass} ${drawerDetailPDF ? 'remove-space-border' : ''} ${simulationMode ? "simulation-print" : ""}`}>
              {(drawerDetailPDF || pdfHead) &&
                <>
                  <Col md="12" className='pdf-header-wrapper d-flex justify-content-between'>
                    <img src={Logo} alt={'Compnay-logo'} />
                    <img src={cirHeader} alt={'Cost it right'} />
                  </Col>
                  {/* <Col md="12">
                    <h3>Costing Summary:</h3>
                  </Col> */}
                </>}

              <Col md="12">
                <div class="table-responsive">
                  <table class="table table-bordered costing-summary-table">
                    <thead>
                      <tr className="main-row">
                        {
                          isApproval ? <th scope="col" className='approval-summary-headers'>{props.id}</th> : <th scope="col" className='header-name-left'>VBC/ZBC</th>
                        }

                        {viewCostingData &&
                          viewCostingData.map((data, index) => {

                            return (
                              <th scope="col" className='header-name'>
                                <div class="element w-60 d-inline-flex align-items-center">
                                  {
                                    (data.status === DRAFT || data.status === REJECTED) && <>
                                      {!pdfHead && !drawerDetailPDF && <div class="custom-check1 d-inline-block">
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
                                      </div>}
                                    </>
                                  }
                                  {
                                    isApproval ? <span>{data.CostingHeading}</span> : <span className="checkbox-text">{data.zbc === 0 ? `ZBC(${data.plantName})` : data.zbc === 1 ? `${data.vendorName}(${data.vendorCode}) ${localStorage.IsVendorPlantConfigurable ? `(${data.vendorPlantName})` : ''}` : 'CBC'}{` (SOB: ${data.shareOfBusinessPercent}%)`}</span>
                                  }
                                </div>
                                {(!viewMode && icons) && (!pdfHead && !drawerDetailPDF) && (
                                  <div class="action w-40 d-inline-block text-right">
                                    {EditAccessibility && (data.status === DRAFT || data.status === REJECTED) && <button className="Edit mr-1 mb-0 align-middle" type={"button"} title={"Edit Costing"} onClick={() => editCostingDetail(index)} />}
                                    {AddAccessibility && <button className="Add-file mr-1 mb-0 align-middle" type={"button"} title={"Add Costing"} onClick={() => addNewCosting(index)} />}
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
                              <span className="d-block">Costing Version</span>
                              <span className="d-block">PO Price</span>
                              <span className="d-block">Part Number</span>
                              <span className="d-block">Part Name</span>
                              <span className="d-block">Plant Name</span>

                            </td>
                            {viewCostingData &&
                              viewCostingData.map((data, index) => {
                                return (
                                  <td>
                                    <span class="d-flex justify-content-between bg-grey">
                                      {`${DayTime(data.costingDate).format('DD-MM-YYYY')}-${data.CostingNumber}-${data.status}`}{' '}
                                      {
                                        !viewMode &&
                                        <a
                                          class="text-primary d-inline-block change-version-block"
                                          onClick={() => editHandler(index)}
                                        >
                                          {(!drawerDetailPDF && !pdfHead) && <small>Change version</small>}
                                        </a>
                                      }
                                    </span>
                                    <span class="d-block">{checkForDecimalAndNull(data.poPrice, initialConfiguration.NoOfDecimalForPrice)}</span>
                                    <span class="d-block">{data.partId}</span>
                                    <span class="d-block">{data.partName}</span>
                                    <span class="d-block">{data.zbc === 0 ? data.plantName : data.destinationPlantName}</span>

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

                      {!drawerDetailPDF ? <tr>
                        <td>
                          <span class="d-block small-grey-text">RM Name-Grade</span>
                          <span class="d-block small-grey-text">RM Rate</span>
                          <span class="d-block small-grey-text">Scrap Rate</span>
                          <span class="d-block small-grey-text">Gross Weight</span>
                          <span class="d-block small-grey-text">Finish Weight</span>
                          <span class="d-block small-grey-text">Burning Loss Weight</span>
                          <span class="d-block small-grey-text">Scrap Weight</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData.map((data) => {
                            return (


                              < td >
                                <span class="d-block small-grey-text">{data.CostingHeading !== VARIANCE ? data.netRMCostView && (data.netRMCostView.length > 1 || data.IsAssemblyCosting === true) ? 'Multiple RM' : data.rm : ''}</span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.netRMCostView && (data.netRMCostView.length > 1 || data.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data.netRMCostView && data.netRMCostView[0] && data.netRMCostView[0].RMRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.netRMCostView && (data.netRMCostView.length > 1 || data.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data.netRMCostView && data.netRMCostView[0] && data.netRMCostView[0].ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {/* try with component */}
                                  {data.CostingHeading !== VARIANCE ? data.IsAssemblyCosting === true ? "Multiple RM" : (data.netRMCostView && reducer(data.netRMCostView)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.IsAssemblyCosting === true ? "Multiple RM" : (data.netRMCostView && reducerFinish(data.netRMCostView)) : ''}
                                  {/* {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.netRMCostView && (data.netRMCostView.length > 1 || data.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data.netRMCostView && data.netRMCostView[0] && data.netRMCostView[0].BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                                  {/* {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.netRMCostView && (data.netRMCostView.length > 1 || data.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data.netRMCostView[0]?.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                                </span>
                              </td>
                            )
                          })}
                      </tr> : <tr><th colSpan={2} className='py-0'>
                        <ViewRM
                          isOpen={isViewRM}
                          viewRMData={viewRMData}
                          closeDrawer={closeViewDrawer}
                          isAssemblyCosting={isAssemblyCosting}
                          anchor={'right'}
                          index={index}
                          technologyId={technologyId}
                          rmMBDetail={rmMBDetail}
                          isPDFShow={true}
                        />
                      </th></tr>}

                      <tr className={`background-light-blue  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].netRM > viewCostingData[1].netRM ? 'green-row' : viewCostingData[0].netRM < viewCostingData[1].netRM ? 'red-row' : '' : '-'}`}>
                        <th>Net RM Cost {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) && '(Old)'}</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>
                                <span>{checkForDecimalAndNull(data.netRM, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    class="float-right mb-0 View "
                                    onClick={() => viewRM(index)}
                                  >
                                  </button>
                                }
                              </td>
                            )
                          })}
                      </tr>
                      {drawerDetailPDF && <tr><th className='py-0' colSpan={2}> <ViewBOP
                        isOpen={isViewBOP}
                        viewBOPData={viewBOPData}
                        closeDrawer={closeViewDrawer}
                        anchor={'right'}
                        isPDFShow={true}
                      /></th></tr>}
                      <tr className={`background-light-blue  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].netBOP > viewCostingData[1].netBOP ? 'green-row' : viewCostingData[0].netBOP < viewCostingData[1].netBOP ? 'red-row' : '' : '-'}`}>
                        <th>Net BOP Cost {simulationDrawer && (Number(master) === Number(BOPDOMESTIC) || Number(master) === Number(BOPIMPORT)) && '(Old)'}</th>

                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>
                                <span>{checkForDecimalAndNull(data.netBOP, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
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
                      {!drawerDetailPDF ? <tr>
                        <td>
                          <span class="d-block small-grey-text">Process Cost</span>
                          <span class="d-block small-grey-text">Operation Cost</span>
                          <span class="d-block small-grey-text">Other Operation Cost</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData.map((data) => {
                            return (
                              <td>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? (data.IsAssemblyCosting === true ? "Multiple Process" : checkForDecimalAndNull(data.pCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? (data.IsAssemblyCosting === true ? "Multiple Operation" : checkForDecimalAndNull(data.oCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? (data.IsAssemblyCosting === true ? "Multiple Other Operation" : checkForDecimalAndNull(data.netOtherOperationCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                              </td>
                            )
                          })}
                      </tr> : <tr><th className='py-0' colSpan={2}>
                        <ViewConversionCost
                          isOpen={isViewConversionCost}
                          viewConversionCostData={viewConversionCostData}
                          closeDrawer={closeViewDrawer}
                          anchor={'right'}
                          index={index}
                          isPDFShow={true}
                          stCostShow={false}

                        />
                      </th></tr>}

                      <tr className={`background-light-blue  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nConvCost > viewCostingData[1].nConvCost ? 'green-row' : viewCostingData[0].nConvCost < viewCostingData[1].nConvCost ? 'red-row' : '' : '-'}`}>
                        <th>Net Conversion Cost{simulationDrawer && (Number(master) === Number(OPERATIONS)) && '(Old)'}</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>

                                <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.nConvCost, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data.nConvCost, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
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
                      {!drawerDetailPDF ? <tr>
                        <td>
                          <span class="d-block small-grey-text">
                            Surface Treatment
                          </span>
                          <span class="d-block small-grey-text">
                            Extra Surface Treatment Cost
                          </span>
                        </td>
                        {viewCostingData &&
                          viewCostingData.map((data) => {
                            return (
                              <td>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.sTreatment, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.tCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                              </td>
                            )
                          })}
                      </tr> : <tr><th className='py-0' colSpan={2}>
                        <ViewConversionCost
                          isOpen={isViewConversionCost}
                          viewConversionCostData={viewConversionCostData}
                          closeDrawer={closeViewDrawer}
                          anchor={'right'}
                          index={index}
                          isPDFShow={true}
                          stCostShow={true}
                        />
                      </th></tr>}



                      <tr className={`background-light-blue  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nsTreamnt > viewCostingData[1].nsTreamnt ? 'green-row' : viewCostingData[0].nsTreamnt < viewCostingData[1].nsTreamnt ? 'red-row' : '' : '-'}`}>
                        <th>Net Surface Treatment Cost{simulationDrawer && (Number(master) === Number(SURFACETREATMENT)) && '(Old)'}</th>

                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              < td >
                                <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.netSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data.netSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons && !(Number(master) === Number(SURFACETREATMENT))) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    class="float-right mb-0 View "
                                    onClick={() => viewSurfaceTreatmentCost(index)}
                                  >
                                  </button>
                                }
                              </td>
                            )
                          })}
                      </tr>


                      {!drawerDetailPDF ? <tr>
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
                      </tr> : <tr><td colSpan={2} className='pb-0'><ViewOverheadProfit
                        isOpen={isViewOverheadProfit}
                        overheadData={viewOverheadData}
                        profitData={viewProfitData}
                        rejectAndModelType={viewRejectAndModelType}
                        iccPaymentData={iccPaymentData}
                        closeDrawer={closeViewDrawer}
                        anchor={'right'}
                        isPDFShow={true}
                      /></td></tr>}

                      <tr class={`background-light-blue ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nOverheadProfit > viewCostingData[1].nOverheadProfit ? 'green-row' : viewCostingData[0].nOverheadProfit < viewCostingData[1].nOverheadProfit ? 'red-row' : ' ' : '-'}`}>
                        <th>Net Overheads & Profits</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>
                                <span>{checkForDecimalAndNull(data.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
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

                      {!drawerDetailPDF ? <tr>
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
                      </tr> : <tr><th colSpan={2}><ViewPackagingAndFreight
                        isOpen={isViewPackagingFreight}
                        packagingAndFreightCost={viewPackagingFreight}
                        closeDrawer={closeViewDrawer}
                        anchor={'right'}
                        isPDFShow={true} /></th></tr>}

                      <tr class="background-light-blue">
                        <th>Net Packaging & Freight</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>
                                <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
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

                      {!drawerDetailPDF ? <tr>
                        <td>

                          <span class="d-block small-grey-text"></span>
                          <span class="d-block small-grey-text">Tool Maintenance Applicability</span>
                          <span class="d-block small-grey-text">Tool Maintenance Cost</span>
                          <span class="d-block small-grey-text">Tool Price</span>
                          <span class="d-block small-grey-text">Amortization Quantity (Tool Life)</span>
                          <span class="d-block small-grey-text">Tool Amortization Cost</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData.map((data) => {
                            return (
                              <td className={` ${pdfHead || drawerDetailPDF ? '' : ''}`}>
                                <div class="d-flex mt7">
                                  <span class="d-inline-block w-50">
                                    {data.CostingHeading !== VARIANCE ? data.toolApplicability.applicability : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50">
                                    {data.CostingHeading !== VARIANCE ? data.toolApplicability.value : ''}
                                  </span>
                                </div>
                                <div className="d-flex">
                                  <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.toolApplicabilityValue.toolTitle : ''}</span> &nbsp;{' '}
                                  <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.toolApplicabilityValue.toolValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                </div>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.toolPrice, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.amortizationQty : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data.CostingHeading !== VARIANCE ? data.toolAmortizationCost : ''}
                                </span>
                              </td>
                            )
                          })}
                      </tr> : <tr><th colSpan={2} className='py-0'> <ViewToolCost
                        isOpen={isViewToolCost}
                        viewToolCost={viewToolCost}
                        closeDrawer={closeViewDrawer}
                        anchor={'right'}
                        isPDFShow={true}
                      /> </th> </tr>}

                      <tr class="background-light-blue">
                        <th>Net Tool Cost</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (
                              <td>
                                <span>{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.totalToolCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                {
                                  (data.CostingHeading !== VARIANCE && icons) && (!pdfHead && !drawerDetailPDF) &&
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
                      <tr className='border-right'>
                        <td width={"20%"}>
                          <span class="d-block small-grey-text">
                            Hundi/Other Discount
                          </span>
                          <span class="d-block small-grey-text"></span>
                        </td>
                        { }
                        {viewCostingData &&
                          viewCostingData.map((data) => {
                            return (
                              data.CostingHeading !== VARIANCE ?
                                <td width={"32%"}>
                                  <div className="d-grid">
                                    {/* <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.otherDiscount.discount : ''}</span> &nbsp;{' '}
                                <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.otherDiscount.value : ''}</span> */}
                                    <span className="d-inline-block ">{"Type"}</span>
                                    <span className="d-inline-block ">{"Applicability"}</span>
                                    <span className="d-inline-block ">{"Value"}</span>
                                    <span className="d-inline-block ">{"Cost"}</span>
                                  </div>
                                  <div className="d-grid">
                                    <span className="d-inline-block small-grey-text">
                                      {data.CostingHeading !== VARIANCE ? data.otherDiscountValue.dicountType : ''}
                                    </span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE && data.otherDiscountValue.dicountType === "Percentage" ? data.otherDiscountValue.discountApplicablity : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE && data.otherDiscountValue.dicountType === "Percentage" ? checkForDecimalAndNull(data.otherDiscountValue.discountPercentValue, initialConfiguration.NoOfDecimalForPrice) : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.otherDiscountValue.discountValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                  </div>

                                </td>
                                : ""


                            )
                          })}
                      </tr>
                      { }
                      <tr className='border-right'>
                        <td>
                          <span class="d-block small-grey-text"> Any Other Cost</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (

                              data.CostingHeading !== VARIANCE ?
                                <td width={"32%"}>
                                  <div className="d-grid">

                                    <span className="d-inline-block">{"Type"}</span>
                                    <span className="d-inline-block">{"Applicability"}</span>
                                    <span className="d-inline-block">{"Value"}</span>
                                    <span className="d-inline-block">{"Cost"}</span>
                                  </div>
                                  <div className="d-grid">
                                    <span className="d-inline-block small-grey-text">
                                      {data.CostingHeading !== VARIANCE ? data.anyOtherCostType : ''}
                                    </span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE && data.anyOtherCostType === "Percentage" ? data.anyOtherCostApplicablity : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE && data.anyOtherCostType === "Percentage" ? checkForDecimalAndNull(data.anyOtherCostPercent, initialConfiguration.NoOfDecimalForPrice) : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data.anyOtherCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                  </div>
                                </td>
                                : ""

                            )
                          })}
                      </tr>
                      {

                        <tr class={`background-light-blue netPo-row ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nPOPrice > viewCostingData[1].nPOPrice ? 'green-row' : viewCostingData[0].nPOPrice < viewCostingData[1].nPOPrice ? 'red-row' : '' : '-'}`}>
                          <th>Net PO Price (INR){simulationDrawer && '(Old)'}</th>
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
                                  <span className={`d-inline-block w-50 small-grey-text ${VARIANCE ? 'd-none' : ''} `}>{data.CostingHeading !== VARIANCE ? data.currency.currencyTitle : ''}</span> {' '}
                                  <span className="d-inline-block w-50 ">{data.CostingHeading !== VARIANCE ? data.currency.currencyValue === '-' ? '-' : checkForDecimalAndNull(data.currency.currencyValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                </div>
                              </td>
                            )
                          })}
                      </tr>
                      {

                        <tr class={`background-light-blue netRm-row  ${isApproval ? viewCostingData.length > 0 && viewCostingData[0].nPOPriceWithCurrency > viewCostingData[1].nPOPriceWithCurrency ? 'green-row' : viewCostingData[0].nPOPriceWithCurrency < viewCostingData[1].nPOPriceWithCurrency ? 'red-row' : '' : '-'}`}>
                          <th>Net PO Price ({(viewCostingData[0]?.currency?.currencyTitle) !== "-" ? viewCostingData[0]?.currency?.currencyTitle : 'INR'}){simulationDrawer && '(Old)'}</th>
                          {/* {viewCostingData &&
                        viewCostingData.map((data, index) => {
                          return <td>Net PO Price({(data.currency.currencyTitle !== '-' ? data.currency.currencyTitle : 'INR')})</td>
                        })} */}


                          {viewCostingData &&
                            viewCostingData.map((data, index) => {

                              return <td>{data.nPOPriceWithCurrency !== null ? checkForDecimalAndNull((viewCostingData[0]?.currency?.currencyTitle) !== "-" ? (data.nPOPriceWithCurrency) : data.nPOPrice, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            })}
                        </tr>
                      }

                      <tr>
                        <td>Attachments</td>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return (

                              <td>
                                {
                                  data.CostingHeading !== VARIANCE &&
                                    data.attachment && data.attachment.length == 0 ? (
                                    'No attachment found'
                                  ) : data.attachment.length == 1 ? (

                                    <>
                                      {data.attachment && data.CostingHeading !== VARIANCE &&
                                        data.attachment.map((f) => {
                                          const withOutTild = f.FileURL
                                            ? f.FileURL.replace('~', '')
                                            : ''
                                          const fileURL = `${FILE_URL}${withOutTild}`
                                          return (
                                            <td>
                                              <div className={"single-attachment images"}>
                                                <a href={fileURL} target="_blank" rel="noreferrer">
                                                  {f.OriginalFileName}
                                                </a>
                                              </div>
                                            </td>
                                          )
                                        })}
                                    </>
                                  )
                                    : (

                                      <a
                                        href="javascript:void(0)"
                                        onClick={() => viewAttachmentData(index)}
                                      > {data.CostingHeading !== VARIANCE ? 'View Attachment' : ''}</a>
                                    )
                                }
                              </td>
                            )
                          })}
                      </tr>

                      <tr>
                        <th>Remarks</th>
                        {viewCostingData &&
                          viewCostingData.map((data, index) => {
                            return <td><span className="d-block small-grey-text">{data.CostingHeading !== VARIANCE ? data.remark : ''}</span></td>
                          })}
                      </tr>

                      {(!viewMode) && (
                        <tr class="background-light-blue">
                          <td className="text-center"></td>

                          {viewCostingData.map((data, index) => {

                            return (

                              <td class="text-center costing-summary">
                                {(!viewMode && !isFinalApproverShow) &&
                                  (data.status === DRAFT && icons) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    class="user-btn"
                                    disabled={isWarningFlag}
                                    onClick={() => {
                                      sendForApprovalData([data.costingId], index)
                                      setShowApproval(true)
                                    }}
                                  ><div className="send-for-approval"></div>
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
          </div>
        </Fragment>
      }
      {
        addComparisonToggle && (
          <AddToComparisonDrawer
            isOpen={addComparisonToggle}
            closeDrawer={closeAddComparisonDrawer}
            isEditFlag={isEditFlag}
            editObject={editObject}
            anchor={'right'}
            viewMode={viewMode}
          />
        )
      }
      {/* DRAWERS FOR VIEW  */}
      {
        isViewBOP && (
          <ViewBOP
            isOpen={isViewBOP}
            viewBOPData={viewBOPData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        isViewConversionCost && (
          <ViewConversionCost
            isOpen={isViewConversionCost}
            viewConversionCostData={viewConversionCostData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
            index={index}
            isPDFShow={false}
          />
        )
      }
      {
        isViewRM && (
          <ViewRM
            isOpen={isViewRM}
            viewRMData={viewRMData}
            closeDrawer={closeViewDrawer}
            isAssemblyCosting={isAssemblyCosting}
            anchor={'right'}
            index={index}
            technologyId={technologyId}
            rmMBDetail={rmMBDetail}
          />
        )
      }
      {
        isViewOverheadProfit && (
          <ViewOverheadProfit
            isOpen={isViewOverheadProfit}
            overheadData={viewOverheadData}
            profitData={viewProfitData}
            rejectAndModelType={viewRejectAndModelType}
            iccPaymentData={iccPaymentData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        isViewPackagingFreight && (
          <ViewPackagingAndFreight
            isOpen={isViewPackagingFreight}
            packagingAndFreightCost={viewPackagingFreight}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        isViewToolCost && (
          <ViewToolCost
            isOpen={isViewToolCost}
            viewToolCost={viewToolCost}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        showApproval && (
          <SendForApproval
            isOpen={showApproval}
            closeDrawer={closeShowApproval}
            anchor={'right'}
          />
        )
      }
      {
        isAttachment && (
          <Attachament
            isOpen={isAttachment}
            index={viewAtttachments}
            closeDrawer={closeAttachmentDrawer}
            anchor={'right'}
          />
        )
      }
    </Fragment >
  )
}

export default CostingSummaryTable
