import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText,renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { createProcessAPI } from '../../../../actions/master/Process';
import { fetchPlantDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';

class AddProcess extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag:false
        }
    }

    componentWillMount(){
        this.props.fetchPlantDataAPI(res => {});   
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
        console.log('values: ', values);
        this.props.createProcessAPI(values, (response) => {
            if(response && response.data){
            if (response && response.data && response.data.Result) {
                toastr.success(MESSAGES.PROCESS_ADD_SUCCESS);
                {this.toggleModel()}
            } else {
                toastr.error(response.data.Message);
            }
        }
        });   
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    selectMaterialType = () => {
        const {categoryList} = this.props;
        console.log('categoryList',typeof(categoryList), categoryList)
        const temp = [];
        categoryList && categoryList !== undefined && categoryList.map(item =>
          temp.push({ Text: item.Text, Value: item.Value })
        );
        console.log('temp', categoryList);
        return temp;
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { plantList } = this.props;
        const temp = [];
        if(label = 'plant'){
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            console.log('temp', plantList);
            return temp;
        }
        
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
                                                label={`${CONSTANT.PROCESS} ${CONSTANT.NAME}`}
                                                name={"ProcessName"}
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
                                                label={`${CONSTANT.PROCESS} ${CONSTANT.CODE}`}
                                                name={"ProcessCode"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    <Row/>
                                    <Row/>
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
                                        <Col md="6">
                                            <Field
                                                label={`Basic ${CONSTANT.PROCESS} rate`}
                                                name={"BasicProcessRate"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.PLANT}`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
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
   const { plantList } = comman
    return { plantList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createProcessAPI,fetchPlantDataAPI })(reduxForm({
    form: 'AddProcess',
    enableReinitialize: true,
})(AddProcess));
