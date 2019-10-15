import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText } from "../../../layout/FormInputs";
import { createUnitOfMeasurementAPI, updateUnitOfMeasurementAPI,
     getOneUnitOfMeasurementAPI
} from '../../../../actions/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddUOM extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount(){
        const { uomId,isEditFlag } = this.props;
        if(isEditFlag){
            this.setState({isEditFlag},()=>{  
            this.props.getOneUnitOfMeasurementAPI(uomId,true, res => {})   
        })
        }else{
            this.props.getOneUnitOfMeasurementAPI('',false, res => {})   
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
        if (this.props.isEditFlag) { 
            const { editIndex, uomId} = this.props;
            this.setState({ isSubmitted: true });
            let formData = this.props.unitOfMeasurementList;

                formData[editIndex].Name = values.Name;
                formData[editIndex].Title = values.Title;
                formData[editIndex].Description = values.Description;
                formData[editIndex].CreatedBy = values.CreatedBy;

            this.props.updateUnitOfMeasurementAPI(uomId,formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        }else{
            this.props.createUnitOfMeasurementAPI(values, (res) => {
                if (res.data.Result === true) {
                  toastr.success(MESSAGES.UOM_ADD_SUCCESS);
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
function mapStateToProps({ unitOfMeasrement }) {
    const { unitOfMeasurementData, unitOfMeasurementList } = unitOfMeasrement;
    let initialValues = {};
    if(unitOfMeasurementData && unitOfMeasurementData !== undefined){
        initialValues = {
            Name: unitOfMeasurementData.Name,
            Title: unitOfMeasurementData.Title,
            Description: unitOfMeasurementData.Description,
            CreatedBy: unitOfMeasurementData.CreatedBy,
        }
    }
    return {unitOfMeasurementData, initialValues, unitOfMeasurementList };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {createUnitOfMeasurementAPI,updateUnitOfMeasurementAPI, getOneUnitOfMeasurementAPI})(reduxForm({
    form: 'addUOM',
    enableReinitialize: true,
})(AddUOM));
