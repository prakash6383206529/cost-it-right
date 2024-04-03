export function Steps(t, config) {

    const masterTab = [

        {
            element: "#AddMaster_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        },
        {
            element: "#AddMaster_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".master_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },

    ];

    const additionalMasterTab = [
        {
            element: "#AdditionalMaster_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        },
        {
            element: "#AdditionalMaster_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".additional_masters_Toggle_Message",
            intro: t("addRoleComponent.action"),
        }
    ];
    const costingTab = [
        {
            element: "#Costing_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        },
        {
            element: "#Costing_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".costing_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },
    ];


    const simulationTab = [
        {
            element: "#Simulation_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        },
        {
            element: "#Simulation_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".simulation_Toggle_Message",
            intro: t("addRoleComponent.action"),
        }
    ];

    const reportTab = [
        {
            element: "#Report_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        }, {
            element: "#Report_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),

        },
        {
            element: ".reports_and_analytics_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },
    ];

    const userTab = [
        {
            element: "#User_SelectAll_Check",
            intro: t("addRoleComponent.select_all"),
        },
        {
            element: "#User_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".users_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },

    ];

    const rfqTab = [
        {
            element: "#RFQ_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".rfq_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },
    ];

    const nfrTab = [
        {
            element: "#NFR_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".nfr_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },

    ];

    const auditTab = [
        {
            element: "#Audit_Specific_SelectAll_Check",
            intro: t("addRoleComponent.specific_select"),
        },
        {
            element: ".audit_Toggle_Message",
            intro: t("addRoleComponent.action"),
        },

    ];

    return {
        Master: masterTab,
        Simulation: simulationTab,
        Costing: costingTab,
        AdditionalMaster: additionalMasterTab,
        Report: reportTab,
        User: userTab,
        RFQ: rfqTab,
        NFR: nfrTab,
        Audit: auditTab,
    };
}