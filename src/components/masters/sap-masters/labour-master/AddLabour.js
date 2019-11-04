import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { createLabourAPI,getLabourDetailAPI,getLabourByIdAPI, updateLabourAPI } from '../../../../actions/master/Labour';
import { fetchLabourComboAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddLabour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
        }
    }

    componentWillMount() {
        this.props.fetchLabourComboAPI(res => {});
    }
    
    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount(){
        const { labourId,isEditFlag } = this.props;
        if(isEditFlag){
            this.setState({isEditFlag},()=>{  
            this.props.getLabourByIdAPI(labourId,true, res => {})   
        })
        }else{
            this.props.getLabourByIdAPI('',false, res => {})   
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
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { technologyList, plantList, labourType } = this.props;
        const temp = [];
        if (label === 'technology') {
            technologyList && technologyList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'labour') {
            labourType && labourType.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        if (this.props.isEditFlag) { 
            const { labourId } = this.props;
            let formData = {
                LabourId : labourId,
                LabourRate: values.LabourRate,
                LabourTypeId: values.LabourTypeId,
                PlantId: values.PlantId,
                TechnologyId: values.TechnologyId,
            }
            this.props.updateLabourAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_LABOUR_SUCESS);
                    this.toggleModel();
                    this.props.getLabourDetailAPI(res => {});
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        }else{
            this.props.createLabourAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
                    this.props.getLabourDetailAPI(res => {});
                    this.toggleModel()
                } else {
                    toastr.error(res.data.Message);
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Labour Details' : 'Add Labour Details'}</ModalHeader>
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
                                                label={`${CONSTANT.LABOUR} ${CONSTANT.RATE}`}
                                                name={"LabourRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.LABOUR} ${CONSTANT.TYPE}`}
                                                name={"LabourTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.selectType('labour')}
                                                onChange={this.handleTypeSelection}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PLANT}`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.selectType('plant')}
                                                onChange={this.handleTypeSelection}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.TECHNOLOGY}`}
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.selectType('technology')}
                                                onChange={this.handleTypeSelection}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
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
function mapStateToProps({ comman, labour }) {
    const { technologyList, plantList, labourType } = comman;
    const { labourData } = labour;
    let initialValues = {};
    if(labourData && labourData !== undefined){
        initialValues = {
            LabourRate: labourData.LabourRate,
            LabourTypeId: labourData.LabourTypeId,
            PlantId: labourData.PlantId,
            TechnologyId: labourData.TechnologyId,
        }
    }
    return { technologyList, plantList, labourType, labourData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createLabourAPI, getLabourDetailAPI, fetchLabourComboAPI,getLabourByIdAPI, updateLabourAPI
})(reduxForm({
    form: 'AddLabour',
    enableReinitialize: true,
})(AddLabour));
