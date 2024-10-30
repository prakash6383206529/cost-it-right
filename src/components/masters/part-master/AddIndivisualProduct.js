import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength512, checkSpacesInString, hashValidation } from "../../../helper/validation";
import { loggedInUserId } from "../../../helper/auth";
import { renderDatePicker, renderText, renderTextAreaField, } from "../../layout/FormInputs";
import { createProduct, updateProduct, getProductData, fileUploadProduct, getPreFilledProductLevelValues, storeHierarchyData, getAllProductLevels, } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from "../../../assests/images/red-cross.png";
import { debounce } from 'lodash';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import AssociateHierarchy from './AssociateHierarchy';
import { subDays } from 'date-fns';
import { getEffectiveDateMinDate } from '../../common/CommonFunctions';

class AddIndivisualProduct extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        // ********* INITIALIZE REF FOR DROPZONE ********
        this.dropzone = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PartId: '',
            isViewMode: this.props?.data?.isViewMode ? true : false,

            selectedPlants: [],
            effectiveDate: '',

            files: [],
            DataToCheck: [],
            DropdownChanged: true,
            uploadAttachements: true,
            isImpactCalculation: false,
            setDisable: false,
            attachmentLoader: false,
            showPopup: false,
            showHierarchy: false,
            ProductHierarachyValueId: null,
            ProductHierarachyLabel: ''
        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        this.getDetails()
    }


    ProductGroupCodeUpdate = (e) => {
        this.setState({ DropdownChanged: false })

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
                ProductId: data.Id,
            })
            this.props.getProductData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;
                    this.setState({ DataToCheck: Data })

                    this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
                    this.props.change("ProductGroupCode", Data.ProductGroupCode ?? '')
                    Data?.ProductHierarchyValueDetailsIdRef ? this.props.getPreFilledProductLevelValues(Data?.ProductHierarchyValueDetailsIdRef, res => { }) : this.props.storeHierarchyData([])
                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            // isLoader: false,
                            effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
                            files: Data.Attachements,
                            isImpactCalculation: Data.IsConsideredForMBOM,
                            ProductHierarachyValueId: Data.ProductHierarchyValueDetailsIdRef,
                            ProductHierarachyLabel: Data.ProductGroupCode
                        }, () => this.setState({ isLoader: false }))
                        // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
                        let files = Data.Attachements && Data.Attachements.map((item) => {
                            item.meta = {}
                            item.meta.id = item.FileId
                            item.meta.status = 'done'
                            return item
                        })
                        if (this.dropzone.current !== null) {
                            this.dropzone.current.files = files
                        }
                    }, 500)
                }
            })
        } else {
            this.setState({
                isLoader: false,
            })
            this.props.getProductData('', res => { })
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
        this.setState({ effectiveDate: DayTime(date).isValid() ? DayTime(date) : '', });
        this.setState({ DropdownChanged: false })
    };

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
                return null;
            });
            return temp;
        }

    }

    /**
    * @method setDisableFalseFunction
    * @description setDisableFalseFunction
    */
    setDisableFalseFunction = () => {
        const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
        if (Number(loop) === 1 || Number(this.dropzone.current.files.length) === Number(this.state.files.length)) {
            this.setState({ setDisable: false, attachmentLoader: false })
        }
    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { files, } = this.state;

        this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
            this.setState({ files: tempArr })
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            this.props.fileUploadProduct(data, (res) => {
                this.setDisableFalseFunction()
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status === 'rejected_file_type') {
            this.setDisableFalseFunction()
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
            this.setDisableFalseFunction()
            this.dropzone.current.files.pop()
            Toaster.warning("File size greater than 2 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
            this.setDisableFalseFunction()
            this.dropzone.current.files.pop()
            Toaster.warning("Something went wrong")
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
            let tempArr = this.state.files.filter((item) => item.FileId !== FileId)
            this.setState({ files: tempArr })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(
                (item) => item.FileName !== OriginalFileName,
            )
            this.setState({ files: tempArr })
        }

        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (this.dropzone?.current !== null) {
            this.dropzone.current.files.pop()
        }
    }

    Preview = ({ meta }) => {
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
    cancel = (type) => {
        const { reset } = this.props;
        reset();
        this.setState({
            RawMaterial: [],
            selectedPlants: [],
            isImpactCalculation: false,
        })
        this.props.getProductData('', res => { })
        this.props.hideForm(type)
    }
    cancelHandler = () => {
        if (this.state.isViewMode) {
            this.cancel('cancel')
        } else {
            this.setState({ showPopup: true })
        }
    }
    onPopupConfirm = () => {
        this.cancel('cancel')
        this.setState({ showPopup: false })
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = debounce((values) => {
        const { ProductId, effectiveDate, isEditFlag, files, DropdownChanged, isImpactCalculation, DataToCheck, uploadAttachements, ProductHierarachyValueId } = this.state;

        if (isEditFlag) {
            if (DropdownChanged && ((files ? JSON.stringify(files) : []) === (DataToCheck.Attachements ? JSON.stringify(DataToCheck.Attachements) : [])) && (DataToCheck.Remark) === (values.Remark) && uploadAttachements && DataToCheck.ProductHierarchyValueDetailsIdRef === ProductHierarachyValueId) {
                this.cancel('cancel')
                return false;
            }
            this.setState({ setDisable: true })
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: ProductId }
            })
            let updateData = {
                LoggedInUserId: loggedInUserId(),
                ProductId: ProductId,
                ProductNumber: values.ProductNumber,
                ProductName: values.ProductName,
                Description: values.Description,
                ECNNumber: values.ECNNumber,
                RevisionNumber: values.RevisionNumber,
                DrawingNumber: values.DrawingNumber,
                ProductGroupCode: values.ProductGroupCode,
                Remark: values.Remark,
                ProductHierarchyValueDetailsIdRef: this.state.ProductHierarachyValueId,
                EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
                // Plants: [],
                Attachements: updatedFiles,
                IsForcefulUpdated: true,
                IsConsideredForMBOM: isImpactCalculation,
            }

            if (isEditFlag) {
                this.props.updateProduct(updateData, (res) => {
                    this.setState({ setDisable: false })
                    if (res?.data?.Result) {
                        Toaster.success(MESSAGES.UPDATE_PRODUCT_SUCESS);
                        this.cancel('submit')
                    }
                });
            }

        } else {

            this.setState({ setDisable: true, isLoader: true })
            let formData = {
                LoggedInUserId: loggedInUserId(),
                Remark: values.Remark,
                ProductNumber: values.ProductNumber,
                ProductName: values.ProductName,
                Description: values.Description,
                ECNNumber: values.ECNNumber,
                EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
                RevisionNumber: values.RevisionNumber,
                DrawingNumber: values.DrawingNumber,
                ProductGroupCode: values.ProductGroupCode,
                ProductHierarchyValueDetailsIdRef: this.state.ProductHierarachyValueId,
                // Plants: [],
                Attachements: files,
                IsConsideredForMBOM: isImpactCalculation,
            }

            this.props.createProduct(formData, (res) => {
                this.setState({ setDisable: false, isLoader: false })
                if (res?.data?.Result === true) {
                    Toaster.success(MESSAGES.PRODUCT_ADD_SUCCESS);
                    this.cancel('submit')
                }
            });
        }
    }, 500)

    handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    /**
    * @method onPressImpactCalculation
    * @description Used for Surface Treatment
    */
    onPressImpactCalculation = () => {
        this.setState({ isImpactCalculation: !this.state.isImpactCalculation, DropdownChanged: false });
    }
    formToggle = (data) => {
        this.setState({ showHierarchy: !this.state.showHierarchy, ProductHierarachyValueId: data?.value ?? this.state.ProductHierarachyValueId, ProductHierarachyLabel: data?.label ?? this.state.ProductHierarachyLabel })
        this.props.change('ProductGroupCode', data?.label ?? this.state.ProductHierarachyLabel)
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, initialConfiguration, t, productHierarchyData } = this.props;
        const productLabel = productHierarchyData.length > 0 ? productHierarchyData[productHierarchyData?.length - 1]?.ProductHierarchyName : 'Name'
        const { isEditFlag, isViewMode, setDisable } = this.state;
        return (
            <>
                {this.state.isLoader && <LoaderCustom />}
                <div className="container-fluid">
                    <div>
                        <div className="login-container signup-form">
                            <Row>
                                <Col md="12">
                                    <div className="shadow-lgg login-formg">
                                        <Row>
                                            <Col md="6">
                                                <div className="form-heading mb-0">
                                                    <h1>
                                                        {this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add "} Product
                                                        {!isViewMode && <TourWrapper
                                                            buttonSpecificProp={{ id: "Add_Indivisual_Product_Form" }}
                                                            stepsSpecificProp={{
                                                                steps: Steps(t, { isEditFlag: isEditFlag }).ADD_PRODUCT_PART
                                                            }} />}
                                                    </h1>
                                                </div>
                                            </Col>
                                        </Row>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                            onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                                        >
                                            <div className="add-min-height">
                                                <Row>
                                                    <Col md="3">
                                                        <Field
                                                            label={`${productLabel} Name`}
                                                            name={"ProductName"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, hashValidation]}
                                                            component={renderText}
                                                            required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`${productLabel} Number`}
                                                            name={"ProductNumber"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20, checkSpacesInString, hashValidation]}
                                                            component={renderText}
                                                            required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>

                                                    <Col md="3">
                                                        <Field
                                                            label={`Description`}
                                                            name={"Description"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                                                            component={renderText}
                                                            required={false}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>

                                                    {initialConfiguration &&
                                                        initialConfiguration.IsGroupCodeDisplay && (
                                                            <Col md="3" className="d-flex">
                                                                <Field
                                                                    label={`Group Code`}
                                                                    name={"ProductGroupCode"}
                                                                    type="text"
                                                                    placeholder={isViewMode ? '-' : "Enter"}
                                                                    validate={[]}
                                                                    component={renderText}
                                                                    onChange={
                                                                        this.ProductGroupCodeUpdate
                                                                    }
                                                                    required={false}
                                                                    className=""
                                                                    customClassName={"withBorder w-100"}
                                                                    disabled={initialConfiguration?.IsProductMasterConfigurable}
                                                                />
                                                                {initialConfiguration?.IsProductMasterConfigurable && <Button
                                                                    id="RawMaterialName-add"
                                                                    className="mt40 right"
                                                                    variant={this.state.ProductHierarachyValueId ? 'view-icon-primary' : 'plus-icon-square'}
                                                                    onClick={() => this.formToggle(this.state.ProductHierarachyValueId)}
                                                                />}
                                                            </Col>
                                                        )}

                                                    <Col md="3">
                                                        <Field
                                                            label={`ECN No.`}
                                                            name={"ECNNumber"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, hashValidation]}
                                                            component={renderText}
                                                            //required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Revision No.`}
                                                            name={"RevisionNumber"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, hashValidation]}
                                                            component={renderText}
                                                            //required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Drawing No.`}
                                                            name={"DrawingNumber"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, hashValidation]}
                                                            component={renderText}
                                                            //required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>

                                                    <Col md="3">
                                                        <div className="form-group">
                                                            <div className="inputbox date-section">
                                                                <Field
                                                                    label="Effective Date"
                                                                    name="EffectiveDate"
                                                                    placeholder={isViewMode ? '-' : "Select Date"}
                                                                    selected={this.state.effectiveDate}
                                                                    minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                                                                    onChange={this.handleEffectiveDateChange}
                                                                    type="text"
                                                                    validate={[required]}
                                                                    autoComplete={'off'}
                                                                    required={true}
                                                                    changeHandler={(e) => {
                                                                    }}
                                                                    component={renderDatePicker}
                                                                    className="form-control"
                                                                    disabled={isViewMode}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Col>

                                                </Row>
                                                <Row>
                                                    <Col md="4" className="mb-5 pb-1">
                                                        <label
                                                            id="AddIndivisualProduct_isImpactCalculation"
                                                            className={`custom-checkbox ${isViewMode ? "disabled" : ""
                                                                }`}
                                                            onChange={this.onPressImpactCalculation}
                                                        >
                                                            Preferred for Impact Calculation
                                                            <input
                                                                disabled={isViewMode}
                                                                type="checkbox"
                                                                checked={this.state.isImpactCalculation}

                                                            />
                                                            <span
                                                                className=" before-box"
                                                                checked={this.state.isImpactCalculation}
                                                                onChange={this.onPressImpactCalculation}
                                                            />
                                                        </label>
                                                    </Col>

                                                </Row>
                                                <Row>



                                                </Row>

                                                <Row>
                                                    <Col md="12">
                                                        <div className="left-border">
                                                            {"Remarks & Attachments:"}
                                                        </div>
                                                    </Col>
                                                    <Col md="6">
                                                        <Field
                                                            label={"Remarks"}
                                                            name={`Remark`}
                                                            placeholder={isViewMode ? "-" : "Type here..."}
                                                            className=""
                                                            customClassName=" textAreaWithBorder"
                                                            validate={[maxLength512, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter]}
                                                            //required={true}
                                                            component={renderTextAreaField}
                                                            maxLength="5000"
                                                            disabled={isViewMode ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <label>
                                                            Upload Files (upload up to {initialConfiguration.MaxMasterFilesToUpload} files)
                                                        </label>
                                                        <div className={`alert alert-danger mt-2 ${this.state.files.length === initialConfiguration.MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                                                            Maximum file upload limit reached.
                                                        </div>
                                                        <div id="AddIndivisualPart_UploadFiles" className={`${this.state.files.length >= initialConfiguration.MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                                                            <Dropzone
                                                                ref={this.dropzone}
                                                                onChangeStatus={this.handleChangeStatus}
                                                                PreviewComponent={this.Preview}
                                                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                                                initialFiles={this.state.initialFiles}
                                                                maxFiles={initialConfiguration.MaxMasterFilesToUpload}
                                                                maxSizeBytes={2000000}
                                                                disabled={isViewMode}
                                                                inputContent={(files, extra) =>
                                                                    extra.reject ? (
                                                                        "Image, audio and video files only"
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <i className="text-primary fa fa-cloud-upload"></i>
                                                                            <span className="d-block">
                                                                                Drag and Drop or{" "}
                                                                                <span className="text-primary">
                                                                                    Browse
                                                                                </span>
                                                                                <br />
                                                                                file to upload
                                                                            </span>
                                                                        </div>
                                                                    )
                                                                }
                                                                styles={{
                                                                    dropzoneReject: {
                                                                        borderColor: "red",
                                                                        backgroundColor: "#DAA",
                                                                    },
                                                                    inputLabel: (files, extra) =>
                                                                        extra.reject ? { color: "red" } : {},
                                                                }}
                                                                classNames="draper-drop"

                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col md="3">
                                                        <div className={"attachment-wrapper"}>
                                                            {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                                            {this.state.files &&
                                                                this.state.files.map((f) => {
                                                                    const withOutTild = f.FileURL.replace(
                                                                        "~",
                                                                        ""
                                                                    );
                                                                    const fileURL = `${FILE_URL}${withOutTild}`;
                                                                    return (
                                                                        <div className={"attachment images"}>
                                                                            <a href={fileURL} target="_blank" rel="noreferrer">
                                                                                {f.OriginalFileName}
                                                                            </a>

                                                                            {!isViewMode &&
                                                                                <img
                                                                                    alt={""}
                                                                                    className="float-right"
                                                                                    onClick={() =>
                                                                                        this.deleteFile(
                                                                                            f.FileId,
                                                                                            f.FileName
                                                                                        )
                                                                                    }
                                                                                    src={imgRedcross}
                                                                                ></img>}
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>

                                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                                <div className="col-sm-12 text-right bluefooter-butn">
                                                    <button id="AddIndivisualPart_Cancel"
                                                        type={"button"}
                                                        className="mr15 cancel-btn"
                                                        onClick={this.cancelHandler}
                                                        disabled={setDisable}
                                                    >
                                                        <div className={"cancel-icon"}></div>
                                                        {"Cancel"}
                                                    </button>
                                                    {!isViewMode &&
                                                        <button id="AddIndivisualPart_Save"
                                                            type="submit"
                                                            className="user-btn mr5 save-btn"
                                                            disabled={isViewMode || setDisable}
                                                        >
                                                            <div className={"save-icon"}></div>
                                                            {isEditFlag ? "Update" : "Save"}
                                                        </button>
                                                    }

                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        {this.state.showHierarchy && <AssociateHierarchy isOpen={this.state.showHierarchy} toggle={this.formToggle} isViewMode={this.state.isViewMode} />}
                    </div>
                </div>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }

            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, part, auth }) {
    const { plantSelectList, } = comman;
    const { productData, productHierarchyData } = part;
    const { initialConfiguration } = auth;

    let initialValues = {};
    if (productData && productData !== undefined) {
        initialValues = {
            ProductNumber: productData.ProductNumber,
            ProductName: productData.ProductName,
            Description: productData.Description,
            ProductGroupCode: productData.ProductGroupCode,
            ECNNumber: productData.ECNNumber,
            DrawingNumber: productData.DrawingNumber,
            RevisionNumber: productData.RevisionNumber,
            Remark: productData.Remark,
        }
    }

    return { plantSelectList, productData, initialValues, initialConfiguration, productHierarchyData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createProduct,
    updateProduct,
    getProductData,
    fileUploadProduct,
    getPreFilledProductLevelValues,
    storeHierarchyData,
    getAllProductLevels
})(reduxForm({
    form: 'AddIndivisualPart',
    enableReinitialize: true,
    touchOnChange: true
})(withTranslation(['PartMaster'])(AddIndivisualProduct)),
)
