import React, { Fragment, useEffect, useRef, useState } from "react"
import { fetchSpecificationDataAPI, getAllCity, getCityByCountry, getPlantSelectListByType, getRawMaterialCategory, getVendorNameByVendorSelectList, getExchangeRateSource } from "../../../actions/Common"
import { CBCTypeId, FILE_URL, RAW_MATERIAL_VENDOR_TYPE, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from "../../../config/constants"
import { useDispatch, useSelector } from "react-redux"
import { getCostingSpecificTechnology } from "../../costing/actions/Costing"
import { getConfigurationKey, loggedInUserId } from "../../../helper"
import { SetRawMaterialDetails, fileUploadRMDomestic, getMaterialTypeDataAPI, getRMGradeSelectListByRawMaterial, getRMSpecificationDataAPI, getRMSpecificationDataList, getRawMaterialNameChild, SetCommodityIndexAverage } from "../actions/Material"
import { useForm, Controller, useWatch } from "react-hook-form"
import { Row, Col } from 'reactstrap'
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, AsyncSearchableSelectHookForm, TextAreaHookForm, } from '../../layout/HookFormInputs';
import LoaderCustom from "../../common/LoaderCustom"
import { MESSAGES } from "../../../config/message"
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission } from "../../common/CommonFunctions"
import { reactLocalStorage } from "reactjs-localstorage"
import AsyncSelect from 'react-select/async';
import Button from '../../layout/Button';
import TooltipCustom from "../../common/Tooltip"
import Toaster from "../../common/Toaster"
import {
    acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation, maxLength512,
    checkForNull
} from "../../../helper/validation";
import AddSpecification from "./AddSpecification"
import AddVendorDrawer from "../supplier-master/AddVendorDrawer"
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import imgRedcross from '../../../assests/images/red-cross.png'
import RemarksAndAttachments from "../Remark&Attachments"
import { getClientSelectList } from "../actions/Client"
import AddIndexationMaterialListing from "./AddIndexationMaterialListing"
import HeaderTitle from "../../common/HeaderTitle"
import Association from "./Association"
import { getAssociatedMaterial, getAssociatedMaterialDetails, getIndexSelectList } from "../actions/Indexation"

function AddRMDetails(props) {
    const { Controller, control, register, setValue, getValues, errors, reset, useWatch, states, data, disableAll } = props
    const { isEditFlag, isViewFlag } = data

    const dropzone = useRef(null);
    const [state, setState] = useState({
        vendor: [],
        sourceVendor: [],
        technology: [],
        plants: [],
        customer: [],
        index: [],
        exchangeRate: [],
        inputLoader: false,
        vendorFilter: [],
        sourceVendorFilter: [],
        showErrorOnFocus: false,
        rmName: [],
        isRMDrawerOpen: false,
        rmGrade: [],
        rmSpec: [],
        rmCode: [],
        rmCategory: [],
        isDropDownChanged: false,
        HasDifferentSource: false,
        source: '',
        IsFinancialDataChanged: true,
        isSourceChange: false,
        sourceLocation: [],
        isOpenVendor: false,
        isDisabled: false, // THIS STATE IS USED TO DISABLE NAME, GRADE, SPEC
        isCodeDisabled: false, // THIS STATE IS USED TO DISABLE CODE,
        files: [],
        remarks: '',
        isRmOpen: true,
        isCommodityOpen: false,
        isOpenAssociation: false,
        isVendorAccOpen: true,
        commodityDetails: [],
        isShowIndexCheckBox: false
    });

    const dispatch = useDispatch()

    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const customerSelectList = useSelector((state) => state.client.clientSelectList)
    const technologySelectList = useSelector((state) => state.costing.costingSpecifiTechnology)
    const rawMaterialNameSelectList = useSelector((state) => state.material.rawMaterialNameSelectList)
    const gradeSelectList = useSelector((state) => state.material.gradeSelectList)
    const rmSpecificationSelectList = useSelector((state) => state.comman.rmSpecification)
    const categoryList = useSelector((state) => state.comman.categoryList)
    const rmSpecificationList = useSelector((state) => state.material.rmSpecificationList)
    const cityList = useSelector((state) => state.comman.cityList)
    const RMIndex = getConfigurationKey()?.IsShowMaterialIndexation



    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
        dispatch(getRawMaterialCategory((res) => { }))
        dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }))
        dispatch(getAllCity(cityId => {
            dispatch(getCityByCountry(cityId, 0, () => { }))
        }))
        if (getCostingTypeIdByCostingPermission() === CBCTypeId) {
            dispatch(getClientSelectList(() => { }))
        }
        dispatch(SetRawMaterialDetails({ HasDifferentSource: state.HasDifferentSource }, () => { }))


    }, [])
    useEffect(() => {
        if (states.costingTypeId === CBCTypeId) {
            dispatch(getClientSelectList(() => { }))
        }
    }, [states.costingTypeId])
    useEffect(() => {
        if (!isEditFlag && !isViewFlag) {
            if (props?.DataToChange) {
                let plantArray = [];
                let Data = props?.DataToChange
                Data && Data?.Plant?.map((item) => {
                    plantArray.push({ label: item?.PlantName, value: item?.PlantId })
                    return plantArray;
                })
                setValue('Technology', { label: Data?.TechnologyName, value: Data?.TechnologyId })
                setValue('Plants', plantArray)
                setValue('RawMaterialName', { label: Data?.RawMaterialName, value: Data?.RawMaterialId })
                setValue('RawMaterialGrade', { label: Data?.RawMaterialGradeName, value: Data?.RMGrade })
                setValue('RawMaterialSpecification', { label: Data?.RawMaterialSpecificationName, value: Data?.RMSpec })
                setValue('RawMaterialCategory', { label: Data?.RawMaterialCategoryName, value: Data?.Category })
                setValue('RawMaterialCode', { label: Data?.RawMaterialCode, value: Data?.RMSpec })
                setValue('Vendor', { label: Data?.VendorName, value: Data?.Vendor })
                setValue('Source', Data?.Source)
                setValue('SourceLocation', { label: Data?.SourceSupplierLocationName, value: Data?.SourceLocation })
                setValue('clientName', { label: Data?.CustomerName, value: Data?.CustomerId })
                setValue('Index', { label: Data?.IndexExchangeName, value: Data?.IndexExchangeId })
                setValue('ExchangeSource', { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceName })
                setValue('Material', { label: Data?.MaterialType, value: Data?.MaterialId })
                console.log(Data.SourceVendorName, "Data.SourceVendorName");
                setValue('sourceVendorName', Data?.IsSourceVendor ? { label: Data?.SourceVendorName, value: Data?.SourceVendorId } : [])
                dispatch(SetRawMaterialDetails({ Technology: { label: Data?.TechnologyName, value: Data?.TechnologyId }, SourceVendor: Data?.IsSourceVendor ? { label: Data?.SourceVendorName, value: Data?.SourceVendorId } : [] }, () => { }))
                setState(prevState => ({
                    ...prevState,
                    technology: { label: Data?.TechnologyName, value: Data?.TechnologyId },
                    plants: plantArray,
                    rmName: Data?.RawMaterialName !== undefined ? { label: Data?.RawMaterialName, value: Data?.RawMaterialId } : [],
                    rmGrade: Data?.RawMaterialGradeName !== undefined ? { label: Data?.RawMaterialGradeName, value: Data?.RMGrade } : [],
                    rmSpec: Data?.RawMaterialSpecificationName !== undefined ? { label: Data?.RawMaterialSpecificationName, value: Data?.RMSpec } : [],
                    rmCategory: Data?.RawMaterialCategoryName !== undefined ? { label: Data?.RawMaterialCategoryName, value: Data?.Category } : [],
                    rmCode: Data?.RMCode !== undefined ? { label: Data?.RawMaterialCode, value: Data?.RMSpec } : [],
                    vendor: { label: Data?.VendorName, value: Data?.Vendor },
                    HasDifferentSource: Data?.HasDifferentSource,
                    source: Data?.Source,
                    sourceLocation: Data?.SourceSupplierLocationName !== undefined ? { label: Data?.SourceSupplierLocationName, value: Data?.SourceLocation } : [],
                    customer: { label: Data?.CustomerName, value: Data?.CustomerId },
                    sourceVendor: Data?.IsSourceVendor ? { label: Data?.SourceVendorName, value: Data?.SourceVendorId } : []
                }))
            }
        }
    }, [])
    useEffect(() => {
        dispatch(SetRawMaterialDetails({ HasDifferentSource: state.HasDifferentSource }, () => { }))
    }, [state.HasDifferentSource])
    /**
     * @method renderListing
     * @description Used show listing 
     */
    const renderListing = (label) => {
        const temp = []

        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }

        if (label === 'ClientList') {
            customerSelectList && customerSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }



        if (label === 'Technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'rawMaterialName') {
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
        if (label === 'category') {
            categoryList && categoryList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
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
        if (label === 'SourceLocation') {
            cityList && cityList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }
    /**
   * @method getmaterial
   * @description get material name on the basis of raw material and  grade
   */
    const getmaterial = (gradeId) => {
        dispatch(getMaterialTypeDataAPI('', gradeId, (res) => {
            if (res) {
                let Data = res.data.Data


                setValue('Material', { label: Data.MaterialType, value: Data.MaterialTypeId })
                dispatch(SetCommodityIndexAverage(Data.MaterialTypeId, 0, '', 0, '', '', ''))

                dispatch(getMaterialTypeDataAPI(Data.MaterialTypeId, '', (res) => {
                    let Data = res.data.Data
                    setState(prevState => ({ ...prevState, commodityDetails: Data.MaterialCommodityStandardDetails }))

                }))
            }
        }))
    }
    /**
     * @method handlePlants
     * @description called
     */
    const handlePlants = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, plants: newValue }));
        } else {
            setState(prevState => ({ ...prevState, plants: [] }));
        }
        dispatch(SetRawMaterialDetails({ Plants: newValue }, () => { }))
        props?.commonFunction(newValue ? newValue.value : '')
    }
    /**
 * @method handleTechnology
 * @description called
 */
    const handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, technology: newValue }));
        } else {
            setState(prevState => ({ ...prevState, technology: [] }));
        }
        dispatch(SetRawMaterialDetails({ Technology: newValue }, () => { }))
    }
    /**
* @method handleCustomer
* @description called
*/
    const handleCustomer = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, customer: newValue }));
        } else {
            setState(prevState => ({ ...prevState, customer: [] }));
        }
        dispatch(SetRawMaterialDetails({ customer: newValue }, () => { }))
    };

    const handleVendor = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            if (newValue.value === state?.sourceVendor?.value) {
                Toaster.warning('Vendor and Source Vendor cannot be the same');
                setState(prevState => ({ ...prevState, vendor: [] }));
            } else {
                setState(prevState => ({ ...prevState, vendor: newValue }));
                dispatch(SetRawMaterialDetails({ Vendor: newValue }, () => { }));
            }
        } else {
            setState(prevState => ({ ...prevState, vendor: [] }));
            dispatch(SetRawMaterialDetails({ Vendor: [] }, () => { }));
        }
    };

    const handleSourceVendor = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            if (newValue.value === state?.vendor?.value) {
                Toaster.warning('Vendor and Source Vendor cannot be the same');
                setValue("sourceVendorName", { label: newValue?.label, value: newValue?.value })
                setState(prevState => ({ ...prevState, sourceVendor: [] }));
            } else {
                setState(prevState => ({ ...prevState, sourceVendor: newValue }));
                dispatch(SetRawMaterialDetails({ SourceVendor: newValue }, () => { }));
            }
        } else {
            setState(prevState => ({ ...prevState, sourceVendor: [] }));
            dispatch(SetRawMaterialDetails({ SourceVendor: [] }, () => { }));
        }
    };
    /**
   * @method handleRM
   * @description  used to handle row material selection
   */
    const handleRM = (newValue, actionMeta) => {


        if (newValue && newValue !== '') {
            delete errors.RawMaterialCode
            setState(prevState => ({ ...prevState, rmName: newValue, rmGrade: [], rmCode: [], rmSpec: [], rmCategory: [], isCodeDisabled: true }));
            dispatch(getRMGradeSelectListByRawMaterial(newValue?.value, false, () => { },))
        } else {
            setState(prevState => ({ ...prevState, rmName: [], rmGrade: [], rmCode: [], rmSpec: [], rmCategory: [], isCodeDisabled: false }));
            setValue('RawMaterialName', '')
            setValue('RawMaterialGrade', '')
            setValue('RawMaterialSpecification', '')
            setValue('RawMaterialCode', '')
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
            setState(prevState => ({ ...prevState, rmGrade: newValue, rmSpec: [], rmCode: [], rmCategory: [], isCodeDisabled: true }));
            dispatch(fetchSpecificationDataAPI(newValue.value, (res) => { }))
            getmaterial(newValue?.value)
        } else {
            setState(prevState => ({ ...prevState, rmGrade: [], rmSpec: [], rmCode: [], rmCategory: [], isCodeDisabled: false }));
            dispatch(fetchSpecificationDataAPI(0, (res) => { }))
        }
    }
    /**
   * @method handleSpecification
   * @description  used to handle row material grade selection
   */
    const handleSpecification = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, rmSpec: newValue, rmCode: { label: newValue.RawMaterialCode, value: newValue.value }, rmCategory: [], isCodeDisabled: true }));
            setValue('RawMaterialCode', { label: newValue.RawMaterialCode, value: newValue.value })
        } else {
            setState(prevState => ({ ...prevState, rmSpec: [], rmCode: [], rmCategory: [], isCodeDisabled: false }));
        }
    }
    /**
 * @method handleCategory
 * @description  used to handle category selection
 */
    const handleCategory = (newValue, actionMeta) => {
        setState(prevState => ({ ...prevState, rmCategory: newValue, isDropDownChanged: true }));
    }
    /**
    * @method handleCode
    * @description  used to handle code 
    */
    const handleCode = (newValue) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({
                ...prevState,
                rmCode: newValue, isDisabled: true
            }))
            delete errors.RawMaterialName
            dispatch(getRMSpecificationDataAPI(newValue.value, true, (res) => {
                if (res.status === 204) {
                    setState(prevState => ({
                        ...prevState,
                        rmName: { label: '', value: '', },
                        rmGrade: { label: '', value: '', },
                        rmSpec: { label: '', value: '', }
                    }))
                    Toaster.warning("The Raw Material Grade and Specification has set as unspecified. First update the Grade and Specification against this Raw Material Code from Manage Specification tab.")
                    return false
                }
                let Data = res?.data?.Data
                setState(prevState => ({
                    ...prevState,
                    rmName: { label: Data.RawMaterialName, value: Data.RawMaterialId, },
                    rmGrade: { label: Data.GradeName, value: Data.GradeId },
                    rmSpec: { label: Data.Specification, value: Data.SpecificationId }
                }))
                setValue('RawMaterialName', { label: Data.RawMaterialName, value: Data.RawMaterialId, })
                setValue('RawMaterialGrade', { label: Data.GradeName, value: Data.GradeId })
                setValue('RawMaterialSpecification', { label: Data.Specification, value: Data.SpecificationId })
                getmaterial(Data.GradeId)
            }))
        } else {
            setState({ rmCode: [], RawMaterial: [], RMGrade: [], RMSpec: [], isDisabled: false })
            setValue('RawMaterialName', '')
            setValue('RawMaterialGrade', '')
            setValue('RawMaterialSpecification', '')
        }
    }
    const handleSource = (newValue, actionMeta) => {
        const { isEditFlag, DataToChange } = state
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, source: newValue, isSourceChange: true, isDropDownChanged: true }))
        }
        if (isEditFlag && (DataToChange.Source !== newValue)) {
            setState(prevState => ({ ...prevState, IsFinancialDataChanged: true }))
        }
        else if (isEditFlag) {
            setState(prevState => ({ ...prevState, IsFinancialDataChanged: false }))
        }
    }

    /**
     * @method handleSourceSupplierCity
     * @description called
     */
    const handleSourceSupplierCity = (newValue, actionMeta) => {
        const { isEditFlag, DataToChange } = state
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, sourceLocation: newValue, isSourceChange: true }))
        } else {
            setState(prevState => ({ ...prevState, sourceLocation: [] }))
        }
        if (isEditFlag && (DataToChange.SourceLocation !== newValue.value)) {
            setState(prevState => ({ ...prevState, IsFinancialDataChanged: true }))
        }
        else if (isEditFlag) {
            setState(prevState => ({ ...prevState, IsFinancialDataChanged: false }))
        }
    }

    const openRMdrawer = () => {
        setState(prevState => ({ ...prevState, isRMDrawerOpen: true }));
    }

    const openAssociationDrawer = () => {
        setState(prevState => ({ ...prevState, isOpenAssociation: true }));
    }

    const vendorFilterList = async (inputValue) => {
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && state.vendorFilter !== resultInput) {
            setState(prevState => ({ ...prevState, inputLoader: true }))
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setState(prevState => ({ ...prevState, inputLoader: false, vendorFilter: resultInput }))
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
    const sourceVendorFilterList = async (inputValue) => {
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && state.sourceVendorFilter !== resultInput) {
            setState(prevState => ({ ...prevState, inputLoader: true }))
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setState(prevState => ({ ...prevState, inputLoader: false, sourceVendorFilter: resultInput }))
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
    const vendorToggle = () => {
        setState(prevState => ({ ...prevState, isOpenVendor: true }));
    }
    /**
 * @method onPressDifferentSource
 * @description Used for Different Source checked
 */
    const onPressDifferentSource = () => {
        setState(prevState => ({ ...prevState, HasDifferentSource: !state.HasDifferentSource }));
        dispatch(SetRawMaterialDetails({ HasDifferentSource: state.HasDifferentSource }, () => { }))
    }
    const closeRMDrawer = (e = '', data = {}) => {
        setState(prevState => ({ ...prevState, isRMDrawerOpen: false }))
        /* FOR SHOWING RM ,GRADE AND SPECIFICATION SELECTED IN RM SPECIFICATION DRAWER*/
        dispatch(getRawMaterialNameChild(() => {
            if (Object.keys(data).length > 0) {
                dispatch(getRMGradeSelectListByRawMaterial(data.RawMaterialId, false, (res) => {
                    dispatch(fetchSpecificationDataAPI(data.GradeId, (res) => {
                        const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find((item) => item.Value === data.RawMaterialId,)
                        const gradeObj = gradeSelectList && gradeSelectList.find((item) => item.Value === data.GradeId)
                        const specObj = res.data.DataList && res.data.DataList.find((item) => {
                            return item.Text === data.Specification;
                        });
                        setState(prevState => ({
                            ...prevState,
                            RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value, },
                            RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
                            RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value, RawMaterialCode: specObj.RawMaterialCode } : [],
                            rmCode: specObj !== undefined ? { label: specObj.RawMaterialCode, value: specObj.Value } : [],
                        }))
                        setValue("RawMaterialName", { label: materialNameObj.Text, value: materialNameObj.Value, })
                        setValue("RawMaterialGrade", { label: gradeObj.Text, value: gradeObj.Value, })
                        setValue("RawMaterialSpecification", { label: specObj?.Text, value: specObj?.Value, RawMaterialCode: specObj?.RawMaterialCode })
                        setValue("RawMaterialCode", { label: specObj?.RawMaterialCode, value: specObj?.Value })
                    }))
                }))
            }
        }))
        dispatch(getRMSpecificationDataList({ GradeId: null }, () => { }));

    }
    const closeVendorDrawer = async (e = '', formData = {}, type) => {
        if (type === 'submit') {
            setState(prevState => ({ ...prevState, isOpenVendor: false }))
            const { costingTypeId } = props
            if (costingTypeId !== VBCTypeId) {
                if (state.vendor && state.vendor.length > 0) {
                    const res = await getVendorNameByVendorSelectList(RAW_MATERIAL_VENDOR_TYPE, state.vendor)
                    let vendorDataAPI = res?.data?.SelectList
                    reactLocalStorage?.setObject('vendorData', vendorDataAPI)
                }
                if (Object.keys(formData).length > 0) {
                    setState(prevState => ({ ...prevState, vendor: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, }))
                }
            } else {
                if (state.vendor && state.vendor.length > 0) {
                    const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, state.vendor)
                    let vendorDataAPI = res?.data?.SelectList
                    reactLocalStorage?.setObject('vendorData', vendorDataAPI)
                }
                if (Object.keys(formData).length > 0) {
                    setState(prevState => ({ ...prevState, vendor: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, }))
                }
            }
        } else {
            setState(prevState => ({ ...prevState, isOpenVendor: false }))
        }
    }

    const closeAssociationDrawer = (e = "") => {
        setState(prevState => ({ ...prevState, isOpenAssociation: false }));
    }

    /**
* @method setDisableFalseFunction
* @description setDisableFalseFunction
*/
    const setDisableFalseFunction = () => {
        const loop = checkForNull(dropzone.current.files.length) - checkForNull(state.files.length)
        if (checkForNull(loop) === 1 || checkForNull(dropzone.current.files.length) === checkForNull(state.files.length)) {
            setState(prevState => ({ ...prevState, setDisable: false, attachmentLoader: false }))
        }
    }

    /**
 * @method rmToggle
 * @description LOAN ROW OPEN  AND CLOSE
*/
    const rmToggle = () => {
        setState(prevState => ({ ...prevState, isRmOpen: !state.isRmOpen }))
    }

    const openVendorAcc = () => {
        setState(prevState => ({ ...prevState, isVendorAccOpen: !state.isVendorAccOpen }))
    }
    const isShowIndexCheckBox = () => {
        setState(prevState => ({ ...prevState, isShowIndexCheckBox: !state.isShowIndexCheckBox }))
        dispatch(SetRawMaterialDetails({ isShowIndexCheckBox: !state.isShowIndexCheckBox }, () => { }))
    }
    return (
        <Fragment>
            {/* <Row> */}
            <Row className="mb-3 accordian-container">
                <Col md="6" className='d-flex align-items-center'>
                    <HeaderTitle
                        title={'Raw Material:'}
                        customClass={'Personal-Details'}
                    />
                </Col>
                <Col md="6">
                    <div className={'right-details text-right'}>
                        <button className="btn btn-small-primary-circle ml-1" onClick={rmToggle} type="button">{state.isRmOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                    </div>
                </Col>
                {
                    <div className={`accordian-content row mx-0 w-100 ${state.isRmOpen ? '' : 'd-none'}`} >
                        <Col className="col-md-15">
                            <SearchableSelectHookForm
                                label={"Technology"}
                                name={"Technology"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                // defaultValue={state.technology?.length !== 0 ? state?.technology : ""}
                                options={renderListing("Technology")}
                                mandatory={true}
                                handleChange={handleTechnology}
                                errors={errors?.Technology}
                                disabled={isEditFlag || isViewFlag}
                            />
                        </Col>
                        <Col className="col-md-15">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                    <SearchableSelectHookForm
                                        name="RawMaterialName"
                                        label="Name"
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        options={renderListing("rawMaterialName")}
                                        mandatory={true}
                                        handleChange={handleRM}
                                        // defaultValue={state.rmName.length !== 0 ? state.rmName : ""}
                                        className="fullinput-icon"
                                        disabled={isEditFlag || isViewFlag || state.isDisabled}
                                        errors={errors.RawMaterialName}
                                        isClearable={true}
                                    />
                                </div>
                                {!(isEditFlag || isViewFlag) && (
                                    <Button
                                        id="addRMDomestic_RMToggle"
                                        onClick={openRMdrawer}
                                        className={`right`}
                                        variant="plus-icon-square"
                                    />
                                )}
                            </div>
                        </Col>
                        <Col className="col-md-15">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                    <SearchableSelectHookForm
                                        name="RawMaterialGrade"
                                        label="Grade"
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        options={renderListing("grade")}
                                        required={true}
                                        mandatory={true}
                                        handleChange={handleGrade}
                                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                                        disabled={isEditFlag || isViewFlag || state.isDisabled}
                                        errors={errors.RawMaterialGrade}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col className="col-md-15">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                    <SearchableSelectHookForm
                                        name="RawMaterialSpecification"
                                        label="Specification"
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        options={renderListing("specification")}
                                        mandatory={true}
                                        handleChange={handleSpecification}
                                        // defaultValue={state.rmSpec.length !== 0 ? state.rmSpec : ""}
                                        disabled={isEditFlag || isViewFlag || state.isDisabled}
                                        errors={errors.RawMaterialSpecification}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col className="col-md-15">
                            <TooltipCustom id="category" tooltipText="Category will come here like CutToFit, CutToLength." />
                            <SearchableSelectHookForm
                                name="RawMaterialCategory"
                                label="Category"
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                options={renderListing("category")}
                                // defaultValue={state.rmCategory.length !== 0 ? state.rmCategory : ""}
                                mandatory={true}
                                handleChange={handleCategory}
                                disabled={isEditFlag || isViewFlag}
                                errors={errors.RawMaterialCategory}
                            />
                        </Col>
                        <Col className="col-md-15">
                            <SearchableSelectHookForm
                                label={`Code`}
                                name={'RawMaterialCode'}
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
                                disabled={isEditFlag || isViewFlag || state.isCodeDisabled}
                                errors={errors.RawMaterialCode}
                            />
                        </Col>
                        {((states.costingTypeId === ZBCTypeId || (states.costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (states.costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) && (<>
                            <Col className="col-md-15">
                                <SearchableSelectHookForm
                                    label={'Plant (Code)'}
                                    name="Plants"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{ required: true }}
                                    placeholder={'Select'}
                                    options={renderListing("plant")}
                                    defaultValue={state.plants}
                                    handleChange={handlePlants}
                                    isMulti={(states.costingTypeId === ZBCTypeId && !getConfigurationKey().IsMultipleUserAllowForApproval) ? true : false}
                                    disabled={isEditFlag || isViewFlag}
                                    errors={errors.Plants}
                                />
                            </Col>
                        </>)
                        )}
                        {/* <Row > */}
                        <Col md="3" className="mt-4 pt-2">
                            <div className=" flex-fills d-flex justify-content-between align-items-center">
                                {getConfigurationKey().IsShowMaterialIndexation && (
                                    <label id="AddRMDomestic_HasDifferentSource"
                                        className={`custom-checkbox w-auto mb-0 `}
                                        onChange={isShowIndexCheckBox}
                                    >
                                        RM Indexation
                                        <input
                                            type="checkbox"
                                            checked={state.isShowIndexCheckBox}
                                            disabled={isViewFlag}
                                        />
                                        <span
                                            className=" before-box p-0"
                                            checked={state.isShowIndexCheckBox}
                                            onChange={isShowIndexCheckBox}
                                        />
                                    </label>
                                )}
                            </div>
                        </Col>
                        {/* </Row> */}
                        {states.costingTypeId === CBCTypeId && (
                            <>
                                <Col className="col-md-15">
                                    <SearchableSelectHookForm
                                        name="clientName"
                                        label="Customer (Code)"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{ required: true }}
                                        placeholder={'Select'}
                                        options={renderListing("ClientList")}
                                        handleChange={handleCustomer}
                                        disabled={isEditFlag || isViewFlag}
                                        errors={errors.clientName}
                                    />
                                </Col>
                            </>
                        )}

                    </div>
                }

            </Row>

            {states.costingTypeId !== CBCTypeId && <Row className="mb-3 accordian-container">
                <Col md="6" className='d-flex align-items-center'>
                    <HeaderTitle
                        title={'Vendor:'}
                        customClass={'Personal-Details'}
                    />
                </Col>
                <Col md="6">
                    <div className={'right-details text-right'}>
                        <button className="btn btn-small-primary-circle ml-1" onClick={openVendorAcc} type="button">{state.isVendorAccOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                    </div>
                </Col>
                {<Row className={`align-items-center mb-3 ${state.isVendorAccOpen ? '' : 'd-none'}`}>
                    {states.costingTypeId !== CBCTypeId && (<>
                        <Col md="3">
                            <label>{"Vendor (Code)"}<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center p-relative async-select">
                                <div className="fullinput-icon p-relative">
                                    {state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                        name="vendorName"
                                        loadOptions={vendorFilterList}
                                        onChange={(e) => handleVendor(e)}
                                        value={state.vendor}
                                        noOptionsMessage={({ inputValue }) => inputValue?.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                        isDisabled={isEditFlag || isViewFlag}
                                        onKeyDown={(onKeyDown) => {
                                            if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                        }}
                                        onBlur={() => setState(prevState => ({ ...prevState, showErrorOnFocus: false }))}
                                    />
                                </div>
                                {!(isEditFlag || isViewFlag) && (

                                    <Button
                                        id="addRMDomestic_vendorToggle"
                                        onClick={vendorToggle}
                                        className={"right mt-0"}
                                        variant="plus-icon-square"
                                    />
                                )}
                            </div>
                            {((state.showErrorOnFocus && state.vendor?.length === 0)) && <div className='text-help mt-1'>This field is required.</div>}
                        </Col>
                        <Col md="3" className="mt-4 pt-2">
                            <div className=" flex-fills d-flex justify-content-between align-items-center">
                                {/* <h5>{"Vendor:"}</h5> */}
                                {!getConfigurationKey().IsShowSourceVendorInRawMaterial && (
                                    <label id="AddRMDomestic_HasDifferentSource"
                                        className={`custom-checkbox w-auto mb-0 ${(states.costingTypeId === VBCTypeId) ? "disabled" : ""
                                            }`}
                                        onChange={onPressDifferentSource}
                                    >
                                        Has Difference Source?
                                        <input
                                            type="checkbox"
                                            checked={state.HasDifferentSource}
                                            disabled={(states.costingTypeId === VBCTypeId) ? true : false}
                                        />
                                        <span
                                            className=" before-box p-0"
                                            checked={state.HasDifferentSource}
                                            onChange={onPressDifferentSource}
                                        />
                                    </label>
                                )}
                            </div>
                        </Col>
                    </>
                    )}
                    {states.costingTypeId === VBCTypeId && (
                        <>
                            {getConfigurationKey().IsShowSourceVendorInRawMaterial && <Col md="3">
                                <label>{"Source Vendor (Code)"}</label>
                                <div className="d-flex justify-space-between align-items-center p-relative async-select">
                                    <div className="fullinput-icon p-relative">
                                        {state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                        <AsyncSelect
                                            name="sourceVendorName"
                                            loadOptions={sourceVendorFilterList}
                                            onChange={(e) => handleSourceVendor(e)}
                                            value={state.sourceVendor}
                                            noOptionsMessage={({ inputValue }) => inputValue?.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                            isDisabled={isEditFlag || isViewFlag}
                                            onKeyDown={(onKeyDown) => {
                                                if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                            }}
                                            onBlur={() => setState(prevState => ({ ...prevState, showErrorOnFocus: false }))}
                                        />
                                    </div>
                                </div>
                                {/* {((state.showErrorOnFocus && state.vendor?.length === 0)) && <div className='text-help mt-1'>This field is required.</div>} */}
                            </Col>}
                            {!getConfigurationKey().IsShowSourceVendorInRawMaterial && <>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Source`}
                                        name={"Source"}
                                        type="text"
                                        placeholder={"Enter"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: false,
                                            validate: { acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation },
                                        }}
                                        handleChange={handleSource}
                                        defaultValue={state.source}
                                        className=" "
                                        customClassName="mb-0 withBorder"
                                        disabled={isViewFlag}
                                        errors={errors.Source}

                                    />
                                </Col>
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        name="SourceSupplierCityId"
                                        label="Source Location"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        placeholder={"Select"}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                        }}
                                        options={renderListing("SourceLocation")}
                                        customClassName="mb-0 withBorder"
                                        handleChange={handleSourceSupplierCity}
                                        defaultValue={state.sourceLocation}
                                        disabled={isViewFlag}
                                        errors={errors.SourceSupplierCityId}
                                    />
                                </Col>
                            </>}

                        </>
                    )}
                </Row>}
                {
                    state.isRMDrawerOpen && (
                        <AddSpecification
                            isOpen={state.isRMDrawerOpen}
                            closeDrawer={closeRMDrawer}
                            isEditFlag={false}
                            ID={""}
                            anchor={"right"}
                            AddAccessibilityRMANDGRADE={props.AddAccessibilityRMANDGRADE}
                            EditAccessibilityRMANDGRADE={props.EditAccessibilityRMANDGRADE}
                            RawMaterial={""}
                            RMGrade={""}
                            isRMDomesticSpec={true}
                            Technology={state.Technology?.value}
                        />
                    )
                }
                {
                    state.isOpenVendor && (
                        <AddVendorDrawer
                            isOpen={state.isOpenVendor}
                            isRM={true}
                            closeDrawer={closeVendorDrawer}
                            isEditFlag={false}
                            ID={""}
                            anchor={"right"}
                        />
                    )
                }
                {
                    state.isOpenAssociation && (
                        <Association
                            isOpen={state.isOpenAssociation}
                            closeDrawer={closeAssociationDrawer}
                            isEditFlag={false}
                            ID={""}
                            anchor={"right"}
                        />
                    )
                }
            </Row>}
        </Fragment>
    )
}
export default AddRMDetails