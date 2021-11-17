import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import Switch from 'react-switch';
import { SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { getPlantBySupplier, } from '../../../../actions/Common';
import { getCostingSummaryByplantIdPartNo, saveCopyCosting, checkDataForCopyCosting } from '../../actions/Costing';
import { VBC, ZBC } from '../../../../config/constants';
import { getConfigurationKey, isUserLoggedIn, loggedInUserId } from '../../../../helper';
import DatePicker from "react-datepicker";
import moment from 'moment';
import { toastr } from 'react-redux-toastr';
import ConfirmComponent from '../../../../helper/ConfirmComponent';

function CopyCosting(props) {
  const loggedIn = isUserLoggedIn()
  const loggedUserId = loggedInUserId()

  const { copyCostingData, partNo, type, zbcPlantGrid, vbcVendorGrid, selectedCostingId, } = props


  const { register, control, formState: { errors }, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      fromPlant: type === ZBC ? { label: `${copyCostingData.PlantName}(${copyCostingData.PlantCode})`, value: copyCostingData.PlantId, } : '',
      fromVendorName: type === VBC ? { label: `${copyCostingData.VendorName}(${copyCostingData.VendorCode})`, value: copyCostingData.VendorId, } : '',
      // fromVendorPlant: type === VBC ? {label:`${copyCostingData.VendorPlantName}(${copyCostingData.VendorPlantCode})`,value: copyCostingData.VendorPlantId} : ''
      fromDestinationPlant: type === VBC ? { label: `${copyCostingData.DestinationPlantName}`, value: copyCostingData.DestinationPlantId } : '',
      fromcostingId: selectedCostingId.zbcCosting,
      fromVbccostingId: selectedCostingId.vbcCosting,
      toVendorName: type === VBC ? { label: `${copyCostingData.VendorName}(${copyCostingData.VendorCode})`, value: copyCostingData.DestinationPlantId, vendorId: copyCostingData.VendorId } : '',
    },
  })


  // const part = partNo ? partNo : '' should do or not ?

  const dispatch = useDispatch()

  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorName, setVendorName] = useState([])
  const [costingId, setCostingId] = useState([])
  const [vendorFromPlantDropdown, setVendorFromPlantDropdown] = useState([])
  const [vendorToPlantDropdown, setVendorToPlantDropdown] = useState([])
  const [vendorCostingId, setVendorCostingId] = useState([])
  const [destinationPlant, setDestinationPlant] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')
  const [minDate, setMinDate] = useState('')

  const [fromtype, setFromType] = useState(type === ZBC ? false : true)
  const [isFromZbc, setIsFromZbc] = useState(type === ZBC ? true : false)
  const [isToZbc, setIsToZbc] = useState(type === ZBC ? true : false)
  const [isFromVbc, setIsFromVbc] = useState(type === VBC ? true : false)
  const [isToVbc, setIsToVbc] = useState(type === VBC ? true : false)
  const [toSwitch, setToSwitch] = useState(type === VBC ? true : false)

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
    if (getConfigurationKey().IsDestinationPlantConfigure) {
      vbcVendorGrid &&
        vbcVendorGrid.map((item) => {
          VbcTemp.push({
            label: `${item.VendorName}(${item.VendorCode})`,
            value: item.DestinationPlantId,
            vendorId: item.VendorId
          })
        })
    } else {
      vbcVendorGrid &&
        vbcVendorGrid.map((item) => {
          VbcTemp.push({
            label: `${item.VendorName}(${item.VendorCode})`,
            value: item.VendorId,
            vendorId: item.VendorId
            // destPlant: item.DestinationPlantId ? item.DestinationPlantId : ''
          })
        })
    }
    setVendorName(VbcTemp)

    if (type === ZBC) {
      getCostingDropDown(copyCostingData.PlantId, ZBC)
    } else {
      getVendorPlantDropdown(copyCostingData.VendorId, 'from')
      filterCostingDropDown(copyCostingData.VendorId)
      getDestinationPlant({ vendorId: copyCostingData.VendorId })
    }
    const date = copyCostingData && copyCostingData.CostingOptions.filter(item => item.CostingId === copyCostingData.CostingId)
    setMinDate(date[0].EffectiveDate ?? "")
  }, [])


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
      getCostingSummaryByplantIdPartNo(partNo.value, value, (res) => {
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
    if (getConfigurationKey().IsDestinationPlantConfigure) {
      getDestinationPlant(value, 'from')
    }
  }
  /**
   * @method handleToVendorName
   * @descriptionfor changing vendor plant  based on vendor for "To"
   */
  const handleToVendorName = (value) => {
    console.log('value: ', value);
    getVendorPlantDropdown(value.value, 'to')
    if (getConfigurationKey().IsDestinationPlantConfigure) {
      getDestinationPlant(value, 'to')
    }
  }


  const getDestinationPlant = (value, type) => {
    let temp = []
    let vendor = value.vendorId

    vbcVendorGrid && vbcVendorGrid.filter(item => {
      if (item.VendorId === vendor) {
        temp.push({ label: item.DestinationPlantName, value: item.DestinationPlantId })
        return temp
      }
    })
    setDestinationPlant(temp)

  }


  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
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
    console.log('value: ', value);


    const destination = value.toDestinationPlant && value.toDestinationPlant.label.split('(')
    const tovendorCode = value.toVendorName && value.toVendorName.label.split('(')

    let obj = {}

    //  COPY FROM ZBC
    if (isFromZbc) {
      const plantCode = value.fromPlant && value.fromPlant.label.split('(')

      obj.FromPlantId = value.fromPlant && value.fromPlant.value
      obj.FromPlantCode = plantCode[1] && plantCode[1].split(')')[0]
      obj.CostingId = value.fromcostingId && value.fromcostingId.value
      obj.CostingNumber = value.fromcostingId && value.fromcostingId.label
      obj.FromVendorPlantId = '00000000-0000-0000-0000-000000000000'
      obj.FromVendorPlantCode = ''
      obj.FromVendorId = '00000000-0000-0000-0000-000000000000'
      obj.FromVendorCode = ''

    }
    // COPY TO ZBC
    if (isToZbc) {
      const plant = value.toPlant && value.toPlant.label.split('(')
      obj.ToPlantId = value.toPlant && value.toPlant.value
      obj.toPlantCode = plant && plant[1] && plant[1].split(')')[0]
      obj.ToVendorPlantId = '00000000-0000-0000-0000-000000000000'
      obj.ToVendorId = '00000000-0000-0000-0000-000000000000'
    }
    //COPY FROM VBC
    if (isFromVbc) {
      const costNo = value.fromVbccostingId.label.split('-')
      const plantCode = value.fromVendorPlant && value.fromVendorPlant.label.split('(')
      const vendorCode = value.fromVendorName && value.fromVendorName.label.split('(')
      obj.CostingId = value.fromVbccostingId.value
      obj.CostingNumber = `${costNo[0]}-${costNo[1]}`
      obj.FromVendorId = value.fromVendorName.value
      obj.FromVendorCode = vendorCode && vendorCode[1] && vendorCode[1].split(')')[0]
      obj.FromVendorPlantId = value.fromVendorPlant && value.fromVendorPlant.value
      obj.FromVendorPlantCode = plantCode && plantCode[1] && plantCode[1].split(')')[0]
      obj.FromPlantCode = ''
      obj.FromPlantId = '00000000-0000-0000-0000-000000000000'
    }
    //COPY TO VBC
    if (isToVbc) {

      obj.ToVendorId = value.toVendorName && value.toVendorName.vendorId
      obj.ToVendorname = value.toVendorName && value.toVendorName.label
      obj.ToVendorCode = tovendorCode && tovendorCode[1] && tovendorCode[1].split(')')[0]
      obj.ToVendorPlantId = value.toVendorPlant && value.toVendorPlant.value
      obj.ToPlantId = '00000000-0000-0000-0000-000000000000'

    }
    obj.PartNumber = partNo.label
    obj.Comments = ''
    // obj.IsVendor = isToVbc ? true : false
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



    obj.ToDestinationPlantId = value.toDestinationPlant && value.toDestinationPlant.value
    obj.ToDestinationPlantName = value.toDestinationPlant && value.toDestinationPlant.label
    obj.ToDestinationPlantCode = destination && destination[1].split(')')[0]
    obj.EffectiveDate = moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss')
    // obj.

    dispatch(checkDataForCopyCosting(obj, (res) => {
      console.log("res", res);
      const Data = res.data.Data
      if (Data.IsRMExist && Data.IsOperationExist && Data.IsProcessExist && Data.IsBOPExist && Data.IsOtherOperationExist) {
        dispatch(
          saveCopyCosting(obj, (res) => {

            if ((res.status = 200)) {
              toastr.success("Copy costing done sucessfully!")
              const { CostingId, CostingType } = res.data.Data
              props.closeDrawer('', CostingId, CostingType)
            }
          }),
        ) // for saving data
      } else {
        const toastrConfirmOptions = {
          onOk: () => {
            dispatch(
              saveCopyCosting(obj, (res) => {

                if ((res.status = 200)) {
                  toastr.success("Copy costing done sucessfully!")
                  const { CostingId, CostingType } = res.data.Data
                  props.closeDrawer('', CostingId, CostingType)
                }
              }),
            ) // for saving data
          },
          onCancel: () => { },
          component: () => <ConfirmComponent />
        }
        console.log(`${!Data.IsRMExist && Data.MessageForRM}`, `${!Data.IsOperationExist && Data.MessageForOperation}`, `${!Data.IsProcessExist && Data.MessageForProcess}`, `${!Data.IsOtherOperationExist && Data.MessageForOtherOperation}`, "DATA");
        return toastr.confirm(`${!Data.IsRMExist ? 'Raw Material,' : ''}${!Data.IsOperationExist ? 'Operation,' : ''}${!Data.IsProcessExist ? 'Process,' : ''}${!Data.IsOtherOperationExist ? `Other Operation is not available for the selected vendor. Do you still wish to continue ?` : `is not available for the selected vendor. Do you still wish to continue ?`}`, toastrConfirmOptions)
      }
    }))


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
                          disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
                    />
                  </div>
                  {loggedIn && getConfigurationKey().IsVendorPlantConfigurable && (
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
                        disabled={true}
                      />
                    </div>
                  )}
                  {getConfigurationKey().IsDestinationPlantConfigure && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={"Destination Plant"}
                        name={"fromDestinationPlant"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={destinationPlant}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.fromDestinationPlant}
                        disabled={true}
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
                      disabled={true}
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
                          disabled={true}
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
                  <div className="form-group mb-0 col-md-12">
                    <label>Costing Effective Date<span className="asterisk-required">*</span></label>
                    <div className="inputbox date-section">
                      <DatePicker
                        name="EffectiveDate"
                        selected={effectiveDate}
                        onChange={handleEffectiveDateChange}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="dd/MM/yyyy"
                        //maxDate={new Date()}
                        minDate={new Date(minDate)}
                        dropdownMode="select"
                        placeholderText="Select date"
                        className="withBorder"
                        autoComplete={"off"}
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}

                      />
                    </div>
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
                      disabled={false}
                    />
                  </div>
                  {loggedIn && getConfigurationKey().IsVendorPlantConfigurable && (
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
                        disabled={true}
                      />
                    </div>
                  )}
                  {getConfigurationKey().IsDestinationPlantConfigure && (
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={"Destination Plant"}
                        name={"toDestinationPlant"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={destinationPlant}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.toDestinationPlant}
                      />
                    </div>
                  )}
                  {/* <Col md="auto"> */}
                  <div className="form-group mb-0 col-md-12">
                    <label>Costing Effective Date<span className="asterisk-required">*</span></label>
                    <div className="inputbox date-section">
                      <DatePicker
                        name="EffectiveDate"
                        selected={effectiveDate}
                        onChange={handleEffectiveDateChange}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="dd/MM/yyyy"
                        //maxDate={new Date()}
                        minDate={new Date(minDate)}
                        dropdownMode="select"
                        placeholderText="Select date"
                        className="withBorder"
                        autoComplete={"off"}
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}

                      />
                    </div>
                  </div>
                  {/* </Col> */}
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
                    <div className={'cancel-icon'}></div>
                    {"Cancel"}
                  </button>

                  <button
                    type="submit"
                    className="submit-button save-btn"
                  // onClick={addHandler}
                  >
                    <div className={'save-icon'}></div>
                    {"Copy"}
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
