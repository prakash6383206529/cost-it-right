import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField } from "../../layout/FormInputs";
import { createWeightCalculationCosting, getWeightCalculationLayoutType } from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
const selector = formValueSelector('AddWeightCostingForm');

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
            NFS: '',
            oneSide: 'oneSide',
            oneSideInput: 0,
            twoSideInput: 0,
            isPartBlankDisabled: true,
            noOfPartsBlank: '',
            disabledSurfaceArea: '',
            pipeWeight: '',
            OD: '',
            ID: '',
            grossWeightOther: 0,
            flangeWidth1: '',
            webWidth: '',
            flangeWidth2: '',
            widthOther: '',
            finishWeight: '',
            depth: '',
            tubeWeightKG: '',
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
        this.props.reset();
        this.setState({
            weightType: value
        });
        // const toastrConfirmOptions = {
        //     onOk: () => {
        //         this.setState({thickness :'', width: '', length: '', surfaceArea:'', overlapArea:'', WT:'',NFS:''})
        //     },
        //     onCancel: () => console.log('CANCEL: clicked')
        // };
        // return toastr.confirm(`Are you sure you want to move another type?`, toastrConfirmOptions);
    }

    /**
   * @method renderTypeOfListing
   * @description Used show type of listing
   */
    renderTypeOfListing = (label) => {
        const { weightLayoutType } = this.props;
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
        const { weightType, thickness, width, length, surfaceArea, overlapArea, OD, ID, lengthOfPipe,
            flangeWidth1, webWidth, flangeWidth2, noOfPartsBlank, finishWeight, depth, tubeWeightKG } = this.state;
        const { weightFields } = this.props;

        // Bracket Part calculation
        const WT = ((thickness * width * length * 7.85) / 1000000);
        const disabledNetSurface = (finishWeight * 1000000 * surfaceArea) / (thickness * 7.85 * 25.4 * 25.4)
        const grossWt = WT / noOfPartsBlank;
        const netSurfaceArea = disabledNetSurface - overlapArea;

        // Pipe layout surface area for one side and two side
        const oneSideInputValue = ((2 * 3.14 * (OD / 2) * lengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
        const twoSideInputValue = ((2 * 3.14 * (ID / 2) * lengthOfPipe) + (2 * 3.14 * (OD / 2) * lengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
        const wtInKgPipe = ((OD - thickness) * thickness * length * 0.2465) / 1000
        const numberOfPipe1 = length / lengthOfPipe
        const pipeGrossWeight = wtInKgPipe / numberOfPipe1

        //L_Sec, Plate, C_Sec, Z sec layout calculation
        const weightOther = '';

        if (weightType == 'L_Sec') {
            weightOther = (((flangeWidth1 + webWidth) - (2 * thickness) * thickness * length) * (7.85 / 1000000))
        } else if (weightType == 'Plate') {
            weightOther = (flangeWidth1 * webWidth * thickness) * 7.85 / 1000000
        } else if (weightType == 'C_Sec') {
            weightOther = ((flangeWidth1 + webWidth + flangeWidth2) - (2 * 2 * thickness)) * thickness * length * (7.85 / 1000000)
        } else if (weightType == 'Z_Sec') {
            weightOther = ((flangeWidth1 + webWidth + flangeWidth2) - (1.5 * 2 * thickness)) * thickness * length * (7.85 / 1000000)
        }

        //Tube layout calculation 
        const Formula1 = (width - (4 * thickness)) + (webWidth - (4 * thickness)) + (1.5 * 3.14 * thickness);
        const Formula2 = (Formula1 * 2 * thickness) / 100;
        const formula3 = Formula2 * .785;
        const WeightPerPc = formula3 * (length / 1000);

        this.setState({
            grossWeight: grossWt,
            total: WT,
            NFS: netSurfaceArea.toFixed(6),
            disabledSurfaceArea: disabledNetSurface,
            grossWeightPipe: pipeGrossWeight,
            oneSideInput: typeof oneSideInputValue == 'NaN' ? 0 : oneSideInputValue,
            twoSideInput: typeof twoSideInputValue == 'NaN' ? 0 : twoSideInputValue,
            pipeWeight: wtInKgPipe,
            numberOfPipe: numberOfPipe1,
            weightOther: weightOther,
            grossWeightOther: weightOther
        });

        // For Bracket layout calculation
        this.props.change("GrossWeight", grossWt.toFixed(3))
        this.props.change("disabledSurfaceArea", disabledNetSurface)
        this.props.change("NetSurfaceArea", netSurfaceArea.toFixed(6))
        this.props.change("WeightUnitKg", WT)

        // For pipe layout
        this.props.change("GrossWeightPipe", pipeGrossWeight.toFixed(3))
        this.props.change("oneSide", oneSideInputValue.toFixed(3))
        this.props.change("twoSide", twoSideInputValue.toFixed(3))
        this.props.change("PipeWeight", wtInKgPipe.toFixed(3))
        this.props.change("NumberOfPipe", numberOfPipe1)

        //L_Sec, Plate, C_Sec, Z sec, and tube layout calculation
        this.props.change("GrossWeightOther", weightOther)
        this.props.change("WeightOther", weightOther)

        //Tube layout calculation
        this.props.change("WeightPerPc", WeightPerPc)
    }
    /**
    * @method onChangeSurfaceArea
    * @description  handle surface area change event
    */
    onChangeSurfaceArea = (e) => {
        this.setState({ surfaceArea: e.target.value }, () => { this.handleCalculation() });
    }
    /**
    * @method onChangeOverlapArea
    * @description  handle overlap area change event
    */
    onChangeOverlapArea = (e) => {
        this.setState({ overlapArea: e.target.value }, () => { this.handleCalculation() });
    }
    /**
    * @method handleChangeThickness
    * @description  handle thickness change event
    */
    handleChangeThickness = (e) => {
        this.setState({ thickness: e.target.value }, () => { this.handleCalculation() });
    }
    /**
    * @method handleChangeWidth
    * @description  handle width change event
    */
    handleChangeWidth = (e) => {
        this.setState({ width: e.target.value }, () => { this.handleCalculation() });
    }
    /**
    * @method handleChangeLength
    * @description  handle length change event
    */
    handleChangeLength = (e) => {
        this.setState({ length: e.target.value }, () => { this.handleCalculation() });
    }

    numberOfPartsHandler = (e) => {
        this.setState({ noOfPartsBlank: e.target.value }, () => { this.handleCalculation() });
    }

    onChangeFinishWeightArea = (e) => {
        this.setState({ finishWeight: e.target.value }, () => { this.handleCalculation() });
    }

    // Pipe layouting handlers
    handleOD = (e) => { this.setState({ OD: e.target.value }, () => this.handleCalculation()) }
    handleID = (e) => { this.setState({ ID: e.target.value }, () => this.handleCalculation()) }
    handleLengthOfPipe = (e) => { this.setState({ lengthOfPipe: e.target.value }, () => this.handleCalculation()) }

    /** handle milimeter change event */
    uomCalculatorMeter = (e) => { this.setState({ meter: e.target.value }) }

    /** handle milimeter change event */
    uomCalculatorMiliMeter = (e) => { this.setState({ milimeter: e.target.value }) }

    /** handle feet change event */
    uomCalculatorFeetMeter = (e) => { this.setState({ feet: e.target.value }) }

    /** handle inch change event */
    uomCalculatorInchMeter = (e) => { this.setState({ inch: e.target.value }) }

    /** handle pipe side change event */
    pipeSideHandler = (value) => {
        this.setState({ oneSide: value }, () => this.handleCalculation())
    }


    /** handle other section side change event */
    flangeWidthOneHandler = (e) => {
        this.setState({ flangeWidth1: e.target.value }, () => { this.handleCalculation() })
    }

    webWidthHandler = (e) => {
        this.setState({ webWidth: e.target.value }, () => { this.handleCalculation() })
    }

    flangeWidthTwoHandler = (e) => {
        this.setState({ flangeWidth2: e.target.value }, () => { this.handleCalculation() })
    }

    tubeDepthHandler = (e) => {
        this.setState({ depth: e.target.value }, () => { this.handleCalculation() })
    }

    tubeWeightKGHandler = (e) => {
        this.setState({ tubeWeightKG: e.target.value }, () => { this.handleCalculation() })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, getCostingDetailData } = this.props;
        const { weightType, isPartBlankDisabled } = this.state;
        //console.log('this.state', this.state);
        let weightTitle = '';
        if (weightType == 'L_Sec') {
            weightTitle = '(((flangeWidth1 + webWidth) - (2 * thickness) * thickness * length) * (7.85 / 1000000))'
        } else if (weightType == 'Plate') {
            weightTitle = '(flangeWidth1 * webWidth * thickness ) * 7.85 / 1000000)'
        } else if (weightType == 'C_Sec') {
            weightTitle = '((flangeWidth1 + webWidth + flangeWidth2) - (2 * 2 * thickness)) * thickness * length * (7.85 / 1000000)'
        } else if (weightType == 'Z_Sec') {
            weightTitle = '((flangeWidth1 + webWidth+ flangeWidth2) - (1.5 * 2 * thickness)) * thickness * length * (7.85 / 1000000)'
        }

        let costingOption = [{
            Text: getCostingDetailData.PartDetail.PartNumber,
            Value: getCostingDetailData.CostingId
        }]

        let partOption = [{
            Text: getCostingDetailData.PartDetail.PartNumber,
            Value: getCostingDetailData.PartDetail.PartId
        }]

        return (
            <Container className="top-margin">
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
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
                                                className='form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>mm2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorMiliMeter}
                                                //value = {this.state.total}
                                                className='form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>ft2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorFeetMeter}
                                                //value = {this.state.total}
                                                className='form-control'
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Label>inch2</Label>
                                            <input
                                                type="number"
                                                onChange={this.uomCalculatorInchMeter}
                                                //value = {this.state.total}
                                                className='form-control'
                                            />
                                        </Col>
                                    </Row>
                                    <Label>Layouting</Label>
                                    <hr />
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
                                                Tube wt per mtr
                                            </Label>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label={`Costing Id`}
                                                name={"CostingId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={costingOption}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className="custom-select"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="3">
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

                                        <Col md="3">
                                            <Field
                                                label={`RawMaterialId`}
                                                name={"RawMaterialId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={[]}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className="custom-select"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`PartId`}
                                                name={"PartId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={partOption}
                                                //onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" custom-select"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        {(weightType === 'BRACKET_PART') && <Col> <h3><b>BRACKET PART</b></h3> </Col>}
                                        {(weightType === 'PIPE') && <Col> <h3><b>PIPE</b></h3> </Col>}
                                        {(weightType === 'L_Sec') && <Col> <h3><b>Tech - LSec</b></h3> </Col>}
                                        {(weightType === 'Plate') && <Col> <h3><b>Tech - Plate</b></h3> </Col>}
                                        {(weightType === 'C_Sec') && <Col> <h3><b>Tech - CSec</b></h3> </Col>}
                                        {(weightType === 'Z_Sec') && <Col> <h3><b>Tech - ZSec</b></h3> </Col>}
                                        {(weightType === 'Tube') && <Col> <h3><b>Tech-Tube wt/mtr</b></h3> </Col>}
                                    </Row>

                                    <Row>
                                        {(weightType === 'BRACKET_PART') &&
                                            <Col md="6">
                                                <Field
                                                    label="GrossWeight"
                                                    name={"GrossWeight"}
                                                    type="number"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    Value={this.state.grossWeight}
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    title={'GrossWt=Wt/No of Parts'}
                                                    //required={true}
                                                    disabled={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>}
                                        {(weightType === 'PIPE') &&
                                            <Col md="6">
                                                <Field
                                                    label="GrossWeight"
                                                    name={"GrossWeightPipe"}
                                                    type="number"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    Value={this.state.grossWeightPipe}
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    title={'GrossWt=Wt/No of Pipe'}
                                                    //required={true}
                                                    disabled={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>}

                                        {((weightType == 'L_Sec') ||
                                            (weightType == 'Plate') ||
                                            (weightType == 'C_Sec') ||
                                            (weightType == 'Z_Sec') ||
                                            (weightType == 'Tube')) &&
                                            <Col md="6">
                                                <Field
                                                    label="GrossWeight"
                                                    name={"GrossWeightOther"}
                                                    type="number"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    Value={this.state.grossWeightOther}
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    title={'GrossWt=Weight'}
                                                    disabled={true}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>}

                                        <Col md="6">
                                            <Field
                                                label="FinishWeight"
                                                name={"FinishWeight"}
                                                type="number"
                                                placeholder={''}
                                                //validate={[required]}
                                                title={'FinishWt'}
                                                onChange={this.onChangeFinishWeightArea}
                                                component={renderNumberInputField}
                                            //required={true}
                                            // className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>



                                    {/* Bracket Part layouting */}
                                    {(weightType === 'BRACKET_PART') &&
                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label="No of Parts/Blank"
                                                    name={"partBlank"}
                                                    type="text"
                                                    onChange={this.numberOfPartsHandler}
                                                    value={this.state.noOfPartsBlank}
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={isPartBlankDisabled ? false : true}
                                                    disabled={isPartBlankDisabled ? true : false}
                                                //className=" withoutBorder"
                                                />
                                                <div onClick={() => this.setState({ isPartBlankDisabled: !this.state.isPartBlankDisabled })}><b>+</b></div>
                                            </Col>
                                            <Col md="1">
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
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(inch2)"
                                                    name={"disabledSurfaceArea"}
                                                    type="text"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    value={this.state.disabledSurfaceArea}
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    title={'Surface Area= (Finish wt*10^6*SurfaceValue)/(Thickness*7.85*25.4*25.4)'}
                                                    //required={true}
                                                    disabled={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
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
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="NetSurfaceArea"
                                                    name={"NetSurfaceArea"}
                                                    type="number"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    title={'Net Surface Area=(Overlap Area - Suface Area)'}
                                                    disabled={true}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                        </Row>
                                    }

                                    {(weightType === 'BRACKET_PART') &&
                                        <Row>
                                            <Col><h4><b>Raw Material</b></h4></Col>
                                        </Row>
                                    }

                                    {(weightType === 'BRACKET_PART') &&
                                        <Row>
                                            <Col md="2">
                                                <lable>Type</lable>
                                                <div>HR</div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Thickness(mm)"
                                                    name={"Thickness"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeThickness}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                // className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Width(mm)"
                                                    name={"Width"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeWidth}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Length(mm)"
                                                    name={"Length"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeLength}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={'Wt. in Kg'}
                                                    name={"WeightUnitKg"}
                                                    type="number"
                                                    className='form-control'
                                                    disabled={true}
                                                    component={renderNumberInputField}
                                                    title={'Wt=((Thickness*Width(mm)*Length(mm)*7.85)/1000000)'}
                                                />
                                            </Col>
                                        </Row>}


                                    {/* PIPE surface field */}
                                    {(weightType === 'PIPE') &&
                                        <Col>
                                            <label>Surface Area</label>
                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        label="One Side"
                                                        name={"oneSide"}
                                                        type="text"
                                                        //value={this.state.oneSideInput}
                                                        className='form-control'
                                                        component={renderNumberInputField}
                                                        disabled={true}
                                                        title={"((2*3.14*(OD/2)*Length of Pipe)+(2*(3.14*(OD/2)*(OD/2))-(3.14*(ID/2)*(ID/2))"}
                                                    />
                                                    <Label
                                                        className={'vbcwrapper'}
                                                        onChange={() => this.pipeSideHandler('oneSide')}
                                                        check>
                                                        <Input
                                                            type="radio"
                                                            className={'oneSide'}
                                                            checked={this.state.oneSide == 'oneSide' ? true : false}
                                                            name="oneSide"
                                                            value="oneSide" />{' '}
                                                        (mm2)
                                                        </Label>
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label="Two Side"
                                                        name={"twoSide"}
                                                        type="text"
                                                        //value={this.state.twoSideInput}
                                                        className='form-control'
                                                        component={renderNumberInputField}
                                                        disabled={true}
                                                        title={"((2*3.14*(ID/2)*Length of Pipe)+(2*3.14*(OD/2)*Length of Pipe)+(2*(3.14*(OD/2)*(OD/2))-(3.14*(ID/2)*(ID/2))"}
                                                    />
                                                    <Label
                                                        className={'vbcwrapper'}
                                                        onChange={() => this.pipeSideHandler('twoSide')}
                                                        check>
                                                        <Input
                                                            type="radio"
                                                            className={'oneSide'}
                                                            checked={this.state.oneSide == 'twoSide' ? true : false}
                                                            name="oneSide"
                                                            value="oneSide" />{' '}
                                                        (mm2)
                                                        </Label>
                                                </Col>
                                            </Row>
                                        </Col>}

                                    <Row>
                                    </Row>



                                    {(weightType === 'PIPE') &&
                                        <Row>
                                            <Col md="2">
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
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="OD(Dia)"
                                                    name={"OD"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    onChange={this.handleOD}
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
                                                    onChange={this.handleID}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Length(SL)"
                                                    name={"LengthSLPIPE"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeLength}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">

                                                <Field
                                                    label="Wt. In Kg"
                                                    name={"PipeWeight"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    value={this.state.pipeWeight}
                                                    component={renderText}
                                                    //onChange={this.handlePipeWeight}
                                                    title={'((OD-Thickness)* Thickness*Length(SL)*0.2465)/1000'}
                                                    disabled={true}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="Length Of Pipe"
                                                    name={"LengthOfPipe"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    onChange={this.handleLengthOfPipe}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="No. Of Pipe"
                                                    name={"NumberOfPipe"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    Value={this.state.numberOfPipe}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleCalculation}
                                                    disabled={true}
                                                    title="No of pipe=Length(SL)/Length of Pipe"
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                        </Row>}



                                    {(weightType === 'L_Sec' || weightType === 'Plate' || weightType === 'Z_Sec' || weightType === 'C_Sec' || weightType === 'Tube') &&
                                        <Row>
                                            <Col><h4><b>Size</b></h4></Col>
                                        </Row>
                                    }


                                    {(weightType === 'L_Sec' || weightType === 'Plate' || weightType === 'Z_Sec' || weightType === 'C_Sec') &&
                                        <Row>
                                            <Col md="2">
                                                <lable>Name</lable>
                                                <div>Available</div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(Flange width 1)"
                                                    name={"FlangeWidthOne"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    onChange={this.flangeWidthOneHandler}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                // className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(Web width)"
                                                    name={"WebWidth"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    onChange={this.webWidthHandler}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(Flange width 2)"
                                                    name={"FlangeWidthTwo"}
                                                    type="number"
                                                    readOnly
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    onChange={this.flangeWidthTwoHandler}
                                                    component={renderNumberInputField}
                                                    disabled={(weightType === 'L_Sec' || weightType === 'Plate') ? true : false}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(Thickness)"
                                                    name={"Thickness"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeThickness}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                // className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Length"
                                                    name={"LengthOther"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeLength}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Weight"
                                                    name={"WeightOther"}
                                                    type="text"
                                                    placeholder={''}
                                                    Value={this.state.weightOther}
                                                    //onChange={this.widthOtherhandler}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    disabled="true"
                                                    title={weightTitle}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                        </Row>}


                                    {(weightType === 'Tube') &&
                                        <Row>
                                            <Col md="2">
                                                <lable>Name</lable>
                                                <div>Available</div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(Width)"
                                                    name={"Width"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.handleChangeWidth}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Depth"
                                                    name={"Depth"}
                                                    type="text"
                                                    placeholder={''}
                                                    onChange={this.tubeDepthHandler}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Weight Pr Pc"
                                                    name={"WeightPerPc"}
                                                    type="text"
                                                    //readOnly
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="(IS WT/Unit (Kg))"
                                                    name={"TubeWeightUnitKg"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    onChange={this.tubeWeightKGHandler}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
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
                                            </Col>
                                            <Col md="2">
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
function mapStateToProps(state) {
    const { costWorking } = state;
    const weightFields = selector(state, 'FinishWeight', 'partBlank', 'Thickness', 'Width', 'Length', 'WeightUnitKg', 'OD', 'ID',
        'LengthSLPIPE', 'LengthOfPipe', 'NumberOfPipe')

    const { weightLayoutType, getCostingDetailData } = costWorking;
    const initialValues = {
        //WeightUnitKg: state.WeightUnitKg
    }
    return { weightLayoutType, initialValues, weightFields, getCostingDetailData };
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
    form: 'AddWeightCostingForm',
    enableReinitialize: true,
})(AddWeightCosting));
