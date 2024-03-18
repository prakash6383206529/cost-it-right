
import { reactLocalStorage } from "reactjs-localstorage";
export function Steps(t, config) {

    return {
        ADD_VOLUME: [
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
                intro: t("VolumeMaster.AddVolume_Save"),
            },
        ]
    }

}
