import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText,renderSelectField, renderMultiSelectField } from "../../../layout/FormInputs";
import { fetchMasterDataAPI } from '../../../../actions/master/Comman';
import { createBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddBOM extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag:false,
            selectedParts: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount(){
        this.props.fetchMasterDataAPI(res => {});   
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
     * @method handlePartSelection
     * @description called
     */
    handlePartSelection = e => {
        this.setState({
            selectedParts: e
        });
    };

    /**
     * @method renderSelectPartList
     * @description called
     */
    renderSelectPartList = () => {
        const { partList } = this.props;
        const temp = [];
        partList && partList.map(item =>
            {
                if(item.Value != 0){
                    temp.push({ Text: item.Text, Value: item.Value })
                }
            }
            );
            console.log('temp', partList);
        return temp;
    }
    
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedParts } = this.state;
        let plantArray = [];
        selectedParts.map((item, i) => {
            return plantArray.push({ PartId: item.Value });
        });
        this.props.createBOMAPI(values, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                this.props.getAllPartsAPI(res => {})
                {this.toggleModel()}
            } else {
                toastr.error(res.data.message);
            }
        }); 
    }

    /**
    * @method renderTypeOfListing
    * @description Used show type of listing
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, partList,materialTypeList } = this.props;
        const temp = [];
        if(label === 'material'){
            materialTypeList && materialTypeList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if(label === 'uom'){
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if(label = 'part'){
            partList && partList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM}`}</ModalHeader>
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
                                                label={`${CONSTANT.BOM} ${CONSTANT.NUMBER}`}
                                                name={"BillNumber-BOMID"}
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
                                                label={`${CONSTANT.BOM} ${CONSTANT.CODE}`}
                                                name={"BillOfMaterialCode"}
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
                                                label={`${CONSTANT.PART} ${CONSTANT.NUMBER}`}
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
                                                label={`${CONSTANT.MATERIAL} ${CONSTANT.CODE}`}
                                                name={"MaterialCode"}
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
                                                label={`${CONSTANT.MATERIAL} ${CONSTANT.DESCRIPTION}`}
                                                name={"MaterialDescription"}
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
                                                label={`${CONSTANT.QUANTITY}`}
                                                name={"Quantity"}
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
                                                label={`${CONSTANT.ASSEMBLY} ${CONSTANT.PART} ${CONSTANT.NUMBER}`}
                                                name={"AssemblyPartNumberMark"}
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
                                                label={`${CONSTANT.BOM} ${CONSTANT.LEVEL}`}
                                                name={"BOMLevel"}
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
                                                label={`ECO ${CONSTANT.NUMBER}`}
                                                name={"EcoNumber"}
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
                                                label={`${CONSTANT.REVISION} ${CONSTANT.NUMBER}`}
                                                name={"RevisionNumber"}
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
                                                label={`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}
                                                name={"MaterialTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.UOM}`}
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.PART}`}
                                                name={"PartId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('part')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.PART} Included ${CONSTANT.BOM}`}
                                                name={"PartsIncludedBOM"}
                                                type="text"
                                                placeholder="--Select Part included Bom--"
                                                selection={this.state.selectedParts}
                                                options={this.renderSelectPartList()}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                validate={[required]}
                                                required={true}
                                                className="withoutBorder"
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
    const {uniOfMeasurementList, partList, materialTypeList} = comman;
    return { uniOfMeasurementList, materialTypeList, partList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createBOMAPI, fetchMasterDataAPI })(reduxForm({
    form: 'AddBOM',
    enableReinitialize: true,
})(AddBOM));
