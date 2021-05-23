import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSelectListOfMasters } from '../actions/Simulation';
import BulkUpload from '../../massUpload/BulkUpload';
import { toastr } from 'react-redux-toastr';
import { RMDOMESTIC, RMIMPORT } from '../../../config/constants';

function SimulationUpload(props) {

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const [master, setMaster] = useState({})
    const [uploadData, setUploadData] = useState({})

    const [isBulkUpload, setIsBulkUpload] = useState(false)
    const masterList = useSelector(state => state.simulation.masterSelectList)

    const handleMasterChange = (value) => {
        setMaster(value)
        // setShowMasterList(true)
    }

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
    }, [])

    const closeBulkUploadDrawer = () => {
        setIsBulkUpload(false)
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

    const handleBulkUpload = () => {
        if (Object.keys(master).length === 0) {
            toastr.warning('Please select master to upload the data.')
        } else {

            switch (master) {
                case RMDOMESTIC:
                    setUploadData({ fileName: 'RMDomestic', label: 'RM Domestic' })
                    break;
                case RMIMPORT:
                    setUploadData({ fileName: 'RMImport', label: 'RM Import' })

                default:
                    break;
            }
            setIsBulkUpload(true)

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
                            handleChange={handleMasterChange}
                            errors={errors.Masters}
                        />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <div className="d-flex">
                        <div className="left-border">{'Upload Data:'}</div>
                        <br />
                        <button type="button" className={"user-btn mr5"} onClick={handleBulkUpload}> <div className={"upload"}></div>UPLOAD</button>
                    </div>
                </Col>
            </Row>
            {
                isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={closeBulkUploadDrawer}
                        isEditFlag={false}
                        fileName={uploadData.fileName}
                        isZBCVBCTemplate={true}
                        messageLabel={uploadData.label}
                        anchor={"right"}
                    />
                )
            }
        </div>
    );
}

export default SimulationUpload;