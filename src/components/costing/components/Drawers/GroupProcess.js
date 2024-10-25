import React, { useContext, useEffect, useState } from "react";
import _ from 'lodash'
import { useDispatch, useSelector } from "react-redux";
import { getMachineProcessGroupDetail, setSelectedDataOfCheckBox } from "../../actions/Costing";
import { costingInfoContext } from "../CostingDetailStepTwo";
import { getConfigurationKey } from "../../../../helper";
import { CBCTypeId, EMPTY_DATA, EMPTY_GUID, NCCTypeId, VBC, VBCTypeId, ZBC, ZBCTypeId } from "../../../../config/constants";
import LoaderCustom from "../../../common/LoaderCustom";
import NoContentFound from "../../../common/NoContentFound";
import { DIE_CASTING, Ferrous_Casting, FORGING, MACHINING } from "../../../../config/masterData";
import { useLabels } from "../../../../helper/core";


function GroupProcess(props) {
    const { selectedProcessAndGroup, selectedProcessGroupId, CostingEffectiveDate } = useSelector(state => state.costing)
    const [isLoader, setIsLoader] = useState(false)
    const [processAccObj, setProcessAccObj] = useState({});
    const [selectedData, setSelectedData] = useState([])
    const [tableData, setTableDataList] = useState([])
    const costData = useContext(costingInfoContext)
    const dispatch = useDispatch()
    const { technologyLabel } = useLabels();


    useEffect(() => {
        let data = {
            VendorId: costData.CostingTypeId === VBCTypeId ? costData.VendorId : EMPTY_GUID,
            TechnologyId: Number(costData?.TechnologyId) === Number(FORGING) || Number(costData?.TechnologyId) === Number(DIE_CASTING) || Number(costData?.TechnologyId) === Number(Ferrous_Casting) ? String(`${costData?.TechnologyId},${MACHINING}`) : `${costData?.TechnologyId}`,
            VendorPlantId: getConfigurationKey()?.IsVendorPlantConfigurable ? costData.VendorPlantId : EMPTY_GUID,
            CostingId: costData.CostingId,
            EffectiveDate: CostingEffectiveDate,
            PlantId: (getConfigurationKey()?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId) ? costData.PlantId : EMPTY_GUID,
            CostingTypeId: costData.CostingTypeId,
            CustomerId: costData.CustomerId
        }
        setIsLoader(true)
        dispatch(getMachineProcessGroupDetail(data, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                setTableDataList(Data)
            } else if (res && res.response && res.response.status === 412) {
                setTableDataList([])
            } else {
                setTableDataList([])
            }
            setIsLoader(false)
        }))
    }, [])

    const findGroupCode = (clickedData, arr) => {
        let isContainGroup = _.find(arr, function (obj) {
            if (obj.GroupName === clickedData.GroupName && obj.MachineId === clickedData.MachineId) {
                return true;
            } else {
                return false
            }
        });
        return isContainGroup
    }

    const handleCheckBox = (clickedData, index) => {

        let removeCondition = false
        selectedProcessAndGroup && selectedProcessAndGroup.map((el) => {
            if (el.GroupName === clickedData.GroupName && el.MachineId === clickedData.MachineId) {
                removeCondition = true
            }
            return null
        })

        let tempData = selectedData
        let tempArrForRedux = selectedProcessAndGroup
        if (removeCondition) {
            let tempArrAfterDelete = selectedData && selectedData.filter((el, i) => {
                if (i === index) return false;
                return true
            })
            tempArrForRedux = selectedProcessAndGroup && selectedProcessAndGroup.filter((el) => { return el.GroupName !== clickedData.GroupName })
            dispatch(setSelectedDataOfCheckBox(tempArrForRedux))
            setSelectedData(tempArrAfterDelete)
        } else {
            tempData.push(clickedData)
            tempArrForRedux.push(clickedData)
            dispatch(setSelectedDataOfCheckBox(tempArrForRedux))
            setSelectedData(tempData)
        }
    }

    const isCheckBoxApplicable = (item, index) => {
        let result = false
        selectedProcessAndGroup && selectedProcessAndGroup.map((el) => {
            if (el.GroupName === item.GroupName && el.MachineId === item.MachineId) {
                result = true
            }
            return null
        })
        return result
    }
    return (
        <div>
            <div className='py-3'>
                <table className='table cr-brdr-main group-process-table p-relative'>
                    <thead>
                        <tr>
                            <th>Process Group</th>
                            <th>Process Type</th>
                            <th>{technologyLabel}</th>
                            <th>Machine Name</th>
                            <th>MachineTonnage</th>
                        </tr>
                    </thead>
                    {
                        isLoader && <LoaderCustom />
                    }
                    <tbody>
                        {tableData && tableData.map((item, index) => {
                            const ProcessList = item.ProcessList;
                            return <>
                                <tr>

                                    <td> <span className='mr-2'>
                                        <label className="custom-checkbox" > {item.GroupName} {!findGroupCode(item, selectedProcessGroupId) &&
                                            <>
                                                <input type="checkbox" defaultChecked={isCheckBoxApplicable(item, index)} onClick={() => handleCheckBox(item, index)} />
                                                <span className="before-box" />
                                            </>
                                        }
                                        </label>
                                    </span>
                                    </td>
                                    <td>{item?.EntryType ? item?.EntryType : '-'}</td>
                                    <td>{item.Technology}</td>
                                    <td>{item.MachineName}</td>
                                    <td ><div className='process-name'>{item.Tonnage}
                                        <div onClick={() => {
                                            processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                                        }} className={`${processAccObj[index] ? 'Open' : 'Close'}`}></div> </div></td>
                                </tr>
                                {processAccObj[index] && <tr>
                                    <td colSpan={5}>
                                        <table className='table cr-brdr-main mb-0'>
                                            <thead>
                                                <tr>
                                                    <th>Process Name</th>
                                                    <th>Machine Rate</th>
                                                    <th>UOM</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ProcessList && ProcessList.map(item => {
                                                    return <tr>
                                                        <td>{item.ProcessName}</td>
                                                        <td>{item.MachineRate}</td>
                                                        <td>{item.UOM}</td>
                                                    </tr>
                                                })}

                                            </tbody>
                                        </table>
                                    </td>
                                </tr>}
                            </>
                        })}
                        {tableData && tableData.length === 0 && <tr>
                            <td colSpan={"4"}>
                                <NoContentFound title={EMPTY_DATA} />
                            </td>
                        </tr>}

                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GroupProcess;