import React, { useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch } from 'react-redux'
import { pushedApprovedCosting, createRawMaterialSAP } from '../../actions/Approval'
import { loggedInUserId } from '../../../../helper'
import { useForm, Controller } from "react-hook-form";
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { materialGroup, purchasingGroup } from '../../../../config/masterData';

function PushButtonDrawer(props) {

  const { approvalData, dataSend } = props
  console.log('dataSend: ', dataSend);
  const dispatch = useDispatch()
  const { register, handleSubmit, errors, control } = useForm();
  const [plant, setPlant] = useState([]);
  const [MaterialGroup, setMaterialGroup] = useState([]);
  const [PurchasingGroup, setPurchasingGroup] = useState([]);

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', 'Cancel')
  }

  const pushdata = {
    effectiveDate: dataSend[0].EffectiveDate,
    vendorCode: dataSend[0].VendorCode,
    materialNumber: dataSend[1].PartNumber,
    plant: dataSend[0].PlantCode,
    currencyKey: dataSend[0].POCurrency,
    materialGroup:MaterialGroup,
    purchasingGroup:PurchasingGroup
  }
  console.log(pushdata, 'pppppppp')

  const closeDrawerAfterPush = () => {
    let obj = {
      LoggedInUserId: loggedInUserId(),
      CostingId: approvalData[0].CostingId
    }
    dispatch(pushedApprovedCosting(obj, res => {
      if (res.data.Result) {
        props.closeDrawer('', 'Push')
      }
    }))
  }
  const onSubmit = data => {
    toggleDrawer('')
  }

  /**
  * @method renderListing
  * @description RENDER LISTING IN DROPDOWN
  */
  const renderListing = (label) => {
    if (label === 'MaterialGroup') {
      return materialGroup;
    }
    if (label === 'PurchasingGroup') {
      return purchasingGroup;
    }
  }

  /**
  * @const handleMaterialChange
  */
  const handleMaterialChange = (newValue) => {
    if (newValue && newValue !== '') {
      setMaterialGroup(newValue)
      } else {
        setMaterialGroup([])
    }
  }

    /**
  * @const handlePurchasingChange
  */
     const handlePurchasingChange = (newValue) => {
      if (newValue && newValue !== '') {
        setPurchasingGroup(newValue)
        } else {
          setPurchasingGroup([])
      }
    }

  return (
    <>
      <Drawer className="top-drawer" anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{`Push`}</h3>
                </div>
                <div
                  //onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>

              <Row className="pl-3">
                <Col md="12">
                  <TextFieldHookForm
                    label="Company Code"
                    name={"CompanyCode"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={""}
                    className=""
                    customClassName={"withBorder"}
                    errors={errors.CompanyCode}
                    disabled={true}
                  />
                </Col>
              </Row>

              <Row className="pl-3">
                <Col md="12">
                  <SearchableSelectHookForm
                    label={"Material Group"}
                    name={"MaterialGroup"}
                    placeholder={"-Select-"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={MaterialGroup.length !== 0 ? MaterialGroup : ""}
                    options={renderListing("MaterialGroup")}
                    mandatory={true}
                    handleChange={handleMaterialChange}
                    errors={errors.MaterialGroup}
                  />
                </Col>
              </Row>

              <Row className="pl-3">
                <Col md="12">
                  <SearchableSelectHookForm
                    label={"Purchasing Group"}
                    name={"PurchasingGroup"}
                    placeholder={"-Select-"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={PurchasingGroup.length !== 0 ? PurchasingGroup : ""}
                    options={renderListing("PurchasingGroup")}
                    mandatory={true}
                    handleChange={handlePurchasingChange}
                    errors={errors.PurchasingGroup}
                  />
                </Col>
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
                    type="button"
                    className="submit-button mr5 save-btn"
                    onClick={closeDrawerAfterPush}
                  >
                    <div className={'check-icon'}>
                      <img
                        src={require('../../../../assests/images/check.png')}
                        alt="check-icon.jpg"
                      />{' '}
                    </div>
                    {'Push'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer >
    </>
  )
}

export default React.memo(PushButtonDrawer)
