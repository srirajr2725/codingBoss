import React from "react";
import "./LogoSection.css";

// Import company logos
import Infosys from "./images/infosys-logo-jpeg.png";
import Capgemini from "./images/Capgemini-Logo.png";
import TCS from "./images/tcs_logo_1200_020621101143.png";
import Google from "./images/google2.0.0.1441125613.png";
import HP from "./images/1200px-HP_logo_2012.svg.png";
import IBM from "./images/416_ibm.png";
import Microsoft from "./images/Microsoft logo.png";
import Amazon from "./images/amazon logo.png";
import Vitnezt from "./images/vitnezt.png";
import S2S from "./images/s2s.png";
import Olir from "./images/olir.png";
import GTS from "./images/gts.jpg";
import Nurture from "./images/nurture.svg";
import Sagent from "./images/sagent.png";
import MrCooper from "./images/mrcooper.png";
import EPAM from "./images/epam.png";
import EduDarts from "./images/edu.png";

const companies = [
  { logo: Infosys, name: "Infosys", category: "CS/IT" },
  { logo: Capgemini, name: "Capgemini", category: "Service to Product" },
  { logo: TCS, name: "TCS", category: "Non-CS/IT" },
  { logo: Google, name: "Google", category: "Non-CS/IT" },
  { logo: HP, name: "HP", category: "Tier 2/3 college" },
  { logo: IBM, name: "IBM", category: "CS/IT" },
  { logo: Microsoft, name: "Microsoft", category: "CS/IT" },
  { logo: Amazon, name: "Amazon", category: "Service to Product" },
  { logo: EduDarts, name: "EduDarts", category: "Education Partner" },
  { logo: Vitnezt, name: "Vitnezt", category: "Non-CS/IT" },
  { logo: S2S, name: "S2S", category: "Non-CS/IT" },
  { logo: Olir, name: "Olir", category: "Tier 2/3 college" },
  { logo: GTS, name: "GTS", category: "CS/IT" },
  { logo: Nurture, name: "Nurture", category: "CS/IT" },
  { logo: Sagent, name: "Sagent", category: "Service to Product" },
  { logo: MrCooper, name: "MrCooper", category: "Non-CS/IT" },
  { logo: EPAM, name: "EPAM", category: "Non-CS/IT" },
];

const LogoSection = () => {
  return (
    <div className="logo-section">
      <h2>Our Ninjas at Top Tech Companies</h2>
      <div className="logos-wrapper">
        <div className="logos">
          {/* Duplicate for infinite scroll effect */}
          {[...companies, ...companies].map((company, index) => (
            <div className="logo-card" key={index}>
              <div className="company-logo">
                <img src={company.logo} alt={company.name} />
              </div>
              <p className="company-category">{company.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSection;
