import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { searchableSelect, validateForm } from '../../layout/FormInputs';
import Drawer from '@material-ui/core/Drawer';
import { required } from '../../../helper';
import { getRawMaterialNameChild, getMaterialTypeDataAPI, createAssociation, getRMGradeSelectListByRawMaterial, getMaterialTypeSelectList, getUnassociatedRawMaterail, clearGradeSelectList } from '../actions/Material';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { debounce } from 'lodash';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';

class Association extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RawMaterial: [],
            RMGrade: [],
            material: [],
            setDisable: false,
            showPopup: false,
            isDropDownChanged: false,
        }

    }

    UNSAFE_componentWillMount() {
        this.props.getRawMaterialNameChild(() => { })
        this.props.getMaterialTypeSelectList(() => { })
        this.props.getUnassociatedRawMaterail(() => { })
    }

    componentDidMount() {
        this.props.clearGradeSelectList([])
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

            this.setState({ RawMaterial: newValue, RMGrade: [], isDropDownChanged: true }, () => {
                const { RawMaterial } = this.state;

                this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, false, res => { });
            });
        } else {
            this.setState({ RawMaterial: [], RMGrade: [], });
            this.props.getRMGradeSelectListByRawMaterial(0, false, res => { });
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
            this.setState({ material: newValue, isDropDownChanged: true })
        } else {
            this.setState({ material: [] })
        }
    }

    /**
 * @method onSubmit
 * @description Used to Submit the form
 */
    onSubmit = debounce((values) => {
        const { RawMaterial, material, RMGrade, } = this.state;
        this.setState({ setDisable: true })
        let formData = {
            RawMaterialId: RawMaterial.value,
            GradeId: RMGrade.value,
            MaterialId: material.value,
        }

        this.props.createAssociation(formData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.ASSOCIATED_ADDED_SUCCESS);
                this.toggleDrawer('')
            }
        });

    }, 500)
    toggleDrawer = (event, data) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };
    cancel = () => {
        if (this.state.isDropDownChanged) {
            this.setState({ showPopup: true })
        } else {
            this.props.closeDrawer('')
        }
    }
    onPopupConfirm = () => {
        this.props.closeDrawer('')
        this.setState({ showPopup: false })
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    render() {
        const { handleSubmit, t } = this.props;
        const { setDisable } = this.state

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
                                                <TourWrapper
                                                    buttonSpecificProp={{ id: "Add_Association_Form" }}
                                                    stepsSpecificProp={{
                                                        steps: Steps(t).ADD_RM_ASSOCIATION,
                                                    }}
                                                />
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
                                                        label="Grade"
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

                                                <Button
                                                    id="rmAssociation_cancel"
                                                    className="mr-2 mt-0"
                                                    variant={"cancel-btn"}
                                                    onClick={this.cancel}
                                                    icon={"cancel-icon"}
                                                    buttonName={"Cancel"}
                                                />

                                                <Button
                                                    id="rmAssociation_Save"
                                                    type="submit"
                                                    className="mr5"
                                                    disabled={setDisable}
                                                    icon={"save-icon"}
                                                    buttonName={"Save"}
                                                />

                                            </div>
                                        </div>
                                    </Row>
                                </div>
                            </form>
                        </div>
                    </Container>
                </Drawer>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }
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
    getRawMaterialNameChild,
    getMaterialTypeDataAPI,
    getRMGradeSelectListByRawMaterial,
    getUnassociatedRawMaterail,
    createAssociation,
    clearGradeSelectList
})(reduxForm({
    form: 'Association',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true

})(withTranslation(['RawMaterialMaster'])(Association)))

