import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalSummary } from '../../actions/Approval'
import { formViewData, loggedInUserId, userDetails } from '../../../../helper'
import { setCostingViewData } from '../../actions/Costing'
import ApprovalWorkFlow from './ApprovalWorkFlow'

function Opened(props) {
  const approvalNumber = props.approvalNumber ? props.approvalNumber : '2345438'
  const approvalProcessId = props.approvalProcessId
    ? props.approvalProcessId
    : '1'
  const loggedInUser = loggedInUserId()

  // const { type, tokenNo, departmentId, approvalProcessId } = props
  const [approvalLevelStep, setApprovalLevelStep] = useState([])

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

  useEffect(() => {
    dispatch(
      getApprovalSummary(approvalNumber, approvalProcessId, loggedInUser, (res) => {

        const {
          PartDetails,
          CostingSummary,
          ApprovalDetails,
          ApprovalLevelStep,
        } = res.data.Data.Costings[0] //Need to ask how data will come
        setPartDetail(PartDetails)
        setApprovalDetails(ApprovalDetails)
        setApprovalLevelStep(ApprovalLevelStep)

        const departmentId = res.data.Data.DepartmentId
        const technology = res.data.Data.Technology
        const approvalProcessId = res.data.Data.ApprovalProcessId
        const approvalNumber = res.data.Data.ApprovalNumber
        setDepartmentId({
          departmentId: departmentId,
          technology: technology,
          approvalProcessId: approvalProcessId,
          approvalNumber: approvalNumber,
        })
        const tempObj = formViewData(CostingSummary)
        dispatch(setCostingViewData(tempObj))
      }),
    )
  }, [])

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
             

                  <div >
                    <ApprovalWorkFlow />
                  </div>
              
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

export default React.memo(Opened)
