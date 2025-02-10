// import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { Field, reduxForm, formValueSelector } from "redux-form";
// import { Row, Col } from 'reactstrap';
// import { required, checkWhiteSpaces, alphaNumeric, acceptAllExceptSingleSpecialCharacter, maxLength20, maxLength80, maxLength512 } from "../../../helper/validation";
// import { getConfigurationKey, loggedInUserId } from "../../../helper/auth";
// import { renderText, renderTextAreaField, focusOnError, renderDatePicker } from "../../layout/FormInputs";
// import { getPlantSelectListByType, } from '../../../actions/Common';
// import {
//   createAssemblyPart, updateAssemblyPart, getAssemblyPartDetail, fileUploadPart, fileDeletePart,
//   getBOMViewerTreeDataByPartIdAndLevel,
// } from '../actions/Part';
// import Toaster from '../../common/Toaster';
// import { MESSAGES } from '../../../config/message';
// import Dropzone from 'react-dropzone-uploader';
// import 'react-dropzone-uploader/dist/styles.css';
// import "react-datepicker/dist/react-datepicker.css";
// import { ASSEMBLY, BOUGHTOUTPART, COMPONENT_PART, FILE_URL, ZBC, } from '../../../config/constants';
// import AddChildDrawerProduct from './AddChildDrawerProduct';
// import moment from 'moment';
// import BOMViewerProduct from './BOMViewerProduct';
// import ConfirmComponent from '../../../helper/ConfirmComponent';
// import { getRandomSixDigit } from '../../../helper/util';
// import LoaderCustom from '../../common/LoaderCustom';
// import saveImg from '../../../assests/images/check.png'
// import cancelImg from '../../../assests/images/times.png'
// import imgRedcross from "../../../assests/images/red-cross.png";
// import { updateAdditionalFreightByIdAPI } from '../actions/Freight';
// import PopupMsgWrapper from '../../common/PopupMsgWrapper';

// const selector = formValueSelector('AddAssemblyPart')

// class AddAssemblyProduct extends Component {
//   constructor(props) {
//     super(props);
//     this.child = React.createRef();
//     this.state = {
//       isEditFlag: false,
//       isLoader: false,
//       PartId: '',

//       selectedPlants: [],
//       effectiveDate: '',
//       files: [],

//       isOpenChildDrawer: false,
//       isOpenBOMViewerDrawer: false,
//       BOMViewerData: [],
//       childPartArray: [],
//       NewAddedLevelOneChilds: [],
//       avoidAPICall: false,
//       DataToCheck: [],
//       DropdownChanged: true,
//       showPopup:false,
//       updatedObj:{},
// 			updatedObjBom:{},
//       showPopupBom:false
//     }
//   }

//   /**
//   * @method componentDidMount
//   * @description 
//   */
//   componentDidMount() {
//     this.props.getPlantSelectListByType(ZBC, () => { })
//     this.getDetails()
//   }

//   /**
//   * @method getDetails
//   * @description 
//   */
//   getDetails = () => {
//     const { data } = this.props;
//     if (data && data.isEditFlag) {
//       this.setState({
//         isEditFlag: false,
//         isLoader: true,
//         PartId: data.Id,
//       })
//       this.props.getAssemblyPartDetail(data.Id, res => {
//         if (res && res.data && res.data.Result) {
//           const Data = res.data.Data;
//           this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')

//           this.setState({ DataToCheck: Data })
//           setTimeout(() => {
//             this.setState({
//               isEditFlag: true,
//               // isLoader: false,
//               effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '',
//               files: Data.Attachements,
//               ChildParts: Data.ChildParts,
//               BOMViewerData: Data.ChildParts,
//             }, () => this.setState({ isLoader: false }))
//           }, 200)
//         }
//       })
//     } else {
//       this.setState({
//         isLoader: false,
//       })
//       this.props.getAssemblyPartDetail('', res => { })
//     }
//   }

//   /**
//   * @method handlePlant
//   * @description Used handle plants
//   */
//   handlePlant = (e) => {
//     this.setState({ selectedPlants: e })
//   }

//   /**
//   * @method handleChange
//   * @description Handle Effective Date
//   */
//   handleEffectiveDateChange = (date) => {
//     this.setState({
//       effectiveDate: date,
//     });
//     this.setState({ DropdownChanged: false })
//   };

//   closeChildDrawer = (e = '', childData = {}) => {
//     this.setState({ isOpenChildDrawer: false }, () => {
//       this.setChildPartsData(childData)
//     })
//   }

//   /**
//   * @method setChildPartsData
//   * @description SET CHILD PARTS DATA IN ASSEMBLY AND BOMViewerData
//   */
//   setChildPartsData = (childData) => {
//     const { BOMViewerData, } = this.state;
//     const tempArray = [];


//     const posX = BOMViewerData && BOMViewerData.length > 0 ? 450 * (BOMViewerData.filter(el => el.Level === 'L1').length - 1) : 50;

//     if (Object.keys(childData).length > 0 && childData.PartType === ASSEMBLY) {
//       this.props.getBOMViewerTreeDataByPartIdAndLevel(childData.PartId, 1, res => {
//         let Data = res.data.Data.FlowPoints;

//         const DeleteNodeL1 = getRandomSixDigit();
//         Data && Data.map(el => {
//           tempArray.push({
//             PartId: childData.PartId,
//             PartType: el.PartType,
//             PartTypeId: el.PartTypeId,
//             PartNumber: el.PartNumber,
//             Input: el.Input,
//             Position: el.Position,
//             Outputs: el.Outputs,
//             InnerContent: el.InnerContent,
//             PartName: el.PartName,
//             Quantity: el.Level === 'L1' ? childData.Quantity : el.Quantity,
//             Level: el.Level,
//             DeleteNodeL1: DeleteNodeL1,
//           })
//           return null;
//         })

//         setTimeout(() => {
//           this.setState({ BOMViewerData: [...BOMViewerData, ...tempArray] }, () => this.getLevelOneNewAddedChild())
//         }, 200)

//       })

//     } else if (Object.keys(childData).length > 0) {

//       tempArray.push(...BOMViewerData, {
//         PartType: childData && childData.PartType ? childData.PartType : '',
//         PartTypeId: childData && childData.PartTypeId ? childData.PartTypeId : '',
//         PartNumber: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
//         Position: { "x": posX, "y": 50 },
//         Outputs: [],
//         InnerContent: childData && childData.InnerContent !== undefined ? childData.InnerContent : '',
//         PartName: childData && childData.PartNumber !== undefined ? childData.PartNumber.label : '',
//         Quantity: childData && childData.Quantity !== undefined ? childData.Quantity : '',
//         Level: 'L1',
//         PartId: childData.PartId,
//         Input: getRandomSixDigit(),
//       })
//       this.setState({ BOMViewerData: tempArray }, () => this.getLevelOneNewAddedChild())
//     }

//   }

//   /**
//   * @method getLevelOneNewAddedChild
//   * @description USED TO GET NEW ADDED LEVEL ONE CHILD IN EDIT MODE
//   */
//   getLevelOneNewAddedChild = () => {
//     const { BOMViewerData, ChildParts } = this.state;

//     let OldChildPartsArray = [];

//     ChildParts && ChildParts.map((el) => {
//       OldChildPartsArray.push(el.PartId)
//       return null;
//     })

//     let NewAddedLevelOneChilds = BOMViewerData && BOMViewerData.filter(el => {
//       if (!OldChildPartsArray.includes(el.PartId) && el.Level === 'L1') {
//         return true;
//       }
//       return false;
//     })
//     this.setState({ NewAddedLevelOneChilds: NewAddedLevelOneChilds })
//   }

//   /**
//   * @method renderListing
//   * @description Used show listing of unit of measurement
//   */
//   renderListing = (label) => {
//     const { plantSelectList } = this.props;
//     const temp = [];

//     if (label === 'plant') {
//       plantSelectList && plantSelectList.map(item => {
//         if (item.Value === '0') return false;
//         temp.push({ Text: item.Text, Value: item.Value })
//         return null;
//       });
//       return temp;
//     }
//   }

//   /**
//   * @method checkIsFormFilled
//   * @description CHECK BOM FORM IS FILLED BEFORE TRIGGER
//   */
//   checkIsFormFilled = () => {
//     const { fieldsObj } = this.props;
//     if (fieldsObj.BOMNumber === undefined ||
//       fieldsObj.AssemblyPartNumber === undefined ||
//       fieldsObj.AssemblyPartName === undefined) {
//       return false;
//     } else {
//       return true;
//     }
//   }

//   /**
//   * @method toggleBOMViewer
//   * @description DISPLAY BOM VIEWER PAGE
//   */
//   toggleBOMViewer = () => {
//     const { fieldsObj } = this.props;
//     const { BOMViewerData, isEditFlag } = this.state;

//     if (this.checkIsFormFilled() === false) {
//       Toaster.warning("Please fill the mandatory fields.")
//       return false;
//     }

//     if (isEditFlag) {
//       this.setState({ isOpenBOMViewerDrawer: true, })
//       return false;
//     }

//     let tempArray = [];
//     let outputArray = [];

//     BOMViewerData && BOMViewerData.map((el, i) => {
//       if (el.Level === 'L1') {
//         outputArray.push(el.Input)
//       }
//       return null;
//     })

//     //CONDITION TO CHECK BOMViewerData STATE HAS FORM DATA
//     let isAvailable = BOMViewerData && BOMViewerData.findIndex(el => el.Level === 'L0')

//     if (isAvailable === -1) {
//       tempArray.push(...BOMViewerData, {
//         PartType: ASSEMBLY,
//         PartNumber: fieldsObj && fieldsObj.AssemblyPartNumber !== undefined ? fieldsObj.AssemblyPartNumber : '',
//         Position: { "x": 750, "y": 50 },
//         Outputs: outputArray,
//         InnerContent: fieldsObj && fieldsObj.Description !== undefined ? fieldsObj.Description : '',
//         PartName: fieldsObj && fieldsObj.AssemblyPartName !== undefined ? fieldsObj.AssemblyPartName : '',
//         Quantity: 1,
//         Level: 'L0',
//         Input: '',
//       })
//       this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })

//     } else {

//       tempArray = Object.assign([...BOMViewerData], {
//         [isAvailable]: Object.assign({}, BOMViewerData[isAvailable], {
//           Outputs: outputArray,
//           PartNumber: fieldsObj && fieldsObj.AssemblyPartNumber !== undefined ? fieldsObj.AssemblyPartNumber : '', //WHEN EDIT FORM
//           PartName: fieldsObj && fieldsObj.AssemblyPartName !== undefined ? fieldsObj.AssemblyPartName : '', //WHEN EDIT FORM
//           InnerContent: fieldsObj && fieldsObj.Description !== undefined ? fieldsObj.Description : '', //WHEN EDIT FORM
//         })
//       })

//       this.setState({ BOMViewerData: tempArray, isOpenBOMViewerDrawer: true, })
//     }

//   }

//   closeBOMViewerDrawer = (e = '', drawerData, isSaved) => {
//     this.setState({ isOpenBOMViewerDrawer: false, BOMViewerData: drawerData, avoidAPICall: isSaved })
//   }

//   // specify upload params and url for your files
//   getUploadParams = ({ file, meta }) => {
//     return { url: 'https://httpbin.org/post', }

//   }

//   // called every time a file's `status` changes
//   handleChangeStatus = ({ meta, file }, status) => {
//     const { files, } = this.state;

//     if (status === 'removed') {
//       const removedFileName = file.name;
//       let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
//       this.setState({ files: tempArr })
//     }

//     if (status === 'done') {
//       let data = new FormData()
//       data.append('file', file)
//       this.props.fileUploadPart(data, (res) => {
//         let Data = res.data[0]
//         const { files } = this.state;
//         files.push(Data)
//         this.setState({ files: files })
//       })
//     }

//     if (status === 'rejected_file_type') {
//       Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
//     }
//   }

//   renderImages = () => {
//     this.state.files && this.state.files.map(f => {
//       const withOutTild = f.FileURL.replace('~', '')
//       const fileURL = `${FILE_URL}${withOutTild}`;
//       return (
//         <div className={'attachment-wrapper images'}>
//           <img src={fileURL} alt={''} />
//           <button
//             type="button"
//             onClick={() => this.deleteFile(f.FileId)}>X</button>
//         </div>
//       )
//     })
//   }

//   deleteFile = (FileId, OriginalFileName) => {
//     if (FileId != null) {
//       let deleteData = {
//         Id: FileId,
//         DeletedBy: loggedInUserId(),
//       }
//       this.props.fileDeletePart(deleteData, (res) => {
//         Toaster.success('File has been deleted successfully.')
//         let tempArr = this.state.files.filter(item => item.FileId !== FileId)
//         this.setState({ files: tempArr })
//       })
//     }
//     if (FileId == null) {
//       let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
//       this.setState({ files: tempArr })
//     }
//   }

//   Preview = ({ meta }) => {
//     return (
//       <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
//         {/* {Math.round(percent)}% */}
//       </span>
//     )
//   }

//   /**
//  * @method cancel
//  * @description used to Reset form
//  */
//   cancel = () => {
//     const { reset } = this.props;
//     reset();
//     this.setState({
//       isEditFlag: false,
//       selectedPlants: [],
//       effectiveDate: '',
//       files: [],
//       BOMViewerData: [],
//     })
//     this.props.getAssemblyPartDetail('', res => { })
//     this.props.hideForm()
//   }

//   /**
//   * @method confirmBOMDraft
//   * @description CONFIRM BOM DRAFT
//   */
//   confirmBOMDraft = (updateData) => {
//     this.setState({showPopup:true, updatedObj:updateData })
//     const toastrConfirmOptions = {
//       onOk: () => {
//         this.confirmDraftItem(updateData)
//       },
//       onCancel: () => { },
//       component: () => <ConfirmComponent />,
//     };
//     // return Toaster.confirm(`${MESSAGES.COSTING_REJECT_ALERT}`, toastrConfirmOptions);
//   }

//   /**
//   * @method confirmDraftItem
//   * @description DRAFT ASSEMBLY BOM
//   */
//   confirmDraftItem = (updateData) => {
//     let Data = { ...updateData, IsForceUpdate: true }
//     this.props.updateAssemblyPart(Data, (res) => {
//       if (res.data.Result) {
//         Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
//         this.cancel()
//       }
//     });
//     this.setState({showPopup:false})
//   }
  
//   onPopupConfirm =() => {
//     updatedObj=this.state
// 		this.confirmDeleteItem(updatedObj);
	   
// 	}
// 	closePopUp= () =>{
// 		this.setState({showPopup:false})
// 		this.setState({showPopupBom:false})
// 	  }
//   /**
//   * @method onSubmit
//   * @description Used to Submit the form
//   */
//   onSubmit = (values) => {
//     const { PartId, isEditFlag, selectedPlants, BOMViewerData, files, avoidAPICall, DataToCheck, DropdownChanged } = this.state;
//     const { actualBOMTreeData, fieldsObj, partData } = this.props;

//     let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))
//     let childPartArray = [];

//     // CONDITION CHANGE FOR (BOMViewerData.length === 0 || BOMViewerData.length === 1)
//     if (BOMViewerData && isEditFlag ? (BOMViewerData.length === 0) : (BOMViewerData.length === 0 || BOMViewerData.length === 1)) {
//       Toaster.warning('Need to add Child parts');
//       return false;
//     }

//     //GET BOMLEVEL COUNT
//     let BOMLevelArrays = BOMViewerData && BOMViewerData.map((el) => {
//       return parseInt(el?.Level.substring(1));
//     })
//     const BOMLevelCount = Math.max.apply(Math, BOMLevelArrays);

//     BOMViewerData && BOMViewerData.map((item) => {
//       if (item.Level === 'L0') return false;
//       if (item.Level === 'L1') {
//         childPartArray.push({
//           PartId: item.PartType && (item.PartType === ASSEMBLY || item.PartType === COMPONENT_PART) ? item.PartId : '',
//           ParentPartId: isEditFlag ? PartId : '',
//           BoughtOutPartId: item.PartType && item.PartType === BOUGHTOUTPART ? item.PartId : '',
//           PartTypeId: item.PartTypeId ? item.PartTypeId : '',
//           PartType: item.PartType ? item.PartType : '',
//           BOMLevel: 1,
//           Quantity: item.Quantity,
//         })
//       }
//       return childPartArray;
//     })

//     if (isEditFlag) {


//       // if (DropdownChanged && DataToCheck.AssemblyPartName == values.AssemblyPartName && DataToCheck.Description == values.Description &&
//       //   DataToCheck.ECNNumber == values.ECNNumber && DataToCheck.RevisionNumber == values.RevisionNumber &&
//       //   DataToCheck.DrawingNumber == values.DrawingNumber && DataToCheck.GroupCode == values.GroupCode) {
//       //   this.cancel()
//       //   return false;
//       // }
//       let updatedFiles = files.map((file) => {
//         return { ...file, ContextId: PartId }
//       })
//       let updateData = {
//         LoggedInUserId: loggedInUserId(),
//         AssemblyPartId: PartId,
//         AssemblyPartName: values.AssemblyPartName,
//         AssemblyPartNumber: values.AssemblyPartNumber,
//         Description: values.Description,
//         ECNNumber: values.ECNNumber,
//         RevisionNumber: values.RevisionNumber,
//         DrawingNumber: values.DrawingNumber,
//         GroupCode: values.GroupCode,
//         EffectiveDate: moment(this.state.effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
//         Remark: values.Remark,
//         Plants: plantArray,
//         Attachements: updatedFiles,
//         ChildParts: childPartArray,
//         NumberOfChildParts: BOMViewerData && avoidAPICall ? BOMViewerData.length - 1 : partData.NumberOfChildParts,
//         IsForcefulUpdated: true,
//         BOMLevelCount: BOMLevelCount,
//       }

//       if (JSON.stringify(BOMViewerData) !== JSON.stringify(actualBOMTreeData) && avoidAPICall && isEditFlag) {
//         if (fieldsObj.ECNNumber === partData.ECNNumber && fieldsObj.RevisionNumber === partData.RevisionNumber) {
//           this.confirmBOMDraft(updateData)
//           return false;
//         }
//       }

//       if (isEditFlag) {

//         const toastrConfirmOptions = {
//           onOk: () => {
//             this.props.reset()
//             this.props.updateAssemblyPart(updateData, (res) => {
//               if (res.data.Result) {
//                 Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
//                 this.cancel()
//               }
//             });
//           },
//           onCancel: () => { },
//           component: () => <ConfirmComponent />,
//         }
//         // return Toaster.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
//       }


//     } else {

//       let formData = {
//         AssemblyPartNumber: values.AssemblyPartNumber,
//         AssemblyPartName: values.AssemblyPartName,
//         AssemblyPartId: '',
//         ChildParts: childPartArray,
//         LoggedInUserId: loggedInUserId(),
//         BOMNumber: values.BOMNumber,
//         Remark: values.Remark,
//         Description: values.Description,
//         ECNNumber: values.ECNNumber,
//         EffectiveDate: moment(this.state.effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
//         RevisionNumber: values.RevisionNumber,
//         DrawingNumber: values.DrawingNumber,
//         GroupCode: values.GroupCode,
//         Plants: plantArray,
//         Attachements: files,
//         NumberOfChildParts: BOMViewerData && BOMViewerData.length - 1,
//         BOMLevelCount: BOMLevelCount,
//       }

//       this.props.reset()
//       this.props.createAssemblyPart(formData, (res) => {
//         if (res.data.Result === true) {
//           Toaster.success(MESSAGES.ASSEMBLY_PART_ADD_SUCCESS);
//           this.cancel()
//         }
//       });
//     }
//   }

//   handleKeyDown = function (e) {
//     if (e.key === 'Enter' && e.shiftKey === false) {
//       e.preventDefault();
//     }
//   };
//   onPopupConfirmBom = ()=> {
//     this.props.reset()
//     this.props.updateAssemblyPart(this.state.updatedObjBom, (res) => {
//       if (res.data.Result) {
//         Toaster.success(MESSAGES.UPDATE_BOM_SUCCESS);
//         this.cancel()
//       }
//     });
//   }
//   /**
//   * @method render
//   * @description Renders the component
//   */
//   render() {
//     const { handleSubmit, initialConfiguration } = this.props;
//     const { isEditFlag, isOpenChildDrawer, isOpenBOMViewerDrawer, } = this.state;
//     return (
//       <>
//         {this.state.isLoader && <LoaderCustom />}
//         <div className="container-fluid">
//           <div className="login-container signup-form">
//             <Row>
//               <Col md="12">
//                 <div className="shadow-lgg login-formg">
//                   <Row>
//                     <Col md="6">
//                       <div className="form-heading mb-0">
//                         <h1>
//                           {isEditFlag
//                             ? "Update Assembly Product"
//                             : "Add  Assembly Product"}
//                         </h1>
//                       </div>
//                     </Col>
//                   </Row>
//                   <form
//                     noValidate
//                     className="form"
//                     onSubmit={handleSubmit(this.onSubmit.bind(this))}
//                     onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
//                   >
//                     <div className="add-min-height">
//                       <Row>
//                         <Col md="12">
//                           <div className="left-border">
//                             {"Assembly Details:"}
//                           </div>
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`BOM No.`}
//                             name={"BOMNumber"}
//                             type="text"
//                             placeholder={""}
//                             validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
//                             component={renderText}
//                             required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                             disabled={isEditFlag ? true : false}
//                           />
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`Assembly Part No.`}
//                             name={"AssemblyPartNumber"}
//                             type="text"
//                             placeholder={""}
//                             validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength20]}
//                             component={renderText}
//                             required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                             disabled={isEditFlag ? true : false}
//                           />
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`Assembly Name`}
//                             name={"AssemblyPartName"}
//                             type="text"
//                             placeholder={""}
//                             validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces]}
//                             component={renderText}
//                             required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                           />
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`Description`}
//                             name={"Description"}
//                             type="text"
//                             placeholder={""}
//                             validate={[maxLength80, checkWhiteSpaces]}
//                             component={renderText}
//                             required={false}
//                             className=""
//                             customClassName={"withBorder"}
//                           />
//                         </Col>
//                       </Row>

//                       <Row>
//                         <Col md="3">
//                           <Field
//                             label={`ECN No.`}
//                             name={"ECNNumber"}
//                             type="text"
//                             placeholder={""}
//                             validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
//                             component={renderText}
//                             //required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                           />
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`Revision No.`}
//                             name={"RevisionNumber"}
//                             type="text"
//                             placeholder={""}
//                             validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
//                             component={renderText}
//                             //required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                           />
//                         </Col>
//                         <Col md="3">
//                           <Field
//                             label={`Drawing No.`}
//                             name={"DrawingNumber"}
//                             type="text"
//                             placeholder={""}
//                             validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces]}
//                             component={renderText}
//                             //required={true}
//                             className=""
//                             customClassName={"withBorder"}
//                           />
//                         </Col>
//                         {initialConfiguration &&
//                           initialConfiguration?.IsGroupCodeDisplay && (
//                             <Col md="3">
//                               <Field
//                                 label={`Group Code`}
//                                 name={"GroupCode"}
//                                 type="text"
//                                 placeholder={""}
//                                 validate={[checkWhiteSpaces, alphaNumeric, maxLength20]}
//                                 component={renderText}
//                                 //required={true}
//                                 className=""
//                                 customClassName={"withBorder"}
//                               />
//                             </Col>
//                           )}
//                       </Row>

//                       <Row>
//                         {/* <Col md="3">
//                           <Field
//                             label="Plant"
//                             name="Plant"
//                             placeholder={"Select"}
//                             selection={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
//                             options={this.renderListing("plant")}
//                             selectionChanged={this.handlePlant}
//                             optionValue={(option) => option.Value}
//                             optionLabel={(option) => option.Text}
//                             component={renderMultiSelectField}
//                             //mendatory={true}
//                             className="multiselect-with-border"
//                             disabled={isEditFlag ? true : false}
//                           />
//                         </Col> */}
//                         <Col md="3">
//                           <div className="form-group">
//                             {/* <label>
//                               Effective Date */}
//                             {/* <span className="asterisk-required">*</span> */}
//                             {/* </label> */}
//                             <div className="inputbox date-section">
//                               {/* <DatePicker
//                                 name="EffectiveDate"
//                                 selected={this.state.effectiveDate}
//                                 onChange={this.handleEffectiveDateChange}
//                                 showMonthDropdown
//                                 showYearDropdown
//                                 dateFormat="dd/MM/yyyy"
//                                 //maxDate={new Date()}
//                                 dropdownMode="select"
//                                 placeholderText="Select date"
//                                 className="withBorder"
//                                 autoComplete={"off"}
//                                 disabledKeyboardNavigation
//                                 onChangeRaw={(e) => e.preventDefault()}
//                                 disabled={isEditFlag ? true : false}
//                               /> */}
//                               <Field
//                                 label="Effective Date"
//                                 name="EffectiveDate"
//                                 selected={this.state.effectiveDate}
//                                 onChange={this.handleEffectiveDateChange}
//                                 type="text"
//                                 validate={[required]}
//                                 autoComplete={'off'}
//                                 required={true}
//                                 changeHandler={(e) => {
//                                   //e.preventDefault()
//                                 }}
//                                 component={renderDatePicker}
//                                 className="form-control"
//                                 disabled={isEditFlag ? getConfigurationKey().IsBOMEditable ? false : true : false}
//                               //minDate={moment()} 
//                               />
//                             </div>
//                           </div>
//                         </Col>
//                         <Col md="3">
//                           <button
//                             type="button"
//                             onClick={this.toggleBOMViewer}
//                             className={"user-btn pull-left mt30"}>
//                             <div className={"plus"}></div>VIEW BOM
//                               </button>
//                         </Col>
//                       </Row>

//                       <Row>
//                         <Col md="12">
//                           <div className="left-border">
//                             {"Remarks & Attachments:"}
//                           </div>
//                         </Col>
//                         <Col md="6">
//                           <Field
//                             label={"Remarks"}
//                             name={`Remark`}
//                             placeholder="Type here..."
//                             className=""
//                             customClassName=" textAreaWithBorder"
//                             validate={[maxLength512, checkWhiteSpaces]}
//                             //required={true}
//                             component={renderTextAreaField}
//                             maxLength="5000"
//                           />
//                         </Col>
//                         <Col md="3">
//                           <label>Upload Files (upload up to 3 files)</label>
//                           {this.state.files &&
//                             this.state.files.length >= 3 ? (
//                             <div class="alert alert-danger" role="alert">
//                               Maximum file upload limit has been reached.
//                             </div>
//                           ) : (
//                             <Dropzone
//                               getUploadParams={this.getUploadParams}
//                               onChangeStatus={this.handleChangeStatus}
//                               PreviewComponent={this.Preview}
//                               //onSubmit={this.handleSubmit}
//                               accept="*"
//                               initialFiles={this.state.initialFiles}
//                               maxFiles={3}
//                               maxSizeBytes={2000000}
//                               inputContent={(files, extra) =>
//                                 extra.reject ? (
//                                   "Image, audio and video files only"
//                                 ) : (
//                                   <div className="text-center">
//                                     <i className="text-primary fa fa-cloud-upload"></i>
//                                     <span className="d-block">
//                                       Drag and Drop or{" "}
//                                       <span className="text-primary">
//                                         Browse
//                                           </span>
//                                       <br />
//                                           file to upload
//                                         </span>
//                                   </div>
//                                 )
//                               }
//                               styles={{
//                                 dropzoneReject: {
//                                   borderColor: "red",
//                                   backgroundColor: "#DAA",
//                                 },
//                                 inputLabel: (files, extra) =>
//                                   extra.reject ? { color: "red" } : {},
//                               }}
//                               classNames="draper-drop"
//                             />
//                           )}
//                         </Col>
//                         <Col md="3">
//                           <div className={"attachment-wrapper"}>
//                             {this.state.files &&
//                               this.state.files.map((f) => {
//                                 const withOutTild = f.FileURL.replace(
//                                   "~",

//                                   ""
//                                 );
//                                 const fileURL = `${FILE_URL}${withOutTild}`;
//                                 return (
//                                   <div className={"attachment images"}>
//                                     <a href={fileURL} target="_blank" rel="noreferrer">
//                                       {f.OriginalFileName}
//                                     </a>
//                                     {/* <a href={fileURL} target="_blank" download={f.FileName}>
//                                                                         <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
//                                                                     </a> */}
//                                     {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
//                                                                         <img src={fileURL} height={50} width={100} />
//                                                                     </div> */}

//                                     <img
//                                       alt={""}
//                                       className="float-right"
//                                       onClick={() =>
//                                         this.deleteFile(
//                                           f.FileId,
//                                           f.FileName
//                                         )
//                                       }
//                                       src={imgRedcross}
//                                     ></img>
//                                   </div>
//                                 );
//                               })}
//                           </div>
//                         </Col>
//                       </Row>
//                     </div>

//                     <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
//                       <div className="col-sm-12 text-right bluefooter-butn">
//                         <button
//                           type={"button"}
//                           className=" mr15 cancel-btn"
//                           onClick={this.cancel}
//                         >
//                           <div className={"cancel-icon"}></div>
//                           {"Cancel"}
//                         </button>
//                         <button
//                           type="submit"
//                           className="user-btn mr5 save-btn"
//                         >
//                           <div className={"save-icon"}></div>
//                           {isEditFlag ? "Update" : "Save"}
//                         </button>
//                       </div>
//                     </Row>
//                   </form>
//                 </div>
//               </Col>
//             </Row>
//           </div>

//           {isOpenChildDrawer && (
//             <AddChildDrawerProduct
//               isOpen={isOpenChildDrawer}
//               closeDrawer={this.closeChildDrawer}
//               isEditFlag={false}
//               ID={""}
//               anchor={"right"}
//               setChildPartsData={this.setChildPartsData}
//               BOMViewerData={this.state.BOMViewerData}
//             />
//           )}

//           {isOpenBOMViewerDrawer && (
//             <BOMViewerProduct
//               isOpen={isOpenBOMViewerDrawer}
//               closeDrawer={this.closeBOMViewerDrawer}
//               isEditFlag={this.state.isEditFlag}
//               PartId={this.state.PartId}
//               anchor={"right"}
//               BOMViewerData={this.state.BOMViewerData}
//               NewAddedLevelOneChilds={this.state.NewAddedLevelOneChilds}
//               isFromVishualAd={false}
//               avoidAPICall={this.state.avoidAPICall}
//             />
//           )}
//           	{
//                 this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.COSTING_REJECT_ALERT}`}  />
//                 }
//           	{
//                 this.state.showPopupBom && <PopupMsgWrapper isOpen={this.state.showPopupBom} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirmBom} message={`You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?`}  />
//                 }
//         </div>
//       </>
//     );
//   }
// }

// /**
// * @method mapStateToProps
// * @description return state to component as props
// * @param {*} state
// */
// function mapStateToProps(state) {
//   const fieldsObj = selector(state, 'BOMNumber', 'AssemblyPartNumber', 'AssemblyPartName', 'ECNNumber', 'RevisionNumber',
//     'Description', 'DrawingNumber', 'GroupCode', 'Remark')
//   const { comman, part, auth } = state;
//   const { plantSelectList } = comman;
//   const { partData, actualBOMTreeData } = part;
//   const { initialConfiguration } = auth;

//   let initialValues = {};
//   if (partData && partData !== undefined) {
//     initialValues = {
//       BOMNumber: partData.BOMNumber,
//       AssemblyPartNumber: partData.AssemblyPartNumber,
//       AssemblyPartName: partData.AssemblyPartName,
//       Description: partData.Description,
//       ECNNumber: partData.ECNNumber,
//       RevisionNumber: partData.RevisionNumber,
//       DrawingNumber: partData.DrawingNumber,
//       GroupCode: partData.GroupCode,
//       Remark: partData.Remark,
//     }
//   }

//   return { plantSelectList, partData, actualBOMTreeData, fieldsObj, initialValues, initialConfiguration, }

// }

// /**
// * @method connect
// * @description connect with redux
// * @param {function} mapStateToProps
// * @param {function} mapDispatchToProps
// */
// export default connect(mapStateToProps, {
//   getPlantSelectListByType,
//   fileUploadPart,
//   fileDeletePart,
//   createAssemblyPart,
//   updateAssemblyPart,
//   getAssemblyPartDetail,
//   getBOMViewerTreeDataByPartIdAndLevel,
// })(reduxForm({
//   form: 'AddAssemblyProduct',
//   onSubmitFail: errors => {

//     focusOnError(errors);
//   },
//   enableReinitialize: true,
// })(AddAssemblyProduct));
