import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSelectListOfMasters } from '../simulation/actions/Simulation'







function NewReport(props) {

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })


    const masterList = useSelector(state => state.simulation.masterSelectList)
    const dispatch = useDispatch()





    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
    }
        , [])




    const handleMasterChange = (value) => {

    }




    const renderListing = (label) => {
        let temp = []

        if (label === 'masters') {
            masterList && masterList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }












    return (


        <Row>
            <Col md="12" className="filter-block zindex-12">

                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                    <div className="flex-fills label">Masters:</div>
                    <div className="hide-label flex-fills pl-0">
                        <SearchableSelectHookForm
                            label={''}
                            name={'Masters'}
                            placeholder={'Masters'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            //defaultValue={master.length !== 0 ? master : ''}
                            options={renderListing('masters')}
                            mandatory={false}
                            handleChange={handleMasterChange}
                            errors={errors.Masters}
                        />
                    </div>
                </div>

            </Col>
        </Row>
    );
}

export default NewReport;