import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import Switch from 'react-switch';
import {
  SearchableSelectHookForm,
} from '../../../layout/HookFormInputs';

import {
  getPlantBySupplier,
} from '../../../../actions/Common';
import {
  getCostingSummaryByplantIdPartNo,
  saveCopyCosting,
} from '../../actions/Costing';
import { VBC, ZBC } from '../../../../config/constants';
import { isUserLoggedIn, loggedInUserId } from '../../../../helper';

function CopyCosting(props) {
  const loggedIn = isUserLoggedIn()
  const loggedUserId = loggedInUserId()

  const {
    copyCostingData,
    partNo,
    type,
    zbcPlantGrid,
    vbcVendorGrid,
    selectedCostingId,
  } = props

  // const part = partNo ? partNo : '' should do or not ?

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
    /* For ZBC plant drop down*/
    zbcPlantGrid &&
      zbcPlantGrid.map((item) => {
        ZbcTemp.push({
          label: `${item.PlantName}(${item.PlantCode})`,
          value: item.PlantId,
        })
      })
    setPlantDropDownList(ZbcTemp)
    /*For vendor dropdown*/
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

        res.data.Data.CostingOptions &&
          res.data.Data.CostingOptions.map((costing) => {
            temp.push({
              label: costing.DisplayCostingNumber,
              value: costing.CostingId,
            })
          })

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

    const filterValue = vbcVendorGrid.filter((item) => value === item.VendorId)

    const { CostingOptions } = filterValue[0]

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
   * @description for finding costing based plant change
   */
  const handlePlantChange = (value) => {
    setValue('fromcostingId', '')
    getCostingDropDown(value.value, ZBC)
  }
  /**
   * @method handleFromVendorName
   * @description for changing vendor plant and costing id based on vendor for "from"
   */
  const handleFromVendorName = (value) => {
    setValue('fromVbccostingId', '')
    getVendorPlantDropdown(value.value, 'from')
    filterCostingDropDown(value.value)
  }
  /**
   * @method handleToVendorName
   * @descriptionfor changing vendor plant  based on vendor for "To"
   */
  const handleToVendorName = (value) => {
    getVendorPlantDropdown(value.value, 'to')
  }

  // const handleFromVendorPlant = (value) => {
  //   
  //   getCostingDropDown(value.value, VBC)
  // }
  /**
   * @method submitForm
   * @description Submitting the form
   */
  const submitForm = (value) => {


    let obj = {}
    if (isFromZbc) {
      const plantCode = value.fromPlant.label.split('(')

      obj.FromPlantId = value.fromPlant.value
      obj.FromPlantCode = plantCode[1].split(')')[0]
      obj.CostingId = value.fromcostingId.value
      obj.CostingNumber = value.fromcostingId.label
      obj.FromVendorPlantId = '00000000-0000-0000-0000-000000000000'
      obj.FromVendorPlantCode = ''
      obj.FromVendorId = '00000000-0000-0000-0000-000000000000'
      obj.FromVendorCode = ''
    }
    if (isToZbc) {
      obj.ToPlantId = value.toPlant.value
      obj.ToVendorPlantId = '00000000-0000-0000-0000-000000000000'
      obj.ToVendorId = '00000000-0000-0000-0000-000000000000'
    }
    if (isFromVbc) {
      const costNo = value.fromVbccostingId.label.split('-')
      const plantCode = value.fromVendorPlant.label.split('(')
      const vendorCode = value.fromVendorName.label.split('(')
      obj.CostingId = value.fromVbccostingId.value
      obj.CostingNumber = `${costNo[0]}-${costNo[1]}`
      obj.FromVendorId = value.fromVendorName.value
      obj.FromVendorCode = vendorCode[1].split(')')[0]
      obj.FromVendorPlantId = value.fromVendorPlant.value
      obj.FromVendorPlantCode = plantCode[1].split(')')[0]
      obj.FromPlantCode = ''
      obj.FromPlantId = '00000000-0000-0000-0000-000000000000'
    }
    if (isToVbc) {
      obj.ToVendorId = value.toVendorName.value
      obj.ToVendorPlantId = value.toVendorPlant.value
      obj.ToPlantId = '00000000-0000-0000-0000-000000000000'
    }
    obj.PartNumber = partNo.label
    obj.Comments = ''
    obj.IsVendor = isToVbc ? true : false
    obj.LoggedInUserId = loggedUserId
    if (isFromZbc && isToZbc) {
      obj.TypeOfCopy = 101
    } else if (isFromZbc && isToVbc) {
      obj.TypeOfCopy = 102
    } else if (isFromVbc && isToZbc) {
      obj.TypeOfCopy = 201
    } else if (isFromVbc && isToVbc) {
      obj.TypeOfCopy = 202
    }


    dispatch(
      saveCopyCosting(obj, (res) => {

        if ((res.status = 200)) {
          props.closeDrawer('')
        }
      }),
    ) // for saving data
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
        // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <form onSubmit={handleSubmit(submitForm)}>
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>{"Copy Costing"}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>
              <Row className="pl-3 align-items-center">
                <Col md="6">
                  <div className="left-border">{"From:"}</div>
                </Col>
                <Col md="6" className="text-right">
                  {
                    <div className="switch d-inline-block">
                      <label className="switch-level justify-content-end">
                        <div className={"left-title"}>ZBC</div>
                        <Switch
                          onChange={() => { }}
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
                        <div className={"right-title"}>VBC</div>
                      </label>
                    </div>
                  }
                </Col>
              </Row>
              {/* From data for ZBC */}
              {isFromZbc && (
                <Row className="pl-3">
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={"Plant"}
                      name={"fromPlant"}
                      placeholder={"-Select-"}
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
                      label={"Costing ID"}
                      name={"fromcostingId"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={costingId.length !== 0 ? costingId : ''}
                      options={costingId}
                      mandatory={true}
                      handleChange={() => { }}
                      errors={errors.fromcostingId}
                    />
                  </div>
                </Row>
              )}
              {/* From data for VBC */}
              {isFromVbc && (
                <Row className="pl-3">
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={"Vendor"}
                      name={"fromVendorName"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={""}
                      options={vendorName}
                      mandatory={true}
                      handleChange={handleFromVendorName}
                      errors={errors.fromVendorName}
                    />
                  </div>
                  {loggedIn && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={"Vendor Plant"}
                        name={"fromVendorPlant"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={vendorFromPlantDropdown}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.fromVendorPlant}
                      />
                    </div>
                  )}

                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={"Costing ID"}
                      name={"fromVbccostingId"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={""}
                      options={vendorCostingId}
                      mandatory={true}
                      handleChange={() => { }}
                      errors={errors.fromVbccostingId}
                    />
                  </div>
                </Row>
              )}
              <hr />

              <Row className="pl-3 align-items-center">
                <Col md="6">
                  <div className="left-border">{"To:"}</div>
                </Col>
                <Col md="6" className="text-right">
                  {
                    <div className="switch d-inline-block">
                      <label className="switch-level justify-content-end">
                        <div className={"left-title"}>ZBC</div>
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
                        <div className={"right-title"}>VBC</div>
                      </label>
                    </div>
                  }
                </Col>
              </Row>
              {/* To data for ZBC */}
              {isToZbc && (
                <Row className="pl-3">
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={"Plant"}
                      name={"toPlant"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      //defaultValue={plant.length !== 0 ? plant : ''}
                      options={plantDropDownList}
                      mandatory={true}
                      handleChange={() => { }}
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
              {/* To data for VBC */}
              {isToVbc && (
                <Row className="pl-3">
                  <div className="input-group form-group col-md-12 input-withouticon">
                    <SearchableSelectHookForm
                      label={"Vendor"}
                      name={"toVendorName"}
                      placeholder={"-Select-"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={""}
                      options={vendorName}
                      mandatory={true}
                      handleChange={handleToVendorName}
                      errors={errors.toVendorName}
                    />
                  </div>
                  {loggedIn && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={"Vendor Plant"}
                        name={"toVendorPlant"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={vendorToPlantDropdown}
                        mandatory={true}
                        handleChange={() => { }}
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
              <Row className="justify-content-between my-3">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                  >
                    <div className={"cross-icon"}>
                      <img
                        src={require("../../../../assests/images/times.png")}
                        alt="cancel-icon.jpg"
                      />
                    </div>{" "}
                    {"Cancel"}
                  </button>

                  <button
                    type="submit"
                    className="submit-button save-btn"
                  // onClick={addHandler}
                  >
                    <div className={"check-icon"}>
                      <img
                        src={require("../../../../assests/images/check.png")}
                        alt="check-icon.jpg"
                      />{" "}
                    </div>
                    {"Save"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </>
  );
}

export default React.memo(CopyCosting)
