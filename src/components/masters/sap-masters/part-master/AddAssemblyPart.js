import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, number, maxLength100 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderTextAreaField, searchableSelect, renderMultiSelectField } from "../../../layout/FormInputs";
import { getPlantSelectListByType, } from '../../../../actions/master/Comman';
import { createAssemblyPart, updateAssemblyPart, getAssemblyPartDetail, fileUploadPart, fileDeletePart } from '../../../../actions/master/Part';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ASSEMBLY, BOUGHTOUTPART, COMPONENT_PART, FILE_URL, ZBC } from '../../../../config/constants';
import AddChildDrawer from './AddChildDrawer';
import moment from 'moment';
import { reactLocalStorage } from 'reactjs-localstorage';
import BOMViewer from './BOMViewer';
const selector = formValueSelector('AddAssemblyPart')

class AddAssemblyPart extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PartId: '',

            selectedPlants: [],
            effectiveDate: '',
            files: [],

            isOpenChildDrawer: false,
            isOpenBOMViewerDrawer: false,
            BOMViewerData: [],
            childPartArray: [],
            initalConfiguration: reactLocalStorage.getObject('InitialConfiguration'),

        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        const { flowPointsData } = this.props;
        this.props.getPlantSelectListByType(ZBC, () => { })
        this.getDetails()

        if (flowPointsData.length > 0) {
            let flowPointObj = flowPointsData.find(el => el.Level === 'L0');

            if (Object.keys(flowPointObj.oldFormData)) {
                this.props.change('BOMNumber', flowPointObj.oldFormData.BOMNumber)
                this.props.change('AssemblyPartNumber', flowPointObj.oldFormData.AssemblyPartNumber)
                this.props.change('AssemblyPartName', flowPointObj.oldFormData.AssemblyPartName)
                this.props.change('ECNNumber', flowPointObj.oldFormData.ECNNumber)
                this.props.change('RevisionNumber', flowPointObj.oldFormData.RevisionNumber)
                this.props.change('Description', flowPointObj.oldFormData.Description)
                this.props.change('DrawingNumber', flowPointObj.oldFormData.DrawingNumber)
                this.props.change('GroupCode', flowPointObj.oldFormData.GroupCode)
                this.props.change('Remark', flowPointObj.oldFormData.Remark)

                let plantArray = flowPointObj.oldFormData && flowPointObj.oldFormData.Plants.map((item) => ({ Text: item.Text, Value: item.Value }))
                this.setState({
                    selectedPlants: plantArray,
                    effectiveDate: moment(flowPointObj.oldFormData.EffectiveDate)._d,
                    files: flowPointObj.oldFormData.files,
                    BOMViewerData: flowPointsData,
                })
            }

        }
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
            this.props.getAssemblyPartDetail(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;
                    let plantArray = Data && Data.Plants.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))
                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            selectedPlants: plantArray,
                            effectiveDate: moment(Data.EffectiveDate)._d,
                            files: Data.Attachements,
                            ChildParts: Data.ChildParts,
                        })
                    }, 200)
                }
            })
        } else {
            this.props.getAssemblyPartDetail('', res => { })
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

    childDrawerToggle = () => {
        if (this.checkIsFormFilled() === false) {
            toastr.warning('All fields are mandatory.')
            return false;
        }

        this.setState({ isOpenChildDrawer: true })
    }

    closeChildDrawer = (e = '', childData = {}) => {
        this.setState({ isOpenChildDrawer: false }, () => {
            this.setChildPartsData(childData)
        })
    }

    /**
    * @method setChildPartsData
    * @description SET CHILD PARTS DATA IN ASSEMBLY AND BOMViewerData
    */
    setChildPartsData = (childData) => {
        const { BOMViewerData, } = this.state;
        const tempArray = [];

        const posX = BOMViewerData && BOMViewerData.length > 0 ? 450 * (BOMViewerData.length - 1) : 50;

        if (Object.keys(childData).length > 0) {
            tempArray.push(...BOMViewerData, {
                PartType: childData && childData.selectedPartType ? childData.selectedPartType.Text : '',
                PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
                Position: { "x": posX, "y": 250 },
                Outputs: [],
                InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
                PartName: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
                Quantity: childData && childData.Quantity !== undefined ? childData.Quantity : '',
                Level: 'L1',
                selectedPartType: childData.selectedPartType,
                PartId: childData.PartId,
            })
            this.setState({ BOMViewerData: tempArray })
        }
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { plantSelectList } = this.props;
        const temp = [];

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method checkIsFormFilled
    * @description CHECK BOM FORM IS FILLED BEFORE TRIGGER
    */
    checkIsFormFilled = () => {
        const { fieldsObj } = this.props;
        if (fieldsObj.BOMNumber === undefined ||
            fieldsObj.AssemblyPartNumber === undefined ||
            fieldsObj.AssemblyPartName === undefined ||
            fieldsObj.ECNNumber === undefined ||
            fieldsObj.RevisionNumber === undefined ||
            fieldsObj.Description === undefined ||
            fieldsObj.DrawingNumber === undefined ||
            fieldsObj.GroupCode === undefined ||
            fieldsObj.Remark === undefined) {
            return false;
        } else {
            return true;
        }
    }

    /**
    * @method toggleBOMViewer
    * @description DISPLAY BOM VIEWER PAGE
    */
    toggleBOMViewer = () => {
        const { fieldsObj } = this.props;
        const { BOMViewerData, } = this.state;

        if (this.checkIsFormFilled() === false) {
            toastr.warning('All fields are mandatory.')
            return false;
        }

        let tempArray = [];
        let outputArray = [];

        BOMViewerData && BOMViewerData.map((el, i) => {
            if (el.Level === 'L1') {
                outputArray.push(el.PartNumber)
            }
        })

        //CONDITION TO CHECK BOMViewerData STATE HAS FORM DATA
        let isAvailable = BOMViewerData && BOMViewerData.findIndex(el => el.Level === 'L0')
        console.log('isAvailable: ', isAvailable, BOMViewerData);

        if (isAvailable === -1) {
            tempArray.push(...BOMViewerData, {
                PartType: ASSEMBLY,
                PartNumber: fieldsObj && fieldsObj.AssemblyPartNumber !== undefined ? fieldsObj.AssemblyPartNumber : '',
                Position: { "x": 600, "y": 50 },
                Outputs: outputArray,
                InnerContent: fieldsObj && fieldsObj.Description !== undefined ? fieldsObj.Description : '',
                PartName: fieldsObj && fieldsObj.AssemblyPartName !== undefined ? fieldsObj.AssemblyPartName : '',
                Quantity: 1,
                Level: 'L0',
            })

            this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })

        } else {

            tempArray = Object.assign([...BOMViewerData], { [isAvailable]: Object.assign({}, BOMViewerData[isAvailable], { Outputs: outputArray, }) })

            this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })
        }

    }

    closeBOMViewerDrawer = (e = '', drawerData) => {
        this.setState({ isOpenBOMViewerDrawer: false, BOMViewerData: drawerData })
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
            isEditFlag: false,
            selectedPlants: [],
            effectiveDate: '',
            files: [],
            BOMViewerData: [],
        })
        this.props.getAssemblyPartDetail('', res => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { PartId, isEditFlag, selectedPlants, BOMViewerData, files, ChildParts, } = this.state;

        let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))
        let childPartArray = [];

        BOMViewerData && BOMViewerData.map((item) => {
            if (item.Level === 'L0') return false;
            childPartArray.push({
                PartId: item.selectedPartType && (item.selectedPartType.Text === ASSEMBLY || item.selectedPartType.Text === COMPONENT_PART) ? item.PartId : '',
                ParentPartId: isEditFlag ? PartId : '',
                BoughtOutPartId: item.selectedPartType && item.selectedPartType.Text === BOUGHTOUTPART ? item.PartId : '',
                PartTypeId: item.selectedPartType ? item.selectedPartType.Value : '',
                PartType: item.selectedPartType ? item.selectedPartType.Text : '',
                BOMLevel: 1,
                Quantity: item.Quantity,
            })
            return childPartArray;
        })

        if (isEditFlag) {
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: PartId }
            })
            let updateData = {
                LoggedInUserId: loggedInUserId(),
                AssemblyPartId: PartId,
                AssemblyPartName: values.AssemblyPartName,
                AssemblyPartNumber: values.AssemblyPartNumber,
                Description: values.Description,
                ECNNumber: values.ECNNumber,
                RevisionNumber: values.RevisionNumber,
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                EffectiveDate: this.state.effectiveDate,
                Remark: values.Remark,
                Plants: plantArray,
                Attachements: updatedFiles,
                ChildParts: ChildParts,
            }

            this.props.updateAssemblyPart(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_BOM_SUCCESS);
                    this.cancel()
                }
            });

        } else {

            let formData = {
                AssemblyPartId: '',
                AssemblyPartNumber: values.AssemblyPartNumber,
                AssemblyPartName: values.AssemblyPartName,
                ChildParts: childPartArray,
                LoggedInUserId: loggedInUserId(),
                BOMNumber: values.BOMNumber,
                BOMLevel: 0,
                Quantity: 1,
                Remark: values.Remark,
                Description: values.Description,
                ECNNumber: values.ECNNumber,
                EffectiveDate: this.state.effectiveDate,
                RevisionNumber: values.RevisionNumber,
                DrawingNumber: values.DrawingNumber,
                GroupCode: values.GroupCode,
                Plants: plantArray,
                Attachements: files,
            }

            this.props.createAssemblyPart(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.BOM_ADD_SUCCESS);
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
        const { isEditFlag, isOpenChildDrawer, initalConfiguration, isOpenBOMViewerDrawer, } = this.state;
        return (
            <>

                <div className="login-container signup-form">
                    <Row>
                        <Col md="12">
                            <div className="shadow-lgg login-formg">
                                <Row>
                                    <Col md="6">
                                        <div className="form-heading mb-0">
                                            <h2>{isEditFlag ? 'Update Assembly Part' : 'Add  Assembly Part'}</h2>
                                        </div>
                                    </Col>
                                </Row>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="12">
                                            <div className="left-border">
                                                {'Assembly Details:'}
                                            </div>
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
                                                label={`Assembly Part No.`}
                                                name={"AssemblyPartNumber"}
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
                                                label={`Assembly Name`}
                                                name={"AssemblyPartName"}
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
                                                label={`Description`}
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
                                        {initalConfiguration.IsGroupCodeDisplay && <Col md="3">
                                            <Field
                                                label={`Group Code`}
                                                name={"GroupCode"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>}
                                    </Row>

                                    <Row>
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
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                            {/* <span className="asterisk-required">*</span> */}
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
                                        <Col md="3">
                                            {!isEditFlag && <button
                                                type="button"
                                                className={'user-btn pull-left mt30 mr5'}
                                                onClick={this.childDrawerToggle}>
                                                <div className={'plus'}></div>ADD Child</button>}
                                            <button
                                                type="button"
                                                onClick={this.toggleBOMViewer}
                                                className={'user-btn pull-left mt30'}>
                                                <div className={'plus'}></div>BOM VIEWER</button>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="12">
                                            <div className="left-border">
                                                {'Remarks & Attachment:'}
                                            </div>
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={'Remarks'}
                                                name={`Remark`}
                                                placeholder="Type here..."
                                                className=""
                                                customClassName=" textAreaWithBorder"
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

                {isOpenChildDrawer && <AddChildDrawer
                    isOpen={isOpenChildDrawer}
                    closeDrawer={this.closeChildDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    setChildPartsData={this.setChildPartsData}
                />}

                {isOpenBOMViewerDrawer && <BOMViewer
                    isOpen={isOpenBOMViewerDrawer}
                    closeDrawer={this.closeBOMViewerDrawer}
                    isEditFlag={this.state.isEditFlag}
                    PartId={this.state.PartId}
                    anchor={'right'}
                    BOMViewerData={this.state.BOMViewerData}
                />}
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
    const fieldsObj = selector(state, 'BOMNumber', 'AssemblyPartNumber', 'AssemblyPartName', 'ECNNumber', 'RevisionNumber',
        'Description', 'DrawingNumber', 'GroupCode', 'Remark')
    const { comman, part } = state;
    const { plantSelectList } = comman;
    const { partData } = part;

    let initialValues = {};
    if (partData && partData !== undefined) {
        initialValues = {
            BOMNumber: partData.BOMNumber,
            AssemblyPartNumber: partData.AssemblyPartNumber,
            AssemblyPartName: partData.AssemblyPartName,
            Description: partData.Description,
            ECNNumber: partData.ECNNumber,
            RevisionNumber: partData.RevisionNumber,
            DrawingNumber: partData.DrawingNumber,
            GroupCode: partData.GroupCode,
            Remark: partData.Remark,
        }
    }

    return { plantSelectList, partData, fieldsObj, initialValues }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantSelectListByType,
    fileUploadPart,
    fileDeletePart,
    createAssemblyPart,
    updateAssemblyPart,
    getAssemblyPartDetail,
})(reduxForm({
    form: 'AddAssemblyPart',
    enableReinitialize: true,
})(AddAssemblyPart));
