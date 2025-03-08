return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg backdrop-blur-lg bg-opacity-50">
      <h2 className="text-xl font-semibold mb-6">Pattern Recognition</h2>
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getActionIcon(pattern.action)}
                <span className="font-medium">{pattern.type}</span>
              </div>
              <span className={`text-sm font-medium ${
                pattern.confidence > 70 ? 'text-green-500' :
                pattern.confidence > 50 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {pattern.confidence}% Confidence
              </span>
            </div>
            <p className="text-sm text-gray-400">{pattern.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatternRecognition;