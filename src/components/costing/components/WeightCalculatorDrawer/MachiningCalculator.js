import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { NumberFieldHookForm } from '../../../layout/HookFormInputs'
import { checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper'
import { saveRawMaterialCalculationForMachining } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'
import { debounce } from 'lodash'
import { checkForDecimalAndNull, nonZero, decimalNumberLimit, positiveAndDecimalNumber } from '../../../../helper/validation'
import TooltipCustom from '../../../common/Tooltip'

function Machining(props) {
    const { item, rmRowData, CostingViewMode } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const dispatch = useDispatch()

    const defaultValues = {
        outerDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== undefined ? WeightCalculatorRequest.OuterDiameter : '',
        thickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== undefined ? WeightCalculatorRequest.Thickness : '',
        partingMargin: WeightCalculatorRequest && WeightCalculatorRequest.PartingMargin !== undefined ? WeightCalculatorRequest.PartingMargin : '',
        netLength: WeightCalculatorRequest && WeightCalculatorRequest.NetLength !== undefined ? WeightCalculatorRequest.NetLength : '',
        grossLength: WeightCalculatorRequest && WeightCalculatorRequest.GrossLength !== undefined ? WeightCalculatorRequest.GrossLength : '',
        piecePerMeter: WeightCalculatorRequest && WeightCalculatorRequest.PiecePerMeter !== undefined ? WeightCalculatorRequest.PiecePerMeter : '',
        rmPerPiece: WeightCalculatorRequest && WeightCalculatorRequest.RMPerPiece !== undefined ? WeightCalculatorRequest.RMPerPiece : '',
        netRm: WeightCalculatorRequest && WeightCalculatorRequest.RMPerPiece !== undefined ? WeightCalculatorRequest.RMPerPiece : '',
    }
    const [grossLength, setGrossLength] = useState(0)
    const [piecePerMeter, setPiecePerMeter] = useState(0)
    const [rmPerPiece, setRmPerPiece] = useState(0)

    const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['partingMargin', 'netLength', 'finishedWeight'],
    })


    useEffect(() => {
        if (!CostingViewMode) {
            calculateAll()
        }
    }, [fieldValues])


    const calculateAll = () => {
        const netLength = getValues('netLength')
        const partingMargin = getValues('partingMargin')
        const grossLength = checkForNull(netLength) + checkForNull(partingMargin)
        setValue('grossLength', checkForDecimalAndNull(grossLength, getConfigurationKey().NoOfDecimalForInputOutput))
        setGrossLength(grossLength)
        const piecePerMeter = 1000 / grossLength
        setValue('piecePerMeter', checkForDecimalAndNull(piecePerMeter, getConfigurationKey().NoOfDecimalForInputOutput))
        setPiecePerMeter(piecePerMeter)
        const rmPerPiece = checkForNull(rmRowData.RMRate / piecePerMeter)
        setValue('rmPerPiece', checkForDecimalAndNull(rmPerPiece, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('netRm', checkForDecimalAndNull(rmPerPiece, getConfigurationKey().NoOfDecimalForInputOutput))
        setRmPerPiece(rmPerPiece)
    }


    /**
       * @method cancel
       * @description used to Reset form
       */
    const cancel = () => {
        props.toggleDrawer('')
    }
    const onSubmit = debounce(handleSubmit((values) => {
        let obj = {
            MachiningCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.MachiningCalculatorId ? WeightCalculatorRequest.MachiningCalculatorId : "0",
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailsIdRef: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData?.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            OuterDiameter: getValues('outerDiameter'),
            Thickness: getValues('thickness'),
            NetLength: getValues('netLength'),
            PartingMargin: getValues('partingMargin'),
            GrossLength: grossLength,
            PiecePerMeter: piecePerMeter,
            RMPerPiece: rmPerPiece,
        }
        dispatch(saveRawMaterialCalculationForMachining(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj)
            }
        }))

    }), 500);

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    return (
        <Fragment>
            <Row>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
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
                                    <NumberFieldHookForm
                                        label={`Outer Diameter (mm)`}
                                        name={'outerDiameter'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { nonZero, positiveAndDecimalNumber, decimalNumberLimit },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.outerDiameter}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Thickness (mm)`}
                                        name={'thickness'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { positiveAndDecimalNumber, decimalNumberLimit },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.thickness}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Net Length (mm)`}
                                        name={'netLength'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { positiveAndDecimalNumber, decimalNumberLimit },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.netLength}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt25'}>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Parting Margin (mm)`}
                                        name={'partingMargin'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { positiveAndDecimalNumber, decimalNumberLimit },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.partingMargin}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>
                                <Col md="3" >
                                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'gross-length-machining'} tooltipText={'Gross Length (mm) = (Net Length (mm) + Parting Margin (mm))'} />
                                    <NumberFieldHookForm
                                        label={`Gross Length (mm)`}
                                        name={'grossLength'}
                                        id={'gross-length-machining'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.grossLength}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3" >
                                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'piece-per-meter-length'} tooltipText={'Pc/meter = (1000/Gross Length (mm))'} />
                                    <NumberFieldHookForm
                                        label={`Pc/meter`}
                                        name={'piecePerMeter'}
                                        id={'piece-per-meter-length'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.grossLength}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3" >
                                    <NumberFieldHookForm
                                        label={`RM Rate(INR)`}
                                        name={'rmRate'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={rmRowData.RMRate}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rmRate}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'rm-per-piece'} tooltipText={'RM/Pc = RM Rate(INR)/(Pc/meter)'} />
                                    <NumberFieldHookForm
                                        label={`RM/Pc`}
                                        name={'rmPerPiece'}
                                        Controller={Controller}
                                        control={control}
                                        id={'rm-per-piece'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rmPerPiece}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'net-rm-cost'} tooltipText={'Net RM Cost = RM/Pc'} />
                                    <NumberFieldHookForm
                                        label={`Net RM Cost`}
                                        name={'netRm'}
                                        Controller={Controller}
                                        control={control}
                                        id={'net-rm-cost'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={rmPerPiece}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.netRm}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </Col>

                    {!CostingViewMode && <div className="col-sm-12 text-right mt-4">
                        <button
                            type={'button'}
                            className="reset mr15 cancel-btn"
                            onClick={cancel} >
                            <div className={'cancel-icon'}></div> {'Cancel'}
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={props.CostingViewMode ? true : false}
                            className="submit-button save-btn">
                            <div className={'save-icon'}></div>
                            {'Save'}
                        </button>
                    </div>}
                </form>

            </Row>
        </Fragment>
    )
}

export default Machining
