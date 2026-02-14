import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "bootstrap";
import "../../css/Login.css";
import { showToast } from "../common/ToastAlert";
// Removed real redux imports since we're mocking
// import { useDispatch, useSelector } from "react-redux";
// import { loginOwner, sendOwnerOtp, loginOwnerWithOtp } from "../../redux/slices/auth.slice";

const TypingEffect = ({ texts = [], speed = 100, pause = 1500 }) => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index === texts.length) return;

    if (subIndex === texts[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), pause);
      return;
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => deleting ? prev - 1 : prev + 1);
      setText(texts[index].substring(0, subIndex));
    }, deleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, texts, speed, pause]);

  return (
    <span className="typing">
      {text}
      <span className="cursor">|</span>
    </span>
  );
};

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState("username");
  const [collapseStates, setCollapseStates] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [otpLoginId, setOtpLoginId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [loading, setLoading] = useState(false); // Mock loading state

  const otpRefs = useRef([]);
  const loginIdRef = useRef(null);
  const passwordRef = useRef(null);
  const otpLoginIdRef = useRef(null);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (activeTab === "username" && loginIdRef.current) {
      loginIdRef.current.focus();
    } else if (activeTab === "otp" && otpLoginIdRef.current) {
      otpLoginIdRef.current.focus();
    }
  }, [activeTab]);

  const toggleCollapse = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const collapseInstance = Collapse.getOrCreateInstance(element);
      collapseInstance.toggle();
      setCollapseStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      showToast("Login Id and Password is required", "error");
      return;
    }

    setLoading(true);

    // Small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock check
    if (password === "12345") {
      showToast("Welcome back! Login successful.", "success");
      // You can add redirect here later
      // window.location.href = "/dashboard";
      console.log("Login success with ID:", loginId);
    } else {
      showToast("Invalid Login Id or Password", "error");
    }

    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!otpLoginId.trim()) {
      showToast("Please enter your login ID / mobile / email", "error");
      return;
    }

    setOtpSending(true);

    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1000));

    showToast("OTP sent successfully! (Mock - use 1234)", "success");
    setOtpSent(true);
    setResendTimer(30);
    otpRefs.current[0]?.focus();

    setOtpSending(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length < 4) {
      showToast("Please enter 4-digit OTP", "error");
      return;
    }

    setOtpVerifying(true);

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock check
    if (otp === "1234") {
      showToast("Login successful with OTP!", "success");
      // You can add redirect here
      // window.location.href = "/dashboard";
      console.log("OTP login success with ID:", otpLoginId);
    } else {
      showToast("Invalid or expired OTP", "error");
    }

    setOtpVerifying(false);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  return (
    <div className="login-container container-fluid auth-wrapper d-flex align-items-center justify-content-center">
      <div className="row w-100 bg-light rounded-4 overflow-hidden login-div">
        <div className="col-lg-6 d-none d-lg-flex flex-column left-panel">
          <div className="mb-2 logo-text fw-bold fs-2">
            <i className="bi bi-journal-text me-2 fs-2"></i>KhataBoss
          </div>
          <h1>Welcome To Your</h1>
          <h1>
            <strong>
              <TypingEffect texts={["Dream Software", "Loan Software", "Finance Software"]} />
            </strong>
          </h1>
          <div className="overflow-scroll-wrapper flex-grow-1 pe-2">
            {[
              "Best Account Management",
              "Ready Report One Click",
              "Efficient Data Management",
              "Secure Transactions",
            ].map((text, idx) => {
              const id = `collapseExample${idx}`;
              return (
                <div className="info mb-1" key={idx}>
                  <button className="btn btn-secondary btn-collapse-custom" type="button" onClick={() => toggleCollapse(id)}>
                    <span className="dot"></span> {text}{" "}
                    <i className={`bi collapse-icon ${collapseStates[id] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </button>
                  <div className="collapse" id={id}>
                    <div className="card card-body text-dark">Placeholder content for {text}.</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-white small border-top">
            <p className="mb-1">
              <i className="bi bi-telephone-fill me-2"></i>Call us: <strong>+91 9579082528</strong>,{" "}
              <strong>+91 8010445844</strong>
            </p>
            <p className="mb-0 text-center">—— <span className="fst-italic">Terms and Conditions apply</span> ——</p>
          </div>
        </div>

        <div className="col-lg-6 d-flex align-items-center bg-white p-5 pt-4">
          <div className="w-100">
            <h2 className="text-center mb-2 text-dark">
              <div className="mx-auto d-flex align-items-center justify-content-center border border-secondary rounded-circle"
                style={{ width: "60px", height: "60px" }}>
                <i className="bi bi-journal-text fs-4"></i>
              </div>
            </h2>

            <h2 className="text-center mb-3 text-dark fw-bold">Sign in to KhataBoss</h2>

            <ul className="nav nav-pills justify-content-center mb-3">
              {["username", "otp", "finger"].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button 
                    className={`nav-link fw-bold text-secondary ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "username" ? "Login Id" : tab === "otp" ? "Mobile OTP" : "Fingerprint"}
                  </button>
                </li>
              ))}
            </ul>

            <div className="tab-content">
              {activeTab === "username" && (
                <div className="tab-pane fade show active">
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <input
                        type="text"
                        ref={loginIdRef}
                        className="form-control input-box"
                        placeholder="Login Id | Mobile No"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            passwordRef.current?.focus();
                          }
                        }}
                      />
                    </div>
                    <div className="mb-3 position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        ref={passwordRef}
                        className="form-control input-box pe-5"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-secondary w-100 fw-bold" 
                      disabled={loading}
                    >
                      {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
                      {loading ? "Logging In..." : "Log In"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "otp" && (
                <div className="tab-pane fade show active">
                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control input-box"
                        placeholder="Login Id | Email | Mobile No."
                        value={otpLoginId}
                        onChange={(e) => setOtpLoginId(e.target.value)}
                        ref={otpLoginIdRef}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (!otpSent) handleSendOtp();
                          }
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100 mb-3"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || otpSending}
                    >
                      {otpSending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : resendTimer > 0 ? (
                        `Resend in ${resendTimer}s`
                      ) : otpSent ? (
                        "Resend OTP"
                      ) : (
                        "Send OTP"
                      )}
                    </button>

                    {otpSent && (
                      <div className="otp-form">
                        <div className="mb-3 d-flex justify-content-between otp-input-group">
                          {otpDigits.map((digit, i) => (
                            <input
                              key={i}
                              type="text"
                              maxLength="1"
                              placeholder="X"
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              ref={(ref) => (otpRefs.current[i] = ref)}
                              className="form-control text-center otp-input m-2 mt-0 mb-0"
                            />
                          ))}
                        </div>
                        <button 
                          type="submit" 
                          className="btn btn-secondary w-100 fw-bold" 
                          disabled={otpVerifying}
                        >
                          {otpVerifying ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Verifying...
                            </>
                          ) : (
                            "Verify & Login"
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === "finger" && (
                <div className="tab-pane fade text-center show active">
                  <form>
                    <p className="mb-4">Place your finger on the sensor to log in</p>
                    <i className="bi bi-fingerprint text-secondary" style={{ fontSize: "4rem" }}></i>
                    <div className="mt-3">
                      <button 
                        type="button" 
                        className="btn btn-secondary w-100 fw-bold"
                        onClick={() => showToast("Fingerprint login not implemented yet", "info")}
                      >
                        Authenticate
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="text-center mt-3">
              <div className="d-flex justify-content-center gap-3">
                <Link to="#" className="text-dark fs-4"><i className="bi bi-facebook"></i></Link>
                <Link to="#" className="text-dark fs-4"><i className="bi bi-google"></i></Link>
                <Link to="#" className="text-dark fs-4"><i className="bi bi-twitter"></i></Link>
                <Link to="#" className="text-dark fs-4"><i className="bi bi-linkedin"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;