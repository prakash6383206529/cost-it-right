import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { createFreightAPI, getFreightDetailAPI, updateFreightAPI, getFreightByIdAPI } from '../../../../actions/master/Freight';
import { fetchFreightComboAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddFreight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
        }
    }

    /**
        * @method componentWillMount
        * @description called before rendering the component
        */
    componentWillMount() {
        this.props.fetchFreightComboAPI(res => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
        */
    componentDidMount() {
        const { freightId, isEditFlag } = this.props;
        if (isEditFlag) {
            /** Get unit detail of the freight  */
            this.setState({ isEditFlag }, () => {
                this.props.getFreightByIdAPI(freightId, true, res => { })
            })
        } else {
            this.props.getFreightByIdAPI('', false, res => { })
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
   * @method handlePlantSelection
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
        const { plantList, cityList } = this.props;
        const temp = [];
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item =>
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
        /** Update detail of the existing Freight  */
        if (this.props.isEditFlag) {
            const { freightId } = this.props;
            let formData = {
                FreightId: freightId,
                SourceCityId: values.SourceCityId,
                DestinationCityId: values.DestinationCityId,
                PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
                PartTruckLoadRateCubicFeet: values.PartTruckLoadRateCubicFeet,
                FullTruckLoadRateOneTon: values.FullTruckLoadRateOneTon,
                FullTruckLoadRateTwoTon: values.FullTruckLoadRateTwoTon,
                FullTruckLoadRateFiveTon: values.FullTruckLoadRateFiveTon,
                FullTruckLoadRateNineTon: values.FullTruckLoadRateNineTon,
                FullTruckLoadRateElevenTon: values.FullTruckLoadRateElevenTon,
                FullTruckLoadRateSixteenTon: values.FullTruckLoadRateSixteenTon,
                FullTruckLoadRateTwentyFiveTon: values.FullTruckLoadRateTwentyFiveTon,
                FullTruckLoadRateThirtyOneTon: values.FullTruckLoadRateThirtyOneTon,
                FullTruckLoadRateTrailer: values.FullTruckLoadRateTrailer,
                PlantId: values.PlantId,
            }
            this.props.updateFreightAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_FREIGHT_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else { /** Add new detail of the Freight  */
            this.props.createFreightAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.FREIGHT_ADDED_SUCCESS);
                    this.props.getFreightDetailAPI(res => { });
                    this.toggleModel();
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Freight' : 'Add Freight'}</ModalHeader>
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
                                                label={`${CONSTANT.PART} Truck Load Rate/KG`}
                                                name={"PartTruckLoadRatePerKilogram"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate in feet`}
                                                name={"PartTruckLoadRateCubicFeet"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 1 tone`}
                                                name={"FullTruckLoadRateOneTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 2 tone`}
                                                name={"FullTruckLoadRateTwoTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 5 tone`}
                                                name={"FullTruckLoadRateFiveTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 9 tone`}
                                                name={"FullTruckLoadRateNineTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 11 tone`}
                                                name={"FullTruckLoadRateElevenTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 16 tone`}
                                                name={"FullTruckLoadRateSixteenTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 25 tone`}
                                                name={"FullTruckLoadRateTwentyFiveTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 31 tone`}
                                                name={"FullTruckLoadRateThirtyOneTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SOURCE} ${CONSTANT.CITY}`}
                                                name={"SourceCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.selectType('city')}
                                                onChange={this.handleTypeSelection}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.DESTINATION} ${CONSTANT.CITY}`}
                                                name={"DestinationCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.selectType('city')}
                                                onChange={this.handleTypeSelection}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
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
                                                label={`${CONSTANT.PART} Truck Load Rate Trailer`}
                                                name={"FullTruckLoadRateTrailer"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
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
function mapStateToProps({ comman, freight }) {
    const { cityList, plantList } = comman;
    const { freightData } = freight;
    let initialValues = {};
    if (freightData && freightData !== undefined) {
        initialValues = {
            PartTruckLoadRatePerKilogram: freightData.PartTruckLoadRatePerKilogram,
            PartTruckLoadRateCubicFeet: freightData.PartTruckLoadRateCubicFeet,
            FullTruckLoadRateOneTon: freightData.FullTruckLoadRateOneTon,
            FullTruckLoadRateTwoTon: freightData.FullTruckLoadRateTwoTon,
            FullTruckLoadRateFiveTon: freightData.FullTruckLoadRateFiveTon,
            FullTruckLoadRateNineTon: freightData.FullTruckLoadRateNineTon,
            FullTruckLoadRateElevenTon: freightData.FullTruckLoadRateElevenTon,
            FullTruckLoadRateSixteenTon: freightData.FullTruckLoadRateSixteenTon,
            FullTruckLoadRateTwentyFiveTon: freightData.FullTruckLoadRateTwentyFiveTon,
            FullTruckLoadRateThirtyOneTon: freightData.FullTruckLoadRateThirtyOneTon,
            SourceCityId: freightData.SourceCityId,
            DestinationCityId: freightData.DestinationCityId,
            PlantId: freightData.PlantId,
            FullTruckLoadRateTrailer: freightData.FullTruckLoadRateTrailer,

        }
    }
    return { cityList, plantList, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createFreightAPI, updateFreightAPI, getFreightByIdAPI,
    fetchFreightComboAPI, getFreightDetailAPI
})(reduxForm({
    form: 'AddFreight',
    enableReinitialize: true,
})(AddFreight));
