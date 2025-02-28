import React, { useEffect } from "react";
import HeaderTitle from "../../../../common/HeaderTitle";
import { Col, Row } from "reactstrap";
import { NumberFieldHookForm, TextFieldHookForm } from "../../../../layout/HookFormInputs";
import { useForm, Controller, useWatch } from 'react-hook-form'
import TooltipCustom from "../../../../common/Tooltip";
import { ceilByMultiple, checkForDecimalAndNull, checkForNull, number, checkWhiteSpaces, decimalAndNumberValidation, noDecimal, maxLength7 } from "../../../../../helper";
import { useDispatch, useSelector } from "react-redux";
import { corrugatedData } from "../../../actions/Costing";



export const RMSection = (props) => {
    const dispatch = useDispatch()
    const { corrugatedDataObj } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { WeightCalculatorRequest, errors, control, Controller, register } = props
    const defaultValues = {
        no_of_ply: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPly !== null ? WeightCalculatorRequest.NoOfPly : '',
        gsm: WeightCalculatorRequest && WeightCalculatorRequest.GSM !== null ? WeightCalculatorRequest.GSM : '',
        bursting_factor: WeightCalculatorRequest && WeightCalculatorRequest.BurstingFactor ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingFactor, initialConfiguration?.NoOfDecimalForInputOutput) : '',
        bursting_strength: WeightCalculatorRequest && WeightCalculatorRequest.BurstingStrength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingStrength, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    }
    const {
        setValue, getValues } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues
        })
    const fieldValues = useWatch({
        control,
        name: ['no_of_ply', 'gsm', 'bursting_factor'],
    })
    useEffect(() => {
        if (props.CostingViewMode && WeightCalculatorRequest) {
            props.setValue('no_of_ply', checkForDecimalAndNull(WeightCalculatorRequest.NoOfPly, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('gsm', checkForDecimalAndNull(WeightCalculatorRequest.GSM, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('bursting_factor', checkForDecimalAndNull(WeightCalculatorRequest.BurstingFactor, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('bursting_strength', checkForDecimalAndNull(WeightCalculatorRequest.BurstingStrength, initialConfiguration?.NoOfDecimalForInputOutput))
        }
    }, [])
    useEffect(() => {
        setBurstingStrength()
    }, [fieldValues])
    const setBurstingStrength = () => {
        let data = {
            noOfPly: checkForNull(getValues('no_of_ply')),
            burstingFactor: checkForNull(getValues('bursting_factor')),
            gsm: checkForNull(getValues('gsm'))
        }
        const getWeightSheet = (data.burstingFactor * data.gsm * data.noOfPly) / 1000;
        dispatch(corrugatedData({ ...corrugatedDataObj, RMData: data, burstingStrengthWithDecimal: getWeightSheet, }))
        setValue('bursting_strength', checkForDecimalAndNull(getWeightSheet, initialConfiguration?.NoOfDecimalForInputOutput))

    }
    return (
        <div>
            <Row>
                <Col md="12" className={'mt25'}>
                    <HeaderTitle className="border-bottom"
                        title={'RM Details'}
                        customClass={'underLine-title'}
                    />
                </Col>
            </Row>
            <Row className={'mt15'}>
                <Col md="3">
                    <TextFieldHookForm
                        label={`Nos of Ply`}
                        name={'no_of_ply'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, noDecimal, maxLength7 },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.no_of_ply}
                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                </Col>
                <Col md="3">
                    <TextFieldHookForm
                        label={`GSM`}
                        name={'gsm'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.gsm}
                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                </Col>

                <Col md="3">
                    <TextFieldHookForm
                        label={`Bursting Factor`}
                        name={'bursting_factor'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.bursting_factor}
                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                </Col>
                <Col md="3">
                    <TooltipCustom disabledIcon={true} id={'bursting-strength'} tooltipText={'Bursting Strength = (No of Ply * GSM * Busting Factor) / 1000'} />
                    <TextFieldHookForm
                        label={`Bursting Strength`}
                        name={'bursting_strength'}
                        Controller={Controller}
                        id={'bursting-strength'}
                        control={control}
                        register={register}
                        mandatory={false}

                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.bursting_strength}
                        disabled={true}
                    />
                </Col>
            </Row>
        </div>
    );
};

export const BoxDetails = (props) => {
    const { CostingViewMode, WeightCalculatorRequest, errors, control, Controller, register } = props
    const { corrugatedDataObj } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch()
    const defaultValues = {
        length_box: WeightCalculatorRequest && WeightCalculatorRequest.LengthBox !== null ? WeightCalculatorRequest.LengthBox : '',
        width_box: WeightCalculatorRequest && WeightCalculatorRequest.WidthBox !== null ? WeightCalculatorRequest.WidthBox : '',
        height_box: WeightCalculatorRequest && WeightCalculatorRequest.HeightBox !== null ? WeightCalculatorRequest.HeightBox : '',
        stiching_length: WeightCalculatorRequest && WeightCalculatorRequest.StitchingLengthInchPerJoint !== null ? WeightCalculatorRequest.StitchingLengthInchPerJoint : '',
        // width_sheet: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration?.NoOfDecimalForInputOutput) : '', //
        // width_sheet_body: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration?.NoOfDecimalForInputOutput) : '', //
        // cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceWidth !== undefined ? WeightCalculatorRequest.CuttingAllowanceWidth : '',
        // width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.WidthSheetIncCuttingAllowance : '',
    }
    const {
        setValue, getValues, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues
        })
    const fieldValues = useWatch({
        control,
        name: ['length_box', 'width_box', 'height_box', 'stiching_length', 'fluteTypePercent', 'cutting_allowance', 'cuttingAllowanceForLength'],
    })
    useEffect(() => {
        if (!CostingViewMode) {
            setWidthSheet_LengthSheet()//
        }
    }, [fieldValues])

    useEffect(() => {
        if (props.CostingViewMode && WeightCalculatorRequest) {
            props.setValue('length_box', checkForDecimalAndNull(WeightCalculatorRequest.LengthBox, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('width_box', checkForDecimalAndNull(WeightCalculatorRequest.WidthBox, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('height_box', checkForDecimalAndNull(WeightCalculatorRequest.HeightBox, initialConfiguration?.NoOfDecimalForInputOutput))
            props.setValue('stiching_length', checkForDecimalAndNull(WeightCalculatorRequest.StitchingLengthInchPerJoint, initialConfiguration?.NoOfDecimalForInputOutput))
        }
    }, [])
    const setWidthSheet_LengthSheet = () => {
        let data = {
            lengthBox: Number(getValues('length_box')),
            widthBox: Number(getValues('width_box')),
            heightBox: Number(getValues('height_box')),
            stichingLength: Number(getValues('stiching_length')),
            noOfMeshWidth: Number(getValues('noOfMeshWidth')),
            noOfMeshLength: Number(getValues('noOfMeshLength')),
            cutting_allowance: Number(getValues('cutting_allowance')),
            cuttingAllowanceForLength: Number(getValues('cuttingAllowanceForLength'))
        }
        dispatch(corrugatedData({ ...corrugatedDataObj, BoxData: data }))
        const widthSheet = (checkForNull(data.widthBox) + (checkForNull(data.noOfMeshWidth) * 2)) / 25.4;
        let width_inc_cutting = 0
        if (widthSheet) {
            width_inc_cutting = widthSheet + (2 * data.cutting_allowance)
        }

        const roundOffWidth = Math.round(width_inc_cutting)
        const lengthSheet = (checkForNull(data.noOfMeshLength) * checkForNull(data.lengthBox)) / 25.4;

        let length_inc_cutting_allowance = 0
        if (lengthSheet) {
            length_inc_cutting_allowance = lengthSheet + (2 * data.cuttingAllowanceForLength)
        }

        const length_RoundOff = ceilByMultiple(length_inc_cutting_allowance, 0.25)
        //ROUND OFF TO 0.25 (Common function)
        setTimeout(() => {
            setValue('width_sheet', checkForDecimalAndNull(widthSheet, localStorage.NoOfDecimalForInputOutput))
            setValue('width_inc_cutting', checkForDecimalAndNull(width_inc_cutting, localStorage.NoOfDecimalForInputOutput))
            setValue('width_RoundOff', checkForDecimalAndNull(roundOffWidth, localStorage.NoOfDecimalForInputOutput))
        }, 200);

        setTimeout(() => {
            setValue('length_sheet', checkForDecimalAndNull(lengthSheet, localStorage.NoOfDecimalForInputOutput))
            setValue('length_inc_cutting_allowance', checkForDecimalAndNull(length_inc_cutting_allowance, localStorage.NoOfDecimalForInputOutput))
            setValue('length_RoundOff', checkForDecimalAndNull(length_RoundOff, localStorage.NoOfDecimalForInputOutput))
        }, 200);

    }

    return <>
        <Row>
            <Col md="12" className={''}>
                <HeaderTitle className="border-bottom"
                    title={'Box Details'}
                    customClass={'underLine-title'}
                />
            </Col>
        </Row>
        <Row className={'mt15'}>
            <Col md="3">
                <TextFieldHookForm
                    label={`Length(Box)(mm)`}
                    name={'length_box'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.length_box}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                />
            </Col>
            <Col md="3">
                <TextFieldHookForm
                    label={`Width(Box)(mm)`}
                    name={'width_box'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.width_box}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                />
            </Col>

            <Col md="3">
                <TextFieldHookForm
                    label={`Height (Box)(mm)`}
                    name={'height_box'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.height_box}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}

                />
            </Col>
            <Col md="3">
                <TextFieldHookForm
                    label={`Stitching length - Inch/Joint`}
                    name={'stiching_length'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.stiching_length}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                />
            </Col>
        </Row></>
}


export const ProcessAndRejection = (props) => {
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { data, WeightCalculatorRequest, CostingViewMode } = props
    const {
        register, control, setValue, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: {
                paper_process: WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration?.NoOfDecimalForInputOutput) : '',
            }
        })
    useEffect(() => {
        if (!CostingViewMode) {
            setValue('paper_process', checkForDecimalAndNull(data.paperWithDecimal, initialConfiguration?.NoOfDecimalForInputOutput))
        }
    }, [data])
    return <>
        <Row>
            <Col md="12" className={''}>
                <HeaderTitle className="border-bottom"
                    title={'Paper wt.+ Process Rejection(Kg)'}
                    customClass={'underLine-title'}
                />
            </Col>
            <Col md="3">
                <TooltipCustom disabledIcon={true} id={'paper-width'} tooltipClass={'weight-of-sheet'} tooltipText={'Paper wt. + Process Rejection = (Width Cutting Allowance * Length Cutting Allowance * Flute Type Percentage * No of Ply * GSM / 1550) / 1000'} />
                <TextFieldHookForm
                    label={'Paper wt.+ Process Rejection(Kg)'}
                    name={'paper_process'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'paper-width'}
                    rules={{
                        required: false,
                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.paper_process}
                    disabled={true}
                />
            </Col>
        </Row>
    </>
}