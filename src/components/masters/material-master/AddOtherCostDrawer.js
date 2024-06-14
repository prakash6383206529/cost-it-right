import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, TextFieldHookForm, SearchableSelectHookForm } from '../../../../src/components/layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import TooltipCustom from '../../../../src/components/common/Tooltip'
import NoContentFound from '../../../../src/components/common/NoContentFound'
import { reactLocalStorage } from 'reactjs-localstorage'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../src/helper/validation";
import { getConfigurationKey } from "../../../../src/helper/auth";
import { useSelector, useDispatch } from 'react-redux'
import { EMPTY_DATA } from '../../../../src/config/constants'
import { trim } from 'lodash'
import { getCostingCondition } from '../../../../src/actions/Common'
import { setOtherCostData } from '../../../../src/components/costing/actions/Costing';
import Toaster from '../../../../src/components/common/Toaster';

function AddOtherCostDrawer(props) {

    //FUNCTION TO GET SUM OF OTHER COST ADDED IN THE TABLE
    const calculateSumOfValues = () => {
        let total = 0;
        tableData.forEach(item => {
            total += parseFloat(item.CostCurrency) || 0; // Ensure to convert to float and handle NaN values
        });
        return total;
    };


    const { currency, currencyValue, basicRateCurrency, basicRateBase, isFromImport, isFromMaster, EntryType } = props
    // const [tableData, setTableData] = useState(props?.tableData)
    const [tableData, setTableData] = useState([]);

    // const [tableData, setTableData] = useState([])
    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [conditionDropdown, setConditionDropdown] = useState([])
    const [selectedType, setSelectedType] = useState([])
    const [typeDropdown, setTypeDropdown] = useState([])
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState('')
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableBase, setDisableBase] = useState(false)
    const [disableCurrency, setDisableCurrency] = useState(false)
    const [disableEntryType, setDisableEntryType] = useState(false)
    const [costingConditionEntryType, setCostingConditionEntryType] = useState(props?.costingConditionEntryType)



    const dispatch = useDispatch();
    const { otherCostData } = useSelector(state => state.costing)
    const [gridData, setgridData] = useState(otherCostData.gridData);

    useEffect(() => {

        if (tableData?.length === 0) {

            setDisableEntryType(false)
            setValue('ConditionEntryType', '')
        }
    }, [tableData]);


    const totalCostCurrencySum = calculateSumOfValues();


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
        setDisableAllFields(false);

        // Populate form fields with the existing data of the selected row
        setValue('Cost', {
            label: selectedData.ConditionCost,
            value: selectedData.ConditionCost
        });
        setValue('Type', {
            label: selectedData.ConditionType,
            value: selectedData.ConditionType
        });
        setValue('Percentage', selectedData.Percentage);
        setValue('CostCurrency', selectedData.CostCurrency);

        // If you have other fields to set, you can add them here
        // For example, if you have 'CostBase' and 'Quantity' fields:
        setValue('CostBase', selectedData.CostBase);
        setValue('Quantity', selectedData.Quantity);

        // Update state for total cost and entry type if needed
        setTotalCostCurrency(selectedData.CostCurrency);
        setTotalCostBase(selectedData.CostBase);
        setCostingConditionEntryType(selectedData.CostingConditionEntryTypeId);
        setType(selectedData.ConditionType);

        // Update UI state based on the type
        if (selectedData.ConditionType === 'Fixed' || selectedData.ConditionType === 'Quantity') {
            setDisableTotalCost(false);
            setDisableCurrency(false);
            setDisableBase(false);
            setDisableAllFields(true);
        } else {
            setDisableAllFields(false);
            setDisableCurrency(true);
            setDisableBase(true);
            setDisableTotalCost(true);
        }
    };

    const handleDelete = (indexValue) => {
        let updatedData = tableData.filter((_, index) => index !== indexValue);
        setTableData(updatedData);
        resetData();
    };

    const editDeleteData = (indexValue, operation) => {

        editData(indexValue, operation)
    }



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


    //
    const { register, control, setValue, getValues, handleSubmit, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)



    const toggleCondition = () => {
        // isFromImport ? type === 'Fixed' ? 'mb-3' : 'mt-4 pt-1' : type === 'Percentage' ? 'mb-3' : 'mt-4 pt-1'
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
    const onConditionChange = (e) => {

        setType(e?.value)
        setValue('Type', e?.value)
        setValue('Percentage', '')
        setValue('Quantity', '')
        setValue('CostCurrency', '')
        setValue('CostBase', '')
        setDisableEntryType(true)
        if (e?.value === 'Fixed' || e?.value === 'Quantity') {
            setDisableTotalCost(false)
            setDisableCurrency(false)
            setDisableBase(false)
            setDisableAllFields(true)
            setValue('Percentage', '')
        } else if (e?.value === 'Percentage') {

            setDisableAllFields(false)
            setDisableTotalCost(true)
            setDisableCurrency(true) // Disable cost field
            setDisableBase(true) // Disable cost base field
            setTotalCostCurrency('')
            setTotalCostBase('')
        } else {
            setDisableAllFields(false)
            setDisableTotalCost(true)
            setTotalCostCurrency('')
            setTotalCostBase('')
        }
    }




    const onPercentChange = (e) => {
        if (e?.target?.value) {
            let costCurrency = checkForNull((e.target.value) / 100) * checkForNull(basicRateCurrency)
            let costBase = checkForNull((e.target.value) / 100) * checkForNull(basicRateBase)
            setValue('CostBase', checkForDecimalAndNull(costBase, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostCurrency', checkForDecimalAndNull(costCurrency, initialConfiguration.NoOfDecimalForPrice))
            setTotalCostCurrency(costCurrency)
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


    const handleCostChangeCurrency = (e) => {
        errors.CostBase = {}
        if (e?.target?.value) {
            const costBase = checkForNull(e.target.value) * checkForNull(currencyValue)
            setValue("CostBase", checkForDecimalAndNull(costBase, initialConfiguration.NoOfDecimalForPrice))
            const ConditionCostPerQuantity = checkForNull(e.target.value) / checkForNull(getValues('Quantity'))
            setValue("ConditionCostPerQuantity", checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration.NoOfDecimalForPrice))
            setDisableBase(true)
            setTotalCostCurrency(e.target.value)
            setTotalCostBase(costBase)
            setValue("ConditionCostPerQuantity", checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration.NoOfDecimalForPrice))
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

    /**
   * @method renderListing
   * @description RENDER LISTING IN DROPDOWN
   */
    const renderListing = (label) => {
        const temp = [];
        let tempList = [];
        if (label === 'Cost') {
            return [

                { label: "Local Logistic", value: "Local Logistic" },
                { label: "Yield Loss", value: "Yield Loss" },
                { label: "Packaging and Freight", value: "Packaging and Freight" },
                { label: "Overhead Cost", value: "Overhead Cost" },
                { label: "Profit Cost", value: "Profit Cost" },
                { label: "Discount Cost", value: "Discount Cost" },
                { label: "Freight Cost", value: "Freight Cost" },
                { label: "Shearing Cost", value: "Shearing Cost" }

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

    const validation = () => {
        let labels = ['Type', 'Cost', 'Percentage', 'CostCurrency'];
        let count = 0;

        const typeLabel = getValues('Type')?.label;
        const isPercentageEnabled = typeLabel === 'Percentage';
        const isCostCurrencyEnabled = !isPercentageEnabled;

        labels.forEach(label => {
            if (isPercentageEnabled && (label === 'Cost' || label === 'CostCurrency')) {
                return; // Skip validation for Cost and CostCurrency if Percentage is enabled
            } else if (isCostCurrencyEnabled && label === 'Percentage') {
                return; // Skip validation for Percentage if CostCurrency is enabled
            } else {
                const value = getValues(label);
                if (!value) {
                    count++;
                } else if ((label === 'Percentage' || label === 'CostCurrency') && isNaN(value)) {
                    Toaster.warning(`Please enter a valid number for ${label}`);
                    count++;
                }
            }
        });

        if (count > 0) {
            Toaster.warning("Please fill all details correctly");
            return true;
        } else {
            const conditionType = getValues('Type')?.label;
            const conditionCost = getValues('Cost')?.label;
            let isDuplicate = false;

            tableData && tableData.forEach(item => {
                if (String(item.ConditionType) === String(conditionType) && String(item.ConditionCost) === String(conditionCost)) {
                    isDuplicate = true;
                }
            });

            if (isDuplicate && !isEditMode) {
                Toaster.warning("Duplicate entries are not allowed");
                return true;
            } else {
                return false;
            }
        }
    };

    // const validation = () => {
    //     let labels = ['Type', 'Cost', 'Percentage', 'CostCurrency'];
    //     let count = 0;

    //     labels.forEach(label => {
    //         const typeLabel = getValues('Type')?.label;
    //         const isPercentageEnabled = typeLabel === 'Percentage';
    //         const isCostCurrencyEnabled = !isPercentageEnabled;

    //         if (isPercentageEnabled && (label === 'CostCurrency' || label === 'Percentage')) {
    //             return; // Skip validation for CostCurrency and Percentage if Percentage is enabled
    //         } else if (isCostCurrencyEnabled && label === 'Percentage') {
    //             return; // Skip validation for Percentage if CostCurrency is disabled
    //         } else {
    //             if (!getValues(label)) {
    //                 count++;
    //             }
    //         }
    //     });

    //     if (count > 0) {
    //         Toaster.warning("Please fill all details");
    //         return true;
    //     } else {
    //         const conditionType = getValues('Type')?.label;
    //         const conditionCost = getValues('Cost')?.label;
    //         let isDuplicate = false;

    //         tableData && tableData.forEach(item => {
    //             if (String(item.ConditionType) === String(conditionType) && String(item.ConditionCost) === String(conditionCost)) {
    //                 isDuplicate = true;
    //             }
    //         });

    //         if (isDuplicate && !isEditMode) {
    //             Toaster.warning("Duplicate entries are not allowed");
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // };


    const onSubmit = data => {

        addData();
    }
    const addData = () => {
        if (validation()) {
            return false; // Prevent further execution if validation fails
        }

        // Retrieve values from the form
        const typeValue = getValues('Type') ? getValues('Type').label : '-';
        const costValue = getValues('Cost') ? getValues('Cost').label : '-';
        const percentageValue = getValues('Percentage');
        const costCurrencyValue = getValues('CostCurrency');

        // Determine the values to use based on the type
        let newData = {
            ConditionType: typeValue,
            ConditionCost: costValue,
            Percentage: typeValue === "Fixed" ? '-' : (percentageValue || '-')
        };

        // Adjust newData based on Type
        if (typeValue === "Percentage") {
            newData.CostCurrency = '-'; // If Percentage type, CostCurrency should be '-'
        } else {
            newData.CostCurrency = costCurrencyValue || '-'; // Otherwise, use CostCurrency value or '-'
        }



        // Update tableData state
        if (isEditMode) {
            const updatedTableData = [...tableData];
            updatedTableData[editIndex] = newData;
            setTableData(updatedTableData);
        } else {
            setTableData([...tableData, newData]);
        }

        // Reset input fields and states
        resetData(); // Assuming resetData correctly resets form inputs
        setIsEditMode(false);
        setEditIndex('');

        // Reset dropdowns to their initial state (placeholder)
        setValue('Cost', ''); // Reset to an empty string or null to show the placeholder
        setValue('Type', ''); // Reset to an empty string or null to show the placeholder
        setValue('Percentage', ''); // Reset Percentage field
        setValue('CostCurrency', ''); // Reset to an empty string or null to show the placeholder
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
            reset({
                Cost: '',
                Type: '',
                Percentage: '',
                CostCurrency: '',
                // CostBase: '',
                // ConditionCostPerQuantity: '',
                // Quantity: '',
                ConditionEntryType: type === 'reset' && tableData.length === 0 ? '' : undefined,
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
    const onFinalSubmit = () => {
        //props.closeDrawer('submit', otherCostTotal, gridData)


        // dispatch(setOtherCostData({ gridData: gridData, otherCostTotal: otherCostTotal }))
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
                                                //handleChange={onConditionEntryTypeChange}
                                                defaultValue={tableData.CostingConditionEntryTypeId ?? ''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.ConditionEntryType}
                                                disabled={disableEntryType}
                                            />
                                        </Col>}
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

                                                handleChange={onConditionChange}
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
                                                handleChange={onConditionChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Condition}
                                                disabled={checkCondtionDisabled}
                                            />

                                        </Col>

                                        {
                                            type === 'Percentage' && <Col md={3} className='px-2'>
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
                                                    disabled={props.ViewMode || disableAllFields}
                                                />
                                            </Col >}
                                        <Col md={3} className={'px-2'}>
                                            {type === 'Percentage' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Price'} />}
                                            <TextFieldHookForm
                                                label={`Cost (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")})`}
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
                                            isFromImport && <Col md={3} className='px-2'>
                                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-currency'} tooltipText={`Cost = Cost (${currency?.label}) * Currency (${currencyValue})`} />
                                                <TextFieldHookForm
                                                    label={`Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                                    name={'CostBase'}
                                                    id={'cost-by-currency'}
                                                    Controller={Controller}
                                                    type="number"
                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                    }}
                                                    // handleChange={handleCostChangeBase}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.CostBase}
                                                    disabled={props.ViewMode || disableTotalCost || disableBase}
                                                />
                                            </Col>
                                        }
                                        {
                                            type === 'Quantity' && <>
                                                <Col md={3} className='px-2'>
                                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-per-quantity'} tooltipText={`Cost/Pc = Cost (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")}) / Quantity`} />
                                                    <TextFieldHookForm
                                                        label={`Cost/Pc (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")})`}
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
                                                {isFromImport && <Col md={3} className='px-2'>
                                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-per-quantity-coversion'} tooltipText={`Cost/Pc = Cost (${reactLocalStorage.getObject("baseCurrency")})  / Quantity`} />
                                                    <TextFieldHookForm
                                                        label={`Cost/Pc (${reactLocalStorage.getObject("baseCurrency")})`}
                                                        name={'CostPerQuantityConversion'}
                                                        id={'cost-per-quantity-coversion'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.CostPerQuantityConversion}
                                                        disabled={true}
                                                    />
                                                </Col>}
                                            </>
                                        }
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
                                                    <th>{`Percentage (%)`}</th>
                                                    <th> {`Cost (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")})`} </th>
                                                    {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item.ConditionCost}</td>
                                                            <td>{item.ConditionType}</td>
                                                            <td>{item.Percentage !== '-' ? checkForDecimalAndNull(item.Percentage, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item.CostCurrency !== '-' ? item.CostCurrency : '-'}</td>
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
                                                        <td colSpan="5">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr className='table-footer'>
                                                    <td colSpan={initialConfiguration.IsShowCRMHead ? 3 : 3} className='text-right'>
                                                        Total Cost ({reactLocalStorage.getObject("baseCurrency")}):
                                                    </td>
                                                    <td>
                                                        {checkForDecimalAndNull(totalCostCurrencySum, initialConfiguration.NoOfDecimalForPrice)}
                                                    </td>
                                                    {!props.hideAction && <td></td>} {/* Adjusting column span to fit the layout */}
                                                </tr>
                                            </tbody>
                                        </Table>
                                        {/* <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`Cost`}</th>
                                                    <th>{`Type`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    <th> {`Cost (${isFromImport ? currency?.label : reactLocalStorage.getObject("baseCurrency")})`} </th>
                                                    {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item.ConditionCost}</td>
                                                            <td>{item.ConditionType}</td>
                                                            <td>{item.Percentage !== '-' ? checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item.CostCurrency !== '-' ? item.CostCurrency : '-'}</td>
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
                                                        <td colSpan="5">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr className='table-footer'>
                                                    <td colSpan={initialConfiguration.IsShowCRMHead ? 4 : 5} className='text-right'>
                                                        Total Other Cost ({reactLocalStorage.getObject("baseCurrency")}):
                                                    </td>
                                                    <td colSpan={2}>
                                                        {checkForDecimalAndNull(totalCostCurrencySum, initialConfiguration.NoOfDecimalForPrice)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table> */}

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
                                            onClick={props.closeDrawer}
                                            //onClick={onFinalSubmit}
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





