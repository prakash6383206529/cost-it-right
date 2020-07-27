import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Label, CustomInput } from 'reactstrap';
import { required, number, upper, email, minLength7, maxLength70 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderEmailInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { } from '../../../../actions/master/Supplier';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../../../common/HeaderTitle';
import AddAssemblyForm from './AddAssemblyForm';
import AddComponentForm from './AddComponentForm';
import AddBOPForm from './AddBOPForm';

class AddChildDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            childType: 1,
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {

    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        const { isEditFlag } = this.props;

        if (isEditFlag) {

        } else {

        }
    }

    checkRadio = (radioType) => {
        this.setState({ childType: radioType })
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { } = this.props;
        const temp = [];
        // if (label === 'country') {
        //     countryList && countryList.map(item =>
        //         temp.push({ label: item.Text, value: item.Value })
        //     );
        //     return temp;
        // }

    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { } = this.state;

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {
            const { supplierId } = this.props;
            let formData = {

            }

            // this.props.updateSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
            //         this.toggleDrawer('')
            //     }
            // });

        } else {/** Add new detail for creating supplier master **/

            let formData = {

            }
            console.log('formData', formData)
            // this.props.createSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
            //         this.toggleDrawer('')
            //     }
            // });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        const { childType } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            {/* <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            > */}
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{isEditFlag ? 'Update Child' : 'Add Child'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => this.toggleDrawer(e)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className="drawer-body">
                                <Row>
                                    <Col md="12">
                                        <HeaderTitle
                                            title={'Type:'}
                                            customClass={'Personal-Details'} />
                                    </Col>
                                    <Col md="12">
                                        <Label sm={4} className={'pl0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType == 1 ? true : false}
                                                onClick={() => this.checkRadio(1)}
                                            />{' '}
                                                Sub Assembly
                                            </Label>
                                        <Label sm={4} className={'pl0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType == 2 ? true : false}
                                                onClick={() => this.checkRadio(2)}
                                            />{' '}
                                                Component
                                            </Label>
                                        <Label sm={4} className={'pl0'} check>
                                            <input
                                                type="radio"
                                                name="childType"
                                                checked={childType == 3 ? true : false}
                                                onClick={() => this.checkRadio(3)}
                                            />{' '}
                                                Bought Out Part
                                            </Label>
                                    </Col>
                                </Row>


                                {childType == 1 &&
                                    <AddAssemblyForm
                                        toggleDrawer={this.toggleDrawer}
                                    />
                                }

                                {childType == 2 &&
                                    <AddComponentForm
                                        toggleDrawer={this.toggleDrawer}
                                    />
                                }

                                {childType == 3 &&
                                    <AddBOPForm
                                        toggleDrawer={this.toggleDrawer}
                                    />
                                }



                                {/* <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-md-12">
                                            <div className="text-center ">
                                                <input
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
                                                />
                                            </div>
                                        </div>
                                    </Row> */}
                            </div>
                            {/* </form> */}
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
function mapStateToProps({ }) {

    return {}
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddChildDrawer',
    enableReinitialize: true,
})(AddChildDrawer));
