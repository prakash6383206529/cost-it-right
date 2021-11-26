import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength512 } from "../../../helper/validation";
import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
import { renderDatePicker, renderText, renderTextAreaField, } from "../../layout/FormInputs";
import { createProduct, updateProduct, getProductData, fileUploadProduct, fileDeletePart, } from '../actions/Part';
import { getPlantSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import imgRedcross from "../../../assests/images/red-cross.png";

class AddIndivisualProduct extends Component {
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
            DataToCheck: [],
            DropdownChanged: true,
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
                    this.props.change("EffectiveDate", moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            // isLoader: false,
                            effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
                            files: Data.Attachements,
                            isSurfaceTreatment: Data.IsConsideredForMBOM,
                        }, () => this.setState({ isLoader: false }))
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
        this.setState({ effectiveDate: moment(date)._isValid ? moment(date)._d : '', });
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
            isSurfaceTreatment: false,
        })
        this.props.getProductData('', res => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { ProductId, selectedPlants, effectiveDate, isEditFlag, files, DataToCheck, DropdownChanged, isSurfaceTreatment } = this.state;

        let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

        if (isEditFlag) {


            if (DropdownChanged) {
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
                EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
                // Plants: [],
                Attachements: updatedFiles,
                IsForcefulUpdated: true,
                IsConsideredForMBOM: isSurfaceTreatment,
            }

            if (isEditFlag) {
                this.props.reset()
                this.props.updateProduct(updateData, (res) => {
                    if (res.data.Result) {
                        Toaster.success(MESSAGES.UPDATE_PRODUCT_SUCESS);
                        this.cancel()
                    }
                });
                // const toastrConfirmOptions = {
                //     onOk: () => {

                //     },
                //     onCancel: () => { },
                //     component: () => <ConfirmComponent />,
                // }
                // return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
            }



        } else {

            let formData = {
                LoggedInUserId: loggedInUserId(),
                Remark: values.Remark,
                ProductNumber: values.ProductNumber,
                ProductName: values.ProductName,
                Description: values.Description,
                ECNNumber: values.ECNNumber,
                EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
                RevisionNumber: values.RevisionNumber,
                DrawingNumber: values.DrawingNumber,
                ProductGroupCode: values.ProductGroupCode,
                // Plants: [],
                Attachements: files,
                IsConsideredForMBOM: isSurfaceTreatment,
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
    * @method onPressSurfaceTreatment
    * @description Used for Surface Treatment
    */
    onPressSurfaceTreatment = () => {
        this.setState({ isSurfaceTreatment: !this.state.isSurfaceTreatment, DropdownChanged: false });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, initialConfiguration } = this.props;
        const { isEditFlag, } = this.state;
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
                                                    {/* {initialConfiguration &&
                            initialConfiguration.IsBOMNumberDisplay && (
                              <Col md="3">
                                <Field
                                  label={`BOM No.`}
                                  name={"BOMNumber"}
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
                            )} */}
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
                                                                    required={true}
                                                                    className=""
                                                                    customClassName={"withBorder"}
                                                                    disabled={isEditFlag ? true : false}
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
                                                            {/* <label>
                                Effective Date
                                    <span className="asterisk-required">*</span>
                              </label> */}
                                                            <div className="inputbox date-section">
                                                                {/* <DatePicker
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
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={isEditFlag ? true : false}
                                /> */}
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
                                                                        //e.preventDefault()
                                                                    }}
                                                                    component={renderDatePicker}
                                                                    className="form-control"
                                                                    disabled={isEditFlag ? true : false}
                                                                //minDate={moment()}
                                                                />

                                                            </div>
                                                        </div>
                                                    </Col>

                                                </Row>
                                                <Row>
                                                    <Col md="4" className="mb-5 pb-1">
                                                        <label
                                                            className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                                                                }`}
                                                            onChange={this.onPressSurfaceTreatment}
                                                        >
                                                            Preferred for Impact Calculation
                                                            <input
                                                                type="checkbox"
                                                                checked={this.state.isSurfaceTreatment}
                                                            // disabled={isEditFlag ? true : false}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                checked={this.state.isSurfaceTreatment}
                                                                onChange={this.onPressSurfaceTreatment}
                                                            />
                                                        </label>
                                                    </Col>

                                                </Row>

                                                <Row>
                                                    {/* <Col md="3">
                            <Field
                              label="Plant"
                              name="Plant"
                              placeholder={"Select"}
                              selection={
                                this.state.selectedPlants == null ||
                                  this.state.selectedPlants.length === 0
                                  ? []
                                  : this.state.selectedPlants
                              }
                              options={this.renderListing("plant")}
                              selectionChanged={this.handlePlant}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              //mendatory={true}
                              className="multiselect-with-border"
                            //disabled={isEditFlag ? true : false}
                            />
                          </Col> */}


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
                                                        {this.state.files &&
                                                            this.state.files.length >= 3 ? (
                                                            <div class="alert alert-danger" role="alert">
                                                                Maximum file upload limit has been reached.
                                                            </div>
                                                        ) : (
                                                            <Dropzone
                                                                getUploadParams={this.getUploadParams}
                                                                onChangeStatus={this.handleChangeStatus}
                                                                PreviewComponent={this.Preview}
                                                                //onSubmit={this.handleSubmit}
                                                                accept="*"
                                                                initialFiles={this.state.initialFiles}
                                                                maxFiles={3}
                                                                maxSizeBytes={2000000}
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
                                                                disabled={isEditFlag ? true : false}
                                                            />
                                                        )}
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
                                                                            {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                                                            {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

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
                                                                            ></img>
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
