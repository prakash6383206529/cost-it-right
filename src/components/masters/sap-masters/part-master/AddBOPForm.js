import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, } from "../../../../helper/validation";
import { renderText, searchableSelect } from "../../../layout/FormInputs";
import { getBoughtOutPartSelectList } from '../../../../actions/master/Part';
import { } from '../../../../actions/master/Comman';

class AddBOPForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            assemblyPart: [],
            parentPart: [],
            BOPPart: [],
            isAddMore: false,
        }
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

    /**
    * @method handleBOPPartChange
    * @description  used to handle 
    */
    handleBOPPartChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ BOPPart: newValue });
        } else {
            this.setState({ BOPPart: [], });
        }
    }

    /**
    * @method handleParentPartChange
    * @description  used to handle 
    */
    handleParentPartChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ parentPart: newValue });
        } else {
            this.setState({ parentPart: [], });
        }
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { boughtOutPartSelectList } = this.props;
        const temp = [];

        if (label === 'BOPPart') {
            boughtOutPartSelectList && boughtOutPartSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
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
        this.props.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {

            let formData = {

            }

            // this.props.updateSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
            //         this.props.toggleDrawer('')
            //     }
            // });

        } else {/** Add new detail for creating supplier master **/

            let formData = {

            }

            // this.props.createSupplierAPI(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
            //         this.props.toggleDrawer('')
            //     }
            // });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, } = this.props;
        return (
            <>

                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row>
                        <Col md='6'>
                            <Field
                                name="BOPPartNumber"
                                type="text"
                                label={'BOP Part No.'}
                                component={searchableSelect}
                                placeholder={'BOP Part'}
                                options={this.renderListing('BOPPart')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.BOPPart == null || this.state.BOPPart.length === 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleBOPPartChange}
                                valueDescription={this.state.BOPPart}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`BOP Part Name`}
                                name={"BOPPartName"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`BOP Category`}
                                name={"BOPCategory"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Specification`}
                                name={"Specification"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>

                        <Col md="6">
                            <Field
                                label={`Plant`}
                                name={"Plant"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={true}
                            />
                        </Col>


                        <Col md="6">
                            <Field
                                label={`Quantity`}
                                name={"Quantity"}
                                type="text"
                                placeholder={''}
                                validate={[required, number]}
                                component={renderText}
                                required={true}
                                className=""
                                customClassName={'withBorder'}
                                disabled={false}
                            />
                        </Col>
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
                                type={'submit'}
                                className="submit-button mr5 save-btn"
                                onClick={() => this.setState({ isAddMore: true })} >
                                <div className={'plus'}></div>
                                {'ADD MORE'}
                            </button>
                            <button
                                type="submit"
                                className="submit-button mr5 save-btn"
                                onClick={() => this.setState({ isAddMore: false })} >
                                <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                {isEditFlag ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </Row>

                </form>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part }) {
    const { boughtOutPartSelectList } = part;
    return { boughtOutPartSelectList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBoughtOutPartSelectList,
})(reduxForm({
    form: 'AddBOPForm',
    enableReinitialize: true,
})(AddBOPForm));
