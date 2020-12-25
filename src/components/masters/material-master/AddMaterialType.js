import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, decimalLengthFour, alphaNumeric } from "../../../helper/validation";
import { renderText, renderNumberInputField } from "../../layout/FormInputs";
import { createMaterialTypeAPI, getMaterialDetailAPI, getMaterialTypeDataAPI, updateMaterialtypeAPI } from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddMaterialType extends Component {
    constructor(props) {
        super(props);
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
        const { ID, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getMaterialTypeDataAPI(ID, res => { });
        } else {
            this.props.getMaterialTypeDataAPI('', res => { });
        }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.getMaterialTypeDataAPI('', res => { });
        this.toggleDrawer('')
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { reset, ID, isEditFlag } = this.props;

        if (isEditFlag) {
            let updateData = {
                MaterialTypeId: ID,
                ModifiedBy: loggedInUserId(),
                CreatedDate: '',
                MaterialType: values.MaterialType,
                CalculatedDensityValue: values.CalculatedDensityValue,
                IsActive: true
            }
            this.props.updateMaterialtypeAPI(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
                    this.props.getMaterialTypeDataAPI('', res => { });
                    reset();
                    this.toggleDrawer('')
                }
            })

        } else {

            let formData = {
                MaterialType: values.MaterialType,
                CalculatedDensityValue: values.CalculatedDensityValue,
                CreatedBy: loggedInUserId(),
                IsActive: true
            }
            this.props.createMaterialTypeAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
                    this.props.getMaterialTypeDataAPI('', res => { });
                    reset();
                    this.toggleDrawer('')
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
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Material' : 'Add Material'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <Field
                                            label={`Material`}
                                            name={"MaterialType"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required, alphaNumeric]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                    <Col md="12">
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
                                </Row>

                                <Row className=" no-gutters justify-content-between">
                                    <div className="col-md-12">
                                        <div className="text-right ">
                                            {/* <input
                                                //disabled={pristine || submitting}
                                                onClick={this.cancel}
                                                type="button"
                                                value="Cancel"
                                                className="reset mr15 cancel-btn"
                                            />
                                            <input
                                                //disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            /> */}
                                            <button
                                                onClick={this.cancel}
                                                type="submit"
                                                value="CANCEL"
                                                className="reset mr15 cancel-btn">

                                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div>CANCEL</button>
                                            <button
                                                type="submit"
                                                // disabled={isSubmitted ? true : false}
                                                className="btn-primary save-btn"
                                            >	<div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' />
                                                </div>
                                                {this.state.isEditFlag ? 'UPDATE' : 'SAVE'}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>

                    </Container>
                </Drawer>
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
    if (materialTypeData && materialTypeData !== undefined) {
        initialValues = {
            MaterialType: materialTypeData.MaterialType,
            CalculatedDensityValue: materialTypeData.Density,
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
