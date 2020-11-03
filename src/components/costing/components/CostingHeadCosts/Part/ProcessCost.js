import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Col, Row } from 'reactstrap';
import Switch from "react-switch";
import OperationCost from './OperationCost';
import ToolCost from './ToolCost';
import AddProcess from '../../Drawers/AddProcess';

function ProcessCost(props) {

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false);

  /**
    * @method onToolToggle
    * @description TOOL COST TOGGLE
    */
  const onToolToggle = () => {
    setIsOpen(!isOpen)
  }

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '') => {
    setDrawerOpen(false)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <hr />
          <Row>
            <Col md="12" className={'mb15'}>
              <p>{'Conversion Cost'}</p>
            </Col>
            <Col md="3">{'Process Cost: Auto Populated'}</Col>
            <Col md="3">{'Operation Cost: Auto Populated'}</Col>
            <Col md="3">{'Net Conversion Cost: Auto Populated'}</Col>
            <Col md="3" className="switch mb15">
              <label className="switch-level">
                <div className={'left-title'}>{''}</div>
                <Switch
                  onChange={onToolToggle}
                  checked={isOpen}
                  id="normal-switch"
                  disabled={false}
                  background="#4DC771"
                  onColor="#4DC771"
                  onHandleColor="#ffffff"
                  offColor="#4DC771"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={46}
                />
                <div className={'right-title'}>Show Tool Cost</div>
              </label>
            </Col>
          </Row>
          <Row>
            <Col col={'10'}>
              <p>{'Process Cost'}</p>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD PROCESS</button>
            </Col>
          </Row>
          <Row>
            {'Costing grid goes here'}
          </Row>
          <hr />
          <OperationCost />
          <hr />
          {isOpen && <ToolCost />}
        </div>
      </div>
      {isDrawerOpen && <AddProcess
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
    </ >
  );
}

export default ProcessCost;