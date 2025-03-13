import React, { useState } from 'react'
import { Col, Row } from 'reactstrap'
import { TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'

const Hanger = (props) => {
    const { register, control, formState: { errors }, setValue, getValues, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const [state, setState] = useState({
        showHanger: false
    })
    return (
        <>
            <Row>
                <Col md="8"><div className="left-border">
                    {'Hanger Cost:'}
                </div></Col>
                <Col md="4" className="text-right">
                    <button id="Dashboard_Costing_Accordian" className="btn btn-small-primary-circle ml-1 " type="button" onClick={() => { setState({ ...state, showHanger: !state.showHanger }) }}>
                        {state.showHanger ? (
                            <i className="fa fa-minus" ></i>
                        ) : (
                            <i className="fa fa-plus"></i>
                        )}

                    </button>
                </Col>
            </Row>
            {state.showHanger && <Row>
                <Col md="4">
                    <TextFieldHookForm
                        label="Hanger Factor (rate)"
                        name={`HangerFactor`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            // validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            // handleQuantityChange(e)
                        }}
                        errors={errors && errors.HangerFactor}
                    // disabled={(!TransportationType || TransportationType === 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="No. of Parts per Hanger "
                        name={`NoOfPartsPerHanger`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            // validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            // handleQuantityChange(e)
                        }}
                        errors={errors && errors.NoOfPartsPerHanger}
                    // disabled={(!TransportationType || TransportationType === 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="Hanger Cost per Part"
                        name={`HangerCostPerPart`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            // validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                            // maxLength: NUMBERMAXLENGTH
                        }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        handleChange={(e) => {
                            e.preventDefault()
                            // handleQuantityChange(e)
                        }}
                        errors={errors && errors.HangerCostPerPart}
                    // disabled={(!TransportationType || TransportationType === 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                    />
                </Col>
            </Row>}
        </>
    )
}

export default Hanger