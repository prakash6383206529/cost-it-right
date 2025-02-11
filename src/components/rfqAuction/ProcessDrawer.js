import { Drawer } from '@material-ui/core'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import NoContentFound from '../common/NoContentFound'
import { Assembly, Component, EMPTY_DATA, FILE_URL, searchCount } from '../../config/constants'
import { useSelector, useDispatch } from 'react-redux'
import { getRMGradeSelectListByRawMaterial } from '../masters/actions/Material'
import { fetchSpecificationDataAPI } from '../../actions/Common'
import { getPartSelectListWtihRevNo } from '../masters/actions/Volume'
import { autoCompleteDropdownPart } from '../common/CommonFunctions'
import { reactLocalStorage } from 'reactjs-localstorage'
import { MESSAGES } from '../../config/message'
import classnames from 'classnames';
import redcrossImg from '../../assests/images/red-cross.png'

import { alphaNumeric, checkWhiteSpaces, getFilteredDropdownOptions, required } from '../../helper'
import Button from '../layout/Button'
import HeaderTitle from '../common/HeaderTitle'
import { REMARKMAXLENGTH } from '../../config/masterData'
import Dropzone from 'react-dropzone-uploader'
import LoaderCustom from '../common/LoaderCustom'
import Toaster from '../common/Toaster'
import { fileUploadQuotation, getAssemblyChildpart, getRfqPartDetails, setRfqPartDetails } from './actions/rfq'
import _ from 'lodash';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import DatePicker from 'react-datepicker'
import DayTime from '../common/DayTimeWrapper';

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

    const { type, isOpen, anchor, isEditFlag, dataProps, isViewFlag, isEditAll, technology, nfrId, AssemblyPartNumber, tableData, setTableData, specificationList, setSpecificationList, setRemark, setChildPartFiles, remark, partListData, setPartListData, sopQuantityList, setSopQuantityList, sopdate, setSOPDate, effectiveMinDate } = props

    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const rawMaterialNameSelectList = useSelector(state => state?.material?.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state?.material?.gradeSelectList);
    const rmSpecification = useSelector(state => state?.comman?.rmSpecification);
    const { getChildParts, getRfqPartDetails } = useSelector(state => state?.rfq);

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
    const [activeTab, setActiveTab] = useState("1");
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
    useEffect(() => {
        setValue('AssemblyPartNumber', { label: AssemblyPartNumber.label, value: AssemblyPartNumber.value })
        if (type === Component) {
            setValue('partNumber', { label: AssemblyPartNumber.label, value: AssemblyPartNumber.value })
        } else {
            if (!isViewFlag) {
                dispatch(getAssemblyChildpart(AssemblyPartNumber?.value, (res) => { }))
            }
        }
    }, [AssemblyPartNumber])
    useEffect(() => {
        if ((isEditFlag || isViewFlag) && getRfqPartDetails) {
            const partList = getRfqPartDetails?.PartList || [];

            const sopDate = partList[0]?.SOPDate

            setSOPDate(sopDate || '')
            if (partList.length > 0) {
                let arr = []
                partList.forEach((part, index) => {



                    const PartId = part.PartId || '';
                    const PartNumber = part.PartNumber || '';
                    if (index === 0) {
                        const allSopQuantityDetails = part?.SOPQuantityDetails || []


                        const uniqueSopQuantityDetails = _.uniqBy(allSopQuantityDetails, item => `${item.PartId}-${item.PartNumber}`);

                        setSopQuantityList(sopQuantityList => allSopQuantityDetails)
                    }

                    const allSpecifications = (part.PartSpecification || []).map(detail => ({
                        ...detail,
                        PartId: PartId,
                        PartNumber: PartNumber,
                        uniqueKey: `${PartId}-${detail.Specification}` //QuotationPartSpecificationIdRef
                    }));



                    arr.push(...allSpecifications)


                    const allRMDetails = (part.RMDetails || []).map(detail => ({
                        ...detail,
                        PartId: PartId,
                        PartNumber: PartNumber,
                        uniqueKey: `${PartId}-${detail.RawMaterialSpecificationId}`
                    }));

                    setTableData(tableData => _.uniqBy([...allRMDetails], 'RawMaterialChildId'));
                    const remarks = part.Remarks || '';
                    setValue('remark', remarks);
                    setRemark(remarks);

                    const allFiles = part.Attachments || [];
                    setFiles(files => [...allFiles]);
                    setChildPartFiles(childPartFiles => [...childPartFiles, ...allFiles]);
                });
                setSpecificationList(specificationList => _.uniqBy([...arr], 'QuotationPartSpecificationIdRef'));
            }
        }
    }, [getRfqPartDetails, isViewFlag, isEditFlag]);

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
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.FirstYearQuantity, initialConfiguration?.NoOfDecimalForInputOutput);
                    //         newObjTemp.YearName = Data.FirstYear
                    //     } else if (index === 1) {
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.SecondYearQuantity, initialConfiguration?.NoOfDecimalForInputOutput);
                    //         newObjTemp.YearName = Data.SecondYear
                    //     } else if (index === 2) {
                    //         newObjTemp.Quantity = checkForDecimalAndNull(Data.ThirdYearQuantity, initialConfiguration?.NoOfDecimalForInputOutput);
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
    }
    const renderListingRM = (label) => {

        let opts1 = []
        if (label === 'childPartName') {
            const opts1 = [];

            getChildParts && getChildParts?.map(item => {
                // if (item.Value === '0') return false;
                opts1.push({ label: item.Text, value: item.Value })
            });
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
    }
    const handleChildPart = (newValue) => {

        setSelectedValues(prevSelected => [...prevSelected, newValue?.value]);
        setChildPart({ label: newValue?.label, value: newValue?.value })

    }
    // const handleSOPDateChange = (value) => {
    //     let year = new Date(value).getFullYear()
    //     const yearList = getNextFiveYears(year)
    //     setFiveyearList(yearList)
    //     setSOPDate(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
    //     if (updateButtonPartNoTable) {
    //         setStorePartsDetail((prevDetails) => {
    //             return prevDetails.map((item) => {
    //                 if (item.PartId === getValues('partNumber')?.value) {
    //                     return {
    //                         ...item,
    //                         UnitOfMeasurementIdRef: getValues('UnitOfMeasurementIdRef')?.value || null,
    //                         SOPDate: DayTime(value).format('YYYY-MM-DD HH:mm:ss') || "",
    //                         HavellsDesignPart: getValues('HavellsDesignPart')?.value || "",
    //                         TimeLine: requirementDate || ""
    //                     };
    //                 } else {
    //                     return {
    //                         ...item,
    //                         UnitOfMeasurementIdRef: null,
    //                         SOPDate: null,
    //                         HavellsDesignPart: null,
    //                         TimeLine: null
    //                     };
    //                 }
    //             });
    //         });
    //     }
    // }
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
    }
    const handleRemarkChange = (newValue) => {
        setRemark(newValue);
    }
    const resetFormAndDropdowns = () => {
        setValue('partNumber', '')
        setValue('RMName', '')
        setValue('RMGrade', '')
        setValue('RMSpecification', '')
        setValue('Specification', '')
        setValue('Value', '')
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
            childPart: true,
        };
        const specificationObj = {
            Specification: specificationValue,
            SpecificationId: rmSpecificationId,
            Value: value,
        }

        if (isEdit) {
            const newspecificationData = [...specificationList]
            newspecificationData[editIndex] = specificationObj
            setSpecificationList(newspecificationData);
            const newData = [...tableData];
            newData[editIndex] = obj;
            setTableData(newData);
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
            if (label !== undefined && (isRMGradeMissing || isRMSpecificationMissing)) {
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

                resetFormAndDropdowns();
            }
        }
    };


    const rateTableReset = () => {

        resetFormAndDropdowns();
    }
    const handleCloseDrawer = () => {
        // if (isViewFlag || isEditFlag) {
        //     saveRfqPartsData()

        // }
        props?.closeDrawer('', true);
        props?.setViewQuotationPart(false)
        dispatch(setRfqPartDetails({}));


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
        const tempObj = tableData[index];
        if (activeTab === "2") {
            const newSpecificationList = [...specificationList];
            newSpecificationList.splice(index, 1);
            setSpecificationList(newSpecificationList);
        } else {
            if (type === Component) {
                setValue('partNumber', { label: AssemblyPartNumber.label, value: AssemblyPartNumber.value })
            }
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
            setAttachmentLoader(false);
            setIsDisable(true);

            dispatch(fileUploadQuotation(data, (res) => {
                if ('response' in res) {
                    status = res.response.status;
                    dropzone.current.files.pop();
                    setAttachmentLoader(false);
                } else {
                    let Data = res.data[0];
                    setFiles(prevFiles => [...prevFiles, Data]); // Update the state using the callback function
                    setChildPartFiles(prevFiles => [...prevFiles, Data]);
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
            Toaster.warning('Allowed only xls, doc, jpeg, pdf, zip files.');
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
        // setTimeout(() => {
        //     setShowTooltip(true)
        // }, 100);
    };
    const EditableCallback = (props) => {

        let value
        value = isViewFlag ? false : true


        return value
    }
    const quantityHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text d-flex'>Annual Forecast Quantity<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"quantity-tooltip"}></i> </span>
            </div>
        );
    };
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
        let year = new Date(value).getFullYear()
        const yearList = getNextFiveYears(year)
        setIsNewDate(true)
        setFiveyearList(yearList)
        setSOPDate(DayTime(value).format('YYYY-MM-DD HH:mm:ss'))
    }

    const frameworkComponents = {
        buttonFormatterFirst: buttonFormatterFirst,
        customNoRowsOverlay: NoContentFound,
        sopFormatter: sopFormatter,
        EditableCallback: EditableCallback,
        afcFormatter: afcFormatter,
        quantityHeader: quantityHeader
    };

    return (
        <>
            <Drawer className="top-drawer approval-workflow-drawer" anchor={anchor} open={isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper drawer-1500px'}>

                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{"Add RM & Specification"}</h3>
                                </div>

                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>
                        <Nav tabs className="subtabs cr-subtabs-head ">
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => setActiveTab("1")
                                    }
                                >
                                    RM
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => setActiveTab("2")
                                    }
                                >
                                    Specification
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "3" })}
                                    onClick={() => setActiveTab("3")
                                    }
                                >
                                    Remarks & Attachments                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab}>
                            {Number(activeTab) === 1 && (<TabPane tabId="1">
                                <HeaderTitle title={'Add RM'} customClass="mt-3" />

                                <Row className="mt-1 part-detail-wrapper">

                                    <Col md="3">
                                        <div className='mt5 flex-grow-1'>
                                            <SearchableSelectHookForm
                                                label={"Part No"}
                                                name={"partNumber"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                //defaultValue={DestinationPlant.length !== 0 ? DestinationPlant : ""}
                                                mandatory={true}
                                                // handleChange={handleDestinationPlantChange}
                                                handleChange={(newValue) => handleChildPart(newValue)}
                                                errors={errors.partNumber}
                                                disabled={(isViewFlag || type === Component) ? true : false}
                                                //disabled={(isViewFlag || (isEditFlag && type === Component && tableData.length > 0)) ? true : isEdit ? false : !isEditFlag ? false : true}

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
                                            rules={{ required: false }}
                                            register={register}
                                            customClassName="costing-version"
                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                            options={renderListingRM('rmname')}
                                            mandatory={false}
                                            handleChange={(newValue) => handleRMName(newValue)}
                                            disabled={(isViewFlag || (isEditFlag && type === Component && tableData.length > 0)) ? true : isEdit ? false : !isEditFlag ? false : true}
                                        // errors={`${indexInside} CostingVersion`}
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
                                            rules={{ required: false }}
                                            register={register}
                                            customClassName="costing-version"
                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                            options={renderListingRM('rmgrade')}
                                            mandatory={rmNameSelected}
                                            handleChange={(newValue) => handleRMGrade(newValue)}
                                            disabled={(isViewFlag || (isEditFlag && type === Component && tableData.length > 0)) ? true : isEdit ? false : !isEditFlag ? false : true}
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
                                            rules={{ required: false }}
                                            register={register}
                                            customClassName="costing-version"
                                            // defaultValue={costingOptionsSelectedObject[indexInside] ? costingOptionsSelectedObject[indexInside] : ''}
                                            options={renderListingRM('rmspecification')}
                                            mandatory={rmNameSelected}
                                            handleChange={(newValue) => handleRMSpecification(newValue)}
                                            disabled={(isViewFlag || (isEditFlag && type === Component && tableData.length > 0)) ? true : isEdit ? false : !isEditFlag ? false : true}
                                        />
                                    </Col>

                                </Row>
                            </TabPane>)}
                            {Number(activeTab) === 2 && (
                                <TabPane tabId="2">
                                    <HeaderTitle title={'Add Specification'} customClass="mt-3" />
                                    <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <Row>
                                            <Col md="3">
                                                <AsyncSearchableSelectHookForm
                                                    label={"Assembly Part No"}
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
                                                <TextFieldHookForm
                                                    label="Specification Description"
                                                    name={"Specification"}
                                                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                                                    Controller={Controller}
                                                    control={control}
                                                    selected={specification ? specification : ''}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
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
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
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
                            {Number(activeTab) === 3 && (<TabPane tabId="3">
                                <HeaderTitle title={'Remarks and Attachments:'} customClass="mt-3" />
                                <Row className='part-detail-wrapper'>
                                    <Col md="12">
                                        <TextAreaHookForm
                                            label={"Remarks"}
                                            name={"remark"}
                                            placeholder={"Type here..."}
                                            Controller={Controller}
                                            control={control}
                                            rules={{
                                                required: true,
                                                maxLength: REMARKMAXLENGTH,
                                            }}
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
                                    <label>Upload Attachment (upload up to 4 files)<span className="asterisk-required"></span></label>
                                    <div className={`alert alert-danger mt-2 ${files?.length === 4 ? '' : 'd-none'}`} role="alert">
                                        Maximum file upload limit has been reached.
                                    </div>
                                    <div id="addRFQ_uploadFile" className={`${files?.length >= 4 ? 'd-none' : ''}`}>
                                        <Dropzone
                                            ref={dropzone}
                                            onChangeStatus={handleChangeStatus}
                                            PreviewComponent={Preview}
                                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx,.zip"
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
                        {Number(activeTab) !== 3 && (

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
                                                disabled={isViewFlag || !isEditFlag ? (type === Component && activeTab === "1" ? tableData.length > 0 : false) : false}                                        // errors={`${indexInside} CostingVersion`}
                                            >
                                                <div className={'plus'}></div>ADD
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr15 ml-1 mt30 reset-btn"}
                                                disabled={isViewFlag || !isEditFlag ? (type === Component && activeTab === "1" ? tableData.length > 0 : false) : false}
                                                onClick={rateTableReset}
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </div>
                            </Col>)}
                        {Number(activeTab) !== 3 && (
                            <Col md="12">
                                <Table className="table mb-0 forging-cal-table" size="sm">
                                    <thead>
                                        <tr>
                                            {activeTab === "2" && (<th>Specification Description</th>)}
                                            {activeTab === "2" && (<th>Value</th>)}

                                            {activeTab === "1" && (<th>Part Number</th>)}
                                            {activeTab === "1" && (<th>RM Grade</th>)}
                                            {activeTab === "1" && (<th>RM Name</th>)}
                                            {activeTab === "1" && (<th>RM Specification</th>)}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTab === "1" && tableData && tableData.length > 0 ? (
                                            tableData?.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.PartNumber !== null ? item.PartNumber : '-'}</td>
                                                    <td>{item.RawMaterialGrade !== null ? item.RawMaterialGrade : '-'}</td>
                                                    <td>{item.RawMaterialName !== null ? item.RawMaterialName : '-'}</td>
                                                    <td>{item.RawMaterialSpecification !== null ? item.RawMaterialSpecification : '-'}</td>
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
                                                    </td>
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

                                {activeTab === "2" && (
                                    <>
                                        <HeaderTitle title={'Add Volume'} customClass="mt-5" />
                                        <Row className='mt-3 mb-1'>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>SOP Date<span className="asterisk-required">*</span></label>
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
                                                            minDate={effectiveMinDate || new Date()}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            mandatory={true}
                                                            errors={errors.SOPDate}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
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
                                                                <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" headerComponent={'quantityHeader'} cellRenderer={'afcFormatter'} editable={EditableCallback} colId="Quantity"></AgGridColumn>
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
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-md-12 pr-3">
                                <div className="text-right ">
                                    <Button
                                        id="rm-specification-cancel"
                                        className="mr-2"
                                        variant={"cancel-btn"}
                                        //   disabled={setDisable}
                                        onClick={(e) => toggleDrawer(e)}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"}
                                    />
                                    <Button
                                        id="rm-specification-submit"
                                        type="button"
                                        className="save-btn"
                                        icon="save-icon"
                                        onClick={() => {
                                            handleCloseDrawer();
                                        }}
                                        buttonName={isEditFlag ? "Update" : "Save"}
                                        disabled={isViewFlag}
                                    />
                                </div>
                            </div>
                        </Row>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default React.memo(ViewDrawer)
