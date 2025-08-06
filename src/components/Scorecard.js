const ScoreCard = ({ label, expected, detected }) => {
    if (detected === null || detected === undefined) {
      return (
        <div className="rounded-2xl shadow-md p-4 border mb-4 bg-yellow-100 text-yellow-900">
          <h2 className="text-lg font-semibold mb-2">{label}</h2>
          <p><strong>Expected:</strong> {expected}</p>
          <p><em>Evaluate your performance</em></p>
        </div>
      );
    }
  
    const absoluteError = Math.abs(detected - expected);
    const percentError = expected > 0 ? (absoluteError / expected) * 100 : 0;
    const score = Math.max(0, 100 - Math.min(percentError, 100)).toFixed(2);
  
    return (
      <div className="rounded-2xl shadow-md p-4 border mb-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">{label}</h2>
        <div className="space-y-1">
          <p><strong>Expected:</strong> {expected}</p>
          <p><strong>Detected:</strong> {detected}</p>
          <p><strong>Absolute Error:</strong> {absoluteError}</p>
          <p><strong>% Error:</strong> {percentError.toFixed(2)}%</p>
          <p><strong>Score:</strong> {score} / 100</p>
        </div>
      </div>
    );
  };