import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField } from "../../../layout/FormInputs";
import { createCategoryAPI, fetchCategoryMasterDataAPI } from '../../../../actions/master/Category';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';

class AddCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.fetchCategoryMasterDataAPI(res => { });
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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        /** Add new detail of the Category  */
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

    /**
    * @method selectType
    * @description Used to show listing of category type listing
    */
   selectType = () => {
        const { categoryList } = this.props;
        const temp = [];
        categoryList && categoryList !== undefined && categoryList.map(item =>
            temp.push({ Text: item.Text, Value: item.Value })
        );
        return temp;
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.CATEGORY}`}</ModalHeader>
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
                                            <Field
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
                                                {CONSTANT.SAVE}
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
    const { categoryList } = category;
    return { categoryList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createCategoryAPI, fetchCategoryMasterDataAPI })(reduxForm({
    form: 'AddCategory',
    enableReinitialize: true,
})(AddCategory));
