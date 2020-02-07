import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField } from "../../../../layout/FormInputs";
import { createRMGradeAPI } from '../../../../../actions/master/Material';
import { fetchRowMaterialAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";

class AddGrade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false
        }
    }

    /**
    * @method componentWillMount
    * @description call before rendering the component
    */
    componentWillMount() {
        this.props.fetchRowMaterialAPI(res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
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
    * @method renderTypeOfListing
    * @description Used show listing of row material
    */
    renderTypeOfListing = () => {
        const { rowMaterialList } = this.props;
        const temp = [];
        rowMaterialList && rowMaterialList.map(item =>
            temp.push({ Text: item.Text, Value: item.Value })
        );
        return temp;
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

        let loginUserId = loggedInUserId();
        //values.CreatedBy = loginUserId;

        this.props.createRMGradeAPI(values, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.GRADE_ADD_SUCCESS);
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.GRADE}`}</ModalHeader>
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
                                                label={`${CONSTANT.GRADE}`}
                                                name={"Grade"}
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
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.MATERIAL}`}
                                                name={"RawMaterialId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing()}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
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
function mapStateToProps({ comman }) {
    const { rowMaterialList } = comman;
    return { rowMaterialList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createRMGradeAPI, fetchRowMaterialAPI })(reduxForm({
    form: 'AddGrade',
    enableReinitialize: true,
})(AddGrade));
