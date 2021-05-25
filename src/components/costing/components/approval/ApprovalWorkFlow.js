import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { APPROVED, REJECTED, PENDING } from '../../../../config/constants'

function ApprovalWorkFlow(props) {
  const { approvalLevelStep, approvalNo } = props



  // const [approval, setApproval] = useState([])
  useEffect(() => {
    //setApproval(approvalLevelStep)
  }, [])
  /* TODO SORTING OF LEVEL ACC TO DATA*/
  return approvalLevelStep &&
    <div className="row process workflow-row">
      {/* <div className="col-lg-3 col-md-6 col-sm-12 ">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>{createdByDetail.FlowStepSequence ? createdByDetail.FlowStepSequence : 0}</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">{createdByDetail.Title}</span>
              <p className="">{createdByDetail.ApprovedBy ? createdByDetail.ApprovedBy : '-'}</p>
            </div>
          </div>
          {/* top */}
      {/* <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">{createdByDetail.Date ? createdByDetail.Date : '-'}</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">{createdByDetail.Remark ? createdByDetail.Remark : '-'}</span>
            </div>
          </div>         
        </div>
      </div> */}
      {approvalLevelStep &&
        approvalLevelStep.map((item, index) => {
          if (index > 3) return false
          return (
            <>
              <div key={index} className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className={`card-border  ${item.Title.split(' ')[0] === REJECTED ? 'card-red' : item.Title.split(' ')[0] === APPROVED ? 'card-green' : item.Status === PENDING ? 'card-yellow' : ''}`}>
                  <div className="top d-flex">
                    <div className="left text-center">
                      <b>{item.Level ? item.Level.split('-')[1] : 0}</b>
                      <span className="d-block">Level</span>
                    </div>
                    <div className="right">
                      <span className="">{item.Title}</span>
                      <p className="">{item.ApprovedBy ? item.ApprovedBy : '-'}</p>
                    </div>
                  </div>
                  {/* top */}
                  <div className="bottom">
                    <div className="d-flex mb-3">
                      <span className="small-grey-text left">Date:</span>
                      <span className=" right">{item.Date ? moment(item.Date).format('DD/MM/YYYY') : '-'}</span>
                    </div>
                    <div className="d-flex">
                      <span className="small-grey-text left">Remark:</span>
                      <span className=" right">{item.Comments ? item.Comments : '-'}</span>
                    </div>
                  </div>
                  {/* bottom */}
                </div>
              </div>
            </>
          )
        })}
    </div> /*row*/

}

export default ApprovalWorkFlow
