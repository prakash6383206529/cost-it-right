import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, maxLength25, minLength3 } from "../../../../helper/validation";
import { renderText, searchableSelect } from "../../../layout/FormInputs";
import {
    createUnitOfMeasurementAPI, updateUnitOfMeasurementAPI, getOneUnitOfMeasurementAPI,
    getUnitOfMeasurementAPI, getUnitTypeListAPI
} from '../../../../actions/master/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddUOM extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unitTypes: []
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { ID, isEditFlag } = this.props;
        this.props.getUnitTypeListAPI(() => { })
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getOneUnitOfMeasurementAPI(ID, true, res => {
                    const { unitTypeList } = this.props;
                    if (res && res.data && res.data.Data) {
                        let Data = res.data.Data;
                        let tempObj = unitTypeList && unitTypeList.find(item => item.Value == Data.UnitTypeId)
                        this.setState({ unitTypes: { label: tempObj.Text, value: tempObj.Value } })
                    }
                })
            })
        } else {
            this.props.getOneUnitOfMeasurementAPI('', false, res => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        this.props.closeDrawer('')
    };

    /**
   * @method selectType
   * @description Used show listing of unit of measurement
   */
    searchableSelectType = (label) => {
        const { unitTypeList } = this.props;
        const temp = [];

        if (label === 'UnitType') {
            unitTypeList && unitTypeList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
     * @method unitTypeHandler
     * @description Used to handle Unit Types
     */
    unitTypeHandler = (newValue, actionMeta) => {
        this.setState({ unitTypes: newValue });
    };

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            unitTypes: [],
        })
        this.toggleDrawer('')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { unitTypes } = this.state;

        /** Update detail of the existing UOM  */
        if (this.props.isEditFlag) {
            const { ID } = this.props;
            this.setState({ isSubmitted: true });
            let formData = {
                Id: ID,
                Unit: values.Unit,
                UnitTypeId: unitTypes.value,
                IsActive: true,
                ModifiedBy: loggedInUserId(),
            }
            this.props.updateUnitOfMeasurementAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
                    //this.toggleModel();
                    this.toggleDrawer('');
                    this.props.getUnitOfMeasurementAPI(res => { });
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else {
            /** Add detail for creating new UOM  */
            let reqData = {
                Unit: values.Unit,
                UnitTypeId: unitTypes.value,
                CreatedBy: loggedInUserId()
            }
            this.props.createUnitOfMeasurementAPI(reqData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.UOM_ADD_SUCCESS);
                    //this.toggleModel();
                    this.toggleDrawer('');
                    this.props.getUnitOfMeasurementAPI(res => { });
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
        const { handleSubmit, isEditFlag, reset } = this.props;
        return (
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
                                        <h3>{isEditFlag ? 'UPDATE UNIT' : 'ADD UNIT'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <div className="input-group form-group col-md-12 input-withouticon" >
                                    <Field
                                        label="UOM Name"
                                        name={"Unit"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required, minLength3, maxLength25]}
                                        component={renderText}
                                        required={true}
                                        maxLength={26}
                                        customClassName={'withBorder'}
                                    />
                                </div>
                                <div className="col-md-12 form-group" >
                                    <Field
                                        name="UnitTypeId"
                                        type="text"
                                        label="Unit Type"
                                        component={searchableSelect}
                                        placeholder={'Select Unit Type'}
                                        options={this.searchableSelectType('UnitType')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        validate={(this.state.unitTypes == null || this.state.unitTypes.length == 0) ? [required] : []}
                                        required={true}
                                        handleChangeDescription={this.unitTypeHandler}
                                        valueDescription={this.state.unitTypes}
                                    />
                                </div>

                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                        <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn" >
                                        <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                        {isEditFlag ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ unitOfMeasrement }) {
    const { unitOfMeasurementData, unitOfMeasurementList, unitTypeList } = unitOfMeasrement;
    let initialValues = {};
    if (unitOfMeasurementData && unitOfMeasurementData !== undefined) {
        initialValues = {
            Unit: unitOfMeasurementData.Unit,
        }
    }
    return { unitOfMeasurementData, initialValues, unitOfMeasurementList, unitTypeList };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createUnitOfMeasurementAPI,
    updateUnitOfMeasurementAPI,
    getOneUnitOfMeasurementAPI,
    getUnitOfMeasurementAPI,
    getUnitTypeListAPI,
})(reduxForm({
    form: 'addUOM',
    enableReinitialize: true,
})(AddUOM));
