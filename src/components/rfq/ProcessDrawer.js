import { Drawer, Tooltip } from '@material-ui/core'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import NoContentFound from '../common/NoContentFound'
import { Assembly, Component, EMPTY_DATA, FILE_URL, searchCount } from '../../config/constants'
import { useSelector, useDispatch } from 'react-redux'
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial, getRMSpecificationDataAPI, getRMSpecificationDataList } from '../masters/actions/Material'
import { fetchSpecificationDataAPI } from '../../actions/Common'
import { getPartSelectListWtihRevNo } from '../masters/actions/Volume'
import { autoCompleteDropdownPart } from '../common/CommonFunctions'
import { reactLocalStorage } from 'reactjs-localstorage'
import { AttachmentValidationInfo, MESSAGES } from '../../config/message'
import classnames from 'classnames';
import redcrossImg from '../../assests/images/red-cross.png'

import { alphaNumeric, checkWhiteSpaces, getFilteredDropdownOptions, required, RFQ_KEYS } from '../../helper'
import Button from '../layout/Button'
import HeaderTitle from '../common/HeaderTitle'
import { HAVELLSREMARKMAXLENGTH, REMARKMAXLENGTH } from '../../config/masterData'
import Dropzone from 'react-dropzone-uploader'
import LoaderCustom from '../common/LoaderCustom'
import Toaster from '../common/Toaster'
import { fileUploadQuotation, getAssemblyChildpart, getRfqPartDetails, setBopSpecificRowData, setRfqPartDetails, setRmSpecificRowData, setToolingSpecificRowData } from './actions/rfq'
import _ from 'lodash';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import DatePicker from 'react-datepicker'
import DayTime from '../common/DayTimeWrapper';
import TooltipCustom from '../common/Tooltip'
import AddToolingRfq from './Tooling/AddToolingRfq'
import ToolingPartDetails from './Tooling/ToolingPartDetails'
const gridOptionsPart = {}
function ViewDrawer(props) {
    const dispatch = useDispatch()
    const dropzone = useRef(null);

    const sopObjectTemp = [
        { sop: 'SOP1' },
        { sop: 'SOP2' },
        { sop: 'SOP3' },
        { sop: 'SOP4' },
        { sop: 'SOP5' },
    ]

    const { isOpen, anchor, isEditFlag, isViewFlag, AssemblyPartNumber, tableData, setTableData, specificationList, setSpecificationList, setRemark, setChildPartFiles, remark, partListData, sopQuantityList, setSopQuantityList, sopdate, n100Date, sopDate, setSopDate, setN100Date, setSOPDate, effectiveMinDate, childPartFiles, rmSpecificRowData, partType, bopNumber, handleDrawer, drawerViewMode, resetDrawer } = props
    const type = String(props?.type)
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const rawMaterialNameSelectList = useSelector(state => state?.material?.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state?.material?.gradeSelectList);
    const rmSpecification = useSelector(state => state?.comman?.rmSpecification);
    const { getChildParts, getRfqPartDetails, bopSpecificRowData, toolingSpecificRowData } = useSelector(state => state?.rfq);


    const rmSpecificationList = useSelector((state) => state.material.rmSpecificationList)
    // const [sopQuantityList, setSopQuantityList] = useState([]);


    const [rmspecification, setRMSpecification] = useState([])
    const [rmName, setRMName] = useState([])
    const [rmgrade, setRMGrade] = useState([])

    const [rmNameSelected, setRmNameSelected] = useState(false)
    const [selectedparts, setSelectedParts] = useState([])
    const [partName, setPartName] = useState('')
    const [storeNfrId, setStoreNfrId] = useState('')
    const [inputLoader, setInputLoader] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [activeTab, setActiveTab] = useState(props.partType === 'Raw Material' ? "5" : props.partType === 'Bought Out Part' ? '2' : '1');

    const [specification, setSpecification] = useState("")
    const [editIndex, setEditIndex] = useState(null);  // To keep track of the index being edited
    const [files, setFiles] = useState([]);  // State for files
    const [attachmentLoader, setAttachmentLoader] = useState(false);
    const plantLoaderObj = { isLoader: inputLoader }
    const [apiCallCounter, setApiCallCounter] = useState(0)
    const [IsOpen, setIsOpen] = useState(false);
    const [isDisable, setIsDisable] = useState(false)
    const [valueState, setValueState] = useState('')
    const [selectedValues, setSelectedValues] = useState([]);
    const [childPart, setChildPart] = useState([])
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [sopQuantity, setSopQuantity] = useState([])
    const [state, setState] = useState(false)

    const [fiveyearList, setFiveyearList] = useState([])
    const [isNewDate, setIsNewDate] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [viewTooltip, setViewTooltip] = useState(false)
    const [partRemark, setPartRemark] = useState('')
    const [rmCode, setRMCode] = useState([])
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {

        if (partType === 'Component') {
            setValue('AssemblyPartNumber', { label: AssemblyPartNumber?.label, value: AssemblyPartNumber?.value })
            if (type === Component) {
                setValue('partNumber', { label: AssemblyPartNumber?.label, value: AssemblyPartNumber?.value })
            } else {
                if (!isViewFlag) {
                    dispatch(getAssemblyChildpart(AssemblyPartNumber?.value, (res) => { }))
                }
            }
        } else if (partType === "Bought Out Part") {
            setValue('AssemblyPartNumber', { label: bopNumber?.label, value: bopNumber?.value })
        }

    }, [AssemblyPartNumber, bopNumber, partType, type])
    useEffect(() => {
        if (partType === "Component")
            if (!isViewFlag) {
                dispatch(getRawMaterialNameChild(() => { }))
                dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
            }
    }, [partType])
    useEffect(() => {
        if (partType === "Component" || partType === "Assembly") {


            if ((isEditFlag || isViewFlag) && getRfqPartDetails && getRfqPartDetails?.PartList) {

                const partList = getRfqPartDetails?.PartList || [];
                let accumulatedRMDetails = [];
                const sopDate = partList[0]?.SOPDate

                setSOPDate(sopDate || '')
                if (partList.length > 0) {
                    let arr = []
                    partList.forEach((part, index) => {
                        const PartId = part.PartId || '';
                        const PartNumber = part.PartNumber || '';
                        if (index === 0) {
                            const allSopQuantityDetails = part?.SOPQuantityDetails || []
                            setSopQuantityList(sopQuantityList => allSopQuantityDetails)
                        }
                        if (index === 0) {
                            const allSpecifications = (part.PartSpecification || []).map(detail => ({
                                ...detail,
                                PartId: PartId,
                                PartNumber: PartNumber,
                                uniqueKey: `${PartId}-${detail.Specification}` //QuotationPartSpecificationIdRef
                            }));

                            arr.push(...allSpecifications)


                            const remarks = part.Remarks || '';

                            setValue('remark', remarks);
                            setRemark(remarks);
                            const allFiles = part.Attachments || [];


                            setFiles(files => [...allFiles]);
                            setChildPartFiles(childPartFiles => [...allFiles]);
                        }
                        if (part.RMDetails && part.RMDetails.length > 0) {
                            const allRMDetails = part.RMDetails.map(detail => ({
                                ...detail,
                                PartId: PartId,
                                PartNumber: PartNumber,
                                uniqueKey: `${PartId}-${detail.RawMaterialSpecificationId}`
                            }));

                            accumulatedRMDetails = [...accumulatedRMDetails, ...allRMDetails];

                        }


                        // setTableData(tableData => _.uniqBy([...allRMDetails], 'RawMaterialChildId'));
                        setTableData(tableData => _.uniqBy(accumulatedRMDetails, 'PartId'));

                    });
                    setSpecificationList(specificationList => _.uniqBy([...arr], 'QuotationPartSpecificationIdRef'));
                }
            }
        }
    }, [getRfqPartDetails, isViewFlag, isEditFlag]);
    useEffect(() => {
        if (partType === 'Raw Material') {
            if ((isEditFlag || isViewFlag) && rmSpecificRowData.length > 0) {
                setValue('remark', rmSpecificRowData[0].Remarks);
                setRemark(rmSpecificRowData[0].Remarks)
                setFiles(rmSpecificRowData[0].Attachments);
                setChildPartFiles(rmSpecificRowData[0].Attachments);
            }
        }
    }, [partType, rmSpecificRowData, isEditFlag, isViewFlag])
    useEffect(() => {
        // if (!getValues('partNumber') || getValues('partNumber') === '' || !sopdate || sopdate === '') {
        //     Toaster.warning("Please select part number and SOP date");
        //     return false;
        // } 
        if (sopdate && !(isViewFlag)) {
            if ((isEditFlag && sopQuantityList?.length === 0) || isNewDate) {

                let objTemp = {};
                let arrTemp = [];
                sopObjectTemp && sopObjectTemp.map((item, index) => {
                    let newObjTemp = { ...objTemp }; // Create a new object in each iteration
                    newObjTemp.PartNumber = AssemblyPartNumber?.label;
                    newObjTemp.SOPDate = sopdate

                    // newObjTemp.PartId = AssemblyPartNumber?.value;

                    // if (index === 2) {
                    //     newObjTemp.PartNumber = AssemblyPartNumber?.label;
                    // }
                    // if (nfrId && nfrId.value !== null) {
                    //     if (index === 0) {
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.FirstYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //         newObjTemp.YearName = Data.FirstYear
                    //     } else if (index === 1) {
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.SecondYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //         newObjTemp.YearName = Data.SecondYear
                    //     } else if (index === 2) {
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.ThirdYearQuantity, initialConfiguration.NoOfDecimalForInputOutput);
                    //         newObjTemp.YearName = Data.ThirdYear
                    //     } else if (index === 3) {
                    //         newObjTemp.Quantity = 0;
                    //         newObjTemp.YearName = parseInt(Data.ThirdYear) + 1
                    //         newObjTemp.isEdit = true
                    //     } else if (index === 4) {
                    //         newObjTemp.Quantity = 0;
                    //         newObjTemp.YearName = parseInt(Data.ThirdYear) + 2
                    //         newObjTemp.isEdit = true
                    //     }
                    // } else {
                    newObjTemp.Quantity = 0
                    newObjTemp.YearName = fiveyearList[index]
                    newObjTemp.isEdit = true
                    // }
                    arrTemp.push(newObjTemp);
                    return null;
                });
                setSopQuantityList(arrTemp)
            }
        }
    }, [sopdate])
    useEffect(() => {
        if (!isViewFlag && !isEditFlag) {
            if ((childPartFiles?.length > 0 || remark !== "")) {
                setValue("remark", remark)
                setFiles(childPartFiles)
            }

        }
    }, [isEditFlag, isViewFlag])
    useEffect(() => {


        if (partType === "Bought Out Part") {
            if ((isEditFlag || isViewFlag) && bopSpecificRowData && bopSpecificRowData.length > 0) {
                setValue('AssemblyPartNumber', { label: bopSpecificRowData[0]?.BoughtOutPartNumber, value: bopSpecificRowData[0]?.BoughtOutPartChildId })
                const BoughtOutPartChildId = bopSpecificRowData[0]?.BoughtOutPartChildId
                const allSpecifications = (bopSpecificRowData[0]?.PartSpecification || []).map(detail => ({
                    ...detail,
                    BoughtOutPartChildId: BoughtOutPartChildId,
                    uniqueKey: `${BoughtOutPartChildId}-${detail.Specification}` //QuotationPartSpecificationIdRef
                }));
                setSpecificationList(specificationList => _.uniqBy([...allSpecifications], 'uniqueKey'));
                setValue('remark', bopSpecificRowData[0].Remarks);
                setRemark(bopSpecificRowData[0].Remarks)
                setFiles(bopSpecificRowData[0].Attachments);
                setChildPartFiles(bopSpecificRowData[0].Attachments);
            }
        }
    }, [bopSpecificRowData, isViewFlag, isEditFlag, partType]);
    useEffect(() => {
        if (resetDrawer && partType === "Component") {
            setTableData([])
            setSpecificationList([])
            setSopQuantityList([])
            setSOPDate('')
            setRemark('')
            setFiles([])
            setChildPartFiles([])
        }
    }, [resetDrawer])
    useEffect(() => {
        if (partType === "Tooling") {
            if ((isEditFlag || isViewFlag) && toolingSpecificRowData && toolingSpecificRowData.length > 0) {

                let accumulatedRMDetails = [];
                // const sopDate = toolingSpecificRowData[0]?.SOPDate

                // setSOPDate(sopDate || '')
                if (toolingSpecificRowData.length > 0) {

                    let arr = []
                    toolingSpecificRowData.forEach((part, index) => {


                        const PartId = part.ToolId || '';

                        if (index === 0) {
                            const sopDate = part?.SOPDate
                            const allSopQuantityDetails = part?.SOPQuantity || []
                            setSOPDate(sopDate || '')

                            setSopQuantityList(sopQuantityList => allSopQuantityDetails)

                            const allSpecifications = (part.ToolSpecificationList || []).map(detail => ({
                                ...detail,
                                PartId: PartId,
                                uniqueKey: `${PartId}-${detail.Specification}` //QuotationPartSpecificationIdRef
                            }));

                            arr.push(...allSpecifications)


                            const remarks = part.Remarks || '';
                            setValue('remark', remarks);
                            setRemark(remarks);
                            const allFiles = part.Attachments || [];

                            setFiles(files => [...allFiles]);
                            setChildPartFiles(childPartFiles => [...allFiles]);
                        }
                        if (part.ToolChildList && part.ToolChildList.length > 0) {
                            const allRMDetails = part.ToolChildList.map(detail => ({
                                ...detail,
                            }));


                            accumulatedRMDetails = [...accumulatedRMDetails, ...allRMDetails];

                        }


                        // setTableData(tableData => _.uniqBy([...allRMDetails], 'RawMaterialChildId'));
                        setTableData(tableData => _.uniqBy(accumulatedRMDetails, 'PartId'));

                    });
                    setSpecificationList(specificationList => _.uniqBy([...arr], 'QuotationPartSpecificationIdRef'));
                }
            }
        }
    }, [isViewFlag, isEditFlag, partType, toolingSpecificRowData])

    const removeAddedParts = (arr) => {
        const filteredArray = arr.filter((item) => {
            return !selectedparts.some((element) => {
                return element.value === item.value;
            });
        });
        return filteredArray
    }
    const validateForm = () => {
        return (
            specification !== '' &&
            valueState !== '' &&
            remark !== '' &&
            files.length > 0
        );
    };

    const toggleDrawer = (event) => {

        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props?.setViewQuotationPart(false)
        props.closeDrawer('', false)
        if (drawerViewMode) {
            setTableData([])
            setSpecificationList([])
            setSopQuantityList([])
            setSOPDate('')
            setRemark('')
            setFiles([])
            setChildPartFiles([])
            handleDrawer(false)
        }
    }
    const renderListingRM = (label) => {

        let opts1 = []
        if (label === 'childPartName') {
            const opts1 = [];

            getChildParts && getChildParts?.map(item => {
                // if (item.Value === '0') return false;
                opts1.push({ label: item.Text, value: item.Value })
            });
            const selectedValues = tableData.map(data => data.PartId);


            return getFilteredDropdownOptions(opts1, selectedValues);
        }
        if (label === 'rmname') {
            if (rawMaterialNameSelectList?.length > 0) {
                let opts = [...rawMaterialNameSelectList]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
                    opts1.push(item)
                    return null
                })
            }
            return opts1
        }
        if (label === 'rmgrade') {
            if (gradeSelectList?.length > 0) {
                let opts = [...gradeSelectList]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
                    opts1.push(item)
                    return null
                })
            }
            return opts1
        }

        if (label === 'rmspecification') {
            if (rmSpecification?.length > 0) {
                let opts = [...rmSpecification]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.Text
                    item.value = item.Value
                    opts1.push(item)
                    return null
                })
            }
            return opts1
        }
        if (label === 'rmcode') {
            if (rmSpecificationList?.length > 0) {

                let opts = [...rmSpecificationList]
                opts && opts?.map(item => {
                    if (item.Value === '0') return false
                    item.label = item.RawMaterialCode
                    item.value = item.SpecificationId
                    opts1.push(item)
                    return null
                })
            }
            return opts1
        }
    }
    const handleChildPart = (newValue) => {

        setSelectedValues(prevSelected => [...prevSelected, newValue?.value]);
        setChildPart({ label: newValue?.label, value: newValue?.value })

    }

    const handleRMName = (newValue) => {
        setRMName({ label: newValue?.label, value: newValue?.value })
        setRmNameSelected(true)
        setValue('RMGrade', '')
        setValue('RMSpecification', '')
        dispatch(getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => { }))
    }

    const handleRMGrade = (newValue) => {
        setRMGrade({ label: newValue?.label, value: newValue?.value })
        setValue('RMSpecification', '')
        dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
    }

    const handleRMSpecification = (newValue) => {
        setRMSpecification({ label: newValue?.label, value: newValue?.value })
        setRMCode({ label: newValue.RawMaterialCode, value: newValue.SpecificationId })
        setValue('rmcode', { label: newValue.RawMaterialCode, value: newValue.value })
    }
    const handleRemarkChange = (newValue) => {

        setValue('remark', newValue)
        setRemark(newValue);
    }
    const resetFormAndDropdowns = () => {
        if (type !== Component) {
            setValue('partNumber', '')
        }
        setValue('RMName', '')
        setValue('RMGrade', '')
        setValue('RMSpecification', '')
        setValue('Specification', '')
        setValue('Value', '')
        setValue("rmcode", "")
        // if (!isViewFlag && !isEditFlag) {

        //     setValue('remark', '')
        //     setFiles([])
        //     setChildPartFiles([])
        //     setRemark('')
        // }
    };

    const handleSpecification = (newValue) => {
        setSpecification(newValue)
    }

    const handleValue = (value) => {
        setValueState(value)
    }
    /**
         * @method addRow
         * @description For updating and adding row
         */
    const addRow = (activeTab) => {
        const formData = getValues();
        const partNumberLabel = formData.partNumber?.label || '-';
        const partIdRef = formData.partNumber?.value || '-';
        const rmNameLabel = formData.RMName?.label || '-';
        const rmChildId = formData.RMName?.value || '-';
        const rmGradeId = formData.RMGrade?.value || '-';
        const rmSpecificationId = formData.RMSpecification?.value || '-';
        const rmGradeLabel = formData.RMGrade?.label || '-';
        const rmSpecificationLabel = formData.RMSpecification?.label || '-';
        const rmCodeLabel = formData.rmcode?.label || '-';
        const rmCodeValue = formData.rmcode?.value || '-';
        const specificationValue = formData.Specification || '-';
        const value = formData.Value || '-';

        const obj = {
            PartNumber: partNumberLabel,
            PartId: partIdRef,
            RawMaterialName: rmNameLabel,
            RawMaterialChildId: rmChildId,
            RawMaterialGrade: rmGradeLabel,
            RawMaterialGradeId: rmGradeId,
            RawMaterialSpecificationId: rmSpecificationId,
            RawMaterialSpecification: rmSpecificationLabel,
            RawMaterialCode: rmCodeLabel,
            RawMaterialCodeId: rmCodeValue,
            childPart: true,
        };
        const specificationObj = {
            Specification: specificationValue,
            SpecificationId: rmSpecificationId,
            Value: value,
        }

        if (isEdit) {
            if (activeTab === "2") {
                const newspecificationData = [...specificationList]
                newspecificationData[editIndex] = specificationObj
                setSpecificationList(newspecificationData);
            } else {
                const newData = [...tableData];
                newData[editIndex] = obj;
                setTableData(newData);
            }
            setIsEdit(false);
            setEditIndex(null);
            resetFormAndDropdowns();
        } else if (activeTab === "2") {
            const specification = getValues('Specification');
            const IsValueMissing = !getValues('Value');
            if (specification !== undefined && IsValueMissing) {
                Toaster.warning("Please enter value");
            }

            // else if (specificationList.length >= 3) {
            //     Toaster.warning("You can only add up to 3 specifications.");
            // } 
            else {
                setSpecificationList(prevData => [...prevData, specificationObj]);
                resetFormAndDropdowns();
            }

        } else {
            const { label } = getValues('RMName') || {};
            const isRMGradeMissing = !getValues('RMGrade');
            const isRMSpecificationMissing = !getValues('RMSpecification');

            if (label === undefined) {
                Toaster.warning("Please select a raw material name");

            }
            else if (label !== undefined && (isRMGradeMissing || isRMSpecificationMissing)) {
                const missingRequirements = [];
                if (isRMGradeMissing) {
                    missingRequirements.push('RM Grade');
                }
                if (isRMSpecificationMissing) {
                    missingRequirements.push('RM Specification');
                }
                const message = `Please select ${missingRequirements.join(' and ')}`;
                Toaster.warning(message);
            } else {

                setTableData(prevData => [...prevData, obj]);
                setDisabled(false)
                resetFormAndDropdowns();
            }
        }
    };


    const rateTableReset = () => {

        resetFormAndDropdowns();
    }
    const handleCloseDrawer = () => {
        //tableData
        // if (isViewFlag || isEditFlag) {
        //     saveRfqPartsData()

        // }


        if (partType === "Component" || partType === "Tooling" || partType === "Bought Out Part") {
            const hasNonZeroQuantity = sopQuantityList && sopQuantityList.length > 0 && sopQuantityList[0].Quantity !== 0 && sopQuantityList[0].Quantity !== '0';
            if (partType === "Component" || partType === "Tooling") {
                const dropdownTexts = _.map(getChildParts, 'Text');
                const tableTexts = _.map(tableData, 'PartNumber');
                const allPresent = _.every(dropdownTexts, text => _.includes(tableTexts, text));
                if (RFQ_KEYS?.RM_MANDATORY && (type !== Component && partType !== "Tooling")) {

                    if (!allPresent) {
                        Toaster.warning('RM Name, RM Grade, and RM Specification are required for each part.');
                        return false;
                    }
                } else if (RFQ_KEYS?.RM_MANDATORY && (type === Component && (tableData.length === 0))) {
                    Toaster.warning('RM Name, RM Grade, and RM Specification are required.');
                    return false;
                }
                if (RFQ_KEYS?.ANNUAL_FORECAST_MANDATORY && (_.isEmpty(sopQuantityList) || !hasNonZeroQuantity)) {
                    Toaster.warning("Select SOP date and fill the first year's quantity.");
                    return false;
                }
            }
            if (RFQ_KEYS?.SPECIFICATION_MANDATORY && (specificationList && specificationList?.length === 0)) {
                Toaster.warning("Please fill the Specification Details.");
                return false;
            }

        }

        if (RFQ_KEYS?.REMARKS_ATTACHMENT_MANDATORY && (getValues('remark') === '' || files.length === 0)) {
            Toaster.warning('Please fill the remarks and attachments documents.');
            return;
        }


        props?.closeDrawer('', true);
        props?.setViewQuotationPart(false)
        dispatch(setRfqPartDetails({}));
        if (partType === "Raw Material") {
            const attachment = files;  // Assume files is the new value for Attachments
            const updatedRemark = getValues('remark') || null;  // Assume getValues('remark') gets the new value for Remarks

            if (Array.isArray(rmSpecificRowData) && rmSpecificRowData.length > 0) {
                // Create a new updated object with the first object updated
                const updatedObject = {
                    ...rmSpecificRowData[0],
                    Attachments: attachment,
                    Remarks: updatedRemark
                };
                const updatedArray = [updatedObject];
                dispatch(setRmSpecificRowData(updatedArray));
            }
        } else if (partType === "Bought Out Part") {
            const attachment = files;

            const updatedRemark = getValues('remark') || null;

            const specification = specificationList

            if (Array.isArray(bopSpecificRowData) && bopSpecificRowData.length > 0) {
                const updatedObject = {
                    ...bopSpecificRowData[0],
                    Attachments: attachment,
                    Remarks: updatedRemark,
                    PartSpecification: specification
                };
                const updatedArray = [updatedObject];
                dispatch(setBopSpecificRowData(updatedArray));
            }
        }
        // if (partType === "Component") {
        //     const attachment = files;
        //     const updatedRemark = getValues('remark') || null;
        //     const specification = specificationList;
        //     const sopQuantityDetails = sopQuantityList || []; // Assuming you're retrieving this from the form
        //     const rmDetails = tableData || []


        //     if (getRfqPartDetails && getRfqPartDetails.PartList.length > 0) {
        //         const updatedObject = {
        //             ...getRfqPartDetails?.PartList[0],
        //             Attachments: attachment,
        //             Remarks: updatedRemark,
        //             PartSpecification: specification,
        //             SOPQuantityDetails: sopQuantityDetails,
        //         };
        //         const updatedArray = [updatedObject];
        //         let obj = {
        //             ...getRfqPartDetails,
        //             PartList: updatedArray
        //         }


        //         dispatch(setRfqPartDetails({
        //             ...getRfqPartDetails,
        //             PartList: updatedArray
        //         }));
        //     }
        // }

        else {
            const attachment = files;

            const updatedRemark = getValues('remark') || null;

            const specification = specificationList

            if (Array.isArray(toolingSpecificRowData) && toolingSpecificRowData.length > 0) {
                const updatedObject = {
                    ...toolingSpecificRowData[0],
                    Attachments: attachment,
                    Remarks: updatedRemark,
                    PartSpecification: specification
                };
                const updatedArray = [updatedObject];
                dispatch(setToolingSpecificRowData(updatedArray));
            }
        }



    }
    const cancelUpdate = () => {
        setIsEdit(false);
        // setTableData([]);
        // setSpecificationList([]);
        resetFormAndDropdowns();
    };

    /**
      * @method deleteRow
      * @description Deleting single row from table
      */
    const deleteRow = (index, activeTab) => {
        if (activeTab === "2") {
            const newSpecificationList = [...specificationList];
            newSpecificationList.splice(index, 1);
            setSpecificationList(newSpecificationList);
        } else {
            if (type === Component) {
                setValue('partNumber', { label: AssemblyPartNumber.label, value: AssemblyPartNumber.value })
            }
            const tempObj = tableData[index];
            const removedItemPartNumber = tempObj.PartId;
            const newData = [...tableData];
            newData.splice(index, 1);
            setTableData(newData);
            setSelectedValues(prevSelected => prevSelected.filter(value => value !== removedItemPartNumber));
        }
    };
    /**
     * @method editRow
     * @description for filling the row above table for editing
     */
    const editRow = (index, activeTab) => {
        setIsEdit(true);
        if (activeTab === "2") {
            const editSpecification = specificationList[index]
            setValue('Specification', editSpecification.Specification);
            setValue('Value', editSpecification.Value);
        } else {
            const tempObj = tableData[index];
            setValue('partNumber', { label: tempObj.PartNumber, value: tempObj.PartId });
            setValue('RMName', { label: tempObj.RawMaterialName, value: tempObj.RawMaterialChildId });
            setValue('RMGrade', { label: tempObj.RawMaterialGrade, value: tempObj.RawMaterialGradeId });
            setValue('RMSpecification', { label: tempObj.RawMaterialSpecification, value: tempObj.RawMaterialSpecificationId });
            setValue('rmcode', { label: tempObj.RawMaterialCode, value: tempObj.RawMaterialCodeId });

        }

        setEditIndex(index);
    };
    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    const deleteFile = (FileId, OriginalFileName) => {
        // if (dataProps?.isAddFlag ? false : dataProps?.isViewFlag || !isEditAll) {
        //     return false
        // }
        if (FileId != null) {
            let tempArr = files.filter((item) => item.FileId !== FileId)
            setFiles(tempArr);
            setChildPartFiles(tempArr)
            setIsOpen(!IsOpen)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
            setFiles(tempArr)
            setChildPartFiles(tempArr)
            setIsOpen(!IsOpen)
        }
        // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
        if (dropzone?.current !== null) {
            dropzone.current.files.pop()
        }
    }
    const partNumberFormatter = (props) => {

        const row = props?.data;

        const value = row?.RevisionNumber ? (row?.PartNumber + ' (' + row?.RevisionNumber + ')') : (row?.PartNumber ? row?.PartNumber : '')

        return <div className={`${value ? 'font-ellipsis' : 'row-merge'}`}>{value}</div>
    }
    const handleChangeStatus = ({ meta, file }, status) => {

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName !== removedFileName);
            setFiles(tempArr);
            setChildPartFiles(tempArr)
            setIsOpen(prevState => !prevState);
        }

        if (status === 'done') {
            let data = new FormData();
            data.append('file', file);
            setApiCallCounter(prevCounter => prevCounter + 1);  // Increment the API call counter for loader showing
            setAttachmentLoader(true);
            setIsDisable(true);

            dispatch(fileUploadQuotation(data, (res) => {

                if ('response' in res) {
                    status = res?.response?.status;
                    dropzone.current.files.pop();
                    setAttachmentLoader(false);
                } else {
                    let Data = res?.data[0];

                    setFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
                    setChildPartFiles(prevFiles => [...prevFiles, Data]);
                    setAttachmentLoader(false)

                }
                setApiCallCounter(prevCounter => prevCounter - 1);

                // Check if this is the last API call after decrement
                if (apiCallCounter - 1 === 0) {
                    setAttachmentLoader(false);
                    setIsDisable(false);
                    setTimeout(() => {
                        setIsOpen(prevState => !prevState);
                    }, 500);
                }
            }));
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, docx, pptx jpeg, pdf, zip files.');
        } else if (status === 'error_file_size') {
            setAttachmentLoader(false);
            dropzone.current.files.pop();
            Toaster.warning("File size greater than 20 mb not allowed");
        } else if (['error_validation', 'error_upload_params', 'exception_upload', 'aborted', 'error_upload'].includes(status)) {
            setAttachmentLoader(false);
            dropzone.current.files.pop();
            Toaster.warning("Something went wrong");
        }
    };
    const buttonFormatterFirst = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        let show = (props?.data?.PartNumber === undefined) ? false : true
        const row = props?.data;
        return (
            <>
                {/* {show && < button title='Edit' className="Edit mr-2 align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} type={'button'} onClick={() => editItemPartTable(props?.agGridReact?.gridOptions?.rowData, props, true)} />}
                {show && <button title='Delete' className="Delete align-middle" disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)} type={'button'} onClick={() => deleteItemPartTable(row, final)} />} */}
            </>
        )
    };
    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        setGridApi(params.api)
        params.api.paginationGoToPage(0);
        setTimeout(() => {

            setShowTooltip(true)
        }, 100);
    };
    const tooltipToggle = () => {
        setViewTooltip(!viewTooltip)
    }
    const EditableCallback = (props) => {

        let value
        value = isViewFlag ? false : true


        return value
    }
    const handleCode = (newValue) => {
        if (newValue && newValue !== '') {
            setRMCode(newValue)
            setDisabled(true)
            delete errors?.RawMaterialSpecification
            delete errors?.RawMaterialGrade
            delete errors.RawMaterialName
            dispatch(getRMSpecificationDataAPI(newValue.value, true, (res) => {
                if (res.status === 204) {

                    setRMGrade({ label: '', value: '', })
                    setRMSpecification({ label: '', value: '', })
                    setRMName({ label: '', value: '', })
                    Toaster.warning("The Raw Material Grade and Specification has set as unspecified. First update the Grade and Specification against this Raw Material Code from Manage Specification tab.")
                    return false
                }
                let Data = res?.data?.Data

                setRMGrade({ label: Data.GradeName, value: Data.GradeId })
                setRMSpecification({ label: Data.Specification, value: Data.SpecificationId })
                setRMName({ label: Data.RawMaterialName, value: Data.RawMaterialId, })
                setValue('RMName', { label: Data.RawMaterialName, value: Data.RawMaterialId, })
                setValue('RMGrade', { label: Data.GradeName, value: Data.GradeId })
                setValue('RMSpecification', { label: Data.Specification, value: Data.SpecificationId })
            }))
        } else {
            setValue('RMName', '')
            setValue('RMGrade', '')
            setValue('RMSpecification', '')
            setDisabled(false)

        }
    }
    // const quantityHeader = (props) => {
    //     return (
    //         <div className='ag-header-cell-label'>
    //             <span className='ag-header-cell-text d-flex'>Annual Forecast Quantity<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"quantity-tooltip"}></i> </span>
    //         </div>
    //     );
    // };
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,

    };
    // const buttonFormatterVendorTable = (props) => {
    //     return (
    //         <>
    //             {<button title='Delete' className="Delete align-middle" type={'button'} disabled={isEditFlag ? true : isViewFlag ? false : true} onClick={() => deleteItemVendorTable(props?.agGridReact?.gridOptions.rowData, props)} />}
    //         </>
    //     )
    // }
    const beforeSaveCell = (props) => {
        let cellValue = props
        if (cellValue === undefined) {
            return true
        }
        if (cellValue && !/^[0-9]+(\.[0-9]+)?$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive number.');
            return false;
        }
        return true
    }
    const sopFormatter = (props) => {

        const cellValue = props?.value;
        return cellValue ? cellValue : '-'
    }
    const afcFormatter = (props) => {


        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')


        const cell = props?.value;

        const value = beforeSaveCell(cell)


        setSopQuantityList(final)
        // setPartList(final)

        let isEnable
        isEnable = isEditFlag ? true : isViewFlag ? false : true



        return (
            <>
                {<span className={`form-control custom-max-width-110px  ${isEnable ? '' : 'disabled'}`} >{value ? Number(cell) : 0}</span>}
            </>
        )
    }
    function getNextFiveYears(currentYear) {
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push(currentYear + i);
        }
        return years;
    }
    const handleSOPDateChange = (value) => {
        const formattedDate = DayTime(value).format('YYYY-MM-DD HH:mm:ss');

        // Validate that selected date is after N-100 date
        if (props.n100Date && value < props.n100Date) {
            Toaster.warning("SOP date must be after N-100 date");
            return;
        }
        // Update both local and parent state
        setSOPDate(formattedDate);
        setSopDate(value);

        let year = new Date(value).getFullYear()
        const yearList = getNextFiveYears(year)
        setIsNewDate(true)
        setFiveyearList(yearList)
        // setSOPDate(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
    }
    function shouldShowButtons(activeTab, propsPartType) {
        if (propsPartType === 'Tooling') {
            return !(activeTab === 1 || activeTab === 3 || activeTab === 4);
        }

        if (propsPartType === "Component") {
            return activeTab === 1 || activeTab === 2 || activeTab === 5;
        }

        return true;
    }
    function shouldShowTableButtons(activeTab, propsPartType) {
        if (propsPartType === 'Tooling') {
            return Number(activeTab) === 2;
        }

        if (propsPartType === "Component") {
            return activeTab === 1 || activeTab === 2;
        }
        if (propsPartType === "Bought Out Part") {
            return activeTab === 2;
        }

        return false;

    }
    const frameworkComponents = {
        buttonFormatterFirst: buttonFormatterFirst,
        customNoRowsOverlay: NoContentFound,
        sopFormatter: sopFormatter,
        EditableCallback: EditableCallback,
        afcFormatter: afcFormatter,
        // quantityHeader: quantityHeader
    };

    return (
        <>
            <Drawer className="top-drawer approval-workflow-drawer" anchor={anchor} open={isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper drawer-1500px'}>

                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3> {partType === "Raw Material" ? "Add Remark & Attachment" : (partType === "Component" ? "Add RM & Specification" : "Add Specification & Attachment")}</h3>
                                </div>

                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>
                        <Nav tabs className="subtabs cr-subtabs-head ">
                            {(props?.partType === 'Component' || props?.partType === 'Tooling') && <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => setActiveTab("1")
                                    }
                                >
                                    RM
                                </NavLink>
                            </NavItem>}
                            {(props?.partType !== 'Raw Material' || props?.partType === 'Bought Out Part' || props?.partType === 'Tooling') && <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => setActiveTab("2")
                                    }
                                >
                                    {props?.partType === 'Tooling' ? 'Tooling Specification' : ' Specification'}
                                </NavLink>
                            </NavItem>}
                            {(props?.partType === 'Tooling') && <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "3" })}
                                    onClick={() => setActiveTab("3")
                                    }
                                >
                                    Tooling Details
                                </NavLink>
                            </NavItem>}
                            {(props?.partType === 'Tooling') && <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "4" })}
                                    onClick={() => setActiveTab("4")
                                    }
                                >
                                    Part Details
                                </NavLink>
                            </NavItem>}
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "5" })}
                                    onClick={() => setActiveTab("5")
                                    }
                                >
                                    Remarks & Attachments                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab}>
                            {Number(activeTab) === 1 && (
                                <TabPane tabId="1">
                                    {props.partType !== 'Tooling' && (
                                        <>
                                            <HeaderTitle title={'Add RM'} customClass="mt-3" />


                                            <Row className="mt-1 part-detail-wrapper">
                                                <Col md="3">
                                                    <div className='mt5 flex-grow-1'>
                                                        <TooltipCustom id="RMDetail_Info" tooltipText="Select RM Name, RM Grade & specification to get the Part code, or directly input the RM Code to fetch the previously mentioned information and click on the Add button." />
                                                        <SearchableSelectHookForm
                                                            label={"Part No"}
                                                            name={"partNumber"}
                                                            placeholder={"Select"}
                                                            Controller={Controller}
                                                            control={control}
                                                            rules={{ required: RFQ_KEYS?.RM_MANDATORY ? true : false }}
                                                            register={register}
                                                            mandatory={RFQ_KEYS?.RM_MANDATORY ? true : false}

                                                            handleChange={(newValue) => handleChildPart(newValue)}
                                                            errors={errors.partNumber}
                                                            disabled={(isViewFlag || type === Component) ? true : false}
                                                            isLoading={plantLoaderObj}
                                                            options={renderListingRM('childPartName')}
                                                        />
                                                    </div>
                                                </Col>

                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        label="RM Name"
                                                        name={"RMName"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        selected={rmName ? rmName : ''}
                                                        rules={{ required: RFQ_KEYS?.RM_MANDATORY ? true : false }}
                                                        register={register}
                                                        customClassName="costing-version"
                                                        options={renderListingRM('rmname')}
                                                        mandatory={RFQ_KEYS?.RM_MANDATORY ? true : false}
                                                        handleChange={(newValue) => handleRMName(newValue)}
                                                        disabled={disabled || isViewFlag || (type === Component && tableData.length > 0 && !isEdit && props?.dataProp?.isAddFlag)}
                                                    //disabled={disabled || (isViewFlag || (isEditFlag && type === Component && tableData.length > 0 && !isEdit)) ? true : false}

                                                    />
                                                </Col>

                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        label="RM Grade"
                                                        name={"RMGrade"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        selected={rmgrade ? rmgrade : ''}
                                                        rules={{ required: getValues('RMName') ? true : false }}
                                                        register={register}
                                                        customClassName="costing-version"
                                                        options={renderListingRM('rmgrade')}
                                                        mandatory={getValues('RMName') ? true : false}
                                                        handleChange={(newValue) => handleRMGrade(newValue)}
                                                        disabled={disabled || isViewFlag || (partType === 'Component' && tableData.length > 0 && !isEdit)}
                                                    />
                                                </Col>

                                                <Col md="3">
                                                    <SearchableSelectHookForm
                                                        label="RM Specification"
                                                        name={"RMSpecification"}
                                                        placeholder={"Select"}
                                                        Controller={Controller}
                                                        control={control}
                                                        selected={rmspecification ? rmspecification : ''}
                                                        rules={{ required: getValues('RMName') ? true : false }}
                                                        register={register}
                                                        customClassName="costing-version"
                                                        options={renderListingRM('rmspecification')}
                                                        mandatory={getValues('RMName') ? true : false}
                                                        handleChange={(newValue) => handleRMSpecification(newValue)}
                                                        disabled={disabled || isViewFlag || (partType === 'Component' && tableData.length > 0 && !isEdit)}
                                                    />
                                                </Col>

                                                <Col md="3" className='d-flex align-items-center'>
                                                    <SearchableSelectHookForm
                                                        label={"Code"}
                                                        name={"rmcode"}
                                                        placeholder={'Select'}
                                                        options={renderListingRM("rmcode")}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        rules={{ required: getValues('RMName') ? true : false }}
                                                        mandatory={getValues('RMName') ? true : false}
                                                        handleChange={handleCode}
                                                        isClearable={true}
                                                        errors={errors.Code}
                                                        disabled={disabled || isViewFlag || (partType === 'Component' && tableData.length > 0 && !isEdit)}
                                                    />
                                                </Col>
                                            </Row>
                                        </>
                                    )}
                                </TabPane>
                            )}

                            {Number(activeTab) === 2 && (
                                <TabPane tabId="2">


                                    <HeaderTitle title={'Add Specification'} customClass="mt-3" />
                                    {/* <TooltipCustom id="addSpecification" customClass="mt-3" tooltipText="Describe comprehensive specifications, desired features, quality standard and any other relevant details to ensure supplier understand needs." /> */}


                                    <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <Row>
                                            <Col md="3">
                                                <AsyncSearchableSelectHookForm
                                                    label={partType === "Bought Out Part" ? "BOP Part No" : "Assembly Part No"}
                                                    name={"AssemblyPartNumber"}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    // defaultValue={AssemblyPartNumber.length !== 0 ? AssemblyPartNumber : ""}
                                                    handleChange={() => { }}
                                                    errors={errors.AssemblyPartNumber}
                                                    disabled={true}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TooltipCustom id="Specification_Info" tooltipText="Describe comprehensive specifications, desired features, quality standards and any other relevant details to ensure the supplier understands needs." />

                                                <TextFieldHookForm
                                                    label="Specification Description"
                                                    name={"Specification"}
                                                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                                                    Controller={Controller}
                                                    control={control}
                                                    selected={specification ? specification : ''}
                                                    register={register}
                                                    mandatory={RFQ_KEYS?.SPECIFICATION_MANDATORY ? true : false}
                                                    rules={{
                                                        required: RFQ_KEYS?.SPECIFICATION_MANDATORY ? true : false,
                                                        validate: { alphaNumeric, checkWhiteSpaces },
                                                    }}
                                                    handleChange={(e) => handleSpecification(e.target.value)}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Specification}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Value"
                                                    name={"Value"}
                                                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                                                    Controller={Controller}
                                                    control={control}
                                                    selected={valueState ? valueState : ''}
                                                    register={register}
                                                    mandatory={RFQ_KEYS?.SPECIFICATION_MANDATORY ? true : false}
                                                    rules={{
                                                        required: RFQ_KEYS?.SPECIFICATION_MANDATORY ? true : false,
                                                        validate: { alphaNumeric, checkWhiteSpaces },
                                                    }}
                                                    handleChange={(e) => handleValue(e.target.value)}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Value}
                                                    disabled={isViewFlag}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </TabPane>
                            )}
                            {Number(activeTab) === 3 && partType === 'Tooling' &&
                                (<TabPane tabId="3">
                                    <AddToolingRfq />
                                </TabPane>)}
                            {Number(activeTab) === 4 && partType === 'Tooling' &&
                                (<TabPane tabId="4">
                                    <ToolingPartDetails />
                                </TabPane>)}
                            {Number(activeTab) === 5 && (<TabPane tabId="5">
                                <HeaderTitle title={'Remarks and Attachments:'} customClass="mt-3" />
                                <Row className='part-detail-wrapper'>
                                    <Col md="12">
                                        <TooltipCustom id="remark_tooltip" tooltipText="This remark is for internal reference and is not accessible to the supplier" />

                                        <TextAreaHookForm
                                            label={"Remarks"}
                                            name={"remark"}
                                            placeholder={"Type here..."}
                                            Controller={Controller}
                                            control={control}
                                            rules={{
                                                required: RFQ_KEYS?.REMARKS_ATTACHMENT_MANDATORY ? true : false,
                                                maxLength: HAVELLSREMARKMAXLENGTH,
                                            }}
                                            mandatory={RFQ_KEYS?.REMARKS_ATTACHMENT_MANDATORY ? true : false}
                                            register={register}
                                            //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                            // options={renderListing("DestinationPlant")}
                                            customClassName={"withBorder"}
                                            handleChange={(e) => { handleRemarkChange(e.target.value) }}
                                            errors={errors.remark}
                                            // disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                                            rowHeight={6}
                                            disabled={isViewFlag}
                                        // isLoading={plantLoaderObj}
                                        />
                                    </Col>
                                </Row>
                                <Col md="6" className="height152-label">
                                    <label>Upload Attachment (upload up to 4 files, size of each file upto 20MB)<span className="asterisk-required">{RFQ_KEYS?.REMARKS_ATTACHMENT_MANDATORY ? "*" : ""}</span> </label>
                                    <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                        Maximum file upload limit has been reached.
                                    </div>
                                    <div id="addRFQ_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                        <Dropzone
                                            ref={dropzone}
                                            onChangeStatus={handleChangeStatus}
                                            PreviewComponent={Preview}
                                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx,.zip, .docx,.pptx"
                                            initialFiles={[]}
                                            maxFiles={4}
                                            maxSizeBytes={20000000}  // 20 MB in bytes
                                            inputContent={(files, extra) =>
                                                extra.reject ? (
                                                    "Image, audio and video files only"
                                                ) : (
                                                    <div className="text-center">
                                                        <i className="text-primary fa fa-cloud-upload"></i>
                                                        <span className="d-block">
                                                            Drag and Drop or{" "}
                                                            <span className="text-primary">Browse</span>
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
                                            disabled={isViewFlag}
                                        />
                                    </div>
                                </Col>
                                <Col md="6" className='p-relative'>
                                    <div className={"attachment-wrapper"}>
                                        {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                                        {files &&
                                            files?.map((f) => {
                                                const withOutTild = f.FileURL?.replace("~", "");
                                                const fileURL = `${FILE_URL}${withOutTild}`;
                                                return (
                                                    <div className={"attachment images"}>
                                                        <a href={fileURL} target="_blank" rel="noreferrer">
                                                            {f.OriginalFileName}
                                                        </a>
                                                        {
                                                            !isViewFlag &&
                                                            <img
                                                                alt={""}
                                                                className="float-right"
                                                                onClick={() => deleteFile(f.FileId, f.FileName)}
                                                                src={redcrossImg}
                                                            ></img>
                                                        }
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </Col>
                            </TabPane>)}
                        </TabContent>


                        {shouldShowTableButtons(Number(activeTab), props.partType) && (
                            <>
                                <Col md="3" className='d-flex align-items-center pb-1'>
                                    <div className='ml-1 mt5'> {/* Add margin to separate the reset button */}
                                        {isEdit ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className={'btn btn-primary mt30 pull-left mr5'}
                                                    onClick={() => addRow(activeTab)}
                                                >
                                                    Update
                                                </button>

                                                <button
                                                    type="button"
                                                    className="mt30 cancel-btn"
                                                    onClick={() => cancelUpdate()}
                                                >
                                                    <div className={"cancel-icon"}></div>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className={'user-btn mt30 pull-left'}
                                                    onClick={() => addRow(activeTab)}
                                                    disabled={isViewFlag || (!isEditFlag ? (type === Component && activeTab === "1" ? tableData.length > 0 : false) : false)}                                        // errors={`${indexInside} CostingVersion`}
                                                >
                                                    <div className={'plus'}></div>ADD
                                                </button>
                                                <button
                                                    type="button"
                                                    className={"mr15 ml-1 mt30 reset-btn"}
                                                    disabled={isViewFlag || (!isEditFlag ? (type === Component && activeTab === "1" ? tableData.length > 0 : false) : false)}
                                                    onClick={rateTableReset}
                                                >
                                                    Reset
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </Col>
                            </>

                        )}

                        {Number(activeTab) !== 5 && Number(activeTab) !== 3 && Number(activeTab) !== 4 && (
                            <Col md="12">
                                <Table className="table mb-0 forging-cal-table" size="sm">
                                    <thead>
                                        <tr>
                                            {activeTab === "2" && (<th>Specification Description</th>)}
                                            {activeTab === "2" && (<th>Value</th>)}

                                            {(activeTab === "1" && props.partType !== 'Tooling') && (<th>Part Number</th>)}
                                            {(activeTab === "1" && props.partType === 'Tooling') && (<th>Part Name</th>)}
                                            {activeTab === "1" && (<th>RM Name</th>)}
                                            {(activeTab === "1" && props.partType !== 'Tooling') && <th>RM Grade</th>}
                                            {(activeTab === "1" && props.partType !== 'Tooling') && <th>RM Specification</th>}

                                            {props.partType !== 'Tooling' && <th>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTab === "1" && tableData && tableData.length > 0 ? (
                                            tableData?.map((item, index) => (
                                                <tr key={index}>
                                                    {props.partType !== 'Tooling' && <td>{item.PartNumber !== null ? item.PartNumber : '-'}</td>}
                                                    {props.partType === 'Tooling' && <td>{item.PartName !== null ? item.PartName : '-'}</td>}
                                                    {props.partType === 'Tooling' && <td>{item.RawMaterial !== null ? item.RawMaterial : '-'}</td>}
                                                    {props.partType !== 'Tooling' && <td>{item.RawMaterialName !== null ? item.RawMaterialName : '-'}</td>}
                                                    {props.partType !== 'Tooling' && <td>{item.RawMaterialGrade !== null ? item.RawMaterialGrade : '-'}</td>}
                                                    {props.partType !== 'Tooling' && <td>{item.RawMaterialSpecification !== null ? item.RawMaterialSpecification : '-'}</td>}
                                                    {props.partType !== 'Tooling' &&
                                                        <td>
                                                            <button
                                                                className="Edit mr-2"
                                                                type="button"
                                                                title="Edit"
                                                                onClick={() => editRow(index, activeTab)}
                                                                disabled={isViewFlag}
                                                            />
                                                            <button
                                                                className="Delete"
                                                                type="button"
                                                                title="Delete"
                                                                onClick={() => deleteRow(index, activeTab)}
                                                                disabled={isViewFlag}
                                                            />
                                                        </td>}
                                                </tr>
                                            ))
                                        ) : activeTab === "2" && specificationList && specificationList.length > 0 ? (
                                            specificationList.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.Specification !== null ? item.Specification : '-'}</td>
                                                    <td>{item.Value !== null ? item.Value : '-'}</td>
                                                    <td>
                                                        <button
                                                            className="Edit mr-2"
                                                            type={'button'}
                                                            title='Edit'
                                                            onClick={() => editRow(index, activeTab)}
                                                            disabled={isViewFlag}
                                                        />
                                                        <button
                                                            className="Delete"
                                                            title='Delete'
                                                            type={'button'}
                                                            onClick={() => deleteRow(index, activeTab)}
                                                            disabled={isViewFlag}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colspan="15">
                                                    <NoContentFound title={EMPTY_DATA} />
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </Table>

                                {activeTab === "2" && (props.partType !== "Bought Out Part") && (
                                    <>
                                        <HeaderTitle title={'Add Volume'} customClass="mt-5" />
                                        <Row className='mt-3 mb-1'>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>SOP Date<span className="asterisk-required">{RFQ_KEYS?.ANNUAL_FORECAST_MANDATORY ? "*" : ""}</span></label>
                                                    <div id="addRFQDate_container" className="inputbox date-section">
                                                        <DatePicker
                                                            name={'SOPDate'}
                                                            placeholder={'Select'}
                                                            //selected={submissionDate}
                                                            selected={DayTime(sopdate).isValid() ? new Date(sopdate) : ''}
                                                            onChange={handleSOPDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode='select'
                                                            // minDate={new Date()}
                                                            minDate={props.n100Date || new Date()} // SOP date must be after N-100 date
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            mandatory={true}
                                                            errors={errors.SOPDate}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isViewFlag}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                            {/* {showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={viewTooltip} toggle={tooltipToggle} target={"quantity-tooltip"} >{"To edit the quantity please double click on the field."}</Tooltip>} */}

                                            <Row>
                                                <Col md="12" className='ag-grid-react'>
                                                    <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${partListData && partListData.length === 0 ? "overlay-contain border" : ""} `} >

                                                        <div className={`ag-theme-material`}>
                                                            <AgGridReact
                                                                defaultColDef={defaultColDef}
                                                                floatingFilter={false}
                                                                domLayout='autoHeight'
                                                                // columnDefs={c}
                                                                rowData={sopQuantityList}
                                                                //pagination={true}
                                                                onGridReady={onGridReady}
                                                                gridOptions={gridOptionsPart}
                                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: EMPTY_DATA,
                                                                    imagClass: 'imagClass'
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                            // stopEditingWhenCellsLoseFocus={true}
                                                            // suppressColumnVirtualisation={true}

                                                            >
                                                                <AgGridColumn width={"230px"} field="PartNumber" headerName="Part No" tooltipField="PartNumber" cellClass={"colorWhite"} cellRenderer={'partNumberFormatter'}></AgGridColumn>
                                                                <AgGridColumn width={"230px"} field="YearName" headerName="Production Year" cellRenderer={'sopFormatter'}></AgGridColumn>
                                                                <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" /* headerComponent={'quantityHeader'} */ cellRenderer={'afcFormatter'} editable={EditableCallback} colId="Quantity"></AgGridColumn>
                                                                {/* <AgGridColumn width={"180px"} field="PartNumber" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonFormatterVendorTable'}></AgGridColumn> */}


                                                            </AgGridReact>

                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row >
                                        </div>
                                    </>)}
                            </Col>)}


                        {/* <Row> */}
                        {shouldShowButtons(Number(activeTab), props.partType) && (

                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 pr-3">
                                    <div className="text-right">
                                        <Button
                                            id="rm-specification-cancel"
                                            className="mr-2"
                                            variant={"cancel-btn"}
                                            onClick={(e) => toggleDrawer(e)}
                                            icon={"cancel-icon"}
                                            buttonName={"Cancel"}
                                        />
                                        <Button
                                            id="rm-specification-submit"
                                            type="button"
                                            className="save-btn"
                                            icon="save-icon"
                                            onClick={() => handleCloseDrawer()}
                                            buttonName={isEditFlag ? "Update" : "Save"}
                                            disabled={isViewFlag}
                                        />
                                    </div>
                                </div>
                            </Row>

                        )}

                    </div>
                </div>
            </Drawer>
        </>
    )
}
ViewDrawer.defaultProps = {
    type: null,
    isOpen: null,
    anchor: null,
    isEditFlag: null,
    isViewFlag: null,
    AssemblyPartNumber: null,
    tableData: null,
    setTableData: null,
    specificationList: null,
    setSpecificationList: null,
    setRemark: null,
    setChildPartFiles: null,
    remark: null,
    partListData: null,
    sopQuantityList: null,
    setSopQuantityList: null,
    sopdate: null,
    setSOPDate: null,
    effectiveMinDate: null,
    childPartFiles: null,
    rmSpecificRowData: null,
    partType: null
};

export default React.memo(ViewDrawer)
