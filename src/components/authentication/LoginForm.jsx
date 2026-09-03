import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Collapse } from "bootstrap";
import "../../css/Login.css";
import { showToast } from "../common/ToastAlert";
import { sendOtp } from "../../api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { login as reduxLogin, loginWithOtp as reduxLoginWithOtp } from "../../store/slices/authSlice";
import { otpExpirySeconds } from "../../config/appConfig";
import AppBrandLogo from "../common/AppBrandLogo";


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

// Balls stay in outer viewport edges — not over the centered login card
// 14 on all screens + 12 desktop-only (≥992px) = 26 total on desktop
const LOGIN_BALLS_MOBILE = [
  { size: 10, top: "4%", left: "3%", delay: 0, duration: 14, tone: 1 },
  { size: 8, top: "6%", left: "92%", delay: 1.1, duration: 12, tone: 2 },
  { size: 10, top: "94%", left: "4%", delay: 2.2, duration: 16, tone: 3 },
  { size: 9, top: "96%", left: "90%", delay: 0.7, duration: 13, tone: 1 },
  { size: 8, top: "38%", left: "2%", delay: 1.8, duration: 11, tone: 2 },
  { size: 8, top: "54%", left: "94%", delay: 2.5, duration: 15, tone: 3 },
  { size: 9, top: "16%", left: "5%", delay: 0.4, duration: 12, tone: 1 },
  { size: 9, top: "84%", left: "93%", delay: 1.5, duration: 14, tone: 2 },
  { size: 7, top: "24%", left: "96%", delay: 2.0, duration: 13, tone: 3 },
  { size: 7, top: "72%", left: "2%", delay: 0.9, duration: 12, tone: 1 },
  { size: 8, top: "12%", left: "88%", delay: 1.3, duration: 14, tone: 2 },
  { size: 8, top: "78%", left: "8%", delay: 2.6, duration: 15, tone: 3 },
  { size: 7, top: "48%", left: "1%", delay: 1.0, duration: 11, tone: 1 },
  { size: 7, top: "62%", left: "97%", delay: 2.8, duration: 13, tone: 2 },
];

const LOGIN_BALLS_DESKTOP = [
  { size: 24, top: "10%", left: "4%", delay: 0, duration: 18, tone: 1 },
  { size: 20, top: "30%", left: "6%", delay: 1.2, duration: 16, tone: 2 },
  { size: 26, top: "48%", left: "3%", delay: 2.4, duration: 20, tone: 3 },
  { size: 22, top: "66%", left: "5%", delay: 0.6, duration: 17, tone: 1 },
  { size: 18, top: "84%", left: "4%", delay: 1.8, duration: 15, tone: 2 },
  { size: 22, top: "8%", left: "94%", delay: 1.4, duration: 16, tone: 3 },
  { size: 26, top: "26%", left: "92%", delay: 2.1, duration: 19, tone: 1 },
  { size: 20, top: "44%", left: "96%", delay: 0.3, duration: 15, tone: 2 },
  { size: 24, top: "62%", left: "93%", delay: 1.7, duration: 18, tone: 3 },
  { size: 19, top: "80%", left: "95%", delay: 2.8, duration: 16, tone: 1 },
  { size: 18, top: "4%", left: "26%", delay: 2.3, duration: 15, tone: 2 },
  { size: 17, top: "96%", left: "72%", delay: 1.3, duration: 16, tone: 3 },
];

const LOGIN_FEATURE_ITEMS = [
  {
    title: "Best Account Management",
    description:
      "Keep cash, bank, and customer accounts in one place. No separate notebooks — see every balance clearly, anytime you need it.",
  },
  {
    title: "Ready Report One Click",
    description:
      "Get Daybook, Trial Balance, Balance Sheet, and loan reports in one click. Print or share instantly and save hours of manual work.",
  },
  {
    title: "Efficient Data Management",
    description:
      "Manage girvi loans, EMI finance, customer details, and daily entries easily. All your office records stay organised in one software.",
  },
  {
    title: "Secure Transactions",
    description:
      "Only authorised users can log in and work on your data. Every entry is saved safely so your accounts stay correct and trustworthy.",
  },
];

const LOGIN_FLOATING_BALLS = [
  ...LOGIN_BALLS_MOBILE.map((ball) => ({ ...ball, desktopOnly: false })),
  ...LOGIN_BALLS_DESKTOP.map((ball) => ({ ...ball, desktopOnly: true })),
];

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
        setResendTimer(otpExpirySeconds);
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
      <div className="login-animated-bg" aria-hidden="true">
        <span className="login-animated-bg__orb login-animated-bg__orb--1" />
        <span className="login-animated-bg__orb login-animated-bg__orb--2" />
        <span className="login-animated-bg__orb login-animated-bg__orb--3" />
        <span className="login-animated-bg__orb login-animated-bg__orb--4 login-animated-bg__orb--desktop-only" />
        {LOGIN_FLOATING_BALLS.map((ball, index) => (
          <span
            key={`login-ball-${index}`}
            className={`login-animated-bg__ball login-animated-bg__ball--tone-${ball.tone}${
              ball.desktopOnly ? " login-animated-bg__ball--desktop-only" : ""
            }`}
            style={{
              width: `${ball.size}px`,
              height: `${ball.size}px`,
              top: ball.top,
              left: ball.left,
              "--ball-size": `${ball.size}px`,
              "--ball-dur": `${ball.duration}s`,
              "--ball-delay": `${ball.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="row w-100 rounded-4 overflow-hidden login-div">
        <div className="col-lg-6 d-none d-lg-flex flex-column left-panel">
          <div className="mb-2 logo-text fw-bold fs-2 d-flex align-items-center gap-2">
            <AppBrandLogo size={40} />
            <span>KhataBoss</span>
          </div>
          <h1>Welcome To Your</h1>
          <h1>
            <strong>
              <TypingEffect texts={["Dream Software", "Loan Software", "Finance Software"]} />
            </strong>
          </h1>
          <div className="overflow-scroll-wrapper flex-grow-1 pe-2">
            {LOGIN_FEATURE_ITEMS.map((item, idx) => {
              const id = `collapseExample${idx}`;
              return (
                <div className="info mb-1" key={idx}>
                  <button className="btn btn-secondary btn-collapse-custom" type="button" onClick={() => toggleCollapse(id)}>
                    <span className="dot"></span> {item.title}{" "}
                    <i className={`bi collapse-icon ${collapseStates[id] ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </button>
                  <div className="collapse" id={id}>
                    <div className="card card-body login-collapse-card">{item.description}</div>
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

        <div className="col-lg-6 d-flex align-items-center login-panel-right p-5 pt-4">
          <div className="w-100">
            <h2 className="text-center mb-2 login-title">
              <div className="mx-auto d-flex align-items-center justify-content-center login-icon-wrap">
                <AppBrandLogo size={48} />
              </div>
            </h2>

            <h2 className="text-center mb-3 login-heading fw-bold">Sign in to KhataBoss</h2>

            <ul className="nav nav-pills justify-content-center mb-3">
              {["username", "otp", "finger"].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    className={`nav-link fw-bold ${activeTab === tab ? "active" : ""}`}
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
                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 password-toggle-btn"
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
                              className="btn btn-link btn-sm login-muted text-decoration-none fw-bold"
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
                            className="btn btn-link btn-sm login-muted text-decoration-none"
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
                    <i className="bi bi-fingerprint login-muted" style={{ fontSize: "4rem" }}></i>
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
                <Link to="#" className="login-social-link fs-4"><i className="bi bi-facebook"></i></Link>
                <Link to="#" className="login-social-link fs-4"><i className="bi bi-google"></i></Link>
                <Link to="#" className="login-social-link fs-4"><i className="bi bi-twitter"></i></Link>
                <Link to="#" className="login-social-link fs-4"><i className="bi bi-linkedin"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;