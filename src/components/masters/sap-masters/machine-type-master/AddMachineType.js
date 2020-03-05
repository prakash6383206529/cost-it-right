import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderMultiSelectField } from "../../../layout/FormInputs";
import {
    createMachineTypeAPI, getMachineTypeListAPI, getMachineTypeDataAPI,
    updateMachineTypeAPI
} from '../../../../actions/master/MachineMaster';
import { getLabourTypeSelectList } from "../../../../actions/master/Comman";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddMachineType extends Component {
    constructor(props) {
        super(props);
        this.state = {
            IsActive: false,
            selectedLabourIds: [],
        }
    }

    componentWillMount() {
        this.props.getLabourTypeSelectList((res) => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { MachineTypeId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getMachineTypeDataAPI(MachineTypeId, (res) => {
                const { labourTypeSelectList } = this.props;
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let labourIds = Data.LabourTypeIds;
                    let tempArr = [];
                    labourIds && labourIds.map((el) => {
                        const filterData = labourTypeSelectList && labourTypeSelectList.find(item => item.Value == el)
                        tempArr.push({ Text: filterData.Text, Value: filterData.Value })
                    })
                    this.setState({ selectedLabourIds: tempArr, IsActive: Data.IsActive });
                }
            })
        } else {
            this.props.getMachineTypeDataAPI('', () => { })
        }
    }

    /**
    * @method activeHandler
    * @description Used to cancel modal
    */
    activeHandler = () => {
        this.setState({
            IsActive: !this.state.IsActive
        })
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method handleLabourSelection
    * @description Used handle labour select list
    */
    handleLabourSelection = (e) => {
        this.setState({ selectedLabourIds: e })
    }

    /**
    * @method renderListing
    * @description Used show select listings
    */
    renderListing = (label) => {
        const { labourTypeSelectList } = this.props;
        const temp = [];

        if (label == 'labourList') {
            labourTypeSelectList && labourTypeSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedLabourIds, IsActive } = this.state;
        const { MachineTypeId, isEditFlag } = this.props;

        const labourIds = [];
        selectedLabourIds && selectedLabourIds.map((item) => {
            labourIds.push(item.Value);
        })

        values.CreatedBy = loggedInUserId();
        values.LabourTypeIds = labourIds;
        values.IsActive = true;

        /** Update detail of the existing UOM  */
        if (isEditFlag) {

            this.setState({ isSubmitted: true });
            let formData = {
                MachineTypeId: MachineTypeId,
                CreatedByName: loggedInUserId(),
                IsActive: IsActive,
                CreatedDate: '',
                MachineClassName: values.MachineClassName,
                CreatedBy: loggedInUserId(),
                LabourTypeIds: labourIds,
                Capacity: values.Capacity,
            }
            this.props.updateMachineTypeAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_MACHINE_TYPE_SUCESS);
                    this.toggleModel();
                }
            });

        } else {

            /** Add detail for creating new machine type  */
            this.props.createMachineTypeAPI(values, (res) => {
                if (res.data.Result == true) {
                    toastr.success(MESSAGES.MACHINE_TYPE_ADD_SUCCESS);
                    this.toggleModel();
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
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Machine Type' : 'Add Machine Type'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Machine Class Name"
                                                name={"MachineClassName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Labour Types"
                                                name="LabourTypeIds"
                                                placeholder="--Select Labour Type --"
                                                selection={this.state.selectedLabourIds}
                                                options={this.renderListing('labourList')}
                                                selectionChanged={this.handleLabourSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={true}
                                                className="withoutBorder"
                                            />
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Capacity"
                                                name={"Capacity"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    {this.props.isEditFlag && <Row>
                                        <Col md="4">
                                            <label
                                                className="custom-checkbox"
                                                onChange={this.activeHandler}
                                            >
                                                Is Active
                                                <input type="checkbox" checked={this.state.IsActive} />
                                                <span
                                                    className=" before-box"
                                                    checked={this.state.IsActive}
                                                    onChange={this.activeHandler}
                                                />
                                            </label>
                                        </Col>
                                    </Row>}
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
                                                    {'Reset'}
                                                </button>}
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ machine, comman }) {
    const { machineTypeDataList, machineTypeData } = machine;
    const { labourTypeSelectList } = comman;
    let initialValues = {};
    if (machineTypeData && machineTypeData !== undefined) {
        initialValues = {
            MachineClassName: machineTypeData.MachineClassName,
            Capacity: machineTypeData.Capacity,
        }
    }
    return { initialValues, machineTypeDataList, machineTypeData, labourTypeSelectList };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getMachineTypeListAPI,
    createMachineTypeAPI,
    getMachineTypeDataAPI,
    updateMachineTypeAPI,
    getLabourTypeSelectList,
})(reduxForm({
    form: 'AddMachineType',
    enableReinitialize: true,
})(AddMachineType));
