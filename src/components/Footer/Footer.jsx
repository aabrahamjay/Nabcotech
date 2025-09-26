import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className='footer-content-left'>
            <img src={assets.logo} alt="" />
            <p>Thanks for your Continous Support And Patronage.</p>
            <div className="footer-social-icons">
               <a href=""> <img src={assets.facebook_icon} alt="" /></a>
              <a href="">  <img src={assets.twitter_icon} alt="" /></a>
               <a href=""> <img src={assets.linkedin_icon} alt="" /></a>
            </div>
        </div>
        <div className='footer-content-center'>
            <h2>Company</h2>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Delivery</li>
              <li>Privacy Policy</li>
            </ul>
        </div>
        <div className='footer-content-right'>
            <h2>GET IN TOUCH</h2>
            <ul>
              <li>+234-906-754-9896</li>
              <li>contact@nabcotech.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="foooter-copyright">Copyright 2025 &copy; Nabcotech.com - All Right Reserved</p>
    </div>
  )
}

export default Footer
