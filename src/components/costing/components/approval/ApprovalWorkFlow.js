import React, { useEffect, useState } from 'react'

function ApprovalWorkFlow(props) {
  const { approvalLevelStep } = props



  // const [approval, setApproval] = useState([])
  useEffect(() => {
    //setApproval(approvalLevelStep)
  }, [])
  /* TODO SORTING OF LEVEL ACC TO DATA*/
  return approvalLevelStep &&
    <div className="row process workflow-row mb-4">
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
          return (
            <>

              <div key={index} className="col-lg-3 col-md-6 col-sm-12 ">
                <div className="card-border card-green">
                  <div className="top d-flex">
                    <div className="left text-center">
                      <b>{item.FlowStepSequence ? item.FlowStepSequence : ''}</b>
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
            </>
          )
        })}
    </div> /*row*/

}

export default ApprovalWorkFlow
