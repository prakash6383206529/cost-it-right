import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { alphaNumeric, required } from "../../../helper/validation";
import { renderText, } from "../../layout/FormInputs";
import {
    createRawMaterialNameChild, getRawMaterialChildById, updateRawMaterialChildName
} from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddRawMaterial extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { ID, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRawMaterialChildById(ID, res => {
                let Data = res.data.Data;
                this.props.change('RawMaterialName', Data.RawMaterialName)
            })
        }

    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { ID, isEditFlag } = this.props;

        if (isEditFlag) {

            let formData = {
                RawMaterialId: ID,
                RawMaterialName: values.RawMaterialName,
                LoggedInUserId: loggedInUserId(),
            }
            this.props.updateRawMaterialChildName(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
                    this.toggleDrawer('')
                }
            })

        } else {
            values.LoggedInUserId = loggedInUserId();
            this.props.createRawMaterialNameChild(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
                    this.toggleDrawer('')
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;
        return (
            <>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Raw Material' : 'Add Raw Material'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <Field
                                            label={`Raw Material Name`}
                                            name={"RawMaterialName"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required, alphaNumeric]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12">
                                        <div className="text-center ">
                                            <button
                                                onClick={this.cancel}
                                                type="submit"
                                                value="CANCEL"
                                                className="reset mr15 cancel-btn">
                                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div>CANCEL</button>
                                            <button
                                                type="submit"
                                                // disabled={isSubmitted ? true : false}
                                                className="btn-primary save-btn" >
                                                <div className={'check-icon'}><i class="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                {this.props.isEditFlag ? 'UPDATE' : 'SAVE'}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rawMaterialData } = material;

    let initialValues = {};
    if (rawMaterialData && rawMaterialData !== undefined) {
        initialValues = {
            RawMaterialName: rawMaterialData.RawMaterialName,
        }
    }

    return { initialValues, rawMaterialData }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        createRawMaterialNameChild,
        getRawMaterialChildById,
        updateRawMaterialChildName,
    })(reduxForm({
        form: 'AddRawMaterial',
        enableReinitialize: true,
    })(AddRawMaterial));
