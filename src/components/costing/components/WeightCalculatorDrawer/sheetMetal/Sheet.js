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
import { G, KG, MG, } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import { nonZero } from '../../../../../helper/validation'
import TooltipCustom from '../../../../common/Tooltip'

function Sheet(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, item, CostingViewMode } = props
    const [rightEndAcc, setRightEndAcc] = useState(true)
    const [bottomEndAcc, setBottomEndAcc] = useState(true)
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');

    const convert = (FinishWeightOfSheet, dimmension) => {
        switch (dimmension) {
            case G:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet)
                }, 200);
                break;
            case KG:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet * 1000)
                }, 200);
                break;
            case MG:
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
        SheetThickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
        SheetLength: WeightCalculatorRequest && WeightCalculatorRequest.LengthOfSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.LengthOfSheet, localStorage.NoOfDecimalForInputOutput) : '',
        SheetWeight: WeightCalculatorRequest && WeightCalculatorRequest.WeightOfSheetInUOM !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.WeightOfSheetInUOM, localStorage.NoOfDecimalForInputOutput) : '',
        BlankWidth: WeightCalculatorRequest && WeightCalculatorRequest.BlankWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankWidth, localStorage.NoOfDecimalForInputOutput) : '',
        StripsNumber: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfStrips !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfStrips, localStorage.NoOfDecimalForInputOutput) : '',
        BlankLength: WeightCalculatorRequest && WeightCalculatorRequest.BlankLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BlankLength, localStorage.NoOfDecimalForInputOutput) : '',
        ComponentPerStrip: WeightCalculatorRequest && WeightCalculatorRequest.ComponentsPerStrip !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ComponentsPerStrip, localStorage.NoOfDecimalForInputOutput) : '',
        NoOfComponent: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPartsPerSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfPartsPerSheet, localStorage.NoOfDecimalForInputOutput) : '', // TOTAL COMPONENT PER SHEET
        Cavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Cavity, localStorage.NoOfDecimalForInputOutput) : 1,
        NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest.NetSurfaceArea !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetSurfaceArea, localStorage.NoOfDecimalForInputOutput) : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',
        FinishWeightOfSheet: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '',
    }

    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
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


    const fieldValues = useWatch({
        control,
        name: ['SheetThickness', 'SheetWidth', 'SheetLength', 'BlankWidth', 'BlankLength', 'Cavity',],
    })
    const scrapWeightValues = useWatch({
        control,
        name: ['FinishWeightOfSheetByWidth', 'FinishWeightOfSheetByLength', 'ScrapRecoveryPercentByLength', 'ScrapRecoveryPercentByWidth'],
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
        scrapWeightCalculation()
    }, [scrapWeightValues])
    useEffect(() => {
        if (!CostingViewMode) {
            setWeightOfSheet()
            setNoOfStrips()
            setComponentPerStrips()
            setNoOfComponent()
            setTimeout(() => {
                setGrossWeight()
            }, 1000);
            setRemainingSheetLengthByWidth()
            setRemainingSheetLengthByLength()
        }
    }, [fieldValues])

    useEffect(() => {
        if (Number(getValues('FinishWeightOfSheet')) < Number(GrossWeight)) {
            delete errors.FinishWeightOfSheet
            setRerender(!reRender)
        }
    }, [GrossWeight, fieldValues])

    const setFinishWeight = (e, type) => {
        const FinishWeightOfSheet = e.target.value
        const grossWeight = type === 'Width' ? checkForNull(getValues('GrossWeightByWidth')) : checkForNull(getValues('GrossWeightByLength'))
        if (e.target.value > grossWeight) {
            setTimeout(() => {
                setValue('FinishWeightOfSheetByWidth', '')
                setValue('FinishWeightOfSheetByLength', '')
            }, 200);

            Toaster.warning('Finish Weight should not be greater than gross weight')
            return false
        }
        switch (UOMDimension.label) {
            case G:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet)
                }, 200);
                break;
            case KG:
                setTimeout(() => {
                    setFinishWeights(FinishWeightOfSheet * 1000)
                }, 200);
                break;
            case MG:
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

        let grossWeightByWidth
        let grossWeightByLength
        const sheetWeight = getValues('SheetWeight')
        const noOfComponentByWidth = getValues('TotalComponentByWidth')
        const noOfComponentByLength = getValues('TotalComponentByLength')
        const cavity = getValues('Cavity')

        grossWeightByWidth = (sheetWeight / noOfComponentByWidth) / cavity
        grossWeightByLength = (sheetWeight / noOfComponentByLength) / cavity

        const updatedValue = dataToSend
        updatedValue.GrossWeightByWidth = setValueAccToUOM(grossWeightByWidth, UOMDimension.label)
        updatedValue.GrossWeightByLength = setValueAccToUOM(grossWeightByLength, UOMDimension.label)
        updatedValue.newGrossWeightByWidth = setValueAccToUOM(grossWeightByWidth, UOMDimension.label)
        updatedValue.newGrossWeightByLength = setValueAccToUOM(grossWeightByLength, UOMDimension.label)
        setTimeout(() => {
            setDataToSend(updatedValue)
            setValue('GrossWeightByWidth', checkForDecimalAndNull(setValueAccToUOM(grossWeightByWidth, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
            setValue('GrossWeightByLength', checkForDecimalAndNull(setValueAccToUOM(grossWeightByLength, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
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
        const remainingSLRightEnd = checkForNull(sheetLength - remainingSLBottom)
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

        let grossWeight = (dataToSend.newGrossWeight === undefined || dataToSend.newGrossWeight === 0) ? GrossWeight : dataToSend.newGrossWeight

        let data = {
            LayoutType: 'Sheet',
            SheetMetalCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.SheetMetalCalculationId ? WeightCalculatorRequest.SheetMetalCalculationId : "0",
            IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            RawMaterialCost: grossWeight * rmRowData.RMRate - (grossWeight - getValues('FinishWeightOfSheet')) * calculatePercentage(getValues('scrapRecoveryPercent')) * rmRowData.ScrapRate,
            UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
            UOMForDimension: UOMDimension ? UOMDimension.label : '',
            Cavity: values.Cavity,
            Thickness: values.SheetThickness,
            SheetLength: values.SheetLength,
            WeightOfSheet: dataToSend.WeightOfSheet,
            Width: values.SheetWidth,
            BlankWidth: values.BlankWidth,
            BlankLength: values.BlankLength,
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
            RemainingSheetLengthPerBlankWidthBottomByLength: getValues('RemainingSLPerBLBottomByLength'),
            NoOfBlanksBottomEndByLength: getValues('NoOfBlanksBottomEndByLength'),
            RemainingSheetLengthRightEndByLength: getValues('RemainingSLRightEndByLength'),
            RemainingSheetWidthRightEndByLength: getValues('RemainingSWRightEndByLength'),
            RemainingSheetLengthPerBlankWidthRightEndByLength: getValues('RemainingSLPerBWRightEndByLength'),
            RemainingSheetWidthPerBlankLengthRightEndByLength: getValues('RemainingSWPerBLRightEndByLength'),
            NoOfBlanksRightEndByLength: getValues('NoOfBlanksRightEndByLength'),
            TotalNoOfBlanksByLength: getValues('TotalNoOfBlanksByLength'),
            AdditionalComponentsByLength: getValues('AdditionalComponentsByLength'),
            TotalComponentByLength: getValues('TotalComponentByLength'),
            GrossWeightByWidth: getValues('GrossWeightByWidth'),
            FinishWeightOfSheetByWidth: getValues('FinishWeightOfSheetByWidth'),
            ScrapRecoveryPercentByWidth: getValues('ScrapRecoveryPercentByWidth'),
            ScrapWeightByWidth: getValues('ScrapWeightByWidth'),
            GrossWeightByLength: getValues('GrossWeightByLength'),
            FinishWeightOfSheetByLength: getValues('FinishWeightOfSheetByLength'),
            ScrapRecoveryPercentByLength: getValues('ScrapRecoveryPercentByLength'),
            ScrapWeightByLength: getValues('ScrapWeightByLength')
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
        setValue('UOMDimension', { label: value.label, value: value.value })
        setUOMDimension(value)
        let grossWeightByWidth = dataToSend.GrossWeightByWidth
        console.log('dataToSend: ', dataToSend);
        let grossWeightByLength = dataToSend.GrossWeightByLength
        setDataToSend(prevState => ({ ...prevState, newGrossWeightByWidth: setValueAccToUOM(grossWeightByWidth, value.label), newGrossWeightByLength: setValueAccToUOM(grossWeightByLength, value.label), newFinishWeight: setValueAccToUOM(FinishWeightOfSheet, value.label) }))
        setValue('GrossWeightByWidth', checkForDecimalAndNull(setValueAccToUOM(grossWeightByWidth, value.label), localStorage.NoOfDecimalForInputOutput))
        setValue('GrossWeightByLength', checkForDecimalAndNull(setValueAccToUOM(grossWeightByLength, value.label), localStorage.NoOfDecimalForInputOutput))
        setValue('FinishWeightOfSheetByWidth', 0)
        setValue('FinishWeightOfSheetByLength', 0)
        setValue('ScrapRecoveryPercentByWidth', 0)
        setValue('ScrapRecoveryPercentByLength', 0)
    }
    const scrapWeightCalculation = () => {
        const scrapRecoveryPercentByWidth = Number((getValues('ScrapRecoveryPercentByWidth')))
        const scrapRecoveryPercentByLength = Number((getValues('ScrapRecoveryPercentByLength')))
        const grossWeightByWidth = getValues('GrossWeightByWidth')
        const grossWeightByLength = getValues('GrossWeightByLength')
        const finishWeightOfSheetByWidth = getValues('FinishWeightOfSheetByWidth')
        const finishWeightOfSheetByLength = getValues('FinishWeightOfSheetByLength')
        const scrapWeightByWidth = calculateScrapWeight(grossWeightByWidth, finishWeightOfSheetByWidth, scrapRecoveryPercentByWidth)
        const scrapWeightByLength = calculateScrapWeight(grossWeightByLength, finishWeightOfSheetByLength, scrapRecoveryPercentByLength)
        setValue('ScrapWeightByWidth', checkForDecimalAndNull(scrapWeightByWidth, localStorage.NoOfDecimalForInputOutput))
        setValue('ScrapWeightByLength', checkForDecimalAndNull(scrapWeightByLength, localStorage.NoOfDecimalForInputOutput))
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
                                <Col md="12" className={'mt25'}>
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
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'sheet-weight'} tooltipText={'Weight of Sheet = (Density * (Thickness * Width * Length)) / 1000'} />
                                    <TextFieldHookForm
                                        label={`Weight of Sheet(g)`}
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
                                                <td> <TooltipCustom disabledIcon={true} id={'sheet-strips'} tooltipText={'No. of Strips = (Sheet Length / Strip Width)'} />
                                                    <TextFieldHookForm
                                                        label={`No. of Strips`}
                                                        id={'sheet-strips'}
                                                        name={'NumberOfStripsByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.NumberOfStripsByWidth}
                                                        disabled={true}
                                                    /></td>
                                                <td><TooltipCustom disabledIcon={true} id={'sheet-strips-length'} tooltipText={'No. of Strips = (Sheet Length / Strip Width)'} />
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
                                                        customClassName={'withBorder'}
                                                        errors={errors.NumberOfStripsByLength}
                                                        disabled={true}
                                                    /></td>
                                            </tr>
                                            <tr>
                                                <td> <TooltipCustom disabledIcon={true} id={'sheet-component-per-strip'} tooltipText={'Blanks/Strip = (Sheet Width / Blank Size)'} />
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
                                                        customClassName={'withBorder'}
                                                        errors={errors.ComponentPerStrip}
                                                        disabled={true}
                                                    /></td>
                                                <td><TooltipCustom disabledIcon={true} id={'sheet-component-per-strip-length'} tooltipText={'Blanks/Strip = (Sheet Width / Blank Size)'} />
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
                                                        customClassName={'withBorder'}
                                                        errors={errors.blanksPerStripByLength}
                                                        disabled={true}
                                                    /></td>
                                            </tr>
                                            <tr>
                                                <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component'} tooltipText={'Component/Sheet = (No. of Strips * Components per Strip * Cavity )'} />
                                                    <TextFieldHookForm
                                                        label={`Components/Sheet`}
                                                        name={'NoOfComponentByWidth'}
                                                        id={'total-component'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.NoOfComponentByWidth}
                                                        disabled={true}
                                                    /></td>
                                                <td> <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-component-length'} tooltipText={'Component/Sheet = (No. of Strips * Components per Strip * Cavity )'} />
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
                                                        customClassName={'withBorder'}
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
                                                    <td> <NumberFieldHookForm
                                                        label={`Sheet Width(mm)`}
                                                        name={'SheetWidthBottom'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.SheetWidthBottom}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Sheet Width(mm)`}
                                                        name={'SheetWidthBottom'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.SheetWidthBottom}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Length(mm)`}
                                                        name={'RemainingSLBottomByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLBottomByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td> <NumberFieldHookForm
                                                        label={`Remaining Sheet Length(mm)`}
                                                        name={'RemainingSLBottomByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLBottomByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Width/Blank Width`}
                                                        name={'RemainingSWPerBWBottomByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWPerBWBottomByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Width/Blank Length`}
                                                        name={'RemainingSWPerBLBottomByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWPerBLBottomByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Length/Blank Length`}
                                                        name={'RemainingSLPerBLBottomByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLPerBLBottomByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Length/Blank Width`}
                                                        name={'RemainingSLPerBWBottomByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLPerBWBottomByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td> <NumberFieldHookForm
                                                        label={`No. of Blanks(Bottom End)`}
                                                        name={'NoOfBlanksBottomEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.NoOfBlanksBottomEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`No. of Blanks(Bottom End)`}
                                                        name={'NoOfBlanksBottomEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
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
                                                    <td> <NumberFieldHookForm
                                                        label={`Remaining Sheet Length(mm)`}
                                                        name={'RemainingSLRightEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLRightEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Length(mm)`}
                                                        name={'RemainingSLRightEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLRightEndByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Width(mm)`}
                                                        name={'RemainingSWRightEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWRightEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td> <NumberFieldHookForm
                                                        label={`Remaining Sheet Width(mm)`}
                                                        name={'RemainingSWRightEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWRightEndByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td> <NumberFieldHookForm
                                                        label={`Remaining Sheet Length/Blank Length`}
                                                        name={'RemainingSLPerBLRightEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLPerBLRightEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Length/Blank Width`}
                                                        name={'RemainingSLPerBWRightEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSLPerBWRightEndByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td> <NumberFieldHookForm
                                                        label={`Remaining Sheet Width/Blank Width`}
                                                        name={'RemainingSWPerBWRightEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWPerBWRightEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Remaining Sheet Width/Blank Length`}
                                                        name={'RemainingSWPerBLRightEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.RemainingSWPerBLRightEndByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td> <NumberFieldHookForm
                                                        label={`No. of Blanks(Right End)`}
                                                        name={'NoOfBlanksRightEndByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.NoOfBlanksRightEndByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`No. of Blanks(Right End)`}
                                                        name={'NoOfBlanksRightEndByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.NoOfBlanksRightEndByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td> <NumberFieldHookForm
                                                        label={`Total Blanks from remaining sheet`}
                                                        name={'TotalNoOfBlanksByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.TotalNoOfBlanksByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td> <NumberFieldHookForm
                                                        label={`Total Blanks from remaining sheet`}
                                                        name={'TotalNoOfBlanksByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.TotalNoOfBlanksByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Additional Components from remaining sheet`}
                                                        name={'AdditionalComponentsByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.AdditionalComponentsByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td><NumberFieldHookForm
                                                        label={`Additional Components from remaining sheet`}
                                                        name={'AdditionalComponentsByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.AdditionalComponentsByLength}
                                                        disabled={true}
                                                    /></td>
                                                </tr>
                                            </>}
                                            <>
                                                <tr>
                                                    <td><NumberFieldHookForm
                                                        label={`Total Component/Sheet`}
                                                        name={'TotalComponentByWidth'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.TotalComponentByWidth}
                                                        disabled={true}
                                                    /></td>
                                                    <td> <NumberFieldHookForm
                                                        label={`Total Component/Sheet`}
                                                        name={'TotalComponentByLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.TotalComponentByLength}
                                                        disabled={true}
                                                    /></td>
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
                                <Col md="3">
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
                                        customClassName={'mb-0'}
                                        mandatory={true}
                                        handleChange={handleUnit}
                                        errors={errors.UOMDimension}
                                        disabled={CostingViewMode ? true : false}
                                    />

                                </Col>
                            </Row>
                            <Row>
                                <Col md="3"> <TooltipCustom disabledIcon={true} id={'gross-weight'} tooltipText={"Gross Weight = Weight of sheet / No. of Parts"} />
                                    <TextFieldHookForm
                                        label={`Gross Weight(${UOMDimension.label})`}
                                        name={'GrossWeightByWidth'}
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
                                    label={`Finish Weight(${UOMDimension.label})`}
                                    name={'FinishWeightOfSheetByWidth'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        max: {
                                            value: getValues('GrossWeightByWidth'),
                                            message: 'Finish weight should not be greater than gross weight.'
                                        },
                                    }}
                                    handleChange={(e) => setFinishWeight(e, 'Width')}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.FinishWeightOfSheetByWidth}
                                    disabled={CostingViewMode ? true : false}
                                /></Col>
                                <Col md="3"> <TextFieldHookForm
                                    label={`Scrap Recovery (%)`}
                                    name={'ScrapRecoveryPercentByWidth'}
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
                                <Col md="3"><TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipClass={'weight-of-sheet'} tooltipText={'Scrap Weight = (Gross Weight - Finish Weight )* Scrap Recovery (%)/100'} />
                                    <TextFieldHookForm
                                        label={`Scrap Weight(${UOMDimension.label})`}
                                        name={'ScrapWeightByWidth'}
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

export default Sheet
