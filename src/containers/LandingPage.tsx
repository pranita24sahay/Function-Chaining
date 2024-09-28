import React, { useState, useRef, useEffect } from 'react';
import './LandingPage.css';
import FunctionCard from '../components/Card/FunctionCard';

const initialFunctions = [
    { id: 'F1', equation: 'x^2', next: 'F2' },
    { id: 'F2', equation: '2*x+4', next: 'F4' },
    { id: 'F3', equation: 'x^2+20', next: null },
    { id: 'F4', equation: 'x-2', next: 'F5' },
    { id: 'F5', equation: 'x/2', next: 'F3' },
];

const LandingPage = () => {
    const [initialValue, setInitialValue] = useState<number>(2);
    const [functions, setFunctions] = useState(initialFunctions);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleEquationChange = (id: string, newEquation: string) => {
        setFunctions(prev =>
            prev.map(func =>
                func.id === id ? { ...func, equation: newEquation } : func
            )
        );
    };

    const validateEquation = (equation: string) => {
        // Validate the equation using regex
        const regex = /^[0-9+\-*/^x\s]+$/;
        return regex.test(equation);
    };

    const evaluateExpression = (expression: string, variableValue: number): number => {
        const updatedExpression = expression.replace(/x/g, String(variableValue));
        const tokens = updatedExpression.match(/(\d+(\.\d+)?|\+|\-|\*|\/|\^|\(|\))/g) || [];

        const precedence: { [key: string]: number } = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
        };

        const outputQueue: string[] = [];
        const operatorStack: string[] = [];

        tokens.forEach((token) => {
            if (!isNaN(parseFloat(token))) {
                outputQueue.push(token);
            } else if (token in precedence) {
                while (operatorStack.length > 0 && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop()!);
                }
                operatorStack.push(token);
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop()!);
                }
                operatorStack.pop();
            }
        });

        while (operatorStack.length > 0) {
            outputQueue.push(operatorStack.pop()!);
        }

        const evaluationStack: number[] = [];
        outputQueue.forEach((token) => {
            if (!isNaN(parseFloat(token))) {
                evaluationStack.push(parseFloat(token));
            } else {
                const b = evaluationStack.pop()!;
                const a = evaluationStack.pop()!;
                switch (token) {
                    case '+':
                        evaluationStack.push(a + b);
                        break;
                    case '-':
                        evaluationStack.push(a - b);
                        break;
                    case '*':
                        evaluationStack.push(a * b);
                        break;
                    case '/':
                        evaluationStack.push(a / b);
                        break;
                    case '^':
                        evaluationStack.push(Math.pow(a, b));
                        break;
                }
            }
        });

        return evaluationStack[0];
    };

    const calculateFinalOutput = (): number => {
        let currentValue = initialValue;
        let currentFunction = functions.find(func => func.id === 'F1');

        while (currentFunction) {
            try {
                currentValue = evaluateExpression(currentFunction.equation, currentValue);
            } catch (error) {
                console.error('Invalid equation:', error);
            }
            currentFunction = functions.find(func => func.id === currentFunction.next);
        }
        return currentValue;
    };

    const finalOutput = calculateFinalOutput();

    const drawLines = () => {
        if (!containerRef.current) return;
        const svg = containerRef.current.querySelector('svg.connection-lines');
        if (!svg) return;

        svg.innerHTML = ''; // Clear previous lines

        const drawPath = (startX, startY, endX, endY) => {
            const controlPointOffset = Math.abs(startX - endX) / 2;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute(
                "d",
                `M${startX},${startY} C${startX + controlPointOffset},${startY} ${endX - controlPointOffset},${endY} ${endX},${endY}`
            );
            path.setAttribute("stroke", "blue");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("fill", "transparent");
            svg.appendChild(path);
        };

        functions.forEach((func) => {
            if (func.next) {
                const startElement = document.getElementById(`function-${func.id}`);
                const endElement = document.getElementById(`function-${func.next}`);
                if (startElement && endElement) {
                    const startConnector = startElement.querySelector('.function-card-footer .connector:last-child .connector-dot');
                    const endConnector = endElement.querySelector('.function-card-footer .connector:first-child .connector-dot');

                    if (startConnector && endConnector) {
                        const startRect = startConnector.getBoundingClientRect();
                        const endRect = endConnector.getBoundingClientRect();
                        const svgRect = svg.getBoundingClientRect();

                        const startX = startRect.left + startRect.width / 2 - svgRect.left;
                        const startY = startRect.top + startRect.height / 2 - svgRect.top;
                        const endX = endRect.left + endRect.width / 2 - svgRect.left;
                        const endY = endRect.top + endRect.height / 2 - svgRect.top;

                        drawPath(startX, startY, endX, endY);
                    }
                }
            }
        });

        // Draw line from Initial Value to Function F1 Input
        const initialValueElement = document.querySelector('.initial-value');
        const functionF1Element = document.getElementById('function-F1');
        if (initialValueElement && functionF1Element) {
            const startConnector = initialValueElement.querySelector('.input-container .indicator');
            const endConnector = functionF1Element.querySelector('.function-card-footer .connector:first-child .connector-dot');

            if (startConnector && endConnector) {
                const startRect = startConnector.getBoundingClientRect();
                const endRect = endConnector.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();

                const startX = startRect.right - svgRect.left;
                const startY = startRect.top + startRect.height / 2 - svgRect.top;
                const endX = endRect.left + endRect.width / 2 - svgRect.left;
                const endY = endRect.top + endRect.height / 2 - svgRect.top;

                drawPath(startX, startY, endX, endY);
            }
        }

        // Draw line from Function F3 Output to Final Output
        const finalOutputElement = document.querySelector('.output-value');
        const functionF3Element = document.getElementById('function-F3');
        if (finalOutputElement && functionF3Element) {
            const startConnector = functionF3Element.querySelector('.function-card-footer .connector:last-child .connector-dot');
            const endConnector = finalOutputElement.querySelector('.output-container .indicator');

            if (startConnector && endConnector) {
                const startRect = startConnector.getBoundingClientRect();
                const endRect = endConnector.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();

                const startX = startRect.left + startRect.width / 2 - svgRect.left;
                const startY = startRect.top + startRect.height / 2 - svgRect.top;
                const endX = endRect.left - svgRect.left;
                const endY = endRect.top + endRect.height / 2 - svgRect.top;

                drawPath(startX, startY, endX, endY);
            }
        }
    };





    useEffect(() => {
        window.addEventListener('resize', drawLines);
        drawLines();
        return () => {
            window.removeEventListener('resize', drawLines);
        };
    }, [functions, initialValue]);

    return (
        <div className="app" ref={containerRef}>
            <div className="initial-value">
                <div className="label">Initial value of x:</div>
                <div className="input-container">
                    <input
                        type="number"
                        value={initialValue}
                        onChange={(e) => setInitialValue(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="function-container">
                {functions.map((func) => (
                    <FunctionCard
                        key={func.id}
                        id={func.id}
                        label={`Function ${func.id}`}
                        equation={func.equation}
                        nextFunction={func.next ? `Function ${func.next}` : 'End'}
                        onChange={(newEq) => {
                            if (validateEquation(newEq)) {
                                handleEquationChange(func.id, newEq);
                            } else {
                                alert('Invalid equation. Only use numbers, +, -, *, /, ^, and x.');
                            }
                        }}
                    />
                ))}
            </div>

            <svg className="connection-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
            </svg>

            <div className="output-value">
                <div className="label">Final Output y:</div>
                <div className="output-container">
                    <div className="final-output">{finalOutput}</div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
