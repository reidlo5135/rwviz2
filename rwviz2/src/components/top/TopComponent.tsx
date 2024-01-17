import React from "react";
import "./TopComponent.css";

const TopComponent: React.FC = () => {
    return (
        <div className="top_container">
            <div className="logo_container">
                <img className="img_logo" src="ros.svg" />
            </div>
            <div className="title_container">
                rwviz2
            </div>
        </div>
    )
}

export default TopComponent;