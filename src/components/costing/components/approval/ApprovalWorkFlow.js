import React, { useEffect, useState } from 'react'

function ApprovalWorkFlow(props) {
  const { approvalLevelStep } = props

  const [approval, setApproval] = useState([])
  useEffect(() => {
    //setApproval(approvalLevelStep)
  }, [])
  /* TODO SORTING OF LEVEL ACC TO DATA*/
  return approvalLevelStep ? (
    <div className="row process workflow-row justify-content-between">
      {approvalLevelStep &&
        approvalLevelStep.map((item, index) => {
          return (
            <div key={index} className="col-lg-3 col-md-6 col-sm-12 d-flex">
              <div className="card-border card-green">
                <div className="top d-flex">
                  <div className="left text-center">
                    <b>{item.FlowStepSequence ? item.FlowStepSequence : ''}</b>
                    <span className="d-block">Level</span>
                  </div>
                  <div className="right">
                    <span className="">Created By:</span>
                    <p className="">{item.ApprovedBy ? item.ApprovedBy : '-'}</p>
                  </div>
                </div>
                {/* top */}
                <div className="bottom">
                  <div className="d-flex mb-3">
                    <span className="small-grey-text left">Date:</span>
                    <span className=" right">{item.Date ? item.Date : '-'}</span>
                  </div>
                  <div className="d-flex">
                    <span className="small-grey-text left">Remark:</span>
                    <span className=" right">{item.Remark ? item.Remark : '-'}</span>
                  </div>
                </div>
                {/* bottom */}
              </div>
              <div className="card-border card-green">
                <div className="top d-flex">
                  <div className="left text-center">
                    <b>{item.FlowStepSequence ? item.FlowStepSequence : ''}</b>
                    <span className="d-block">Level</span>
                  </div>
                  <div className="right">
                    <span className="">Approved By:</span>
                    <p className="">{item.ApprovedBy ? item.ApprovedBy : '-'}</p>
                  </div>
                </div>
                {/* top */}
                <div className="bottom">
                  <div className="d-flex mb-3">
                    <span className="small-grey-text left">Date:</span>
                    <span className=" right">{item.Date ? item.Date : '-'}</span>
                  </div>
                  <div className="d-flex">
                    <span className="small-grey-text left">Remark:</span>
                    <span className=" right">{item.Remark ? item.Remark : '-'}</span>
                  </div>
                </div>
                {/* bottom */}
              </div>
            </div>
          )
        })}
    </div> /*row*/
  ) : (
    <div className="row process workflow-row justify-content-between">
      <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>2</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">Approved By:</span>
              <p className="">Carolkelly</p>
            </div>
          </div>
          {/* top */}
          <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">18/04/2020</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">
                Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do
                Eiusmod.
              </span>
            </div>
          </div>
          {/* bottom */}
        </div>
        {/*card green*/}
      </div>
    </div>
  )
}

export default ApprovalWorkFlow
