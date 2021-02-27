import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import Switch from 'react-switch'
import {
  checkForDecimalAndNull,
  checkForNull,
  getWeightOfSheet,
  getWeightOfPart,
  getWeightOfScrap,
  getNetSurfaceArea,
  getNetSurfaceAreaBothSide,
} from '../../../../../helper'
import { getUOMListByUnitType } from '../../../../../actions/Common'

function Pipe(props) {

  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
  const isEditFlag = props.isEditFlag
  console.log(props, ' 3 page props')

  const defaultValues = {
    //UOMDimension: WeightCalculatorRequest && WeightCalculatorRequest.UOMDimension !== undefined ? WeightCalculatorRequest.UOMDimension : '',
    OuterDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== undefined ? WeightCalculatorRequest.OuterDiameter : '',
    Thickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== undefined ? WeightCalculatorRequest.Thickness : '',
    InnerDiameter: WeightCalculatorRequest && WeightCalculatorRequest.InnerDiameter !== undefined ? WeightCalculatorRequest.InnerDiameter : '',
    SheetLength: WeightCalculatorRequest && WeightCalculatorRequest.SheetLength !== undefined ? WeightCalculatorRequest.SheetLength : '',
    PartLength: WeightCalculatorRequest && WeightCalculatorRequest.PartLength !== undefined ? WeightCalculatorRequest.PartLength : '',
    NumberOfPartsPerSheet: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPartsPerSheet !== undefined ? WeightCalculatorRequest.NumberOfPartsPerSheet : '',
    ScrapLength: WeightCalculatorRequest && WeightCalculatorRequest.ScrapLength !== undefined ? WeightCalculatorRequest.ScrapLength : '',
    WeightofSheet: WeightCalculatorRequest && WeightCalculatorRequest.WeightofSheet !== undefined ? WeightCalculatorRequest.WeightofSheet : '',
    WeightofPart: WeightCalculatorRequest && WeightCalculatorRequest.WeightofPart !== undefined ? WeightCalculatorRequest.WeightofPart : '',
    WeightofScrap: WeightCalculatorRequest && WeightCalculatorRequest.WeightofScrap !== undefined ? WeightCalculatorRequest.WeightofScrap : '',
    NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest.NetSurfaceArea !== undefined ? WeightCalculatorRequest.NetSurfaceArea : '',
    GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
    FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const [isOneSide, setIsOneSide] = useState(false)
  const [UOMDimension, setUOMDimension] = useState(
    WeightCalculatorRequest && WeightCalculatorRequest.UOMDimensionId
      ? {
        label: WeightCalculatorRequest.UOMDimensionLabel,
        value: WeightCalculatorRequest.UOMDimensionId,
      }
      : [],
  )

  const fieldValues = useWatch({
    control,
    name: ['OuterDiameter', 'Thickness', 'SheetLength', 'PartLength'],
  })

  const dispatch = useDispatch()

  useEffect(() => {
    //UNIT TYPE ID OF DIMENSIONS
    const UnitTypeId = '305e0874-0a2d-4eab-9781-4fe397b16fcc'
    dispatch(getUOMListByUnitType(UnitTypeId, (res) => { }))
  }, [])

  const UOMSelectListByUnitType = useSelector(
    (state) => state.comman.UOMSelectListByUnitType,
  )

  useEffect(() => {
    calculateInnerDiameter()
    calculateNumberOfPartPerSheet()
    calculateLengthofScrap()
    calculateWeightOfSheet()
    calculateWeightOfPart()
    calculateWeightOfScrap()
    calculateNetSurfaceArea()
    setGrossWeight()
    setFinishWeight()
  }, [fieldValues])

  useEffect(() => {
    if (isOneSide) {
      setNetSurfaceAreaBothSide()
    } else {
      calculateNetSurfaceArea()
    }
  }, [isOneSide])

  /**
   * @method calculateInnerDiameter
   * @description CALCULATE INNER DIAMETER
   */
  const calculateInnerDiameter = () => {
    const ID = checkForNull(fieldValues.OuterDiameter) - 2 * checkForNull(fieldValues.Thickness);
    setValue('InnerDiameter', ID)
  }

  /**
   * @method calculateNumberOfPartPerSheet
   * @description CALCULATE NUMBER OF PARTS PER SHEET
   */
  const calculateNumberOfPartPerSheet = () => {
    if (fieldValues.SheetLength === '') {
      setValue('NumberOfPartsPerSheet', 1)
    } else {
      const NumberParts = checkForNull(fieldValues.SheetLength / fieldValues.PartLength)
      setValue('NumberOfPartsPerSheet', parseInt(NumberParts))
    }
  }

  /**
   * @method calculateLengthofScrap
   * @description CALCULATE LENGTH OF SCRAP
   */
  const calculateLengthofScrap = () => {
    const scrapLength = checkForNull(fieldValues.SheetLength % fieldValues.PartLength)
    setValue('ScrapLength', parseInt(scrapLength))
  }

  /**
   * @method calculateWeightOfSheet
   * @description CALCULATE WEIGHT OF SHEET
   */
  const calculateWeightOfSheet = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: getValues('InnerDiameter'),
      SheetLength: getValues('SheetLength'),
      ExtraVariable: '',
    }
    const SheetWeight = getWeightOfSheet(data)
    setValue('WeightofSheet', checkForDecimalAndNull(SheetWeight, 2))
  }

  /**
   * @method calculateWeightOfPart
   * @description CALCULATE WEIGHT OF PART
   */
  const calculateWeightOfPart = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: getValues('InnerDiameter'),
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }
    const PartWeight = getWeightOfPart(data)
    setValue('WeightofPart', checkForDecimalAndNull(PartWeight, 2))
  }

  /**
   * @method calculateWeightOfScrap
   * @description CALCULATE WEIGHT OF SCRAP
   */
  const calculateWeightOfScrap = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: getValues('InnerDiameter'),
      ScrapLength: getValues('ScrapLength'),
      ExtraVariable: '',
    }
    const ScrapWeight = getWeightOfScrap(data)
    setValue('WeightofScrap', checkForDecimalAndNull(ScrapWeight, 2))
  }

  /**
   * @method calculateNetSurfaceArea
   * @description CALCULATE NET SURFACE AREA
   */
  const calculateNetSurfaceArea = () => {
    const data = {
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: getValues('InnerDiameter'),
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }
    const NetSurfaceArea = getNetSurfaceArea(data)
    setValue('NetSurfaceArea', checkForDecimalAndNull(NetSurfaceArea, 2))
  }

  /**
   * @method setNetSurfaceAreaBothSide
   * @description CALCULATE NET SURFACE AREA BOTH SIDE
   */
  const setNetSurfaceAreaBothSide = () => {
    const data = {
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: getValues('InnerDiameter'),
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }
    const NetSurfaceAreaBothSide = getNetSurfaceAreaBothSide(data)
    setValue('NetSurfaceArea', checkForDecimalAndNull(NetSurfaceAreaBothSide, 2))
  }

  /**
   * @method setGrossWeight
   * @description SET GROSS WEIGHT
   */
  const setGrossWeight = () => {
    const WeightofPart = getValues('WeightofPart')
    setValue('GrossWeight', checkForDecimalAndNull(WeightofPart, 2))
  }

  /**
   * @method setFinishWeight
   * @description SET FINISH WEIGHT
   */
  const setFinishWeight = () => {
    const FinishWeight = checkForNull(
      getValues('WeightofPart') -
      checkForNull(
        getValues('WeightofPart') / getValues('NumberOfPartsPerSheet'),
      ),
    )
    setValue('FinishWeight', checkForDecimalAndNull(FinishWeight, 2))
  }

  /**
   * @method onSideToggle
   * @description SIDE TOGGLE
   */
  const onSideToggle = () => {
    setIsOneSide(!isOneSide)
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  const renderListing = (label) => {
    const temp = []

    if (label === 'UOM') {
      UOMSelectListByUnitType &&
        UOMSelectListByUnitType.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }

  /**
   * @method handleUOMChange
   * @description  USED TO HANDLE UOM CHANGE
   */
  const handleUOMChange = (newValue) => {
    if (newValue && newValue !== '') {
      setUOMDimension(newValue)
    } else {
      setUOMDimension([])
    }
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    props.toggleDrawer('')
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => {
    console.log('values >>>', values)
    let data = {
      LayoutingType: 'PIPE',
      CostingWeightCalculatioId: '',
      UOMDimensionId: UOMDimension ? UOMDimension.value : '',
      UOMDimensionLabel: UOMDimension ? UOMDimension.label : '',
      UOMDimension: values.UOMDimension,
      OuterDiameter: values.OuterDiameter,
      Thickness: values.Thickness,
      InnerDiameter: values.InnerDiameter,
      SheetLength: values.SheetLength,
      PartLength: values.PartLength,
      NumberOfPartsPerSheet: values.NumberOfPartsPerSheet,
      ScrapLength: values.ScrapLength,
      WeightofSheet: values.WeightofSheet,
      WeightofPart: values.WeightofPart,
      WeightofScrap: values.WeightofScrap,
      Side: isOneSide,
      IsOneSide: isOneSide,
      NetSurfaceArea: values.NetSurfaceArea,
      GrossWeight: values.GrossWeight,
      FinishWeight: values.FinishWeight,
    }
    props.toggleDrawer('', data)
  }

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row>
            <Col md="12" className={'mt25'}>
              <HeaderTitle
                title={'Raw Material'}
                customClass={'underLine-title'}
              />
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Row className={'mt15'}>
              <Col md="3">
                <SearchableSelectHookForm
                  label={'UOM for Dimension'}
                  name={'UOMDimension'}
                  placeholder={'-Select-'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                  options={renderListing('UOM')}
                  mandatory={true}
                  handleChange={handleUOMChange}
                  errors={errors.UOMDimension}
                  disabled={!isEditFlag}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Outer Diameter${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'OuterDiameter'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={true}
                  rules={{
                    required: true,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.OuterDiameter}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Thickness${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'Thickness'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={true}
                  rules={{
                    required: true,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.Thickness}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Inner Diameter${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'InnerDiameter'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    // pattern: {
                    //   value: /^[0-9]*$/i,
                    //   message: 'Invalid Number.'
                    // },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.InnerDiameter}
                  disabled={true}
                />
              </Col>
            </Row>

            <Row>
              <Col md="3">
                <TextFieldHookForm
                  label={`Length of Sheet${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'SheetLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.SheetLength}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Length of Part${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'PartLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={true}
                  rules={{
                    required: true,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.PartLength}
                  disabled={false}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="No. of Parts/Sheet"
                  name={'NumberOfPartsPerSheet'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.NumberOfPartsPerSheet}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Length of Scrap${Object.keys(UOMDimension).length > 0 ? '(' + UOMDimension.label + ')' : ''}`}
                  name={'ScrapLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.ScrapLength}
                  disabled={true}
                />
              </Col>
            </Row>

            <Row className={'mt15'}>
              <Col md="3">
                <TextFieldHookForm
                  label={`Weight of Sheet(Gm)`}
                  name={'WeightofSheet'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.WeightofSheet}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Weight of Part(Gm)`}
                  name={'WeightofPart'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.WeightofPart}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Weight of Scrap(Gm)`}
                  name={'WeightofScrap'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.',
                    },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.WeightofScrap}
                  disabled={true}
                />
              </Col>
            </Row>

            <Row className={'mt15'}>
              <Col md="12">
                <HeaderTitle
                  title={'Surface Area'}
                  customClass={'underLine-title'}
                />
              </Col>
            </Row>

            <Row className={'mt15'}>
              <Col md="4" className="switch mb15">
                <label className="switch-level">
                  <div className={'left-title'}>{'One Side'}</div>
                  <Switch
                    onChange={onSideToggle}
                    checked={isOneSide}
                    id="normal-switch"
                    disabled={false}
                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#4DC771"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className={'right-title'}>{'Both Side'}</div>
                </label>
              </Col>

              <hr />
            </Row>

            <Row>
              <Col md="4">
                <TextFieldHookForm
                  label="Net Surface Area"
                  name={'NetSurfaceArea'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    // pattern: {
                    //   value: /^[0-9]*$/i,
                    //   message: 'Invalid Number.'
                    // },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.NetSurfaceArea}
                  disabled={true}
                />
              </Col>
              <Col md="4">
                <TextFieldHookForm
                  label="Gross Weight"
                  name={'GrossWeight'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    // pattern: {
                    //   value: /^[0-9]*$/i,
                    //   message: 'Invalid Number.'
                    // },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.GrossWeight}
                  disabled={true}
                />
              </Col>
              <Col md="4">
                <TextFieldHookForm
                  label="Finish Weight"
                  name={'FinishWeight'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    // pattern: {
                    //   value: /^[0-9]*$/i,
                    //   message: 'Invalid Number.'
                    // },
                    // maxLength: 4,
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.FinishWeight}
                  disabled={true}
                />
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mt25">
              <div className="col-sm-12 text-right bluefooter-butn">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button>
                <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                  {'Save'}
                </button>
              </div>
            </Row>
          </form>
        </div>
      </div>
    </>
  )
}

export default Pipe
