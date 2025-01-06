import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, maxLength80, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, checkSpacesInString } from "../../../helper/validation";
import { focusOnError, renderText, validateForm, } from "../../layout/FormInputs";
import { createBOPCategory } from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, showBopLabel } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';

class AddBOPCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
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
                    Toaster.success(MESSAGES.BOP_CATEGORY_ADD_SUCCESS);
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
        const { handleSubmit, isEditFlag, t } = this.props;
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
                                            <h3>{isEditFlag ? `Update ${showBopLabel()} Category` : `Add ${showBopLabel()} Category`}
                                                <TourWrapper
                                                    buttonSpecificProp={{ id: "BOP_Domestic_Category_Form" }}
                                                    stepsSpecificProp={{
                                                        steps: Steps(t, { isEditFlag: isEditFlag }).BOP_DOMESTIC_CATEGORY_FORM
                                                    }} />
                                            </h3>
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
                                            validate={[required, maxLength80, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, checkSpacesInString]}
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
                                                id='AddBOPDomesticCategory_Cancel'
                                                onClick={this.cancel}
                                            >
                                                <div className={"cancel-icon"}></div>
                                                {"Cancel"}
                                            </button>

                                            <button
                                                type="submit"
                                                className="user-btn save-btn"
                                                id='AddBOPDomesticCategory_Save'
                                            >
                                                <div className={"save-icon"}></div>
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
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: errors => {
        focusOnError(errors);
    },
})(withTranslation(['BOPMaster'])(AddBOPCategory)));
