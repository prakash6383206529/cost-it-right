import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Table } from 'reactstrap'
import { checkForDecimalAndNull, checkVendorPlantConfigurable, formViewData, getConfigurationKey, loggedInUserId, getPOPriceAfterDecimal } from '../../../../helper'
import { approvalPushedOnSap, getApprovalSummary } from '../../actions/Approval'
import { checkFinalUser, getSingleCostingDetails, setCostingViewData, storePartNumber } from '../../actions/Costing'
import ApprovalWorkFlow from './ApprovalWorkFlow'
import ApproveRejectDrawer from './ApproveRejectDrawer'
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
import { Impactedmasterdata } from '../../../simulation/components/ImpactedMasterData'
import NoContentFound from '../../../common/NoContentFound'
import { getLastSimulationData } from '../../../simulation/actions/Simulation'
import Toaster from '../../../common/Toaster'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'

function ApprovalSummary(props) {
  const { approvalNumber, approvalProcessId } = props.location.state
  const loggedInUser = loggedInUserId()

  const dispatch = useDispatch()

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
  const [finalLevelUser, setFinalLevelUser] = useState(false)
  const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
  const [masterIdForLastRevision, setMasterIdForLastRevision] = useState('')
  const [IsRegularizationLimit, setIsRegularizationLimit] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [costingHead, setCostingHead] = useState("")
  const [nccPartQuantity, setNccPartQuantity] = useState("")
  const [IsRegularized, setIsRegularized] = useState("")
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  const headerName = ['Revision No.', 'Name', 'Old Cost/Pc', 'New Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
  const parentField = ['PartNumber', '-', 'PartName', '-', '-', '-', 'VariancePerPiece', 'VolumePerYear', 'ImpactPerQuarter', 'ImpactPerYear']
  const childField = ['PartNumber', 'ECNNumber', 'PartName', 'OldCost', 'NewCost', 'Quantity', 'VariancePerPiece', '-', '-', '-']
  useEffect(() => {
    approvalSummaryHandler()
  }, [])

  useEffect(() => {

    if (Object.keys(approvalData).length > 0 && (approvalDetails.CostingTypeId === VBCTypeId || approvalDetails.CostingTypeId === NCCTypeId)) {
      dispatch(getLastSimulationData(approvalData.VendorId, approvalData.EffectiveDate, res => {
        const structureOfData = {
          ExchangeRateImpactedMasterDataList: [],
          OperationImpactedMasterDataList: [],
          RawMaterialImpactedMasterDataList: [],
          BoughtOutPartImpactedMasterDataList: [],
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

      const { PartDetails, ApprovalDetails, ApprovalLevelStep, DepartmentId, Technology, ApprovalProcessId,
        ApprovalProcessSummaryId, ApprovalNumber, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow,
        CostingId, PartId, LastCostingId, PurchasingGroup, MaterialGroup, DecimalOption, VendorId, IsRegularizationLimitCrossed, CostingHead, NCCPartQuantity, IsRegularized } = res?.data?.Data?.Costings[0];


      setNccPartQuantity(NCCPartQuantity)
      setIsRegularized(IsRegularized)
      setCostingHead(CostingHead)
      const technologyId = res?.data?.Data?.Costings[0].PartDetails.TechnologyId
      setIsRegularizationLimit(IsRegularizationLimitCrossed ? IsRegularizationLimitCrossed : false)
      setIsLoader(false)
      dispatch(storePartNumber({ partId: PartId }))
      setPartDetail(PartDetails)
      setApprovalDetails(ApprovalDetails[0])
      setApprovalLevelStep(ApprovalLevelStep)
      setIsApprovalDone(IsSent)
      setShowFinalLevelButton(IsFinalLevelButtonShow)
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
        PurchasingGroup: PurchasingGroup,
        MaterialGroup: MaterialGroup,
        DecimalOption: DecimalOption,
        LastCostingId: LastCostingId,
        EffectiveDate: ApprovalDetails[0].EffectiveDate,
        VendorId: VendorId
      })

      let obj = {
        DepartmentId: DepartmentId,
        UserId: loggedInUserId(),
        TechnologyId: technologyId,
        Mode: 'costing'
      }
      dispatch(checkFinalUser(obj, res => {
        if (res && res.data && res.data.Result) {
          setFinalLevelUser(res.data.Data.IsFinalApprover)
        }
      }))
    }),

    )
  }

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

    dispatch(getSingleCostingDetails(approvalData.CostingId, res => {
      const Data = res.data.Data
      const newObj = formViewData(Data, 'New Costing')
      let finalObj = []
      if (approvalData.LastCostingId !== EMPTY_GUID) {
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
    const { netPo, quantity } = getPOPriceAfterDecimal(approvalData?.DecimalOption, dataSend.NewPOPrice ? dataSend.NewPOPrice : 0)
    let pushdata = {
      effectiveDate: dataSend[0].EffectiveDate ? DayTime(dataSend[0].EffectiveDate).format('MM/DD/YYYY') : '',
      vendorCode: dataSend[0].VendorCode ? dataSend[0].VendorCode : '',
      materialNumber: dataSend[1].PartNumber,
      netPrice: dataSend[0].NewPOPrice,
      plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
      currencyKey: dataSend[0].Currency ? dataSend[0].Currency : INR,
      materialGroup: '',
      taxCode: 'YW',
      basicUOM: "NO",
      purchasingGroup: '',
      purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '',
      CostingId: approvalData.CostingId,
      Quantity: quantity,
      DecimalOption: approvalData.DecimalOption
      // effectiveDate: '11/30/2021',
      // vendorCode: '203670',
      // materialNumber: 'S07004-003A0Y',
      // materialGroup: 'M089',
      // taxCode: 'YW',
      // plant: '1401',
      // netPrice: '30.00',
      // currencyKey: 'INR',
      // basicUOM: 'NO',
      // purchasingOrg: 'MRPL',
      // purchasingGroup: 'O02'

    }
    let obj = {
      LoggedInUserId: loggedInUserId(),
      Request: [pushdata]
    }
    dispatch(approvalPushedOnSap(obj, res => {
      if (res && res.status && (res.status === 200 || res.status === 204)) {
        Toaster.success('Approval pushed successfully.')
      }
    }))
    setShowListing(true)

  }, 500)

  return (

    <>
      <CalculatorWrapper />
      {
        showListing === false &&
        <>
          {isLoader && <LoaderCustom />}
          {/* <ErrorMessage approvalNumber={approvalNumber} /> */}
          <div className="container-fluid approval-summary-page">
            <h2 className="heading-main">Approval Summary</h2>
            <Row>
              <Col md="8">
                <div className="left-border">
                  {'Approval Workflow (Approval No. '}
                  {`${approvalData.ApprovalNumber ? approvalData.ApprovalNumber : '-'}) :`}
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
            <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalData.ApprovalNumber} />

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
                      <th>Technology:</th>
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
                      <th>{`Costing ID:`}</th>
                      {approvalDetails.CostingTypeId === VBCTypeId && (
                        <th>{`ZBC/Vendor Name:`}</th>
                      )}
                      {approvalDetails.CostingTypeId === CBCTypeId && (
                        <th>{`Customer (Code)`}</th>
                      )}
                      {
                        checkVendorPlantConfigurable() &&
                        <th>
                          {approvalDetails.CostingTypeId === VBCTypeId ? 'Vendor Plant' : 'Plant'}{` Code:`}
                        </th>
                      }
                      {(getConfigurationKey() !== undefined && getConfigurationKey()?.IsDestinationPlantConfigure && (approvalDetails.CostingTypeId === VBCTypeId || approvalDetails.CostingTypeId === NCCTypeId)) && <th>{`Plant(Code):`}</th>}

                      {(approvalDetails.CostingTypeId === ZBCTypeId || approvalDetails.CostingTypeId === CBCTypeId) && <th>  {`Plant(Code):`} </th>}

                      <th>{`SOB(%):`}</th>
                      {/* <th>{`ECN Ref No`}</th> */}
                      <th>{`Old/Current Price:`}</th>
                      <th>{`New/Revised Price:`}</th>
                      <th>{`Variance:`}</th>
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
                      {approvalDetails.CostingTypeId === VBCTypeId && <td> {(approvalDetails.VendorName || approvalDetails.VendorCode) ? `${approvalDetails.VendorName}(${approvalDetails.VendorCode})` : '-'}</td>}
                      {approvalDetails.CostingTypeId === CBCTypeId && <td> {(approvalDetails.CustomerName || approvalDetails.CustomerCode) ? `${approvalDetails.CustomerName}(${approvalDetails.CustomerCode})` : '-'}</td>}
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
                      {(approvalDetails.CostingTypeId === CBCTypeId || approvalDetails.CostingTypeId === NCCTypeId || approvalDetails.CostingTypeId === VBCTypeId) && <td> {(approvalDetails.DestinationPlantName || approvalDetails.DestinationPlantCode) ? `${approvalDetails.DestinationPlantName}(${approvalDetails.DestinationPlantCode})` : '-'}</td>}
                      {approvalDetails.CostingTypeId === ZBCTypeId && <td> {(approvalDetails.PlantName || approvalDetails.PlantCode) ? `${approvalDetails.PlantName}(${approvalDetails.PlantCode})` : '-'}</td>}
                      <td>
                        {approvalDetails.ShareOfBusiness !== null ? approvalDetails.ShareOfBusiness : '-'}
                      </td>
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
                        {approvalDetails.AnnualImpact !== null ? checkForDecimalAndNull(approvalDetails.AnnualImpact, getConfigurationKey.NoOfDecimalForPrice) : '-'}
                      </td>}
                      {console.log('approvalDetails: ', approvalDetails)}
                      {approvalDetails.CostingTypeId !== NCCTypeId && <td>
                        {approvalDetails.ImpactOfTheYear !== null ? checkForDecimalAndNull(approvalDetails.ImpactOfTheYear, getConfigurationKey.NoOfDecimalForPrice) : '-'}
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
            {/* 
            <Row className="mb-3">
              <Col md="6"> <div className="left-border">{'FG wise Impact:'}</div></Col>
              <Col md="6">
                <div className={'right-details'}>
                  <button className="btn btn-small-primary-circle ml-1 float-right" type="button" onClick={() => { setFgWiseAcc(!fgWiseAcc) }}>
                    {fgWiseAcc ? (
                      <i className="fa fa-minus"></i>
                    ) : (
                      <i className="fa fa-plus"></i>
                    )}
                  </button>
                </div>
              </Col>
            </Row>
           
           {fgWiseAcc && <Row className="mb-3">
              <Col md="12">
                <Fgwiseimactdata
                  headerName={headerName}
                  parentField={parentField}
                  childField={childField}
                  impactType={'FgWise'}
                  approvalSummaryTrue={true}
                />
              </Col>
            </Row> */}

            {approvalDetails.CostingTypeId === VBCTypeId && <>
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
                  {/* {costingDrawer && lastRevisionDataAcc && <div align="center">
                    <NoContentFound title={"There is no data for the Last Revision."} />
                  </div>} */}
                </div>
              </Row>
            </>}
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
                {costingSummary && <CostingSummaryTable viewMode={true} costingID={approvalDetails.CostingId} approvalMode={true} isApproval={approvalData.LastCostingId !== EMPTY_GUID ? true : false} simulationMode={false} />}
              </Col>
            </Row>
            {/* Costing Summary page here */}
          </div>

          {
            !isApprovalDone &&
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right bluefooter-butn">
                <Fragment>
                  <button type={'button'} className="mr5 approve-reject-btn" onClick={() => setRejectDrawer(true)} >
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
                </Fragment>

              </div>
            </Row>
          }
          {
            showPushButton &&
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right bluefooter-butn">
                <Fragment>
                  <button type="submit" className="submit-button mr5 save-btn" onClick={() => callPushAPI()}>
                    <div className={"save-icon"}></div>
                    {"Repush"}
                  </button>
                </Fragment>
              </div>
            </Row>
          }


          {
            showPopup && <PopupMsgWrapper className={'main-modal-container'} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Quantity for this costing lies between regularization limit & maximum deviation limit. Do you wish to continue?`} />
          }


        </>
      }

      {approveDrawer && (
        <ApproveRejectDrawer
          type={'Approve'}
          isOpen={approveDrawer}
          closeDrawer={closeDrawer}
          // tokenNo={approvalNumber}
          approvalData={[approvalData]}
          anchor={'right'}
          reasonId={approvalDetails.ReasonId}
          IsFinalLevel={!finalLevelUser}
          IsPushDrawer={showPushDrawer}
          dataSend={[approvalDetails, partDetail]}
          showFinalLevelButtons={showFinalLevelButtons}
        />
      )}
      {rejectDrawer && (
        <ApproveRejectDrawer
          type={'Reject'}
          isOpen={rejectDrawer}
          approvalData={[approvalData]}
          closeDrawer={closeDrawer}
          //  tokenNo={approvalNumber}
          anchor={'right'}
          IsFinalLevel={!showFinalLevelButtons}
          reasonId={approvalDetails.ReasonId}
          IsPushDrawer={showPushDrawer}
          dataSend={[approvalDetails, partDetail]}
        />
      )}
      {pushButton && (
        <PushButtonDrawer
          isOpen={pushButton}
          closeDrawer={closePushButton}
          dataSend={[approvalDetails, partDetail]}
          anchor={'right'}
          approvalData={[approvalData]}
        />
      )}

      {viewButton && (
        <ViewDrawer
          approvalLevelStep={approvalLevelStep}
          isOpen={viewButton}
          closeDrawer={closeViewDrawer}
          anchor={'top'}
          approvalNo={approvalData.ApprovalNumber}
        />
      )}
    </>
  )
}

export default ApprovalSummary
