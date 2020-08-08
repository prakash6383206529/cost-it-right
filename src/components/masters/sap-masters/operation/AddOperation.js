import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, upper, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderMultiSelectField, searchableSelect, renderNumberInputField, renderTextAreaField
} from "../../../layout/FormInputs";
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import { createOperationsAPI, getOperationDataAPI, getOperationsMasterAPI, updateOperationAPI } from '../../../../actions/master/OtherOperation';
import {
    getTechnologySelectList, getPlantSelectList, getPlantBySupplier,
    getUOMSelectList,
} from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import OperationListing from './OperationListing';
import Switch from "react-switch";
import $ from 'jquery';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL } from '../../../../config/constants';

class AddOperation extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            IsVendor: false,
            selectedTechnology: [],
            selectedPlants: [],

            vendorName: [],
            selectedVendorPlants: [],
            UOM: [],

            isSurfaceTreatment: false,
            remarks: '',
            files: [],
            isVisible: false,
            imageURL: '',

            isEditFlag: false,
            isShowForm: false,
            isOpenVendor: false,
            isOpenUOM: false,
            OperationId: '',
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.getUOMSelectList(() => { })
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getPlantSelectList(() => { })
        this.props.getVendorListByVendorType(true, () => { })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { technologySelectList, plantSelectList, vendorListByVendorType, filterPlantList,
            UOMSelectList, } = this.props;
        const temp = [];
        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
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
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'UOM') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            // vendorName: [],
            // selectedVendorPlants: [],
            // vendorLocation: [],
        }, () => {
            // const { IsVendor } = this.state;
            // this.props.getVendorListByVendorType(IsVendor, () => { })
        });
    }

    /**
    * @method handleTechnology
    * @description Used handle technology
    */
    handleTechnology = (e) => {
        this.setState({ selectedTechnology: e })
    }

    /**
    * @method handlePlants
    * @description Used handle Plants
    */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], })
        }
    };

    vendorToggler = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendor: false }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(true, () => { })
        })
    }

    /**
    * @method handleVendorPlant
    * @description called
    */
    handleVendorPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
    };

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ UOM: newValue, })
        } else {
            this.setState({ UOM: [] })
        }
    };

    uomToggler = () => {
        this.setState({ isOpenUOM: true })
    }

    closeUOMDrawer = (e = '') => {
        this.setState({ isOpenUOM: false }, () => {
            this.props.getUOMSelectList(() => { })
        })
    }

    /**
    * @method onPressSurfaceTreatment
    * @description Used for Surface Treatment
    */
    onPressSurfaceTreatment = () => {
        this.setState({ isSurfaceTreatment: !this.state.isSurfaceTreatment });
    }

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
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                isShowForm: true,
                OperationId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getOperationDataAPI(data.ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    let plantArray = [];
                    Data && Data.Plant.map((item) => {
                        plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                        return plantArray;
                    })

                    let technologyArray = [];
                    Data && Data.Technology.map((item) => {
                        technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
                        return technologyArray;
                    })

                    let vendorPlantArray = [];
                    Data && Data.VendorPlant.map((item) => {
                        vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
                        return vendorPlantArray;
                    })

                    setTimeout(() => {
                        const { vendorListByVendorType, UOMSelectList } = this.props;
                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value == Data.VendorId)
                        const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value == Data.UnitOfMeasurementId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            selectedTechnology: technologyArray,
                            selectedPlants: plantArray,
                            vendorName: { label: vendorObj.Text, value: vendorObj.Value },
                            selectedVendorPlants: vendorPlantArray,
                            UOM: { label: UOMObj.Text, value: UOMObj.Value },
                            isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
                            remarks: Data.Remark,
                            files: Data.FileList,
                        })
                    }, 500)

                }
            })
        }
    }



    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        const { isEditFlag, RawMaterialID } = this.state;
        return { url: 'https://httpbin.org/post', }

    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { isEditFlag, files, } = this.state;

        if (status == 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName != removedFileName)
            this.setState({ files: tempArr })
        }

        if (status == 'done') {
            let data = new FormData()
            data.append('file', file)
            this.props.fileUploadRMDomestic(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status == 'rejected_file_type') {
            console.log('rejected_file_type', status, meta, file)
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    renderImages = () => {
        this.state.files && this.state.files.map(f => {
            const withOutTild = f.FileURL.replace('~', '')
            console.log('withOutTild', withOutTild)
            const fileURL = `${FILE_URL}${withOutTild}`;
            return (
                <div className={'attachment-wrapper images'}>
                    <img src={fileURL} />
                    <button
                        type="button"
                        onClick={() => this.deleteFile(f.FileId)}>X</button>
                </div>
            )
        })
    }

    deleteFile = (FileId, OriginalFileName) => {
        console.log('removed', FileId, OriginalFileName)
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            this.props.fileDeleteRMDomestic(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = this.state.files.filter(item => item.FileId != FileId)
                this.setState({ files: tempArr })
            })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(item => item.FileName != OriginalFileName)
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

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            selectedTechnology: [],
            selectedPlants: [],
            vendorName: [],
            selectedVendorPlants: [],
            UOM: [],
            isSurfaceTreatment: false,
            isShowForm: false,
            isEditFlag: false,
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.clearForm();
        this.props.getOperationDataAPI('', () => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, selectedVendorPlants, selectedPlants, vendorName, files,
            UOM, isSurfaceTreatment, selectedTechnology, remarks, OperationId } = this.state;
        const { reset } = this.props;

        let technologyArray = [];
        selectedTechnology && selectedTechnology.map((item) => {
            technologyArray.push({ Technology: item.Text, TechnologyId: item.Value })
            return technologyArray;
        })

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        let vendorPlants = [];
        selectedVendorPlants && selectedVendorPlants.map((item) => {
            vendorPlants.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return vendorPlants;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: OperationId }
            })
            let updateData = {
                OperationId: OperationId,
                UnitOfMeasurementId: UOM.value,
                Rate: values.Rate,
                Technology: technologyArray,
                Remark: remarks,
                Attachements: updatedFiles,
                LoggedInUserId: loggedInUserId(),
            }

            this.props.updateOperationAPI(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
                    this.clearForm()
                    this.child.getUpdatedData();
                }
            });

        } else {/** Add new detail for creating supplier master **/

            let formData = {
                IsVendor: IsVendor,
                OperationName: values.OperationName,
                OperationCode: values.OperationCode,
                Description: values.Description,
                VendorId: vendorName.value,
                UnitOfMeasurementId: UOM.value,
                IsSurfaceTreatmentOperation: isSurfaceTreatment,
                SurfaceTreatmentCharges: values.SurfaceTreatmentCharges,
                Rate: values.Rate,
                LabourRatePerUOM: values.LabourRatePerUOM,
                Technology: technologyArray,
                Remark: remarks,
                Plant: !IsVendor ? plantArray : [],
                VendorPlant: vendorPlants,
                Attachements: files,
                LoggedInUserId: loggedInUserId(),
            }
            this.props.createOperationsAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.OPERATION_ADD_SUCCESS);
                    this.clearForm();
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
        const { isEditFlag, isOpenVendor, isOpenUOM } = this.state;
        return (
            <div>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg pt-30">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading mb-0">
                                                <h2>{this.state.isEditFlag ? 'Update Operation' : 'Add Operation'}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            <Col md="4" className="switch mb15">
                                                <label>
                                                    <div className={'left-title'}>Zero Based</div>
                                                    <Switch
                                                        onChange={this.onPressVendor}
                                                        checked={this.state.IsVendor}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>Vendor Based</div>
                                                </label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label="Technology"
                                                    name="technology"
                                                    placeholder="--Select--"
                                                    selection={(this.state.selectedTechnology == null || this.state.selectedTechnology.length == 0) ? [] : this.state.selectedTechnology}
                                                    options={this.renderListing('technology')}
                                                    selectionChanged={this.handleTechnology}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Operation Name`}
                                                    name={"OperationName"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Operation Code`}
                                                    name={"OperationCode"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Description`}
                                                    name={"Description"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            {!this.state.IsVendor &&
                                                <Col md="3">
                                                    <Field
                                                        label="Plant"
                                                        name="Plant"
                                                        placeholder="--Select--"
                                                        selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                        options={this.renderListing('plant')}
                                                        selectionChanged={this.handlePlants}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>}
                                            <Col md="2">
                                                <Field
                                                    name="VendorName"
                                                    type="text"
                                                    label="Vendor Name"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('VendorNameList')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleVendorName}
                                                    valueDescription={this.state.vendorName}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.vendorToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="Vendor Plant"
                                                    name="VendorPlant"
                                                    placeholder="--- Plant ---"
                                                    selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length == 0) ? [] : this.state.selectedVendorPlants}
                                                    options={this.renderListing('VendorPlant')}
                                                    selectionChanged={this.handleVendorPlant}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="2">
                                                <Field
                                                    name="UnitOfMeasurementId"
                                                    type="text"
                                                    label="UOM"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select ---'}
                                                    options={this.renderListing('UOM')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleUOM}
                                                    valueDescription={this.state.UOM}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.uomToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Rate (INR)`}
                                                    name={"Rate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleBasicRate}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Labour Rate/UOM`}
                                                    name={"LabourRatePerUOM"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleBasicRate}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3" className="mb15">
                                                <label
                                                    className={`custom-checkbox ${this.state.isEditFlag ? 'disabled' : ''}`}
                                                    onChange={this.onPressSurfaceTreatment}
                                                >
                                                    Surface Treatment Operation
                                                        <input
                                                        type="checkbox"
                                                        checked={this.state.isSurfaceTreatment}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <span
                                                        className=" before-box"
                                                        checked={this.state.isSurfaceTreatment}
                                                        onChange={this.onPressSurfaceTreatment}
                                                    />
                                                </label>
                                            </Col>
                                            {this.state.isSurfaceTreatment &&
                                                <Col md='3'>
                                                    <Field
                                                        label={`Surface Treatment Charges`}
                                                        name={"SurfaceTreatmentCharges"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        //onChange={this.handleBasicRate}
                                                        required={true}
                                                        disabled={isEditFlag ? true : false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>}
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
                                                <label>Upload Attachment ( upload up to 3 files )</label>
                                                {this.state.files.length >= 3 ? '' :
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
                                                <div className={'attachment-wrapper'}>
                                                    {
                                                        this.state.files && this.state.files.map(f => {
                                                            const withOutTild = f.FileURL.replace('~', '')
                                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                                            return (
                                                                <div className={'attachment images'}>
                                                                    <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                                                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => this.deleteFile(f.FileId, f.FileName)}>X</button>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-md-12">
                                                <div className="text-center ">
                                                    <input
                                                        //disabled={pristine || submitting}
                                                        onClick={this.cancel}
                                                        type="button"
                                                        value="Cancel"
                                                        className="reset mr15 cancel-btn"
                                                    />
                                                    <input
                                                        //disabled={isSubmitted ? true : false}
                                                        type="submit"
                                                        value={this.state.isEditFlag ? 'Update' : 'Save'}
                                                        className="submit-button mr5 save-btn"
                                                    />
                                                </div>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <OperationListing
                    onRef={ref => (this.child = ref)}
                    getDetail={this.getDetail}
                    formToggle={this.formToggle}
                    isShowForm={this.state.isShowForm}
                />
                {isOpenVendor && <AddVendorDrawer
                    isOpen={isOpenVendor}
                    closeDrawer={this.closeVendorDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenUOM && <AddUOM
                    isOpen={isOpenUOM}
                    closeDrawer={this.closeUOMDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, otherOperation, material, }) {
    const { plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList, } = comman;
    const { operationData } = otherOperation;
    const { vendorListByVendorType } = material;
    let initialValues = {};
    if (operationData && operationData !== undefined) {
        initialValues = {
            OperationName: operationData.OperationName,
            OperationCode: operationData.OperationCode,
            Description: operationData.Description,
            Rate: operationData.Rate,
            LabourRatePerUOM: operationData.LabourRatePerUOM,
            SurfaceTreatmentCharges: operationData.SurfaceTreatmentCharges,
            Remark: operationData.Remark,
        }
    }
    return {
        technologySelectList, plantSelectList, vendorListByVendorType, UOMSelectList,
        plantList, operationData, filterPlantList, initialValues
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getPlantSelectList,
    getVendorListByVendorType,
    getPlantBySupplier,
    getUOMSelectList,
    createOperationsAPI,
    updateOperationAPI,
    getOperationDataAPI,
})(reduxForm({
    form: 'AddOperation',
    enableReinitialize: true,
})(AddOperation));

