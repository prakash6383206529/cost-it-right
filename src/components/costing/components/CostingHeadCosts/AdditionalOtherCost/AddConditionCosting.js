import React, { useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { typePercentageAndFixed } from '../../../../../config/masterData'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6 } from "../../../../../helper/validation";
import ConditionCosting from './ConditionCosting'

function AddConditionCosting(props) {
    const [tableData, setTableData] = useState(props.tableData)
    const [disableTotalCost, setDisableTotalCost] = useState(false)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [conditionDropdown, setConditionDropdown] = useState([])

    const { register, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch();

    const cancel = () => {
        props.closeDrawer('Close')
    }

    // This function is called when the user clicks a button to add data to a table.
    const addData = () => {

    }

    const resetData = () => {
        setValue('TypeOfNpv', '')
        setValue('NpvPercentage', '')
        setValue('Quantity', '')
        setValue('Total', '')
        setDisableAllFields(true)
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
        }

        // If the operation is 'edit', set the editIndex state to the index of the data being edited, and set the isEditMode state to true.
        if (operation === 'edit') {
            setEditIndex(indexValue)
            setIsEditMode(true)

            // Retrieve the data at the specified index from the tableData array, and set the values of various form fields based on the data.
            let Data = tableData[indexValue]
            setDisableAllFields(false)
            setValue('TypeOfNpv', { label: Data.NpvType, value: Data.NpvType })
            setValue('NpvPercentage', Data.NpvPercentage)
            setValue('Quantity', Data.Quantity)
            setValue('Total', Data.Cost)
            setDisableTotalCost(true)
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
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.LossOfType}
                                            disabled={props.CostingViewMode}
                                        />
                                    </Col>
                                    <Col md="2" className='px-1'>
                                        <SearchableSelectHookForm
                                            label={`Type`}
                                            name={'Type'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            options={typePercentageAndFixed}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.LossOfType}
                                            disabled={props.CostingViewMode}
                                        />
                                    </Col>
                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Percentage`}
                                            name={'Percentage'}
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

                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.Percentage}
                                            disabled={props.CostingViewMode}
                                        />
                                    </Col>
                                    <Col md="2" className='px-1'>
                                        <NumberFieldHookForm
                                            label={`Cost`}
                                            name={'Cost'}
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
                                            errors={errors.Total}
                                            disabled={props.CostingViewMode}
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
                                <ConditionCosting tableData={tableData} hideAction={false} editData={editData} />
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
                                        onClick={() => { props.closeDrawer('Close', tableData) }} >
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