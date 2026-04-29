import React from "react";
import { Link } from "react-router-dom";

// 自动读取所有图片
const melamine = import.meta.glob("./assets/styles/melamine/*.{jpg,png,jpeg}", { eager: true });
const petg = import.meta.glob("./assets/styles/petg/*.{jpg,png,jpeg}", { eager: true });
const lacquer = import.meta.glob("./assets/styles/lacquer/*.{jpg,png,jpeg}", { eager: true });
const veneer = import.meta.glob("./assets/styles/veneer/*.{jpg,png,jpeg}", { eager: true });

// 把图片对象转数组
function getImages(obj) {
    return Object.entries(obj).map(([path, mod]) => ({
        img: mod.default,
        path,
    }));
}

// 解析文件名 → name + code
function parseImage(path) {
    const file = path.split("/").pop().split(".")[0];

    const [namePart, codePart] = file.split("_");

    const name = namePart
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const code = codePart ? codePart.toUpperCase() : "";

    return { name, code };
}

export default function StylePage() {
    const groups = [
        { title: "Melamine", key: "melamine", images: getImages(melamine) },
        { title: "PETG", key: "petg", images: getImages(petg) },
        { title: "Lacquer", key: "lacquer", images: getImages(lacquer) },
        { title: "Veneer", key: "veneer", images: getImages(veneer) },
    ];

    return (
        <div className="style-page">
            <div className="style-page-header">
                <div className="header-top">
                    <Link to="/" className="back-btn">
                        ← Back to Inquiry
                    </Link>
                </div>

                <h1 className="header-title">Style Options</h1>
                <p className="header-subtitle">
                    Explore finishes and colors for your project
                </p>
            </div>

            {groups.map((group) => (
                <div key={group.title} className="style-section">
                    <h2>{group.title}</h2>

                    <div className="style-grid">
                        {group.images
                            .map(({ img, path }) => {
                                const { name, code } = parseImage(path);
                                return { img, name, code };
                            })
                            .sort((a, b) => {
                                const getNum = (code) => {
                                    const match = code.match(/\d+/);
                                    return match ? parseInt(match[0]) : 0;
                                };

                                return getNum(a.code) - getNum(b.code);
                            })
                            .map((item, i) => (
                                <div key={i} className="style-card">
                                    <img src={item.img} className="style-image" alt="" />

                                    <div className="style-card-body">
                                        <div className="style-name">{item.name}</div>
                                        <div className="style-code">Code: {item.code}</div>

                                        <Link
                                            to="/"
                                            state={{
                                                selectedStyle: group.key,
                                                selectedColor: item.name,
                                                scrollTo: "style-selection",
                                            }}
                                            className="select-style-btn"
                                        >
                                            Select
                                        </Link>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}