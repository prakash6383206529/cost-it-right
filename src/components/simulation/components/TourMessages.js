export function Steps(t, config) {
    let technologyView = false;
    let bopAssociationView = false;
    let masterView = false;
    let vendorView = false
    let showTourMessage = true
    let showEditMaster = false
    let showverifyPage = false
    let costingPage = false
    let applicabilityContainer = false
    const technologyviewArr = [10, 3, 9, 6, 1, 2, 7];
    if (config) {
        technologyView = technologyviewArr.includes(Number(config?.selectedMasterForSimulation?.value))
        bopAssociationView = Number(config?.selectedMasterForSimulation?.value) === 4 || Number(config?.selectedMasterForSimulation?.value) === 5
        applicabilityContainer = Number(config?.selectedMasterForSimulation?.value) === 8 || config?.simulationApplicability
        vendorView = Number(config?.selectedMasterForSimulation?.value) === 10 || (Number(config?.selectedMasterForSimulation?.value) === 3) || (Number(config?.selectedMasterForSimulation?.value) === 8 && config?.simulationApplicability)
        masterView = config?.selectedTechnologyForSimulation?.value !== "" && (config?.selectedTechnologyForSimulation ? (Number(config?.selectedTechnologyForSimulation?.value) === 10 ? (config?.selectedVendorForSimulation?.value !== "" && config?.selectedVendorForSimulation?.value !== undefined ? true : false) : true) : false);
        showTourMessage = !(Number(config?.selectedMasterForSimulation?.value) === 10 || Number(config?.selectedMasterForSimulation?.value) === 8);
        showEditMaster = config.showEditMaster !== undefined ? config.showEditMaster : false;
        showverifyPage = config.showverifyPage !== undefined ? config.showverifyPage : false;
        costingPage = config.costingDrawerPage !== undefined ? config.costingDrawerPage : false;

    }
    return {
        SIMULATION: [
            ...((showEditMaster === false && Number(config?.selectedMasterForSimulation?.value) !== 10) || (Number(config?.selectedMasterForSimulation?.value) === 10 && showverifyPage === false) ? [

                {
                    element: "#Masters_container",
                    intro: t("Simulation.masters"),
                },

                ...(bopAssociationView ? [
                    {
                        element: "#Association_container",
                        intro: t("Simulation.association"),
                    }
                ] : []),
                ...(technologyView ? [
                    {
                        element: "#Technology_container",
                        intro: t("Simulation.technology"),
                    }
                ] : []),
                ...(applicabilityContainer ? [
                    {
                        element: "#Applicability_container",
                        intro: t("Simulation.applicability"),
                    }
                ] : []),

                ...(vendorView ? [
                    {
                        element: "#Vendor_container",
                        intro: t("Simulation.vendor"),
                    }
                ] : []),

                ...(masterView || config?.isMasterAssociatedWithCosting === false || (Number(config?.selectedMasterForSimulation?.value) === 8 && config?.simulationApplicability && config?.selectedVendorForSimulation) ? [
                    {
                        element: "#filter-text-box",
                        intro: t("Simulation.globalSearch"),
                    },


                    {
                        element: " .ag-text-field-input",
                        intro: t("Simulation.floatingFilterInput"),
                    },

                    {
                        element: ".ag-floating-filter-button",
                        intro: t("Simulation.floatingFilterButton"),
                    },
                    ...(Number(config?.selectedMasterForSimulation?.value) !== 8 ? [

                        {
                            element: ".ag-input-field-input",
                            intro: t("Simulation.checkbox"),
                        },

                    ] : []),

                    ...(showTourMessage ? [
                        {
                            element: ".Tour_List_Filter",
                            intro: t("Simulation.filter"),
                            position: "left"

                        },
                    ] : []),

                    ...(Number(config?.selectedMasterForSimulation.value) !== 10 ? [
                        {
                            element: ".Tour_List_Reset",
                            intro: t("Simulation.refresh"),
                        },
                    ] : []),
                    ...(Number(config?.selectedMasterForSimulation?.value) !== 10 ? [
                        {
                            element: "#simulation-edit",
                            intro: t("Simulation.edit"),
                        },
                    ] : []),
                    ...(showTourMessage ? [
                        {
                            element: "#simulation-download",
                            intro: t("Simulation.download"),
                        },
                    ] : []),
                    ...(showTourMessage ? [

                        {
                            element: "#simulation-upload",
                            intro: t("Simulation.upload"),
                            position: "left"
                        },
                    ] : []),

                    ...(Number(config?.selectedMasterForSimulation?.value) === 10 ? [

                        {
                            element: "#assembly_effective_date",
                            intro: t("Simulation.date"),
                        },
                    ] : []),
                    ...(Number(config?.selectedMasterForSimulation?.value) === 10 ? [

                        {
                            element: "#assembly_cancel",
                            intro: t("Simulation.cancel"),
                        },
                    ] : []),
                    ...(Number(config?.selectedMasterForSimulation?.value) === 10 ? [

                        {
                            element: "#assembly_verify",
                            intro: t("Simulation.verify"),
                        },
                    ] : []),


                ] : []),


            ] : []),
            ...(showEditMaster === true ? [
                ...(showverifyPage === false /* || (costingPage === false && showverifyPage === true) */ ? [


                    {
                        element: ".back_simulationPage",
                        intro: t("Simulation.back"),
                        position: "left"
                    },


                    ...(Number(config?.selectedMasterForSimulation?.value) === 1 ? [
                        {
                            element: ".basicRate_revised",
                            intro: t("Simulation.editBasicRate"),
                        },
                        {
                            element: " #newScrapRate-0",
                            intro: t("Simulation.editScrapRate"),
                        },
                    ] : []),
                    ...(Number(config?.selectedMasterForSimulation?.value) === 4 ? [

                        {
                            element: "#newBasicRate-0",
                            intro: t("Simulation.editBasicRate"),
                        },

                        {
                            element: " #netCost_revised",
                            intro: t("Simulation.editNetCost"),
                        },

                    ] : []),
                    ...(Number(config?.selectedMasterForSimulation?.value) === 7 || Number(config?.selectedMasterForSimulation?.value) === 9 || Number(config?.selectedMasterForSimulation?.value) === 6 ? [
                        {
                            element: " .netCost_revised",
                            intro: t("Simulation.editNetCost"),
                        },
                    ] : []),

                    {
                        element: ".simulation_effectiveDate",
                        intro: t("Simulation.date"),
                    },

                    {
                        element: ".verifySimulation",
                        intro: t("Simulation.verify"),
                        position: "left"
                    },
                ] : []),
            ] : []),
            ...((config?.isMasterAssociatedWithCosting === true || (costingPage === false && showEditMaster === true) || Number(config?.selectedMasterForSimulation?.value) === 10) && showverifyPage === true ? [
                ...!(showverifyPage && showEditMaster && costingPage) ? [
                    {
                        element: ".back_verify_page",
                        intro: t("Simulation.back"),
                        position: "left"
                    },
                    {
                        element: "#run-simulation-btn",
                        intro: t("Simulation.run_Simulation"),
                        position: "left"

                    },
                ] : []
            ] : []),
            ...(/* config?.selectedMasterForSimulation?.value === "4" && config?.isMasterAssociatedWithCosting === false &&  */showverifyPage === true && showEditMaster === true && costingPage ? [

                {
                    element: "#other_simulation_send_for_approval",
                    intro: t("Simulation.sendForApproval"),
                },

                {
                    element: "#other_simulation_go_to_history",
                    intro: t("Simulation.simulationHistory"),
                },
                {
                    element: "#other_simulation_verify_impact",
                    intro: t("Simulation.verifyImpact"),
                },

            ] : []),

        ],
        SIMULATION_APPROVAL: [


            {
                element: "#filter-text-box",
                intro: t("simulationApproval.searchInput"),
            },
            {
                element: " .ag-text-field-input",
                intro: t("simulationApproval.floating_FilterInput"),
            },

            {
                element: ".ag-floating-filter-button",
                intro: t("simulationApproval.floating_FilterButton"),
            },
            {
                element: ".ag-input-field-input",
                intro: t("simulationApproval.checkBoxButton"),
            },
            {
                element: "#simulation_approval_listing_0",
                intro: t("simulationApproval.simulation_Summary"),
            },

            {
                element: '#Simulation_Approval_Filter',
                intro: t("simulationApproval.filterButton")
            },

            {
                element: '#Simulation_Approval_Reset',
                intro: t("simulationApproval.refreshButton")
            },
            {
                element: '#Simulation_Approval_Send',
                intro: t("simulationApproval.sendForApproval")
            },
            {
                element: '#Simulation_View',
                intro: t("simulationApproval.view")
            },
            {
                element: '#Simulation_Delete',
                intro: t("simulationApproval.delete")
            },
            {
                element: '#singleDropDown_container',
                intro: t("simulationApproval.status")
            }


        ],
        RunsimulationDrawer: [
            {
                element: "#simulation_checkbox",
                intro: t("Simulation.simulation_Checkbox"),
            },
            {
                element: "#applicability-cancel",
                intro: t("Simulation.cancel"),
            },
            {
                element: "#applicability-run-simulation",
                intro: t("Simulation.run_Simulation"),
            },

        ],


    }

}