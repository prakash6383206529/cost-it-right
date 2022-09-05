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
import { checkForDecimalAndNull, checkForNull, checkPermission, formViewData, getTechnologyPermission, loggedInUserId, userDetails, allEqual, getConfigurationKey, getCurrencySymbol } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { BOPDOMESTIC, BOPIMPORT, COSTING, DRAFT, EMPTY_GUID_0, FILE_URL, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, VARIANCE, VBC, ZBC, VIEW_COSTING_DATA } from '../../../config/constants'
import { useHistory } from "react-router-dom";
import WarningMessage from '../../common/WarningMessage'
import DayTime from '../../common/DayTimeWrapper'
import { getVolumeDataByPartAndYear } from '../../masters/actions/Volume'
import { isFinalApprover } from '../actions/Approval';
import cirHeader from "../../../assests/images/logo/CIRlogo.jpg";
import Logo from '../../../assests/images/logo/company-logo.svg';
import LoaderCustom from '../../common/LoaderCustom'
import ReactToPrint from 'react-to-print';
import BOMViewer from '../../masters/part-master/BOMViewer';
import _ from 'lodash'
import ReactExport from 'react-export-excel';

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const CostingSummaryTable = (props) => {
  const { viewMode, showDetail, technologyId, costingID, showWarningMsg, simulationMode, isApproval, simulationDrawer, customClass, selectedTechnology, master, isSimulationDone, approvalMode, drawerViewMode, costingSummaryMainPage } = props
  let history = useHistory();
  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

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
  const [loader, setLoader] = useState(false);
  const [isAttachment, setAttachment] = useState(false)
  /*CONSTANT FOR  CREATING AND EDITING COSTING*/
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [index, setIndex] = useState('')
  const [excelArray, setExcelArray] = useState([])

  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [iccPaymentData, setIccPaymentData] = useState("")

  const [warningMsg, setShowWarningMsg] = useState(false)
  const [isLockedState, setIsLockedState] = useState(false)

  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const partNumber = useSelector(state => state.costing.partNo);
  const { initialConfiguration, topAndLeftMenuData } = useSelector(state => state.auth)
  const [pdfName, setPdfName] = useState('')
  const [IsOpenViewHirarchy, setIsOpenViewHirarchy] = useState(false);
  const [viewBomPartId, setViewBomPartId] = useState("");
  const [dataSelected, setDataSelected] = useState([]);
  const [DownloadAccessibility, setDownloadAccessibility] = useState(false);


  const componentRef = useRef();
  const onBeforeContentResolve = useRef(null)
  const onBeforeContentResolveDetail = useRef(null)


  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology)

    if (!viewMode && viewCostingData && partInfo) {
      let obj = {}
      obj.TechnologyId = partInfo.TechnologyId
      obj.DepartmentId = '00000000-0000-0000-0000-000000000000'
      obj.LoggedInUserLevelId = userDetails().LoggedInLevelId
      obj.LoggedInUserId = userDetails().LoggedInUserId

      dispatch(isFinalApprover(obj, res => {
        if (res.data?.Result) {
          setIsFinalApproverShow(res.data?.Data?.IsFinalApprovar) // UNCOMMENT IT AFTER DEPLOTED FROM KAMAL SIR END
          // setIsFinalApproverShow(false)
        }
      }))
    }

  }, [])

  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology)
  }, [topAndLeftMenuData, selectedTechnology])

  useEffect(() => {
    if (viewCostingData && viewCostingData?.length === 1) {
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
      setPdfName(viewCostingData[0]?.partNumber)
    }
    viewCostingData.map(item => {
      if (item.IsApprovalLocked) {
        setIsLockedState(true)
      }
      return null
    })

  }, [viewCostingData])



  const closeVisualDrawer = () => {
    setIsOpenViewHirarchy(false)
  }

  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  const applyPermission = (topAndLeftMenuData, selectedTechnology) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData?.find(el => el.ModuleName === COSTING);
      const accessData = Data && Data?.Pages.find(el => el.PageName === getTechnologyPermission(selectedTechnology))
      const permmisionData = accessData?.Actions && checkPermission(accessData?.Actions)
      if (permmisionData !== undefined) {
        setAddAccessibility(permmisionData?.Add ? permmisionData?.Add : false)
        setEditAccessibility(permmisionData?.Edit ? permmisionData?.Edit : false)
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
      let data = viewCostingData[index]?.netBOPCostView
      let bopPHandlingCharges = viewCostingData[index]?.bopPHandlingCharges
      let bopHandlingPercentage = viewCostingData[index]?.bopHandlingPercentage
      let childPartBOPHandlingCharges = viewCostingData[index]?.childPartBOPHandlingCharges
      let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
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
      let data = viewCostingData[index]?.netConversionCostView
      let netTransportationCostView = viewCostingData[index]?.netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index]?.surfaceTreatmentDetails
      let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
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
      let data = viewCostingData[index]?.netConversionCostView
      let netTransportationCostView = viewCostingData[index]?.netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index]?.surfaceTreatmentDetails
      let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
      setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails, IsAssemblyCosting: IsAssemblyCosting, isSurfaceTreatmentCost: true })
    }
  }

  /**
   * @method viewRM
   * @description SET RM DATA FOR DRAWER
   */
  const viewRM = (index) => {
    let data = viewCostingData[index]?.netRMCostView
    setIsAssemblyCosting(viewCostingData[index]?.IsAssemblyCosting)
    setIsViewRM(true)
    setIndex(index)
    setViewRMData(data)
    setrmMBDetail({
      MasterBatchTotal: viewCostingData[index]?.masterBatchTotal,
      MasterBatchRMPrice: viewCostingData[index]?.masterBatchRMPrice,
      MasterBatchPercentage: viewCostingData[index]?.masterBatchPercentage,
      IsApplyMasterBatch: viewCostingData[index]?.isApplyMasterBatch
    })
  }

  /**
   * @method overHeadProfit
   * @description SET OVERHEAD & PROFIT DATA FOR DRAWER
   */
  const overHeadProfit = (index) => {
    let overHeadData = viewCostingData[index]?.netOverheadCostView
    let profitData = viewCostingData[index]?.netProfitCostView
    let rejectData = viewCostingData[index]?.netRejectionCostView
    let modelType = viewCostingData[index]?.modelType
    let IccPaymentData = viewCostingData[index]?.netPaymentIccCostView


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
    let packagingData = viewCostingData[index]?.netPackagingCostView
    let freightData = viewCostingData[index]?.netFreightCostView

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
    let data = viewCostingData[index]?.netToolCostView
    setIsViewToolCost(true)
    setViewToolCost(data)
  }


  const viewAttachmentData = (index) => {
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
      plantId: viewCostingData[index]?.plantId,
      plantName: viewCostingData[index]?.plantName,
      costingId: viewCostingData[index]?.costingId,
      CostingNumber: viewCostingData[index]?.costingName,
      index: index,
      typeOfCosting: viewCostingData[index]?.zbc,
      VendorId: viewCostingData[index]?.vendorId,
      vendorName: viewCostingData[index]?.vendorName,
      vendorPlantName: viewCostingData[index]?.vendorPlantName,
      vendorPlantId: viewCostingData[index]?.vendorPlantId,
      destinationPlantCode: viewCostingData[index]?.destinationPlantCode,
      destinationPlantName: viewCostingData[index]?.destinationPlantName,
      destinationPlantId: viewCostingData[index]?.destinationPlantId,
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

    const userDetail = userDetails()
    let tempData = viewCostingData[index]
    const type = viewCostingData[index]?.zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      const data = {
        PartId: partNumber.partId,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: tempData?.technologyId,
        ZBCId: userDetail.ZBCSupplierInfo.VendorId,
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        PlantId: tempData?.plantId,
        PlantName: tempData?.plantName,
        PlantCode: tempData?.plantCode,
        ShareOfBusinessPercent: tempData?.shareOfBusinessPercent,
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
        if (res.data?.Result) {
          dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
            setPartInfo(res.data?.Data)

            showDetail(res.data?.Data, { costingId: res.data?.Data?.CostingId, type })
            history.push('/costing')
          }))
        }
      }),
      )

    } else if (type === VBC) {
      const data = {
        PartId: partNumber.partId,
        PartTypeId: partInfo.PartTypeId,
        PartType: partInfo.PartType,
        TechnologyId: tempData?.technologyId,
        VendorId: tempData?.vendorId,
        VendorPlantId: tempData?.vendorPlantId,
        VendorPlantName: tempData?.vendorPlantName,
        VendorPlantCode: tempData?.vendorPlantCode,
        VendorName: tempData?.vendorName,
        VendorCode: tempData?.vendorCode,
        DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure ? tempData?.destinationPlantId : EMPTY_GUID_0,
        DestinationPlantName: initialConfiguration?.IsDestinationPlantConfigure ? tempData?.destinationPlantName : '',
        DestinationPlantCode: initialConfiguration?.IsDestinationPlantConfigure ? tempData?.destinationPlantCode : '',
        UserId: loggedInUserId(),
        LoggedInUserId: loggedInUserId(),
        ShareOfBusinessPercent: tempData?.shareOfBusinessPercent,
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
      dispatch(getBriefCostingById('', (res) => {

        dispatch(createVBCCosting(data, (res) => {

          if (res.data?.Result) {
            dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
              showDetail(res.data?.Data, { costingId: res.data.Data.CostingId, type })
              setPartInfo(res.data?.Data)
              history.push('/costing')
            }))
          }
        }),
        )

      }))
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
    props?.setcostingOptionsSelectFromSummary(viewCostingData && viewCostingData[index])
    const type = viewCostingData[index]?.zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      dispatch(getBriefCostingById(tempData?.costingId, (res) => {
        history.push('/costing')
        showDetail(partInfoStepTwo, { costingId: tempData?.costingId, type })
      }))
    }
    if (type === VBC) {
      dispatch(getBriefCostingById(tempData?.costingId, (res) => {

        if (res?.data?.Result) {
          history.push('/costing')
          showDetail(partInfoStepTwo, { costingId: tempData?.costingId, type })
        }

      }))
    }
  }


  const viewBomCostingDetail = (index) => {
    setIsOpenViewHirarchy(true)
    setViewBomPartId(viewCostingData[index]?.partId)
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

  const checkWarning = (data) => {
    let final = _.map(data, 'IsApprovalLocked')
    if (final?.length === 0 || final.includes(true)) {
      setIsWarningFlag(true)
    } else {
      setIsWarningFlag(false)
    }
  }

  const moduleHandler = (id, check, data) => {
    if (check === 'top') {                                                            // WHEN USER CLICK ON TOP SEND FOR APPROVAL
      let temp = multipleCostings

      if (temp.includes(id)) {                                                        // WHEN DESELECT THE CHECKBOX  
        temp = multipleCostings.filter((item) => item !== id)                         // FILTER DESELECTED ID 
        const filteredData = dataSelected.filter((item) => item.costingId !== id)     // FLTER DATA TO SET IN ARRAY LIST 
        setDataSelected(filteredData)
        checkWarning(filteredData)
      } else {                                                                        // WHEN SELECT THE CHECKBOX 
        temp.push(id)
        const updatedArray = [...dataSelected, data]                                  // ADD SELECTED DATA IN ARRAY LIST
        setDataSelected(updatedArray)
        checkWarning(updatedArray)
      }

      setMultipleCostings(temp)
    } else {                                                                          // WHEN USER CLICK ON BOTTOM SEND FOR APPROVAL BUTTON
      setIsWarningFlag(data?.IsApprovalLocked)
      return data?.IsApprovalLocked
    }
  }

  const sendForApprovalData = (costingIds) => {

    let temp = viewApprovalData
    costingIds &&
      costingIds.map((id) => {
        let index = viewCostingData?.findIndex((data) => data?.costingId === id)
        if (index !== -1) {
          let obj = {}
          // add vendor key here
          obj.typeOfCosting = viewCostingData[index]?.zbc
          obj.plantCode = viewCostingData[index]?.plantCode
          obj.plantName = viewCostingData[index]?.plantName
          obj.plantId = viewCostingData[index]?.plantId
          obj.vendorId = viewCostingData[index]?.vendorId
          obj.vendorName = viewCostingData[index]?.vendorName
          obj.vendorCode = viewCostingData[index]?.vendorCode
          obj.vendorPlantId = viewCostingData[index]?.vendorPlantId
          obj.vendorPlantName = viewCostingData[index]?.vendorPlantName
          obj.vendorPlantCode = viewCostingData[index]?.vendorPlantCode
          obj.costingName = viewCostingData[index]?.CostingNumber
          obj.costingId = viewCostingData[index]?.costingId
          obj.oldPrice = viewCostingData[index]?.oldPoPrice
          obj.revisedPrice = viewCostingData[index]?.poPrice
          obj.nPOPriceWithCurrency = viewCostingData[index]?.nPOPriceWithCurrency
          obj.currencyRate = viewCostingData[index]?.currency.currencyValue
          obj.variance = Number(viewCostingData[index]?.poPrice && viewCostingData[index]?.poPrice !== '-' ? viewCostingData[index]?.oldPoPrice : 0) - Number(viewCostingData[index]?.poPrice && viewCostingData[index]?.poPrice !== '-' ? viewCostingData[index]?.poPrice : 0)

          let date = viewCostingData[index]?.effectiveDate
          if (viewCostingData[index]?.effectiveDate) {
            let variance = Number(viewCostingData[index]?.poPrice && viewCostingData[index]?.poPrice !== '-' ? viewCostingData[index]?.oldPoPrice : 0) - Number(viewCostingData[index]?.poPrice && viewCostingData[index]?.poPrice !== '-' ? viewCostingData[index]?.poPrice : 0)
            let month = new Date(date).getMonth()
            let year = ''
            let sequence = SEQUENCE_OF_MONTH[month]

            if (month <= 2) {
              year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
            } else {
              year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
            }
            dispatch(getVolumeDataByPartAndYear(partNumber.value ? partNumber.value : partNumber.partId, year, res => {
              if (res.data?.Result === true || res.status === 202) {
                let approvedQtyArr = res.data?.Data?.VolumeApprovedDetails
                let budgetedQtyArr = res.data?.Data?.VolumeBudgetedDetails
                let actualQty = 0
                let totalBudgetedQty = 0
                let actualRemQty = 0

                approvedQtyArr.map((data) => {
                  if (data?.Sequence < sequence) {
                    // if(data?.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
                    //   actualQty += parseInt(data?.ApprovedQuantity)
                    // }
                    actualQty += parseInt(data?.ApprovedQuantity)
                  } else if (data?.Sequence >= sequence) {
                    actualRemQty += parseInt(data?.ApprovedQuantity)
                  }
                  return null
                })
                budgetedQtyArr.map((data) => {
                  // if (data?.Sequence >= sequence) {
                  totalBudgetedQty += parseInt(data?.BudgetedQuantity)
                  return null
                  // }
                })
                obj.consumptionQty = checkForNull(actualQty)
                obj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
                obj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
                obj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

              }
            })

            )
          }
          // obj.consumptionQty = viewCostingData[index]?.effectiveDate ? consumptionQty : ''
          // obj.remainingQty = viewCostingData[index]?.effectiveDate ? remainingQty : ''
          // obj.annualImpact = viewCostingData[index]?.effectiveDate ? annualImpact : ''
          // obj.yearImpact = viewCostingData[index]?.effectiveDate ? yearImpact : ''
          obj.reason = ''
          obj.ecnNo = ''
          obj.effectiveDate = viewCostingData[index]?.effectiveDate
          obj.isDate = viewCostingData[index]?.effectiveDate ? true : false
          obj.partNo = viewCostingData[index]?.partNumber // Part id id part number here  USE PART NUMBER KEY HERE 

          obj.destinationPlantCode = viewCostingData[index]?.destinationPlantCode
          obj.destinationPlantName = viewCostingData[index]?.destinationPlantName
          obj.destinationPlantId = viewCostingData[index]?.destinationPlantId
          temp.push(obj)
        }
        dispatch(setCostingApprovalData(temp))
        return null
      })
  }

  const checkCostings = () => {
    let vendorArray = []
    let effectiveDateArray = []
    let plantArray = []

    dataSelected && dataSelected?.map((item) => {
      vendorArray.push(item.vendorId)
      effectiveDateArray.push(item.EffectiveDate)
      plantArray.push(item.PlantCode)
      return null
    })

    if (dataSelected?.length === 0) {
      Toaster.warning('Please select at least one costing to send for approval')
      return
    } else if (!allEqual(vendorArray)) {
      Toaster.warning('Vendor should be same for sending multiple costing for approval')
      return
    } else if (!allEqual(effectiveDateArray)) {
      Toaster.warning('Effective Date should be same for sending multiple costing for approval')
    } else if (!allEqual(plantArray)) {
      Toaster.warning('Plant should be same for sending multiple costing for approval')
    } else {
      sendForApprovalData(multipleCostings)
      setShowApproval(true)
    }
  }

  useEffect(() => {
    if (viewCostingData?.length === 1) {

      setIsWarningFlag(viewCostingData && viewCostingData?.length === 1 && viewCostingData[0]?.IsApprovalLocked)
      // setIsWarningFlag(false)
    }
  }, [viewCostingData])

  useEffect(() => {
    if (costingID && Object.keys(costingID).length > 0 && !simulationMode && !approvalMode) {
      dispatch(getSingleCostingDetails(costingID, (res) => {
        if (res.data?.Data) {
          let dataFromAPI = res.data?.Data

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
    return <button className="user-btn mr-1 mb-2 px-2" title='Detailed pdf' disabled={viewCostingData?.length === 1 ? false : true}> <div className='pdf-detail'></div>  D </button>
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
    return (simulationMode ? <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length > 3 ? true : false}> <div className='pdf-detail'></div></button> : <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length > 3 ? true : false}> <div className='pdf-detail'></div></button>)
  }, [viewCostingData])

  const reactToPrintContent = () => {
    return componentRef.current;
  };

  const sendForApprovalDown = (data) => {
    let temp = moduleHandler(data?.costingId, 'down', data)
    if (!temp) {
      sendForApprovalData([data?.costingId], index)
      setShowApproval(true)
    } else {
      Toaster.warning('A costing is pending for approval for this part or one of it\'s child part. Please approve that first')
    }
  }

  // ADD  DYNAMIC CLASS FOR COSTING SUMMARY WHEN COMPONENT REUSE IN DIFFERENT PAGE 
  const vendorNameClass = () => {
    switch (true) {
      case simulationMode:
        return "simulation-costing-summary"
      case approvalMode:
        return "costing-approval-summary"
      default:
        return "main-costing-summary"
    }
  }

  //GET CURRENCY VARIANCE IF CURRENCY VARIANCE IS NULL
  const getCurrencyVarianceFormatter = () => {
    let varianceWithCurrency = isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPriceWithCurrency > viewCostingData[1]?.nPOPriceWithCurrency ? 'green-row' : viewCostingData[0]?.nPOPriceWithCurrency < viewCostingData[1]?.nPOPriceWithCurrency ? 'red-row' : '' : '-'

    let varianceWithoutCurrency = isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? 'green-row' : viewCostingData[0]?.nPOPrice < viewCostingData[1]?.nPOPrice ? 'red-row' : '' : '-'
    if (viewCostingData[0]?.currency.currencyTitle === '-') {
      return varianceWithoutCurrency
    }
    else {
      return varianceWithCurrency
    }
  }


  const onBtExport = () => {

    function checkAssembly(obj) {
      if (obj.IsAssemblyCosting) {
        obj.rm = "Multiple RM"
        obj.gWeight = "Multiple RM"
        obj.fWeight = "Multiple RM"
        obj.pCost = "Multiple Process"
        obj.oCost = "Multiple Operation"
        obj.sTreatment = "Multiple Surface Treatment"
        return obj
      } else {
        return obj
      }
    }

    let costingSummary = []
    for (var prop in VIEW_COSTING_DATA) {
      costingSummary.push({ label: VIEW_COSTING_DATA[prop], value: prop, })
    }

    let masterDataArray = []
    viewCostingData && viewCostingData.map((item, index) => {

      if (index === 0) {
        masterDataArray.push({ label: "", value: `columnA${index}` })
        masterDataArray.push({ label: `Costing\u00A0${index + 1}`, value: `columnB${index}` })
      } else {
        masterDataArray.push({ label: `Costing\u00A0${index + 1}`, value: `columnB${index}` })
      }
      // dummy.push({ label: "", value: "" })
      // dummy.push({ label: "", value: "" })
    })

    let dataArray = []
    var value = ""

    viewCostingData && viewCostingData.map((element, indexOutside) => {
      let nextObj = checkAssembly(viewCostingData[indexOutside])

      if (indexOutside === 0) {

        costingSummary.map((item, index) => {

          value = (item.value)
          let obj = {}
          let key1 = `columnA${indexOutside}`
          let key2 = `columnB${indexOutside}`

          obj[key1] = item.label
          obj[key2] = nextObj ? nextObj[value] : ""

          dataArray.push(obj)

        })

      } else {
        let newArr = []
        costingSummary.map((item, index) => {
          value = (item.value)
          let obj = {}
          let key1 = `columnA${indexOutside}`
          let key2 = `columnB${indexOutside}`

          obj[key1] = item.label
          obj[key2] = nextObj ? nextObj[value] : ""

          obj = { ...obj, ...dataArray[index] }

          newArr.push(obj)

        })
        dataArray = newArr
      }
    })
    return returnExcelColumn(masterDataArray, dataArray)
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData
    return (
      <ExcelSheet data={temp} name={"CostingSummary"}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>
    );
  }

  return (
    <Fragment>
      {
        <Fragment>
          {(loader && <LoaderCustom customClass="pdf-loader" />)}
          <Row>
            {!viewMode && (
              <Col md="4">
                <div className="left-border">{'Summary'}</div>
              </Col>
            )}


            <Col md={simulationMode ? "12" : "8"} className="text-right">

              {
                DownloadAccessibility ? <LoaderCustom customClass="pdf-loader" /> :
                  <>
                    <ExcelFile filename={'CostingSummary'} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5 mb-2'} title="Download"><div className="download mr-0"></div></button>}>
                      {onBtExport()}
                    </ExcelFile>
                  </>
              }
              {!simulationMode &&
                <ReactToPrint
                  bodyClass='mx-2 mt-3 remove-space-border'
                  documentTitle={`${pdfName}-detailed-costing`}
                  content={reactToPrintContent}
                  onAfterPrint={handleAfterPrintDetail}
                  onBeforeGetContent={handleOnBeforeGetContentDetail}
                  trigger={reactToPrintTriggerDetail}
                />
              }
              {!simulationDrawer && !drawerViewMode && <ReactToPrint
                bodyClass={`my-3 simple-pdf ${simulationMode ? 'mx-1 simulation-print' : 'mx-2'}`}
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
                  {(showWarningMsg && !warningMsg) && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Costing for this part/Assembly is not yet done!'} />}
                </>}
            </Col>
          </Row>
          <div ref={componentRef}>
            <Row id="summaryPdf" className={`${customClass} ${vendorNameClass()} ${drawerDetailPDF ? 'remove-space-border' : ''} ${simulationMode ? "simulation-print" : ""}`}>
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
                  <table class={`table table-bordered costing-summary-table ${approvalMode ? 'costing-approval-summary' : ''}`}>
                    <thead>
                      <tr className="main-row">
                        {
                          isApproval ? <th scope="col" className='approval-summary-headers'>{props.id}</th> : <th scope="col" className={`header-name-left ${isLockedState && !drawerDetailPDF && !pdfHead && costingSummaryMainPage ? 'pt-30' : ''}`}>VBC/ZBC</th>
                        }

                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            const title = data?.zbc === 0 ? data?.plantName + "(SOB: " + data?.shareOfBusinessPercent + "%)" : (data?.zbc === 1 ? data?.vendorName : 'CBC') + "(SOB: " + data?.shareOfBusinessPercent + "%)"
                            return (
                              <th scope="col" className={`header-name ${isLockedState && data?.status !== DRAFT && costingSummaryMainPage && !pdfHead && !drawerDetailPDF ? 'pt-30' : ''}`}>
                                {data?.IsApprovalLocked && !pdfHead && !drawerDetailPDF && costingSummaryMainPage && data?.status === DRAFT && <WarningMessage title={data?.getApprovalLockedMessage} dClass={"costing-summary-warning-mesaage"} message={data?.getApprovalLockedMessage} />}    {/* ADD THIS CODE ONCE DEPLOYED FROM BACKEND{data.ApprovalLockedMessage}*/}
                                <div className={` ${drawerDetailPDF ? 'pdf-header' : 'header-name-button-container'}`}>
                                  <div class="element d-inline-flex align-items-center">
                                    {
                                      !isApproval && (data?.status === DRAFT) && <>
                                        {!pdfHead && !drawerDetailPDF && !viewMode && < div class="custom-check1 d-inline-block">
                                          <label
                                            className="custom-checkbox pl-0 mb-0"
                                            onChange={() => moduleHandler(data?.costingId, 'top', data)}
                                          >
                                            {''}
                                            <input
                                              type="checkbox"
                                              value={"All"}
                                              // disabled={true}
                                              checked={multipleCostings.includes(data?.costingId)}
                                            />
                                            <span
                                              className=" before-box"
                                              checked={multipleCostings.includes(data?.costingId)}
                                              onChange={() => moduleHandler(data?.costingId, 'top', data)}
                                            />
                                          </label>
                                        </div>}
                                      </>
                                    }
                                    {
                                      (isApproval && data?.CostingHeading !== '-') ? <span>{data?.CostingHeading}</span> : <span className={`checkbox-text`} title={title}>{data?.zbc === 0 ? <span>{data?.plantName}(SOB: {data?.shareOfBusinessPercent}%)<span className='sub-heading'>{data?.plantCode}-ZBC</span></span> : data?.zbc === 1 ? <span>{data?.vendorName}(SOB: {data?.shareOfBusinessPercent}%)<span className='sub-heading'>{data?.vendorCode}-VBC</span></span> : 'CBC'}</span>
                                    }
                                  </div>

                                  <div class="action  text-right">
                                    {((!pdfHead && !drawerDetailPDF)) && (data?.IsAssemblyCosting === true) && < button title='View BOM' className="hirarchy-btn mr-1 mb-0 align-middle" type={'button'} onClick={() => viewBomCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && EditAccessibility) && (data?.status === DRAFT) && <button className="Edit mr-1 mb-0 align-middle" type={"button"} title={"Edit Costing"} onClick={() => editCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && AddAccessibility) && <button className="Add-file mr-1 mb-0 align-middle" type={"button"} title={"Add Costing"} onClick={() => addNewCosting(index)} />}
                                    {((!viewMode || (approvalMode && data?.CostingHeading === '-')) && (!pdfHead && !drawerDetailPDF)) && <button type="button" class="CancelIcon mb-0 align-middle" title={"Remove Costing"} onClick={() => deleteCostingFromView(index)}></button>}
                                  </div>
                                </div>
                              </th>
                            )
                          })}
                      </tr>
                    </thead>
                    <tbody>
                      {
                        (!isApproval || approvalMode) ?
                          <tr>
                            <td>
                              <span className="d-block">Costing Version</span>
                              <span className="d-block">PO Price (Effective from)</span>
                              <span className="d-block">Part Number</span>
                              <span className="d-block">Part Name</span>
                              <span className="d-block">Revision Number</span>
                              <span className="d-block">Plant (Code)</span>

                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td>
                                    <span class="d-flex justify-content-between bg-grey">
                                      {`${DayTime(data?.costingDate).format('DD-MM-YYYY')}-${data?.CostingNumber}-${data?.status}`}{' '}
                                      {
                                        !viewMode &&
                                        <button
                                          class="text-primary d-inline-block btn-a"
                                          onClick={() => editHandler(index)}
                                        >
                                          {(!drawerDetailPDF && !pdfHead) && <small>Change version</small>}
                                        </button>
                                      }
                                    </span>
                                    <span class="d-block">{checkForDecimalAndNull(data?.poPrice, initialConfiguration.NoOfDecimalForPrice)} ({(data?.effectiveDate && data?.effectiveDate !== '') ? DayTime(data?.effectiveDate).format('DD-MM-YYYY') : "-"})</span>
                                    {/* USE PART NUMBER KEY HERE */}
                                    <span class="d-block">{data?.partNumber}</span>
                                    <span class="d-block">{data?.partName}</span>
                                    <span class="d-block">{data?.RevisionNumber}</span>
                                    <span class="d-block">{data?.zbc === 0 ? `${data?.plantName} (${data?.plantCode})` : `${data?.destinationPlantName} (${data?.destinationPlantCode})`}</span>
                                  </td>
                                )
                              })}
                          </tr> :
                          <tr>
                            <td>
                              <span class="d-block">Part Number</span>
                              <span class="d-block">Part Name</span>
                              {/* <span className="d-block">Revision Number</span> */}
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td>
                                    {/* USE PART NUMBER KEY HERE */}
                                    <span class="d-block">{data?.CostingHeading !== VARIANCE ? data?.partNumber : ''}</span>
                                    <span class="d-block">{data?.CostingHeading !== VARIANCE ? data?.partName : ''}</span>

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
                          viewCostingData?.map((data) => {
                            return (


                              < td >
                                <span class="d-block small-grey-text">{data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : data?.rm : ''}</span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0].RMRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0].ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {/* try with component */}
                                  {data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : (data?.netRMCostView && reducer(data?.netRMCostView)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : (data?.netRMCostView && reducerFinish(data?.netRMCostView)) : ''}
                                  {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0].BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
                                  {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : checkForDecimalAndNull(data?.netRMCostView[0]?.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''}
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

                      <tr className={`background-light-blue  ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? 'green-row' : viewCostingData[0]?.netRM < viewCostingData[1]?.netRM ? 'red-row' : '' : '-'}`}>
                        <th>Net RM Cost {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) && '(Old)'}</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? <span className='positive-sign'>+</span> : '' : '')}
                                <span>{checkForDecimalAndNull(data?.netRM, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                      <tr className={`background-light-blue  ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netBOP > viewCostingData[1]?.netBOP ? 'green-row' : viewCostingData[0]?.netBOP < viewCostingData[1]?.netBOP ? 'red-row' : '' : '-'}`}>
                        <th>Net BOP Cost {simulationDrawer && (Number(master) === Number(BOPDOMESTIC) || Number(master) === Number(BOPIMPORT)) && '(Old)'}</th>

                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netBOP > viewCostingData[1]?.netBOP ? <span className='positive-sign'>+</span> : '' : '')}
                                <span>{checkForDecimalAndNull(data?.netBOP, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          viewCostingData?.map((data) => {
                            return (
                              <td>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Process" : checkForDecimalAndNull(data?.pCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Operation" : checkForDecimalAndNull(data?.oCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Other Operation" : checkForDecimalAndNull(data?.netOtherOperationCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
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

                      <tr className={`background-light-blue  ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nConvCost > viewCostingData[1]?.nConvCost ? 'green-row' : viewCostingData[0]?.nConvCost < viewCostingData[1]?.nConvCost ? 'red-row' : '' : '-'}`}>
                        <th>Net Conversion Cost{simulationDrawer && (Number(master) === Number(OPERATIONS)) && '(Old)'}</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nConvCost > viewCostingData[1]?.nConvCost ? <span className='positive-sign'>+</span> : '' : '')}
                                <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nConvCost, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.nConvCost, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          viewCostingData?.map((data) => {
                            return (
                              <td>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : checkForDecimalAndNull(data?.sTreatment, initialConfiguration.NoOfDecimalForPrice)) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : checkForDecimalAndNull(data?.tCost, initialConfiguration.NoOfDecimalForPrice)) : ''}
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



                      <tr className={`background-light-blue  ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nsTreamnt > viewCostingData[1]?.nsTreamnt ? 'green-row' : viewCostingData[0]?.nsTreamnt < viewCostingData[1]?.nsTreamnt ? 'red-row' : '' : '-'}`}>
                        <th>Net Surface Treatment Cost{simulationDrawer && (Number(master) === Number(SURFACETREATMENT)) && '(Old)'}</th>

                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              < td >
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nsTreamnt > viewCostingData[1]?.nsTreamnt ? <span className='positive-sign'>+</span> : '' : '')}
                                <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.netSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.netSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          viewCostingData?.map((data) => {
                            return (

                              <td>
                                <span class="d-block">{data?.CostingHeading !== VARIANCE ? data?.modelType : ''}</span>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50">
                                    {data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50">
                                    {data?.CostingHeading !== VARIANCE ? data?.aValue.value : ''}
                                  </span>
                                </div>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? data?.overheadOn.overheadTitle : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.overheadOn.overheadValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                  </span>
                                </div>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? data?.profitOn.profitTitle : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.profitOn.profitValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                  </span>
                                </div>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? data?.rejectionOn.rejectionTitle : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.rejectionOn.rejectionValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                  </span>
                                </div>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? data?.iccOn.iccTitle : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.iccOn.iccValue, initialConfiguration.NoOfDecimalForPrice) : ''}
                                  </span>
                                </div>
                                <div class="d-flex">
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? data?.paymentTerms.paymentTitle : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block w-50 small-grey-text">
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.paymentTerms.paymentValue, initialConfiguration.NoOfDecimalForPrice) : ''}
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

                      <tr class={`background-light-blue ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nOverheadProfit > viewCostingData[1]?.nOverheadProfit ? 'green-row' : viewCostingData[0]?.nOverheadProfit < viewCostingData[1]?.nOverheadProfit ? 'red-row' : ' ' : '-'}`}>
                        <th>Net Overheads & Profits</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nOverheadProfit > viewCostingData[1]?.nOverheadProfit ? <span className='positive-sign'>+</span> : '' : '')}
                                <span>{checkForDecimalAndNull(data?.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice)}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          viewCostingData?.map((data) => {
                            return (
                              <td>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.packagingCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.freight, initialConfiguration.NoOfDecimalForPrice) : ''}
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

                      <tr class={`background-light-blue ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPackagingAndFreight > viewCostingData[1]?.nPackagingAndFreight ? 'green-row' : viewCostingData[0]?.nPackagingAndFreight < viewCostingData[1]?.nPackagingAndFreight ? 'red-row' : ' ' : '-'}`}>
                        <th>Net Packaging & Freight</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          <span class="d-block small-grey-text pt-3"></span>
                          <span class="d-block small-grey-text">Tool Maintenance Cost on</span>
                          <span class="d-block small-grey-text">Tool Price</span>
                          <span class="d-block small-grey-text">Amortization Quantity (Tool Life)</span>
                          <span class="d-block small-grey-text">Tool Amortization Cost</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData?.map((data) => {
                            return (
                              <td className={` ${pdfHead || drawerDetailPDF ? '' : ''}`}>
                                <div class="d-flex">
                                  <span class="d-inline-block p-0 w-50">
                                    {data?.CostingHeading !== VARIANCE ? data?.toolApplicability.applicability : ''}
                                  </span>{' '}
                                  &nbsp;{' '}
                                  <span class="d-inline-block p-0 w-50">
                                    {data?.CostingHeading !== VARIANCE ? data?.toolApplicability.value : ''}
                                  </span>
                                </div>
                                <div className="d-flex">
                                  <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.toolApplicabilityValue.toolTitle : ''}</span> &nbsp;{' '}
                                  <span className="d-inline-block w-50 "> {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                </div>

                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.toolPrice, initialConfiguration.NoOfDecimalForPrice) : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.amortizationQty : ''}
                                </span>
                                <span class="d-block small-grey-text">
                                  {data?.CostingHeading !== VARIANCE ? data?.toolAmortizationCost : ''}
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

                      <tr class={`background-light-blue ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.totalToolCost > viewCostingData[1]?.totalToolCost ? 'green-row' : viewCostingData[0]?.totalToolCost < viewCostingData[1]?.totalToolCost ? 'red-row' : ' ' : '-'}`}>
                        <th>Net Tool Cost</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td>
                                <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.totalToolCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                {
                                  (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    type="button"
                                    title='View'
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
                          viewCostingData?.map((data) => {
                            return (
                              data?.CostingHeading !== VARIANCE ?
                                <td width={"32%"}>
                                  <div className="d-grid">
                                    {/* <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.discount : ''}</span> &nbsp;{' '}
                                <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.value : ''}</span> */}
                                    <span className="d-inline-block ">{"Type"}</span>
                                    <span className="d-inline-block ">{"Applicability"}</span>
                                    <span className="d-inline-block ">{"Value"}</span>
                                    <span className="d-inline-block ">{"Cost"}</span>
                                  </div>
                                  <div className="d-grid">
                                    <span className="d-inline-block small-grey-text">
                                      {data?.CostingHeading !== VARIANCE ? data?.otherDiscountValue.dicountType : ''}
                                    </span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.otherDiscountValue.dicountType === "Percentage" ? data?.otherDiscountValue.discountApplicablity : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.otherDiscountValue.dicountType === "Percentage" ? checkForDecimalAndNull(data?.otherDiscountValue.discountPercentValue, initialConfiguration.NoOfDecimalForPrice) : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.otherDiscountValue.discountValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
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
                          viewCostingData?.map((data, index) => {
                            return (

                              data?.CostingHeading !== VARIANCE ?
                                <td width={"32%"}>
                                  <div className="d-grid">

                                    <span className="d-inline-block">{"Type"}</span>
                                    <span className="d-inline-block">{"Applicability"}</span>
                                    <span className="d-inline-block">{"Value"}</span>
                                    <span className="d-inline-block">{"Cost"}</span>
                                  </div>
                                  <div className="d-grid">
                                    <span className="d-inline-block small-grey-text">
                                      {data?.CostingHeading !== VARIANCE ? data?.anyOtherCostType : ''}
                                    </span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.anyOtherCostType === "Percentage" ? data?.anyOtherCostApplicablity : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.anyOtherCostType === "Percentage" ? checkForDecimalAndNull(data?.anyOtherCostPercent, initialConfiguration.NoOfDecimalForPrice) : '-'}</span>
                                    <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.anyOtherCost, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                  </div>
                                </td>
                                : ""

                            )
                          })}
                      </tr>
                      {

                        <tr class={`background-light-blue netPo-row ${isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? 'green-row' : viewCostingData[0]?.nPOPrice < viewCostingData[1]?.nPOPrice ? 'red-row' : '' : '-'}`}>
                          <th>Net PO Price ({getConfigurationKey().BaseCurrency}){simulationDrawer && '(Old)'}</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? <span className='positive-sign'>+</span> : '' : '')}
                                <span><span className='currency-symbol'>{getCurrencySymbol(getConfigurationKey().BaseCurrency)}</span>{checkForDecimalAndNull(data?.nPOPrice, initialConfiguration.NoOfDecimalForPrice)}</span>
                              </td >
                            })}

                        </tr >
                      }

                      <tr>
                        <td>
                          <span class="d-block small-grey-text">Currency</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData?.map((data) => {
                            return (
                              <td>
                                <div>
                                  <span className={`small-grey-text mr-1 ${data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? 'd-none' : '' : ''}  `}>{data?.CostingHeading !== VARIANCE ? `${data?.currency.currencyTitle}/${getConfigurationKey().BaseCurrency}` : ''}</span> {' '}
                                  <span className="">{data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? '-' : checkForDecimalAndNull(data?.currency.currencyValue, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
                                </div>
                              </td>
                            )
                          })}
                      </tr>
                      {

                        <tr class={`background-light-blue  ${getCurrencyVarianceFormatter()}`}>
                          <th>Net PO Price (In Currency){simulationDrawer && '(Old)'}</th>
                          {/* {viewCostingData &&
                        viewCostingData?.map((data, index) => {
                          return <td>Net PO Price({(data?.currency.currencyTitle !== '-' ? data?.currency.currencyTitle : 'INR')})</td>
                        })} */}


                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td> {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPriceWithCurrency > viewCostingData[1]?.nPOPriceWithCurrency ? <span className='positive-sign'>+</span> : '' : '')}
                                <span><span className='currency-symbol'>{getCurrencySymbol(data?.currency.currencyTitle !== '-' ? data?.currency.currencyTitle : getConfigurationKey().BaseCurrency)}</span>{data?.nPOPriceWithCurrency !== null ? checkForDecimalAndNull((data?.currency?.currencyTitle) !== "-" ? (data?.nPOPriceWithCurrency) : data?.nPOPrice, initialConfiguration.NoOfDecimalForPrice) : '-'}</span> </td>
                            })}
                        </tr>
                      }

                      <tr>
                        <td>Attachments</td>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (

                              <td>
                                {
                                  data?.CostingHeading !== VARIANCE &&
                                    data?.attachment && data?.attachment.length === 0 ? (
                                    'No attachment found'
                                  ) : data?.attachment.length === 1 ? (

                                    <>
                                      {data?.attachment && data?.CostingHeading !== VARIANCE &&
                                        data?.attachment.map((f) => {
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

                                      <button
                                        type='button'
                                        title='View'
                                        className='btn-a'
                                        onClick={() => viewAttachmentData(index)}
                                      > {data?.CostingHeading !== VARIANCE ? 'View Attachment' : ''}</button>
                                    )
                                }
                              </td>
                            )
                          })}
                      </tr>

                      <tr>
                        <th>Remarks</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return <td><span className="d-block small-grey-text">{data?.CostingHeading !== VARIANCE ? data?.remark : ''}</span></td>
                          })}
                      </tr>

                      {(!viewMode) && (
                        <tr class={`${pdfHead || drawerDetailPDF ? 'd-none' : 'background-light-blue'}`}>
                          <td className="text-center"></td>

                          {viewCostingData?.map((data, index) => {

                            return (

                              <td class="text-center costing-summary">
                                {(!viewMode && !isFinalApproverShow) &&
                                  (data?.status === DRAFT) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    class="user-btn"
                                    disabled={viewCostingData[index].IsApprovalLocked}
                                    onClick={() => {
                                      sendForApprovalDown(data)
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
                  </table >
                </div >
              </Col >
            </Row >
          </div >
        </Fragment >
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
            simulationMode={simulationMode}
            isSimulationDone={isSimulationDone}
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
            technologyId={technologyId}
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

      {
        IsOpenViewHirarchy && <BOMViewer
          isOpen={IsOpenViewHirarchy}
          closeDrawer={closeVisualDrawer}
          isEditFlag={true}
          // USE PART NUMBER KEY HERE
          PartId={viewBomPartId}
          anchor={'right'}
          isFromVishualAd={true}
          NewAddedLevelOneChilds={[]}
        />
      }
    </Fragment >
  )
}

export default CostingSummaryTable
