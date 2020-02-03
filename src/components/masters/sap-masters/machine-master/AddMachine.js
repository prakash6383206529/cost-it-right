import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText } from "../../../layout/FormInputs";
import { } from '../../../../actions/master/MachineMaster';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddMachine extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentWillMount() {

    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { machineId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getLabourByIdAPI(machineId, true, res => { })
            })
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
   * @method handleTypeSelection
   * @description called
   */
    handleTypeSelection = e => {
        this.setState({
            typeOfListing: e
        });
    };


    /**
    * @method renderTypeOfListing
    * @description Used show listing of searchable dropdowns
    */
    renderTypeOfListing = (label) => {
        // const { technologyList } = this.props;
        // const temp = [];
        // if (label === 'material') {
        //     rowMaterialDetail && rowMaterialDetail.map(item =>
        //         temp.push({ label: item.RawMaterialName, value: item.RawMaterialId })
        //     );
        //     return temp;
        // }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            //  isEditFlag: false,
            //   department: [],
            //   role: [],
            //   city: [],
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        // if (this.props.isEditFlag) { 
        //     const { machineId } = this.props;

        //     this.props.updateLabourAPI(formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
        //             this.toggleModel();
        //             this.props.getLabourDetailAPI(res => {});
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // }else{
        //     this.props.createLabourAPI(values, (res) => {
        //         if (res.data.Result === true) {
        //             toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
        //             this.props.getLabourDetailAPI(res => {});
        //             this.toggleModel()
        //         } else {
        //             toastr.error(res.data.Message);
        //         }
        //     });
        // }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Machine Details' : 'Add Machine Details'}</ModalHeader>
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
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
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
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
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
                                    <Row>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Add'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={this.cancel} >
                                                    {'Reset'}
                                                </button>}
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
function mapStateToProps({ comman, machine }) {

    let initialValues = {};
    // if(labourData && labourData !== undefined){
    //     initialValues = {
    //         LabourRate: labourData.LabourRate,
    //         LabourTypeId: labourData.LabourTypeId,
    //         PlantId: labourData.PlantId,
    //         TechnologyId: labourData.TechnologyId,
    //     }
    // }
    return { initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddMachine',
    enableReinitialize: true,
})(AddMachine));
