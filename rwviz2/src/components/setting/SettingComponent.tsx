import React from 'react';
import "./SettingComponent.css";

interface SettingsComponentProps {
    onURDFLoad: (isURDFLoaded: boolean) => void;
    onSLAMLoad: (isSLAMLoaded: boolean) => void;
};

const SettingsComponent: React.FC<SettingsComponentProps> = ({ onURDFLoad, onSLAMLoad }) => {

    const handleSelectURDF = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        e.preventDefault();
        const selectedURDF = e.target.files && e.target.files[0];

        if (selectedURDF) {
            const blob: Blob = new Blob([selectedURDF], { type: "application/xml" });
            const urdfString: string = URL.createObjectURL(blob);
            localStorage.setItem("urdf", urdfString);
            onURDFLoad(true);
        }
    };

    const handleSelectSLAM = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const isChecked: boolean = e.target.checked;
        console.log(`handleSelectSLAM isChecked : ${isChecked}`);
        onSLAMLoad(isChecked);
    };

    return (
        <div className="setting_container">
            <div className="urdf_container">
                <h3>URDF</h3>
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
                    type='checkbox'
                    name='slam'
                    onChange={handleSelectSLAM}
                />
            </div>
        </div>
    );
}

export default SettingsComponent;