import React, { useState } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import ApprovalWorkFlow from './ApprovalWorkFlow';
import ApproveRejectDrawer from './ApproveRejectDrawer';
function ApprovalSummary() {
  const tokenNo = "00000000-0000-0000-0000-000000000000"
  const approvalDetail = [
    {
      costingId: 'CS7654',
      zbcVendorName: 'ZBC',
      plantCode: 'Plant 001',
      sob: '20%',
      oldCurrentPrice: '1235',
      newRevisedPrice: '1245',
      variance: 10,
      consumption: 100,
      remaining: 100,
      effectiveDate: '10/06/2020',
    },
    {
      costingId: 'CS7655',
      zbcVendorName: 'Pena Valdez',
      plantCode: 'Plant 002',
      sob: '17%',
      oldCurrentPrice: '1264',
      newRevisedPrice: '1254',
      variance: 10,
      consumption: 100,
      remaining: 100,
      effectiveDate: '10/06/2020',
    },
  ]

  const [approveDrawer, setApproveDrawer] = useState(false)
  const [rejectDrawer, setRejectDrawer] = useState(false)

  const closeDrawer = (e = '') => {
    setApproveDrawer(false)
    setRejectDrawer(false)
  }
  return (
    <>
      <h2>Approval Summary</h2>
      <Row>
        <Col md="8">
          <div className="left-border">
            {'Approval Workflow (Approval No. 15361):'}
          </div>
        </Col>
        <Col md="4" className="text-right">
          <div className="right-border">
            {
              <button type={'button'} className="apply view-btn">View All</button>
            }
          </div>
        </Col>
      </Row>
      {/* Code for approval workflow */}
      <ApprovalWorkFlow />
      <hr />
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
                <th><span className="d-block grey-text text-small">{`Technology:`}</span>
                <span className="d-block text-small">{`Technology 1`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Assembly No./Part No.`}</span>
                <span className="d-block text-small">{`IZABC0001244`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Assembly Name/Part Name`}</span>
                <span className="d-block text-small">{`Part 1`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Assembly Description/Part Description`}</span>
                <span className="d-block text-small">{`Loreum ipsum`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`ECO No:`}</span>
                <span className="d-block text-small">{`1244`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Drawing No:`}</span>
                <span className="d-block text-small">{`10`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Revision No:`}</span>
                <span className="d-block text-small">{`2`}</span>
                </th>
                <th><span className="d-block grey-text text-small">{`Effective Date:`}</span>
                <span className="d-block text-small">{`10/06/2020`}</span>
                </th>
              </tr>
            </thead>
            <tbody>
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
                <th>{`ZBC/Vendor Name`}</th>
                <th>{`Plant Code`}</th>
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
              {approvalDetail &&
                approvalDetail.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.costingId}</td>
                      <td>{item.zbcVendorName}</td>
                      <td>{item.plantCode}</td>
                      <td>{item.sob}</td>
                      <td>{item.oldCurrentPrice}</td>
                      <td>{item.newRevisedPrice}</td>
                      <td>{item.variance}</td>
                      <td>{item.consumption}</td>
                      <td>{item.remaining}</td>
                      <td>
                        {(item.consumption + item.remaining) * item.variance}
                      </td>
                      <td>{item.remaining * item.variance}</td>
                      <td>{item.effectiveDate}</td>
                    </tr>
                  )
                })}

              {/* {costingProcessCost && costingProcessCost.length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={CONSTANT.EMPTY_DATA} />
                  </td>
                </tr>
              )} */}
            </tbody>
            <tfoot>
                <tr>
                  <td colSpan="12"><span className="grey-text">Reason:</span> Loreum Ipsum</td>
                </tr>
                <tr>
                  <td colSpan="12"><span className="grey-text">Remark:</span> Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore.</td>
                </tr>
              </tfoot>
          </Table>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col md="10">
          <div className="left-border">{'Costing Summary:'}</div>
        </Col>
        <Col md="2" className="text-right">
          <div className="right-border">
            <button className="btn btn-small-primary-circle ml-1" type='button'><i className="fa fa-plus"></i></button>
          </div>
        </Col>
      </Row>
      {/* Costing Summary page here */}
      <hr />
      <Row className="sf-btn-footer no-gutters justify-content-between">
        <div className="col-sm-12 text-right bluefooter-butn">
          <button
            type={'button'}
            className="reset mr15 cancel-btn"
             onClick={()=>setRejectDrawer(true)}
          >
            <div className={'cross-icon'}>
              <img
                src={require('../../../assests/images/times.png')}
                alt="cancel-icon.jpg"
              />
            </div>{' '}
            {'Reject'}
          </button>

          <button
            type="button"
            className="submit-button mr5 save-btn"
              onClick={()=>setApproveDrawer(true)}
          >
            <div className={'check-icon'}>
              <img
                src={require('../../../assests/images/check.png')}
                alt="check-icon.jpg"
              />{' '}
            </div>
            {'Approve'}
          </button>
        </div>
      </Row>
      {
        approveDrawer && 
        <ApproveRejectDrawer
          type={'Approve'}
          isOpen={approveDrawer}
          closeDrawer={closeDrawer}
          tokenNo={tokenNo}
          anchor={'right'}
        />
      }
      {
        rejectDrawer && 
        <ApproveRejectDrawer
        type ={'Reject'}
        isOpen={rejectDrawer}
        closeDrawer={closeDrawer}
        tokenNo={tokenNo}
        anchor={'right'}
        />
      }
    </>
  )
}

export default ApprovalSummary
