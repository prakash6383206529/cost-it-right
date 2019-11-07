import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { createProcessAPI, getProcessUnitAPI, updateProcessAPI } from '../../../../actions/master/Process';
import { fetchPlantDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';

class AddProcess extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            //isEditFlag:false
            isActiveBox: true
        }
    }

    componentDidMount() {
        const { ProcessId, isEditFlag } = this.props;
        this.props.fetchPlantDataAPI(res => { });
        if (isEditFlag) {
            this.props.getProcessUnitAPI(ProcessId, true, res => { })
        } else {
            this.props.getProcessUnitAPI('', false, res => { })
        }
    }
    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log('values: ', values);
        const { ProcessId, isEditFlag } = this.props;
        if (isEditFlag) {
            values.ProcessId = ProcessId;
            values.IsActive = this.state.isActiveBox;
            console.log("update clicked ")
            this.setState({ isSubmitted: true });
            this.props.updateProcessAPI(ProcessId, values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PROCESS_SUCCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else {
            console.log("add clicked ")
            this.props.createProcessAPI(values, (response) => {
                if (response && response.data) {
                    if (response && response.data && response.data.Result) {
                        toastr.success(MESSAGES.PROCESS_ADD_SUCCESS);
                        { this.toggleModel() }
                    } else {
                        toastr.error(response.data.Message);
                    }
                }
            });
        }
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    selectMaterialType = () => {
        const { categoryList } = this.props;
        const temp = [];
        categoryList && categoryList !== undefined && categoryList.map(item =>
            temp.push({ Text: item.Text, Value: item.Value })
        );
        return temp;
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { plantList } = this.props;
        const temp = [];
        if (label = 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    activeHandler = () => {
        this.setState({
            isActiveBox: !this.state.isActiveBox
        })
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, isEditFlag, processUnitData } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Process' : 'Add Process'}</ModalHeader>
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
                                                label={`${CONSTANT.PROCESS} ${CONSTANT.NAME}`}
                                                name={"ProcessName"}
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
                                                label={`${CONSTANT.PROCESS} ${CONSTANT.CODE}`}
                                                name={"ProcessCode"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Row />
                                        <Row />
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.DESCRIPTION}`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Basic ${CONSTANT.PROCESS} rate`}
                                                name={"BasicProcessRate"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderNumberInputField}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.PLANT}`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>

                                    </Row>
                                    {isEditFlag &&
                                        <Col md="6">
                                            <Label>
                                                <Input
                                                    type="checkbox"
                                                    id="checkbox2"
                                                    defaultChecked={processUnitData && processUnitData.IsActive ? true : false}
                                                    checked={this.state.isActiveBox}
                                                    onChange={this.activeHandler}
                                                    name="IsActive" />{' '}
                                                Is Active
                                            </Label>
                                        </Col>
                                    }
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
function mapStateToProps({ comman, process }) {
    const { plantList } = comman
    const { processUnitData } = process;
    let initialValues = {};
    if (processUnitData && processUnitData !== undefined) {
        initialValues = {
            ProcessName: processUnitData.ProcessName,
            ProcessCode: processUnitData.ProcessCode,
            Description: processUnitData.Description,
            BasicProcessRate: processUnitData.BasicProcessRate,
            PlantId: processUnitData.PlantId,
        }
    }
    return { plantList, initialValues, processUnitData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createProcessAPI,
    fetchPlantDataAPI,
    getProcessUnitAPI,
    updateProcessAPI
})(reduxForm({
    form: 'AddProcess',
    enableReinitialize: true,
})(AddProcess));
