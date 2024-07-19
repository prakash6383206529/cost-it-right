import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { createMBOMAssembly } from '../actions/BillOfMaterial'
import { getPlantSelectListByType } from '../../../actions/Common';
import { ZBC } from '../../../config/constants';


const FetchDrawer = (props) => {
    const { register, handleSubmit, formState: { errors }, control } = useForm();
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const [plantCode, setPlantCode] = useState("");
    const [partCode, setPartCode] = useState("");
    const dispatch = useDispatch()

    // Post api and get Api integration is pending.
    const renderListing = () => {

        let temp = []
        plantSelectList && plantSelectList.map(item => {
            if (item.PlantId === '0') return false;
            temp.push({ label: item.PlantCode, value: item.PlantId })
            return null;
        });

        return temp
    }
    //RE
    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, "MASTER", "", () => { }))
    }, [])

    const cancel = () => {
        props.toggleDrawer()
    }

    const onSubmit = data => {
        let obj = {
            productNumber: partCode,
            plantCode: plantCode
        }
        dispatch(createMBOMAssembly(obj, () => { }))
        props.toggleDrawer()
    }

    const handlePlantCodeChange = (e) => {
        setPlantCode(e.label)
    }

    const handlePartCodeChange = (e) => {
        setPartCode(e.target.value)
    }

    return (
        <>
            <Drawer className="BOM-Drawer" open={props.isOpen} anchor={props.anchor}
            // onClose={(e) => this.toggleDrawer(e)}
            >
                <Container>
                    <div className={'drawer-wrapper'}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`Fetch BOM`}</h3>
                                </div>
                                <div
                                    onClick={(e) => props.toggleDrawer()}
                                    className={'close-button right'}>
                                </div>
                            </Col>

                        </Row>


                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="pl-3">
                                <Col md="12">
                                    <SearchableSelectHookForm
                                        label={"Plant Code"}
                                        name={"plantCode"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        //defaultValue={otherCostType.length !== 0 ? otherCostType : ""}
                                        options={renderListing()}
                                        mandatory={false}
                                        handleChange={handlePlantCodeChange}
                                        errors={errors.plantCode}
                                        disabled={false}
                                    />
                                </Col>

                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Product Code"
                                        name={'partCode'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={handlePartCodeChange}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.partCode}
                                        disabled={false}
                                    />
                                </Col>
                            </Row>

                            <Row className="justify-content-between row">
                                <div className="col-sm-12 text-right">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button type="submit" className="submit-button save-btn">
                                        <div class="save-icon"></div>
                                        {"SEND"}
                                    </button>
                                </div>
                            </Row>
                        </form>

                    </div>
                </Container>
            </Drawer>
        </ >
    );
}



export default FetchDrawer

