
import React, { Fragment, useState } from 'react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Col, Row } from 'reactstrap';
import { fetchPlantDataAPI, fetchSpecificationDataAPI, getApprovalTypeSelectList, getPlantSelectListByType, getRawMaterialCategory, getVendorNameByVendorSelectList } from '../../../../actions/Common';
import { searchCount, VBC_VENDOR_TYPE, VBCTypeId, ZBC } from '../../../../config/constants';
import { MESSAGES } from '../../../../config/message';
import { getConfigurationKey, loggedInUserId, showBopLabel } from '../../../../helper';
import { autoCompleteDropdown } from '../../../common/CommonFunctions';
import DayTime from '../../../common/DayTimeWrapper';
import { getCostingSpecificTechnology } from '../../../costing/actions/Costing';
import { AsyncSearchableSelectHookForm, DatePickerHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { getBOPCategorySelectList } from '../../../masters/actions/BoughtOutParts';
import { getClientSelectList } from '../../../masters/actions/Client';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../../../masters/actions/Material';
import { getBoughtOutPartSelectList, getDrawerBOPData } from '../../../masters/actions/Part';
import { getSelectListOfMasters } from '../../../simulation/actions/Simulation';
import CostMovementByMasterReportListing from './CostMovementByMasterReportListing';
import { getOperationPartSelectList } from '../../../masters/actions/OtherOperation';
import { getProcessesSelectList } from '../../../masters/actions/MachineMaster';
import TourWrapper from '../../../common/Tour/TourWrapper';
import { Steps } from '../TourMessages';
import { useTranslation } from "react-i18next"

function MasterCostMovement() {
    const { t } = useTranslation("Reports")

    const [fromDate, setFromDate] = useState('')
    const [maxDate, setMaxDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [minDate, setMinDate] = useState('')
    const [master, setMaster] = useState(0)
    const [technology, setTechnology] = useState('')
    const [costingHeadType, setCostingHeadType] = useState('')
    const [showCustomer, setShowCustomer] = useState(false)
    const [rawMaterial, setRawMaterial] = useState('');
    const [reportListing, setReportListing] = useState(false)
    const [isSurfaceTrue, setIsSurfaceTrue] = useState(false)
    const [plant, setPlant] = useState('')
    const [RMGrade, setRMGrade] = useState('')
    const [RMSpec, setRMSpec] = useState('')
    const [category, setCategory] = useState('')
    const [BOPCategory, setBOPCategory] = useState('')
    const [vendor, setVendor] = useState('')
    const [formData, setFormData] = useState({})
    const [BOPData, setBOPData] = useState([])
    const [operationData, setOperationData] = useState([])
    const [processData, setProcessData] = useState([])
    const [disabledButton, setDisabledButton] = useState(true)
    const [showTechnologyField, setShowTechnologyField] = useState(false)
    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rawMaterialNameSelectList = useSelector(state => state.material.rawMaterialNameSelectList);
    const gradeSelectList = useSelector(state => state.material.gradeSelectList);
    const rmSpecification = useSelector(state => state.comman.rmSpecification);
    const categoryList = useSelector(state => state.comman.categoryList);
    const plantSelectList = useSelector(state => state.comman.plantSelectList)
    const clientSelectList = useSelector((state) => state.client.clientSelectList)
    const boughtOutPartSelectList = useSelector(state => state.part.boughtOutPartSelectList)
    const bopCategorySelectList = useSelector(state => state.boughtOutparts.bopCategorySelectList)
    const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)
    const costingSpecifiTechnology = useSelector(state => state.costing.costingSpecifiTechnology)
    const operationSelectList = useSelector(state => state.otherOperation.operationSelectList)
    const processSelectList = useSelector(state => state.machine.processSelectList)




    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getApprovalTypeSelectList(() => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(fetchPlantDataAPI(() => { }))
        dispatch(getPlantSelectListByType(ZBC, "REPORT", '', () => { }))
    }, [])
    const { handleSubmit, control, register, getValues, setValue, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const handleFromDate = (date) => {
        setFromDate(date);
        setMinDate(date);
    };
    const handleToDate = (date) => {
        setToDate(date);
        setMaxDate(date);
    };

    const resetFields = () => {
        setValue('Technology', '')
        setValue('CostingHeadType', '')
        setValue('Customer', '')
        setValue('RawMaterialId', '')
        setValue('RawMaterialGradeId', '')
        setValue('RawMaterialSpecificationId', '')
        setValue('Category', '')
        setValue('BOPCategory', '')
        setValue('Vendor', '')
        setValue('BOPId', '')
        setValue('OperationId', '')
        setValue('MachineId', '')
        setValue('MachineTypeId', '')
    }


    const handleMasterChange = (event) => {
        setMaster(event.value);
        setDisabledButton(false)
        resetFields()
        switch (Number(event.value)) {
            case 2:
            case 1:
                dispatch(getRMGradeSelectListByRawMaterial('', true, () => { }))
                dispatch(getRawMaterialNameChild(() => { }))
                dispatch(getRawMaterialCategory(() => { }))
                setShowTechnologyField(true)
                break;
            case 4:
            case 5:
                dispatch(getBoughtOutPartSelectList(null, () => { }))
                dispatch(getBOPCategorySelectList(() => { }))
                setShowTechnologyField(false)
                break;
            case 6:
                dispatch(getOperationPartSelectList(() => { }))
                setShowTechnologyField(true)
                break;
            case 7:
                dispatch(getOperationPartSelectList(() => { }))
                setIsSurfaceTrue(true)
                setShowTechnologyField(true)
                break;
            case 9:
                dispatch(getProcessesSelectList(() => { }))
                setShowTechnologyField(true)
                break;
            default:
                break;
        }

    };


    const inputFieldsRenderer = () => {
        switch (Number(master)) {
            case 1:
            case 2:
                return (<>

                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Name'}
                            name={'RawMaterialId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={rawMaterial}
                            options={renderListing('material')}
                            mandatory={false}
                            handleChange={handleRMChange}
                            buttonCross={resetData('RawMaterialId')}
                            errors={errors.RawMaterialId}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Grade'}
                            name={'RawMaterialGradeId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={RMGrade}
                            options={renderListing('grade')}
                            mandatory={false}
                            handleChange={handleGradeChange}
                            buttonCross={resetData('RawMaterialGradeId')}
                            errors={errors.RawMaterialGradeId}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Spec'}
                            name={'RawMaterialSpecificationId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={RMSpec}
                            options={renderListing('specification')}
                            mandatory={false}
                            handleChange={handlespecChange}
                            buttonCross={resetData('RawMaterialSpecificationId')}
                            errors={errors.RawMaterialSpecificationId}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Code'}
                            name={'RMcode'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            // defaultValue={RMcode}
                            options={renderListing('RMCode')}
                            mandatory={false}
                            handleChange={handleRMChange}
                            errors={errors.RMcode}
                            buttonCross={resetData('RMcode')}
                        />
                    </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Category'}
                            name={'CategoryId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={category}
                            options={renderListing('category')}
                            mandatory={false}
                            handleChange={handleCategoryChange}
                            buttonCross={resetData('CategoryId')}
                            errors={errors.CategoryId}
                        />
                    </Col>
                </>
                )
            case 4:
            case 5:
                return (<> <Col md="3">
                    <SearchableSelectHookForm
                        label={`${showBopLabel()} No.`}
                        name={'BOPId'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={""}
                        options={renderListing('BOPName')}
                        mandatory={false}
                        handleChange={handleBOPChange}
                        buttonCross={resetData('BOPId')}
                        errors={errors.BOPId}
                    />
                </Col>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Category'}
                            name={'BOPCategoryId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={BOPCategory}
                            options={renderListing('BOPCategory')}
                            mandatory={false}
                            handleChange={(value) => setBOPCategory(value)}
                            buttonCross={resetData('BOPCategoryId')}
                            errors={errors.BOPCategoryId}
                        />
                    </Col>
                </>)
            case 6:
            case 7:
                return (<>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Operation (Code)'}
                            name={'OperationId'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={renderListing('Operation')}
                            mandatory={false}
                            handleChange={(value) => { setOperationData(value) }}
                            buttonCross={resetData('OperationId')}
                            errors={errors.OperationId}
                        />
                    </Col>
                </>)
            case 9:
                return (<>
                    <Col md="3">
                        <SearchableSelectHookForm
                            label={'Process (Code)'}
                            name={'processCode'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={renderListing('process')}
                            mandatory={false}
                            handleChange={(value) => { setProcessData(value) }}
                            buttonCross={resetData('processCode')}
                            errors={errors.MachineId}
                        />
                    </Col>
                </>)

            default:
                break;
        }
    }
    const resetData = (type) => {
        function resetAllFields() {
            setMaster([])
            setTechnology([])
            setVendor([])
            setRMGrade([])
            setRawMaterial([]);
            setBOPCategory([])
            setBOPData([])
            setCategory([])
            setRMSpec([])
            setProcessData([])
            setOperationData([])
            setMaster('')
            setShowTechnologyField(false)
            setValue('RMcode', '')
            setValue('CategoryId', '')
            setValue('BOPCategoryId', '')
        }
        const resetDate = (params) => {
            setValue(params, '')
            setValue('Masters', '')
            setMaster([])
            setDisabledButton(true)
            setTechnology([])
            resetAllFields()
        }
        switch (type) {
            case 'plant':
                return function resetField() {
                    setValue('plant', '')
                    setPlant([])
                }

            case 'vendor':
                return function resetField() {
                    setValue('vendor', '')
                    setVendor([])
                }
            case 'Customer':
                return function resetField() {
                    setValue('Customer', '')
                }
            case 'costingHeadType':
                return function resetField() {
                    const fields = ['costingHeadType', 'vendor']
                    fields.forEach((field) => {
                        setValue(field, '')
                    })
                    setCostingHeadType([])
                    setShowCustomer(false)
                    setVendor([])
                    setTechnology([])

                }
            case 'Masters':
                return function resetField() {
                    setValue('Masters', '')
                    setDisabledButton(true)
                    resetAllFields()
                }

            case 'Technology':
                return function resetField() {
                    setValue('technology', '')
                    setTechnology([])
                }
            case 'RawMaterialId':
                return function resetField() {
                    const fields = ['RawMaterialId', 'RawMaterialGradeId', 'RawMaterialSpecificationId', 'RMcode',]
                    fields.forEach((field) => {
                        setValue(field, '')
                    })

                    setRMGrade([])
                    setRawMaterial([]);
                    dispatch(fetchSpecificationDataAPI(0, () => { }))
                    setRMSpec([]);
                }
            case 'RawMaterialGradeId':
                return function resetField() {
                    const fields = ['RawMaterialGradeId', 'RawMaterialSpecificationId', 'RMcode']
                    fields.forEach((field) => {
                        setValue(field, '')
                    })
                    dispatch(fetchSpecificationDataAPI(0, () => { }))
                    setRMSpec([])
                    setRMGrade([])
                }
            case 'RawMaterialSpecificationId':
                return function resetField() {
                    setValue('RawMaterialSpecificationId', '')
                    setValue('RMcode', '')
                    setRMSpec([])
                }
            case 'RMcode':
                return function resetField() {
                    setValue('RMcode', '')
                }
            case 'CategoryId':
                return function resetField() {
                    setValue('CategoryId', '')
                    setCategory([])
                }
            case 'BOPCategoryId':
                return function resetField() {
                    setValue('BOPCategoryId', '')
                    setBOPCategory([])
                }
            case 'BOPId':
                return function resetField() {
                    setValue('BOPId', '')
                    setBOPData([])
                }
            case 'processCode':
                return function resetField() {
                    setValue('processCode', '')
                    setProcessData([])
                }
            case 'OperationId':
                return function resetField() {
                    setValue('OperationId', '')
                    setOperationData([])
                }
            case 'fromDate':
                return function resetField() {
                    resetDate('fromDate')
                    setToDate('')
                }
            case 'toDate':
                return function resetField() {
                    resetDate('toDate')
                    setToDate('')
                }
            default:
                return () => { };
        }
    }

    const listMapping = {
        'masters': masterList,
        'costingHeadType': approvalTypeSelectList,
        'material': rawMaterialNameSelectList,
        'grade': gradeSelectList,
        'specification': rmSpecification,
        'category': categoryList,
        'technology': costingSpecifiTechnology,
        'plant': plantSelectList,
        'Customer': clientSelectList,
        'BOPName': boughtOutPartSelectList,
        'BOPCategory': bopCategorySelectList,
        'RMCode': rmSpecification,
        'Operation': operationSelectList,
        'process': processSelectList

    }

    const renderListing = (label) => {
        let temp = [];

        const list = listMapping[label];

        if (list) {
            list.forEach((item) => {
                if (item.Value !== '0') {
                    if (label === 'specification') {
                        temp.push({ label: item.Text, value: item.Value });
                    } else if (label === 'plant') {
                        if (item.PlantId !== '0') {
                            temp.push({ label: item.PlantNameCode, value: item.PlantId });
                        }
                    } else if (label === 'RMCode') {
                        if (item.RMcode !== '0') {
                            temp.push({ label: item.RawMaterialCode, value: item.Value });
                        }

                    }
                    else if (label === 'masters') {

                        if (item.Value === '3' || item.Value === '8' || item.Value === '10' || item.Value === '11') {
                            return false;
                        }
                        else {
                            temp.push({ label: item.Text, value: item.Value });
                        }
                    }
                    else if (label === 'costingHeadType') {
                        if (item.Value === '5' || item.Value === '8') {
                            return false
                        }
                        else {
                            temp.push({ label: item.Text, value: item.Value });
                        }
                    }
                    else {
                        if (item.Value === '0') return false;
                        temp.push({ label: item.Text, value: item.Value });
                    }
                }
            });
        }
        return temp;
    }

    const handleCostingHeadTypeChange = (newValue) => {
        setCostingHeadType(newValue)
        if (newValue.value === '3') {
            setShowCustomer(true)
            dispatch(getClientSelectList((res) => { }))
        }
        else {
            setShowCustomer(false)
        }
    };

    const handleRMChange = (newValue) => {
        if (newValue && newValue !== '') {
            setRawMaterial(newValue);
            dispatch(getRMGradeSelectListByRawMaterial(
                newValue.value,
                true,
                (res) => { },

            ))
        } else {
            setRawMaterial([])
            setRMGrade([])
            setRMSpec([])
            dispatch(getRMGradeSelectListByRawMaterial('', true, (res) => { }))
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };
    const handleGradeChange = (newValue) => {
        setRMGrade(newValue)
        if (newValue && newValue !== '') {
            dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
        } else {
            setRMGrade([])
            setRMSpec([])
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };
    const handlespecChange = (newValue) => {
        if (newValue && newValue !== '') {
            setRMSpec(newValue)
        } else {
            setRMSpec([])
        }
    }
    const handleCategoryChange = (newValue) => {

        if (newValue && newValue !== '') {
            setCategory(newValue)
            dispatch(getRawMaterialNameChild((res) => { }))
        } else {
            setCategory([])
            setRawMaterial([])
            setRMGrade([])
            setRMSpec([])
            dispatch(getRawMaterialNameChild((res) => { }))
            dispatch(fetchSpecificationDataAPI(0, () => { }))
        }
    };

    const handleVendorChange = (newValue) => {
        if (newValue && newValue !== '') {
            setVendor(newValue)
        } else {
            setVendor([])
        }
    };
    const handleBOPChange = (newValue) => {
        if (newValue && newValue !== '') {
            setBOPData(newValue)
        } else {
            setBOPData([])
        }
    }


    const vendorFilterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendor !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setVendor(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
            } else {
                return vendorDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, VendorData, false, [], false)
                } else {
                    return VendorData
                }
            }
        }
    };
    const runReport = () => {
        let fixedData = {
            "FromDate": DayTime(fromDate).format('YYYY-MM-DD HH:mm:ss'),
            "ToDate": DayTime(toDate).format('YYYY-MM-DD HH:mm:ss'),
            "CostingHeadId": Number(costingHeadType.value),
            "TechnologyId": Number(technology.value),
            "PlantId": plant.value,
            "VendorId": vendor.value,
            "IsCustomerDataShow": showCustomer,
            "CustomerId": getValues('Customer').value
        }

        let masterData = {}
        switch (Number(master)) {
            case Number(1):
            case Number(2):
                masterData = {
                    "TypeOfEntry": Number(master) === Number(1) ? 0 : 1,
                    "RawMaterialChildId": rawMaterial.value,
                    "RawMaterialCategoryId": Number(category.value),
                    "RawMaterialGradeId": RMGrade.value,
                    "RawMaterialSpecsId": RMSpec.value,
                }
                break;
            case Number(4):
            case Number(5):
                masterData = {
                    "TypeOfEntry": Number(master) === Number(4) ? 0 : 1,
                    "BoughtOutPartCategoryId": Number(BOPCategory.value),
                    "BoughtOutPartChildId": BOPData.value,


                }
                break;
            case Number(6):
            case Number(7):
                masterData = {
                    "IsSurfaceTreatmentOperation": isSurfaceTrue,
                    // "OperationCode": operationData.label,
                    "OperationChildId": operationData.value,
                }
                break;
            case Number(9):
                masterData = {
                    "ProcessId": processData.value,
                }
                break
            default:
                break;
        }
        let finalObj = {
            ...fixedData,
            ...masterData
        }
        setFormData(finalObj)
        setReportListing(true)
    }

    const viewListingHandler = (value) => {
        setReportListing(value)
    }

    return <Fragment>
        <TourWrapper
            buttonSpecificProp={{ id: "Cost_Movement_Form" }}
            stepsSpecificProp={{
                steps: Steps(t).COSTMOVEMENT
            }} />
        {!reportListing &&

            <form onSubmit={handleSubmit(runReport)}>
                <div className='master-movement-report'>
                    <Row>
                        <Col md="3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`fromDate`}
                                    label={'From Date'}
                                    selected={new Date(fromDate)}
                                    handleChange={(date) => {
                                        handleFromDate(date);
                                    }}
                                    rules={{ required: true }}
                                    maxDate={maxDate}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    // disabled={rowData.length !== 0}
                                    buttonCross={resetData('fromDate')}
                                    mandatory={true}
                                    errors={errors && errors.fromDate}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <div className="inputbox date-section">
                                <DatePickerHookForm
                                    name={`toDate`}
                                    label={'To Date'}
                                    selected={new Date(toDate)}
                                    handleChange={handleToDate}
                                    minDate={minDate}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    placeholder="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    // disabled={rowData.length !== 0}
                                    buttonCross={resetData('toDate')}
                                    mandatory={true}
                                    errors={errors && errors.toDate}
                                />
                            </div>
                        </Col>
                        <Col md="3">
                            <SearchableSelectHookForm
                                label={"Masters"}
                                name={'Masters'}
                                placeholder={'Masters'}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={master.length !== 0 ? master : ''}
                                options={renderListing('masters')}
                                mandatory={true}
                                handleChange={handleMasterChange}
                                errors={errors.Masters}
                                buttonCross={resetData('Masters')}
                                disabled={(fromDate && toDate) === '' ? true : false}
                            />

                        </Col>
                        <Col md="3">
                            <SearchableSelectHookForm
                                label={"Costing Head Type"}
                                name={"costingHeadType"}
                                placeholder={"Costing Head Type"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                defaultValue={costingHeadType}
                                options={renderListing("costingHeadType")}
                                mandatory={false}
                                handleChange={handleCostingHeadTypeChange}
                                errors={errors.costingHeadTypeId}
                                buttonCross={resetData('costingHeadType')}
                            // isDisabled={isEditFlag || isViewFlag}
                            />
                        </Col>
                        {showTechnologyField && <Col md="3">
                            <SearchableSelectHookForm
                                label={'Technology'}
                                name={'Technology'}
                                placeholder={'Technology'}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                defaultValue={technology}
                                options={renderListing('technology')}
                                mandatory={false}
                                handleChange={(e) => { setTechnology(e) }}
                                buttonCross={resetData('Technology')}
                                errors={errors.TechnologyId}
                            />
                        </Col>}
                        {inputFieldsRenderer()}

                        <Col md="3">
                            {showCustomer ? <SearchableSelectHookForm
                                label={"Customer (Code)"}
                                name={"Customer"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                // defaultValue={customer.length !== 0 ? customer : ""}
                                options={renderListing("Customer")}
                                buttonCross={resetData('Customer')}
                                mandatory={false}
                                handleChange={() => { }}
                                errors={errors.Customer}
                            /> :
                                <AsyncSearchableSelectHookForm
                                    label={"Vendor (Code)"}
                                    name={"vendor"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: false }}
                                    register={register}
                                    defaultValue={vendor.length !== 0 ? vendor : ""}
                                    options={renderListing("vendor")}
                                    mandatory={false}
                                    handleChange={handleVendorChange}
                                    // handleChange={() => { }}
                                    errors={errors.vendor}
                                    // isLoading={VendorLoaderObj}
                                    asyncOptions={vendorFilterList}
                                    buttonCross={resetData('vendor')}
                                    disabled={false}
                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                />
                            }

                        </Col>
                        <Col md="3" className='align-items-centeratory'>
                            <SearchableSelectHookForm
                                label={"Plant (Code)"}
                                name={"plant"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: false }}
                                register={register}
                                // defaultValue={vendor.length !== 0 ? vendor : ""}
                                options={renderListing("plant")}
                                mandatory={false}
                                handleChange={(e) => { setPlant(e) }}
                                errors={errors.plant}
                                buttonCross={resetData('plant')}
                            // isLoading={VendorLoaderObj}
                            // disabled={dataProps?.isAddFlag ? false : (dataProps?.isViewFlag || !isEditAll)}
                            />
                        </Col>
                    </Row>
                </div>
                <Row className="sf-btn-footer no-gutters justify-content-between">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 align-items-center">
                            <button type="button" className={"user-btn mr5 save-btn"} disabled={disabledButton} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </div>
                </Row>
            </form>}
        {reportListing && <CostMovementByMasterReportListing viewList={viewListingHandler} masterData={master} formData={formData} />}
    </Fragment>;
}
export default MasterCostMovement;
