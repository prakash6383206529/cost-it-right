import React from 'react'
import { Row, Col, Container } from 'reactstrap'

import Drawer from '@material-ui/core/Drawer'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import Facing from './Facing'
import Drilling from './Drilling'
import Turning from './Turning'
import Chamfering from './Chamfering'
import FaceMilling from './FaceMilling'
import SideFaceMiling from './SideFaceMiling'
import SlotCutting from './SlotCutting'
import ChamferingMiller from './ChamferingMiller'
import EndMill from './EndMill'
function VariableMhrDrawer(props) {
  const { technology, process } = props
  console.log(process, 'Process')
  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, weightData = {}) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', weightData)
  }
  const getProcessComponent = () => {
    console.log('Entered in switch case')
    switch (process) {
      case 'Facing':
        return <Facing technology={technology} />
      case 'Drilling':
        return <Drilling technology={technology} />
      case 'Turning':
        return <Turning technology={technology} />
      case 'Chamfering':
        return <Chamfering technology={technology} />
      case 'Face Miling':
        return <FaceMilling technology={technology} />
      case 'Side face Miling':
        return <SideFaceMiling technology={technology} />
      case 'Slot Cutting':
        return <SlotCutting technology={technology} />
      case 'Chamfering Miller':
        return <ChamferingMiller technology={technology} />
      case 'End Mill':
        return <EndMill technology={technology} />
    }
  }

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Calculator'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row>
              <div>{getProcessComponent()}</div>
            </Row>
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default VariableMhrDrawer
