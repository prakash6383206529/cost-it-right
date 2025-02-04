import React, { useEffect, useState } from "react";
import { BOPImpactDownloadArray, ERImpactDownloadArray, MachineImpactDownloadArray, OperationImpactDownloadArray, RMImpactedDownloadArray, STOperationImpactDownloadArray, CPImpactDownloadArray } from "../../config/masterData";
import { Errorbox } from "../common/ErrorBox";
import { getAmmendentStatus } from './actions/Simulation'
import imgRedcross from '../../assests/images/red-cross.png';
import imgGreencross from '../../assests/images/greenCross.png';
import DayTime from "../common/DayTimeWrapper";
import _ from "lodash";
import { useDispatch, useSelector } from 'react-redux';
import { getConfigurationKey } from "../../helper";
export const SimulationUtils = (TempData) => {

    TempData && TempData.map(item => {

        if (item.CostingHead === true) {
            item.CostingHead = 'Vendor Based'
        } else if (item.CostingHead === false) {
            item.CostingHead = 'Zero Based'
        }

        item.NewPOPrice = (item.NewPOPrice === 0 ? item.OldPOPrice : item.NewPOPrice)
        item.NewRMRate = (item.NewRMRate === 0 ? item.OldRMRate : item.NewRMRate)
        item.NewScrapRate = (item.NewScrapRate === 0 ? item.OldScrapRate : item.NewScrapRate)
        item.NewRMPrice = (item.NewRMPrice === 0 ? item.OldRMPrice : item.NewRMPrice)

        item.NewOverheadCost = (item.NewOverheadCost === 0 ? item.OldOverheadCost : item.NewOverheadCost)
        item.NewProfitCost = (item.NewProfitCost === 0 ? item.OldProfitCost : item.NewProfitCost)
        item.NewRejectionCost = (item.NewRejectionCost === 0 ? item.OldRejectionCost : item.NewRejectionCost)
        item.NewICCCost = (item.NewICCCost === 0 ? item.OldICCCost : item.NewICCCost)
        item.NewPaymentTermsCost = (item.NewPaymentTermsCost === 0 ? item.OldPaymentTermsCost : item.NewPaymentTermsCost)
        item.NewOtherCost = (item.NewOtherCost === 0 ? item.OldOtherCost : item.NewOtherCost)
        item.NewDiscountCost = ((item.NewDiscountCost === 0 || item.NewDiscountCost === undefined) ? item.OldDiscountCost : item.NewDiscountCost)
        item.NewNetOverheadAndProfitCost = (item.NewNetOverheadAndProfitCost === 0 ? item.OldNetOverheadAndProfitCost : item.NewNetOverheadAndProfitCost)
        return null
    });

    return TempData
}


export const getMaxDate = (arr) => {

    // ✅ Get Max date
    const maxDate = _.maxBy(arr, entry => new Date(entry.EffectiveDate));
    return maxDate

}
export const getMinDate = (arr) => {
    // Get Min date
    const minDate = _.minBy(arr, entry => new Date(entry.EffectiveDate));
    return minDate;
}

export const checkForChangeInOverheadProfit1Values = (item) => {
    if ((item.NewApplicabilityType === item.ApplicabilityType &&
        (item.NewValue !== null && item.NewValue !== undefined
            && item.NewValue !== '' && item.NewValue !== ' ' &&
            Number(item.NewValue) !== Number(item.Value))) ||
        (item.NewApplicabilityType !== item.ApplicabilityType &&
            (item.NewValue !== null && item.NewValue !== undefined
                && item.NewValue !== '' && item.NewValue !== ' ')))
        return item
}

export const checkForChangeInOverheadProfit2Values = (item) => {
    if ((item.NewApplicabilityType === item.ApplicabilityType &&
        ((item.NewOverheadPercentage !== null && item.NewOverheadPercentage !== undefined
            && item.NewOverheadPercentage !== '' && item.NewOverheadPercentage !== ' ' &&
            Number(item.NewOverheadPercentage) !== Number(item.OverheadPercentage)) ||

            (((item.NewFirstValue !== null && item.NewFirstValue !== undefined
                && item.NewFirstValue !== '' && item.NewFirstValue !== ' ') &&
                Number(item.NewFirstValue) !== Number(item.FirstValue)) ||

                ((item.NewSecondValue !== null && item.NewSecondValue !== undefined
                    && item.NewSecondValue !== '' && item.NewSecondValue !== ' ') &&
                    Number(item.NewSecondValue) !== Number(item.SecondValue))))) ||

        (item.NewApplicabilityType !== item.ApplicabilityType &&
            ((item.NewOverheadPercentage !== null && item.NewOverheadPercentage !== undefined
                && item.NewOverheadPercentage !== '' && item.NewOverheadPercentage !== ' ') ||

                ((item.NewFirstValue !== null && item.NewFirstValue !== undefined
                    && item.NewFirstValue !== '' && item.NewFirstValue !== ' ') ||

                    ((item.NewSecondValue !== null && item.NewSecondValue !== undefined
                        && item.NewSecondValue !== '' && item.NewSecondValue !== ' ')))))
    )
        return item
}

export const checkForChangeInOverheadProfit3Values = (item) => {
    if ((item.NewApplicabilityType === item.ApplicabilityType &&
        ((item.NewOverheadPercentage !== null && item.NewOverheadPercentage !== undefined
            && item.NewOverheadPercentage !== '' && item.NewOverheadPercentage !== ' ' &&
            Number(item.NewOverheadPercentage) !== Number(item.OverheadPercentage)) ||

            (((item.NewFirstValue !== null && item.NewFirstValue !== undefined
                && item.NewFirstValue !== '' && item.NewFirstValue !== ' ') &&
                Number(item.NewFirstValue) !== Number(item.FirstValue)) ||

                ((item.NewSecondValue !== null && item.NewSecondValue !== undefined
                    && item.NewSecondValue !== '' && item.NewSecondValue !== ' ') &&
                    Number(item.NewSecondValue) !== Number(item.SecondValue)) ||

                ((item.NewThirdValue !== null && item.NewThirdValue !== undefined
                    && item.NewThirdValue !== '' && item.NewThirdValue !== ' ') &&
                    Number(item.NewThirdValue) !== Number(item.ThirdValue))))) ||

        (item.NewApplicabilityType !== item.ApplicabilityType &&
            ((item.NewOverheadPercentage !== null && item.NewOverheadPercentage !== undefined
                && item.NewOverheadPercentage !== '' && item.NewOverheadPercentage !== ' ') ||

                ((item.NewFirstValue !== null && item.NewFirstValue !== undefined
                    && item.NewFirstValue !== '' && item.NewFirstValue !== ' ') ||

                    ((item.NewSecondValue !== null && item.NewSecondValue !== undefined
                        && item.NewSecondValue !== '' && item.NewSecondValue !== ' ')) ||

                    ((item.NewThirdValue !== null && item.NewThirdValue !== undefined
                        && item.NewThirdValue !== '' && item.NewThirdValue !== ' ')))))
    )
        return item
}

export const impactmasterDownload = (impactedMasterData) => {
    let rmArraySet = [], bopArraySet = []
    let operationArraySet = [], erArraySet = [], combinedProcessArraySet = [], surfaceTreatmentArraySet = [], machineArraySet = []

    impactedMasterData?.OperationImpactedMasterDataList && impactedMasterData?.OperationImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.OperationName)
        tempObj.push(item.OperationCode)
        tempObj.push(item.UOM)
        tempObj.push(item.OldOperationRate)
        tempObj.push(item.NewOperationRate)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        operationArraySet.push(tempObj)
        return null
    })

    impactedMasterData?.SurfaceTreatmentImpactedMasterDataList && impactedMasterData?.SurfaceTreatmentImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.OperationName)
        tempObj.push(item.OperationCode)
        tempObj.push(item.UOM)
        tempObj.push(item.OldOperationRate)
        tempObj.push(item.NewOperationRate)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        surfaceTreatmentArraySet.push(tempObj)
        return null
    })

    impactedMasterData?.RawMaterialImpactedMasterDataList && impactedMasterData?.RawMaterialImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.RawMaterial)
        tempObj.push(item.RMGrade)
        tempObj.push(item.RMSpec)
        tempObj.push(item.RawMaterialCode)
        tempObj.push(item.Category)
        tempObj.push(item.UOM)
        tempObj.push(item.TechnologyName)
        tempObj.push(item.VendorName)
        tempObj.push(item.OldBasicRate)
        tempObj.push(item.NewBasicRate)
        tempObj.push(item.OldScrapRate)
        tempObj.push(item.NewScrapRate)
        tempObj.push(item.RMFreightCost)
        tempObj.push(item.RMShearingCost)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        rmArraySet.push(tempObj)
        return null
    })

    impactedMasterData?.BoughtOutPartImpactedMasterDataList && impactedMasterData?.BoughtOutPartImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.BoughtOutPartNumber)
        tempObj.push(item.BoughtOutPartName)
        tempObj.push(item.Category)
        tempObj.push(item.Vendor)
        tempObj.push(item.OldBOPRate)
        tempObj.push(item.NewBOPRate)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        bopArraySet.push(tempObj)
        return null
    })
    impactedMasterData?.ExchangeRateImpactedMasterDataList && impactedMasterData?.ExchangeRateImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.Currency)
        tempObj.push(item.BankRate)
        tempObj.push(item.BankCommissionPercentage)
        tempObj.push(item.CustomRate)
        tempObj.push(item.CurrencyExchangeRate)
        tempObj.push(item.OldExchangeRate)
        tempObj.push(item.NewExchangeRate)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        erArraySet.push(tempObj)
        return null
    })
    impactedMasterData?.CombinedProcessImpactedMasterDataList && impactedMasterData?.CombinedProcessImpactedMasterDataList.map((item) => {
        let tempObj = []

        tempObj.push(item.PartNumber)
        tempObj.push(item.OldPOPrice)
        tempObj.push(item.NewPOPrice)
        tempObj.push(item.OldNetCC)
        tempObj.push(item.NewPOPrice)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        combinedProcessArraySet.push(tempObj)
    })

    impactedMasterData?.MachineProcessImpactedMasterDataList && impactedMasterData?.MachineProcessImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.MachineName)
        tempObj.push(item.MachineNumber)
        tempObj.push(item.MachineTypeName)
        tempObj.push(item.ProcessName)
        tempObj.push(item.ProcessCode)
        tempObj.push(item.UOM)
        tempObj.push(item.Vendor)
        tempObj.push(item.OldMachineRate)
        tempObj.push(item.NewMachineRate)
        tempObj.push(DayTime(item.EffectiveDate).format('DD/MM/YYYY'))
        machineArraySet.push(tempObj)
        return null
    })
    const multiDataSet = [
        {
            columns: RMImpactedDownloadArray,
            data: rmArraySet
        }, {
            ySteps: 5, //will put space of 5 rows,
            columns: OperationImpactDownloadArray,
            data: operationArraySet
        }, {
            ySteps: 5,
            columns: STOperationImpactDownloadArray,
            data: surfaceTreatmentArraySet
        }, {
            ySteps: 5,
            columns: BOPImpactDownloadArray,
            data: bopArraySet
        }, {
            ySteps: 5,
            columns: ERImpactDownloadArray,
            data: erArraySet
        }, {
            ySteps: 5,
            columns: CPImpactDownloadArray,
            data: combinedProcessArraySet
        }, {
            ySteps: 5,
            columns: MachineImpactDownloadArray,
            data: machineArraySet
        }
    ];
    return multiDataSet
}


// **START** SHOWING STATUS BOX ON THE TOP FOR ERROR AND SUCCESS RESPONSE
export const ErrorMessage = (props) => {
    const [recordInsertStatusBox, setRecordInsertStatusBox] = useState(true);
    const [amendmentStatusBox, setAmendmentStatusBox] = useState(true);
    const [ammendmentStatus, setAmmendmentStatus] = useState('');
    const [showbutton, setShowButton] = useState(false)
    const [amendentStatus, setAmendentstatus] = useState('')
    const [toggleSeeData, setToggleSeeData] = useState(true)
    const [isGreen, setIsGreen] = useState(false)
    const [toggleAmmendmentData, setToggleAmmendmentStatus] = useState(true)
    const dispatch = useDispatch()
    const [sobButton, setSobButton] = useState(false)            //RE
    const [showSobMessageList, setShowSobMessageList] = useState(false)            //RE
    const [sobMessage, setSobMessage] = useState([])            //RE
    const impactData = useSelector((state) => state.costing.impactData)            //RE

    const funcForErrorBoxButton = () => {

        const statusWithButton = <><p className={`${toggleSeeData ? 'status-overflow' : ''} `}><span>{amendentStatus}</span></p>{<button className='see-data-btn' onClick={() => { setToggleSeeData(!toggleSeeData) }}>Show {toggleSeeData ? 'all' : 'less'} data</button>}</>
        return statusWithButton
    }
    const funcForErrorBoxButtonForAmmendment = () => {

        const statusWithButton = <><p className={`${toggleAmmendmentData ? 'status-overflow' : ''} `}><span>{amendentStatus}</span></p>{<button className='see-data-btn' onClick={() => { setToggleAmmendmentStatus(!toggleAmmendmentData) }}>Show {toggleAmmendmentData ? 'all' : 'less'} data</button>}</>
        return statusWithButton
    }

    const funcForSobMessage = () => {

        const statusWithButton = <><p className={`${toggleAmmendmentData ? 'status-overflow' : ''} `}><span>{sobMessage}</span></p>{<button className='see-data-btn' onClick={() => { setToggleAmmendmentStatus(!toggleAmmendmentData) }}>Show {toggleAmmendmentData ? 'all' : 'less'} data</button>}</>
        return statusWithButton
    }

    useEffect(() => {
        if (getConfigurationKey()?.IsSAPConfigured) {
            const obj = {
                costingId: props?.module === 'Costing' ? props?.id : null,
                simulationId: props?.module === 'Simulation' ? props?.id : null,
                rawMaterialId: props?.module === 'RM' ? props?.id : null,
                boughtOutPartId: props?.module === 'BOP' ? props?.id : null
            }
            dispatch(getAmmendentStatus(obj, res => {
                if (res?.status !== 204) {
                    const { IsSuccessfullyUpdated, ErrorStatus, Status } = res?.data?.DataList[0]
                    if (IsSuccessfullyUpdated === true) {
                        setIsGreen(true)
                        setAmendentstatus(Status)
                        setShowButton(Status?.length > 245 ? true : false)
                    } else {
                        setIsGreen(false)
                        setAmendentstatus(ErrorStatus)
                        setShowButton(ErrorStatus?.length > 245 ? true : false)
                    }
                    setRecordInsertStatusBox(true)
                }
            }))
        }
    }, [])


    useEffect(() => {

        setShowSobMessageList(false)

        if (impactData && impactData.length > 0) {

            let Data = impactData
            let listOfSobMessages = []
            let partNumberObjectArray = []

            Data.map((item) =>

                item.childPartsList.map((ele) => {
                    listOfSobMessages.push(ele.SOBMessage)
                    partNumberObjectArray.push({ [ele.SOBMessage]: ele.PartNumber })
                    return null
                })
            )

            listOfSobMessages = listOfSobMessages.filter((x, i, a) => a.indexOf(x) === i) // TO FIND UNIQUE ELEMENTS
            let newArr = []

            listOfSobMessages.map((item, index) => {
                let arr = []
                if (item === "" || item === null) {
                    setShowSobMessageList(false)
                    return false
                }
                setShowSobMessageList(true)

                partNumberObjectArray.map((ele, i) => {
                    //HERE ITEM = SOB MESSAGE AND ELE = OBJECT OF ARRAY
                    if (ele[item] !== undefined) {
                        //THIS IF IS FOR HANDLING LAST INDEX CONDITION
                        if (partNumberObjectArray.length - 1 === i) {
                            arr.push(ele[item])
                        } else {
                            arr.push(ele[item])
                            // FETCHING PART NUMBER HERE
                        }
                    }
                })

                arr = arr.filter((x, i, a) => a.indexOf(x) === i) // TO FIND UNIQUE PART NUMBER FOR PARTICULAR MESSAGE

                let arrWithComma = []
                arr.map((item, index) => {
                    arrWithComma.push(item)
                    if (index !== arr.length - 1) {
                        arrWithComma.push(",")
                    }
                })
                arr = arrWithComma

                if (newArr.length === 0) {
                    //THIS IF IS FOR INSERTING ON FIRST INDEX(AS  COMMA(,) SHOULD NOT COME AT START POSITION)
                    newArr = [...newArr, " ", " ", item, " (", ...arr, ")", " "]

                } else {
                    newArr = [...newArr, ", ", " ", item, " (", ...arr, ")", " "]
                }
                return null
            })
            setSobMessage(newArr);
            setSobButton(newArr.length > 22 ? true : false)
        }

    }, [impactData])

    const deleteInsertStatusBox = () => {
        setRecordInsertStatusBox(false)
    }
    const deleteAmendmentStatusBox = () => {
        setAmendmentStatusBox(false)
    }
    const deleteSobMessageList = () => {            //RE
        setShowSobMessageList(false)
    }

    const errorBoxClassForAmmendent = () => {
        let temp
        if (ammendmentStatus.startsWith('E')) {
            temp = 'error';
        }
        else if (ammendmentStatus.startsWith('S')) {
            temp = 'success';
        }
        else {
            temp = 'd-none'
        }
        return temp
    }
    const errorBoxClassForStatus = () => {
        let temp;

        temp = (amendentStatus === null || amendentStatus === '' || amendentStatus === undefined) ? 'd-none' : isGreen ? 'success' : 'error';
        return temp
    }
    return (<>
        {recordInsertStatusBox &&
            <div className="error-box-container">
                <Errorbox customClass={errorBoxClassForStatus()} errorText={showbutton ? funcForErrorBoxButton() : amendentStatus} />
                <img
                    className="float-right"
                    alt={""}
                    onClick={deleteInsertStatusBox}
                    src={errorBoxClassForStatus() === 'd-none' ? '' : errorBoxClassForStatus() === "success" ? imgGreencross : imgRedcross}
                ></img>
            </div>
        }

        {/* {amendmentStatusBox &&
            <div className="error-box-container">
                <Errorbox customClass={errorBoxClassForAmmendent()} errorText={ammendentButton ? funcForErrorBoxButtonForAmmendment() : amendentStatus} />
                <img
                    className="float-right"
                    alt={""}
                    onClick={deleteAmendmentStatusBox}
                    src={errorBoxClassForAmmendent() === 'd-none' ? '' : errorBoxClassForAmmendent() === "success" ? imgGreencross : imgRedcross}
                ></img>
            </div>
        } */}
        {showSobMessageList &&
            <div className="error-box-container">
                <Errorbox customClass={"error"} errorText={sobButton ? funcForSobMessage() : sobMessage} />
                <img
                    className="float-right"
                    alt={""}
                    onClick={deleteSobMessageList}
                    src={imgRedcross}
                ></img>
            </div>
        }
    </>)
}
// **END** SHOWING STATUS BOX ON THE TOP FOR ERROR AND SUCCESS RESPONSE
