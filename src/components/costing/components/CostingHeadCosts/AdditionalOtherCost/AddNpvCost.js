import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { typeofNpvDropdown } from '../../../../../config/masterData'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, blockInvalidNumberKeys, nonZero, decimalNumberLimit8And7 } from "../../../../../helper/validation";
import NpvCost from './NpvCost'
import { setNPVData } from '../../../actions/Costing'
import Toaster from '../../../../common/Toaster'
import { getConditionDetails, getNpvDetails } from '../../../../../actions/Common'
import ConditionCosting from './ConditionCosting'
import HeaderTitle from '../../../../common/HeaderTitle'
import LoaderCustom from '../../../../common/LoaderCustom'
import YOYCost from './YOYCost'
import TooltipCustom from '../../../../common/Tooltip'
import Tco from './Tco'
import { ViewCostingContext } from '../../CostingDetails'

function AddNpvCost(props) {
    const { partId, vendorId, drawerType } = props
    const islineInvestmentDrawer = drawerType === "LineInvestmentCost"
    const colMd = islineInvestmentDrawer ? "3" : "2"
    const [tableData, setTableData] = useState(props.tableData)
    const [conditionTableData, seConditionTableData] = useState([])
    const [costingSummary, setCostingSummary] = useState(props.costingSummary ? props.costingSummary : false)
    const [disableNpvPercentage, setDisableNpvPercentage] = useState(false)
    const [disableTotalCost, setDisableTotalCost] = useState(false)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [disableLineCostFields, setDisableLineCostFields] = useState(false)
    const [disableQuantity, setDisableQuantity] = useState(false)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [totalCost, setTotalCost] = useState('')
    const [isLoader, setIsLoader] = useState(false)
    const [partType, setPartType] = useState('')
    let IsEnterToolCostManually = false
    const { ToolTabData, IsRfqCostingType } = useSelector(state => state.costing)
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const isRfqCostingTypeDefined = IsRfqCostingType && (IsRfqCostingType?.costingType || IsRfqCostingType?.isRfqCosting);
    const label = props?.totalCostFromSummary ? 'TCO Cost' : !(isRfqCostingTypeDefined) ? (islineInvestmentDrawer ? "Investment Cost (Line/Plant)" : 'Add NPV:') : 'View TCO:';
    const CostingViewMode = useContext(ViewCostingContext);

    const { register, control, setValue, getValues, clearErrors, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch();

    const watchedValues = useWatch({
        control,
        name: [
            'InvestmentCost',
            'UpfrontPercentage',
            'NpvPercentage',
            'Quantity',
            'AmortizationCost'
        ]
    })

    const [
        investmentCost,
        upfrontPercentage,
        npvPercentage,
        quantity,
        amortizationCost
    ] = watchedValues

    useEffect(() => {
        if (islineInvestmentDrawer && (upfrontPercentage || npvPercentage)) {
            calculateUpfrontCost(investmentCost, upfrontPercentage)
            calculateAmortizationCost(investmentCost, npvPercentage)
        }
    }, [investmentCost, upfrontPercentage, npvPercentage])

    useEffect(() => {
        if (islineInvestmentDrawer) {
            calculateInvestmentCostPerPiece(amortizationCost, quantity)
        } else if (islineInvestmentDrawer && !amortizationCost) {
            setTotalCost(0)
        }
    }, [amortizationCost, quantity, upfrontPercentage])

    useEffect(() => {
        if(islineInvestmentDrawer){
            let val = { label: 'Line Investment', value: 'Line Investment' }
            setValue("TypeOfNpv", val)
            setDisableLineCostFields(tableData?.some(obj => obj.NpvType === 'Line Investment') || false);
        }
    }, [tableData])

    useEffect(() => {
        if (props.costingSummary) {
            setIsLoader(true)
            setTableData(viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingNpvResponse)
            let Data = viewCostingData[props.npvIndex]?.CostingPartDetails?.CostingConditionResponse
            let temp = []
            Data && Data.map((item) => {
                item.condition = `${item.Description} (${item.CostingConditionNumber})`
                temp.push(item)
            })
            seConditionTableData(temp)
            setIsLoader(false)
            setPartType(viewCostingData[0]?.partType)
        }
    }, [])

    const cancel = () => {
        props.closeDrawer('Close')
    }

    const handleNpvChange = (value) => {
        setValue('NpvPercentage', '')
        setValue('Quantity', '')
        setValue('Total', '')
        setTotalCost('')
        setDisableAllFields(false)
        setDisableTotalCost(false)
        setDisableNpvPercentage(false)
        resetErrors()
        if (value.label === 'Tool Investment') {
            if (!IsEnterToolCostManually) {
                setDisableQuantity(true)
                // Sum up all tool life values from ToolTabData
                let totalToolLife = 0;
                if (ToolTabData && ToolTabData?.length > 0) {
                    ToolTabData.forEach(item => {
                        if (item?.CostingPartDetails && item?.CostingPartDetails?.CostingToolCostResponse) {
                            item?.CostingPartDetails?.CostingToolCostResponse?.forEach(tool => {
                                if (tool?.Life) {
                                    totalToolLife += checkForNull(tool?.Life);
                                }
                            });
                        }
                    });
                }
                setValue('Quantity', checkForNull(totalToolLife))
            }
        }
        setDisableQuantity(false)
    }

    const calculateInvestmentCostPerPiece = (amortizationCost, amortizationVolume) => {
        const investmentCostPerPiece = (checkForNull(amortizationCost)/checkForNull(amortizationVolume))
        setValue("Total", checkForDecimalAndNull(investmentCostPerPiece, getConfigurationKey().NoOfDecimalForPrice))
        setTotalCost(checkForDecimalAndNull(investmentCostPerPiece, getConfigurationKey().NoOfDecimalForPrice))
    }

    // This function is used to handle quantity changes in an input field.
    const handleQuantityChange = (e) => {
        let val = e?.target?.value
        if (val) {
            if(islineInvestmentDrawer){
                setValue('Quantity', val)
            }else{

            // If total cost is disabled, calculate the total cost based on the net PO price and quantity input
            if (disableTotalCost) {

                // Get the NPV percentage and quantity input
                let NpvPercentage = getValues('NpvPercentage')
                let quantity = val

                // Calculate the total cost based on the NPV percentage, net PO price, and quantity input
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity

                // Set the value of the 'Total' input field to the calculated total cost
                setValue('Total', checkForDecimalAndNull(total, initialConfiguration?.NoOfDecimalForPrice))
                setTotalCost(total)

                // If NPV percentage is disabled, calculate the NPV percentage based on the total cost and quantity input
            } else if (disableNpvPercentage) {

                // Get the total cost and quantity input
                let total = getValues('Total')
                let quantity = val

                // Calculate the NPV percentage based on the total cost, net PO price, and quantity input
                let npvPercent = (total * 100) / (props.netPOPrice * quantity)

                // Set the value of the 'NpvPercentage' input field to the calculated NPV percentage
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, initialConfiguration?.NoOfDecimalForPrice))

            }
            }
        }
    }

    const calculateAmortizationCost = (investmentCost, amortizationPercent) => {
        if(investmentCost || amortizationPercent){
            const percent = Number(checkForNull(amortizationPercent)).toFixed(2);
            const amortizationCost = (checkForNull(investmentCost) * checkForNull(percent))/100
            setValue("AmortizationCost", checkForDecimalAndNull(amortizationCost, initialConfiguration?.NoOfDecimalForPrice))
        }
    }

    const handleNpvPercentageChange = (e) => {

        // If a value is entered in the NpvPercentage field, disable the Total Cost field.
        let value = e?.target?.value
        if(islineInvestmentDrawer){
            const upfrontValue = Math.max(0, (100 - value).toFixed(2));
            setValue("NpvPercentage", Number(value))
            setValue("UpfrontPercentage", checkForNull(upfrontValue))
            clearErrors('UpfrontPercentage');
        }
        if (e?.target?.value) {
            setDisableTotalCost(true)
            if(!islineInvestmentDrawer){
            // If the Quantity field is also filled out, calculate the Total Cost based on the new NpvPercentage value.
            if (getValues('Quantity')) {
                let NpvPercentage = e.target.value
                let quantity = getValues('Quantity')
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity
                setValue('Total', checkForDecimalAndNull(total, initialConfiguration?.NoOfDecimalForPrice))
                setTotalCost(total)
                errors.Total = []
            }
            }

        } else {

            // If the NpvPercentage field is empty, enable the Total Cost field and clear the Total Cost value.
            setDisableTotalCost(false)
            setValue('', '')
        }
    }

    const calculateUpfrontCost = (investmentCost, upfrontPercent) => {
        if(investmentCost || upfrontPercent){
            const percent = Number(checkForNull(upfrontPercent)).toFixed(2);
            const upfrontCost = (checkForNull(investmentCost) * checkForNull(percent))/100
            setValue("UpfrontCost", checkForDecimalAndNull(upfrontCost, initialConfiguration?.NoOfDecimalForPrice))
        }
    }
    
    const handleUpfrontPercentageChange = (e) => {
        let val = e?.target?.value
        const npvValue = Math.max(0, (100 - val).toFixed(2));
        setValue("UpfrontPercentage", checkForNull(val))
        setValue("NpvPercentage", checkForNull(npvValue));
        clearErrors('NpvPercentage');
    }


    // This function is called when the "Total Cost" input field changes.
    const handleTotalCostChange = (e) => {
        // Check if there is a value entered in the "Total Cost" field.
        if (e?.target?.value) {

            // Disable the "NPV Percentage" field since it will be calculated automatically.
            setDisableNpvPercentage(true)
            setTotalCost(e.target.value)

            // If there is also a value in the "Quantity" field, calculate the NPV Percentage based on the new total cost.
            if (getValues('Quantity')) {
                let total = e.target.value
                let quantity = getValues('Quantity')
                let npvPercent = (total * 100) / (props.netPOPrice * quantity)
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, initialConfiguration?.NoOfDecimalForPrice))
            }
        } else {

            // If there is no value in the "Total Cost" field, enable the "NPV Percentage" field and clear its value.
            setDisableNpvPercentage(false)
            setValue('NpvPercentage', '')
        }
    }

    const handleInvestmentCostChange = (e) => {
        let val = e?.target?.value
        if (val) {
            setValue("InvestmentCost", checkForNull(val))
        }
    }


    // This function is called when the user clicks a button to add data to a table.
    const addData = () => {
        if (errors.NpvPercentage || errors.InvestmentCost) {
            return false
        }

        if (errors.Quantity) {
            return false
        }

        // Get the current data in the table and set some initial variables.
        let table = [...tableData]
        let indexOfNpvType
        let type = getValues('TypeOfNpv') ? getValues('TypeOfNpv').label : ''
        let alreadyDataExist = false

        // Check if the new data to be added is a duplicate of existing data.
        table && table.map((item, index) => {
            if (item.NpvType === type) {
                alreadyDataExist = true
                indexOfNpvType = index
            }
        })

        // If the new data is a duplicate and we're not in edit mode, show an error message and return false.
        if ((alreadyDataExist && !isEditMode) || (isEditMode && indexOfNpvType !== editIndex && indexOfNpvType)) {
            Toaster.warning('Duplicate entry is not allowed.')
            return false
        }

        const [TypeOfNpv, NpvPercentage, Quantity] = getValues([
            'TypeOfNpv',
            'NpvPercentage',
            'Quantity'
        ])

        const [investmentCost, upfrontPercentage, upfrontCost, amortizationCost] = getValues([
            'InvestmentCost',
            'UpfrontPercentage',
            'UpfrontCost',
            'AmortizationCost'
        ])

        // Check for basic fields
        const hasBasicFields = TypeOfNpv !== '' && npvPercentage !== '' && (!islineInvestmentDrawer || Number(upfrontPercentage) === 100 || quantity !== '')

        // Check for additional fields if islineInvestmentDrawer is true
        const hasLineFields = islineInvestmentDrawer
        ? (investmentCost !== '' && upfrontPercentage !== '' && upfrontCost !== '' && amortizationCost !== '')
        : true

        if(islineInvestmentDrawer){
            const total = checkForNull(upfrontPercentage) + checkForNull(NpvPercentage);
            if (upfrontPercentage > 100 || NpvPercentage > 100) {
                Toaster.warning(`${upfrontPercentage > 100 ? 'Upfront' : 'Amortization'} (%) should not be more than 100%.`);
                return false;
            }
            if (total > 100) {
                Toaster.warning('Total of Upfront (%) and Amortization (%) should not be more than 100%.');
                return false;
            }
            if (total < 100) {
                Toaster.warning('Sum of Upfront (%) and Amortization (%) should be exactly 100%.');
                return false;
            }
        }

        // If all mandatory fields are filled out, create a new object with the data and add it to the table.
        if (hasBasicFields && hasLineFields) {
            let obj = {}
            obj.NpvType = TypeOfNpv ? TypeOfNpv.label : ''
            obj.NpvPercentage = NpvPercentage ? NpvPercentage : ''
            obj.NpvQuantity = Quantity ? Quantity : ''
            obj.NpvCost = totalCost ? totalCost : ''
            obj.InvestmentCost = investmentCost ? investmentCost : ''
            obj.UpfrontPercentage = upfrontPercentage ? upfrontPercentage : ''
            obj.UpfrontCost = upfrontCost ? upfrontCost : ''
            obj.AmortizationCost = amortizationCost ? amortizationCost : ''
            // If we're in edit mode, update the existing row with the new data.
            // Otherwise, add the new row to the end of the table.
            if (isEditMode) {
                table = Object.assign([...table], { [editIndex]: obj })
            } else {
                table.push(obj)
            }

            // Update the table data in the Redux store and reset the form fields.
            dispatch(setNPVData(table))
            setTableData(table)
            resetData()
            setIsEditMode(false)
            setEditIndex('')
            clearErrors();
        } else {
            // If not all mandatory fields are filled out, show an error message.
            Toaster.warning('Please enter data in all mandatory fields.')
        }
    }

    const resetData = () => {
        if(islineInvestmentDrawer){
            let val = { label: 'Line Investment', value: 'Line Investment' }
            setValue("TypeOfNpv", val)
        }else{
            setValue('TypeOfNpv', '')
        }
        setValue('NpvPercentage', '')
        setValue('Quantity', '')
        setValue('Total', '')
        setValue('InvestmentCost', '')
        setValue('UpfrontPercentage', '')
        setValue('UpfrontCost', '')
        setValue('AmortizationCost', '')
        setTotalCost('')
        setDisableAllFields(true)
        setIsEditMode(false)
        clearErrors();
        resetErrors()
    }

    const resetErrors = () => {
        delete errors.NpvPercentage
        delete errors.Quantity
        delete errors.Total
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
            if (tableData[indexValue]?.NpvType === 'Tool Investment') {
                setDisableQuantity(true)
            } else {
                setDisableQuantity(false)
            }
            // Retrieve the data at the specified index from the tableData array, and set the values of various form fields based on the data.
            let Data = tableData[indexValue]
            setValue('TypeOfNpv', { label: Data.NpvType, value: Data.NpvType })
            setValue('NpvPercentage', Data?.NpvPercentage ?? 0)
            setValue('Quantity', Data.NpvQuantity)
            setValue('InvestmentCost', Data.InvestmentCost)
            setValue('UpfrontPercentage', Data?.UpfrontPercentage ?? 0)
            setValue('UpfrontCost', Data.UpfrontCost)
            setValue('AmortizationCost', Data.AmortizationCost)
            setValue('Total', checkForDecimalAndNull(Data.NpvCost, initialConfiguration?.NoOfDecimalForPrice))
            setTotalCost(Data.NpvCost)
            setDisableTotalCost(false)
            setDisableAllFields(false)
            setDisableLineCostFields(false)
            setDisableNpvPercentage(false)
            //setDisableQuantity(false)
        }
    }

    return (

        <div>
            {
                !props.isPDFShow ? <Drawer anchor={props.anchor} open={props.isOpen}
                // onClose={(e) => toggleDrawer(e)}
                >
                    {isLoader && <LoaderCustom />}
                    <div className={`ag-grid-react hidepage-size`}>
                        <Container className="add-bop-drawer">
                            <div className={'drawer-wrapper layout-min-width-820px'}>

                                <Row className="drawer-heading">
                                    <Col className='pl-0'>
                                        {/* !costingSummary && */
                                            <div className={'header-wrapper left'}>

                                                <h3>{label}</h3>
                                            </div>}
                                        <div
                                            onClick={cancel}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <div className='hidepage-size'>
                                    {!costingSummary && (initialConfiguration?.IsShowNpvCost || initialConfiguration?.IsShowLineInvestmentCost) && <Row>
                                        {!islineInvestmentDrawer &&
                                            <Col md="3" className='pr-1'>
                                                <SearchableSelectHookForm
                                                    label={`Type of Investment`}
                                                    name={'TypeOfNpv'}
                                                    placeholder={'Select'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    options={typeofNpvDropdown}
                                                    handleChange={handleNpvChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.LossOfType}
                                                    disabled={CostingViewMode}
                                                />
                                            </Col>
                                        }
                                        {islineInvestmentDrawer &&
                                        <>
                                            <Col md={colMd}>
                                                <NumberFieldHookForm
                                                    label={`Investment Cost`}
                                                    name={'InvestmentCost'}
                                                    id={'Investment-cost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit8And7, nonZero },
                                                    }}
                                                    onKeyDown={blockInvalidNumberKeys}
                                                    handleChange={handleInvestmentCostChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.InvestmentCost}
                                                    disabled={CostingViewMode || disableLineCostFields}
                                                />
                                            </Col>
                                        
                                            <Col md={colMd} className='px-1'>
                                                <NumberFieldHookForm
                                                    label={`Upfront (%)`}
                                                    name={'UpfrontPercentage'}
                                                    id={'upfront-percentage'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={!upfrontPercentage && !npvPercentage}
                                                    rules={{
                                                        required: !!(upfrontPercentage || npvPercentage),
                                                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                        max: {
                                                            value: 100,
                                                            message: 'Percentage should be less than 100'
                                                        },
                                                    }}
                                                    onKeyDown={blockInvalidNumberKeys}
                                                    handleChange={handleUpfrontPercentageChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.UpfrontPercentage}
                                                    disabled={CostingViewMode || disableLineCostFields}
                                                />
                                            </Col>
                                            </>
                                        }
                                        <Col md={colMd} className='px-1'>
                                            {!islineInvestmentDrawer &&
                                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'percentage'} tooltipText={'Percentage = (Total * 100) / Quantity * Net Cost'} />
                                            }
                                            <NumberFieldHookForm
                                                label={`${islineInvestmentDrawer ? "Amortization" : "Percentage"} (%)`}
                                                name={'NpvPercentage'}
                                                id={'percentage'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                // mandatory={!islineInvestmentDrawer || !!(upfrontPercentage || npvPercentage)}
                                                mandatory={!islineInvestmentDrawer || (islineInvestmentDrawer && !upfrontPercentage && !npvPercentage)}
                                                rules={{
                                                    required: !islineInvestmentDrawer || (islineInvestmentDrawer && !upfrontPercentage && !npvPercentage),
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation, ...(islineInvestmentDrawer ? {} : { nonZero })},
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage should be less than 100'
                                                    },

                                                }}
                                                onKeyDown={blockInvalidNumberKeys}
                                                handleChange={handleNpvPercentageChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.NpvPercentage}
                                                // disabled={CostingViewMode || disableNpvPercentage || disableAllFields}
                                                disabled={
                                                    (islineInvestmentDrawer ? disableLineCostFields : disableAllFields || disableNpvPercentage)
                                                    || CostingViewMode
                                                }
                                            />
                                        </Col>
                                        <Col md={colMd} className='px-1'>
                                            <NumberFieldHookForm
                                                label={`${islineInvestmentDrawer ? "Quantity/ Amortization Volume" :"Quantity"}`}
                                                name={'Quantity'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={!islineInvestmentDrawer || Number(upfrontPercentage) !== 100}
                                                rules={{
                                                    required: !islineInvestmentDrawer || Number(upfrontPercentage) !== 100,
                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6, nonZero },
                                                }}
                                                onKeyDown={blockInvalidNumberKeys}
                                                handleChange={handleQuantityChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Quantity}
                                                disabled={
                                                    (islineInvestmentDrawer ? disableLineCostFields : disableAllFields || disableQuantity)
                                                    || CostingViewMode
                                                }
                                            />
                                        </Col>
                                        {islineInvestmentDrawer &&
                                        <>
                                            <Col md="3">
                                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'upFront-cost'} tooltipText={'Upfront Cost = (Investment Cost * Upfront Percentage)/100'} />
                                                <NumberFieldHookForm
                                                    label={`Upfront Cost`}
                                                    name={'UpfrontCost'}
                                                    id={'upFront-cost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6, nonZero },
                                                    }}
                                                    onKeyDown={blockInvalidNumberKeys}
                                                    handleChange={() => {}}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.UpfrontCost}
                                                    disabled={true}
                                                />
                                            </Col>
                                        
                                            <Col md="3" className='px-1'>
                                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'amortization-cost'} tooltipText={'Amortization Cost = (Investment Cost * Amortization %)/100'} />
                                                <NumberFieldHookForm
                                                    label={`Amortization Cost`}
                                                    name={'AmortizationCost'}
                                                    id={'amortization-cost'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6, nonZero },
                                                    }}
                                                    onKeyDown={blockInvalidNumberKeys}
                                                    handleChange={handleTotalCostChange}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.AmortizationCost}
                                                    disabled={true}
                                                />
                                            </Col>
                                            </>
                                        }
                                        <Col md={colMd} className='px-1'>
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-cost'} 
                                                tooltipText={`${islineInvestmentDrawer ? "Investement Cost/Pc = Amortization Cost / (Quantity/Amortization Volume)" : "Total = (Percentage / 100) * Quantity * Net Cost"}`} 
                                            />
                                            {islineInvestmentDrawer &&
                                            <TooltipCustom 
                                                customClass="mt-1" 
                                                tooltipClass="InvestementCost" 
                                                id={`investement-cost`} 
                                                tooltipText={'Amortization Cost/Pc'}
                                            />
                                            }
                                            <NumberFieldHookForm
                                                label={`${islineInvestmentDrawer ? "Investement Cost/Pc" : "Total"}`}
                                                name={'Total'}
                                                id={'total-cost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={!islineInvestmentDrawer}
                                                rules={{
                                                    required: !islineInvestmentDrawer,
                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6, nonZero },
                                                }}
                                                onKeyDown={blockInvalidNumberKeys}
                                                handleChange={handleTotalCostChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Total}
                                                disabled={CostingViewMode || disableTotalCost || disableAllFields || islineInvestmentDrawer}
                                            />
                                        </Col>
                                        <Col md="3" className="mt-4 pt-1">

                                            <button
                                                type="button"
                                                className={"user-btn  pull-left mt-1"}
                                                onClick={addData}
                                                disabled={CostingViewMode || (islineInvestmentDrawer && disableLineCostFields)}
                                            >
                                                <div className={"plus"}></div>{isEditMode ? "UPDATE" : 'ADD'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"reset-btn pull-left mt-1 ml5"}
                                                onClick={resetData}
                                                disabled={CostingViewMode}
                                            >
                                                Reset
                                            </button>
                                        </Col>
                                    </Row>}
                                    {/* 
                                    {initialConfiguration?.IsShowNpvCost && costingSummary &&
                                        <>
                                            <Col md="12">
                                                <HeaderTitle className="border-bottom"
                                                    title={props?.totalCostFromSummary ? 'TCO Cost' : 'NPV Cost'}
                                                    customClass={'underLine-title'}
                                                />
                                            </Col>
                                        </>
                                    } */}
                                    {(initialConfiguration?.IsShowNpvCost || initialConfiguration?.IsShowLineInvestmentCost) && !props?.totalCostFromSummary && <NpvCost drawerType={drawerType} showAddButton={false} tableData={tableData} hideAction={costingSummary} editData={editData} />}
                                    {(props?.totalCostFromSummary || (initialConfiguration?.IsShowTCO && (IsRfqCostingType?.isRfqCosting || IsRfqCostingType?.costingType))) ? (
                                        <Tco costingId={props?.costingId} partType={{ PartType: partType }} />
                                    ) : null}


                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingSummary &&
                                        <div className='firefox-spaces'>
                                            <Col md="12" className={'mt25 firefox-spaces'}>
                                                <HeaderTitle className="border-bottom firefox-spaces"
                                                    title={'Costing Condition'}
                                                    customClass={'underLine-title'}
                                                />
                                            </Col>
                                            <ConditionCosting hideAction={true} tableData={conditionTableData} />
                                        </div>}

                                    {/* {costingSummary && props?.isRfqCosting &&
                                        <div className={'mt25 pb-15'}>
                                            <Col md="12" className={'mt25 pb-15'}>
                                                <HeaderTitle className="border-bottom"
                                                    title={'YOY'}
                                                    customClass={'underLine-title'}
                                                />
                                            </Col>
                                            <YOYCost
                                                outside={true}
                                                NetPOPrice={props.netPOPrice}
                                                setValue={setValue}
                                                getValues={getValues}
                                                control={control}
                                                register={register}
                                                errors={errors}
                                                activeTab={'6'}
                                                patId={partId}
                                                vendorId={vendorId}
                                                hideAddButton={true}
                                            />
                                        </div >} */}
                                </div >
                                {!costingSummary && <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
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
                                            onClick={() => { props.closeDrawer('save', "", tableData) }}
                                            disabled={CostingViewMode}>
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>
                                }
                            </div >
                        </Container >
                    </div >
                </Drawer > : <>
                    {tableData && tableData.length !== 0 && <>
                        <Col md="12">
                            <HeaderTitle className="border-bottom"
                                title={'NPV Cost'}
                                customClass={'underLine-title'}
                            />
                        </Col>
                        {(initialConfiguration?.IsShowNpvCost || initialConfiguration?.IsShowLineInvestmentCost) && <NpvCost drawerType={drawerType} showAddButton={false} tableData={tableData} hideAction={costingSummary} editData={editData} />}
                    </>}
                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingSummary &&
                        <div className='firefox-spaces'>
                            <Col md="12" className={'mt25 firefox-spaces'}>
                                <HeaderTitle className="border-bottom firefox-spaces"
                                    title={'Costing Condition'}
                                    customClass={'underLine-title'}
                                />
                            </Col>
                            <ConditionCosting hideAction={true} tableData={conditionTableData} />
                        </div>}
                    {/* {costingSummary && props?.isRfqCosting &&                       //MINDA
                        <div className={'mt25 pb-15'}>
                            <Col md="12" className={'mt25 pb-15'}>
                                <HeaderTitle className="border-bottom"
                                    title={'YOY'}
                                    customClass={'underLine-title'}
                                />
                            </Col>
                            <YOYCost
                                outside={true}
                                NetPOPrice={props.netPOPrice}
                                setValue={setValue}
                                getValues={getValues}
                                control={control}
                                register={register}
                                errors={errors}
                                activeTab={'6'}
                                patId={partId}
                                vendorId={vendorId}
                                hideAddButton={true}
                            />
                        </div>} */}
                    {!costingSummary && <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
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
                                onClick={() => { props.closeDrawer('save', "", tableData) }}
                                disabled={CostingViewMode}>
                                <div className={"save-icon"}></div>
                                {'Save'}
                            </button>
                        </div>
                    </Row>}
                </>}
        </div >

    )
}
export default React.memo(AddNpvCost)