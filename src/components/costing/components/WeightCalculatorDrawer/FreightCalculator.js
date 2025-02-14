import React, { useContext, useEffect, useRef, useState } from 'react'
import { Row, Col, Container, } from 'reactstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { number, checkWhiteSpaces, maxLength7, checkForNull, checkForDecimalAndNull, loggedInUserId } from '../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../common/Toaster'
import TooltipCustom from '../../../common/Tooltip'
import Button from '../../../layout/Button'
import { TextFieldHookForm } from '../../../layout/HookFormInputs'
import { getCarrierTypeList, getFreightCalculation, getPackagingCalculation, getSimulationPackagingCalculation, getVolumePerDayForPackagingCalculator, saveFreightCalculation, savePackagingCalculation } from '../../actions/CostWorking'
import { Drawer } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { ViewCostingContext } from '../CostingDetails'
import { FullTruckLoad } from '../../../../config/constants'
import FormFieldsRenderer from '../../../common/FormFieldsRenderer'
import HeaderTitle from '../../../common/HeaderTitle'
import LoaderCustom from '../../../common/LoaderCustom'
function FreightCalculator(props) {
    const { rowObjData, truckDimensions, freightType, noOfComponentsPerCrate, rate } = props
    const [state, setState] = useState({
        carrierType: [],
        isShowAlignment: false,
        binAlignment: null,
        trolleyAlignment: null,
        hideUtilization: false,
        truckLength: 0,
        truckBreadth: 0,
        truckHeight: 0,
        noOfBins: 0,
        noOfTrolleys: 0,
        noOfBinsPerTrolley: 0,
        totalNoOfBins: 0,
        noOfbinOrTrolleypertruck: 0,
        totalCost: 0,
        isLoader: false
    })
    const { costingData } = useSelector(state => state.costing)
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const costingViewMode = useContext(ViewCostingContext);
    const CostingViewMode = costingViewMode ?? props?.CostingViewMode
    const carrierTypeList = useSelector(state => state.costWorking.carrierTypeList)
    const FreightCalculationId = rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.CostingFreightCalculationDetailsId : props?.costingFreightCalculationDetailsId ?? null
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const { t } = useTranslation('CostingLabels');
    const lengthWarningRef = useRef(false);
    const breadthWarningRef = useRef(false);
    const heightWarningRef = useRef(false);
    const dimensionsFieldsValues = useWatch({
        control: control,
        name: ['BinLength', 'BinBreadth', 'BinHeight', 'TrolleyLength', 'TrolleyBreadth', 'TrolleyHeight'],
        defaultValue: []
    })
    const showWarning = (message) => {
        Toaster.warning(message);
    };

    useEffect(() => {
        const binLength = checkForNull(getValues("BinLength"));
        const binBreadth = checkForNull(getValues("BinBreadth"));
        const binHeight = checkForNull(getValues("BinHeight"));
        const trolleyLength = checkForNull(getValues("TrolleyLength"));
        const trolleyBreadth = checkForNull(getValues("TrolleyBreadth"));
        const trolleyHeight = checkForNull(getValues("TrolleyHeight"));

        let warningMessage = "";

        // **Length Validation**
        if (trolleyLength && state.truckLength && trolleyLength > state.truckLength) {
            if (!lengthWarningRef.current) {
                warningMessage = "Trolley length cannot be greater than truck length";
                lengthWarningRef.current = true;
            }
        } else if (binLength && (trolleyLength || state.truckLength) && binLength > (trolleyLength || state.truckLength)) {
            if (!lengthWarningRef.current) {
                warningMessage = `Bin length cannot be greater than ${state?.carrierType?.label === 'Bin And Trolley' ? 'truck/trolley' : 'truck'} length`;
                lengthWarningRef.current = true;
            }
        } else {
            lengthWarningRef.current = false; // Reset if no warning
        }

        // **Breadth Validation**
        if (trolleyBreadth && state.truckBreadth && trolleyBreadth > state.truckBreadth) {
            if (!breadthWarningRef.current) {
                warningMessage = "Trolley breadth cannot be greater than truck breadth";
                breadthWarningRef.current = true;
            }
        } else if (binBreadth && (trolleyBreadth || state.truckBreadth) && binBreadth > (trolleyBreadth || state.truckBreadth)) {
            if (!breadthWarningRef.current) {
                warningMessage = `Bin breadth cannot be greater than ${state?.carrierType?.label === 'Bin And Trolley' ? 'truck/trolley' : 'truck'} breadth`;
                breadthWarningRef.current = true;
            }
        } else {
            breadthWarningRef.current = false; // Reset if no warning
        }

        // **Height Validation**
        if (trolleyHeight && state.truckHeight && trolleyHeight > state.truckHeight) {
            if (!heightWarningRef.current) {
                warningMessage = "Trolley height cannot be greater than truck height";
                heightWarningRef.current = true;
            }
        } else if (binHeight && (trolleyHeight || state.truckHeight) && binHeight > (trolleyHeight || state.truckHeight)) {
            if (!heightWarningRef.current) {
                warningMessage = `Bin height cannot be greater than ${state?.carrierType?.label === 'Bin And Trolley' ? 'truck/trolley' : 'truck'} height`;
                heightWarningRef.current = true;
            }
        } else {
            heightWarningRef.current = false; // Reset if no warning
        }

        // **Show the warning message (only one at a time)**
        if (warningMessage) {
            showWarning(warningMessage);
        } else {
            // **Reset state if no warnings**
            setState((prevState) => ({
                ...prevState,
                warningShown: false,
                binWarningShown: false,
            }));
        }
    }, [dimensionsFieldsValues, state.truckLength, state.truckBreadth, state.truckHeight]);

    useEffect(() => {
        dispatch(getCarrierTypeList(res => { }))
        setValue('TruckDimensions', truckDimensions?.label)
        if(!costingViewMode){
            setValue('NoOfComponentsPerBinOrTrolley', noOfComponentsPerCrate)
            setValue('TripRate', rate)
        }
        if (truckDimensions?.label) {
            const dimensions = truckDimensions?.label?.match(/L\((\d+)\),\s*B\((\d+)\),\s*H\((\d+)\)/);
            if (dimensions) {
                setState(prevState => ({
                    ...prevState,
                    truckLength: parseFloat(dimensions[1]),
                    truckBreadth: parseFloat(dimensions[2]),
                    truckHeight: parseFloat(dimensions[3])
                }))
            }
        }
        if (freightType === FullTruckLoad) {
            setValue('Utilization', 100)
            setState(prevState => ({
                ...prevState,
                hideUtilization: true
            }))
        } else {
            setState(prevState => ({
                ...prevState,
                hideUtilization: false
            }))
        }
        const tempData = rowObjData?.SimulationTempData
        const costingId = costingData?.CostingId ?? tempData.find(item => item?.CostingHeading === "Old Costing")?.costingId
        let calculatorId = FreightCalculationId
        let freightDetailId = rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.FreightDetailId : null
        if(calculatorId!==null){
            setState(prevState => ({
                ...prevState,
                isLoader: true
            }))
            dispatch(getFreightCalculation(costingId, freightDetailId, calculatorId, (res) => {
                let data = res?.data?.Data
                setState(prevState => ({
                    ...prevState,
                    isLoader: false
                }))
                setFormValues(data)

            }))
        }
    }, [])
    const calclulationFieldValues = useWatch({
        control: control, 
        name: ['Utilization'],
        defaultValue: [] 
    })
    useEffect(() => {
        calculateTotalCost()
    }, [state.noOfBins, state.totalNoOfBins, calclulationFieldValues,state.noOfTrolleys])
    const setFormValues = (data) => {
        setValue('CarrierType', data?.CarrierType?{label: data?.CarrierType, value: data?.CarrierTypeId}:[])
        setValue('TrolleyLength', checkForDecimalAndNull(data?.TrolleyLength, NoOfDecimalForInputOutput))
        setValue('TrolleyBreadth', checkForDecimalAndNull(data?.TrolleyBreadth, NoOfDecimalForInputOutput))
        setValue('TrolleyHeight', checkForDecimalAndNull(data?.TrolleyHeight, NoOfDecimalForInputOutput))
        setValue('BinLength', checkForDecimalAndNull(data?.BinLength, NoOfDecimalForInputOutput))
        setValue('BinBreadth', checkForDecimalAndNull(data?.BinBreadth, NoOfDecimalForInputOutput))
        setValue('BinHeight', checkForDecimalAndNull(data?.BinHeight, NoOfDecimalForInputOutput))
        setValue('BinAlignment', {label: data?.BinAlignment, value: data?.BinAlignment})
        setValue('TrolleyAlignment', {label: data?.TrolleyAlignment, value: data?.TrolleyAlignment})
        setValue('NoOfTrolleys', checkForDecimalAndNull(data?.NumberOfTrolleys, NoOfDecimalForInputOutput))
        setValue('NoOfBins', data?.NumberOfBins)
        setValue('NoOfBinsPerTrolley', checkForDecimalAndNull(data?.NoOfBinPerTrolley, NoOfDecimalForInputOutput))
        setValue('TotalNoOfBins', checkForDecimalAndNull(data?.NumberOfBins, NoOfDecimalForInputOutput))
        setValue('NoOfBinsRequiredPerVehicle', data?.NumberOfPartsPerBinOrTrolleyPerVehicle)
        setValue('Utilization', freightType === FullTruckLoad ? 100 : checkForDecimalAndNull(data?.Utilization, NoOfDecimalForInputOutput))
        setState(prevState => ({
            ...prevState,
            carrierType: {label: data?.CarrierType, value: data?.CarrierTypeId},
            isShowAlignment: data?.IsAlignment,
            binAlignment: data?.BinAlignment,
            trolleyAlignment: data?.TrolleyAlignment,
            noOfBins: data?.NumberOfBins,
            noOfTrolleys: data?.NumberOfTrolleys,
            noOfBinsPerTrolley: data?.NoOfBinsPerTrolley,
            totalNoOfBins: data?.NumberOfBins,
            noOfbinOrTrolleypertruck: data?.NumberOfPartsPerBinOrTrolleyPerVehicle,
            totalCost: data?.TotalCost,
            hideUtilization: freightType === FullTruckLoad ? true : false
        }))
        if (CostingViewMode) {
            setValue('TotalCost', checkForDecimalAndNull(data?.TotalCost, NoOfDecimalForPrice))
            setValue('NoOfComponentsPerBinOrTrolley', data?.NumberOfPartsPerBinOrTrolley)
            setValue('TripRate', checkForDecimalAndNull(data?.TripRate, NoOfDecimalForPrice))
            setState(prevState => ({
                ...prevState,
                noOfComponentsPerBinOrTrolley: data?.NoOfComponentsPerBinOrTrolley,
                tripRate: data?.TripRate
            }))
        }
        
    }
    /**
* @method renderListing
* @description Used to show type of listing
*/
    const renderListing = (label) => {
        const temp = [];

        if (label === 'CarrierType') {
            carrierTypeList && carrierTypeList.map((item) => {
                temp.push({ label: item?.Text, value: item?.Value });
                return null;
            });
            return temp;
        }
        if (label === 'Alignment') {
            return [{ label: 'Horizontal', value: 1 }, { label: 'Vertical', value: 2 }]
        }
    };

    const handleCarrierTypeChange = (e) => {
        setState(prevState => ({
            ...prevState,
            carrierType: e
        }))
        setValue('TrolleyLength', '')
        setValue('TrolleyBreadth', '')
        setValue('TrolleyHeight', '')
        setValue('BinLength', '')
        setValue('BinBreadth', '')
        setValue('BinHeight', '')
    }

    const onSubmit = (value) => {

        let formData = {
            "BaseCostingId": costingData?.CostingId,
            "BinAlignment": state?.binAlignment,
            "BinBreadth": checkForNull(getValues('BinBreadth')),
            "BinHeight": checkForNull(getValues('BinHeight')),
            "BinLength": checkForNull(getValues('BinLength')),
            "CarrierType": state?.carrierType?.label,
            "CostingFreightCalculationDetailsId": rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.CostingFreightCalculationDetailsId : props?.CostingFreightCalculationDetailsId ?? null,
            "CostingFreightDetailsId": rowObjData && Object.keys(rowObjData).length > 0 ? rowObjData?.CostingFreightDetailsId : null,
            "IsAlignment": state?.isShowAlignment,
            "LoggedInUserId": loggedInUserId(),
            "NoOfBinPerTrolley": state?.noOfBinsPerTrolley,
            "NumberOfBins": state?.carrierType?.label === 'Bin' ? state?.noOfBins : state?.totalNoOfBins,
            "NumberOfPartsPerBinOrTrolley": noOfComponentsPerCrate,
            "NumberOfPartsPerBinOrTrolleyPerVehicle": state?.noOfbinOrTrolleypertruck,
            "NumberOfTrolleys": state?.noOfTrolleys,
            "TotalCost": state?.totalCost,
            "TripRate": rate,
            "TrolleyAlignment": state?.carrierType?.label === 'Bin' ? null : state?.trolleyAlignment,
            "TrolleyBreadth": checkForNull(getValues('TrolleyBreadth')),
            "TrolleyHeight": checkForNull(getValues('TrolleyHeight')),
            "TrolleyLength": checkForNull(getValues('TrolleyLength')),

            "Utilization": checkForNull(getValues('Utilization'))
        }
        dispatch(saveFreightCalculation(formData, (res) => {
            if (res?.data?.Result) {
                formData.CalculationId = res?.data?.Identity
                Toaster.success("Calculation saved successfully")
                props.closeCalculator(formData, state?.totalCost)
            }
        }))
    }
    const cancelHandler = () => {
            props.closeCalculator('',FreightCalculationId!==null?state?.totalCost : '')
    }
    const onShowAlignment = () => {
        setState(prevState => ({
            ...prevState,
            isShowAlignment: !prevState.isShowAlignment
        }))
    }
    const calculateBinsAndTrolleys = (alignmentType, alignmentValue) => {
        const binLength = checkForNull(getValues('BinLength'))
        const binBreadth = checkForNull(getValues('BinBreadth'))
        const binHeight = checkForNull(getValues('BinHeight'))
        const trolleyLength = checkForNull(getValues('TrolleyLength'))
        const trolleyBreadth = checkForNull(getValues('TrolleyBreadth'))
        const trolleyHeight = checkForNull(getValues('TrolleyHeight'))
        const truckLength = checkForNull(state.truckLength)
        const truckBreadth = checkForNull(state.truckBreadth)
        const truckHeight = checkForNull(state.truckHeight)

        let noOfBins = 0
        let noOfTrolleys = 0
        let noOfBinsPerTrolley = 0
        let totalNoOfBins = 0

        // Calculate bins per trolley based on alignments
        const calculateBinsPerTrolley = (binAlign) => {
            if (binAlign === 'Horizontal') {
                return parseInt(trolleyLength / binBreadth) * parseInt(trolleyBreadth / binLength) * parseInt(trolleyHeight / binHeight)
            } else {
                return parseInt(trolleyLength / binLength) * parseInt(trolleyBreadth / binBreadth) * parseInt(trolleyHeight / binHeight)
            }
        }

        switch (alignmentType) {
            case 'bin':
                if (state?.carrierType?.label === 'Bin And Trolley') {
                    noOfBinsPerTrolley = calculateBinsPerTrolley(alignmentValue)
                }
                if (alignmentValue === 'Horizontal') {
                    noOfBins = parseInt(truckLength / binBreadth) * parseInt(truckBreadth / binLength) * parseInt(truckHeight / binHeight)
                } else {
                    noOfBins = parseInt(truckLength / binLength) * parseInt(truckBreadth / binBreadth) * parseInt(truckHeight / binHeight)
                }
                // Calculate total bins based on trolleys and bins per trolley
                totalNoOfBins = state.noOfTrolleys * noOfBinsPerTrolley
                setValue('NoOfBins', checkForDecimalAndNull(noOfBins, NoOfDecimalForInputOutput))
                setValue('NoOfBinsPerTrolley', checkForDecimalAndNull(noOfBinsPerTrolley, NoOfDecimalForInputOutput))
                setValue('TotalNoOfBins', checkForDecimalAndNull(totalNoOfBins, NoOfDecimalForInputOutput))
                setState(prevState => ({
                    ...prevState,
                    noOfBins: noOfBins,
                    noOfBinsPerTrolley: noOfBinsPerTrolley,
                    totalNoOfBins: totalNoOfBins,
                    binAlignment: alignmentValue
                }))
                break;

            case 'trolley':
                if (alignmentValue === "Horizontal") {
                    noOfTrolleys = parseInt(truckLength / trolleyBreadth) * parseInt(truckBreadth / trolleyLength) * parseInt(truckHeight / trolleyHeight)
                } else {
                    noOfTrolleys = parseInt(truckLength / trolleyLength) * parseInt(truckBreadth / trolleyBreadth) * parseInt(truckHeight / trolleyHeight)
                }

                if (state?.carrierType?.label === 'Bin And Trolley') {
                    noOfBinsPerTrolley = calculateBinsPerTrolley(state?.binAlignment)
                }

                // Calculate total bins based on trolleys and bins per trolley
                totalNoOfBins = noOfTrolleys * noOfBinsPerTrolley
                setValue('NoOfTrolleys', checkForDecimalAndNull(noOfTrolleys, NoOfDecimalForInputOutput))
                setValue('NoOfBinsPerTrolley', checkForDecimalAndNull(noOfBinsPerTrolley, NoOfDecimalForInputOutput))
                setValue('TotalNoOfBins', checkForDecimalAndNull(totalNoOfBins, NoOfDecimalForInputOutput))
                setState(prevState => ({
                    ...prevState,
                    noOfTrolleys,
                    noOfBinsPerTrolley,
                    totalNoOfBins,
                    trolleyAlignment: alignmentValue
                }))
                break;

            default:
                break;
        }
    }
    const calculateTotalCost = () => {
        const utilization = checkForNull(getValues('Utilization'))
        const noOfComponentsPerBinOrTrolley = checkForNull(noOfComponentsPerCrate)
        const totalNoOfBins = state?.carrierType?.label === 'Bin And Trolley' ? checkForNull(state.totalNoOfBins) : state?.carrierType?.label === 'Bin' ? checkForNull(state.noOfBins) : checkForNull(state.noOfTrolleys)
        console.log(state.noOfTrolleys,'state.noOfTrolleys')
        const noOfbinOrTrolleypertruck = checkForNull(totalNoOfBins * utilization) / 100
        const totalCost = rate / (noOfComponentsPerBinOrTrolley * noOfbinOrTrolleypertruck)
        setValue('NoOfBinsRequiredPerVehicle', checkForDecimalAndNull(noOfbinOrTrolleypertruck, NoOfDecimalForInputOutput))
        setValue('TotalCost', checkForDecimalAndNull(totalCost, NoOfDecimalForPrice))
        setState(prevState => ({
            ...prevState,
            noOfbinOrTrolleypertruck,
            totalCost
        }))
    }

    const handleBinAlignmentChange = (e) => {
        setState(prevState => ({
            ...prevState,
            binAlignment: e?.label
        }))
        calculateBinsAndTrolleys('bin', e?.label)
    }

    const handleTrolleyAlignmentChange = (e) => {
        setState(prevState => ({
            ...prevState,
            trolleyAlignment: e?.label
        }))
        calculateBinsAndTrolleys('trolley', e?.label)
    }
    const fieldProps = {
        control: control,
        register: register,
        errors: errors,
    }
    const dimensionAndCarrierType = [
        { label: t('truckDimensions', { defaultValue: 'Truck Dimensions (mm)' }), name: 'TruckDimensions', mandatory: false, searchable: false, disabled: true },
        { label: t('carrierType', { defaultValue: 'Carrier Type' }), name: 'CarrierType', handleChange: handleCarrierTypeChange, options: renderListing('CarrierType'), searchable: true, mandatory: true, disabled: CostingViewMode ? CostingViewMode : false, },
    ]
    const binDimensionFields = [
        {
            label: t('length', { defaultValue: 'Length (mm)' }),
            name: 'BinLength',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('BinLength', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('breadth', { defaultValue: 'Breadth (mm)' }),
            name: 'BinBreadth',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('BinBreadth', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('height', { defaultValue: 'Height (mm)' }),
            name: 'BinHeight',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('BinHeight', e.target.value);
            },
            defaultValue: 0
        }
    ];
    const trolleyDimensionFields = [
        {
            label: t('length', { defaultValue: 'Length (mm)' }),
            name: 'TrolleyLength',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('TrolleyLength', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('breadth', { defaultValue: 'Breadth (mm)' }),
            name: 'TrolleyBreadth',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('TrolleyBreadth', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('height', { defaultValue: 'Height (mm)' }),
            name: 'TrolleyHeight',
            mandatory: true,
            disabled: CostingViewMode ? CostingViewMode : false ,
            handleChange: (e) => {
                setValue('TrolleyHeight', e.target.value);
            },
            defaultValue: 0
        }
    ]
    const alignmentFields = [
        ...(state.carrierType?.label === 'Trolley' || state.carrierType?.label === "Bin And Trolley" ? [
            { label: t('trolleyAlignment', { defaultValue: 'Trolley Alignment' }), name: 'TrolleyAlignment', options: renderListing('Alignment'), handleChange: handleTrolleyAlignmentChange, mandatory: true, searchable: true, disabled: CostingViewMode ? CostingViewMode : false }
        ] : []),
        ...(state.carrierType?.label === 'Bin' || state.carrierType?.label === "Bin And Trolley" ? [
            { label: t('binAlignment', { defaultValue: 'Bin Alignment' }), name: 'BinAlignment', options: renderListing('Alignment'), handleChange: handleBinAlignmentChange, mandatory: true, searchable: true, disabled: CostingViewMode ? CostingViewMode : false }
        ] : []),
        ...(state.carrierType?.label === 'Trolley' || state.carrierType?.label === "Bin And Trolley" ? [
            { label: t('noOfTrolleys', { defaultValue: 'No. of trolleys' }), name: 'NoOfTrolleys', mandatory: true, searchable: false, disabled: true,tooltip: { text:`No. of trolleys = (Truck Length / Trolley ${state.trolleyAlignment === 'Horizontal' ? 'Breadth' : 'Length'}) * (Truck Breadth / Trolley ${state.trolleyAlignment === 'Horizontal' ? 'Length' : 'Breadth'}) * (Truck Height / Trolley Height)`, width: '250px',disabledIcon: true } }
        ] : []),
        ...(state.carrierType?.label === 'Bin' ? [
            { label: t('noOfBins', { defaultValue: 'No. of bins' }), name: 'NoOfBins', mandatory: true, searchable: false, disabled: true,tooltip: { text:`No. of bins = (Truck Length / ${state.binAlignment === 'Horizontal' ? 'Bin Breadth' : 'Bin Length'}) * (Truck Breadth / ${state.binAlignment === 'Horizontal' ? 'Bin Length' : 'Bin Breadth'}) * (Truck Height / Bin Height)`, width: '250px',disabledIcon: true } }
        ] : []),
        ...(state.carrierType?.label === "Bin And Trolley" ? [
            { label: t('noOfBinsPerTrolley', { defaultValue: 'No. of bins per trolley' }), name: 'NoOfBinsPerTrolley', mandatory: true, searchable: false, disabled: true,tooltip: { text:`No. of bins per trolley = (Trolley Length / Bin ${state.binAlignment === 'Horizontal' ? 'Breadth' : 'Length'}) * (Trolley Breadth / Bin ${state.binAlignment === 'Horizontal' ? 'Length' : 'Breadth'}) * (Trolley Height / Bin Height)`, width: '250px',disabledIcon: true } }
        ] : []),
        ...(state.carrierType?.label === "Bin And Trolley" ? [
            { label: t('totalNoOfBins', { defaultValue: 'Total no. of bins' }), name: 'TotalNoOfBins', mandatory: true, searchable: false, disabled: true,tooltip: { text:'Total no. of bins = No. of trolleys * No. of bins per trolley', width: '250px',disabledIcon: true } }
        ] : []),
        { label: t('noOfComponentsPerBinOrTrolley', { defaultValue: 'No. of components per bin/trolley' }), name: 'NoOfComponentsPerBinOrTrolley', mandatory: true, searchable: false, disabled: true,tooltip: { text:'Coming from packaging calculator(No. of components per crate/trolley)', width: '250px',disabledIcon: true } },
        { label: t('utilization', { defaultValue: 'Utilization (%)' }), name: 'Utilization', percentageLimit: true, mandatory: true, searchable: false, disabled: (state.hideUtilization||CostingViewMode) },
        { label: t('noOfBinsorTrolleysPerTruck', { defaultValue: 'No. of Bins/Trolleys per truck' }), name: 'NoOfBinsRequiredPerVehicle', mandatory: false, searchable: false, disabled: true,tooltip: { text:`No. of bins/trolleys per truck = (${state.carrierType?.label === "Bin And Trolley" ? 'Total no. of bins' : 'No. of bins'} * Utilization)/100`, width: '250px',disabledIcon: true } },
        { label: t('tripRate', { defaultValue: 'Trip rate' }), name: 'TripRate', mandatory: false, searchable: false, disabled: true,tooltip: { text:'Coming from freight master', width: '250px',disabledIcon: true } },
        { label: t('totalCost', { defaultValue: 'Total cost' }), name: 'TotalCost', mandatory: false, searchable: false, disabled: true,tooltip: { text:`Total cost = Trip rate / (No. of components per bin/trolley * No. of bins/trolleys per truck)`, width: '250px',disabledIcon: true } },
    ]
    return (
        <Drawer anchor={props.anchor} open={props.isOpen}
        >
            {state.isLoader && <LoaderCustom customClass={"loader-center"} />}
            <Container>
                <div className={`drawer-wrapper layout-min-width-860px`}>
                    <Row className="drawer-heading">
                        <Col>
                            <div className={'header-wrapper left'}>
                                <h3>Freight Calculator</h3>
                            </div>
                            <div
                                onClick={cancelHandler}
                                className={'close-button right'}
                            ></div>
                        </Col>
                    </Row>
                    <Row>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="freight-cost-calculator-warpper">
                                <FormFieldsRenderer
                                    fieldProps={fieldProps}
                                    fields={dimensionAndCarrierType}
                                />
                            </Row>
                            {(state.carrierType?.label === 'Trolley' || state.carrierType?.label === "Bin And Trolley") && <Row>
                                <Col md="12" className={'mt25'}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Trolley Dimension'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormFieldsRenderer
                                        fieldProps={fieldProps}
                                        fields={trolleyDimensionFields}
                                        truckLength={state.truckLength}
                                        truckBreadth={state.truckBreadth}
                                        truckHeight={state.truckHeight}
                                        fromCalculator={true}
                                        getFormValues={getValues}
                                        isTrolley={true}
                                    />
                                </Col>
                            </Row>}
                            {(state.carrierType?.label === 'Bin' || state.carrierType?.label === "Bin And Trolley") && <Row>
                                <Col md="12" className={'mt25'}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Bin Dimension'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                                <Col md="12">
                                    <FormFieldsRenderer
                                        fieldProps={fieldProps}
                                        fields={binDimensionFields}
                                        truckLength={state.truckLength}
                                        truckBreadth={state.truckBreadth}
                                        truckHeight={state.truckHeight}
                                        fromCalculator={true}
                                        getFormValues={getValues}
                                        isBin={true}
                                    />
                                </Col>
                            </Row>}
                            <Row>
                                <Col md="12" className='mt-2'>
                                    <label id="AddFreight_TruckDimensions"
                                        className={`custom-checkbox w-auto mb-0 mt-4 `}
                                        onChange={onShowAlignment}
                                    >
                                        Alignment
                                        <input
                                            type="checkbox"
                                            checked={state.isShowAlignment}
                                            disabled={CostingViewMode ? CostingViewMode : false}
                                        />
                                        <span
                                            className=" before-box p-0"
                                            checked={state.isShowAlignment}
                                            onChange={onShowAlignment}
                                        />
                                    </label>
                                </Col>
                            </Row>
                            {state.isShowAlignment && <Row>
                                <Col md="12" className='mt-2'>
                                    <FormFieldsRenderer
                                        fieldProps={fieldProps}
                                        fields={alignmentFields}
                                    />
                                </Col>
                            </Row>}
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
                                        disabled={CostingViewMode}
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
export default FreightCalculator