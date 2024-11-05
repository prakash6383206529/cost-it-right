import React, { Fragment, useEffect, useState } from "react"
import { fetchSpecificationDataAPI, getCurrencySelectList, getPlantSelectListByType, getUOMSelectList, getVendorNameByVendorSelectList, getFrequencySettlement, getExchangeRateSource } from "../../../actions/Common"
import { CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, effectiveDateRangeDays, searchCount } from "../../../config/constants"
import { useDispatch, useSelector } from "react-redux"
import { getCostingSpecificTechnology, getExchangeRateByCurrency } from "../../costing/actions/Costing"
import { IsFetchExchangeRateVendorWise, IsShowFreightAndShearingCostFields, getConfigurationKey, labelWithUOMAndCurrency, labelWithUOMAndUOM, loggedInUserId, showRMScrapKeys } from "../../../helper"
import { setRawMaterialDetails, getRMGradeSelectListByRawMaterial, getRMSpecificationDataAPI, getRawMaterialNameChild, SetCommodityIndexAverage, setExchangeRateDetails } from "../actions/Material"
import { useForm, Controller, useWatch } from "react-hook-form"
import { Row, Col } from 'reactstrap'
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, AsyncSearchableSelectHookForm, DatePickerHookForm, } from '../../layout/HookFormInputs';
import LoaderCustom from "../../common/LoaderCustom"
import { MESSAGES } from "../../../config/message"
import { reactLocalStorage } from "reactjs-localstorage"
import Button from '../../layout/Button';
import TooltipCustom from "../../common/Tooltip"
import Toaster from "../../common/Toaster"
import {
    acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation, positiveAndDecimalNumber, maxLength15, number, decimalNumberLimit3, maxLength10, decimalLengthsix,
    checkForNull,
    checkForDecimalAndNull, integerOnly
} from "../../../helper/validation";
import DayTime from "../../common/DayTimeWrapper"
import { AcceptableRMUOM } from "../../../config/masterData"
import AddConditionCosting from "../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting"
import HeaderTitle from "../../common/HeaderTitle"
import AddOtherCostDrawer from "./AddOtherCostDrawer"
import { addDays, endOfMonth, addWeeks, addMonths, addQuarters, addYears, isLeapYear, isAfter, getMonth, getQuarter, endOfQuarter, getDate, subDays } from 'date-fns';
import { TestHeadless } from "ag-grid-community"
import AddIndexationMaterialListing from "./AddIndexationMaterialListing"
import { getIndexSelectList, setOtherCostDetails } from "../actions/Indexation"
import { getPlantUnitAPI } from "../actions/Plant"
import _ from 'lodash'
function AddRMFinancialDetails(props) {
    const { Controller, control, register, setValue, getValues, errors, reset, useWatch, states, data, isRMAssociated, disableAll } = props
    const { isEditFlag, isViewFlag } = data

    const rawMaterailDetails = useSelector((state) => state.material.rawMaterailDetails)
    const exchangeRateDetails = useSelector((state) => state.material.exchangeRateDetails)

    const [state, setState] = useState({
        inputLoader: false,
        showErrorOnFocus: false,
        isDropDownChanged: false,
        IsFinancialDataChanged: false,
        UOM: [],
        effectiveDate: '',
        conditionTableData: [],
        totalConditionCost: '',
        NetLandedCostConversion: '',
        FinalConditionCostBaseCurrency: '',
        ScrapRateUOMConverted: '',
        ForgingScrapCostUOMConverted: '',
        FinalMachiningScrapCostBaseCurrency: '',
        FinalCircleScrapCostBaseCurrency: '',
        JaliScrapCostUOMConverted: '',
        FinalJaliScrapCostSelectedCurrency: '',
        FinalFreightCostBaseCurrency: '',
        FinalShearingCostBaseCurrency: '',
        toolTipTextObject: {},
        IsApplyHasDifferentUOM: false,
        ScrapRateUOM: [],
        CalculatedFactor: '',
        UOMToScrapUOMRatio: '',
        ScrapRatePerScrapUOM: '',
        ScrapRatePerScrapUOMConversion: '',
        ConversionRatio: '',
        currencyValue: 1,
        showCurrency: false,
        DataToChange: [],
        currency: [],
        oldDate: '',
        isCostOpen: true,
        isAttachmentOpen: false,
        fromDate: '',
        toDate: '',
        minDate: '',
        maxDate: '',
        dateRange: 0,
        frequencyOfSettlement: [],
        disableToDate: true,
        isIndexationOpen: false,
        isCommodityOpen: false,
        totalBasicRate: getValues('BasicRate'),
        otherCostTableData: [],
        totalOtherCost: 0,
        isShowIndexCheckBox: false,
        exchange: [],
        index: [],
        enableHalfMonthDays: false,
        plantCurrency: '',
        BasicRatePerUOM: 0,
        NetConditionCost: 0,
        NetCostWithoutConditionCost: 0,
    });
    const [CurrencyExchangeRate, setCurrencyExchangeRate] = useState({
        plantCurrencyRate: 1,
        settlementCurrencyRate: 1,
    })
    const [showScrapKeys, setShowScrapKeys] = useState({
        showForging: false,
        showCircleJali: false,
        showScrap: false
    })
    const dispatch = useDispatch()
    const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const frequncySettlementList = useSelector((state) => state.comman.frequencyOfSettlement)
    const { indexCommodityData } = useSelector((state) => state.indexation);
    const RMIndex = getConfigurationKey()?.IsShowMaterialIndexation


    const values = useWatch({
        control,
        name: ['BasicRate']
    })

    const domesticFinancialFields = useWatch({
        control,
        name: ['JaliScrapCost', 'ForgingScrapBaseCurrency', 'ScrapRate', 'cutOffPriceBaseCurrency', 'CircleScrapCostBaseCurrency', 'MachiningScrapBaseCurrency']
    })

    useEffect(() => {
        calculateNetCostDomestic();
    }, [values])
    useEffect(() => {
        if (isEditFlag) {
            handleFinancialDataChange()
        }
    }, [domesticFinancialFields])
    useEffect(() => {
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, ShowScrapKeys: showScrapKeys }, () => { }))
    }, [showScrapKeys])
    useEffect(() => {
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, CurrencyValue: state.currencyValue }, () => { }))
    }, [state.currencyValue])
    useEffect(() => {
        dispatch(getUOMSelectList(() => { }))
        allFieldsInfoIcon(true)

    }, [])
    useEffect(() => {
        const plantValue = getValues('Plants');
        if (plantValue && plantValue?.value) {
            dispatch(getPlantUnitAPI(plantValue?.value, (res) => {
                let Data = res?.data?.Data
                let CurrencyId = Data?.CurrencyId
                setValue('plantCurrency', Data?.Currency)
                const { costingTypeId } = states;
                let fromCurrency = states.isImport ? state.currency?.label : Data?.Currency
                let toCurrency = !states.isImport ? reactLocalStorage.getObject("baseCurrency") : Data?.Currency
                const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId
                const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? rawMaterailDetails?.Vendor?.value : EMPTY_GUID) : EMPTY_GUID
                if (state.effectiveDate) {
                    dispatch(getExchangeRateByCurrency(fromCurrency, costingType, DayTime(state.effectiveDate).format('YYYY-MM-DD'), vendorValue, rawMaterailDetails?.customer?.value, false, toCurrency, getValues('ExchangeSource')?.label ?? null, res => {
                        if (Object.keys(res.data.Data).length === 0) {
                            setState(prevState => ({ ...prevState, showWarning: true }));
                        } else {
                            setState(prevState => ({ ...prevState, showWarning: false }));
                        }
                        let Data = res?.data?.Data
                        setCurrencyExchangeRate(prevState => ({ ...prevState, plantCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }))
                        dispatch(setExchangeRateDetails({ ...exchangeRateDetails, LocalCurrencyExchangeRate: Data?.CurrencyExchangeRate, LocalExchangeRateId: Data?.ExchangeRateId, LocalCurrency: Data?.Currency, LocalCurrencyId: CurrencyId, }, () => { }))
                    }));
                }
            }));
        }
    }, [getValues('Plants'), getValues('ExchangeSource'), state.effectiveDate]);
    useEffect(() => {
        dispatch(getFrequencySettlement(() => { }))
        allFieldsInfoIcon(true)
        dispatch(getCurrencySelectList(() => { }))
        dispatch(getIndexSelectList((res) => { }));
    }, [])
    useEffect(() => {
        if (rawMaterailDetails && rawMaterailDetails?.Technology && Object.keys(rawMaterailDetails?.Technology).length > 0) {
            checkTechnology()
        }
    }, [rawMaterailDetails?.Technology])
    useEffect(() => {
        setState(prevState => ({ ...prevState, isShowIndexCheckBox: rawMaterailDetails?.isShowIndexCheckBox }))
    }, [rawMaterailDetails?.isShowIndexCheckBox])
    useEffect(() => {
        handleVendor()
    }, [rawMaterailDetails?.Vendor])
    useEffect(() => {
        handleCustomer()
    }, [rawMaterailDetails?.customer])

    useEffect(() => {
        calculateNetCostDomestic()
    }, [values, state.totalOtherCost, CurrencyExchangeRate])
    useEffect(() => {
        if (props?.DataToChange && Object.keys(props?.DataToChange).length > 0) {
            let Data = props?.DataToChange
            setValue('UnitOfMeasurement', { label: Data?.UnitOfMeasurementName, value: Data?.UOM })
            setValue('cutOffPrice', Data?.CutOffPrice)
            setValue('BasicRate', Data?.BasicRatePerUOM)
            setValue('ScrapRatePerScrapUOM', Data?.ScrapRatePerScrapUOM)
            setValue('ScrapRate', Data?.ScrapRate)
            setValue('ConversionRatio', Data?.UOMToScrapUOMRatio)
            setValue('UOMToScrapUOMRatio', Data?.UOMToScrapUOMRatio)
            setValue('BasicPriceSelectedCurrency', Data?.NetCostWithoutConditionCost)
            setValue('NetCostWithoutConditionCost', states.isImport ? Data?.NetCostWithoutConditionCostConversion : Data?.NetCostWithoutConditionCost)
            setValue('NetLandedCost', Data?.NetLandedCost)
            setValue('NetLandedCostConversion', states.isImport ? Data?.NetLandedCostConversion : Data?.NetLandedCost)
            setValue('FinalConditionCostBaseCurrency', states.isImport ? Data?.NetConditionCostConversion : Data?.NetConditionCost)
            setValue('ScrapRateUOM', { label: Data?.ScrapUnitOfMeasurement, value: Data?.ScrapUnitOfMeasurementId })
            setValue('CalculatedFactor', Data?.CalculatedFactor)
            setValue('effectiveDate', Data?.EffectiveDate ? DayTime(Data?.EffectiveDate).$d : '')
            setValue('CircleScrapCost', Data?.JaliScrapCost)
            setValue('currency', { label: Data?.Currency, value: Data?.CurrencyId })
            setValue('MachiningScrap', Data?.MachiningScrapRate)
            setValue('JaliScrapCost', Data?.ScrapRate)
            setValue('ForgingScrap', Data?.ScrapRate)
            setValue('frequencyOfSettlement', { label: Data?.FrequencyOfSettlement, value: Data?.FrequencyOfSettlementId })
            setValue('fromDate', DayTime(Data?.FromDate).$d)
            setValue('toDate', DayTime(Data?.ToDate).$d)
            setValue('OtherCost', Data?.OtherNetCost)
            setValue('Index', { label: Data?.IndexExchangeName, value: Data?.IndexExchangeId })
            setValue('plantCurrency', Data?.LocalCurrency)
            setValue('FinalConditionCost', Data?.NetConditionCost)
            setState(prevState => ({
                ...prevState,

            }))
            let updatedState = {
                ...state,
                effectiveDate: Data?.EffectiveDate ? DayTime(Data?.EffectiveDate).$d : '',
                sourceLocation: Data?.SourceSupplierLocationName !== undefined ? { label: Data?.SourceSupplierLocationName, value: Data?.SourceLocation } : [],
                UOM: { label: Data?.UnitOfMeasurementName, value: Data?.UOM },
                IsApplyHasDifferentUOM: Data?.IsScrapUOMApply,
                ScrapRateUOM: { label: Data?.ScrapUnitOfMeasurement, value: Data?.ScrapUnitOfMeasurementId },
                FinalConditionCostBaseCurrency: states.isImport ? Data?.NetConditionCostConversion : Data?.NetConditionCost,
                conditionTableData: Data?.RawMaterialConditionsDetails,
                currency: Data?.Currency !== undefined ? { label: Data?.Currency, value: Data?.CurrencyId } : [],
                showCurrency: true,
                currencyValue: Data?.CurrencyExchangeRate,
                calculatedFactor: Data?.CalculatedFactor,
                otherCostTableData: Data?.RawMaterialOtherCostDetails,
                isShowIndexCheckBox: Data?.IsIndexationDetails,
                minDate: DayTime(Data?.EffectiveDate).$d,
                totalBasicRate: Data?.CommodityNetCost,
                NetConditionCost: Data?.NetConditionCost,
                totalOtherCost: Data?.OtherNetCost,
                NetLandedCost: Data?.NetLandedCost,
            }
            setState(updatedState)
            let obj = showRMScrapKeys(Data?.TechnologyId)
            setShowScrapKeys(obj)
            setCurrencyExchangeRate(prevState => ({
                ...prevState, plantCurrencyRate: !states.isImport ? Data?.CurrencyExchangeRate : checkForNull(Data?.LocalCurrencyExchangeRate),
                settlementCurrencyRate: !states.isImport ? checkForNull(Data?.CurrencyExchangeRate) : null
            }))
            setState(updatedState)
            dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: updatedState, isShowIndexCheckBox: Data?.IsIndexationDetails, ShowScrapKeys: obj }, () => { }))
            dispatch(setExchangeRateDetails({
                ...exchangeRateDetails, LocalCurrencyExchangeRate: !states.isImport ? Data?.CurrencyExchangeRate : Data?.LocalCurrencyExchangeRate, LocalExchangeRateId: !states.isImport ? Data?.ExchangeRateId : Data?.LocalExchangeRateId, LocalCurrencyId: !states.isImport ? Data?.CurrencyId : Data?.LocalCurrencyId,
                CurrencyExchangeRate: state?.isImport ? Data?.CurrencyExchangeRate : null, ExchangeRateId: state?.isImport ? Data?.ExchangeRateId : null
            }, () => { }))
            checkTechnology()
        }
    }, [props?.DataToChange])
    useEffect(() => {
        if (state.isIndexationOpen) {
            setValue('BasicRate', checkForDecimalAndNull(state?.totalBasicRate, getConfigurationKey().NoOfDecimalForPrice))
        }
    }, [state?.totalBasicRate])


    const netCostTitle = () => {
        if (getConfigurationKey().IsBasicRateAndCostingConditionVisible && Number(states.costingTypeId) === Number(ZBCTypeId)) {
            let obj = {
                toolTipTextNetCostSelectedCurrency: `Net Cost (${state.currency?.label === undefined ? 'Currency' : state.currency?.label}) = Basic Price (${state.currency?.label === undefined ? 'Currency' : state.currency?.label}) + Condition Cost (${state.currency?.label === undefined ? 'Currency' : state.currency?.label})`,
                toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Price (${reactLocalStorage.getObject("baseCurrency")})  + Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`
            }
            return obj
        } else {
            let obj = {
                toolTipTextNetCostSelectedCurrency: `Net Cost (${state.currency?.label === undefined ? 'Currency' : state.currency?.label}) = Basic Rate (${state.currency?.label === undefined ? 'Currency' : state.currency?.label}) + Other Cost (${state.currency?.label === undefined ? 'Currency' : state.currency?.label})`,
                toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) + Other Cost (${reactLocalStorage.getObject("baseCurrency")})`
            }
            return obj
        }
    }

    const basicPriceTitle = () => {
        if (getConfigurationKey().IsBasicRateAndCostingConditionVisible && Number(states.costingTypeId) === Number(ZBCTypeId)) {
            let obj = {
                toolTipTextBasicPriceSelectedCurrency: `Basic Price (${state.currency?.label === undefined ? 'Currency' : state.currency?.label}) = Basic Rate (${state.currency?.label === undefined ? 'Currency' : state.currency?.label})`,
                toolTipTextBasicPriceBaseCurrency: `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
            }
            return obj
        }
    }

    /**
     * @method renderListing
     * @description Used show listing 
     */
    const renderListing = (label, isScrapRateUOM) => {
        const temp = []
        if (label === 'uom') {
            UOMSelectList && UOMSelectList.map((item) => {
                const accept = AcceptableRMUOM.includes(item.Type)
                if (isScrapRateUOM === true && state.UOM?.value === item?.Value) return false
                if (accept === false) return false
                if (item.Value === '0') return false
                temp.push({ label: item.Display, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'Frequency') {
            frequncySettlementList && frequncySettlementList.map(item => {
                if (item.Value === '--Frequency of Settlement Name--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'IndexExchangeName') {
            indexCommodityData && indexCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

    }

    const handleApplicability = (value, basicPriceBaseCurrency, arr) => {
        const selectedApplicabilities = value?.split(' + ');

        // Calculate total cost currency for selected applicabilities
        const total = selectedApplicabilities.reduce((acc, Applicability) => {
            // Skip checking for "Basic Rate" in tableData

            const item = arr?.find(item => item?.Description.trim() === Applicability.trim());
            if (item) {
                let totalConditionCost = acc + item?.ConditionCost
                return totalConditionCost
            } else {
                return basicPriceBaseCurrency
            }

        }, 0);

        return total
    }

    const recalculateConditions = (basicPriceSelectedCurrency, basicPriceBaseCurrency) => {
        const { conditionTableData } = state;
        let copiedConditionData = _.cloneDeep(conditionTableData) ?? []
        let tempArr = copiedConditionData
        copiedConditionData && copiedConditionData?.map((item, index) => {
            if (item?.ConditionType === "Percentage") {
                let ApplicabilityCost = handleApplicability(item.Applicability, basicPriceBaseCurrency, tempArr)
                let ConditionCost = checkForNull((item?.Percentage) / 100) * checkForNull(ApplicabilityCost)
                let ConditionCostConversion = checkForNull((item?.Percentage) / 100) * checkForNull(ApplicabilityCost)
                let obj = { ...item, ApplicabilityCost: ApplicabilityCost, ConditionCost: ConditionCost, ConditionCostConversion: ConditionCostConversion, ConditionCostPerQuantity: ConditionCostConversion }
                tempArr = Object.assign([...tempArr], { [index]: obj })
            }
        })
        return tempArr
    }
    const allFieldsInfoIcon = (setData) => {
        const { currency, currencyValue, ScrapRateUOM, UOM } = state
        let obj = {
            toolTipTextCutOffBaseCurrency: `Cut Off Price (${reactLocalStorage.getObject("baseCurrency")}) = Cut Off Price (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
            toolTipTextBasicRateBaseCurrency: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
            toolTipTextFreightCostBaseCurrency: `Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) = Freight Cost (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
            toolTipTextShearingCostBaseCurrency: `Shearing Cost (${reactLocalStorage.getObject("baseCurrency")}) = Shearing Cost (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
            toolTipTextConditionCostBaseCurrency: `Condition Cost (${reactLocalStorage.getObject("baseCurrency")}) = Condition Cost (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
            toolTipTextCalculatedFactor: <>{labelWithUOMAndUOM("Calculated Factor", state.UOM?.label, state.ScrapRateUOM?.label)} = 1 / {labelWithUOMAndUOM("Calculated Ratio", state.ScrapRateUOM?.label, state.UOM?.label)}</>,
        }
        if (showScrapKeys?.showCircleJali) {
            obj = {
                ...obj,
                toolTipTextCircleScrapCostBaseCurrency: `Circle Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Circle Scrap Rate (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
                toolTipTextJaliScrapCostBaseCurrency: `Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
                toolTipTextJaliScrapCostSelectedCurrency: `Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Calculated Factor (${state.UOM?.label ? state.UOM?.label : 'UOM'}/${state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM'}) * Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`,
                toolTipTextJaliScrapCostBaseCurrencyPerOldUOM: <>{labelWithUOMAndCurrency("Jali Scrap Rate", state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", state.UOM?.label, state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Jali Scrap Rate", state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))}</>,
                toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Jali Scrap Rate", ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Jali Scrap Rate", ScrapRateUOM?.label, currency?.label)}* Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
            }
        } else if (showScrapKeys?.showForging) {
            obj = {
                ...obj,
                toolTipTextForgingScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Forging Scrap Rate", state.UOM?.label, currency?.label)} * Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
                toolTipTextMachiningScrapCostBaseCurrency: `Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Machining Scrap Rate (${currency?.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency?.label === undefined ? 'Currency' : currencyValue})`,
                toolTipTextForgingScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", UOM?.label, currency?.label)} = {labelWithUOMAndUOM("Calculated Factor", UOM?.label, ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Forging Scrap Rate", ScrapRateUOM?.label, currency?.label)}</>,
                toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Forging Scrap Rate", ScrapRateUOM?.label, currency?.label)} * Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
            }
        } else if (showScrapKeys?.showScrap) {
            obj = {
                ...obj,
                toolTipTextScrapCostBaseCurrency: `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
                toolTipTextScrapCostSelectedCurrency: `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Calculated Factor () * Scrap Rate ()`,
                // toolTipTextScrapCostBaseCurrencyPerOldUOM: <>{labelWithUOMAndCurrency("Scrap Rate", state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", state.UOM?.label, state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Scrap Rate", state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))}</>,
                toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", ScrapRateUOM?.label, currency?.label)} *  Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
            }
        } else {
            obj = {
                ...obj,
                toolTipTextScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", UOM?.label, currency?.label)} * Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
                toolTipTextScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", UOM?.label, ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Scrap Rate", ScrapRateUOM?.label, currency?.label)}</>,
                toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", ScrapRateUOM?.label, currency?.label)} * Currency Rate ({currency?.label === undefined ? 'Currency' : currencyValue})</>,
            }
        }
        if (setData) {
            setTimeout(() => {
                setState(prevState => ({
                    ...prevState, toolTipTextObject: { ...state.toolTipTextObject, ...obj }
                }))
            }, 100);
        }
        return obj
    }

    const convertIntoBase = (price) => {
        const { currencyValue } = state;
        return checkForNull(price) * checkForNull(currencyValue)
    }

    const calculateNetCostDomestic = () => {
        const { showScrapKeys } = state
        const { costingTypeId } = states
        let obj = {}
        if (state.IsApplyHasDifferentUOM) {
            const conversionFactorTemp = 1 / getValues('ConversionRatio')
            setValue('CalculatedFactor', checkForDecimalAndNull(conversionFactorTemp, getConfigurationKey().NoOfDecimalForPrice));
            const scrapRateTemp = checkForNull(getValues('ScrapRatePerScrapUOM')) * checkForNull(conversionFactorTemp)
            if (showScrapKeys?.showCircleJali) {
                obj.JaliScrapCostUOMConverted = scrapRateTemp
                setValue('JaliScrapCost', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
            } else if (showScrapKeys?.showForging) {
                obj.ForgingScrapCostUOMConverted = scrapRateTemp
                setValue('ForgingScrap', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
            } else if (showScrapKeys?.showScrap) {
                obj.ScrapRateUOMConverted = scrapRateTemp
                setValue('ScrapRate', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
            }
            obj.ScrapRateConverted = scrapRateTemp
            obj.CalculatedFactor = conversionFactorTemp
        }

        const basicPriceCurrencyTemp = checkForNull(getValues('BasicRate')) + checkForNull(state?.totalOtherCost)
        let basicPriceBaseCurrency
        if (costingTypeId === ZBCTypeId) {
            basicPriceBaseCurrency = basicPriceCurrencyTemp
        }
        let conditionList = recalculateConditions('', basicPriceBaseCurrency)

        const sumBaseCurrency = conditionList?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
        let NetLandedCost = checkForNull(sumBaseCurrency) + checkForNull(basicPriceCurrencyTemp)

        let NetLandedCostLocalConversion = NetLandedCost * checkForNull(CurrencyExchangeRate?.plantCurrencyRate)
        let NetLandedCostConversion = NetLandedCost * checkForNull(CurrencyExchangeRate?.settlementCurrencyRate)
        if (states.isImport) {
            setValue('NetLandedCost', checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostLocalConversion', checkForDecimalAndNull(NetLandedCostLocalConversion, getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostConversion', checkForDecimalAndNull(NetLandedCostConversion, getConfigurationKey().NoOfDecimalForPrice))
        } else {
            setValue('NetLandedCostLocalConversion', checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostConversion', checkForDecimalAndNull(NetLandedCostLocalConversion, getConfigurationKey().NoOfDecimalForPrice))
        }
        setValue('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, getConfigurationKey().NoOfDecimalForPrice))
        setValue('NetCostWithoutConditionCost', checkForDecimalAndNull(basicPriceBaseCurrency, getConfigurationKey().NoOfDecimalForPrice));
        if (isEditFlag) {
            if (checkForNull(NetLandedCost) === checkForNull(props?.DataToChange?.NetLandedCost)) {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetails, netCostChanged: false }, () => { }))
            } else {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetails, netCostChanged: true }, () => { }))
            }
        }
        let updatedState = {
            ...state, FinalCutOffBaseCurrency: getValues('cutOffPrice'),
            BasicRatePerUOM: getValues('BasicRate'),
            ForgingScrapCostUOMConverted: getValues("ForgingScrap"),
            FinalMachiningScrapCostBaseCurrency: getValues('MachiningScrap'),
            FinalCircleScrapCostBaseCurrency: getValues("CircleScrapCost"),
            JaliScrapCostUOMConverted: getValues('JaliScrapCost'),
            NetCostWithoutConditionCost: basicPriceBaseCurrency,
            NetLandedCost: NetLandedCost,
            conditionTableData: conditionList,
            ConversionRatio: getValues('ConversionRatio'),
            ScrapRatePerScrapUOM: getValues('ScrapRatePerScrapUOM'),
            totalBasicRate: getValues('BasicRate'),
            ...obj,
        }
        setState(updatedState)
        setTimeout(() => {
            dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: updatedState }, () => { }))
        }, 50);
    }

    /**
    * @method handleUOM     
    * @description called
    */
    const handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, UOM: newValue, isDropDownChanged: true, ScrapRateUOM: [] }))
            dispatch(SetCommodityIndexAverage('', 0, newValue?.label, 0, '', '', ''))

        } else {
            setState(prevState => ({ ...prevState, UOM: [] }))
        }
    }

    const onPressHasDifferentUOM = () => {
        // Create the updated state with all changes at once
        const updatedState = {
            ...state,
            IsApplyHasDifferentUOM: !state.IsApplyHasDifferentUOM
        };
        // Set state once with all updates
        setState(updatedState);
        // Update the raw material details
        dispatch(setRawMaterialDetails({
            ...rawMaterailDetails,
            states: updatedState
        }, () => { }));
    }
    const checkTechnology = () => {
        let obj = showRMScrapKeys(rawMaterailDetails?.Technology ? rawMaterailDetails?.Technology?.value : props?.DataToChange.TechnologyId)
        setShowScrapKeys(obj)
        setState(prevState => ({ ...prevState, showScrapKeys: obj }))
    }

    const labelForScrapRate = () => {
        let labelSelectedCurrency = labelWithUOMAndCurrency("Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
        let labelBaseCurrency = labelWithUOMAndCurrency("Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
        if (showScrapKeys?.showCircleJali) {
            labelSelectedCurrency = labelWithUOMAndCurrency("Jali Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
            labelBaseCurrency = labelWithUOMAndCurrency("Jali Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
        } else if (showScrapKeys?.showForging) {
            labelSelectedCurrency = labelWithUOMAndCurrency("Forging Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
            labelBaseCurrency = labelWithUOMAndCurrency("Forging Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
        } else if (showScrapKeys?.showScrap) {
            labelSelectedCurrency = labelWithUOMAndCurrency("Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
            labelBaseCurrency = labelWithUOMAndCurrency("Scrap Rate", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))
        }
        return { labelSelectedCurrency: labelSelectedCurrency, labelBaseCurrency: labelBaseCurrency }
    }

    /**
* @method handleChange
* @description Handle Effective Date
*/
    const handleEffectiveDateChange = (date) => {
        const { currency, effectiveDate } = state
        if (date !== effectiveDate) {
            if (currency?.label === getConfigurationKey().BaseCurrency) {
                setState(prevState => ({ ...prevState, currencyValue: 1, showCurrency: false, }))
            } else {
                const { costingTypeId } = states;
                const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? rawMaterailDetails?.Vendor?.value : EMPTY_GUID) : EMPTY_GUID
                const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

                if ((currency && currency?.length !== 0 && date)) {
                    if (IsFetchExchangeRateVendorWise() && !((rawMaterailDetails?.Vendor && rawMaterailDetails?.Vendor?.length !== 0) || (rawMaterailDetails?.customer && rawMaterailDetails?.customer?.length !== 0))) {
                        setState(prevState => ({ ...prevState, showWarning: true }));
                        return;
                    }
                    dispatch(getExchangeRateByCurrency(currency?.label, costingType, DayTime(date).format('YYYY-MM-DD'), vendorValue, rawMaterailDetails?.customer?.value, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                        if (Object.keys(res.data.Data).length === 0) {
                            setState(prevState => ({ ...prevState, showWarning: true }));
                        } else {
                            setState(prevState => ({ ...prevState, showWarning: false }));
                        }
                        let Data = res?.data?.Data
                        setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                        setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                        dispatch(setExchangeRateDetails({ ...exchangeRateDetails, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
                    }));
                }
                setState(prevState => ({ ...prevState, showCurrency: true }))
            }
            setTimeout(() => {
                setState(prevState => ({ ...prevState, isDateChange: true, effectiveDate: date }))
            }, 200);
        } else {
            setState(prevState => ({ ...prevState, isDateChange: false, effectiveDate: date }))
        }

    };

    const handleFrequencyChange = (selectedOption) => {
        if (selectedOption && selectedOption !== '') {
            setState(prevState => ({
                ...prevState,
                frequencyOfSettlement: selectedOption.label,
                toDate: '',
                fromDate: '',
                enableHalfMonthDays: selectedOption?.label === 'Half Month Avg'
            }));
            if (selectedOption?.label === 'As and When') {
                setState(prevState => ({ ...prevState, disableToDate: false }));
            } else {
                setState(prevState => ({ ...prevState, disableToDate: true }));
            }
            setValue('toDate', '');
            setValue('fromDate', '');
        } else {
            setState(prevState => ({ ...prevState, frequencyOfSettlement: [] }));
        }
    };

    const handleFromEffectiveDateChange = (date) => {
        const { frequencyOfSettlement } = state;
        let validToDate;

        switch (frequencyOfSettlement) {
            case 'Weekly':
                // Add 6 days for a week's duration since we start counting from the fromDate
                validToDate = addDays(date, 6);
                break;
            case 'Fortnightly':
                // Add 13 days for a fortnight's duration
                validToDate = addDays(date, 13);
                break;
            case 'Half Month Avg':
                if (getDate(date) === 1) {
                    validToDate = addDays(date, 14); // 15th of the month
                } else if (getDate(date) === 16) {
                    validToDate = endOfMonth(date); // Last day of the month
                } else {
                    validToDate = null; // Invalid selection, reset the date
                    setValue('fromDate', '');
                    setValue('toDate', '');
                    return;
                }
                break;
            case 'Monthly':
                if (getDate(date) === 1) {
                    validToDate = endOfMonth(date);
                } else {
                    // Correctly adding a month and subtracting a day for non-1st start dates
                    validToDate = subDays(addMonths(date, 1), 1);
                }
                break;
            case 'Quarterly':
                if (getDate(date) === 1 && [4, 7, 10, 1].includes(getMonth(date) + 1)) {
                    validToDate = endOfQuarter(date);
                } else {
                    validToDate = subDays(addQuarters(date, 1), 1);
                }
                break;
            case 'Half Yearly':
                validToDate = addMonths(date, 6);
                break;
            case 'Yearly':
                validToDate = addYears(date, 1);
                break;
            case 'As and When':
                validToDate = null; // Allow user to select any date
                break;
            default:
                validToDate = date;
                break;
        }

        setState(prevState => ({
            ...prevState,
            fromDate: date,
            toDate: validToDate,
            maxDate: validToDate,
        }));

        setValue('toDate', validToDate);
    };

    const handleToEffectiveDateChange = (date) => {
        setState(prevState => ({ ...prevState, toDate: date }));
    };
    const handleVendor = () => {
        const vendorValue = IsFetchExchangeRateVendorWise() ? ((states.costingTypeId === VBCTypeId || states.costingTypeId === ZBCTypeId) ? rawMaterailDetails?.Vendor?.value : EMPTY_GUID) : EMPTY_GUID
        const costingType = IsFetchExchangeRateVendorWise() ? ((states.costingTypeId === VBCTypeId || states.costingTypeId === ZBCTypeId) ? VBCTypeId : states.costingTypeId) : ZBCTypeId


        if (state.currency && state.currency.length !== 0 && state.effectiveDate) {
            if (IsFetchExchangeRateVendorWise() && !(rawMaterailDetails && rawMaterailDetails?.Vendor?.length !== 0)) {
                setState(prevState => ({ ...prevState, showWarning: true }));
                return;
            }
            dispatch(getExchangeRateByCurrency(state.currency?.label, costingType, DayTime(state.effectiveDate).format('YYYY-MM-DD'), vendorValue, rawMaterailDetails?.customer?.value, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                if (Object.keys(res.data.Data).length === 0) {
                    setState(prevState => ({ ...prevState, showWarning: true }))
                } else {
                    setState(prevState => ({ ...prevState, showWarning: false }))
                }
                let Data = res?.data?.Data
                setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                dispatch(setExchangeRateDetails({ ...exchangeRateDetails, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
            }));
        }
    }
    const handleCustomer = () => {
        const { currency, effectiveDate } = state
        const { costingTypeId } = states
        if (rawMaterailDetails && rawMaterailDetails?.customer?.length !== 0 && state.currency && state.currency.length !== 0 && state.effectiveDate) {
            dispatch(getExchangeRateByCurrency(currency?.label, (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? rawMaterailDetails?.Vendor?.value : EMPTY_GUID, rawMaterailDetails?.customer?.value, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                if (Object.keys(res.data.Data).length === 0) {
                    setState(prevState => ({ ...prevState, showWarning: true }))
                } else {
                    setState(prevState => ({ ...prevState, showWarning: false }))
                }
                let Data = res?.data?.Data
                setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                dispatch(setExchangeRateDetails({ ...exchangeRateDetails, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
            }));
        }
    }
    /**
     * @method handleSelectConversion
     * @description called
     */
    const handleSelectConversion = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, ScrapRateUOM: newValue, isDropDownChanged: true }))
        } else {
            setState(prevState => ({ ...prevState, ScrapRateUOM: [] }))
        }
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, ScrapRateUOM: newValue }, () => { }))
    }
    const otherCostToggle = () => {
        setState(prevState => ({ ...prevState, isOpenOtherCostDrawer: true }))
    }

    const closeOtherCostToggle = (type, data, total, totalBase) => {
        if (type === 'Save') {
            if (Number(states.costingTypeId) === Number(ZBCTypeId) && state.NetConditionCost) {
                Toaster.warning("Please click on refresh button to update condition cost data.")
            }
            const netCost = checkForNull(totalBase) + checkForNull(getValues('BasicRate'))
            const netCostLocalCurrency = convertIntoBase(netCost, CurrencyExchangeRate?.plantCurrencyRate)
            const netCostConversion = convertIntoBase(netCost, CurrencyExchangeRate?.settlementCurrencyRate)
            setState(prevState => ({ ...prevState, isOpenOtherCostDrawer: false, otherCostTableData: data, totalOtherCost: totalBase }))
            setValue('OtherCost', totalBase)
            if (states.isImport) {
                setValue('NetLandedCost', checkForDecimalAndNull(netCost, getConfigurationKey().NoOfDecimalForPrice))
                setValue('NetLandedCostPlantCurrency', checkForDecimalAndNull(netCostLocalCurrency, getConfigurationKey().NoOfDecimalForPrice))
                setValue('NetLandedCostConversion', checkForDecimalAndNull(netCostConversion, getConfigurationKey().NoOfDecimalForPrice))
            } else {
                setValue('NetLandedCostPlantCurrency', checkForDecimalAndNull(netCostLocalCurrency, getConfigurationKey().NoOfDecimalForPrice))
                setValue('NetLandedCostConversion', checkForDecimalAndNull(netCostConversion, getConfigurationKey().NoOfDecimalForPrice))
            }
            dispatch(setOtherCostDetails(data))
            setState(prevState => ({ ...prevState, NetLandedCostConversion: checkForNull(totalBase) + checkForNull(getValues('BasicRate')) }))
        } else {
            setState(prevState => ({ ...prevState, isOpenOtherCostDrawer: false }))
        }
    }

    const conditionToggle = () => {
        setState(prevState => ({ ...prevState, isOpenConditionDrawer: true }))
    }
    const openAndCloseAddConditionCosting = (type, data = state.conditionTableData) => {
        if (data && data.length > 0 && type === 'save') {
            dispatch(setRawMaterialDetails({ ...rawMaterailDetails, netCostChanged: true }, () => { }))
        }
        const sumBaseCurrency = data?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
        let netLandedCost = checkForNull(sumBaseCurrency) + checkForNull(state.NetCostWithoutConditionCost)  //Condition cost + Basic price
        let netConditionCost = checkForNull(sumBaseCurrency)
        setValue('FinalConditionCost', checkForDecimalAndNull(netConditionCost, getConfigurationKey().NoOfDecimalForPrice))
        if (states.isImport) {
            setValue('NetLandedCost', checkForDecimalAndNull(netLandedCost, getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostConversion', checkForDecimalAndNull(netLandedCost * checkForNull(CurrencyExchangeRate?.settlementCurrencyRate), getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostLocalConversion', checkForDecimalAndNull((netLandedCost * checkForNull(CurrencyExchangeRate?.plantCurrencyRate)), getConfigurationKey().NoOfDecimalForPrice))
        } else {
            setValue('NetLandedCostConversion', checkForDecimalAndNull(netLandedCost * checkForNull(CurrencyExchangeRate?.plantCurrencyRate), getConfigurationKey().NoOfDecimalForPrice))
            setValue('NetLandedCostLocalConversion', checkForDecimalAndNull((netLandedCost), getConfigurationKey().NoOfDecimalForPrice))
        }
        let updatedState = {
            ...state, isOpenConditionDrawer: false,
            conditionTableData: data,
            NetConditionCost: netConditionCost,
            NetLandedCost: netLandedCost
        }
        setState(updatedState)
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: updatedState, ConditionTableData: data }, () => { }))
    }
    /**
    * @method handleCurrency
    * @description called
    */
    const handleCurrency = (newValue) => {


        const { effectiveDate } = state
        if (newValue && newValue !== '') {
            if (newValue.label === getConfigurationKey().BaseCurrency) {
                setState(prevState => ({ ...prevState, currencyValue: 1, showCurrency: false, }))
                // Convert newValue.value to an integer before passing to dispatch
                const currencyId = parseInt(newValue.value, 10);

                dispatch(SetCommodityIndexAverage('', 0, '', currencyId, '', '', ''));

            } else {
                const { costingTypeId } = states;
                const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? rawMaterailDetails?.Vendor?.value : EMPTY_GUID) : EMPTY_GUID
                const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

                if (newValue && newValue.length !== 0 && effectiveDate) {
                    if (IsFetchExchangeRateVendorWise() &&
                        !((rawMaterailDetails?.Vendor && rawMaterailDetails?.Vendor?.label) ||
                            (rawMaterailDetails?.customer && rawMaterailDetails?.customer?.length !== 0))) {
                        setState(prevState => ({ ...prevState, showWarning: true }));

                        return;
                    }

                    dispatch(getExchangeRateByCurrency(newValue.label, costingType, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorValue, rawMaterailDetails?.customer?.value, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                        if (Object.keys(res.data.Data).length === 0) {
                            setState(prevState => ({ ...prevState, showWarning: true }));
                        } else {
                            setState(prevState => ({ ...prevState, showWarning: false }));
                        }
                        let Data = res?.data?.Data
                        setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                        setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                        dispatch(setExchangeRateDetails({ ...exchangeRateDetails, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
                    }));
                }

                setState(prevState => ({ ...prevState, showCurrency: true }))

            }
            setState(prevState => ({ ...prevState, currency: newValue }))
            // Convert newValue.value to an integer before passing to dispatch
            const currencyId = parseInt(newValue.value, 10);

            dispatch(SetCommodityIndexAverage('', 0, '', currencyId, '', '', ''));
        } else {
            setState(prevState => ({ ...prevState, currency: [] }))
        }
    };

    const handleScrapRateDomestic = (e) => {
        let obj = {}
        const scrapRate = e ? Number(e) : getValues('ScrapRatePerScrapUOM')
        let calculatedFactor = state.CalculatedFactor ? checkForNull(state.CalculatedFactor) : getValues('CalculatedFactor')
        const scrapRateTemp = scrapRate * calculatedFactor
        if (showScrapKeys?.showCircleJali) {
            obj.JaliScrapCostUOMConverted = scrapRateTemp
            setValue('JaliScrapCost', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
        } else if (showScrapKeys?.showForging) {
            obj.ForgingScrapCostUOMConverted = scrapRateTemp
            setValue('ForgingScrap', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
        } else if (showScrapKeys?.showScrap) {
            obj.ScrapRateUOMConverted = scrapRateTemp
            setValue('ScrapRate', checkForDecimalAndNull(scrapRateTemp, getConfigurationKey().NoOfDecimalForPrice));
        }
        let updatedState = {
            ...state,
            ...obj
        }
        setState(updatedState)
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: updatedState }, () => { }))

    }
    const handleFinancialDataChange = () => {
        if (isEditFlag) {
            let scrapRate = showScrapKeys?.showScrap ? getValues('ScrapRate') : showScrapKeys?.showForging ? getValues('ForgingScrap') : getValues('JaliScrapCost')
            let machiningScrap = getValues('MachiningScrap')
            let CircleScrap = getValues('CircleScrapCost')
            let cutOff = getValues('cutOffPrice')
            if (checkForNull(scrapRate) === checkForNull(props?.DataToChange?.ScrapRate) && checkForNull(cutOff) === checkForNull(props?.DataToChange?.CutOffPrice) && checkForNull(machiningScrap) === checkForNull(props?.DataToChange?.MachiningScrapRate) && checkForNull(CircleScrap) === checkForNull(props?.DataToChange?.JaliScrapCost)) {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetails, financialDataChanged: false }, () => { }))
            } else {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetails, financialDataChanged: true }, () => { }))
            }
        }
    }
    const handleConversionRatio = (e) => {
        const conversionRatio = Number(e)
        const calculatedFactor = 1 / conversionRatio
        setValue('CalculatedFactor', checkForDecimalAndNull(calculatedFactor, getConfigurationKey().NoOfDecimalForPrice))
        setState(prevState => ({ ...prevState, CalculatedFactor: calculatedFactor }))
    }
    const costToggle = () => {
        setState(prevState => ({ ...prevState, isCostOpen: !state.isCostOpen }));
    }
    const indexationToggle = () => {
        setState(prevState => ({ ...prevState, isIndexationOpen: !state.isIndexationOpen }));
    }
    const commodityToggle = () => {
        setState(prevState => ({ ...prevState, isCommodityOpen: !state.isCommodityOpen }))
    }
    const setTotalBasicRate = (totalBasicRate) => {
        setState(prevState => ({ ...prevState, totalBasicRate: totalBasicRate }))
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: state }, () => { }))
    }
    const isShowIndexCheckBox = () => {
        setState(prevState => ({ ...prevState, isShowIndexCheckBox: !state.isShowIndexCheckBox }))
        dispatch(setRawMaterialDetails({ ...rawMaterailDetails, isShowIndexCheckBox: !state.isShowIndexCheckBox }, () => { }))
    }
    const handleIndex = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, index: newValue }));
        } else {
            setState(prevState => ({ ...prevState, index: [] }));
        }
        dispatch(SetCommodityIndexAverage('', newValue?.value, '', 0, '', '', ''))
    };


    const filterDates = (date) => {
        if (state.enableHalfMonthDays) {
            const day = getDate(date);
            return day === 1 || day === 16;
        }
        return true;
    };

    const updateConditionCostValue = () => {
        let conditnCostTable = recalculateConditions('', state.NetCostWithoutConditionCost)
        let sum = conditnCostTable && conditnCostTable.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostConversion), 0);
        let updatedState = {
            ...state,
            NetConditionCost: sum,
        }
        setValue('FinalConditionCost', checkForDecimalAndNull(sum, getConfigurationKey().NoOfDecimalForPrice))
        setState(updatedState)
        setTimeout(() => {
            dispatch(setRawMaterialDetails({ ...rawMaterailDetails, states: updatedState }, () => { }))
        }, 50);
    }

    return (
        <Fragment>

            {state.isShowIndexCheckBox && <>
                {RMIndex && <Row className="mb-3 accordian-container">
                    <Col md="6" className='d-flex align-items-center'>
                        <HeaderTitle
                            title={'Indexation:'}
                            customClass={'Personal-Details'}
                        />
                    </Col>
                    <Col md="6">
                        <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={indexationToggle} type="button">{state.isIndexationOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                        </div>
                    </Col>
                    {
                        <div className={`accordian-content row mx-0 w-100 ${state.isIndexationOpen ? '' : 'd-none'}`} >
                            {RMIndex && <>
                                <Col className="col-md-15">
                                    <SearchableSelectHookForm
                                        name="Index"
                                        label="Index"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{ required: true }}
                                        placeholder={'Select'}
                                        options={renderListing("IndexExchangeName")}
                                        handleChange={handleIndex}
                                        disabled={disableAll || isEditFlag || isViewFlag}
                                        errors={errors.Index}
                                    />
                                </Col>
                                <Col className="col-md-15">
                                    <SearchableSelectHookForm
                                        name="Material"
                                        label="Material"
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        options={renderListing("material")}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        // defaultValue={state.rmName.length !== 0 ? state.rmName : ""}
                                        className="fullinput-icon"
                                        disabled={disableAll || isEditFlag || isViewFlag || RMIndex}
                                        errors={errors.Material}
                                        isClearable={true}
                                    />
                                </Col>
                                <Col className="col-md-15">
                                    <SearchableSelectHookForm
                                        label={`Frequency of settlement`}
                                        name={"frequencyOfSettlement"}
                                        errors={errors.frequencyOfSettlement}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                        }}
                                        placeholder={'Select'}
                                        options={renderListing("Frequency")}
                                        handleChange={handleFrequencyChange}
                                        disabled={disableAll || isEditFlag || isViewFlag}
                                    />

                                </Col>
                                <Col className="col-md-15">
                                    {state.frequencyOfSettlement === 'Half Month Avg' && <TooltipCustom customClass="mb-0 ml-1" id="fromDate" tooltipText={`In Half Month Avg only 1st and 16th of the month will be considered`} />}
                                    <div className="inputbox date-section">
                                        <DatePickerHookForm
                                            name={`fromDate`}
                                            label={'From Date'}
                                            handleChange={(date) => {
                                                handleFromEffectiveDateChange(date);
                                            }}
                                            rules={{ required: true }}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            showMonthDropdown
                                            showYearDropdown
                                            // maxDate={state.maxDate}

                                            dateFormat="DD/MM/YYYY"
                                            placeholder="Select date"
                                            customClassName="withBorder"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                            disabled={disableAll || isEditFlag || isViewFlag}
                                            mandatory={true}
                                            errors={errors && errors.fromDate}
                                            filterDate={filterDates}
                                        />
                                    </div>
                                </Col>
                                <Col className="col-md-15">
                                    <div className="inputbox h-auto date-section">
                                        <DatePickerHookForm
                                            name={`toDate`}
                                            label={'To Date'}
                                            handleChange={(date) => {
                                                handleToEffectiveDateChange(date);
                                            }}
                                            rules={{ required: false }}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            showMonthDropdown
                                            showYearDropdown
                                            dateFormat="DD/MM/YYYY"
                                            placeholder={!state.disableToDate ? "Select date" : ''}
                                            customClassName="withBorder"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                            disabled={disableAll || state.disableToDate}
                                            mandatory={false}
                                            errors={errors && errors.toDate}
                                        />
                                    </div>
                                </Col></>}
                        </div>
                    }
                </Row >}
                {RMIndex && <Row className="mb-3 accordian-container">
                    <Col md="6" className='d-flex align-items-center'>
                        <HeaderTitle
                            title={'Commodity Details:'}
                            customClass={'Personal-Details'}
                        />
                    </Col>
                    <Col md="6">
                        <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={commodityToggle} type="button">{state.isCommodityOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                        </div>
                    </Col>
                    <AddIndexationMaterialListing
                        states={state}
                        isOpen={state.isCommodityOpen}
                        commodityDetails={props.commodityDetails}
                        isViewFlag={isViewFlag}
                        setTotalBasicRate={setTotalBasicRate}
                        disableAll={disableAll}
                    />
                </Row>}
            </>
            }
            <Row className="mb-3 accordian-container">
                <Col md="6" className='d-flex align-items-center'>
                    <HeaderTitle
                        title={'Cost:'}
                        customClass={'Personal-Details'}
                    />
                </Col>
                <Col md="6">
                    <div className={'right-details text-right'}>
                        <button className="btn btn-small-primary-circle ml-1" onClick={costToggle} type="button">{state.isCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                    </div>
                </Col>
                {
                    <div className={`accordian-content row mx-0 w-100 ${state.isCostOpen ? '' : 'd-none'}`} >
                        <Col className="col-md-15">
                            <SearchableSelectHookForm
                                name="UnitOfMeasurement"
                                label="UOM"
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                register={register}
                                options={renderListing("uom")}
                                rules={{ required: true }}
                                defaultValue={state.UOM}
                                mandatory={state.isShowIndexCheckBox === true ? false : true}
                                handleChange={handleUOM}
                                customClassName="withBorder"
                                disabled={disableAll || state.isShowIndexCheckBox ? true : isEditFlag || isViewFlag}
                                errors={errors.UnitOfMeasurement}
                            />
                        </Col>

                        {states.isImport && <Col className="col-md-15">
                            <SearchableSelectHookForm
                                name="currency"
                                label="Currency"
                                errors={errors.currency}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                    required: true,
                                }}
                                placeholder={'Select'}
                                options={renderListing("currency")}
                                handleChange={handleCurrency}
                                disabled={disableAll || isEditFlag || isViewFlag}
                            />
                        </Col>}
                        <Col className="col-md-15">
                            <TextFieldHookForm
                                name="plantCurrency"
                                label="Plant Currency"
                                placeholder={'-'}
                                defaultValue={''}
                                Controller={Controller}
                                control={control}
                                register={register}
                                rules={{
                                    required: false,
                                }}
                                mandatory={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                                handleChange={() => { }}
                                errors={errors.plantCurrency}
                            />
                        </Col>
                        <Col className="col-md-15">
                            <div className="inputbox date-section mb-5">
                                <DatePickerHookForm
                                    name={`effectiveDate`}
                                    label={'Effective Date'}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    selected={state.effectiveDate !== "" ? DayTime(state.effectiveDate).format('DD/MM/YYYY') : ""}
                                    handleChange={handleEffectiveDateChange}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    dropdownMode="select"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={disableAll || isViewFlag}
                                    mandatory={true}
                                    errors={errors && errors.effectiveDate}
                                    minDate={state.isShowIndexCheckBox ? addDays(new Date(state.toDate), 1) : isEditFlag ? state.minDate : subDays(new Date(), effectiveDateRangeDays)}
                                />
                            </div>
                        </Col>

                        <>
                            <Col className="col-md-15">
                                {/* {states.isImport && <TooltipCustom disabledIcon={true} id="rm-cut-off-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextCutOffBaseCurrency} />} */}
                                <TextFieldHookForm
                                    label={labelWithUOMAndCurrency("Cut Off Price ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                    name={"cutOffPrice"}
                                    placeholder={(props.isViewFlag || !state.IsFinancialDataChanged) ? '-' : "Enter"}
                                    id="rm-cut-off-base-currency"
                                    defaultValue={state.cutOffPrice}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    rules={{
                                        required: false,
                                        validate: states.isImport ? {} : { number, decimalNumberLimit3 },
                                    }}
                                    mandatory={false}
                                    className=" "
                                    customClassName=" withBorder"
                                    disabled={disableAll || isViewFlag || (isEditFlag && isRMAssociated)}
                                    handleChange={() => { }}
                                    errors={errors.cutOffPrice}
                                />
                            </Col>

                            <>

                                <Col className="col-md-15">
                                    {states.isImport && <TooltipCustom disabledIcon={true} id="rm-basic-rate-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextBasicRateBaseCurrency} />}
                                    <TextFieldHookForm
                                        label={labelWithUOMAndCurrency("Basic Rate ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                        name={"BasicRate"}
                                        placeholder={props.isEditFlag || (props.isEditFlag && props.isRMAssociated) ? '-' : "Enter"}
                                        defaultValue={state.cutOffPrice}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id="rm-basic-rate-base-currency"
                                        rules={{
                                            required: true,
                                            validate: { positiveAndDecimalNumber, maxLength10, decimalLengthsix, number },
                                        }}
                                        mandatory={state.isShowIndexCheckBox ? false : true}
                                        disabled={disableAll || state.isShowIndexCheckBox ? true : isViewFlag || (isEditFlag && isRMAssociated)}
                                        className=" "
                                        customClassName=" withBorder"
                                        handleChange={() => { }}
                                        errors={errors.BasicRate}
                                    />
                                </Col></>


                            <Col className="col-md-15">
                                <div className="mt-3">
                                    <span className="d-inline-block mt15">
                                        <label
                                            className={`custom-checkbox mb-0`}
                                            onChange={onPressHasDifferentUOM}
                                        >
                                            Has Different Scrap UOM ?
                                            <input
                                                type="checkbox"
                                                checked={state.IsApplyHasDifferentUOM}
                                                disabled={disableAll || (isViewFlag || (isEditFlag && isRMAssociated)) ? true : false}
                                            />
                                            <span
                                                className=" before-box"
                                                checked={state.IsApplyHasDifferentUOM}
                                                onChange={onPressHasDifferentUOM}
                                            />
                                        </label>
                                    </span>
                                </div>
                            </Col>
                            {state.IsApplyHasDifferentUOM && !isRMAssociated &&
                                <Col className="col-md-15">
                                    <SearchableSelectHookForm
                                        label="Scrap Rate UOM"
                                        name="ScrapRateUOM"
                                        // defaultValue={state.ScrapRateUOM.length !== 0 ? state.ScrapRateUOM : ""}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        placeholder={"Select"}
                                        options={renderListing("uom", true)}
                                        rules={{ required: true }}
                                        mandatory={true}
                                        handleChange={handleSelectConversion}
                                        disabled={disableAll || isViewFlag || (isEditFlag && isRMAssociated)}
                                        errors={errors.ScrapRateUOM}
                                    />
                                </Col>}
                            {state.IsApplyHasDifferentUOM && state.ScrapRateUOM?.value && <>
                                <Col className="col-md-15">
                                    <TextFieldHookForm
                                        label={labelWithUOMAndUOM("Conversion Ratio", state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM', state.UOM?.label ? state.UOM?.label : 'UOM')}
                                        name={"ConversionRatio"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: true,
                                            validate: { positiveAndDecimalNumber, decimalLengthsix, number },
                                        }}
                                        mandatory={true}
                                        placeholder={props.isViewFlag ? '-' : "Enter"}
                                        className=""
                                        maxLength="15"
                                        customClassName=" withBorder"
                                        handleChange={(e) => { handleConversionRatio(e.target.value) }}
                                        disabled={disableAll || isViewFlag || (isEditFlag && isRMAssociated)}
                                        errors={errors.ConversionRatio}
                                    />
                                </Col>
                                <Col className="col-md-15">
                                    <TooltipCustom disabledIcon={true} id="conversion-factor-base-currency" width={'380px'} tooltipText={allFieldsInfoIcon()?.toolTipTextCalculatedFactor} />
                                    <TextFieldHookForm
                                        label={labelWithUOMAndUOM("Calculated Factor", state.UOM?.label ? state.UOM?.label : 'UOM', state.ScrapRateUOM?.label ? state.ScrapRateUOM?.label : 'UOM')}
                                        name={"CalculatedFactor"}
                                        id="conversion-factor-base-currency"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        placeholder={props.isViewFlag ? '-' : "Enter"}
                                        className=""
                                        maxLength="15"
                                        customClassName=" withBorder"
                                        handleChange={() => { }}
                                        disabled={disableAll || true}
                                    />
                                </Col>

                                <Col className="col-md-15">
                                    <TooltipCustom disabledIcon={true} id="scrap-rate-per-scrap-uom-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextScrapRatePerScrapUOMBaseCurrency} />
                                    <TextFieldHookForm
                                        label={labelForScrapRate()?.labelBaseCurrency}
                                        name={'ScrapRatePerScrapUOM'}
                                        id="scrap-rate-per-scrap-uom-base-currency"
                                        placeholder={isViewFlag ? '-' : "Enter"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: true,
                                            validate: { positiveAndDecimalNumber, decimalLengthsix, number },
                                        }}
                                        mandatory={true}
                                        className=""
                                        customClassName=" withBorder"
                                        handleChange={(e) => { handleScrapRateDomestic(e.target.value) }}
                                        disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                    />
                                </Col></>}

                            {showScrapKeys?.showScrap &&
                                <>

                                    <Col className="col-md-15">
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="scrap-rate-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextScrapCostPerOldUOM} />}
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Scrap Rate ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                            name={"ScrapRate"}
                                            id="scrap-rate-base-currency"
                                            placeholder={props.isViewFlag ? '-' : "Enter"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: true,
                                                validate: { positiveAndDecimalNumber, decimalLengthsix, number },
                                            }}
                                            mandatory={true}
                                            className=""
                                            maxLength="15"
                                            customClassName=" withBorder"
                                            handleChange={() => { }}
                                            disabled={isViewFlag || state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                            errors={errors.ScrapRate}
                                        />
                                    </Col></>}
                            {showScrapKeys?.showForging &&
                                <>
                                    <Col className="col-md-15">
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="forging-scrap-cost-base-currency" width={'450px'} tooltipText={allFieldsInfoIcon()?.toolTipTextForgingScrapCostBaseCurrency} />}
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Forging Scrap Rate", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                            name={"ForgingScrap"}
                                            id="forging-scrap-cost-base-currency"
                                            placeholder={props.isViewFlag ? '-' : "Enter"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: true,
                                                validate: { positiveAndDecimalNumber, maxLength15, decimalLengthsix, number },
                                            }}
                                            mandatory={true}
                                            className=""
                                            customClassName=" withBorder"
                                            maxLength="15"
                                            handleChange={() => { }}
                                            disabled={isViewFlag || state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                            errors={errors.ForgingScrap}
                                        />
                                    </Col>

                                    <Col className="col-md-15">
                                        {states.isImport && <TooltipCustom disabledIcon={true} id="rm-machining-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextMachiningScrapCostBaseCurrency} />}
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Machining Scrap Rate ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                            name={"MachiningScrap"}
                                            placeholder={props.isViewFlag ? '-' : "Enter"}
                                            id="rm-machining-base-currency"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { positiveAndDecimalNumber, maxLength15, decimalLengthsix, number },
                                            }}
                                            className=""
                                            customClassName=" withBorder"
                                            maxLength="15"
                                            handleChange={() => { }}
                                            disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                            errors={errors.MachiningScrap}
                                        />
                                    </Col>
                                </>
                            }

                            {showScrapKeys?.showCircleJali &&
                                <>
                                    <Col className="col-md-15">
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="jali-scrap-cost-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextJaliScrapCostBaseCurrencyPerOldUOM} />}
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Jali Scrap Rate ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                            name={"JaliScrapCost"}
                                            id="jali-scrap-cost-base-currency"
                                            placeholder={isViewFlag ? '-' : "Enter"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: true,
                                                validate: { positiveAndDecimalNumber, maxLength15, decimalLengthsix, number },
                                            }}
                                            disabled={isViewFlag || state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                            className=" "
                                            handleChange={() => { }}
                                            customClassName=" withBorder"
                                            errors={errors.JaliScrapCost}
                                            mandatory={true}
                                        />
                                    </Col>

                                    <Col className="col-md-15">
                                        {states.isImport && <TooltipCustom disabledIcon={true} id="rm-circle-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon()?.toolTipTextCircleScrapCostBaseCurrency} />}
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Circle Scrap Rate ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, (states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency')))}
                                            name={"CircleScrapCost"}
                                            placeholder={props.isViewFlag ? '-' : "Enter"}
                                            id="rm-circle-base-currency"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { positiveAndDecimalNumber, maxLength15, decimalLengthsix, number },
                                            }}
                                            disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                            className=" "
                                            customClassName=" withBorder"
                                            handleChange={() => { }}
                                            errors={errors.CircleScrapCost}
                                        />
                                    </Col>
                                </>
                            }

                            <Col className="col-md-15">
                                <div className='d-flex align-items-center'>
                                    <div className='w-100'>
                                        <TextFieldHookForm
                                            label={labelWithUOMAndCurrency("Other Cost ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                            name={"OtherCost"}
                                            placeholder={"-"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            disabled={true}
                                            className=" "
                                            handleChange={() => { }}
                                            customClassName=" withBorder"
                                        />
                                    </div>
                                    {<Button
                                        id="addRMDomestic_conditionToggle"
                                        onClick={otherCostToggle}
                                        className={"right mt-3 mb-2"}
                                        variant={isViewFlag ? "view-icon-primary" : "plus-icon-square"}
                                        title={isViewFlag ? "View" : "Add"}
                                        disabled={!getValues('BasicRate')}
                                    />}
                                </div>
                            </Col>
                            {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && states.costingTypeId === ZBCTypeId && <>

                                <Col className="col-md-15">
                                    <TooltipCustom disabledIcon={true} width={"350px"} id="rm-basic-price" tooltipText={basicPriceTitle()?.toolTipTextBasicPriceBaseCurrency} />
                                    <TextFieldHookForm
                                        label={labelWithUOMAndCurrency("Basic Price ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                        name={"NetCostWithoutConditionCost"}
                                        id="rm-basic-price"
                                        placeholder={isViewFlag ? '-' : "Enter"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        disabled={true}
                                        className=" "
                                        handleChange={() => { }}
                                        customClassName=" withBorder"
                                    />
                                </Col>

                                <Col className="col-md-15">
                                    <div className='d-flex align-items-center'>
                                        <div className='w-100'>
                                            <TextFieldHookForm
                                                label={labelWithUOMAndCurrency("Condition Cost ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                                name={"FinalConditionCost"}
                                                placeholder={"-"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                disabled={disableAll || true}
                                                isViewFlag={true}
                                                className=" "
                                                handleChange={() => { }}
                                                customClassName=" withBorder"
                                            />
                                        </div>
                                        <div className="d-flex align-items-center mt-1">
                                            <button type="button" id="condition-cost-refresh" className={'refresh-icon mt-1 ml-1'} onClick={() => updateConditionCostValue()} disabled={isViewFlag}>
                                                <TooltipCustom disabledIcon={true} id="condition-cost-refresh" tooltipText="Refresh to update Condition cost" />
                                            </button>
                                            <Button
                                                id="addRMDomestic_conditionToggle"
                                                onClick={conditionToggle}
                                                className={"right ml-1"}
                                                variant={isViewFlag ? "view-icon-primary" : "plus-icon-square"}
                                                title={isViewFlag ? "View" : "Add"}
                                            />
                                        </div>

                                    </div>
                                </Col>

                            </>}

                            {states.isImport && <Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} id="bop-net-cost-currency" tooltipText={netCostTitle()?.toolTipTextNetCostBaseCurrency} />
                                <TextFieldHookForm
                                    label={labelWithUOMAndCurrency("Net Cost ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                    name={'NetLandedCost'}
                                    id="bop-net-cost-currency"
                                    placeholder={"-"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    disabled={disableAll || true}
                                    className=" "
                                    handleChange={() => { }}
                                    customClassName=" withBorder"
                                />
                            </Col>}
                            <Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} id="rm-net-cost-currency" tooltipText={netCostTitle()?.toolTipTextNetCostSelectedCurrency} />
                                <TextFieldHookForm
                                    label={`Net Cost (${!getValues('plantCurrency') ? 'Plant Currency' : getValues('plantCurrency')})`}
                                    name={'NetLandedCostLocalConversion'}
                                    id="rm-net-cost-currency"
                                    placeholder={"-"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    disabled={disableAll || true}
                                    className=" "
                                    handleChange={() => { }}
                                    customClassName=" withBorder"
                                />
                            </Col>
                            <Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} id="bop-net-cost-currency" tooltipText={netCostTitle()?.toolTipTextNetCostBaseCurrency} />
                                <TextFieldHookForm
                                    label={labelWithUOMAndCurrency("Net Cost ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, (reactLocalStorage.getObject("baseCurrency")))}
                                    name={'NetLandedCostConversion'}
                                    id="bop-net-cost-currency"
                                    placeholder={"-"}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    disabled={disableAll || true}
                                    className=" "
                                    handleChange={() => { }}
                                    customClassName=" withBorder"
                                />
                            </Col>

                        </>

                    </div>
                }
            </Row >
            {
                getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && state.isOpenConditionDrawer &&
                <AddConditionCosting
                    isOpen={state.isOpenConditionDrawer}
                    tableData={state.conditionTableData}
                    closeDrawer={openAndCloseAddConditionCosting}
                    anchor={'right'}
                    basicRateCurrency={state.NetCostWithoutConditionCost}
                    basicRateBase={state.NetCostWithoutConditionCost}
                    ViewMode={((state.isEditFlag && state.isRMAssociated) || isViewFlag)}
                    isFromMaster={true}
                    isFromImport={states.isImport}
                    EntryType={checkForNull(ENTRY_TYPE_DOMESTIC)}
                    currency={state.currency}
                    currencyValue={state.currencyValue}
                    PlantCurrency={getValues('plantCurrency')}
                />
            }
            {
                state.isOpenOtherCostDrawer &&
                <AddOtherCostDrawer
                    isOpen={state.isOpenOtherCostDrawer}
                    rmTableData={state.otherCostTableData}
                    closeDrawer={closeOtherCostToggle}
                    anchor={'right'}
                    rawMaterial={true}
                    rmBasicRate={state.totalBasicRate}
                    ViewMode={isViewFlag}
                    uom={state.UOM}
                    isImport={states.isImport}
                    plantCurrency={getValues('plantCurrency')}
                    settlementCurrency={state.currency.label}
                />
            }

        </Fragment >
    )
}
export default AddRMFinancialDetails

