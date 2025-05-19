import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useDispatch, useSelector } from 'react-redux'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, checkWhiteSpaces, decimalNumberLimit6, getCostValues, hashValidation, maxLength80, number, percentageLimitValidation } from '../../../../../helper'
import Toaster from '../../../../common/Toaster'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import NoContentFound from '../../../../common/NoContentFound'
import { CC, COSTINGSURFACETREATMENTEXTRACOST, EMPTY_DATA, HANGER, HANGEROVERHEAD, PAINT, PART_COST, PART_COST_CC, RM, RMCC, SURFACETREATMENTLABEL, TAPE, TAPEANDPAINT, WACTypeId } from '../../../../../config/constants'
import { generateCombinations, getCostingConditionTypes } from '../../../../common/CommonFunctions'
import { getCostingCondition } from '../../../../../actions/Common'
// import { setSurfaceData } from '../../../actions/Costing'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { ViewCostingContext } from '../../CostingDetails'
import TooltipCustom from '../../../../common/Tooltip'
import { IdForMultiTechnology } from '../../../../../config/masterData'

function ExtraCost(props) {
    const { setSurfaceData, item, extraCostDetails } = props
    const initialConfiguration = useSelector((state) => state?.auth?.initialConfiguration)
    const { RMCCTabData } = useSelector(state => state.costing)
    const conditionTypeId = getCostingConditionTypes(COSTINGSURFACETREATMENTEXTRACOST)
    const costData = useContext(costingInfoContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const dispatch = useDispatch();


    let surfaceCostingPartDetails = item?.CostingPartDetails
    const { rmBasicRate, RowData, RowIndex, hangerCostDetails, paintAndMaskingDetails, surfaceCost } = props
    const [tableData, setTableData] = useState(extraCostDetails?.TransportationDetails ?? []);

    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState(extraCostDetails?.TransportationCost ?? 0)
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableCurrency, setDisableCurrency] = useState(false)
    const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
    const ExchangeRate = RowData?.ExchangeRate
    const [state, setState] = useState({
        Applicability: false,
        tableData: [],
        disableApplicability: true,
        premiumCost: '',
        disableCostCurrency: false,
        disableCostBaseCurrency: false,
        applicabilityDropdown: [],
        ApplicabilityCost: 0,
    })
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)



    useEffect(() => {
        let tempData = [...tableData]
        const costValues = getCostValues(item, costData, subAssemblyTechnologyArray);
        const { rawMaterialsCost, conversionCost, netpartCost } = costValues;
        console.log("costValues", costValues)
        tempData.map(item => {
            if (item?.CostingConditionMasterId) {
                // Get cost values once for all cases that need them

                switch (item?.CostingConditionNumber) {
                    case TAPEANDPAINT:
                        item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
                        item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.TotalPaintCost), item?.Rate)
                        break;
                    case HANGER:
                        item.ApplicabiltyCost = checkForNull(hangerCostDetails?.HangerCostPerPart)
                        item.TransportationCost = calculatePercentageValue(checkForNull(hangerCostDetails?.HangerCostPerPart), item?.Rate)
                        break;
                    case SURFACETREATMENTLABEL:
                        item.ApplicabiltyCost = checkForNull(surfaceCost)
                        item.TransportationCost = calculatePercentageValue(checkForNull(surfaceCost), item?.Rate)
                        break;
                    case TAPE:
                        item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.TapeCost)
                        item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.TapeCost), item?.Rate)
                        break;
                    case PAINT:
                        item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.PaintCost)
                        item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.PaintCost), item?.Rate)
                        break;
                    case RMCC:
                        item.ApplicabiltyCost = checkForNull(rawMaterialsCost) + checkForNull(conversionCost);
                        item.TransportationCost = calculatePercentageValue((checkForNull(rawMaterialsCost) + checkForNull(conversionCost)), item?.Rate);
                        break;
                    case RM:
                        console.log("rawMaterialsCost", rawMaterialsCost)
                        item.ApplicabiltyCost = checkForNull(rawMaterialsCost);
                        item.TransportationCost = calculatePercentageValue(checkForNull(rawMaterialsCost), item?.Rate);
                        break;
                    case CC:
                        item.ApplicabiltyCost = checkForNull(conversionCost);
                        item.TransportationCost = calculatePercentageValue(checkForNull(conversionCost), item?.Rate);
                        break;
                    case PART_COST:
                        item.ApplicabiltyCost = checkForNull(netpartCost);
                        item.TransportationCost = calculatePercentageValue(checkForNull(netpartCost), item?.Rate);
                        break;
                    case PART_COST_CC:
                        item.ApplicabiltyCost = checkForNull(netpartCost) + checkForNull(conversionCost);
                        item.TransportationCost = calculatePercentageValue((checkForNull(netpartCost) + checkForNull(conversionCost)), item?.Rate);
                        break;
                    default:
                        // No action for unknown condition types
                        break;
                }
            }
        })
        setTableData(tempData);
        // Calculate total cost from all transportation costs in table data
        const totalCost = tempData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
    }, [surfaceCostingPartDetails]);

    useEffect(() => {
        if (!CostingViewMode) {
            // Check if the technology ID is included in IdForMultiTechnology
            const isRequestForMultiTechnology = IdForMultiTechnology.includes(String(costData?.TechnologyId))
            dispatch(getCostingCondition('', conditionTypeId, isRequestForMultiTechnology, (res) => {
                if (res?.data?.DataList) {
                    const temp = res?.data?.DataList?.map((item) => ({
                        label: item?.CostingConditionNumber,
                        value: item?.CostingConditionMasterId,
                    }));
                    setState((prevState) => ({
                        ...prevState,
                        applicabilityDropdown: temp
                    }));
                }
            }));
        }
    }, [])
    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            handleDelete(indexValue);
        } else if (operation === 'edit') {
            handleEdit(indexValue);
        }
    }

    const handleEdit = (indexValue) => {
        setEditIndex(indexValue);
        setIsEditMode(true);
        let selectedData = tableData[indexValue];
        const typeValue = { label: selectedData?.UOM, value: selectedData?.UOM };
        setType(typeValue);
        setValue('Type', typeValue);
        if (selectedData?.UOM === 'Percentage') {
            setValue('Applicability', { label: selectedData?.CostingConditionNumber, value: selectedData?.CostingConditionMasterId })
            setValue('ApplicabilityCost', checkForDecimalAndNull(selectedData?.ApplicabiltyCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('Percentage', checkForDecimalAndNull(selectedData?.Rate, initialConfiguration?.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, ApplicabilityCost: selectedData?.ApplicabiltyCost }))
        } else if (selectedData?.UOM === "Hanger Overhead") {
            const hangerType = { label: "Hanger Overhead", value: "Hanger Overhead" };
            setType(hangerType);
            setValue('Type', hangerType);
            setValue('Quantity', selectedData?.Quantity)
            setValue('Rate', selectedData?.Rate)
            setValue('NetCost', selectedData?.TransportationCost)
            setState(prevState => ({ ...prevState, ApplicabilityCost: selectedData?.TransportationCost }))
        }
        else {
            const fixedType = { label: 'Fixed', value: 'Fixed' };
            setType(fixedType);
            setValue('Type', fixedType);
            setState(prevState => ({ ...prevState, ApplicabilityCost: selectedData?.TransportationCost }))
        }
        setValue('CostDescription', selectedData?.Description)
        setValue('Remark', selectedData?.Remark)
        setValue('NetCost', checkForDecimalAndNull(selectedData?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice))

        // Update UI state based on the type
        if (selectedData?.Type === 'Fixed') {
            setDisableTotalCost(false);
            setDisableCurrency(false);
            setDisableAllFields(true);
        } else {
            setState(prevState => ({ ...prevState, disableApplicability: false }));
        }
    };

    const handleDelete = (indexValue) => {
        let updatedData = tableData.filter((_, index) => index !== indexValue);
        const totalCost = updatedData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
        setTableData(updatedData);
        resetData();
    };

    const editDeleteData = (indexValue, operation) => {
        editData(indexValue, operation)
    }

    const { register, control, setValue, getValues, handleSubmit, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const toggleCondition = () => {
        let cssClass = '';
        if (type?.label === "Percentage" || type?.label === HANGEROVERHEAD) {
            cssClass = 'mt-4 pt-1';
        } else {
            cssClass = 'mb-3 mt-n3';
        }
        return cssClass
    }

    const applicabilityChange = (e) => {
        setState(prevState => ({ ...prevState, Applicability: e?.label }));
        // Get cost values once for all cases that need them
        const costValues = getCostValues(item, costData, subAssemblyTechnologyArray);
        const { rawMaterialsCost, conversionCost, netpartCost } = costValues;
        console.log("costValuesAPPLICABILITY", costValues)

        // Handle Basic Rate separately
        switch (e?.label) {
            case TAPE:
                setValue('ApplicabilityCost', checkForDecimalAndNull(paintAndMaskingDetails?.TapeCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: paintAndMaskingDetails?.TapeCost }));
                break;
            case SURFACETREATMENTLABEL:
                setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCost }));
                break;
            case PAINT:
                setValue('ApplicabilityCost', checkForDecimalAndNull(paintAndMaskingDetails?.PaintCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: paintAndMaskingDetails?.PaintCost }));
                break;
            case TAPEANDPAINT:
                setValue('ApplicabilityCost', checkForDecimalAndNull(paintAndMaskingDetails?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: paintAndMaskingDetails?.TotalPaintCost }));
                break;
            case HANGER:
                setValue('ApplicabilityCost', checkForDecimalAndNull(hangerCostDetails?.HangerCostPerPart, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: hangerCostDetails?.HangerCostPerPart }));
                break;
            case RM:
                console.log("rawMaterialsCostAPPLICABILITY22", rawMaterialsCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(rawMaterialsCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: rawMaterialsCost }));
                break;
            case CC:
                setValue('ApplicabilityCost', checkForDecimalAndNull(conversionCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: conversionCost }));
                break;
            case RMCC:
                let totalCost = checkForNull(rawMaterialsCost) + checkForNull(conversionCost);
                setValue('ApplicabilityCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: totalCost }));
                break;
            case PART_COST:
                setValue('ApplicabilityCost', checkForDecimalAndNull(netpartCost, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: netpartCost }));
                break;
            case PART_COST_CC:
                let partCostTotal = checkForNull(netpartCost) + checkForNull(conversionCost);
                setValue('ApplicabilityCost', checkForDecimalAndNull(partCostTotal, initialConfiguration?.NoOfDecimalForPrice));
                setState(prevState => ({ ...prevState, ApplicabilityCost: partCostTotal }));
                break;
            default:
                // No action for unknown condition types
                break;
        }
    }

    const onPercentChange = (e) => {
        const storeValue = checkForNull(e?.target?.value)
        const calculateValue = (storeValue / 100) * checkForNull(state?.ApplicabilityCost)
        setValue('NetCost', checkForDecimalAndNull(calculateValue, initialConfiguration?.NoOfDecimalForPrice))
    }

    const cancel = () => {
        props.closeDrawer('Cancel', tableData, totalCostCurrency, totalCostBase, RowIndex)
    }

    const handleCostChangeBase = (e) => {
        if (e?.target?.value) {
            setValue('CostCurrency', checkForDecimalAndNull((checkForNull(e?.target?.value) / ExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, disableCostCurrency: true }));
        } else {
            setValue('CostCurrency', '')
            setState(prevState => ({ ...prevState, disableCostCurrency: false }));
        }
    }

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        if (label === 'Type') {
            return [
                { label: "Percentage", value: "Percentage" },
                { label: "Fixed", value: 'Fixed' },
                { label: HANGEROVERHEAD, value: HANGEROVERHEAD }
            ]
        }
        return [];
    }

    const onSubmit = data => {

        // Check if NetCost is 0 or empty
        if (!data?.NetCost || Number(data?.NetCost) === 0) {
            Toaster.warning('Cost cannot be zero. Please enter a valid value.');
            return;
        }

        // Check if Applicability already exists in tableData (regardless of description)
        // During edit mode, exclude the current row being edited from duplicate check
        const existingCondition = tableData?.find((item, index) =>
            item.CostingConditionMasterId === data?.Applicability?.value &&
            (isEditMode ? index !== editIndex : true)
        );

        if (existingCondition) {
            Toaster.warning('This applicability is already added in the table');
            return;
        }

        if (isEditMode) {
            let tempData = [...tableData];
            let obj = {
                JsonStage: item?.JsonStage ?? null,
                PartNumber: item?.PartNumber ?? null,
                PartName: item?.PartName ?? null,
                TransportationDetailId: null,
                UOM: type?.label ?? null,
                Rate: type?.label === 'Percentage' ? data?.Percentage : data?.Rate ?? null,
                TransportationCost: data?.NetCost ?? null,
                TransportationCRMHead: "",
                Quantity: data?.Quantity ?? null,
                Description: data?.CostDescription ?? null,
                ApplicabiltyCost: data?.ApplicabilityCost ?? null,
                Remark: data?.Remark ?? null,
                CostingConditionMasterId: data?.Applicability && data?.Applicability?.value ? data?.Applicability?.value : null,
                CostingConditionNumber: data?.Applicability && data?.Applicability?.label ? data?.Applicability?.label : null
            }
            tempData[editIndex] = obj;
            setTableData(tempData);
            // Calculate total cost from all transportation costs in table data
            const totalCost = tempData.reduce((sum, item) => {
                return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
            }, 0);
            setTotalCostCurrency(totalCost);
            resetData();
            return;
        }

        const existingFixedDescription = tableData.find(item =>
            (item.Description.toLowerCase() === data?.CostDescription.toLowerCase() && item.UOM === type?.label)
        );
        if ((type?.label === 'Fixed' || type?.label === HANGEROVERHEAD) && existingFixedDescription) {
            Toaster.warning('Data already exists');
            return;
        }
        let tempData = [...tableData]
        let obj = {
            JsonStage: item?.JsonStage ?? null,
            PartNumber: item?.PartNumber ?? null,
            PartName: item?.PartName ?? null,
            TransportationDetailId: null,
            UOM: type?.label ?? null,
            Rate: type?.label === 'Percentage' ? data?.Percentage : data?.Rate ?? null,
            Quantity: data?.Quantity ?? null,
            TransportationCost: data?.NetCost ?? null,
            TransportationCRMHead: "",
            Description: data?.CostDescription ?? null,
            ApplicabiltyCost: data?.ApplicabilityCost ?? null,
            Remark: data?.Remark ?? null,
            CostingConditionMasterId: data?.Applicability && data?.Applicability?.value ? data?.Applicability?.value : null,
            CostingConditionNumber: data?.Applicability && data?.Applicability?.label ? data?.Applicability?.label : null
        }
        tempData.push(obj)
        setTableData(tempData)
        // Calculate total cost from all transportation costs in table data
        const totalCost = tempData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
        resetData();
    }
    const handleRateChange = (e) => {
        const storeValue = checkForNull(e?.target?.value)
        const calculateValue = storeValue / hangerCostDetails?.NumberOfPartsPerHanger
        setValue('NetCost', checkForDecimalAndNull(calculateValue, initialConfiguration?.NoOfDecimalForPrice))
    }
    const resetData = (type = '') => {
        setDisableAllFields(true);
        setDisableTotalCost(true);
        setType('');
        setEditIndex('');
        setIsEditMode(false)
        reset({
            Type: '',
            Percentage: '',
            NetCost: '',
            CostDescription: '',
            Remark: '',
            ApplicabilityCost: '',
            Applicability: '',
        });
    };

    const saveExtraCost = () => {
        // let newData = [...SurfaceTabData];
        // newData.map(item => {
        //     if (item?.CostingId === costData?.CostingId) {
        //         let CostingPartDetails = item?.CostingPartDetails
        //         CostingPartDetails.TransportationDetails = tableData;
        //         CostingPartDetails.TransportationCost = totalCostCurrency;
        //     }
        //     return null;
        // })
        // 
        // dispatch(setSurfaceData(SurfaceTabData, () => { }))
        props.closeDrawer('Save', totalCostCurrency)
        setSurfaceData({ Params: { index: props.index }, extraCostObj: { TransportationDetails: tableData, TransportationCost: totalCostCurrency }, type: 'ExtraCost' }, errors)
    }

    const handleType = (type) => {
        if (type && type !== '') {
            setType(type);
            setValue('CostDescription', '')
            setValue('NetCost', '')
            setValue('Percentage', '')
            setValue('Applicability', '')
            setValue('ApplicabilityCost', '')
            setValue('Remark', '')
            if (type?.label === "Percentage") {
                setState(prevState => ({ ...prevState, disableApplicability: false }));
                setValue('Quantity', '')
            } else if (type?.label === HANGEROVERHEAD) {
                setValue('Quantity', hangerCostDetails?.NumberOfPartsPerHanger)
                setValue('Rate', '')
            } else {
                setState(prevState => ({ ...prevState, disableApplicability: true }));
                setValue('Quantity', '')
            }
        } else {
            setType('');
        }
    }

    return (
        <div>
            <Drawer anchor={props?.anchor} open={props?.isOpen}>
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>
                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Other Cost:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='hidepage-size'>
                                    {!IsLocked && <Row>
                                        <Col md={3} className='px-2'>
                                            <SearchableSelectHookForm
                                                label={`Type`}
                                                name={'Type'}
                                                placeholder={'Select'}
                                                rules={{ required: true, }}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                options={renderListing('Type')}
                                                handleChange={handleType}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors?.Type}
                                                disabled={CostingViewMode || isEditMode}
                                            />
                                        </Col>
                                        <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label="Cost Description"
                                                name={"CostDescription"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { checkWhiteSpaces, hashValidation, maxLength80 },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors?.CostDescription}
                                                disabled={CostingViewMode}
                                            />
                                        </Col>

                                        {
                                            type?.label === 'Percentage' &&
                                            <>
                                                <Col md="3" className='px-2'>
                                                    <SearchableSelectHookForm
                                                        label={`Applicability`}
                                                        name={'Applicability'}
                                                        placeholder={'Select'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{ required: true, }}
                                                        options={state?.applicabilityDropdown}
                                                        handleChange={applicabilityChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.Applicability}
                                                        disabled={false}
                                                    />
                                                </Col>

                                                <Col md={3} className={'px-2'}>
                                                    <TextFieldHookForm
                                                        label={`Applicability Cost`}
                                                        name={'ApplicabilityCost'}
                                                        id={'cost-by-percent'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.ApplicabilityCost}
                                                        disabled={CostingViewMode || disableTotalCost || disableCurrency}
                                                    />
                                                </Col>
                                                <Col md={3} className='px-2'>
                                                    <TextFieldHookForm
                                                        label={`Percentage (%)`}
                                                        name={'Percentage'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{
                                                            required: true,
                                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                            max: {
                                                                value: 100,
                                                                message: 'Percentage cannot be greater than 100'
                                                            },
                                                        }}
                                                        handleChange={onPercentChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.Percentage}
                                                        disabled={CostingViewMode}
                                                    />
                                                </Col>
                                            </>
                                        }
                                        {type?.label === HANGEROVERHEAD && <>
                                            <TooltipCustom
                                                id={`Quantity`}
                                                disabledIcon
                                                tooltipText={'Quantity is equavalent to the No. of Parts per Hanger'}
                                            />
                                            <Col md={3} className={'px-2'}>
                                                <TextFieldHookForm
                                                    label={`Quantity`}
                                                    name={'Quantity'}
                                                    id={'Quantity'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors?.Quantity}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md={3} className={'px-2'}>
                                                <TextFieldHookForm
                                                    label={`Rate`}
                                                    name={'Rate'}
                                                    id={'Rate'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                    }}
                                                    handleChange={handleRateChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors?.Rate}
                                                    disabled={CostingViewMode}
                                                />
                                            </Col>
                                        </>
                                        }
                                        <Col md={3} className={'px-2'}>
                                            <TooltipCustom
                                                id="NetCost"
                                                disabledIcon
                                                tooltipText={
                                                    <div>
                                                        Cost is calculated based on the selected type:<br />
                                                        • For Percentage: (Applicability Cost × Percentage ÷ 100)<br />
                                                        • For Hanger Overhead: (Rate ÷ Quantity)
                                                    </div>
                                                }
                                            />
                                            <TextFieldHookForm
                                                label={`Cost`}
                                                name={'NetCost'}
                                                id={'NetCost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={!(type?.label === 'Percentage' || type?.label === HANGEROVERHEAD)}
                                                rules={{
                                                    required: !(type?.label === 'Percentage' || type?.label === HANGEROVERHEAD),
                                                    validate: !(type?.label === 'Percentage' || type?.label === HANGEROVERHEAD) ? { number, checkWhiteSpaces, decimalNumberLimit6 } : {},
                                                }}
                                                handleChange={handleCostChangeBase}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors?.NetCost}
                                                disabled={(type?.label === 'Percentage' || type?.label === HANGEROVERHEAD) ? true : false || state?.disableCostBaseCurrency || CostingViewMode}
                                            />
                                        </Col>
                                        <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label="Remark"
                                                name={"Remark"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { checkWhiteSpaces, hashValidation, maxLength80 }
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors?.Remark}
                                                disabled={CostingViewMode}
                                            />
                                        </Col>
                                        <Col md="3" className={toggleCondition()}>
                                            <button
                                                type="submit"
                                                className={"user-btn  pull-left mt-1"}
                                                disabled={CostingViewMode || props?.disabled}
                                            >
                                                {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"reset-btn pull-left mt-1 ml5"}
                                                onClick={() => resetData("reset")}
                                                disabled={CostingViewMode || props?.disabled}
                                            >
                                                {isEditMode ? "CANCEL" : 'RESET'}
                                            </button>
                                        </Col>
                                    </Row>}
                                    <Col md={props?.hideAction ? 12 : 12}>
                                        <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`Type`}</th>
                                                    <th>{`Cost Description`}</th>
                                                    <th>{`Applicability`}</th>
                                                    <th>{`Applicability Cost`}</th>
                                                    <th>{`Quantity`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    <th>{`Rate`}</th>
                                                    <th>{`Cost`}</th>
                                                    <th>{`Remark`}</th>
                                                    {!props?.hideAction && !IsLocked && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item?.UOM ?? '-'}</td>
                                                            <td>{item?.Description ?? '-'}</td>
                                                            <td>{item?.CostingConditionNumber ?? '-'}</td>
                                                            <td>{item?.ApplicabiltyCost ? checkForDecimalAndNull(item?.ApplicabiltyCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.Quantity ? item?.Quantity : '-'}</td>
                                                            <td>{item?.UOM === 'Percentage' && item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.UOM === HANGEROVERHEAD && item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.TransportationCost !== '-' ? checkForDecimalAndNull(item?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.Remark ? item?.Remark : '-'}</td>
                                                            {
                                                                !props?.hideAction && !IsLocked && (
                                                                    <td>
                                                                        <div className='text-right'>
                                                                            <button title='Edit' className="Edit mr-1" type='button' onClick={() => editDeleteData(index, 'edit')} disabled={CostingViewMode} />
                                                                            <button title='Delete' className="Delete mr-1" type='button' onClick={() => editDeleteData(index, 'delete')} disabled={CostingViewMode} />
                                                                        </div>
                                                                    </td>
                                                                )
                                                            }
                                                        </tr>
                                                    </Fragment>
                                                ))}

                                                {
                                                    tableData && tableData.length === 0 && (
                                                        <tr>
                                                            <td colSpan="12">
                                                                <NoContentFound title={EMPTY_DATA} />
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                                <tr className='table-footer'>
                                                    <td colSpan={7} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                                                    <td colSpan={5}>{checkForDecimalAndNull(totalCostCurrency, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </div>
                                {!IsLocked && <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                    <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                        <button
                                            type={'button'}
                                            className="reset cancel-btn mr5"
                                            onClick={cancel || props?.disabled} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type={'button'}
                                            className="submit-button save-btn"
                                            onClick={() => saveExtraCost()}
                                            disabled={CostingViewMode || props?.disabled}
                                        >
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>}
                            </form>
                        </div>
                    </Container>
                </div>
            </Drawer>
        </div>
    )
}
export default React.memo(ExtraCost)