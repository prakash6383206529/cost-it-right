import React, { useState } from 'react'
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

function AddNpvCost(props) {
    const [tableData, setTableData] = useState(props.tableData)
    const [disableNpvPercentage, setDisableNpvPercentage] = useState(false)
    const [disableTotalCost, setDisableTotalCost] = useState(false)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [disableQuantity, setDisableQuantity] = useState(false)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    let IsEnterToolCostManually = false

    const { ToolTabData } = useSelector(state => state.costing)
    const { npvData } = useSelector(state => state.costing)

    const { register, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch();

    const cancel = () => {
        props.closeDrawer('Close')
    }

    const handleNpvChange = (value) => {
        setDisableAllFields(false)

        if (value.label === 'Tool Investment') {
            if (!IsEnterToolCostManually) {
                setDisableQuantity(true)
                setValue('Quantity', checkForNull(ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse[0]?.Life))
            }
        } else {
            setDisableQuantity(false)
        }
    }


    const handleQuantityChange = (e) => {

        if (e?.target?.value) {

            if (disableTotalCost) {

                let NpvPercentage = getValues('NpvPercentage')
                let quantity = e.target.value
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity
                setValue('Total', checkForDecimalAndNull(total, 6))

            } else if (disableNpvPercentage) {

                let total = getValues('Total')
                let quantity = e.target.value
                let npvPercent = (total * 100) / (props.netPOPrice * quantity)
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, 6))

            }
        }
    }

    const handleNpvPercentageChange = (e) => {

        if (e?.target?.value) {
            setDisableTotalCost(true)

            if (getValues('Quantity')) {
                let NpvPercentage = e.target.value
                let quantity = getValues('Quantity')
                let total = (NpvPercentage / 100) * checkForNull(props.netPOPrice) * quantity
                setValue('Total', checkForDecimalAndNull(total, 6))
                errors.Total = []
            }

        } else {

            setDisableTotalCost(false)
            setValue('', '')
        }
    }

    const handleTotalCostChange = (e) => {

        if (e?.target?.value) {
            setDisableNpvPercentage(true)

            if (getValues('Quantity')) {

                let total = e.target.value
                let quantity = getValues('Quantity')
                let npvPercent = (total * 100) / (props.netPOPrice * quantity)
                setValue('NpvPercentage', checkForDecimalAndNull(npvPercent, 6))
            }

        } else {

            setDisableNpvPercentage(false)
            setValue('NpvPercentage', '')
        }
    }

    const addData = () => {
        let table = tableData
        let indexOfNpvType
        let type = getValues('TypeOfNpv') ? getValues('TypeOfNpv').label : ''
        let alreadyDataExist = false
        table && table.map((item, index) => {
            if (item.NpvType === type) {
                alreadyDataExist = true
                indexOfNpvType = index
            }
        })

        if ((alreadyDataExist && !isEditMode) || (isEditMode && indexOfNpvType !== editIndex && indexOfNpvType)) {
            Toaster.warning('Duplicate entry is not allowed.')
            return false
        }

        if (getValues('TypeOfNpv') && getValues('NpvPercentage') && getValues('Quantity')) {
            let obj = {}
            obj.NpvType = getValues('TypeOfNpv') ? getValues('TypeOfNpv').label : ''
            obj.NpvPercentage = getValues('NpvPercentage') ? getValues('NpvPercentage') : ''
            obj.Quantity = getValues('Quantity') ? getValues('Quantity') : ''
            obj.Cost = getValues('Total') ? getValues('Total') : ''

            if (isEditMode) {
                table = Object.assign([...table], { [editIndex]: obj })
            } else {
                table.push(obj)
            }
            dispatch(setNPVData(table))
            setTableData(table)
            resetData()
            setIsEditMode(false)
            setEditIndex('')
        } else {
            Toaster.warning('Please enter data in all mandatory fields.')
        }
    }

    const resetData = () => {

        setValue('TypeOfNpv', '')
        setValue('NpvPercentage', '')
        setValue('Quantity', '')
        setValue('Total', '')
        setDisableAllFields(true)

    }


    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            let temp = []
            tableData && tableData.map((item, index) => {
                if (index !== indexValue) {
                    temp.push(item)
                }
            })
            setTableData(temp)
        }

        if (operation === 'edit') {
            setEditIndex(indexValue)
            setIsEditMode(true)
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

        < div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                < div className={`ag-grid-react`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper drawer-1500px'}>

                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'ADD NPV:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <Row>

                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Type of NPV`}
                                        name={'TypeOfNpv'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        options={typeofNpvDropdown}
                                        handleChange={handleNpvChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.LossOfType}
                                        disabled={props.CostingViewMode}
                                    />
                                </Col>
                                <Col md="2" className='px-1'>
                                    <NumberFieldHookForm
                                        label={`NPV Percenatge(%)`}
                                        name={'NpvPercentage'}
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

                                        handleChange={handleNpvPercentageChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NpvPercentage}
                                        disabled={props.CostingViewMode || disableNpvPercentage || disableAllFields}
                                    />
                                </Col>
                                <Col md="2" className='px-1'>
                                    <NumberFieldHookForm
                                        label={`Quantity`}
                                        name={'Quantity'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                        }}
                                        handleChange={handleQuantityChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Quantity}
                                        disabled={props.CostingViewMode || disableAllFields || disableQuantity}
                                    />
                                </Col>
                                <Col md="2" className='px-1'>
                                    <NumberFieldHookForm
                                        label={`Total`}
                                        name={'Total'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                        }}
                                        handleChange={handleTotalCostChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Total}
                                        disabled={props.CostingViewMode || disableTotalCost || disableAllFields}
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

                            <NpvCost showAddButton={false} tableData={tableData} hideAction={false} editData={editData} />
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
export default React.memo(AddNpvCost)