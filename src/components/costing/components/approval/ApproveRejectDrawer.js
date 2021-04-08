import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import {
  approvalRequestByApprove,
  rejectRequestByApprove,
  getAllApprovalUserFilterByDepartment,
} from '../../../costing/actions/Approval'
import {
  TextAreaHookForm,
  SearchableSelectHookForm,
} from '../../../layout/HookFormInputs'
import { loggedInUserId, userDetails } from '../../../../helper'
import { toastr } from 'react-redux-toastr'
function ApproveRejectDrawer(props) {
  const { type, tokenNo, approvalData, IsFinalLevel, IsPushDrawer } = props
  console.log(approvalData, "approvalData");
  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const partNo = useSelector((state) => state.costing.partNo)

  const { register, control, errors, handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  useEffect(() => {
    let tempDropdownList = []
    let obj = {
      LoggedInUserId: loggedInUserId(), // user id
      DepartmentId: approvalData[0] && approvalData[0].DepartmentId
        ? approvalData[0].DepartmentId
        : '00000000-0000-0000-0000-000000000000',
      TechnologyId: approvalData[0] && approvalData[0].TechnologyId
        ? approvalData[0].TechnologyId
        : '00000000-0000-0000-0000-000000000000',
    }

    /* Problem here*/
    dispatch(
      getAllApprovalUserFilterByDepartment(obj, (res) => {


        res.data.DataList &&
          res.data.DataList.map((item) => {

            if (item.Value === '0') return false;
            tempDropdownList.push({
              label: item.Text,
              value: item.Value,
              levelId: item.LevelId,
              levelName: item.LevelName
            })
            return null
          })
        setApprovalDropDown(tempDropdownList)
      }),
    )
    // DO IT AFTER GETTING DATA
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
  const onSubmit = (data) => {
    let obj = {}
    // if (type === 'Approve') {
    //   obj.Approver = data.approver.value
    // }


    let Data = []
    approvalData.map(ele => {
      Data.push({
        ApprovalProcessSummaryId: ele.ApprovalProcessSummaryId,
        ApprovalToken: ele.ApprovalNumber,
        LoggedInUserId: userLoggedIn,
        SenderLevelId: userData.LoggedInLevelId,
        SenderLevel: userData.LoggedInLevel,
        Approver: data.approver && data.approver.value ? data.approver.value : '',
        ApproverLevelId: data.approver && data.approver.levelId ? data.approver.levelId : '',
        ApproverLevel: data.approver && data.approver.levelName ? data.approver.levelName : '',
        Remark: data.remark,
        IsApproved: type === 'Approve' ? true : false,
      })
    })
    console.log(Data, "DATA for approve");


    if (type === 'Approve') {
      console.log("COMING IN APPROVE", Data);


      dispatch(approvalRequestByApprove(Data, res => {
        if (res.data.Result) {
          // if (IsPushDrawer) {
          //   toastr.success('Costing  Approved push drawer')
          // } else {
          //   toastr.success('Costing Approved')
          //   props.closeDrawer()
          // }
          toastr.success('Costing Approved')
          props.closeDrawer()
        }
      }))
      //  props.closeDrawer()
    } else {
      console.log("COMING IN REJECT", Data);
      dispatch(rejectRequestByApprove(Data, res => {
        if (res.data.Result) {
          toastr.success('Costing Rejected')
          props.closeDrawer()
        }
      }))
    }
  }
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      //onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${type} Costing`}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              <Row className="ml-0">
                {type === 'Approve' && IsFinalLevel && (
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Approver'}
                      name={'approver'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={isEditFlag ? plantName : ''}
                      options={approvalDropDown}
                      mandatory={true}
                      handleChange={() => { }}
                      errors={errors.approver}
                    />
                  </div>
                )}
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextAreaHookForm
                    label="Remark"
                    name={'remark'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    //defaultValue={viewRM.RMRate}
                    className=""
                    customClassName={'withBorder'}
                    //errors={errors.ECNNumber}
                    disabled={false}
                  />
                </div>
              </Row>
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
                    className="submit-button  save-btn"
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
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ApproveRejectDrawer)
