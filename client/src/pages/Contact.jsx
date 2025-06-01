import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  return (
    <main className="kh-contact">
      <div className="container pb-5">
        <div className="row">
          <div className="col-md-8 mx-auto text-center mb-5">
            <h1 className="display-4 mb-4">Contact Us</h1>
            <p className="lead">
              Welcome to the Khanchuwa contact page. We'd love to hear from you!
              Whether you have a question about our recipes, feedback on your
              cooking experience, or want to collaborate with us, we're here to
              help.
            </p>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-md-4 mb-4 mb-md-0">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <FaEnvelope size={40} className="text-primary" />
                </div>
                <h3 className="card-title">Email Us</h3>
                <p className="card-text mb-3">
                  For general inquiries, feedback, or support, please contact:
                </p>
                <a
                  href="mailto:admin@khanchuwa.com"
                  className="btn btn-outline-primary"
                >
                  admin@khanchuwa.com
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4 mb-md-0">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <FaPhone size={40} className="text-primary" />
                </div>
                <h3 className="card-title">Call Us</h3>
                <p className="card-text mb-3">
                  Need to speak with someone directly? Our customer service is
                  available:
                </p>
                <p>Mon-Fri: 9AM - 5PM</p>
                <p className="font-weight-bold">+977 9800000000</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3">
                  <FaMapMarkerAlt size={40} className="text-primary" />
                </div>
                <h3 className="card-title">Visit Us</h3>
                <p className="card-text mb-3">Our office is located at:</p>
                <address className="mb-0">
                  <strong>Khanchuwa Headquarters</strong>
                  <br />
                  Kathmandu, Nepal
                  <br />
                </address>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="text-center mb-4">Send Us a Message</h2>
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      placeholder="What is this about?"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      rows="5"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Submit Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12 text-center">
            <p>
              You can also connect with us on our social media platforms or
              check our <Link to="/faq">FAQ page</Link> for commonly asked
              questions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
