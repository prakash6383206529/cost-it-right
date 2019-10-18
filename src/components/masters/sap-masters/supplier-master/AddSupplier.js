import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, email, minLength7, maxLength70 } from "../../../../helper/validation";
import { renderText,renderSelectField, renderEmailInputField, renderMultiSelectField ,renderCheckboxInputField} from "../../../layout/FormInputs";
import { createSupplierAPI } from '../../../../actions/master/Supplier';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI,fetchPlantDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT} from '../../../../helper/AllConastant'

class AddSupplier extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryListing: [],
            stateListing: [],
            cityListing: [],
            selectedPlants: [],
            plantsArray: []
        }
    }

    componentDidMount(){
        this.props.fetchCountryDataAPI(res => {
            console.log('response of country', res);
        });  
        this.props.fetchPlantDataAPI(res => {}) 
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
    handlePlantSelection = e => {
        this.setState({
            selectedPlants: e
        });
    };
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
        this.props.fetchCityDataAPI(e.target.value, res => {console.log('res of city', res);});
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

    renderSelectPlantList = () => {
        const { plantList } = this.props;
        const temp = [];
        plantList && plantList.map(item =>
            {
                if(item.Value != 0){
                    temp.push({ Text: item.Text, Value: item.Value })
                }
            }
            );
            console.log('temp', plantList);
        return temp;
    }
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedPlants } = this.state;
        let plantArray = [];
        selectedPlants.map((item, i) => {
            return plantArray.push({ PlantId: item.Value, PlantName: item.Text });
        });
        let formData = {
            SupplierName : values.SupplierName,
            SupplierCode : values.SupplierCode,
            SupplierEmail : values.SupplierEmail,
            Description: values.Description,
            CityId: values.CityId,
            SelectedPlants: plantArray
        }
        console.log('submit form' , formData);
        this.props.createSupplierAPI(formData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.SUPPLIER}`}</ModalHeader>
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
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.NAME}`}
                                                name={"SupplierName"}
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
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.CODE}`}
                                                name={"SupplierCode"}
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
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.EMAIL}`}
                                                name={"SupplierEmail"}
                                                type="email"
                                                //placeholder={'email@domain.com/co.us'}
                                                validate={[required, email, minLength7, maxLength70]}
                                                component={renderEmailInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SUPPLIER} ${CONSTANT.DESCRIPTION}`}
                                                name={"Description"}
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
                                               name={"CountryId"}
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
                                               name={"StateId"}
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
                                        <Col md="6">
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
                                        <Col md="6">
                                            <Field
                                                name="SelectedPlants"
                                                label="Plants"
                                                placeholder="--Select Plant--"
                                                selection={this.state.selectedPlants}
                                                options={this.renderSelectPlantList()}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={false}
                                                className="withoutBorder"
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
   const { countryList, stateList, cityList, plantList} = comman
   console.log('plantList: ', plantList);
    return { countryList, stateList, cityList, plantList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createSupplierAPI, fetchCountryDataAPI, 
    fetchStateDataAPI, fetchCityDataAPI, fetchPlantDataAPI })(reduxForm({
    form: 'AddSupplier',
    enableReinitialize: true,
})(AddSupplier));
