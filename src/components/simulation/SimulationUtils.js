import { BOPImpactDownloadArray, CPImpactDownloadArray, ERImpactDownloadArray, OperationImpactDownloadArray, RMImpactedDownloadArray } from "../../config/masterData";


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
    let operationArraySet = [], erArraySet = [], combinedProcessArraySet = []

    impactedMasterData?.OperationImpactedMasterDataList && impactedMasterData?.OperationImpactedMasterDataList.map((item) => {
        let tempObj = []

        tempObj.push(item.OperationName)
        tempObj.push(item.OperationCode)
        tempObj.push(item.UOM)
        tempObj.push(item.OldOperationRate)
        tempObj.push(item.NewOperationRate)
        tempObj.push(item.EffectiveDate)
        operationArraySet.push(tempObj)
    })

    impactedMasterData?.RawMaterialImpactedMasterDataList && impactedMasterData?.RawMaterialImpactedMasterDataList.map((item) => {

        let tempObj = []

        tempObj.push(item.RawMaterial)
        tempObj.push(item.RMGrade)
        tempObj.push(item.RMSpec)
        tempObj.push(item.RawMaterialCode)
        tempObj.push(item.Category)
        tempObj.push(item.TechnologyName)
        tempObj.push(item.VendorName)
        tempObj.push(item.UOM)
        tempObj.push(item.OldBasicRate)
        tempObj.push(item.NewBasicRate)
        tempObj.push(item.OldScrapRate)
        tempObj.push(item.NewScrapRate)
        tempObj.push(item.RMFreightCost)
        tempObj.push(item.RMShearingCost)
        tempObj.push(item.EffectiveDate)
        rmArraySet.push(tempObj)
    })

    impactedMasterData?.BoughtOutPartImpactedMasterDataList && impactedMasterData?.BoughtOutPartImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.BoughtOutPartNumber)
        tempObj.push(item.BoughtOutPartName)
        tempObj.push(item.Category)
        tempObj.push(item.Vendor)
        tempObj.push(item.PartNumber)
        tempObj.push(item.OldBOPRate)
        tempObj.push(item.NewBOPRate)
        tempObj.push(item.OldPOPrice)
        tempObj.push(item.NewPOPrice)
        tempObj.push(item.EffectiveDate)
        bopArraySet.push(tempObj)
    })
    impactedMasterData?.ExchangeRateImpactedMasterDataList && impactedMasterData?.ExchangeRateImpactedMasterDataList.map((item) => {
        let tempObj = []
        tempObj.push(item.Currency)
        tempObj.push(item.CostingNumber)
        tempObj.push(item.PartNumber)
        tempObj.push(item.BankRate)
        tempObj.push(item.BankCommissionPercentage)
        tempObj.push(item.CustomRate)
        tempObj.push(item.CurrencyExchangeRate)
        tempObj.push(item.NewExchangeRate)
        tempObj.push(item.OldExchangeRate)
        tempObj.push(item.EffectiveDate)
        erArraySet.push(tempObj)
    })
    impactedMasterData?.CombinedProcessImpactedMasterDataList && impactedMasterData?.CombinedProcessImpactedMasterDataList.map((item) => {
        let tempObj = []

        tempObj.push(item.PartNumber)
        tempObj.push(item.OldPOPrice)
        tempObj.push(item.NewPOPrice)
        tempObj.push(item.OldNetCC)
        tempObj.push(item.NewPOPrice)
        tempObj.push(item.EffectiveDate)
        combinedProcessArraySet.push(tempObj)
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
        }
    ];
    return multiDataSet
}