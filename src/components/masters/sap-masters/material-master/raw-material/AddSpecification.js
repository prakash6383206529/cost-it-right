import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../../layout/FormInputs";
import {
    createRMSpecificationAPI, updateRMSpecificationAPI, getRMSpecificationDataAPI,
    getRowMaterialDataAPI,
} from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { fetchRowMaterialAPI, fetchRMGradeAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";
import RMSpecificationDetail from './RMSpecificationDetail';
import $ from 'jquery';

class AddSpecification extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            GradeId: '',
            isEditFlag: false,
            RawMaterial: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {
        this.props.fetchRowMaterialAPI(res => { });
        this.props.getMaterialTypeSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { SpecificationId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRMSpecificationDataAPI(SpecificationId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    this.props.fetchRMGradeAPI(Data.MaterialTypeId, res => { })
                }
            });
        } else {
            this.props.getRMSpecificationDataAPI('', res => { });
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('5');
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue }, () => {
                const { RawMaterial } = this.state;
                this.props.fetchRMGradeAPI(RawMaterial.value, res => { });
            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [] });
        }
    }

    /**
    * @method handleGrade
    * @description  used to handle type of listing change
    */
    handleGrade = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RMGrade: newValue });
        } else {
            this.setState({ RMGrade: [], });
        }
    }

    /**
    * @method renderListing
    * @description Used show listing of row material
    */
    renderListing = (label) => {
        const { rowMaterialList, rmGradeList, MaterialSelectList } = this.props;
        const temp = [];
        if (label === 'rmList') {
            rowMaterialList && rowMaterialList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'RMGrade') {
            rmGradeList && rmGradeList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'material') {
            MaterialSelectList && MaterialSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

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
            // this.props.getMaterialTypeDataAPI(data.ID, (res) => {
            //     if (res && res.data && res.data.Data) {


            //     }
            // })
        }
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
            RawMaterial: [],
            RMGrade: [],
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { SpecificationId, isEditFlag } = this.props;

        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                SpecificationId: SpecificationId,
                Specification: values.Specification,
                Description: values.Description,
                GradeId: values.GradeId,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                GradeName: '',
                MaterialTypeId: values.MaterialTypeId,
                MaterialTypeName: '',
            }
            this.props.updateRMSpecificationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_UPDATE_SUCCESS);
                    this.child.getUpdatedData();
                }
            })
        } else {

            this.props.createRMSpecificationAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_ADD_SUCCESS);
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
                                                    label={`Raw Material Name`}
                                                    name={"RawMaterialName"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    name="MaterialTypeId"
                                                    type="text"
                                                    label="Raw Material"
                                                    component={searchableSelect}
                                                    placeholder={'Select Raw Material'}
                                                    options={this.renderListing('material')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleMaterialChange}
                                                    valueDescription={this.state.RawMaterial}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    name="GradeId"
                                                    type="text"
                                                    label="RM Grade"
                                                    component={searchableSelect}
                                                    placeholder={'Select RM Grade'}
                                                    options={this.renderListing('RMGrade')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.RMGrade == null || this.state.RMGrade.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleGrade}
                                                    valueDescription={this.state.RMGrade}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`${CONSTANT.SPECIFICATION}`}
                                                    name={"Specification"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
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
                <RMSpecificationDetail
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
function mapStateToProps({ comman, costWorking, material }) {
    const { rowMaterialList, rmGradeList } = comman;
    const { specificationData } = material;
    const { MaterialSelectList } = costWorking;
    let initialValues = {};
    if (specificationData && specificationData != undefined) {
        initialValues = {
            MaterialTypeId: specificationData.MaterialTypeId,
            GradeId: specificationData.GradeId,
            Specification: specificationData.Specification,
            Description: specificationData.Description,
        }
    }

    return { rowMaterialList, rmGradeList, MaterialSelectList, specificationData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
    createRMSpecificationAPI,
    fetchRowMaterialAPI,
    fetchRMGradeAPI,
    getMaterialTypeSelectList,
    updateRMSpecificationAPI,
    getRMSpecificationDataAPI,
    updateRMSpecificationAPI,
    getRowMaterialDataAPI,
})(reduxForm({
    form: 'AddSpecification',
    enableReinitialize: true,
})(AddSpecification));
