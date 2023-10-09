import React, { useEffect } from "react";
import { Col, Row } from "reactstrap";
import { useForm, Controller, useWatch } from 'react-hook-form'
import { NumberFieldHookForm, TextFieldHookForm } from "../../../../layout/HookFormInputs";
import HeaderTitle from "../../../../common/HeaderTitle";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { BoxDetails, ProcessAndRejection, RMSection } from "./CorrugatedSections";
import { form } from "react-dom-factories";
import { debounce } from "lodash";
import { loggedInUserId } from "../../../../../helper";
import { checkForDecimalAndNull, maxPercentValue } from '../../../../../helper/validation'
import { saveRawMaterialCalculationForCorrugatedBox } from "../../../actions/CostWorking";
import Toaster from "../../../../common/Toaster";
import Button from "../../../../layout/Button";
import TooltipCustom from "../../../../common/Tooltip";

const Flap = (props) => {
    const { corrugatedDataObj } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, CostingViewMode, item } = props;
    const dispatch = useDispatch()
    const [grossWeight, setGrossWeight] = useState(0)
    const defaultValues = {
        NoOfFlap: WeightCalculatorRequest && WeightCalculatorRequest.NoOfFlap !== null ? WeightCalculatorRequest.NoOfFlap : '',
        MaxFlapSize: WeightCalculatorRequest && WeightCalculatorRequest.MaxFlapSize !== null ? checkForDecimalAndNull(WeightCalculatorRequest.MaxFlapSize, initialConfiguration.NoOfDecimalForInputOutput) : '',
        ToungeLengthSize: WeightCalculatorRequest && WeightCalculatorRequest.ToungeLengthSize !== null ? checkForDecimalAndNull(WeightCalculatorRequest.ToungeLengthSize, initialConfiguration.NoOfDecimalForInputOutput) : '',
        width_sheet_body: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.WidthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '', //
        cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceWidth !== undefined ? WeightCalculatorRequest.CuttingAllowanceWidth : '',
        width_inc_cutting_body: WeightCalculatorRequest && WeightCalculatorRequest.WidthSheetIncCuttingAllowance !== null ? WeightCalculatorRequest.WidthSheetIncCuttingAllowance : '',
        length_sheet_body: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheet !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheet, initialConfiguration.NoOfDecimalForInputOutput) : '',
        cuttingAllowanceForLength: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowanceLength !== null ? WeightCalculatorRequest.CuttingAllowanceLength : '',
        length_inc_cutting_allowance_body: WeightCalculatorRequest && WeightCalculatorRequest.LengthSheetIncCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.LengthSheetIncCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        paper_process: WeightCalculatorRequest && WeightCalculatorRequest.PaperWeightAndProcessRejectionSum !== null ? checkForDecimalAndNull(WeightCalculatorRequest.PaperWeightAndProcessRejectionSum, initialConfiguration.NoOfDecimalForInputOutput) : '',
        fluteTypePercent: WeightCalculatorRequest && WeightCalculatorRequest.FluteTypePercentage !== null ? checkForDecimalAndNull(WeightCalculatorRequest.FluteTypePercentage, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_length_inc_cutting_allowance: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_off_length_body: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffLengthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_width_inc_cutting: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : '',
        round_off_width_body: WeightCalculatorRequest && WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance !== null ? checkForDecimalAndNull(WeightCalculatorRequest.RoundOffWidthSheetInchCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput) : ''
    }
    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues
        })
    const fieldValues = useWatch({
        control,
        name: ['NoOfFlap', 'MaxFlapSize', 'ToungeLengthSize', 'cutting_allowance', 'cuttingAllowanceForLength', 'fluteTypePercent', 'width_sheet_body', 'length_sheet_body'],
    })
    useEffect(() => {
        setFlapData();
    }, [corrugatedDataObj])
    useEffect(() => {
        let widthOfCuttingAllowance = Number(getValues('width_sheet_body')) + (2 * Number(getValues('cutting_allowance')));
        let heightOfCuttingAllowance = Number(getValues('length_sheet_body')) + (2 * Number(getValues('cuttingAllowanceForLength')));
        if (corrugatedDataObj) {
            const { RMData, BoxData } = corrugatedDataObj
            if (RMData) {
                let getWeightSheet = (Math.round(widthOfCuttingAllowance) * Math.round(heightOfCuttingAllowance) * RMData.noOfPly * Number(getValues('fluteTypePercent')) * RMData.gsm / 1550) / 1000
                setGrossWeight(prevState => ({ ...prevState, paperWithDecimal: getWeightSheet }))
            }
            let widthOfFlap = (Number(getValues('NoOfFlap') * (Number(getValues('MaxFlapSize')) + Number(getValues('ToungeLengthSize'))) + BoxData.heightBox) / 25.4);
            setTimeout(() => {
                setValue('width_sheet_body', checkForDecimalAndNull(widthOfFlap, initialConfiguration.NoOfDecimalForInputOutput))
                setValue('width_inc_cutting_body', checkForDecimalAndNull(widthOfCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput))
                setValue('round_off_width_body', checkForDecimalAndNull(Math.round(widthOfCuttingAllowance), initialConfiguration.NoOfDecimalForInputOutput))
                setValue('length_inc_cutting_allowance_body', checkForDecimalAndNull(heightOfCuttingAllowance, initialConfiguration.NoOfDecimalForInputOutput))
                setValue('round_off_length_body', checkForDecimalAndNull(Math.round(heightOfCuttingAllowance), initialConfiguration.NoOfDecimalForInputOutput))
            }, 50);
        }
    }, [fieldValues])
    const setFlapData = () => {
        if (corrugatedDataObj) {
            const { BoxData } = corrugatedDataObj
            if (BoxData) {
                let LengthOfBody = (BoxData.lengthBox + (BoxData.heightBox * 2)) / 25.4;
                setTimeout(() => {
                    setValue('length_sheet_body', checkForDecimalAndNull(LengthOfBody, initialConfiguration.NoOfDecimalForInputOutput))
                }, 50);
            }
        }
    }
    const onSubmit = debounce(handleSubmit((Values) => {
        const { RMData, BoxData } = corrugatedDataObj
        // setIsDisable(true)
        let data = {
            LayoutType: 'Flap',
            CorrugatedBoxWeightCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId ? WeightCalculatorRequest.CorrugatedBoxWeightCalculatorId : "0",
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialIdRef: rmRowData.RawMaterialId,
            RawMaterialCost: grossWeight.paperWithDecimal * rmRowData.RMRate,  //(GROSS WEIGHT * RM RATE)
            GrossWeight: grossWeight.paperWithDecimal,
            FinishWeight: grossWeight.paperWithDecimal,
            CuttingAllowanceWidth: Values.cutting_allowance,
            CuttingAllowanceLength: Values.cuttingAllowanceForLength,
            NoOfPly: RMData.noOfPly,
            GSM: RMData.gsm,
            BurstingFactor: RMData.burstingFactor,
            BurstingStrength: corrugatedDataObj.burstingStrengthWithDecimal,
            LengthBox: BoxData.lengthBox,
            WidthBox: BoxData.widthBox,
            HeightBox: BoxData.heightBox,
            StitchingLengthInchperJoint: BoxData.stichingLength,
            PaperWeightAndProcessRejectionSum: grossWeight.paperWithDecimal,
            WidthSheet: Values.width_sheet_body,
            NoOfFlap: Values.NoOfFlap,
            MaxFlapSize: Values.MaxFlapSize,
            ToungeLengthSize: Values.ToungeLengthSize,
            WidthSheetIncCuttingAllowance: Values.width_inc_cutting_body,
            RoundOffWidthSheetInchCuttingAllowance: Values.round_off_width_body,
            LengthSheet: Values.length_sheet_body,
            LengthSheetIncCuttingAllowance: Values.length_inc_cutting_allowance_body,
            RoundOffLengthSheetInchCuttingAllowance: Values.round_off_length_body,
            FluteTypePercentage: Values.fluteTypePercent,
        }


        dispatch(saveRawMaterialCalculationForCorrugatedBox(data, res => {
            // setIsDisable(false)
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
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
            <form noValidate className="form"
                onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                <RMSection WeightCalculatorRequest={WeightCalculatorRequest} CostingViewMode={CostingViewMode} />
                <BoxDetails CostingViewMode={CostingViewMode} WeightCalculatorRequest={WeightCalculatorRequest} />
                <Row className="mt-3 corrugated-box-label-wrapper">
                    <Col md="12" className={''}>
                        <HeaderTitle className="border-bottom"
                            title={'Flap Details'}
                            customClass={'underLine-title'}
                        />
                    </Col>
                    <Col md="3">
                        <NumberFieldHookForm
                            label={`No. of Flap`}
                            name={'NoOfFlap'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                                required: true,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },
                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NoOfFlap}
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>
                    <Col md="3">
                        <NumberFieldHookForm
                            label={`Max Flap Size`}
                            name={'MaxFlapSize'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                                required: true,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },
                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.MaxFlapSize}
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>
                    <Col md="3">
                        <NumberFieldHookForm
                            label={`Tounge Length Size`}
                            name={'ToungeLengthSize'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                                required: true,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },
                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ToungeLengthSize}
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>
                    <Col md="3">
                        <TooltipCustom disabledIcon={true} id={'sheet-width'} tooltipText={'Width  = (Width Box + (Height Box * 2)) / 25.4'} />
                        <NumberFieldHookForm
                            label={`Width (inch)`}
                            name={'width_sheet_body'}
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
                            name={'cutting_allowance'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                                required: true,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },

                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.cutting_allowance}
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>

                    <Col md="3">
                        <TooltipCustom disabledIcon={true} id={'sheet-width-cutting'} tooltipClass={'weight-of-sheet'} tooltipText={'Width Cutting Allowance = (Width + (2 * Cutting Allowance))'} />
                        <NumberFieldHookForm
                            label={`Width + Cutting allowance`}
                            name={'width_inc_cutting_body'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            id={'sheet-width-cutting'}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
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
                            label={`Round Off (Width + Cutting Allowance)`}
                            name={'round_off_width_body'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },
                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.round_off_width}
                            disabled={true}
                        />
                    </Col>

                    <Col md="3">
                        <TooltipCustom disabledIcon={true} id={'length-sheet'} tooltipClass={'weight-of-sheet'} tooltipText={'Length Sheet =  (Length Box + (Height Box * 2)) / 25.4'} />
                        <NumberFieldHookForm
                            label={`Length (inch)`}
                            name={'length_sheet_body'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            id={'length-sheet'}
                            mandatory={false}
                            rules={{
                                required: true,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
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
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },

                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.cutting_allowance}
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>

                    <Col md="3" className='mt-2'>
                        <TooltipCustom disabledIcon={true} id={'length-cutting-al'} tooltipClass={'weight-of-sheet'} tooltipText={'Length Cutting Allowance = (Length + (2 * Cutting Allowance)) '} />
                        <NumberFieldHookForm
                            label={`Length + Cutting allowance`}
                            name={'length_inc_cutting_allowance_body'}
                            Controller={Controller}
                            control={control}
                            id={'length-cutting-al'}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
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


                    <Col md="3" className='mt-2'>
                        <TooltipCustom disabledIcon={true} id={'quarter-length-calculator'} tooltipClass={'weight-of-sheet'} tooltipText={'Quarter Round Off (Length + Cutting Allowance) = 0.25 * Sheet Length + Cutting Allowance'} />
                        <TextFieldHookForm
                            label={`Quarter Round Off (Length + Cutting Allowance)`}
                            name={'round_off_length_body'}
                            Controller={Controller}
                            id={'quarter-length-calculator'}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: {
                                    value: /^\d{0,4}(\.\d{0,6})?$/i,
                                    message: 'Maximum length for integer is 4 and for decimal is 6',
                                },

                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.round_off_length}
                            disabled={true}
                        />
                    </Col>
                    <Col md="3" className='mt-2'>
                        <NumberFieldHookForm
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
                            disabled={CostingViewMode ? CostingViewMode : false}
                        />
                    </Col>

                </Row>
                <ProcessAndRejection WeightCalculatorRequest={WeightCalculatorRequest} CostingViewMode={CostingViewMode} data={grossWeight} />
                <Row>
                    <Col md="12" className="d-flex justify-content-end pb-4">
                        <Button
                            id="BoxSeparate_cancel"
                            onClick={cancel}
                            className="my-0 mr-2 cancel-btn"
                            variant="reset"
                            icon="cancel-icon"
                            disabled={CostingViewMode ? true : false}
                        >
                            Cancel
                        </Button>
                        <Button
                            id="BoxSeparate_submit"
                            onClick={onSubmit}
                            className="svae-btn"
                            icon="save-icon"
                            disabled={CostingViewMode ? true : false}
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
            </form>
        </>
    )
}
export default Flap;