import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch } from 'react-redux'
// import { pushedApprovedCosting, createRawMaterialSAP, approvalPushedOnSap } from '../../actions/Approval'
// import { loggedInUserId } from '../../../../helper'
import { useForm, Controller } from "react-hook-form";
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs'
// import { materialGroup, purchasingGroup } from '../../../../config/masterData';
import { useState } from 'react'
// import { INR } from '../../../../config/constants'
import moment from 'moment'


function PushSection(props) {
    const { register, handleSubmit, formState: { errors }, control } = useForm();

    return (
        <>
            <Row className="pl-3">
                <Col md="6">
                    <TextFieldHookForm
                        label="Company Code"
                        name={"CompanyCode"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={() => { }}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.CompanyCode}
                        disabled={true}
                    />
                </Col>
                {/* </Row> */}
                {/* <Row className="pl-3"> */}
                <Col md="6">
                    <TextFieldHookForm
                        label="Company Name"
                        name={"CompanyName"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={() => { }}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.CompanyName}
                        disabled={true}
                    />
                </Col>
            </Row>
        </>
    );
}

export default PushSection;