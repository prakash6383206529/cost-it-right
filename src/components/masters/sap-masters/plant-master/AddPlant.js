import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText,renderSelectField } from "../../../layout/FormInputs";
import { createPlantAPI } from '../../../../actions/master/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT} from '../../../../helper/AllConastant'

class AddPlant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryListing: [],
            stateListing: [],
            cityListing: [],
        }
    }

    componentDidMount(){
        this.props.fetchCountryDataAPI(res => {
            console.log('response of country', res);
        });   
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
    handleCountryChange = (value) => {
        // this.setState({
        //     countryListing: value
        // });
        this.props.fetchStateDataAPI(value.target.value, res => {
            console.log('res of state: ', res);
        });
    }
    
    /**
    * @method handleStateChange
    * @description  used to handle state selection
    */
    handleStateChange = (value) => {
        // this.setState({
        //     stateListing: value
        // });
        this.props.fetchCityDataAPI(value.target.value, res => {console.log('res of city', res);});
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
        if(label === 'country'){
            countryList && countryList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
                );
                console.log('temp', countryList);
                return temp;
        }
        if(label === 'state'){
            stateList && stateList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
                );
                console.log('temp', stateList);
                return temp;
        } 
        if(label === 'city'){
            cityList && cityList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
                );
                console.log('temp', cityList);
                return temp;
        }
       
    }
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        let formData = {
            PlantName : values.PlantName,
            PlantTitle : values.PlantTitle,
            UnitNumber : values.UnitNumber,
            Address: values.Address,
            CityId: values.CityId
        }
        this.props.createPlantAPI(formData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
                {this.toggleModel()}
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.PLANT}`}</ModalHeader>
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
                                    <Row>
                                         <Col md="6">
                                            <Field
                                                label={`${CONSTANT.COUNTRY}`}
                                                //name={"CityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.countryListing}
                                                required={true}
                                                options={this.selectType('country')}
                                                onChange={(Value)=>this.handleCountryChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.STATE}`}
                                                //name={"CityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.stateListing}
                                                required={true}
                                                options={this.selectType('state')}
                                                onChange={(Value)=>this.handleStateChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
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
                                                onChange={(Value)=>this.handleCityChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
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
   const { countryList, stateList, cityList} = comman
    return { countryList, stateList, cityList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createPlantAPI, fetchCountryDataAPI, 
    fetchStateDataAPI, fetchCityDataAPI })(reduxForm({
    form: 'AddPlant',
    enableReinitialize: true,
})(AddPlant));
