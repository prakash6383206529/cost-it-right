import React from 'react'
import { Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPartData, updatePart } from '../actions/Part';
import { useState } from 'react';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import { loggedInUserId } from '../../../helper';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import DayTime from '../../common/DayTimeWrapper';
import { useLabels } from '../../../helper/core';

function DrawerTechnologyUpdate(props) {
    const { rowDataFortechnologyUpdate, closeDrawer } = props
    const { register, setValue, control, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { partData } = useSelector(state => state.part)
    const { costingSpecifiTechnology } = useSelector(state => state.costing)
    const [technology, setTechnology] = useState([])
    const [isTechnologyUpdateRequired, setIsTechnologyUpdateRequired] = useState(false)
    const [disable, setDisable] = useState(false)
    const dispatch = useDispatch();
    const { technologyLabel } = useLabels();
    useEffect(() => {
        dispatch(getPartData(rowDataFortechnologyUpdate?.PartId, (res) => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
    }, [])

    useEffect(() => {
        setValue("PartNo", partData?.PartNumber)
        setIsTechnologyUpdateRequired(partData?.IsTechnologyUpdateRequired)
        setValue("Technology", { label: partData?.TechnologyName, value: partData?.TechnologyIdRef })
        setTechnology({ label: partData?.TechnologyName, value: partData?.TechnologyIdRef })
    }, [partData])

    const renderListing = () => {
        const temp = [];
        costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
            if (item.Value === '0') return false;
            temp.push({ label: item.Text, value: item.Value })
            return null;
        });
        return temp;
    }

    const handleTechnologyChange = (newValue) => {
        if (newValue && newValue !== '') {
            setTechnology(newValue)
        } else {
            setTechnology({})
        }
    }
    const onSubmit = handleSubmit(() => {
        let updateData = {
            LoggedInUserId: loggedInUserId(),
            PartId: rowDataFortechnologyUpdate?.PartId,
            PartName: partData?.PartName,
            PartNumber: partData?.PartNumber,
            Description: partData?.Description,
            ECNNumber: partData?.ECNNumber,
            RevisionNumber: partData?.RevisionNumber,
            DrawingNumber: partData?.DrawingNumber,
            Remark: partData?.Remark,
            EffectiveDate: DayTime(partData?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            Attachements: partData?.Attachements,
            IsForcefulUpdated: false,
            GroupCodeList: partData?.GroupCodeList,
            IsStructureChanges: false,
            TechnologyIdRef: technology?.value,
            TechnologyName: technology?.label,
            IsTechnologyUpdateRequired: false,
        }

        setDisable(true)
        dispatch(updatePart(updateData, (res) => {
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.UPDATE_PART_SUCESS);
                closeDrawer("submit")
                setDisable(false)
            }
        }))
    })

    return (
        <>
            <Drawer className="top-drawer approval-workflow-drawer" anchor={props.anchor} open={props.isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper drawer-full-width'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col >
                                <div className={'header-wrapper left'}>
                                    <h3>{`${technologyLabel} Update`}</h3>
                                </div>
                                <div
                                    onClick={(e) => closeDrawer('close')}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>
                        <div className="row process workflow-row">
                            <div className="child-container px-0">
                                <Row>
                                    <Col md="12">
                                        <TextFieldHookForm
                                            label="Part No.:"
                                            name={"PartNo"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={() => { }}
                                            className=""
                                            customClassName={'withBorder mn-height-auto mb-0'}
                                            disabled={true}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mt-2'>
                                    <Col md="12">
                                        <SearchableSelectHookForm
                                            label={technologyLabel}
                                            name={"Technology"}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={technology?.length !== 0 ? technology : ""}
                                            options={renderListing()}
                                            mandatory={true}
                                            handleChange={handleTechnologyChange}
                                            errors={errors.Technology}
                                            disabled={!isTechnologyUpdateRequired}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="text-right px-0">
                                <button
                                    type="button"
                                    className="reset mr15 cancel-btn"
                                    disabled={disable}
                                    onClick={(e) => closeDrawer('close')}
                                >
                                    <div className={'cancel-icon'}></div>
                                    {'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    className="submit-button save-btn mr2"
                                    disabled={!isTechnologyUpdateRequired}
                                    onClick={onSubmit}
                                >
                                    <div className={"save-icon"}></div>
                                    {'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </>
    )
}

export default React.memo(DrawerTechnologyUpdate)
