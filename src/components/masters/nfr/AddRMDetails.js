import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { useSelector, } from 'react-redux'
import { checkForDecimalAndNull } from "../../../helper/validation";
import Toaster from '../../common/Toaster'
import { getConfigurationKey } from '../../../helper'
import NoContentFound from '../../common/NoContentFound'
import { EMPTY_DATA } from '../../../config/constants'
import { AcceptableRMUOM } from '../../../config/masterData'
import { number, checkWhiteSpaces, decimalNumberLimit6 } from '../../../helper'

function AddRMDetails(props) {
    const { isFromMaster } = props
    const [tableData, setTableData] = useState()
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [rawMaterialCode, setRawMaterialCode] = useState('')
    const [rawMaterialUOM, setRawMaterialUOM] = useState('')
    const [gridData, setGridData] = useState(props?.dataList ? props?.dataList : [])
    const [selectedRMList, setSelectedRMList] = useState([])

    const { rmSpecificationList } = useSelector((state) => state.material);
    const UOMSelectList = useSelector(state => state.comman.UOMSelectList)

    const { register, control, setValue, getValues, formState: { errors }, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        if (tableData?.length === 0) {
            setValue('ConditionEntryType', '')
        }
    }, [tableData]);

    useEffect(() => {

    }, []);

    const renderListing = (value) => {
        const temp = [];
        if (value === 'RawMaterial') {
            rmSpecificationList && rmSpecificationList?.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
                return null;
            });
            return temp;
        }
        if (value === 'UOM') {
            UOMSelectList && UOMSelectList?.map(item => {
                const accept = AcceptableRMUOM.includes(item.Type)
                if (accept === false) return false
                if (item.Value === '0') return false
                temp.push({ label: item.Display, value: item.Value })
                return null
            });
            return temp;
        }
    }

    const cancel = () => {
        props?.closeDrawer(false)
    }

    const handleChangeRawMaterialCode = (newValue) => {
        setRawMaterialCode(newValue)
    }

    const handleChangeUOM = (newValue) => {
        setRawMaterialUOM(newValue)
    }

    const resetData = () => {
        errors.RawMaterialCode = {}
        errors.RmUom = {}
        errors.GrossWeight = {}
        errors.NetWeight = {}

        setRawMaterialCode(false)
        setTimeout(() => {
            setRawMaterialCode('')
        }, 100);
        setIsEditMode(false)
        setEditIndex('')

        setRawMaterialUOM('')
        setValue('RawMaterialCode', '')
        setValue('RmUom', '')
        setValue('GrossWeight', '')
        setValue('NetWeight', '')
    }

    const filterRMFromList = (list, key, valueToCheck) => {
        return list && list?.filter(item => item?.[key] === valueToCheck)
    }

    const checkIsDataFilled = () => {
        let check = false
        if (rawMaterialUOM?.length === 0 || rawMaterialCode?.length === 0 || getValues("GrossWeight") === '' || getValues("NetWeight") === '') {
            check = true
        }
        return check
    }

    const addData = handleSubmit(() => {
        if (checkIsDataFilled()) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        if (selectedRMList?.includes(rawMaterialCode?.label)) {
            Toaster.warning("Data already added.")
            return false
        }
        if (Number(getValues('NetWeight')) > Number(getValues('GrossWeight'))) {
            Toaster.warning("Net Weight should not be greated than Net Weight.");
            return false;
        }
        setSelectedRMList([...selectedRMList, rawMaterialCode?.label])
        let tempArray = gridData ? [...gridData] : []
        let obj = {
            RawMaterialCode: rawMaterialCode?.label,
            NetWeight: getValues('NetWeight'),
            GrossWeight: getValues('GrossWeight'),
            RmUom: rawMaterialUOM?.label
        }
        tempArray.push(obj)
        setGridData(tempArray)
        resetData()
    });

    const updateData = handleSubmit(() => {
        let tempData = gridData[editIndex];
        if (gridData?.findIndex(item => item?.RawMaterialCode === rawMaterialCode?.label) !== editIndex) {
            if (selectedRMList?.includes(rawMaterialCode?.label)) {
                Toaster.warning("Data already added.")
                return false
            }
        }
        if (Number(getValues('NetWeight')) > Number(getValues('GrossWeight'))) {
            Toaster.warning("Net Weight should not be greated than Net Weight.");
            return false;
        }
        tempData = {
            ...tempData,
            RawMaterialCode: rawMaterialCode?.label,
            NetWeight: getValues('NetWeight'),
            GrossWeight: getValues('GrossWeight'),
            RmUom: rawMaterialUOM?.label
        }
        let rawMaterialCodeArray = []
        let tempArray = Object.assign([...gridData], { [editIndex]: tempData })
        tempArray?.forEach(item => {
            rawMaterialCodeArray?.push(item?.RawMaterialCode);
        });
        setSelectedRMList(rawMaterialCodeArray)
        setGridData(tempArray)
        resetData()
    });

    const editDetails = (index) => {
        let tempObj = gridData[index]

        errors.RawMaterialCode = {}
        errors.RmUom = {}
        errors.GrossWeight = {}
        errors.NetWeight = {}

        setEditIndex(index)

        const rmObject = filterRMFromList(rmSpecificationList, 'RawMaterialCode', tempObj?.RawMaterialCode)[0]

        setValue('RawMaterialCode', { label: rmObject?.RawMaterialCode, value: rmObject?.SpecificationId })
        setRawMaterialCode({ label: rmObject?.RawMaterialCode, value: rmObject?.SpecificationId })

        const uomObject = filterRMFromList(UOMSelectList, 'Display', tempObj?.RmUom)[0]

        setValue('RmUom', { label: uomObject?.Display, value: uomObject?.Value })
        setRawMaterialUOM({ label: uomObject?.Display, value: uomObject?.Value })

        setValue('GrossWeight', tempObj?.GrossWeight)
        setValue('NetWeight', tempObj?.NetWeight)
    }

    const deleteDetails = (index) => {
        const updatedData = gridData.filter((_, i) => i !== index);
        setGridData(updatedData);
        resetData()
    }

    const saveRMDetails = () => {
        if (gridData?.length === 0) {
            Toaster.warning("Please enter at least one record.")
            return false
        }
        props?.closeDrawer(true, gridData)
    }

    return (

        <div>
            <Drawer anchor={props?.anchor} open={props?.isOpen}   >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>

                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Add RM Details:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className='hidepage-size'>
                                <Row>
                                    {!isFromMaster && <Col md="3" className='px-2'>
                                        <SearchableSelectHookForm
                                            label={`Raw Material Code`}
                                            name={'RawMaterialCode'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            options={renderListing("RawMaterial")}
                                            handleChange={handleChangeRawMaterialCode}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RawMaterialCode}
                                            disabled={false}
                                        />
                                    </Col>}
                                    <Col md="3" className='px-2'>
                                        <SearchableSelectHookForm
                                            label={`Raw Material UOM`}
                                            name={'RmUom'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            options={renderListing("UOM")}
                                            handleChange={handleChangeUOM}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                            }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RmUom}
                                            disabled={props?.ViewMode}
                                        />
                                    </Col>
                                    <Col md={3} className='px-2'>
                                        <TextFieldHookForm
                                            label={`Gross Weight`}
                                            name={'GrossWeight'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            handleChange={() => { }}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors?.GrossWeight}
                                            disabled={false}
                                        />
                                    </Col>
                                    <Col md={3} className='px-2'>
                                        <TextFieldHookForm
                                            label={`Net Weight`}
                                            name={'NetWeight'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            handleChange={() => { }}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                            }}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors?.NetWeight}
                                            disabled={false}
                                        />
                                    </Col>
                                    <Col >
                                        <div className='pr-0'>
                                            {editIndex !== '' ? (
                                                <>
                                                    <button type="button" className={"btn btn-primary mt30 pull-left mr5"} onClick={() => updateData()}>Update</button>
                                                    <button
                                                        type="button"
                                                        className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                                        onClick={() => resetData()}
                                                    >
                                                        <div className={"cancel-icon"}></div>Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button id="AddNFR_AddData"
                                                        type="button"
                                                        className={"user-btn mt30 pull-left mr10"}
                                                        onClick={addData}
                                                    >
                                                        <div className={"plus"}></div>ADD
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={"mr15 ml-1 mt30 reset-btn"}
                                                        onClick={() => resetData()}
                                                    >
                                                        Reset
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={props?.hideAction ? 12 : 12}>
                                        <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`Raw Material Code`}</th>
                                                    <th>{`Raw Material UOM`}</th>
                                                    <th>{`Gross Weight`}</th>
                                                    <th>{`Net Weight`}</th>
                                                    {!props?.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>
                                                {gridData &&
                                                    gridData?.map((item, index) => {
                                                        return (
                                                            <Fragment>
                                                                <tr key={index}>
                                                                    <td>{item?.RawMaterialCode ? item?.RawMaterialCode : '-'} </td>
                                                                    <td>{item?.RmUom ? item?.RmUom : '-'}</td>
                                                                    <td>{item?.GrossWeight ? checkForDecimalAndNull(item?.GrossWeight, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>
                                                                    <td>{item?.NetWeight ? checkForDecimalAndNull(item?.NetWeight, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>
                                                                    {!props?.hideAction && <td><div className='text-right'>
                                                                        <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editDetails(index)} />
                                                                        <button title='Delete' className="Delete mr-1" type={'button'} onClick={() => deleteDetails(index)} />
                                                                    </div>
                                                                    </td>}
                                                                </tr>
                                                            </Fragment>
                                                        )
                                                    })}
                                                {gridData && gridData?.length === 0 && (
                                                    <tr>
                                                        <td colspan="15">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </div>
                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                    <button
                                        type={'button'}
                                        className="reset cancel-btn mr5"
                                        onClick={cancel}>
                                        <div className={'cancel-icon'}></div> {'Cancel'}
                                    </button>
                                    <button
                                        type={'button'}
                                        className="submit-button save-btn"
                                        onClick={() => saveRMDetails()}
                                        disabled={props?.ViewMode}
                                    >
                                        <div className={"save-icon"}></div>
                                        {'Save'}
                                    </button>
                                </div>
                            </Row>
                        </div>
                    </Container>
                </div>
            </Drawer>
        </div>

    )
}
export default React.memo(AddRMDetails)
