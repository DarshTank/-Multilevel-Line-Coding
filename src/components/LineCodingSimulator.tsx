import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react';

interface WaveformProps {
  data: number[];
  height: number;
  title: string;
  showBalance?: boolean;
}

interface StepVisualizationProps {
  steps: {
    title: string;
    content: string[];
    data?: number[];
    balance?: {
      sum: number;
      isViolation: boolean;
      correction?: string;
    };
  }[];
}

const StepVisualization: React.FC<StepVisualizationProps> = ({ steps }) => {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
          <div className="bg-indigo-50 px-4 py-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-sm">
              {index + 1}
            </span>
            <h3 className="font-semibold text-indigo-900">{step.title}</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2 mb-4">
              {step.content.map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-600 mt-1" />
                  <p className="font-mono text-sm text-gray-700">{line}</p>
                </div>
              ))}
              {step.balance && (
                <div className={`mt-4 p-3 rounded-md ${
                  step.balance.isViolation ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {step.balance.isViolation ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <span className={`font-medium ${
                        step.balance.isViolation ? 'text-red-700' : 'text-green-700'
                      }`}>
                        Running Sum: {step.balance.sum}
                        {step.balance.isViolation && ' (DC Balance Violation)'}
                      </span>
                      {step.balance.correction && (
                        <div className="mt-2 text-sm text-gray-600">
                          <BarChart2 className="w-4 h-4 inline-block mr-1" />
                          Balance Correction: {step.balance.correction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {step.data && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <Waveform
                  data={step.data}
                  height={200}
                  title="Signal at this step"
                  showBalance={true}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Waveform: React.FC<WaveformProps> = ({ data, height, title, showBalance = false }) => {
  const width = 800;
  const padding = 40;
  const graphHeight = height - 2 * padding;

  const maxValue = Math.max(3, ...data.map(v => Math.abs(v)));
  const yScale = graphHeight / (2 * maxValue);
  const yTicks = Array.from({ length: 7 }, (_, i) => maxValue - (i * (2 * maxValue) / 6));

  // Calculate running sum for DC balance visualization
  const runningSum = data.reduce((acc, curr) => {
    const last = acc[acc.length - 1] || 0;
    acc.push(last + curr);
    return acc;
  }, [] as number[]);

  const maxRunningSum = Math.max(...runningSum.map(Math.abs), 3); // Minimum scale of 3
  const runningSumScale = (graphHeight / 4) / maxRunningSum;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2 text-indigo-900">{title}</h3>
      <div className="p-4 bg-gray-50 rounded-lg">
        <svg width={width} height={height} className="bg-white rounded-lg shadow-sm">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Balance threshold lines */}
          {showBalance && (
            <>
              <line
                x1={padding}
                y1={height / 2 - 3 * runningSumScale}
                x2={width - padding}
                y2={height / 2 - 3 * runningSumScale}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <line
                x1={padding}
                y1={height / 2 + 3 * runningSumScale}
                x2={width - padding}
                y2={height / 2 + 3 * runningSumScale}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <text
                x={width - padding + 5}
                y={height / 2 - 3 * runningSumScale}
                className="text-xs fill-red-500"
                alignmentBaseline="middle"
              >
                +3 (Balance Threshold)
              </text>
              <text
                x={width - padding + 5}
                y={height / 2 + 3 * runningSumScale}
                className="text-xs fill-red-500"
                alignmentBaseline="middle"
              >
                -3 (Balance Threshold)
              </text>
            </>
          )}

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={padding + tick * yScale}
              x2={width - padding}
              y2={padding + tick * yScale}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* X-axis (zero line) */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <text
              key={`label-${i}`}
              x={padding - 10}
              y={padding + tick * yScale}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-600"
            >
              {tick.toFixed(1)}
            </text>
          ))}

          {/* Running sum line (DC balance) */}
          {showBalance && (
            <>
              <path
                d={runningSum
                  .map((sum, index) => {
                    const x = padding + index * ((width - 2 * padding) / (data.length - 1));
                    const y = height / 2 - sum * runningSumScale;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                stroke="#ef4444"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="4 4"
              />
              {/* Running sum points */}
              {runningSum.map((sum, index) => (
                <circle
                  key={`sum-${index}`}
                  cx={padding + index * ((width - 2 * padding) / (data.length - 1))}
                  cy={height / 2 - sum * runningSumScale}
                  r="2"
                  fill="#ef4444"
                />
              ))}
            </>
          )}

          {/* Waveform */}
          <path
            d={data
              .map((value, index) => {
                const x = padding + index * ((width - 2 * padding) / (data.length - 1));
                const y = height / 2 - value * yScale;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y} L ${x + ((width - 2 * padding) / (data.length - 1))} ${y}`;
              })
              .join(' ')}
            stroke="#4f46e5"
            strokeWidth="2"
            fill="none"
          />

          {/* Data points */}
          {data.map((value, index) => (
            <circle
              key={`point-${index}`}
              cx={padding + index * ((width - 2 * padding) / (data.length - 1))}
              cy={height / 2 - value * yScale}
              r="3"
              fill="#4f46e5"
            />
          ))}

          {/* X-axis labels */}
          {data.map((value, index) => (
            <text
              key={`x-label-${index}`}
              x={padding + index * ((width - 2 * padding) / (data.length - 1)) + ((width - 2 * padding) / (data.length - 1)) / 2}
              y={height - padding / 2}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {index}
            </text>
          ))}

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-sm fill-gray-700"
          >
            Time (t)
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="text-sm fill-gray-700"
          >
            Amplitude
          </text>

          {showBalance && (
            <text
              x={width - padding}
              y={padding}
              textAnchor="end"
              className="text-xs fill-red-500"
            >
              DC Balance (Running Sum)
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

const LineCodingSimulator: React.FC = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [codingType, setCodingType] = useState<'2B1Q' | '8B6T'>('2B1Q');
  const [result, setResult] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [visualSteps, setVisualSteps] = useState<{
    title: string;
    content: string[];
    data?: number[];
    balance?: {
      sum: number;
      isViolation: boolean;
      correction?: string;
    };
  }[]>([]);

  const convert2B1Q = (binary: string): { steps: { title: string; content: string[]; data?: number[]; }[]; result: number[]; } => {
    const pairs = binary.match(/.{1,2}/g) || [];
    let previousLevel = 0;
    const steps = [];
    const intermediateResults: number[] = [];
    
    steps.push({
      title: 'Input Analysis',
      content: [
        `Binary Input: ${binary}`,
        `Length: ${binary.length} bits`,
        `Number of pairs: ${pairs.length}`
      ]
    });

    steps.push({
      title: 'Grouping into Pairs',
      content: pairs.map((pair, i) => `Pair ${i + 1}: ${pair}`)
    });

    const result = pairs.map((pair, index) => {
      const isPreviousPositive = previousLevel > 0;
      let nextLevel: number;
      
      switch (pair) {
        case '00':
          nextLevel = isPreviousPositive ? 1 : -1;
          break;
        case '01':
          nextLevel = isPreviousPositive ? 3 : -3;
          break;
        case '10':
          nextLevel = isPreviousPositive ? -1 : 1;
          break;
        case '11':
          nextLevel = isPreviousPositive ? -3 : 3;
          break;
        default:
          nextLevel = 0;
      }
      
      intermediateResults.push(nextLevel);
      
      steps.push({
        title: `Converting Pair ${index + 1}`,
        content: [
          `Input pair: ${pair}`,
          `Previous level: ${previousLevel === 0 ? 'neutral' : previousLevel > 0 ? 'positive' : 'negative'}`,
          `Applied rule: ${pair} → ${nextLevel}`,
          `Output level: ${nextLevel}`
        ],
        data: [...intermediateResults]
      });
      
      previousLevel = nextLevel;
      return nextLevel;
    });

    return { steps, result };
  };

  const convert8B6T = (binary: string): { steps: { title: string; content: string[]; data?: number[]; balance?: { sum: number; isViolation: boolean; correction?: string; }; }[]; result: number[]; } => {
    const bytes = binary.match(/.{1,8}/g) || [];
    const steps = [];
    const ternary: number[] = [];
    let previousCode: number[] = [];
    let runningSum = 0;
    
    steps.push({
      title: 'Input Analysis',
      content: [
        `Binary Input: ${binary}`,
        `Length: ${binary.length} bits`,
        `Number of bytes: ${bytes.length}`
      ]
    });

    steps.push({
      title: 'Grouping into Bytes',
      content: bytes.map((byte, i) => `Byte ${i + 1}: ${byte}`)
    });

    bytes.forEach((byte, byteIndex) => {
      const decimal = parseInt(byte, 2);
      let code = [
        decimal % 3 - 1,
        Math.floor(decimal / 3) % 3 - 1,
        Math.floor(decimal / 9) % 3 - 1,
        Math.floor(decimal / 27) % 3 - 1,
        Math.floor(decimal / 81) % 3 - 1,
        Math.floor(decimal / 243) % 3 - 1
      ];
      
      steps.push({
        title: `Converting Byte ${byteIndex + 1}`,
        content: [
          `Input byte: ${byte}`,
          `Decimal value: ${decimal}`,
          `Initial ternary code: [${code.join(', ')}]`
        ]
      });

      const sum = code.reduce((a, b) => a + b, 0);
      runningSum += sum;
      
      if (sum > 0) {
        const originalCode = [...code];
        for (let i = 0; i < code.length && sum > 0; i++) {
          if (code[i] === 1) {
            code[i] = -1;
            runningSum -= 2; // Adjust running sum for the change
          }
        }
        steps.push({
          title: `DC Balance for Byte ${byteIndex + 1}`,
          content: [
            `Initial sum: ${sum}`,
            `Original code: [${originalCode.join(', ')}]`,
            `Balanced code: [${code.join(', ')}]`
          ],
          balance: {
            sum: runningSum,
            isViolation: Math.abs(runningSum) > 3,
            correction: `Converted positive values to negative to reduce DC bias`
          }
        });
      }

      const currentSum = code.reduce((a, b) => a + b, 0);
      const previousSum = previousCode.reduce((a, b) => a + b, 0) || 0;
      
      if ((currentSum > 0 && previousSum > 0) || (currentSum < 0 && previousSum < 0)) {
        const originalCode = [...code];
        code = code.map(v => -v);
        runningSum = runningSum - currentSum * 2;
        steps.push({
          title: `DC Accumulation Check for Byte ${byteIndex + 1}`,
          content: [
            `Previous sum: ${previousSum}`,
            `Current sum: ${currentSum}`,
            `Original code: [${originalCode.join(', ')}]`,
            `Inverted code: [${code.join(', ')}]`
          ],
          balance: {
            sum: runningSum,
            isViolation: Math.abs(runningSum) > 3,
            correction: `Inverted all values to prevent DC accumulation`
          }
        });
      }
      
      previousCode = code;
      ternary.push(...code);
      
      steps.push({
        title: `Final Output for Byte ${byteIndex + 1}`,
        content: [`Final ternary code: [${code.join(', ')}]`],
        data: [...ternary],
        balance: {
          sum: runningSum,
          isViolation: Math.abs(runningSum) > 3
        }
      });
    });

    return { steps, result: ternary };
  };

  const validateInput = (input: string): boolean => {
    if (!/^[01]+$/.test(input)) {
      setError('Please enter only binary digits (0 or 1)');
      return false;
    }
    
    if (codingType === '2B1Q' && input.length % 2 !== 0) {
      setError('For 2B1Q, input length must be even');
      return false;
    }
    
    if (codingType === '8B6T' && input.length % 8 !== 0) {
      setError('For 8B6T, input length must be divisible by 8');
      return false;
    }
    
    setError('');
    return true;
  };

  useEffect(() => {
    if (!binaryInput || !validateInput(binaryInput)) {
      setResult([]);
      setVisualSteps([]);
      return;
    }

    const conversion = codingType === '2B1Q' ? convert2B1Q(binaryInput) : convert8B6T(binaryInput);
    setResult(conversion.result);
    setVisualSteps(conversion.steps);
  }, [binaryInput, codingType]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Coding Technique
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={codingType}
            onChange={(e) => setCodingType(e.target.value as '2B1Q' | '8B6T')}
          >
            <option value="2B1Q">2B1Q (2 Binary, 1 Quaternary)</option>
            <option value="8B6T">8B6T (8 Binary, 6 Ternary)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Binary Input
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={binaryInput}
            onChange={(e) => setBinaryInput(e.target.value)}
            placeholder={codingType === '2B1Q' ? 'Enter binary digits (even length)' : 'Enter binary digits (multiple of 8)'}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {visualSteps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-indigo-900">Step-by-Step Conversion</h2>
          <StepVisualization steps={visualSteps} />
        </div>
      )}

      {result.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3 text-indigo-900">Final Waveform</h2>
          <Waveform
            data={result}
            height={400}
            title={`${codingType} Output Signal`}
            showBalance={codingType === '8B6T'}
          />
        </div>
      )}
    </div>
  );
};

export default LineCodingSimulator;