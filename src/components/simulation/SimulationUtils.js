

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
        item.NewDiscountCost = (item.NewDiscountCost === 0 ? item.NOldDiscountCostewRMPrice : item.NewDiscountCost)
        item.NewNetOverheadAndProfitCost = (item.NewNetOverheadAndProfitCost === 0 ? item.OldNetOverheadAndProfitCost : item.NewNetOverheadAndProfitCost)
        return null
    });




    return TempData



}