import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, checkForNull } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField, InputHiddenField } from "../../layout/FormInputs";
import {
    createWeightCalculationCosting, getWeightCalculationCosting, getWeightCalculationLayoutType,
    updateWeightCalculationCosting
} from '../../../actions/costing/CostWorking';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
const selector = formValueSelector('AddWeightCostingForm');

class AddWeightCosting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weightType: '',
            layoutingId: '',
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
        this.props.getWeightCalculationCosting(this.props.costingId, (res) => {
            if (res.data.Data) {
                const { weightCostingInfo } = this.props;
                const layoutType = this.checkLayoutType(weightCostingInfo)
                this.setState({ weightType: layoutType, layoutingId: weightCostingInfo.LayoutingId })
                this.handleCalculation()
            }
        })
    }

    /**
    * @method componentWillReceiveProps
    * @description called when props changed
    */
    componentWillReceiveProps(nextProps) {

    }

    /**
    * @method checkLayoutType
    * @description Used to check Layout Type
    */
    checkLayoutType = (layoutData) => {
        if (layoutData.LayoutingName === 'L Sec') {
            return 'L_Sec';
        } else if (layoutData.LayoutingName === 'Plate') {
            return 'Plate';
        } else if (layoutData.LayoutingName === 'C Sec') {
            return 'C_Sec';
        } else if (layoutData.LayoutingName === 'Z Sec') {
            return 'Z_Sec';
        } else if (layoutData.LayoutingName === 'Bracket Part') {
            return 'BRACKET_PART';
        } else if (layoutData.LayoutingName === 'Pipe') {
            return 'PIPE';
        } else if (layoutData.LayoutingName === 'Tube') {
            return 'Tube';
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
    * @method weightTypeHandler
    * @description handle selection of freight type
    */
    weightTypeHandler = (value, layoutText) => {
        const { weightLayoutType } = this.props;
        const layout = weightLayoutType.find(item => item.Text == layoutText)
        this.props.reset();
        this.setState({
            weightType: value,
            layoutingId: layout.Value
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

    componentDidUpdate(prevProps) {
        if (prevProps.fieldsObj != this.props.fieldsObj) {
            this.handleCalculation()
        }
    }

    /**
    * @method handleCalculation
    * @description  handle all calculation
    */
    handleCalculation = () => {
        const { weightType } = this.state;

        const { fieldsObj } = this.props;

        const Thickness = checkForNull(fieldsObj.Thickness);
        const Width = checkForNull(fieldsObj.Width);
        const Length = checkForNull(fieldsObj.Length);
        const FinishWeight = checkForNull(fieldsObj.FinishWeight);
        const SurfaceArea = checkForNull(fieldsObj.SurfaceArea);
        const NoOfPartsAndBlank = fieldsObj.NoOfPartsAndBlank == 0 ? this.props.change('NoOfPartsAndBlank', 1) : checkForNull(fieldsObj.NoOfPartsAndBlank);
        const OverlapArea = checkForNull(fieldsObj.OverlapArea);
        const OD = checkForNull(fieldsObj.OD);
        const ID = checkForNull(fieldsObj.ID);
        const LengthOfPipe = checkForNull(fieldsObj.LengthOfPipe);
        const FlangeWidthOne = checkForNull(fieldsObj.FlangeWidthOne);
        const WebWidth = checkForNull(fieldsObj.WebWidth);
        const FlangeWidthTwo = checkForNull(fieldsObj.FlangeWidthTwo);

        // Bracket Part calculation
        const WT = ((Thickness * Width * Length * 7.85) / 1000000);
        const disabledNetSurface = (FinishWeight * 1000000 * SurfaceArea) / (Thickness * 7.85 * 25.4 * 25.4)
        const grossWt = WT / NoOfPartsAndBlank;
        const netSurfaceArea = disabledNetSurface - OverlapArea;

        // Pipe layout surface area for one side and two side
        const oneSideInputValue = ((2 * 3.14 * (OD / 2) * LengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
        const twoSideInputValue = ((2 * 3.14 * (ID / 2) * LengthOfPipe) + (2 * 3.14 * (OD / 2) * LengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
        const wtInKgPipe = ((OD - Thickness) * Thickness * Length * 0.2465) / 1000
        const numberOfPipe1 = Length / LengthOfPipe
        const pipeGrossWeight = wtInKgPipe / numberOfPipe1

        //L_Sec, Plate, C_Sec, Z sec layout calculation
        let weightOther = '';

        if (weightType === 'L_Sec') {
            weightOther = (((FlangeWidthOne + WebWidth) - (2 * Thickness) * Thickness * Length) * (7.85 / 1000000))
        } else if (weightType === 'Plate') {
            weightOther = (FlangeWidthOne * WebWidth * Thickness) * 7.85 / 1000000
        } else if (weightType === 'C_Sec') {
            weightOther = ((FlangeWidthOne + WebWidth + FlangeWidthTwo) - (2 * 2 * Thickness)) * Thickness * Length * (7.85 / 1000000)
        } else if (weightType === 'Z_Sec') {
            weightOther = ((FlangeWidthOne + WebWidth + FlangeWidthTwo) - (1.5 * 2 * Thickness)) * Thickness * Length * (7.85 / 1000000)
        }

        //Tube layout calculation 
        const Formula1 = (Width - (4 * Thickness)) + (WebWidth - (4 * Thickness)) + (1.5 * 3.14 * Thickness);
        const Formula2 = (Formula1 * 2 * Thickness) / 100;
        const formula3 = Formula2 * .785;
        const WeightPerPc = formula3 * (Length / 1000);

        // For Bracket layout calculation
        this.props.change("GrossWeight", grossWt)
        this.props.change("disabledSurfaceArea", checkForNull(disabledNetSurface))
        this.props.change("NetSurfaceArea", netSurfaceArea)
        this.props.change("WeightUnitKg", WT)

        // For pipe layout
        this.props.change("GrossWeightPipe", pipeGrossWeight)
        this.props.change("oneSide", oneSideInputValue)
        this.props.change("twoSide", twoSideInputValue)
        this.props.change("PipeWeight", wtInKgPipe)
        this.props.change("NumberOfPipe", numberOfPipe1)

        //L_Sec, Plate, C_Sec, Z sec, and tube layout calculation
        this.props.change("GrossWeightOther", weightOther)
        this.props.change("WeightOther", weightOther)

        //Tube layout calculation
        this.props.change("WeightPerPc", WeightPerPc)

        // **************************************************************
    }

    /**
    * @method uomCalculatorMiliMeter
    * @description handle milimeter change event
    */
    uomCalculatorMiliMeter = (e) => {
        const value = e.target.value;
        this.setState({ miliMeter: value }, () => {

            const miliMeterSqr = value * 1000000;
            const feet = value * 10.76391041671;
            const inch = value * 1550.0031000062;

            this.props.change("uom_mm2", miliMeterSqr.toFixed(5))
            this.props.change("uom_ft2", feet.toFixed(5))
            this.props.change("uom_inch2", inch.toFixed(5))

        })
    }

    /**
    * @method uomCalculatorMiliMeterSqr
    * @description handle milimeter change event
    */
    uomCalculatorMiliMeterSqr = (e) => {
        const value = e.target.value;
        this.setState({ miliMeterSqr: value }, () => {

            const feet = value * 0.00001076391;
            const inch = value * 0.0015500031;
            const miliMeter = value * 0.000001;

            this.props.change("uom_m2", miliMeter.toFixed(5))
            this.props.change("uom_ft2", feet.toFixed(5))
            this.props.change("uom_inch2", inch.toFixed(5))
        })
    }

    /**
    * @method uomCalculatorFeetMeter
    * @description handle feet change event
    */
    uomCalculatorFeetMeter = (e) => {
        const value = e.target.value;
        this.setState({ feet: value }, () => {

            const miliMeter = value * 92903.04;
            const miliMeterSqr = value * 0.09290304;
            const inch = value * 144;

            this.props.change("uom_m2", miliMeter.toFixed(5))
            this.props.change("uom_mm2", miliMeterSqr.toFixed(5))
            this.props.change("uom_inch2", inch.toFixed(5))

        })
    }

    /**
    * @method uomCalculatorInchMeter
    * @description handle inch change event
    */
    uomCalculatorInchMeter = (e) => {
        const value = e.target.value;
        this.setState({ inch: value }, () => {

            const miliMeter = value / 0.0015500031; //1 square inch = 645.16 square millimeters"
            const miliMeterSqr = value * 0.00064516; //1 square inch = 0.00064516 m2
            const feet = value / 144; //1 square inch =0.00694444~ 0.007 ft2

            this.props.change("uom_m2", miliMeter.toFixed(5))
            this.props.change("uom_mm2", miliMeterSqr.toFixed(5))
            this.props.change("uom_ft2", feet.toFixed(5))

        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { layoutingId } = this.state;
        const { fieldsObj } = this.props;

        let weightCalculationData = {
            CostingId: values.costingId,
            LayoutingId: layoutingId,
            RawMaterialId: values.RawMaterialId,
            PartId: values.PartId,
            GrossWeight: fieldsObj.GrossWeight,
            FinishWeight: fieldsObj.FinishWeight,
            Density: fieldsObj.Density,
            WeightSpecification: "",
            NoOfPartsAndBlank: fieldsObj.NoOfPartsAndBlank,

            SurfaceArea: fieldsObj.SurfaceArea,
            CalculateSurfaceArea: fieldsObj.disabledSurfaceArea,
            SurfaceAreaSide: 0,   //TODO discuss later about key
            OverlapArea: fieldsObj.OverlapArea,
            NetSurfaceArea: fieldsObj.NetSurfaceArea,
            CalculateNetSurfaceArea: 0,  //TODO discuss later about key
            Thickness: fieldsObj.Thickness,
            Width: fieldsObj.Width,
            Length: fieldsObj.Length,
            OD: fieldsObj.OD,
            ID: fieldsObj.ID,
            LengthOfPipe: fieldsObj.LengthSLPIPE,
            NumberOfPipe: fieldsObj.numberOfPipe,
            TotalWeight: fieldsObj.pipeWeight,
            SizeName: "",   //TODO discuss later about key
            FlangeWidthOne: fieldsObj.FlangeWidthOne,
            FlangeWidthTwo: fieldsObj.FlangeWidthTwo,
            WebWidth: fieldsObj.WebWidth,
            Depth: fieldsObj.Depth,
            WeightPerPice: fieldsObj.WeightPerPc,
            WeightUnitKg: fieldsObj.weightOther,
            IsActive: true,
            CreatedDate: "",
            CreatedBy: "",
            ModifiedBy: ""
        }

        /** Update detail of the existing Weight Spec  */
        if (this.props.isEditFlag) {

            const { weightCostingInfo } = this.props;
            weightCalculationData.CostingWeightCalculationDetailId = weightCostingInfo.CostingWeightCalculationDetailId;

            this.props.updateWeightCalculationCosting(weightCalculationData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.WEIGHT_SPEC_UPDATE_SUCCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else {
            /** Add detail for creating new weight spec  */
            this.props.createWeightCalculationCosting(weightCalculationData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.WEIGHT_SPEC_ADDED_SUCCESS);
                    this.toggleModel();
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
        const { handleSubmit, isEditFlag, reset, weightCostingInfo } = this.props;
        const { weightType, isPartBlankDisabled } = this.state;

        let weightTitle = '';
        if (weightType === 'L_Sec') {
            weightTitle = '(((flangeWidth1 + webWidth) - (2 * thickness) * thickness * length) * (7.85 / 1000000))'
        } else if (weightType === 'Plate') {
            weightTitle = '(flangeWidth1 * webWidth * thickness ) * 7.85 / 1000000)'
        } else if (weightType === 'C_Sec') {
            weightTitle = '((flangeWidth1 + webWidth + flangeWidth2) - (2 * 2 * thickness)) * thickness * length * (7.85 / 1000000)'
        } else if (weightType === 'Z_Sec') {
            weightTitle = '((flangeWidth1 + webWidth+ flangeWidth2) - (1.5 * 2 * thickness)) * thickness * length * (7.85 / 1000000)'
        }

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
                                            <Field
                                                label="m2"
                                                name={"uom_m2"}
                                                type="text"
                                                onChange={this.uomCalculatorMiliMeter}
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                            //required={true}
                                            //disabled={true}
                                            //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="mm2"
                                                name={"uom_mm2"}
                                                type="text"
                                                onChange={this.uomCalculatorMiliMeterSqr}
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                            //required={true}
                                            //disabled={true}
                                            //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label="ft2"
                                                name={"uom_ft2"}
                                                type="text"
                                                onChange={this.uomCalculatorFeetMeter}
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                            //required={true}
                                            //disabled={true}
                                            //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={'inch2'}
                                                name={"uom_inch2"}
                                                type="text"
                                                onChange={this.uomCalculatorInchMeter}
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                            //required={true}
                                            //disabled={true}
                                            //className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Label>Layouting</Label>
                                    <hr />
                                    <Row className={'supplierRadio'}>
                                        <Col className='form-group'>
                                            <Label
                                                className={'zbcwrapper'}
                                                onChange={() => this.weightTypeHandler('BRACKET_PART', 'Bracket Part')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'BRACKET_PART'}
                                                    checked={this.state.weightType === 'BRACKET_PART' ? true : false}
                                                    name="weightType"
                                                    value="BRACKET_PART" />{' '}
                                                BRACKET PART
                                            </Label>
                                            {' '}

                                            {/* Hide for now, We will add rest of the Calculations parts in Future. */}

                                            {/* <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('PIPE', 'Pipe')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'PIPE'}
                                                    checked={this.state.weightType === 'PIPE' ? true : false}
                                                    name="weightType"
                                                    value="PIPE" />{' '}
                                                PIPE
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('L_Sec', 'L Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'L_Sec'}
                                                    checked={this.state.weightType === 'L_Sec' ? true : false}
                                                    name="weightType"
                                                    value="L_Sec" />{' '}
                                                L_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Plate', 'Plate')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Plate'}
                                                    checked={this.state.weightType === 'Plate' ? true : false}
                                                    name="weightType"
                                                    value="Plate" />{' '}
                                                Plate
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('C_Sec', 'C Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'C_Sec'}
                                                    checked={this.state.weightType === 'C_Sec' ? true : false}
                                                    name="weightType"
                                                    value="C_Sec" />{' '}
                                                C_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Z_Sec', 'Z Sec')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Z_Sec'}
                                                    checked={this.state.weightType === 'Z_Sec' ? true : false}
                                                    name="weightType"
                                                    value="Z_Sec" />{' '}
                                                Z_Sec
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('Tube', 'Tube')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'Tube'}
                                                    checked={this.state.weightType === 'Tube' ? true : false}
                                                    name="weightType"
                                                    value="Tube" />{' '}
                                                Tube wt per mtr
                                            </Label> */}
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label={'Costing Number'}
                                                name={"CostingNumber"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                                disabled={true}
                                            //required={true}
                                            //className=" withoutBorder"
                                            />
                                            <Field
                                                component={InputHiddenField}
                                                name="costingId"
                                                type="hidden"
                                                placeholder={''}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={'Raw Material Name'}
                                                name={"RawMaterialName"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                                disabled={true}
                                            //required={true}
                                            //className=" withoutBorder"
                                            />
                                            <Field
                                                component={InputHiddenField}
                                                name="RawMaterialId"
                                                type="hidden"
                                                placeholder={''}
                                            />
                                        </Col>
                                        <Col md="3">

                                            <Field
                                                label={'Part Number'}
                                                name={"PartNumber"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                title={''}
                                                disabled={true}
                                            //required={true}
                                            //className=" withoutBorder"
                                            />
                                            <Field
                                                component={InputHiddenField}
                                                name="PartId"
                                                type="hidden"
                                                placeholder={''}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        {(weightType === 'BRACKET_PART') && <Col> <h3><b>BRACKET PART</b></h3> </Col>}

                                        {/* Hide for now, We will add rest of the Calculations parts in Future. */}

                                        {/* {(weightType === 'PIPE') && <Col> <h3><b>PIPE</b></h3> </Col>}
                                        {(weightType === 'L_Sec') && <Col> <h3><b>Tech - LSec</b></h3> </Col>}
                                        {(weightType === 'Plate') && <Col> <h3><b>Tech - Plate</b></h3> </Col>}
                                        {(weightType === 'C_Sec') && <Col> <h3><b>Tech - CSec</b></h3> </Col>}
                                        {(weightType === 'Z_Sec') && <Col> <h3><b>Tech - ZSec</b></h3> </Col>}
                                        {(weightType === 'Tube') && <Col> <h3><b>Tech-Tube wt/mtr</b></h3> </Col>} */}
                                    </Row>

                                    <Row>
                                        {(weightType === 'BRACKET_PART') &&
                                            <Col md="6">
                                                <Field
                                                    label="GrossWeight"
                                                    name={"GrossWeight"}
                                                    type="number"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    Value={0}
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
                                                    Value={0}
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    title={'GrossWt=Wt/No of Pipe'}
                                                    //required={true}
                                                    disabled={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>}

                                        {((weightType === 'L_Sec') ||
                                            (weightType === 'Plate') ||
                                            (weightType === 'C_Sec') ||
                                            (weightType === 'Z_Sec') ||
                                            (weightType === 'Tube')) &&
                                            <Col md="6">
                                                <Field
                                                    label="GrossWeight"
                                                    name={"GrossWeightOther"}
                                                    type="number"
                                                    //onChange={this.onChangeSurfaceArea}
                                                    Value={0}
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
                                                //onChange={this.handleCalculation}
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
                                                    name={"NoOfPartsAndBlank"}
                                                    type="text"
                                                    //onChange={this.handleCalculation}
                                                    value={0}
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
                                                    //onChange={this.handleCalculation}
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
                                                    value={0}
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
                                                    //onChange={this.handleCalculation}
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
                                                    title={'Net Surface Area=(Suface Area - Overlap Area)'}
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
                                                <div>{weightCostingInfo.MaterialTypeName}</div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Thickness(mm)"
                                                    name={"Thickness"}
                                                    type="text"
                                                    placeholder={''}
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Length(mm)"
                                                    name={"Length"}
                                                    type="text"
                                                    placeholder={''}
                                                    //onChange={this.handleCalculation}
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
                                            <Col md="2">
                                                <Field
                                                    label={`Density`}
                                                    name={"Density"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=" withoutBorder"
                                                //customClassName=" withoutBorderBottom"
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
                                                            checked={this.state.oneSide === 'oneSide' ? true : false}
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
                                                            checked={this.state.oneSide === 'twoSide' ? true : false}
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
                                            <Col><h4><b>Raw Material</b></h4></Col>
                                        </Row>
                                    }

                                    {(weightType === 'PIPE') &&
                                        <Row>
                                            <Col md="2">
                                                <lable>Type</lable>
                                                <div>{weightCostingInfo.MaterialTypeName}</div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label="Thickness"
                                                    name={"Thickness"}
                                                    type="text"
                                                    placeholder={''}
                                                    //onChange={this.handleCalculation}
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
                                                //onChange={this.handleCalculation}
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
                                                //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    value={0}
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
                                                //onChange={this.handleCalculation}
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
                                                    Value={0}
                                                    component={renderNumberInputField}
                                                    ////onChange={this.handleCalculation}
                                                    disabled={true}
                                                    title="No of pipe=Length(SL)/Length of Pipe"
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Density`}
                                                    name={"Density"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=" withoutBorder"
                                                //customClassName=" withoutBorderBottom"
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    Value={0}
                                                    //onChange={this.widthOtherhandler}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    disabled="true"
                                                    title={weightTitle}
                                                //required={true}
                                                //className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Density`}
                                                    name={"Density"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=" withoutBorder"
                                                //customClassName=" withoutBorderBottom"
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
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
                                                    //onChange={this.handleCalculation}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                //required={true}
                                                // className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Density`}
                                                    name={"Density"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=" withoutBorder"
                                                //customClassName=" withoutBorderBottom"
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

    const fieldsObj = selector(state,
        'weightType',
        'GrossWeight',
        'GrossWeightPipe',
        'GrossWeightOther',
        'FinishWeight',
        'NoOfPartsAndBlank',
        'SurfaceArea',
        'disabledSurfaceArea',
        'OverlapArea',
        'NetSurfaceArea',
        'Thickness',
        'Width',
        'Length',
        'WeightUnitKg',
        'Density',
        'oneSide',
        'twoSide',
        'OD',
        'ID',
        'LengthSLPIPE',
        'PipeWeight',
        'LengthOfPipe',
        'NumberOfPipe',
        'FlangeWidthOne',
        'WebWidth',
        'FlangeWidthTwo',
        'LengthOther',
        'WeightOther',
        'Depth',
        'WeightPerPc',
        'TubeWeightUnitKg');


    const { weightLayoutType, weightCostingInfo } = costWorking;
    let initialValues = {}

    if (weightCostingInfo) {
        initialValues = {
            costingId: weightCostingInfo.CostingId,
            CostingNumber: weightCostingInfo.PartNumber,
            RawMaterialId: weightCostingInfo.RawMaterialId,
            RawMaterialName: weightCostingInfo.RawMaterialName,
            PartId: weightCostingInfo.PartId,
            PartNumber: weightCostingInfo.PartNumber,
            FinishWeight: weightCostingInfo.FinishWeight,
            //WeightSpecification: "",
            NoOfPartsAndBlank: weightCostingInfo.NoOfPartsAndBlank,
            SurfaceArea: weightCostingInfo.SurfaceArea,
            CalculateSurfaceArea: weightCostingInfo.CalculateSurfaceArea,
            SurfaceAreaSide: weightCostingInfo.SurfaceAreaSide,
            OverlapArea: weightCostingInfo.OverlapArea,
            //NetSurfaceArea: NetSurfaceArea,
            CalculateNetSurfaceArea: weightCostingInfo.CalculateNetSurfaceArea,
            Thickness: weightCostingInfo.Thickness,
            Width: weightCostingInfo.Width,
            Length: weightCostingInfo.Length,
            OD: weightCostingInfo.OD,
            ID: weightCostingInfo.ID,
            LengthOfPipe: weightCostingInfo.LengthOfPipe,
            //NumberOfPipe: NumberOfPipe,
            TotalWeight: weightCostingInfo.TotalWeight,
            SizeName: weightCostingInfo.SizeName,
            FlangeWidthOne: weightCostingInfo.FlangeWidthOne,
            FlangeWidthTwo: weightCostingInfo.FlangeWidthTwo,
            WebWidth: weightCostingInfo.WebWidth,
            Depth: weightCostingInfo.Depth,
            //WeightPerPice: WeightPerPice,
            //WeightUnitKg: WeightUnitKg,
            Density: weightCostingInfo.Density,
        }
    }

    return { weightLayoutType, initialValues, weightCostingInfo, fieldsObj };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createWeightCalculationCosting,
    getWeightCalculationLayoutType,
    getWeightCalculationCosting,
    updateWeightCalculationCosting,
})(reduxForm({
    form: 'AddWeightCostingForm',
    enableReinitialize: true,
})(AddWeightCosting));
