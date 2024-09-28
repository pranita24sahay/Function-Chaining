import React from 'react';
import './FunctionCard.css';

interface FunctionCardProps {
    id: string;
    label: string;
    equation: string;
    nextFunction: string;
    onChange: (equation: string) => void;
}

const FunctionCard = ({ id, label, equation, nextFunction, onChange }: FunctionCardProps) => {
    return (
        <div className="function-card" id={`function-${id}`}>
            <div className="card-header">::: {label}</div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <label>Equation</label>
                    <input
                        type="text"
                        value={equation}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter equation (use 'x')"
                    />
                </div>
                <div className="next-function">
                    <label>Next function</label>
                    <select disabled>
                        <option>{nextFunction}</option>
                    </select>
                </div>
            </div>
            {/* Footer with Input and Output Connectors */}
            <div className="function-card-footer">
                <div className="connector">
                    <div className="connector-dot"></div>
                    <div className="connector-label">Input</div>
                </div>
                <div className="connector">
                    <div className="connector-label">Output</div>
                    <div className="connector-dot"></div>
                </div>
            </div>
        </div>
    );
};

export default FunctionCard;
