import React, { useEffect, useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import StylePage from "./StylePage.jsx";
import { supabase } from "./supabaseClient";
import wallRows from "./data/wall.js";
import baseRows from "./data/base.js";
import vanityRows from "./data/vanity.js";
import tallRows from "./data/tall.js";
import modificationRows from "./data/modification.js";
import accessoryRows from "./data/accessory.js";

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );



// const wallRows = [];
// const baseRows = [];
// const vanityRows = [];
// const tallRows = [];
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ArrowRight,
  Building2,
  Send,
  UserRound,
  Palette,
  Calculator,
} from "lucide-react";

const melamineImages = import.meta.glob("./assets/styles/melamine/*.{jpg,png,jpeg}", { eager: true });
const petgImages = import.meta.glob("./assets/styles/petg/*.{jpg,png,jpeg}", { eager: true });
const lacquerImages = import.meta.glob("./assets/styles/lacquer/*.{jpg,png,jpeg}", { eager: true });
const veneerImages = import.meta.glob("./assets/styles/veneer/*.{jpg,png,jpeg}", { eager: true });

// const inquiryId = `EST-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const modificationColumnMap = {
  Melamine: "A",
  PETG: "B",
  Veneer: "C",
};

function getModificationPrice(model, materialFamily) {
  if (!model) return 0;

  const column = modificationColumnMap[materialFamily];
  if (!column) return 0;

  const row = modificationRows.find(
    (r) => r.Model?.toUpperCase() === model?.toUpperCase()
  );

  return Number(row?.[column]) || 0;
}

const finishedInteriorPriceMap = {
  base: 1000,
  vanity: 900,
  wall: 700,
  tall: 1800,
};

const styleSeriesMap = {
  melamine: ["Northern Europe", "Light Luxury", "Minimalism"],
  petg: ["Light Scheme", "Harmonious"],
  lacquer: ["Light French", "Retro French", "Creamy Minimalist"],
  veneer: ["Modern Log"],
};


const shakerAvailableMap = {
  melamine: ["Smoked Oak", "Dark Walnut", "Natural Walnut"],
  petg: [],
  lacquer: [],
  veneer: [],
};

const salesEmailMap = {
  info: "accounting@unitedbw.com",
  alex: "alexw@unitedbw.com",
  sarra: "sarra@unitedbw.com",
  // mike: "mike@unitedbw.com",
};

function AdminPage() {
  const [authorized, setAuthorized] = useState(
    localStorage.getItem("adminAuthorized") === "true"
  );
  const [password, setPassword] = useState("");
  const [data, setData] = useState([]);

  async function loadData() {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setData(data);
    }
  }

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  if (!authorized) {
    return (
      <div style={{ padding: 40 }}>
        <h3>Admin Login</h3>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => {
            if (password === "159753") {
              localStorage.setItem("adminAuthorized", "true");
              setAuthorized(true);
            } else {
              alert("Wrong password");
            }
          }}
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inquiry Records</h2>
      <button
        onClick={() => {
          localStorage.removeItem("adminAuthorized");
          setAuthorized(false);
        }}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
      {data.map((item) => (
        <div
          key={item.id}
          style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}
        >
          <div><b>{item.estimate_id}</b></div>
          <div>{item.customer_name} / {item.customer_email}</div>
          <div>{item.project_type}</div>
          <pre>{item.cabinet_groups}</pre>
        </div>
      ))}
    </div>
  );
}

function parseImageMeta(path) {
  const file = path.split("/").pop().split(".")[0];
  const [namePart, codePart] = file.split("_");

  const name = (namePart || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const code = codePart ? codePart.toUpperCase() : "";

  return { name, code };
}

function extractFinishOptions(imageObj) {
  return Object.keys(imageObj)
    .map((path) => parseImageMeta(path))
    .sort((a, b) => {
      const getNum = (code) => {
        const match = code.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      return getNum(a.code) - getNum(b.code);
    })
    .map((item) => item.name)
    .filter(Boolean);
}

const styleNames = {
  melamine: "Melamine",
  petg: "PETG",
  lacquer: "Lacquer",
  veneer: "Veneer",
};

const finishOptionsMap = {
  melamine: extractFinishOptions(melamineImages),
  petg: extractFinishOptions(petgImages),
  lacquer: extractFinishOptions(lacquerImages),
  veneer: extractFinishOptions(veneerImages),
};

function buildStyleCards(imageObj) {
  return Object.entries(imageObj)
    .map(([path, mod]) => {
      const meta = parseImageMeta(path);
      return {
        img: mod.default,
        name: meta.name,
        code: meta.code,
      };
    })
    .sort((a, b) => {
      const getNum = (code) => {
        const match = code.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      return getNum(a.code) - getNum(b.code);
    });
}

const styleCardsMap = {
  melamine: buildStyleCards(melamineImages),
  petg: buildStyleCards(petgImages),
  lacquer: buildStyleCards(lacquerImages),
  veneer: buildStyleCards(veneerImages),
};

const projectNames = {
  kitchen: "Kitchen Cabinetry",
  bathroom: "Bathroom Vanity",
  closet: "Closet System",
  wholehouse: "Whole House Customization",
};

const serviceHighlights = [
  {
    icon: ShieldCheck,
    title: "Simple Inquiry Flow",
    text: "Customers first leave contact details, then choose project type and style.",
  },
  {
    icon: Palette,
    title: "Style Selection",
    text: "Let customers choose material family and style direction from your catalog.",
  },
  {
    icon: Clock3,
    title: "Faster Sales Follow-Up",
    text: "Collect the key information your team needs before preparing a quotation.",
  },
  {
    icon: Building2,
    title: "Built for Custom Jobs",
    text: "More suitable for cabinetry and whole-house projects that need manual pricing.",
  },
];

const processSteps = [
  "Customer fills in contact and project information.",
  "Customer selects project type and preferred style.",
  "Customer submits the inquiry.",
  "Your team reviews the request and follows up with a quotation.",
];

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="section-title">
      {Icon ? <Icon size={20} /> : null}
      <span>{children}</span>
    </div>
  );
}

function HomePage({
  form,
  update,
  handleSubmit,
  currentStyleSeries,
  submitMessage,
  submitError,
  isSubmitting,
  cabinetForm,
  cabinetItems,
  updateCabinetForm,
  addCabinet,
  removeCabinet,
  styleCards,
  totalPrice,
  priceDataMap,
  modificationRows,
  subtotal,
  breakdown,
}) {

  const currentRows = priceDataMap[cabinetForm.type] || [];

  const categoryOptions = [...new Set(currentRows.map(r => r.Category).filter(Boolean))];

  const groupOptions = [...new Set(
    currentRows
      .filter(r => r.Category === cabinetForm.category)
      .map(r => r.Group)
      .filter(Boolean)
  )];

  const modelOptions = [...new Set(
    currentRows
      .filter(r => r.Category === cabinetForm.category && r.Group === cabinetForm.group)
      .map(r => r.Model)
      .filter(Boolean)
  )];


  const modificationModelOptions = [
    ...new Set(modificationRows.map((r) => r.Model).filter(Boolean)),
  ];


  return (
    <div className="page">
      <header className="topbar">
        <div className="container topbar-inner">
          <div>
            <div className="brand">United Buildo Works</div>
            <div className="subtitle">Custom Cabinetry • Millwork • Customer Inquiry Portal</div>
          </div>
          <div className="top-contact">
            <span><Phone size={14} /> (929) 000-0000</span>
            <span><Mail size={14} /> info@unitedbw.com</span>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="hero-copy">
            <div className="pill">Customer Inquiry & Style Selection</div>
            <h1>Make it easy for customers to leave information and choose a style.</h1>
            <p>
              Designed for custom kitchens, bathroom vanities, closets, and whole-house projects.
              Collect contact details first, then let customers choose the project type and style before submitting an inquiry.
            </p>
            <div className="hero-actions">
              <a href="#inquiry" className="btn btn-light">
                Start Inquiry <ArrowRight size={16} />
              </a>
              <Link to="/style" className="btn btn-outline">
                View Style Options
              </Link>
            </div>
            <div className="hero-mini-grid">
              {[
                ["Simple", "Customer fills key details first"],
                ["Clear", "Project type and style selection"],
                ["Practical", "Built for manual quotation"],
              ].map(([title, text]) => (
                <div key={title} className="mini-card">
                  <div className="mini-title">{title}</div>
                  <div className="mini-text">{text}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card">
              <div className="eyebrow">Why clients like this page</div>
              <div className="feature-grid">
                {serviceHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="feature-item">
                      <Icon size={20} />
                      <div className="feature-title">{item.title}</div>
                      <div className="feature-text">{item.text}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <main className="container main-grid">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="left-col">
          <Card>
            <div id="inquiry">
              <SectionTitle icon={UserRound}>Customer Inquiry Form</SectionTitle>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-block">
                <div className="block-label">Customer Information</div>
                <div className="grid two">
                  <div>
                    <label>Client Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label>Company / Builder</label>
                    <input
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label>Email Address</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label>Sales Representative</label>
                    <select value={form.sales} onChange={(e) => update("sales", e.target.value)}>
                      <option value="alex">Alex</option>
                      <option value="sarra">Sarra</option>
                      {/* <option value="mike">Mike</option> */}
                      <option value="No preference">No preference</option>
                    </select>
                  </div>
                  <div className="full">
                    <label>Project Address</label>
                    <input
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label>City / State</label>
                    <input
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <label>Preferred Timeline</label>
                    <select value={form.timeline} onChange={(e) => update("timeline", e.target.value)}>
                      <option>ASAP</option>
                      <option>Within 1-2 months</option>
                      <option>Within 3-6 months</option>
                      <option>Planning stage</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-block">
                <div className="block-label">Project Type</div>
                <div className="grid two">
                  <div>
                    <label>Select Project Type</label>
                    <select value={form.projectType} onChange={(e) => update("projectType", e.target.value)}>
                      <option value="kitchen">Kitchen Cabinetry</option>
                      <option value="bathroom">Bathroom Vanity</option>
                      <option value="closet">Closet System</option>
                      <option value="wholehouse">Whole House Customization</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-block" id="style-selection">
                <div className="block-label">Style & Cabinet Selection</div>

                <div className="grid two">
                  <div>
                    <label>Cabinet Series</label>
                    <select
                      value={form.priceTier}
                      onChange={(e) => update("priceTier", e.target.value)}
                    >
                      <option value="Euro Economy">Euro Economy</option>
                      <option value="Signature & Tempo">Signature & Tempo</option>
                    </select>
                  </div>
                  <div>
                    <label>Material Family</label>
                    <select value={form.style} onChange={(e) => update("style", e.target.value)}>
                      <option value="melamine">Melamine</option>
                      <option value="petg">PETG</option>
                      {/* <option value="lacquer">Lacquer</option> */}
                      <option value="veneer">Veneer</option>
                    </select>
                  </div>

                  <div>
                    <label>Door Style</label>
                    <select
                      value={form.doorStyle}
                      onChange={(e) => update("doorStyle", e.target.value)}
                    >
                      <option value="Flat Panel">Flat Panel</option>
                      <option value="Shaker">Shaker</option>
                    </select>
                  </div>

                  <div>
                    <label>Finish / Color Preference</label>
                    <select
                      value={form.finishColor}
                      onChange={(e) => update("finishColor", e.target.value)}
                    >
                      {(finishOptionsMap[form.style] || [])
                        .filter((color) => {
                          if (form.doorStyle === "Flat Panel") return true;
                          return (shakerAvailableMap[form.style] || []).includes(color);
                        })
                        .map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div className="block-label">Browse Style Options</div>

                  <div className="style-grid-inline">
                    {(styleCards[form.style] || [])
                      .filter((item) => {
                        if (form.doorStyle === "Flat Panel") return true;
                        return (shakerAvailableMap[form.style] || []).includes(item.name);
                      })
                      .map((item) => (
                        <button
                          key={item.code || item.name}
                          type="button"
                          className={`style-card-inline ${form.finishColor === item.name ? "active" : ""
                            }`}
                          onClick={() => update("finishColor", item.name)}
                        >
                          <img src={item.img} alt={item.name} className="style-thumb" />
                          <div className="style-card-body-inline">
                            <div className="style-name-inline">{item.name}</div>
                            <div className="style-code-inline">{item.code}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div style={{ height: "24px" }} />

                <div className="grid two">
                  <div>
                    <label>Cabinet Type</label>
                    <select
                      value={cabinetForm.type}
                      onChange={(e) => updateCabinetForm("type", e.target.value)}
                    >
                      <option value="wall">Wall</option>
                      <option value="base">Base</option>
                      <option value="vanity">Vanity</option>
                      <option value="tall">Tall</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>

                  <div>
                    <label>Category</label>
                    <select
                      value={cabinetForm.category}
                      onChange={(e) => {
                        updateCabinetForm("category", e.target.value);
                        updateCabinetForm("group", "");
                        updateCabinetForm("model", "");
                      }}
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Group</label>
                    <select
                      value={cabinetForm.group}
                      onChange={(e) => {
                        updateCabinetForm("group", e.target.value);
                        updateCabinetForm("model", "");
                      }}
                    >
                      <option value="">Select Group</option>
                      {groupOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Model</label>
                    <select
                      value={cabinetForm.model}
                      onChange={(e) => updateCabinetForm("model", e.target.value)}
                    >
                      <option value="">Select Model</option>
                      {modelOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Quantity + Custom */}
                <div className="qty-row">

                  <div className="same-size-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={cabinetForm.qty}
                      onChange={(e) => updateCabinetForm("qty", e.target.value)}
                    />
                  </div>
                  <div className="custom-type-group">

                    {[
                      { key: "", label: "Standard" },
                      { key: "smaller", label: "Reduce Size\n(no charge)" },
                      { key: "larger", label: "Increase Size\n(+30%)" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={`custom-btn ${cabinetForm.customType === item.key ? "active" : ""}`}
                        onClick={() => updateCabinetForm("customType", item.key)}
                      >
                        {item.label.split("\n").map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </button>
                    ))}


                  </div>
                </div>
                {cabinetForm.type === "accessory" && cabinetForm.group === "Cut-to-size" && (
                  <div className="small-muted" style={{ marginTop: "8px", color: "#666" }}>
                    For cut-to-size accessories, select <b>Reduce Size</b> and enter the required dimensions (inches) in the note. Use <b>Quantity</b> to enter the total square footage (sq ft).
                    {/* For cut-to-size accessories, please click <b>Reduce Size</b> and enter the required size in the note. Use <b>Quantity</b> to enter the square footage. */}
                  </div>
                )}
                {cabinetForm.customType && (
                  <div className="full">
                    <label>Custom Note</label>
                    <input
                      value={cabinetForm.customNote}
                      onChange={(e) => updateCabinetForm("customNote", e.target.value)}
                      placeholder="e.g. Between W1518 and W1818 / special size"
                    />
                  </div>
                )}




                {/* Modifications */}
                <div className="mod-section">
                  <div className="block-label">Modifications</div>

                  <div className="mod-grid">
                    <div className="mod-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={cabinetForm.modifications.endLeft}
                          onChange={(e) =>
                            updateCabinetForm("modifications", {
                              ...cabinetForm.modifications,
                              endLeft: e.target.checked,
                              endLeftModel: e.target.checked ? cabinetForm.modifications.endLeftModel : "",
                            })
                          }
                        />
                        Finished End (Left)
                      </label>

                      {cabinetForm.modifications.endLeft && (
                        <div className="mod-sub">
                          <select
                            value={cabinetForm.modifications.endLeftModel}
                            onChange={(e) =>
                              updateCabinetForm("modifications", {
                                ...cabinetForm.modifications,
                                endLeftModel: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Model</option>
                            {modificationModelOptions.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="mod-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={cabinetForm.modifications.endRight}
                          onChange={(e) =>
                            updateCabinetForm("modifications", {
                              ...cabinetForm.modifications,
                              endRight: e.target.checked,
                              endRightModel: e.target.checked ? cabinetForm.modifications.endRightModel : "",
                            })
                          }
                        />
                        Finished End (Right)
                      </label>

                      {cabinetForm.modifications.endRight && (
                        <div className="mod-sub">
                          <select
                            value={cabinetForm.modifications.endRightModel}
                            onChange={(e) =>
                              updateCabinetForm("modifications", {
                                ...cabinetForm.modifications,
                                endRightModel: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Model</option>
                            {modificationModelOptions.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="mod-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={cabinetForm.modifications.top}
                          onChange={(e) =>
                            updateCabinetForm("modifications", {
                              ...cabinetForm.modifications,
                              top: e.target.checked,
                              topModel: e.target.checked ? cabinetForm.modifications.topModel : "",
                            })
                          }
                        />
                        Finished Top
                      </label>

                      {cabinetForm.modifications.top && (
                        <div className="mod-sub">
                          <select
                            value={cabinetForm.modifications.topModel}
                            onChange={(e) =>
                              updateCabinetForm("modifications", {
                                ...cabinetForm.modifications,
                                topModel: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Model</option>
                            {modificationModelOptions.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="mod-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={cabinetForm.modifications.bottom}
                          onChange={(e) =>
                            updateCabinetForm("modifications", {
                              ...cabinetForm.modifications,
                              bottom: e.target.checked,
                              bottomModel: e.target.checked ? cabinetForm.modifications.bottomModel : "",
                            })
                          }
                        />
                        Finished Bottom
                      </label>

                      {cabinetForm.modifications.bottom && (
                        <div className="mod-sub">
                          <select
                            value={cabinetForm.modifications.bottomModel}
                            onChange={(e) =>
                              updateCabinetForm("modifications", {
                                ...cabinetForm.modifications,
                                bottomModel: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Model</option>
                            {modificationModelOptions.map((model) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="mod-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={cabinetForm.modifications.interior}
                          onChange={(e) =>
                            updateCabinetForm("modifications", {
                              ...cabinetForm.modifications,
                              interior: e.target.checked,
                            })
                          }
                        />
                        Finished Interior
                      </label>

                      {cabinetForm.modifications.interior && (
                        <div className="small-muted" style={{ marginTop: "6px", marginLeft: "22px" }}>
                          Finished Interior: ${finishedInteriorPriceMap[cabinetForm.type] || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="button-row" style={{ marginTop: "16px" }}>
                  <button type="button" className="btn btn-primary" onClick={addCabinet}>
                    + Add Cabinet
                  </button>
                </div>
              </div>

              <div className="form-block">
                <div className="block-label">Cabinet List</div>

                {cabinetItems.length === 0 ? (
                  <div className="small-muted">No cabinets added yet.</div>
                ) : (
                  <div className="cabinet-list">
                    {cabinetItems.map((item, index) => (
                      <div key={item.id} className="cabinet-row">
                        <div>
                          <div>
                            {index + 1}. {item.type} / {item.category} / {item.group} / {item.model} / Qty {item.qty} / ${calculateItemPrice(item, priceDataMap[item.type] || [])}

                            {item.customType === "larger" && (
                              <div style={{ color: "#007bff", fontSize: "12px", marginTop: "4px" }}>
                                Custom Larger (+30%)
                              </div>
                            )}

                            {item.customType === "smaller" && (
                              <div style={{ color: "#27db17", fontSize: "12px", marginTop: "4px" }}>
                                Custom Smaller (no charge)
                              </div>
                            )}

                            {item.customNote && (
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                Note: {item.customNote}
                              </div>
                            )}
                            {/* 👇 新加 */}
                            {(item.modifications?.endLeft ||
                              item.modifications?.endRight ||
                              item.modifications?.top ||
                              item.modifications?.bottom ||
                              item.modifications?.interior) && (
                                <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>
                                  Modifications:
                                  <ul style={{ margin: 0, paddingLeft: "16px" }}>
                                    {item.modifications.endLeft && (
                                      <li>Finished End (Left): {item.modifications.endLeftModel}</li>
                                    )}

                                    {item.modifications.endRight && (
                                      <li>Finished End (Right): {item.modifications.endRightModel}</li>
                                    )}

                                    {item.modifications.top && (
                                      <li>Finished Top: {item.modifications.topModel}</li>
                                    )}

                                    {item.modifications.bottom && (
                                      <li>Finished Bottom: {item.modifications.bottomModel}</li>
                                    )}

                                    {item.modifications.interior && (
                                      <li>Finished Interior: {item.modifications.interiorModel}</li>
                                    )}
                                  </ul>
                                </div>
                              )}

                          </div>
                          <div className="small-muted">
                            {item.priceTier} / {item.materialFamily} / {item.doorStyle} / {item.finishColor}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeCabinet(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {cabinetItems.length > 0 && (
                  <div className="total-summary">
                    <div className="summary-row">
                      <span>Cabinets</span>
                      <strong>${breakdown.cabinets}</strong>
                    </div>

                    <div className="summary-row">
                      <span>Accessories</span>
                      <strong>${breakdown.accessories}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Modifications</span>
                      <strong>${breakdown.modifications}</strong>
                    </div>
                    <div className="summary-total">
                      <span>Total</span>
                      <strong>${breakdown.total}</strong>
                    </div>
                  </div>
                )}
              </div>

              {submitMessage ? <div className="submit-ok">{submitMessage}</div> : null}
              {submitError ? <div className="submit-error">{submitError}</div> : null}

              <div className="button-row">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <Send size={16} />
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <SectionTitle icon={Calculator}>How the inquiry process works</SectionTitle>
            <div className="grid two">
              {processSteps.map((text, index) => (
                <div key={text} className="step-card">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-text">{text}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="right-col">
          <Card className="sticky-card">
            <SectionTitle icon={FileText}>Inquiry Summary</SectionTitle>

            <div className="price-box">
              <div className="small-muted">Customer Inquiry Preview</div>
              <div className="price" style={{ fontSize: "28px" }}>${totalPrice || 0}</div>
              <div className="help-text">
                This version focuses on collecting customer information, project type, and style preferences before you prepare a formal quote.
              </div>
            </div>

            <div className="info-box">
              <div className="info-title">Customer details</div>
              <div className="info-line"><UserRound size={14} /> {form.name || "Client name"}</div>
              <div className="info-line"><Phone size={14} /> {form.phone || "Phone number"}</div>
              <div className="info-line"><Mail size={14} /> {form.email || "Email address"}</div>
              <div className="info-line"><MapPin size={14} /> {form.city || "City / State"}</div>
            </div>

            <div className="info-box">
              <div className="info-title">Project information</div>
              <div className="info-line"><Building2 size={14} /> {projectNames[form.projectType]}</div>
              <div className="info-line"><Clock3 size={14} /> {form.timeline}</div>
              <div className="info-line"><MapPin size={14} /> {form.address || "Project address"}</div>

            </div>

            <div className="tag-box">
              <div className="info-title">Selected style</div>
              <div className="tags">
                {[form.priceTier, styleNames[form.style], form.doorStyle, form.finishColor]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="tag">{item}</span>
                  ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="info-title large">Why this version works better</div>
            <div className="check-list">
              {[
                "Customer fills information first",
                "Project type selection is clearer",
                "Style selection matches your catalog flow",
                "No unnecessary upload step for customers",
                "Better for manual quotation workflow",
              ].map((item) => (
                <div key={item} className="check-item">
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

// 👇 放在 App() 上面

const priceColumnMap = {
  "Euro Economy": {
    Melamine: "A",
    PETG: "B",
    Veneer: "E",
  },
  "Signature & Tempo": {
    Melamine: "C",
    PETG: "D",
    Veneer: "F",
  },
};

function getPriceColumn(item) {
  if (item.type === "accessory") {
    return item.materialFamily;
  }

  return priceColumnMap[item.priceTier]?.[item.materialFamily] || null;
}

function calculateItemPrice(item, priceRows) {
  const column = getPriceColumn(item);

  if (!column) return 0;

  const row = priceRows.find(
    (r) => r.Model?.toUpperCase() === item.model?.toUpperCase()
  );

  if (!row) return 0;

  let unitPrice = Number(row[column]) || 0;

  // Shaker +30%
  if (item.doorStyle === "Shaker") {
    unitPrice *= 1.3;
  }

  if (item.customType === "larger") {
    unitPrice *= 1.3;
  }

  let extra = 0;


  extra += getModificationPrice(item.modifications?.endLeftModel, item.materialFamily);
  extra += getModificationPrice(item.modifications?.endRightModel, item.materialFamily);
  extra += getModificationPrice(item.modifications?.topModel, item.materialFamily);
  extra += getModificationPrice(item.modifications?.bottomModel, item.materialFamily);

  if (item.modifications?.interior) {
    extra += finishedInteriorPriceMap[item.type] || 0;
  }



  return (unitPrice + extra) * item.qty;
}

export default function App() {


  const priceDataMap = {
    wall: wallRows,
    base: baseRows,
    vanity: vanityRows,
    tall: tallRows,
    accessory: accessoryRows,
  };

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    city: "New York, NY",
    projectType: "kitchen",
    timeline: "Within 1-2 months",
    priceTier: "Euro Economy",
    style: "melamine",
    doorStyle: "Flat Panel",
    finishColor: finishOptionsMap.melamine?.[0] || "",
    sales: "No preference",
  });

  const [cabinetForm, setCabinetForm] = useState({
    type: "wall",
    category: "",
    group: "",
    model: "",
    qty: 1,

    // isCustom: false,
    customType: "",
    customNote: "",

    modifications: {
      endLeft: false,
      endLeftModel: "",
      endRight: false,
      endRightModel: "",
      top: false,
      topModel: "",
      bottom: false,
      bottomModel: "",
      interior: false,
      interiorModel: "",
    },
  });


  const location = useLocation();
  const navigate = useNavigate();

  const [cabinetItems, setCabinetItems] = useState([]);
  const totalPrice = cabinetItems.reduce(
    (sum, item) =>
      sum + calculateItemPrice(item, priceDataMap[item.type] || []),
    0
  );
  const subtotal = totalPrice;
  const breakdown = cabinetItems.reduce(
    (acc, item) => {
      const totalItemPrice = calculateItemPrice(item, priceDataMap[item.type] || []);
      const modPrice = calculateModificationTotal(item);

      if (item.type === "accessory") {
        acc.accessories += totalItemPrice;
      } else {
        acc.cabinets += totalItemPrice - modPrice; // 柜体本身
        acc.modifications += modPrice;             // 单独拆出来
      }

      acc.total += totalItemPrice;
      return acc;
    },
    { cabinets: 0, accessories: 0, modifications: 0, total: 0 }
  );

  function calculateModificationTotal(item) {
    let total = 0;

    total += getModificationPrice(item.modifications?.endLeftModel, item.materialFamily);
    total += getModificationPrice(item.modifications?.endRightModel, item.materialFamily);
    total += getModificationPrice(item.modifications?.topModel, item.materialFamily);
    total += getModificationPrice(item.modifications?.bottomModel, item.materialFamily);

    if (item.modifications?.interior) {
      total += finishedInteriorPriceMap[item.type] || 0;
    }

    return total * item.qty;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "style") {
        const allColors = finishOptionsMap[value] || [];
        const validColors =
          next.doorStyle === "Shaker"
            ? allColors.filter((c) =>
              (shakerAvailableMap[value] || []).includes(c)
            )
            : allColors;

        next.finishColor = validColors[0] || "";
      }

      if (key === "doorStyle") {
        const allColors = finishOptionsMap[next.style] || [];
        const validColors =
          value === "Shaker"
            ? allColors.filter((c) =>
              (shakerAvailableMap[next.style] || []).includes(c)
            )
            : allColors;

        next.finishColor = validColors[0] || "";
      }

      return next;
    });
  };

  const currentStyleSeries = useMemo(() => {
    return styleSeriesMap[form.style] || [];
  }, [form.style]);

  useEffect(() => {
    const selectedStyle = location.state?.selectedStyle;
    const selectedColor = location.state?.selectedColor;
    const scrollTo = location.state?.scrollTo;

    if (!selectedStyle && !selectedColor && !scrollTo) return;

    setForm((prev) => {
      const nextStyle = selectedStyle || prev.style;

      const validColors = (finishOptionsMap[nextStyle] || []).filter((c) => {
        if (prev.doorStyle === "Flat Panel") return true;
        return (shakerAvailableMap[nextStyle] || []).includes(c);
      });

      const nextColor =
        selectedColor && validColors.includes(selectedColor)
          ? selectedColor
          : prev.finishColor;

      return {
        ...prev,
        style: nextStyle,
        finishColor: nextColor,
      };
    });

    setTimeout(() => {
      if (scrollTo) {
        document.getElementById(scrollTo)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);
  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      city: "New York, NY",
      projectType: "kitchen",
      timeline: "Within 1-2 months",
      priceTier: "Euro Economy",
      style: "melamine",
      doorStyle: "Flat Panel",
      finishColor: finishOptionsMap.melamine?.[0] || "",
      sales: "No preference",
    });
  };
  function updateCabinetForm(key, value) {
    setCabinetForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addCabinet() {
    if (!cabinetForm.category || !cabinetForm.group || !cabinetForm.model) {
      alert("Please complete cabinet information");
      return;
    }
    setCabinetItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...cabinetForm,
        qty: Number(cabinetForm.qty) || 1,
        priceTier: form.priceTier,
        materialFamily: styleNames[form.style],
        doorStyle: form.doorStyle,
        finishColor: form.finishColor,
      },
    ]);
    setCabinetForm({
      type: "wall",
      category: "",
      group: "",
      model: "",
      qty: 1,
      customType: "",
      customNote: "",
      modifications: {
        endLeft: false,
        endLeftModel: "",

        endRight: false,
        endRightModel: "",

        top: false,
        topModel: "",

        bottom: false,
        bottomModel: "",

        interior: false,
        interiorModel: "",
      },
    });
  }

  function removeCabinet(id) {
    setCabinetItems((prev) => prev.filter((item) => item.id !== id));
  }
  // const inquiryId = `EST-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    const DEFAULT_EMAIL = "info@unitedbw.com";

    const groupedCabinetsText = (() => {
      if (!cabinetItems.length) return "No cabinets added";

      const groups = {};
      const typeMap = {
        wall: "Wall",
        base: "Base",
        vanity: "Vanity",
        tall: "Tall",
      };
      cabinetItems.forEach((item) => {
        const key = `${item.priceTier}|||${item.materialFamily}|||${item.doorStyle}|||${item.finishColor}`;

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(item);
      });

      return Object.entries(groups)
        .map(([key, items]) => {
          const [priceTier, materialFamily, doorStyle, finishColor] = key.split("|||");

          const groupTotal = items.reduce(
            (sum, item) =>
              sum + calculateItemPrice(item, priceDataMap[item.type] || []),
            0
          );

          const lines = items.map((item, index) => {
            const price = calculateItemPrice(item, priceDataMap[item.type] || []);

            const baseLine = `${index + 1}. ${typeMap[item.type] || item.type
              } / ${item.category} / ${item.group} / ${item.model} / Qty ${item.qty} / $${price}`;

            let customLine = "";

            if (item.customType === "larger") {
              customLine = " / Increase Size (+30%)";
            }

            if (item.customType === "smaller") {
              customLine = " / Reduce Size (no charge)";
            }

            const noteLine = item.customNote ? ` / Note: ${item.customNote}` : "";

            const modificationList = [];

            if (item.modifications?.endLeft) {
              modificationList.push(`Finished End (Left): ${item.modifications.endLeftModel || "N/A"}`);
            }

            if (item.modifications?.endRight) {
              modificationList.push(`Finished End (Right): ${item.modifications.endRightModel || "N/A"}`);
            }

            if (item.modifications?.top) {
              modificationList.push(`Finished Top: ${item.modifications.topModel || "N/A"}`);
            }

            if (item.modifications?.bottom) {
              modificationList.push(`Finished Bottom: ${item.modifications.bottomModel || "N/A"}`);
            }

            if (item.modifications?.interior) {
              modificationList.push(`Finished Interior`);
            }

            const modificationsLine = modificationList.length
              ? ` / Modifications: ${modificationList.join(", ")}`
              : "";

            return `${baseLine}${customLine}${noteLine}${modificationsLine}`;
          });
          return [
            `Price Tier: ${priceTier}`,
            `Material: ${materialFamily}`,
            `Door Style: ${doorStyle}`,
            `Finish / Color: ${finishColor}`,
            `Cabinet List:`,
            ...lines,
            `Group Total: $${groupTotal}`,

          ].join("\n");
        })
        .join("\n\n");
    })();

    try {
      const { data: estimateId, error } = await supabase.rpc("create_inquiry", {
        p_customer_name: form.name,
        p_customer_phone: form.phone,
        p_customer_email: form.email,
        p_sales_name: form.sales,
        p_project_type: projectNames[form.projectType],
        p_timeline: form.timeline,
        p_cabinet_groups: groupedCabinetsText,
      });
      if (error) {
        console.error(error);
        setSubmitError("Database error");
        return;
      }

      // const insertedId = data?.[0]?.id;

      // const inquiryIdFinal = inquiryId;
      // const inquiryId = finalData?.estimate_id || "";

      const templateParams = {
        inquiry_id: estimateId,
        customer_name: form.name,
        company_name: form.company,
        customer_phone: form.phone,
        customer_email: form.email,
        to_email: salesEmailMap[form.sales] || DEFAULT_EMAIL,
        cc_email: form.email
          ? `info@unitedbw.com, ${form.email}`
          : "info@unitedbw.com",
        sales_name: form.sales || "General Inquiry",
        project_address: form.address,
        city_state: form.city,
        project_type: projectNames[form.projectType],
        timeline: form.timeline,
        cabinet_groups: groupedCabinetsText,
        submitted_at: new Date().toLocaleString(),
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitMessage(
        `Estimate submitted successfully. Your reference number: ${estimateId}`
      );
      resetForm();
    } catch (error) {
      console.error(error);
      setSubmitError("Failed to send inquiry. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Routes>
      <Route path="/admin-ubw-9328" element={<AdminPage />} />
      <Route
        path="/"
        element={
          <HomePage
            form={form}
            update={update}
            handleSubmit={handleSubmit}
            currentStyleSeries={currentStyleSeries}
            submitMessage={submitMessage}
            submitError={submitError}
            isSubmitting={isSubmitting}
            cabinetForm={cabinetForm}
            cabinetItems={cabinetItems}
            updateCabinetForm={updateCabinetForm}
            addCabinet={addCabinet}
            removeCabinet={removeCabinet}
            styleCards={styleCardsMap}
            totalPrice={totalPrice}
            priceDataMap={priceDataMap}
            modificationRows={modificationRows}
            subtotal={subtotal}
            breakdown={breakdown}

          />
        }
      />
      <Route path="/style" element={<StylePage />} />
    </Routes>
  );
}