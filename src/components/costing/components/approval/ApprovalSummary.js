import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Table } from 'reactstrap'
import { checkForDecimalAndNull, checkVendorPlantConfigurable, formViewData, getConfigurationKey, loggedInUserId, getPOPriceAfterDecimal } from '../../../../helper'
import { approvalPushedOnSap, getApprovalSummary } from '../../actions/Approval'
import { checkFinalUser, getReleaseStrategyApprovalDetails, getSingleCostingDetails, setCostingViewData, storePartNumber, updateCostingIdFromRfqToNfrPfs } from '../../actions/Costing'
import ApprovalWorkFlow from './ApprovalWorkFlow'
import CostingSummaryTable from '../CostingSummaryTable'
import DayTime from '../../../common/DayTimeWrapper'
import { Fragment } from 'react'
import ViewDrawer from './ViewDrawer'
import PushButtonDrawer from './PushButtonDrawer'
import { Redirect } from 'react-router'
import LoaderCustom from '../../../common/LoaderCustom';
import CalculatorWrapper from '../../../common/Calculator/CalculatorWrapper'
import { debounce } from 'lodash'
import { INR } from '../../../../config/constants'
import { Fgwiseimactdata } from '../../../simulation/components/FgWiseImactData'
import { CBCTypeId, EMPTY_GUID, NCC, NCCTypeId, VBC, VBCTypeId, ZBCTypeId } from '../../../../config/constants'
import NoContentFound from '../../../common/NoContentFound'
import { getLastSimulationData } from '../../../simulation/actions/Simulation'
import Toaster from '../../../common/Toaster'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'
import { reactLocalStorage } from 'reactjs-localstorage'
import { getMultipleCostingDetails, rfqGetBestCostingDetails, setQuotationIdForRFQ } from '../../../rfq/actions/rfq'
import _ from 'lodash'
import { pushNfrOnSap } from '../../../masters/nfr/actions/nfr'
import { MESSAGES } from '../../../../config/message'
import CostingApproveReject from './CostingApproveReject'
import { ErrorMessage } from '../../../simulation/SimulationUtils'
import { useLabels } from '../../../../helper/core'
export const QuotationIdFromSummary = React.createContext();

function ApprovalSummary(props) {
  const { approvalNumber, approvalProcessId } = props.location.state
  const loggedInUser = loggedInUserId()

  const dispatch = useDispatch()
  const { vendorLabel } = useLabels()

  const [approveDrawer, setApproveDrawer] = useState(false)
  const [rejectDrawer, setRejectDrawer] = useState(false)
  const [partDetail, setPartDetail] = useState({})
  const [approvalDetails, setApprovalDetails] = useState({})
  const [costingSummary, setCostingSummary] = useState(false)
  const [approvalLevelStep, setApprovalLevelStep] = useState([])
  const [approvalData, setApprovalData] = useState('')
  const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
  const [showListing, setShowListing] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval
  const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
  const [showPushDrawer, setShowPushDrawer] = useState(false)
  const [viewButton, setViewButton] = useState(false)
  const [pushButton, setPushButton] = useState(false)
  const [isLoader, setIsLoader] = useState(false);
  const [fgWiseAcc, setFgWiseAcc] = useState(false)
  const [lastRevisionDataAcc, setLastRevisionDataAcc] = useState(false)
  const [editWarning, setEditWarning] = useState(false)
  const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
  const [masterIdForLastRevision, setMasterIdForLastRevision] = useState('')
  const [IsRegularizationLimit, setIsRegularizationLimit] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [costingHead, setCostingHead] = useState("")
  const [nccPartQuantity, setNccPartQuantity] = useState("")
  const [IsRegularized, setIsRegularized] = useState("")
  const [costingTypeId, setCostingTypeId] = useState("")
  const [approvalTypeId, setApprovalTypeId] = useState("")
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const [uniqueShouldCostingId, setUniqueShouldCostingId] = useState([])
  const [costingIdList, setCostingIdList] = useState([])
  const [notSelectedCostingId, setNotSelectedCostingId] = useState([])
  const [isRFQ, setisRFQ] = useState(false)
  const [conditionInfo, setConditionInfo] = useState([])
  const [vendorCodeForSap, setVendorCodeForSap] = useState('')
  const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
  const [costingIdArray, setCostingIdArray] = useState({})
  const [fgWise, setFgWise] = useState(false)
  const [accDisable, setAccDisable] = useState(false)
  const [dataForFetchingAllApprover, setDataForFetchingAllApprover] = useState({})
  const [approvalType, setApprovalType] = useState('');
  const [isRFQCostingApproval, setIsRFQCostingApproval] = useState(false);
  const { technologyLabel } = useLabels();
  const headerName = ['Revision No.', 'Name', 'Existing Cost/Pc', 'Revised Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
  const parentField = ['PartNumber', '-', 'PartName', '-', '-', '-', 'VariancePerPiece', 'VolumePerYear', 'ImpactPerQuarter', 'ImpactPerYear']
  const childField = ['PartNumber', 'ECNNumber', 'PartName', 'ExistingCost', 'RevisedCost', 'Quantity', 'VariancePerPiece', '-', '-', '-']
  useEffect(() => {
    approvalSummaryHandler()
  }, [])

  useEffect(() => {

    if (Object.keys(approvalData).length > 0 && (approvalDetails.CostingTypeId === VBCTypeId)) {
      dispatch(getLastSimulationData(approvalData.VendorId, approvalData.EffectiveDate, res => {
        const structureOfData = {
          ExchangeRateImpactedMasterDataList: [],
          OperationImpactedMasterDataList: [],
          RawMaterialImpactedMasterDataList: [],
          BoughtOutPartImpactedMasterDataList: [],
          SurfaceTreatmentImpactedMasterDataList: [],
          MachineProcessImpactedMasterDataList: []
        }
        let masterId
        let Data = []
        if (Number(res?.status) === 204) {
          Data = structureOfData
        } else {
          Data = res?.data?.Data
          masterId = res?.data?.Data?.SimulationTechnologyId;
        }

        if (res) {
          setImpactedMasterDataListForLastRevisionData(Data)
          setMasterIdForLastRevision(masterId)
          // setLastRevisionDataAcc(true)
        }
      }))
    }

  }, [approvalData])

  useEffect(() => {
    let check = impactedMasterDataListForLastRevisionData?.RawMaterialImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.OperationImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.ExchangeRateImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.BoughtOutPartImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.SurfaceTreatmentImpactedMasterDataList?.length <= 0 &&
      impactedMasterDataListForLastRevisionData?.MachineProcessImpactedMasterDataList <= 0
    if (lastRevisionDataAcc && check) {
      Toaster.warning('There is no data for the Last Revision.')
      setEditWarning(true)
    } else {
      setEditWarning(false)
    }
  }, [lastRevisionDataAcc, impactedMasterDataListForLastRevisionData])

  const approvalSummaryHandler = () => {
    setIsLoader(true)
    dispatch(getApprovalSummary(approvalNumber, approvalProcessId, loggedInUser, (res) => {

      if (res?.data?.Data?.Costings?.length > 0) {
        const { IsRFQCostingApproval, PartDetails, ApprovalDetails, ApprovalLevelStep, DepartmentId, Technology, ApprovalProcessId,
          ApprovalProcessSummaryId, ApprovalNumber, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow,
          CostingId, PartId, PartNumber, DepartmentCode, LastCostingId, DecimalOption, VendorId, IsRegularizationLimitCrossed, CostingHead, NCCPartQuantity, IsRegularized, ApprovalTypeId, CostingTypeId, BestCostAndShouldCostDetails, QuotationId, DivisionId } = res?.data?.Data?.Costings[0];
        setApprovalTypeId(ApprovalTypeId)
        setIsRFQCostingApproval(IsRFQCostingApproval)
        dispatch(setQuotationIdForRFQ(QuotationId))

        // let BestCostAndShouldCostDetails = {
        //   ShouldCostings: [{ CostingId: "aae83b68-128d-4ade-b446-cd2407d6c1c2" }],
        //   CostingIdList: [{ CostingId: "4a3dc510-ae1c-478a-969a-3fa7c1820d62" }, { CostingId: "2d49ced2-dc50-4e63-b2b9-ed74dd44fb24" }],
        //   BestCostId: "24f21230-003d-4c1d-92d2-5d4fb48de80e"
        // }
        let wholeCostingData = res?.data?.Data?.Costings
        setDataForFetchingAllApprover({
          processId: approvalProcessId,
          levelId: wholeCostingData[0].ApprovalLevelStep[ApprovalLevelStep.length - 1].LevelId,
          mode: 'Costing'
        })
        setisRFQ(BestCostAndShouldCostDetails?.BestCostId ? true : false)
        if (BestCostAndShouldCostDetails?.BestCostId) {
          let temp = []
          let tempObj = {}
          let list = _.map([...BestCostAndShouldCostDetails?.CostingIdList], 'CostingId')

          setCostingIdList(list)
          const filteredArray = list.filter((id) => id !== CostingId);
          setNotSelectedCostingId(filteredArray)


          setUniqueShouldCostingId(_.map(BestCostAndShouldCostDetails?.ShouldCostings, 'CostingId'))
          let costing = [...BestCostAndShouldCostDetails?.ShouldCostings, ...BestCostAndShouldCostDetails?.CostingIdList, { CostingId: CostingId }]

          dispatch(getMultipleCostingDetails(costing, (res) => {
            if (res) {
              res.map((item) => {
                tempObj = formViewData(item?.data?.Data)
                temp.push(tempObj[0])
                return null
              })
              dispatch(rfqGetBestCostingDetails(BestCostAndShouldCostDetails?.BestCostId, (res) => {
                tempObj = formViewData(res?.data?.Data, '', true)
                tempObj[0].bestCost = true
                temp.push(tempObj[0])
                let dat = [...temp]

                let tempArrToSend = _.uniqBy(dat, 'costingId')

                dispatch(setCostingViewData([...tempArrToSend]))
              }))
            }
          }))
        }
        setCostingTypeId(ApprovalTypeId)
        setNccPartQuantity(NCCPartQuantity)
        setIsRegularized(IsRegularized)
        setCostingHead(CostingHead)
        const technologyId = res?.data?.Data?.Costings[0].PartDetails.TechnologyId
        const Data = res?.data?.Data?.Costings[0].ApprovalDetails[0]
        setIsRegularizationLimit(IsRegularizationLimitCrossed ? IsRegularizationLimitCrossed : false)
        setIsLoader(false)
        dispatch(storePartNumber({ partId: PartId, partNumber: PartNumber }))
        setPartDetail(PartDetails)
        setApprovalDetails(ApprovalDetails[0])
        setApprovalLevelStep(ApprovalLevelStep)
        setIsApprovalDone(IsSent)
        setShowFinalLevelButton(!IsFinalLevelButtonShow)
        setShowPushButton(IsPushedButtonShow)
        setApprovalData({
          DepartmentId: DepartmentId,
          Technology: Technology,
          TechnologyId: technologyId,
          ApprovalProcessId: ApprovalProcessId,
          ApprovalProcessSummaryId: ApprovalProcessSummaryId,
          ApprovalNumber: ApprovalNumber,
          CostingId: CostingId,
          ReasonId: ApprovalDetails[0].ReasonId,
          DecimalOption: DecimalOption,
          LastCostingId: LastCostingId,
          PartNumber: PartNumber,
          VendorCode: Data.VendorCode,
          VendorName: Data.VendorName,
          Plant: Data.DestinationPlantCode ?? '',
          PlantId: Data.DestinationPlantId ?? EMPTY_GUID,
          DepartmentCode: DepartmentCode,
          NewPOPrice: Data.NewPOPrice,
          EffectiveDate: ApprovalDetails[0].EffectiveDate,
          VendorId: VendorId,
          QuotationId: QuotationId,
          DivisionId: DivisionId
        })
        let requestArray = []
        let requestObject = {}

        requestArray.push(CostingId)
        requestObject.IsCreate = false
        requestObject.CostingId = requestArray
        setCostingIdArray(requestObject)

        //MINDA
        if (initialConfiguration?.IsReleaseStrategyConfigured) {
          let requestObject = {
            "RequestFor": "COSTING",
            "TechnologyId": technologyId,
            "LoggedInUserId": loggedInUserId(),
            "ReleaseStrategyApprovalDetails": [{ CostingId: CostingId }]
          }
          dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
            setReleaseStrategyDetails(res?.data?.Data)
            if (res?.data?.Data?.IsUserInApprovalFlow && !res?.data?.Data?.IsFinalApprover) {
              setShowFinalLevelButton(res?.data?.Data?.IsFinalApprover)
            } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
              let obj = {
                DepartmentId: DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: technologyId,
                Mode: 'costing',
                // approvalTypeId: costingTypeIdToApprovalTypeIdFunction(CostingTypeId),
                approvalTypeId: ApprovalTypeId,
                plantId: Data.DestinationPlantId ?? EMPTY_GUID,
                divisionId: DivisionId ?? null
              }
              dispatch(checkFinalUser(obj, res => {
                if (res && res.data && res.data.Result) {
                  setShowFinalLevelButton(res.data.Data.IsFinalApprover)
                }
              }))
            } else if (res?.data?.Data?.IsFinalApprover) {
              setShowFinalLevelButton(res?.data?.Data?.IsFinalApprover)
              return false
            } else if (res?.data?.Result === false) {
            } else {
            }
          }))
        } else {
          let obj = {
            DepartmentId: DepartmentId,
            UserId: loggedInUserId(),
            TechnologyId: technologyId,
            Mode: 'costing',
            // approvalTypeId: costingTypeIdToApprovalTypeIdFunction(CostingTypeId),
            approvalTypeId: ApprovalTypeId,

            plantId: Data.DestinationPlantId,
            divisionId: DivisionId ?? null
          }
          dispatch(checkFinalUser(obj, res => {
            if (res && res.data && res.data.Result) {
              setShowFinalLevelButton(res.data.Data.IsFinalApprover)
            }
          }))
        }

        dispatch(getSingleCostingDetails(CostingId, res => {
          let responseData = res?.data?.Data
          setVendorCodeForSap(responseData.VendorCode)
          let conditionArr = []
          responseData.CostingPartDetails.CostingConditionResponse.forEach((item, index) => {
            let obj = {
              Lifnr: responseData.VendorCode,
              Matnr: responseData.PartNumber,
              Kschl: item.CostingConditionNumber,
              Datab: DayTime(responseData.EffectiveDate).format('YYYY-MM-DD'),
              Datbi: DayTime('9999-12-31').format('YYYY-MM-DD'),
              Kbetr: item.ConditionType === "Percentage" ? item?.Percentage : item.ConditionType === "Quantity" ? item.ConditionCostPerQuantity : item?.ConditionCost,
              Konwa: INR,
              Kpein: item?.ConditionQuantity ? String(item?.ConditionQuantity) : "1",
              Kmein: "NO",
            }
            conditionArr.push(obj)
          })

          setConditionInfo(conditionArr)
        }))
      }
    }),

    )
  }
  const handleRejectOrReturn = (type) => {
    setRejectDrawer(true);
    setApprovalType(type);
  };
  const closeDrawer = (e = '', type) => {
    if (type === 'submit') {
      setApproveDrawer(false)
      setRejectDrawer(false)
      setShowListing(true)
      setShowPushDrawer(false)
    } else {
      setApproveDrawer(false)
      setRejectDrawer(false)
      setShowListing(false)
      setShowPushDrawer(false)
      approvalSummaryHandler()
    }
  }

  const closeViewDrawer = (e = '') => {
    setViewButton(false)
  }

  const closePushButton = (e = '', type = {}) => {
    setPushButton(false)
    if (Object.keys(type).length > 0) {
      if (type === 'Push') {
        setShowListing(true)
        setShowPushDrawer(false)
      } else {
        setShowListing(false)
        setShowPushDrawer(false)
        approvalSummaryHandler()
      }
    }
  }
  const dataSend = [
    approvalDetails,
    partDetail
  ]

  const displayCompareCosting = () => {

    if (!isRFQ && uniqueShouldCostingId?.length === 0) {
      dispatch(getSingleCostingDetails(approvalData.CostingId, res => {
        const Data = res.data.Data
        const newObj = formViewData(Data, 'New Costing')
        let finalObj = []
        if (approvalData.LastCostingId !== EMPTY_GUID && approvalData.LastCostingId !== undefined && approvalData.LastCostingId !== null) {
          dispatch(getSingleCostingDetails(approvalData.LastCostingId, response => {
            const oldData = response.data.Data
            const oldObj = formViewData(oldData, 'Old Costing')
            finalObj = [oldObj[0], newObj[0]]
            dispatch(setCostingViewData(finalObj))
            setCostingSummary(!costingSummary)
          }))
        } else {

          dispatch(setCostingViewData(newObj))
          setCostingSummary(!costingSummary)
        }

      }))
    } else {
      setCostingSummary(!costingSummary)
    }

  }

  const onApproveButtonClick = () => {
    if (IsRegularizationLimit) {
      setShowPopup(true)
    } else {
      setApproveDrawer(true)
    }
  }

  const onPopupConfirm = () => {
    setShowPopup(false)
    setApproveDrawer(true)
  }

  const closePopUp = () => {
    setShowPopup(false)
  }

  if (showListing) {
    return <Redirect to="/approval-listing" />
  }

  const callPushAPI = debounce(() => {
    let obj = {
      "BaseCositngId": approvalData.CostingId,
      "LoggedInUserId": loggedInUserId(),
      "SimulationId": null,
      "BoughtOutPartId": null,
    }
    dispatch(approvalPushedOnSap(obj, (res) => {
      if (res?.data?.DataList && res?.data?.DataList[0]?.IsPushed === false) {
        Toaster.error(res?.data?.DataList[0]?.Message)
      } else if (res?.data?.Result) {
        Toaster.success('Approval pushed successfully.')
      }
      setShowListing(true)
    }))

  }, 500)

  const displayCompareCostingFgWise = (CostingApprovalProcessSummaryId) => {
    setFgWise(true)
    dispatch(getSingleCostingDetails(CostingApprovalProcessSummaryId, res => {
      const Data = res.data.Data
      const newObj = formViewData(Data)
      dispatch(setCostingViewData(newObj))
      setTimeout(() => {
        setCostingSummary(true)
      }, 500);
    }))
  }

  // WHEN FGWISE API IS PENDING THEN THIS CODE WILL MOUNT FOR DISABLED FGWISE ACCORDION
  const fgWiseAccDisable = (data) => {
    setAccDisable(data)
  }

  if (showListing) {
    return <Redirect to="/approval-listing" />
  }

  const pushTonfr = () => {
    if (approvalData.IsNFRPFS2PushedButtonShow && approvalData.NfrGroupIdForPFS2 === null && !IsRegularized) {

      let obj = {
        "CostingId": approvalData.CostingId,
        "NfrId": approvalData.NfrId,
        "LoggedInUserId": loggedInUser,
        "IsRegularized": IsRegularized
      }
      dispatch(updateCostingIdFromRfqToNfrPfs(obj, res => {
        let pushRequest = {
          nfrGroupId: res.data.Data.NfrGroupIdForPFS2,
          costingId: approvalData.CostingId
        }
        dispatch(pushNfrOnSap(pushRequest, res => {
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.NFR_PUSHED)
          }
        }))
      }))
    }
    else if (approvalData.IsNFRPFS2PushedButtonShow && approvalData.NfrGroupIdForPFS2 !== null && !IsRegularized) {

      let pushRequest = {
        nfrGroupId: approvalData.NfrGroupIdForPFS2,
        costingId: approvalData.CostingId
      }
      dispatch(pushNfrOnSap(pushRequest, res => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.NFR_PUSHED)
        }
      }))
    }
    if (approvalData.IsNFRPFS3PushedButtonShow && approvalData.NfrGroupIdForPFS3 === null && IsRegularized) {
      let obj = {
        "CostingId": approvalData.CostingId,
        "NfrId": approvalData.NfrId,
        "LoggedInUserId": loggedInUser,
        "IsRegularized": IsRegularized
      }
      dispatch(updateCostingIdFromRfqToNfrPfs(obj, res => {
        let pushRequest = {
          nfrGroupId: res.data.Data.NfrGroupIdForPFS3,
          costingId: approvalData.CostingId
        }
        dispatch(pushNfrOnSap(pushRequest, res => {
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.NFR_PUSHED)
          }
        }))
      }))
    }
    else if (approvalData.IsNFRPFS3PushedButtonShow && approvalData.NfrGroupIdForPFS3 !== null && IsRegularized) {

      let pushRequest = {
        nfrGroupId: approvalData.NfrGroupIdForPFS3,
        costingId: approvalData.CostingId
      }
      dispatch(pushNfrOnSap(pushRequest, res => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.NFR_PUSHED)
        }
      }))
    }
    setShowListing(true)
  }
  return (

    <>
      <CalculatorWrapper />
      {
        showListing === false &&
        <>
          {isLoader && <LoaderCustom />}
          {getConfigurationKey()?.IsSAPConfigured && approvalData?.CostingId && <ErrorMessage id={approvalData?.CostingId} CostingId={approvalData?.CostingId} />}
          <div className="container-fluid approval-summary-page">
            <h2 className="heading-main">Approval Summary</h2>
            <Row>
              <Col md="8">
                <div className="left-border">
                  {'Approval Workflow (Approval No. '}
                  {`${approvalData.ApprovalNumber ? approvalData.ApprovalNumber : '-'}):`}
                </div>
              </Col>
              <Col md="4" className="text-right">
                <div className="right-border">
                  <button type={'button'} className="apply mr5" onClick={() => setShowListing(true)}>
                    <div className={'back-icon'}></div>
                    {'Back '}
                  </button>
                  <button type={'button'} className="apply " onClick={() => setViewButton(true)}>
                    View All
                  </button>
                </div>
              </Col>
            </Row>
            {/* Code for approval workflow */}
            <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalData.ApprovalNumber} approverData={dataForFetchingAllApprover} />

            <Row>
              <Col md="12">
                <div className="left-border">{'Part Details:'}</div>
              </Col>
            </Row>
            <Row>
              <Col md="12" className="mb-2">
                <Table responsive className="table cr-brdr-main sub-table" size="sm">  {/* sub table class is alternative className which will use in future for added styles */}
                  <thead>
                    <tr>
                      <th>{technologyLabel}:</th>
                      <th>Part Type:</th>
                      <th>Assembly/Part No:</th>
                      <th>Assembly/Part Name:</th>
                      <th>Assembly/Part Description:</th>
                      <th>ECN No:</th>
                      <th>Drawing No:</th>
                      <th>Revision No:</th>
                      <th>Effective Date:</th>
                    </tr>
                  </thead>
                  <tbody>
                    <td>{partDetail.Technology ? partDetail.Technology : '-'}</td>
                    <td className='overflow'>
                      <span className="d-block " title={partDetail.PartType}>
                        {partDetail.PartType ? partDetail.PartType : '-'}
                      </span>
                    </td>
                    <td className='overflow'>
                      <span className="d-block " title={partDetail.PartNumber}>
                        {partDetail.PartNumber ? partDetail.PartNumber : '-'}
                      </span>
                    </td>
                    <td className='overflow'>
                      <span className="d-block" title={partDetail.PartName}>
                        {partDetail.PartName ? partDetail.PartName : '-'}
                      </span>
                    </td>
                    <td className='overflow-description'>
                      <span className="d-block" title={partDetail.Description}>
                        {partDetail.Description ? partDetail.Description : '-'}
                      </span>
                    </td>
                    <td>{partDetail.ECNNumber ? partDetail.ECNNumber : '-'}   </td>
                    <td>{partDetail.DrawingNumber ? partDetail.DrawingNumber : '-'}</td>
                    <td> {partDetail.RevisionNumber ? partDetail.RevisionNumber : '-'} </td>
                    <td> {partDetail.EffectiveDate ? DayTime(partDetail.EffectiveDate).format('DD/MM/YYYY') : '-'} </td>
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <div className="left-border">{'Approval Details:'}</div>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Table responsive className="table cr-brdr-main" size="sm">
                  <thead>
                    <tr>
                      <th>{`Costing Id:`}</th>
                      {approvalDetails.CostingTypeId === VBCTypeId && (
                        <th>{`ZBC/${vendorLabel} (Code):`}</th>
                      )}
                      {approvalDetails.CostingTypeId === CBCTypeId && reactLocalStorage.getObject('CostingTypePermission').cbc && (
                        <th>{`Customer (Code)`}</th>
                      )}
                      {
                        checkVendorPlantConfigurable() &&
                        <th>
                          {approvalDetails.CostingTypeId === VBCTypeId ? `${vendorLabel} Plant` : 'Plant'}{` Code:`}
                        </th>
                      }
                      {(getConfigurationKey() !== undefined && getConfigurationKey()?.IsDestinationPlantConfigure && (approvalDetails.CostingTypeId === VBCTypeId || approvalDetails.CostingTypeId === NCCTypeId)) && <th>{`Plant (Code):`}</th>}

                      {(approvalDetails.CostingTypeId === ZBCTypeId || approvalDetails.CostingTypeId === CBCTypeId) && <th>  {`Plant (Code):`} </th>}

                      <th>{`SOB (%):`}</th>
                      {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <th>{`Basic Price:`}</th>}
                      {/* <th>{`ECN Ref No`}</th> */}
                      <th>{`Existing Price:`}</th>
                      <th>{`Revised Price:`}</th>
                      <th>{`Variance (w.r.t. Existing):`}</th>
                      {approvalDetails.CostingTypeId !== NCCTypeId && <th>{`Consumption Quantity:`}</th>}
                      {approvalDetails.CostingTypeId !== NCCTypeId && <th>{`Remaining Quantity:`}</th>}
                      {approvalDetails.CostingTypeId === NCCTypeId && (
                        <th>{`Quantity:`}</th>
                      )}
                      {approvalDetails.CostingTypeId === NCCTypeId && (
                        <th>{`Is Regularized:`}</th>
                      )}
                      <th>{`Effective Date:`}</th>
                      {approvalDetails.CostingTypeId !== NCCTypeId && <th>{`Annual Impact:`}</th>}
                      {approvalDetails.CostingTypeId !== NCCTypeId && <th>{`Impact of The Year:`}</th>}

                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {approvalDetails.CostingId ? approvalDetails.CostingNumber : '-'}
                      </td>
                      {/* <td> */}
                      {approvalDetails.CostingTypeId === VBCTypeId && <td> {(approvalDetails.VendorName) ? `${approvalDetails.VendorName}` : '-'}</td>}
                      {approvalDetails.CostingTypeId === CBCTypeId && <td> {(approvalDetails.Customer) ? `${approvalDetails.Customer}` : '-'}</td>}
                      {/* </td> */}
                      {
                        checkVendorPlantConfigurable() &&
                        <td>
                          {
                            approvalDetails.CostingTypeId === VBCTypeId ? (approvalDetails.VendorPlantCode ? approvalDetails.VendorPlantCode : '-') : approvalDetails.PlantCode ? approvalDetails.PlantCode : '-'
                          }

                        </td>
                      }
                      {/* {
                        ((getConfigurationKey() !== undefined && getConfigurationKey()?.IsDestinationPlantConfigure && approvalDetails.CostingTypeId === VBCTypeId)) &&
                        <td>
                          {(approvalDetails.DestinationPlantName || approvalDetails.DestinationPlantCode)}? `${approvalDetails.DestinationPlantName}(${approvalDetails.DestinationPlantCode})`:'-'
                        </td>
                      } */}
                      {(approvalDetails.CostingTypeId === CBCTypeId || approvalDetails.CostingTypeId === NCCTypeId || approvalDetails.CostingTypeId === VBCTypeId) && <td> {(approvalDetails.DestinationPlantName) ? `${approvalDetails.DestinationPlantName}` : '-'}</td>}
                      {approvalDetails.CostingTypeId === ZBCTypeId && <td> {(approvalDetails.PlantName) ? `${approvalDetails.PlantName}` : '-'}</td>}
                      <td>
                        {approvalDetails.ShareOfBusiness !== null ? approvalDetails.ShareOfBusiness : '-'}
                      </td>
                      {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <td>
                        {approvalDetails.BasicRate ? checkForDecimalAndNull(approvalDetails.BasicRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>}
                      {/* <td>
                          {approvalDetails.ECNNumber !== null ? approvalDetails.ECNNumber : '-'}
                        </td> */}
                      <td>
                        {approvalDetails.OldPOPrice !== null ? checkForDecimalAndNull(approvalDetails.OldPOPrice, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      <td>
                        {approvalDetails.NewPOPrice !== null ? checkForDecimalAndNull(approvalDetails.NewPOPrice, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      <td>
                        {approvalDetails.Variance !== null ? checkForDecimalAndNull(approvalDetails.Variance, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      {approvalDetails.CostingTypeId !== NCCTypeId && <td>
                        {approvalDetails.ConsumptionQuantity !== null ? approvalDetails.ConsumptionQuantity : '-'}
                      </td>}
                      {approvalDetails.CostingTypeId !== NCCTypeId && <td>
                        {approvalDetails.RemainingQuantity !== null ? approvalDetails.RemainingQuantity : '-'}
                      </td>}

                      {approvalDetails.CostingTypeId === NCCTypeId &&
                        <td>
                          {nccPartQuantity !== null ? nccPartQuantity : '-'}
                        </td>
                      }
                      {approvalDetails.CostingTypeId === NCCTypeId &&
                        <td>
                          {IsRegularized !== null ? (IsRegularized ? "Yes" : "No") : '-'}
                        </td>
                      }

                      <td>
                        {approvalDetails.EffectiveDate !== null ? DayTime(approvalDetails.EffectiveDate).format('DD/MM/YYYY') : '-'}
                      </td>
                      {approvalDetails.CostingTypeId !== NCCTypeId && <td>
                        {approvalDetails.AnnualImpact !== null ? checkForDecimalAndNull(approvalDetails.AnnualImpact, getConfigurationKey()?.NoOfDecimalForPrice) : '-'}
                      </td>}
                      {approvalDetails.CostingTypeId !== NCCTypeId && <td>
                        {approvalDetails.ImpactOfTheYear !== null ? checkForDecimalAndNull(approvalDetails.ImpactOfTheYear, getConfigurationKey()?.NoOfDecimalForPrice) : '-'}
                      </td>}
                    </tr>

                    {/* {Object.keys(approvalDetails).length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={CONSTANT.EMPTY_DATA} />
                  </td>
                </tr>
              )} */}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="14">
                        <span className="grey-text">Reason: </span>
                        {approvalDetails.Reason ? approvalDetails.Reason : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="14">
                        <span className="grey-text">Remarks: </span>
                        {approvalDetails.Remark ? approvalDetails.Remark : ' -'}{' '}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </Col>
            </Row>
            {/* THIS SHOULD BE COMMENTED IN MINDA */}
            <Row className="mb-3">
              <Col md="6"> <div className="left-border">{'FG wise Impact:'}</div></Col>
              <Col md="6">
                <div className={'right-details'}>
                  <button className="btn btn-small-primary-circle ml-1 float-right" type="button" disabled={accDisable} onClick={() => { setFgWiseAcc(!fgWiseAcc) }}>
                    {fgWiseAcc ? (
                      <i className="fa fa-minus"></i>
                    ) : (
                      <i className="fa fa-plus"></i>
                    )}
                  </button>
                </div>
              </Col >
            </Row >

            {fgWiseAcc && <Row className="mb-3">
              <Col md="12">
                <Fgwiseimactdata
                  headerName={headerName}
                  parentField={parentField}
                  childField={childField}
                  impactType={'FgWise'}
                  approvalSummaryTrue={true}
                  costingId={approvalData.CostingId}
                  DisplayCompareCostingFgWise={displayCompareCostingFgWise}
                  costingIdArray={costingIdArray}
                  isVerifyImpactDrawer={false}
                  fgWiseAccDisable={fgWiseAccDisable}
                  tooltipEffectiveDate={partDetail.EffectiveDate ? DayTime(partDetail.EffectiveDate).format('DD/MM/YYYY') : '-'}
                  isCosting={true}
                />
              </Col>
            </Row>}
            {/* HIDE FOR @MIL START*/}
            {/* {approvalDetails.CostingTypeId === VBCTypeId && <>
              <Row className="mb-3">
                <Col md="6"><div className="left-border">{'Last Revision Data:'}</div></Col>
                <Col md="6">
                  <div className={'right-details'}>
                    <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setLastRevisionDataAcc(!lastRevisionDataAcc) }}>
                      {lastRevisionDataAcc ? (
                        <i className="fa fa-minus"></i>
                      ) : (

                        <i className="fa fa-plus"></i>

                      )}
                    </button>
                  </div>
                </Col>
                <div className="accordian-content w-100 px-3 impacted-min-height">
                  {lastRevisionDataAcc && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={masterIdForLastRevision} viewCostingAndPartNo={false} lastRevision={true} />}
                  <div align="center">
                    {editWarning && <NoContentFound title={"There is no data for the Last Revision."} />}
                  </div>
                </div>
              </Row>
            </>} */}
            {/* HIDE FOR @MIL END*/}
            <Row>
              <Col md="10">
                <div className="left-border">{'Costing Summary:'}</div>
              </Col>
              <Col md="2" className="text-right">
                <div className="right-border">
                  <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => displayCompareCosting()}>
                    {costingSummary ? (
                      <i className="fa fa-minus"></i>
                    ) : (
                      <i className="fa fa-plus"></i>
                    )}
                  </button>
                </div>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md="12" className="costing-summary-row">
                {/* SEND isApproval FALSE WHEN OPENING FROM FGWISE */}

                {costingSummary && <CostingSummaryTable VendorId={approvalData.VendorId} viewMode={true} costingID={approvalDetails.CostingId} approvalMode={true} isApproval={(approvalData.LastCostingId === EMPTY_GUID || fgWise) ? false : true} simulationMode={false} costingIdExist={true} uniqueShouldCostingId={uniqueShouldCostingId} isRfqCosting={isRFQ} costingIdList={costingIdList} notSelectedCostingId={notSelectedCostingId} selectedTechnology={partDetail.Technology} />}

              </Col>
            </Row>
            {/* Costing Summary page here */}
          </div >

          {
            !isApprovalDone &&
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right bluefooter-butn">
                <Fragment>
                  {isRFQCostingApproval &&
                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => handleRejectOrReturn('Return')} >
                      <div className={'cancel-icon-white mr5'}></div>
                      {'Return'}
                    </button>
                  }
                  <button type={'button'} className="mr5 approve-reject-btn" onClick={() => handleRejectOrReturn('Reject')} >
                    <div className={'cancel-icon-white mr5'}></div>
                    {'Reject'}
                  </button>
                  <button
                    type="button"
                    className="approve-button mr5 approve-hover-btn"
                    // onClick={() => setApproveDrawer(true)}
                    onClick={() => onApproveButtonClick()}
                  >
                    <div className={'save-icon'}></div>
                    {'Approve'}
                  </button>
                </Fragment >

              </div >
            </Row >
          }
          {/* MINDA */}
          {initialConfiguration?.IsSAPConfigured &&
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right bluefooter-butn">
                <Fragment>
                  {
                    showPushButton &&
                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => callPushAPI(INR)}>
                      <div className={"save-icon"}></div>
                      {"Repush"}
                    </button>
                  }
                  {approvalData.IsNFRPFS2PushedButtonShow && !IsRegularized &&
                    <button type={'button'} className="submit-button mr5 save-btn" onClick={pushTonfr} >
                      {'Push To Nfr for PFS2'}
                    </button>
                  }
                  {approvalData.IsNFRPFS3PushedButtonShow && IsRegularized &&
                    <button type={'button'} className="submit-button mr5 save-btn" onClick={pushTonfr} >
                      {'Push To Nfr for PFS3'}
                    </button>
                  }
                </Fragment>
              </div>
            </Row>
          }




          {
            showPopup && <PopupMsgWrapper className={'main-modal-container'} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Quantity for this costing lies between regularization limit & maximum deviation limit. Do you wish to continue?`} />
          }


        </>
      }
      {
        approveDrawer && (
          <CostingApproveReject
            type={'Approve'}
            isOpen={approveDrawer}
            closeDrawer={closeDrawer}
            // tokenNo={approvalNumber}
            approvalData={[approvalData]}
            anchor={'right'}
            reasonId={approvalDetails.ReasonId}
            IsNotFinalLevel={!showFinalLevelButtons}
            IsPushDrawer={showPushDrawer}
            dataSend={[approvalDetails, partDetail]}
            showFinalLevelButtons={showFinalLevelButtons}
            costingTypeId={costingTypeId}
            approvalTypeId={approvalTypeId}
            TechnologyId={approvalData?.TechnologyId}
            conditionInfo={conditionInfo}
            vendorCodeForSAP={vendorCodeForSap}
            releaseStrategyDetails={releaseStrategyDetails}
            IsRegularized={IsRegularized}
            isShowNFRPopUp={!IsRegularized && approvalData.NfrId && showFinalLevelButtons ? true : false}
            showApprovalTypeDropdown={false}
          />
        )
      }
      {
        rejectDrawer && (
          <CostingApproveReject
            type={approvalType}
            isOpen={rejectDrawer}
            approvalData={[approvalData]}
            closeDrawer={closeDrawer}
            //  tokenNo={approvalNumber}
            anchor={'right'}
            IsNotFinalLevel={!showFinalLevelButtons}
            reasonId={approvalDetails.ReasonId}
            IsPushDrawer={showPushDrawer}
            dataSend={[approvalDetails, partDetail]}
            costingTypeId={costingTypeId}
            conditionInfo={conditionInfo}
            vendorCodeForSAP={vendorCodeForSap}
          />
        )
      }
      {
        pushButton && (
          <PushButtonDrawer
            isOpen={pushButton}
            closeDrawer={closePushButton}
            dataSend={[approvalDetails, partDetail]}
            anchor={'right'}
            approvalData={[approvalData]}
            conditionInfo={conditionInfo}
            vendorCodeForSAP={vendorCodeForSap}
          />
        )
      }

      {
        viewButton && (
          <ViewDrawer
            approvalLevelStep={approvalLevelStep}
            isOpen={viewButton}
            closeDrawer={closeViewDrawer}
            anchor={'top'}
            approvalNo={approvalData.ApprovalNumber}
          />
        )
      }
    </>
  )
}

export default ApprovalSummary
