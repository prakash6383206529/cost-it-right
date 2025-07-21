import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row, Table } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, NumberFieldHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, calculatePercentage, percentageLimitValidation, calculateScrapWeight, blockInvalidNumberKeys, noDecimal } from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG, G } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import { nonZero } from '../../../../../helper/validation'
import TooltipCustom from '../../../../common/Tooltip'
import { useLabels } from '../../../../../helper/core'

function Sheet(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, item, CostingViewMode } = props
    const [rightEndAcc, setRightEndAcc] = useState(true)
    const [bottomEndAcc, setBottomEndAcc] = useState(true)
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
        SheetWidth: WeightCalculatorRequest && WeightCalculatorRequest.Width !== undefined ? WeightCalculatorRequest.Width : '',
        SheetLength: WeightCalculatorRequest && WeightCalculatorRequest.SheetLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.SheetLength, localStorage.NoOfDecimalForInputOutput) : '',
        SheetThickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
        SheetWeight: WeightCalculatorRequest && WeightCalculatorRequest.WeightOfSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.WeightOfSheet, localStorage.NoOfDecimalForInputOutput) : '',
        BlankWidth: WeightCalculatorRequest && WeightCalculatorRequest.BlankWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankWidth, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfComponent: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPartsPerSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfPartsPerSheet, localStorage.NoOfDecimalForInputOutput) : '', // TOTAL COMPONENT PER SHEET
        BlankLength: WeightCalculatorRequest && WeightCalculatorRequest.BlankLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankLength, localStorage.NoOfDecimalForInputOutput) : '',
        CuttingAllowance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingAllowance !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowance, localStorage.NoOfDecimalForInputOutput) : '',
        TotalComponentByWidth: WeightCalculatorRequest && WeightCalculatorRequest.TotalComponentByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalComponentByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '',
    }

    const remainingDefaultValues = {
        BlankLength: WeightCalculatorRequest && WeightCalculatorRequest.BlankLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankLength, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSWPerBWRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthRightEndByWidth !== undefined ? WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthRightEndByWidth : '',
        NoOfBlanksRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.NoOfBlanksRightEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfBlanksRightEndByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        TotalNoOfBlanksByWidth: WeightCalculatorRequest && WeightCalculatorRequest.TotalNoOfBlanksByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalNoOfBlanksByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        AdditionalComponentsByWidth: WeightCalculatorRequest && WeightCalculatorRequest.AdditionalComponentsByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.AdditionalComponentsByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSLBottomByLength: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthBottomByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthBottomByLength, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSWPerBLBottomByLength: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthPerBlankLengthBottomByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetWidthPerBlankLengthBottomByLength, localStorage.NoOfDecimalForInputOutput) : '',
    }


    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: { ...defaultValues, ...remainingDefaultValues },
        })

    const [UOMDimension, setUOMDimension] = useState(
        WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
            ? {
                label: WeightCalculatorRequest.UOMForDimension,
                value: WeightCalculatorRequest.UOMForDimensionId,
            }
            : [],
    )
    const [dataToSend, setDataToSend] = useState({
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '',
    })
    const [isChangeApplies, setIsChangeApplied] = useState(true)
    const tempOldObj = WeightCalculatorRequest
    const [GrossWeight, setGrossWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '')
    const [FinishWeightOfSheet, setFinishWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '')
    const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)
    const [isDisable, setIsDisable] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [finalComponentSelected, setFinalComponentSelected] = useState(false)
    const [scrapWeight, setScrapWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== null ? WeightCalculatorRequest.ScrapWeight : '')
    const [isSelectedLengthForBlanks, setIsSelectedLengthForBlanks] = useState(false);
    const dispatch = useDispatch()

    // These Below 3 states are base value states for weights (always in grams)
    const [baseGrossWeight, setBaseGrossWeight] = useState(null);
    const [baseFinishWeight, setBaseFinishWeight] = useState(null);
    const [baseScrapWeight, setBaseScrapWeight] = useState(null);

    // Base values are set on initial load
    useEffect(() => {
        const initialGross = getValues('GrossWeight');
        const initialFinish = getValues('FinishWeightOfSheet');
        const initialScrap = getValues('ScrapWeight');
        const uom = UOMDimension?.label || DISPLAY_G;
        setBaseGrossWeight(convertValueBetweenUOM(initialGross, uom, DISPLAY_G));
        setBaseFinishWeight(convertValueBetweenUOM(initialFinish, uom, DISPLAY_G));
        setBaseScrapWeight(convertValueBetweenUOM(initialScrap, uom, DISPLAY_G));
    }, []);

    useEffect(() => {
        if (WeightCalculatorRequest) {
            const uom = WeightCalculatorRequest.UOMForDimension || DISPLAY_G;
            setBaseFinishWeight(convertValueBetweenUOM(WeightCalculatorRequest.FinishWeight, uom, DISPLAY_G));
            setBaseGrossWeight(convertValueBetweenUOM(WeightCalculatorRequest.GrossWeight, uom, DISPLAY_G));
            setBaseScrapWeight(convertValueBetweenUOM(WeightCalculatorRequest.ScrapWeight, uom, DISPLAY_G));
        }
    }, [WeightCalculatorRequest]);

    const fieldValues = useWatch({
        control,
        name: ['SheetThickness', 'SheetWidth', 'SheetLength', 'BlankWidth', 'BlankLength', 'ScrapRecoveryPercent'],
    })

    const grossWeightValue = useWatch({
        control,
        name: ['TotalComponentByWidth', 'SheetWeight'],
    })

    const yieldValue = useWatch({
        control,
        name: ['FinishWeightOfSheet', 'GrossWeight'],
    })

    const RMCostValue = useWatch({
        control,
        name: ['ScrapWeight', 'GrossWeight'],
    })

    useEffect(() => {
        if (!CostingViewMode) {
            setWeightOfSheet()
        }
    }, [fieldValues, finalComponentSelected, UOMDimension])

    useEffect(() => {
        setGrossWeight()
    }, [grossWeightValue, UOMDimension?.label])
    

    useEffect(() => {
        setFinishWeight()
    }, [UOMDimension?.label])

    useEffect(() => {
        calculateyieldPercentage();
    }, [yieldValue])

    useEffect(() => {
        calculateRMCost();
    }, [RMCostValue])

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
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0) {
            setValue('ScrapWeight', WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('GrossWeight', WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('FinishWeightOfSheet', WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('ScrapRecoveryPercent', WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '')
        }
    }, [])

    useEffect(() => {
        if(!CostingViewMode){
            scrapWeightCalculation();
        }
    }, [fieldValues, FinishWeightOfSheet, GrossWeight])

    useEffect(() => {
        if (Number(getValues('FinishWeightOfSheet')) < getValues('GrossWeight')) {
            delete errors.FinishWeightOfSheet
            setRerender(!reRender)
        }
    }, [getValues('GrossWeight'), fieldValues])

    const setFinishWeight = () => {
        // Use the base value (in grams) and convert to the current UOM for display
        const displayValue = convertValueBetweenUOM(baseFinishWeight, DISPLAY_G, UOMDimension.label);
        setValue("FinishWeightOfSheet", checkForDecimalAndNull(displayValue, localStorage.NoOfDecimalForInputOutput));
        setFinishWeights(displayValue);
        // Do NOT update baseFinishWeight here!
    };
    

    const setWeightOfSheet = () => {
        let data = {
            density: rmRowData.Density,
            thickness: getValues('SheetThickness'),
            length: checkForNull(getValues('SheetLength')),
            width: checkForNull(getValues('SheetWidth'))
        }
        const getWeightSheet = ((calculateWeight(data.density, data.length, data.width, data.thickness)) / 1000).toFixed(6)
        let convertedWeightSheet = setValueAccToUOM(getWeightSheet, UOMDimension?.label)
        const updatedValue = dataToSend
        updatedValue.WeightOfSheet = convertedWeightSheet
        setTimeout(() => {
            setDataToSend(updatedValue)
        }, 200);
        setValue('SheetWeight', checkForDecimalAndNull(convertedWeightSheet, localStorage.NoOfDecimalForInputOutput))
    }

    /** 
     * @method setGrossWeight
     * @description SET GROSS WEIGHT
     */
    const setGrossWeight = () => {
        let grossWeight;
        const sheetWeight = getValues('SheetWeight');
        const noOfComponents = getValues('TotalComponentByWidth');
        grossWeight = (sheetWeight / noOfComponents);
        setGrossWeights(grossWeight) // for coverting into gram
        const updatedValue = dataToSend
        updatedValue.GrossWeight = checkForNull(grossWeight)
        setTimeout(() => {
            setDataToSend(updatedValue)
            setValue('GrossWeight', checkForDecimalAndNull(checkForNull(grossWeight), localStorage.NoOfDecimalForInputOutput))
            setBaseGrossWeight(convertValueBetweenUOM(grossWeight, UOMDimension?.label, DISPLAY_G));
        }, 200);
    }

    const calculateyieldPercentage = () => {
        let yieldPercentage;
        const grossWeight = getValues('GrossWeight');
        const finishWeight = getValues('FinishWeightOfSheet');
        yieldPercentage = (finishWeight/grossWeight)*100
        const updatedValue = dataToSend
        updatedValue.YieldPercentage = yieldPercentage
        setTimeout(() => {
            setDataToSend(updatedValue)
            setValue('YieldPercentage', checkForDecimalAndNull(yieldPercentage, localStorage.NoOfDecimalForInputOutput))
        }, 200);
    }

    const calculateRMCost = () => {
        let rMCost;
        const grossWeight = getValues('GrossWeight');
        const scrapWeight = getValues('ScrapWeight');
        if(grossWeight && scrapWeight){
            rMCost = grossWeight*rmRowData.RMRate - scrapWeight*rmRowData.ScrapRate
        }
        const updatedValue = dataToSend
        updatedValue.RawMaterialCost = rMCost
        setTimeout(() => {
            setDataToSend(updatedValue)
            setValue('RawMaterialCost', checkForDecimalAndNull(rMCost, localStorage.NoOfDecimalForPrice))
        }, 200);
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
            if (tempOldObj.GrossWeight !== dataToSend.GrossWeight || tempOldObj.FinishWeight !== getValues('FinishWeightOfSheet') || tempOldObj.NetSurfaceArea !== dataToSend.NetSurfaceArea || tempOldObj.UOMForDimensionId !== UOMDimension.value) {
                setIsChangeApplied(true)
            } else {
                setIsChangeApplied(false)
            }
        }

        let data = {
            LayoutType: 'Sheet',
            IsSelectedLengthForBlanks: false,
            SheetMetalCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.SheetMetalCalculationId ? WeightCalculatorRequest.SheetMetalCalculationId : "0",
            IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
            UOMForDimension: UOMDimension ? UOMDimension.label : '',
            Thickness: values.SheetThickness,
            SheetLength: getValues('SheetLength'),
            WeightOfSheet: getValues('SheetWeight'),
            Width: getValues('SheetWidth'),
            BlankWidth: getValues('BlankWidth'),
            BlankLength: getValues('BlankLength'),
            CuttingAllowance: getValues('CuttingAllowance'),
            TotalComponentByWidth: getValues('TotalComponentByWidth'),
            UOMId: rmRowData.UOMId,
            UOM: rmRowData.UOM,
            GrossWeight: getValues('GrossWeight'),
            FinishWeight: getValues('FinishWeightOfSheet'),
            RecoveryPercentage: getValues('ScrapRecoveryPercent'),
            ScrapWeight: getValues('ScrapWeight'),
            YieldPercentage: getValues('YieldPercentage'),
            RawMaterialCost: getValues('RawMaterialCost'),
        }

        dispatch(saveRawMaterialCalculationForSheetMetal(data, res => {
            setIsDisable(false)
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', data)
            }
        }))
    }), 500);

    // Defensive conversion function
    const convertValueBetweenUOM = (value, fromUOM, toUOM) => {
        if (value === '' || value === null || value === undefined || isNaN(Number(value))) return 0;
        let val = Number(value);
        // Convert from source UOM to grams
        switch (fromUOM) {
            case DISPLAY_KG: val = val * 1000; break; // kg to g
            case DISPLAY_MG: val = val / 1000; break; // mg to g
            // DISPLAY_G or default: do nothing
        }

        // Convert from grams to target UOM
        switch (toUOM) {
            case DISPLAY_KG: return val / 1000;  // g to kg
            case DISPLAY_MG: return val * 1000;  // g to mg
            default: return val;  // g to g
        }
    };

    const handleUnit = (value) => {
        const newUOM = value.label;
        // Always convert from base (grams)
        const grossWeight = convertValueBetweenUOM(baseGrossWeight, DISPLAY_G, newUOM);
        const finishWeight = convertValueBetweenUOM(baseFinishWeight, DISPLAY_G, newUOM);
        const scrapWeightVal = convertValueBetweenUOM(baseScrapWeight, DISPLAY_G, newUOM);
        setValue('UOMDimension', { label: value.label, value: value.value });
        setUOMDimension(value);
        setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput));
        setValue('FinishWeightOfSheet', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput));
        setValue('ScrapWeight', checkForDecimalAndNull(scrapWeightVal, localStorage.NoOfDecimalForInputOutput));
    };

    const scrapWeightCalculation = () => {
        const scrapRecoveryPercent = Number((getValues('ScrapRecoveryPercent')))
        const grossWeight = getValues('GrossWeight');
        const finishWeightOfSheet = getValues('FinishWeightOfSheet');
        if(scrapRecoveryPercent <= 100){
            const scrapWeight = calculateScrapWeight(grossWeight, finishWeightOfSheet, scrapRecoveryPercent)
            setScrapWeight(checkForDecimalAndNull(scrapWeight, localStorage.NoOfDecimalForInputOutput))
            setValue('ScrapWeight', checkForDecimalAndNull((checkForNull(scrapWeight)), localStorage.NoOfDecimalForInputOutput))
            setBaseScrapWeight(convertValueBetweenUOM(scrapWeight, UOMDimension?.label, DISPLAY_G));
        }else{
            setScrapWeight(0)
            setValue('ScrapWeight', 0)
            setBaseScrapWeight(0);
        }
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    const unitFormulaMap = {
        g: 'Weight of Sheet (g) = (Density * Thickness * Width * Length) / 1000',
        kg: 'Weight of Sheet (kg) = (Density * Thickness * Width * Length) / (1000 * 1000)',
        mg: 'Weight of Sheet (mg) = (Density * Thickness * Width * Length * 1000) / 1000',
    };

    const toolTipText = (uom) => {
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
                                        customClassName={''}
                                        mandatory={true}
                                        handleChange={handleUnit}
                                        errors={errors.UOMDimension}
                                        disabled={CostingViewMode ? true : false}
                                    />

                                </Col>
                            </Row>
                            <Row>
                                <Col md="12" >
                                    <HeaderTitle className="border-bottom"
                                        title={'Sheet Specificaton'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className=''>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Length(mm)`}
                                        name={'SheetLength'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
										onKeyDown={blockInvalidNumberKeys}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetLength}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Width(mm)`}
                                        name={'SheetWidth'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
										onKeyDown={blockInvalidNumberKeys}
                                        handleChange={(e) => { setValue('SheetWidthBottom', e.target.value) }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetWidth}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Thickness(mm)`}
                                        name={'SheetThickness'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
										onKeyDown={blockInvalidNumberKeys}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetThickness}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    {/* <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'sheet-weight'} tooltipText={'Weight of Sheet = (Density * (Thickness * Width * Length)) / 1000'} /> */}
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'sheet-weight'} tooltipText={toolTipText(UOMDimension)} />
                                    <TextFieldHookForm
                                        // label={`Weight of Sheet(g)`}
                                        label={`Weight of Sheet (${UOMDimension.label || 'g'})`}
                                        name={'SheetWeight'}
                                        id={'sheet-weight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetWeight}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12">
                                    <HeaderTitle className="border-bottom"
                                        title={'Blank Specification'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row>
                            <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Length(mm)`}
                                        name={'BlankLength'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
										onKeyDown={blockInvalidNumberKeys}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0'}
                                        errors={errors.BlankLength}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Width(mm)`}
                                        name={'BlankWidth'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
										onKeyDown={blockInvalidNumberKeys}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0'}
                                        errors={errors.BlankWidth}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cutting Allowance / Tolerance`}
                                        name={'CuttingAllowance'}
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
                                        errors={errors.CuttingAllowance}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`No. of Components`}
                                        // name={'NoOfComponent'}
                                        name={'TotalComponentByWidth'}
                                        id={'total-component-width'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation, noDecimal },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder ml-2'}
                                        errors={errors.TotalComponentByWidth}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                            </Row >
                     
                            <Row>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'gross-weight'} tooltipText={`Gross Weight = Weight of Sheet(${UOMDimension.label}) / NO. of Components`} />
                                    <TextFieldHookForm
                                        label={`Gross Weight(${UOMDimension.label})`}
                                        name={'GrossWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        id={'gross-weight'}
                                        rules={{
                                            required: false,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.GrossWeightByWidth}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3"> 
                                    <TextFieldHookForm
                                        label={`${finishWeightLabel} Weight(${UOMDimension.label})`}
                                        name={'FinishWeightOfSheet'}
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
                                        // handleChange={setFinishWeight}
                                        handleChange={e => {
                                            setValue('FinishWeightOfSheet', e.target.value);
                                            setBaseFinishWeight(convertValueBetweenUOM(e.target.value, UOMDimension?.label, DISPLAY_G));
                                        }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.FinishWeightOfSheet}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3"> 
                                    <TooltipCustom disabledIcon={true} id={'yield-percentage'} tooltipText={`Yield % = (${finishWeightLabel} Weight(${UOMDimension.label}) / Gross Weight(${UOMDimension.label})) * 100`} />
                                    <TextFieldHookForm
                                        label={`Yield (%)`}
                                        name={'YieldPercentage'}
                                        Controller={Controller}
                                        id={'yield-percentage'}
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
                                        errors={errors.YieldPercentage}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3"> 
                                    <TextFieldHookForm
                                        label={`Scrap Recovery (%)`}
                                        name={'ScrapRecoveryPercent'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                            max: {
                                                value: 100,
                                                message: 'Percentage cannot be greater than 100'
                                            },
                                        }}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.ScrapRecoveryPercent}
                                        disabled={props.CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipClass={'weight-of-sheet'} tooltipText={`Scrap Weight = (Gross Weight(${UOMDimension.label}) - ${finishWeightLabel} Weight(${UOMDimension.label}) )* Scrap Recovery (%)/100`} />
                                    <TextFieldHookForm
                                        label={`Scrap Weight(${UOMDimension.label})`}
                                        name={'ScrapWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'scrap-weight'}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.ScrapWeight}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'RM-cost'} tooltipClass={'RM-cost'} tooltipText={`Scrap Weight = (Gross Weight(${UOMDimension.label}) * RM Rate - Scrap Weight(${UOMDimension.label}) * Scrap Rate`} />
                                    <TextFieldHookForm
                                        label={`RM Cost`}
                                        name={'RawMaterialCost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'RM-cost'}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.RawMaterialCost}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                        </div >

                        {!CostingViewMode && <div className="col-sm-12 text-right px-0 mt-4">
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

                    </form >
                </div >
            </div >
        </>
    )
}

export default Sheet
