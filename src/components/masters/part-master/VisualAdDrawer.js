import React from 'react';
import { useForm, Controller } from "react-hook-form";
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { yupResolver } from '@hookform/resolvers';
import * as yup from "yup";

const schema = yup.object().shape({
    quantity: yup.string().matches(/^[0-9]*$/, 'Please enter valid number').required('this field is required'),
    //firstName: yup.string().matches(/^[A-Za-z ]*$/, 'Please enter valid name').required('this field is required'),
});


export default function VishualAdDrawer(props) {

    const { register, handleSubmit, watch, errors, control } = useForm({
        resolver: yupResolver(schema)
    });

    console.log(watch("quantity")); // watch input value by passing the name of it

    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('')
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        toggleDrawer('')
    }

    const onSubmit = data => {
        console.log('errors', errors)
        props.closeDrawer(data.quantity)
    }
    console.log('errors', errors)

    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div>
            <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                <Container>
                    <div className={'drawer-wrapper'}>

                        <Row className="drawer-heading">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{'Update Quantity'}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row>

                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Quantity"
                                        name={'quantity'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={props.updatedQuantity}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.quantity}
                                    />
                                </Col>
                            </Row>

                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel} >
                                        <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                    </button>

                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn">
                                        <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                        {'Update'}
                                    </button>
                                </div>
                            </Row>

                        </form>
                    </div>
                </Container>
            </Drawer>
        </div>
    );
}

