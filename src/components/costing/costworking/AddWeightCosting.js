import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, renderSelectField, InputHiddenField } from "../../layout/FormInputs";
import { createWeightCalculationCosting, getWeightCalculationCosting, getWeightCalculationLayoutType } from '../../../actions/costing/CostWorking';
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
        this.props.getWeightCalculationCosting(this.props.costingId, () => { })
    }

    /**
    * @method componentWillReceiveProps
    * @description called when props changed
    */
    componentWillReceiveProps(nextProps) {
        if (nextProps.weightCostingInfo != this.props.weightCostingInfo) {
            const layoutData = nextProps.weightCostingInfo;

            const layoutType = this.checkLayoutType(layoutData)
            // Bracket Part calculation
            const WT = ((layoutData.Thickness * layoutData.Width * layoutData.Length * 7.85) / 1000000);
            const disabledNetSurface = (layoutData.FinishWeight * 1000000 * layoutData.SurfaceArea) / (layoutData.Thickness * 7.85 * 25.4 * 25.4)
            const grossWt = WT / layoutData.NoOfPartsAndBlank;
            const netSurfaceArea = disabledNetSurface - layoutData.OverlapArea;


            // Pipe layout surface area for one side and two side
            const OD = layoutData.OD;
            const ID = layoutData.ID;
            const oneSideInputValue = ((2 * 3.14 * (OD / 2) * layoutData.LengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
            const twoSideInputValue = ((2 * 3.14 * (ID / 2) * layoutData.LengthOfPipe) + (2 * 3.14 * (OD / 2) * layoutData.LengthOfPipe) + (2 * (3.14 * (OD / 2) * (OD / 2)) - (3.14 * (ID / 2) * (ID / 2))))
            const wtInKgPipe = ((OD - layoutData.Thickness) * layoutData.Thickness * layoutData.Length * 0.2465) / 1000
            const numberOfPipe1 = layoutData.Length / layoutData.LengthOfPipe
            const pipeGrossWeight = wtInKgPipe / numberOfPipe1

            //L_Sec, Plate, C_Sec, Z sec layout calculation
            const weightOther = '';

            if (layoutData.LayoutingName == 'L Sec') {
                weightOther = (((layoutData.FlangeWidthOne + layoutData.WebWidth) - (2 * layoutData.Thickness) * layoutData.Thickness * layoutData.Length) * (7.85 / 1000000))
            } else if (layoutData.LayoutingName == 'Plate') {
                weightOther = (layoutData.FlangeWidthOne * layoutData.WebWidth * layoutData.Thickness) * 7.85 / 1000000
            } else if (layoutData.LayoutingName == 'C Sec') {
                weightOther = ((layoutData.FlangeWidthOne + layoutData.WebWidth + layoutData.FlangeWidthTwo) - (2 * 2 * layoutData.Thickness)) * layoutData.Thickness * layoutData.Length * (7.85 / 1000000)
            } else if (layoutData.LayoutingName == 'Z Sec') {
                weightOther = ((layoutData.FlangeWidthOne + layoutData.WebWidth + layoutData.FlangeWidthTwo) - (1.5 * 2 * layoutData.Thickness)) * layoutData.Thickness * layoutData.Length * (7.85 / 1000000)
            }

            //Tube layout calculation 
            const Formula1 = (layoutData.Width - (4 * layoutData.Thickness)) + (layoutData.WebWidth - (4 * layoutData.Thickness)) + (1.5 * 3.14 * layoutData.Thickness);
            const Formula2 = (Formula1 * 2 * layoutData.Thickness) / 100;
            const formula3 = Formula2 * .785;
            const WeightPerPc = formula3 * (layoutData.Length / 1000);

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
                grossWeightOther: weightOther,
                weightType: layoutType,
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
    }

    /**
    * @method checkLayoutType
    * @description Used to check Layout Type
    */
    checkLayoutType = (layoutData) => {
        if (layoutData.LayoutingName == 'L Sec') {
            return 'L_Sec';
        } else if (layoutData.LayoutingName == 'Plate') {
            return 'Plate';
        } else if (layoutData.LayoutingName == 'C Sec') {
            return 'C_Sec';
        } else if (layoutData.LayoutingName == 'Z Sec') {
            return 'Z_Sec';
        } else if (layoutData.LayoutingName == 'Bracket Part') {
            return 'BRACKET_PART';
        } else if (layoutData.LayoutingName == 'Pipe') {
            return 'PIPE';
        } else if (layoutData.LayoutingName == 'Tube') {
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


    /**
    * @method handleCalculation
    * @description  handle all calculation
    */
    handleCalculation = () => {
        const { weightType, thickness, width, length, surfaceArea, overlapArea, OD, ID, lengthOfPipe,
            flangeWidth1, webWidth, flangeWidth2, noOfPartsBlank, finishWeight, depth, tubeWeightKG } = this.state;
        const { } = this.props;

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


    uomCalculation = () => {
        const { miliMeter, miliMeterSqr, feet, inch } = this.state;


    }
    /** handle milimeter change event */
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

    /** handle milimeter change event */
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

    /** handle feet change event */
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

    /** handle inch change event */
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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { weightType, layoutingId, grossWeight, grossWeightPipe, grossWeightOther, noOfPartsBlank, disabledSurfaceArea,
            pipeWeight, numberOfPipe, weightOther } = this.state;
        console.log('value', values);

        let ActualGrossWight = '';

        if (weightType === 'PIPE') {
            ActualGrossWight = grossWeightPipe;
        } else if (weightType === 'BRACKET_PART') {
            ActualGrossWight = grossWeight;
        } else {
            ActualGrossWight = grossWeightOther;
        }

        let weightCalculationData = {
            CostingId: values.costingId,
            LayoutingId: layoutingId,
            RawMaterialId: values.RawMaterialId,
            PartId: values.PartId,
            GrossWeight: ActualGrossWight,
            FinishWeight: values.FinishWeight,
            WeightSpecification: "",
            NoOfPartsAndBlank: noOfPartsBlank,
            SurfaceArea: values.SurfaceArea,
            CalculateSurfaceArea: disabledSurfaceArea,
            SurfaceAreaSide: 0,   //TODO discuss later about key
            OverlapArea: values.OverlapArea,
            NetSurfaceArea: values.NetSurfaceArea,
            CalculateNetSurfaceArea: 0,  //TODO discuss later about key
            Thickness: values.Thickness,
            Width: values.Width,
            Length: values.Length,
            OD: values.OD,
            ID: values.ID,
            LengthOfPipe: values.LengthSLPIPE,
            NumberOfPipe: numberOfPipe,
            TotalWeight: pipeWeight,
            SizeName: "",   //TODO discuss later about key
            FlangeWidthOne: values.FlangeWidthOne,
            FlangeWidthTwo: values.FlangeWidthTwo,
            WebWidth: values.WebWidth,
            Depth: values.Depth,
            WeightPerPice: values.WeightPerPc,
            WeightUnitKg: weightOther,
            IsActive: true,
            CreatedDate: "",
            CreatedBy: "",
            ModifiedBy: ""
        }

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
        /** Add detail for creating new UOM  */
        this.props.createWeightCalculationCosting(weightCalculationData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.UOM_ADD_SUCCESS);
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });
        //}
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
                                                    checked={this.state.weightType == 'BRACKET_PART' ? true : false}
                                                    name="weightType"
                                                    value="BRACKET_PART" />{' '}
                                                BRACKET PART
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.weightTypeHandler('PIPE', 'Pipe')}
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
                                                onChange={() => this.weightTypeHandler('L_Sec', 'L Sec')}
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
                                                onChange={() => this.weightTypeHandler('Plate', 'Plate')}
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
                                                onChange={() => this.weightTypeHandler('C_Sec', 'C Sec')}
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
                                                onChange={() => this.weightTypeHandler('Z_Sec', 'Z Sec')}
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
                                                onChange={() => this.weightTypeHandler('Tube', 'Tube')}
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

    const { weightLayoutType, getCostingDetailData, weightCostingInfo } = costWorking;
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
        }
    }

    return { weightLayoutType, initialValues, getCostingDetailData, weightCostingInfo };
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
})(reduxForm({
    form: 'AddWeightCostingForm',
    enableReinitialize: true,
})(AddWeightCosting));
