import React from 'react'
import { Container, Row, Col, Table } from 'reactstrap'
import ApprovalWorkFlow from './ApprovalWorkFlow'
function ApprovalSummary() {
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
              <button type={'button'} className="apply mr15 view-btn">View All</button>
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
        <Col md="12">
          <Table responsive className="table cr-brdr-main" size="sm">
            <thead>
              <tr>
                <th>{`Technology:`}</th>
                <th>{`Assembly No./Part No.`}</th>
                <th>{`Assembly Name/Part Name`}</th>
                <th>{`Assembly Description/Part Description`}</th>
                <th>{`ECO No:`}</th>
                <th>{`Drawing No:`}</th>
                <th>{`Revision No:`}</th>
                <th>{`Effective Date:`}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{`Technology 1`}</td>
                <td>{`IZABC0001244`}</td>
                <td>{`Part 1`}</td>
                <td>{`Loreum ipsum`}</td>
                <td>{`1244`}</td>
                <td>{`10`}</td>
                <td>{`2`}</td>
                <td>{`10/06/2020`}</td>
              </tr>

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
      <hr />
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
              <tfoot>
                <Row>
                  <Col md="12">Reason : Loreum Ipsum</Col>
                </Row>
                <Row>
                  <Col md="12">Remark : Loreum Ipsum Dolor</Col>
                </Row>
              </tfoot>
            </tbody>
          </Table>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col md="10">
          <div className="left-border">{'Costing Summary:'}</div>
        </Col>
        <Col md="2">
          <div className="right-border">
            {<button className="Add mr-1" type={'button'} />}
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
            onClick={() => {}}
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
            type="submit"
            className="submit-button mr5 save-btn"
            // onClick={addHandler}
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
    </>
  )
}

export default ApprovalSummary
