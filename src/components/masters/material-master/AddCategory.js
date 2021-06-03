import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText } from "../../layout/FormInputs";
import { createRMCategoryAPI, getCategoryDataAPI, updateCategoryAPI } from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddCategory extends Component {
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
        const { CategoryId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getCategoryDataAPI(CategoryId, res => { });
        } else {
            this.props.getCategoryDataAPI('', () => { });
        }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.getCategoryDataAPI('', () => { });
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
        const { CategoryId, isEditFlag } = this.props;

        if (isEditFlag) {
            let formData = {
                CategoryId: CategoryId,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                CategoryName: values.CategoryName,
                Description: values.Description,
            }
            this.props.reset()
            this.props.updateCategoryAPI(formData, () => {
                this.toggleModel()
            })
        } else {

            this.props.reset()
            this.props.createRMCategoryAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.CATEGORY_ADD_SUCCESS);
                    this.toggleModel();
                } else {
                    toastr.error(res.data.message);
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
            <div>
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
                                            <h3>{isEditFlag ? 'Update Category' : 'Add Category'}</h3>
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
                                            label={`${CONSTANT.CATEGORY} ${CONSTANT.NAME}`}
                                            name={"CategoryName"}
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
                                    <div className="col-md-12 bluefooter-butn">
                                        <div className=" ">
                                            {/* <input
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
                                            /> */}
                                            <button
                                                onClick={this.cancel}
                                                type="submit"
                                                value="CANCEL"
                                                className="reset mr15 cancel-btn">

                                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='error-icon' /></div>CANCEL</button>
                                            <button
                                                type="submit"
                                                // disabled={isSubmitted ? true : false}
                                                className="btn-primary save-btn"
                                            >	<div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' />
                                                </div>
                                                {this.state.isEditFlag ? 'UPDATE' : 'SAVE'}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>

                    </Container>
                </Drawer>
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { categoryData } = material;
    let initialValues = {};
    if (categoryData && categoryData !== undefined) {
        initialValues = {
            CategoryName: categoryData.CategoryName,
            Description: categoryData.Description,
        }
    }
    return { categoryData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createRMCategoryAPI,
    getCategoryDataAPI,
    updateCategoryAPI,
})(reduxForm({
    form: 'AddCategory',
    enableReinitialize: true,
})(AddCategory));
