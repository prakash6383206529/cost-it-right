import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, decimalLengthFour } from "../../../../../helper/validation";
import { renderText, renderNumberInputField } from "../../../../layout/FormInputs";
import { createMaterialTypeAPI, getMaterialDetailAPI, getMaterialTypeDataAPI, updateMaterialtypeAPI } from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";
import RMDetail from "./RMDetail";
import $ from 'jquery';

class AddMaterialType extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isShowForm: false,
            MaterialTypeId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { MaterialTypeId, isEditFlag } = this.props;
        // if (isEditFlag) {
        //     this.props.getMaterialTypeDataAPI(MaterialTypeId, res => { });
        // } else {
        //     this.props.getMaterialTypeDataAPI('', res => { });
        // }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('1');
    }

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isEditFlag: false,
            isShowForm: false,
        })
    }

    /**
   * @method getDetails
   * @description used to get details
   */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isShowForm: true,
                isEditFlag: true,
                MaterialTypeId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getMaterialTypeDataAPI(data.ID, (res) => {
                if (res && res.data && res.data.Data) {


                }
            })
        }
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, MaterialTypeId } = this.state;
        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            console.log('this.child', this.child)
            let updateData = {
                MaterialTypeId: MaterialTypeId,
                ModifiedBy: loggedInUserId(),
                CreatedDate: '',
                MaterialType: values.MaterialType,
                Description: values.Description,
                CalculatedDensityValue: values.CalculatedDensityValue,
                IsActive: true
            }
            this.props.updateMaterialtypeAPI(updateData, () => {
                this.child.getUpdatedData();
                this.props.getMaterialTypeDataAPI('', res => { });
                this.setState({
                    isShowForm: false,
                    isEditFlag: false,
                })
            })

        } else {

            let formData = {
                MaterialType: values.MaterialType,
                Description: '',
                CalculatedDensityValue: values.CalculatedDensityValue,
                CreatedBy: loggedInUserId(),
                IsActive: true
            }
            this.props.createMaterialTypeAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
                    const filterData = {
                        PageSize: 0,
                        LastIndex: 0,
                        TechnologyId: '',
                        DestinationSupplierId: '',
                        PlantId: '',
                    }
                    this.props.getMaterialDetailAPI(filterData, res => { });
                    this.props.getMaterialTypeDataAPI('', res => { });
                    this.child.getUpdatedData();
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
            <div>
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12" >
                            <button
                                type="button"
                                className={'btn btn-primary user-btn mb15'}
                                onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}>Add</button>
                        </div>
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lg login-form">
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Material`}
                                                    name={"MaterialType"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="5">
                                                <Field
                                                    label={`Density (g/cm3)`}
                                                    name={"CalculatedDensityValue"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required, decimalLengthFour]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=" withoutBorder"
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="1">
                                                <label>(kg/m3)</label>
                                            </Col>
                                        </Row>

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-3 text-center">
                                                <button
                                                    type="submit"
                                                    onClick={this.cancel}
                                                    className="btn btn-danger mr15" >
                                                    {'CANCEL'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn dark-pinkbtn" >
                                                    {isEditFlag ? 'UPDATE' : 'SAVE'}
                                                </button>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <RMDetail
                    onRef={ref => (this.child = ref)}
                    getDetails={this.getDetails} />
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { materialTypeData } = material;
    let initialValues = {};
    if (materialTypeData && materialTypeData != undefined) {
        initialValues = {
            MaterialType: materialTypeData.MaterialType,
            CalculatedDensityValue: materialTypeData.Density,
            Description: materialTypeData.Description,
        }
    }
    return { initialValues, materialTypeData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createMaterialTypeAPI,
    getMaterialDetailAPI,
    getMaterialTypeDataAPI,
    updateMaterialtypeAPI
})(reduxForm({
    form: 'AddMaterialType',
    enableReinitialize: true,
})(AddMaterialType));
