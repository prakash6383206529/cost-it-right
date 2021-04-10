import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';

function Simulation(props) {

    let options = {}

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
    }, [])

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const masterList = useSelector(state => state.simulation.masterSelectList)
    console.log(masterList, "MASTER LIST");
    const [master, setMaster] = useState({ label: 'RM Domestic', value: "0" })

    const handleMasterChange = (e) => {
        setMaster(e.target.value)
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
        <div>
            <Row>
                <Col sm="4">
                    <h1>{`Simulation`}</h1>
                </Col>
            </Row>
            <Row>
                <Col md="1">
                    <div>Masters:</div>
                </Col>
                <Col md="3">
                    <div className="flex-fill filled-small hide-label">
                        <SearchableSelectHookForm
                            label={''}
                            name={'Masters'}
                            placeholder={'Masters'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            // defaultValue={plant.length !== 0 ? plant : ''}
                            options={renderListing('masters')}
                            mandatory={false}
                            handleChange={() => { }}
                            errors={errors.Masters}
                        />
                    </div>
                </Col>
            </Row>
            <RMDomesticListing />
        </div>
    );
}

export default Simulation;