import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { autoCompleteDropdown, autoCompleteDropdownPart } from '../../common/CommonFunctions';
import { MESSAGES } from '../../../config/message';
import { checkWhiteSpaces, getCodeBySplitting, } from "../../../helper/validation";
import { VBC_VENDOR_TYPE, ZBC, searchCount } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getPartSelectListWtihRevNo } from '../actions/Volume';
import { getMaterialGroupByPart, getPurcahseOrganisationByPlant, getSAPDetailById, saveSAPDetail, updateSAPDetail } from '../actions/SAPDetail';
import Toaster from '../../common/Toaster';
import Button from '../../layout/Button';
import { useLabels } from '../../../helper/core';

function SAPPushDetail(props) {
    const { isEditFlag, id } = props
    const vendorLabel = useLabels()
    const [data, setData] = useState({})
    //dropdown loader 
    const [inputLoader, setInputLoader] = useState(false)
    const [VendorInputLoader, setVendorInputLoader] = useState(false)
    const [vendorName, setVendorName] = useState('')
    const [partName, setPartName] = useState('')
    const dispatch = useDispatch()
    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',

    })

    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const VendorLoaderObj = { isLoader: VendorInputLoader }
    const plantLoaderObj = { isLoader: inputLoader }

    useEffect(() => {
        dispatch(getPlantSelectListByType(ZBC, 'MASTER', '', () => { }))
        if (isEditFlag) {
            dispatch(getSAPDetailById(id, res => {
                if (res?.data?.Result) {
                    setData(res?.data?.Data)
                    setValue('MaterialGroup', res?.data?.Data?.MaterialGroup)
                    setValue('PurcahaseOrganisation', res?.data?.Data?.PurchasingOrg)
                    setValue('PurcahaseGroup', res?.data?.Data?.PurchasingGroup)
                    setValue('Vendor', { label: res?.data?.Data.Vendor, value: res?.data?.Data?.VendorId })
                    setValue('PartNumber', { label: res?.data?.Data.PartNumber, value: res?.data?.Data?.PartId })
                    setValue('Plant', { label: res?.data?.Data.Plant, value: res?.data?.Data?.PlantId })
                }
            }))
        }
        return () => {
            reactLocalStorage?.setObject('vendorData', [])
            reactLocalStorage?.setObject('partData', [])
        }
    }, []);

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        const temp = [];
        if (label === 'DestinationPlant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId, PlantName: item.PlantName, PlantCode: item.PlantCode })
                return null
            })
            return temp
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

            const res = await getPartSelectListWtihRevNo(resultInput, null, null, null)

            setPartName(resultInput)
            let partDataAPI = res?.data?.DataList
            if (inputValue) {
                return autoCompleteDropdownPart(inputValue, partDataAPI, false, [], true)
            } else {
                return partDataAPI
            }
        }
        else {

            if (inputValue?.length < searchCount) return false
            else {
                let partData = reactLocalStorage?.getObject('PartData')
                if (inputValue) {
                    return autoCompleteDropdownPart(inputValue, partData, false, [], false)
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
    const onSubmit = () => {

        if (getValues('PurcahaseOrganisation') === null || getValues('PurcahaseOrganisation') === '' || getValues('PurcahaseOrganisation') === '-') {
            Toaster.warning('Purcahase Organisation is mandatory')
        }

        if (getValues('MaterialGroup') === null || getValues('MaterialGroup') === '' || getValues('MaterialGroup') === '-') {
            Toaster.warning('Material Group is mandatory')
        }
        let obj = {}

        obj.PartNumber = getValues('PartNumber').label
        obj.PlantCode = getCodeBySplitting(getValues('Plant').label)
        obj.MaterialGroup = getValues('MaterialGroup')
        obj.PurchasingOrg = getValues('PurcahaseOrganisation')
        obj.PurchasingGroup = getValues('PurcahaseGroup')
        obj.VendorCode = getCodeBySplitting(getValues('Vendor').label)
        if (isEditFlag) {
            obj.SapPushDetailId = data.SapPushDetailId
            dispatch(updateSAPDetail(obj, res => {
                if (res?.data?.Result) {
                    Toaster.success('SAP Detail updated successfully.')
                    props.closeDrawer('submit')
                }
            }))
        } else {
            dispatch(saveSAPDetail(obj, res => {
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
    const handlePartName = (value) => {
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
        dispatch(getPurcahseOrganisationByPlant(value.value, res => {
            if (res?.data.Result) {
                setValue('PurcahaseOrganisation', res.data.Data)
            }
            else if (res.status === 204) {
                Toaster.warning('Purchase Organisation does not exist for this plant.')
            }
        }))

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
                    <div className={"drawer-wrapper drawer-768px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{"Add SAP Detail"}</h3>
                                </div>

                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="pl-3">
                                <Col md="12">
                                    <AsyncSearchableSelectHookForm
                                        label={"Part Number"}
                                        name="PartNumber"
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        handleChange={(e) => handlePartName(e)}
                                        mandatory={true}
                                        errors={errors.PartNumber}
                                        // isLoading={VendorLoaderObj}
                                        asyncOptions={partFilterList}
                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Material Group"
                                        name={`MaterialGroup`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { checkWhiteSpaces },
                                        }}

                                        className=""
                                        customClassName={'withBorder scrap-recovery'}
                                        errors={errors.MaterialGroup}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="12">
                                    <AsyncSearchableSelectHookForm
                                        label={`${vendorLabel} (Code)`}
                                        name={"Vendor"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        options={renderListing("Vendor")}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        errors={errors.Vendor}
                                        isLoading={VendorLoaderObj}
                                        asyncOptions={filterList}
                                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>

                                <Col md="12">
                                    <SearchableSelectHookForm
                                        label={"Plant (Code)"}
                                        name={"Plant"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        options={renderListing("DestinationPlant")}
                                        mandatory={true}
                                        handleChange={(e) => handlePlantNameChange(e)}
                                        errors={errors.Plant}
                                        disabled={isEditFlag ? true : false}
                                        isLoading={plantLoaderObj}

                                    />
                                </Col>
                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Purcahase Organisation"
                                        name={`PurcahaseOrganisation`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { checkWhiteSpaces },
                                        }}

                                        className=""
                                        customClassName={'withBorder scrap-recovery'}
                                        errors={errors.PurcahaseOrganisation}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Purcahase Group"
                                        name={`PurcahaseGroup`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { checkWhiteSpaces },
                                            maxLength: {
                                                value: 5,
                                                message: 'Length should not be more than 5'
                                            },
                                        }}
                                        handleChange={() => { }}
                                        className=""
                                        customClassName={'withBorder scrap-recovery'}
                                        errors={errors.PurcahaseGroup}
                                    />
                                </Col>
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