import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { Row, Col, Tooltip, FormGroup, Label, Input, Form } from 'reactstrap';
import { DatePickerHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import HeaderTitle from '../../common/HeaderTitle';
import DatePicker from 'react-datepicker';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import ProcessDrawer from '../ProcessDrawer';
import Button from '../../layout/Button';
import { fetchSpecificationDataAPI } from '../../../actions/Common';
import { getRMGradeSelectListByRawMaterial, getRMSpecificationDataAPI, getRMSpecificationDataList, getRawMaterialNameChild } from '../../masters/actions/Material';
import Toaster from "../../common/Toaster";
import { DRAFT, PREDRAFT, SENT } from "../../../config/constants";



const AddRfqRmDetails = (props) => {
    const { updateRawMaterialList, resetRmFields, updateButtonPartNoTable, rmSpecificRowData, dataProps, isEditFlag, isViewFlag, setViewQuotationPart, disabledPartUid, technology, setDisabled, isDisabled, resetDrawer } = props

    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({ mode: 'onChange', reValidateMode: 'onChange', defaultValues: { radioOption: false, } });
    const [rmName, setRmName] = useState([]);
    const [rmGrade, setRmGrade] = useState([]);
    const [rmSpec, setRmSpec] = useState([]);
    const [rmCode, setRmCode] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rmAttchment, setRmAttchment] = useState([])
    const dispatch = useDispatch()
    const [rmRemark, setRmRemark] = useState("");
    const showStatus = dataProps?.rowData?.Status || ""

    // const [viewQuotationPart, setViewQuotationPart] = useState(false)
    const rawMaterialNameSelectList = useSelector((state) => state.material.rawMaterialNameSelectList)
    const gradeSelectList = useSelector((state) => state.material.gradeSelectList)
    const rmSpecificationSelectList = useSelector((state) => state.comman.rmSpecification)
    const rmSpecificationList = useSelector((state) => state.material.rmSpecificationList)

    const showAddButton = !disabledPartUid || dataProps?.isAddFlag || (dataProps?.isEditFlag && showStatus === PREDRAFT) || (dataProps?.isViewFlag || dataProps?.isEditFlag ? false : true)



    useEffect(() => {
        dispatch(getRawMaterialNameChild(() => { }))
        dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
    }, [])
    useEffect(() => {
        setRmData()
    }, [rmName, rmGrade, rmSpec, rmCode, rmAttchment, rmRemark])

    useEffect(() => {
        if (resetRmFields) {
            onResetRmFields();
        }
    }, [resetRmFields]);

    useEffect(() => {
        if (updateButtonPartNoTable) {
            let obj = {
                RawMaterialChildId: rmSpecificRowData[0]?.RawMaterialChildId,
                RawMaterialGradeId: rmSpecificRowData[0]?.RawMaterialGradeId,
                RawMaterialSpecificationId: rmSpecificRowData[0]?.RawMaterialSpecificationId,
                RawMaterialSpecification: rmSpecificRowData[0]?.RawMaterialSpecification,
                RawMaterialGrade: rmSpecificRowData[0]?.RawMaterialGrade,
                RawMaterialName: rmSpecificRowData[0]?.RawMaterialName,
                RawMaterialCode: rmSpecificRowData[0]?.RawMaterialCode,
                RawMaterialCodeId: rmSpecificRowData[0]?.RawMaterialCodeId,
                RawMaterialReamrk: rmSpecificRowData[0]?.Remarks,
                RawMaterialAttachments: rmSpecificRowData[0]?.Attachments
            }
            setRmAttchment(rmSpecificRowData[0]?.Attachments)
            setRmRemark(rmSpecificRowData[0]?.Remarks)
            setRmName({ label: rmSpecificRowData[0]?.RawMaterialName, value: rmSpecificRowData[0]?.RawMaterialChildId })
            setRmGrade({ label: rmSpecificRowData[0]?.RawMaterialGrade, value: rmSpecificRowData[0]?.RawMaterialGradeId })
            setRmSpec({ label: rmSpecificRowData[0]?.RawMaterialSpecification, value: rmSpecificRowData[0]?.RawMaterialSpecificationId })
            setRmCode({ label: rmSpecificRowData[0]?.RawMaterialCode, value: rmSpecificRowData[0]?.RawMaterialCodeId })
            setValue('RmName', { label: rmSpecificRowData[0]?.RawMaterialName, value: rmSpecificRowData[0]?.RawMaterialChildId })
            setValue('Grade', { label: rmSpecificRowData[0]?.RawMaterialGrade, value: rmSpecificRowData[0]?.RawMaterialGradeId })
            setValue('Specifications', { label: rmSpecificRowData[0]?.RawMaterialSpecification, value: rmSpecificRowData[0]?.RawMaterialSpecificationId })
            setValue('Code', { label: rmSpecificRowData[0]?.RawMaterialCode, value: rmSpecificRowData[0]?.RawMaterialCodeId })
            updateRawMaterialList(obj)
        }
    }, [updateButtonPartNoTable, rmSpecificRowData,])
    const setRmData = () => {
        if (rmName.length !== 0 && rmGrade.length !== 0 && rmSpec.length !== 0) {
            let obj = {
                RawMaterialChildId: rmName.value,
                RawMaterialGradeId: rmGrade.value,
                RawMaterialSpecificationId: rmSpec.value,
                RawMaterialSpecification: rmSpec?.label,
                RawMaterialGrade: rmGrade?.label,
                RawMaterialName: rmName?.label,
                RawMaterialCode: rmCode?.label,
                RawMaterialCodeId: rmCode?.value,
                RawMaterialAttachments: rmAttchment,
                RawMaterialReamrk: rmRemark,

            }

            updateRawMaterialList(obj)

        }
    }
    const handleRemarkAndAttachment = (data) => {
        setRmRemark(data.remark)
        setRmAttchment(data.attachment)
    }
    const onResetRmFields = () => {

        setRmName([]);
        setRmGrade([]);
        setRmSpec([]);
        setRmCode([]);
        setRmAttchment([]);
        setRmRemark("");
        setValue('RmName', '')
        setValue('Grade', '')
        setValue('Specifications', '')
        setValue('Code', '')
    }
    const DrawerToggle = () => {

        // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setDrawerOpen(true)

    }
    const closeDrawer = () => {
        setDrawerOpen(false);

    }

    const renderListing = (label) => {
        const temp = []
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'grade') {
            gradeSelectList && gradeSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'specification') {
            rmSpecificationSelectList && rmSpecificationSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value, RawMaterialCode: item.RawMaterialCode })
                return null
            })
            return temp
        }

        if (label === 'code') {
            rmSpecificationList && rmSpecificationList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
                return null;
            });
            return temp;
        }

    }
    /**
    * @method handleRM
    * @description  used to handle row material selection
    */
    const handleRM = (newValue, actionMeta) => {


        if (newValue && newValue !== '') {

            delete errors.RawMaterialCode
            setRmName({ label: newValue?.label, value: newValue?.value })
            setValue('Grade', '')
            setValue('Specifications', '')
            setValue('Code', '')
            dispatch(getRMGradeSelectListByRawMaterial(newValue?.value, false, () => { },))
        } else {
            setRmName([])

            setValue('RmName', '')
            setValue('Grade', '')
            setValue('Specifications', '')
            setValue('Code', '')
            dispatch(getRMGradeSelectListByRawMaterial('', false, () => { },))
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    }
    /**
    * @method handleGrade
    * @description  used to handle row material grade selection
    */
    const handleGrade = (newValue, actionMeta) => {

        if (newValue && newValue !== '') {
            setRmGrade(newValue)
            dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
        } else {
            setRmGrade([])

            dispatch(fetchSpecificationDataAPI(0, (res) => { }))
        }
    }
    /**
    * @method handleSpecification
    * @description  used to handle row material grade selection
    */
    const handleSpecification = (newValue, actionMeta) => {

        if (newValue && newValue !== '') {
            setRmSpec(newValue)
            setRmCode({ label: newValue.RawMaterialCode, value: newValue.SpecificationId })
            setValue('Code', { label: newValue.RawMaterialCode, value: newValue.value })
        } else {
            setRmSpec([])

        }
    }
    /**
    * @method handleCode
    * @description  used to handle code 
    */
    const handleCode = (newValue) => {

        if (newValue && newValue !== '') {
            setRmCode(newValue)
            setDisabled(true)
            delete errors.RawMaterialName
            dispatch(getRMSpecificationDataAPI(newValue.value, true, (res) => {
                if (res.status === 204) {

                    setRmGrade({ label: '', value: '', })
                    setRmSpec({ label: '', value: '', })
                    setRmName({ label: '', value: '', })
                    Toaster.warning("The Raw Material Grade and Specification has set as unspecified. First update the Grade and Specification against this Raw Material Code from Manage Specification tab.")
                    return false
                }
                let Data = res?.data?.Data

                setRmGrade({ label: Data.GradeName, value: Data.GradeId })
                setRmSpec({ label: Data.Specification, value: Data.SpecificationId })
                setRmName({ label: Data.RawMaterialName, value: Data.RawMaterialId, })
                setValue('RmName', { label: Data.RawMaterialName, value: Data.RawMaterialId, })
                setValue('Grade', { label: Data.GradeName, value: Data.GradeId })
                setValue('Specifications', { label: Data.Specification, value: Data.SpecificationId })
            }))
        } else {
            setValue('RmName', '')
            setValue('Grade', '')
            setValue('Specifications', '')
            setDisabled(false)

        }
    }


    return (

        <>
            {/* <HeaderTitle title={'RM:'} /> */}
            {props.heading()}
            <Row className="part-detail-wrapper">
                <Col md="3">
                    <SearchableSelectHookForm
                        name="RmName"
                        label={"RM Name"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={renderListing("material")}
                        mandatory={true}
                        handleChange={handleRM}
                        // defaultValue={state.rmName.length !== 0 ? state.rmName : ""}
                        className="fullinput-icon"
                        disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || Object.keys(technology).length === 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT) || isDisabled}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                        errors={errors.RmName}
                        isClearable={true}
                    />
                </Col>
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"Grade"}
                        name={"Grade"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={renderListing("grade")}
                        required={true}
                        mandatory={true}
                        handleChange={handleGrade}
                        disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || Object.keys(technology).length === 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT) || isDisabled}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                        // disabled={isEditFlag || isViewFlag || state.isDisabled}
                        errors={errors.Grade}
                    />
                </Col>
                <Col md="3">
                    <SearchableSelectHookForm
                        label={"Specifications"}
                        name={"Specifications"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={renderListing("specification")}
                        mandatory={true}
                        handleChange={handleSpecification}
                        disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || Object.keys(technology).length === 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT) || isDisabled}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                        // defaultValue={state.rmSpec.length !== 0 ? state.rmSpec : ""}
                        // disabled={isEditFlag || isViewFlag || state.isDisabled}
                        errors={errors.Specifications}
                    />
                </Col>
                <Col md="3" className='d-flex align-items-center col-md-3'>
                    <SearchableSelectHookForm
                        label={"Code"}
                        name={"Code"}
                        placeholder={'Select'}
                        options={renderListing("code")}
                        Controller={Controller}
                        control={control}
                        register={register}
                        rules={{ required: true }}
                        mandatory={true}
                        // defaultValue={state.rmCode.length !== 0 ? state.rmCode : ""}
                        handleChange={handleCode}
                        isClearable={true}
                        disabled={updateButtonPartNoTable || dataProps?.isViewFlag || Object.keys(technology).length === 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT)}
                        errors={errors.Code}
                    />
                    {/* <Button id="addRMSpecificatione" className={"ml-2 mb-2 "}


                        // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}     

                        variant={'plus-icon-square'}
                        title={'Add'} onClick={DrawerToggle} >
                    </Button> */}
                    <Button id="addRMSpecificatione" className={"ml-2 mb-2"}
                        // icon={updateButtonPartNoTable ? 'edit_pencil_icon' : ''}
                        variant={updateButtonPartNoTable ? 'Edit' : 'plus-icon-square'}

                        title={updateButtonPartNoTable ? 'Edit' : 'Add'} onClick={DrawerToggle} disabled={disabledPartUid || (dataProps?.isEditFlag && showStatus !== PREDRAFT)}></Button>

                </Col>
            </Row>

            <div className=''>
                {
                    drawerOpen &&
                    (
                        <ProcessDrawer
                            isOpen={drawerOpen}
                            anchor={"right"}
                            closeDrawer={closeDrawer}
                            partType={'RM'}
                            quotationType={'RM'}
                            setViewQuotationPart={setViewQuotationPart}
                            setChildPartFiles={setRmAttchment}
                            childPartFiles={rmAttchment}
                            setRemark={setRmRemark}
                            remark={rmRemark}
                            rmSpecificRowData={rmSpecificRowData}
                            isEditFlag={isEditFlag}
                            isViewFlag={isViewFlag}
                            resetDrawer={resetDrawer}

                        />
                    )
                }
            </div>
        </>
    )

}
AddRfqRmDetails.defaultProps = {
    updateRawMaterialList: null,
    resetRmFields: null,
    updateButtonPartNoTable: null,
    rmSpecificRowData: null,
    dataProps: null,
    isEditFlag: null,
    isViewFlag: null,
    setViewQuotationPart: null
};

export default AddRfqRmDetails;
