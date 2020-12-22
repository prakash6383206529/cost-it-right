import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import {approvalRequestByApprove, rejectRequestByApprove} from '../../costing/actions/Approval'
import {
  TextAreaHookForm,
  SearchableSelectHookForm,
} from '../../layout/HookFormInputs'
import { loggedInUserId } from '../../../helper'
function ApproveRejectDrawer(props) {
  const { type, tokenNo } = props
  const userLoggedIn = loggedInUserId()
  const partNo = useSelector((state) => state.costing.partNo);
  console.log(partNo,"Part");
  const { register, control, errors, handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const dispatch = useDispatch()
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  const onSubmit = data => {
      let obj={}
      if(type==="Approve"){
        obj.Approver = data.approver.value
      }
     
      obj.Remark = data.remark
      obj.ApprovalToken = tokenNo
      obj.LoggedInUserId = userLoggedIn
      obj.IsApproved = type==="Approve" ? true : false //Confusion need to ask.
      obj.ApprovalProcessSummaryId = "00000000-0000-0000-0000-000000000000"
      
      if(type === "Approve") {
        dispatch(approvalRequestByApprove, (obj,()=>{}))
      }else {
        dispatch(rejectRequestByApprove, (obj,()=>{}))
      }
  }
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
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

              <Row>
                {type === 'Approve' && (
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
                      options={''}
                      mandatory={true}
                      handleChange={() => {}}
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
                    handleChange={() => {}}
                    //defaultValue={viewRM.RMRate}
                    className=""
                    customClassName={'withBorder'}
                    //errors={errors.ECNNumber}
                    disabled={false}
                  />
                </div>
              </Row>
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
                        src={require('../../../assests/images/times.png')}
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
                        src={require('../../../assests/images/check.png')}
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
