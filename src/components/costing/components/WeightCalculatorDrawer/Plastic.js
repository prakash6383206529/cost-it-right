import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalciData } from '../../actions/CostWorking'
import { KG } from '../../../../config/constants'
import { toastr } from 'react-redux-toastr'

function Plastic(props) {
  const { item, rmRowData } = props
  const { CostingPartDetails } = item
  const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = CostingPartDetails

  let totalRM
  //IF MASTER BATCH IS ADDED OUTSIDE THE CALCULATOR THEN RM RATE WILL BE SUM OF RMRATE AND MASTERBATCH RATE (AFTER PERCENTAGE)
  if (IsApplyMasterBatch) {
    const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
    const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
    totalRM = RMRatePlusMasterBatchRate
  } else {
    totalRM = Number(rmRowData.RMRate)
  }

  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext)
  const dispatch = useDispatch()

  const defaultValues = {
    netWeight: WeightCalculatorRequest && WeightCalculatorRequest.NetWeight !== undefined ? WeightCalculatorRequest.NetWeight : '',
    runnerWeight: WeightCalculatorRequest && WeightCalculatorRequest.RunnerWeight !== undefined ? WeightCalculatorRequest.RunnerWeight : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.NetRMCost !== undefined ? WeightCalculatorRequest.NetRMCost : '',

  }

  const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
  const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
  const [dataToSend, setDataToSend] = useState({
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.NetRMCost !== undefined ? WeightCalculatorRequest.NetRMCost : '',
  })



  const { register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  // if (WeightCalculatorRequest &&
  //   WeightCalculatorRequest.LossData !== undefined) {
  //   setTableVal(WeightCalculatorRequest.LossData)
  // }
  const fieldValues = useWatch({
    control,
    name: ['netWeight', 'runnerWeight', 'finishedWeight'],
  })

  const dropDown = [
    {
      label: 'Processing Loss',
      value: 'processingLost',
    },
    {
      label: 'Burning Loss',
      value: 'burningLoss',
    },
  ]

  useEffect(() => {
    calculateGrossWeight()
    calculateRemainingCalculation(lostWeight)
  }, [fieldValues])



  /**
   * @method calculateGrossWeight
   * @description For Calculating gross weight
   */
  const calculateGrossWeight = () => {

    const netWeight = Number(getValues('netWeight'))
    const runnerWeight = Number(getValues('runnerWeight'))

    const grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + lostWeight
    setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    let updatedValue = dataToSend
    updatedValue.grossWeight = grossWeight
    setDataToSend(updatedValue)
  }
  /**
   * @method calculateRemainingCalculation
   * @description Calculating finished weight,scrap weight,RM cost, scrap cost,material cost
   */
  const calculateRemainingCalculation = (lostSum = 0) => {


    let scrapWeight = 0

    const netWeight = Number(getValues('netWeight')) // THIS IS FIRST GROSS WEIGHT
    const runnerWeight = Number(getValues('runnerWeight'))
    const finishedWeight = Number(getValues('finishedWeight'))


    const grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + lostSum //THIS IS FINAL GROSS WEIGHT -> FIRST GROSS WEIGHT + RUNNER WEIGHT +NET LOSS WEIGHT
    // const finishedWeight = checkForNull(grossWeight) + checkForNull(lostSum)
    if (finishedWeight > grossWeight) {
      toastr.warning('Finish Weight should not be greater than gross weight')
      return false
    }
    if (finishedWeight !== 0) {

      scrapWeight = checkForNull(grossWeight) - checkForNull(finishedWeight) //FINAL GROSS WEIGHT - FINISHED WEIGHT

    }
    const rmCost = checkForNull(grossWeight) * checkForNull(totalRM) // FINAL GROSS WEIGHT * RMRATE (HERE RM IS RMRATE +MAMSTER BATCH (IF INCLUDED))
    const scrapCost = checkForNull(scrapWeight) * checkForNull(rmRowData.ScrapRate)
    const materialCost = checkForNull(rmCost) - checkForNull(scrapCost)

    const updatedValue = dataToSend
    updatedValue.scrapWeight = scrapWeight
    updatedValue.totalGrossWeight = grossWeight
    updatedValue.rmCost = rmCost
    updatedValue.scrapCost = scrapCost
    updatedValue.materialCost = materialCost

    setDataToSend(updatedValue)
    // setTimeout(() => {

    //   setDataToSend({ ...dataToSend, totalGrossWeight: grossWeight, scrapWeight: scrapWeight, rmCost: rmCost, scrapCost: scrapCost, materialCost: materialCost })
    // }, 500);

    setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput)) // SETING FINAL GROSS WEIGHT VALUE
    setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('materialCost', checkForDecimalAndNull(materialCost, getConfigurationKey().NoOfDecimalForPrice))
    setLostWeight(lostSum)

  }

  const onSubmit = () => {
    let obj = {}
    obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
    obj.IsChangeApplied = true //Need to make it dynamic
    obj.PartId = costData.PartId
    obj.RawMaterialId = rmRowData.RawMaterialId
    obj.CostingId = costData.CostingId
    obj.TechnologyId = costData.TechnologyId
    obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
    obj.RawMaterialName = rmRowData.RMName
    obj.RawMaterialType = rmRowData.MaterialType
    obj.BasicRatePerUOM = totalRM
    obj.ScrapRate = rmRowData.ScrapRate
    obj.NetLandedCost = dataToSend.grossWeight * totalRM - (dataToSend.grossWeight - getValues('finishedWeight')) * rmRowData.ScrapRate
    obj.PartNumber = costData.PartNumber
    obj.TechnologyName = costData.TechnologyName
    obj.Density = rmRowData.Density
    obj.UOMId = rmRowData.UOMId
    obj.UOM = rmRowData.UOM
    obj.UOMForDimension = KG
    obj.NetWeight = getValues('netWeight')
    obj.RunnerWeight = getValues('runnerWeight')
    obj.GrossWeight = dataToSend.grossWeight
    obj.FinishWeight = getValues('finishedWeight')
    obj.ScrapWeight = dataToSend.scrapWeight
    obj.RMCost = dataToSend.rmCost
    obj.ScrapCost = dataToSend.scrapCost
    obj.NetRMCost = dataToSend.materialCost
    obj.LoggedInUserId = loggedInUserId()
    let tempArr = []
    tableVal && tableVal.map(item => {
      tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000" })
    })
    obj.LossOfTypeDetails = tempArr
    obj.NetLossWeight = lostWeight

    dispatch(saveRawMaterialCalciData(obj, res => {
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        toastr.success("Calculation saved successfully")
        props.toggleDrawer('', obj)
      }
    }))
    // props.toggleDrawer('', obj)
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
  return (
    <Fragment>
      <Row>

        <form noValidate className="form"
        // onSubmit={handleSubmit(onSubmit)}
        >
          <Col md="12">
            <div className="costing-border px-4">
              <Row>
                <Col md="12" className={'mt25'}>
                  <div className="header-title">
                    <h5>{'Input Weight Calculator:'}</h5>
                  </div>
                </Col>
              </Row>

              <Row className={''}>
                <Col md="3" >
                  <TextFieldHookForm
                    label={`Gross Weight(Kg)`}
                    name={'netWeight'}
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
                    errors={errors.netWeight}
                    disabled={false}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Runner Weight`}
                    name={'runnerWeight'}
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
                    errors={errors.runnerWeight}
                    disabled={false}
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
              </Row>

              <LossStandardTable
                dropDownMenu={dropDown}
                calculation={calculateRemainingCalculation}
                weightValue={Number(getValues('netWeight'))}
                netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                tableValue={tableData}
              />

              <Row className={'mt25'}>
                <Col md="3" >
                  <TextFieldHookForm
                    label={`Total Gross Weight(Kg)`}
                    name={'grossWeight'}
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
                    errors={errors.grossWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3" >
                  <TextFieldHookForm
                    label={`Finished Weight(Kg)`}
                    name={'finishedWeight'}
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
                    errors={errors.finishedWeight}
                    disabled={false}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Scrap Weight(Kg)`}
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
                    defaultValue={WeightCalculatorRequest &&
                      WeightCalculatorRequest.ScrapWeight !== undefined
                      ? WeightCalculatorRequest.ScrapWeight
                      : ''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`RM Cost`}
                    name={'rmCost'}
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
                    errors={errors.rmCost}
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
                    // rules={{
                    //   required: false,
                    //   pattern: {
                    //     value: /^[0-9\b]+$/i,
                    //     //value: /^[0-9]\d*(\.\d+)?$/i,
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

                <Col md="3">
                  <TextFieldHookForm
                    // Confirm this name from tanmay sir
                    label={`Net RM Cost`}
                    name={'materialCost'}
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
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.materialCost}
                    disabled={true}
                  />
                </Col>
              </Row>

            </div>
          </Col>
          <div className="mt25 col-md-12 text-right">
            <button
              onClick={onCancel} // Need to change this cancel functionality
              type="submit"
              value="CANCEL"
              className="reset mr15 cancel-btn"
            >
              <div className={'cross-icon'}>
                <img
                  src={require('../../../../assests/images/times.png')}
                  alt="cancel-icon.jpg"
                />
              </div>
                CANCEL
              </button>
            <button
              type="submit"
              // disabled={isSubmitted ? true : false}
              onClick={onSubmit} className="submit-button save-btn">
              <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
              {'SAVE'}
            </button>
          </div>
        </form>

      </Row>
    </Fragment>
  )
}

export default Plastic
