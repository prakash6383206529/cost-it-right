import React, { Fragment, useEffect, useRef, useState } from "react"
import { fetchSpecificationDataAPI, getAllCity, getCityByCountry, getPlantSelectListByType, getRawMaterialCategory, getVendorNameByVendorSelectList } from "../../../actions/Common"
import { CBCTypeId, FILE_URL, RAW_MATERIAL_VENDOR_TYPE, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from "../../../config/constants"
import { useDispatch, useSelector } from "react-redux"
import { useForm, Controller, useWatch } from "react-hook-form"
import { Row, Col, Label } from 'reactstrap'
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, AsyncSearchableSelectHookForm, TextAreaHookForm, DatePickerHookForm, } from '../../layout/HookFormInputs';
import LoaderCustom from "../../common/LoaderCustom"
import { reactLocalStorage } from "reactjs-localstorage"
import {
    acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation, maxLength512, number, integerOnly,
    checkForNull
} from "../../../helper/validation";
import 'react-dropzone-uploader/dist/styles.css';
import { MESSAGES } from "../../../config/message"
import AsyncSelect from 'react-select/async';
import { autoCompleteDropdown } from "../../common/CommonFunctions"
import HeaderTitle from "../../common/HeaderTitle"
function AddRMIndexation(props) {
    // const { isEditFlag, isViewFlag } = data
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dropzone = useRef(null);
    const [state, setState] = useState({
        costingTypeId: ZBCTypeId,
        vendor: [],
        technology: [],
        plants: [],
        customer: [],
        inputLoader: false,
        vendorFilter: [],
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
        effectiveDate: '',
        UOM: [],
    });

    const dispatch = useDispatch()
    const plantSelectList = useSelector(state => state.comman.plantSelectList);

    useEffect(() => {
        
        dispatch(getPlantSelectListByType(ZBC, "MASTER", '', () => { }))
    }, [])

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
    };
    /**
 * @method handleVendor
 * @description called
 */
    const handleVendor = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            setState(prevState => ({ ...prevState, vendor: newValue }));

        } else {
            setState(prevState => ({ ...prevState, vendor: [] }));
        }
    }



    /**
     * @method onPressVendor
     * @description Used for Vendor checked
     */
    const onPressVendor = (costingHeadFlag) => {
        setState(prevState => ({
            ...prevState,
            costingTypeId: costingHeadFlag,
        }));
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
    const vendorToggle = () => {
        setState(prevState => ({ ...prevState, isOpenVendor: true }));
    }
    /**
   * @method cancel
   * @description used to Reset form
   */
    const cancelHandler = (type) => {
        props?.closeDrawer('', '', type)
    }
    return (
        <Fragment>
            <form className="add-min-height">
                <Row>
                    <Col md="12">
                        {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="rm_domestic_form_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                                type="radio"
                                name="costingHead"
                                className='zero-based'
                                id='zeroBased'
                                checked={
                                    state.costingTypeId === ZBCTypeId ? true : false
                                }
                                onClick={() =>
                                    onPressVendor(ZBCTypeId)
                                }
                                disabled={false}
                            />{" "}
                            <span>Zero Based</span>
                        </Label>}
                        {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="rm_domestic_form_vendor_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                                type="radio"
                                name="costingHead"
                                className='vendor-based'
                                id='vendorBased'
                                checked={
                                    state.costingTypeId === VBCTypeId ? true : false
                                }
                                onClick={() =>
                                    onPressVendor(VBCTypeId)
                                }
                                disabled={false}
                            />{" "}
                            <span>Vendor Based</span>
                        </Label>}
                        {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="rm_domestic_form_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                            <input
                                type="radio"
                                name="costingHead"
                                className='customer-based'
                                id='customerBased'
                                checked={
                                    state.costingTypeId === CBCTypeId ? true : false
                                }
                                onClick={() =>
                                    onPressVendor(CBCTypeId)
                                }
                                disabled={false}
                            />{" "}
                            <span>Customer Based</span>
                        </Label>}
                    </Col>
                </Row>
                <Row className={'mt0'}>
                    <Col md="12" className={'mt25'}>
                        <HeaderTitle className="border-bottom"
                            title={'Material Details:'}
                            customClass={'underLine-title'}
                        />
                    </Col>

                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            label={'Material Name (main)'}
                            name="mainMaterial"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("plant")}
                            defaultValue={''}
                            handleChange={() => { }}
                            disabled={false}
                            errors={errors.mainMaterial}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            label={'Material Name'}
                            name="Material"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("plant")}
                            defaultValue={''}
                            handleChange={() => { }}
                            disabled={false}
                            errors={errors.Material}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            label={'Plant (Code)'}
                            name="plant"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("plant")}
                            defaultValue={''}
                            handleChange={() => { }}
                            disabled={false}
                            errors={errors.plant}
                        />
                    </Col>
                    {state.costingTypeId !== CBCTypeId && <Col className="col-md-15">
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
                                    isDisabled={false}
                                    onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                    }}
                                // onBlur={() => setState({ showErrorOnFocus: true })}
                                />
                            </div>
                            {/* {!props.isEditFlag && (

                                <Button
                                    id="addRMDomestic_vendorToggle"
                                    onClick={vendorToggle}
                                    className={"right"}
                                    variant="plus-icon-square"
                                />

                            )} */}
                        </div>
                        {((state.showErrorOnFocus && state.vendor?.length === 0)) && <div className='text-help mt-1'>This field is required.</div>}
                    </Col>}
                    {state.costingTypeId === CBCTypeId && (
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
                                    disabled={false}
                                    errors={errors.clientName}
                                />
                            </Col>
                        </>
                    )}
                </Row>
                <Row className={'mt0'}>
                    <Col md="12" className={'mt25'}>
                        <HeaderTitle className="border-bottom"
                            title={'Cost:'}
                            customClass={'underLine-title'}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            label={'Exchange Rate Source'}
                            name="exchangeRate"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("plant")}
                            defaultValue={''}
                            handleChange={() => { }}
                            disabled={false}
                            errors={errors.exchangeRate}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            label={'Index (LME)'}
                            name="index"
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            placeholder={'Select'}
                            options={renderListing("plant")}
                            defaultValue={''}
                            handleChange={() => { }}
                            disabled={false}
                            errors={errors.index}
                        />
                    </Col>

                    <Col className="col-md-15">
                        <div className="inputbox date-section">
                            <DatePickerHookForm
                                name={`fromDate`}
                                label={'From Date'}
                                // handleChange={(date) => {
                                //     handleFromEffectiveDateChange(date);
                                // }}
                                rules={{ required: true }}
                                Controller={Controller}
                                control={control}
                                register={register}
                                showMonthDropdown
                                showYearDropdown
                                dateFormat="DD/MM/YYYY"
                                // maxDate={maxDate}
                                placeholder="Select date"
                                customClassName="withBorder"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={false}
                                mandatory={true}
                                errors={errors && errors.fromDate}
                            />
                        </div>
                    </Col>
                    <Col className="col-md-15">
                        <div className="inputbox date-section">
                            <DatePickerHookForm
                                name={`toDate`}
                                label={'To Date'}
                                // handleChange={(date) => {
                                //     handleToEffectiveDateChange(date);
                                // }}
                                rules={{ required: true }}
                                Controller={Controller}
                                control={control}
                                register={register}
                                showMonthDropdown
                                showYearDropdown
                                dateFormat="DD/MM/YYYY"
                                // minDate={minDate}
                                placeholder="Select date"
                                customClassName="withBorder"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={false}
                                mandatory={true}
                                errors={errors && errors.toDate}
                            />
                        </div>
                    </Col>
                    <Col className="col-md-15">
                        <div id="EffectiveDate_Container" className="inputbox date-section">
                            <DatePickerHookForm
                                name={`EffectiveDate`}
                                label={'Effective Date'}
                                selected={new Date(state.effectiveDate)}
                                // handleChange={(date) => {
                                //     handleFromDate(date);
                                // }}
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
                                mandatory={true}
                                errors={errors && errors.EffectiveDate}
                            />
                        </div>
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            name="UnitOfMeasurement"
                            label="UOM"
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            options={renderListing("uom")}
                            rules={{ required: true }}
                            defaultValue={state.UOM}
                            mandatory={true}
                            handleChange={() => { }}
                            customClassName="withBorder"
                            disabled={false}
                            errors={errors.UnitOfMeasurement}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <SearchableSelectHookForm
                            name="currency"
                            label="Currency"
                            errors={errors.currency}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                                required: true,
                            }}
                            placeholder={'Select'}
                            options={renderListing("currency")}
                            handleChange={() => { }}
                            disabled={false}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <TextFieldHookForm
                            label={`Frequency of settlement`}
                            name={"frequencyOfSettlement"}
                            placeholder={"Enter"}
                            defaultValue={''}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { number, integerOnly },
                            }}
                            mandatory={false}
                            className=" "
                            customClassName=" withBorder"
                            disabled={false}
                            handleChange={() => { }}
                            errors={errors.frequencyOfSettlement}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <TextFieldHookForm
                            label={`Index Premium(Currency)`}
                            name={"indexPremium"}
                            placeholder={"Enter"}
                            defaultValue={''}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { number, integerOnly },
                            }}
                            mandatory={false}
                            className=" "
                            customClassName=" withBorder"
                            disabled={false}
                            handleChange={() => { }}
                            errors={errors.indexPremium}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <TextFieldHookForm
                            label={`Exchange Rate Source Premium(Currency)`}
                            name={"ExRateSrcPremium"}
                            placeholder={"Enter"}
                            defaultValue={''}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { number, integerOnly },
                            }}
                            mandatory={false}
                            className=" "
                            customClassName=" withBorder"
                            disabled={false}
                            handleChange={() => { }}
                            errors={errors.ExRateSrcPremium}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <TextFieldHookForm
                            label={`Index Rate(Currency)`}
                            name={"indexRateCurrency"}
                            placeholder={"Enter"}
                            defaultValue={''}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { number, integerOnly },
                            }}
                            mandatory={false}
                            className=" "
                            customClassName=" withBorder"
                            disabled={false}
                            handleChange={() => { }}
                            errors={errors.indexRateCurrency}
                        />
                    </Col>
                    <Col className="col-md-15">
                        <TextFieldHookForm
                            label={`Basic rate(Base Currency)`}
                            name={"basicRateBaseCurrency"}
                            placeholder={"Enter"}
                            defaultValue={''}
                            Controller={Controller}
                            control={control}
                            register={register}
                            rules={{
                                required: false,
                                validate: { number, integerOnly },
                            }}
                            mandatory={false}
                            className=" "
                            customClassName=" withBorder"
                            disabled={false}
                            handleChange={() => { }}
                            errors={errors.basicRateBaseCurrency}
                        />
                    </Col>
                </Row >
                <Row className=" no-gutters justify-content-between">
                    <div className="col-md-12">
                        <div className="text-right ">
                            <button
                                id="AddMaterialType_Cancel"
                                onClick={cancelHandler}
                                type="button"
                                value="CANCEL"
                                className="mr15 cancel-btn"
                                disabled={false}
                            >
                                <div className={"cancel-icon"}></div>
                                CANCEL
                            </button>
                            <button
                                id="AddMaterialType_Save"
                                type="submit"
                                className="user-btn save-btn"
                                disabled={false}
                            >
                                <div className={"save-icon"}></div>
                                {"SAVE"}
                                {/* {isEditFlag ? "UPDATE" : "SAVE"} */}
                            </button>
                        </div>
                    </div>
                </Row>
            </form>
        </Fragment>
    )
}
export default AddRMIndexation