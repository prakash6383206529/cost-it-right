import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText,renderSelectField } from "../../../layout/FormInputs";
import { createPartAPI, fetchMasterDataAPI, updatePartsAPI , getOnePartsAPI} from '../../../../actions/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class PartMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag:false
        }
    }

    componentWillMount(){
        this.props.fetchMasterDataAPI(res => {});   
    }

    componentDidMount(){
        const { partId,isEditFlag } = this.props;
        console.log('isEditFlag', isEditFlag);
        if(isEditFlag){
            this.setState({isEditFlag},()=>{  
            this.props.getOnePartsAPI(partId,true, res => {})   
        })
        }else{
            this.props.getOnePartsAPI('',false, res => {})   
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
                formData[editIndex].PartNumber = values.PartNumber;
                formData[editIndex].PartName = values.PartName;
                formData[editIndex].MaterialTypeId = values.MaterialTypeId;
                formData[editIndex].MaterialGroupCode = values.MaterialGroupCode;
                formData[editIndex].UnitOfMeasurementId = values.UnitOfMeasurementId;
                formData[editIndex].PartDescription = values.PartDescription; 

            this.props.updatePartsAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        }else{
            this.props.createPartAPI(values, (res) => {
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
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    selectUnitOfMeasurement = () => {
        const {uniOfMeasurementList} = this.props;
        const temp = [];
        uniOfMeasurementList && uniOfMeasurementList.map(item =>
          temp.push({ Text: item.Text, Value: item.Value })
        );
        console.log('temp', uniOfMeasurementList);
        return temp;
    }

    /**
    * @method selectMaterialType
    * @description Used show listing of materail type
    */
    selectMaterialType = () => {
        const { materialTypeList } = this.props;
        const temp = [];
        materialTypeList && materialTypeList.map(item =>
        temp.push({ Text: item.Text, Value: item.Value })
        );
        return temp;
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Part' : 'Add Part'}</ModalHeader>
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
                                                label="Part Code"
                                                name={"PartNumber"}
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
                                                label="Part Name    "
                                                name={"PartName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    <Row/>
                                    <Row/>
                                        <Col md="6">
                                            <Field
                                                label="Part Type"
                                                name={"MaterialTypeId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.selectMaterialType()}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Unit Of Measurement"
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                maxLength={26}
                                                options={this.selectUnitOfMeasurement()}
                                                onChange={this.handleTypeofListing}
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
                                                label="Part Group code"
                                                name={"MaterialGroupCode"}
                                                type="text"
                                                placeholder={''}
                                                component={renderText}
                                                className=" withoutBorder "
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Part Description"
                                                name={"PartDescription"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
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
    const {uniOfMeasurementList, partData, materialTypeList} = part;
    let initialValues = {};
    if(partData && partData !== undefined){
        initialValues = {
            PartNumber: partData.PartNumber,
            PartName: partData.PartName,
            MaterialTypeId: partData.MaterialTypeId,
            MaterialGroupCode: partData.MaterialGroupCode,
            UnitOfMeasurementId: partData.UnitOfMeasurementId,
            PartDescription: partData.PartDescription,
        }
    }
    return { uniOfMeasurementList, initialValues, materialTypeList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {createPartAPI,fetchMasterDataAPI, updatePartsAPI,getOnePartsAPI })(reduxForm({
    form: 'AddPart',
    enableReinitialize: true,
})(PartMaster));
