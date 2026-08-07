import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Collapse } from "bootstrap";
import "../../css/Login.css";
import { showToast } from "../common/ToastAlert";
import { sendOtp } from "../../api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { login as reduxLogin, loginWithOtp as reduxLoginWithOtp } from "../../store/slices/authSlice";


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
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useDispatch();
  const { loginLoading } = useSelector((state) => state.auth);
  const [otpSending, setOtpSending] = useState(false);

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

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      showToast("Login Id and Password is required", "error");
      return;
    }

    try {
      const resultAction = await dispatch(reduxLogin({ login_id: loginId, password }));
      if (reduxLogin.fulfilled.match(resultAction)) {
        showToast(resultAction.payload.message, "success");
        navigate("/home");
      } else {
        showToast(resultAction.payload, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleSendOtp = async () => {
    if (!otpLoginId.trim()) {
      showToast("Please enter your login ID / mobile / email", "error");
      return;
    }

    setOtpSending(true);

    try {
      const response = await sendOtp(otpLoginId);
      if (response.success) {
        showToast(response.message, "success");
        setOtpSent(true);
        setResendTimer(30);
        setOtpDigits(["", "", "", "", "", ""]); // Clear digits on resend
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e, customOtp = null) => {
    if (e) e.preventDefault();
    const otp = customOtp || otpDigits.join("");

    if (otp.length < 6) {
      showToast("Please enter 6-digit OTP", "error");
      return;
    }

    try {
      const resultAction = await dispatch(reduxLoginWithOtp({ own_login_id: otpLoginId, otp }));
      if (reduxLoginWithOtp.fulfilled.match(resultAction)) {
        showToast(resultAction.payload.message, "success");
        navigate("/home");
      } else {
        showToast(resultAction.payload, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (value && index === 5) {
      // Auto submit on last digit
      handleVerifyOtp(null, newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        // Move back and clear previous
        otpRefs.current[index - 1]?.focus();
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
      }
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
                    {tab === "username" ? "Login Id" : tab === "otp" ? "Login with OTP" : "Fingerprint"}
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
                        placeholder="admin or admin+dev"
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
                      disabled={loginLoading}
                    >
                      {loginLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Logging In...
                        </>
                      ) : (
                        "Log In"
                      )}
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

                    {!otpSent && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 mb-3"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                      >
                        {otpSending ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}

                    {otpSent && (
                      <div className="otp-form">
                        <div className="mb-3 d-flex justify-content-between otp-input-group">
                          {otpDigits.map((digit, i) => (
                            <input
                              key={i}
                              type="text"
                              maxLength="1"
                              inputMode="numeric"
                              placeholder="X"
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              ref={(ref) => (otpRefs.current[i] = ref)}
                              className="form-control text-center otp-input m-2 mt-0 mb-0 shadow-sm"
                              style={{ width: "45px", height: "45px", fontSize: "1.2rem", fontWeight: "bold" }}
                            />
                          ))}
                        </div>
                        
                        <div className="d-flex justify-content-center mb-3">
                          {resendTimer > 0 ? (
                            <span className="text-muted small">Resend OTP in <strong>{resendTimer}s</strong></span>
                          ) : (
                            <button 
                              type="button" 
                              className="btn btn-link btn-sm text-secondary text-decoration-none fw-bold"
                              onClick={handleSendOtp}
                              disabled={otpSending}
                            >
                              {otpSending ? "Sending..." : "Resend OTP"}
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="btn btn-secondary w-100 fw-bold py-2 mb-3"
                          disabled={loginLoading}
                        >
                          {loginLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Verifying...
                            </>
                          ) : (
                            "Verify & Login"
                          )}
                        </button>

                        <div className="text-center">
                          <button 
                            type="button" 
                            className="btn btn-link btn-sm text-muted text-decoration-none"
                            onClick={() => setOtpSent(false)}
                          >
                            <i className="bi bi-arrow-left me-1"></i> Change Login ID / Mobile
                          </button>
                        </div>
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