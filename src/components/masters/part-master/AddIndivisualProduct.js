import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength512 } from "../../../helper/validation";
import { loggedInUserId } from "../../../helper/auth";
import { renderDatePicker, renderText, renderTextAreaField, } from "../../layout/FormInputs";
import { createProduct, updateProduct, getProductData, fileUploadProduct, fileDeletePart, } from '../actions/Part';
import { getPlantSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from "../../../assests/images/red-cross.png";

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
            isViewMode: false,

            selectedPlants: [],
            effectiveDate: '',

            files: [],
            DataToCheck: [],
            DropdownChanged: true,
            uploadAttachements: true,
            isSurfaceTreatment: false,

        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        this.props.getPlantSelectList(() => { })
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
                isViewMode: false
            })
            this.props.getProductData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;
                    this.setState({ DataToCheck: Data })

                    this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
                    if (this.props.data.isViewMode) {
                        this.setState({ isViewMode: true })
                    }
                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            // isLoader: false,
                            effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
                            files: Data.Attachements,
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
            this.props.fileUploadProduct(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
            this.dropzone.current.files.pop()
            Toaster.warning("File size greater than 2 mb not allowed")
        } else if (status === 'error_validation'
            || status === 'error_upload_params' || status === 'exception_upload'
            || status === 'aborted' || status === 'error_upload') {
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
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            this.props.fileDeletePart(deleteData, (res) => {
                Toaster.success('File has been deleted successfully.')
                let tempArr = this.state.files.filter(item => item.FileId !== FileId)
                this.setState({ files: tempArr })
            })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
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
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            RawMaterial: [],
            selectedPlants: [],
        })
        this.props.getProductData('', res => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { ProductId, selectedPlants, effectiveDate, isEditFlag, files, DropdownChanged, isSurfaceTreatment, uploadAttachements } = this.state;

        let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

        if (isEditFlag) {


            if (DropdownChanged && uploadAttachements) {
                this.cancel()
                return false;
            }
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
                EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
                // Plants: [],
                Attachements: updatedFiles,
                IsForcefulUpdated: true
            }

            if (isEditFlag) {
                this.props.reset()
                this.props.updateProduct(updateData, (res) => {
                    if (res.data.Result) {
                        Toaster.success(MESSAGES.UPDATE_PRODUCT_SUCESS);
                        this.cancel()
                    }
                });

            }



        } else {

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
                // Plants: [],
                Attachements: files
            }

            this.props.reset()
            this.props.createProduct(formData, (res) => {
                if (res.data.Result === true) {
                    Toaster.success(MESSAGES.PRODUCT_ADD_SUCCESS);
                    this.cancel()
                }
            });
        }
    }

    handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, initialConfiguration } = this.props;
        const { isEditFlag, isViewMode } = this.state;
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
                                                        {this.state.isEditFlag
                                                            ? "Update Product"
                                                            : "Add Product"}
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
                                                            label={`Product Name`}
                                                            name={"ProductName"}
                                                            type="text"
                                                            placeholder={""}
                                                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
                                                            component={renderText}
                                                            required={true}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Product Number`}
                                                            name={"ProductNumber"}
                                                            type="text"
                                                            placeholder={""}
                                                            validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
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
                                                            placeholder={""}
                                                            validate={[maxLength80, checkWhiteSpaces]}
                                                            component={renderText}
                                                            required={false}
                                                            className=""
                                                            customClassName={"withBorder"}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>

                                                    {initialConfiguration &&
                                                        initialConfiguration.IsGroupCodeDisplay && (
                                                            <Col md="3">
                                                                <Field
                                                                    label={`Group Code`}
                                                                    name={"ProductGroupCode"}
                                                                    type="text"
                                                                    placeholder={""}
                                                                    validate={[checkWhiteSpaces, alphaNumeric, maxLength20, required]}
                                                                    component={renderText}
                                                                    onChange={
                                                                        this.ProductGroupCodeUpdate
                                                                    }
                                                                    required={true}
                                                                    className=""
                                                                    customClassName={"withBorder"}
                                                                    disabled={isViewMode ? true : false}
                                                                />
                                                            </Col>
                                                        )}

                                                </Row>

                                                <Row>
                                                    <Col md="3">
                                                        <Field
                                                            label={`ECN No.`}
                                                            name={"ECNNumber"}
                                                            type="text"
                                                            placeholder={""}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
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
                                                            placeholder={""}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
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
                                                            placeholder={""}
                                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
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
                                                                    selected={this.state.effectiveDate}
                                                                    onChange={this.handleEffectiveDateChange}
                                                                    type="text"
                                                                    validate={[required]}
                                                                    autoComplete={'off'}
                                                                    required={true}
                                                                    changeHandler={(e) => {

                                                                    }}
                                                                    component={renderDatePicker}
                                                                    className="form-control"
                                                                    disabled={isViewMode ? true : false}

                                                                />

                                                            </div>
                                                        </div>
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
                                                            placeholder="Type here..."
                                                            className=""
                                                            customClassName=" textAreaWithBorder"
                                                            validate={[maxLength512, checkWhiteSpaces]}
                                                            //required={true}
                                                            component={renderTextAreaField}
                                                            maxLength="5000"
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <label>
                                                            Upload Files (upload up to 3 files)
                                                        </label>
                                                        <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                                                            Maximum file upload limit has been reached.
                                                        </div>
                                                        <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                                                            <Dropzone
                                                                ref={this.dropzone}
                                                                getUploadParams={this.getUploadParams}
                                                                onChangeStatus={this.handleChangeStatus}
                                                                PreviewComponent={this.Preview}
                                                                //onSubmit={this.handleSubmit}
                                                                accept="*"
                                                                initialFiles={this.state.initialFiles}
                                                                maxFiles={3}
                                                                maxSizeBytes={2000000}
                                                                disabled={isViewMode ? true : false}
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
                                                            {this.state.files &&
                                                                this.state.files.map((f) => {
                                                                    const withOutTild = f.FileURL.replace(
                                                                        "~",
                                                                        ""
                                                                    );
                                                                    const fileURL = `${FILE_URL}${withOutTild}`;
                                                                    return (
                                                                        <div className={"attachment images"}>
                                                                            <a href={fileURL} target="_blank">
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
                                                    <button
                                                        type={"button"}
                                                        className="mr15 cancel-btn"
                                                        onClick={this.cancel}
                                                    >
                                                        <div className={"cancel-icon"}></div>
                                                        {"Cancel"}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="user-btn mr5 save-btn"
                                                        disabled={isViewMode ? true : false}
                                                    >
                                                        <div className={"save-icon"}></div>
                                                        {isEditFlag ? "Update" : "Save"}
                                                    </button>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </Col>
                            </Row>
                        </div>
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
function mapStateToProps({ comman, part, auth }) {
    const { plantSelectList, } = comman;
    const { productData } = part;
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

    return { plantSelectList, productData, initialValues, initialConfiguration, }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantSelectList,
    createProduct,
    updateProduct,
    getProductData,
    fileUploadProduct,
    fileDeletePart,
})(reduxForm({
    form: 'AddIndivisualPart',
    enableReinitialize: true,
})(AddIndivisualProduct));
