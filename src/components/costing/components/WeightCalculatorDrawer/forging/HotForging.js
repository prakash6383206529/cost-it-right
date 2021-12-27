import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../../common/Toaster'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { KG, } from '../../../../../config/constants'

import {

  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
  loggedInUserId

} from '../../../../../helper'
import LossStandardTable from '../LossStandardTable'

function HotForging(props) {
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const defaultValues = {
    forgeWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.ForgedWeight !== undefined
      ? WeightCalculatorRequest.ForgedWeight
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
      WeightCalculatorRequest.FinishWeight !== undefined
      ? WeightCalculatorRequest.FinishWeight
      : '',
    machiningStock: WeightCalculatorRequest &&
      WeightCalculatorRequest.TotalMachiningStock !== undefined
      ? WeightCalculatorRequest.TotalMachiningStock
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

  const dispatch = useDispatch()
  const [inputWeightValue, setInputWeightValue] = useState(0)
  const [lostWeight, setLostWeight] = useState(0)
  const { rmRowData } = props
  const [tableVal, setTableVal] = useState([])
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext)
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
    setValue('forgeWeight', checkForDecimalAndNull(forgeWeight, initialConfiguration.NoOfDecimalForInputOutput))
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
    setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, initialConfiguration.NoOfDecimalForInputOutput))
  }
  /**
   * @method calculateScrapCost
   * @description Calculate Scrap Cost
   */
  const calculateScrapCost = () => {
    const scrapWeight = Number(getValues('scrapWeight'))
    const scrapCost = checkForDecimalAndNull(scrapWeight * rmRowData.ScrapRate, trim)
    setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
    //Need to confirm this formula
  }
  /**
   * @method onSubmit
   * @description Form submission Function
   */
  const onSubmit = (values) => {
    let obj = {}
    obj.LayoutType = 'Hot'
    obj.ForgedWeight = getValues('forgeWeight')
    obj.InputWeight = getValues('inputWeight')
    obj.SlugWeight = getValues('slugWeight')
    obj.ScrapWeight = getValues('scrapWeight')
    obj.ScrapCost = getValues('scrapCost')
    obj.FinishWeight = getValues('finishedWeight')
    obj.TotalMachiningStock = getValues('machiningStock')
    obj.LossOfTypeDetails = tableVal
    obj.LostSum = lostWeight
    obj.GrossWeight = getValues('forgeWeight')


    obj.CostingId = costData.CostingId
    obj.TechnologyId = costData.TechnologyId
    obj.PartId = costData.PartId
    obj.RawMaterialId = props.rmRowData.RawMaterialId
    obj.CostingRawMaterialDetailId = props.rmRowData.RawMaterialDetailId
    obj.RawMaterialName = props.rmRowData.RMName
    obj.RawMaterialType = props.rmRowData.MaterialType
    obj.BasicRatePerUOM = props.rmRowData.RMRate
    obj.ScrapRate = props.rmRowData.ScrapRate
    obj.PartNumber = costData.PartNumber
    obj.TechnologyName = costData.TechnologyName
    obj.UOMForDimension = KG
    obj.LoggedInUserId = loggedInUserId()
    obj.UOMId = props.rmRowData.UOMId
    obj.UOM = props.rmRowData.UOM
    obj.IsChangeApplied = true



    dispatch(saveRawMaterialCalciData(obj, res => {
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        props.toggleDrawer('', obj)
      }
    }))
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
      value: 5,
    },
    {
      label: 'Trimming Loss',
      value: 6,
    },
    {
      label: 'Billet Heating Loss',
      value: 7,
    },
    {
      label: 'Bar Cutting Allowance',
      value: 8,
    },
  ]
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form">
            <Col md="12" className={'mt25'}>
              <div className="border px-3 pt-3">
                <Row>
                  <Col md="10">
                    <div className="left-border">
                      {'Input Weight Calculator:'}
                    </div>
                  </Col>
                  <Col md="12">
                    <Row className={'mt15'}>
                      <Col md="3">
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

                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.finishedWeight}
                          disabled={props.CostingViewMode ? props.CostingViewMode : false}
                        />
                      </Col>
                      <Col md="3">
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
                          disabled={props.CostingViewMode ? props.CostingViewMode : false}
                        />
                      </Col>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Forge Weight`}
                          name={'forgeWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}

                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.forgeWeight}
                          disabled={true}
                        />
                      </Col>

                      <Col md="3">
                        <TextFieldHookForm
                          label={`Input Weight(UOM)`}
                          name={'inputWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}

                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.inputWeight}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Slug Weight`}
                          name={'slugWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}

                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.slugWeight}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Scrap Weight`}
                          name={'scrapWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}

                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.scrapWeight}
                          disabled={true}
                        />
                      </Col>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Scrap Cost`}
                          name={'scrapCost'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}

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
                </Row>
                <LossStandardTable
                  dropDownMenu={dropDown}
                  CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                  calculation={calculateInputWeight}
                  weightValue={inputWeightValue}
                  netWeight={WeightCalculatorRequest ? WeightCalculatorRequest : ''}
                  sendTable={WeightCalculatorRequest ? WeightCalculatorRequest.LossOfTypeDetails : []}
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
                disabled={props.CostingViewMode ? props.CostingViewMode : false}
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
