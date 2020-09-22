import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col } from 'reactstrap';
import { required, number, maxLength6, maxLength10, maxLength100 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, } from "../../../layout/FormInputs";
import { createPart, updatePart, getPartData, fileUploadPart, fileDeletePart, } from '../../../../actions/master/Part';
import { getPlantSelectList, getRawMaterialSelectList, } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../../config/constants';

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

            remarks: '',
            files: [],

        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        this.props.getRawMaterialSelectList(() => { })
        this.props.getPlantSelectList(() => { })
        this.getDetails()
    }

    /**
    * @method getDetails
    * @description 
    */
    getDetails = () => {
        const { data } = this.props;
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                PartId: data.Id,
            })
            this.props.getPartData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    let plantArray = Data && Data.Plants.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

                    setTimeout(() => {
                        const { rowMaterialList } = this.props;

                        const materialNameObj = rowMaterialList && rowMaterialList.find(item => item.Value === Data.RawMaterialId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            RawMaterial: materialNameObj && materialNameObj !== undefined ? { label: materialNameObj.Text, value: materialNameObj.Value } : [],
                            selectedPlants: plantArray,
                            effectiveDate: moment(Data.EffectiveDate)._d,
                            remarks: Data.Remark,
                            files: Data.Attachements,
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
        if (newValue && newValue !== '') {
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
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }

    }


    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post', }

    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { files, } = this.state;

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
            this.setState({ files: tempArr })
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            this.props.fileUploadPart(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    renderImages = () => {
        this.state.files && this.state.files.map(f => {
            const withOutTild = f.FileURL.replace('~', '')
            const fileURL = `${FILE_URL}${withOutTild}`;
            return (
                <div className={'attachment-wrapper images'}>
                    <img src={fileURL} alt={''} />
                    <button
                        type="button"
                        onClick={() => this.deleteFile(f.FileId)}>X</button>
                </div>
            )
        })
    }

    deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            this.props.fileDeletePart(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = this.state.files.filter(item => item.FileId !== FileId)
                this.setState({ files: tempArr })
            })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
            this.setState({ files: tempArr })
        }
    }

    Preview = ({ meta }) => {
        const { name, percent, status } = meta
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            RawMaterial: [],
            selectedPlants: [],
        })
        this.props.getPartData('', res => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { PartId, selectedPlants, RawMaterial, effectiveDate, isEditFlag, remarks, files } = this.state;

        let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

        if (isEditFlag) {
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: PartId }
            })
            let updateData = {
                LoggedInUserId: loggedInUserId(),
                PartId: PartId,
                PartName: values.PartName,
                PartNumber: values.PartNumber,
                Description: values.Description,
                ECONumber: '',
                ECNNumber: values.ECNNumber,
                RevisionNumber: values.RevisionNumber,
                Drawing: {},
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                Remark: remarks,
                EffectiveDate: effectiveDate,
                Plants: plantArray,
                Attachements: updatedFiles
            }

            this.props.updatePart(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    this.cancel()
                }
            });

        } else {

            let formData = {
                LoggedInUserId: loggedInUserId(),
                BOMNumber: values.BOMNumber,
                BOMLevel: 0,
                Remark: remarks,
                PartNumber: values.PartNumber,
                PartName: values.PartName,
                Description: values.Description,
                ECONumber: '',
                ECNNumber: values.ECNNumber,
                EffectiveDate: effectiveDate,
                RevisionNumber: values.RevisionNumber,
                Drawing: {},
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                RawMaterialId: RawMaterial.value,
                Plants: plantArray,
                Attachements: files
            }

            this.props.createPart(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.PART_ADD_SUCCESS);
                    this.cancel()
                }
            });
        }
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { isEditFlag } = this.state;
        return (
            <>
                <div>
                    <div className="login-container signup-form">

                        <Row>
                            <Col md="12">
                                <div className="shadow-lgg login-formg">
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
                                                    disabled={isEditFlag ? true : false}
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
                                                    disabled={isEditFlag ? true : false}
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
                                                    validate={(this.state.RawMaterial == null || this.state.RawMaterial.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleRMChange}
                                                    valueDescription={this.state.RawMaterial}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md='3'>
                                                <Field
                                                    label="Plant"
                                                    name="Plant"
                                                    placeholder="--Select--"
                                                    selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
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
                                                            disabled={false}
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
                                            <Col md="3">
                                                <label>Upload Files (upload up to 3 files)</label>
                                                {this.state.files && this.state.files.length >= 3 ? '' :
                                                    <Dropzone
                                                        getUploadParams={this.getUploadParams}
                                                        onChangeStatus={this.handleChangeStatus}
                                                        PreviewComponent={this.Preview}
                                                        //onSubmit={this.handleSubmit}
                                                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                                                        initialFiles={this.state.initialFiles}
                                                        maxFiles={3}
                                                        maxSizeBytes={2000000}
                                                        inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                                                        styles={{
                                                            dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                                                            inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                                                        }}
                                                        classNames="draper-drop"

                                                    />}
                                            </Col>
                                            <Col md="3">
                                                <div className={'attachment-wrapper'}>
                                                    {
                                                        this.state.files && this.state.files.map(f => {
                                                            const withOutTild = f.FileURL.replace('~', '')
                                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                                            return (
                                                                <div className={'attachment images'}>
                                                                    <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                                                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                                                    <img alt={''} className="float-right" onClick={() => this.deleteFile(f.FileId, f.FileName)} src={require('../../../../assests/images/red-cross.png')}></img>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
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
                                                    type="submit"
                                                    className="submit-button mr5 save-btn" >
                                                    <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                                    {isEditFlag ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </Row>

                                    </form>
                                </div>
                            </Col>
                        </Row>
                    </div>
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
function mapStateToProps({ material, comman, part }) {
    const { plantSelectList, rowMaterialList } = comman;
    const { newPartData } = part;

    let initialValues = {};
    if (newPartData && newPartData !== undefined) {
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
    fileUploadPart,
    fileDeletePart,
})(reduxForm({
    form: 'AddIndivisualPart',
    enableReinitialize: true,
})(AddIndivisualPart));
