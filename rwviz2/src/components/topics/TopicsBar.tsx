import React from 'react';

interface TopicsBarProps {
    onURDFLoad: (isURDFLoaded: boolean) => void;
    onSLAMLoad: (isSLAMLoaded: boolean) => void;
}

const TopicsBar: React.FC<TopicsBarProps> = ({ onURDFLoad, onSLAMLoad }) => {
    const handleSelectURDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const selectedURDF = e.target.files && e.target.files[0];

        if (selectedURDF) {
            const blob: Blob = new Blob([selectedURDF], { type: "application/xml" });
            const urdfString: string = URL.createObjectURL(blob);
            localStorage.setItem("urdf", urdfString);
            onURDFLoad(true);
        }
    };

    const handleSelectSLAM = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const selectedSLAM = e.target.files && e.target.files[0];

        if (selectedSLAM) {
            const blob: Blob = new Blob([selectedSLAM], { type: "img/png" });
            const slamString: string = URL.createObjectURL(blob);
            localStorage.setItem("slam", slamString);
            onSLAMLoad(true);
        }
    };

    return (
        <div className="topics_bar_container">
            <div className="urdf_container">
                <h3>urdf</h3>
                <input
                    type='file'
                    name='urdf'
                    onChange={handleSelectURDF}
                    accept='.urdf, .URDF'
                />
            </div>

            <div className="slam_container">
                <h3>SLAM</h3>
                <input
                    type='file'
                    name='slam'
                    onChange={handleSelectSLAM}
                    accept='.pgm, .png'
                />
            </div>
        </div>
    );
}

export default TopicsBar;