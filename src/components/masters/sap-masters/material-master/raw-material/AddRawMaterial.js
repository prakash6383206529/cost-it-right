import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField } from "../../../../layout/FormInputs";
import { createRawMaterialNameChild } from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddRawMaterial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {

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
        const { RawMaterialId, MaterialSelectList, isEditFlag } = this.props;

        if (isEditFlag) {

            // let formData = {
            //     RawMaterialId: RawMaterialId,
            //     RawMaterialName: values.RawMaterialName,
            //     IsActive: true,
            //     CreatedDate: '',
            //     CreatedBy: loggedInUserId(),
            // }
            // this.props.updateRawMaterialAPI(formData, (res) => {
            //     if (res.data.Result === true) {
            //         toastr.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
            //         this.toggleDrawer('')
            //     }
            // })

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
                                            validate={[required]}
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
                                            <input
                                                //disabled={pristine || submitting}
                                                onClick={this.cancel}
                                                type="button"
                                                value="Cancel"
                                                className="reset mr15 cancel-btn"
                                            />
                                            <input
                                                //disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            />
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
function mapStateToProps({ comman, costWorking, material }) {
    const { plantList, rmGradeList, rmSpecification } = comman;
    const { MaterialSelectList } = costWorking;
    const { rawMaterialData } = material;

    let initialValues = {};
    if (rawMaterialData && rawMaterialData != undefined) {
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
    })(reduxForm({
        form: 'AddRawMaterial',
        enableReinitialize: true,
    })(AddRawMaterial));
