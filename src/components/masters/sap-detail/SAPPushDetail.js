import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { getPlantSelectListByType, getTaxCodeSelectList, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { autoCompleteDropdown, autoCompleteDropdownPart } from '../../common/CommonFunctions';
import { MESSAGES } from '../../../config/message';
import { checkWhiteSpaces, getCodeBySplitting, } from "../../../helper/validation";
import { VBC_VENDOR_TYPE, ZBC, searchCount } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getPartSelectListWtihRevNo } from '../actions/Volume';
import { getAllPartBopRmList, getMaterialGroupByPart, getPurcahseOrganisationByPlant, getSAPDetailById, saveSAPDetail, updateSAPDetail } from '../actions/SAPDetail';
import Toaster from '../../common/Toaster';
import Button from '../../layout/Button';
import { getExternalIntegrationEvaluationType } from '../../costing/actions/Costing';
import { getAllReasonAPI } from '../actions/ReasonMaster';
import { useLabels } from '../../../helper/core';

function SAPPushDetail(props) {
    const { isEditFlag, id } = props
    const { vendorLabel } = useLabels()
    const [data, setData] = useState({})
    //dropdown loader 
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)
    const [reasonOption, setReasonOption] = useState([])
    const [selectedReason, setSelectedReason] = useState(null);
    const [vendorName, setVendorName] = useState('')
    const [partName, setPartName] = useState('')
    const [partNumber, setPartNumber] = useState('')
    const [plantCode, setPlantCode] = useState('')
    const dispatch = useDispatch()
    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',

    })

    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const taxCodeList = useSelector(state => state.comman.taxCodeList)
    const { evaluationType } = useSelector((state) => state?.costing)
    const VendorLoaderObj = { isLoader: VendorInputLoader }
    const plantLoaderObj = { isLoader: inputLoader }

    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, 'MASTER', '', () => { }))
        dispatch(getTaxCodeSelectList(() => { }))
        dispatch(getAllReasonAPI(true, (res) => {
            if (res.data.Result) {
                setReasonOption(res.data.DataList);
                setSelectedReason(res.data.DataList[0] || null);
            }
        }));
        if (isEditFlag) {
            dispatch(getSAPDetailById(id, res => {
                if (res?.data?.Result) {
                    const sapData = res?.data?.Data;
                    setData(sapData);

                    // Set values for each field
                    setValue('PartNumber', { label: sapData?.PartNumber, value: sapData?.PartId });
                    setValue('PlantCode', { label: sapData?.Plant, value: sapData?.PlantId });
                    setValue('VendorCode', { label: sapData?.Vendor, value: sapData?.VendorId });
                    setValue('MaterialGroup', sapData?.MaterialGroup);
                    setValue('PurcahaseOrg', sapData?.PurchasingOrg);
                    setValue('ValuationType', sapData?.ValuationType);
                    setValue('InfoCategory', sapData?.InfoCategory);
                    setValue('TaxCode', { label: sapData?.TaxCode, value: sapData?.TaxCode });
                    setValue('PlannedDelTime', sapData?.PlannedDelTime);
                }
            }))
        }
    }, []);

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        const temp = [];
        if (label === 'PlantCode') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantName: item.PlantName, PlantCode: item.PlantCode })
                return null
            })
            return temp
        }
        else if (label === 'TaxCode') {
            taxCodeList && taxCodeList?.map((item) => {
                if (item?.TaxCodeId === '0') return false
                temp.push({ label: item.TaxCodeAndDescription, value: item.TaxCodeId, TaxCode: item.TaxCode, Description: item.Description })
                return null
            })
            return temp
        }
        else if (label === 'reason') {
            // Map options for 'department'
            // Example logic...
            reasonOption && reasonOption.map(item => {
                if (item?.Value === '0') return false
                temp.push({ label: item?.Reason, value: item?.ReasonId })
            });
            return temp;
        } else if (label === 'ValuationType') {
            evaluationType && evaluationType?.map(item => {
                if (item?.Value === '') return false
                temp.push({ label: item?.Text, value: item?.Value })
            });
            return temp;
        }
    }

    /**
     * @method filterList
     * @description For Filtering the vendor from List on the basis of input given in vendor dropdown
    */
    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendorName !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setVendorName(resultInput)
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

    /**
     * @method partFilterList
     * @description For Filtering the part from List on the basis of input given in part dropdown
    */
    const partFilterList = async (inputValue) => {


        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {

            const res = await getAllPartBopRmList(resultInput)

            setPartName(resultInput)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true, true)
            } else {
                return partDataAPI
            }
        }
        else {

            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage?.getObject('PartData')
                if (inputValue) {
                    return autoCompleteDropdownPart(inputValue, partData, false, [], false, true)
                } else {
                    return partData
                }
            }
        }
    };

    /**
     * @method onSubmit
     * @description For saving or updation
    */
    const onSubmit = (formData) => {
        const preparedData = {};

        for (const [key, value] of Object.entries(formData)) {
            if (typeof value === 'object' && value !== null) {
                if (key === 'PartNumber' || key === 'VendorCode') {
                    preparedData[key] = value.label;
                } else if (key === 'PlantCode') {
                    preparedData[key] = value.PlantCode;
                } else if (key === 'TaxCode') {
                    preparedData[key] = value.TaxCode;
                } else if (key === 'reason') {
                    preparedData[key] = value.value;
                } else {
                    preparedData[key] = value.label || value.value;
                }
            } else {
                preparedData[key] = value;
            }
        }
        if (isEditFlag) {
            preparedData.SapPushDetailId = data.SapPushDetailId
            dispatch(updateSAPDetail(preparedData, res => {
                if (res?.data?.Result) {
                    Toaster.success('SAP Detail updated successfully.')
                    props.closeDrawer('submit')
                }
            }))
        } else {
            dispatch(saveSAPDetail(preparedData, res => {
                if (res?.data?.Result) {
                    Toaster.success('SAP Detail added successfully.')
                    props.closeDrawer('submit')
                }
            }))
        }
    }
    /**
     * @method handlePartName
     * @description Get Material group from API on change of part
    */
    const getEvaluationType = (plantCode, partNumber) => {
        let reqData = {
            plantCode: plantCode,
            partNumber: partNumber
        }
        dispatch(getExternalIntegrationEvaluationType(reqData, res => { }))
    }
    const handlePartName = (value) => {
        setPartNumber(value.label)
        if (value.value && plantCode !== '') {
            getEvaluationType(plantCode, value.label)
        }
        dispatch(getMaterialGroupByPart(value.value, res => {
            if (res?.data.Result) {
                setValue('MaterialGroup', res.data.Data)
            }
            else if (res.status === 204) {
                Toaster.warning('Material group does not exist for this part number.')
            }
        }))
    }
    /**
    * @method handlePlantNameChange
    * @description Get Purchase Organisation from API on change of plant
   */
    const handlePlantNameChange = (value) => {
        setPlantCode(value.PlantCode)
        if (value.value && partNumber !== '') {
            getEvaluationType(value.PlantCode, partNumber)
        }
        // dispatch(getPurcahseOrganisationByPlant(value.value, res => {
        //     if (res?.data.Result) {
        //         setValue('PurcahaseOrganisation', res.data.Data)
        //     }
        //     else if (res.status === 204) {
        //         Toaster.warning('Purchase Organisation does not exist for this plant.')
        //     }
        // }))

    }
    /**
     * @method cancelHandler
     * @description For closing of drawer
    */
    const cancelHandler = () => {
        props.closeDrawer('cancel')
    }
    /**
    * @method render
    * @description Renders the component
    */

    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
                onClose={(e) => cancelHandler(e)}
            >
                <Container>
                    <div className={"drawer-wrapper layout-min-width-700px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{"Add SAP Detail"}</h3>
                                </div>
                                <div
                                    onClick={cancelHandler}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="pl-3">
                                {props.SAPDetailKeys?.map((el, index) => {
                                    const [key, value] = Object.entries(el)[0];
                                    if (key === 'PartNumber' || key === 'VendorCode') {
                                        return (
                                            <Col md="6" key={index}>
                                                <AsyncSearchableSelectHookForm
                                                    label={key === 'VendorCode' ? `${vendorLabel} Code` : value}
                                                    name={`${key}`}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: true }}
                                                    register={register}
                                                    handleChange={(e) => key === 'PartNumber' ? handlePartName(e) : {}}
                                                    mandatory={true}
                                                    errors={errors[key]}
                                                    // isLoading={VendorLoaderObj}
                                                    asyncOptions={key === 'PartNumber' ? partFilterList : filterList}
                                                    NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                        )
                                    } else if (key === 'PlantCode' || key === 'TaxCode' || key === 'ValuationType') {
                                        return (
                                            <Col md="6" key={index}>
                                                <SearchableSelectHookForm
                                                    label={value}
                                                    name={key}
                                                    placeholder={"Select"}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: key === 'ValuationType' ? false : true }}
                                                    register={register}
                                                    options={renderListing(key)}
                                                    mandatory={key === 'ValuationType' ? false : true}
                                                    handleChange={(e) => handlePlantNameChange(e)}
                                                    errors={errors[key]}
                                                    disabled={isEditFlag && key === 'PlantCode' ? true : false}
                                                    isLoading={plantLoaderObj}

                                                />
                                            </Col>
                                        )
                                    }
                                    else {
                                        return (
                                            <Col md="6" key={index}>
                                                <TextFieldHookForm
                                                    label={value}
                                                    name={key}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    mandatory={true}
                                                    rules={{
                                                        required: true,
                                                        validate: { checkWhiteSpaces },
                                                    }}
                                                    handleChange={(e) => { }}
                                                    className=""
                                                    customClassName={'withBorder scrap-recovery'}
                                                    errors={errors[key]}
                                                    disabled={false}
                                                />
                                            </Col>
                                        )
                                    }
                                })}

                            </Row>

                            <Row className="justify-content-between">
                                <div className="col-sm-12 text-right">
                                    <Button
                                        id="addSAPDetail_cancel"
                                        className="mr-2 mt-0"
                                        variant={"cancel-btn"}

                                        onClick={cancelHandler}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"}
                                    />
                                    <Button
                                        id="addSAPDetail_updateSave"
                                        type="submit"
                                        className="mr5"

                                        icon={"save-icon"}
                                        buttonName={isEditFlag ? "Update" : "Save"}
                                    />
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        </div>
    );
}

export default React.memo(SAPPushDetail)