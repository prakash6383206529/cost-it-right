import React from 'react'

function ApprovalWorkFlow() {
  return (
    <div className="row process">
      <div className="col-md-4 col-xl-4">

        {/* <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>2</b>
              <span>Level</span>
            </div>
            <div className="right">
              <span className="">Approved By:</span>
              <p className="">Carolkelly</p>
            </div>
          </div>
          <div className="bottom">
            <div className="d-flex">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">18/04/2020</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do Eiusmod.</span>
            </div>
          </div>
        </div> */}

        <div className="card bg-c-blue order-card">
          <div className="card-block p-t-20 p-b-5">
            <p className="f-left text-left">
              <span className="f-32 d-b">{'2 Level'}</span>
              <span className="f-18 d-b">Approved By: 'Carolkelly'</span>
            </p>
            <p className="f-right text-right">
              <span className="f-18 d-b m-t-15">{'Date: 18/04/2020'}</span>
              <span className="f-18 d-b m-t-15">{'Remark: Loreum Ipsum'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApprovalWorkFlow
