import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalculationForCorrugatedBox } from '../../../actions/CostWorking'
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { ceilByMultiple, checkForDecimalAndNull, checkForNull, loggedInUserId, number, checkWhiteSpaces, decimalAndNumberValidation, noDecimal, maxLength7 } from '../../../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import HeaderTitle from '../../../../common/HeaderTitle'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { maxPercentValue } from '../../../../../helper/validation'

function MeshCalculation(props) {
    const [dataSend, setDataSend] = useState({})
    const [isDisable, setIsDisable] = useState(false)
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
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
        width_sheet: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '', //
        cuttingAllowanceForWidth: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowanceWidth, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.WidthSheetIncCuttingAllowance : '',
        length_sheet: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '',
        cuttingAllowanceForLength: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceLength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowanceLength, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_inc_cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        paper_process: WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration.NoOfDecimalForInputOutput) : '',
        noOfMeshLength: WeightCalculatorRequest && WeightCalculatorRequest.NosOfMeshInLength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.NosOfMeshInLength, initialConfiguration.NoOfDecimalForInputOutput) : '',
        noOfMeshWidth: WeightCalculatorRequest && WeightCalculatorRequest.NosOfMeshInWidth !== null ? checkForDecimalAndNull(WeightCalculatorRequest.NosOfMeshInWidth, initialConfiguration.NoOfDecimalForInputOutput) : '',
        meshArrangement: WeightCalculatorRequest && WeightCalculatorRequest.MeshArrangement !== null ? { label: WeightCalculatorRequest.MeshArrangement, value: 2 } : '',
        fluteTypePercent: WeightCalculatorRequest && WeightCalculatorRequest.FluteTypePercentage ? checkForDecimalAndNull(WeightCalculatorRequest.FluteTypePercentage, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_RoundOff: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_RoundOff: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
    }
    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })

    const fieldValues = useWatch({
        control,
        name: ['no_of_ply', 'gsm', 'bursting_factor', 'length_box', 'width_box', 'noOfMeshLength', 'noOfMeshWidth', 'fluteTypePercent', 'cuttingAllowanceForWidth', 'cuttingAllowanceForLength'],
    })

    useEffect(() => {
        if (!CostingViewMode) {
            setBurstingStrength()
            setWidthSheet_LengthSheet()//
            setFinalGrossWeight()
        }
    }, [fieldValues])

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
            lengthBox: Number(getValues('length_box')),
            widthBox: Number(getValues('width_box')),
            heightBox: Number(getValues('height_box')),
            stichingLength: Number(getValues('stiching_length')),
            noOfMeshWidth: Number(getValues('noOfMeshWidth')),
            noOfMeshLength: Number(getValues('noOfMeshLength')),
            cuttingAllowanceForWidth: Number(getValues('cuttingAllowanceForWidth')),
            cuttingAllowanceForLength: Number(getValues('cuttingAllowanceForLength'))
        }

        let widthSheet = (checkForNull(data.widthBox) * checkForNull(data.noOfMeshWidth)) / 25.4;
        let width_inc_cutting = 0
        if (widthSheet) {
            width_inc_cutting = widthSheet + (2 * data.cuttingAllowanceForWidth)
        }

        let roundOffWidth = Math.round(width_inc_cutting)
        const lengthSheet = (checkForNull(data.noOfMeshLength) * checkForNull(data.lengthBox)) / 25.4;

        let length_inc_cutting_allowance = 0
        if (lengthSheet) {
            length_inc_cutting_allowance = lengthSheet + (2 * data.cuttingAllowanceForLength)
        }

        let length_RoundOff = ceilByMultiple(length_inc_cutting_allowance, 0.25)    //ROUND OFF TO 0.25 (Common function)

        setDataSend(prevState => ({ ...prevState, widthSheetWithDecimal: widthSheet, lengthSheetWithDecimal: lengthSheet, widthIncCuttingAllowance: width_inc_cutting, roundOffWidth: roundOffWidth, length_RoundOff: length_RoundOff, length_inc_cutting_allowance: length_inc_cutting_allowance }))
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


    const setFinalGrossWeight = () => {

        let data = {
            ftp: Number(getValues('fluteTypePercent')), //FTP
            no_of_ply: Number(getValues('no_of_ply')), //NP
            gsm: checkForNull(getValues('gsm')),//GSM,
            widthBox: Number(getValues('width_box')),
            noOfMeshWidth: Number(getValues('noOfMeshWidth')),
            cuttingAllowanceForWidth: Number(getValues('cuttingAllowanceForWidth')),
            cuttingAllowanceForLength: Number(getValues('cuttingAllowanceForLength')),
            lengthBox: Number(getValues('length_box')),
            noOfMeshLength: Number(getValues('noOfMeshLength')),
        }

        let widthSheet = (checkForNull(data.widthBox) * checkForNull(data.noOfMeshWidth)) / 25.4;
        let width_inc_cutting = 0
        if (widthSheet) {
            width_inc_cutting = widthSheet + (2 * data.cuttingAllowanceForWidth)
        }
        let roundOffWidth = Math.round(width_inc_cutting)

        const lengthSheet = (checkForNull(data.noOfMeshLength) * checkForNull(data.lengthBox)) / 25.4;
        let length_inc_cutting_allowance = 0
        if (lengthSheet) {
            length_inc_cutting_allowance = lengthSheet + (2 * data.cuttingAllowanceForLength)
        }
        let length_RoundOff = ceilByMultiple(length_inc_cutting_allowance, 0.25)    //ROUND OFF TO 0.25 (Common function)

        const WidthIncCuttingAllowance = checkForNull(roundOffWidth);
        const LengthIncCuttingAllowance = checkForNull(length_RoundOff);
        const NoOfPly = parseInt(data.no_of_ply);
        const Gsm = parseInt(data.gsm);
        const fluteTypePercent = checkForNull(data.ftp)

        const gross = (WidthIncCuttingAllowance * LengthIncCuttingAllowance * NoOfPly * Gsm * fluteTypePercent) / 1550;
        const finalGross = gross / 1000;

        setDataSend(prevState => ({ ...prevState, paperWithDecimal: finalGross }))
        setTimeout(() => {
            setValue('paper_process', checkForDecimalAndNull(finalGross, localStorage.NoOfDecimalForInputOutput));
        }, 200);

    }

    const onSubmit = debounce(handleSubmit((Values) => {
        setIsDisable(true)
        let data = {
            LayoutType: 'Mesh',
            CorrugatedBoxWeightCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId ? WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId : "0",
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialIdRef: rmRowData.RawMaterialId,
            RawMaterialCost: dataSend.paperWithDecimal * rmRowData.RMRate,  //(GROSS WEIGHT * RM RATE)
            GrossWeight: dataSend.paperWithDecimal,
            FinishWeight: dataSend.paperWithDecimal,
            CuttingAllowanceWidth: Values.cuttingAllowanceForWidth,
            CuttingAllowanceLength: Values.cuttingAllowanceForLength,
            HeightBox: Values.height_box,
            NoOfPly: Values.no_of_ply,
            GSM: Values.gsm,
            BurstingFactor: Values.bursting_factor,
            BurstingStrength: dataSend.burstingStrengthWithDecimal,
            LengthBox: Values.length_box,
            WidthBox: Values.width_box,
            NosOfMeshInLength: Values.noOfMeshLength,
            NosOfMeshInWidth: Values.noOfMeshWidth,
            MeshArrangement: Values.meshArrangement.label,
            PaperWeightAndProcessRejectionSum: dataSend.paperWithDecimal,
            FluteTypePercentage: Values.fluteTypePercent,
            WidthSheet: dataSend.widthSheetWithDecimal,
            WidthSheetIncCuttingAllowance: dataSend.widthIncCuttingAllowance,
            RoundOffWidthSheetInchCuttingAllowance: dataSend.roundOffWidth,
            LengthSheet: dataSend.lengthSheetWithDecimal,
            LengthSheetIncCuttingAllowance: dataSend.length_inc_cutting_allowance,
            RoundOffLengthSheetInchCuttingAllowance: dataSend.length_RoundOff,
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

                            {/* /////////////////////// */}
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
                            </Row>



                            <Row>
                                <Col md="12" className={''}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Mesh Details'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt15'}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`No. of mesh in Length`}
                                        name={'noOfMeshLength'}
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
                                        errors={errors.noOfMeshLength}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`No. of mesh in Width`}
                                        name={'noOfMeshWidth'}
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
                                        errors={errors.noOfMeshWidth}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>



                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Mesh Arrangement`}
                                        name={'meshArrangement'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        options={[{
                                            label: 'Horizontal',
                                            value: 1,
                                        },
                                        {
                                            label: 'Vertical',
                                            value: 2,
                                        },
                                        ]}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.meshArrangement}
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
                                    <TooltipCustom disabledIcon={true} id={'sheet-width'} tooltipText={'Width Sheet = (No.of mesh in width * Width Box) / 25.4'} />
                                    <TextFieldHookForm
                                        label={`Width(Sheet)(Inch/Mesh)`}
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
                                    <TooltipCustom disabledIcon={true} id={'sheet-width-cutting-inc'} tooltipClass={'weight-of-sheet'} tooltipText={'Width Cutting Allowance = (Width Sheet + (2 * Cutting Allowance)'} />
                                    <TextFieldHookForm
                                        label={`Sheet Width + Cutting Allowance`}
                                        name={'width_inc_cutting'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'sheet-width-cutting-inc'}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_inc_cutting}
                                        disabled={true}
                                    />
                                </Col>


                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'round-off-width'} tooltipClass={'weight-of-sheet'} tooltipText={'Round Off (Width + Cutting Allowance)'} />
                                    <TextFieldHookForm
                                        label={`Round Off (Width + Cutting Allowance)`}
                                        name={'width_RoundOff'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'round-off-width'}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.width_RoundOff}
                                        disabled={true}
                                    />
                                </Col>


                                <Col md="3" className='mt-2'>
                                    <TooltipCustom disabledIcon={true} id={'length-sheet'} tooltipClass={'weight-of-sheet'} tooltipText={'Length Sheet = (No.of mesh in Length * Length Box ) / 25.4'} />
                                    <TextFieldHookForm
                                        label={`Length(Sheet)(Inch/Mesh)`}
                                        name={'length_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'length-sheet'}
                                        mandatory={false}
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
                                        label={`Sheet Length + Cutting Allowance`}
                                        name={'length_inc_cutting_allowance'}
                                        Controller={Controller}
                                        control={control}
                                        id={'length-cutting-al'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_inc_cutting_allowance}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3" className='mt-2'>
                                    <TooltipCustom disabledIcon={true} id={'quarter-length-calculator'} tooltipClass={'weight-of-sheet'} tooltipText={'Quarter Round Off (Length + Cutting Allowance) = 0.25 * Sheet Length + Cutting Allowance'} />
                                    <TextFieldHookForm
                                        label={`Quarter Round Off (Length + Cutting Allowance)`}
                                        name={'length_RoundOff'}
                                        Controller={Controller}
                                        id={'quarter-length-calculator'}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.length_RoundOff}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Flute Type Percentage`}
                                        name={'fluteTypePercent'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, maxPercentValue },
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
                                </Col>

                            </Row>
                            <hr className="mx-n4 w-auto" />
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
                            {!CostingViewMode && <>
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
export default MeshCalculation