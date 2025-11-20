import "./Franchise.css";
import React, { useState, useRef } from "react";
import {
  FaStore,
  FaHandshake,
  FaChartLine,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaPhoneAlt,
  FaEnvelope,
  FaDownload,
  FaChartPie,
  FaRegLightbulb,
} from "react-icons/fa";
import { contactService } from "../services/api";

const stats = [
  { label: "Years of culinary excellence", value: "12+", accent: "+12" },
  { label: "Average ROI timeline", value: "18 months", accent: "18" },
  { label: "Existing outlets", value: "24 cities", accent: "24" },
  { label: "Customer satisfaction", value: "4.8 / 5", accent: "4.8" },
];

const benefits = [
  {
    title: "Trusted Culinary Brand",
    description:
      "Authentic Telangana & Andhra recipes, proven demand, loyal customer base.",
    icon: <FaStore />,
  },
  {
    title: "Comprehensive Support",
    description:
      "Site selection, chef training, supply chain, marketing playbooks, and launch plan.",
    icon: <FaHandshake />,
  },
  {
    title: "Profitable Business Model",
    description:
      "Optimized menu engineering, tech-enabled operations, and strong repeat orders.",
    icon: <FaChartLine />,
  },
  {
    title: "Exclusive Territory",
    description:
      "Protected franchise zones so you own the demand in your region.",
    icon: <FaMapMarkerAlt />,
  },
];

const processSteps = [
  "Submit your franchise application",
  "Discovery call with our growth team",
  "Site evaluation & business planning",
  "Chef training & operations setup",
  "Grand opening with launch marketing",
];

const investmentHighlights = [
  {
    title: "Kitchen & interiors",
    cost: "45%",
    detail: "Modular kitchen equipment, designer dining areas, signage.",
  },
  {
    title: "Technology & licenses",
    cost: "15%",
    detail: "POS, delivery integrations, brand tech stack, compliance.",
  },
  {
    title: "Staffing & training",
    cost: "20%",
    detail: "Chef onboarding, service SOPs, launch bootcamp.",
  },
  {
    title: "Marketing & launch capital",
    cost: "20%",
    detail: "Grand opening, influencer seeding, neighborhood campaigns.",
  },
];

const testimonials = [
  {
    name: "Meghana Rao",
    city: "Austin, TX",
    quote:
      "We broke even in nine months thanks to their supply chain, digital marketing, and chef mentorship. The brand recall is unreal.",
  },
  {
    name: "Sanjay Patel",
    city: "Seattle, WA",
    quote:
      "Their playbook covers every detail—from location scouting to staff rituals. Guests keep coming back for the authentic flavors.",
  },
  {
    name: "Lara Fernandes",
    city: "Chicago, IL",
    quote:
      "Weekly check-ins, centralized purchasing, and tech dashboards make scaling to multiple outlets possible.",
  },
];

const faqs = [
  {
    question: "What type of locations do you prefer?",
    answer:
      "High footfall areas (2,000–3,000 sq ft), easy access, and strong delivery radius. We assist with site evaluations.",
  },
  {
    question: "Do I need F&B experience?",
    answer:
      "Prior experience helps, but we offer end-to-end training for owners and staff. Passion + commitment is key.",
  },
  {
    question: "What is the typical investment?",
    answer:
      "Most partners start between $120k–$220k inclusive of interiors, kitchen, licensing, and launch marketing.",
  },
  {
    question: "How long until I can launch?",
    answer:
      "From agreement to launch, expect 90–120 days depending on site readiness.",
  },
];

function Franchise() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    city: "",
    investmentBudget: "",
    experience: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const formRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("Submitting your application...");

    try {
      const response = await contactService.submitFranchise(formData);
      if (response.success) {
        setStatusMessage("✅ Application submitted! Our team will reach out soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          city: "",
          investmentBudget: "",
          experience: "",
          message: "",
        });
      } else {
        setStatusMessage("We couldn't submit your application. Please try again.");
      }
    } catch (error) {
      console.error("Franchise form error:", error);
      setStatusMessage("Something went wrong. Please try again or email us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="franchise-page">
      <section className="franchise-hero">
        <div className="hero-content">
          <p className="eyebrow">Partner With A High-Growth Food Brand</p>
          <h1>
            Bring Authentic Telangana & Andhra Flavors to Your City
          </h1>
          <p className="hero-description">
            Join a proven franchise model with strong brand recall, chef-driven menus,
            and tech-enabled operations. We empower you from site selection to
            grand opening and beyond.
          </p>
          <div className="hero-cta">
            <button className="primary-btn" onClick={scrollToForm}>
              Start Franchise Application
            </button>
            <button
              className="secondary-btn"
              onClick={() => window.open("tel:+11234567890")}
            >
              Talk to Growth Team
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="franchise-benefits">
        <h2>Why franchise with us?</h2>
        <p className="section-subtitle">
          We combine culinary heritage with modern operations to help partners scale profitably.
        </p>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="franchise-process">
        <div className="process-header">
          <h2>The journey to launch</h2>
          <p>
            Clear milestones keep you confident at every step. Our launch team stays with you until you serve your first 1,000 meals.
          </p>
        </div>
        <div className="process-timeline">
          {processSteps.map((step, index) => (
            <div key={step} className="process-step">
              <div className="step-marker">{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="franchise-investment">
        <div className="investment-header">
          <div>
            <p className="eyebrow">Investment clarity</p>
            <h2>Transparent costs, predictable returns</h2>
            <p>
              A typical franchise setup ranges from $120k–$220k depending on size and city. We help you optimize every dollar with preferred vendors and pre-negotiated contracts.
            </p>
          </div>
          <div className="roi-card">
            <FaChartPie />
            <div>
              <p className="roi-title">Avg. payback</p>
              <p className="roi-value">18–22 months</p>
            </div>
          </div>
        </div>
        <div className="investment-grid">
          {investmentHighlights.map((item) => (
            <div key={item.title} className="investment-card">
              <p className="investment-cost">{item.cost}</p>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="resource-banner">
          <div>
            <h3>Download the franchise starter kit</h3>
            <p>
              Get detailed financial models, sample layouts, and a full support checklist delivered to your inbox.
            </p>
          </div>
          <button
            className="secondary-btn outlined"
            onClick={() =>
              window.open("mailto:franchise@foodapp.com?subject=Franchise%20Starter%20Kit")
            }
          >
            <FaDownload /> Email me the kit
          </button>
        </div>
      </section>

      <section className="franchise-form-section" ref={formRef}>
        <div className="form-intro">
          <h2>Let’s build something delicious together</h2>
          <p>
            Share a few details and we’ll schedule a discovery call within 48 hours.
            Fields marked with * are required.
          </p>
        </div>
        <div className="franchise-form-wrapper">
          <form onSubmit={handleSubmit} className="franchise-form">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Full Name*</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="E.g. Aishwarya Rao"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email*</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Phone*</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="city">City*</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Hyderabad, Austin, etc."
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

                <div className="form-row">
              <div className="form-field">
                <label htmlFor="location">Preferred Location*</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  placeholder="Neighborhood, Street, or Mall"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="investmentBudget">Investment Budget*</label>
                <select
                  id="investmentBudget"
                  name="investmentBudget"
                  value={formData.investmentBudget}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a range</option>
                  <option value="Less than $75k">Less than $75k</option>
                  <option value="$75k - $125k">$75k - $125k</option>
                  <option value="$125k - $200k">$125k - $200k</option>
                  <option value="More than $200k">More than $200k</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="experience">Business Experience</label>
                <input
                  id="experience"
                  type="text"
                  name="experience"
                  placeholder="F&B, retail, entrepreneurship, etc."
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="message">Tell us more*</label>
              <textarea
                id="message"
                name="message"
                placeholder="What excites you about this franchise opportunity?"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending Application..." : "Submit Application"}
            </button>

            {statusMessage && (
              <p className={`status-alert ${statusMessage.startsWith("✅") ? "success" : "error"}`}>
                {statusMessage}
              </p>
            )}
          </form>

          <div className="franchise-support-card">
            <h3>What you get</h3>
            <ul>
              <li>
                <FaClipboardCheck /> Pre-opening blueprint & SOPs
              </li>
              <li>
                <FaClipboardCheck /> Chef training & recruitment support
              </li>
              <li>
                <FaClipboardCheck /> Centralized supply chain integration
              </li>
              <li>
                <FaClipboardCheck /> Hyperlocal launch marketing
              </li>
              <li>
                <FaClipboardCheck /> Dedicated success manager post-launch
              </li>
            </ul>
            <div className="contact-card">
              <p>Prefer talking to someone?</p>
              <a href="tel:+11234567890">
                <FaPhoneAlt /> +1 123 456 7890
              </a>
              <a href="mailto:franchise@foodapp.com">
                <FaEnvelope /> franchise@foodapp.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="franchise-testimonials">
        <div className="testimonial-header">
          <h2>Partner success stories</h2>
          <p>Franchise owners who launched with us and continue to expand.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="testimonial-card">
              <FaRegLightbulb className="testimonial-icon" />
              <p className="quote">“{testimonial.quote}”</p>
              <p className="author">
                {testimonial.name} • {testimonial.city}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="franchise-faq">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className={`faq-item ${openFaqIndex === index ? "open" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <p>{faq.question}</p>
                <span>{openFaqIndex === index ? "-" : "+"}</span>
              </div>
              {openFaqIndex === index && <p className="faq-answer">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Franchise;
