import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch } from 'react-redux'
import { pushedApprovedCosting, createRawMaterialSAP, approvalPushedOnSap } from '../../actions/Approval'
import { loggedInUserId } from '../../../../helper'
import { useForm, Controller } from "react-hook-form";
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { materialGroup, purchasingGroup } from '../../../../config/masterData';
import { useState } from 'react'
import { INR } from '../../../../config/constants'
import { toastr } from 'react-redux-toastr'
import moment from 'moment'

function PushButtonDrawer(props) {

  const { approvalData, dataSend } = props


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

  const closeDrawerAfterPush = () => {

  }

  /**
* @method renderListing
* @description RENDER LISTING IN DROPDOWN
*/
  const renderListing = (label) => {
    let tempArr = []
    if (label === 'MaterialGroup') {
      const material = materialGroup;
      material && material.map(item => {
        tempArr.push({ label: `${item.label}(${item.value})`, value: item.value })
        return null
      })
    }
    if (label === 'PurchasingGroup') {
      const purchase = purchasingGroup;
      purchase && purchase.map(item => {
        tempArr.push({ label: `${item.label}(${item.value})`, value: item.value })
        return null
      })
    }
    return tempArr
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
  const onSubmit = () => {



    let pushdata = {
      effectiveDate: dataSend[0].EffectiveDate ? moment(dataSend[0].EffectiveDate).local().format('MM/DD/yyyy') : '',
      vendorCode: dataSend[0].VendorCode ? dataSend[0].VendorCode : '',
      materialNumber: dataSend[1].PartNumber,
      netPrice: dataSend[0].NewPOPrice ? dataSend[0].NewPOPrice : '',
      plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
      currencyKey: dataSend[0].Currency ? dataSend[0].Currency : INR,
      materialGroup: MaterialGroup.label.split('(')[0],
      taxCode: 'YW',
      basicUOM: "NO",
      purchasingGroup: PurchasingGroup.label.split('(')[0],
      purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : ''

      // effectiveDate: '11/30/2021',
      // vendorCode: '203670',
      // materialNumber: 'S07004-003A0Y',
      // materialGroup: 'M089',
      // taxCode: 'YW',
      // plant: '1401',
      // netPrice: '30.00',
      // currencyKey: 'INR',
      // basicUOM: 'NO',
      // purchasingOrg: 'MRPL',
      // purchasingGroup: 'O02'

    }

    let obj = {
      LoggedInUserId: loggedInUserId(),
      CostingId: approvalData[0].CostingId,
      Request: pushdata
    }
    console.log(obj, "OBJ");

    dispatch(approvalPushedOnSap(obj, res => {
      if (res && res.status && (res.status === 200 || res.status === 204)) {
        toastr.success('Approval pushed successfully.')
      }
      props.closeDrawer('', 'Push')
    }))

    // dispatch(pushedApprovedCosting(obj, res => {
    //   if (res.data.Result) {
    //     dispatch(createRawMaterialSAP(pushdata, res => {
    //       if (res.data.Result) {
    //         props.closeDrawer('', 'Push')
    //       }
    //     }))
    //   }
    // }))
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
                    defaultValue={dataSend[0].CompanyCode ? dataSend[0].CompanyCode : ''}
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
                    onClick={onSubmit}
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
