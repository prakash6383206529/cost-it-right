import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation, calculateScrapWeight, calculatePercentage } from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG, G } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import { nonZero } from '../../../../../helper/validation'
import TooltipCustom from '../../../../common/Tooltip'
import { useLabels } from '../../../../../helper/core'

function Coil(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, item, CostingViewMode } = props
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const { finishWeightLabel } = useLabels()

    const convert = (FinishWeightOfSheet, dimmension) => {
        switch (dimmension) {
            case DISPLAY_G:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet)
                }, 200);
                break;
            case DISPLAY_KG:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet * 1000)
                }, 200);
                break;
            case DISPLAY_MG:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet / 1000)
                }, 200);
                break;
            default:
                break;
        }
    }

    const defaultValues = {
        StripWidth: WeightCalculatorRequest && WeightCalculatorRequest?.StripWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.StripWidth, localStorage.NoOfDecimalForInputOutput) : '',
        Thickness: WeightCalculatorRequest && WeightCalculatorRequest?.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
        Pitch: WeightCalculatorRequest && WeightCalculatorRequest?.Pitch !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Pitch, localStorage.NoOfDecimalForInputOutput) : '',
        Cavity: WeightCalculatorRequest && WeightCalculatorRequest?.Cavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Cavity, localStorage.NoOfDecimalForInputOutput) : 1,
        NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest?.NetSurfaceArea !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetSurfaceArea, localStorage.NoOfDecimalForInputOutput) : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest?.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, localStorage.NoOfDecimalForInputOutput) : '',
        scrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '',
    }

    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })


    const [UOMDimension, setUOMDimension] = useState(
        WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
            ? { label: WeightCalculatorRequest.UOMForDimension, value: WeightCalculatorRequest.UOMForDimensionId, }
            : [],
    )
    const [dataToSend, setDataToSend] = useState({
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : ''
    })
    const [isChangeApplies, setIsChangeApplied] = useState(true)
    const tempOldObj = WeightCalculatorRequest
    const [GrossWeight, setGrossWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '')
    const [FinishWeight, setFinishWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : '')
    const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)
    const [isDisable, setIsDisable] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [scrapWeight, setScrapWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '')

    const fieldValues = useWatch({
        control,
        name: ['StripWidth', 'Thickness', 'Pitch', 'Cavity', 'scrapRecoveryPercent'],
    })

    const dispatch = useDispatch()

    useEffect(() => {
        //UNIT TYPE ID OF DIMENSIONS
        dispatch(getUOMSelectList(res => {
            const Data = res.data.Data
            const kgObj = Data.find(el => el.Text === G)
            setTimeout(() => {
                setValue('UOMDimension', WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
                    ? {
                        label: WeightCalculatorRequest.UOMForDimension,
                        value: WeightCalculatorRequest.UOMForDimensionId,
                    }
                    : { label: kgObj.Display, value: kgObj.Value })
                setUOMDimension(WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
                    ? {
                        label: WeightCalculatorRequest.UOMForDimension,
                        value: WeightCalculatorRequest.UOMForDimensionId,
                    }
                    : { label: kgObj.Display, value: kgObj.Value })
            }, 100);

        }))
    }, [])

    useEffect(() => {
        if (Number(getValues('FinishWeight')) < Number(getValues('GrossWeight'))) {
            delete errors.FinishWeight
            setRerender(!reRender)
        }
    }, [getValues('GrossWeight'), fieldValues])

    useEffect(() => {
        if (!CostingViewMode) {
            scrapWeightCalculation()
        }
    }, [fieldValues, FinishWeight])
    const setFinishWeight = (e) => {
        const FinishWeight = e.target.value
        switch (UOMDimension.label) {
            case DISPLAY_G:
                setTimeout(() => {
                    setFinishWeights(FinishWeight)
                }, 200);
                break;
            case DISPLAY_KG:
                setTimeout(() => {
                    setFinishWeights(FinishWeight * 1000)
                }, 200);
                break;
            case DISPLAY_MG:
                setTimeout(() => {
                    setFinishWeights(FinishWeight / 1000)
                }, 200);
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        if (!CostingViewMode) {
            setGrossWeight()
        }
    }, [fieldValues])


    /**
     * @method setGrossWeight
     * @description SET GROSS WEIGHT
     */
    const setGrossWeight = () => {

        let grossWeight
        let data = {
            density: rmRowData.Density / 1000,
            stripWidth: checkForNull(getValues('StripWidth')),
            thickness: checkForNull(getValues('Thickness')),
            pitch: checkForNull(getValues('Pitch')),
            cavity: getValues('Cavity')
        }
        grossWeight = calculateWeight(data.density, data.stripWidth, data.thickness, data.pitch) / data.cavity
        setGrossWeights(grossWeight) // for coverting into gram
        const updatedValue = dataToSend
        updatedValue.GrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
        updatedValue.newGrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
        setDataToSend(updatedValue)
        // setGrossWeights(grossWeight)
        setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
    }


    /**
     * @method renderListing
     * @description Used show listing of unit of measurement
     */
    const renderListing = (label) => {
        const temp = []

        if (label === 'UOM') {
            UOMSelectList &&
                UOMSelectList.map((item) => {
                    const accept = AcceptableSheetMetalUOM.includes(item.Text)
                    if (accept === false) return false
                    if (item.Value === '0') return false
                    temp.push({ label: item.Display, value: item.Value })
                    return null
                })
            return temp
        }
    }


    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = () => {
        props.toggleDrawer('')
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = debounce(handleSubmit((values) => {
        setIsDisable(true)
        if (WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId !== "00000000-0000-0000-0000-000000000000") {
            if (tempOldObj.GrossWeight !== dataToSend.GrossWeight || tempOldObj.FinishWeight !== dataToSend.FinishWeight || tempOldObj.NetSurfaceArea !== dataToSend.NetSurfaceArea || tempOldObj.UOMForDimensionId !== UOMDimension.value) {
                setIsChangeApplied(true)
            } else {
                setIsChangeApplied(false)
            }
        }


        let grossWeight = (dataToSend.newGrossWeight === undefined || dataToSend.newGrossWeight === 0) ? dataToSend.GrossWeight : dataToSend.newGrossWeight

        let data = {
            LayoutType: 'Coil',
            SheetMetalCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.SheetMetalCalculationId ? WeightCalculatorRequest.SheetMetalCalculationId : "0",
            IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialCost: grossWeight * rmRowData.RMRate - (grossWeight - getValues('FinishWeight')) * calculatePercentage(getValues('scrapRecoveryPercent')) * rmRowData.ScrapRate,
            UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
            UOMForDimension: UOMDimension ? UOMDimension.label : '',
            Thickness: values.Thickness,
            StripWidth: values.StripWidth,
            Cavity: values.Cavity,
            Pitch: values.Pitch,
            // Side: isOneSide, why and where
            UOMId: rmRowData.UOMId,
            UOM: rmRowData.UOM,
            NetSurfaceArea: values.NetSurfaceArea,
            GrossWeight: grossWeight,
            FinishWeight: getValues('FinishWeight'),
            RecoveryPercentage: getValues('scrapRecoveryPercent'),
            ScrapWeight: getValues('scrapWeight'),
        }

        dispatch(saveRawMaterialCalculationForSheetMetal(data, res => {
            setIsDisable(false)
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', data)
            }
        }))
    }), 500)

    const handleUnit = (value) => {
        setValue('UOMDimension', { label: value.label, value: value.value })
        setUOMDimension(value)
        let grossWeight = GrossWeight
        let ScrapWeight = scrapWeight
        // let finishWeight = FinishWeightOfSheet
        setDataToSend(prevState => ({ ...prevState, newGrossWeight: setValueAccToUOM(grossWeight, value.label), newFinishWeight: setValueAccToUOM(FinishWeight, value.label) }))
        setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, value.label), localStorage.NoOfDecimalForInputOutput))
        setValue('FinishWeight', checkForDecimalAndNull(setValueAccToUOM(FinishWeight, value.label), localStorage.NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull(setValueAccToUOM(ScrapWeight, value.label), localStorage.NoOfDecimalForInputOutput))
    }

    const UnitFormat = () => {
        return <>Net Surface Area(mm<sup>2</sup>)</>
        // return (<sup>2</sup>)
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    const scrapWeightCalculation = () => {
        const scrapRecoveryPercent = Number((getValues('scrapRecoveryPercent')))
        const grossWeight = Number(GrossWeight)
        const finishWeight = Number(FinishWeight)
        const scrapWeight = calculateScrapWeight(grossWeight, finishWeight, scrapRecoveryPercent)
        setScrapWeight(checkForDecimalAndNull(scrapWeight, localStorage.NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull((setValueAccToUOM(scrapWeight, UOMDimension.label)), localStorage.NoOfDecimalForInputOutput))
    }

    const unitFormulaMap = {
        g: 'Gross Weight (g) = (Density * Thickness * Strip Width * Pitch) / Cavity / 1000',
        kg: 'Gross Weight (kg) = (Density * Thickness * Strip Width * Pitch) / Cavity / (1000 * 1000)',
        mg: 'Gross Weight (mg) = (Density * Thickness * Strip Width * Pitch * 1000) / 1000',
    };

    const GrossWeightTooltip = (uom) => {
        const formula = unitFormulaMap[uom?.label];
        if (!formula) {
            return unitFormulaMap.g;
        }
        return formula;
    }

    /**
     * @method render
     * @description Renders the component
     */
    return (
        <>
            <div className="user-page p-0">
                <div>
                    <form noValidate className="form"
                        onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                        <div className="costing-border border-top-0 px-4">
                            <Row>
                                <Col md="3" className={'mt25'}>
                                    <SearchableSelectHookForm
                                        label={'Weight Unit'}
                                        name={'UOMDimension'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                                        options={renderListing('UOM')}
                                        mandatory={true}
                                        handleChange={handleUnit}
                                        errors={errors.UOMDimension}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <HeaderTitle className="border-bottom"
                                        title={'Sheet Specification'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={''}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Strip Width(mm)`}
                                        name={'StripWidth'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.StripWidth}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Thickness(mm)`}
                                        name={'Thickness'}
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
                                        errors={errors.Thickness}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Pitch(mm)`}
                                        name={'Pitch'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Pitch}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cavity`}
                                        name={'Cavity'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Cavity}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                            </Row>

                            <hr className="mx-n4 w-auto" />
                            <Row>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={UnitFormat()}
                                        name={'NetSurfaceArea'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NetSurfaceArea}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    {/* <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'coil-gross-weight'} tooltipText={'Gross Weight =  (Density * Thickness * Strip Width * Pitch) / Cavity / 1000'} /> */}
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'coil-gross-weight'} tooltipText={GrossWeightTooltip(UOMDimension)} />
                                    <TextFieldHookForm
                                        label={`Gross Weight(${UOMDimension.label})`}
                                        name={'GrossWeight'}
                                        id={'coil-gross-weight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.GrossWeight}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`${finishWeightLabel} Weight(${UOMDimension.label})`}
                                        name={'FinishWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                            max: {
                                                value: getValues('GrossWeight'),
                                                message: `${finishWeightLabel} weight should not be greater than gross weight.`
                                            },
                                        }}
                                        handleChange={setFinishWeight}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.FinishWeight}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Scrap Recovery (%)`}
                                        name={'scrapRecoveryPercent'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                            max: {
                                                value: 100,
                                                message: 'Percentage cannot be greater than 100'
                                            },
                                        }}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapRecoveryPercent}
                                        disabled={props.CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipClass={'weight-of-sheet'} tooltipText={`Scrap Weight = (Gross Weight - ${finishWeightLabel} Weight )* Scrap Recovery (%)/100`} />
                                    <TextFieldHookForm
                                        label={`Scrap Weight(${UOMDimension.label})`}
                                        name={'scrapWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'scrap-weight'}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapWeight}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {!CostingViewMode &&
                            <div className="col-sm-12 text-right px-0 mt-4">
                                <button
                                    type={'button'}
                                    className="reset mr15 cancel-btn"
                                    onClick={cancel} >
                                    <div className={'cancel-icon'}></div> {'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={CostingViewMode || isDisable ? true : false}
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

export default Coil
