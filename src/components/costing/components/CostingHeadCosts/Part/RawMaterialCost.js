import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Col, Row } from 'reactstrap';
import AddRM from '../../Drawers/AddRM';

function RawMaterialCost(props) {

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
              <p>{'Raw Material Cost'}</p>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD RM</button>
            </Col>
          </Row>
          <Row>
            {'Costing grid goes here'}
          </Row>
        </div>
      </div >
      {isDrawerOpen && <AddRM
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
    </ >
  );
}

export default RawMaterialCost;