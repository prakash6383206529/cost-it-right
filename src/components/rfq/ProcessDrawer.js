import { Drawer } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import { Button, Col, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import NoContentFound from '../common/NoContentFound'
import { Assembly, EMPTY_DATA, searchCount } from '../../config/constants'
import { useSelector, useDispatch } from 'react-redux'
import { getRMGradeSelectListByRawMaterial } from '../masters/actions/Material'
import { fetchSpecificationDataAPI } from '../../actions/Common'
import { getPartSelectListWtihRevNo } from '../masters/actions/Volume'
import { autoCompleteDropdownPart } from '../common/CommonFunctions'
import { reactLocalStorage } from 'reactjs-localstorage'
import { MESSAGES } from '../../config/message'
import classnames from 'classnames';

import { alphaNumeric, checkWhiteSpaces, required } from '../../helper'



function ViewDrawer(props) {
    const dispatch = useDispatch()
    const { isOpen, anchor, isEditFlag, dataProps, technology, nfrId } = props
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const rawMaterialNameSelectList = useSelector(state => state?.material?.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state?.material?.gradeSelectList);
    const rmSpecification = useSelector(state => state?.comman?.rmSpecification);
    const [rmspecification, setRMSpecification] = useState([])
    const [rmName, setRMName] = useState([])
    const [rmgrade, setRMGrade] = useState([])
    const [tableData, setTableData] = useState([])
    const [rmNameSelected, setRmNameSelected] = useState(false)
    const [selectedparts, setSelectedParts] = useState([])
    const [partName, setPartName] = useState('')
    const [storeNfrId, setStoreNfrId] = useState('')
    const [inputLoader, setInputLoader] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [activeTab, setActiveTab] = useState("1");
    const [specification, setSpecification] = useState([])
    const [editIndex, setEditIndex] = useState(null);  // To keep track of the index being edited

    const plantLoaderObj = { isLoader: inputLoader }

    const removeAddedParts = (arr) => {
        const filteredArray = arr.filter((item) => {
            return !selectedparts.some((element) => {
                return element.value === item.value;
            });
        });
        return filteredArray
    }
    const partFilterList = async (inputValue) => {


        const resultInput = inputValue.slice(0, searchCount)
        const nfrChange = nfrId?.value;
        if (inputValue?.length >= searchCount && (partName !== resultInput || nfrChange !== storeNfrId)) {
            const res = await getPartSelectListWtihRevNo(resultInput, technology.value, nfrId?.value, Assembly)
            setPartName(resultInput)
            setStoreNfrId(nfrId?.value)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                let temp = [...autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)]
                return removeAddedParts(temp)

            } else {
                return removeAddedParts([...partDataAPI])
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage.getObject('PartData')
                if (inputValue) {
                    let arr = [...autoCompleteDropdownPart(inputValue, partData, false, [], false)]
                    return removeAddedParts([...arr])
                } else {
                    return removeAddedParts([...partData])
                }
            }
        }

    }
    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('')
    }
    const renderListingRM = (label) => {

        let opts1 = []
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
        }

        return opts1
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
    }
    const resetFormAndDropdowns = () => {

        setValue('partNumber', '')
        setValue('RMName', '')
        setValue('RMGrade', '')
        setValue('RMSpecification', '')
        setValue('Specification', '')
    };

    const handleSpecification = (newValue) => {
        setSpecification({ label: newValue?.label, value: newValue?.value })
    }/**
     * @method addRow
     * @description For updating and adding row
     */
    const addRow = () => {
        const formData = getValues();

        const partNumberLabel = formData.partNumber?.label || '-';
        const rmNameLabel = formData.RMName?.label || '-';
        const rmGradeLabel = formData.RMGrade?.label || '-';
        const rmSpecificationLabel = formData.RMSpecification?.label || '-';
        const specificationValue = formData.Specification || '-';

        const obj = {
            PartNumber: partNumberLabel,
            RmName: rmNameLabel,
            RmGrade: rmGradeLabel,
            RmSpecification: rmSpecificationLabel,
            Specification: specificationValue
        };

        if (isEdit) {
            const newData = [...tableData];
            newData[editIndex] = obj;
            setTableData(newData);
            setIsEdit(false);
            setEditIndex(null);
        } else {
            setTableData(prevData => [...prevData, obj]);
        }

        resetFormAndDropdowns(); // Reset form and dropdowns after adding or updating
    };



    const rateTableReset = () => {
        cancelUpdate()
    }
    const cancelUpdate = () => {
        setIsEdit(false);
        setTableData([]);
        resetFormAndDropdowns();
    };

    /**
      * @method deleteRow
      * @description Deleting single row from table
      */
    const deleteRow = (index) => {
        const tempObj = tableData[index];
        const newData = [...tableData];
        newData.splice(index, 1);
        setTableData(newData);
    };
    /**
     * @method editRow
     * @description for filling the row above table for editing
     */
    const editRow = (index) => {
        setIsEdit(true);
        const tempObj = tableData[index];

        setValue('partNumber', { label: tempObj.PartNumber, value: tempObj.PartNumber });
        setValue('RMName', { label: tempObj.RmName, value: tempObj.RmName });
        setValue('RMGrade', { label: tempObj.RmGrade, value: tempObj.RmGrade });
        setValue('RMSpecification', { label: tempObj.RmSpecification, value: tempObj.RmSpecification });
        setValue('Specification', tempObj.Specification);

        setEditIndex(index);
    };


    return (
        <>
            <Drawer className="top-drawer approval-workflow-drawer" anchor={anchor} open={isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper drawer-1500px'}>

                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{"Process"}</h3>
                                </div>

                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>
                        <Nav tabs className="subtabs mt-0 mb-3">
                            <NavItem>
                                <NavLink
                                    to="/vendor-classification"
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => setActiveTab("1")
                                    }
                                >
                                    RM
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    to="/supplier-approval-summary"
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => setActiveTab("2")
                                    }
                                >
                                    Specification
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab}>
                            {Number(activeTab) === 1 && (<TabPane tabId="1">
                                <Row className={'mb-3 mx-0'}>

                                    <Col className="col-md-15">
                                        <AsyncSearchableSelectHookForm
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
                                            handleChange={() => { }}
                                            errors={errors.partNumber}
                                            // disabled={dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)}
                                            isLoading={plantLoaderObj}
                                            asyncOptions={partFilterList}
                                            NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                        />
                                    </Col>

                                    <>
                                        <Col md="15">
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
                                            // disabled={(dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                            // errors={`${indexInside} CostingVersion`}
                                            />
                                        </Col>
                                        <Col className="col-md-15">
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
                                            // disabled={(dataProps?.isAddFlag ? partNoDisable : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                            // errors={`${indexInside} CostingVersion`}
                                            />
                                        </Col>
                                        <Col className="col-md-15">
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
                                            // disabled={(dataProps?.isAddFlag ? partNoDisable || isNFRFlow : (dataProps?.isViewFlag || !isEditAll)) || isNFRFlow}
                                            // errors={`${indexInside} CostingVersion`}
                                            />
                                        </Col>

                                    </>


                                </Row>
                            </TabPane>)}
                            {Number(activeTab) === 2 && (
                                <TabPane tabId="2">
                                    <div className="tab-pane fade active show" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <Row>
                                            <Col md="3">
                                                <TextFieldHookForm
                                                    label="Specification"
                                                    name={"Specification"}
                                                    validate={[required, alphaNumeric, checkWhiteSpaces]}
                                                    Controller={Controller}
                                                    control={control}
                                                    selected={specification ? specification : ''}
                                                    register={register}
                                                    mandatory={false}
                                                    rules={{
                                                        required: false,
                                                        validate: { alphaNumeric, checkWhiteSpaces },
                                                    }}
                                                    handleChange={(newValue) => handleSpecification(newValue)}
                                                    defaultValue={''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.Specification}
                                                />

                                            </Col>
                                        </Row>
                                    </div>
                                </TabPane>
                            )}
                        </TabContent>


                        <Col md="3" className="pr-0">
                            <div className='mt5'>
                                {isEdit ? (
                                    <>
                                        <button
                                            type="button"
                                            className={'btn btn-primary mt30 pull-left mr5'}
                                            onClick={() => addRow()}
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
                                            onClick={addRow}
                                        // disabled={props.CostingViewMode || disableAll}
                                        >
                                            <div className={'plus'}></div>ADD
                                        </button>
                                        <button
                                            type="button"
                                            className={"mr15 ml-1 mt30 reset-btn"}
                                            // disabled={props.CostingViewMode || disableAll}
                                            onClick={rateTableReset}
                                        >
                                            Reset
                                        </button>
                                    </>
                                )}
                            </div>
                        </Col>

                        <Col md="12">
                            <Table className="table mb-0 forging-cal-table" size="sm">
                                <thead>
                                    <tr>
                                        {activeTab === "2" && (<th>Specification</th>)}
                                        {activeTab === "1" && (<th>Part Number</th>)}
                                        {activeTab === "1" && (<th>RM Grade</th>)}
                                        {activeTab === "1" && (<th>RM Name</th>)}
                                        {activeTab === "1" && (<th>RM Specification</th>)}
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData &&
                                        tableData?.map((item, index) => {
                                            return (
                                                <Fragment>
                                                    <tr key={index}>
                                                        {activeTab === "2" && (<td>{(item.Specification !== null) ? item.Specification : '-'}</td>)}
                                                        {activeTab === "1" && (<td>{(item.PartNumber !== null) ? item.PartNumber : '-'}</td>)}
                                                        {activeTab === "1" && (<td>{(item.RmGrade !== null) ? item.RmGrade : '-'}</td>)}
                                                        {activeTab === "1" && (<td>{(item.RmName !== null) ? item.RmName : '-'}</td>)}
                                                        {activeTab === "1" && (<td>{(item.RmSpecification !== null) ? item.RmSpecification : '-'}</td>)}
                                                        <td>
                                                            {
                                                                <React.Fragment>
                                                                    <button
                                                                        className="Edit mr-2"
                                                                        type={'button'}
                                                                        title='Edit'
                                                                        onClick={() => editRow(index)}
                                                                    />
                                                                    <button
                                                                        className="Delete"
                                                                        title='Delete'
                                                                        type={'button'}
                                                                        onClick={() => deleteRow(index)}
                                                                    />
                                                                </React.Fragment>
                                                            }
                                                        </td>
                                                    </tr>
                                                </Fragment>
                                            )
                                        })}
                                    {tableData && tableData.length === 0 && (
                                        <tr>
                                            <td colspan="15">
                                                <NoContentFound title={EMPTY_DATA} />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Col>

                        {/* <Row> */}
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-md-12 pr-3">
                                <div className="text-right ">
                                    <Button
                                        id="rm-specification-cancel"
                                        className="mr-2"
                                        variant={"cancel-btn"}
                                        //   disabled={setDisable}
                                        onClick={() => cancelUpdate()}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"}
                                    />
                                    <Button
                                        id="rm-specification-submit"
                                        type="submit"
                                        className="save-btn"
                                        //   disabled={setDisable}
                                        icon={"save-icon"}
                                        buttonName={isEditFlag ? "Update" : "Save"}
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
