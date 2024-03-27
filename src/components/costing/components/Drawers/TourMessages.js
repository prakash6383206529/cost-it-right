import { showBopLabel } from "../../../../helper";

export function Steps(t) {
    // const initialConfiguration = useReducer(state => state.auth.initialConfiguration)
    const introWithBOPDynamicValue = (intro) => intro.replace(/bop|BOP/gi, showBopLabel());

    return {
        ADD_BOP_HANDLING_CHARGE: [
            {
                element: "#BOPHandlingType_container",
                intro: introWithBOPDynamicValue(t("BopCostHandlingCharge.bop_Handling_Type")),
            },
            {
                element: "#BOPHandlingPercentage",
                intro: t("BopCostHandlingCharge.percentage"),
            },
            {
                element: "#AddBopHandlingCharge_Cancel",
                intro: t("BopCostHandlingCharge.save"),
            },
            {
                element: "#AddBopHandlingCharge_Save",
                intro: t("BopCostHandlingCharge.cancel"),
            },
        ],
        ADD_ASSEMBLY_OPERATION: [


            {
                element: "#Costing_addOperation",
                intro: t("AddAssemblyOperation.add_operation"),
            },
            {
                element: "#AddAssemblyOperation_Save",
                intro: t("AddAssemblyOperation.save"),
            },
            {
                element: "#AddAssemblyOperation_Cancel",
                intro: t("AddAssemblyOperation.cancel"),
            },
        ],
        ADD_ASSEMBLY_PROCESS: [


            {
                element: "#Costing_addProcess",
                intro: t("AddAssemblyOperation.add_process"),
            },
            {
                element: "#AddAssemblyProcess_Cancel",
                intro: t("AddAssemblyOperation.save"),
            },
            {
                element: "#AddAssemblyProcess_Save",
                intro: t("AddAssemblyOperation.cancel"),
            },
        ],
        ADD_PACKAGING: [


            {
                element: "#Add_Packaging_Description",
                intro: t("AddPackaging.package_Description"),
            },
            {
                element: ".input-container #Applicability_container",
                intro: t("AddPackaging.applicability"),
            },
            {
                element: "#Add_Packaging_Percentage",
                intro: t("AddPackaging.percentage"),
            },

            {
                element: "#AddPackaging_Save",
                intro: t("AddPackaging.save"),
            },
            {
                element: "#AddPackaging_Cancel",
                intro: t("AddPackaging.cancel"),
            }
        ],
        ADD_FREIGHT: [


            {
                element: "#Add_FreightType_Full_Truck",
                intro: t("AddFreight.full_Truck_Load"),
            },
            {
                element: "#Add_FreightType_Part_Truck",
                intro: t("AddFreight.part_Truck_Load"),
            },
            {
                element: "#Add_FreightType_Fixed_Truck",
                intro: t("AddFreight.fixed"),
            },
            {
                element: "#Add_FreightType_Percentage_Truck",
                intro: t("AddFreight.percentage"),
            },

            {
                element: ".input-container #Criteria_container",
                intro: t("AddFreight.rate_Criteria"),
            },

            {
                element: "#AddFreight_Save",
                intro: t("AddFreight.save"),
            },
            {
                element: "#AddFreight_Cancel",
                intro: t("AddFreight.cancel"),
            }
        ]
    }
}