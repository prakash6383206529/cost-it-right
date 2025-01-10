import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Label } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import { DatePickerHookForm, SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs';
import { saveCopyCosting, checkDataForCopyCosting } from '../../actions/Costing';
import { CBCTypeId, NCCTypeId, VBCTypeId, ZBCTypeId } from '../../../../config/constants';
import { getCodeBySplitting, getConfigurationKey, getNameBySplitting, loggedInUserId } from '../../../../helper';
import DayTime from '../../../common/DayTimeWrapper'
import Toaster from '../../../common/Toaster';
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';
import _, { debounce } from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
import LoaderCustom from '../../../common/LoaderCustom';
import TooltipCustom from '../../../common/Tooltip';
import { useLabels } from '../../../../helper/core';
function CopyCosting(props) {
  const { copyCostingData, partNo, type, zbcPlantGrid, vbcVendorGrid, nccGrid, cbcGrid } = props

  const { register, control, formState: { errors }, handleSubmit, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const { vendorLabel } = useLabels()
  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorName, setVendorName] = useState([])
  const [destinationPlant, setDestinationPlant] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')
  const [minDate, setMinDate] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [disablePopup, setDisablePopup] = useState(false)
  const [updatedObj, setUpdatedObj] = useState({})
  const [msgObj, setMsgObj] = useState({})
  const [costingTypeId, setCostingTypeId] = useState('')
  const [customer, setCustomer] = useState([])
  const [customerPlant, setCustomerPlant] = useState([])
  const [toPlant, setToplant] = useState({})
  const [toVendor, setToVendor] = useState({})
  const [toCustomer, setToCustomer] = useState({})
  const [nccVendor, setNccVendor] = useState({})
  const [nccPlant, setNccPlant] = useState({})
  const [isLoader, setIsLoader] = useState(false)
  const [infoCategory, setInfoCategory] = useState([])
  const [isInfoCategorySelected, setIsInfoCategorySelected] = useState(false)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  useEffect(() => {
    setCostingTypeId(type)
    const ZbcTemp = []
    const VbcTemp = []
    const CbcTemp = []
    const tempPlantCbc = []
    const NccVendor = []
    const NccPlant = []
    const VbcPlant = []
    /* For ZBC plant drop down*/
    zbcPlantGrid &&
      zbcPlantGrid.map((item) => (
        ZbcTemp.push({
          label: item.PlantName,
          value: item.PlantId,
        })
      ))
    let uniqueArrayZbcPlant = _.uniqBy(ZbcTemp, "value")
    setPlantDropDownList(uniqueArrayZbcPlant)

    /* For CBC drop down*/
    cbcGrid && cbcGrid.map((item) => {
      CbcTemp.push({ label: item.Customer, value: item.CustomerId })
      tempPlantCbc.push({ label: item.DestinationPlantName, value: item.DestinationPlantId })
      return null
    })
    let uniqueArrayCbc = _.uniqBy(CbcTemp, "value")
    let uniqueArrayCbcPlant = _.uniqBy(tempPlantCbc, "value")
    setCustomer(uniqueArrayCbc)
    setCustomerPlant(uniqueArrayCbcPlant)

    /*For vendor dropdown*/
    if (getConfigurationKey().IsDestinationPlantConfigure) {
      vbcVendorGrid &&
        vbcVendorGrid.map((item) => {
          VbcTemp.push({ label: item.VendorName, value: item.VendorId })
          VbcPlant.push({ label: item.DestinationPlantName, value: item.DestinationPlantId })
          return null
        })
      let uniqueArrayVbcPlant = _.uniqBy(VbcPlant, "value")
      setDestinationPlant(uniqueArrayVbcPlant)
    } else {
      vbcVendorGrid &&
        vbcVendorGrid.map((item) => (
          VbcTemp.push({
            label: item.VendorName,
            value: item.VendorId
          })
        ))
    }
    let uniqueArray = _.uniqBy(VbcTemp, "value")
    setVendorName(uniqueArray)

    /*For New Component dropdown*/
    nccGrid && nccGrid.map((item) => {
      NccPlant.push({ label: item.DestinationPlantName, value: item.DestinationPlantId })
      NccVendor.push({
        label: item.VendorName,
        value: item.VendorId
      })
      return null
    })
    let uniqueArrayNccVendor = _.uniqBy(NccVendor, "value")
    let uniqueArrayNccPlant = _.uniqBy(NccPlant, "value")
    setNccVendor(uniqueArrayNccVendor)
    setNccPlant(uniqueArrayNccPlant)
    const date = copyCostingData && copyCostingData.CostingOptions.filter(item => item.CostingId === copyCostingData.CostingId)
    setMinDate(date[0]?.LastApproveEffectiveDate ? date[0].LastApproveEffectiveDate : date[0]?.PartEffectiveDate)
  }, [])

  useEffect(() => {
    setInfoCategory(initialConfiguration?.InfoCategories)
  }, [initialConfiguration])

  /**
   * @method handleToVendorName
   * @descriptionfor changing vendor plant  based on vendor for "To"
   */
  const handleToVendorName = (value) => {
    setToVendor(value)
  }

  const handlePlantChange = (value) => {
    if (value && value !== '') {
      setToplant(value)
    } else {
      setToplant({})
    }
  }
  const handleCustomerChange = (value) => {
    if (value && value !== '') {
      setToCustomer(value)
    } else {
      setToCustomer({})
    }
  }
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }
  /**
   * @method submitForm
   * @description Submitting the form
   */
  const submitForm = debounce(handleSubmit((value) => {
    setIsDisable(true)
    let checkCostingObj = {}
    let copyCostingObj = {}

    // Check copy costing data object
    checkCostingObj.CostingId = copyCostingData.CostingId
    checkCostingObj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    checkCostingObj.ToCostingHeadId = costingTypeId
    checkCostingObj.ToPlantId = toPlant?.value
    checkCostingObj.ToVendorId = costingTypeId === VBCTypeId || costingTypeId === NCCTypeId ? toVendor?.value : null
    checkCostingObj.ToCustomerId = costingTypeId === CBCTypeId ? toCustomer?.value : null

    // COPY COSTING OBJECT
    copyCostingObj.ToCostingHeadId = costingTypeId
    copyCostingObj.CostingId = copyCostingData.CostingId
    copyCostingObj.PartId = partNo.value
    copyCostingObj.ToPlantId = toPlant?.value
    copyCostingObj.ToPlantName = getNameBySplitting(toPlant?.label)
    copyCostingObj.ToPlantCode = getCodeBySplitting(toPlant?.label)
    copyCostingObj.ToVendorId = toVendor?.value
    copyCostingObj.ToCustomerId = toCustomer?.value
    copyCostingObj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    copyCostingObj.LoggedInUserId = loggedInUserId()
    copyCostingObj.IsDuplicate = getConfigurationKey().IsExactCopyCosting
    copyCostingObj.InfoCategory = isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text
    setIsLoader(true)
    dispatch(checkDataForCopyCosting(checkCostingObj, (res) => {
      setIsLoader(false)
      setIsDisable(false)
      if ('response' in res) {
        if (res && res?.response?.data?.Result === false) {
          return false
        }
      }
      const Data = res?.data?.Data
      if (Data?.IsRMExist && Data?.IsOperationExist && Data?.IsProcessExist && Data?.IsBOPExist && Data?.IsOtherOperationExist) {
        setIsLoader(true)
        dispatch(
          saveCopyCosting(copyCostingObj, (res) => {
            setIsLoader(false)
            setIsDisable(false)
            if ((res.status = 200)) {
              Toaster.success("Copy costing done successfully!")
              const CostingId = res.data.Identity
              props.closeDrawer('', CostingId, type)
            }
          }),
        ) // for saving data
      } else {
        setShowPopup(true)
        setMsgObj(Data)
        setUpdatedObj(copyCostingObj)
      }
    }))

  }), 500)

  const onPopupConfirm = () => {
    props.setCostingOptionSelect()
    setDisablePopup(true)
    setIsLoader(true)
    dispatch(
      saveCopyCosting(updatedObj, (res) => {
        setIsLoader(false)
        setDisablePopup(false)
        if ((res.status = 200)) {
          Toaster.success("Copy costing done successfully!")
          const CostingId = res.data.Identity
          props.closeDrawer('', CostingId, type)

        }
      }),
    ) // for saving data
    setShowPopup(false)
  }
  const closePopUp = () => {
    setIsDisable(false)
    setShowPopup(false)
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
  const onPressRadioButton = (costingType) => {
    setCostingTypeId(costingType)
    setValue('toVendor', '')
    setValue('toCustomer', '')
    setValue('toPlant', '')
  }

  const categoryTypeOnChange = (e) => {
    setIsInfoCategorySelected(!isInfoCategorySelected)
  }

  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className={`${showPopup ? 'main-modal-container' : ''}`}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container >
          <div className={"drawer-wrapper"}>
            {isLoader && <LoaderCustom />}
            <form
            //  onSubmit={handleSubmit(submitForm)}
            >
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
              </Row>
              <Row className="pl-3">
                {
                  (type === VBCTypeId || type === NCCTypeId) && <Col md="12"> <TextFieldHookForm
                    label={`${vendorLabel} (Code)`}
                    name={"Vendor"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={copyCostingData.VendorName}
                    className=""
                    customClassName={"withBorder mb-0"}
                    errors={errors.Vendor}
                    disabled={true}
                  />
                  </Col>
                }
                {
                  (type === CBCTypeId) && <Col md="12"> <TextFieldHookForm
                    label={"Customer (Code)"}
                    name={"customer"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={copyCostingData.Customer}
                    className=""
                    customClassName={"withBorder mb-0"}
                    errors={errors.customer}
                    disabled={true}
                  />
                  </Col>
                }

                <Col md="12">
                  <TextFieldHookForm
                    label={`${costingTypeId === VBCTypeId || costingTypeId === NCCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}`}
                    name={"plant"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={type === ZBCTypeId ? copyCostingData.PlantName : copyCostingData.DestinationPlantName}
                    className=""
                    customClassName={"withBorder mb-0"}
                    errors={errors.plant}
                    disabled={true}
                  />
                </Col>
                <Col md="12">
                  <TextFieldHookForm
                    label={"Costing Id"}
                    name={"costingId"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={copyCostingData.SelectedCostingVersion.label}
                    className=""
                    customClassName={"withBorder mb-0"}
                    errors={errors.costingId}
                    disabled={true}
                  />
                </Col>
              </Row >
              <hr />
              <Row className="pl-3 align-items-center">
                <Col md="6">
                  <div className="left-border">{"To:"}</div>
                </Col>
                <Col md="12">
                  {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                    <input
                      type="radio"
                      name="costingHead"
                      className='zero-based'
                      id='zeroBased'
                      checked={
                        costingTypeId === ZBCTypeId ? true : false
                      }
                      onClick={() =>
                        onPressRadioButton(ZBCTypeId)
                      }
                    />{" "}
                    <span>Zero Based</span>
                  </Label>}
                  {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                    <input
                      type="radio"
                      name="costingHead"
                      className='vendor-based'
                      id='vendorBased'
                      checked={
                        costingTypeId === VBCTypeId ? true : false
                      }
                      onClick={() =>
                        onPressRadioButton(VBCTypeId)
                      }
                    />{" "}
                    <span>{vendorLabel} Based</span>
                  </Label>}
                  {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                    <input
                      type="radio"
                      name="costingHead"
                      className='customer-based'
                      id='customerBased'
                      checked={
                        costingTypeId === CBCTypeId ? true : false
                      }
                      onClick={() =>
                        onPressRadioButton(CBCTypeId)
                      }
                    />{" "}
                    <span>Customer Based</span>
                  </Label>}
                  <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                    <input
                      type="radio"
                      name="costingHead"
                      className='vendor-based'
                      id='vendorBased'
                      checked={
                        costingTypeId === NCCTypeId ? true : false
                      }
                      onClick={() =>
                        onPressRadioButton(NCCTypeId)
                      }
                    />{" "}
                    <span>New Component Based</span>
                  </Label>
                </Col>
              </Row>

              {
                (costingTypeId === VBCTypeId || costingTypeId === NCCTypeId) && (
                  <Row className="pl-3">
                    <div className="form-group mb-1 col-md-12">
                      <SearchableSelectHookForm
                        label={`${vendorLabel} (Code)`}
                        name={"toVendor"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={costingTypeId === VBCTypeId ? vendorName : nccVendor}
                        mandatory={true}
                        handleChange={handleToVendorName}
                        errors={errors.toVendor}
                        disabled={false}
                      />
                    </div>
                  </Row>
                )
              }
              {
                costingTypeId === CBCTypeId && (
                  <Row className="pl-3">
                    <div className="form-group mb-1 col-md-12">
                      <SearchableSelectHookForm
                        label={"Customer (Code)"}
                        name={"toCustomer"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        // defaultValue={customer.length !== 0 ? customer : ""}
                        options={customer}
                        mandatory={false}
                        handleChange={handleCustomerChange}
                        errors={errors.toCustomer}
                      />
                    </div>
                  </Row >
                )
              }
              {
                ((costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) || (costingTypeId === VBCTypeId || costingTypeId === NCCTypeId || costingTypeId === ZBCTypeId)) && (
                  <Row className="pl-3">
                    <div className="form-group mb-2 col-md-12">
                      <SearchableSelectHookForm
                        label={`${costingTypeId === VBCTypeId || costingTypeId === NCCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}`}
                        name={"toPlant"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //defaultValue={plant.length !== 0 ? plant : ''}
                        options={costingTypeId === ZBCTypeId ? plantDropDownList : costingTypeId === CBCTypeId ? customerPlant : costingTypeId === VBCTypeId ? destinationPlant : nccPlant}
                        mandatory={true}
                        handleChange={handlePlantChange}
                        errors={errors.toPlant}
                      />
                    </div>
                  </Row>
                )
              }
              <Row className="pl-3">
                <span className="d-inline-block">
                  <label
                    className={`custom-checkbox mb-4`}
                    onChange={(e) => categoryTypeOnChange(e)}
                    selected={isInfoCategorySelected}
                    id={'category'}
                  >
                    Sub Contracting
                    <input
                      type="checkbox"
                    />
                    <span
                      className=" before-box"
                      onChange={(e) => categoryTypeOnChange(e)}
                      selected={isInfoCategorySelected}
                    />
                  </label>
                  <TooltipCustom
                    disabledIcon={false}
                    id={`category`}
                    tooltipText={infoCategory && `If checkbox is selected then category will be ${infoCategory[0]?.Text}, otherwise category will be ${infoCategory[1]?.Text}.`}
                  />
                </span>
              </Row>
              {/* //ss */}
              <div className="form-group mb-0 col-md-12 pl-2 pr-4 ml-1 mr-2">
                <div className="inputbox date-section">
                  <DatePickerHookForm
                    name={`EffectiveDate`}
                    label={'Effective Date'}
                    selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                    handleChange={(date) => {
                      handleEffectiveDateChange(date)
                    }}
                    //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
                    rules={{ required: true }}
                    Controller={Controller}
                    control={control}
                    register={register}
                    showMonthDropdown
                    showYearDropdown
                    dateFormat="DD/MM/YYYY"
                    minDate={new Date(minDate)}
                    //maxDate={new Date()}
                    placeholder="Select date"
                    customClassName="withBorder"
                    className="withBorder"
                    autoComplete={"off"}
                    disabledKeyboardNavigation
                    onChangeRaw={(e) => e.preventDefault()}
                    disabled={false}
                    mandatory={true}
                    errors={errors.EffectiveDate}
                  />
                </div>
              </div>
              <Row className="justify-content-between my-3">
                <div className="col-sm-12 text-right">

                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                    disabled={isDisable}
                  >
                    <div className={'cancel-icon'}></div>
                    {"Cancel"}
                  </button>

                  <button
                    type="button"
                    className="submit-button save-btn"
                    onClick={(submitForm)}
                    disabled={isDisable}
                  >
                    <div className={'save-icon'}></div>
                    {"Copy"}
                  </button>

                </div>
              </Row>
            </form >
          </div >

        </Container >
      </Drawer >
      {
        showPopup && <PopupMsgWrapper className={'main-modal-container'} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} disablePopup={disablePopup} message={`${!msgObj.IsRMExist ? 'Raw Material,' : ''}${!msgObj.IsOperationExist ? 'Operation,' : ''}${!msgObj.IsBOPExist ? 'BOP,' : ''}${!msgObj.IsProcessExist ? 'Process,' : ''}${!msgObj.IsOtherOperationExist ? `Other Operation is not available for the selected ${vendorLabel}. Do you still wish to continue ?` : ` is not available for the selected ${vendorLabel}. Do you still wish to continue ?`}`} />
      }
    </>
  );
}

export default React.memo(CopyCosting)
