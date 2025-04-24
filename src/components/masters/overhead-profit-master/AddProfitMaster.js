import React, { useEffect, useRef, useState, } from 'react';
import { Row, Col, Label } from 'reactstrap';
import { required, getCodeBySplitting, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, maxLength512, acceptAllExceptSingleSpecialCharacter, validateFileName } from "../../../helper";
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { CBCTypeId, FILE_URL, GUIDE_BUTTON_SHOW, PROFITMASTER, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import { TextAreaHookForm } from '../../layout/HookFormInputs';
import { debounce } from 'lodash'
import { LabelsClass } from '../../../helper/core';
import AddOverheadMasterDetails from './AddOverheadMasterDetails';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { getConfigurationKey, loggedInUserId, showBopLabel } from "../../../helper/auth";
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import {
  createProfit, updateProfit, getProfitData, fileUploadProfit,
  getProfitDataCheck,
} from '../actions/OverheadProfit';
import { fetchApplicabilityList, fetchCostingHeadsAPI, getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material'
import { getCostingConditionTypes, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions';
import { getClientSelectList, } from '../actions/Client';
import DayTime from '../../common/DayTimeWrapper';
import { ASSEMBLY } from '../../../config/masterData';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useTranslation } from 'react-i18next';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';


const AddProfitMaster = (props) => {
    const dropzoneRef = useRef(null);
    const { t } = useTranslation("MasterLabels");
    const { plantSelectList, modelType, handleModelTypeChange } = props
    const dispatch = useDispatch();
    const conditionTypeId = getCostingConditionTypes(PROFITMASTER);
    const clientSelectList = useSelector((state) => state.client.clientSelectList);

    const [state, setState] = useState({
        ProfitID: "",
        Plant: "",
        clientName: "",
        EffectiveDate: "",
        OverheadApplicability: {},
        OverheadPercentage: "",
        ApplicabilityDetails: [],
        isAssemblyCheckbox: false,
        costingTypeId: ZBCTypeId,
        selectedPlants: [],
        vendorName: [],
        vendorCode: '',
        client: [],
        singlePlantSelected: [],
        ModelType: [],
        DataToChange: [],
        IsFinancialDataChanged: true,
        showPopup: false,
        isEditFlag: false,
        isViewMode: props?.data?.isViewMode ? true : false, 
        remarks: "",
        files: [],
        uploadAttachements: true,
        setDisable: false,
        attachmentLoader: false,
        inputLoader: false,
        vendorFilterList: [],
        RawMaterial: [],
        RMGrade: [],
        RMSpec: [],
        DropdownNotChanged: true,
        minEffectiveDate: ''
    })

    const {isEditFlag, isViewMode, files, uploadAttachements, setDisable, attachmentLoader, selectedPlants, vendorName, vendorCode, client, singlePlantSelected, costingTypeId, ModelType} = state
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    const { register, handleSubmit, control, setValue, getValues, reset, trigger, clearErrors, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            // defaultValues: defaultValues,
    })

    useEffect(() => {
        setState(prev => ({ ...prev, costingTypeId: getCostingTypeIdByCostingPermission() }));
        if (getCostingTypeIdByCostingPermission() === CBCTypeId) {
          dispatch(getClientSelectList(() => { }));
        }
        if (getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC) {
          dispatch(getRawMaterialNameChild(() => { }));
        }
        dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }));
        dispatch(fetchApplicabilityList(null, conditionTypeId, false, res => {

         }));
        getDetails();
    }, [])

    useEffect(() => {
      if (!(props?.data?.isEditFlag || state.isViewMode)) {
        const hasRequiredFields = (
          (state.costingTypeId === ZBCTypeId) ||
          (state.costingTypeId === CBCTypeId && state?.client) ||
          (state.costingTypeId === VBCTypeId && state?.vendorName)
        );
        if (hasRequiredFields && state?.EffectiveDate && state?.selectedPlants && !(Object.keys(state?.DataToChange).length > 0)) {
          let data = {
            profitId: state?.ProfitID ?? null,
            modelTypeId: state?.ModelType?.value,
            costingHeadId: state?.costingTypeId,
            plantId: state?.selectedPlants[0]?.value ?? null,
            vendorId: state?.costingTypeId === VBCTypeId ? state?.vendorName.value : null,
            customerId: state?.costingTypeId === CBCTypeId ? state?.client.value : null,
            effectiveDate: DayTime(state?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            technologyId: state.isAssemblyCheckbox ? ASSEMBLY : null
          }
          dispatch(getProfitDataCheck(data, (res) => {
            if (res?.status === 200) {
              let Data = res?.data?.Data;
              if(Object.keys(Data).length > 0){
                setDetails(Data);
              }
            }
          }));
        }
      }
    }, [state?.costingTypeId, state?.ModelType, state?.selectedPlants, state?.vendorName, state?.client, state?.EffectiveDate, state.isAssemblyCheckbox]);


    const setDetails = (Data) => {
      setState(prev => ({ ...prev, DataToChange: Data }));
      setState(prev => ({ ...prev, minEffectiveDate: DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '' }));
      setTimeout(() => {
        setValue("ModelType", { label: Data.ModelType, value: Data.ModelTypeId })
        setValue("isAssemblyCheckbox", Data.TechnologyId === ASSEMBLY ? true : false)
        setValue("Remark", Data.Remark)
        setValue("costingTypeId", Data.CostingTypeId)
        setValue("clientName", Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [])
        setValue("vendorName", Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [])
        setValue("Plant", Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [])
        setValue("DestinationPlant", Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {})
        // setValue("EffectiveDate", Data.EffectiveDate && DayTime(Data?.EffectiveDate).isValid() ? DayTime(Data?.EffectiveDate) : '')
        setValue("EffectiveDate", DayTime(Data?.EffectiveDate).isValid() ? new Date(Data?.EffectiveDate) : '')

        setState(prev => ({ ...prev, 
            IsFinancialDataChanged: false,
            isEditFlag: true,
            costingTypeId: Data.CostingTypeId,
            ModelType: Data.ModelType !== undefined ? { label: Data.ModelType, value: Data.ModelTypeId } : [],
            vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: `${Data.VendorName}`, value: Data.VendorId } : [],
            client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
            remarks: Data.Remark,
            files: Data.Attachements,
            EffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
            selectedPlants: Data && Data.Plants[0] && Data.Plants[0].PlantId ? [{ label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId }] : [],
            singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? { label: Data.Plants[0]?.PlantName, value: Data.Plants[0]?.PlantId } : {},
            RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
            RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
            isAssemblyCheckbox: Data.TechnologyId === ASSEMBLY ? true : false,
            ApplicabilityDetails: Data.ApplicabilityDetails
        }));

        let files = Data.Attachements && Data.Attachements.map((item) => {
          item.meta = {}
          item.meta.id = item.FileId
          item.meta.status = 'done'
          return item
        })
        if (dropzoneRef.current !== null) {
            dropzoneRef.current.files = files
        }
      }, 500)
    }


    const getDetails = () => {
        const { data } = props;
        if (data && data.isEditFlag) {
            setState(prev => ({ ...prev, isEditFlag: false, isLoader: true, ProfitID: data.Id, }));
            dispatch(getProfitData(data.Id, res => {
            if (res && res.data && res.data.Result) {
              const Data = res.data.Data;
              setDetails(Data);
            }
          }
        ));
        } else {
          setState(prev => ({ ...prev, isLoader: false }));
          dispatch(getProfitData('', res => { }))
        }
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

  const onSubmit = debounce(handleSubmit((values) => {
      const { client, costingTypeId, ModelType, vendorName, selectedPlants, remarks, ProfitID, RMGrade, ApplicabilityDetails,
        singlePlantSelected, isEditFlag, files, EffectiveDate, DataToChange, DropdownNotChanged, uploadAttachements, RawMaterial, IsFinancialDataChanged } = state;
      const userDetailsProfit = JSON.parse(localStorage.getItem('userDetail'))
      let plantArray = []
      if (costingTypeId === VBCTypeId) {
        plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value })
      } else {
        selectedPlants && selectedPlants.map((item) => {
          plantArray.push({ PlantName: item.label, PlantId: item.value })
          return plantArray
        })
      }
      let cbcPlantArray = []
      if (getConfigurationKey().IsCBCApplicableOnPlant && costingTypeId === CBCTypeId) {
        cbcPlantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
      }
      else {
        userDetailsProfit?.Plants.map((item) => {
          cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
          return cbcPlantArray
        })
      }
      if (vendorName.length <= 0) {
  
        if (costingTypeId === VBCTypeId) {
          setState(prev => ({ ...prev, isVendorNameNotSelected: true, setDisable: false })); // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
          return false
        }
      }
      setState(prev => ({ ...prev, isVendorNameNotSelected: false }));
      if (isEditFlag) {
        if (
            (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements)) && DropdownNotChanged 
              && (JSON.stringify(ApplicabilityDetails) === JSON.stringify(DataToChange.ApplicabilityDetails))
            && String(DataToChange.Remark) === String(values.Remark) && uploadAttachements
          ) {
              Toaster.warning('Please change the data to save Overhead Details')
              return false
            }
        setState(prev => ({ ...prev, setDisable: true }));
        let updatedFiles = files.map((file) => {
          return { ...file, ContextId: ProfitID }
        })
        let requestData = {
          ProfitId: ProfitID,
          VendorName: costingTypeId === VBCTypeId ? vendorName.label : '',
          IsClient: costingTypeId === CBCTypeId ? true : false,
          CustomerName: costingTypeId === CBCTypeId ? client.label : '',
          ModelType: ModelType.label,
          CostingTypeId: costingTypeId,
          Remark: remarks,
          VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
          VendorCode: state.vendorCode ? state.vendorCode : "",
          CustomerId: costingTypeId === CBCTypeId ? client.value : '',
          ModelTypeId: ModelType.value,
          IsActive: true,
          CreatedDate: '',
          CreatedBy: loggedInUserId(),
          Attachements: updatedFiles,
          EffectiveDate: DayTime(EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
          IsForcefulUpdated: true,
          Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
          RawMaterialChildId: RawMaterial?.value,
          RawMaterialName: RawMaterial?.label,
          RawMaterialGradeId: RMGrade?.value,
          RawMaterialGrade: RMGrade?.label,
          IsFinancialDataChanged: IsFinancialDataChanged,
          ApplicabilityDetails: ApplicabilityDetails
        }
        if (isEditFlag && IsFinancialDataChanged) {
          if (DayTime(EffectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(DataToChange?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')) {
            Toaster.warning('Please update the effective date')
            setState(prev => ({ ...prev, setDisable: false }));
            return false
          }
        }
        dispatch(updateProfit(requestData, (res) => {
          setState(prev => ({ ...prev, setDisable: false }));
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.PROFIT_UPDATE_SUCCESS);
            cancel('submit')
          }
        }));
      } else {
        setState(prev => ({ ...prev, setDisable: true }));
        const formData = {
          EAttachementEntityName: 0,
          CostingTypeId: costingTypeId,
          Remark: remarks,
          VendorId: costingTypeId === VBCTypeId ? vendorName.value : '',
          VendorCode: costingTypeId === VBCTypeId ? getCodeBySplitting(vendorName.label) : '',
          CustomerId: costingTypeId === CBCTypeId ? client.value : '',
          ModelTypeId: ModelType.value,
          IsActive: true,
          CreatedDate: '',
          CreatedBy: loggedInUserId(),
          Attachements: files,
          EffectiveDate: DayTime(EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
          Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
          RawMaterialChildId: RawMaterial?.value,
          RawMaterialName: RawMaterial?.label,
          RawMaterialGradeId: RMGrade?.value,
          RawMaterialGrade: RMGrade?.label,
          IsFinancialDataChanged: IsFinancialDataChanged,
          TechnologyId: state.isAssemblyCheckbox ? ASSEMBLY : null,
          ApplicabilityDetails: ApplicabilityDetails
        }

        dispatch(createProfit(formData, (res) => {
          setState(prev => ({ ...prev, setDisable: false }));
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.PROFIT_ADDED_SUCCESS);
            cancel('submit');
          }
        }));
      }
  }, (errors) => { 
      console.log( errors);  // Check if there are validation errors
  }),  500);

    const handleApplicabilityChange = (e) => {
        setState(prev => ({ ...prev, OverheadApplicability: e }));
        setValue("OverheadApplicability", e)
    }

    const handleMessageChange = (e) => {
      setValue("Remark", e?.target?.value);
      setState(prev => ({ ...prev, remarks: e?.target?.value }));
    }

    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
          let tempArr = files.filter((item) => item.FileId !== FileId)
          setState(prev => ({ ...prev, files: tempArr }));
        }
        if (FileId == null) {
          let tempArr = files.filter(
            (item) => item.FileName !== OriginalFileName,
          )
          setState(prev => ({ ...prev, files: tempArr }));
        }
    
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzoneRef?.current !== null) {
          dropzoneRef.current.files.pop()
        }
    }

    const setDisableFalseFunction = () => {
        const loop = Number(dropzoneRef.current.files.length) - Number(files.length)
        if (Number(loop) === 1 || Number(dropzoneRef.current.files.length) === Number(files.length)) {
          setState(prev => ({ ...prev, setDisable: false, attachmentLoader: false }));
        }
    }

    const handleChangeStatus = ({ meta, file, remove }, status) => {
        setState(prev => ({ ...prev, uploadAttachements: false, setDisable: true, attachmentLoader: true }));
        if (status === 'removed') {
          deleteFile(
            file.id,
            file.name
          )
        }
        if (status === 'done') {
          let data = new FormData()
          data.append('file', file)
          if (!validateFileName(file.name)) {
            dropzoneRef.current.files.pop()
            setDisableFalseFunction()
            return false;
          }
          dispatch(fileUploadProfit(data, (res) => {
            if (res && res?.status !== 200) {
                dropzoneRef.current.files.pop()
              setDisableFalseFunction()
              return false
            }
            setDisableFalseFunction()
            if ('response' in res) {
              status = res && res?.response?.status
              dropzoneRef.current.files.pop()
              setState(prev => ({ ...prev, setDisable: false, attachmentLoader: false }));
              dropzoneRef.current.files.pop() // Remove the failed file from dropzone
              setState(prev => ({ ...prev, files: [...state.files] })); // Trigger re-render with current files
              Toaster.warning('File upload failed. Please try again.')
            }
            else {
              let Data = res.data[0]
            //   const { files } = this.state;
              let attachmentFileArray = [...files]
              attachmentFileArray.push(Data)
              setState(prev => ({ ...prev, attachmentLoader: false, files: attachmentFileArray }));
              setTimeout(() => {
                // this.setState(prevState => ({ isOpen: !prevState.isOpen }))
                // setState(prev => ({ ...prev, isOpen: !isOpen }));
              }, 500);
            }
          }))
        }
    
        if (status === 'rejected_file_type') {
          setDisableFalseFunction()
          Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        } else if (status === 'error_file_size') {
          setDisableFalseFunction()
          dropzoneRef.current.files.pop()
          Toaster.warning("File size greater than 2 mb not allowed")
        } else if (status === 'error_validation'
          || status === 'error_upload_params' || status === 'exception_upload'
          || status === 'aborted' || status === 'error_upload') {
          setDisableFalseFunction()
          dropzoneRef.current.files.pop()
          Toaster.warning("Something went wrong")
        }
    }

    const Preview = ({ meta }) => {
        return (
          <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontColor: 'WHITE' }}>
            {/* {Math.round(percent)}% */}
          </span>
        )
    }

    const onPressVendor = (costingHeadFlag) => {
      const fieldsToClear = [
        'vendorName',
        'EffectiveDate',
        'ModelType',
        'Plant',
        'DestinationPlant',
        'clientName',
        'OverheadApplicability',
        'RawMaterialGradeId',
        'OverheadPercentage',
        'RawMaterialId',
      ];
    
      fieldsToClear.forEach(fieldName => {
        setValue(fieldName, ''); // or null depending on your field type
      });
    
      // clear any related field errors if needed
      clearErrors(fieldsToClear);
    
      // update component-level state
      setState(prev => ({
        ...prev,
        vendorName: [],
        costingTypeId: costingHeadFlag,
      }));
    
      if (costingHeadFlag === CBCTypeId) {
        dispatch(getClientSelectList(() => {}));
      }
    };

    const cancel = (type) => {
        reset();
        setState(prev => ({ ...prev, remarks: '', IsVendor: false, ModelType: [], vendorName: [] }));
        dispatch(getProfitData('', res => { }))
        props.hideForm(type)
    }

    const cancelHandler = () => {
      if (state.isViewMode) {
        cancel('cancel')
      } else {
        setState(prev => ({ ...prev, showPopup: true }));
      }
    }

    const onPopupConfirm = () => {
      cancel('cancel')
      setState(prev => ({ ...prev, showPopup: false }));
    }
    const closePopUp = () => {
      setState(prev => ({ ...prev, showPopup: false }));
    }


    return (
      <>
      <div className="container-fluid">
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <h1>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Profit Details
                      {/* {!isViewMode && <TourWrapper
                        buttonSpecificProp={{ id: "Add_Overhead_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t, { isEditFlag: isEditFlag, vendorField: (costingTypeId === VBCTypeId), customerField: (costingTypeId === CBCTypeId), plantField: (costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate), destinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant), isHideOverhead: isHideOverhead, isHideBOP: isHideBOP, isHideRM: isHideRM, isHideCC: isHideCC, isOverheadPercent: isOverheadPercent, isRM: isRM, isCC: isCC, isBOP: isBOP }).ADD_OVERHEADS_DETAILS
                        }} />} */}
                    </h1>
                  </div>
                </div>

                <form noValidate className="form"
                  onSubmit={handleSubmit(onSubmit)}
                  onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}
                >
                  <Row>
                    <Col md="12">
                      {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="AddOverhead_zerobased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                        <input
                          type="radio"
                          name="costingHead"
                          checked={
                            costingTypeId === ZBCTypeId ? true : false
                          }
                          onClick={() =>
                            onPressVendor(ZBCTypeId)
                          }
                          disabled={isEditFlag ? true : false}
                        />{" "}
                        <span>Zero Based</span>
                      </Label>}
                      {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="AddOverhead_vendorbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                        <input
                          type="radio"
                          name="costingHead"
                          checked={
                            costingTypeId === VBCTypeId ? true : false
                          }
                          onClick={() =>
                            onPressVendor(VBCTypeId)
                          }
                          disabled={isEditFlag ? true : false}
                        />{" "}
                        <span>{VendorLabel} Based</span>
                      </Label>}
                      {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddOverhead_customerbased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                        <input
                          type="radio"
                          name="costingHead"
                          checked={
                            costingTypeId === CBCTypeId ? true : false
                          }
                          onClick={() =>
                            onPressVendor(CBCTypeId)
                          }
                          disabled={isEditFlag ? true : false}
                        />{" "}
                        <span>Customer Based</span>
                      </Label>}
                    </Col>
                  </Row>

                    <AddOverheadMasterDetails 
                      costingTypeId={costingTypeId}
                      ModelType={ModelType}
                      handleApplicabilityChange={handleApplicabilityChange}
                      state={state}
                      setState={setState}
                      register={register}
                      control={control}
                      setValue={setValue}
                      getValues={getValues}
                      errors={errors}
                      isOverHeadMaster={false}
                    />

                    <Row>
                        <Col md="12">
                            <div className="left-border">
                            {"Remarks & Attachments:"}
                            </div>
                        </Col>
                        <Col md="6">
                            <div className="input-group form-group col-md-12">
                                <TextAreaHookForm
                                    label="Remarks"
                                    name={'Remark'}
                                    placeholder={isViewMode ? '-' : "Type here..."}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        validate: {
                                            maxLength512, acceptAllExceptSingleSpecialCharacter
                                        }
                                    }}
                                    handleChange={handleMessageChange}
                                    customClassName={'textAreaWithBorder'}
                                    errors={errors.remark}
                                    disabled={isViewMode}
                                />
                            </div>
                        </Col>

                        <Col md="3">
                            <label>Upload Files (upload up to {getConfigurationKey()?.MaxMasterFilesToUpload} files) <AttachmentValidationInfo /></label>
                            <div className={`alert alert-danger mt-2 ${files.length === getConfigurationKey()?.MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                            </div>
                            <div id="AddOverhead_UploadFiles" className={`${files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                            <Dropzone
                                ref={dropzoneRef}
                                onChangeStatus={handleChangeStatus}
                                PreviewComponent={Preview}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                // initialFiles={this.state.initialFiles}
                                maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
                                disabled={isViewMode}
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
                            />
                            </div>
                        </Col>

                        <Col md="3">
                            <div className={"attachment-wrapper"}>
                            {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                            {files &&
                                files.map((f) => {
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
                                            deleteFile(
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

                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                        <button id="AddOverhead_Cancel"
                            type={"button"}
                            className=" mr15 cancel-btn"
                            onClick={cancelHandler}
                            disabled={setDisable}
                        >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                        </button>
                        {/* <button onClick={this.options}>13</button> */}
                        {!isViewMode && <button id="AddOverhead_Save"
                            type="submit"
                            className="user-btn mr5 save-btn"
                            disabled={state?.isViewMode || setDisable}
                        >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                        </button>}
                        </div>
                    </Row>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
        {
          state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
      </>
    );
}


export default AddProfitMaster;