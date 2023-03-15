import React, { useState, useEffect } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import { Drawer } from '@material-ui/core'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, } from 'react-redux'
import { typeofNpvDropdown } from '../../../../../config/masterData'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6 } from "../../../../../helper/validation";
import NpvCost from './NpvCost'

function AddNpvCost(props) {
    const [tableData, setTableData] = useState([])

    const { register, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const cancel = () => {
        props.closeDrawer('Close')
    }

    const handleNpvChange = () => {

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

                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NpvPercentage}
                                        disabled={props.CostingViewMode}
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Quantity}
                                        disabled={props.CostingViewMode}
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
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.Total}
                                        disabled={props.CostingViewMode}
                                    />
                                </Col>
                            </Row>

                            <NpvCost showAddButton={false} />
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
                                        onClick={() => { }} >
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