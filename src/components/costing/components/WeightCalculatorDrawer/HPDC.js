import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalciData } from '../../actions/CostWorking'
import { KG } from '../../../../config/constants'
import { toastr } from 'react-redux-toastr'


function HPDC(props) {
    const trimValue = getConfigurationKey()
    const trim = trimValue.NumberOfDecimalForWeightCalculation
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext)
    const dispatch = useDispatch()

    const defaultValues = {
        shotWeight: WeightCalculatorRequest && WeightCalculatorRequest.ShotWeight !== undefined ? WeightCalculatorRequest.ShotWeight : '',
        cavity: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfCavity !== undefined ? WeightCalculatorRequest.NumberOfCavity : '',
        burningPercent: WeightCalculatorRequest && WeightCalculatorRequest.BurningPercentage !== undefined ? WeightCalculatorRequest.BurningPercentage : '',
        burningValue: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? WeightCalculatorRequest.BurningValue : '',
        castingWeight: WeightCalculatorRequest && WeightCalculatorRequest.CastingWeight !== undefined ? WeightCalculatorRequest.CastingWeight : '',
        recovery: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? WeightCalculatorRequest.RecoveryPercentage : '',
        machiningScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.MachiningScrapWeight !== undefined ? WeightCalculatorRequest.MachiningScrapWeight : '',
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
        burningValue: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? WeightCalculatorRequest.BurningValue : '',
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
        rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
        scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
        materialCost: WeightCalculatorRequest && WeightCalculatorRequest.NetRMCost !== undefined ? WeightCalculatorRequest.NetRMCost : '',
    })

    const { rmRowData } = props



    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['shotWeight', 'burningPercent', 'cavity', 'finishedWeight', 'recovery', 'castingWeight'],
    })

    // const fieldValues1 = useWatch({
    //     control,
    //     name: ['finishWeight','cavity']
    // })
    const dropDown = [
        {
            label: 'Machining Loss',
            value: 'MachiningLoss',
        },
        {
            label: 'Processing Allowance',
            value: 'ProcessingAllowance',
        },
        {
            label: 'Rejection Allowance',
            value: 'RejectionAllowance',
        },
    ]

    useEffect(() => {
        burningValue()
        handlGrossWeight()
        calculateRemainingCalculation(lostWeight)
    }, [fieldValues])

    // useEffect(() => {
    //     calculateRemainingCalculation(lostWeight)
    // }, [fieldValues1])

    const handlGrossWeight = () => {
        const grossWeight = checkForNull(Number(getValues('castingWeight'))) + dataToSend.burningValue + lostWeight
        const updatedValue = dataToSend
        updatedValue.grossWeight = grossWeight
        setDataToSend(updatedValue)
        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    }

    const calculateRemainingCalculation = (lostSum = 0) => {



        let scrapWeight = 0


        const grossWeight = checkForNull(Number(getValues('castingWeight'))) + dataToSend.burningValue + lostSum
        const finishedWeight = checkForNull(Number(getValues('finishedWeight')))

        if (finishedWeight > grossWeight) {
            toastr.warning('Finish Weight should not be greater than gross weight')
            setValue('finishedWeight', 0)
            return false
        }
        if (finishedWeight !== 0) {

            scrapWeight = checkForNull(grossWeight) - checkForNull(finishedWeight) //FINAL GROSS WEIGHT - FINISHED WEIGHT

        }

        const recovery = checkForNull(Number(getValues('recovery')) / 100)
        // const scrapWeight = checkForNull(grossWeight) - checkForNull(finishedWeight)
        const rmCost = checkForNull(grossWeight) * checkForNull(rmRowData.RMRate) //FINAL GROSS WEIGHT - RMRATE
        const scrapCost = checkForNull(checkForNull(scrapWeight) * checkForNull(rmRowData.ScrapRate) * recovery)
        const materialCost = checkForNull(rmCost) - checkForNull(scrapCost)


        const updatedValue = dataToSend
        updatedValue.totalGrossWeight = grossWeight
        updatedValue.scrapWeight = scrapWeight
        updatedValue.rmCost = rmCost
        updatedValue.scrapCost = scrapCost
        updatedValue.materialCost = materialCost

        setDataToSend(updatedValue)
        // setTimeout(() => {
        //     setDataToSend({ ...dataToSend, grossWeight: grossWeight, scrapWeight: scrapWeight, rmCost: rmCost, scrapCost: scrapCost, materialCost: materialCost })
        // }, 400);

        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('materialCost', checkForDecimalAndNull(materialCost, getConfigurationKey().NoOfDecimalForPrice))
        setLostWeight(lostSum)
    }

    const burningValue = () => {
        const shotWeight = getValues('shotWeight')
        const burningPercent = getValues('burningPercent')
        const cavity = getValues('cavity')
        const burningValue = checkForNull((checkForNull(shotWeight) * checkForNull(burningPercent)) / 100 * cavity)
        const updatedValue = dataToSend
        updatedValue.burningValue = burningValue
        setDataToSend(updatedValue)
        setValue('burningValue', checkForDecimalAndNull(burningValue, getConfigurationKey().NoOfDecimalForInputOutput))
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
        obj.BasicRatePerUOM = rmRowData.RMRate
        obj.ScrapRate = rmRowData.ScrapRate
        obj.NetLandedCost = dataToSend.grossWeight * rmRowData.RMRate - (dataToSend.grossWeight - getValues('finishedWeight')) * rmRowData.ScrapRate
        obj.PartNumber = costData.PartNumber
        obj.TechnologyName = costData.TechnologyName
        obj.Density = rmRowData.Density
        obj.UOMId = rmRowData.UOMId
        obj.UOM = rmRowData.UOM
        obj.UOMForDimension = KG
        obj.ShotWeight = getValues('shotWeight')
        obj.NumberOfCavity = getValues('cavity')
        obj.BurningPercentage = getValues('burningPercent')
        obj.BurningValue = dataToSend.burningValue
        obj.MachiningScrapWeight = getValues('machiningScrapWeight')
        obj.CastingWeight = getValues('castingWeight')
        obj.RecoveryPercentage = getValues('recovery')
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

    const tableData = (value = []) => {

        setTableVal(value)
    }
    const onCancel = () => {
        props.toggleDrawer('')
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
                                        label={`Shot Weight(Kg)`}
                                        name={'shotWeight'}
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
                                        errors={errors.shotWeight}
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`No. Of Cavity`}
                                        name={'cavity'}
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
                                        errors={errors.cavity}
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="3" >
                                    <TextFieldHookForm
                                        label={`Burning %`}
                                        name={'burningPercent'}
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
                                        errors={errors.burningPercent}
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Burning Value`}
                                        name={'burningValue'}
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.burningValue}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Casting Weight(before machining)`}
                                        name={'castingWeight'}
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
                                        customClassName={'withBorder text-nowrap'}
                                        errors={errors.castingWeight}
                                        disabled={false}
                                    />
                                </Col>
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
                                weightValue={Number(getValues('castingWeight'))}
                                netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                                sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                                tableValue={tableData}
                            />

                            <Row className={'mt25'}>
                                <Col md="3" >
                                    <TextFieldHookForm
                                        label={`Gross Weight(Kg)`}
                                        name={'grossWeight'}
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
                                        label={`Recovery %`}
                                        name={'recovery'}
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
                                        // defaultValue={WeightCalculatorRequest &&
                                        //     WeightCalculatorRequest.ScrapWeight !== undefined
                                        //     ? WeightCalculatorRequest.ScrapWeight
                                        //     : ''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.recovery}
                                        disabled={false}
                                    />
                                </Col>
                            </Row>
                            <Row className={''}>
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
    );
}

export default HPDC;