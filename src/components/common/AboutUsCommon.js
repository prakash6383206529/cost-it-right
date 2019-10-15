import React, { Component } from 'react';
import { Row, Col } from "reactstrap";

export default class AboutUsCommon extends Component {
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <div>
                <Row>
                    <Col><h3>About Cost It Rights </h3></Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis maximus ante massa, vitae porttitor nunc mollis fringilla. Nunc euismod lacus vel rhoncus maximus. Cras id tortor est. Mauris sem neque, cursus eu laoreet ac, tristique ut nibh. Aliquam erat volutpat. Donec feugiat id lorem sit amet auctor. Suspendisse tincidunt augue sit amet finibus ullamcorper. Fusce pharetra urna tristique, faucibus urna quis, tempus sapien. Nullam eu sodales ligula. Pellentesque velit justo, vestibulum id porttitor quis, consectetur eget nisl. Nulla maximus.
                    </Col>
                </Row>
                <Row>
                    <Col className="py-2">
                        Proin eget massa eu augue tristique porta. Donec convallis mollis ultrices. Sed tempor, metus eget ultrices rhoncus, magna lorem bibendum risus, vel blandit ipsum augue vel nisl. Nullam vitae elementum arcu. Fusce sodales velit vel lobortis consequat.
                    </Col>
                </Row>
                <Row>
                    <Col className="py-2">
                        Praesent cursus ultricies erat eu hendrerit. Nunc egestas felis nibh, id laoreet nisl hendrerit vitae. Curabitur nibh ex, faucibus et diam eget, rhoncus aliquam risus. Nunc eget egestas ante. Sed finibus erat ac sem tincidunt feugiat. Aliquam id lorem a nulla interdum vestibulum.
                    </Col>
                </Row>
            </div>
        );
    }
}


