const LoadingDots = () => {
    return (
      <div className="flex justify-center items-center py-2">
        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-300"></div>
      </div>
    );
};
  
export default LoadingDots;
  