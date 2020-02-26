import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText } from "../../../layout/FormInputs";
import {
    createCategoryTypeAPI, getCategoryTypeDataAPI, updateCategoryTypeAPI,
    setEmptyCategoryTypeData
} from '../../../../actions/master/Category';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class AddCategoryType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false
        }
    }

    componentDidMount() {
        const { isEditFlag, CategoryTypeId } = this.props;
        if (isEditFlag) {
            this.props.getCategoryTypeDataAPI(CategoryTypeId, () => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('2');
    }

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, CategoryTypeId } = this.props;
        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                CategoryTypeId: CategoryTypeId,
                CategoryType: values.CategoryType,
                Description: values.Description,
                CreatedBy: loggedInUserId(),
                ModifiedBy: loggedInUserId(),
                IsActive: true
            }
            this.props.updateCategoryTypeAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.CATEGORY_TYPE_UPDATE_SUCCESS);
                    this.props.setEmptyCategoryTypeData(() => { })
                    this.toggleModel();
                }
            })
        } else {

            /** Add new detail of the Category Type  */
            this.props.createCategoryTypeAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.CATEGORY_TYPE_ADDED_SUCCESS);
                    this.toggleModel();
                } else {
                    toastr.error(res.data.message);
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
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Category Type' : 'Add Category Type'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.CATEGORY} ${CONSTANT.TYPE}`}
                                                name={"CategoryType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.DESCRIPTION}`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ category }) {
    const { categoryTypeData } = category;
    let initialValues = {};
    if (categoryTypeData && categoryTypeData != undefined) {
        initialValues = {
            CategoryType: categoryTypeData.CategoryType,
            Description: categoryTypeData.Description,
        }
    }
    return { initialValues, categoryTypeData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createCategoryTypeAPI,
    getCategoryTypeDataAPI,
    updateCategoryTypeAPI,
    setEmptyCategoryTypeData,
})(reduxForm({
    form: 'AddCategoryType',
    enableReinitialize: true,
})(AddCategoryType));
