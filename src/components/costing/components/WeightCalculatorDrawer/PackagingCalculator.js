import React, { useContext, useEffect, useRef, useState } from 'react'
import { Row, Col, Container, Table, } from 'reactstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { number, checkWhiteSpaces, maxLength7, maxLength5, maxLength4, maxLength3, checkForNull, checkForDecimalAndNull, loggedInUserId, getConfigurationKey, decimalNumberLimit6, decimalNumberLimit8And7 } from '../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../common/Toaster'
import TooltipCustom from '../../../common/Tooltip'
import Button from '../../../layout/Button'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { getPackagingCalculation, getSimulationPackagingCalculation, getVolumePerDayForPackagingCalculator, savePackagingCalculation, getTypeOfCost, getCalculationCriteriaList } from '../../actions/CostWorking'
import { Drawer } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { ViewCostingContext } from '../CostingDetails'
import { AWAITING_APPROVAL_ID, DRAFT, DRAFTID, EMPTY_DATA, PENDING_FOR_APPROVAL_ID, REJECTEDID } from '../../../../config/constants'
import { debounce } from 'lodash'
import LoaderCustom from '../../../common/LoaderCustom'
import FormFieldsRenderer from '../../../common/FormFieldsRenderer'
import NoContentFound from '../../../common/NoContentFound'
import Switch from 'react-switch'
function PackagingCalculator(props) {
    const { rowObjData } = props
    const [state, setState] = useState({
        volumePerDay: 0,
        volumePerAnnum: 0,
        packingCost: 0,
        noOfCratesRequiredPerDay: 0,
        totalCostOfCrate: 0,
        spacerPackingInsertRecoveryCost: 0,
        totalCostOfSpacerPackingInsert: 0,
        disableSubmit: false,
        loader: false,
        typeOfCost: '',
        disableCost: true,
        totalAddedCost: '',
        gridTable: [],
        isEditIndex: false,
        totalCostOfCrateWithAddedCost: '',
        editIndex: '',
        calculationCriteria: '',
        isVolumeAutoCalculate: false,
        disableFields: false,
        IsPerPart: false // Add this line

    })
    const { costingData, CostingEffectiveDate } = useSelector(state => state.costing)
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const { typeOfCostList, calculationCriteriaList } = useSelector(state => state.costWorking)
    const costingViewMode = useContext(ViewCostingContext);
    const CostingViewMode = costingViewMode ?? props?.CostingViewMode
    const PackagingCalculationId = rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.CostingPackagingCalculationDetailsId : props?.costingPackagingCalculationDetailsId ?? null
    const DaysInMonthForVolumePerDay = getConfigurationKey().DaysInMonthForVolumePerDayPackagingCalculation
    const dispatch = useDispatch()
    const {
        register: registerPackaging,
        handleSubmit: handleSubmitPackaging,
        control: controlPackaging,
        setValue: setValuePackaging,
        getValues: getValuesPackaging,
        formState: { errors: errorsPackaging },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const {
        register: registerCost,
        handleSubmit: handleSubmitCost,
        control: controlCost,
        setValue: setValueCost,
        getValues: getValuesCost,
        reset,
        formState: { errors: errorsCost },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const isSubmitting = useRef(false)
    const { t } = useTranslation('CostingLabels');
    // 1. Update the useWatch hook to include relevant fields
    const calclulationFieldValues = useWatch({
        control: controlPackaging,
        name: ['NoOfComponentsPerCrate', 'StockNormDays', 'WeightOfCover', 'CostOfCrate', 'CostOfCoverPerKg', 'AmortizedNoOfYears', 'NoOfPartsPerCover', 'SpacerPackingInsertCost', 'NoOfSpacerPackingInsert', 'SpacerPackingInsertRecovery'],
        defaultValue: []
    })

    useEffect(() => {
        if (!CostingViewMode && calclulationFieldValues.some(value => value !== undefined)) {
            calculateAllValues();

            // After calculating all values, also update totalCostOfCrateWithAddedCost
            setTimeout(() => {
                updateTotalCostOfCrateWithAddedCost();
            }, 100);
        }
    }, [calclulationFieldValues, state?.spacerPackingInsertRecoveryCostPerKg, state?.volumePerDay, state?.volumePerAnnum, state?.totalCostOfCrate, state?.totalAddedCost, state?.totalCostOfCrateWithAddedCost, state.isVolumeAutoCalculate, state.IsPerPart]);
    useEffect(() => {

        const tempData = rowObjData?.SimulationTempData
        // const index = props?.viewPackaingData?.findIndex(item => item.PackagingDetailId === rowObjData?.PackagingDetailId)
        // if (props.simulationMode && tempData?.map(item => item?.CostingHeading)?.includes("New Costing") && tempData?.map(item => Number(item?.SimulationStatusId)).some(id => [REJECTEDID, PENDING_FOR_APPROVAL_ID, AWAITING_APPROVAL_ID, DRAFTID].includes(id)) && props?.viewPackaingData[index]?.Applicability === 'Crate/Trolley') {
        //     const simulationId = tempData.find(item => item?.CostingHeading === "New Costing")?.SimulationId
        //     dispatch(getSimulationPackagingCalculation(simulationId, costingId, (res) => {
        //         let data = res?.data?.Data
        //         setFormValues(data)
        //      }))
        // }
        // else{
        const getPackagingCalculationData = () => {

            const costingId = costingData?.CostingId ?? tempData.find(item => item?.CostingHeading === "Old Costing")?.costingId
            const calculatorId = props?.costingPackagingCalculationDetailsId ?? null
            const packagingDetailId = rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.PackagingDetailId : null
            setState((prevState) => ({ ...prevState, loader: true }))
            dispatch(getPackagingCalculation(costingId, packagingDetailId, calculatorId, (res) => {
                let data = res?.data?.Data
                setState((prevState) => ({ ...prevState, IsPerPart: data?.IsPerPart }))
                setFormValues(data)
                if (!CostingViewMode && (state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost") && state.isVolumeAutoCalculate) {
                    getVolumePerDayData()
                }
                setState((prevState) => ({ ...prevState, loader: false }))
            }))
        }

        getPackagingCalculationData()
        dispatch(getTypeOfCost(res => { }))
        dispatch(getCalculationCriteriaList(res => { }))
    }, [])
    useEffect(() => {
        const noOfComponentsPerCrate = getValuesPackaging('NoOfComponentsPerCrate');
        const stockNormDays = getValuesPackaging('StockNormDays');
        const costOfCrate = getValuesPackaging('CostOfCrate');

        if (noOfComponentsPerCrate && stockNormDays && costOfCrate && state?.calculationCriteria) {
            setState((prevState) => ({ ...prevState, disableCost: false }));
        } else {
            setState((prevState) => ({ ...prevState, disableCost: true }));
        }
    }, [calclulationFieldValues]);
    useEffect(() => {
        updateTotalCostOfCrateWithAddedCost();

        if (state?.gridTable && state?.gridTable?.length > 0) {
            setState(prev => ({
                ...prev,
                disableFields: true,
            }));
        } else {
            setState(prev => ({
                ...prev,
                disableFields: false,
            }));
        }
    }, [state.gridTable])
    useEffect(() => {
        if (!CostingViewMode && (state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost") && state.isVolumeAutoCalculate) {
            getVolumePerDayData()
        } else {
            setValuePackaging('VolumePerDay', '')
            setValuePackaging('VolumePerAnnum', '')
            setValuePackaging('NoOfCratesRequiredPerDay', '')
            setState((prevState) => ({ ...prevState, volumePerDay: 0, volumePerAnnum: 0, disableSubmit: false, noOfCratesRequiredPerDay: 0 }))
        }
    }, [state.isVolumeAutoCalculate])
    useEffect(() => {
        if ((state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost") && !state.isVolumeAutoCalculate) {
            calculateVolumePerDay()
        }
    }, [getValuesPackaging('VolumePerAnnum')])
    const resetValues = (isVolumeAutoCalculate = false) => {
        if (!isVolumeAutoCalculate) {
            setValuePackaging('NoOfComponentsPerCrate', '')
            setValuePackaging('TotalCostOfCrateWithAddedCost', '')
            setState((prevState) => ({ ...prevState, gridTable: [] }))
        }
        setValuePackaging('NoOfCratesRequiredPerDay', '')
        setValuePackaging('StockNormDays', '')
        setValuePackaging('CostOfCrate', '')
        setValuePackaging('TotalCostOfCrate', '')
    }
    const getVolumePerDayData = () => {
        dispatch(getVolumePerDayForPackagingCalculator(costingData?.PartId, costingData?.PlantId, CostingEffectiveDate, costingData?.VendorId, (res) => {
            if (res?.status === 204) {
                setState((prevState) => ({ ...prevState, disableSubmit: true }))
                Toaster.warning("Volume data doesn't exist for the selected part. Add the volume to calculate the packaging cost.")
                return false
            }
            let data = res?.data?.Data
            setValuePackaging('VolumePerDay', checkForDecimalAndNull(data?.VolumePerDay, NoOfDecimalForInputOutput))
            setValuePackaging('VolumePerAnnum', checkForDecimalAndNull(data?.VolumePerAnnum, NoOfDecimalForInputOutput))
            setState((prevState) => ({ ...prevState, volumePerDay: data?.VolumePerDay, volumePerAnnum: data?.VolumePerAnnum, disableSubmit: false }))
        }))
    }
    const calculateVolumePerDay = () => {
        const volumePerDay = getValuesPackaging('VolumePerAnnum') / 12 * DaysInMonthForVolumePerDay
        setValuePackaging('VolumePerDay', checkForDecimalAndNull(volumePerDay, NoOfDecimalForInputOutput))
        setState((prevState) => ({ ...prevState, volumePerDay: volumePerDay, volumePerAnnum: getValuesPackaging('VolumePerAnnum') }))
    }


    const renderListing = (label) => {
        const temp = [];

        if (label === 'typeOfCost') {
            typeOfCostList && typeOfCostList.map((item) => {
                if (item.Value === '--0--') return false;
                // Hide Maintenance option if not Annual Volume Basis
                if (item.Text === 'Maintenance(Total cost of crate/trolley)' &&
                    state.calculationCriteria?.label !== 'Annual Volume Basis' && state.calculationCriteria?.label !== 'Returnable Packaging Cost') {
                    return false;
                }
                temp.push({ label: item?.Text, value: item?.Value });
                return null;
            });
            return temp;
        }
        if (label === 'calculationCriteria') {
            calculationCriteriaList && calculationCriteriaList.map((item) => {
                if (item.Value === '--0--') return false;
                temp.push({ label: item?.Text, value: item?.Value });
                return null;
            });
            return temp;
        }

    };
    const setFormValues = (data) => {
        setValuePackaging('NoOfComponentsPerCrate', data?.NoOfComponentsPerCrate ? checkForDecimalAndNull(data?.NoOfComponentsPerCrate, NoOfDecimalForInputOutput) : '')
        setValuePackaging('NoOfCratesRequiredPerDay', data?.NoOfCratesRequiredPerDay ? checkForDecimalAndNull(data?.NoOfCratesRequiredPerDay, NoOfDecimalForInputOutput) : '')
        setValuePackaging('StockNormDays', data?.StockNormDays ? checkForDecimalAndNull(data?.StockNormDays, NoOfDecimalForInputOutput) : '')
        setValuePackaging('CostOfCrate', data?.CostOfCrate ? checkForDecimalAndNull(data?.CostOfCrate, NoOfDecimalForPrice) : '')
        setValuePackaging('TotalCostOfCrate', data?.TotalCostOfCrate ? checkForDecimalAndNull(data?.TotalCostOfCrate, NoOfDecimalForPrice) : '')
        setValuePackaging('AmortizedNoOfYears', data?.AmortizedNoOfYears ? checkForDecimalAndNull(data?.AmortizedNoOfYears, NoOfDecimalForInputOutput) : 1)
        setValuePackaging('WeightOfCover', data?.WeightOfCoverPerKg ? checkForDecimalAndNull(data?.WeightOfCoverPerKg, NoOfDecimalForInputOutput) : '')
        setValuePackaging('CostOfCoverPerKg', data?.CostOfCoverPerKg ? checkForDecimalAndNull(data?.CostOfCoverPerKg, NoOfDecimalForPrice) : '')
        setValuePackaging('NoOfPartsPerCover', data?.NoOfPartsPerCover ? checkForDecimalAndNull(data?.NoOfPartsPerCover, NoOfDecimalForInputOutput) : '')
        setValuePackaging('SpacerPackingInsertCost', data?.SpacerPackingInsertCostIfAny ? checkForDecimalAndNull(data?.SpacerPackingInsertCostIfAny, NoOfDecimalForPrice) : '')
        setValuePackaging('NoOfSpacerPackingInsert', data?.NoOfSpacersPackingInsert ? checkForDecimalAndNull(data?.NoOfSpacersPackingInsert, NoOfDecimalForInputOutput) : '')
        setValuePackaging('SpacerPackingInsertRecovery', data?.SpacersPackingInsertRecoveryPercentage ? checkForDecimalAndNull(data?.SpacersPackingInsertRecoveryPercentage, NoOfDecimalForInputOutput) : '')
        setValuePackaging('SpacerPackingInsertRecoveryCostPerKg', data?.SpacersPackingInsertRecoveryCostPerKg ? checkForDecimalAndNull(data?.SpacersPackingInsertRecoveryCostPerKg, NoOfDecimalForPrice) : '')
        setValuePackaging('TotalCostOfSpacerPackingInsert', data?.CostOfSpacersPackingInsert ? checkForDecimalAndNull(data?.CostOfSpacersPackingInsert, NoOfDecimalForPrice) : '')
        setValuePackaging('PackingCost', data?.PackingCost ? checkForDecimalAndNull(data?.PackingCost, NoOfDecimalForPrice) : '')
        setValuePackaging('TotalCostOfCrateWithAddedCost', data?.TotalCostOfCrateWithAddedCost ? checkForDecimalAndNull(data?.TotalCostOfCrateWithAddedCost, NoOfDecimalForPrice) : '')
        setValuePackaging('CalculationCriteria', data?.CalculationCriteria ? { label: data?.CalculationCriteria, value: data?.CalculationCriteria } : '')
        setState((prevState) => ({
            ...prevState,
            noOfCratesRequiredPerDay: data?.NoOfCratesRequiredPerDay,
            totalCostOfCrate: data?.TotalCostOfCrate,
            spacerPackingInsertRecoveryCostPerKg: data?.SpacersPackingInsertRecoveryCostPerKg,
            totalCostOfSpacerPackingInsert: data?.CostOfSpacersPackingInsert,
            packingCost: data?.PackingCost,
            totalAddedCost: data?.NetAddedCost,
            gridTable: data?.PackagingAddedCosts ?? [],
            totalCostOfCrateWithAddedCost: data?.TotalCostOfCrateWithAddedCost,
            calculationCriteria: data?.CalculationCriteria ? { label: data?.CalculationCriteria, value: data?.CalculationCriteria } : '',
            isVolumeAutoCalculate: data?.IsFetchVolumeFromMaster
        }))
        if (CostingViewMode || !data?.IsFetchVolumeFromMaster) {
            setTimeout(() => {
                setValuePackaging('VolumePerDay', checkForDecimalAndNull(data?.VolumePerDay, NoOfDecimalForInputOutput))
                setValuePackaging('VolumePerAnnum', checkForDecimalAndNull(data?.VolumePerAnnum, NoOfDecimalForInputOutput))
                setState((prevState) => ({
                    ...prevState,
                    volumePerDay: data?.VolumePerDay,
                    volumePerAnnum: data?.VolumePerAnnum,
                }))
            }, 0)
        }
    }
    const handleTypeOfCostChange = (value) => {
        setState((prevState) => ({ ...prevState, typeOfCost: value }))
        setValueCost('costPercentage', '')
        setValueCost('cost', '')

    }
    const handleCalculationCriteriaChange = (value) => {
        setState((prevState) => ({ ...prevState, calculationCriteria: value, disableSubmit: false }))
        resetValues()
    }
    const handleCostPercentageChange = (value) => {
        if (!value || isNaN(value)) {
            setValueCost('cost', '');
            return;
        }

        const isBinOrPolymerCalculation = ['Bin/Trolley Life Basis', 'Polymer Trolley Calculation', 'Non-returnable packaging']?.includes(state.calculationCriteria?.label);
        const isAnnualVolumeBasis = state.calculationCriteria?.label === 'Annual Volume Basis' || state.calculationCriteria?.label === 'Returnable Packaging Cost';
        const isMaintenanceCost = state.typeOfCost?.label === 'Maintenance(Cost of crate/trolley)';

        let costApplicable = 0;
        if (isBinOrPolymerCalculation) {
            costApplicable = checkForNull(getValuesPackaging('CostOfCrate'));
        } else if (isAnnualVolumeBasis) {
            costApplicable = isMaintenanceCost ? checkForNull(getValuesPackaging('CostOfCrate')) : state.totalCostOfCrate;
        }

        const cost = costApplicable * (parseFloat(value) / 100);
        setValueCost('cost', checkForDecimalAndNull(cost, NoOfDecimalForPrice));
    }
    const handleNoOfCratesRequiredPerDayChange = (e) => {
        if (!state.isVolumeAutoCalculate) {
            const value = e.target.value;
            setValuePackaging('NoOfCratesRequiredPerDay', value);
            setState(prevState => ({
                ...prevState,
                noOfCratesRequiredPerDay: checkForNull(value)
            }));
            calculateAllValues();
        }
    };

    const packagingCalculatorSection1 = [
        ...(state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost" ? [
            ...(state.isVolumeAutoCalculate ? [{ label: t('volumePerDay', { defaultValue: 'Volume per day' }), name: 'VolumePerDay', mandatory: false, disabled: true, tooltip: { text: `Coming from the volume master, budgeted for the specified effective date (Budgeted Quantity / ${DaysInMonthForVolumePerDay})`, width: '250px', customClass: "mt-4", disabledIcon: false } }] : []),
            { label: t('volumePerAnnum', { defaultValue: 'Volume per annum' }), name: 'VolumePerAnnum', mandatory: false, disabled: state.isVolumeAutoCalculate || CostingViewMode, ...(state.isVolumeAutoCalculate ? { tooltip: { text: `${t('volumePerDay', { defaultValue: 'Volume per day' })} * ${DaysInMonthForVolumePerDay} * 12`, width: '250px', disabledIcon: true } } : {}) },
            { label: t('noOfCratesRequiredPerDay', { defaultValue: 'No. of crates/trolley required per day' }), name: 'NoOfCratesRequiredPerDay', mandatory: false, handleChange: handleNoOfCratesRequiredPerDayChange, disabled: state.isVolumeAutoCalculate || CostingViewMode, ...(state.isVolumeAutoCalculate ? { tooltip: { text: `${t('volumePerDay', { defaultValue: 'Volume per day' })} / ${t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' })}`, width: '250px', disabledIcon: true } } : {}) }
        ] : []),
        { label: t('stockNormDays', { defaultValue: 'Stock Norm days' }), name: 'StockNormDays', mandatory: true, disabled: state.disableFields || CostingViewMode },
        { label: t('costOfCrate', { defaultValue: 'Cost of crate/trolley' }), name: 'CostOfCrate', mandatory: true, disabled: state.disableFields || CostingViewMode },
        ...(state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost" ? [
            { label: t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' }), name: 'TotalCostOfCrate', mandatory: false, disabled: true, tooltip: { text: `${t('noOfCratesRequiredPerDay', { defaultValue: 'No. of crates/trolley required per day' })} * ${t('stockNormDays', { defaultValue: 'Stock Norm days' })} * ${t('costOfCrate', { defaultValue: 'Cost of crate/trolley' })}`, width: '250px', disabledIcon: true } },
        ] : []),
    ]
    const addedCostText = () => {
        if (state.calculationCriteria?.label === 'Bin/Trolley Life Basis' || state.calculationCriteria?.label === 'Polymer Trolley Calculation' || state.calculationCriteria?.label === 'Non-returnable packaging') {
            return `${t('costOfCrate', { defaultValue: 'Cost of crate/trolley' })} * (${t('costPercentage', { defaultValue: 'Cost (%)' })} / 100)`
        } else {
            return `${t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' })} * (${t('costPercentage', { defaultValue: 'Cost (%)' })} / 100)`
        }
    }
    const tableFields = [
        {
            label: t('typeOfCost', { defaultValue: 'Type of cost' }),
            name: 'typeOfCost',
            handleChange: handleTypeOfCostChange,
            options: renderListing('typeOfCost').filter(option =>
                !state.gridTable.some(item =>
                    item.TypeOfCost === option.label &&
                    state.editIndex !== state.gridTable.findIndex(tableItem => tableItem.TypeOfCost === option.label)
                )
            ),
            searchable: true,
            mandatory: true,
            disabled: (state.disableCost || CostingViewMode || state.isEditIndex)
        },
        ...(state.typeOfCost?.label !== 'Fixed' ? [
            {
                label: t('costPercentage', { defaultValue: 'Cost (%)' }),
                name: 'costPercentage',
                handleChange: (e) => { handleCostPercentageChange(e?.target?.value) },
                mandatory: true,
                percentageLimit: true,
                validate: { number, maxLength3 },
                disabled: state.disableCost || CostingViewMode
            }
        ] : []),
        {
            label: t('cost', { defaultValue: 'Cost' }),
            name: 'cost',
            validate: { number, maxLength7 },
            disabled: state.typeOfCost?.label !== 'Fixed' || CostingViewMode,
            tooltip: state.typeOfCost?.label !== 'Fixed' ?
                { text: `${addedCostText()}`, width: '250px', disabledIcon: true }
                : false
        },
    ]
    const packagingCostText = () => {
        if (state.calculationCriteria?.label === 'Bin/Trolley Life Basis' || state.calculationCriteria?.label === 'Non-returnable packaging') {
            return `(${t('totalCostOfCrateWithAddedCost', { defaultValue: 'Total cost of crate/trolley (with additional costs)' })} / (${t('amortizedNoOfYears', { defaultValue: 'Amortized no. of years' })} * ${t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' })})) + 
            ((${t('weightOfCover', { defaultValue: 'Weight of cover (kg)' })} * ${t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' })}) / ${t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' })}) + 
            ${t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' })}`
        } else if (state.calculationCriteria?.label === 'Polymer Trolley Calculation') {
            return `(${t('totalCostOfCrateWithAddedCost', { defaultValue: 'Total cost of crate/trolley (with additional costs)' })} / (${t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' })} / ${t('stockNormDays', { defaultValue: 'Stock Norm days' })}) * 300) + 
            ((${t('weightOfCover', { defaultValue: 'Weight of cover (kg)' })} * ${t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' })}) / ${t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' })}) + 
            ${t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' })}`
        } else {
            return `(${t('totalCostOfCrateWithAddedCost', { defaultValue: 'Total cost of crate/trolley (with additional costs)' })} / (${t('volumePerAnnum', { defaultValue: 'Volume per annum' })} * ${t('amortizedNoOfYears', { defaultValue: 'Amortized no. of years' })})) + 
            ((${t('weightOfCover', { defaultValue: 'Weight of cover (kg)' })} * ${t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' })}) / ${t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' })}) + 
            ${t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' })}`
        }
    }
    const totalCostOfCrateWithAddedCostText = () => {
        if (state.calculationCriteria?.label === 'Bin/Trolley Life Basis' || state.calculationCriteria?.label === 'Non-returnable packaging') {
            return `(${t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' })} + ${t('totalAddedCost', { defaultValue: 'Additional cost' })}) * ${t('stockNormDays', { defaultValue: 'Stock Norm days' })}`
        } else if (state.calculationCriteria?.label === 'Annual Volume Basis' || state.calculationCriteria?.label === 'Returnable Packaging Cost') {
            return `${t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' })} + ${t('totalAddedCost', { defaultValue: 'Additional cost' })}`
        } else {
            return `${t('totalAddedCost', { defaultValue: 'Additional cost' })}`
        }
    }

    // Update the tooltip for Cost of spacer/packing/insert field in packagingCalculatorSection2
    const spacerPackingInsertTooltipText = () => {
        const baseFormula = `${t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' })} * ${t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' })} - ${t('spacerPackingInsertRecoveryCostPerKg', { defaultValue: 'Spacer/packing/insert recovery cost per kg' })}`;

        return state.IsPerPart
            ? `(${baseFormula}) / ${t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' })} [Per Part Mode]`
            : `${baseFormula} [Default Mode]`;
    };

    // Use the dynamic tooltip text in the packagingCalculatorSection2 array
    const packagingCalculatorSection2 = [
        { label: t('totalCostOfCrateWithAddedCost', { defaultValue: 'Total cost of crate/trolley (with additional costs)' }), name: 'TotalCostOfCrateWithAddedCost', mandatory: false, disabled: true, tooltip: { text: `${totalCostOfCrateWithAddedCostText()}`, width: '250px', disabledIcon: true } },
        { label: t('amortizedNoOfYears', { defaultValue: 'Amortized no. of years' }), name: 'AmortizedNoOfYears', validate: { maxLength3 }, mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('weightOfCover', { defaultValue: 'Weight of cover (kg)' }), name: 'WeightOfCover', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' }), name: 'CostOfCoverPerKg', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' }), name: 'NoOfPartsPerCover', mandatory: false, handleChange: (e) => { handleNoOfPartsPerCoverChange(e?.target?.value) }, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' }), name: 'SpacerPackingInsertCost', mandatory: false, validate: { maxLength4 }, handleChange: (e) => { handleSpacerPackingInsertCost(e?.target?.value) }, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' }), name: 'NoOfSpacerPackingInsert', mandatory: false, validate: { maxLength5 }, handleChange: (e) => { handleNoOfSpacerPackingInsert(e?.target?.value) }, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertRecovery', { defaultValue: 'Spacer/packing/insert recovery %' }), name: 'SpacerPackingInsertRecovery', handleChange: (e) => { handleSpacerPackingInsertRecovery(e?.target?.value) }, mandatory: false, percentageLimit: true, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertRecoveryCostPerKg', { defaultValue: 'Spacer/packing/insert recovery cost per kg' }), name: 'SpacerPackingInsertRecoveryCostPerKg', mandatory: false, disabled: true, tooltip: { text: `${t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' })} * ${t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' })} * (${t('spacerPackingInsertRecovery', { defaultValue: 'Spacer/packing/insert recovery %' })} / 100)`, width: '250px', disabledIcon: true } },
        { label: t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' }), name: 'TotalCostOfSpacerPackingInsert', mandatory: false, disabled: true, tooltip: { text: spacerPackingInsertTooltipText(), width: '350px', disabledIcon: true } },
        { label: t('packagingCost', { defaultValue: 'Packaging Cost' }), name: 'PackingCost', mandatory: false, disabled: true, tooltip: { text: packagingCostText(), width: '250px', disabledIcon: true } }

    ]
    const calculateAllValues = (explicitIsPerPart = null) => {
        // Get form values
        const {
            NoOfComponentsPerCrate,
            StockNormDays,
            CostOfCrate,
            SpacerPackingInsertCost,
            NoOfSpacerPackingInsert,
            AmortizedNoOfYears,
            WeightOfCover,
            CostOfCoverPerKg,
            NoOfPartsPerCover,
            NoOfCratesRequiredPerDay
        } = getValuesPackaging();
    
        // Calculate crates and costs
        const noOfComponentsPerCrate = checkForNull(NoOfComponentsPerCrate);
        const noOfCratesRequired = Math.ceil(state.volumePerDay / noOfComponentsPerCrate);
        const stockNormDays = checkForNull(StockNormDays);
        const costOfCrate = checkForNull(CostOfCrate);
    
        const totalCostOfCrate = (state.isVolumeAutoCalculate ? noOfCratesRequired : NoOfCratesRequiredPerDay) * stockNormDays * costOfCrate;
    
        // Calculate spacer costs - use explicitIsPerPart if provided, otherwise use state value
        const spacerCost = checkForNull(SpacerPackingInsertCost);
        const noOfSpacers = checkForNull(NoOfSpacerPackingInsert);
        
        // Recalculate spacer cost based on mode
        let costOfSpacerPackingInsert = (spacerCost * noOfSpacers) - state.spacerPackingInsertRecoveryCostPerKg;
        const partsPerCover = checkForNull(NoOfPartsPerCover);
        
        // Apply per-part mode division if applicable
        const isPerPartMode = explicitIsPerPart !== null ? explicitIsPerPart : state.IsPerPart;
        if (isPerPartMode && 
            state.calculationCriteria?.label === 'Non-returnable packaging' && 
            partsPerCover > 0) {
            costOfSpacerPackingInsert = costOfSpacerPackingInsert / partsPerCover;
        }
    
        // Calculate packaging cost based on criteria
        const amortizedYears = checkForNull(AmortizedNoOfYears);
        const weightOfCoverKg = checkForNull(WeightOfCover);
        const coverCostPerKg = checkForNull(CostOfCoverPerKg);
    
        const coverCost = checkForNull((weightOfCoverKg * coverCostPerKg) / partsPerCover);
        const spacerCostChecked = checkForNull(costOfSpacerPackingInsert);
    
        let packagingCost;
        const { calculationCriteria, totalCostOfCrateWithAddedCost, volumePerAnnum } = state;
    
        switch (calculationCriteria?.label) {
            case "Bin/Trolley Life Basis":
            case "Non-returnable packaging":
                packagingCost = checkForNull(totalCostOfCrateWithAddedCost / (amortizedYears * noOfComponentsPerCrate))
                    + coverCost
                    + spacerCostChecked;
                break;
            case "Polymer Trolley Calculation":
                packagingCost = checkForNull(totalCostOfCrateWithAddedCost / ((noOfComponentsPerCrate / stockNormDays) * 300))
                    + coverCost
                    + spacerCostChecked;
                break;
            default:
                packagingCost = checkForNull(totalCostOfCrateWithAddedCost / (volumePerAnnum * amortizedYears))
                    + coverCost
                    + spacerCostChecked;
        }
    
        // Add safety check for table updates
        const updatedGridTable = state.gridTable?.map(item => {
            // Skip update if item is invalid
            if (!item || typeof item !== 'object') return item;

            let newNetCost = item.NetCost;
            
            // Only update percentage-based costs
            if (item.TypeOfCost && item.TypeOfCost !== 'Fixed' && item.CostPercentage) {
                try {
                    const isBinOrPolymerCalculation = ['Bin/Trolley Life Basis', 'Polymer Trolley Calculation', 'Non-returnable packaging']?.includes(state.calculationCriteria?.label);
                    const isAnnualVolumeBasis = state.calculationCriteria?.label === 'Annual Volume Basis' || state.calculationCriteria?.label === 'Returnable Packaging Cost';
                    const isMaintenanceCost = item.TypeOfCost === 'Maintenance(Cost of crate/trolley)';

                    let costApplicable = 0;
                    if (isBinOrPolymerCalculation) {
                        costApplicable = costOfCrate;
                    } else if (isAnnualVolumeBasis) {
                        costApplicable = isMaintenanceCost ? costOfCrate : totalCostOfCrate;
                    }

                    // Only update if we have valid numbers
                    if (!isNaN(costApplicable) && !isNaN(item.CostPercentage)) {
                        newNetCost = costApplicable * (parseFloat(item.CostPercentage) / 100);
                        newNetCost = checkForDecimalAndNull(newNetCost, NoOfDecimalForPrice);
                    }
                } catch (error) {
                    console.error('Error updating table item:', error);
                    // Keep original value if calculation fails
                    return item;
                }
            }

            return {
                ...item,
                NetCost: newNetCost
            };
        }) || [];
    
        // Update state with safety check
        setState(prevState => ({
            ...prevState,
            IsPerPart: explicitIsPerPart !== null ? explicitIsPerPart : prevState.IsPerPart,
            totalCostOfCrate,
            totalCostOfSpacerPackingInsert: costOfSpacerPackingInsert,
            packingCost: packagingCost,
            gridTable: updatedGridTable || prevState.gridTable // Fallback to previous table if update fails
        }));
    
        // Update form values
        if (state.isVolumeAutoCalculate) {
            setValuePackaging('NoOfCratesRequiredPerDay', checkForDecimalAndNull(noOfCratesRequired, NoOfDecimalForInputOutput));
            setState(prev => ({
                ...prev,
                noOfCratesRequiredPerDay: noOfCratesRequired
            }));
        }
        setValuePackaging('TotalCostOfCrate', checkForDecimalAndNull(totalCostOfCrate, NoOfDecimalForPrice));
        setValuePackaging('TotalCostOfSpacerPackingInsert', checkForDecimalAndNull(costOfSpacerPackingInsert, NoOfDecimalForPrice));
        setValuePackaging('PackingCost', checkForDecimalAndNull(packagingCost, NoOfDecimalForPrice));
    
        // Call updateTotalCostOfCrateWithAddedCost after updating totalCostOfCrate
        setTimeout(() => {
            updateTotalCostOfCrateWithAddedCost();
        }, 0);
    };
    const handleSpacerPackingInsertCost = (value) => {
        calculateSpacerPackingInsertRecoveryCost(value, getValuesPackaging('NoOfSpacerPackingInsert'), getValuesPackaging('SpacerPackingInsertRecovery'))
    }
    const handleNoOfSpacerPackingInsert = (value) => {
        calculateSpacerPackingInsertRecoveryCost(getValuesPackaging('SpacerPackingInsertCost'), value, getValuesPackaging('SpacerPackingInsertRecovery'))
    }
    const handleSpacerPackingInsertRecovery = (value) => {
        calculateSpacerPackingInsertRecoveryCost(getValuesPackaging('SpacerPackingInsertCost'), getValuesPackaging('NoOfSpacerPackingInsert'), value)
    }
    // Fix the handleNoOfPartsPerCoverChange function to properly update the calculation
    const handleNoOfPartsPerCoverChange = (value) => {
        // First check if we have all necessary values to perform calculation
        const spacerCost = getValuesPackaging('SpacerPackingInsertCost');
        const noOfSpacerInsert = getValuesPackaging('NoOfSpacerPackingInsert');
        const spacerRecovery = getValuesPackaging('SpacerPackingInsertRecovery');

        // If we have the necessary values and we're in Per Part Mode, recalculate
        if (spacerCost && noOfSpacerInsert && state.IsPerPart) {
            calculateSpacerPackingInsertRecoveryCost(spacerCost, noOfSpacerInsert, spacerRecovery, value);
        }

        // Always recalculate all values after updating NoOfPartsPerCover
        // This is important for the final packaging cost calculation
        setTimeout(() => {
            calculateAllValues();
        }, 0);
    }

    // Fix the calculateSpacerPackingInsertRecoveryCost function to properly handle partsPerCover
    const calculateSpacerPackingInsertRecoveryCost = (spacerCost, noOfSpacerInsert, spacerRecovery, partsPerCover) => {

        // Convert input values to numbers
        spacerCost = checkForNull(spacerCost);
        noOfSpacerInsert = checkForNull(noOfSpacerInsert);
        spacerRecovery = checkForNull(spacerRecovery || 0);

        // Calculate recovery cost
        const recoveryCost = spacerCost * noOfSpacerInsert * (spacerRecovery / 100);

        // Update the recovery cost in the form
        setValuePackaging('SpacerPackingInsertRecoveryCostPerKg', checkForDecimalAndNull(recoveryCost, NoOfDecimalForPrice));

        // Get the number of parts per cover - prioritize the passed parameter value
        const noOfPartsPerCover = checkForNull(partsPerCover || getValuesPackaging('NoOfPartsPerCover'));

        // Base calculation without recovery cost
        const baseCalculation = spacerCost * noOfSpacerInsert - recoveryCost;

        // Calculate total cost differently based on IsPerPart
        let totalCost;


        // Check if we're in Per Part Mode AND the calculation criteria is either Bin/Trolley or Non Returnable
        if (state.IsPerPart &&
            (state.calculationCriteria?.label === 'Non-returnable packaging') &&
            noOfPartsPerCover > 0) {
            // In per-part mode, divide by NoOfPartsPerCover
            totalCost = baseCalculation / noOfPartsPerCover;

        } else {
            // In default mode, just use the standard calculation
            totalCost = baseCalculation;
        }
        setTimeout(() => {
            // Update the total cost in the form
            setValuePackaging('TotalCostOfSpacerPackingInsert', checkForDecimalAndNull(totalCost, NoOfDecimalForPrice));
        }, 200);


        // Update state
        setState((prevState) => ({
            ...prevState,
            spacerPackingInsertRecoveryCostPerKg: recoveryCost,
            totalCostOfSpacerPackingInsert: totalCost
        }));

        // Return the calculated values for potential further use
        return { recoveryCost, totalCost };
    }

    const handlePerPartModeToggle = () => {
        const newPerPartMode = !state.IsPerPart;
        calculateAllValues(newPerPartMode);
    };

   

    // Create a separate function to update totalCostOfCrateWithAddedCost
    const updateTotalCostOfCrateWithAddedCost = () => {
        const totalAddedCost = state.gridTable?.reduce((sum, item) => {
            return sum + Number(item.NetCost || 0);
        }, 0);

        let totalCostOfCrateWithAddedCost = 0;
        let cost = state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost"
            ? state.totalCostOfCrate
            : checkForNull(getValuesPackaging('CostOfCrate'));

        if (state?.calculationCriteria?.label === 'Bin/Trolley Life Basis' || state?.calculationCriteria?.label === 'Non-returnable packaging') {
            totalCostOfCrateWithAddedCost = (cost + totalAddedCost) * checkForNull(getValuesPackaging('StockNormDays'));
        } else if (state.calculationCriteria?.label === 'Annual Volume Basis' || state.calculationCriteria?.label === "Returnable Packaging Cost") {
            totalCostOfCrateWithAddedCost = cost + totalAddedCost;
        } else {
            totalCostOfCrateWithAddedCost = totalAddedCost;
        }

        setValuePackaging('TotalCostOfCrateWithAddedCost', checkForDecimalAndNull(totalCostOfCrateWithAddedCost, NoOfDecimalForPrice));
        setState(prev => ({
            ...prev,
            totalCostOfCrateWithAddedCost,
            totalAddedCost: totalAddedCost
        }));
    };

    const onSubmit = debounce((value) => {
        setState((prevState) => ({ ...prevState, disableSubmit: true }))
        let formData = {
            "CostingPackagingCalculationDetailsId": rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.CostingPackagingCalculationDetailsId : props?.costingPackagingCalculationDetailsId ?? null,
            "CostingPackagingDetailsId": rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.PackagingDetailId : null,
            "BaseCostingId": costingData?.CostingId,
            "LoggedInUserId": loggedInUserId(),
            "NoOfComponentsPerCrate": value?.NoOfComponentsPerCrate,
            "VolumePerDay": state?.volumePerDay,
            "VolumePerAnnum": state?.volumePerAnnum,
            "NoOfCratesRequiredPerDay": state?.noOfCratesRequiredPerDay,
            "StockNormDays": value?.StockNormDays,
            "CostOfCrate": value?.CostOfCrate,
            "TotalCostOfCrate": state?.totalCostOfCrate,
            "AmortizedNoOfYears": value?.AmortizedNoOfYears,
            "WeightOfCoverPerKg": value?.WeightOfCover,
            "CostOfCoverPerKg": value?.CostOfCoverPerKg,
            "NoOfPartsPerCover": value?.NoOfPartsPerCover,
            "SpacerPackingInsertCostIfAny": value?.SpacerPackingInsertCost,
            "NoOfSpacersPackingInsert": value?.NoOfSpacerPackingInsert,
            "SpacersPackingInsertRecoveryPercentage": value?.SpacerPackingInsertRecovery,
            "SpacersPackingInsertRecoveryCostPerKg": state?.spacerPackingInsertRecoveryCostPerKg,
            "CostOfSpacersPackingInsert": state?.totalCostOfSpacerPackingInsert,
            "PackingCost": state?.packingCost,
            "TotalCostOfCrateWithAddedCost": state?.totalCostOfCrateWithAddedCost,
            "NetAddedCost": state?.totalAddedCost,
            "PackagingAddedCosts": state?.gridTable,
            "CalculationCriteria": state?.calculationCriteria?.label,
            "IsFetchVolumeFromMaster": state?.isVolumeAutoCalculate,
            "IsPerPart": state?.IsPerPart
        }
            ;
        if (!isSubmitting.current) {
            isSubmitting.current = true;
            dispatch(savePackagingCalculation(formData, (res) => {
                if (res?.data?.Result) {
                    setState((prevState) => ({ ...prevState, disableSubmit: false }))
                    formData.CalculationId = res?.data?.Identity
                    Toaster.success("Calculation saved successfully")
                    props.closeCalculator(formData.CalculationId, state?.packingCost, 'Save')
                }
            }))
        }
    }, 500)
    const cancelHandler = () => {
        props.closeCalculator(props?.costingPackagingCalculationDetailsId, '', 'Cancel')
    }
    const fieldProps = {
        control: controlCost,
        register: registerCost,
        errors: errorsCost,
        disabled: CostingViewMode ? CostingViewMode : false,
        colSize: '3'
    }
    const editGridItemDetails = (index) => {
        setState(prev => ({
            ...prev,
            isEditIndex: true,
            typeOfCost: { label: state?.gridTable[index].TypeOfCost, value: state?.gridTable[index].TypeOfCost },
            costPercentage: state?.gridTable[index].CostPercentage,
            cost: state?.gridTable[index].NetCost,
            editIndex: index
        }));
        setValueCost('typeOfCost', { label: state?.gridTable[index].TypeOfCost, value: state?.gridTable[index].TypeOfCost })
        setValueCost('costPercentage', state?.gridTable[index].CostPercentage)
        setValueCost('cost', state?.gridTable[index].NetCost)
    }
    const deleteGridItem = (index) => {
        const updatedGrid = state.gridTable.filter((_, i) => i !== index);
        setState(prev => ({
            ...prev,
            gridTable: updatedGrid,
            isEditIndex: false,
            editIndex: ''
        }));
    }
    const resetFormFields = () => {
        // Reset form state
        setState(prev => ({
            ...prev,
            isEditIndex: false,
            typeOfCost: '',
            costPercentage: '',
            cost: '',
            editIndex: ''
        }));

        // Use the standard reset method instead of accessing internal _reset
        const defaultValues = {
            typeOfCost: '',
            costPercentage: '',
            cost: ''
        };

        // Clear form values using the proper reset method
        reset(defaultValues);
    }
    const addData = () => {
        // Validate required fields
        let hasError = false;

        if (!state.typeOfCost?.label) {
            hasError = true;
        }

        if (state.typeOfCost?.label === 'Fixed') {
            if (!getValuesCost('cost')) {
                hasError = true;
            }
        } else {
            if (!getValuesCost('costPercentage')) {
                hasError = true;
            }
            // Don't validate cost field since it's auto-calculated
        }

        if (hasError) {
            Toaster.warning('Please fill all mandatory fields.');
            return false;
        }

        const newData = {
            TypeOfCost: state.typeOfCost?.label,
            CostPercentage: getValuesCost('costPercentage'),
            NetCost: getValuesCost('cost')
        };

        let isDuplicate = false;
        state?.gridTable?.map((item, index) => {
            if (index !== state.editIndex) {
                if ((item?.TypeOfCost) === (state.typeOfCost?.label)) {
                    isDuplicate = true;
                }
            }
            return null;
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        if (state.isEditIndex) {
            const updatedTableData = [...state.gridTable];
            updatedTableData[state.editIndex] = newData;
            setState(prev => ({
                ...prev,
                gridTable: updatedTableData,
                isEditIndex: false,
                editIndex: ''
            }));
        } else {
            setState(prev => ({
                ...prev,
                gridTable: [...state.gridTable, newData]
            }));
        }

        resetFormFields();
    };
    const onPressAutoCalculateVolume = () => {
        setState((prev) => ({ ...prev, isVolumeAutoCalculate: !prev.isVolumeAutoCalculate }))
        resetValues(true)
    }
    return (
        <Drawer anchor={props.anchor} open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        >
            <Container>
                <div className={`drawer-wrapper layout-min-width-860px`}>
                    {state?.loader && <LoaderCustom customClass="packaging-calculator-drawer-loader" />}
                    <Row className="drawer-heading">
                        <Col>
                            <div className={'header-wrapper left'}>
                                <h3>Packaging Calculator</h3>
                            </div>
                            <div
                                onClick={(e) => cancelHandler(e)}
                                className={'close-button right'}
                            ></div>
                        </Col>
                    </Row>
                    <Row>
                        <form>
                            <Row className="packaging-cost-calculator-warpper">
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Calculation Criteria`}
                                        name={'CalculationCriteria'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={controlPackaging}
                                        register={registerPackaging}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                        }}
                                        options={renderListing('calculationCriteria')}
                                        handleChange={handleCalculationCriteriaChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errorsPackaging.CalculationCriteria}
                                        disabled={state.disableFields || CostingViewMode}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' })}
                                        name={'NoOfComponentsPerCrate'}
                                        Controller={Controller}
                                        control={controlPackaging}
                                        register={registerPackaging}
                                        rules={{
                                            required: true,
                                            validate: { number, decimalNumberLimit8And7 },
                                        }}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errorsPackaging.NoOfComponentsPerCrate}
                                        disabled={CostingViewMode}
                                    />
                                </Col>
                                {(state.calculationCriteria?.label === "Annual Volume Basis" || state.calculationCriteria?.label === "Returnable Packaging Cost") && <Col md="3">
                                    <div className="mt40">
                                        <span className="d-inline-block mt15">
                                            <label
                                                className={`custom-checkbox mb-0`}
                                                onChange={onPressAutoCalculateVolume}
                                            >
                                                Auto Calculate Volume ?
                                                <input
                                                    type="checkbox"
                                                    checked={state.isVolumeAutoCalculate}
                                                    disabled={CostingViewMode}
                                                />
                                                <span
                                                    className=" before-box"
                                                    checked={state.isVolumeAutoCalculate}
                                                    onChange={onPressAutoCalculateVolume}
                                                />
                                            </label>
                                        </span>
                                    </div>
                                </Col>}
                                {packagingCalculatorSection1.map(item => {
                                    const { tooltip, name, label } = item ?? {};
                                    return <Col md="3" key={name}>
                                        {item.tooltip && item.disabled === true && <TooltipCustom
                                            customClass={tooltip.customClass ?? ''}
                                            width={tooltip.width}
                                            tooltipClass={tooltip.className ?? ''}
                                            disabledIcon={tooltip?.disabledIcon ?? false}
                                            id={item?.name}
                                            tooltipText={!tooltip?.disabledIcon ? tooltip.text : `${item.label} = ${tooltip.text ?? ''}`}
                                        />}
                                        <TextFieldHookForm
                                            label={label}
                                            id={tooltip?.disabledIcon ? item?.name : `nonTarget${item?.name}`}
                                            name={name}
                                            Controller={Controller}
                                            control={controlPackaging}
                                            register={registerPackaging}
                                            mandatory={item.mandatory}
                                            rules={{
                                                required: item.mandatory,
                                                validate: { number, decimalNumberLimit8And7, checkWhiteSpaces, ...(item.disabled ? {} : {}) },
                                                max: item.percentageLimit ? {
                                                    value: 100,
                                                    message: 'Percentage value should be equal to 100'
                                                } : {},
                                            }}
                                            handleChange={item.handleChange ? item.handleChange : () => { }}
                                            defaultValue={item.disabled ? 0 : ''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errorsPackaging[name]}
                                            disabled={
                                                item.disabled ||
                                                (state.gridTable.length > 0 &&
                                                    (name === 'NoOfComponentsPerCrate' ||
                                                        name === 'StockNormDays' ||
                                                        name === 'CostOfCrate' ||
                                                        state?.calculationCriteria))
                                            } />
                                    </Col>
                                })}
                            </Row>
                            <Row className="packaging-cost-calculator-warpper">
                                <form>
                                    <Col md="12">
                                        <div className="left-border">
                                            {"Cost:"}
                                        </div>
                                    </Col>
                                    <Row >
                                        <FormFieldsRenderer
                                            fieldProps={fieldProps}
                                            fields={tableFields}
                                        >
                                            <Col md="3">
                                                <div>
                                                    <button type="button" className="user-btn pull-left mt-5 mr-2" disabled={CostingViewMode} onClick={handleSubmitCost(addData)}>{state.isEditIndex ? 'Update' : 'Add'}</button>
                                                    <button type="button" className="reset-btn pull-left mt-5" disabled={CostingViewMode} onClick={resetFormFields}>Reset</button>
                                                </div>
                                            </Col>
                                        </FormFieldsRenderer>
                                    </Row>
                                    <Row>
                                        <Col md="12 mt-3">
                                            <Table className="table border" size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>{`Type of Cost`}</th>
                                                        <th>{`Cost (%)`}</th>
                                                        <th>{`Cost`}</th>
                                                        <th>{`Action`}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {state.gridTable?.length > 0 &&
                                                        state.gridTable?.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{item?.TypeOfCost ?? '-'}</td>
                                                                    <td>{!item?.CostPercentage ? '-' : item?.CostPercentage}</td>
                                                                    <td>{!item?.NetCost ? '-' : item?.NetCost}</td>
                                                                    <td>
                                                                        <button className="Edit mr-2" type={"button"} disabled={CostingViewMode} onClick={() => editGridItemDetails(index)} />
                                                                        <button className="Delete" type={"button"} disabled={CostingViewMode} onClick={() => deleteGridItem(index)} />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    {state.gridTable?.length === 0 &&
                                                        <tr>
                                                            <td colSpan={"5"}> <NoContentFound title={EMPTY_DATA} /></td>
                                                        </tr>

                                                    }
                                                    <tr className='table-footer'>
                                                        <td colSpan={2} className="text-right font-weight-600 fw-bold">{'Additional Cost:'}</td>

                                                        <td colSpan={3} className="text-left">
                                                            {checkForDecimalAndNull(state?.totalAddedCost, NoOfDecimalForPrice)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                                </form>
                            </Row>
                            <Row className="packaging-cost-calculator-warpper">
                                {packagingCalculatorSection2.map((item, index) => {
                                    const { tooltip, name, label } = item ?? {};

                                    // Add switch after SpacerPackingInsertRecoveryCostPerKg and before TotalCostOfSpacerPackingInsert
                                    const insertToggleAfter = name === 'SpacerPackingInsertRecoveryCostPerKg';


                                    return (
                                        <React.Fragment key={name}>
                                            <Col md="3">
                                                {item.tooltip && <TooltipCustom
                                                    customClass={tooltip.customClass ?? ''}
                                                    width={tooltip.width}
                                                    tooltipClass={tooltip.className ?? ''}
                                                    disabledIcon={tooltip?.disabledIcon ?? false}
                                                    id={item?.name}
                                                    tooltipText={!tooltip?.disabledIcon ? tooltip.text : `${item.label} = ${tooltip.text ?? ''}`}
                                                />}
                                                <TextFieldHookForm
                                                    label={label}
                                                    id={tooltip?.disabledIcon ? item?.name : `nonTarget${item?.name}`}
                                                    name={name}
                                                    Controller={Controller}
                                                    control={controlPackaging}
                                                    register={registerPackaging}
                                                    mandatory={item.mandatory}
                                                    rules={{
                                                        required: item.mandatory,
                                                        validate: { number, decimalNumberLimit8And7, checkWhiteSpaces, ...(item.disabled ? {} : {}) },
                                                        max: item.percentageLimit ? {
                                                            value: 100,
                                                            message: 'Percentage value should be equal to 100'
                                                        } : {},
                                                    }}
                                                    handleChange={item.handleChange ? item.handleChange : () => { }}
                                                    defaultValue={item.disabled ? 0 : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errorsPackaging[name]}
                                                    disabled={
                                                        item.disabled ||
                                                        (state.gridTable.length > 0 &&
                                                            (name === 'NoOfComponentsPerCrate' ||
                                                                name === 'StockNormDays' ||
                                                                name === 'CostOfCrate'))
                                                    } />
                                            </Col>

                                            {/* Insert toggle switch after TotalCostOfSpacerPackingInsert field */}
                                            {insertToggleAfter && (state.calculationCriteria?.label === "Non-returnable packaging") && (
                                                <Col md="12" className="switch mb15 mt-3">
                                                    <label className="switch-level">
                                                        <div className="left-title">Default</div>
                                                        <Switch
                                                            onChange={handlePerPartModeToggle}
                                                            checked={state.IsPerPart}
                                                            id="per-part-mode-switch"
                                                            disabled={CostingViewMode}
                                                            background="#4DC771"
                                                            onColor="#4DC771"
                                                            onHandleColor="#ffffff"
                                                            offColor="#4DC771"
                                                            uncheckedIcon={false}
                                                            checkedIcon={false}
                                                            height={20}
                                                            width={46}
                                                        />
                                                        <div className="right-title">Per Part Mode</div>
                                                    </label>
                                                </Col>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </Row>
                            <Row className={"sticky-footer pr-0"}>
                                <Col md="12" className={"text-right bluefooter-butn d-flex align-items-center justify-content-end"}>
                                    <Button
                                        id="packagingCalculator_cancel"
                                        className="mr-2"
                                        variant={"cancel-btn"}
                                        disabled={false}
                                        onClick={cancelHandler}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"} />
                                    {!CostingViewMode && <Button
                                        id="packagingCalculator_submit"
                                        type="submit"
                                        onClick={handleSubmitPackaging(onSubmit)}
                                        disabled={CostingViewMode || state?.disableSubmit}
                                        icon={"save-icon"}
                                        buttonName={"Save"} />}
                                </Col>
                            </Row>
                        </form>
                    </Row>

                </div>
            </Container>
        </Drawer>
    )
}
export default PackagingCalculator
