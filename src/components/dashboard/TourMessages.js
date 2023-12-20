export function Steps(t) {
    return {
        DASHBOARD_SIMULATION_TAB: [
            {
                element: "#dashboard_simulation_Pending_For_Approval",
                intro: t("simulationApproval.dashboard_simulation_Pending_For_Approval"),
            },
            {
                element: "#dashboard_simulation_Awaiting_Approval",
                intro: t("simulationApproval.dashboard_simulation_Awaiting_Approval"),
            },
            {
                element: "#dashboard_simulation_Rejected",
                intro: t("simulationApproval.dashboard_simulation_Rejected"),
            },
            {
                element: "#dashboard_simulation_Approved",
                intro: t("simulationApproval.dashboard_simulation_Approved"),
            },
        ],
        DASHBOARD_COSTING_TAB: [
            {
                element: "#dashboard_costing_Pending_For_Approval",
                intro: t("simulationApproval.dashboard_costing_Pending_For_Approval"),
            },
            {
                element: "#dashboard_costing_Awaiting_Approval",
                intro: t("simulationApproval.dashboard_costing_Awaiting_Approval"),
            },
            {
                element: "#dashboard_costing_Rejected",
                intro: t("simulationApproval.dashboard_costing_Rejected"),
            },
            {
                element: "#dashboard_costing_Approved",
                intro: t("simulationApproval.dashboard_costing_Approved"),
            },
        ],

    }
}
