import React, { Fragment, useEffect, useState, useRef, useCallback } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import AddToComparisonDrawer from './AddToComparisonDrawer'
import {
  setCostingViewData, setCostingApprovalData, getBriefCostingById,
  storePartNumber, getSingleCostingDetails, createCosting, checkFinalUser, getCostingByVendorAndVendorPlant, setRejectedCostingViewData, updateSOBDetail, setCostingMode, getReleaseStrategyApprovalDetails, createMultiTechnologyCosting
} from '../actions/Costing'
import ViewBOP from './Drawers/ViewBOP'
import ViewConversionCost from './Drawers/ViewConversionCost'
import ViewRM from './Drawers/ViewRM'
import ViewOverheadProfit from './Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from './Drawers/ViewPackagingAndFreight'
import ViewToolCost from './Drawers/viewToolCost'
import SendForApproval from './approval/SendForApproval'
import Toaster from '../../common/Toaster'
import { checkForDecimalAndNull, checkForNull, checkPermission, formViewData, getTechnologyPermission, loggedInUserId, userDetails, allEqual, getConfigurationKey, getCurrencySymbol, highlightCostingSummaryValue, checkVendorPlantConfigurable, userTechnologyLevelDetails, showSaLineNumber, showBopLabel, checkTechnologyIdAndRfq } from '../../../helper'
import Attachament from './Drawers/Attachament'
import { BOPDOMESTIC, BOPIMPORT, COSTING, DRAFT, FILE_URL, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, VARIANCE, VBC, ZBC, VIEW_COSTING_DATA, VIEW_COSTING_DATA_LOGISTICS, NCC, EMPTY_GUID, ZBCTypeId, VBCTypeId, NCCTypeId, CBCTypeId, VIEW_COSTING_DATA_TEMPLATE, PFS2TypeId, REJECTED, SWAP_POSITIVE_NEGATIVE, WACTypeId, UNDER_REVISION, showDynamicKeys, } from '../../../config/constants'
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
import { DIE_CASTING, IdForMultiTechnology, PLASTIC, TOOLING_ID } from '../../../config/masterData'
import ViewMultipleTechnology from './Drawers/ViewMultipleTechnology'
import TooltipCustom from '../../common/Tooltip'
import { Costratiograph } from '../../dashboard/CostRatioGraph'
import { colorArray } from '../../dashboard/ChartsDashboard'
import { LOGISTICS, FORGING } from '../../../config/masterData'
import { reactLocalStorage } from 'reactjs-localstorage'
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions'
import { getMultipleCostingDetails } from '../../rfq/actions/rfq'
import CostingDetailSimulationDrawer from '../../simulation/components/CostingDetailSimulationDrawer'
import ViewOtherCostDrawer from './ViewOtherCostDrawer'
import { TextFieldHookForm } from '../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import { number, percentageLimitValidation, decimalNumberLimit6 } from '../../../helper/validation'
import Button from '../../layout/Button'
import { getUsersTechnologyLevelAPI } from '../../../actions/auth/AuthActions'
import TourWrapper from '../../common/Tour/TourWrapper'
import { Steps } from './TourMessages'
import { useTranslation } from 'react-i18next';
import ViewTcoDetail from './CostingHeadCosts/AdditionalOtherCost/ViewTcoDetail'
import AddNpvCost from './CostingHeadCosts/AdditionalOtherCost/AddNpvCost'
import { BarChartComparison } from './BarChartComparison'
import { CirLogo, CompanyLogo, useLabels } from '../../../helper/core'



const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const CostingSummaryTable = (props) => {
  const { vendorLabel } = useLabels()
  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });


  const { viewMode, showDetail, technologyId, costingID, showWarningMsg, simulationMode, isApproval, simulationDrawer, customClass, selectedTechnology, master, isSimulationDone, approvalMode, drawerViewMode, costingSummaryMainPage, costingIdExist, costingIdList, notSelectedCostingId, isFromViewRFQ, compareButtonPressed, showEditSOBButton, partTypeValue, technology } = props
  const { t } = useTranslation("Costing")
  const [totalCost, setTotalCost] = useState(0)
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
  const [isComparing, setIsComparing] = useState(false);

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
  const [viewRejectionRecoveryData, setViewRejectionRecoveryData] = useState([])
  const [viewProfitData, setViewProfitData] = useState([])
  const [viewToolCost, setViewToolCost] = useState([])
  const [viewRejectAndModelType, setViewRejectAndModelType] = useState({})
  const [viewPackagingFreight, setViewPackagingFreight] = useState({})
  const [multipleCostings, setMultipleCostings] = useState([])
  const [isWarningFlag, setIsWarningFlag] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [rmMBDetail, setrmMBDetail] = useState({})
  const [viewAtttachments, setViewAttachment] = useState([])
  const [pdfHead, setPdfHead] = useState(false);
  const [drawerDetailPDF, setDrawerDetailPDF] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isAttachment, setAttachment] = useState(false)
  const [viewPieChart, setViewPieChart] = useState({})
  const [pieChartColor, setPieChartColor] = useState([])
  /*CONSTANT FOR  CREATING AND EDITING COSTING*/
  const [partInfoStepTwo, setPartInfo] = useState({});
  const [index, setIndex] = useState('')

  const [AddAccessibility, setAddAccessibility] = useState(true)
  const [EditAccessibility, setEditAccessibility] = useState(true)
  const [ViewAccessibility, setViewAccessibility] = useState(true)
  const [downloadAccessibility, setDownloadAccessibility] = useState(true)

  const [iccPaymentData, setIccPaymentData] = useState("")
  const { initialConfiguration, topAndLeftMenuData } = useSelector(state => state.auth)

  const [warningMsg, setShowWarningMsg] = useState(false)
  const [isLockedState, setIsLockedState] = useState(false)
  const [viewMultipleTechnologyDrawer, setViewMultipleTechnologyDrawer] = useState(false)
  const [multipleTechnologyData, setMultipleTechnologyData] = useState([])
  const [pieChartLabel, setPieChartLabel] = useState([])
  const [activePieChart, setActivePieChart] = useState(null);
  const [npvIndex, setNpvIndex] = useState(0)
  const [showLabourData, setShowLabourData] = useState(initialConfiguration.IsShowCostingLabour ? initialConfiguration.IsShowCostingLabour : false)
  const [selectedCheckbox, setSelectedCheckbox] = useState('')
  const [showPieChartObj, setShowPieChartObj] = useState([])
  const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
  const [viewCostingData, setViewCostingData] = useState([])

  const [viewButton, setViewButton] = useState(true)
  const [editButton, setEditButton] = useState(true)
  const [pieChartButton, setPieChartButton] = useState(false)
  const [viewBomButton, setViewBomButton] = useState(true)
  const [paymentTermsData, setPaymentTermsData] = useState([])
  const [npvData, setNpvData] = useState([])
  const [isScrapRecoveryPercentageApplied, setIsScrapRecoveryPercentageApplied] = useState(false)
  const [otherCostDetailsOverhead, setOtherCostDetailsOverhead] = useState([])
  const [otherCostDetailsProcess, setOtherCostDetailsProcess] = useState([])
  const [varianceData, setVarianceData] = useState([])
  const { viewCostingDetailData, viewRejectedCostingDetailData, viewCostingDetailDataForAssembly } = useSelector((state) => state.costing)
  const showCheckbox = viewCostingData && viewCostingData.some(item => item.IsShowCheckBoxForApproval === true);

  useEffect(() => {
    if (viewCostingDetailData && viewCostingDetailData?.length > 0 && !props?.isRejectedSummaryTable && !props?.isFromAssemblyTechnology) {
      setViewCostingData(viewCostingDetailData)
    } else if (viewRejectedCostingDetailData && viewRejectedCostingDetailData?.length > 0 && props?.isRejectedSummaryTable && !props?.isFromAssemblyTechnology) {
      setViewCostingData(viewRejectedCostingDetailData)
    } else if (viewCostingDetailDataForAssembly && viewCostingDetailDataForAssembly?.length > 0 && props?.isFromAssemblyTechnology) {
      setViewCostingData(viewCostingDetailDataForAssembly)
    }


  }, [viewCostingDetailData, viewRejectedCostingDetailData, viewCostingDetailDataForAssembly])

  const commonFunction = (value) => {
    let tempObj = {}
    viewCostingData && viewCostingData.map((item, index) => {
      item[value] && item[value].map(element => {
        const header = element?.DynamicHeader;

        // Initialize arrayList if the DynamicHeader doesn't exist
        if (!tempObj[header]) {
          tempObj[header] = { arrayList: [] };
        }

        // Place the current element at the corresponding index
        tempObj[header].arrayList[index] = { ...element, index };

        // Ensure all previous indices have values or are empty
        for (let i = 0; i < index; i++) {
          if (tempObj[header].arrayList[i] === undefined) {
            tempObj[header].arrayList[i] = {};
          }
        }
      });
    });
    return tempObj
  }

  useEffect(() => {
    setIsScrapRecoveryPercentageApplied((_.map(viewCostingData, 'IsScrapRecoveryPercentageApplied') || []).some(value => value === true));
    if (showDynamicKeys) {
      setOtherCostDetailsOverhead(commonFunction('OtherCostDetailsOverhead'))
      setOtherCostDetailsProcess(commonFunction('OtherCostDetailsProcess'))
    }
  }, [viewCostingData])


  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const partInfo = useSelector((state) => state.costing.partInfo)
  const partNumber = useSelector(state => state.costing.partNo);
  const [pdfName, setPdfName] = useState('')
  const [IsOpenViewHirarchy, setIsOpenViewHirarchy] = useState(false);
  const [viewBomPartId, setViewBomPartId] = useState("");
  const [dataSelected, setDataSelected] = useState([]);
  const [IsNccCosting, setIsNccCosting] = useState(false);
  const [isLogisticsTechnology, setIsLogisticsTechnology] = useState(false);
  const [openNpvDrawer, setNpvDrawer] = useState(false);
  const [isOpenRejectedCosting, setIsOpenRejectedCosting] = useState(false);
  const [isFinalCommonApproval, setIsFinalCommonApproval] = useState(false);
  const [tcoAndNpvDrawer, setTcoAndNpvDrawer] = useState(false);
  const [costingId, setCostingId] = useState("");
  const { discountLabel, toolMaintenanceCostLabel } = useLabels();

  const [drawerOpen, setDrawerOpen] = useState({
    BOP: false,
    process: false,
    operation: false
  })
  const [pieChartDataArray, setPieChartDataArray] = useState([])
  const [count, setCount] = useState(0);
  const [disableSendForApproval, setDisableSendForApproval] = useState(false)
  const [cssObj, setCssObj] = useState({})
  const [rfqCosting, setRfqCosting] = useState(props?.isRfqCosting)
  const componentRef = useRef();
  const onBeforeContentResolve = useRef(null)
  const onBeforeContentResolveDetail = useRef(null)

  useEffect(() => {
    if (viewCostingDetailData && viewCostingDetailData.length > 0 && !props?.isRejectedSummaryTable) {
      setViewCostingData(viewCostingDetailData)
      checkTechnologyIdAndRfq(viewCostingData)
    } else if (viewRejectedCostingDetailData && viewRejectedCostingDetailData.length > 0 && props?.isRejectedSummaryTable) {
      setViewCostingData(viewRejectedCostingDetailData)
    }


  }, [viewCostingDetailData, viewRejectedCostingDetailData])

  useEffect(() => {
    setIsScrapRecoveryPercentageApplied((_.map(viewCostingData, 'IsScrapRecoveryPercentageApplied') || []).some(value => value === true));
  }, [viewCostingData])

  const selectedRowRFQ = useSelector((state) => state.rfq.selectedRowRFQ)




  const partType = IdForMultiTechnology?.includes(String(viewCostingData[0]?.technologyId) || String(viewCostingData[0]?.technologyId) === WACTypeId)       //CHECK IF MULTIPLE TECHNOLOGY DATA IN SUMMARY




  useEffect(() => {
    applyPermission(topAndLeftMenuData, selectedTechnology);
    setIsSuperAdmin(userDetails()?.Role === "SuperAdmin");

    return () => {
      if (rfqCosting === false) {
        dispatch(setCostingViewData([]));
      }
    };
  }, []);

  useEffect(() => {
    if (compareButtonPressed === true) {
      setMultipleCostings([])
    }
  }, [compareButtonPressed])

  useEffect(() => {
    setViewPieChart({ 0: false })
  }, [props.partNumber.value])

  useEffect(() => {
    if (viewCostingData && viewCostingData.length > 0 && viewCostingData[0]) {

      const isPartType = partTypeValue?.label;
      const status = viewCostingData[0].status;
      const totalCost = viewCostingData[0].totalCost

      setPieChartButton(true)
      setTotalCost(totalCost)
      if (status === 'Approved' || status === 'RejectedBySystem' || status === 'ApprovedBySimulation' || status === 'ApprovedByASMSimulation' || status === 'ApprovedByAssembly' || status === 'History' || status === 'PendingForApproval' || status === 'Pushed' || status === 'Rejected' || status === 'Provisinal' || status === 'POUpdated' || status === 'Linked' || status === 'CreatedBySimulation' || status === 'CreatedByAssembly' || status === 'Linked') {
        setEditButton(false);
        setViewButton(false);

      } else if (status === "Error" || status === "AwaitingApproval") {
        setEditButton(false);

      }
      if (isPartType === "Component") {
        setViewBomButton(false)
      }

    }
  }, [viewCostingData]);

  useEffect(() => {

    if (!viewMode && viewCostingData?.length !== 0 && partInfo && count === 0 && technologyId) {
      setCount(1)
      if (initialConfiguration.IsReleaseStrategyConfigured) {
        let data = []
        viewCostingData && viewCostingData?.map(item => {
          let obj = {}
          obj.CostingId = item?.costingId
          data.push(obj)
        })

        let requestObject = {
          "RequestFor": "COSTING",
          "TechnologyId": technologyId,
          "LoggedInUserId": loggedInUserId(),
          "ReleaseStrategyApprovalDetails": data
        }
        dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
          let obj = {}
          obj.DepartmentId = userDetails().DepartmentId
          obj.UserId = loggedInUserId()
          obj.TechnologyId = partInfo.TechnologyId
          obj.Mode = 'costing'
          obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(viewCostingData[0]?.costingTypeId)
          dispatch(checkFinalUser(obj, res => {
            if (res.data?.Result) {
              // setIsFinalApproverShow(res.data?.Data?.IsFinalApprover)
              setIsFinalCommonApproval(res.data?.Data?.IsFinalApprover)
              if (res.data?.Data?.IsUserInApprovalFlow === false) {
                // setDisableSendForApproval(true)
              }
            }
          }))

        }))
      }

    }
    if (viewCostingData?.length > (window.screen.width >= 1600 ? 3 : 2)) {
      setCssObj(prevState => ({ ...prevState, width: "auto", particularWidth: 50 / viewCostingData.length, tableWidth: (window.screen.width >= 1600 ? 540 : 480) * viewCostingData.length + "px" }))
    } else {
      setCssObj(prevState => ({ ...prevState, particularWidth: 50 / viewCostingData.length, tableWidth: "auto" }))
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
    let pieChartData = []
    viewCostingData.map((item, index) => {

      let temp = []
      let tempObj = viewCostingData[index]
      let labels = [partType ? 'COST/ASSEMBLY' : 'RM', 'BOP', 'CC', 'ST', 'O&P', 'P&F', 'TC', 'HUNDI/DIS', 'ANY OTHER COST', 'CONDITION COST', 'NPV COST']
      let dataArray = [];
      let tempColorArray = [];

      temp = [
        checkForDecimalAndNull(partType ? tempObj?.nTotalRMBOPCC : tempObj?.netRM, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.netBOP, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(partType ? 0 : tempObj?.nConvCost, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.nsTreamnt, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.totalToolCost, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.otherDiscountCost, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.anyOtherCostTotal, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.CostingPartDetails?.NetConditionCost, initialConfiguration.NoOfDecimalForPrice),
        checkForDecimalAndNull(tempObj?.CostingPartDetails?.NetNpvCost, initialConfiguration.NoOfDecimalForPrice),
      ]

      let labelArray = temp.reduce((acc, item, index) => {
        if (item !== 0) {
          acc.push(labels[index]);
        }
        return acc;
      }, []);

      labelArray.forEach(item => {
        switch (item) {
          case partType ? 'COST/ASSEMBLY' : 'RM':
            dataArray.push(checkForDecimalAndNull(partType ? tempObj?.nTotalRMBOPCC : tempObj?.netRM, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[0])
            break;
          case 'BOP':
            dataArray.push(checkForDecimalAndNull(tempObj?.netBOP, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[1])
            break;
          case 'CC':
            dataArray.push(checkForDecimalAndNull(tempObj?.nConvCost, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[2])
            break;
          case 'ST':
            dataArray.push(checkForDecimalAndNull(tempObj?.nsTreamnt, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[3])
            break;
          case 'O&P':
            dataArray.push(checkForDecimalAndNull(tempObj?.nOverheadProfit, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[4])
            break;
          case 'P&F':
            dataArray.push(checkForDecimalAndNull(tempObj?.nPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[5])
            break;
          case 'TC':
            dataArray.push(checkForDecimalAndNull(tempObj?.totalToolCost, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[6])
            break;
          case 'HUNDI/DIS':
            dataArray.push(checkForDecimalAndNull(tempObj?.otherDiscountCost, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[7])
            break;
          case 'ANY OTHER COST':
            dataArray.push(checkForDecimalAndNull(tempObj?.anyOtherCostTotal, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[8])
            break;
          case 'CONDITION COST':
            dataArray.push(checkForDecimalAndNull(tempObj?.CostingPartDetails?.NetConditionCost, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[9])

            break;
          case 'NPV COST':
            dataArray.push(checkForDecimalAndNull(tempObj?.CostingPartDetails?.NetNpvCost, initialConfiguration.NoOfDecimalForPrice))
            tempColorArray.push(colorArray[10])
            break;
          default:
            break;
        }
      })

      pieChartData.push({
        labels: labelArray,
        datasets: [
          {
            label: '',
            data: dataArray,
            backgroundColor: tempColorArray,
            borderWidth: 0.5,
            hoverOffset: 10
          },
        ]
      })

    })
    setShowPieChartObj(pieChartData)
  }, [viewCostingData])


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
    setTcoAndNpvDrawer(false)
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
        setViewAccessibility(permmisionData?.View ? permmisionData?.View : false)
        setDownloadAccessibility(permmisionData?.Download ? permmisionData?.Download : false)

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
      let netTransportationCostView = viewCostingData[index]?.CostingPartDetails?.netTransportationCostView
      let surfaceTreatmentDetails = viewCostingData[index]?.CostingPartDetails?.CostingPartDetailssurfaceTreatmentDetails
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
    let rawMaterialCostWithCutOff = viewCostingData[index]?.rawMaterialCostWithCutOff
    let isIncludeToolCostWithOverheadAndProfit = viewCostingData[index]?.isIncludeToolCostWithOverheadAndProfit
    let isIncludeSurfaceTreatmentWithRejection = viewCostingData[index]?.isIncludeSurfaceTreatmentWithRejection
    let isIncludeSurfaceTreatmentWithOverheadAndProfit = viewCostingData[index]?.isIncludeSurfaceTreatmentWithOverheadAndProfit
    let isIncludeOverheadAndProfitInICC = viewCostingData[index]?.isIncludeOverheadAndProfitInICC
    let isIncludeToolCostInCCForICC = viewCostingData[index]?.isIncludeToolCostInCCForICC
    let rejectionRecoveryData = viewCostingData[index]?.CostingRejectionRecoveryDetails
    setIsViewOverheadProfit(true)
    setViewOverheadData(overHeadData)
    setViewRejectionRecoveryData(rejectionRecoveryData)
    setViewProfitData(profitData)
    setIccPaymentData(IccPaymentData)
    let obj = {
      rejectData: rejectData,
      modelType: modelType,
      isRmCutOffApplicable: isRmCutOffApplicable,
      rawMaterialCostWithCutOff: rawMaterialCostWithCutOff,
      isIncludeToolCostWithOverheadAndProfit: isIncludeToolCostWithOverheadAndProfit,
      isIncludeSurfaceTreatmentWithRejection: isIncludeSurfaceTreatmentWithRejection,
      isIncludeSurfaceTreatmentWithOverheadAndProfit: isIncludeSurfaceTreatmentWithOverheadAndProfit,
      isIncludeOverheadAndProfitInICC: isIncludeOverheadAndProfitInICC,
      isIncludeToolCostInCCForICC: isIncludeToolCostInCCForICC
    }
    setViewRejectAndModelType(obj)
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
    setIndex(index)
  }

  const viewNpvData = (index) => {
    setNpvDrawer(true)
    setNpvIndex(index)
    setPaymentTermsData(viewCostingData[index]?.CostingPartDetails?.CostingPaymentTermDetails)
    setNpvData(viewCostingData[index]?.CostingPartDetails?.CostingNpvResponse)


  }
  const viewTcoData = (data, index) => {
    setCostingId(data?.costingId)
    setTcoAndNpvDrawer(true)
    //setNpvData(viewCostingData[index]?.CostingPartDetails?.CostingNpvResponse)
  }

  const viewAttachmentData = (index) => {
    setAttachment(true)
    setViewAttachment(index)
  }

  const deleteCostingFromView = (index) => {
    let temp = [...viewCostingData]
    temp.splice(index, 1)
    if (props?.isRfqCosting) {
      let tempArr = temp && temp?.filter(item => item?.bestCost !== true)
      temp = props?.bestCostObjectFunction(tempArr)
    }
    if (simulationMode && viewCostingData?.length >= 2) {
      setIsComparing(false)
      temp.push(varianceData)
    }
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
      costingTypeId: viewCostingData[index]?.costingTypeId,
      customerName: viewCostingData[index]?.customerName,
      customerId: viewCostingData[index]?.customerId,
      customerCode: viewCostingData[index]?.customerCode,
      vendorCode: viewCostingData[index]?.vendorCode
    }

    setIsEditFlag(true)
    setaddComparisonToggle(true)
    setEditObject(editObject)
    setViewPieChart((prevState) => ({
      ...prevState,
      0: false,
    }))
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
      Customer: type === CBCTypeId ? tempData.Customer : ''
    }
    if (IdForMultiTechnology.includes(String(props?.technology?.value)) || (type === WACTypeId)) {
      Data.Technology = props?.technology.label
      Data.CostingHead = "string"
      Data.IsVendor = true
      Data.GroupCode = "string"
      Data.WeightedSOB = 0

    } else {
      Data.ZBCId = userDetail.ZBCSupplierInfo.VendorId
      Data.PlantCode = (type === ZBCTypeId || type === WACTypeId) ? tempData.PlantCode : ''
      Data.CustomerCode = type === CBCTypeId ? tempData.CustomerCode : ''
    }

    if (type === WACTypeId) {
      Data.PlantCode = tempData.PlantCode
    }
    if (IdForMultiTechnology.includes(String(props?.technology?.value)) || (type === WACTypeId)) {
      dispatch(createMultiTechnologyCosting(Data, (res) => {
        if (res.data?.Result) {
          dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
            setPartInfo(res.data?.Data)
            dispatch(setCostingMode({ editMode: false, viewMode: false }))
            showDetail(res.data?.Data, { costingId: res.data?.Data?.CostingId, type })
            history.push('/costing')
          }))
        }
      }))
    } else {
      dispatch(createCosting(Data, (res) => {
        if (res.data?.Result) {
          dispatch(getBriefCostingById(res.data?.Data?.CostingId, () => {
            setPartInfo(res.data?.Data)
            dispatch(setCostingMode({ editMode: false, viewMode: false }))
            showDetail(res.data?.Data, { costingId: res.data?.Data?.CostingId, type })
            history.push('/costing')
          }))
        }
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
        dispatch(setCostingMode({ editMode: true, viewMode: false }))
      }))
    }
    if (type === VBC) {
      dispatch(getBriefCostingById(tempData?.costingId, (res) => {

        if (res?.data?.Result) {
          history.push('/costing')
          showDetail(partInfoStepTwo, { costingId: tempData?.costingId, type })
          dispatch(setCostingMode({ editMode: true, viewMode: false }))
        }

      }))
    }
  }

  /**
 * @method viewCostingDetail
 * @description VIEW COSTING DETAIL (WILL GO TO COSTING DETAIL PAGE)
 */
  const viewCostingDetail = (index) => {
    partNumber.isChanged = false
    dispatch(storePartNumber(partNumber))

    let tempData = viewCostingData[index]
    props?.setcostingOptionsSelectFromSummary(viewCostingData && viewCostingData[index])
    const type = viewCostingData[index]?.zbc === 0 ? 'ZBC' : 'VBC'
    if (type === ZBC) {
      dispatch(getBriefCostingById(tempData?.costingId, (res) => {
        history.push('/costing')
        showDetail(partInfoStepTwo, { costingId: tempData?.costingId, type })
        dispatch(setCostingMode({ editMode: false, viewMode: true }))
      }))
    }
    if (type === VBC) {
      dispatch(getBriefCostingById(tempData?.costingId, (res) => {

        if (res?.data?.Result) {
          history.push('/costing')
          showDetail(partInfoStepTwo, { costingId: tempData?.costingId, type })
          dispatch(setCostingMode({ editMode: false, viewMode: true }))
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
    if (props.isRfqCosting) {
      props?.checkCostingSelected([], '')
    }
    setMultipleCostings([])
    setShowWarningMsg(true)
    if (simulationMode && e === 'submit') {

      const varianceData = viewCostingData?.filter(item => item?.CostingHeading === VARIANCE);
      setVarianceData(...varianceData)
      const filteredCostingData = viewCostingData?.filter(item => item?.CostingHeading !== VARIANCE);
      setIsComparing(true)
      dispatch(setCostingViewData(filteredCostingData));
    }
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
    if (props.isRfqCosting) {
      props?.checkCostingSelected([], '')
    }
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
    if (final?.length === 0 || final?.includes(true)) {
      setIsWarningFlag(true)
    } else {
      setIsWarningFlag(false)
    }
  }

  const moduleHandler = (id, check, data, index) => {

    if (check === 'top') {                                                            // WHEN USER CLICK ON TOP SEND FOR APPROVAL
      let temp = multipleCostings

      if (temp?.includes(id)) {                                                        // WHEN DESELECT THE CHECKBOX
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
      if (props.isRfqCosting) {
        if (index === selectedCheckbox) {
          setSelectedCheckbox('')
          props?.checkCostingSelected(temp, '')
        } else {
          setSelectedCheckbox(index)
          props?.checkCostingSelected(temp, index)
        }
      }
      setMultipleCostings(temp)
    } else {                                                                          // WHEN USER CLICK ON BOTTOM SEND FOR APPROVAL BUTTON
      if (data) {
        setIsWarningFlag(data[0]?.IsApprovalLocked)
        return data[0]?.IsApprovalLocked
      }
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
          obj.BudgetedPrice = viewCostingData[index]?.BudgetedPrice
          obj.BudgetedPriceVariance = viewCostingData[index]?.BudgetedPriceVariance
          temp.push(obj)
        }
        dispatch(setCostingApprovalData(temp))
        return null
      })
  }

  const checkCostings = () => {
    if (dataSelected?.length === 0) {
      Toaster.warning("Please select at least one costing to send for approval")
      return false
    }
    let arr = dataSelected?.filter(element => element.IsApprovalLocked === true)
    if (arr?.length > 0) {
      Toaster.warning(arr[0]?.getApprovalLockedMessage ? arr[0]?.getApprovalLockedMessage : 'Costing cannot be send for approval.')
      return false
    }
    let list = [...dataSelected]
    let vendorArray = []
    let effectiveDateArray = []
    let plantArray = []

    list && list?.map((item) => {
      vendorArray.push(item.vendorId)
      effectiveDateArray.push(item.effectiveDate)
      plantArray.push(item.PlantCode)
      return null
    })
    if (effectiveDateArray?.includes('')) {
      Toaster.warning('Please select the effective date.')
      return false
    }
    //MINDA
    if (initialConfiguration.IsReleaseStrategyConfigured) {
      let dataList = costingIdObj(dataSelected)
      let requestObject = {
        "RequestFor": "COSTING",
        "TechnologyId": technologyId,
        "LoggedInUserId": loggedInUserId(),
        "ReleaseStrategyApprovalDetails": dataList
      }
      dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {

        setReleaseStrategyDetails(res?.data?.Data)
        if (res?.data?.Data?.IsUserInApprovalFlow && res?.data?.Data?.IsFinalApprover === false) {
          if (list?.length === 0) {
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
        } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
          if (!isFinalCommonApproval) {
            if (list?.length === 0) {
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
              dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), props.technologyId, (res) => {
                if (!res?.data?.Data?.TechnologyLevels?.length || res?.data?.Data?.TechnologyLevels?.length === 0) {
                  setShowApproval(false)
                  Toaster.warning('User is not in the approval flow')
                } else {
                  sendForApprovalData(multipleCostings)
                  setShowApproval(true)
                }
              }))
            }
          } else {
            Toaster.warning('This is final level user')
            return false
          }
        } else if (res?.data?.Data?.IsFinalApprover === true) {
          Toaster.warning('This is final level user')
          return false
        } else if (res?.data?.Result === false) {
          Toaster.warning(res?.data?.Message)
          return false
        } else {
          Toaster.warning('This user is not in approval cycle')
          return false
        }
      }))
    } else {

      if (list?.length === 0) {
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
        dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), props.technologyId, (res) => {
          if (!res?.data?.Data?.TechnologyLevels?.length || res?.data?.Data?.TechnologyLevels?.length === 0) {
            setShowApproval(false)
            Toaster.warning('User is not in the approval flow')
          } else {
            let levelDetailsTemp
            levelDetailsTemp = userTechnologyLevelDetails(viewCostingData[0]?.costingTypeId, res?.data?.Data?.TechnologyLevels)
            if (levelDetailsTemp?.length === 0) {
              Toaster.warning("You don't have permission to send costing for approval.")
            } else {
              let obj = {}
              obj.DepartmentId = userDetails().DepartmentId
              obj.UserId = loggedInUserId()
              obj.TechnologyId = partInfo.TechnologyId
              obj.Mode = 'costing'
              obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(viewCostingData[0]?.costingTypeId)
              obj.plantId = viewCostingData[index]?.destinationPlantId ?? EMPTY_GUID
              const { Department } = userDetails()
              if (Department.length === 1 && !initialConfiguration.IsDivisionAllowedForDepartment) {
                dispatch(checkFinalUser(obj, res => {
                  if (res?.data?.Result) {
                    setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover)
                    if (res?.data?.Data?.IsUserInApprovalFlow === true && res?.data?.Data?.IsFinalApprover === false) {
                      sendForApprovalData(multipleCostings)
                      setShowApproval(true)
                    } else if (res?.data?.Data?.IsFinalApprover === true) {
                      Toaster.warning("Final level user cannot send costing for approval.")
                    } else {
                      Toaster.warning("User does not have permission to send costing for approval.")
                    }
                  }
                }))
              } else {
                sendForApprovalData(multipleCostings)
                setShowApproval(true)
              }
            }
          }
        }))
      }
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
    let arr = 0
    if (Array.isArray(array)) {
      arr = array && array?.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.GrossWeight
      }, 0)
    }
    return checkForDecimalAndNull(arr, initialConfiguration.NoOfDecimalForInputOutput)
  }


  const reducerFinish = (array) => {
    let arr = 0
    if (Array.isArray(array)) {
      arr = array.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.FinishWeight
      }, 0)
    }

    return checkForDecimalAndNull(arr, initialConfiguration.NoOfDecimalForInputOutput)
  }
  const reactToPrintTriggerDetail = useCallback(() => {
    return <button id="costingSummary_Detailed_pdf" className="user-btn mr-1 mb-2 px-2" title='Detailed pdf' disabled={viewCostingData?.length === 1 ? false : true}> <div className='pdf-detail'></div>  D </button>
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
    return (simulationMode ? <button className="user-btn mr-1 mb-2 px-2" title='pdf' disabled={viewCostingData?.length > 3 ? true : false}> <div className='pdf-detail'></div></button> : <button className="user-btn mr-1 mb-2 px-2" title='pdf' id="costingSummary_pdf" disabled={viewCostingData?.length > 3 ? true : false}> <div className='pdf-detail'></div></button>)
  }, [viewCostingData])

  const reactToPrintContent = () => {
    return componentRef.current;
  };

  const costingIdObj = (list) => {
    let data = []
    list && list?.map(item => {
      let obj = {}
      obj.CostingId = item?.costingId
      data.push(obj)
    })
    return data
  }

  const sendForApprovalDown = (data) => {
    //MINDA
    // if (initialConfiguration.IsReleaseStrategyConfigured) {
    //   let returnValue = true
    //   let dataList = costingIdObj(data)
    //   let requestObject = {
    //     "RequestFor": "COSTING",
    //     "TechnologyId": technologyId,
    //     "LoggedInUserId": loggedInUserId(),
    //     "ReleaseStrategyApprovalDetails": dataList
    //   }
    //   dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
    //     setReleaseStrategyDetails(res?.data?.Data)
    //     if (res?.data?.Data?.IsUserInApprovalFlow && res?.data?.Data?.IsFinalApprover === false) {
    //       let temp = moduleHandler(data[0]?.costingId, 'down', data)
    //       if (!temp) {
    //         sendForApprovalData([data[0]?.costingId], index)
    //         setShowApproval(true)
    //       } else {
    //         Toaster.warning('A costing is pending for approval for this part or one of it\'s child part. Please approve that first')
    //       }
    //     } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
    //       if (data && !isFinalCommonApproval) {
    //         let temp = moduleHandler(data[0]?.costingId, 'down', data)
    //         if (!temp) {
    //           sendForApprovalData([data[0]?.costingId], index)
    //           setShowApproval(true)
    //         } else {
    //           Toaster.warning('A costing is pending for approval for this part or one of it\'s child part. Please approve that first')
    //         }
    //       } else {
    //         Toaster.warning('This is final level user')
    //         return false
    //       }
    //     } else if (res?.data?.Data?.IsFinalApprover === true) {
    //       returnValue = false
    //       Toaster.warning('This is final level user')
    //       return false
    //     } else {
    //       returnValue = false
    //       Toaster.warning('This user is not in approval cycle')
    //       return false
    //     }
    //   }))
    //   return returnValue
    // } else {
    if (data) {
      let temp = moduleHandler(data[0]?.costingId, 'down', data)
      if (!temp) {
        dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), props.technologyId, (res) => {
          if (!res?.data?.Data?.TechnologyLevels?.length || res?.data?.Data?.TechnologyLevels?.length === 0) {
            setShowApproval(false)
            Toaster.warning('User is not in the approval flow')
          } else {
            let levelDetailsTemp
            levelDetailsTemp = userTechnologyLevelDetails(viewCostingData[0]?.costingTypeId, res?.data?.Data?.TechnologyLevels)
            if (levelDetailsTemp?.length === 0) {
              Toaster.warning("You don't have permission to send costing for approval.")
            } else {
              let obj = {}
              obj.DepartmentId = userDetails().DepartmentId
              obj.UserId = loggedInUserId()
              obj.TechnologyId = partInfo.TechnologyId
              obj.Mode = 'costing'
              obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(viewCostingData[0]?.costingTypeId)
              obj.plantId = viewCostingData[index]?.destinationPlantId ?? EMPTY_GUID
              dispatch(checkFinalUser(obj, res => {
                if (res?.data?.Result) {
                  setIsFinalCommonApproval(res?.data?.Data?.IsFinalApprover)
                  if (res?.data?.Data?.IsUserInApprovalFlow === true && res?.data?.Data?.IsFinalApprover === false) {
                    sendForApprovalData([data[0]?.costingId], index)
                    setShowApproval(true)
                  } else if (res?.data?.Data?.IsFinalApprover === true) {
                    Toaster.warning("Final level user cannot send costing for approval.")
                  } else {
                    Toaster.warning("User does not have permission to send costing for approval.")
                  }
                }
              }))
            }
          }
        }))
      } else {
        Toaster.warning('A costing is pending for approval for this part or one of it\'s child part. Please approve that first')
      }
      // }
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
    let varianceWithCurrency = isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[firstIndex]?.nPOPriceWithCurrency > viewCostingData[secondIndex]?.nPOPriceWithCurrency ? 'green-row' : viewCostingData[firstIndex]?.nPOPriceWithCurrency < viewCostingData[secondIndex]?.nPOPriceWithCurrency ? 'red-row' : '' : '-'

    let varianceWithoutCurrency = isApproval && !props.isRfqCosting ? viewCostingData?.length > 0 && viewCostingData[firstIndex]?.nPOPrice > viewCostingData[secondIndex]?.nPOPrice ? 'green-row' : viewCostingData[firstIndex]?.nPOPrice < viewCostingData[secondIndex]?.nPOPrice ? 'red-row' : '' : '-'
    if (viewCostingData[0]?.currency.currencyTitle === '-') {
      return varianceWithoutCurrency
    }
    else {
      return varianceWithCurrency
    }
  }

  const getOverheadPercentage = (data) => {
    if (data?.bestCost === true) {
      return ' ';
    } else if (data?.CostingHeading !== VARIANCE) {
      const overheadTitle = data?.overheadOn.overheadTitle;
      let isOverheadCombined = data.CostingPartDetails?.CostingOverheadDetail.IsOverheadCombined
      switch (overheadTitle) {
        case 'RM':
          return data?.overheadOn.overheadRMPercentage;
        case 'BOP':
          return data?.overheadOn.overheadBOPPercentage;
        case 'CC':
          return data?.overheadOn.overheadCCPercentage;
        case 'RM + CC':
        case 'Part Cost + CC':
          return `${isOverheadCombined ? data?.overheadOn.overheadPercentage : `${data?.overheadOn.overheadRMPercentage} + ${data?.overheadOn.overheadCCPercentage}`}`;
        case 'RM + BOP':
        case 'Part Cost + BOP':
          return `${isOverheadCombined ? data?.overheadOn.overheadPercentage : `${data?.overheadOn.overheadRMPercentage} + ${data?.overheadOn.overheadBOPPercentage}`}`;
        case 'BOP + CC':
          return `${isOverheadCombined ? data?.overheadOn.overheadPercentage : `${data?.overheadOn.overheadBOPPercentage} + ${data?.overheadOn.overheadCCPercentage}`}`;
        case 'RM + CC + BOP':
        case 'Part Cost + CC + BOP':
          if (data?.overheadOn.overheadRMPercentage !== '-') {
            return `${data?.overheadOn.overheadRMPercentage} + ${data?.overheadOn.overheadCCPercentage} + ${data?.overheadOn.overheadBOPPercentage}`;
          } else {
            return data?.overheadOn.overheadPercentage;
          }
        default:
          return data?.overheadOn.overheadPercentage;
      }
    }
    else {
      return ' ';
    }
  };
  const getProfitPercentage = (data) => {
    if (data?.bestCost === true) {
      return ' ';
    } else if (data?.CostingHeading !== VARIANCE) {
      const profitTitle = data?.profitOn.profitTitle;
      let isProfitCombined = data.CostingPartDetails?.CostingProfitDetail.IsProfitCombined
      switch (profitTitle) {
        case 'RM':
          return data?.profitOn.profitRMPercentage;
        case 'BOP':
          return data?.profitOn.profitBOPPercentage;
        case 'CC':
          return data?.profitOn.profitCCPercentage;
        case 'RM + CC':
        case 'Part Cost + CC':
          return `${isProfitCombined ? data?.profitOn.profitPercentage : `${data?.profitOn.profitRMPercentage} + ${data?.profitOn.profitCCPercentage}`}`;
        case 'BOP + CC':
          return `${isProfitCombined ? data?.profitOn.profitPercentage : `${data?.profitOn.profitBOPPercentage} + ${data?.profitOn.profitCCPercentage}`}`;
        case 'RM + BOP':
        case 'Part Cost + BOP':
          return `${isProfitCombined ? data?.profitOn.profitPercentage : `${data?.profitOn.profitRMPercentage} + ${data?.profitOn.profitBOPPercentage}`}`;
        case 'RM + CC + BOP':
        case 'Part Cost + CC + BOP':
          if (data?.profitOn.profitRMPercentage !== '-') {
            return `${data?.profitOn.profitRMPercentage} + ${data?.profitOn.profitCCPercentage} + ${data?.profitOn.profitBOPPercentage}`;
          } else {
            return data?.profitOn.profitPercentage;
          }
        default:
          return data?.profitOn.profitPercentage;
      }
    }
    else {
      return ' ';
    }
  };
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
    let templateObj = viewCostingData[0]?.technologyId === LOGISTICS ? { ...VIEW_COSTING_DATA_LOGISTICS } : { ...VIEW_COSTING_DATA }
    if (!(getConfigurationKey().IsShowNpvCost)) {
      delete templateObj.npvCost
    }
    if (!(getConfigurationKey().IsBasicRateAndCostingConditionVisible)) {
      delete templateObj.conditionCost
      delete templateObj.BasicRate
    }
    if (Number(viewCostingData[0]?.technologyId) !== PLASTIC) {
      delete templateObj.BurningLossWeight
    }

    if (getConfigurationKey().IsBoughtOutPartCostingConfigured && viewCostingData[0]?.CostingPartDetails?.IsBreakupBoughtOutPart) {
      delete templateObj.netBOP
    }

    if (props?.isRfqCosting) {
      templateObj.costingHeadCheck = 'VBC'
    }
    if (!(reactLocalStorage.getObject('CostingTypePermission').cbc)) {
      templateObj.costingHeadCheck = 'VBC/ZBC/NCC'
      delete templateObj.customer
    }
    if (!showSaLineNumber()) {
      delete templateObj.saNumber
      delete templateObj.lineNumber
    }
    if ((viewCostingData && viewCostingData[0]?.technologyId && viewCostingData[0]?.technologyId !== DIE_CASTING)) {
      delete templateObj.castingWeightExcel
      delete templateObj.meltingLossExcel
    }
    for (var prop in templateObj) {
      if (viewCostingData[0]?.technologyId === LOGISTICS) {
        costingSummary.push({ label: VIEW_COSTING_DATA_LOGISTICS[prop], value: prop, })
      } else {
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
    }

    viewCostingData && viewCostingData.map((item) => {
      item.otherDiscountApplicablity = Array.isArray(item?.CostingPartDetails?.DiscountCostDetails) && item?.CostingPartDetails?.DiscountCostDetails?.length > 0 ? item?.CostingPartDetails?.DiscountCostDetails[0].ApplicabilityType : ''
      item.otherDiscountValuePercent = Array.isArray(item?.CostingPartDetails?.DiscountCostDetails) && item?.CostingPartDetails?.DiscountCostDetails?.length > 0 ? item?.CostingPartDetails?.DiscountCostDetails[0].Value : ''
      item.otherDiscountCost = Array.isArray(item?.CostingPartDetails?.DiscountCostDetails) && item?.CostingPartDetails?.DiscountCostDetails?.length > 0 ? item?.CostingPartDetails?.DiscountCostDetails[0].NetCost : ''
      item.currencyTitle = item.currency && item?.currency?.currencyTitle
      item.overHeadPercent = getOverheadPercentage(item)
      item.profitPercent = getProfitPercentage(item)
      item.rejectionPercent = (item?.bestCost === true) ? ' ' : (item?.CostingHeading !== VARIANCE ? item?.rejectionOn.rejectionTitle === 'Fixed' ? '-' : item?.rejectionOn.rejectionPercentage : '')
      item.iccPercent = (item?.bestCost === true) ? ' ' : (item?.CostingHeading !== VARIANCE ? item?.iccOn.iccTitle === 'Fixed' ? '-' : item?.iccOn.iccPercentage : '')
      item.paymentPercent = (item?.bestCost === true) ? ' ' : item?.CostingHeading !== VARIANCE ? item?.paymentTerms.paymentTitle === 'Fixed' ? '-' : item?.paymentTerms.paymentPercentage : ''
      item.OverheadRemark = item?.overheadOn?.OverheadRemark ? item?.overheadOn?.OverheadRemark : '-'
      item.ProfitRemark = item?.profitOn?.ProfitRemark ? item?.profitOn?.ProfitRemark : '-'
      item.RejectionRemark = item?.rejectionOn?.RejectionRemark ? item?.rejectionOn?.RejectionRemark : '-'
      item.ICCRemark = item?.iccOn?.ICCRemark ? item?.iccOn?.ICCRemark : '-'
      item.PaymentTermRemark = item?.paymentTerms?.PaymentTermRemark ? item?.paymentTerms?.PaymentTermRemark : '-'
    })

    let masterDataArray = []
    viewCostingData && viewCostingData.map((item, index) => {

      if (index === 0) {
        masterDataArray.push({ label: "", value: `columnA${index}` })
        masterDataArray.push({ label: props.uniqueShouldCostingId?.includes(item.costingId) ? "Should Cost" : item?.bestCost === true ? "Best Cost" : `Costing\u00A0${index + 1}`, value: `columnB${index}` })

      } else if (item?.CostingHeading !== VARIANCE) {
        masterDataArray.push({ label: item?.bestCost === true ? "Best Cost" : `Costing\u00A0${index + 1}`, value: `columnB${index}` })
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
        heading = { mainHeading: value?.vendorName, subHeading: value?.vendorCode }
        return heading;
    }
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
    animation: {
      duration: 0, // Set the animation duration to 0 to disable animation
    },
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
  const viewPieChartHandler = (index) => {
    setViewPieChart(prevState => ({
      ...prevState,
      [index]: true
    }));
  };

  const pieChartCloseHandler = (index) => {
    setViewPieChart(prevState => ({
      ...prevState,
      [index]: false
    }));
  };

  const PDFPageStyle = "@page { size: A4 landscape; }";

  const tableDataClass = (data) => {
    return props?.isRfqCosting && data.isRFQFinalApprovedCosting && !isApproval && !data?.bestCost ? 'finalize-cost' : ''
  }

  const closeUserDetails = () => {
    setIsOpenRejectedCosting(false)
  }

  const showReturnCosting = (index) => {
    setLoader(true)
    dispatch(getCostingByVendorAndVendorPlant(viewCostingData[index]?.partId, viewCostingData[index]?.vendorId, '', viewCostingData[index]?.destinationPlantId, '', VBCTypeId, initialConfiguration?.InfoCategories[0]?.Text, (res) => {
      if (res?.data?.Result) {
        let list = [...res?.data?.DataList]
        let rejectedCostingList = list.filter(element => element?.DisplayStatus === REJECTED)
        if (rejectedCostingList && rejectedCostingList.length > 0) {

          dispatch(getMultipleCostingDetails(rejectedCostingList, (res) => {
            let datalist = []
            let arrayfromapi = _.map(res, 'data.Data')
            arrayfromapi && arrayfromapi?.map(item => {
              datalist.push(formViewData(item)[0])
            })
            let finaldata = _.uniqBy([...datalist], 'costingId')
            dispatch(setRejectedCostingViewData(finaldata))
            setTimeout(() => {
              setLoader(false)
              setIsOpenRejectedCosting(true)
            }, 200);
          }))
        } else {
          Toaster.warning("Return costing is not available for this vendor.")
          setLoader(false)
        }
      }
    }))
  }
  const type = viewCostingData[0]?.costingTypeId

  const firstIndex = type === CBCTypeId ? 1 : SWAP_POSITIVE_NEGATIVE ? 1 : 0; // Determine the first index based on SWAP_POSITIVE_NEGATIVE flag
  const secondIndex = type === CBCTypeId ? 0 : SWAP_POSITIVE_NEGATIVE ? 0 : 1; // Determine the second index based on SWAP_POSITIVE_NEGATIVE flag

  const displayValueWithSign = (data, key) => {
    let value = data[key]; // Get the value from the data object using the provided key
    let finalKey = key

    // Special case for 'nPOPriceWithCurrency'
    if (key === 'nPOPriceWithCurrency') {
      // If the currency is '-' (dash), use 'nPOPrice', otherwise use 'nPOPriceWithCurrency'
      finalKey = data?.currency?.currencyTitle === "-" ? "nPOPrice" : "nPOPriceWithCurrency"
      value = data[finalKey]
    }

    let varianceValues = ''

    switch (key) {
      case 'nPOPrice':
        // Display the value with currency symbol and formatted decimal places
        varianceValues = <span title={Math.abs(value)}><span className='currency-symbol'>{getCurrencySymbol(getConfigurationKey().BaseCurrency)}</span>{checkForDecimalAndNull(Math.abs(value), initialConfiguration.NoOfDecimalForPrice)}</span>
        break;
      case 'nPOPriceWithCurrency':
        // Display the value with currency symbol and formatted decimal places
        varianceValues = <span title={(data?.currency?.currencyTitle) !== "-" ? (data?.nPOPriceWithCurrency) : data?.nPOPrice}><span className='currency-symbol'>
          {getCurrencySymbol(data?.currency.currencyTitle !== '-' ?
            data?.currency.currencyTitle : getConfigurationKey().BaseCurrency)}
        </span>{data?.nPOPriceWithCurrency !== null ? checkForDecimalAndNull(((data?.currency?.currencyTitle === "-") || ((data?.bestCost === true && data?.currency?.currencyTitle === undefined))) ? Math.abs(data?.nPOPrice) : Math.abs(data?.nPOPriceWithCurrency), initialConfiguration.NoOfDecimalForPrice) : '-'}</span>
        break;
      default:
        varianceValues = <span title={Math.abs(value)}>{checkForDecimalAndNull(Math.abs(value), initialConfiguration.NoOfDecimalForPrice)}</span>
        break;
    }

    let valueWithSign = (
      <>
        {data?.CostingHeading === VARIANCE && isApproval && Number(value) !== 0 ? (
          // Conditionally display the sign based on specific conditions
          viewCostingData?.length > 0 && viewCostingData[firstIndex]?.[finalKey] > viewCostingData[secondIndex]?.[finalKey] ? (
            <span className='positive-sign'>+</span>
          ) : (
            <span className='positive-sign'>-</span>
          )
        ) : (
          ''
        )}
        {varianceValues}
      </>
    );
    return valueWithSign; // Return the value with sign component
  };



  const highlighter = (key, columnName = '') => {
    const firstInd = viewCostingData[0]?.costingTypeId === CBCTypeId ? 1 : 0
    const secondInd = viewCostingData[0]?.costingTypeId === CBCTypeId ? 0 : 1
    let highlighClass = ''; // The variable to hold the highlight class
    const activeClass = isApproval && !props.isRfqCosting; // Check if main row highlight class is applicable
    const activeText = isApproval && viewCostingData?.length > 1 && !props.isRfqCosting; // Check if sub data highlight is applicable
    const mainRow = 'background-light-blue'; // Common class for main row
    const textClass = 'd-block small-grey-text'; // Common class for individual text
    switch (columnName) {
      case 'main-row':
        // Highlight class for main row, conditionally set to green or red based on values
        highlighClass = `${mainRow} ${activeClass ? viewCostingData?.length > 0 && viewCostingData[firstInd]?.[key] > viewCostingData[secondInd]?.[key] ? 'green-row' : viewCostingData[firstInd]?.[key] < viewCostingData[secondInd]?.[key] ? 'red-row' : '' : '-'}`
        break;
      case 'multiple-key':
        // Highlight class case, if hierarchical key comes from function,  here is getting value like viewCostingData[firstInd]?.[key[0]]?.[key[1]] as viewCostingData[firstInd]?.childObject.childValue
        highlighClass = `${textClass} ${activeText ? highlightCostingSummaryValue(viewCostingData[firstInd]?.[key[firstInd]]?.[key[secondInd]], viewCostingData[secondInd]?.[key[firstInd]]?.[key[secondInd]]) : ''}`
        break;
      case 'rm-reducer':
        // Highlight class case, if key comes from reducer
        highlighClass = `${textClass} ${activeText ? highlightCostingSummaryValue(reducer(viewCostingData[firstInd]?.netRMCostView), reducer(viewCostingData[secondInd]?.netRMCostView)) : ''}`
        break;
      case 'finish-reducer':
        // Highlight class case, if key comes from finishReducer
        highlighClass = `${textClass} ${activeText ? highlightCostingSummaryValue(reducerFinish(viewCostingData[firstInd]?.netRMCostView), reducerFinish(viewCostingData[secondInd]?.netRMCostView)) : ''}`
        break;
      default:
        // Highlight class for all others key
        highlighClass = `${textClass} ${activeText ? highlightCostingSummaryValue(viewCostingData[firstInd]?.[key], viewCostingData[secondInd]?.[key]) : ''}`
        break;
    }

    return highlighClass; // Return the class basis on the condition
  }

  const editValue = (obj, index) => {
    obj.editSOBPercentage = true
    let tempList = Object.assign([...viewCostingData], { [index]: obj })

    dispatch(setCostingViewData(tempList))

  }

  const handleSOBSave = (obj, index) => {
    const lastvlue = viewCostingData[index]?.shareOfBusinessPercent
    let totalSObP = [];
    for (let i = 0; i < viewCostingData.length; i++) {
      if (typeof viewCostingData[i].shareOfBusinessPercent === 'number' && i !== index) {
        totalSObP.push(viewCostingData[i].shareOfBusinessPercent)
      }
    }
    const sum = totalSObP.reduce((accumulator, currentValue) => accumulator + currentValue, 0) + Number(getValues(`ShareOfBusinessPercent.${index}`));
    if (sum > 100) {
      Toaster.warning("Total SOB percentage cannot be more than 100%")
      setValue(`ShareOfBusinessPercent.${index}`, lastvlue)
      return false;
    } else if (getValues(`ShareOfBusinessPercent.${index}`) === '') {
      setValue(`ShareOfBusinessPercent.${index}`, 0)
    }
    let tempArr = []
    let data = {}
    obj.shareOfBusinessPercent = Number(getValues(`ShareOfBusinessPercent.${index}`))
    data = {
      PlantId: obj.plantId ? obj.plantId : obj.destinationPlantId,
      PartId: obj.partId,
      ShareOfBusinessPercentage: obj.shareOfBusinessPercent,
      LoggedInUserId: loggedInUserId(),
      VendorId: obj.vendorId,
      VendorPlantId: initialConfiguration && initialConfiguration.IsVendorPlantConfigurable ? obj.VendorPlantId : EMPTY_GUID,
      CostingTypeId: VBCTypeId
    }
    tempArr.push(data)


    dispatch(updateSOBDetail(tempArr, (res) => {
      obj.editSOBPercentage = false
      let tempList = Object.assign([...viewCostingData], { [index]: obj })
      dispatch(setCostingViewData(tempList))
    }))
  }
  const handleSOBDiscard = (obj, index) => {
    obj.editSOBPercentage = false
    setValue(`ShareOfBusinessPercent.${index}`, obj.shareOfBusinessPercent)
    let tempList = Object.assign([...viewCostingData], { [index]: obj })
    dispatch(setCostingViewData(tempList))
  }

  const handleVBCSOBChange = (e, index, obj) => {
    let value = Number(e.target.value);
    if (!value && value !== 0) {
      setTimeout(() => {
        Toaster.warning("Value should be in number")
        setValue(`ShareOfBusinessPercent.${index}`, '')
      }, 100);
      return false;
    } else if (e.target.value > 100) {
      setTimeout(() => {
        Toaster.warning("SOB percentage cannot be more than 100%")
        setValue(`ShareOfBusinessPercent.${index}`, '')
      }, 100);
      return false;
    }
  }

  const renderOtherCostDetailsOverhead = (list) => {
    let arr = []
    Object.keys(list).forEach(key => {
      arr.push(<span className={highlighter([], "multiple-key")}>{key}</span>)
    });
    return arr
  }

  const renderDataForOtherCostDetailsOverhead = (otherCostDetailsList, columnIndex, showHeader, data) => {
    const tempArr = otherCostDetailsList
    let arr = []
    if (showHeader) {
      data && arr?.push(<>
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
        </div></>)
    }

    Object.keys(tempArr)?.forEach(key => {
      const ele = <div style={pdfHead ? { marginTop: '-1px' } : {}} className={`d-flex  ${highlighter(["iccOn", "iccValue"], "multiple-key")}`}>
        <span className="d-inline-block w-50 small-grey-text">
          <span>
            {(tempArr[key]?.arrayList[columnIndex]?.bestCost === true) ? ' ' : (tempArr[key]?.arrayList[columnIndex]?.DynamicApplicabilityCost ? <span title={checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicApplicabilityCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicApplicabilityCost, initialConfiguration.NoOfDecimalForPrice)}</span> : '-')}
          </span></span>{' '}
        <span className="d-inline-block w-50 small-grey-text">
          {(tempArr[key]?.arrayList[columnIndex]?.bestCost === true) ? ' ' : (tempArr[key]?.arrayList[columnIndex]?.DynamicPercentage ? <span title={checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicPercentage, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicPercentage, initialConfiguration.NoOfDecimalForPrice)}</span> : '-')}
        </span>{' '}
        <span className="d-inline-block w-50 small-grey-text">
          {(tempArr[key]?.arrayList[columnIndex]?.bestCost === true) ? ' ' : (tempArr[key]?.arrayList[columnIndex]?.DynamicNetCost ? <span title={checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicNetCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(tempArr[key]?.arrayList[columnIndex]?.DynamicNetCost, initialConfiguration.NoOfDecimalForPrice)}</span> : '-')}
        </span>
      </div>
      arr.push(ele)
    })
    return arr
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
                <div className="left-border">{'Summary'}
                  {props.costingSummaryMainPage && (
                    <TourWrapper
                      buttonSpecificProp={{ id: "Costing_Summary_Table" }}
                      stepsSpecificProp={{
                        steps: Steps(t, "", { totalCost: totalCost, showCostingSummaryExcel: downloadAccessibility, viewCostingData: viewCostingData, isSuperAdmin: isSuperAdmin, technology, editButton, viewButton, viewBomButton, viewPieChart: pieChartButton }).COSTING_SUMMARY
                      }}
                    />
                  )}
                </div>
              </Col>
            )}

            {<Col md={simulationMode || props.isRfqCosting || isApproval ? "12" : "8"} className="text-right">
              <div className='d-flex justify-content-end mb-2'>
                <div className='d-flex justify-content-end align-items-center'>
                  {props.isRfqCosting && !isApproval && showCheckbox && !drawerViewMode && <WarningMessage dClass={"justify-content-end mr-2"} message={'Click the checkbox to approve, reject, or return the quotation'} />}

                  {downloadAccessibility && <ExcelFile filename={'Costing Summary'} fileExtension={'.xls'} element={<button type="button" className={'user-btn excel-btn mr5 mb-2'} id="costingSummary_excel" title="Excel"><img src={ExcelIcon} alt="download" /></button>}>

                    {onBtExport()}
                  </ExcelFile>}
                  {(props?.isRfqCosting && !isApproval && !drawerViewMode) && <button onClick={() => props?.crossButton()} title='Discard Summary' className='CancelIcon rfq-summary-discard'></button>}
                </div>
                {!simulationMode && !props?.isRfqCosting && !props?.isRfqCosting && downloadAccessibility &&
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
                {!simulationDrawer && !drawerViewMode && !props.isRfqCosting && downloadAccessibility && <ReactToPrint
                  bodyClass={`my-3 simple-pdf ${simulationMode ? 'mx-1 simulation-print' : 'mx-2'}`}
                  documentTitle={`${simulationMode ? 'Compare-costing.pdf' : `${pdfName}-costing`}`}
                  content={reactToPrintContent}
                  pageStyle={PDFPageStyle}
                  onAfterPrint={handleAfterPrint}
                  onBeforeGetContent={handleOnBeforeGetContent}
                  trigger={reactToPrintTrigger}
                />
                }
                {
                  // !simulationMode && 
                  !props.isRfqCosting && <>

                    {(!viewMode && !isFinalApproverShow) && !props.isRfqCosting && !isSuperAdmin && (
                      <button id="costingSummary_sendforapproval" className="user-btn mr-1 mb-2 approval-btn" disabled={false} onClick={() => checkCostings()}>
                        <div className="send-for-approval"></div>
                        {'Send For Approval'}
                      </button>
                    )}
                    <button
                      type="button"
                      id="costingSummary_addtocomparison"

                      className={'user-btn mb-2 comparison-btn'}
                      onClick={addComparisonDrawerToggle}
                    >
                      <div className="compare-arrows"></div>
                      Add To Comparison{' '}
                    </button>
                  </>
                }
              </div >
              {!simulationMode && !props.isRfqCosting && (showWarningMsg && !warningMsg) && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Costing for this part/Assembly is not yet done!'} />}
              {disableSendForApproval && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'This user is not in the approval cycle'} />}
            </Col>}
          </Row>
          {
            isComparing &&
            (<>
              <Row className="mt-2">
                <Col md="10">
                  <div id="bar-chart-compare" className="left-border">{'Bar Chart Comparison:'}</div>
                </Col>
              </Row>

              <Row>
                <Col md="12" className="costing-summary-row">
                  {isComparing &&
                    <BarChartComparison
                      costingData={viewCostingData}
                      currency={getConfigurationKey()?.BaseCurrency}
                    />
                  }
                </Col>
              </Row>
            </>
            )}
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
                <div className={`${viewCostingData[0]?.technologyId !== LOGISTICS ? '' : `overflow-y-hidden ${props?.isRfqCosting ? 'layout-min-height-440px' : ''}`} table-responsive `}>
                  <table style={{ minWidth: cssObj.tableWidth }} className={`table table-bordered costing-summary-table mb-0 ${approvalMode ? 'costing-approval-summary' : ''}`}>
                    {props.isRfqCosting && <thead>
                      <tr>
                        {<th style={{ width: cssObj.particularWidth - (cssObj.particularWidth / 4) + "%" }} ></th>}
                        {viewCostingData && viewCostingData?.map((data, index) => {
                          return (<>
                            <th style={{ width: cssObj.particularWidth + "%" }} key={index} scope="col" className='approval-summary-headers'>{props.uniqueShouldCostingId?.includes(data.costingId) ? "Should Cost" : data?.bestCost === true ? "Best Cost" : ""}</th>
                          </>
                          )
                        })}
                      </tr>
                    </thead>}
                    <thead>
                      <tr className="main-row">
                        {isApproval ? <th style={{ width: cssObj.particularWidth - (cssObj.particularWidth / 4) + "%" }} scope="col" className='approval-summary-headers'>{props.id}</th> : <th scope="col" style={{ width: cssObj.particularWidth - (cssObj.particularWidth / 4) + "%" }} className={`header-name-left ${isLockedState && !drawerDetailPDF && !pdfHead && costingSummaryMainPage ? 'pt-30' : ''}`}>{props?.isRfqCosting ? 'VBC' : (reactLocalStorage.getObject('CostingTypePermission').cbc) ? 'VBC/ZBC/NCC/CBC' : 'VBC/ZBC/NCC'}</th>}
                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            const title = data.costingTypeId === ZBCTypeId ?
                              data?.plantName + "(SOB: " + data?.shareOfBusinessPercent + "%)"
                              : (data?.costingTypeId !== ZBCTypeId || data?.costingTypeId !== CBCTypeId || data?.costingTypeId !== WACTypeId)
                                ? data?.vendorName + "(SOB: " + data?.shareOfBusinessPercent + "%)" : data.customerName
                            return (
                              <th scope="col" style={{ width: cssObj.particularWidth + "%" }} className={`${tableDataClass(data)} header-name ${isLockedState && data?.status !== DRAFT && costingSummaryMainPage && !pdfHead && !drawerDetailPDF ? 'pt-30' : ''}`}>
                                {data?.IsApprovalLocked && !pdfHead && !drawerDetailPDF && costingSummaryMainPage && data?.status === DRAFT && <WarningMessage title={data?.getApprovalLockedMessage} dClass={"costing-summary-warning-mesaage"} message={data?.getApprovalLockedMessage} />}    {/* ADD THIS CODE ONCE DEPLOYED FROM BACKEND{data.ApprovalLockedMessage}*/}
                                <div className={` ${drawerDetailPDF ? 'pdf-header' : 'header-name-button-container'}`}>
                                  <div className="element d-inline-flex align-items-center">
                                    {
                                      !isApproval && (data?.status === DRAFT) && <>

                                        {!disableSendForApproval && !pdfHead && !drawerDetailPDF && !viewMode && !isSuperAdmin && < div className="custom-check1 d-inline-block">
                                          <label
                                            className="custom-checkbox pl-0 mb-0"
                                            onChange={() => moduleHandler(data?.costingId, 'top', data)}
                                          >
                                            {''}
                                            <input
                                              type="checkbox"
                                              value={"All"}
                                              id={`checkbox-${index}`}
                                              // disabled={true}
                                              checked={multipleCostings?.includes(data?.costingId)}
                                            />
                                            <span
                                              id={`checkbox-${index}`}
                                              className=" before-box"
                                              checked={multipleCostings?.includes(data?.costingId)}
                                              onChange={() => moduleHandler(data?.costingId, 'top', data)}
                                            />
                                          </label>
                                        </div>}
                                      </>
                                    }
                                    {data?.IsShowCheckBoxForApproval && !isApproval && !data?.IsApprovalLocked && props?.isRfqCosting && isFromViewRFQ && costingIdList?.includes(data?.costingId) && !isSuperAdmin && <div className="custom-check1 d-inline-block">
                                      <label
                                        className="custom-checkbox pl-0 mb-0"
                                        onChange={() => moduleHandler(data?.costingId, 'top', data, index)}
                                      >
                                        <input
                                          type="checkbox"
                                          value={"All"}
                                        // checked={(selectedCheckbox === index) ? true : false}
                                        />
                                        <span
                                          className=" before-box"
                                          // checked={(selectedCheckbox === index) ? true : false}
                                          onChange={() => moduleHandler(data?.costingId, 'top', data, index)}
                                        />
                                      </label>
                                    </div>
                                    }
                                    {
                                      (isApproval && data?.CostingHeading !== '-') ? <span>{data?.CostingHeading}</span> :
                                        (data?.bestCost === true) ? "" :
                                          <span className={`checkbox-text`} title={title}><div><span>{heading(data).mainHeading}<span> {data.costingTypeId !== CBCTypeId && `(SOB: ${data?.shareOfBusinessPercent}%)`}</span></span><span className='sub-heading'>{heading(data).subHeading}-{data.costingHeadCheck}</span></div></span>
                                    }
                                    {data?.CostingHeading === VARIANCE && ((!pdfHead)) && <TooltipCustom customClass="mb-0 ml-1" id="variance" tooltipText={`Variance = (${data.costingTypeId === CBCTypeId ? "New Costing - Old Costing" : "Old Costing - New Costing"})`} />}
                                  </div >
                                  <div className="action  text-right">
                                    {((!pdfHead && !drawerDetailPDF)) && (data?.IsAssemblyCosting === true) && < button id="costingSummary_viewbom" title='View BOM' className="hirarchy-btn mr-1 mb-0 align-middle" type={'button'} onClick={() => viewBomCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && EditAccessibility) && (data?.status === DRAFT) && <button id="costingSummary_edit" className="Edit mr-1 mb-0 align-middle" type={"button"} title={"Edit Costing"} onClick={() => editCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && ViewAccessibility) && (data?.status === DRAFT) && <button id="costingSummary_view" className="View mr-1 mb-0 align-middle" type={"button"} title={"View Costing"} onClick={() => viewCostingDetail(index)} />}
                                    {((!viewMode && (!pdfHead && !drawerDetailPDF)) && AddAccessibility) && <button id="costingSummary_add" className="Add-file mr-1 mb-0 align-middle" type={"button"} title={"Add Costing"} onClick={() => addNewCosting(index)} />}
                                    {(!isApproval || (isComparing && index > 1)) && (data?.bestCost === true ? false : ((!viewMode || props?.isRfqCosting || (isComparing && index > 1) || (approvalMode && data?.CostingHeading === '-')) && (!pdfHead && !drawerDetailPDF)) && <button id="costingSummary_discard" type="button" className="CancelIcon mb-0 align-middle" title='Discard' onClick={() => deleteCostingFromView(index)}></button>)}
                                  </div>
                                </div >
                              </th >
                            )
                          })}
                      </tr >
                    </thead >
                    <tbody>
                      {
                        (!isApproval || approvalMode) ?
                          <tr className={`${drawerDetailPDF ? "pdf-print" : ""}`} >
                            <td>
                              <span className="d-block">Costing Version</span>
                              <span className={`d-block mt-${props.isFromViewRFQ ? 4 : 2}`}>Net Cost (Effective from)</span>
                              {getConfigurationKey().IsSourceExchangeRateNameVisible && <span className="d-block">Exchange Rate Source</span>}
                              <span className="d-block">Currency</span>
                              <span className="d-block">{vendorLabel} (Code)</span>
                              {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <span className="d-block">Customer (Code)</span>}
                              <span className="d-block">Category</span>
                              <span className="d-block">Part Type</span>
                              <span className="d-block">Part Number</span>
                              <span className="d-block">Part Name</span>
                              <span className="d-block">Revision Number</span>
                              <span className="d-block">Plant (Code)</span>
                              {(props?.isRfqCosting && !checkTechnologyIdAndRfq(viewCostingData)) && <span className="d-block">SOB</span>}

                            </td >
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                const isPieChartVisible = viewPieChart[index];
                                const dateVersionAndStatus = (data?.bestCost === true) ? ' ' : `${DayTime(data?.costingDate).format('DD-MM-YYYY')}-${data?.CostingNumber}${props.isRfqCosting ? (notSelectedCostingId?.includes(data?.costingId) ? "-Not Selected" : `-${data?.status}`) : props.costingSummaryMainPage ? `-${data?.status}` : ''}`
                                return (
                                  <td className={tableDataClass(data)}>
                                    <div className={`date-and-btn-wrapper ${(data?.bestCost === true) ? '' : 'bg-grey'} ${drawerDetailPDF ? 'p-0' : ''}`}>
                                      <span className='date-and-version' title={dateVersionAndStatus}>{dateVersionAndStatus}</span>
                                      <div className='button-container'>{costingIdList?.includes(data?.costingId) && <button
                                        className="text-primary d-inline-block btn-a"
                                        onClick={() => showReturnCosting(index)}
                                        title='View Returned Costing'
                                      >
                                        <small>Returned Costing</small>{''}
                                      </button>}
                                        {
                                          !viewMode &&
                                          <button
                                            id="costing_change_version"
                                            className="text-primary d-inline-block btn-a"
                                            onClick={() => editHandler(index)}
                                          >
                                            {(!drawerDetailPDF && !pdfHead) && <small>Change version</small>}
                                          </button>
                                        }
                                      </div>
                                    </div>
                                    {(!data?.bestCost === true) && (
                                      <span className="d-flex justify-content-between align-items-center pie-chart-container">
                                        <span>
                                          {(data?.bestCost === true) ? ' ' : checkForDecimalAndNull(data?.poPrice, initialConfiguration.NoOfDecimalForPrice)}
                                          {(data?.bestCost === true) ? ' ' : ` (${(data?.effectiveDate && data?.effectiveDate !== '') ? DayTime(data?.effectiveDate).format('DD-MM-YYYY') : "-"})`}
                                          { }
                                        </span>
                                        {(!pdfHead && !drawerDetailPDF && data.totalCost !== 0 && !simulationDrawer) && (
                                          <span className={`pie-chart-wrapper pie-chart-wrapper-${index}`}>
                                            {isPieChartVisible ? (
                                              <button type="button" className="CancelIcon" title="Discard" onClick={() => pieChartCloseHandler(index)}></button>
                                            ) : (
                                              <button title="View Pie Chart" id="costing_view_pie_chart" type="button" className="pie-chart" onClick={() => viewPieChartHandler(index)}></button>
                                            )}
                                            {isPieChartVisible && (
                                              <span className="pie-chart-inner">
                                                <Costratiograph data={showPieChartObj[index]} options={pieChartOption} />
                                              </span>
                                            )}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {/* USE PART NUMBER KEY HERE */}
                                    {getConfigurationKey().IsSourceExchangeRateNameVisible && <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.ExchangeRateSourceName ? data?.ExchangeRateSourceName : '-')}</span>}
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.CostingCurrency ? data?.CostingCurrency : '-')}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : (data?.costingTypeId !== ZBCTypeId || data?.costingTypeId !== CBCTypeId || data?.costingTypeId !== WACTypeId) ? data?.vendor : ''}</span>
                                    {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.costingTypeId === CBCTypeId ? data?.customer : '-'}</span>}
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.InfoCategory}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.partType}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.partNumber}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.partName}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : data?.RevisionNumber}</span>
                                    <span className="d-block">{(data?.bestCost === true) ? ' ' : (data.costingTypeId === ZBCTypeId ? `${data?.plantName}` : `${data?.destinationPlantName}`)}</span>

                                    {data?.technologyId !== TOOLING_ID && (
                                      <>
                                        {
                                          props.isFromViewRFQ && data?.bestCost !== true ? <div className='d-flex align-items-center'>
                                            <div className="w-100px costing-error-container">
                                              <TextFieldHookForm
                                                label={false}
                                                name={`ShareOfBusinessPercent.${index}`}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                  required: true,
                                                  validate: { number, percentageLimitValidation, decimalNumberLimit6 },
                                                  max: {
                                                    value: 100,
                                                    message: "Percentage should not be greater then 100"
                                                  }
                                                }}
                                                defaultValue={data.shareOfBusinessPercent ?? 0}
                                                className="custom-height-28px"
                                                customClassName={"withBorder mb-0"}
                                                handleChange={(e) => {
                                                  e.preventDefault();
                                                  handleVBCSOBChange(e, index, data);
                                                }}
                                                errors={errors && errors.ShareOfBusinessPercent}
                                                disabled={data?.editSOBPercentage ? false : true}
                                              />
                                            </div>
                                            {data?.bestCost !== true && showEditSOBButton && <>
                                              {data?.editSOBPercentage ?
                                                <>
                                                  <Button
                                                    id="CostingSummary_SOB_Save"
                                                    variant="SaveIcon mb-0 ml-2 mr-0"
                                                    title="Save"
                                                    onClick={() => handleSOBSave(data, index)}
                                                  />
                                                  <Button
                                                    id="CostingSummary_SOB_Discard"
                                                    variant="CancelIcon mb-0 ml-2"
                                                    title="Discard"
                                                    onClick={() => handleSOBDiscard(data, index)} />
                                                </>
                                                : <Button
                                                  id="CostingSummary_SOB_Edit"
                                                  variant="Edit mb-0 ml-2"
                                                  title="Edit"
                                                  onClick={() => editValue(data, index)} />}
                                            </>}
                                          </div> : props.isRfqCosting && <span className="d-block">{data?.shareOfBusinessPercent ?? '0'}</span>
                                        }
                                      </>
                                    )
                                    }
                                  </td>
                                )
                              })}
                          </tr > :
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
                      {
                        !isLogisticsTechnology ? <>
                          {partType ? <>
                            <tr>
                              <td>
                                <span className={highlighter("", "rm-reducer")}>Part Cost/Pc</span>
                                <span className={highlighter("", "finish-reducer")}>{showBopLabel()} Cost/Assembly</span>
                                <span className={highlighter("BurningLossWeight")}>Process Cost/Assembly</span>
                                <span className={highlighter("ScrapWeight")}>Operation Cost/Assembly</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {data?.bestCost !== true && <>
                                        <span className="d-block small-grey-text">{data?.CostingHeading !== VARIANCE ? data?.netChildPartsCost : ''}</span>
                                        <span className={highlighter("rmRate")}>
                                          <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('BOP', index)}>{data?.CostingHeading !== VARIANCE ? data?.netBoughtOutPartCost : ''}</button>
                                        </span>
                                        <span className={highlighter("scrapRate")}>
                                          <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('process', index)}>{data?.CostingHeading !== VARIANCE ? data?.netProcessCost : ''}</button>
                                        </span>
                                        <span className={highlighter("", "rm-reducer")}>
                                          <button type='button' className='btn-hyper-link' onClick={() => DrawerOpen('operation', index)}>{data?.CostingHeading !== VARIANCE ? data?.netOperationCost : ''}</button>
                                        </span>
                                      </>}
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
                                  hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}
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
                                  hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}

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
                                  simulationMode={simulationMode}
                                  SimulationId={props?.simulationId}
                                /></th></tr>}

                            <tr className={highlighter("netRM", "main-row")}>
                              <th>Cost/Assembly {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) && '(Old)'}</th>
                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {displayValueWithSign(data, "nTotalRMBOPCC")}
                                      {
                                        (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                        <button
                                          id="view_multiple_technology"
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
                              {!drawerDetailPDF ?
                                <tr>
                                  <td>
                                    <span className="d-block small-grey-text">RM-Grade</span>
                                    <span className={highlighter("rmRate")}>RM Rate</span>
                                    <span className={highlighter("scrapRate")}>Scrap Rate</span>
                                    {isScrapRecoveryPercentageApplied && <span className={highlighter("", "scrap-recovery")}>Scrap Recovery %</span>}
                                    <span className={highlighter("", "rm-reducer")}>Gross Weight</span>
                                    <span className={highlighter("", "finish-reducer")}>Finish Weight</span>
                                    {viewCostingData && viewCostingData[0]?.technologyId === FORGING && <span className={highlighter("ForgingScrapWeight")}>Forging Scrap Weight</span>}
                                    {viewCostingData && viewCostingData[0]?.technologyId === FORGING && <span className={highlighter("MachiningScrapWeight")}>Machining Scrap Weight</span>}
                                    {viewCostingData && viewCostingData[0]?.technologyId === DIE_CASTING && <span className={highlighter("CastingWeight")}>Casting Weight</span>}
                                    {viewCostingData && viewCostingData[0]?.technologyId === DIE_CASTING && <span className={highlighter("MeltingLoss")}>Melting Loss (Loss%)</span>}
                                    {viewCostingData && viewCostingData[0]?.technologyId === PLASTIC && <span className={highlighter("BurningLossWeight")}>Burning Loss Weight </span>}
                                    <span className={highlighter("ScrapWeight")}>Scrap Weight</span>
                                  </td>
                                  {viewCostingData &&
                                    viewCostingData?.map((data) => {
                                      return (
                                        <td className={tableDataClass(data)}>
                                          <span className="d-block small-grey-text">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : data?.rm : '')}</span>
                                          <span className={highlighter("rmRate")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.RMRate, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.RMRate, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                          </span>
                                          <span className={highlighter("scrapRate")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRate, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRate, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                          </span>
                                          {isScrapRecoveryPercentageApplied && <span className={highlighter("scrapRate")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.ScrapRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                          </span>}
                                          <span className={highlighter("", "rm-reducer")}>
                                            {/* try with component */}
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : <span title={(data?.netRMCostView && reducer(data?.netRMCostView))}>{(data?.netRMCostView && reducer(data?.netRMCostView))}</span> : '')}
                                          </span>
                                          <span className={highlighter("", "finish-reducer")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.IsAssemblyCosting === true ? "Multiple RM" : <span title={(data?.netRMCostView && reducerFinish(data?.netRMCostView))}>{(data?.netRMCostView && reducerFinish(data?.netRMCostView))}</span> : '')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>
                                          {data?.technologyId === FORGING && <span className={highlighter("ForgingScrapWeight")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.ForgingScrapWeight && data?.ForgingScrapWeight)}>{(data?.ForgingScrapWeight ? data?.ForgingScrapWeight : "-")}</span> : '-')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>}
                                          {data?.technologyId === FORGING && <span className={highlighter("MachiningScrapWeight")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.MachiningScrapWeight && data?.MachiningScrapWeight)}>{(data?.MachiningScrapWeight ? data?.MachiningScrapWeight : '-')}</span> : '-')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>}
                                          {data?.technologyId === DIE_CASTING && <span className={highlighter("CastingWeight")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={(data?.netRMCostView && data?.netRMCostView[0]?.CastingWeight)}>{checkForDecimalAndNull(data?.netRMCostView[0]?.CastingWeight, initialConfiguration.NoOfDecimalForPrice)}</span> : '-')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>}
                                          {data?.technologyId === DIE_CASTING && <span className={highlighter("MeltingLoss")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? "Multiple RM" : <span title={`${checkForDecimalAndNull(data?.netRMCostView[0]?.MeltingLoss, initialConfiguration.NoOfDecimalForPrice)} (${(data?.netRMCostView[0]?.LossPercentage ? data?.netRMCostView[0]?.LossPercentage : 0)}%)`}>{`${checkForDecimalAndNull(data?.netRMCostView[0]?.MeltingLoss, initialConfiguration.NoOfDecimalForPrice)} (${(data?.netRMCostView[0]?.LossPercentage ? data?.netRMCostView[0]?.LossPercentage : 0)}%)`}</span> : '-')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>}

                                          {viewCostingData && viewCostingData[0]?.technologyId === PLASTIC && <span className={highlighter("BurningLossWeight")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(data?.netRMCostView && data?.netRMCostView[0] && data?.netRMCostView[0]?.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</span> : '')}
                                            {/* {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.fWeight, initialConfiguration.NoOfDecimalForInputOutput) : ''} */}
                                          </span>}
                                          <span className={highlighter("ScrapWeight")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.netRMCostView && (data?.netRMCostView.length > 1 || data?.IsAssemblyCosting === true) ? 'Multiple RM' : <span title={checkForDecimalAndNull(data?.netRMCostView[0]?.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(data?.netRMCostView[0]?.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput)}</span> : '')}
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

                              <tr className={highlighter("netRM", "main-row")}>
                                <th>Net RM Cost {simulationDrawer && (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) && '(Old)'}</th>
                                {viewCostingData &&
                                  viewCostingData?.map((data, index) => {
                                    return (
                                      <td className={tableDataClass(data)}>
                                        {displayValueWithSign(data, 'netRM')}
                                        {
                                          (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                          <button
                                            id="view_RawMaterial"

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
                              {
                                drawerDetailPDF && <tr><th className='py-0' colSpan={2}> <ViewBOP
                                  isOpen={isViewBOP}
                                  viewBOPData={viewBOPData}
                                  closeDrawer={closeViewDrawer}
                                  anchor={'right'}
                                  isPDFShow={true}
                                /></th></tr>
                              }
                              {
                                viewCostingData && !viewCostingData[0]?.CostingPartDetails?.IsBreakupBoughtOutPart && <tr className={highlighter("netBOP", "main-row")}>
                                  <th>Net {showBopLabel()} Cost {simulationDrawer && (Number(master) === Number(BOPDOMESTIC) || Number(master) === Number(BOPIMPORT)) && '(Old)'}</th>

                                  {viewCostingData &&
                                    viewCostingData?.map((data, index) => {
                                      return (
                                        <td className={tableDataClass(data)}>
                                          {displayValueWithSign(data, "netBOP")}
                                          {
                                            (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                            <button
                                              id="view_BOP"
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
                              }
                              {
                                !drawerDetailPDF ? <tr>
                                  <td>
                                    {((!checkTechnologyIdAndRfq(viewCostingData)) || (checkTechnologyIdAndRfq(viewCostingData) && !rfqCosting)) && <span className={highlighter("pCost")}>Process Cost</span>}
                                    <span className={highlighter("oCost")}>Operation Cost</span>
                                    {((!checkTechnologyIdAndRfq(viewCostingData)) || (checkTechnologyIdAndRfq(viewCostingData) && !rfqCosting)) && (<span className={highlighter("netOtherOperationCost")}>Other Operation Cost</span>)}

                                    {showLabourData && <span className={highlighter("NetLabourCost")}>Net Labour Cost</span>}
                                    {showLabourData && <span className={highlighter("IndirectLaborCost")}>Indirect Labor Cost</span>}
                                    {showLabourData && <span className={highlighter("StaffCost")}>Staff Cost</span>}
                                    {showDynamicKeys && <>
                                      <br />
                                      {renderOtherCostDetailsOverhead(otherCostDetailsProcess)}
                                    </>}
                                  </td>
                                  {viewCostingData &&
                                    viewCostingData?.map((data, indexInside) => {
                                      return (
                                        <td className={tableDataClass(data)}>
                                          {(!(checkTechnologyIdAndRfq(viewCostingData)) || (checkTechnologyIdAndRfq(viewCostingData) && !rfqCosting)) && <span className={highlighter("pCost")}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Process" : <span title={checkForDecimalAndNull(data?.pCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.pCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                          </span>}
                                          <span className={highlighter('oCost')}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Operation" : <span title={checkForDecimalAndNull(data?.oCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.oCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                          </span>
                                          {(!(checkTechnologyIdAndRfq(viewCostingData)) || (checkTechnologyIdAndRfq(viewCostingData) && !rfqCosting)) && <span className={highlighter('netOtherOperationCost')}>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Other Operation" : <span title={checkForDecimalAndNull(data?.netOtherOperationCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.netOtherOperationCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                          </span>}

                                          {
                                            showLabourData && <span className={highlighter('NetLabourCost')}>
                                              {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (<span title={checkForDecimalAndNull(data?.CostingPartDetails?.NetLabourCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails?.NetLabourCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                            </span>
                                          }
                                          {
                                            showLabourData && <span className={highlighter('IndirectLaborCost')}>
                                              {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (<span title={checkForDecimalAndNull(data?.CostingPartDetails?.IndirectLaborCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails?.IndirectLaborCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                            </span>
                                          }
                                          {
                                            showLabourData && <span className={highlighter('StaffCost')}>
                                              {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (<span title={checkForDecimalAndNull(data?.CostingPartDetails?.StaffCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails?.StaffCost, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                            </span>
                                          }
                                          {showDynamicKeys && <>
                                            {renderDataForOtherCostDetailsOverhead(otherCostDetailsProcess, indexInside, true, data)}
                                          </>}
                                        </td >
                                      )
                                    })
                                  }
                                </tr > : <tr><th className='py-0' colSpan={2}>
                                  <ViewConversionCost
                                    isOpen={isViewConversionCost}
                                    viewConversionCostData={viewConversionCostData}
                                    closeDrawer={closeViewDrawer}
                                    anchor={'right'}
                                    index={index}
                                    isPDFShow={true}
                                    stCostShow={false}
                                    hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}


                                  />
                                </th></tr>
                              }

                              <tr className={highlighter("nConvCost", "main-row")}>
                                <th>Net Conversion Cost{simulationDrawer && (Number(master) === Number(OPERATIONS)) && '(Old)'}</th>
                                {viewCostingData &&
                                  viewCostingData?.map((data, index) => {
                                    return (
                                      <td className={tableDataClass(data)}>
                                        {displayValueWithSign(data, 'nConvCost')}
                                        {
                                          (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                          <button
                                            id="view_conversion_cost"
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
                            </>
                          }
                          {
                            !drawerDetailPDF ? <tr>
                              <td>
                                <span className={highlighter("sTreatment")}>
                                  Surface Treatment
                                </span>
                                <span className={highlighter("tCost")}>
                                  Extra Surface Treatment Cost
                                </span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span className={highlighter("sTreatment")}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : <span title={checkForDecimalAndNull(data?.sTreatment, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.sTreatment, initialConfiguration.NoOfDecimalForPrice)}</span>) : '')}
                                      </span>
                                      <span className={highlighter("tCost")}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ?
                                          (data?.IsAssemblyCosting === true ? "Multiple Surface Treatment" : <span title={checkForDecimalAndNull(data?.tCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.tCost, initialConfiguration.NoOfDecimalForPrice)}</span>)
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
                                hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}

                              />
                            </th></tr>
                          }



                          <tr className={highlighter("nsTreamnt", "main-row")}>
                            <th>Net Surface Treatment Cost{simulationDrawer && (Number(master) === Number(SURFACETREATMENT)) && '(Old)'}</th>

                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    {displayValueWithSign(data, 'nsTreamnt')}
                                    {
                                      (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                      <button
                                        id="view_surface_treatment_cost"

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


                          {
                            !drawerDetailPDF ? <tr>
                              <td>
                                <span className="d-block small-grey-text">
                                  Model Type For Overhead/Profit
                                </span>
                                <br />
                                <span className={highlighter(["overheadOn", "overheadValue"], "multiple-key")}>Overhead On</span>
                                <span className={highlighter(["profitOn", "profitValue"], "multiple-key")}>Profit On</span>
                                <span className={highlighter(["profitOn", "profitValue"], "multiple-key")}>Rejection Recovery</span>
                                <span className={highlighter(["rejectionOn", "rejectionValue"], "multiple-key")}>Rejection On</span>
                                <span className={highlighter(["iccOn", "iccValue"], "multiple-key")}>ICC On</span>
                                {showDynamicKeys && <>
                                  {renderOtherCostDetailsOverhead(otherCostDetailsOverhead)}
                                </>}
                              </td>

                              {viewCostingData &&
                                viewCostingData?.map((data, indexInside) => {
                                  const { ApplicabilityType, EffectiveRecoveryPercentage, RejectionRecoveryNetCost } = data?.CostingRejectionRecoveryDetails || {}
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
                                      <div style={pdfHead ? { marginTop: '-4px' } : {}} className={`d-flex ${highlighter(["overheadOn", "overheadValue"], "multiple-key")}`}>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.overheadOn.overheadTitle : '')}
                                        </span>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {getOverheadPercentage(data)}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.overheadOn.overheadValue, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.overheadOn.overheadValue, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                        </span>
                                      </div>
                                      <div style={pdfHead ? { marginTop: '-3px' } : {}} className={`d-flex ${highlighter(["profitOn", "profitValue"], "multiple-key")}`}>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.profitOn.profitTitle : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {getProfitPercentage(data)}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.profitOn.profitValue, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.profitOn.profitValue, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                        </span>
                                      </div>
                                      <div style={pdfHead ? { marginTop: '-3px' } : {}} className={`d-flex ${highlighter(["profitOn", "profitValue"], "multiple-key")}`}>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? ApplicabilityType ?? '-' : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? EffectiveRecoveryPercentage ?? '-' : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(RejectionRecoveryNetCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(RejectionRecoveryNetCost, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                        </span>
                                      </div>
                                      <div style={pdfHead ? { marginTop: '-2px' } : {}} className={`d-flex ${highlighter(["rejectionOn", "rejectionValue"], "multiple-key")}`}>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.rejectionOn.rejectionTitle : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.rejectionOn.rejectionTitle === 'Fixed' ? '-' : data?.rejectionOn.rejectionPercentage : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.rejectionOn.rejectionValue, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.rejectionOn.rejectionValue, initialConfiguration.NoOfDecimalForPrice)}{!pdfHead && !drawerDetailPDF && RejectionRecoveryNetCost && <TooltipCustom customClass="mt-1 ml-1 p-absolute" id="rejection-recovery" width="280px" tooltipText={"Rejection Cost = Net Rejection Cost - Rejection Recovery Cost"} />}</span> : '')}
                                        </span>
                                      </div>
                                      <div style={pdfHead ? { marginTop: '-1px' } : {}} className={`d-flex  ${highlighter(["iccOn", "iccValue"], "multiple-key")}`}>
                                        <span className="d-inline-block w-50 small-grey-text">
                                          <span>
                                            {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.iccOn.iccTitle : '')}
                                            {(!pdfHead && !drawerDetailPDF && viewCostingData[index]?.isIncludeToolCostInCCForICC) && <TooltipCustom customClass="mt-1 ml-1 p-absolute" id="icc-toolcost-include" tooltipText={"Tool Cost Included"} />}
                                          </span></span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.iccOn.iccTitle === 'Fixed' ? '-' : data?.iccOn.iccPercentage : '')}
                                        </span>{' '}
                                        <span className="d-inline-block w-50 small-grey-text">
                                          {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.iccOn.iccValue, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.iccOn.iccValue, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                        </span>
                                      </div>
                                      {showDynamicKeys && <>
                                        {renderDataForOtherCostDetailsOverhead(otherCostDetailsOverhead, indexInside, false, data)}
                                      </>}
                                    </td>
                                  )
                                })}
                            </tr> : <tr><td colSpan={2} className='pb-0'><ViewOverheadProfit
                              isOpen={isViewOverheadProfit}
                              overheadData={viewOverheadData}
                              profitData={viewProfitData}
                              rejectAndModelType={viewRejectAndModelType}
                              viewRejectionRecovery={viewRejectionRecoveryData}
                              iccPaymentData={iccPaymentData}
                              closeDrawer={closeViewDrawer}
                              anchor={'right'}
                              isPDFShow={true}
                            /></td></tr>
                          }

                          <tr className={highlighter("nOverheadProfit", "main-row")}>
                            <th>Net Overheads & Profits</th>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    {displayValueWithSign(data, 'nOverheadProfit')}
                                    {
                                      (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                      <button
                                        id="view_overhead_profit"

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

                          {
                            !drawerDetailPDF ? <tr>
                              <td>
                                <span className={highlighter("packagingCost")}>Packaging Cost</span>
                                <span className={highlighter("freight")}>Freight</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span title={data?.packagingCost} className={`w-fit ${highlighter("packagingCost")}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.packagingCost, initialConfiguration.NoOfDecimalForPrice) : '')}
                                      </span>
                                      <span title={data?.freight} className={`w-fit ${highlighter("freight")}`}>
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.freight, initialConfiguration.NoOfDecimalForPrice) : '')}
                                      </span>
                                    </td>
                                  )
                                })}
                            </tr> : <tr><th colSpan={2}><ViewPackagingAndFreight
                              isOpen={isViewPackagingFreight}
                              packagingAndFreightCost={viewPackagingFreight}
                              closeDrawer={closeViewDrawer}
                              anchor={'right'}
                              isPDFShow={true} /></th></tr>
                          }

                          <tr className={highlighter("nPackagingAndFreight", "main-row")}>
                            <th>Net Packaging & Freight</th>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    {displayValueWithSign(data, 'nPackagingAndFreight')}
                                    {
                                      (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                      <button
                                        id="view_packaging_freight"

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


                          {
                            (!(checkTechnologyIdAndRfq(viewCostingData)) || (checkTechnologyIdAndRfq(viewCostingData) && !rfqCosting)) && (
                              <>
                                {!drawerDetailPDF ? (
                                  <tr>
                                    <td>
                                      <span className="d-block small-grey-text pt-3"></span>
                                      <span className={highlighter("toolMaintenanceCost")}>{`${toolMaintenanceCostLabel} on`}</span>
                                      <span className={highlighter("toolPrice")}>Tool Price</span>
                                      <span className={highlighter("amortizationQty")}>Amortization Quantity (Tool Life)</span>
                                      <span className={highlighter("toolAmortizationCost")}>Tool Amortization Cost</span>
                                    </td>
                                    {viewCostingData.map((data) => (
                                      <td className={`${tableDataClass(data)} ${pdfHead || drawerDetailPDF ? '' : ''}`}>
                                        <div className={`d-flex`}>
                                          <span className="d-inline-block p-0 w-50">
                                            {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? data?.toolApplicability.applicability : ''}
                                          </span>
                                          &nbsp;
                                          <span className="d-inline-block p-0 w-50">
                                            {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? data?.toolApplicability.value : ''}
                                          </span>
                                        </div>
                                        <div className={`${highlighter("toolMaintenanceCost")} d-flex`}>
                                          <span className="d-inline-block w-50">
                                            {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? data?.toolApplicabilityValue.toolTitle : ''}
                                          </span>
                                          &nbsp;
                                          <span className="d-inline-block w-50">
                                            {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? (
                                              <span title={checkForDecimalAndNull(data?.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice)}>
                                                {checkForDecimalAndNull(data?.toolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice)}
                                              </span>
                                            ) : ''}
                                          </span>
                                        </div>
                                        <span className={highlighter("toolPrice")}>
                                          {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? (
                                            <span title={checkForDecimalAndNull(data?.toolPrice, initialConfiguration.NoOfDecimalForPrice)}>
                                              {checkForDecimalAndNull(data?.toolPrice, initialConfiguration.NoOfDecimalForPrice)}
                                            </span>
                                          ) : ''}
                                        </span>
                                        <span className={highlighter("amortizationQty")}>
                                          {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? data?.amortizationQty : ''}
                                        </span>
                                        <span className={highlighter("toolAmortizationCost")}>
                                          {data?.bestCost === true ? ' ' : data?.CostingHeading !== VARIANCE ? data?.toolAmortizationCost : ''}
                                        </span>
                                      </td>
                                    ))}
                                  </tr>
                                ) : (
                                  <tr>
                                    <th colSpan={2} className="py-0">
                                      <ViewToolCost
                                        isOpen={isViewToolCost}
                                        viewToolCost={viewToolCost}
                                        closeDrawer={closeViewDrawer}
                                        anchor="right"
                                        isPDFShow={true}
                                      />
                                    </th>
                                  </tr>
                                )}

                                {/* Net Tool Cost Row */}
                                <tr className={highlighter("totalToolCost", "main-row")}>
                                  <th>Net Tool Cost</th>
                                  {viewCostingData.map((data, index) => (
                                    <td className={tableDataClass(data)}>
                                      {displayValueWithSign(data, "totalToolCost")}
                                      {data?.bestCost !== true && data?.CostingHeading !== VARIANCE && !pdfHead && !drawerDetailPDF && (
                                        <button
                                          id="view_toolCost"
                                          type="button"
                                          title="View"
                                          className="float-right mb-0 View"
                                          onClick={() => viewToolCostData(index)}
                                        ></button>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              </>
                            )
                          }


                          <tr className='border-right'>
                            <td>
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
                                    <td className={tableDataClass(data)}>
                                      {/* <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.discount : ''}</span> &nbsp;{' '}
                                       <span className="d-inline-block w-50 ">{data?.CostingHeading !== VARIANCE ? data?.otherDiscount.value : ''}</span> */}

                                      <div className={`${highlighter("NetDiscountsCost")}`}>
                                        <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.CostingPartDetails.NetDiscountsCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails.NetDiscountsCost, initialConfiguration.NoOfDecimalForPrice)}</span> : ''}</span>
                                      </div>
                                      {/* <span className="d-inline-block ">{"Applicability"}</span>
                                      <span className="d-inline-block ">{"Value"}</span>
                                      <span className="d-inline-block ">{"Cost"}</span>
                                 
                                    <div className={`d-grid ${highlighter(["otherDiscountValue", "discountValue"], "multiple-key")}`}>
                                      <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE && data?.CostingPartDetails?.DiscountCostDetails?.length > 0 && data?.CostingPartDetails?.DiscountCostDetails[0]?.ApplicabilityType}</span>
                                      <span className="d-inline-block small-grey-text">{(data?.CostingHeading !== VARIANCE && data?.CostingPartDetails?.DiscountCostDetails?.length > 0) && <span title={checkForDecimalAndNull(data?.CostingPartDetails?.DiscountCostDetails[0]?.Value, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails?.DiscountCostDetails[0]?.Value, initialConfiguration.NoOfDecimalForPrice)}</span>}</span>
                                      <span className="d-inline-block small-grey-text">{(data?.CostingHeading !== VARIANCE && data?.CostingPartDetails?.DiscountCostDetails?.length > 0) ? <span title={checkForDecimalAndNull(data?.CostingPartDetails?.DiscountCostDetails[0]?.NetCost, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.CostingPartDetails?.DiscountCostDetails[0]?.NetCost, initialConfiguration.NoOfDecimalForPrice)}</span> : ''}</span>
                                    </div> */}
                                    </td >
                                    : ""
                                )
                              })}
                          </tr >
                          { }

                          < tr className='border-right' >
                            <td>
                              <span className="d-block small-grey-text"> Any Other Cost</span>
                            </td>
                            {
                              viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (

                                  (data?.bestCost !== true) && data?.CostingHeading !== VARIANCE ?
                                    <td className={tableDataClass(data)}>
                                      <div className={`${highlighter("anyOtherCostTotal")}`}>
                                        <span className="d-inline-block small-grey-text">{data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.anyOtherCostTotal, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.anyOtherCostTotal, initialConfiguration.NoOfDecimalForPrice)}</span> : ''}</span>
                                      </div>
                                    </td>
                                    : ""

                                )
                              })
                            }
                          </tr >
                          {!initialConfiguration?.IsShowTCO && < tr className='border-right' >
                            <td>
                              <span className={highlighter(["paymentTerms", "paymentValue"], "multiple-key")}>Payment Terms</span>
                            </td>

                            {
                              viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (

                                  <td className={tableDataClass(data)}>
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

                                    <div style={pdfHead ? { marginTop: '-1px' } : {}} className={`d-flex ${highlighter(["paymentTerms", "paymentValue"], "multiple-key")}`}>
                                      <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.paymentTerms.paymentTitle : '')}
                                      </span>{' '}
                                      <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : data?.CostingHeading !== VARIANCE ? data?.paymentTerms.paymentTitle === 'Fixed' ? '-' : data?.paymentTerms.paymentPercentage : ''}
                                      </span>{' '}
                                      <span className="d-inline-block w-50 small-grey-text">
                                        {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? <span title={checkForDecimalAndNull(data?.paymentTerms.paymentValue, initialConfiguration.NoOfDecimalForPrice)}>{checkForDecimalAndNull(data?.paymentTerms.paymentValue, initialConfiguration.NoOfDecimalForPrice)}</span> : '')}
                                      </span>
                                    </div>
                                  </td>

                                )
                              })
                            }
                          </tr >}
                          {showSaLineNumber() && <tr>
                            <td>
                              <span className="d-block small-grey-text"> SA Number</span>
                              <span className="d-block small-grey-text"> Line Number</span>
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    <span title={data?.saNumber} className={`w-fit ${highlighter("saNumber")}`}>
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.saNumber : '')}
                                    </span>
                                    <span title={data?.lineNumber} className={`w-fit ${highlighter("lineNumber")}`}>
                                      {(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.lineNumber : '')}
                                    </span>
                                  </td>
                                )
                              })}
                          </tr>}
                          {getConfigurationKey()?.IsTaxCodeVisible && <tr>
                            <td>
                              <span className="d-block small-grey-text"> Tax Code</span>
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    <span
                                      title={Array.isArray(data?.TaxCodeList) && data.TaxCodeList.length > 0
                                        ? data.TaxCodeList.map(tc => tc?.TaxCodeAndDescription || '').filter(Boolean).join(', ')
                                        : '-'
                                      }
                                      className={`w-fit ${highlighter("taxCode")}`}
                                    >
                                      {data?.bestCost === true
                                        ? ' '
                                        : (data?.CostingHeading !== VARIANCE
                                          ? (Array.isArray(data?.TaxCodeList) && data.TaxCodeList.length > 0
                                            ? data.TaxCodeList.map(tc => tc?.TaxCodeAndDescription || '').filter(Boolean).join(', ')
                                            : '-')
                                          : ''
                                        )
                                      }

                                    </span>
                                  </td>
                                )
                              })}
                          </tr>}
                          {
                            initialConfiguration?.IsBasicRateAndCostingConditionVisible && <tr className={`${highlighter("BasicRate", "main-row")}`}>
                              <th>Basic Price </th>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      {displayValueWithSign(data, 'BasicRate')}
                                    </td>
                                  )
                                })}
                            </tr>
                          }
                          {!initialConfiguration?.IsShowTCO &&
                            <tr>
                              <td>
                                <span className={`d-block small-grey-text`}>NPV Cost</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data, index) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span title={data?.netNpvCost} className={`d-block small-grey-text w-fit `}>
                                        {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.netNpvCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                      </span>

                                    </td>
                                  )
                                })}
                            </tr>
                          }
                          {
                            initialConfiguration?.IsBasicRateAndCostingConditionVisible && <tr>
                              <td>
                                <span className={`d-block small-grey-text`}>Net Condition Cost</span>
                              </td>
                              {viewCostingData &&
                                viewCostingData?.map((data) => {
                                  return (
                                    <td className={tableDataClass(data)}>
                                      <span title={data?.netConditionCost} className={`d-block small-grey-text w-fit `}>
                                        {data?.CostingHeading !== VARIANCE ? checkForDecimalAndNull(data?.netConditionCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                      </span>

                                    </td>
                                  )
                                })}
                            </tr>
                          }
                          {
                            initialConfiguration?.IsShowNpvCost && drawerDetailPDF && <tr><th colSpan={2}>
                              <ViewOtherCostDrawer
                                isOpen={openNpvDrawer}
                                costingSummary={true}
                                viewCostingData={viewCostingData}
                                tableData={[]}
                                npvIndex={npvIndex}
                                closeDrawer={closeNpvDrawer}
                                anchor={'right'}
                                isPDFShow={true}
                                CostingPaymentTermDetails={paymentTermsData}
                                npvCostData={npvData}
                              />
                            </th></tr>
                          }
                        </> : <>
                          {drawerDetailPDF && <tr><th colSpan={2}><ViewPackagingAndFreight
                            isOpen={isViewPackagingFreight}
                            packagingAndFreightCost={viewPackagingFreight}
                            closeDrawer={closeViewDrawer}
                            isLogisticsTechnology={isLogisticsTechnology}
                            anchor={'right'}
                            isPDFShow={true} /></th></tr>}
                          <tr className={highlighter("nPackagingAndFreight", "main-row")}>
                            <th>Net Freight </th>
                            {viewCostingData &&
                              viewCostingData?.map((data, index) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    {displayValueWithSign(data, "nPackagingAndFreight")}
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

                        <tr className={`${highlighter("nPOPrice", "main-row")} netPo-row`}>
                          <th>Net Cost ({getConfigurationKey().BaseCurrency}){simulationDrawer && '(Old)'}</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td className={tableDataClass(data)}>
                                {displayValueWithSign(data, "nPOPrice")}
                                {
                                  (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    id="view_otherToolCost"

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

                      {
                        viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
                          <td>
                            <span className="d-block small-grey-text">Currency</span>
                          </td>
                          {viewCostingData &&
                            viewCostingData?.map((data) => {
                              return (
                                <td className={tableDataClass(data)}>
                                  <div>
                                    <span className={`small-grey-text mr-1 ${data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? 'd-none' : '' : ''}  `}>{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? `${data?.currency.currencyTitle}/${getConfigurationKey().BaseCurrency}` : '')}</span> {' '}
                                    <span className="">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.currency.currencyValue === '-' ? '-' : checkForDecimalAndNull(data?.currency.currencyValue, initialConfiguration.NoOfDecimalForPrice) : '')}</span>
                                  </div>
                                </td>
                              )
                            })}
                        </tr>
                      }

                      {
                        viewCostingData[0]?.technologyId !== LOGISTICS &&
                        <tr className={`background-light-blue  ${getCurrencyVarianceFormatter()}`}>
                          <th>Net Cost (In Currency){simulationDrawer && '(Old)'}</th>
                          {/* {viewCostingData &&
                        viewCostingData?.map((data, index) => {
                          return <td>Net PO Price({(data?.currency.currencyTitle !== '-' ? data?.currency.currencyTitle : 'INR')})</td>
                        })} */}


                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td className={tableDataClass(data)}>

                                {displayValueWithSign(data, "nPOPriceWithCurrency")}
                              </td>
                            })}
                        </tr>
                      }

                      { }
                      {
                        IsNccCosting && <>
                          <tr>
                            <td>
                              <span className="d-block small-grey-text">Quantity</span>
                            </td>
                            {viewCostingData &&
                              viewCostingData?.map((data) => {
                                return (
                                  <td className={tableDataClass(data)}>
                                    <div>
                                      <span className="">{data?.CostingHeading !== VARIANCE ? data?.NCCPartQuantity === '-' ? '-' : checkForDecimalAndNull(data?.NCCPartQuantity, initialConfiguration.NoOfDecimalForPrice) : ''}</span>
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
                        </>
                      }
                      {initialConfiguration?.IsShowTCO && <ViewTcoDetail isApproval={isApproval} viewCostingData={viewCostingData} isRfqCosting={props?.isRfqCosting} highlighter={highlighter} displayValueWithSign={displayValueWithSign} tableDataClass={tableDataClass} loader={loader} setLoader={setLoader} />}
                      {initialConfiguration?.IsShowTCO && <tr className={highlighter("nPackagingAndFreight", "main-row")}>

                        <th>Total TCO Cost <TooltipCustom id="tco_cost" tooltipText="Calculation made upon Payment term, Warranty, Quality PPM, Incoterm and Investment" />
                        </th>

                        {viewCostingData &&
                          viewCostingData?.map((data, index) => {
                            return (
                              <td className={tableDataClass(data)}>
                                {displayValueWithSign(data, "TotalTCOCost")}
                                {/* {checkForDecimalAndNull(data.TotalTCOCost, initialConfiguration.NoOfDecimalForPrice)} */}
                                {
                                  (data?.bestCost !== true) && (data?.CostingHeading !== VARIANCE) && (!pdfHead && !drawerDetailPDF) &&
                                  <button
                                    id="view_tcoCost"
                                    type="button"
                                    title='View'
                                    className="float-right mb-0 View "
                                    onClick={() => viewTcoData(data, index)}
                                  >
                                  </button>
                                }
                              </td>
                            )
                          })}
                      </tr>}

                      {
                        viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
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
                        </tr>
                      }


                      {
                        viewCostingData[0]?.technologyId !== LOGISTICS && <tr>
                          <th>Remarks</th>
                          {viewCostingData &&
                            viewCostingData?.map((data, index) => {
                              return <td className={tableDataClass(data)}><span className="d-block small-grey-text">{(data?.bestCost === true) ? ' ' : (data?.CostingHeading !== VARIANCE ? data?.remark : '')}</span></td>
                            })}
                        </tr>
                      }

                      {
                        (!viewMode) && (
                          <tr className={`${pdfHead || drawerDetailPDF ? 'd-none' : 'background-light-blue'}`}>
                            <td className="text-center"></td>

                            {viewCostingData?.map((data, index) => {

                              return (

                                <td className="text-center costing-summary">
                                  {(!viewMode && !isFinalApproverShow) &&
                                    (data?.status === DRAFT) && (!pdfHead && !drawerDetailPDF) && !isSuperAdmin &&
                                    <button
                                      className="user-btn"
                                      disabled={viewCostingData[index].IsApprovalLocked}
                                      onClick={() => {
                                        sendForApprovalDown([data])
                                      }}
                                    ><div className="send-for-approval"></div>
                                      Send For Approval
                                    </button>
                                  }
                                </td>

                              )
                            })}
                          </tr>
                        )
                      }
                    </tbody >
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
      {
        isOpenRejectedCosting &&
        <CostingDetailSimulationDrawer
          isOpen={setIsOpenRejectedCosting}
          closeDrawer={closeUserDetails}
          anchor={"right"}
          isReport={isOpenRejectedCosting}
          // selectedRowData={selectedRowData}
          isSimulation={false}
          simulationDrawer={false}
          // isReportLoader={isReportLoader}
          isRejectedSummaryTable={true}
          selectedTechnology={props?.selectedTechnology}
        />
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
            hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}

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
            hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}

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
            costingTypeId={viewCostingData[index]?.costingTypeId}
            simulationMode={simulationMode}
            SimulationId={props?.simulationId}
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
            hideProcessAndOtherCostTable={checkTechnologyIdAndRfq(viewCostingData)}

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
            viewRejectionRecovery={viewRejectionRecoveryData}
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
            isToolCostProcessWise={viewCostingData[index]?.isToolCostProcessWise}
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
            dataSelected={dataSelected}
            callSapCheckAPI={true}
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
            isRfqCosting={props?.isRfqCosting}
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

      {
        npvData && openNpvDrawer && <ViewOtherCostDrawer
          isOpen={openNpvDrawer}
          viewCostingData={viewCostingData}
          costingSummary={true}
          tableData={[]}
          npvIndex={npvIndex}
          costingIndex={npvIndex}
          closeDrawer={closeNpvDrawer}
          anchor={'right'}
          partId={viewCostingData[npvIndex]?.partId}
          vendorId={viewCostingData[npvIndex]?.vendorId}
          isRfqCosting={props?.isRfqCosting}
          CostingPaymentTermDetails={paymentTermsData}
          npvCostData={npvData}

        />
      }
      {
        tcoAndNpvDrawer && <AddNpvCost
          npvData={npvData}
          isOpen={tcoAndNpvDrawer}
          viewCostingData={viewCostingData}
          costingSummary={true}
          tableData={[]}
          npvIndex={npvIndex}
          closeDrawer={closeNpvDrawer}
          anchor={'right'}
          partId={viewCostingData[npvIndex]?.partId}
          vendorId={viewCostingData[npvIndex]?.vendorId}
          isRfqCosting={props?.isRfqCosting}
          costingId={costingId}
          totalCostFromSummary={true}


        />
      }
    </Fragment >
  )
}
CostingSummaryTable.defaultProps = {
  partNumber: {}
}
export default CostingSummaryTable
