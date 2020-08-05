import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../../layout/FormInputs";
import {
    createRMSpecificationAPI, updateRMSpecificationAPI, getRMSpecificationDataAPI,
    getRowMaterialDataAPI, getRawMaterialNameChild, getMaterialTypeDataAPI,
} from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { fetchRowMaterialAPI, fetchRMGradeAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import AddGrade from './AddGrade';
import AddMaterialType from './AddMaterialType';
import AddRawMaterial from './AddRawMaterial';

class AddSpecification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            RawMaterial: [],
            material: [],
            RMGrade: [],
            isOpenRMDrawer: false,
            isOpenGrade: false,
            isOpenMaterialDrawer: false,
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {
        this.props.fetchRowMaterialAPI(res => { });
        this.props.getMaterialTypeSelectList(() => { })
        this.props.getRawMaterialNameChild(() => { })
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { ID, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRMSpecificationDataAPI(ID, res => {
                if (res && res.data && res.data.Data) {
                    const { rawMaterialNameSelectList, MaterialSelectList, } = this.props;
                    let Data = res.data.Data;
                    this.props.fetchRMGradeAPI(Data.MaterialTypeId, res => { })



                    setTimeout(() => {
                        const { rmGradeList } = this.props;
                        let tempObj1 = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value == Data.RawMaterialId)
                        let tempObj2 = MaterialSelectList && MaterialSelectList.find(item => item.Value == Data.MaterialTypeId)
                        let tempObj3 = rmGradeList && rmGradeList.find(item => item.Value == Data.GradeId)

                        console.log('tempObj1', tempObj1)
                        console.log('tempObj2', tempObj2)
                        console.log('tempObj3', tempObj3)
                        this.setDensity(Data.MaterialTypeId);
                        this.setState({
                            RawMaterial: { label: tempObj1.Text, value: tempObj1.Value },
                            material: { label: tempObj2.Text, value: tempObj2.Value },
                            RMGrade: { label: tempObj3.Text, value: tempObj3.Value },
                        })
                    }, 500)

                }
            });
        } else {
            this.props.getRMSpecificationDataAPI('', res => { });
        }
    }

    /**
    * @method handleRawMaterial
    * @description  used to raw material change
    */
    handleRawMaterial = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue });
        } else {
            this.setState({ RawMaterial: [] });
        }
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ material: newValue }, () => {
                const { material } = this.state;
                this.props.fetchRMGradeAPI(material.value, res => { });
                this.setDensity(material.value);
            });
        } else {
            this.setState({ material: [], RMGrade: [] });
            this.props.fetchRMGradeAPI(0, res => { });
            this.props.change('Density', '')
        }
    }

    setDensity = (ID) => {
        this.props.getMaterialTypeDataAPI(ID, res => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                this.props.change('Density', Data.Density)
            }
        });
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
        const { rawMaterialNameSelectList, MaterialSelectList, rmGradeList, } = this.props;
        const temp = [];

        if (label === 'RawMaterialName') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map(item =>
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

        if (label === 'RMGrade') {
            rmGradeList && rmGradeList.map(item =>
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
        this.setState({
            material: [],
            RMGrade: [],
        })
        this.toggleDrawer('')
        this.props.getRMSpecificationDataAPI('', res => { });
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    rawMaterialToggler = () => {
        this.setState({ isOpenRMDrawer: true })
    }

    /**
    * @method closeGradeDrawer
    * @description  used to toggle RM Drawer Popup/Drawer
    */
    closeRMDrawer = (e = '') => {
        this.setState({ isOpenRMDrawer: false }, () => {
            this.props.getRawMaterialNameChild(() => { })
        })
    }

    gradeToggler = () => {
        this.setState({ isOpenGrade: true })
    }

    /**
    * @method closeGradeDrawer
    * @description  used to toggle grade Popup/Drawer
    */
    closeGradeDrawer = (e = '') => {
        this.setState({ isOpenGrade: false }, () => {
            const { material } = this.state;
            this.handleMaterialChange(material, '');
        })
    }

    materialToggler = () => {
        this.setState({ isOpenMaterialDrawer: true })
    }

    /**
    * @method closeMaterialDrawer
    * @description  used to toggle Material Popup/Drawer
    */
    closeMaterialDrawer = (e = '') => {
        this.setState({ isOpenMaterialDrawer: false }, () => {
            this.props.getMaterialTypeSelectList(() => { })
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { RawMaterial, material, RMGrade, } = this.state;
        const { ID, isEditFlag } = this.props;

        if (isEditFlag) {
            let formData = {
                RawMaterialId: RawMaterial.value,
                SpecificationId: ID,
                Specification: values.Specification,
                GradeId: RMGrade.value,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                GradeName: RMGrade.label,
                MaterialTypeId: material.value,
                MaterialTypeName: material.label,
            }
            this.props.updateRMSpecificationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_UPDATE_SUCCESS);
                    this.toggleDrawer('')
                }
            })
        } else {

            let formData = {
                RawMaterialId: RawMaterial.value,
                Specification: values.Specification,
                GradeId: RMGrade.value,
                MaterialId: material.value,
            }
            this.props.createRMSpecificationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_ADD_SUCCESS);
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
        const { isOpenRMDrawer, isOpenGrade, isOpenMaterialDrawer } = this.state;
        const { handleSubmit, isEditFlag } = this.props;
        return (
            <div>
                <Drawer  anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper spec-drawer'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h1>{isEditFlag ? 'Update Raw Material Specification' : 'Add Raw Material Specification'}</h1>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="mr15">
                                <Row>
                                    <Col md="11">
                                        <Field
                                            name="RawMaterialName"
                                            type="text"
                                            label="Raw Material"
                                            component={searchableSelect}
                                            placeholder={'Select Raw Material'}
                                            options={this.renderListing('RawMaterialName')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleRawMaterial}
                                            valueDescription={this.state.RawMaterial}
                                        />
                                    </Col>
                                    <Col md="1">
                                        <div
                                            onClick={this.rawMaterialToggler}
                                            className={'plus-icon mt30 mr15 right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="11">
                                        <Field
                                            name="MaterialTypeId"
                                            type="text"
                                            label="Material"
                                            component={searchableSelect}
                                            placeholder={'Select Material'}
                                            options={this.renderListing('material')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.material == null || this.state.material.length == 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleMaterialChange}
                                            valueDescription={this.state.material}
                                        />
                                    </Col>
                                    <Col md="1">
                                        <div
                                            onClick={this.materialToggler}
                                            className={'plus-icon mt30 mr15 right'}>
                                        </div>
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label={`Density`}
                                            name={"Density"}
                                            type="text"
                                            placeholder={'Enter'}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            disabled={true}
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="11">
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
                                    <Col md="1">
                                        <div
                                            onClick={this.gradeToggler}
                                            className={'plus-icon mt30 mr15 right'}>
                                        </div>
                                    </Col>
                                </Row>


                                <Row>
                                    <Col md="12">
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
                                </Row>
                                </div>
                            </form>
                        </div>
                    </Container>
                </Drawer>
                {isOpenRMDrawer && <AddRawMaterial
                    isOpen={isOpenRMDrawer}
                    closeDrawer={this.closeRMDrawer}
                    isEditFlag={false}
                    //ID={ID}
                    anchor={'right'}
                />}
                {isOpenGrade && <AddGrade
                    isOpen={isOpenGrade}
                    closeDrawer={this.closeGradeDrawer}
                    isEditFlag={false}
                    material={this.state.material}
                    //ID={ID}
                    anchor={'right'}
                />}
                {isOpenMaterialDrawer && <AddMaterialType
                    isOpen={isOpenMaterialDrawer}
                    closeDrawer={this.closeMaterialDrawer}
                    isEditFlag={isEditFlag}
                    //ID={ID}
                    anchor={'right'}
                />}
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
    const { specificationData, rawMaterialNameSelectList } = material;
    const { MaterialSelectList } = costWorking;

    let initialValues = {};
    if (specificationData && specificationData != undefined) {
        initialValues = {
            Specification: specificationData.Specification,
        }
    }

    return {
        rowMaterialList, rmGradeList, MaterialSelectList, specificationData,
        rawMaterialNameSelectList, initialValues
    }
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
    getRawMaterialNameChild,
    getMaterialTypeDataAPI,
})(reduxForm({
    form: 'AddSpecification',
    enableReinitialize: true,
})(AddSpecification));
