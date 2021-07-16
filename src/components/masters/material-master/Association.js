import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { searchableSelect } from '../../layout/FormInputs';
import Drawer from '@material-ui/core/Drawer';
import { required } from '../../../helper';
import { getRowMaterialDataAPI, getRawMaterialNameChild, getMaterialTypeDataAPI, createAssociation, getRMGradeSelectListByRawMaterial, getMaterialTypeSelectList, getUnassociatedRawMaterail } from '../actions/Material';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'

class Association extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RawMaterial: [],
            RMGrade: [],
            material: []
        }

    }

    UNSAFE_componentWillMount() {
        this.props.getRawMaterialNameChild(() => { })
        this.props.getMaterialTypeSelectList(() => { })
        this.props.getUnassociatedRawMaterail(() => { })
    }

    componentDidMount() {
        // this.props.getRawMaterialNameChild(() => { })
        // this.props.getMaterialTypeSelectList(() => { })
    }


    renderListing(label) {
        const { MaterialSelectList, gradeSelectList, unassociatedMaterialList } = this.props;


        const temp = [];
        if (label === 'RawMaterialName') {
            unassociatedMaterialList && unassociatedMaterialList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'RMGrade') {
            gradeSelectList && gradeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'material') {
            MaterialSelectList && MaterialSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
 * @method handleRawMaterial
 * @description  used to raw material change
 */
    handleRawMaterial = (newValue, actionMeta) => {

        if (newValue && newValue !== '') {

            this.setState({ RawMaterial: newValue, RMGrade: [], }, () => {
                const { RawMaterial } = this.state;

                this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, res => { });
            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [], });
            this.props.getRMGradeSelectListByRawMaterial(0, res => { });
        }
    }

    handleGrade = (newValue) => {
        if (newValue && newValue !== '') {
            this.setState({ RMGrade: newValue })
        } else {
            this.setState({ RMGrade: [] })
        }
    }

    handleMaterialChange = (newValue) => {
        if (newValue && newValue !== '') {
            this.setState({ material: newValue })
        } else {
            this.setState({ material: [] })
        }
    }

    /**
 * @method onSubmit
 * @description Used to Submit the form
 */
    onSubmit = (values) => {
        const { RawMaterial, material, RMGrade, } = this.state;
        let formData = {
            RawMaterialId: RawMaterial.value,
            GradeId: RMGrade.value,
            MaterialId: material.value,
        }
        this.props.reset()
        this.props.createAssociation(formData, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.ASSOCIATED_ADDED_SUCCESS);
                this.toggleDrawer('')
            }
        });

    }
    toggleDrawer = (event, data) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    render() {
        const { handleSubmit } = this.props;

        return (
            <div>
                <Drawer
                    anchor={this.props.anchor}
                    open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper spec-drawer"}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {"Add Association"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <div className="ml-3">
                                    <Row>
                                        <Col md="12">
                                            <div className="d-flex">
                                                <Field
                                                    name="RawMaterialName"
                                                    type="text"
                                                    label="Raw Material"
                                                    component={searchableSelect}
                                                    placeholder={"Select"}
                                                    options={this.renderListing("RawMaterialName")}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleRawMaterial}
                                                    valueDescription={this.state.RawMaterial}
                                                    disabled={false}
                                                    className="w-100"
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="12">
                                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                <div className="fullinput-icon">
                                                    <Field
                                                        name="GradeId"
                                                        type="text"
                                                        label="RM Grade"
                                                        component={searchableSelect}
                                                        placeholder={"Select"}
                                                        options={this.renderListing("RMGrade")}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={
                                                            this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleGrade}
                                                        valueDescription={this.state.RMGrade}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="12">
                                            <div className="d-flex">
                                                <Field
                                                    name="MaterialTypeId"
                                                    type="text"
                                                    label="Material"
                                                    component={searchableSelect}
                                                    placeholder={"Select"}
                                                    options={this.renderListing("material")}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={this.state.material == null || this.state.material.length === 0 ? [required] : []} required={true}
                                                    handleChangeDescription={this.handleMaterialChange}
                                                    valueDescription={this.state.material}
                                                />

                                            </div>
                                        </Col>

                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-md-12 pr-3">
                                            <div className="text-right ">
                                                <button
                                                    type={"button"}
                                                    className=" mr15 cancel-btn"
                                                    onClick={this.toggleDrawer}
                                                >
                                                    <div className={"cross-icon"}>
                                                        {" "}
                                                        <img
                                                            alt={""}
                                                            src={cancelImg}
                                                        ></img>
                                                    </div>{" "}
                                                    {"Cancel"}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="user-btn save-btn"
                                                >
                                                    <div className={"check-icon"}>
                                                        <img
                                                            alt={""}
                                                            src={saveImg}
                                                        ></img>
                                                    </div>{" "}
                                                    {"Save"}
                                                </button>
                                            </div>
                                        </div>
                                    </Row>
                                </div>
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
    const { rawMaterialNameSelectList, gradeSelectList, MaterialSelectList, unassociatedMaterialList } = material;

    return { gradeSelectList, MaterialSelectList, rawMaterialNameSelectList, unassociatedMaterialList }

}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
    getMaterialTypeSelectList,
    getRowMaterialDataAPI,
    getRawMaterialNameChild,
    getMaterialTypeDataAPI,
    getRMGradeSelectListByRawMaterial,
    getUnassociatedRawMaterail,
    createAssociation
})(reduxForm({
    form: 'Association',
    enableReinitialize: true,
})(Association));