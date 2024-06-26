import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../src/components/layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import NoContentFound from '../../../../src/components/common/NoContentFound'
import { reactLocalStorage } from 'reactjs-localstorage'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../src/helper/validation";
import { useSelector } from 'react-redux'
import { EMPTY_DATA } from '../../../../src/config/constants'
import Toaster from '../../../../src/components/common/Toaster';

function AddOtherCostDrawer(props) {
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    const { currency, basicRateCurrency, isFromImport, isFromMaster, RowData, RowIndex } = props

    const [tableData, setTableData] = useState([]);
    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState('')
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableCurrency, setDisableCurrency] = useState(false)
    const [disableEntryType, setDisableEntryType] = useState(false)
    const BasicRateBaseCurrency = RowData?.BasicRateBaseCurrency
    const ExchangeRate = RowData?.ExchangeRate
    const BasicRateIndexCurrency = RowData?.BasicRateIndexCurrency
    const [state, setState] = useState({
        applicability: false,
        rowData: {},
        disableApplicability: true,
        premiumCost: '',
        disableCostCurrency: false,
        disableCostBaseCurrency: false
    })
    useEffect(() => {
        const sum = tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.costBaseCurrency), 0);
        setTotalCostBase(checkForDecimalAndNull(sum, initialConfiguration.NoOfDecimalForPrice))
        const sumCurrency = tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.costCurrency), 0);
        setTotalCostCurrency(checkForDecimalAndNull(sumCurrency, initialConfiguration.NoOfDecimalForPrice))
    }, [tableData])
    useEffect(() => {
        // Filter props.tableData for items where MaterialCommodityStandardDetailsId matches props.RowData.MaterialCommodityStandardDetailsId
        const filteredData = props?.tableData?.filter(item => item.MaterialCommodityStandardDetailsId === props.RowData.MaterialCommodityStandardDetailsId);

        // Set tableData state with the filtered data
        // If no items match, filteredData will be an empty array, effectively clearing tableData or setting it to an initial state
        setTableData(filteredData);
    }, [props.RowData, props.tableData]);

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
            label: selectedData.costValue,
            value: selectedData.costValue
        });
        setValue('Type', {
            label: selectedData.typeValue,
            value: selectedData.typeValue
        });
        setType({
            label: selectedData.typeValue,
            value: selectedData.typeValue
        });
        setValue('Percentage', selectedData.percentage);
        setValue('Applicability', {
            label: selectedData.applicabilty,
            value: selectedData.applicabilty
        });
        setValue('ApplicabilityCostCurrency', selectedData.applicabilyCostCurrency);
        setValue('ApplicabilityBaseCost', selectedData.applicabilityBaseCost);
        setValue('CostCurrency', selectedData.costCurrency);
        setValue('CostBaseCurrency', selectedData.CostBaseCurrency);
        // setTotalCostCurrency(selectedData.CostCurrency);
        // setType(selectedData.ConditionType);

        // Update UI state based on the type
        // if (selectedData.typeValue === 'Fixed') {
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
    const calculateCost = () => {
        if (state.applicability === 'Basic Rate')
            setValue('CostCurrency', BasicRateBaseCurrency)
    }

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

    const appicabilityChange = (e) => {

        // Handle Basic Rate separately
        if (e?.value === 'Basic Rate') {
            setValue('ApplicabilityCostCurrency', checkForDecimalAndNull(BasicRateIndexCurrency, initialConfiguration.NoOfDecimalForPrice));
            setValue('ApplicabilityBaseCost', checkForDecimalAndNull((BasicRateIndexCurrency * ExchangeRate), initialConfiguration.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, applicability: e?.label }));
            return; // Exit early for Basic Rate
        }

        // For other applicabilities
        // Check which applicabilities are selected
        const selectedApplicabilities = e?.value.split(' + ');

        // Calculate total cost currency for selected applicabilities
        let totalCostCurrency = 0;
        let allExist = true;
        let missingCosts = []; // Array to hold missing costs

        selectedApplicabilities.forEach(applicability => {
            // Skip checking for "Basic Rate" in tableData
            if (applicability === 'Basic Rate') {
                return;
            }

            const item = tableData.find(item => item.costValue === applicability);
            if (item) {
                totalCostCurrency += item.costCurrency;
            } else {
                // Add missing applicability to the array
                missingCosts.push(applicability);
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
            setValue('ApplicabilityCostCurrency', checkForDecimalAndNull(totalCostCurrency, initialConfiguration.NoOfDecimalForPrice));
            const totalBaseCost = totalCostCurrency * ExchangeRate;
            setValue('ApplicabilityBaseCost', checkForDecimalAndNull(totalBaseCost, initialConfiguration.NoOfDecimalForPrice));
        }

        setState(prevState => ({ ...prevState, applicability: e?.label }));
    }
    const onPercentChange = (e) => {
        if (e?.target?.value) {
            let applicabilityCostCurrency = getValues('ApplicabilityCostCurrency')
            let costCurrency = checkForNull((e.target.value) / 100) * checkForNull(applicabilityCostCurrency)
            setValue('CostCurrency', checkForDecimalAndNull(costCurrency, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostBaseCurrency', checkForDecimalAndNull((costCurrency * ExchangeRate), initialConfiguration.NoOfDecimalForPrice))
        }
    }

    const cancel = () => {
        props.closeDrawer('close', '')
    }


    const handleCostChangeCurrency = (e) => {
        if (e?.target?.value) {
            setValue('CostBaseCurrency', checkForDecimalAndNull((checkForNull(e.target.value) * ExchangeRate), initialConfiguration.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, disableCostBaseCurrency: true }));
        } else {
            setValue('CostBaseCurrency', '')
            setState(prevState => ({ ...prevState, disableCostBaseCurrency: false }));
        }
    }
    const handleCostChangeBase = (e) => {
        if (e?.target?.value) {
            setValue('CostCurrency', checkForDecimalAndNull((checkForNull(e.target.value) / ExchangeRate), initialConfiguration.NoOfDecimalForPrice))
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

        if (label === 'Cost') {
            return [
                { label: "Premium Cost", value: "Premium Cost" },
                { label: "Processing Cost", value: "Processing Cost" },
                { label: "Import Freight", value: "Import Freight" },
                { label: "Other Cost", value: "Other Cost" },
                { label: "Custom Duty", value: "Custom Duty" },
                { label: "Shipping Line Charges", value: "Shipping Line Charges" },
                { label: "Local Logistic", value: "Local Logistic" },
                { label: "Yield Loss", value: "Yield Loss" },
                { label: "Packaging and Freight", value: "Packaging and Freight" },
                { label: "Overhead Cost", value: "Overhead Cost" },
                { label: "Profit Cost", value: "Profit Cost" },
                { label: "Discount Cost", value: "Discount Cost" },
                { label: "Freight Cost", value: "Freight Cost" },
                { label: "Shearing Cost", value: "Shearing Cost" },
            ];
        }
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
        const newData = {
            MaterialCommodityStandardDetailsId: RowData.MaterialCommodityStandardDetailsId, // Add MaterialCommodityStandardDetailsId
            typeValue: getValues('Type') ? getValues('Type').label : '-',
            costValue: getValues('Cost') ? getValues('Cost').label : '-',
            applicability: getValues('Applicability') ? getValues('Applicability').label : '-',
            applicabilyCostCurrency: getValues('ApplicabilityCostCurrency') ? getValues('ApplicabilityCostCurrency') : '-',
            applicabilityBaseCost: getValues('ApplicabilityBaseCost') ? getValues('ApplicabilityBaseCost') : '-',
            percentage: getValues('Percentage') ? getValues('Percentage') : '-',
            costCurrency: getValues('CostCurrency') ? getValues('CostCurrency') : '-',
            costBaseCurrency: getValues('CostBaseCurrency'),
        };

        // Assuming 'tableData' is an array of objects and you want to add MaterialCommodityStandardDetailsId separately,
        // you can structure your updated data as follows:
        const updatedData = {
            MaterialCommodityStandardDetailsId: RowData.MaterialCommodityStandardDetailsId,
            data: [] // This will hold your actual tableData with the new item added if necessary
        };

        // Check if costValue already exists in tableData, excluding the current item in edit mode
        const isCostValueExists = tableData.some((item, index) => {
            if (isEditMode && index === editIndex) {
                return false; // Skip the current edited item
            }
            return item.costValue === newData.costValue;
        });

        if (isCostValueExists) {
            // Display toaster warning if costValue already exists
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
    const checkCondtionDisabled = props.ViewMode || (tableData && tableData?.length === 0 && !props.isFromMaster)
    const handleCost = (newValue) => {

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
                                                options={renderListing('Cost')}

                                                handleChange={handleCost}
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
                                                disabled={checkCondtionDisabled}
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
                                                        handleChange={appicabilityChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.Applicability}
                                                        disabled={false}
                                                    />
                                                </Col>
                                                <Col md={3} className={'px-2'}>

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
                                                </Col>
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
                                        <Col md={3} className={'px-2'}>

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
                                                disabled={type?.label === 'Percentage' ? true : false || state.disableCostCurrency}
                                            />
                                        </Col>
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
                                                disabled={type?.label === 'Percentage' ? true : false || state.disableCostBaseCurrency}
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
                                                    <th>{`Type`}</th>
                                                    <th>{`Applicability`}</th>
                                                    <th>{`Applicability Cost (Currency)`}</th>
                                                    <th>{`Applicability Cost (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    <th>{`Cost (Currency)`}</th>
                                                    <th>{`Cost (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                                    {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item.costValue}</td>
                                                            <td>{item.typeValue}</td>
                                                            <td>{item.applicabilty}</td>
                                                            <td>{item.applicabilyCostCurrency}</td>
                                                            <td>{item.applicabilityBaseCost}</td>
                                                            <td>{item.percentage !== '-' ? checkForDecimalAndNull(item.percentage, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item.costCurrency !== '-' ? item.costCurrency : '-'}</td>
                                                            <td>{item.costBaseCurrency !== '-' ? item.costBaseCurrency : '-'}</td>
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
                                                    <td colSpan={6} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                                                    <td ><div className='d-flex justify-content-between'>{checkForDecimalAndNull(totalCostCurrency, initialConfiguration.NoOfDecimalForPrice)} </div></td>
                                                    <td colSpan={2} className="text-left"> {checkForDecimalAndNull(totalCostBase, initialConfiguration.NoOfDecimalForPrice)}</td>
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