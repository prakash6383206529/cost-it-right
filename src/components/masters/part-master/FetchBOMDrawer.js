import React from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from "react-hook-form";



const FetchDrawer = (props) => {
    const { register, handleSubmit, formState: { errors }, control } = useForm();


    // Post api and get Api integration is pending.
    const renderListing = () => {

    }

    const cancel = () => {
        props.toggleDrawer()
    }

    const onSubmit = data => {

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
                                        label={"Plant code"}
                                        name={"plantCode"}
                                        placeholder={"-Select-"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        //defaultValue={otherCostType.length !== 0 ? otherCostType : ""}
                                        options={renderListing()}
                                        mandatory={false}
                                        //handleChange={handleOtherCostTypeChange}
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
                                        handleChange={() => { }}
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

