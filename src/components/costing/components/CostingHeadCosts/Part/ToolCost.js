import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Col, Row } from 'reactstrap';
import AddTool from '../../Drawers/AddTool';

function ToolCost(props) {

  const [isDrawerOpen, setDrawerOpen] = useState(false)

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
          <Row>
            <Col col={'10'}>
              <p>{'Tool Cost'}</p>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD TOOL</button>
            </Col>
          </Row>
          <Row>
            {'Costing grid goes here'}
          </Row>
        </div>
      </div >
      {isDrawerOpen && <AddTool
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
    </ >
  );
}

export default ToolCost;