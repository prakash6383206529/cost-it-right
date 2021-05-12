import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper'
import LossStandardTable from './LossStandardTable'

function Plastic(props) {
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest

  const defaultValues = {
    netWeight: WeightCalculatorRequest && WeightCalculatorRequest.NetWeight !== undefined ? WeightCalculatorRequest.NetWeight : '',
    runnerWeight: WeightCalculatorRequest && WeightCalculatorRequest.RunnerWeight !== undefined ? WeightCalculatorRequest.RunnerWeight : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishedWeight !== undefined ? WeightCalculatorRequest.FinishedWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RmCost !== undefined ? WeightCalculatorRequest.RmCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.MaterialCost !== undefined ? WeightCalculatorRequest.MaterialCost : '',

  }

  const [tableVal, setTableVal] = useState([])
  const [lostWeight, setLostWeight] = useState(0)
  const { rmRowData } = props
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
    name: ['netWeight', 'runnerWeight'],
  })

  const dropDown = [
    {
      label: 'Purge Loss',
      value: 'purgeLoss',
    },
    {
      label: 'Burning Loss',
      value: 'burningLoss',
    },
  ]

  useEffect(() => {
    calculateGrossWeight()
    // calculateRemainingCalculation(WeightCalculatorRequest ? WeightCalculatorRequest.LostSum : 0)
  }, [fieldValues])



  /**
   * @method calculateGrossWeight
   * @description For Calculating gross weight
   */
  const calculateGrossWeight = () => {

    const netWeight = Number(getValues('netWeight'))
    const runnerWeight = Number(getValues('runnerWeight'))
    if (!netWeight || !runnerWeight) {
      return ''
    }
    const grossWeight = netWeight + runnerWeight
    setValue('grossWeight', grossWeight)
  }
  /**
   * @method calculateRemainingCalculation
   * @description Calculating finished weight,scrap weight,RM cost, scrap cost,material cost
   */
  const calculateRemainingCalculation = (lostSum = 0) => {
    console.log("HOW MANY TIMES COMING ?");
    console.log('lostSum: ', lostSum);

    const grossWeight = Number(getValues('grossWeight'))
    const netWeight = Number(getValues('netWeight'))
    const finishedWeight = checkForDecimalAndNull(grossWeight + lostSum, trim)
    const scrapWeight = checkForDecimalAndNull(finishedWeight - netWeight, trim)
    const rmCost = checkForDecimalAndNull(finishedWeight * rmRowData.RMRate, trim) // TO DO Ask from Kamal sir which key to use for costing(transaction/PO)
    const scrapCost = checkForDecimalAndNull(scrapWeight * rmRowData.ScrapRate, trim)
    const materialCost = checkForDecimalAndNull(rmCost - scrapCost, trim)

    setValue('finishedWeight', finishedWeight)
    setValue('scrapWeight', scrapWeight)
    setValue('rmCost', rmCost)
    setValue('scrapCost', scrapCost)
    setValue('materialCost', materialCost)
    setLostWeight(lostSum)
  }
  const onSubmit = () => {
    let obj = {}
    obj.NetWeight = getValues('netWeight')
    obj.RunnerWeight = getValues('runnerWeight')
    obj.GrossWeight = getValues('grossWeight')
    obj.FinishedWeight = getValues('finishedWeight')
    obj.ScrapWeight = getValues('scrapWeight')
    obj.RmCost = getValues('rmCost')
    obj.ScrapCost = getValues('scrapCost')
    obj.MaterialCost = getValues('materialCost')
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
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form"
          // onSubmit={handleSubmit(onSubmit)}
          >
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
                        label={`Net Weight(Kg)`}
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
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Runner Weight`}
                        name={'runnerWeight'}
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
                        errors={errors.runnerWeight}
                        disabled={false}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Gross Weight`}
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
                </Col>
                <LossStandardTable
                  dropDownMenu={dropDown}
                  calculation={calculateRemainingCalculation}
                  weightValue={Number(getValues('grossWeight'))}
                  netWeight={WeightCalculatorRequest ? WeightCalculatorRequest : ''}
                  sendTable={WeightCalculatorRequest ? WeightCalculatorRequest.LossData : []}
                  tableValue={tableData}
                />
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Finished Weight`}
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
                        disabled={true}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
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
                  </Row>
                  <Row className={'mt15'}>
                    <Col md="2" className="m-height-44-label-inside">
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
                    <Col md="2" className="m-height-44-label-inside">
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

                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        // Confirm this name from tanmay bhaiya
                        label={`RM Cost`}
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
                </Col>
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
                onClick={onSubmit}
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

export default Plastic
