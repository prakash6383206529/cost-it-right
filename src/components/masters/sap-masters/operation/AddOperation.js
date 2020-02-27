import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, upper } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchPlantDataAPI } from '../../../../actions/master/Comman';
import { createOperationsAPI, getOperationDataAPI, getOperationsMasterAPI, updateOperationAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PlantId: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchPlantDataAPI(res => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { operationId, isEditFlag } = this.props;

        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getOperationDataAPI(operationId, res => { })
            })
        } else {
            this.props.getOperationDataAPI('', res => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { PlantId } = this.state;

        //values.PlantId = PlantId;

        if (this.props.isEditFlag) {
            console.log('values', values);
            const { operationId } = this.props;
            this.setState({ isSubmitted: true });
            let formData = {
                OperationId: operationId,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                IsActive: true,
                OperationName: values.OperationName,
                OperationCode: values.OperationCode,
                Description: values.Description,
            }
            this.props.updateOperationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getOperationsMasterAPI(res => { });
                }
            });
        } else {
            this.props.createOperationsAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.OPERATION_ADD_SUCCESS);
                    { this.toggleModel() }
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
    }

    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }


    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { plantList } = this.props;
        const temp = [];

        if (label == 'plant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Operation' : 'Add Operation'}</ModalHeader>
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
                                                label="Operation Name"
                                                name={"OperationName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Operation Code"
                                                name={"OperationCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                                normalize={upper}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        {/* <Col md="6">
                                            <Field
                                                label="Operation Cost"
                                                name={"BasicOperationCost"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col> */}
                                        {/* <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.plantHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col> */}
                                        <Col md="6">
                                            <Field
                                                label="Description"
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
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
function mapStateToProps({ comman, otherOperation }) {
    const { plantList } = comman;
    const { operationData } = otherOperation;

    let initialValues = {};

    if (operationData && operationData != undefined) {
        initialValues = {
            OperationName: operationData.OperationName,
            OperationCode: operationData.OperationCode,
            Description: operationData.Description,
        }
    }

    return { plantList, operationData, initialValues };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchPlantDataAPI,
    createOperationsAPI,
    getOperationDataAPI,
    getOperationsMasterAPI,
    updateOperationAPI,
})(reduxForm({
    form: 'addOperation',
    enableReinitialize: true,
})(AddOperation));
