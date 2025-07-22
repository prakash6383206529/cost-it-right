import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row, Table } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, NumberFieldHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, calculatePercentage, percentageLimitValidation, calculateScrapWeight } from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG, G } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import { nonZero } from '../../../../../helper/validation'
import TooltipCustom from '../../../../common/Tooltip'
import { useLabels } from '../../../../../helper/core'

// Utility to convert between G, KG, MG
const convertWeightValue = (value, fromUnit, toUnit) => {
    if (value === '' || value === null || isNaN(Number(value))) return value;
    let val = Number(value);
    // Convert from current unit to grams
    switch (fromUnit) {
        case DISPLAY_KG: val = val * 1000; break;
        case DISPLAY_MG: val = val / 1000; break;
        case DISPLAY_G: default: break;
    }
    // Convert from grams to target unit
    switch (toUnit) {
        case DISPLAY_KG: return val / 1000;
        case DISPLAY_MG: return val * 1000;
        case DISPLAY_G: default: return val;
    }
};

function SheetDetails(props) {
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
        Cavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Cavity, localStorage.NoOfDecimalForInputOutput) : 1,
        BlankWidth: WeightCalculatorRequest && WeightCalculatorRequest.BlankWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankWidth, localStorage.NoOfDecimalForInputOutput) : '',
        StripsNumber: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfStrips !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfStrips, localStorage.NoOfDecimalForInputOutput) : '',
        ComponentPerStrip: WeightCalculatorRequest && WeightCalculatorRequest.ComponentsPerStrip !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ComponentsPerStrip, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfComponent: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPartsPerSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfPartsPerSheet, localStorage.NoOfDecimalForInputOutput) : '', // TOTAL COMPONENT PER SHEET
        BlankLength: WeightCalculatorRequest && WeightCalculatorRequest.BlankLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankLength, localStorage.NoOfDecimalForInputOutput) : '',
        NumberOfStripsByWidth: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfStripsByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfStripsByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        NumberOfStripsByLength: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfStripsByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfStripsByLength, localStorage.NoOfDecimalForInputOutput) : '',
        BlanksPerStripByWidth: WeightCalculatorRequest && WeightCalculatorRequest.BlanksPerStripByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlanksPerStripByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        BlanksPerStripByLength: WeightCalculatorRequest && WeightCalculatorRequest.BlanksPerStripByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlanksPerStripByLength, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfComponentByWidth: WeightCalculatorRequest && WeightCalculatorRequest.NoOfComponentByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfComponentByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfComponentByLength: WeightCalculatorRequest && WeightCalculatorRequest.NoOfComponentByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfComponentByLength, localStorage.NoOfDecimalForInputOutput) : '',
        SheetWidthBottom: WeightCalculatorRequest && WeightCalculatorRequest.SheetWidthBottom !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.SheetWidthBottom, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSLBottomByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthBottomByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthBottomByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSWPerBWBottomByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthBottomByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthBottomByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSLPerBLBottomByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthPerBlankLengthBottomByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthPerBlankLengthBottomByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfBlanksBottomEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.NoOfBlanksBottomEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfBlanksBottomEndByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSLRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthRightEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthRightEndByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSLPerBLRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthPerBlankLengthRightEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthPerBlankLengthRightEndByWidth, localStorage.NoOfDecimalForInputOutput) : '',
    }

    const remainingDefaultValues = {
        BlankLength: WeightCalculatorRequest && WeightCalculatorRequest.BlankLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankLength, localStorage.NoOfDecimalForInputOutput) : '',
        RemainingSWPerBWRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthRightEndByWidth !== undefined ? WeightCalculatorRequest.RemainingSheetWidthPerBlankWidthRightEndByWidth : '',
        NoOfBlanksRightEndByWidth: WeightCalculatorRequest && WeightCalculatorRequest.NoOfBlanksRightEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfBlanksRightEndByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        TotalNoOfBlanksByWidth: WeightCalculatorRequest && WeightCalculatorRequest.TotalNoOfBlanksByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalNoOfBlanksByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        AdditionalComponentsByWidth: WeightCalculatorRequest && WeightCalculatorRequest.AdditionalComponentsByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.AdditionalComponentsByWidth, localStorage.NoOfDecimalForInputOutput) : '',
        TotalComponentByWidth: WeightCalculatorRequest && WeightCalculatorRequest.TotalComponentByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalComponentByWidth, localStorage.NoOfDecimalForInputOutput) : 1,
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
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : '',
        ComponentsPerStrip: WeightCalculatorRequest && WeightCalculatorRequest.ComponentsPerStrip !== null ? WeightCalculatorRequest.ComponentsPerStrip : '',
    })
    const [isChangeApplies, setIsChangeApplied] = useState(true)
    const tempOldObj = WeightCalculatorRequest
    const [GrossWeight, setGrossWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '')
    const [FinishWeightOfSheet, setFinishWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : '')
    const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)
    const [isDisable, setIsDisable] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [finalComponentSelected, setFinalComponentSelected] = useState(false)
    const [isSelectedLengthForBlanks, setIsSelectedLengthForBlanks] = useState(true)
    const [scrapWeight, setScrapWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== null ? WeightCalculatorRequest.ScrapWeight : '')


    const fieldValues = useWatch({
        control,
        name: ['SheetThickness', 'SheetWidth', 'SheetLength', 'BlankWidth', 'BlankLength', 'Cavity', 'ScrapRecoveryPercent'],
    })

    const values = useWatch({
        control,
        name: ['BlankWidth', 'BlankLength'],
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
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0) {
            setValue('AdditionalComponentsByLength', WeightCalculatorRequest && WeightCalculatorRequest.AdditionalComponentsByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.AdditionalComponentsByLength, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('TotalComponentByLength', WeightCalculatorRequest && WeightCalculatorRequest.TotalComponentByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalComponentByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('ScrapWeight', WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('GrossWeight', WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('FinishWeightOfSheet', WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('ScrapRecoveryPercent', WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('NetSurfaceArea', WeightCalculatorRequest && WeightCalculatorRequest.NetSurfaceArea !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetSurfaceArea, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('RemainingSLRightEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthRightEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthRightEndByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('RemainingSWRightEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthRightEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetWidthRightEndByLength, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('RemainingSLPerBWRightEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthPerBlankWidthRightEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthPerBlankWidthRightEndByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('RemainingSWPerBLRightEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthPerBlankLengthRightEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetWidthPerBlankLengthRightEndByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('NoOfBlanksRightEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.NoOfBlanksRightEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfBlanksRightEndByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('TotalNoOfBlanksByLength', WeightCalculatorRequest && WeightCalculatorRequest.TotalNoOfBlanksByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalNoOfBlanksByLength, localStorage.NoOfDecimalForInputOutput) : '',)
            setValue('RemainingSWRightEndByWidth', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetWidthRightEndByWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetWidthRightEndByWidth, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('RemainingSLPerBWBottomByLength', WeightCalculatorRequest && WeightCalculatorRequest.RemainingSheetLengthPerBlankWidthBottomByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RemainingSheetLengthPerBlankWidthBottomByLength, localStorage.NoOfDecimalForInputOutput) : '')
            setValue('NoOfBlanksBottomEndByLength', WeightCalculatorRequest && WeightCalculatorRequest.NoOfBlanksBottomEndByLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfBlanksBottomEndByLength, localStorage.NoOfDecimalForInputOutput) : '')
            setIsSelectedLengthForBlanks(WeightCalculatorRequest?.IsSelectedLengthForBlanks === false  ? false : true)
        }
    }, [])

    useEffect(() => {
        scrapWeightCalculation()
    }, [fieldValues, FinishWeightOfSheet, GrossWeight])
    useEffect(() => {
        if (!CostingViewMode) {

            setWeightOfSheet()
            setNoOfStrips()
            setComponentPerStrips()
            setNoOfComponent()
            setTimeout(() => {
                setGrossWeight()
            }, 300);
            setRemainingSheetLengthByWidth()
            setRemainingSheetLengthByLength()
        }
    }, [fieldValues, finalComponentSelected])

    useEffect(() => {
        if (Number(getValues('TotalComponentByWidth')) > Number(getValues('TotalComponentByLength'))) {
            setFinalComponentSelected(true)
            setIsSelectedLengthForBlanks(false);
        } else if (Number(getValues('TotalComponentByWidth')) < Number(getValues('TotalComponentByLength'))) {
            setFinalComponentSelected(false)
            setIsSelectedLengthForBlanks(true);
        }
    }, [values])

    useEffect(() => {
        if (Number(getValues('FinishWeightOfSheet')) < getValues('GrossWeight')) {
            delete errors.FinishWeightOfSheet
            setRerender(!reRender)
        }

    }, [getValues('GrossWeight'), fieldValues])

    const setFinishWeight = (e) => {
        const FinishWeightOfSheet = e.target.value
        setFinishWeights(FinishWeightOfSheet)
        const grossWeight = checkForNull(getValues('GrossWeight'))
        if (e.target.value > grossWeight) {
            setTimeout(() => {
                setValue('FinishWeightOfSheet', '')
            }, 200);

            Toaster.warning(`${finishWeightLabel} weight should not be greater than gross weight`)
            return false
        }
        switch (UOMDimension.label) {
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

    const setWeightOfSheet = () => {
        let data = {
            density: rmRowData.Density,
            thickness: getValues('SheetThickness'),
            length: checkForNull(getValues('SheetLength')),
            width: checkForNull(getValues('SheetWidth'))
        }
        const getWeightSheet = ((calculateWeight(data.density, data.length, data.width, data.thickness)) / 1000).toFixed(6)
        const updatedValue = dataToSend
        updatedValue.WeightOfSheet = getWeightSheet
        setTimeout(() => {
            setDataToSend(updatedValue)
        }, 200);
        setValue('SheetWeight', checkForDecimalAndNull(getWeightSheet, localStorage.NoOfDecimalForInputOutput))
    }

    const setNoOfStrips = () => {
        const stripNoByWidth = parseInt(checkForNull(getValues('SheetLength')) / checkForNull(getValues('BlankWidth')))
        setValue('NumberOfStripsByWidth', checkForNull(stripNoByWidth))
        const stripNoByLength = parseInt(checkForNull(getValues('SheetLength')) / checkForNull(getValues('BlankLength')))
        setValue('NumberOfStripsByLength', checkForNull(stripNoByLength))
    }

    const setComponentPerStrips = () => {
        const blankLength = getValues('BlankLength')
        const blankWidth = getValues('BlankWidth')
        const blanksPerStripByWidth = parseInt(checkForNull(getValues('SheetWidth')) / blankLength)
        const blanksPerStripByLength = parseInt(checkForNull(getValues('SheetWidth')) / blankWidth)
        setValue('BlanksPerStripByWidth', checkForNull(blanksPerStripByWidth))
        setValue('BlanksPerStripByLength', checkForNull(blanksPerStripByLength))
        const updatedValue = dataToSend
        updatedValue.ComponentsPerStripByWidth = blanksPerStripByWidth
        updatedValue.ComponentsPerStripByLength = blanksPerStripByLength
        setDataToSend(updatedValue)

    }

    const setNoOfComponent = () => {
        const stripsNumberByLength = getValues('NumberOfStripsByLength')
        const stripsNumberByWidth = getValues('NumberOfStripsByWidth')
        const blanksPerStripByWidth = getValues('BlanksPerStripByWidth')
        const blanksPerStripByLength = getValues('BlanksPerStripByLength')
        const cavity = getValues('Cavity')
        const noOfComponentByWidth = stripsNumberByWidth * blanksPerStripByWidth * cavity
        const noOfComponentByLength = stripsNumberByLength * blanksPerStripByLength * cavity
        setValue('NoOfComponentByWidth', checkForDecimalAndNull(noOfComponentByWidth, localStorage.NoOfDecimalForInputOutput))
        setValue('NoOfComponentByLength', checkForDecimalAndNull(noOfComponentByLength, localStorage.NoOfDecimalForInputOutput))
    }


    /**
     * @method setGrossWeight
     * @description SET GROSS WEIGHT
     */
    const setGrossWeight = () => {
        let grossWeight
        const sheetWeight = getValues('SheetWeight')
        const noOfComponents = finalComponentSelected ? Number(getValues('TotalComponentByWidth')) : Number(getValues('TotalComponentByLength'))
        const cavity = getValues('Cavity')

        grossWeight = (sheetWeight / noOfComponents) / cavity
        setGrossWeights(grossWeight) // for coverting into gram
        const updatedValue = dataToSend
        updatedValue.GrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
        updatedValue.newGrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
        setTimeout(() => {
            setDataToSend(updatedValue)
            setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
        }, 200);
    }
    /**
   * @method setRemainingSheetLengthByWidth
   * @description SET REMAINING SHEET LENGTH BY WIDTH
   */
    const setRemainingSheetLengthByWidth = (value) => {
        const sheetLength = getValues('SheetLength')
        const sheetWidth = getValues('SheetWidth')
        const blankLength = getValues('BlankLength')
        const blankWidth = getValues('BlankWidth')
        const noOfStripsbyWidth = getValues('NumberOfStripsByWidth')
        const blanksPerStripByWidth = getValues('BlanksPerStripByWidth')
        const noOfComponentByWidth = getValues('NoOfComponentByWidth')
        const remainingSLBottom = checkForNull(sheetLength - (blankWidth * noOfStripsbyWidth))
        const remainingSWPerBWBottom = checkForNull(sheetWidth / blankWidth)
        const remainingSLPerBLBottom = checkForNull(remainingSLBottom / blankLength)
        const noOfBlanksBottomEnd = checkForNull(parseInt(remainingSWPerBWBottom) * parseInt(remainingSLPerBLBottom))
        const remainingSLRightEnd = checkForNull(sheetLength - remainingSLBottom)
        const remainingSWRightEnd = checkForNull(sheetWidth - (blankLength * blanksPerStripByWidth))
        const remainingSLPerBLRightEnd = checkForNull(remainingSLRightEnd / blankLength)
        const remainingSWPerBWRightEnd = checkForNull(remainingSWRightEnd / blankWidth)
        const noOfBlanksRightEnd = checkForNull(parseInt(remainingSWPerBWRightEnd) * parseInt(remainingSLPerBLRightEnd))
        const totalNoOfBlanksByWidth = noOfBlanksBottomEnd + noOfBlanksRightEnd
        const AdditionalComponentsByWidth = checkForNull(totalNoOfBlanksByWidth * getValues('Cavity'))
        const totalComponentByWidth = parseInt(noOfComponentByWidth + AdditionalComponentsByWidth)
        setValue('RemainingSLBottomByWidth', checkForDecimalAndNull(remainingSLBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWPerBWBottomByWidth', checkForDecimalAndNull(remainingSWPerBWBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSLPerBLBottomByWidth', checkForDecimalAndNull(remainingSLPerBLBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('NoOfBlanksBottomEndByWidth', noOfBlanksBottomEnd)
        setValue('RemainingSLRightEndByWidth', checkForDecimalAndNull(remainingSLRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWRightEndByWidth', checkForDecimalAndNull(remainingSWRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSLPerBLRightEndByWidth', checkForDecimalAndNull(remainingSLPerBLRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWPerBWRightEndByWidth', checkForDecimalAndNull(remainingSWPerBWRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('NoOfBlanksRightEndByWidth', noOfBlanksRightEnd)
        setValue('TotalNoOfBlanksByWidth', totalNoOfBlanksByWidth)
        setValue('AdditionalComponentsByWidth', parseInt(AdditionalComponentsByWidth))
        setValue('TotalComponentByWidth', totalComponentByWidth)
    }
    /**
    * @method setRemainingSheetLengthByLength
    * @description SET REMAINING SHEET LENGTH BY LENGTH
    */
    const setRemainingSheetLengthByLength = (value) => {
        const sheetLength = getValues('SheetLength')
        const sheetWidth = getValues('SheetWidth')
        const blankLength = getValues('BlankLength')
        const blankWidth = getValues('BlankWidth')
        const noOfStripsByLength = getValues('NumberOfStripsByLength')
        const blanksPerStripByLength = getValues('BlanksPerStripByLength')
        const noOfComponentByLength = getValues('NoOfComponentByLength')
        const remainingSLBottom = checkForNull(sheetLength - (blankLength * noOfStripsByLength))
        const remainingSWPerBLBottom = checkForNull(sheetWidth / blankLength)
        const remainingSLPerBWBottom = checkForNull(remainingSLBottom / blankWidth)
        const noOfBlanksBottomEnd = checkForNull(parseInt(remainingSWPerBLBottom) * parseInt(remainingSLPerBWBottom))
        const remainingSLRightEnd = checkForNull(sheetLength - remainingSLBottom)//3535
        const remainingSWRightEnd = checkForNull(sheetWidth - (blankWidth * blanksPerStripByLength))
        const remainingSLPerBWRightEnd = checkForNull(remainingSLRightEnd / blankWidth)
        const remainingSWPerBLRightEnd = checkForNull(remainingSWRightEnd / blankLength)
        const noOfBlanksRightEnd = checkForNull(parseInt(remainingSWPerBLRightEnd) * parseInt(remainingSLPerBWRightEnd))
        const totalNoOfBlanksByLength = noOfBlanksBottomEnd + noOfBlanksRightEnd
        const AdditionalComponentsByLength = checkForNull(totalNoOfBlanksByLength * getValues('Cavity'))
        setValue('RemainingSLBottomByLength', checkForDecimalAndNull(remainingSLBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWPerBLBottomByLength', checkForDecimalAndNull(remainingSWPerBLBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSLPerBWBottomByLength', checkForDecimalAndNull(remainingSLPerBWBottom, localStorage.NoOfDecimalForInputOutput))
        setValue('NoOfBlanksBottomEndByLength', noOfBlanksBottomEnd)
        setValue('RemainingSLRightEndByLength', checkForDecimalAndNull(remainingSLRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWRightEndByLength', checkForDecimalAndNull(remainingSWRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSLPerBWRightEndByLength', checkForDecimalAndNull(remainingSLPerBWRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('RemainingSWPerBLRightEndByLength', checkForDecimalAndNull(remainingSWPerBLRightEnd, localStorage.NoOfDecimalForInputOutput))
        setValue('NoOfBlanksRightEndByLength', noOfBlanksRightEnd)
        setValue('TotalNoOfBlanksByLength', totalNoOfBlanksByLength)
        setValue('AdditionalComponentsByLength', parseInt(AdditionalComponentsByLength))
        setValue('TotalComponentByLength', parseInt(noOfComponentByLength + AdditionalComponentsByLength))
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
            LayoutType: 'SheetDetailed',
            SheetMetalCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.SheetMetalCalculationId ? WeightCalculatorRequest.SheetMetalCalculationId : "0",
            IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialCost: getValues('GrossWeight') * rmRowData.RMRate - (getValues('GrossWeight') - getValues('FinishWeightOfSheet')) * calculatePercentage(getValues('ScrapRecoveryPercent')) * rmRowData.ScrapRate,
            UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
            UOMForDimension: UOMDimension ? UOMDimension.label : '',
            Cavity: values.Cavity,
            Thickness: values.SheetThickness,
            SheetLength: getValues('SheetLength'),
            WeightOfSheet: getValues('SheetWeight'),
            Width: getValues('SheetWidth'),
            BlankWidth: getValues('BlankWidth'),
            BlankLength: getValues('BlankLength'),
            UOMId: rmRowData.UOMId,
            UOM: rmRowData.UOM,
            NetSurfaceArea: values.NetSurfaceArea,
            NumberOfStripsByWidth: getValues('NumberOfStripsByWidth'),
            NumberOfStripsByLength: getValues('NumberOfStripsByLength'),
            BlanksPerStripByWidth: getValues('BlanksPerStripByWidth'),
            BlanksPerStripByLength: getValues('BlanksPerStripByLength'),
            NoOfComponentByWidth: getValues('NoOfComponentByWidth'),
            NoOfComponentByLength: getValues('NoOfComponentByLength'),
            SheetWidthBottom: getValues('SheetWidthBottom'),
            RemainingSheetLengthBottomByWidth: getValues('RemainingSLBottomByWidth'),
            RemainingSheetWidthPerBlankWidthBottomByWidth: getValues('RemainingSWPerBWBottomByWidth'),
            RemainingSheetLengthPerBlankLengthBottomByWidth: getValues('RemainingSLPerBLBottomByWidth'),
            NoOfBlanksBottomEndByWidth: getValues('NoOfBlanksBottomEndByWidth'),
            RemainingSheetLengthRightEndByWidth: getValues('RemainingSLRightEndByWidth'),
            RemainingSheetWidthRightEndByWidth: getValues('RemainingSWRightEndByWidth'),
            RemainingSheetLengthPerBlankLengthRightEndByWidth: getValues('RemainingSLPerBLRightEndByWidth'),
            RemainingSheetWidthPerBlankWidthRightEndByWidth: getValues('RemainingSWPerBWRightEndByWidth'),
            NoOfBlanksRightEndByWidth: getValues('NoOfBlanksRightEndByWidth'),
            TotalNoOfBlanksByWidth: getValues('TotalNoOfBlanksByWidth'),
            AdditionalComponentsByWidth: getValues('AdditionalComponentsByWidth'),
            TotalComponentByWidth: getValues('TotalComponentByWidth'),
            RemainingSheetLengthBottomByLength: getValues('RemainingSLBottomByLength'),
            RemainingSheetWidthPerBlankLengthBottomByLength: getValues('RemainingSWPerBLBottomByLength'),
            RemainingSheetLengthPerBlankWidthBottomByLength: getValues('RemainingSLPerBWBottomByLength'),
            NoOfBlanksBottomEndByLength: getValues('NoOfBlanksBottomEndByLength'),
            RemainingSheetLengthRightEndByLength: getValues('RemainingSLRightEndByLength'),
            RemainingSheetWidthRightEndByLength: getValues('RemainingSWRightEndByLength'),
            RemainingSheetLengthPerBlankWidthRightEndByLength: getValues('RemainingSLPerBWRightEndByLength'),
            RemainingSheetWidthPerBlankLengthRightEndByLength: getValues('RemainingSWPerBLRightEndByLength'),
            NoOfBlanksRightEndByLength: getValues('NoOfBlanksRightEndByLength'),
            TotalNoOfBlanksByLength: getValues('TotalNoOfBlanksByLength'),
            AdditionalComponentsByLength: getValues('AdditionalComponentsByLength'),
            TotalComponentByLength: getValues('TotalComponentByLength'),
            GrossWeight: getValues('GrossWeight'),
            FinishWeight: getValues('FinishWeightOfSheet'),
            RecoveryPercentage: getValues('ScrapRecoveryPercent'),
            ScrapWeight: getValues('ScrapWeight'),
            IsSelectedLengthForBlanks: isSelectedLengthForBlanks 
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

    const handleUnit = (value) => {
        const prevUnit = UOMDimension.label;
        setValue('UOMDimension', { label: value.label, value: value.value });
        setUOMDimension(value);

        // List of fields to convert
        const fieldsToConvert = [
            'SheetWeight',
            'GrossWeight',
            'FinishWeightOfSheet',
            'ScrapWeight'
        ];

        fieldsToConvert.forEach(field => {
            const currentValue = getValues(field);
            const convertedValue = convertWeightValue(currentValue, prevUnit, value.label);
            setValue(field, checkForDecimalAndNull(convertedValue, localStorage.NoOfDecimalForInputOutput));
        });

        setDataToSend(prevState => ({
            ...prevState,
            newGrossWeight: convertWeightValue(GrossWeight, prevUnit, value.label),
            newFinishWeight: convertWeightValue(FinishWeightOfSheet, prevUnit, value.label)
        }));
    };
    const scrapWeightCalculation = () => {
        const scrapRecoveryPercent = Number((getValues('ScrapRecoveryPercent')))
        const grossWeight = Number(GrossWeight)
        const finishWeightOfSheet = Number(FinishWeightOfSheet)
        const scrapWeight = calculateScrapWeight(grossWeight, finishWeightOfSheet, scrapRecoveryPercent)
        setScrapWeight(checkForDecimalAndNull(scrapWeight, localStorage.NoOfDecimalForInputOutput))
        setValue('ScrapWeight', checkForDecimalAndNull((setValueAccToUOM(scrapWeight, UOMDimension.label)), localStorage.NoOfDecimalForInputOutput))
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
    const handleRadioChange = (type) => {
        if (type === 'Width') {
            setFinalComponentSelected(true)
            setIsSelectedLengthForBlanks(false);
        } else {
            setFinalComponentSelected(false)
            setIsSelectedLengthForBlanks(true);
        }
    }

    const unitFormulaMap = {
        g: 'Weight of Sheet (g) = (Density * (Thickness * Width * Length)) / 1000',
        kg: 'Weight of Sheet (kg) = (Density * (Thickness * Width * Length)) / (1000 * 1000)',
        mg: 'Weight of Sheet (mg) = (Density * Thickness * Width * Length * 1000) / 1000',
    };

    const sheetWeightTooltipText = (uom) => {
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
                                        // customClassName={'mb-0'}
                                        customClassName={''}
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
                                        title={'Sheet Specificaton'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className='sheet-specification-details'>
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetThickness}
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.SheetLength}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'sheet-weight'} tooltipText={sheetWeightTooltipText(UOMDimension)} />
                                    <TextFieldHookForm
                                        // label={`Weight of Sheet(g)`}
                                        label={`Weight of Sheet(${UOMDimension?.label})`}
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0'}
                                        errors={errors.BlankWidth}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Length(mm)`}
                                        name={'BlankLength'}
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
                                        customClassName={'withBorder mb-0'}
                                        errors={errors.BlankLength}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                            </Row >
                            <Row className={'mt15'}>
                                <Col md="12">
                                    <Table bordered className='sheet-table'>
                                        <thead>
                                            <tr>
                                                <td className='text-center'><strong>Sheet Length/Blank Width</strong></td>
                                                <td className='text-center'><strong>Sheet Length/Blank Length</strong></td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td> <TooltipCustom disabledIcon={true} id={'sheet-strips-width'} tooltipText={'No. of Strips = (Sheet Length / Blank Width)'} />
                                                    <TextFieldHookForm
                                                        label={`No. of Strips`}
                                                        id={'sheet-strips-width'}
                                                        name={'NumberOfStripsByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.NumberOfStripsByWidth}
                                                        disabled={true}
                                                    /></td>
                                                <td><TooltipCustom disabledIcon={true} id={'sheet-strips-length'} tooltipText={'No. of Strips = (Sheet Length / Strip Length)'} />
                                                    <TextFieldHookForm
                                                        label={`No. of Strips`}
                                                        id={'sheet-strips-length'}
                                                        name={'NumberOfStripsByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.NumberOfStripsByLength}
                                                        disabled={true}
                                                    /></td>
                                            </tr>
                                            <tr>
                                                <td> <TooltipCustom disabledIcon={true} id={'sheet-component-per-strip'} tooltipText={'Blanks/Strip = (Sheet Width / Blank Length)'} />
                                                    <TextFieldHookForm
                                                        label={`Blanks/Strip`}
                                                        name={'BlanksPerStripByWidth'}
                                                        id={'sheet-component-per-strip'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.ComponentPerStrip}
                                                        disabled={true}
                                                    /></td>
                                                <td><TooltipCustom disabledIcon={true} id={'sheet-component-per-strip-length'} tooltipText={'Blanks/Strip = (Sheet Width / Blank Width)'} />
                                                    <TextFieldHookForm
                                                        label={`Blanks/Strip`}
                                                        name={'BlanksPerStripByLength'}
                                                        id={'sheet-component-per-strip-length'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.blanksPerStripByLength}
                                                        disabled={true}
                                                    /></td>
                                            </tr>
                                            <tr>
                                                <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component-width'} tooltipText={'Component/Sheet = (No. of Strips * Blanks/Strip * Cavity )'} />
                                                    <TextFieldHookForm
                                                        label={`Components/Sheet`}
                                                        name={'NoOfComponentByWidth'}
                                                        id={'total-component-width'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.NoOfComponentByWidth}
                                                        disabled={true}
                                                    /></td>
                                                <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component-length'} tooltipText={'Component/Sheet = (No. of Strips * Blanks/Strip * Cavity )'} />
                                                    <TextFieldHookForm
                                                        label={`Components/Sheet`}
                                                        name={'NoOfComponentByLength'}
                                                        id={'total-component-length'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder ml-2'}
                                                        errors={errors.NoOfComponentByLength}
                                                        disabled={true}
                                                    /></td>
                                            </tr>
                                            <tr><td className='text-center' colSpan={2}><h3>Utilization of Sheet</h3></td></tr>
                                            <tr><td colSpan={2}><div className='d-flex justify-content-between'><strong>Bottom End</strong> <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setBottomEndAcc(!bottomEndAcc) }}>
                                                {bottomEndAcc ? (
                                                    <i className="fa fa-minus" ></i>
                                                ) : (
                                                    <i className="fa fa-plus"></i>
                                                )}
                                            </button></div></td>
                                            </tr>
                                            {bottomEndAcc && <>
                                                <tr>
                                                    <td>
                                                        <NumberFieldHookForm
                                                            label={`Sheet Width(mm)`}
                                                            name={'SheetWidthBottom'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.SheetWidthBottom}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <NumberFieldHookForm
                                                            label={`Sheet Width(mm)`}
                                                            name={'SheetWidthBottom'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.SheetWidthBottom}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom width={'280px'} tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-by-width'} tooltipText={'Remaining Sheet Length(mm) = Sheet Length - (Blank Width * No. of Strips)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length(mm)`}
                                                            name={'RemainingSLBottomByWidth'}
                                                            id={'remaining-sheet-length-by-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLBottomByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>  <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-by-length'} tooltipText={'Remaining Sheet Length(mm) = Sheet Length - (Blank Length * No. of Strips)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length(mm)`}
                                                            name={'RemainingSLBottomByLength'}
                                                            id={'remaining-sheet-length-by-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLBottomByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-width-blank-width'} tooltipText={'Remaining Sheet Width/Blank Width = (Sheet Width / Blank Width)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Width/Blank Width`}
                                                            name={'RemainingSWPerBWBottomByWidth'}
                                                            id={'remaining-sheet-width-blank-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWPerBWBottomByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-width-blank-length'} tooltipText={'Remaining Sheet Width/Blank Length = (Sheet Width / Blank Length)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Width/Blank Length`}
                                                            name={'RemainingSWPerBLBottomByLength'}
                                                            id={'remaining-sheet-width-blank-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWPerBLBottomByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-blank-length'} tooltipText={'Remaining Sheet Length/Blank Length = (Sheet Length / Blank Length)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length/Blank Length`}
                                                            name={'RemainingSLPerBLBottomByWidth'}
                                                            id={'remaining-sheet-length-blank-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLPerBLBottomByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-blank-width'} tooltipText={'Remaining Sheet Length/Blank Width = (Sheet Length / Blank Width)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length/Blank Width`}
                                                            name={'RemainingSLPerBWBottomByLength'}
                                                            id={'remaining-sheet-length-blank-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLPerBWBottomByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'no-of-blanks-width-bottom'} tooltipText={'No. of Blanks(Bottom End) = Remaining Sheet Width/Blank Width * Remaining Sheet Length/Blank Length'} />
                                                        <NumberFieldHookForm
                                                            label={`No. of Blanks(Bottom End)`}
                                                            name={'NoOfBlanksBottomEndByWidth'}
                                                            id={'no-of-blanks-width-bottom'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.NoOfBlanksBottomEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'no-of-blanks-length-bottom'} tooltipText={'No. of Blanks(Bottom End) = Remaining Sheet Width/Blank Length * Remaining Sheet Length/Blank Width'} />
                                                        <NumberFieldHookForm
                                                            label={`No. of Blanks(Bottom End)`}
                                                            name={'NoOfBlanksBottomEndByLength'}
                                                            id={'no-of-blanks-length-bottom'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.NoOfBlanksBottomEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                            </>}
                                            <tr><td colSpan={2}><div className='d-flex justify-content-between'><strong>Right End</strong> <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setRightEndAcc(!rightEndAcc) }}>
                                                {rightEndAcc ? (
                                                    <i className="fa fa-minus" ></i>
                                                ) : (
                                                    <i className="fa fa-plus"></i>
                                                )}
                                            </button></div></td></tr>
                                            {rightEndAcc && <>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-right-width'} tooltipText={'Remaining Sheet Length = Sheet Length- Remaining Sheet Length'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length(mm)`}
                                                            name={'RemainingSLRightEndByWidth'}
                                                            id={'remaining-sheet-length-right-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLRightEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-length-right-length'} tooltipText={'Remaining Sheet Length = Sheet Length- Remaining Sheet Length'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length(mm)`}
                                                            name={'RemainingSLRightEndByLength'}
                                                            id={'remaining-sheet-length-right-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLRightEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-width-right-width'} tooltipText={'Remaining Sheet Width = Sheet Width - (Blank Length * Blanks/Strip)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Width(mm)`}
                                                            name={'RemainingSWRightEndByWidth'}
                                                            id={'remaining-sheet-width-right-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWRightEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>  <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheet-width-right-length'} tooltipText={'Remaining Sheet Width = Sheet Width - (Blank Width * Blanks/Strip)'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Width(mm)`}
                                                            name={'RemainingSWRightEndByLength'}
                                                            id={'remaining-sheet-width-right-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWRightEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheetLength-blankLength-width'} tooltipText={'Remaining Sheet Length/Blank Length = Remaining Sheet Length/ Blank Length'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length/Blank Length`}
                                                            name={'RemainingSLPerBLRightEndByWidth'}
                                                            id={'remaining-sheetLength-blankLength-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLPerBLRightEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheetLength-blankWidth-length'} tooltipText={'Remaining Sheet Length/Blank Width = Remaining Sheet Length/ Blank Width'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Length/Blank Width`}
                                                            name={'RemainingSLPerBWRightEndByLength'}
                                                            id={'remaining-sheetLength-blankWidth-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSLPerBWRightEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>  <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheetWidth-blankWidth-width'} tooltipText={'Remaining Sheet Width/Blank Width = Remaining Sheet Width/ Blank Width'} />
                                                        <NumberFieldHookForm
                                                            label={`Remaining Sheet Width/Blank Width`}
                                                            name={'RemainingSWPerBWRightEndByWidth'}
                                                            id={'remaining-sheetWidth-blankWidth-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWPerBWRightEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'remaining-sheetWidth-blankLength-length'} tooltipText={'Component/Sheet = (No. of Strips * Blanks/Strip * Cavity )'} /><NumberFieldHookForm
                                                            label={`Remaining Sheet Width/Blank Length`}
                                                            name={'RemainingSWPerBLRightEndByLength'}
                                                            id={'remaining-sheetWidth-blankLength-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.RemainingSWPerBLRightEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'no-of-blanks-right-width'} tooltipText={'No. of Blanks(Right End) = Remaining Sheet Width/Blank Width* Remaining Sheet Length/Blank Length'} />
                                                        <NumberFieldHookForm
                                                            label={`No. of Blanks(Right End)`}
                                                            name={'NoOfBlanksRightEndByWidth'}
                                                            id={'no-of-blanks-right-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.NoOfBlanksRightEndByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'no-of-blanks-right-length'} tooltipText={'No. of Blanks(Right End) = Remaining Sheet Width/Blank Length* Remaining Sheet Length/Blank Width'} />
                                                        <NumberFieldHookForm
                                                            label={`No. of Blanks(Right End)`}
                                                            name={'NoOfBlanksRightEndByLength'}
                                                            id={'no-of-blanks-right-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.NoOfBlanksRightEndByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-blanks-from-remaining-sheet-width'} tooltipText={'Total Blanks from remaining sheet = No. of Blanks(Bottom End)+ No. of Blanks(Right End)'} />
                                                        <NumberFieldHookForm
                                                            label={`Total Blanks from remaining sheet`}
                                                            name={'TotalNoOfBlanksByWidth'}
                                                            id={'total-blanks-from-remaining-sheet-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.TotalNoOfBlanksByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-blanks-from-remaining-sheet-length'} tooltipText={'Total Blanks from remaining sheet = No. of Blanks(Bottom End)+ No. of Blanks(Right End)'} />
                                                        <NumberFieldHookForm
                                                            label={`Total Blanks from remaining sheet`}
                                                            name={'TotalNoOfBlanksByLength'}
                                                            id={'total-blanks-from-remaining-sheet-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2 '}
                                                            errors={errors.TotalNoOfBlanksByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'additional-components-from-remaining-sheet-width'} tooltipText={'Additional Components from remaining sheet = Total Blanks from remaining sheet * Cavity'} />
                                                        <NumberFieldHookForm
                                                            label={`Additional Components from remaining sheet`}
                                                            name={'AdditionalComponentsByWidth'}
                                                            id={'additional-components-from-remaining-sheet-width'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.AdditionalComponentsByWidth}
                                                            disabled={true}
                                                        /></td>
                                                    <td>
                                                        <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'additional-components-from-remaining-sheet-length'} tooltipText={'Additional Components from remaining sheet = Total Blanks from remaining sheet * Cavity'} />
                                                        <NumberFieldHookForm
                                                            label={`Additional Components from remaining sheet`}
                                                            name={'AdditionalComponentsByLength'}
                                                            id={'additional-components-from-remaining-sheet-length'}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            handleChange={() => { }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder ml-2'}
                                                            errors={errors.AdditionalComponentsByLength}
                                                            disabled={true}
                                                        /></td>
                                                </tr>
                                            </>}
                                            <>
                                                <tr>
                                                    <td>
                                                        <div className='label-with-radio-btn ml-2'>
                                                            <input
                                                                type="radio"
                                                                name="childType"
                                                                checked={finalComponentSelected === true ? true : false}
                                                                className='radio-btn'
                                                                onClick={() => handleRadioChange('Width')}
                                                                disabled={CostingViewMode ? true : false}
                                                            />
                                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component-per-sheet-width'} tooltipText={'Total Component/Sheet = Components/Sheet + Additional Components from remaining sheet'} />
                                                            <NumberFieldHookForm
                                                                label={`Total Component/Sheet`}
                                                                name={'TotalComponentByWidth'}
                                                                id={'total-component-per-sheet-width'}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.TotalComponentByWidth}
                                                                disabled={true}
                                                            />
                                                        </div>

                                                    </td>
                                                    <td>
                                                        <div className='label-with-radio-btn ml-2'>
                                                            <input
                                                                type="radio"
                                                                name="childType"
                                                                className='radio-btn'
                                                                checked={finalComponentSelected === false ? true : false}
                                                                onClick={() => handleRadioChange('Length')}
                                                                disabled={CostingViewMode ? true : false}
                                                            />
                                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component-per-sheet-length'} tooltipText={'Total Component/Sheet = Components/Sheet + Additional Components from remaining sheet'} />
                                                            <NumberFieldHookForm
                                                                label={`Total Component/Sheet`}
                                                                name={'TotalComponentByLength'}
                                                                Controller={Controller}
                                                                id={'total-component-per-sheet-length'}
                                                                control={control}
                                                                register={register}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.TotalComponentByLength}
                                                                disabled={true}
                                                            /></div></td>
                                                </tr>
                                            </>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={UnitFormat()}
                                        name={'NetSurfaceArea'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0'}
                                        errors={errors.NetSurfaceArea}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="3">
                                    <TooltipCustom width={'340px'} id={'gross-weight-info'} tooltipText={"Gross Weight is calculated by the maximum value of 'Total Component/Sheet' . Radio button is pre-selected accordingly"} />
                                    <TooltipCustom disabledIcon={true} id={'gross-weight'} tooltipText={"Gross Weight = Weight of sheet / Total Component/Sheet"} />
                                    <TextFieldHookForm
                                        label={`Gross Weight(${UOMDimension?.label})`}
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
                                    /></Col>
                                <Col md="3"> <TextFieldHookForm
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
                                    handleChange={setFinishWeight}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.FinishWeightOfSheetByWidth}
                                    disabled={CostingViewMode ? true : false}
                                /></Col>
                                <Col md="3"> <TextFieldHookForm
                                    label={`Scrap Recovery (%)`}
                                    name={'ScrapRecoveryPercent'}
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
                                    errors={errors.ScrapRecoveryPercentByWidth}
                                    disabled={props.CostingViewMode ? true : false}
                                /></Col>
                                <Col md="3"><TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipClass={'weight-of-sheet'} tooltipText={`Scrap Weight = (Gross Weight - ${finishWeightLabel} Weight )* Scrap Recovery (%)/100`} />
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
                                        errors={errors.ScrapWeightByWidth}
                                        disabled={true}
                                    /></Col>
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

export default SheetDetails
