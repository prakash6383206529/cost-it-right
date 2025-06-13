import React, { Fragment, useEffect, useState, useRef, useCallback } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import AddToComparisonDrawer from './AddToComparisonDrawer'
import {
  setRejectedCostingViewData, setCostingApprovalData, getBriefCostingById,
  storePartNumber, getSingleCostingDetails, createCosting, checkFinalUser, getCostingByVendorAndVendorPlant,
  setIsMultiVendor,
  setApplicabilityForChildParts
} from '../actions/Costing'
import ViewBOP from './Drawers/ViewBOP'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'
import ViewOverheadProfit from './Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight'
import ViewToolCost from './Drawers/viewToolCost'
import SendForApproval from './approval/SendForApproval'
import Toaster from '../../common/Toaster'
import { checkForDecimalAndNull, checkForNull, checkPermission, formViewData, getTechnologyPermission, loggedInUserId, userDetails, allEqual, getConfigurationKey, getCurrencySymbol, highlightCostingSummaryValue, checkVendorPlantConfigurable, userTechnologyLevelDetails, showBopLabel } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { BOPDOMESTIC, BOPIMPORT, COSTING, DRAFT, FILE_URL, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, VARIANCE, VBC, ZBC, VIEW_COSTING_DATA, VIEW_COSTING_DATA_LOGISTICS, NCC, EMPTY_GUID, CBC, ZBCTypeId, VBCTypeId, NCCTypeId, CBCTypeId, APPROVED, PENDING, VIEW_COSTING_DATA_TEMPLATE, PFS2TypeId, REJECTED } from '../../../config/constants'
import { useHistory } from "react-router-dom";
import WarningMessage from '../../common/WarningMessage'
import DayTime from '../../common/DayTimeWrapper'
import { getVolumeDataByPartAndYear } from '../../masters/actions/Volume'
import LoaderCustom from '../../common/LoaderCustom'
import ReactToPrint from 'react-to-print';
import BOMViewer from '../../masters/part-master/BOMViewer';
import _, { debounce } from 'lodash'
import ReactExport from 'react-export-excel';
import ExcelIcon from '../../../assests/images/excel.svg';
import { DIE_CASTING, IdForMultiTechnology } from '../../../config/masterData'
import ViewMultipleTechnology from './Drawers/ViewMultipleTechnology'
import TooltipCustom from '../../common/Tooltip'
import { Costratiograph } from '../../dashboard/CostRatioGraph'
import { colorArray } from '../../dashboard/ChartsDashboard'
import { LOGISTICS, FORGING } from '../../../config/masterData'
import { reactLocalStorage } from 'reactjs-localstorage'
import { getUsersTechnologyLevelAPI } from '../../../actions/auth/AuthActions'
import AddNpvCost from './CostingHeadCosts/AdditionalOtherCost/AddNpvCost'
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions'
import CrossIcon from '../../../assests/images/red-cross.png'
import { getMultipleCostingDetails } from '../../rfq/actions/rfq'
import { CirLogo, CompanyLogo, useLabels } from '../../../helper/core'

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const RejectedCostingSummaryTable = (props) => {
  const { viewMode, showDetail, technologyId, costingID, showWarningMsg, simulationMode, isApproval, simulationDrawer, customClass, selectedTechnology, master, isSimulationDone, approvalMode, drawerViewMode, costingSummaryMainPage, costingIdExist, costingIdList } = props

  let history = useHistory();
  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
  const { discountLabel, toolMaintenanceCostLabel } = useLabels();
  const { finishWeightLabel } = useLabels()

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
  const [viewPieChart, setViewPieChart] = useState(null)
  const [pieChartColor, setPieChartColor] = useState([])
  /*CONSTANT FOR  CREATING AND EDITING COSTING*/
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [index, setIndex] = useState('')
  const [excelArray, setExcelArray] = useState([])

  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [iccPaymentData, setIccPaymentData] = useState("")

  const [warningMsg, setShowWarningMsg] = useState(false)
  const [isLockedState, setIsLockedState] = useState(false)
  const [viewMultipleTechnologyDrawer, setViewMultipleTechnologyDrawer] = useState(false)
  const [multipleTechnologyData, setMultipleTechnologyData] = useState([])
  const [pieChartLabel, setPieChartLabel] = useState([])
  const [npvIndex, setNpvIndex] = useState(0)

  const viewCostingData = useSelector((state) => state.costing.viewRejectedCostingDetailData)

  const selectedRowRFQ = useSelector((state) => state.rfq.selectedRowRFQ)
  const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);

  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const partNumber = useSelector(state => state.costing.partNo);
  const { initialConfiguration, topAndLeftMenuData } = useSelector(state => state.auth)
  const [pdfName, setPdfName] = useState('')
  const [IsOpenViewHirarchy, setIsOpenViewHirarchy] = useState(false);
  const [viewBomPartId, setViewBomPartId] = useState("");
  const [dataSelected, setDataSelected] = useState([]);
  const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
  const [IsNccCosting, setIsNccCosting] = useState(false);
  const [isLogisticsTechnology, setIsLogisticsTechnology] = useState(false);
  const [openNpvDrawer, setNpvDrawer] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState({
    BOP: false,
    process: false,
    operation: false
  })
  const partType = IdForMultiTechnology.includes(String(viewCostingData[0]?.technologyId)||IsMultiVendorCosting)       //CHECK IF MULTIPLE TECHNOLOGY DATA IN SUMMARY

  const componentRef = useRef();
  const onBeforeContentResolve = useRef(null)
  const onBeforeContentResolveDetail = useRef(null)
  const [pieChartDataArray, setPieChartDataArray] = useState([])
  const [count, setCount] = useState(0);

  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology)

    return () => {
      dispatch(setRejectedCostingViewData([]))
    }
  }, [])
  const { vendorLabel } = useLabels()
  useEffect(() => {

    if (!viewMode && viewCostingData?.length !== 0 && partInfo && count === 0 && technologyId) {
      let levelDetailsTemp = ''
      setCount(1)
      dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), technologyId, null, (res) => {
        levelDetailsTemp = userTechnologyLevelDetails(viewCostingData[0]?.costingTypeId, res?.data?.Data?.TechnologyLevels)
        if (levelDetailsTemp?.length !== 0) {
          let obj = {}
          obj.DepartmentId = userDetails().DepartmentId
          obj.UserId = loggedInUserId()
          obj.TechnologyId = partInfo.TechnologyId
          obj.Mode = 'costing'
          obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(viewCostingData[0]?.costingTypeId)
          dispatch(checkFinalUser(obj, res => {
            if (res.data?.Result) {
              setIsFinalApproverShow(res.data?.Data?.IsFinalApprover) // UNCOMMENT IT AFTER DEPLOTED FROM KAMAL SIR END
            }
          }))
        }
      }))

    }

  }, [viewCostingData])

  useEffect(() => {
    viewCostingData && viewCostingData.map((item) => {
      if (item.costingHeadCheck === NCC) {
        setIsNccCosting(true)
      }
      if (item.technologyId === LOGISTICS) {
        setIsLogisticsTechnology(true)
      }
    })


  }, [viewCostingData])

  const viewPieData = (index) => {
    setViewPieChart(index)
    let temp = []
    let tempObj = viewCostingData[index]
    let labels = ['RM', 'BOP', 'CC', 'ST', 'O&P', 'P&F', 'TC', 'HUNDI/DIS', 'ANY OTHER COST']
    let dataArray = [];
    let tempColorArray = [];

    temp = [
      checkForDecimalAndNull(tempObj.netRM, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.netBOP, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.nConvCost, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.nsTreamnt, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.nOverheadProfit, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.totalToolCost, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.otherDiscountCost, initialConfiguration?.NoOfDecimalForPrice),
      checkForDecimalAndNull(tempObj.anyOtherCost, initialConfiguration?.NoOfDecimalForPrice),
    ]

    let labelArray = temp.reduce((acc, item, index) => {
      if (item !== 0) {
        acc.push(labels[index]);
      }
      return acc;
    }, []);

    labelArray.forEach(item => {
      switch (item) {
        case 'RM':
          dataArray.push(checkForDecimalAndNull(tempObj.netRM, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[0])
          break;
        case 'BOP':
          dataArray.push(checkForDecimalAndNull(tempObj.netBOP, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[1])
          break;
        case 'CC':
          dataArray.push(checkForDecimalAndNull(tempObj.nConvCost, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[2])
          break;
        case 'ST':
          dataArray.push(checkForDecimalAndNull(tempObj.nsTreamnt, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[3])
          break;
        case 'O&P':
          dataArray.push(checkForDecimalAndNull(tempObj.nOverheadProfit, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[4])
          break;
        case 'P&F':
          dataArray.push(checkForDecimalAndNull(tempObj.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[5])
          break;
        case 'TC':
          dataArray.push(checkForDecimalAndNull(tempObj.totalToolCost, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[6])
          break;
        case 'HUNDI/DIS':
          dataArray.push(checkForDecimalAndNull(tempObj.otherDiscountCost, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[7])
          break;
        case 'ANY OTHER COST':
          dataArray.push(checkForDecimalAndNull(tempObj.anyOtherCost, initialConfiguration?.NoOfDecimalForPrice))
          tempColorArray.push(colorArray[8])
          break;
        default:
          break;
      }
    })

    setPieChartLabel(labelArray)
    setPieChartDataArray(dataArray);
    setPieChartColor(tempColorArray)
  }


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


  const closeNpvDrawer = () => {
    setNpvDrawer(false)
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
      let bopHandlingChargeType = viewCostingData[index]?.bopHandlingChargeType
      let childPartBOPHandlingCharges = viewCostingData[index]?.childPartBOPHandlingCharges
      let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
      setViewBOPData({ BOPData: data, bopPHandlingCharges: bopPHandlingCharges, bopHandlingChargeType, bopHandlingPercentage: bopHandlingPercentage, childPartBOPHandlingCharges: childPartBOPHandlingCharges, IsAssemblyCosting: IsAssemblyCosting })
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
   * @method viewMultipleTechnology
   * @description SET MULTIPLE COSTING DATA FOR VIEWMULTIPLETECHNOLOGY DRAWER
   */
  const viewMultipleTechnology = (index) => {
    let data = viewCostingData[index]?.multiTechnologyCostingDetails
    setViewMultipleTechnologyDrawer(true)
    setIndex(index)
    setMultipleTechnologyData(data)
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
    let isRmCutOffApplicable = viewCostingData[index]?.isRmCutOffApplicable


    setIsViewOverheadProfit(true)
    setViewOverheadData(overHeadData)
    setViewProfitData(profitData)
    setIccPaymentData(IccPaymentData)
    setViewRejectAndModelType({ rejectData: rejectData, modelType: modelType, isRmCutOffApplicable: isRmCutOffApplicable })
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

  const viewNpvData = (index) => {
    setNpvDrawer(true)
    setNpvIndex(index)
  }

  const viewAttachmentData = (index) => {
    setAttachment(true)
    setViewAttachment(index)
  }

  const deleteCostingFromView = (index) => {
    let temp = [...viewCostingData]
    temp.splice(index, 1)
    if (props?.isRfqCosting) {
      let tempArr = temp && temp.filter(item => item?.bestCost !== true)
      temp = props?.bestCostObjectFunction(tempArr)
    }
    dispatch(setRejectedCostingViewData(temp))
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
      costingTypeId: viewCostingData[index]?.costingTypeId,
      customerName: viewCostingData[index]?.customerName,
      customerId: viewCostingData[index]?.customerId,
      customerCode: viewCostingData[index]?.customerCode,
    }

    setIsEditFlag(true)
    setaddComparisonToggle(true)
    setEditObject(editObject)
    setViewPieChart(null)
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
    const type = viewCostingData[index]?.costingTypeId

    const Data = {
      PartId: partNumber.partId,
      PartTypeId: partInfo.PartTypeId,
      PartType: partInfo.PartType,
      TechnologyId: tempData?.technologyId,
      ZBCId: userDetail.ZBCSupplierInfo.VendorId,
      VendorId: tempData.vendorId,
      VendorPlantId: checkVendorPlantConfigurable() ? tempData.vendorPlantId : '',
      VendorPlantName: tempData.vendorPlantName,
      VendorPlantCode: tempData.vendorPlantCode,
      VendorName: tempData.vendorName,
      VendorCode: tempData.vendorCode,
      PlantId: (type === ZBCTypeId || type === CBCTypeId) ? tempData.plantId : EMPTY_GUID,
      PlantName: (type === ZBCTypeId || type === CBCTypeId) ? tempData.plantName : '',
      PlantCode: (type === ZBCTypeId || type === CBCTypeId) ? tempData.plantCode : '',
      DestinationPlantId: initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId) ? tempData.destinationPlantId : EMPTY_GUID,
      DestinationPlantName: initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId) ? tempData.destinationPlantName : '',
      DestinationPlantCode: initialConfiguration?.IsDestinationPlantConfigure && (type === VBCTypeId || type === NCCTypeId) ? tempData.destinationPlantCode : '',
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
      CostingHead: type,
      CostingTypeId: type,
      CustomerId: type === CBCTypeId ? tempData.CustomerId : EMPTY_GUID,
      CustomerName: type === CBCTypeId ? tempData.CustomerName : '',
      Customer: type === CBCTypeId ? tempData.Customer : '',
      IsMultiVendorCosting: IsMultiVendorCosting
    }
    dispatch(createCosting(Data, (res) => {
      if (res.data?.Result) {
        dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
          setPartInfo(res.data?.Data)

          showDetail(res.data?.Data, { costingId: res.data?.Data?.CostingId, type })
          history.push('/costing')
        }))
      }
    }),
    )

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
    setViewMultipleTechnologyDrawer(false)
    setDrawerOpen({ BOP: false, process: false, operation: false })
  }

  /**
   * @method closeShowApproval
   * @description FOR CLOSING APPROVAL DRAWER
   */
  const closeShowApproval = (e = '', type) => {
    setShowApproval(false)
    setDataSelected([])
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

            dispatch(getVolumeDataByPartAndYear(partNumber.value ? partNumber.value : partNumber.partId, year, viewCostingData[index]?.costingTypeId === ZBCTypeId ? viewCostingData[index]?.plantId : viewCostingData[index]?.destinationPlantId, viewCostingData[index]?.vendorId, viewCostingData[index]?.customerId, viewCostingData[index]?.costingTypeId, res => {
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
          obj.partId = viewCostingData[index]?.partId
          obj.technologyId = viewCostingData[index]?.technologyId
          obj.CostingHead = viewCostingData[index]?.costingHeadCheck

          obj.destinationPlantCode = viewCostingData[index]?.destinationPlantCode
          obj.destinationPlantName = viewCostingData[index]?.destinationPlantName
          obj.destinationPlantId = viewCostingData[index]?.destinationPlantId
          obj.costingTypeId = viewCostingData[index]?.costingTypeId
          obj.customerName = viewCostingData[index]?.customerName
          obj.customerId = viewCostingData[index]?.customerId
          obj.customerCode = viewCostingData[index]?.customerCode
          obj.customer = viewCostingData[index]?.customer
          obj.BasicRate = viewCostingData[index]?.BasicRate
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
      Toaster.warning(`${vendorLabel} should be same for sending multiple costing for approval`)
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
          dispatch(setRejectedCostingViewData(tempObj))
          dispatch(setIsMultiVendor(dataFromAPI?.IsMultiVendorCosting))
          dispatch(setApplicabilityForChildParts(dataFromAPI?.CostingPartDetails?.IsIncludeChildPartsApplicabilityCost ?? false))

        }
      },
      ))
    }

  }, [costingID])


  const reducer = (array) => {
    let arr = 0
    if (Array.isArray(array)) {
      arr = array && array?.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.GrossWeight
      }, 0)
    }
    return checkForDecimalAndNull(arr, initialConfiguration?.NoOfDecimalForInputOutput)
  }


  const reducerFinish = (array) => {
    let arr = 0
    if (Array.isArray(array)) {
      arr = array.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.FinishWeight
      }, 0)
    }

    return checkForDecimalAndNull(arr, initialConfiguration?.NoOfDecimalForInputOutput)
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
    let varianceWithCurrency = isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPriceWithCurrency > viewCostingData[1]?.nPOPriceWithCurrency ? 'green-row' : viewCostingData[0]?.nPOPriceWithCurrency < viewCostingData[1]?.nPOPriceWithCurrency ? 'red-row' : '' : '-'

    let varianceWithoutCurrency = isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? 'green-row' : viewCostingData[0]?.nPOPrice < viewCostingData[1]?.nPOPrice ? 'red-row' : '' : '-'
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
      } else if (obj.CostingHeading !== VARIANCE) {

        obj.gWeight = (obj?.netRMCostView && reducer(obj?.netRMCostView))
        obj.fWeight = (obj?.netRMCostView && reducerFinish(obj?.netRMCostView))
        return obj
      } else {
        let objNew = { ...obj }
        for (var prop in objNew) {
          if (prop !== "netRM" && prop !== "nConvCost" && prop !== "nPOPrice" && prop !== "nPoPriceCurrency" && prop !== "netBOP" && prop !== "netSurfaceTreatmentCost" && prop !== "nOverheadProfit" && prop !== "nPackagingAndFreight" && prop !== "totalToolCost") {
            objNew[prop] = "-"
          }
        }
        return objNew
      }
    }

    let costingSummary = []
    let templateObj = viewCostingData[0]?.technologyId === LOGISTICS ? VIEW_COSTING_DATA_LOGISTICS : VIEW_COSTING_DATA

    if (props?.isRfqCosting) {
      templateObj.costingHeadCheck = 'VBC'
    }
    if (!(reactLocalStorage.getObject('cbcCostingPermission'))) {
      templateObj.costingHeadCheck = 'VBC/ZBC/NCC'
    }

    for (var prop in templateObj) {
      if (partType) {// IF TECHNOLOGY WILL BE ASSEMBLY THIS BLOCK WILL BE EXCECUTED
        if (prop !== "netRM" && prop !== "netBOP" && prop !== 'fWeight' && prop !== 'BurningLossWeight' && prop !== 'gWeight' && prop !== 'ScrapWeight' && prop !== 'scrapRate' && prop !== 'rmRate' && prop !== 'rm')
          costingSummary.push({ label: VIEW_COSTING_DATA[prop], value: prop, })
      }
      else if (IsNccCosting) {
        if (prop !== "netChildPartsCost" && prop !== "netBoughtOutPartCost" && prop !== "netProcessCost" && prop !== "netOperationCost" && prop !== "nTotalRMBOPCC") {  // THESE 5 KEYS WILL NOT BE VISIBLE FOR OTHER TECHNOLOGY ( VISIBLE ONLY FOR ASSEMBLY)
          costingSummary.push({ label: VIEW_COSTING_DATA[prop], value: prop, })
        }

      } else {
        if (prop !== "NCCPartQuantity" && prop !== "IsRegularized" && prop !== "netChildPartsCost" && prop !== "netBoughtOutPartCost" && prop !== "netProcessCost" && prop !== "netOperationCost" && prop !== "nTotalRMBOPCC")  // THESE 5 KEYS WILL NOT BE VISIBLE FOR OTHER TECHNOLOGY ( VISIBLE ONLY FOR ASSEMBLY)
          costingSummary.push({ label: VIEW_COSTING_DATA[prop], value: prop, })
      }
    }

    let masterDataArray = []
    viewCostingData && viewCostingData.map((item, index) => {

      if (index === 0) {
        masterDataArray.push({ label: "", value: `columnA${index}` })
        masterDataArray.push({ label: `Costing\u00A0${index + 1}`, value: `columnB${index}` })

      } else if (item?.CostingHeading !== VARIANCE) {
        masterDataArray.push({ label: `Costing\u00A0${index + 1}`, value: `columnB${index}` })
      }

      if (item?.CostingHeading === VARIANCE) {
        masterDataArray.push({ label: `Variance`, value: `columnB${index}` })
      }
      // dummy.push({ label: "", value: "" })
      // dummy.push({ label: "", value: "" })
    })

    let dataArray = []
    var value = ""

    viewCostingData && viewCostingData.map((element, indexOutside) => {
      let nextObj = checkAssembly(viewCostingData[indexOutside])
      if (element?.netRMCostView.length > 1) {
        nextObj.rm = "Multiple RM"
      }

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
    let finalData = []

    if (getConfigurationKey().IsShowSummaryVertical) {
      temp = TempData
      finalData = data
    } else {
      finalData = VIEW_COSTING_DATA_TEMPLATE
      temp = viewCostingData
    }

    return (
      <ExcelSheet data={temp} name={"Costing Summary"}>
        {finalData && finalData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>
    );
  }

  //FOR DISPLAY PLANT VENDOR NAME AS A HEADER FOR 
  const heading = (value) => {
    let heading = { mainHeading: '', subHeading: '' };
    switch (value?.costingTypeId) {
      case ZBCTypeId:
        heading = { mainHeading: value?.plantName, subHeading: value?.plantCode }
        return heading;
      case VBCTypeId:
      case PFS2TypeId:
        heading = { mainHeading: value?.vendorName, subHeading: value?.vendorCode }
        return heading;
      case CBCTypeId:
        heading = { mainHeading: value?.customerName, subHeading: value?.customerCode }
        return heading;
      case NCCTypeId:
        heading = { mainHeading: value?.vendorName, subHeading: value?.vendorCode }
        return heading;
      default:
        break;
    }
    return heading;
  }

  // FUNCTION FOR OPENING DRAWER WHEN USER CLICK ON HYPER LINK FOR VIEW MULTIPLE TECHNOLOGY
  const DrawerOpen = (value, index) => {
    switch (value) {
      case 'BOP':
        setDrawerOpen({ BOP: true })
        setIndex(index)
        if (index !== -1) {
          let data = viewCostingData[index]?.netBOPCostView
          let bopPHandlingCharges = viewCostingData[index]?.bopPHandlingCharges
          let bopHandlingPercentage = viewCostingData[index]?.bopHandlingPercentage
          let bopHandlingChargeType = viewCostingData[index]?.bopHandlingChargeType
          let childPartBOPHandlingCharges = viewCostingData[index]?.childPartBOPHandlingCharges
          let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
          setViewBOPData({ BOPData: data, bopPHandlingCharges: bopPHandlingCharges, bopHandlingChargeType, bopHandlingPercentage: bopHandlingPercentage, childPartBOPHandlingCharges: childPartBOPHandlingCharges, IsAssemblyCosting: IsAssemblyCosting, partType: partType })
        }

        break;
      case 'process':
        setDrawerOpen({ process: true })
        setIndex(index)
        if (index !== -1) {
          let data = viewCostingData[index]?.netConversionCostView
          let netTransportationCostView = viewCostingData[index]?.netTransportationCostView
          let surfaceTreatmentDetails = viewCostingData[index]?.surfaceTreatmentDetails
          let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
          setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails, IsAssemblyCosting: IsAssemblyCosting, isSurfaceTreatmentCost: false, operationHide: true })
        }

        break;
      case 'operation':
        setDrawerOpen({ operation: true })
        setIndex(index)
        if (index !== -1) {
          let data = viewCostingData[index]?.netConversionCostView
          let netTransportationCostView = viewCostingData[index]?.netTransportationCostView
          let surfaceTreatmentDetails = viewCostingData[index]?.surfaceTreatmentDetails
          let IsAssemblyCosting = viewCostingData[index]?.IsAssemblyCosting
          setViewConversionCostData({ conversionData: data, netTransportationCostView: netTransportationCostView, surfaceTreatmentDetails: surfaceTreatmentDetails, IsAssemblyCosting: IsAssemblyCosting, isSurfaceTreatmentCost: false, processHide: true })
        }
        break;

      default:
        break;
    }
  }
  const pieChartData = {
    labels: pieChartLabel,
    datasets: [
      {
        label: '',
        data: pieChartDataArray,
        backgroundColor: pieChartColor,
        borderWidth: 0.5,
        hoverOffset: 10
      },
    ],

  };
  const pieChartOption = {
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          boxWidth: 15,
          borderWidth: 1,
          color: '#000',
        },

      },
    },
    layout: {
      padding: {
        top: 15
      }
    }
  }

  const PDFPageStyle = "@page { size: A4 landscape; }";

  const tableDataClass = (data) => {
    return props?.isRfqCosting && data.isRFQFinalApprovedCosting && !isApproval && !data?.bestCost ? 'finalize-cost' : ''
  }

  return (
    <Fragment>
      {
        <Fragment>
          {(loader && <LoaderCustom customClass="pdf-loader" />)}
          {(Object.keys(viewCostingData).length === 0 && costingIdExist && !props.isRfqCosting && <LoaderCustom customClass={` ${!props.fromCostingSummary ? 'hidden-loader' : ''}`} />)}
          <Row>
            {!viewMode && (
              <Col md="4">
                <div className="left-border">{'Summary'}</div>
              </Col>
            )}


            {<Col md={simulationMode || props.isRfqCosting ? "12" : "8"} className="text-right">
              <div className='d-flex justify-content-end'>

                {
                  DownloadAccessibility ? <LoaderCustom customClass="pdf-loader" /> :
                    <div className='d-flex justify-content-end'>
                      <ExcelFile filename={'Costing Summary'} fileExtension={'.xls'} element={<button type="button" className={'user-btn excel-btn mr5 mb-2'} title="Excel"><img src={ExcelIcon} alt="download" /></button>}>
                        {onBtExport()}
                      </ExcelFile>
                      {props.isRfqCosting && !isApproval && <button onClick={() => props?.crossButton()} title='Discard Summary' className='CancelIcon rfq-summary-discard'></button>}
                    </div>
                }

                {!simulationMode && !props.isRfqCosting && !props.isRfqCosting &&
                  <ReactToPrint
                    bodyClass='mx-2 mt-3 remove-space-border'
                    documentTitle={`${pdfName}-detailed-costing`}
                    content={reactToPrintContent}
                    pageStyle={PDFPageStyle}
                    onAfterPrint={handleAfterPrintDetail}
                    onBeforeGetContent={handleOnBeforeGetContentDetail}
                    trigger={reactToPrintTriggerDetail}
                  />
                }
                {!simulationDrawer && !drawerViewMode && !props.isRfqCosting && <ReactToPrint
                  bodyClass={`my-3 simple-pdf ${simulationMode ? 'mx-1 simulation-print' : 'mx-2'}`}
                  documentTitle={`${simulationMode ? 'Compare-costing.pdf' : `${pdfName}-costing`}`}
                  content={reactToPrintContent}
                  onAfterPrint={handleAfterPrint}
                  onBeforeGetContent={handleOnBeforeGetContent}
                  trigger={reactToPrintTrigger}
                />}
                {
                  !simulationMode && !props.isRfqCosting && <>

                    {(!viewMode && !isFinalApproverShow) && !props.isRfqCosting && (
                      <button className="user-btn mr-1 mb-2 approval-btn" disabled={isWarningFlag} onClick={() => checkCostings()}>
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
                  </>}
              </div>
              {!simulationMode && !props.isRfqCosting && (showWarningMsg && !warningMsg) && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Costing for this part/Assembly is not yet done!'} />}

            </Col>}
          </Row>
          <div ref={componentRef}>
            <Row id="summaryPdf" className={`${customClass} ${vendorNameClass()} ${drawerDetailPDF ? 'remove-space-border' : ''} ${simulationMode ? "simulation-print" : ""}`}>
              {(drawerDetailPDF || pdfHead) &&
                <>
                  <Col md="12" className='pdf-header-wrapper d-flex justify-content-between'>
                    <CompanyLogo />
                    <CirLogo />
                  </Col>
                  {/* <Col md="12">
                    <h3>Costing Summary:</h3>
                  </Col> */}
                </>}

              <Col md="12">
                <div className={`${viewCostingData[0]?.technologyId !== LOGISTICS ? '' : `overflow-y-hidden ${props?.isRfqCosting ? 'layout-min-height-440px' : ''}`} table-responsive`}>
                  <table className={`table table-bordered costing-summary-table ${approvalMode ? 'costing-approval-summary' : ''}`}>
                    {props.isRfqCosting && <thead>
                      <tr>
                        {<th></th>}
                        {viewCostingData && viewCostingData?.map((data, index) => {
                          return (<>
                            <th key={index} scope="col" className='approval-summary-headers'>{props.uniqueShouldCostingId.includes(data.costingId) ? "Should Cost" : data?.bestCost === true ? "Best Cost" : ""}</th>
                          </>
                          )
                        })}
                      </tr>
                    </thead>}
                    <thead>
                      <tr className="main-row">
                        {isApproval ? <th scope="col" className='approval-summary-headers'>{props.id}</th> : <th scope="col" className={`header-name-left ${isLockedState && !drawerDetailPDF && !pdfHead && costingSummaryMainPage ? 'pt-30' : ''}`}>{props?.isRfqCosting ? 'VBC' : (reactLocalStorage.getObject('cbcCostingPermission')) ? 'VBC/ZBC/NCC/CBC' : 'VBC/ZBC/NCC'}</th>}
                        { }
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            const title = data.costingTypeId === ZBCTypeId ? data?.plantName + "(SOB: " + data?.shareOfBusinessPercent + "%)" : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? data?.vendorName + "(SOB: " + data?.shareOfBusinessPercent + "%)" : data.customerName
                            return (
                              <th scope="col" className={`${tableDataClass(data)} header-name ${isLockedState && data?.status !== DRAFT && costingSummaryMainPage && !pdfHead && !drawerDetailPDF ? 'pt-30' : ''}`}>
                                {data?.IsApprovalLocked && !pdfHead && !drawerDetailPDF && costingSummaryMainPage && data?.status === DRAFT && <WarningMessage title={data?.getApprovalLockedMessage} dClass={"costing-summary-warning-mesaage"} message={data?.getApprovalLockedMessage} />}    {/* ADD THIS CODE ONCE DEPLOYED FROM BACKEND{data.ApprovalLockedMessage}*/}
                                <div className={` ${drawerDetailPDF ? 'pdf-header' : 'header-name-button-container'}`}>
                                  <div className="element d-inline-flex align-items-center">
                                    {
                                      !isApproval && (data?.status === DRAFT) && <>
                                        {!pdfHead && !drawerDetailPDF && !viewMode && < div className="custom-check1 d-inline-block">
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
                                      (isApproval && data?.CostingHeading !== '-') ? <span>{data?.CostingHeading}</span> :
                                        (data?.bestCost === true) ? "" :
                                          <span className={`checkbox-text`} title={title}><div><span>{heading(data).mainHeading}<span> {data.costingTypeId !== CBCTypeId && `(SOB: ${data?.shareOfBusinessPercent}%)`}</span></span><span className='sub-heading'>{heading(data).subHeading}-{data.costingHeadCheck}</span></div></span>
                                    }
                                    {data?.CostingHeading === VARIANCE && ((!pdfHead)) && <TooltipCustom customClass="mb-0 ml-1" id="variance" tooltipText="Variance = (Old Costing - New Costing)" />}
                                  </div>
                                  <div className="action  text-right">
                                    {((!pdfHead && !drawerDetailPDF)) && (data?.IsAssemblyCosting === true) && < button title='View BOM' className="hirarchy-btn mr-1 mb-0 align-middle" type={'button'} onClick={() => viewBomCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && EditAccessibility) && (data?.status === DRAFT) && <button className="Edit mr-1 mb-0 align-middle" type={"button"} title={"Edit Costing"} onClick={() => editCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && AddAccessibility) && <button className="Add-file mr-1 mb-0 align-middle" type={"button"} title={"Add Costing"} onClick={() => addNewCosting(index)} />}
                                    {!isApproval && (data?.bestCost === true ? false : ((!viewMode || props.isRfqCosting || (approvalMode && data?.CostingHeading === '-')) && (!pdfHead && !drawerDetailPDF)) && <button type="button" className="CancelIcon mb-0 align-middle" title='Discard' onClick={() => deleteCostingFromView(index)}></button>)}
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
                              <span className="d-block mt-2">PO Price (Effective from)</span>
                              <span className="d-block">{vendorLabel}</span>
                              <span className="d-block">Part Number</span>
                              <span className="d-block">Part Name</span>
                              <span className="d-block">Revision Number</span>
                              <span className="d-block">Plant (Code)</span>

                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {

                                return (
                                  <td className={tableDataClass(data)}>
                                    <span className={`d-flex justify-content-between ${(data?.bestCost === true) ? '' : 'bg-grey'} ${drawerDetailPDF ? 'p-0' : ''}`}>
                                      {(data?.bestCost === true) ? ' ' : `${DayTime(data?.costingDate).format('DD-MM-YYYY')}-${data?.CostingNumber}${props.isRfqCosting ? (costingIdList?.includes(data?.costingId) ? "-Not Selected" : `-${data?.status}`) : props.costingSummaryMainPage ? `-${data?.status}` : ''}`}{' '}
                                      {
                                        !viewMode &&
                                        <button
                                          className="text-primary d-inline-block btn-a"
                                          onClick={() => editHandler(index)}
                                        >
                                          {(!drawerDetailPDF && !pdfHead) && <small>Change version</small>}
                                        </button>
                                      }
                                    </span>
                                    {(!data?.bestCost === true) && <span className="d-flex justify-content-between align-items-center pie-chart-container"><span>{(data?.bestCost === true) ? ' ' : checkForDecimalAndNull(data?.poPrice, initialConfiguration?.NoOfDecimalForPrice)} {(data?.bestCost === true) ? ' ' : `(${(data?.effectiveDate && data?.effectiveDate !== '') ? DayTime(data?.effectiveDate).format('DD-MM-YYYY') : "-"})`}</span>{(!pdfHead && !drawerDetailPDF && data.totalCost !== 0 && !simulationDrawer) &&
                                      <span className={`pie-chart-wrapper mt-3`}>
                                        {viewPieChart === index ? <button type='button' className='CancelIcon' title='Discard' onClick={() => setViewPieChart(null)}></button> : <button title='View Pie Chart' type='button' className='pie-chart' onClick={() => viewPieData(index)}></button>}
                                        {viewPieChart === index && <span className='pie-chart-inner'> <Costratiograph data={pieChartData} options={pieChartOption} /> </span>}
                                      </span>}
                                    </span>}
                                    {/* USE PART NUMBER KEY HERE */}
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.costingTypeId === VBCTypeId) ? `${data?.vendorName}(${data?.vendorCode})` : ''}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.partNumber}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.partName}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.RevisionNumber}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : (data.costingTypeId === ZBCTypeId ? `${data?.plantName}` : `${data?.destinationPlantName}`)}</span>
                                  </td>
                                )
                              })}
                          </tr> :
                          <tr>
                            {/* // NOT */}
                            <td>
                              <span className="d-block">Part Number</span>
                              <span className="d-block">Part Name</span>
                              {/* <span className="d-block">Revision Number</span> */}
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td>
                                    {/* USE PART NUMBER KEY HERE */}
                                    <span className="d-block">{data?.CostingHeading !== VARIANCE ? data?.partNumber : ''}</span>
                                    <span className="d-block">{data?.CostingHeading !== VARIANCE ? data?.partName : ''}</span>

                                  </td>
                                )
                              })}
                          </tr>
                      }
                      {!isLogisticsTechnology ? <>
                        {partType ? <>
                          <tr>
                            <td>
                              <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducer(viewCostingData[0]?.netRMCostView), reducer(viewCostingData[1]?.netRMCostView))}`}>Part Cost/Pc</span>
                              <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducerFinish(viewCostingData[0]?.netRMCostView), reducerFinish(viewCostingData[1]?.netRMCostView))}`}>{showBopLabel()}Cost/Assembly</span>
                              <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netRMCostView[0]?.BurningLossWeight, viewCostingData[1]?.netRMCostView[0]?.BurningLossWeight)}`}>Process Cost/Assembly</span>
                              <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netRMCostView[0]?.ScrapWeight, viewCostingData[1]?.netRMCostView[0]?.ScrapWeight)}`}>Operation Cost/Assembly</span>
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    <span className="d-block small-grey-text">{data?.CostingHeading !== VARIANCE ? data?.netChildPartsCost : ''}</span>
                                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.rmRate, viewCostingData[1]?.rmRate)}`}>
                                      <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('BOP', index)}>{data?.CostingHeading !== VARIANCE ? data?.netBoughtOutPartCost : ''}</button>
                                    </span>
                                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.scrapRate, viewCostingData[1]?.scrapRate)}`}>
                                      <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('process', index)}>{data?.CostingHeading !== VARIANCE ? data?.netProcessCost : ''}</button>
                                    </span>
                                    <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducer(viewCostingData[0]?.netRMCostView), reducer(viewCostingData[1]?.netRMCostView))}`}>
                                      <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('operation', index)}>{data?.CostingHeading !== VARIANCE ? data?.netOperationCost : ''}</button>
                                    </span>

                                  </td>
                                )
                              })}
                          </tr>
                          {drawerDetailPDF &&
                            <tr><th colSpan={2} className='py-0'>
                              <ViewBOP
                                isOpen={drawerOpen.BOP}
                                viewBOPData={viewBOPData}
                                closeDrawer={closeViewDrawer}
                                anchor={'right'}
                                isPDFShow={true}
                              />
                            </th></tr>}
                          {drawerDetailPDF && <tr>
                            <th colSpan={2} className='py-0'>
                              <ViewConversionCost
                                isOpen={drawerOpen.process}
                                viewConversionCostData={viewConversionCostData}
                                closeDrawer={closeViewDrawer}
                                anchor={'right'}
                                index={index}
                                isPDFShow={true}
                                processShow={true}
                              />
                            </th>
                          </tr>}
                          {drawerDetailPDF && <tr>
                            <th colSpan={2} className='py-0'>
                              <ViewConversionCost
                                isOpen={drawerOpen.operation}
                                viewConversionCostData={viewConversionCostData}
                                closeDrawer={closeViewDrawer}
                                anchor={'right'}
                                index={index}
                                isPDFShow={true}
                                stCostShow={false}
                                operationShow={true}
                              /></th></tr>}
                          {drawerDetailPDF && <tr>
                            <th colSpan={2} className='py-0'>
                              <ViewMultipleTechnology
                                isOpen={viewMultipleTechnologyDrawer}
                                multipleTechnologyData={multipleTechnologyData}
                                closeDrawer={closeViewDrawer}
                                anchor={'right'}
                                index={index}
                                isPDFShow={true}
                                storeSummary={props?.storeSummary ? true : false}
                              /></th></tr>}

                          <tr className={`background-light-blue  ${isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? 'green-row' : viewCostingData[0]?.netRM < viewCostingData[1]?.netRM ? 'red-row' : '' : '-'}`}>
                            <th>Cost/Assembly {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) && '(Old)'}</th>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? <span className='positive-sign'>+</span> : '' : '')}
                                    <span title={data?.nTotalRMBOPCC}>{checkForDecimalAndNull(data?.nTotalRMBOPCC, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                    {
                                      (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                      <button
                                        type="button"
                                        title='View'
                                        className="float-right mb-0 View "
                                        onClick={() => viewMultipleTechnology(index)}
                                      >
                                      </button>
                                    }
                                  </td>
                                )
                              })}
                          </tr>
                        </> :
                          <>
                            {!drawerDetailPDF ? <tr>
                              <td>
                                <span className="d-block small-grey-text">RM-Grade</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.rmRate, viewCostingData[1]?.rmRate)}`}>RM Rate</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.scrapRate, viewCostingData[1]?.scrapRate)}`}>Scrap Rate</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducer(viewCostingData[0]?.netRMCostView), reducer(viewCostingData[1]?.netRMCostView))}`}>Gross Weight</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducerFinish(viewCostingData[0]?.netRMCostView), reducerFinish(viewCostingData[1]?.netRMCostView))}`}>${finishWeightLabel} Weight</span>
                                {viewCostingData && viewCostingData[0]?.technologyId === FORGING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.ForgingScrapWeight, viewCostingData[1]?.ForgingScrapWeight)}`}>Forging Scrap Weight</span>}
                                {viewCostingData && viewCostingData[0]?.technologyId === FORGING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.MachiningScrapWeight, viewCostingData[1]?.MachiningScrapWeight)}`}>Machining Scrap Weight</span>}
                                {viewCostingData && viewCostingData[0]?.technologyId === DIE_CASTING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.CastingWeight, viewCostingData[1]?.CastingWeight)}`}>Casting Weight</span>}
                                {viewCostingData && viewCostingData[0]?.technologyId === DIE_CASTING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.MeltingLoss, viewCostingData[1]?.MeltingLoss)}`}>Melting Loss</span>}
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netRMCostView[0]?.BurningLossWeight, viewCostingData[1]?.netRMCostView[0]?.BurningLossWeight)}`}>Burning Loss Weight</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netRMCostView[0]?.ScrapWeight, viewCostingData[1]?.netRMCostView[0]?.ScrapWeight)}`}>Scrap Weight</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span className="d-block small-grey-text">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : data?.rm : '')}</span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.rmRate, viewCostingData[1]?.rmRate)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.RMRate, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.RMRate, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.scrapRate, viewCostingData[1]?.scrapRate)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducer(viewCostingData[0]?.netRMCostView), reducer(viewCostingData[1]?.netRMCostView))}`}>
                                        {/* try with component */}
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : <span title={(data?.netRMCostView && reducer(data?.netRMCostView))}>{(data?.netRMCostView && reducer(data?.netRMCostView))}</span> : '')}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(reducerFinish(viewCostingData[0]?.netRMCostView), reducerFinish(viewCostingData[1]?.netRMCostView))}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : <span title={(data?.netRMCostView && reducerFinish(data?.netRMCostView))}>{(data?.netRMCostView && reducerFinish(data?.netRMCostView))}</span> : '')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>
                                      {data?.technologyId === FORGING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.ForgingScrapWeight, viewCostingData[1]?.ForgingScrapWeight)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.ForgingScrapWeight && data?.ForgingScrapWeight)}>{(data?.ForgingScrapWeight ? data?.ForgingScrapWeight : "-")}</span> : '-')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>}
                                      {data?.technologyId === FORGING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.MachiningScrapWeight, viewCostingData[1]?.MachiningScrapWeight)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.MachiningScrapWeight && data?.MachiningScrapWeight)}>{(data?.MachiningScrapWeight ? data?.MachiningScrapWeight : '-')}</span> : '-')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>}
                                      {data?.technologyId === DIE_CASTING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.CastingWeight, viewCostingData[1]?.CastingWeight)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.netRMCostView && data?.netRMCostView[0]?.CastingWeight)}>{checkForDecimalAndNull(data?.netRMCostView[0]?.CastingWeight, initialConfiguration?.NoOfDecimalForPrice)}</span> : '-')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>}
                                      {data?.technologyId === DIE_CASTING && <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.MeltingLoss, viewCostingData[1]?.MeltingLoss)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.netRMCostView && data?.netRMCostView[0]?.MeltingLoss)}>{checkForDecimalAndNull(data?.netRMCostView[0]?.MeltingLoss, initialConfiguration?.NoOfDecimalForPrice)}</span> : '-')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>}

                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.BurningLossWeight, viewCostingData[1]?.BurningLossWeight)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.BurningLossWeight, initialConfiguration?.NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.BurningLossWeight, initialConfiguration?.NoOfDecimalForInputOutput)}</span> : '')}
                                        {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration?.NoOfDecimalForInputOutput) : ''} */}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.ScrapWeight, viewCostingData[1]?.ScrapWeight)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView[0]?.ScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(data?.netRMCostView[0]?.ScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput)}</span> : '')}
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

                            <tr className={`background-light-blue  ${isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? 'green-row' : viewCostingData[0]?.netRM < viewCostingData[1]?.netRM ? 'red-row' : '' : '-'}`}>
                              <th>Net RM Cost {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT))}</th>
                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netRM > viewCostingData[1]?.netRM ? <span className='positive-sign'>+</span> : '' : '')}
                                      <span title={data?.netRM}>{checkForDecimalAndNull(data?.netRM, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                      {
                                        (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                        <button
                                          type="button"
                                          title='View'
                                          className="float-right mb-0 View "
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
                            <tr className={`background-light-blue  ${isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.netBOP > viewCostingData[1]?.netBOP ? 'green-row' : viewCostingData[0]?.netBOP < viewCostingData[1]?.netBOP ? 'red-row' : '' : '-'}`}>
                              <th>Net {showBopLabel()} Cost {simulationDrawer && (Number(master) === Number(BOPDOMESTIC) || Number(master) === Number(BOPIMPORT)) && '(Old)'}</th>

                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.netBOP > viewCostingData[1]?.netBOP ? <span className='positive-sign'>+</span> : '' : '')}
                                      <span title={data?.netBOP}>{checkForDecimalAndNull(data?.netBOP, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                      {
                                        (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                        <button
                                          type="button"
                                          title='View'
                                          className="float-right mb-0 View "
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
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.pCost, viewCostingData[1]?.pCost)}`}>Process Cost</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.oCost, viewCostingData[1]?.oCost)}`}>Operation Cost</span>
                                <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netOtherOperationCost, viewCostingData[1]?.netOtherOperationCost)}`}>Other Operation Cost</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.pCost, viewCostingData[1]?.pCost)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Process" : <span title={checkForDecimalAndNull(data?.pCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.pCost, initialConfiguration?.NoOfDecimalForPrice)}</span>) : '')}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.oCost, viewCostingData[1]?.oCost)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Operation" : <span title={checkForDecimalAndNull(data?.oCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.oCost, initialConfiguration?.NoOfDecimalForPrice)}</span>) : '')}
                                      </span>
                                      <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.netOtherOperationCost, viewCostingData[1]?.netOtherOperationCost)}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Other Operation" : <span title={checkForDecimalAndNull(data?.netOtherOperationCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netOtherOperationCost, initialConfiguration?.NoOfDecimalForPrice)}</span>) : '')}
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

                            <tr className={`background-light-blue  ${isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.nConvCost > viewCostingData[1]?.nConvCost ? 'green-row' : viewCostingData[0]?.nConvCost < viewCostingData[1]?.nConvCost ? 'red-row' : '' : '-'}`}>
                              <th>Net Conversion Cost{simulationDrawer && (Number(master) === Number(OPERATIONS)) && '(Old)'}</th>
                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nConvCost > viewCostingData[1]?.nConvCost ? <span className='positive-sign'>+</span> : '' : '')}
                                      <span title={data?.nConvCost}>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nConvCost, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.nConvCost, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                      {
                                        (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                        <button
                                          type="button"
                                          title='View'
                                          className="float-right mb-0 View "
                                          onClick={() => viewConversionCost(index)}
                                        >
                                        </button>
                                      }
                                    </td>
                                  )
                                })}
                            </tr>
                          </>}
                        {!drawerDetailPDF ? <tr>
                          <td>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.sTreatment, viewCostingData[1]?.sTreatment)}`}>
                              Surface Treatment
                            </span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.tCost, viewCostingData[1]?.tCost)}`}>
                              Extra Surface Treatment Cost
                            </span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.sTreatment, viewCostingData[1]?.sTreatment)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : <span title={checkForDecimalAndNull(data?.sTreatment, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.sTreatment, initialConfiguration?.NoOfDecimalForPrice)}</span>) : '')}
                                  </span>
                                  <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.tCost, viewCostingData[1]?.tCost)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ?
                                      (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : <span title={checkForDecimalAndNull(data?.tCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.tCost, initialConfiguration?.NoOfDecimalForPrice)}</span>)
                                      : '')}
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



                        <tr className={`background-light-blue  ${isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.nsTreamnt > viewCostingData[1]?.nsTreamnt ? 'green-row' : viewCostingData[0]?.nsTreamnt < viewCostingData[1]?.nsTreamnt ? 'red-row' : '' : '-'}`}>
                          <th>Net Surface Treatment Cost{simulationDrawer && (Number(master) === Number(SURFACETREATMENT)) && '(Old)'}</th>

                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nsTreamnt > viewCostingData[1]?.nsTreamnt ? <span className='positive-sign'>+</span> : '' : '')}
                                  <span title={data?.netSurfaceTreatmentCost}>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.netSurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.netSurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                  {
                                    (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                    <button
                                      type="button"
                                      title='View'
                                      className="float-right mb-0 View "
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
                            <span className="d-block small-grey-text">
                              Model Type For Overhead/Profit
                            </span>
                            <br />
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.overheadOn.overheadValue, viewCostingData[1]?.overheadOn.overheadValue)}`}>Overhead On</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.profitOn.profitValue, viewCostingData[1]?.profitOn.profitValue)}`}>Profit On</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.rejectionOn.rejectionValue, viewCostingData[1]?.rejectionOn.rejectionValue)}`}>Rejection On</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.iccOn.iccValue, viewCostingData[1]?.iccOn.iccValue)}`}>ICC On</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.paymentTerms.paymentValue, viewCostingData[1]?.paymentTerms.paymentValue)}`}>Payment Terms</span>
                          </td>

                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (

                                <td className={tableDataClass(data)}>
                                  <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.modelType : '')}</span>
                                  <div className={`d-flex`}>
                                    <span className="d-inline-block w-50">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.applicability : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.percentage : '')}
                                    </span>
                                    <span className="d-inline-block w-50">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.aValue.value : '')}
                                    </span>
                                  </div>
                                  <div style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.overheadOn.overheadValue, viewCostingData[1]?.overheadOn.overheadValue)}`}>
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.overheadOn.overheadTitle : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.overheadOn.overheadPercentage : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.overheadOn.overheadValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.overheadOn.overheadValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                    </span>
                                  </div>
                                  <div style={pdfHead ? { marginTop: '-3px' } : {}} className={`d-flex ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.profitOn.profitValue, viewCostingData[1]?.profitOn.profitValue)}`}>
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.profitOn.profitTitle : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.profitOn.profitPercentage : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.profitOn.profitValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.profitOn.profitValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                    </span>
                                  </div>
                                  <div style={pdfHead ? { marginTop: '-2px' } : {}} className={`d-flex ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.rejectionOn.rejectionValue, viewCostingData[1]?.rejectionOn.rejectionValue)}`}>
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.rejectionOn.rejectionTitle : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.rejectionOn.rejectionPercentage : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.rejectionOn.rejectionValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.rejectionOn.rejectionValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                    </span>
                                  </div>
                                  <div style={pdfHead ? { marginTop: '-1px' } : {}} className={`d-flex  ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.iccOn.iccValue, viewCostingData[1]?.iccOn.iccValue)}`}>
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.iccOn.iccTitle : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.iccOn.iccPercentage : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.iccOn.iccValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.iccOn.iccValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                    </span>
                                  </div>
                                  <div style={pdfHead ? { marginTop: '-1px' } : {}} className={`d-flex ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.paymentTerms.paymentValue, viewCostingData[1]?.paymentTerms.paymentValue)}`}>
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.paymentTerms.paymentTitle : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.paymentTerms.paymentPercentage : '')}
                                    </span>{' '}
                                    <span className="d-inline-block w-50 small-grey-text">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.paymentTerms.paymentValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.paymentTerms.paymentValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
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

                        <tr className={`background-light-blue ${!props?.isRfqCosting && isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nOverheadProfit > viewCostingData[1]?.nOverheadProfit ? 'green-row' : viewCostingData[0]?.nOverheadProfit < viewCostingData[1]?.nOverheadProfit ? 'red-row' : ' ' : '-'}`}>
                          <th>Net Overheads & Profits</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nOverheadProfit > viewCostingData[1]?.nOverheadProfit ? <span className='positive-sign'>+</span> : '' : '')}
                                  <span title={data?.nOverheadProfit}>{checkForDecimalAndNull(data?.nOverheadProfit, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                  {
                                    (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                    <button
                                      type="button"
                                      title='View'
                                      className="float-right mb-0 View "
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
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.packagingCost, viewCostingData[1]?.packagingCost)}`}>Packaging Cost</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.freight, viewCostingData[1]?.freight)}`}>Freight</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <span title={data?.packagingCost} className={`d-block small-grey-text w-fit ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.packagingCost, viewCostingData[1]?.packagingCost)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.packagingCost, initialConfiguration?.NoOfDecimalForPrice) : '')}
                                  </span>
                                  <span title={data?.freight} className={`d-block small-grey-text w-fit ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.freight, viewCostingData[1]?.freight)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.freight, initialConfiguration?.NoOfDecimalForPrice) : '')}
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

                        <tr className={`background-light-blue ${!props?.isRfqCosting && isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPackagingAndFreight > viewCostingData[1]?.nPackagingAndFreight ? 'green-row' : viewCostingData[0]?.nPackagingAndFreight < viewCostingData[1]?.nPackagingAndFreight ? 'red-row' : ' ' : '-'}`}>
                          <th>Net Packaging & Freight</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPackagingAndFreight > viewCostingData[1]?.nPackagingAndFreight ? <span className='positive-sign'>+</span> : '' : '')}
                                  <span title={data?.nPackagingAndFreight}>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                  {/* <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice) : ''}</span> */}
                                  {
                                    (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                    <button
                                      type="button"
                                      title='View'
                                      className="float-right mb-0 View "
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
                            <span className="d-block small-grey-text pt-3"></span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolMaintenanceCost, viewCostingData[1]?.toolMaintenanceCost)}`}>{`${toolMaintenanceCostLabel} on`}</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolPrice, viewCostingData[1]?.toolPrice)}`}>Tool Price</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.amortizationQty, viewCostingData[1]?.amortizationQty)}`}>Amortization Quantity (Tool Life)</span>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolAmortizationCost, viewCostingData[1]?.toolAmortizationCost)}`}>Tool Amortization Cost</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={`${tableDataClass(data)} ${pdfHead || drawerDetailPDF ? '' : ''}`}>
                                  <div className={`d-flex`}>
                                    <span className="d-inline-block p-0 w-50">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.toolApplicability.applicability : '')}
                                    </span>{' '}
                                    &nbsp;{' '}
                                    <span className="d-inline-block p-0 w-50">
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.toolApplicability.value : '')}
                                    </span>
                                  </div>
                                  <div className={`d-flex ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolMaintenanceCost, viewCostingData[1]?.toolMaintenanceCost)}`}>
                                    <span className="d-inline-block w-50 ">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.toolApplicabilityValue.toolTitle : '')}</span> &nbsp;{' '}
                                    <span className="d-inline-block w-50 "> {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.toolMaintenanceCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.toolMaintenanceCost, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}</span>
                                  </div>

                                  <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolPrice, viewCostingData[1]?.toolPrice)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.toolPrice, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.toolPrice, initialConfiguration?.NoOfDecimalForPrice)}</span> : '')}
                                  </span>
                                  <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.amortizationQty, viewCostingData[1]?.amortizationQty)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.amortizationQty : '')}
                                  </span>
                                  <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.toolAmortizationCost, viewCostingData[1]?.toolAmortizationCost)}`}>
                                    {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.toolAmortizationCost : '')}
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

                        <tr className={`background-light-blue ${!props?.isRfqCosting && isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.totalToolCost > viewCostingData[1]?.totalToolCost ? 'green-row' : viewCostingData[0]?.totalToolCost < viewCostingData[1]?.totalToolCost ? 'red-row' : ' ' : '-'}`}>
                          <th>Net Tool Cost</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.totalToolCost > viewCostingData[1]?.totalToolCost ? <span className='positive-sign'>+</span> : '' : '')}
                                  <span title={data?.totalToolCost}>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.totalToolCost, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.totalToolCost, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                  {
                                    (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                    <button
                                      type="button"
                                      title='View'
                                      className="float-right mb-0 View "
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
                            <span className="d-block small-grey-text">
                              {discountLabel}
                            </span>
                            <span className="d-block small-grey-text"></span>
                          </td>
                          { }
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                (data?.bestCost !== true) && data?.CostingHeading !== VARIANCE ?
                                  <td className={tableDataClass(data)} width={"32%"}>
                                    <div className="d-grid">
                                      {/* <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.discount : ''}</span> &nbsp;{' '}
                                       <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.value : ''}</span> */}
                                      <span className="d-inline-block ">{"Type"}</span>
                                      <span className="d-inline-block ">{"Applicability"}</span>
                                      <span className="d-inline-block ">{"Value"}</span>
                                      <span className="d-inline-block ">{"Cost"}</span>
                                    </div>
                                    <div className={`d-grid ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.otherDiscountValue.discountValue, viewCostingData[1]?.otherDiscountValue.discountValue)}`}>
                                      <span className="d-inline-block small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.otherDiscountValue.dicountType : '')}
                                      </span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.otherDiscountValue.dicountType === "Percentage" ? data?.otherDiscountValue.discountApplicablity : '-'}</span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.otherDiscountValue.dicountType === "Percentage" ? <span title={checkForDecimalAndNull(data?.otherDiscountValue.discountPercentValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.otherDiscountValue.discountPercentValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : '-'}</span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.otherDiscountValue.discountValue, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.otherDiscountValue.discountValue, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''}</span>
                                    </div>
                                  </td>
                                  : ""


                              )
                            })}
                        </tr>
                        { }
                        <tr className='border-right'>
                          <td>
                            <span className="d-block small-grey-text"> Any Other Cost</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (

                                (data?.bestCost !== true) && data?.CostingHeading !== VARIANCE ?
                                  <td className={tableDataClass(data)} width={"32%"}>
                                    <div className="d-grid">

                                      <span className="d-inline-block">{"Type"}</span>
                                      <span className="d-inline-block">{"Applicability"}</span>
                                      <span className="d-inline-block">{"Value"}</span>
                                      <span className="d-inline-block">{"Cost"}</span>
                                    </div>
                                    <div className={`d-grid ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.anyOtherCost, viewCostingData[1]?.anyOtherCost)}`}>
                                      <span className="d-inline-block small-grey-text">
                                        {data?.CostingHeading !== VARIANCE ? data?.anyOtherCostType : ''}
                                      </span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.anyOtherCostType === "Percentage" ? data?.anyOtherCostApplicablity : '-'}</span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.anyOtherCostType === "Percentage" ? <span title={checkForDecimalAndNull(data?.anyOtherCostPercent, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.anyOtherCostPercent, initialConfiguration?.NoOfDecimalForPrice)}</span> : '-'}</span>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.anyOtherCost, initialConfiguration?.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.anyOtherCost, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''}</span>
                                    </div>
                                  </td>
                                  : ""

                              )
                            })}
                        </tr>

                        {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <tr>
                          <td>
                            <span className={`d-block small-grey-text ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.BasicRate, viewCostingData[1]?.BasicRate)}`}>Basic Price</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <span title={data?.BasicRate} className={`d-block small-grey-text w-fit ${isApproval && viewCostingData?.length > 1 && !props.isRfqCosting && highlightCostingSummaryValue(viewCostingData[0]?.BasicRate, viewCostingData[1]?.BasicRate)}`}>
                                    {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.BasicRate, initialConfiguration?.NoOfDecimalForPrice) : ''}
                                  </span>

                                </td>
                              )
                            })}
                        </tr>}
                        {initialConfiguration?.IsShowNpvCost && drawerDetailPDF && <tr><th colSpan={2}>
                          <AddNpvCost
                            isOpen={openNpvDrawer}
                            costingSummary={true}
                            viewCostingData={viewCostingData}
                            tableData={[]}
                            npvIndex={npvIndex}
                            closeDrawer={closeNpvDrawer}
                            anchor={'right'}
                            isPDFShow={true}
                          />
                        </th></tr>}
                      </> : <>
                        {drawerDetailPDF && <tr><th colSpan={2}><ViewPackagingAndFreight
                          isOpen={isViewPackagingFreight}
                          packagingAndFreightCost={viewPackagingFreight}
                          closeDrawer={closeViewDrawer}
                          isLogisticsTechnology={isLogisticsTechnology}
                          anchor={'right'}
                          isPDFShow={true} /></th></tr>}
                        <tr className={`background-light-blue ${!props?.isRfqCosting && isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPackagingAndFreight > viewCostingData[1]?.nPackagingAndFreight ? 'green-row' : viewCostingData[0]?.nPackagingAndFreight < viewCostingData[1]?.nPackagingAndFreight ? 'red-row' : ' ' : '-'}`}>
                          <th>Net Freight </th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPackagingAndFreight > viewCostingData[1]?.nPackagingAndFreight ? <span className='positive-sign'>+</span> : '' : '')}
                                  <span title={data?.nPackagingAndFreight}>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                  {/* <span>{data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.nPackagingAndFreight, initialConfiguration?.NoOfDecimalForPrice) : ''}</span> */}
                                  {
                                    (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                    <button
                                      type="button"
                                      title='View'
                                      className="float-right mb-0 View "
                                      onClick={() => viewPackagingAndFrieghtData(index)}
                                    >

                                    </button>
                                  }
                                </td>
                              )
                            })}
                        </tr>
                      </>}

                      {

                        <tr className={`background-light-blue netPo-row ${!props?.isRfqCosting && isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? 'green-row' : viewCostingData[0]?.nPOPrice < viewCostingData[1]?.nPOPrice ? 'red-row' : '' : '-'}`}>
                          <th>Net PO Price ({getConfigurationKey().BaseCurrency}){simulationDrawer && '(Old)'}</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td className={tableDataClass(data)}>
                                {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPrice > viewCostingData[1]?.nPOPrice ? <span className='positive-sign'>+</span> : '' : '')}
                                <span title={data?.nPOPrice}><span className='currency-symbol'>{getCurrencySymbol(getConfigurationKey().BaseCurrency)}</span>{checkForDecimalAndNull(data?.nPOPrice, initialConfiguration?.NoOfDecimalForPrice)}</span>
                                {(data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) && (initialConfiguration?.IsBasicRateAndCostingConditionVisible || initialConfiguration?.IsShowNpvCost) &&
                                  <button
                                    type="button"
                                    title='View'
                                    className="float-right mb-0 View "
                                    onClick={() => viewNpvData(index)}
                                  >
                                  </button>
                                }
                              </td >
                            })}

                        </tr >
                      }

                      {viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
                        <td>
                          <span className="d-block small-grey-text">Currency</span>
                        </td>
                        {viewCostingData &&
                          viewCostingData?.map((data) => {
                            return (
                              <td className={tableDataClass(data)}>
                                <div>
                                  <span className={`small-grey-text mr-1 ${data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? 'd-none' : '' : ''}  `}>{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? `${data?.currency.currencyTitle}/${getConfigurationKey().BaseCurrency}` : '')}</span> {' '}
                                  <span className="">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? '-' : checkForDecimalAndNull(data?.currency.currencyValue, initialConfiguration?.NoOfDecimalForPrice) : '')}</span>
                                </div>
                              </td>
                            )
                          })}
                      </tr>}


                      {viewCostingData[0]?.technologyId !== LOGISTICS &&
                        <tr className={`background-light-blue  ${getCurrencyVarianceFormatter()}`}>
                          <th>Net PO Price (In Currency){simulationDrawer && '(Old)'}</th>
                          {/* {viewCostingData &&
                        viewCostingData?.map((data, index) => {
                          return <td>Net PO Price({(data?.currency.currencyTitle !== '-' ? data?.currency.currencyTitle : 'INR')})</td>
                        })} */}


                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td className={tableDataClass(data)}> {data?.CostingHeading === VARIANCE && (isApproval ? viewCostingData?.length > 0 && viewCostingData[0]?.nPOPriceWithCurrency > viewCostingData[1]?.nPOPriceWithCurrency ? <span className='positive-sign'>+</span> : '' : '')}
                                <span title={(data?.currency?.currencyTitle) !== "-" ? (data?.nPOPriceWithCurrency) : data?.nPOPrice}><span className='currency-symbol'>
                                  {getCurrencySymbol(data?.currency.currencyTitle !== '-' ?
                                    data?.currency.currencyTitle : getConfigurationKey().BaseCurrency)}
                                </span>{data?.nPOPriceWithCurrency !== null ? checkForDecimalAndNull(((data?.currency?.currencyTitle === "-") || ((data?.bestCost === true && data?.currency?.currencyTitle === undefined))) ? data?.nPOPrice : (data?.nPOPriceWithCurrency), initialConfiguration?.NoOfDecimalForPrice) : '-'}</span> </td>
                            })}
                        </tr>
                      }

                      { }
                      {IsNccCosting && <>
                        <tr>
                          <td>
                            <span className="d-block small-grey-text">Quantity</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <div>
                                    <span className="">{data?.CostingHeading !== VARIANCE ? data?.NCCPartQuantity === '-' ? '-' : checkForDecimalAndNull(data?.NCCPartQuantity, initialConfiguration?.NoOfDecimalForPrice) : ''}</span>
                                  </div>
                                </td>
                              )
                            })}
                        </tr>

                        <tr>
                          <td>
                            <span className="d-block small-grey-text">Is Regularized</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <div>
                                    <span className="">{data?.CostingHeading !== VARIANCE ? (data.IsRegularized ? 'Yes' : 'No') : ""}</span>
                                  </div>
                                </td>
                              )
                            })}
                        </tr>
                      </>}

                      {viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
                        <td>Attachments</td>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (

                              <td className={tableDataClass(data)}>
                                {(data?.bestCost === true) ? ' ' :
                                  (data?.CostingHeading !== VARIANCE &&
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
                                            <div className={"single-attachment images"}>
                                              <a href={fileURL} target="_blank" rel="noreferrer">
                                                {f.OriginalFileName}
                                              </a>
                                            </div>
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
                                    ))
                                }
                              </td>
                            )
                          })}
                      </tr>}


                      {viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
                        <th>Remarks</th>
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return <td className={tableDataClass(data)}><span className="d-block small-grey-text">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.remark : '')}</span></td>
                          })}
                      </tr>}

                      {(!viewMode) && (
                        <tr className={`${pdfHead || drawerDetailPDF ? 'd-none' : 'background-light-blue'}`}>
                          <td className="text-center"></td>

                          {viewCostingData?.map((data, index) => {

                            return (

                              <td className="text-center costing-summary">
                                {(!viewMode && !isFinalApproverShow) &&
                                  (data?.status === DRAFT) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    className="user-btn"
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
        drawerOpen.BOP && (
          <ViewBOP
            isOpen={drawerOpen.BOP}
            viewBOPData={viewBOPData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
          />
        )
      }
      {
        drawerOpen.process && (
          <ViewConversionCost
            isOpen={drawerOpen.process}
            viewConversionCostData={viewConversionCostData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
            index={index}
            isPDFShow={false}
          />
        )
      }
      {
        drawerOpen.operation && (
          <ViewConversionCost
            isOpen={drawerOpen.operation}
            viewConversionCostData={viewConversionCostData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
            index={index}
            isPDFShow={false}
          />
        )
      }
      {
        viewMultipleTechnologyDrawer && (
          <ViewMultipleTechnology
            isOpen={viewMultipleTechnologyDrawer}
            multipleTechnologyData={multipleTechnologyData}
            closeDrawer={closeViewDrawer}
            anchor={'right'}
            index={index}
            isPDFShow={false}
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
            fromCostingSummary={props.fromCostingSummary}
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
            fromCostingSummary={props.fromCostingSummary}
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
            isLogisticsTechnology={isLogisticsTechnology}
            anchor={'right'}
            simulationMode={simulationMode}
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
            callSapCheckAPI={false}
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

      {initialConfiguration?.IsShowNpvCost &&
        openNpvDrawer && <AddNpvCost
          isOpen={openNpvDrawer}
          viewCostingData={viewCostingData}
          costingSummary={true}
          tableData={[]}
          npvIndex={npvIndex}
          closeDrawer={closeNpvDrawer}
          anchor={'right'}
          partId={viewCostingData[npvIndex]?.partId}
          vendorId={viewCostingData[npvIndex]?.vendorId}
          isRfqCosting={props?.isRfqCosting}
          totalCostFromSummary={true}
        />
      }
    </Fragment >
  )
}

export default RejectedCostingSummaryTable
