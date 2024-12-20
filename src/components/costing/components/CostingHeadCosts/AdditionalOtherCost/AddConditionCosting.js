import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import ConditionCosting from './ConditionCosting'
import { getCostingCondition } from '../../../../../actions/Common'
import Toaster from '../../../../common/Toaster'
import TooltipCustom from '../../../../common/Tooltip'
import { trim } from 'lodash'
import { generateCombinations, getCostingConditionTypes } from '../../../../common/CommonFunctions'
import { COSTINGCONDITIONCOST } from '../../../../../config/constants'
import { reactLocalStorage } from 'reactjs-localstorage'
import { ViewCostingContext } from '../../CostingDetails'

function AddConditionCosting(props) {
    const { currency, basicRateBase, isFromImport, isFromMaster, EntryType, PlantCurrency, isImpactedMaster = false } = props
    const [tableData, setTableData] = useState(props?.tableData)

    // const [tableData, setTableData] = useState([])
    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [conditionDropdown, setConditionDropdown] = useState([])
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState('')
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableBase, setDisableBase] = useState(false)
    const [disableCurrency, setDisableCurrency] = useState(false)
    const [disableEntryType, setDisableEntryType] = useState(false)
    const [costingConditionEntryType, setCostingConditionEntryType] = useState(props?.costingConditionEntryType)
    const [availableApplicabilities, setAvailableApplicabilities] = useState(["Basic Price"]);
    const [conditionCost, setConditionCost] = useState('');
    const [state, setState] = useState({
        Applicability: '',
        disableApplicability: true,
        disableType: true,
        ApplicabilityCost: 0
    })
    const conditionTypeId = getCostingConditionTypes(COSTINGCONDITIONCOST)
    const CostingViewMode = useContext(ViewCostingContext);

    const conditionEntryTypeDropdown = [
        {
            label: 'Domestic',
            value: 0,
        },
        {
            label: 'Import',
            value: 1,
        },
    ]
    const renderListing = (label) => {
        if (label === 'Type') {
            return [
                { label: "Percentage", value: "Percentage" },
                { label: "Fixed", value: 'Fixed' },
                { label: "Quantity", value: "Quantity" }
            ]
        }
        return [];
    }
    const { register, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const dispatch = useDispatch();
    const fieldValues = useWatch({
        control,
        name: ['Quantity', 'CostCurrency'],
    })

    useEffect(() => {
        if (tableData?.length === 0) {
            setDisableEntryType(false)
            setValue('ConditionEntryType', '')
        }
    }, [tableData]);
    useEffect(() => {
        dispatch(getCostingCondition(0, conditionTypeId, (res) => {
            if (res?.data?.DataList) {
                let Data = res?.data?.DataList
                let temp = []
                Data && Data.map((item) => {
                    item.label = ` ${item.Description} (${item.CostingConditionNumber})`
                    item.value = item.CostingConditionMasterId
                    temp.push(item)
                })
                setConditionDropdown(temp)
            }
        }))
    }, [props.isOpen]);

    useEffect(() => {
        const hasCostingConditionEntryTypeId = tableData?.some(item => item.CostingConditionEntryTypeId !== undefined);

        if (hasCostingConditionEntryTypeId || props.costingConditionEntryType !== undefined) {
            const conditionEntryTypeId = hasCostingConditionEntryTypeId ? tableData[0]?.CostingConditionEntryTypeId : props.costingConditionEntryType;
            const obj = conditionEntryTypeDropdown.find(item => item.value === conditionEntryTypeId);

            if (obj) {
                setValue('ConditionEntryType', obj);
                setDisableEntryType(true);
            }
        }

        if (hasCostingConditionEntryTypeId || props?.costingConditionEntryType !== undefined) {
            const entryTypeId =
                EntryType !== undefined
                    ? EntryType
                    : tableData[0]?.CostingConditionEntryTypeId !== undefined
                        ? tableData[0].CostingConditionEntryTypeId
                        : props?.costingConditionEntryType;

            dispatch(getCostingCondition(entryTypeId, conditionTypeId, (res) => {
                if (res?.data?.DataList) {
                    const temp = res.data.DataList.map(item => ({
                        label: `${item.Description} (${item.CostingConditionNumber})`,
                        value: item.CostingConditionMasterId,
                        CostingConditionMasterId: item.CostingConditionMasterId,
                        ConditionType: item.ConditionType
                    }));

                    setConditionDropdown(temp);
                }
            }));
        }
    }, []);

    useEffect(() => {
        calculateCostPerQuantity()

    }, [fieldValues])

    useEffect(() => {
        updateAvailableApplicabilities();
    }, [tableData, state.costDropdown]);

    const updateAvailableApplicabilities = () => {
        const newApplicabilities = ["Basic Price"];
        tableData.forEach(item => {
            if (item.Description !== "Basic Price" && !newApplicabilities.includes(item.Description)) {
                newApplicabilities.push(item.Description);
            }
        });
        setAvailableApplicabilities(newApplicabilities);
    };
    const combinations = generateCombinations(availableApplicabilities, "Basic Price");

    const toggleCondition = () => {
        // isFromImport ? type === 'Fixed' ? 'mb-3' : 'mt-4 pt-1' : type === 'Percentage' ? 'mb-3' : 'mt-4 pt-1'
        let cssClass = '';
        if (isFromImport) {
            if (type?.label === "") {
                cssClass = 'mb-3';
            } else if (type?.label === "Fixed") {
                cssClass = 'mb-3';
            } else {
                cssClass = 'mt-4 pt-1';
            }
        } else {
            if (type?.label === "") {
                cssClass = 'mb-3';
            } else if (type?.label === "Fixed") {
                cssClass = 'mb-3';
            } else {
                cssClass = 'mt-4 pt-1';
            }
            if (props.isFromMaster) {
                if (type?.label === "Percentage") {
                    cssClass = 'mb-3 mt-4 pt-1';
                } else {
                    cssClass = 'mt-4 pt-1';
                }
            }
        }
        return cssClass
    }
    const onConditionChange = (e, isType = false) => {
        setType({ label: e?.ConditionType, value: e?.ConditionType })
        setValue('Type', { label: e?.ConditionType, value: e?.ConditionType })
        setValue('Percentage', '')
        setValue('Quantity', '')
        setValue('CostCurrency', '')
        setValue('CostBase', '')
        setDisableEntryType(true)
        if (e?.ConditionType === 'Fixed' || e?.ConditionType === 'Quantity') {
            setDisableTotalCost(false)
            setDisableCurrency(false)
            setDisableBase(false)
            setDisableAllFields(true)
            setValue('Percentage', '')
            setState(prevState => ({ ...prevState, disableType: isType ? false : true }));
        } else if (e?.ConditionType === 'Percentage') {

            setState(prevState => ({ ...prevState, disableApplicability: false, disableType: isType ? false : true }));
            setDisableAllFields(false)
            setDisableTotalCost(true)
            setTotalCostCurrency('')
            setTotalCostBase('')
        } else {

            setState(prevState => ({ ...prevState, disableType: false }));
            setDisableAllFields(false)
            setDisableTotalCost(true)
            setTotalCostCurrency('')
            setTotalCostBase('')
        }
    }

    const onConditionEntryTypeChange = (e) => {
        if (e) {
            setCostingConditionEntryType(e.value)
            dispatch(getCostingCondition(e.value, conditionTypeId, (res) => {
                if (res?.data?.DataList) {
                    let Data = res?.data?.DataList
                    let temp = []
                    Data && Data.map((item) => {
                        item.label = ` ${item.Description} (${item.CostingConditionNumber})`
                        item.value = item.CostingConditionMasterId
                        temp.push(item)
                    })
                    setConditionDropdown(temp)
                }
            }))
        } else {
            setCostingConditionEntryType(props.costingConditionEntryType)
            setConditionDropdown([])
        }
    }

    const handleCostChangeCurrency = (e) => {
        errors.CostBase = {}
        if (e?.target?.value) {
            const costBase = checkForNull(e.target.value)
            setValue("CostBase", checkForDecimalAndNull(costBase, initialConfiguration?.NoOfDecimalForPrice))
            const ConditionCostPerQuantity = checkForNull(e.target.value) / checkForNull(getValues('Quantity'))
            setValue("ConditionCostPerQuantity", checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration?.NoOfDecimalForPrice))
            setDisableBase(true)
            setTotalCostCurrency(e.target.value)

            setTotalCostBase(costBase)
            setValue("ConditionCostPerQuantity", checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration?.NoOfDecimalForPrice))
            setDisableBase(true)
            setTotalCostCurrency(e.target.value)
            setTotalCostBase(costBase)
        } else {

            setValue("CostBase", '')
            setDisableBase(false)
            setTotalCostCurrency('')
            setTotalCostBase('')
        }
    }

    const onPercentChange = (e) => {
        if (e?.target?.value) {
            let costBase = checkForNull((e.target.value) / 100) * checkForNull(state.ApplicabilityCost)
            setValue('CostCurrency', checkForDecimalAndNull(costBase, initialConfiguration?.NoOfDecimalForPrice))
            setTotalCostCurrency(costBase)

            setTotalCostBase(costBase)
        } else {

            setValue('CostBase', '')
            setValue('CostCurrency', '')
            setTotalCostCurrency('')
            setTotalCostBase('')
        }
    }

    const cancel = () => {
        props.closeDrawer('close')
    }


    const addData = () => {
        const Applicability = getValues('Applicability')?.label
        const ApplicabilityCost = getValues('ApplicabilityCost')
        const Percentage = getValues('Percentage')
        if (type.label === "Percentage") {
            // If 'Type' is 'percentage', check for 'Applicability' and 'Percentage'
            if (!Applicability || !ApplicabilityCost || !Percentage || Percentage === 0) {
                Toaster.warning('Cost should not be zero or empty.');
                return false;
            }
        }
        if (!getValues('Type') || !getValues('Condition') || ((getValues('Type') === 'Fixed' || getValues('Type') === 'Quantity') && !getValues('CostCurrency')) || (getValues('Type') === 'Percentage' && !getValues('Percentage'))) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        if (errors.Percentage || errors.Quantity || errors.CostCurrency) return false;
        const newCondition = getValues('Condition') ? getValues('Condition') : null;

        const newData = {
            CostingConditionMasterId: newCondition ? newCondition.CostingConditionMasterId : '',
            ConditionNumber: newCondition ? newCondition.CostingConditionNumber : '',
            Description: newCondition ? newCondition.label : '',
            ConditionType: getValues('Type') ? getValues('Type')?.label : '',
            Percentage: getValues('Percentage') ? getValues('Percentage') : '',
            ConditionCost: totalCostCurrency ? totalCostCurrency : '',
            ConditionCostConversion: totalCostBase ? totalCostBase : '',
            ConditionCostPerQuantity: getValues('ConditionCostPerQuantity') ? getValues('ConditionCostPerQuantity') : '',
            ConditionQuantity: getValues('Quantity') ? getValues('Quantity') : '',
            ConditionCostPerQuantityConversion: getValues('CostPerQuantityConversion') ? getValues('CostPerQuantityConversion') : '',
            CostingConditionEntryTypeId: costingConditionEntryType,
            Applicability: Applicability,
            ApplicabilityCost: ApplicabilityCost
        };

        let isDuplicate = false
        tableData.map((item, index) => {
            if (index !== editIndex) {
                if (trim(item?.Description) === trim(newData?.Description)) {
                    isDuplicate = true
                }
            }
            return null
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        if (isEditMode) {
            const updatedTableData = [...tableData];
            updatedTableData[editIndex] = newData;
            setTableData(updatedTableData);
        } else {
            setTableData([...tableData, newData]);
        }

        resetData();
        setIsEditMode(false);
        setEditIndex('');

    };

    const resetData = (type = '') => {
        const commonReset = () => {
            setDisableAllFields(true);
            setDisableTotalCost(true);
            setTotalCostCurrency('');

            setTotalCostBase('');
            setType('');
            setEditIndex('');
            setIsEditMode(false)
            setState(prevState => ({ ...prevState, Applicability: '', ApplicabilityCost: 0, disableType: true }));
            reset({
                Condition: '',
                Type: '',
                Percentage: '',
                CostCurrency: '',
                CostBase: '',
                ConditionCostPerQuantity: '',
                Quantity: '',
                ConditionEntryType: type === 'reset' && tableData.length === 0 ? '' : undefined,
                ApplicabilityCost: '',
                Applicability: ''
            });
        };

        if (type === 'reset') {
            setDisableEntryType(tableData.length === 0 ? false : true);
            setCostingConditionEntryType(tableData.length === 0 ? '' : costingConditionEntryType);
        } else {
            setDisableEntryType(true);
        }

        commonReset();
    };

    // This function takes in two parameters - the index of the data being edited or deleted, and the operation to perform (either 'delete' or 'edit').
    const editData = (indexValue, operation, totalCostCurrency) => {


        // If the operation is 'delete', remove the data at the specified index from the tableData array.
        if (operation === 'delete') {
            let temp = [] // Create an empty array to hold the updated data
            tableData && tableData.map((item, index) => {
                if (index !== indexValue) { // If the index being iterated over is not the same as the index to delete, add the item to the temp array
                    temp.push(item)
                }
            })
            setTableData(temp) // Update the tableData state with the updated array
            resetData()
        }
        setConditionCost(totalCostCurrency)
        // If the operation is 'edit', set the editIndex state to the index of the data being edited, and set the isEditMode state to true.
        if (operation === 'edit') {
            setEditIndex(indexValue)
            setIsEditMode(true)

            // Retrieve the data at the specified index from the tableData array, and set the values of various form fields based on the data.
            let Data = tableData[indexValue]
            setDisableAllFields(false)
            setValue('Condition', {
                label: Data.Description, value: Data.ConditionNumber,
                CostingConditionMasterId: Data.CostingConditionMasterId, ConditionNumber: Data.ConditionNumber, ConditionType: Data.ConditionType
            })
            setValue('Type', { label: Data.ConditionType, value: Data.ConditionType })
            setValue('Percentage', checkForDecimalAndNull(Data.Percentage, initialConfiguration?.NoOfDecimalForPrice))
            setValue('CostCurrency', checkForDecimalAndNull(Data.ConditionCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('CostBase', checkForDecimalAndNull(Data.ConditionCostConversion, initialConfiguration?.NoOfDecimalForPrice))
            setValue('Quantity', Data.ConditionQuantity)
            setValue('Applicability', { label: Data.Applicability, value: Data.Applicability })
            setValue('ApplicabilityCost', Data?.ApplicabilityCost)
            setTotalCostCurrency(Data?.ConditionCost)

            setTotalCostBase(Data?.ConditionCostConversion)
            setCostingConditionEntryType(Data.CostingConditionEntryTypeId)
            setState(prevState => ({ ...prevState, ApplicabilityCost: Data?.ApplicabilityCost }));
            setType({ label: Data.ConditionType, value: Data.ConditionType })
            if (Data.ConditionType === 'Fixed' || Data.ConditionType === 'Quantity') {
                setDisableTotalCost(false)
                setDisableCurrency(false)
                setDisableBase(false)
                setDisableAllFields(true)
            } else {
                setDisableAllFields(false)
                setDisableCurrency(true)
                setDisableBase(true)
                setDisableTotalCost(true)
            }
        }
    }
    const calculateCostPerQuantity = () => {
        let cost = checkForNull(getValues('CostCurrency'))
        let quantity = checkForNull(getValues('Quantity'))
        let costBase = checkForNull(getValues('CostBase'))
        let type = getValues('Type')
        let ConditionCostPerQuantity = 0
        let ConditionCostPerQuantityConversion = 0
        if (type?.label === 'Quantity') {
            ConditionCostPerQuantity = cost / quantity
            ConditionCostPerQuantityConversion = costBase / quantity
        } else {
            ConditionCostPerQuantity = cost
            ConditionCostPerQuantityConversion = costBase
        }

        setValue('ConditionCostPerQuantity', checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration?.NoOfDecimalForPrice))
        setValue('CostPerQuantityConversion', checkForDecimalAndNull(ConditionCostPerQuantityConversion, initialConfiguration?.NoOfDecimalForPrice))
    }
    const handleType = (e) => {
        setType(e)
        // object with the same structure as expected by onConditionChange
        const formattedObject = {
            ConditionType: e?.label
        }
        onConditionChange(formattedObject, true)
    }
    const applicabilityChange = (e) => {
        // Handle Basic Rate separately
        if (e?.label === 'Basic Price') {
            setValue('ApplicabilityCost', checkForDecimalAndNull(basicRateBase, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, Applicability: e?.label, ApplicabilityCost: basicRateBase }));
            return; // Exit early for Basic Rate
        }

        // For other applicabilities
        // Check which applicabilities are selected
        const selectedApplicabilities = e?.label?.split(' + ');

        // Calculate total cost currency for selected applicabilities
        let allExist = true;
        let missingCosts = []; // Array to hold missing costs
        let totalConditionCost
        let total

        selectedApplicabilities.forEach(Applicability => {
            // Skip checking for "Basic Rate" in tableData
            if (Applicability === 'Basic Price') {
                return;
            }
            const item = tableData.find(item => item?.Description === Applicability);
            if (item) {
                totalConditionCost = checkForNull(totalConditionCost) + checkForNull(item?.ConditionCostPerQuantity);
                if (selectedApplicabilities.includes('Basic Price')) {
                    total = checkForNull(totalConditionCost) + checkForNull(basicRateBase)
                } else {
                    total = checkForNull(totalConditionCost)
                }
            } else {
                // Add missing Applicability to the array
                missingCosts.push(Applicability);
                // Set flag to indicate not all applicabilities exist
                allExist = false;
            }
        });

        // If not all applicabilities exist, handle the condition
        if (!allExist) {
            // Show toaster message with all missing costs
            Toaster.warning(`Cost(s) for ${missingCosts.join(', ')} do not exist in the table, please add data first before proceeding further`);
            // You may choose to reset values or handle differently
            setValue('ApplicabilityCost', 0);
        } else {
            // Set ApplicabilityCostCurrency and ApplicabilityBaseCost if all exist
            setValue('ApplicabilityCost', checkForDecimalAndNull(total, initialConfiguration?.NoOfDecimalForPrice));
        }

        setState(prevState => ({ ...prevState, Applicability: e?.label, ApplicabilityCost: total }));
    }
    const checkCondtionDisabled = props.ViewMode || (tableData && tableData?.length === 0 && !props.isFromMaster && (costingConditionEntryType === '' || costingConditionEntryType === undefined || costingConditionEntryType === null))
    return (

        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>

                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Add Condition:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className='hidepage-size'>
                                <Row>
                                    {!isFromMaster && <Col md="3" className='px-2'>
                                        <SearchableSelectHookForm
                                            label={`Entry Type`}
                                            name={'ConditionEntryType'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            isClearable={true}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={conditionEntryTypeDropdown}
                                            handleChange={onConditionEntryTypeChange}
                                            defaultValue={tableData.CostingConditionEntryTypeId ?? ''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.ConditionEntryType}
                                            disabled={disableEntryType || CostingViewMode}
                                        />
                                    </Col>}
                                    <Col md="3" className='px-2'>
                                        <SearchableSelectHookForm
                                            label={`Condition`}
                                            name={'Condition'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={conditionDropdown}
                                            handleChange={(e) => { onConditionChange(e, false) }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Condition}
                                            disabled={checkCondtionDisabled}
                                        />
                                    </Col>

                                    <Col md={3} className='px-2'>
                                        <SearchableSelectHookForm
                                            label={`Type`}
                                            name={'Type'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={renderListing('Type')}
                                            handleChange={handleType}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Type}
                                            disabled={state.disableType}
                                        />
                                    </Col>
                                    {
                                        type?.label === 'Quantity' && <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label={`Quantity`}
                                                name={'Quantity'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Quantity}
                                                disabled={props.ViewMode}
                                            />
                                        </Col>
                                    }
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
                                                    options={combinations}
                                                    handleChange={applicabilityChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Applicability}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md={3} className={'px-2'}>

                                                <TextFieldHookForm
                                                    label={`Applicability Cost (${isFromImport ? currency?.label : PlantCurrency})`}
                                                    name={'ApplicabilityCost'}
                                                    id={'cost-by-percent'}
                                                    Controller={Controller}

                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                    }}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.ApplicabilityBaseCost}
                                                    disabled={props.ViewMode || disableTotalCost || disableCurrency}
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
                                                            message: 'Percentage should be less than 100'
                                                        },
                                                    }}
                                                    handleChange={onPercentChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Percentage}
                                                    disabled={props.ViewMode || disableAllFields}
                                                />
                                            </Col >
                                        </>}
                                    <Col md={3} className={'px-2'}>
                                        {type?.label === 'Percentage' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Price'} />}
                                        <TextFieldHookForm
                                            label={`Cost (${isFromImport ? currency?.label : PlantCurrency})`}
                                            name={'CostCurrency'}
                                            id={'cost-by-percent'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={handleCostChangeCurrency}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.CostCurrency}
                                            disabled={props.ViewMode || disableTotalCost || disableCurrency}
                                        />
                                    </Col>
                                    {
                                        type?.label === 'Quantity' && <>
                                            <Col md={3} className='px-2'>
                                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-per-quantity'} tooltipText={`Cost/Pc = Cost (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")}) / Quantity`} />
                                                <TextFieldHookForm
                                                    label={`Cost/Pc (${isFromImport ? currency?.label : PlantCurrency})`}
                                                    name={'ConditionCostPerQuantity'}
                                                    id={'cost-per-quantity'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    handleChange={() => { }}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.ConditionCostPerQuantity}
                                                    disabled={true}
                                                />
                                            </Col>
                                        </>
                                    }
                                    <Col md="3" className={toggleCondition()}>
                                        <button
                                            type="button"
                                            className={"user-btn  pull-left mt-1"}
                                            onClick={addData}
                                            disabled={props.ViewMode || props?.disabled}
                                        >
                                            {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                        </button>
                                        <button
                                            type="button"
                                            className={"reset-btn pull-left mt-1 ml5"}
                                            onClick={() => resetData("reset")}
                                            disabled={props.ViewMode || props?.disabled}
                                        >
                                            {isEditMode ? "CANCEL" : 'RESET'}
                                        </button>
                                    </Col >
                                </Row >
                                {/* <NpvCost showAddButton={false} tableData={tableData} hideAction={false} editData={editData} /> */}
                                {<ConditionCosting tableData={tableData} hideAction={false} editData={editData} ViewMode={props.ViewMode} isFromImport={isFromImport} currency={currency} isFromMaster={isFromMaster} PlantCurrency={PlantCurrency} isSimulation={props?.isSimulation} />}
                            </div >
                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
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
                                        onClick={() => { props.closeDrawer('save', tableData, costingConditionEntryType, conditionCost) }}
                                        disabled={props.ViewMode || props?.disabled}
                                    >
                                        <div className={"save-icon"}></div>
                                        {'Save'}
                                    </button>
                                </div>
                            </Row>
                        </div >
                    </Container >
                </div >
            </Drawer >
        </div >

    )
}
export default React.memo(AddConditionCosting)
