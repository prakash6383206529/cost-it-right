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
            typeOfListing: [],
            thickness: '',
            width: '',
            length: '',
            total: 0,
            meter: 0,
            milimeter: 0,
            feet: 0,
            inch: 0,
            surfaceArea: '',
            overlapArea: '',
            NFS: ''
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
        });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log('value', values);
        
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
        //     this.props.createWeightCalculationCosting(values, (res) => {
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
    * @method handleCalculation
    * @description  handle all calculation
    */
    handleCalculation = () => {
        const {thickness, width, length, surfaceArea, overlapArea} = this.state;
        const WT =((thickness*width*length*7.85)/1000000).toFixed(6);
        const netSurfaceArea = overlapArea-surfaceArea;
        this.setState({total : WT, NFS: netSurfaceArea});
    }
    /**
    * @method onChangeSurfaceArea
    * @description  handle surface area change event
    */
    onChangeSurfaceArea = (e) => {
        this.setState({surfaceArea : e.target.value}, ()=> {this.handleCalculation()});
    }
    /**
    * @method onChangeOverlapArea
    * @description  handle overlap area change event
    */
    onChangeOverlapArea = (e) => {
        this.setState({overlapArea : e.target.value}, ()=> {this.handleCalculation()});
    }
    /**
    * @method handleChangeThickness
    * @description  handle thickness change event
    */
    handleChangeThickness = (e)=>{
        this.setState({thickness : e.target.value}, ()=> {this.handleCalculation()});
    }
    /**
    * @method handleChangeWidth
    * @description  handle width change event
    */
    handleChangeWidth = (e)=>{
        this.setState({width : e.target.value}, ()=> {this.handleCalculation()});
    }
    /**
    * @method handleChangeLength
    * @description  handle length change event
    */
    handleChangeLength = (e)=>{
        this.setState({length : e.target.value}, ()=> {this.handleCalculation()});
    }

    /** handle milimeter change event */
    uomCalculatorMeter = (e) => { this.setState({meter: e.target.value}) }

    /** handle milimeter change event */
    uomCalculatorMiliMeter = (e) => {this.setState({milimeter: e.target.value})}

     /** handle feet change event */
    uomCalculatorFeetMeter = (e) => {this.setState({feet: e.target.value})}

     /** handle inch change event */
    uomCalculatorInchMeter = (e) => {this.setState({inch: e.target.value})}

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        const { weightType } = this.state;
        //console.log('this.state', this.state);
        
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Weight Costing' : 'Add Weight Costing'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                > 
                                    <Label>UOM Calculator</Label>
                                    <Row>
                                        <Col md="3">
                                            <Label>m2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorMeter}
                                                //value = {this.state.total}
                                                className = 'form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>mm2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorMiliMeter}
                                                //value = {this.state.total}
                                                className = 'form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>ft2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorFeetMeter}
                                                //value = {this.state.total}
                                                className = 'form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>inch2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorInchMeter}
                                                //value = {this.state.total}
                                                className = 'form-control'
                                            />
                                        </Col>
                                    </Row>
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
                                            <Label>GrossWeight</Label>
                                            <input
                                                label="GrossWeight"
                                                name={"GrossWeight"}
                                                type="number"
                                                value = {this.state.total}
                                                className = 'form-control'
                                                disabled = {true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="FinishWeight"
                                                name={"FinishWeight"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                onChange={this.onChangeFinishWeightArea}
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
                                                onChange={this.onChangeSurfaceArea}
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {weightType === 'BRACKET_PART' &&
                                        <Col md="3">
                                            <Field
                                                label="OverlapArea"
                                                name={"OverlapArea"}
                                                type="text"
                                                onChange={this.onChangeOverlapArea}
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {weightType === 'BRACKET_PART' &&
                                        <Col md="6">
                                            <Label>NetSurfaceArea</Label>
                                            <input
                                                label="GrossWeight"
                                                name={"NetSurfaceArea"}
                                                type="number"
                                                value = {this.state.NFS}
                                                className = 'form-control'
                                                disabled = {true}
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
                                                onChange={this.handleChangeThickness}
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
                                                onChange={this.handleChangeWidth}
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
                                                onChange={this.handleChangeLength}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                            />
                                        </Col>}
                                        {(weightType === 'BRACKET_PART' || weightType === 'PIPE') &&
                                        <Col md="3">
                                            <Label>WeightUnitKg</Label>
                                            <input
                                                label="WeightUnitKg"
                                                name={"WeightUnitKg"}
                                                type="number"
                                                value = {this.state.total}
                                                className = 'form-control'
                                                disabled = {true}
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
function mapStateToProps({ costWorking, state }) {
   const { weightLayoutType } = costWorking;
   const initialValues = {
    //WeightUnitKg: state.WeightUnitKg
    }
    return { weightLayoutType, initialValues };
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
