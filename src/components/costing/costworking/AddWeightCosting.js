import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label,Input } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText,renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { createWeightCalculationCosting, getWeightCalculationLayoutType } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message'

class AddWeightCosting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weightType: '',
            typeOfListing: []
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getWeightCalculationLayoutType(res => { });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method weightTypeHandler
    * @description handle selection of freight type
    */
    weightTypeHandler = (value) => {
        this.setState({
            weightType: value
        });
    }

     /**
    * @method renderTypeOfListing
    * @description Used show type of listing
    */
   renderTypeOfListing = (label) => {
        const {  weightLayoutType } = this.props;
        const temp = [];
        if (label === 'layoutType') {
            weightLayoutType && weightLayoutType.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }
    /**
    * @method handleTypeofListing
    * @description  used to handle type of listing selection
        */
       handleTypeofListing = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
         /** Update detail of the existing UOM  */
        // if (this.props.isEditFlag) {
        //     const { uomId } = this.props;
        //     this.setState({ isSubmitted: true });
        //     let formData = {
        //         Name: values.Name,
        //         Title: values.Title,
        //         Description: values.Description,
        //         Id: uomId,
        //         IsActive: true,
        //     }
        //     this.props.updateUnitOfMeasurementAPI(uomId, formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
        //             this.toggleModel();
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // } else {
        //      /** Add detail for creating new UOM  */
        //     this.props.createUnitOfMeasurementAPI(values, (res) => {
        //         if (res.data.Result === true) {
        //             toastr.success(MESSAGES.UOM_ADD_SUCCESS);
        //             this.toggleModel();
        //             this.props.getUnitOfMeasurementAPI(res => { });
        //         } else {
        //             toastr.error(res.data.message);
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
        const { weightType } = this.state;
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
                                    <Label>Layouting</Label>
                                    <hr/>
                                     <Row className={'supplierRadio'}>
                                        <Col className='form-group'>
                                            <Label
                                                className={'zbcwrapper'}
                                                onChange={() => this.weightTypeHandler('BRACKET_PART')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'BRACKET_PART'}
                                                    checked={this.state.weightType == 'BRACKET_PART' ? true : false}
                                                    name="weightType"
                                                    value="BRACKET_PART" />{' '}
                                                BRACKET PART
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('PIPE')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'PIPE'}
                                                    checked={this.state.weightType == 'PIPE' ? true : false}
                                                    name="weightType"
                                                    value="PIPE" />{' '}
                                                PIPE
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('L_Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'L_Sec'}
                                                    checked={this.state.weightType == 'L_Sec' ? true : false}
                                                    name="weightType"
                                                    value="L_Sec" />{' '}
                                                L_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Plate')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Plate'}
                                                    checked={this.state.weightType == 'Plate' ? true : false}
                                                    name="weightType"
                                                    value="Plate" />{' '}
                                                Plate
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('C_Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'C_Sec'}
                                                    checked={this.state.weightType == 'C_Sec' ? true : false}
                                                    name="weightType"
                                                    value="C_Sec" />{' '}
                                                C_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Z_Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Z_Sec'}
                                                    checked={this.state.weightType == 'Z_Sec' ? true : false}
                                                    name="weightType"
                                                    value="Z_Sec" />{' '}
                                                Z_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Tube')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Tube'}
                                                    checked={this.state.weightType == 'Tube' ? true : false}
                                                    name="weightType"
                                                    value="Tube" />{' '}
                                                PIPE
                                            </Label>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Costing Id`}
                                                name={"CostingId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderText}
                                                className="custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`LayoutingId`}
                                                name={"LayoutingId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('layoutType')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className="custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`RawMaterialId`}
                                                name={"RawMaterialId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderText}
                                                className="custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`PartId`}
                                                name={"PartId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderText}
                                                className=" custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label="GrossWeight"
                                                name={"GrossWeight"}
                                                type="text"
                                                readOnly
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="FinishWeight"
                                                name={"FinishWeight"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                               // className=" withoutBorder"
                                            />
                                        </Col>
                                        {(weightType === 'BRACKET_PART' || weightType === 'PIPE') &&
                                        <Col md="3">
                                            <Field
                                                label="SurfaceArea"
                                                name={"SurfaceArea"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {weightType === 'BRACKET_PART' &&
                                        <Col md="3">
                                            <Field
                                                label="OverlapArea"
                                                name={"OverlapArea"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {weightType === 'BRACKET_PART' &&
                                        <Col md="6">
                                            <Field
                                                label="NetSurfaceArea"
                                                name={"NetSurfaceArea"}
                                                type="text"
                                                readOnly
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                    </Row>
                                    <Row>
                                    {(weightType === 'BRACKET_PART' || weightType === 'PIPE' || weightType === 'L_Sec' || weightType === 'Plate' || weightType === 'C_Sec' || weightType === 'Z_Sec' || weightType === 'Tube') &&
                                        <Col md="3">
                                            <Field
                                                label="Thickness"
                                                name={"Thickness"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                               // className=" withoutBorder"
                                            />
                                        </Col>}
                                        {(weightType === 'BRACKET_PART' || weightType === 'PIPE' || weightType === 'L_Sec'|| weightType === 'Plate' || weightType === 'C_Sec' || weightType === 'Z_Sec' || weightType === 'Tube') &&
                                        <Col md="3">
                                            <Field
                                                label="Width"
                                                name={"Width"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {(weightType === 'BRACKET_PART' || weightType === 'PIPE' || weightType === 'L_Sec' || weightType === 'Plate' || weightType === 'PlC_Secate' || weightType === 'Z_Sec' || weightType === 'Tube') &&
                                        <Col md="3">
                                            <Field
                                                label="Length"
                                                name={"Length"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {(weightType === 'BRACKET_PART' || weightType === 'PIPE') &&
                                        <Col md="3">
                                            <Field
                                                label="WeightUnitKg"
                                                name={"WeightUnitKg"}
                                                type="text"
                                                readOnly
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                    </Row>
                                    {( weightType === 'PIPE') &&
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label="OD"
                                                name={"OD"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="ID"
                                                name={"ID"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="LengthOfPipe"
                                                name={"LengthOfPipe"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="NumberOfPipe"
                                                name={"NumberOfPipe"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                </Row> }
                                {( weightType === 'L_Sec' || weightType === 'Plate' || weightType === 'Z_Sec' || weightType === 'C_Sec') &&
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label="FlangeWidthOne"
                                                name={"FlangeWidthOne"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                               // className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="FlangeWidthTwo"
                                                name={"FlangeWidthTwo"}
                                                type="text"
                                                readOnly
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="WebWidth"
                                                name={"WebWidth"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>}
                                    {(weightType === 'Tube') &&
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label="Depth"
                                                name={"Depth"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="WeightPerPice"
                                                name={"WeightPerPice"}
                                                type="text"
                                                readOnly
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="WeightUnitKg"
                                                name={"WeightUnitKg"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>}
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
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
function mapStateToProps({ costWorking }) {
   const { weightLayoutType } = costWorking;
   console.log('weightLayoutType: ', weightLayoutType);
    return { weightLayoutType };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createWeightCalculationCosting, getWeightCalculationLayoutType
})(reduxForm({
    form: 'AddWeightCosting',
    enableReinitialize: true,
})(AddWeightCosting));
