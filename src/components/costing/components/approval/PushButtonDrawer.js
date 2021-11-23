import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch } from 'react-redux'
import { pushedApprovedCosting, createRawMaterialSAP, approvalPushedOnSap } from '../../actions/Approval'
import { getPOPriceAfterDecimal, loggedInUserId, userDetails } from '../../../../helper'
import { useForm, Controller } from "react-hook-form";
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { materialGroup, purchasingGroup } from '../../../../config/masterData';
import { useState } from 'react'
import { INR } from '../../../../config/constants'
import Toaster from '../../../common/Toaster'
import DayTime from '../../../common/DayTimeWrapper'
import { useEffect } from 'react'

function PushButtonDrawer(props) {

  const { approvalData, dataSend, costingList, isSimulation, simulationDetail, } = props


  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm();
  const [plant, setPlant] = useState([]);
  const [MaterialGroup, setMaterialGroup] = useState(!isSimulation ? { label: approvalData[0].MaterialGroup, value: approvalData[0].MaterialGroup } : { label: simulationDetail.MaterialGroup, value: simulationDetail.MaterialGroup });
  const [PurchasingGroup, setPurchasingGroup] = useState(!isSimulation ? { label: approvalData[0].PurchasingGroup, value: approvalData[0].PurchasingGroup } : { label: simulationDetail.PurchasingGroup, value: simulationDetail.PurchasingGroup });

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', 'Cancel')
  }



  useEffect(() => {
    // setValue('')
  }, [])

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
    if (isSimulation) {
      let temp = []
      costingList && costingList.map(item => {
        const vendor = item.VendorName.split('(')[1]
        const { netPo, quantity } = getPOPriceAfterDecimal(simulationDetail.DecimalOption, item.NewPOPrice)
        temp.push({
          CostingId: item.CostingId, effectiveDate: DayTime(simulationDetail.EffectiveDate).format('MM/DD/yyyy'), vendorCode: vendor.split(')')[0], materialNumber: item.PartNo, netPrice: netPo, plant: item.PlantCode ? item.PlantCode : '1511',
          currencyKey: INR, basicUOM: 'NO', purchasingOrg: PurchasingGroup.label.split('(')[0], purchasingGroup: item.DepartmentCode ? item.DepartmentCode : 'MRPL', materialGroup: MaterialGroup.label.split('(')[0], taxCode: 'YW', TokenNumber: simulationDetail.Token,
          Quantity: quantity
        })
      })
      let simObj = {
        LoggedInUserId: loggedInUserId(),
        Request: temp
      }
      dispatch(approvalPushedOnSap(simObj, res => {
        if (res && res.status && (res.status === 200 || res.status === 204)) {
          Toaster.success('Approval pushed successfully.')
        }
        props.closeDrawer('', 'Push')
      }))
    } else {
      const { netPo, quantity } = getPOPriceAfterDecimal(approvalData[0].DecimalOption, dataSend[0].NewPOPrice ? dataSend[0].NewPOPrice : 0)
      let pushdata = {
        effectiveDate: dataSend[0].EffectiveDate ? DayTime(dataSend[0].EffectiveDate).format('MM/DD/yyyy') : '',
        vendorCode: dataSend[0].VendorCode ? dataSend[0].VendorCode : '',
        materialNumber: dataSend[1].PartNumber,
        netPrice: netPo,
        plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
        currencyKey: dataSend[0].Currency ? dataSend[0].Currency : INR,
        materialGroup: MaterialGroup?.label ? MaterialGroup.label.split('(')[0] : '',
        taxCode: 'YW',
        basicUOM: "NO",
        purchasingGroup: PurchasingGroup?.label ? PurchasingGroup.label.split('(')[0] : '',
        purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '',
        CostingId: approvalData[0].CostingId,
        Quantity: quantity
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
        Request: [pushdata]
      }
      dispatch(approvalPushedOnSap(obj, res => {
        if (res && res.status && (res.status === 200 || res.status === 204)) {
          Toaster.success('Approval pushed successfully.')
        }
        props.closeDrawer('', 'Push')
      }))
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
                    defaultValue={!isSimulation ? dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '' : simulationDetail && costingList[0].DepartmentCode}         // need to do once data started coming
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
                    rules={{ required: false }}
                    register={register}
                    defaultValue={MaterialGroup.length !== 0 ? MaterialGroup : ""}
                    options={renderListing("MaterialGroup")}
                    mandatory={false}
                    handleChange={handleMaterialChange}
                    errors={errors.MaterialGroup}
                    disabled={true}
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
                    rules={{ required: false }}
                    register={register}
                    defaultValue={PurchasingGroup.length !== 0 ? PurchasingGroup : ""}
                    options={renderListing("PurchasingGroup")}
                    mandatory={false}
                    handleChange={handlePurchasingChange}
                    errors={errors.PurchasingGroup}
                    disabled={true}
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

                    <div className={'cancel-icon'}></div>
                    {'Cancel'}
                  </button>

                  <button
                    type="button"
                    className="submit-button mr5 save-btn"
                    onClick={onSubmit}
                  >
                    <div className={'save-icon'}></div>
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
