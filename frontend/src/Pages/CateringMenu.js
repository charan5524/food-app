import React from "react";
import "./CateringMenu.css";

const cateringPackages = [
  {
    people: 15,
    options: [
      {
        title: "Chicken Biryani",
        price: 150,
        details: [
          "1 shallow tray of chicken biryani rice",
          " chicken fry pieces ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton biryani ",
        price: 150,
        details: [
          "1 shallow tray of Mutton Biryani rice ",
          "Side of Goat Curry ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Panner  Biryani",
        price: 160,
        details: [
          "1 shallow tray of Panner Biryani",
          "½ shallow tray of  Panner Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
  {
    people: 25,
    options: [
      {
        title: "Chicken Biryani",
        price: 280,
        details: [
          "1 shallow tray of chicken biryani rice",
          " chicken fry pieces ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton biryani ",
        price: 280,
        details: [
          "1 shallow tray of Mutton Biryani rice ",
          "Side of Goat Curry ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Panner  Biryani",
        price: 280,
        details: [
          "1 shallow tray of Panner Biryani",
          "½ shallow tray of  Panner Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
  {
    people: 50,
    options: [
      {
        title: "Chicken Biryani",
        price: 400,
        details: [
          "1 shallow tray of chicken biryani rice",
          " chicken fry pieces ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton biryani ",
        price: 400,
        details: [
          "1 shallow tray of Mutton Biryani rice ",
          "Side of Goat Curry ",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Panner  Biryani",
        price: 400,
        details: [
          "1 shallow tray of Panner Biryani",
          "½ shallow tray of  Panner Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
];

function CateringMenu() {
  return (
    <div className="catering-menu-container">
      <h1>Catering Packages</h1>
      {cateringPackages.map((packageItem, index) => (
        <div key={index} className="package-section">
          <h2>{packageItem.people} People</h2>
          {packageItem.options.map((option, idx) => (
            <div key={idx} className="menu-option">
              <h3>{option.title}</h3>
              <p className="price">${option.price}</p>
              <ul>
                {option.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default CateringMenu;
