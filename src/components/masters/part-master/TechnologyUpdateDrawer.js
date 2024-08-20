import React from 'react'
import { Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPartData, getSelectListPartType, updateMultipleComponentTechnology, updatePart } from '../actions/Part';
import { useState } from 'react';
import { getCostingSpecificTechnology, getPartSelectListByTechnology } from '../../costing/actions/Costing';
import { loggedInUserId } from '../../../helper';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import DayTime from '../../common/DayTimeWrapper';
import { ASSEMBLYNAME, COMPONENT_PART, searchCount } from '../../../config/constants';
import { autoCompleteDropdown, autoCompleteDropdownPart } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getPartSelectListWtihRevNo } from '../actions/Volume';
import { getUnassociatedPartNumber } from '../../../actions/auth/AuthActions';
import { useLabels } from '../../../helper/core';

function TechnologyUpdateDrawer(props) {
    const { rowDataFortechnologyUpdate, closeDrawer } = props
    const { register, getValues, control, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { partData } = useSelector(state => state.part)
    const { costingSpecifiTechnology } = useSelector(state => state.costing)
    const [technology, setTechnology] = useState([])
    const [disable, setDisable] = useState(false)
    const [inputLoader, setInputLoader] = useState(false)
    const [partName, setpartName] = useState('')
    const [partTypeId, setPartTypeId] = useState('')
    const dispatch = useDispatch();
    const { technologyLabel } = useLabels();
    useEffect(() => {

        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getSelectListPartType(res => {
            let data = res.data.SelectList
            if (props?.partType === COMPONENT_PART) {
                let componentId = data && data.filter(partType => partType.Text === COMPONENT_PART)
                setPartTypeId(componentId[0]?.Value)
            } else if (props?.partType === ASSEMBLYNAME) {
                let componentId = data && data.filter(partType => partType.Text === ASSEMBLYNAME)
                setPartTypeId(componentId[0]?.Value)
            }

        }))
    }, [])



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
        let partIdList = []
        getValues('Part') && getValues('Part').map(partData => {
            partIdList.push(partData.value)
        })

        let updateData = {
            LoggedInUserId: loggedInUserId(),
            PartId: partIdList,
            EffectiveDate: DayTime(partData?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            TechnologyIdRef: technology?.value,
            IsTechnologyUpdateRequired: false,
        }
        setDisable(true)
        dispatch(updateMultipleComponentTechnology(updateData, (res) => {
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.UPDATE_PART_SUCESS);
                closeDrawer("submit")
                setDisable(false)
            }
        }))
    })
    const filterList = async (inputValue) => {
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && partName !== resultInput) {


            const res = await getUnassociatedPartNumber(resultInput, '', null, partTypeId, true);
            setpartName(resultInput)
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
                let partData = reactLocalStorage.getObject('PartData')
                if (inputValue) {

                    return autoCompleteDropdownPart(inputValue, partData, false, [], false)

                } else {
                    return partData
                }
            }
        }

    }
    const loaderObj = { isLoader: inputLoader, }
    return (
        <>
            <Drawer className="top-drawer approval-workflow-drawer" anchor={props.anchor} open={props.isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper'}>
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

                                        <AsyncSearchableSelectHookForm
                                            label={"Assembly/Part No."}
                                            name={"Part"}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            isMulti={true}
                                            asyncOptions={filterList}
                                            mandatory={true}
                                            isLoading={loaderObj}
                                            handleChange={() => { }}
                                            errors={errors.Part}
                                            disabled={false}
                                            NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
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
                                            disabled={false}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="text-right px-0">
                                <button
                                    type="button"
                                    className="reset mr15 cancel-btn"
                                    disabled={disable}
                                    onClick={(e) => props.closeDrawer('close')}
                                >
                                    <div className={'cancel-icon'}></div>
                                    {'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    className="submit-button save-btn mr2"
                                    disabled={false}
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

export default React.memo(TechnologyUpdateDrawer)
