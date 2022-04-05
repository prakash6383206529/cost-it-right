import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Col, Row, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { NumberFieldHookForm, } from '../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalculationForFerrous } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'

function Ferrous(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext)
    const dispatch = useDispatch()
    const { ferrousCalculatorReset } = useSelector(state => state.costing)

    const defaultValues = {
        castingWeight: WeightCalculatorRequest && WeightCalculatorRequest.CastingWeight !== undefined ? WeightCalculatorRequest.CastingWeight : '',
        recovery: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? WeightCalculatorRequest.RecoveryPercentage : '',
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
        NetRMRate: WeightCalculatorRequest && WeightCalculatorRequest.NetRMRate !== undefined ? WeightCalculatorRequest.NetRMRate : '',
        NetScrapRate: WeightCalculatorRequest && WeightCalculatorRequest.NetScrapRate !== undefined ? WeightCalculatorRequest.NetScrapRate : '',
        scrapCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetRMCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    }

    const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
    const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
    const [dataToSend, setDataToSend] = useState(WeightCalculatorRequest)
    const { rmRowData, rmData, CostingViewMode } = props

    const rmGridFields = 'rmGridFields';

    const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    useEffect(() => {
        if (ferrousCalculatorReset === true) {
            reset({
                castingWeight: '',
                recovery: '',
                grossWeight: '',
                finishedWeight: '',
                scrapWeight: '',
                NetRMRate: '',
                NetScrapRate: '',
                scrapCost: '',
                NetRMCost: '',

            })
            WeightCalculatorRequest.CostingFerrousCalculationRawMaterials && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, '')
            ))
            setTableVal([])
        }
    }, [ferrousCalculatorReset])

    const fieldValues = useWatch({
        control,
        name: ['finishedWeight', 'recovery', 'castingWeight', 'Percentage'],
    })

    const tableData = (value = []) => {

        setTableVal(value)
    }
    const dropDown = [

        {
            label: 'Melting Loss',
            value: 5,
        },
        {
            label: 'Fetling Loss',
            value: 6,
        },
        {
            label: 'Grinding Loss',
            value: 7,
        },
        {
            label: 'Rejection Allowance',
            value: 4,
        },
    ]

    useEffect(() => {
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length > 0 && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.length > 0) {
            WeightCalculatorRequest.CostingFerrousCalculationRawMaterials && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForInputOutput))
            ))
        }
    }, [WeightCalculatorRequest])

    useEffect(() => {
        if (CostingViewMode !== true) {
            calculateRemainingCalculation(lostWeight)
        }
    }, [fieldValues])

    const percentageChange = () => {
        setTimeout(() => {
            calculateNetSCrapRate()
            calculateNetRmRate()
        }, 300);
    }
    const calculateNetRmRate = () => {

        let NetRMRate = 0;
        NetRMRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = getValues(`${rmGridFields}.${index}.Percentage`)
            return acc + checkForNull(Percentage * val.RMRate / 100)

        }, 0)
        let obj = dataToSend
        obj.NetRMRate = NetRMRate
        setDataToSend(obj)
        setValue('NetRMRate', checkForDecimalAndNull(NetRMRate, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const calculateNetSCrapRate = () => {
        let NetScrapRate = 0;
        NetScrapRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = getValues(`${rmGridFields}.${index}.Percentage`)
            return acc + checkForNull(Percentage * val.ScrapRate / 100)

        }, 0)
        let obj = dataToSend
        obj.NetScrapRate = NetScrapRate
        setDataToSend(obj)
        setValue('NetScrapRate', checkForDecimalAndNull(NetScrapRate, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const calculateRemainingCalculation = (lostSum = 0) => {
        let scrapWeight = 0
        const castingWeight = checkForNull(getValues("castingWeight"))
        const grossWeight = checkForNull(castingWeight) + lostSum
        const finishedWeight = checkForNull(getValues('finishedWeight'))
        const NetRMRate = checkForNull(dataToSend.NetRMRate)
        const NetScrapRate = checkForNull(dataToSend.NetScrapRate)
        if (finishedWeight > grossWeight) {
            Toaster.warning('Finish Weight should not be greater than gross weight')
            setValue('finishedWeight', 0)
            return false
        }
        if (finishedWeight !== 0) {
            scrapWeight = checkForNull(castingWeight) - checkForNull(finishedWeight) //FINAL Casting Weight - FINISHED WEIGHT
        }
        const recovery = checkForNull(getValues('recovery'))
        const scrapCost = checkForNull(scrapWeight * NetScrapRate * recovery / 100)
        const NetRMCost = (checkForNull(grossWeight) * checkForNull(NetRMRate)) - checkForNull(scrapCost)
        const updatedValue = dataToSend
        updatedValue.totalGrossWeight = grossWeight
        updatedValue.scrapWeight = scrapWeight
        updatedValue.scrapCost = scrapCost
        updatedValue.NetRMCost = NetRMCost

        setDataToSend(updatedValue)

        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapCost', checkForDecimalAndNull(scrapCost ?? scrapCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('NetRMCost', checkForDecimalAndNull(NetRMCost ?? NetRMCost, getConfigurationKey().NoOfDecimalForPrice))
        setLostWeight(lostSum)
    }

    const onSubmit = () => {

        let obj = {}
        obj.FerrousCastingWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.ForgingWeightCalculatorId ? WeightCalculatorRequest.ForgingWeightCalculatorId : "0"
        obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
        obj.RawMaterialIdRef = ""
        obj.BaseCostingIdRef = costData.CostingId
        obj.LoggedInUserId = loggedInUserId()
        obj.RawMaterialCost = dataToSend.NetRMCost
        obj.NetRMRate = dataToSend.NetRMRate
        obj.NetScrapRate = dataToSend.NetScrapRate
        obj.CastingWeight = getValues('castingWeight')
        obj.RecoveryPercentage = getValues('recovery')
        obj.GrossWeight = dataToSend.totalGrossWeight
        obj.FinishWeight = getValues('finishedWeight')
        obj.ScrapWeight = dataToSend.scrapWeight
        obj.RMCost = dataToSend.rmCost
        obj.ScrapCost = dataToSend.scrapCost
        let tempArr = []
        tableVal && tableVal.map(item => (
            tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000" })
        ))
        obj.LossOfTypeDetails = tempArr
        obj.NetLossWeight = lostWeight
        let tempArray = []
        rmData && rmData.map((item, index) => (
            tempArray.push({ RMName: item.RMName, RMRate: item.RMRate, ScrapRate: item.ScrapRate, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000", Percentage: getValues(`${rmGridFields}.${index}.Percentage`) })
        ))
        obj.CostingFerrousCalculationRawMaterials = tempArray
        dispatch(saveRawMaterialCalculationForFerrous(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj)
            }
        }))
    }

    const onCancel = () => {
        props.toggleDrawer('')
    }

    return (
        <Fragment>
            <Row>
                <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>

                    <Col md="12">

                        <Col md="12">

                            <tbody className='rm-table-body'></tbody>
                        </Col>
                        <div className="costing-border px-4">
                            <Table className="table cr-brdr-main costing-raw-material-section" size="sm">
                                <thead>
                                    <tr>
                                        <th className='rm-name-head'>{`RM Name`}</th>
                                        <th>{`RM Rate`}</th>
                                        <th>{`Scrap Rate`}</th>
                                        <th style={{ width: "190px" }}>{`Percentage`}</th>
                                    </tr>
                                </thead>
                                <tbody className='rm-table-body'>
                                    {rmData &&
                                        rmData.map((item, index) => {

                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.RMName}>{item.RMName}</span></td>
                                                    <td>{item.RMRate}</td>
                                                    <td>{item.ScrapRate}</td>
                                                    <td>
                                                        <NumberFieldHookForm
                                                            label="Percentage"
                                                            name={`${rmGridFields}.${index}.Percentage`}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={true}
                                                            rules={{
                                                                required: true,
                                                                pattern: {
                                                                    value: /^[0-9]\d*(\.\d+)?$/i,
                                                                    message: 'Invalid Number.',
                                                                },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage should be less than 100'
                                                                },
                                                            }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            handleChange={percentageChange}
                                                            errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].Percentage : ''}
                                                            disabled={props.isEditFlag ? false : true}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }

                                </tbody>
                            </Table>
                            <Row className={''}>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Net RM Rate`}
                                        name={'NetRMRate'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NetRMRate}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Net Scrap Rate`}
                                        name={'NetScrapRate'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NetScrapRate}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Casting Weight(kg)`}
                                        name={'castingWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                message: 'Maximum length for interger is 4 and for decimal is 7',
                                            },

                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder text-nowrap'}
                                        errors={errors.castingWeight}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>
                            </Row>

                            <LossStandardTable
                                dropDownMenu={dropDown}
                                CostingViewMode={props.CostingViewMode}
                                calculation={calculateRemainingCalculation}
                                weightValue={Number(getValues('castingWeight'))}
                                netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                                sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                                tableValue={tableData}
                                isLossStandard={false}
                                isPlastic={false}
                                isNonFerrous={false}
                                ferrousErrors={errors}
                                isFerrous={true}
                            />
                            <Row className={'mt25'}>
                                <Col md="3" >
                                    <NumberFieldHookForm
                                        label={`Gross Weight (Kg)`}
                                        name={'grossWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                    <NumberFieldHookForm
                                        label={`Finished Weight(Kg)`}
                                        name={'finishedWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                message: 'Maximum length for interger is 4 and for decimal is 7',
                                            },

                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.finishedWeight}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>

                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Scrap Weight(Kg)`}
                                        name={'scrapWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
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
                                    <NumberFieldHookForm
                                        label={`Recovery %`}
                                        name={'recovery'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^\d*\.?\d*$/,
                                                message: 'Invalid Number.',
                                            },
                                            max: {
                                                value: 100,
                                                message: 'Percentage should be less than 100'
                                            },
                                        }}
                                        handleChange={() => { }}

                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.recovery}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>


                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Scrap Cost`}
                                        name={'scrapCost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={
                                            WeightCalculatorRequest.ScrapCost ?? WeightCalculatorRequest.ScrapCost}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapCost}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <NumberFieldHookForm
                                        // Confirm this name from tanmay sir
                                        label={`Net RM Cost`}
                                        name={'NetRMCost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={
                                            WeightCalculatorRequest.NetRMCost ?? WeightCalculatorRequest.NetRMCost}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NetRMCost}
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
                            <div className={'cancel-icon'}></div>
                            CANCEL
                        </button>
                        <button
                            type="submit"
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

            </Row>
        </Fragment>
    );
}

export default Ferrous;