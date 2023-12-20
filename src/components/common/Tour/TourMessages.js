import React from 'react';

export function Steps(t) {
    return {
        NAVBAR: [
            {
                element: ".language-dropdown",
                intro: "testing mesage",
            },
            {
                element: ".dashboard",
                intro: t('navbar.dashboard'),
            },
            {
                element: ".masters",
                intro: t('navbar.masters'),
            },
            {
                element: ".costing",
                intro: t("navbar.costing"),
            },
            {
                element: ".rfq",
                intro: t("navbar.rfq"),
            },
        ],
        DASHBOARD_SIMULATION_TAB: [
            {
                element: "#dashboard_simulation_Pending_For_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Pending_For_Approval"),
            },
            {
                element: "#dashboard_simulation_Awaiting_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Awaiting_Approval"),
            },
            {
                element: "#dashboard_simulation_Rejected",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Rejected"),
            },
            {
                element: "#dashboard_simulation_Approved",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Approved"),
            },
        ],
        DASHBOARD_COSTING_TAB: [
            {
                element: "#dashboard_simulation_Pending_For_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Pending_For_Approval"),
            },
            {
                element: "#dashboard_simulation_Awaiting_Approval",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Awaiting_Approval"),
            },
            {
                element: "#dashboard_simulation_Rejected",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Rejected"),
            },
            {
                element: "#dashboard_simulation_Approved",
                intro: t("dashboard.simulationApproval.dashboard_simulation_Approved"),
            },
        ],

    }
}
