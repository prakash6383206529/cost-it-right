import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText } from "../../../layout/FormInputs";
import { createUnitOfMeasurementAPI, updateUnitOfMeasurementAPI} from '../../../../actions/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddUOM extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
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
        if (this.props.isEditFlag) { 
            const { editIndex } = this.props;
            this.setState({ isSubmitted: true });
            let formData = this.props.partDetails;
            console.log('formData: ', formData);
                formData[editIndex].Name = values.Name;
                formData[editIndex].Title = values.Title;
                formData[editIndex].Description = values.Description;
                formData[editIndex].CreatedBy = values.CreatedBy;

            this.props.updateUnitOfMeasurementAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        }else{
            this.props.createUnitOfMeasurementAPI(values, (res) => {
                if (res.data.Result === true) {
                  toastr.success(MESSAGES.PART_ADD_SUCCESS);
                  {this.toggleModel()}
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update UOM' : 'Add UOM'}</ModalHeader>
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
                                                label="UOM Name"
                                                name={"Name"}
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
                                                label="UOM Title"
                                                name={"Title"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
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
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Created By"
                                                name={"CreatedBy"}
                                                type="text"
                                                placeholder={''}
                                                component={renderText}
                                                className=" withoutBorder "
                                            />
                                        </Col>
                                    </Row>
                                    
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save' }
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
function mapStateToProps({ part}) {
    console.log('part', part);
    const {uniOfMeasurementList} = part;
    let initialValues = {};
    initialValues = {
        // PartNumber: oldformData[uniOfMeasurementList.editIndex].PartNumber,
        // PartName: oldformData[uniOfMeasurementList.editIndex].PartName,
        // MaterialTypeId: oldformData[uniOfMeasurementList.editIndex].MaterialTypeId,
        // MaterialGroupCode: oldformData[uniOfMeasurementList.editIndex].MaterialGroupCode,
        // UnitOfMeasurementId: oldformData[uniOfMeasurementList.editIndex].UnitOfMeasurementId,
        // PartDescription: oldformData[uniOfMeasurementList.editIndex].PartDescription,
    }
    console.log('uniOfMeasurementList: ', uniOfMeasurementList);
    return { uniOfMeasurementList, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {createUnitOfMeasurementAPI,updateUnitOfMeasurementAPI})(reduxForm({
    form: 'addUOM',
    enableReinitialize: true,
})(AddUOM));
