import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, } from "../../layout/FormInputs";
import { createBOPCategory } from '../actions/BoughtOutParts';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'

class AddBOPCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false
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

    toggleDrawer = (event, formData) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', formData)
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, } = this.props;

        if (isEditFlag) {


        } else {
            let formData = {
                Category: values.Category,
                LoggedInUserId: loggedInUserId()
            }
            this.props.createBOPCategory(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.BOP_CATEGORY_ADD_SUCCESS);
                    this.toggleDrawer('', formData)
                }
            });
        }
    }

    handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;
        return (
            <>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update BOP Category' : 'Add BOP Category'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="12">
                                        <Field
                                            label={`Category`}
                                            name={"Category"}
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
                                    <div className="col-md-12 pr-3">
                                        <div className="text-right ">
                                            <button
                                                type={"button"}
                                                className=" mr15 cancel-btn"
                                                onClick={this.cancel}
                                            >
                                                <div className={"cross-icon"}>
                                                    {" "}
                                                    <img
                                                        alt={""}
                                                        src={cancelImg}
                                                    ></img>
                                                </div>{" "}
                                                {"Cancel"}
                                            </button>

                                            <button
                                                type="submit"
                                                className="user-btn save-btn"
                                            >
                                                <div className={"check-icon"}>
                                                    <img
                                                        alt={""}
                                                        src={saveImg}
                                                    ></img>
                                                </div>{" "}
                                                {isEditFlag ? "Update" : "Save"}
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
function mapStateToProps() {

    let initialValues = {};

    return { initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createBOPCategory,
})(reduxForm({
    form: 'AddBOPCategory',
    enableReinitialize: true,
})(AddBOPCategory));
