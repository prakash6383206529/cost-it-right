import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Label } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField
} from "../../../layout/FormInputs";
import { fetchModelTypeAPI, fetchCostingHeadsAPI, } from '../../../../actions/master/Comman';
import { getVendorListByVendorType } from '../../../../actions/master/Material';
import { createProfit, updateProfit, getProfitData, } from '../../../../actions/master/OverheadProfit';
import { getClientSelectList, } from '../../../../actions/master/Client';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery';
import { FILE_URL } from '../../../../config/constants';
import ProfitListing from './ProfitListing';
const selector = formValueSelector('AddProfit');

class AddProfit extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            ProfitID: '',
            costingHead: 'zero',
            isShowForm: false,
            isEditFlag: false,
            IsVendor: false,

            ModelType: [],
            vendorName: [],

            overheadAppli: [],

            remarks: '',

            isRM: false,
            isCC: false,
            isBOP: false,
            isOverheadPercent: false
        }
    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        this.props.fetchModelTypeAPI('--Model Types--', res => { });
        this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
        this.props.getVendorListByVendorType(false, () => { })
        this.props.getClientSelectList(() => { })
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = (vendorFlag, costingHeadFlag) => {
        this.setState({
            IsVendor: vendorFlag,
            costingHead: costingHeadFlag,
            vendorName: [],
        }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(IsVendor, () => { })
        });
    }

    /**
    * @method handleModelTypeChange
    * @description called
    */
    handleModelTypeChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ ModelType: newValue, });
        } else {
            this.setState({ ModelType: [], })
        }
    };

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    /**
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                isShowForm: true,
                ProfitID: data.Id,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getProfitData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.getVendorListByVendorType(Data.IsVendor, () => { })

                    setTimeout(() => {
                        const { modelTypes, costingHead, vendorListByVendorType } = this.props;

                        const modelObj = modelTypes && modelTypes.find(item => item.Value == Data.ModelTypeId)
                        const AppliObj = costingHead && costingHead.find(item => item.Value == Data.OverheadApplicabilityId)
                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value == Data.Vendor)

                        let tempArr = [];
                        let tempFiles = [];

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            isShowForm: true,
                            IsVendor: Data.IsVendor,
                            vendorName: { label: vendorObj.Text, value: vendorObj.Value },
                            ModelType: { label: modelObj.Text, value: modelObj.Value },
                            overheadAppli: { label: AppliObj.Text, value: AppliObj.Value },
                            remarks: Data.Remark,
                        })
                    }, 200)
                }
            })
        } else {
            this.props.getProfitData('', res => { })
        }
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { vendorListByVendorType, modelTypes, costingHead, clientSelectList } = this.props;
        const temp = [];

        if (label === 'ModelType') {
            modelTypes && modelTypes.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'ProfitApplicability') {
            costingHead && costingHead.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'ClientList') {
            clientSelectList && clientSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue });
        } else {
            this.setState({ vendorName: [] })
        }
    };

    /**
    * @method handleOverheadChange
    * @description called
    */
    handleOverheadChange = (newValue, actionMeta) => {
        this.resetFields();
        if (newValue && newValue != '') {
            this.setState({ overheadAppli: newValue, isRM: false, isCC: false, isBOP: false, isOverheadPercent: false }, () => {
                this.checkOverheadFields()
            });
        } else {
            this.setState({ overheadAppli: [], isRM: false, isCC: false, isBOP: false, isOverheadPercent: false })
        }
    };

    resetFields = () => {
        this.props.change('ProfitPercentage', 0)
        this.props.change('ProfitMachiningCCPercentage', 0)
        this.props.change('ProfitBOPPercentage', 0)
        this.props.change('ProfitRMPercentage', 0)
    }

    checkOverheadFields = () => {
        const { overheadAppli } = this.state;
        if (overheadAppli.label == 'RM') {
            this.setState({ isRM: false, isCC: true, isBOP: true, isOverheadPercent: true })
        } else if (overheadAppli.label == 'CC') {
            this.setState({ isRM: true, isCC: false, isBOP: true, isOverheadPercent: true })
        } else if (overheadAppli.label == 'BOP') {
            this.setState({ isRM: true, isBOP: false, isCC: true, isOverheadPercent: true })
        } else if (overheadAppli.label == 'Fixed') {
            this.setState({ isRM: true, isCC: true, isBOP: true, isOverheadPercent: true })
        } else if (overheadAppli.label == 'RM + CC') {
            this.setState({ isRM: false, isCC: false, isBOP: true, isOverheadPercent: false })
        } else if (overheadAppli.label == 'RM + BOP') {
            this.setState({ isRM: false, isCC: true, isBOP: false, isOverheadPercent: false })
        } else if (overheadAppli.label == 'BOP + CC') {
            this.setState({ isRM: true, isBOP: false, isCC: false, isOverheadPercent: false })
        } else if (overheadAppli.label == 'RM + CC + BOP') {
            this.setState({ isRM: false, isCC: false, isBOP: false, isOverheadPercent: false })
        }
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            remarks: '',
            isShowForm: false,
            IsVendor: false,
            ModelType: [],
            vendorName: [],
            overheadAppli: [],
            remarks: '',
        })
        //this.props.getRawMaterialDetailsAPI('', false, res => { })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        this.clearForm()
    }



    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, ModelType, vendorName, overheadAppli, remarks, ProfitID,
            isRM, isCC, isBOP, isOverheadPercent, isEditFlag, files, receivedFiles } = this.state;
        const { reset } = this.props;

        if (isEditFlag) {

            let requestData = {
                ProfitId: ProfitID,
                VendorName: IsVendor ? vendorName.label : '',
                ProfitApplicabilityType: overheadAppli.label,
                ModelType: ModelType.label,
                EAttachementEntityName: 0,
                IsVendor: IsVendor,
                ProfitPercentage: values.ProfitPercentage,
                ProfitMachiningCCPercentage: values.ProfitMachiningCCPercentage,
                ProfitBOPPercentage: values.ProfitBOPPercentage,
                ProfitRMPercentage: values.ProfitRMPercentage,
                Remark: remarks,
                VendorId: IsVendor ? vendorName.value : '',
                ProfitApplicabilityId: overheadAppli.value,
                ModelTypeId: ModelType.value,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
            }

            this.props.updateProfit(requestData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.PROFIT_UPDATE_SUCCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
                }
            })

        } else {

            const formData = {
                IsVendor: IsVendor,
                ProfitPercentage: !isOverheadPercent ? values.ProfitPercentage : 0,
                ProfitMachiningCCPercentage: !isCC ? values.ProfitMachiningCCPercentage : 0,
                ProfitBOPPercentage: !isBOP ? values.ProfitBOPPercentage : 0,
                ProfitRMPercentage: !isRM ? values.ProfitRMPercentage : 0,
                Remark: remarks,
                VendorId: IsVendor ? vendorName.value : '',
                ProfitApplicabilityId: overheadAppli.value,
                ModelTypeId: ModelType.value,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                Attachements: [],
            }

            this.props.createProfit(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.PROFIT_ADDED_SUCCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, pristine, submitting, } = this.props;
        const { isRM, isCC, isBOP, isOverheadPercent, files, errors, isEditFlag, costingHead, } = this.state;

        const previewStyle = {
            display: 'inline',
            width: 100,
            height: 100,
        };

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            {this.state.isShowForm &&
                                <div className="col-md-12">
                                    <div className="shadow-lgg login-formg">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-heading">
                                                    <h2>{isEditFlag ? `Update Overhead Details` : `Add Overhead Details`}</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        >
                                            <Row>
                                                {/* <Col md="4" className="switch mb15">
                                                    <label>
                                                        <div className={'left-title'}>Zero Based</div>
                                                        <Switch
                                                            onChange={this.onPressVendor}
                                                            checked={this.state.IsVendor}
                                                            id="normal-switch"
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                        <div className={'right-title'}>Vendor Based</div>
                                                    </label>
                                                </Col> */}
                                                <Col md="12">
                                                    <Label sm={2} className={'pl0 pr0'} check>
                                                        <input
                                                            type="radio"
                                                            name="costingHead"
                                                            checked={costingHead == 'zero' ? true : false}
                                                            onClick={() => this.onPressVendor(false, 'zero')}
                                                        />{' '}
                                                        Zero Based
                                                    </Label>
                                                    <Label sm={2} className={'pl0 pr0'} check>
                                                        <input
                                                            type="radio"
                                                            name="costingHead"
                                                            checked={costingHead == 'vendor' ? true : false}
                                                            onClick={() => this.onPressVendor(true, 'vendor')}
                                                        />{' '}
                                                        Vendor Based
                                                    </Label>
                                                    <Label sm={2} className={'pl0 pr0'} check>
                                                        <input
                                                            type="radio"
                                                            name="costingHead"
                                                            checked={costingHead == 'client' ? true : false}
                                                            onClick={() => this.onPressVendor(true, 'client')}
                                                        />{' '}
                                                        Client Based
                                                    </Label>
                                                </Col>
                                            </Row>
                                            <Row>
                                                {this.state.IsVendor && costingHead == 'vendor' &&
                                                    <Col md="3">
                                                        <Field
                                                            name="vendorName"
                                                            type="text"
                                                            label={'Vendor Name'}
                                                            component={searchableSelect}
                                                            placeholder={'---Select---'}
                                                            options={this.renderListing('VendorNameList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleVendorName}
                                                            valueDescription={this.state.vendorName}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>}
                                                {this.state.IsVendor && costingHead == 'client' &&
                                                    <Col md="3">
                                                        <Field
                                                            name="clientName"
                                                            type="text"
                                                            label={'Client Name'}
                                                            component={searchableSelect}
                                                            placeholder={'---Select---'}
                                                            options={this.renderListing('ClientList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.client == null || this.state.client.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleClient}
                                                            valueDescription={this.state.client}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>}
                                                <Col md="3">
                                                    <Field
                                                        name="ModelType"
                                                        type="text"
                                                        label="Model Type"
                                                        component={searchableSelect}
                                                        placeholder={'---Select---'}
                                                        options={this.renderListing('ModelType')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.ModelType == null || this.state.ModelType.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleModelTypeChange}
                                                        valueDescription={this.state.ModelType}
                                                    //disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        name="ProfitApplicabilityId"
                                                        type="text"
                                                        label="Profit Applicability"
                                                        component={searchableSelect}
                                                        placeholder={'---Select---'}
                                                        options={this.renderListing('ProfitApplicability')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.overheadAppli == null || this.state.overheadAppli.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleOverheadChange}
                                                        valueDescription={this.state.overheadAppli}
                                                    //disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Profit (%)`}
                                                        name={"ProfitPercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        //onChange={this.handleCalculation}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                        disabled={isOverheadPercent ? true : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Profit RM (%)`}
                                                        name={"ProfitRMPercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        //onChange={this.handleCalculation}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                        disabled={isRM ? true : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Profit CC (Machining) (%)`}
                                                        name={"ProfitMachiningCCPercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        //onChange={this.handleCalculation}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                        disabled={isCC ? true : false}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        label={`Profit BOP (%)`}
                                                        name={"ProfitBOPPercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        //onChange={this.handleCalculation}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                        disabled={isBOP ? true : false}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="12">
                                                    <div className="left-border">
                                                        {'Remarks & Attachment'}
                                                    </div>
                                                </Col>
                                                <Col md="6">
                                                    <Field
                                                        label={'Remarks'}
                                                        name={`Remark`}
                                                        placeholder="Type here..."
                                                        value={this.state.remarks}
                                                        className=""
                                                        customClassName=" textAreaWithBorder"
                                                        onChange={this.handleMessageChange}
                                                        validate={[required, maxLength100]}
                                                        required={true}
                                                        component={renderTextAreaField}
                                                        maxLength="5000"
                                                    />
                                                </Col>
                                                <Col md="6">

                                                </Col>
                                            </Row>

                                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                                <div className="col-sm-12 text-center">
                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <ProfitListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm} />
                </div>

            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, material, overheadProfit, client, } = state;

    const { modelTypes, costingHead, } = comman;
    const { overheadProfitData, } = overheadProfit;
    const { clientSelectList } = client;
    const { vendorListByVendorType } = material;

    let initialValues = {};
    if (overheadProfitData && overheadProfitData != undefined) {
        initialValues = {
            OverheadPercentage: overheadProfitData.OverheadPercentage,
            OverheadRMPercentage: overheadProfitData.OverheadRMPercentage,
            OverheadMachiningCCPercentage: overheadProfitData.OverheadMachiningCCPercentage,
            OverheadBOPPercentage: overheadProfitData.OverheadBOPPercentage,
            Remark: overheadProfitData.Remark,
        }
    }

    return {
        modelTypes, costingHead, vendorListByVendorType, overheadProfitData, clientSelectList,
        initialValues,
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchModelTypeAPI,
    fetchCostingHeadsAPI,
    getVendorListByVendorType,
    getClientSelectList,
    createProfit,
    updateProfit,
    getProfitData,
})(reduxForm({
    form: 'AddProfit',
    enableReinitialize: true,
})(AddProfit));
