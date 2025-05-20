import React, { useState, useEffect } from 'react';
import { Row, Col, Container, TabPane, Nav, NavItem, NavLink, TabContent } from 'reactstrap';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { checkForNull, number } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, Component } from '../../../config/constants';
import { Drawer } from '@material-ui/core'
import DatePicker from 'react-datepicker'
import HeaderTitle from '../../common/HeaderTitle'
import DayTime from '../../common/DayTimeWrapper';
import _ from 'lodash';
import Toaster from '../../common/Toaster';
import TooltipCustom from '../../common/Tooltip';
import { useSelector, useDispatch } from 'react-redux';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial, getRMSpecificationDataAPI, getRMSpecificationDataList } from '../../masters/actions/Material';
import { fetchSpecificationDataAPI } from '../../../actions/Common';
import { getFilteredDropdownOptions } from '../../../helper';
import classnames from 'classnames';
import { getAssemblyChildpart } from '../../rfq/actions/rfq';

function AddForecast(props) {
    const dispatch = useDispatch();
    const { isOpen, closeDrawer, anchor, isViewFlag, sopDate, handleSOPDateChange, gridOptionsPart, onGridReady, EditableCallback, AssemblyPartNumber, isEditFlag, sopQuantityList, setSopQuantityList, partType, type,
        partTypeInPartList, rmDetails } = props;

    const { register, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            rmName: '',
            rmgrade: '',
            rmspecification: '',
            childPart: null,
            isEdit: false,
            editIndex: null,
            disabled: false
        }
    });

    // State for array-type fields
    const [tableData, setTableData] = useState([]);
    const [childPartsData, setChildPartsData] = useState([]);
    const [activeTab, setActiveTab] = useState("1");

    // Redux selectors
    const rawMaterialNameSelectList = useSelector(state => state?.material?.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state?.material?.gradeSelectList);
    const rmSpecification = useSelector(state => state?.comman?.rmSpecification);
    const rmSpecificationList = useSelector((state) => state.material.rmSpecificationList);

    useEffect(() => {
        if (partType?.label === "Component") {
            if (!isViewFlag) {
                dispatch(getRawMaterialNameChild(() => { }))
                dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
            }
        }
    }, [partType, isViewFlag, dispatch]);

    useEffect(() => {
        if (partType && partType.label === 'Component') {
            setValue('partNumber', { label: AssemblyPartNumber?.label, value: AssemblyPartNumber?.value });
            setValue('childPart', { label: AssemblyPartNumber?.label, value: AssemblyPartNumber?.value });
        } else if (!isViewFlag && AssemblyPartNumber?.value) {
            dispatch(getAssemblyChildpart(AssemblyPartNumber?.value, (res) => {
                if (res && res.data && res.data.DataList && res.data.DataList.length > 0) {
                    setChildPartsData(res.data.DataList);
                }
            }));
        }
    }, [AssemblyPartNumber, partType]);

    useEffect(() => {
        if (rmDetails && rmDetails.length > 0) {
            setTableData(rmDetails)
        }
    }, [rmDetails]);

    const partNumberFormatter = (params) => {
        let partNumber = AssemblyPartNumber?.label || (typeof AssemblyPartNumber === 'string' ? AssemblyPartNumber : '') || params.value || '-';
        return partNumber;
    };

    const sopFormatter = (params) => {
        return params.value || '-';
    };

    const beforeSaveCell = (props) => {
        let cellValue = props
        if (cellValue === undefined || cellValue === '') {
            return 0
        }
        const numValue = Number(cellValue)
        if (isNaN(numValue) || numValue < 0) {
            Toaster.warning('Please enter a valid positive number.');
            return 0
        }
        return numValue
    }

    const afcFormatter = (props) => {
        let final = _.map(props?.node?.rowModel?.rowsToDisplay, 'data')
        const cell = props?.value;

        const validatedValue = beforeSaveCell(cell)

        if (props?.node?.data) {
            props.node.data.Quantity = validatedValue
            setSopQuantityList(final)
        }

        let isEnable = isEditFlag ? true : isViewFlag ? false : true

        return (
            <>
                {<span className={`form-control custom-max-width-110px ${isEnable ? '' : 'disabled'}`}>
                    {validatedValue}
                </span>}
            </>
        )
    }

    // Grid components
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        partNumberFormatter,
        sopFormatter,
        afcFormatter
    };

    // Event handlers
    const handleSave = (isSave) => {
        if (tableData.length === 0) {
            Toaster.warning("Please fill the RM Details.");
            return;
        }
        if (sopDate && sopQuantityList[0].Quantity === 0) {
            Toaster.warning("Please enter at least one quantity in the forecast.");
            return;
        }
        if (isSave) {
            setTableData([])
            closeDrawer(true, sopQuantityList, tableData);
        }
        else {
            closeDrawer(false, sopQuantityList, tableData);
        }
    };

    // Add row to table
    const addRow = (index) => {
        const rmName = getValues('rmName');
        const rmgrade = getValues('rmgrade');
        const rmspecification = getValues('rmspecification');
        const childPart = getValues('childPart');

        if (!rmName || !rmgrade || !rmspecification || !childPart) {
            Toaster.warning("Please fill all required fields");
            return;
        }

        // Check for duplicate records
        const isDuplicate = tableData.some(item => {
            const sameMaterials =
                item.RawMaterialId === rmName?.value &&
                item.RawMaterialGradeId === rmgrade?.value &&
                item.RawMaterialSpecificationId === rmspecification?.value;

            const sameCode = getValues('rmcode')?.value &&
                item.RawMaterialCodeId === getValues('rmcode')?.value;

            if (childPart?.value) {
                return item.PartId === childPart?.value && (sameMaterials || sameCode);
            }

            return sameMaterials || sameCode;
        });

        if (isDuplicate) {
            Toaster.warning("This record already exists in the table. Duplicate entries are not allowed.");
            return;
        }

        const newRow = {
            PartNumber: childPart?.label || AssemblyPartNumber?.label || '-',
            PartId: childPart?.value || AssemblyPartNumber?.value || '',
            RawMaterialName: rmName?.label || '-',
            RawMaterialId: rmName?.value || '',
            RawMaterialGrade: rmgrade?.label || '-',
            RawMaterialGradeId: rmgrade?.value || '',
            RawMaterialSpecification: rmspecification?.label || '-',
            RawMaterialSpecificationId: rmspecification?.value || '',
            RawMaterialCode: getValues('rmcode')?.label || '-',
            RawMaterialCodeId: getValues('rmcode')?.value || ''
        };

        setTableData([...tableData, newRow]);
        resetFormAndDropdowns();
    };

    // Edit row in table
    const editRow = (index) => {
        const row = tableData[index];

        setValue('childPart', { label: row.PartNumber, value: row.PartId });
        setValue('rmName', { label: row.RawMaterialName, value: row.RawMaterialId });
        setValue('rmgrade', { label: row.RawMaterialGrade, value: row.RawMaterialGradeId });
        setValue('rmspecification', { label: row.RawMaterialSpecification, value: row.RawMaterialSpecificationId });
        setValue('RMName', { label: row.RawMaterialName, value: row.RawMaterialId });
        setValue('RMGrade', { label: row.RawMaterialGrade, value: row.RawMaterialGradeId });
        setValue('RMSpecification', { label: row.RawMaterialSpecification, value: row.RawMaterialSpecificationId });
        setValue('rmcode', { label: row.RawMaterialCode, value: row.RawMaterialCodeId });
        setValue('editIndex', index);
        setValue('isEdit', true);
    };

    // Delete row from table
    const deleteRow = (index) => {
        const newTableData = [...tableData];
        newTableData.splice(index, 1);
        setTableData(newTableData);
    };

    // Reset form after adding or editing
    const resetForm = () => {
        setValue('childPart', null);
        setValue('rmName', '');
        setValue('rmgrade', '');
        setValue('rmspecification', '');
        setValue('rmcode', '');
        setValue('editIndex', null);
        setValue('isEdit', false);
    };

    // Update row in table
    const updateRow = () => {
        const rmName = getValues('rmName');
        const rmgrade = getValues('rmgrade');
        const rmspecification = getValues('rmspecification');
        const childPart = getValues('childPart');
        const editIndex = getValues('editIndex');

        if (!rmName || !rmgrade || !rmspecification) {
            Toaster.warning("Please fill all required fields");
            return;
        }

        const isDuplicate = tableData.some((item, index) => {
            if (index === editIndex) return false;

            const sameMaterials =
                item.RawMaterialId === rmName?.value &&
                item.RawMaterialGradeId === rmgrade?.value &&
                item.RawMaterialSpecificationId === rmspecification?.value;

            const sameCode = getValues('rmcode')?.value &&
                item.RawMaterialCodeId === getValues('rmcode')?.value;

            if (childPart?.value) {
                return item.PartId === childPart?.value && (sameMaterials || sameCode);
            }

            return sameMaterials || sameCode;
        });

        if (isDuplicate) {
            Toaster.warning("This record already exists in the table. Duplicate entries are not allowed.");
            return;
        }

        const updatedRow = {
            PartNumber: childPart?.label || '-',
            PartId: childPart?.value || '',
            RawMaterialName: rmName?.label || '-',
            RawMaterialId: rmName?.value || '',
            RawMaterialGrade: rmgrade?.label || '-',
            RawMaterialGradeId: rmgrade?.value || '',
            RawMaterialSpecification: rmspecification?.label || '-',
            RawMaterialSpecificationId: rmspecification?.value || '',
            RawMaterialCode: getValues('rmcode')?.label || '-',
            RawMaterialCodeId: getValues('rmcode')?.value || ''
        };

        const newTableData = [...tableData];
        newTableData[editIndex] = updatedRow;
        setTableData(newTableData);
        resetForm();
        resetFormAndDropdowns();
    };

    const handleChildPart = (newValue) => {
        setValue('childPart', { label: newValue?.label, value: newValue?.value });
        if (partType && partType.label !== 'Component') {
            setValue('partNumber', { label: newValue?.label, value: newValue?.value });
            setValue('RMName', '');
            setValue('RMGrade', '');
            setValue('RMSpecification', '');
            setValue('rmcode', '');
            setValue('rmName', '');
            setValue('rmgrade', '');
            setValue('rmspecification', '');
        }
    }

    const handleRMName = (newValue) => {
        setValue('rmName', { label: newValue?.label, value: newValue?.value });
        setValue('RMGrade', '');
        setValue('RMSpecification', '');
        dispatch(getRMGradeSelectListByRawMaterial(newValue.value, false, (res) => { }));
    }

    const handleRMGrade = (newValue) => {
        setValue('rmgrade', { label: newValue?.label, value: newValue?.value });
        setValue('RMSpecification', '');
        dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }));
    }

    const handleRMSpecification = (newValue) => {
        setValue('rmspecification', { label: newValue?.label, value: newValue?.value });

        const rmName = getValues('rmName');
        const rmgrade = getValues('rmgrade');

        if (rmName?.value && rmgrade?.value && newValue?.value) {
            const matchingCode = rmSpecificationList?.find(item =>
                item.SpecificationId === newValue.value
            );
            if (matchingCode) {
                setValue('rmcode', {
                    label: matchingCode.RawMaterialCode,
                    value: matchingCode.SpecificationId
                });
            }
        }
    }

    const handleCode = (newValue) => {
        if (newValue && newValue !== '') {
            delete errors?.RawMaterialSpecification;
            delete errors?.RawMaterialGrade;
            delete errors.RawMaterialName;
            dispatch(getRMSpecificationDataAPI(newValue.value, true, (res) => {
                if (res.status === 204) {
                    setValue('rmgrade', { label: '', value: '' });
                    setValue('rmspecification', { label: '', value: '' });
                    setValue('rmName', { label: '', value: '' });
                    Toaster.warning("The Raw Material Grade and Specification has set as unspecified. First update the Grade and Specification against this Raw Material Code from Manage Specification tab.");
                    return false;
                }
                let Data = res?.data?.Data;

                setValue('rmgrade', { label: Data?.GradeName, value: Data?.GradeId });
                setValue('rmspecification', { label: Data?.Specification, value: Data?.SpecificationId });
                setValue('rmName', { label: Data?.RawMaterialName, value: Data?.RawMaterialId });
                setValue('RMName', { label: Data?.RawMaterialName, value: Data?.RawMaterialId });
                setValue('RMGrade', { label: Data?.GradeName, value: Data?.GradeId });
                setValue('RMSpecification', { label: Data?.Specification, value: Data?.SpecificationId });
            }));
        } else {
            setValue('RMName', '');
            setValue('RMGrade', '');
            setValue('RMSpecification', '');
            setValue('disabled', false);
        }
    }

    const resetFormAndDropdowns = () => {
        // if (partType.value !== Component) {
        //     setValue('partNumber', '');
        // }

        setValue('RMName', '');
        setValue('RMGrade', '');
        setValue('RMSpecification', '');
        setValue('Specification', '');
        setValue('Value', '');
        setValue('rmcode', '');
        setValue('rmName', '');
        setValue('rmgrade', '');
        setValue('rmspecification', '');
        setValue('disabled', false);
    };

    // Functions for RM handling
    const renderListingRM = (label) => {
        let opts1 = []
        if (label === 'childPartName') {
            const options = [];
            if (childPartsData && childPartsData.length > 0) {
                childPartsData.forEach(item => {
                    if (item && item.Text && item.Value) {
                        options.push({
                            label: item.Text,
                            value: item.Value
                        });
                    }
                });
                return options; // Return all options without filtering
            }
            return [];
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

    const toggleDrawer = () => {
        props.closeDrawer(false)
    }

    // Function to handle tab switching
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className='p-relative'>
            <Drawer anchor={anchor} open={isOpen}>
                <div className={`ag-grid-react hidepage-size`}>
                    <div className={`ag-grid-react hidepage-size`}>
                        <Container className="add-bop-drawer">
                            <div className={'drawer-wrapper layout-min-width-960px'}>
                                <Row className="drawer-heading sticky-top-0">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>Add RM & Forecast</h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={'close-button right'}
                                        ></div>
                                    </Col>
                                </Row>

                                <Nav tabs className="subtabs cr-subtabs-head">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "1" })}
                                            onClick={() => handleTabChange("1")}
                                        >
                                            Add RM
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "2" })}
                                            onClick={() => handleTabChange("2")}
                                        >
                                            Add Forecast
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <TabContent activeTab={activeTab}>
                                    {Number(activeTab) === 1 && (
                                        <TabPane tabId="1">
                                            {partType !== 'Tooling' && (
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
                                                                    rules={{ required: true }}
                                                                    register={register}
                                                                    mandatory={true}
                                                                    handleChange={(newValue) => handleChildPart(newValue)}
                                                                    errors={errors.partNumber}
                                                                    disabled={(isViewFlag || (partType && partType.label === 'Component')) ? true : false}
                                                                    options={renderListingRM('childPartName')}
                                                                    selected={getValues('childPart')}
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
                                                                selected={getValues('rmName') ? getValues('rmName') : ''}
                                                                rules={{ required: true }}
                                                                register={register}
                                                                customClassName="costing-version"
                                                                options={renderListingRM('rmname')}
                                                                mandatory={true}
                                                                handleChange={(newValue) => handleRMName(newValue)}
                                                                disabled={getValues('disabled') || isViewFlag || (getValues('editIndex') !== null ? false : (partTypeInPartList === 'Assembly' ? renderListingRM('childPartName')?.length === 0 : false))}
                                                            />
                                                        </Col>

                                                        <Col md="3">
                                                            <SearchableSelectHookForm
                                                                label="RM Grade"
                                                                name={"RMGrade"}
                                                                placeholder={"Select"}
                                                                Controller={Controller}
                                                                control={control}
                                                                selected={getValues('rmgrade') ? getValues('rmgrade') : ''}
                                                                rules={{ required: getValues('RMName') ? true : false }}
                                                                register={register}
                                                                customClassName="costing-version"
                                                                options={renderListingRM('rmgrade')}
                                                                mandatory={getValues('RMName') ? true : false}
                                                                handleChange={(newValue) => handleRMGrade(newValue)}
                                                                disabled={getValues('disabled') || isViewFlag || (getValues('editIndex') !== null ? false : (partTypeInPartList === 'Assembly' ? renderListingRM('childPartName')?.length === 0 : false))}
                                                            />
                                                        </Col>

                                                        <Col md="3">
                                                            <SearchableSelectHookForm
                                                                label="RM Specification"
                                                                name={"RMSpecification"}
                                                                placeholder={"Select"}
                                                                Controller={Controller}
                                                                control={control}
                                                                selected={getValues('rmspecification') ? getValues('rmspecification') : ''}
                                                                rules={{ required: getValues('RMName') ? true : false }}
                                                                register={register}
                                                                customClassName="costing-version"
                                                                options={renderListingRM('rmspecification')}
                                                                mandatory={getValues('RMName') ? true : false}
                                                                handleChange={(newValue) => handleRMSpecification(newValue)}
                                                                disabled={getValues('disabled') || isViewFlag || (getValues('editIndex') !== null ? false : (partTypeInPartList === 'Assembly' ? renderListingRM('childPartName')?.length === 0 : false))}
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
                                                                disabled={getValues('disabled') || isViewFlag || (getValues('editIndex') !== null ? false : (partTypeInPartList === 'Assembly' ? renderListingRM('childPartName')?.length === 0 : false))}
                                                            />
                                                        </Col>
                                                        <Col md="3">
                                                            <div className="d-flex justify-content-start mb-2">
                                                                {getValues('isEdit') ? (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="user-btn mt30 pull-left"
                                                                            onClick={updateRow}
                                                                        >
                                                                            <div className="plus"></div>Update
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="mt30 cancel-btn ml-2"
                                                                            onClick={resetForm}
                                                                        >
                                                                            <div className="cancel-icon"></div>Cancel
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="user-btn mt30 pull-left"
                                                                            onClick={() => addRow(0)}
                                                                            disabled={isViewFlag || (!isEditFlag ? (type === Component && getValues('activeTab') === "1" ? false : false) : false)}
                                                                        >
                                                                            <div className="plus"></div>ADD
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="mr15 ml-2 mt30 reset-btn"
                                                                            disabled={isViewFlag || (!isEditFlag ? (type === Component && getValues('activeTab') === "1" ? false : false) : false)}
                                                                            onClick={resetFormAndDropdowns}
                                                                        >
                                                                            Reset
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    {/* RM Table and Buttons */}
                                                    <Row className="mt-3">
                                                        <Col md="12">
                                                            <div className="table-responsive">
                                                                <table className="table table-bordered">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Part No</th>
                                                                            <th>RM Name</th>
                                                                            <th>RM Grade</th>
                                                                            <th>RM Specification</th>
                                                                            <th>Code</th>
                                                                            <th>Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {tableData.length === 0 ? (
                                                                            <tr>
                                                                                <td colspan="15">
                                                                                    <NoContentFound title={EMPTY_DATA} />
                                                                                </td>
                                                                            </tr>
                                                                        ) : (
                                                                            tableData.map((item, index) => (
                                                                                <tr key={index}>
                                                                                    <td>{item.PartNumber !== null ? item.PartNumber : '-'}</td>
                                                                                    <td>{item.RawMaterialName !== null ? item.RawMaterialName : '-'}</td>
                                                                                    <td>{item.RawMaterialGrade !== null ? item.RawMaterialGrade : '-'}</td>
                                                                                    <td>{item.RawMaterialSpecification !== null ? item.RawMaterialSpecification : '-'}</td>
                                                                                    <td>{item.RawMaterialCode !== null ? item.RawMaterialCode : '-'}</td>
                                                                                    <td>
                                                                                        <button
                                                                                            className="Edit mr-2"
                                                                                            type="button"
                                                                                            title="Edit"
                                                                                            onClick={() => editRow(index)}
                                                                                            disabled={isViewFlag}
                                                                                        />
                                                                                        <button
                                                                                            className="Delete"
                                                                                            type="button"
                                                                                            title="Delete"
                                                                                            onClick={() => deleteRow(index)}
                                                                                            disabled={isViewFlag}
                                                                                        />
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                        </TabPane>
                                    )}

                                    {Number(activeTab) === 2 && (
                                        <TabPane tabId="2">
                                            <HeaderTitle title={'Add Forecast'} customClass="mt-3" />
                                            <Row className='mt-3 mb-1'>
                                                <Col md="3">
                                                    <div className="form-group">
                                                        <label>SOP Date<span className="asterisk-required">*</span></label>
                                                        <div id="addRFQDate_container" className="inputbox date-section">
                                                            <DatePicker
                                                                name={'SOPDate'}
                                                                placeholder={'Select'}
                                                                selected={DayTime(sopDate).isValid() ? new Date(sopDate) : ''}
                                                                onChange={handleSOPDateChange}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode='select'
                                                                minDate={new Date()}
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
                                                <Row>
                                                    <Col md="12" className='ag-grid-react'>
                                                        <div className={`ag-grid-wrapper without-filter-grid rfq-grid height-width-wrapper ${sopQuantityList && sopQuantityList.length === 0 ? "overlay-contain" : ""} `}>
                                                            <div className={`ag-theme-material`}>
                                                                <AgGridReact
                                                                    // defaultColDef={state.gridOptions.defaultColDef}
                                                                    floatingFilter={false}
                                                                    domLayout='autoHeight'
                                                                    rowData={sopQuantityList}
                                                                    onGridReady={onGridReady}
                                                                    gridOptions={gridOptionsPart}
                                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                    noRowsOverlayComponentParams={{
                                                                        title: EMPTY_DATA,
                                                                        imagClass: 'imagClass'
                                                                    }}
                                                                    frameworkComponents={frameworkComponents}
                                                                >
                                                                    <AgGridColumn
                                                                        width={"230px"}
                                                                        field="PartNumber"
                                                                        headerName="Part No"
                                                                        tooltipField="PartNumber"
                                                                        cellClass={"colorWhite"}
                                                                        cellRenderer={'partNumberFormatter'}
                                                                    />
                                                                    <AgGridColumn
                                                                        width={"230px"}
                                                                        field="YearName"
                                                                        headerName="Production Year"
                                                                        cellRenderer={'sopFormatter'}
                                                                    />
                                                                    <AgGridColumn
                                                                        width={"230px"}
                                                                        field="Quantity"
                                                                        headerName="Annual Forecast Quantity"
                                                                        cellRenderer={'afcFormatter'}
                                                                        editable={EditableCallback}
                                                                        colId="Quantity"
                                                                    />
                                                                </AgGridReact>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </TabPane>
                                    )}
                                </TabContent>
                            </div>
                        </Container>
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer drawer-sticky-btn">
                        <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                            <button
                                type={'button'}
                                className="reset cancel-btn mr15"
                                onClick={toggleDrawer}
                            >
                                <div className={'cancel-icon'}></div> {'Cancel'}
                            </button>
                            <button
                                type={'button'}
                                className="submit-button save-btn mr-2"
                                onClick={() => handleSave(true)}
                                disabled={isViewFlag || getValues('disabled')}
                            >
                                <div className={"save-icon"}></div>
                                {'Save'}
                            </button>
                        </div>
                    </Row>
                </div>
            </Drawer>
        </div>
    );
}

export default AddForecast;