import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField } from "../../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI } from '../../../../actions/master/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddPlant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryListing: [],
            stateListing: [],
            cityListing: [],
            isActiveBox: true,
        }
    }

    componentDidMount() {
        const { PlantId, isEditFlag } = this.props;
        // this.props.fetchCountryDataAPI(res => { });
        this.props.fetchSupplierCityDataAPI(() => { })
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getPlantUnitAPI(PlantId, true, res => { })
            })
        } else {
            this.props.getPlantUnitAPI('', false, res => { })
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
    * @method handleCountryChange
    * @description  used to handle country selection
    */
    handleCountryChange = (e) => {
        this.props.fetchStateDataAPI(e.target.value, res => {
            console.log('res of state: ', res);
        });
    }

    /**
    * @method handleStateChange
    * @description  used to handle state selection
    */
    handleStateChange = (e) => {
        this.props.fetchCityDataAPI(e.target.value, res => { console.log('res of city', res); });
    }

    /**
    * @method handleCityChange
    * @description  used to handle city selection
    */
    handleCityChange = (value) => {
        // this.setState({
        //     cityListing: value
        // });
    }

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item =>
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
        let formData = {
            PlantName: values.PlantName,
            PlantTitle: values.PlantTitle,
            UnitNumber: values.UnitNumber,
            Address: values.Address,
            CityId: values.CityId
        }
        //console.log("formData", formData, values)
        if (this.props.isEditFlag) {
            console.log('values', values);
            const { PlantId } = this.props;
            this.setState({ isSubmitted: true });
            let formData1 = {
                PlantName: values.PlantName,
                PlantTitle: values.PlantTitle,
                UnitNumber: values.UnitNumber,
                Address: values.Address,
                CityId: values.CityId,
                PlantId: PlantId,
                IsActive: this.state.isActiveBox
            }
            this.props.updatePlantAPI(PlantId, formData1, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PLANT_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else {
            this.props.createPlantAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
                    { this.toggleModel() }
                } else {
                    toastr.error(res.data.Message);
                }
            });
        }
    }

    activeHandler = () => {
        this.setState({
            isActiveBox: !this.state.isActiveBox
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, plantUnitDetail } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Plant' : 'Add Plant'}</ModalHeader>
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
                                                label={`${CONSTANT.PLANT} ${CONSTANT.NAME}`}
                                                name={"PlantName"}
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
                                                label={`${CONSTANT.PLANT} ${CONSTANT.TITLE}`}
                                                name={"PlantTitle"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Unit ${CONSTANT.NUMBER}`}
                                                name={"UnitNumber"}
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
                                                label={`${CONSTANT.PLANT} ${CONSTANT.ADDRESS}`}
                                                name={"Address"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    {/* <Row>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.COUNTRY}`}
                                                name={"CountryId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.countryListing}
                                                required={true}
                                                options={this.selectType('country')}
                                                onChange={(Value) => this.handleCountryChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.STATE}`}
                                                name={"StateId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.stateListing}
                                                required={true}
                                                options={this.selectType('state')}
                                                onChange={(Value) => this.handleStateChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row> */}
                                    <Row>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.CITY}`}
                                                name={"CityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.cityListing}
                                                required={true}
                                                options={this.selectType('city')}
                                                onChange={(Value) => this.handleCityChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    {isEditFlag &&
                                        <Col md="6">
                                            <Label>
                                                <Input
                                                    type="checkbox"
                                                    id="checkbox2"
                                                    defaultChecked={plantUnitDetail && plantUnitDetail.IsActive ? true : false}
                                                    checked={this.state.isActiveBox}
                                                    onChange={this.activeHandler}
                                                    name="IsActive" />{' '}
                                                Is Active
                                            </Label>
                                        </Col>
                                    }
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
function mapStateToProps({ comman, plant }) {
    const { countryList, stateList, cityList } = comman;
    const { plantUnitDetail } = plant;
    let initialValues = {};
    if (plantUnitDetail && plantUnitDetail !== undefined) {
        initialValues = {
            PlantName: plantUnitDetail.PlantName,
            PlantTitle: plantUnitDetail.PlantTitle,
            UnitNumber: plantUnitDetail.UnitNumber,
            Address: plantUnitDetail.Address,
            //CountryId: plantUnitDetail.CreatedBy,
            //StateId: plantUnitDetail.CreatedBy,
            CityId: plantUnitDetail.CityIdRef,
        }
    }
    return { countryList, stateList, cityList, initialValues, plantUnitDetail }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createPlantAPI, fetchCountryDataAPI,
    fetchStateDataAPI, fetchCityDataAPI,
    getPlantUnitAPI, fetchSupplierCityDataAPI,
    updatePlantAPI
})(reduxForm({
    form: 'AddPlant',
    enableReinitialize: true,
})(AddPlant));
