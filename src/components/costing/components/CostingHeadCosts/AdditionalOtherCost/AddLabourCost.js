import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import Toaster from '../../../../common/Toaster'
import LabourCost from './LabourCost'
import { getCostingLabourDetails, getLabourDetailsByFilter } from '../../../actions/Costing'
import DayTime from '../../../../common/DayTimeWrapper'
import { CBCTypeId, EMPTY_GUID, NCCTypeId, NFRTypeId, VBCTypeId, ZBCTypeId } from '../../../../../config/constants'
import { costingInfoContext } from '../../CostingDetailStepTwo'

function AddLabourCost(props) {
    const { item } = props
    const [tableData, setTableData] = useState(props?.tableData)
    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState('')
    const [totalCost, setTotalCost] = useState('')
    const [totalGridCost, setTotalGridCost] = useState(0)
    const [indirectLabourCostState, setIndirectLabourCostState] = useState(0)
    const [staffCostState, setStaffCostState] = useState(0)
    const dispatch = useDispatch()
    const { costingData } = useSelector(state => state.costing)

    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const costData = useContext(costingInfoContext)

    useEffect(() => {
        let labourObj = false
        dispatch(getCostingLabourDetails(item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000", (res) => {

            if (res) {
                setTableData(res?.data?.Data?.CostingLabourDetailList)
                let list = res?.data?.Data?.CostingLabourDetailList
                labourObj = res?.data?.Data
                if (labourObj) {
                    let Data = labourObj
                    setValue('indirectLabourCostPercent', Data?.IndirectLaborCostPercentage)
                    setValue('indirectLabourCost', Data?.IndirectLaborCost)
                    setValue('staffCostPercent', Data?.StaffCostPercentage)
                    setValue('staffCost', Data?.StaffCost)
                    setStaffCostState(Number(Data?.StaffCost))
                    setIndirectLabourCostState(Data?.IndirectLaborCost)
                    let temp = []
                    list && list.map((item, index) => {
                        item.indirectLabourCostPercent = Data?.IndirectLaborCostPercentage
                        item.indirectLabourCost = Data?.IndirectLaborCost
                        item.staffCostPercent = Data?.StaffCostPercentage
                        item.staffCost = Data?.StaffCost
                        temp.push(item)
                    })
                    setTableData(temp)
                }
            }
        }))

        let obj = {}
        obj.partId = costingData.CostingTypeId === CBCTypeId ? item.AssemblyPartId : EMPTY_GUID
        obj.vendorId = costingData.CostingTypeId === VBCTypeId ? item.VendorId : EMPTY_GUID
        obj.customerId = costingData.CostingTypeId === CBCTypeId ? item.CustomerId : EMPTY_GUID
        obj.effectiveDate = DayTime(item.CostingDate).format('DD/MM/YYYY')
        obj.costingHeadId = costingData.CostingTypeId
        obj.plantId = (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId) ? costData.PlantId : EMPTY_GUID
        dispatch(getLabourDetailsByFilter(obj, (res) => {
            if (res) {
                let Data = res.data.DataList[0]
                setValue('labourRate', Data.LabourRate)
                setValue('workingHours', Data.WorkingTime)
                setValue('Efficiency', Data.Efficiency)
            }
        }))
    }, [])


    const handleIndirectPercent = (e) => {

        const sum = tableData.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);
        if (sum) {
            let value = Number(e?.target?.value)
            let indirectLabourCost = (value / 100) * (sum)
            setIndirectLabourCostState(indirectLabourCost)
            setValue('indirectLabourCost', checkForDecimalAndNull(indirectLabourCost, initialConfiguration.NoOfDecimalForPrice))

            let temp = []
            tableData && tableData.map((item, index) => {
                item.indirectLabourCostPercent = value
                item.indirectLabourCost = indirectLabourCost
                temp.push(item)
            })
            setTableData(temp)
        }
    }

    const handleStaffCostPercent = (e) => {

        let sum = tableData.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);
        sum = sum + indirectLabourCostState

        if (sum && e?.target?.value) {
            let value = Number(e?.target?.value)
            let staffCost = (value / 100) * (sum)
            setStaffCostState(Math.round(staffCost))
            setValue('staffCost', checkForDecimalAndNull(staffCost, initialConfiguration.NoOfDecimalForPrice))

            let temp = []
            tableData && tableData.map((item, index) => {
                item.staffCostPercent = value
                item.staffCost = Math.round(staffCost)
                temp.push(item)
            })
            setTableData(temp)
        }
    }


    const handleCycleTime = (e) => {
        if (e?.target?.value) {
            let labourCost
            let labourRate = Number(getValues('labourRate'))
            let workingHours = Number(getValues('workingHours'))
            let efficiency = Number(getValues('Efficiency'))
            efficiency = efficiency / 100
            let cycleTime = Number(e?.target?.value)
            labourCost = labourRate / (workingHours * (efficiency / cycleTime))
            setTotalCost(labourCost)
            setValue('labourCost', checkForDecimalAndNull(labourCost, initialConfiguration.NoOfDecimalForPrice))
        }
    }


    const onPercentChange = (e) => {
        if (e?.target?.value) {
            let cost = checkForNull((e.target.value) / 100) * checkForNull(props.basicRate)
            setValue('Cost', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice))
            setTotalCost(cost)
        }
    }

    const cancel = () => {
        props.closeDrawer('close')
    }


    // This function is called when the user clicks a button to add data to a table.
    const addData = () => {
        let table = [...tableData]
        let indirectLabourCost = indirectLabourCostState

        // Get the current data in the table and set some initial variables.
        let indexOfLabour
        let description = getValues('description') ? getValues('description') : ''
        let alreadyDataExist = false

        // Check if the new data to be added is a duplicate of existing data.
        table && table.map((item, index) => {
            if (item.Description === description) {
                alreadyDataExist = true
                indexOfLabour = index
            }
        })

        // If the new data is a duplicate and we're not in edit mode, show an error message and return false.
        if ((alreadyDataExist && !isEditMode) || (isEditMode && indexOfLabour !== editIndex && (indexOfLabour !== undefined))) {
            Toaster.warning('Duplicate entry is not allowed.')
            return false
        }


        // If all mandatory fields are filled out, create a new object with the data and add it to the table.
        if (getValues('CycleTime') && getValues('labourCost') && getValues('description')) {
            let obj = {}
            obj.Description = getValues('description') ? getValues('description') : ''
            obj.LabourRate = getValues('labourRate') ? getValues('labourRate') : ''
            obj.WorkingTime = getValues('workingHours') ? getValues('workingHours') : ''
            obj.Efficiency = getValues('Efficiency') ? getValues('Efficiency') : ''
            obj.CycleTime = getValues('CycleTime') ? getValues('CycleTime') : ''
            obj.LabourCost = totalCost ? totalCost : ''

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
            let sum = table.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);
            setTotalGridCost(sum)

            if (getValues('indirectLabourCostPercent')) {
                let indirectValuePercent = Number(getValues('indirectLabourCostPercent'))
                let total = (indirectValuePercent / 100) * sum
                setValue('indirectLabourCost', checkForDecimalAndNull(total, initialConfiguration.NoOfDecimalForPrice))
                setIndirectLabourCostState(total)
                indirectLabourCost = total
            }

            if (getValues('staffCostPercent')) {
                sum = sum + indirectLabourCost
                let staffCostPercent = Number(getValues('staffCostPercent'))
                let totalStaff = (staffCostPercent / 100) * sum
                setValue('staffCost', checkForDecimalAndNull(totalStaff, initialConfiguration.NoOfDecimalForPrice))
                setStaffCostState(totalStaff)
            }


            table && table.map((item, ind) => {
                item.indirectLabourCostPercent = getValues('indirectLabourCostPercent') ? Number(getValues('indirectLabourCostPercent')) : ''
                item.indirectLabourCost = getValues('indirectLabourCost') ? Number(getValues('indirectLabourCost')) : ''
                item.staffCostPercent = getValues('staffCostPercent') ? Number(getValues('staffCostPercent')) : ''
                item.staffCost = getValues('staffCost') ? Number(getValues('staffCost')) : ''
            })


        } else {
            // If not all mandatory fields are filled out, show an error message.
            Toaster.warning('Please enter data in all mandatory fields.')
        }
    }


    const resetData = () => {
        setValue('description', '')
        setValue('labourRate', '')
        setValue('workingHours', '')
        setValue('Efficiency', '')
        setValue('CycleTime', '')
        setValue('labourCost', '')
        setDisableAllFields(true)
        setDisableTotalCost(true)
        setTotalCost('')
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

            setValue('indirectLabourCostPercent', '')
            setValue('indirectLabourCost', '')
            setValue('staffCostPercent', '')
            setValue('staffCost', '')

            temp && temp.map((item, index) => {
                delete item.indirectLabourCostPercent
                delete item.indirectLabourCost
                delete item.staffCostPercent
                delete item.staffCost
            })

            setTableData(temp) // Update the tableData state with the updated array
        }

        // If the operation is 'edit', set the editIndex state to the index of the data being edited, and set the isEditMode state to true.
        if (operation === 'edit') {
            setEditIndex(indexValue)
            setIsEditMode(true)

            // Retrieve the data at the specified index from the tableData array, and set the values of various form fields based on the data.
            let Data = tableData[indexValue]
            setDisableAllFields(false)
            setValue('description', Data.Description)
            setValue('labourRate', Data.LabourRate)
            setValue('workingHours', Data.WorkingTime)
            setValue('Efficiency', Data.Efficiency)
            setValue('CycleTime', Data.CycleTime)
            setValue('labourCost', checkForDecimalAndNull(Data.LabourCost, initialConfiguration.NoOfDecimalForPrice))

            setTotalCost(Data.LabourCost)
            if (Data.ConditionType === 'Fixed') {
                setDisableTotalCost(false)
                setDisableAllFields(true)
            } else {
                setDisableAllFields(false)
                setDisableTotalCost(true)
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
                                        <h3>{'Add Labour:'}</h3>
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
                                        <TextFieldHookForm
                                            label={`Description`}
                                            name={'description'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.description}
                                            disabled={props.CostingViewMode}
                                        />
                                    </Col>
                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Labour Rate (Rs/Shift)`}
                                            name={'labourRate'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Cost}
                                            disabled={true}
                                        />
                                    </Col>

                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Working hours`}
                                            name={'workingHours'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces },
                                                // max: {
                                                //     value: 100,
                                                //     message: 'Percentage should be less than 100'
                                                // },

                                            }}

                                            handleChange={onPercentChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.workingHours}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Efficiency`}
                                            name={'Efficiency'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Efficiency}
                                            disabled={true}
                                        />
                                    </Col>

                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Cycle Time`}
                                            name={'CycleTime'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={handleCycleTime}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.CycleTime}
                                        //disabled={props.CostingViewMode}
                                        />
                                    </Col>

                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Labour Cost Rs/Pcs`}
                                            name={'labourCost'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                //validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.labourCost}
                                            disabled={props.CostingViewMode || disableTotalCost}
                                        />
                                    </Col>
                                    <Col md="3" className="mt-4 pt-1">

                                        <button
                                            type="button"
                                            className={"user-btn  pull-left mt-1"}
                                            onClick={addData}
                                        >
                                            <div className={"plus"}></div>{isEditMode ? "UPDATE" : 'ADD'}
                                        </button>
                                        <button
                                            type="button"
                                            className={"reset-btn pull-left mt-1 ml5"}
                                            onClick={resetData}
                                        >
                                            Reset
                                        </button>
                                    </Col>
                                </Row>
                                {/* <NpvCost showAddButton={false} tableData={tableData} hideAction={false} editData={editData} /> */}
                                {<LabourCost hideAction={false} tableData={tableData} editData={editData} />}

                                <Row className='mt-4'>
                                    <Col md="2" className='m-2'>
                                        <NumberFieldHookForm
                                            label={`Indirect Labour Cost (%)`}
                                            name={'indirectLabourCostPercent'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage should be less than 100'
                                                },
                                            }}
                                            handleChange={handleIndirectPercent}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.indirectLabourCostPercent}
                                        //disabled={props.CostingViewMode || disableAllFields}
                                        />
                                    </Col>
                                    <Col md="2" className='m-2'>
                                        <NumberFieldHookForm
                                            label={`Indirect Labour Cost`}
                                            name={'indirectLabourCost'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.indirectLabourCost}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="2" className='m-2'>
                                        <NumberFieldHookForm
                                            label={`Staff Cost (%)`}
                                            name={'staffCostPercent'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage should be less than 100'
                                                },
                                            }}
                                            handleChange={handleStaffCostPercent}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.staffCostPercent}
                                        //disabled={props.CostingViewMode || disableAllFields}
                                        />
                                    </Col>
                                    <Col md="2" className='m-2'>
                                        <NumberFieldHookForm
                                            label={`Staff Cost`}
                                            name={'staffCost'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.staffCost}
                                            disabled={true}
                                        />
                                    </Col>
                                </Row>

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
                                        onClick={() => { props.closeDrawer('save', tableData) }} >
                                        <div className={"save-icon"}></div>
                                        {'Save'}
                                    </button>
                                </div>
                            </Row>
                        </div>
                    </Container>
                </div>
            </Drawer >
        </div >

    )
}
export default React.memo(AddLabourCost)