import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col } from 'reactstrap';
import { required, number, maxLength6, maxLength10, maxLength100 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, } from "../../../layout/FormInputs";
import { createPart, updatePart, getPartData, } from '../../../../actions/master/Part';
import { getPlantSelectList, getRawMaterialSelectList, } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import IndivisualPartListing from "./IndivisualPartListing";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class AddIndivisualPart extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PartId: '',

            RawMaterial: [],
            selectedPlants: [],
            effectiveDate: '',

            isShowForm: false,
        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        this.props.getRawMaterialSelectList(() => { })
        this.props.getPlantSelectList(() => { })
    }

    /**
    * @method getDetails
    * @description 
    */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                isShowForm: true,
                PartId: data.Id,
            })
            if (data.passwordFlag == false) {
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            }
            this.props.getPartData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    let plantArray = [];
                    Data && Data.SelectedPlants.map((item) => {
                        plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                        return plantArray;
                    })

                    setTimeout(() => {
                        const { rowMaterialList } = this.props;

                        const materialNameObj = rowMaterialList && rowMaterialList.find(item => item.Value == Data.RawMaterialId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value },
                            selectedPlants: plantArray,
                            effectiveDate: new Date(Data.EffectiveDate),
                        })
                    }, 500)
                }
            })
        } else {
            this.props.getPartData('', res => { })
        }
    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue });
        } else {
            this.setState({ RawMaterial: [], });
        }
    }

    /**
    * @method handlePlant
    * @description Used handle plants
    */
    handlePlant = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleChange
    * @description Handle Effective Date
    */
    handleEffectiveDateChange = (date) => {
        this.setState({
            effectiveDate: date,
        });
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
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { rowMaterialList, plantSelectList } = this.props;
        const temp = [];
        if (label === 'material') {
            rowMaterialList && rowMaterialList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
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
        this.props.getPartData('', res => { })
        this.setState({
            isEditFlag: false,
            isShowForm: false,

        })
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { PartId, selectedPlants, RawMaterial, effectiveDate, isEditFlag,
            remarks, } = this.state;
        const { reset } = this.props;

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        if (isEditFlag) {

            let updateData = {
                LoggedInUserId: loggedInUserId(),
                PartId: PartId,
                PartName: values.PartName,
                Description: values.Description,
                ECONumber: values.ECONumber,
                RevisionNumber: values.RevisionNumber,
                Drawing: {},
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                Remark: values.Remark,
                SelectedPlants: plantArray,
                files: []
            }

            this.props.updatePart(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    reset();
                    this.cancel()
                    this.child.getUpdatedData();
                }
            });

        } else {

            let formData = {
                LoggedInUserId: loggedInUserId(),
                BOMNumber: values.BOMNumber,
                BOMLevel: 0,
                Remark: values.Remark,
                PartNumber: values.PartNumber,
                PartName: values.PartName,
                Description: values.Description,
                ECONumber: values.ECONumber,
                ECNNumber: values.ECNNumber,
                EffectiveDate: effectiveDate,
                RevisionNumber: values.RevisionNumber,
                Drawing: {},
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                RawMaterialId: RawMaterial.value,
                SelectedPlants: plantArray,
                Attachements: []
            }

            this.props.createPart(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.PART_ADD_SUCCESS);
                    reset();
                    this.cancel()
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
        const { handleSubmit, reset } = this.props;
        const { isEditFlag } = this.state;
        return (
            <>
                <Container>
                    <div className="login-container signup-form">

                        <Row>
                            {this.state.isShowForm &&
                                <Col md="12">
                                    <div className="shadow-lgg login-formg pt-30">
                                        <Row>
                                            <Col md="6">
                                                <div className="form-heading mb-0">
                                                    <h2>{this.state.isEditFlag ? 'Update Indivisual Part' : 'Add  Indivisual Part'}</h2>
                                                </div>
                                            </Col>
                                        </Row>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        >
                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        label={`Part No.`}
                                                        name={"PartNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Part Name`}
                                                        name={"PartName"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`BOM No.`}
                                                        name={"BOMNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Part Description`}
                                                        name={"Description"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>

                                            </Row>

                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        label={`Group Code`}
                                                        name={"GroupCode"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md='3'>
                                                    <Field
                                                        name="RawMaterialId"
                                                        type="text"
                                                        label={'RM Material'}
                                                        component={searchableSelect}
                                                        placeholder={'Raw Material'}
                                                        options={this.renderListing('material')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleRMChange}
                                                        valueDescription={this.state.RawMaterial}
                                                    />
                                                </Col>
                                                <Col md='3'>
                                                    <Field
                                                        label="Plant"
                                                        name="Plant"
                                                        placeholder="--Select--"
                                                        selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                        options={this.renderListing('plant')}
                                                        selectionChanged={this.handlePlant}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                    //disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`ECN No.`}
                                                        name={"ECNNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="3">
                                                    <Field
                                                        label={`Drawing No.`}
                                                        name={"DrawingNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Revision No.`}
                                                        name={"RevisionNumber"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <div className="form-group">
                                                        <label>
                                                            Effective Date
                                                    <span className="asterisk-required">*</span>
                                                        </label>
                                                        <div className="inputbox date-section">
                                                            <DatePicker
                                                                name="EffectiveDate"
                                                                selected={this.state.effectiveDate}
                                                                onChange={this.handleEffectiveDateChange}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dateFormat="dd/MM/yyyy"
                                                                //maxDate={new Date()}
                                                                dropdownMode="select"
                                                                placeholderText="Select date"
                                                                className="withBorder"
                                                                autoComplete={'off'}
                                                                disabledKeyboardNavigation
                                                                onChangeRaw={(e) => e.preventDefault()}
                                                                disabled={isEditFlag ? true : false}
                                                            />
                                                        </div>
                                                    </div>
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
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>

                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                </div>
                                            </Row>

                                        </form>
                                    </div>
                                </Col>
                            }
                        </Row>
                    </div>
                    <IndivisualPartListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm}
                    />
                </Container>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material, comman, part }) {
    const { plantSelectList, rowMaterialList } = comman;
    const { newPartData } = part;

    let initialValues = {};
    if (newPartData && newPartData != undefined) {
        initialValues = {
            PartNumber: newPartData.PartNumber,
            PartName: newPartData.PartName,
            BOMNumber: newPartData.BOMNumber,
            Description: newPartData.Description,
            GroupCode: newPartData.GroupCode,
            ECNNumber: newPartData.ECNNumber,
            DrawingNumber: newPartData.DrawingNumber,
            RevisionNumber: newPartData.RevisionNumber,
            Remark: newPartData.Remark,
        }
    }

    return { rowMaterialList, plantSelectList, newPartData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getRawMaterialSelectList,
    getPlantSelectList,
    createPart,
    updatePart,
    getPartData,
})(reduxForm({
    form: 'AddIndivisualPart',
    enableReinitialize: true,
})(AddIndivisualPart));
