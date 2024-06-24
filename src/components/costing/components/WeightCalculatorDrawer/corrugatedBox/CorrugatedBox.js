import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalculationForCorrugatedBox } from '../../../actions/CostWorking'
import { NumberFieldHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, number, checkWhiteSpaces, decimalAndNumberValidation, noDecimal, maxLength7 } from '../../../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import HeaderTitle from '../../../../common/HeaderTitle'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { ceilByMultiple } from '../../../../../helper/util'

function CorrugatedBox(props) {
    const [isDisable, setIsDisable] = useState(false)
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const [dataSend, setDataSend] = useState(WeightCalculatorRequest ? WeightCalculatorRequest : {})
    const [bodySeparator, setBodySeparator] = useState(WeightCalculatorRequest && WeightCalculatorRequest.IsIncludingBodySeparator !== null ? WeightCalculatorRequest.IsIncludingBodySeparator : false)
    const { rmRowData, CostingViewMode, item } = props
    const dispatch = useDispatch()
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const defaultValues = {
        no_of_ply: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPly !== null ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfPly, initialConfiguration.NoOfDecimalForInputOutput) : '',
        gsm: WeightCalculatorRequest && WeightCalculatorRequest.GSM !== null ? checkForDecimalAndNull(WeightCalculatorRequest.GSM, initialConfiguration.NoOfDecimalForInputOutput) : '',
        bursting_factor: WeightCalculatorRequest && WeightCalculatorRequest.BurstingFactor ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingFactor, initialConfiguration.NoOfDecimalForInputOutput) : '',
        bursting_strength: WeightCalculatorRequest && WeightCalculatorRequest.BurstingStrength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingStrength, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_box: WeightCalculatorRequest && WeightCalculatorRequest.LengthBox !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthBox, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_box: WeightCalculatorRequest && WeightCalculatorRequest.WidthBox !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthBox, initialConfiguration.NoOfDecimalForInputOutput) : '',
        height_box: WeightCalculatorRequest && WeightCalculatorRequest.HeightBox !== null ? checkForDecimalAndNull(WeightCalculatorRequest.HeightBox, initialConfiguration.NoOfDecimalForInputOutput) : '',
        stiching_length: WeightCalculatorRequest && WeightCalculatorRequest.StitchingLengthInchPerJoint !== null ? checkForDecimalAndNull(WeightCalculatorRequest.StitchingLengthInchPerJoint, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_sheet: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '', //
        width_sheet_body: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '', //
        cuttingAllowanceForWidth: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowanceWidth, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_inc_cutting_body: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_sheet: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_sheet_body: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '',
        cuttingAllowanceForLength: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceLength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowanceLength, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_inc_cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_inc_cutting_allowance_body: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        paper_process: WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration.NoOfDecimalForInputOutput) : '',
        fluteTypePercent: WeightCalculatorRequest && WeightCalculatorRequest.FluteTypePercentage !== null ? checkForDecimalAndNull(WeightCalculatorRequest.FluteTypePercentage, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_length_inc_cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_off_length_body: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_off_width_body: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : ''
    }


    useEffect(() => {
        setTimeout(() => {
            setValue('width_inc_cutting', WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.WidthSheetIncCuttingAllowance : '')
            setValue('length_inc_cutting_allowance', WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.LengthSheetIncCuttingAllowance : '')
            setValue('round_length_inc_cutting_allowance', WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance : '')
            setValue('round_width_inc_cutting', WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance : '')
            setValue('paper_process', WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration.NoOfDecimalForInputOutput) : '')
            setDataSend(WeightCalculatorRequest ? WeightCalculatorRequest : {})
        }, 300);
    }, [])


    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })

    const fieldValues = useWatch({
        control,
        name: ['no_of_ply', 'gsm', 'bursting_factor', 'length_box', 'height_box', 'width_box', 'cuttingAllowanceForWidth', 'cuttingAllowanceForLength', 'fluteTypePercent'],
    })

    useEffect(() => {
        if (!CostingViewMode) {
            if (bodySeparator) {
                bodySeparatorCalculations()
                setBurstingStrength()
            } else {
                setBurstingStrength()
                setWidthCuttingAllowance()
                setWidthSheet_LengthSheet()
                setLengthCuttingAllowance()
                setFinalGrossWeight()
                //bodySeparatorCalculations()
            }
        }
    }, [fieldValues, bodySeparator])

    const setBurstingStrength = () => {
        let data = {
            noOfPly: getValues('no_of_ply'),
            burstingFactor: checkForNull(getValues('bursting_factor')),
            gsm: checkForNull(getValues('gsm'))
        }
        const getWeightSheet = (data.burstingFactor * data.gsm * data.noOfPly) / 1000;
        setDataSend(prevState => ({ ...prevState, burstingStrengthWithDecimal: getWeightSheet }))
        setTimeout(() => {
            setValue('bursting_strength', checkForDecimalAndNull(getWeightSheet, localStorage.NoOfDecimalForInputOutput))
        }, 200);
    }

    const setWidthSheet_LengthSheet = () => {
        let data = {

            lengthBox: getValues('length_box'),
            widthBox: getValues('width_box'),
            heightBox: getValues('height_box'),
            stichingLength: getValues('stiching_length')

        }

        let widthSheet = (Number(data.widthBox) + parseInt(data.heightBox)) / 25.4;
        const lengthSheet = (2 * (parseInt(data.lengthBox) + parseInt(data.widthBox)) + parseInt(data.stichingLength)) / 25.4;

        setDataSend(prevState => ({ ...prevState, widthSheetWithDecimal: widthSheet, lengthSheetWithDecimal: lengthSheet }))
        setTimeout(() => {

            setValue('width_sheet', checkForDecimalAndNull(widthSheet, localStorage.NoOfDecimalForInputOutput))
        }, 200);

        setTimeout(() => {
            setValue('length_sheet', checkForDecimalAndNull(lengthSheet, localStorage.NoOfDecimalForInputOutput))
        }, 200);

    }

    const setWidthCuttingAllowance = () => {
        let data1 = {
            cuttingAllowance: getValues('cuttingAllowanceForWidth'),
            widthSheet: dataSend.widthSheetWithDecimal

        }

        if (data1.cuttingAllowance) {

            const widthCuttingAllowance = data1.widthSheet + (2 * data1.cuttingAllowance);              //
            const widthIncCuttingAllowance = (widthCuttingAllowance);
            const round_width_inc_cutting = Math.ceil(widthCuttingAllowance)
            setDataSend(prevState => ({ ...prevState, WidthSheetIncCuttingAllowance: widthIncCuttingAllowance, round_width_inc_cutting: round_width_inc_cutting }))

            setTimeout(() => {

                setValue('width_inc_cutting', checkForDecimalAndNull(widthIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput));
                setValue('round_width_inc_cutting', checkForDecimalAndNull(round_width_inc_cutting, initialConfiguration.NoOfDecimalForInputOutput));
            }, 200);
        }
    }

    const setLengthCuttingAllowance = () => {

        let data = {
            lengthSheet: dataSend.lengthSheetWithDecimal,
            cuttingAllowanceForLength: getValues('cuttingAllowanceForLength'),
        }

        if (data.cuttingAllowanceForLength) {
            const lengthIncCuttingAllowance = ((data.lengthSheet) + 2 * (data.cuttingAllowanceForLength));            // Formula to calculate length inc cutting allowance
            const round_length_inc_cutting_allowance = ceilByMultiple(lengthIncCuttingAllowance, 0.25)    //ROUND OFF TO 0.25 (Common function)
            setDataSend(prevState => ({ ...prevState, LengthSheetIncCuttingAllowance: lengthIncCuttingAllowance, round_length_inc_cutting_allowance: round_length_inc_cutting_allowance }))
            setTimeout(() => {
                setValue('length_inc_cutting_allowance', checkForDecimalAndNull(lengthIncCuttingAllowance, localStorage.NoOfDecimalForInputOutput));
                setValue('round_length_inc_cutting_allowance', checkForDecimalAndNull(round_length_inc_cutting_allowance, localStorage.NoOfDecimalForInputOutput));
            }, 200);

        }
    }

    const setFinalGrossWeight = () => {
        let data = {
            lengthSheet: dataSend.lengthSheetWithDecimal,
            cuttingAllowanceForLength: getValues('cuttingAllowanceForLength'),
            round_width_inc_cutting: dataSend.round_width_inc_cutting,
            round_length_inc_cutting_allowance: dataSend.round_length_inc_cutting_allowance,
            no_of_ply: getValues('no_of_ply'),
            gsm: getValues('gsm'),
            cuttingAllowance: getValues('cuttingAllowanceForWidth'),
            widthSheet: dataSend.widthSheetWithDecimal
        }

        const lengthIncCuttingAllowance = ((data.lengthSheet) + 2 * (data.cuttingAllowanceForLength));            // Formula to calculate length inc cutting allowance
        const round_length_inc_cutting_allowance = ceilByMultiple(lengthIncCuttingAllowance, 0.25)    //ROUND OFF TO 0.25 (Common function)

        const widthCuttingAllowance = data.widthSheet + (2 * data.cuttingAllowance);              //
        const round_width_inc_cutting = Math.ceil(widthCuttingAllowance)

        if (round_length_inc_cutting_allowance) {
            const WidthIncCuttingAllowance = Number(round_width_inc_cutting);
            const LengthIncCuttingAllowance = checkForNull(round_length_inc_cutting_allowance);
            const NoOfPly = parseInt(data.no_of_ply);
            const Gsm = parseInt(data.gsm);

            const gross = (WidthIncCuttingAllowance * LengthIncCuttingAllowance * NoOfPly * Gsm) / 1550;
            const finalGross = gross / 1000;
            setDataSend(prevState => ({ ...prevState, PaperWeightAndProcessRejectionSum: finalGross }))

            setTimeout(() => {
                setValue('paper_process', checkForDecimalAndNull(finalGross, localStorage.NoOfDecimalForInputOutput));
            }, 200);
        }
    }


    const bodySeparatorCalculations = (value) => {

        if (value === false) {
            setValue('cuttingAllowanceForWidth', "")
            setTimeout(() => {
                setValue('fluteTypePercent', "")
                setValue('cuttingAllowanceForLength', "")
            }, 200);
            return false
        }

        if (bodySeparator || value) {
            let data = {
                lengthBox: getValues('length_box'),
                widthBox: getValues('width_box'),
                heightBox: getValues('height_box'),
                stichingLength: getValues('stiching_length'),
                no_of_ply: getValues('no_of_ply'),
                gsm: getValues('gsm'),
                // ftp: Number(getValues('fluteTypePercent')), //FTP
                cuttingAllowanceForWidth: Number(getValues('cuttingAllowanceForWidth')),
                cutting_allowance_length: Number(getValues('cuttingAllowanceForLength'))
            }

            // const fluteTypePercent = checkForNull(data.ftp)
            let widthSheet = (Number(data.widthBox) + (parseInt(data.heightBox) * 2)) / 25.4;
            let width_inc_cutting = widthSheet + (2 * (data.cuttingAllowanceForWidth))

            const lengthSheet = (Number(data.lengthBox) + (parseInt(data.heightBox) * 2)) / 25.4;
            let length_inc_cutting_allowance = lengthSheet + (2 * (data.cutting_allowance_length))

            let width_RoundOff = Math.round(width_inc_cutting)
            let length_RoundOff = ceilByMultiple(length_inc_cutting_allowance, 0.25)    //ROUND OFF TO 0.25 (Common function)

            // const WidthIncCuttingAllowance = Number(data.width_inc_cutting);
            // const LengthIncCuttingAllowance = parseInt(data.length_inc_cutting_allowance);
            const NoOfPly = parseInt(data.no_of_ply);
            const Gsm = parseInt(data.gsm);

            const gross = (width_RoundOff * length_RoundOff * NoOfPly * Gsm) / 1550;
            const finalGross = gross / 1000;

            setDataSend(prevState => ({ ...prevState, PaperWeightAndProcessRejectionSum: finalGross }))

            setDataSend(prevState => ({ ...prevState, widthSheetWithDecimal: widthSheet, lengthSheetWithDecimal: lengthSheet, LengthSheetIncCuttingAllowance: length_inc_cutting_allowance, WidthSheetIncCuttingAllowance: width_inc_cutting }))
            setTimeout(() => {

                setValue('width_sheet_body', checkForDecimalAndNull(widthSheet, localStorage.NoOfDecimalForInputOutput))
                setValue('width_inc_cutting_body', checkForDecimalAndNull(width_inc_cutting, localStorage.NoOfDecimalForInputOutput))
                setValue('round_off_width_body', checkForDecimalAndNull(width_RoundOff, localStorage.NoOfDecimalForInputOutput))
            }, 200);

            setTimeout(() => {
                setValue('length_sheet_body', checkForDecimalAndNull(lengthSheet, localStorage.NoOfDecimalForInputOutput))
                setValue('length_inc_cutting_allowance_body', checkForDecimalAndNull(length_inc_cutting_allowance, localStorage.NoOfDecimalForInputOutput))
                setValue('round_off_length_body', checkForDecimalAndNull(length_RoundOff, localStorage.NoOfDecimalForInputOutput))
            }, 200);

            setTimeout(() => {
                setValue('paper_process', checkForDecimalAndNull(finalGross, localStorage.NoOfDecimalForInputOutput));
            }, 200);

        }
    }

    const onSubmit = debounce(handleSubmit((Values) => {

        setIsDisable(true)
        let data = {
            LayoutType: 'Corrugated',
            CorrugatedBoxWeightCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId ? WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId : "0",
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialIdRef: rmRowData.RawMaterialId,
            RawMaterialCost: dataSend.PaperWeightAndProcessRejectionSum * rmRowData.RMRate,  //(GROSS WEIGHT * RM RATE)
            GrossWeight: dataSend.PaperWeightAndProcessRejectionSum,
            FinishWeight: dataSend.PaperWeightAndProcessRejectionSum,
            BurstingFactor: Values.bursting_factor,
            BurstingStrength: dataSend.burstingStrengthWithDecimal,
            CuttingAllowanceWidth: Values.cuttingAllowanceForWidth,
            CuttingAllowanceLength: Values.cuttingAllowanceForLength,
            GSM: Values.gsm,
            HeightBox: Values.height_box,
            LengthBox: Values.length_box,
            LengthSheetIncCuttingAllowance: dataSend.LengthSheetIncCuttingAllowance,
            LengthSheet: dataSend.lengthSheetWithDecimal,
            NoOfPly: Values.no_of_ply,
            PaperWeightAndProcessRejectionSum: dataSend.PaperWeightAndProcessRejectionSum,
            StitchingLengthInchperJoint: Values.stiching_length,
            WidthBox: Values.width_box,
            WidthSheetIncCuttingAllowance: dataSend.WidthSheetIncCuttingAllowance,
            WidthSheet: dataSend.widthSheetWithDecimal,
            FluteTypePercentage: Values.fluteTypePercent,
            IsIncludingBodySeparator: bodySeparator,
            RoundOffLengthSheetInchCuttingAllowance: bodySeparator ? Values.round_off_length_body : Values.round_length_inc_cutting_allowance,
            RoundOffWidthSheetInchCuttingAllowance: bodySeparator ? Values.round_off_width_body : Values.round_width_inc_cutting
        }

        dispatch(saveRawMaterialCalculationForCorrugatedBox(data, res => {
            setIsDisable(false)
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
                data.CalculatorType = 'CorrugatedBox'
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', data)
            }
        }))
    }), 100);
    const cancel = () => {
        props.toggleDrawer('')
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };
    return (
        <>
            <div className="user-page p-0">
                <div>
                    <form noValidate className="form"
                        onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                        <div className="costing-border border-top-0 px-4">
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
                                    <TooltipCustom disabledIcon={true} id={'bursting-strength'} tooltipText={'Bursting Strength = (No. of Ply * GSM * Busting Factor) / 1000'} />
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

                            {/* /////////////////////// */}
                            <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Box Details'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt15 corrugated-box-label-wrapper'}>
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
                                        label={`Height
                                        (Box)(mm)`}
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
                                <Col md="3" className={'double-string-label'}>
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
                            </Row>

                            <Row>


                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Sheet Details'}
                                        customClass={'underLine-title'}
                                    />

                                </Col>
                            </Row>
                            <Row className={'mt15 corrugated-box-label-wrapper'}>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'sheet-width'} tooltipText={'Width Sheet = (Width Box + Height Box) / 25.4'} />
                                    <TextFieldHookForm
                                        label={`Width(Sheet)(inch)`}
                                        name={'width_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        id={'sheet-width'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_sheet}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cutting Allowance`}
                                        name={'cuttingAllowanceForWidth'}
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
                                        errors={errors.cuttingAllowanceForWidth}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'sheet-width-cutting'} tooltipClass={'weight-of-sheet'} tooltipText={'Width Cutting Allowance = (Width Sheet + (2 * Cutting Allowance))'} />
                                    <TextFieldHookForm
                                        label={`Width + Cutting Allowance`}
                                        name={'width_inc_cutting'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'sheet-width-cutting'}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_inc_cutting}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'round_sheet-width-cutting'} tooltipClass={'weight-of-sheet'} tooltipText={'Round Off (Width Cutting Allowance)'} />
                                    <TextFieldHookForm
                                        label={`Round Off (Width + Cutting Allowance)`}
                                        name={'round_width_inc_cutting'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'round_sheet-width-cutting'}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.round_width_inc_cutting}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3" className='mt-2'>
                                    <TooltipCustom disabledIcon={true} id={'length-sheet'} tooltipClass={'weight-of-sheet'} tooltipText={'Length Sheet = (2 * (Length Box + Width Box) + Length Sheet) / 25.4'} />
                                    <TextFieldHookForm
                                        label={`Length(Sheet)(inch)`}
                                        name={'length_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'length-sheet'}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_sheet}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3" className='mt-2'>
                                    <TextFieldHookForm
                                        label={`Cutting Allowance`}
                                        name={'cuttingAllowanceForLength'}
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
                                        errors={errors.cuttingAllowanceForLength}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>

                                <Col md="3" className='mt-2'>
                                    <TooltipCustom disabledIcon={true} id={'length-cutting-al'} tooltipClass={'weight-of-sheet'} tooltipText={'Length Cutting Allowance = (Length Sheet + (2 * Cutting Allowance))'} />
                                    <TextFieldHookForm
                                        label={`Length + Cutting allowance`}
                                        name={'length_inc_cutting_allowance'}
                                        Controller={Controller}
                                        control={control}
                                        id={'length-cutting-al'}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_inc_cutting_allowance}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3" className='mt-2'>
                                    <TooltipCustom disabledIcon={true} id={'round_length-cutting-al'} tooltipClass={'weight-of-sheet'} tooltipText={'Quarter Round Off (Length + Cutting Allowance)'} />
                                    <TextFieldHookForm
                                        label={`Quarter Round Off (Length + Cutting Allowance)`}
                                        name={'round_length_inc_cutting_allowance'}
                                        Controller={Controller}
                                        control={control}
                                        id={'round_length-cutting-al'}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_inc_cutting_allowance}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                            {/* <Col md="3">   //This field is no more in the RM calculator Sheet
                                <TextFieldHookForm
                                    label={`Flute Type Percentage`}
                                    name={'fluteTypePercent'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        validate: { maxPercentValue },
                                        pattern: {
                                            value: /^\d{0,4}(\.\d{0,6})?$/i,
                                            message: 'Maximum length for integer is 4 and for decimal is 6',
                                        },
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.fluteTypePercent}
                                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                />
                            </Col> */}

                            <hr className="mx-n4 w-auto" />
                            <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Paper wt.+ Process Rejection(Kg)'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'paper-width'} tooltipClass={'weight-of-sheet'} tooltipText={'Paper wt. + Process Rejection = (Width Cutting Allowance * Length Cutting Allowance * No. of Ply * GSM / 1550) / 1000'} />
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
                        </div>

                        {<div className="col-sm-12 text-right mt-4">
                            {!CostingViewMode &&
                                <>
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel} >
                                        <div className={'cancel-icon'}></div> {'Cancel'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onSubmit}
                                        disabled={props.CostingViewMode || isDisable ? true : false}
                                        className="submit-button save-btn">
                                        <div className={'save-icon'}></div>
                                        {'Save'}
                                    </button>
                                </>}
                        </div>}

                    </form>
                </div>
            </div>
        </>
    )
}
export default CorrugatedBox