import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../src/components/layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import NoContentFound from '../../../../src/components/common/NoContentFound'
import { reactLocalStorage } from 'reactjs-localstorage'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull, hashValidation } from "../../../../src/helper/validation";
import { useDispatch, useSelector } from 'react-redux'
import { EMPTY_DATA } from '../../../../src/config/constants'
import Toaster from '../../../../src/components/common/Toaster';
import { getCostingCondition } from '../../../actions/Common'
import { getRMCostIds } from '../../common/CommonFunctions'

function AddOtherCostDrawer(props) {
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch();

    const { currency, rmBasicRate, isFromImport, isFromMaster, RowData, RowIndex } = props

    const [tableData, setTableData] = useState([]);
    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState('')
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableCurrency, setDisableCurrency] = useState(false)
    const ExchangeRate = RowData?.ExchangeRate
    const BasicRateIndexCurrency = RowData?.BasicRate
    const [state, setState] = useState({
        Applicability: false,
        rowData: {},
        disableApplicability: true,
        premiumCost: '',
        disableCostCurrency: false,
        disableCostBaseCurrency: false,
        costDropdown: []
    })
    useEffect(() => {
        const sum = tableData && tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.NetCostConversion), 0);
        setTotalCostBase(checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice))
        const sumCurrency = tableData && tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.NetCost), 0);
        setTotalCostCurrency(checkForDecimalAndNull(sumCurrency, initialConfiguration?.NoOfDecimalForPrice))
    }, [tableData])
    useEffect(() => {
        if (props.rawMaterial === true) {
            setTableData(props.rmTableData)
        } else {

            if (Array.isArray(props.RowData.RawMaterialCommodityIndexRateDetailsRequest)) {
                const filteredData = props?.tableData?.filter(item =>
                    props.RowData.RawMaterialCommodityIndexRateDetailsRequest.some(req =>
                        req.RawMaterialCommodityIndexRateAndOtherCostDetailsId === item.RawMaterialCommodityIndexRateAndOtherCostDetailsId
                    )
                );
                setTableData(filteredData);
            } else {
                setTableData([]);
            }
        }
    }, [props.RowData, props.tableData]);
    useEffect(() => {
        const entryTypeId =
            props.rawMaterial
                ? getRMCostIds()[1].CostingConditionTypeMasterId
                : getRMCostIds()[0].CostingConditionTypeMasterId;
        dispatch(getCostingCondition('', entryTypeId, (res) => {
            if (res?.data?.DataList) {
                const temp = res.data.DataList.map((item) => ({
                    label: item.CostingConditionNumber,
                    value: item.CostingConditionMasterId,
                }));
                setState((prevState) => ({
                    ...prevState,
                    costDropdown: temp
                }));
            }
        }));
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
        setValue('Cost', {
            label: selectedData.CostHeaderName,
            value: selectedData.CostHeaderName
        });
        setValue('Type', {
            label: selectedData.Type,
            value: selectedData.Type
        });
        setType({
            label: selectedData.Type,
            value: selectedData.Type
        });
        setValue('Percentage', selectedData.Value);
        setValue('Applicability', {
            label: selectedData.Applicability,
            value: selectedData.Applicability
        });
        setValue('ApplicabilityCostCurrency', selectedData.ApplicabilityCost);
        setValue('ApplicabilityBaseCost', selectedData.ApplicabilityCostConversion);
        setValue('CostCurrency', selectedData.NetCost);
        setValue('CostBaseCurrency', selectedData.NetCostConversion);
        setValue('CostDescription', selectedData.Description);
        // setTotalCostCurrency(selectedData.CostCurrency);
        // setType(selectedData.ConditionType);

        // Update UI state based on the type
        // if (selectedData.Type === 'Fixed') {
        //     setDisableTotalCost(false);
        //     setDisableCurrency(false);

        //     setDisableAllFields(true);
        // } else {
        //     setState(prevState => ({ ...prevState, disableApplicability: false }));
        // }
    };

    const handleDelete = (indexValue) => {
        let updatedData = tableData.filter((_, index) => index !== indexValue);
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
        if (isFromImport) {
            if (type === "") {
                cssClass = 'mb-3';
            } else if (type === "Fixed") {
                cssClass = 'mb-3';
            } else {
                cssClass = 'mt-4 pt-1';
            }
        } else {
            if (type === "") {
                cssClass = 'mb-3';
            } else if (type === "Fixed") {
                cssClass = 'mb-3';
            } else {
                cssClass = 'mt-4 pt-1';
            }
            if (props.isFromMaster) {
                if (type === "Percentage") {
                    cssClass = 'mb-3';
                } else {
                    cssClass = 'mt-4 pt-1';
                }
            }
        }
        return cssClass
    }

    const applicabilityChange = (e) => {

        // Handle Basic Rate separately
        if (e?.value === 'Basic Rate') {
            let basicRate = props.rawMaterial ? rmBasicRate : BasicRateIndexCurrency * ExchangeRate
            setValue('ApplicabilityCostCurrency', checkForDecimalAndNull(BasicRateIndexCurrency, initialConfiguration?.NoOfDecimalForPrice));
            setValue('ApplicabilityBaseCost', checkForDecimalAndNull(basicRate, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, Applicability: e?.label }));
            return; // Exit early for Basic Rate
        }

        // For other applicabilities
        // Check which applicabilities are selected
        const selectedApplicabilities = e?.value.split(' + ');

        // Calculate total cost currency for selected applicabilities
        let totalCostCurrency = 0;
        let allExist = true;
        let missingCosts = []; // Array to hold missing costs
        let totalBasicRate
        let total

        selectedApplicabilities.forEach(Applicability => {
            // Skip checking for "Basic Rate" in tableData
            if (Applicability === 'Basic Rate') {
                return;
            }

            const item = tableData.find(item => item?.CostHeaderName === Applicability);
            if (item) {
                totalCostCurrency += props.rawMaterial ? item?.NetCostConversion : item?.NetCost;

                if (selectedApplicabilities.includes('Basic Rate')) {
                    // totalCostCurrency += BasicRateIndexCurrency;
                    totalBasicRate = props.rawMaterial ? rmBasicRate : BasicRateIndexCurrency
                    total = checkForNull(totalCostCurrency) + checkForNull(totalBasicRate)
                } else {
                    total = totalCostCurrency
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
            setValue('ApplicabilityCostCurrency', 0);
            setValue('ApplicabilityBaseCost', 0);
        } else {
            // Set ApplicabilityCostCurrency and ApplicabilityBaseCost if all exist
            setValue('ApplicabilityCostCurrency', checkForDecimalAndNull(total, initialConfiguration?.NoOfDecimalForPrice));
            const totalBaseCost = props.rawMaterial ? total : total * ExchangeRate;
            setValue('ApplicabilityBaseCost', checkForDecimalAndNull(totalBaseCost, initialConfiguration?.NoOfDecimalForPrice));
        }

        setState(prevState => ({ ...prevState, Applicability: e?.label }));
    }
    const onPercentChange = (e) => {
        if (e?.target?.value) {
            let applicabilityCostCurrency = props.rawMaterial ? getValues('ApplicabilityBaseCost') : getValues('ApplicabilityCostCurrency')
            let NetCost = checkForNull((e.target.value) / 100) * checkForNull(applicabilityCostCurrency)
            let NetCostConversion = props.rawMaterial ? NetCost : NetCost * ExchangeRate
            setValue('CostCurrency', checkForDecimalAndNull(NetCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('CostBaseCurrency', checkForDecimalAndNull(NetCostConversion, initialConfiguration?.NoOfDecimalForPrice))
        }
    }

    const cancel = () => {
        props.closeDrawer('Cancel', tableData, totalCostCurrency, totalCostBase, RowIndex)
    }


    const handleCostChangeCurrency = (e) => {
        if (e?.target?.value) {
            setValue('CostBaseCurrency', checkForDecimalAndNull((checkForNull(e.target.value) * ExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, disableCostBaseCurrency: true }));
        } else {
            setValue('CostBaseCurrency', '')
            setState(prevState => ({ ...prevState, disableCostBaseCurrency: false }));
        }
    }
    const handleCostChangeBase = (e) => {
        if (e?.target?.value) {
            setValue('CostCurrency', checkForDecimalAndNull((checkForNull(e.target.value) / ExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
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
                { label: "Fixed", value: 'Fixed' }
            ]
        }

        return [];
    }
    const applicabilities = [
        { label: "Basic Rate", value: "Basic Rate" },
        { label: "Premium Cost", value: "Premium Cost" },
        { label: "Custom Duty", value: "Custom Duty" },
        { label: "Shipping Line Charges", value: "Shipping Line Charges" },
        { label: "Processing Cost", value: "Processing Cost" },
        { label: "Import Freight", value: "Import Freight" },
    ];

    const combinations = [];

    function generateCombinations(arr, index, current) {
        for (let i = index; i < arr.length; i++) {
            const newCombination = [...current, arr[i]];
            combinations.push({
                label: newCombination.map(item => item.label).join(" + "),
                value: newCombination.map(item => item.value).join(" + ")
            });
            generateCombinations(arr, i + 1, newCombination);
        }
    }

    generateCombinations(applicabilities, 0, []);


    const onSubmit = data => {

        addData();
    }
    const addData = () => {
        const type = getValues('Type');
        const cost = getValues('Cost');
        const applicability = getValues('Applicability');
        const percentage = Number(getValues('Percentage'));
        const costBaseCurrency = getValues('CostBaseCurrency');
        const applicabilityBaseCost = getValues('ApplicabilityBaseCost');


        // If 'Type' is not provided, return false
        if (!type || !cost) return false;
        if (type.label === "Percentage") {
            // If 'Type' is 'percentage', check for 'Applicability' and 'Percentage'
            if (!applicability || !applicabilityBaseCost || !percentage || percentage === 0) {
                Toaster.warning('Cost should not be zero or empty.');
                return false;
            }
        } else if (type.label === 'Fixed') {
            // If 'Type' is 'fixed', check for 'CostCurrency' and 'CostBaseCurrency'
            if (!costBaseCurrency) return false;
        }
        const newData = {
            MaterialCommodityStandardDetailsId: RowData?.MaterialCommodityStandardDetailsId, // Add MaterialCommodityStandardDetailsId
            Type: getValues('Type') ? getValues('Type').label : '-',
            CostHeaderName: getValues('Cost') ? getValues('Cost').label : '-',
            Applicability: getValues('Applicability') ? getValues('Applicability').label : '-',
            ApplicabilityCost: getValues('ApplicabilityCostCurrency') ? getValues('ApplicabilityCostCurrency') : '-',
            ApplicabilityCostConversion: getValues('ApplicabilityBaseCost') ? getValues('ApplicabilityBaseCost') : '-',
            Value: getValues('Percentage') ? getValues('Percentage') : '-',
            NetCost: getValues('CostCurrency') ? getValues('CostCurrency') : '-',
            NetCostConversion: getValues('CostBaseCurrency'),
            Description: getValues('CostDescription') ? getValues('CostDescription') : '-',
            CostingConditionMasterId: getValues('Cost') ? getValues('Cost').value : '-',
        };

        // Assuming 'tableData' is an array of objects and you want to add MaterialCommodityStandardDetailsId separately,
        // you can structure your updated data as follows:
        const updatedData = {
            MaterialCommodityStandardDetailsId: RowData?.MaterialCommodityStandardDetailsId,
            data: [] // This will hold your actual tableData with the new item added if necessary
        };

        // Check if CostHeaderName already exists in tableData, excluding the current item in edit mode
        const isCostValueExists = tableData && tableData?.some((item, index) => {
            if (isEditMode && index === editIndex) {
                return false; // Skip the current edited item
            }
            return item.CostHeaderName === newData.CostHeaderName;
        });

        if (isCostValueExists) {
            // Display toaster warning if CostHeaderName already exists
            Toaster.warning('Cost already exists in the table.');
            return; // Exit function early
        }

        // Update tableData state
        if (isEditMode) {
            const updatedTableData = [...tableData];
            updatedTableData[editIndex] = newData;
            updatedData.data = updatedTableData;
        } else {
            updatedData.data = [...tableData, newData];
        }

        setTableData(updatedData.data);

        // Reset input fields and states
        resetData(); // Assuming resetData correctly resets form inputs
        setIsEditMode(false);
        setEditIndex('');

        // Reset dropdowns to their initial state (placeholder)
        setValue('Cost', ''); // Reset to an empty string or null to show the placeholder
        setValue('Type', ''); // Reset to an empty string or null to show the placeholder
        setValue('Percentage', ''); // Reset Percentage field
        setValue('CostCurrency', ''); // Reset to an empty string or null to show the placeholder
        setValue('CostBaseCurrency', '');
        setValue('CostDescription', '');
        setState(prevState => ({ ...prevState, disableCostBaseCurrency: false, disableCostCurrency: false }));
    };


    const resetData = (type = '') => {
        const commonReset = () => {
            setDisableAllFields(true);
            setDisableTotalCost(true);
            setType('');
            setEditIndex('');
            setIsEditMode(false)
            reset({
                Cost: '',
                Type: '',
                Percentage: '',
                CostCurrency: '',
            });
        };
        commonReset();
    };

    const handleType = (type) => {
        if (type && type !== '') {
            setType(type);
            setValue('CostCurrency', '')
            setValue('CostBaseCurrency', '')
            if (type?.label === "Percentage") {
                setState(prevState => ({ ...prevState, disableApplicability: false }));
            } else {
                setState(prevState => ({ ...prevState, disableApplicability: true }));
            }
        } else {
            setType('');
        }
    }

    return (

        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>

                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'OtherCost:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='hidepage-size'>

                                    <Row>
                                        <Col md="3" className='px-2'>
                                            <SearchableSelectHookForm
                                                label={`Cost`}
                                                name={'Cost'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                // options={conditionDropdown}
                                                options={state.costDropdown}

                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Condition}
                                                disabled={props.ViewMode}
                                            />
                                        </Col>
                                        <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label="Cost Description"
                                                name={"CostDescription"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { checkWhiteSpaces, hashValidation },
                                                    maxLength: 80
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors.OtherCostDescription}
                                                disabled={props.ViewMode}
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
                                                disabled={props.ViewMode}
                                            />

                                        </Col>

                                        {
                                            type.label === 'Percentage' &&
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
                                                        // options={conditionDropdown}
                                                        options={combinations}
                                                        handleChange={applicabilityChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.Applicability}
                                                        disabled={false}
                                                    />
                                                </Col>
                                                {!props.rawMaterial && <Col md={3} className={'px-2'}>

                                                    <TextFieldHookForm
                                                        label={`Applicability Cost (Currency)`}
                                                        name={'ApplicabilityCostCurrency'}
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
                                                        errors={errors.ApplicabilityCostCurrency}
                                                        disabled={props.ViewMode || disableTotalCost || disableCurrency}
                                                    />
                                                </Col>}
                                                <Col md={3} className={'px-2'}>

                                                    <TextFieldHookForm
                                                        label={`Applicability Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                                        name={'ApplicabilityBaseCost'}
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
                                                            required: false,
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
                                                        errors={errors.Percentage}
                                                        disabled={props.ViewMode}
                                                    />
                                                </Col ></>}
                                        {!props.rawMaterial && <Col md={3} className={'px-2'}>

                                            <TextFieldHookForm
                                                label={`Cost (Currency)`}
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
                                                disabled={type?.label === 'Percentage' ? true : false || state.disableCostCurrency || props.ViewMode}
                                            />
                                        </Col>}
                                        <Col md={3} className={'px-2'}>

                                            <TextFieldHookForm
                                                label={`Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                                name={'CostBaseCurrency'}
                                                id={'cost-by-percent'}
                                                Controller={Controller}

                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                }}
                                                handleChange={handleCostChangeBase}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.CostBaseCurrency}
                                                disabled={type?.label === 'Percentage' ? true : false || state.disableCostBaseCurrency || props.ViewMode}
                                            />
                                        </Col>

                                        <Col md="3" className={toggleCondition()}>
                                            <button
                                                type="button"
                                                className={"user-btn  pull-left mt-1"}
                                                onClick={addData}
                                                disabled={props.ViewMode}
                                            >
                                                {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"reset-btn pull-left mt-1 ml5"}
                                                onClick={() => resetData("reset")}
                                                disabled={props.ViewMode}
                                            >
                                                {isEditMode ? "CANCEL" : 'RESET'}
                                            </button>
                                        </Col >
                                    </Row >
                                    <Col md={props.hideAction ? 12 : 12}>
                                        <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`Cost`}</th>
                                                    <th>{`Cost Description`}</th>
                                                    <th>{`Type`}</th>
                                                    <th>{`Applicability`}</th>
                                                    {!props.rawMaterial && <th>{`Applicability Cost (Currency)`}</th>}
                                                    <th>{`Applicability Cost (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    {!props.rawMaterial && <th>{`Cost (Currency)`}</th>}
                                                    <th>{`Cost (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                                    {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item.CostHeaderName}</td>
                                                            <td>{item.Description}</td>
                                                            <td>{item.Type}</td>
                                                            <td>{item.Applicability}</td>
                                                            {!props.rawMaterial && <td>{item.ApplicabilityCost}</td>}
                                                            <td>{item.ApplicabilityCostConversion}</td>
                                                            <td>{item.Value !== '-' ? checkForDecimalAndNull(item.Value, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            {!props.rawMaterial && <td>{item.NetCost !== '-' ? item.NetCost : '-'}</td>}
                                                            <td>{item.NetCostConversion !== '-' ? item.NetCostConversion : '-'}</td>
                                                            {!props.hideAction && (
                                                                <td>
                                                                    <div className='text-right'>
                                                                        <button title='Edit' className="Edit mr-1" type='button' onClick={() => editDeleteData(index, 'edit')} disabled={props.ViewMode} />
                                                                        <button title='Delete' className="Delete mr-1" type='button' onClick={() => editDeleteData(index, 'delete')} disabled={props.ViewMode} />
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    </Fragment>
                                                ))}

                                                {tableData && tableData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="10">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr className='table-footer'>
                                                    <td colSpan={props.rawMaterial ? 6 : 7} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                                                    {!props.rawMaterial && <td ><div className='d-flex justify-content-between'>{checkForDecimalAndNull(totalCostCurrency, initialConfiguration?.NoOfDecimalForPrice)} </div></td>}
                                                    <td colSpan={3} className="text-left"> {checkForDecimalAndNull(totalCostBase, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                                </tr>
                                            </tbody>
                                        </Table>

                                    </Col>

                                </div >
                                <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                    <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                        <button
                                            type={'button'}
                                            className="reset cancel-btn mr5"
                                            onClick={cancel} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type={'button'}
                                            className="submit-button save-btn"
                                            onClick={() => props.closeDrawer('Save', tableData, totalCostCurrency, totalCostBase, RowIndex)}
                                            disabled={props.ViewMode}
                                        >
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div >
                    </Container >
                </div >
            </Drawer >
        </div >
    )
}
export default React.memo(AddOtherCostDrawer)