import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Row, Col, Tooltip, FormGroup, Label, Input, Form } from 'reactstrap';
import DatePicker from 'react-datepicker'
import { useForm, Controller } from "react-hook-form";
import HeaderTitle from '../../common/HeaderTitle';
import ProcessDrawer from '../ProcessDrawer';
import { AsyncSearchableSelectHookForm, RadioHookForm, SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import Button from '../../layout/Button';
import { getBopCategorySelectList, getBopNumberSelectList } from '../actions/rfq';
import { DRAFT, PREDRAFT, SENT } from "../../../config/constants";
import TooltipCustom from "../../common/Tooltip";

const RaiseRfqBopDetails = (props) => {
    const { setViewQuotationPart, updateBopList, isEditFlag, isViewFlag, updateButtonPartNoTable, dataProps, resetBopFields, plant, prNumber, disabledPartUid, resetDrawer } = props

    const [drawerOpen, setDrawerOpen] = useState(false);
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            radioOption: false, // Initialize default value for the radio button
        }
    });
    const dispatch = useDispatch()

    const { SelectBopNumber, SelectBopCategory } = useSelector((state) => state.rfq)
    const [bopNumber, setBopNumber] = useState([])
    const [bopName, setBopName] = useState("")


    const [bopCategory, setBopCategory] = useState([])
    const [bopAttchment, setBopAttchment] = useState([])
    const [bopRemark, setBopRemark] = useState("");
    const [bopSpecificationList, setBopSpecificationList] = useState([])
   const { bopSpecificRowData } = useSelector(state => state?.rfq);
    const showStatus = dataProps?.rowData?.Status || ""
    const showAddButton = !disabledPartUid || dataProps?.isAddFlag || (dataProps?.isEditFlag && showStatus === PREDRAFT) || (dataProps?.isViewFlag || dataProps?.isEditFlag ? false : true)


    useEffect(() => {
        dispatch(getBopNumberSelectList(() => { }))

    }, [])
    useEffect(() => {
        setBopData()
    }, [bopNumber, bopName, bopCategory, bopAttchment, bopRemark,bopSpecificationList])
    useEffect(() => {
        setValue('BOPName', bopName)
    }, [bopName])
    useEffect(() => {
        if (resetBopFields) {

            onResetBopFields()
        }
    }, [resetBopFields])
    useEffect(() => {
        if (updateButtonPartNoTable) {

            let obj = {
                BoughtOutPartChildId: bopSpecificRowData[0]?.BoughtOutPartChildId,
                BoughtOutPartCategoryId: bopSpecificRowData[0]?.BoughtOutPartCategoryId,
                BoughtOutPartName: bopSpecificRowData[0]?.BoughtOutPartName,
                BoughtOutPartCategoryName: bopSpecificRowData[0]?.BoughtOutPartCategoryName,
                BoughtOutPartNumber: bopSpecificRowData[0]?.BoughtOutPartNumber,
                BopReamrk: bopSpecificRowData[0]?.Remarks,
                BopAttachments: bopSpecificRowData[0]?.Attachments,
                BopSpecification: bopSpecificRowData[0]?.PartSpecification

            }
            setBopAttchment(bopSpecificRowData[0]?.Attachments)
            setBopRemark(bopSpecificRowData[0]?.Remarks)
            setBopSpecificationList(bopSpecificRowData[0]?.PartSpecification)
            setValue('BOPNo', { label: bopSpecificRowData[0]?.BoughtOutPartNumber, value: bopSpecificRowData[0]?.BoughtOutPartChildId })
            setValue('Category', { label: bopSpecificRowData[0]?.BoughtOutPartCategoryName, value: bopSpecificRowData[0]?.BoughtOutPartCategoryId })
            setValue("BOPName", bopSpecificRowData[0]?.BoughtOutPartName)
            updateBopList(obj)
        }
    }, [updateButtonPartNoTable, bopSpecificRowData,])
    const onResetBopFields = () => {
        setBopCategory([]);
        setBopNumber([]);
        setBopName([]);
        setBopAttchment([]);
        setBopSpecificationList([]);
        setBopRemark("");
        setValue('BOPName', '')
        setValue('BOPNo', '')
        setValue('Category', '')

    }
    const DrawerToggle = () => {
        // if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setDrawerOpen(true)
    }
    const closeDrawer = () => {
        setDrawerOpen(false);

    }
    const setBopData = () => {
        if (bopCategory.length !== 0 && bopNumber.length !== 0 && bopName.length !== 0) {
            let obj = {
                BoughtOutPartChildId: bopNumber.value,
                BoughtOutPartCategoryId: bopCategory.value,
                BopAttachments: bopAttchment,
                BopReamrk: bopRemark,
                BopSpecification: bopSpecificationList,
                BoughtOutPartName: bopName,
                BoughtOutPartCategoryName: bopCategory?.label,
                BoughtOutPartNumber: bopNumber?.label,


            }

            updateBopList(obj)

        }
    }
    const renderListing = (label) => {
        const temp = []
        if (label === 'bopNumber') {
            SelectBopNumber && SelectBopNumber?.map((item) => {
                const match = item?.Text.match(/\(([^)]+)\)/);
                const valueInsideBrackets = match ? match[1] : '';
                if (item.Value === '0') return false
                temp.push({ label: valueInsideBrackets, value: item?.Value })
                return null
            })
            return temp
        }

        if (label === 'category') {
            SelectBopCategory && SelectBopCategory?.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }


    }
    const handleBopNo = (newValue, actionMeta) => {

        if (newValue && newValue !== '') {

            delete errors.RawMaterialCode
            setBopNumber({ label: newValue?.label, value: newValue?.value })
            const selectedBop = SelectBopNumber.find(item => item.Value === newValue.value);
            const name = selectedBop.Text.split(' (')[0].trim();


            setBopName(name);
            dispatch(getBopCategorySelectList(newValue?.value, () => { }))
            setBopCategory([])
            setValue("Category", "")

        } else {
            setBopNumber([])
            //dispatch(getBopCategorySelectList(newValue?.value, () => { }))
            setBopCategory([])
            setBopName("")
            setValue("Category", "")



        }
    }
    const handleBopCategory = (newValue, actionMeta) => {
        setBopCategory({ label: newValue?.label, value: newValue?.value })


    }

    return (
        <div className='bop-details-wrapper'>
            {/* <HeaderTitle title={'BOP:'} /> */}
            {props.heading()}
            <Row className="part-detail-wrapper">
                <Col md="3">
                    <SearchableSelectHookForm
                        label="BOP No."
                        name={"BOPNo"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        options={renderListing("bopNumber")}
                        mandatory={true}
                        handleChange={handleBopNo}
                        disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || (Object.keys(prNumber).length === 0 && Object.keys(plant).length === 0) ||
                            Object.keys(prNumber).length !== 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT)}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}

                        // defaultValue={state.rmName.length !== 0 ? state.rmName : ""}
                        className="fullinput-icon"
                        // disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || showStatus === DRAFT}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                        errors={errors.BOPNo}
                        isClearable={true}
                    />
                </Col>

                <Col md="3" >
                    <TextFieldHookForm
                        label="BOP Name"
                        name={"BOPName"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            required: false,
                        }}
                        handleChange={(e) => { }}
                        defaultValue={""}
                        className=""
                        disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || (Object.keys(prNumber).length === 0 && Object.keys(plant).length === 0) || Object.keys(prNumber).length !== 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT)}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}

                        customClassName={"withBorder"}
                        errors={errors.MBName}
                    />
                </Col>

                <Col md="3">
                    <div className='d-flex align-items-center'>
                        <SearchableSelectHookForm
                            label="Category"
                            name={"Category"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            options={renderListing("category")}
                            mandatory={true}
                            handleChange={handleBopCategory}
                            // defaultValue={state.rmName.length !== 0 ? state.rmName : ""}
                            className="fullinput-icon"
                            disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || (Object.keys(prNumber).length === 0 && Object.keys(plant).length === 0) || Object.keys(prNumber).length !== 0 || (dataProps?.isEditFlag && showStatus !== PREDRAFT)}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}

                            // disabled={isViewFlag || isEditFlag || dataProps?.isViewFlag || showStatus === DRAFT}                        // defaultValue={state.rmGrade.length !== 0 ? state.rmGrade : ""}
                            errors={errors.Category}
                            isClearable={true}
                        />
                        <TooltipCustom id="addBOPSpecification" disabledIcon={true} tooltipText="Click on the + button to start inputting Specification and mandatory attachments." />
                        <Button id="addBOPSpecification" className={"ml-2 mb-2 "}
                            variant={updateButtonPartNoTable ? 'Edit' : 'plus-icon-square'}
                            title={updateButtonPartNoTable ? 'Edit' : 'Add'} onClick={DrawerToggle} disabled={dataProps?.isAddFlag ? ((!updateButtonPartNoTable && prNumber.length !== 0) ? true : false) : (Object.keys(prNumber).length !== 0 ? !updateButtonPartNoTable : (disabledPartUid || (dataProps?.isEditFlag && showStatus !== PREDRAFT) || dataProps?.isViewFlag))}
                        >
                        </Button>

                    </div>

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
                            partType={'Bought Out Part'}
                            setViewQuotationPart={setViewQuotationPart}
                            specificationList={bopSpecificationList}
                            setSpecificationList={setBopSpecificationList}
                            setRemark={setBopRemark}
                            remark={bopRemark}
                            isEditFlag={isEditFlag}
                            isViewFlag={isViewFlag}
                            setChildPartFiles={setBopAttchment}
                            childPartFiles={bopAttchment}
                            bopNumber={bopNumber}
                            resetDrawer={resetDrawer}
                        />
                    )
                }
            </div>
        </div>

    )
}

export default RaiseRfqBopDetails;
