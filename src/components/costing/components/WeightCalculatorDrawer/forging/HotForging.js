import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'
import LossStandardTable from '../LossStandardTable'

function HotForging(props) {
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const defaultValues = {
    forgeWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.ForgeWeight !== undefined
      ? WeightCalculatorRequest.ForgeWeight
      : '',
    inputWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.InputWeight !== undefined
      ? WeightCalculatorRequest.InputWeight
      : '',
    slugWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.SlugWeight !== undefined
      ? WeightCalculatorRequest.SlugWeight
      : '',
    scrapWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.ScrapWeight !== undefined
      ? WeightCalculatorRequest.ScrapWeight
      : '',
    scrapCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.ScrapCost !== undefined
      ? WeightCalculatorRequest.ScrapCost
      : '',
    finishedWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.FinishedWeight !== undefined
      ? WeightCalculatorRequest.FinishedWeight
      : '',
    machiningStock: WeightCalculatorRequest &&
      WeightCalculatorRequest.MachiningStock !== undefined
      ? WeightCalculatorRequest.MachiningStock
      : ''
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: ['finishedWeight', 'machiningStock'],
  })
  const [inputWeightValue, setInputWeightValue] = useState(0)
  const [lostWeight, setLostWeight] = useState(0)
  const { rmRowData } = props
  const [tableVal, setTableVal] = useState([])
  useEffect(() => {
    calculateForgeWeight()
    calculateSacleLoss()
    calculateInputWeight()
    calculateSlugWeight()
    calculateScrapWeight()
    calculateScrapCost()
  }, [fieldValues])

  /**
   * @method calculateForgeWeight
   * @description calculate forge weight
   */
  const calculateForgeWeight = () => {
    const finishedWeight = Number(getValues('finishedWeight'))
    const machiningStock = Number(getValues('machiningStock'))
    if (!finishedWeight || !machiningStock) {
      return ''
    }
    const forgeWeight = checkForDecimalAndNull(
      finishedWeight + machiningStock,
      trim,
    )
    setValue('forgeWeight', forgeWeight)
  }
  /**
   * @method calculateSacleLoss
   * @description calculating Sacle Loss
   */
  const calculateSacleLoss = () => {
    const forgeWeight = Number(getValues('forgeWeight'))
    const scaleLossPercent = 2 //Need to ask how to make it dynamic
    const sacleLoss = checkForDecimalAndNull(
      forgeWeight * scaleLossPercent,
      trim,
    )
    setValue('sacleLoss', sacleLoss)
  }


  /**
   * @method calculateInputWeight
   * @description Calculate Input Weight
   */

  const calculateInputWeight = (netLossWeight = 0) => {
    setLostWeight(netLossWeight)

    const forgeWeight = Number(getValues('forgeWeight'))
    const inputWeight = checkForDecimalAndNull(
      forgeWeight + netLossWeight,
      trim,
    )
    setValue('inputWeight', inputWeight)
    setInputWeightValue(inputWeight)
  }
  /**
   * @method calculateSlugWeight
   * @description Calculate Slug Weight
   */
  const calculateSlugWeight = () => {
    const barCutting = Number(getValues('barCutting'))
    const billetLoss = Number(getValues('billetLoss'))
    const inputWeight = Number(getValues('inputWeight'))

    const slugWeight = checkForDecimalAndNull(
      inputWeight - barCutting - billetLoss,
      trim,
    )
    setValue('slugWeight', slugWeight)
  }
  /**
   * @method calculateScrapWeight
   * @description Calculate Scrap Weight
   */
  const calculateScrapWeight = () => {
    const inputWeight = Number(getValues('inputWeight')) // Need to confirm Input RM weight is same as input weight
    const finishedWeight = Number(getValues('finishedWeight'))
    if (!finishedWeight || !inputWeight) {
      return ''
    }
    const scrapWeight = checkForDecimalAndNull(
      inputWeight - finishedWeight * 0.85,
      trim,
    )
    setValue('scrapWeight', scrapWeight)
  }
  /**
   * @method calculateScrapCost
   * @description Calculate Scrap Cost
   */
  const calculateScrapCost = () => {
    const scrapWeight = Number(getValues('scrapWeight'))
    const scrapCost = checkForDecimalAndNull(scrapWeight * rmRowData.ScrapRate, trim)
    setValue('scrapCost', scrapCost)
    //Need to confirm this formula
  }
  /**
   * @method onSubmit
   * @description Form submission Function
   */
  const onSubmit = (values) => {
    let obj = {}
    obj.ForgeWeight = getValues('forgeWeight')
    obj.InputWeight = getValues('inputWeight')
    obj.SlugWeight = getValues('slugWeight')
    obj.ScrapWeight = getValues('scrapWeight')
    obj.ScrapCost = getValues('scrapCost')
    obj.FinishedWeight = getValues('finishedWeight')
    obj.MachiningStock = getValues('machiningStock')
    obj.LossData = tableVal
    obj.LostSum = lostWeight
    props.toggleDrawer('', obj)
  }
  /**
   * @method onCancel
   * @description on cancel close the drawer
   */
  const onCancel = () => {
    props.toggleDrawer('')
  }

  const tableData = (value = []) => {

    setTableVal(value)
  }
  const dropDown = [
    {
      label: 'Scale Loss',
      value: 'scaleLoss',
    },
    {
      label: 'Trimming Loss',
      value: 'trimmingLoss',
    },
    {
      label: 'Billet Heating Loss',
      value: 'HeatingLoss',
    },
    {
      label: 'Bar Cutting Allowance',
      value: 'cuttingAllowance',
    },
  ]
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form">
            <Col md="12" className={'mt25'}>
              <div className="border pl-3 pr-3 pt-3">
                <Col md="10">
                  <div className="left-border">
                    {'Input Weight Calculator:'}
                  </div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Finished Weight`}
                        name={'finishedWeight'}
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
                        errors={errors.finishedWeight}
                        disabled={false}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Total Machining Stock`}
                        name={'machiningStock'}
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
                        errors={errors.machiningStock}
                        disabled={false}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Forge Weight`}
                        name={'forgeWeight'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.forgeWeight}
                        disabled={true}
                      />
                    </Col>
                    {/* <Col md="2">
                      <TextFieldHookForm
                        label={`Sacle Loss`}
                        name={'sacleLoss'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        // rules={{
                        //   required: false,
                        //   pattern: {
                        //     value: /^[0-9\b]+$/i,
                        //     //value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.sacleLoss}
                        disabled={false}
                      />
                    </Col> */}

                    {/* <Col md="2">
                      <TextFieldHookForm
                        label={`Trimming Loss`}
                        name={'trimmingLoss'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: false,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.trimmingLoss}
                        disabled={true}
                      />
                    </Col> */}
                    {/* <Col md="2">
                      <TextFieldHookForm
                        label={`Bar Cutting Allowance`}
                        name={'barCutting'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.barCutting}
                        disabled={true}
                      />
                    </Col> */}
                    {/* <Col md="2">
                      <TextFieldHookForm
                        label={`Billet Heating Loss`}
                        name={'billetLoss'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.billetLoss}
                        disabled={true}
                      />
                    </Col> */}
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Input Weight(UOM)`}
                        name={'inputWeight'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.inputWeight}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Slug Weight`}
                        name={'slugWeight'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.slugWeight}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Scrap Weight`}
                        name={'scrapWeight'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.scrapWeight}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Scrap Cost`}
                        name={'scrapCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.scrapCost}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>
                <LossStandardTable
                  dropDownMenu={dropDown}
                  calculation={calculateInputWeight}
                  weightValue={inputWeightValue}
                  netWeight={WeightCalculatorRequest ? WeightCalculatorRequest : ''}
                  sendTable={WeightCalculatorRequest ? WeightCalculatorRequest.LossData : []}
                  tableValue={tableData}
                />
              </div>
            </Col>
            <div className="mt25 col-md-12 text-right">
              <button
                onClick={onCancel} // Need to change this cancel functionality
                type="submit"
                value="CANCEL"
                className="reset mr15 cancel-btn"
              >
                <div className={'cancel-icon'}></div>
                CANCEL
              </button>
              <button
                type="submit"
                onClick={onSubmit}
                // disabled={isSubmitted ? true : false}
                className="btn-primary save-btn"
              >
                <div className={'check-icon'}>
                  <i class="fa fa-check" aria-hidden="true"></i>
                </div>
                {'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default HotForging
