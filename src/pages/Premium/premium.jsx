import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCcMastercard,
  FaCcPaypal,
  FaCcVisa,
  FaCheck,
  FaCheckCircle,
  FaMinus,
  FaSpotify,
} from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../../context/UserDataProvider";
import axiosInstance from "../../config/axiosConfig"; // Import axios
import { formatCurrencyVND } from "../../helpers/formatCurrency";
import Forbidden from "../../components/Error/403/403";
import { checkData } from "../../helpers/encryptionHelper";
import Loading from "../../components/Loading/Loading";
import Cookies from "js-cookie";
import "./Premium.css";

const Premium = () => {
  const { t } = useTranslation();
  const planCardsRef = React.useRef(null);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]); // Lưu danh sách gói Premium
  const { isLoggedIn } = useUserData();
  const [validRole, setValidRole] = useState(false);
  const [IsCheckingRole, setIsCheckingRole] = useState(true);
  const isPremium = Cookies.get('is_premium') === 'true' ? true : false;

  useEffect(() => {
    const fetchRole = async () => {
      setIsCheckingRole(true);
      if (isLoggedIn) {
        //nếu đang login thì check role phải user  không
        const checkedRoleUser = await checkData(3);

        if (checkedRoleUser) {
          setValidRole(true);
          setIsCheckingRole(false);
        }
      }
      setIsCheckingRole(false);
    };

    fetchRole();
  }, [isLoggedIn]);

  // Fetch danh sách gói Premium từ backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("/plans/");
        setPlans(response.data); // Lưu danh sách gói
      } catch (error) {
        console.error("Lỗi khi lấy danh sách gói:", error);
      }
    };
    fetchPlans();
  }, []);

  const scrollToPlans = () => {
    try {
      if (planCardsRef.current) {
        const offset = -90;
        const elementPosition = planCardsRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Focus vào phần tử để hỗ trợ accessibility
        planCardsRef.current.focus({ preventScroll: true });
      }
    } catch (error) {
      console.error('Scroll error:', error);
      // Fallback cho trình duyệt không hỗ trợ smooth scroll
      planCardsRef.current?.scrollIntoView();
    }
  };

  const loginCheck = (planId) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/payment-method", { state: { planId } });
    }
  };

  if (isPremium) {
    navigate("/user");
  }

  if (IsCheckingRole) {
    return <Loading message={t("utils.loading")} height="100" />;
  }

  if (!isLoggedIn || !validRole) {
    return <Forbidden />;
  }

  return (
    <div className="p-premium-container com-horizontal-align">
      <div className="p-view-plan com-horizontal-align">
        <h1 style={{ width: "50%" }}>{t("premium.viewPlanTitle")}</h1>
        <span>{t("premium.viewPlanSubtitle")}</span>
        <nav className="com-vertical-align">
          <button className="com-glow-zoom" onClick={scrollToPlans}>
            <span>{t("premium.viewPlan_view")}</span>
          </button>
        </nav>
        <span className="com-vertical-align">
          <p>{t("premium.viewPlanNote")}</p>
        </span>
      </div>

      <div className="p-purchase com-horizontal-align">
        <h1>{t("premium.purchaseTitle")}</h1>
        <span style={{ width: "60%", marginBlock: "24px" }}>
          {t("premium.purchaseSubtitle")}
        </span>
        <div className="com-horizontal-align">
          <div className="com-vertical-align" style={{ gap: "16px" }}>
            <FaCcVisa size={24} />
            <FaCcMastercard size={24} />
          </div>
          <span className="p-view-hidden-cards">
            {t("premium.purchaseMethod")}
          </span>
          <div className="com-vertical-align p-hidden-cards">
            <FaCcVisa size={24} />
            <FaCcMastercard size={24} />
            <FaCcPaypal size={24} />
          </div>
        </div>
      </div>

      <div
        className="com-vertical-align"
        style={{ gap: "12px", marginBlock: "32px" }}
      >

      </div>
      <div className="com-vertical-align p-plan-cards" ref={planCardsRef}>
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => {
            let planColor = "#cff56a"; // Mặc định màu Mini
            if (plan.name === "Individual") planColor = "#ffd2d7";
            if (plan.name === "Student") planColor = "#c4b1d4";

            return (
              <div className="p-plan-card" key={plan.id}>
                <span className="p-price-tag" style={{ background: planColor }}>
                  {formatCurrencyVND(plan.price)} VND
                </span>
                <div className="p-content">
                  <div className="p-title com-hr-left-align">
                    <span className="com-vertical-align">
                      <FaSpotify size={24} />
                      Premium
                    </span>
                    <h1 style={{ color: planColor }}>{plan.name}</h1>
                    <h3>{plan.price} VND</h3>
                    <h4>
                      {plan.duration_days} {t("premium.days")}
                    </h4>
                  </div>

                  <div className="p-separator"></div>

                  <div className="com-hr-left-align p-details">
                    {plan.benefits?.map((benefit, index) => (
                      <span key={index}>
                        <GoDotFill /> <p>{benefit}</p>
                      </span>
                    ))}
                  </div>
                  <div className="com-hr-left-align p-details">
                    <span>
                      <GoDotFill /> <p>{t("premium.indiv_pros1")}</p>
                    </span>
                    <span>
                      <GoDotFill /> <p>{t("premium.indiv_pros2")}</p>
                    </span>
                    <span>
                      <GoDotFill /> <p>{t("premium.indiv_pros3")}</p>
                    </span>
                    <span style={{ width: 0, overflow: "hidden" }}>
                      <GoDotFill />
                      <p>placeholder</p>
                    </span>
                  </div>
                </div>
                <button
                  className="com-glow-only"
                  style={{
                    backgroundColor: planColor,
                    color: "black",
                    width: "100%",
                  }}
                  onClick={() => loginCheck(plan.id)}
                >
                  <span>{t("premium.subscribe")}</span>
                </button>
                <span className="p-note">
                  <a href="google.com">{t("premium.termsApply")}</a>
                </span>
              </div>
            );
          })
        ) : (
          <Loading
            message={t("utils.loading")}
            height="40"
          />
        )}
      </div>

      <div style={{ margin: "32px" }}>
        <h2>{t("premium.tableTitle")}</h2>
        <h4>{t("premium.tableDesc")}</h4>
      </div>

      <div className="com-horizontal-align p-feature-table">
        <span className="p-title">
          <p>{t("premium.tableColumn1")}</p>
          <p>{t("premium.tableColumn2")}</p>
          <p>
            <FaSpotify /> Premium
          </p>
        </span>
        <span>
          <p>{t("premium.tableRow_1")}</p>
          <FaMinus />
          <FaCheckCircle size={16} />
        </span>
        <span>
          <p>{t("premium.tableRow_2")}</p>
          <FaMinus />
          <FaCheckCircle size={16} />
        </span>
        <span>
          <p>{t("premium.tableRow_3")}</p>
          <FaMinus />
          <FaCheckCircle />
        </span>
        <span>
          <p>{t("premium.tableRow_4")}</p>
          <FaMinus />
          <FaCheckCircle />
        </span>
        <span>
          <p>{t("premium.tableRow_5")}</p>
          <FaMinus />
          <FaCheckCircle />
        </span>
        <span>
          <p>{t("premium.tableRow_6")}</p>
          <FaMinus />
          <FaCheckCircle />
        </span>
      </div>
    </div>
  );
};

export default Premium;
