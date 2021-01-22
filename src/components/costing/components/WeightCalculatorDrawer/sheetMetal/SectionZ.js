import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, } from 'reactstrap';

function SectionZ(props) {

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>

          <Row>
            <Col md="12">
            </Col>
          </Row>

        </div>
      </div >
    </ >
  );
}

export default SectionZ;