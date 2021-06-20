import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Row, Col, Table } from 'reactstrap'
import { checkVendorPlantConfigurable, formViewData, loggedInUserId } from '../../../../helper'
import { getApprovalSummary } from '../../actions/Approval'
import { setCostingViewData, storePartNumber } from '../../actions/Costing'
import ApprovalWorkFlow from './ApprovalWorkFlow'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import CostingSummaryTable from '../CostingSummaryTable'
import moment from 'moment'
import { Fragment } from 'react'
import ApprovalListing from './ApprovalListing'
import ViewDrawer from './ViewDrawer'
import PushButtonDrawer from './PushButtonDrawer'

function ApprovalSummary(props) {
  const { approvalNumber, approvalProcessId } = props
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
  const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
  const [showPushDrawer, setShowPushDrawer] = useState(false)
  const [viewButton, setViewButton] = useState(false)
  const [pushButton, setPushButton] = useState(false)


  useEffect(() => {
    approvalSummaryHandler()
  }, [])

  const approvalSummaryHandler = () => {
    dispatch(getApprovalSummary(approvalNumber, approvalProcessId, loggedInUser, (res) => {

      const { PartDetails, ApprovalDetails, ApprovalLevelStep, DepartmentId, Technology, ApprovalProcessId,
        ApprovalProcessSummaryId, ApprovalNumber, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow,
        CostingId, PartId } = res?.data?.Data?.Costings[0];

      const technologyId = res?.data?.Data?.Costings[0].PartDetails.TechnologyId
      const partNumber = PartDetails.PartNumber

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
        ReasonId: ApprovalDetails[0].ReasonId
      })
    }),
    )
  }

  const handleApproveAndPushButton = () => {
    setShowPushDrawer(true)
    setApproveDrawer(true)
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

  return (

    <>
      {
        showListing === false ?
          <>
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
                      <div className={'check-icon'}><img src={require('../../../../assests/images/back.png')} alt='check-icon.jpg' /> </div>
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
                  <Table responsive className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>
                          <span className="d-block grey-text">{`Technology:`}</span>
                          <span className="d-block">
                            {partDetail.Technology ? partDetail.Technology : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Assembly No./Part No.`}</span>
                          <span className="d-block">
                            {partDetail.PartNumber ? partDetail.PartNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Assembly Name/Part Name`}</span>
                          <span className="d-block">
                            {partDetail.PartName ? partDetail.PartName : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Assembly Description/Part Description`}</span>
                          <span className="d-block">
                            {partDetail.Description ? partDetail.Description : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`ECN No:`}</span>
                          <span className="d-block">
                            {partDetail.ECNNumber ? partDetail.ECNNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Drawing No:`}</span>
                          <span className="d-block">
                            {partDetail.DrawingNumber ? partDetail.DrawingNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Revision No:`}</span>
                          <span className="d-block">
                            {partDetail.RevisionNumber
                              ? partDetail.RevisionNumber
                              : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text">{`Effective Date:`}</span>
                          <span className="d-block">
                            {partDetail.EffectiveDate ? moment(partDetail.EffectiveDate).format('DD/MM/YYYY') : '-'}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {Object.keys(partDetail).length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={CONSTANT.EMPTY_DATA} />
                  </td>
                </tr>
              )} */}
                      {/* {costingProcessCost && costingProcessCost.length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={CONSTANT.EMPTY_DATA} />
                  </td>
                </tr>
              )} */}
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
                        <th>{`Costing ID`}</th>
                        {approvalDetails.TypeOfCosting === 'VBC' && (
                          <th>{`ZBC/Vendor Name`}</th>
                        )}
                        {
                          checkVendorPlantConfigurable() &&
                          <th>
                            {approvalDetails.TypeOfCosting === 'VBC' ? 'Vendor Plant' : 'Plant'}{` Code`}
                          </th>
                        }
                        <th>{`SOB`}</th>
                        {/* <th>{`ECN Ref No`}</th> */}
                        <th>{`Old/Current Price`}</th>
                        <th>{`New/Revised Price:`}</th>
                        <th>{`Variance`}</th>
                        <th>{`Consumption Quantity`}</th>
                        <th>{`Remaining Quantity`}</th>
                        <th>{`Annual Impact`}</th>
                        <th>{`Impact of The Year`}</th>
                        <th>{`Effective Date`}</th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {approvalDetails.CostingId ? approvalDetails.CostingNumber : '-'}
                        </td>
                        {/* <td> */}
                        {approvalDetails.TypeOfCosting === 'VBC' && <td> {approvalDetails.VendorName ? approvalDetails.VendorName : '-'}</td>}
                        {/* </td> */}
                        {
                          checkVendorPlantConfigurable() &&
                          <td>
                            {
                              approvalDetails.TypeOfCosting === 'VBC' ? (approvalDetails.VendorPlantCode ? approvalDetails.VendorPlantCode : '-') : approvalDetails.PlantCode ? approvalDetails.PlantCode : '-'
                            }
                          </td>
                        }
                        <td>
                          {approvalDetails.ShareOfBusiness !== null ? approvalDetails.ShareOfBusiness : '-'}
                        </td>
                        {/* <td>
                          {approvalDetails.ECNNumber !== null ? approvalDetails.ECNNumber : '-'}
                        </td> */}
                        <td>
                          {approvalDetails.OldPOPrice !== null ? approvalDetails.OldPOPrice : '-'}
                        </td>
                        <td>
                          {approvalDetails.NewPOPrice !== null ? approvalDetails.NewPOPrice : '-'}
                        </td>
                        <td>
                          {approvalDetails.Variance !== null ? approvalDetails.Variance : '-'}
                        </td>
                        <td>
                          {approvalDetails.ConsumptionQuantity !== null ? approvalDetails.ConsumptionQuantity : '-'}
                        </td>
                        <td>
                          {approvalDetails.RemainingQuantity !== null ? approvalDetails.RemainingQuantity : '-'}
                        </td>
                        <td>
                          {approvalDetails.AnnualImpact !== null ? approvalDetails.AnnualImpact : '-'}
                        </td>
                        <td>
                          {approvalDetails.ImpactOfTheYear !== null ? approvalDetails.ImpactOfTheYear : '-'}
                        </td>
                        <td>
                          {approvalDetails.EffectiveDate !== null ? moment(approvalDetails.EffectiveDate).format('DD/MM/YYYY') : '-'}
                        </td>
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
                        <td colSpan="12">
                          <span className="grey-text">Reason:</span>
                          {approvalDetails.Reason ? approvalDetails.Reason : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="12">
                          <span className="grey-text">Remark:</span>
                          {approvalDetails.Remark ? approvalDetails.Remark : '-'}{' '}
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </Col>
              </Row>

              <Row>
                <Col md="10">
                  <div className="left-border">{'Costing Summary:'}</div>
                </Col>
                <Col md="2" className="text-right">
                  <div className="right-border">
                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setCostingSummary(!costingSummary) }}>
                      {costingSummary ? (
                        <i
                          // onClick={() => {
                          //   setCostingSummary(false)
                          // }}
                          className="fa fa-minus"
                        ></i>
                      ) : (
                        <i
                          // onClick={() => {
                          //   setCostingSummary(true)
                          // }}
                          className="fa fa-plus"
                        ></i>
                      )}
                    </button>
                  </div>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md="12" className="costing-summary-row">
                  {costingSummary && <CostingSummaryTable viewMode={true} costingID={approvalDetails.CostingId} />}
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
                      <div className={'cross-icon'}>
                        <img src={require('../../../../assests/images/times.png')} alt="cancel-icon.jpg" />
                      </div>{' '}
                      {'Reject'}
                    </button>
                    <button
                      type="button"
                      className="approve-button mr5 approve-hover-btn"
                      onClick={() => setApproveDrawer(true)}
                    >
                      <div className={'check-icon'}>
                        <img
                          src={require('../../../../assests/images/check.png')}
                          alt="check-icon.jpg"
                        />{' '}
                      </div>
                      {'Approve'}
                    </button>
                    {
                      showFinalLevelButtons &&
                      <button
                        type="button" className="mr5 user-btn" onClick={() => handleApproveAndPushButton()}                    >
                        <div className={'check-icon'}>
                          <img
                            src={require('../../../../assests/images/check.png')}
                            alt="check-icon.jpg"
                          />{' '}
                        </div>
                        {'Approve & Push'}
                      </button>
                    }
                  </Fragment>

                </div>
              </Row>
            }
            {
              showPushButton &&
              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <Fragment>
                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => setPushButton(true)}>
                      <div className={"check-icon"}>
                        <img
                          src={require("../../../../assests/images/check.png")}
                          alt="check-icon.jpg"
                        />
                      </div>{" "}
                      {"Push"}
                    </button>
                  </Fragment>
                </div>
              </Row>
            }
          </> :
          <ApprovalListing />
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
          IsFinalLevel={!showFinalLevelButtons}
          IsPushDrawer={showPushDrawer}
          dataSend={[approvalDetails, partDetail]}
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
