import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import {
    createCategoryAPI, fetchCategoryMasterDataAPI, getCategoryData, updateCategoryMasterAPI
} from '../../../../actions/master/Category';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class AddCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            categoryTypeId: [],
            isEditFlag: false
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        this.props.fetchCategoryMasterDataAPI(res => { });
    }

    componentDidMount() {
        const { isEditFlag, CategoryId } = this.props;
        if (isEditFlag) {
            this.props.getCategoryData(CategoryId, (res) => {
                if (res && res.data && res.data.Result) {
                    const Data = res.data.Data;
                    const { categoryList } = this.props;
                    const tempObj = categoryList.find(item => item.Value == Data.CategoryTypeId)
                    this.setState({
                        categoryTypeId: { label: tempObj.Text, value: tempObj.Value }
                    });
                }
            })
        } else {
            this.props.getCategoryData('', (res) => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('1');
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
    * @method sourceSupplierHandler
    * @description Used to handle 
    */
    categoryTypeIdHandler = (newValue, actionMeta) => {
        this.setState({ categoryTypeId: newValue });
    };

    /**
    * @method selectType
    * @description Used to show listing of category type listing
    */
    selectType = () => {
        const { categoryList } = this.props;
        const temp = [];

        categoryList && categoryList !== undefined && categoryList.map(item =>
            temp.push({ label: item.Text, value: item.Value })
        );
        return temp;
    }


    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, CategoryId } = this.props;
        const { categoryTypeId } = this.state;
        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                CategoryId: CategoryId,
                Category: values.Category,
                Description: values.Description,
                CategoryTypeId: categoryTypeId.value,
                CreatedBy: loggedInUserId(),
                ModifiedBy: loggedInUserId(),
                IsActive: true
            }
            this.props.updateCategoryMasterAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.CATEGORY_UPDATE_SUCCESS);
                    this.toggleModel();
                }
            })
        } else {
            /** Add new detail of the Category  */
            values.CategoryType = categoryTypeId.label;
            values.CategoryTypeId = categoryTypeId.value;
            this.props.createCategoryAPI(values, (response) => {
                if (response && response.data) {
                    if (response && response.data && response.data.Result) {
                        toastr.success(MESSAGES.CATEGORY_ADD_SUCCESS);
                        this.toggleModel()
                    } else {
                        toastr.error(response.data.Message);
                    }
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update BOP Category' : 'Add BOP Category'}</ModalHeader>
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
                                                label="Category"
                                                name={"Category"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            {/* <Field
                                                label="Category Type"
                                                name={"CategoryType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.selectType()}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            /> */}
                                            <Field
                                                name="CategoryTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Category Type"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.selectType()}
                                                //required={true}
                                                handleChangeDescription={this.categoryTypeIdHandler}
                                                valueDescription={this.state.categoryTypeId}
                                            />
                                        </Col>
                                        <Col md="12">
                                            <Field
                                                label="Description"
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
    const { categoryList, categoryData } = category;
    let initialValues = {};
    if (categoryData && categoryData != undefined) {
        initialValues = {
            Category: categoryData.Category,
            Description: categoryData.Description,
        }
    }
    return { categoryList, categoryData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createCategoryAPI,
    fetchCategoryMasterDataAPI,
    getCategoryData,
    updateCategoryMasterAPI,
})(reduxForm({
    form: 'AddCategory',
    enableReinitialize: true,
})(AddCategory));
