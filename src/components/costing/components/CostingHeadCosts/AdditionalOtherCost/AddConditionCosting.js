import React, { useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { typePercentageAndFixed } from '../../../../../config/masterData'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import ConditionCosting from './ConditionCosting'
import { getCostingCondition } from '../../../../../actions/Common'
import Toaster from '../../../../common/Toaster'
import TooltipCustom from '../../../../common/Tooltip'

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
    const [percentageType, setPercentageType] = useState('')
    const [disableBase, setDisableBase] = useState(false)
    const [disableCurrency, setDisableCurrency] = useState(false)


    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const dispatch = useDispatch();


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
    const onConditionChange = (e) => {
        setValue('Type', '')
        setValue('Percentage', '')
        setValue('Cost', '')
    }

    const onTypeChange = (e) => {
        setValue('Cost', '')
        if (e?.label) {
            setType(e?.label)
            if (e?.label === 'Fixed') {
                setDisableTotalCost(false)
                setDisableCurrency(false)
                setDisableBase(false)
                setDisableAllFields(true)
                setPercentageType(false)
                setValue('Percentage', '')
            } else {
                setDisableAllFields(false)
                setDisableTotalCost(true)
                setPercentageType(true)
                setValue('Cost', '')
                setTotalCostCurrency('')
                setTotalCostBase('')
            }
        }
    }


    const handleCostChangeCurrency = (e) => {
        if (e?.target?.value) {
            const costBase = checkForNull(e.target.value) * checkForNull(currencyValue)
            setValue("CostBase", checkForDecimalAndNull(costBase, initialConfiguration.NoOfDecimalForPrice))
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


    // This function is called when the user clicks a button to add data to a table.
    const addData = () => {
        if (!getValues('Condition') || !getValues('Type') || !getValues('Percentage')) {
            Toaster.warning("Please enter all details to add row.")
            return false
        }
        if (errors.Percentage) {
            return false
        }

        // Get the current data in the table and set some initial variables.
        let table = [...tableData]
        let indexOfNpvType
        let condition = getValues('Condition') ? getValues('Condition').CostingConditionNumber : ''
        let alreadyDataExist = false

        // Check if the new data to be added is a duplicate of existing data.
        table && table.map((item, index) => {
            if (item.CostingConditionNumber === condition) {
                alreadyDataExist = true
                indexOfNpvType = index
            }
        })

        // If the new data is a duplicate and we're not in edit mode, show an error message and return false.
        if ((alreadyDataExist && !isEditMode) || (isEditMode && indexOfNpvType !== editIndex && indexOfNpvType)) {
            Toaster.warning('Duplicate entry is not allowed.')
            return false
        }

        // If all mandatory fields are filled out, create a new object with the data and add it to the table.
        if (getValues('Condition') && getValues('Type') && (getValues('CostCurrency') || getValues('CostBase'))) {
            let obj = {}
            obj.CostingConditionMasterId = getValues('Condition') ? getValues('Condition').CostingConditionMasterId : ''
            obj.ConditionNumber = getValues('Condition') ? getValues('Condition').CostingConditionNumber : ''
            obj.Description = getValues('Condition') ? getValues('Condition').label : ''
            obj.ConditionType = getValues('Type') ? getValues('Type').label : ''
            obj.ConditionPercentage = getValues('Percentage') ? getValues('Percentage') : ''
            obj.ConditionCost = totalCostCurrency ? totalCostCurrency : ''
            obj.ConditionCostConversion = totalCostBase ? totalCostBase : ''

            // If we're in edit mode, update the existing row with the new data.
            // Otherwise, add the new row to the end of the table.
            if (isEditMode) {
                table = Object.assign([...table], { [editIndex]: obj })
            } else {
                table.push(obj)
            }

            // Update the table data in the Redux store and reset the form fields.
            setTableData(table)
            resetData()
            setIsEditMode(false)
            setEditIndex('')

        } else {
            // If not all mandatory fields are filled out, show an error message.
            Toaster.warning('Please enter data in all mandatory fields.')
        }
    }


    const resetData = () => {
        setValue('Condition', '')
        setValue('Type', '')
        setValue('Percentage', '')
        setValue('CostCurrency', '')
        setValue('CostBase', '')
        setDisableAllFields(true)
        setDisableTotalCost(true)
        setTotalCostCurrency('')
        setTotalCostBase('')
        setPercentageType(false)
        setIsEditMode(false)
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
                CostingConditionMasterId: Data.CostingConditionMasterId, CostingConditionNumber: Data.ConditionNumber
            })
            setValue('Type', { label: Data.ConditionType, value: Data.ConditionType })
            setValue('Percentage', checkForDecimalAndNull(Data.ConditionPercentage, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostCurrency', checkForDecimalAndNull(Data.ConditionCost, initialConfiguration.NoOfDecimalForPrice))
            setValue('CostBase', checkForDecimalAndNull(Data.ConditionCostConversion, initialConfiguration.NoOfDecimalForPrice))
            setTotalCostCurrency(Data?.ConditionCost)
            setTotalCostBase(Data?.ConditionCostConversion)
            if (Data.ConditionType === 'Fixed') {
                setDisableTotalCost(false)
                setDisableCurrency(false)
                setDisableBase(false)
                setDisableAllFields(true)
                setPercentageType(false)
            } else {
                setDisableAllFields(false)
                setDisableCurrency(true)
                setDisableBase(true)
                setDisableTotalCost(true)
                setPercentageType(true)
            }
        }
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
                                    <Col md={isFromImport ? 3 : 2} className='px-1'>
                                        <SearchableSelectHookForm
                                            label={`Type`}
                                            name={'Type'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={typePercentageAndFixed}
                                            handleChange={onTypeChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.LossOfType}
                                            disabled={props.ViewMode}
                                        />
                                    </Col>
                                    <Col md={isFromImport ? 3 : 2} className='px-1'>
                                        <NumberFieldHookForm
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
                                    </Col>
                                    <Col md={isFromImport ? 3 : 2} className={isFromImport ? "pl-1" : 'px-1'}>
                                        {type !== 'Fixed' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Rate'} />}
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
                                            errors={errors.Cost}
                                            disabled={props.ViewMode || disableTotalCost || disableCurrency}
                                        />
                                    </Col>
                                    {isFromImport && <Col md={3} className='pr-0'>
                                        {type !== 'Fixed' && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'cost-by-percent'} tooltipText={'Cost = (Percentage / 100) * Basic Rate'} />}
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
                                            errors={errors.Cost}
                                            disabled={props.ViewMode || disableTotalCost || disableBase}
                                        />
                                    </Col>}

                                    <Col md="3" className="mt-4 pt-1">

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
                                {<ConditionCosting tableData={tableData} hideAction={props.ViewMode} editData={editData} ViewMode={props.ViewMode} isFromImport={isFromImport} currency={currency} />}
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
                                        onClick={() => { props.closeDrawer('save', tableData) }}
                                        disabled={props.ViewMode}
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