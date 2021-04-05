import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalSummary } from '../../actions/Approval'
import { formViewData, loggedInUserId, userDetails } from '../../../../helper'
import { setCostingViewData } from '../../actions/Costing'

import {
  TextAreaHookForm,
  SearchableSelectHookForm,
} from '../../../layout/HookFormInputs'
import ApprovalWorkFlow from './ApprovalWorkFlow'
function ViewDrawer(props) {
  const { approvalLevelStep } = props
  console.log("log", approvalLevelStep)
  const approvalNumber = props.approvalNumber ? props.approvalNumber : '2345438'
  const approvalProcessId = props.approvalProcessId
    ? props.approvalProcessId
    : '1'
  const loggedInUser = loggedInUserId()

  // const { type, tokenNo, departmentId, approvalProcessId } = props
  // const [approvalLevelStep, setApprovalLevelStep] = useState([])

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const partNo = useSelector((state) => state.costing.partNo)
  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [partDetail, setPartDetail] = useState({})
  const [approvalDetails, setApprovalDetails] = useState({})
  const [departmentsId, setDepartmentId] = useState('')

  const { register, control, errors, handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  // useEffect(() => {
  //   dispatch(
  //     getApprovalSummary(approvalNumber, approvalProcessId, loggedInUser, (res) => {

  //       const {
  //         PartDetails,
  //         CostingSummary,
  //         ApprovalDetails,
  //         ApprovalLevelStep,
  //       } = res.data.Data.Costings[0] //Need to ask how data will come
  //       setPartDetail(PartDetails)
  //       setApprovalDetails(ApprovalDetails)
  //       setApprovalLevelStep(ApprovalLevelStep)

  //       const departmentId = res.data.Data.DepartmentId
  //       const technology = res.data.Data.Technology
  //       const approvalProcessId = res.data.Data.ApprovalProcessId
  //       const approvalNumber = res.data.Data.ApprovalNumber
  //       setDepartmentId({
  //         departmentId: departmentId,
  //         technology: technology,
  //         approvalProcessId: approvalProcessId,
  //         approvalNumber: approvalNumber,
  //       })
  //       const tempObj = formViewData(CostingSummary)
  //       dispatch(setCostingViewData(tempObj))
  //     }),
  //   )
  // }, [])

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  return (
    <>
      <Drawer className="top-drawer" anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className="container-fluid add-operation-drawer">
            <div className={'drawer-wrapper drawer-1500px'}>
              <form
              >
                <Row className="drawer-heading sticky-top-0">
                  <Col>
                    <div className={'header-wrapper left'}>
                      <h3>{`
                    Approval Workflow`}</h3>
                    </div>
                    <div
                      onClick={(e) => toggleDrawer(e)}
                      className={'close-button right'}
                    ></div>
                  </Col>
                </Row>

                {/* <Row> */}


   {approvalLevelStep} ? (
    <div className="row process workflow-row justify-content-between">
      {
      approvalLevelStep &&
        approvalLevelStep.map((item, index) => {
          return (
            <div key={index} className="col-lg-3 col-md-6 col-sm-12 d-flex" >
              <div className="card-border card-green">
                <div className="top d-flex">
                  <div className="left text-center" >
                    <b>{item.FlowStepSequence}</b>
                    
                    <span className="d-block">Level</span>
                  </div>
                  <div className="right">
                    <span className="">Approved By:</span>
                    <p className="">{item.Name}</p>
                  </div>
                </div>
                {/* top */}
                <div className="bottom">
                  <div className="d-flex mb-3">
                    <span className="small-grey-text left">Date:</span>
                    <span className=" right">{item.DateTime}</span>
                  </div>
                  <div className="d-flex">
                    <span className="small-grey-text left">Remark:</span>
                    <span className=" right">{item.Remark}</span>
                  </div>
                </div>
                {/* bottom */}
              </div>
            </div>
          )
        })}
    </div> 
  ) : 
  (
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

                {/* </Row> */}
                <hr />
                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={toggleDrawer}
                    >
                      <div className={'cross-icon'}>
                        <img
                          src={require('../../../../assests/images/times.png')}
                          alt="cancel-icon.jpg"
                        />
                      </div>{' '}
                      {'Cancel'}
                    </button>

                    <button
                      type="submit"
                      className="submit-button mr5 save-btn"
                    //onClick={() => setApproveDrawer(true)}
                    >
                      <div className={'check-icon'}>
                        <img
                          src={require('../../../../assests/images/check.png')}
                          alt="check-icon.jpg"
                        />{' '}
                      </div>
                      {'Submit'}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ViewDrawer)
