import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, } from "../../../helper/validation";
import { renderText, renderMultiSelectField, } from "../../layout/FormInputs";
import { getMachineSelectList, } from '../actions/MachineMaster';
import { getProcessCode, createProcess, updateProcess, getProcessData, } from '../actions/Process';
import { getPlantSelectList, } from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddProcessDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPlants: [],
            selectedMachine: [],
            ProcessId: '',
        }
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getPlantSelectList(() => { })
        this.props.getMachineSelectList(() => { })
        this.getData()
    }

    /**
    * @method getData
    * @description Used to get process data
    */
    getData = () => {
        const { isEditFlag, ID } = this.props;
        if (isEditFlag) {
            this.props.getProcessData(ID, res => {
                let Data = res.data.Data;

                let PlantArray = Data && Data.Plants.map(el => ({ Text: el.PlantName, Value: el.PlantId }))
                let MachineArray = Data && Data.Machines.map(el => ({ Text: el.Machine, Value: el.MachineId }))

                this.setState({
                    ProcessId: Data.ProcessId,
                    selectedPlants: PlantArray,
                    selectedMachine: MachineArray,
                })
            })
        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    checkProcessCode = (e) => {
        const value = e.target.value;
        this.props.getProcessCode(value, res => {
            if (res && res.data && res.data.Result) {
                let Data = res.data.DynamicData;
                this.props.change('ProcessCode', Data.ProcessCode)
            }
        })
    }

    /**
     * @method handlePlants
     * @description Used handle Plants
     */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
     * @method handleMachine
     * @description Used handle Machine
     */
    handleMachine = (e) => {
        this.setState({ selectedMachine: e })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList, machineSelectList } = this.props;
        const temp = [];
        if (label === 'machine') {
            machineSelectList && machineSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
                return null;
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
        this.toggleDrawer('')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedPlants, selectedMachine } = this.state;
        const { isEditFlag, isMachineShow, ID } = this.props;

        let plantArray = selectedPlants && selectedPlants.map(item => ({ PlantName: item.Text, PlantId: item.Value, }))

        let machineArray = selectedMachine && selectedMachine.map(item => ({ Machine: item.Text, MachineId: item.Value, }))

        /** Update existing detail of supplier master **/
        if (isEditFlag) {

            let formData = {
                ProcessId: ID,
                ProcessName: values.ProcessName,
                ProcessCode: values.ProcessCode,
                Plants: plantArray,
                Machines: isMachineShow ? machineArray : [],
                LoggedInUserId: loggedInUserId(),
            }

            this.props.updateProcess(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PROCESS_SUCCESS);
                    this.toggleDrawer('')
                }
            });

        } else {/** Add new detail for creating supplier master **/

            let formData = {
                ProcessName: values.ProcessName,
                ProcessCode: values.ProcessCode,
                Plants: plantArray,
                Machines: isMachineShow ? machineArray : [],
                LoggedInUserId: loggedInUserId(),
            }

            this.props.createProcess(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.PROCESS_ADD_SUCCESS);
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
        const { handleSubmit, isEditFlag, isMachineShow, } = this.props;
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
                                            <h3>{isEditFlag ? 'Update Process' : 'Add Process'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">

                                    <Col md="12">
                                        <Field
                                            label={`Process Name`}
                                            name={"ProcessName"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            onBlur={this.checkProcessCode}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label={`Process Code`}
                                            name={"ProcessCode"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    <Col md="12">
                                        <Field
                                            label="Plant"
                                            name="Plant"
                                            placeholder="--Select--"
                                            selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
                                            options={this.renderListing('plant')}
                                            selectionChanged={this.handlePlants}
                                            optionValue={option => option.Value}
                                            optionLabel={option => option.Text}
                                            component={renderMultiSelectField}
                                            mendatory={true}
                                            className="multiselect-with-border"
                                            disabled={false}
                                        />
                                    </Col>
                                    {isMachineShow && <Col md="12">
                                        <Field
                                            label="Machine"
                                            name="Machine"
                                            placeholder="--Select--"
                                            selection={(this.state.selectedMachine == null || this.state.selectedMachine.length === 0) ? [] : this.state.selectedMachine}
                                            options={this.renderListing('machine')}
                                            selectionChanged={this.handleMachine}
                                            optionValue={option => option.Value}
                                            optionLabel={option => option.Text}
                                            component={renderMultiSelectField}
                                            mendatory={true}
                                            className="multiselect-with-border"
                                            disabled={false}
                                        />
                                    </Col>}

                                </Row>
                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={this.cancel} >
                                        <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-button mr5 save-btn" >
                                        <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                        {isEditFlag ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </Row>
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
function mapStateToProps({ comman, machine, process }) {
    const { plantSelectList } = comman;
    const { machineSelectList } = machine;
    const { processUnitData } = process;

    let initialValues = {};
    if (processUnitData && processUnitData !== undefined) {
        initialValues = {
            ProcessName: processUnitData.ProcessName,
            ProcessCode: processUnitData.ProcessCode,
        }
    }
    return { plantSelectList, machineSelectList, processUnitData, initialValues }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getProcessCode,
    createProcess,
    updateProcess,
    getProcessData,
    getPlantSelectList,
    getMachineSelectList,
})(reduxForm({
    form: 'AddProcessDrawer',
    enableReinitialize: true,
})(AddProcessDrawer));
