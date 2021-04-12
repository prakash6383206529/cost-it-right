import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import RMImportListing from '../../masters/material-master/RMImportListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from './SimulationUploadDrawer';
import { RMDOMESTIC, RMIMPORT } from '../../../config/constants';

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
    const [master, setMaster] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)

    const handleMasterChange = (value) => {
        console.log(value, "Value");
        setMaster(value)
        setShowMasterList(true)

    }

    const renderModule = (value) => {
        switch (value.label) {
            case RMDOMESTIC:
                return (
                    <RMDomesticListing isSimulation={true} />
                )
            case RMIMPORT:
                return (
                    <RMImportListing isSimulation={true} />
                )
            default:
                break;
        }
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

    /**
   * @method closeGradeDrawer
   * @description  used to toggle grade Popup/Drawer
   */
    const closeDrawer = (e = '') => {
        setShowDrawer(false)
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
                            handleChange={handleMasterChange}
                            errors={errors.Masters}
                        />
                    </div>
                </Col>
            </Row>
            {/* <RMDomesticListing isSimulation={true} /> */}
            {
                showMasterList && renderModule(master)
            }
            <Col md="12" lg="12" className="mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                    <div>
                        <button type="button" className={"user-btn edit-btn mt2 mr5"}>
                            <div className={"cross-icon"}> <img src={require("../../../assests/images/edit-yellow.svg")} alt="delete-icon.jpg" /> </div>
                            {"EDIT"} </button>
                        <button type="button" className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button>
                        <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>Bulk Upload </button>
                    </div>
                </div>
            </Col>

            {
                showUploadDrawer &&
                <SimulationUploadDrawer
                    isOpen={showUploadDrawer}
                    closeDrawer={closeDrawer}
                    anchor={"right"}
                />
            }
        </div>
    );
}

export default Simulation;