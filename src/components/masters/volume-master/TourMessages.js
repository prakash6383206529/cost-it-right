
import { reactLocalStorage } from "reactjs-localstorage";
export function Steps(t, config) {
    const introMessage = (config && config.isEditFlag === false) ? t("DynamicActionControl.save_Button") : t("DynamicActionControl.update_Button");
    const actualQuantity = (config && config.isEditFlag === false) ? t("VolumeMaster.AddVolume_actual_Quantity") : t("VolumeMaster.AddVolume_Edit_actual_Quantity");

    return {
        ADD_VOLUME: [
            ...(config && config.isEditFlag === false) ? [
                {
                    element: "#Volume_ZeroBased",
                    intro: t("VolumeMaster.AddVolume_ZeroBased"),
                },
                {
                    element: "#Volume_VendorBased",
                    intro: t("VolumeMaster.AddVolume_VendorBased"),
                },
                ...(reactLocalStorage.getObject('CostingTypePermission').cbc ? [{
                    element: "#Volume_CustomerBased",
                    intro: t("VolumeMaster.AddVolume_CustomerBased"),
                }] : []),

                ...(config && config.vendorField ? [{
                    element: "#AddVolume_vendorName",
                    intro: t("VolumeMaster.AddVolume_Vendor_container"),
                },] : []),


                ...(config && config.plantField ? [{
                    element: "#AddVolume_Plant_container",
                    intro: t("VolumeMaster.AddVolume_PlantCode"),
                },] : []),


                ...(config && config.destinationPlant ? [{
                    element: "#AddVolume_DestinationPlant_container",
                    intro: t("VolumeMaster.AddVolume_PlantCode"),
                },] : []),
                ...(config && config.customerField ? [{
                    element: "#AddVolume_clientName_container",
                    intro: t("VolumeMaster.AddVolume_CustomerCode"),
                },] : []),
                {
                    element: "#AddVolume_PartType_container",
                    intro: t("VolumeMaster.AddVolume_PartType"),
                },
                {
                    element: "#AddVolume_PartNumber",
                    intro: t("VolumeMaster.AddVolume_PartNumber"),
                },
                {
                    element: "#AddVolume_FinancialYear_container",
                    intro: t("VolumeMaster.AddVolume_Year"),
                },
            ] : [],

            {
                element: "#actual_Quantity",
                intro: actualQuantity,
            },
            {
                element: "#AddVolume_Delete",
                intro: t("VolumeMaster.AddVolume_Delete"),
            },

            {
                element: "#Volume_CancelBtn",
                intro: t("VolumeMaster.AddVolume_Cancel"),
            },
            {
                element: "#Volume_SubmitBtn",
                intro: introMessage,
            },
        ]
    }

}
