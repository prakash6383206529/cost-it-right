import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form";
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
//import { addPatient } from "../actions";
import classnames from 'classnames';
import CostingDetails from './CostingDetails';

function Costing(props) {

    const { register, handleSubmit, watch, errors } = useForm();

    const [activeTab, setActiveTab] = useState('1');

    /**
    * @method toggle
    * @description toggling the tabs
    */
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    }

    const dispatch = useDispatch();
    const onSubmit = data => {
        //dispatch(addPatient(data))
    }

    /**
    * @method render
    * @description Renders the component
    */
    return (
        <>
            <div className="user-page p-0">
                {/* {this.props.loading && <Loader/>} */}
                <div>
                    <h1>Costing</h1>
                    <Nav tabs className="subtabs">
                        <NavItem>
                            <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                                Insights
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                                Costing Details
                                </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                                Costing Summary
                                </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' &&
                            <TabPane tabId="1">
                                <CostingDetails />
                            </TabPane>}
                        {activeTab === '2' &&
                            <TabPane tabId="2">
                                {'Costing summary goes here'}
                            </TabPane>}
                        {activeTab === '3' &&
                            <TabPane tabId="3">
                                {'Insights'}
                            </TabPane>}
                    </TabContent>
                </div>
            </div >
        </ >
    );
}


const CostingForm = connect()(Costing);
export default CostingForm;