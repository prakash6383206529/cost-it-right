import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Drawer from '@material-ui/core/Drawer'
import {
  TextFieldHookForm,
  SearchableSelectHookForm,
} from '../../../layout/HookFormInputs'
import Switch from 'react-switch'
import {
  getPlantSelectListByType,
  getPlantBySupplier,
} from '../../../../actions/Common'
import {
  getCostingSummaryByplantIdPartNo,
  getZBCExistingCosting,
  getVBCExistingCosting,
  saveCopyCosting,
} from '../../actions/Costing'
import { VBC, ZBC } from '../../../../config/constants'
import { isUserLoggedIn, loggedInUserId } from '../../../../helper'

function CopyCosting(props) {
  const loggedIn = isUserLoggedIn()
  const loggedUserId = loggedInUserId()
  console.log(loggedUserId)
  const {
    copyCostingData,
    partNo,
    type,
    zbcPlantGrid,
    vbcVendorGrid,
    selectedCostingId,
  } = props
  console.log(selectedCostingId, 'ZBC costing')
  // const part = partNo ? partNo : '' should do or not ?
  console.log(vbcVendorGrid, 'cccccccc')
  const dispatch = useDispatch()

  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorName, setVendorName] = useState([])
  const [costingId, setCostingId] = useState([])
  const [vendorFromPlantDropdown, setVendorFromPlantDropdown] = useState([])
  const [vendorToPlantDropdown, setVendorToPlantDropdown] = useState([])
  const [vendorCostingId, setVendorCostingId] = useState([])

  const [fromtype, setFromType] = useState(type === ZBC ? false : true)
  const [isFromZbc, setIsFromZbc] = useState(type === ZBC ? true : false)
  const [isToZbc, setIsToZbc] = useState(true)
  const [isFromVbc, setIsFromVbc] = useState(type === VBC ? true : false)
  const [isToVbc, setIsToVbc] = useState(false)
  const [toSwitch, setToSwitch] = useState(false)

  useEffect(() => {
    const ZbcTemp = []
    const VbcTemp = []

    zbcPlantGrid &&
      zbcPlantGrid.map((item) => {
        ZbcTemp.push({
          label: `${item.PlantName}(${item.PlantCode})`,
          value: item.PlantId,
        })
      })
    setPlantDropDownList(ZbcTemp)

    vbcVendorGrid &&
      vbcVendorGrid.map((item) => {
        VbcTemp.push({
          label: `${item.VendorName}(${item.VendorCode})`,
          value: item.VendorId,
        })
      })
    setVendorName(VbcTemp)

    if (type === ZBC) {
      getCostingDropDown(copyCostingData.PlantId, ZBC)
    } else {
      getVendorPlantDropdown(copyCostingData.VendorId, 'from')
      filterCostingDropDown(copyCostingData.VendorId)
    }
  }, [])

  const { register, control, errors, handleSubmit, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      fromPlant:
        type === ZBC
          ? {
              label: `${copyCostingData.PlantName}(${copyCostingData.PlantCode})`,
              value: copyCostingData.PlantId,
            }
          : '',
      fromVendorName:
        type === VBC
          ? {
              label: `${copyCostingData.VendorName}(${copyCostingData.VendorCode})`,
              value: copyCostingData.VendorId,
            }
          : '',
      // fromVendorPlant: type === VBC ? {label:`${copyCostingData.VendorPlantName}(${copyCostingData.VendorPlantCode})`,value: copyCostingData.VendorPlantId} : ''
      fromcostingId: selectedCostingId.zbcCosting,
      fromVbccostingId: selectedCostingId.vbcCosting,
    },
  })

  /**
   * @method handleToSwitch
   * @description Handle switch of 'To'
  */
  const handleToSwitch = (checked) => {
    setToSwitch(checked)
    if (checked === false) {
      setIsToVbc(false)
      setIsToZbc(true)
    } else {
      setIsToVbc(true)
      setIsToZbc(false)
    }
  }

  /**
   * @method handleFromChange
   * @description Handle switch of 'From'
  */
  const handleFromChange = (checked, event, id) => {
    console.log(checked, 'Checked from first switch', event, 'ggggggggg', id)
    setFromType(checked)
    if (checked === false) {
      setIsFromVbc(false)
      setIsFromZbc(true)
    } else {
      setIsFromVbc(true)
      setIsFromZbc(false)
    }
  }


  /**
   * @method getCostingDropDown
   * @description getting dropdown of costing id
  */
  function getCostingDropDown(value, costingFor) {
    const temp = []
    dispatch(
      getCostingSummaryByplantIdPartNo(partNo.label, value, (res) => {
        console.log(res, 'res')
        res.data.Data.CostingOptions &&
          res.data.Data.CostingOptions.map((costing) => {
            temp.push({
              label: costing.CostingNumber,
              value: costing.CostingId,
            })
          })
        console.log(costingFor, 'Costing For', temp)
        if (costingFor === ZBC) {
          setCostingId(temp)
        } else {
          setVendorCostingId(temp)
        }

        //  setValue('costings', '')
      }),
    )
  }

  /**
   * @method filterCostingDropDown
   * @description fliter costing dropdown for vendor
  */
  function filterCostingDropDown(value) {
    const temp = []
    console.log(value, 'Value', vbcVendorGrid)
    const filterValue = vbcVendorGrid.filter((item) => value === item.VendorId)
    console.log(filterValue, 'Filtered Value')
    const { CostingOptions } = filterValue[0]
    console.log(CostingOptions)
    CostingOptions &&
      CostingOptions.map((costing) => {
        temp.push({
          label: costing.DisplayCostingNumber,
          value: costing.CostingId,
        })
      })
    setVendorCostingId(temp)
  }
/**
 * @method getVendorPlantDropdown
 * @description vendorplant dropdown 
*/

  function getVendorPlantDropdown(value, vendorType) {
    const temp = []
    dispatch(
      getPlantBySupplier(value, (res) => {
        res.data.SelectList &&
          res.data.SelectList.map((plant) => {
            if (
              plant.Value === '0' ||
              vendorFromPlantDropdown.includes(plant.Value)
            )
              return false
            temp.push({ label: plant.Text, value: plant.Value })
          })
        if (vendorType === 'from') {
          setVendorFromPlantDropdown(temp)
        } else {
          setVendorToPlantDropdown(temp)
        }
      }),
    )
  }
  /**
   * @method handlePlantChange
   * @description 
  */
  const handlePlantChange = (value) => {
    setValue('fromcostingId', '')
    getCostingDropDown(value.value, ZBC)
  }
  const handleFromVendorName = (value) => {
    setValue('fromVbccostingId', '')
    getVendorPlantDropdown(value.value, 'from')
    filterCostingDropDown(value.value)
  }
  const handleToVendorName = (value) => {
    getVendorPlantDropdown(value.value, 'to')
  }

  const handleFromVendorPlant = (value) => {
    console.log(value, 'After selecting vendor plant')
    getCostingDropDown(value.value, VBC)
  }

  const submitForm = (value) => {
    console.log('save value', value)
    let copy = ''

    // {
    //  done "IsVendor": isToVbc ? true : false,
    //  done "TypeOfCopy": copy,
    //  done "CostingId": value.fromcostingId ? value.fromcostingId.value:"00000000-0000-0000-0000-000000000000",
    //  done "CostingNumber": "string",
    // done  "PartNumber": "string",
    // done  "Comments": "string",
    // done  "FromPlantId": "00000000-0000-0000-0000-000000000000",
    // done  "ToPlantId": "00000000-0000-0000-0000-000000000000",
    // done "FromPlanCode": "string",
    //  done "FromVendorId": "00000000-0000-0000-0000-000000000000",
    //  done "FromVendorCode": "string",
    // done  "ToVendorId": "00000000-0000-0000-0000-000000000000",
    // done  "FromVendorPlantId": "00000000-0000-0000-0000-000000000000",
    // done  "FromVendorPlantCode": "string",
    //  done "ToVendorPlantId": "00000000-0000-0000-0000-000000000000",
    //  done "LoggedInUserId": "00000000-0000-0000-0000-000000000000"
    // }

    let obj = {}
    if (isFromZbc) {
      const plantCode = value.fromPlant.label.split('(')
      console.log(plantCode[1].split(')'),"Plant code");
      obj.FromPlantId = value.fromPlant.value
      obj.FromPlantCode = plantCode[1].split(')')[0]
      obj.CostingId = value.fromcostingId.value
      obj.CostingNumber = value.fromcostingId.label
      obj.FromVendorPlantId = "00000000-0000-0000-0000-000000000000"
      obj.FromVendorPlantCode=""
      obj.FromVendorId = "00000000-0000-0000-0000-000000000000"
      obj.FromVendorCode = ""
    }
    if (isToZbc) {
      obj.ToPlantId = value.toPlant.value
      obj.ToVendorPlantId ="00000000-0000-0000-0000-000000000000"
      obj.ToVendorId="00000000-0000-0000-0000-000000000000"
    }
    if (isFromVbc) {
      //console.log(value.fromVbccostingId.label.split('-'),"fffffff");
      const costNo = value.fromVbccostingId.label.split('-')
      const plantCode = value.fromVendorPlant.label.split('(')
      const vendorCode = value.fromVendorName.label.split('(')
      obj.CostingId = value.fromVbccostingId.value
      obj.CostingNumber = `${costNo[0]}-${costNo[1]}`
      obj.FromVendorId = value.fromVendorName.value
      obj.FromVendorCode = vendorCode[1].split(')')[0]
      obj.FromVendorPlantId = value.fromVendorPlant.value
      obj.FromVendorPlantCode = plantCode[1].split(')')[0]
      obj.FromPlantCode = ""
      obj.FromPlantId = "00000000-0000-0000-0000-000000000000"
    }
    if (isToVbc) {
      obj.ToVendorId = value.toVendorName.value
      obj.ToVendorPlantId = value.toVendorPlant.value
      obj.ToPlantId = "00000000-0000-0000-0000-000000000000"
    }
    obj.PartNumber = partNo.label
    obj.Comments = ''
    obj.IsVendor = isToVbc ? true : false
    obj.LoggedInUserId=loggedUserId
    if (isFromZbc && isToZbc) {
     obj.TypeOfCopy = 101
    } else if (isFromZbc && isToVbc) {
      obj.TypeOfCopy = 102
    } else if (isFromVbc && isToZbc) {
      obj.TypeOfCopy = 201
    } else if (isFromVbc && isToVbc) {
      obj.TypeOfCopy = 202
    }

    console.log(obj, 'Json Object')
     dispatch(saveCopyCosting(obj,(res)=>{
       console.log(res);
      if(res.status = 200) {
        props.closeDrawer('')
      }
     }) ) // for saving data
  }
  /**
   * @method toggleDrawer
   * @description close drawer
   */
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
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <form onSubmit={handleSubmit(submitForm)}>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{'Copy Costing'}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <div className="left-border">{'From:'}</div>
                </Col>
                <Col md="6">
                  <div className="right-border">
                    {
                      <Col md="12" className="switch mb15">
                        <label className="switch-level">
                          <div className={'left-title'}>ZBC</div>
                          <Switch
                            onChange={() => {}}
                            checked={fromtype}
                            id="normal-switch"
                            //disabled={isEditFlag ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#4DC771"
                            uncheckedIcon={false}
                            onChange={handleFromChange}
                            checkedIcon={false}
                            height={20}
                            width={46}
                          />
                          <div className={'right-title'}>VBC</div>
                        </label>
                      </Col>
                    }
                  </div>
                </Col>
              </Row>
              {isFromZbc && (
                // vendorName
                <Row>
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Plant'}
                      name={'fromPlant'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={fromplant.length !== 0 ? fromplant : ''}
                      options={plantDropDownList}
                      mandatory={true}
                      handleChange={handlePlantChange}
                      errors={errors.fromPlant}
                    />
                  </div>
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Costing ID'}
                      name={'fromcostingId'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={costingId.length !== 0 ? costingId : ''}
                      options={costingId}
                      mandatory={true}
                      handleChange={() => {}}
                      errors={errors.fromcostingId}
                    />
                  </div>
                </Row>
              )}
              {isFromVbc && (
                <Row>
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Vendor'}
                      name={'fromVendorName'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={''}
                      options={vendorName}
                      mandatory={true}
                      handleChange={handleFromVendorName}
                      errors={errors.fromVendorName}
                    />
                  </div>
                  {loggedIn && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={'Vendor Plant'}
                        name={'fromVendorPlant'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={vendorFromPlantDropdown}
                        mandatory={true}
                        handleChange={() => {}}
                        errors={errors.fromVendorPlant}
                      />
                    </div>
                  )}

                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Costing ID'}
                      name={'fromVbccostingId'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={''}
                      options={vendorCostingId}
                      mandatory={true}
                      handleChange={() => {}}
                      errors={errors.fromVbccostingId}
                    />
                  </div>
                </Row>
              )}
              <hr />

              <Row>
                <Col md="6">
                  <div className="left-border">{'To:'}</div>
                </Col>
                <Col md="6">
                  <div className="right-border">
                    {
                      <Col md="12" className="switch mb15">
                        <label className="switch-level">
                          <div className={'left-title'}>ZBC</div>
                          <Switch
                            onChange={handleToSwitch}
                            checked={toSwitch}
                            id="normal-switch"
                            //disabled={isEditFlag ? true : false}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#4DC771"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                          />
                          <div className={'right-title'}>VBC</div>
                        </label>
                      </Col>
                    }
                  </div>
                </Col>
              </Row>
              {isToZbc && (
                <Row>
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Plant'}
                      name={'toPlant'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={plant.length !== 0 ? plant : ''}
                      options={plantDropDownList}
                      mandatory={true}
                      handleChange={() => {}}
                      errors={errors.toPlant}
                    />
                  </div>
                  {/* <div className="input-group form-group col-md-12 input-withouticon">
                  <SearchableSelectHookForm
                    label={'Costing ID'}
                    name={'tocostingId'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    //defaultValue={costingId.length !== 0 ? costingId : ''}
                    options={costingId}
                    mandatory={true}
                    handleChange={() => {}}
                    errors={errors.tocostingId}
                  />
                </div> */}
                </Row>
              )}
              {isToVbc && (
                <Row>
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={'Vendor'}
                      name={'toVendorName'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={''}
                      options={vendorName}
                      mandatory={true}
                      handleChange={handleToVendorName}
                      errors={errors.toVendorName}
                    />
                  </div>
                  {loggedIn && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={'Vendor Plant'}
                        name={'toVendorPlant'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={vendorToPlantDropdown}
                        mandatory={true}
                        handleChange={() => {}}
                        errors={errors.toVendorPlant}
                      />
                    </div>
                  )}

                  {/* <div className="input-group form-group col-md-12 input-withouticon">
                  <SearchableSelectHookForm
                    label={'Costing ID'}
                    name={'toVbccostingId'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={''}
                    options={() => {}}
                    mandatory={true}
                    handleChange={() => {}}
                    errors={errors.toVbccostingId}
                  />
                </div> */}
                </Row>
              )}
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
                    // onClick={addHandler}
                  >
                    <div className={'check-icon'}>
                      <img
                        src={require('../../../../assests/images/check.png')}
                        alt="check-icon.jpg"
                      />{' '}
                    </div>
                    {'Save'}
                  </button>
                </div>
              </Row>
              <hr />
            </form>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(CopyCosting)
