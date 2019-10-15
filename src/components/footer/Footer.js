import React, { Component } from "react";
import {
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import { reactLocalStorage } from 'reactjs-localstorage';
const FooterNav = [
  {
    name: "About Us",
    link: "about-us"
  },
  {
    name: "Contact Us",
    link: "contact-us"
  },
  {
    name: "Terms and conditions",
    link: "terms-conditions"
  },
  {
    name: "Privacy and Policy",
    link: "privacy-policy"
  },
];
class Footer extends Component {
  render() {
    const userResponse = reactLocalStorage.getObject("userResponse");
    return (
      <div>
        {basicProfileAndProd == false &&
          <footer>
            <div className="container">
              <div className="row">
                <div className="col-md-12 text-center d-flex h-spacebw ">
                  <Nav className="justify-content">
                    {FooterNav.map((item, index) => (
                      <NavItem key={index}>
                        <NavLink href={item.link}>{item.name}</NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                  <p className="copyright-text"> &#169; {(new Date().getFullYear())} Cost IT Rights </p>
                </div>
               
              </div>
            </div>
          </footer>
        }
      </div>
    );
  }
}
export default Footer;
