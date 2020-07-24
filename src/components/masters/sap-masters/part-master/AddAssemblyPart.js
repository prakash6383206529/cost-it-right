import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col } from 'reactstrap';
import { required, number, maxLength6, maxLength10 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI } from '../../../../actions/master/Plant';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import AssemblyPartListing from "./AssemblyPartListing";
import $ from 'jquery';

class AddAssemblyPart extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PartId: '',
            isShowForm: false,
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    componentDidMount() {

    }

    /**
    * @method getDetails
    * @description Used to cancel modal
    */
    getDetails = (data) => {
        // if (data && data.isEditFlag) {
        //     this.setState({
        //         isEditFlag: false,
        //         isLoader: true,
        //         isShowForm: true,
        //         PartId: data.Id,
        //     })
        //     if (data.passwordFlag == false) {
        //         $('html, body').animate({ scrollTop: 0 }, 'slow');
        //     }
        //     this.props.getPlantUnitAPI(data.Id, true, res => {
        //         if (res && res.data && res.data.Result) {

        //             const Data = res.data.Data;

        //             this.props.fetchStateDataAPI(Data.CountryId, () => { })
        //             this.props.fetchCityDataAPI(Data.StateId, () => { })

        //             setTimeout(() => {
        //                 const { countryList, stateList, cityList } = this.props;

        //                 const CountryObj = countryList && countryList.find(item => item.Value == Data.CountryId)
        //                 const StateObj = stateList && stateList.find(item => item.Value == Data.StateId)
        //                 const CityObj = cityList && cityList.find(item => item.Value == Data.CityIdRef)

        //                 this.setState({
        //                     isEditFlag: true,
        //                     isLoader: false,
        //                     country: { label: CountryObj.Text, value: CountryObj.Value },
        //                     state: { label: StateObj.Text, value: StateObj.Value },
        //                     city: { label: CityObj.Text, value: CityObj.Value },
        //                 })
        //             }, 500)
        //         }
        //     })
        // } else {
        //     this.props.getPlantUnitAPI('', false, res => { })
        // }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];

        if (label === 'country') {
            countryList && countryList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }


    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        //this.props.getPlantUnitAPI('', false, res => { })
        this.setState({
            isEditFlag: false,
            isShowForm: false,

        })
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log("values", values)
        const { country, state, city, PlantId, isEditFlag } = this.state;
        const { reset } = this.props;
        const userDetail = userDetails();

        if (isEditFlag) {
            this.setState({ isSubmitted: true });
            let updateData = {

            }
            // this.props.updatePlantAPI(PlantId, updateData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_PLANT_SUCESS);
            //         reset();
            //         this.child.getUpdatedData();
            //     }
            // });

        } else {

            let formData = {

            }

            // this.props.createPlantAPI(formData, (res) => {
            //     if (res.data.Result === true) {
            //         toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
            //         reset();
            //         this.child.getUpdatedData();
            //     }
            // });
        }
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset } = this.props;
        const { isEditFlag } = this.state;
        return (
            <>
                <Container>
                    <div className="login-container signup-form">

                        <Row>
                            {this.state.isShowForm &&
                                <Col md="12">
                                    <div className="shadow-lgg login-formg pt-30">
                                        <Row>
                                            <Col md="6">
                                                <div className="form-heading mb-0">
                                                    <h2>{this.state.isEditFlag ? 'Update Assembly Part' : 'Add  Assembly Part'}</h2>
                                                </div>
                                            </Col>
                                        </Row>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        >
                                            <Row>
                                                <Col md="6">
                                                    <Field
                                                        label={`BOM No.`}
                                                        name={"BOMNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>

                                            </Row>

                                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                                <div className="col-sm-12 text-center">
                                                    <button
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>

                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                </div>
                                            </Row>

                                        </form>
                                    </div>
                                </Col>
                            }
                        </Row>
                    </div>
                    <AssemblyPartListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm}
                    />
                </Container>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {

    let initialValues = {};
    // if (plantUnitDetail && plantUnitDetail !== undefined) {
    //     initialValues = {
    //         PlantName: plantUnitDetail.PlantName,
    //     }
    // }
    return { initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddAssemblyPart',
    enableReinitialize: true,
})(AddAssemblyPart));
