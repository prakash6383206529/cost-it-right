import React, { Fragment, useEffect, useRef, useState } from "react"
import { fetchSpecificationDataAPI, getCurrencySelectList, getPlantSelectListByType, getUOMSelectList, getVendorNameByVendorSelectList, getFrequencySettlement, getExchangeRateSource } from "../../../actions/Common"
import { CBCTypeId, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, INR, RAWMATERIAL, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, effectiveDateRangeDays, searchCount } from "../../../config/constants"
import { useDispatch, useSelector } from "react-redux"
import { getCostingSpecificTechnology, getExchangeRateByCurrency } from "../../costing/actions/Costing"
import { IsFetchExchangeRateVendorWiseForParts, IsFetchExchangeRateVendorWiseForZBCRawMaterial, IsShowFreightAndShearingCostFields, getConfigurationKey, getExchangeRateParams, labelWithUOMAndCurrency, labelWithUOMAndUOM, loggedInUserId, showRMScrapKeys } from "../../../helper"
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
import WarningMessage from "../../common/WarningMessage"
import { getEffectiveDateMinDate, recalculateConditions, updateCostValue } from "../../common/CommonFunctions"
function AddRMFinancialDetails(props) {
    const { Controller, control, register, setValue, getValues, errors, reset, useWatch, states, data, isRMAssociated, disableAll } = props
    const { isEditFlag, isViewFlag } = data

    const rawMaterailDetails = useSelector((state) => state.material.rawMaterailDetails)
    const exchangeRateDetails = useSelector((state) => state.material.exchangeRateDetails)

    const initialState = {
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
        hidePlantCurrency: false,
        showPlantWarning: false
    }
    const [state, setState] = useState(initialState);
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
    const exchangeRateDetailsRef = useRef(exchangeRateDetails);
    const rawMaterailDetailsRefFinancial = useRef(rawMaterailDetails)

    useEffect(() => {
        exchangeRateDetailsRef.current = exchangeRateDetails;
    }, [exchangeRateDetails]);

    useEffect(() => {
        rawMaterailDetailsRefFinancial.current = rawMaterailDetails;
    }, [rawMaterailDetails]);
    const values = useWatch({
        control,
        name: ['BasicRate']
    })

    const domesticFinancialFields = useWatch({
        control,
        name: ['JaliScrapCost', 'ForgingScrapBaseCurrency', 'ScrapRate', 'cutOffPriceBaseCurrency', 'CircleScrapCostBaseCurrency', 'MachiningScrapBaseCurrency']
    })

    useEffect(() => {
        if (!isViewFlag) {
            calculateNetCostDomestic();
        }
    }, [values])
    useEffect(() => {
        if (isEditFlag) {
            handleFinancialDataChange()
        }
    }, [domesticFinancialFields])
    useEffect(() => {
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, ShowScrapKeys: showScrapKeys }, () => { }))
    }, [showScrapKeys])
    useEffect(() => {
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, CurrencyValue: state.currencyValue }, () => { }))
    }, [state.currencyValue])
    useEffect(() => {
        dispatch(getUOMSelectList(() => { }))
        allFieldsInfoIcon(true)

    }, [])
    useEffect(() => {
        const plantValue = getValues('Plants');
        if (plantValue && (plantValue?.value || plantValue[0]?.value)) {
            let plantId = plantValue?.value ? plantValue?.value : plantValue[0]?.value
            dispatch(getPlantUnitAPI(plantId, (res) => {
                let Data = res?.data?.Data
                let CurrencyId = Data?.CurrencyId
                let Currency = Data?.Currency
                setValue('plantCurrency', Data?.Currency)
                if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
                    setState(prevState => ({ ...prevState, hidePlantCurrency: false }));
                } else {
                    setState(prevState => ({ ...prevState, hidePlantCurrency: true, showPlantWarning: false }));
                }
                const { costingTypeId } = states;
                let fromCurrency = states.isImport ? state.currency?.label : Data?.Currency
                let toCurrency = !states.isImport ? reactLocalStorage.getObject("baseCurrency") : Data?.Currency
                if (!isViewFlag && getValues('effectiveDate') && fromCurrency !== undefined /* && Data?.Currency !== INR && Data?.Currency !== reactLocalStorage?.getObject("baseCurrency") */) {
                    if ((IsFetchExchangeRateVendorWiseForZBCRawMaterial() || IsFetchExchangeRateVendorWiseForParts()) && (!rawMaterailDetails?.Vendor && !getValues('clientName'))) {
                        return false;
                    }

                    if ((IsFetchExchangeRateVendorWiseForZBCRawMaterial() || IsFetchExchangeRateVendorWiseForParts())&&rawMaterailDetails?.Vendor?.value) {
                    const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: rawMaterailDetails?.Vendor?.value, clientValue: rawMaterailDetailsRefFinancial.current?.customer?.value, master: RAWMATERIAL, plantCurrency: getValues("plantCurrency") });
                        dispatch(getExchangeRateByCurrency(fromCurrency, costingHeadTypeId, DayTime(getValues('effectiveDate')).format('YYYY-MM-DD'), vendorId, clientId, false, toCurrency, getValues('ExchangeSource')?.label ?? null, res => {
                        if (Object.keys(res.data.Data).length === 0) {
                            setState(prevState => ({ ...prevState, showPlantWarning: true }));
                        } else {
                            setState(prevState => ({ ...prevState, showPlantWarning: false }));
                        }
                        let Data = res?.data?.Data
                        setCurrencyExchangeRate(prevState => ({ ...prevState, plantCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }))
                        dispatch(setExchangeRateDetails({ ...exchangeRateDetailsRef.current, LocalCurrencyExchangeRate: checkForNull(Data?.CurrencyExchangeRate), LocalExchangeRateId: Data?.ExchangeRateId, LocalCurrency: Currency, LocalCurrencyId: CurrencyId, }, () => { }))
                    }));
                }
                }
            }));
        }
    }, [getValues('Plants'), getValues('ExchangeSource'), state.effectiveDate, getValues('effectiveDate'), rawMaterailDetails?.Vendor, getValues('clientName'), state.currency]);
    useEffect(() => {
        dispatch(getFrequencySettlement(() => { }))
        dispatch(getCurrencySelectList(() => { }))
        dispatch(getIndexSelectList((res) => { }));
    }, [])
    useEffect(() => {
        if (rawMaterailDetailsRefFinancial.current && rawMaterailDetailsRefFinancial.current?.Technology && Object.keys(rawMaterailDetailsRefFinancial.current?.Technology).length > 0) {
            checkTechnology()
        }
    }, [rawMaterailDetailsRefFinancial.current?.Technology])
    useEffect(() => {
        setState(prevState => ({ ...prevState, isShowIndexCheckBox: rawMaterailDetailsRefFinancial.current?.isShowIndexCheckBox }))
    }, [rawMaterailDetailsRefFinancial.current?.isShowIndexCheckBox])
    useEffect(() => {
        handleVendor()
    }, [rawMaterailDetails?.Vendor])
    useEffect(() => {
        handleCustomer()
    }, [rawMaterailDetails?.customer])

    useEffect(() => {
        if (!isViewFlag) {
            calculateNetCostDomestic()
        }
    }, [values, state.totalOtherCost, CurrencyExchangeRate])
    useEffect(() => {
        if (props?.DataToChange && Object.keys(props?.DataToChange).length > 0) {
            let Data = props?.DataToChange
            setValue('UnitOfMeasurement', { label: Data?.UnitOfMeasurementName, value: Data?.UOM })
            setValue('cutOffPrice', checkForDecimalAndNull(Data?.CutOffPrice, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('BasicRate', checkForDecimalAndNull(Data?.BasicRatePerUOM, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('ScrapRatePerScrapUOM', checkForDecimalAndNull(Data?.ScrapRatePerScrapUOM, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('ScrapRate', checkForDecimalAndNull(Data?.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('ConversionRatio', checkForDecimalAndNull(Data?.UOMToScrapUOMRatio, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('UOMToScrapUOMRatio', checkForDecimalAndNull(Data?.UOMToScrapUOMRatio, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('BasicPriceSelectedCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('NetCostWithoutConditionCost', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('NetLandedCost', checkForDecimalAndNull(Data?.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('NetLandedCostConversion', states.isImport ? checkForDecimalAndNull(Data?.NetLandedCostConversion, getConfigurationKey()?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetLandedCostConversion, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('NetLandedCostLocalConversion', states.isImport ? checkForDecimalAndNull(Data?.NetLandedCostLocalConversion, getConfigurationKey()?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetLandedCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('FinalConditionCostBaseCurrency', states.isImport ? checkForDecimalAndNull(Data?.NetConditionCostConversion, getConfigurationKey()?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetConditionCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('ScrapRateUOM', { label: Data?.ScrapUnitOfMeasurement, value: Data?.ScrapUnitOfMeasurementId })
            setValue('CalculatedFactor', Data?.CalculatedFactor)
            setValue('effectiveDate', Data?.EffectiveDate ? DayTime(Data?.EffectiveDate).$d : '')
            setValue('CircleScrapCost', checkForDecimalAndNull(Data?.JaliScrapCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('currency', { label: Data?.Currency, value: Data?.CurrencyId })
            setValue('MachiningScrap', checkForDecimalAndNull(Data?.MachiningScrapRate, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('JaliScrapCost', checkForDecimalAndNull(Data?.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('ForgingScrap', checkForDecimalAndNull(Data?.ScrapRate, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('frequencyOfSettlement', { label: Data?.FrequencyOfSettlement, value: Data?.FrequencyOfSettlementId })
            setValue('fromDate', DayTime(Data?.FromDate).$d)
            setValue('toDate', DayTime(Data?.ToDate).$d)
            setValue('OtherCost', checkForDecimalAndNull(Data?.OtherNetCost, getConfigurationKey()?.NoOfDecimalForPrice))
            setValue('Index', { label: Data?.IndexExchangeName, value: Data?.IndexExchangeId })
            setValue('plantCurrency', Data?.LocalCurrency)
            setValue('FinalConditionCost', checkForDecimalAndNull(Data?.NetConditionCost, getConfigurationKey()?.NoOfDecimalForPrice))
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
                hidePlantCurrency: Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency") ? false : true
            }
            setState(updatedState)
            let obj = showRMScrapKeys(Data?.TechnologyId)
            setShowScrapKeys(obj)
            setCurrencyExchangeRate(prevState => ({
                ...prevState, plantCurrencyRate: !states.isImport ? (Data?.CurrencyExchangeRate ?? 1) : checkForNull(Data?.LocalCurrencyExchangeRate ?? 1),
                settlementCurrencyRate: states.isImport ? checkForNull(Data?.CurrencyExchangeRate ?? 1) : null
            }))
            setState(updatedState)
            dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, states: updatedState, isShowIndexCheckBox: Data?.IsIndexationDetails, ShowScrapKeys: obj }, () => { }))
            dispatch(setExchangeRateDetails({
                ...exchangeRateDetailsRef.current, LocalCurrencyExchangeRate: !states.isImport ? (Data?.CurrencyExchangeRate ?? 1) : (Data?.LocalCurrencyExchangeRate ?? 1), LocalExchangeRateId: !states.isImport ? Data?.ExchangeRateId : Data?.LocalExchangeRateId, LocalCurrencyId: !states.isImport ? Data?.CurrencyId : Data?.LocalCurrencyId,
                CurrencyExchangeRate: state?.isImport ? (Data?.CurrencyExchangeRate ?? 1) : null, ExchangeRateId: state?.isImport ? Data?.ExchangeRateId : null
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
        const isBasicRateVisible = getConfigurationKey().IsBasicRateAndCostingConditionVisible &&
            Number(states.costingTypeId) === Number(ZBCTypeId);
        const netCostText = isBasicRateVisible ? `Basic Price + Condition Cost` : `Basic Rate + Other Cost`;
        const netCostlabel = states.isImport ? `Net Cost (${state?.currency?.label ?? 'Currency'}/${state.UOM?.label === undefined ? 'UOM' : state.UOM?.label})` : `Net Cost (${!getValues('plantCurrency') ? 'Plant Currency' : getValues('plantCurrency')})`
        return {
            toolTipTextNetCostSelectedCurrency: netCostText,
            tooltipTextPlantCurrency: state.hidePlantCurrency
                ? netCostText
                : `${netCostlabel} * Plant Currency Rate (${CurrencyExchangeRate?.plantCurrencyRate ?? ''})`,
            toolTipTextNetCostBaseCurrency: `${netCostlabel} * Currency Rate (${getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency") ? CurrencyExchangeRate?.settlementCurrencyRate ?? '' : CurrencyExchangeRate?.plantCurrencyRate ?? ''})`,
        };
    };


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

    const handleApplicability = (value, basicPriceBaseCurrency, arr, costField, headerName) => {
        if (!value) return 0;

        const selectedApplicabilities = value?.split(' + ');

        // Calculate total cost currency for selected applicabilities
        const total = selectedApplicabilities.reduce((acc, applicability) => {
            const trimmedApplicability = applicability.trim();

            // If applicability is "Basic Rate", return basic price
            if (trimmedApplicability === "Basic Rate") {
                // Convert to number
                return Number(acc) + Number(basicPriceBaseCurrency);
            }

            // Find matching cost item
            const item = arr?.find(item => item?.[headerName]?.trim() === trimmedApplicability);
            if (item) {
                // Convert both acc and cost to numbers before adding
                return Number(acc) + Number(item?.[costField] || 0);
            }

            return Number(acc);
        }, 0);

        return total;
    }
    // const recalculateConditions = (basicPriceBaseCurrency) => {
    //     return recalculateCosts(
    //         false,
    //         basicPriceBaseCurrency,
    //         "ConditionType",
    //         "Applicability",
    //         "Percentage",
    //         {
    //             mainCost: "ConditionCost",
    //             conversionCost: "ConditionCostConversion",
    //             perQuantityCost: "ConditionCostPerQuantity",
    //         },
    //         'Description'
    //     );
    // };
    // const recalculateOtherCost = (basicRate) => {
    //     return recalculateCosts(
    //         true,
    //         basicRate,
    //         "Type",
    //         "Applicability",
    //         "Value",
    //         {
    //             mainCost: "NetCost",
    //             conversionCost: "NetCostConversion",
    //             perQuantityCost: "NetCostConversion",
    //         },
    //         'CostHeaderName'
    //     );
    // };
    // const recalculateCosts = (isOtherCost, basicValue, typeField, applicabilityField, percentageField, resultFields,headerName) => {
    //     // Select the correct data array and make a deep copy
    //     const dataArray = isOtherCost ? state.otherCostTableData : state.conditionTableData;
    //     const costField = isOtherCost ? 'NetCost' : 'ConditionCost';
    //     let copiedData = _.cloneDeep(dataArray) ?? [];
    //     // Create a temporary array for calculations
    //     let tempArr = copiedData;
    //     // Process each item in the array
    //     copiedData.forEach((item, index) => {
    //         if (item?.[typeField] === "Percentage") {
    //             // Calculate costs
    //             const ApplicabilityCost = handleApplicability(
    //                 item[applicabilityField], 
    //                 basicValue,
    //                 tempArr,
    //                 costField,
    //                 headerName
    //             );
    //             const Cost = checkForNull((item?.[percentageField]) / 100) * checkForNull(ApplicabilityCost);
    //             const CostConversion = checkForNull((item?.[percentageField]) / 100) * checkForNull(ApplicabilityCost);
    //             // Create updated object
    //             const updatedItem = {
    //                 ...item,
    //                 ApplicabilityCost: ApplicabilityCost,
    //                 [resultFields.mainCost]: Cost,
    //                 [resultFields.conversionCost]: CostConversion,
    //                 [resultFields.perQuantityCost]: CostConversion,
    //                 ApplicabilityCostConversion: ApplicabilityCost,
    //             };
    //             // Update the temporary array
    //             tempArr[index] = updatedItem;
    //         }
    //     });
    //     return tempArr;
    // };

    const allFieldsInfoIcon = (scrapLabel) => {
        let obj = {
            toolTipBasicPrice: `Basic Rate + Other Cost`,
            toolTipTextCalculatedFactor: <>{labelWithUOMAndUOM("Calculated Factor", state.UOM?.label, state.ScrapRateUOM?.label)} = 1 / {labelWithUOMAndUOM("Calculated Ratio", state.ScrapRateUOM?.label, state.UOM?.label)}</>,
            toolTipTextScrapCostPerOldUOM: <>{labelWithUOMAndCurrency(scrapLabel, state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))} = {labelForScrapRate()?.labelBaseCurrency} * Calculated Factor</>
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
        let conditionList = recalculateConditions(basicPriceBaseCurrency, state)

        const sumBaseCurrency = conditionList?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
        let NetLandedCost = checkForNull(sumBaseCurrency) + checkForNull(basicPriceCurrencyTemp)
        console.log("CurrencyExchangeRate", CurrencyExchangeRate)
        let NetLandedCostLocalConversion = checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice) * checkForNull(CurrencyExchangeRate?.plantCurrencyRate)
        let NetLandedCostConversion
        if (getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency")) {
            NetLandedCostConversion = checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice) * checkForNull(CurrencyExchangeRate?.settlementCurrencyRate)
        } else {
            NetLandedCostConversion = checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice) * checkForNull(CurrencyExchangeRate?.plantCurrencyRate)

        }
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
                dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, netCostChanged: false }, () => { }))
            } else {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, netCostChanged: true }, () => { }))
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
            dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, states: updatedState }, () => { }))
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
            ...rawMaterailDetailsRefFinancial.current,
            states: updatedState
        }, () => { }));
    }
    const checkTechnology = () => {
        let obj = showRMScrapKeys(rawMaterailDetailsRefFinancial.current?.Technology ? rawMaterailDetailsRefFinancial.current?.Technology?.value : props?.DataToChange.TechnologyId)
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
        const fromCurrency = states.isImport ? currency?.label : getValues('plantCurrency')

        if (date !== effectiveDate) {
            if (currency?.label === getConfigurationKey().BaseCurrency) {
                setState(prevState => ({ ...prevState, currencyValue: 1, showCurrency: false, }))
            } else {
                const { costingTypeId } = states;
                const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: rawMaterailDetails?.Vendor?.value, clientValue: rawMaterailDetailsRefFinancial.current?.customer?.value, master: RAWMATERIAL, plantCurrency: getValues("plantCurrency") });
                setState(prevState => ({ ...prevState, isDateChange: true, effectiveDate: date }))
                if ((currency && currency?.length !== 0 && date)) {
                    if ((IsFetchExchangeRateVendorWiseForZBCRawMaterial() || IsFetchExchangeRateVendorWiseForParts()) && !((rawMaterailDetailsRefFinancial.current?.Vendor && rawMaterailDetailsRefFinancial.current?.Vendor?.length !== 0) || (rawMaterailDetailsRefFinancial.current?.customer && rawMaterailDetailsRefFinancial.current?.customer?.length !== 0))) {
                        return;
                    }
                    if (getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency")) {

                        dispatch(getExchangeRateByCurrency(getValues('plantCurrency'), costingHeadTypeId, DayTime(date).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                            if (Object.keys(res.data.Data).length === 0) {
                                setState(prevState => ({ ...prevState, showWarning: true }));
                            } else {
                                setState(prevState => ({ ...prevState, showWarning: false }));
                            }
                            let Data = res?.data?.Data
                            setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));

                            setCurrencyExchangeRate(prevState => ({
                                ...prevState, plantCurrencyRate: !states.isImport ? (Data?.CurrencyExchangeRate ?? 1) : checkForNull(Data?.LocalCurrencyExchangeRate ?? 1),
                                settlementCurrencyRate: states.isImport ? checkForNull(Data?.CurrencyExchangeRate ?? 1) : null
                            }))
                            dispatch(setExchangeRateDetails({ ...exchangeRateDetailsRef.current, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
                        }));
                    }
                }
                setState(prevState => ({ ...prevState, showCurrency: true }))
            }
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
        const { currency } = state
        let fromCurrency = states.isImport ? state.currency?.label : getValues('plantCurrency')
        let toCurrency = !states.isImport ? reactLocalStorage.getObject("baseCurrency") : getValues('plantCurrency')
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: states.costingTypeId, vendorId: rawMaterailDetails?.Vendor?.value, clientValue: rawMaterailDetailsRefFinancial.current?.customer?.value, master: RAWMATERIAL, plantCurrency: getValues("plantCurrency") });

        if (state.currency && state.currency.length !== 0 && state.effectiveDate) {
            if ((IsFetchExchangeRateVendorWiseForZBCRawMaterial() || IsFetchExchangeRateVendorWiseForParts()) && !(rawMaterailDetailsRefFinancial.current && rawMaterailDetailsRefFinancial.current?.Vendor?.length !== 0)) {
                return;
            }

            if (getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency")) {
            dispatch(getExchangeRateByCurrency(getValues('plantCurrency'), costingHeadTypeId, DayTime(state.effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                if (Object.keys(res.data.Data).length === 0) {
                    setState(prevState => ({ ...prevState, showWarning: true }))
                } else {
                    setState(prevState => ({ ...prevState, showWarning: false }))
                }
                let Data = res?.data?.Data
                setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                dispatch(setExchangeRateDetails({ ...exchangeRateDetailsRef.current, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
            }))};
        }
    }
    const handleCustomer = () => {
        const { currency, effectiveDate } = state
        const { costingTypeId } = states
        let fromCurrency = states.isImport ? state.currency?.label : getValues('plantCurrency')
        let toCurrency = !states.isImport ? reactLocalStorage.getObject("baseCurrency") : getValues('plantCurrency')
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: rawMaterailDetails?.Vendor?.value, clientValue: rawMaterailDetailsRefFinancial.current?.customer?.value, master: RAWMATERIAL, plantCurrency: getValues("plantCurrency") });
        if (rawMaterailDetailsRefFinancial.current?.customer?.length !== 0 && state.currency && state.currency.length !== 0 && state.effectiveDate) {
            if (getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency")) {
            dispatch(getExchangeRateByCurrency(getValues('plantCurrency'), costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {

                if (Object.keys(res.data.Data).length === 0) {
                    setState(prevState => ({ ...prevState, showWarning: true }))
                } else {
                    setState(prevState => ({ ...prevState, showWarning: false }))
                }
                let Data = res?.data?.Data
                setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                dispatch(setExchangeRateDetails({ ...exchangeRateDetailsRef.current, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
            }))};
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
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, ScrapRateUOM: newValue }, () => { }))
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
            setValue('OtherCost', checkForDecimalAndNull(totalBase, getConfigurationKey().NoOfDecimalForPrice))
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
            dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, netCostChanged: true }, () => { }))
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
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, states: updatedState, ConditionTableData: data }, () => { }))
    }
    /**
    * @method handleCurrency
    * @description called
    */
    const handleCurrency = (newValue) => {


        const { effectiveDate } = state
        if (newValue && newValue !== '') {
            if (newValue.label === getConfigurationKey().BaseCurrency) {
                setState(prevState => ({ ...prevState, currencyValue: 1, showCurrency: false }))
                // Convert newValue.value to an integer before passing to dispatch
                const currencyId = parseInt(newValue.value, 10);

                dispatch(SetCommodityIndexAverage('', 0, '', currencyId, '', '', ''));

            } else {
                const { costingTypeId } = states;
                const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: newValue.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: states.costingTypeId, vendorId: rawMaterailDetails?.Vendor?.value, clientValue: rawMaterailDetailsRefFinancial.current?.customer?.value, master: RAWMATERIAL, plantCurrency: getValues("plantCurrency") });

                if (newValue && newValue.length !== 0 && effectiveDate) {
                    if ((IsFetchExchangeRateVendorWiseForZBCRawMaterial() || IsFetchExchangeRateVendorWiseForParts()) && !((rawMaterailDetailsRefFinancial.current?.Vendor && rawMaterailDetailsRefFinancial.current?.Vendor?.label) || (rawMaterailDetailsRefFinancial.current?.customer && rawMaterailDetailsRefFinancial.current?.customer?.length !== 0))) {
                        return false;
                    }
                   
                    dispatch(getExchangeRateByCurrency(getValues('plantCurrency'), costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), getValues('ExchangeSource')?.label ?? null, res => {
                        if (Object.keys(res.data.Data).length === 0) {
                            setState(prevState => ({ ...prevState, showWarning: true }));
                        } else {
                            setState(prevState => ({ ...prevState, showWarning: false }));
                        }
                        let Data = res?.data?.Data
                        setState(prevState => ({ ...prevState, currencyValue: checkForNull(Data?.CurrencyExchangeRate) }));
                        setCurrencyExchangeRate(prevState => ({ ...prevState, settlementCurrencyRate: checkForNull(Data?.CurrencyExchangeRate) }));
                        dispatch(setExchangeRateDetails({ ...exchangeRateDetailsRef.current, CurrencyExchangeRate: Data?.CurrencyExchangeRate, ExchangeRateId: Data?.ExchangeRateId }, () => { }))
                    }))
                }

                setState(prevState => ({ ...prevState, showCurrency: true }))

            }
            // Convert newValue.value to an integer before passing to dispatch
            const currencyId = parseInt(newValue.value, 10);
            dispatch(SetCommodityIndexAverage('', 0, '', currencyId, '', '', ''));
            setState(prevState => ({ ...prevState, currency: newValue }))
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
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, states: updatedState }, () => { }))

    }
    const handleFinancialDataChange = () => {
        if (isEditFlag) {
            let scrapRate = showScrapKeys?.showScrap ? getValues('ScrapRate') : showScrapKeys?.showForging ? getValues('ForgingScrap') : getValues('JaliScrapCost')
            let machiningScrap = getValues('MachiningScrap')
            let CircleScrap = getValues('CircleScrapCost')
            let cutOff = getValues('cutOffPrice')
            if (checkForNull(scrapRate) === checkForNull(props?.DataToChange?.ScrapRate) && checkForNull(cutOff) === checkForNull(props?.DataToChange?.CutOffPrice) && checkForNull(machiningScrap) === checkForNull(props?.DataToChange?.MachiningScrapRate) && checkForNull(CircleScrap) === checkForNull(props?.DataToChange?.JaliScrapCost)) {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, financialDataChanged: false }, () => { }))
            } else {
                dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, financialDataChanged: true }, () => { }))
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
        dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRefFinancial.current, states: state }, () => { }))
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

    const updateTableCost = (isConditionCost = false) => {
        const result = updateCostValue(isConditionCost, state, getValues('BasicRate'));
        // Update state
        setState(result.updatedState);

        // Update form value
        setValue(result.formValue.field, result.formValue.value);

        // Dispatch appropriate action
        if (isConditionCost) {
            dispatch(setRawMaterialDetails({
                ...rawMaterailDetailsRefFinancial.current,
                states: result.updatedState
            }, () => { }));
        } else {
            dispatch(setOtherCostDetails(result.tableData));
        }
    };
    const showNetCost = () => {
        let show = false
        if (state.hidePlantCurrency) {
            show = false
        } else {
            show = true
        }
        return show
    }
    const getTooltipTextForCurrency = () => {
        const currencyLabel = getValues('currency')?.label ?? 'Currency';
        const plantCurrency = getValues('plantCurrency') ?? 'Plant Currency';
        const baseCurrency = reactLocalStorage.getObject("baseCurrency");

        // Check the exchange rates or provide a default placeholder if undefined
        const plantCurrencyRate = CurrencyExchangeRate?.plantCurrencyRate ?? '-';
        const settlementCurrencyRate = CurrencyExchangeRate?.settlementCurrencyRate ?? '-';

        // Generate tooltip text based on the condition
        return <>
            {!this?.state?.hidePlantCurrency
                ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrency},`
                : ''}<p> {getValues('plantCurrency') !== reactLocalStorage.getObject("baseCurrency") ? `Exchange Rate: 1 ${plantCurrency} = ${settlementCurrencyRate} ${baseCurrency}` : ""}</p>
        </>;
    };
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
                            <TooltipCustom id="currency" width="350px" tooltipText={getTooltipTextForCurrency()} />
                            <SearchableSelectHookForm
                                name="currency"
                                label="Currency"
                                id="currency"
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
                                customClassName="mb-1"
                            />
                            {state.showWarning && <WarningMessage dClass="mt-1" message={`${state.currency?.label} to ${reactLocalStorage.getObject("baseCurrency")} rate is not present in the Exchange Master`} />}
                        </Col>}
                        <Col className="col-md-15">
                            {getValues('plantCurrency') && !state.hidePlantCurrency && !states.isImport && <TooltipCustom id="plantCurrency" width="350px" tooltipText={`Exchange Rate: 1 ${getValues('plantCurrency')} = ${CurrencyExchangeRate?.plantCurrencyRate ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
                            <TextFieldHookForm
                                name="plantCurrency"
                                label="Plant Currency"
                                id="plantCurrency"
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
                                customClassName=" withBorder mb-1"
                                handleChange={() => { }}
                                errors={errors.plantCurrency}
                            />
                            {state.showPlantWarning && <WarningMessage dClass="mt-1" message={`${getValues('plantCurrency')} rate is not present in the Exchange Master`} />}
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
                                    disabled={disableAll || isViewFlag || (state.isShowIndexCheckBox && state.toDate === '')}
                                    mandatory={true}
                                    errors={errors && errors.effectiveDate}
                                    minDate={state.isShowIndexCheckBox ? addDays(new Date(state?.toDate), 1) : isEditFlag ? state.minDate : getEffectiveDateMinDate()}
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
                                    <TooltipCustom disabledIcon={true} width="350px" id="conversion-factor-base-currency" tooltipText={allFieldsInfoIcon()?.toolTipTextCalculatedFactor} />
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
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="scrap-rate-base-currency" tooltipText={allFieldsInfoIcon('Scrap Rate')?.toolTipTextScrapCostPerOldUOM} />}
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
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="forging-scrap-cost-base-currency" width={'450px'} tooltipText={allFieldsInfoIcon('Forging Scrap Rate')?.toolTipTextScrapCostPerOldUOM} />}
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
                                        {state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="jali-scrap-cost-base-currency" width={'350px'} tooltipText={allFieldsInfoIcon('Jali Scrap Rate')?.toolTipTextScrapCostPerOldUOM} />}
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
                                    <div className="d-flex align-items-center mt-1">
                                        <button type="button" id="other-cost-refresh" className={'refresh-icon mt-1 ml-1'} onClick={() => updateTableCost(false)} disabled={isViewFlag}>
                                            <TooltipCustom disabledIcon={true} width="350px" id="other-cost-refresh" tooltipText="Refresh to update other cost" />
                                        </button>
                                        {<Button
                                            id="addRMDomestic_otherToggle"
                                            onClick={otherCostToggle}
                                            className={"right mt-1 ml-1"}
                                            variant={isViewFlag ? "view-icon-primary" : `${!getValues('BasicRate') ? 'blurPlus-icon-square' : 'plus-icon-square'}`}
                                            title={isViewFlag ? "View" : "Add"}
                                            disabled={!getValues('BasicRate')}
                                        />}
                                    </div>

                                </div>
                            </Col>
                            {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && states.costingTypeId === ZBCTypeId && <>

                                <Col className="col-md-15">
                                    <TooltipCustom disabledIcon={true} width="350px" id="rm-basic-price" tooltipText={allFieldsInfoIcon()?.toolTipBasicPrice} />
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
                                            <button type="button" id="condition-cost-refresh" className={'refresh-icon mt-1 ml-1'} onClick={() => updateTableCost(true)} disabled={isViewFlag}>
                                                <TooltipCustom disabledIcon={true} width="350px" id="condition-cost-refresh" tooltipText="Refresh to update Condition cost" />
                                            </button>
                                            <Button
                                                id="addRMDomestic_conditionToggl"
                                                onClick={conditionToggle}
                                                className={"right mt-1 ml-1"}
                                                variant={isViewFlag ? "view-icon-primary" : `${!getValues('BasicRate') ? 'blurPlus-icon-square' : 'plus-icon-square'}`}
                                                title={isViewFlag ? "View" : "Add"}
                                                disabled={!getValues('BasicRate')}
                                            />
                                        </div>

                                    </div>
                                </Col>

                            </>}

                            {states.isImport && <Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} width="350px" id="bop-net-cost" tooltipText={netCostTitle()?.toolTipTextNetCostSelectedCurrency} />
                                <TextFieldHookForm
                                    label={labelWithUOMAndCurrency("Net Cost ", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, states.isImport ? state.currency?.label : !getValues('plantCurrency') ? 'Currency' : getValues('plantCurrency'))}
                                    name={'NetLandedCost'}
                                    id="bop-net-cost"
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
                            {showNetCost() && <Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} width="350px" id="rm-net-cost-currency" tooltipText={states.isImport ? netCostTitle()?.tooltipTextPlantCurrency : netCostTitle()?.toolTipTextNetCostSelectedCurrency} />
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
                            </Col>}
                            {<Col className="col-md-15">
                                <TooltipCustom disabledIcon={true} width="350px" id="bop-net-cost-currency" tooltipText={states.isImport ? netCostTitle()?.toolTipTextNetCostBaseCurrency : netCostTitle()?.tooltipTextPlantCurrency} />
                                <TextFieldHookForm
                                    label={labelWithUOMAndCurrency("Net Cost", state.UOM?.label === undefined ? 'UOM' : state.UOM?.label, (reactLocalStorage.getObject("baseCurrency")))}
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
                            </Col>}
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

