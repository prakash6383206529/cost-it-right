import React, { useState, useContext, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalculationForCorrugatedBox } from '../../actions/CostWorking'

import { TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../common/Toaster'
import HeaderTitle from '../../../common/HeaderTitle'

function CorrugatedBox(props) {
    const [dataSend, setDataSend] = useState({})
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, CostingViewMode } = props
    const dispatch = useDispatch()
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const defaultValues = {
        no_of_ply: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPly !== null ? WeightCalculatorRequest.NoOfPly : '',
        gsm: WeightCalculatorRequest && WeightCalculatorRequest.GSM !== null ? WeightCalculatorRequest.GSM : '',
        bursting_factor: WeightCalculatorRequest && WeightCalculatorRequest.BurstingFactor !== null ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingFactor, initialConfiguration.NoOfDecimalForInputOutput) : '',
        bursting_strength: WeightCalculatorRequest && WeightCalculatorRequest.BurstingStrength !== null ? checkForDecimalAndNull(WeightCalculatorRequest.BurstingStrength, initialConfiguration.NoOfDecimalForInputOutput) : '',
        length_box: WeightCalculatorRequest && WeightCalculatorRequest.LengthBox !== null ? WeightCalculatorRequest.LengthBox : '',
        width_box: WeightCalculatorRequest && WeightCalculatorRequest.WidthBox !== null ? WeightCalculatorRequest.WidthBox : '',
        height_box: WeightCalculatorRequest && WeightCalculatorRequest.HeightBox !== null ? WeightCalculatorRequest.HeightBox : '',
        stiching_length: WeightCalculatorRequest && WeightCalculatorRequest.StitchingLengthInchPerJoint !== null ? WeightCalculatorRequest.StitchingLengthInchPerJoint : '',
        width_sheet: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '', // 
        cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceWidth !== undefined ? WeightCalculatorRequest.CuttingAllowanceWidth : '',
        width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.WidthSheetIncCuttingAllowance : '',
        length_sheet: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '',
        cuttingAllowanceForLength: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceLength !== null ? WeightCalculatorRequest.CuttingAllowanceLength : '',
        length_inc_cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        paper_process: WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration.NoOfDecimalForInputOutput) : '',
    }
    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })

    const costData = useContext(costingInfoContext)

    const fieldValues = useWatch({
        control,
        name: ['no_of_ply', 'gsm', 'bursting_factor', 'length_box', 'height_box', 'cutting_allowance', 'width_inc_cutting'],
    })

    useEffect(() => {
        if (CostingViewMode !== true) {
            setBurstingStrength()
            setWidthCuttingAllowance()
            setWidthSheet_LengthSheet()
            setLengthCuttingAllowance()
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
            cuttingAllowance: getValues('cutting_allowance'),
            widthSheet: dataSend.widthSheetWithDecimal

        }
        if (data1.cuttingAllowance) {

            const widthCuttingAllowance = data1.widthSheet + (2 * data1.cuttingAllowance);              //
            const widthIncCuttingAllowance = Math.round(widthCuttingAllowance);
            setDataSend(prevState => ({ ...prevState, widthIncCuttingDecimal: widthIncCuttingAllowance }))

            setTimeout(() => {

                setValue('width_inc_cutting', widthIncCuttingAllowance);
            }, 200);
        }
    }

    const setLengthCuttingAllowance = () => {

        let data = {
            widthSheet: dataSend.widthSheetWithDecimal,
            cuttingAllowanceForLength: getValues('cuttingAllowanceForLength'),
        }

        if (data.cuttingAllowanceForLength) {
            const lengthIncCuttingAllowance = ((data.widthSheet) + 2 * (data.cuttingAllowanceForLength));            // Formula to calculate length inc cutting allowance
            setDataSend(prevState => ({ ...prevState, LengthCuttingAllowance: lengthIncCuttingAllowance }))
            setTimeout(() => {

                setValue('length_inc_cutting_allowance', checkForDecimalAndNull(lengthIncCuttingAllowance, localStorage.NoOfDecimalForInputOutput));
            }, 200);
        }
    }

    const setFinalGrossWeight = () => {

        let data = {
            width_inc_cutting: dataSend.widthIncCuttingDecimal,
            length_inc_cutting_allowance: dataSend.LengthCuttingAllowance,
            no_of_ply: getValues('no_of_ply'),
            gsm: getValues('gsm')

        }

        if (data.length_inc_cutting_allowance) {
            const WidthIncCuttingAllowance = Number(data.width_inc_cutting);
            const LengthIncCuttingAllowance = parseInt(data.length_inc_cutting_allowance);
            const NoOfPly = parseInt(data.no_of_ply);
            const Gsm = parseInt(data.gsm);

            const gross = (WidthIncCuttingAllowance * LengthIncCuttingAllowance * NoOfPly * Gsm) / 1550;
            const finalGross = gross / 1000;
            setDataSend(prevState => ({ ...prevState, paperWithDecimal: finalGross }))

            setTimeout(() => {
                setValue('paper_process', checkForDecimalAndNull(finalGross, localStorage.NoOfDecimalForInputOutput));
            }, 200);
        }
    }

    const onSubmit = (Values) => {
        let data = {
            CorrugatedBoxWeightCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId ? WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId : "0",
            BaseCostingIdRef: costData.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialIdRef: rmRowData.RawMaterialId,
            RawMaterialCost: dataSend.paperWithDecimal * rmRowData.RMRate,  //(GROSS WEIGHT * RM RATE)
            GrossWeight: dataSend.paperWithDecimal,
            FinishWeight: dataSend.paperWithDecimal,
            BurstingFactor: Values.bursting_factor,
            BurstingStrength: dataSend.burstingStrengthWithDecimal,
            CuttingAllowanceWidth: Values.cutting_allowance,
            CuttingAllowanceLength: Values.cuttingAllowanceForLength,
            GSM: Values.gsm,
            HeightBox: Values.height_box,
            LengthBox: Values.length_box,
            LengthSheetIncCuttingAllowance: dataSend.LengthCuttingAllowance,
            LengthSheet: dataSend.lengthSheetWithDecimal,
            NoOfPly: Values.no_of_ply,
            PaperWeightAndProcessRejectionSum: dataSend.paperWithDecimal,
            StitchingLengthInchperJoint: Values.stiching_length,
            WidthBox: Values.width_box,
            WidthSheetIncCuttingAllowance: dataSend.widthIncCuttingDecimal,
            WidthSheet: dataSend.widthSheetWithDecimal,
        }

        dispatch(saveRawMaterialCalculationForCorrugatedBox(data, res => {
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', data)
            }
        }))
    }
    const cancel = () => {
        props.toggleDrawer('')
    }
    return (
        <>
            <div className="user-page p-0">
                <div>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
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
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                    <TextFieldHookForm
                                        label={`Bursting Strength`}
                                        name={'bursting_strength'}
                                        Controller={Controller}
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
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                            pattern: {
                                                value: /^(0|[1-9]\d*)(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            }
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

                                    <TextFieldHookForm
                                        label={`Width(Sheet)(inch)`}
                                        name={'width_sheet'}
                                        Controller={Controller}
                                        control={control}
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
                                        name={'cutting_allowance'}
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

                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.cutting_allowance}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>


                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Width(sheet) inc. Cutting allowance`}
                                        name={'width_inc_cutting'}
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
                                        errors={errors.width_inc_cutting}
                                        disabled={true}
                                    />
                                </Col>


                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Length(Sheet)(inch)`}
                                        name={'length_sheet'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },
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
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

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
                                    <TextFieldHookForm
                                        label={`Length(sheet) inc. Cutting allowance`}
                                        name={'length_inc_cutting_allowance'}
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
                                        errors={errors.length_inc_cutting_allowance}
                                        disabled={true}
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
                                    <TextFieldHookForm
                                        label={'Paper wt.+ Process Rejection(Kg)'}
                                        name={'paper_process'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.'
                                            },

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
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={cancel} >
                                <div className={'cancel-icon'}></div> {'Cancel'}
                            </button>
                            <button
                                type={'submit'}
                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                className="submit-button save-btn">
                                <div className={'save-icon'}></div>
                                {'Save'}
                            </button>
                        </div>}

                    </form>
                </div>
            </div>
        </>
    )




}
export default CorrugatedBox