import React, { useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import ConditionCosting from './ConditionCosting'
import { getCostingCondition } from '../../../../../actions/Common'
import Toaster from '../../../../common/Toaster'
import TooltipCustom from '../../../../common/Tooltip'
import { trim } from 'lodash'

function AddConditionCosting(props) {
    const { currency, currencyValue, basicRateCurrency, basicRateBase, isFromImport, } = props
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


    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
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
        if (true) {
            if (true) {
                dispatch(getCostingCondition((res) => {
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
            }
        }

    }, [])

    useEffect(() => {
        calculateCostPerQuantity()
    }, [fieldValues])

    const onConditionChange = (e) => {
        setType(e?.ConditionType)
        setValue('Type', e?.ConditionType)
        setValue('Percentage', '')
        setValue('Quantity', '')
        setValue('CostCurrency', '')
        setValue('CostBase', '')
        if (e?.ConditionType === 'Fixed' || e?.ConditionType === 'Quantity') {
            setDisableTotalCost(false)
            setDisableCurrency(false)
            setDisableBase(false)
            setDisableAllFields(true)
            setValue('Percentage', '')
        } else if (e?.ConditionType === 'Percentage') {
            setDisableAllFields(false)
            setDisableTotalCost(true)
            setTotalCostCurrency('')
            setTotalCostBase('')
        } else {
            setDisableAllFields(false)
            setDisableTotalCost(true)
            setTotalCostCurrency('')
            setTotalCostBase('')
        }
    }
    const handleCostChangeCurrency = (e) => {
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

    const handleCostChangeBase = (e) => {
        if (e?.target?.value) {
            const costCurrency = checkForNull(e.target.value) / checkForNull(currencyValue)
            setValue("CostCurrency", checkForDecimalAndNull(costCurrency, initialConfiguration.NoOfDecimalForPrice))
            setDisableCurrency(true)
            setTotalCostBase(e.target.value)
            setTotalCostCurrency(costCurrency)
        } else {
            setValue("CostCurrency", '')
            setDisableCurrency(false)
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


    const addData = () => {
        if (((getValues('Type') === 'Fixed' || getValues('Type') === 'Quantity') && !getValues('CostCurrency')) || (getValues('Type') === 'Percentage' && !getValues('Percentage'))) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        if (errors.Percentage) return false;

        const newCondition = getValues('Condition') ? getValues('Condition') : null;

        const newData = {
            CostingConditionMasterId: newCondition ? newCondition.CostingConditionMasterId : '',
            ConditionNumber: newCondition ? newCondition.CostingConditionNumber : '',
            Description: newCondition ? newCondition.label : '',
            ConditionType: getValues('Type') ? getValues('Type') : '',
            ConditionPercentage: getValues('Percentage') ? getValues('Percentage') : '',
            ConditionCost: totalCostCurrency ? totalCostCurrency : '',
            ConditionCostConversion: totalCostBase ? totalCostBase : '',
            ConditionCostPerQuantity: getValues('ConditionCostPerQuantity') ? getValues('ConditionCostPerQuantity') : '',
            ConditionQuantity: getValues('Quantity') ? getValues('Quantity') : '',
            ConditionCostPerQuantityConversion: getValues('CostPerQuantityConversion') ? getValues('CostPerQuantityConversion') : '',
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

    const resetData = () => {
        setValue('Condition', '')
        setValue('Type', '')
        setValue('Percentage', '')
        setValue('CostCurrency', '')
        setValue('CostBase', '')
        setValue('ConditionCostPerQuantity', '')
        setValue('Quantity', '')
        setDisableAllFields(true)
        setDisableTotalCost(true)
        setTotalCostCurrency('')
        setTotalCostBase('')
        setIsEditMode(false)
        setType('')
        setEditIndex('')
    }

    // This function takes in two parameters - the index of the data being edited or deleted, and the operation to perform (either 'delete' or 'edit').
    const editData = (indexValue, operation) => {

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
            setValue('Type', Data.ConditionType)
            setValue('Percentage', checkForDecimalAndNull(Data.ConditionPercentage, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostCurrency', checkForDecimalAndNull(Data.ConditionCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostBase', checkForDecimalAndNull(Data.ConditionCostConversion, initialConfiguration.NoOfDecimalForPrice))
            setValue('Quantity', Data.ConditionQuantity)
            setTotalCostCurrency(Data?.ConditionCost)
            setTotalCostBase(Data?.ConditionCostConversion)
            setType(Data.ConditionType)
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
        let ConditionCostPerQuantity = cost / quantity
        let ConditionCostPerQuantityConversion = costBase / quantity
        setValue('ConditionCostPerQuantity', checkForDecimalAndNull(ConditionCostPerQuantity, initialConfiguration.NoOfDecimalForPrice))
        setValue('CostPerQuantityConversion', checkForDecimalAndNull(ConditionCostPerQuantityConversion, initialConfiguration.NoOfDecimalForPrice))
    }
    return (

        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-820px'}>

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

                                    <Col md="3" className='pr-1'>
                                        <SearchableSelectHookForm
                                            label={`Condition`}
                                            name={'Condition'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={conditionDropdown}
                                            handleChange={onConditionChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Condition}
                                            disabled={props.ViewMode}
                                        />
                                    </Col>
                                    <Col md={3} className='px-1'>
                                        <TextFieldHookForm
                                            label={`Type`}
                                            name={'Type'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            handleChange={() => { }}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Type}
                                            disabled={true}
                                        />
                                    </Col>
                                    {type === 'Quantity' && <Col md="3" className='px-1'>
                                        <NumberFieldHookForm
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
                                    </Col>}
                                    {type === 'Percentage' && <Col md={3} className='px-1'>
                                        <NumberFieldHookForm
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
                                    </Col>}
                                    <Col md={3} className={'px-1'}>
                                        {type === 'Percentage' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Price'} />}
                                        <NumberFieldHookForm
                                            label={`Cost (${isFromImport ? currency?.label : initialConfiguration?.BaseCurrency})`}
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
                                    {isFromImport && <Col md={3} className='px-1'>
                                        {type === 'Percentage' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Rate'} />}
                                        <NumberFieldHookForm
                                            label={`Cost (${initialConfiguration?.BaseCurrency})`}
                                            name={'CostBase'}
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
                                            errors={errors.CostBase}
                                            disabled={props.ViewMode || disableTotalCost || disableBase}
                                        />
                                    </Col>}
                                    {type === 'Quantity' && <>
                                        <Col md={3} className='px-1'>
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-per-quantity'} tooltipText={`Cost Per Quantity = Cost (${isFromImport ? currency?.label : initialConfiguration?.BaseCurrency}) / Quantity`} />
                                            <NumberFieldHookForm
                                                label={`Cost Per Quantity (${isFromImport ? currency?.label : initialConfiguration?.BaseCurrency})`}
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
                                        {isFromImport && <Col md={3} className='px-1'>
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-per-quantity-coversion'} tooltipText={`Cost Per Quantity = Cost (${initialConfiguration?.BaseCurrency})  / Quantity`} />
                                            <NumberFieldHookForm
                                                label={`Cost Per Quantity (${initialConfiguration?.BaseCurrency})`}
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
                                    <Col md="3" className={`${type === 'Percentage' ? 'mb-3' : 'mt-4 pt-1'}`}>
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
                                            onClick={resetData}
                                            disabled={props.ViewMode}
                                        >
                                            Reset
                                        </button>
                                    </Col>
                                </Row>
                                {/* <NpvCost showAddButton={false} tableData={tableData} hideAction={false} editData={editData} /> */}
                                {<ConditionCosting tableData={tableData} hideAction={false} editData={editData} ViewMode={props.ViewMode} isFromImport={isFromImport} currency={currency} />}
                            </div>
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
                                        onClick={() => { props.closeDrawer('save', tableData) }}
                                        disabled={props.ViewMode}
                                    >
                                        <div className={"save-icon"}></div>
                                        {'Save'}
                                    </button>
                                </div>
                            </Row>
                        </div>
                    </Container>
                </div>
            </Drawer>
        </div >

    )
}
export default React.memo(AddConditionCosting)