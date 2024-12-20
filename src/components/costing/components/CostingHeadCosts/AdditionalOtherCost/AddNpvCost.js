import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { checkForDecimalAndNull } from '../../../../../helper'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { typeofNpvDropdown } from '../../../../../config/masterData'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull } from "../../../../../helper/validation";
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
    const { partId, vendorId } = props
    const [tableData, setTableData] = useState(props.tableData)
    const [conditionTableData, seConditionTableData] = useState([])
    const [costingSummary, setCostingSummary] = useState(props.costingSummary ? props.costingSummary : false)
    const [disableNpvPercentage, setDisableNpvPercentage] = useState(false)
    const [disableTotalCost, setDisableTotalCost] = useState(false)
    const [disableAllFields, setDisableAllFields] = useState(true)
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
    const label = props?.totalCostFromSummary ? 'TCO Cost' : !(isRfqCostingTypeDefined) ? 'Add NPV:' : 'View TCO:';
    const CostingViewMode = useContext(ViewCostingContext);

    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch();

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

        if (value.label === 'Tool Investment') {
            if (!IsEnterToolCostManually) {
                setDisableQuantity(true)
                setValue('Quantity', checkForNull(ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse[0]?.Life))
            }
        } else {
            setDisableQuantity(false)
        }
    }


    // This function is used to handle quantity changes in an input field.
    const handleQuantityChange = (e) => {

        // Check if there is a value in the input field
        if (e?.target?.value) {

            // If total cost is disabled, calculate the total cost based on the net PO price and quantity input
            if (disableTotalCost) {

                // Get the NPV percentage and quantity input
                let NpvPercentage = getValues('NpvPercentage')
                let quantity = e.target.value

                // Calculate the total cost based on the NPV percentage, net PO price, and quantity input
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity

                // Set the value of the 'Total' input field to the calculated total cost
                setValue('Total', checkForDecimalAndNull(total, initialConfiguration.NoOfDecimalForPrice))
                setTotalCost(total)

                // If NPV percentage is disabled, calculate the NPV percentage based on the total cost and quantity input
            } else if (disableNpvPercentage) {

                // Get the total cost and quantity input
                let total = getValues('Total')
                let quantity = e.target.value

                // Calculate the NPV percentage based on the total cost, net PO price, and quantity input
                let npvPercent = (total * 100) / (props.netPOPrice * quantity)

                // Set the value of the 'NpvPercentage' input field to the calculated NPV percentage
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, initialConfiguration.NoOfDecimalForPrice))

            }
        }
    }

    const handleNpvPercentageChange = (e) => {

        // If a value is entered in the NpvPercentage field, disable the Total Cost field.
        if (e?.target?.value) {
            setDisableTotalCost(true)

            // If the Quantity field is also filled out, calculate the Total Cost based on the new NpvPercentage value.
            if (getValues('Quantity')) {
                let NpvPercentage = e.target.value
                let quantity = getValues('Quantity')
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity
                setValue('Total', checkForDecimalAndNull(total, initialConfiguration.NoOfDecimalForPrice))
                setTotalCost(total)
                errors.Total = []
            }

        } else {

            // If the NpvPercentage field is empty, enable the Total Cost field and clear the Total Cost value.
            setDisableTotalCost(false)
            setValue('', '')
        }
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
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, initialConfiguration.NoOfDecimalForPrice))
            }
        } else {

            // If there is no value in the "Total Cost" field, enable the "NPV Percentage" field and clear its value.
            setDisableNpvPercentage(false)
            setValue('NpvPercentage', '')
        }
    }


    // This function is called when the user clicks a button to add data to a table.
    const addData = () => {

        if (errors.NpvPercentage) {
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

        // If all mandatory fields are filled out, create a new object with the data and add it to the table.
        if (getValues('TypeOfNpv') && getValues('NpvPercentage') && getValues('Quantity')) {
            let obj = {}
            obj.NpvType = getValues('TypeOfNpv') ? getValues('TypeOfNpv').label : ''
            obj.NpvPercentage = getValues('NpvPercentage') ? getValues('NpvPercentage') : ''
            obj.NpvQuantity = getValues('Quantity') ? getValues('Quantity') : ''
            obj.NpvCost = totalCost ? totalCost : ''

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
        } else {
            // If not all mandatory fields are filled out, show an error message.
            Toaster.warning('Please enter data in all mandatory fields.')
        }
    }

    const resetData = () => {
        setValue('TypeOfNpv', '')
        setValue('NpvPercentage', '')
        setValue('Quantity', '')
        setValue('Total', '')
        setTotalCost('')
        setDisableAllFields(true)
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
            setValue('TypeOfNpv', { label: Data.NpvType, value: Data.NpvType })
            setValue('NpvPercentage', Data.NpvPercentage)
            setValue('Quantity', Data.NpvQuantity)
            setValue('Total', checkForDecimalAndNull(Data.NpvCost, initialConfiguration.NoOfDecimalForPrice))
            setTotalCost(Data.NpvCost)
            setDisableTotalCost(false)
            setDisableAllFields(false)
            setDisableNpvPercentage(false)
            setDisableQuantity(false)
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
                                    {!costingSummary && initialConfiguration?.IsShowNpvCost && <Row>

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
                                        <Col md="2" className='px-1'>
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'percentage'} tooltipText={'Percentage = (Total * 100) / Quantity * Net Cost'} />
                                            <NumberFieldHookForm
                                                label={`Percenatge (%)`}
                                                name={'NpvPercentage'}
                                                id={'percentage'}
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

                                                handleChange={handleNpvPercentageChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.NpvPercentage}
                                                disabled={CostingViewMode || disableNpvPercentage || disableAllFields}
                                            />
                                        </Col>
                                        <Col md="2" className='px-1'>
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
                                                handleChange={handleQuantityChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Quantity}
                                                disabled={CostingViewMode || disableAllFields || disableQuantity}
                                            />
                                        </Col>
                                        <Col md="2" className='px-1'>
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-cost'} tooltipText={'Total = (Percentage / 100) * Quantity * Net Cost'} />
                                            <NumberFieldHookForm
                                                label={`Total`}
                                                name={'Total'}
                                                id={'total-cost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                }}
                                                handleChange={handleTotalCostChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Total}
                                                disabled={CostingViewMode || disableTotalCost || disableAllFields}
                                            />
                                        </Col>
                                        <Col md="3" className="mt-4 pt-1">

                                            <button
                                                type="button"
                                                className={"user-btn  pull-left mt-1"}
                                                onClick={addData}
                                                disabled={CostingViewMode}
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
                                    {initialConfiguration?.IsShowNpvCost && !props?.totalCostFromSummary && <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} editData={editData} />}
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
                                            onClick={() => { props.closeDrawer('save', tableData) }}
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
                        {initialConfiguration?.IsShowNpvCost && <NpvCost showAddButton={false} tableData={tableData} hideAction={costingSummary} editData={editData} />}
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
                                onClick={() => { props.closeDrawer('save', tableData) }}
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