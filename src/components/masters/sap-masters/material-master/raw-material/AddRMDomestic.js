import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../../helper/validation";
import {
    renderText, renderSelectField, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField, focusOnError,
} from "../../../../layout/FormInputs";
import {
    fetchMaterialComboAPI, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
    getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getPlantBySupplier, getUOMSelectList,
} from '../../../../../actions/master/Comman';
import {
    createRMDomestic, getRawMaterialDetailsAPI, updateRMDomesticAPI, getRawMaterialNameChild,
    getGradeListByRawMaterialNameChild, getVendorListByVendorType, fileUploadRMDomestic,
    fileUpdateRMDomestic, fileDeleteRMDomestic,
} from '../../../../../actions/master/Material';
import axios from 'axios';
import RMDomesticListing from './RMDomesticListing';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../../helper/auth";
import Switch from "react-switch";
import AddSpecification from './AddSpecification';
import AddGrade from './AddGrade';
import AddCategory from './AddCategory';
import AddUOM from '../../uom-master/AddUOM';
import AddVendorDrawer from '../../supplier-master/AddVendorDrawer';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL } from '../../../../../config/constants';
const selector = formValueSelector('AddRMDomestic');

class AddRMDomestic extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            RawMaterialID: '',

            RawMaterial: [],
            RMGrade: [],
            RMSpec: [],
            Category: [],
            selectedPlants: [],

            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],

            HasDifferentSource: false,
            sourceLocation: [],

            UOM: [],
            effectiveDate: '',
            remarks: '',

            isShowForm: false,
            IsVendor: false,
            files: [],
            errors: [],

            isRMDrawerOpen: false,
            isOpenGrade: false,
            isOpenSpecification: false,
            isOpenCategory: false,
            isOpenVendor: false,
            isOpenUOM: false,

            initialFiles: [],
            receivedFiles: [],

        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {
        this.props.getRawMaterialNameChild(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.getSupplierList(() => { })

    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        this.props.change('NetLandedCost', 0)
        this.props.fetchMaterialComboAPI(res => { });
        this.props.getVendorListByVendorType(false, () => { })
    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {

            this.setState({ RawMaterial: newValue }, () => {
                const { RawMaterial } = this.state;
                this.props.getGradeListByRawMaterialNameChild(RawMaterial.value, res => { })
            });

        } else {

            this.setState({
                RMGrade: [],
                RMSpec: [],
                RawMaterial: [],
            });

        }
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
        */
    handleGradeChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RMGrade: newValue, RMSpec: [], }, () => {
                const { RMGrade } = this.state;
                this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
            })
        } else {
            this.setState({
                RMGrade: [],
                RMSpec: [],
            })
            this.props.fetchSpecificationDataAPI(0, res => { });
        }
    }

    /**
    * @method handleSpecChange
    * @description  used to handle row material grade selection
    */
    handleSpecChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RMSpec: newValue })
        } else {
            this.setState({ RMSpec: [] })
        }
    }

    /**
    * @method handleCategoryChange
    * @description  used to handle category selection
    */
    handleCategoryChange = (newValue, actionMeta) => {
        this.setState({ Category: newValue })
    }

    /**
    * @method handleCategoryType
    * @description  used to handle category type selection
    */
    handleCategoryType = (e) => {
        this.props.fetchCategoryAPI(e.target.value, res => { })
    }

    /**
    * @method handleSourceSupplierPlant
    * @description Used handle vendor plants
    */
    handleSourceSupplierPlant = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
                this.props.getCityBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], vendorLocation: [] })
        }
    };

    /**
    * @method handleVendorPlant
    * @description called
    */
    handleVendorPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
    };

    /**
    * @method handleVendorLocation
    * @description called
    */
    handleVendorLocation = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorLocation: newValue, });
        } else {
            this.setState({ vendorLocation: [], })
        }
    };

    /**
    * @method handleSourceSupplierCity
    * @description called
    */
    handleSourceSupplierCity = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ sourceLocation: newValue, });
        } else {
            this.setState({ sourceLocation: [], })
        }
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

    /**
    * @method handleBasicRate
    * @description Set value in NetLandedCost
    */
    handleBasicRate = (e) => {
        this.props.change('NetLandedCost', e.target.value)
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
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                isShowForm: true,
                RawMaterialID: data.Id,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getRawMaterialDetailsAPI(data, true, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.getVendorListByVendorType(Data.IsVendor, () => { })
                    this.props.getGradeListByRawMaterialNameChild(Data.RawMaterial, res => { })
                    this.props.fetchSpecificationDataAPI(Data.RMGrade, res => { });
                    this.props.getPlantBySupplier(Data.Vendor, () => { })
                    this.props.getCityBySupplier(Data.Vendor, () => { })

                    setTimeout(() => {
                        const { gradeSelectListByRMID, rmSpecification, cityList, categoryList,
                            filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList,
                            vendorListByVendorType } = this.props;

                        const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value == Data.RawMaterial)
                        const gradeObj = gradeSelectListByRMID && gradeSelectListByRMID.find(item => item.Value == Data.RMGrade)
                        const specObj = rmSpecification && rmSpecification.find(item => item.Value == Data.RMSpec)
                        const categoryObj = categoryList && categoryList.find(item => item.Value == Data.Category)

                        let plantArray = [];
                        Data && Data.Plant.map((item) => {
                            plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                            return plantArray;
                        })

                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value == Data.Vendor)

                        let vendorPlantArray = [];
                        Data && Data.VendorPlant.map((item) => {
                            vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
                            return vendorPlantArray;
                        })

                        const vendorLocationObj = filterCityListBySupplier && filterCityListBySupplier.find(item => item.Value == Data.VendorLocation)
                        const sourceLocationObj = cityList && cityList.find(item => item.Value == Data.SourceLocation)
                        const UOMObj = UOMSelectList && UOMSelectList.find(item => item.Value == Data.UOM)

                        let tempArr = [];
                        let tempFiles = [];

                        if (Data && Data.FileList) {
                            Data.FileList.map(item => {
                                const fileName = item.OriginalFileName;
                                //const fileURL = item.FileURL;
                                const withOutTild = item.FileURL.replace('~', '')
                                console.log('withOutTild', withOutTild)
                                //const fileURL = `${FILE_URL}Upload/Attachement/RawMaterial/${fileName}`;
                                const fileURL = `${FILE_URL}${withOutTild}`;

                                let fileObj = {
                                    ContextId: item.RawMaterialId,
                                    Exist: true,
                                    FileExtension: item.FileExtension,
                                    FileId: item.FileId,
                                    FileName: item.FileName,
                                    FilePath: item.FilePath,
                                    FileSize: item.FileSize,
                                    FileURL: fileURL,
                                    MimeType: item.MimeType,
                                    OriginalFileName: item.OriginalFileName,
                                }
                                tempFiles.push(fileObj)

                                let headers = new Headers();
                                headers.append('Content-Type', 'application/json');
                                headers.append('Accept', 'application/json');
                                headers.append('Access-Control-Allow-Origin', '*');
                                headers.append('Access-Control-Allow-Credentials', 'true');
                                //headers.append('GET', 'POST', 'OPTIONS');

                                const myHeaders = new Headers();

                                const myRequest = new Request(fileURL, {
                                    method: 'GET',
                                    headers: myHeaders,
                                    mode: 'no-cors',
                                    cache: 'default',
                                });

                                fetch(myRequest)
                                    .then(response => {
                                        console.log('response >>', response)
                                        response.arrayBuffer().then(buf => {
                                            let file = new File([buf], fileName, { type: item.MimeType })
                                            file.FileId = item.FileId;
                                            tempArr.push(file)
                                            console.log('file >>>>', file)
                                            //response.blob()
                                        })
                                    }).catch((error) => {
                                        console.log('response error >>>>>>', error)
                                    })

                                // .then(myBlob => {
                                //     console.log('myBlob', myBlob)
                                //     //myImage.src = URL.createObjectURL(myBlob);
                                // });

                                // axios.get('http://10.10.1.100:8090//Upload/Attachement/RawMaterial/108787395_dummy1.png', { headers: headers })
                                //     .then((response) => {
                                //         console.log('response >>>>>>', response)
                                //     }).catch((error) => {
                                //         console.log('response error >>>>>>', error)
                                //     });

                                // fetch(fileURL, { headers: headers })
                                //     .then(res => {
                                //         res.arrayBuffer().then(buf => {
                                //             const file = new File([buf], fileName, { type: item.MimeType })
                                //             file.FileId = item.FileId;
                                //             tempArr.push(file)
                                //             //console.log('file >>>>', file)
                                //         })
                                //     }).catch((error) => {
                                //         console.log('catch >>>>', error)
                                //     })
                                setTimeout(() => {
                                    this.setState({ initialFiles: tempArr, receivedFiles: tempFiles })
                                }, 2000)
                                console.log('URL', fileURL)
                            })

                        }

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            isShowForm: true,
                            IsVendor: Data.IsVendor,
                            RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value },
                            RMGrade: { label: gradeObj.Text, value: gradeObj.Value },
                            RMSpec: { label: specObj.Text, value: specObj.Value },
                            Category: { label: categoryObj.Text, value: categoryObj.Value },
                            selectedPlants: plantArray,
                            vendorName: { label: vendorObj.Text, value: vendorObj.Value },
                            selectedVendorPlants: vendorPlantArray,
                            vendorLocation: { label: vendorLocationObj.Text, value: vendorLocationObj.Value },
                            HasDifferentSource: Data.HasDifferentSource,
                            sourceLocation: { label: sourceLocationObj.Text, value: sourceLocationObj.Value },
                            UOM: { label: UOMObj.Text, value: UOMObj.Value },
                            effectiveDate: new Date(Data.EffectiveDate),
                            remarks: Data.Remark,
                        })
                    }, 200)
                }
            })
        } else {
            this.props.getRawMaterialDetailsAPI('', false, res => { })
        }
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],
        }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(IsVendor, () => { })
        });
    }

    /**
    * @method onPressDifferentSource
    * @description Used for Different Source checked
    */
    onPressDifferentSource = () => {
        this.setState({ HasDifferentSource: !this.state.HasDifferentSource });
    }

    rmToggler = () => {
        this.setState({ isRMDrawerOpen: true })
    }

    closeRMDrawer = (e = '') => {
        this.setState({ isRMDrawerOpen: false })
    }

    gradeToggler = () => {
        this.setState({ isOpenGrade: true })
    }

    /**
    * @method closeGradeDrawer
    * @description  used to toggle grade Popup/Drawer
    */
    closeGradeDrawer = (e = '') => {
        this.setState({ isOpenGrade: false }, () => {
            //const { RawMaterial } = this.state;
            //this.handleMaterialChange(RawMaterial, '');
        })
    }

    specificationToggler = () => {
        this.setState({ isOpenSpecification: true })
    }

    closeSpecDrawer = (e = '') => {
        this.setState({ isOpenSpecification: false })
    }

    categoryToggler = () => {
        this.setState({ isOpenCategory: true })
    }

    closeCategoryDrawer = (e = '') => {
        this.setState({ isOpenCategory: false })
    }

    vendorToggler = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendor: false }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(IsVendor, () => { })
        })
    }

    uomToggler = () => {
        this.setState({ isOpenUOM: true })
    }

    closeUOMDrawer = (e = '') => {
        this.setState({ isOpenUOM: false })
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { rowMaterialList, gradeSelectListByRMID, rmSpecification, plantList,
            supplierSelectList, filterPlantList, cityList, technologyList, categoryList, filterPlantListByCity,
            filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList,
            vendorListByVendorType } = this.props;
        const temp = [];
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'grade') {
            gradeSelectListByRMID && gradeSelectListByRMID.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'specification') {
            rmSpecification && rmSpecification.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'category') {
            categoryList && categoryList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantList && plantList.map(item => {
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
        if (label === 'VendorLocation') {
            filterCityListBySupplier && filterCityListBySupplier.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'SourceLocation') {
            cityList && cityList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'uom') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'city') {
            filterCityListBySupplier && filterCityListBySupplier.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }

    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            RawMaterial: [],
            RMGrade: [],
            RMSpec: [],
            Category: [],
            selectedPlants: [],
            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],
            HasDifferentSource: false,
            sourceLocation: [],
            UOM: [],
            remarks: '',
            isShowForm: false,
            IsVendor: false,
        })
        this.props.getRawMaterialDetailsAPI('', false, res => { })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        this.clearForm()
    }

    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        const { isEditFlag, RawMaterialID } = this.state;
        console.log('getUploadParams', file, meta, file.FileId)
        console.log('file.FileId', file.FileId)

        // if (isEditFlag && file.FileId == undefined) {
        //     let data = new FormData()
        //     data.append('file', file)
        //     this.props.fileUploadRMDomestic(data, (res) => {
        //         let Data = res.data[0]
        //         const { files } = this.state;
        //         files.push(Data)
        //         this.setState({ files: files })
        //     })
        //     return { url: 'https://httpbin.org/post', }
        // } else {

        let data = new FormData()
        data.append('file', file)
        this.props.fileUploadRMDomestic(data, (res) => {
            let Data = res.data[0]
            const { files } = this.state;
            files.push(Data)
            this.setState({ files: files })
        })
        return { url: 'https://httpbin.org/post', }
        //}
    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { isEditFlag, files, receivedFiles, initialFiles, RawMaterialID } = this.state;
        console.log('handleChangeStatus', status, meta, file)

        if (status == 'removed') {

            // let removdArr = receivedFiles.filter(item => item.FileId != file.FileId)
            // console.log('remove >>>>', status, meta, file)
            // if (isEditFlag && file.FileId) {
            //     let deleteData = {
            //         Id: file.FileId,
            //         DeletedBy: loggedInUserId(),
            //     }
            //     //this.setState({ receivedFiles: removdArr, files: tempArr })
            //     this.props.fileDeleteRMDomestic(deleteData, (res) => {
            //         toastr.success('File has been deleted successfully.')
            //     })
            //     //return false;
            // } else {
            //     const removedFileName = file.name;
            //     let tempArr = files.filter(item => item.OriginalFileName != removedFileName)
            //     this.setState({ files: tempArr })
            // }
        }

        if (status == 'done') {

        }

        if (status == 'rejected_file_type') {
            console.log('rejected_file_type', status, meta, file)
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    // receives array of files that are done uploading when submit button is clicked
    handleSubmit = (files, allFiles) => {
        console.log('handleSubmit', files.map(f => f.meta))
        allFiles.forEach(f => f.remove())
    }

    Preview = ({ meta }) => {
        const { name, percent, status } = meta
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {name}, {Math.round(percent)}%, {status}
            </span>
        )
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, RawMaterial, RMGrade, RMSpec, Category, selectedPlants, vendorName,
            selectedVendorPlants, vendorLocation, HasDifferentSource, sourceLocation, UOM, remarks,
            RawMaterialID, isEditFlag, files, effectiveDate, receivedFiles } = this.state;
        const { reset } = this.props;

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        let vendorPlantArray = [];
        selectedVendorPlants && selectedVendorPlants.map((item) => {
            vendorPlantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return vendorPlantArray;
        })

        if (isEditFlag) {
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: RawMaterialID }
            })
            console.log('updatedFiles', updatedFiles)
            let requestData = {
                RawMaterialId: RawMaterialID,
                IsVendor: IsVendor,
                HasDifferentSource: HasDifferentSource,
                Source: (!IsVendor && !HasDifferentSource) ? '' : values.Source,
                SourceLocation: (!IsVendor && !HasDifferentSource) ? '' : sourceLocation.value,
                Remark: remarks,
                BasicRatePerUOM: values.BasicRate,
                ScrapRate: values.ScrapRate,
                NetLandedCost: values.NetLandedCost,
                LoggedInUserId: loggedInUserId(),
                Attachements: updatedFiles,
            }
            this.props.updateRMDomesticAPI(requestData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
                }
            })

        } else {

            const formData = {
                IsVendor: IsVendor,
                RawMaterial: RawMaterial.value,
                RMGrade: RMGrade.value,
                RMSpec: RMSpec.value,
                Category: Category.value,
                Vendor: vendorName.value,
                VendorLocation: vendorLocation.value,
                HasDifferentSource: HasDifferentSource,
                Source: (!IsVendor && !HasDifferentSource) ? '' : values.Source,
                SourceLocation: (!IsVendor && !HasDifferentSource) ? '' : sourceLocation.value,
                UOM: UOM.value,
                BasicRatePerUOM: values.BasicRate,
                ScrapRate: values.ScrapRate,
                NetLandedCost: values.NetLandedCost,
                EffectiveDate: effectiveDate,
                Remark: remarks,
                LoggedInUserId: loggedInUserId(),
                Plant: IsVendor == false ? plantArray : [],
                VendorPlant: IsVendor == false ? [] : vendorPlantArray,
                Attachements: files,
            }

            this.props.createRMDomestic(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
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
        const { handleSubmit, pristine, submitting, } = this.props;
        const { files, errors, isRMDrawerOpen, isOpenGrade, isOpenSpecification,
            isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, } = this.state;

        const previewStyle = {
            display: 'inline',
            width: 100,
            height: 100,
        };

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            {this.state.isShowForm &&
                                <div className="col-md-12">
                                    <div className="shadow-lgg login-formg">
                                        <div className="row">
                                            <div className="col-md-6 mt-15">
                                                <div className="form-heading">
                                                    <h2>{isEditFlag ? `Update Raw Material Details` : `Add Raw Material Details`}</h2>
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
                                                    <label className="switch-level">
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
                                            <Col md="12" className="filter-block">
                                                    <div className=" flex-fills mb-2">
                                                      <h5>{'Raw Material:'}</h5>  
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="RawMaterialId"
                                                        type="text"
                                                        label="Raw Material"
                                                        component={searchableSelect}
                                                        placeholder={'Raw Material'}
                                                        options={this.renderListing('material')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleRMChange}
                                                        valueDescription={this.state.RawMaterial}
                                                        disabled={isEditFlag ? true : false}
                                                        className="fullinput-icon"
                                                        
                                                    />
                                                </div>
                                                    <div
                                                        onClick={this.rmToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div></div>
                                                </Col>
                                                <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="RawMaterialGradeId"
                                                        type="text"
                                                        label="RM Grade"
                                                        component={searchableSelect}
                                                        placeholder={'RM Grade'}
                                                        options={this.renderListing('grade')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.RMGrade == null || this.state.RMGrade.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleGradeChange}
                                                        valueDescription={this.state.RMGrade}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    </div>
                                                    <div
                                                        onClick={this.gradeToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="RawMaterialSpecificationId"
                                                        type="text"
                                                        label="RM Spec"
                                                        component={searchableSelect}
                                                        placeholder={'RM Spec'}
                                                        options={this.renderListing('specification')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.RMSpec == null || this.state.RMSpec.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleSpecChange}
                                                        valueDescription={this.state.RMSpec}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    </div>
                                                    <div
                                                        onClick={this.specificationToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="CategoryId"
                                                        type="text"
                                                        label="Category"
                                                        component={searchableSelect}
                                                        placeholder={'Category'}
                                                        options={this.renderListing('category')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.Category == null || this.state.Category.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleCategoryChange}
                                                        valueDescription={this.state.Category}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    </div>
                                                    <div
                                                        onClick={this.categoryToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            {!this.state.IsVendor &&
                                                <Row>
                                                    <Col md="3">
                                                        <Field
                                                            label="Plant"
                                                            name="SourceSupplierPlantId"
                                                            placeholder="--Select--"
                                                            selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                            options={this.renderListing('plant')}
                                                            selectionChanged={this.handleSourceSupplierPlant}
                                                            optionValue={option => option.Value}
                                                            optionLabel={option => option.Text}
                                                            component={renderMultiSelectField}
                                                            mendatory={true}
                                                            className="multiselect-with-border"
                                                            disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                        />
                                                    </Col>
                                                </Row>}

                                            <Row>


                                                <Col md="12" className="filter-block">
                                                    <div className=" flex-fills mb-2">
                                                      <h5>{'Vendor'}</h5>  
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="DestinationSupplierId"
                                                        type="text"
                                                        label="Vendor Name"
                                                        component={searchableSelect}
                                                        placeholder={'Vendor'}
                                                        options={this.renderListing('VendorNameList')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorName}
                                                        valueDescription={this.state.vendorName}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </div>
                                                    <div
                                                        onClick={this.vendorToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label="Vendor Plant"
                                                        name="DestinationSupplierPlantId"
                                                        placeholder="--- Plant ---"
                                                        selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length == 0) ? [] : this.state.selectedVendorPlants}
                                                        options={this.renderListing('VendorPlant')}
                                                        selectionChanged={this.handleVendorPlant}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                        disabled={isEditFlag ? true : (this.state.IsVendor ? false : true)}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        name="DestinationSupplierCityId"
                                                        type="text"
                                                        label="Vendor Location"
                                                        component={searchableSelect}
                                                        placeholder={'Location'}
                                                        options={this.renderListing('VendorLocation')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.vendorLocation == null || this.state.vendorLocation.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorLocation}
                                                        valueDescription={this.state.vendorLocation}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>

                                            </Row>

                                            {!this.state.IsVendor &&
                                                <Row>
                                                    <Col md="4" className="mb15">
                                                        <label
                                                            className={`custom-checkbox ${this.state.IsVendor ? 'disabled' : ''}`}
                                                            onChange={this.onPressDifferentSource}
                                                        >
                                                            Has Difference Source?
                                                        <input
                                                                type="checkbox"
                                                                checked={this.state.HasDifferentSource}
                                                                disabled={this.state.IsVendor ? true : false}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                checked={this.state.HasDifferentSource}
                                                                onChange={this.onPressDifferentSource}
                                                            />
                                                        </label>
                                                    </Col>
                                                </Row>}

                                            {(this.state.HasDifferentSource || this.state.IsVendor) &&
                                                <Row>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Source`}
                                                            name={"Source"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderText}
                                                            required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName=" withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            name="SourceSupplierCityId"
                                                            type="text"
                                                            label="Source Location"
                                                            component={searchableSelect}
                                                            placeholder={'--- Plant ---'}
                                                            options={this.renderListing('SourceLocation')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.sourceLocation == null || this.state.sourceLocation.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleSourceSupplierCity}
                                                            valueDescription={this.state.sourceLocation}
                                                        />
                                                    </Col>
                                                </Row>}

                                            <Row>
                                            <Col md="12" className="filter-block">
                                                    <div className=" flex-fills mb-2">
                                                      <h5>{'Cost:'}</h5>  
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div  className="fullinput-icon">
                                                    <Field
                                                        name="UnitOfMeasurementId"
                                                        type="text"
                                                        label="UOM"
                                                        component={searchableSelect}
                                                        placeholder={'--- Select ---'}
                                                        options={this.renderListing('uom')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleUOM}
                                                        valueDescription={this.state.UOM}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                   </div>
                                                
                                                    <div
                                                        onClick={this.uomToggler}
                                                        className={'plus-icon-square  right'}>
                                                    </div>
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Basic Rate/UOM (INR)`}
                                                        name={"BasicRate"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        onChange={this.handleBasicRate}
                                                        required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Scrap Rate (INR)`}
                                                        name={"ScrapRate"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        label={`Net Landed Cost (INR/UOM)`}
                                                        name={"NetLandedCost"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        disabled={true}
                                                        className=" "
                                                        customClassName=" withBorder"
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
                                            <Col md="12" className="filter-block">
                                                    <div className=" flex-fills mb-2">
                                                       <h5>{'Remarks & Attachment'}</h5>  
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
                                                        rows="6"
                                                    />
                                                </Col>
                                                <Col md="6">
                                                    <label>Upload Attachment ( upload up to 3 files )</label>
                                                   
                                                    <Dropzone
                                                        getUploadParams={this.getUploadParams}
                                                        onChangeStatus={this.handleChangeStatus}
                                                        
                                                        //PreviewComponent={this.Preview}
                                                        //onSubmit={this.handleSubmit}
                                                        accept="image/jpeg,image/jpg,image/png,image/PNG,xls,doc,pdf"
                                                        initialFiles={this.state.initialFiles}
                                                        maxFiles={3}
                                                        maxSizeBytes={2000000}
                                                        inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                                                        styles={{
                                                            dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                                                            inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                                                        }}
                                                        classNames="draper-drop"
                                                    />
                                                </Col>
                                            </Row>
                                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                                <div className="col-sm-12 text-right bluefooter-butn">
                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <RMDomesticListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm} />
                </div>

                {isRMDrawerOpen && <AddSpecification
                    isOpen={isRMDrawerOpen}
                    closeDrawer={this.closeRMDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenGrade && <AddGrade
                    isOpen={isOpenGrade}
                    closeDrawer={this.closeGradeDrawer}
                    isEditFlag={false}
                    //RawMaterial={this.state.RawMaterial}
                    anchor={'right'}
                />}
                {isOpenSpecification && <AddSpecification
                    isOpen={isOpenSpecification}
                    closeDrawer={this.closeSpecDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenCategory && <AddCategory
                    isOpen={isOpenCategory}
                    closeDrawer={this.closeCategoryDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
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
    const { comman, material, costWorking } = state;
    const fieldsObj = selector(state, 'BasicRate',);

    const { rowMaterialList, rmGradeList, rmSpecification, plantList,
        supplierSelectList, filterPlantList, filterCityListBySupplier, cityList, technologyList,
        categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList, } = comman;

    const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList,
        gradeSelectListByRMID, vendorListByVendorType } = material;

    let initialValues = {};
    if (rawMaterialDetails && rawMaterialDetails != undefined) {
        initialValues = {
            Source: rawMaterialDetails.Source,
            BasicRate: rawMaterialDetails.BasicRatePerUOM,
            ScrapRate: rawMaterialDetails.ScrapRate,
            NetLandedCost: rawMaterialDetails.NetLandedCost,
            Remark: rawMaterialDetails.Remark,
        }
    }

    return {
        rowMaterialList, rmGradeList, rmSpecification,
        plantList, supplierSelectList, cityList, technologyList, categoryList, rawMaterialDetails,
        filterPlantListByCity, filterCityListBySupplier, rawMaterialDetailsData, initialValues,
        fieldsObj, filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectListByRMID,
        filterPlantList, UOMSelectList, vendorListByVendorType,
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createRMDomestic,
    fetchMaterialComboAPI,
    fetchGradeDataAPI,
    fetchSpecificationDataAPI,
    getRawMaterialDetailsAPI,
    getCityBySupplier,
    getPlantByCity,
    getPlantByCityAndSupplier,
    updateRMDomesticAPI,
    fetchRMGradeAPI,
    getRawMaterialNameChild,
    getGradeListByRawMaterialNameChild,
    getSupplierList,
    getPlantBySupplier,
    getUOMSelectList,
    getVendorListByVendorType,
    fileUploadRMDomestic,
    fileUpdateRMDomestic,
    fileDeleteRMDomestic,
})(reduxForm({
    form: 'AddRMDomestic',
    enableReinitialize: true,
    onSubmitFail: errors => {
        console.log('errors', errors)
        focusOnError(errors);
    },
})(AddRMDomestic));
