import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Container, Row, Col, Table } from 'reactstrap'
import { formViewData, loggedInUserId } from '../../../../helper'
import { CONSTANT } from '../../../../helper/AllConastant'
import NoContentFound from '../../../common/NoContentFound'
import { getApprovalSummary } from '../../actions/Approval'
import { setCostingViewData } from '../../actions/Costing'
import ApprovalWorkFlow from './ApprovalWorkFlow'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import CostingSummaryTable from '../CostingSummaryTable'
import moment from 'moment'
import { Fragment } from 'react'
import ApprovalListing from './ApprovalListing'
function ApprovalSummary(props) {
  // const approvalNumber = props.approvalNumber 
  // const approvalProcessId = props.approvalProcessId 
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
  /**NEED TO REMOVE THIS 2 VARIABLE**/
  const [showButton, setShowButton] = useState(true)
  const [isFinalApproval, setIsFinalApproval] = useState(false)

  const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
  const [showListing, setShowListing] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval
  const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
  const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
  const [showPushDrawer, setShowPushDrawer] = useState(false)


  useEffect(() => {
    dispatch(
      getApprovalSummary(approvalNumber, approvalProcessId, loggedInUser, (res) => {

        const { PartDetails, ApprovalDetails, ApprovalLevelStep, DepartmentId, Technology, ApprovalProcessId, ApprovalProcessSummaryId,
          ApprovalNumber, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow } = res.data.Data.Costings[0]
        const technologyId = res.data.Data.Costings[0].PartDetails.TechnologyId

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
        })
      }),
    )
  }, [])

  const handleApproveAndPushButton = () => {
    setShowPushDrawer(true)
    setApproveDrawer(true)
  }

  const closeDrawer = (e = '') => {
    setApproveDrawer(false)
    setRejectDrawer(false)
    setShowListing(true)
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
                    <button type={'button'} className="apply view-btn mr-3" onClick={() => setShowListing(true)}>
                      Back
                     </button>
                    <button type={'button'} className="apply view-btn">
                      View All
                      </button>
                  </div>
                </Col>
              </Row>
              {/* Code for approval workflow */}
              <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} />

              <Row>
                <Col md="8">
                  <div className="left-border">{'Part Details:'}</div>
                </Col>
              </Row>
              <Row>
                <Col md="12" className="mb-2">
                  <Table responsive className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>
                          <span className="d-block grey-text text-small">{`Technology:`}</span>
                          <span className="d-block text-small">
                            {partDetail.Technology ? partDetail.Technology : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Assembly No./Part No.`}</span>
                          <span className="d-block text-small">
                            {partDetail.PartNumber ? partDetail.PartNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Assembly Name/Part Name`}</span>
                          <span className="d-block text-small">
                            {partDetail.PartName ? partDetail.PartName : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Assembly Description/Part Description`}</span>
                          <span className="d-block text-small">
                            {partDetail.Description ? partDetail.Description : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`ECO No:`}</span>
                          <span className="d-block text-small">
                            {partDetail.ECNNumber ? partDetail.ECNNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Drawing No:`}</span>
                          <span className="d-block text-small">
                            {partDetail.DrawingNumber ? partDetail.DrawingNumber : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Revision No:`}</span>
                          <span className="d-block text-small">
                            {partDetail.RevisionNumber
                              ? partDetail.RevisionNumber
                              : '-'}
                          </span>
                        </th>
                        <th>
                          <span className="d-block grey-text text-small">{`Effective Date:`}</span>
                          <span className="d-block text-small">
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
                <Col md="8">
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
                        <th>
                          {approvalDetails.TypeOfCosting === 'VBC' ? 'Vendor Plant' : 'Plant'}{` Code`}
                        </th>
                        <th>{`SOB`}</th>
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
                        <td>
                          {approvalDetails.TypeOfCosting === 'VBC' ? (approvalDetails.VendorPlantCode ? approvalDetails.VendorPlantCode : '-') : approvalDetails.PlantCode ? approvalDetails.PlantCode : '-'}
                        </td>
                        <td>
                          {approvalDetails.ShareOfBusiness !== null ? approvalDetails.ShareOfBusiness : '-'}
                        </td>
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
                    <button className="btn btn-small-primary-circle ml-1" type="button">
                      {costingSummary ? (
                        <i
                          onClick={() => {
                            setCostingSummary(false)
                          }}
                          className="fa fa-minus"
                        ></i>
                      ) : (
                        <i
                          onClick={() => {
                            setCostingSummary(true)
                          }}
                          className="fa fa-plus"
                        ></i>
                      )}
                    </button>
                  </div>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md="12">
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
                    <button type={'button'} className="mr15 approve-reject-btn" onClick={() => setRejectDrawer(true)} >
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
                        type="button" className="approve-button mr5 approve-hover-btn" onClick={() => handleApproveAndPushButton()}                    >
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
                    <button type="submit" className="submit-button mr5 save-btn">
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
          IsFinalLevel={!showFinalLevelButtons}
          IsPushDrawer={showPushDrawer}
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
          IsPushDrawer={showPushDrawer}
        />
      )}
    </>
  )
}

export default ApprovalSummary
