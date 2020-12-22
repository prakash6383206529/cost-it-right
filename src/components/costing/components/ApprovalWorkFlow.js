import React from 'react'

function ApprovalWorkFlow() {
  return (
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
          </div>{/* top */}
          <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">18/04/2020</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do Eiusmod.</span>
            </div>
          </div>{/* bottom */}
        </div>{/*card green*/}
      </div>{/* col-3 */}

      <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
        <div className="card-border card-red">
          <div className="top d-flex">
            <div className="left text-center">
              <b>3</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">Rejected By:</span>
              <p className="">Vanessa Ryan</p>
            </div>
          </div>{/* top */}
          <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">20/03/2019</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do Eiusmod.</span>
            </div>
          </div>{/* bottom */}
        </div>{/*card green*/}
      </div>{/* col-3 */}

      <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>4</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">Approved By:</span>
              <p className="">White Castaneda</p>
            </div>
          </div>{/* top */}
          <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">22/04/2020</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do Eiusmod.</span>
            </div>
          </div>{/* bottom */}
        </div>{/*card green*/}
      </div>{/* col-3 */}

      <div className="col-lg-3 col-md-6 col-sm-12 d-flex">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>5</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">Approved By:</span>
              <p className="">Barrera Ramsey</p>
            </div>
          </div>{/* top */}
          <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">24/04/2020</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">Lorem Ipsum Dolor Sit Amet, Conseetur Adipiscing Elit, Sed Do Eiusmod.</span>
            </div>
          </div>{/* bottom */}
        </div>{/*card green*/}
      </div>{/* col-3 */}

    </div>/*row*/
  )
}

export default ApprovalWorkFlow
