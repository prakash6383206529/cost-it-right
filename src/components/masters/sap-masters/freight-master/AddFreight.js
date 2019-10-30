import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { createFreightAPI, getFreightDetailAPI } from '../../../../actions/master/Freight';
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

    componentDidMount() {
        this.props.fetchFreightComboAPI(res => {});
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
        this.props.createFreightAPI(values, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.FREIGHT_ADDED_SUCCESS);
                this.props.getFreightDetailAPI(res => {});
                this.toggleModel();
            } else {
                toastr.error(res.data.Message);
            }
        });
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.FREIGHT}`}</ModalHeader>
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
                                        <Col md="12">
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
                                    </Row>
                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate/KG`}
                                                name={"PartTruckLoadRatePerKilogram"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate in feet`}
                                                name={"PartTruckLoadRateCubicFeet"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 1 tone`}
                                                name={"FullTruckLoadRateOneTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                               // className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 2 tone`}
                                                name={"FullTruckLoadRateTwoTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 5 tone`}
                                                name={"FullTruckLoadRateFiveTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 9 tone`}
                                                name={"FullTruckLoadRateNineTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 11 tone`}
                                                name={"FullTruckLoadRateElevenTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 16 tone`}
                                                name={"FullTruckLoadRateSixteenTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 25 tone`}
                                                name={"FullTruckLoadRateTwentyFiveTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate 31 tone`}
                                                name={"FullTruckLoadRateThirtyOneTon"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`${CONSTANT.PART} Truck Load Rate Trailer`}
                                                name={"FullTruckLoadRateTrailer"}
                                                type="text"
                                                placeholder={''}
                                                component={renderNumberInputField}
                                                //className=" withoutBorder"
                                            />
                                        </Col>  
                                    </Row>
                                    
                                    <Row>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {`${CONSTANT.SAVE}`}
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
    const {cityList, plantList } = comman
    return { cityList, plantList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createFreightAPI, 
    fetchFreightComboAPI, getFreightDetailAPI })(reduxForm({
    form: 'AddFreight',
    //enableReinitialize: true,
})(AddFreight));
